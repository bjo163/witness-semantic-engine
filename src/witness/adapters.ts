import type {
  WitnessConceptRegistrySnapshot,
  WitnessPatternRegistrySnapshot,
  WitnessSemanticState,
} from './types.js'

type AnyRecord = Record<string, any>

function requireString(value: unknown, label: string): string {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} must be a non-blank string`)
  return value
}

export function witnessSemanticStateFromRecord(record: AnyRecord): WitnessSemanticState {
  const recordId = requireString(record.record_id, 'record_id')
  const reviewStatus = requireString(record.review?.status, 'review.status') as WitnessSemanticState['reviewStatus']
  const frames = Array.isArray(record.frames) ? record.frames : []

  return {
    recordId,
    reviewStatus,
    frames: frames.map((frame: AnyRecord, index: number) => ({
      id: requireString(frame.id, `frames[${index}].id`),
      conceptIds: Array.isArray(frame.concept_ids)
        ? frame.concept_ids.map((id: unknown, conceptIndex: number) =>
            requireString(id, `frames[${index}].concept_ids[${conceptIndex}]`),
          )
        : [],
      reviewStatus: requireString(
        frame.review_status,
        `frames[${index}].review_status`,
      ) as WitnessSemanticState['frames'][number]['reviewStatus'],
    })),
  }
}

export function witnessPatternRegistryFromRecord(file: AnyRecord): WitnessPatternRegistrySnapshot {
  return {
    registryVersion: requireString(file.registry_version, 'registry_version'),
    patterns: (Array.isArray(file.patterns) ? file.patterns : []).map((pattern: AnyRecord, index: number) => ({
      id: requireString(pattern.id, `patterns[${index}].id`),
      status: requireString(pattern.status, `patterns[${index}].status`) as any,
      definition: requireString(pattern.definition, `patterns[${index}].definition`),
      triggerConcepts: (Array.isArray(pattern.trigger_concepts) ? pattern.trigger_concepts : [])
        .map((id: unknown, triggerIndex: number) =>
          requireString(id, `patterns[${index}].trigger_concepts[${triggerIndex}]`),
        ),
      localizedLabels: (Array.isArray(pattern.localized_labels) ? pattern.localized_labels : [])
        .map((label: AnyRecord, labelIndex: number) => ({
          language: requireString(label.language, `patterns[${index}].localized_labels[${labelIndex}].language`),
          label: requireString(label.label, `patterns[${index}].localized_labels[${labelIndex}].label`),
          type: requireString(label.type, `patterns[${index}].localized_labels[${labelIndex}].type`) as any,
        })),
      allowedResponses: (Array.isArray(pattern.allowed_responses) ? pattern.allowed_responses : [])
        .map((response: AnyRecord, responseIndex: number) => ({
          id: requireString(response.id, `patterns[${index}].allowed_responses[${responseIndex}].id`),
          label: requireString(response.label, `patterns[${index}].allowed_responses[${responseIndex}].label`),
          ...(typeof response.target_concept_id === 'string'
            ? { targetConceptId: response.target_concept_id }
            : {}),
        })),
    })),
  }
}

export function witnessConceptRegistryFromRecord(file: AnyRecord): WitnessConceptRegistrySnapshot {
  return {
    registryVersion: requireString(file.scheme_version, 'scheme_version'),
    concepts: (Array.isArray(file.concepts) ? file.concepts : []).map((concept: AnyRecord, index: number) => ({
      id: requireString(concept.id, `concepts[${index}].id`),
      class: requireString(concept.class, `concepts[${index}].class`),
      status: requireString(concept.status, `concepts[${index}].status`) as any,
    })),
  }
}
