# GDevelop Project Entry File Rename

## `project.settings` to `project.gdevelop`

**Status:** Implemented breaking change

**Canonical entry file:** `project.gdevelop`

**Canonical entry URI:** `game://project.gdevelop`

**Desktop file extension:** `.gdevelop`

**Desktop MIME type:** `application/x-gdevelop-project`

## 1. Problem

The multi-file project format currently uses `project.settings` as its root
entry file. This is consistent with component fragments such as
`scene.settings` and `extension.settings`, but it is weak as the user-facing
project entry:

- `.settings` is generic and does not identify GDevelop.
- Operating systems cannot give the root entry a useful GDevelop-specific file
  association without also associating every unrelated `.settings` file.
- The root entry is visually difficult to distinguish from the component
  settings fragments that must not be opened as projects.
- Double-clicking the entry is not a packaged desktop application contract.

The entry file is part of the serialized multi-file format. Renaming it changes
canonical source URIs, local open/save behavior, migration output, editor and
MCP diagnostics, and desktop packaging. This is therefore a deliberate
breaking format change rather than a cosmetic UI rename.

## 2. Goals

1. Rename the only valid multi-file project entry from `project.settings` to
   `project.gdevelop`.
2. Rename its only valid canonical URI from `game://project.settings` to
   `game://project.gdevelop`.
3. Reserve `.gdevelop` for a user-facing GDevelop project entry while keeping
   `.settings` for component settings fragments.
4. Make installed desktop builds register `.gdevelop` files as editable
   GDevelop projects.
5. Make double-clicking `project.gdevelop` open that project in GDevelop on
   Windows, macOS, and supported Linux desktop packages.
6. Update all repository documentation, authoring instructions, diagnostics,
   catalogs, examples, and tests to describe only the new entry name.
7. Keep the existing `.gdevelop/` generated editor-state directory unchanged.

## 3. Non-goals

- Supporting `project.settings` as an alias or legacy entry.
- Automatically renaming an existing `project.settings`.
- Discovering or importing an old multi-file tree.
- Writing both entry names.
- Adding a format-version migration for the old entry name.
- Renaming component fragments such as `scene.settings`,
  `resources.settings`, `extension.settings`, or `function.settings`.
- Renaming the generated `.gdevelop/` directory.
- Changing the TOML schema or the ownership split beyond the entry URI.
- Associating generic `.settings`, `.json`, or `.gdg.json` files with the
  desktop application as part of this change.

## 4. Current behavior

- `project.settings` is hard-coded as the multi-file entry name and
  `game://project.settings` as its source URI.
- New local projects and Save As choose a project folder and write
  `project.settings`.
- Opening legacy JSON migrates it to a sibling multi-file tree rooted at
  `project.settings`.
- File watching, modification-time calculation, autosave, transaction ordering,
  generated catalogs, recent-project metadata, MCP validation, and preview
  composition all identify the project through that path.
- The local picker exposes `.settings` and `.json`.
- The Electron packaging configuration has no `.gdevelop` file association.
- Windows and Linux desktop launches can already receive a positional path.
  The second-instance handler forwards positional arguments into a new editor
  window.
- macOS has no `open-file` event handler, which is required for Finder document
  launches, especially when the application is already running.

## 5. Proposed format contract

### 5.1 Canonical entry

Every multi-file project root contains exactly:

```text
MyGame/
  project.gdevelop
  resources.settings
  constants.toml
  scenes/
  extensions/
  .gdevelop/
```

`project.gdevelop` remains UTF-8 TOML and retains the existing project-root
payload and format markers. The custom extension changes identification, not
the serialization language.

The canonical managed URI is:

```text
game://project.gdevelop
```

All generated catalogs, diagnostics, examples, MCP descriptions, authoring
instructions, transaction journals, autosave paths, and internal source maps
must use this URI.

### 5.2 Exact-name rule

The multi-file entry must be named exactly `project.gdevelop` in canonical
output. A different basename ending in `.gdevelop` is not a conforming entry.
Desktop operating systems associate extensions rather than exact basenames, so
GDevelop may be launched for another `*.gdevelop` file; the local opener must
then reject it with an actionable invalid-entry error instead of treating it as
JSON.

Path routing may compare case-insensitively where required by the host
filesystem, but all writers and documentation emit the lowercase canonical
name.

### 5.3 No compatibility

`project.settings` is not recognized as a multi-file entry after this change:

- it is not shown by the project picker;
- it is not accepted by the multi-file opener;
- it is not searched for beside a legacy JSON project;
- it is not redirected to `project.gdevelop`;
- it is not renamed, copied, or deleted automatically;
- it is not accepted by MCP project-file tools;
- it is not watched or included in multi-file modification times;
- it is not accepted as an autosave entry;
- no dual-read or dual-write transition exists.

An existing old-format tree must be manually recreated or explicitly renamed
outside GDevelop before it can be opened. Renaming only the physical file is
sufficient only when every persisted or generated
`game://project.settings` marker in that tree has also been changed to
`game://project.gdevelop`.

Legacy single-file JSON remains a supported import input. Its one-time
conversion writes only `project.gdevelop`.

## 6. Desktop file association and launch behavior

### 6.1 Packaging

`newIDE/electron-app/electron-builder-config.js` registers one file
association:

```js
{
  ext: 'gdevelop',
  name: 'GDevelop project',
  description: 'GDevelop project',
  mimeType: 'application/x-gdevelop-project',
  role: 'Editor',
}
```

The application icon is used unless a dedicated document icon is supplied.
The association must be emitted for the configured Windows NSIS, macOS, and
Linux package targets supported by electron-builder.

### 6.2 Windows and Linux

Launching the installed executable with a `.gdevelop` document path passes that
path as the first positional project argument. The existing local storage
provider consumes it and opens the file.

When GDevelop is already running, the single-instance `second-instance`
handler must preserve the selected file path and open it in an editor window.
CLI `--run-command` routing remains unchanged.

### 6.3 macOS

The Electron main process registers `app.on('open-file', ...)` before the app
`ready` event:

1. Call `event.preventDefault()`.
2. Store received document paths while the application is starting.
3. On readiness, open the queued `project.gdevelop` path instead of creating an
   unrelated blank initial window.
4. For later `open-file` events, open the selected project in an editor window.
5. Preserve a path received before readiness even when multiple `open-file`
   events arrive; each distinct requested project follows the normal
   multi-window behavior.

The main process must publish the window-specific arguments before that
window's renderer reads them. The implementation must not depend on a single
mutable global argument object after multiple windows have been created.

### 6.4 Open-project behavior

The associated document path enters the same `LocalFileStorageProvider.onOpen`
path as File > Open. There is no separate parser or relaxed validation for
desktop launches. Invalid, missing, or noncanonical entries surface the normal
local-project open error.

## 7. Affected layers

### 7.1 Format projection

`newIDE/app/src/ProjectsStorage/MultiFileProjectFormat/index.js`

- Change `MULTI_FILE_ENTRY_NAME` to `project.gdevelop`.
- Change `MULTI_FILE_ENTRY_URI` to `game://project.gdevelop`.
- Update format-marker validation and all entry-specific diagnostics.
- Preserve the current TOML schema, compose/decompose behavior, ownership, and
  transaction-last ordering.

### 7.2 Local filesystem provider

Files under
`newIDE/app/src/ProjectsStorage/LocalFileStorageProvider/` must update:

- open routing and exact entry validation;
- picker filters;
- new-project and Save As destinations;
- legacy JSON conversion destinations and provenance behavior;
- autosave entry paths;
- file modification-time root files;
- local source discovery and entry-last transaction ordering;
- preview-generated project paths and recent-project metadata;
- divergence diagnostics for legacy JSON conversion.

Hard-coded entry strings should be replaced with the authoritative exported
entry constant where importing it does not create a dependency cycle.

### 7.3 Editor and MCP integration

Update entry checks, URIs, messages, and fixtures in:

- `newIDE/app/src/MainFrame`;
- `newIDE/app/src/Mcp`;
- `newIDE/app/src/ProjectsStorage/ProjectSourceCatalog.js`;
- storage-provider capability comments and public tool descriptions;
- the bundled `gd-project-template` authoring skill and its references.

Generated project catalogs must advertise `game://project.gdevelop`.

### 7.4 Desktop application

Update:

- `newIDE/electron-app/electron-builder-config.js` for file association;
- `newIDE/electron-app/app/main.js` for macOS document events and safe
  cold-start/active-app routing;
- argument or window-launch helpers extracted from `main.js` when needed for
  deterministic unit testing.

### 7.5 Documentation

Replace the old entry name and URI in all related repository documentation,
including:

- `AGENT.md`;
- `docs/Architecture.md`;
- `docs/gdevelop-new-formats-spec.md`;
- `docs/gdevelop-events-dsl-spec.md`;
- `docs/Constants.md`;
- bundled project authoring skill documentation and references.

After implementation, a repository-wide search excluding historical Git data
and dependencies must find no unintended `project.settings` occurrence. This
rename spec's description of the former name and explicit incompatibility is
the only intentional historical discussion.

## 8. Error handling

- Opening `project.gdevelop` with malformed TOML or invalid markers reports the
  existing source-aware parse/validation diagnostic using
  `game://project.gdevelop`.
- Opening a noncanonical `OtherName.gdevelop` reports that the multi-file entry
  must be named `project.gdevelop`.
- Opening a removed `project.settings` path is not routed as a multi-file
  project. No fallback reader attempts to interpret it as a supported entry.
- A desktop file-open event for a missing path reports the normal local open
  failure and must not crash the main process.
- Multiple desktop file-open events must not overwrite one another through
  shared global arguments.

## 9. Security and performance

The rename does not change project size limits, path containment, symlink
checks, TOML parsing, source ownership, or transaction recovery.

Desktop-provided paths are untrusted input. They must continue through the
existing local opener and canonical path-safety checks. The main process must
not read or parse the file solely to route the open event.

The only startup cost is registering and routing a document event. There is no
project-load or save-time performance impact.

## 10. Verification

### 10.1 Format and storage tests

Update existing tests and add focused assertions proving:

1. Decomposition emits `game://project.gdevelop` and never emits the old URI.
2. Composition requires the new URI and validates its format marker.
3. The local writer always creates `project.gdevelop`.
4. Save As and new-project location selection resolve to
   `<chosen-folder>/project.gdevelop`.
5. The open picker accepts `.gdevelop` and legacy `.json`, but not `.settings`.
6. Legacy JSON migration creates `project.gdevelop`.
7. Autosave uses `.gdevelop/autosave/current/project.gdevelop`.
8. Modification-time calculation includes `project.gdevelop` and excludes the
   removed entry name.
9. Transactions commit `project.gdevelop` last.
10. MCP validation and project-source catalogs require the new entry and URI.
11. A noncanonical `OtherName.gdevelop` is rejected clearly.
12. No test fixture or expected diagnostic retains the removed name or URI.

Run the focused project-storage, MCP, MainFrame watcher, and project-source
catalog Jest suites, followed by Flow, lint, and formatting checks appropriate
to the changed editor files.

### 10.2 Desktop tests

Add deterministic tests proving:

1. The electron-builder configuration contains the `.gdevelop` Editor
   association and MIME type.
2. A first-instance positional `.gdevelop` path reaches the local storage
   provider.
3. A second-instance positional `.gdevelop` path is preserved.
4. A macOS `open-file` received before readiness is queued and used for the
   initial project window.
5. A macOS `open-file` received after readiness opens the selected project.
6. Multiple file-open events retain their individual paths.
7. CLI command handoff behavior is unchanged.

The main-process event routing should be factored into a pure, unit-testable
helper rather than verified only by source-text assertions.

### 10.3 Packaged and desktop smoke checks

- Validate the resolved electron-builder configuration for Windows, macOS, and
  Linux targets.
- On the host platform, install or inspect the produced package association and
  launch `project.gdevelop` through the operating system document-open path.
- Run the repository-required focused checks and then dispatch the real desktop
  build/launch script for the host platform after code changes.

## 11. Rollout

This change lands atomically:

1. Update the format constant and every reader/writer/check.
2. Update desktop packaging and file-open routing.
3. Update tests and fixtures.
4. Update all related documentation and bundled authoring guidance.
5. Confirm a repository-wide search contains no unintended old entry name.
6. Run the required verification and desktop launcher.

There is no deprecation period, feature flag, compatibility reader, or
automatic migration. All new-format projects used with the updated editor must
conform to `project.gdevelop`.

## 12. Alternatives considered

### Keep `project.settings`

Rejected because the extension is generic, cannot safely represent only the
root entry in desktop associations, and does not identify GDevelop.

### Use `gdevelop.toml`

This would improve generic TOML tooling but is weaker as a branded,
double-clickable desktop document type because its operating-system extension
is `.toml`.

### Use `project.gdevelop.toml`

Rejected because the effective desktop association remains `.toml` and the
double extension is unnecessarily verbose.

### Support both entry names

Rejected by requirement. Dual support would introduce ambiguous project roots,
transition logic, and a long-lived compatibility contract.

## 13. Approval

Approved for implementation on 2026-07-29.
