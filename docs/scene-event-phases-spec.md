# Scene and External Lifecycle Functions Specification

Status: approved for implementation

Date: 2026-08-07

> **Proposed presence amendment (2026-08-09):**
> [optional-scene-lifecycle-functions-spec.md](optional-scene-lifecycle-functions-spec.md)
> changes lifecycle functions from four permanently attached entries to four
> reserved optional entries. New owners contain `sceneUpdate` by default, all
> roles can be added or deleted, and a missing role is treated as an empty
> function. Until that amendment is approved, the fixed-presence rules below
> remain the approved implementation contract.

> Version 5 storage amendment (2026-08-09): lifecycle semantics in this
> document are unchanged, but every persisted function now uses the flat
> same-stem pair `functions/<Function>.settings` and
> `functions/<Function>.events`. Function settings contain no events URI, and
> an `.events` file without its same-stem `.settings` owner is invalid. Scene
> layout is embedded in `scene.settings`; External Events owners live below
> `scenes/<Scene>/external-events/<External>/`, and external layouts use
> `scenes/<Scene>/external-layout/<External>.settings`. Any nested
> `functions/<Function>/function.settings` or standalone `.layout` example
> below is unsupported v4 migration history. See
> [embedded-layout-settings-format-spec.md](embedded-layout-settings-format-spec.md).

## 1. Executive decision

The Scene Events and External Events editors will expose four fixed
scene-context lifecycle functions, presented with the same compact navigation
pattern as the Prefab lifecycle editor but with scene-specific names and
semantics:

| Fixed function name / lifecycle role | English UI label | Suggested Chinese label | Invocation                                             |
| ------------------------------------ | ---------------- | ----------------------- | ------------------------------------------------------ |
| `sceneLoad`                          | On scene load    | 场景加载时              | Once, on the first logical frame of this runtime scene |
| `sceneSignal`                        | On scene signal  | 收到场景信号时          | Once for every delivered scene signal                  |
| `sceneUpdate`                        | Scene update     | 场景更新                | Once per logical frame while the scene is active       |
| `sceneUnload`                        | On scene unload  | 场景卸载时              | Once, immediately before the runtime scene is unloaded |

The Scene Events editor section heading is **Scene lifecycle functions**. The
External Events editor uses **External lifecycle functions**. Each entry is a
real `gd::EventsFunction` with a fixed engine-owned name, signature, order, and
invocation role. It is not a user-created action: it cannot be renamed,
deleted, reordered, duplicated, or exposed in the instruction catalog.

The current `gd::Layout::events` list and serialized `events` field remain the
`sceneUpdate` function body. This is the central compatibility rule: opening an
existing project does not move, rewrite, reclassify, or change the behavior of
any event.

`gd::Layout` owns a fixed lifecycle-function container holding `sceneLoad`,
`sceneSignal`, `sceneUpdate`, and `sceneUnload`. The current `gd::Layout::events`
body becomes the body of the `sceneUpdate` function. Compatibility accessors
continue to return that body, but new code works through the lifecycle
function.

Every `gd::ExternalEvents` resource owns the same four fixed
`gd::EventsFunction` objects. Its existing `events` body becomes the body of
its `sceneUpdate` function; the other three functions are empty for existing
projects. External lifecycle functions are reusable bodies, not independent
runtime subscriptions: a `Link` in lifecycle role `P` includes function `P`
of its target. Merely associating an External Events resource with a scene
never causes it to execute.

The multi-file representation follows Prefab functions exactly: every
persisted lifecycle function has its own
`functions/<Function>/function.settings` plus sibling `<Function>.events`.
Fixed lifecycle metadata is validated rather than offered as editable function
configuration.

## 2. Problem

A scene currently owns one event list. Authors express different execution
models inside that list using conditions:

- `SceneJustBegins` for initialization;
- `SignalReceived` for queued scene-signal callbacks; and
- unguarded or ordinary conditional events for frame updates.

This works at runtime, but it mixes unrelated control-flow models in one long
sheet. The consequences become significant as a scene grows:

- initialization is scattered through the frame loop;
- signal-driven logic looks like polling even though signals are delivered;
- events that should run once can accidentally run every frame;
- the normal update path scans past unrelated initialization and signal
  sections;
- global search results do not communicate when an event runs;
- generated or AI-authored events need to infer placement conventions;
- author-level cleanup has no scene-owned terminal event surface; and
- the Prefab editor already teaches a clearer entry-point model, but its names
  (`onCreated`, `doStepPostEvents`, and `onDestroy`) describe object instances,
  not scenes.

The feature must improve organization without silently changing the semantics
of existing scenes or weakening GDevelop's deterministic, next-frame signal
contract.

## 3. Goals

1. Give every scene explicit initialization, signal, update, and terminal
   cleanup surfaces.
2. Reuse Prefab's real `EventsFunction` model and lifecycle navigation without
   treating scene functions as object methods or public callable actions.
3. Use labels that describe a scene author's mental model rather than runtime
   implementation names.
4. Preserve every existing scene event as a `sceneUpdate` event with identical
   execution behavior.
5. Preserve the current signal system: scene-local, FIFO, next-frame,
   non-reentrant, string payloads, and a maximum delivery batch of 10,000.
6. Execute the `sceneSignal` sheet exactly once per delivered scene signal and
   provide an isolated signal and object-picking context for each invocation.
7. Give External Events the same four lifecycle functions and preserve roles
   through same-role Links, event functions, JavaScript events, search,
   refactoring, hot reload, debugging, profiling, MCP, and multi-file projects.
8. Make lifecycle-function identity explicit in serialization, source paths,
   diagnostics, analytics, and deep links.
9. Add no per-frame work when a new lifecycle function is empty beyond a
   predictable branch.
10. Give scenes a synchronous final cleanup point while scene variables,
    objects, behaviors, layers, and renderers are still alive.
11. Persist Scene and External Events lifecycle functions with the same
    per-function settings/body directory contract used by Prefabs.

## 4. Non-goals

The first version does not add:

- a fixed-timestep physics event phase;
- pre-update and post-update scene sheets;
- scene pause or resume sheets;
- a synchronous or same-frame signal mode;
- direct-instance signal handling at scene level;
- typed or mutable signal payloads;
- signal priorities, consumption, cancellation, wildcards, or cross-scene
  routing;
- user-created, renamed, or reordered scene lifecycle functions;
- automatic movement of existing `SceneJustBegins` or `SignalReceived` events;
- automatic execution of an External Events resource merely because it is
  associated with a scene; or
- a change to the order of Prefab/behavior pre-event and post-event lifecycle
  methods.

Pause, resume, and fixed update can be designed later as additional
fixed entries. They must not be represented by empty placeholder fields in the
first version.

## 5. Terminology and naming

### 5.1 Public labels and internal identifiers

Localized UI labels are separate from stable identifiers. Project data,
analytics, source maps, MCP arguments, and code must use the stable IDs from
section 1, never translated labels.

The selected fixed function names and labels intentionally differ from the
Prefab editor:

| Prefab concept     | Scene lifecycle function | Reason                                                                                                         |
| ------------------ | ------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `onCreated`        | On scene load            | The load function runs after initial objects and variables exist; the scene is not an object being constructed |
| `onSignal`         | On scene signal          | The scene observes scene broadcasts only; direct-instance signals remain Prefab-only                           |
| `doStepPostEvents` | Scene update             | These events are the scene's main events, so “post events” would be incorrect and implementation-oriented      |
| `onDestroy`        | On scene unload          | The scene lifecycle function runs once before any scene object is destroyed; it is not an object destructor    |

“Callback” is not part of the primary label. It suggests immediate
re-entrant execution, while GDevelop signals are queued until the next frame.
The description may explain that the function is invoked as a callback after
delivery.

### 5.2 Exact UI copy

The initial English strings are:

```text
SCENE LIFECYCLE FUNCTIONS

On scene load
Events run once after this scene has loaded, before its first update.

On scene signal
Events run once for each scene signal delivered to this scene.

Scene update
Events run every frame while this scene is active.

On scene unload
Events run once before this scene and its objects are unloaded.
```

The External Events editor uses the same four labels and icons, with copy that
does not imply automatic registration:

```text
EXTERNAL LIFECYCLE FUNCTIONS

On scene load
Included when linked from an “On scene load” lifecycle function.

On scene signal
Included once per signal when linked from an “On scene signal” lifecycle function.

Scene update
Included every frame when linked from a “Scene update” lifecycle function.

On scene unload
Included during cleanup when linked from an “On scene unload” lifecycle function.
```

The second description must say **scene signal** so users do not expect direct
signals sent to a Prefab instance to enter this function.

### 5.3 Fixed function metadata

The functions use the ordinary `gd::EventsFunction` event body, parameters,
copying, serialization helpers, source maps, and code-generation machinery.
Their owner container fixes the metadata below:

| Name / role   | Type     | Order | Parameters                              |
| ------------- | -------- | ----- | --------------------------------------- |
| `sceneLoad`   | `Action` | 0     | none                                    |
| `sceneSignal` | `Action` | 1     | `SignalName: string`, `Payload: string` |
| `sceneUpdate` | `Action` | 2     | none                                    |
| `sceneUnload` | `Action` | 3     | none                                    |

All four use `folder = ["Lifecycle"]`, `private = true`, `async = false`, an
empty sentence, no result, and no object groups. `runtimeScene` and the internal
events-function context remain code-only generated parameters. The fixed
`lifecycleRole` equals the function name and distinguishes these functions from
ordinary private actions during loading and validation.

The user cannot edit the name, role, type, order, visibility, async flag,
folder, or parameter signature. Only the events body is editable. The
`sceneSignal` parameter names follow Prefab `onSignal`; `SignalName()` and
`SignalPayload()` remain convenient scene-context aliases that compile to the
fixed parameters.

When `sceneSignal` is selected, the shared function list exposes the same
**Function settings** entry used by Prefab, Behavior, and Extension functions.
It opens the shared parameter editor with `SignalName` and `Payload` visible in
fully read-only mode. Scene Events and External Events use this same UI and do
not maintain a separate parameter presentation.

The fixed `async = false` means the lifecycle function is not an awaitable
public instruction. It does not disable ordinary asynchronous event
continuations in load, signal, or update. `sceneUnload` separately rejects them
because the owning runtime scene has no later frame.

## 6. Editor experience

### 6.1 Navigation

The Scene Events and External Events editors gain a shared lifecycle-function
selector derived from the Prefab function/lifecycle selector. The Scene Events
variant is:

```text
SCENE LIFECYCLE FUNCTIONS

  [create icon]  On scene load
                 Events run once after this scene has loaded, before its first update.

  [signal icon]  On scene signal
                 Events run once for each scene signal delivered to this scene.

  [step icon]    Scene update
                 Events run every frame while this scene is active.

  [destroy icon] On scene unload
                 Events run once before this scene and its objects are unloaded.
```

Existing function icons should be reused:

- `res/functions/create_black.svg` for `sceneLoad`;
- `res/functions/signal_black.svg` for `sceneSignal`;
- `res/functions/step_black.svg` for `sceneUpdate`; and
- `res/functions/destroy_black.svg` for `sceneUnload`.

The event-function body editor is shared directly with Prefab functions.
`EventsFunctionsExtensionEditor/EventsFunctionEditor.js` receives a real
`gd::EventsFunction`, derives its event list, and owns the common `EventsSheet`
integration. Prefab functions use the editable capability policy; scene and
External Events functions use the fixed capability policy, which disables
parameter and property editing without forking the event editor.

The function-list presentation is also owner-independent.
`EventsFunctionsList/EventsFunctionsTreeView.js` owns the search field,
`TreeView`, row layout, icons, selection styling, keyboard navigation,
responsive sizing, and optional header controls for Extension, Behavior,
Prefab/Object, Scene, and External Events functions. Each owner supplies only
its tree data and mutation capabilities. The existing `EventsFunctionsList`
adapts Extension, Behavior, and Prefab/Object hierarchies; scene owners adapt
their four fixed functions and expose no create, rename, delete, move, or
context-menu actions.

`SceneContextLifecycleFunctionsEditor` is the thin owner adapter around that
shared body editor. It provides the four fixed navigation entries, lazy mounts
visited bodies so their editor state is retained, and exposes the selected and
mounted editor instances to the Scene and External Events containers. It does
not implement another event sheet and does not expose add, rename, delete,
duplicate, reorder, signature editing, or “use as instruction” actions.

### 6.2 Selection behavior

- `sceneUpdate` is selected when an existing Scene Events or External Events
  tab is first opened.
- The last selected lifecycle function is remembered per editor tab as editor
  UI state. It is not project data and switching functions does not mark the
  project modified.
- Returning to a function restores its scroll position and event selection when
  those events still exist.
- On narrow layouts, the selector becomes a dropdown above the event sheet
  rather than reducing the event columns below their usable width.
- A non-empty indicator may be shown, but event counts should not be computed
  by recursively walking the sheet on every render.

### 6.3 Empty states

Each Scene Events lifecycle function uses role-specific guidance:

- `sceneLoad`: “Add events that initialize this scene.”
- `sceneSignal`: “Add events that react to delivered scene signals. Use
  `SignalName()` and `SignalPayload()` to inspect the current signal.”
- `sceneUpdate`: retain the current first-event empty state.
- `sceneUnload`: “Add synchronous cleanup events that run before this scene is
  unloaded.”

The editor does not auto-insert an empty event or a template condition merely
because a lifecycle function is opened.
Opening a synthesized empty optional function also does not create source
files; its directory is materialized only after the body becomes non-empty and
the save transaction succeeds.

For External Events, the empty state uses the matching description from
section 5.2 and offers **Add a Link in the associated scene** as a navigation
action, not as an automatic project mutation.

### 6.4 Editing and clipboard

All current event editing operations remain available. Cut, copy, paste, and
drag-and-drop may move events between lifecycle-function bodies. A cross-role
move is one undoable transaction and preserves event metadata and event IDs.

Extracting selected scene events to a new or existing External Events resource
places them in the same role and leaves a same-role `Link` at the extraction
site. The command never moves terminal events into the external update function.

Moving an event does not silently add or remove conditions. The editor instead
shows contextual diagnostics for redundant or invalid lifecycle-role-specific
conditions as defined in section 10.

### 6.5 Undo and unsaved state

The four fixed functions share their owning Scene Events or External Events editor's
history and unsaved-state owner. Switching functions is not an undo step.
Editing any function marks that owner tab and project as modified and requests the same
preview code hot-reload category as ordinary event edits.

## 7. Normative execution order

The existing `RuntimeScene.renderAndStep` pipeline remains authoritative. The
generated scene events function becomes a small lifecycle orchestrator inside the
current **events** slot:

```text
Logical frame N
  1. Update time
  2. Resume asynchronous tasks
  3. Run object/behavior pre-events work
  4. Run runtime-scene pre-events callbacks
       - dispatch the fixed signal batch
       - invoke subscribed Prefab/behavior onSignal handlers
  5. Run generated scene lifecycle functions
       a. start a new OnceTriggers frame
       b. On scene load       (first frame only)
       c. On scene signal      (once per delivered scene signal, FIFO)
       d. Scene update         (every frame, including the first frame)
  6. Run object/behavior post-events work
  7. Run runtime-scene post-events callbacks
  8. Render
```

This gives a simple scene-owned order:

```text
first active frame: load -> zero or more signal invocations -> update
later active frame: zero or more signal invocations -> update
unload: sceneUnload -> extension unloading callbacks -> object destruction
```

A `Link` is resolved with the lifecycle function currently being generated. If
role `P` links an `ExternalEvents` or `Layout` target, preprocessing includes
the target lifecycle function `P` body at that exact position. Links nested
inside an external lifecycle function continue with the same `P`; they do not
create a second lifecycle invocation.
Legacy Links reside in update and therefore keep resolving to the legacy
`events` list. The Link UI does not offer a cross-role target selector.

The existing signal bus dispatches subscribed Prefab and behavior handlers in
the pre-events callback before scene-owned lifecycle functions begin. A scene signal that
was queued before the first frame can therefore reach a subscribed component
before `sceneLoad`, while the scene's own `sceneSignal` function still runs after
`sceneLoad`. This lower-level distinction must be documented and tested; the
feature must not reorder the existing component signal contract.

A scene-change request remains deferred in the same way as current scene
events. Requesting a scene change in `sceneLoad` or one signal invocation does
not implicitly abort the remaining generated events for the current logical
frame. Introducing lifecycle-boundary cancellation would be a separate behavioral
change. The active frame, including its render, completes before the scene
stack commits the transition and invokes `sceneUnload` during unload.

`sceneUnload` is outside the logical-frame events slot. It runs synchronously at
the beginning of `RuntimeScene.unloadScene`, before extension unloading
callbacks, Prefab/behavior destruction, renderer teardown, signal-bus cleanup,
scene-variable release, and resource unloading. It is guarded independently
from the active-frame orchestrator.

## 8. Lifecycle function semantics

### 8.1 `sceneLoad`

`sceneLoad` runs when `runtimeScene.getScene().getTimeManager().isFirstFrame()`
is true. This deliberately matches the existing `SceneJustBegins` condition.

Normative rules:

- It runs at most once per `RuntimeScene` lifetime.
- It runs after initial scene objects, scene variables, layers, and behaviors
  exist and after the first pre-events callbacks.
- It runs before the first `sceneSignal` and `sceneUpdate` function bodies.
- It does not run again when a pushed-over scene is resumed.
- Restarting or recreating the scene creates a new `RuntimeScene` and runs it
  again.
- Hot reloading code does not reset first-frame state and does not rerun it.
- If the scene is constructed and unloaded without a logical frame, it never
  runs.
- Starting an awaited action does not block `sceneUpdate`; this matches the
  current asynchronous event model. The continuation resumes through the
  normal async task manager.

`SceneJustBegins` remains supported in `sceneUpdate` for compatibility. In
`sceneLoad`, the condition is always true and the editor reports it as
redundant rather than changing or deleting it.

### 8.2 `sceneSignal`

`sceneSignal` receives only the delivered **scene-signal** batch. Direct signals
addressed to a runtime object instance never invoke it.

For a delivered batch `[A, B, C]`, the complete event list is invoked in FIFO
order:

```text
sceneSignal(A)
sceneSignal(B)
sceneSignal(C)
sceneUpdate()
```

Each invocation exposes:

```text
SignalName()     -> delivered signal name
SignalPayload()  -> delivered immutable string payload
```

The values are read-only. There is no user-facing emitter value. Logic needing
source identity must keep it in the payload contract, consistent with
`docs/SignalSystem.md`.

Every invocation starts with a fresh event and object-picking context:

- no picked-object list is inherited from the emitter, a Prefab handler, the
  previous signal, `sceneLoad`, or another top-level event;
- all live scene instances are available for normal condition-based picking;
- picks made while handling one signal do not leak into the next signal;
- scene variables, object state, created objects, and deletions persist as
  normal scene mutations; and
- local event variables have their ordinary event-local lifetime.

A signal emitted by `sceneLoad`, `sceneSignal`, or `sceneUpdate` is appended to
the new pending queue. It is delivered in the following frame, never later in
the current `sceneSignal` loop. The current two-queue and throttling behavior is
unchanged.

If `sceneSignal` is empty, the orchestrator does not iterate the delivered
batch solely for this function. Existing legacy `SignalReceived` events in
`sceneUpdate` may still inspect that batch.

### 8.3 `sceneUpdate`

`sceneUpdate` is the current scene event sheet under a clearer label. It runs
once per logical frame, after all `sceneSignal` invocations for that frame. It
runs on the first frame after `sceneLoad` and any initially delivered scene
signals.

The following compatibility aliases remain:

- C++ `Layout::GetEvents()` returns the update function body;
- JavaScript binding `layout.getEvents()` returns the update function body;
- legacy serializer field `events` stores the update function body; and
- a multi-file v3 scene `events` source imports as the update function body.

New code uses `GetLifecycleEventsFunctions().GetSceneUpdateFunction()` (and the
equivalent GDevelop.js binding), but removing `GetEvents()` is outside this
specification.

### 8.4 `sceneUnload`

`sceneUnload` is a synchronous terminal lifecycle function. It runs once when a loaded
`RuntimeScene` is genuinely unloaded, before the scene's objects, behaviors,
variables, layers, renderer, signal bus, and other runtime-owned state are
destroyed.

It runs for:

- replacing or restarting the scene;
- popping the scene from the stack;
- clearing the scene stack;
- network scene-stack reconciliation that removes this runtime scene;
- preview restart/stop and normal game disposal when they dispose the scene
  stack; and
- an explicit `RuntimeScene.unloadScene()` call on a loaded scene.

It does not run when:

- another scene is pushed on top and this scene is merely paused;
- the paused scene is later resumed;
- event code is hot reloaded without unloading the runtime scene; or
- the process, browser tab, device, or runtime terminates abruptly without
  executing GDevelop's disposal path.

A scene-change or stop action only requests a transition. It does not invoke
`sceneUnload` at the call site; the function starts later, if and when the scene stack
commits the request and actually unloads this runtime scene.

The function can run even if the scene was unloaded before its first logical
frame. In that case, `sceneLoad` did not run but `sceneUnload` still gets the one
safe engine-controlled cleanup opportunity.

The function starts with a fresh root object-picking and local-event context. All
still-live scene objects are available for normal picking. Scene and global
variables can be read or updated, and synchronous cleanup APIs can be called.
No object selection from the last update frame is inherited.

The scene stack may already have detached this runtime scene from its active
entry before `RuntimeScene.unloadScene()` is called. Generated unload events must
therefore use the explicit `runtimeScene` argument; they are guaranteed a live
unloading scene context, not that a stack-level “current scene” lookup returns
that same scene. Extensions called from this function must follow the same rule.

`sceneUnload` is not a final rendered frame. Objects created or visual properties
changed during the function are never guaranteed to render and all scene-owned
objects are destroyed immediately afterward. The editor warns when an event
creates an object in this function but does not forbid it, because some custom
objects may use construction/destruction as a synchronous resource operation.

The following operations are invalid in `sceneUnload`:

- awaited actions, Wait events, asynchronous event continuations, or other
  work that requires a later scene frame;
- `EmitSceneSignal` and `EmitSignalToObjectInstance`, because the signal bus is
  cleared without another delivery frame;
- `SignalReceived`, because no delivered batch is being iterated;
- scene-stack transition actions such as push, pop, replace, clear, restart,
  or stop, because the current unload transaction is already committed; and
- any action explicitly declared by its extension metadata as requiring a
  future update of the same runtime scene.

Fire-and-forget operations whose lifetime belongs to the game or an external
service may be started, but they must copy all needed values synchronously and
must not retain or later access the unloading `RuntimeScene`, its objects, or
its variables.

The runtime sets an `_isUnloading` guard before invoking `sceneUnload`. A nested
`unloadScene()` call returns without invoking the function again. The guard also
prevents JavaScript or extension code from re-entering teardown. If a
JavaScript event throws, preview reports the error and teardown continues so a
partially alive scene is not left on the stack.

Ordering inside `RuntimeScene.unloadScene` is normative:

```text
1. Mark the runtime scene as unloading.
2. Run sceneUnload once while scene-owned runtime state is alive.
3. Stop and publish the scene profiler.
4. Run callbacksRuntimeSceneUnloading (extension onSceneUnloading).
5. Run object/behavior deletion and destruction callbacks.
6. Tear down the renderer.
7. Run callbacksRuntimeSceneUnloaded.
8. Destroy scene-owned containers and clear signal/async state.
9. Unload scene resources when scene-stack policy requires it.
```

This places author cleanup before extension and object cleanup, so the APIs and
instances used by scene events have not already released their resources.

## 9. Signal callback context and asynchronous safety

The generated `sceneSignal` function must receive the concrete signal record or captured
name/payload as function arguments. It must not rely exclusively on one mutable
`SignalBus._currentSceneSignal` slot for generated event expressions.

Conceptually:

```js
sceneCode.sceneSignal = function(runtimeScene, signalName, signalPayload) {
  // Generated events.
};
```

Within a `sceneSignal` generation context, normal `SignalName()` and
`SignalPayload()` expressions compile against the invocation's captured
values. Awaited event continuations must retain those values for their own
invocation even after the synchronous signal loop has moved to another signal.

The runtime's temporary current-signal helper remains for:

- legacy `SignalReceived` events in `sceneUpdate`;
- synchronous JavaScript event helpers; and
- debugger association.

Raw JavaScript that awaits must copy signal values before its first `await`, as
already required by the signal system. Generated ordinary event expressions
and awaited actions must not require the author to perform this manual copy.

The current signal context is cleared after every invocation and after the
batch, including an exceptional exit in preview builds. No signal name or
payload may leak into `sceneUpdate` unless a legacy `SignalReceived` event
establishes its own temporary context.

## 10. Instruction availability and validation

### 10.1 Lifecycle-aware catalog

The event editor and compiler know the active `SceneLifecycleFunctionRole`.
Normal scene objects, variables, instructions, expressions, event types,
external-event Links, JavaScript events, and event functions remain available
in all lifecycle functions unless explicitly restricted below.

### 10.2 `SceneJustBegins`

- `sceneUpdate`: available and unchanged for compatibility.
- `sceneLoad`: available when pasted or loaded, but hidden from suggested
  results and diagnosed as redundant.
- `sceneSignal`: available with its current meaning; it can test whether a
  signal was delivered on the scene's first frame, though this is uncommon.
- `sceneUnload`: available when pasted or loaded, but hidden from suggested
  results and diagnosed as unnecessary because the unload function already runs
  once. Its first-frame value is not a reliable “load completed” test.

### 10.3 `SignalReceived`

`SignalReceived` is special iteration syntax in the existing update sheet. It
must not be nested around a lifecycle function that is already invoked per signal.

The condition is hidden from all new-authoring catalogs and instruction
choosers. Its metadata and code generation remain registered solely so existing
projects can be loaded, edited without destructive migration, and executed.
New signal handlers are authored in `sceneSignal` and inspect its read-only
`SignalName` and `Payload` parameters.

- `sceneUpdate`: existing serialized uses remain valid for compatibility, but
  the condition is not offered for new authoring.
- `sceneLoad`: unavailable and a compile-time lifecycle-role diagnostic.
- `sceneSignal`: unavailable and a compile-time lifecycle-role diagnostic. Authors use
  `SignalName()` in an ordinary string comparison.
- `sceneUnload`: unavailable and a compile-time lifecycle-role diagnostic because signal
  delivery has finished and the bus is about to be cleared.

The diagnostic is:

```text
SCENE_LIFECYCLE_FUNCTION_INVALID_SIGNAL_RECEIVED
“Scene signal received” is only available in “Scene update” and cannot be used
inside “{functionLabel}”. In “On scene signal”, compare SignalName() instead.
```

### 10.4 Signal expressions

- `sceneSignal`: valid throughout the function and through linked external-event
  descendants.
- `sceneUpdate`: valid only inside the existing temporary context established
  by a matching `SignalReceived` event and its descendants.
- `sceneLoad`: not meaningful; the editor warns and the runtime-compatible
  fallback is empty text.
- `sceneUnload`: not meaningful; the editor warns and the runtime-compatible
  fallback is empty text.

The compiler should issue a context diagnostic when it can prove an expression
is outside a signal context. It must retain the existing neutral empty-string
runtime fallback for dynamically reused external event sheets.

### 10.5 Trigger once

`Trigger once` keeps its existing event-ID/frame semantics. It is not reset for
each delivered signal. The editor may explain that the load and unload functions
already run once, and that the signal function is already event-driven.
`Trigger once` can intentionally collapse multiple matching signals delivered
in the same or successive frames depending on its surrounding conditions. The
feature must not silently redefine trigger state.

### 10.6 Terminal-function restrictions

The lifecycle-aware catalog hides actions known to require a future scene frame or
to mutate the scene stack from `sceneUnload`. Pasted, linked, generated, or
source-authored invalid instructions fail before preview/export.

Diagnostics use:

```text
SCENE_LIFECYCLE_FUNCTION_ASYNC_NOT_SUPPORTED
“On scene unload” is synchronous. This action needs a later scene frame, but the
scene is destroyed immediately after the function finishes.

SCENE_LIFECYCLE_FUNCTION_DEFERRED_SIGNAL_NOT_SUPPORTED
Signals emitted from “On scene unload” cannot be delivered because the scene
signal bus is about to be cleared.

SCENE_LIFECYCLE_FUNCTION_TRANSITION_NOT_SUPPORTED
The scene is already unloading. Scene transition actions cannot be requested
from “On scene unload”.
```

Extension metadata must be able to declare an instruction as requiring a
future frame of its owning runtime scene. This validation is capability-based,
not a permanent hard-coded list of third-party instruction identifiers.

## 11. External events and event functions

### 11.1 External lifecycle-function ownership

Every `gd::ExternalEvents` resource owns `sceneLoad`, `sceneSignal`,
`sceneUpdate`, and `sceneUnload` lifecycle functions and exposes the shared
lifecycle selector. Its
associated scene supplies the object/instruction catalog, editor context, and
multi-file storage owner. Association is not a runtime hook: none of the four
function bodies executes until reached through a `Link`.

The lifecycle role describes the caller context, not a global invocation
guarantee for the external resource. If the same external `sceneLoad` function
is linked at two sites, it runs at both sites during the scene's one load
invocation. The same
rule applies per delivered signal, update frame, and unload. Authors who need
one execution across multiple Link sites use ordinary conditions or remove the
duplicate Links.

### 11.2 Same-role Link resolution

`Link` inherits the lifecycle role of its containing function. Given caller
role `P`, its
target resolution is normative:

```text
Link in Layout function P         -> target.GetLifecycleEventsFunctions().Get(P).GetEvents()
Link in ExternalEvents function P -> target.GetLifecycleEventsFunctions().Get(P).GetEvents()
```

This applies whether the target is another `ExternalEvents` resource or a
`Layout`. Group lookup, if present in a legacy Link, is performed only inside
the resolved target function. An empty target function is a valid no-op.

There is no serialized `targetLifecycleRole` property and no cross-role choice in the
Link editor. Consequently:

- update Links continue to include the existing target `events` body exactly as
  before;
- load cannot invoke an external update function by accident;
- a signal Link preserves the captured name/payload and current object-picking
  context as ordinary inline Link expansion does today;
- the target `sceneSignal` function's fixed `SignalName` and `Payload`
  parameters bind automatically to the caller values; the Link has no argument
  fields;
- an unload Link receives all terminal restrictions; and
- nested Link chains stay in one lifecycle role from root to leaf.

A Link authored in a lifecycle-neutral source such as a normal Events Function
resolves the target's `sceneUpdate` lifecycle function for backward compatibility. Events
Functions are compiled once and are not specialized into four hidden variants.
Lifecycle validation still follows the function from its actual call sites, so a
function reached from `sceneUnload` cannot use an update-target Link to evade
terminal restrictions.

### 11.3 Validation and dependency graphs

External lifecycle validation is performed for each reachable root context. An
external load, signal, or unload function containing `SignalReceived` is invalid
even if the same resource has a valid update function. Diagnostics identify owner name,
lifecycle role, source URI, and the role-specific Link path that made the body
reachable.

Dependency and recursion graphs use `(owner kind, owner ID, lifecycle role)` as the
node identity. A chain may reuse the same external resource in different
roles, but a cycle within one role is rejected with the complete Link path.
Whole-resource dependency views may collapse those nodes for presentation only
after lifecycle-aware validation is complete.

Creating, renaming, duplicating, moving to another associated scene, or deleting
an External Events resource operates on all four lifecycle functions and their
owner directory as one transaction. Extracting events to External Events writes
to the caller's lifecycle function and leaves the other new function bodies
empty.

### 11.4 Event functions

Normal Events Functions called from any lifecycle function remain normal functions. They do
not implicitly receive the signal context. A function that needs signal data
must receive the name or payload through explicit parameters. This prevents a
reusable function from acquiring a hidden dependency on its caller's lifecycle role.

Calls reachable from `sceneUnload` are validated transitively against
terminal-function restrictions. A reusable function can remain valid for ordinary
callers while a terminal call site is rejected if that path can await, emit a
deferred signal, request a scene transition, or otherwise require a later frame.

## 12. Core data model

The four bodies are real `gd::EventsFunction` instances held by a specialized,
fixed-size owner. Generic `EventsFunctionsContainer` mutation APIs are not
exposed because lifecycle functions cannot be inserted or removed:

```cpp
enum class SceneLifecycleFunctionRole {
  SceneLoad,
  SceneSignal,
  SceneUpdate,
  SceneUnload,
};

class SceneLifecycleEventsFunctions {
 public:
  EventsFunction& Get(SceneLifecycleFunctionRole role);
  const EventsFunction& Get(SceneLifecycleFunctionRole role) const;

  EventsFunction& GetSceneLoadFunction();
  EventsFunction& GetSceneSignalFunction();
  EventsFunction& GetSceneUpdateFunction();
  EventsFunction& GetSceneUnloadFunction();

  EventsList& GetEvents(SceneLifecycleFunctionRole role) {
    return Get(role).GetEvents();
  }

 private:
  EventsFunction sceneLoad;
  EventsFunction sceneSignal;
  EventsFunction sceneUpdate;
  EventsFunction sceneUnload;
};

class Layout {
 public:
  SceneLifecycleEventsFunctions& GetLifecycleEventsFunctions();
  const SceneLifecycleEventsFunctions& GetLifecycleEventsFunctions() const;

  // Compatibility alias for sceneUpdate.GetEvents().
  EventsList& GetEvents();
  const EventsList& GetEvents() const;
};

class ExternalEvents {
 public:
  SceneLifecycleEventsFunctions& GetLifecycleEventsFunctions();
  const SceneLifecycleEventsFunctions& GetLifecycleEventsFunctions() const;

  // Compatibility alias for sceneUpdate.GetEvents().
  EventsList& GetEvents();
  const EventsList& GetEvents() const;
};
```

Construction initializes and validates the immutable metadata from section 5.3.
Legacy loading writes only the event bodies into those prebuilt functions. A
source-format metadata mismatch is an error; it is not silently normalized,
because doing so could hide a hand-edited role or signature mistake.

GDevelop.js exposes `getLifecycleEventsFunctions()` on both `gdLayout` and
`gdExternalEvents`, plus `get(role)` and named function accessors on that fixed
container. Existing `getEvents()` remains the update-body alias.

Copy construction, assignment, memory tracking, project cloning, scene/external
duplication, and deletion must handle all four functions. A single shared
lifecycle registry defines role, fixed name/signature, label key, icon, legacy
serializer key, physical directory, and execution multiplicity so editor and
tooling do not maintain divergent string switches.

### 12.1 Project-wide event traversal

Every operation that currently assumes `layout.GetEvents()` or
`externalEvents.GetEvents()` is the complete set of owner events must be
audited. Unless it intentionally targets only per-frame behavior, it traverses
each owner's lifecycle functions in stable presentation order:

```text
sceneLoad -> sceneSignal -> sceneUpdate -> sceneUnload
```

This includes at least:

- object, behavior, variable, group, layer, resource, and function renaming;
- identifier and variable finding;
- project dependency discovery;
- extension usage discovery;
- event validation and diagnostics;
- global search and replace;
- arbitrary event workers;
- link target renaming;
- removal of references to deleted objects or instructions;
- constant placeholder scanning;
- AI-generated event ID scanning; and
- MCP inspection and bulk editing.

APIs that deliberately retain the legacy update-only behavior must be named or
documented as update-only.

## 13. Legacy serializer shape

The legacy single-file adapter deliberately flattens the four fixed function
bodies instead of serializing a generic `EventsFunction` array. Fixed metadata
is reconstructed from the lifecycle registry, which avoids duplicating the
update body and preserves the existing JSON contract. `Layout` and
`ExternalEvents` both keep `events` and add three optional arrays. A layout is:

```json
{
  "name": "Main",
  "sceneLoadEvents": [],
  "sceneSignalEvents": [],
  "events": [],
  "sceneUnloadEvents": []
}
```

An External Events entry uses the identical lifecycle-body keys:

```json
{
  "name": "Shared Combat",
  "associatedLayout": "Main",
  "sceneLoadEvents": [],
  "sceneSignalEvents": [],
  "events": [],
  "sceneUnloadEvents": []
}
```

Normative rules:

- `events` is always `sceneUpdate.GetEvents()` for either owner and retains its
  current spelling.
- `sceneLoadEvents`, `sceneSignalEvents`, and `sceneUnloadEvents` are serialized with
  `EventsListSerialization` when non-empty.
- Missing new fields deserialize as empty lifecycle-function bodies.
- Unknown or malformed event nodes follow the same diagnostics and data-loss
  protections as the existing `events` field.
- The serializer never tries to infer a lifecycle role from event conditions.
- Array order inside each function body and project order among External Events
  resources are independent and preserved exactly.

Omitting empty new fields keeps old-project diffs small. Once a new function has
content, older GDevelop releases that do not understand the fields are not safe
writers for that project; normal project-version/downgrade warnings must make
this explicit.

## 14. Multi-file project format

### 14.1 Canonical directory layout

Version 4 follows the existing Prefab function convention. The relevant
project subtree is:

```text
MyGame/
  scenes/
    Main/
      scene.settings
      Main.layout
      objects/
        Player.settings

      functions/
        sceneLoad/
          function.settings
          sceneLoad.events
        sceneSignal/
          function.settings
          sceneSignal.events
        sceneUpdate/
          function.settings
          sceneUpdate.events
        sceneUnload/
          function.settings
          sceneUnload.events

      externals/
        Shared%20Combat/
          external-events.settings
          functions/
            sceneLoad/
              function.settings
              sceneLoad.events
            sceneSignal/
              function.settings
              sceneSignal.events
            sceneUpdate/
              function.settings
              sceneUpdate.events
            sceneUnload/
              function.settings
              sceneUnload.events

        Shared%20Combat.layout
```

The four directories in the example show a fully populated owner. For both a
scene and an External Events owner, `functions/sceneUpdate/` is required even
when its body is empty. `sceneLoad`, `sceneSignal`, and `sceneUnload` directories
are materialized only while their bodies are non-empty. A missing optional
directory synthesizes the corresponding fixed empty function in memory.

The canonical templates are:

```text
Scene settings:   scenes/<Scene>/functions/<Role>/function.settings
Scene body:       scenes/<Scene>/functions/<Role>/<Role>.events
External settings: scenes/<Scene>/externals/<External>/functions/<Role>/function.settings
External body:     scenes/<Scene>/externals/<External>/functions/<Role>/<Role>.events
```

Scene `functions/` contains only the four reserved lifecycle names in version

4. External Events use one owner directory below the associated scene's
   `externals/` directory. An external layout remains the flat
   `externals/<ExternalLayout>.layout` file, so a same-stem external-event directory
   and external-layout file can coexist.

### 14.2 Owner settings

In version 4, `scene.settings` no longer owns an `events` URI. The scene's
physical lifecycle function directories are authoritative:

```toml
kind = "scene"
settingsFormatVersion = 4
order = 0
name = "Main"
layout = "game://scenes/Main/Main.layout"
```

Each External Events resource has owner settings analogous to
`prefab.settings`:

```toml
kind = "externalEvents"
settingsFormatVersion = 4
order = 0
name = "Shared Combat"
```

Its associated scene is derived from the parent
`scenes/<Scene>/externals/<External>/` path. `associatedLayout`, `linkedScene`,
and source-file lists are forbidden in `external-events.settings`. `order` is
unique and contiguous in project-wide External Events order. Version 4 removes
`[[externalEventFiles]]` from `scene.settings`; external layouts continue using
their existing scene-owned records.

The loader discovers exactly
`scenes/*/externals/*/external-events.settings`. The canonical decoded owner
directory name and the settings `name` must agree under the same managed-name
rules used for Prefabs; duplicate identities or normalized/case-folded path
collisions fail before sources are mounted. No deeper directory is inferred as
another owner.

Neither scene nor external owner settings enumerate `functionFiles`. As with
Prefab functions, physical `functions/<Function>/function.settings` documents
are the component structure.

### 14.3 Lifecycle `function.settings`

Every materialized lifecycle function uses the Prefab two-file shape:

```text
functions/<Function>/
  function.settings
  <Function>.events
```

For example, the scene-load settings are:

```toml
kind = "function"
settingsFormatVersion = 4
order = 0
folder = ["Lifecycle"]
name = "sceneLoad"
events = "game://scenes/Main/functions/sceneLoad/sceneLoad.events"
functionType = "Action"
lifecycleRole = "sceneLoad"
fullName = "On scene load"
description = "Events run once after this scene has loaded, before its first update."
sentence = ""
private = true
async = false
parameters = []
objectGroups = { }
```

The External Events equivalent differs only in its full events URI and the
fixed owner-kind description from section 5.2. `sceneSignal` serializes the two fixed string
parameters from section 5.3 exactly as:

```toml
parameters = [
  { name = "SignalName", type = "string", description = "Delivered scene signal name", optional = false, defaultValue = "", codeOnly = false },
  { name = "Payload", type = "string", description = "Delivered immutable string payload", optional = false, defaultValue = "", codeOnly = false }
]
```

Loader validation requires directory name,
function name, `.events` basename, `lifecycleRole`, order, type, fixed flags,
and signature to agree exactly. No lifecycle function may point outside its
own directory or share an events source.

Lifecycle `order` is the fixed semantic value `0..3`, not a compact order among
only materialized directories. It may therefore be sparse on disk when an
optional empty function is absent; the generic contiguous-order rule for
user-created Prefab functions does not apply to this fixed owner.

The source-format `fullName` and `description` are stable English metadata for
tooling. The editor displays localized registry strings, not source text, and
rejects source metadata that attempts to redefine lifecycle semantics.

### 14.4 Version-3 migration

`MULTI_FILE_FORMAT_VERSION` increases from `3` to `4`. Version-3 projects have
a lossless, import-only upgrade path:

1. The version-4 reader accepts a canonical version-3 tree with scene
   `events` URIs and `[[externalEventFiles]]` records.
2. Each `scenes/<Scene>/<Scene>.events` body becomes that scene's
   `sceneUpdate` function body. `sceneLoad`, `sceneSignal`, and `sceneUnload` are
   synthesized empty.
3. Each flat `scenes/<Scene>/externals/<External>.events` body becomes the
   matching External Events owner's `sceneUpdate` body. Its three other
   lifecycle functions are synthesized empty, and its legacy project order is
   copied to `external-events.settings`.
4. Opening alone does not mutate the source tree.
5. The first successful version-4 save stages the new owner/function
   directories, compiles them, composes legacy JSON, and proves canonical
   round-trip equivalence before removing the old scene `.events` files, flat
   external `.events` files, or `externalEventFiles` records.
6. Empty optional lifecycle directories are not created. The required update
   function directory is created for every scene and External Events owner.
7. Any write, move, validation, or cleanup failure rolls back the whole
   migration; mixed v3/v4 ownership is never committed.

There is no version-3/version-4 dual-write mode. Once saved as version 4, a
version-3 editor is not a supported writer. The entry version makes it reject
the project before writing.

### 14.5 Composition, decomposition, and storage

Decomposition maps legacy body arrays into fixed lifecycle functions without
condition classification. Composition validates each function and flattens its
body back into the matching legacy field from section 13.

Required validation:

- `sceneUpdate` exists exactly once for every scene and External Events owner;
- each optional lifecycle role exists at most once, with a missing role meaning
  an empty body;
- every function directory contains exactly one `function.settings` and its
  declared sibling `.events` body;
- owner directories, settings filenames, function names, roles, orders, and
  normalized/case-folded URIs do not collide;
- no events source is referenced by more than one owner or lifecycle function;
- unknown lifecycle names below a scene or External Events `functions/`
  directory fail before composition; and
- compose/decompose round trips compare all four function bodies, fixed
  metadata, owner identity, association, and order.

Local storage discovery, watching, autosave, transaction journals,
modification-time calculation, Save As, scene/external rename, duplication,
association moves, and deletion operate on whole owner/function directories.
Clearing an optional function removes its two managed files and empty directory
only after the replacement owner state is staged. If an otherwise removable
directory contains an unrecognized user file, it is preserved with a valid
empty managed function rather than deleting user data.

### 14.6 IfDo DSL

Each `<Function>.events` contains the existing pure event-list DSL and no lifecycle
header. Identity, role, signature, and owner come exclusively from the sibling
`function.settings` and physical owner path, matching Prefab functions. This
keeps the IfDo grammar unchanged and prevents duplicated ownership.

The project instruction catalog attaches
`sceneLifecycleRole: "sceneLoad" | "sceneSignal" | "sceneUpdate" | "sceneUnload"` and the owner kind to each lifecycle function source.
Role-specific instruction validation follows section 10.

## 15. Code generation

The code generator compiles the four fixed `EventsFunction` bodies using the
ordinary function pipeline, then emits one scene dispatcher entry point:

```text
<Scene>Code.sceneLoad
<Scene>Code.sceneSignal
<Scene>Code.sceneUpdate
<Scene>Code.sceneUnload
<Scene>Code.func          # orchestrator called by RuntimeScene
```

Empty optional lifecycle helpers are omitted. `sceneUpdate` may compile to a
no-op. `func` preserves the current signature and remains
the active-frame value installed by
`RuntimeScene.setEventsGeneratedCodeFunction`. The same setup method installs
the optional `sceneUnload` helper into a separate terminal callback slot; the
active-frame orchestrator never invokes it.

Conceptual output:

```js
sceneCode.func = function(runtimeScene) {
  runtimeScene.getOnceTriggers().startNewFrame();

  if (
    sceneCode.sceneLoad &&
    runtimeScene
      .getScene()
      .getTimeManager()
      .isFirstFrame()
  ) {
    sceneCode.sceneLoad(runtimeScene);
  }

  if (sceneCode.sceneSignal) {
    const signals = gdjs.evtTools.signal.getDeliveredSceneSignals(
      runtimeScene,
      ""
    );
    for (let index = 0; index < signals.length; ++index) {
      sceneCode.sceneSignal(
        runtimeScene,
        signals[index].name,
        signals[index].payload
      );
    }
  }

  if (sceneCode.sceneUpdate) {
    sceneCode.sceneUpdate(runtimeScene);
  }
};
```

This is illustrative, not a requirement to allocate arrays or closures. The
implementation should reuse the signal bus's delivered batch and avoid copying
it.

Conceptually, runtime setup retains:

```js
runtimeScene._eventsFunction = sceneCode.func;
runtimeScene._sceneUnloadLifecycleFunction = sceneCode.sceneUnload || null;
```

`RuntimeScene.unloadScene()` invokes and clears the terminal callback under its
re-entry guard. Hot reload replaces the callback only while the scene is not
already unloading.

`OnceTriggers.startNewFrame()` is called exactly once before all active-frame
lifecycle functions. Event code namespaces, static object lists, callback maps
for asynchronous events,
AI-generated event IDs, source locations, and debugger breakpoints use ordinary
function identity plus lifecycle role so otherwise equal event paths cannot
collide.

`sceneSignal` compilation establishes a fresh root
`EventsCodeGenerationContext` per invocation and binds its two fixed function
parameters. It passes the captured values through any generated asynchronous
continuation. Legacy
`SignalReceived` custom code generation remains active only in update context.

`sceneUnload` compilation uses a terminal context that rejects awaited/deferred
instructions and scene transitions. It receives `runtimeScene` like the other
scene lifecycle functions but schedules no future callback in the scene's async task
manager.

External lifecycle functions use the same function-body generator and source
identity. `Link` preprocessing still includes the resolved target body at the
Link site, rather than publishing these private functions as callable actions.
This preserves legacy update-Link ordering, object-picking continuity, and
event-group behavior while giving the editor, model, and filesystem genuine
`EventsFunction` ownership.

## 16. Runtime and signal-bus integration

No new signal queue or subscription system is introduced. The signal function consumes
the batch already produced by `SignalBus.dispatchQueuedSignals` during the
runtime-scene pre-events callback.

The signal bus adds a non-copying read interface suitable for the orchestrator
if the existing `getDeliveredSceneSignals("")` filtering API would allocate.
The returned batch is read-only to generated scene code.

Debugger receiver accounting follows these rules:

- a non-empty `sceneSignal` sheet is recorded as the `sceneSignal` receiver
  when it is invoked for a delivered scene signal;
- this mirrors Prefab `onSignal`, where invocation counts as delivery even if
  internal conditions perform no actions;
- an empty signal function is not a receiver;
- legacy `SignalReceived` matches in `sceneUpdate` remain separately
  attributable to `sceneUpdate`; and
- duplicate presentation rows for the same lifecycle role and signal ID are collapsed.

Signal queues, subscriptions, temporary contexts, and debug state are still
cleared when the scene unloads. `sceneUnload` runs before the registered signal
unloading callback clears the bus, but emitting from the terminal function is
rejected because there is no later delivery frame.

`RuntimeScene` adds `_isUnloading` and `_sceneUnloadLifecycleFunction`. Loading a new
scene resets both. `_destroy()` clears the callback reference. Unload sets the
guard before author code, invokes the terminal callback at most once, and
continues teardown after a reported callback failure.

## 17. Hot reload, preview, debugger, and profiler

### 17.1 Hot reload

- Editing `sceneUpdate` replaces update code using the current behavior.
- Editing `sceneSignal` affects subsequently delivered signals, including a
  batch delivered on the next logical frame.
- Editing `sceneLoad` after it has run does not rerun it. The editor shows
  “Restart preview to run updated scene-load events.”
- Editing `sceneLoad` before the first logical frame allows the updated body
  to run once.
- Editing `sceneUnload` changes the code used by a later unload. It does not run at
  hot-reload time and cannot replace code after unloading has begun.
- Editing an External Events lifecycle function refreshes every reachable Link
  site. Its effective timing is still determined by the caller's matching role.
- Hot reload never resets `TimeManager` first-frame state, pending signals,
  subscriptions, scene variables, or objects merely to make load code run.

### 17.2 Event debugger

Breakpoints and event paths use ordinary function identity plus lifecycle role:

```text
scene:Main/function:sceneSignal/event:4/subevent:1
externalEvents:Shared%20Combat/function:sceneSignal/event:2/subevent:1
```

When paused in `sceneSignal`, the debugger shows signal ID, name, payload, and
delivery frame alongside the ordinary scene/object state. The signal payload
is display-only unless changed through normal scene state; the queued signal
record itself is immutable.

When paused in `sceneUnload`, the debugger labels the scene as **Unloading** and
disables continue-to-next-frame operations. Continuing completes synchronous
unload events and teardown. The debugger must not keep a reference to the disposed
runtime scene after the terminal function returns.

### 17.3 Profiler

Profiler sections are:

```text
scene events / load
scene events / signal
scene events / update
scene events / unload
```

The signal section reports total batch time and invocation count. It should not
create an unbounded profiler tree with one permanent node per signal name.
The profiler is stopped and published only after the unload section finishes, so
terminal cleanup time is part of the scene profile.
Linked External Events time is included in the caller's lifecycle section and
also attributed to its function source without double-counting the total.

## 18. Search, refactoring, AI, and MCP

### 18.1 Global search

Scene and External Events results display owner plus lifecycle-function label
and deep-link to the correct function body. Search order follows load, signal,
update, unload within each owner and existing project order across owners.
Replacing text or instructions operates on all four functions.

### 18.2 Refactoring and validation

All whole-project refactorers process all lifecycle functions before a rename
or deletion is committed. A failure in any function aborts the complete
refactor transaction; the tool must not leave only one body updated.

### 18.3 AI placement

AI event generation receives explicit placement guidance:

- initialization, one-time setup, and initial object creation ->
  `sceneLoad`;
- reactions to delivered scene notifications -> `sceneSignal`;
- input, movement, continuous comparisons, timers, and ordinary gameplay ->
  `sceneUpdate`; and
- final synchronous persistence or cleanup before scene-owned state is
  destroyed -> `sceneUnload`.

The model must not add `SceneJustBegins` inside `sceneLoad` or
`SignalReceived` inside `sceneSignal`/`sceneUnload`, and must not place awaited,
signal-emission, or scene-transition actions inside `sceneUnload`.

### 18.4 MCP contract

Scene/External Events read-write tools add:

```text
lifecycleFunctionName: "sceneLoad" | "sceneSignal" | "sceneUpdate" | "sceneUnload"
```

The argument defaults to `sceneUpdate` for existing tool calls. Responses
always return the resolved fixed function name, lifecycle role, owner kind,
`function.settings` URI, and `.events` URI. Bulk search and signal inspection
return lifecycle identity for every site.

In a version-4 project, direct update edits target
`scenes/<Scene>/functions/sceneUpdate/sceneUpdate.events` or
`scenes/<Scene>/externals/<External>/functions/sceneUpdate/sceneUpdate.events`.
Tools discover functions from validated
`function.settings`; they must not infer lifecycle identity from an unowned
filename alone. A v3 `Main.events` source remains readable only through the
migration adapter.

## 19. Compatibility and migration

### 19.1 Existing projects

Opening an existing project performs exactly this mapping:

```text
old layout.events -> sceneUpdate
sceneLoad        -> empty
sceneSignal      -> empty
sceneUnload      -> empty

old externalEvents[i].events -> that owner's sceneUpdate
the other external lifecycle functions -> empty
```

There is no automatic condition analysis or event-body rewrite. A multi-file
v4 save relocates the unchanged update body into its function directory as
specified in section 14.4. In particular:

- `SceneJustBegins` stays in update and runs on the first frame as before;
- `SignalReceived` stays in update and iterates delivered scene signals as
  before;
- event order, IDs, local variables, else chains, groups, links, disabled
  state, and presentation metadata remain unchanged;
- a legacy single-file project that never uses the new optional functions
  serializes with no new body fields; and
- a multi-file v4 project always has the required scene/external update
  function directories but no empty optional lifecycle directories.

### 19.2 Optional author-assisted conversion

A later editor command may offer **Move to On scene load** or **Convert to On
scene signal**, but it is not required for version 1.

Any signal conversion must transform a top-level `SignalReceived(name)`
iterator into a per-callback comparison against `SignalName()`, preserve other
conditions and contiguous else chains, and prove round-trip equivalence before
committing. If that proof is unavailable, the command leaves the event in
`sceneUpdate`. A naive move that retains `SignalReceived` is forbidden.

### 19.3 Older editors

An editor that does not understand the new legacy body fields or lifecycle
function directories must not be presented as a safe writer. Multi-file
version 4 makes version-3 readers reject before writing. The project version
warning for legacy single-file projects should say that saving with an older
editor can discard those function bodies. This specification does not require
older releases to execute new lifecycle functions.

## 20. Performance and safety

- Empty `sceneLoad`, `sceneSignal`, and `sceneUnload` functions generate no helper
  body.
- `sceneUpdate` retains the current generated-code path.
- `sceneSignal` processing is O(delivered scene signals × handler event cost).
- The orchestrator reads the delivered batch without cloning it.
- The existing 10,000-signal dispatch cap remains the only batch cap; this
  feature must not apply a second limit with different overflow semantics.
- Direct signals are never scanned by scene lifecycle code.
- Signal invocation does not retain picked-object arrays between frames.
- Deleting objects or requesting a scene change in a signal callback follows
  current event and signal liveness rules.
- A signal emitted during a callback cannot recursively invoke the callback.
- `sceneUnload` has a re-entry guard and cannot schedule work into a later frame
  of the disposed scene.
- Unlinked External Events lifecycle functions add no per-frame dispatch.
- Lifecycle owner/function URIs receive the same containment, traversal,
  symlink, normalization, collision, and transactional-write protection as
  existing managed sources.

## 21. Implementation impact

Primary areas to change include:

### 21.1 Core and bindings

- `Core/GDCore/Project/Layout.h`
- `Core/GDCore/Project/Layout.cpp`
- `Core/GDCore/Project/ExternalEvents.h` and `.cpp`
- a fixed `SceneLifecycleEventsFunctions` owner and lifecycle-role validation
- `Core/GDCore/Events/Builtin/LinkEvent.cpp` lifecycle-role-aware target resolution
- GDevelop.js bindings and generated Flow types for `gdLayout`,
  `gdExternalEvents`, and the fixed function owner
- all scene-level event workers, finders, refactorers, and dependency walkers

### 21.2 Code generation and runtime

- `GDJS/GDJS/Events/CodeGeneration/EventsCodeGenerator.cpp`
- scene code generation headers and tests
- `GDJS/GDJS/Extensions/Builtin/CommonInstructionsExtension.cpp`
- `GDJS/Runtime/runtimescene.ts`
- `GDJS/Runtime/events-tools/signaltools.ts`
- asynchronous event callback/source-map plumbing

### 21.3 Editor

- `newIDE/app/src/MainFrame/EditorContainers/EventsEditorContainer.js`
- `newIDE/app/src/MainFrame/EditorContainers/ExternalEventsEditorContainer.js`
- `newIDE/app/src/EventsFunctionsExtensionEditor/EventsFunctionEditor.js` as
  the shared Prefab/scene/External Events function-body editor
- `newIDE/app/src/EventsFunctionsList/EventsFunctionsTreeView.js` as the shared
  function-list presentation for every event-function owner
- `newIDE/app/src/SceneContextLifecycleFunctionsEditor/index.js` as the fixed
  scene-owner navigation, lazy-mount, and editor-instance adapter
- event selection snapshots and paths
- global search, validation, outside-editor changes, analytics, and command
  palette integration
- signal-context instruction filtering and diagnostics

### 21.4 Project sources and tooling

- `newIDE/app/src/ProjectsStorage/MultiFileProjectFormat/index.js`
- `newIDE/app/src/ProjectsStorage/LocalFileStorageProvider/LocalMultiFileProject.js`
- `newIDE/app/src/ProjectsStorage/ProjectSourceCatalog.js`
- JavaScript authoring and layout/instruction catalog generation
- MCP scene-event, search, signal, and bulk-edit tools
- the bundled `gdevelop-project-files` skill and references

### 21.5 Documentation

- `docs/Architecture.md`
- `docs/SignalSystem.md`
- `docs/gdevelop-new-formats-spec.md`
- `docs/gdevelop-events-dsl-spec.md`
- user documentation for scene events and signals

## 22. Implementation sequence

The feature remains behind one capability flag until every save and traversal
path understands all lifecycle functions.

1. Add the lifecycle registry, fixed `EventsFunction` owner, Layout and External
   Events integration, legacy body adapters, bindings, copy behavior, and
   exhaustive project walkers.
2. Add code generation and runtime orchestration with load, signal-context,
   terminal ordering, and unload re-entry tests.
3. Add editor navigation, lifecycle-aware scope, selection persistence, undo,
   fixed-metadata policy, and diagnostics.
4. Add Prefab-shaped function directories, External Events owner directories,
   transactional v3 migration, catalogs, MCP, AI, and source APIs.
5. Add debugger, profiler, hot-reload messaging, documentation, and corpus
   tests.
6. Enable the feature only after old-project round trips and new-project
   downgrade warnings pass.

No released intermediate state may load new legacy body fields or lifecycle
function directories but omit them on save.

## 23. Verification requirements

### 23.1 Core and serialization

- Empty old layout -> empty load/signal/unload and unchanged update.
- Old External Events -> empty load/signal/unload and unchanged update.
- All four fixed `EventsFunction` objects serialize their legacy bodies,
  deserialize, copy, assign, clone, duplicate, and delete correctly.
- Construction and source loading enforce fixed names, roles, types, order,
  flags, and signal parameters.
- Missing optional fields are accepted; malformed present fields fail with the
  same precision as malformed update events.
- Every whole-project event walker reaches all lifecycle functions exactly once.
- Refactor failure in one function leaves all lifecycle functions unchanged.

### 23.2 Execution

- Load runs once before the first update.
- Load does not rerun on resume or hot reload.
- Update runs on the first and every later logical frame.
- Zero, one, and many scene signals invoke the signal function zero, one, and many
  times in FIFO order before update.
- Direct-instance signals never invoke the scene signal function.
- Signals emitted by load, signal, and update wait until the next frame.
- Overflow keeps existing global FIFO behavior.
- A signal queued before the first frame produces the documented component and
  scene-lifecycle ordering.
- A scene-change request does not create undocumented lifecycle cancellation.
- A transition request finishes the current rendered frame before a committed
  unload invokes `sceneUnload`.
- Unload runs exactly once for replace, restart, pop, clear, network removal,
  preview disposal, and direct loaded-scene unload paths.
- Push/pause, resume, and hot reload do not run the unload function.
- Unload runs before extension unloading callbacks, object/behavior destruction,
  renderer teardown, signal cleanup, variable release, and resource unloading.
- A scene unloaded before its first logical frame runs unload without running
  load.
- Nested unload and a throwing JavaScript event do not invoke the unload
  function twice or
  prevent teardown.

### 23.3 Context isolation

- Object picks do not leak from load to signal, between two signals, or from
  signal to update.
- Scene/object mutations intentionally remain visible to later lifecycle functions.
- Signal name/payload never leak into update.
- Awaited generated events retain the correct name/payload for each invocation.
- Synchronous and awaited JavaScript behavior follows the documented copy rule.
- Trigger-once state starts once per frame, not once per signal.
- Object picks do not leak from the final update into unload.
- Unload uses its explicit unloading-scene argument even when the scene stack has
  already detached that scene from its active entry.
- Unload can read live scene state synchronously, but no continuation can retain
  that state after teardown.

### 23.4 External Events and Links

- Association alone executes no External Events lifecycle function.
- A Link in each lifecycle role resolves only the target's same-role function.
- Existing update Links execute the external update body with byte-equivalent
  generated behavior and object-picking continuity.
- Two Link sites execute twice; an empty target lifecycle function is a no-op.
- Signal Links preserve the fixed `SignalName` and `Payload` values.
- Unload Links inherit terminal validation transitively.
- A Link in an ordinary lifecycle-neutral Events Function resolves update, while a
  terminal caller still cannot use it to bypass unload restrictions.
- Dependency cycles are detected using owner and lifecycle role.

### 23.5 Editor

- Fixed entries use the exact labels, descriptions, order, and icons.
- Update is the compatibility default.
- Lifecycle-function switching preserves per-function selection/scroll without dirtying the
  project.
- Cross-role move is one undoable transaction.
- Invalid `SignalReceived` placement is blocked with the exact lifecycle-role
  diagnostic.
- Redundant `SceneJustBegins` placement is non-destructively explained.
- Awaited/deferred, signal-emission, future-frame, and scene-transition
  instructions are hidden and rejected in unload.
- Search and debugger deep links open the correct lifecycle function.
- All lifecycle functions support clipboard, comments, groups, links, JavaScript, extraction
  to functions, and outside-editor refresh.
- Scene and External Events lifecycle entries reuse Prefab function-list
  interaction while hiding every fixed-metadata mutation.

### 23.6 Multi-file and tooling

- A version-3 project imports with update unchanged and empty new functions; its
  first successful save upgrades every format marker transactionally to
  version 4, creates required update function directories, and does not create
  empty optional function directories.
- Scene and External Events functions use the exact Prefab-shaped
  `functions/<Function>/function.settings + <Function>.events` structure.
- External Events owner directories and sources are transactionally created,
  moved, renamed, duplicated, watched, autosaved, and removed.
- Decompose -> compose preserves all four function bodies and fixed metadata
  exactly.
- Invalid duplicate/cross-scene/colliding URIs fail before writes.
- MCP calls without a lifecycle function still edit update; role-aware calls edit only the
  requested source.
- Catalog and AI placement rules never recommend `SignalReceived` for new
  authoring in any lifecycle function and never recommend deferred work inside
  unload.

### 23.7 Corpus and regression

- Repository games produce semantically and legacy-JSON-equivalent update-event
  data after v3-to-v4 source migration when new functions are unused.
- Preview/export output for projects not using new functions is behaviorally
  equivalent.
- Signal-system tests continue to prove Prefab/behavior subscription ordering,
  direct routing, deletion safety, and debugger records.
- A stress test delivers 10,000 scene signals with bounded stack depth and no
  quadratic batch copying.

## 24. Acceptance criteria

The feature is complete only when all of the following are true:

1. A scene author can switch among **On scene load**, **On scene signal**,
   **Scene update**, and **On scene unload** as four fixed lifecycle functions,
   without guard conditions.
2. An untouched existing project keeps every event in update and behaves
   identically.
3. Load runs exactly once per runtime scene and never on resume/hot reload.
4. The signal sheet runs once per delivered scene broadcast, FIFO, before
   update, with isolated picks and stable name/payload values.
5. Direct-instance signals remain invisible to scene lifecycle functions.
6. Signals emitted by handlers remain next-frame and non-reentrant.
7. Unload runs exactly once before scene-owned runtime state is destroyed, is not
   run for pause/resume, cannot re-enter unload, and cannot schedule a later
   scene frame.
8. Scene and External Events owners hold real `gd::EventsFunction` objects with
   immutable lifecycle metadata and non-public invocation.
9. External Events expose the same four functions; Links resolve the matching
   role, and association alone never executes them.
10. All serializers, source formats, walkers, editor tools, hot reload,
    preview, export, debugger, profiler, AI, and MCP preserve lifecycle-function
    identity.
11. Version-4 sources use Prefab-shaped function directories for scenes and
    External Events, with a transactional v3 migration.
12. Empty optional functions add no managed source files and negligible runtime
    overhead; the compatibility update function remains required.
13. No save path can silently discard a populated lifecycle function.

## 25. Rejected alternatives

### 25.1 Filter one event list by conditions

Presenting `SceneJustBegins` and `SignalReceived` events as filtered views of
the current list was rejected. Groups, nested conditions, else chains, Links,
disabled conditions, and dynamic expressions make classification ambiguous.
Moving between views would also need hidden condition mutations.

### 25.2 Store lifecycle bodies as bare `EventsList` members

Bare lists would minimize Core changes, but they would make scene lifecycle
entries a second, weaker abstraction beside Prefab lifecycle functions. They
would lose standard function identity, fixed parameters, source mapping,
function-level tooling, and the established function-directory layout. The
chosen model uses real `EventsFunction` objects inside a fixed owner policy, so
generic callable/rename/delete behavior remains unavailable.

### 25.3 Automatically migrate old guarded events

Condition-based migration cannot safely preserve every nested structure,
dynamic signal expression, local variable lifetime, and else chain. The
compatibility mapping to update is exact and reversible, so it is the required
default.

### 25.4 Execute signals immediately

Immediate callbacks would introduce re-entrancy, emitter picking leakage,
deletion hazards, unbounded signal chains, and behavior incompatible with the
implemented signal system. Delivery remains next-frame.

### 25.5 Rename the existing serialized `events` field

Renaming it to `sceneUpdateEvents` would create large project diffs and a
needless migration. The explicit accessor and UI label supply clarity while
the stable serializer field preserves compatibility.

### 25.6 Implement unload as an extension lifecycle callback

`onSceneUnloading` belongs to extension-global lifecycle code and is registered
through a global callback array. Using it for author scene events would make
execution depend on extension registration order and would not give
`gd::Layout` ownership, lifecycle-aware editing, or source identity. `sceneUnload` is
therefore a dedicated scene callback invoked before those extension callbacks.

### 25.7 Keep flat scene and external lifecycle files

Files such as `Main.scene-load.events` or
`externals/Shared.scene-unload.events` were rejected. They do not have a natural
place for function signature/role metadata, scale poorly as lifecycle
capabilities grow, and diverge from Prefab authoring. Version 4 uses
`functions/<Function>/function.settings` plus `<Function>.events`; v3 flat
update files are migration inputs only.

### 25.8 Automatically execute associated External Events

Association supplies editor scope and physical ownership; treating it as a
subscription would make previously dormant External Events run every frame and
could double-run resources already reached by Links. External lifecycle
functions execute only through same-role Links.

---

## Final contract

Scene and External Events use four fixed `gd::EventsFunction` lifecycle entries
with one shared legacy compatibility rule:

```text
existing layout.events         == that scene's sceneUpdate function body
existing externalEvents.events == that external owner's sceneUpdate function body
```

On the first frame, the scene runs load, then each delivered scene signal,
then update. On later active frames, it runs each delivered scene signal and
then update. When the runtime scene is genuinely unloaded, it runs unload once
before extension and object destruction. Signals stay queued, FIFO, next-frame,
and non-reentrant during active frames; terminal events are synchronous and
cannot schedule another scene frame. External Events expose the same functions
and same-role Link resolution without automatic subscription. Version-4 source
trees use the Prefab function directory contract for both owner types, while
the legacy serializer continues to flatten the update body as `events`.
