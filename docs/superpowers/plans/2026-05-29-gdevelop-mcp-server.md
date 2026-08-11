# GDevelop MCP Server Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a localhost-only MCP Streamable HTTP server to the GDevelop desktop app, exposing editor state, resources, prompts, command execution, and existing EditorFunctions as MCP tools.

**Architecture:** Electron main owns the localhost-only HTTP/JSON-RPC MCP transport and lifecycle. The renderer owns project-aware operations through a focused IPC bridge that reuses `processEditorFunctionCalls` and existing editor callbacks.

**Tech Stack:** Electron main process CommonJS, Node `http`, renderer Flow/React, existing GDevelop `PreferencesContext`, `processEditorFunctionCalls`, Jest/unit tests, MCP JSON-RPC over Streamable HTTP.

---

### Task 1: MCP Protocol Core

**Files:**

- Create: `newIDE/electron-app/app/Mcp/McpProtocol.js`
- Test: `newIDE/electron-app/test/McpProtocol.spec.js`

- [ ] Write failing tests for JSON-RPC success, JSON-RPC error, initialize response, and tool result normalization.
- [ ] Implement protocol helpers: `createJsonRpcResult`, `createJsonRpcError`, `createTextToolResult`, `createErrorToolResult`, `getInitializeResult`.
- [ ] Run `node test/McpProtocol.spec.js`.

### Task 2: Tool, Resource, And Prompt Catalogues

**Files:**

- Create: `newIDE/app/src/Mcp/McpToolCatalog.js`
- Test: `newIDE/app/src/Mcp/McpToolCatalog.spec.js`

- [ ] Write failing tests for read/write/command filtering and `gdevelop_editor_call` permission checks.
- [ ] Implement MCP-specific tool definitions and schema metadata.
- [ ] Export helpers: `getMcpTools`, `isWriteTool`, `isCommandTool`, `getMcpResources`, `getMcpPrompts`.
- [ ] Run `npm test -- --runTestsByPath src/Mcp/McpToolCatalog.spec.js --watchAll=false`.

### Task 3: Electron MCP HTTP Server

**Files:**

- Create: `newIDE/electron-app/app/Mcp/McpServer.js`
- Modify: `newIDE/electron-app/app/main.js`
- Test: `newIDE/electron-app/test/McpServer.spec.js`

- [ ] Write failing tests for start/stop, unauthenticated POST `/mcp`, invalid method, and renderer forwarding.
- [ ] Implement localhost `http.createServer` with POST handling.
- [ ] Forward MCP methods to the active BrowserWindow using `webContents.invoke`-style request/response through IPC.
- [ ] Add lifecycle exports `startMcpServer`, `stopMcpServer`, `getMcpServerState`.
- [ ] Wire main process IPC channels for renderer preference updates.
- [ ] Run `node test/McpServer.spec.js`.

### Task 4: Renderer MCP Bridge

**Files:**

- Create: `newIDE/app/src/Mcp/McpEditorBridge.js`
- Modify: `newIDE/app/src/MainFrame/index.js`
- Test: `newIDE/app/src/Mcp/McpEditorBridge.spec.js`

- [ ] Write failing tests for editor state without project, project summary, resource URI parsing, read tool dispatch, and write blocking.
- [ ] Implement pure helpers for state/resource serialization.
- [ ] Add a React hook or setup function in `MainFrame` registering `ipcRenderer.handle('mcp-renderer-request', ...)`.
- [ ] Execute `processEditorFunctionCalls` for EditorFunction-backed tools and trigger unsaved changes when needed.
- [ ] Run `npm test -- --runTestsByPath src/Mcp/McpEditorBridge.spec.js --watchAll=false`.

### Task 5: Preferences UI

**Files:**

- Modify: `newIDE/app/src/MainFrame/Preferences/PreferencesContext.js`
- Modify: `newIDE/app/src/MainFrame/Preferences/PreferencesProvider.js`
- Modify: `newIDE/app/src/MainFrame/Preferences/PreferencesDialog.js`
- Test: existing Flow checks plus focused unit coverage where available.

- [ ] Add persisted MCP preference values and setters.
- [ ] Add a dedicated Preferences tab for MCP server configuration.
- [ ] Notify Electron main when MCP preferences change.
- [ ] Show server URL, enabled state, port, write tools toggle, command tools toggle, and server error.

### Task 6: Command Tool And Read Resources

**Files:**

- Modify: `newIDE/app/src/Mcp/McpEditorBridge.js`
- Modify: `newIDE/app/src/MainFrame/index.js`
- Test: `newIDE/app/src/Mcp/McpEditorBridge.spec.js`

- [ ] Add `gdevelop_run_command` support using the command palette reference.
- [ ] Add resource read implementations for project summary, project JSON, scene events, scene instances, and scene objects.
- [ ] Ensure large JSON/text output is truncated with explicit markers.

### Task 7: Verification

**Commands:**

- `node test/McpProtocol.spec.js`
- `node test/McpServer.spec.js`
- `npm test -- --runTestsByPath src/Mcp/McpToolCatalog.spec.js src/Mcp/McpEditorBridge.spec.js --watchAll=false`
- `npx flow focus-check src/Mcp/McpToolCatalog.js src/Mcp/McpEditorBridge.js src/MainFrame/index.js src/MainFrame/Preferences/PreferencesContext.js src/MainFrame/Preferences/PreferencesProvider.js src/MainFrame/Preferences/PreferencesDialog.js`
- `git diff --check`

- [ ] Run all commands.
- [ ] Manually start the Electron app and connect MCP Inspector to `http://127.0.0.1:<port>/mcp`.
- [ ] Verify list tools/resources/prompts, read project summary, and one write tool when write tools are enabled.
