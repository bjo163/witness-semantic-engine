import { createHash } from 'node:crypto'
import type {
  PositiveDirectionCandidate,
  WitnessCandidate,
  WitnessEngineFinding,
  WitnessEngineInput,
  WitnessPattern,
  WitnessResponseCandidate,
  WitnessReviewStatus,
  WitnessDerivation,
} from './types.js'

const CONTRACT_VERSION = '0.1.0' as const
const ENGINE_ID = 'wsi:witness-engine/reference' as const
const ENGINE_VERSION = '0.1.0' as const
const RULESET_VERSION = 'witness-rules-1' as const

function sha256(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex')
}

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableValue)
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    return Object.fromEntries(Object.keys(record).sort().map((key) => [key, stableValue(record[key])]))
  }
  return value
}

function stableStringify(value: unknown): string {
  return JSON.stringify(stableValue(value))
}

function reviewEligible(status: WitnessReviewStatus, mode: WitnessEngineInput['mode']): boolean {
  if (mode === 'PRODUCTION') return status === 'REVIEWED' || status === 'LOCKED'
  return status === 'RESEARCHED' || status === 'REVIEWED' || status === 'LOCKED'
}

function patternEligible(status: WitnessReviewStatus, mode: WitnessEngineInput['mode']): boolean {
  if (mode === 'PRODUCTION') return status === 'REVIEWED' || status === 'LOCKED'
  return status === 'CANDIDATE' || status === 'RESEARCHED' || status === 'REVIEWED' || status === 'LOCKED'
}

function resolveResponse(
  pattern: WitnessPattern,
  conceptClassById: Map<string, string>,
  findings: WitnessEngineFinding[],
  frameId: string,
): { response: WitnessResponseCandidate; positiveDirection: PositiveDirectionCandidate } {
  const unresolved = {
    response: { status: 'UNRESOLVED', responseId: null, label: null } as WitnessResponseCandidate,
    positiveDirection: {
      status: 'UNRESOLVED',
      targetConceptId: null,
      direction: null,
      derivationType: 'DERIVED',
    } as PositiveDirectionCandidate,
  }

  if (pattern.allowedResponses.length !== 1) {
    findings.push({
      severity: pattern.allowedResponses.length === 0 ? 'info' : 'warning',
      code: pattern.allowedResponses.length === 0 ? 'WITNESS_RESPONSE_UNRESOLVED' : 'WITNESS_RESPONSE_AMBIGUOUS',
      message: pattern.allowedResponses.length === 0
        ? `Pattern ${pattern.id} has no registered response.`
        : `Pattern ${pattern.id} has multiple allowed responses; no response is selected automatically.`,
      frameId,
      patternId: pattern.id,
    })
    return unresolved
  }

  const selected = pattern.allowedResponses[0]
  const targetConceptId = selected.targetConceptId ?? null
  if (!targetConceptId) {
    findings.push({
      severity: 'info',
      code: 'POSITIVE_DIRECTION_UNRESOLVED',
      message: `Response ${selected.id} does not define a positive target concept.`,
      frameId,
      patternId: pattern.id,
    })
    return {
      response: { status: 'RESOLVED', responseId: selected.id, label: selected.label },
      positiveDirection: unresolved.positiveDirection,
    }
  }

  const conceptClass = conceptClassById.get(targetConceptId)
  if (!conceptClass) {
    findings.push({
      severity: 'warning',
      code: 'POSITIVE_TARGET_NOT_REGISTERED',
      message: `Positive target ${targetConceptId} is not registered.`,
      frameId,
      patternId: pattern.id,
    })
    return {
      response: { status: 'RESOLVED', responseId: selected.id, label: selected.label },
      positiveDirection: unresolved.positiveDirection,
    }
  }

  if (conceptClass !== 'DERIVED_TARGET') {
    findings.push({
      severity: 'warning',
      code: 'POSITIVE_TARGET_NOT_DERIVED_TARGET',
      message: `Positive target ${targetConceptId} has class ${conceptClass}; expected DERIVED_TARGET.`,
      frameId,
      patternId: pattern.id,
    })
    return {
      response: { status: 'RESOLVED', responseId: selected.id, label: selected.label },
      positiveDirection: unresolved.positiveDirection,
    }
  }

  return {
    response: { status: 'RESOLVED', responseId: selected.id, label: selected.label },
    positiveDirection: {
      status: 'RESOLVED',
      targetConceptId,
      direction: 'POSITIVE',
      derivationType: 'DERIVED',
    },
  }
}

function derivationIdentity(input: WitnessEngineInput): string {
  return stableStringify({
    contractVersion: CONTRACT_VERSION,
    engineId: ENGINE_ID,
    engineVersion: ENGINE_VERSION,
    rulesetVersion: RULESET_VERSION,
    mode: input.mode,
    semanticState: {
      ...input.semanticState,
      frames: [...input.semanticState.frames]
        .map((frame) => ({ ...frame, conceptIds: [...frame.conceptIds].sort() }))
        .sort((a, b) => a.id.localeCompare(b.id)),
    },
    patternRegistry: {
      registryVersion: input.patternRegistry.registryVersion,
      patterns: [...input.patternRegistry.patterns]
        .map((pattern) => ({
          ...pattern,
          triggerConcepts: [...pattern.triggerConcepts].sort(),
          localizedLabels: [...pattern.localizedLabels].sort((a, b) =>
            `${a.language}:${a.label}:${a.type}`.localeCompare(`${b.language}:${b.label}:${b.type}`),
          ),
          allowedResponses: [...pattern.allowedResponses].sort((a, b) => a.id.localeCompare(b.id)),
        }))
        .sort((a, b) => a.id.localeCompare(b.id)),
    },
    conceptRegistry: {
      registryVersion: input.conceptRegistry.registryVersion,
      concepts: [...input.conceptRegistry.concepts].sort((a, b) => a.id.localeCompare(b.id)),
    },
    languages: [...(input.languages ?? [])].sort(),
  })
}

export function deriveWitnesses(input: WitnessEngineInput): WitnessDerivation {
  const findings: WitnessEngineFinding[] = []
  const witnesses: WitnessCandidate[] = []
  const conceptClassById = new Map(input.conceptRegistry.concepts.map((concept) => [concept.id, concept.class]))
  const requestedLanguages = input.languages ? new Set(input.languages) : null

  if (!reviewEligible(input.semanticState.reviewStatus, input.mode)) {
    findings.push({
      severity: input.mode === 'PRODUCTION' ? 'warning' : 'info',
      code: 'SEMANTIC_STATE_NOT_ELIGIBLE',
      message: `Semantic record ${input.semanticState.recordId} with review status ${input.semanticState.reviewStatus} is not eligible in ${input.mode} mode.`,
    })
  } else {
    const patterns = [...input.patternRegistry.patterns].sort((a, b) => a.id.localeCompare(b.id))
    const frames = [...input.semanticState.frames].sort((a, b) => a.id.localeCompare(b.id))

    for (const pattern of patterns) {
      if (!patternEligible(pattern.status, input.mode)) {
        findings.push({
          severity: 'info',
          code: 'WITNESS_PATTERN_NOT_ELIGIBLE',
          message: `Witness Pattern ${pattern.id} with status ${pattern.status} is not eligible in ${input.mode} mode.`,
          patternId: pattern.id,
        })
        continue
      }
      if (pattern.triggerConcepts.length === 0) {
        findings.push({
          severity: 'warning',
          code: 'WITNESS_PATTERN_HAS_NO_TRIGGER',
          message: `Witness Pattern ${pattern.id} has no trigger concepts and is ignored.`,
          patternId: pattern.id,
        })
        continue
      }

      for (const frame of frames) {
        if (!reviewEligible(frame.reviewStatus, input.mode)) continue
        const frameConcepts = new Set(frame.conceptIds)
        const matchedConceptIds = pattern.triggerConcepts.filter((conceptId) => frameConcepts.has(conceptId))
        if (matchedConceptIds.length !== pattern.triggerConcepts.length) continue

        const labels = pattern.localizedLabels.filter((label) =>
          requestedLanguages ? requestedLanguages.has(label.language) : true,
        )
        const resolved = resolveResponse(pattern, conceptClassById, findings, frame.id)

        witnesses.push({
          id: `WC${witnesses.length + 1}`,
          observedFrameIds: [frame.id],
          patternId: pattern.id,
          matchedConceptIds,
          triggerCoverage: matchedConceptIds.length / pattern.triggerConcepts.length,
          labels,
          response: resolved.response,
          positiveDirection: resolved.positiveDirection,
          reviewStatus: 'CANDIDATE',
        })
      }
    }
  }

  let status: WitnessDerivation['status'] = 'UNRESOLVED'
  if (witnesses.length > 0) {
    status = witnesses.every((witness) =>
      witness.response.status === 'RESOLVED' && witness.positiveDirection.status === 'RESOLVED',
    ) ? 'COMPLETE' : 'PARTIAL'
  }

  return {
    contractVersion: CONTRACT_VERSION,
    derivationId: `wsi:witness-derivation/sha256-${sha256(derivationIdentity(input))}`,
    mode: input.mode,
    sourceSemanticRecordId: input.semanticState.recordId,
    status,
    witnesses,
    findings,
    provenance: {
      engineId: ENGINE_ID,
      engineVersion: ENGINE_VERSION,
      contractVersion: CONTRACT_VERSION,
      rulesetVersion: RULESET_VERSION,
      patternRegistryVersion: input.patternRegistry.registryVersion,
      conceptRegistryVersion: input.conceptRegistry.registryVersion,
    },
  }
}
