# GDevelop engineering guide for AI agents

This file is the fast routing and working contract for changes in this
repository. It applies from the repository root unless a more specific guide
inside a nested project says otherwise.

GDevelop is an authoring system that compiles a rich editor-time project model
into JavaScript data and code for a separate game runtime. Before editing,
decide which side of that boundary owns the bug.

```text
Core/GDCore authoring model and event AST
        |
        +--> GDevelop.js (WASM bindings) --> newIDE (React/Electron editor)
        |
        +--> GDJS/GDJS (code generation/export)
                  |
                  +--> generated JavaScript + stripped project data
                                      |
                                      +--> GDJS/Runtime + Extensions runtime
```

Read `docs/Architecture.md` for the detailed engineering reference and
`Core/GDevelop-Architecture-Overview.md` for the shorter upstream overview.
This checkout has important branch-specific behavior: multi-file
`project.gdevelop` projects, strict layout TOML and IfDo event sources, Static
Data placeholder compilation, extra preview/export validation, deterministic
single-object checks, and a queued runtime signal bus.

## Non-negotiable workflow

### Large or breaking changes: write a spec and stop

If the user asks for a large or breaking change, do not implement it
immediately.

1. Create a focused specification under `docs/`, normally
   `docs/<descriptive-feature>-spec.md`.
2. Include the problem, goals, non-goals, current behavior, proposed behavior,
   affected layers and files, public API/data/schema changes, compatibility and
   migration strategy, performance implications, error handling, rollout,
   tests, alternatives, and open questions.
3. Tell the user the spec is ready and wait for explicit review/approval.
4. Only implement after the user approves the spec. If an ordinary task grows
   into a breaking change during investigation, stop at that point and use the
   same process.

Treat changes to serialized project formats, instruction/expression type
strings, extension namespaces, public runtime/editor APIs, event semantics,
code-generation contracts, or broad cross-layer architecture as breaking
unless compatibility is clearly preserved.

### After every code change: run and launch

Run the closest relevant checks and regression tests first. Then perform a real
desktop build and launch using the script for the host operating system:

- Windows: `python scripts/start-windows-app.py`
- macOS: `python3 scripts/start-macos-app.py`

Run the command from the repository root as a detached background process.
Confirm only that the background process was created successfully; do not wait
for, poll, or monitor the build or application launch. After starting the
background process, finish the current agent session immediately. Do not
substitute `--dry-run`, `--no-launch`, or `--skip-build` for the required
background invocation. If the host is neither Windows nor macOS, state clearly
that this repository has no matching required launch script.

Documentation-only changes do not require an application build and launch.
Always report which checks ran and whether the background launcher process was
started successfully. Do not claim that the build or desktop launch succeeded,
because the agent does not wait for the result.

## Start every task this way

1. Run `git status --short` and preserve unrelated user changes.
2. Read the relevant architecture/design document and the nearest existing
   implementation and tests.
3. Use `rg`/`rg --files` to trace symbols, serialized names, metadata type
   strings, function names, and include paths across layers.
4. Identify the authoritative source. Do not patch a generated copy.
5. Add or update a regression test at the closest seam to the bug.
6. Keep the change narrow, but follow a contract through every layer it
   genuinely affects.

## Where to make a change

| Bug or feature | Start here | Usually inspect together |
| --- | --- | --- |
| Project, scene, object, behavior, variable, layer, resource, or initial-instance authoring model | `Core/GDCore/Project` | The type's `SerializeTo`/`UnserializeFrom`, copy/assignment behavior, containers, refactorers, bindings, storage projection, export stripping |
| Project load/save JSON behavior or backward compatibility | `Core/GDCore/Serialization` and the model type in `Core/GDCore/Project` | Old-key fallbacks, `GDevelop.js` tests, `newIDE/app/src/ProjectsStorage` |
| Name resolution, visible variables/objects/resources/properties, function or prefab scope | `Core/GDCore/Project/ProjectScopedContainers.*` | `Core/GDCore/IDE/EventsFunctionTools.*`, validators, completion, code generation |
| Event AST, event types, instructions, expression parsing | `Core/GDCore/Events` | `Core/GDCore/Events/Parsers`, `Core/GDCore/Events/CodeGeneration`, `Core/GDCore/IDE`, editor event UI |
| Validation, diagnostics, rename/delete propagation, dependency analysis | `Core/GDCore/IDE` | `WholeProjectRefactorer`, `ObjectRefactorer`, `InstructionValidator`, expression visitors, editor scanners |
| Wrong generated JavaScript, object picking, loops, async actions, event function calls | `GDJS/GDJS/Events/CodeGeneration` | Base generators in `Core/GDCore/Events/CodeGeneration`, metadata, `GDevelop.js/__tests__`, runtime helpers in `GDJS/Runtime/gd.ts` |
| Events-based free function generation | `GDJS/GDJS/Events/CodeGeneration/EventsFunctionsExtensionCodeGenerator.*` | `EventsCodeGenerator.*`, `newIDE/app/src/EventsFunctionsExtensionsLoader` |
| Events-based behavior or custom-object/prefab generation | `BehaviorCodeGenerator.*` or `ObjectCodeGenerator.*` in `GDJS/GDJS/Events/CodeGeneration` | `Core/GDCore/Project/EventsBased*`, `GDJS/Runtime/CustomRuntimeObject*`, `runtimebehavior.ts`, extension editor/prefab UI |
| Scene boot, frame order, pause, time, scene stack | `GDJS/Runtime/runtimegame.ts`, `runtimescene.ts`, `scenestack.ts` | Pixi runtime game/scene renderers, async manager, debugger |
| Runtime object creation, deletion, recycling, lookup, instance lists | `GDJS/Runtime/RuntimeInstanceContainer.ts` | `runtimeobject.ts`, custom-object instance container, generated picking code, hot reload |
| Runtime object or behavior lifecycle | `GDJS/Runtime/runtimeobject.ts`, `runtimebehavior.ts` | Owning extension runtime class, custom objects, scene frame order |
| Variables, timers, forces, input, audio, camera, storage, network, signals | The matching file in `GDJS/Runtime` or `GDJS/Runtime/events-tools` | Matching builtin metadata declaration and GDJS browser tests |
| Base sprite behavior/rendering | `GDJS/Runtime/spriteruntimeobject.ts` and `GDJS/Runtime/pixi-renderers` | Core/GDJS Sprite builtin declarations, editor Sprite renderer/editor |
| Cross-object capabilities such as opacity, scale, size, flip, animation, effects, text | `GDJS/Runtime/object-capabilities` | `Core/GDCore/Extensions/Builtin/Capabilities`, `GDJS/GDJS/Extensions/Builtin/Capacities`, implementing object types |
| Core 2D rendering, cameras, layers, Pixi resources/effects | `GDJS/Runtime/pixi-renderers` | Runtime scene/layer/object code and the relevant object extension renderer |
| 3D object/runtime/rendering bug | `Extensions/3D` | `GDJS/Runtime/Model3DManager.ts`, Three.js integration exposed through Pixi, related object/editor code |
| A built-in object, behavior, effect, or service | `Extensions/<Feature>` | `JsExtension.js` declaration, TS runtime implementation, optional C++ configuration/metadata, tests in the same extension |
| A new action, condition, expression, behavior, object, or effect | Usually an existing or new `Extensions/<Feature>` | Use `Extensions/ExampleJsExtension` as the minimal pattern; declaration and runtime implementation must be changed together |
| Builtin/common event vocabulary such as variables, scene, camera, input, math, time | `Core/GDCore/Extensions/Builtin` | Matching `GDJS/GDJS/Extensions/Builtin` function wiring and `GDJS/Runtime/events-tools` implementation |
| Extension metadata, factories, parameter/value types | `Core/GDCore/Extensions` | GDJS builtin wiring, code generation, editor parameter renderer and instruction enumeration |
| C++ model API missing or wrong in the editor | C++ declaration/implementation, then `GDevelop.js/Bindings/Bindings.idl` | Wrapper/post-JS ownership, regenerated bindings/types, bridge tests, editor caller |
| Editor UI/workflow bug | The domain directory under `newIDE/app/src` | `MainFrame` orchestration, borrowed WASM object ownership, nearby `*.spec.js` |
| Scene editor display/selection, not exported game rendering | `newIDE/app/src/SceneEditor`, `InstancesEditor`, `ObjectsRendering` | The extension's registered editor renderer; do not patch the runtime renderer for an editor-only issue |
| Events editor, parameter fields, expressions, autocomplete | `newIDE/app/src/EventsSheet`, `InstructionOrExpression`, `ExpressionAutocompletion` | Core metadata/validation/scope and code generation |
| Object/behavior/property editing | `newIDE/app/src/ObjectEditor`, `BehaviorsEditor`, `CompactPropertiesEditor`, `PropertiesEditor` | Core property descriptors, extension editor configuration |
| Variables editor | `newIDE/app/src/VariablesEditorRedesign` and `VariablesList` | Core variable/source-scope APIs and history/serialization |
| Events-based extensions or prefabs in the editor | `EventsFunctionsExtensionEditor`, `EventsFunctionsExtensionsLoader`, `EventsFunctionsList`, `PrefabDetailEditor` | Core `EventsFunctionsExtension` model and GDJS function/object/behavior generators |
| Local project open/save, `project.gdevelop`, TOML, layout or event source | `newIDE/app/src/ProjectsStorage` | `MultiFileProjectFormat`, `LayoutToml`, `LocalFileStorageProvider/LocalMultiFileProject.js`, IfDo DSL, format specs |
| IfDo event parsing/formatting/catalog resolution | `newIDE/app/src/EventsSheet/IfDoEventsDsl` | `ProjectInstructionCatalog.js`, multi-file composition, `docs/gdevelop-events-dsl-spec.md` |
| Preview/export diagnostics or orchestration | `newIDE/app/src/MainFrame`, `ExportAndShare` | `newIDE/app/src/Utils/EventsValidationScanner.js`, `GDJS/GDJS/IDE/Exporter*` |
| Exported project data, include/resource collection, Constants placeholder resolution | `GDJS/GDJS/IDE/ExporterHelper.*` | Core project serialization, runtime `types/project-data.d.ts`, local/browser exporter |
| Hot reload, debugger, in-game editor | `newIDE/app/src/HotReload`, `Debugger`, `EmbeddedGame` and `GDJS/Runtime/debugger-client`, `InGameEditor` | Persistent UUIDs, runtime object lifecycle, Electron preview server |
| Electron main process, native filesystem/watchers/windows/menus | `newIDE/electron-app/app` | `newIDE/electron-app/scripts`, local app service injected in `newIDE/app/src/LocalApp.js` |
| Web-only app/deployment | `newIDE/app/src/BrowserApp.js` and `newIDE/web-app` | Browser storage/preview exporters and service worker |
| Shared browser/runtime library | `SharedLibs` | Its package build and every consumer that imports the built artifact |
| External maintained tool | `ThirdParties/<Tool>` | It is normally a Git submodule; follow `docs/scripts/ThirdPartySubmodules.md` and the tool-specific integration doc |
| Build/start/package helper | `scripts`, `newIDE/app/scripts`, or `newIDE/electron-app/scripts` | Add script-level tests where present and verify both path assumptions and generated artifacts |

## Cross-layer recipes

### Fix or add a repository JavaScript extension feature

An extension is normally split between declaration and implementation.

1. Edit `Extensions/<Name>/JsExtension.js` for names, sentences, parameters,
   dependencies, include files, object/behavior/effect metadata, and editor
   registrations.
2. Edit its TypeScript runtime tools/object/behavior/renderer.
3. Keep metadata parameter order and runtime function signatures identical.
4. Add a spec under `Extensions/<Name>/tests` when possible.
5. Run the GDJS type check/build before the browser test suite so
   `newIDE/app/resources/GDJS/Runtime` contains current compiled files.

Some older extensions also have `Extension.cpp`/`JsExtension.cpp` and C++
object configurations. Follow the existing shape in that extension rather
than replacing one declaration path casually.

### Change a C++ project-model field

Audit all of these:

1. Declaration, defaults, copy/assignment, equality if present.
2. `SerializeTo` and `UnserializeFrom`, including old-project compatibility.
3. Refactoring, validation, scope, and project stripping behavior.
4. `GDevelop.js/Bindings/Bindings.idl` if JavaScript needs the field.
5. Editor UI, undo/redo serialization, and cancelable editor ownership.
6. Multi-file decompose/compose ownership and round-trip behavior.
7. Exported runtime type/loader only if the field must survive export.
8. Preview, hot reload, and debugger behavior where relevant.

Rebuild GDevelop.js after C++ or IDL changes. Generated glue is not the source
of truth.

### Change an instruction or expression parameter type

Trace the type through:

1. `ParameterMetadata`/`ValueTypeMetadata` declaration.
2. Core validation, expression parsing, completion, and scoped containers.
3. `GDJS/GDJS/Events/CodeGeneration` argument conversion.
4. `newIDE/app/src/EventsSheet/ParameterRenderingService.js` and instruction
   enumeration.
5. IfDo/source catalogs and generated declarations.
6. Runtime function signature and extension tests.

### Change custom objects, prefabs, or events-based behaviors

These features span all layers. Inspect:

- `Core/GDCore/Project/EventsBasedObject*`,
  `EventsBasedBehavior*`, `EventsFunction*`, and
  `EventsFunctionsExtension*`;
- `ObjectCodeGenerator.*`, `BehaviorCodeGenerator.*`, and
  `EventsFunctionsExtensionCodeGenerator.*`;
- `GDJS/Runtime/CustomRuntimeObject*`,
  `CustomRuntimeObjectInstanceContainer.ts`, and `runtimebehavior.ts`;
- `newIDE/app/src/EventsFunctionsExtensionEditor`,
  `EventsFunctionsExtensionsLoader`, and `PrefabDetailEditor`;
- code-generation integration tests and `GDJS/tests`.

Keep the outer custom object separate from its internal child instance
container, and preserve variant, child-layer, property, lifecycle, and scope
semantics.

### Change the multi-file project format

Read `docs/gdevelop-new-formats-spec.md`,
`docs/gdevelop-layout-toml-spec.md`, and
`docs/gdevelop-events-dsl-spec.md` first. Format changes are usually breaking
and therefore require the spec-review gate above.

Preserve:

- legacy-project normalization and migration;
- decompose/compose equivalence before writes;
- canonical `game://` URIs and portable encoded names;
- strict ownership and unknown-data rejection;
- transaction recovery and `project.gdevelop`-last commit ordering;
- generated catalog/API regeneration;
- reader size/path/symlink safety limits;
- round-trip, migration, recovery, and compatibility tests.

## Architectural invariants

- Editor-time C++ model and runtime TypeScript model are different systems.
  Connect them through serialized data and generated code.
- Metadata declares a feature; runtime code implements it. A change is often
  incomplete if only one side changed.
- Instruction/expression type strings, extension namespaces, object/behavior
  types, serialized keys, and runtime function names are compatibility APIs.
- Use `ProjectScopedContainers` for visibility rules. Do not recreate scope
  logic ad hoc in React or a generator.
- Object picking is list state: conditions filter, subevents inherit, and
  ordinary object/behavior actions iterate. Scalar/single-target consumers use
  stricter cardinality checks. Read the "Object picking and single-instance
  consumption" section of `docs/Architecture.md` before changing this.
- Runtime deletion/recycling is intentionally deferred because generated code
  may retain references until a safe drain point.
- Runtime frame order is a contract. Signals are queued and delivered on a
  later pre-events phase; read `docs/SignalSystem.md`.
- Constants is authoring/compile-time data. Resolve placeholders consistently
  and keep the map out of exported project data; read `docs/Constants.md`.
- Runtime and extension hot paths are allocation-sensitive. Preserve array and
  object reuse, caches, recycling, and stable object shapes unless measurements
  justify a change.
- The scene editor renderer and exported-game renderer are separate.
- WASM wrapper ownership is manual: delete owned temporary wrappers, never
  delete borrowed children, and never retain a borrowed wrapper after its
  parent dies.
- Backward compatibility normally belongs in read-time normalization. Do not
  silently discard unknown or old authored data.

## Generated and external files

Do not directly edit:

- `GDevelop.js/Bindings/glue.cpp` or `glue.js`; regenerate from
  `Bindings.idl` and wrapper sources.
- Copied runtime output under `newIDE/app/resources/GDJS`.
- `newIDE/app/public/libGD.js`, `libGD.wasm`, app `build`, Electron `app/www`,
  or `Binaries` build outputs.
- Generated `.gdevelop` catalogs/APIs/game projections inside user projects.
- `node_modules`.

`GDevelop.js/types`, `GDevelop.js/types.d.ts`, and other generated declarations
may be tracked outputs. Regenerate them with the owning build and include the
result when required; do not hand-edit them.

Treat `ThirdParties/*` as external submodules and
`newIDE/electron-app/app/external` as packaged integration artifacts. Do not
fold product changes into either location without following its documented
source/build/cache-busting workflow.

## Checks and tests

Choose checks by changed seam and prefer a focused regression test before a
broad suite.

### GDJS runtime and TypeScript extensions

```text
cd GDJS
npm run check-types
npm run build

cd tests
npm test
```

`npm run build` compiles runtime and extension sources into the ignored
`newIDE/app/resources/GDJS/Runtime` tree used by Electron and the Karma suite.
Extension specs live under `Extensions/<Name>/tests`; core runtime specs live
under `GDJS/tests/tests`.

### C++ Core, JavaScript code generation, or bindings

Use the repository CMake graph for native `GDCore_tests` when the change is
covered there. For the editor/WASM seam:

```text
cd GDevelop.js
npm run build
npm test
```

`npm run build` requires the repository's Emscripten toolchain and regenerates
bindings/declarations while copying `libGD` to the editor. Code-generation
integration tests are under `GDevelop.js/__tests__`. `npm run lint` checks C++
formatting through the configured clang tooling.

### React editor

From `newIDE/app` run the relevant subset, then broaden according to risk:

```text
npm run flow
npm run lint
npm run check-format
npm test -- --watchAll=false <path-to-spec>
```

Keep tests next to the domain as `*.spec.js`. Storage, format, preview-policy,
and model-adapter changes should have non-visual unit tests; use Storybook when
the change is primarily a reusable visual state.

### Python launcher/tooling

Run the script's focused Python test when one exists (for example
`scripts/test_start_windows_app.py`), then start the required real platform
launcher as a detached background process and finish the agent session without
waiting for it.

## Definition of done

A code task is complete only when:

1. The authoritative source, all affected contracts, and generated outputs are
   consistent.
2. A regression test covers the bug or new behavior at the closest useful
   layer.
3. Relevant type, lint, format, build, and test commands pass, or failures are
   reported with exact commands and reasons.
4. `scripts/start-windows-app.py` or `scripts/start-macos-app.py` has been
   started successfully as a detached background process with the real build
   and launch options.
5. The final report names the changed layers, tests run, background launcher
   dispatch result, and any compatibility/performance follow-up. The agent does
   not wait for or report the eventual build or launch result.
