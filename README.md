# Witness Semantic Engine

> **Downstream semantic analysis for source resources: frames → assessments → Witness → positive direction.**

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

WSI no longer needs a Qur'an adapter, Torah adapter, Psalms adapter, or Gospel adapter in its semantic core.

If a source provider already exposes a stable addressable resource, WSI analyzes that resource through the same contract.

Corpus-specific ingestion belongs upstream.

Language-specific analysis belongs in optional linguistic plugins:

```text
Arabic
Hebrew
Greek
Pali
Sanskrit
Generic fallback
...
```

## Semantic frame, not keyword

The primary semantic unit is a Frame/Proposition.

Example:

```text
P1 ── AUTHORITY_OVER [NEGATED] ──▶ P2

P2 ── HAS_STATE ──▶ [TRANSGRESSION]
```

A frame can be n-ary and may contain multiple semantic-role bindings.

## Assessment is separate from source structure

Direction is not embedded as a hidden fact inside a Frame.

Preferred model:

```text
FRAME F2
  ↓
ASSESSMENT A2
  type   = SOURCE_DIRECTION
  result = NEGATIVE
```

This keeps:

```text
POLARITY != DIRECTION
MODALITY != DIRECTION
SPEECH ACT != DIRECTION
```

## Witness boundary

Witness is downstream interpretation/derivation, not translation.

```text
[TRANSGRESSION]
  ↓
BOUNDARY_VIOLATION       # Witness Pattern
  ↓
OFFSIDE                  # localized Witness label
  ↓
RETURN / ALIGN           # response
  ↓
BOUNDARY_ALIGNMENT       # positive-direction target
```

The source condition is not rewritten to become positive.

## Current worked example

As-Saffat 37:30 remains a **non-normative worked example** only.

The v0.2 golden candidate binds to real RGBL identities:

```text
mw:passage:quran:37:30
mw:content:quran:37:30:ar-uthmani
```

It does not define the schema by itself.

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
- [`spec/README.md`](spec/README.md)
- [`spec/SOURCE-PROVIDER-CONTRACT.md`](spec/SOURCE-PROVIDER-CONTRACT.md)
- [`spec/ID-GRAMMAR.md`](spec/ID-GRAMMAR.md)

## Validation layers

```text
1. JSON Schema
2. WSI registry integrity
3. Source-binding resolution
4. Evidence-selector resolution
5. WSI semantic invariants
6. Review policy
```

A structurally valid JSON file is not automatically a correct semantic analysis.

## Implementation direction

The contract remains language-independent.

Recommended architecture after the RGBL integration review:

### TypeScript

Use for:

- RGBL/source-provider integration;
- canonical WSI object model;
- orchestration;
- deterministic validation;
- CLI/API;
- review tooling;
- Witness pipeline.

### Python

Use as optional language/research workers for:

- Arabic NLP;
- Hebrew NLP;
- Greek NLP;
- other linguistic pipelines;
- embeddings/reranking/evaluation experiments.

### Rust

Optional later for demonstrated performance/type-safety needs.

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

`dev` is the active research branch. `main` is the stable release branch.

## Design principle

> **Do not ingest the world twice. Resolve the source, pin it, anchor evidence, analyze, review, then Witness.**
