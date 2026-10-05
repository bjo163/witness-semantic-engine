# WSI Machine Contract v0.1.0

This directory defines the first machine-readable contract for Witness Semantic Indexing (WSI).

The contract is subordinate to `BLUEPRINT.md`. If implementation code, prompts, models, databases, adapters, or UIs conflict with the Blueprint, the implementation is wrong until the specification is explicitly versioned.

## Scope

Version `0.1.0` defines:

- the canonical semantic-record JSON structure;
- stable internal identifier rules;
- controlled vocabulary registries;
- concept, relation, and Witness Pattern registries;
- evidence, provenance, confidence, and review fields;
- separation of source semantics from Witness and positive direction;
- corpus-agnostic source identity using corpus/work/edition/reference-system context;
- one worked example used as a golden candidate, not as a universal schema template.

It does **not** yet define:

- a mandatory corpus;
- a mandatory scripture family;
- a production source edition;
- a complete ontology;
- a complete semantic-role inventory;
- a production confidence calibration;
- a full-corpus extractor;
- a claim that any worked example is locked theological interpretation.

## Universal corpus terminology

The machine contract uses these terms:

```text
SOURCE CORPUS
CORPUS PROFILE
CORPUS INSTANCE
WORK
EDITION
REFERENCE SYSTEM
SOURCE UNIT
CORPUS ADAPTER
```

### Source Corpus

The declared body of primary text selected for research.

### Corpus Profile

Declarative description of corpus-family structure and adapter requirements.

### Corpus Instance

The concrete work/edition/reference dataset being analyzed.

### Corpus Adapter

Implementation-specific ingestion/linguistic integration that emits the universal WSI contract.

The semantic core MUST NOT require any one named corpus profile.

## Corpus neutrality

The contract is designed so that profiles such as Qur'an, Torah-associated, Psalms-associated, and Gospel-associated corpora can use the same semantic core.

A profile may be implemented first for project sequencing reasons, but first implementation does not grant architectural privilege.

Before the core reaches a stable specification, it should be validated against multiple distinct Corpus Profiles to detect hidden corpus-specific assumptions.

## Lock semantics

`LOCKED` is a semantic assertion/review state.

It is **not** a corpus lock-in mechanism and does not mean that one corpus defines the architecture.

A corpus may simultaneously contain candidate, reviewed, locked, disputed, and unresolved assertions.

## Validation pipeline

A record is valid only after distinct checks:

```text
1. JSON Schema structure
2. Registry referential integrity
3. WSI semantic invariants
4. Corpus-profile / source-integrity validation
5. Review / lock policy
```

Passing JSON Schema alone does not make a semantic assertion correct.

### 1. JSON Schema

`wsi-record.schema.json` validates structural shape using JSON Schema Draft 2020-12.

### 2. Registry referential integrity

Every referenced concept, relation, Witness Pattern, controlled value, and future mapping type must resolve to the declared versioned registries.

### 3. WSI invariants

Examples:

```text
SOURCE_CORPUS != ONTOLOGY
CORPUS_PROFILE != SEMANTIC_CORE
PARTICIPANT != CONCEPT
RELATION != CONCEPT
POLARITY != DIRECTION
SOURCE_DIRECTION != POSITIVE_DIRECTION
WITNESS_LABEL != CANONICAL_CONCEPT
TRANSLATION_ALONE != DIRECT_PRIMARY_EVIDENCE
CONTEXT_RESOLUTION_MUST_NOT_OVERWRITE_SURFACE_REFERENCE
```

### 4. Corpus-profile / source-integrity validation

The adapter/profile layer validates edition identity, reference-system resolution, source-unit integrity, checksums, text-view provenance, and corpus-specific constraints.

Corpus-specific validation must not redefine the universal semantic core.

### 5. Review policy

Semantic assertions use lifecycle states such as `CANDIDATE`, `RESEARCHED`, `REVIEWED`, `LOCKED`, `DISPUTED`, and `DEPRECATED`.

Machine validity and research approval are intentionally separate.

## Cross-language rule

Never map words across Arabic, Hebrew, Greek, English, Indonesian, or other languages solely because a translation string matches.

Required conceptual path:

```text
surface form
→ lexeme / lemma
→ contextual lexical sense
→ semantic frame role
→ canonical concept mapping
```

## Witness rule

Witness is downstream from reviewed source semantics:

```text
REVIEWED / LOCKED ASSERTION
→ WITNESS PATTERN
→ LOCALIZED WITNESS LABEL
→ RESPONSE / CORRECTION
→ POSITIVE DIRECTION
```

A label such as `OFFSIDE` is presentation. A machine-stable identity is a Witness Pattern such as `wsi:witness-pattern/boundary-violation`.

## Worked example policy

`../data/golden-candidates/quran/037/030.json` is currently one non-normative worked example / golden candidate.

Its location under a corpus-specific directory is intentional: golden records belong to Corpus Instances/Profiles, while schemas and registries remain universal.

The example MUST NOT imply that Qur'an-specific fields belong in the core schema.

## Files

- `manifest.json` — contract manifest and validation order.
- `ID-GRAMMAR.md` — identifier rules.
- `wsi-record.schema.json` — canonical JSON Schema.
- `../registries/controlled-vocabularies.json` — finite controlled values.
- `../registries/concepts.json` — concept scheme bootstrap.
- `../registries/relations.json` — relation registry bootstrap.
- `../registries/witness-patterns.json` — Witness Pattern bootstrap.
- `../data/golden-candidates/quran/037/030.json` — one corpus-specific worked example.

## Version discipline

The following are separate version domains and must not be conflated:

```text
repository_version
blueprint_version
contract_version
schema_version
ontology_version
registry_version
corpus_profile_version
corpus_adapter_version
source_edition_version
extractor_version
confidence_policy_version
witness_policy_version
```

The universal contract evolves independently from any one corpus adapter or source edition.
