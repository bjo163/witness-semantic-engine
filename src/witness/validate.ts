import type {
  WitnessDerivation,
  WitnessEngineInput,
  WitnessValidationFinding,
  WitnessValidationReport,
  WitnessReviewStatus,
} from './types.js'

function finding(
  severity: 'error' | 'warning',
  code: string,
  path: string,
  message: string,
): WitnessValidationFinding {
  return { severity, code, path, message }
}

function eligible(status: WitnessReviewStatus, mode: WitnessEngineInput['mode']): boolean {
  if (mode === 'PRODUCTION') return status === 'REVIEWED' || status === 'LOCKED'
  return status === 'RESEARCHED' || status === 'REVIEWED' || status === 'LOCKED'
}

export function validateWitnessDerivation(
  derivation: WitnessDerivation,
  input: WitnessEngineInput,
): WitnessValidationReport {
  const findings: WitnessValidationFinding[] = []
  const frames = new Map(input.semanticState.frames.map((frame) => [frame.id, frame]))
  const patterns = new Map(input.patternRegistry.patterns.map((pattern) => [pattern.id, pattern]))
  const concepts = new Map(input.conceptRegistry.concepts.map((concept) => [concept.id, concept]))

  if (derivation.sourceSemanticRecordId !== input.semanticState.recordId) {
    findings.push(finding('error', 'SOURCE_SEMANTIC_RECORD_MISMATCH', '/sourceSemanticRecordId', derivation.sourceSemanticRecordId))
  }
  if (derivation.mode !== input.mode) {
    findings.push(finding('error', 'WITNESS_MODE_MISMATCH', '/mode', derivation.mode))
  }

  for (const [index, witness] of derivation.witnesses.entries()) {
    if (witness.reviewStatus !== 'CANDIDATE') {
      findings.push(finding('error', 'ENGINE_MAY_ONLY_EMIT_CANDIDATE', `/witnesses/${index}/reviewStatus`, witness.reviewStatus))
    }

    const pattern = patterns.get(witness.patternId)
    if (!pattern) {
      findings.push(finding('error', 'UNKNOWN_WITNESS_PATTERN', `/witnesses/${index}/patternId`, witness.patternId))
      continue
    }

    for (const frameId of witness.observedFrameIds) {
      const frame = frames.get(frameId)
      if (!frame) {
        findings.push(finding('error', 'UNKNOWN_OBSERVED_FRAME', `/witnesses/${index}/observedFrameIds`, frameId))
        continue
      }
      if (!eligible(frame.reviewStatus, input.mode)) {
        findings.push(finding('error', 'INELIGIBLE_OBSERVED_FRAME', `/witnesses/${index}/observedFrameIds`, `${frameId}:${frame.reviewStatus}`))
      }
      const frameConcepts = new Set(frame.conceptIds)
      for (const trigger of pattern.triggerConcepts) {
        if (!frameConcepts.has(trigger)) {
          findings.push(finding('error', 'WITNESS_TRIGGER_NOT_PRESENT', `/witnesses/${index}/matchedConceptIds`, trigger))
        }
      }
    }

    if (witness.response.status === 'UNRESOLVED' && witness.positiveDirection.status === 'RESOLVED') {
      findings.push(finding('error', 'POSITIVE_DIRECTION_REQUIRES_RESPONSE', `/witnesses/${index}/positiveDirection`, witness.id))
    }

    if (witness.positiveDirection.status === 'RESOLVED') {
      const target = witness.positiveDirection.targetConceptId
      if (!target) {
        findings.push(finding('error', 'RESOLVED_DIRECTION_REQUIRES_TARGET', `/witnesses/${index}/positiveDirection/targetConceptId`, witness.id))
      } else {
        const concept = concepts.get(target)
        if (!concept) {
          findings.push(finding('error', 'POSITIVE_TARGET_NOT_REGISTERED', `/witnesses/${index}/positiveDirection/targetConceptId`, target))
        } else if (concept.class !== 'DERIVED_TARGET') {
          findings.push(finding('error', 'POSITIVE_TARGET_MUST_BE_DERIVED_TARGET', `/witnesses/${index}/positiveDirection/targetConceptId`, target))
        }
      }
      if (witness.positiveDirection.direction !== 'POSITIVE') {
        findings.push(finding('error', 'RESOLVED_POSITIVE_DIRECTION_MUST_BE_POSITIVE', `/witnesses/${index}/positiveDirection/direction`, String(witness.positiveDirection.direction)))
      }
    }
  }

  const errors = findings.filter((item) => item.severity === 'error').length
  const warnings = findings.filter((item) => item.severity === 'warning').length
  return { valid: errors === 0, errors, warnings, findings }
}
