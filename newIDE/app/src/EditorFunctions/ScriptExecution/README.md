# ScriptExecution — the editor half of `run_script`

Script-based agents (tools `v12`+) drive a single `run_script` tool whose
JavaScript is executed **here, in the editor**, against the open project. This
folder is the editor half of the contract; the backend half lives in
`GDevelop-services/generation-api/src/lib/script-api/` (its `README.md` is the
authoritative map of the three-repo contract, the §3.2 output payload and the
§3.4 record/log caps).

## The pieces

| piece | file |
| --- | --- |
| Runner (sequential, stop-on-first-failure, records, logs, line numbers) | `ScriptRunner.js` (+ `.spec.js`) |
| Exposed-functions bridge (registry → async functions bound to the collaborators bag) | `ExposedFunctions.js` (+ `.spec.js`) |
| Output caps + read-only reduction + `didModifyProject` (§3.4) | `capScriptOutput.js` |
| The `run_script` `EditorFunction` (parse, run, cap, return payload) | `../index.js` (`runScript`, registered in `editorFunctions`) |
| Dispatch + approval gate (`modifiesProject: true` → one approval per script) | `../EditorFunctionCallRunner.js`, `../../AiGeneration/Utils.js` |
| Chat UI row (title + collapsed script/records/logs/error) | `../../AiGeneration/AiRequestChat/FunctionCallRow.js` (`RunScriptFunctionCallRow`) |
| Tools version constant (must match the backend capabilities) | `../../AiGeneration/Utils.js` (`AI_ORCHESTRATOR_TOOLS_VERSION`) |

## Invariants

1. **A call made inside a script behaves exactly like the equivalent tool
   call.** `ExposedFunctions.js` binds each exposed function to the SAME
   `editorFunctions` implementation and the SAME collaborators bag (including
   the coalesced `on*ModifiedOutsideEditor` callbacks) that
   `EditorFunctionCallRunner` passes — so N script calls == N tool calls.
2. **Read-only outputs never leave the editor.** `capScriptOutput.js` reduces
   `inspect_*`/`describe_*`/`read_*` record outputs to `{ message }` before the
   payload is sent (§3.4). The agent must `console.log` what it needs.
3. **Typed-output conformance.** The four "typed reads" the backend declares
   (`describe_instances`, `inspect_variables`,
   `inspect_object_properties_effects`, `inspect_behavior_properties`) must keep
   returning the declared stable fields. `typed-outputs-conformance.spec.js`
   validates their real outputs against the vendored schema fixture
   `typed-outputs-schemas.fixture.json`. **That fixture is a copy of
   `scriptApiSharedOutputTypes` / `scriptApiToolOutputSchemas` from the
   generation-api `script-api/output-types.js`; keep the two in sync (update
   both in the same change), EventScript-fixtures-style.**
4. **Never edit a shipped version's behavior.** `run_script` ships as part of
   tools `v12`; the flip-back is reverting `AI_ORCHESTRATOR_TOOLS_VERSION` to
   `'v11'`.

## Isolation

The script is evaluated with `new Function` + `"use strict"` and the common
browser globals shadowed (see `ScriptRunner.js`). This is hygiene, not a
security boundary: the script comes from our own backend LLM and can do no more
than the same LLM already can through individual tool calls. A stronger sandbox
(Worker / QuickJS-WASM) is a documented future upgrade isolated to
`evaluateScript`.
