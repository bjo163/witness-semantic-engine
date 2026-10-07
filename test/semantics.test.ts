import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import Ajv2020 from 'ajv/dist/2020.js'
import { arabicBaselineAnalyzer } from '../src/linguistics/reference.js'
import { findRepositoryRoot } from '../src/validation/context.js'
import { compileSemanticCandidate } from '../src/semantics/engine.js'
import { validateSemanticCandidate } from '../src/semantics/validate.js'
import type { LinguisticAnalysis } from '../src/linguistics/types.js'
import type { SemanticProposalBundle, SemanticRegistrySnapshot } from '../src/semantics/types.js'

const root = findRepositoryRoot()
const schema = JSON.parse(readFileSync(join(root, 'spec', 'semantic-candidate.schema.json'), 'utf8')) as object
const concepts = JSON.parse(readFileSync(join(root, 'registries', 'concepts.json'), 'utf8')) as {
  scheme_version: string
  concepts: Array<{ id: string }>
}
const relations = JSON.parse(readFileSync(join(root, 'registries', 'relations.json'), 'utf8')) as {
  registry_version: string
  relations: Array<{ id: string }>
}

const registry: SemanticRegistrySnapshot = {
  registryVersion: `concepts:${concepts.scheme_version};relations:${relations.registry_version}`,
  conceptIds: concepts.concepts.map((item) => item.id),
  relationIds: relations.relations.map((item) => item.id),
}

const ajv = new Ajv2020({ allErrors: true, strict: false })
const validateSchema = ajv.compile(schema)

function tokenId(analysis: LinguisticAnalysis, surface: string): string {
  const token = analysis.tokens.find((item) => item.surface === surface)
  assert.ok(token, `missing token surface ${surface}`)
  return token.id
}

async function saffat37_30(): Promise<{ analysis: LinguisticAnalysis; proposals: SemanticProposalBundle }> {
  const text = 'وَمَا كَانَ لَنَا عَلَيْكُم مِّن سُلْطَـٰنٍۭ بَلْ كُنتُمْ قَوْمًا طَـٰغِينَ'
  const analysis = await arabicBaselineAnalyzer.analyze({
    provider: 'rocksoul-rgbl',
    providerRevision: 'fixture-rgbl-revision',
    resourceId: 'fixture:quran:37:30',
    text,
    language: 'ar',
    script: 'Arab',
  })

  const we = tokenId(analysis, 'لَنَا')
  const you = tokenId(analysis, 'عَلَيْكُم')
  const authority = tokenId(analysis, 'سُلْطَـٰنٍۭ')
  const contrast = tokenId(analysis, 'بَلْ')
  const youState = tokenId(analysis, 'كُنتُمْ')
  const transgression = tokenId(analysis, 'طَـٰغِينَ')

  const proposals: SemanticProposalBundle = {
    proposer: { id: 'wsi:semantic-proposer/golden-manual', version: '0.1.0', method: 'MANUAL' },
    participants: [
      { key: 'you', tokenIds: [you, youState], entityType: 'GROUP', discourseRoles: ['ADDRESSEE','REFERENT'], resolutionStatus: 'UNRESOLVED', confidence: 0.98 },
      { key: 'we', tokenIds: [we], entityType: 'GROUP', discourseRoles: ['SPEAKER'], resolutionStatus: 'UNRESOLVED', confidence: 0.98 }
    ],
    concepts: [
      { key: 'transgression', tokenIds: [transgression], sourceRole: 'CONTENT', conceptId: 'wsi:concept/transgression', senseGloss: 'transgressing or exceeding a proper limit', confidence: 0.99 },
      { key: 'we-reference', tokenIds: [we], sourceRole: 'PARTICIPANT_REFERENCE', conceptId: null, senseGloss: 'first-person plural participant reference', confidence: 1 },
      { key: 'authority', tokenIds: [authority], sourceRole: 'CONTENT', conceptId: 'wsi:concept/authority', senseGloss: 'authority or power in relation to another party', confidence: 0.98 },
      { key: 'contrast-marker', tokenIds: [contrast], sourceRole: 'STRUCTURAL', conceptId: null, senseGloss: 'corrective contrast marker', confidence: 0.99 }
    ],
    frames: [
      { key: 'transgression-state', frameType: 'STATE', predicateRelationId: 'wsi:relation/has-state', roleBindings: [{ role: 'STATE_BEARER', participantKey: 'you' }], conceptKeys: ['transgression'], polarity: 'AFFIRMED', modality: 'ASSERTED', speechAct: 'STATEMENT', evidenceTokenIds: [youState, transgression], confidence: 0.98 },
      { key: 'authority-relation', frameType: 'RELATION', predicateRelationId: 'wsi:relation/authority-over', roleBindings: [{ role: 'HOLDER', participantKey: 'we' }, { role: 'TARGET', participantKey: 'you' }], conceptKeys: ['authority'], polarity: 'NEGATED', modality: 'ASSERTED', speechAct: 'STATEMENT', evidenceTokenIds: [we, you, authority], confidence: 0.97 }
    ]
  }

  return { analysis, proposals }
}

test('M5 separates participant references from semantic keys', async () => {
  const { analysis, proposals } = await saffat37_30()
  const candidate = compileSemanticCandidate({ linguisticAnalysis: analysis, registry, proposals })

  assert.equal(candidate.status, 'PARTIAL')
  assert.deepEqual(candidate.semanticKeys.map((item) => item.displayKey), ['AUTHORITY', 'TRANSGRESSION'])
  assert.equal(candidate.semanticKeys.some((item) => item.tokenIds.includes(tokenId(analysis, 'لَنَا'))), false)
  assert.ok(candidate.excludedSemanticKeys.some((item) => item.proposalKey === 'we-reference' && item.reason === 'PARTICIPANT_REFERENCE'))
  assert.ok(candidate.excludedSemanticKeys.some((item) => item.proposalKey === 'contrast-marker' && item.reason === 'STRUCTURAL_MARKER'))
  assert.equal(candidate.participants.length, 2)
  assert.equal(candidate.frames.length, 2)
  assert.ok(candidate.frames.every((item) => item.reviewStatus === 'CANDIDATE'))

  assert.equal(validateSchema(candidate), true, JSON.stringify(validateSchema.errors, null, 2))
  const report = validateSemanticCandidate(candidate, analysis, registry)
  assert.equal(report.valid, true, JSON.stringify(report.findings, null, 2))
})

test('candidate ID is deterministic across proposal array ordering', async () => {
  const { analysis, proposals } = await saffat37_30()
  const first = compileSemanticCandidate({ linguisticAnalysis: analysis, registry, proposals })
  const second = compileSemanticCandidate({
    linguisticAnalysis: analysis,
    registry,
    proposals: {
      ...proposals,
      participants: [...proposals.participants].reverse(),
      concepts: [...proposals.concepts].reverse(),
      frames: [...proposals.frames].reverse(),
    },
  })
  assert.equal(first.candidateId, second.candidateId)
  assert.deepEqual(first.semanticKeys, second.semanticKeys)
})

test('نا / first-person plural participant reference is excluded from semantic keys', async () => {
  const analysis = await arabicBaselineAnalyzer.analyze({
    provider: 'fixture-provider',
    providerRevision: 'rev-37-164',
    resourceId: 'fixture:quran:37:164',
    text: 'وَمَا مِنَّا إِلَّا لَهُ مَقَامٌ مَعْلُومٌ',
    language: 'ar',
    script: 'Arab',
  })
  const weToken = tokenId(analysis, 'مِنَّا')
  const candidate = compileSemanticCandidate({
    linguisticAnalysis: analysis,
    registry,
    proposals: {
      proposer: { id: 'wsi:semantic-proposer/test', version: '0.1.0', method: 'MANUAL' },
      participants: [{ key: 'speaker-group', tokenIds: [weToken], entityType: 'GROUP', discourseRoles: ['SPEAKER'], resolutionStatus: 'UNRESOLVED', confidence: 0.99 }],
      concepts: [{ key: 'we-pronoun', tokenIds: [weToken], sourceRole: 'PARTICIPANT_REFERENCE', conceptId: 'wsi:concept/authority', senseGloss: 'participant reference, intentionally not a semantic key', confidence: 0.99 }],
      frames: [],
    },
  })
  assert.equal(candidate.semanticKeys.length, 0)
  assert.equal(candidate.status, 'UNRESOLVED')
  assert.equal(candidate.excludedSemanticKeys[0]?.reason, 'PARTICIPANT_REFERENCE')
})

test('unresolved content concept remains visible without becoming a semantic key', async () => {
  const analysis = await arabicBaselineAnalyzer.analyze({
    provider: 'fixture-provider', providerRevision: 'rev', resourceId: 'fixture:ar:unresolved',
    text: 'مَعْنًى', language: 'ar', script: 'Arab',
  })
  const token = analysis.tokens[0]
  assert.ok(token)
  const candidate = compileSemanticCandidate({
    linguisticAnalysis: analysis,
    registry,
    proposals: {
      proposer: { id: 'wsi:semantic-proposer/test', version: '0.1.0', method: 'MANUAL' },
      participants: [],
      concepts: [{ key: 'unknown-sense', tokenIds: [token.id], sourceRole: 'CONTENT', conceptId: null, senseGloss: 'unresolved semantic sense', confidence: 0.5 }],
      frames: [],
    },
  })
  assert.equal(candidate.status, 'UNRESOLVED')
  assert.equal(candidate.conceptCandidates[0]?.exclusionReason, 'UNRESOLVED_CONCEPT')
  assert.equal(candidate.semanticKeys.length, 0)
})

test('compiler fails closed on unknown token references', async () => {
  const { analysis, proposals } = await saffat37_30()
  const broken = structuredClone(proposals)
  broken.concepts[0].tokenIds = ['T9999']
  assert.throws(() => compileSemanticCandidate({ linguisticAnalysis: analysis, registry, proposals: broken }), /unknown linguistic token/)
})
