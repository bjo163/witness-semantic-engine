# WSI Validation Architecture

**Machine Contract:** `0.2.0`  
**Implementation status:** Milestone 2 — implemented on `dev`, review pending

This document defines how WSI validates an analysis record without turning validation into source interpretation.

## Design goals

The validator MUST be:

- deterministic for the same repository revision and input record;
- runnable offline in CI;
- independent from any one scripture/corpus;
- strict about WSI-owned invariants;
- conservative when an external Source Provider cannot be fully resolved offline;
- explicit about the boundary between structural validity and research correctness.

## Six validation passes

Validation is ordered:

```text
1. JSON_SCHEMA
2. WSI_REGISTRY_REFERENTIAL_INTEGRITY
3. SOURCE_BINDING_RESOLUTION
4. EVIDENCE_SELECTOR_RESOLUTION
5. WSI_SEMANTIC_INVARIANTS
6. REVIEW_POLICY
```

A failure in pass 1 stops deeper semantic validation because later checks assume the canonical record shape.

### 1. JSON_SCHEMA

Uses `spec/wsi-record.schema.json` (JSON Schema Draft 2020-12).

Responsibilities include:

- required fields;
- object/array shape;
- identifier syntax;
- contract version;
- numeric ranges;
- selector shape;
- allowed structural enum values declared directly by schema.

Schema validity does not prove semantic correctness.

### 2. WSI_REGISTRY_REFERENTIAL_INTEGRITY

Checks references against versioned WSI registries:

- concepts;
- relations;
- Witness Patterns;
- controlled vocabularies;
- allowed Witness responses and positive targets.

A syntactically valid `wsi:concept/...` identifier that is not registered is invalid.

### 3. SOURCE_BINDING_RESOLUTION

Offline CI validates the binding contract without fetching canonical source text.

Checks include:

- `primary_resource_id` is included in `resource_ids`;
- external resources do not use the WSI namespace;
- `analysis_target` resolves to an existing local Source Binding;
- target resource belongs to that binding;
- known provider contract/revision can be checked against a pinned provider catalog;
- known resources can be checked against that catalog.

Provider catalogs live under:

```text
spec/providers/
```

They are **indexes, not source authority**.

`coverage = PARTIAL` means absence from the local catalog is a warning, not proof that an upstream resource is absent.

### 4. EVIDENCE_SELECTOR_RESOLUTION

Checks that every evidence item:

- references an existing Source Binding;
- references a resource inside that binding;
- uses registered evidence/derivation classes;
- has a selector coherent with its selector type.

Initial selector rules:

```text
RESOURCE_ONLY → resource reference is enough
TEXT_QUOTE    → exact must be non-empty
CHAR_RANGE    → start/end integers, end > start
TOKEN_IDS     → at least one token ID
```

`TOKEN_IDS` additionally emits a warning reminding consumers that token IDs are only reproducible when analyzer/tokenizer identity is recorded.

Full proof that a quote or character range matches canonical provider content belongs to the live provider resolver in Milestone 3.

### 5. WSI_SEMANTIC_INVARIANTS

Checks cross-object meaning and identity rules, including:

- local IDs are unique;
- utterance references resolve;
- participant references resolve;
- discourse frame references resolve;
- Assessment targets resolve;
- Witness observed frames resolve;
- relation/concept IDs resolve;
- Direction is not embedded as a Frame property;
- resolved Witness responses are allowed by the Witness Pattern;
- resolved positive-direction targets match their response contract.

This pass enforces framework invariants that JSON Schema alone cannot express cleanly.

### 6. REVIEW_POLICY

Checks lifecycle rules.

Initial policy:

- `LOCKED` analysis requires an identified reviewer;
- record-level `LOCKED` requires all Source Bindings to be `RESOLVED`;
- a `REVIEWED`/`LOCKED` Witness may not depend on merely candidate/researched Frames.

Review policy will grow conservatively and remains versioned by repository/contract history.

## Offline versus live resolution

Two modes are intentionally separated.

### Offline deterministic mode — Milestone 2

Runs in CI and local development.

```text
WSI record
+ JSON Schema
+ WSI registries
+ pinned provider index
→ deterministic validation report
```

No network is required by validator logic itself.

### Live provider mode — Milestone 3

A provider connector will resolve canonical resources through RGBL SDK/API/repository interfaces.

It will add checks such as:

```text
provider revision exists
resource exists at pinned revision
resource kind matches expectation
content can be resolved
TEXT_QUOTE exists in resolved content
CHAR_RANGE is valid against resolved content
source checksum/integrity metadata is consistent where available
```

Live resolution augments the validator; it does not redefine WSI semantics.

## Report contract

Every validator result returns:

```text
valid
errors
warnings
findings[]
passes[]
```

Each finding has:

```text
severity
code
path
message
```

Finding codes are intended to be stable enough for CI, review tooling, and future APIs.

## CLI

Install dependencies:

```bash
npm install
```

Validate all golden candidates:

```bash
npm run validate
```

Validate a specific record:

```bash
npm run validate -- data/golden-candidates/quran/037/030.json
```

Run the complete deterministic check suite:

```bash
npm run check
```

`npm run check` performs type checking, validator tests, and golden-record validation.

## Acceptance rule for Milestone 2

Milestone 2 is implementation-complete when all of the following are true on `dev`:

```text
TypeScript compilation passes
validator mutation tests pass
golden candidate passes
repository policy CI runs npm run check
README/Blueprint/Roadmap describe the same milestone state
```

It becomes project-complete only after review/promotion to `main` under the repository governance flow.
