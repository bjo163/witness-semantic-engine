import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import { RgblRepositoryProvider } from '../src/source-provider/rgbl-repository.js'
import { selectLinguisticAnalyzer } from '../src/linguistics/reference.js'
import { validateLinguisticAnalysis } from '../src/linguistics/validate.js'
import { findRepositoryRoot } from '../src/validation/context.js'
import type { LinguisticCapabilityName, LinguisticCapabilityStatus } from '../src/linguistics/types.js'

interface GoldenProfile {
  id: string
  dataset: string
  resource_id: string
  language: string
  script: string
  expected_analyzer_id: string
  expected_status: 'COMPLETE' | 'PARTIAL' | 'UNSUPPORTED'
  required_capabilities: Partial<Record<LinguisticCapabilityName, LinguisticCapabilityStatus>>
}

interface GoldenSet {
  profile_version: string
  provider: string
  provider_revision: string
  profiles: GoldenProfile[]
}

const providerRoot = process.env.RGBL_REPO_PATH
const root = findRepositoryRoot()
const goldenSet = JSON.parse(
  readFileSync(join(root, 'data', 'linguistic-goldens', 'profiles.json'), 'utf8'),
) as GoldenSet

if (!providerRoot) {
  test('live linguistic goldens require RGBL_REPO_PATH', { skip: 'RGBL_REPO_PATH is not set' }, () => {})
} else {
  const provider = new RgblRepositoryProvider({ rootDir: providerRoot })

  for (const profile of goldenSet.profiles) {
    test(`live linguistic profile: ${profile.id}`, async () => {
      assert.equal(goldenSet.provider, provider.id)
      const revision = await provider.verifyRevision(goldenSet.provider_revision)
      assert.equal(revision.exists, true)

      const resource = await provider.resolveResource({
        revision: goldenSet.provider_revision,
        resourceId: profile.resource_id,
        hints: { dataset: profile.dataset },
      })
      assert.ok(resource, `Unable to resolve ${profile.resource_id}`)
      assert.equal(resource.kind, 'textual.content')
      assert.equal(resource.language, profile.language)
      assert.equal(resource.script, profile.script)
      assert.ok(resource.text && resource.text.length > 0, `No provider text for ${profile.resource_id}`)

      const input = {
        provider: provider.id,
        providerRevision: goldenSet.provider_revision,
        resourceId: profile.resource_id,
        text: resource.text,
        language: resource.language,
        script: resource.script,
      }
      const analyzer = selectLinguisticAnalyzer(input)
      assert.equal(analyzer.descriptor.id, profile.expected_analyzer_id)

      const analysis = await analyzer.analyze(input)
      assert.equal(analysis.status, profile.expected_status)
      assert.ok(analysis.tokens.length > 0, `${profile.id} should produce at least one token`)
      assert.ok(analysis.tokens.some((token) => token.kind === 'WORD'), `${profile.id} should produce a word token`)

      for (const [capability, expected] of Object.entries(profile.required_capabilities)) {
        assert.equal(
          analysis.capabilities[capability as LinguisticCapabilityName],
          expected,
          `${profile.id} capability ${capability}`,
        )
      }

      const report = validateLinguisticAnalysis(analysis)
      assert.equal(report.valid, true, JSON.stringify(report.findings, null, 2))
    })
  }
}
