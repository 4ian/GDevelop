# ScriptExecution — the editor half of `run_script`

Script-based agents (tools `v12`+) drive a single `run_script` tool whose
JavaScript runs **here, in the editor**, against the open project. The backend
half is `GDevelop-services/generation-api/src/lib/script-api/`.

Files are self-explanatory; what is not visible in them:

## Where the rest of the flow lives

| what | where |
| --- | --- |
| The `run_script` `EditorFunction` (parse, run, cap, return payload) | `../index.js` (`runScript`) |
| Dispatch + approval gate (one approval per script) | `../EditorFunctionCallRunner.js`, `../../AiGeneration/Utils.js` |
| Chat UI row (title + folded script/records/logs/result/error) | `../../AiGeneration/AiRequestChat/RunScriptFunctionCallRow.js` |
| Tools version constant (must match the backend capabilities) | `../../AiGeneration/Utils.js` (`AI_ORCHESTRATOR_TOOLS_VERSION`) |

## Invariants

1. **A call inside a script behaves exactly like the equivalent tool call**, so
   N script calls == N tool calls: `ExposedFunctions.js` binds the SAME
   implementation and the SAME collaborators bag (including the coalesced
   `on*ModifiedOutsideEditor` callbacks) that `EditorFunctionCallRunner` passes.
   Anything skipped here would silently diverge from the tool-call path.
2. **Read-only outputs never leave the editor** — that context saving is the
   point of scripts, so the agent must `console.log` what it needs.
3. **`TypedOutputsSchemas.fixture.json` is a vendored copy** of
   `scriptApiSharedOutputTypes` / `scriptApiToolOutputSchemas` from the backend
   `script-api/output-types.js` (field shapes only, descriptions stripped).
   Update both in the same change, EventScript-fixtures-style;
   `TypedOutputsConformance.spec.js` then proves the real editor outputs match
   what the backend promises the agents.
4. **A script `ReferenceError` must name the mistake**: the observed failure was
   an agent calling one of its own TOOLS (`search_docs`, `read_full_docs`...)
   from inside a script, which the bare message left it to guess at.
5. **Never edit a shipped version's behavior.** `run_script` ships as tools
   `v12`; the flip-back is reverting `AI_ORCHESTRATOR_TOOLS_VERSION` to `'v11'`.
