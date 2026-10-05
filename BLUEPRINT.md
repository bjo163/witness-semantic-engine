# Witness Semantic Engine — Blueprint

**Status:** normative research/engineering blueprint  
**Blueprint revision:** `3.1-draft`  
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

---

# PART III — EVIDENCE

## 9. Evidence dimensions

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

## 10. Selectors

Initial selectors:

```text
RESOURCE_ONLY
TEXT_QUOTE
CHAR_RANGE
TOKEN_IDS
```

Selectors are provider-relative.

A local token number MUST NOT be treated as globally stable unless the tokenizer/analyzer identity is recorded in analysis provenance.

---

# PART IV — ANALYSIS MODEL

## 11. Lexical/contextual sense

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

## 12. Discourse scope

Utterance scope SHOULD be represented when meaning depends on speaker, addressee, narration, quotation, or reported speech.

```text
SPEAKER != AGENT
ADDRESSEE != PATIENT
```

Nested utterances MAY be represented explicitly.

## 13. Participants

Participants are analysis-local discourse/semantic referents.

A participant MAY link to an external entity when available, but unresolved identity is valid:

```text
surface_reference = WE
resolved_identity = null
resolution_status = UNRESOLVED
```

Contextual resolution MUST NOT overwrite the source surface reference.

## 14. Semantic Frames

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

## 15. Concept / relation separation

```text
CONCEPT  = AUTHORITY
RELATION = AUTHORITY_OVER
POLARITY = NEGATED
```

Do not canonicalize composites such as:

```text
NO_AUTHORITY_OVER_YOU
```

## 16. Polarity

Initial values:

```text
AFFIRMED
NEGATED
UNDETERMINED
```

Polarity is a proposition property.

## 17. Modality

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

## 18. Speech act

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

## 19. Evaluation is separate from Frame structure

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

## 20. Direction vocabulary

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

## 21. Assessment contract

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

## 22. Language-neutral identity

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

## 23. Conservative concept mapping

Cross-language equivalence MUST NOT be inferred from identical translation strings.

Arabic, Hebrew, Greek, Pali, Sanskrit, English, Indonesian, and other expressions map to one concept only after contextual-sense evidence supports that mapping.

Unmapped is preferable to false equivalence.

---

# PART VII — CONFIDENCE, PROVENANCE, REVIEW

## 24. Confidence

Confidence is operational research confidence, never theological truth percentage.

It MUST be policy-versioned and decomposable:

```text
policy_id
policy_version
components
aggregate
```

## 25. Analysis provenance

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

## 26. Review lifecycle

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

## 27. Witness Pattern

A Witness Pattern is a stable derived pattern identity:

```text
wsi:witness-pattern/boundary-violation
```

## 28. Witness Label

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

## 29. Witness derivation

Production Witness generation SHOULD consume reviewed/locked Frames and relevant Assessments.

Research preview MAY consume `RESEARCHED` input, but resulting Witness data remains provisional.

```text
WITNESS = UNRESOLVED
```

is valid.

## 30. Response / correction

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

## 31. Positive Direction

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

## 32. RGBL as first Source Provider

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

## 33. Example RGBL identifiers

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

## 34. Linguistic plugins replace corpus adapters

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

## 35. Canonical record

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

## 36. Identity policy

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

# PART XI — DETERMINISTIC VALIDATION

## 37. Validation passes

The canonical validation order is:

```text
1. JSON_SCHEMA
2. WSI_REGISTRY_REFERENTIAL_INTEGRITY
3. SOURCE_BINDING_RESOLUTION
4. EVIDENCE_SELECTOR_RESOLUTION
5. WSI_SEMANTIC_INVARIANTS
6. REVIEW_POLICY
```

JSON validity is not semantic correctness.

## 38. Offline deterministic validator

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

Milestone 2 technical acceptance has passed on `dev`:

```text
TypeScript typecheck   PASS
validator tests        PASS
golden validation      PASS
repository policy      PASS
```

Promotion/review remains the final gate before this milestone is stable on `main`.

## 39. Live provider resolution

Live provider verification belongs to Milestone 3.

It will augment validation with checks such as:

```text
provider revision exists
resource exists at pinned revision
resource kind matches
content resolves
TEXT_QUOTE exists in provider content
CHAR_RANGE resolves against provider content
source integrity metadata can be confirmed
```

The live connector MUST NOT redefine semantic invariants.

See [`spec/VALIDATION.md`](spec/VALIDATION.md).

---

# PART XII — CORE INVARIANTS

## 40. Required invariants

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
```

---

# PART XIII — WORKED EXAMPLE POLICY

## 41. As-Saffat 37:30

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

Future goldens MUST include structurally and linguistically different provider resources so the architecture is not optimized around this one example.

---

# PART XIV — IMPLEMENTATION STRATEGY

## 42. TypeScript

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

The deterministic validator is implemented in TypeScript beginning in Milestone 2.

## 43. Python

Preferred for optional linguistic/research workers:

```text
Arabic NLP
Hebrew NLP
Greek NLP
other language NLP
embeddings/reranking experiments
research evaluation
```

## 44. Rust

Optional later only when demonstrated performance/type-safety needs justify it.

The Machine Contract remains implementation-language independent.

## 45. Module boundaries

```text
source_provider/
rgbl_connector/
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

---

# PART XV — VERSIONING AND MILESTONES

## 46. Pre-1.0 release policy

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

## 47. M0 — Repository foundation

**Status: DONE**

Repository governance, branch model, release/version plumbing, README, and Blueprint foundation.

## 48. M1 — Provider-bound Machine Contract

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

## 49. M2 — Deterministic validator

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

## 50. M3 — Live RGBL connector

**Status: NEXT**

Resolve RGBL resources through a stable SDK/API/repository interface and verify provider content/selectors against pinned revisions.

## 51. M4 — Linguistic plugins + stratified golden analyses

**Status: PLANNED**

Build language-specific analysis plugins and a structurally diverse golden set independent of scripture identity.

## 52. M5 — Semantic frame engine

**Status: PLANNED**

Candidate generation, contextual-sense resolution, concept linking, assessments, confidence, provenance, and review workflows.

## 53. M6 — Witness engine

**Status: PLANNED**

Witness Pattern matching, localization, response/correction, and positive-direction derivation.

## 54. M7 — Scale

**Status: PLANNED**

Apply one semantic contract across eligible Source Provider resources without corpus-specific semantic branches.

---

# PART XVI — FINAL DISCIPLINE

```text
DO NOT INGEST THE WORLD TWICE.
DO NOT DUPLICATE SOURCE AUTHORITY.
DO NOT TURN AN EXTERNAL PASSAGE INTO A WSI PASSAGE OBJECT.
DO NOT STORE A QUOTE ANCHOR AS CANONICAL SOURCE TEXT.
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
→ ANCHOR EVIDENCE
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
