// @flow

/**
 * Objective (deterministic) graders. They inspect the *real* `gdProject` left
 * by the run and/or the transcript, so they verify what actually happened in
 * the engine - not just what the model claimed.
 *
 * A scenario declares graders as an array of `{ id, weight?, run(context) }`.
 * `context` is `{ gd, project, runResult, assistantText }`. `run` returns
 * `{ passed, score?, message }`. Use the builders below for common checks.
 */

import { type GraderResult, type RunResult } from '../EvalTypes';
import { getAssistantText } from '../AiRequestUtils';

export type GraderContext = {|
  gd: Object,
  project: ?Object,
  runResult: RunResult,
  assistantText: string,
|};

export type ObjectiveGrader = {|
  id: string,
  weight?: number,
  run: (context: GraderContext) => {| passed: boolean, score?: number, message: string |},
|};

const toArray = (vectorString: Object): Array<string> => {
  const result = [];
  for (let i = 0; i < vectorString.size(); i++) {
    result.push(vectorString.at(i));
  }
  return result;
};

const getSceneObjectsContainer = (project: Object, sceneName: string): ?Object => {
  if (!project.hasLayoutNamed(sceneName)) return null;
  return project.getLayout(sceneName).getObjects();
};

/** Run a scenario's objective graders, normalizing to GraderResult. */
export const runObjectiveGraders = ({
  graders,
  gd,
  project,
  runResult,
}: {|
  graders: Array<ObjectiveGrader>,
  gd: Object,
  project: ?Object,
  runResult: RunResult,
|}): Array<GraderResult> => {
  const parent =
    runResult.requests.find(r => !r.parentAiRequestId) ||
    runResult.requests[0];
  const assistantText = parent ? getAssistantText(parent) : '';
  const context: GraderContext = { gd, project, runResult, assistantText };

  return graders.map(grader => {
    let verdict;
    try {
      verdict = grader.run(context);
    } catch (error) {
      verdict = {
        passed: false,
        score: 0,
        message: `Grader threw: ${(error && error.message) || error}`,
      };
    }
    return {
      graderId: grader.id,
      kind: 'objective',
      passed: !!verdict.passed,
      score:
        typeof verdict.score === 'number'
          ? verdict.score
          : verdict.passed
          ? 1
          : 0,
      weight: grader.weight || 1,
      message: verdict.message,
    };
  });
};

// ---------------------------------------------------------------------------
// Reusable grader builders
// ---------------------------------------------------------------------------

export const requireSceneExists = (sceneName: string): ObjectiveGrader => ({
  id: `scene-exists:${sceneName}`,
  run: ({ project }) => {
    const passed = !!project && project.hasLayoutNamed(sceneName);
    return {
      passed,
      message: passed
        ? `Scene "${sceneName}" exists.`
        : `Scene "${sceneName}" is missing.`,
    };
  },
});

export const requireObjectInScene = (
  sceneName: string,
  objectName: string
): ObjectiveGrader => ({
  id: `object-in-scene:${sceneName}/${objectName}`,
  run: ({ project }) => {
    const container =
      project && getSceneObjectsContainer(project, sceneName);
    const passed = !!container && container.hasObjectNamed(objectName);
    return {
      passed,
      message: passed
        ? `Object "${objectName}" exists in "${sceneName}".`
        : `Object "${objectName}" not found in "${sceneName}".`,
    };
  },
});

export const requireBehaviorOnObject = ({
  sceneName,
  objectName,
  behaviorType,
}: {|
  sceneName: string,
  objectName: string,
  behaviorType: string,
|}): ObjectiveGrader => ({
  id: `behavior-on-object:${objectName}/${behaviorType}`,
  run: ({ project }) => {
    const container =
      project && getSceneObjectsContainer(project, sceneName);
    if (!container || !container.hasObjectNamed(objectName)) {
      return {
        passed: false,
        message: `Object "${objectName}" not found in "${sceneName}".`,
      };
    }
    const object = container.getObject(objectName);
    const behaviorTypes = toArray(object.getAllBehaviorNames()).map(name =>
      object.getBehavior(name).getTypeName()
    );
    const passed = behaviorTypes.includes(behaviorType);
    return {
      passed,
      message: passed
        ? `"${objectName}" has behavior "${behaviorType}".`
        : `"${objectName}" is missing behavior "${behaviorType}" (has: ${behaviorTypes.join(
            ', '
          ) || 'none'}).`,
    };
  },
});

export const requireSceneHasEvents = (sceneName: string): ObjectiveGrader => ({
  id: `scene-has-events:${sceneName}`,
  run: ({ project }) => {
    if (!project || !project.hasLayoutNamed(sceneName)) {
      return { passed: false, message: `Scene "${sceneName}" missing.` };
    }
    const eventsCount = project
      .getLayout(sceneName)
      .getEvents()
      .getEventsCount();
    const passed = eventsCount > 0;
    return {
      passed,
      message: passed
        ? `Scene "${sceneName}" has ${eventsCount} top-level event(s).`
        : `Scene "${sceneName}" has no events.`,
    };
  },
});

export const requireToolCalled = (toolName: string): ObjectiveGrader => ({
  id: `tool-called:${toolName}`,
  run: ({ runResult }) => {
    const passed = runResult.executedToolCalls.some(
      t => t.call.name === toolName
    );
    return {
      passed,
      message: passed
        ? `Tool "${toolName}" was called.`
        : `Tool "${toolName}" was never called.`,
    };
  },
});

export const requireNoToolFailures = (): ObjectiveGrader => ({
  id: 'no-tool-failures',
  run: ({ runResult }) => {
    const failures = runResult.executedToolCalls.filter(t => !t.success);
    return {
      passed: failures.length === 0,
      message: failures.length
        ? `${failures.length} tool call(s) failed: ${failures
            .map(f => f.call.name)
            .join(', ')}.`
        : 'No tool call failures.',
    };
  },
});

export const requireRunCompleted = (): ObjectiveGrader => ({
  id: 'run-completed',
  run: ({ runResult }) => ({
    passed: runResult.completed,
    message: runResult.completed
      ? 'Run completed cleanly.'
      : `Run did not complete: ${runResult.failureReason || 'unknown'}.`,
  }),
});

/** Custom predicate over the context, for scenario-specific checks. */
export const custom = (
  id: string,
  run: (context: GraderContext) => {| passed: boolean, score?: number, message: string |},
  weight?: number
): ObjectiveGrader => ({ id, run, weight });
