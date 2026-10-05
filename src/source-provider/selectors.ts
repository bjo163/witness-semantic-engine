import type { SourceProviderFinding, SourceProviderResource, SourceSelector } from './types.js'

export interface SelectorVerificationResult {
  verified: boolean
  findings: SourceProviderFinding[]
}

function makeFinding(severity: SourceProviderFinding['severity'], code: string, path: string, message: string): SourceProviderFinding {
  return { severity, code, path, message }
}

export function verifySelectorAgainstResource(resource: SourceProviderResource, selector: SourceSelector, path = '/selector'): SelectorVerificationResult {
  const findings: SourceProviderFinding[] = []

  if (selector.type === 'RESOURCE_ONLY') return { verified: true, findings }

  if (selector.type === 'TOKEN_IDS') {
    if ((selector.token_ids ?? []).length === 0) {
      findings.push(makeFinding('error', 'TOKEN_SELECTOR_EMPTY', path, 'TOKEN_IDS selector requires at least one token ID.'))
      return { verified: false, findings }
    }
    findings.push(makeFinding('warning', 'TOKEN_SELECTOR_NOT_LIVE_VERIFIED', path, 'Token IDs are not live-verified unless the provider exposes a compatible token index.'))
    return { verified: false, findings }
  }

  if (typeof resource.text !== 'string') {
    findings.push(makeFinding('error', 'RESOURCE_TEXT_UNAVAILABLE', path, `Resource ${resource.id} has no textual content for ${selector.type}.`))
    return { verified: false, findings }
  }

  const text = resource.text

  if (selector.type === 'TEXT_QUOTE') {
    const exact = selector.exact ?? ''
    if (!exact) {
      findings.push(makeFinding('error', 'TEXT_QUOTE_EMPTY', path, 'TEXT_QUOTE selector requires a non-empty exact value.'))
      return { verified: false, findings }
    }
    const index = text.indexOf(exact)
    if (index < 0) {
      findings.push(makeFinding('error', 'TEXT_QUOTE_NOT_FOUND', path, `Exact quote was not found in resource ${resource.id} at revision ${resource.revision}.`))
      return { verified: false, findings }
    }
    if (selector.prefix) {
      const before = text.slice(Math.max(0, index - selector.prefix.length), index)
      if (before !== selector.prefix) findings.push(makeFinding('error', 'TEXT_QUOTE_PREFIX_MISMATCH', path, 'TEXT_QUOTE prefix does not match.'))
    }
    if (selector.suffix) {
      const start = index + exact.length
      if (text.slice(start, start + selector.suffix.length) !== selector.suffix) findings.push(makeFinding('error', 'TEXT_QUOTE_SUFFIX_MISMATCH', path, 'TEXT_QUOTE suffix does not match.'))
    }
    return { verified: !findings.some((item) => item.severity === 'error'), findings }
  }

  const start = selector.start
  const end = selector.end
  if (!Number.isInteger(start) || !Number.isInteger(end) || Number(start) < 0 || Number(end) <= Number(start)) {
    findings.push(makeFinding('error', 'CHAR_RANGE_INVALID', path, 'CHAR_RANGE requires integer offsets with 0 <= start < end.'))
    return { verified: false, findings }
  }
  if (Number(end) > text.length) {
    findings.push(makeFinding('error', 'CHAR_RANGE_OUT_OF_BOUNDS', path, `CHAR_RANGE end ${end} exceeds text length ${text.length}.`))
    return { verified: false, findings }
  }
  if (selector.exact != null && text.slice(Number(start), Number(end)) !== selector.exact) {
    findings.push(makeFinding('error', 'CHAR_RANGE_TEXT_MISMATCH', path, 'CHAR_RANGE exact value does not match.'))
  }
  return { verified: !findings.some((item) => item.severity === 'error'), findings }
}
