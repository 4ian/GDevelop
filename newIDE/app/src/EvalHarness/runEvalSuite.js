// @flow

/**
 * Orchestrates a full benchmark: for every (scenario × model-under-test) cell,
 * run N samples, grade each (objective + optional LLM judge), and aggregate into
 * an EvalReport. This is the entry point a daily/nightly job calls.
 */

import { makeEditorEnvironment } from './EditorEnvironment';
import { runAgentScenario, type Scenario } from './runAgentScenario';
import { deriveRunMetrics, aggregateCell } from './metrics';
import { runObjectiveGraders } from './graders/objective';
import { runLlmJudge, type JudgeFn } from './graders/llmJudge';
import { combineGraderResults } from './graders/scoring';
import {
  type ModelUnderTest,
  type EvalReport,
  type SampleResult,
  type CellAggregate,
} from './EvalTypes';
import { type BackendClient } from './BackendClient';

export type SuiteProgress = {|
  scenarioId: string,
  modelId: string,
  sampleIndex: number,
  samplesPerCell: number,
  passed: boolean,
|};

export const runEvalSuite = async ({
  gd,
  backendClient,
  scenarios,
  models,
  samplesPerCell,
  judge,
  onProgress,
}: {|
  gd: Object,
  backendClient: BackendClient,
  scenarios: Array<Scenario>,
  models: Array<ModelUnderTest>,
  samplesPerCell: number,
  judge?: ?JudgeFn,
  onProgress?: (progress: SuiteProgress) => void,
|}): Promise<EvalReport> => {
  const startedAt = new Date().toISOString();
  const editorEnvironment = makeEditorEnvironment({ gd, backendClient });
  const cells: Array<CellAggregate> = [];

  for (const scenario of scenarios) {
    for (const modelUnderTest of models) {
      const samples: Array<SampleResult> = [];
      for (let sampleIndex = 0; sampleIndex < samplesPerCell; sampleIndex++) {
        const runResult = await runAgentScenario({
          gd,
          backendClient,
          editorEnvironment,
          scenario,
          modelUnderTest,
        });

        const metrics = deriveRunMetrics(runResult);

        const graderResults = runObjectiveGraders({
          graders: scenario.objectiveGraders || [],
          gd,
          project: runResult.project,
          runResult,
        });

        if (scenario.llmJudgeRubric && judge) {
          graderResults.push(
            await runLlmJudge({
              rubric: scenario.llmJudgeRubric,
              runResult,
              judge,
            })
          );
        }

        const { passed, score } = combineGraderResults(graderResults);

        // Free the live project now that grading is done.
        if (runResult.project && typeof runResult.project.delete === 'function') {
          try {
            runResult.project.delete();
          } catch (error) {
            // ignore
          }
        }
        // Don't keep the (now-deleted) project handle in the report.
        const cleanedRun = { ...runResult, project: null };

        samples.push({
          runResult: cleanedRun,
          metrics,
          graderResults,
          passed,
          score,
        });

        if (onProgress) {
          onProgress({
            scenarioId: scenario.id,
            modelId: modelUnderTest.id,
            sampleIndex,
            samplesPerCell,
            passed,
          });
        }
      }

      cells.push(
        aggregateCell({
          scenarioId: scenario.id,
          modelUnderTestId: modelUnderTest.id,
          samples,
        })
      );
    }
  }

  return {
    startedAt,
    finishedAt: new Date().toISOString(),
    backendBaseUrl: backendClient.baseUrl,
    scenarioIds: scenarios.map(s => s.id),
    modelsUnderTest: models,
    samplesPerCell,
    cells,
  };
};
