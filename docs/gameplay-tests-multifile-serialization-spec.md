# Gameplay test sources in the multi-file project format

- **Status:** Approved and implemented version 5 contract
- **Target multi-file format:** 5, amended in place
- **Primary implementation:** `newIDE/app/src/ProjectsStorage`
- **Scope:** Multi-file authoring sources only

## 1. Summary and decision

Multi-file format version 5 stores every gameplay test's metadata in one
project-root `tests.settings` file and every test's JavaScript body into a
separate `.js` file below the project-root `tests/` directory.

The representative source tree is:

```text
project.gdevelop
resources.settings
constants.toml
tests.settings
tests/
  Player%20can%20jump.js
  Combat%20-%20Enemy%20takes%20damage.js
.gdevelop/
  gameplay-test-results.json       # ignored local editor state
```

`tests.settings` owns both project tests and events-function-extension tests.
Project and extension owner settings no longer contain a legacy `tests`
array. Each test record has a canonical root-relative `tests/...js` `file`
path. During composition, the adapter reads that JavaScript file and
reconstructs the current legacy serializer shape with the JavaScript text
inline. The existing Core model, test runner, preview, export, and legacy JSON
formats continue to consume inline source text.

Persisted `lastRunStatus`, `lastRunAt`, `lastRunDurationMs`, and
`lastRunFramesExecuted` values are not authored project settings. For local
multi-file projects they are stored only in the ignored
`.gdevelop/gameplay-test-results.json` editor-state file and hydrated into the
in-memory test model after project composition.

This ownership change does not bump the multi-file format version. Gameplay
tests are a new feature in this codebase, so their earlier inline multi-file
projection is not a compatibility contract. Earlier version 5 readers and
writers that do not understand test sources are outside this feature's
compatibility surface.

## 2. Problem

At the legacy serializer boundary, `gd::Test::SerializeTo` serializes a test as metadata plus an inline
multiline `source` string. A `tests` array can be owned by both:

- `gd::Project`; and
- `gd::EventsFunctionsExtension`.

Before this contract was implemented, the multi-file decomposer did not split
either array:

- project tests remain in `project.gdevelop` because `tests` is not a project
  split field;
- extension tests remain in `extensions/<Extension>/extension.settings`
  because only functions, objects, and behaviors are removed from extension
  metadata;
- the JavaScript body therefore remains embedded in TOML instead of being an
  independently editable source file.

This makes test scripts harder to review, edit, diff, and discover as code. It
also gives test bodies different physical ownership from other authored logic
sources.

## 3. Goals

1. Store all gameplay test metadata in the fixed root file `tests.settings`.
2. Store exactly one JavaScript source file per test below root `tests/`.
3. Use canonical project-root-relative `tests/...js` paths, without a URI
   scheme, in each test's `file` field.
4. Support project-scoped and extension-scoped tests without duplicate
   ownership in project or extension settings.
5. Preserve test container order, names, types, descriptions, and source text
   exactly through decompose/compose.
6. Keep the existing in-memory `gd::Test::source` value as JavaScript text so
   the editor and test runner do not become filesystem-dependent.
7. Store last-run summaries only as ignored local state below `.gdevelop/`,
   never in `tests.settings` or test scripts.
8. Preserve normalized authored-project equivalence before any source write,
   excluding local last-run state from that comparison.
9. Make rename, delete, and save operations transactional and recoverable.
10. Reject missing, duplicate, orphaned, unsafe, or ambiguously owned sources
   instead of guessing or dropping data.
11. Include the new settings/source contracts in generated authoring catalogs
    and local project modification tracking.

## 4. Non-goals

1. This change does not alter `gd::Test`, `gd::TestsContainer`,
   `gd::Project`, or `gd::EventsFunctionsExtension` legacy JSON serialization.
2. It does not change gameplay-test JavaScript APIs, execution semantics,
   timeout behavior, result computation, or editor UI.
3. It does not make test scripts runtime resources or include them in exported
   games. Existing project stripping remains authoritative.
4. It does not execute or type-check JavaScript while loading a project.
5. It does not add imports, includes, globbing, or arbitrary filesystem paths
   to `tests.settings`.
6. It does not persist logs or screenshots. The compact last-run summary is
   local editor state and is never project source or source-controlled data.
7. It does not add native multi-artifact storage to cloud/browser providers
   that have not negotiated that capability.

## 5. Current compatibility boundary

The authoritative legacy shape remains:

```json
{
  "tests": [
    {
      "name": "Player can jump",
      "type": "gameplay",
      "description": "",
      "source": "// JavaScript source text"
    }
  ],
  "eventsFunctionsExtensions": [
    {
      "name": "Combat",
      "tests": []
    }
  ]
}
```

Core continues to serialize and unserialize this shape for single-file JSON,
undo snapshots, model cloning, and in-memory editor operations. The multi-file
adapter is the only layer that projects inline `source` text to and from a
`.js` source reference. Core may also serialize the four optional `lastRun*`
fields, but the multi-file adapter removes them from authored source and the
local storage layer hydrates them from ignored editor state.

## 6. Version 5 physical ownership

### 6.1 Fixed settings owner

`tests.settings` is a fixed, independently discovered root settings
file. No other settings file references it. A version 5 writer always emits
the file, including for projects with no tests.

The file owns:

- the ordered project test container;
- every ordered extension test container;
- authored test metadata; and
- the association from a test identity to its JavaScript source path.

Canonical version 5 output forbids `tests` in both `project.gdevelop` and
`extensions/<Extension>/extension.settings`. Presence in either location is an
ownership conflict, even if the value is empty or equivalent.

### 6.2 JavaScript source owners

All JavaScript sources are direct children of `tests/`. Subdirectories below
`tests/` are forbidden. Canonical source paths are:

```text
tests/<ProjectTest>.js
tests/<Extension> - <ExtensionTest>.js
```

For a project test, the preferred basename is its test name. For an extension
test, the preferred basename is `<Extension> - <Test>`, keeping the owning
extension visible without a directory. The basename uses the existing
`encodeManagedName` rules: Unicode NFC, uppercase UTF-8 percent encoding where
required, and portable Windows names. If preferred basenames collide after
case/Unicode normalization, every colliding basename receives a deterministic
suffix derived from the full logical identity (`project + test` or
`extension + extension name + test`). A remaining hash collision is an error.
This allocation is independent of record order. The recorded `file` path is
the authoritative association during composition.

Every test owns exactly one `.js` path and every managed `.js` file directly
below `tests/` is owned by exactly one test. Sharing one source file between
tests, pointing outside `tests/`, using a subdirectory, or using another
extension is invalid.

## 7. `tests.settings` schema

### 7.1 Project and extension examples

```toml
kind = "tests"
settingsFormatVersion = 5

[[tests]]
scope = "project"
order = 0
name = "Player can jump"
type = "gameplay"
description = "The player jumps after Space is pressed."
file = "tests/Player%20can%20jump.js"

[[tests]]
scope = "extension"
extension = "Combat"
order = 0
name = "Enemy takes damage"
type = "gameplay"
description = ""
file = "tests/Combat%20-%20Enemy%20takes%20damage.js"
```

The canonical empty file is:

```toml
kind = "tests"
settingsFormatVersion = 5
tests = [ ]
```

### 7.2 Field contract

| Field | Contract |
| --- | --- |
| `kind` | Required root marker; exactly `"tests"`. |
| `settingsFormatVersion` | Required root marker; exactly `5`. |
| `scope` | Required; `"project"` or `"extension"`. |
| `extension` | Required only for extension scope and forbidden for project scope. It must resolve to one loaded extension name. |
| `order` | Required non-negative integer, contiguous and unique inside its project or named-extension test container. |
| `name` | Required string, unique inside its owning test container. |
| `type` | Required string; canonical current output is `"gameplay"`, while known serialized future values are preserved. |
| `description` | Required string, including an empty string. |
| `file` | Required canonical root-relative `tests/...js` path matching the declared scope. URI schemes are forbidden. |

Unknown root fields, unknown test fields, TOML date values, non-finite numbers,
and mixed empty/record forms are errors. Record order in the TOML file is
canonical: project tests by `order`, then extensions by their project extension
order, with each extension's tests by `order`.

The retired authored field name `source` is invalid in `tests.settings`; the
path field is named `file`. The legacy in-memory `gd::Test::source` property
continues to hold the JavaScript text itself.

The fields `lastRunStatus`, `lastRunAt`, `lastRunDurationMs`, and
`lastRunFramesExecuted` are explicitly forbidden in `tests.settings`.

### 7.3 JavaScript text contract

The `.js` file is UTF-8 text and may be empty. Decomposition writes the
in-memory source string directly; composition reads it directly. The adapter
does not add a final newline, normalize line endings, reformat JavaScript, or
strip comments. This exact-text rule is required for legacy round-trip
verification.

The source is treated as data during open, save, catalog generation, and
validation. It executes only through the existing explicit gameplay-test run
flow.

### 7.4 Ignored last-run state

The last-run summary for a local multi-file project is stored in:

```text
.gdevelop/gameplay-test-results.json
```

It is editor state, is covered by the project template's `.gdevelop/` ignore
rule, and is not part of the managed multi-file source tree. Its version 1
shape is:

```json
{
  "format": "gdevelop-gameplay-test-results",
  "version": 1,
  "tests": [
    {
      "scope": "project",
      "name": "Player can jump",
      "lastRunStatus": "passed",
      "lastRunAt": 1786291200000,
      "lastRunDurationMs": 5400,
      "lastRunFramesExecuted": 320
    },
    {
      "scope": "extension",
      "extension": "Combat",
      "name": "Enemy takes damage",
      "lastRunStatus": "failed",
      "lastRunAt": 1786291300000,
      "lastRunDurationMs": 3200,
      "lastRunFramesExecuted": 180
    }
  ]
}
```

Only tests with a non-empty last-run status have records. `scope`,
`extension`, and `name` identify the authored test; source filenames are not
identities. Project records forbid `extension`, while extension records require
an extension that still exists. Records use the same canonical scope and order
as `tests.settings`.

The result file is written atomically after a gameplay-test batch finishes. It
does not mark authored project sources as modified and does not participate in
the source transaction journal. A missing file means every test is
`never-run`. Unknown, stale, or malformed records are ignored with an editor
diagnostic and never prevent the authored project from opening. The next
successful result write prunes stale records.

## 8. Decomposition

`decomposeLegacyProjectToFiles` performs these steps:

1. Clone and validate the legacy project object.
2. Extract `project.tests`, treating an omitted container as empty.
3. Extract `tests` from every events-function extension before writing that
   extension's metadata.
4. Remove all four `lastRun*` fields from each authored test projection.
5. For each test, validate the remaining legacy record and allocate a canonical
   flat source path from its scope and name.
6. Write the inline `source` string to that path.
7. Write a `tests.settings` record containing all remaining authored test fields,
   `scope`, `order`, and the source path in `file`.
8. Omit `tests` from `project.gdevelop` and every `extension.settings` file.
9. Emit the canonical empty `tests.settings` file when there are no tests.
10. Compose the staged source map back to a legacy project and require authored
    normalized equivalence, with `lastRun*` fields removed from both sides,
    before filesystem writes.

The extraction must distinguish an absent test container from invalid values.
A present non-array test container, malformed record, or non-string source is
a hard error. The local storage writer separately extracts valid last-run
summaries for `.gdevelop/gameplay-test-results.json`; the multi-file source
decomposer never returns that editor-state file.

## 9. Composition

`composeLegacyProjectFromFiles` performs these steps:

1. Require version 5 root markers and `tests.settings`.
2. Discover and parse `tests.settings` independently at its fixed path.
3. Validate its marker, strict schema, container-local identity/order, scope,
   referenced extension names, `file` field, and one-to-one source ownership.
4. Reject inline `tests` ownership in the project or extension settings.
5. Resolve every `file` path against the project root with the standard path
   and symlink safety checks.
6. Read the JavaScript text and replace the `file` path with inline `source`
   text in the
   temporary legacy test record.
7. Reconstruct `project.tests` and each extension's `tests` array in their
   declared order without any `lastRun*` fields. Empty arrays may be omitted to
   match the current Core serializer's canonical shape.
8. Return the authored legacy project to the local storage opener.
9. The local storage opener reads the optional bounded
   `.gdevelop/gameplay-test-results.json`, matches valid records by scope and
   name, and overlays the four last-run fields onto the temporary legacy test
   records.
10. Pass the hydrated legacy project to the existing `gd::Project`
    unserializer.

No Core model or gameplay-test UI reads `tests.settings`, a `.js` path, or the
result-state file directly.

## 10. Versioning and compatibility policy

### 10.1 Version policy

`MULTI_FILE_FORMAT_VERSION` remains exactly 5. Existing root and component
markers remain 5, and `tests.settings` also uses
`settingsFormatVersion = 5`.

Gameplay tests are new in this development line. The test-source ownership
defined here amends the version 5 authoring contract in place; the temporary
inline projection is not retained as an alternate version 5 representation.
The composer rejects:

- a missing `tests.settings` file;
- inline `tests` in `project.gdevelop` or `extension.settings`;
- any tests settings marker other than 5; and
- mixed inline and referenced-source ownership.

Earlier version 5 readers may not understand `tests.settings` or managed test
`.js` files. Forward or backward interoperability with those readers is not
provided. Implementations must not add detection, fallback, conversion, or a
v5-to-v5 migration for the temporary inline representation.

### 10.2 Legacy JSON and storage providers

Single-file `.json` projects remain unchanged. Importing one into a multi-file
folder writes version 5 `tests.settings` and `.js` sources directly and moves
any valid `lastRun*` summaries to
`.gdevelop/gameplay-test-results.json`. Generated `.gdevelop/game.json` and an
explicit legacy compatibility export compose inline JavaScript but omit local
last-run summaries; the dedicated result-state file remains their sole
multi-file-project persistence location.

Cloud/browser providers that store one serialized project continue using the
legacy inline representation. They do not receive filesystem paths unless
they explicitly implement the multi-artifact storage capability.

## 11. Save, rename, delete, and external edits

- Editing only JavaScript changes only that test's `.js` source after canonical
  byte comparison.
- Editing test metadata or order changes `tests.settings`, not the JavaScript
  source.
- Completing a test batch atomically updates only
  `.gdevelop/gameplay-test-results.json`. It does not rewrite
  `tests.settings`, test scripts, `project.gdevelop`, or extension settings,
  and it does not mark authored project sources as unsaved.
- Renaming a test updates its record and source path, writes the new `.js` file,
  and removes the old managed path in one verified transaction.
- Renaming an extension updates its test records and renames its flat,
  extension-qualified JavaScript sources in the same extension rename
  transaction.
- Deleting a test removes its record and only its previously discovered
  managed source path.
- Test and extension renames update matching local result identities; deleting
  a test removes its local result. Stale result records are harmless and are
  pruned on the next successful state write.
- Reordering tests changes `order` fields and canonical record order without
  rewriting unchanged JavaScript sources.
- An external change to `tests.settings` or any managed `.js` file participates
  in local project modification-time detection and the existing reload prompt.
- A malformed external edit leaves the last valid in-memory project active and
  reports a persistent diagnostic.

Deletion never recursively empties `tests/`. Empty managed directories may be
removed only by validated inside-root cleanup. Unknown files are preserved;
an unknown `.js` in a reserved managed tests namespace is reported as an
orphan instead of being adopted or silently deleted.

## 12. Validation and diagnostics

The implementation adds stable diagnostics equivalent to:

| Code | Meaning |
| --- | --- |
| `MULTIFILE_MISSING_TESTS_SETTINGS` | A version 5 tree has no root `tests.settings`. |
| `MULTIFILE_INVALID_TESTS_SETTINGS` | The root marker or strict tests schema is invalid. |
| `MULTIFILE_TEST_OWNERSHIP_CONFLICT` | Tests are present in both `tests.settings` and a project/extension owner. |
| `MULTIFILE_INVALID_TEST_SCOPE` | Scope fields or the extension association are invalid. |
| `MULTIFILE_DUPLICATE_TEST_IDENTITY` | A name or order collides inside one test container. |
| `MULTIFILE_DUPLICATE_TEST_SOURCE` | Two records resolve to the same source path. |
| `MULTIFILE_INVALID_TEST_SOURCE` | A source is non-canonical, outside the reserved namespace, or not `.js`. |
| `MULTIFILE_MISSING_TEST_SOURCE` | A referenced JavaScript source is missing. |
| `MULTIFILE_ORPHAN_TEST_SOURCE` | A managed JavaScript file below `tests/` has no owning record. |
| `GAMEPLAY_TEST_RESULTS_INVALID` | Ignored result state is malformed, oversized, stale, or references no authored test; project opening continues. |
| `GAMEPLAY_TEST_RESULTS_WRITE_FAILED` | The local result-state atomic write failed; the current session retains the result in memory. |

Diagnostics identify the settings path, test scope/name, referenced source path,
and TOML line/column where available. There is no settings-wins,
project-wins, extension-wins, or timestamp-wins fallback.

Result-state diagnostics are non-blocking because `.gdevelop/` is derived local
state rather than authored project source. Invalid state is never copied into
the Core model.

## 13. Security and resource limits

1. A serialized test `file` value is a project-root-relative path with exactly two
   segments: `tests/<Basename>.js`. URI schemes, authorities, queries,
   fragments, leading slashes, colons, empty/`.`/`..` segments, backslashes,
   drive/UNC prefixes, traversal, normalized collisions, and project-root or
   symlink escapes are rejected.
2. `tests.settings` uses the ordinary 16 MiB managed-source limit.
3. Each test `.js` file uses the ordinary 16 MiB managed-source limit.
4. Test settings and scripts count toward the existing 10,000 managed-file and
   256 MiB total composed-source limits.
5. Discovery is restricted to the fixed `tests.settings` path and direct `.js`
   children of root `tests/`. It does not recursively treat arbitrary project
   `.js` files as managed tests, and it rejects directories below `tests/`.
6. All source paths are resolved and all inputs are bounded before composition
   or transaction staging.
7. Loading a test script never evaluates it.
8. `.gdevelop/gameplay-test-results.json` has a 4 MiB limit and at most 10,000
   records. It is read only from that fixed inside-root path, parsed as strict
   JSON data, and never treated as a managed authored source.

## 14. Performance implications

The change adds one small TOML read and one JavaScript read per gameplay test.
Total authored bytes are approximately unchanged, while editing one script no
longer parses or rewrites the containing project or extension settings file.

The initial implementation may read test sources with the existing bounded
managed-source queue. It must not introduce an unbounded `Promise.all`. Source
hashes and canonical byte comparison prevent unchanged scripts from being
rewritten. Projects without tests add only the canonical empty
`tests.settings` file.

The bounded result-state JSON is read once during local project open and
written once after a completed test batch, not once per frame or assertion.
It is excluded from source hashing, composition limits, and project reload
timestamps.

## 15. Affected layers and files

### 15.1 Multi-file projection

- `newIDE/app/src/ProjectsStorage/MultiFileProjectFormat/index.js`
  - split fields, constants, schema validation, source-path
    allocation, decompose/compose, last-run-field stripping, authored
    equivalence normalization, ownership conflicts, and diagnostics;
- `newIDE/app/src/ProjectsStorage/MultiFileProjectFormat/index.spec.js`
  - schema, round-trip, and rejection tests.

### 15.2 Local filesystem, transactions, and reload

- `newIDE/app/src/ProjectsStorage/LocalFileStorageProvider/LocalMultiFileProject.js`
  - fixed `tests.settings` discovery, `.js` reference discovery, bounded reads,
    orphan discovery, bounded/atomic result-state I/O and hydration,
    transactions, and obsolete-source handling;
- `newIDE/app/src/ProjectsStorage/LocalFileStorageProvider/LocalMultiFileProject.spec.js`
  - real filesystem, result-state hydration/persistence, rename/delete, limits,
    and recovery tests;
- `newIDE/app/src/ProjectsStorage/LocalFileStorageProvider/LocalProjectFileModificationTime.js`
  and its spec
  - root `tests.settings`, root `tests/`, and `.js` modification tracking.

### 15.3 Test-run completion integration

- `newIDE/app/src/GameplayTests/GameplayTestRunner.js` and its spec
  - report the completed batch to the registered persistence callback after
    updating in-memory test summaries;
- `newIDE/app/src/MainFrame/index.js`
  - persist multi-file local results without triggering authored unsaved
    changes, while retaining existing behavior for other storage providers;
- the ProjectsStorage interface and local provider adapter, if needed, to
  expose the fixed result-state write without leaking filesystem paths into the
  test runner.

### 15.4 Generated authoring contract

- `newIDE/app/src/ProjectsStorage/ProjectSourceCatalog.js`
  - add the `tests` settings kind, complete field schema, scope rules, and the
    referenced-JavaScript source contract, with every `lastRun*` field
    forbidden;
- `newIDE/app/src/ProjectsStorage/ProjectSourceCatalog.spec.js`
  - catalog shape and validation;
- generated `.gdevelop/settings-catalog.json`
  - regenerated on save, never hand-edited.

### 15.5 Normative documentation

Updated with the implementation:

- `docs/Architecture.md`;
- `docs/gdevelop-new-formats-spec.md`;
- `docs/embedded-layout-settings-format-spec.md` as the controlling version 5
  ownership contract;
- cross-references in the layout and IfDo specifications where they describe
  the complete managed source extension/ownership set.

### 15.6 Intentionally unchanged layers

`Core/GDCore/Project/Test.*`, `TestsContainer.h`, `Project.cpp`,
`EventsFunctionsExtension.cpp`, GDevelop.js bindings, and exported runtime data
remain unchanged unless implementation uncovers a separate defect. Their
inline in-memory/legacy contract is the compatibility boundary.

## 16. Verification requirements

### 16.1 Multi-file adapter unit tests

- project test round-trip with empty and multiline JavaScript;
- extension test round-trip;
- project and extension tests with the same name but different scopes;
- multiple tests preserving independent contiguous order;
- descriptions and explicit rejection of every `lastRun*` field in
  `tests.settings`;
- Unicode, spaces, Windows-reserved names, and normalized path collisions;
- exact source text, including comments, CRLF, and no final newline;
- canonical empty `tests.settings`;
- no inline tests in project or extension settings;
- missing settings/source, duplicate source, orphan source, wrong extension,
  unsafe path, unknown fields, invalid order, and unresolved extension errors;
- legacy object -> v5 files -> legacy object authored equivalence after
  removing local last-run summaries from both sides.

### 16.2 Filesystem and transaction tests

- discover referenced `.js` files and reserved-namespace orphans;
- open/save/reopen with project and extension tests;
- edit only a script without rewriting unrelated settings;
- test rename, extension rename, reorder, and delete;
- interrupted commits at script, `tests.settings`, extension settings, and
  `project.gdevelop` steps;
- project-root containment, symlink escape, case/Unicode collision, per-file
  size, total size, and managed-file count limits;
- modification-time detection for `tests.settings` and flat test scripts;
- absent, valid, malformed, stale, oversized, and over-count
  `.gdevelop/gameplay-test-results.json` inputs;
- atomic result-state writes after a batch, including write failure with
  in-memory results retained;
- result identity updates/pruning after test and extension rename/delete;
- result writes do not change any authored source or authored-project
  modification timestamp;
- preserve unknown non-managed files below the project root.

### 16.3 Import and integration tests

- version 5 project or extension settings with inline tests fail before writes;
- missing `tests.settings` fails without fallback or conversion;
- single-file JSON import writes version 5 test sources and extracts last-run
  summaries into ignored result state;
- generated `.gdevelop/game.json` and legacy compatibility export restore
  inline sources but omit local last-run summaries;
- gameplay test runner receives JavaScript text, not a path;
- valid local summaries hydrate project and extension tests before the editor
  renders them;
- completing a local multi-file test batch persists result state without
  triggering authored unsaved changes;
- preview/export stripping behavior remains unchanged;
- repository example compatibility and generated catalog validation remain
  green.

Relevant editor checks are Flow, lint, formatting, the focused Jest suites,
and the required Windows desktop build/launch dispatch after implementation.

## 17. Implementation sequence

1. Approve this ownership, schema, path, and strict version 5 contract.
2. Implement the version 5 projection and focused adapter tests.
3. Implement filesystem discovery, transaction, reload tracking, and ignored
   result-state hydration/persistence with focused filesystem tests.
4. Wire test-run completion to result-state persistence without authored
   unsaved changes.
5. Update settings catalog generation and normative format documentation.
6. Run focused and broad editor checks, then dispatch the required detached
   Windows desktop build/launch.

The version constant remains 5. The reader, writer, filesystem discovery,
catalog, and tests land together so there is no transitional version 5 state
that accepts or emits inline test ownership.

## 18. Alternatives considered

### 18.1 Keep inline source in owner settings

Rejected because it does not provide independently editable JavaScript files
and does not satisfy the requested ownership.

### 18.2 Put only project tests in root `tests.settings`

Rejected because extension tests use the same `gd::Test` contract. Leaving
them inline would create two incompatible physical representations and retain
large JavaScript strings in extension metadata.

### 18.3 Put extension tests below each extension

Owner-local `extensions/<Extension>/tests.settings` and test scripts would fit
extension locality, but it does not satisfy the requested single dedicated
root `tests.settings`. The proposed scope fields keep ownership explicit while
centralizing test discovery.

### 18.4 Derive the script path without a `file` field

Rejected because the requested format explicitly associates `file` with a
JavaScript file and an explicit root-relative path gives precise
missing/duplicate diagnostics.

### 18.5 Change `gd::Test::source` to store a path

Rejected because it would make the Core model and runner dependent on local
filesystem layout, break single-file/cloud storage, and widen the change into
runtime/editor APIs.

### 18.6 Bump the multi-file format to version 6

Rejected because gameplay tests are new in this development line. The version
5 test-source contract is amended in place, and compatibility with earlier
version 5 readers or their temporary inline projection is explicitly out of
scope.

### 18.7 Keep last-run summaries in `tests.settings`

Rejected because execution results are machine-local, frequently changing
editor state. Storing them in authored settings would dirty source-controlled
project files whenever a test runs. The dedicated ignored
`.gdevelop/gameplay-test-results.json` file isolates this state.

## 19. Review decisions

Approval of this specification confirms these defaults:

1. one root `tests.settings` owns both project and extension tests;
2. all scripts are direct children of `tests/`; project scripts use the test
   name and extension scripts use `<Extension> - <Test>` as their preferred
   basename;
3. `tests.settings` is always present, including when empty;
4. JavaScript text round-trips byte-for-text without canonical formatting;
5. the multi-file format remains version 5, with no compatibility reader or
   migration for earlier version 5 test ownership;
6. no `lastRun*` field is allowed in authored sources; local multi-file results
   live only in `.gdevelop/gameplay-test-results.json`; and
7. Core and single-file JSON serialization remain inline and unchanged.

Implementation must not begin until this specification is explicitly approved
or revised and then approved.
