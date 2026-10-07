import type { LinguisticAnalysis } from '../linguistics/types.js'

export type SemanticCandidateStatus = 'COMPLETE' | 'PARTIAL' | 'UNRESOLVED'
export type SemanticSourceRole = 'CONTENT' | 'PARTICIPANT_REFERENCE' | 'FUNCTION_WORD' | 'STRUCTURAL' | 'UNKNOWN'
export type SemanticProposalMethod = 'RULE' | 'MANUAL' | 'MODEL' | 'IMPORT'
export type SemanticFrameType = 'ACTION' | 'STATE' | 'RELATION' | 'EVENT' | 'ATTRIBUTE'
export type SemanticEntityType =
  | 'PERSON'
  | 'GROUP'
  | 'DIVINE_ENTITY'
  | 'PLACE'
  | 'OBJECT'
  | 'ABSTRACT_ENTITY'
  | 'EVENT'
  | 'OTHER'
  | 'UNDETERMINED'
export type SemanticDiscourseRole = 'SPEAKER' | 'ADDRESSEE' | 'REFERENT' | 'NARRATOR' | 'OTHER'
export type SemanticRole =
  | 'AGENT'
  | 'PATIENT'
  | 'THEME'
  | 'HOLDER'
  | 'TARGET'
  | 'RECIPIENT'
  | 'EXPERIENCER'
  | 'STATE_BEARER'
  | 'SOURCE'
  | 'GOAL'
  | 'LOCATION'
  | 'INSTRUMENT'
  | 'BENEFICIARY'
  | 'OTHER'
export type SemanticPolarity = 'AFFIRMED' | 'NEGATED' | 'UNDETERMINED'
export type SemanticModality =
  | 'ASSERTED'
  | 'POSSIBLE'
  | 'PROBABLE'
  | 'NECESSARY'
  | 'HYPOTHETICAL'
  | 'COUNTERFACTUAL'
  | 'UNDETERMINED'
export type SemanticSpeechAct =
  | 'STATEMENT'
  | 'COMMAND'
  | 'PROHIBITION'
  | 'QUESTION'
  | 'OATH'
  | 'REQUEST'
  | 'PROMISE'
  | 'WARNING'
  | 'SUPPLICATION'
  | 'OTHER'
  | 'UNDETERMINED'

export interface SemanticRegistrySnapshot {
  registryVersion: string
  conceptIds: string[]
  relationIds: string[]
}

export interface SemanticProposerDescriptor {
  id: string
  version: string
  method: SemanticProposalMethod
  rulesetVersion?: string
  model?: {
    id: string
    version?: string
  }
}

export interface ParticipantProposal {
  key: string
  tokenIds: string[]
  entityType: SemanticEntityType
  discourseRoles: SemanticDiscourseRole[]
  resolutionStatus: 'RESOLVED' | 'UNRESOLVED'
  resolvedIdentity?: string
  confidence: number
}

export interface ConceptProposal {
  key: string
  tokenIds: string[]
  sourceRole: SemanticSourceRole
  conceptId: string | null
  senseGloss: string
  confidence: number
}

export interface FrameRoleProposal {
  role: SemanticRole
  participantKey: string
}

export interface FrameProposal {
  key: string
  frameType: SemanticFrameType
  predicateRelationId: string | null
  roleBindings: FrameRoleProposal[]
  conceptKeys: string[]
  polarity: SemanticPolarity
  modality: SemanticModality
  speechAct: SemanticSpeechAct
  evidenceTokenIds: string[]
  confidence: number
}

export interface SemanticProposalBundle {
  proposer: SemanticProposerDescriptor
  participants: ParticipantProposal[]
  concepts: ConceptProposal[]
  frames: FrameProposal[]
}

export interface SemanticCandidateInput {
  linguisticAnalysis: LinguisticAnalysis
  registry: SemanticRegistrySnapshot
  proposals: SemanticProposalBundle
}

export interface SemanticCandidateSource {
  provider: string
  providerRevision: string
  resourceId: string
  contentSha256: string
  linguisticAnalysisId: string
  language?: string
  script?: string
}

export interface ParticipantCandidate {
  id: string
  proposalKey: string
  tokenIds: string[]
  entityType: SemanticEntityType
  discourseRoles: SemanticDiscourseRole[]
  resolutionStatus: 'RESOLVED' | 'UNRESOLVED'
  resolvedIdentity?: string
  confidence: number
  reviewStatus: 'CANDIDATE'
}

export type SemanticKeyExclusionReason =
  | 'PARTICIPANT_REFERENCE'
  | 'FUNCTION_WORD'
  | 'STRUCTURAL_MARKER'
  | 'UNKNOWN_SOURCE_ROLE'
  | 'UNRESOLVED_CONCEPT'
  | 'UNREGISTERED_CONCEPT'

export interface ConceptCandidate {
  id: string
  proposalKey: string
  tokenIds: string[]
  sourceRole: SemanticSourceRole
  conceptId: string | null
  senseGloss: string
  confidence: number
  registered: boolean
  semanticKeyEligible: boolean
  exclusionReason?: SemanticKeyExclusionReason
  reviewStatus: 'CANDIDATE'
}

export interface SemanticKeyCandidate {
  id: string
  conceptCandidateId: string
  conceptId: string
  displayKey: string
  tokenIds: string[]
  reviewStatus: 'CANDIDATE'
}

export interface ExcludedSemanticKeyCandidate {
  conceptCandidateId: string
  proposalKey: string
  tokenIds: string[]
  reason: SemanticKeyExclusionReason
}

export interface FrameRoleCandidate {
  role: SemanticRole
  participantCandidateId: string
}

export interface FrameCandidate {
  id: string
  proposalKey: string
  frameType: SemanticFrameType
  predicateRelationId: string | null
  relationRegistered: boolean
  roleBindings: FrameRoleCandidate[]
  conceptCandidateIds: string[]
  polarity: SemanticPolarity
  modality: SemanticModality
  speechAct: SemanticSpeechAct
  evidenceTokenIds: string[]
  confidence: number
  reviewStatus: 'CANDIDATE'
}

export interface SemanticCandidateFinding {
  severity: 'error' | 'warning' | 'info'
  code: string
  message: string
  proposalKey?: string
}

export interface SemanticCandidateProvenance {
  compilerId: 'wsi:semantic-compiler/reference'
  compilerVersion: '0.1.0'
  contractVersion: '0.1.0'
  rulesetVersion: 'semantic-candidate-rules-1'
  registryVersion: string
  proposer: SemanticProposerDescriptor
}

export interface SemanticCandidate {
  contractVersion: '0.1.0'
  candidateId: string
  status: SemanticCandidateStatus
  source: SemanticCandidateSource
  participants: ParticipantCandidate[]
  conceptCandidates: ConceptCandidate[]
  semanticKeys: SemanticKeyCandidate[]
  excludedSemanticKeys: ExcludedSemanticKeyCandidate[]
  frames: FrameCandidate[]
  findings: SemanticCandidateFinding[]
  provenance: SemanticCandidateProvenance
}

export interface SemanticCandidateValidationFinding {
  severity: 'error' | 'warning'
  code: string
  path: string
  message: string
}

export interface SemanticCandidateValidationReport {
  valid: boolean
  errors: number
  warnings: number
  findings: SemanticCandidateValidationFinding[]
}
