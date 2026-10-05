# WSI Machine Contract v0.2.0

This directory defines the first provider-bound semantic-analysis contract for Witness Semantic Indexing (WSI).

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

## Validation pipeline

```text
1. JSON_SCHEMA
2. REGISTRY_REFERENTIAL_INTEGRITY
3. SOURCE_BINDING_RESOLUTION
4. EVIDENCE_SELECTOR_RESOLUTION
5. WSI_SEMANTIC_INVARIANTS
6. REVIEW_POLICY
```

Passing JSON Schema alone does not imply semantic correctness.

## Contract files

- `manifest.json` — contract manifest and validation order.
- `SOURCE-PROVIDER-CONTRACT.md` — provider/source ownership boundary.
- `ID-GRAMMAR.md` — WSI-owned identifier rules and external-ID rules.
- `wsi-record.schema.json` — canonical JSON Schema Draft 2020-12 record.
- `../registries/controlled-vocabularies.json` — controlled values.
- `../registries/concepts.json` — WSI concept registry seed.
- `../registries/relations.json` — WSI relation registry seed.
- `../registries/witness-patterns.json` — Witness Pattern registry seed.
- `../data/golden-candidates/quran/037/030.json` — non-normative worked example bound to real RGBL resource IDs.

## Provider independence

WSI is not hardcoded to scripture names or to one provider.

The first production integration is RGBL because it already preserves exact text, passage identity, editions, provenance, rights, and multi-tradition resources.

Another provider may be supported later if it can satisfy the Source Provider Contract.

## Cross-language rule

Never equate lexical items because translations happen to use the same word.

```text
external source anchor
→ lexical/linguistic analysis
→ contextual sense
→ frame role
→ optional universal concept mapping
```

Unresolved concept mapping is valid.

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
registry version
ontology version
analyzer version
source-provider contract/version
source-provider revision
confidence policy version
Witness policy version
```

They MUST NOT be assumed equal.
