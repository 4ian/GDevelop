# ADR-0003: Runtime facilities cross a capability-based host boundary

* **Status:** Accepted
* **Date:** 2026-08-06 (capability negotiation note updated 2026-08-07)

## Context

GDJS extensions can reach `gdjs`, browser globals, PixiJS, Three.js, storage,
input, networking, and platform APIs directly. Carrying those globals into a
portable runtime would make JVM, Android, and Native implementations incomplete
imitations of a browser and would prevent deterministic testing.

## Decision

`RuntimeHost` is the exclusive boundary for lifecycle scheduling, scenes,
objects, behaviors, variables, input, time, storage, rendering, audio,
resources, logging, networking, and platform services. It is split into narrow,
versioned capability interfaces. NIR and extension runtime contracts declare
which capabilities they require; semantic analysis and artifact assembly reject
unsupported combinations before execution.

Portable state and deterministic event ordering belong to the program/runtime
core. Target handles remain behind host adapters. Asynchronous host results
return through ordered runtime queues. Legacy JavaScript executes only in an
explicit JavaScript compatibility host and receives a declared global surface.

## Consequences

* Headless and deterministic hosts can execute tests and scenarios.
* Kotlin/JS may wrap PixiJS/Three.js while Android or Native supplies different
  renderers without changing NIR.
* Capability interfaces and lifecycle/disposal rules require careful versioning.
* Extensions that assume arbitrary global access are target-restricted until
  adapted or rewritten.
* Platform permissions can be derived from resolved capability requirements.

## Compatibility risks

An interface that is too high-level can make existing extension behavior
impossible; one that leaks a particular engine defeats portability. Capability
contracts must be validated against representative 2D, 3D, audio, storage,
network, input, and lifecycle extensions before stabilization.

## Map rendering application

The `map-runtime` module applies this decision to maps. Its common API contains
only renderer-neutral coordinates, camera state and commands, interaction
events, and portable feature-query records. A `MapHost` owns the renderer and
is therefore the only code allowed to hold URLs or credentials, DOM and browser
events, promises, and MapLibre (or another renderer's) objects. None of those
target handles may be stored in normalized IR or common runtime state.

Host work is asynchronous: every suspending operation produces an explicit
success or failure value rather than exposing a platform promise. Events are
delivered in host order. A host moves through the documented lifecycle, and
`dispose` is terminal, idempotent, stops event delivery, and releases target
handles. Calls made in an invalid lifecycle state return a host failure.

Extension actions declare host needs with stable capability identifiers. Map
actions that need a browser renderer require
`org.gdevelop.runtime.browser-map-rendering-host`, contract version `1`; resolution or artifact
assembly can consequently reject a headless or otherwise incompatible host
before the action runs.

The MapTiles catalog attaches an exact `1..1` supported range at operation
scope. The MapLibre adapter identifies its provider deterministically as
`browser:maplibre-js:1` and publishes contract 1 only when a `MapHost` is
installed. This is an exact browser-map claim, not a general rendering claim.
The JVM headless provider publishes deterministic execution contract 1 and
explicitly lists both rendering and browser-map rendering as unavailable.
