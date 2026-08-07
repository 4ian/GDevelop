# ADR-0002: Extension identity is explicit and versioned

* **Status:** Accepted
* **Date:** 2026-08-06

## Context

Projects persist instruction type names and fully qualified object/behavior/effect
types. Existing extension systems combine namespace strings, origins, package
versions, aliases, translated labels, JavaScript globals, and runtime
registration names. Name-only lookup can silently bind a project to the wrong
implementation and makes dependency resolution nondeterministic.

## Decision

An extension is identified by `(namespace, version, origin)`. A member is an
ordered path within that identity. Project/source compatibility aliases map old
serialized names to canonical member identities explicitly and retain the
original spelling for round trips and diagnostics.

The `ExtensionCatalog` resolves dependency version ranges to one immutable
catalog snapshot before semantic analysis. Metadata, lowering, serialization,
runtime implementation, and capability contracts declare the extension/member
identity and compatible contract versions independently. Display labels,
generated symbols, runtime class names, and filenames are never identities.

## Consequences

* Builds and diagnostics can state exactly which extension supplied a member.
* Multiple origins or versions require an explicit conflict/selection policy.
* Legacy projects whose extension version/origin is absent need a recorded
  compatibility resolution, not an inferred permanent identity.
* Renames require aliases and, where serialization changes, migrations.
* Artifact manifests and caches include the resolved catalog snapshot.

## Compatibility risks

GDevelop historically treats some namespace strings as sufficient identity. The
decoder must preserve that ambiguity and the resolver must use a documented
legacy policy; it must not rewrite old source as though an origin/version had
always been present.
