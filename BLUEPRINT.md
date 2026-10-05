# Witness Semantic Engine — Blueprint

**Status:** Normative research/engineering blueprint  
**Repository:** `bjo163/witness-semantic-engine`  
**Specification line:** `0.x` research phase  
**Initial repository version:** `0.1.0`

---

## 1. Purpose

Witness Semantic Engine (WSE) is a **spec-first semantic research system** for transforming source text into auditable semantic propositions and then, in a strictly separate derivation layer, producing a **Witness** and a **positive direction**.

The project is intentionally not defined as a translation engine, tafsir engine, keyword extractor, sentiment classifier, or generic LLM prompt collection. Those may contribute evidence or context, but they are not the canonical product contract.

The core research question is:

> **What does the source explicitly assert, what semantic structure is supported by evidence, what can be witnessed from that structure, and what positive direction follows without rewriting the source?**

The canonical transformation is:

```text
SOURCE
  ↓
LINGUISTIC EVIDENCE
  ↓
PARTICIPANTS
  ↓
SEMANTIC FRAMES
  ↓
CONCEPTS + RELATIONS
  ↓
POLARITY + MODALITY
  ↓
SOURCE DIRECTION
  ↓
PROVENANCE + CONFIDENCE
  ↓
BASE SEMANTICS LOCK
  ↓
WITNESS
  ↓
CORRECTION
  ↓
POSITIVE DIRECTION
```

---

# PART I — RESEARCH CONTRACT

## 2. Design principles

### 2.1 Source first

The original source is immutable evidence. Interpretation may explain it but may never silently replace it.

For Qur'anic research:

- Arabic is the primary textual source.
- Translation is a presentation/interpretation aid.
- English is allowed as a technical ontology label.
- Canonical concept identity must remain language-neutral.

### 2.2 Frames before keywords

A semantic keyword by itself loses the most important information: **who, does/is what, toward whom/what, under which polarity and modality**.

Therefore the primary unit is the **semantic frame/proposition**.

A key such as `[AUTHORITY]` is a concept node inside a proposition, not the full proposition.

### 2.3 Separation of concerns

The following are distinct and must not be collapsed:

```text
SOURCE
TOKEN
LEMMA
ROOT
PARTICIPANT
DISCOURSE ROLE
SEMANTIC ROLE
FRAME
RELATION
CONCEPT
POLARITY
MODALITY
SOURCE DIRECTION
CONFIDENCE
WITNESS
CORRECTION
POSITIVE DIRECTION
```

### 2.4 Evidence over forced completeness

The system is allowed to return:

```text
UNKNOWN
UNRESOLVED
UNDETERMINED
```

A missing answer is preferable to an invented semantic claim.

### 2.5 Positive direction does not rewrite negative source

A negative source state remains negative when evidence supports it.

The framework does **not** transform:

```text
NEGATIVE SOURCE → “actually positive”
```

Instead:

```text
NEGATIVE SOURCE
→ WITNESS
→ CORRECTION
→ POSITIVE DIRECTION
```

This distinction is foundational.

---

## 3. Normative terminology

The words below have precise meanings in this project.

### SOURCE
Original textual evidence.

### TOKEN
Stable segment of the source text.

### LINGUISTIC EVIDENCE
Morphology, lemma, root, POS, syntax, grammatical features, and related analysis.

### PARTICIPANT
An entity participating in a semantic frame.

### DISCOURSE ROLE
Position in discourse, e.g. `SPEAKER`, `ADDRESSEE`, `REFERENT`.

### SEMANTIC ROLE
Role inside a frame, e.g. `AGENT`, `PATIENT`, `HOLDER`, `TARGET`, `STATE_BEARER`.

### FRAME
A semantic proposition representing an action, state, relation, event, or attribute.

### RELATION
The semantic connection between frame elements.

### CONCEPT
A language-neutral semantic identity.

### SEMANTIC KEY
A human-readable display label for a canonical concept, e.g. `[TRANSGRESSION]`.

### POLARITY
Whether a proposition is affirmed or negated.

### MODALITY
The assertion mode: asserted, possible, conditional, command, etc.

### SOURCE DIRECTION
Evaluative orientation supported by source context.

### WITNESS
A derived, human-readable observation or metaphor that captures a semantic pattern.

### CORRECTION
A derived description of what must be realigned after the Witness.

### POSITIVE DIRECTION
A derived positive target after correction.

### PROVENANCE
Traceability information connecting an assertion to its source, tokens, method, versions, and review state.

### CONFIDENCE
Operational research confidence—not theological truth percentage.

---

## 4. Layer model

### L0 — Source

Must contain, at minimum:

```text
source_id
source_type
language
canonical_reference
text
```

Example:

```json
{
  "id": "quran:37:30",
  "source_type": "quran",
  "language": "ar",
  "canonical_reference": "37:30",
  "text": "..."
}
```

The source layer is immutable after ingestion except for explicitly versioned source corrections.

---

### L1 — Linguistic evidence

Each token should eventually support:

```text
token_id
surface
lemma
root
pos
morphology
syntax
source_span
analysis_source
```

Rules:

```text
TOKEN ≠ CONCEPT
ROOT ≠ CONCEPT
LEMMA ≠ CONCEPT
POS ≠ CONCEPT
```

A lemma/root may support concept linking, but it does not automatically determine a concept.

---

### L2 — Participants

Participants represent entities, not semantic concepts.

Recommended fields:

```text
participant_id
surface_reference
entity_type
discourse_role
resolved_identity
resolution_status
resolution_evidence
```

Example:

```json
{
  "id": "P1",
  "surface_reference": "WE",
  "discourse_role": "SPEAKER",
  "resolved_identity": null,
  "resolution_status": "UNRESOLVED"
}
```

A contextual interpretation may populate `resolved_identity`, but must never overwrite the surface reference.

---

### L3 — Semantic frames

Canonical frame types for the first version:

```text
ACTION
STATE
RELATION
EVENT
ATTRIBUTE
```

Minimal frame structure:

```text
frame_id
frame_type
predicate_or_relation
participants
concepts
polarity
modality
evidence
confidence
```

Conceptual representation:

```text
P1 ── RELATION ──▶ P2
```

or:

```text
P2 ── HAS_STATE ──▶ CONCEPT
```

Frames may link to other frames through discourse relations.

---

### L4 — Concepts and ontology

Canonical concept IDs are language-neutral URIs/identifiers.

Example:

```text
wsi:concept/authority
wsi:concept/transgression
```

Human labels are metadata:

```json
{
  "id": "wsi:concept/transgression",
  "labels": {
    "en": "Transgression",
    "id": "Melampaui batas",
    "ar": "طغيان"
  },
  "display_key": "TRANSGRESSION"
}
```

Normative rule:

```text
CONCEPT ID = IDENTITY
LABEL = PRESENTATION
```

A label may change without changing concept identity.

Synonyms must not automatically create duplicate concepts. Sense resolution must occur first.

---

### L5 — Polarity and modality

#### Polarity

Initial controlled vocabulary:

```text
AFFIRMED
NEGATED
```

Potential future value:

```text
UNDETERMINED
```

#### Modality

Initial controlled vocabulary:

```text
ASSERTED
POSSIBLE
CONDITIONAL
HYPOTHETICAL
COMMAND
PROHIBITION
QUESTION
```

Rules:

```text
POLARITY ≠ DIRECTION
MODALITY ≠ DIRECTION
```

Do not encode negation into concept identity.

Wrong:

```text
wsi:concept/no-authority
```

Correct:

```text
concept = wsi:concept/authority
polarity = NEGATED
```

---

### L6 — Source direction

Source direction describes evaluative orientation supported by the source context.

Initial vocabulary:

```text
POSITIVE
NEGATIVE
NEUTRAL
MIXED
UNDETERMINED
```

Direction should primarily be attached to a frame/assertion. A verse-level direction is a **derived summary** and therefore optional.

Do not force every verse to have one global direction.

---

### L7 — Evidence and provenance

Every canonical semantic assertion must be traceable.

Minimum provenance:

```text
source_id
evidence_token_ids
evidence_type
extractor_or_researcher
framework_version
ontology_version
extractor_version
review_status
```

Initial evidence types:

```text
DIRECT
COMPOSITIONAL
CONTEXTUAL
INTERPRETIVE
DERIVED
```

Definitions:

- `DIRECT` — lexical evidence supports the concept/state directly.
- `COMPOSITIONAL` — supported by multiple tokens and grammatical structure.
- `CONTEXTUAL` — requires neighboring text or discourse context.
- `INTERPRETIVE` — research interpretation/hypothesis.
- `DERIVED` — algorithmically or logically derived from previously locked semantic data.

Canonical extraction should prefer `DIRECT` and `COMPOSITIONAL` assertions.

---

### L8 — Confidence

Confidence must remain decomposable.

Initial dimensions:

```text
source_directness
lexical_alignment
syntax_support
context_consistency
ontology_fit
```

Initial suggested weighting:

```text
0.30 source_directness
0.25 lexical_alignment
0.20 syntax_support
0.15 context_consistency
0.10 ontology_fit
```

Derived formula:

```text
confidence =
  0.30*S +
  0.25*L +
  0.20*G +
  0.15*C +
  0.10*O
```

The weighting is versioned policy, not eternal truth. It must later be calibrated against reviewed golden data.

Confidence means:

> How strongly does the current evidence and ontology mapping support this research assertion?

It must never be described as a percentage of religious or theological truth.

---

## 5. Base semantics lock

The system must distinguish **draft extraction** from **locked base semantics**.

Suggested states:

```text
DRAFT
REVIEWED
LOCKED
DEPRECATED
```

Witness generation is allowed only after the relevant base semantic frame is at least `REVIEWED`; production Witness data should require `LOCKED`.

This prevents later positive-direction logic from contaminating source extraction.

---

# PART II — WITNESS CONTRACT

## 6. Witness definition

A Witness is a derived observation that makes a semantic condition recognizable without claiming that the Witness label itself appears in the source.

Example:

```text
Canonical concept: TRANSGRESSION
Witness: OFFSIDE
```

`OFFSIDE` is useful because it captures the pattern “crossing a valid boundary,” but it is not a translation and is not a synonym entry in the canonical ontology.

Witness record should eventually contain:

```text
witness_id
observed_frame_ids
label
type
mapped_concepts
reasoning_summary
confidence
provenance
review_status
```

Possible Witness types:

```text
METAPHOR
PATTERN
ANALOGY
OBSERVATION
```

---

## 7. Correction

Correction is generated **after** a Witness has been established.

It answers:

> What must change, stop, return, align, restore, or develop in response to the witnessed condition?

Correction is not automatically the lexical opposite of the source concept.

For example:

```text
TRANSGRESSION
→ OFFSIDE
→ RETURN_TO_BOUNDARY
```

The framework must distinguish a linguistically supported opposite from a derived practical correction.

---

## 8. Positive direction

Positive direction is the desired semantic target after correction.

Example:

```text
RETURN_TO_BOUNDARY
→ BOUNDARY_ALIGNMENT
→ POSITIVE
```

A positive direction record should include:

```text
target_concept_or_state
direction = POSITIVE
derivation_type
derivation_confidence
source_witness_id
```

Rule:

```text
POSITIVE_DIRECTION ≠ SOURCE_DIRECTION
```

The source direction may be negative while the derived target direction is positive.

---

## 9. Witness transformation contract

Canonical flow:

```text
SOURCE STATE
    ↓
OBSERVATION
    ↓
WITNESS
    ↓
CORRECTION
    ↓
TARGET STATE
    ↓
POSITIVE DIRECTION
```

A Witness transformation must fail closed if the system cannot justify the correction.

Allowed result:

```text
WITNESS = OFFSIDE
CORRECTION = UNRESOLVED
POSITIVE_DIRECTION = UNRESOLVED
```

This is preferable to hallucinating a positive prescription.

---

# PART III — EXAMPLE CONTRACT

## 10. As-Saffat 37:30 reference example

This verse is the initial research example because it exposes several distinctions at once: speaker/addressee, negated authority relation, retraction/correction discourse structure, and a negative transgression state.

Conceptual structure:

```text
P1 = WE / SPEAKER
P2 = YOU / ADDRESSEE / GROUP

F1:
P1 ── AUTHORITY_OVER [NEGATED] ──▶ P2

DISCOURSE:
F1 ── RETRACTION/CORRECTION ──▶ F2

F2:
P2 ── HAS_STATE ──▶ [TRANSGRESSION]

F2 SOURCE DIRECTION = NEGATIVE
```

Canonical concept IDs:

```text
wsi:concept/authority
wsi:concept/transgression
```

Witness derivation:

```text
[TRANSGRESSION]
→ OFFSIDE
→ RETURN_TO_BOUNDARY
→ BOUNDARY_ALIGNMENT
→ POSITIVE
```

Important exclusions from canonical direct keys unless separately evidenced:

```text
CHOICE
RESPONSIBILITY
BOUNDARY
```

Those may be useful derived/contextual concepts, but they must not be silently promoted to direct source concepts.

---

# PART IV — MACHINE CONTRACT

## 11. Canonical machine representation

The first implementation contract is JSON validated by JSON Schema.

Conceptual top-level document:

```json
{
  "id": "quran:37:30",
  "spec_version": "...",
  "source": {},
  "tokens": [],
  "participants": [],
  "frames": [],
  "discourse_relations": [],
  "concept_refs": [],
  "derived_summaries": {},
  "witnesses": [],
  "provenance": {},
  "review": {}
}
```

The future schema must enforce structural separation rather than relying on prompt discipline.

---

## 12. Stable identifiers

Recommended ID namespaces:

```text
quran:<surah>:<ayah>
quran:<surah>:<ayah>:<token>
wsi:concept/<slug>
wsi:relation/<slug>
wsi:witness/<slug-or-uuid>
wsi:frame/<source-id>/<local-id>
wsi:participant/<source-id>/<local-id>
```

Examples:

```text
quran:37:30
quran:37:30:10
wsi:concept/transgression
wsi:relation/authority-over
wsi:frame/quran:37:30/F2
```

Stable IDs must survive label changes.

---

## 13. Controlled vocabularies

The project should maintain explicit registries rather than free-text enum values.

Initial registries:

```text
frame_types
entity_types
discourse_roles
semantic_roles
relations
polarity
modality
directions
evidence_types
review_statuses
witness_types
```

Any new controlled value should require:

1. definition;
2. examples;
3. non-examples;
4. migration consideration;
5. ontology/spec version impact assessment.

---

## 14. Validation invariants

The first machine validator must eventually enforce at least:

```text
I01 SOURCE_IS_IMMUTABLE
I02 STABLE_CONCEPT_ID_REQUIRED
I03 SEMANTIC_ASSERTION_REQUIRES_EVIDENCE
I04 PARTICIPANT_IS_NOT_CONCEPT
I05 DISCOURSE_ROLE_IS_NOT_SEMANTIC_ROLE
I06 RELATION_IS_NOT_CONCEPT
I07 POLARITY_IS_NOT_DIRECTION
I08 MODALITY_IS_NOT_DIRECTION
I09 WITNESS_IS_NOT_CANONICAL_CONCEPT
I10 CORRECTION_IS_NOT_SOURCE_ASSERTION
I11 POSITIVE_DIRECTION_IS_NOT_SOURCE_DIRECTION
I12 CONTEXT_CANNOT_OVERWRITE_SURFACE_EVIDENCE
I13 TRANSLATION_CANNOT_CREATE_DIRECT_EVIDENCE_ALONE
I14 MASTER_CONCEPT_IS_OPTIONAL
I15 VERSE_DIRECTION_IS_DERIVED_AND_OPTIONAL
I16 UNRESOLVED_IS_VALID
I17 CONFIDENCE_COMPONENTS_MUST_BE_RETAINED
I18 BASE_MUST_LOCK_BEFORE_PRODUCTION_WITNESS
I19 WITNESS_MUST_EXIST_BEFORE_POSITIVE_DIRECTION
I20 VERSIONED_PROVENANCE_REQUIRED
```

---

## 15. Master concept policy

A “Master Key” is useful for human summarization but is not fundamental semantic data.

Therefore:

```text
master_concept_id = optional
```

If a verse has no clearly dominant concept, the correct output is `null`.

The system must never force a master concept merely to satisfy presentation expectations.

---

## 16. Verse direction policy

A verse-level direction is a derived summary over one or more frame directions.

Possible values:

```text
POSITIVE
NEGATIVE
NEUTRAL
MIXED
UNDETERMINED
```

If frame directions conflict or cannot be fairly summarized, use `MIXED` or `UNDETERMINED` rather than forcing a single polarity-like label.

---

# PART V — ENGINE ARCHITECTURE

## 17. Implementation language strategy

The specification is implementation-independent.

### Phase 1 — Python

Python is preferred initially because the project is research-heavy and will require rapid iteration around:

- Arabic NLP;
- morphology/tokenization integrations;
- ontology experimentation;
- JSON Schema validation;
- RDF/JSON-LD experiments;
- golden dataset tooling;
- analysis notebooks/scripts where appropriate.

### Phase 2 — Rust, optional

Rust becomes attractive once contracts stabilize for:

- strict typed validators;
- deterministic CLI;
- high-throughput batch compilation/indexing;
- embeddable core library;
- stronger runtime guarantees.

Rust must consume the same canonical schema; it must not become a separate semantic implementation with divergent rules.

### Application layer — TypeScript/JavaScript

Suitable later for:

- API gateway;
- semantic explorer;
- graph visualization;
- review interface;
- annotation UI.

### Go

Go remains viable for infrastructure/services but is not the preferred research implementation because it contributes less to the difficult early work: Arabic linguistic analysis and semantic/ontology iteration.

---

## 18. Planned module boundaries

Future implementation should preserve clear boundaries:

```text
source/
linguistics/
participants/
frames/
ontology/
polarity/
modality/
direction/
provenance/
confidence/
validation/
witness/
correction/
positive_direction/
export/
```

The Witness module must consume locked semantic output rather than directly inspecting raw text whenever possible.

---

## 19. No-LLM lock-in rule

LLMs may be used as research assistants or candidate generators, but the canonical data contract must not depend on one model/provider.

Any AI-generated assertion should record:

```text
model/provider if applicable
prompt/spec version
candidate status
human review status
supporting evidence
```

The system must allow deterministic validators and human-reviewed golden data to override model suggestions.

---

# PART VI — GOLDEN DATASET AND TESTING

## 20. Golden records

Reviewed examples are the foundation for trustworthy evolution.

A future golden corpus should contain:

- source;
- token evidence;
- participants;
- semantic frames;
- concepts;
- polarity/modality;
- source direction;
- provenance;
- confidence components;
- Witness;
- correction;
- positive direction;
- review notes.

As-Saffat 37:30 should be one of the first golden records.

---

## 21. Test categories

### Schema tests

Validate structural correctness.

### Invariant tests

Validate framework rules.

### Golden tests

Compare extractor output against approved semantic records.

### Ontology tests

Detect duplicate IDs, orphan references, cyclic constraints where prohibited, and label collisions.

### Migration tests

Ensure old data can be migrated when schema/spec versions change.

### Release tests

Ensure version/changelog generation remains deterministic.

---

# PART VII — VERSIONING

## 22. Version domains

The project will eventually need multiple version domains:

```text
repository_version
spec_version
schema_version
ontology_version
extractor_version
```

At bootstrap only the repository release version is active.

These domains must not be conflated later.

A repository release may change documentation without changing ontology version. An ontology change may require schema migration. A model/extractor update may change candidates without changing the spec.

---

## 23. Repository SemVer

Repository releases use Semantic Versioning.

Highest change class wins:

```text
BREAKING CHANGE / !   → major
feat                   → minor
fix/perf/refactor/...  → patch
```

During early `0.x` research the project may evolve rapidly, but breaking changes should still be explicitly declared rather than hidden.

The repository version is stored in:

```text
VERSION
```

and mirrored by:

```text
Git tag: vX.Y.Z
GitHub Release: vX.Y.Z
CHANGELOG.md section
```

---

## 24. Conventional Commits policy

Allowed initial types:

```text
feat
fix
perf
refactor
docs
test
build
ci
chore
style
revert
```

Recommended scopes:

```text
spec
schema
ontology
source
linguistics
frame
witness
direction
scoring
provenance
validation
repo
release
```

Examples:

```text
feat(ontology): add transgression concept hierarchy
fix(frame): preserve negated relation target
docs(spec): distinguish source and positive direction
refactor(witness): separate correction from observation
ci(repo): enforce dev to main promotion
```

---

# PART VIII — TWO-BRANCH GOVERNANCE

## 25. Branch model

Only two long-lived working branches are allowed:

```text
dev
main
```

### dev

Purpose:

- active research;
- documentation evolution;
- schema/ontology development;
- implementation work.

Direct commits are allowed by design.

### main

Purpose:

- stable integration point;
- release source;
- tagged history.

Human direct pushes should be blocked by server-side repository rules.

Promotion path:

```text
dev → pull request → main
```

No standard `feature/*`, `release/*`, `hotfix/*` workflow is used.

---

## 26. Promotion policy

A promotion from `dev` to `main` should require:

- repository policy workflow passes;
- required files valid;
- Conventional Commit history valid;
- PR review/checklist complete;
- unresolved review conversations cleared;
- no known schema/ontology invariant failures.

A promotion PR may contain multiple commits. Release automation derives the bump from the highest-impact Conventional Commit in the promoted range.

---

## 27. Release without a third branch

The project deliberately does not use release PR tooling that requires additional branches.

After a successful promotion reaches `main`:

```text
main push
  ↓
inspect promoted commits
  ↓
calculate SemVer
  ↓
update VERSION
  ↓
update CHANGELOG
  ↓
commit release metadata to main
  ↓
tag vX.Y.Z
  ↓
publish GitHub Release
```

Post-release synchronization of `dev` is allowed only when it can be performed safely without losing newer `dev` commits.

Force-updating `dev` is prohibited.

---

## 28. Required GitHub settings

Workflow files alone cannot fully protect branches. Server-side repository rules should enforce:

### main

```text
require pull request
require successful checks
require conversation resolution
block force push
block deletion
restrict direct human push
```

### dev

```text
block force push
block deletion
```

The automation may detect violations, but prevention belongs in GitHub rulesets/branch protection.

---

# PART IX — CHANGELOG AND RELEASE NOTES

## 29. Changelog policy

`CHANGELOG.md` is generated from Conventional Commit history.

Release sections should record:

```text
version
date
categorized changes
commit references when practical
breaking changes prominently
```

The changelog is a release artifact, not the canonical research history. Detailed semantic decisions belong in source-controlled specification/ontology records and review discussions.

---

# PART X — SECURITY AND REPRODUCIBILITY

## 30. Automation security

Principles:

- workflows receive minimum required permissions;
- no repository secrets are required for basic bootstrap release flow;
- third-party GitHub Actions should be minimized;
- Dependabot should monitor action versions;
- force pushes by automation are prohibited;
- release automation must not overwrite advanced `dev` state;
- generated releases must be traceable to immutable Git commits.

Later, high-assurance mode may pin external actions to commit SHAs.

---

## 31. Reproducibility

A semantic record should ultimately be reproducible from:

```text
source version
framework/spec version
schema version
ontology version
extractor version
configuration
provenance
```

Two runs under the same deterministic configuration should not silently produce structurally incompatible outputs.

---

# PART XI — RESEARCH REVIEW

## 32. Review states

Recommended future review workflow:

```text
CANDIDATE
RESEARCHED
REVIEWED
LOCKED
DEPRECATED
```

AI/model output begins as `CANDIDATE` unless explicitly produced by deterministic source parsing.

No AI suggestion should automatically become `LOCKED` semantic truth.

---

## 33. Disagreement policy

The architecture must permit competing interpretations without corrupting the source layer.

Possible future design:

```text
one immutable source
multiple interpretation assertions
separate provenance
separate confidence
separate review status
```

This is preferable to overwriting a previous interpretation.

---

# PART XII — ROADMAP

## 34. Milestone 0 — Repository foundation

Goal: establish governance before implementation.

Deliverables:

- README;
- Blueprint;
- two-branch workflow;
- Conventional Commit policy;
- automatic promotion PR;
- automated SemVer/version bump;
- generated changelog;
- automated tag and GitHub release;
- action dependency updates.

No semantic engine code required.

---

## 35. Milestone 1 — Specification package

Deliverables:

```text
JSON Schema
controlled vocabulary registries
concept registry format
relation registry format
provenance model
confidence model
validation rules
```

Exit criterion:

At least several manually reviewed verses can be represented without ad-hoc fields.

---

## 36. Milestone 2 — Golden corpus

Start with carefully selected verses demonstrating different phenomena:

- dialogue;
- negation;
- command/prohibition;
- condition;
- multiple participants;
- temporal/event structure;
- positive/negative/mixed directions;
- ambiguous/coreference cases.

As-Saffat 37:30 is the initial reference candidate.

Exit criterion:

Schema changes are driven by documented edge cases rather than speculation alone.

---

## 37. Milestone 3 — Python research engine

Initial capabilities:

```text
load source
validate source IDs
attach linguistic analysis
construct candidate participants
construct candidate frames
link concepts
calculate confidence
validate invariants
emit canonical JSON
```

Witness generation remains a separate pipeline stage.

---

## 38. Milestone 4 — Witness engine

Capabilities:

```text
consume LOCKED semantic frames
produce Witness candidates
score Witness fit
review/lock Witness
produce correction candidates
produce positive direction candidates
```

No positive direction should be produced directly from raw text without passing through the semantic/Witness contract.

---

## 39. Milestone 5 — Semantic web export

Optional outputs:

```text
JSON-LD
RDF
SHACL validation
knowledge graph import
```

This is an export representation, not a replacement for the project semantics.

---

## 40. Milestone 6 — Typed core / service layer

Evaluate:

- Rust core/CLI if type/performance guarantees are justified;
- TypeScript API/review UI;
- graph visualization;
- batch indexing and search.

Do not migrate languages merely for fashion. Migration must solve a demonstrated requirement.

---

# PART XIII — DECISION RECORD

## 41. Decisions currently locked

The following baseline decisions are considered locked for the repository foundation:

1. The project is spec-first.
2. Semantic frames are primary; keywords are secondary concept references.
3. Source and interpretation remain distinct.
4. Concept identity is language-neutral.
5. English is a technical label, not semantic identity.
6. Participant, relation, concept, polarity, modality, and direction are separate fields.
7. Source direction and positive direction are distinct.
8. Witness is a derived layer, not source/translation/tafsir.
9. Positive direction must pass through Witness/correction logic.
10. Unknown/unresolved states are valid.
11. Every canonical assertion requires evidence/provenance.
12. Confidence is operational and decomposable.
13. Master concept is optional.
14. Verse-level direction is derived and optional.
15. Initial machine contract will be JSON + JSON Schema.
16. Python is the initial research implementation language.
17. Rust is optional after schema stabilization.
18. Only `dev` and `main` are long-lived working branches.
19. Releases occur from `main` without a third release branch.
20. SemVer and Conventional Commits govern repository releases.

Any future change to these decisions should be treated as an explicit architectural change and documented through versioned repository history.

---

# PART XIV — FINAL INVARIANT

The entire project can be summarized by one discipline:

```text
DO NOT STORE INTERPRETATION AS IF IT WERE SOURCE.
DO NOT STORE A SENTENCE AS ONE GIANT KEY.
DO NOT TURN NEGATION INTO A CONCEPT.
DO NOT TURN WITNESS INTO A TRANSLATION.
DO NOT TURN POSITIVE DIRECTION INTO SOURCE MEANING.
```

Instead:

```text
DECOMPOSE
→ RELATE
→ NORMALIZE
→ EVIDENCE
→ SCORE
→ VALIDATE
→ LOCK
→ WITNESS
→ CORRECT
→ MOVE POSITIVELY
```

That sequence is the architectural identity of Witness Semantic Engine.