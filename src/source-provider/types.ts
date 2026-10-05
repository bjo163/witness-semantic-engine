export type SourceProviderFindingSeverity = 'error' | 'warning' | 'info'

export interface SourceProviderFinding {
  severity: SourceProviderFindingSeverity
  code: string
  path: string
  message: string
}

export interface SourceSelector {
  type: 'RESOURCE_ONLY' | 'TEXT_QUOTE' | 'CHAR_RANGE' | 'TOKEN_IDS'
  exact?: string | null
  prefix?: string | null
  suffix?: string | null
  start?: number | null
  end?: number | null
  token_ids?: string[]
}

export interface SourceProviderRevision {
  requested: string
  resolved: string | null
  exists: boolean
}

export interface SourceProviderResource {
  id: string
  kind: string
  revision: string
  provider: string
  text?: string
  language?: string
  script?: string
  sourcePath?: string
  raw?: unknown
}

export interface ResolveResourceRequest {
  revision: string
  resourceId: string
  hints?: Record<string, string | undefined>
}

export interface SourceProvider {
  readonly id: string
  readonly contract: string

  verifyRevision(revision: string): Promise<SourceProviderRevision>
  currentRevision(): Promise<string | null>
  resolveResource(request: ResolveResourceRequest): Promise<SourceProviderResource | null>
}

export interface SourceVerificationReport {
  valid: boolean
  errors: number
  warnings: number
  findings: SourceProviderFinding[]
  verifiedBindings: number
  verifiedResources: number
  verifiedSelectors: number
}
