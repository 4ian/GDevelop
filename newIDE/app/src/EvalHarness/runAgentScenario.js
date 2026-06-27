// @flow

/**
 * Drives one full, real agent run headlessly: it creates the AiRequest on the
 * backend, then loops - polling the parent request and every sub-agent it
 * spawns, executing their client-side tool calls against a real `gdProject`
 * with the real `processEditorFunctionCalls`, and sending the results back -
 * until the whole flow settles.
 *
 * This is the headless equivalent of AiGeneration/AiRequestContext.js +
 * AiGeneration/Utils.js#useProcessFunctionCalls, minus the UI concerns
 * (auto-edit approval is implicitly "always approve", which is what an
 * unattended benchmark wants).
 */

import { processEditorFunctionCalls } from '../EditorFunctions/EditorFunctionCallRunner';
import { delay } from '../Utils/Delay';
import {
  type AiRequest,
  type RunResult,
  type TurnTiming,
  type ModelUnderTest,
} from './EvalTypes';
import { type BackendClient } from './BackendClient';
import { type EditorEnvironment } from './EditorEnvironment';
import {
  getPendingClientCalls,
  getSpawnedSubAgentIds,
  hasUnresolvedCalls,
} from './AiRequestUtils';

export type Scenario = {|
  id: string,
  description: string,
  mode: 'chat' | 'agent' | 'orchestrator',
  toolsVersion?: string,
  /** Build the starting project (return null to exercise initialize_project). */
  createInitialProject: (gd: Object) => ?Object,
  userRequest: string,
  /** Objective graders, run against the final project + transcript. */
  objectiveGraders?: Array<Object>,
  /** Optional rubric handed to the LLM judge. */
  llmJudgeRubric?: string,
  /** Safety cap on loop rounds (default 80). */
  maxRounds?: number,
|};

/** Translate a ModelUnderTest into the backend's per-usage override map. */
export const buildModelOverrides = (
  modelUnderTest: ModelUnderTest
): { [usage: string]: string } | null => {
  if (!modelUnderTest.modelUniqueId || modelUnderTest.usages.length === 0) {
    return null; // Production defaults.
  }
  const overrides = {};
  modelUnderTest.usages.forEach(usage => {
    overrides[usage] = modelUnderTest.modelUniqueId;
  });
  return overrides;
};

const OVERALL_TIMEOUT_MS = 8 * 60 * 1000;
const POLL_INTERVAL_MS = 1500;

/**
 * Re-fetch a single request and, if it is still generating, poll until it
 * settles. `wasWorking` tells the caller whether real backend (LLM) time was
 * spent, so only genuine generations are recorded as latency. Re-fetching even
 * already-settled requests every round is what lets us observe the backend
 * flipping the parent back to 'working' after a sub-agent's wrap-up.
 */
const pollUntilSettled = async (
  backendClient: BackendClient,
  aiRequestId: string
): Promise<{| aiRequest: AiRequest, backendMs: number, wasWorking: boolean |}> => {
  const start = Date.now();
  let aiRequest = await backendClient.getAiRequest(aiRequestId);
  const wasWorking = aiRequest.status === 'working';
  while (aiRequest.status === 'working') {
    await delay(POLL_INTERVAL_MS);
    aiRequest = await backendClient.getAiRequest(aiRequestId);
    if (Date.now() - start > OVERALL_TIMEOUT_MS) break;
  }
  return { aiRequest, backendMs: Date.now() - start, wasWorking };
};

export const runAgentScenario = async ({
  gd,
  backendClient,
  editorEnvironment,
  scenario,
  modelUnderTest,
}: {|
  gd: Object,
  backendClient: BackendClient,
  editorEnvironment: EditorEnvironment,
  scenario: Scenario,
  modelUnderTest: ModelUnderTest,
|}): Promise<RunResult> => {
  const startedAt = Date.now();
  let project: ?Object = scenario.createInitialProject(gd);
  const executedToolCalls = [];
  const timings: Array<TurnTiming> = [];

  const serialize = () =>
    project
      ? editorEnvironment.serializeProject(project)
      : { gameProjectJson: null, projectSpecificExtensionsSummaryJson: null };

  const baseResult = {
    scenarioId: scenario.id,
    modelUnderTestId: modelUnderTest.id,
    project,
    requests: [],
    executedToolCalls,
    timings,
  };

  let parentId: string;
  /** id -> latest AiRequest. Insertion order = creation order. */
  const requestsById: Map<string, AiRequest> = new Map();

  try {
    const initial = serialize();
    const parent = await backendClient.createAiRequest({
      userRequest: scenario.userRequest,
      gameProjectJson: initial.gameProjectJson,
      projectSpecificExtensionsSummaryJson:
        initial.projectSpecificExtensionsSummaryJson,
      mode: scenario.mode,
      toolsVersion: scenario.toolsVersion || 'v6',
      modelOverridesByUsage: buildModelOverrides(modelUnderTest),
    });
    parentId = parent.id;
    requestsById.set(parent.id, parent);
  } catch (error) {
    return {
      ...baseResult,
      project,
      requests: [],
      completed: false,
      failureReason: `createAiRequest failed: ${(error && error.message) ||
        error}`,
      totalMs: Date.now() - startedAt,
    };
  }

  const maxRounds = scenario.maxRounds || 80;
  let round = 0;

  try {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (round++ > maxRounds) {
        return {
          ...baseResult,
          project,
          requests: Array.from(requestsById.values()),
          completed: false,
          failureReason: `Exceeded ${maxRounds} rounds (possible loop).`,
          totalMs: Date.now() - startedAt,
        };
      }
      if (Date.now() - startedAt > OVERALL_TIMEOUT_MS) {
        return {
          ...baseResult,
          project,
          requests: Array.from(requestsById.values()),
          completed: false,
          failureReason: 'Overall timeout exceeded.',
          totalMs: Date.now() - startedAt,
        };
      }

      // 1. Re-fetch and settle every request. Re-fetching settled requests too
      //    is deliberate: it surfaces backend-driven transitions (notably the
      //    parent flipping back to 'working' once a sub-agent it spawned wraps
      //    up). Only genuine generations are recorded as backend latency.
      for (const id of Array.from(requestsById.keys())) {
        const { aiRequest, backendMs, wasWorking } = await pollUntilSettled(
          backendClient,
          id
        );
        requestsById.set(id, aiRequest);
        if (wasWorking) {
          timings.push({ aiRequestId: id, backendMs, toolsMs: 0 });
        }
      }

      // 2. Discover any newly-spawned sub-agents and start tracking them.
      for (const aiRequest of Array.from(requestsById.values())) {
        for (const subId of getSpawnedSubAgentIds(aiRequest)) {
          if (!requestsById.has(subId)) {
            const subAgent = await backendClient.getAiRequest(subId);
            requestsById.set(subId, subAgent);
          }
        }
      }

      // 3. Execute pending client-side tool calls for each request.
      let didSomething = false;
      for (const id of Array.from(requestsById.keys())) {
        const aiRequest = requestsById.get(id);
        if (!aiRequest || aiRequest.status === 'working') continue;
        const pending = getPendingClientCalls(aiRequest);
        if (pending.length === 0) continue;
        didSomething = true;

        const toolsStart = Date.now();
        const {
          results,
          createdProject,
        } = await processEditorFunctionCalls({
          ...editorEnvironment.buildProcessOptions({
            project,
            relatedAiRequestId: id,
            getRelatedAiRequestLastMessages: () => ({
              lastUserMessage: null,
              lastAssistantMessages: [],
            }),
          }),
          functionCalls: pending.map(call => ({
            name: call.name,
            arguments: call.arguments,
            call_id: call.call_id,
          })),
        });
        if (!project && createdProject) {
          project = createdProject;
        }
        timings.push({
          aiRequestId: id,
          backendMs: 0,
          toolsMs: Date.now() - toolsStart,
        });

        const functionCallOutputs = [];
        results.forEach(result => {
          if (result.status !== 'finished') return; // skip aborted/working
          const { success, output } = result;
          executedToolCalls.push({
            aiRequestId: id,
            call: pending.find(c => c.call_id === result.call_id) || {
              call_id: result.call_id,
              name: 'unknown',
              arguments: '{}',
            },
            success: !!success,
            didModifyProject: !!result.didModifyProject,
            output: output || {},
          });
          functionCallOutputs.push({
            type: 'function_call_output',
            call_id: result.call_id,
            output: JSON.stringify({ success, ...(output || {}) }),
          });
        });

        if (functionCallOutputs.length > 0) {
          const serialized = serialize();
          const updated = await backendClient.addMessage({
            aiRequestId: id,
            functionCallOutputs,
            gameProjectJson: serialized.gameProjectJson,
            projectSpecificExtensionsSummaryJson:
              serialized.projectSpecificExtensionsSummaryJson,
          });
          requestsById.set(id, updated);
        }
      }

      // 4. Termination check: nothing executed this round, parent finished, and
      //    no request is still generating or has anything in flight.
      const anyWorking = Array.from(requestsById.values()).some(
        r => r.status === 'working'
      );
      const anyUnresolved = Array.from(requestsById.values()).some(r =>
        hasUnresolvedCalls(r)
      );
      const parent = requestsById.get(parentId);
      const parentDone = !!parent && parent.status !== 'working';

      if (!didSomething && parentDone && !anyWorking && !anyUnresolved) {
        break;
      }
      if (!didSomething && (anyWorking || anyUnresolved)) {
        // Backend still wrapping up (e.g. folding a finished sub-agent into the
        // parent). Wait a beat before re-polling.
        await delay(POLL_INTERVAL_MS);
      }
    }
  } catch (error) {
    return {
      ...baseResult,
      project,
      requests: Array.from(requestsById.values()),
      completed: false,
      failureReason: `Run loop error: ${(error && error.message) || error}`,
      totalMs: Date.now() - startedAt,
    };
  }

  const parent = requestsById.get(parentId);
  return {
    ...baseResult,
    project,
    requests: Array.from(requestsById.values()),
    completed: !!parent && parent.status === 'ready',
    failureReason:
      parent && parent.status === 'ready'
        ? undefined
        : `Parent ended with status: ${parent ? parent.status : 'missing'}`,
    totalMs: Date.now() - startedAt,
  };
};
