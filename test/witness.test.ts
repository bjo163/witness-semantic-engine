import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import Ajv2020 from 'ajv/dist/2020.js'
import { findRepositoryRoot } from '../src/validation/context.js'
import { deriveWitnesses } from '../src/witness/engine.js'
import { validateWitnessDerivation } from '../src/witness/validate.js'
import { witnessConceptRegistryFromRecord, witnessPatternRegistryFromRecord, witnessSemanticStateFromRecord } from '../src/witness/adapters.js'
import type {
  WitnessConceptRegistrySnapshot,
  WitnessEngineInput,
  WitnessPatternRegistrySnapshot,
  WitnessSemanticState,
} from '../src/witness/types.js'

const root = findRepositoryRoot()
const golden = JSON.parse(readFileSync(join(root, 'data/golden-candidates/quran/037/030.json'), 'utf8')) as any
const patternsFile = JSON.parse(readFileSync(join(root, 'registries/witness-patterns.json'), 'utf8')) as any
const conceptsFile = JSON.parse(readFileSync(join(root, 'registries/concepts.json'), 'utf8')) as any
const schema = JSON.parse(readFileSync(join(root, 'spec/witness-derivation.schema.json'), 'utf8')) as object

const patternRegistry: WitnessPatternRegistrySnapshot = witnessPatternRegistryFromRecord(patternsFile)
const conceptRegistry: WitnessConceptRegistrySnapshot = witnessConceptRegistryFromRecord(conceptsFile)
const semanticState: WitnessSemanticState = witnessSemanticStateFromRecord(golden)

const ajv = new Ajv2020({ allErrors: true, strict: false })
const validateSchema = ajv.compile(schema)

function input(overrides: Partial<WitnessEngineInput> = {}): WitnessEngineInput {
  return {
    mode: 'RESEARCH_PREVIEW',
    semanticState: structuredClone(semanticState),
    patternRegistry: structuredClone(patternRegistry),
    conceptRegistry: structuredClone(conceptRegistry),
    languages: ['id','en'],
    ...overrides,
  }
}

test('M6 research preview derives OFFSIDE -> response -> positive direction from eligible semantic state', () => {
  const request = input()
  const result = deriveWitnesses(request)

  assert.equal(result.status, 'COMPLETE')
  assert.equal(result.witnesses.length, 1)
  const witness = result.witnesses[0]
  assert.equal(witness.patternId, 'wsi:witness-pattern/boundary-violation')
  assert.deepEqual(witness.observedFrameIds, ['F2'])
  assert.deepEqual(witness.matchedConceptIds, ['wsi:concept/transgression'])
  assert.equal(witness.triggerCoverage, 1)
  assert.ok(witness.labels.some((label) => label.label === 'OFFSIDE' && label.language === 'id'))
  assert.deepEqual(witness.response, {
    status: 'RESOLVED',
    responseId: 'wsi:response/return-to-boundary',
    label: 'Return to the valid boundary',
  })
  assert.deepEqual(witness.positiveDirection, {
    status: 'RESOLVED',
    targetConceptId: 'wsi:concept/boundary-alignment',
    direction: 'POSITIVE',
    derivationType: 'DERIVED',
  })
  assert.equal(witness.reviewStatus, 'CANDIDATE')

  assert.equal(validateSchema(result), true, JSON.stringify(validateSchema.errors, null, 2))
  const report = validateWitnessDerivation(result, request)
  assert.equal(report.valid, true, JSON.stringify(report.findings, null, 2))
})

test('production mode fails closed for RESEARCHED semantic state and CANDIDATE Witness Pattern', () => {
  const request = input({ mode: 'PRODUCTION' })
  const result = deriveWitnesses(request)
  assert.equal(result.status, 'UNRESOLVED')
  assert.equal(result.witnesses.length, 0)
  assert.ok(result.findings.some((item) => item.code === 'SEMANTIC_STATE_NOT_ELIGIBLE'))
})

test('production resolves only after semantic state, frame, and pattern are reviewed', () => {
  const request = input({ mode: 'PRODUCTION' })
  request.semanticState.reviewStatus = 'REVIEWED'
  request.semanticState.frames = request.semanticState.frames.map((frame) => ({
    ...frame,
    reviewStatus: frame.id === 'F2' ? 'REVIEWED' : frame.reviewStatus,
  }))

  const blocked = deriveWitnesses(request)
  assert.equal(blocked.witnesses.length, 0)
  assert.ok(blocked.findings.some((item) => item.code === 'WITNESS_PATTERN_NOT_ELIGIBLE'))

  request.patternRegistry.patterns[0].status = 'REVIEWED'
  const allowed = deriveWitnesses(request)
  assert.equal(allowed.status, 'COMPLETE')
  assert.equal(allowed.witnesses.length, 1)
  assert.equal(validateWitnessDerivation(allowed, request).valid, true)
})

test('multiple allowed responses remain unresolved instead of choosing silently', () => {
  const request = input()
  request.patternRegistry.patterns[0].allowedResponses.push({
    id: 'wsi:response/another-response',
    label: 'Another plausible response',
    targetConceptId: 'wsi:concept/boundary-alignment',
  })

  const result = deriveWitnesses(request)
  assert.equal(result.status, 'PARTIAL')
  assert.equal(result.witnesses[0]?.response.status, 'UNRESOLVED')
  assert.equal(result.witnesses[0]?.positiveDirection.status, 'UNRESOLVED')
  assert.ok(result.findings.some((item) => item.code === 'WITNESS_RESPONSE_AMBIGUOUS'))
})

test('positive direction remains unresolved when target is not a DERIVED_TARGET concept', () => {
  const request = input()
  request.patternRegistry.patterns[0].allowedResponses[0].targetConceptId = 'wsi:concept/transgression'

  const result = deriveWitnesses(request)
  assert.equal(result.status, 'PARTIAL')
  assert.equal(result.witnesses[0]?.response.status, 'RESOLVED')
  assert.equal(result.witnesses[0]?.positiveDirection.status, 'UNRESOLVED')
  assert.ok(result.findings.some((item) => item.code === 'POSITIVE_TARGET_NOT_DERIVED_TARGET'))
})

test('derivation identity is deterministic across frame/pattern/registry ordering', () => {
  const firstInput = input()
  const first = deriveWitnesses(firstInput)

  const secondInput = input()
  secondInput.semanticState.frames.reverse()
  secondInput.patternRegistry.patterns.reverse()
  secondInput.conceptRegistry.concepts.reverse()
  const second = deriveWitnesses(secondInput)

  assert.equal(first.derivationId, second.derivationId)
  assert.deepEqual(first.witnesses, second.witnesses)
})
