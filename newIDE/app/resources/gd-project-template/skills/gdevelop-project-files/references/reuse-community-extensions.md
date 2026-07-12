# Reuse and install official/community extensions

## Contents

- [Reuse-first rule](#reuse-first-rule)
- [Search the repository](#search-the-repository)
- [Select and audit a candidate](#select-and-audit-a-candidate)
- [Download reproducibly](#download-reproducibly)
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

## Download reproducibly

Pin the selected repository commit rather than relying on a moving `main` URL:

```powershell
$sha = git -C $cache rev-parse HEAD
$source = Join-Path $cache "extensions/reviewed/StarRatingBar.json"
$extension = Get-Content -Raw $source | ConvertFrom-Json
if ($extension.name -ne "StarRatingBar") { throw "Unexpected extension" }
```

For a direct raw download, use:

```text
https://raw.githubusercontent.com/GDevelopApp/GDevelop-extensions/<commit>/extensions/reviewed/<ExtensionName>.json
https://raw.githubusercontent.com/GDevelopApp/GDevelop-extensions/<commit>/extensions/community/<ExtensionName>.json
```

Validate that the response is JSON, the filename/name match, and the file is
not an HTML error page. Record repository URL, channel, commit, extension
version, and any local adaptations in the final report.

## Install into multi-file sources

The downloaded JSON is a legacy interchange artifact, not project source. Do
not reference or retain it in `project.settings`, `.settings`, `.layout`, or
`.events`. Convert it into the canonical source tree:

| Downloaded extension field | Multi-file destination |
| --- | --- |
| Top-level metadata except implementation arrays | `extensions/<E>/extension.settings` |
| `eventsFunctions[]` metadata | One `functions/<F>/function.settings` each |
| `eventsFunctions[].events` | Matching `functions/<F>/<F>.events` |
| `eventsBasedObjects[]` metadata | One `prefabs/<P>/prefab.settings` each |
| Prefab visual/default-variant fields | `<P>.layout` |
| Prefab `eventsFunctions[].events` | Sibling `<Function>.events` files |
| Prefab non-default variant visual fields | `variants/<Variant>.layout` |
| `eventsBasedBehaviors[]` metadata | One `behaviors/<B>/behavior.settings` each |
| Behavior `eventsFunctions[].events` | Sibling `<Function>.events` files |

Follow [create-extensions.md](create-extensions.md) for exact ownership and
examples. Preserve every unknown metadata field in its owning settings file.
Add `kind`, `settingsFormatVersion = 1`, and contiguous local `order` values.
Do not add settings-file references to parent settings.

Convert each legacy event tree to IfDo DSL, preserving group/comment/loop/JS
structure and instruction metadata. Resolve every action and condition through
the generated catalog; never paste raw event JSON into `.events`, use prose
aliases, or introduce `@exact`. Replace source instructions excluded as hidden
or deprecated with current catalog alternatives.

For an extension whose functions call its own newly declared instructions:

1. Write all settings declarations, layouts, and temporary comment-only event
   bodies so every referenced file exists.
2. Call `reload_project` to register the extension declarations.
3. Regenerate/re-read the instruction catalog before translating self-calls.
4. Replace the temporary bodies with complete converted DSL in dependency
   order: private helpers, behaviors, prefabs, public functions, then callers.
5. Call `reload_project` again after the final body is written.

Never leave the extension half-installed. If catalog regeneration or a required
dependency is unavailable, keep the project unchanged or roll back the whole
installation transaction.

## Verify and report

1. Parse every new TOML fragment independently and as combined settings.
2. Confirm no downloaded `.json` file was added to project source.
3. Confirm all source JSON implementation arrays were mapped to component
   folders and no function body was dropped.
4. Confirm all dependency instruction types resolve after `reload_project`.
5. Confirm imported event bodies obey condition and single-instance picking
   rules even when the upstream extension did not.
6. Exercise each public behavior, prefab, and function in a guarded test path.
7. Launch a fresh preview and inspect runtime/code-generation errors.
8. Report the selected extension, source commit/channel/version, adaptations,
   installed dependencies, and why reuse was preferable to a rewrite.
