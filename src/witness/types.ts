export type WitnessEngineMode = 'RESEARCH_PREVIEW' | 'PRODUCTION'
export type WitnessReviewStatus = 'CANDIDATE' | 'RESEARCHED' | 'REVIEWED' | 'LOCKED' | 'DISPUTED' | 'DEPRECATED'
export type WitnessPatternStatus = WitnessReviewStatus
export type WitnessLabelType = 'METAPHOR' | 'PATTERN_NAME' | 'ANALOGY' | 'OBSERVATION'

export interface WitnessSemanticFrame {
  id: string
  conceptIds: string[]
  reviewStatus: WitnessReviewStatus
}

export interface WitnessSemanticState {
  recordId: string
  reviewStatus: WitnessReviewStatus
  frames: WitnessSemanticFrame[]
}

export interface WitnessLocalizedLabel {
  language: string
  label: string
  type: WitnessLabelType
}

export interface WitnessAllowedResponse {
  id: string
  label: string
  targetConceptId?: string
}

export interface WitnessPattern {
  id: string
  status: WitnessPatternStatus
  definition: string
  triggerConcepts: string[]
  localizedLabels: WitnessLocalizedLabel[]
  allowedResponses: WitnessAllowedResponse[]
}

export interface WitnessPatternRegistrySnapshot {
  registryVersion: string
  patterns: WitnessPattern[]
}

export interface WitnessConceptRegistryEntry {
  id: string
  class: string
  status: WitnessReviewStatus
}

export interface WitnessConceptRegistrySnapshot {
  registryVersion: string
  concepts: WitnessConceptRegistryEntry[]
}

export interface WitnessEngineInput {
  mode: WitnessEngineMode
  semanticState: WitnessSemanticState
  patternRegistry: WitnessPatternRegistrySnapshot
  conceptRegistry: WitnessConceptRegistrySnapshot
  languages?: string[]
}

export interface WitnessResponseCandidate {
  status: 'RESOLVED' | 'UNRESOLVED'
  responseId: string | null
  label: string | null
}

export interface PositiveDirectionCandidate {
  status: 'RESOLVED' | 'UNRESOLVED'
  targetConceptId: string | null
  direction: 'POSITIVE' | null
  derivationType: 'DERIVED'
}

export interface WitnessCandidate {
  id: string
  observedFrameIds: string[]
  patternId: string
  matchedConceptIds: string[]
  triggerCoverage: number
  labels: WitnessLocalizedLabel[]
  response: WitnessResponseCandidate
  positiveDirection: PositiveDirectionCandidate
  reviewStatus: 'CANDIDATE'
}

export interface WitnessEngineFinding {
  severity: 'error' | 'warning' | 'info'
  code: string
  message: string
  frameId?: string
  patternId?: string
}

export interface WitnessDerivation {
  contractVersion: '0.1.0'
  derivationId: string
  mode: WitnessEngineMode
  sourceSemanticRecordId: string
  status: 'COMPLETE' | 'PARTIAL' | 'UNRESOLVED'
  witnesses: WitnessCandidate[]
  findings: WitnessEngineFinding[]
  provenance: {
    engineId: 'wsi:witness-engine/reference'
    engineVersion: '0.1.0'
    contractVersion: '0.1.0'
    rulesetVersion: 'witness-rules-1'
    patternRegistryVersion: string
    conceptRegistryVersion: string
  }
}

export interface WitnessValidationFinding {
  severity: 'error' | 'warning'
  code: string
  path: string
  message: string
}

export interface WitnessValidationReport {
  valid: boolean
  errors: number
  warnings: number
  findings: WitnessValidationFinding[]
}
