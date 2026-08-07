# ADR-0001: Portable layer owns the normalized IR

* **Status:** Accepted
* **Date:** 2026-08-06

## Context

GDevelop JSON is a persistence format, `gd::Project` is a mutable C++ editor
model, and generated JavaScript is one backend's output. Making any of these the
cross-target representation would import its lifecycle, mutation, or target
assumptions into every implementation. Cucumber/scenario input also needs to
reach the same semantics without manufacturing C++ objects.

## Decision

The portable layer owns a versioned, immutable normalized IR. Decoders first
produce a lossless versioned source model; semantic analysis resolves it against
an extension catalog; only `ProjectLowerer` creates NIR. NIR identities,
selection operations, scopes, lifecycle phases, ordering, and source origins are
language-neutral. It contains neither `gd::` objects nor Kotlin/JavaScript/native
runtime handles.

Front ends and backends depend on the NIR contract, never on each other. NIR
schema changes require a version and migration or explicit rejection. The
portable implementation owns conformance fixtures for NIR and observable event
semantics.

## Consequences

* GDevelop and scenario front ends share analyzers and backends.
* Kotlin types may implement NIR, but cannot define compatibility implicitly.
* A separate lowering step and source-to-NIR diagnostics increase initial work.
* Some source details remain only in the lossless source model and origin map.
* Optimized backend IRs are allowed, but are private derivatives of normalized
  IR and cannot become the interchange format accidentally.

## Compatibility risks

Lowering an implicit GDevelop behavior incorrectly would affect every backend.
Golden traces must therefore cover object picking, nested events, triggers,
mutation during iteration, and lifecycle order before optimizing NIR.
