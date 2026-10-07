# WSI Witness Engine Contract v0.1

M6 derives Witness candidates from semantic state without rewriting source meaning.

## Canonical flow

```text
Source Provider
→ Linguistic Analysis
→ Semantic Candidate
→ Review / eligible semantic state
→ Witness Pattern
→ Witness Label
→ Response / Correction
→ Positive Direction
```

The engine MUST NOT derive production Witness output directly from raw source, translation, linguistic output, or unreviewed semantic candidates.

## Modes

### RESEARCH_PREVIEW

Allows semantic records/Frames with:

```text
RESEARCHED
REVIEWED
LOCKED
```

and Witness Patterns with:

```text
CANDIDATE
RESEARCHED
REVIEWED
LOCKED
```

All output remains `CANDIDATE`.

### PRODUCTION

Requires semantic record/Frames and Witness Patterns to be:

```text
REVIEWED
LOCKED
```

This mode fails closed when review eligibility is missing.

## Pattern matching

v0.1 matches registered `triggerConcepts` against concepts already present on eligible semantic Frames.

A Witness Pattern is not a translation and its localized label is presentation only.

```text
SOURCE CONCEPT != WITNESS PATTERN != WITNESS LABEL
```

## Response / correction

A response resolves automatically only when a matched pattern has exactly one allowed response.

- zero allowed responses → `UNRESOLVED`;
- multiple allowed responses → `UNRESOLVED` (ambiguous);
- exactly one → response may resolve.

The engine does not choose among multiple valid responses by hidden preference.

## Positive direction

Positive direction resolves only after response resolution and only when the response target:

1. exists in the concept registry; and
2. has class `DERIVED_TARGET`.

Then:

```text
direction = POSITIVE
derivationType = DERIVED
```

Otherwise positive direction remains `UNRESOLVED`.

```text
POSITIVE DIRECTION != SOURCE DIRECTION
RESPONSE != SOURCE ASSERTION
```

## Confidence

v0.1 deliberately does not invent a theological or semantic truth percentage. It records exact trigger coverage instead. Later calibrated fit/confidence policies may be versioned separately.

## Output lifecycle

The reference engine emits only:

```text
reviewStatus = CANDIDATE
```

Materialization into the canonical WSI record is a separate review step.
