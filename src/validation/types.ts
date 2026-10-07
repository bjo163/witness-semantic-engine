export type FindingSeverity = 'error' | 'warning' | 'info'

export interface Finding {
  severity: FindingSeverity
  code: string
  path: string
  message: string
}

export interface ValidationReport {
  valid: boolean
  errors: number
  warnings: number
  findings: Finding[]
  passes: string[]
}

export interface ProviderResourceIndexEntry {
  id: string
  kind: string
}

export interface ProviderCatalog {
  provider: string
  provider_contract: string
  repository?: string
  provider_revision: string
  coverage: 'PARTIAL' | 'FULL'
  resources: ProviderResourceIndexEntry[]
  notes?: string[]
}

export interface ValidationContext {
  rootDir: string
  schema: Record<string, unknown>
  controlled: Record<string, string[]>
  conceptIds: Set<string>
  relationIds: Set<string>
  witnessPatterns: Map<string, {
    allowed_responses?: Array<{ id: string; target_concept_id?: string }>
  }>
  providerCatalogs: Map<string, ProviderCatalog>
}
