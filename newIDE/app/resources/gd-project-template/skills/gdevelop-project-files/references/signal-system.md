# Use the GDevelop signal system

Signals are scene-local, queued notifications. Use them for discrete events
between scene logic, prefabs, and behaviors. They are delivered before normal
events on the frame after they are emitted.

The complete engine design is in `docs/SignalSystem.md`. This guide describes
the project-file authoring surface.

## The two signal kinds

There are exactly two destinations:

| Kind | Emit action | Receivers |
| --- | --- | --- |
| Scene signal | `EmitSceneSignal` | Scene events automatically; prefab and behavior instances only after their own explicit subscription |
| Direct instance signal | `EmitSignalToObjectInstance` | Exactly one prefab instance, through that prefab's `onSignal` |

There is no action for an object name, object group, or picked-object list.
Direct signals never invoke behavior handlers and never appear in scene signal
conditions.

## Read the catalog

Before editing an `.events` file, inspect the owner settings and search
`.gdevelop/instructions-catalog.json` for exact instruction types, parameter
`dslName` values, expressions, and scopes:

```sh
rg 'SignalReceived|EmitSceneSignal|EmitSignalToObjectInstance|SubscribeSceneSignal' .gdevelop/instructions-catalog.json
rg 'SignalName|SignalPayload' .gdevelop/instructions-catalog.json
```

The normal surface is:

| Kind | Type/name | Scope |
| --- | --- | --- |
| Condition | `SignalReceived` (shown as **Scene signal received**) | Scene and external-scene events |
| Action | `EmitSceneSignal` | Scene, external scene, prefab, and behavior events |
| Action | `EmitSignalToObjectInstance` | Scene, external scene, prefab, and behavior events |
| Action | `SubscribeSceneSignal` | Prefab and behavior events only |
| Text expression | `SignalName()` | Matching scene-signal event and descendants |
| Text expression | `SignalPayload()` | Matching scene-signal event and descendants |

Always accept the current generated catalog over this summary.

## Timing and ordering

```text
emit during frame N
  -> pending scene-local queue
  -> fixed delivery batch before events in frame N+1
  -> subscribed prefab/behavior handlers
  -> matching scene events
```

- Delivery is FIFO.
- A signal emitted by `onSignal` waits for the following frame.
- The delivery batch is capped at 10,000 signals per frame. Overflow remains
  queued ahead of newly emitted signals.
- Subscriptions are checked at delivery time. Each signal uses a stable
  snapshot of its matching receivers.
- Queued signals and receiver records are cleared when the scene unloads.

## Emit a scene signal

Every emit action needs an effective condition in its event or an ancestor so
it does not run accidentally every frame.

```events
@event aiGeneratedEventId="announce-game-ready"
if SceneJustBegins
do EmitSceneSignal signal_name="\"Game.Ready\"" payload="\"level-1\""
```

Scene events can observe this without registering anything. A prefab or
behavior instance must first run `SubscribeSceneSignal` for the exact,
case-sensitive name.

## Receive a scene signal in scene events

`SignalReceived` is special iteration syntax. Put it as an enabled,
non-inverted, top-level condition of a standard scene or external-scene event:

```events
@event aiGeneratedEventId="handle-game-ready"
if SignalReceived signal_name="\"Game.Ready\""
do DebuggerTools::ConsoleLog message_to_log="SignalPayload()"
```

The event runs once for every matching delivered signal, in FIFO order. Use
`SignalName()` and `SignalPayload()` only in that event or its descendants.
They return empty text outside the temporary scene-signal context.

## Subscribe a prefab or behavior instance

The subscription action has one visible parameter, the signal name. Its
receiver is the current prefab or current behavior instance; do not add an
object or behavior picker.

Usually subscribe from `onCreated`:

```events
@event aiGeneratedEventId="subscribe-locale-change"
do SubscribeSceneSignal signal_name="\"Locale.Changed\""
```

Repeating the same subscription has no additional effect. It remains for the
receiver's lifetime. If reaction should be temporarily disabled, keep a
private prefab or behavior variable and check it inside `onSignal`.

When a behavior is deactivated, its subscription remains but it receives
nothing. Missed signals are not replayed after activation.

## Define prefab onSignal

`onSignal` is a reserved events-based object lifecycle function. Its fixed
parameters are:

1. hidden `Object` object parameter;
2. visible `SignalName` string;
3. visible `Payload` string.

Example settings shape:

```toml
kind = "function"
settingsFormatVersion = 1
folder = []
order = 0
name = "onSignal"
functionType = "Action"
fullName = "On signal"
description = "Handles signals delivered to this prefab."
sentence = "Handle a signal for _PARAM0_"
group = ""
getterName = ""
private = false
async = false
parameters = [{ name = "Object", description = "Object", type = "object", supplementaryInformation = "Cards::CardSlot" }, { name = "SignalName", description = "Signal name", type = "string" }, { name = "Payload", description = "Payload", type = "string" }]
events = "game://extensions/Cards/prefabs/CardSlot/functions/Lifecycle/onSignal/onSignal.events"
objectGroups = { }
```

The same prefab handler receives both subscribed scene signals and direct
instance signals. Branch on the fixed parameters, not the scene expressions:

```events
@event aiGeneratedEventId="handle-card-refresh"
if BuiltinCommonInstructions::CompareStrings first_string_expression="SignalName" comparison_sign="=" second_string_expression="\"Card.Refresh\""
do SetBooleanObjectVariable object="Object" variable="RefreshPending" modification_sign="True"
```

## Define behavior onSignal

`onSignal` is also a reserved events-based behavior lifecycle function. Its
fixed parameters are:

1. hidden `Object` owner parameter;
2. hidden `Behavior` parameter;
3. visible `SignalName` string;
4. visible `Payload` string.

A behavior handler is invoked only for an exact scene signal that this
behavior instance subscribed to. A direct instance signal never invokes it.

## Emit directly to one prefab

Use a positive live `InstanceId()` value:

```events
@event aiGeneratedEventId="refresh-one-card"
if BooleanObjectVariable object="CardSlot" variable="NeedsRefresh" check_if_the_value_is="True"
do EmitSignalToObjectInstance instance_id="CardSlot.InstanceId()" signal_name="\"Card.Refresh\"" payload="\"inventory-changed\""
```

Only that prefab's `onSignal` can receive it. No subscription is needed. If
the instance is gone, or the target prefab does not define `onSignal`, the
runtime reports a diagnostic and dismisses the signal.

## Source identity belongs in the payload

Emitter identity is debugger-only routing metadata. It is not an `onSignal`
parameter and has no event expression or public getter. When application logic
needs source information, encode it explicitly in the payload, for example:

```json
{"sourceInstanceId":42,"value":"selected"}
```

Receivers must validate any structured payload they parse. Do not treat source
data supplied in a payload as automatic authorization.

## Name and payload design

Use stable, case-sensitive semantic names such as `Game.Paused`,
`Card.Selected`, or `Locale.Changed`. Payloads are strings. Prefer empty text,
an ID, or a short enum-like token; use compact JSON only for a genuine
multi-field contract.

Signal names can be centralized in Static Data, for example
`{{signals.card.selected}}`, when a project needs a shared registry. Static
Data is resolved during code generation, not at runtime. Read
[static-data.md](static-data.md) before authoring placeholders.

## Debug and verify

Reload direct project-file edits, start a fresh debug preview, and inspect the
signal monitor. It reports signal ID, name, payload, debugger source, target,
receivers, queue state, throttling, and unhandled delivery.
Delivered scene broadcasts expand into one row per concrete prefab or behavior
receiver instead of presenting the scene itself as their target.
The monitor can rebuild its cards from the runtime's 40 most recent signal
records, so deliveries survive panel rerenders and missed frame updates.

Verify:

1. Emission is condition-guarded.
2. Delivery happens on the next frame.
3. A scene event runs once per matching broadcast.
4. Every prefab and behavior receiver made its own exact subscription.
5. Direct delivery reaches only the target prefab.
6. Deleted receivers receive nothing.
7. Source information needed by gameplay is present in the user payload.

## Common failures

- Expecting a scene broadcast to invoke every `onSignal` automatically.
- Expecting a direct signal to invoke a behavior.
- Trying to target an object name, group, or picked-object list.
- Polling `SignalReceived` outside its supported standard-event shape.
- Using `SignalName()` or `SignalPayload()` inside prefab/behavior `onSignal`.
- Emitting unconditionally every frame.
- Expecting a handler-emitted signal to arrive in the same frame.
- Expecting deactivated behaviors to replay missed signals.
- Looking for emitter parameters or expressions instead of defining source
  information in the payload contract.
