// @flow

/**
 * Orchestrator scenario exercising the EDIT sub-agent: a simple object creation.
 * Pin `agent-edit` to a candidate model to benchmark it on a small create task.
 */

import { type Scenario } from '../runAgentScenario';
import { makeProjectWithScene } from './projectFixtures';
import {
  requireObjectInScene,
  requireRunCompleted,
  requireNoToolFailures,
} from '../graders/objective';

const scenario: Scenario = {
  id: 'orchestrator-add-enemy',
  description:
    'Ask the agent to add a new enemy object to an existing scene. Exercises the edit sub-agent and create_object.',
  mode: 'orchestrator',
  toolsVersion: 'v6',
  createInitialProject: gd =>
    makeProjectWithScene(gd, { sceneName: 'Level', spriteObjects: ['Player'] }),
  userRequest:
    'Add a new enemy object named "Enemy" to the Level scene. It can be a simple sprite for now.',
  objectiveGraders: [
    requireRunCompleted(),
    requireObjectInScene('Level', 'Enemy'),
    requireNoToolFailures(),
  ],
  llmJudgeRubric:
    'The agent should add an object named "Enemy" (or very close) to the Level scene. ' +
    'Pass if an enemy object was created in the right scene without obvious mistakes.',
};

export default scenario;
