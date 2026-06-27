# AI Subagent Evaluation Harness

A headless, daily-runnable benchmark for GDevelop's AI agents — the
**orchestrator** and its **`agent-edit`** / **`agent-explorer`** sub-agents.

It exists to answer one question safely: *"Can we swap the LLM behind a
sub-agent (e.g. GPT-5.4 mini → nano, or a new model) without losing
quality?"* — while also tracking pass-rate, latency, token and cost trends as
the tools and prompts evolve.

> This is **not** the old `GDevelop-ai-prompts` e2e harness. That one mocks the
> editor with a hand-written `mock-editor.js` and only checks "was the expected
> tool called". This harness runs the **real** editor against a **real**
> project and grades the **real** outcome.

---

## Why this design

The agent loop is, at its core, a simple request/response cycle:

```
create AiRequest ──► poll ──► read function_call(s) ──► run them ──► send results ──► poll ──► …
```

Three facts make a faithful headless harness possible:

1. **The real `EditorFunctions` already run under jest** with `global.gd` (the
   real `libGDevelop` WASM) — see `setupTests.js` and
   `EditorFunctions/EditorFunctions.spec.js`. So we can execute the *exact*
   production tool code (`processEditorFunctionCalls`) against a *real*
   `gdProject`.
2. **Every UI/backend touchpoint is an injectable callback** on
   `processEditorFunctionCalls` (`generateEvents`, `searchAndInstallAsset`,
   `ensureExtensionInstalled`, …). We wire them to faithful headless
   implementations (real backend for event generation; real object creation for
   assets).
3. **Model choice is server-side**, so we added a single, API-key-gated
   override (`aiConfiguration.modelOverridesByUsage` in `generation-api`). It
   lets the harness pin any role to any `modelUniqueId`. Because sub-agents
   inherit their parent's `aiConfiguration`, pinning `agent-edit` here pins the
   spawned edit sub-agent — exactly what we need.

The result: real backend + real prompts (from R2) + real LLM + real editor +
real project. The only thing faked is the *UI*, which a benchmark doesn't need.

### Fidelity notes (what's real vs. approximated)

| Aspect | Fidelity |
| --- | --- |
| Backend, prompts, model routing, orchestration | **Real** (dev backend) |
| Tool execution (objects, behaviors, variables, scenes, instances, events) | **Real** production code against a real `gdProject` |
| Event generation (`add_scene_events`) | **Real** backend `ai-generated-event` call, applied to the project |
| Asset install (`create_object` via store) | **Approximated**: a real object of the right type is inserted, but image/sound resources are not downloaded (headless). Structure & types are real. |
| Community extension install | **Stubbed** no-op. Built-in features work; scenarios should prefer them (or wire `ensureExtensionInstalled`). |
| Auto-edit approval | **Always approve** (an unattended benchmark wants this). |

---

## Architecture

```
runEvals.spec.js (gated entry, gives us global.gd)
        │
        ▼
runEvalSuite.js ──────────────► for each (scenario × model) × N samples
        │                               │
        ▼                               ▼
runAgentScenario.js  ◄── the real agent loop (parent + sub-agents)
        │  uses                          │ produces RunResult
        ├── BackendClient.js  (HTTP, api-key, model override)
        ├── EditorEnvironment.js (real EditorFunctions callbacks + serialization)
        └── AiRequestUtils.js (pure output parsing)
                                         │
                                         ▼
                              graders/  +  metrics.js
                              ├── objective.js  (checks vs. the real gdProject)
                              ├── llmJudge.js   (subjective rubric verdict)
                              └── scoring.js    (combine → pass/score)
                                         │
                                         ▼
                              reporter.js → Markdown + JSON report
```

Files:

- **`EvalTypes.js`** — shared types (`ModelUnderTest`, `RunResult`, `RunMetrics`,
  `GraderResult`, `CellAggregate`, `EvalReport`).
- **`BackendClient.js`** — thin api-key HTTP client (create / poll / add-message
  / generate-events) with the model-override hook.
- **`EditorEnvironment.js`** — builds the real `processEditorFunctionCalls`
  options and serializes the project to `SimplifiedProject` each turn.
- **`AiRequestUtils.js`** — pure helpers to read `output[]` (function calls,
  resolved ids, pending client-side calls, spawned sub-agents). *Unit-tested.*
- **`runAgentScenario.js`** — the headless agent loop: drives the parent and
  every spawned sub-agent, executing their client-side tool calls and feeding
  results back until the flow settles.
- **`metrics.js`** — pure derivation (turns, tool histogram, latency, tokens,
  credits) + cross-sample aggregation (pass rate, per-grader rates). *Tested.*
- **`graders/objective.js`** — deterministic checks against the real project &
  transcript, with reusable builders (`requireObjectInScene`,
  `requireBehaviorOnObject`, `requireSceneHasEvents`, `requireToolCalled`, …).
- **`graders/llmJudge.js`** — pluggable LLM judge (Anthropic by default).
  *Parsing & combination unit-tested.*
- **`graders/scoring.js`** — combine grader verdicts into pass/score. *Tested.*
- **`reporter.js`** — Markdown + JSON report. *Tested.*
- **`scenarios/`** — the benchmark cases (add to grow coverage).
- **`models.js`** — the matrix of models to benchmark.
- **`runEvals.spec.js`** — gated nightly entry that writes the report.

---

## Running it

From `newIDE/app` (requires a built `libGD.js-for-tests-only`, i.e. the normal
test toolchain):

```bash
RUN_AI_EVALS=1 \
GENERATION_API_KEY_DEV=<dev backend api key> \
ANTHROPIC_API_KEY=<key>            # optional: enables the LLM judge \
AI_EVAL_SAMPLES=3                  # samples per (scenario, model) cell \
npx jest src/EvalHarness/runEvals.spec.js --runInBand
```

Outputs `report.md` and `report.json` under `src/EvalHarness/results/<timestamp>/`.

Environment variables:

- `RUN_AI_EVALS` — must be set; otherwise the spec is skipped (so it never runs
  in the normal unit-test pass).
- `GENERATION_API_KEY` / `GENERATION_API_KEY_DEV` — backend API key (trusted
  caller; required for the model override).
- `GDEVELOP_GENERATION_API_BASE_URL` — defaults to the dev backend.
- `ANTHROPIC_API_KEY`, `ANTHROPIC_JUDGE_MODEL` — LLM judge (optional).
- `AI_EVAL_SAMPLES` — samples per cell (default 3). More samples = tighter pass
  rate, more cost/time.

The pure modules are covered by ordinary unit tests that **do** run in CI
(`*.spec.js` next to `metrics.js`, `reporter.js`, `scoring.js`, `llmJudge.js`,
`AiRequestUtils.js`).

---

## Adding a new model to benchmark

Edit `models.js`. Each entry pins one or more roles to a `modelUniqueId` from
the backend `llm-models.js`:

```js
{
  id: 'subagents=my-new-llm',
  modelUniqueId: 'my-new-llm-unique-id', // must exist in llm-models.js
  usages: ['agent-edit', 'agent-explorer'],
}
```

To benchmark a model not yet in the backend, first register it in
`generation-api/src/lib/llm-models.js` (give it a `modelUniqueId`), then
reference that id here. Use `PRODUCTION_DEFAULTS` as a control row.

You can also drive presets instead of raw models by passing `presetId` through
`BackendClient.createAiRequest` if you prefer the preset abstraction.

## Adding a new scenario

Create `scenarios/myCase.scenario.js` exporting a `Scenario`:

```js
const scenario = {
  id: 'my-case',
  description: '…',
  mode: 'orchestrator',
  createInitialProject: gd => makeProjectWithScene(gd, { … }),
  userRequest: '…',
  objectiveGraders: [requireRunCompleted(), requireObjectInScene('Level', 'Foo')],
  llmJudgeRubric: 'Pass if …',
};
export default scenario;
```

Then register it in `scenarios/index.js`. It's picked up automatically and
tracked per model over time.

---

## How "pass" is decided

Each sample is graded by a mix of:

- **Objective graders** — deterministic, run against the real `gdProject`
  (does the object exist? does the behavior attach? do events exist? did any
  tool fail?). These are the backbone.
- **An optional LLM judge** — a rubric-based subjective check for things that
  are correct-but-not-exact (are the generated jump events sensible? is the
  explanation right?).

A sample **passes** only if *every* grader passes. The **score** is the
weighted mean of grader scores. Across N samples we report the **pass rate**
and **mean score** per (scenario, model), plus per-grader pass rates so you can
see *which* dimension regressed.
