# Use the GDevelop signal system

Signals are scene-local, queued notifications. Use them to announce that
something happened without making the sender know every receiver. They are a
good boundary between scene orchestration and reusable custom objects/prefabs;
they are not a replacement for ordinary conditions, function calls, variables,
or continuous state.

## Contents

1. [Mental model](#mental-model)
2. [Choose signals deliberately](#choose-signals-deliberately)
3. [Read the instruction catalog first](#read-the-instruction-catalog-first)
4. [Targets and receivers](#targets-and-receivers)
5. [Emit a signal](#emit-a-signal)
6. [Receive a scene signal](#receive-a-scene-signal)
7. [Receive a signal in a prefab with onSignal](#receive-a-signal-in-a-prefab-with-onsignal)
8. [Sender identity and replies](#sender-identity-and-replies)
9. [Name and payload design](#name-and-payload-design)
10. [Complete patterns](#complete-patterns)
11. [Timing, ordering, and lifetime](#timing-ordering-and-lifetime)
12. [Debug and verify](#debug-and-verify)
13. [Failure patterns](#failure-patterns)
14. [Authoring checklist](#authoring-checklist)

## Mental model

The signal pipeline is:

```text
guarded event action in frame N
  -> queue signal and capture its target/sender/payload
  -> pre-events dispatch in frame N+1
  -> matching custom-object onSignal handlers run
  -> scene events evaluate matching SignalReceived conditions
```

The important consequences are:

- Emission is not a synchronous function call. Code after the emit action does
  not observe a receiver's reaction immediately.
- Delivery is deterministic FIFO. Signals emitted by an `onSignal` receiver
  during dispatch are appended and delivered later in that same FIFO dispatch
  cycle, without re-entering the event that originally emitted the signal.
- The bus belongs to one runtime scene. Signals do not cross scene changes and
  queued/delivered state is cleared when the scene unloads.
- Signal payloads are text at the event surface.
- Object picking does not leak across the boundary. A picked-object target is
  captured when the signal is emitted, not read from a later picking list.

Keep this sentence in mind: events decide what happened; signals announce what
happened; receivers react at the next dispatch seam.

## Choose signals deliberately

Use a signal when one or more of these are true:

- A reusable prefab must notify the scene without knowing a scene object name.
- A scene must send a command/event to a specific prefab instance.
- Several independent receivers may react to the same occurrence.
- Sender and receiver should have a stable, documented message contract rather
  than a direct dependency.

Prefer a normal function call when the caller intentionally invokes one known
component and needs immediate, ordered work. Prefer variables when representing
state that must be queried later, saved, synchronized, or changed continuously.
Prefer ordinary conditions for facts already available in the current frame.

Do not emit a signal every frame merely to mirror position, velocity, health,
or another continuously readable value. Signal transitions such as
`Health.Damaged`, `Health.Depleted`, or `Game.Paused`; store the resulting state
in variables.

## Read the instruction catalog first

Before editing an `.events` file, read its owner settings and search
`.gdevelop/instructions-catalog.json`. The catalog is the only authoring
contract for exact instruction `type`, parameter `dslName`, expression name,
and allowed event scope.

Search narrowly:

```sh
rg 'SignalReceived|EmitSceneSignal|EmitSignalToObjectInstance|EmitSignalToPickedObjects' .gdevelop/instructions-catalog.json
rg 'SignalName|SignalPayload|SignalSenderObjectName|SignalSenderInstanceId' .gdevelop/instructions-catalog.json
```

The built-in signal surface normally exposed for new AI-authored events is:

| Kind | Type/name | Purpose |
| --- | --- | --- |
| Condition | `SignalReceived` | Iterate scene-targeted signals with one name in a scene/external-scene event |
| Action | `EmitSceneSignal` | Broadcast to scene receivers and eligible custom objects |
| Action | `EmitSignalToObjectInstance` | Target one runtime instance ID |
| Action | `EmitSignalToPickedObjects` | Target a snapshot of the current picked instances |
| Text expression | `SignalName()` | Name of the current scene-received signal |
| Text expression | `SignalPayload()` | Payload of the current scene-received signal |
| Text expression | `SignalSenderObjectName()` | Sender object name, or empty text |
| Number expression | `SignalSenderInstanceId()` | Sender instance ID, or `-1` |

`EmitSignalToObject` and `EmitSignalToObjectGroup` exist in the runtime/editor
implementation but are hidden authoring instructions. The generated catalog
intentionally excludes hidden and deprecated instructions. Never author either
type unless it is actually present in the current project's generated catalog.

Scope also matters. Scene/external-scene sheets can use scene receiving and
the scene-only expressions. Extension event sheets normally expose only
`EmitSceneSignal` and `EmitSignalToObjectInstance`; picked-object emission is a
layout-event operation. Always accept the current catalog over this summary.

The examples below use current built-in names and common generated `dslName`
values such as `signal_name`, `payload`, `instance_id`, and `objects`. Verify
each against the project catalog before copying it.

## Targets and receivers

Choose the smallest target that expresses the contract:

| Target | Receivers | Scene `SignalReceived` sees it? | Typical use |
| --- | --- | --- | --- |
| Scene | Custom-object instances with an actual `onSignal` override, then scene receiver events | Yes | Prefab announces an event; scene broadcasts a mode change |
| One instance ID | That one eligible custom-object instance | No | Request/reply or command to one prefab |
| Picked objects | The eligible custom objects picked at emission time | No | Send one command to a selected subset |
| Object name/group | Matching eligible custom objects | No | Runtime supports this, but authoring actions are hidden by default |

A scene-targeted signal is a broadcast. Every loaded custom-object instance
whose generated runtime class overrides `onSignal` can receive it, even when
the scene also has a `SignalReceived` event. Object-targeted signals never
appear in `SignalReceived`; they are consumed through object `onSignal` only.

Targeting a built-in Sprite, Text object, or another object type without an
`onSignal` override does not create a useful receiver. Target a prefab or other
events-based custom object that owns the reserved lifecycle handler.

## Emit a signal

Every emit action must be condition-guarded in its event or an ancestor. Signal
emission is a side effect; an unconditional root action would enqueue a new
signal every frame.

Scene broadcast:

```events
@event aiGeneratedEventId="announce-game-ready"
if SceneJustBegins
do EmitSceneSignal signal_name="\"Game.Ready\"" payload="\"level-1\""
```

Target a selected custom object. The `for each` and condition establish the
picked instance set that the action snapshots:

```events
@event aiGeneratedEventId="highlight-selected-card"
for each Card
> if NumberObjectVariable object="Card" variable="Selected" comparison_sign="=" value="1"
> do EmitSignalToPickedObjects objects="Card" signal_name="\"Ui.Card.Highlight\"" payload="\"on\""
```

Target one instance by a valid positive unique ID:

```events
@event aiGeneratedEventId="reply-to-requester"
if SignalReceived signal_name="\"Inventory.RequestAccepted\""
do EmitSignalToObjectInstance instance_id="SignalSenderInstanceId()" signal_name="\"Inventory.Commit\"" payload="SignalPayload()"
```

Only use the last pattern when the incoming signal is known to come from an
object. A scene-originated signal has sender ID `-1`; non-finite, zero, and
negative target IDs are ignored and are not queued.

Empty signal names are also ignored. An omitted payload becomes empty text.
Numbers, booleans, and variables are normalized to text by the runtime/event
surface; explicitly use the catalog-appropriate conversion when it makes the
contract clearer.

## Receive a scene signal

`SignalReceived` is special code-generation syntax, not an ordinary boolean
poll. It must be an enabled, non-inverted condition directly in the condition
list of a standard event. The generated event loops once over every delivered
scene signal with the requested name, establishes the current-signal context,
runs the remaining conditions/actions/subevents, and then clears the context.

Canonical shape:

```events
@event aiGeneratedEventId="handle-game-ready"
if SignalReceived signal_name="\"Game.Ready\""
do DebuggerTools::ConsoleLog message_to_log="SignalPayload()"
```

Additional filters belong beside the signal condition in the same event:

```events
@event aiGeneratedEventId="handle-ready-when-enabled"
if SignalReceived signal_name="\"Game.Ready\""
if BooleanVariable variable="ReadyHandlingEnabled" check_if_the_value_is="True"
do DebuggerTools::ConsoleLog message_to_log="SignalSenderObjectName() + \" sent \" + SignalPayload()"
```

Do not bury `SignalReceived` in an OR group's nested condition representation,
invert it, disable it, or use it only in a child event. Keep it top-level in
the receiving standard event. Use `SignalName()`, `SignalPayload()`, and sender
expressions only in that event's actions or descendants. Outside a current
scene-signal context they return empty text, and sender ID returns `-1`.

If three same-name scene signals are delivered in one frame, the receiver event
runs three times, once with each signal's payload and sender context.

## Receive a signal in a prefab with onSignal

`onSignal` is a reserved lifecycle function on an events-based object/prefab.
It is not a behavior lifecycle and not a free extension function. The editor
and whole-project refactorer enforce this exact parameter order:

1. `Object`: internal owner object parameter with the prefab's full object type.
2. `SignalName`: visible string parameter.
3. `Payload`: visible string parameter.

When adding it directly, create
`prefabs/CardSlot/functions/Lifecycle/onSignal/function.settings` and its
sibling `onSignal.events`. Use the same complete metadata shape as sibling
prefab functions and verify the fields against `settings-catalog.json`:

```toml
kind = "function"
settingsFormatVersion = 1
folder = []
order = 0
name = "onSignal"
functionType = "Action"
fullName = "On signal"
description = "Handles queued signals delivered to this card slot."
sentence = "Handle a signal for _PARAM0_"
group = ""
getterName = ""
private = false
async = false
parameters = [{ name = "Object", description = "Object", type = "object", supplementaryInformation = "Cards::CardSlot" }, { name = "SignalName", description = "Signal name", type = "string" }, { name = "Payload", description = "Payload", type = "string" }]
objectGroups = []
events = "game://extensions/Cards/prefabs/CardSlot/functions/Lifecycle/onSignal/onSignal.events"
```

In the body, branch on the fixed parameters `SignalName` and `Payload`. Do not
use scene-only `SignalPayload()` or `SignalSender*()` expressions here:

```events
@event aiGeneratedEventId="handle-card-highlight-signal"
if BuiltinCommonInstructions::CompareStrings first_string_expression="SignalName" comparison_sign="=" second_string_expression="\"Ui.Card.Highlight\""
do SetBooleanObjectVariable object="Object" variable="Highlighted" modification_sign="True"

@event aiGeneratedEventId="handle-card-clear-highlight-signal"
if BuiltinCommonInstructions::CompareStrings first_string_expression="SignalName" comparison_sign="=" second_string_expression="\"Ui.Card.ClearHighlight\""
do SetBooleanObjectVariable object="Object" variable="Highlighted" modification_sign="False"
```

The string comparison type and its `dslName` parameters must come from the
current catalog. If that catalog uses a newer comparison instruction, use it
instead. Do not fall back to the hidden compatibility type `StrEqual`.

One `onSignal` call is made per matching target instance per delivered signal.
The runtime skips custom objects that only inherit the empty base implementation
and do not override the lifecycle.

## Sender identity and replies

When an emit action runs inside a prefab/custom-object function, code generation
uses its owner `Object` as the sender. A scene or external-scene emitter has no
object sender. Scene receivers can read:

- `SignalSenderObjectName()` for the sender's scene object name.
- `SignalSenderInstanceId()` for its unique runtime ID.

The sender is attribution, not authorization. Validate the signal name and
payload before changing important state. Do not assume that an object name
alone identifies one instance.

A clean request/reply contract is:

```text
CardSlot onSignal receives Inventory.Query
  -> CardSlot emits scene signal Inventory.Request with a small payload
  -> scene SignalReceived handles Inventory.Request
  -> scene replies to SignalSenderInstanceId() with Inventory.Result
  -> only the requesting CardSlot receives Inventory.Result in onSignal
```

This lets the prefab remain independent of scene object names. A scene receiver
that forwards another signal is considered scene-originated unless it passes
through an object-function context; sender identity is not implicitly inherited
from the signal currently being handled.

## Name and payload design

Treat each signal as an API contract.

Use stable, semantic, dotted names such as:

- `Game.Paused`
- `Card.Selected`
- `Health.Damaged`
- `Inventory.Request`
- `Inventory.Result`

Name an occurrence, request, or result—not the implementation that happens to
handle it. Prefer `Health.Depleted` over `DeleteEnemyNow`. Document the emitter,
target, payload format, receivers, and whether a reply is expected.

Keep payloads small:

- Empty text for a pure notification.
- An ID, enum-like token, or short value for a simple contract.
- Compact JSON text only when several fields must travel together.

If JSON is used, receivers must validate/parse it and tolerate contract
evolution. Do not send whole mutable state trees every frame. `onSignal` does
not expose sender expressions, so include sender-related application data in
the payload when the handler genuinely needs it.

Signal names can be centralized in Global Config, for example
`{{signals.card.selected}}`, when a project needs one static registry shared by
emitters. Read [global-config.md](global-config.md) before doing this; the
placeholder is resolved at code generation and is not a runtime lookup.

## Complete patterns

### Prefab announces an event to the scene

Inside a guarded prefab function or `onSignal` branch:

```events
if BooleanObjectVariable object="Object" variable="SelectionChanged" check_if_the_value_is="True"
do EmitSceneSignal signal_name="\"Card.Selected\"" payload="Object.VariableString(CardId)"
do SetBooleanObjectVariable object="Object" variable="SelectionChanged" modification_sign="False"
```

In the scene:

```events
if SignalReceived signal_name="\"Card.Selected\""
do DebuggerTools::ConsoleLog message_to_log="\"Selected card: \" + SignalPayload()"
```

The scene can also inspect the sender ID to associate the response with the
exact card instance.

### Scene commands a picked prefab subset

First establish a deterministic picked set, then emit:

```events
for each CardSlot
> if BooleanObjectVariable object="CardSlot" variable="ShouldRefresh" check_if_the_value_is="True"
> do EmitSignalToPickedObjects objects="CardSlot" signal_name="\"Card.Refresh\"" payload="\"inventory-changed\""
```

Each targeted `CardSlot` receives one `onSignal("Card.Refresh", ... )` call on
the next dispatch. The scene does not receive this object-targeted signal.

### Project-owned static signal registry

`config.settings`:

```toml
[gdevelopConfig]
settingsFormatVersion = 1

[settings.signals.card]
selected = "Card.Selected"
refresh = "Card.Refresh"
```

Emitter:

```events
if SceneJustBegins
do EmitSceneSignal signal_name="\"{{signals.card.refresh}}\"" payload="\"startup\""
```

Receiver:

```events
if SignalReceived signal_name="\"Card.Refresh\""
do DebuggerTools::ConsoleLog message_to_log="SignalPayload()"
```

Because placeholders are currently replaced in action string parameters, use
them safely at emit sites. Do not assume placeholder replacement in a receiving
condition; keep the receiver's stable literal contract unless its catalog and
code-generation support are explicitly verified.

## Timing, ordering, and lifetime

- A signal emitted during normal events in frame N is dispatched before normal
  events in frame N+1.
- Signals emitted from `onSignal` while the queue is being dispatched join the
  same FIFO cycle and can be visible to scene receivers in that frame.
- Delivery has a hard safety cap of 10,000 signals per dispatch cycle. Further
  signals are dropped and diagnostics record the problem. Never construct a
  signal cycle such as `A -> B -> A` without a terminating state/limit.
- Picked targets are copied to a long-lived list. Later caller picking changes
  do not retarget the signal. A target deleted before dispatch is skipped.
- Missing object targets simply have no receiver; they do not create runtime
  object lists.
- The receiver index is refreshed with scene loading/object registration and
  signals never survive scene unload.

## Debug and verify

After direct edits, reload the project before previewing. Start a fresh debug
preview and open the Debugger's signal monitor. Preview diagnostics exist even
when visual signal animations are disabled.

The monitor shows recent signal ID, name, payload, source, destination, and
status. Important statuses are:

- Delivered: at least one relevant receiver handled the signal.
- `NO RECEIVER`: target/name had no matching receiver.
- `DROPPED`: dispatch safety limit or another runtime guard discarded it.

Use the preview option for signal animations when spatial source/target lines
would help, and use the monitor for the authoritative delivery record. Verify:

1. The emitter runs only under the intended condition.
2. The signal is queued in frame N and handled at the expected later seam.
3. The target kind is correct and the intended instance(s) receive it.
4. Scene receivers run once per matching scene signal.
5. Payload and sender values match the documented contract.
6. No repeated `NO RECEIVER`, `DROPPED`, or per-frame signal flood appears.

## Failure patterns

- Expecting a receiver to run synchronously after the emit action.
- Using `SignalReceived` for an object-targeted signal.
- Adding `onSignal` to a behavior or free extension function.
- Changing or reordering the fixed `Object`, `SignalName`, `Payload` signature.
- Calling scene-only `SignalPayload()` or sender expressions inside `onSignal`.
- Reading current-signal expressions outside the receiving event subtree.
- Hiding, inverting, or nesting the special `SignalReceived` condition.
- Guessing hidden `EmitSignalToObject`/group actions that are absent from the
  generated instruction catalog.
- Sending to an unrestricted picked list when only one instance was intended.
- Replying to sender ID `-1` without checking that an object sent the request.
- Emitting empty names, invalid instance IDs, or a recursive signal storm.
- Treating payload text as trusted structured data without validation.
- Using signals for mutable state or every-frame synchronization.

## Authoring checklist

- Read the owner `.settings`, this guide, the events DSL guide, and the current
  generated instruction catalog.
- Document signal name, emitter, target, payload, receivers, and reply behavior.
- Choose scene, instance, or picked-object targeting deliberately.
- Use only catalog-present instruction types, expressions, scopes, and exact
  `dslName` parameters.
- Guard every emit action and establish a deterministic picked set.
- Put scene `SignalReceived` directly in an enabled, non-inverted standard
  event condition list.
- Keep scene-only expressions inside that receiver event or descendants.
- Add `onSignal` only to an events-based object/prefab and preserve its fixed
  three parameters.
- Branch on `SignalName` and read `Payload` directly inside `onSignal`.
- Prevent cycles and high-volume per-frame emissions.
- Reload, launch a fresh debug preview, and inspect the signal monitor.
