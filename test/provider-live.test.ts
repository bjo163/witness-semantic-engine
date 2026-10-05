import assert from 'node:assert/strict'
import { test } from 'node:test'
import { join } from 'node:path'
import { RgblRepositoryProvider } from '../src/source-provider/rgbl-repository.js'
import { verifyAnalysisSources } from '../src/source-provider/verify.js'
import { loadValidationContext, readAnalysisFile } from '../src/validation/context.js'

const providerRoot = process.env.RGBL_REPO_PATH
const pinnedRevision = 'df00706c98e21fb3fb0146b8389b0f2978f3d833'

if (!providerRoot) {
  test('live RGBL integration requires RGBL_REPO_PATH', { skip: 'RGBL_REPO_PATH is not set' }, () => {})
} else {
  const provider = new RgblRepositoryProvider({ rootDir: providerRoot })

  test('real RGBL pinned revision verifies the 37:30 WSI evidence anchors', async () => {
    const ctx = loadValidationContext()
    const record = readAnalysisFile(join(ctx.rootDir, 'data', 'golden-candidates', 'quran', '037', '030.json'))
    const source = await provider.resolveResource({
      revision: pinnedRevision,
      resourceId: 'mw:content:quran:37:30:ar-uthmani',
      hints: { dataset: 'quran-tanzil-uthmani' },
    })
    assert.equal(source?.kind, 'textual.content')
    assert.ok(source?.text)

    const report = await verifyAnalysisSources(record, new Map([[provider.id, provider]]))
    assert.equal(
      report.valid,
      true,
      `${JSON.stringify(report.findings, null, 2)}\nPinned source text: ${source?.text ?? '<unavailable>'}`,
    )
    assert.ok(report.verifiedResources >= 2)
    assert.ok(report.verifiedSelectors >= 1)
  })

  test('same SourceProvider resolves a structurally different non-Quran RGBL resource', async () => {
    const revision = await provider.verifyRevision(pinnedRevision)
    assert.equal(revision.exists, true)

    const passage = await provider.resolveResource({
      revision: pinnedRevision,
      resourceId: 'mw:passage:hinduism:bhagavad-gita:1:1',
      hints: { dataset: 'bhagavad-gita' },
    })
    const content = await provider.resolveResource({
      revision: pinnedRevision,
      resourceId: 'mw:content:hinduism:bhagavad-gita:1:1:sa',
      hints: { dataset: 'bhagavad-gita' },
    })

    assert.equal(passage?.kind, 'textual.passage')
    assert.equal(content?.kind, 'textual.content')
    assert.equal(content?.language, 'sa')
    assert.equal(content?.script, 'Deva')
    assert.ok(content?.text?.includes('धर्मक्षेत्रे'))
  })
}
