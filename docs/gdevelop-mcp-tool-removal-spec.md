# GDevelop MCP Tool Removal Specification

Date: 2026-08-01

## Problem

The built-in GDevelop MCP server currently publishes five tools that should no
longer be part of its public protocol surface:

- `create_action`
- `create_signal_emit_action`
- `create_signal_received_condition`
- `create_signal_subscription_action`
- `gdevelop_create_or_update_on_signal`

The first four construct serialized instruction JSON. The fifth mutates an
events-based object or behavior by creating or updating its reserved
`onSignal` function. These tools overlap with the repository's file-first
authoring contract: callers should read generated catalogues and edit canonical
multi-file project sources directly instead of using MCP construction or
authoring helpers.

Removing published MCP tool names is a breaking public API change. The removal
must therefore be applied consistently to discovery, introspection, request
dispatch, tests, and bundled authoring guidance.

## Goals

- Remove all five tool names from `tools/list`, schema introspection, usage
  examples, capability summaries, permission checks, and callable dispatch.
- Delete bridge-only implementations and schemas that exist solely for these
  tools.
- Make a direct call to any removed name fail through the existing unknown-tool
  path.
- Update the bundled GDevelop project-files skill so its public allowlist is
  exact and contains 22 tools rather than 27.
- Preserve all unrelated MCP inspection, validation, synchronization, preview,
  extension-import, and runtime-control tools.

## Non-goals

- Do not remove the GDevelop signal system, signal instructions, `onSignal`
  lifecycle support, or signal-related runtime behavior.
- Do not remove `gdevelop_inspect_signal_usage`.
- Do not remove generated instruction catalogues or the internal instruction
  metadata/building utilities used outside these public wrappers.
- Do not change project serialization, the multi-file project format, the
  IfDo event DSL, write/command permission preferences, or MCP transport.
- Do not add replacement aliases, deprecated shims, feature flags, or hidden
  compatibility endpoints for the removed names.

## Current Behavior

`McpToolCatalog.js` registers four tools in the always-available catalogue and
`gdevelop_create_or_update_on_signal` in the permissioned write catalogue. It
also owns their input schemas, usage examples, permission classification, and
capability-summary categories.

`McpEditorBridge.js` dispatches the four construction requests to bridge-local
instruction builders. It dispatches the `onSignal` request to a bridge-local
wrapper around extension-function mutation and repairs the fixed lifecycle
signature after creation.

`McpToolCatalog.spec.js` expects all five names to be published.
`McpEditorBridge.spec.js` exercises their successful construction and mutation
paths. The bundled `gdevelop-project-files` skill lists them in its exact
27-tool allowlist.

## Proposed Behavior

The five names will not appear in any public or introspection catalogue,
regardless of write/command permissions. `isKnownMcpTool` will return `false`,
`isWriteTool` and `isCommandTool` will return `false`, and
`getMcpToolUsageExamples` will return an empty list for each removed name.

A `tools/call` request using a removed name will be rejected by the existing
permission gate with an MCP tool error whose message is
`Unknown MCP tool: <name>.` The request will never reach a tool-specific bridge
handler.

Authoring workflows will use canonical project files instead:

- Actions and signal instructions are authored in `.events` sources using the
  exact instruction types and named parameters from
  `.gdevelop/instructions-catalog.json`.
- `onSignal` handlers are authored as canonical object/behavior function
  sources under the owning extension, following the fixed lifecycle signature
  and existing project-file guidance.
- `gdevelop_inspect_signal_usage` remains available for read-only auditing.

## Affected Layers and Files

### MCP catalogue

- `newIDE/app/src/Mcp/McpToolCatalog.js`
  - Remove the five tool definitions.
  - Remove their dedicated input schemas and usage examples.
  - Remove their capability-summary entries and the empty
    `Extension events` category.
  - Keep `inspect_tool_schema` and `get_tool_usage_examples` under a remaining
    tool-discovery category.

### Renderer dispatch

- `newIDE/app/src/Mcp/McpEditorBridge.js`
  - Remove all five dispatch branches.
  - Remove the bridge-local signal instruction builders and the
    `createOrUpdateOnSignalFunction` wrapper.
  - Remove imports and helper functions that become unused solely because of
    this deletion.
  - Preserve shared extension and event utilities that still have other
    callers.

### Main-frame wiring

- `newIDE/app/src/MainFrame/index.js`
  - Remove the extension-function event callback that was used only by the
    deleted `onSignal` write handler.

### Tests

- `newIDE/app/src/Mcp/McpToolCatalog.spec.js`
  - Remove the names from expected published tool arrays.
  - Add all five names to the explicit unknown/forbidden-tool regression set.
  - Update expected capability categories.
- `newIDE/app/src/Mcp/McpEditorBridge.spec.js`
  - Remove success-path tests for the deleted handlers.
  - Add or retain a focused `tools/call` assertion proving a removed name
    returns the unknown-tool error before dispatch.

### Bundled documentation

- `newIDE/app/resources/gd-project-template/skills/gdevelop-project-files/SKILL.md`
  - Remove the five names from the exact allowlist.
  - Change the declared count from 27 tools to 22.
  - Remove instruction-construction and public `onSignal`-write guidance that
    depends on these MCP tools, while retaining direct-file signal guidance.

No change is required in the reusable Python MCP gameplay-test template because
it does not call any of the five tools.

## Public API and Compatibility

This is an intentional breaking change to the MCP tool API. Clients that cache
the old catalogue or call these names will receive an unknown-tool error.
Clients that discover tools dynamically will simply stop seeing them.

There is no serialized project-data migration. Existing projects containing
signal instructions or `onSignal` functions continue to load and run exactly as
before. Existing project sources created through the removed write tool remain
valid.

No compatibility aliases will be retained because the goal is to eliminate
these callable surfaces, not merely hide them from `tools/list`.

## Migration Strategy

MCP clients should refresh `tools/list` after upgrading. Workflows that used
the removed construction helpers must switch to generated instruction
catalogues plus direct `.events` authoring. Workflows that used the removed
`onSignal` writer must create or update canonical extension function sources
directly and follow the validation/reload gates in the bundled project-files
skill.

## Error Handling

- Calling a removed tool returns the existing structured MCP tool error for an
  unknown tool.
- Introspecting a removed tool name returns the existing unknown-tool response.
- Requesting usage examples for a removed name returns an empty list, matching
  all other unknown names.
- No fallback mutation or partial execution is attempted.

## Performance Implications

The change slightly reduces catalogue size, schema serialization, and bridge
code size. It adds no runtime work and has no gameplay performance impact.

## Rollout

Remove all five names in one release so discovery and dispatch cannot disagree.
There is no staged flag: keeping a handler callable after removing it from
discovery would create a hidden API and violate the exact allowlist.

## Tests and Verification

Run the focused MCP tests:

```text
cd newIDE/app
npm test -- --runTestsByPath src/Mcp/McpToolCatalog.spec.js src/Mcp/McpEditorBridge.spec.js --watchAll=false
```

Also run focused ESLint, Prettier, Flow where the repository baseline permits,
and `git diff --check`. Search the repository for all five exact names and
require that only the removal specification and explicit forbidden-name tests
retain them. Finally, dispatch the required Windows desktop build-and-launch
script without waiting for its result.

## Alternatives Considered

### Hide tools but retain callable handlers

Rejected because cached or manually constructed calls would still reach a
hidden public API, contradicting the requested removal and the skill's exact
allowlist.

### Keep deprecated aliases temporarily

Rejected because no transition period was requested and aliases would preserve
the unwanted authoring surface.

### Remove signal functionality entirely

Rejected because the request targets MCP tools, not authored project behavior
or runtime signal support.

## Open Questions

None. The requested tool list and removal boundary are explicit.
