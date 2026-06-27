// @flow
import { deriveRunMetrics, aggregateCell } from './metrics';

const makeRunResult = (overrides): any => ({
  scenarioId: 's1',
  modelUnderTestId: 'm1',
  completed: true,
  project: null,
  requests: [
    {
      id: 'parent',
      status: 'ready',
      mode: 'orchestrator',
      parentAiRequestId: null,
      output: [],
      stats: { finalModelPublicId: 'deepseek-v4-pro', totalTokens: 1200 },
      totalPriceInCredits: 1.5,
    },
    {
      id: 'sub',
      status: 'ready',
      mode: 'agent-edit',
      parentAiRequestId: 'parent',
      output: [],
      stats: { finalModelPublicId: 'gpt-5.4-nano', totalTokens: 800 },
    },
  ],
  executedToolCalls: [
    { aiRequestId: 'sub', call: { name: 'create_object' }, success: true, output: {} },
    { aiRequestId: 'sub', call: { name: 'create_object' }, success: true, output: {} },
    { aiRequestId: 'sub', call: { name: 'add_scene_events' }, success: false, output: {} },
  ],
  timings: [
    { aiRequestId: 'parent', backendMs: 3000, toolsMs: 0 },
    { aiRequestId: 'sub', backendMs: 2000, toolsMs: 0 },
    { aiRequestId: 'sub', backendMs: 0, toolsMs: 150 },
  ],
  totalMs: 6000,
  ...overrides,
});

describe('deriveRunMetrics', () => {
  test('derives counts, histogram, tokens and credits', () => {
    const metrics = deriveRunMetrics(makeRunResult());
    expect(metrics.toolCallCount).toBe(3);
    expect(metrics.subAgentCount).toBe(1);
    expect(metrics.toolCallHistogram).toEqual({
      create_object: 2,
      add_scene_events: 1,
    });
    expect(metrics.turnCount).toBe(2); // two backend generations
    expect(metrics.backendMs).toBe(5000);
    expect(metrics.toolsMs).toBe(150);
    expect(metrics.totalTokens).toBe(2000); // 1200 + 800
    expect(metrics.credits).toBe(1.5);
    expect(metrics.finalModelPublicIds).toEqual([
      'deepseek-v4-pro',
      'gpt-5.4-nano',
    ]);
  });

  test('totalTokens is null when no request reports tokens', () => {
    const run = makeRunResult({
      requests: [
        { id: 'parent', status: 'ready', mode: 'orchestrator', output: [] },
      ],
    });
    expect(deriveRunMetrics(run).totalTokens).toBeNull();
  });
});

describe('aggregateCell', () => {
  const makeSample = (passed, score, totalMs, completed = true): any => ({
    runResult: { ...makeRunResult(), completed, totalMs },
    metrics: deriveRunMetrics({ ...makeRunResult(), totalMs }),
    graderResults: [
      { graderId: 'run-completed', kind: 'objective', passed, score, weight: 1, message: '' },
      { graderId: 'llm-judge', kind: 'llm-judge', passed, score, weight: 1, message: '' },
    ],
    passed,
    score,
  });

  test('computes pass rate, mean score and per-grader pass rates', () => {
    const cell = aggregateCell({
      scenarioId: 's1',
      modelUnderTestId: 'm1',
      samples: [
        makeSample(true, 1, 5000),
        makeSample(false, 0.5, 7000),
        makeSample(true, 1, 6000),
      ],
    });
    expect(cell.sampleCount).toBe(3);
    expect(cell.passRate).toBeCloseTo(2 / 3);
    expect(cell.meanScore).toBeCloseTo((1 + 0.5 + 1) / 3);
    expect(cell.graderPassRates['run-completed']).toBeCloseTo(2 / 3);
    expect(cell.graderPassRates['llm-judge']).toBeCloseTo(2 / 3);
    expect(cell.latencyMsAvg).toBeCloseTo(6000);
    expect(cell.latencyMsMax).toBe(7000);
  });

  test('counts errored (non-completed) samples', () => {
    const cell = aggregateCell({
      scenarioId: 's1',
      modelUnderTestId: 'm1',
      samples: [makeSample(true, 1, 5000), makeSample(false, 0, 5000, false)],
    });
    expect(cell.erroredSampleCount).toBe(1);
  });
});
