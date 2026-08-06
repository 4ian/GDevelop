# ADR-0003: Runtime facilities cross a capability-based host boundary

* **Status:** Accepted
* **Date:** 2026-08-06

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
