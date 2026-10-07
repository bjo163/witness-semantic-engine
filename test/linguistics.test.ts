import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import Ajv2020 from 'ajv/dist/2020.js'
import { findRepositoryRoot } from '../src/validation/context.js'
import {
  arabicBaselineAnalyzer,
  selectLinguisticAnalyzer,
} from '../src/linguistics/reference.js'
import { validateLinguisticAnalysis } from '../src/linguistics/validate.js'
import type { LinguisticAnalyzerInput } from '../src/linguistics/types.js'

const root = findRepositoryRoot()
const schema = JSON.parse(readFileSync(join(root, 'spec', 'linguistic-analysis.schema.json'), 'utf8')) as object
const ajv = new Ajv2020({ allErrors: true, strict: false })
const validateSchema = ajv.compile(schema)

const profiles: Array<{
  name: string
  language: string
  script: string
  text: string
  analyzerId: string
}> = [
  {
    name: 'Arabic',
    language: 'ar',
    script: 'Arab',
    text: 'سُلْطَـٰنٍ طَـٰغِينَ',
    analyzerId: 'wsi:linguistic-analyzer/arabic-baseline',
  },
  {
    name: 'Hebrew',
    language: 'he',
    script: 'Hebr',
    text: 'בְּרֵאשִׁית בָּרָא',
    analyzerId: 'wsi:linguistic-analyzer/hebrew-baseline',
  },
  {
    name: 'Greek',
    language: 'grc',
    script: 'Grek',
    text: 'Ἐν ἀρχῇ ἦν ὁ λόγος',
    analyzerId: 'wsi:linguistic-analyzer/greek-baseline',
  },
  {
    name: 'generic fallback',
    language: 'id',
    script: 'Latn',
    text: 'Batas harus diperiksa, bukan diasumsikan.',
    analyzerId: 'wsi:linguistic-analyzer/generic-baseline',
  },
]

for (const profile of profiles) {
  test(`${profile.name} profile uses one linguistic contract with explicit unsupported states`, async () => {
    const input: LinguisticAnalyzerInput = {
      provider: 'fixture-provider',
      providerRevision: 'fixture-revision-1',
      resourceId: `fixture:${profile.language}:1`,
      text: profile.text,
      language: profile.language,
      script: profile.script,
    }
    const analyzer = selectLinguisticAnalyzer(input)
    assert.equal(analyzer.descriptor.id, profile.analyzerId)

    const first = await analyzer.analyze(input)
    const second = await analyzer.analyze(input)
    assert.equal(first.analysisId, second.analysisId)
    assert.equal(first.status, 'PARTIAL')
    assert.equal(first.capabilities.TOKENIZATION, 'SUPPORTED')
    assert.equal(first.capabilities.NORMALIZATION, 'SUPPORTED')
    assert.equal(first.capabilities.LEMMA, 'UNSUPPORTED')
    assert.equal(first.capabilities.MORPHOLOGY, 'UNSUPPORTED')
    assert.equal(first.capabilities.SYNTAX, 'UNSUPPORTED')
    assert.ok(first.tokens.length > 0)

    const codePoints = [...profile.text]
    for (const token of first.tokens) {
      assert.equal(codePoints.slice(token.span.start, token.span.end).join(''), token.surface)
      assert.equal(token.normalized.status, 'RESOLVED')
      assert.equal(token.normalized.value, token.surface.normalize('NFC'))
      assert.equal(token.lemma.status, 'UNSUPPORTED')
      assert.equal(token.upos.status, 'UNSUPPORTED')
      assert.equal(token.features.status, 'UNSUPPORTED')
    }

    assert.equal(validateSchema(first), true, JSON.stringify(validateSchema.errors, null, 2))
    const report = validateLinguisticAnalysis(first)
    assert.equal(report.valid, true, JSON.stringify(report.findings, null, 2))
  })
}

test('language analyzer selection does not depend on scripture or corpus identity', () => {
  const shared = {
    provider: 'fixture-provider',
    providerRevision: 'rev',
    text: 'لغة عربية',
    language: 'ar',
    script: 'Arab',
  }
  const a = selectLinguisticAnalyzer({ ...shared, resourceId: 'resource:quran-like' })
  const b = selectLinguisticAnalyzer({ ...shared, resourceId: 'resource:totally-unrelated-corpus' })
  assert.equal(a.descriptor.id, 'wsi:linguistic-analyzer/arabic-baseline')
  assert.equal(b.descriptor.id, a.descriptor.id)
})

test('specific analyzer returns unsupported instead of inventing structure for unsupported input', async () => {
  const result = await arabicBaselineAnalyzer.analyze({
    provider: 'fixture-provider',
    providerRevision: 'rev',
    resourceId: 'fixture:he:1',
    text: 'בְּרֵאשִׁית',
    language: 'he',
    script: 'Hebr',
  })
  assert.equal(result.status, 'UNSUPPORTED')
  assert.equal(result.tokens.length, 0)
  assert.equal(result.dependencies.length, 0)
  assert.equal(result.capabilities.TOKENIZATION, 'UNSUPPORTED')
  assert.equal(validateLinguisticAnalysis(result).valid, true)
})

test('linguistic validator rejects fabricated resolved annotations', async () => {
  const result = await selectLinguisticAnalyzer({
    provider: 'fixture-provider',
    providerRevision: 'rev',
    resourceId: 'fixture:ar:2',
    text: 'سلطان',
    language: 'ar',
    script: 'Arab',
  }).analyze({
    provider: 'fixture-provider',
    providerRevision: 'rev',
    resourceId: 'fixture:ar:2',
    text: 'سلطان',
    language: 'ar',
    script: 'Arab',
  })
  const mutated = structuredClone(result)
  mutated.tokens[0].lemma = { status: 'RESOLVED' }
  const report = validateLinguisticAnalysis(mutated)
  assert.equal(report.valid, false)
  assert.ok(report.findings.some((item) => item.code === 'RESOLVED_ANNOTATION_MISSING_VALUE'))
})
