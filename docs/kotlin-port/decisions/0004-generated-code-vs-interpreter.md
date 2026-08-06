# ADR-0004: Support interpreter and generated execution from one IR

* **Status:** Accepted
* **Date:** 2026-08-06

## Context

Generated code can integrate naturally with target toolchains and optimize hot
paths, while an interpreter enables fast previews, diagnostics, hot reload,
scenario execution, and a reference implementation. Choosing only one now would
constrain compatibility and make it harder to compare semantics across targets.

## Decision

Normalized IR is execution-strategy neutral. Both interpreter and generated-code
backends consume the same reachable, validated NIR and the same extension
lowering/runtime contracts. The interpreter produces immutable executable
tables/opcodes; generated backends produce target compiler inputs. Neither is
allowed to decode source JSON or independently resolve extension metadata.

The interpreter is the initial semantic reference, not a privileged alternative
language. Cross-backend conformance tests compare observable selection state,
variables, lifecycle calls, object mutations, diagnostics, and deterministic
host interactions. Artifacts record backend and NIR versions.

## Consequences

* Preview/scenario execution can start before every generated backend is mature.
* Generated JVM/JS/Android and later Native applications can optimize without
  changing the source model.
* Two execution strategies add implementation and conformance costs.
* Opaque JavaScript remains available only to a backend/host that declares it;
  the interpreter does not pretend to translate it.
* Backend-specific optimized IR may exist after NIR, but is not shared source of
  truth.

## Compatibility risks

If interpreter operations are designed around implementation convenience, their
behavior may diverge from generated code. The project needs golden GDevelop
fixtures and differential tests before treating either backend as compatible.
