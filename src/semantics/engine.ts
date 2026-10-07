import { createHash } from 'node:crypto'
import type {
  ConceptCandidate,
  ConceptProposal,
  ExcludedSemanticKeyCandidate,
  FrameCandidate,
  FrameProposal,
  ParticipantCandidate,
  ParticipantProposal,
  SemanticCandidate,
  SemanticCandidateFinding,
  SemanticCandidateInput,
  SemanticKeyCandidate,
  SemanticKeyExclusionReason,
} from './types.js'

const COMPILER_ID = 'wsi:semantic-compiler/reference' as const
const COMPILER_VERSION = '0.1.0' as const
const CONTRACT_VERSION = '0.1.0' as const
const RULESET_VERSION = 'semantic-candidate-rules-1' as const

function sha256(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex')
}

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableValue)
  if (value && typeof value === 'object') {
    const input = value as Record<string, unknown>
    return Object.fromEntries(Object.keys(input).sort().map((key) => [key, stableValue(input[key])]))
  }
  return value
}

function stableStringify(value: unknown): string {
  return JSON.stringify(stableValue(value))
}

function assertConfidence(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new Error(`${label} confidence must be between 0 and 1`)
  }
}

function assertUniqueKeys(items: Array<{ key: string }>, label: string): void {
  const seen = new Set<string>()
  for (const item of items) {
    if (!item.key.trim()) throw new Error(`${label} proposal key must not be blank`)
    if (seen.has(item.key)) throw new Error(`Duplicate ${label} proposal key: ${item.key}`)
    seen.add(item.key)
  }
}

function sortedByKey<T extends { key: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.key.localeCompare(b.key))
}

function displayKey(conceptId: string): string {
  const slug = conceptId.slice(conceptId.indexOf('/') + 1)
  return slug.replace(/[.-]+/g, '_').toUpperCase()
}

function exclusionReason(proposal: ConceptProposal, registered: boolean): SemanticKeyExclusionReason | undefined {
  if (proposal.sourceRole === 'PARTICIPANT_REFERENCE') return 'PARTICIPANT_REFERENCE'
  if (proposal.sourceRole === 'FUNCTION_WORD') return 'FUNCTION_WORD'
  if (proposal.sourceRole === 'STRUCTURAL') return 'STRUCTURAL_MARKER'
  if (proposal.sourceRole === 'UNKNOWN') return 'UNKNOWN_SOURCE_ROLE'
  if (proposal.conceptId === null) return 'UNRESOLVED_CONCEPT'
  if (!registered) return 'UNREGISTERED_CONCEPT'
  return undefined
}

function validateProposalStructure(input: SemanticCandidateInput): void {
  if (input.linguisticAnalysis.status === 'UNSUPPORTED') {
    throw new Error('Cannot compile semantic candidates from an UNSUPPORTED linguistic analysis')
  }

  assertUniqueKeys(input.proposals.participants, 'participant')
  assertUniqueKeys(input.proposals.concepts, 'concept')
  assertUniqueKeys(input.proposals.frames, 'frame')

  const tokenIds = new Set(input.linguisticAnalysis.tokens.map((token) => token.id))
  const participantKeys = new Set(input.proposals.participants.map((item) => item.key))
  const conceptKeys = new Set(input.proposals.concepts.map((item) => item.key))

  const assertTokenRefs = (refs: string[], label: string): void => {
    if (refs.length === 0) throw new Error(`${label} must reference at least one linguistic token`)
    for (const tokenId of refs) {
      if (!tokenIds.has(tokenId)) throw new Error(`${label} references unknown linguistic token: ${tokenId}`)
    }
  }

  for (const participant of input.proposals.participants) {
    assertTokenRefs(participant.tokenIds, `Participant ${participant.key}`)
    assertConfidence(participant.confidence, `Participant ${participant.key}`)
    if (participant.resolutionStatus === 'RESOLVED' && !participant.resolvedIdentity?.trim()) {
      throw new Error(`Participant ${participant.key} is RESOLVED but resolvedIdentity is missing`)
    }
  }

  for (const concept of input.proposals.concepts) {
    assertTokenRefs(concept.tokenIds, `Concept ${concept.key}`)
    assertConfidence(concept.confidence, `Concept ${concept.key}`)
    if (!concept.senseGloss.trim()) throw new Error(`Concept ${concept.key} senseGloss must not be blank`)
  }

  for (const frame of input.proposals.frames) {
    assertTokenRefs(frame.evidenceTokenIds, `Frame ${frame.key}`)
    assertConfidence(frame.confidence, `Frame ${frame.key}`)
    for (const binding of frame.roleBindings) {
      if (!participantKeys.has(binding.participantKey)) {
        throw new Error(`Frame ${frame.key} references unknown participant proposal: ${binding.participantKey}`)
      }
    }
    for (const conceptKey of frame.conceptKeys) {
      if (!conceptKeys.has(conceptKey)) {
        throw new Error(`Frame ${frame.key} references unknown concept proposal: ${conceptKey}`)
      }
    }
  }
}

function candidateIdentity(input: SemanticCandidateInput): string {
  const participants = sortedByKey(input.proposals.participants)
  const concepts = sortedByKey(input.proposals.concepts)
  const frames = sortedByKey(input.proposals.frames).map((frame) => ({
    ...frame,
    roleBindings: [...frame.roleBindings].sort((a, b) =>
      `${a.role}:${a.participantKey}`.localeCompare(`${b.role}:${b.participantKey}`),
    ),
    conceptKeys: [...frame.conceptKeys].sort(),
    evidenceTokenIds: [...frame.evidenceTokenIds].sort(),
  }))

  return stableStringify({
    contractVersion: CONTRACT_VERSION,
    compilerId: COMPILER_ID,
    compilerVersion: COMPILER_VERSION,
    rulesetVersion: RULESET_VERSION,
    linguisticAnalysisId: input.linguisticAnalysis.analysisId,
    registryVersion: input.registry.registryVersion,
    conceptIds: [...input.registry.conceptIds].sort(),
    relationIds: [...input.registry.relationIds].sort(),
    proposer: input.proposals.proposer,
    participants,
    concepts,
    frames,
  })
}

export function compileSemanticCandidate(input: SemanticCandidateInput): SemanticCandidate {
  validateProposalStructure(input)

  const participantProposals = sortedByKey(input.proposals.participants)
  const conceptProposals = sortedByKey(input.proposals.concepts)
  const frameProposals = sortedByKey(input.proposals.frames)
  const registeredConceptIds = new Set(input.registry.conceptIds)
  const registeredRelationIds = new Set(input.registry.relationIds)
  const findings: SemanticCandidateFinding[] = []

  const participants: ParticipantCandidate[] = participantProposals.map((proposal: ParticipantProposal, index) => ({
    id: `SP${index + 1}`,
    proposalKey: proposal.key,
    tokenIds: [...proposal.tokenIds],
    entityType: proposal.entityType,
    discourseRoles: [...proposal.discourseRoles],
    resolutionStatus: proposal.resolutionStatus,
    ...(proposal.resolvedIdentity ? { resolvedIdentity: proposal.resolvedIdentity } : {}),
    confidence: proposal.confidence,
    reviewStatus: 'CANDIDATE',
  }))
  const participantIdByKey = new Map(participants.map((item) => [item.proposalKey, item.id]))

  const conceptCandidates: ConceptCandidate[] = conceptProposals.map((proposal: ConceptProposal, index) => {
    const registered = proposal.conceptId !== null && registeredConceptIds.has(proposal.conceptId)
    const reason = exclusionReason(proposal, registered)
    if (reason) {
      findings.push({
        severity: reason === 'UNREGISTERED_CONCEPT' ? 'warning' : 'info',
        code: `SEMANTIC_KEY_EXCLUDED_${reason}`,
        message: `Concept proposal ${proposal.key} is not eligible for a semantic key: ${reason}.`,
        proposalKey: proposal.key,
      })
    }
    return {
      id: `SC${index + 1}`,
      proposalKey: proposal.key,
      tokenIds: [...proposal.tokenIds],
      sourceRole: proposal.sourceRole,
      conceptId: proposal.conceptId,
      senseGloss: proposal.senseGloss,
      confidence: proposal.confidence,
      registered,
      semanticKeyEligible: reason === undefined,
      ...(reason ? { exclusionReason: reason } : {}),
      reviewStatus: 'CANDIDATE',
    }
  })
  const conceptByKey = new Map(conceptCandidates.map((item) => [item.proposalKey, item]))

  const semanticKeys: SemanticKeyCandidate[] = conceptCandidates
    .filter((item): item is ConceptCandidate & { conceptId: string } => item.semanticKeyEligible && item.conceptId !== null)
    .map((item, index) => ({
      id: `SK${index + 1}`,
      conceptCandidateId: item.id,
      conceptId: item.conceptId,
      displayKey: displayKey(item.conceptId),
      tokenIds: [...item.tokenIds],
      reviewStatus: 'CANDIDATE',
    }))

  const excludedSemanticKeys: ExcludedSemanticKeyCandidate[] = conceptCandidates
    .filter((item): item is ConceptCandidate & { exclusionReason: SemanticKeyExclusionReason } =>
      !item.semanticKeyEligible && item.exclusionReason !== undefined,
    )
    .map((item) => ({
      conceptCandidateId: item.id,
      proposalKey: item.proposalKey,
      tokenIds: [...item.tokenIds],
      reason: item.exclusionReason,
    }))

  const frames: FrameCandidate[] = frameProposals.map((proposal: FrameProposal, index) => {
    const relationRegistered =
      proposal.predicateRelationId === null || registeredRelationIds.has(proposal.predicateRelationId)
    if (!relationRegistered) {
      findings.push({
        severity: 'warning',
        code: 'UNREGISTERED_RELATION',
        message: `Frame proposal ${proposal.key} references unregistered relation ${proposal.predicateRelationId}.`,
        proposalKey: proposal.key,
      })
    }

    return {
      id: `SF${index + 1}`,
      proposalKey: proposal.key,
      frameType: proposal.frameType,
      predicateRelationId: proposal.predicateRelationId,
      relationRegistered,
      roleBindings: proposal.roleBindings.map((binding) => ({
        role: binding.role,
        participantCandidateId: participantIdByKey.get(binding.participantKey)!,
      })),
      conceptCandidateIds: proposal.conceptKeys.map((key) => conceptByKey.get(key)!.id),
      polarity: proposal.polarity,
      modality: proposal.modality,
      speechAct: proposal.speechAct,
      evidenceTokenIds: [...proposal.evidenceTokenIds],
      confidence: proposal.confidence,
      reviewStatus: 'CANDIDATE',
    }
  })

  let status: SemanticCandidate['status'] = 'COMPLETE'
  if (frames.length === 0 && semanticKeys.length === 0) {
    status = 'UNRESOLVED'
  } else if (
    input.linguisticAnalysis.status !== 'COMPLETE'
    || findings.some((item) => item.severity === 'warning')
    || conceptCandidates.some((item) => !item.semanticKeyEligible)
  ) {
    status = 'PARTIAL'
  }

  const source = input.linguisticAnalysis.source
  return {
    contractVersion: CONTRACT_VERSION,
    candidateId: `wsi:semantic-candidate/sha256-${sha256(candidateIdentity(input))}`,
    status,
    source: {
      provider: source.provider,
      providerRevision: source.providerRevision,
      resourceId: source.resourceId,
      contentSha256: source.contentSha256,
      linguisticAnalysisId: input.linguisticAnalysis.analysisId,
      ...(source.language ? { language: source.language } : {}),
      ...(source.script ? { script: source.script } : {}),
    },
    participants,
    conceptCandidates,
    semanticKeys,
    excludedSemanticKeys,
    frames,
    findings,
    provenance: {
      compilerId: COMPILER_ID,
      compilerVersion: COMPILER_VERSION,
      contractVersion: CONTRACT_VERSION,
      rulesetVersion: RULESET_VERSION,
      registryVersion: input.registry.registryVersion,
      proposer: structuredClone(input.proposals.proposer),
    },
  }
}
