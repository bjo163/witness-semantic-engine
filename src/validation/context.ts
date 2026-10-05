import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { ProviderCatalog, ValidationContext } from './types.js'

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T
}

export function findRepositoryRoot(start = process.cwd()): string {
  let current = resolve(start)
  while (true) {
    if (existsSync(join(current, 'spec', 'wsi-record.schema.json'))) return current
    const parent = resolve(current, '..')
    if (parent === current) {
      throw new Error(`Unable to locate repository root from ${start}`)
    }
    current = parent
  }
}

export function loadValidationContext(rootDir = findRepositoryRoot()): ValidationContext {
  const schema = readJson<Record<string, unknown>>(join(rootDir, 'spec', 'wsi-record.schema.json'))
  const controlledFile = readJson<{ registries: Record<string, string[]> }>(
    join(rootDir, 'registries', 'controlled-vocabularies.json'),
  )
  const conceptsFile = readJson<{ concepts: Array<{ id: string }> }>(join(rootDir, 'registries', 'concepts.json'))
  const relationsFile = readJson<{ relations: Array<{ id: string }> }>(join(rootDir, 'registries', 'relations.json'))
  const witnessFile = readJson<{
    patterns: Array<{
      id: string
      allowed_responses?: Array<{ id: string; target_concept_id?: string }>
    }>
  }>(join(rootDir, 'registries', 'witness-patterns.json'))

  const providerCatalogs = new Map<string, ProviderCatalog>()
  const providerDir = join(rootDir, 'spec', 'providers')
  if (existsSync(providerDir)) {
    for (const filename of readdirSync(providerDir).filter((name) => name.endsWith('.json')).sort()) {
      const catalog = readJson<ProviderCatalog>(join(providerDir, filename))
      providerCatalogs.set(catalog.provider, catalog)
    }
  }

  return {
    rootDir,
    schema,
    controlled: controlledFile.registries,
    conceptIds: new Set(conceptsFile.concepts.map((concept) => concept.id)),
    relationIds: new Set(relationsFile.relations.map((relation) => relation.id)),
    witnessPatterns: new Map(witnessFile.patterns.map((pattern) => [pattern.id, pattern])),
    providerCatalogs,
  }
}

export function readAnalysisFile(path: string): unknown {
  return readJson(resolve(path))
}
