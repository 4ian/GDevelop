# Gameplay Test MCP Tools Specification

Date: 2026-08-10

## Problem

GDevelop can run project and extension gameplay tests from the editor and from
the local CLI, but the built-in MCP server cannot start these tests or retrieve
their structured results. MCP callers must currently reproduce a test with the
lower-level preview tools, which loses the authored gameplay-test script,
assertions, event log, final state, profiling information, and test timeout
semantics.

Gameplay-test runs can take longer than one MCP request should remain open. A
single blocking tool would also make a completed result difficult to recover
when an MCP caller is interrupted. The public surface therefore needs one tool
to start a run and a separate tool to query its progress and results.

This is an additive public MCP API change. Discovery, dispatch, lifecycle
ownership, result retention, project-file identity, tests, and bundled MCP
guidance must agree on the new contract.

## Goals

- Add `run_gameplay_tests` to start one authored gameplay test selected by its
  canonical `tests.settings` `file`, or all authored gameplay tests when
  `file` is omitted.
- Add `get_gameplay_test_results` to fetch an operation's progress, aggregate
  outcome, and paginated completed test results.
- Reuse the existing gameplay-test preview and runner rather than introduce a
  second execution engine.
- Return from `run_gameplay_tests` immediately with a stable operation ID while
  the run continues in the renderer.
- Identify tests by the strict version 5 multi-file path contract: a
  scheme-free, flat `tests/<Encoded name>.js` path with no `game://` prefix.
- Run the current in-memory test source associated with that path, so MCP and
  the editor execute the same project model.
- Preserve the existing `.gdevelop/gameplay-test-results.json` last-run-summary
  behavior without writing authored project sources.
- Generate `.gdevelop/harness-api.d.ts` with every project-catalog refresh so
  gameplay-test authors have a reviewed, machine-readable harness contract
  alongside the runtime and project declarations.
- Add a bundled `references/gameplay-test-harness.md` guide that teaches how to
  write deterministic harness tests and points to the generated declaration
  for the exact branch-local API.
- Update the bundled project-files skill to route gameplay-test work through
  that reference and to explain when and how to use the two MCP tools.
- Keep responses bounded and useful for projects containing many tests.
- Prevent conflicting project reload/open/preview workflows while an MCP
  gameplay-test operation is active.

## Non-goals

- Do not add MCP authoring, renaming, deletion, or inline-source execution for
  gameplay tests.
- Do not accept arbitrary absolute paths, `game://` URIs, paths outside
  `tests/`, or nested paths below `tests/`.
- Do not read a test script directly from disk. Direct source edits must pass
  the existing validation and `reload_project` workflow before execution.
- Do not add a third MCP tool for stopping a run. The existing editor stop
  control remains available to the user.
- Do not replace `verify_project_change`, the preview debugger tools, or the
  local `RUN_ALL_TESTS` CLI command.
- Do not change gameplay-test JavaScript APIs, runtime assertion semantics,
  the version 5 project format, or legacy single-file serialization.
- Do not copy the official gameplay-test guide verbatim or make network access
  to that guide a prerequisite for using the bundled skill.
- Do not hand-author `.gdevelop/harness-api.d.ts` inside user projects or treat
  it as project source.
- Do not persist full MCP operation history or screenshot bytes to project
  source or `.gdevelop`.
- Do not add version 6 or a compatibility alias for the retired authored
  `source` path field.

## Current Behavior

`GameplayTestRunner.js` owns the common editor-side runner. It launches a fresh
dedicated gameplay-test preview, resolves stored test source from the active
`gdProject`, executes tests sequentially, and returns one
`GameplayTestResult` per selected test. Runs are globally serialized. The
runner exposes callbacks for test start and frame progress, but not for batch
start or individual test completion.

The result includes status, timings, frame count, assertions, errors, bounded
console and event logs, final state, screenshots, profiles, and performance
data. `makeGameplayTestResultReadableOutput` converts it to JSON-safe output.

`MainFrame` registers the preview-launcher dependencies used by
`runProjectGameplayTests`. After a run, it updates the UI and, for a local
multi-file project, writes only the four last-run summary fields to
`.gdevelop/gameplay-test-results.json`. It does not dirty authored project
sources.

The editor and local CLI independently enumerate project tests first, followed
by extension tests in project extension order. The multi-file adapter owns the
canonical mapping from test scope/name to the flat path stored in
`tests.settings` as `file`.

Project catalog generation currently writes three JSON catalogs and two
JavaScript authoring declarations: `.gdevelop/runtime-api.d.ts` and
`.gdevelop/project-api.d.ts`. There is no generated declaration for the
`harness` object available inside test scripts, so an AI author must infer much
of that API from examples or runtime implementation.

The bundled project-files skill has a JavaScript-event reference but no routed
gameplay-test reference. It neither documents the strict `tests.settings` plus
flat `tests/*.js` authoring workflow nor introduces MCP gameplay-test execution
and result retrieval.

The MCP catalogue currently publishes an exact 23-tool allowlist. The generic
renderer bridge has no gameplay-test operation registry or dispatch branch.

## Proposed Behavior

### `run_gameplay_tests`

The tool starts a background operation against the active project and returns
without waiting for preview export, boot, or test execution.

Its input schema is:

```json
{
  "type": "object",
  "properties": {
    "file": {
      "type": "string",
      "minLength": 1,
      "maxLength": 1024
    },
    "timeout_ms": {
      "type": "integer",
      "minimum": 1000,
      "maximum": 300000,
      "default": 30000
    }
  },
  "additionalProperties": false
}
```

- When `file` is present, it must exactly match one canonical `file` value in
  the active project's transient version 5 `tests.settings` projection, for
  example `tests/Player%20can%20jump.js`.
- When `file` is omitted, all tests run in canonical project order: project
  tests in container order, then each extension in project order and its tests
  in container order.
- An empty string is not equivalent to omission.
- `timeout_ms` is the wall-clock budget for each test, not for the whole batch.
- Runs are unpaced and screenshots are disabled for this MCP surface. Tests
  still return assertion, log, event, final-state, profile, and performance
  data. Callers can use `capture_preview_screenshot` on the frozen final frame
  when visual evidence is needed.

A successful start returns a response shaped as follows:

```json
{
  "success": true,
  "operation_id": "gameplay-tests-550e8400-e29b-41d4-a716-446655440000",
  "status": "queued",
  "selection": {
    "mode": "file",
    "file": "tests/Player%20can%20jump.js",
    "test_count": 1
  },
  "project": {
    "name": "My game",
    "file": "D:\\Games\\My game\\project.gdevelop"
  },
  "created_at": "2026-08-10T10:00:00.000Z",
  "next_action": "Call get_gameplay_test_results with this operation_id."
}
```

For an all-tests run, `selection.mode` is `all` and `selection.file` is
omitted. Returning `queued` is valid even when execution can start immediately;
the operation becomes `launching` only when its globally serialized runner
batch actually starts.

Only one non-terminal MCP gameplay-test operation is allowed. The tool rejects
a new request when another MCP operation or a UI/CLI gameplay-test batch is
running. It also reserves the existing MCP preview-launch sequence for the
operation's lifetime, so validation/reload/preview workflows cannot race the
dedicated test preview.

### `get_gameplay_test_results`

The second tool reads operation state and never starts, retries, or mutates a
run.

Its input schema is:

```json
{
  "type": "object",
  "properties": {
    "operation_id": {
      "type": "string",
      "minLength": 1,
      "maxLength": 128
    },
    "offset": {
      "type": "integer",
      "minimum": 0,
      "default": 0
    },
    "limit": {
      "type": "integer",
      "minimum": 1,
      "maximum": 100,
      "default": 25
    }
  },
  "additionalProperties": false
}
```

When `operation_id` is omitted, the tool discovers the active operation, or
the most recently created retained operation when none is active. This makes a
run recoverable after a caller loses the start response. If no operation is
available, the call returns a structured error.

The response includes only the requested result page:

```json
{
  "success": true,
  "operation_id": "gameplay-tests-550e8400-e29b-41d4-a716-446655440000",
  "status": "running",
  "selection": {
    "mode": "all",
    "test_count": 4
  },
  "project": {
    "name": "My game",
    "file": "D:\\Games\\My game\\project.gdevelop"
  },
  "created_at": "2026-08-10T10:00:00.000Z",
  "started_at": "2026-08-10T10:00:01.000Z",
  "finished_at": null,
  "progress": {
    "current_index": 2,
    "total": 4,
    "current_file": "tests/Enemy%20takes%20damage.js",
    "current_test": "Enemy takes damage",
    "frame": 180
  },
  "summary": {
    "total": 4,
    "completed": 2,
    "passed": 1,
    "failed": 1,
    "error": 0,
    "stopped": 0,
    "timeout": 0,
    "all_passed": false
  },
  "results": [
    {
      "file": "tests/Player%20can%20jump.js",
      "scope": "project",
      "name": "Player can jump",
      "status": "passed",
      "framesExecuted": 120,
      "durationMs": 600,
      "timeoutMs": 30000,
      "gameTimeMs": 2000,
      "assertions": [],
      "errors": [],
      "consoleLogs": [],
      "eventLog": [],
      "finalState": null,
      "screenshots": [],
      "profiles": [],
      "performance": null
    }
  ],
  "page": {
    "offset": 0,
    "limit": 25,
    "returned": 1,
    "available": 2,
    "has_more": true,
    "next_offset": 1
  }
}
```

Extension result entries additionally contain `extension`. Result details use
`makeGameplayTestResultReadableOutput`, with the canonical file identity added.
Because the MCP runner disables screenshots, no JPEG base64 data enters the
operation registry or MCP response.

The operation statuses are:

- `queued`: accepted but not yet entered into the globally serialized runner;
- `launching`: exporting or booting the dedicated gameplay-test preview;
- `running`: at least one selected test has started;
- `completed`: the runner and last-run-summary persistence finished, including
  when one or more test results are failed, error, stopped, or timeout;
- `failed`: the operation itself could not execute or finish persistence.

Test failures are data, not MCP protocol errors. A completed batch reports
`success: true` and `summary.all_passed: false`. The `failed` operation state
includes a bounded `operation_error` while preserving any completed results.

### Test identity and current source

The multi-file adapter will expose a pure internal helper used by decomposition
and MCP selection. Given the serialized in-memory project, it returns each
test's logical identity and allocated canonical `file` without writing files.
The decomposition writer continues to use the same helper, preventing MCP file
selection from drifting from `tests.settings`.

The `file` argument is only an identity selector. The runner receives the
matching scope and test name and resolves source from the active `gdProject`.
It does not open the supplied path. Consequently:

- unsaved editor changes are included;
- direct disk edits are not included until `reload_project` succeeds;
- encoded filenames and collision suffixes match the writer exactly;
- a syntactically path-like but unknown value cannot execute arbitrary code.

### Operation lifecycle and retention

A dedicated `McpGameplayTestOperations` owner will hold operation state outside
individual bridge objects. `MainFrame` recreates its bridge when dependencies
change, so keeping state only in `createMcpEditorBridge` would lose active runs.
`MainFrame` will create one stable operation owner for its lifetime and inject
it into each bridge instance.

The operation owner will:

1. create a UUID-based ID and immutable project/selection snapshot;
2. start `runProjectGameplayTests` in a caught background promise;
3. update lifecycle, test, and frame progress through runner callbacks;
4. append each readable test result exactly once as it finishes;
5. mark the operation terminal only after the existing post-run persistence
   callback finishes;
6. always release the MCP preview-sequence reservation;
7. retain the newest 10 terminal operations for 30 minutes, evicting expired
   or oldest terminal operations before accepting/querying work; and
8. never evict the active operation.

The result query is paginated to at most 100 tests per response. Runtime-side
limits already bound assertions, errors, console logs, event-log entries,
profiles, and screenshot dimensions per test; this MCP surface additionally
disables screenshot capture. No unbounded `Promise.all` is introduced.

### Runner lifecycle callbacks

The shared runner options will gain internal callbacks for batch start and
individual result completion. They do not alter execution or serialized data:

```text
onRunStarted()
onTestFinished(test, result)
```

`onRunStarted` fires when a queued batch becomes current, before preview
launch. `onTestFinished` fires exactly once for every selected test, including
synthetic error/stopped results caused by source resolution, boot failure, or
user stop. Existing UI and CLI callers may omit both callbacks.

### Generated harness authoring declaration

Every operation that regenerates project source catalogs will also write and
verify:

```text
.gdevelop/harness-api.d.ts
```

The generated authoring set consequently becomes three JSON catalogs plus
three JavaScript declarations. Save, open/reload catalog refresh,
`generate-catalogs`, and the catalog phase of `validate_project_files` all use
`writeProjectSourceCatalogs`, so they receive the new artifact consistently.

`harness-api.d.ts` is a generated/editor artifact, never an authored version 5
source. It declares the global `harness` available to the body of a gameplay
test and the reviewed public supporting types needed by its methods. The
declaration covers the supported contracts for:

- fresh scene navigation and deterministic stepping;
- bounded wait/poll helpers and control probes;
- keyboard, mouse, touch, and input release;
- scene, layer, camera, object, object-variable, scene-variable, and
  global-variable inspection;
- watching, nearby-object queries, relative-position and line-of-sight data;
- arranging a scenario by spawning, moving, removing, or configuring objects
  and variables;
- assertions and explicit failure;
- event/sound logs and screenshots;
- progress tracking, aiming/control helpers, and profiling; and
- the JSON-safe snapshot, option, event, profile, and result shapes returned by
  those methods.

Only reviewed test-authoring members are declared. Runtime-private fields and
methods, underscore-prefixed implementation details, stop-controller
internals, debugger plumbing, DOM objects, and arbitrary renderer internals are
excluded even when they are technically reachable in the preview.

`JavaScriptAuthoringApi.js` will own a reviewed declaration builder rather than
scraping the TypeScript runtime file at application runtime. The generated
declaration may use the public `gdjs` and `GDevelopProject` types from the two
other generated declarations. Its header records content hashes for itself and
the declarations it depends on. Adding this third artifact increments the
JavaScript authoring artifact format version while leaving the multi-file
project format at strict version 5.

`buildJavaScriptAuthoringArtifacts` returns `harnessApi` plus its hash, and
`writeProjectJavaScriptAuthoringApi` writes all three declarations
sequentially. A catalog operation is successful only after the harness file is
read back and hash-verified through the existing generated-file verification
path. MCP catalog results expose its absolute path as `harnessApi` and update
all descriptions and receipts from “two declarations/five artifacts” to
“three declarations/six artifacts.”

### Bundled harness-writing reference

Implementation adds:

```text
newIDE/app/resources/gd-project-template/skills/
  gdevelop-project-files/references/gameplay-test-harness.md
```

The guide is an offline, branch-specific “How to write gameplay tests with the
harness” reference. It is informed by the official GDevelop gameplay-test
guide at
`https://wiki.gdevelop.io/gdevelop5/interface/gameplay-tests/`, but is written
for the exact local format and generated API rather than copied from the wiki.

It must explain:

- a test file contains the body of an async test, not an `async function` or
  `(harness) => {}` wrapper;
- simulation advances at a deterministic fixed 1/60 second per frame only
  when the script asks it to advance;
- every advancing operation such as `goToScene`, `stepFrames`, `stepUntil`, or
  a control helper must be awaited;
- the arrange/act/assert pattern, including the rule that setup helpers may
  create a test situation but must not fabricate the outcome being asserted;
- focused assertions with diagnostic messages, fresh snapshots after frame
  advancement, input press/release cleanup, bounded waits, and small tests
  centered on one mechanic;
- the meaning of passed, failed, error, stopped, and timeout results;
- representative, newly written examples for movement/jumping, collection or
  damage, layer-based menus, scene variables, and performance profiling;
- project tests versus extension-owned tests and their flat version 5 file
  identities;
- when screenshots are useful, and that the initial MCP run surface suppresses
  screenshot capture even though editor/CLI harness runs can retain it;
- how to read `.gdevelop/harness-api.d.ts` for the exhaustive current method
  signatures and supporting shapes instead of guessing from prose; and
- the `generate-catalogs` -> read declarations/reference -> direct source edit
  -> `validate_project_files` -> `reload_project` ->
  `run_gameplay_tests` -> `get_gameplay_test_results` workflow.

The bundled skill's progressive-disclosure routing requires this reference to
be read in full before creating or materially modifying a test script. The
skill itself gains the strict `tests.settings`/flat `tests/*.js` file contract,
lists `.gdevelop/harness-api.d.ts` next to the other generated declarations,
introduces both MCP tools in the exact allowlist, and requires callers to poll
the result tool until a terminal operation state. A behavior change is not
reported as gameplay-test verified unless the operation is `completed` and
`summary.all_passed` is true.

## MCP Catalogue and Permissions

Both tools are always discoverable, introspectable, and callable, independent
of legacy MCP write/command preference flags. They do not author project
source.

`run_gameplay_tests` annotations are:

```json
{
  "readOnlyHint": false,
  "destructiveHint": false,
  "idempotentHint": false,
  "openWorldHint": false
}
```

It is not read-only because it executes project code and updates local
last-run summaries. It is not classified as a public write tool because it
does not create or edit authored project source.

`get_gameplay_test_results` annotations are:

```json
{
  "readOnlyHint": true,
  "destructiveHint": false,
  "idempotentHint": true,
  "openWorldHint": false
}
```

The capability summary gains a `Gameplay tests` category containing both
tools. The exact public allowlist grows from 23 to 25 tools.

## Affected Layers and Files

### Multi-file format identity helper

- `newIDE/app/src/ProjectsStorage/MultiFileProjectFormat/index.js`
  - Extract and export a pure gameplay-test descriptor allocator from the
    existing decomposition path.
  - Keep `decomposeLegacyProjectToFiles` on that same allocator.
- `newIDE/app/src/ProjectsStorage/MultiFileProjectFormat/index.spec.js`
  - Prove descriptor paths exactly match emitted `tests.settings` `file`
    values, including encoding and collision suffixes.

### Gameplay-test runner

- `newIDE/app/src/GameplayTests/GameplayTestRunner.js`
  - Add the optional batch-start and per-test-finished callbacks.
  - Invoke per-test completion consistently for stored, synthetic error, and
    stopped results.
- `newIDE/app/src/GameplayTests/GameplayTestRunner.spec.js`
  - Cover callback order and exactly-once behavior.

### Generated JavaScript authoring artifacts

- `newIDE/app/src/ProjectsStorage/JavaScriptAuthoringApi.js`
  - Add `PROJECT_HARNESS_API_RELATIVE_PATH`, the reviewed harness declaration
    builder, generated header/dependency hashes, and `harnessApi` artifact.
  - Increment the JavaScript authoring artifact version without changing the
    multi-file project version.
- `newIDE/app/src/ProjectsStorage/JavaScriptAuthoringApi.spec.js`
  - Parse/type-check representative async test bodies against the generated
    declaration.
  - Verify public harness signatures and supporting types are present while
    private runtime implementation details are absent.
- `newIDE/app/src/ProjectsStorage/LocalFileStorageProvider/LocalProjectWriter.js`
  - Write and verify `harness-api.d.ts` after the runtime and project
    declarations and include its hash in the catalog receipt.
- `newIDE/app/src/ProjectsStorage/LocalFileStorageProvider/LocalMultiFileProject.spec.js`
  - Update save/open/catalog-generation coverage to require all three
    declarations and stable cached regeneration.

### MCP operation owner

- `newIDE/app/src/Mcp/McpGameplayTestOperations.js` (new)
  - Own selection, asynchronous execution, progress, summaries, pagination,
    retention, and serialization of results.
- `newIDE/app/src/Mcp/McpGameplayTestOperations.spec.js` (new)
  - Test operation lifecycle without launching Electron previews by injecting
    the runner dependency and clock/ID factories.

### MCP catalogue and bridge

- `newIDE/app/src/Mcp/McpToolCatalog.js`
  - Add both schemas, descriptions, examples, annotations, and the capability
    category.
  - Update catalog-generation and validation descriptions to name three
    declarations and six total generated authoring artifacts.
- `newIDE/app/src/Mcp/McpToolCatalog.spec.js`
  - Update the exact allowlist and categories and verify both public schemas.
- `newIDE/app/src/Mcp/McpEditorBridge.js`
  - Dispatch both tools through the operation owner.
  - Serialize the current project only to derive canonical test descriptors.
  - Reject conflicting project open/reload/preview workflows while a gameplay
    test is active.
  - Return the verified `.gdevelop/harness-api.d.ts` path and updated artifact
    receipt from `generate-catalogs`.
- `newIDE/app/src/Mcp/McpEditorBridge.spec.js`
  - Cover dispatch, validation errors, one-file/all selection, operation
    lookup, and conflicting workflow guards.

### Main-frame lifecycle

- `newIDE/app/src/MainFrame/index.js`
  - Create one stable MCP gameplay-test operation owner and inject it into
    recreated editor bridges.
  - Reuse the already registered gameplay-test runner dependencies and
    existing result persistence callback.

### Bundled MCP guidance

- `newIDE/app/resources/gd-project-template/skills/gdevelop-project-files/SKILL.md`
  - Change the exact allowlist count from 23 to 25.
  - Add gameplay tests to the trigger/routing contract and require the
    dedicated reference before test authoring.
  - Add `tests.settings`, flat `tests/*.js`, and
    `.gdevelop/harness-api.d.ts` to the source/generated-artifact workflow.
  - Document the start/query workflow, canonical `file` selector, polling,
    result interpretation, and the validation/reload prerequisite for direct
    disk edits.
  - Update every “two declarations/five artifacts” instruction to “three
    declarations/six artifacts.”
- `newIDE/app/resources/gd-project-template/skills/gdevelop-project-files/references/gameplay-test-harness.md`
  (new)
  - Teach the harness authoring model, deterministic stepping, async/await,
    arrange/act/assert discipline, result statuses, examples, and the exact
    MCP verification workflow.
  - Point to `.gdevelop/harness-api.d.ts` as the exhaustive local API and cite
    the official GDevelop gameplay-test documentation as background.

No Electron main-process or MCP transport change is required because tools are
already catalogued and dispatched generically through the renderer bridge.

## Public API and Data Changes

This change adds two public MCP names and their request/response contracts. It
does not change MCP transport framing, project serialization, or runtime
debugger messages.

It also adds `.gdevelop/harness-api.d.ts` to the generated authoring contract.
The file is regenerated with the existing catalogs and declarations, carries a
generated-content/dependency hash header, and is returned in catalog receipts.
It is public authoring guidance but not serialized project data. The JavaScript
authoring artifact version changes; the multi-file project remains strict
version 5.

The operation registry is transient editor state. Full MCP results are not
written to `tests.settings`, test scripts, project/extension settings,
`.gdevelop/gameplay-test-results.json`, or any new disk file. The existing
`.gdevelop/gameplay-test-results.json` continues to store only the latest four
summary values per authored test.

## Compatibility and Migration

This is an additive MCP API change. Existing clients and projects require no
migration. Clients that discover tools dynamically see two additional names.

Existing project folders receive `harness-api.d.ts` on their next save,
catalog generation, validation catalog phase, or reload/open catalog refresh.
No migration rewrites `project.gdevelop`, `tests.settings`, or a test script.
Older builds ignore the extra generated file. New builds regenerate a missing
or stale file rather than treating it as authored input.

Only strict version 5 multi-file canonical paths are accepted as `file`
selectors. No `game://` prefix, old `source` field, version 6 marker, nested
test folder, test-name alias, or legacy compatibility parsing is introduced.
Running all tests remains available when the active project was imported from
legacy JSON, but selecting a test by `file` requires that the current project
can produce the strict version 5 canonical test projection.

## Error Handling

`run_gameplay_tests` returns a structured MCP tool error before creating an
operation for:

- no active project (`NO_PROJECT_OPEN`);
- no gameplay tests for an all-tests request (`NO_GAMEPLAY_TESTS`);
- non-string, empty, overlong, nested, absolute, traversal, `game://`, or
  otherwise non-canonical `file` (`INVALID_GAMEPLAY_TEST_FILE`);
- a canonical-looking file not owned by the current project
  (`GAMEPLAY_TEST_FILE_NOT_FOUND`), with at most 100 available canonical files
  included for recovery;
- a current UI/CLI or MCP test run (`GAMEPLAY_TEST_RUN_IN_PROGRESS`), including
  the active MCP operation ID when available;
- an unavailable registered preview runner (`GAMEPLAY_TEST_RUNNER_UNAVAILABLE`);
  or
- an occupied MCP preview sequence
  (`PREVIEW_LAUNCH_SEQUENCE_ALREADY_IN_PROGRESS`).

Once accepted, runner/test failures are recorded on the operation. Unexpected
runner or post-run-persistence rejection marks it `failed`, records a bounded
message without a stack or arbitrary object graph, preserves completed results,
and releases all reservations.

`get_gameplay_test_results` returns a structured MCP tool error for malformed,
unknown, or expired operation IDs and for invalid pagination. It never starts
a replacement run. Omitting `operation_id` with no retained operations returns
`NO_GAMEPLAY_TEST_OPERATION`.

`open_project`, `reload_project`, `launch_preview`, and
`verify_project_change` return `GAMEPLAY_TEST_RUN_IN_PROGRESS` while the shared
runner or MCP operation is active. They do not cancel the test or switch its
project out from under the preview exporter.

Failure to build, write, read back, or hash-verify `harness-api.d.ts` fails the
owning catalog operation through the existing
`ProjectSourceCatalogGenerationError`. Progress identifies
`catalog-harness-api-building`, `catalog-harness-api-writing`, or
`catalog-harness-api-verifying` so MCP and save diagnostics identify the exact
artifact. `generate-catalogs` never reports `catalogsRegenerated: true` with a
missing or unverified harness declaration.

## Security

- The run tool selects only tests already owned by the active project model.
- The `file` value is compared to canonical descriptors and is never passed to
  `fs`, resolved as a host path, or evaluated as source.
- Inline JavaScript and arbitrary output paths are not accepted.
- Existing gameplay-test preview isolation and debugger command restrictions
  remain in force.
- Operation errors omit stacks and non-JSON-safe error properties.
- Responses contain no screenshot bytes, filesystem contents, raw WASM
  wrappers, preview renderer objects, or DOM objects.
- The generated harness declaration exposes a reviewed allowlist. It does not
  reveal underscore-prefixed state, debugger transport, raw renderer/DOM
  objects, or private runtime helpers merely because they exist on the runtime
  class.

Gameplay-test scripts are project-authored code and retain the same runtime
capabilities they have when run from the editor or CLI. This MCP adapter does
not expand those capabilities.

## Performance Implications

Starting a run adds a small descriptor projection and operation record. Tests
still execute sequentially through the existing globally serialized runner.
No additional preview is launched per test.

Progress updates replace scalar fields in one operation record. Completed
results reuse runtime-bounded data and omit screenshots. Fetch responses page
at most 100 tests. Retention is capped by operation count and age, preventing
unbounded history across a long editor session.

The canonical descriptor helper avoids decomposing unrelated project files for
selection. It allocates only the test descriptors and paths already required by
multi-file decomposition.

`harness-api.d.ts` is one small deterministic text artifact. Its reviewed body
is project-independent except for dependency hashes, so generation adds one
hash and one sequential verified write and does not scan runtime source. It is
covered by the same cached catalog workflow as the existing declarations.

## Rollout

Add discovery, dispatch, operation ownership, runner callbacks, the generated
harness declaration, its bundled reference, tests, and skill guidance in one
change so a published name can never lack a renderer implementation or
authoring contract. No feature flag or deprecated alias is needed because the
surface is additive and gameplay tests are already feature-gated by their
presence in a project.

## Tests and Verification

Focused tests must cover:

- exact 25-tool discovery under every permission combination;
- catalogue schemas, annotations, examples, and capability category;
- one-file selection by exact encoded `file`;
- all-tests ordering across project and extension scopes;
- rejection of prefixes, traversal, nesting, aliases, missing files, and no
  tests;
- descriptor/file equivalence with the multi-file writer, including filename
  collisions;
- immediate operation creation and UUID identity;
- `queued` to `launching` to `running` to terminal lifecycle;
- partial results while a later test runs;
- pass/fail/error/stopped/timeout aggregation and `all_passed` semantics;
- operation-level failure with reservation cleanup;
- one-active-operation enforcement and preview-workflow exclusion;
- result pagination, default/latest lookup, expiration, and ten-operation
  retention;
- stable operation state when the React bridge is recreated;
- exactly-once runner callbacks for normal and synthetic results; and
- existing `.gdevelop/gameplay-test-results.json` persistence without authored
  source changes;
- deterministic generation and hash verification of
  `.gdevelop/harness-api.d.ts` on save, open/reload, explicit generation, and
  validation catalog refresh;
- representative async test bodies type-check against the three generated
  declarations while misspelled/unsupported harness members fail;
- the generated harness declaration contains the reviewed public API and no
  private runner members;
- MCP catalog descriptions, paths, progress, and receipts consistently report
  three declarations and six generated artifacts; and
- the bundled skill routes gameplay-test changes to the dedicated reference,
  lists both MCP tools, and requires terminal `all_passed` evidence.

Run the focused editor suites:

```text
cd newIDE/app
npm test -- --runTestsByPath \
  src/ProjectsStorage/MultiFileProjectFormat/index.spec.js \
  src/ProjectsStorage/JavaScriptAuthoringApi.spec.js \
  src/ProjectsStorage/LocalFileStorageProvider/LocalMultiFileProject.spec.js \
  src/GameplayTests/GameplayTestRunner.spec.js \
  src/Mcp/McpGameplayTestOperations.spec.js \
  src/Mcp/McpToolCatalog.spec.js \
  src/Mcp/McpEditorBridge.spec.js \
  --watchAll=false
```

Also run focused Flow, ESLint, Prettier, `git diff --check`, and the relevant
existing local result-persistence tests. After code changes, start the required
Windows desktop build-and-launch script as a detached process and do not wait
for it.

## Alternatives Considered

### One blocking run-and-return tool

Rejected because all-tests runs can exceed MCP request timeouts and a caller
interruption would lose the only response containing results.

### Add start/status modes to one tool

Rejected because the requested API explicitly separates execution from result
retrieval, and two narrow schemas are easier to discover and validate.

### Select by test name and optional extension

Rejected because names alone are ambiguous across scopes and do not match the
file-first workflow. The canonical `tests.settings` `file` is unique and is the
identifier the caller already edits.

### Open and execute the supplied JavaScript path

Rejected because it would create an arbitrary local-file read/evaluation
surface and could diverge from the editor's in-memory project.

### Return screenshot base64 in MCP results

Rejected for the first version because even bounded images multiply response
and retained-memory size for all-tests runs. The final frozen frame remains
available through the existing screenshot tool.

### Persist full operation results to `.gdevelop`

Rejected because the existing file intentionally owns small latest-run
summaries, while MCP operation polling needs transient progress and paginated
details. A new on-disk history format is unnecessary for the requested tools.

### Create a second MCP-specific test runner

Rejected because it would duplicate preview launch, source resolution,
timeouts, state inspection, result persistence, and stop semantics and would
inevitably drift from editor and CLI behavior.

### Put harness declarations in `runtime-api.d.ts`

Rejected because gameplay-test scripts have a distinct execution context and
global `harness` value. A dedicated artifact is easier for the skill and test
editor to load without implying that harness helpers are available to ordinary
JavaScript events.

### Link only to the official online gameplay-test guide

Rejected because the bundled skill must work offline and must describe this
branch's strict version 5 file layout, generated declaration, and MCP tools.
The official guide supplies the user-facing testing model; the local reference
remains authoritative for branch-specific workflow and points back to it.

### Generate declarations by parsing the runtime TypeScript file at startup

Rejected because non-underscore runtime methods are not automatically approved
authoring APIs, TypeScript source is not guaranteed to be packaged as an input,
and automatic extraction could expose internal types. A reviewed declaration
builder plus regression tests makes the public boundary explicit.

## Open Questions

None. The initial contract deliberately keeps execution to one canonical file
or all files, uses the shared runner, suppresses screenshots, and exposes
transient paginated results through a separate query tool.
