# Kotlin port diagrams and concept guide

This is the visual entry point to the existing GDevelop pipeline, the portable
Kotlin skeleton, and the evidence model connecting them. Diagrams show both
implemented and intended boundaries; they do not turn a proposal into
compatibility evidence. Check the [evidence index](evidence-index.md) for current
claims and the [target strategy](target-strategy.md) for authoritative gates.

PlantUML blocks are renderable source diagrams. Names are shortened in diagrams;
tables and surrounding text link to detailed documentation.

## Reading map

| Question | Diagram | Detail |
|---|---|---|
| How does GDevelop work today? | [Existing pipeline](#existing-gdevelop-pipeline) | [Pipeline trace](gdevelop-pipeline.md) |
| How is the Kotlin skeleton divided? | [Systems and modules](#systems-at-a-glance) | [Portable architecture](portable-architecture.md) |
| Who owns project JSON, source model, and NIR? | [Representation ownership](#representation-ownership-and-lowering) | [ADR-0001](decisions/0001-ir-ownership.md) |
| How do extension IDs and parameters reach runtime? | [Extension resolution](#extension-resolution-and-dispatch) | [Extensions and types](extensions-and-types.md), [ADR-0002](decisions/0002-extension-identity.md) |
| Which runtime behavior must match? | [Runtime lifecycle](#runtime-semantics-and-lifecycle) | [Compatibility roadmap](compatibility-roadmap.md) |
| Where do platform services live? | [Host capabilities](#host-capabilities-and-targets) | [ADR-0003](decisions/0003-runtime-host-boundary.md) |
| How is compatibility earned? | [Evidence loop](#corpus-evidence-and-phase-gates) | [Phase 0 corpus](corpus/README.md) |
| Where does MapTiles fit? | [MapTiles isolation](#maptiles-isolation) | [Prototype](maptiles-prototype.md), [API audit](maptiles-api-audit.md) |

## Systems at a glance

GDevelop and the Kotlin skeleton are not file-for-file translations. The goal is
to reproduce a bounded set of observable semantics through explicit portable
contracts.

```plantuml
@startuml
title Existing GDevelop and portable Kotlin paths
left to right direction
skinparam componentStyle rectangle
package "Existing GDevelop" #EAF2F8 {
  [Raw project JSON] as gdjson
  [gd::Project editor model] as gdproject
  [Extension metadata] as gdmeta
  [C++ event code generator] as codegen
  [Generated JavaScript] as genjs
  [GDJS runtime] as gdjs
  [Browser / renderer / platform] as browser
  gdjson --> gdproject : deserialize
  gdmeta --> gdproject : registered descriptors
  gdproject --> codegen
  gdmeta --> codegen : IDs + parameter order
  codegen --> genjs
  genjs --> gdjs
  gdjs --> browser
}
package "Portable Kotlin skeleton" #FDF2E9 {
  [GDevelop JSON or scenario] as input
  [Lossless source model] as source
  [Diagnostics + analysis] as analysis
  [ExtensionCatalog snapshot] as catalog
  [Normalized IR] as nir
  [Interpreter / generated backend] as backend
  [Portable runtime state] as state
  [Capability host adapters] as hosts
  input --> source : decode
  source --> analysis
  catalog --> analysis : resolve
  analysis --> nir : lower if valid
  nir --> backend
  backend --> state
  backend --> hosts : declared capabilities
}
[Frozen Phase 0 corpus] as corpus #F4D03F
[Canonical reference traces] as oracle #F4D03F
[Differential reports] as reports #F4D03F
corpus --> gdjson
corpus --> input
gdjs --> oracle : pinned capture
oracle --> reports
state --> reports
@enduml
```

The current stages are traced in [the pipeline investigation](gdevelop-pipeline.md).
The portable boundaries are specified in [the architecture](portable-architecture.md).
The corpus—not either implementation's unit tests—is the shared oracle; see the
[Phase 0 corpus guide](corpus/README.md).

## Existing GDevelop pipeline

Persisted IDs, registered metadata, generated calls, and runtime registrations
join the existing system. Extension metadata and runtime implementation can take
separate routes.

```plantuml
@startuml
title Existing project-to-preview/export flow
skinparam sequenceMessageAlign center
actor User
participant "Storage provider" as Storage
participant "JS / Embind bridge" as Bridge
participant "gd::Project" as Project
participant "Extension metadata registry" as Metadata
participant "EventsCodeGenerator" as Generator
participant "Exporter / preview launcher" as Exporter
participant "GDJS RuntimeGame / RuntimeScene" as Runtime
participant "Registered extension runtime" as Extension
User -> Storage : open project
Storage -> Bridge : raw JSON
Bridge -> Project : deserialize project/layouts
Metadata -> Project : object, behavior, operation descriptors
User -> Exporter : preview or export
Exporter -> Generator : generate layouts/events
Generator -> Metadata : qualified IDs + parameters
Generator --> Exporter : scene JavaScript + dependencies
Exporter -> Runtime : data + runtime files + generated code
Runtime -> Runtime : load scene / pre-events
Runtime -> Extension : lifecycle and operation calls
Runtime -> Runtime : events / post-events / transition
@enduml
```

| Existing concept | Compatibility consequence | Read more |
|---|---|---|
| Raw project JSON | Persistence input is not normalized semantics. | [Pipeline](gdevelop-pipeline.md), [ADR-0001](decisions/0001-ir-ownership.md) |
| `gd::Project` | Mutable editor state must not become cross-target IR. | [Portable architecture](portable-architecture.md) |
| Qualified type/member strings | Identities and aliases require explicit resolution. | [ADR-0002](decisions/0002-extension-identity.md) |
| Ordered parameters | Position, value type, receiver, and behavior ownership are compatibility data. | [Extension matrix](extensions-and-types.md) |
| Generated JavaScript | It is one backend artifact, not portable truth. | [ADR-0004](decisions/0004-generated-code-vs-interpreter.md) |
| GDJS lifecycle | Order must be demonstrated through traces, not similar APIs. | [Phase 1 gate](target-strategy.md) |

## Kotlin skeleton module overview

Arrows mean intended dependency direction, not that every planned interface is
complete.

```plantuml
@startuml
title Kotlin skeleton modules and allowed direction
top to bottom direction
skinparam componentStyle rectangle
package "Portable common contracts" {
  [diagnostics] as diagnostics
  [project-model] as project
  [extension-catalog] as catalog
  [normalized-ir] as ir
  [runtime-state] as runtime
}
package "Extensions / experiments" {
  [example-extension] as example
  [map-runtime] as mapruntime
  [maptiles-extension] as mapext
}
package "Target entry points / adapters" {
  [jvm-cli] as cli
  [maplibre-js-host] as mapjs
  [maptiles-demo] as demo
}
project --> diagnostics
catalog --> diagnostics
ir --> project
ir --> catalog
runtime --> ir
runtime --> catalog
example --> catalog
mapext --> mapruntime
mapext --> catalog
cli --> project
cli --> ir
cli --> runtime
cli --> example
mapjs --> mapruntime
mapjs --> mapext
demo --> mapjs
note right of mapruntime
  Isolated spike module.
  Not promoted into runtime core.
end note
@enduml
```

| Module/layer | Owns | Must not own | Detail |
|---|---|---|---|
| `project-model` | Decoded declarations, unknown fields, source locations. | Runtime state or renderer handles. | [Source-model boundary](portable-architecture.md) |
| `diagnostics` | Stable codes, severity, normalized paths, related locations. | Target exceptions as compatibility output. | [Diagnostic metric](target-strategy.md) |
| `extension-catalog` | Identities, descriptors, parameters, dependencies, capabilities. | Reflection discovery or renderer instances. | [Extension model](extensions-and-types.md) |
| `normalized-ir` | Resolved control flow, operations, origins, selection/lifecycle semantics. | Raw editor JSON or platform handles. | [ADR-0001](decisions/0001-ir-ownership.md) |
| `runtime-state` | Variables, objects, selections, triggers, queues, lifecycle, traces. | DOM, MapLibre, Android, or target APIs. | [Runtime design](portable-architecture.md) |
| `jvm-cli` | Headless fixture entry point and report emission. | JVM-only semantic rules. | [Prototype README](../../KotlinPlatform/README.md) |
| Host modules | Capability implementations and platform resources. | Portable semantic authority. | [ADR-0003](decisions/0003-runtime-host-boundary.md) |

## Representation ownership and lowering

```plantuml
@startuml
title Decode, resolve, lower, and execute
left to right direction
artifact "Raw input\nJSON / scenario" as raw
component Decoder as decoder
artifact "Lossless source model\nunknowns + locations" as source
component "Semantic analyzer" as analyzer
database "ExtensionCatalog\nsnapshot + digest" as catalog
artifact "Resolved normalized IR\norigin map" as nir
component Interpreter as interpreter
component "Generated backend" as generated
artifact "Trace + final state\ndiagnostics + reachability" as output
raw --> decoder
decoder --> source
decoder --> output : decode diagnostics
source --> analyzer
catalog --> analyzer
analyzer --> output : resolution diagnostics
analyzer --> nir : valid program
nir --> interpreter
nir --> generated
interpreter --> output
generated --> output
@enduml
```

Each representation has one purpose. The source model remains lossless; only
semantic lowering creates NIR; both interpreter and generated backends consume
that same NIR. This ownership is mandated by [ADR-0001](decisions/0001-ir-ownership.md).

### Canonical NIR

Canonical NIR is a deterministic serialization of resolved target-neutral IR—not
raw JSON, a Kotlin `toString()`, generated JavaScript, or runtime state. Its
digest asks whether lowering produced the same program; trace/state hashes ask
whether execution behaved the same. Canonical-output requirements are in the
[target strategy](target-strategy.md).

## Extension resolution and dispatch

```plantuml
@startuml
title Extension member resolution and execution
skinparam sequenceMessageAlign center
participant "Source operation" as Source
participant ExtensionCatalog as Catalog
participant "Analyzer / lowerer" as Lowerer
participant "Normalized IR" as NIR
participant "Portable runtime" as Runtime
participant "Extension runtime" as Extension
participant "Capability host" as Host
Source -> Catalog : qualified member/type ID
Catalog --> Lowerer : identity + descriptor
Lowerer -> Lowerer : bind ordered arguments
Lowerer -> Lowerer : validate receiver, types, dependencies,
capabilities, and source location
alt portable operation
  Lowerer -> NIR : resolved extension call
  NIR -> Runtime
  Runtime -> Extension : stable entry + arguments
else host capability operation
  Lowerer -> NIR : ExtensionHostOperation
  NIR -> Runtime
  Runtime -> Host : only if capability installed
else unsupported / invalid
  Lowerer --> Source : structured located diagnostic
end
@enduml
```

Read [ADR-0002](decisions/0002-extension-identity.md) for identity/versioning and
[extensions-and-types.md](extensions-and-types.md) for built-in, events-based,
and JavaScript-declared extension routes. The frozen descriptor oracle is part
of the [corpus](corpus/README.md).

## Runtime semantics and lifecycle

Compatibility requires more than Boolean calls. Selections, nested events,
mutation during iteration, triggers, and scene lifecycle have observable order.

```plantuml
@startuml
title One deterministic frame and optional scene transition
start
:Sample seeded inputs and game time;
:Run pre-event lifecycle hooks;
:Initialize ordered object/group selections;
:Enter events;
:Evaluate conditions left-to-right;
if (condition filters selection?) then (yes)
  :Record ordered selection before/after;
endif
if (event passed?) then (yes)
  :Run actions in order;
  :Record receivers, writes,
creation, deletion, selection;
  :Run child events with defined scope;
else (no)
  :Skip actions and children;
endif
:Run post-event hooks;
if (scene change requested?) then (yes)
  :Record request;
  :Unload/dispose old scene;
  :Commit and load new scene;
endif
:Record frame end and canonical state;
stop
@enduml
```

```plantuml
@startuml
title Runtime state ownership
package "Game lifetime" {
  [Global variables] as globals
  [Catalog snapshot] as catalog
}
package "Scene lifetime" {
  [Scene variables] as scene
  [Stable object/behavior handles] as objects
  [Selections] as selections
  [Trigger/timer state] as triggers
  [Ordered async/event queues] as queues
}
package "Observations" {
  [Semantic trace] as trace
  [Final asserted state] as final
}
objects --> selections
globals --> trace
scene --> trace
selections --> trace
triggers --> trace
queues --> trace
catalog --> trace : resolved identities
trace --> final
@enduml
```

See the [target strategy](target-strategy.md) for required trace records and the
[compatibility roadmap](compatibility-roadmap.md) for promotion rules.

## Host capabilities and targets

```plantuml
@startuml
title Capability-based target composition
top to bottom direction
component "Resolved NIR operation" as op
component "Capability lookup" as lookup
interface Time as time
interface Input as input
interface Storage as storage
interface Audio as audio
interface Rendering as rendering
interface "MapHost (spike-local)" as map
component "Deterministic fake/headless host" as fake
component "JVM host" as jvm
component "Browser JS host" as js
component "Android / Native host (future)" as native
artifact "Unsupported-capability diagnostic" as reject
op --> lookup : RuntimeCapabilityIds
lookup --> time
lookup --> input
lookup --> storage
lookup --> audio
lookup --> rendering
lookup --> map
time --> fake
input --> fake
storage --> jvm
rendering --> js
map --> js
audio --> native
lookup --> reject : adapter absent
note right of js
  Owns DOM, promises, URLs,
  credentials, WebGL, MapLibre,
  listeners, and target handles.
end note
@enduml
```

| Rule | Reason | Authority |
|---|---|---|
| NIR declares capabilities but holds no host instance. | Programs stay target-neutral and analyzable. | [ADR-0003](decisions/0003-runtime-host-boundary.md) |
| Async completions enter ordered runtime queues. | Callback timing must not reorder semantics silently. | [Portable architecture](portable-architecture.md) |
| Target handles stay in adapters and are disposed by owners. | Prevents platform lifetimes leaking into portable state. | [ADR-0003](decisions/0003-runtime-host-boundary.md) |
| Missing capabilities produce stable diagnostics. | Silent skipping is false compatibility. | [Target strategy](target-strategy.md) |
| A fake host is a test instrument, not production conformance. | Determinism and host conformance are separate metrics. | [Evidence index](evidence-index.md) |

## Corpus evidence and phase gates

A compile or unit test can establish implementation health, but cannot alone
promote a feature to `partial` or `compatible`.

```plantuml
@startuml
title Evidence production and gate decision
left to right direction
folder "Phase 0 corpus" as corpus {
  artifact manifest
  artifact projects
  artifact "catalog snapshot" as snapshot
  artifact "reviewed reference traces" as refs
}
component "Corpus validator" as validator
component "Pinned GDJS capture" as capture
component "Portable corpus runner" as runner
artifact "Per-fixture report" as fixture
artifact "Metric summary" as summary
diamond "All gates pass?" as gate
artifact "Compatibility ledger" as ledger
artifact "Stop/revise record" as stop
manifest --> validator
projects --> validator
snapshot --> validator
refs --> validator
projects --> capture
capture --> refs : reviewed/frozen only
manifest --> runner
projects --> runner
snapshot --> runner
refs --> runner : oracle
runner --> fixture
fixture --> summary
summary --> gate
gate --> ledger : yes; evidence-linked promotion
gate --> stop : no; no promotion
@enduml
```

| Metric | Question answered | Gate failure example |
|---|---|---|
| Decode coverage | Did declared-supported documents decode and retain unknowns? | Fatal decode or silent field loss. |
| Resolution accuracy | Were symbols, IDs, types, dependencies, and bindings correct? | Wrong member or parameter owner. |
| Trace parity | Did ordered behavior match the reference? | Different selection, action, mutation, or lifecycle order. |
| State parity | Did final variables, objects, behaviors, selections, and scene match? | Divergent final state. |
| Diagnostic fidelity | Did code, severity, and normalized location match? | Unexpected or missing diagnostic. |
| Reachability precision | Were required items retained and known-unused items removed? | Any reachability false negative. |
| Determinism | Were NIR, trace, and state hashes stable across seeded runs? | Any canonical hash divergence. |
| Host conformance | Did a concrete adapter satisfy applicable behavior tests? | Lifecycle, ordering, failure, or disposal mismatch. |

Fixture definitions and repeated-run counts are in the
[target strategy](target-strategy.md). Frozen inputs, schemas, validation, and
capture commands are in the [corpus guide](corpus/README.md). Reviewed claims
and current gaps belong in the [evidence index](evidence-index.md).

## MapTiles isolation

MapTiles is a downstream Kotlin/JS experiment, not a headless-milestone
dependency. Its feature work is paused until the Phase 1 go criterion passes.

```plantuml
@startuml
title MapTiles spike boundary (paused)
left to right direction
package "Common, spike-local" #FCF3CF {
  [map-runtime values and MapHost] as mapruntime
  [maptiles-extension descriptors] as mapext
  [portable geo animation] as animation
  mapext --> mapruntime
  animation --> mapruntime
}
package "Kotlin/JS host only" #F5B7B1 {
  [MapLibre adapter] as adapter
  [DOM overlay] as overlay
  [MapLibre / WebGL / network] as browser
  adapter --> browser
  overlay --> browser
}
[Generic normalized IR] as nir
[Generic capability catalog] as catalog
[JVM headless runtime] as headless
catalog --> mapext : descriptor + capability ID
mapext --> nir : resolved host operation
nir --> adapter : capability installed
nir --> headless : stable rejection
adapter --> mapruntime : implements MapHost
note bottom of mapruntime
  Do not promote MapHostResult, clock,
  lifecycle, events, or animation merely
  to simplify the demo.
end note
@enduml
```

The exhaustive ownership/leak review is in the [MapTiles API audit](maptiles-api-audit.md),
and experiment gates are in the [prototype charter](maptiles-prototype.md).

## Phase and dependency overview

```plantuml
@startuml
title Work advances only through evidence gates
state "Phase 0\nFrozen static corpus" as P0
state "Phase 1\nCommon + JVM headless" as P1
state "Phase 2\nKSP extension SDK" as P2
state "Later target experiments" as Later
state "MapTiles Kotlin/JS\nPAUSED" as MapTiles
[*] --> P0
P0 --> P1 : complete deterministic corpus
P1 --> P2 : required exact parity
P2 --> Later : generated/descriptor parity
P1 -[dashed]-> MapTiles : only after Phase 1 go
MapTiles --> Later : never bypasses gates
@enduml
```

The [target strategy](target-strategy.md) is authoritative for phases and gates.
The [compatibility roadmap](compatibility-roadmap.md) owns the feature ledger.
Where a diagram conflicts with an ADR or gate, the ADR/gate is authoritative.

## Compact glossary

| Term | Meaning | Not the same as |
|---|---|---|
| Source model | Lossless versioned decoded input with unknowns and locations. | `gd::Project`, NIR, or runtime state. |
| Extension catalog | Frozen resolved descriptors and capability requirements. | Reflection or executing `JsExtension.js` as an oracle. |
| NIR | Immutable resolved target-neutral intermediate representation. | Raw JSON, Kotlin `toString()`, or generated JavaScript. |
| Semantic trace | Ordered canonical event/selection/action/lifecycle observations. | Debug logs or host callback timing. |
| Runtime state | Variables, instances, selections, triggers, scenes, and queues. | Renderer or editor state. |
| Host capability | Narrow versioned target service. | Arbitrary browser/JVM/native globals. |
| Reference oracle | Reviewed pinned GDJS observations from frozen fixtures. | Portable output defining its own expectations. |
| Compatibility | Scoped evidence against named metrics. | Compilation, API similarity, demo success, or test presence. |
