# WSI Machine Contract v0.1.0

This directory defines the first machine-readable contract for Witness Semantic Indexing (WSI).

The contract is subordinate to `BLUEPRINT.md`. If an implementation, prompt, model output, UI, database, or script conflicts with the Blueprint, the implementation is wrong until the specification is explicitly versioned.

## Scope

Version `0.1.0` defines:

- the canonical semantic-record JSON structure;
- stable internal identifier rules;
- controlled vocabulary registries;
- concept, relation, and Witness Pattern registries;
- evidence, provenance, confidence, and review fields;
- the separation of source semantics from Witness and positive direction;
- a worked Quran example used as a golden candidate, not as a production Quran edition.

It does **not** yet define:

- a production Quran source edition;
- tokenizer stability guarantees;
- a complete ontology;
- a complete semantic-role inventory;
- a production confidence calibration;
- a full-Quran extractor;
- a claim that the worked example is scholarly consensus or locked theological interpretation.

## Validation pipeline

A record is valid only after four distinct checks:

```text
1. JSON Schema structure
2. Registry referential integrity
3. WSI semantic invariants
4. Review / lock policy
```

Passing JSON Schema alone does not make a semantic assertion correct.

### 1. JSON Schema

`wsi-record.schema.json` validates structural shape using JSON Schema Draft 2020-12.

### 2. Registry referential integrity

Every referenced concept, relation, Witness Pattern, controlled enum, response, and future alignment type must resolve to the versioned registry set used by the record.

### 3. WSI invariants

Examples:

```text
PARTICIPANT != CONCEPT
RELATION != CONCEPT
POLARITY != DIRECTION
SOURCE_DIRECTION != POSITIVE_DIRECTION
WITNESS_LABEL != CANONICAL_CONCEPT
TRANSLATION_ALONE != DIRECT_PRIMARY_EVIDENCE
CONTEXT_RESOLUTION_MUST_NOT_OVERWRITE_SURFACE_REFERENCE
```

### 4. Review policy

Semantic assertions have lifecycle states such as `CANDIDATE`, `RESEARCHED`, `REVIEWED`, and `LOCKED`.

Machine validity and research approval are intentionally separate.

## Corpus neutrality

The contract is designed for:

1. full Quran research first;
2. later Torah-associated, Psalms-associated, and Gospel-associated corpora;
3. independent semantic extraction per corpus before cross-corpus alignment.

A source record therefore identifies corpus, work, edition, reference system, language, script, checksum, and unit identity separately.

## Cross-language rule

Never map words across Arabic, Hebrew, Greek, English, Indonesian, or other languages solely because a translation string matches.

The required conceptual path is:

```text
surface form
-> lexeme / lemma
-> contextual lexical sense
-> semantic frame role
-> canonical concept mapping
```

## Witness rule

Witness is downstream from reviewed source semantics:

```text
LOCKED / REVIEWED SEMANTIC FRAME
-> WITNESS PATTERN
-> LOCALIZED WITNESS LABEL
-> RESPONSE / CORRECTION
-> POSITIVE DIRECTION
```

A label such as `OFFSIDE` is presentation. A machine-stable Witness identity is a pattern such as `wsi:witness-pattern/boundary-violation`.

## Files

- `manifest.json` — contract manifest and validation order.
- `ID-GRAMMAR.md` — identifier rules.
- `wsi-record.schema.json` — canonical JSON Schema.
- `../registries/controlled-vocabularies.json` — finite controlled values.
- `../registries/concepts.json` — concept scheme bootstrap.
- `../registries/relations.json` — relation registry bootstrap.
- `../registries/witness-patterns.json` — Witness Pattern bootstrap.
- `../data/golden-candidates/quran/037/030.json` — worked example / golden candidate.

## Version discipline

`contract_version`, `schema_version`, `ontology_version`, and repository `VERSION` are separate version domains. They must never be assumed equal merely because their initial values are similar.
