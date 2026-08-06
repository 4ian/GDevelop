# Kotlin port evidence index

This index records the static, repeatable flow audit performed on **2026-08-06**.
The audited GDevelop revision and Kotlin prototype revision are both
`23f965f5290c176de3666cca9f5ae82ffa70e24a` (the prototype is a directory in the
same Git worktree, not a separately versioned repository). The hashes identify
the input tree that was inspected; the commit adding this record is necessarily
later. Paths are relative to the repository root.

## Audit method and limits

The audit began at `docs/kotlin-port/README.md`, followed every item in its
documentation map, and checked the named implementation paths in the worktree.
It was a static audit: no compatibility claim was inferred from compilation.
Checked-in test source and JSON fixtures are evidence that an experiment and its
test subjects exist, but are not evidence that a test passed. No checked-in
Kotlin differential report, canonical GDJS reference trace, corpus manifest,
catalog snapshot, browser conformance report, or repeated-run determinism report
was found under `KotlinPlatform/` or `docs/kotlin-port/`.

Repeatable audit commands (run from the repository root):

```sh
git rev-parse HEAD
find docs/kotlin-port -maxdepth 2 -type f -print | sort
find KotlinPlatform -type f -print | sort
rg -n "Confirmed|confirmed|compatible|compatibility|MapTiles" \
  docs/kotlin-port KotlinPlatform/README.md
```

## Claim ledger

| Claim | Status after audit | Repository evidence inspected | Executable evidence / gap |
|---|---|---|---|
| Project open separates storage parsing, the JavaScript/Embind bridge, and `gd::Project` deserialization. | **Confirmed** (static flow) | `newIDE/app/src/ProjectsStorage/LocalFileStorageProvider/LocalProjectOpener.js`; `newIDE/app/src/ProjectsStorage/CloudStorageProvider/CloudProjectOpener.js`; `newIDE/app/src/MainFrame/index.js`; `newIDE/app/src/Utils/Serializer.js`; `Core/GDCore/Project/Project.cpp`; `Core/GDCore/Project/Project.h` | Repository-backed control flow; no runtime compatibility is claimed. |
| Preview/full export collect dependencies, generate event JavaScript, serialize stripped project data, copy runtime files, then package target output. | **Confirmed** (static flow) | `GDJS/GDJS/IDE/Exporter.cpp`; `GDJS/GDJS/IDE/ExporterHelper.cpp`; `newIDE/app/src/ExportAndShare/LocalExporters/LocalPreviewLauncher/index.js`; `newIDE/app/src/ExportAndShare/BrowserExporters/BrowserSWPreviewLauncher/index.js` | Repository-backed flow; conditional/version-dependent branches remain qualified in `gdevelop-pipeline.md`. |
| Generated scene code is registered with runtime scene startup and the event-frame lifecycle. | **Confirmed** (static flow) | `GDJS/GDJS/Events/CodeGeneration/EventsCodeGenerator.cpp`; `GDJS/GDJS/Events/CodeGeneration/LayoutCodeGenerator.cpp`; `GDJS/GDJS/IDE/ExporterHelper.cpp`; `GDJS/Runtime/index.html`; `GDJS/Runtime/runtimegame.ts`; `GDJS/Runtime/scenestack.ts`; `GDJS/Runtime/runtimescene.ts`; `GDJS/Runtime/runtimeobject.ts`; `GDJS/Runtime/gd.ts` | Repository-backed control flow only; no portable parity result exists. |
| Extension metadata and runtime implementations are separate, joined by serialized IDs, ordered parameters, generated calls, registries, and lifecycle hooks. | **Confirmed** (static flow) | `Extensions/ExampleJsExtension/JsExtension.js`; `Extensions/ExampleJsExtension/dummyruntimebehavior.ts`; `Extensions/ExampleJsExtension/dummyruntimeobject.ts`; `Extensions/ExampleJsExtension/dummyruntimeobject-pixi-renderer.ts`; `Extensions/ExampleJsExtension/examplejsextensiontools.ts`; `Extensions/ExampleJsExtension/dummyeffect.ts`; `newIDE/app/src/JsExtensionsLoader/LocalJsExtensionsFinder.js`; `newIDE/app/src/JsExtensionsLoader/LocalJsExtensionsLoader.js`; `newIDE/app/src/JsExtensionsLoader/BrowserJsExtensionsLoader.js`; `GDJS/scripts/lib/runtime-files-list.js`; `GDJS/GDJS/Events/CodeGeneration/EventsCodeGenerator.cpp`; `GDJS/Runtime/gd.ts` | Repository-backed declaration/registration flow. No catalog snapshot or generated-output golden is checked in for portable comparison. |
| Project JSON, `gd::Project`, normalized IR, and generated JavaScript are distinct stages/artifacts. | **Confirmed** for the existing GDevelop stages; **Inference** for sufficiency of the proposed portable boundaries | Existing flow paths above; proposal in `docs/kotlin-port/portable-architecture.md`; accepted ownership decision in `docs/kotlin-port/decisions/0001-ir-ownership.md` | ADR-0001 accepts ownership, not semantic sufficiency. Differential fixtures are required. |
| Kotlin source decoding, lowering, bounded headless interpretation, deterministic JSON formatting, diagnostics, and static extension registration are implemented for a narrow subset. | **Confirmed** as implementation existence; **unproven conformance** | `KotlinPlatform/project-model/src/commonMain/kotlin/org/gdevelop/kotlin/project/GDevelopProjectDecoder.kt`; `KotlinPlatform/normalized-ir/src/commonMain/kotlin/org/gdevelop/kotlin/ir/ProjectLowerer.kt`; `KotlinPlatform/runtime-state/src/commonMain/kotlin/org/gdevelop/kotlin/runtime/HeadlessRuntime.kt`; `KotlinPlatform/extension-catalog/src/commonMain/kotlin/org/gdevelop/kotlin/extensions/ExtensionSdk.kt`; `KotlinPlatform/example-extension/src/commonMain/kotlin/org/gdevelop/kotlin/example/CounterExtension.kt`; `KotlinPlatform/jvm-cli/src/jvmMain/kotlin/org/gdevelop/kotlin/cli/Main.kt`; `KotlinPlatform/fixtures/variables-and-extension.json`; `KotlinPlatform/fixtures/unsupported-object.json` | Unit-test sources exist, but the required pinned GDJS oracle, corpus manifest, canonical traces, differential report, and determinism report do not. Compilation or a standalone portable run cannot establish compatibility. |
| A capability-based host boundary, explicit versioned extension identity, and shared interpreter/generated IR are adopted constraints. | **Decision**, not compatibility evidence | `docs/kotlin-port/decisions/0002-extension-identity.md`; `docs/kotlin-port/decisions/0003-runtime-host-boundary.md`; `docs/kotlin-port/decisions/0004-generated-code-vs-interpreter.md` (all Accepted); ADR-0001 above | Consequences remain hypotheses until the target-strategy gates produce reports. No generated backend evidence is checked in. |
| MapTiles common contracts, lowering, fake-host behavior, extension operations, MapLibre adapter, and demo are implemented as an isolated experiment. | **Confirmed** as implementation existence; **unproven conformance** | `KotlinPlatform/map-runtime/src/commonMain/kotlin/org/gdevelop/kotlin/map/`; `KotlinPlatform/maptiles-extension/src/commonMain/kotlin/org/gdevelop/kotlin/maptiles/MapTilesExtension.kt`; `KotlinPlatform/normalized-ir/src/commonMain/kotlin/org/gdevelop/kotlin/ir/ProjectLowerer.kt`; `KotlinPlatform/maplibre-js-host/src/jsMain/kotlin/org/gdevelop/kotlin/maplibre/`; `KotlinPlatform/maptiles-demo/`; `KotlinPlatform/fixtures/maptiles/`; associated `commonTest` sources; `KotlinPlatform/maplibre-js-host/CONFORMANCE.md` | Fixtures and tests are test subjects, and `CONFORMANCE.md` is a checklist. No checked-in execution result records command, environment, outputs, revisions, fixed browser assets, or repeated-run hashes. This is not Milestone 1 and proves neither MapTiles/GDJS conformance nor Kotlin/JS runtime compatibility. |
| `Extensions/TileMap/` is a finite Tiled tilemap feature distinct from the slippy-map experiment. | **Confirmed** (static inventory) | `Extensions/TileMap/JsExtension.js`; `Extensions/TileMap/tilemapruntimeobject.ts`; `Extensions/TileMap/tests/`; distinct MapTiles paths above | Repository identities and implementations differ; no behavioral equivalence is claimed. |

Every **Confirmed** row above was rechecked at the two revisions stated at the
top of this file. Proposed feature matrices, target feasibility, semantic
sufficiency, and future compatibility levels in `portable-architecture.md`,
`target-strategy.md`, and `compatibility-roadmap.md` remain **Inference**,
**Hypothesis**, **Decision**, `planned`, or `investigated` as labeled; their
presence in a plan is not implementation evidence.

## Evidence required to promote compatibility claims

The next evidence record must include the full GDevelop and Kotlin revisions,
toolchain/target, dependency locks, catalog snapshot, host configuration,
fixture and resource hashes, exact command, raw output, normalized result, and
investigation date. For headless semantics it must compare against reviewed,
pinned GDJS traces and record repeated-run hashes. For the browser MapTiles
adapter it must additionally use checked-in local style/resources and satisfy
`KotlinPlatform/maplibre-js-host/CONFORMANCE.md`. A successful compile remains a
build check only.
