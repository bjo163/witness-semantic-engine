export type LinguisticAnnotationStatus = 'RESOLVED' | 'UNRESOLVED' | 'UNSUPPORTED'
export type LinguisticCapabilityStatus = 'SUPPORTED' | 'PARTIAL' | 'UNSUPPORTED'
export type LinguisticAnalysisStatus = 'COMPLETE' | 'PARTIAL' | 'UNSUPPORTED'
export type LinguisticTokenKind = 'WORD' | 'NUMBER' | 'PUNCT' | 'SYMBOL' | 'OTHER'
export type LinguisticFindingSeverity = 'error' | 'warning' | 'info'

export type LinguisticCapabilityName =
  | 'TOKENIZATION'
  | 'NORMALIZATION'
  | 'SENTENCE_SEGMENTATION'
  | 'LEMMA'
  | 'POS'
  | 'MORPHOLOGY'
  | 'SYNTAX'
  | 'DISCOURSE_CUES'

export interface LinguisticAnnotation<T> {
  status: LinguisticAnnotationStatus
  value?: T
  scheme?: string
  confidence?: number
}

export interface LinguisticSpan {
  start: number
  end: number
  unit: 'UNICODE_CODE_POINT'
}

export interface LinguisticToken {
  id: string
  span: LinguisticSpan
  kind: LinguisticTokenKind
  surface: string
  normalized: LinguisticAnnotation<string>
  lemma: LinguisticAnnotation<string>
  upos: LinguisticAnnotation<string>
  xpos: LinguisticAnnotation<string>
  features: LinguisticAnnotation<Record<string, string[]>>
}

export interface LinguisticDependency {
  dependentTokenId: string
  headTokenId: string | null
  relation: LinguisticAnnotation<string>
}

export interface LinguisticFinding {
  severity: LinguisticFindingSeverity
  code: string
  message: string
  tokenId?: string
}

export interface LinguisticCapabilities {
  TOKENIZATION: LinguisticCapabilityStatus
  NORMALIZATION: LinguisticCapabilityStatus
  SENTENCE_SEGMENTATION: LinguisticCapabilityStatus
  LEMMA: LinguisticCapabilityStatus
  POS: LinguisticCapabilityStatus
  MORPHOLOGY: LinguisticCapabilityStatus
  SYNTAX: LinguisticCapabilityStatus
  DISCOURSE_CUES: LinguisticCapabilityStatus
}

export interface LinguisticAnalyzerDescriptor {
  id: string
  version: string
  contractVersion: '0.1.0'
  description: string
  languages: string[]
  scripts: string[]
  capabilities: LinguisticCapabilities
  rulesetVersion: string
}

export interface LinguisticAnalyzerInput {
  provider: string
  providerRevision: string
  resourceId: string
  text: string
  language?: string
  script?: string
}

export interface LinguisticAnalyzerSupport {
  status: 'SUPPORTED' | 'UNSUPPORTED'
  reason?: string
}

export interface LinguisticAnalysisSource {
  provider: string
  providerRevision: string
  resourceId: string
  contentSha256: string
  language?: string
  script?: string
}

export interface LinguisticAnalyzerProvenance {
  analyzerId: string
  analyzerVersion: string
  contractVersion: '0.1.0'
  rulesetVersion: string
  model?: {
    id: string
    version?: string
  }
}

export interface LinguisticAnalysis {
  contractVersion: '0.1.0'
  analysisId: string
  status: LinguisticAnalysisStatus
  source: LinguisticAnalysisSource
  analyzer: LinguisticAnalyzerProvenance
  capabilities: LinguisticCapabilities
  tokens: LinguisticToken[]
  dependencies: LinguisticDependency[]
  findings: LinguisticFinding[]
}

export interface LinguisticAnalyzer {
  readonly descriptor: LinguisticAnalyzerDescriptor
  supports(input: LinguisticAnalyzerInput): LinguisticAnalyzerSupport
  analyze(input: LinguisticAnalyzerInput): Promise<LinguisticAnalysis>
}

export interface LinguisticValidationFinding {
  severity: 'error' | 'warning'
  code: string
  path: string
  message: string
}

export interface LinguisticValidationReport {
  valid: boolean
  errors: number
  warnings: number
  findings: LinguisticValidationFinding[]
}
