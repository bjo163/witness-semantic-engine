# WSI Semantic Candidate Contract v0.1

M5 defines a deterministic boundary between linguistic analysis and reviewed WSI semantics.

```text
Source Provider
→ LinguisticAnalysis
→ evidence-backed semantic proposals
→ SemanticCandidate
→ review
→ WSI semantic record
```

A SemanticCandidate is **not** reviewed semantic truth.

## Why a compiler

The baseline linguistic analyzers intentionally leave unsupported morphology, POS, syntax, lemma, and discourse cues as `UNSUPPORTED`. M5 must not hallucinate those missing layers merely to emit complete semantics.

The reference compiler therefore accepts evidence-backed proposals from a rule, researcher, model, or import and applies deterministic structural/invariant rules. Proposal origin is always recorded.

## Participant vs semantic key

Normative rules:

```text
PARTICIPANT REFERENCE != SEMANTIC KEY
FUNCTION WORD != SEMANTIC KEY
STRUCTURAL MARKER != SEMANTIC KEY
RAW TOKEN IMPORTANCE != SEMANTIC KEY
```

First-person plural references such as “we” / `نا` may identify a participant when supported. They do not become semantic keys merely because they are salient.

A semantic key is emitted only when:

1. source role is `CONTENT`;
2. a WSI concept ID is proposed;
3. that concept exists in the supplied registry snapshot;
4. output remains `CANDIDATE`.

## Source roles

```text
CONTENT
PARTICIPANT_REFERENCE
FUNCTION_WORD
STRUCTURAL
UNKNOWN
```

Non-content proposals remain visible in `conceptCandidates` and `excludedSemanticKeys`.

## Fail closed

The compiler rejects structural defects: unknown token IDs, duplicate proposal keys, broken local references, empty evidence sets, invalid confidence, unsupported linguistic analyses, or resolved participants without identities.

Research ambiguity is preserved through null concept mappings, unregistered registry findings, `UNDETERMINED` fields, and `PARTIAL / UNRESOLVED` candidate status.

## Review and Witness boundary

The compiler emits only `reviewStatus=CANDIDATE`. Promotion belongs to a separate review/materialization step.

M5 emits no Witness or positive direction. Production Witness derivation starts only from reviewed/eligible semantic state in M6.
