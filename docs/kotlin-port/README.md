# Kotlin port initiative

> [!IMPORTANT]
> **Milestone 1 is a headless semantic vertical slice.** It is **not** a complete
> editor, renderer, Android application, or wholesale port of GDJS. Work outside
> that slice must not be presented as a Milestone 1 dependency or deliverable.

This directory is the entry point for investigating a portable Kotlin execution
stack for a deliberately bounded subset of GDevelop. The initiative is
evidence-led: compatibility means reproducing named, observable semantics, not
translating a percentage of the codebase.

## Status and evidence convention

Use these markers in this document and future investigation notes:

| Marker | Meaning | Evidence requirement |
|---|---|---|
| **Confirmed** | Directly established from the repository or a repeatable experiment. | Cite repository path(s), or link an experiment result that records its command, inputs, environment, and output. For flow investigations, also record the investigation date and repository revision. |
| **Inference** | Best current conclusion drawn from confirmed evidence, but not directly demonstrated. | Link the confirmed evidence and state the reasoning. |
| **Hypothesis** | A testable proposition awaiting evidence. | State the experiment or repository trace that could confirm or reject it. |
| **Decision** | An adopted direction that constrains implementation. | Link an accepted decision record and identify evidence still needed to validate its consequences. |

A claim without the required support is not **Confirmed**. Paths are relative to
the repository root. Dates use ISO 8601 (`YYYY-MM-DD`), and revisions use a full
Git commit hash because source and runtime flows can change.

## Documentation map

Read these documents as one evidence set:

* [GDevelop pipeline trace](gdevelop-pipeline.md) — project loading, metadata,
  event generation, runtime initialization, lifecycle, and flow seams.
* [Extension and type matrix](extensions-and-types.md) — extension declaration
  routes, serialized identities, runtime linkage, and portability constraints.
* [Portable architecture](portable-architecture.md) — source model, normalized
  IR, analysis, extension catalog, runtime state, host capabilities, and targets.
* [Target strategy](target-strategy.md) — staged experiments, fixtures, evidence
  gates, target comparisons, and stop/go criteria.
* [Map tiles prototype](maptiles-prototype.md) — a post-headless Kotlin/JS
  experiment using MapLibre as an explicit browser rendering host.
* [Compatibility roadmap](compatibility-roadmap.md) — observable compatibility
  levels, ledgers, metrics, and acceptance requirements.
* [Kotlin Multiplatform prototype](../../KotlinPlatform/README.md) — isolated
  module map, supported headless subset, explicit rejection boundaries, and CLI.
* Decision records:
  * [ADR-0001: Portable layer owns the normalized IR](decisions/0001-ir-ownership.md)
  * [ADR-0002: Extension identity is explicit and versioned](decisions/0002-extension-identity.md)
  * [ADR-0003: Runtime facilities cross a capability-based host boundary](decisions/0003-runtime-host-boundary.md)
  * [ADR-0004: Support interpreter and generated execution from one IR](decisions/0004-generated-code-vs-interpreter.md)

## Vision

**Inference.** A portable, versioned semantic core could let multiple Kotlin
targets consume the same source model, normalized IR, extension catalog, and
runtime contracts while target hosts provide platform capabilities. This follows
from the seams traced in [`gdevelop-pipeline.md`](gdevelop-pipeline.md) and the
proposed boundaries in
[`portable-architecture.md`](portable-architecture.md); it has not yet been
validated by a Kotlin implementation.

Success is demonstrated incrementally through pinned fixtures, normalized
traces, final-state comparisons, deterministic runs, and explicit unsupported
feature diagnostics. It is not demonstrated by compiling generated Kotlin or by
matching API names alone.

## Current status

**Confirmed** — investigation date **2026-08-06**, repository revision
`ee333992c575ed846b90ed568c73fa17f2cfaa69`:

* The pipeline and lifecycle investigation is documented with repository paths
  in [`gdevelop-pipeline.md`](gdevelop-pipeline.md).
* Extension declaration routes and the `ExampleJsExtension` end-to-end trace are
  documented with repository paths in
  [`extensions-and-types.md`](extensions-and-types.md).
* The isolated [`KotlinPlatform/`](../../KotlinPlatform/README.md) prototype now
  demonstrates source decoding, lowering to normalized IR, deterministic
  bounded-frame execution, stable JSON traces, and a statically registered
  Kotlin extension for a deliberately narrower subset of the milestone. It does
  not claim compatibility: the pinned differential corpus and GDJS reference
  traces described in [`target-strategy.md`](target-strategy.md) are not yet
  checked in.

**Decision.** The four accepted ADRs establish current working boundaries: a
portable normalized IR, explicit extension identity, a capability-based host
boundary, and interpreter/generated backends consuming the same IR. These are
architecture decisions, not evidence of runtime compatibility.

## Active milestone: headless semantic vertical slice

The active milestone combines the static corpus gate with the smallest JVM
headless execution path needed to test semantics. Its representative first
fixture is `variables-and-branches`; object picking and deletion is the semantic
gate. Scope and acceptance metrics are defined in the Phase 0 and Phase 1
sections of [`target-strategy.md`](target-strategy.md).

Concrete deliverables:

- [ ] Add the versioned corpus manifest, minimized project JSON, provenance, and
      content hashes.
- [ ] Add schemas for the corpus manifest and normalized semantic trace.
- [ ] Add a pinned GDJS reference-trace capture command and reviewed canonical
      traces.
- [ ] Add a validator for fixture hashes, IDs, references, ordering, coverage,
      and provenance.
- [ ] Implement the bounded source decoder, source locations, diagnostics, and
      extension-catalog snapshot required by the fixtures.
- [ ] Implement common normalized IR and a deterministic JVM headless interpreter
      for the declared event, variable, selection, mutation, and scene subset.
- [ ] Demonstrate exact normalized trace and final-state parity for the milestone
      fixtures, plus repeated-run determinism.
- [ ] Publish structured unsupported-feature diagnostics for every corpus node
      outside the implemented slice.

## Confirmed findings

All findings below were investigated on **2026-08-06** at revision
`ee333992c575ed846b90ed568c73fa17f2cfaa69`. Re-check them before relying on exact
implementation paths at a later revision.

* **Confirmed.** The existing system separates C++ project/editor metadata,
  JavaScript event generation, and GDJS runtime execution. Repository paths and
  the end-to-end flow are recorded in
  [`gdevelop-pipeline.md`](gdevelop-pipeline.md).
* **Confirmed.** Extension metadata and runtime implementation are separate
  products, and persisted type strings plus parameter ordering form part of the
  compatibility surface. The declaration paths and concrete source inventory
  are recorded in [`extensions-and-types.md`](extensions-and-types.md).
* **Confirmed.** The example JavaScript extension uses executable CommonJS
  metadata registration and separately registered runtime constructors and
  callbacks; it is not a single declarative schema. The build, loader, metadata,
  and runtime paths are recorded in
  [`extensions-and-types.md`](extensions-and-types.md).
* **Confirmed.** Project JSON, `gd::Project`, and generated JavaScript serve
  different stages of the current flow. Their repository paths are recorded in
  [`gdevelop-pipeline.md`](gdevelop-pipeline.md); whether the proposed source
  model and NIR preserve sufficient behavior remains unconfirmed.

## Open questions

These questions are intentionally unresolved. A choice becomes a **Decision**
only through an ADR; an observation becomes **Confirmed** only with the evidence
required above.

1. What license and distribution model should the Kotlin work and its produced
   artifacts use?
2. Is compatibility with existing GDevelop project JSON required, and if so,
   which versions and what round-trip guarantees are in scope?
3. Must arbitrary JavaScript in events, extensions, and project code be
   supported, rejected, sandboxed, or isolated in a compatibility host?
4. What is the target application category: runtime library, headless tooling,
   game/player export, authoring tool, editor replacement, or another product?
5. Which renderer, if any, should follow the headless milestone, and what
   platforms and rendering guarantees must it support?
6. What behavioral divergence from GDJS is acceptable, how will it be measured,
   and who approves exceptions?
7. Which built-in, community, and project-embedded extension subset is supported,
   on which targets and versions?
8. Must generated source and other generated artifacts be human-editable, and if
   edited, are they inputs, disposable outputs, or supported customization
   points?

## Risks

* **Inference.** Object picking, mutation during iteration, trigger state, and
  lifecycle order are likely higher compatibility risks than straightforward
  data decoding; the pipeline and roadmap identify them as cross-cutting
  semantics, but differential traces have not yet been collected.
* **Inference.** Treating extension declarations as UI metadata alone would lose
  runtime linkage, parameter ownership, serialization, and lifecycle behavior
  documented in [`extensions-and-types.md`](extensions-and-types.md).
* **Hypothesis.** A target-neutral IR can express the milestone semantics without
  leaking JVM, browser, Android, or renderer types. The Phase 1 API audit and
  differential corpus run in [`target-strategy.md`](target-strategy.md) must test
  this.
* **Hypothesis.** Reference GDJS traces can be made stable under pinned time,
  random, input, and resource conditions. Phase 0 repeated captures must confirm
  this before portable output is treated as compatible.
* **Inference.** Exact source paths and registration flows will drift as the
  upstream repository changes; undated or revision-free flow notes can therefore
  become misleading.

## Deferred work

The following work is outside the active milestone. These are boundaries, not a
backlog commitment:

* Complete editor or editor replacement, including property panels, scene
  editing, previews, extension authoring UI, and project migration UX.
* Renderer selection and visual fidelity, production audio/input/resource hosts,
  shaders/effects, 3D, physics, and platform-specific performance work.
* Android application packaging, store distribution, permissions, lifecycle UI,
  and device certification.
* Wholesale GDJS porting or complete built-in/community extension coverage.
* Arbitrary JavaScript translation or compatibility hosting until its requirement
  and security model are decided.
* KSP extension SDK, generated backend optimization, Kotlin/JS and Native
  targets, editable generated artifacts, and production export tooling.

## Next evidence to collect

Collect evidence in this order so implementation does not define its own oracle:

- [ ] Record a corpus capture environment: full GDevelop revision, dependency
      lock state, OS/runtime/tool versions, command, seeded host inputs, and
      fixture hashes.
- [ ] Minimize and capture `variables-and-branches`, including expression order,
      variable scopes, branch decisions, trace, and final state.
- [ ] Minimize and capture `object-picking-and-deletion`, including selection
      membership/order before and after each operation and deletion callbacks.
- [ ] Capture `scene-change-lifecycle` with requested/committed transition and
      load/pre-events/post-events/unload ordering.
- [ ] Freeze a descriptor snapshot for the required built-ins and
      `MyDummyExtension`, including qualified identities, parameters, includes,
      properties, and lifecycle registrations.
- [ ] Run each reference capture twice and record canonical hashes; investigate
      every mismatch rather than normalizing it away without evidence.
- [ ] Add an evidence index mapping every milestone compatibility assertion to a
      repository trace, fixture assertion, experiment result, or ADR.

When any flow is re-investigated, append or update its date and full repository
revision alongside its evidence. Do not silently carry a **Confirmed** marker
across a revision whose relevant paths or experiment results have not been
checked.
