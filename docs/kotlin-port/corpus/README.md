# Phase 0 compatibility corpus

This read-only corpus is versioned independently by `corpusVersion` in
`manifest.json`. It contains the seven minimized milestone projects, reviewed
normalized GDJS reference observations, the frozen `MyDummyExtension` descriptor
snapshot, schemas, provenance, and integrity tooling required by Phase 0.
`KotlinPlatform/fixtures/maptiles/` is experimental and is deliberately absent
from this manifest and its coverage totals.

The pinned capture input is GDevelop revision
`23f965f5290c176de3666cca9f5ae82ffa70e24a`. Every fixture entry records its raw
project and trace SHA-256, provenance sources, features, assertions, extensions,
seeded host inputs, and frame budget. The manifest-level capture environment
records dependency-lock hashes, OS/architecture, runtime versions, and the exact
command. `reports/reference-capture-2026-08-06.json` records both semantic hashes
for every reviewed capture.

Run the integrity validator:

```sh
python3 docs/kotlin-port/corpus/tools/validate_corpus.py
```

Recheck the two-capture determinism gate without modifying goldens:

```sh
python3 docs/kotlin-port/corpus/tools/capture_reference.py \
  --manifest docs/kotlin-port/corpus/manifest.json --runs 2 --verify
```

The capture verifier intentionally cannot bless new output. If instrumented GDJS
observations differ, retain both raw runs, investigate the mismatch, review the
semantic change against the pinned sources, and explicitly update the canonical
trace and manifest hash. Compilation or portable-runtime output is not an oracle.

## Portable corpus runner

Run the Phase 1 differential gate with its documented repeated-run count:

```sh
python3 docs/kotlin-port/corpus/tools/run_corpus.py \
  --manifest docs/kotlin-port/corpus/manifest.json \
  --reports docs/kotlin-port/evidence/phase1-corpus \
  --runs 100
```

The runner writes one canonical JSON result per fixture and a linked summary. It
fails for trace/state divergence, diagnostic mismatch, a reachability false
negative, or non-deterministic canonical NIR, trace, or state. A failing report
remains evidence; it must not be relabelled as partial compatibility.
