// @flow

/**
 * Registry of benchmark scenarios. Add new scenarios here as the tools/prompts
 * evolve - each new entry is automatically picked up by the suite and tracked
 * over time per model.
 */

import { type Scenario } from '../runAgentScenario';
import orchestratorAddEnemy from './orchestratorAddEnemy.scenario';
import orchestratorJumpEvents from './orchestratorJumpEvents.scenario';
import explorerInspectScene from './explorerInspectScene.scenario';

export const allScenarios: Array<Scenario> = [
  orchestratorAddEnemy,
  orchestratorJumpEvents,
  explorerInspectScene,
];

export const getScenariosByIds = (ids: Array<string>): Array<Scenario> =>
  allScenarios.filter(scenario => ids.includes(scenario.id));
