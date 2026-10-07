import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import type {
  ResolveResourceRequest,
  SourceProvider,
  SourceProviderResource,
  SourceProviderRevision,
} from './types.js'

interface RgblRepositoryProviderOptions {
  rootDir: string
  fallbackToFullScan?: boolean
  maxBufferBytes?: number
}

type JsonObject = Record<string, any>

export class RgblRepositoryProvider implements SourceProvider {
  readonly id = 'rocksoul-rgbl'
  readonly contract = 'moonwitness-corpus/v0.1'

  private readonly rootDir: string
  private readonly fallbackToFullScan: boolean
  private readonly maxBufferBytes: number
  private readonly fileCache = new Map<string, Map<string, SourceProviderResource>>()
  private readonly treeCache = new Map<string, string[]>()

  constructor(options: RgblRepositoryProviderOptions) {
    this.rootDir = resolve(options.rootDir)
    this.fallbackToFullScan = options.fallbackToFullScan ?? true
    this.maxBufferBytes = options.maxBufferBytes ?? 128 * 1024 * 1024
    if (!existsSync(this.rootDir)) throw new Error(`RGBL repository path does not exist: ${this.rootDir}`)
  }

  private git(args: string[]): string {
    return execFileSync('git', ['-C', this.rootDir, ...args], {
      encoding: 'utf8',
      maxBuffer: this.maxBufferBytes,
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trimEnd()
  }

  async verifyRevision(revision: string): Promise<SourceProviderRevision> {
    try {
      const resolved = this.git(['rev-parse', '--verify', `${revision}^{commit}`]).trim()
      return { requested: revision, resolved, exists: true }
    } catch {
      return { requested: revision, resolved: null, exists: false }
    }
  }

  async currentRevision(): Promise<string | null> {
    try {
      return this.git(['rev-parse', 'HEAD']).trim()
    } catch {
      return null
    }
  }

  private resourceFiles(revision: string): string[] {
    const cached = this.treeCache.get(revision)
    if (cached) return cached

    const raw = this.git(['ls-tree', '-r', '--name-only', revision, '--', 'datasets'])
    const files = raw
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => /^datasets\/[^/]+\/data\/core\/resources\/.*\.jsonl$/.test(line))
      .sort()
    this.treeCache.set(revision, files)
    return files
  }

  private orderedCandidateFiles(revision: string, datasetHint?: string): string[] {
    const files = this.resourceFiles(revision)
    if (!datasetHint) return files
    const prefix = `datasets/${datasetHint}/data/core/resources/`
    const preferred = files.filter((path) => path.startsWith(prefix))
    if (!this.fallbackToFullScan) return preferred
    const preferredSet = new Set(preferred)
    return [...preferred, ...files.filter((path) => !preferredSet.has(path))]
  }

  private parseResource(raw: JsonObject, revision: string, sourcePath: string): SourceProviderResource | null {
    if (typeof raw.id !== 'string' || typeof raw.kind !== 'string') return null
    const textual = raw.extensions?.textual
    return {
      id: raw.id,
      kind: raw.kind,
      revision,
      provider: this.id,
      text: typeof textual?.text === 'string' ? textual.text : undefined,
      language: typeof textual?.language === 'string' ? textual.language : undefined,
      script: typeof textual?.script === 'string' ? textual.script : undefined,
      sourcePath,
      raw,
    }
  }

  private loadResourceFile(revision: string, sourcePath: string): Map<string, SourceProviderResource> {
    const cacheKey = `${revision}:${sourcePath}`
    const cached = this.fileCache.get(cacheKey)
    if (cached) return cached

    const text = this.git(['show', `${revision}:${sourcePath}`])
    const resources = new Map<string, SourceProviderResource>()
    for (const [lineIndex, line] of text.split('\n').entries()) {
      const trimmed = line.trim()
      if (!trimmed) continue
      try {
        const parsed = JSON.parse(trimmed) as JsonObject
        const resource = this.parseResource(parsed, revision, sourcePath)
        if (resource) resources.set(resource.id, resource)
      } catch (error) {
        throw new Error(`Invalid RGBL JSONL at ${sourcePath}:${lineIndex + 1}: ${String(error)}`)
      }
    }
    this.fileCache.set(cacheKey, resources)
    return resources
  }

  async resolveResource(request: ResolveResourceRequest): Promise<SourceProviderResource | null> {
    const revision = await this.verifyRevision(request.revision)
    if (!revision.exists || !revision.resolved) return null

    const datasetHint = request.hints?.dataset
    for (const sourcePath of this.orderedCandidateFiles(revision.resolved, datasetHint)) {
      const resource = this.loadResourceFile(revision.resolved, sourcePath).get(request.resourceId)
      if (resource) return resource
    }
    return null
  }
}
