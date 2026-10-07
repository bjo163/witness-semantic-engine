import type {
  SourceProvider,
  SourceProviderFinding,
  SourceProviderResource,
  SourceSelector,
  SourceVerificationReport,
} from './types.js'
import { verifySelectorAgainstResource } from './selectors.js'

type AnyRecord = Record<string, any>

interface EvidenceRef {
  value: {
    source_binding_id: string
    resource_id: string
    selector: SourceSelector
  }
  path: string
}

function makeFinding(
  severity: SourceProviderFinding['severity'],
  code: string,
  path: string,
  message: string,
): SourceProviderFinding {
  return { severity, code, path, message }
}

function collectEvidence(value: unknown, path = ''): EvidenceRef[] {
  const refs: EvidenceRef[] = []
  if (Array.isArray(value)) {
    for (const [index, item] of value.entries()) refs.push(...collectEvidence(item, `${path}/${index}`))
    return refs
  }
  if (!value || typeof value !== 'object') return refs

  const object = value as AnyRecord
  if (
    typeof object.source_binding_id === 'string' &&
    typeof object.resource_id === 'string' &&
    object.selector &&
    typeof object.selector === 'object' &&
    typeof object.selector.type === 'string'
  ) {
    refs.push({ value: object as EvidenceRef['value'], path })
  }

  for (const [key, child] of Object.entries(object)) refs.push(...collectEvidence(child, `${path}/${key}`))
  return refs
}

function datasetHint(binding: AnyRecord): string | undefined {
  const value = binding?.metadata?.dataset
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

function report(findings: SourceProviderFinding[], bindings: number, resources: number, selectors: number): SourceVerificationReport {
  const ordered = [...findings].sort((a, b) =>
    a.path.localeCompare(b.path) || a.code.localeCompare(b.code) || a.message.localeCompare(b.message),
  )
  const errors = ordered.filter((item) => item.severity === 'error').length
  const warnings = ordered.filter((item) => item.severity === 'warning').length
  return {
    valid: errors === 0,
    errors,
    warnings,
    findings: ordered,
    verifiedBindings: bindings,
    verifiedResources: resources,
    verifiedSelectors: selectors,
  }
}

export async function verifyAnalysisSources(
  record: unknown,
  providers: Map<string, SourceProvider>,
): Promise<SourceVerificationReport> {
  const findings: SourceProviderFinding[] = []
  if (!record || typeof record !== 'object') {
    return report([makeFinding('error', 'ANALYSIS_RECORD_INVALID', '/', 'Analysis record must be an object.')], 0, 0, 0)
  }

  const analysis = record as AnyRecord
  const bindings = Array.isArray(analysis.source_bindings) ? analysis.source_bindings as AnyRecord[] : []
  const bindingById = new Map(bindings.filter((item) => typeof item?.id === 'string').map((item) => [item.id, item]))
  const resourceCache = new Map<string, SourceProviderResource | null>()
  const bindingHasError = new Set<string>()
  let verifiedBindings = 0
  let verifiedResources = 0
  let verifiedSelectors = 0

  async function resolve(binding: AnyRecord, resourceId: string): Promise<SourceProviderResource | null> {
    const key = `${binding.id}:${resourceId}`
    if (resourceCache.has(key)) return resourceCache.get(key) ?? null
    const provider = providers.get(binding.provider)
    if (!provider) return null
    const value = await provider.resolveResource({
      revision: binding.provider_revision,
      resourceId,
      hints: { dataset: datasetHint(binding) },
    })
    resourceCache.set(key, value)
    if (value) verifiedResources += 1
    return value
  }

  for (const [index, binding] of bindings.entries()) {
    const path = `/source_bindings/${index}`
    const provider = providers.get(binding.provider)
    if (!provider) {
      findings.push(makeFinding('error', 'SOURCE_PROVIDER_UNAVAILABLE', path, `No runtime SourceProvider is configured for ${String(binding.provider)}.`))
      bindingHasError.add(String(binding.id))
      continue
    }

    if (binding.provider_contract !== provider.contract) {
      findings.push(
        makeFinding(
          'error',
          'SOURCE_PROVIDER_CONTRACT_MISMATCH',
          `${path}/provider_contract`,
          `Binding expects ${String(binding.provider_contract)} but provider implements ${provider.contract}.`,
        ),
      )
      bindingHasError.add(String(binding.id))
    }

    const revision = await provider.verifyRevision(String(binding.provider_revision ?? ''))
    if (!revision.exists || !revision.resolved) {
      findings.push(makeFinding('error', 'PROVIDER_REVISION_NOT_FOUND', `${path}/provider_revision`, `Pinned provider revision ${String(binding.provider_revision)} cannot be resolved.`))
      bindingHasError.add(String(binding.id))
      continue
    }

    const current = await provider.currentRevision()
    if (current && current !== revision.resolved) {
      findings.push(
        makeFinding(
          'info',
          'PROVIDER_HEAD_MOVED',
          `${path}/provider_revision`,
          `Provider checkout HEAD is ${current.slice(0, 12)} while analysis remains pinned to ${revision.resolved.slice(0, 12)}. The pinned snapshot remains authoritative.`,
        ),
      )
    }

    const resourceIds = Array.isArray(binding.resource_ids) ? binding.resource_ids.filter((id: unknown): id is string => typeof id === 'string') : []
    for (const [resourceIndex, resourceId] of resourceIds.entries()) {
      const resource = await resolve(binding, resourceId)
      if (!resource) {
        findings.push(makeFinding('error', 'PROVIDER_RESOURCE_NOT_FOUND', `${path}/resource_ids/${resourceIndex}`, `Resource ${resourceId} was not found at pinned revision ${revision.resolved}.`))
        bindingHasError.add(String(binding.id))
      }
    }

    if (!bindingHasError.has(String(binding.id))) verifiedBindings += 1
  }

  const target = analysis.analysis_target
  if (target && typeof target === 'object') {
    const binding = bindingById.get(target.source_binding_id)
    if (!binding) {
      findings.push(makeFinding('error', 'ANALYSIS_TARGET_BINDING_NOT_FOUND', '/analysis_target/source_binding_id', `Binding ${String(target.source_binding_id)} does not exist.`))
    } else {
      const resource = await resolve(binding, String(target.resource_id))
      if (!resource) {
        findings.push(makeFinding('error', 'ANALYSIS_TARGET_NOT_RESOLVED', '/analysis_target/resource_id', `Analysis target ${String(target.resource_id)} could not be resolved live.`))
        bindingHasError.add(String(binding.id))
      }
    }
  }

  for (const evidence of collectEvidence(analysis)) {
    const binding = bindingById.get(evidence.value.source_binding_id)
    if (!binding) {
      findings.push(makeFinding('error', 'EVIDENCE_BINDING_NOT_FOUND', `${evidence.path}/source_binding_id`, `Evidence binding ${evidence.value.source_binding_id} does not exist.`))
      continue
    }

    const resource = await resolve(binding, evidence.value.resource_id)
    if (!resource) {
      findings.push(makeFinding('error', 'EVIDENCE_RESOURCE_NOT_RESOLVED', `${evidence.path}/resource_id`, `Evidence resource ${evidence.value.resource_id} could not be resolved live.`))
      bindingHasError.add(String(binding.id))
      continue
    }

    const selectorResult = verifySelectorAgainstResource(resource, evidence.value.selector, `${evidence.path}/selector`)
    findings.push(...selectorResult.findings)
    if (selectorResult.verified) verifiedSelectors += 1
    if (selectorResult.findings.some((item) => item.severity === 'error')) bindingHasError.add(String(binding.id))
  }

  for (const [index, binding] of bindings.entries()) {
    if (binding.resolution_status === 'RESOLVED' && bindingHasError.has(String(binding.id))) {
      findings.push(
        makeFinding(
          'error',
          'RESOLVED_BINDING_STALE',
          `/source_bindings/${index}/resolution_status`,
          `Binding ${String(binding.id)} claims RESOLVED but live verification found unresolved resource or selector evidence.`,
        ),
      )
    }
  }

  return report(findings, verifiedBindings, verifiedResources, verifiedSelectors)
}
