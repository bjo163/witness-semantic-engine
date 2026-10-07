# WSI Source Provider Contract

**Contract revision:** `0.2-draft`  
**WSI Machine Contract:** `0.2.0`

This document defines the boundary between Witness Semantic Engine (WSI) and any external source system.

WSI is a downstream analysis engine. It does not own canonical source text.

---

## 1. Provider responsibilities

A Source Provider MUST own and resolve its own source/resource identities.

At minimum, a provider integration MUST be able to resolve:

```text
resource ID
resource type/kind
content or content linkage
provider revision/release
source provenance
source integrity information where available
language/script where available
resource relationships required to interpret scope
```

A provider MAY expose much more.

The first supported provider is:

```text
provider: rocksoul-rgbl
namespace: mw
repository: bjo163/rocksoul-rgbl
```

---

## 2. Provider independence

WSI schema MUST NOT require RGBL-specific field names inside semantic Frames.

Provider-specific resolution occurs at the Source Binding boundary.

The logical runtime provider interface is transport-neutral. Conceptually it supports:

```text
verifyRevision(revision)
currentRevision()
resolveResource(revision, resourceId, hints?)
```

An implementation MAY use a repository checkout, SDK, API, local database, or another transport without redefining WSI semantic objects.

This permits another provider to satisfy the same contract later without redefining the semantic core.

---

## 3. Source Binding

A Source Binding pins external resources to a reproducible provider snapshot.

Required conceptual fields:

```text
id
provider
provider_contract
provider_revision
primary_resource_id
resource_ids[]
resolution_status
```

### Example

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

The provider revision SHOULD be an immutable release identifier or commit SHA.

`main`, `latest`, or another moving ref MUST NOT be sufficient for reproducible reviewed analysis.

A provider's current HEAD MAY advance without invalidating a previously reviewed analysis. The pinned revision remains authoritative for reproducibility as long as it can still be resolved.

---

## 4. Analysis Target

Each WSI analysis record identifies one primary target:

```json
{
  "source_binding_id": "S1",
  "resource_id": "mw:passage:quran:37:30"
}
```

The target MAY represent:

```text
passage
fragment
paragraph
section
content object
manuscript segment
commentary segment
other addressable provider resource
```

WSI does not impose `verse` or `ayah` as universal structure.

---

## 5. Evidence resource resolution

Every source-grounded WSI assertion MUST reference:

```text
source_binding_id
resource_id
```

The referenced `resource_id` MUST occur in the Source Binding or be resolvable under the same pinned provider snapshot according to provider rules.

A validator SHOULD reject stale or unresolved references.

---

## 6. Selectors

WSI selectors identify the subpart of an external resource used as evidence.

Initial types:

### RESOURCE_ONLY

The entire resource is relevant.

```json
{
  "type": "RESOURCE_ONLY"
}
```

### TEXT_QUOTE

An exact textual anchor.

```json
{
  "type": "TEXT_QUOTE",
  "exact": "سُلْطَـٰنٍۭ"
}
```

For primary-source live proof, `exact` MUST match the pinned provider representation literally.

The verifier MUST NOT silently normalize, stem, transliterate, translate, or fuzzy-match a non-identical string and then claim verbatim source proof.

Analytic forms such as normalized surface strings, lemmas, and roots belong in WSI analysis fields and MAY differ from the provider's exact orthography.

The quote is an anchor only. It is not source authority.

### CHAR_RANGE

Character offsets in a declared provider representation.

```json
{
  "type": "CHAR_RANGE",
  "start": 10,
  "end": 18
}
```

Provider representation identity MUST be known before offsets are considered stable.

When `exact` is supplied with a character range, the provider slice MUST equal it.

### TOKEN_IDS

Provider/tool-specific token identifiers.

```json
{
  "type": "TOKEN_IDS",
  "token_ids": ["..."]
}
```

Token IDs MUST NOT be treated as portable across incompatible tokenizers.

The first RGBL repository connector does not claim live TOKEN_IDS verification because RGBL source resources do not yet expose one universal tokenizer-stable index for this purpose.

---

## 7. Canonical source text rule

WSI MUST NOT store a source copy and then claim that copy is authoritative.

Allowed:

```text
small quote for evidence anchor
cached display value clearly marked non-authoritative
resolved provider metadata cache
```

Not allowed:

```text
WSI-owned canonical scripture text
WSI-owned duplicate edition identity
WSI-owned duplicate passage identity
```

If cached/quoted text differs from the pinned provider, the provider wins and the WSI object requires revalidation.

---

## 8. Source provenance vs analysis provenance

These are separate.

### Provider provenance

Explains where the text/resource came from.

Examples:

```text
acquisition source
artifact hash
publisher/source
license
normalization method
source ingestion recipe
```

### WSI provenance

Explains how semantic analysis was produced.

Examples:

```text
framework version
contract version
ontology version
analyzer/model version
policy version
reviewer
created_at
```

WSI MUST reference provider provenance when needed but MUST NOT silently duplicate or overwrite it.

---

## 9. RGBL interoperability baseline

RGBL supplies generic corpus/source objects including:

```text
ENTITY
RESOURCE
ASSERTION
EVIDENCE
PROVENANCE
ASSESSMENT
```

Its textual profile supplies objects including:

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

WSI SHOULD consume RGBL canonical IDs directly.

For the Tanzil Uthmani Qur'an dataset, relevant IDs follow patterns such as:

```text
mw:work:quran
mw:expression:quran:ar-uthmani-tanzil-1.1
mw:edition:quran:tanzil-1.1-uthmani
mw:artifact:quran:tanzil-1.1-uthmani
mw:passage:quran:37:30
mw:content:quran:37:30:ar-uthmani
```

These IDs remain owned by RGBL.

The first WSI reference transport is `RgblRepositoryProvider`, documented in `spec/RGBL-CONNECTOR.md`. It resolves RGBL records directly from the exact Git revision named by the Source Binding.

---

## 10. Resolution states

Initial values:

```text
RESOLVED
UNRESOLVED
STALE
INACCESSIBLE
```

A reviewed/locked WSI assertion SHOULD NOT depend on an unresolved source binding.

When a binding claims `RESOLVED` but live proof fails for its pinned revision, resources, or required selectors, the runtime verifier reports a stale-binding finding. It MUST NOT silently rewrite the record.

---

## 11. Validation requirements

Offline deterministic validation SHOULD check:

```text
provider identifier known
provider revision structurally pinned
primary resource included in binding
all local binding/resource references are internally coherent
selector shapes are valid
```

Live Source Provider verification SHOULD additionally prove:

```text
provider revision exists
required resource IDs exist at the pinned revision
analysis target resolves
TEXT_QUOTE matches pinned provider content literally
CHAR_RANGE resolves against pinned provider content
claimed RESOLVED binding remains valid
```

Provider-specific validation is downstream integration logic; it MUST NOT redefine WSI semantic ontology.

---

## 12. Cross-resource acceptance

The provider abstraction MUST be tested against more than one scripture/corpus family before it is treated as universal enough for further engine development.

M3 currently verifies the same RGBL connector against:

```text
Qur'an 37:30
Bhagavad Gita 1:1
```

This is a software interoperability test only. It does not assert theological equivalence among sources.

---

## 13. Future provider compatibility

A new provider may be accepted when it can implement the same logical interface.

The semantic core MUST NOT need new corpus-specific branches merely because another textual tradition or content store is introduced.

The principle is:

```text
SOURCE PROVIDER
→ STABLE RESOURCE REFERENCES
→ WSI SOURCE BINDING
→ ONE UNIVERSAL ANALYSIS CONTRACT
```
