// @flow

/**
 * Orchestrator scenario exercising the full pipeline including event generation:
 * orchestrator -> edit sub-agent -> add_scene_events -> ai-generated-event.
 * This is the richest single check of "can the agent build real game logic".
 */

import { type Scenario } from '../runAgentScenario';
import { makeProjectWithScene } from './projectFixtures';
import {
  requireRunCompleted,
  requireSceneHasEvents,
  requireToolCalled,
} from '../graders/objective';

const scenario: Scenario = {
  id: 'orchestrator-jump-events',
  description:
    'Ask the agent to make the player jump on key press. Exercises orchestrator + edit sub-agent + events generation.',
  mode: 'orchestrator',
  toolsVersion: 'v6',
  createInitialProject: gd =>
    makeProjectWithScene(gd, { sceneName: 'Level', spriteObjects: ['Player'] }),
  userRequest:
    'When the player presses the Space key, make the Player object jump (move up then come back down). Add the needed events to the Level scene.',
  objectiveGraders: [
    requireRunCompleted(),
    requireToolCalled('add_scene_events'),
    requireSceneHasEvents('Level'),
  ],
  llmJudgeRubric:
    'The agent should add events to the Level scene that make the Player jump when the Space key is pressed ' +
    '(e.g. applying an upward force/velocity or using a jump behavior/action on key press). ' +
    'Pass if the generated events plausibly implement a jump triggered by the Space key.',
  // Event generation can take a while; allow a few extra rounds.
  maxRounds: 100,
};

export default scenario;
