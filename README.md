# Witness Semantic Engine

> **Spec-first semantic research infrastructure for turning source text into auditable semantic frames, Witness observations, and positive-direction outputs.**

[![Status](https://img.shields.io/badge/status-research--design-blue)](#project-status)
[![Version](https://img.shields.io/badge/version-0.1.0-informational)](VERSION)
[![Branch model](https://img.shields.io/badge/branches-dev%20%E2%86%92%20main-success)](#development-and-release-model)

## Why this repository exists

Most text research stops at **source → translation → interpretation**. Witness Semantic Engine adds a separate, machine-readable layer that asks:

1. What does the source explicitly contain?
2. What semantic propositions are actually asserted?
3. Who or what participates in those propositions?
4. Which language-neutral concepts are instantiated?
5. What polarity, modality, and evaluative direction are supported by evidence?
6. What can be **witnessed** from that semantic state?
7. What correction or alignment follows from that witness?
8. What is the resulting **positive direction**?

The project is designed to keep those questions separate. A translation is not a semantic key. A participant is not a concept. Negation is not direction. A Witness label is not source text. Positive direction must never overwrite the source state.

## Core model

```text
SOURCE
  ↓
LINGUISTIC EVIDENCE
  ↓
PARTICIPANTS
  ↓
SEMANTIC FRAMES / PROPOSITIONS
  ↓
CONCEPTS + RELATIONS
  ↓
POLARITY + MODALITY
  ↓
SOURCE DIRECTION
  ↓
EVIDENCE + CONFIDENCE
  ↓
LOCKED BASE SEMANTICS
  ↓
WITNESS
  ↓
CORRECTION
  ↓
POSITIVE DIRECTION
```

The **semantic frame**, not the keyword, is the primary unit of meaning.

## Non-negotiable separation

| Layer | Question | Example |
| --- | --- | --- |
| Source | What is written? | Original Arabic text |
| Linguistic | What form does the language take? | token, lemma, root, POS, syntax |
| Participant | Who/what is involved? | speaker, addressee, group |
| Frame | What is happening? | `P1 → AUTHORITY_OVER → P2` |
| Concept | What universal concept is instantiated? | `wsi:concept/authority` |
| Polarity | Is it affirmed or negated? | `NEGATED` |
| Source direction | How is the state evaluated in context? | `NEGATIVE` |
| Witness | What pattern is observed? | `OFFSIDE` |
| Correction | What needs realignment? | `RETURN_TO_BOUNDARY` |
| Positive direction | Where should the correction move? | `BOUNDARY_ALIGNMENT` |

## Canonical identity vs human labels

Concept identity is language-neutral.

```text
Machine identity:  wsi:concept/transgression
English label:     TRANSGRESSION
Indonesian label:  Melampaui batas
Arabic label:      طغيان
Display key:       [TRANSGRESSION]
```

English is a technical label, **not** the ontology identity. For Qur'anic research, Arabic remains the primary source evidence.

## Example: As-Saffat 37:30

The conceptual result can be represented as:

```text
P1 (WE / SPEAKER)
   ── AUTHORITY_OVER [NEGATED] ──▶
P2 (YOU / ADDRESSEE / GROUP)

P2
   ── HAS_STATE ──▶
[TRANSGRESSION]

SOURCE DIRECTION: NEGATIVE
WITNESS:          OFFSIDE
CORRECTION:       RETURN_TO_BOUNDARY
POSITIVE DIRECTION: BOUNDARY_ALIGNMENT
```

The key distinction is that **OFFSIDE is a Witness label**, not a translation of the source and not a canonical ontology concept.

## Research integrity rules

The engine must preserve the following invariants:

- Source text is immutable.
- Every canonical concept has a stable ID.
- Every semantic assertion has provenance/evidence.
- Participant ≠ concept.
- Discourse role ≠ semantic role.
- Relation ≠ concept.
- Polarity ≠ direction.
- Modality ≠ direction.
- Witness ≠ source, translation, tafsir, or canonical concept.
- Correction ≠ source assertion.
- Positive direction ≠ source direction.
- Context may resolve ambiguity but may not overwrite surface evidence.
- `UNKNOWN`, `UNRESOLVED`, and `UNDETERMINED` are valid outputs.
- Base semantics must be locked before Witness derivation.
- Witness must be established before positive-direction derivation.

See **[BLUEPRINT.md](BLUEPRINT.md)** for the normative architecture and implementation plan.

## Project status

**Research / architecture phase.**

The repository intentionally starts **spec-first**. The first milestone is not an NLP model; it is a stable contract for evidence, semantic frames, ontology IDs, provenance, scoring, validation, Witness derivation, and release governance.

No production extractor should be built until the specification and golden examples are stable enough to test deterministically.

## Intended implementation path

The specification is language-independent. The planned implementation order is:

1. **Python** — research engine, Arabic NLP integration, schema validation, ontology experiments, golden-test tooling.
2. **Canonical JSON / JSON Schema** — contract shared across languages.
3. **JSON-LD / RDF / SHACL** — optional semantic-web export and graph validation.
4. **Rust** — optional phase-2 deterministic core/CLI when schemas stabilize and performance/type guarantees justify it.
5. **JavaScript/TypeScript** — API, explorer, visualization, and application layer when needed.

The repository must never become “a Python project that happens to contain a specification.” The **specification is the product contract**; implementations are replaceable.

## Development and release model

Only two long-lived working branches are allowed:

```text
dev  ───── promotion PR ─────▶  main
 ↑                              │
 active research                └─ version + changelog + tag + release
```

### `dev`

- Active research and implementation branch.
- Direct development happens here.
- Every commit must follow **Conventional Commits**.
- CI/policy validation runs on every push.
- A promotion PR from `dev` to `main` is created/maintained automatically when meaningful differences exist.

### `main`

- Stable, releasable branch.
- Changes arrive through `dev → main` promotion.
- A push/merge to `main` triggers automated semantic versioning and release generation.
- Release metadata is committed directly to `main`; no release branch is created.

### No additional working branches

The project deliberately does **not** use `feature/*`, `release/*`, or `hotfix/*` branches in the normal workflow. This keeps research state obvious and prevents ontology/schema work from fragmenting across long-lived branches.

## Commit convention

Use Conventional Commits:

```text
feat(ontology): add participant role model
fix(scoring): correct confidence normalization
docs(blueprint): clarify witness derivation
refactor(frame): separate relation from concept
chore(repo): update repository governance
```

Breaking change:

```text
feat(schema)!: replace legacy direction representation
```

or include a `BREAKING CHANGE:` footer.

### Automated version policy

The release workflow chooses the **highest** required bump in the promoted change set:

| Change | Version bump |
| --- | --- |
| `!` / `BREAKING CHANGE:` | major |
| `feat` | minor |
| `fix`, `perf`, `refactor`, `docs`, `build`, `ci`, `test`, `style`, `chore` | patch |
| no recognized releasable commit | no release |

The current project starts at **`0.1.0`**. During `0.x`, the project should still treat breaking changes explicitly; the automation follows standard SemVer major/minor/patch arithmetic rather than silently redefining SemVer.

## Release automation

On a releasable push to `main`, automation will:

1. inspect Conventional Commit messages in the promoted range;
2. calculate the next SemVer;
3. update `VERSION`;
4. prepend the generated release section to `CHANGELOG.md`;
5. commit release metadata to `main`;
6. create `vX.Y.Z` tag;
7. publish a GitHub Release;
8. fast-forward `dev` to the release commit **only when safe**; if `dev` has advanced independently, it is left untouched rather than force-updated.

No release branch is required.

## Repository automation

The bootstrap automation covers:

- Conventional Commit validation on `dev`;
- `dev → main` pull-request policy;
- automatic promotion PR creation;
- repository invariant checks;
- automated SemVer bumping;
- automated `CHANGELOG.md` generation;
- automated Git tag and GitHub Release creation;
- safe post-release `dev` synchronization;
- Dependabot updates for GitHub Actions;
- CODEOWNERS and a promotion-review checklist.

## Recommended GitHub repository settings

Some controls are repository settings rather than files and therefore must be enabled in GitHub settings:

### `main`

- Require a pull request before merging.
- Require successful status checks.
- Require conversation resolution.
- Block force pushes and deletion.
- Prefer **squash** or **rebase**; if merge commits are retained, Conventional Commit validation still applies to the underlying promoted commits.
- Do not allow direct human pushes.

### `dev`

- Block force pushes and deletion.
- Direct pushes are allowed for the intentionally two-branch workflow.
- Require CI to pass before promoting to `main`.

> Repository rulesets/branch protection should be configured in GitHub Settings. The committed workflows reinforce policy but cannot replace server-side protection against direct pushes.

## Version sources

- `VERSION` — canonical repository release version.
- `CHANGELOG.md` — generated human-readable release history.
- Git tags — immutable release markers (`vX.Y.Z`).
- GitHub Releases — published release notes.

Application/package metadata will later consume the canonical version rather than inventing a second independent version source.

## Blueprint

The normative research and engineering design is maintained in **[BLUEPRINT.md](BLUEPRINT.md)**. It defines:

- source and evidence model;
- participants and semantic roles;
- frame/proposition representation;
- concept registry rules;
- polarity, modality, direction, and confidence;
- Witness and positive-direction derivation;
- provenance and review status;
- machine-readable contract;
- validation invariants;
- golden datasets;
- release/versioning governance;
- phased implementation plan.

## Design principle

> **Do not store interpretation as if it were source. Do not store a sentence as one giant key. Decompose, relate, normalize, evidence, score, validate, lock — then Witness.**

---

**Witness Semantic Engine** is currently a research architecture. Interfaces and ontology terms may evolve until the first stable specification release.