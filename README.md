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
Milestone 4:     IMPLEMENTED / REVIEW PENDING — LIVE CI GREEN
Milestone 5:     IMPLEMENTED / REVIEW PENDING — semantic candidate compiler
Milestone 6:     IMPLEMENTED / REVIEW PENDING — Witness derivation engine
Milestone 7:     NEXT — batch / reproducible processing
```

M2 passes deterministic validation CI. M3 resolves and verifies real resources against the exact RGBL Git revision pinned by each Source Binding. M4 passes one language-neutral `LinguisticAnalyzer` contract across Arabic, Hebrew, Greek, and a Sanskrit generic-fallback profile. M5 now compiles evidence-backed semantic proposals into deterministic participant, concept/semantic-key, and Frame candidates without promoting candidates to reviewed truth.

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
LINGUISTIC ANALYSIS CANDIDATE
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

- What linguistic candidates can be derived from the provider text?
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

Canonical text remains owned by the provider. WSI may keep quote/selectors or analysis-local token surfaces only as evidence/analysis anchors.

## Why this is more universal

WSI does not need a Qur'an adapter, Torah adapter, Psalms adapter, Gospel adapter, or similar scripture-specific semantic branch.

If a Source Provider exposes a stable addressable resource, WSI analyzes that resource through the same contract. Corpus-specific ingestion belongs upstream; language-specific analysis belongs in optional linguistic plugins.

M3 deliberately resolves both Qur'an and Bhagavad Gita resources through the same `SourceProvider` interface. M4 goes further: Arabic Qur'an, Hebrew OSHB/WLC, Greek SBLGNT, and Sanskrit Bhagavad Gita resources pass the same language-analysis contract. These are interoperability tests, not claims of theological equivalence.

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

Its evidence anchors are verified literally against the pinned RGBL/Tanzil Uthmani source snapshot. It tests the semantic contract; it does not define the universal schema.

## Machine Contract

Current research contract:

```text
WSI Machine Contract v0.2.0
Linguistic Analyzer Contract v0.1.0
```

Core semantic record:

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

Linguistic analyzer output is a separate candidate artifact and is **not** automatically promoted into the reviewed semantic record.

See:

- [`BLUEPRINT.md`](BLUEPRINT.md)
- [`ROADMAP.md`](ROADMAP.md)
- [`spec/README.md`](spec/README.md)
- [`spec/SOURCE-PROVIDER-CONTRACT.md`](spec/SOURCE-PROVIDER-CONTRACT.md)
- [`spec/RGBL-CONNECTOR.md`](spec/RGBL-CONNECTOR.md)
- [`spec/LINGUISTIC-ANALYZER-CONTRACT.md`](spec/LINGUISTIC-ANALYZER-CONTRACT.md)
- [`spec/VALIDATION.md`](spec/VALIDATION.md)
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

## Linguistic Analyzer — M4

M4 defines one provider-neutral language-analysis interface:

```text
provider content
→ LinguisticAnalyzer
→ linguistic candidate
→ later semantic/review layer
```

Each output is bound to the provider/resource/revision plus exact content SHA-256 and analyzer/ruleset version. Token spans use Unicode code points.

Capabilities are explicit:

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

The baseline reference plugins intentionally support only deterministic tokenization + NFC analysis normalization. Unsupported morphology, syntax, lemma, POS, and discourse structure remain `UNSUPPORTED` rather than being guessed.

Reference analyzers:

```text
Arabic baseline
Hebrew baseline
Greek baseline
Generic fallback
```

Live linguistic profiles:

```text
Arabic / Arab   — Qur'an 37:30
Hebrew / Hebr   — OSHB/WLC Genesis 1:1
Greek / Grek    — SBLGNT John 1:1
Sanskrit / Deva — Bhagavad Gita 1:1 via generic fallback
```

Run the live profile suite with a pinned RGBL checkout:

```bash
RGBL_REPO_PATH=/path/to/rocksoul-rgbl npm run test:linguistics:live
```

## Semantic candidate engine — M5

M5 is implemented as a deterministic candidate compiler on top of the source + linguistic boundaries.

```text
SOURCE PROVIDER
→ LINGUISTIC CANDIDATE
→ EVIDENCE-BACKED SEMANTIC PROPOSALS
→ SEMANTIC CANDIDATE
→ REVIEW
→ CANONICAL WSI SEMANTIC RECORD
```

The compiler separates participants from concepts. A participant reference such as “WE / نا” may identify a participant but is not a semantic key. Function words and structural markers are also excluded from semantic keys by default.

Semantic keys are presentation handles for registered source-semantic concepts; they are not raw-token importance scores.

See `spec/SEMANTIC-CANDIDATE-CONTRACT.md`, `spec/semantic-candidate.schema.json`, `src/semantics/`, and `test/semantics.test.ts`.

## Witness derivation engine — M6

M6 is implemented as a deterministic derivation layer over eligible semantic state:

```text
REVIEWED / ELIGIBLE SEMANTIC STATE
→ WITNESS PATTERN
→ LOCALIZED WITNESS LABEL
→ RESPONSE / CORRECTION
→ POSITIVE DIRECTION
```

Two explicit modes prevent research output from masquerading as production truth:

- `RESEARCH_PREVIEW` may consume `RESEARCHED` semantic state and candidate patterns; output remains `CANDIDATE`.
- `PRODUCTION` requires semantic state, Frames, and Witness Patterns to be `REVIEWED` or `LOCKED`.

The engine fails closed on ambiguous response choices and only resolves positive direction when the selected response points to a registered `DERIVED_TARGET` concept.

For the existing As-Saffat 37:30 research record, M6 reproduces:

```text
TRANSGRESSION
→ boundary-violation
→ OFFSIDE
→ return-to-boundary
→ BOUNDARY_ALIGNMENT
→ POSITIVE
```

without changing the source Frame or source-direction assessment.

See `spec/WITNESS-ENGINE-CONTRACT.md`, `spec/witness-derivation.schema.json`, `src/witness/`, and `test/witness.test.ts`.

## What comes next — M7

M7 applies the same provider → linguistic → semantic → Witness contracts reproducibly at batch scale, with deterministic job identity, resume/retry behavior, provenance-preserving outputs, and explicit stale/revalidation queues.

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
M7 scale / reproducible batch processing
M8 production hardening
M9 release candidate → v1.0
```

See `ROADMAP.md` for acceptance gates.

## Research integrity

WSI must preserve these separations:

- external source identity ≠ WSI identity;
- source text ≠ analysis;
- linguistic candidate ≠ reviewed semantic truth;
- normalized analysis view ≠ provider source replacement;
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
- `UNRESOLVED` and `UNSUPPORTED` are valid outcomes.

## Development and release model

Only two long-lived branches:

```text
dev → promotion PR → main
```

Conventional Commits drive automated versioning, changelog generation, tags, and GitHub Releases.

`dev` is active research. `main` is stable release history.

## Design principle

> **Do not ingest the world twice. Resolve the source, pin it, anchor evidence, analyze language conservatively, review semantics, then Witness.**
