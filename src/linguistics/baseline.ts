import { createHash } from 'node:crypto'
import type {
  LinguisticAnalysis,
  LinguisticAnalyzer,
  LinguisticAnalyzerDescriptor,
  LinguisticAnalyzerInput,
  LinguisticCapabilities,
  LinguisticToken,
  LinguisticTokenKind,
} from './types.js'

const TOKEN_PATTERN = /[\p{L}\p{M}]+(?:['’־][\p{L}\p{M}]+)*|\p{N}+(?:[.,]\p{N}+)*|[^\p{L}\p{M}\p{N}\s]/gu
const WORD_PATTERN = /^[\p{L}\p{M}]+(?:['’־][\p{L}\p{M}]+)*$/u
const NUMBER_PATTERN = /^\p{N}+(?:[.,]\p{N}+)*$/u
const PUNCT_PATTERN = /^\p{P}+$/u
const SYMBOL_PATTERN = /^\p{S}+$/u

const baselineCapabilities: LinguisticCapabilities = {
  TOKENIZATION: 'SUPPORTED',
  NORMALIZATION: 'SUPPORTED',
  SENTENCE_SEGMENTATION: 'UNSUPPORTED',
  LEMMA: 'UNSUPPORTED',
  POS: 'UNSUPPORTED',
  MORPHOLOGY: 'UNSUPPORTED',
  SYNTAX: 'UNSUPPORTED',
  DISCOURSE_CUES: 'UNSUPPORTED',
}

const unsupportedCapabilities: LinguisticCapabilities = {
  TOKENIZATION: 'UNSUPPORTED',
  NORMALIZATION: 'UNSUPPORTED',
  SENTENCE_SEGMENTATION: 'UNSUPPORTED',
  LEMMA: 'UNSUPPORTED',
  POS: 'UNSUPPORTED',
  MORPHOLOGY: 'UNSUPPORTED',
  SYNTAX: 'UNSUPPORTED',
  DISCOURSE_CUES: 'UNSUPPORTED',
}

function sha256(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex')
}

function analysisId(input: LinguisticAnalyzerInput, descriptor: LinguisticAnalyzerDescriptor): string {
  const identity = JSON.stringify({
    provider: input.provider,
    providerRevision: input.providerRevision,
    resourceId: input.resourceId,
    contentSha256: sha256(input.text),
    language: input.language ?? null,
    script: input.script ?? null,
    analyzerId: descriptor.id,
    analyzerVersion: descriptor.version,
    contractVersion: descriptor.contractVersion,
    rulesetVersion: descriptor.rulesetVersion,
  })
  return `wsi:linguistic-analysis/sha256-${sha256(identity)}`
}

function tokenKind(surface: string): LinguisticTokenKind {
  if (WORD_PATTERN.test(surface)) return 'WORD'
  if (NUMBER_PATTERN.test(surface)) return 'NUMBER'
  if (PUNCT_PATTERN.test(surface)) return 'PUNCT'
  if (SYMBOL_PATTERN.test(surface)) return 'SYMBOL'
  return 'OTHER'
}

function tokenize(text: string): LinguisticToken[] {
  const tokens: LinguisticToken[] = []
  let lastCodeUnit = 0
  let codePointCursor = 0

  for (const [index, match] of [...text.matchAll(TOKEN_PATTERN)].entries()) {
    const codeUnitStart = match.index ?? 0
    const surface = match[0]
    const gap = text.slice(lastCodeUnit, codeUnitStart)
    const start = codePointCursor + [...gap].length
    const end = start + [...surface].length

    tokens.push({
      id: `T${index + 1}`,
      span: { start, end, unit: 'UNICODE_CODE_POINT' },
      kind: tokenKind(surface),
      surface,
      normalized: {
        status: 'RESOLVED',
        value: surface.normalize('NFC'),
        scheme: 'Unicode-NFC',
        confidence: 1,
      },
      lemma: { status: 'UNSUPPORTED' },
      upos: { status: 'UNSUPPORTED' },
      xpos: { status: 'UNSUPPORTED' },
      features: { status: 'UNSUPPORTED' },
    })

    lastCodeUnit = codeUnitStart + surface.length
    codePointCursor = end
  }

  return tokens
}

interface BaselineAnalyzerOptions {
  id: string
  description: string
  languages: string[]
  scripts: string[]
  version?: string
  rulesetVersion?: string
}

export class BaselineLinguisticAnalyzer implements LinguisticAnalyzer {
  readonly descriptor: LinguisticAnalyzerDescriptor

  constructor(options: BaselineAnalyzerOptions) {
    this.descriptor = {
      id: options.id,
      version: options.version ?? '0.1.0',
      contractVersion: '0.1.0',
      description: options.description,
      languages: [...options.languages],
      scripts: [...options.scripts],
      capabilities: { ...baselineCapabilities },
      rulesetVersion: options.rulesetVersion ?? 'unicode-baseline-1',
    }
  }

  supports(input: LinguisticAnalyzerInput): { status: 'SUPPORTED' | 'UNSUPPORTED'; reason?: string } {
    if (this.descriptor.languages.includes('*') || this.descriptor.scripts.includes('*')) return { status: 'SUPPORTED' }

    const languageMatch = input.language ? this.descriptor.languages.includes(input.language) : false
    const scriptMatch = input.script ? this.descriptor.scripts.includes(input.script) : false
    if (languageMatch || scriptMatch) return { status: 'SUPPORTED' }

    return {
      status: 'UNSUPPORTED',
      reason: `Analyzer ${this.descriptor.id} does not declare support for language=${input.language ?? 'unknown'} script=${input.script ?? 'unknown'}.`,
    }
  }

  async analyze(input: LinguisticAnalyzerInput): Promise<LinguisticAnalysis> {
    const support = this.supports(input)
    const source = {
      provider: input.provider,
      providerRevision: input.providerRevision,
      resourceId: input.resourceId,
      contentSha256: sha256(input.text),
      ...(input.language ? { language: input.language } : {}),
      ...(input.script ? { script: input.script } : {}),
    }
    const analyzer = {
      analyzerId: this.descriptor.id,
      analyzerVersion: this.descriptor.version,
      contractVersion: this.descriptor.contractVersion,
      rulesetVersion: this.descriptor.rulesetVersion,
    }

    if (support.status === 'UNSUPPORTED') {
      return {
        contractVersion: '0.1.0',
        analysisId: analysisId(input, this.descriptor),
        status: 'UNSUPPORTED',
        source,
        analyzer,
        capabilities: { ...unsupportedCapabilities },
        tokens: [],
        dependencies: [],
        findings: [{
          severity: 'warning',
          code: 'ANALYZER_INPUT_UNSUPPORTED',
          message: support.reason ?? 'Analyzer input is unsupported.',
        }],
      }
    }

    const tokens = tokenize(input.text)
    return {
      contractVersion: '0.1.0',
      analysisId: analysisId(input, this.descriptor),
      status: 'PARTIAL',
      source,
      analyzer,
      capabilities: { ...baselineCapabilities },
      tokens,
      dependencies: [],
      findings: [
        {
          severity: 'info',
          code: 'BASELINE_ONLY',
          message: 'Baseline analyzer resolves Unicode tokenization and NFC normalization only; lemma, POS, morphology, syntax, sentence segmentation, and discourse cues remain explicitly unsupported.',
        },
      ],
    }
  }
}
