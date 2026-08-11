# GDevelop JavaScript Authoring API

## A Typed, AI-Friendly Public Runtime Contract

**Status:** Implemented version 1 core contract; extension runtime fragments and
automatic JavaScript rename refactoring are future additions

**Specification version:** 1.0

**Generated artifacts:** `.gdevelop/runtime-api.d.ts` and
`.gdevelop/project-api.d.ts`

**JavaScript source location:** `@js` blocks in `.events` files

**Target:** AI-authored and human-authored JavaScript events in GDevelop

Related specifications:

- [IfDo Events DSL](gdevelop-events-dsl-spec.md), especially its JavaScript
  event syntax and runtime semantics.
- [GDevelop multi-file project format](gdevelop-new-formats-spec.md), especially
  generated catalogs, save-time validation, and `.gdevelop/` ownership.

---

## Contents

1. [Decision](#1-decision)
2. [Motivation](#2-motivation)
3. [Goals](#3-goals)
4. [Non-goals](#4-non-goals)
5. [Relationship to the existing authoring catalogs](#5-relationship-to-the-existing-authoring-catalogs)
6. [Generated files](#6-generated-files)
7. [Public JavaScript API boundary](#7-public-javascript-api-boundary)
8. [`runtime-api.d.ts`](#8-runtime-apidts)
9. [`project-api.d.ts`](#9-project-apidts)
10. [JavaScript event contexts](#10-javascript-event-contexts)
11. [Project-aware typing](#11-project-aware-typing)
12. [Extension API exposure](#12-extension-api-exposure)
13. [AI authoring rules](#13-ai-authoring-rules)
14. [Validation](#14-validation)
15. [Security and capabilities](#15-security-and-capabilities)
16. [Rename and refactoring safety](#16-rename-and-refactoring-safety)
17. [Generation and save pipeline](#17-generation-and-save-pipeline)
18. [Canonical examples](#18-canonical-examples)
19. [Diagnostics](#19-diagnostics)
20. [Compatibility policy](#20-compatibility-policy)
21. [Testing requirements](#21-testing-requirements)
22. [Implementation phases](#22-implementation-phases)
23. [Rejected alternatives](#23-rejected-alternatives)
24. [Later review questions](#24-later-review-questions)
25. [Final design principles](#25-final-design-principles)

---

## 1. Decision

GDevelop should expose a curated JavaScript authoring API to AI models and
human authors. The API is a secondary authoring surface for logic that is
awkward or impossible to express with ordinary GDevelop events.

The API must not be represented as a fourth large JSON catalog. It is exposed
as two generated TypeScript declaration files:

```text
.gdevelop/
  runtime-api.d.ts
  project-api.d.ts
```

TypeScript declaration syntax is selected because it is compact, familiar to
code models and editors, searchable with ordinary text tools, and capable of
describing overloads, generics, unions, nullability, documentation, and
project-specific names without inventing another schema.

JavaScript remains embedded in the existing Events DSL form:

```events
@js objects=Enemy
for (const enemy of objects) {
  enemy.setOpacity(128);
}
@end js
```

Version 1 does not add standalone project `.js` or `.ts` source files. That can
be considered later if large reusable JavaScript modules become a demonstrated
need. Keeping JavaScript inside `.events` preserves event order, conditions,
object-picking context, ownership, preview behavior, and legacy runtime code
generation.

An AI model may implement substantial game logic with JavaScript when the user
explicitly requests it, but GDevelop's normal authoring preference remains:

1. Layout TOML for instances and visual layout.
2. Settings TOML for definitions and configuration.
3. Events DSL and catalog instructions for gameplay behavior.
4. JavaScript events only where they materially improve the solution.

---

## 2. Motivation

The current multi-file format gives an AI model exact contracts for layouts,
settings, and events, but JavaScript events expose only raw source text. A model
can see that `runtimeScene` and optionally `objects` exist, yet it does not have
a project-local, authoritative answer to questions such as:

- Which runtime methods are public and stable?
- Which object names exist in this scene?
- Which concrete runtime class does an object use?
- Which variables, behaviors, layers, resources, and object groups exist?
- Which values may be `null` or `undefined`?
- Which fields are private implementation details despite being visible in a
  debugger dump or runtime source file?
- Which JavaScript globals exist in a scene event versus an extension
  function?

Without a curated contract, models tend to guess method names, read underscore
fields such as `_instances` or `_behaviorData`, call generated `.func` symbols,
or produce code that works only in one runtime build. Loading every runtime
source file into editor autocompletion also exposes internal members that are
not an authoring API.

The declaration files solve discoverability and type validation without
changing runtime semantics or duplicating the three existing authoring
catalogs.

---

## 3. Goals

The JavaScript authoring API must:

1. Describe only public, supported runtime APIs.
2. Give an AI model exact method names, parameter types, return types, and
   nullability.
3. Describe project-specific symbols using the names already owned by
   `.settings` and `.layout` sources.
4. Type each `@js` block according to its owning scene, external event sheet,
   extension function, prefab function, or behavior function.
5. Reuse the existing `@js ... @end js` Events DSL representation.
6. Keep generated files compact, deterministic, searchable, and read-only.
7. Prevent new AI-authored code from depending on runtime-private underscore
   fields or generated/minified implementation symbols.
8. Produce source-located syntax and type diagnostics before project reload.
9. Participate safely in project rename and refactoring operations.
10. Preserve preview and export behavior by compiling through the existing
    JavaScript-event runtime path.
11. Make it possible to implement advanced algorithms without encouraging a
    monolithic every-frame JavaScript program.
12. Clearly distinguish static type validity from runtime correctness.

---

## 4. Non-goals

Version 1 does not:

- Replace the instruction or settings catalog.
- Replace the Events DSL with JavaScript.
- expose every runtime class, method, global, or renderer implementation.
- Make underscore-prefixed fields public merely because JavaScript can access
  them at runtime.
- Expose generated extension function names, `.func` members, or code-generator
  namespaces as stable APIs.
- Add Node.js, Electron, filesystem, shell, or unrestricted browser APIs.
- Add standalone JavaScript modules, a package manager, bundler configuration,
  or arbitrary imports.
- Promise that type-correct JavaScript has correct gameplay semantics.
- Treat TypeScript declarations as a runtime security sandbox.
- Execute JavaScript while parsing, cataloging, validating, or converting a
  project.
- Infer project definitions from JavaScript. Settings and layout sources remain
  authoritative.

---

## 5. Relationship to the existing authoring catalogs

The project has two normal AI authoring catalogs:

| Artifact                              | Authoritative responsibility                                      |
| ------------------------------------- | ----------------------------------------------------------------- |
| `.gdevelop/instructions-catalog.json` | Events DSL instructions and expressions                           |
| `.gdevelop/settings-catalog.json`     | Settings-owned definitions, embedded layouts, and writable fields |

`.gdevelop/deprecated-instructions-catalog.json` remains a compatibility-only
event catalog and must not be used to construct new logic.

The JavaScript declaration files complement these catalogs; they do not copy
their complete contents:

| Artifact                     | Responsibility                                       |
| ---------------------------- | ---------------------------------------------------- |
| `.gdevelop/runtime-api.d.ts` | Stable public JavaScript runtime types and functions |
| `.gdevelop/project-api.d.ts` | Project-specific names and their runtime types       |

Examples of deliberate non-duplication:

- Instruction sentences and named Events DSL parameters stay only in the
  instruction catalog.
- Object serializer fields stay only in the settings catalog and object
  `.settings` sources.
- Instance coordinates stay only in `.layout` sources.
- `project-api.d.ts` may declare that `Player` is a Sprite runtime object, but
  it must not copy the Sprite's animations or every object setting.
- `project-api.d.ts` may declare that `Score` is a number variable, but it must
  not copy its current or initial value.

---

## 6. Generated files

### 6.1 File ownership

Both declaration files are generated editor state below `.gdevelop/`:

- They are regenerated automatically on project save.
- They are ignored by Git with the rest of `.gdevelop/`.
- They must never be edited by an AI model or user.
- Direct edits are overwritten on the next generation.
- Project source remains the `.settings`, `.layout`, and `.events` files.

### 6.2 Determinism

Generation must be deterministic for the same editor/runtime version,
installed extensions, and project source:

- UTF-8 encoding.
- LF canonical line endings.
- Two-space indentation inside declarations.
- Stable lexical ordering unless source order is semantically relevant.
- No timestamps, machine paths, random identifiers, or host-specific data.
- One declaration per logical symbol and no duplicated overloads.
- A short generated-file header containing format version and content hashes.

Example header:

```ts
// Generated by GDevelop. Do not edit.
// javascriptAuthoringApiVersion: 1
// runtimeApiHash: sha256:...
// projectApiHash: sha256:...
```

Hashes are metadata for validation and caching, not runtime constants.

### 6.3 Size policy

The declaration files must be useful with targeted `rg` searches and bounded
AI context:

- Exclude private members, implementation comments, method bodies, source
  paths, examples duplicated from documentation, and renderer internals.
- Keep one concise JSDoc summary for each public symbol.
- Generate only runtime extension declarations needed by the loaded project.
- Represent repeated project concepts through generic helper types rather than
  expanding the same method signatures for every object.
- Do not emit UI metadata, icons, localized sentences, or editor help URLs.

---

## 7. Public JavaScript API boundary

### 7.1 Explicit allowlist

The public API must be explicit. TypeScript's `public` keyword alone is not a
sufficient boundary because many runtime implementation fields are currently
public for historical or internal reasons.

Version 1 stores the reviewed core allowlist as declaration source in
`JavaScriptAuthoringApi.js`. Each entry is checked against the real runtime
implementation during review and carries a `@javascriptPublic` marker in the
generated declaration:

```ts
/**
 * Return the live, engine-owned array of living instances. Creating or
 * deleting an instance mutates this array immediately. Iterate a slice()
 * snapshot or iterate backward when calling deleteFromScene().
 * @javascriptPublic
 * @since 1
 */
getObjects(objectName: string): gdjs.RuntimeObject[];
```

The version 1 declaration generator includes:

1. Symbols in the reviewed core declaration allowlist.
2. Types required transitively by their public signatures.
3. Project-specific overloads generated from project definitions.

It excludes every unmarked runtime member even when technically reachable in
JavaScript.

### 7.2 Forbidden implementation surfaces

The following are never part of the authoring API unless a future public API
replaces them with a stable documented abstraction:

- Members beginning with `_`.
- `private`, `protected`, or `@internal` declarations.
- Renderer objects and raw PIXI/Three implementation state.
- Debugger serialization graphs and removed/circular placeholders.
- Generated code namespaces and mangled extension symbols.
- Direct `.func` calls.
- Raw object-picking maps and internal event contexts.
- Internal managers, caches, arrays, and hash tables.
- Constructors that must only be invoked by the runtime.

An underscore name is forbidden even if it appears in a raw preview dump.

### 7.3 Public API source of truth

The version 1 source of truth is the explicit reviewed declaration allowlist in
`JavaScriptAuthoringApi.js`. Moving the markers into runtime TypeScript and
extracting them with the TypeScript syntax tree is a future maintainability
improvement; it must not change the emitted contract without review. The
generator must not derive the API from:

- A live runtime object using reflection.
- A debugger dump.
- Minified preview/export JavaScript.
- Editor autocomplete's current collection of all runtime source files.
- Examples or prose documentation alone.

### 7.4 API stability

Removing or incompatibly changing an exposed declaration requires incrementing
`javascriptAuthoringApiVersion` and documenting a migration. Adding a compatible
method or type does not require changing existing project source.

---

## 8. `runtime-api.d.ts`

`runtime-api.d.ts` describes the public runtime available to JavaScript events.
Version 1 generates it from the reviewed core allowlist. Loaded extension
runtime fragments are deferred; extension instructions remain available through
Events DSL.

### 8.1 Minimum core surface

The initial curated surface should cover:

- `gdjs.RuntimeScene` and its public scene/object/layer/time accessors.
- `gdjs.RuntimeGame` through safe methods returned by a scene.
- `gdjs.RuntimeObject` position, dimensions, angle, visibility, forces,
  variables, behaviors, effects, timers, and deletion APIs.
- Public concrete object classes used by the project, such as Sprite and Text.
- `gdjs.RuntimeBehavior` and public concrete behavior classes used by the
  project.
- `gdjs.VariablesContainer` and `gdjs.Variable` operations.
- Public layer, camera, force, input, sound, resource, and time abstractions.
- Public `gdjs.evtTools` functions that have explicitly opted into JavaScript
  authoring.
- `gdjs.EventsFunctionContext` only for operations intentionally supported in
  extension-function JavaScript contexts.

The surface should grow by demonstrated authoring needs rather than exporting
the entire engine in the first version.

### 8.2 Friendly public types

Declarations should use ordinary TypeScript authoring types:

- Runtime `float` and `integer` become `number` in the generated public file.
- Optional or absent results use `T | null` or `T | undefined` exactly as the
  runtime behaves.
- Callbacks receive explicit argument and return types.
- String enums become literal unions where stable.
- Read-only data uses `readonly`.
- Methods that can fail to find a resource, object, layer, or behavior must not
  claim to return a guaranteed value.

### 8.3 No fictional runtime values

Ambient declarations must describe values that actually exist in the selected
JavaScript event context. The file must not declare helper objects or functions
that have no runtime implementation.

Generic and conditional types may improve static typing, but they must erase to
ordinary calls that already exist at runtime.

---

## 9. `project-api.d.ts`

`project-api.d.ts` is generated from the composed project model after all
settings files have loaded and extension metadata has registered.

### 9.1 Project symbol map

The file declares a single `GDevelopProject` namespace. A representative shape
is:

```ts
declare namespace GDevelopProject {
  interface Scenes {
    Main: {
      objects: {
        Player: ObjectDefinition<
          gdjs.SpriteRuntimeObject,
          { Health: number },
          { Platformer: gdjs.PlatformerObjectRuntimeBehavior }
        >;
        Enemy: ObjectDefinition<gdjs.SpriteRuntimeObject, {}, {}>;
      };
      groups: {
        Enemies: "Enemy";
      };
      variables: {
        Score: number;
      };
      layers: "" | "UI";
    };
  }

  interface GlobalObjects {
    Transition: ObjectDefinition<gdjs.RuntimeObject, {}, {}>;
  }

  interface GlobalVariables {
    HighScore: number;
  }

  interface Resources {
    "player.png": { kind: "image" };
    "shoot.wav": { kind: "audio" };
  }
}
```

This is descriptive type information only. It does not create a runtime
`GDevelopProject` object.

### 9.2 Required symbol categories

The project declaration contains:

- Scene names.
- Global and scene object names.
- Object groups and their member object-name unions.
- Object concrete runtime types.
- Object variable names and recursively inferred value types.
- Attached behavior instance names and public runtime behavior types.
- Global and scene variable names and recursively inferred value types.
- Layer names.
- Resource names and resource kinds.
- Extension, prefab, and events-based behavior names needed to describe
  JavaScript contexts.
- Function parameters and result types needed by JavaScript blocks inside
  functions.

It does not include variable values, object property values, instance
coordinates, event bodies, or hidden behavior settings.

### 9.3 Variables

Variable declaration types map as follows:

| GDevelop variable type | TypeScript authoring type                                    |
| ---------------------- | ------------------------------------------------------------ |
| number                 | `number`                                                     |
| string                 | `string`                                                     |
| boolean                | `boolean`                                                    |
| enum                   | Literal union when values exist; otherwise `string`          |
| structure              | Object type with named children                              |
| array                  | Array of the inferred child union, or `unknown[]` when empty |

Unknown or mixed structures use `unknown`, never `any`, unless the runtime API
itself intentionally exposes `any`.

### 9.4 Same name in different scenes

Scene symbol maps are isolated. If `Player` is a Sprite in one scene and a
custom object in another, each scene context receives its own type. A global
union is allowed only for APIs operating without a known scene context.

### 9.5 Global objects

Global objects are merged into each applicable scene context for lookup typing,
but remain identifiable as global in the declaration source. A scene object of
the same name follows the existing GDevelop resolution rules; generation must
not invent a new precedence rule.

---

## 10. JavaScript event contexts

The validator and editor type each `@js` body using its owning `.events` file
and structural location.

### 10.1 Scene event

Available values:

```ts
declare const runtimeScene: gdjs.RuntimeScene;
```

The synthetic checking context binds `runtimeScene` to the exact scene symbol
map. When the `@js` header has `objects=`, it also declares `objects` with the
picked object's concrete type.

### 10.2 External event

An external event uses the associated scene when one is known. If it can be
linked from multiple compatible scenes, its object and variable types are the
safe intersection of those scene contexts. Symbols that are not valid for
every allowed scene produce a diagnostic.

### 10.3 Free extension function

The checking context includes:

- `runtimeScene` when the function scope supplies it.
- The supported `eventsFunctionContext` public surface.
- Function parameters and result value according to `function.settings`.
- Object parameters as typed picked-object arrays.

### 10.4 Prefab function

The context additionally knows:

- The prefab instance/object parameter.
- Child object definitions exposed by the prefab contract.
- Prefab properties and variables available through public runtime APIs.
- The function's declared parameters and result type.

### 10.5 Behavior function

The context additionally knows:

- The owner object parameter.
- The behavior instance name and public runtime behavior type.
- Behavior properties and variables available through public getters.
- The function's declared parameters and result type.

Hidden behavior properties do not become general project-authoring fields.
They may be available inside the owning generated behavior implementation only
through a dedicated public behavior method or a compiler-owned context binding.
They are never exposed as `_behaviorData`.

### 10.6 Picked `objects`

For:

```events
@js objects=Enemy
```

the body is checked as if it had:

```ts
declare const objects: Array<
  GDevelopProject.ObjectRuntimeType<"CurrentScene", "Enemy">
>;
```

For an object group, the element type is a union of the group's member runtime
types. The declaration does not alter runtime picking; it describes the array
already supplied by GDevelop.

---

## 11. Project-aware typing

### 11.1 Literal-name overloads

The checker augments public runtime methods with project-aware overloads. For
example, inside the `Main` scene context:

```ts
runtimeScene.getObjects("Player");
// gdjs.SpriteRuntimeObject[]

runtimeScene.createObject("Bullet");
// gdjs.SpriteRuntimeObject | null
```

An unknown literal such as `"Plaeyr"` is a type error with a suggested known
name. Dynamic strings remain accepted only by a generic overload and return the
safe base type.

### 11.2 Behavior-name overloads

Given a typed object, a literal behavior name resolves to its public runtime
behavior type:

```ts
const player = runtimeScene.getObjects("Player")[0];
const platformer = player.getBehavior("Platformer");
```

The result remains nullable when the runtime API can fail. A behavior name not
attached to the object is a diagnostic.

### 11.3 Variable-name typing

The existing runtime variable-container API remains the runtime operation.
Project-aware overloads check literal root names and describe their expected
value shape without replacing `gdjs.Variable` objects with plain JavaScript
values.

### 11.4 Object selection is not inferred from arrays

Type declarations must not imply that fetching an object array updates
GDevelop event picking. JavaScript-local arrays and Events DSL picked-object
lists are different concepts. Only the `objects=` header supplies the parent
event's picked instances to the JavaScript event.

### 11.5 Live object arrays and deletion

`runtimeScene.getObjects(name)` returns the engine-owned live instance array,
not a stable snapshot. `deleteFromScene()` removes the instance from that array
immediately, so forward iteration while deleting can skip the item shifted into
the deleted index. Iterate a copy when order is unimportant:

```js
const instances = runtimeScene.getObjects("Enemy").slice();
for (const instance of instances) {
  instance.deleteFromScene();
}
```

Alternatively, iterate the live array backward. Never delete from it with a
forward `for`, `for...of`, or `forEach` loop.

---

## 12. Extension API exposure

### 12.1 Future reviewed declaration fragments

After the version 1 extension-fragment format is specified, an extension may
contribute public JavaScript runtime declarations when it has
actual stable runtime classes or functions intended for JavaScript authors.
Each fragment must:

- Be part of the extension source or reviewed built-in metadata.
- Use the same `@javascriptPublic` allowlist.
- Reference only public core or extension types.
- Avoid generated symbol names.
- Declare an extension/version identity for conflict diagnostics.

### 12.2 Events-based functions

Events-based extension actions, conditions, and expressions remain Events DSL
catalog instructions. Their generated JavaScript symbols are implementation
details and are not added to `runtime-api.d.ts`.

An AI model that wants to call such a function should write its catalog
instruction outside the JavaScript event. A future stable function-call bridge
may be specified separately, but version 1 does not invent one.

### 12.3 Missing extension typings

If an installed extension has runtime JavaScript but no reviewed public
declarations:

- Its Events DSL instructions remain fully usable.
- Its attached object/behavior base types fall back to the nearest known public
  type.
- The version 1 generator falls back without exposing the runtime type; a
  future fragment-aware generator will emit a bounded warning in its receipt.
- The generator must not expose the extension's entire implementation as
  `any`.

---

## 13. AI authoring rules

An AI model authoring new JavaScript must obey all of these rules:

1. Prefer an ordinary catalog instruction when it expresses the same behavior.
2. Read `runtime-api.d.ts` before using a runtime method not already present in
   the surrounding project code.
3. Read the relevant scene/function section of `project-api.d.ts` before using
   project names.
4. Use only declarations present in those files.
5. Never access an underscore-prefixed member.
6. Never call generated `.func` members or copy generated preview/export code.
7. Never use a raw debugger dump as an API reference.
8. Keep JavaScript blocks focused. One block should perform one cohesive task.
9. Put reusable game concepts in extension, prefab, or behavior functions rather
   than copying JavaScript blocks between scenes.
10. Do not run side-effecting code every frame without an explicit condition,
    lifecycle reason, or time-step requirement.
11. When a singular action is intended, prove that no more than one object
    instance is targeted through picking, iteration, or an explicit selection.
12. Treat `runtimeScene.getObjects(...)` as potentially empty.
13. Treat nullable API results as nullable.
14. Use elapsed time for continuous motion and time-dependent logic.
15. Do not modify collection membership while iterating unless the public API
    explicitly documents that operation as safe.
16. Validate, reload, and runtime-test the result with a paused preview and
    deterministic frame stepping.

The model may use JavaScript for whole-game logic only when the user explicitly
chooses that architecture. Even then, logic should be partitioned by scene and
function ownership rather than placed in one unconditional frame block.

---

## 14. Validation

### 14.1 Validation stages

`validate_project_files` performs JavaScript checks after parsing Events DSL
and after generating the two declaration files:

1. Extract each raw `@js` body without changing its contents.
2. Preserve a source map from the synthetic TypeScript-checking file back to
   the `.events` line and column.
3. Determine the exact JavaScript event context.
4. Load `runtime-api.d.ts` and `project-api.d.ts` by their generated hashes.
5. Parse JavaScript using the runtime's supported ECMAScript target.
6. Type-check it with `allowJs` and `checkJs` semantics.
7. Apply AI-authoring policy diagnostics.
8. Report errors against the original `.events` file.
9. Continue existing extension generated-code preflight.

No JavaScript executes during these stages.

### 14.2 Required checks

Validation must detect:

- JavaScript syntax errors.
- Unknown public methods and types.
- Private/underscore member access.
- Unknown literal scene object, group, variable, layer, behavior, or resource
  names when the context is known.
- Incorrect argument counts and types.
- Unsafe use of nullable results.
- Use of context globals that do not exist in that event kind.
- `objects` usage without `objects=`.
- Incompatible external-event scene contexts.
- Unsupported imports and forbidden globals.
- Stale project symbols after a rename.

### 14.3 Static validation boundary

A successful check proves only:

- The declarations were generated from the loaded project/runtime.
- The JavaScript parsed.
- Its checked calls fit the declared public API.
- Its project literals fit the known context.
- Generated project code passed the existing preflight.

It does not prove object-picking side effects, timing, collision behavior,
visual correctness, performance, network behavior, or the absence of runtime
exceptions from dynamic data. Validation receipts must mark themselves as
`structural-validation`, return `runtimeVerificationRequired: true` after a
successful structural check, and include an explicit completion warning. An
agent must never summarize `valid: true` as "the game works" or task completion
without separate preview evidence.

### 14.4 Severity for existing code

To avoid silently breaking an existing project merely by generating
declarations:

- Syntax errors remain errors.
- Existing JavaScript that uses an unexposed/private API is preserved and
  reported as a compatibility warning.
- Newly created or modified AI-authored JavaScript treats the same use as an
  error.
- A project may opt into strict validation for all JavaScript after its legacy
  blocks are migrated.

This compatibility behavior affects diagnostics only; it does not add private
members to `runtime-api.d.ts`.

---

## 15. Security and capabilities

### 15.1 Declarations are not a sandbox

Removing a global from a declaration file prevents approved authoring and
produces diagnostics, but JavaScript may still discover browser globals at
runtime unless execution is separately sandboxed. The editor must not describe
type checking as a security boundary.

### 15.2 Default AI-authoring policy

New AI-authored JavaScript must not use:

- `eval` or `Function` construction.
- Dynamic `import()`.
- `require`, Node.js modules, Electron APIs, or process execution.
- Filesystem or shell access.
- `window`, `document`, or direct DOM mutation.
- `fetch`, `XMLHttpRequest`, `WebSocket`, or other network APIs.
- Local/session storage, cookies, clipboard, or credential APIs.
- Prototype mutation or monkey-patching of GDevelop runtime classes.
- Unbounded worker creation or timers outside GDevelop's lifecycle.

If a game genuinely requires a capability such as networking, it should use a
reviewed GDevelop extension or an explicit future capability grant. The API
specification for such grants is outside version 1.

### 15.3 Runtime performance policy

Validation should warn about clear high-risk patterns in new AI-authored code:

- Unbounded `while` or recursive loops.
- Repeated full-scene object scans inside an unconditional frame event.
- Per-frame allocation of large arrays or serialized object graphs.
- Repeated resource loading.
- Blocking synchronous work.

These warnings are heuristic and do not replace runtime profiling.

---

## 16. Rename and refactoring safety

### 16.1 Version 1 behavior

Version 1 regenerates `project-api.d.ts` from the authoritative project model
after a rename and rechecks every strict JavaScript block. A stale statically
known name becomes a source-located validation error. The generator never runs
a global text or regular-expression replacement over JavaScript.

The generated model covers:

- Scenes.
- Objects and object groups.
- Variables.
- Layers.
- Behaviors.
- Resources.
- Extensions, prefabs, and functions.

### 16.2 Future AST-aware updates

A future editor rename transaction may update JavaScript where the reference is
statically unambiguous, for example:

```js
runtimeScene.getObjects("Player");
player.getBehavior("Health");
runtimeScene.getVariables().get("Score");
```

Such an implementation must use the JavaScript syntax tree and context type,
never a global text replacement or regular expression. Version 1 requires the
author of the rename to update these literals in the same source change.

### 16.3 Dynamic references

The following cannot be renamed safely without data-flow proof:

```js
runtimeScene.getObjects(prefix + kind);
runtimeScene.getObjects(nameFromVariable);
```

When a renamed symbol might be referenced dynamically, an author or future
refactor receipt must report the source locations for manual review. It must
not guess.

### 16.4 Atomicity

A project rename remains one coherent source transaction:

1. Update authoritative `.settings`, `.layout`, and `.events` sources.
2. Update affected JavaScript literals explicitly (or, in a future version,
   through proven AST-aware edits).
3. Regenerate all catalogs and declaration files.
4. Type-check all affected JavaScript blocks.
5. Abort and restore the previous source set if an unhandled blocking error
   occurs.

---

## 17. Generation and save pipeline

The declaration files are generated after the project model and extensions are
fully available:

1. Read and merge all `.settings` files.
2. Compile embedded `[layout]` subtrees and parse all `.events` files.
3. Compose and validate the in-memory project model.
4. Register built-in and project extensions.
5. Generate instruction catalogs and the settings catalog, including embedded
   layout schemas and contexts.
6. Load the curated core JavaScript API.
7. Generate `runtime-api.d.ts`.
8. Generate `project-api.d.ts` from the composed project and function contexts.
9. Type-check all JavaScript events.
10. Generate `.gdevelop/game.json` for preview/export compatibility.
11. Write each generated artifact through a verified sibling temporary file
    and replace its target.

If declaration generation or strict JavaScript validation fails, the save
reports the source-located root cause before publishing new project sources.
Both declaration files carry deterministic hashes; generation receipts return
the same hashes, and every written file is read back and verified before the
operation reports success.

---

## 18. Canonical examples

### 18.1 Mutating explicitly picked objects

```events
if CollisionNP first_object="Player" second_object="Enemy"

> @js objects=Enemy
for (const enemy of objects) {
  enemy.setOpacity(128);
}
> @end js
```

The `objects` element type comes from the `Enemy` definition in the current
scene.

### 18.2 Safe object creation

```events
if KeyPressed key="Space"

> @js
const bullet = runtimeScene.createObject("Bullet");
if (bullet) {
  bullet.setPosition(100, 200);
  bullet.addPolarForce(0, 720, 1);
}
> @end js
```

The checker verifies the `Bullet` name, concrete type, nullable creation result,
and public methods. This local JavaScript reference does not imply an Events DSL
picked selection after the block.

### 18.3 Scene variable

```events
if SceneJustBegins

> @js
const score = runtimeScene.getVariables().get("Score");
score.setNumber(0);
> @end js
```

The project declaration verifies that `Score` exists in the scene context and
is declared as a number.

### 18.4 Explicitly guarded initialization

```events
@group "Procedural water simulation" color=[74,176,228]
> @event
> if SceneJustBegins

>> @js
// Initialization occurs once because the parent event is explicitly guarded.
initializeWaterSimulation(runtimeScene);
>> @end js
@end group
```

`initializeWaterSimulation` is valid only if it is present in
`runtime-api.d.ts`, normally through a reviewed extension declaration.

### 18.5 Forbidden private state

```js
player._variables;
player._behaviorsTable;
runtimeScene._instances;
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.func(...);
```

These references are rejected for new AI-authored code even if they happen to
exist in one runtime build.

---

## 19. Diagnostics

Diagnostics use stable codes and include the `.events` URI, JavaScript body
line, column, source excerpt, and suggested public alternative when known.

Initial codes:

| Code                            | Meaning                                                                                   |
| ------------------------------- | ----------------------------------------------------------------------------------------- |
| `JS_API_SYNTAX_ERROR`           | JavaScript cannot be parsed                                                               |
| `JS_API_UNKNOWN_MEMBER`         | Method or property is absent from the public API                                          |
| `JS_API_PRIVATE_MEMBER`         | Underscore/private runtime state was accessed                                             |
| `JS_API_NULLABILITY`            | A nullable result is used without a guard                                                 |
| `JS_API_TYPE_MISMATCH`          | Arguments, project literals, context globals, or assignments do not match the declaration |
| `JS_API_FORBIDDEN_GLOBAL`       | A forbidden browser, Node, dynamic-code, or host API is used                              |
| `JS_API_RESOURCE_LIMIT`         | JavaScript block count or aggregate source exceeds the validation budget                  |
| `JS_API_TYPESCRIPT_UNAVAILABLE` | The checker is unavailable; strict blocks fail and compatibility blocks warn              |
| `JS_API_PERFORMANCE_RISK`       | A statically obvious unbounded loop needs review (warning)                                |

Diagnostics should favor an exact corrective action, for example:

```text
JS_API_PRIVATE_MEMBER at game://scenes/Main/Main.events:42:8
`_permanentForceX` is runtime-private. Use `addPolarForce`, `addForce`, or a
catalog force action, then verify the resulting force with `run_frames`.
```

---

## 20. Compatibility policy

The proposal is additive at runtime:

- Existing JavaScript code events keep their current serialized body and
  runtime execution.
- Existing projects do not require declaration files to load or preview.
- Generating declarations does not rewrite JavaScript automatically.
- Existing private API usage is diagnosed but preserved until explicitly
  migrated.
- New AI-authored or modified code must satisfy the curated API.

The declaration generator must describe the current runtime version. It must
not maintain declarations for removed private APIs. A project that intentionally
depends on an unsupported implementation detail owns that compatibility risk.

---

## 21. Testing requirements

Implementation is incomplete without tests for all of the following.

### 21.1 Runtime declaration generation

- Includes explicitly annotated public classes, methods, functions, and
  transitive public types.
- Excludes underscore, private, protected, internal, renderer, debugger, and
  generated code members.
- Produces valid TypeScript declarations.
- Produces byte-identical output for identical inputs.
- Rejects conflicting extension declarations.
- Bounds output to loaded project capabilities.

### 21.2 Project declaration generation

- Scenes with local and global objects.
- Same object name with different scene-specific types.
- Object groups containing multiple runtime types.
- Nested variables, arrays, structures, enums, and empty arrays.
- Attached behaviors and missing extension typings.
- Layers, resources, prefabs, functions, and externals.
- Names containing spaces, quotes, Unicode, punctuation, and case collisions.
- Rename diffs based on stable identities.

### 21.3 JavaScript context checking

- Scene, external event, free function, prefab function, and behavior function
  contexts.
- `objects=` for objects and groups.
- Known and unknown object literals.
- Nullable create/get operations.
- Private field access.
- Forbidden globals and dynamic code.
- Correct `.events` line/column mapping.
- JavaScript containing text that resembles `@end js` under a delimiter.

### 21.4 Runtime integration

- A type-correct JavaScript event previews and exports unchanged.
- Object creation and mutation work in a paused deterministic preview.
- Picked `objects` match parent event selection.
- Project-aware types do not change runtime object picking.
- Runtime inspection verifies targeted positions, forces, variables, and
  behaviors without a raw dump.

### 21.5 Regression and compatibility

- Existing JavaScript bodies round-trip byte-for-byte except permitted newline
  normalization.
- Existing private API usage receives a compatibility warning and is not
  silently removed.
- Declaration failure does not corrupt source or generated project files.
- Normal projects without JavaScript still generate deterministic declarations
  and incur bounded save overhead.

---

## 22. Implementation status and later phases

### Implemented: curated core declarations

- Define and review a small `@javascriptPublic` core runtime surface.
- Generate deterministic `runtime-api.d.ts`.
- Replace JavaScript authoring autocomplete's unrestricted runtime-source view
  with the curated declaration file.

### Implemented: project declarations

- Generate scene, object, group, variable, behavior, layer, resource, and
  function context maps.
- Add project-aware literal overloads.
- Generate deterministic `project-api.d.ts`.

### Implemented: validation

- Extract and type-check `@js` blocks.
- Map diagnostics back to `.events` source.
- Add private API and forbidden-global policies.
- Add declaration hashes to validation receipts.

### Future: rename integration

- Diff project symbol models before replacing declarations.
- Update statically proven JavaScript literals through AST refactoring.
- Report dynamic references.
- Make rename and regeneration atomic.

### Future: extension declarations

- Define reviewed extension declaration fragments.
- Include only extensions loaded by the project.
- Add missing/conflicting extension diagnostics.

### Implemented: AI workflow and runtime verification

- Update the project-file skill to read the declarations only when JavaScript
  is needed.
- Add examples and mandatory authoring rules.
- Require paused-preview deterministic verification for JavaScript changes.

Standalone `.js` or `.ts` project modules are explicitly deferred until these
phases are stable.

---

## 23. Rejected alternatives

### 23.1 A fourth JSON JavaScript catalog

Rejected because it would duplicate TypeScript's existing type language,
become large, need a custom schema for overloads and generics, and be less
useful to code editors and AI models.

### 23.2 Expose all runtime TypeScript sources

Rejected because the current source contains internal fields, constructors,
managers, renderer details, and APIs with no stability promise. Technical
accessibility is not an authoring contract.

### 23.3 Infer the API from a preview dump

Rejected because dumps contain private state, circular placeholders, transient
values, and only the code paths instantiated in that preview.

### 23.4 Wrap every runtime operation in a new AI-only API

Rejected for version 1 because it would duplicate the engine API and introduce
a second runtime abstraction. Declaration-only project-aware overloads provide
most authoring value without emitted wrappers.

### 23.5 Make JavaScript the canonical gameplay format

Rejected because it would discard Events DSL structure, picking semantics,
visual editing, instruction metadata, refactoring reliability, and extension
reuse. JavaScript is complementary.

### 23.6 Add standalone script modules immediately

Rejected for version 1 because module ownership, loading order, bundling,
imports, source maps, lifecycle, export targets, and security capabilities need
a separate design. `@js` blocks already provide an executable integration path.

---

## 24. Later review questions

Version 1 is implemented. The following decisions remain for later versions:

1. What reviewed declaration-fragment contract should extensions use, and how
   should conflicting fragments be diagnosed?
2. Should existing private API usage remain a compatibility warning forever,
   or become an error after a declared migration version?
3. Should project resource declarations expose only names and kinds, or also
   normalized read-only file paths?
4. Should external events require one explicit associated-scene type context
   rather than calculating an intersection across possible scenes?
5. Should networking/browser capabilities be granted only by reviewed
   extensions, or can a project declare explicit capability grants later?
6. What tighter save-time and declaration-size budgets are appropriate for
   very large projects after measuring real projects?
7. After version 1 is stable, is there enough need to design standalone
   `scripts/` modules, or are extension/function-owned `@js` blocks sufficient?

---

## 25. Final design principles

1. Public API is an explicit allowlist, not everything JavaScript can reach.
2. Type declarations describe real runtime values and never invent hidden
   wrappers.
3. Project source owns names; generated declarations only describe them.
4. JavaScript complements layouts, settings, and events rather than replacing
   their authoring contracts.
5. Context-specific types are more valuable than one global untyped API.
6. Private underscore fields and generated symbols are never authoring APIs.
7. Type validity is not runtime correctness.
8. Rename safety requires AST and context, never global text replacement.
9. Generated declarations are deterministic, compact, read-only, and ignored
   by Git.
10. Advanced JavaScript remains possible, but ordinary GDevelop instructions
    and reusable extensions stay the preferred path.
