# Reuse and install official/community extensions

## Contents

- [Reuse-first rule](#reuse-first-rule)
- [Search the repository](#search-the-repository)
- [Select and audit a candidate](#select-and-audit-a-candidate)
- [Identify the registry name](#identify-the-registry-name)
- [Install into multi-file sources](#install-into-multi-file-sources)
- [Verify and report](#verify-and-report)

## Reuse-first rule

Before writing a substantial behavior, prefab, networking system, pathfinder,
camera system, UI widget, save system, procedural generator, or other heavy
feature, search the official repository:

`https://github.com/GDevelopApp/GDevelop-extensions/tree/main/extensions`

Prefer, in order:

1. A compatible extension already installed in the project.
2. A matching extension under `extensions/reviewed`.
3. A well-scoped extension under `extensions/community` after additional audit.
4. A small adaptation or wrapper around an existing extension.
5. A new implementation only when no suitable candidate exists.

Reuse implementation-heavy extensions whenever practical. Do not recreate a
battle-tested subsystem merely to rename its API or make a minor default
change; wrap or adapt it instead.

## Search the repository

Use a disposable cache outside the game project. Do not copy the repository or
downloaded legacy JSON into project source.

```powershell
$cache = Join-Path $env:TEMP "GDevelop-extensions"
git clone --depth 1 --filter=blob:none --sparse https://github.com/GDevelopApp/GDevelop-extensions.git $cache
git -C $cache sparse-checkout set extensions/reviewed extensions/community
rg -n -i 'health|damage|hit points' "$cache/extensions/reviewed" "$cache/extensions/community"
```

If the cache already exists, update it with `git -C $cache pull --ff-only`.
Search filenames first, then `name`, `fullName`, `shortDescription`,
`description`, `tags`, public function names, behavior names, and prefab names.

The repository currently separates reviewed and community extensions and
stores each extension as legacy JSON. Reviewed status is a quality signal, not
permission to skip validation.

## Select and audit a candidate

Read the entire candidate JSON and check:

- `name`, `fullName`, `version`, and `gdevelopVersion` compatibility.
- Whether it supplies the required free functions, behaviors, or prefabs.
- Public versus private APIs and required object types.
- `dependencies`, `sourceFiles`, embedded JavaScript events, network access,
  storage access, and dynamically loaded resources.
- Calls to other extension namespaces. Locate and install every required
  extension rather than leaving unresolved instruction types.
- Deprecated or hidden instruction identifiers. Replace them with current
  catalog entries while converting event bodies.
- Unconditional action paths and unrestricted multi-instance object actions.
  Refactor imported events to obey the main skill's safety rules.
- License and attribution. The official repository states that its extensions
  are MIT licensed; preserve author/origin metadata.

Reject or isolate extensions with incompatible engine requirements, unsafe
code, missing dependencies, unclear resource ownership, or excessive scope.

## Identify the registry name

Use the repository search to identify the candidate's exact top-level `name`.
Record the repository channel and current commit for the audit trail:

```powershell
$sha = git -C $cache rev-parse HEAD
$source = Join-Path $cache "extensions/reviewed/StarRatingBar.json"
$extension = Get-Content -Raw $source | ConvertFrom-Json
if ($extension.name -ne "StarRatingBar") { throw "Unexpected extension" }
```

Do not copy or manually translate this JSON into the game project. The native
import tool resolves the exact registry name, downloads the official serialized
extension and required dependencies, and performs the conversion transaction.
Record repository URL, channel, commit observed during audit, extension
version, and any later local adaptations in the final report.

## Install into multi-file sources

Repository extensions are legacy JSON interchange artifacts, not project
source. Do not reference or retain them in `project.settings`, `.settings`,
`.layout`, or `.events` and do not ask the model to translate their event trees
by hand.

1. Before making direct project-file edits, call the GDevelop MCP tool:

   ```json
   {
     "name": "import_extension",
     "arguments": { "extension_name": "StarRatingBar" }
   }
   ```

   This bounded importer is available even when general MCP write tools are
   disabled. If it is unavailable, report the missing editor capability; do
   not fall back to manual JSON conversion.

   Before the call, inspect the tool description and require `persistence protocol v3`. Refreshing the MCP catalog does not hot-reload changed editor
   JavaScript. If the description lacks v3, or a failure reports
   `importerVersion` below 3, the running GDevelop build is stale and must be
   rebuilt/restarted before retrying. Protocol v3 exposes the original writer
   exception instead of replacing it with a generic save error.

2. Require `success: true`, `importerVersion: 3`, and
   `persistedSourcesVerified: true`. The tool uses GDevelop's native extension
   installer, installs required dependencies, loads the legacy JSON through the
   engine model, immediately saves the in-memory project, reads the generated
   files back from disk, and returns `generatedSources` grouped by imported
   extension.
3. Verify that the requested extension has a non-empty generated source list
   containing `extension.settings`. Treat those returned files as the only
   editable source from this point onward.
4. Read and adapt the generated `.settings`, `.layout`, and `.events` files
   directly. Never edit the downloaded JSON or `.gdevelop/game.json`.
5. After the final adaptation, call `reload_project`, then debug with a fresh
   paused preview. For any imported action that creates, deletes, picks, or
   mutates objects, use deterministic `run_frames` with targeted `objects`,
   `include`, and `instance_indexes` and verify the live side effects.

The native conversion maps the legacy extension as follows:

| Downloaded extension field                                                        | Multi-file destination                                                                         |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Top-level metadata except implementation arrays                                   | `extensions/<E>/extension.settings`                                                            |
| `eventsFunctions[]` metadata                                                      | One `functions/<F>/function.settings` each                                                     |
| `eventsFunctions[].events`                                                        | Matching `functions/<F>/<F>.events`                                                            |
| `eventsBasedObjects[]` metadata, flat property descriptors, groups, and variables | One `prefabs/<P>/prefab.settings` each                                                         |
| Default child object definitions and attached behaviors                           | One flat `prefabs/<P>/objects/<Object>.settings` each; grouping is `folder`                    |
| Prefab default-variant instances/layers/spatial bounds/editor layout state        | `<P>.layout`                                                                                   |
| Prefab `eventsFunctions[]` metadata/bodies and function grouping                  | `prefabs/<P>/functions/<F>/function.settings` (`folder`) plus sibling `<F>.events`             |
| Prefab non-default variant metadata/groups                                        | Its entry in `prefab.settings`                                                                 |
| Prefab non-default variant child definitions/behaviors                            | One flat `prefabs/<P>/variants/<Variant>/objects/<Object>.settings` each; grouping is `folder` |
| Prefab non-default variant instances/layers/spatial bounds/editor state           | `variants/<Variant>.layout`                                                                    |
| `eventsBasedBehaviors[]` owner metadata                                           | One `behaviors/<B>/behavior.settings` each                                                     |
| Behavior `eventsFunctions[]` metadata/bodies and function grouping                | `behaviors/<B>/functions/<F>/function.settings` (`folder`) plus sibling `<F>.events`           |

The conversion keeps hidden property descriptors in the owning
`behavior.settings` because generated runtime code needs their defaults, but it
also keeps any existing hidden or extension-owned values on attached behaviors.
Such properties are absent from `settings-catalog.json`, so models must not
invent or generically edit them; absence from the catalog is not permission to
delete serializer data that a specialized editor or the runtime requires.

Follow [create-extensions.md](create-extensions.md) for exact ownership and
examples when adapting the generated sources. The converter, not the model,
owns initial preservation of unknown metadata, ordering, layouts, event
structure, and DSL serialization. Resolve any later authored or replacement
instructions through the generated catalog and never introduce `@exact`.

If import fails, do not create a partial extension tree. Report the native
import error and select another registry extension or fix the missing
dependency/compatibility issue before retrying.

## Verify and report

1. Parse every new settings TOML fragment independently and as combined
   settings; parse and semantically compile every generated `.layout` as flat
   layout TOML version 1.
2. Confirm no downloaded `.json` file was added to project source.
3. Confirm the import receipt lists the requested extension, its generated
   `extension.settings`, and source files for all imported dependencies.
4. Confirm all dependency instruction types resolve after `reload_project`.
5. Confirm imported event bodies obey condition and single-instance picking
   rules even when the upstream extension did not.
6. Exercise each public behavior, prefab, and function in a guarded test path.
7. Launch a fresh preview and inspect runtime/code-generation errors.
8. Report the selected extension, source commit/channel/version, adaptations,
   installed dependencies, and why reuse was preferable to a rewrite.
