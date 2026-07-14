# GDevelop Architecture — Low-Level Details, Principles & Conventions

Status: descriptive engineering reference. This document explains *how GDevelop is
built*: the layers, the data model, the events→code→runtime pipeline, the
extension/metadata system, the C++↔JS bridge, the serialization format and the
editor. It is written for contributors who need to reason about the internals,
not for game authors.

It complements, and goes deeper than, the existing high-level docs:

- `Core/GDevelop-Architecture-Overview.md` — the canonical short overview (read first).
- `newIDE/docs/How-are-exporters-and-platforms-working.md` — platforms & export.
- `newIDE/docs/Properties-schema-and-PropertiesEditor-explanations.md` — properties.
- `newIDE/docs/Supported-JavaScript-features-and-coding-style.md` — coding style.
- `docs/CustomObjectArchitecture.md` — deep dive on prefabs/events-based objects.
- `docs/StaticData.md` — the Static Data feature.

> Line numbers are accurate at time of writing and will drift. Treat file paths
> as canonical and line numbers as hints. All paths are relative to the repo root.

## Table of contents

1. [The four layers and the golden rule](#1-the-four-layers-and-the-golden-rule)
2. [Core data model (`gd::Project`)](#2-core-data-model-gdproject)
3. [Events, instructions & expressions](#3-events-instructions--expressions)
4. [Code generation & object picking](#4-code-generation--object-picking)
5. [The GDJS runtime (game engine)](#5-the-gdjs-runtime-game-engine)
6. [Extensions, metadata & platforms](#6-extensions-metadata--platforms)
7. [GDevelop.js — the C++↔JS bridge](#7-gdevelopjs--the-cjs-bridge)
8. [Serialization & the project file format](#8-serialization--the-project-file-format)
9. [The editor (newIDE)](#9-the-editor-newide)
10. [Cross-cutting conventions](#10-cross-cutting-conventions)
11. [End-to-end: a frame, from authoring to pixels](#11-end-to-end-a-frame-from-authoring-to-pixels)

---

## 1. The four layers and the golden rule

GDevelop is four codebases layered on top of one another. Each higher layer
depends on the ones below; nothing below knows anything about the layers above.

| Layer | Directory | Language | Role |
| --- | --- | --- | --- |
| **Core** | `Core/GDCore` | C++ | Describes and manipulates the *structure* of a game (`gd::Project`). Platform-agnostic model + IDE tools (refactoring, analysis, code-gen base). |
| **Platform / Engine** | `GDJS/GDJS` (C++) + `GDJS/Runtime` (TS) | C++ + TypeScript | `GDJS/GDJS` = the editor-side platform (export, code generation, builtin extension wiring). `GDJS/Runtime` = the actual game engine that runs in the browser. |
| **Extensions** | `Extensions/`, `Core/GDCore/Extensions/Builtin`, `GDJS/GDJS/Extensions/Builtin` | C++ + JS/TS | Objects, behaviors, actions, conditions, expressions. Builtins are the "standard library"; `Extensions/` are optional "plugins". |
| **Bindings + Editor** | `GDevelop.js` + `newIDE` | C++→WASM + JS/React | `GDevelop.js` compiles Core/GDJS/Extensions to WebAssembly so the editor (React, Electron/web) can drive the model. |

### The golden rule: IDE vs Runtime

The single most important distinction in the whole codebase
(`Core/GDevelop-Architecture-Overview.md:15-39`):

- **IDE / editor-time** code describes the *structure* of a game. It lives in
  `Core`, in any folder literally named `IDE`, and in `GDJS/GDJS`. It is
  compiled to WebAssembly and runs *inside the editor*.
- **Runtime / in-game** code is the game engine. It lives in `GDJS/Runtime`
  (TypeScript) and runs *inside the exported game*. There is no `gd::Project`,
  no metadata and no events at runtime — events have been *transpiled away* into
  plain JavaScript.

The canonical illustration is the `Variable` class, which exists twice and the
two halves barely know about each other:

- `gd::Variable` (`Core/GDCore/Project/Variable.h`) — editor model: serialized,
  undoable, shown in the UI.
- `gdjs.Variable` (`GDJS/Runtime/variable.ts`) — runtime twin: a lightweight,
  allocation-frugal object built from serialized JSON, optimized for per-frame
  access.

They communicate only through the JSON shape. This pattern — *a `gd::X` editor
model and a `gdjs.X` runtime model bridged only by serialized data* — repeats
for objects, behaviors, scenes, instances and the project itself. Keep it in
mind for every subsystem below.

### Why two languages

C++ for Core/engine-definition because it is portable and fast and was the
original language; TypeScript/JS for the runtime and editor because the web is
the primary target and React makes the UI tractable
(`Core/GDevelop-Architecture-Overview.md:107-122`). `GDevelop.js` (Emscripten)
is the bridge that lets the JS editor call the C++ model.

---

## 2. Core data model (`gd::Project`)

Everything an author creates is a tree rooted at `gd::Project`
(`Core/GDCore/Project/Project.h`). The model classes are plain C++ value types
in `Core/GDCore/Project/`. The recurring shape is **"a container owns a list of
named, serializable things"**.

### The project tree

```
gd::Project                                   Project.h
├── properties (name, version, window, FPS, projectUuid, platforms, loadingScreen…)
├── resourcesContainer        gd::ResourcesContainer   (images, audio, fonts, json…)
├── objectsContainer          gd::ObjectsContainer     (GLOBAL objects)
├── variables                 gd::VariablesContainer   (GLOBAL variables, SourceType::Global)
├── layouts[]                 gd::Layout               (scenes)
│   ├── objectsContainer      gd::ObjectsContainer     (scene objects)
│   ├── variables             gd::VariablesContainer   (SourceType::Scene)
│   ├── initialInstances      gd::InitialInstancesContainer
│   ├── layers                gd::LayersContainer
│   ├── events                gd::EventsList
│   └── behaviorsSharedData   (per behavior, per scene)
├── externalLayouts[]         gd::ExternalLayout
├── externalEvents[]          gd::ExternalEvents
└── eventsFunctionsExtensions[] gd::EventsFunctionsExtension  (events-based extensions)
    ├── eventsFunctions        (free functions)
    ├── eventsBasedBehaviors   gd::EventsBasedBehavior[]
    ├── eventsBasedObjects     gd::EventsBasedObject[]   (prefabs)
    ├── globalVariables        (SourceType::ExtensionGlobal)
    └── sceneVariables         (SourceType::ExtensionScene)
```

`gd::Project` exposes the children through ordinary accessors:
`GetLayout(name)` (`Project.h:592`), `GetResourcesManager()` (`Project.h:1019`),
`GetVariables()` (`Project.h:1063`), `GetEventsFunctionsExtension(name)`
(`Project.h:887`), `SetFirstLayout()`/`GetFirstLayout()` (`Project.h:855-860`).

### Objects, configurations and behaviors

A `gd::Object` (`Core/GDCore/Project/Object.h`) is a *name* + a *configuration*
+ containers for variables/behaviors/effects:

- `objectVariables` — `gd::VariablesContainer` (`Object.h:280-281`), `SourceType::Object`.
- `behaviors` — `gd::BehaviorsContainer`.
- `effectsContainer` — `gd::EffectsContainer`.
- `configuration` — a `gd::ObjectConfiguration` (the type-specific data; e.g. a
  Sprite's animations). For custom objects this is a `gd::CustomObjectConfiguration`.

The object/configuration split is what lets the same `gd::Object` machinery host
sprites, text, and prefabs without the model knowing the specifics — the
configuration is polymorphic and created by the platform's factory (see §6).

### Variables and scopes

`gd::VariablesContainer` (`Core/GDCore/Project/VariablesContainer.h`) is a list
of `gd::Variable` plus a `SourceType` recording *what kind of scope it is*
(`VariablesContainer.h:31-41`):

```cpp
enum SourceType {
    Unknown, Global, Scene, Object, Local,
    ExtensionGlobal, ExtensionScene, Parameters, Properties,
};
```

`gd::Variable` (`Core/GDCore/Project/Variable.h`) is recursive: a variable is a
number/string/boolean, or a **structure** (named children), or an **array**
(ordered children). `Parameters` and `Properties` are *synthetic* scopes:
function parameters and properties are converted into variable containers so
events can reference them by name (see §4 and `docs/CustomObjectArchitecture.md`).

Which containers are visible where is assembled by `gd::ProjectScopedContainers`
(`Core/GDCore/Project/ProjectScopedContainers.cpp`). For a scene it pushes
project + scene variables; for a prefab it deliberately pushes the *extension's*
variables instead of the project's, which is what makes prefabs reusable across
projects (detailed in `docs/CustomObjectArchitecture.md`).

### Properties

`gd::PropertyDescriptor` (`Core/GDCore/Project/PropertyDescriptor.h`) is the
typed, editor-facing field abstraction used by objects, behaviors and instances.
Unlike variables, properties carry UI metadata (`label`, `type`,
`measurementUnit`, `choices`, `hidden`, `quickCustomizationVisibility`) and, for
events-based entities, auto-generate public actions/conditions/expressions. See
`newIDE/docs/Properties-schema-and-PropertiesEditor-explanations.md` for the
declaration API and `docs/CustomObjectArchitecture.md` for properties-vs-variables.

### Naming & identity conventions

- **Names** are validated by `Project::IsNameSafe` (`Project.cpp:1372+`):
  non-empty, not starting with a digit, identifier characters only. Names are
  the primary key for objects/layouts/variables and the join key in events.
- **`persistentUuid`** — a random UUIDv4 (`Core/GDCore/Tools/UUID/UUID.h:19`)
  carried by `gd::Object`, `gd::Variable`, `gd::VariablesContainer` and
  `gd::InitialInstance`. It identifies "the same entity" across re-serializations
  for diffing, refactoring changesets and network sync. Generated lazily and
  written only when non-empty (`Object.cpp:133-160`, `Variable.cpp:334-335`),
  except `InitialInstance` which always writes it (`InitialInstance.cpp:152-153`).
- **`projectUuid`** — project/game identity, lives in `properties`, auto-generated
  on load if absent (`Project.cpp:924-926`), surfaced as the `gameId`.

---

## 3. Events, instructions & expressions

Events are GDevelop's visual programming language. The model lives in
`Core/GDCore/Events/`. There are **no events at runtime** — they are transpiled
to JavaScript by code generation (§4).

### The event model

- **`gd::BaseEvent`** (`Core/GDCore/Events/Event.h`) — abstract base for all
  event types. An event is "mostly empty"; think of it as a scope/block. It
  carries a string `type` (e.g. `"BuiltinCommonInstructions::Standard"`),
  `disabled`/`folded` flags (`Event.h:336-341`), optional sub-events
  (`CanHaveSubEvents`/`GetSubEvents`, `Event.h:76-86`), and optional event-local
  variables (`CanHaveVariables`/`GetVariables`, `Event.h:98-112`,
  `SourceType::Local`).
- Concrete events live in `Core/GDCore/Events/Builtin/`: `StandardEvent`,
  `WhileEvent`, `RepeatEvent`, `ForEachEvent`, `LinkEvent`, `CommentEvent`,
  `GroupEvent`, etc.
- **`gd::EventsList`** (`Core/GDCore/Events/EventsList.h`) — an ordered
  `std::vector<std::shared_ptr<BaseEvent>>` (`EventsList.h:210`). A scene's logic
  is one of these; events nest via sub-events.

### Instructions: conditions and actions are the same class

- **`gd::Instruction`** (`Core/GDCore/Events/Instruction.h`) — *"a member of an
  event: it can be a condition or an action"* (`Instruction.h:18-19`). It holds a
  `type` (the action/condition id, e.g. `"PositionX"`), an `inverted` flag (only
  meaningful for conditions, `Instruction.h:186`), `disabled`/`awaitAsync` flags,
  a `std::vector<gd::Expression> parameters`, and a `subInstructions` list (for
  Or/And/Not). Think of it as a function call: a name + arguments.
- **Conditions vs actions is purely contextual.** They are the *same* C++ class
  stored in different lists on the event (the conditions list vs the actions
  list) and resolved against a different metadata table (`GetConditionMetadata`
  vs `GetActionMetadata`). A condition is a function returning true/false that
  *also filters the picked objects* (see §4). `IsInverted()` applies only to
  conditions.
- **`gd::InstructionsList`** (`Core/GDCore/Events/InstructionsList.h`) — a
  shared-pointer list of instructions.

### Expressions

Every instruction parameter is a **`gd::Expression`**
(`Core/GDCore/Events/Expression.h`): a wrapper around a `plainString` plus a
lazily-parsed, cached AST (`node`). Parsing happens on first access via
`GetRootNode()` (`Expression.cpp:33-39`), which runs the recursive-descent
parser **`gd::ExpressionParser2`**
(`Core/GDCore/Events/Parsers/ExpressionParser2.h`).

The AST node types are in
`Core/GDCore/Events/Parsers/ExpressionParser2Node.h` and use the visitor pattern
(`Visit(ExpressionParser2NodeWorker&)`):

- literals: `NumberNode`, `TextNode`
- operators: `OperatorNode` (binary), `UnaryOperatorNode`, `SubExpressionNode`
- identifiers/variables: `IdentifierNode`, `VariableNode`,
  `VariableAccessorNode`, `VariableBracketAccessorNode`
- calls: `ObjectFunctionNameNode`, `FunctionCallNode` (carries `objectName`,
  `behaviorName`, `functionName`, parameters)
- `EmptyNode` — a placeholder for syntax errors, with attached diagnostics.

Each node stores rich source-position info, which is what powers in-editor error
underlining and autocompletion. The same AST is consumed by the validator, the
autocompletion engine and the code generator (`ExpressionCodeGenerator`, §4).

---

## 4. Code generation & object picking

Events are compiled to JavaScript. The compiler has two layers:

- **Platform-agnostic base** — `gd::EventsCodeGenerator`
  (`Core/GDCore/Events/CodeGeneration/EventsCodeGenerator.cpp`). Drives the
  *walk* over events → conditions/actions → parameters → expressions, and the
  control-flow scaffolding. It is generic and emits via virtual methods.
- **JS specialization** — `gdjs::EventsCodeGenerator`
  (`GDJS/GDJS/Events/CodeGeneration/EventsCodeGenerator.cpp`) overrides those
  virtuals to emit actual JavaScript.

### From an instruction to a function call

The link between an `gd::Instruction` and the JS it produces is **metadata**.
`gd::MetadataProvider::GetConditionMetadata` / `GetActionMetadata`
(`Core/GDCore/Extensions/Metadata/MetadataProvider.cpp`) look up the
`gd::InstructionMetadata` for the instruction's `type` string. That metadata
holds, in its nested `codeExtraInformation`
(`Core/GDCore/Extensions/Metadata/InstructionMetadata.h:438-459`):

- `functionCallName` — the JS function emitted (e.g.
  `gdjs.evtTools.camera.getCameraX`), set by `SetFunctionName(...)`.
- `asyncFunctionCallName` — used when the action is awaited.
- operator/getter/mutator info for "set/change value" instructions.
- `customCodeGenerator` — an escape hatch: a full `std::function` that emits the
  code itself, bypassing the standard path
  (`EventsCodeGenerator.cpp:324-327`, `:617-619`).
- `includeFiles` — runtime `.js` files this instruction needs, merged into the
  build's include set.

So a registered instruction `PositionX` with `SetFunctionName("setX")` becomes,
for each picked instance, `objectList[i].setX(args)`.

### Object picking — the defining concept

This is what makes GDevelop's events different from ordinary scripting. **An
object name in an event refers to a *dynamic list of currently-picked
instances*, not a single object.** Conditions *filter* that list; actions *apply
to every instance still in it*.

The generated code maintains, per object name and per scope depth, a JS array of
picked instances. The bookkeeping is tracked by
**`gd::EventsCodeGenerationContext`**
(`Core/GDCore/Events/CodeGeneration/EventsCodeGenerationContext.h`):

- `ObjectsListNeeded(name)` (`EventsCodeGenerationContext.cpp:71-82`) — records
  that the current scope needs object `name`'s list and stamps the depth.
- Each event gets its **own child context** via `InheritsFrom(parent)`
  (`.cpp:18-47`): *"Objects picked in an event are totally different from those
  picked in another"* (`EventsCodeGenerator.cpp:1122-1123`).
- Loop events call `ForbidReuse()` so each iteration re-picks cleanly.

Object list names are depth-suffixed globals — `GetObjectListName`
(`GDJS .../EventsCodeGenerator.cpp:1098-1102`) yields e.g.
`gdjs.sceneCode.GDPlayerObjects2` for `Player` at depth 2. All such arrays are
pre-declared and reset to `length = 0` once per frame
(`GenerateAllObjectsDeclarationsAndResets`).

**Filling a list** (`GenerateObjectsDeclarationCode`): from the scene
(`gdjs.copyArray(runtimeScene.getObjects("Player"), list)`) or by copying the
parent scope's list down to this depth (with a reuse optimization when the depth
is the same).

**Filtering in a condition** (`GenerateObjectCondition`,
`GDJS .../EventsCodeGenerator.cpp:852-895`) — the canonical in-place compaction:

```js
for (var i = 0, k = 0, l = list.length; i < l; ++i) {
    if ( list[i].functionCallName(args) ) {   // instance passes?
        isConditionTrue = true;
        list[k] = list[i];                    // keep it
        ++k;
    }
}
list.length = k;                              // shrink to only picked instances
```

**Iterating in an action** (`GenerateObjectAction`) — no filtering, just apply:

```js
for (var i = 0, len = list.length; i < len; ++i) {
    list[i].functionCallName(args);
}
```

Expressions participate identically: referencing `Player.X()` marks `Player`'s
list as needed at the current depth, exactly like a condition does
(`gd::ExpressionCodeGenerator`, which is itself an AST visitor accumulating a
string — `Core/GDCore/Events/CodeGeneration/ExpressionCodeGenerator.cpp`).

### Parameters → arguments

`GenerateParameterCodes` (`EventsCodeGenerator.cpp:883`) is the central switch
turning each parameter's *type string* into generated argument text:
expression/number/string/variable → run through the expression generator;
`object` → an object-list reference; `relationalOperator`/`operator` → quoted
strings; `yesorno`/`trueorfalse` → `true`/`false`; `inlineCode` → pasted
verbatim. The full type system is in §6.

### Output shape & the GC-avoidance split

- A **scene** compiles to a JS module assigned to `gdjs.<mangledName>Code` with a
  `.func = function(runtimeScene) {…}` entry (`GenerateLayoutCode`). The runtime
  fetches it via `setEventsGeneratedCodeFunction` and calls it every frame.
- To avoid one giant function (which stresses the JS engine's GC and caused lag
  on low-end Android), GDJS wraps **each events list in its own named
  sub-function** and the per-list state (object lists, condition booleans) lives
  in **module-global statics**, not locals
  (`GDJS .../EventsCodeGenerator.cpp:1193-1224`). This is a deliberate
  performance design, not an accident.
- **Functions/extensions** (events-based functions, behaviors, objects) compile
  with an `eventsFunctionContext` local that maps the function's
  object/behavior/parameter names to the *caller's* actual lists. The same
  picking machinery then works unchanged inside functions. `HasProjectAndLayout()`
  is the switch throughout code-gen choosing between scene-mode
  (`runtimeScene.*`) and function-mode (`eventsFunctionContext.*`).

---

## 5. The GDJS runtime (game engine)

The engine is TypeScript in `GDJS/Runtime/`. It consumes the exported
`gdjs.projectData` and the generated events code, and runs the game loop. The
class hierarchy mirrors the editor model but is optimized for per-frame speed.

### Boot & the game loop

- **`gdjs.RuntimeGame`** (`runtimegame.ts:191`) owns the global state: global
  `_variables`, the `ProjectData`, the renderer, the `_sceneStack`, the
  `_inputManager`, resource loaders.
- `startGameLoop()` (`runtimegame.ts:1255`) picks the first scene
  (`_data.firstLayout` unless overridden), loads it via the scene stack, and
  installs a frame callback through the renderer.
- The actual `requestAnimationFrame` loop lives in the renderer
  (`pixi-renderers/runtimegame-pixi-renderer.ts:1020`): it schedules the next
  frame *first*, computes `dt`, and calls the callback; if the callback returns
  false it cancels the loop.
- The per-frame callback (`runtimegame.ts:1324`) applies FPS capping with a
  7-frame margin, then (when not paused) calls `_sceneStack.step(elapsedTime)`.

### Scenes & instance containers

- **`gdjs.RuntimeScene`** (`runtimescene.ts:14`) extends
  **`gdjs.RuntimeInstanceContainer`** (`RuntimeInstanceContainer.ts:26`). The base
  holds instance storage and the generic stepping; the scene adds time,
  variables, events code and rendering.
- The per-frame step, `renderAndStep(elapsedTime)` (`runtimescene.ts:388`), in
  order:
  1. `_timeManager.update()` (clamps elapsed time to avoid tunneling)
  2. `_asyncTasksManager.processTasks()` (resolves "wait" actions)
  3. `_updateObjectsPreEvents()` — forces, object `update()`, timers, **behavior
     pre-events**
  4. pre-events callbacks
  5. **`this._eventsFunction(this)`** — the generated game logic
  6. `_stepBehaviorsPostEvents()` — **behavior post-events**
  7. post-events callbacks
  8. `render()`
  9. returns whether a scene change was requested.

This ordering is the contract behind GDevelop's lifecycle hooks:
`doStepPreEvents` runs before the events sheet, `doStepPostEvents` after it.

### Objects & behaviors

- **`gdjs.RuntimeObject`** (`runtimeobject.ts:163`) — base for all runtime
  objects. Core fields: `x`, `y`, `angle`, `zOrder`, `_nameId` (interned name id
  for fast comparison, `:2950`), `_variables`, hitboxes + `aabb` (lazy, guarded by
  `hitBoxesDirty`), forces, and **two** behavior collections: `_behaviors` (only
  behaviors with lifecycle functions, iterated each frame) and `_behaviorsTable`
  (all behaviors, keyed by name, for lookup).
- Lifecycle: `onCreated()` (`:301`), `onPlacedInScene()` (`:321`),
  `update()` (`:454`), `deleteFromScene()` (`:668`, defers actual removal),
  `onDeletedFromScene()` (`:691`), `onDestroyed()` (`:712`). Subclasses override
  the `on*` hooks, never `deleteFromScene` itself.
- **`gdjs.RuntimeBehavior`** (`runtimebehavior.ts:39`) — `stepPreEvents`/
  `stepPostEvents` wrappers gate on `_activated` and call the overridable
  `doStepPreEvents`/`doStepPostEvents`. `usesLifecycleFunction()` (`:268`)
  returns false for "capability" behaviors so they cost zero per-frame iteration.

### Capabilities

Cross-object features (opacity, scale, size, flip, animation, effects, text) are
implemented as **hidden default behaviors** in
`GDJS/Runtime/object-capabilities/` (e.g. `OpacityBehavior.ts`). Each implements
an interface (`OpacityHandler` in `gd.ts`) and forwards to the owner object, and
returns `usesLifecycleFunction(): false`. This lets events call a capability
generically via `getBehavior(name)` regardless of the concrete object type,
while native objects satisfy the interface directly — with no per-frame cost.

### Instance management & the deferred-deletion rule

`RuntimeInstanceContainer` stores instances in `_instances`
(`Hashtable<RuntimeObject[]>`, keyed by object name), with a cached flat list
`_allInstancesList` and a recycle pool `_instancesCache`
(`RuntimeInstanceContainer.ts:30-43`).

- **Create** (`createObject`, `:682`): pop from the pool and `reinitialize()`, or
  `new` if empty — recycling avoids allocation.
- **Delete is deferred** (`markObjectForDeletion`, `:725`): the instance is
  removed from `_instances` and queued in `_instancesRemoved`, then truly
  destroyed/recycled at safe drain points (`_cacheOrClearRemovedInstances`,
  `:532`). Reason: events in the same frame may still reference a just-deleted
  object. **This is a core invariant — never free an instance mid-frame.**

### Scene stack

**`gdjs.SceneStack`** (`scenestack.ts:25`) implements push/pop/replace/clear.
`step()` (`:54`) calls the top scene's `renderAndStep` and, if it requested a
change, dispatches it. `loadFromScene` (`runtimescene.ts:134`) is the scene boot:
add layers, build variables, cache behavior shared data, register global objects
then scene objects, create initial instances, wire the generated events function,
fire loaded callbacks.

### Runtime variables

`gdjs.Variable` (`variable.ts:19`) and `gdjs.VariablesContainer`
(`variablescontainer.ts:12`) are the runtime twins of the editor model. They are
built for speed: separate typed storage slots (no re-parsing), index-based lookup
via `_variablesArray`/`getFromIndex` (`:181`, used by generated code), tombstoning
(`_undefinedInContainer`) instead of deletion to avoid GC, and `badVariable`/
`badVariablesContainer` no-op singletons (`:320`, `:372`) so generated code never
needs null checks.

### Performance conventions (visible throughout the runtime)

These are not optional style — the runtime is hand-tuned for 60fps on weak
hardware (`newIDE/docs/Supported-JavaScript-features-and-coding-style.md`):

- **Pool and recycle** objects, forces (`forcesGarbage`), and variable objects.
- **Defer deletion**; drain at safe points.
- **Cache and lazily rebuild** flat lists and geometry (`hitBoxesDirty`,
  `_allInstancesListIsUpToDate`); `setX`/`setY` early-return on no-op.
- **Split hot collections** (`_behaviors` vs `_behaviorsTable`).
- **Allocate once, reuse**; avoid object/array literals in hot paths; declare all
  fields at construction (hidden-class friendliness).
- **Intern names** to integer ids for comparison.
- **Render culling** by camera AABB after the first frame.

---

## 6. Extensions, metadata & platforms

Almost everything an author uses — every object type, behavior, action,
condition and expression — is *declared* by an extension. The engine core knows
almost nothing; features are added as extensions
(`Core/GDevelop-Architecture-Overview.md:76-84`).

### Platform & extension

- **`gd::Platform`** (`Core/GDCore/Extensions/Platform.h`) is the registry of
  loaded extensions plus a factory table mapping object type → creation function.
  There is one concrete platform, **`gdjs::JsPlatform`** (singleton,
  `GDJS/GDJS/Extensions/JsPlatform.cpp`), whose constructor loads all builtin
  extensions.
- **`gd::PlatformExtension`** (`Core/GDCore/Extensions/PlatformExtension.h`) is
  the **fluent builder**. Declaration uses chained calls that each return a
  metadata reference:

```cpp
extension
    .AddAction("ShowLayer", _("Show a layer"), /*…*/)
    .AddParameter("layer", _("Layer"))
    .AddParameter("object", _("Object"))
    .SetFunctionName("gdjs.evtTools.camera.showLayer");
```

`AddAction`/`AddCondition` return `gd::InstructionMetadata&`; `AddExpression`
returns `gd::ExpressionMetadata&`; `AddObject`/`AddBehavior` return
`ObjectMetadata&`/`BehaviorMetadata&`. The extension name is a namespace
(`Name::`), so the full action type is `Name::ShowLayer`.

### The metadata classes

All in `Core/GDCore/Extensions/Metadata/`:

| Class | Describes | Key contents |
| --- | --- | --- |
| `InstructionMetadata` | one action or condition | parameters, sentence, group, icons, `codeExtraInformation` (function name, async name, operators, custom generator, include files) |
| `ExpressionMetadata` | one expression | `returnType` ("number"/"string"), parameters, function name |
| `ObjectMetadata` | an object type | instruction/expression maps, `createFunPtr`, default behaviors ("capabilities"), 3D flag |
| `BehaviorMetadata` | a behavior type | `objectType` it applies to, instruction/expression maps, backing `gd::Behavior` instance, properties + shared properties |
| `ParameterMetadata` | one parameter | wraps a `ValueTypeMetadata` + description/hint/`codeOnly` |
| `ValueTypeMetadata` | the parameter *type* | the type string, extra info, optional/default — the **single source of truth** for type classification |
| `MultipleInstructionMetadata` | composite | fans one fluent call out to an expression+condition+action at once |

`gd::MetadataProvider` (`MetadataProvider.cpp`) looks metadata up by type string
by linearly scanning the platform's extensions, returning a static "bad"
sentinel on miss (callers test by pointer identity, e.g.
`IsBadInstructionMetadata`).

### The two-file pattern: declaration vs implementation

Every feature has an **IDE declaration** (metadata: what it is, parameters, UI)
and a **runtime implementation** (the JS the game runs). They are wired by name
via `SetFunctionName`.

- **Builtin extensions** split across C++ files: `Core/GDCore/Extensions/Builtin/`
  declares the metadata (no function names); `GDJS/GDJS/Extensions/Builtin/`
  subclasses each and calls `SetFunctionName("gdjs.evtTools…")`, then
  `StripUnimplementedInstructionsAndExpressions()`. Core = "what exists"; GDJS =
  "which runtime function backs it".
- **JS extensions** (`Extensions/<Name>/`) do *both halves in JS*:
  - `JsExtension.js` runs inside the IDE (against the WASM `gd`), builds a
    `gd.PlatformExtension` with the camelCased builder API, and points each
    instruction at a runtime function via `setFunctionName` + `setIncludeFile`.
  - plain `.ts`/`.js` files (e.g. `examplejsextensiontools.ts`) define those
    `gdjs.evtTools.<name>.<fn>` functions, shipped with GDJS and run in the game.
  No libGD recompilation is needed for a JS extension. `Extensions/ExampleJsExtension/`
  is the reference.

Declared parameters become the positional arguments of the runtime function, in
order; `code-only` parameters (e.g. `currentScene`) are injected by code
generation but hidden in the editor.

### The parameter type system

The first argument to `AddParameter(type, …)` is a type string classified by
`gd::ValueTypeMetadata` (`ValueTypeMetadata.cpp`). It drives three things at once:
(a) the editor field, (b) the generated runtime argument, (c) expression
type-checking. Representative types:

- number-like: `number`, `expression`, `camera`, `forceMultiplier`
- string-like: `string`, `layer`, `color`, `sceneName`, `keyboardKey`,
  `objectAnimationName`, … (a long list in `ValueTypeMetadata.cpp:221-239`)
- boolean: `yesorno`, `trueorfalse`
- variable: `variable`, `variableOrProperty`, and legacy `objectvar`/`scenevar`/`globalvar`
- object: `object`, `objectPtr`, `objectList`
- behavior: `behavior`
- resource: `imageResource`, `audioResource`, `jsonResource`, `model3DResource`, …
- operators: `relationalOperator`, `operator`

Adding a new type means touching three places: `ValueTypeMetadata` (classify it),
`EventsCodeGenerator::GenerateParameterCodes` (emit it), and
`newIDE/app/src/EventsSheet/ParameterRenderingService.js` (render the field).

### Events-based extensions → real extensions

An events-based extension (authored in the IDE, stored in
`gd::EventsFunctionsExtension`) is turned into a *real* platform extension at
load time by `newIDE/app/src/EventsFunctionsExtensionsLoader/index.js`. In two
passes (metadata first so functions can cross-reference, then full code-gen) it
uses `gd::MetadataDeclarationHelper` to synthesize metadata and the
`Behavior`/`Object`/`EventsFunctionsExtension` code generators to emit runtime
JS, then `JsPlatform.get().addNewExtension(extension)`. This is how prefabs,
custom behaviors and custom functions become first-class actions/conditions.

---

## 7. GDevelop.js — the C++↔JS bridge

`GDevelop.js` compiles Core + GDJS (the C++ parts) + Extensions to WebAssembly
with Emscripten, exposing the C++ API to the JS editor via the **WebIDL binder**.

### The pipeline

1. `GDevelop.js/Bindings/Bindings.idl` declares, in WebIDL, every C++ class and
   method to expose — one `interface` per class, `X implements Y;` for
   inheritance.
2. `update-bindings.js` runs Emscripten's `webidl_binder.py` to generate
   `Bindings/glue.cpp` (C thunks) and `Bindings/glue.js` (JS wrappers).
3. `Bindings/Wrapper.cpp` `#include`s the real C++ headers and `glue.cpp` at the
   end, plus `#define` macros that rewrite magic-prefixed IDL method names
   (`WRAPPED_`, `STATIC_`, `MAP_`, `FREE_`, `CLONE_`) into real C++ expressions
   (e.g. wrapping a raw pointer into a `std::shared_ptr`).
4. `postjs.js` post-processes the JS at load: lowercases method names, applies
   the prefix rules, and installs `.delete()` and a use-after-free detector.

### The memory model — manual, no GC

This is the part most likely to bite contributors. Every JS wrapper is a thin
object whose only real state is `ptr`, an offset into the WASM heap:

- `wrapPointer(ptr, Class)` returns a cached wrapper per `(class, ptr)`.
- **There is no garbage collection of C++ objects.** Ownership is manual.
- **Rule of thumb:** if your JS code created it (`new gd.X()`) or a factory
  returned a fresh copy to you, you must call `.delete()` on it. If it's owned by
  a parent (a child in a C++ container, or something copied into the platform),
  you must **not** delete it.
- The canonical dance (seen in the extension loaders): build a `gd.X` in JS, hand
  it to a C++ method that *copies* it (`addNewExtension`), then immediately
  `.delete()` the now-redundant JS-side temporary.
- `postjs.js` adds a `UseAfterFreeError` guard: calling any method after
  `.delete()` (or after the C++ object was freed, cross-checked against the
  `MemoryTrackedRegistry` for tracked classes like `Project`, `Layout`,
  `gdObject`) throws instead of corrupting memory.

### Types for the editor

- `GDevelop.js/types/*.js` — generated **Flow** declarations, one per class
  (e.g. `gdInstructionMetadata`), used by the IDE.
- `GDevelop.js/types.d.ts` — the generated **TypeScript** equivalent, with a base
  `EmscriptenObject { ptr; delete(); }` and IDL-mirrored enums; used by GDJS and
  extension authors (`Extensions/JsExtensionTypes.d.ts`).

90% of the time, exposing new C++ to the editor is just adding lines to
`Bindings.idl`; only occasionally do you touch `Wrapper.cpp`
(`Core/GDevelop-Architecture-Overview.md:86-105`).

---

## 8. Serialization & the project file format

### One tree type: `gd::SerializerElement`

All (de)serialization goes through **`gd::SerializerElement`**
(`Core/GDCore/Serialization/SerializerElement.h:37`), a recursive node that is
simultaneously a value, a dictionary (named children + attributes), or an array.
`gd::Serializer` (`Serializer.cpp`) converts it to/from JSON via bundled
RapidJSON.

A key backward-compatibility mechanism is the **three-way attribute fallback**:
`GetStringAttribute(name, default, deprecatedName)` checks the current name, then
a deprecated name, then a child of that name (`SerializerElement.cpp:95-112`).
This is how legacy keys (often the old XML/French names) keep loading.

> This repo also has a local **canonical mode** (`Serializer.h:55-85`): when on,
> keys are emitted in stable alphabetical order and defaults are written, for
> minimal, shift-free git diffs. Toggled from JS via
> `gd.Serializer.setCanonicalMode`. Not present upstream.

### The `SerializeTo` / `UnserializeFrom` convention

There is **no `Serializable` base class** — it is a duck-typed convention. A
class is serializable if it implements:

```cpp
void SerializeTo(gd::SerializerElement& element) const;
void UnserializeFrom([gd::Project& project,] const gd::SerializerElement& element);
```

The optional leading `gd::Project&` is passed when unserialization needs
platform/extension lookups (objects, layouts, behaviors) and omitted when it
doesn't (variables, resources, instances). The recurring pattern: write scalar
attributes on the element, then `AddChild("x")` and delegate to each member's own
`SerializeTo`. `gd::Object::SerializeTo` (`Object.cpp:132-146`) is a clean
example. `SerializableWithNameList<T>` (`Core/GDCore/Tools/SerializableWithNameList.h`)
handles named-element lists.

### Migration = inline compatibility branches

GDevelop has **no separate migration pass and no schema-version-driven upgrade**.
Instead:

- `gdVersion` / `initialGDVersion` are stamped into the file
  (`Project.cpp:1219-1226`). On load, a newer-than-running version only *warns*
  (`Project.cpp:783-815`) — it never blocks or transforms.
- Each `UnserializeFrom` contains `// Compatibility with GD <= X` branches that
  read old shapes and normalize them (e.g. `Object.cpp:109-127` upgrades the
  pre-3.3 `Automatism` → `Behavior`; `Variable.cpp:376-393` handles pre-beta102
  string typing). The deprecated-name attribute fallbacks are the other half.

### Single-file vs folder projects

The C++ side always serializes the **entire project into one tree**. The
single-file-vs-folder split is done entirely in the IDE (JS), driven by
`project.isFolderProject()`:

- `newIDE/app/src/ProjectsStorage/LocalFileStorageProvider/LocalProjectWriter.js`
  splits these top-level keys into separate files: `layouts`, `externalLayouts`,
  `externalEvents`, `eventsFunctionsExtensions` (and `staticData`).
- The split replaces each value with a reference node
  (`{ __REFERENCE_TO_SPLIT_OBJECT: true, referenceTo: <path> }`) via
  `Utils/ObjectSplitter.js`; each array item becomes a file named after its
  slugified `name`. Loading reverses this with `unsplit` (depth-capped at 3 for
  performance).

### Resources

`gd::ResourcesContainer` (`Core/GDCore/Project/ResourcesContainer.h`) holds
polymorphic `gd::Resource` subclasses (`ImageResource`, `AudioResource`,
`FontResource`, `JsonResource`, `Model3DResource`, …), created by a kind-string
factory (`CreateResource`). Files are stored as **project-relative paths**;
objects/scenes reference resources **by name** (a string), never by embedding.

### What the runtime consumes

Export does not ship the editor JSON verbatim. `ExporterHelper`
(`GDJS/GDJS/IDE/ExporterHelper.cpp`) strips the project for export, computes
per-scene `usedResources`, serializes, and writes a `data.js` that assigns the
globals `gdjs.projectData` and `gdjs.runtimeGameOptions`. The runtime types are
in `GDJS/Runtime/types/project-data.d.ts` (`ProjectData`, `LayoutData`,
`InstanceData`, `ObjectData`, `VariableData`, …) — a stripped-plus-augmented
mirror of the editor format.

---

## 9. The editor (newIDE)

The editor is a React app in `newIDE/app/src`, typed with **Flow**, that drives
the C++ model through the WASM `gd` global. It runs in two shells: Electron
(`LocalApp.js`) and web (`BrowserApp.js`).

### App shell

- `MainFrame/index.js` is the application shell: it holds the open `gdProject` in
  state, manages the **editor tabs** (`MainFrame/EditorTabs/`), and orchestrates
  open/save/export, preview and refactoring.
- Each open tab is an **editor container** in `MainFrame/EditorContainers/`
  (`SceneEditorContainer`, `EventsEditorContainer`, `CustomObjectEditorContainer`,
  `ExternalEventsEditorContainer`, `ResourcesEditorContainer`, …). They share a
  `BaseEditor` pattern and wrap a domain editor with the project/tab plumbing.

### The `gd` global and memory discipline

Every file that touches the model does `const gd: libGDevelop = global.gd;`. The
WASM memory discipline from §7 applies throughout the editor:

- Call `.delete()` on any `gd.X` you create. Long-lived editor wrappers that hold
  a gd object across an edit session use
  `Utils/SerializableObjectCancelableEditor.js` (`useSerializableObjectCancelableEditor`)
  to manage the lifetime and support cancel.
- The bridge to JSON for React state and undo is
  `Utils/Serializer.js` — `serializeToJSObject(serializable, 'serializeTo')`
  produces a plain JS object; `unserializeFromJSObject` reads one back.

### Domain editors

| Editor | Edits | Notable internals |
| --- | --- | --- |
| `SceneEditor/` | a scene: instances, layers, objects | hosts the `InstancesEditor` canvas |
| `InstancesEditor/` | placement of instances | a **PixiJS** canvas — the editor's own renderer |
| `EventsSheet/` | the events of a scene/function | renders instructions via `InstructionEditor` + `ParameterFields/` |
| `ObjectEditor/`, `ObjectsList/` | object configuration & variables | per-type editors in `ObjectEditor/Editors/` |
| `BehaviorsEditor/` | behaviors on an object | per-type editors in `BehaviorsEditor/Editors/` |
| `VariablesList/` | variable containers (scene/global/object) | one shared dialog, scope-specific wrappers |

### Object rendering in the editor

The editor renders objects on the PixiJS canvas through a *parallel* renderer
hierarchy to the runtime's: `ObjectsRendering/ObjectsRenderingService.js`
dispatches to `RenderedInstance` subclasses (one per object type). A JS extension
registers its editor-side renderer via `registerInstanceRenderers` in
`JsExtension.js`. So an object type has *two* renderers — `RenderedInstance` for
the editor, `gdjs.RuntimeObject`'s renderer for the game — mirroring the IDE/Runtime split.

### Scope & autocompletion

`InstructionOrExpression/EventsScope.js` is the IDE-side assembler of
`gd::ProjectScopedContainers` (§2): it builds which objects/variables/properties
are visible for the events sheet currently being edited (scene vs function vs
prefab), powering validation and autocompletion. The instruction/expression
pickers live under `InstructionOrExpression/` and `ExpressionAutocompletion/`.

### Refactoring & undo

- Project-wide edits (rename/delete an object, update events after a change) call
  the C++ **`gd.WholeProjectRefactorer`** static methods directly from JS — there
  is no JS facade. This keeps a rename consistent across every event and
  reference.
- **Undo/redo** is snapshot-based: the project is serialized to JS objects and
  diffed/restored through the history utilities, rather than via per-action
  inverse commands.

### Editor conventions

- **Flow** typing everywhere (`// @flow`), not TypeScript (historical).
- Shared UI component library in `newIDE/app/src/UI`; never hand-roll primitives.
- **i18n** via `@lingui/macro` — wrap user-facing strings in `<Trans>` / `t`.
- `PreferencesContext` for user prefs; theming via the UI theme system.
- Testing: Jest with `*.spec.js`; component states are documented as Storybook
  `stories/`. Prettier formats everything (`npm run format`).

---

## 10. Cross-cutting conventions

These principles recur across every layer; internalizing them is the fastest way
to read the codebase.

1. **IDE model vs Runtime model.** Almost every concept exists as a `gd::X`
   (editor, C++, serialized) and a `gdjs.X` (runtime, TS, built from JSON). They
   are bridged only by the serialized data shape. Don't make one depend on the
   other.
2. **Declaration vs implementation.** Features are *declared* with metadata
   (what it is, parameters, UI) and *implemented* by a runtime function, wired by
   name via `SetFunctionName`. Code generation is the seam between them.
3. **Names are the public API; UUIDs are identity.** Events join on names;
   refactoring rewrites names project-wide via `WholeProjectRefactorer`;
   `persistentUuid` tracks "the same entity" across serializations.
4. **Containers own named, serializable children.** The model is built from a few
   reusable container templates (`SerializableWithNameList`, the various
   `*Container` classes), each implementing `SerializeTo`/`UnserializeFrom`.
5. **Object picking is list semantics.** An object name means "currently picked
   instances of that name". Conditions filter; actions iterate. This shapes
   events, code generation, and the runtime.
6. **Manual WASM memory.** In editor code, `.delete()` what you create, never
   delete what a parent owns. A use-after-free guard backstops mistakes.
7. **Backward compatibility is inline.** No migration framework — old project
   shapes are normalized inside each `UnserializeFrom`, plus deprecated-name
   attribute fallbacks. Add to these branches; don't break old files.
8. **Performance is hand-managed at runtime.** Pool/recycle, defer deletion,
   cache and lazily invalidate, avoid allocations in hot paths, declare all
   fields up front. The editor, transpiled by Babel, may use modern JS freely;
   the runtime is conservative and allocation-frugal.
9. **Two type checkers.** Runtime/extensions use TypeScript; the editor uses
   Flow. Both prefer explicit typing over `any`.

---

## 11. End-to-end: a frame, from authoring to pixels

Tying the layers together with one concrete path — an author writes
*"if Player is on the floor, set Player Y to 100"*:

1. **Authoring (editor).** In `EventsSheet`, the condition and action become two
   `gd::Instruction`s on a `StandardEvent` in the scene's `gd::EventsList`. Each
   parameter is a `gd::Expression`. Autocompletion/validation used the
   `ProjectScopedContainers` assembled by `EventsScope.js`. Editing the scene
   placed `Player` as a `gd::InitialInstance`. (Model: §2–3.)
2. **Save.** The whole `gd::Project` serializes through `SerializerElement` to
   JSON, split into per-scene files if it's a folder project. (§8.)
3. **Preview/export.** The platform (`JsPlatform`) resolves each instruction's
   metadata, and `gdjs::EventsCodeGenerator` transpiles the events to a JS module
   `gdjs.<scene>Code.func`. The "on floor" condition compiles to a filtering loop
   over the `Player` object list; the "set Y" action compiles to an iterating
   loop calling `setY(100)` on each still-picked instance. `ExporterHelper`
   writes `data.js` (`gdjs.projectData`) and the engine files. (§4, §6, §8.)
4. **Boot (runtime).** `gdjs.RuntimeGame` starts, the `SceneStack` loads the
   scene via `loadFromScene`, which creates a `gdjs.RuntimeObject` per initial
   instance and wires `gdjs.<scene>Code.func` as the scene's events function.
   (§5.)
5. **Each frame.** The rAF loop calls `RuntimeScene.renderAndStep`: behaviors'
   pre-events run, then the generated events function — `Player`'s instance list
   is copied from the scene, filtered by the floor condition, and the survivors
   get `setY(100)` — then behaviors' post-events, then `render()` draws via
   PixiJS. (§4–5.)

The same instruction the author dropped in a list is, four layers later, a
`list[i].setY(100)` call inside a generated function running 60 times a second —
and nothing of the editor model exists at that point. That collapse, from
declarative model to hand-tuned imperative loop, is the essence of GDevelop's
architecture.

---

## Source map

| Concern | Primary locations |
| --- | --- |
| Overview / vocabulary | `Core/GDevelop-Architecture-Overview.md` |
| Core data model | `Core/GDCore/Project/` (`Project`, `Layout`, `Object`, `VariablesContainer`, `PropertyDescriptor`, `ProjectScopedContainers`) |
| Events & expressions | `Core/GDCore/Events/` (`Event`, `Instruction`, `EventsList`, `Builtin/`, `Parsers/`) |
| Code generation | `Core/GDCore/Events/CodeGeneration/` (base), `GDJS/GDJS/Events/CodeGeneration/` (JS), `EventsCodeGenerationContext` |
| Runtime engine | `GDJS/Runtime/` (`runtimegame`, `runtimescene`, `RuntimeInstanceContainer`, `runtimeobject`, `runtimebehavior`, `scenestack`, `variable`, `object-capabilities/`) |
| Extensions & metadata | `Core/GDCore/Extensions/` (`Platform`, `PlatformExtension`, `Metadata/`, `Builtin/`), `GDJS/GDJS/Extensions/`, `Extensions/` |
| Events-based → real extensions | `newIDE/app/src/EventsFunctionsExtensionsLoader/`, `GDJS/GDJS/Events/CodeGeneration/MetadataDeclarationHelper.*` |
| Bindings | `GDevelop.js/Bindings/` (`Bindings.idl`, `Wrapper.cpp`, `glue.*`, `postjs.js`), `GDevelop.js/types/`, `types.d.ts` |
| Serialization | `Core/GDCore/Serialization/`, `newIDE/app/src/ProjectsStorage/`, `newIDE/app/src/Utils/{Serializer,ObjectSplitter}.js`, `GDJS/GDJS/IDE/ExporterHelper.cpp` |
| Editor | `newIDE/app/src/` (`MainFrame/`, `SceneEditor/`, `InstancesEditor/`, `EventsSheet/`, `ObjectEditor/`, `ObjectsRendering/`, `InstructionOrExpression/`, `UI/`) |
| Related deep dives | `docs/CustomObjectArchitecture.md`, `docs/StaticData.md`, `newIDE/docs/` |

