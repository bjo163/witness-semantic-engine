import type { LinguisticAnalysis } from '../linguistics/types.js'
import type {
  SemanticCandidate,
  SemanticCandidateValidationFinding,
  SemanticCandidateValidationReport,
  SemanticRegistrySnapshot,
} from './types.js'

function finding(
  severity: 'error' | 'warning',
  code: string,
  path: string,
  message: string,
): SemanticCandidateValidationFinding {
  return { severity, code, path, message }
}

function duplicates(values: string[]): string[] {
  const seen = new Set<string>()
  const repeated = new Set<string>()
  for (const value of values) {
    if (seen.has(value)) repeated.add(value)
    seen.add(value)
  }
  return [...repeated]
}

export function validateSemanticCandidate(
  candidate: SemanticCandidate,
  linguisticAnalysis: LinguisticAnalysis,
  registry: SemanticRegistrySnapshot,
): SemanticCandidateValidationReport {
  const findings: SemanticCandidateValidationFinding[] = []

  if (candidate.source.linguisticAnalysisId !== linguisticAnalysis.analysisId) {
    findings.push(finding('error', 'LINGUISTIC_ANALYSIS_MISMATCH', '/source/linguisticAnalysisId', 'Candidate is bound to a different linguistic analysis.'))
  }
  if (candidate.source.contentSha256 !== linguisticAnalysis.source.contentSha256) {
    findings.push(finding('error', 'CONTENT_HASH_MISMATCH', '/source/contentSha256', 'Candidate content hash differs from the linguistic analysis.'))
  }

  const tokenIds = new Set(linguisticAnalysis.tokens.map((token) => token.id))
  const participantIds = new Set(candidate.participants.map((item) => item.id))
  const conceptCandidateIds = new Set(candidate.conceptCandidates.map((item) => item.id))
  const conceptIds = new Set(registry.conceptIds)
  const relationIds = new Set(registry.relationIds)

  for (const duplicate of duplicates(candidate.participants.map((item) => item.id))) {
    findings.push(finding('error', 'DUPLICATE_PARTICIPANT_ID', '/participants', duplicate))
  }
  for (const duplicate of duplicates(candidate.conceptCandidates.map((item) => item.id))) {
    findings.push(finding('error', 'DUPLICATE_CONCEPT_CANDIDATE_ID', '/conceptCandidates', duplicate))
  }
  for (const duplicate of duplicates(candidate.frames.map((item) => item.id))) {
    findings.push(finding('error', 'DUPLICATE_FRAME_ID', '/frames', duplicate))
  }

  const validateTokens = (ids: string[], path: string): void => {
    for (const tokenId of ids) {
      if (!tokenIds.has(tokenId)) {
        findings.push(finding('error', 'UNKNOWN_TOKEN_REFERENCE', path, tokenId))
      }
    }
  }

  candidate.participants.forEach((item, index) => validateTokens(item.tokenIds, `/participants/${index}/tokenIds`))
  candidate.conceptCandidates.forEach((item, index) => {
    validateTokens(item.tokenIds, `/conceptCandidates/${index}/tokenIds`)
    if (item.semanticKeyEligible && item.sourceRole !== 'CONTENT') {
      findings.push(finding('error', 'NON_CONTENT_SEMANTIC_KEY_ELIGIBLE', `/conceptCandidates/${index}`, item.proposalKey))
    }
    if (item.semanticKeyEligible && (item.conceptId === null || !conceptIds.has(item.conceptId))) {
      findings.push(finding('error', 'SEMANTIC_KEY_REQUIRES_REGISTERED_CONCEPT', `/conceptCandidates/${index}/conceptId`, item.conceptId ?? 'null'))
    }
  })

  const conceptById = new Map(candidate.conceptCandidates.map((item) => [item.id, item]))
  candidate.semanticKeys.forEach((key, index) => {
    validateTokens(key.tokenIds, `/semanticKeys/${index}/tokenIds`)
    const concept = conceptById.get(key.conceptCandidateId)
    if (!concept) {
      findings.push(finding('error', 'SEMANTIC_KEY_UNKNOWN_CONCEPT_CANDIDATE', `/semanticKeys/${index}/conceptCandidateId`, key.conceptCandidateId))
      return
    }
    if (!concept.semanticKeyEligible || concept.sourceRole !== 'CONTENT') {
      findings.push(finding('error', 'SEMANTIC_KEY_FROM_INELIGIBLE_SOURCE_ROLE', `/semanticKeys/${index}`, key.id))
    }
    if (key.conceptId !== concept.conceptId) {
      findings.push(finding('error', 'SEMANTIC_KEY_CONCEPT_MISMATCH', `/semanticKeys/${index}/conceptId`, key.conceptId))
    }
  })

  candidate.frames.forEach((frame, index) => {
    validateTokens(frame.evidenceTokenIds, `/frames/${index}/evidenceTokenIds`)
    for (const binding of frame.roleBindings) {
      if (!participantIds.has(binding.participantCandidateId)) {
        findings.push(finding('error', 'FRAME_UNKNOWN_PARTICIPANT', `/frames/${index}/roleBindings`, binding.participantCandidateId))
      }
    }
    for (const conceptCandidateId of frame.conceptCandidateIds) {
      if (!conceptCandidateIds.has(conceptCandidateId)) {
        findings.push(finding('error', 'FRAME_UNKNOWN_CONCEPT_CANDIDATE', `/frames/${index}/conceptCandidateIds`, conceptCandidateId))
      }
    }
    if (frame.predicateRelationId !== null && frame.relationRegistered !== relationIds.has(frame.predicateRelationId)) {
      findings.push(finding('error', 'RELATION_REGISTRY_FLAG_MISMATCH', `/frames/${index}/relationRegistered`, frame.predicateRelationId))
    }
  })

  for (const item of [...candidate.participants, ...candidate.conceptCandidates, ...candidate.frames, ...candidate.semanticKeys]) {
    if (item.reviewStatus !== 'CANDIDATE') {
      findings.push(finding('error', 'COMPILER_MAY_ONLY_EMIT_CANDIDATE_REVIEW_STATUS', '/', item.id))
    }
  }

  const errors = findings.filter((item) => item.severity === 'error').length
  const warnings = findings.filter((item) => item.severity === 'warning').length
  return { valid: errors === 0, errors, warnings, findings }
}
