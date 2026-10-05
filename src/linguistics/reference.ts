import { BaselineLinguisticAnalyzer } from './baseline.js'
import type { LinguisticAnalyzer, LinguisticAnalyzerInput } from './types.js'

export const arabicBaselineAnalyzer = new BaselineLinguisticAnalyzer({
  id: 'wsi:linguistic-analyzer/arabic-baseline',
  description: 'Arabic-script baseline analyzer for deterministic tokenization and Unicode normalization.',
  languages: ['ar'],
  scripts: ['Arab'],
})

export const hebrewBaselineAnalyzer = new BaselineLinguisticAnalyzer({
  id: 'wsi:linguistic-analyzer/hebrew-baseline',
  description: 'Hebrew-script baseline analyzer for deterministic tokenization and Unicode normalization.',
  languages: ['he'],
  scripts: ['Hebr'],
})

export const greekBaselineAnalyzer = new BaselineLinguisticAnalyzer({
  id: 'wsi:linguistic-analyzer/greek-baseline',
  description: 'Greek-script baseline analyzer for deterministic tokenization and Unicode normalization.',
  languages: ['grc', 'el'],
  scripts: ['Grek'],
})

export const genericBaselineAnalyzer = new BaselineLinguisticAnalyzer({
  id: 'wsi:linguistic-analyzer/generic-baseline',
  description: 'Language-neutral fallback analyzer for deterministic Unicode tokenization and normalization.',
  languages: ['*'],
  scripts: ['*'],
})

export const defaultLinguisticAnalyzers: readonly LinguisticAnalyzer[] = [
  arabicBaselineAnalyzer,
  hebrewBaselineAnalyzer,
  greekBaselineAnalyzer,
  genericBaselineAnalyzer,
]

export function selectLinguisticAnalyzer(
  input: LinguisticAnalyzerInput,
  analyzers: readonly LinguisticAnalyzer[] = defaultLinguisticAnalyzers,
): LinguisticAnalyzer {
  for (const analyzer of analyzers) {
    if (analyzer.supports(input).status === 'SUPPORTED') return analyzer
  }
  return genericBaselineAnalyzer
}
