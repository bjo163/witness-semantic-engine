# Witness Semantic Engine — Blueprint

**Status:** normative research/engineering blueprint  
**Blueprint revision:** `3.0-draft`  
**Repository line:** `0.x` research phase  
**Architecture:** source-provider-neutral semantic analysis engine  
**Primary source provider integration:** `rocksoul-rgbl`

---

# 0. Normative language

The words **MUST**, **MUST NOT**, **REQUIRED**, **SHOULD**, **SHOULD NOT**, **MAY**, and **OPTIONAL** are normative requirements.

Witness Semantic Engine (WSE/WSI) is spec-first. Code, prompts, models, databases, workers, APIs, and UIs are subordinate to this contract.

---

# PART I — MISSION AND BOUNDARY

## 1. Purpose

WSI is a downstream semantic-analysis engine. It does **not** own scripture/corpus ingestion, editions, source artifacts, canonical text, rights, or primary textual provenance.

WSI consumes addressable source resources from a Source Provider and produces auditable analysis objects:

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

The primary unit of semantic analysis is a **Frame/Proposition**, not a keyword and not a verse.

## 2. Ownership boundary

### Source Provider owns

A Source Provider is authoritative for its own resource identities and source records. In the current MoonWitness ecosystem, `rocksoul-rgbl` owns:

```text
corpus/dataset identity
work
expression
edition
artifact
passage/fragment/content
citation/reference schemes
variants and textual alignments
exact source text
source acquisition provenance
rights/license metadata
source checksums
```

### WSI owns

WSI owns only downstream semantic-analysis objects:

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

### Non-negotiable rule

```text
SOURCE PROVIDER DATA
!=
WSI ANALYSIS DATA
```

WSI MUST NOT copy source ownership into its own ontology merely for convenience.

---

# PART II — SOURCE PROVIDER CONTRACT

## 3. Provider neutrality

WSI MUST NOT contain corpus-specific branches such as:

```text
if corpus == quran
if corpus == torah
if corpus == gospels
```

Nor should it require one source repository forever.

Instead, WSI consumes a **Source Provider Contract**.

The first and preferred integration is:

```text
provider = rocksoul-rgbl
namespace = mw
```

A future provider MAY be used if it can satisfy the same minimum contract.

## 4. Minimum provider capability

A provider integration MUST be able to resolve:

```text
stable resource ID
resource kind/type
pinned provider revision or immutable release
content associated with the resource
language/script metadata when available
source provenance
source integrity/checksum information when available
resource relationships needed to interpret scope
```

WSI stores a reference to this information; it does not redefine it.

## 5. Source Binding

Every WSI analysis record MUST contain one or more Source Bindings.

A Source Binding identifies the external snapshot against which analysis was performed.

Minimum conceptual fields:

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
  "provider_revision": "<git-sha-or-release>",
  "primary_resource_id": "mw:passage:quran:37:30",
  "resource_ids": [
    "mw:passage:quran:37:30",
    "mw:content:quran:37:30:ar-uthmani"
  ],
  "resolution_status": "RESOLVED"
}
```

## 6. Analysis Target

A WSI record MUST explicitly identify its analysis target using a provider resource reference.

```text
analysis_target = source_binding_id + resource_id
```

An analysis target can be a verse-like passage, paragraph, fragment, manuscript segment, commentary passage, or another addressable provider resource.

WSI MUST NOT assume all targets are verses/ayahs.

## 7. No canonical source copy

Canonical primary text MUST NOT be duplicated into WSI records.

WSI MAY retain a small quote anchor for evidence resolution, but such text is:

```text
ANCHOR / SELECTOR
not SOURCE AUTHORITY
```

If the quote conflicts with the pinned provider resource, the provider resource wins and the WSI analysis becomes stale/invalid until reviewed.

---

# PART III — EVIDENCE AND ANCHORING

## 8. Evidence model

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

### Source class

Initial values:

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

### Derivation type

```text
DIRECT
COMPOSITIONAL
CONTEXTUAL
INTERPRETIVE
DERIVED
```

These dimensions are independent.

## 9. Selector model

Evidence MAY point to a whole resource or a subresource anchor.

Initial selector types:

```text
RESOURCE_ONLY
TEXT_QUOTE
CHAR_RANGE
TOKEN_IDS
```

Selectors are provider-relative. WSI MUST NOT pretend a locally generated token number is globally stable unless the tokenizer identity/version is recorded.

---

# PART IV — ANALYSIS OBJECTS

## 10. Lexical / contextual sense

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

A sense MAY remain unmapped to a universal WSI concept.

## 11. Utterance and discourse scope

WSI SHOULD represent utterance scope when meaning depends on speaker, addressee, quotation, narration, or reported speech.

A discourse role is not a semantic role.

```text
SPEAKER != AGENT
ADDRESSEE != PATIENT
```

## 12. Participants

Participants are analysis-local discourse/semantic referents.

A participant may point to an external entity ID when one exists, but unresolved identity is valid.

```text
surface_reference
resolved_identity = null
resolution_status = UNRESOLVED
```

is a valid state.

## 13. Semantic frames

Frames are the canonical structural unit of WSI.

Initial frame classes:

```text
ACTION
STATE
RELATION
EVENT
ATTRIBUTE
```

A frame contains:

```text
predicate/relation candidate
role bindings
concept mappings
polarity
modality
speech act
source evidence
confidence
review status
```

### N-ary requirement

Frames MUST support more than subject-predicate-object.

Example:

```text
GIVE
  AGENT      → P1
  THEME      → P2
  RECIPIENT  → P3
  LOCATION   → P4
```

This is why a WSI Frame is not reducible to one generic triple.

## 14. Relation and concept separation

```text
CONCEPT = AUTHORITY
RELATION = AUTHORITY_OVER
POLARITY = NEGATED
```

WSI MUST NOT create giant semantic IDs such as:

```text
NO_AUTHORITY_OVER_YOU
```

## 15. Polarity

Polarity is a proposition property.

Initial values:

```text
AFFIRMED
NEGATED
UNDETERMINED
```

## 16. Modality

Modality is separate from speech act.

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

## 17. Speech act

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
OTHER
UNDETERMINED
```

---

# PART V — ASSESSMENTS

## 18. Assessment is separate from Frame

An evaluative judgement MUST NOT be silently embedded as if it were intrinsic source structure.

Therefore `SOURCE_DIRECTION` is represented as an **Assessment** targeting a Frame or analysis record.

Wrong:

```text
frame.source_direction = NEGATIVE
```

Preferred:

```text
FRAME F2
  ↓
ASSESSMENT A2
  type   = SOURCE_DIRECTION
  result = NEGATIVE
```

This makes the epistemic boundary explicit.

## 19. Direction vocabulary

Initial direction values:

```text
POSITIVE
NEGATIVE
NEUTRAL
MIXED
UNDETERMINED
```

Direction is not polarity, modality, or speech act.

```text
POLARITY != DIRECTION
MODALITY != DIRECTION
SPEECH_ACT != DIRECTION
```

## 20. Assessment provenance

Every assessment SHOULD record:

```text
target
assessment_type
result
method_id
evidence
confidence
review_status
```

A whole-record direction summary is optional and derived from frame-level assessments.

---

# PART VI — CONCEPT ONTOLOGY

## 21. Stable concept identity

Canonical concept IDs are language-neutral.

```text
wsi:concept/authority
wsi:concept/transgression
```

Labels are presentation metadata.

```text
CONCEPT ID = IDENTITY
LABEL = PRESENTATION
```

English is not a hidden master language.

## 22. Conservative concept mapping

Cross-language equality MUST NOT be inferred from translated words.

Arabic, Hebrew, Greek, Pali, Sanskrit, English, Indonesian, or any other expression can map to the same concept only after contextual sense review.

Unmapped is preferable to false equivalence.

---

# PART VII — REVIEW, CONFIDENCE, AND PROVENANCE

## 23. Review states

Initial lifecycle:

```text
CANDIDATE
RESEARCHED
REVIEWED
LOCKED
DISPUTED
DEPRECATED
```

`LOCKED` applies to an analysis assertion/object after review. It does not lock a corpus and does not mean theological infallibility.

## 24. Confidence

Confidence is operational research confidence, not truth percentage.

It MUST reference a versioned policy and retain component scores.

```text
policy_id
policy_version
components
aggregate
```

## 25. Analysis provenance

WSI provenance describes how analysis was produced.

It MUST NOT duplicate source-acquisition provenance already owned by the Source Provider.

Minimum WSI provenance:

```text
framework_version
contract_version
registry_version
ontology_version
analyzer/extractor version
created_at
created_by
```

For AI-produced candidates, record model/policy/generation metadata when available.

---

# PART VIII — WITNESS CONTRACT

## 26. Witness Pattern

A Witness Pattern is a stable derived pattern identity.

Example:

```text
wsi:witness-pattern/boundary-violation
```

## 27. Witness Label

A label is localized human-facing presentation.

Example:

```text
OFFSIDE
```

Therefore:

```text
OFFSIDE != SOURCE TRANSLATION
OFFSIDE != CANONICAL CONCEPT
OFFSIDE != UNIVERSAL WITNESS ID
```

## 28. Witness derivation

Production Witness generation SHOULD consume reviewed/locked Frames and Assessments.

Research preview MAY consume `RESEARCHED` input but downstream output MUST remain provisional.

Valid output:

```text
WITNESS = UNRESOLVED
```

## 29. Response / correction

A Witness may lead to a response such as:

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

The response is derived and MUST NOT be represented as source wording unless independently present in a source frame.

## 30. Positive direction

Positive Direction is a downstream target state.

```text
POSITIVE_DIRECTION != SOURCE_DIRECTION ASSESSMENT
```

Negative source condition example:

```text
TRANSGRESSION frame
→ SOURCE_DIRECTION assessment: NEGATIVE
→ Witness Pattern: BOUNDARY_VIOLATION
→ label: OFFSIDE
→ response: RETURN / ALIGN
→ target concept: BOUNDARY_ALIGNMENT
```

A positive direction MAY remain unresolved.

---

# PART IX — RGBL INTEROPERABILITY

## 31. RGBL as the first provider

`rocksoul-rgbl` is the first Source Provider integration because it already owns generic, provenance-first text resources including:

```text
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

WSI SHOULD reuse RGBL canonical IDs directly instead of inventing duplicate scripture objects.

## 32. Example RGBL binding

For the pinned Tanzil Uthmani dataset, RGBL exposes resource identities such as:

```text
mw:work:quran
mw:expression:quran:ar-uthmani-tanzil-1.1
mw:edition:quran:tanzil-1.1-uthmani
mw:passage:quran:37:30
mw:content:quran:37:30:ar-uthmani
```

WSI references those IDs. It does not copy ownership of them.

## 33. Language analyzers are plugins, not corpus adapters

After source identity is delegated to providers, corpus-specific ingestion adapters no longer belong in WSI.

WSI MAY instead use linguistic plugins:

```text
Arabic analyzer
Hebrew analyzer
Greek analyzer
Pali analyzer
Sanskrit analyzer
Generic/fallback analyzer
```

A language analyzer consumes resolved content and emits candidate linguistic analysis. It MUST NOT become source authority.

---

# PART X — MACHINE CONTRACT v0.2

## 34. Canonical record

The v0.2 analysis record contains:

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
analysis_provenance
review
```

It does NOT contain canonical source text, edition records, corpus records, passage records, or source rights metadata.

## 35. ID policy

WSI-owned IDs MUST identify WSI analysis objects only.

External provider IDs MUST remain external IDs.

Good:

```text
wsi:analysis/<opaque-id>
wsi:concept/authority
wsi:relation/authority-over
wsi:witness-pattern/boundary-violation
mw:passage:quran:37:30
```

Wrong:

```text
wsi:passage:quran:37:30
wsi:edition:quran:...
```

when RGBL already owns those identities.

## 36. Validation passes

A record is usable only after distinct validation layers:

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

# PART XI — CORE INVARIANTS

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

As-Saffat 37:30 remains a **non-normative worked example**.

It tests:

```text
external source binding
participant separation
negated relation
state frame
discourse relation
concept mapping
direction assessment
Witness derivation
positive direction
```

It MUST NOT define the universal schema by itself.

Conceptual analysis:

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

---

# PART XIII — IMPLEMENTATION

## 39. Language strategy

Because RGBL is TypeScript-based and already exposes corpus/core/repository/SDK infrastructure, WSI SHOULD consider a hybrid architecture.

### TypeScript

Preferred for:

```text
RGBL integration
source resolution
canonical WSI object model
schema validation
registry validation
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

Optional later only when a demonstrated performance/type-safety need justifies it.

The machine contract remains language-independent.

## 40. Planned module boundaries

```text
source_provider/
rgb l_connector/   # implementation name should be `rgbl_connector` without space
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

The accidental visual spacing above is documentary only; the actual module name MUST be `rgbl_connector/`.

---

# PART XIV — ROADMAP

## 41. Milestone 0 — repository foundation

README, Blueprint, release governance, branch model.

## 42. Milestone 1 — interoperability contract

Deliver:

```text
Source Provider Contract
RGBL source-binding implementation spec
WSI analysis JSON Schema v0.2
ID grammar
registries
worked example bound to real RGBL IDs
```

## 43. Milestone 2 — deterministic validator

Validate:

```text
schema
registry references
source-binding resolution
evidence selectors
cross-object references
state transitions
review rules
```

## 44. Milestone 3 — RGBL connector

Read provider resources through a stable SDK/API/repository interface and pin provider revisions.

## 45. Milestone 4 — linguistic plugins + golden analyses

Build language-specific analysis plugins and a stratified golden analysis set independent of scripture identity.

## 46. Milestone 5 — semantic frame engine

Candidate generation, concept linking, assessments, provenance, and review workflows.

## 47. Milestone 6 — Witness engine

Witness Pattern registry, localized labels, response/correction, positive-direction derivation.

## 48. Milestone 7 — scale across RGBL resources

Run the same semantic contract over any eligible RGBL-addressable textual resources without adding corpus-specific core branches.

---

# PART XV — FINAL DISCIPLINE

WSI MUST remember:

```text
DO NOT INGEST THE WORLD TWICE.
DO NOT DUPLICATE SOURCE AUTHORITY.
DO NOT TURN AN EXTERNAL PASSAGE INTO A WSI PASSAGE OBJECT.
DO NOT STORE A QUOTE ANCHOR AS IF IT WERE CANONICAL SOURCE TEXT.
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
