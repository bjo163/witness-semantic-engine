# Witness Semantic Engine

> **Corpus-agnostic, spec-first semantic research infrastructure for transforming declared source corpora into auditable semantic frames, Witness patterns, and positive-direction outputs.**

[![Status](https://img.shields.io/badge/status-research--design-blue)](#project-status)
[![Version](https://img.shields.io/badge/version-0.1.0-informational)](VERSION)
[![Branch model](https://img.shields.io/badge/branches-dev%20%E2%86%92%20main-success)](#development-and-release-model)

## Why this repository exists

Most text research stops at **source → translation → interpretation**. Witness Semantic Engine (WSE) adds a separate machine-readable layer that asks:

1. What exact source corpus, work, edition, and reference system are being analyzed?
2. What does the source explicitly contain?
3. What semantic propositions are supported by evidence?
4. Who or what participates in those propositions?
5. Which contextual senses and language-neutral concepts are involved?
6. What polarity, modality, speech act, and evaluative direction are supported?
7. What pattern can be **witnessed** from reviewed semantics?
8. What response/correction follows?
9. What is the resulting **positive direction**?

The project keeps those questions structurally separate.

## Universal corpus model

WSE does **not** hardcode one scripture as the semantic core.

The normative hierarchy is:

```text
SOURCE CORPUS
  └─ CORPUS INSTANCE
      └─ WORK
          └─ EDITION
              └─ REFERENCE SYSTEM
                  └─ SOURCE UNIT
```

Three universal infrastructure terms are important:

- **Corpus Profile** — declarative description of a corpus family and its source/reference structure.
- **Corpus Instance** — the actual edition/work/reference data selected for research.
- **Corpus Adapter** — implementation code that converts corpus-specific source/linguistic structures into the universal WSI contract.

A profile such as Qur'an, Torah-associated texts, Psalms-associated texts, or Gospel-associated texts is an adapter/profile concern, not a different semantic engine.

The Qur'an may be an early reference implementation, but it is **not** an architectural dependency.

## Core model

```text
SOURCE CORPUS + PROFILE
  ↓
CORPUS INSTANCE / WORK / EDITION / REFERENCE SYSTEM
  ↓
IMMUTABLE SOURCE UNIT
  ↓
LINGUISTIC EVIDENCE
  ↓
LEXICAL SENSE
  ↓
DISCOURSE + PARTICIPANTS
  ↓
SEMANTIC FRAMES / PROPOSITIONS
  ↓
CONCEPTS + RELATIONS
  ↓
POLARITY + MODALITY + SPEECH ACT
  ↓
SOURCE DIRECTION
  ↓
EVIDENCE + CONFIDENCE + REVIEW
  ↓
ASSERTION-LEVEL LOCK (optional production state)
  ↓
WITNESS PATTERN
  ↓
LOCALIZED WITNESS LABEL
  ↓
RESPONSE / CORRECTION
  ↓
POSITIVE DIRECTION
```

The **semantic frame**, not the keyword and not the corpus identity, is the primary semantic unit.

## Key distinction: lock is not corpus lock-in

`LOCKED` is a **review status for semantic assertions/frames**.

It does not mean a corpus is locked into the architecture, and it does not mean theological certainty.

A single Source Corpus may contain `CANDIDATE`, `RESEARCHED`, `REVIEWED`, `LOCKED`, `DISPUTED`, and unresolved assertions at the same time.

## Canonical identity vs human labels

Concept identity is language-neutral:

```text
Machine identity:  wsi:concept/transgression
English label:     TRANSGRESSION
Indonesian label:  Melampaui batas
Display key:       [TRANSGRESSION]
```

English is a technical label, not ontology identity.

Source-language lexical forms are evidence for contextual senses; they are not automatically universal concept IDs.

## Worked example policy

As-Saffat 37:30 is kept as a **non-normative worked example / golden candidate**. It tests distinctions such as speaker/addressee, negation, relation, state, source direction, Witness Pattern, and positive-direction derivation.

It must not define the universal schema by itself.

The `OFFSIDE` example is a localized Witness label, not a source translation and not a canonical ontology concept.

## Research integrity rules

The engine must preserve these boundaries:

- Source Corpus ≠ ontology.
- Corpus Profile ≠ semantic core.
- Edition ≠ abstract revelation.
- Source text is immutable.
- Normalization is a derived view.
- Token ≠ lexeme ≠ lexical sense ≠ concept.
- Participant ≠ concept.
- Discourse role ≠ semantic role.
- Relation ≠ concept.
- Polarity ≠ direction.
- Modality ≠ speech act.
- Translation/commentary ≠ primary source assertion.
- Witness Pattern ≠ Witness Label ≠ canonical concept.
- Positive direction ≠ source direction.
- Cross-corpus semantic similarity ≠ theological equivalence.
- `UNKNOWN`, `UNRESOLVED`, and `UNDETERMINED` are valid outputs.

See **[BLUEPRINT.md](BLUEPRINT.md)** for the normative architecture.

## Machine contract

The current machine-contract work is under `spec/` and uses:

```text
JSON
+ JSON Schema 2020-12
+ versioned registries
+ deterministic semantic invariants
+ research review states
```

Validation is layered:

```text
1. JSON Schema structure
2. Registry referential integrity
3. Semantic invariant validation
4. Corpus-profile / source-integrity validation
5. Research review policy
```

Passing JSON Schema does not mean a semantic interpretation is correct.

## Project status

**Research / architecture phase.**

The repository is intentionally spec-first. Implementation code must not outrun the source, evidence, identity, provenance, and validation contracts.

## Intended implementation path

The specification is implementation-independent.

1. **Python** — first research implementation, multilingual NLP/adapters, schema validation, ontology experimentation, evaluation.
2. **Canonical JSON / JSON Schema** — contract shared across implementations.
3. **JSON-LD / RDF / SKOS / OntoLex / PROV-O / SHACL** — optional interoperability/export layer.
4. **Rust** — optional typed deterministic core/CLI after contract stabilization.
5. **TypeScript/JavaScript** — API, semantic explorer, review UI, visualization, annotation workflows.

The product contract is the specification, not any programming language.

## Development and release model

Only two long-lived working branches are allowed:

```text
dev  ───── promotion PR ─────▶  main
 ↑                              │
 active research                └─ version + changelog + tag + release
```

### `dev`

Active research and implementation. Conventional Commits and policy validation apply.

### `main`

Stable integration/release branch. Changes arrive through `dev → main` promotion.

No standard long-lived `feature/*`, `release/*`, or `hotfix/*` branch model is used.

## Commit convention

Examples:

```text
feat(spec): define corpus profile contract
feat(adapter): add reference corpus adapter
fix(schema): preserve source-unit edition identity
docs(blueprint): clarify corpus-neutral core
refactor(witness): separate pattern from localized label
```

## Release automation

On a releasable push to `main`, automation calculates SemVer from Conventional Commits, updates `VERSION` and `CHANGELOG.md`, creates a tag and GitHub Release, and synchronizes `dev` only when safe.

Repository version, schema version, ontology version, corpus-profile version, adapter version, and source-edition version are separate domains.

## Blueprint principle

> **Do not make a source corpus the ontology. Declare the corpus, preserve the edition, resolve the sense, build the frame, attach evidence, review the assertion — then Witness.**

---

**Witness Semantic Engine** is currently a research architecture. Core contracts and ontology terms may evolve until the first stable specification release.
