# The Best Game State Machine Design in GDevelop

Status: design guide & recommendation. This document defines a principled,
GDevelop-native way to build finite state machines (FSMs) for game logic —
enemy AI, player controllers, doors, UI flows, game phases. It is opinionated:
it names one **recommended** approach (a state-machine *behavior*) and explains
exactly why, then gives copy-able recipes from simplest to most powerful.

It assumes familiarity with GDevelop events. The engine rationale behind the
recommendations is grounded in `docs/Architecture.md` (object picking, behaviors,
properties) and `docs/CustomObjectArchitecture.md` (prefab/behavior state tiers).

> There is currently **no built-in state-machine extension** in GDevelop (only
> `SaveState`, which is unrelated). Everything here is built from primitives that
> already exist: object variables, behavior **properties**, timers, and the
> behavior lifecycle. Section 9 is a drop-in behavior spec you can create once
> and reuse.

## Table of contents

1. [What a state machine is, and why GDevelop benefits](#1-what-a-state-machine-is-and-why-gdevelop-benefits)
2. [The five design principles](#2-the-five-design-principles)
3. [The GDevelop-specific trap: per-instance state & object picking](#3-the-gdevelop-specific-trap-per-instance-state--object-picking)
4. [Pattern A — variable + Trigger Once (quick & simple)](#4-pattern-a--variable--trigger-once-quick--simple)
5. [Pattern B — the state-machine behavior (recommended)](#5-pattern-b--the-state-machine-behavior-recommended)
6. [Enter / update / exit: the heart of a good FSM](#6-enter--update--exit-the-heart-of-a-good-fsm)
7. [Timing inside states](#7-timing-inside-states)
8. [Advanced: hierarchical & pushdown states](#8-advanced-hierarchical--pushdown-states)
9. [Reference implementation: the `StateMachine` behavior spec](#9-reference-implementation-the-statemachine-behavior-spec)
10. [Worked example: enemy AI](#10-worked-example-enemy-ai)
11. [Anti-patterns](#11-anti-patterns)
12. [Decision guide](#12-decision-guide)

---

## 1. What a state machine is, and why GDevelop benefits

A finite state machine says: *an entity is always in exactly one of a fixed set
of states; it does state-specific work each frame; and it changes state only on
defined transitions.* For an enemy: `Idle → Patrol → Chase → Attack → Dead`.

GDevelop benefits more than most engines because GDevelop events are
**unstructured by default** — a flat list of "if this, do that". Without a state
concept, complex actors degrade into a tangle of interacting boolean flags
(`isJumping`, `canShoot`, `isHurt`, `isDead`…) whose combinations explode and
contradict each other. A state machine replaces *N booleans* (2^N possible,
mostly-invalid combinations) with *one state value* (N valid states). That single
change is the highest-leverage structural improvement you can make to non-trivial
GDevelop logic.

---

## 2. The five design principles

Everything below follows from these. A "good" FSM in GDevelop honors all five;
the recommended pattern (Section 5) gives you all five almost for free.

1. **Single source of truth.** The current state is stored in exactly one place,
   per entity. Never derive "what state am I in" from a combination of other
   flags.
2. **Per-instance state.** Each instance (each enemy) owns its own state. This is
   non-negotiable in GDevelop and is where naive designs break — see Section 3.
3. **Explicit transitions.** State changes happen through one well-defined
   mechanism ("set state to X"), never by mutating internal fields ad hoc. This
   is what makes enter/exit hooks possible.
4. **Enter / update / exit separation.** Logic that runs *once when entering* a
   state (start an animation, reset a timer) is separated from logic that runs
   *every frame while in* the state. This eliminates the most common FSM bug:
   re-triggering entry logic every frame.
5. **One dispatcher per entity.** A single place reads the state and runs the
   matching per-frame logic. No state's logic is scattered across unrelated
   event sheets.

Note the alignment with GDevelop's own architecture: principles 2–4 are exactly
what **behaviors** provide (per-instance data, lifecycle `doStepPostEvents`,
typed `Choice` properties). That is why a behavior is the recommended home.

---

## 3. The GDevelop-specific trap: per-instance state & object picking

This section is the one most tutorials get wrong, and the reason a GDevelop FSM
doc is worth writing at all.

In GDevelop, an object name in events refers to a **list of currently-picked
instances**, not one object (see `docs/Architecture.md` §4, "object picking").
Conditions *filter* that list. This has a hard consequence for state machines:

**You must store state on the instance, and you must change one instance's state
without accidentally affecting the others.**

Two correct storage choices, both per-instance:

- An **object variable** (e.g. `Enemy.Variable(state)`) — works, untyped.
- A **behavior property** of type `Choice` (e.g. the `State` property) —
  recommended, because it's typed, gives a dropdown of valid values in the
  editor, and auto-generates `SetProperty…`/`Property…` instructions
  (`AbstractEventsBasedEntity.h:157-167`).

The classic mistakes:

- ❌ Storing state in a **scene variable** (`Variable(enemyState)`). That is *one
  value for the whole scene* — every enemy shares it. Fine for global game phase
  (Section 12), catastrophic for individual actors.
- ❌ Writing a transition **without picking the right instance first**. An action
  like "set State of Enemy to Chase" inside a condition block applies to *every
  currently-picked Enemy*. Always make sure the condition chain above the
  transition has filtered down to the instance(s) you mean (typically via a
  `For each Enemy` loop, or a condition that picks the specific one).

The golden rule for per-instance FSMs in GDevelop:

> **Iterate with `For each instance`, or pick precisely, before reading or
> writing state.** Within the loop body, conditions and actions refer to that one
> instance.

The reference behavior in Section 9 sidesteps this entirely: because the
dispatcher runs in the behavior's own `doStepPostEvents`, GDevelop scopes it to
*each instance automatically* — one of the strongest reasons to prefer it.

---

## 4. Pattern A — variable + Trigger Once (quick & simple)

Use this for prototypes, a handful of instances, or a single unique actor (one
boss, the player). It needs no extension.

**Storage:** an object variable `state` (a string).

**Dispatcher:** in the scene events, one event group per state, each gated by
`For each Enemy → Enemy variable state = "X"`. Inside, do that state's per-frame
work and check transitions.

**Enter logic:** use **"Trigger once while true"** so entry actions fire a single
frame. Pseudo-events:

```
// --- CHASE state ---
For each Enemy:
  ├─ Condition: Enemy.Variable(state) = "Chase"
  │   ├─ [Sub] Condition: Trigger once
  │   │   └─ Action: Enemy play animation "run"          // ENTER (once)
  │   ├─ Action: add force toward Player                  // UPDATE (every frame)
  │   └─ [Sub] Condition: distance(Enemy, Player) > 400
  │       └─ Action: set Enemy.Variable(state) = "Patrol" // TRANSITION
```

**Why it works:** the `For each` enforces per-instance correctness (Section 3);
`Trigger once` gives you a crude "enter" hook.

**Why it doesn't scale:** `Trigger once` is keyed to the *event*, not to *this
instance's entry into this state*. With many instances or re-entrant states it
gets subtle, and there is no real "exit" hook. When you feel that friction, move
to Pattern B.

---

## 5. Pattern B — the state-machine behavior (recommended)

Build the FSM as a **behavior** and attach it to any object that needs states.
This is the best general-purpose design in GDevelop. It satisfies all five
principles and dodges the picking trap by construction.

Why a behavior is the right home (see `docs/CustomObjectArchitecture.md`):

- **Per-instance by default.** Behavior properties are per-instance; the behavior
  step runs once per instance. Principle 2 is automatic.
- **Typed state via a `Choice` property.** A `State` property of type `Choice`
  gives a validated dropdown in the editor and a clean `CurrentState()`
  expression. Principle 1.
- **Built-in dispatcher slot.** `doStepPostEvents` is the natural "one dispatcher
  per entity", scoped per instance by the engine. Principle 5.
- **Enter/exit for free.** The behavior detects `currentState != previousState`
  in its own step and fires transition logic — no `Trigger once` gymnastics.
  Principle 4. (Detailed in Section 6.)
- **Reusable & encapsulated.** Drop it on enemies, doors, the player. State is
  internal; the public surface is `SetState` / `State is` / `CurrentState`.

Crucially, this is the **idiomatic** GDevelop answer. As discussed in the design
notes, an engine-level `onState` lifecycle hook would be a category error
(lifecycle hooks are engine-driven; "state" is game-data-driven). A behavior is
where reusable per-instance logic belongs, and GDevelop already gives behaviors
the exact ingredients an FSM needs.

The full spec is in Section 9.

---

## 6. Enter / update / exit: the heart of a good FSM

A state machine is only as good as its transition handling. The single most
important technique:

> Keep **`currentState`** and **`previousState`**. Each frame, *before* running
> state logic, compare them. If they differ, you have just transitioned: run the
> *exit* logic for `previousState`, then the *enter* logic for `currentState`,
> then set `previousState = currentState`.

This yields three cleanly separated phases per state:

- **Enter** (once, on arrival): start the animation, reset the state timer, play
  a sound, set velocity.
- **Update** (every frame while in the state): movement, checks, the transition
  conditions themselves.
- **Exit** (once, on leaving): stop a looping sound, clear a flag, spawn a puff.

Event structure inside the behavior's `doStepPostEvents` (conceptual):

```
// 1) Transition detection — runs the boundary hooks exactly once
Condition: CurrentState != previousState
  ├─ (exit of previousState)  switch on previousState → exit actions
  ├─ (enter of currentState)  switch on currentState → enter actions, reset state timer
  └─ Action: previousState = CurrentState

// 2) Per-frame update + outgoing transitions
switch on CurrentState:
  ├─ "Idle":   ...checks... → maybe SetState("Patrol")
  ├─ "Chase":  add force to Player → if far: SetState("Patrol"); if close: SetState("Attack")
  └─ ...
```

Because enter logic resets the **state timer** (Section 7) on every entry, "how
long have I been in this state" becomes trivial and correct even when you
re-enter the same state later.

The Section 9 behavior implements this loop once, so your per-game work is only
filling in the per-state enter/update/exit actions.

---

## 7. Timing inside states

Most state logic is time-based ("attack for 0.5s", "stunned for 2s", "idle 3s
then patrol"). Use **object timers**, not manual counters:

- On **enter**, reset the state timer: action *Reset timer "state"* on the object
  (runtime `resetTimer`, `runtimeobject.ts:2269`).
- In **update**, branch on elapsed time: condition *the timer "state" >
  duration* (runtime `getTimerElapsedTimeInSeconds`, `runtimeobject.ts:2317`).

Object timers are per-instance (each enemy has its own "state" timer), which
keeps Principle 2 intact. Pattern: one reusable timer name per machine (e.g.
`"state"`) reset on every transition — you almost never need more than one timer
per state machine.

Avoid manual `+= TimeDelta()` accumulators on variables: they work but duplicate
what timers already do per-instance and are easy to forget to reset on entry.

---

## 8. Advanced: hierarchical & pushdown states

Reach for these only when a flat FSM genuinely strains. Most games never need
them.

**Hierarchical (sub-states).** When several states share behavior (e.g. `Walk`,
`Run`, `Jump` are all "alive" and all respond to taking damage), model a second,
coarser state property — `Mode` (`Alive`/`Dead`) alongside `State`
(`Walk`/`Run`/…). The dispatcher checks `Mode` first, then `State`. Two `Choice`
properties, two nested switches. This avoids duplicating the damage check in
every movement state.

**Pushdown (state stack).** When a state must *interrupt and later resume*
another (open a menu, then return to exactly what you were doing), store a stack
instead of a scalar. In a behavior, use a child-variable **array** property/
variable (`stateStack`): `SetState` pushes, a `PopState` action restores the
previous. Use sparingly — it's powerful but harder to debug than a flat machine.

If you find yourself wanting *both* per-scene shared phase state and per-instance
actor state, that's not hierarchy — it's two different machines at two scopes;
see Section 12.

---

## 9. Reference implementation: the `StateMachine` behavior spec

Create this once as an events-based behavior (Extensions → create behavior) and
reuse it across projects. It encodes Sections 5–7. Object authors then only write
the per-state enter/update/exit events.

### Properties

| Property | Type | Visibility | Purpose |
| --- | --- | --- | --- |
| `State` | `String` (or `Choice` if you fix the state set) | public | The current state — single source of truth. Use `Choice` for a validated dropdown per object. |
| `PreviousState` | `String` | hidden | Last frame's state, for transition detection. |
| `JustEntered` | `Boolean` | hidden | True for the one frame a state was entered (a clean "enter" condition for authors). |

> Tip: if every object using the behavior shares the same states, make `State` a
> `Choice` property and list the states — you get an editor dropdown and the
> `CurrentState()` expression returns one of a known set. If different objects
> need different state sets, keep `State` as `String`.

### Actions

| Action (display) | Internal name | Effect |
| --- | --- | --- |
| Set state to _value_ | `SetState` | Sets `State` = value. (Transition detection happens in the step, so this is all an author calls.) |

(With a `Choice` property you also get the auto-generated `SetPropertyState`; a
thin `SetState` wrapper reads better in events and lets you add validation.)

### Conditions

| Condition (display) | Internal name | True when |
| --- | --- | --- |
| State is _value_ | `StateIs` | `State` = value |
| State just changed | `StateChanged` | `JustEntered` is true this frame |
| Just entered _value_ | `JustEnteredState` | `JustEntered` AND `State` = value |

### Expression

| Expression | Returns |
| --- | --- |
| `CurrentState()` | the `State` string (for debugging / UI / animation name binding) |

### Behavior events (the dispatcher), in `doStepPostEvents`

```
// Detect transition (runs once per change, per instance — engine-scoped)
Condition: Property State  ≠  Property PreviousState
  ├─ Action: Set JustEntered = true
  ├─ Action: reset timer "state" on Object              // state timer (Section 7)
  └─ Action: Set PreviousState = State
Else:
  └─ Action: Set JustEntered = false
```

That is the *entire* behavior logic. It deliberately does **not** know your
states — it just exposes "just entered" + a per-instance state timer + clean
conditions. Enter/update/exit for specific states live in the object's own events
(or the object's `doStepPostEvents` if it's a custom object), e.g.:

```
// On the Enemy object using the StateMachine behavior:
Condition: Enemy: Just entered "Chase"
  └─ Action: Enemy play animation "run"; play sound "alert"   // ENTER

Condition: Enemy: State is "Chase"
  ├─ Action: add force toward Player                           // UPDATE
  └─ Condition: distance(Enemy, Player) > 400
      └─ Action: Enemy: Set state to "Patrol"                  // TRANSITION
```

Why split it this way: the behavior owns the *mechanism* (transition detection,
timer, query API); the object owns the *content* (which states exist, what they
do). This is the same declaration-vs-implementation seam GDevelop uses everywhere
(`docs/Architecture.md` §6).

> Want true exit hooks too? Add a `JustExited` boolean and, in the transition
> block, set it before overwriting `PreviousState`; expose a "Just exited
> _value_" condition that checks `JustExited AND PreviousState = value`. For most
> games "just entered" + the state timer is enough.

---

## 10. Worked example: enemy AI

A complete patrol/chase/attack enemy, using the `StateMachine` behavior. States:
`Idle`, `Patrol`, `Chase`, `Attack`, `Dead`.

```
Enemy: Just entered "Idle"      → play "idle"; (timer "state" auto-reset)
Enemy: State is "Idle"
   └─ timer "state" > 2         → Set state to "Patrol"

Enemy: Just entered "Patrol"    → play "walk"; pick next patrol point
Enemy: State is "Patrol"
   ├─ move toward patrol point
   └─ Player in line of sight   → Set state to "Chase"

Enemy: Just entered "Chase"     → play "run"; play "alert" sound
Enemy: State is "Chase"
   ├─ add force toward Player
   ├─ distance to Player < 48   → Set state to "Attack"
   └─ distance to Player > 400  → Set state to "Patrol"

Enemy: Just entered "Attack"    → play "attack"; reset timer "state"
Enemy: State is "Attack"
   ├─ timer "state" > 0.4       → deal damage; Set state to "Chase"
   └─ (no movement while attacking)

Enemy: Just entered "Dead"      → play "death"; disable collisions
Enemy: State is "Dead"
   └─ timer "state" > 1.5       → delete Enemy

// Global interrupt (any state → Dead):
Enemy.Variable(health) <= 0     → Set state to "Dead"
```

Observe the properties in action: every transition is one `Set state` call; every
"do once on arrival" is `Just entered`; every duration uses the single `"state"`
timer reset automatically on entry. No flag soup, no scene-variable cross-talk,
and it is correct for 1 or 500 enemies because the behavior is per-instance.

---

## 11. Anti-patterns

- ❌ **Scene/global variable for per-actor state.** One value shared by all
  instances. Use an object variable or behavior property (Section 3).
- ❌ **Boolean flag soup** (`isJumping && !isHurt && canShoot && …`). The problem
  an FSM exists to solve; collapse to one state value (Section 1).
- ❌ **Re-running enter logic every frame.** Restarting the animation each frame
  so it never plays. Use `Just entered` / `Trigger once` for entry actions
  (Section 6).
- ❌ **Transition without picking.** "Set state of Enemy to X" with no `For each`
  / no filtering condition above it — hits every picked enemy (Section 3).
- ❌ **Logic for one state scattered across many event sheets.** Violates "one
  dispatcher". Keep a state's enter/update/exit together.
- ❌ **Manual time accumulators you forget to reset.** Prefer object timers reset
  on entry (Section 7).
- ❌ **Reaching for hierarchical/pushdown too early.** Start flat; add structure
  only when a flat machine demonstrably hurts (Section 8).
- ❌ **An engine `onState` lifecycle function.** Tempting, but state is
  game-data-driven, not engine-driven; the behavior is the correct layer
  (`docs/CustomObjectArchitecture.md`).

---

## 12. Decision guide

| Situation | Use |
| --- | --- |
| Prototype, one unique actor, few instances | **Pattern A** — object variable + `Trigger once` (Section 4) |
| Reusable actor logic, many instances, real enter/exit | **Pattern B** — the `StateMachine` behavior (Sections 5–9) |
| Per-frame duration logic inside states | object timers reset on entry (Section 7) |
| Shared behavior across groups of states (alive/dead over walk/run/jump) | hierarchical: a second `Choice` property (Section 8) |
| Interrupt-and-resume (menus, stuns that return) | pushdown: a state stack (Section 8) |
| **Game-wide phase** (Menu/Playing/Paused/GameOver) | a **scene or global variable** state machine — this is the one case where a single shared value is correct, because there is exactly one game. Same enter/update/exit discipline, scoped to the scene rather than per instance. |

The throughline: **one state value as the single source of truth, stored at the
right scope (per-instance for actors, per-scene for game phase), changed only
through explicit transitions, with enter/update/exit separated and one
dispatcher.** In GDevelop, a behavior delivers all of that idiomatically — which
is why it's the best general design.

---

## See also

- `docs/Architecture.md` — object picking (§4), behaviors & the runtime step
  order (§5), properties & metadata (§6).
- `docs/CustomObjectArchitecture.md` — behavior properties vs "Scene properties",
  per-instance vs per-scene state tiers, and why `onState` isn't a lifecycle hook.
- `newIDE/docs/Properties-schema-and-PropertiesEditor-explanations.md` — declaring
  the `Choice`/`Boolean`/`String` properties used by the behavior.
