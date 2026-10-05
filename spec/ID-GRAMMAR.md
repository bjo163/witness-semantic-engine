# WSI Identifier Grammar

**Contract version:** `0.2.0`

WSI v0.2 distinguishes **WSI-owned analysis IDs** from **external Source Provider IDs**.

The goal is to prevent source/corpus identity from being duplicated inside WSI.

---

## 1. General rule

```text
WSI OWNS WSI ANALYSIS IDENTITIES.
SOURCE PROVIDERS OWN SOURCE IDENTITIES.
```

An external ID MUST NOT be rewritten into a WSI ID simply because WSI analyzes it.

Example:

```text
mw:passage:quran:37:30
```

remains an RGBL/MoonWitness ID.

Do not create:

```text
wsi:passage:quran:37:30
```

---

## 2. WSI analysis record IDs

Recommended grammar:

```text
wsi:analysis/<opaque-id>
```

`<opaque-id>` SHOULD be a UUID, ULID, or another stable opaque identifier.

It SHOULD NOT encode a mutable source label, verse number, edition name, language, or concept label.

Example:

```text
wsi:analysis/7d5cf6d7-93a6-4a1f-ae6b-37c30f1a0001
```

---

## 3. Stable ontology IDs

### Concept

```text
wsi:concept/<slug>
```

Examples:

```text
wsi:concept/authority
wsi:concept/transgression
wsi:concept/boundary-alignment
```

### Relation

```text
wsi:relation/<slug>
```

Examples:

```text
wsi:relation/authority-over
wsi:relation/has-state
wsi:relation/discourse-retraction
```

### Witness Pattern

```text
wsi:witness-pattern/<slug>
```

Example:

```text
wsi:witness-pattern/boundary-violation
```

### Response

Until a dedicated registry/schema exists, response identifiers MAY use:

```text
wsi:response/<slug>
```

Example:

```text
wsi:response/return-to-boundary
```

---

## 4. Analysis-local IDs

Within one WSI record, compact local IDs are allowed.

```text
S1, S2 ...     source bindings
LS1, LS2 ...   lexical senses
U1, U2 ...     utterances
P1, P2 ...     participants
F1, F2 ...     frames
A1, A2 ...     assessments
W1, W2 ...     Witness instances
```

Local IDs are scoped to one `wsi:analysis/*` record.

They MUST NOT be treated as globally stable IDs.

---

## 5. External Source Provider IDs

Source Provider IDs are opaque to WSI.

WSI MAY validate provider-specific syntax in the provider connector, but the universal WSI schema SHOULD treat them as non-empty external identifiers.

Examples from RGBL:

```text
mw:work:quran
mw:expression:quran:ar-uthmani-tanzil-1.1
mw:edition:quran:tanzil-1.1-uthmani
mw:passage:quran:37:30
mw:content:quran:37:30:ar-uthmani
```

Their lifecycle and semantics are owned by RGBL, not WSI.

---

## 6. Provider revision IDs

A Source Binding MUST pin a reproducible provider revision.

Examples:

```text
Git commit SHA
immutable release/tag digest
content-addressed snapshot ID
```

Moving labels such as:

```text
main
latest
current
```

MUST NOT be sufficient as the sole revision identity for reviewed/locked analysis.

---

## 7. Label changes

Human labels MUST NOT define stable identity.

Changing:

```text
Transgression → Boundary Transgression
```

must not automatically change:

```text
wsi:concept/transgression
```

unless the concept meaning itself materially changes.

If meaning changes materially, mint a new ID and deprecate the old ID rather than silently redefining it.

---

## 8. No semantic overload in IDs

Do not encode full propositions in IDs.

Wrong:

```text
wsi:concept/no-authority-over-you
wsi:concept/bad-transgression
```

Correct decomposition:

```text
relation = wsi:relation/authority-over
concept  = wsi:concept/authority
polarity = NEGATED
roles    = HOLDER / TARGET
```

---

## 9. Future graph export

JSON-LD/RDF exporters MAY expand local objects into global URIs.

Such export IDs MUST remain deterministic and MUST NOT retroactively redefine the canonical JSON identity model.

---

## 10. Identity principle

```text
SOURCE IDENTITY → OWNED BY SOURCE PROVIDER
ANALYSIS IDENTITY → OWNED BY WSI
ONTOLOGY IDENTITY → OWNED BY WSI REGISTRY
LOCAL GRAPH IDENTITY → SCOPED TO ONE ANALYSIS RECORD
```

Keeping these namespaces separate is a core WSI invariant.
