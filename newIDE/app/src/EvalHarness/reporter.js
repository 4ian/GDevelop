// @flow

/**
 * Pure rendering of an EvalReport to Markdown / JSON. No `gd`, no network.
 * See reporter.spec.js.
 */

import { type EvalReport, type CellAggregate } from './EvalTypes';

const pct = (x: number): string => `${(x * 100).toFixed(0)}%`;
const ms = (x: number): string => `${(x / 1000).toFixed(1)}s`;
const num = (x: number | null, digits: number = 0): string =>
  x === null ? '—' : x.toFixed(digits);

const cellsForScenario = (
  report: EvalReport,
  scenarioId: string
): Array<CellAggregate> =>
  report.cells.filter(c => c.scenarioId === scenarioId);

export const renderMarkdownReport = (report: EvalReport): string => {
  const lines = [];
  lines.push(`# AI Subagent Benchmark`);
  lines.push('');
  lines.push(`- Started: ${report.startedAt}`);
  lines.push(`- Finished: ${report.finishedAt}`);
  lines.push(`- Backend: \`${report.backendBaseUrl}\``);
  lines.push(`- Samples per cell: ${report.samplesPerCell}`);
  lines.push(
    `- Models under test: ${report.modelsUnderTest
      .map(m => `\`${m.id}\``)
      .join(', ')}`
  );
  lines.push('');

  report.scenarioIds.forEach(scenarioId => {
    lines.push(`## Scenario: \`${scenarioId}\``);
    lines.push('');
    lines.push(
      '| Model | Pass rate | Score | Latency avg | Latency max | Tokens avg | Credits avg | Tools avg | Errored |'
    );
    lines.push(
      '| --- | --- | --- | --- | --- | --- | --- | --- | --- |'
    );
    cellsForScenario(report, scenarioId).forEach(cell => {
      lines.push(
        `| \`${cell.modelUnderTestId}\` | ${pct(cell.passRate)} | ${cell.meanScore.toFixed(
          2
        )} | ${ms(cell.latencyMsAvg)} | ${ms(cell.latencyMsMax)} | ${num(
          cell.tokensAvg
        )} | ${num(cell.creditsAvg, 2)} | ${cell.toolCallsAvg.toFixed(
          1
        )} | ${cell.erroredSampleCount}/${cell.sampleCount} |`
      );
    });
    lines.push('');

    // Per-grader breakdown (helps see *which* dimension regressed).
    const graderIds = new Set();
    cellsForScenario(report, scenarioId).forEach(cell =>
      Object.keys(cell.graderPassRates).forEach(g => graderIds.add(g))
    );
    if (graderIds.size > 0) {
      const graderList = Array.from(graderIds);
      lines.push(
        `| Model | ${graderList.map(g => `\`${g}\``).join(' | ')} |`
      );
      lines.push(`| --- | ${graderList.map(() => '---').join(' | ')} |`);
      cellsForScenario(report, scenarioId).forEach(cell => {
        lines.push(
          `| \`${cell.modelUnderTestId}\` | ${graderList
            .map(g =>
              cell.graderPassRates[g] === undefined
                ? '—'
                : pct(cell.graderPassRates[g])
            )
            .join(' | ')} |`
        );
      });
      lines.push('');
    }
  });

  return lines.join('\n');
};

export const renderJsonReport = (report: EvalReport): string =>
  JSON.stringify(report, null, 2);
