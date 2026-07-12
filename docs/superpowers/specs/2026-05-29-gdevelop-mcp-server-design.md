# GDevelop MCP Server Design

## Goal

Add a built-in MCP server to the GDevelop desktop app so MCP-compatible AI clients can inspect editor state, read project context, run editor commands, and modify the currently open project through the same high-level operations used by GDevelop's Ask AI feature.

## Non-Goals

- Do not make the browser/PWA build host an MCP server.
- Do not expose the server publicly or bind to non-local interfaces.
- Do not replace the existing Ask AI backend or AI service adapter work.
- Do not implement a separate low-level object mutation API when an existing EditorFunction already covers the operation.
- Do not silently allow destructive writes. Write access must be explicit and configurable.

## Architecture

The MCP server runs in the Electron main process and listens on `127.0.0.1:<configuredPort>/mcp`. It implements MCP Streamable HTTP using JSON-RPC over HTTP. The main process owns transport concerns, sessions, authorization, tool/resource/prompt catalogues, and request routing.

Actual editor actions run in the renderer because the renderer owns the active project, editor callbacks, command palette, preview state, storage providers, and unsaved changes tracking. The main process forwards MCP calls to the active BrowserWindow through IPC and waits for a structured result.

The renderer exposes a narrow bridge:

- `mcp/list-capabilities`: returns current editor availability and the tool catalogue.
- `mcp/get-state`: returns active project/editor status.
- `mcp/read-resource`: resolves `gdevelop://...` resource URIs.
- `mcp/call-tool`: executes a named tool.

## Transport

Use MCP Streamable HTTP first:

- Endpoint: `http://127.0.0.1:<port>/mcp`
- Supported methods: `initialize`, `notifications/initialized`, `tools/list`, `tools/call`, `resources/list`, `resources/read`, `prompts/list`, `prompts/get`, `ping`
- JSON-RPC batch requests can be rejected initially with a protocol-level invalid request error.
- `GET` SSE streams can return `405 Method Not Allowed` for the first version. Tool calls are expected to complete as regular HTTP responses.
- `MCP-Protocol-Version` is accepted and checked for known versions, defaulting to `2025-03-26` when absent for compatibility.

Do not add stdio transport inside the running GDevelop app. A separate future CLI wrapper can connect to the HTTP server if a stdio-facing shim is needed by a specific MCP host.

## Security Model

The server is disabled by default.

Preferences add a dedicated MCP tab with:

- `enableMcpServer`: boolean, default `false`
- `mcpServerPort`: number, default `3211`
- `mcpAuthorizationToken`: string, generated locally on first enable
- `mcpAllowWriteTools`: boolean, default `false`
- `mcpAllowCommandTools`: boolean, default `false`
- `mcpShowServerUrl`: display-only URL and token hint

Runtime constraints:

- Bind only to `127.0.0.1`.
- Require `Authorization: Bearer <token>` for every HTTP request after initialization. If a client omits auth during `initialize`, return a clear authentication error.
- Treat write tools as unavailable unless `mcpAllowWriteTools` is enabled.
- Treat command execution as unavailable unless `mcpAllowCommandTools` is enabled.
- Return tool errors as MCP tool results with `isError: true` when the request reached a tool.
- Return JSON-RPC errors for protocol/auth/session/method problems.

## Tool Catalogue

Tool names use a `gdevelop_` prefix for MCP-specific tools. Existing EditorFunctions are exposed directly under their existing names to preserve compatibility with the Ask AI tool vocabulary.

### Read-Only Tools

- `gdevelop_get_editor_state`: returns project-open state, project name, scene names, current tab summary, unsaved flag if available, MCP write/command permission state.
- `gdevelop_get_project_summary`: returns the simplified project JSON produced by `makeSimplifiedProjectBuilder`.
- `gdevelop_read_project_json`: returns serialized full project JSON with an optional `maxLength` safeguard.
- `gdevelop_list_scenes`: returns scene names and basic metadata.
- `gdevelop_list_objects`: returns global and scene object summaries, optionally scoped to a scene.
- `gdevelop_list_commands`: returns registered command names and display metadata.
- `gdevelop_get_events_json_examples`: serializer-compatible event JSON examples.
- `gdevelop_validate_events_json`: validates serialized event JSON without mutation.
- `read_scene_events`: existing EditorFunction.
- `describe_instances`: existing EditorFunction.
- `inspect_object_properties`: existing EditorFunction.
- `inspect_behavior_properties`: existing EditorFunction.
- `inspect_scene_properties_layers_effects`: existing EditorFunction.
- `read_game_project_json`: existing EditorFunction.
- `search_docs`: existing EditorFunction.
- `read_full_docs`: existing EditorFunction.

### Write Tools

These require `mcpAllowWriteTools`.

- `initialize_project`
- `create_scene`
- `delete_scene`
- `create_or_replace_object`
- `change_object_property`
- `add_behavior`
- `remove_behavior`
- `change_behavior_property`
- `put_2d_instances`
- `put_3d_instances`
- `add_scene_events`
- `change_scene_properties_layers_effects_groups`
- `add_or_edit_variable`
- `create_or_update_plan`
- `generate_events`
- `gdevelop_editor_call`: generic escape hatch for any exposed EditorFunction. Its input is `{ name, arguments }`; it still enforces read/write permissions for the target function.

### Command Tools

These require `mcpAllowCommandTools`.

- `gdevelop_run_command`: executes a registered GDevelop command palette command by name. It returns whether the command exists and was launched. Commands that open dialogs are allowed only when command tools are enabled.

## Tool Schemas

EditorFunction argument schemas are initially hand-authored for the supported high-value tools because the current EditorFunctions validate arguments imperatively with `SafeExtractor`. The schema catalogue lives near the MCP bridge and is used for `tools/list`.

For completeness and maintainability:

- A tool can be exposed without a perfect schema only through `gdevelop_editor_call`.
- Common required fields are encoded in JSON Schema.
- Descriptions include examples and cross-tool guidance, such as "call `describe_instances` first to get instance ids".
- Dangerous or broad tools include explicit warnings in descriptions.

### Serialized Event JSON

Event authoring uses serializer-compatible `events_json`, `event_changes`, and
file replacement payloads. Instructions use exact positional parameter arrays
and logical child conditions use `subInstructions`. The bridge validates raw
payload structure before mutation, supports dry-run simulation and
`expected_revision` guards, and exposes instruction metadata plus event JSON
examples to help callers construct valid payloads.

Serialized event reads return an `eventSheetRevision`. Successful event writes return the new revision and changed event ids. Event writes preflight dependencies, validation, and target paths on a temporary project before touching the live event sheet.

## Resources

Expose read-only resources:

- `gdevelop://editor/state`
- `gdevelop://project/summary`
- `gdevelop://project/json`
- `gdevelop://project/extensions-summary`
- `gdevelop://scene/{sceneName}/events.txt`
- `gdevelop://scene/{sceneName}/instances.json`
- `gdevelop://scene/{sceneName}/objects.json`

Resources return `text/plain` or `application/json` content. Large resources are truncated with a clear marker and instructions to call a scoped tool.

## Prompts

Expose prompts:

- `inspect-current-game`: gather project summary, scene list, and current risks.
- `implement-game-feature`: guide an AI through reading project summary, inspecting target scene, applying tools, and verifying by reading back state.
- `fix-scene-events`: guide event-sheet debugging and modification.
- `layout-scene`: guide object and instance placement.
- `refactor-gameplay`: guide safe multi-step project changes with readback between writes.

Prompts describe the recommended tool order and safety expectations.

## Renderer Bridge Responsibilities

The renderer bridge must:

- Know the active `project`, `i18n`, editor callbacks, preview/editor callbacks, and helper functions needed by `processEditorFunctionCalls`.
- Trigger unsaved changes when a tool result indicates `didModifyProject`.
- Dispatch outside-editor change notifications for scenes, instances, objects, groups, and events.
- Serialize results into plain JSON-safe values.
- Avoid returning gd object pointers or React nodes.
- Keep a bounded request timeout so MCP calls cannot hang forever.

## Main Process Server Responsibilities

The main process server must:

- Start/stop/restart when preferences change.
- Choose the configured port or return a clear port conflict error.
- Track the active BrowserWindow and fail gracefully when no window is ready.
- Validate authorization and protocol shape before forwarding.
- Map MCP methods to bridge calls.
- Normalize errors into MCP-compatible JSON-RPC or tool result objects.
- Shut down on app quit and when all windows close.

## Data Flow

1. User enables MCP server in Preferences.
2. Renderer preference change notifies Electron main process with server config.
3. Main starts `127.0.0.1:<port>/mcp`.
4. MCP client calls `initialize`.
5. MCP client calls `tools/list`, `resources/list`, or `prompts/list`.
6. MCP client calls `tools/call`.
7. Main validates token and permission, then forwards to renderer via IPC.
8. Renderer executes `processEditorFunctionCalls` or state/resource command.
9. Renderer returns JSON-safe result.
10. Main returns a MCP `CallToolResult`.

## Error Handling

- No active project: read-only global tools still work; project-scoped tools return `isError: true`.
- Unknown tool: JSON-RPC invalid params for `tools/call`.
- Disabled write or command tools: `isError: true` with a permission message.
- Invalid args: `isError: true` with the EditorFunction failure message.
- Port unavailable: preference state records a server error and UI shows it in MCP tab.
- Renderer timeout: `isError: true` with timeout details.
- Renderer crashed/no active window: server remains up but returns a clear unavailable error.

## Testing

Unit tests:

- MCP JSON-RPC handler: initialize, list tools, call tool, list/read resources, list/get prompts, auth failures, unknown methods.
- Permission filtering: write tools hidden or blocked when disabled.
- Tool result normalization: success, editor failure, thrown exception.
- Server lifecycle: start, stop, restart config, port conflict handling using mocked HTTP server.
- Renderer bridge pure helpers: tool metadata filtering, resource URI parsing, JSON-safe serialization.

Integration-style tests:

- `tools/call` forwards to mocked renderer bridge and returns a valid MCP tool result.
- `resources/read` forwards scoped resource requests.
- `gdevelop_editor_call` rejects write functions when write tools are disabled.

Manual verification:

- Enable MCP server from Preferences.
- Connect with MCP Inspector to `http://127.0.0.1:<port>/mcp`.
- List tools/resources/prompts.
- Read project summary.
- Call a read tool.
- Enable write tools and call a simple scene creation tool.
- Verify the editor marks the project as changed and the new scene appears.

## Rollout

Implement in phases:

1. Protocol/server skeleton in Electron main with mocked bridge tests.
2. Preferences tab and server lifecycle.
3. Renderer bridge with state/resources/read-only tools.
4. Write tools via existing EditorFunctions.
5. Command execution tool.
6. Manual MCP Inspector verification.

## Open Decisions Resolved

- Transport: Streamable HTTP only for the built-in server.
- Binding: localhost only.
- Authentication: bearer token required.
- Write access: disabled by default.
- Tool implementation: reuse existing EditorFunctions and add MCP-specific wrappers only where needed.
