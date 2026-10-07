# Witness Semantic Engine — Blueprint

**Status:** normative research/engineering blueprint  
**Blueprint revision:** `3.2-draft`  
**Machine Contract:** `0.2.0`  
**Architecture:** source-provider-neutral downstream semantic analysis engine  
**First Source Provider integration:** `rocksoul-rgbl`

---

# 0. Normative language

The words **MUST**, **MUST NOT**, **REQUIRED**, **SHOULD**, **SHOULD NOT**, **MAY**, and **OPTIONAL** are normative requirements.

WSI is **spec-first**. Code, prompts, models, databases, workers, APIs, and UIs are subordinate to this Blueprint and the versioned Machine Contract.

A source corpus, scripture, language, edition, translation, canon, numbering system, or textual tradition MUST NOT define the universal semantic core.

---

# PART I — MISSION AND BOUNDARY

## 1. Purpose

Witness Semantic Engine (WSI) is a downstream semantic-analysis engine.

It consumes addressable resources from a Source Provider and produces auditable analysis:

```text
SOURCE PROVIDER RESOURCE(S)
  ↓
SOURCE BINDING
  ↓
EVIDENCE ANCHORS
  ↓
LINGUISTIC / CONTEXTUAL SENSE ANALYSIS
  ↓
DISCOURSE + PARTICIPANTS
  ↓
SEMANTIC FRAMES / PROPOSITIONS
  ↓
CONCEPT + RELATION MAPPING
  ↓
ASSESSMENTS
  ↓
CONFIDENCE + ANALYSIS PROVENANCE
  ↓
REVIEW
  ↓
WITNESS PATTERN
  ↓
LOCALIZED WITNESS LABEL
  ↓
RESPONSE / CORRECTION
  ↓
POSITIVE DIRECTION
```

The primary semantic unit is a **Frame/Proposition**, not a keyword, verse, ayah, paragraph, book, or corpus.

## 2. What WSI does not own

WSI does **not** own:

```text
canonical source text
corpus/dataset identity
work/expression/edition identity
source artifact identity
passage/fragment/content identity
citation/reference schemes
source rights/license metadata
source checksums
source acquisition provenance
source variants/textual alignments
```

These belong to the Source Provider.

## 3. What WSI owns

WSI owns downstream analysis only:

```text
source bindings
analysis targets
analysis-local evidence anchors
lexical/contextual sense candidates
utterance/discourse analysis
analysis participants
semantic frames
semantic-role bindings
concept mappings
relation mappings
polarity
modality
speech-act analysis
semantic assessments
analysis confidence
analysis provenance
review state
Witness Pattern instances
localized Witness labels
response/correction
positive direction
cross-analysis semantic mappings
```

Core invariant:

```text
SOURCE PROVIDER DATA != WSI ANALYSIS DATA
```

---

# PART II — SOURCE PROVIDER CONTRACT

## 4. Provider neutrality

WSI MUST NOT contain semantic branches such as:

```text
if corpus == quran
if corpus == torah
if corpus == gospels
```

Source/corpus-specific ingestion belongs upstream.

WSI consumes a generic **Source Provider Contract**.

The first provider is:

```text
provider   = rocksoul-rgbl
namespace  = mw
repository = bjo163/rocksoul-rgbl
```

A future provider MAY be supported if it satisfies the same minimum contract.

## 5. Minimum provider capability

A provider integration MUST be able to resolve:

```text
stable resource ID
resource kind/type
pinned provider revision or immutable release
content or content linkage
language/script when available
source provenance
source integrity/checksum when available
resource relationships needed to interpret scope
```

WSI references this information; it does not redefine it.

## 6. Source Binding

Every analysis MUST contain one or more Source Bindings.

A Source Binding pins the external snapshot against which analysis was produced.

Minimum fields:

```text
id
provider
provider_contract
provider_revision
primary_resource_id
resource_ids[]
resolution_status
```

Reviewed or locked analysis MUST NOT rely only on a moving provider ref such as `main` or `latest`.

## 7. Analysis Target

Every WSI record identifies its primary external target:

```text
analysis_target = source_binding_id + resource_id
```

The target may be a passage, paragraph, fragment, manuscript segment, content object, commentary passage, or another addressable provider resource.

WSI MUST NOT assume the universal target is a verse/ayah.

## 8. No canonical source copy

Canonical primary text MUST NOT be duplicated into WSI as source authority.

WSI MAY retain small quote/range/token selectors for evidence anchoring.

```text
QUOTE / RANGE / TOKEN SELECTOR = EVIDENCE ANCHOR
EVIDENCE ANCHOR != SOURCE AUTHORITY
```

If an anchor conflicts with the pinned provider content, provider content wins and the WSI analysis becomes stale until reviewed.

## 9. Runtime SourceProvider boundary

The machine-level provider boundary MUST remain transport-neutral.

Conceptually a runtime provider supports:

```text
verifyRevision(revision)
currentRevision()
resolveResource(revision, resourceId, hints?)
```

WSI semantic code MUST NOT depend directly on:

```text
provider repository layout
provider HTTP route layout
provider database tables
provider SDK implementation classes
```

A repository, SDK, API, or database connector MAY implement the same logical interface.

Provider-specific metadata MAY be used as a resolution hint, but a hint MUST NOT become semantic identity.

---

# PART III — EVIDENCE

## 10. Evidence dimensions

Every semantic assertion MUST be traceable to evidence.

Evidence records:

```text
source_binding_id
resource_id
source_class
derivation_type
selector
notes
```

### Source classes

```text
PRIMARY_TEXT
TRANSLATION
LEXICON
GRAMMAR
COMMENTARY
CROSS_REFERENCE
MODEL_SUGGESTION
HUMAN_ANALYSIS
```

### Derivation types

```text
DIRECT
COMPOSITIONAL
CONTEXTUAL
INTERPRETIVE
DERIVED
```

These dimensions are independent.

## 11. Selectors

Initial selectors:

```text
RESOURCE_ONLY
TEXT_QUOTE
CHAR_RANGE
TOKEN_IDS
```

Selectors are provider-relative.

A local token number MUST NOT be treated as globally stable unless the tokenizer/analyzer identity is recorded in analysis provenance.

A `TEXT_QUOTE` used as live primary-source proof MUST match the pinned provider representation literally. Unicode normalization, fuzzy matching, stemming, translation, or reconstructed spelling MUST NOT silently substitute for source proof.

If a normalized linguistic form is needed, store it in the analysis layer while retaining an exact provider-relative evidence anchor.

---

# PART IV — ANALYSIS MODEL

## 12. Lexical/contextual sense

A lexical form is not a concept.

```text
SURFACE FORM
→ LEMMA / LEXEME
→ CONTEXTUAL SENSE
→ FRAME ROLE
→ OPTIONAL CONCEPT MAPPING
```

Rules:

```text
TOKEN != LEXEME
LEXEME != SENSE
LEMMA != CONCEPT
ROOT != CONCEPT
TRANSLATION STRING != CONCEPT ID
```

A sense MAY remain unmapped.

## 13. Discourse scope

Utterance scope SHOULD be represented when meaning depends on speaker, addressee, narration, quotation, or reported speech.

```text
SPEAKER != AGENT
ADDRESSEE != PATIENT
```

Nested utterances MAY be represented explicitly.

## 14. Participants

Participants are analysis-local discourse/semantic referents.

A participant MAY link to an external entity when available, but unresolved identity is valid:

```text
surface_reference = WE
resolved_identity = null
resolution_status = UNRESOLVED
```

Contextual resolution MUST NOT overwrite the source surface reference.

## 15. Semantic Frames

Frames are the canonical structural unit of WSI.

Initial frame classes:

```text
ACTION
STATE
RELATION
EVENT
ATTRIBUTE
```

A Frame may contain:

```text
predicate/relation candidate
semantic-role bindings
concept mappings
polarity
modality
speech act
source evidence
confidence
review status
```

Frames MUST support n-ary argument structures.

Example:

```text
GIVE
  AGENT      → P1
  THEME      → P2
  RECIPIENT  → P3
  LOCATION   → P4
```

A Frame MUST NOT be reduced to one generic subject-predicate-object triple when information would be lost.

## 16. Concept / relation separation

```text
CONCEPT  = AUTHORITY
RELATION = AUTHORITY_OVER
POLARITY = NEGATED
```

Do not canonicalize composites such as:

```text
NO_AUTHORITY_OVER_YOU
```

## 17. Polarity

Initial values:

```text
AFFIRMED
NEGATED
UNDETERMINED
```

Polarity is a proposition property.

## 18. Modality

Initial values:

```text
ASSERTED
POSSIBLE
PROBABLE
NECESSARY
HYPOTHETICAL
COUNTERFACTUAL
UNDETERMINED
```

Modality is not speech act.

## 19. Speech act

Initial values:

```text
STATEMENT
COMMAND
PROHIBITION
QUESTION
OATH
REQUEST
PROMISE
WARNING
SUPPLICATION
OTHER
UNDETERMINED
```

---

# PART V — ASSESSMENTS

## 20. Evaluation is separate from Frame structure

An evaluative judgement MUST NOT be silently embedded as intrinsic semantic structure.

Therefore source direction is represented as an **Assessment**.

Wrong:

```text
frame.source_direction = NEGATIVE
```

Preferred:

```text
FRAME F2
  ↓
ASSESSMENT A2
  assessment_type = SOURCE_DIRECTION
  result          = NEGATIVE
```

## 21. Direction vocabulary

```text
POSITIVE
NEGATIVE
NEUTRAL
MIXED
UNDETERMINED
```

```text
POLARITY != DIRECTION
MODALITY != DIRECTION
SPEECH_ACT != DIRECTION
```

## 22. Assessment contract

An Assessment SHOULD contain:

```text
target
assessment_type
result
method_id
evidence
confidence
review_status
```

A whole-record direction summary is OPTIONAL and derived from local assessments.

---

# PART VI — ONTOLOGY

## 23. Language-neutral identity

Canonical concept IDs are machine identities:

```text
wsi:concept/authority
wsi:concept/transgression
```

Labels are presentation metadata.

```text
CONCEPT ID = IDENTITY
LABEL = PRESENTATION
LEXICAL FORM = SOURCE-LANGUAGE EVIDENCE
```

No natural language is the hidden ontology master language.

## 24. Conservative concept mapping

Cross-language equivalence MUST NOT be inferred from identical translation strings.

Arabic, Hebrew, Greek, Pali, Sanskrit, English, Indonesian, and other expressions map to one concept only after contextual-sense evidence supports that mapping.

Unmapped is preferable to false equivalence.

---

# PART VII — CONFIDENCE, PROVENANCE, REVIEW

## 25. Confidence

Confidence is operational research confidence, never theological truth percentage.

It MUST be policy-versioned and decomposable:

```text
policy_id
policy_version
components
aggregate
```

## 26. Analysis provenance

WSI provenance describes how analysis was produced.

It MUST NOT duplicate Source Provider acquisition provenance.

Minimum fields:

```text
framework_version
contract_version
registry_version
ontology_version
analyzer_version
created_at
created_by
```

AI-generated candidates SHOULD record model/policy metadata when available.

## 27. Review lifecycle

Initial lifecycle:

```text
CANDIDATE
RESEARCHED
REVIEWED
LOCKED
DISPUTED
DEPRECATED
```

`LOCKED` means an analysis object has passed the configured review process.

It does **not** mean:

```text
corpus lock-in
theological infallibility
permanent ontology immutability
```

`UNRESOLVED` remains a valid semantic outcome.

---

# PART VIII — WITNESS

## 28. Witness Pattern

A Witness Pattern is a stable derived pattern identity:

```text
wsi:witness-pattern/boundary-violation
```

## 29. Witness Label

A Witness Label is localized human-facing presentation:

```text
OFFSIDE
```

Therefore:

```text
OFFSIDE != SOURCE TRANSLATION
OFFSIDE != CANONICAL CONCEPT
OFFSIDE != WITNESS PATTERN ID
```

## 30. Witness derivation

Production Witness generation SHOULD consume reviewed/locked Frames and relevant Assessments.

Research preview MAY consume `RESEARCHED` input, but resulting Witness data remains provisional.

```text
WITNESS = UNRESOLVED
```

is valid.

## 31. Response / correction

Possible responses include:

```text
RETURN
ALIGN
STOP
AVOID
MAINTAIN
CULTIVATE
RESTORE
UNRESOLVED
```

A response is derived and MUST NOT be projected backward into source wording.

## 32. Positive Direction

```text
POSITIVE_DIRECTION != SOURCE_DIRECTION ASSESSMENT
```

Conceptual flow:

```text
NEGATIVE SOURCE CONDITION
→ Witness Pattern
→ localized Witness label
→ response / correction
→ positive target state
```

A positive direction MAY remain unresolved.

---

# PART IX — RGBL INTEROPERABILITY

## 33. RGBL as first Source Provider

`rocksoul-rgbl` already owns generic provenance-first source objects including:

```text
ENTITY
RESOURCE
ASSERTION
EVIDENCE
PROVENANCE
ASSESSMENT
```

and textual-profile objects including:

```text
WORK
EXPRESSION
EDITION
ARTIFACT
PASSAGE
CONTENT
ALIGNMENT
VARIANT
```

WSI SHOULD reuse RGBL canonical IDs directly instead of creating duplicate scripture/source objects.

## 34. Example RGBL identifiers

For the pinned Tanzil Uthmani dataset, RGBL exposes identifiers such as:

```text
mw:work:quran
mw:expression:quran:ar-uthmani-tanzil-1.1
mw:edition:quran:tanzil-1.1-uthmani
mw:artifact:quran:tanzil-1.1-uthmani
mw:passage:quran:37:30
mw:content:quran:37:30:ar-uthmani
```

These remain RGBL-owned identities.

## 35. RGBL reference connector

The first runtime transport is `RgblRepositoryProvider`.

It resolves resources from a local RGBL Git checkout using the exact revision pinned by the analysis rather than a moving branch.

Conceptually:

```text
WSI Source Binding
  ↓
pinned RGBL Git commit
  ↓
RGBL resource partitions
  ↓
canonical resource ID
  ↓
provider content used only for source verification
```

The repository connector is a **reference transport**, not a permanent storage coupling. Future RGBL SDK/API/database connectors MAY implement the same `SourceProvider` interface.

The M3 acceptance suite resolves both:

```text
mw:passage:quran:37:30
mw:content:quran:37:30:ar-uthmani
```

and a structurally separate resource:

```text
mw:passage:hinduism:bhagavad-gita:1:1
mw:content:hinduism:bhagavad-gita:1:1:sa
```

through the same interface.

This tests interoperability only; it is not a theological-equivalence assertion.

## 36. Linguistic plugins replace corpus adapters

WSI does not need scripture-specific ingestion adapters.

It MAY use language analyzers such as:

```text
Arabic analyzer
Hebrew analyzer
Greek analyzer
Pali analyzer
Sanskrit analyzer
Generic/fallback analyzer
```

A language analyzer is an analysis tool, never source authority.

---

# PART X — MACHINE CONTRACT v0.2

## 37. Canonical record

```text
record_id
contract_version
analysis_target
source_bindings[]
lexical_senses[]
utterances[]
participants[]
frames[]
discourse_relations[]
concept_refs[]
assessments[]
witnesses[]
provenance
review
```

WSI deliberately does not contain canonical corpus/work/edition/passage/content records.

## 38. Identity policy

WSI-owned IDs identify WSI-owned objects only.

```text
wsi:analysis/<opaque-id>
wsi:concept/authority
wsi:relation/authority-over
wsi:witness-pattern/boundary-violation
```

External Source Provider IDs remain external:

```text
mw:passage:quran:37:30
```

---

# PART XI — VALIDATION AND LIVE SOURCE PROOF

## 39. Deterministic validation passes

The canonical offline validation order is:

```text
1. JSON_SCHEMA
2. WSI_REGISTRY_REFERENTIAL_INTEGRITY
3. SOURCE_BINDING_RESOLUTION
4. EVIDENCE_SELECTOR_RESOLUTION
5. WSI_SEMANTIC_INVARIANTS
6. REVIEW_POLICY
```

JSON validity is not semantic correctness.

## 40. Offline deterministic validator

Milestone 2 implements an offline validator in TypeScript.

It validates:

```text
schema shape
controlled vocabularies
concept/relation/Witness registries
local and cross-object references
Source Binding consistency
offline pinned provider indexes
evidence selector shape
semantic invariants
review lifecycle rules
```

The validator MUST NOT fetch canonical source content merely to complete ordinary CI.

Pinned provider indexes under `spec/providers/` are reproducibility indexes only.

```text
PROVIDER INDEX != SOURCE AUTHORITY
```

Milestone 2 technical acceptance has passed on `dev`.

## 41. Live provider resolution

Milestone 3 implements live Source Provider verification as a separate runtime/CI layer.

It proves:

```text
pinned revision exists
bound provider resources exist
analysis target resolves
TEXT_QUOTE matches provider content literally
CHAR_RANGE resolves against provider content
claimed RESOLVED binding remains demonstrably resolved
```

`TOKEN_IDS` are not treated as live-verifiable until a provider transport exposes a compatible tokenizer-stable index.

A moving provider `HEAD` MUST NOT by itself make a pinned analysis stale:

```text
CURRENT PROVIDER HEAD != PINNED ANALYSIS REVISION
```

If the pinned revision remains resolvable, it remains the reproducibility authority for that analysis.

If required resources or selectors fail at the pinned snapshot while the binding claims `RESOLVED`, WSI emits a stale-binding finding and requires explicit review rather than silently mutating the record.

M3 live acceptance has passed on `dev` for both Qur'an 37:30 and Bhagavad Gita 1:1.

See:

- [`spec/VALIDATION.md`](spec/VALIDATION.md)
- [`spec/RGBL-CONNECTOR.md`](spec/RGBL-CONNECTOR.md)

---

# PART XII — CORE INVARIANTS

## 42. Required invariants

```text
I01 WSI_DOES_NOT_OWN_PRIMARY_SOURCE
I02 EXTERNAL_RESOURCE_ID_MUST_REMAIN_EXTERNAL
I03 SOURCE_BINDING_MUST_PIN_PROVIDER_REVISION
I04 ANALYSIS_TARGET_MUST_RESOLVE
I05 CANONICAL_SOURCE_TEXT_MUST_NOT_BE_DUPLICATED_AS_WSI_AUTHORITY
I06 EVERY_SEMANTIC_ASSERTION_REQUIRES_EVIDENCE
I07 EVIDENCE_MUST_REFERENCE_A_SOURCE_BINDING
I08 LEXEME_IS_NOT_SENSE
I09 SENSE_IS_NOT_AUTOMATICALLY_CONCEPT
I10 PARTICIPANT_IS_NOT_CONCEPT
I11 DISCOURSE_ROLE_IS_NOT_SEMANTIC_ROLE
I12 RELATION_IS_NOT_CONCEPT
I13 POLARITY_IS_NOT_DIRECTION
I14 MODALITY_IS_NOT_SPEECH_ACT
I15 DIRECTION_IS_AN_ASSESSMENT
I16 TRANSLATION_ALONE_CANNOT_CREATE_PRIMARY_SOURCE_AUTHORITY
I17 COMMENTARY_CANNOT_OVERWRITE_PRIMARY_SOURCE
I18 CONTEXT_CANNOT_OVERWRITE_SURFACE_REFERENCE
I19 UNIVERSAL_CONCEPT_MAPPING_MAY_BE_UNRESOLVED
I20 CONFIDENCE_POLICY_MUST_BE_VERSIONED
I21 WITNESS_IS_NOT_CANONICAL_CONCEPT
I22 WITNESS_LABEL_IS_NOT_WITNESS_PATTERN
I23 RESPONSE_IS_NOT_SOURCE_ASSERTION
I24 POSITIVE_DIRECTION_IS_NOT_SOURCE_DIRECTION
I25 UNRESOLVED_IS_VALID
I26 WSI_PROVENANCE_IS_NOT_SOURCE_ACQUISITION_PROVENANCE
I27 LOCK_IS_ASSERTION_REVIEW_STATE_NOT_CORPUS_AUTHORITY
I28 PROVIDER_INDEX_IS_NOT_PROVIDER_AUTHORITY
I29 OFFLINE_VALIDATION_MUST_NOT_REQUIRE_NETWORK
I30 LIVE_PROVIDER_RESOLUTION_MUST_NOT_CHANGE_SEMANTIC_RULES
I31 PROVIDER_TRANSPORT_MUST_NOT_DEFINE_SEMANTIC_IDENTITY
I32 EXACT_PRIMARY_SOURCE_ANCHOR_MUST_MATCH_PINNED_PROVIDER_CONTENT
I33 PROVIDER_HEAD_MOVEMENT_ALONE_DOES_NOT_INVALIDATE_PINNED_ANALYSIS
```

---

# PART XIII — WORKED EXAMPLE POLICY

## 43. As-Saffat 37:30

As-Saffat 37:30 is a **non-normative worked example** only.

```text
TARGET: mw:passage:quran:37:30

F1
P1 ── AUTHORITY_OVER [NEGATED] ──▶ P2

F2
P2 ── HAS_STATE ──▶ TRANSGRESSION

A2
F2 ── SOURCE_DIRECTION ──▶ NEGATIVE

W1
F2
→ BOUNDARY_VIOLATION
→ OFFSIDE
→ RETURN / ALIGN
→ BOUNDARY_ALIGNMENT
```

It tests the contract; it does not define the universal contract.

The exact source anchors for this candidate are live-verified against the pinned RGBL/Tanzil representation. Analytic `surface`, `lemma`, or gloss fields MAY remain linguistically normalized, but exact primary-text evidence selectors MUST preserve provider text as represented at the pinned revision.

Future goldens MUST include structurally and linguistically different provider resources so the architecture is not optimized around this one example.

---

# PART XIV — IMPLEMENTATION STRATEGY

## 44. TypeScript

Preferred for:

```text
Source Provider integration
canonical WSI model
schema/registry validation
orchestration
CLI/API
review tooling
Witness pipeline
```

The deterministic validator and first live Source Provider connector are implemented in TypeScript.

## 45. Python

Preferred for optional linguistic/research workers:

```text
Arabic NLP
Hebrew NLP
Greek NLP
other language NLP
embeddings/reranking experiments
research evaluation
```

Python workers MUST communicate through versioned analysis contracts rather than become a second source-of-truth model.

## 46. Rust

Optional later only when demonstrated performance/type-safety needs justify it.

The Machine Contract remains implementation-language independent.

## 47. Module boundaries

```text
source-provider/
linguistics/
senses/
discourse/
participants/
frames/
relations/
ontology/
polarity/
modality/
speech_act/
assessments/
evidence/
confidence/
provenance/
review/
witness/
response/
positive_direction/
validation/
export/
```

Provider-specific transports remain implementations behind `source-provider/`, not semantic branches.

---

# PART XV — VERSIONING AND MILESTONES

## 48. Pre-1.0 release policy

The repository remains in initial-development `0.x` status until the architecture is deliberately declared stable.

Automatic release policy is:

```text
0.x breaking change → next MINOR
0.x feature         → next MINOR
0.x fix/docs/etc.   → next PATCH
>=1.0 breaking      → next MAJOR
```

A breaking research-contract change MUST NOT automatically imply architectural `1.0` maturity.

Detailed live milestone status is maintained in [`ROADMAP.md`](ROADMAP.md).

## 49. M0 — Repository foundation

**Status: DONE**

Repository governance, branch model, release/version plumbing, README, and Blueprint foundation.

## 50. M1 — Provider-bound Machine Contract

**Status: IMPLEMENTED / REVIEW PENDING**

Delivered on `dev`:

```text
Source Provider Contract
RGBL binding specification
WSI JSON Schema v0.2
ID grammar
registries
worked example using real RGBL IDs
```

## 51. M2 — Deterministic validator

**Status: IMPLEMENTED / REVIEW PENDING — CI GREEN**

Delivered on `dev`:

```text
TypeScript validator runtime
JSON Schema pass
registry pass
offline Source Binding pass
selector pass
semantic invariant pass
review-policy pass
mutation tests
CLI
offline RGBL provider index
CI npm run check gate
```

Technical acceptance is green; review/promotion to `main` is the remaining milestone gate.

## 52. M3 — Live RGBL connector

**Status: IMPLEMENTED / REVIEW PENDING — LIVE CI GREEN**

Delivered on `dev`:

```text
generic SourceProvider runtime interface
repository-backed RGBL reference connector
pinned revision proof
canonical resource resolution
literal TEXT_QUOTE proof
CHAR_RANGE proof
stale-binding detection
verify-source CLI
live provider CI
Qur'an + non-Qur'an integration fixtures
```

Live verification exposed and corrected non-exact Uthmani evidence anchors in the worked example, demonstrating that the source-proof layer is enforcing the Source Provider boundary rather than merely accepting locally plausible strings.

## 53. M4 — Linguistic plugins + stratified golden analyses

**Status: IMPLEMENTED / REVIEW PENDING**

Define a language-neutral analyzer contract, add reference analyzers/adapters, and build a structurally diverse golden set independent of scripture identity.

## 54. M5 — Semantic frame engine

**Status: IMPLEMENTED / REVIEW PENDING**

M5 introduces a deterministic semantic candidate compiler over versioned linguistic analysis plus evidence-backed semantic proposals.

Normative M5 separations:

```text
LINGUISTIC OUTPUT != SEMANTIC CANDIDATE
SEMANTIC CANDIDATE != REVIEWED SEMANTIC TRUTH
PARTICIPANT REFERENCE != SEMANTIC KEY
FUNCTION WORD != SEMANTIC KEY
RAW TOKEN IMPORTANCE != SEMANTIC KEY
```

A semantic key is emitted only for a registered concept candidate whose source role is `CONTENT`. Participant references, function words, structural markers, unknown roles, unresolved mappings, and unregistered concepts remain explicit but are not promoted into semantic keys.

The reference compiler fails closed on broken token/local-reference structure while preserving research ambiguity through candidate states and `UNRESOLVED` outputs. M5 does not produce Witness or positive direction.

## 55. M6 — Witness engine

**Status: PLANNED**

Witness Pattern matching, localization, response/correction, and positive-direction derivation.

## 56. M7 — Scale / reproducible batch processing

**Status: PLANNED**

Apply one semantic contract across eligible Source Provider resources without corpus-specific semantic branches, with idempotent jobs, resume/retry behavior, stale queues, and provenance-preserving exports.

Full-Qur'an processing MAY be a major workload but MUST NOT become a separate semantic mode.

## 57. M8 — Production hardening

**Status: PLANNED**

Harden reproducible builds, dependency locking, compatibility/migrations, observability, security, failure isolation, performance, provider-outage behavior, API/CLI stability, and backup/recovery policy.

Operational convenience MUST NOT weaken evidence provenance or source ownership boundaries.

## 58. M9 — Release candidate → v1.0

**Status: PLANNED**

Run a representative multi-language/multi-resource release-candidate suite covering ambiguous/unresolved semantics, nested discourse, provider failures, stale bindings, batch reproducibility, and migration compatibility.

`v1.0` means the supported contracts are production-stable. It does not claim that every language, corpus, or interpretation is solved.

---

# PART XVI — FINAL DISCIPLINE

```text
DO NOT INGEST THE WORLD TWICE.
DO NOT DUPLICATE SOURCE AUTHORITY.
DO NOT TURN AN EXTERNAL PASSAGE INTO A WSI PASSAGE OBJECT.
DO NOT STORE A QUOTE ANCHOR AS CANONICAL SOURCE TEXT.
DO NOT NORMALIZE AN EXACT SOURCE ANCHOR AND CALL IT VERBATIM.
DO NOT STORE A LEMMA AS A CONCEPT.
DO NOT STORE A PARTICIPANT AS A CONCEPT.
DO NOT STORE A RELATION AS A CONCEPT.
DO NOT STORE NEGATION AS DIRECTION.
DO NOT STORE DIRECTION AS AN INTRINSIC FRAME FACT.
DO NOT STORE WITNESS AS TRANSLATION.
DO NOT STORE POSITIVE DIRECTION AS SOURCE MEANING.
DO NOT FORCE AN ANSWER WHERE EVIDENCE IS UNRESOLVED.
```

Instead:

```text
RESOLVE SOURCE
→ PIN PROVIDER REVISION
→ PROVE EVIDENCE ANCHORS
→ ANALYZE LANGUAGE
→ RESOLVE CONTEXTUAL SENSE
→ RESOLVE DISCOURSE
→ IDENTIFY PARTICIPANTS
→ BUILD FRAMES
→ MAP CONCEPTS CONSERVATIVELY
→ ASSESS
→ ATTACH CONFIDENCE + PROVENANCE
→ VALIDATE
→ REVIEW
→ WITNESS
→ RESPOND
→ DERIVE A DEFENSIBLE POSITIVE DIRECTION
```

That sequence is the architectural identity of **Witness Semantic Engine**.
