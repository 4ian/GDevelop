# Kotlin Multiplatform semantic prototype

This top-level directory is isolated from the production GDevelop build. It is a
Milestone 1 research prototype for the headless semantic vertical slice in
[`docs/kotlin-port/compatibility-roadmap.md`](../docs/kotlin-port/compatibility-roadmap.md),
not an editor, renderer, Android application, or GDJS port.

## Modules and boundaries

| Module | Responsibility |
|---|---|
| `diagnostics` | Stable diagnostic codes, severity, and JSON source locations. |
| `project-model` | Bounded GDevelop JSON decoding into a source model; no execution. |
| `extension-catalog` | Immutable descriptors and the reflection-free extension SDK/registry contract. |
| `normalized-ir` | Semantic validation and lowering from the source model into source-independent IR. |
| `runtime-state` | Deterministic headless state, lifecycle, bounded-frame interpreter, and trace report. |
| `example-extension` | Statically registered `KotlinExample` metadata, invocation, and lifecycle hooks. |
| `jvm-cli` | File/argument adapter that composes decoder, lowerer, catalog, and runtime. |
| `maptiles-demo` | Standalone Kotlin/JS MapLibre authoring demo with versioned map-document import/export. |

The decoder has no dependency on runtime state. The interpreter consumes only
normalized IR, so a future Cucumber or alternative frontend can construct the
same IR without manufacturing GDevelop JSON.

## Supported prototype slice

The fixture subset supports scalar global/scene variables, standard and nested
events, `Always` and numeric-variable comparisons, numeric set/add actions, and
statically registered extension actions. A CLI run has a required finite frame
limit and produces compact, deterministically ordered JSON containing the trace,
final variables, diagnostics, and resolved extension metadata.

Objects, instances, groups, non-standard events, project-embedded extensions,
unknown operations, malformed parameter lists, and other unimplemented features
are rejected with source-located `GDKP_*` diagnostics. They are never treated as
no-ops. This is narrower than the eventual roadmap milestone: unimplemented
milestone features stay explicitly unsupported until fixture evidence exists.

## Run

From this directory:

```sh
gradle :jvm-cli:run -Pargs="fixtures/variables-and-extension.json --frames 2"
```

The example extension is registered explicitly with
`ExtensionCatalog.of(CounterExtension)`. Its descriptor resolves the serialized
action type to the interpreted `incrementVariable` entry, while scene-load and
scene-unload hooks add observable lifecycle records.
