// @flow
import { renderMarkdownReport, renderJsonReport } from './reporter';

const report: any = {
  startedAt: '2026-06-27T10:00:00.000Z',
  finishedAt: '2026-06-27T10:30:00.000Z',
  backendBaseUrl: 'https://api-dev.gdevelop.io/generation',
  scenarioIds: ['orchestrator-add-enemy'],
  modelsUnderTest: [
    { id: 'production-defaults', modelUniqueId: '', usages: [] },
    { id: 'subagents=gpt-5.4-nano', modelUniqueId: 'gpt5.4n-or-openai', usages: ['agent-edit'] },
  ],
  samplesPerCell: 3,
  cells: [
    {
      scenarioId: 'orchestrator-add-enemy',
      modelUnderTestId: 'production-defaults',
      sampleCount: 3,
      passRate: 1,
      meanScore: 0.97,
      graderPassRates: { 'run-completed': 1, 'object-in-scene:Level/Enemy': 1 },
      latencyMsAvg: 12000,
      latencyMsMax: 15000,
      tokensAvg: 3400,
      tokensMax: 4000,
      creditsAvg: 0.75,
      toolCallsAvg: 2,
      erroredSampleCount: 0,
    },
    {
      scenarioId: 'orchestrator-add-enemy',
      modelUnderTestId: 'subagents=gpt-5.4-nano',
      sampleCount: 3,
      passRate: 0.6667,
      meanScore: 0.7,
      graderPassRates: { 'run-completed': 1, 'object-in-scene:Level/Enemy': 0.6667 },
      latencyMsAvg: 9000,
      latencyMsMax: 11000,
      tokensAvg: 3000,
      tokensMax: 3500,
      creditsAvg: 0.3,
      toolCallsAvg: 2,
      erroredSampleCount: 0,
    },
  ],
};

describe('renderMarkdownReport', () => {
  const md = renderMarkdownReport(report);

  test('includes a header with the scenario and both models', () => {
    expect(md).toMatch(/# AI Subagent Benchmark/);
    expect(md).toMatch(/## Scenario: `orchestrator-add-enemy`/);
    expect(md).toMatch(/production-defaults/);
    expect(md).toMatch(/subagents=gpt-5.4-nano/);
  });

  test('renders pass rate as a percentage and a per-grader table', () => {
    expect(md).toMatch(/100%/);
    expect(md).toMatch(/67%/); // 0.6667 -> 67%
    expect(md).toMatch(/object-in-scene:Level\/Enemy/);
  });
});

describe('renderJsonReport', () => {
  test('round-trips to the same object', () => {
    expect(JSON.parse(renderJsonReport(report))).toEqual(report);
  });
});
