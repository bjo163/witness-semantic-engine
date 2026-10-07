import assert from 'node:assert/strict'
import { test } from 'node:test'
import type {
  ResolveResourceRequest,
  SourceProvider,
  SourceProviderResource,
  SourceProviderRevision,
} from '../src/source-provider/types.js'
import { verifyAnalysisSources } from '../src/source-provider/verify.js'

class MemoryProvider implements SourceProvider {
  readonly id = 'memory'
  readonly contract = 'memory/v1'
  constructor(private readonly resources: Map<string, SourceProviderResource>) {}

  async verifyRevision(revision: string): Promise<SourceProviderRevision> {
    return { requested: revision, resolved: revision === 'rev-1' ? revision : null, exists: revision === 'rev-1' }
  }

  async currentRevision(): Promise<string | null> {
    return 'rev-2'
  }

  async resolveResource(request: ResolveResourceRequest): Promise<SourceProviderResource | null> {
    if (request.revision !== 'rev-1') return null
    return this.resources.get(request.resourceId) ?? null
  }
}

function fixture(selector: Record<string, unknown>, resourceId = 'ext:content:1'): any {
  return {
    analysis_target: { source_binding_id: 'S1', resource_id: 'ext:passage:1' },
    source_bindings: [{
      id: 'S1',
      provider: 'memory',
      provider_contract: 'memory/v1',
      provider_revision: 'rev-1',
      primary_resource_id: 'ext:passage:1',
      resource_ids: ['ext:passage:1', 'ext:content:1'],
      resolution_status: 'RESOLVED',
      metadata: {},
    }],
    frames: [{
      id: 'F1',
      evidence: [{
        source_binding_id: 'S1',
        resource_id: resourceId,
        source_class: 'PRIMARY_TEXT',
        derivation_type: 'DIRECT',
        selector,
      }],
    }],
  }
}

function provider(): MemoryProvider {
  return new MemoryProvider(new Map([
    ['ext:passage:1', { id: 'ext:passage:1', kind: 'textual.passage', revision: 'rev-1', provider: 'memory' }],
    ['ext:content:1', { id: 'ext:content:1', kind: 'textual.content', revision: 'rev-1', provider: 'memory', text: 'alpha beta gamma' }],
  ]))
}

test('live verifier accepts an exact quote at the pinned provider revision', async () => {
  const report = await verifyAnalysisSources(fixture({ type: 'TEXT_QUOTE', exact: 'beta' }), new Map([['memory', provider()]]))
  assert.equal(report.valid, true, JSON.stringify(report.findings, null, 2))
  assert.ok(report.findings.some((item) => item.code === 'PROVIDER_HEAD_MOVED'))
  assert.equal(report.verifiedSelectors, 1)
})

test('live verifier rejects a quote absent from provider content', async () => {
  const report = await verifyAnalysisSources(fixture({ type: 'TEXT_QUOTE', exact: 'delta' }), new Map([['memory', provider()]]))
  assert.equal(report.valid, false)
  assert.ok(report.findings.some((item) => item.code === 'TEXT_QUOTE_NOT_FOUND'))
  assert.ok(report.findings.some((item) => item.code === 'RESOLVED_BINDING_STALE'))
})

test('live verifier rejects missing evidence resources and marks claimed resolved binding stale', async () => {
  const report = await verifyAnalysisSources(fixture({ type: 'RESOURCE_ONLY' }, 'ext:content:missing'), new Map([['memory', provider()]]))
  assert.equal(report.valid, false)
  assert.ok(report.findings.some((item) => item.code === 'EVIDENCE_RESOURCE_NOT_RESOLVED'))
  assert.ok(report.findings.some((item) => item.code === 'RESOLVED_BINDING_STALE'))
})

test('live verifier checks character ranges against provider content', async () => {
  const report = await verifyAnalysisSources(fixture({ type: 'CHAR_RANGE', start: 6, end: 10, exact: 'beta' }), new Map([['memory', provider()]]))
  assert.equal(report.valid, true, JSON.stringify(report.findings, null, 2))
  assert.equal(report.verifiedSelectors, 1)
})
