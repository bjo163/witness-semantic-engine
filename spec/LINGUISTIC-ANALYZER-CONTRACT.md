# WSI Linguistic Analyzer Contract

**Contract revision:** `0.1.0`  
**WSI Machine Contract:** `0.2.0`

This contract defines the boundary between Source Provider content and linguistic analysis plugins.

A linguistic analyzer is an analysis tool. It is **not** source authority, semantic truth, ontology, or a scripture/corpus adapter.

---

## 1. Pipeline position

```text
SOURCE PROVIDER RESOURCE
  ↓
LINGUISTIC ANALYZER INPUT
  ↓
LINGUISTIC ANALYSIS CANDIDATE
  ↓
REVIEW / SEMANTIC FRAME ENGINE (later milestone)
```

The analyzer consumes provider-resolved text at a pinned provider revision.

It MUST NOT mint replacement source identities or rewrite the canonical provider content.

---

## 2. Provider-neutral input

Minimum runtime input:

```text
provider
providerRevision
resourceId
text
language? 
script?
```

`text` is runtime provider content. It is not persisted by this contract as a new canonical source copy.

The persisted linguistic result records a SHA-256 of the analyzed provider content so that the result can be invalidated if the exact input changes.

---

## 3. Analyzer interface

Conceptual TypeScript interface:

```text
LinguisticAnalyzer
  descriptor
  supports(input)
  analyze(input)
```

Analyzer selection MUST depend on linguistic metadata/capability, not scripture identity.

Invalid design:

```text
if resource is Quran → ArabicAnalyzer
if resource is Torah → HebrewAnalyzer
```

Preferred design:

```text
language=ar / script=Arab → analyzer declaring Arabic support
language=he / script=Hebr → analyzer declaring Hebrew support
language=grc / script=Grek → analyzer declaring Greek support
otherwise → generic fallback
```

---

## 4. Capability contract

Every analyzer result explicitly reports these capability states:

```text
TOKENIZATION
NORMALIZATION
SENTENCE_SEGMENTATION
LEMMA
POS
MORPHOLOGY
SYNTAX
DISCOURSE_CUES
```

Capability values:

```text
SUPPORTED
PARTIAL
UNSUPPORTED
```

Unsupported linguistic structure MUST NOT be invented merely to satisfy a schema.

---

## 5. Annotation state

Individual annotations use:

```text
RESOLVED
UNRESOLVED
UNSUPPORTED
```

These have distinct meanings:

- `RESOLVED` — analyzer produced a value under its declared method/ruleset;
- `UNRESOLVED` — analyzer supports this category but could not resolve the instance;
- `UNSUPPORTED` — this analyzer does not implement the category.

`UNRESOLVED` and `UNSUPPORTED` MUST NOT carry a fabricated value.

---

## 6. Token contract

Tokens contain:

```text
id
span
kind
surface
normalized
lemma
upos
xpos
features
```

Token spans use **Unicode code-point offsets**:

```text
unit = UNICODE_CODE_POINT
```

This avoids treating JavaScript UTF-16 code-unit offsets as a cross-language interchange standard.

The token surface is an analysis-local anchor to the provider input. It is not canonical source authority.

---

## 7. Morphology and syntax

The contract deliberately separates:

```text
surface
normalized form
lemma
universal POS candidate
language/treebank-specific POS candidate
morphological features
syntactic dependencies
```

A plugin MAY use Universal Dependencies-compatible UPOS, feature, and dependency labels when appropriate, but WSI does not declare UD output automatically correct merely because labels are syntactically valid.

When a scheme is used, the annotation SHOULD declare it, for example:

```text
scheme = UD-v2
```

Language-specific tagsets MAY be retained as `xpos` or plugin metadata rather than being forced into universal labels.

---

## 8. Provenance and deterministic identity

Every output records:

```text
analyzerId
analyzerVersion
contractVersion
rulesetVersion
optional model identity/version
provider
providerRevision
resourceId
contentSha256
```

The reference implementation derives `analysisId` deterministically from the source binding, exact content hash, language/script metadata, analyzer identity/version, contract version, and ruleset version.

Therefore the same input under the same analyzer contract produces the same analysis identity.

---

## 9. Baseline reference analyzers

M4 includes conservative baseline analyzers for:

```text
Arabic  ar / Arab
Hebrew  he / Hebr
Greek   grc, el / Grek
Generic fallback
```

The baseline implementation intentionally supports only:

```text
TOKENIZATION = SUPPORTED
NORMALIZATION = SUPPORTED
```

and explicitly returns `UNSUPPORTED` for lemma, POS, morphology, syntax, sentence segmentation, and discourse cues.

These are contract/reference plugins, not claims that linguistic analysis is complete.

Deeper language adapters can replace or extend them later without changing the universal interface.

---

## 10. Unicode normalization

The baseline analyzer provides NFC as an **analysis view** only:

```text
normalized.scheme = Unicode-NFC
```

It MUST NOT replace provider text or be used to make an inexact source evidence quote appear exact.

Provider-relative evidence verification remains literal unless the Source Provider contract explicitly defines another representation.

---

## 11. Linguistic goldens

The stratified golden profile set stores provider bindings and expected analyzer behavior, not duplicate canonical source text.

Current reference profiles cover:

```text
Arabic / Arab  — RGBL Quran resource
Hebrew / Hebr  — RGBL OSHB/WLC resource
Greek / Grek   — RGBL SBLGNT resource
Sanskrit / Deva — RGBL Bhagavad Gita resource through generic fallback
```

The live test resolves all text from the pinned RGBL revision, then runs it through the same `LinguisticAnalyzer` contract.

This proves cross-language contract behavior without turning a scripture title into an analyzer branch.

---

## 12. Separation from semantic truth

Linguistic output is not automatically promoted into:

```text
WSI lexical sense
participant
semantic role
frame
concept mapping
relation mapping
polarity
modality
direction assessment
Witness
```

Those remain downstream research/review objects.

```text
LINGUISTIC CANDIDATE != REVIEWED SEMANTIC ASSERTION
```

---

## 13. Validation invariants

At minimum:

```text
L01 analyzer result must declare contract version
L02 analysis ID must be deterministic and content-bound
L03 source content hash must be valid SHA-256
L04 token IDs must be unique
L05 token spans must use Unicode code points
L06 token spans must be monotonic and non-overlapping
L07 surface code-point length must match its span
L08 resolved annotations require a value
L09 unresolved/unsupported annotations cannot carry a value
L10 dependency references must point to existing tokens
L11 unsupported tokenization cannot emit tokens
L12 unsupported syntax cannot emit dependencies
L13 unsupported analysis cannot invent structure
```

---

## 14. M4 acceptance

M4 technical acceptance requires:

```text
one language-neutral analyzer interface
one machine-readable output schema
versioned analyzer provenance
explicit unsupported/unresolved states
Arabic reference profile passes
Hebrew reference profile passes
Greek reference profile passes
generic fallback profile passes
existing deterministic validator remains green
existing live Source Provider verification remains green
```

M4 does not require production-grade parsing for every language. It requires a stable, auditable boundary that deeper analyzers can safely implement.
