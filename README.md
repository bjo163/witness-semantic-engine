# Witness Semantic Engine

> **Downstream semantic analysis for source resources: frames → assessments → Witness → positive direction.**

## Project status

Current development position:

```text
Machine Contract: v0.2.0
Blueprint:       3.2-draft
Milestone 0:     DONE
Milestone 1:     IMPLEMENTED / REVIEW PENDING
Milestone 2:     IMPLEMENTED / REVIEW PENDING — CI GREEN
Milestone 3:     IMPLEMENTED / REVIEW PENDING — LIVE CI GREEN
Milestone 4:     NEXT — linguistic plugin contract + stratified goldens
```

M2 passes deterministic validation CI. M3 now resolves and verifies real resources against the exact RGBL Git revision pinned by each Source Binding; the live suite passes both Qur'an 37:30 evidence anchors and a structurally separate Bhagavad Gita resource through the same provider interface.

The canonical milestone tracker is [`ROADMAP.md`](ROADMAP.md). Architecture remains normative in [`BLUEPRINT.md`](BLUEPRINT.md).

## What this repository owns

Witness Semantic Engine (WSI) does **not** own canonical scripture/corpus text.

Its job begins after a source resource already exists in a provenance-aware provider.

Current first provider:

- [`bjo163/rocksoul-rgbl`](https://github.com/bjo163/rocksoul-rgbl) — canonical source/corpus identity, exact text, editions, passages, content, provenance, rights, variants, and alignments.

WSI owns downstream analysis:

```text
SOURCE RESOURCE REFERENCE
  ↓
LEXICAL / CONTEXTUAL SENSE
  ↓
DISCOURSE + PARTICIPANTS
  ↓
SEMANTIC FRAMES
  ↓
CONCEPT + RELATION MAPPING
  ↓
ASSESSMENTS
  ↓
REVIEW
  ↓
WITNESS PATTERN
  ↓
WITNESS LABEL
  ↓
RESPONSE / CORRECTION
  ↓
POSITIVE DIRECTION
```

## Repository boundary

### RGBL / Source Provider

Owns questions such as:

- What exact text is this?
- Which work/expression/edition/artifact does it belong to?
- Which passage/content resource identifies it?
- What is the source provenance and checksum?
- What rights/license govern the source?

### WSI

Owns questions such as:

- What contextual senses are supported?
- Who/what participates in the proposition?
- What semantic frames are asserted?
- What concepts and relations are defensibly mapped?
- What polarity/modality/speech act applies?
- What evaluative direction is supported as an **assessment**?
- What Witness Pattern can be derived?
- What response/correction follows?
- What positive direction can be derived without rewriting source meaning?

## Source bindings, not source copies

WSI references provider resources rather than creating duplicate scripture objects.

Example:

```json
{
  "provider": "rocksoul-rgbl",
  "provider_contract": "moonwitness-corpus/v0.1",
  "provider_revision": "df00706c98e21fb3fb0146b8389b0f2978f3d833",
  "primary_resource_id": "mw:passage:quran:37:30",
  "resource_ids": [
    "mw:passage:quran:37:30",
    "mw:content:quran:37:30:ar-uthmani"
  ]
}
```

Canonical text remains owned by the provider. WSI may keep quote/selectors only as evidence anchors.

## Why this is more universal

WSI does not need a Qur'an adapter, Torah adapter, Psalms adapter, Gospel adapter, or similar scripture-specific semantic branch.

If a Source Provider exposes a stable addressable resource, WSI analyzes that resource through the same contract. Corpus-specific ingestion belongs upstream; language-specific analysis belongs in optional linguistic plugins.

The M3 live test deliberately resolves both Qur'an and Bhagavad Gita resources through the same `SourceProvider` interface. This is an interoperability test, not a claim of theological equivalence.

## Semantic frame, not keyword

The primary semantic unit is a Frame/Proposition.

```text
P1 ── AUTHORITY_OVER [NEGATED] ──▶ P2
P2 ── HAS_STATE ──▶ [TRANSGRESSION]
```

A frame can be n-ary and may contain multiple semantic-role bindings.

## Assessment is separate from source structure

Direction is not embedded as a hidden fact inside a Frame.

```text
FRAME F2
  ↓
ASSESSMENT A2
  type   = SOURCE_DIRECTION
  result = NEGATIVE
```

This keeps polarity, modality, speech act, and direction separate.

## Witness boundary

Witness is downstream interpretation/derivation, not translation.

```text
[TRANSGRESSION]
  ↓
BOUNDARY_VIOLATION
  ↓
OFFSIDE
  ↓
RETURN / ALIGN
  ↓
BOUNDARY_ALIGNMENT
```

The source condition is not rewritten to become positive.

## Current worked example

As-Saffat 37:30 remains a **non-normative worked example** only. It binds to real RGBL identities:

```text
mw:passage:quran:37:30
mw:content:quran:37:30:ar-uthmani
```

Its evidence anchors are now verified literally against the pinned RGBL/Tanzil Uthmani source snapshot. It tests the contract; it does not define the universal schema.

## Machine Contract

Current research contract:

```text
WSI Machine Contract v0.2.0
```

Core record:

```text
analysis_target
source_bindings
lexical_senses
utterances
participants
frames
discourse_relations
concept_refs
assessments
witnesses
analysis_provenance
review
```

See:

- [`BLUEPRINT.md`](BLUEPRINT.md)
- [`ROADMAP.md`](ROADMAP.md)
- [`spec/README.md`](spec/README.md)
- [`spec/SOURCE-PROVIDER-CONTRACT.md`](spec/SOURCE-PROVIDER-CONTRACT.md)
- [`spec/VALIDATION.md`](spec/VALIDATION.md)
- [`spec/RGBL-CONNECTOR.md`](spec/RGBL-CONNECTOR.md)
- [`spec/ID-GRAMMAR.md`](spec/ID-GRAMMAR.md)

## Deterministic validator — M2

The offline validator checks:

```text
1. JSON Schema
2. WSI registry integrity
3. Source-binding resolution against pinned offline indexes
4. Evidence-selector validation
5. WSI semantic invariants
6. Review policy
```

Run:

```bash
npm install
npm run check
```

## Live Source Provider — M3

M3 implements the runtime `SourceProvider` contract and a repository-backed RGBL reference connector. Canonical content is resolved from the exact Git revision pinned by the WSI Source Binding.

Live verification checks:

```text
pinned revision exists
resource exists at that revision
analysis target resolves
TEXT_QUOTE matches provider text literally
CHAR_RANGE resolves against provider text
claimed RESOLVED bindings are not stale
```

Run locally with an RGBL checkout:

```bash
npm run verify:source -- data/golden-candidates/quran/037/030.json \
  --provider-root /path/to/rocksoul-rgbl
```

CI also verifies a non-Qur'an Bhagavad Gita fixture through the same connector.

## What comes next — M4

M4 defines language-analysis plugin boundaries and builds a stratified golden-analysis set. Language plugins are analysis tools, never source authority.

Initial targets include Arabic, Hebrew, Greek, and a generic fallback; other languages are added when justified by provider resources and research needs.

## Implementation direction

The contract remains language-independent.

### TypeScript

Use for Source Provider integration, canonical WSI objects, validation, orchestration, CLI/API, review tooling, and Witness pipeline.

### Python

Use as optional linguistic/research workers for Arabic, Hebrew, Greek, other language NLP, embeddings, reranking, and evaluation.

### Rust

Optional later for demonstrated performance/type-safety needs.

## Production path

WSI does not call itself production-stable merely because one corpus can be processed. The planned path is:

```text
M4 linguistic plugins + stratified goldens
M5 semantic frame engine
M6 Witness engine
M7 scale / reproducible batch processing
M8 production hardening
M9 release candidate → v1.0
```

See `ROADMAP.md` for acceptance gates.

## Research integrity

WSI must preserve these separations:

- external source identity ≠ WSI identity;
- source text ≠ analysis;
- lexeme ≠ sense;
- sense ≠ universal concept;
- participant ≠ concept;
- discourse role ≠ semantic role;
- relation ≠ concept;
- polarity ≠ direction;
- assessment ≠ source structure;
- Witness ≠ translation;
- Witness label ≠ Witness Pattern;
- response ≠ source assertion;
- positive direction ≠ source direction;
- analysis provenance ≠ source-acquisition provenance;
- `UNRESOLVED` is valid.

## Development and release model

Only two long-lived branches:

```text
dev → promotion PR → main
```

Conventional Commits drive automated versioning, changelog generation, tags, and GitHub Releases.

`dev` is active research. `main` is stable release history.

## Design principle

> **Do not ingest the world twice. Resolve the source, pin it, anchor evidence, analyze, review, then Witness.**
