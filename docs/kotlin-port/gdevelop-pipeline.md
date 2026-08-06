# GDevelop project-to-runtime pipeline (Kotlin port trace)

> **Living trace.** This document describes the implementation in this checkout, not a
> promised file format or API. Every claim names the repository evidence that supports
> it. Items marked **Version-dependent/uncertain** need re-validation when generators,
> export options, or the runtime change.

## 1. Editor JSON to `gd::Project`

### Storage and reader path

1. A storage provider returns a parsed JavaScript object as `content`. Local files use
   `readJSONFile` and then `unsplit` split-project references in
   `newIDE/app/src/ProjectsStorage/LocalFileStorageProvider/LocalProjectOpener.js::onOpen`;
   cloud projects unzip the first archive entry and call `JSON.parse` in
   `newIDE/app/src/ProjectsStorage/CloudStorageProvider/CloudProjectOpener.js::generateOnOpen`.
2. `newIDE/app/src/MainFrame/index.js::openFromFileMetadata` calls the selected
   provider's `onOpen`, validates the object with `verifyProjectContent`, and converts it
   with `gd.Serializer.fromJSObject`. `loadFromSerializedProject` creates a GDJS project
   through `gd.ProjectHelper.createNewGDJSProject()` and invokes the bound
   `gdProject.unserializeFrom(SerializerElement)`.
3. The generic bridge used elsewhere for the same boundary is
   `newIDE/app/src/Utils/Serializer.js::unserializeFromJSObject`: it builds a
   `gd.SerializerElement`, dispatches the requested bound method (optionally with a
   project first), then deletes the temporary Embind object. Its inverse,
   `serializeToJSObject`/`serializeToJSON`, calls the bound `serializeTo`, converts with
   `gd.Serializer.toJSON`, and frees the element. Main project opening uses the direct
   equivalent above, rather than `unserializeFromJSObject` itself.

The C++ entry points are `gd::Project::UnserializeFrom` and
`gd::Project::SerializeTo` in `Core/GDCore/Project/Project.cpp`, declared in
`Core/GDCore/Project/Project.h`. Their bindings expose the lower-case JavaScript names
used above (the generated/binding surface is consumed as `gdProject` by
`newIDE/app/src/Utils/Serializer.js`).

### Top-level JSON sections consumed

This is the current `Project::UnserializeFrom`/`SerializeTo` contract in
`Core/GDCore/Project/Project.cpp`; legacy aliases accepted by `GetChild` are shown in
parentheses.

| JSON section | C++ consumer / contents |
|---|---|
| `gdVersion`, `initialGDVersion` | `gd::Project::UnserializeFrom`; source-version compatibility and initial-version bookkeeping. |
| `properties` | `gd::Project::UnserializeFrom`; identity/description/version/author, resolution and FPS, scaling/pixel/antialiasing/orientation, UUID/package/template/folder flags, author IDs/usernames/categories/devices, preload/unload policy, plus `PlatformSpecificAssets::UnserializeFrom`, `LoadingScreen::UnserializeFrom`, `Watermark::UnserializeFrom`, `ExtensionProperties::UnserializeFrom`, and `platforms`/`currentPlatform`. |
| `eventsFunctionsExtensions` | `Project::UnserializeAndInsertExtensionsFrom`; declaration names/types first, default object variants second, implementations third, and backed-up variants last so nested custom types can resolve. |
| `objectsGroups` (`ObjectGroups`) | `ObjectGroupsContainer::UnserializeFrom`. |
| `resources` (`Resources`) | `ResourcesContainer::UnserializeFrom` in `Core/GDCore/Project/ResourcesContainer.cpp`; dispatches typed image/audio/font/video/JSON/tilemap/tileset/bitmap-font/model/atlas/JavaScript/editor-SVG resources. |
| `objects` (`Objects`) | `ObjectsContainer::UnserializeObjectsFrom`; each `Object::UnserializeFrom` in `Core/GDCore/Project/Object.cpp` restores variables, effects, behaviors, and type configuration. |
| `objectsFolderStructure` | `ObjectsContainer::UnserializeFoldersFrom`, followed by `AddMissingObjectsInRootFolder`. |
| `variables` (`Variables`) | `VariablesContainer::UnserializeFrom`. |
| `layouts` (`Scenes`) | Array consumed by `Project::UnserializeFrom`; each element becomes a `gd::Layout` and is passed to `Layout::UnserializeFrom` in `Core/GDCore/Project/Layout.cpp` (UI settings, objects/folders/groups, variables, instances, layers, events and behavior shared data). |
| `firstLayout`, `previewLayout` | `Project::UnserializeFrom` selects startup/preview layouts. **Version-dependent:** the serializer writes these as root attributes while the serializer abstraction presents them through `GetChild`; do not infer a raw JSON representation without checking `SerializerElement`. |
| `externalEvents` (`ExternalEvents`) | Array; `ExternalEvents::UnserializeFrom`. |
| `externalLayouts` (`ExternalLayouts`) | Array; `ExternalLayout::UnserializeFrom`. |

`Project::SerializeTo` emits the same major sections and delegates nested output to the
same model classes in `Core/GDCore/Project/Project.cpp`. The editor may request canonical
event serialization by temporarily toggling the global `gd.Serializer` flag in
`newIDE/app/src/Utils/Serializer.js::withSerializationOptions`; this changes defaults/key
ordering, not the model pipeline.

## 2. Preview and full export

### Editor entry points

`newIDE/app/src/MainFrame/index.js` funnels preview requests into the configured
`PreviewLauncher`. The concrete current launchers are
`newIDE/app/src/ExportAndShare/LocalExporters/LocalPreviewLauncher/index.js` and
`newIDE/app/src/ExportAndShare/BrowserExporters/BrowserSWPreviewLauncher/index.js`.
They configure `gd.PreviewExportOptions`, invoke the bound GDJS exporter, and can call
`gd.Exporter.serializeProjectData` for hot reload. Export UI/implementations live under
`newIDE/app/src/ExportAndShare`, not the removed `newIDE/app/src/Export` path.

The native entry points are `gdjs::Exporter::ExportProjectForPixiPreview` and
`ExportWholePixiProject` in `GDJS/GDJS/IDE/Exporter.cpp`. Preview delegates to
`ExporterHelper::ExportProjectForPixiPreview`; full export orchestrates the helper and
target-specific completion.

### Ordered phases (and deliberately different orderings)

#### Preview / incremental preview

1. **Preparation/clone:** create/clear the output directory as requested, reset include
   lists, copy `options.project` to mutable `exportedProject`, and retain
   `immutableProject` because generation can consume cached AST
   (`ExporterHelper::ExportProjectForPixiPreview`, `GDJS/GDJS/IDE/ExporterHelper.cpp`).
2. **Resource exposure or copying:** in-game edition resolves original absolute paths
   with `ResourcesMergingHelper` + `ResourceExposer::ExposeWholeProjectResources`;
   ordinary preview calls `ExportResources` / `ProjectResourcesCopier::CopyAllResourcesTo`.
   Deprecated bare font files are then added where data/code is being refreshed
   (`ExporterHelper.cpp`).
3. **Dependency and extension/source collection:** when libraries reload,
   `UsedExtensionsFinder::ScanProject` supplies include files, required files, source
   files, 3D use, and in-game-editor resources; `AddLibsInclude` adds the runtime and
   debugger/editor variants, and event-based object/behavior generated sources are
   collected for editable previews (`ExporterHelper.cpp`).
4. **Effects and event generation:** `ExportEffectIncludes` adds auto-registering effect
   scripts, then `ExportScenesEventsCode` uses `LayoutCodeGenerator` to emit scene event
   files. Generation deliberately uses `immutableProject` while resource-renamed
   `exportedProject` supplies export data (`ExporterHelper.cpp`).
5. **Project stripping/data emission:** `ExportProjectData` calls
   `StripAndSerializeProjectData`. That function finds project-, scene-, object-, and
   event-based-object resources with `SceneResourcesFinder`, optionally adds editor
   resources, calls `ProjectStripper::StripProjectForExport`, serializes through
   `Project::SerializeTo`, and augments `usedResources` arrays
   (`GDJS/GDJS/IDE/ExporterHelper.cpp`). Stripping occurs *after* event generation.
6. **Runtime/dependency copying:** `ExportIncludesAndLibs` copies collected scripts,
   required files, and source maps; `ExportIndexFile` fills the runtime template and
   script tags (`ExporterHelper.cpp`).
7. **Packaging:** preview stops at a runnable directory/index; there is no Cordova,
   Electron, or archive packaging in `ExportProjectForPixiPreview`.

Incremental flags can skip any refresh group, and a no-op in-game-editor request returns
early (`ExporterHelper::ExportProjectForPixiPreview`). **Version-dependent:** therefore
the seven phases describe their dependency order when selected, not a guarantee that
every preview invocation executes every phase.

#### Full export

1. `Exporter::ExportWholePixiProject` clones `options.project`, immediately runs
   `UsedExtensionsFinder::ScanProject`, applies fallback author identity, and prepares a
   target directory (`GDJS/GDJS/IDE/Exporter.cpp`).
2. It copies/renames resources, adds legacy font resources, then collects core runtime
   libraries, used include/required/source files, and effects
   (`Exporter.cpp::exportProject`, `ExporterHelper::{ExportResources,AddLibsInclude,ExportEffectIncludes}`).
3. `ExporterHelper::ExportScenesEventsCode` generates scene code; only afterwards
   `ExportProjectData` performs resource analysis and `ProjectStripper` stripping and
   writes `data.js` (`Exporter.cpp`, `ExporterHelper.cpp`).
4. `ExportIncludesAndLibs` copies runtime/generated/dependency files and
   `ExportIndexFile` injects includes plus used source files into the target-specific
   HTML template (`Exporter.cpp`).
5. Target completion is selected last: `ExportCordovaFiles`, `ExportElectronFiles` plus
   `ExportBuildResourcesElectronFiles`, `ExportFacebookInstantGamesFiles`, or
   `ExportHtml5Files` (`Exporter::ExportWholePixiProject`). **Uncertain:** this layer
   prepares target output; any later zip/build/upload performed by editor or services is
   outside these two C++ files and is not claimed here.

## 3. Event compilation stages

| Stage | Input model and metadata | Generated output | Downstream consumer |
|---|---|---|---|
| Event lowering | `gd::EventsList` plus `gd::Project`, layout/function context and namespace in `GDJS/GDJS/Events/CodeGeneration/EventsCodeGenerator.cpp::GenerateEventsListCompleteFunctionCode`, `GenerateLayoutCode`, and the three `Generate*EventsFunctionCode` variants. Base `gd::EventsCodeGenerator` and `MetadataProvider` resolve `InstructionMetadata`, `ExpressionMetadata`, object/behavior metadata, parameter types and required include files. | JavaScript function bodies, object-list declarations/resets, condition/action/expression calls, parameter/context maps and function return handling. | Layout, free-function, behavior, and object generators; ultimately scene `_eventsFunction` or registered callable namespaces. |
| Layout wrapper | `gd::Layout` and project in `LayoutCodeGenerator::GenerateLayoutCompleteCode` (`GDJS/GDJS/Events/CodeGeneration/LayoutCodeGenerator.cpp`); `SceneNameMangler` provides a safe namespace. | Complete scene events JS plus an exported `gdjs['<mangled>Code']` namespace. | `ExporterHelper::ExportScenesEventsCode` writes `codeN.js`; `RuntimeScene::setEventsGeneratedCodeFunction` in `GDJS/Runtime/runtimescene.ts` selects its `func`. |
| Events-based object class | `gd::EventsBasedObject`, its properties and object methods in `ObjectCodeGenerator::GenerateRuntimeObjectCompleteCode` (`GDJS/GDJS/Events/CodeGeneration/ObjectCodeGenerator.cpp`); property value types use `ValueTypeMetadata`, methods delegate to `EventsCodeGenerator::GenerateObjectEventsFunctionCode`. | A `CustomRuntimeObject` subclass/template: initialization/update accessors, lifecycle/pre-event methods, and generated method functions. | Generated registration makes the constructor available through `gdjs.getObjectConstructor`; `RuntimeInstanceContainer`/scene object creation instantiates it from object data. |
| Events-based behavior class | `gd::EventsBasedBehavior`, instance/shared properties and methods in `BehaviorCodeGenerator::GenerateRuntimeBehaviorCompleteCode` (`GDJS/GDJS/Events/CodeGeneration/BehaviorCodeGenerator.cpp`); property/network types use `ValueTypeMetadata`, methods use `GenerateBehaviorEventsFunctionCode`. | A runtime behavior class/template with property accessors, shared-data access, lifecycle/pre-event methods, hot-update and network synchronization code. | Generated behavior registration is resolved by `gdjs.getBehaviorConstructor`; `RuntimeObject` constructor/add-new-behavior in `GDJS/Runtime/runtimeobject.ts` instantiates it. |
| Extension free/lifecycle function | `gd::EventsFunctionsExtension` + `gd::EventsFunction` in `EventsFunctionsExtensionCodeGenerator::GenerateFreeEventsFunctionCompleteCode` (`GDJS/GDJS/Events/CodeGeneration/EventsFunctionsExtensionCodeGenerator.cpp`); function parameters and lifecycle-name classification come from model metadata/helpers. | Free-function JS plus cleanup/re-registration code; recognized lifecycle names generate calls to `gdjs.register*Callback`. | Calls from compiled events consume free functions; callback arrays in `GDJS/Runtime/gd.ts` are consumed during scene load, pre-events, post-events, pause/resume, and unload. |

**Version-dependent:** exact generated identifiers and templates are implementation details
in these generator `.cpp` files; a Kotlin port should preserve semantic inputs/outputs
and registration order rather than hard-code current textual JS.

## 4. Runtime startup and first event frame

`ExporterHelper::ExportProjectData` writes `gdjs.projectData = ...` to `data.js` in
`GDJS/GDJS/IDE/ExporterHelper.cpp`. The exported `GDJS/Runtime/index.html` constructs
`new gdjs.RuntimeGame(gdjs.projectData, options)`, calls `loadAllAssets`, then
`startGameLoop`. `RuntimeGame`'s constructor and `setProjectData` in
`GDJS/Runtime/runtimegame.ts` retain project data, build scene/extension lookup data,
initialize variables/managers/renderer/`SceneStack`, and configure the resource loader.

`RuntimeGame.startGameLoop` chooses the requested or `firstLayout` scene and calls
`SceneStack.replace`. `SceneStack::_loadNewScene` in `GDJS/Runtime/scenestack.ts` creates
a `RuntimeScene` and calls `loadFromScene`. `RuntimeScene::loadFromScene` in
`GDJS/Runtime/runtimescene.ts` loads layers/variables/shared behavior data, registers
global then scene object definitions, creates initial instances, binds generated scene
events, and invokes load callbacks. Object construction resolves a constructor registered
with `gdjs.registerObject`; `RuntimeObject` in `GDJS/Runtime/runtimeobject.ts` resolves
each behavior using `gdjs.getBehaviorConstructor` and constructs it. Built-in and
generated extension scripts register those constructors/callbacks merely by being loaded
before scene creation (include ordering originates in `ExporterHelper.cpp`).

The renderer callback in `RuntimeGame.startGameLoop` advances `SceneStack.step`, which
calls `RuntimeScene.renderAndStep`. The frame order in
`GDJS/Runtime/runtimescene.ts::renderAndStep` is time update, asynchronous tasks,
object/behavior pre-events, registered extension pre-event callbacks, generated scene
events, behavior post-events, extension post-event callbacks, render, cleanup/input
updates, and requested scene-change handling in `SceneStack::step`.

```mermaid
sequenceDiagram
  participant D as data.js / gdjs.projectData
  participant H as Runtime/index.html
  participant G as gdjs.RuntimeGame
  participant S as gdjs.SceneStack
  participant R as gdjs.RuntimeScene
  participant O as Runtime objects/behaviors
  participant E as Generated scene code
  D->>H: assign exported JSON
  H->>G: new RuntimeGame(projectData, options)
  H->>G: loadAllAssets()
  H->>G: startGameLoop()
  G->>S: replace(firstLayout, clear=true)
  S->>R: new RuntimeScene(game)
  S->>R: loadFromScene(scene + extension data)
  R->>O: register definitions; create initial instances
  O->>O: getObjectConstructor / getBehaviorConstructor
  R->>E: bind mangled scene Code.func
  G->>S: renderer frame callback -> step(elapsed)
  S->>R: renderAndStep(elapsed)
  R->>O: pre-event behavior/object step
  R->>E: pre-event callbacks; scene func(runtimeScene)
  R->>O: post-event behavior step
  R->>E: post-event callbacks
  R-->>S: render + frame cleanup / change request
```

**Uncertain/version-dependent:** `RuntimeGame.startGameLoop` has in-game-editor and
network/hot-reload branches in `GDJS/Runtime/runtimegame.ts`; the diagram is the normal
exported-game, non-editor first-frame path. Asset loading is asynchronous, and the exact
renderer scheduling implementation varies by renderer; the stable observation here is
the callback contract used by `RuntimeGame`.
