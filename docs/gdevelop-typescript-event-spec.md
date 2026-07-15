# GDevelop TypeScript Code Events

## A first-class TypeScript authoring mode for the existing JavaScript event

**Status:** Proposed, codebase-aligned implementation specification

**Date:** 2026-07-15

**Target:** GDevelop editor, GDJS event code generation, project formats, and
authoring integrations

Related specifications:

- [GDevelop architecture](Architecture.md)
- [IfDo Events DSL](gdevelop-events-dsl-spec.md)
- [JavaScript authoring API](gdevelop-javascript-authoring-api-spec.md)
- [Multi-file project format](gdevelop-new-formats-spec.md)
- [Deterministic object picking](DeterministicObjectPicking.md)
- [Signal system](SignalSystem.md)
- [Static Data](StaticData.md)

---

## Contents

1. [Decision](#1-decision)
2. [Why this design fits the current codebase](#2-why-this-design-fits-the-current-codebase)
3. [Goals and non-goals](#3-goals-and-non-goals)
4. [Terminology and invariants](#4-terminology-and-invariants)
5. [Event model and serialization](#5-event-model-and-serialization)
6. [Compilation-state contract](#6-compilation-state-contract)
7. [TypeScript compiler contract](#7-typescript-compiler-contract)
8. [Context typing and public API](#8-context-typing-and-public-api)
9. [Editor behavior](#9-editor-behavior)
10. [Runtime and C++ code generation](#10-runtime-and-c-code-generation)
11. [Project open, save, preview, and export](#11-project-open-save-preview-and-export)
12. [IfDo Events DSL 2.1](#12-ifdo-events-dsl-21)
13. [Diagnostics](#13-diagnostics)
14. [Compatibility and migration](#14-compatibility-and-migration)
15. [Other consumers and integrations](#15-other-consumers-and-integrations)
16. [Security, performance, and reliability](#16-security-performance-and-reliability)
17. [Implementation map](#17-implementation-map)
18. [Implementation phases](#18-implementation-phases)
19. [Testing requirements](#19-testing-requirements)
20. [Acceptance criteria](#20-acceptance-criteria)
21. [Rejected alternatives](#21-rejected-alternatives)
22. [Resolved and deferred decisions](#22-resolved-and-deferred-decisions)

---

## 1. Decision

GDevelop should support TypeScript as a second source language of the existing
`BuiltinCommonInstructions::JsCode` event. It should not add a new serialized
event type.

The existing C++ class and serialized event identifier remain
`gdjs::JsCodeEvent` and `BuiltinCommonInstructions::JsCode` for compatibility.
The product-facing name becomes **Code event**, with **JavaScript** and
**TypeScript** authoring modes.

The representation is intentionally dual:

- JavaScript events continue to store their authoritative source and executable
  body in `inlineCode`, exactly as they do now.
- TypeScript events store authoritative source in `sourceCode`.
- TypeScript events also store the deterministically generated JavaScript body
  in the existing `inlineCode` field.
- Compilation metadata proves which TypeScript source, project typing context,
  compiler, and options produced that JavaScript body.

The generated JavaScript is not a second editable source. It is a compatibility
artifact and execution cache. The TypeScript editor never displays or edits it.

TypeScript compilation happens in a shared editor-side compiler service before
the synchronous C++ event generator runs. The C++ generator remains a JavaScript
generator and continues to insert `inlineCode` into `GDJSInlineCode`.

This gives the feature all of the following properties:

- The current preview and export generators require no embedded TypeScript
  compiler.
- Existing JavaScript projects retain byte-for-byte behavior.
- Older GDevelop builds recognize the event type and can execute the generated
  JavaScript fallback.
- New builds can reject stale or corrupted generated output rather than running
  it silently.
- Multi-file projects keep only TypeScript source in their authoritative
  `.events` files while `.gdevelop/game.json` carries the compatibility output.

---

## 2. Why this design fits the current codebase

### 2.1 Current end-to-end path

The current JavaScript event crosses these layers:

| Layer | Current implementation | Consequence for TypeScript |
| --- | --- | --- |
| C++ event model | `GDJS/GDJS/Events/Builtin/JsCodeEvent.{h,cpp}` stores `inlineCode`, `parameterObjects`, `useStrict`, and editor state | The compatible extension point is this model |
| Event registration | `CommonInstructionsExtension.cpp` registers `BuiltinCommonInstructions::JsCode` | A new event type would need new registration and compatibility handling |
| Code generation | The generator creates `function GDJSInlineCode(...)`, inserts `inlineCode` verbatim, then calls it | The generator requires executable JavaScript synchronously |
| WebAssembly bindings | `Bindings.idl`, generated Flow types, and generated TypeScript types expose `JsCodeEvent` | New model fields need bindings and regenerated types |
| Events editor | `EventsTree/Renderers/JsCodeEvent.js` edits `inlineCode` live | TypeScript needs a language-aware source accessor and asynchronous compilation |
| Monaco | `CodeEditor` and `PoppedOutMonacoEditor` hard-code `javascript` | Both embedded and popped-out editors must accept a language and wrapped model |
| Type information | `JavaScriptAuthoringApi.js` builds curated runtime/project declarations and validates JS with the TypeScript checker | The same declarations should type TypeScript source |
| Multi-file source | `IfDoEventsDsl/index.js` owns raw `@js` scanning and round-trip conversion | TypeScript needs an equally raw, lossless block form |
| Project writer | `LocalProjectWriter.js` validates code before publishing project sources and writes generated declarations/game JSON | Compilation belongs before serialization/publication |
| Preview/export | local and browser launchers call synchronous C++ exporters; extension loaders call synchronous C++ generators | Every supported generation boundary needs a shared preflight |
| Runtime errors | runtime and debugger clients detect `GDJSInlineCode` in stacks | Keeping this wrapper name preserves detection |
| Search/render/tooling | text renderer, graph preview, global search, MCP tools, and AI validation special-case the JS event | They must read the authoritative source according to language |

Events are editor-time C++ model objects, but no event object exists in the
GDJS runtime. A TypeScript event therefore cannot be interpreted at runtime.
It must become JavaScript before the existing event-to-JavaScript generator is
called.

### 2.2 Why a new serialized event type is unsafe

`EventsListSerialization::UnserializeEventsFrom` asks the loaded project to
create an event from its serialized type. An unknown type logs a warning and is
replaced with `gd::EmptyEvent`. Consequently, a new
`BuiltinCommonInstructions::TypeScriptCode` type would turn into an empty event
in older builds and could be permanently lost on save.

Keeping `BuiltinCommonInstructions::JsCode` avoids that failure mode. An older
build ignores the new fields but still sees and executes `inlineCode`.

### 2.3 Why the C++ generator must not compile TypeScript

The generator is synchronous C++ compiled both natively and to WebAssembly.
It is used for scenes, free functions, event-based behaviors, event-based
objects, generated-code inspection, previews, and exports. Embedding the
TypeScript compiler there would add a JavaScript compiler dependency to native
C++, make the browser and native implementations diverge, and make generation
asynchronous across a large public binding surface.

The correct seam is immediately before code generation, while the editor still
has project declarations, source locations, the npm TypeScript compiler, and an
asynchronous workflow.

---

## 3. Goals and non-goals

### 3.1 Goals

1. Let a user author a code event body with ordinary TypeScript syntax.
2. Give TypeScript source syntax highlighting, completion, exact context types,
   and source-located diagnostics.
3. Reuse the reviewed `runtime-api.d.ts` and generated `project-api.d.ts`
   contracts.
4. Preserve the current event position, object-picking semantics, strict-mode
   behavior, extension-function context, and generated function call.
5. Produce deterministic JavaScript with a pinned compiler and option set.
6. Make local preview, browser preview, all export targets, and extension code
   loading consume the same generated JavaScript.
7. Keep existing JavaScript events and serialized projects unchanged.
8. Preserve executable backward compatibility for legacy JSON projects.
9. Add an authoritative, lossless TypeScript form to the Events DSL.
10. Prevent supported current-editor paths from executing stale TypeScript
    output.
11. Preserve source on compiler errors and report the exact `.events` file or
    event editor location.
12. Cover scene, external event, free extension function, prefab function,
    behavior function, and object function event sheets.

### 3.2 Non-goals

Version 1 does not:

- Add standalone `.ts` files, a module graph, npm packages, a bundler, or
  `tsconfig.json` to game projects.
- Add imports or exports to code events.
- Compile all generated GDevelop event code with TypeScript.
- Move TypeScript compilation into the GDJS runtime.
- Turn type declarations into a security sandbox.
- Expose private underscore-prefixed runtime fields.
- Infer object picking from arbitrary TypeScript arrays.
- Replace events, extensions, prefabs, or behaviors as the preferred reusable
  gameplay architecture.
- Interpolate Static Data placeholders inside TypeScript source. This matches
  JavaScript source behavior; placeholders belong to supported event/property
  fields, not raw code text.
- Guarantee that type-correct code has correct gameplay behavior.
- Provide exact TypeScript runtime stack source maps in the first release.
  Compile-time diagnostics are exact; runtime stacks retain the current
  generated `codeX.js` behavior.

---

## 4. Terminology and invariants

### 4.1 Terms

- **Code event:** The product-facing JavaScript/TypeScript event.
- **Source language:** `javascript` or `typescript`.
- **Authoritative source:** The user-owned text that the editor and source
  format display.
- **Executable body:** JavaScript inserted into `GDJSInlineCode` by C++.
- **Compilation context:** Event scope, parameter object, authoring API version,
  and declaration hashes used to validate a TypeScript block.
- **Compilation receipt:** Stored metadata proving the source/output/compiler
  relationship.
- **Current output:** An executable body whose receipt matches the current
  source and compilation context.
- **Last-good output:** The previous valid generated body retained while a newer
  edit has errors. It must never be executed by a current editor while stale.

### 4.2 Normative invariants

1. `inlineCode` is always executable JavaScript when a code event is eligible
   for code generation.
2. TypeScript syntax is never passed to the C++ generator or GDJS runtime.
3. For JavaScript, `inlineCode` is authoritative.
4. For TypeScript, `sourceCode` is authoritative and `inlineCode` is generated.
5. A TypeScript event with missing, stale, or corrupt output is not eligible for
   preview or export in a current build.
6. Generated output changes never create authoring undo entries. They do not
   independently mark source as edited, but may set an internal
   artifact-needs-persistence flag after a compiler/context migration.
7. Source changes, language changes, and parameter-object changes are undoable
   authoring changes.
8. The wrapper name remains `GDJSInlineCode` so current debugger detection keeps
   working.
9. The event passes at most one picked instance through `objects`, exactly like
   the existing JavaScript event.
10. Missing `sourceLanguage` means `javascript`.
11. Unknown source-language values are errors. They never fall back to
    JavaScript or an empty event silently.
12. Existing JavaScript serialization and generated output remain unchanged.

---

## 5. Event model and serialization

### 5.1 Model extension

`gdjs::JsCodeEvent` gains these persisted values:

| Field | Type | JavaScript event | TypeScript event |
| --- | --- | --- | --- |
| `sourceLanguage` | enum string | Omitted; missing means `javascript` | Required, value `typescript` |
| `sourceCode` | multiline string | Omitted | Required authoritative TypeScript |
| `inlineCode` | multiline string | Authoritative JavaScript | Generated JavaScript body |
| `transpilation` | object | Omitted | Required for current output |

Existing `parameterObjects`, `useStrict`, `eventsSheetExpanded`, disabled/folded
state, AI event id, and non-serialized cursor state retain their meanings.

The C++ class name is not changed. Its class comment should be broadened from
"raw javascript" to "JavaScript or TypeScript source compiled to an executable
JavaScript event body."

### 5.2 TypeScript JSON example

```json
{
  "type": "BuiltinCommonInstructions::JsCode",
  "disabled": false,
  "folded": false,
  "inlineCode": "const player = objects[0];\nconst speed = 250;\nplayer.setX(player.getX() + speed);\n",
  "parameterObjects": "Player",
  "useStrict": true,
  "eventsSheetExpanded": false,
  "sourceLanguage": "typescript",
  "sourceCode": "const player: gdjs.RuntimeObject = objects[0];\nconst speed: number = 250;\nplayer.setX(player.getX() + speed);\n",
  "transpilation": {
    "schemaVersion": 1,
    "compiler": "typescript",
    "compilerVersion": "4.9.5",
    "optionsVersion": 1,
    "sourceHash": "sha256:<hex>",
    "contextHash": "sha256:<hex>",
    "outputHash": "sha256:<hex>"
  }
}
```

The exact initial compiler version is the editor's pinned version at feature
merge. With the current dependency graph that is `4.9.5`; implementation may
deliberately select a newer version before release, but it must pin an exact
version and update the golden output fixtures.

### 5.3 JavaScript JSON remains unchanged

```json
{
  "type": "BuiltinCommonInstructions::JsCode",
  "disabled": false,
  "folded": false,
  "inlineCode": "runtimeScene.setBackgroundColor(100, 100, 240);\n",
  "parameterObjects": "",
  "useStrict": true,
  "eventsSheetExpanded": false
}
```

The serializer must omit `sourceLanguage`, `sourceCode`, and `transpilation`
for JavaScript, including canonical serialization. This avoids repository-wide
project churn and makes existing JavaScript round-trip fixtures continue to
match.

### 5.4 Compilation receipt schema

`transpilation` contains only deterministic provenance:

- `schemaVersion`: integer receipt schema; initially `1`.
- `compiler`: exactly `typescript`.
- `compilerVersion`: exact `typescript.version` used to emit.
- `optionsVersion`: integer selecting the complete fixed option set and body
  extraction algorithm.
- `sourceHash`: SHA-256 of the exact UTF-8 `sourceCode` string.
- `contextHash`: SHA-256 of the canonical compilation-context record.
- `outputHash`: SHA-256 of the exact UTF-8 `inlineCode` string.

No timestamp, machine path, platform newline, locale, username, random id, or
absolute project path is stored.

The canonical context record is stable-key JSON containing:

```text
receipt schema version
source language
parameterObjects
useStrict
owner kind (scene, external, free function, prefab, behavior, object)
owner identity used by project-api.d.ts
presence of eventsFunctionContext
JavaScript authoring API version
runtime-api.d.ts hash
project-api.d.ts hash
bundled TypeScript standard-library hash
compiler id and exact version
compiler options version
```

Moving an event to a different owner or changing a project symbol can therefore
invalidate its typing receipt even when emitted JavaScript happens to be the
same.

### 5.5 C++ API

The model should expose typed operations rather than independent setters that
can accidentally manufacture a valid-looking receipt:

```cpp
const gd::String& GetSourceLanguage() const;
bool IsTypeScript() const;
const gd::String& GetSourceCode() const;
void SetSourceCode(const gd::String& source);
void SetSourceLanguage(const gd::String& language);

void SetTypeScriptTranspilationResult(
    const gd::String& inlineCode,
    const gd::String& compilerVersion,
    std::size_t optionsVersion,
    const gd::String& sourceHash,
    const gd::String& contextHash,
    const gd::String& outputHash);
void ClearTypeScriptTranspilationResult();
bool HasStructurallyCompleteTypeScriptTranspilation() const;
```

Behavior requirements:

- `SetSourceCode` invalidates the receipt but may retain last-good
  `inlineCode`.
- `SetParameterObjects` invalidates the TypeScript context receipt.
- Existing `SetInlineCode` remains for API compatibility. On a TypeScript event
  it invalidates the receipt; only `SetTypeScriptTranspilationResult` can publish
  current generated output.
- Switching to JavaScript clears TypeScript fields only after the caller has
  selected the JavaScript body to preserve.
- Copy construction and `Clone` copy every persisted TypeScript field.
- Cursor and scroll state remain non-serialized and refer to authoritative
  source coordinates.

### 5.6 Bindings

`GDevelop.js/Bindings/Bindings.idl` exposes the new source getters, language
getter/setter, invalidation state, atomic compilation-result setter, receipt
getters needed by preflight, and the existing C++ `IsUseStrict()` value (which
is not currently exposed to JavaScript). The generated bindings and types are
regenerated:

- `GDevelop.js/Bindings/glue.cpp` and `glue.js`
- `GDevelop.js/types/gdjscodeevent.js`
- `GDevelop.js/types/libgdevelop.js`
- `GDevelop.js/types.d.ts`
- cast/type generation scripts and their fixtures

The JavaScript API should provide a small helper around the atomic setter so
callers do not pass hashes in the wrong order.

---

## 6. Compilation-state contract

### 6.1 States

A code event has one of these logical states:

| State | Meaning | Editable | Save | Preview/export |
| --- | --- | --- | --- | --- |
| `javascript` | `inlineCode` is source/output | Yes | Yes | Yes |
| `typescript-current` | source, context, output, and receipt match | Yes | Yes | Yes |
| `typescript-compiling` | a compile request is pending | Yes | Wait for result | Wait for result |
| `typescript-invalid` | current source has blocking diagnostics | Yes | Block publishing, preserve source in memory | Block |
| `typescript-stale` | last-good output exists but receipt does not match | Yes | Recompile; block if unsuccessful | Block |
| `typescript-unavailable` | compiler could not load | Read/write source | Block publishing | Block |
| `unknown-language` | serialized language is unsupported | Recovery display only | Block | Block |

The editor may retain last-good output in invalid/stale states to support undo
and legacy recovery, but current-editor code generation must not call it.

### 6.2 Asynchronous result ordering

Each source-affecting change increments an in-memory revision. A compilation
request captures:

- event identity,
- event revision,
- scope identity,
- declaration hashes, and
- compiler/options version.

A result is applied only if all captured values still match. Results for an
older keystroke, moved event, closed editor, deleted event, changed parameter
object, or regenerated declaration set are discarded.

Applying generated output:

- does not call the event-sheet history callback,
- does not mark authoring source as changed, but may request artifact-only
  persistence when the result replaces an older stored receipt/output,
- does not move the cursor,
- does not replace the authoritative source, and
- does trigger a lightweight renderer status update.

### 6.3 Integrity checks

The editor preflight recomputes all three hashes. The C++ event generator also
performs the checks it can perform without the project declaration generator:

- supported language,
- complete receipt,
- supported receipt/options schema,
- `sourceHash` matches `sourceCode`, and
- `outputHash` matches `inlineCode`.

This requires one deterministic SHA-256 helper available to C++/WebAssembly and
the JavaScript compiler service. The hash is an integrity/determinism mechanism,
not a security signature.

Only the editor preflight can prove `contextHash` is current because it owns the
project declaration hashes and source scope. Direct C++ generation can execute
a structurally current compatibility artifact, but supported editor generation
always performs the stronger project-aware check first.

### 6.4 Fail-closed generation

When a TypeScript event fails the C++ integrity guard, its generator must:

1. Add a dedicated invalid-code-event diagnostic.
2. Call `EventsCodeGenerator::ReportError()`.
3. Never splice the stale body into `GDJSInlineCode`.
4. Emit a deliberate runtime throw only for diagnostic-only generation paths
   that cannot propagate failure; it must not silently omit gameplay logic.

The current `ErrorOccurred()` flag is not propagated by exporters. The feature
must wire a blocking code-generation result through layout/function generators
and `ExporterHelper::ExportScenesEventsCode`, or make exporters explicitly fail
when the new blocking diagnostic is present. Relying only on the editor
preflight is insufficient for defense in depth.

---

## 7. TypeScript compiler contract

### 7.1 Shared compiler service

Add a shared service, conceptually:

```text
newIDE/app/src/ProjectsStorage/TypeScriptEventCompiler.js
newIDE/app/src/ProjectsStorage/TypeScriptEventCompiler.worker.js
```

The service is used by the event editor, project loader/writer, preview/export
preflight, generated-code dialog, extension loader, MCP writes, and tests. No
consumer implements its own TypeScript-to-JavaScript transform.

The compiler is loaded as a built-in lazy web chunk with a direct dynamic import
of the exact pinned `typescript` dependency. `OptionalRequire` is not sufficient
for this feature because it returns `null` in the browser build. Electron and
browser must execute the same compiler package and option version.

The npm compiler does not make its `lib.*.d.ts` files readable through a browser
filesystem. The editor build must therefore package the exact transitive
declaration closure selected by `lib.es2020.d.ts` as deterministic virtual files
in the same lazy chunk. A build script generates that virtual standard-library
module from the pinned compiler package; it is not copied from Monaco and is not
loaded from a CDN. Its hash participates in `contextHash`.

After the chunk is loaded, compiler operations are synchronous inside a worker.
Public editor operations remain asynchronous and do not block the UI thread.

### 7.2 Input unit

Each compilation unit contains:

```js
{
  eventKey,
  fileUri,
  bodyLine,
  sourceCode,
  parameterObjects,
  useStrict,
  ownerContext,
  runtimeApiDeclaration,
  projectApiDeclaration
}
```

`fileUri` is a stable `game://` URI for multi-file source and a stable virtual
URI for legacy/editor-only projects. It never contains a machine-specific
absolute path in emitted metadata.

### 7.3 Synthetic wrapper

The source is a function body, not a module. For checking and emission, the
compiler creates one synthetic function with exactly the parameters the C++
generator will create:

```ts
function __gdevelopTypeScriptEvent_42(
  runtimeScene: GDevelopProject.SceneRuntime<"Main">,
  objects: Array<
    GDevelopProject.ScenePickedObjectType<"Main", "Player">
  >
) {
  // Exact user source begins here.
}
```

For non-scene contexts the runtime scene is `gdjs.RuntimeScene`. The `objects`
parameter is omitted when `parameterObjects` is empty. The
`eventsFunctionContext: gdjs.EventsFunctionContext` parameter is present only
where the existing C++ generator provides it.

The wrapper is why body-level `return`, local declarations, `arguments`, and
function scoping behave like the runtime event rather than like a standalone
module.

Every wrapper name is deterministic and unique within the program. It is an
internal checker name and is not the runtime `GDJSInlineCode` name.

The example above is expanded for readability. The compiler and Monaco adapter
serialize the complete function declaration/opening brace as one physical prefix
line and the closing brace as one suffix line, so body-to-wrapper line mapping is
always a constant offset of one.

### 7.4 Compiler options

Options version 1 is fixed as follows:

```js
{
  target: ts.ScriptTarget.ES2020,
  module: ts.ModuleKind.None,
  lib: ['lib.es2020.d.ts'],
  strict: true,
  skipLibCheck: true,
  noEmitOnError: true,
  declaration: false,
  sourceMap: false,
  inlineSourceMap: false,
  removeComments: false,
  importHelpers: false,
  noEmitHelpers: false,
  newLine: ts.NewLineKind.LineFeed,
  useDefineForClassFields: false
}
```

All implicit/default values that can affect output must be made explicit in
the implementation and covered by the options-version fixture. `lib.dom.d.ts`
and Node types are not included.

`useStrict` is not a TypeScript checker switch. TypeScript checking is always
strict. `useStrict` continues to control the outer `"use strict";` statement
emitted by the existing C++ code generator.

The ES target matches the current JavaScript-authoring checker. Before release,
the supported-runtime/browser policy must confirm ES2020 as the user-code
baseline; changing it is an options-version change.

### 7.5 Program construction

Project preflight compiles all TypeScript code events in one TypeScript
`Program` containing:

- the bundled virtual TypeScript standard-library files,
- `runtime-api.d.ts`,
- `project-api.d.ts`, and
- one unique virtual `.ts` source per event.

This avoids loading and parsing declarations once per block. Interactive edits
reuse the previous program when the declaration hashes and compiler version are
unchanged.

The current JavaScript limits remain the initial project limits for combined
JavaScript and TypeScript code events: 500 blocks and 2 MiB of authoritative
source. Separate metrics report how many of each language were checked.

### 7.6 Emission and body extraction

The compiler emits the synthetic source and parses the emitted JavaScript back
with the TypeScript JavaScript parser. It locates the uniquely named synthetic
function by AST identity and extracts its body statements. It must not find the
body with regular expressions, brace counting, or fixed string slicing.

TypeScript may emit helper statements outside the synthetic function for some
downlevel constructs. Such deterministic helper statements are moved to the
start of the extracted event body in original emitted order. The extractor
rejects any emitted import, export, module wrapper, or statement it cannot
classify as a compiler helper.

The resulting body:

- uses LF newlines,
- has exactly one final newline,
- contains no synthetic function declaration,
- contains no source map URL,
- contains no module loader call,
- is valid JavaScript when parsed as a function body, and
- is hashed before publication.

An empty TypeScript body produces an empty executable body, not a synthetic
comment or function.

### 7.7 Supported and unsupported syntax

Supported TypeScript includes:

- type annotations and inference,
- interfaces and type aliases local to the body,
- generics,
- union/intersection/literal types,
- nullable types and narrowing,
- type assertions,
- enums and classes when their emitted helpers pass extraction,
- optional chaining and nullish coalescing, and
- ordinary JavaScript statements valid inside the runtime function.

The following are blocking errors:

- static `import` or `export`,
- dynamic `import()`,
- namespaces/modules that emit module ownership outside the event,
- JSX/TSX,
- decorators,
- top-level `await` (the runtime wrapper is not async),
- triple-slash references to project or machine files,
- `require`, `module`, `exports`, Node globals, filesystem, shell, Electron, or
  worker entry points,
- emitted constructs the extractor cannot relocate safely, and
- TypeScript directives that disable checking for the entire file.

Policy diagnostics for private runtime members, forbidden globals, generated
`.func` symbols, prototype access, and performance hazards reuse the existing
JavaScript authoring AST checks. A suppression comment cannot suppress syntax,
module, private-member, or capability-policy diagnostics.

### 7.8 Determinism

For equal source, context, declarations, compiler version, and options version,
the emitted body and all hashes must be identical across:

- Windows, macOS, and Linux,
- Electron and browser builds,
- editor, MCP, and project-writer entry points, and
- repeated compilations.

Locale, current directory, path separator, installed global TypeScript version,
and wall-clock time must not affect output.

Compiler upgrades are migrations, not incidental dependency updates. An upgrade
requires:

1. Exact dependency version change.
2. Options-version or compiler-version receipt change.
3. Golden output review.
4. Full project revalidation/re-emission on next open/save.
5. Release-note compatibility entry.

---

## 8. Context typing and public API

### 8.1 Declaration source of truth

TypeScript events use the existing reviewed declarations from
`JavaScriptAuthoringApi.js`:

- `.gdevelop/runtime-api.d.ts`
- `.gdevelop/project-api.d.ts`

They do not import the complete GDJS runtime source tree. This keeps completion,
AI authoring, save-time validation, and TypeScript event checking on one public
API boundary.

The effective global surface is the ES2020 standard library plus explicitly
reviewed globals in `runtime-api.d.ts`. For parity with the existing code-event
debugging workflow, the reviewed declaration should include a minimal global
`console` with `log`, `info`, `warn`, and `error`. Loading the DOM library merely
to obtain `Console` is forbidden; the small interface is declared explicitly.

The module may retain its current filename for compatibility. Shared collection,
context construction, policy checks, and diagnostic mapping should be extracted
into language-neutral helpers so JavaScript and TypeScript cannot drift.

### 8.2 Context matrix

| Owner | `runtimeScene` | `objects` | `eventsFunctionContext` |
| --- | --- | --- | --- |
| Scene | `SceneRuntime<SceneName>` | Exact object/group picked type when configured | Absent |
| External events | `gdjs.RuntimeScene` unless a single linked scene is proven | Generic or proven picked type | Absent |
| Free extension function | `gdjs.RuntimeScene` | `gdjs.RuntimeObject[]` when configured | Present |
| Prefab/object function | `gdjs.RuntimeScene` | Owner-aware type when declarations support it | Present |
| Behavior function | `gdjs.RuntimeScene` | Owner-aware type when declarations support it | Present |

An unavailable parameter is an unknown identifier, not an optional global. The
embedded editor, popped-out editor, save checker, and compiler must agree.

### 8.3 Picked object semantics

The configured `parameterObjects` remains a GDevelop object expression and is
still exposed through `GetAllExpressionsWithMetadata`. Refactoring and object
validation therefore continue to see it.

At runtime the generator continues to:

1. Expand an object group when necessary.
2. Build the picked object array.
3. Assert that it contains no more than one picked instance.
4. Pass the array as `objects`.

Typing an array as one object or group does not create a pick and does not prove
cardinality. The deterministic object-picking rules continue to apply.

### 8.4 Signals and Static Data

Signal helpers exposed by the reviewed runtime declaration are usable from
TypeScript exactly where they are usable from JavaScript. Signal context is
still determined by event nesting at runtime; static typing cannot prove that a
code event is under a matching signal condition unless a future control-flow
model is added.

Static Data remains code-generation-time data for supported event/property
fields. `{{path}}` text inside JavaScript or TypeScript source is ordinary code
text and is never replaced.

---

## 9. Editor behavior

### 9.1 Product UX

The event picker label becomes **JavaScript / TypeScript code** or **Code
event**. In version 1, inserting it still creates JavaScript by default so
existing workflows and generated fixtures do not change.

The renderer adds a compact language selector above the editor:

```text
[ JavaScript | TypeScript ]       Compiled / 2 errors / Compiling…
```

For TypeScript:

- the header labels the block as TypeScript,
- the editor shows `sourceCode`,
- generated JavaScript is available only through an explicit read-only
  "Show generated JavaScript" action,
- diagnostics appear as Monaco markers and in an accessible summary,
- a pending compilation shows non-blocking progress, and
- a stale/invalid event explains why preview/export is unavailable.

Help links should lead to a code-event page with language tabs, not the current
JavaScript-only wording.

### 9.2 Language conversion

JavaScript to TypeScript:

1. Copy current `inlineCode` to `sourceCode` exactly.
2. Set the source language to TypeScript.
3. Compile and validate.
4. Apply the entire operation as one undoable event edit.

Valid JavaScript is generally valid TypeScript, but project API/private-policy
diagnostics may appear. If compilation fails, the conversion remains editable
and preview/export is blocked until fixed or undone.

TypeScript to JavaScript is an explicit destructive conversion dialog with:

- **Use generated JavaScript** (recommended), available only when current.
- **Cancel**.

The operation replaces `inlineCode` with current generated output and clears
all TypeScript fields. It never reinterprets TypeScript source containing type
syntax as JavaScript. Undo restores the TypeScript event.

### 9.3 `CodeEditor` language support

`CodeEditor` and `PoppedOutMonacoEditor` gain a required or defaulted language
prop:

```js
language: 'javascript' | 'typescript'
```

JavaScript remains the default for all existing call sites. Both code-editor
implementations must stop hard-coding `javascript` in Monaco creation.

Autocomplete setup adds reviewed declarations to both
`javascriptDefaults` and `typescriptDefaults`. The shared pinned compiler service
is authoritative for TypeScript syntax and semantic markers. Monaco's built-in
TypeScript diagnostics are disabled unless its worker is demonstrably using the
same exact compiler version, wrapper, options, and virtual files; duplicate or
version-skewed markers are not shown. The preference currently named "Show type
errors in JavaScript events" becomes "Show type errors in code events" and
continues to control optional semantic diagnostics for JavaScript only;
TypeScript diagnostics always run.

### 9.4 Wrapped Monaco model

A TypeScript event is a function body, but a plain Monaco `.ts` model is a
top-level script. To keep completion and diagnostics faithful, the editor uses
the same one-line synthetic wrapper prefix and one-line suffix as the compiler.
Those two lines are hidden and protected from edits.

The editor adapter maps:

- source line `n` to model line `n + 1`,
- source cursor/selection/marker ranges in both directions,
- body edits back to exact `sourceCode`, and
- source scroll/cursor state without persisting synthetic coordinates.

Tests must cover select-all, paste, undo, find/replace, formatting, cursor at the
first/last line, empty source, CRLF input, and the popped-out editor. A hidden
line that can be deleted or copied into source is a release blocker.

If Monaco cannot safely protect a wrapped model, the fallback is to keep a body
model, disable its built-in diagnostics, and feed markers/completions from the
shared wrapper-aware language service. It is not acceptable to show top-level
diagnostics that disagree with save-time compilation.

Monaco completion may use its worker only while compatibility fixtures prove it
agrees with the shipped compiler on the supported syntax and declaration set.
Otherwise completion also comes from the shared worker language service.

### 9.5 Context and project declarations in Monaco

The editor model URI is unique and stable for the event and scope. It uses the
same runtime/project declaration strings and hashes as preflight. Multiple code
events visible in one sheet and a popped-out editor must not overwrite each
other's parameter context through one global ambient `objects` declaration.

Project changes that regenerate declarations invalidate affected TypeScript
models and schedule revalidation. They do not rewrite source text.

### 9.6 Editing lifecycle

The current renderer updates JavaScript live. TypeScript follows the same source
editing behavior with these additions:

1. `onChange` calls `SetSourceCode` and marks the project unsaved.
2. A short debounce schedules worker compilation.
3. `onBlur` closes the event history transaction based on source changes, not
   generated output changes.
4. Preview/save explicitly await any pending compile instead of trusting the
   debounce.
5. An older result is discarded by revision checks.

Object-parameter editing invalidates and recompiles the TypeScript context.
Expanding/collapsing the editor does not.

### 9.7 Search and read-only renderers

All display/search consumers use a single helper:

```js
getCodeEventAuthoritativeSource(jsCodeEvent)
```

It returns `sourceCode` for TypeScript and `inlineCode` for JavaScript. This
helper is used by:

- global event search,
- text rendering,
- graph preview summaries,
- extension event summaries,
- AI/MCP project summaries, and
- source export tools.

Labels and ids become language-aware. Existing DOM/test ids may keep `js-code`
as a compatibility alias, but new code should use `code-event`.

---

## 10. Runtime and C++ code generation

### 10.1 Generated shape

After successful preflight, TypeScript uses the same generated structure as
JavaScript:

```js
namespace.userFunc123 = function GDJSInlineCode(runtimeScene, objects) {
  "use strict";
  // Deterministically emitted JavaScript body.
};

const objects = namespace.SomeObjectObjects1;
gdjs.assertObjectListHasNoMoreThanOnePickedInstance(
  objects,
  'TypeScript event object parameter "Player"'
);
namespace.userFunc123(runtimeScene, objects);
```

Function-context events continue to receive `eventsFunctionContext`. Scene
events do not. There is no TypeScript runtime helper, compiler, type metadata,
or declaration file in the exported game.

### 10.2 Generator changes

`CommonInstructionsExtension.cpp` should make only language-aware changes:

- Run the integrity guard before reading `inlineCode` for TypeScript.
- Keep existing JavaScript output byte-for-byte unchanged.
- Keep `GDJSInlineCode` as the function name.
- Use "TypeScript event object parameter" in the object-cardinality assertion
  for TypeScript and the current JavaScript wording for JavaScript.
- Add a blocking diagnostic and report failure when the artifact is invalid.

The event registration type and icon identifier remain compatible. The
translated name/description may become language-neutral.

### 10.3 Runtime error UI

`RuntimeGame._isErrorComingFromJavaScriptCode` and
`AbstractDebuggerClient.isErrorComingFromJavaScriptCode` continue recognizing
`GDJSInlineCode`. Product strings change to "JavaScript or TypeScript code
event" or the shorter "code event."

No first-release promise is made that a runtime stack line maps back to the
TypeScript source line. The compile-time source map is exact, and generated JS
can be inspected. Whole-generated-file source-map composition is a later
feature because the current C++ code generator does not build source maps for
raw JavaScript events either.

---

## 11. Project open, save, preview, and export

### 11.1 One preflight API

Introduce one orchestration API, conceptually:

```js
prepareProjectCodeEvents({
  project,
  serializedProject,
  sourceFiles,
  reason: 'open' | 'edit' | 'save' | 'preview' | 'export' | 'mcp',
  scope,
}): Promise<CodeEventPreparationReceipt>
```

The receipt includes:

```js
{
  checked: true,
  valid: boolean,
  javascriptBlocks: number,
  typescriptBlocks: number,
  compiledBlocks: number,
  cacheHits: number,
  compilerVersion: string,
  optionsVersion: number,
  standardLibraryHash: string,
  runtimeApiHash: string,
  projectApiHash: string,
  errors: Array<CodeEventDiagnostic>,
  warnings: Array<CodeEventDiagnostic>
}
```

It collects event locations once, builds declarations once, validates both
languages with their compatibility policies, compiles TypeScript, and applies
atomic output results back to the matching C++ events or serialized objects.

The current separate walkers for serialized JavaScript blocks, source-file
`@js` blocks, MCP event references, and editor events should share a common
`CodeEventDescriptor` shape. Scope ownership and source location must not be
reimplemented independently by each consumer.

### 11.2 Open flow

Legacy/folder/cloud/download/URL JSON open:

1. Let the storage provider read and normalize the serialized object; older
   TypeScript events already contain compatibility JavaScript.
2. At the central `MainFrame` load boundary, before or immediately after
   `gd.Serializer.fromJSObject`/project unserialization, load the compiler chunk
   when at least one TypeScript event exists.
3. Generate the current declarations.
4. Verify receipts and recompile when compiler/options/context changed.
5. Apply current output to the serialized object or newly created C++ events.
6. Expose the project to generation only after preflight succeeds.

If source has errors or the compiler is unavailable, the project may open in an
editable recovery state, but preview/export/save publication is blocked and the
event retains its source. It must not silently become JavaScript.

The preflight belongs at the central load boundary as well as the local
multi-file adapter; putting it only in `LocalProjectOpener.js` would miss cloud,
URL, download/import, autosave, version-history reload, and saved-project preview
paths. Multi-file open is specified in section 12 because authoritative
`.events` source does not carry generated output.

### 11.3 Save flow

Before project serialization/publication:

1. Flush the active editor value into the C++ model.
2. Await pending compilation.
3. Serialize a provisional project model if needed for declaration generation.
4. Generate `runtime-api.d.ts` and `project-api.d.ts` in memory.
5. Run full JavaScript/TypeScript validation.
6. Compile every stale TypeScript event and apply its result.
7. Re-serialize so `inlineCode` and receipts are current.
8. Write authoritative source and generated artifacts through the existing
   verified transaction.

Blocking diagnostics abort publishing the new source set, matching the strict
JavaScript authoring contract. Source remains in the live editor/model so the
user can fix it; no previous on-disk project is partially overwritten.

The central `MainFrame` save orchestration must finish this preparation before
invoking any storage provider. `LocalProjectWriter`, `CloudProjectWriter`, the
download/Save As path, autosave, and background serialization must also assert
that the project carries a current preparation result or defensively invoke the
same idempotent preflight. No provider may assume that another UI path already
compiled the events.

For multi-file projects:

- `.events` contains TypeScript source, not generated JavaScript or receipts.
- `.gdevelop/game.json` contains the fully composed legacy event with source,
  current generated `inlineCode`, and receipt.
- `.gdevelop/runtime-api.d.ts` and `.gdevelop/project-api.d.ts` contain the
  declaration hashes used by the receipt.

### 11.4 Preview and export boundaries

The following paths must await preflight before their current synchronous C++
call:

- local preview launcher,
- browser service-worker preview launcher,
- browser S3 preview path where it generates locally,
- local HTML5/Cordova/Electron/Facebook export,
- browser HTML5/Cordova/Electron/Facebook export,
- online export package preparation,
- generated-code inspection,
- free extension function generation,
- event-based behavior generation,
- event-based object generation, and
- any test/helper that directly invokes a layout/function code generator on a
  project containing TypeScript.

The preferred implementation adds preflight to shared preview/export
orchestration rather than copying it into every concrete exporter. The concrete
call sites remain audited because several currently invoke `gd.Exporter` or a
code generator directly.

Hot reload must compare generated JavaScript hashes, not TypeScript source
lengths. A type-only edit can update source/receipt without changing runtime
code; it still saves but need not reload the running preview. A value/statement
edit that changes `inlineCode` follows the current generated-code reload path.

### 11.5 Generated-code inspection

`GenerateEventsCode.js` is currently synchronous and assumes all event bodies
are ready. Its public UI action becomes asynchronous:

1. Preflight the requested scope.
2. If invalid, show the first diagnostic and a link/focus action to the event.
3. Otherwise call the existing C++ generator and format the JavaScript.

The dialog remains a JavaScript output viewer, even when the source event is
TypeScript.

### 11.6 Extension loader

`EventsFunctionsExtensionsLoader/index.js` generates free functions, behaviors,
and objects directly. The project-level extension load operation must preflight
all extension-owned code events before generating any part of the extension.
It publishes the complete new extension only if every blocking diagnostic is
clear, preserving the current all-or-nothing expectation.

---

## 12. IfDo Events DSL 2.1

### 12.1 Version change

Adding TypeScript changes the raw-block scanner and supported event fields. The
Events DSL version becomes `2.1`; it must not be smuggled into `2.0` under an
unchanged version marker.

The multi-file loader supports both `2.0` and `2.1`:

- `2.0` accepts existing syntax and rejects `@ts`.
- `2.1` accepts existing syntax plus `@ts`.
- A project containing `@ts` requires and emits `2.1`.
- A project opened as `2.0` and still using only 2.0 features remains `2.0` on
  save, so merely using a newer editor does not break older-editor access.
- Once a source tree is `2.1`, normal saves preserve `2.1` even after the last
  TypeScript event is removed; version markers do not oscillate.
- Older editors see the unsupported `2.1` marker and stop before rewriting
  source, which is safer than parsing TypeScript as JavaScript.

Newly decomposed legacy projects emit the minimum required version: `2.0` when
they contain no TypeScript event and `2.1` when they do. The existing strict
equality check in `MultiFileProjectFormat/index.js` must become an explicit
supported-version dispatch, not an unbounded "greater than" check.

The loaded root version is storage provenance, not gameplay data. The
multi-file opener carries it beside the source-file set and passes it back to
decomposition; it is not inserted into legacy `game.json`. The writer emits the
greater of (a) the loaded source version and (b) the minimum version required by
the current source. `IFDO_EVENTS_DSL_COVERAGE.formatVersion` therefore denotes
the newest grammar implemented by the editor, not an unconditional version to
stamp on every save.

### 12.2 Syntax

Canonical TypeScript event:

```events
@ts objects="Player" strict=true expanded=false
const player = objects[0];
const speed: number = 250;
player.setX(player.getX() + speed);
@end ts
```

Arguments are identical to `@js`:

- `objects=<string>`
- `strict=<boolean>`
- `expanded=<boolean>`
- `delimiter=<identifier>`

`strict` controls runtime strict mode, not TypeScript checker strictness.

When the body contains a physical terminator at the event depth, canonical
formatting selects a delimiter:

```events
@ts delimiter="IFDO_1"
const text: string = `
@end ts
`;
@end ts IFDO_1
```

The delimiter algorithm is the same as JavaScript with `ts` substituted for
`js`. The body is raw text: indentation, blank lines, line endings, comments,
and strings are not tokenized by the Events DSL parser.

### 12.3 Parser model

Generalize the current JavaScript-specific scanner into a raw code-block
scanner that recognizes `@js` and `@ts` before structural tokenization.

`SourceLine` should carry a language-neutral body record rather than `jsBody`:

```js
codeBody: {
  language: 'javascript' | 'typescript',
  source: string,
  headerLine: number,
  bodyLine: number,
  delimiter: string
}
```

Expose `extractIfDoCodeBlocks(source)` and retain
`extractIfDoJavaScriptBlocks(source)` as a compatibility filter. Add
`extractIfDoTypeScriptBlocks(source)` for focused callers/tests.

The normalized TypeScript legacy event contains:

```js
{
  type: 'BuiltinCommonInstructions::JsCode',
  disabled: false,
  folded: false,
  inlineCode: '',
  parameterObjects: 'Player',
  useStrict: true,
  eventsSheetExpanded: false,
  sourceLanguage: 'typescript',
  sourceCode: '<raw body>'
}
```

`inlineCode` remains empty until the project-aware asynchronous composition
step compiles it. A raw placeholder object must never be passed to C++ code
generation.

### 12.4 Async composition boundary

The current format composer is synchronous, while loading the browser compiler
chunk is asynchronous and complete context typing requires the composed project.
Add an asynchronous composition path used by local project open:

```js
composeLegacyProjectFromFilesAsync(files, options)
```

It:

1. Validates the root version.
2. Parses settings/layout/event sources structurally.
3. Preserves a side table mapping code-event objects to `fileUri`, header line,
   body line, and owner context.
4. Builds the complete legacy project object.
5. Runs the shared code-event preparation service against that object and side
   table.
6. Returns only after every TypeScript event has current output.

The existing synchronous composer remains valid for 2.0 and 2.1 source without
`@ts`. If it encounters `@ts`, it throws
`MULTIFILE_TYPESCRIPT_COMPILER_REQUIRED`; it never returns an executable-looking
event with empty code.

The side table is format-internal provenance and is not enumerable or
serialized. Diagnostics use it to map wrapper lines back to `.events` lines.

### 12.5 Decompilation

When converting serialized events to DSL:

- JavaScript emits the current `@js` form from `inlineCode`.
- TypeScript emits `@ts` from `sourceCode`.
- The decompiler ignores generated `inlineCode` and `transpilation` after
  verifying their schema enough to report corruption.
- A TypeScript event without `sourceCode` is an unsupported/corrupt event error,
  not an `@js` fallback.

Generated output and receipts never appear in `.events` source.

### 12.6 Coverage table

`IFDO_EVENTS_DSL_COVERAGE` changes to version `2.1` and adds these fields to the
existing event type:

```text
sourceLanguage
sourceCode
transpilation
```

Its metadata section adds `ts` with the same four arguments as `js`. The
normalizer validates the nested receipt keys and rejects unknown keys. This is
required for lossless legacy JSON conversion and no-silent-fallback behavior.
Version-selection helpers separately report the minimum grammar needed by a
source tree, so the coverage constant does not force a JavaScript-only 2.0 tree
to upgrade.

---

## 13. Diagnostics

### 13.1 Diagnostic shape

Code-event diagnostics extend the current authoring diagnostic shape:

```js
{
  severity: 'error' | 'warning',
  phase: 'typescript-parse' | 'typescript-typecheck' |
    'code-event-policy' | 'typescript-emit' | 'code-event-integrity',
  code: 'TS_EVENT_TYPE_ERROR',
  message: '...',
  fileUri: 'game://scenes/Main/Main.events',
  eventPath: [3, 1],
  line: 18,
  column: 7,
  endLine: 18,
  endColumn: 22,
  typescriptCode: 2339
}
```

For editor-only projects, `fileUri` is a stable virtual URI and `eventPath`
is still present. Wrapper offsets are removed before returning diagnostics.

### 13.2 Initial codes

| Code | Meaning |
| --- | --- |
| `TS_EVENT_COMPILER_UNAVAILABLE` | The built-in compiler chunk could not load |
| `TS_EVENT_RESOURCE_LIMIT` | Project block/source limits were exceeded |
| `TS_EVENT_SYNTAX_ERROR` | TypeScript cannot parse the wrapped body |
| `TS_EVENT_TYPE_ERROR` | Generic semantic type error |
| `TS_EVENT_UNKNOWN_MEMBER` | Public API member or project symbol is unknown |
| `TS_EVENT_NULLABILITY` | Nullable value was used without narrowing |
| `TS_EVENT_PRIVATE_MEMBER` | Runtime-private/generated member was accessed |
| `TS_EVENT_FORBIDDEN_GLOBAL` | Disallowed browser/Node/Electron/global API |
| `TS_EVENT_UNSUPPORTED_MODULE` | Import/export/module syntax was used |
| `TS_EVENT_UNSUPPORTED_EMIT` | Compiler output cannot be safely extracted |
| `TS_EVENT_STALE_OUTPUT` | Receipt does not match current source/context |
| `TS_EVENT_CORRUPT_OUTPUT` | Generated JavaScript hash does not match |
| `TS_EVENT_INTERNAL_COMPILER_ERROR` | Compiler/extractor invariant failed |
| `CODE_EVENT_PERFORMANCE_RISK` | Unbounded loop or expensive pattern warning |

Raw TypeScript diagnostic numbers are retained in `typescriptCode`, but stable
GDevelop codes drive UI, tests, MCP responses, and documentation.

### 13.3 Severity

- TypeScript syntax errors are always errors.
- TypeScript semantic errors are errors; TypeScript is not a compatibility
  checking mode.
- Private/capability/module violations are errors.
- Unbounded-loop and allocation heuristics are warnings unless an AI-authoring
  policy upgrades them.
- Existing JavaScript compatibility severity remains unchanged: legacy/private
  uses may be warnings while strict/new AI-authored blocks treat them as errors.
- Disabled TypeScript events are still parsed, checked, and compiled on save.
  Disabling an event is not a way to store corrupt TypeScript in published
  source.

### 13.4 Error handling

When compilation fails:

- authoritative source is never replaced,
- the first error is focused from preview/save dialogs when possible,
- all errors remain available in the event marker list,
- last-good output remains marked stale,
- project publication and generation are blocked, and
- no empty JavaScript event is substituted.

---

## 14. Compatibility and migration

### 14.1 Existing JavaScript projects

There is no eager migration. Missing `sourceLanguage` means JavaScript and the
serializer continues to omit new fields. Existing JavaScript source, codegen,
undo, previews, exports, JSON fixtures, and Events DSL `@js` blocks must remain
unchanged.

### 14.2 Older GDevelop opening legacy JSON

An older build recognizes `BuiltinCommonInstructions::JsCode`, ignores unknown
TypeScript fields, displays generated `inlineCode` as JavaScript, and can run it.
If that older build saves, its serializer drops the unknown TypeScript source
and receipt. The event is intentionally downgraded to a JavaScript event.

This is executable backward compatibility, not lossless authoring
compatibility. Documentation and the new editor should warn that editing a
TypeScript project with an older version can discard TypeScript source.

A separate TypeScript event type would be worse: the older build would replace
it with `EmptyEvent` and could lose executable behavior too.

### 14.3 Older GDevelop opening multi-file source

The `eventsDslVersion = "2.1"` marker makes an older multi-file loader reject
the project before parsing/rewrite. This is deliberately fail-closed and
preserves authoritative `@ts` source.

The generated `.gdevelop/game.json` remains available as a compatibility
artifact, but it is not the source of truth and must not be used to overwrite
the 2.1 source tree.

### 14.4 Compiler upgrades

When the current editor sees a valid old compiler receipt:

1. Preserve `sourceCode`.
2. Revalidate with current declarations/compiler/options.
3. Replace `inlineCode` and receipt only on success.
4. Set the artifact-needs-persistence state only when serialization must persist
   a new generated artifact; do not create an authoring undo step. The editor
   may surface this through its existing unsaved indicator if storage has no
   separate artifact-dirty state.
5. On failure, retain the old fallback as last-good but block generation.

### 14.5 Unknown/corrupt source

Unknown language, missing TypeScript source, malformed receipt, or hash mismatch
is a blocking diagnostic. The model preserves available fields for recovery.
It never guesses whether `inlineCode` was authored or generated.

---

## 15. Other consumers and integrations

### 15.1 MCP and AI tools

The permission currently named `allow_javascript_events` protects raw code
events. Preserve it as an accepted compatibility alias and introduce the
language-neutral `allow_code_events`. Either true value authorizes JavaScript
or TypeScript only when the user explicitly requested raw code.

Add a language-aware tool:

```text
replace_code_event_source
```

Input includes:

```js
{
  scene_name,
  event,
  language: 'javascript' | 'typescript',
  source,
  parameter_objects?,
  expected_revision?
}
```

The existing `replace_javascript_event_code` remains and rejects a TypeScript
event with guidance to use the new tool. The new tool runs compiler preflight
before committing the mutation and returns source-located diagnostics plus
compiler receipt summary. It never accepts caller-supplied generated JavaScript
or receipt hashes.

Event linting changes its issue type/message from JavaScript-specific to
`code-event-not-allowed`, while preserving the old issue alias where API
compatibility requires it.

Extension summaries and project resources report language and authoritative
source previews, never generated TypeScript output as if it were authored code.

### 15.2 AI-generated serialized events

Serialized TypeScript events supplied by an AI are not trusted to provide
`inlineCode` or `transpilation`. Validation discards caller-provided generated
fields, compiles `sourceCode` locally, and publishes only the local result.

AI code-event policy continues to require explicit user authorization and the
reviewed runtime API. Type-check suppression directives, private APIs, dynamic
imports, Node/Electron capabilities, and unbounded loops follow the stricter AI
profile.

### 15.3 Text renderer, graph preview, and global search

These consumers keep the event type switch but use the authoritative-source
helper and language-aware labels:

- `JavaScript event (objects: Player)`
- `TypeScript event (objects: Player)`
- graph title `TypeScript code`
- global search prefix `TypeScript:`

Preview truncation counts source lines, not generated JavaScript lines.

### 15.4 Preferences and help

Rename JavaScript-only UI strings where they now cover both languages:

- type-error preference,
- runtime crash banner,
- event insertion description,
- object parameter comment,
- generated-code/help copy, and
- MCP schemas/descriptions.

Do not mechanically replace references that specifically describe JavaScript
runtime output, the `JavaScriptAuthoringApi` compatibility name, or `@js`.

### 15.5 Memory tracking

`JsCodeEvent` remains the tracked C++ type, so
`MemoryTrackedRegistryDialog.js` does not gain a second class. Additional
persisted strings increase tracked memory naturally with the object.

---

## 16. Security, performance, and reliability

### 16.1 Security boundary

TypeScript compiles to the same privileged in-game JavaScript as a JavaScript
event. Types do not sandbox runtime behavior. The reviewed declarations and
policy checker reduce accidental/private API use, but a user who deliberately
casts through `any` can still reach JavaScript capabilities present at runtime.

The compiler service must:

- include no project-relative module resolver,
- read no arbitrary project/machine files,
- include no DOM or Node declaration libraries,
- reject imports/triple-slash file references,
- accept only declaration strings supplied by the editor,
- run in a worker where available, and
- return serializable diagnostics/output only.

No source text, generated output, identifiers, or declaration bodies are sent
to telemetry.

### 16.2 Dependency policy

Pin TypeScript exactly in `newIDE/app/package.json`; do not use a caret range for
the event compiler. The lockfile alone is not the feature's semantic version.
The lazy chunk is part of the shipped editor and must work offline after the
editor is installed/cached.

### 16.3 Resource limits

Initial hard limits:

- 500 total code events per project validation pass,
- 2 MiB total authoritative source,
- 256 KiB per event,
- bounded emitted-output ratio (for example 8x source plus a fixed helper
  allowance), and
- bounded diagnostic count per event/project with a truncation diagnostic.

The worker should be restartable after an internal compiler failure. A failed
worker never causes fallback execution of stale code.

### 16.4 Interactive performance

- Lazy-load on the first TypeScript event.
- Debounce interactive checking.
- Reuse declarations and old `Program` instances by hash.
- Compile the active event first, then validate other invalidated events.
- Cancel or ignore obsolete revisions.
- Cache results by complete source/context/compiler digest.
- Do not reload a preview for type-only output-equivalent changes.

Telemetry may record feature flag, block counts, cache hit rate, duration,
compiler version, result category, and stable diagnostic code. It must not
record source or project names.

---

## 17. Implementation map

### 17.1 C++ model, serialization, and generation

| File/area | Required change |
| --- | --- |
| `GDJS/GDJS/Events/Builtin/JsCodeEvent.h` | Add language/source/receipt model, invalidation, atomic result API, clone fields |
| `GDJS/GDJS/Events/Builtin/JsCodeEvent.cpp` | Serialize TS-only fields, default missing language to JS, validate receipt shape |
| `GDJS/GDJS/Extensions/Builtin/CommonInstructionsExtension.cpp` | Language-neutral metadata, integrity guard, language-aware assertion label, blocking diagnostic |
| `Core/GDCore/Events/CodeGeneration/DiagnosticReport.*` | Add invalid-code-event diagnostic/blocking propagation if not implemented elsewhere |
| `Core/GDCore/Events/CodeGeneration/EventsCodeGenerator.*` | Propagate code-event generation failure instead of leaving `ErrorOccurred` unused |
| `GDJS/GDJS/Events/CodeGeneration/*` | Return/expose failure through layout/free/behavior/object generators |
| `GDJS/GDJS/IDE/ExporterHelper.cpp` | Abort generated event export on blocking code-event diagnostics |
| Core tools | Add deterministic SHA-256 helper shared by native/WASM integrity guard |

### 17.2 Bindings and generated types

| File/area | Required change |
| --- | --- |
| `GDevelop.js/Bindings/Bindings.idl` | Expose source language/source and atomic result/integrity state |
| `GDevelop.js/Bindings/Wrapper.cpp` | Existing class include remains; regenerate wrappers |
| `GDevelop.js/Bindings/postjs.js` | Existing cast remains; optional helper for atomic result |
| `GDevelop.js/scripts/generate-types.js` | Ensure new methods flow to Flow types |
| `GDevelop.js/scripts/generate-dts.mjs` | Ensure new methods flow to TypeScript declarations |
| generated glue/types | Regenerate, do not hand-diverge |

### 17.3 Compiler and authoring API

| File/area | Required change |
| --- | --- |
| new `ProjectsStorage/TypeScriptEventCompiler.js` | Compiler contract, hashes, AST extraction, diagnostics |
| new compiler worker | Browser/Electron background execution |
| generated virtual standard-library module/build script | Bundle the pinned `lib.es2020.d.ts` reference closure for browser and Electron |
| `ProjectsStorage/JavaScriptAuthoringApi.js` | Extract shared code-event descriptors/context/policy and add TS validation inputs |
| `newIDE/app/package.json` | Pin exact TypeScript compiler used by the feature |
| lockfile | Regenerated only as part of the dependency change |

### 17.4 Editor

| File/area | Required change |
| --- | --- |
| `EventsTree/Renderers/JsCodeEvent.js` | Language selector, authoritative source, status, compile lifecycle, conversion |
| `CodeEditor/index.js` | Language prop and wrapped-model adapter |
| `CodeEditor/PoppedOutMonacoEditor.js` | Same language/model mapping as embedded editor |
| `CodeEditor/MonacoSetup.js` | TypeScript defaults/options and language-aware diagnostics |
| local/browser autocomplete files | Register reviewed declarations for TS and avoid global context leakage |
| `EventsRenderingService.js` | Existing type mapping remains |
| event toolbar/picker | Language-neutral event name and discoverability |
| preferences | Rename type-error preference/copy |

### 17.5 Source formats and storage

| File/area | Required change |
| --- | --- |
| `EventsSheet/IfDoEventsDsl/index.js` | `@ts`, generalized raw scanner, v2.1 coverage, TS fields/decompiler |
| `ProjectsStorage/MultiFileProjectFormat/index.js` | supported version dispatch, async TS composition/provenance |
| `LocalFileStorageProvider/LocalMultiFileProject.js` | Load compiler and use async composition |
| `LocalFileStorageProvider/LocalProjectOpener.js` | Recovery/current-receipt validation for legacy JSON |
| `LocalFileStorageProvider/LocalProjectWriter.js` | Await preparation before serialization/transaction |
| central `MainFrame` project load/save and `loadProjectFromSavedFileForPreview` boundaries | Prepare code events for every storage provider, autosave, reload, and preview copy |
| `CloudProjectWriter.js`, download/Save As, URL/cloud readers, and other storage providers | Preserve TS fields in legacy JSON and assert or defensively invoke the central preparation boundary before serialization |
| background serializer path | Ensure current artifacts are present before off-thread serialization |

### 17.6 Generation boundaries and secondary consumers

| File/area | Required change |
| --- | --- |
| local/browser preview launchers | Await shared preflight |
| local/browser exporters | Use shared prepared-project boundary |
| `EventsFunctionsExtensionsLoader/index.js` | Preflight extension-owned events |
| `EventsSheet/GenerateEventsCode.js` | Async preflight and diagnostic result |
| `EventsSheet/index.js` | Await generated-code preparation and carry diagnostics into the dialog state |
| runtime/debugger client strings | Language-neutral code-event crash wording |
| text renderer/graph/global search | Authoritative source and language labels |
| MCP event/project/extension tools and schemas | Language-aware write/validation/permissions |

### 17.7 Documentation to update with implementation

- Events DSL: add version 2.1 and normative `@ts` mapping.
- JavaScript authoring API: broaden event context/validation to code-event
  source while retaining declaration filenames.
- Multi-file format: 2.0/2.1 version selection and generated compatibility
  artifact.
- Architecture: dual-source model and pre-generation compiler seam.
- Deterministic picking: TypeScript uses the same single-picked-instance rule.
- Signal system: add TypeScript examples or language-neutral code-event wording.
- User-facing code event documentation/help page.

---

## 18. Implementation phases

### Phase 1: Compiler contract and golden tests

1. Pin the compiler.
2. Implement wrapper construction, checking, policy scan, AST body extraction,
   canonical output, hashes, and diagnostics in isolation.
3. Add worker loading for browser and Electron.
4. Establish golden fixtures before touching the event model.

Exit criterion: deterministic compiler tests pass on all supported operating
systems and browser/Electron test environments.

### Phase 2: Model, serialization, and bindings

1. Extend `JsCodeEvent` and clone/serialization behavior.
2. Add receipt integrity checks.
3. Expose atomic APIs through GDevelop.js.
4. Regenerate bindings and types.
5. Add C++/GDevelop.js serialization compatibility tests.

Exit criterion: existing JS JSON is unchanged; TS JSON round-trips; missing
language loads as JS; invalid language/receipt is preserved and diagnosed.

### Phase 3: Editor authoring

1. Add language-aware CodeEditor and popped-out editor.
2. Implement protected wrapped Monaco model.
3. Add language selector/conversion/status/markers.
4. Compile on edit with revision ordering.
5. Use project-aware declarations and exact parameter contexts.

Exit criterion: a user can create, edit, undo, type-check, and inspect generated
JS for TypeScript events in every owner kind without stale async results.

### Phase 4: Storage and DSL

1. Add Events DSL 2.1 `@ts` scanner/parser/decompiler.
2. Add async multi-file composition and source provenance.
3. Integrate project open/save preparation.
4. Write source-only `.events` and current generated `.gdevelop/game.json`.
5. Add conditional 2.0/2.1 version-selection and round-trip fixtures.

Exit criterion: multi-file source round-trips without generated-code churn and
invalid TS cannot partially publish a save.

### Phase 5: Preview, export, and C++ defense in depth

1. Add the shared preflight to every generation boundary.
2. Propagate C++ code-event integrity failures.
3. Verify scene/free/behavior/object generators.
4. Verify local/browser preview and every export family.
5. Update runtime/debugger wording.

Exit criterion: no supported current-editor generation path can run stale
output, and exported games contain no TypeScript compiler or source requirement.

### Phase 6: MCP, AI, secondary consumers, and rollout

1. Add language-aware MCP tool and permission aliases.
2. Update lints/summaries/search/text/graph consumers.
3. Add feature flag and privacy-safe metrics.
4. Update all affected specifications and user documentation.
5. Remove the flag only after compatibility fixtures and production telemetry
   show acceptable compiler reliability/latency.

---

## 19. Testing requirements

### 19.1 Existing JavaScript regression tests

- Default `JsCodeEvent` source and generated code are unchanged.
- Clone, parameter object, expansion, cursor, and strict behavior are unchanged.
- Serialized JS event JSON contains no new fields.
- Current `@js` raw-body/delimiter round-trips are byte-equivalent.
- Existing code-generation snapshots are byte-equivalent.
- JavaScript editor and popped-out editor still use JavaScript language mode.

### 19.2 Model and serialization tests

- TypeScript fields clone and round-trip.
- Missing language becomes JavaScript.
- Unknown language is preserved/diagnosed and not executed.
- `SetSourceCode`, `SetInlineCode`, and `SetParameterObjects` invalidate the
  appropriate receipt.
- Atomic result setter produces a current structural state.
- Source/output hash corruption is detected in native and WebAssembly builds.
- Old JS-only serialization of a TS event produces executable JavaScript and
  drops TS metadata as the documented downgrade.

### 19.3 Compiler golden tests

Success cases:

- empty body,
- annotations/interfaces/type aliases/generics erased,
- exact scene object and group types,
- nullable narrowing,
- local `return`,
- functions/classes/enums and any emitted helpers,
- optional chaining/nullish coalescing,
- comments, Unicode, quotes, template strings, regexes, and braces,
- CRLF and LF source,
- source ending with and without newline,
- `objects` present/absent,
- `eventsFunctionContext` present/absent, and
- every owner kind.

Failure cases:

- syntax error with exact source line,
- unknown/private member,
- bad project object/group/behavior/resource name,
- nullability error,
- static and dynamic import,
- export/namespace/module,
- JSX/decorator/top-level await,
- DOM/Node/Electron/filesystem globals,
- triple-slash reference,
- unsupported emitted helper/statement,
- output parse failure,
- compiler unavailable/crash, and
- per-event/project resource limit.

Determinism cases:

- repeated output/hash equality,
- Windows/Linux/macOS fixtures,
- browser/Electron equality,
- declaration-order canonicalization,
- project/context hash invalidation,
- compiler/options-version invalidation, and
- output-equivalent type-only source change.

### 19.4 Editor tests

- Language selector and both conversion directions.
- One undo entry for conversion; none for generated output.
- Monaco language and completions in embedded/popped-out editors.
- Monaco and save-time diagnostics agree under the exact pinned compiler;
  version-skewed built-in markers are suppressed.
- Protected wrapper cannot be edited/copied into source.
- Cursor/selection/marker/source line mapping.
- Multiple visible code events have isolated context types.
- Parameter-object edit retypes/recompiles.
- Older compile result loses the race to newer source.
- Deleted/disposed event ignores pending result.
- Preview waits for an active compile.
- Invalid/stale status blocks generation and focuses the source.

### 19.5 Events DSL and storage tests

- Canonical `@ts` with all metadata arguments.
- Empty body and raw body preservation.
- Default and collision delimiters.
- Literal `@end ts` at other depth/instruction depth.
- JS and TS blocks adjacent and nested among structural events.
- JSON-to-DSL-to-JSON equivalence excluding regenerated artifact bytes.
- Events DSL 2.0 stays 2.0 until a 2.1 feature is introduced; 2.0 rejects
  `@ts`; adding TypeScript raises the marker; 2.1 accepts and remains 2.1.
- Old loader rejects 2.1 marker before rewriting.
- Multi-file save excludes output/receipt from `.events`.
- `.gdevelop/game.json` includes current source/output/receipt.
- Save transaction remains atomic on TypeScript diagnostics.
- Legacy/folder JSON open/save and migration to multi-file.

### 19.6 Code generation and runtime tests

- TypeScript output executes in a scene.
- Picked object and object-group cardinality assertion remains enforced.
- `useStrict` matches JavaScript behavior.
- Free function receives `eventsFunctionContext`.
- Behavior, prefab/object, external event, and linked event contexts execute.
- Disabled TypeScript event is not generated.
- Invalid receipt generates a blocking diagnostic and never stale code.
- Runtime/debugger recognizes `GDJSInlineCode` and shows code-event wording.
- Local and browser preview produce equivalent output.
- HTML5, Cordova, Electron, Facebook, and online package paths contain emitted
  JS and no TypeScript compiler dependency.
- Hot reload skips output-equivalent type-only edits and reloads behavior edits.

### 19.7 MCP and consumer tests

- Raw code remains disallowed by default.
- Compatibility permission alias works.
- JavaScript-only replacement tool rejects TS target.
- Language-aware replacement compiles locally and ignores caller artifacts.
- MCP dry-run does not mutate source/output.
- Text renderer/search/graph/extension summary use TS source and labels.
- Diagnostics retain event path and source URI through MCP JSON responses.

### 19.8 Performance tests

- First compiler load is measured and does not freeze the UI.
- Warm single-event edit meets the agreed interactive budget.
- 500-block/2-MiB project completes within the save/preview budget.
- Cache hits avoid re-emission.
- Worker restart recovers after a forced compiler exception.
- Large emitted-output amplification is rejected.

---

## 20. Acceptance criteria

The feature is complete only when all of the following are true:

1. A new TypeScript code event can be authored in every supported event-sheet
   owner.
2. Type annotations are checked against the curated runtime API and current
   project symbols.
3. Editor, save, preview, generated-code view, extension loader, MCP, and export
   use one compiler contract and produce the same output hash.
4. Existing JavaScript event serialization and generation snapshots are
   unchanged.
5. TypeScript source is authoritative and generated JavaScript is never shown as
   editable source.
6. A source, parameter, owner, declaration, compiler, or option change
   invalidates the correct receipt.
7. No supported current-editor path executes stale or corrupt output.
8. C++ generation fails closed when its integrity guard fails.
9. Multi-file `.events` stores canonical `@ts` source only and the 2.0/2.1
   version is selected and preserved safely.
10. Legacy JSON contains an executable fallback for older GDevelop builds.
11. Older multi-file loaders reject version 2.1 before rewriting source.
12. Source-located diagnostics map to the exact TypeScript body line.
13. Object-picking cardinality and runtime wrapper semantics match JavaScript.
14. Browser and Electron work offline with the shipped pinned compiler.
15. Exported games contain JavaScript only and add no runtime compiler cost.
16. All audited search/render/MCP/runtime strings and consumers are
   language-aware.
17. Compiler upgrades are deterministic, reviewed migrations.
18. Documentation explains the older-editor downgrade boundary explicitly.

---

## 21. Rejected alternatives

### 21.1 New `TypeScriptCode` event type

Rejected because older projects cannot construct it and replace it with
`EmptyEvent`. It also duplicates registration, renderer mapping, bindings,
codegen, text/search/MCP switches, and tests while providing no runtime benefit.

### 21.2 Store TypeScript directly in `inlineCode`

Rejected because the C++ generator inserts `inlineCode` verbatim. Preview and
export would emit TypeScript syntax to JavaScript runtimes, and older GDevelop
would do the same.

### 21.3 Compile only during export

Rejected because preview, generated-code view, extension loading, project save,
MCP validation, and direct generator calls all need the same result. It also
leaves no executable fallback for older legacy JSON readers.

### 21.4 Compile in C++

Rejected because TypeScript is a JavaScript package, while current generators
are synchronous native/WebAssembly C++. Embedding a second compiler
implementation or JavaScript engine is disproportionate and risks divergent
output.

### 21.5 Use Monaco's compiler output

Rejected as the source of truth. Monaco may be absent, uses worker-owned state,
can have a different bundled TypeScript version, and is not available to save,
MCP, or headless generation. Monaco is an editor client of the shared contract.

### 21.6 Use Babel/Sucrase for erasure and TypeScript only for diagnostics

Rejected because two transforms create two syntax/version contracts and can
disagree on emitted semantics. The pinned TypeScript compiler owns both checking
and emission.

### 21.7 Persist generated JavaScript in `.events`

Rejected because it creates noisy dual source, merge conflicts, and ambiguous
ownership. Generated output belongs in the ignored compatibility snapshot and
legacy JSON event representation.

### 21.8 Add standalone TypeScript modules immediately

Rejected for version 1 because modules require path resolution, bundling,
dependency ownership, load order, source maps, export packaging, and a security
model beyond a leaf event body. This can be designed later without changing the
dual-source event contract.

---

## 22. Resolved and deferred decisions

### 22.1 Resolved

- Storage type remains `BuiltinCommonInstructions::JsCode`.
- Product name is language-neutral; JavaScript remains the insertion default.
- TypeScript source is separate from generated `inlineCode`.
- Generated JavaScript and deterministic receipt are persisted in legacy JSON.
- Multi-file source uses `@ts` and Events DSL 2.1.
- Compiler is pinned TypeScript, lazy-loaded but shipped in browser/Electron.
- Checking is strict for TypeScript regardless of runtime `useStrict`.
- Imports/modules/TSX/decorators/top-level await are out of scope.
- Current reviewed authoring declarations define the available API.
- Current runtime wrapper and object-picking behavior are preserved.
- Supported generation paths preflight; C++ adds integrity defense in depth.
- Runtime error UI becomes code-event wording while retaining
  `GDJSInlineCode` detection.
- Exact runtime TypeScript source maps are deferred, not silently claimed.

### 22.2 Deferred

- Standalone reusable TypeScript modules.
- Extension-provided reviewed `.d.ts` fragments beyond the current project API.
- AST-aware automatic rename inside TypeScript source.
- Whole-generated-file source-map composition back to `.events` lines.
- Async code-event wrappers and top-level `await`.
- A dedicated second event-picker item that creates TypeScript directly.
- Lossless TypeScript-source preservation after saving in an older legacy JSON
  editor. The version-1 guarantee is executable fallback, not round-trip source.
- Moving the editor codebase itself from Flow to TypeScript.

These deferred items must not weaken the version-1 invariants or introduce a
second compilation path.
