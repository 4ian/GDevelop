// @flow

/**
 * Pure metric derivation and aggregation. No network, no `gd`. See metrics.spec.js.
 */

import {
  type RunResult,
  type RunMetrics,
  type SampleResult,
  type CellAggregate,
} from './EvalTypes';

const sum = (xs: Array<number>): number => xs.reduce((a, b) => a + b, 0);
const avg = (xs: Array<number>): number => (xs.length ? sum(xs) / xs.length : 0);
const max = (xs: Array<number>): number =>
  xs.length ? Math.max(...xs) : 0;

/** Read a numeric token total from a request's stats/contextStats, if present. */
const readTokensForRequest = (request: Object): number | null => {
  if (request.stats && typeof request.stats.totalTokens === 'number') {
    return request.stats.totalTokens;
  }
  if (
    request.contextStats &&
    typeof request.contextStats.totalTokens === 'number'
  ) {
    return request.contextStats.totalTokens;
  }
  return null;
};

export const deriveRunMetrics = (runResult: RunResult): RunMetrics => {
  const toolCallHistogram: { [string]: number } = {};
  runResult.executedToolCalls.forEach(({ call }) => {
    toolCallHistogram[call.name] = (toolCallHistogram[call.name] || 0) + 1;
  });

  const backendMs = sum(runResult.timings.map(t => t.backendMs));
  const toolsMs = sum(runResult.timings.map(t => t.toolsMs));
  const turnCount = runResult.timings.filter(t => t.backendMs > 0).length;

  const perRequestTokens = runResult.requests
    .map(readTokensForRequest)
    .filter(t => t !== null);
  const totalTokens = perRequestTokens.length
    ? sum(((perRequestTokens: any): Array<number>))
    : null;

  const parent =
    runResult.requests.find(r => !r.parentAiRequestId) ||
    runResult.requests[0];
  const credits =
    parent && typeof parent.totalPriceInCredits === 'number'
      ? parent.totalPriceInCredits
      : null;

  const finalModelPublicIds = runResult.requests
    .map(r => (r.stats && r.stats.finalModelPublicId) || null)
    .filter(Boolean);

  return {
    turnCount,
    toolCallCount: runResult.executedToolCalls.length,
    subAgentCount: Math.max(0, runResult.requests.length - 1),
    toolCallHistogram,
    totalMs: runResult.totalMs,
    backendMs,
    toolsMs,
    totalTokens,
    credits,
    finalModelPublicIds,
  };
};

/**
 * Aggregate all samples of a single (scenario, model) cell into pass rate,
 * mean score, per-grader pass rates, and latency/token/credit/tool stats.
 */
export const aggregateCell = ({
  scenarioId,
  modelUnderTestId,
  samples,
}: {|
  scenarioId: string,
  modelUnderTestId: string,
  samples: Array<SampleResult>,
|}): CellAggregate => {
  const sampleCount = samples.length;
  const completedSamples = samples.filter(s => s.runResult.completed);
  const erroredSampleCount = sampleCount - completedSamples.length;

  const passRate = sampleCount
    ? samples.filter(s => s.passed).length / sampleCount
    : 0;
  const meanScore = avg(samples.map(s => s.score));

  // Per-grader pass rate across all samples that produced that grader.
  const graderPassRates: { [string]: number } = {};
  const graderTotals: { [string]: { passed: number, total: number } } = {};
  samples.forEach(sample => {
    sample.graderResults.forEach(g => {
      if (!graderTotals[g.graderId]) {
        graderTotals[g.graderId] = { passed: 0, total: 0 };
      }
      graderTotals[g.graderId].total += 1;
      if (g.passed) graderTotals[g.graderId].passed += 1;
    });
  });
  Object.keys(graderTotals).forEach(graderId => {
    const { passed, total } = graderTotals[graderId];
    graderPassRates[graderId] = total ? passed / total : 0;
  });

  const latencies = samples.map(s => s.metrics.totalMs);
  const tokenValues = samples
    .map(s => s.metrics.totalTokens)
    .filter(t => t !== null);
  const creditValues = samples
    .map(s => s.metrics.credits)
    .filter(c => c !== null);

  return {
    scenarioId,
    modelUnderTestId,
    sampleCount,
    passRate,
    meanScore,
    graderPassRates,
    latencyMsAvg: avg(latencies),
    latencyMsMax: max(latencies),
    tokensAvg: tokenValues.length
      ? avg(((tokenValues: any): Array<number>))
      : null,
    tokensMax: tokenValues.length
      ? max(((tokenValues: any): Array<number>))
      : null,
    creditsAvg: creditValues.length
      ? avg(((creditValues: any): Array<number>))
      : null,
    toolCallsAvg: avg(samples.map(s => s.metrics.toolCallCount)),
    erroredSampleCount,
  };
};
