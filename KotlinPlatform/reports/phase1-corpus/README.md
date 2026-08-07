# Phase 1 JVM corpus reports

Generated with:

```sh
gradle :jvm-cli:run -Pargs="--corpus ../docs/kotlin-port/corpus/manifest.json --reports reports/phase1-corpus"
```

These schema-version 2 reports expose ordered lifecycle/condition/action traces, explicit selections, stable object
handles, variables, final objects, diagnostics, and resolved extensions. The runner takes the pinned Phase 0 manifest as
its only fixture inventory; it never reads MapTiles fixtures. `executed` means the bounded Kotlin runner produced a
report, not that differential compatibility has been accepted. The canonical GDJS traces under
`docs/kotlin-port/corpus/traces/` remain the oracle for a subsequent field-by-field differential report.
