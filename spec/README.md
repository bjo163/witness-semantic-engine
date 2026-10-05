# WSI Machine Contract v0.2.0

This directory defines the provider-bound semantic-analysis contract for Witness Semantic Engine (WSI).

`BLUEPRINT.md` is normative. This contract implements its current machine-readable boundary.

## Breaking change from v0.1

v0.1 mixed source/corpus ownership with WSI analysis objects.

v0.2 removes canonical source ownership from WSI.

Removed from WSI ownership:

```text
corpus records
work records
edition records
reference-system records
source-unit records
canonical source text
source checksums/rights as WSI authority
```

Replaced by:

```text
Source Provider Contract
Source Binding
Analysis Target
Evidence selectors
```

The current first provider is `rocksoul-rgbl`.

## Top-level analysis record

```text
record_id
contract_version
record_type
analysis_target
source_bindings[]
lexical_senses[]
utterances[]
participants[]
frames[]
discourse_relations[]
concept_refs[]
assessments[]
witnesses[]
provenance
review
```

## Source boundary

Canonical text is resolved from a provider.

Example binding:

```json
{
  "id": "S1",
  "provider": "rocksoul-rgbl",
  "provider_contract": "moonwitness-corpus/v0.1",
  "provider_revision": "df00706c98e21fb3fb0146b8389b0f2978f3d833",
  "primary_resource_id": "mw:passage:quran:37:30",
  "resource_ids": [
    "mw:passage:quran:37:30",
    "mw:content:quran:37:30:ar-uthmani"
  ],
  "resolution_status": "RESOLVED"
}
```

WSI may retain quote/selectors for evidence anchoring, but those are not canonical source copies.

## Assessment model

v0.2 removes `source_direction` from Frame structure.

Direction is modeled as an Assessment:

```text
FRAME F2
→ ASSESSMENT A2
   assessment_type = SOURCE_DIRECTION
   result = NEGATIVE
```

This keeps evaluative judgement separate from proposition structure.

## Validation pipeline — M2

Offline deterministic validation runs:

```text
1. JSON_SCHEMA
2. REGISTRY_REFERENTIAL_INTEGRITY
3. SOURCE_BINDING_RESOLUTION
4. EVIDENCE_SELECTOR_RESOLUTION
5. WSI_SEMANTIC_INVARIANTS
6. REVIEW_POLICY
```

Passing JSON Schema alone does not imply semantic correctness.

## Live source proof — M3

The runtime `SourceProvider` boundary now has a reference RGBL implementation.

The live layer verifies the external facts that ordinary offline CI deliberately does not fetch:

```text
pinned provider revision exists
resource ID exists at that revision
analysis target resolves
TEXT_QUOTE matches provider content literally
CHAR_RANGE resolves against provider text
claimed RESOLVED binding is not stale
```

Reference implementation:

```text
src/source-provider/types.ts
src/source-provider/rgbl-repository.ts
src/source-provider/verify.ts
spec/RGBL-CONNECTOR.md
.github/workflows/provider-live.yml
```

The live acceptance suite currently passes both Qur'an 37:30 and a non-Qur'an Bhagavad Gita 1:1 resource through the same provider interface.

The worked example's exact Uthmani evidence anchors were corrected after the live verifier proved the prior human-entered anchors were not byte-exact. This is intended behavior: provider text wins over a locally plausible source string.

## Linguistic analyzer boundary — M4

M4 introduces a separate language-analysis contract between Source Provider content and later semantic-frame generation.

```text
SOURCE PROVIDER CONTENT
→ LINGUISTIC ANALYZER
→ LINGUISTIC CANDIDATE OUTPUT
→ later semantic/review layer
```

The analyzer contract reports capabilities explicitly:

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

Unsupported structure remains `UNSUPPORTED`; supported-but-unresolved structure may remain `UNRESOLVED`. An analyzer must not fabricate morphology, syntax, lemma, or discourse structure merely to produce a complete-looking record.

Reference implementation:

```text
src/linguistics/types.ts
src/linguistics/baseline.ts
src/linguistics/reference.ts
src/linguistics/validate.ts
spec/LINGUISTIC-ANALYZER-CONTRACT.md
spec/linguistic-analysis.schema.json
data/linguistic-goldens/profiles.json
```

The current baseline analyzers resolve deterministic Unicode tokenization and NFC analysis normalization only. Deeper lemma/POS/morphology/syntax adapters may be added behind the same interface later.

The live stratified suite resolves provider text at the pinned RGBL revision and passes the same contract across:

```text
Arabic / Arab   — Qur'an resource
Hebrew / Hebr   — OSHB/WLC resource
Greek / Grek    — SBLGNT resource
Sanskrit / Deva — Bhagavad Gita through generic fallback
```

The golden profile set stores source bindings and expected analyzer behavior, not a duplicate canonical text corpus.

## Contract files

- `manifest.json` — contract manifest, validation order, runtime provider references, and linguistic contract references.
- `SOURCE-PROVIDER-CONTRACT.md` — provider/source ownership boundary.
- `RGBL-CONNECTOR.md` — first live Source Provider reference transport.
- `VALIDATION.md` — deterministic/offline validation architecture.
- `LINGUISTIC-ANALYZER-CONTRACT.md` — language-neutral analyzer boundary and invariants.
- `linguistic-analysis.schema.json` — machine-readable linguistic candidate output schema.
- `ID-GRAMMAR.md` — WSI-owned identifier rules and external-ID rules.
- `wsi-record.schema.json` — canonical JSON Schema Draft 2020-12 semantic-analysis record.
- `../registries/controlled-vocabularies.json` — controlled values.
- `../registries/concepts.json` — WSI concept registry seed.
- `../registries/relations.json` — WSI relation registry seed.
- `../registries/witness-patterns.json` — Witness Pattern registry seed.
- `../data/golden-candidates/quran/037/030.json` — non-normative semantic worked example bound to real RGBL resource IDs.
- `../data/linguistic-goldens/profiles.json` — stratified provider-bound linguistic acceptance profiles.

## Provider independence

WSI is not hardcoded to scripture names or to one provider.

RGBL is the first integration because it already preserves exact text, passage identity, editions, provenance, rights, and multi-tradition resources.

Another provider may be supported later if it can satisfy the Source Provider Contract.

Provider transport is also not semantic identity: repository, SDK, API, or database-backed resolvers may implement the same logical interface.

## Cross-language rule

Never equate lexical items because translations happen to use the same word.

```text
external source anchor
→ linguistic analysis candidate
→ contextual sense
→ frame role
→ optional universal concept mapping
```

Unresolved concept mapping is valid.

A linguistic candidate is not automatically a reviewed lexical sense, semantic role, Frame, relation, or concept mapping.

## Witness rule

```text
REVIEWED/LOCKED FRAME + ASSESSMENTS
→ WITNESS PATTERN
→ LOCALIZED LABEL
→ RESPONSE / CORRECTION
→ POSITIVE DIRECTION
```

Research previews may use `RESEARCHED` inputs, but downstream objects remain provisional.

## Version discipline

These remain separate:

```text
repository version
Blueprint revision
Machine Contract version
linguistic contract version
registry version
ontology version
analyzer version
analyzer ruleset/model version
source-provider contract/version
source-provider revision
confidence policy version
Witness policy version
```

They MUST NOT be assumed equal.
