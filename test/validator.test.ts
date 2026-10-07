import assert from 'node:assert/strict'
import { test } from 'node:test'
import { join } from 'node:path'
import { loadValidationContext, readAnalysisFile } from '../src/validation/context.js'
import { validateAnalysis } from '../src/validation/validator.js'

const ctx = loadValidationContext()
const goldenPath = join(ctx.rootDir, 'data', 'golden-candidates', 'quran', '037', '030.json')

function golden(): any {
  return structuredClone(readAnalysisFile(goldenPath))
}

test('golden candidate passes deterministic offline validation', () => {
  const report = validateAnalysis(golden(), ctx)
  assert.equal(report.valid, true, JSON.stringify(report.findings, null, 2))
})

test('unregistered concept is rejected', () => {
  const record = golden()
  record.frames[0].concept_ids = ['wsi:concept/not-registered']
  const report = validateAnalysis(record, ctx)
  assert.equal(report.valid, false)
  assert.ok(report.findings.some((item) => item.code === 'CONCEPT_NOT_REGISTERED'))
})

test('evidence cannot escape its source binding', () => {
  const record = golden()
  record.frames[0].evidence[0].resource_id = 'mw:content:outside-binding'
  const report = validateAnalysis(record, ctx)
  assert.equal(report.valid, false)
  assert.ok(report.findings.some((item) => item.code === 'EVIDENCE_RESOURCE_NOT_BOUND'))
})

test('direction assessment must use the controlled direction vocabulary', () => {
  const record = golden()
  const direction = record.assessments.find((item: any) => item.assessment_type === 'SOURCE_DIRECTION')
  direction.result = 'VERY_BAD'
  const report = validateAnalysis(record, ctx)
  assert.equal(report.valid, false)
  assert.ok(report.findings.some((item) => item.code === 'REGISTRY_VALUE_NOT_FOUND'))
})

test('resolved witness response must be allowed by its Witness Pattern', () => {
  const record = golden()
  record.witnesses[0].response.response_id = 'wsi:response/not-allowed'
  const report = validateAnalysis(record, ctx)
  assert.equal(report.valid, false)
  assert.ok(report.findings.some((item) => item.code === 'WITNESS_RESPONSE_NOT_ALLOWED'))
})
