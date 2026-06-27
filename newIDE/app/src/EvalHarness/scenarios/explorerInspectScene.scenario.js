// @flow

/**
 * Orchestrator scenario exercising the EXPLORER (read-only) sub-agent: a
 * question that requires inspecting the project but changes nothing. Pin
 * `agent-explorer` to a candidate model to benchmark exploration quality.
 */

import { type Scenario } from '../runAgentScenario';
import { makeProjectWithScene } from './projectFixtures';
import {
  requireRunCompleted,
  custom,
} from '../graders/objective';

const scenario: Scenario = {
  id: 'explorer-inspect-scene',
  description:
    'Ask the agent what objects exist in the scene. Exercises the explorer sub-agent and read-only inspection.',
  mode: 'orchestrator',
  toolsVersion: 'v6',
  createInitialProject: gd =>
    makeProjectWithScene(gd, {
      sceneName: 'Level',
      spriteObjects: ['Player', 'Coin', 'Enemy'],
    }),
  userRequest:
    'Without changing anything, tell me which objects exist in the Level scene.',
  objectiveGraders: [
    requireRunCompleted(),
    // The final answer should mention all three objects.
    custom('mentions-all-objects', ({ assistantText }) => {
      const text = assistantText.toLowerCase();
      const expected = ['player', 'coin', 'enemy'];
      const missing = expected.filter(name => !text.includes(name));
      return {
        passed: missing.length === 0,
        score: (expected.length - missing.length) / expected.length,
        message: missing.length
          ? `Answer missed: ${missing.join(', ')}.`
          : 'Answer mentioned all objects.',
      };
    }),
    // Read-only task: nothing should have been created/modified.
    custom('read-only', ({ runResult }) => {
      const modified = runResult.executedToolCalls.filter(
        t => t.didModifyProject
      );
      return {
        passed: modified.length === 0,
        message: modified.length
          ? `Unexpected modifying tool calls: ${modified
              .map(m => m.call.name)
              .join(', ')}.`
          : 'No project modifications, as expected.',
      };
    }),
  ],
  llmJudgeRubric:
    'The user asked, read-only, which objects exist in the Level scene (Player, Coin, Enemy). ' +
    'Pass if the final answer correctly lists those objects and the agent did not modify the project.',
};

export default scenario;
