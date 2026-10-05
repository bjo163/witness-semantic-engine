# Witness Semantic Engine — Blueprint

**Status:** Normative research/engineering blueprint  
**Repository:** `bjo163/witness-semantic-engine`  
**Blueprint revision:** `2.0-draft`  
**Repository line:** `0.x` research phase  
**Primary implementation target:** full Qur'an corpus first  
**Future corpus families:** Torah, Psalms, Gospel corpora  

---

# 0. Normative language

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** are to be interpreted as normative requirements in this blueprint.

This blueprint is intentionally **spec-first**. Implementation code, model prompts, databases, and user interfaces are subordinate to the semantic contract defined here.

---

# PART I — MISSION, SCOPE, AND RESEARCH BOUNDARIES

## 1. Purpose

Witness Semantic Engine (WSE) is a semantic research system for transforming revelation-associated source corpora into **auditable semantic propositions**, and then, in a strictly separate derivation layer, producing a **Witness**, a response/correction, and a **positive direction**.

The system is not primarily:

- a translation engine;
- a tafsir/commentary engine;
- a keyword extractor;
- a sentiment classifier;
- a theological truth scorer;
- a generic LLM prompt collection;
- a verse similarity engine.

Those functions may contribute evidence or presentation, but they are not the canonical semantic contract.

The core research question is:

> **What does the selected source edition explicitly assert, what semantic structure is supported by evidence, what can responsibly be witnessed from that structure, and what positive direction can be derived without rewriting the source?**

Canonical transformation:

```text
CORPUS + EDITION + REFERENCE SYSTEM
  ↓
IMMUTABLE SOURCE UNIT
  ↓
LINGUISTIC EVIDENCE
  ↓
LEXICAL SENSES
  ↓
DISCOURSE / SPEAKER SCOPE
  ↓
PARTICIPANTS + COREFERENCE
  ↓
SEMANTIC FRAMES / PROPOSITIONS
  ↓
SOURCE-SPECIFIC SENSE MAPPING
  ↓
CANONICAL CONCEPTS + RELATIONS
  ↓
POLARITY + MODALITY + SPEECH ACT
  ↓
SOURCE DIRECTION
  ↓
PROVENANCE + CONFIDENCE + REVIEW
  ↓
BASE SEMANTICS LOCK
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

## 2. Corpus roadmap

### 2.1 Phase A — Full Qur'an first

The first production research target is the **full Qur'an corpus**, not a collection of hand-picked verses.

As-Saffat 37:30 is only a **non-normative worked example** used to test distinctions such as:

- speaker vs addressee;
- negated relation;
- discourse correction/retraction;
- semantic state;
- source direction;
- Witness derivation.

It MUST NOT determine the schema by itself.

The schema must be validated against diverse Qur'anic phenomena before being considered stable, including:

- narrative;
- dialogue;
- nested/reported speech;
- pronouns and coreference;
- ellipsis;
- negation and negation scope;
- commands and prohibitions;
- questions;
- oaths;
- conditions;
- comparisons;
- causal and purposive relations;
- temporal relations;
- multiple participants;
- divine and human speech;
- positive, negative, mixed, and unresolved evaluation;
- lexical ambiguity and polysemy;
- repeated passages with different local contexts.

### 2.2 Phase B — Three additional revelation-associated corpus families

The architecture SHOULD later support three additional corpus families:

```text
TAWRAT / TORAH-ASSOCIATED CORPUS
ZABUR / PSALMS-ASSOCIATED CORPUS
INJIL / GOSPEL-ASSOCIATED CORPUS
```

For engineering identifiers, initial neutral corpus slugs are recommended:

```text
torah
psalms
gospels
```

The system MUST NOT silently claim that a selected modern or historical textual edition is identical to a theological concept of an original revelation.

Instead, every analysis MUST explicitly identify:

```text
corpus_family
work
edition
textual_tradition
canon_profile
reference_system
language
script
source_version
license
checksum
```

This makes the project capable of studying revelation-associated texts while remaining transparent about the actual textual witness being analyzed.

### 2.3 Independent extraction before cross-corpus comparison

Each corpus MUST first be semantically extracted **independently**.

Wrong architecture:

```text
Qur'an concept
→ force equivalent Torah/Psalm/Gospel concept
```

Required architecture:

```text
CORPUS A SOURCE
→ independent semantic extraction
→ locked assertions

CORPUS B SOURCE
→ independent semantic extraction
→ locked assertions

ONLY THEN:
locked concept/frame A
↔ reviewed cross-corpus alignment
↔ locked concept/frame B
```

Cross-corpus alignment is a separate research layer and MUST NOT rewrite either source corpus.

---

## 3. Foundational axioms

### A1 — Source identity precedes semantics

No passage exists in the machine model without a corpus, edition, language, and reference system.

### A2 — Source is immutable

Raw ingested source text MUST remain byte-for-byte or codepoint-for-codepoint reproducible from its declared edition.

### A3 — Normalization is a view, not a replacement

Removing Arabic diacritics, Hebrew cantillation, Greek accents, punctuation, or orthographic marks MUST create a derived text view. It MUST NOT overwrite the raw source.

### A4 — Frames before keywords

The primary semantic unit is a proposition/frame, not a keyword.

### A5 — Lexeme is not sense

A surface form, root, or lemma MUST NOT be mapped directly to a universal concept without sense resolution when ambiguity exists.

### A6 — Concept identity is language-neutral

English labels are technical presentation labels, not ontology identity.

### A7 — Source semantics and interpretation are separate

Translation, tafsir, exegesis, commentary, lexicons, and AI suggestions may support research, but MUST retain separate provenance.

### A8 — Direction is not polarity

Negation is a logical property. Positive/negative direction is evaluative orientation. They are different dimensions.

### A9 — Witness is derived

Witness MUST NOT be stored as if it were translation, lexical meaning, or source assertion.

### A10 — Positive direction does not rewrite the source

A negative source condition remains negative when supported by the source. Positive direction is a later response target.

### A11 — Unknown is valid

`UNKNOWN`, `UNRESOLVED`, and `UNDETERMINED` are valid research outcomes.

### A12 — Cross-corpus similarity is not theological equivalence

Semantic alignment MUST be expressed as a scoped research mapping with provenance and confidence, never as an unqualified claim that two revelations, editions, or doctrines are identical.

---

# PART II — CORPUS AND SOURCE ARCHITECTURE

## 4. Corpus identity model

A machine-readable corpus profile SHOULD contain:

```text
corpus_id
corpus_family
name
scope
tradition_context
works
languages
reference_systems
status
```

Example conceptually:

```json
{
  "corpus_id": "wsi:corpus/quran",
  "corpus_family": "quran",
  "scope": "Qur'anic text",
  "status": "ACTIVE"
}
```

Future examples:

```text
wsi:corpus/torah
wsi:corpus/psalms
wsi:corpus/gospels
```

Corpus identity alone is insufficient for source claims. A source edition is required.

---

## 5. Edition model

Every ingested textual edition MUST have an edition record.

Recommended fields:

```text
edition_id
corpus_id
title
language
script
textual_tradition
canon_profile
reference_system_id
publisher_or_source
source_uri
license
license_constraints
version
checksum_algorithm
checksum
normalization_policy
status
```

Example identifier pattern:

```text
wsi:edition/quran/<edition-slug>
wsi:edition/torah/<edition-slug>
wsi:edition/psalms/<edition-slug>
wsi:edition/gospels/<edition-slug>
```

The blueprint intentionally does not yet lock a specific Torah, Psalms, or Gospel edition. Edition selection requires a separate documented research/licensing decision.

---

## 6. Reference systems and versification

A canonical reference such as `37:30` or `Gen.1.1` is not sufficient as a global identifier.

The engine MUST distinguish:

```text
work identity
edition identity
reference system
canonical reference
internal source-unit identity
```

Reason: chapter/verse numbering, book scope, Psalm numbering, textual divisions, and canonical profiles may differ between traditions and editions.

Recommended model:

```json
{
  "reference_system_id": "...",
  "external_reference": "Gen.1.1",
  "internal_unit_id": "..."
}
```

External standards such as OSIS or USFM identifiers MAY be stored as mappings, but MUST NOT replace WSI internal identity.

Recommended external reference record:

```json
{
  "system": "OSIS",
  "value": "Gen.1.1"
}
```

For Qur'an units:

```json
{
  "system": "QURAN_SURAH_AYAH",
  "value": "37:30"
}
```

---

## 7. Generic source unit

The engine MUST use a generic term such as **source unit** or **passage unit**, not assume that every corpus is structurally a Qur'anic ayah or Biblical verse.

Minimum unit record:

```text
unit_id
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

Recommended ID pattern:

```text
urn:wsi:unit:<corpus>:<edition>:<reference>
```

Examples:

```text
urn:wsi:unit:quran:<edition>:37:30
urn:wsi:unit:torah:<edition>:Gen.1.1
urn:wsi:unit:psalms:<edition>:Ps.1.1
urn:wsi:unit:gospels:<edition>:Mark.1.1
```

These examples are illustrative; final escaping/canonical URI grammar belongs to the schema milestone.

---

## 8. Text views

Every source unit MAY expose multiple views:

```text
RAW
DISPLAY
NORMALIZED
SEARCH
LINGUISTIC
```

Each non-raw view MUST declare:

```text
view_id
source_unit_id
transformation_profile
transformation_version
text
checksum
```

Examples of transformations that MUST be explicit:

- Arabic diacritic handling;
- Qur'anic orthographic sign handling;
- Hebrew niqqud/cantillation handling;
- Greek diacritic normalization;
- Unicode normalization;
- punctuation normalization.

No linguistic pipeline may silently change the source string.

---

# PART III — LINGUISTIC AND SEMANTIC RESEARCH MODEL

## 9. Tokenization

Tokens are analysis artifacts tied to a text view.

Recommended fields:

```text
token_id
unit_id
text_view_id
sequence
surface
char_start
char_end
tokenizer_id
tokenizer_version
```

Token stability is defined relative to:

```text
source edition
text view
tokenizer version
```

Token sequence numbers MUST NOT be treated as eternally stable across incompatible tokenizer versions.

---

## 10. Morphology and lexemes

Linguistic analysis MAY include:

```text
lemma
root
pos
morphological_features
syntax
dependency_relation
lexeme_id
analysis_source
```

Rules:

```text
TOKEN ≠ LEXEME
LEXEME ≠ LEXICAL SENSE
LEMMA ≠ CONCEPT
ROOT ≠ CONCEPT
POS ≠ CONCEPT
```

This is especially important for Arabic, Biblical Hebrew, and Koine Greek, where one lexical form may participate in multiple senses and constructions.

---

## 11. Lexical sense layer

A dedicated **Lexical Sense** layer is REQUIRED before a lexical item is promoted to a canonical semantic concept when ambiguity exists.

Recommended fields:

```text
sense_id
lexeme_id
unit_id
source_span
sense_gloss
sense_definition
language
sense_inventory_source
contextual_evidence
confidence
review_status
```

Conceptual pipeline:

```text
SURFACE
→ LEMMA / LEXEME
→ CONTEXTUAL LEXICAL SENSE
→ FRAME ROLE
→ CONCEPT MAPPING
```

The engine MUST NOT conclude that Arabic, Hebrew, and Greek expressions represent the same universal concept merely because one English translation uses the same word.

This layer is the primary defense against false cross-language equivalence.

---

## 12. Discourse scope and utterances

Full-corpus scripture processing requires explicit discourse scope.

The engine SHOULD model:

```text
utterance_id
parent_utterance_id
speaker_participant_id
addressee_participant_ids
quoted_or_reported
source_span
speech_act
```

This is REQUIRED for passages containing:

- nested speech;
- reported speech;
- changes of speaker;
- divine quotation;
- human quotation;
- pronouns whose referent depends on speaker scope.

A participant role such as `SPEAKER` MUST be scoped to an utterance, not globally assumed for an entire passage.

---

## 13. Participants and coreference

Participant records SHOULD contain:

```text
participant_id
unit_id
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
PARTICIPANT ≠ CONCEPT
GRAMMATICAL SUBJECT ≠ SEMANTIC AGENT by default
SPEAKER ≠ AGENT by default
ADDRESSEE ≠ PATIENT by default
```

A contextual identity resolution MUST NOT overwrite the surface reference.

Example:

```json
{
  "surface_reference": "WE",
  "resolved_identity": null,
  "resolution_status": "UNRESOLVED"
}
```

Later contextual research may add an identity candidate with provenance.

---

## 14. Semantic roles

Semantic roles are scoped to individual frames.

Initial role registry MAY include:

```text
AGENT
PATIENT
THEME
EXPERIENCER
STIMULUS
HOLDER
TARGET
RECIPIENT
BENEFICIARY
SOURCE
GOAL
LOCATION
INSTRUMENT
STATE_BEARER
```

The registry MUST be extensible and versioned.

No role should be added merely to fit one verse if an existing general role is semantically adequate.

---

## 15. Semantic frames / propositions

Frames are the primary canonical semantic unit.

Initial frame classes:

```text
ACTION
STATE
RELATION
EVENT
ATTRIBUTE
```

Minimum frame record:

```text
frame_id
unit_id
utterance_id
frame_class
predicate_or_relation
roles
concept_refs
polarity
modality
speech_act
temporal_info
evidence
confidence
review_status
```

Examples:

```text
P1 ── RELATION ──▶ P2
```

```text
P2 ── HAS_STATE ──▶ CONCEPT
```

A frame MUST preserve enough structure to answer:

> who/what, does/is what, toward whom/what, under which scope, polarity, modality, and evidence?

---

## 16. Relation registry

Relations are not concepts.

Example:

```text
concept: AUTHORITY
relation: AUTHORITY_OVER
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

Relations MUST have stable IDs and definitions.

---

## 17. Canonical concept ontology

Canonical concept identifiers are language-neutral.

Examples:

```text
wsi:concept/authority
wsi:concept/transgression
```

Human labels are metadata:

```json
{
  "id": "wsi:concept/transgression",
  "pref_labels": {
    "en": "Transgression",
    "id": "Melampaui batas"
  },
  "display_key": "TRANSGRESSION"
}
```

Arabic/Hebrew/Greek lexical forms SHOULD normally be attached through lexical entries/senses and mappings rather than treated as universal concept labels by default.

A concept record SHOULD eventually contain:

```text
concept_id
preferred_labels
alternative_labels
definition
scope_note
examples
non_examples
broader
narrower
related
status
created_in_ontology_version
```

Normative rule:

```text
CONCEPT ID = IDENTITY
LABEL = PRESENTATION
```

---

## 18. Source-specific senses and universal concepts

To avoid premature universalization, WSI SHOULD support two semantic levels:

### Level A — source/context sense

A context-bound meaning supported by the passage and source language.

### Level B — WSI universal concept

A broader language-neutral concept used for indexing across corpora.

Mapping:

```text
SOURCE-SPECIFIC SENSE
  ↓ reviewed mapping
WSI UNIVERSAL CONCEPT
```

A source-specific sense MAY remain unmapped when no safe universal concept exists.

This is preferable to ontology distortion.

---

## 19. Polarity

Polarity applies to propositions/scopes, not concept identity.

Initial vocabulary:

```text
AFFIRMED
NEGATED
UNDETERMINED
```

Wrong:

```text
wsi:concept/no-authority
```

Correct:

```text
concept = wsi:concept/authority
polarity = NEGATED
```

Negation scope MUST be attached to the appropriate frame or sub-proposition.

---

## 20. Modality

Modality MUST be separated from speech act.

Initial epistemic/modal vocabulary MAY include:

```text
ASSERTED
POSSIBLE
PROBABLE
NECESSARY
HYPOTHETICAL
COUNTERFACTUAL
UNDETERMINED
```

`COMMAND`, `PROHIBITION`, and `QUESTION` MUST NOT be stored as ordinary epistemic modality values.

---

## 21. Speech act

Initial speech-act vocabulary MAY include:

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

This registry is expected to evolve from corpus evidence.

A speech act is not itself a semantic concept unless separately represented by a frame.

---

## 22. Logical and discourse relations

Frame-to-frame relations SHOULD be represented explicitly.

Candidate registry:

```text
CAUSE
RESULT
PURPOSE
CONDITION
CONTRAST
CONCESSION
SEQUENCE
ELABORATION
CORRECTION
RETRACTION
ALTERNATIVE
```

These are structural relations between propositions, not automatic semantic keys.

---

## 23. Temporal information

Temporal semantics SHOULD be represented independently from tense morphology.

Future fields MAY include:

```text
event_time
reference_time
aspect
temporal_relation
```

The engine MUST NOT assume that grammatical tense alone fully determines event time.

---

# PART IV — MEANING, TRANSLATION, TAFSIR, AND COMMENTARY

## 24. Translation layer

Translations are valuable research and presentation resources, but they are not the primary source when an original-language source edition is available.

A translation record SHOULD contain:

```text
translation_id
unit_id
language
edition
translator_or_publisher
text
license
source_uri
```

Translations MAY support lexical sense research, but:

```text
TRANSLATION ALONE
MUST NOT CREATE
DIRECT SOURCE EVIDENCE
```

Multiple translations SHOULD be allowed simultaneously.

---

## 25. Tafsir / commentary / exegesis layer

The generic machine term is **interpretation source**.

Subtypes MAY include:

```text
TAFSIR
COMMENTARY
EXEGESIS
LEXICON
GRAMMAR
SCHOLARLY_NOTE
TRADITIONAL_NOTE
```

Recommended record:

```text
interpretation_id
source_type
author_or_tradition
work
citation
language
text_or_summary
target_unit_ids
target_frame_ids
target_concept_ids
provenance
```

An interpretation may explain, support, challenge, or offer an alternative to a semantic assertion.

It MUST NOT overwrite primary source evidence.

---

## 26. Evidence source class vs derivation type

These two dimensions MUST be kept separate.

### Evidence source class

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

Example:

```text
source_class = PRIMARY_TEXT
derivation_type = COMPOSITIONAL
```

or:

```text
source_class = COMMENTARY
derivation_type = INTERPRETIVE
```

This prevents “direct vs tafsir” from becoming one overloaded field.

---

# PART V — SOURCE DIRECTION

## 27. Source direction definition

`SOURCE_DIRECTION` is the evaluative orientation of a frame/assertion as supported by source context.

Initial values:

```text
POSITIVE
NEGATIVE
NEUTRAL
MIXED
UNDETERMINED
```

Rules:

```text
POLARITY ≠ SOURCE_DIRECTION
MODALITY ≠ SOURCE_DIRECTION
SPEECH_ACT ≠ SOURCE_DIRECTION
```

A negated negative action is not automatically a negative direction.

A command is not automatically positive.

A frame direction SHOULD be preferred over a unit-level summary.

---

## 28. Unit-level direction

A verse/ayah/passage-level direction is optional derived metadata.

```text
unit_direction = optional
```

It may summarize locked frame directions only when a fair summary is possible.

If directions conflict:

```text
MIXED
```

If evidence is insufficient:

```text
UNDETERMINED
```

The engine MUST NOT force every passage into a binary positive/negative label.

---

# PART VI — PROVENANCE, CONFIDENCE, AND REVIEW

## 29. Provenance

Every canonical assertion MUST be traceable.

Minimum provenance:

```text
corpus_id
edition_id
unit_id
text_view_id
evidence_spans_or_tokens
evidence_source_class
derivation_type
researcher_or_extractor
framework_version
schema_version
ontology_version
extractor_version
review_status
created_at
```

For AI-generated candidates, additionally record where available:

```text
model_family
provider
prompt_or_policy_version
generation_id
```

The system SHOULD be exportable to PROV-O semantics later.

---

## 30. Confidence model

Confidence is operational research confidence, never theological truth percentage.

Confidence MUST be decomposable.

Baseline components MAY include:

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

No universal weighting is permanently fixed in this blueprint.

Instead each score MUST reference:

```text
confidence_policy_id
confidence_policy_version
component_scores
aggregate_score
```

A baseline policy may be introduced experimentally, but it MUST be calibrated against reviewed golden data before being treated as stable.

---

## 31. Review states

Recommended assertion-level lifecycle:

```text
CANDIDATE
RESEARCHED
REVIEWED
LOCKED
DISPUTED
DEPRECATED
```

Locking MUST occur at assertion/frame granularity where practical.

A source unit may therefore contain both locked and unresolved assertions.

AI/model output begins as `CANDIDATE` unless produced by a deterministic transformation whose inputs are already locked.

---

## 32. Disagreement model

The architecture MUST support multiple interpretations without corrupting source data.

Required principle:

```text
ONE IMMUTABLE SOURCE
→ MULTIPLE COMPETING ASSERTIONS ALLOWED
→ DISTINCT PROVENANCE
→ DISTINCT CONFIDENCE
→ DISTINCT REVIEW STATUS
```

The engine SHOULD avoid destructive “winner replaces loser” semantics for contested interpretations.

---

## 33. Base semantics lock

Witness production MUST consume reviewed/locked semantics rather than raw source text whenever possible.

Production rule:

```text
LOCKED FRAME(S)
→ WITNESS PIPELINE
```

Research preview MAY consume `REVIEWED` frames but MUST clearly mark downstream output as provisional.

This barrier prevents positive-direction logic from contaminating source extraction.

---

# PART VII — WITNESS CONTRACT

## 34. Witness Pattern vs Witness Label

A major distinction is REQUIRED:

### Witness Pattern

A machine-stable pattern identity.

Example:

```text
wsi:witness-pattern/boundary-violation
```

### Witness Label

A human-facing metaphor/analogy/phrase associated with a pattern.

Example:

```text
OFFSIDE
```

Therefore:

```text
OFFSIDE ≠ CANONICAL CONCEPT
OFFSIDE ≠ SOURCE TRANSLATION
OFFSIDE ≠ UNIVERSAL WITNESS ID
```

A Witness Pattern may have multiple localized labels depending on culture, language, or audience.

Recommended Witness Pattern fields:

```text
witness_pattern_id
definition
observed_frame_ids
mapped_concepts
pattern_conditions
counterexamples
status
provenance
review_status
```

Recommended label fields:

```text
label
language
locale
domain
witness_type
fit_score
notes
```

Witness types MAY include:

```text
METAPHOR
ANALOGY
PATTERN
OBSERVATION
```

---

## 35. Witness derivation

Witness answers:

> **What recognizable pattern is exhibited by the locked semantic condition?**

Witness MUST NOT answer:

> “What wording do we wish the verse had?”

A valid Witness derivation requires:

```text
observed locked frame(s)
pattern match
explicit derivation record
fit confidence
non-contradiction review
```

The system MUST allow:

```text
WITNESS = UNRESOLVED
```

---

## 36. Response and correction

`CORRECTION` is appropriate when the Witness exposes a misalignment requiring repair.

However, not every source state requires correction.

The broader machine field SHOULD be:

```text
response
```

with response types such as:

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

For a negative witnessed condition:

```text
TRANSGRESSION
→ BOUNDARY_VIOLATION pattern
→ OFFSIDE label
→ RETURN / ALIGN response
```

A response is a derived layer and MUST NOT be represented as source wording unless explicitly present in a separate source frame.

---

## 37. Positive direction

Positive direction is the desired target state after an appropriate Witness response.

Recommended record:

```text
positive_direction_id
target_concept_ids
target_state
target_orientation = POSITIVE
derivation_basis
source_witness_pattern_id
source_frame_ids
confidence
review_status
```

Rule:

```text
POSITIVE_DIRECTION ≠ SOURCE_DIRECTION
```

Possible situations:

### Negative source condition

```text
NEGATIVE SOURCE
→ WITNESS
→ CORRECTION
→ POSITIVE TARGET
```

### Positive source condition

```text
POSITIVE SOURCE
→ WITNESS
→ MAINTAIN / CULTIVATE
→ POSITIVE TARGET
```

### Neutral or unresolved source condition

```text
NEUTRAL / UNDETERMINED
→ WITNESS MAY EXIST
→ POSITIVE DIRECTION MAY REMAIN UNRESOLVED
```

The system MUST NOT invent a positive prescription solely to satisfy UI expectations.

---

## 38. “GULA” terminology

`GULA` MAY remain a project-internal or conversational shorthand for the positive-response layer.

Canonical machine fields SHOULD use explicit names:

```text
witness
response
correction (when applicable)
positive_direction
```

This keeps the data contract understandable outside the original research conversation.

---

# PART VIII — CROSS-CORPUS SEMANTIC ALIGNMENT

## 39. Alignment is post-extraction

Cross-corpus alignment MUST only compare independently extracted and reviewed semantic objects.

Targets may include:

```text
concept ↔ concept
frame ↔ frame
relation ↔ relation
witness pattern ↔ witness pattern
positive direction ↔ positive direction
```

Raw verse-to-verse “equivalence” SHOULD NOT be the primitive mapping.

---

## 40. Mapping relations

Alignment SHOULD use conservative, explicit mapping relations inspired by semantic-web practice.

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

`EXACT_MATCH` MUST have the highest review threshold and SHOULD be rare across independently evolved languages/traditions.

Each mapping MUST contain:

```text
mapping_id
subject_semantic_id
object_semantic_id
mapping_type
scope
basis
confidence
provenance
review_status
```

A mapping MUST NOT imply theological identity beyond its explicitly declared semantic scope.

---

## 41. Corpus-specific adapters

The core semantic contract is corpus-neutral.

Each corpus family SHOULD have an adapter responsible for source-specific concerns.

### Qur'an adapter

Expected concerns:

```text
surah/ayah reference
Arabic orthography
Qur'anic tokenization
Arabic morphology
root/lemma analysis
speaker/discourse context
edition/reading profile when applicable
```

### Torah adapter

Expected concerns:

```text
book/chapter/verse reference
Biblical Hebrew source editions
textual tradition
Hebrew morphology
reference/versification profile
```

### Psalms adapter

Expected concerns:

```text
Psalm numbering/reference profile
Hebrew poetic structure
parallelism
textual tradition
possible alternate numbering mappings
```

### Gospels adapter

Expected concerns:

```text
individual Gospel work identity
Greek source edition where selected
Koine Greek morphology
quotation/speaker structure
canon/reference profile
```

Adapters may add source-specific metadata but MUST emit the same canonical semantic frame contract.

---

# PART IX — WORKED EXAMPLE POLICY

## 42. As-Saffat 37:30 is a test fixture, not the framework

As-Saffat 37:30 remains useful as an early golden candidate.

It MUST be described as:

```text
NON-NORMATIVE WORKED EXAMPLE
```

It is not evidence that every passage has:

- exactly two concepts;
- exactly two participants;
- one negative direction;
- one Witness;
- one correction;
- one positive direction.

Illustrative structure:

```text
P1 = WE / SPEAKER
P2 = YOU / ADDRESSEE / GROUP

F1:
P1 ── AUTHORITY_OVER [NEGATED] ──▶ P2

DISCOURSE:
F1 ── RETRACTION/CORRECTION ──▶ F2

F2:
P2 ── HAS_STATE ──▶ [TRANSGRESSION]

F2 SOURCE_DIRECTION = NEGATIVE
```

Illustrative Witness chain:

```text
locked TRANSGRESSION state
→ witness pattern: BOUNDARY_VIOLATION
→ localized label: OFFSIDE
→ response: RETURN / ALIGN
→ positive target: BOUNDARY_ALIGNMENT
```

The exact concept mapping and scores remain subject to golden-record review.

Important: `BOUNDARY_ALIGNMENT` is a derived target concept/state, not a lexical claim that the source explicitly contains the word “boundary.”

---

# PART X — MACHINE CONTRACT

## 43. Canonical document structure

The first implementation contract is JSON validated by JSON Schema.

Conceptual top-level record:

```json
{
  "document_id": "...",
  "spec_version": "...",
  "schema_version": "...",
  "corpus": {},
  "edition": {},
  "source_unit": {},
  "text_views": [],
  "tokens": [],
  "lexical_analyses": [],
  "lexical_senses": [],
  "utterances": [],
  "participants": [],
  "frames": [],
  "discourse_relations": [],
  "concept_mappings": [],
  "source_directions": [],
  "translations": [],
  "interpretation_refs": [],
  "witnesses": [],
  "responses": [],
  "positive_directions": [],
  "provenance": [],
  "reviews": []
}
```

The schema MUST enforce separation structurally rather than relying on prompt discipline.

---

## 44. Stable identifiers

Recommended namespaces:

```text
wsi:corpus/<slug>
wsi:edition/<corpus>/<edition>
wsi:unit/<corpus>/<edition>/<reference>
wsi:token/<unit>/<local-id>
wsi:lexeme/<language>/<id>
wsi:sense/<id>
wsi:participant/<unit>/<local-id>
wsi:utterance/<unit>/<local-id>
wsi:frame/<unit>/<local-id>
wsi:concept/<slug>
wsi:relation/<slug>
wsi:witness-pattern/<slug>
wsi:positive-direction/<id>
wsi:mapping/<id>
```

Stable IDs MUST survive label changes.

Human-readable display strings MUST NOT be the sole identity mechanism.

---

## 45. Controlled registries

The project SHOULD maintain explicit versioned registries for:

```text
corpus_families
reference_systems
text_view_types
entity_types
discourse_roles
semantic_roles
frame_classes
relations
polarity
modalities
speech_acts
discourse_relations
directions
evidence_source_classes
derivation_types
review_statuses
witness_types
response_types
mapping_types
```

Any new controlled value SHOULD require:

1. definition;
2. motivation;
3. examples;
4. non-examples;
5. overlap analysis;
6. migration consideration;
7. spec/ontology version impact.

---

## 46. Validation invariants

The first validator MUST eventually enforce at least:

```text
I01 SOURCE_EDITION_REQUIRED
I02 SOURCE_IS_IMMUTABLE
I03 NORMALIZATION_IS_A_DERIVED_VIEW
I04 REFERENCE_SYSTEM_REQUIRED
I05 SEMANTIC_ASSERTION_REQUIRES_EVIDENCE
I06 TOKEN_IS_NOT_CONCEPT
I07 LEMMA_IS_NOT_CONCEPT
I08 LEXEME_IS_NOT_LEXICAL_SENSE
I09 AMBIGUOUS_LEXEME_REQUIRES_SENSE_RESOLUTION
I10 PARTICIPANT_IS_NOT_CONCEPT
I11 DISCOURSE_ROLE_IS_NOT_SEMANTIC_ROLE
I12 RELATION_IS_NOT_CONCEPT
I13 POLARITY_IS_NOT_DIRECTION
I14 MODALITY_IS_NOT_SPEECH_ACT
I15 SPEECH_ACT_IS_NOT_DIRECTION
I16 TRANSLATION_CANNOT_CREATE_DIRECT_SOURCE_EVIDENCE_ALONE
I17 COMMENTARY_CANNOT_OVERWRITE_PRIMARY_SOURCE
I18 CONTEXT_CANNOT_OVERWRITE_SURFACE_REFERENCE
I19 STABLE_CONCEPT_ID_REQUIRED
I20 UNIVERSAL_CONCEPT_MAPPING_MAY_BE_UNRESOLVED
I21 CONFIDENCE_POLICY_MUST_BE_VERSIONED
I22 WITNESS_IS_NOT_CANONICAL_CONCEPT
I23 WITNESS_LABEL_IS_NOT_WITNESS_PATTERN_ID
I24 RESPONSE_IS_NOT_SOURCE_ASSERTION
I25 POSITIVE_DIRECTION_IS_NOT_SOURCE_DIRECTION
I26 MASTER_CONCEPT_IS_OPTIONAL
I27 UNIT_DIRECTION_IS_DERIVED_AND_OPTIONAL
I28 UNRESOLVED_IS_VALID
I29 VERSIONED_PROVENANCE_REQUIRED
I30 LOCK_REQUIRED_BEFORE_PRODUCTION_WITNESS
I31 CROSS_CORPUS_MAPPING_REQUIRES_INDEPENDENT_SOURCE_ASSERTIONS
I32 CROSS_CORPUS_MAPPING_MUST_DECLARE_SCOPE
I33 EDITION_LICENSE_METADATA_REQUIRED
I34 TOKEN_ID_STABILITY_IS_TOKENIZER_VERSION_SCOPED
```

---

## 47. Master concept policy

A “Master Key” is a presentation convenience, not fundamental semantic data.

```text
master_concept_id = optional
```

If there is no clearly dominant concept:

```text
null
```

No passage should receive a forced master concept merely for display symmetry.

---

## 48. JSON Schema and semantic-web strategy

Initial canonical exchange:

```text
JSON
+ JSON Schema 2020-12
```

Later exports MAY include:

```text
JSON-LD
RDF
SKOS concept schemes
OntoLex lexical grounding
PROV-O provenance
SHACL validation
```

RDF/JSON-LD is an export/interoperability representation, not permission to collapse the internal semantic distinctions.

---

# PART XI — FULL-CORPUS RESEARCH OPERATIONS

## 49. Corpus processing lanes

The system SHOULD distinguish two lanes.

### Candidate lane

High-throughput extraction that may use deterministic tools and AI candidate generation.

```text
source
→ linguistic candidates
→ sense candidates
→ participant candidates
→ frame candidates
→ concept candidates
```

### Research lock lane

Higher-assurance review:

```text
candidate
→ evidence review
→ conflict resolution
→ reviewed assertion
→ lock
```

Witness production is downstream from the lock lane.

---

## 50. Full-Qur'an coverage metrics

The project MUST distinguish ingestion coverage from semantic quality.

Recommended metrics:

```text
source_ingestion_coverage
linguistic_analysis_coverage
frame_candidate_coverage
reviewed_frame_coverage
locked_frame_coverage
concept_mapping_coverage
witness_coverage
positive_direction_coverage
unresolved_rate
disputed_rate
```

A corpus is not “semantically complete” merely because every ayah has a JSON file.

---

## 51. Golden corpus strategy

The golden corpus MUST be stratified across linguistic and semantic phenomena, not chosen only from easy examples.

Qur'an golden set categories SHOULD include:

```text
dialogue
reported speech
nested speaker scopes
negation
imperative/prohibition
question
oath
condition
causal structure
pronoun resolution
ellipsis
multiple participants
polysemy
temporal relations
positive direction
negative direction
mixed direction
unresolved direction
repeated lexical item with different senses
```

As-Saffat 37:30 is one candidate among many.

A holdout set SHOULD be preserved to detect overfitting of schema and extraction rules to early examples.

---

## 52. Regression testing

Tests SHOULD include:

```text
schema tests
registry tests
invariant tests
golden semantic tests
sense-resolution tests
coreference tests
discourse-scope tests
ontology mapping tests
cross-corpus mapping tests
migration tests
release tests
```

A model/extractor upgrade MUST NOT silently rewrite locked golden data.

Changes require explicit diff, review, and provenance.

---

# PART XII — IMPLEMENTATION ARCHITECTURE

## 53. Language strategy

The semantic contract is implementation-independent.

### Phase 1 — Python

Preferred for:

- Arabic NLP research;
- future Hebrew/Greek NLP integrations;
- corpus ingestion research;
- ontology iteration;
- JSON Schema validation;
- RDF/JSON-LD experiments;
- golden dataset tooling;
- evaluation and analysis.

### Phase 2 — Rust, optional

Use only after contracts stabilize, for demonstrated needs such as:

- deterministic typed core;
- fast CLI/batch processing;
- high-throughput validators;
- embeddable library;
- stronger runtime guarantees.

Rust MUST consume the same canonical machine contract.

### Application layer — TypeScript/JavaScript

Recommended later for:

- API gateway;
- semantic explorer;
- review UI;
- graph visualization;
- annotation workflows.

### Go

Viable for infrastructure/services, but not currently preferred for the research core.

---

## 54. Planned module boundaries

Future implementation SHOULD preserve at least:

```text
corpus/
editions/
references/
source/
text_views/
linguistics/
lexicon/
senses/
discourse/
participants/
coreference/
frames/
relations/
ontology/
polarity/
modality/
speech_act/
direction/
translations/
interpretations/
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

Corpus-specific adapters SHOULD live behind shared interfaces, for example:

```text
adapters/quran/
adapters/torah/
adapters/psalms/
adapters/gospels/
```

---

## 55. No-LLM lock-in

LLMs MAY generate candidates but MUST NOT define the canonical contract.

Model-produced assertions MUST preserve:

```text
candidate status
model metadata when available
prompt/policy version
supporting evidence
human/deterministic validation status
```

No model provider may become a semantic dependency of stored canonical data.

---

## 56. Deterministic validation boundary

Even if semantic extraction uses AI, the following SHOULD be deterministic:

```text
schema validation
ID validation
registry validation
reference integrity
provenance requirements
state-transition rules
lock rules
cross-corpus mapping constraints
release artifact validation
```

AI may suggest; deterministic rules decide structural validity.

---

# PART XIII — VERSIONING AND MIGRATION

## 57. Version domains

The project requires separate version domains:

```text
repository_version
blueprint/spec_version
schema_version
ontology_version
registry_version
corpus_adapter_version
source_edition_version
extractor_version
confidence_policy_version
witness_policy_version
```

These MUST NOT be conflated.

Example:

A documentation-only repository release may change `repository_version` without changing ontology data.

A concept split may require an `ontology_version` change and migration.

A new tokenizer may change `corpus_adapter_version` or extractor version without changing the source edition.

---

## 58. Migration policy

Breaking schema or ontology changes MUST provide:

```text
change rationale
old representation
new representation
migration path
affected IDs
data compatibility note
golden-corpus impact
```

Stable semantic IDs SHOULD be preserved when meaning has not changed.

If meaning changes materially, create a new concept/relation ID and deprecate the old identity rather than silently redefining it.

---

# PART XIV — REPOSITORY GOVERNANCE

## 59. Branch model

Only two long-lived working branches:

```text
dev
main
```

### dev

Active research and development.

### main

Stable integration/release branch.

Promotion:

```text
dev → PR → main
```

No standard long-lived `feature/*`, `release/*`, or `hotfix/*` branch model.

---

## 60. Commit and release policy

Conventional Commits govern release impact.

Recommended scopes now include:

```text
spec
schema
registry
ontology
corpus
edition
reference
source
linguistics
sense
discourse
frame
witness
direction
alignment
provenance
validation
repo
release
```

Repository SemVer is independent from semantic data version domains.

---

# PART XV — ROADMAP

## 61. Milestone 0 — Repository foundation

Status target:

```text
README
BLUEPRINT
branch governance
release automation
version/changelog automation
```

No semantic engine required.

---

## 62. Milestone 1 — Machine contract

Deliver:

```text
JSON Schema
ID grammar
registry schemas
corpus profile schema
edition schema
source-unit schema
frame schema
concept schema
provenance schema
review state machine
```

Exit criterion:

Diverse Qur'anic examples can be represented without ad-hoc fields.

---

## 63. Milestone 2 — Qur'an source adapter and golden corpus

Deliver:

```text
versioned Qur'an edition profile
reference system
raw source ingestion
text views
token anchors
initial Arabic linguistic integration
golden records across diverse phenomena
```

Exit criterion:

The system reliably distinguishes source, linguistic evidence, sense, frame, concept, and Witness layers.

---

## 64. Milestone 3 — Full Qur'an candidate extraction

Process the full corpus through the candidate lane.

Outputs may remain partially unresolved.

Goal:

```text
100% source ingestion
broad candidate semantic coverage
explicit unresolved/disputed tracking
```

Do not claim full semantic completion.

---

## 65. Milestone 4 — Qur'an review and lock program

Progressively move high-confidence assertions:

```text
CANDIDATE
→ RESEARCHED
→ REVIEWED
→ LOCKED
```

Prioritize representative semantic phenomena and high-reuse concepts.

---

## 66. Milestone 5 — Witness and positive-direction engine

Consume locked Qur'anic semantics.

Deliver:

```text
Witness Pattern registry
localized Witness labels
Witness confidence/review
response/correction model
positive-direction model
```

Witness generation MUST remain downstream of source-semantic review.

---

## 67. Milestone 6 — Multi-corpus protocol validation

Before full ingestion of other corpora, test the generic architecture on carefully selected samples from:

```text
Torah-associated corpus
Psalms-associated corpus
Gospel-associated corpus
```

Validate:

- edition identity;
- reference systems;
- Hebrew/Greek lexical-sense handling;
- discourse structures;
- concept mappings;
- absence of Qur'an-specific schema assumptions.

---

## 68. Milestone 7 — Additional corpus ingestion

Only after explicit edition/licensing decisions:

```text
Torah adapter
Psalms adapter
Gospels adapter
```

Each corpus receives independent golden data and review.

---

## 69. Milestone 8 — Cross-corpus semantic alignment

Build reviewed mappings only after independent semantics exist.

Capabilities:

```text
concept alignment
frame-pattern alignment
relation alignment
Witness-pattern comparison
positive-direction comparison
semantic search across corpora
```

The alignment engine MUST expose mapping type, scope, confidence, and provenance.

---

## 70. Milestone 9 — Semantic-web exports and typed core

Evaluate:

```text
JSON-LD
RDF
SKOS
OntoLex
PROV-O
SHACL
Rust typed core
TypeScript semantic explorer
```

Adopt only where demonstrated value exceeds complexity.

---

# PART XVI — RESEARCH ETHICS AND INTERPRETIVE SAFETY

## 71. No hidden theological collapse

The engine MUST distinguish:

```text
textual observation
linguistic analysis
semantic assertion
interpretation
cross-corpus alignment
theological claim
```

WSI semantic mappings are not automatically theological claims.

If future researchers wish to store theological positions, those MUST be represented as explicitly sourced interpretation assertions, never hidden in the universal ontology.

---

## 72. No privileged translation ontology

English MUST NOT become the hidden master meaning layer.

Required architecture:

```text
SOURCE LANGUAGE
→ CONTEXTUAL SENSE
→ SEMANTIC FRAME
→ UNIVERSAL CONCEPT MAPPING
→ multilingual labels
```

Not:

```text
SOURCE LANGUAGE
→ English translation
→ ontology
```

---

## 73. No forced symmetry across corpora

The system MUST allow:

```text
concept exists in corpus A
no safe equivalent in corpus B
```

and:

```text
frame pattern exists in corpus B
no reviewed alignment in corpus A
```

Absence of a mapping is valid data.

---

## 74. No forced positive direction

Witness is intended to enable constructive direction, but research integrity takes precedence.

Valid outcome:

```text
WITNESS = REVIEWED
RESPONSE = UNRESOLVED
POSITIVE_DIRECTION = UNRESOLVED
```

A positive direction is valuable only if its derivation is explicit and defensible.

---

# PART XVII — STANDARDS BASELINE

## 75. Standards and external models

WSI does not need to copy external standards, but SHOULD remain interoperable with mature ideas from them.

### SKOS

Use as guidance for:

```text
concept identity
preferred/alternative labels
broader/narrower/related relations
mapping relations
```

Reference:

`https://www.w3.org/TR/skos-reference/`

### OntoLex-Lemon

Use as guidance for separating:

```text
lexical entry
form
lexical sense
lexical concept
ontology grounding
```

Reference:

`https://www.w3.org/2016/05/ontolex/`

### RDF

Use as future graph interoperability model.

Reference:

`https://www.w3.org/TR/rdf-concepts/`

### PROV-O

Use as future provenance interoperability model.

Reference:

`https://www.w3.org/TR/prov-o/`

### SHACL

Use as future RDF graph validation model.

Reference:

`https://www.w3.org/TR/shacl/`

### OSIS / USFM

Use as external reference/encoding inspirations for Bible-family corpora, especially work identity and scripture reference mappings.

References:

`https://www.crosswire.org/osis/`

`https://ubsicap.github.io/usfm/`

### Qur'anic Arabic Corpus

Use as an important reference for Qur'anic morphology, syntax/treebank concepts, and existing semantic-ontology practice. WSI remains independently versioned and MUST preserve its own provenance.

Reference:

`https://corpus.quran.com/documentation/`

---

# PART XVIII — DECISIONS LOCKED FOR THE NEXT PHASE

## 76. Architectural decisions

The following are considered baseline decisions for the next specification milestone:

1. WSI is spec-first and machine-readable.
2. The full Qur'an is the first corpus target.
3. As-Saffat 37:30 is a non-normative example only.
4. Torah-, Psalms-, and Gospel-associated corpora are planned future corpus families.
5. Every source assertion is edition- and reference-system-specific.
6. Raw source is immutable; normalization creates views.
7. Source unit is generic; the engine does not hardcode “verse” as the universal structure.
8. Token identity is scoped by source edition, text view, and tokenizer version.
9. Lexical Sense is a distinct layer between lexeme and concept.
10. Semantic frames/propositions are primary; semantic keys are concept displays.
11. Discourse/utterance scope is required for reliable speaker and quotation analysis.
12. Participant, discourse role, semantic role, relation, concept, polarity, modality, speech act, and direction are distinct.
13. Translation and tafsir/commentary are secondary interpretation/evidence layers.
14. Evidence source class and derivation type are separate dimensions.
15. Concept identity is language-neutral.
16. English is a technical label, not semantic identity.
17. Universal concept mapping may remain unresolved.
18. Source direction is distinct from polarity and from positive direction.
19. Witness Pattern is distinct from localized Witness Label.
20. Witness is derived from reviewed/locked semantic frames.
21. Response/correction is derived and does not rewrite source meaning.
22. Positive direction may remain unresolved.
23. Cross-corpus semantic alignment occurs only after independent extraction.
24. Cross-corpus alignment does not imply theological identity.
25. Confidence is operational, decomposable, and policy-versioned.
26. Competing interpretations may coexist with separate provenance.
27. JSON + JSON Schema is the initial machine contract.
28. Semantic-web standards are interoperability targets, not the internal research method itself.
29. Python is the first research implementation language.
30. Rust remains optional after contract stabilization.
31. TypeScript/JavaScript is preferred for future application/review UI layers.
32. Only `dev` and `main` are long-lived repository branches.

Any future change to these decisions MUST be explicit and versioned.

---

# PART XIX — FINAL INVARIANTS

## 77. The discipline of WSI

The system MUST remember:

```text
DO NOT STORE AN EDITION AS IF IT WERE AN ABSTRACT REVELATION.
DO NOT STORE A TRANSLATION AS IF IT WERE PRIMARY SOURCE.
DO NOT STORE A LEMMA AS IF IT WERE A SENSE.
DO NOT STORE A SENSE AS IF IT WERE AUTOMATICALLY A UNIVERSAL CONCEPT.
DO NOT STORE A PARTICIPANT AS A CONCEPT.
DO NOT STORE A RELATION AS A CONCEPT.
DO NOT STORE NEGATION AS A CONCEPT.
DO NOT STORE A SPEECH ACT AS DIRECTION.
DO NOT STORE COMMENTARY AS SOURCE ASSERTION.
DO NOT STORE WITNESS AS TRANSLATION.
DO NOT STORE A LOCAL WITNESS LABEL AS A UNIVERSAL ONTOLOGY ID.
DO NOT STORE POSITIVE DIRECTION AS SOURCE MEANING.
DO NOT STORE CROSS-CORPUS SIMILARITY AS THEOLOGICAL EQUIVALENCE.
DO NOT FORCE AN ANSWER WHERE EVIDENCE IS UNRESOLVED.
```

Instead:

```text
IDENTIFY THE CORPUS
→ IDENTIFY THE EDITION
→ PRESERVE THE SOURCE
→ ANALYZE THE LANGUAGE
→ RESOLVE THE SENSE
→ RESOLVE THE DISCOURSE SCOPE
→ IDENTIFY PARTICIPANTS
→ BUILD FRAMES
→ MAP CONCEPTS CONSERVATIVELY
→ RECORD POLARITY / MODALITY / SPEECH ACT
→ EVALUATE SOURCE DIRECTION
→ ATTACH EVIDENCE + PROVENANCE
→ REVIEW
→ LOCK
→ WITNESS THE PATTERN
→ CHOOSE A HUMAN LABEL
→ DERIVE A RESPONSE
→ MOVE TOWARD A DEFENSIBLE POSITIVE DIRECTION
```

That sequence is the architectural identity of **Witness Semantic Engine**.
