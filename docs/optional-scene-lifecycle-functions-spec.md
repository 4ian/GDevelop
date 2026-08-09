# Optional Scene and External Lifecycle Functions Specification

- **Status:** Proposed; awaiting approval before implementation
- **Date:** 2026-08-09
- **Amends:** [Scene and External Lifecycle Functions Specification](scene-event-phases-spec.md)
- **Target multi-file format:** 6

## 1. Executive decision

Scene and External Events continue to use the four engine-reserved lifecycle
roles `sceneLoad`, `sceneSignal`, `sceneUpdate`, and `sceneUnload`, but an owner
no longer contains all four roles unconditionally. Each role is an optional,
real `gd::EventsFunction` entry with fixed metadata.

The contract is:

1. A newly created scene contains only `sceneUpdate`.
2. A newly created External Events owner also contains only `sceneUpdate`.
3. The function-list owner row has an Add button. It offers only lifecycle
   roles that are currently missing.
4. Every present lifecycle function has a context menu and can be deleted,
   including `sceneUpdate` and the last remaining function.
5. A missing lifecycle function is semantically an empty function. It is not a
   project error, Link error, code-generation error, or runtime error.
6. Deleting a lifecycle function removes its callback entry. The generated
   dispatcher does not invoke that missing role.
7. Presence is persisted independently from event-body emptiness. An existing
   empty function remains visible after save and reopen; a deleted function
   does not reappear.
8. Names, signatures, invocation order, visibility, async state, and lifecycle
   roles remain engine-owned. Add means selecting one missing reserved role,
   not creating an arbitrary function.

This amendment applies equally to Scene Events and External Events. Their
shared editor must not expose different presence semantics.

Where this document conflicts with the base lifecycle specification, this
document is normative for lifecycle-function presence, creation, deletion,
serialization, editor menus, and missing-role behavior. The base document
remains normative for role names, signal parameters, execution order,
terminal restrictions, and callback context.

## 2. Problem and current behavior

The implemented lifecycle owner physically constructs four permanent
`gd::EventsFunction` objects. The editor therefore always lists all four and
has no Add or Delete operations. Optional legacy body fields and optional
multi-file sources are currently interpreted as synthesized empty functions.

That model has three undesirable effects:

- every scene appears to have callbacks it does not intentionally use;
- the Scene Events function list behaves differently from the shared Prefab,
  Behavior, and Extension function lists; and
- source absence cannot express author intent, because reopening reconstructs
  the missing entry.

Simply hiding an empty row is insufficient. Empty and absent must remain
different authoring states: an author may intentionally create an empty
function before adding events, and that row must survive a save. Conversely,
deleting an empty function must not allow the serializer to recreate it.

The current single-file shape does not encode this difference. It omits empty
optional body arrays, always serializes the update body as `events`, and then
constructs all fixed functions on load. The current multi-file format always
requires `sceneUpdate.settings` plus `sceneUpdate.events`, while optional
roles exist only when their event bodies are non-empty. Both contracts must be
changed together.

## 3. Goals

1. Reuse the shared function-list Add affordance and context-menu interaction
   for Scene and External Events.
2. Show only lifecycle functions that the owner actually contains.
3. Create `sceneUpdate` by default for new owners while allowing it to be
   deleted.
4. Allow all four roles to be added again after deletion.
5. Preserve an existing empty function across every serializer and project
   storage representation.
6. Treat a missing function exactly like an empty body for execution, Links,
   read-only inspection, validation, dependency analysis, and refactoring.
7. Emit no generated callback helper or invocation for a missing function.
8. Preserve fixed lifecycle metadata and prevent arbitrary names, duplicate
   roles, renaming, reordering, visibility changes, or async changes.
9. Keep old projects behaviorally compatible: their current scene event list
   becomes a present `sceneUpdate` function.
10. Make add/delete changes participate in unsaved state, hot reload, source
    catalogs, modification times, and transactional multi-file writes.
11. Avoid dangling GDevelop.js wrappers when the selected function is deleted.

## 4. Non-goals

This amendment does not:

- add lifecycle roles beyond the four already specified;
- allow custom role names or multiple functions for one role;
- allow lifecycle functions to be renamed, reordered, moved into folders,
  made public, made asynchronous, copied, or duplicated;
- change the `sceneSignal` parameter signature;
- change load, signal, update, or unload execution order;
- make External Events execute merely because they are associated with a
  scene;
- insert template events when a lifecycle function is created;
- infer function presence from whether its event body is non-empty;
- convert `SceneJustBegins` or legacy `SignalReceived` conditions; or
- require a callback to exist for signal delivery queues to advance.

## 5. Reserved role and presence contract

### 5.1 Registry

The lifecycle registry remains finite and ordered:

| Order | Role | Label | Parameters | New owner default |
| ---: | --- | --- | --- | --- |
| 0 | `sceneLoad` | On scene load | none | absent |
| 1 | `sceneSignal` | On scene signal | `SignalName: string`, `Payload: string` | absent |
| 2 | `sceneUpdate` | Scene update | none | present |
| 3 | `sceneUnload` | On scene unload | none | absent |

The order is semantic and remains stable even when the visible list is sparse.
For example, an owner containing only load and unload displays load before
unload; their persisted fixed orders remain `0` and `3`.

### 5.2 Presence versus event-body state

Presence and body emptiness are separate state dimensions:

| State | Listed in editor | Persisted function pair | Events execute | Callback helper |
| --- | --- | --- | --- | --- |
| Present, non-empty | yes | yes | yes | generated |
| Present, empty | yes | yes | no authored events | may be optimized as an empty callback |
| Absent | no | no | equivalent to empty | not generated or invoked |

The optimization permitted for a present empty function must be
observationally equivalent to invoking an empty callback. Debuggers, source
catalogs, and the editor still report that the function exists. An absent
function always reports `exists: false` and does not have a callback entry.

### 5.3 Missing means empty

The following behavior is normative whenever a role is absent:

- scene dispatch skips the role without an error;
- a same-role Link to an External Events owner is a no-op;
- dependency and identifier walkers visit no events for that role;
- validation produces no missing-function diagnostic;
- read-only authoring APIs return an empty event result and `exists: false`;
- a write explicitly targeting the role creates it before applying the edit;
- search returns no result for the absent role;
- preview, export, hot reload, debugger, and profiler do not invent a callback;
  and
- deleting `sceneSignal` does not stop the runtime signal queue from draining
  or invalidate legacy signal delivery bookkeeping.

Missing-role equivalence is not a fallback to another role. A missing
`sceneLoad` never executes `sceneUpdate`, and a Link in `sceneUnload` never
resolves to an external update body.

## 6. Editor experience

### 6.1 Function list

`SceneContextLifecycleFunctionsEditor` continues to reuse
`EventsFunctionsTreeView`. Its root row represents the scene or External Events
owner and shows the same right-aligned Add icon used by Prefab/Behavior owners.

Only present lifecycle functions are children of the owner row. The list does
not synthesize rows for missing roles. Search filters present rows only.

When no function is present, the root row remains visible with its Add icon and
the list shows a non-selectable placeholder:

```text
No lifecycle functions attached.
Use + to add one.
```

The event pane shows the same guidance and no borrowed `gdEventsFunction` is
retained.

### 6.2 Add lifecycle function

Clicking the owner-row Add icon opens a menu titled **Add lifecycle function**.
The menu contains missing roles only, in registry order, with their existing
icons and localized labels.

Examples:

- a new scene offers load, signal, and unload because update already exists;
- an empty owner offers all four roles;
- an owner with all four roles disables the Add icon and exposes the tooltip
  **All lifecycle functions are attached**.

Selecting a role performs one owner mutation:

1. insert the role with canonical fixed metadata and an empty event body;
2. mark the Scene or External Events owner unsaved;
3. select and mount the new function editor;
4. refresh the toolbar, project source catalog, and preview hot-reload state;
5. preserve the function even if no event is subsequently added.

The owner-row context menu exposes the same **Add lifecycle function** submenu.
Add never opens the generic arbitrary-function configuration dialog.

### 6.3 Function context menu

Right-clicking a present lifecycle function opens a context menu assembled by
the shared function-list presentation. Scene-specific capabilities allow only
operations that make sense for reserved roles:

- **Function settings** for `sceneSignal`, opening the existing read-only
  parameters dialog;
- a separator when Function settings is present; and
- **Delete** with the standard `Backspace` shortcut.

Load, update, and unload expose Delete only. Rename, make private/public, make
asynchronous, move to folder, duplicate, copy, cut, and use-as-instruction are
not shown. Their metadata remains fixed.

The toolbar Tune button for `sceneSignal` and the context-menu Function
settings item call the same dialog-opening callback.

### 6.4 Delete lifecycle function

Every present role can be deleted, including `sceneUpdate` and the final role.

- Deleting a non-empty function always asks for confirmation and states that
  its events will be removed.
- Deleting an empty function uses the standard lightweight delete flow; it may
  skip the destructive-content confirmation, consistent with shared function
  list behavior.
- Cancel leaves selection, editor state, and project data unchanged.
- Confirm clears the event body, removes role presence, marks the owner
  unsaved, and requests scene-events hot reload.
- Deletion must not leave a settings file, events file, source-catalog entry,
  debugger path, or mounted editor reference for that role.

When the selected role is deleted, selection falls back in this order:

1. `sceneUpdate`, when it still exists;
2. the next present role in registry order;
3. the previous present role; or
4. no selection when the owner is empty.

The selected function is removed from the mounted-editor set immediately.
Its toolbar is cleared before another function toolbar is installed. An open
signal-parameters dialog closes if `sceneSignal` is deleted.

### 6.5 Initial selection and tab restoration

When opening an editor tab:

- restore the last selected role only if that role still exists;
- otherwise select `sceneUpdate` when present;
- otherwise select the first present role in registry order;
- otherwise enter the owner-empty state.

Switching selection remains non-dirty. Add and Delete are project mutations
and must be represented in the owner tab's history/unsaved state. Undoing a
delete, where owner-level history is available, restores the exact body,
presence, selection, and source identity. The confirmation text must not claim
that deletion is undoable when that history surface is unavailable.

## 7. Core data model and API

### 7.1 Stable slots with explicit presence

`SceneLifecycleEventsFunctions` keeps four stable physical slots plus an
explicit presence bit for each role. Stable slots are preferred over erasing
objects from a vector because GDevelop.js and React may temporarily hold a
borrowed wrapper while a deletion update is being committed.

Removing a role resets its slot to canonical fixed metadata with an empty body
and clears the presence bit. It does not move or destroy the other slots.

The proposed native surface is:

```cpp
class SceneLifecycleEventsFunctions {
 public:
  bool Has(SceneLifecycleFunctionRole role) const;
  bool HasRoleName(const gd::String& name) const;

  // Requires a present role. Throws for an absent or unknown role.
  EventsFunction& Get(SceneLifecycleFunctionRole role);
  const EventsFunction& Get(SceneLifecycleFunctionRole role) const;

  // Idempotent. A newly inserted role has canonical metadata and an empty body.
  EventsFunction& Insert(SceneLifecycleFunctionRole role);
  bool Remove(SceneLifecycleFunctionRole role);

  // Read-only semantic fallback used by code generation and Links.
  const EventsFunction& GetOrEmpty(SceneLifecycleFunctionRole role) const;

  template <typename Callback>
  void ForEachPresent(Callback callback);

  template <typename Callback>
  void ForEachPresent(Callback callback) const;
};
```

Named forms exist for GDevelop.js:

```text
hasByName(name)
getByName(name)             # present role required
insertByName(name)
removeByName(name)
```

Unknown names are rejected. Inserting an already present role is idempotent
and preserves its body. Removing an absent role returns `false` and changes
nothing.

`ForEachPresent` replaces whole-project uses of the old unconditional
`ForEach`. Registry enumeration remains a separate definition-level API so UI
Add menus can enumerate missing roles without constructing them.

### 7.2 Compatibility `GetEvents()` API

`Layout::GetEvents()` and `ExternalEvents::GetEvents()` remain compatibility
aliases for `sceneUpdate`:

- the mutable overload ensures `sceneUpdate` is present, then returns its body;
- the const overload returns the update slot's body, which is empty when the
  role is absent, without changing presence.

This preserves legacy authoring code that writes through `getEvents()` while
allowing a deleted update function to remain absent during read-only traversal.
New code must use the lifecycle presence API rather than calling mutable
`GetEvents()` merely to inspect events.

### 7.3 Construction, copying, and clearing

- Normal scene and External Events construction sets only the update presence
  bit.
- A dedicated empty-owner constructor/reset path is available to deserializers
  before applying an explicit presence list.
- Copy, assignment, clone, scene duplication, and External Events duplication
  preserve the exact presence set and all present bodies.
- Project-wide deletion and memory accounting include only present bodies but
  retain the fixed slot allocation.
- `HasValidMetadata` validates canonical metadata for all physical slots and
  validates that presence contains only known role bits.

## 8. Single-file serialization

### 8.1 Explicit presence field

Layouts and External Events add an ordered string array:

```json
{
  "sceneLifecycleFunctions": ["sceneUpdate"],
  "events": []
}
```

The array contains exactly the present roles in registry order. It may be
empty. Unknown names, duplicates, or non-registry order are malformed project
data.

Body ownership remains compatible:

| Role | Body field |
| --- | --- |
| `sceneLoad` | `sceneLoadEvents` |
| `sceneSignal` | `sceneSignalEvents` |
| `sceneUpdate` | `events` |
| `sceneUnload` | `sceneUnloadEvents` |

Every present role serializes its body field even when the body is empty. This
is required to preserve an intentionally created empty function. Optional
absent roles omit their body fields.

For compatibility with older readers, `events: []` remains serialized when
`sceneUpdate` is absent, but `sceneUpdate` is not listed in
`sceneLifecycleFunctions`. New readers treat that empty array as a legacy
compatibility shadow, not as presence. A non-empty body for a role excluded
from the explicit presence list is invalid.

### 8.2 Legacy input without a presence field

When `sceneLifecycleFunctions` is absent, the loader uses the unambiguous
legacy mapping:

- `sceneUpdate` is present and owns the existing `events` body;
- load, signal, and unload are present only when their corresponding body
  field exists, including an explicitly present empty array;
- a missing optional body field means the function is absent, which is
  behaviorally equivalent to the formerly synthesized empty function.

No condition analysis or event movement occurs. After a successful save, the
explicit presence array is emitted.

## 9. Multi-file format version 6

### 9.1 Directory structure

Version 6 keeps the flattened version-5 same-stem structure:

```text
scenes/<Scene>/
  scene.settings
  functions/
    sceneUpdate.settings
    sceneUpdate.events
    sceneSignal.settings
    sceneSignal.events

  external-events/<External>/
    external-events.settings
    functions/
      sceneLoad.settings
      sceneLoad.events
```

The example contains only the functions that exist. Each present role owns
exactly one `.settings` and one same-stem `.events` file, including when the
body is empty. An absent role owns neither file. A half-pair remains invalid.

There is no required `sceneUpdate` pair. An empty `functions/` directory may be
omitted. Function settings retain fixed role order `0..3`; sparse order is
valid.

### 9.2 Versioning and version-5 import

`MULTI_FILE_FORMAT_VERSION` and all component settings markers increase from 5
to 6. Version 6 changes the meaning of an empty optional pair and removes the
required update pair, so silently changing version-5 interpretation under the
same marker is forbidden.

A version-5 source tree has an unambiguous import mapping:

- every discovered lifecycle settings/events pair becomes present;
- missing optional pairs become absent;
- the version-5 required update pair remains present;
- event text and fixed function metadata remain unchanged.

Opening version 5 is read-only until the user approves upgrade under the
existing project migration policy. The first successful version-6 save stages
new markers and any canonical settings changes transactionally, verifies a
compose/decompose round trip, and commits `project.gdevelop` last. There is no
v5/v6 dual-write mode.

### 9.3 Decomposition and composition

Decomposition uses the explicit single-file presence array when available. It
emits a pair for every listed role even when the body array is empty. For
legacy JSON without the array, it applies section 8.2.

Composition derives presence exclusively from validated function pairs and
emits `sceneLifecycleFunctions` in fixed order. It must not delete an empty
pair as a normalization optimization.

Deleting a role stages both files as obsolete in the same journaled
transaction. A failure leaves both old files and the previous owner state
intact. An orphan body, orphan settings file, unknown role, duplicate
case-folded stem, or mismatched metadata fails before project mutation.

Watchers, modification-time tracking, source catalogs, Save As, autosave,
scene/external duplication, and scene/external deletion treat function-pair
presence changes as owner changes.

## 10. Code generation and runtime

The scene dispatcher remains present because the runtime owns the overall
scene-event step, but it checks lifecycle presence before generating role
helpers and call sites:

```text
if sceneLoad exists:   generate and invoke once on first frame
if sceneSignal exists: generate and invoke once per delivered scene signal
if sceneUpdate exists: generate and invoke once per frame
if sceneUnload exists: generate and invoke once before teardown
```

When a role is absent, its helper and callback invocation are omitted. The
dispatcher still performs non-role frame bookkeeping required by the runtime.
In particular, signal-batch delivery, legacy `SignalReceived` compatibility,
trigger-once frame boundaries, and signal queue cleanup cannot be conditional
on `sceneSignal` presence.

A present empty function may compile to a no-op helper or be optimized away,
provided tools continue to report it as present and behavior is identical to
an empty callback. An absent function is never reported as a callback.

External Events remain reusable same-role bodies. A Link targeting an absent
role emits no target events and no diagnostic. It does not fall back to update
and does not create the missing function.

Hot reload handles presence deltas explicitly:

- add installs the new generated role helper when needed;
- delete removes the role helper and all event callback IDs owned by its body;
- deleting update stops per-frame scene events without stopping the runtime
  scene step; and
- deleting unload before teardown prevents the unload callback from running.

## 11. Editor and ownership architecture

`EventsFunctionsTreeView` remains the shared presentation layer for search,
row layout, context menus, keyboard navigation, Add icons, selection, and
resizing. `SceneContextLifecycleFunctionsEditor` supplies a scene-lifecycle
adapter with these capabilities:

```text
canAddReservedRole = true
canDelete = true
canRename = false
canMove = false
canDuplicate = false
canEditVisibility = false
canEditAsync = false
canEditSignalParameters = read-only
```

The adapter builds child rows from `ForEachPresent`, builds the Add menu from
the registry minus the present set, and builds the function context menu from
the capabilities above. Scene Events and External Events containers provide
owner mutation callbacks and unsaved/hot-reload hooks; they do not fork the
TreeView UI.

The stable Core slots prevent a borrowed wrapper address from changing, but
the React editor must still remove a deleted role from its mounted set and
clear its ref. No command may call into a function wrapper after confirming
that role deletion.

## 12. Search, authoring APIs, AI, and MCP

All event paths continue to carry owner kind and lifecycle role. Only present
functions contribute event paths and source catalog entries.

Read APIs targeting an absent valid role return a structured empty result:

```json
{
  "lifecycleFunctionName": "sceneLoad",
  "exists": false,
  "events": []
}
```

They do not throw a missing-function error. Unknown role names still fail.

Write APIs targeting an absent valid role insert it first and then apply the
write atomically. If parsing, validation, or write composition fails, the
newly inserted empty role is rolled back. Delete APIs are idempotent and
return whether a role actually existed.

AI placement may create a missing role when the requested event semantics
clearly require that role. It must report the creation in its edit summary.
Read-only analysis never creates a function as a side effect.

## 13. Compatibility and migration

### 13.1 Existing single-file projects

Every existing layout and External Events `events` body becomes a present
`sceneUpdate` function with byte-equivalent event order and semantics.
Optional lifecycle body fields become present roles only when those fields
exist. Formerly synthesized empty optional roles become absent, which is
runtime-equivalent and only reduces list noise.

### 13.2 Existing multi-file projects

Version-5 pair presence maps directly to version-6 function presence. No event
body is moved or rewritten. Existing empty optional pairs, if any, remain
present. The required version-5 update pair remains present.

### 13.3 Older writers

Older editors do not understand role deletion or the explicit single-file
presence field. Normal downgrade warnings must state that an older writer can
recreate `sceneUpdate`, discard optional empty-function presence, or lose new
lifecycle bodies. Multi-file version markers prevent an older writer from
silently saving version 6.

### 13.4 Compatibility APIs

Legacy code that writes through mutable `layout.getEvents()` or
`externalEvents.getEvents()` recreates `sceneUpdate`. This behavior is
intentional: the legacy API represents update events. Read-only calls and
whole-project walkers must use const/presence-aware APIs to avoid recreating a
deleted role.

## 14. Error handling and validation

The following are valid states:

- any subset of the four roles, including none;
- a present role with an empty body;
- a Link whose target owner lacks the caller's role; and
- a scene with no update function.

The following are errors:

- unknown lifecycle role names;
- duplicate roles or function sources;
- mutable fixed metadata, wrong signal parameters, or wrong fixed order;
- a present role without its required serialized body;
- a multi-file half-pair;
- an absent role with a non-empty legacy body;
- a context-menu mutation attempted through a stale deleted-function wrapper;
  and
- any Add/Delete storage transaction that cannot be committed atomically.

UI deletion failures keep the role selected and show the existing error box.
The project is not marked successfully saved until all presence and body files
commit.

## 15. Performance and safety

- Presence checks are a four-bit constant-time operation.
- Whole-project traversal skips absent roles and does no synthetic allocation.
- A scene with no lifecycle functions retains only the existing dispatcher
  bookkeeping required by the runtime.
- Missing External Events roles add no generated Link body.
- Present empty roles may be code-generation optimized, but their persisted
  presence cannot be optimized away.
- Removing a role clears its events and callback IDs so stale async callbacks
  cannot execute deleted authored logic.
- Stable physical slots avoid invalidating unrelated role wrappers.
- Signal queues are drained independently of handler presence, preventing
  unbounded accumulation when `sceneSignal` is deleted.

## 16. Affected layers and implementation sequence

### 16.1 Core and bindings

Primary files:

- `Core/GDCore/Project/SceneLifecycleEventsFunctions.h/.cpp`
- `Core/GDCore/Project/Layout.h/.cpp`
- `Core/GDCore/Project/ExternalEvents.h/.cpp`
- all project walkers currently calling unconditional `ForEach`
- `Core/GDCore/Events/Builtin/LinkEvent.cpp`
- `GDevelop.js/Bindings/Bindings.idl` and regenerated declarations

Implement presence, stable slots, Insert/Remove/Has, exact copying, explicit
single-file serialization, and binding APIs first.

### 16.2 Code generation and runtime

Primary files:

- `GDJS/GDJS/Events/CodeGeneration/EventsCodeGenerator.cpp`
- External Events Link resolution and dependency analysis
- hot reload callback-map handling
- signal delivery bookkeeping

Make every role call conditional while preserving dispatcher frame work and
missing-role no-op semantics.

### 16.3 Editor

Primary files:

- `newIDE/app/src/SceneContextLifecycleFunctions`
- `newIDE/app/src/SceneContextLifecycleFunctionsEditor`
- `newIDE/app/src/EventsFunctionsList`
- `EventsEditorContainer.js`
- `ExternalEventsEditorContainer.js`

Add the owner Add menu, present-only rows, constrained context menus, deletion
selection fallback, empty-owner state, shared settings action, unsaved state,
and wrapper cleanup.

### 16.4 Project sources and tools

Primary files:

- `newIDE/app/src/ProjectsStorage/MultiFileProjectFormat`
- local multi-file reader/writer/watcher/transaction code
- project source catalogs and JavaScript authoring APIs
- MCP editor bridge and event tools
- bundled project-authoring skill references
- lifecycle and format documentation

Raise format markers to 6, preserve empty pairs, remove the required-update
rule, implement v5 import, and expose `exists` without read-side creation.

### 16.5 Rollout

1. Land Core presence APIs and serialization behind the lifecycle editor
   capability flag.
2. Update all traversals, code generation, Link resolution, and hot reload.
3. Update the editor Add/Delete/context-menu workflow.
4. Update single-file adapters, multi-file v6, catalogs, MCP, and authoring
   guides.
5. Rebuild GDevelop.js and run cross-layer integration suites.
6. Enable Add/Delete only after old-project round trips and v5-to-v6 migration
   tests pass.

No intermediate release may expose Delete while a save path can recreate or
discard the presence state.

## 17. Verification requirements

### 17.1 Core model

- New Layout and External Events owners contain update only.
- Insert each missing role produces canonical metadata and an empty body.
- Insert is idempotent and preserves an existing body.
- Remove every role, including update and the final role, succeeds.
- Remove clears the body and leaves other slot addresses stable.
- Remove absent returns false.
- Copy, assignment, clone, and duplication preserve exact presence and bodies.
- `ForEachPresent` visits only present roles in fixed order.
- Mutable legacy `GetEvents()` recreates update; const access does not.

### 17.2 Serialization

- Explicit presence round-trips all 16 possible role subsets for both Layout
  and External Events.
- Present empty and absent remain distinguishable after round trip.
- Legacy JSON without presence creates update and preserves old events.
- Optional legacy body fields create their matching roles.
- Deleted update emits an empty compatibility `events` array but remains
  absent after reload.
- Unknown, duplicate, unordered, or body-mismatched presence data is rejected.

### 17.3 Multi-file storage

- Version 6 round-trips all role subsets.
- Every present empty role writes both same-stem files.
- Every absent role writes neither file.
- No update pair is required.
- Half-pairs and duplicate/colliding stems fail before mutation.
- Delete removes both files transactionally; rollback restores both.
- Version-5 import maps discovered pairs exactly and does not rewrite events.
- Watchers, Save As, autosave, rename, duplicate, and modification times see
  presence changes.

### 17.4 Editor

- A new owner lists update only and offers the other three in Add.
- An empty owner shows its placeholder and all four Add choices.
- Add selects the new function, marks unsaved, and persists it while empty.
- Add is disabled when all four roles exist.
- Every role has a Delete context-menu action and Backspace behavior.
- Signal also has Function settings; the toolbar and menu open one dialog.
- Rename/move/visibility/async/copy actions never appear.
- Deleting selected update chooses the specified fallback.
- Deleting the last role leaves a usable Add-only editor.
- Cancelled and failed deletion preserve selection and data.
- Deleted editors and toolbars retain no stale borrowed wrappers.
- Scene and External Events use identical presence interaction.

### 17.5 Execution and Links

- Each present role retains the base specification's invocation semantics.
- Each absent role produces no callback invocation.
- A scene with no roles runs without errors.
- A scene without update performs no authored per-frame events.
- A scene without signal still drains signals and preserves legacy delivery
  bookkeeping.
- External same-role Link to an absent function is a no-op without fallback.
- Add/delete hot reload installs/removes helpers and callback IDs correctly.
- Delete unload before teardown prevents the unload callback.

### 17.6 Tools and regression

- Read absent returns `exists: false` and empty events without mutation.
- Write absent creates the role atomically.
- Delete tools are idempotent.
- Search, refactoring, dependencies, diagnostics, debugger, and profiler skip
  absent roles without errors.
- Repository legacy projects preserve update behavior and do not gain visible
  empty optional rows.
- Preview/export output remains behaviorally equivalent when missing roles are
  treated as empty.

## 18. Acceptance criteria

The amendment is complete only when:

1. New Scene and External Events owners show only Scene update.
2. Authors can add any missing reserved role from the owner Add button or root
   context menu.
3. Authors can delete any present role from its context menu, including update
   and the final role.
4. An existing empty role survives save/reopen, while a deleted role stays
   deleted.
5. Missing roles behave exactly like empty functions and never cause a Link or
   runtime error.
6. Missing roles have no generated callback invocation.
7. Fixed names, signatures, order, visibility, and async metadata cannot be
   edited.
8. Old projects retain their update events and runtime behavior.
9. Single-file presence and multi-file pairs round-trip every role subset.
10. All consumers, tools, and walkers are presence-aware and no read path
    accidentally recreates update.

## 19. Alternatives considered

### 19.1 Hide empty functions without persisting presence

Rejected because an intentionally created empty function and a deleted
function would be indistinguishable after reopening.

### 19.2 Keep all four functions and add an `enabled` flag

Rejected because disabled rows would still be attached functions, source
ownership would remain ambiguous, and Add/Delete would become disguised
enable/disable operations. Explicit presence better matches the shared
function-list model.

### 19.3 Require Scene update

Rejected by the requested contract that all lifecycle functions can be
deleted. The runtime dispatcher can safely exist without authored update
events.

### 19.4 Treat a missing External Events role as an error

Rejected because missing is defined as empty. A same-role Link must therefore
be a no-op, matching a present empty target body.

### 19.5 Fall back missing roles to Scene update

Rejected because it changes lifecycle timing and could run update logic during
load, signal delivery, or unload.

### 19.6 Infer presence from a non-empty body

Rejected because it prevents empty function creation and makes deleting the
last event implicitly delete the function.

### 19.7 Change multi-file semantics without a version bump

Rejected because version 5 requires update and omits empty optional pairs.
Version 6 makes the new presence contract explicit and migratable.

## 20. Resolved decisions and open questions

Resolved decisions:

- The feature applies to both Scene and External Events.
- New owners contain Scene update only.
- All roles, including update and the final role, are deletable.
- Missing roles are empty/no-op, not errors.
- Add offers only missing reserved roles.
- Context menus expose only applicable fixed-role actions.
- Empty present roles are persisted.
- Multi-file format increases to version 6.

Open questions: none. Implementation must wait for explicit approval of this
amendment.

