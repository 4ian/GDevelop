# Kotlin Multiplatform semantic prototype

This top-level directory is isolated from the production GDevelop build. It is a Milestone 1 research prototype for the
headless semantic vertical slice in
[`docs/kotlin-port/compatibility-roadmap.md`](../docs/kotlin-port/compatibility-roadmap.md), not an editor, renderer,
Android application, or GDJS port.

## Modules and boundaries

| Module              | Responsibility                                                                          |
|---------------------|-----------------------------------------------------------------------------------------|
| `diagnostics`       | Stable diagnostic codes, severity, and JSON source locations.                           |
| `project-model`     | Bounded GDevelop JSON decoding into a source model; no execution.                       |
| `extension-catalog` | Immutable descriptors and the reflection-free extension SDK/registry contract.          |
| `normalized-ir`     | Semantic validation and lowering from the source model into source-independent IR.      |
| `runtime-state`     | Deterministic headless state, lifecycle, bounded-frame interpreter, and trace report.   |
| `example-extension` | Statically registered `KotlinExample` metadata, invocation, and lifecycle hooks.        |
| `jvm-cli`           | File/argument adapter that composes decoder, lowerer, catalog, and runtime.             |
| `maptiles-demo`     | Standalone Kotlin/JS MapLibre authoring demo with versioned map-document import/export. |

The decoder has no dependency on runtime state. The interpreter consumes only normalized IR, so a future Cucumber or
alternative frontend can construct the same IR without manufacturing GDevelop JSON.

## Supported prototype slice

The fixture subset supports scalar global/scene variables, standard and nested events, `Always` and numeric-variable
comparisons, numeric set/add actions, and statically registered extension actions. A CLI run has a required finite frame
limit and produces compact, deterministically ordered JSON containing the trace, final variables, diagnostics, and
resolved extension metadata.

Objects, instances, groups, non-standard events, project-embedded extensions, unknown operations, malformed parameter
lists, and other unimplemented features are rejected with source-located `GDKP_*` diagnostics. They are never treated as
no-ops. This is narrower than the eventual roadmap milestone: unimplemented milestone features stay explicitly
unsupported until fixture evidence exists.

## Run

From this directory:

```sh
gradle :jvm-cli:run -Pargs="fixtures/variables-and-extension.json --frames 2"
```

The example extension is registered explicitly with
`ExtensionCatalog.of(CounterExtension)`. Its descriptor resolves the serialized action type to the interpreted
`incrementVariable` entry, while scene-load and scene-unload hooks add observable lifecycle records.

Run the pinned Phase 0 corpus and write structured per-fixture reports with:

```sh
gradle :jvm-cli:run -Pargs="--corpus ../docs/kotlin-port/corpus/manifest.json --reports reports/phase1-corpus"
```

The reports include ordered selections, stable handles, lifecycle and transition records, final variables/objects, and
diagnostics. An `executed` corpus entry is not a compatibility result; the pinned GDJS traces remain the semantic
oracle.

## Experimental Kotlin/JS MapTiles capability

`map-runtime`, `maptiles-extension`, and `maplibre-js-host` form a focused, experimental Kotlin/JS capability. The
common contract covers camera commands, projection, geographic overlays, interaction events, deterministic animation,
and terminal disposal. `fixtures/maptiles/` records the supported and diagnostic cases; common tests use a deterministic
fake `MapHost`, while MapLibre/browser adapter conformance remains separate.

This work is **not** general GDevelop map support and is **not** a cross-target compatibility claim. JVM/headless
execution intentionally reports the missing browser-map capability. MapLibre checks must not use live network tiles as
an oracle. A future browser automation suite must use a checked-in fixed style and local fixture tiles.
