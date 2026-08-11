# Refactor with prefabs, behaviors, and functions

## Contents

- [Completion contract](#completion-contract)
- [Audit and choose boundaries](#audit-and-choose-boundaries)
- [Migration procedure](#migration-procedure)
- [Worked refactoring example](#worked-refactoring-example)
- [Verification and cleanup](#verification-and-cleanup)

## Completion contract

When asked to refactor with prefabs, behaviors, or functions, perform the whole
migration. Do not stop after analysis, recommendations, empty declarations, or
duplicating old logic behind a new name.

Finish only after callers and instances use the new components, obsolete logic
is removed, the final disk state reloads successfully, and a fresh preview
validates behavior. Keep changes transactional so the old implementation stays
usable until the replacement passes verification.

Read [create-extensions.md](create-extensions.md) before creating components.
For any substantial subsystem, also read
[reuse-community-extensions.md](reuse-community-extensions.md) and search the
official repository before deciding to build from scratch.

## Audit and choose boundaries

1. Inventory scenes, externals, objects, object variables, behaviors, event
   groups, resources, and repeated instruction sequences in scope.
2. Find all definitions and callers with `rg`; do not refactor only the first
   visible copy.
3. Identify duplicated visual composition, per-instance state machines, and
   stateless project logic separately.
4. Search installed and official repository extensions for an existing heavy
   implementation. Prefer reuse or a thin adapter.
5. Choose boundaries:
   - Extract repeated child-object composition and visual defaults to a prefab.
   - Extract per-object variables and transitions to a behavior.
   - Extract stateless calculations or orchestration to free functions.
   - Combine a prefab and behaviors when a reusable visual object also owns
     stateful gameplay logic.
6. Define public APIs before moving bodies: names, types, parameters, return
   values, defaults, ownership, and error behavior.
7. Record invariants that must survive: resource names, object/instance names,
   variable values, layer/Z order, collision masks, persistence, and picking.

Avoid a generic `Utils` extension containing unrelated logic. Group components
by stable domain ownership such as `Combat`, `Inventory`, or `UIWidgets`.

## Migration procedure

1. Establish a baseline with a fresh preview. Record relevant instance counts,
   positions, variables, logs, errors, and representative inputs.
2. Add the new extension/component declarations and empty or comment-only event
   files without deleting old logic.
3. Run `generate-catalogs`, re-read the catalogs, and confirm all new
   instruction/object/behavior types exist before changing callers.
4. Move one coherent behavior at a time:
   - Copy each child object definition and its attached behaviors into an
     individual flat `prefab/objects/<Object>.settings` with `folder` arrays; copy
     only instances/layers/spatial composition into the prefab layout.
   - Move per-instance variables and logic into behavior settings/functions.
   - Move shared calculations into extension-level functions.
   - Preserve metadata, defaults, resources, and unknown fields.
5. Rewrite each moved event body to satisfy the current safety rules. Guard all
   actions and ensure every object action operates on the intended picked set;
   isolate instances only when the gameplay requires it.
6. Replace scene/external callers with the new public functions. Use exact
   catalog types and named parameters.
7. Replace scene object definitions or instances with prefab types only after
   mapping every property, behavior, variable, position, layer, Z order, and
   custom size. Preserve stable instance identifiers when supported.
8. Validate, commit, reload, and preview the migrated slice. Compare it to the
   baseline.
9. Repeat until every caller is migrated.
10. Remove old event groups, duplicated object definitions, obsolete variables,
    and unused resources only after searches show no remaining references.
11. Validate and commit after the final deletion, then run the complete
    verification matrix with `verify_project_change` or an equivalent fresh
    paused-preview sequence.

Never combine migration and irreversible cleanup in the same unverified step.

## Worked refactoring example

Assume two scenes duplicate these concerns for several enemy objects:

- Sprite plus health-bar child composition.
- `HP`, invulnerability, and death state variables.
- Damage calculation and repeated collision/damage event groups.

Refactor as follows:

```text
extensions/Combat/
  extension.settings
  functions/CalculateDamage.settings
  functions/CalculateDamage.events
  prefabs/Enemy/
    prefab.settings
    objects/
      Sprite.settings
      HealthBar.settings
    functions/Initialize.settings
    functions/Initialize.events
  behaviors/Health/
    behavior.settings
    functions/TakeDamage.settings
    functions/TakeDamage.events
    functions/IsDead.settings
    functions/IsDead.events
```

1. Put the sprite/health-bar child object definitions and their attached
   behaviors in `Enemy/objects/Sprite.settings` and
   `Enemy/objects/HealthBar.settings`; put layers and default instances in
   the embedded `[layout]` subtree of `Enemy/prefab.settings`. Keep prefab
   property descriptors flat in the same owner settings.
2. Put health properties/variables in `Health/behavior.settings`. Put each
   `TakeDamage`/`IsDead` signature in its flat same-stem
   `functions/<Function>.settings` (including `folder`) and only its DSL body in the
   sibling `<Function>.events`.
3. Put the stateless damage formula in `CalculateDamage.settings` and
   its DSL body in `CalculateDamage.events`.
4. Attach `Combat::Health` to the prefab configuration and expose only the
   minimum prefab methods needed by scene callers.
5. Reload and confirm the generated catalog contains the new prefab, behavior,
   and function instruction types.
6. For each old scene enemy instance, map its object type to `Combat::Enemy`,
   preserve transform/layer/Z order and initial state, and validate one scene
   before migrating the next.
7. Replace duplicated damage groups with guarded calls. If collisions can pick
   several enemies, use `for each Enemy` so `TakeDamage` receives one instance
   at a time.
8. Search for every old enemy type, HP variable write, and duplicated group.
   Remove them only when all results are either migrated callers or intentional
   compatibility code.

This produces one visual composition, one state owner, and one calculation API
without changing runtime semantics.

## Verification and cleanup

Verify at least:

- Every changed settings document parses alone, mounts from its canonical path,
  and merges without ownership conflicts.
- Orders are contiguous; mounted namespaces, `folder` arrays, filenames, and `game://`
  references match.
- Object definitions and their behaviors are in the owning local-root settings document;
  layouts contain only instances, layers, spatial bounds, background, and
  editor-canvas state; events contain only DSL.
- Every old caller/instance has a mapped replacement; searches find no dangling
  component, variable, behavior, resource, or instruction references.
- Every action has an effective condition and every object action receives the
  intended picked set; repeated-instance cases are tested explicitly.
- Public API parameter/return types match every caller.
- Scene instance transforms, layers, Z order, custom size, variables, and
  resource bindings match the baseline.
- Final validation passes every pre-runtime phase, the task-owned changes are
  committed, and the reload stage succeeds after the most recent disk edit.
- Final runtime assertions pass with `runtimeVerified: true` and
  `completionReady: true`.
- Fresh preview tests cover creation, normal operation, repeated instances,
  state transitions, deletion, scene changes, and error paths.
- Runtime logs contain no unknown instruction, missing behavior/object type,
  code-generation, or undefined-function errors.

Report what was extracted, reused, migrated, and deleted; list any intentional
compatibility layer and remaining follow-up work. Do not claim completion while
old and new implementations both remain active unintentionally.
