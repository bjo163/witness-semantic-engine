# WSI Identifier Grammar v0.1.0

WSI identifiers separate **machine identity** from human labels and external references.

## Principles

1. IDs are stable identities; labels may change.
2. External references such as `37:30` or `Gen.1.1` are mappings, not canonical WSI identity by themselves.
3. Source-unit identity includes corpus and edition context.
4. Concept IDs are language-neutral.
5. Witness labels are not used as Witness Pattern IDs.
6. No semantic meaning should be inferred from an ID beyond the registry/type namespace.

## Core namespaces

```text
wsi:corpus/<slug>
wsi:work/<slug>
wsi:edition/<slug>
wsi:refsys/<slug>
wsi:concept/<slug>
wsi:relation/<slug>
wsi:witness-pattern/<slug>
wsi:response/<slug>
wsi:confidence/<slug>
```

Slug grammar for v0.1:

```regex
[a-z0-9][a-z0-9._-]*
```

Examples:

```text
wsi:corpus/quran
wsi:work/quran
wsi:edition/quran-research-example-ar-v0
wsi:refsys/quran-surah-ayah
wsi:concept/transgression
wsi:relation/authority-over
wsi:witness-pattern/boundary-violation
wsi:response/return-to-boundary
```

## Source units

Canonical internal unit IDs use URN form:

```text
urn:wsi:unit:<corpus-slug>:<edition-slug>:<encoded-reference>
```

For v0.1, `<encoded-reference>` must use URI-safe characters and should not depend on punctuation that has ambiguous semantics across systems.

Examples:

```text
urn:wsi:unit:quran:quran-research-example-ar-v0:37.30
urn:wsi:unit:torah:<edition-slug>:Gen.1.1
urn:wsi:unit:psalms:<edition-slug>:Ps.1.1
urn:wsi:unit:gospels:<edition-slug>:Mark.1.1
```

The human/external reference remains separate:

```json
{
  "canonical_reference": "37:30",
  "reference_system_id": "wsi:refsys/quran-surah-ayah"
}
```

## Semantic records

```text
urn:wsi:record:<corpus-slug>:<record-key>
```

Example:

```text
urn:wsi:record:quran:37.30
```

A future record key may identify a passage spanning several source units. Therefore a record ID must not be treated as synonymous with one verse forever.

## Local IDs inside a record

Local graph nodes use compact identifiers:

```text
P1, P2, ...   participants
U1, U2, ...   utterances
LS1, LS2, ... lexical senses
F1, F2, ...   frames
W1, W2, ...   Witness derivations
```

Local IDs are unique only inside one semantic record. Exporters may expand them into globally unique IRIs.

## External identifiers

External standards may be attached as mappings, never as replacements for WSI identity.

Examples include:

```text
OSIS
USFM
publisher edition IDs
library/catalog IDs
corpus-specific token IDs
```

Any external mapping must identify its namespace/system explicitly.

## Breaking changes

Changing the identity grammar in a way that invalidates previously issued IDs requires:

- a schema/spec version impact review;
- an explicit migration strategy;
- preservation of old-to-new mappings;
- no silent rewriting of locked source or semantic records.
