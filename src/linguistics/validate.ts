import type {
  LinguisticAnalysis,
  LinguisticAnnotation,
  LinguisticValidationFinding,
  LinguisticValidationReport,
} from './types.js'

function add(
  findings: LinguisticValidationFinding[],
  code: string,
  path: string,
  message: string,
  severity: 'error' | 'warning' = 'error',
): void {
  findings.push({ severity, code, path, message })
}

function validateAnnotation<T>(
  annotation: LinguisticAnnotation<T>,
  path: string,
  findings: LinguisticValidationFinding[],
): void {
  if (annotation.status === 'RESOLVED' && annotation.value === undefined) {
    add(findings, 'RESOLVED_ANNOTATION_MISSING_VALUE', path, 'Resolved annotation must contain a value.')
  }
  if (annotation.status !== 'RESOLVED' && annotation.value !== undefined) {
    add(findings, 'NON_RESOLVED_ANNOTATION_HAS_VALUE', path, 'Unresolved/unsupported annotation must not contain a value.')
  }
  if (annotation.confidence !== undefined && (annotation.confidence < 0 || annotation.confidence > 1)) {
    add(findings, 'CONFIDENCE_OUT_OF_RANGE', `${path}/confidence`, 'Confidence must be between 0 and 1.')
  }
}

export function validateLinguisticAnalysis(analysis: LinguisticAnalysis): LinguisticValidationReport {
  const findings: LinguisticValidationFinding[] = []

  if (analysis.contractVersion !== '0.1.0') {
    add(findings, 'LINGUISTIC_CONTRACT_VERSION_UNSUPPORTED', '/contractVersion', `Unsupported linguistic contract version ${analysis.contractVersion}.`)
  }
  if (!/^wsi:linguistic-analysis\/sha256-[a-f0-9]{64}$/u.test(analysis.analysisId)) {
    add(findings, 'LINGUISTIC_ANALYSIS_ID_INVALID', '/analysisId', 'Analysis ID must be a deterministic sha256 WSI linguistic-analysis ID.')
  }
  if (!/^[a-f0-9]{64}$/u.test(analysis.source.contentSha256)) {
    add(findings, 'SOURCE_CONTENT_HASH_INVALID', '/source/contentSha256', 'Source content hash must be lowercase SHA-256 hex.')
  }

  const tokenIds = new Set<string>()
  let previousEnd = 0
  for (const [index, token] of analysis.tokens.entries()) {
    const path = `/tokens/${index}`
    if (tokenIds.has(token.id)) add(findings, 'TOKEN_ID_DUPLICATE', `${path}/id`, `Duplicate token ID ${token.id}.`)
    tokenIds.add(token.id)

    if (token.span.unit !== 'UNICODE_CODE_POINT') {
      add(findings, 'TOKEN_SPAN_UNIT_INVALID', `${path}/span/unit`, 'Token spans must use Unicode code-point offsets.')
    }
    if (!Number.isInteger(token.span.start) || !Number.isInteger(token.span.end) || token.span.start < 0 || token.span.end <= token.span.start) {
      add(findings, 'TOKEN_SPAN_INVALID', `${path}/span`, 'Token span must be a non-empty non-negative integer range.')
    }
    if (token.span.start < previousEnd) {
      add(findings, 'TOKEN_SPAN_OVERLAP', `${path}/span`, 'Token spans must be monotonic and non-overlapping.')
    }
    previousEnd = Math.max(previousEnd, token.span.end)

    const surfaceLength = [...token.surface].length
    if (surfaceLength !== token.span.end - token.span.start) {
      add(findings, 'TOKEN_SURFACE_SPAN_MISMATCH', `${path}/surface`, 'Token surface code-point length must equal its declared span length.')
    }

    validateAnnotation(token.normalized, `${path}/normalized`, findings)
    validateAnnotation(token.lemma, `${path}/lemma`, findings)
    validateAnnotation(token.upos, `${path}/upos`, findings)
    validateAnnotation(token.xpos, `${path}/xpos`, findings)
    validateAnnotation(token.features, `${path}/features`, findings)
  }

  for (const [index, dependency] of analysis.dependencies.entries()) {
    const path = `/dependencies/${index}`
    if (!tokenIds.has(dependency.dependentTokenId)) {
      add(findings, 'DEPENDENCY_DEPENDENT_UNKNOWN', `${path}/dependentTokenId`, `Unknown dependent token ${dependency.dependentTokenId}.`)
    }
    if (dependency.headTokenId !== null && !tokenIds.has(dependency.headTokenId)) {
      add(findings, 'DEPENDENCY_HEAD_UNKNOWN', `${path}/headTokenId`, `Unknown dependency head token ${dependency.headTokenId}.`)
    }
    validateAnnotation(dependency.relation, `${path}/relation`, findings)
  }

  if (analysis.capabilities.TOKENIZATION === 'UNSUPPORTED' && analysis.tokens.length > 0) {
    add(findings, 'UNSUPPORTED_TOKENIZATION_HAS_TOKENS', '/tokens', 'Analyzer cannot emit tokens while tokenization capability is UNSUPPORTED.')
  }
  if (analysis.capabilities.SYNTAX === 'UNSUPPORTED' && analysis.dependencies.length > 0) {
    add(findings, 'UNSUPPORTED_SYNTAX_HAS_DEPENDENCIES', '/dependencies', 'Analyzer cannot emit dependencies while syntax capability is UNSUPPORTED.')
  }
  if (analysis.status === 'UNSUPPORTED' && (analysis.tokens.length > 0 || analysis.dependencies.length > 0)) {
    add(findings, 'UNSUPPORTED_ANALYSIS_HAS_STRUCTURE', '/', 'Unsupported analysis must not invent token or dependency structure.')
  }

  const errors = findings.filter((item) => item.severity === 'error').length
  const warnings = findings.filter((item) => item.severity === 'warning').length
  return { valid: errors === 0, errors, warnings, findings }
}
