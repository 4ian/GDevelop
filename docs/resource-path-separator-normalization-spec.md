# Resource Path Separator Normalization

**Status:** Proposed; awaiting approval  
**Scope:** Multi-file `project.gdevelop` projects  
**Canonical separator:** `/`

## 1. Problem

On Windows, a resource discovered with `path.relative` can receive a logical
resource name containing backslashes while its physical file is later written
with forward slashes:

```toml
[[resources]]
name = "assets\\player-shot.png"
file = "assets/player-shot.png"
kind = "image"
```

The resource `name` is a project-wide identifier, not merely display text.
Objects, events, effects, extension data, and other typed resource consumers
refer to that exact value. Consequently, changing only `resources.settings`
would leave stale references and break the project.

The current multi-file format contract also states that version 1 does not
automatically rewrite legacy runtime asset/resource paths. Making `/`
canonical therefore changes serialized project behavior and requires an
explicit compatibility and migration contract.

## 2. Goals

- Write local resource paths with `/` on every operating system.
- Normalize both resource registry fields:
  - `resources[].name`, when it contains path separators.
  - `resources[].file`, when it is a local filesystem path.
- Update every typed project reference when a resource `name` changes.
- Accept existing backslash-based projects as compatibility input.
- Keep normalization deterministic, idempotent, and all-or-nothing.
- Prevent silent merging or overwriting when normalized names collide.
- Ensure newly discovered local resources use canonical names immediately.
- Preserve preview, export, and generated `.gdevelop/game.json` behavior.

## 3. Non-goals

- Replacing resource names with UUIDs.
- Adding a resource UUID field.
- Converting SVG resources to PNG during export.
- Renaming resource basenames, extensions, or directories.
- Normalizing arbitrary user text, variable strings, JavaScript code, or
  resource metadata JSON.
- Changing `resourceFolders` display names.
- Rewriting URL payloads such as `data:` or `blob:` resources.
- Changing legacy single-file JSON save behavior unless that project is being
  migrated into the multi-file format.

## 4. Current behavior

The multi-file decompiler clones the legacy `project.resources` container into
`resources.settings` without normalizing resource names or files.

Local resource discovery uses the host operating system's result from
`path.relative`. On Windows this produces `\`, and the value can become both
the initial resource name and file. Later resource movement may normalize the
physical file without renaming the logical resource or its references, which
produces the split spelling shown above.

GDevelop already has the correct semantic rename mechanism:

- `ResourcesContainer::RenameResource` changes the registry key.
- `ResourcesRenamer` plus
  `ResourceExposer::ExposeWholeProjectResources` updates typed references
  throughout the project.

This mechanism must be used instead of recursively replacing matching strings
in serialized JSON.

## 5. Proposed behavior

### 5.1 Canonical value

For multi-file projects, `/` is the only separator written for:

- Path-like resource `name` values.
- Local resource `file` values.
- Typed references to a normalized resource name.

Examples:

```toml
name = "assets/player-shot.png"
file = "assets/player-shot.png"
```

An absolute Windows file path is serialized with a drive prefix and forward
slashes:

```toml
file = "C:/SharedAssets/player-shot.png"
```

### 5.2 Values that are not rewritten

The `file` value of an `http:`, `https:`, `ftp:`, `blob:`, or `data:` resource
is preserved byte-for-byte. This prevents modification of URL payloads in
which a backslash may be data rather than a path separator.

Resource metadata is also preserved byte-for-byte. A path stored inside
metadata remains owned by that metadata's feature and is outside this
normalization.

A backslash in a resource `name` is treated as a legacy path separator. It is
not a supported literal character in a canonical multi-file resource name.

### 5.3 Whole-project rename algorithm

Before changing the project:

1. Read every resource name.
2. Compute `normalizedName = oldName.replace(/\\/g, '/')`.
3. Build the complete old-to-new name map.
4. Verify that every resulting name is unique.
5. Verify that no normalized name collides with an unchanged resource.

Only after the complete preflight succeeds:

1. Rename registry entries through the resources container.
2. Run `ResourcesRenamer` through
   `ResourceExposer::ExposeWholeProjectResources`.
3. Normalize every local resource's `file` value.
4. Serialize and run the normal multi-file self-check.

The operation does not search and replace arbitrary strings. Only references
identified by GDevelop's resource exposure/refactoring system are changed.

### 5.4 Creation boundary

Local file discovery converts the project-relative path to `/` before using it
as a proposed resource name or file:

```js
const canonicalRelativePath = relativeFilePath.replace(/\\/g, '/');
```

Other local resource creation/import paths that derive a resource identifier
from a filesystem path apply the same conversion before checking uniqueness.

### 5.5 Existing multi-file projects

Backslashes remain accepted as compatibility input so existing projects can
open. Normalization occurs before a normal multi-file Save or Save As:

- The live resource registry is renamed.
- Typed references in the live project are updated.
- The saved `resources.settings`, object settings, event sources, generated
  catalogs, and `.gdevelop/game.json` use the canonical name.

The normalization is a real project refactor, not an export-only projection.
After the successful save, the editor's in-memory project and source files use
the same canonical names.

### 5.6 Legacy JSON migration

When a legacy JSON project is converted to `project.gdevelop`, normalization
runs on the fully unserialized temporary project before the new source tree is
decomposed. The original legacy JSON remains byte-for-byte unchanged, as
required by the existing migration contract.

If normalization cannot complete, migration stops before committing any new
source file.

### 5.7 Defensive save boundary

Every multi-file save performs the normalization preflight before
serialization, even when resource creation paths already produce canonical
values. This catches:

- Resources added by extensions or older editor code.
- Projects opened from old source.
- Direct model mutations that bypass the standard resource importer.

Running the operation on an already canonical project makes no changes.

## 6. Collision and error handling

Normalization can make two previously distinct names identical:

```text
assets\shot.png
assets/shot.png
```

It can also collapse multiple legacy spellings:

```text
assets\\weapons\shot.png
assets/weapons\shot.png
```

These cases are not resolved by choosing one resource or generating a new
name. The operation fails before any mutation with a diagnostic containing:

- Stable code `RESOURCE_PATH_NORMALIZATION_COLLISION`.
- Every conflicting original name.
- The normalized target name.
- Guidance to rename one resource explicitly in the editor.

For an existing multi-file project, the project may still be opened so the
user can perform that explicit rename, but Save is blocked until the conflict
is resolved. For legacy JSON migration, conversion is aborted and the legacy
project remains the active source.

Any failure after mutation begins must prevent source replacement. The normal
transaction and writer self-check retain the previous source files. The
implementation should compute and validate the entire rename plan before
mutating so post-mutation failures are limited to existing transactional save
failures.

## 7. Data and compatibility contract

### 7.1 Schema

No TOML key or value type changes. `name` and `file` remain strings.

The canonical value domain changes:

- `resources[].name` must not contain `\`.
- A local `resources[].file` must not contain `\`.
- URL-backed `file` values are exempt and remain opaque.

### 7.2 Reader compatibility

The reader continues accepting backslashes for format-version-2 projects as a
legacy compatibility spelling. The writer never emits them after successful
normalization.

No `settingsFormatVersion` increase is required because:

- The existing value types and ownership are unchanged.
- Old source remains readable.
- The migration updates all typed references atomically.

This normalization becomes a documented difference allowed by canonical
legacy-tree equivalence checks.

### 7.3 Runtime and export

Runtime project data continues using resource names as lookup keys. Because
the registry and all typed references are renamed together, no runtime format
or lookup behavior changes.

The physical exported filename is not inferred from the logical name. Future
export-only SVG-to-PNG conversion can therefore preserve the canonical
resource `name` while changing only the export projection of `file`.

## 8. Affected layers and likely files

### Documentation

- `docs/gdevelop-new-formats-spec.md`
  - Declare canonical `/` resource separators.
  - Replace the version-1 no-rewrite statement with this compatibility rule.
  - Add the normalization to the documented equivalence allowlist.

### Resource model helpers

- `newIDE/app/src/ResourcesList/ResourceUtils.js`
  - Add the project-wide normalization/preflight helper.
- `newIDE/app/src/ResourcesList/ResourceUtils.spec.js`
  - Cover registry, object, event, file, URL, collision, and idempotence cases.

### Local resource creation

- `newIDE/app/src/ProjectsStorage/LocalFileStorageProvider/LocalProjectResourcesHandler.js`
  - Canonicalize project-relative paths before assigning resource names/files.
- Other traced path-derived resource creation sites, if they can introduce
  backslash names.

### Multi-file migration and save

- `newIDE/app/src/ProjectsStorage/LocalFileStorageProvider/LocalProjectOpener.js`
  - Normalize the temporary loaded project during legacy conversion.
- `newIDE/app/src/ProjectsStorage/LocalFileStorageProvider/LocalProjectWriter.js`
  - Run defensive normalization before multi-file serialization.
- `newIDE/app/src/ProjectsStorage/LocalFileStorageProvider/LocalMultiFileProject.spec.js`
  - Verify canonical source and generated artifacts across save/reopen.

The multi-file TOML serializer should remain a pure ownership projection. It
must not normalize `resources.settings` alone because it does not own all
resource references.

## 9. Performance

Let `R` be the number of resources and `P` the number of typed resource
reference locations exposed by the project:

- Preflight is `O(R)`.
- A no-op canonical save is `O(R)` and does not invoke whole-project
  refactoring.
- A project requiring migration is `O(R + P)`.

Normalization allocates one rename map and a set of target names. It does not
copy binary resources or decode their contents.

## 10. Rollout

1. Add the normalization helper and focused model tests.
2. Normalize newly created local resource identifiers.
3. Add defensive multi-file save normalization and integration tests.
4. Apply the same helper to legacy-to-multi-file migration.
5. Update the normative multi-file format documentation.
6. Validate representative Windows projects and repository fixtures.

No feature flag is proposed. The writer's output becomes canonical once the
change ships, while the reader retains old spelling compatibility.

## 11. Verification

Required tests:

- A resource name and file containing `\` become `/`.
- A global Sprite image reference is renamed.
- A scene Sprite image reference is renamed.
- An audio resource referenced by an event action is renamed.
- Other typed resource consumers exposed by `ResourceExposer` remain covered
  by its existing whole-project refactoring tests.
- Arbitrary text equal to a resource name is not blindly replaced.
- `http:`, `https:`, `ftp:`, `blob:`, and `data:` file values are unchanged.
- Absolute Windows and UNC local file paths receive `/`.
- A collision is detected before mutation.
- A collision diagnostic lists both original names and the target.
- Re-running normalization is a no-op.
- A Windows-discovered resource starts with a canonical name/file.
- Saving an old multi-file project rewrites `resources.settings`, affected
  object settings, affected `.events`, generated catalogs, and
  `.gdevelop/game.json` consistently.
- The normalized project reopens and round-trips.
- Legacy JSON migration produces canonical multi-file source while leaving the
  original JSON unchanged.
- Preview and export resource validation still succeeds after normalization.

After implementation, run the closest editor tests, formatting/type checks
required by the changed files, and dispatch the required Windows desktop
build/launch script.

## 12. Alternatives considered

### Normalize only `resources.settings`

Rejected. It changes registry keys without changing references and can break
objects, events, effects, and extensions.

### Treat `name` and `file` as the same field

Rejected. Their separation is required for stable logical references and
export-time file substitution, including a future SVG-to-PNG export option.

### Replace resource names with UUIDs

Rejected for this change. It requires a new persistent identity field and a
much broader migration across editor, project, extension, exporter, and
runtime contracts.

### Recursively replace equal strings in serialized project JSON

Rejected. Unrelated text or variable values may equal a resource name.
GDevelop's typed resource exposure/refactoring mechanism is the authoritative
rename boundary.

### Normalize only when a resource is first created

Rejected as incomplete. It prevents new occurrences but leaves existing
multi-file projects and older creation paths inconsistent.

### Export-only normalization

Rejected for separator canonicalization. It would leave editable source
non-portable and would not resolve the `resources.settings` inconsistency.

## 13. Open questions for approval

1. Should a collision block Save while still allowing the project to open for
   manual repair, as proposed?
2. Should valid URL-backed resource `file` values remain byte-for-byte opaque,
   as proposed?
3. Should the change remain scoped to multi-file projects and legacy projects
   migrating into that format, as proposed?

