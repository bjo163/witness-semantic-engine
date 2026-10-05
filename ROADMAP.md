# Witness Semantic Engine — Roadmap

This file is the project-status source of truth for implementation milestones. Architecture remains normative in `BLUEPRINT.md`.

## Status vocabulary

- `DONE` — implemented and promoted to stable project history.
- `IMPLEMENTED / REVIEW PENDING` — implemented on `dev`, acceptance/review still pending.
- `IN PROGRESS` — active work is incomplete.
- `NEXT` — next planned milestone.
- `PLANNED` — defined but not started.

## Current position

```text
M0  Repository foundation             DONE
M1  Provider-bound Machine Contract   IMPLEMENTED / REVIEW PENDING
M2  Deterministic validator           IMPLEMENTED / REVIEW PENDING
M3  Live RGBL connector               NEXT
M4  Linguistic plugins + goldens      PLANNED
M5  Semantic frame engine             PLANNED
M6  Witness engine                    PLANNED
M7  Scale across provider resources   PLANNED
```

`main` remains the stable branch. Work described as review-pending currently lives on `dev` / the open promotion PR.

---

## M0 — Repository foundation

**Status:** DONE

Delivered:

- `dev → main` branch model;
- repository policy checks;
- Conventional Commits policy;
- automated version/release/changelog plumbing;
- README and Blueprint foundation.

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

Acceptance gate:

- architecture review;
- PR promotion to `main`.

---

## M2 — Deterministic validator

**Status:** IMPLEMENTED / REVIEW PENDING

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

Important boundary:

```text
M2 validates provider bindings offline.
M2 does not fetch or own canonical provider content.
```

Acceptance gate:

- typecheck succeeds in CI;
- tests succeed;
- golden candidate validates;
- repository policy succeeds;
- review/promotion to `main`.

---

## M3 — Live RGBL connector

**Status:** NEXT

Goal:

Resolve pinned RGBL resources through a stable provider interface without moving source ownership into WSI.

Planned deliverables:

- `SourceProvider` runtime interface;
- RGBL connector implementation;
- pinned revision resolver;
- resource-kind resolution;
- canonical content resolution;
- quote/range evidence verification;
- stale binding detection;
- provider-resolution test fixtures;
- graceful offline/unavailable behavior.

Non-goals:

- duplicate RGBL datasets;
- Qur'an-specific semantic branches;
- language analysis;
- Witness generation.

---

## M4 — Linguistic plugins + stratified golden analyses

**Status:** PLANNED

Goal:

Introduce language analyzers without coupling them to scripture identity.

Candidate plugins:

- Arabic;
- Hebrew;
- Greek;
- Pali;
- Sanskrit;
- generic/fallback.

Golden analyses must be stratified across different linguistic/discourse structures, not chosen only from one corpus.

---

## M5 — Semantic frame engine

**Status:** PLANNED

Goal:

Generate research candidates for:

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

The engine must preserve `UNRESOLVED` as a valid output.

---

## M7 — Scale

**Status:** PLANNED

Goal:

Apply the same WSI contract to eligible resources across Source Providers, initially RGBL, without corpus-specific semantic branches.

Scale readiness requires:

- stable provider contract;
- stable validator;
- calibrated review/confidence policies;
- representative golden analyses;
- reproducible batch processing;
- provenance-preserving exports.

---

## Immediate next work

After M2 review passes:

1. define the runtime `SourceProvider` interface;
2. choose the stable RGBL access path (SDK, repository package, or API);
3. implement live resolution behind the interface;
4. verify the existing 37:30 evidence anchors against resolved RGBL content;
5. add at least one non-Qur'an provider-resource fixture before declaring the connector abstraction stable.
