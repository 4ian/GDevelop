# Extensions and types: compatibility contract for a Kotlin port

This note treats extension declarations as an ABI, not merely as editor UI. It
traces the repository's deliberately small `ExampleJsExtension` end to end,
compares the other declaration paths, and identifies what a Kotlin replacement
must keep stable. Paths are relative to the repository root.

## The two halves of an extension

An extension has two distinct products:

1. **IDE metadata** describes names, labels, parameters, properties,
   dependencies, and the code-generation target. It lives in a
   `gd::PlatformExtension` in the C++ core (exposed to JavaScript through
   Emscripten bindings).
2. **Runtime code** implements the generated calls and registers object,
   behavior, and effect constructors. For GDJS this is JavaScript emitted from
   TypeScript, hand-written JavaScript, or JavaScript generated from events.

Keeping those products separate is important for Kotlin. Kotlin data classes can
replace the metadata object graph, but that does not make a browser runtime
implementation usable on the JVM or Native. Conversely, Kotlin/JS can call the
existing runtime, but must still reproduce the metadata and serialization ABI.

## Fully traced `JsExtension.js` example

### Build and editor initialization

The path from source checkout to an extension visible in the editor is:

1. `newIDE/app/scripts/import-GDJS-Runtime.js` invokes
   `node GDJS/scripts/build.js --out .../Runtime` for both Electron resources
   and `GDJS-for-web-app-only`. `GDJS/scripts/lib/runtime-files-list.js`
   recursively admits extension `.js`/`.ts` files, transforms TypeScript and
   ordinary JavaScript with esbuild, but recognizes a basename exactly equal to
   `JsExtension.js` as a declaration and copies it untransformed. Thus the
   TypeScript companions become `.js` while the CommonJS declaration remains
   executable metadata code. The extension's own comment documents the watch
   path and the manual import command.
2. Electron's `LocalJsExtensionsFinder.js` scans each directory under
   `<gdjsRoot>/Runtime/Extensions` for the exact filename `JsExtension.js`.
   `LocalJsExtensionsLoader.js` `require`s every result. The browser cannot scan
   a filesystem, so `BrowserJsExtensionsLoader.js` statically `require`s the
   bundled Example module (and the other supported modules).
3. Optional `registerEditorConfigurations` and `registerInstanceRenderers`
   hooks run against editor-only services. Then `loadExtension` calls
   `module.createExtension(translationFunction, gd)`, runs the module's sanity
   checks, copies the returned extension into `gd.JsPlatform`, and deletes the
   temporary binding object. The platform's metadata provider is subsequently
   what instruction pickers, property editors, validation, and generators
   query.

This is executable module initialization, not parsing a declarative file. A
Kotlin port should not reproduce Node `require` as its long-term extension API;
it should deserialize a schema or call a typed provider interface. A
compatibility host can continue to execute legacy modules and translate the
resulting `gd.PlatformExtension` graph.

### Metadata population and registration inventory

`Extensions/ExampleJsExtension/JsExtension.js` constructs a
`gd.PlatformExtension`, and `setExtensionInformation` fixes the namespace
`MyDummyExtension`, display name, description, author, and license. It then adds
group/icon and short-description metadata. The rest of the declaration is as
follows:

| Kind | Declaration in the example | Stable metadata/runtime result |
|---|---|---|
| Extension property types | `registerProperty(...).setType(...)` | `DummyPropertyString: string`, `DummyPropertyNumber: number`, and `DummyPropertyBoolean: boolean`; these describe extension settings, not object fields. |
| Dependency | `addDependency()` setters | npm package `is-thirteen` version `2.0.0`, exported as “Thirteen Checker”; exporters/installers must preserve all fields. |
| Effect and effect properties | `addEffect('DummyEffect')`, include `dummyeffect.js`, then `getProperties().getOrCreate(...)` | Full type `MyDummyExtension::DummyEffect`; `opacity` is number, `someImage` is an image resource, `someColor` is color, and `someBoolean` is boolean, including string defaults. |
| Condition | `addCondition('MyNewCondition')` | Ordered parameters `(expression, string)`; include `examplejsextensiontools.js`; call target `gdjs.evtTools.exampleJsExtension.myConditionFunction`. |
| Number expression | `addExpression('DummyExpression')` | Ordered `(expression)` parameter and call target `gdjs.random`; no extension include is needed because it is a runtime builtin. |
| String expression | `addStrExpression('DummyStrExpression')` | String result, no parameters, tools include, target `gdjs.evtTools.exampleJsExtension.getString`. |
| Behavior | `addBehavior('DummyBehavior', ...)` | Full type `MyDummyExtension::DummyBehavior`; editor implementation owns serialized `behaviorContent`; includes `dummyruntimebehavior.js` then tools. A second type, `MyDummyExtension::DummyBehaviorWithSharedData`, also carries shared serialized data. |
| Object | `addObject('DummyObject', ...)` | Full type `MyDummyExtension::DummyObject`; `content` is serialized into the object configuration; includes runtime object then renderer, in that declared dependency order. |
| Object action | `object.addAction('MyMethod', ...)` | Full instruction type is namespaced under the object metadata; parameters are `(object constrained to DummyObject, expression, string)` and runtime method name is `myMethod`. The object parameter is mandatory and is consumed as the receiver rather than forwarded as a normal method argument. |
| Editor renderer | module hook, not `PlatformExtension` metadata | Registers `MyDummyExtension::DummyObject`; uses the editor's `RenderedInstance` and `PIXI` and reads dynamically cast `ObjectJsImplementation.content`. It is not exported into a game. |

`PropertyDescriptor` types and `ParameterMetadata` types are string identifiers.
They are therefore open-ended at the binding boundary. Common parameter values
include `expression`/`number`, `string`, `object`/`objectList`, `behavior`,
`boolean`, `variable`, and `layer`; supplementary information constrains an
object or behavior type. Do not replace these with a closed Kotlin enum unless
unknown values round-trip losslessly. Parameter optionality, default value,
extra information, and `codeOnly` status are part of the signature too.

The example's editor adapters also show the serialization boundary:
`ObjectJsImplementation.content` is an ordinary object (`property1`,
`property2`, `property3`, `myImage`); behavior content uses raw named attributes
(`property1`, `property2`); initial instances use `instanceprop1` and
`instanceprop2`; shared behavior data uses `sharedProperty1`. Labels such as
“My first property” are UI keys and are deliberately different from serialized
field names. A port must call the initializer for new values while retaining
unknown JSON members when loading and saving old projects.

### Runtime linkage and lifecycle

Metadata include files are the bridge between discovery and executable code:

* `examplejsextensiontools.ts` creates the global
  `gdjs.evtTools.exampleJsExtension` functions. It also registers scene-loaded,
  scene-unloaded, and object-deleted callbacks at script evaluation time.
* `dummyruntimebehavior.ts` extends `gdjs.RuntimeBehavior`, reads
  `behaviorData.property1`, implements hot reload through
  `applyBehaviorOverriding`, runs `doStepPreEvents`/`doStepPostEvents`, and
  registers its constructor under the exact full type
  `MyDummyExtension::DummyBehavior`.
* `dummywithshareddataruntimebehavior.ts` additionally reads initial shared
  data. Its final registration currently maps the shared-data name to
  `gdjs.DummyRuntimeBehavior`; a replacement must emulate persisted behavior of
  existing releases or treat a correction as an explicit migration, not infer
  a class from the filename.
* `dummyruntimeobject.ts` extends `gdjs.RuntimeObject`, reads
  `objectData.content`, creates `gdjs.DummyRuntimeObjectRenderer`, calls
  `onCreated()` last, handles hot reload, delegates position/angle/opacity to
  the renderer, exposes `myMethod(number1, text1)`, and calls
  `gdjs.registerObject` with the full type.
* `dummyruntimeobject-pixi-renderer.ts` constructs `PIXI.Text` and attaches it
  to the layer renderer. It must be evaluated before an object is instantiated,
  and after PIXI and base runtime classes exist.
* `dummyeffect.ts` constructs a `PIXI.Filter` and registers a filter creator as
  `MyDummyExtension::DummyEffect`. Its typed property buckets
  (`doubleParameters`, `stringParameters`, `booleanParameters`) must agree with
  metadata property types.

Runtime lifecycle names are protocol names: object construction and
`onCreated`, object `update` and data hot reload, behavior construction,
`applyBehaviorOverriding`, `onDeActivate`, `doStepPreEvents`, and
`doStepPostEvents`, renderer update/removal, effect creation/parameter updates
and pre-render, and registered scene callbacks. Kotlin methods may be idiomatic
internally, but the compatibility adapter must dispatch these exact hooks at the
same points.

### From metadata to generated calls and export

The complete dependency chain is:

```text
JsExtension.js
  addAction/addCondition/addExpression + parameter list
  CodeExtraInformation.functionName + includeFiles
        |
        v
gd.JsPlatform / MetadataProvider
        |
        +--> editor discovery and parameter validation
        |
        v
GDJS EventsCodeGenerator (instruction/expression generators)
  validates/serializes arguments in metadata order
  emits direct global call, receiver method call, or generated events function
  accumulates metadata includeFiles
        |
        v
GDJS/GDJS/IDE/ExporterHelper.cpp
  UsedExtensionsFinder include files
  + EffectsCodeGenerator effect includes
  + generated scene/function code files
  + project source files at "first"/"last"
        |
        v
index.html script order and copied Runtime/Extensions files
        |
        v
gdjs.evtTools...(...), object.myMethod(...), registerObject/registerBehavior,
and PixiFiltersTools creator lookup at runtime
```

`ExporterHelper::ExportScenesEventsCode` generates one `codeN.js` per layout,
merges the generator's includes, and appends that generated file. Effect
includes are added after engine libraries so their evaluation can self-register.
`ExportIncludesAndLibs` resolves relative paths under `<GDJS Root>/Runtime`,
copies them while preserving their relative names, and copies absolute generated
files by basename. `ExportIndexFile` starts with the collected includes and
inserts resource-backed source dependencies marked `first` at the front or
`last` at the back. `CompleteIndexFile` then materializes the ordered script
tags. This ordering is observable whenever a file mutates `gdjs`, registers a
constructor, or expects PIXI/Three to exist.

## Other declaration paths

### A C++ `JsExtension.cpp`: AnchorBehavior

`Extensions/AnchorBehavior/JsExtension.cpp` is IDE-only C++. Its
`AnchorBehaviorJsExtension` constructor calls the shared
`DeclareAnchorBehaviorExtension` declaration, looks up the fully qualified
`AnchorBehavior::AnchorBehavior` metadata, attaches
`anchorruntimebehavior.js`, and finalizes compilation information. Native builds
export `CreateGDJSExtension`; Emscripten builds export a uniquely named factory.
This path creates the same `gd::PlatformExtension` graph as the JavaScript
declaration, but at C++ compile/link time. It does **not** imply a C++ game
runtime: the GDJS linkage is still its JavaScript include.

Built-in declarations such as
`Core/GDCore/Extensions/Builtin/SpriteExtension/SpriteExtension.cpp` are linked
into the core/platform and populate object actions, conditions, and expressions
through the same metadata classes. The distinction is packaging and lifetime,
not a different event ABI.

### A project-embedded events-functions extension

`GDJS/tests/games/events-based-behaviors/Basic EventsBasedBehavior test.json`
contains a concrete `eventsFunctionsExtensions` array named
`NewEventsFunctionsExtension`. Its free functions have serialized
`functionType`, name, sentence, ordered parameter descriptors, and event trees;
its `eventsBasedBehaviors` contain behavior functions and properties. An event
instruction refers to values such as
`NewEventsFunctionsExtension::MyBehavior::PropertyAddedNumber`, while behavior
parameters carry supplementary type
`NewEventsFunctionsExtension::MyBehavior`.

At project load/editor refresh,
`MetadataDeclarationHelper::DeclareExtension` adapts this persisted model into a
normal `PlatformExtension`: it copies display metadata, dependencies, and all
source files; declares free functions, custom objects, behaviors, properties,
and their generated accessor instructions. Conventions are explicit: an object
instruction's first parameter is the object, while a behavior instruction's
first two are object then behavior. Generated property accessors are private.
`EventsFunctionsExtensionCodeGenerator` compiles event trees to JavaScript and
registers reserved lifecycle functions (`onFirstSceneLoaded`, `onSceneLoaded`,
`onScenePreEvents`, `onScenePostEvents`, `onScenePaused`, `onSceneResumed`, and
`onSceneUnloading`) as GDJS callbacks; lifecycle functions must have no
parameters. It unregisters old callbacks before re-registering, enabling hot
reload.

Unlike an installed declaration, this extension is persisted inside the
project's `eventsFunctionsExtensions` JSON and can be edited without rebuilding
the editor. Installed events-based extensions use the same model but retain
origin/version information and are copied into a project.

## Portability matrix

Legend: **Yes** = direct/natural target; **Host** = feasible through an explicit
compatibility host; **Rewrite** = runtime implementation must be ported; **N/A**
= metadata or code has no direct runtime meaning on that target.

| Mechanism | Declaration format | Persistence location | Editor discovery | Type checking | Code-generation integration | Runtime linkage | Lifecycle | Kotlin/JVM | Kotlin/JS | Android | Kotlin/Native |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Built-in extensions | C++ metadata constructors | Editor/core binary; use recorded in project | Registered during platform initialization | C++ metadata plus editor validators | Native metadata queried by generators | Usually GDJS runtime includes/builtins | Process/platform lifetime | **Rewrite/Host** C++ graph | **Host** existing Emscripten metadata | **Rewrite** | **Rewrite/Host** C ABI |
| `JsExtension.cpp` | IDE-only C++ factory plus JS/TS runtime | Compiled extension library; use in project JSON | Factory loaded/linked by platform | C++ compiler for declaration; stringly parameters | Same `PlatformExtension` metadata | `includeFiles` point to JS | Factory/platform lifetime; runtime registration on script load | **Host** JNI/JNA or rewrite | **Host** Emscripten | **Host/Rewrite** | **Host** C interop or rewrite |
| `JsExtension.js` | Executable CommonJS returning bound `PlatformExtension` | Copied runtime module; use in project JSON | Filesystem scan (Electron) or static browser list | `//@ts-check` + `.d.ts`, runtime sanity checks; metadata remains dynamic | Same metadata/function-name bridge | Global JS includes and registrations | Module evaluation, optional editor hooks, runtime callbacks | **Host** JS engine or schema migration | **Yes/Host** | **Host** WebView/JS engine or rewrite | **Host** embedded JS or rewrite |
| Events-based extensions | Serialized extension/functions/entities/event trees | Project `eventsFunctionsExtensions` (or installed extension copied there) | Project loader + metadata adapter | Editor diagnostics against synthesized metadata | Event trees generate JS functions and includes | Generated `code*.js`, callbacks, custom entity code | Project lifetime; callback unregister/register on hot reload | **Rewrite** generator/runtime or run JS | **Yes** with existing generator | **Rewrite/Host** | **Rewrite** |
| Custom objects | `eventsBasedObjects` with layouts, properties, variants, functions | Inside an events extension in project JSON | Synthesized object metadata/editor model | Metadata constraints + event diagnostics | `ObjectCodeGenerator` creates class/functions | Generated JS plus base/default object includes | construct, `onCreated`, update, hot reload, destroy | **Rewrite** object/runtime APIs | **Yes** | **Rewrite** render/runtime | **Rewrite** render/runtime |
| Custom behaviors | `eventsBasedBehaviors`, properties/shared properties/functions | Inside an events extension in project JSON | Synthesized behavior metadata | Object-type and behavior parameter constraints | `BehaviorCodeGenerator` creates class/functions/accessors | Generated JS registered by full type | pre/post events, activation, hot reload/shared data | **Rewrite** | **Yes** | **Rewrite** | **Rewrite** |
| JavaScript code events | `BuiltinCommonInstructions::JsCode` with `inlineCode` and parameter names | Event tree in project JSON | Built-in event metadata/editor | JS syntax/tooling only; arbitrary effects defeat static guarantees | `JsCodeEvent` injects code into generated function scope | Executes in GDJS global/runtime context | Whenever event position is reached | **Host** JS engine; otherwise unsupported/rewrite | **Yes** | **Host** or unsupported | **Host** or unsupported |
| External source dependencies | `SourceFileMetadata` referencing project resources, with `first`/`last` position | Extension JSON plus resource entry/file | Project resource/source-file editors | Contents are opaque; host toolchain may check them | Exporter merges them into final include list | Script tag/global side effects | Evaluation order before/after collected runtime code | **Host** JS engine or target-specific dependency | **Yes** | **Host/Rewrite** | **Host/Rewrite** |

“Android” above means a Kotlin/Android runtime rather than merely packaging the
current HTML5 game in a WebView. A WebView retains the Kotlin/JS column's answers
but is not a native Kotlin replacement. Kotlin/Native likewise cannot consume
JavaScript globals without embedding a JS engine.

## Stable identifiers and compatibility rules

A replacement must treat the following as versioned data:

1. **Instruction and expression type names.** Preserve the exact serialized
   strings, including case, old aliases, namespace separators, and whether a
   function is free, object-scoped, or behavior-scoped. Never derive an ID from
   a translated label. Conditions also preserve inversion in the event node.
2. **Fully qualified entity/effect types.** Preserve
   `Extension::Object`, `Extension::Behavior`, and `Extension::Effect` (and the
   repository's variant full-type convention). These keys join editor metadata,
   project JSON, generated constructors, and runtime registries. Renames require
   aliases plus a project migration.
3. **Parameter order and value types.** Generated calls are positional. Keep
   implicit object first and behavior second conventions, receiver consumption,
   `codeOnly` parameters, optional/default flags, value-type identifiers, and
   supplementary object/behavior constraints. Adding a required parameter in
   the middle is breaking; safe evolution normally appends an optional/defaulted
   parameter while the generator accepts old arities.
4. **Lifecycle names and timing.** Keep the reserved events-extension names and
   zero-parameter rule, GDJS registration function names, pre/post-events
   ordering, scene load/pause/resume/unload timing, object creation/deletion,
   behavior activation, renderer update, effect pre-render, and hot-reload
   cleanup semantics.
5. **Serialization shape.** Round-trip unknown fields. Retain
   `eventsFunctionsExtensions`, function/entity arrays, event instruction
   `{type: {value, inverted}, parameters, subInstructions}`, ordered parameter
   descriptors, object `content`, behavior attributes/shared data, instance raw
   properties, extension origin/dependency/source-file records, and property
   defaults as their historical JSON representations (often strings even for
   typed properties).
6. **Extension dependencies.** Preserve dependency name/type/export name/version
   and transitive extension dependencies. Resolve dependencies before metadata
   validation and before runtime registration; do not silently substitute an
   incompatible package version.
7. **Source-file ordering.** Preserve declaration order where dependencies exist
   (the dummy object's renderer must precede object construction), de-duplicate
   the same way as the exporter, keep engine libraries before self-registering
   effects, append generated scene/function files in deterministic order, and
   honor external sources' explicit `first`/`last`. Kotlin collections must not
   accidentally turn these sequences into unordered sets.
8. **Unknown types and legacy defects.** Loading must be tolerant and saving
   lossless. Report an unresolved type rather than coercing it to a similarly
   named class. Compatibility describes observed IDs and registrations, not what
   a port believes the author intended.

## JavaScript-specific mechanisms and porting classification

| Mechanism | Repository example | Classification | Kotlin boundary |
|---|---|---|---|
| Plain metadata/value model | names, descriptors, dependencies, parameters, source-file records | **Reusable** | Define serializable Kotlin data classes with ordered lists and an unknown-field bag; validate through registries keyed by strings. |
| C++ `PlatformExtension` bindings | `new gd.PlatformExtension()`, chained dynamic setters | **Adaptable behind a host interface** | Expose `ExtensionProvider`/builder interfaces; translate legacy bound objects into the neutral model. |
| CommonJS/filesystem discovery | `module.exports`, `require`, directory scan | **Adaptable behind a host interface** | JVM/Android host may scan signed packages; browser uses a generated manifest; Native uses linked providers. Keep legacy JS loading optional. |
| JavaScript globals and dynamic property access | `gd`, `gdjs`, `PIXI`, `object.content.property1`, `behaviorData[property]`, dotted function names | **Adaptable behind a host interface** for Kotlin/JS; **requires Kotlin implementation** elsewhere | Use typed registries (`InstructionTarget`, `ObjectFactory`, `BehaviorFactory`, `EffectFactory`) instead of resolving a dotted global dynamically. Preserve a legacy resolver only inside a JS host. |
| Generated direct calls | `gdjs.evtTools...myConditionFunction(...)`, receiver `myMethod(...)` | **Reusable semantics, target-specific emitter** | Generate Kotlin calls or interpreter opcodes from the same ordered metadata; JS backend can retain existing emission. |
| Runtime object/behavior model | subclassing `gdjs.RuntimeObject`/`RuntimeBehavior`, callback registries | **Requires Kotlin implementation** off JS | Specify lifecycle interfaces and schedulers in common Kotlin; adapters implement GDJS hooks on JS and native loops elsewhere. |
| Browser APIs | DOM, `window`, network/storage APIs used by extensions | **Adaptable behind a host interface** where a platform equivalent exists; otherwise **requires implementation** | Capability interfaces for windowing, storage, HTTP, sensors, files, authentication, and permissions; reject unsupported capabilities at install/export time. |
| PixiJS rendering/effects | dummy renderer's `PIXI.Text`; effect's `PIXI.Filter`, shader, texture manager | **Requires Kotlin implementation** on JVM/Android/Native; **reusable** on Kotlin/JS | Define renderer/effect/texture interfaces. Kotlin/JS adapters wrap PixiJS; Android/Native need a graphics backend and shader/uniform mapping. |
| Three.js/3D globals | runtime's untransformed `three.js`/`ThreeAddons.js` and 3D extensions | **Requires Kotlin implementation** off JS; **reusable/adaptable** on Kotlin/JS | Isolate scene graph, asset loading, materials, and renderer behind the same host capability approach as PixiJS. |
| Arbitrary JavaScript code events | `JsCodeEvent.inlineCode` inserted into generated output | **Requires a JS host or a Kotlin implementation/migration** | There is no sound automatic translation. Keep an embedded sandboxed engine, restrict the feature, or require users to rewrite it as Kotlin/plugin APIs. |
| `eval`-like name/code execution | inline code and string-to-global/member resolution used by generated metadata targets | **Adaptable only inside a JS host; otherwise requires implementation** | Do not use JVM reflection as a general substitute. Resolve stable IDs through allow-listed registries and compile event trees to typed IR. |
| Editor-only renderer hooks | `registerEditorConfigurations` and `registerInstanceRenderers` | **Adaptable behind a host interface** | Keep these out of game runtime packages; provide editor plugin services and a placeholder renderer when a host is unavailable. |

No explicit `eval(...)` is needed by `ExampleJsExtension`; the equivalent risks
are arbitrary inline JavaScript and resolving string metadata against mutable
global objects. Both bypass Kotlin's static type system. The recommended
architecture is therefore **serialized metadata → validated, target-neutral IR
→ platform registry calls**, with JS compatibility isolated at the edges.

## Suggested Kotlin migration sequence

1. Freeze golden JSON and generated-JavaScript fixtures for the examples above,
   including identifiers, argument order, include order, and lifecycle output.
2. Implement the lossless metadata/project model and string-keyed registries in
   Kotlin common code; initially compare it against `gd.PlatformExtension`
   snapshots produced by the current editor.
3. Put the existing C++/Emscripten and JavaScript module loaders behind provider
   adapters. This keeps all three installed-extension declaration styles usable
   while Kotlin becomes the consumer of the neutral graph.
4. Port events metadata declaration and diagnostics, then emit the existing
   GDJS output from the neutral IR. Kotlin/JS can validate parity without also
   replacing the runtime.
5. Define common lifecycle, rendering, effects, resources, and platform
   capabilities. Replace GDJS implementations backend by backend; classify each
   extension at installation time by required capabilities.
6. Treat JavaScript code events and opaque external scripts as an explicit
   compatibility tier. They must never silently run with different globals,
   ordering, permissions, or lifecycle behavior.
