import Ajv2020, { type ErrorObject } from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import type { Finding, ValidationContext, ValidationReport } from './types.js'

const PASSES = [
  'JSON_SCHEMA',
  'WSI_REGISTRY_REFERENTIAL_INTEGRITY',
  'SOURCE_BINDING_RESOLUTION',
  'EVIDENCE_SELECTOR_RESOLUTION',
  'WSI_SEMANTIC_INVARIANTS',
  'REVIEW_POLICY',
] as const

type AnyRecord = Record<string, any>

function finding(severity: Finding['severity'], code: string, path: string, message: string): Finding {
  return { severity, code, path, message }
}

function ensureUniqueIds(items: AnyRecord[] | undefined, path: string, findings: Finding[]): void {
  const seen = new Set<string>()
  for (const [index, item] of (items ?? []).entries()) {
    const id = item?.id
    if (typeof id !== 'string') continue
    if (seen.has(id)) {
      findings.push(finding('error', 'DUPLICATE_LOCAL_ID', `${path}/${index}/id`, `Duplicate local ID: ${id}`))
    }
    seen.add(id)
  }
}

function checkRegistry(
  ctx: ValidationContext,
  registry: string,
  value: unknown,
  path: string,
  findings: Finding[],
): void {
  if (value === null || value === undefined) return
  if (typeof value !== 'string') return
  const allowed = ctx.controlled[registry]
  if (!allowed) {
    findings.push(finding('error', 'UNKNOWN_REGISTRY', path, `Unknown registry: ${registry}`))
    return
  }
  if (!allowed.includes(value)) {
    findings.push(finding('error', 'REGISTRY_VALUE_NOT_FOUND', path, `${value} is not registered in ${registry}`))
  }
}

function schemaFindings(record: unknown, ctx: ValidationContext): Finding[] {
  const ajv = new Ajv2020({ allErrors: true, strict: false })
  addFormats(ajv)
  const validate = ajv.compile(ctx.schema)
  if (validate(record)) return []
  return (validate.errors ?? []).map((error: ErrorObject) =>
    finding(
      'error',
      'SCHEMA_VALIDATION_FAILED',
      error.instancePath || '/',
      `${error.message ?? 'schema violation'}${error.params ? ` (${JSON.stringify(error.params)})` : ''}`,
    ),
  )
}

function registryFindings(record: AnyRecord, ctx: ValidationContext): Finding[] {
  const findings: Finding[] = []

  checkRegistry(ctx, 'review_statuses', record.review?.status, '/review/status', findings)

  for (const [i, item] of (record.lexical_senses ?? []).entries()) {
    if (item.maps_to_concept_id && !ctx.conceptIds.has(item.maps_to_concept_id)) {
      findings.push(finding('error', 'CONCEPT_NOT_REGISTERED', `/lexical_senses/${i}/maps_to_concept_id`, item.maps_to_concept_id))
    }
    checkRegistry(ctx, 'review_statuses', item.review_status, `/lexical_senses/${i}/review_status`, findings)
  }

  for (const [i, item] of (record.utterances ?? []).entries()) {
    checkRegistry(ctx, 'speech_acts', item.speech_act, `/utterances/${i}/speech_act`, findings)
  }

  for (const [i, item] of (record.participants ?? []).entries()) {
    checkRegistry(ctx, 'entity_types', item.entity_type, `/participants/${i}/entity_type`, findings)
    for (const [j, role] of (item.discourse_roles ?? []).entries()) {
      checkRegistry(ctx, 'discourse_roles', role, `/participants/${i}/discourse_roles/${j}`, findings)
    }
  }

  for (const [i, frame] of (record.frames ?? []).entries()) {
    checkRegistry(ctx, 'frame_types', frame.frame_type, `/frames/${i}/frame_type`, findings)
    checkRegistry(ctx, 'polarity', frame.polarity, `/frames/${i}/polarity`, findings)
    checkRegistry(ctx, 'modality', frame.modality, `/frames/${i}/modality`, findings)
    checkRegistry(ctx, 'speech_acts', frame.speech_act, `/frames/${i}/speech_act`, findings)
    checkRegistry(ctx, 'review_statuses', frame.review_status, `/frames/${i}/review_status`, findings)

    if (frame.predicate_relation_id && !ctx.relationIds.has(frame.predicate_relation_id)) {
      findings.push(finding('error', 'RELATION_NOT_REGISTERED', `/frames/${i}/predicate_relation_id`, frame.predicate_relation_id))
    }
    for (const [j, roleBinding] of (frame.role_bindings ?? []).entries()) {
      checkRegistry(ctx, 'semantic_roles', roleBinding.role, `/frames/${i}/role_bindings/${j}/role`, findings)
    }
    for (const [j, conceptId] of (frame.concept_ids ?? []).entries()) {
      if (!ctx.conceptIds.has(conceptId)) {
        findings.push(finding('error', 'CONCEPT_NOT_REGISTERED', `/frames/${i}/concept_ids/${j}`, conceptId))
      }
    }
  }

  for (const [i, relation] of (record.discourse_relations ?? []).entries()) {
    if (!ctx.relationIds.has(relation.relation_id)) {
      findings.push(finding('error', 'RELATION_NOT_REGISTERED', `/discourse_relations/${i}/relation_id`, relation.relation_id))
    }
    checkRegistry(ctx, 'review_statuses', relation.review_status, `/discourse_relations/${i}/review_status`, findings)
  }

  for (const [i, ref] of (record.concept_refs ?? []).entries()) {
    if (!ctx.conceptIds.has(ref.concept_id)) {
      findings.push(finding('error', 'CONCEPT_NOT_REGISTERED', `/concept_refs/${i}/concept_id`, ref.concept_id))
    }
    checkRegistry(ctx, 'review_statuses', ref.review_status, `/concept_refs/${i}/review_status`, findings)
  }

  for (const [i, assessment] of (record.assessments ?? []).entries()) {
    checkRegistry(ctx, 'assessment_types', assessment.assessment_type, `/assessments/${i}/assessment_type`, findings)
    checkRegistry(ctx, 'review_statuses', assessment.review_status, `/assessments/${i}/review_status`, findings)
    if (assessment.assessment_type === 'SOURCE_DIRECTION' || assessment.assessment_type === 'SOURCE_DIRECTION_SUMMARY') {
      checkRegistry(ctx, 'directions', assessment.result, `/assessments/${i}/result`, findings)
    }
  }

  for (const [i, witness] of (record.witnesses ?? []).entries()) {
    if (!ctx.witnessPatterns.has(witness.pattern_id)) {
      findings.push(finding('error', 'WITNESS_PATTERN_NOT_REGISTERED', `/witnesses/${i}/pattern_id`, witness.pattern_id))
    }
    for (const [j, label] of (witness.labels ?? []).entries()) {
      checkRegistry(ctx, 'witness_label_types', label.type, `/witnesses/${i}/labels/${j}/type`, findings)
    }
    if (witness.positive_direction?.target_concept_id && !ctx.conceptIds.has(witness.positive_direction.target_concept_id)) {
      findings.push(
        finding(
          'error',
          'CONCEPT_NOT_REGISTERED',
          `/witnesses/${i}/positive_direction/target_concept_id`,
          witness.positive_direction.target_concept_id,
        ),
      )
    }
    checkRegistry(ctx, 'review_statuses', witness.review_status, `/witnesses/${i}/review_status`, findings)
  }

  return findings
}

function sourceBindingFindings(record: AnyRecord, ctx: ValidationContext): Finding[] {
  const findings: Finding[] = []
  const bindings = new Map<string, AnyRecord>((record.source_bindings ?? []).map((binding: AnyRecord) => [binding.id, binding]))

  for (const [i, binding] of (record.source_bindings ?? []).entries()) {
    if (!(binding.resource_ids ?? []).includes(binding.primary_resource_id)) {
      findings.push(
        finding('error', 'PRIMARY_RESOURCE_NOT_BOUND', `/source_bindings/${i}/primary_resource_id`, 'primary_resource_id must appear in resource_ids'),
      )
    }

    for (const [j, resourceId] of (binding.resource_ids ?? []).entries()) {
      if (typeof resourceId === 'string' && resourceId.startsWith('wsi:')) {
        findings.push(
          finding('error', 'EXTERNAL_RESOURCE_USES_WSI_NAMESPACE', `/source_bindings/${i}/resource_ids/${j}`, resourceId),
        )
      }
    }

    const catalog = ctx.providerCatalogs.get(binding.provider)
    if (!catalog) {
      findings.push(
        finding('warning', 'PROVIDER_CATALOG_UNAVAILABLE', `/source_bindings/${i}/provider`, `No offline provider catalog for ${binding.provider}`),
      )
      continue
    }

    if (catalog.provider_contract !== binding.provider_contract) {
      findings.push(
        finding('error', 'PROVIDER_CONTRACT_MISMATCH', `/source_bindings/${i}/provider_contract`, `Expected ${catalog.provider_contract}`),
      )
    }

    if (catalog.provider_revision !== binding.provider_revision) {
      findings.push(
        finding(
          'warning',
          'PROVIDER_REVISION_NOT_INDEXED',
          `/source_bindings/${i}/provider_revision`,
          `Offline catalog indexes ${catalog.provider_revision}; binding pins ${binding.provider_revision}`,
        ),
      )
      continue
    }

    const resourceIds = new Set(catalog.resources.map((resource) => resource.id))
    for (const [j, resourceId] of (binding.resource_ids ?? []).entries()) {
      if (!resourceIds.has(resourceId)) {
        findings.push(
          finding(
            catalog.coverage === 'FULL' ? 'error' : 'warning',
            'RESOURCE_NOT_IN_PROVIDER_CATALOG',
            `/source_bindings/${i}/resource_ids/${j}`,
            `${resourceId} is not present in the ${catalog.coverage.toLowerCase()} offline catalog`,
          ),
        )
      }
    }
  }

  const target = record.analysis_target
  const binding = target ? bindings.get(target.source_binding_id) : undefined
  if (target && !binding) {
    findings.push(finding('error', 'ANALYSIS_TARGET_BINDING_MISSING', '/analysis_target/source_binding_id', target.source_binding_id))
  } else if (target && binding && !(binding.resource_ids ?? []).includes(target.resource_id)) {
    findings.push(
      finding('error', 'ANALYSIS_TARGET_RESOURCE_NOT_BOUND', '/analysis_target/resource_id', `${target.resource_id} is not included in its source binding`),
    )
  }

  return findings
}

function collectEvidence(record: AnyRecord): Array<{ evidence: AnyRecord; path: string }> {
  const results: Array<{ evidence: AnyRecord; path: string }> = []
  const collect = (items: AnyRecord[] | undefined, base: string): void => {
    for (const [i, item] of (items ?? []).entries()) {
      for (const [j, evidence] of (item.evidence ?? []).entries()) {
        results.push({ evidence, path: `${base}/${i}/evidence/${j}` })
      }
    }
  }
  collect(record.lexical_senses, '/lexical_senses')
  collect(record.utterances, '/utterances')
  collect(record.participants, '/participants')
  collect(record.frames, '/frames')
  collect(record.discourse_relations, '/discourse_relations')
  collect(record.assessments, '/assessments')
  return results
}

function evidenceFindings(record: AnyRecord, ctx: ValidationContext): Finding[] {
  const findings: Finding[] = []
  const bindings = new Map<string, AnyRecord>((record.source_bindings ?? []).map((binding: AnyRecord) => [binding.id, binding]))

  for (const { evidence, path } of collectEvidence(record)) {
    checkRegistry(ctx, 'evidence_source_classes', evidence.source_class, `${path}/source_class`, findings)
    checkRegistry(ctx, 'derivation_types', evidence.derivation_type, `${path}/derivation_type`, findings)

    const binding = bindings.get(evidence.source_binding_id)
    if (!binding) {
      findings.push(finding('error', 'EVIDENCE_BINDING_MISSING', `${path}/source_binding_id`, evidence.source_binding_id))
      continue
    }
    if (!(binding.resource_ids ?? []).includes(evidence.resource_id)) {
      findings.push(
        finding('error', 'EVIDENCE_RESOURCE_NOT_BOUND', `${path}/resource_id`, `${evidence.resource_id} is outside source binding ${binding.id}`),
      )
    }

    const selector = evidence.selector ?? {}
    if (selector.type === 'TEXT_QUOTE' && (typeof selector.exact !== 'string' || selector.exact.trim() === '')) {
      findings.push(finding('error', 'TEXT_QUOTE_REQUIRES_EXACT', `${path}/selector/exact`, 'TEXT_QUOTE requires a non-empty exact quote'))
    }
    if (selector.type === 'CHAR_RANGE') {
      if (!Number.isInteger(selector.start) || !Number.isInteger(selector.end) || selector.end <= selector.start) {
        findings.push(finding('error', 'INVALID_CHAR_RANGE', `${path}/selector`, 'CHAR_RANGE requires integer start/end with end > start'))
      }
    }
    if (selector.type === 'TOKEN_IDS') {
      if (!Array.isArray(selector.token_ids) || selector.token_ids.length === 0) {
        findings.push(finding('error', 'TOKEN_IDS_REQUIRED', `${path}/selector/token_ids`, 'TOKEN_IDS selector requires at least one token ID'))
      }
      findings.push(
        finding(
          'warning',
          'TOKEN_SELECTOR_REQUIRES_ANALYZER_PROVENANCE',
          `${path}/selector`,
          'Token IDs are analysis-local unless tokenizer/analyzer identity is recorded in analysis provenance',
        ),
      )
    }
  }

  return findings
}

function semanticInvariantFindings(record: AnyRecord, ctx: ValidationContext): Finding[] {
  const findings: Finding[] = []
  ensureUniqueIds(record.source_bindings, '/source_bindings', findings)
  ensureUniqueIds(record.lexical_senses, '/lexical_senses', findings)
  ensureUniqueIds(record.utterances, '/utterances', findings)
  ensureUniqueIds(record.participants, '/participants', findings)
  ensureUniqueIds(record.frames, '/frames', findings)
  ensureUniqueIds(record.discourse_relations, '/discourse_relations', findings)
  ensureUniqueIds(record.assessments, '/assessments', findings)
  ensureUniqueIds(record.witnesses, '/witnesses', findings)

  const participantIds = new Set((record.participants ?? []).map((item: AnyRecord) => item.id))
  const utteranceIds = new Set((record.utterances ?? []).map((item: AnyRecord) => item.id))
  const frameIds = new Set((record.frames ?? []).map((item: AnyRecord) => item.id))
  const discourseIds = new Set((record.discourse_relations ?? []).map((item: AnyRecord) => item.id))
  const lexicalSenseIds = new Set((record.lexical_senses ?? []).map((item: AnyRecord) => item.id))
  const witnessIds = new Set((record.witnesses ?? []).map((item: AnyRecord) => item.id))

  for (const [i, utterance] of (record.utterances ?? []).entries()) {
    if (utterance.parent_utterance_id && !utteranceIds.has(utterance.parent_utterance_id)) {
      findings.push(finding('error', 'UTTERANCE_PARENT_MISSING', `/utterances/${i}/parent_utterance_id`, utterance.parent_utterance_id))
    }
    if (utterance.speaker_participant_id && !participantIds.has(utterance.speaker_participant_id)) {
      findings.push(finding('error', 'UTTERANCE_SPEAKER_MISSING', `/utterances/${i}/speaker_participant_id`, utterance.speaker_participant_id))
    }
    for (const [j, id] of (utterance.addressee_participant_ids ?? []).entries()) {
      if (!participantIds.has(id)) {
        findings.push(finding('error', 'UTTERANCE_ADDRESSEE_MISSING', `/utterances/${i}/addressee_participant_ids/${j}`, id))
      }
    }
  }

  for (const [i, frame] of (record.frames ?? []).entries()) {
    if (frame.utterance_id && !utteranceIds.has(frame.utterance_id)) {
      findings.push(finding('error', 'FRAME_UTTERANCE_MISSING', `/frames/${i}/utterance_id`, frame.utterance_id))
    }
    for (const [j, roleBinding] of (frame.role_bindings ?? []).entries()) {
      if (!participantIds.has(roleBinding.participant_id)) {
        findings.push(finding('error', 'FRAME_PARTICIPANT_MISSING', `/frames/${i}/role_bindings/${j}/participant_id`, roleBinding.participant_id))
      }
    }
    if ('source_direction' in frame) {
      findings.push(
        finding('error', 'DIRECTION_MUST_BE_ASSESSMENT', `/frames/${i}/source_direction`, 'Direction must be represented as an Assessment, not a Frame property'),
      )
    }
  }

  for (const [i, relation] of (record.discourse_relations ?? []).entries()) {
    if (!frameIds.has(relation.from_frame_id)) {
      findings.push(finding('error', 'DISCOURSE_SOURCE_FRAME_MISSING', `/discourse_relations/${i}/from_frame_id`, relation.from_frame_id))
    }
    if (!frameIds.has(relation.to_frame_id)) {
      findings.push(finding('error', 'DISCOURSE_TARGET_FRAME_MISSING', `/discourse_relations/${i}/to_frame_id`, relation.to_frame_id))
    }
  }

  for (const [i, assessment] of (record.assessments ?? []).entries()) {
    const target = assessment.target ?? {}
    const exists =
      target.type === 'RECORD' ? target.id === record.record_id :
      target.type === 'LEXICAL_SENSE' ? lexicalSenseIds.has(target.id) :
      target.type === 'PARTICIPANT' ? participantIds.has(target.id) :
      target.type === 'FRAME' ? frameIds.has(target.id) :
      target.type === 'DISCOURSE_RELATION' ? discourseIds.has(target.id) :
      target.type === 'WITNESS' ? witnessIds.has(target.id) : false
    if (!exists) {
      findings.push(finding('error', 'ASSESSMENT_TARGET_MISSING', `/assessments/${i}/target`, `${target.type ?? '?'}:${target.id ?? '?'}`))
    }
  }

  for (const [i, witness] of (record.witnesses ?? []).entries()) {
    for (const [j, frameId] of (witness.observed_frame_ids ?? []).entries()) {
      if (!frameIds.has(frameId)) {
        findings.push(finding('error', 'WITNESS_FRAME_MISSING', `/witnesses/${i}/observed_frame_ids/${j}`, frameId))
      }
    }

    const pattern = ctx.witnessPatterns.get(witness.pattern_id)
    if (pattern && witness.response?.status === 'RESOLVED') {
      const allowed = new Map((pattern.allowed_responses ?? []).map((response) => [response.id, response]))
      const response = allowed.get(witness.response.response_id)
      if (!response) {
        findings.push(
          finding('error', 'WITNESS_RESPONSE_NOT_ALLOWED', `/witnesses/${i}/response/response_id`, `${witness.response.response_id} is not allowed by ${witness.pattern_id}`),
        )
      } else if (
        response.target_concept_id &&
        witness.positive_direction?.status === 'RESOLVED' &&
        witness.positive_direction.target_concept_id !== response.target_concept_id
      ) {
        findings.push(
          finding(
            'error',
            'WITNESS_TARGET_MISMATCH',
            `/witnesses/${i}/positive_direction/target_concept_id`,
            `Expected ${response.target_concept_id} from response ${response.id}`,
          ),
        )
      }
    }

    if (witness.positive_direction?.status === 'RESOLVED') {
      if (witness.positive_direction.direction !== 'POSITIVE' || !witness.positive_direction.target_concept_id) {
        findings.push(
          finding('error', 'RESOLVED_POSITIVE_DIRECTION_INCOMPLETE', `/witnesses/${i}/positive_direction`, 'Resolved positive direction requires POSITIVE + target_concept_id'),
        )
      }
    }
  }

  return findings
}

function reviewPolicyFindings(record: AnyRecord): Finding[] {
  const findings: Finding[] = []
  const recordLocked = record.review?.status === 'LOCKED'
  const anyLocked = [
    ...(record.lexical_senses ?? []),
    ...(record.frames ?? []),
    ...(record.discourse_relations ?? []),
    ...(record.assessments ?? []),
    ...(record.witnesses ?? []),
  ].some((item: AnyRecord) => item.review_status === 'LOCKED')

  if ((recordLocked || anyLocked) && !record.review?.reviewer) {
    findings.push(finding('error', 'LOCKED_REQUIRES_REVIEWER', '/review/reviewer', 'Locked analysis requires an identified reviewer'))
  }

  if (recordLocked) {
    for (const [i, binding] of (record.source_bindings ?? []).entries()) {
      if (binding.resolution_status !== 'RESOLVED') {
        findings.push(
          finding('error', 'LOCKED_REQUIRES_RESOLVED_SOURCE', `/source_bindings/${i}/resolution_status`, 'Locked analysis requires resolved source bindings'),
        )
      }
    }
  }

  const frameById = new Map<string, AnyRecord>((record.frames ?? []).map((frame: AnyRecord) => [frame.id, frame]))
  for (const [i, witness] of (record.witnesses ?? []).entries()) {
    if (witness.review_status !== 'REVIEWED' && witness.review_status !== 'LOCKED') continue
    for (const frameId of witness.observed_frame_ids ?? []) {
      const frame = frameById.get(frameId)
      if (frame && frame.review_status !== 'REVIEWED' && frame.review_status !== 'LOCKED') {
        findings.push(
          finding('error', 'REVIEWED_WITNESS_REQUIRES_REVIEWED_FRAME', `/witnesses/${i}/observed_frame_ids`, `${frameId} is only ${frame.review_status}`),
        )
      }
    }
  }

  return findings
}

export function validateAnalysis(record: unknown, ctx: ValidationContext): ValidationReport {
  const findings = schemaFindings(record, ctx)
  if (findings.some((item) => item.severity === 'error')) {
    return {
      valid: false,
      errors: findings.filter((item) => item.severity === 'error').length,
      warnings: findings.filter((item) => item.severity === 'warning').length,
      findings,
      passes: [PASSES[0]],
    }
  }

  const typedRecord = record as AnyRecord
  findings.push(...registryFindings(typedRecord, ctx))
  findings.push(...sourceBindingFindings(typedRecord, ctx))
  findings.push(...evidenceFindings(typedRecord, ctx))
  findings.push(...semanticInvariantFindings(typedRecord, ctx))
  findings.push(...reviewPolicyFindings(typedRecord))

  const errors = findings.filter((item) => item.severity === 'error').length
  const warnings = findings.filter((item) => item.severity === 'warning').length

  return {
    valid: errors === 0,
    errors,
    warnings,
    findings,
    passes: [...PASSES],
  }
}
