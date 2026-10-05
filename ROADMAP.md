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
M4  Linguistic plugins + goldens      NEXT
M5  Semantic frame engine             PLANNED
M6  Witness engine                    PLANNED
M7  Scale / batch processing          PLANNED
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

**Status:** NEXT

Goal:

Introduce language analyzers without coupling them to scripture identity and build a diverse research set before automatic semantic-frame generation.

Planned deliverables:

- language-neutral `LinguisticAnalyzer` plugin contract;
- analyzer provenance/version contract;
- normalized token/morphology/syntax candidate output;
- Arabic reference plugin or adapter;
- Hebrew reference plugin or adapter;
- Greek reference plugin or adapter;
- generic/fallback analyzer contract;
- explicit handling of unsupported linguistic features;
- stratified golden analyses across different languages, source traditions, discourse structures, and semantic constructions;
- deterministic fixtures separating analyzer output from reviewed semantic truth.

Golden analyses MUST NOT be selected only from one scripture, language, or grammatical pattern.

Acceptance gate:

- at least three linguistically distinct language/resource profiles pass the same plugin contract;
- analyzer output is provenance-versioned;
- unsupported features return explicit unresolved/unsupported states rather than invented structure;
- existing M2/M3 suites remain green.

---

## M5 — Semantic frame engine

**Status:** PLANNED

Goal:

Generate auditable research candidates for:

- contextual senses;
- participants;
- semantic roles;
- frames;
- relations;
- concept mappings;
- polarity/modality/speech act;
- assessments;
- confidence/provenance.

Machine proposals remain candidates until review policy permits promotion.

Acceptance must include ambiguous and unresolved examples, not only easy positive cases.

---

## M6 — Witness engine

**Status:** PLANNED

Goal:

Derive, separately from source semantics:

```text
reviewed semantic state
→ Witness Pattern
→ localized Witness label
→ response/correction
→ positive direction
```

The engine MUST preserve `UNRESOLVED` as a valid output and MUST NOT project correction/positive direction backward into source meaning.

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

M4 begins after M3 implementation review:

1. define the language-neutral `LinguisticAnalyzer` interface;
2. define analyzer input/output and provenance contracts;
3. select a stratified set of source resources rather than one scripture-only sample;
4. implement the first reference analyzer adapters;
5. preserve raw analyzer findings separately from reviewed WSI lexical senses and semantic frames;
6. keep M2 deterministic validation and M3 live provider verification as non-regression gates.
