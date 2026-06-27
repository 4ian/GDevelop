// @flow
/* eslint-disable jest/no-standalone-expect, global-require */

/**
 * Daily/nightly benchmark entry point.
 *
 * This is a jest spec so it gets the real `global.gd` (libGDevelop WASM) for
 * free from setupTests.js, exactly like the other EditorFunctions tests. It is
 * GATED behind RUN_AI_EVALS so it never runs in the normal unit-test pass.
 * Heavy modules are required lazily inside the test so a skipped run stays cheap.
 *
 * Run it with, from newIDE/app:
 *   RUN_AI_EVALS=1 \
 *   GENERATION_API_KEY_DEV=... \
 *   ANTHROPIC_API_KEY=...        # optional, enables the LLM judge \
 *   npx jest src/EvalHarness/runEvals.spec.js --runInBand
 *
 * It writes a Markdown + JSON report under src/EvalHarness/results/.
 */

const shouldRun = !!process.env.RUN_AI_EVALS;
const samplesPerCell = Number(process.env.AI_EVAL_SAMPLES || '3');

// Long-running: a full matrix can take many minutes.
jest.setTimeout(60 * 60 * 1000);

(shouldRun ? describe : describe.skip)('AI subagent benchmark', () => {
  it('runs the full scenario × model matrix and writes a report', async () => {
    const fs = require('fs');
    const path = require('path');
    const { makeBackendClient } = require('./BackendClient');
    const { runEvalSuite } = require('./runEvalSuite');
    const { allScenarios } = require('./scenarios');
    const { defaultModelMatrix } = require('./models');
    const { renderMarkdownReport, renderJsonReport } = require('./reporter');
    const { makeAnthropicJudge } = require('./graders/llmJudge');

    const gd: any = global.gd;
    const backendClient = makeBackendClient();
    const judge = process.env.ANTHROPIC_API_KEY ? makeAnthropicJudge() : null;
    if (!judge) {
      console.info(
        'ℹ️ No ANTHROPIC_API_KEY set - running with objective graders only.'
      );
    }

    const report = await runEvalSuite({
      gd,
      backendClient,
      scenarios: allScenarios,
      models: defaultModelMatrix,
      samplesPerCell,
      judge,
      onProgress: ({ scenarioId, modelId, sampleIndex, passed }) => {
        console.info(
          `  ${passed ? '✅' : '❌'} ${scenarioId} / ${modelId} ` +
            `(${sampleIndex + 1}/${samplesPerCell})`
        );
      },
    });

    const resultsDir = path.join(
      __dirname,
      'results',
      report.startedAt.replace(/[:.]/g, '-')
    );
    fs.mkdirSync(resultsDir, { recursive: true });
    fs.writeFileSync(
      path.join(resultsDir, 'report.md'),
      renderMarkdownReport(report)
    );
    fs.writeFileSync(
      path.join(resultsDir, 'report.json'),
      renderJsonReport(report)
    );

    console.info('\n' + renderMarkdownReport(report));
    console.info(`\n📄 Report written to ${resultsDir}`);

    expect(report.cells.length).toBe(
      allScenarios.length * defaultModelMatrix.length
    );
  });
});
