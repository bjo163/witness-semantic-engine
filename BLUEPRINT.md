# Witness Semantic Engine — Blueprint

**Status:** normative research/engineering blueprint  
**Blueprint revision:** `3.0-draft`  
**Repository line:** `0.x` research phase  
**Architecture:** source-provider-neutral semantic analysis engine  
**Primary source provider integration:** `rocksoul-rgbl`

---

# 0. Normative language

The words **MUST**, **MUST NOT**, **REQUIRED**, **SHOULD**, **SHOULD NOT**, **MAY**, and **OPTIONAL** are normative requirements.

Witness Semantic Engine (WSI) is spec-first. Code, prompts, models, databases, workers, APIs, and UIs are subordinate to this contract.

---

# PART I — MISSION AND OWNERSHIP

## 1. Purpose

WSI is a downstream semantic-analysis engine. It does **not** own scripture/corpus ingestion, editions, source artifacts, canonical text, source rights, or primary textual provenance.

WSI consumes addressable resources from a Source Provider and produces auditable semantic-analysis objects:

```text
SOURCE PROVIDER RESOURCE(S)
  ↓
SOURCE BINDING
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

The primary semantic unit is a **Frame/Proposition**, not a keyword, verse, ayah, book, or corpus.

## 2. Ownership boundary

### Source Provider owns

The provider is authoritative for its own source identities and source records. In the current MoonWitness ecosystem, `rocksoul-rgbl` owns:

```text
corpus/dataset identity
work
expression
edition
artifact
passage / fragment / content
citation/reference schemes
variants and textual alignments
exact source text
source-acquisition provenance
rights/license metadata
source checksums
```

### WSI owns

WSI owns downstream analysis only:

```text
source bindings
analysis-local anchors
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

### Core invariant

```text
SOURCE PROVIDER DATA != WSI ANALYSIS DATA
```

WSI MUST NOT duplicate source ownership for convenience.

---

# PART II — SOURCE PROVIDER CONTRACT

## 3. Provider neutrality

WSI MUST NOT contain corpus-specific semantic branches such as:

```text
if corpus == quran
if corpus == torah
if corpus == gospels
```

Instead WSI consumes a **Source Provider Contract**.

The first provider integration is:

```text
provider = rocksoul-rgbl
namespace = mw
```

A future provider MAY be supported if it satisfies the same minimum interface.

## 4. Minimum provider capability

A provider integration MUST resolve:

```text
stable resource ID
resource kind/type
pinned provider revision or immutable release
content or content linkage
language/script when available
source provenance
source integrity/checksum when available
resource relationships required to interpret scope
```

WSI stores references to this information; it does not redefine it.

## 5. Source Binding

Every analysis MUST contain one or more Source Bindings.

A Source Binding pins external resources to the provider snapshot against which analysis was performed.

```text
binding_id
provider
provider_contract
provider_revision
primary_resource_id
resource_ids[]
resolution_status
```

Example:

```json
{
  "id": "S1",
  "provider": "rocksoul-rgbl",
  "provider_contract": "moonwitness-corpus/v0.1",
  "provider_revision": "df00706c98e21fb3fb0146b8389b0f2978f3d833",
  "primary_resource_id": "mw:passage:quran:37:30",
  "resource_ids": [
    "mw:passage:quran:37:30",
    "mw:content:quran:37:30:ar-uthmani"
  ],
  "resolution_status": "RESOLVED"
}
```

A moving ref such as `main` or `latest` is insufficient as the sole revision for reviewed/locked analysis.

## 6. Analysis Target

Every WSI record identifies one primary external target:

```text
analysis_target = source_binding_id + resource_id
```

A target may be a passage, paragraph, fragment, manuscript segment, content object, commentary passage, or another addressable resource.

WSI MUST NOT assume the universal target type is `verse` or `ayah`.

## 7. No canonical source copy

Canonical primary text MUST NOT be duplicated into WSI as source authority.

WSI MAY retain a small quote selector for evidence resolution, but:

```text
QUOTE = ANCHOR
QUOTE != SOURCE AUTHORITY
```

If an anchor conflicts with the pinned provider resource, the provider wins and the WSI analysis becomes stale until reviewed.

---

# PART III — EVIDENCE

## 8. Evidence dimensions

Every semantic assertion MUST be traceable to evidence.

Evidence contains:

```text
source_binding_id
resource_id
source_class
derivation_type
selector
notes
```

### Evidence source classes

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

These are independent dimensions.

## 9. Selectors

Initial selector types:

```text
RESOURCE_ONLY
TEXT_QUOTE
CHAR_RANGE
TOKEN_IDS
```

Selectors are provider-relative.

Locally generated token numbers MUST NOT be assumed stable unless tokenizer identity/version is recorded.

---

# PART IV — ANALYSIS MODEL

## 10. Lexical/contextual sense

A lexical form is not a concept.

```text
SURFACE
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

## 11. Discourse scope

Utterance scope SHOULD be represented when meaning depends on speaker, addressee, quotation, narration, or reported speech.

```text
SPEAKER != AGENT
ADDRESSEE != PATIENT
```

## 12. Participants

Participants are analysis-local discourse/semantic referents.

A participant MAY reference an external entity when available, but unresolved identity is valid.

```text
surface_reference = WE
resolved_identity = null
resolution_status = UNRESOLVED
```

Contextual identity MUST NOT overwrite the source surface form.

## 13. Semantic frames

Frames are the primary structural unit.

Initial frame classes:

```text
ACTION
STATE
RELATION
EVENT
ATTRIBUTE
```

A frame may contain:

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

### N-ary frames

Frames MUST support more than triples.

```text
GIVE
  AGENT      → P1
  THEME      → P2
  RECIPIENT  → P3
  LOCATION   → P4
```

Therefore a WSI Frame MUST NOT be reduced to one subject-predicate-object assertion.

## 14. Concept/relation separation

```text
CONCEPT = AUTHORITY
RELATION = AUTHORITY_OVER
POLARITY = NEGATED
```

Do not create:

```text
NO_AUTHORITY_OVER_YOU
```

as a canonical concept.

## 15. Polarity

```text
AFFIRMED
NEGATED
UNDETERMINED
```

Polarity is a proposition property.

## 16. Modality

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

## 17. Speech act

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

## 18. Evaluative judgement is separate

Evaluative judgement MUST NOT be silently embedded as intrinsic source structure.

Therefore `SOURCE_DIRECTION` is an **Assessment** targeting a Frame or analysis record.

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

## 19. Direction vocabulary

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

## 20. Assessment contract

An assessment SHOULD record:

```text
target
assessment_type
result
method_id
evidence
confidence
review_status
```

A record-level direction summary is optional and derived from more local assessments.

---

# PART VI — ONTOLOGY

## 21. Language-neutral concept identity

Examples:

```text
wsi:concept/authority
wsi:concept/transgression
```

```text
CONCEPT ID = IDENTITY
LABEL = PRESENTATION
LEXICAL FORM = SOURCE-LANGUAGE EVIDENCE
```

English, Arabic, Hebrew, Greek, Indonesian, or another language MUST NOT become the hidden ontology identity.

## 22. Conservative mapping

Cross-language equivalence MUST NOT be inferred from translation-string equality.

A contextual sense maps to a universal concept only after evidence-supported review.

Unmapped is preferable to false equivalence.

---

# PART VII — REVIEW, CONFIDENCE, PROVENANCE

## 23. Review lifecycle

```text
CANDIDATE
RESEARCHED
REVIEWED
LOCKED
DISPUTED
DEPRECATED
```

`LOCKED` is an analysis review state. It does not lock a corpus and does not mean theological infallibility.

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

It MUST NOT duplicate provider source-acquisition provenance.

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

AI-produced candidates SHOULD record model/policy metadata when available.

---

# PART VIII — WITNESS

## 26. Witness Pattern

A Witness Pattern is a stable derived pattern identity.

```text
wsi:witness-pattern/boundary-violation
```

## 27. Witness Label

A Witness Label is localized presentation.

```text
OFFSIDE
```

Therefore:

```text
OFFSIDE != SOURCE TRANSLATION
OFFSIDE != CANONICAL CONCEPT
OFFSIDE != WITNESS PATTERN ID
```

## 28. Witness derivation

Production Witness generation SHOULD consume reviewed/locked Frames and Assessments.

Research preview MAY consume `RESEARCHED` input, but its downstream results remain provisional.

```text
WITNESS = UNRESOLVED
```

is valid.

## 29. Response/correction

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

## 30. Positive direction

```text
POSITIVE_DIRECTION != SOURCE_DIRECTION ASSESSMENT
```

Example:

```text
TRANSGRESSION frame
→ SOURCE_DIRECTION = NEGATIVE
→ BOUNDARY_VIOLATION
→ OFFSIDE
→ RETURN / ALIGN
→ BOUNDARY_ALIGNMENT
```

Positive Direction MAY remain unresolved.

---

# PART IX — RGBL INTEROPERABILITY

## 31. RGBL as first Source Provider

`rocksoul-rgbl` already owns provenance-first generic source objects including:

```text
ENTITY
RESOURCE
ASSERTION
EVIDENCE
PROVENANCE
ASSESSMENT
```

and textual profile objects including:

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

WSI SHOULD reuse RGBL IDs rather than invent duplicate source objects.

## 32. Real RGBL Qur'an identifiers

The pinned Tanzil Uthmani recipe exposes identifiers such as:

```text
mw:work:quran
mw:expression:quran:ar-uthmani-tanzil-1.1
mw:edition:quran:tanzil-1.1-uthmani
mw:artifact:quran:tanzil-1.1-uthmani
mw:passage:quran:37:30
mw:content:quran:37:30:ar-uthmani
```

These remain owned by RGBL.

## 33. Linguistic plugins replace corpus adapters

Because source/corpus ingestion lives upstream, WSI does not need Qur'an/Torah/Psalms/Gospels ingestion adapters.

WSI MAY use language-analysis plugins instead:

```text
Arabic analyzer
Hebrew analyzer
Greek analyzer
Pali analyzer
Sanskrit analyzer
Generic/fallback analyzer
```

A linguistic plugin is an analysis tool, never source authority.

---

# PART X — MACHINE CONTRACT v0.2

## 34. Record structure

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

WSI v0.2 deliberately does NOT contain canonical corpus/work/edition/passage/content records.

## 35. Identity policy

WSI-owned IDs identify WSI-owned objects only.

```text
wsi:analysis/<opaque-id>
wsi:concept/authority
wsi:relation/authority-over
wsi:witness-pattern/boundary-violation
```

External source IDs remain external:

```text
mw:passage:quran:37:30
```

## 36. Validation passes

```text
1. JSON_SCHEMA
2. WSI_REGISTRY_REFERENTIAL_INTEGRITY
3. SOURCE_BINDING_RESOLUTION
4. EVIDENCE_SELECTOR_RESOLUTION
5. WSI_SEMANTIC_INVARIANTS
6. REVIEW_POLICY
```

JSON validity is not semantic correctness.

---

# PART XI — INVARIANTS

## 37. Required invariants

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
I16 TRANSLATION_ALONE_CANNOT_CREATE_DIRECT_PRIMARY_EVIDENCE
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
```

---

# PART XII — WORKED EXAMPLE POLICY

## 38. As-Saffat 37:30

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

---

# PART XIII — IMPLEMENTATION

## 39. Language strategy

### TypeScript

Preferred for:

```text
RGBL/source-provider integration
canonical WSI object model
schema + registry validation
orchestration
CLI/API
Witness pipeline
review tooling
```

### Python

Preferred for optional linguistic/research workers:

```text
Arabic NLP
Hebrew NLP
Greek NLP
other language NLP
embedding/reranking experiments
research evaluation
```

### Rust

Optional later only when demonstrated performance/type-safety needs justify it.

## 40. Planned module boundaries

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

The machine contract remains implementation-language independent.

---

# PART XIV — ROADMAP

## 41. Milestone 0 — Repository foundation

README, Blueprint, release governance, branch model.

## 42. Milestone 1 — Interoperability contract

```text
Source Provider Contract
RGBL binding specification
WSI JSON Schema v0.2
ID grammar
registries
worked example using real RGBL IDs
```

## 43. Milestone 2 — Deterministic validator

Validate schema, registries, source bindings, selectors, cross-object references, state transitions, and review rules.

## 44. Milestone 3 — RGBL connector

Resolve RGBL resources through a stable SDK/API/repository interface and pin provider revisions.

## 45. Milestone 4 — Linguistic plugins + golden analyses

Build language-specific plugins and a stratified analysis set independent of scripture identity.

## 46. Milestone 5 — Semantic frame engine

Candidate generation, sense resolution, concept linking, assessments, provenance, and review workflows.

## 47. Milestone 6 — Witness engine

Witness Pattern matching, localized labels, response/correction, and positive-direction derivation.

## 48. Milestone 7 — Scale

Apply one WSI semantic contract to eligible resources across RGBL without introducing corpus-specific semantic branches.

---

# PART XV — FINAL DISCIPLINE

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
→ REVIEW
→ WITNESS
→ RESPOND
→ DERIVE A DEFENSIBLE POSITIVE DIRECTION
```

That sequence is the architectural identity of **Witness Semantic Engine**.
