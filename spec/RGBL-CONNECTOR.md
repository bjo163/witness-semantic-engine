# RGBL Source Provider Connector

**Status:** Milestone 3 reference implementation  
**WSI Machine Contract:** `0.2.0`  
**Source Provider Contract:** `moonwitness-corpus/v0.1`

This document defines the first runtime implementation of the WSI `SourceProvider` boundary.

## 1. Boundary

WSI core depends on a logical `SourceProvider` interface, not on RGBL file layout, SDK classes, HTTP routes, or SQLite tables.

```text
WSI
  ↓
SourceProvider
  ↓
transport-specific provider implementation
  ↓
canonical provider resources
```

The first implementation is repository-backed:

```text
RgblRepositoryProvider
```

It resolves resources directly from a local `rocksoul-rgbl` Git checkout at the exact revision pinned by a WSI Source Binding.

This is a reference transport, not a universal storage assumption. Future RGBL SDK, API, or local-database implementations MAY implement the same interface.

## 2. Runtime interface

A Source Provider MUST support, conceptually:

```text
verifyRevision(revision)
currentRevision()
resolveResource(revision, resourceId, hints?)
```

A resolved resource exposes at least:

```text
id
kind
provider
revision
```

and MAY expose:

```text
text
language
script
sourcePath
raw provider record
```

Provider-specific raw records MUST NOT leak into semantic Frame contracts.

## 3. Revision semantics

The Source Binding's pinned revision is authoritative for reproducibility.

```text
PINNED REVISION != PROVIDER HEAD
```

If provider `HEAD` advances while the pinned commit remains resolvable, the analysis is not automatically stale. The connector reports that movement as informational context.

A binding becomes stale when its claimed resolved state can no longer be demonstrated at the pinned snapshot, for example:

- pinned revision does not exist;
- required resource does not exist at that revision;
- evidence quote/range does not resolve against pinned content.

## 4. Repository-backed RGBL resolution

`RgblRepositoryProvider` uses Git plumbing against a local RGBL checkout:

```text
git rev-parse --verify <revision>^{commit}
git ls-tree -r --name-only <revision> -- datasets
git show <revision>:<resource-jsonl-path>
```

It reads provider records from RGBL `data/core/resources/*.jsonl` partitions and resolves records by canonical RGBL ID.

WSI does not rewrite or re-materialize those resources.

## 5. Dataset hints

A Source Binding MAY carry provider-specific metadata such as:

```json
{"dataset":"quran-tanzil-uthmani"}
```

The connector MAY use this as a search optimization.

```text
DATASET HINT != SOURCE IDENTITY
DATASET HINT != SEMANTIC CONDITION
```

If configured to fall back, the connector searches other RGBL resource partitions when the hint does not resolve the requested resource.

## 6. Selector verification

Live verification augments the deterministic validator.

### RESOURCE_ONLY

Passes when the referenced provider resource resolves.

### TEXT_QUOTE

The exact string MUST occur literally in provider text at the pinned revision.

No Unicode normalization, translation, stemming, or fuzzy matching is performed by the source verifier. Those operations belong to analysis layers, not source proof.

### CHAR_RANGE

Offsets MUST satisfy:

```text
0 <= start < end <= providerText.length
```

If `exact` is supplied, the selected slice MUST equal it.

### TOKEN_IDS

The initial RGBL repository connector does not claim portable live token verification. TOKEN_IDS remain structurally valid but emit a warning unless a future provider transport exposes a compatible tokenizer-stable index.

## 7. Stale detection

If a WSI Source Binding says:

```text
resolution_status = RESOLVED
```

but live verification finds an unavailable revision, missing resource, or failed source selector, verification emits:

```text
RESOLVED_BINDING_STALE
```

This does not mutate the analysis record automatically. Review/update remains explicit.

## 8. Acceptance fixtures

M3 must prove the provider abstraction is not Quran-specific.

The pinned integration revision is:

```text
df00706c98e21fb3fb0146b8389b0f2978f3d833
```

Required live checks:

1. WSI worked example target/evidence:
   - `mw:passage:quran:37:30`
   - `mw:content:quran:37:30:ar-uthmani`
2. Structurally separate non-Quran resource through the same connector:
   - `mw:passage:hinduism:bhagavad-gita:1:1`
   - `mw:content:hinduism:bhagavad-gita:1:1:sa`

Passing both is an interoperability test, not a theological equivalence claim.

## 9. CI modes

Ordinary repository policy remains offline and deterministic.

A separate `Live Source Provider` workflow checks real provider resources by checking out the pinned RGBL commit.

```text
OFFLINE VALIDATOR
  = WSI contract consistency

LIVE PROVIDER WORKFLOW
  = external source-binding proof
```

The live workflow MAY fail because an integration is unavailable; it MUST NOT silently substitute a moving source snapshot.

## 10. Non-goals

M3 does not perform:

- morphology or syntax analysis;
- semantic Frame generation;
- concept linking;
- Witness generation;
- translation equivalence;
- corpus ingestion;
- source normalization.

Those boundaries remain separate by design.
