// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { type EditorFunction, type EditorFunctionGenericOutput } from '.';
import {
  runProjectGameplayTests,
  getTestsContainer,
  type GameplayTestResult,
} from '../GameplayTests/GameplayTestRunner';

const makeFailure = (message: string): EditorFunctionGenericOutput => ({
  success: false,
  message,
});

/**
 * The output sent to the AI for a gameplay test run: the full result of the
 * run, with console logs flattened to strings.
 */
const makeGameplayTestOutput = (
  result: GameplayTestResult,
  didModifyProject: boolean
): EditorFunctionGenericOutput => {
  return {
    success: result.status === 'passed',
    status: result.status,
    testName: result.testName,
    framesExecuted: result.framesExecuted,
    durationMs: result.durationMs,
    gameTimeMs: result.gameTimeMs,
    assertions: result.assertions,
    errors: result.errors,
    consoleLogs: result.consoleLogs.map(log => `[${log.level}] ${log.message}`),
    eventLog: result.eventLog,
    finalState: result.finalState,
    screenshots: result.screenshots,
    performance: result.performance,
    meta: didModifyProject ? { didModifyProject: true } : undefined,
  };
};

/**
 * Run a gameplay test on the game (used by the AI "tester" agent). When
 * `source` is given, the test is created or updated (unless `persist` is
 * false) and then run.
 */
export const runGameplayTest: EditorFunction = {
  renderForEditor: ({ args }) => {
    const testName = args.test_name || '';
    return {
      text: args.source ? (
        <Trans>Save and run the gameplay test {testName}.</Trans>
      ) : (
        <Trans>Run the gameplay test {testName}.</Trans>
      ),
    };
  },
  launchFunction: async ({ project, args }) => {
    const scope = typeof args.scope === 'string' ? args.scope : 'project';
    const testName = args.test_name;
    if (typeof testName !== 'string' || !testName) {
      return makeFailure('Missing or invalid `test_name` argument.');
    }
    const source = typeof args.source === 'string' ? args.source : null;
    const persist = args.persist !== false;
    const timeoutMs =
      typeof args.timeout_ms === 'number'
        ? Math.min(Math.max(args.timeout_ms, 1000), 120000)
        : undefined;
    const screenshots =
      args.screenshots === 'on-failure' ? 'on-failure' : 'off';

    const testsContainer = getTestsContainer(project, scope);
    if (!testsContainer) {
      return makeFailure(
        `The scope "${scope}" does not exist: it must be 'project' or the name of an events-based extension of the project.`
      );
    }

    let didModifyProject = false;
    if (source !== null && persist) {
      const test = testsContainer.hasTestNamed(testName)
        ? testsContainer.getTest(testName)
        : testsContainer.insertNewTest(
            testName,
            testsContainer.getTestsCount()
          );
      if (test.getSource() !== source) {
        test.setSource(source);
        didModifyProject = true;
      }
      if (
        typeof args.description === 'string' &&
        args.description !== test.getDescription()
      ) {
        test.setDescription(args.description);
        didModifyProject = true;
      }
    } else if (source === null && !testsContainer.hasTestNamed(testName)) {
      return makeFailure(
        `No test named "${testName}" in the scope "${scope}" - pass its code as \`source\` to create it.`
      );
    }

    try {
      const results = await runProjectGameplayTests({
        project,
        tests: [
          {
            scope,
            testName,
            ...(source !== null ? { source } : {}),
          },
        ],
        options: {
          timeoutMs,
          screenshots,
        },
      });
      if (!results[0]) {
        return makeFailure('The gameplay test did not return a result.');
      }
      return makeGameplayTestOutput(results[0], didModifyProject);
    } catch (error) {
      return makeFailure(
        'Unable to run the gameplay test: ' + (error.message || String(error))
      );
    }
  },
  modifiesProject: false,
  // Only persisting a new/changed test modifies the project (and so requires
  // an approval when auto-edit is off) - just running a test does not.
  getModifiesProject: (args: Object) => typeof args.source === 'string',
};
