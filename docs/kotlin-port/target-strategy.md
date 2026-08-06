# Target strategy: hypotheses, deliverables, and exit criteria

> **Status: proposed.** This is an evidence-gathering plan, not a promise that
> every GDevelop feature is portable. Each phase has a falsifiable hypothesis,
> a bounded artifact, an explicit compatibility measure, and a stop/go gate.
> Later phases may begin as spikes, but may not become the architectural source
> of truth before the earlier gate is met.

This strategy implements the language-neutral boundaries and normalized IR in
[`portable-architecture.md`](portable-architecture.md). It uses the compatibility
rules in [`extensions-and-types.md`](extensions-and-types.md) and the observed
pipeline in [`gdevelop-pipeline.md`](gdevelop-pipeline.md). The common model—not
JVM reflection, Android APIs, GDJS globals, or a renderer—remains authoritative.

## How phase gates work

Every phase records:

* a **hypothesis** that the prototype is intended to prove or disprove;
* **deliverables** that can be reviewed and reproduced;
* a **representative fixture** from the frozen Phase 0 corpus;
* a declared set of **unsupported features**, so a narrow success is not
  reported as general compatibility;
* a quantitative **compatibility metric** computed from checked-in expectations;
* a **go criterion** for investing in the next phase; and
* a **stop criterion** that triggers design revision, a narrower scope, or an
  explicit compatibility-host decision.

“Stop” does not mean abandoning the port. It means no downstream target work may
paper over a failure in the shared semantics. A stopped phase produces a short
decision record describing the evidence and the chosen revision.

## Metrics shared by all phases

The corpus runner emits a machine-readable result per fixture with:

1. decoder diagnostics and normalized source-location paths;
2. resolved extension/member identities and parameter bindings;
3. a canonical NIR digest;
4. an ordered semantic trace (frame, event, condition result, selection IDs,
   action, variable writes, creation/deletion, scene transition, lifecycle);
5. final global/scene/object/behavior state; and
6. reachable extensions, resources, capabilities, and artifacts.

The following named metrics avoid a vague percentage called “compatible”:

| Metric | Definition |
|---|---|
| **Decode coverage** | Supported corpus documents decoded without fatal diagnostics / documents declared supported by the phase. Unknown fields must be retained; ignoring them does not count as support. |
| **Resolution accuracy** | Correct expected symbol, extension identity, parameter, value-type, and dependency resolutions / asserted resolutions. |
| **Trace parity** | Longest exact prefix of portable ordered trace versus the checked-in reference trace, plus exact-trace fixtures / executed fixtures. IDs are normalized, but order and semantic values are not. |
| **State parity** | Matching asserted final variables, selections, objects, behaviors, and active scene / total state assertions. |
| **Diagnostic fidelity** | Expected diagnostic codes with matching severity and source location / expected diagnostics; unexpected errors are reported separately. |
| **Reachability precision** | Required items retained and known-unused items removed. Both false-negative and false-positive counts are reported; a false-negative is always a gate failure. |
| **Determinism** | Identical canonical NIR, trace, and final state hashes across repeated executions with the same seeded host inputs. |
| **Host conformance** | Passed behavior tests for a host capability adapter / applicable host capability tests. |

Reference traces are produced once with a pinned GDevelop/GDJS revision and
reviewed before being frozen. When observable behavior is uncertain, Phase 0
records multiple probes and marks the fixture unresolved rather than choosing the
portable implementation's behavior as its own expected result.

## Phase 0 — static compatibility corpus

### Hypothesis

A small, immutable corpus can isolate the semantic contracts that all target
experiments need, without depending on large example games or mutable editor
state. The same fixtures can expose decoder, analyzer, interpreter, generated
backend, and host divergence.

### Fixture selection

Create `docs/kotlin-port/corpus/manifest.json` and frozen, hand-minimized project
documents under `docs/kotlin-port/corpus/projects/`. Each fixture gets a stable
ID, source revision, SHA-256, declared feature tags, required extension IDs,
seeded host inputs, frame budget, expected diagnostics, expected trace, and final
state assertions. Resource bytes are content-addressed and stored only when the
semantic test reads them.

The first corpus is deliberately compositional. A fixture may cover multiple
requirements, but no fixture should contain unrelated editor data.

| Fixture ID | Required semantic slice | Seed/minimization source in this repository | Required observations |
|---|---|---|---|
| `variables-and-branches` | Global and scene variables; numeric/string/Boolean expressions; conditions and actions; nested event | Minimize from `GDJS/tests/games/structure-variables-foreach/structure-variables-foreach.json` | Parameter order, value types, scope lookup, left-to-right conditions, writes, child-event order, final values. |
| `object-picking-and-deletion` | Two object instances; condition-driven picking; group selection; action on picked instance; deletion during iteration | Minimize from `GDJS/tests/games/count-instances/Instances Count test.json` and the deletion cases in existing GDJS tests | Selection before/after each condition, stable instance IDs/order, action receiver set, exactly-once deletion, survivor iteration. |
| `scene-change-lifecycle` | Two scenes; scene variables; change/replace scene action; load/pre/post/unload ordering | Hand-minimize from the normal scene transition model traced by the GDJS runtime | Requested versus committed transition, lifecycle sequence, old/new variable lifetime, first frame in the new scene. |
| `builtin-text-object` | One built-in object and one object expression/action | Minimize from `GDJS/tests/games/Text.json` | `TextObject::Text` identity and configuration shape, creation, picking, text mutation/expression, final instance state. |
| `builtin-behavior` | Object with a built-in behavior; object/behavior parameter ownership; pre/post-event step | Minimize from `GDJS/tests/games/platformer sandbox/platformer sandbox.json` to a non-physics deterministic slice, or select a smaller built-in behavior if minimization cannot remove timing dependence | Qualified behavior identity, owner binding, enabled state, lifecycle order, deterministic property/state update. |
| `events-extension` | Project-embedded events function and events-based behavior | Minimize from `GDJS/tests/games/events-based-behaviors/Basic EventsBasedBehavior test.json` | `eventsFunctionsExtensions` decoding, synthesized descriptors, object+behavior parameter order, function lowering, property/shared-data state. |
| `javascript-declared-extension` | Condition, expression, object action, behavior, effect/property metadata, and include dependency from a `JsExtension.js` | Pair a minimal project JSON with a frozen descriptor snapshot derived from `Extensions/ExampleJsExtension/JsExtension.js`; runtime subset uses its deterministic tools/object method and behavior | Stable `MyDummyExtension::*` IDs, parameter bindings, descriptor digest, include order, runtime-entry resolution, explicit unsupported effect rendering in headless mode. |

The corpus must contain raw GDevelop JSON, not serialized `gd::Project` objects,
and must not execute `JsExtension.js` to define its expected result. The frozen
descriptor snapshot is an input compatibility oracle; a legacy-catalog adapter
may later be compared against it. Large upstream fixtures remain useful as
non-gating stress tests but are not copied wholesale into this minimal corpus.

### Deliverables

* Corpus manifest, minimized JSON, resource hashes, and provenance notes.
* JSON Schema (or equivalent format specification) for the manifest and trace.
* A pinned reference-trace capture command and checked-in canonical traces.
* A fixture validator that checks hashes, IDs, referenced files, duplicate tags,
  deterministic ordering, and that every required Phase 0 feature is represented.
* A coverage map from compatibility invariants to fixtures and assertions.

### Expected artifact

A reviewable, read-only corpus directory and validator report. Running the pinned
capture command in a clean checkout produces no corpus modifications and yields
the same trace hashes recorded by the manifest. Phase 0 contains data, schemas,
expectations, and capture tooling only; it is not a portable runtime prototype.

### Representative fixture

`object-picking-and-deletion` is the gate fixture because it distinguishes a
GDevelop-compatible event model from a simple list of Boolean calls. The smoke
fixture is `variables-and-branches`.

### Unsupported features

External JavaScript code events, asynchronous actions, networking, physics,
audio playback, rendering pixels, 3D, editor hot reload, multiplayer, extension
package installation, legacy formats not represented in the corpus, and full
project round-trip encoding. They may be added only with isolated fixtures and
reviewed expectations.

### Compatibility metric

Phase 0 measures **corpus completeness**, not runtime parity: 100% of the seven
fixture IDs validate; every listed semantic slice maps to at least one trace or
state assertion; all source files and descriptor snapshots match their hashes;
and two captures at the pinned revision produce identical canonical traces.

### Stop/go criterion

* **Go:** all seven fixtures are minimized, provenance-reviewed, hash-stable, and
  produce deterministic reference traces with no unresolved required semantic
  assertion.
* **Stop:** a required observation cannot be isolated or is nondeterministic in
  pinned GDevelop/GDJS. Record the ambiguity, revise the fixture/host inputs, and
  do not let a portable prototype invent the answer. Nonessential flaky features
  move out of the gate corpus.

## Phase 1 — common modules and Kotlin/JVM headless prototype

### Hypothesis

The language-neutral source model and NIR can be represented in Kotlin
Multiplatform common code, while a JVM headless executable can decode and execute
a small deterministic GDevelop subset without `gd::Project`, browser globals,
Android framework classes, or a renderer.

### Module and API deliverables

Common modules contain only portable dependencies and APIs:

| Common module | Responsibility |
|---|---|
| `project-source-model` | Versioned immutable source documents, declarations, unknown-field retention, stable IDs, and JSON/scenario source locations. |
| `normalized-ir` | Target-neutral expressions, instructions, selection operations, event control flow, lifecycle phases, runtime operations, and origin maps. |
| `diagnostics` | Stable diagnostic codes, severities, related locations, and suggested edits. |
| `semantic-analysis-api` | Analyzer, symbol resolver, type checker, dependency validator, lowering, and reachability interfaces plus immutable results. |
| `extension-model` | `ExtensionCatalog` descriptors for instructions, expressions, value types, objects, behaviors, effects, dependencies, serialization, lowering, and capabilities. |
| `runtime-state` | Target-neutral scenes, variables, stable object/behavior handles, selections, event/trigger state, deterministic queues, lifecycle scheduler, and host service interfaces. |

The JVM prototype supplies a bounded GDevelop JSON decoder, an in-memory
`ProjectSource`, a deterministic headless `RuntimeHost`, and one execution path.
The preferred first implementation is an interpreter because it exposes traces
directly; generating Kotlin source is acceptable if it consumes the same NIR and
emits equivalent traces. Supporting both is not a Phase 1 requirement.

The implemented semantic slice is: constants and primitive expressions; global,
scene, and object variables; standard events and nesting; ordered conditions and
actions; once/trigger state; object creation, picking, groups, and deletion;
basic scene changes; the corpus's built-in Text object adapter; one deterministic
behavior adapter; free events functions; and the non-rendering subset of
`MyDummyExtension`.

### Representative fixture

`variables-and-branches` is the first vertical slice;
`object-picking-and-deletion` is the semantic gate; all Phase 0 fixtures must at
least decode and produce declared unsupported-feature diagnostics.

### Expected artifact

A reproducible JVM command-line application accepts a corpus fixture ID, decodes
and analyzes it, emits canonical NIR/diagnostics, executes a fixed number of
frames with seeded time/input, and writes the standard trace/final-state report.
A common-module API compatibility report confirms that no JVM/Android/JS type is
exposed in public common declarations.

### Unsupported features

Rendering and effects, real audio/input/storage, arbitrary JavaScript and source
files, asynchronous actions, full built-in extension coverage, networking,
physics, 3D, editor APIs, hot reload, export packaging, and unsupported legacy
JSON. Unsupported constructs yield a structured diagnostic with a source
location; silently skipping them is a failure.

### Compatibility metric

* 100% decode coverage for the explicitly supported subset and 100% diagnostic
  fidelity for declared-unsupported nodes.
* 100% resolution accuracy and state parity on implemented assertions.
* Exact trace parity on `variables-and-branches`,
  `object-picking-and-deletion`, and `scene-change-lifecycle`.
* 100 repeated runs with identical NIR, trace, and final-state hashes.
* Zero forbidden platform types in common public APIs.

### Stop/go criterion

* **Go:** the CLI meets every metric above; additionally, the built-in object,
  built-in behavior, events extension, and JS-declared extension fixtures either
  execute their declared headless subset with exact parity or fail at the exact
  catalog/capability boundary with the expected diagnostic.
* **Stop:** selection, trigger, nesting, deletion, or lifecycle parity requires a
  JVM-only workaround or a target class in common NIR/runtime state. Revise the
  common model and ADRs before starting the SDK or Android implementation.

## Phase 2 — KSP-based extension SDK

### Hypothesis

Kotlin-authored extensions can declare portable metadata and typed adapters with
compile-time validation, while generated descriptors remain semantically
equivalent to the portable `ExtensionCatalog` and require no runtime classpath
scan, reflection convention, or string-to-method discovery.

### Annotation surface

The SDK defines versioned annotations (names are provisional but semantics are
not):

| Annotation | Required information / generated contract |
|---|---|
| `@GDevelopExtension` | Namespace, semantic version, origin, display metadata, compatibility aliases, and dependency declarations. |
| `@Action` | Stable member ID, ordered parameter descriptors, object/behavior receiver constraints, lowering adapter, and capability requirements. |
| `@Condition` | Action fields plus inversion/picking contract and whether evaluation filters selections or uses trigger state. |
| `@Expression` | Stable member ID, ordered parameters, result `ValueTypeRef`, purity/effects declaration, and lowering adapter. |
| `@ObjectType` | Qualified type, serialization schema/version, factory/runtime adapter, lifecycle support, and capabilities. |
| `@BehaviorType` | Qualified type, allowed owner type, property/shared-data serialization, runtime adapter, and lifecycle support. |
| `@LifecycleHook` | Exact portable lifecycle phase, ordering key, permitted context, and runtime entry point. |
| `@RequiresHostCapability` | Capability ID and version range; repeatable at extension, type, and operation scope. |

KSP validates duplicate IDs, illegal namespaces, unstable/unsupported value
types, parameter order and defaults, behavior ownership, lifecycle signatures,
dependency cycles that can be proven locally, serialization versions, and
capability declarations. A method annotation alone is insufficient: every
operation declares or selects a lowering adapter, because actions/conditions may
expand into NIR, mutate selections, use a host service, or target a runtime entry
point rather than map directly to the annotated method.

### Deliverables

* Annotation-only API usable from common source where KSP supports it, plus
  target-specific runtime adapter APIs kept separate.
* KSP processor and compile-testing fixtures for valid and invalid extensions.
* Generated immutable descriptor tables, lowering adapter bindings,
  serialization adapters, runtime factory registries, capability manifests, and
  service registration resources where a target toolchain requires them.
* A deterministic generated registry entry point imported explicitly by the
  application. No runtime classpath scanning, package enumeration, or reflective
  annotation lookup is allowed.
* Canonical descriptor serialization and a comparator against an
  `ExtensionCatalog` snapshot.

### Representative fixture

Re-author the headless subset of `javascript-declared-extension` as a Kotlin SDK
fixture while retaining exactly the frozen `MyDummyExtension` member IDs,
parameter order, value types, defaults, serialization fields, dependencies, and
capabilities. `object-picking-and-deletion` supplies a synthetic condition to
exercise a lowering that filters selections rather than calling a method.

### Expected artifact

A sample extension JAR/KMP library and its generated registry can be linked into
the Phase 1 CLI through an explicit generated symbol. A descriptor-diff report
shows semantic equality with the frozen catalog snapshot, and the same NIR trace
is produced without runtime scanning.

### Unsupported features

Loading arbitrary extension JARs after application compilation, runtime
classpath scanning, automatic translation of JavaScript extension bodies,
arbitrary reflection, cross-module dependency resolution not represented in the
catalog/lock, editor UI plugins, and platform capabilities without an adapter.

### Compatibility metric

* 100% field equality between generated and expected portable descriptors,
  including source order, parameter bindings, aliases, and capabilities.
* 100% compile-time rejection for the invalid SDK fixture suite, with expected
  diagnostic code and declaration location.
* Exact NIR/trace/state parity between catalog-snapshot and generated-registry
  variants of the representative fixtures.
* Identical generated files across two clean builds and zero discovered runtime
  registry entries (all entries are explicitly generated/linked).

### Stop/go criterion

* **Go:** a clean consumer build links only generated registries, descriptor
  equivalence is exact, selection-transforming conditions work without pretending
  to be direct method calls, and the Phase 1 corpus metrics do not regress.
* **Stop:** KSP cannot generate deterministic common/target registries without
  leaking compiler/runtime symbols into portable descriptors, or preserving a
  GDevelop signature requires runtime reflection/scanning. Revise the SDK split
  or restrict supported extension forms before Android integration.

## Phase 3 — Android host integration

### Hypothesis

Android can reuse the common analyzer, NIR, extension descriptors, and runtime
semantics unchanged. Android lifecycle, input, storage, audio, and rendering can
be adapters behind `RuntimeHost`, with semantic execution proven headlessly
before selecting a graphics engine.

### Deliverables

1. An Android library/application consuming the same common artifacts and
   generated registries as the JVM prototype.
2. A headless/instrumented host implementing lifecycle scheduling, monotonic
   time, deterministic test input, memory storage, resource lookup, logging, and
   no-op audio/rendering with explicit capability reports.
3. Production adapters for Android activity/process lifecycle, touch/key/gamepad
   input, scoped/persistent storage, asset/resource access, and audio focus/
   playback, each with disposal and thread-affinity rules.
4. A renderer evaluation report only after the headless gate. It compares at
   least lifecycle/threading, 2D primitives/textures/text, shader/effect mapping,
   batching, asset formats, testability, and Kotlin Multiplatform prospects. No
   renderer is selected merely because it resembles PixiJS.
5. Android artifact assembly for manifest entries, permissions derived from host
   capabilities, packaged resources, and reproducible debug builds.

### Representative fixture

Run `scene-change-lifecycle` through Android lifecycle transitions and
`object-picking-and-deletion` through the instrumented headless host. After a
renderer decision, `builtin-text-object` becomes the first visual fixture with a
separate semantic trace and pixel/golden-image assertion.

### Expected artifact

First, an instrumented headless Android application produces byte-for-byte the
same canonical semantic reports as the JVM CLI. Only after that gate, a minimal
APK renders the Text fixture, maps pause/resume correctly, accepts deterministic
injected input, and restores only state covered by an explicit storage contract.

### Unsupported features

Before renderer selection: all pixels, shaders/effects, 3D, and visual editor
parity. Initially also arbitrary JavaScript, browser DOM APIs, dynamic extension
installation, background execution beyond declared Android policy, advanced
audio effects, networking/multiplayer, physics, and platform services without
capability adapters.

### Compatibility metric

* Exact trace/state/diagnostic parity with JVM for all headless supported
  fixtures across emulator API levels selected in the test matrix.
* 100 consecutive pause/resume/recreate test cycles without duplicate lifecycle
  hooks, leaked runtime instances, or nondeterministic hashes.
* 100% host conformance for implemented lifecycle, input, storage, audio, time,
  and resource interfaces; unsupported capabilities are rejected before launch.
* After rendering exists, semantic parity remains exact and visual metrics are
  reported separately (pixel threshold and device density/font variance), never
  substituted for semantic parity.

### Stop/go criterion

* **Go to renderer selection:** headless Android and JVM reports match exactly,
  lifecycle stress passes, and common/runtime modules require no Android branch.
* **Go to broader Android support:** the chosen renderer passes the Text fixture,
  lifecycle/resource tests, and has a documented route for required effects.
* **Stop:** Android lifecycle/threading forces target-specific ordering in common
  semantics, or a host adapter cannot isolate framework handles. Repair the host
  boundary before renderer or feature expansion.

## Phase 4 — Kotlin/JS bridge experiments

Phase 4 contains two intentionally separate modes. Results and metrics must not
be combined: interoperability with GDJS is not proof of an independently
replicated runtime.

### Mode A: Kotlin-authored extensions on existing GDJS

#### Hypothesis

Kotlin/JS plus generated SDK adapters can author typed extensions while existing
GDevelop metadata, event generation, and `GDJS/Runtime` retain responsibility for
game semantics and services.

#### Deliverables and expected artifact

* A KSP/generated Kotlin/JS registry translated into the legacy
  `gd.PlatformExtension` descriptor surface and GDJS registration calls.
* Explicit adapters for dynamic `gd`, `gdjs`, object/behavior data, lifecycle
  callbacks, and Promise/JS value boundaries; no pretend common typing of mutable
  JavaScript globals.
* A browser bundle containing a Kotlin-authored equivalent of the headless
  `MyDummyExtension` subset, loaded by an existing GDJS preview/export.
* A reuse ledger classifying every touched component as unchanged GDJS, thin
  adapter, generated glue, replaced implementation, or unsupported. Report both
  files/modules and bundled bytes, with source-map-aware attribution.

#### Representative fixture

`javascript-declared-extension`, executed by the existing GDJS event/runtime
pipeline with the Kotlin-authored extension substituted behind identical stable
descriptors and runtime registrations.

#### Unsupported features

Independent portable runtime semantics, removal of GDevelop C++/Emscripten
metadata, non-JS targets, arbitrary JavaScript safety, extensions whose Kotlin/JS
toolchain cannot bind required JS libraries, and performance claims about Mode B.

#### Compatibility metric

Exact descriptor equality and GDJS reference trace/state parity for the supported
extension subset; zero changed GDevelop project instruction/type IDs; reuse
ledger percentages for unchanged/adapted/replaced GDJS modules and bytes; bundle
size/startup overhead reported against the original JS extension.

#### Stop/go criterion

* **Go:** the unmodified project runs against existing GDJS with exact trace and
  descriptor parity, generated adapters require no runtime scan, and overhead is
  measured and acceptable to the experiment's recorded budget.
* **Stop:** stable metadata or lifecycle semantics require hand-written per-build
  JavaScript patches, or Kotlin/JS dynamic interop erases the SDK guarantees.
  Retain Mode A only as a documented limited interop tier.

### Mode B: portable IR/runtime compiled to JavaScript

#### Hypothesis

The common source model, analyzer, NIR, and target-neutral runtime state can
compile to JavaScript and reproduce the Phase 1 semantics without delegating
event execution to GDJS. Selected GDJS services may still be adapted, but every
reuse must be explicit.

#### Deliverables and expected artifact

* Kotlin/JS decoder/analyzer plus interpreter or generated backend consuming the
  same corpus and generated extension descriptors as JVM.
* A browser `RuntimeHost` with deterministic headless adapters first; optional
  GDJS resource/input/audio/rendering adapters are separate packages.
* A standalone browser bundle that executes the headless corpus without
  `GDJS/Runtime` event evaluation and emits the standard report.
* A dependency/reuse ledger distinguishing behavioral delegation from service
  reuse. Calling `RuntimeScene` to execute events counts as delegation, not
  independent replication; wrapping a texture loader may count as service reuse.

#### Representative fixture

`object-picking-and-deletion` proves independent event semantics;
`events-extension` proves common lowering; `builtin-text-object` is attempted
only after the headless gate when evaluating rendering reuse.

#### Unsupported features

Initially rendering/audio/input beyond deterministic stubs, arbitrary JavaScript
events and external source files, the full built-in catalog, editor integration,
hot reload, 3D, physics, networking, and any GDJS module not classified in the
reuse ledger.

#### Compatibility metric

Exact cross-target NIR, trace, state, diagnostic, and reachability hashes for the
headless supported corpus on JVM and JS; 100 repeated browser runs deterministic;
reuse ledger reports unchanged/adapted/reimplemented/delegated module and byte
shares. Independent semantic coverage excludes all delegated operations.

#### Stop/go criterion

* **Go:** Mode B independently executes picking, triggers, deletion, scene
  lifecycle, and events-extension lowering with exact JVM/reference parity and
  no GDJS event/runtime delegation; service reuse is isolated behind host APIs.
* **Stop:** JavaScript-specific representation forces changes to common NIR or
  semantics, or reported compatibility depends on silently delegating failed NIR
  operations to GDJS. Revise the backend/host split and keep interoperability
  results labeled Mode A.

### Phase 4 combined decision output

Publish a side-by-side report, never a blended score:

| Question | Mode A: interoperate with GDJS | Mode B: independent portable runtime |
|---|---|---|
| Who evaluates events? | Existing GDJS | Portable IR/runtime |
| Primary parity comparison | Kotlin extension vs original JS extension under GDJS | JVM/common runtime vs JS/common runtime and pinned reference |
| Legitimate reuse | Most GDJS runtime and exporter | Host/service adapters with declared capabilities |
| Reuse that invalidates the claim | None for interop, but must be reported | Delegating event selection/control flow/lifecycle semantics to GDJS |
| Decision enabled | Viability of Kotlin-authored GDJS extensions | Viability and cost of an independent Kotlin/JS runtime |

Phase 4 exits only after both reports state tested browser/toolchain versions,
fixture coverage, unsupported features, semantic delegation, reuse by module and
bytes, bundle/startup measurements, and failures.

## Deferred target — Kotlin/Native

### Deferral hypothesis

JVM and both Kotlin/JS experiments will expose which APIs are truly common and
which merely reflect a garbage-collected JVM or dynamic JavaScript environment.
Starting Native earlier would multiply uncertainty across memory/threading,
graphics, library, and interop choices without improving the semantic reference.

No Native backend implementation begins until Phase 1 passes and Phase 4 has
published both mode reports. Design-only compilation probes are allowed when
they test whether a proposed common API is actually portable.

### Blocker register and required evidence

| Blocker | Question that must be answered before go | Evidence to record |
|---|---|---|
| Reflection/code generation | Can all extension/runtime registration be generated and linked without JVM reflection, classpath scanning, or dynamic class loading? | KSP output model, Native-compatible registry prototype, linker/dead-code behavior. |
| Threading/concurrency | Can deterministic event ordering and host async queues be implemented within supported Kotlin/Native memory and worker/coroutine rules? | Thread-affinity model, synchronization costs, lifecycle cancellation probe. |
| Rendering | Which maintained library/backend supplies required 2D primitives, text, textures, shaders/effects, and later 3D on each intended Native platform? | Capability matrix, minimal Text fixture, shader/resource lifecycle spike. |
| JavaScript interop | On Wasm/JS-like Native targets, what legacy JS/GDJS interop is possible; on non-JS targets, which legacy features are categorically unavailable? | Target-specific interop prototypes and explicit unsupported catalog. |
| Dynamic values | Can source-model unknown fields, extension value types, variables, and serialization preserve compatibility without pervasive unsafe casts? | Immutable value-tree benchmark, round-trip/property tests, memory profile. |
| Library availability | Are JSON, immutable collections, coroutines, audio, input, storage, cryptography/hashing, archive, and networking libraries maintained for intended targets? | Versioned dependency/capability matrix with license, size, and platform gaps. |

### Expected future artifact

Before a runtime spike: a Native feasibility report, common-API compile probe,
dependency matrix, and updated ADRs. The first executable artifact would be a
headless command-line corpus runner for one Native target—not a rendered game.

### Representative fixture

`variables-and-branches` for the first compile/run, followed by
`object-picking-and-deletion`. Rendering is not evaluated until both have exact
semantic parity.

### Unsupported features during the initial spike

Rendering, audio, input, arbitrary JavaScript, GDJS interoperability on non-JS
targets, dynamic extension loading, networking, physics, 3D, editor integration,
and packaging for multiple operating systems.

### Compatibility metric

The future headless gate requires exact canonical NIR/trace/state/diagnostic
parity with JVM and 100 deterministic runs. Before implementation, feasibility
is measured as zero unresolved **blocking** rows in the register; limitations may
remain only when represented as explicit target capability diagnostics.

### Stop/go criterion

* **Go:** Phase 1 and both Phase 4 reports establish stable common APIs; generated
  registration has no reflection/scanning dependency; one intended Native target
  has viable libraries for the headless host; and every blocker has evidence and
  an owner/decision.
* **Stop/defer:** a blocker would require changing shared semantic APIs without
  JVM/JS evidence, or essential target libraries/rendering have no maintained
  option. Continue common conformance work and revisit after ecosystem or scope
  changes.

## Deliverable sequence and scope control

| Order | Required artifact | Opens work on |
|---|---|---|
| 0A | Frozen manifest, minimized projects, descriptor snapshots | Reference trace review |
| 0B | Deterministic reference traces and coverage map | Common model implementation |
| 1A | Common source/NIR/diagnostic/catalog APIs | JVM decoder/analyzer |
| 1B | JVM headless corpus report meeting gate | KSP SDK and target spikes |
| 2 | Generated registry + descriptor/trace parity report | Android production adapters and Kotlin/JS extension interop |
| 3A | Android headless JVM-parity report | Renderer evaluation |
| 3B | Renderer decision and visual Text artifact | Broader Android features |
| 4A | GDJS interop report | Decision on Kotlin-authored legacy extension tier |
| 4B | Independent JS runtime report | Decision on Kotlin/JS replication scope |
| N0 | Native blocker report after Phase 4 | Native headless prototype |

Any request to add a target feature before its gate must identify which metric it
improves and must not add platform types to common APIs. Unsupported features are
tracked as capability/catalog gaps with source-located diagnostics, rather than
TODO branches that silently change behavior.
