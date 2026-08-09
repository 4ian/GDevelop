# Signal System

> Status: implemented runtime, code-generation, editor, debugger, tooling, and
> documentation contract. Backward compatibility with earlier signal
> prototypes is intentionally out of scope.

The signal system is a scene-local, queued notification system for GDevelop.
It provides two—and only two—ways to emit a signal:

1. Send a signal to exactly one runtime object instance.
2. Emit a scene signal, which is a scene-wide broadcast.

Scene events can receive every scene signal without subscribing. Prefab
instances and behavior instances receive scene signals only after explicitly
subscribing to the signal name. A direct instance signal invokes only the target
prefab's `onSignal` and does not require a subscription.

This revision removes signals addressed to an object name, an object group, or
the current picked objects.

## Table of contents

1. [Goals](#1-goals)
2. [User model](#2-user-model)
3. [Signal data](#3-signal-data)
4. [Dispatch semantics](#4-dispatch-semantics)
5. [Receivers and subscriptions](#5-receivers-and-subscriptions)
6. [Lifecycle handler: onSignal](#6-lifecycle-handler-onsignal)
7. [Event-sheet API](#7-event-sheet-api)
8. [Editor UX](#8-editor-ux)
9. [Runtime architecture](#9-runtime-architecture)
10. [Code generation](#10-code-generation)
11. [Debugging](#11-debugging)
12. [Performance and safety](#12-performance-and-safety)
13. [Design decisions](#13-design-decisions)
14. [Implementation impact](#14-implementation-impact)
15. [Success criteria](#15-success-criteria)

---

## 1. Goals

GDevelop events are well suited to visible, top-to-bottom game logic. Signals
cover a different need: notifying isolated systems that something happened
without introducing immediate, re-entrant event execution.

Typical examples are:

- A prefab instance tells the scene that it was selected.
- Scene events broadcast `onLocaleChange`.
- Scene events reply directly to the prefab instance that requested data.
- A behavior subscribes to `Game.Paused` and updates its owner when notified.
- One object instance sends a private notification to one other instance.

The design has these goals:

- Keep the target model small and unambiguous.
- Never depend on implicit object picking.
- Let scene events observe scene signals without setup.
- Let prefabs and behaviors opt in to only the broadcasts they need.
- Make behaviors self-contained signal receivers.
- Keep delivery queued, deterministic, inspectable, and safe around deletion.

The following are not supported:

- emitting to every instance of an object name;
- emitting to an object group;
- emitting to the current picked objects;
- wildcard or pattern subscriptions;
- synchronous signal delivery;
- signals crossing scene boundaries;
- network synchronization of signals;
- mutable or structured payload objects.

## 2. User model

### 2.1 Two signal kinds

| Kind | Target | Scene events | Prefab and behavior receivers |
| --- | --- | --- | --- |
| Direct instance signal | One runtime object instance ID | Not notified | Only the target prefab is notified; behaviors are never notified |
| Scene signal | The current runtime scene | Always observable | Only explicitly subscribed prefab and behavior instances are notified |

For a prefab, both kinds use the same `onSignal` lifecycle handler. A behavior's
`onSignal` is invoked only for a scene signal to which that behavior instance
explicitly subscribed.

### 2.2 Direct instance signal

A direct signal addresses one concrete runtime object instance:

```text
Emit signal "Inventory.Opened" to instance #42
```

It is a private delivery to that instance. It is not also published to scene
events and is not delivered to other instances of the same object type.

The target instance does not subscribe first. If it is a prefab that defines
`onSignal`, that handler is invoked. Attached behaviors are not inspected or
notified by direct instance delivery, even if they define `onSignal` or have a
scene-signal subscription with the same name.

If the target instance does not define a prefab `onSignal` handler, the runtime
prints a warning and dismisses the signal. It is not forwarded to behaviors or
published to scene events.

The action accepts a runtime instance ID rather than an object name, group, or
object list. One action invocation therefore creates one signal with one target.

### 2.3 Scene signal

A scene signal is a broadcast within the current runtime scene:

```text
Emit scene signal "onLocaleChange"
```

Scene events can observe it directly:

```text
Scene signal received "onLocaleChange"
  Update localized scene text
```

Scene events do not subscribe. They are the scene-level broadcast receiver and
can match any scene signal name through the condition.

Prefab and behavior instances opt in explicitly:

```text
Prefab onCreated:
  Subscribe to scene signal "onLocaleChange"

Prefab onSignal:
  If SignalName = "onLocaleChange"
    Refresh localized labels
```

```text
Behavior onCreated:
  Subscribe to scene signal "onLocaleChange"

Behavior onSignal:
  If SignalName = "onLocaleChange"
    Refresh the behavior-owned presentation
```

Subscribing a prefab does not subscribe its behaviors. Subscribing one behavior
does not subscribe its owner prefab or the owner's other behaviors. Each
receiver owns its subscriptions independently.

### 2.4 Why there is no picked-object action

Object picking is temporary event state, while signal delivery is deferred.
Capturing picked lists across the dispatch boundary adds lifetime rules and
makes a bulk-send action look like one notification even though it has many
receivers.

This revision keeps that choice explicit. To notify several instances, events
iterate them and emit one direct signal per instance. Each queued signal still
has exactly one target and can be inspected independently.

## 3. Signal data

Runtime model:

```ts
type SignalTarget =
  | { kind: "scene" }
  | { kind: "instance"; instanceId: number };

type RuntimeSignal = {
  id: number;
  name: string;
  target: SignalTarget;
  payload: string;
  emitter: {
    objectName: string;
    instanceId: number;
  } | null; // Internal signal-debugger metadata only.
  emittedFrameId: number;
  deliveredFrameId: number | null;
};
```

### 3.1 Name

Signal names are free, case-sensitive strings. Matching is exact. There are no
wildcards, prefixes, or global declarations.

An empty signal name is invalid. The action does not enqueue it and preview
tooling reports a warning.

Names may follow a project convention such as:

```text
onLocaleChange
Game.Paused
Inventory.Opened
```

The signal system does not assign meaning to a naming convention.

### 3.2 Payload

The payload is an optional immutable string. When omitted, it is `""`.

Good payloads are small values or identifiers:

```text
"10"
"fr-FR"
"cardId=7"
```

Structured data is not part of the signal API. A project may encode JSON or
another text format when needed, but signals should remain notifications rather
than a transport for large state.

If receiver logic needs to know who emitted a signal, the author explicitly
includes that information in the payload contract. For example:

```text
"source=Player42"
```

There is no separate user-facing emitter value.
The signal system does not automatically copy debug emitter metadata into the
payload.

### 3.3 Debug emitter metadata

When emitted from prefab or behavior events, the owner runtime object is stored
as the emitter. When emitted from scene or external scene events, the emitter is
the scene and the object emitter fields are empty.

Emitter metadata is diagnostic context used only by the signal debugger. It
does not affect routing and is not exposed through lifecycle parameters,
conditions, expressions, or public signal-context helpers.

## 4. Dispatch semantics

### 4.1 Queued delivery

Signal actions only enqueue. They never call receivers immediately.

Signals emitted during frame N are delivered at the pre-events signal phase of
frame N+1:

```text
Frame N
  scene and object events
    emit signal -> pending queue

Frame N+1
  object/behavior pre-events work
  signal dispatch phase
    deliver the previous pending batch
  generated scene events
    "Scene signal received" conditions observe the delivered scene signals
```

This avoids a receiver deleting or modifying objects while the emitting event
is still running with its original picked lists.

### 4.2 Two-queue rule

At the start of dispatch, the bus moves the pending queue into a fixed delivery
batch. Signals emitted by an `onSignal` handler go into the new pending queue
and are delivered on the next frame, not recursively in the current pass.

This gives every signal exactly one frame boundary and prevents a chain of
handlers from producing an unbounded call stack or an unbounded same-frame
dispatch loop.

### 4.3 FIFO order

Within a delivery batch, signals keep emission order:

```text
emit A
emit B

next frame: deliver A, then B
```

If A's handler emits C:

```text
current frame: deliver A, then B
next frame: deliver C
```

### 4.4 Scene-event observation

The dispatcher publishes the delivered scene-signal batch before generated
scene events run. A `Scene signal received` condition iterates matching entries
in that batch.

If three `onLocaleChange` scene signals were emitted, the condition's sub-events
run three times in FIFO order. The signal expressions refer to the currently
matched entry.

Direct instance signals never appear in this scene-event batch.

### 4.5 Subscription snapshot

Subscriptions are evaluated at delivery time.

- A receiver that subscribes before dispatch can receive an already queued
  scene signal.
- A receiver that is destroyed before dispatch does not receive it.
- A receiver created after emission can receive the signal if it subscribes
  before delivery.

This matches the queued model: a signal has not been delivered until the
dispatch phase begins.

### 4.6 Dispatch limit

The delivery batch has a safety limit, initially:

```text
maxSignalsPerFrame = 10000
```

Signals beyond the limit remain pending for the following frame rather than
being silently discarded. The undelivered tail is placed before signals emitted
during the dispatch pass, preserving global FIFO order. Preview tooling warns
when throttling occurs. A project that continuously produces signals faster
than they can be delivered may still grow its queue, so the debugger also
reports queue size and sustained growth.

## 5. Receivers and subscriptions

### 5.1 Scene events

Scene and external scene events receive all scene signals through the
`Scene signal received` condition. No subscribe action is required or offered
for these event sheets.

Scene events do not receive direct instance signals. A direct signal belongs
only to the targeted prefab instance.

### 5.2 Prefab receiver

In this document, a prefab receiver means an events-based/custom object runtime
instance with an `onSignal` lifecycle function.

It receives:

- every direct signal addressed to its own runtime instance ID;
- every scene signal name to which that particular instance subscribed.

Its subscription does not affect another instance of the same prefab type.

### 5.3 Behavior receiver

A behavior instance is an independent receiver attached to one owner object. It
receives only scene signal names to which that behavior instance subscribed,
while it is active. A direct signal addressed to its owner never invokes the
behavior's `onSignal`.

A behavior subscription is identified by owner instance plus behavior instance,
not merely by behavior type. Two instances of the same behavior can have
different subscriptions.

Deactivated behaviors retain their subscription records but do not receive
signals. Signals skipped while deactivated are not replayed after activation.
Reactivation restores delivery for future signals.

### 5.4 Subscription action

The conceptual action is:

```text
Subscribe to scene signal "onLocaleChange"
```

Runtime-style name:

```ts
subscribeSceneSignal("onLocaleChange")
```

The receiver is implicit:

- In prefab events, it is the current prefab instance.
- In behavior events, it is the current behavior instance.

The action never accepts an arbitrary object, object list, or behavior name.
This prevents one event sheet from secretly managing another receiver's
subscriptions.

Subscriptions are exact-name and idempotent. Calling subscribe repeatedly for
the same receiver and name creates one subscription and one delivery.

The recommended place to establish long-lived subscriptions is `onCreated`.
Calling the action later is valid, but the resulting subscription lasts until
the receiver is destroyed.

### 5.5 Subscription lifetime and consumption state

A scene-signal subscription lasts for the lifetime of the prefab or behavior
instance that created it.

When a receiver is only temporarily interested in a signal, it remains
subscribed and uses its own private variables to decide whether to consume the
notification:

```text
Behavior onSignal:
  Conditions:
    SignalName = "onLocaleChange"
    Private variable ListenForLocaleChanges = true
  Actions:
    Refresh localized content
```

Ignoring a signal in one receiver does not prevent another receiver or scene
events from processing it. There is no shared "consumed" flag on the signal.

When an object is destroyed, the bus removes its prefab subscription records
and the records of all behaviors attached to it. No later direct or scene signal
is delivered to them, including signals that were already queued but not yet
dispatched. Removing a behavior similarly removes that behavior instance's
subscriptions.

### 5.6 Direct delivery bypasses subscriptions

A direct signal represents an explicit prefab address, so subscription filtering
would be redundant:

```text
Emit signal "Refresh" to instance #42
```

Instance #42's prefab handler receives it without subscribing to `Refresh` as a
scene signal. Its behaviors do not receive it.

### 5.7 Missing handlers

Subscribing a receiver that has no `onSignal` implementation is allowed at
runtime but has no effect on delivery. The editor should warn because the
subscription cannot currently be handled.

When a direct signal resolves to an instance without a prefab `onSignal`
implementation, the runtime prints a warning containing the signal name, target
object name, and target instance ID, then dismisses the signal. Attached
behaviors are not a fallback receiver. They can receive only scene signals to
which they explicitly subscribed.

### 5.8 Receiver ordering

For a direct signal, there is at most one receiver: the target prefab's
`onSignal` handler.

For a scene signal, receiver order is:

```text
1. Subscribed prefab and behavior receivers, in subscription registration order.
2. Matching scene-event conditions, in event-sheet order.
```

Repeated subscribe calls do not change the receiver's original registration
position. The order is deterministic and visible in the signal debugger;
projects should not use receiver order as a data-flow dependency.

## 6. Lifecycle handler: onSignal

`onSignal` is an automatically invoked lifecycle function on events-based
objects and events-based behaviors. It is event-driven, not per-frame.

### 6.1 Events-based object signature

Conceptual event-function parameters:

```text
Object                 object    Hidden owner parameter
SignalName             string    Delivered signal name
Payload                string    Delivered payload
```

Generated runtime shape:

```ts
MyPrefab.prototype.onSignal = function (
  signalName,
  payload
) {
  // Generated prefab events.
};
```

### 6.2 Events-based behavior signature

Conceptual event-function parameters:

```text
Object                 object    Hidden owner parameter
Behavior               behavior  Hidden behavior parameter
SignalName             string    Delivered signal name
Payload                string    Delivered payload
```

Generated runtime shape:

```ts
MyBehavior.prototype.onSignal = function (
  signalName,
  payload
) {
  // Generated behavior events; owner is available from this.owner.
};
```

The behavior handler can use its normal `Object` and `Behavior` context. It does
not need the owner prefab to forward the signal.

### 6.3 Delivery sources

A prefab's handler receives direct signals addressed to that prefab and scene
signals to which that prefab instance subscribed. A behavior's handler receives
only subscribed scene signals; direct instance delivery never invokes it.

Signal kind is not added as a lifecycle parameter. Routing has already made the
distinction, and receivers should treat the name as the notification contract.

If a project needs different reactions, it should use different signal names.

### 6.4 Isolated event context

Every `onSignal` call runs with the target object and, for behavior handlers,
the target behavior as its explicit context. It never inherits object picking
from the event that emitted the signal.

Deleting the receiver from inside `onSignal` is allowed. Remaining receiver
calls use liveness checks and continue safely.

## 7. Event-sheet API

### 7.1 Emit actions

Only these emit actions exist:

```text
Emit a scene signal
Emit a signal to an object instance
```

`Emit a scene signal` parameters:

```text
Signal name       string    Required
Payload           string    Optional; defaults to ""
```

`Emit a signal to an object instance` parameters:

```text
Instance ID       number    Required; must identify one live instance
Signal name       string    Required
Payload           string    Optional; defaults to ""
```

Both actions are available in scene, external scene, prefab, and behavior event
sheets.

There are no actions named or equivalent to:

```text
Emit signal to object
Emit signal to object group
Emit signal to picked objects
```

To emit to an instance already available in events, use its `InstanceId()`
expression. An invalid ID, including `0`, does not enqueue a signal and produces
a preview diagnostic.

### 7.2 Subscription action

This action is available only in prefab/object and behavior event sheets:

```text
Subscribe to scene signal
```

Parameter:

```text
Signal name       string    Required
```

The current prefab or behavior instance is implicit. Scene and external scene
event sheets do not show this action because they observe scene signals without
subscriptions.

### 7.3 Scene condition

Scene and external scene event sheets expose:

```text
Scene signal received
```

Parameter:

```text
Signal name       string    Required
```

The condition matches only scene signals. It is not exposed in prefab/object or
behavior event sheets, where `onSignal` is the receiving surface.

### 7.4 Scene signal expressions

Inside sub-events of a matching `Scene signal received` condition:

```text
SignalName()
SignalPayload()
```

They return neutral values outside a matching signal context:

```text
SignalName()       -> ""
SignalPayload()    -> ""
```

Prefab and behavior `onSignal` sheets use their fixed lifecycle parameters
instead of these scene-context expressions.

### 7.5 JavaScript code events

Scene JavaScript code under a matching condition reads the current scene signal
through runtime helpers:

```js
const name = gdjs.evtTools.signal.getSignalName(runtimeScene);
const payload = gdjs.evtTools.signal.getSignalPayload(runtimeScene);
```

Inside prefab or behavior `onSignal` JavaScript code, read the fixed
event-function arguments:

```js
const name = eventsFunctionContext.getArgument("SignalName");
const payload = eventsFunctionContext.getArgument("Payload");
```

Signal context is synchronous. Code that awaits must copy the values it needs
before its first `await`.

## 8. Editor UX

### 8.1 Action presentation

The Signals category contains a small, explicit surface:

```text
Signals
  Emit a scene signal
  Emit a signal to an object instance
  Subscribe to a scene signal       (prefab/behavior sheets only)
```

The removed “Emit a signal to picked objects” action is not shown. Object-name
and object-group variants are also absent.

Suggested sentence forms:

```text
Emit scene signal _PARAM1_ with payload _PARAM2_
Emit signal _PARAM2_ to instance _PARAM1_ with payload _PARAM3_
Subscribe this prefab to scene signal _PARAM1_
Subscribe this behavior to scene signal _PARAM1_
```

The editor chooses “prefab” or “behavior” from the current event-sheet context.

### 8.2 Lifecycle presentation

The events-based object lifecycle group includes:

```text
Lifecycle
  onCreated
  onSignal
  onDestroy
```

The events-based behavior lifecycle group also includes `onSignal` alongside
its existing lifecycle functions.

When creating `onSignal`, the editor creates the fixed parameters and does not
allow them to be renamed, reordered, or removed.

### 8.3 Discoverability and validation

The editor should:

- suggest signal names already used in the project without turning them into a
  required global declaration;
- find emit, subscribe, scene-condition, and `onSignal` sites by signal name;
- warn about an empty signal name;
- warn about subscribing from a receiver with no `onSignal` implementation;
- explain that subscriptions are per instance, not per prefab or behavior type;
- explain that subscriptions last until receiver destruction and that private
  receiver state controls temporary consumption;
- explain that direct instance signals invoke only the target prefab and do not
  require subscriptions.

## 9. Runtime architecture

### 9.1 Scene-local bus

Each `RuntimeScene` owns one signal bus:

```text
RuntimeScene
  SignalBus
    pendingSignals
    deliveredSceneSignalsThisFrame
    sceneSubscriptionsByName
    debugRecords
```

Scene-local ownership ensures that scene change or reload clears signals and
subscriptions naturally. Signals never route into another runtime scene.

### 9.2 Subscription identity

The registry stores receiver records rather than callbacks detached from their
owners:

```ts
type SceneSignalReceiver =
  | {
      kind: "object";
      instanceId: number;
    }
  | {
      kind: "behavior";
      ownerInstanceId: number;
      behaviorName: string;
    };
```

Conceptually:

```ts
Map<string, OrderedSet<SceneSignalReceiver>>
```

This provides exact-name lookup, idempotence, deterministic registration order,
and independent subscriptions for an owner and each behavior.

The runtime may use direct references or indexed identities internally, but it
must validate that the receiver is still live before every call.

### 9.3 Direct-instance resolution

Direct signals resolve by runtime instance ID. The bus should use a scene-level
instance lookup rather than scanning every object instance for each signal.

After resolving the owner:

1. check whether its custom-object/prefab class overrides `onSignal`;
2. if it does, invoke that one handler;
3. otherwise, print a warning and dismiss the signal.

No subscription or attached-behavior lookup occurs for direct signals. A base
no-op `onSignal` method does not count as an implementation.

### 9.4 Scene-signal resolution

For a scene signal, the bus looks up only the ordered subscriber set for that
exact name. It does not scan every instance or every `onSignal` implementation.

For every subscription it:

1. resolves and validates the receiver;
2. skips a deleted receiver;
3. skips a deactivated behavior;
4. verifies that `onSignal` is implemented;
5. invokes the handler with the fixed signal arguments.

The signal is also placed in the delivered scene-signal list for scene events,
regardless of whether any prefab or behavior subscribed.

### 9.5 Conceptual runtime helpers

```ts
gdjs.evtTools.signal.emitSceneSignal(
  runtimeScene,
  name,
  payload
);

gdjs.evtTools.signal.emitSignalToInstance(
  runtimeScene,
  instanceId,
  name,
  payload
);

gdjs.evtTools.signal.subscribeSceneSignal(
  runtimeScene,
  receiver,
  name
);
```

The generated subscription code supplies the implicit receiver. Emission
plumbing may attach an internal debug-emitter record, but this is not signal data
and is not a user-facing action or helper parameter.

### 9.6 Cleanup

The bus removes all subscription records for:

- an object receiver when that object is deleted;
- behavior receivers when their owner is deleted;
- a behavior receiver when the behavior is removed;
- all receivers when the scene unloads.

Cleanup is automatic when the receiver is destroyed.

Hot reload rebuilds or migrates the registry only from live receiver state. It
must not leave subscription records pointing to replaced runtime objects or
behavior instances.

## 10. Code generation

This section describes the generated contracts implemented by the signal
system.

### 10.1 Reserved lifecycle names

`onSignal` is a reserved lifecycle name for both events-based objects and
events-based behaviors. It is automatically invoked by the engine and is not
exposed as a normal callable action.

### 10.2 Fixed parameters

The project refactoring/metadata layer creates the signatures from section 6:

- objects: hidden `Object`, followed by `SignalName` and `Payload`;
- behaviors: hidden `Object` and `Behavior`, followed by `SignalName` and
  `Payload`.

The generator emits prototype methods only for receivers that implement
`onSignal`. Base no-op methods may exist for typing, but receiver detection must
distinguish an override from the base method.

### 10.3 Subscription code generation

The same editor action generates different receiver context by sheet type:

```ts
// Prefab/object events:
subscribeSceneSignal(runtimeScene, currentObject, signalName);

// Behavior events:
subscribeSceneSignal(runtimeScene, currentBehavior, signalName);
```

There is no object or behavior picker in the action metadata.

### 10.4 Scene-condition code generation

Generated scene events iterate delivered scene signals matching the requested
name and establish one temporary signal context per match. Signal expressions
read that temporary context only while the condition's sub-events execute.

Direct signals are never inserted into the delivered scene-signal list, so the
condition cannot consume a private instance notification accidentally.

## 11. Debugging

Signals create indirect control flow, so preview tooling is part of the design.

Example signal monitor:

```text
Signals delivered this frame
  #102 onLocaleChange [scene]
    emitter: scene
    payload: "fr-FR"
    subscribed receivers:
      MainMenu#14 (prefab)
      Label#21.LocalizationBehavior
    scene condition matches: 2

  #103 Inventory.Opened [instance #42]
    emitter: Player#3
    payload: "weapons"
    receivers:
      InventoryPanel#42 (prefab)
```

For a delivered scene broadcast, the signal monitor renders one delivery row
per concrete receiver instead of showing the scene as the target. Prefab rows
use `ObjectName#InstanceId (prefab)`; behavior rows use
`ObjectName#InstanceId.BehaviorName`. A matching scene-event condition is shown
as `scene events`.

The runtime diagnostic keeps the 40 most recent signal records so the monitor
can reconstruct its cards after a panel rerender or a missed frame update.

Diagnostics include:

- pending and delivered counts;
- signal kind, name, payload, emitter, and target instance;
- subscribed receiver identities;
- receivers skipped because they were deleted or deactivated;
- a direct target that no longer exists;
- signals with no receiver or scene-condition match;
- throttling and sustained queue growth;
- large or unusually frequent payloads.

The debugger should also show the current subscriptions of a selected prefab or
behavior instance. This makes an omitted `Subscribe to scene signal` action
visible rather than mysterious.

## 12. Performance and safety

### 12.1 No broadcast scan

A scene signal uses `sceneSubscriptionsByName.get(signalName)`. Delivery cost is
proportional to subscribers for that name, not all scene instances.

### 12.2 No captured picked lists

Because there is no picked-object signal target, the bus never retains a picked
objects list across frames. Direct signals store one instance ID; scene signals
store no target instances.

### 12.3 Deletion safety

If a direct target is deleted before delivery, the signal is not rerouted and
does not throw. It is recorded as undelivered in preview diagnostics.

If a receiver deletes itself during `onSignal`, dispatch continues over a
stable receiver snapshot with liveness checks before later calls.

### 12.4 Subscription and destruction during delivery

Each signal uses a stable snapshot of the subscriber order taken when delivery
of that signal begins.

- Subscribing during a handler does not add a receiver to the signal currently
  being delivered.
- Destroying a receiver during a handler prevents any later delivery to it. A
  liveness check skips its stale entry in the current snapshot.

This rule avoids mutation-dependent iteration bugs while preserving the
delivery-time subscription model between signals.

### 12.5 Behavior activation safety

Behavior activity is checked immediately before invocation. Deactivation by an
earlier receiver therefore prevents a later behavior call in the same dispatch
pass. No signal is buffered for an inactive behavior.

### 12.6 Payload and frequency

Signals should represent discrete transitions. Continuous state such as
position, velocity, or animation time belongs in object state rather than a
signal emitted every frame.

## 13. Design decisions

### 13.1 Exactly two routing modes

The target union is closed to `scene` and `instance`. Object names, groups, and
picked lists are not aliases or hidden conveniences.

### 13.2 Scene events are implicit scene subscribers

Scene events define the scene itself, so requiring them to subscribe would add
setup without improving ownership. The `Scene signal received` condition is
their receiving surface.

### 13.3 Prefabs and behaviors subscribe independently

Explicit subscription keeps scene broadcasts scalable and makes dependencies
visible inside reusable components. Subscription is per runtime receiver, not
per class. It lasts until receiver destruction; temporary interest is expressed
by checking the receiver's private variables inside `onSignal`, not by changing
the subscription registry.

### 13.4 Direct signals require no subscription

A direct signal already names one intended instance. Requiring a second opt-in
would make private request/reply flows fragile and would not reduce broadcast
work. Direct delivery invokes only that prefab's `onSignal`; it never invokes
attached behaviors.

### 13.5 Behaviors have onSignal

A behavior should encapsulate its own notification logic. Without behavior
`onSignal`, an owner prefab would have to receive and forward subscribed scene
signals, coupling otherwise reusable components. Direct instance signals remain
prefab-only by design.

### 13.6 Inactive behaviors do not receive

Deactivation means behavior logic is not running. The subscription remains so
activation does not require re-subscribing, but notifications missed during
deactivation are not replayed.

### 13.7 Subscription matching is exact

Exact strings keep lookup fast and behavior predictable. Wildcards can be
reconsidered later as a separate feature if real projects demonstrate the need.

### 13.8 Delivery is next-frame and non-recursive

The fixed delivery batch prevents hidden re-entrancy and same-frame signal
chains. A signal emitted by a receiver waits until the next frame like any other
signal.

### 13.9 Subscription state is transient

Subscriptions and queued signals are runtime state. They are not saved in
project data or persisted across scene changes. Components establish their
subscriptions from lifecycle events, normally `onCreated`.

### 13.10 Emitter identity is debugger-only

The bus may record the emitting object for signal-debugger diagnostics, but
event logic cannot read it through `onSignal` parameters, conditions,
expressions, or public runtime helpers. An author who needs source identity
defines and encodes it in the payload explicitly.

### 13.11 No backward-compatibility layer

Earlier target variants and action names are removed rather than translated.
Projects using an experimental earlier design are outside this revision's scope.

## 14. Implementation impact

The implementation covers these areas together:

### 14.1 Runtime

- Scene-local signal bus with two queues.
- Target union containing only scene and instance.
- Efficient instance-ID resolution.
- Ordered per-name subscription registry.
- Independent prefab and behavior receiver identities.
- Automatic subscription cleanup.
- Direct prefab `onSignal` dispatch and subscribed active-behavior `onSignal`
  dispatch.

### 14.2 Core and code generation

- `onSignal` lifecycle recognition for events-based objects and behaviors.
- Fixed object and behavior lifecycle parameter signatures.
- Context-aware subscribe generation.
- Scene-condition iteration over delivered scene signals.
- No user-facing emitter parameters, expressions, or signal-context helpers.

### 14.3 Editor metadata

- Two emit actions.
- One context-limited subscription action.
- One scene-only receive condition.
- Scene-context expressions.
- Removal of object, group, and picked-object emit actions.
- Lifecycle editor entries for object and behavior `onSignal`.

### 14.4 Tests

- Exactly-one-instance routing.
- Scene events receiving without subscription.
- Per-instance prefab subscriptions.
- Per-instance behavior subscriptions.
- Object and behavior `onSignal` exposing only `SignalName` and `Payload` beyond
  their hidden owner context.
- Emitter identity remaining private to debugger records.
- Direct signals invoking only the target prefab without subscription.
- Warning and dismissal when a direct target has no prefab `onSignal`.
- Inactive behavior handling.
- Duplicate subscription idempotence and lifetime cleanup.
- Private-variable filtering inside `onSignal`.
- Receiver ordering and next-frame delivery.
- Deletion before and during delivery.
- No scene-condition visibility for direct signals.
- No metadata or helpers for removed target modes.

## 15. Success criteria

The design is successful when all of these statements are true:

- Only scene and direct-instance signals can be emitted.
- A direct signal has exactly one target instance ID.
- No signal action depends on the current picked objects.
- Scene events receive scene signals without subscription setup.
- A prefab receives a scene signal only when that instance subscribed to its
  exact name.
- A behavior receives a scene signal only when that behavior instance subscribed
  and is active.
- A subscription lasts until its prefab or behavior receiver is destroyed.
- A subscribed receiver uses private variables when it wants to ignore a signal
  temporarily.
- Emitter identity is visible only in the signal debugger; receiver logic gets
  source information only when the author includes it in `Payload`.
- Direct signals notify only the target prefab, without a subscription.
- A direct signal whose target has no prefab `onSignal` prints a warning and is
  dismissed.
- `onSignal` is available for both events-based objects and behaviors.
- Signals emitted in one frame are delivered in FIFO order on the next frame.
- Signals emitted during delivery wait for the following frame.
- A deleted receiver is skipped safely and cleaned from subscriptions.
- The debugger makes routing and subscription state inspectable.

---

## Summary

The revised conceptual model is:

```text
Direct instance signal
  -> exactly one object instance
  -> only its prefab onSignal
  -> no subscription
  -> warning and dismissal if prefab onSignal is not defined
  -> never delivered to behaviors
  -> not visible to scene events

Scene signal
  -> all scene events automatically
  -> only explicitly subscribed prefab/behavior instances
  -> each component registers its own lifetime subscriptions
  -> private receiver variables decide whether to consume a delivery
  -> destruction ends delivery automatically
```

Signals remain queued, next-frame, scene-local notifications with string
payloads. Removing object-name, group, and picked-object targets makes routing
explicit. Adding independent behavior subscriptions and behavior `onSignal`
keeps reusable components self-contained without forcing prefab forwarding.

## Scene lifecycle signal callback

Scenes and External Events expose a fixed `sceneSignal` events function in
addition to `sceneLoad`, `sceneUpdate`, and `sceneUnload`. The runtime invokes
the scene function once for every delivered scene broadcast, in FIFO order,
before `sceneUpdate`. Direct-instance signals never invoke it. Its fixed
`SignalName` and `Payload` parameters are snapshotted for asynchronous generated
continuations, and picked-object state is isolated between invocations.

The legacy `SignalReceived` condition remains registered only to load and run
existing `sceneUpdate` events; it is hidden from new-authoring catalogs and
instruction choosers. New handlers use `sceneSignal`, whose shared function
settings UI exposes the fixed, read-only `SignalName` and `Payload` parameters.
Inside `sceneSignal`, authors compare `SignalName()` directly.
Signals emitted from load, signal, or update are queued for the next frame;
signal emission is invalid in the terminal synchronous `sceneUnload` function.
