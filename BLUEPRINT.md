# Witness Semantic Engine — Blueprint

**Status:** Normative research/engineering blueprint  
**Repository:** `bjo163/witness-semantic-engine`  
**Blueprint revision:** `2.1-draft`  
**Repository line:** `0.x` research phase  
**Architecture:** corpus-agnostic / source-corpus universal core  

---

# 0. Normative language

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHOULD**, **SHOULD NOT**, **MAY**, and **OPTIONAL** are normative requirements in this blueprint.

Witness Semantic Engine (WSE) is **spec-first**. Code, prompts, models, databases, adapters, and user interfaces are subordinate to the semantic contract.

The core MUST NOT be defined by one scripture, language, translation, canon, numbering system, or textual tradition.

---

# PART I — MISSION AND UNIVERSAL SCOPE

## 1. Purpose

WSE transforms a declared **Source Corpus** into auditable semantic propositions and, in a strictly downstream derivation layer, into a **Witness Pattern**, human-facing Witness label, response/correction, and positive direction.

The project is not primarily a translation engine, tafsir/commentary engine, keyword extractor, sentiment classifier, theological truth scorer, or verse-similarity engine.

The core research question is:

> **What does a declared source edition assert, what semantic structure is supported by evidence, what pattern can responsibly be witnessed from that structure, and what positive direction can be derived without rewriting the source?**

Canonical flow:

```text
SOURCE CORPUS
  ↓
CORPUS PROFILE + CORPUS INSTANCE
  ↓
WORK + EDITION + REFERENCE SYSTEM
  ↓
IMMUTABLE SOURCE UNIT
  ↓
TEXT VIEW + LINGUISTIC EVIDENCE
  ↓
LEXICAL SENSE
  ↓
DISCOURSE / UTTERANCE SCOPE
  ↓
PARTICIPANTS + COREFERENCE
  ↓
SEMANTIC FRAMES / PROPOSITIONS
  ↓
CANONICAL CONCEPTS + RELATIONS
  ↓
POLARITY + MODALITY + SPEECH ACT
  ↓
SOURCE DIRECTION
  ↓
PROVENANCE + CONFIDENCE + REVIEW
  ↓
ASSERTION-LEVEL REVIEW / LOCK
  ↓
WITNESS PATTERN
  ↓
LOCALIZED WITNESS LABEL
  ↓
RESPONSE / CORRECTION
  ↓
POSITIVE DIRECTION
```

---

## 2. Universal corpus terminology

The following terminology is normative.

### SOURCE CORPUS

A declared body of primary text selected for semantic research.

A Source Corpus may contain one or more works and one or more editions, but every semantic assertion MUST ultimately identify the exact edition/source unit that supports it.

### CORPUS PROFILE

A **declarative description** of how a corpus family is structured.

A Corpus Profile may define:

```text
profile_id
name
work model
supported languages
scripts
reference systems
textual-tradition metadata
source-unit hierarchy
adapter capabilities
profile version
```

Examples of profiles MAY include:

```text
quran
Torah-associated corpus
Psalms-associated corpus
Gospel-associated corpus
```

These are profiles, not hardcoded modes in the semantic core.

### CORPUS INSTANCE

A concrete research dataset produced from a Corpus Profile plus selected work/edition/source metadata.

Example conceptually:

```text
Corpus Profile: quran
Corpus Instance: <specific declared Arabic edition + reference system>
```

### CORPUS ADAPTER

Implementation code responsible for corpus-specific ingestion and linguistic integration.

An adapter converts corpus-specific structures into the universal WSI Machine Contract.

The core semantic engine MUST NOT contain logic equivalent to:

```text
if corpus == quran: ...
if corpus == torah: ...
```

Corpus-specific behavior belongs behind adapter/profile interfaces.

### WORK

A logical textual work or sub-work within a Source Corpus.

### EDITION

A concrete textual edition/version used as primary evidence.

### REFERENCE SYSTEM

The addressing/versification system used to locate source units.

### SOURCE UNIT

The smallest or selected addressable unit presented to semantic analysis. It MUST NOT be universally named `verse` or `ayah`.

---

## 3. No privileged corpus rule

No Source Corpus is the ontology.

No Source Corpus may define universal fields solely because it is processed first.

A first implementation corpus MAY be used to bootstrap tooling, but:

```text
FIRST IMPLEMENTATION CORPUS
!=
UNIVERSAL ARCHITECTURAL AUTHORITY
```

Before a core schema field, invariant, enum, or semantic abstraction is considered stable, it SHOULD be tested against multiple distinct Corpus Profiles.

The Qur'an MAY be an early reference implementation and may provide early worked examples. It MUST NOT be a hard dependency of the universal core.

As-Saffat 37:30 remains only a **non-normative worked example**.

---

# PART II — FOUNDATIONAL AXIOMS

## 4. Axioms

### A1 — Source identity precedes semantics

Every assertion MUST resolve to a Source Corpus, Corpus Instance, work, edition, reference system, and source unit.

### A2 — Source is immutable

Raw ingested source text MUST remain reproducible from its declared edition.

### A3 — Normalization creates a view

Normalization MUST NOT overwrite raw source.

### A4 — Frames before keywords

The primary semantic unit is a frame/proposition, not a semantic key.

### A5 — Lexeme is not sense

Surface, lemma, root, and lexeme MUST NOT automatically become universal concepts.

### A6 — Sense is not automatically universal concept

Contextual lexical sense and universal concept mapping are separate layers.

### A7 — Concept identity is language-neutral

English is a technical label, not semantic identity.

### A8 — Participant, role, relation, concept, polarity, modality, speech act, and direction are separate dimensions

They MUST NOT be collapsed into compound keys.

### A9 — Translation and interpretation remain secondary evidence layers

They MAY support research but MUST NOT overwrite primary text.

### A10 — Direction is not polarity

Negation is logical scope; direction is evaluative orientation.

### A11 — Witness is derived

Witness MUST NOT be stored as translation, source meaning, or canonical concept.

### A12 — Positive direction does not rewrite source direction

A negative source condition remains negative when source evidence supports it.

### A13 — Unknown is valid

`UNKNOWN`, `UNRESOLVED`, and `UNDETERMINED` are valid outputs.

### A14 — Lock applies to assertions, not corpora

`LOCKED` is a review state for semantic assertions/frames/records.

The system MUST NOT describe the Qur'an, Torah, Psalms, Gospels, or any Source Corpus itself as “locked into the framework.”

### A15 — Cross-corpus similarity is not theological equivalence

Semantic mappings MUST declare scope, provenance, mapping type, and confidence.

---

# PART III — CORPUS AND SOURCE ARCHITECTURE

## 5. Source hierarchy

The universal hierarchy is:

```text
SOURCE CORPUS
  └─ CORPUS INSTANCE
      └─ WORK
          └─ EDITION
              └─ REFERENCE SYSTEM
                  └─ SOURCE UNIT
```

This hierarchy is semantic-infrastructure identity, not a theological hierarchy.

---

## 6. Corpus Profile contract

A Corpus Profile SHOULD declare:

```text
profile_id
profile_version
name
scope
work_structure
supported_languages
supported_scripts
reference_system_types
source_unit_types
required_edition_metadata
adapter_interface_version
status
```

The universal core reads only normalized contract outputs from the adapter/profile boundary.

---

## 7. Corpus Instance contract

A Corpus Instance SHOULD declare:

```text
corpus_instance_id
profile_id
work_ids
edition_ids
reference_system_ids
languages
scripts
license metadata
source provenance
checksums
status
```

A Corpus Instance is the correct unit for saying **which actual textual material is being analyzed**.

---

## 8. Edition model

Every primary textual source MUST have an edition record with, where applicable:

```text
edition_id
corpus_instance_id
work_id
title
language
script
textual_tradition
canon_profile
reference_system_id
publisher_or_source
source_uri
license
version
checksum
normalization_policy
status
```

The system MUST NOT silently equate an abstract theological revelation with one selected textual edition.

---

## 9. Reference systems

References such as `37:30`, `Gen.1.1`, `Ps.1.1`, or `Mark.1.1` are external addresses, not globally unique semantic IDs.

WSI MUST distinguish:

```text
corpus instance
work
edition
reference system
external reference
internal source-unit ID
```

External standards MAY be mapped, but internal WSI identity remains stable and explicit.

---

## 10. Source Unit

A Source Unit SHOULD contain:

```text
unit_id
corpus_instance_id
work_id
edition_id
reference_system_id
canonical_reference
raw_text
language
script
parent_unit_ids
sequence
checksum
```

Use generic `source_unit` terminology in core schemas.

Corpus-specific names such as `ayah`, `verse`, `Psalm`, `chapter`, `pericope`, or `line` belong to profile metadata.

---

## 11. Text views

Source units MAY expose:

```text
RAW
DISPLAY
NORMALIZED
SEARCH
LINGUISTIC
```

Every non-raw view MUST record its transformation profile/version.

No adapter may silently mutate the primary source string.

---

# PART IV — LINGUISTIC AND SEMANTIC MODEL

## 12. Tokenization and morphology

Tokens and linguistic analyses are edition/view/tool-version scoped.

Possible fields:

```text
token_id
surface
lemma
root
pos
morphological_features
syntax
dependency_relation
lexeme_id
analysis_source
analysis_version
```

Rules:

```text
TOKEN != LEXEME
LEXEME != LEXICAL_SENSE
LEMMA != CONCEPT
ROOT != CONCEPT
POS != CONCEPT
```

Language-specific morphology belongs in corpus/language adapters while canonical semantic output remains universal.

---

## 13. Lexical Sense

A contextual lexical-sense layer is REQUIRED when ambiguity exists.

Conceptual path:

```text
SURFACE
→ LEXEME / LEMMA
→ CONTEXTUAL LEXICAL SENSE
→ FRAME ROLE
→ CANONICAL CONCEPT MAPPING
```

Shared translation strings MUST NOT be used as proof of shared sense across languages.

---

## 14. Discourse and utterance scope

The engine SHOULD model speaker/addressee/quotation scope explicitly.

```text
utterance_id
parent_utterance_id
speaker_participant_id
addressee_participant_ids
quoted_or_reported
source_span
speech_act
```

A `SPEAKER` role is scoped to an utterance, not globally to a source unit.

---

## 15. Participants and coreference

Participant records SHOULD include:

```text
participant_id
surface_reference
entity_type
discourse_roles
resolved_identity
resolution_status
resolution_evidence
coreference_cluster_id
```

Rules:

```text
PARTICIPANT != CONCEPT
GRAMMATICAL_SUBJECT != SEMANTIC_AGENT by default
SPEAKER != AGENT by default
ADDRESSEE != PATIENT by default
```

Context resolution MUST NOT overwrite surface evidence.

---

## 16. Semantic roles

Semantic roles are frame-scoped.

Initial generic candidates MAY include:

```text
AGENT
PATIENT
THEME
EXPERIENCER
HOLDER
TARGET
RECIPIENT
SOURCE
GOAL
LOCATION
INSTRUMENT
STATE_BEARER
```

Role inventories MUST remain versioned and corpus-neutral.

---

## 17. Semantic Frames

Frames are the primary canonical semantic unit.

Initial generic frame classes:

```text
ACTION
STATE
RELATION
EVENT
ATTRIBUTE
```

A frame SHOULD preserve:

```text
frame_id
source_unit_id
utterance_id
frame_class
predicate_or_relation
role bindings
concept refs
polarity
modality
speech act
temporal information
evidence
confidence
review status
```

Frames MUST preserve enough structure to answer:

> who/what does/is what, toward whom/what, under which scope, polarity, modality, and evidence?

---

## 18. Concepts and relations

Concept and relation identity MUST be stable and language-neutral.

Example:

```text
concept:  wsi:concept/authority
relation: wsi:relation/authority-over
```

Wrong:

```text
[NO-AUTHORITY-OVER-YOU]
```

Correct decomposition:

```text
concept = AUTHORITY
relation = AUTHORITY_OVER
holder = P1
target = P2
polarity = NEGATED
```

---

## 19. Source-specific sense → universal concept

WSI supports two levels:

```text
SOURCE/CONTEXT SENSE
→ reviewed mapping
UNIVERSAL WSI CONCEPT
```

Mapping MAY remain unresolved.

A universal ontology must not be expanded merely to make every source expression fit.

---

## 20. Polarity, modality, speech act, and temporal information

These are separate dimensions.

### Polarity

```text
AFFIRMED
NEGATED
UNDETERMINED
```

### Modality

Possible values include:

```text
ASSERTED
POSSIBLE
PROBABLE
NECESSARY
HYPOTHETICAL
COUNTERFACTUAL
UNDETERMINED
```

### Speech act

Possible values include:

```text
ASSERTION
COMMAND
PROHIBITION
QUESTION
REQUEST
PROMISE
WARNING
OATH
SUPPLICATION
UNDETERMINED
```

Grammatical tense MUST NOT be treated as a complete temporal model.

---

# PART V — TRANSLATION, COMMENTARY, AND EVIDENCE

## 21. Translation layer

Translations are research/presentation resources.

Translation alone MUST NOT create `DIRECT` primary-source evidence when a declared primary-language source exists.

Multiple translations SHOULD coexist with separate provenance.

---

## 22. Interpretation source layer

Generic interpretation-source types MAY include:

```text
TAFSIR
COMMENTARY
EXEGESIS
LEXICON
GRAMMAR
SCHOLARLY_NOTE
TRADITIONAL_NOTE
```

Interpretation sources may support, challenge, or offer alternatives to semantic assertions. They MUST NOT overwrite source evidence.

---

## 23. Evidence source class vs derivation type

Keep these independent.

Evidence source class:

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

Derivation type:

```text
DIRECT
COMPOSITIONAL
CONTEXTUAL
INTERPRETIVE
DERIVED
```

---

# PART VI — DIRECTION, PROVENANCE, REVIEW

## 24. Source Direction

`SOURCE_DIRECTION` describes evaluative orientation supported by source context.

```text
POSITIVE
NEGATIVE
NEUTRAL
MIXED
UNDETERMINED
```

Rules:

```text
POLARITY != SOURCE_DIRECTION
MODALITY != SOURCE_DIRECTION
SPEECH_ACT != SOURCE_DIRECTION
```

Frame-level direction is primary. Source-unit direction is optional derived summary.

---

## 25. Provenance

Every canonical assertion MUST be traceable to:

```text
corpus_instance_id
work_id
edition_id
source_unit_id
text view / evidence span
source class
derivation type
researcher or extractor
framework version
schema version
ontology version
adapter version
extractor version
review status
created_at
```

AI-produced candidates SHOULD additionally preserve model/provider/policy metadata when available.

---

## 26. Confidence

Confidence is **operational research confidence**, not theological truth percentage.

It MUST be decomposable and policy-versioned.

Possible dimensions:

```text
source_directness
lexical_sense_fit
morphology_support
syntax_support
discourse_support
context_consistency
ontology_fit
cross_source_support
```

No permanent universal weighting is fixed in this blueprint.

---

## 27. Review states

Assertion/frame lifecycle:

```text
CANDIDATE
RESEARCHED
REVIEWED
LOCKED
DISPUTED
DEPRECATED
```

Important:

```text
LOCKED = assertion review state
LOCKED != corpus ownership
LOCKED != theological certainty
```

A corpus may contain locked, disputed, candidate, and unresolved assertions simultaneously.

---

# PART VII — WITNESS CONTRACT

## 28. Witness Pattern vs Witness Label

Machine identity:

```text
wsi:witness-pattern/<slug>
```

Human-facing label:

```text
OFFSIDE
```

A Witness Pattern MAY have multiple labels by language, locale, culture, audience, or domain.

A Witness label MUST NOT become a universal ontology concept automatically.

---

## 29. Witness derivation

Witness asks:

> **What recognizable pattern is exhibited by the reviewed semantic condition?**

Production Witness SHOULD consume `LOCKED` assertions; research preview MAY consume `REVIEWED` assertions with provisional status.

Valid output includes:

```text
WITNESS = UNRESOLVED
```

---

## 30. Response / correction

The generic machine layer is `response`.

Possible response classes:

```text
CORRECT
RETURN
STOP
AVOID
ALIGN
MAINTAIN
CULTIVATE
DEVELOP
RESTORE
UNRESOLVED
```

`correction` is a response subtype/semantic case, not mandatory for every source condition.

---

## 31. Positive Direction

Positive direction is a downstream target state.

```text
POSITIVE_DIRECTION != SOURCE_DIRECTION
```

Examples:

```text
NEGATIVE SOURCE
→ WITNESS
→ CORRECTION
→ POSITIVE TARGET
```

```text
POSITIVE SOURCE
→ WITNESS
→ MAINTAIN / CULTIVATE
→ POSITIVE TARGET
```

The system MUST allow positive direction to remain unresolved.

---

# PART VIII — CROSS-CORPUS RESEARCH

## 32. Independent extraction first

Each Source Corpus MUST be extracted independently before cross-corpus semantic alignment.

Wrong:

```text
Corpus A meaning
→ force Corpus B to match
```

Correct:

```text
SOURCE CORPUS A
→ independent assertions
→ reviewed semantics

SOURCE CORPUS B
→ independent assertions
→ reviewed semantics

ONLY THEN
→ scoped semantic alignment
```

---

## 33. Cross-corpus mapping

Mappings MAY compare:

```text
concept ↔ concept
frame ↔ frame
relation ↔ relation
witness pattern ↔ witness pattern
positive direction ↔ positive direction
```

Candidate mapping types:

```text
EXACT_MATCH
CLOSE_MATCH
BROADER_MATCH
NARROWER_MATCH
RELATED_MATCH
CONTRASTING
UNRESOLVED
```

Every mapping MUST declare scope, evidence, provenance, confidence, and review status.

No mapping automatically implies theological equivalence.

---

# PART IX — CORPUS PROFILE / ADAPTER CONTRACT

## 34. Universal adapter interface

A Corpus Adapter SHOULD implement shared capabilities such as:

```text
describe_profile()
list_works()
list_editions()
resolve_reference()
load_source_unit()
create_text_views()
provide_linguistic_candidates()
provide_reference_mappings()
validate_source_integrity()
```

Adapter output MUST map into the same universal semantic contract.

---

## 35. Example Corpus Profiles

The following are **examples of profiles**, not core modes:

```text
profiles/quran
profiles/torah
profiles/psalms
profiles/gospels
```

Potential adapter-specific concerns:

### Qur'an profile

Arabic orthography, surah/ayah addressing, Arabic morphology, reading/edition metadata.

### Torah-associated profile

Work/book structure, Hebrew editions, textual tradition, morphology, versification.

### Psalms-associated profile

Psalm numbering, poetic structure, textual tradition, reference mapping.

### Gospel-associated profile

Individual works, Greek editions where selected, quotation/speaker structure, reference system.

These concerns MUST NOT leak into universal core fields unless proven to be cross-corpus abstractions.

---

# PART X — MACHINE CONTRACT

## 36. Canonical contract

Initial exchange format:

```text
JSON
+ JSON Schema 2020-12
+ versioned registries
+ deterministic invariant validation
```

Conceptual record:

```json
{
  "record_id": "...",
  "contract_version": "...",
  "source": {},
  "lexical_senses": [],
  "utterances": [],
  "participants": [],
  "frames": [],
  "discourse_relations": [],
  "concept_refs": [],
  "source_direction_summary": null,
  "witnesses": [],
  "provenance": {},
  "review": {}
}
```

The contract MUST use generic source/corpus terminology.

---

## 37. Stable identifiers

Recommended namespaces:

```text
wsi:profile/<slug>
wsi:corpus/<slug>
wsi:work/<slug>
wsi:edition/<slug>
wsi:refsys/<slug>
urn:wsi:unit:<corpus>:<edition>:<reference>
wsi:concept/<slug>
wsi:relation/<slug>
wsi:witness-pattern/<slug>
```

Human-readable references are metadata, not sole identity.

---

## 38. Validation layers

A machine record is accepted only after distinct validation passes:

```text
1. JSON Schema structure
2. Registry referential integrity
3. Semantic invariant validation
4. Corpus-profile/source integrity validation
5. Research review policy
```

Schema validity alone is not semantic validity.

---

## 39. Core invariants

The validator MUST eventually enforce at least:

```text
I01 SOURCE_CORPUS_CONTEXT_REQUIRED
I02 CORPUS_PROFILE_REQUIRED
I03 EDITION_REQUIRED
I04 REFERENCE_SYSTEM_REQUIRED
I05 SOURCE_IS_IMMUTABLE
I06 NORMALIZATION_IS_DERIVED_VIEW
I07 ASSERTION_REQUIRES_EVIDENCE
I08 TOKEN_IS_NOT_CONCEPT
I09 LEMMA_IS_NOT_CONCEPT
I10 LEXEME_IS_NOT_LEXICAL_SENSE
I11 PARTICIPANT_IS_NOT_CONCEPT
I12 DISCOURSE_ROLE_IS_NOT_SEMANTIC_ROLE
I13 RELATION_IS_NOT_CONCEPT
I14 POLARITY_IS_NOT_DIRECTION
I15 MODALITY_IS_NOT_SPEECH_ACT
I16 TRANSLATION_CANNOT_CREATE_DIRECT_PRIMARY_EVIDENCE_ALONE
I17 INTERPRETATION_CANNOT_OVERWRITE_PRIMARY_SOURCE
I18 CONTEXT_CANNOT_OVERWRITE_SURFACE_REFERENCE
I19 UNIVERSAL_CONCEPT_MAPPING_MAY_BE_UNRESOLVED
I20 WITNESS_IS_NOT_CANONICAL_CONCEPT
I21 WITNESS_LABEL_IS_NOT_WITNESS_PATTERN
I22 RESPONSE_IS_NOT_SOURCE_ASSERTION
I23 POSITIVE_DIRECTION_IS_NOT_SOURCE_DIRECTION
I24 UNRESOLVED_IS_VALID
I25 VERSIONED_PROVENANCE_REQUIRED
I26 ASSERTION_LOCK_REQUIRED_BEFORE_PRODUCTION_WITNESS
I27 CORPUS_IS_NEVER_A_UNIVERSAL_ONTOLOGY
I28 CORE_MUST_NOT_REQUIRE_A_SPECIFIC_CORPUS_PROFILE
I29 CORPUS_SPECIFIC_FIELDS_MUST_BE_NAMESPACED_OR_ADAPTER_SCOPED
I30 CROSS_CORPUS_MAPPING_REQUIRES_INDEPENDENT_ASSERTIONS
```

---

# PART XI — RESEARCH OPERATIONS

## 40. Candidate lane and review lane

Candidate lane:

```text
source
→ linguistic candidates
→ sense candidates
→ participant candidates
→ frame candidates
→ concept candidates
```

Research lane:

```text
candidate
→ evidence review
→ conflict resolution
→ reviewed assertion
→ optional assertion lock
```

Witness runs downstream from reviewed semantics.

---

## 41. Golden data strategy

Golden data MUST test the universal core, not only one corpus.

### Stage A — within-profile diversity

Each profile should include difficult phenomena such as dialogue, nested speech, negation, conditions, commands, questions, coreference, polysemy, temporal relations, and unresolved cases.

### Stage B — multi-profile portability

Before core schema `1.0`, the same contract SHOULD be demonstrated against multiple distinct Corpus Profiles.

A field that only exists to fit one profile SHOULD remain adapter/profile-specific until justified as universal.

As-Saffat 37:30 is one golden candidate, not a schema template.

---

## 42. Coverage metrics

Metrics SHOULD be corpus-instance scoped:

```text
source_ingestion_coverage
linguistic_candidate_coverage
frame_candidate_coverage
reviewed_frame_coverage
locked_assertion_coverage
concept_mapping_coverage
witness_coverage
positive_direction_coverage
unresolved_rate
disputed_rate
```

No corpus is “semantically complete” merely because every source unit has JSON.

---

# PART XII — IMPLEMENTATION ARCHITECTURE

## 43. Language strategy

The contract is implementation-independent.

### Python

Preferred first for research, multilingual NLP integration, schema validation, ontology iteration, evaluation, and corpus adapter development.

### Rust

Optional after contracts stabilize for deterministic typed validation, CLI/batch performance, and embeddable core requirements.

### TypeScript / JavaScript

Preferred later for API, review UI, explorer, graph visualization, and annotation workflows.

### Go

Viable for infrastructure/services but not currently preferred for research-core iteration.

---

## 44. Module boundaries

Recommended universal modules:

```text
core/
contracts/
registries/
corpus/
profiles/
adapters/
source/
references/
text_views/
linguistics/
senses/
discourse/
participants/
coreference/
frames/
relations/
ontology/
direction/
provenance/
confidence/
review/
validation/
witness/
response/
positive_direction/
alignment/
export/
```

Profile-specific code lives under adapters/profiles, never by duplicating semantic core logic.

---

## 45. No model lock-in

LLMs MAY generate candidates, but canonical data MUST remain provider-independent.

Deterministic validation SHOULD govern schema, IDs, registries, references, provenance, review-state transitions, and source-integrity checks.

---

# PART XIII — VERSIONING

## 46. Version domains

Keep separate:

```text
repository_version
blueprint_version
contract_version
schema_version
ontology_version
registry_version
corpus_profile_version
corpus_adapter_version
source_edition_version
extractor_version
confidence_policy_version
witness_policy_version
```

A corpus profile update MUST NOT silently redefine universal concept identity.

---

# PART XIV — ROADMAP

## 47. Milestone 0 — Repository foundation

Repository governance, blueprint, versioning, changelog, and release automation.

## 48. Milestone 1 — Universal Machine Contract

Deliver:

```text
JSON Schema
ID grammar
universal registries
Source Corpus / Corpus Profile contract
edition/reference/source-unit contract
frame/concept/provenance contracts
review-state machine
```

Exit criterion:

The contract contains no mandatory field whose meaning depends on one named corpus.

## 49. Milestone 2 — First reference Corpus Profile

Implement one complete Corpus Profile and adapter to exercise the contract end-to-end.

The current expected first reference implementation may be the Qur'an profile, but that is a project sequencing choice, not a semantic-core rule.

## 50. Milestone 3 — Multi-profile portability validation

Before declaring the core stable, test selected samples from additional distinct profiles, such as Torah-, Psalms-, and Gospel-associated corpora.

Goal:

```text
prove core portability
identify profile leakage
move corpus-specific fields out of core
validate multilingual sense model
validate reference-system abstraction
```

## 51. Milestone 4 — Per-corpus full ingestion and candidate extraction

Each approved Corpus Instance can independently progress through full ingestion and candidate extraction.

No global ordering is required by the architecture.

## 52. Milestone 5 — Review and assertion-lock programs

Review/lock operates per assertion, per corpus instance.

## 53. Milestone 6 — Witness and positive-direction engine

Consume reviewed/locked assertions from any supported Source Corpus.

## 54. Milestone 7 — Cross-corpus semantic alignment

Only after independent semantics exist.

## 55. Milestone 8 — Semantic-web and typed-core exports

Evaluate JSON-LD, RDF, SKOS, OntoLex, PROV-O, SHACL, Rust typed core, and TypeScript explorer based on demonstrated value.

---

# PART XV — STANDARDS BASELINE

## 56. Interoperability principles

WSI SHOULD remain compatible in spirit with:

- **JSON Schema 2020-12** for machine structure;
- **SKOS** for concept identity/labels/semantic mappings;
- **OntoLex-Lemon** for lexical entries and senses;
- **RDF/JSON-LD** for graph export;
- **PROV-O** for provenance export;
- **SHACL** for future graph constraints;
- corpus-specific external reference systems where appropriate.

External standards guide interoperability. They do not replace WSI research discipline.

---

# PART XVI — ARCHITECTURAL DECISIONS

## 57. Baseline decisions

1. WSI is corpus-agnostic and spec-first.
2. `SOURCE CORPUS` is the universal domain term.
3. `CORPUS PROFILE` is declarative corpus-family configuration.
4. `CORPUS INSTANCE` identifies actual research data.
5. `CORPUS ADAPTER` handles source/language-specific integration.
6. No named corpus is a hard dependency of semantic core.
7. Qur'an may be an early reference implementation, not the architecture.
8. As-Saffat 37:30 is a non-normative worked example only.
9. Source identity includes edition and reference system.
10. Source Unit is generic; `verse`/`ayah` are profile-specific terms.
11. Lexical Sense is separate from lexeme and universal concept.
12. Semantic frames are primary; semantic keys are concept displays.
13. Participant, role, relation, concept, polarity, modality, speech act, and direction remain separate.
14. Source direction and positive direction are distinct.
15. Witness Pattern and localized Witness Label are distinct.
16. Locking applies to assertions/review states, not to corpora.
17. Universal concept mapping may remain unresolved.
18. Cross-corpus alignment follows independent extraction.
19. Multi-profile validation is required before declaring the universal core stable.
20. JSON + JSON Schema is the initial machine contract.
21. Python is the first research implementation language; other implementations must consume the same contract.
22. Only `dev` and `main` are long-lived repository branches.

Changes to these decisions MUST be explicit and versioned.

---

# PART XVII — FINAL DISCIPLINE

## 58. WSI invariant summary

```text
DO NOT STORE A CORPUS AS IF IT WERE THE UNIVERSAL ONTOLOGY.
DO NOT HARD-CODE ONE SCRIPTURE INTO THE SEMANTIC CORE.
DO NOT STORE AN EDITION AS IF IT WERE AN ABSTRACT REVELATION.
DO NOT STORE A TRANSLATION AS IF IT WERE PRIMARY SOURCE.
DO NOT STORE A LEMMA AS IF IT WERE A SENSE.
DO NOT STORE A SENSE AS IF IT WERE AUTOMATICALLY A UNIVERSAL CONCEPT.
DO NOT STORE A PARTICIPANT AS A CONCEPT.
DO NOT STORE A RELATION AS A CONCEPT.
DO NOT STORE NEGATION AS A CONCEPT.
DO NOT STORE COMMENTARY AS SOURCE ASSERTION.
DO NOT STORE WITNESS AS TRANSLATION.
DO NOT STORE A LOCAL WITNESS LABEL AS A UNIVERSAL CONCEPT.
DO NOT STORE POSITIVE DIRECTION AS SOURCE MEANING.
DO NOT STORE CROSS-CORPUS SIMILARITY AS THEOLOGICAL EQUIVALENCE.
DO NOT FORCE AN ANSWER WHERE EVIDENCE IS UNRESOLVED.
```

Instead:

```text
DECLARE THE SOURCE CORPUS
→ LOAD THE CORPUS PROFILE
→ IDENTIFY THE CORPUS INSTANCE / WORK / EDITION / REFERENCE SYSTEM
→ PRESERVE THE SOURCE
→ ANALYZE THE LANGUAGE
→ RESOLVE THE SENSE
→ RESOLVE DISCOURSE SCOPE
→ IDENTIFY PARTICIPANTS
→ BUILD FRAMES
→ MAP CONCEPTS CONSERVATIVELY
→ RECORD POLARITY / MODALITY / SPEECH ACT
→ EVALUATE SOURCE DIRECTION
→ ATTACH EVIDENCE + PROVENANCE
→ REVIEW ASSERTIONS
→ OPTIONALLY LOCK ASSERTIONS
→ WITNESS THE PATTERN
→ SELECT A HUMAN LABEL
→ DERIVE A RESPONSE
→ MOVE TOWARD A DEFENSIBLE POSITIVE DIRECTION
```

That sequence, not any single corpus, is the architectural identity of **Witness Semantic Engine**.
