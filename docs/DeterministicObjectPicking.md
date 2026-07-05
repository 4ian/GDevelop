# Deterministic Object Picking

Generated GDJS events now enforce deterministic object consumption at runtime.
Whenever generated event code consumes an object selection for an action,
expression, object pointer, object-list parameter outside a condition, or
JavaScript event object parameter, the selected instances must contain at most
one object.

If more than one instance is picked, the runtime throws an error and lets the
GDevelop crash/error-report flow stop the game, log the error once, and show
the error report on the game screen.

## Rule

An object-consuming instruction may receive zero or one picked instance once
conditions have finished narrowing the selection.

- Zero picked instances keep the existing behavior: object actions do nothing,
  expressions use their default value or bad-object fallback, and object-list
  parameters pass an empty list.
- One picked instance is deterministic and runs normally.
- More than one picked instance is an error.

The rule applies to concrete objects and object groups. For groups, the total
number of picked instances across all concrete object lists must be at most one.
For example, if a group contains `EnemyA` and `EnemyB`, picking one `EnemyA`
and one `EnemyB` is still ambiguous because two instances are selected overall.

Conditions are the exception when their object-list parameters are used to
narrow the selection. Conditions such as "Pick random", "Pick nearest" or
collision checks may receive multiple candidate instances and then reduce the
picked list. The strict check applies to the actions, expressions and function
calls that run after those conditions.

## Why

The historical event model let object actions loop over all picked instances,
while scalar expressions such as `Player.X()` silently used the first picked
instance when several were selected. That behavior is convenient, but it makes
event logic depend on implicit list ordering.

This stricter model forces event authors to choose the target instance before
consuming it. It makes action and expression behavior match: both require a
single deterministic object.

## How To Write Events

Use conditions or picking actions to narrow the selected objects before an
action, expression, or function consumes them:

- Compare an instance variable or unique id.
- Use "Pick nearest", "Pick random", or equivalent selection conditions.
- Use `PickedInstancesCount(Object) = 1` as a condition after earlier picking
  conditions have narrowed the selection.
- Use `For each object` when every selected instance must be processed.

Example pattern:

```text
Conditions:
  Enemy.Variable(Id) = TargetId
  PickedInstancesCount(Enemy) = 1
Actions:
  Change Enemy.Variable(Health): subtract 1
```

To process all selected instances, use a loop:

```text
For each Enemy:
  Change Enemy.Variable(Health): subtract 1
```

Inside the loop body, the generated picked list contains exactly one current
instance, so actions and expressions are deterministic.

## Runtime Behavior

The check is generated into GDJS events code and therefore applies in preview,
debug runs, and exported games. Violations throw a JavaScript `Error` with a
message like:

```text
Ambiguous object picking for object action "Enemy": expected at most one picked instance, but 2 are picked.
```

Preview/debug builds route the thrown error through the existing debugger crash
handling, which opens the error report UI. Exported games also display the same
style of error report on top of the game screen. The first uncaught error is
logged to the browser or platform console once, then the game loop stops so the
same crash is not printed again every frame.

## Compatibility Notes

This is intentionally stricter than classic GDevelop object picking.

Patterns that used to apply an action to all picked objects must be rewritten
with `For each object`. Patterns that used to rely on the first picked object
must add conditions or explicit picking so only one instance remains.

Some object-list parameters name an object type or group, but still use the
same picked-list pipeline internally. Outside conditions, they are checked too.
If several instances are already picked for that parameter, the instruction
throws before it runs.

Custom instruction code generators that manually emit object-list loops can
bypass the common generator hooks. Those generators should explicitly call the
same GDJS assertion helpers before consuming object lists.
