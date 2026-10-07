# Witness Semantic Engine — Roadmap

This file is the project-status source of truth for implementation milestones. Architecture remains normative in `BLUEPRINT.md`.

## Status vocabulary

- `DONE` — implemented and promoted to stable project history.
- `IMPLEMENTED / REVIEW PENDING` — implemented on `dev`; technical acceptance may be green, but promotion/review is still pending.
- `IN PROGRESS` — active work is incomplete.
- `NEXT` — next planned milestone.
- `PLANNED` — defined but not started.

## Current position

```text
M0  Repository foundation             DONE
M1  Provider-bound Machine Contract   IMPLEMENTED / REVIEW PENDING
M2  Deterministic validator           IMPLEMENTED / REVIEW PENDING — CI GREEN
M3  Live RGBL connector               IMPLEMENTED / REVIEW PENDING — LIVE CI GREEN
M4  Linguistic plugins + goldens      IMPLEMENTED / REVIEW PENDING — LIVE CI GREEN
M5  Semantic frame engine             IMPLEMENTED / REVIEW PENDING — CI GREEN
M6  Witness engine                    IMPLEMENTED / REVIEW PENDING — CI GREEN
M7  Scale / batch processing          NEXT
M8  Production hardening              PLANNED
M9  Release candidate → v1.0          PLANNED
```

`main` remains the stable branch. Review-pending work currently lives on `dev` / the open promotion PR.

---

## M0 — Repository foundation

**Status:** DONE

Delivered:

- `dev → main` branch model;
- repository policy checks;
- Conventional Commits policy;
- automated version/release/changelog plumbing;
- README and Blueprint foundation.

Release policy during initial development:

```text
0.x breaking change → next MINOR
0.x feature         → next MINOR
0.x fix/docs/etc.   → next PATCH
>=1.0 breaking      → next MAJOR
```

This prevents research-phase breaking changes from prematurely declaring `1.0.0` stability.

---

## M1 — Provider-bound Machine Contract v0.2

**Status:** IMPLEMENTED / REVIEW PENDING

Delivered on `dev`:

- WSI defined as downstream analysis engine;
- Source Provider boundary;
- RGBL as first provider integration;
- `Source Binding` and `Analysis Target`;
- JSON Schema v0.2.0;
- WSI ID grammar;
- concept/relation/Witness registries;
- Source Direction moved into Assessment;
- real RGBL IDs used by the non-normative 37:30 worked example.

Remaining acceptance gate:

- architecture review;
- PR promotion to `main`.

---

## M2 — Deterministic validator

**Status:** IMPLEMENTED / REVIEW PENDING — CI GREEN

Delivered on `dev`:

- TypeScript validator runtime;
- JSON Schema Draft 2020-12 validation through Ajv;
- registry referential-integrity pass;
- offline Source Binding resolution against pinned provider indexes;
- evidence-selector validation;
- cross-object semantic invariants;
- review-policy validation;
- mutation tests;
- CLI validation of golden candidates;
- CI hook through `npm run check`;
- validation architecture documentation.

Technical acceptance completed on `dev`:

```text
TypeScript typecheck   PASS
validator tests        PASS
golden validation      PASS
repository policy      PASS
```

Important boundary:

```text
M2 validates provider bindings offline.
M2 does not fetch or own canonical provider content.
```

Remaining acceptance gate:

- review;
- promotion to `main`.

---

## M3 — Live RGBL connector

**Status:** IMPLEMENTED / REVIEW PENDING — LIVE CI GREEN

Goal:

Resolve pinned RGBL resources through a stable provider interface without moving source ownership into WSI.

Delivered on `dev`:

- generic runtime `SourceProvider` interface;
- repository-backed `RgblRepositoryProvider` reference transport;
- exact pinned Git revision resolution;
- canonical RGBL resource resolution from `data/core/resources/*.jsonl`;
- textual content/language/script exposure for source proof;
- live `RESOURCE_ONLY` verification;
- literal `TEXT_QUOTE` verification;
- strict `CHAR_RANGE` verification;
- conservative `TOKEN_IDS` handling until provider-stable token indexes exist;
- stale-binding detection (`RESOLVED_BINDING_STALE`);
- CLI command `verify-source`;
- separate `Live Source Provider` GitHub Actions workflow;
- integration tests against the pinned RGBL revision;
- source-anchor correction for the 37:30 worked example after live verification exposed non-exact Uthmani anchors.

Cross-resource acceptance completed:

```text
Qur'an 37:30 passage/content           PASS
Qur'an 37:30 exact evidence selectors PASS
Bhagavad Gita 1:1 passage/content     PASS
TypeScript provider integration       PASS
Live source-provider workflow         PASS
```

The non-Qur'an fixture is intentional: the provider abstraction is validated across structurally different resources without adding scripture-specific semantic branches.

Important boundary:

```text
PROVIDER HEAD MOVED
!=
PINNED ANALYSIS STALE
```

An analysis remains reproducible against its pinned revision as long as that revision, resources, and selectors can still be resolved. A moving provider branch is informational only.

Reference documentation:

- `spec/SOURCE-PROVIDER-CONTRACT.md`
- `spec/RGBL-CONNECTOR.md`
- `spec/VALIDATION.md`

Remaining acceptance gate:

- review;
- promotion to `main`.

---

## M4 — Linguistic plugins + stratified golden analyses

**Status:** IMPLEMENTED / REVIEW PENDING — LIVE CI GREEN

Goal:

Introduce language analyzers without coupling them to scripture identity and build a diverse research set before automatic semantic-frame generation.

Delivered on `dev`:

- language-neutral `LinguisticAnalyzer` plugin interface;
- versioned analyzer descriptor and provenance contract;
- deterministic content-bound linguistic analysis IDs;
- machine-readable `linguistic-analysis.schema.json`;
- Unicode code-point token spans rather than JavaScript-specific UTF-16 interchange offsets;
- deterministic Unicode tokenization and NFC analysis normalization;
- explicit analyzer capability states (`SUPPORTED`, `PARTIAL`, `UNSUPPORTED`);
- explicit annotation states (`RESOLVED`, `UNRESOLVED`, `UNSUPPORTED`);
- separate token fields for normalized form, lemma, UPOS, XPOS, morphology features, and dependencies;
- conservative Arabic baseline reference plugin;
- conservative Hebrew baseline reference plugin;
- conservative Greek baseline reference plugin;
- generic language-neutral fallback plugin;
- linguistic-output invariant validator;
- JSON Schema + mutation/unit tests;
- stratified live golden profiles that store provider bindings rather than duplicate canonical source text;
- live profiles for Arabic/Arab, Hebrew/Hebr, Greek/Grek, and Sanskrit/Deva fallback resources from the same pinned RGBL revision.

The baseline reference plugins intentionally implement only deterministic tokenization and NFC normalization. Lemma, POS, morphology, syntax, sentence segmentation, and discourse cues remain explicit `UNSUPPORTED` values until a deeper analyzer actually supports them.

Technical acceptance completed on the live RGBL gate:

```text
Arabic / Quran 37:30 baseline profile          PASS
Hebrew / OSHB WLC Genesis 1:1 profile          PASS
Greek / SBLGNT John 1:1 profile                PASS
Sanskrit / Bhagavad Gita 1:1 generic fallback PASS
TypeScript linguistic integration              PASS
M3 live provider regression                     PASS
```

Important boundaries:

```text
LINGUISTIC ANALYZER OUTPUT
!=
REVIEWED SEMANTIC TRUTH

NFC ANALYSIS VIEW
!=
PROVIDER SOURCE REPLACEMENT

LANGUAGE ANALYZER
!=
SCRIPTURE ADAPTER
```

Reference documentation:

- `spec/LINGUISTIC-ANALYZER-CONTRACT.md`
- `spec/linguistic-analysis.schema.json`
- `data/linguistic-goldens/profiles.json`

Remaining acceptance gate:

- review;
- promotion to `main`.

---

## M5 — Semantic frame engine

**Status:** IMPLEMENTED / REVIEW PENDING — CI GREEN

Goal:

Generate auditable research candidates for contextual senses, participants, semantic roles, Frames, relations, concept mappings / semantic keys, polarity/modality/speech act, confidence, and provenance.

Delivered on `dev`:

- source-provider-neutral `SemanticCandidate` contract v0.1;
- deterministic TypeScript reference compiler;
- deterministic SHA-256 candidate IDs;
- proposer provenance (`RULE | MANUAL | MODEL | IMPORT`);
- participant candidates structurally separate from concept candidates;
- explicit source roles: `CONTENT | PARTICIPANT_REFERENCE | FUNCTION_WORD | STRUCTURAL | UNKNOWN`;
- semantic keys only from registered `CONTENT` concepts;
- participant references such as “WE / نا” excluded from semantic keys by default;
- function words and structural markers excluded from semantic keys by default;
- unresolved/unregistered concepts preserved without forced key promotion;
- Frame candidates with roles, concepts, relation IDs, polarity, modality, speech act, evidence token IDs, confidence, and candidate-only review state;
- fail-closed structural checks for broken references;
- semantic-candidate invariant validator;
- JSON Schema + deterministic/mutation tests;
- As-Saffat 37:30 and first-person plural `نا` regression coverage.

Critical boundary:

```text
LINGUISTIC OUTPUT
!=
SEMANTIC CANDIDATE
!=
REVIEWED SEMANTIC TRUTH

PARTICIPANT REFERENCE
!=
SEMANTIC KEY
```

M5 does not emit Witness or positive direction. Those remain M6 responsibilities.

---

## M6 — Witness engine

**Status:** IMPLEMENTED / REVIEW PENDING — CI GREEN

Goal:

Derive Witness, response/correction, and positive direction strictly after eligible semantic state exists.

Delivered on `dev`:

- Witness Derivation Contract v0.1 + JSON Schema;
- deterministic TypeScript reference engine;
- canonical WSI record/registry adapters;
- explicit `RESEARCH_PREVIEW` and `PRODUCTION` modes;
- production gate requiring `REVIEWED | LOCKED` semantic state and Frames;
- production gate requiring `REVIEWED | LOCKED` Witness Patterns;
- concept-trigger pattern matching over eligible Frames;
- localized Witness labels kept separate from pattern identity;
- response resolution only when exactly one allowed response exists;
- ambiguous/missing response kept `UNRESOLVED`;
- positive direction resolved only after response resolution;
- positive target required to be a registered `DERIVED_TARGET` concept;
- deterministic derivation IDs;
- no invented theological/truth percentage; exact trigger coverage is retained instead;
- invariant validator and JSON Schema tests;
- As-Saffat 37:30 research-preview regression:
  `TRANSGRESSION → OFFSIDE → RETURN_TO_BOUNDARY → BOUNDARY_ALIGNMENT`;
- production fail-closed regression for unreviewed semantic/pattern state.

Critical boundary:

```text
SOURCE != WITNESS
WITNESS LABEL != WITNESS PATTERN
RESPONSE != SOURCE ASSERTION
POSITIVE DIRECTION != SOURCE DIRECTION
```

---

## M7 — Scale / reproducible batch processing

**Status:** PLANNED

Goal:

Apply the same WSI contract to eligible Source Provider resources without corpus-specific semantic branches.

Scale readiness requires:

- stable provider contract;
- stable validator;
- calibrated review/confidence policies;
- representative golden analyses;
- reproducible batch processing;
- idempotent job identity;
- resume/retry behavior;
- provenance-preserving exports;
- explicit stale/revalidation queues.

Full-Qur'an processing may be one workload, but it is not a separate semantic mode and does not define the universal architecture.

---

## M8 — Production hardening

**Status:** PLANNED

Goal:

Turn a research-capable engine into an operationally reliable system.

Planned acceptance areas:

- dependency locking and reproducible builds;
- schema/registry/ontology migration policy;
- backward-compatibility rules;
- structured error taxonomy;
- retry and failure isolation;
- observability/logging/metrics;
- performance and memory benchmarks;
- security and dependency review;
- provider-outage behavior;
- analysis invalidation and stale detection;
- API/CLI stability policy;
- deterministic export contracts;
- backup/recovery strategy for reviewed analysis data.

Production hardening MUST NOT weaken research provenance or source-provider boundaries for convenience.

---

## M9 — Release candidate → v1.0

**Status:** PLANNED

Goal:

Prove that the architecture is stable across representative source/language/discourse conditions before declaring the public production contract stable.

Release-candidate acceptance suite SHOULD include:

```text
multiple Source Provider resource kinds
multiple languages/scripts
positive / negative / neutral assessments
negation and modality
commands and questions
reported / nested speech
ambiguous lexical senses
unresolved concept mappings
multiple and n-ary participants
Witness resolved / unresolved
provider unavailable
provider binding stale
schema/registry migration compatibility
batch reproducibility
```

`v1.0` means the supported contracts are production-stable. It does **not** mean every possible corpus, language, or theological interpretation has been solved.

---

## Immediate next work

M7 begins after M6 implementation review:

1. define deterministic batch/job identity over provider revision + analysis contracts;
2. process eligible resources without scripture-specific semantic branches;
3. implement resume/retry and failure isolation;
4. preserve source, linguistic, semantic, Witness, and review provenance per output;
5. add stale/revalidation queues when provider bindings or versioned analysis contracts change;
6. prove idempotent reruns on a representative multi-resource batch.
