// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { type EditorFunction, type EditorFunctionGenericOutput } from '.';
import {
  runProjectGameplayTests,
  getTestsContainer,
  getGameplayTestProjectItemName,
  getGameplayTestScopeDescription,
  makeGameplayTestResultReadableOutput,
  type GameplayTestResult,
  type GameplayTestScope,
} from '../GameplayTests/GameplayTestRunner';
import { mapFor } from '../Utils/MapFor';

const makeFailure = (message: string): EditorFunctionGenericOutput => ({
  success: false,
  message,
});

/**
 * Parse the `scope` tool argument ({ type: 'project' } or
 * { type: 'extension', extension_name }) into a `GameplayTestScope`, or null
 * when malformed.
 */
const parseScopeArgument = (scopeArgument: mixed): GameplayTestScope | null => {
  if (!scopeArgument || typeof scopeArgument !== 'object') return null;
  if (scopeArgument.type === 'project') return { type: 'project' };
  if (
    scopeArgument.type === 'extension' &&
    typeof scopeArgument.extension_name === 'string' &&
    scopeArgument.extension_name
  ) {
    return { type: 'extension', extensionName: scopeArgument.extension_name };
  }
  return null;
};

const invalidScopeFailure = () =>
  makeFailure(
    "Invalid `scope`: pass { type: 'project' } or { type: 'extension', extension_name: '...' }."
  );

/**
 * The output sent to the AI for a gameplay test run: the full result of the
 * run, with console logs flattened to strings.
 */
const makeGameplayTestOutput = (
  result: GameplayTestResult,
  didModifyProject: boolean,
  executedSource: string | null
): EditorFunctionGenericOutput => {
  return {
    success: result.status === 'passed',
    ...makeGameplayTestResultReadableOutput(result),
    // When the test script could not execute, give back the code that was
    // run: the repair (by the AI tester agent) can then be a minimal edit of
    // the real source instead of a rewrite from scratch - the only option
    // when running a stored test, whose source is not in the conversation.
    ...(executedSource !== null &&
    (result.status === 'error' || result.status === 'timeout')
      ? { source: executedSource }
      : {}),
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
      text:
        args.source && args.persist !== false ? (
          <Trans>Save and run the gameplay test {testName}.</Trans>
        ) : (
          <Trans>Run the gameplay test {testName}.</Trans>
        ),
    };
  },
  launchFunction: async ({ project, args }) => {
    const scope = parseScopeArgument(args.scope);
    if (!scope) return invalidScopeFailure();
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
        `Unknown scope: ${getGameplayTestScopeDescription(
          scope
        )} does not exist in the project.`
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
        `No test named "${testName}" in ${getGameplayTestScopeDescription(
          scope
        )} - pass its code as \`source\` to create it.`
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
      const executedSource =
        source !== null
          ? source
          : testsContainer.hasTestNamed(testName)
          ? testsContainer.getTest(testName).getSource()
          : null;
      return makeGameplayTestOutput(
        results[0],
        didModifyProject,
        executedSource
      );
    } catch (error) {
      return makeFailure(
        'Unable to run the gameplay test: ' + (error.message || String(error))
      );
    }
  },
  modifiesProject: false,
  // Only persisting a new/changed test modifies the project (and so requires
  // an approval when auto-edit is off). Just running a test does not - and
  // neither does running an unsaved source with `persist: false` (temporary
  // probes and diagnostics).
  getModifiesProject: (args: Object) =>
    typeof args.source === 'string' && args.persist !== false,
};

// Cap on the ordered test list returned after changes (mirrors the array
// truncation of `read_game_project_json`).
const MAX_LISTED_TESTS = 50;

/**
 * Delete gameplay tests or change their properties (name, description,
 * index). Never their source: test code must go through the gameplay test
 * runner (`run_gameplay_test`) so it is always executed and verified.
 */
export const changeGameplayTests: EditorFunction = {
  renderForEditor: ({ args }) => {
    const changesCount = Array.isArray(args.changes) ? args.changes.length : 0;
    return {
      text: (
        <Trans>Change the gameplay tests ({changesCount} change(s)).</Trans>
      ),
    };
  },
  launchFunction: async ({
    project,
    args,
    onProjectItemRenamedOutsideEditor,
    onWillDeleteGameplayTest,
  }) => {
    const scope = parseScopeArgument(args.scope);
    if (!scope) return invalidScopeFailure();
    const testsContainer = getTestsContainer(project, scope);
    if (!testsContainer) {
      return makeFailure(
        `Unknown scope: ${getGameplayTestScopeDescription(
          scope
        )} does not exist in the project.`
      );
    }
    const changes = Array.isArray(args.changes) ? args.changes : null;
    if (!changes || changes.length === 0) {
      return makeFailure(
        'Missing or empty `changes` array: provide at least one change ({test_name, delete_this_test?, changed_properties?}).'
      );
    }

    const listExistingTestNames = (): string => {
      const names = mapFor(0, testsContainer.getTestsCount(), i =>
        testsContainer.getTestAt(i).getName()
      );
      return names.length === 0
        ? '(no test in this scope)'
        : names
            .slice(0, MAX_LISTED_TESTS)
            .map(name => `"${name}"`)
            .join(', ');
    };

    const changeMessages = [];
    let allChangesApplied = true;
    let didModifyProject = false;
    const failChange = (message: string) => {
      allChangesApplied = false;
      changeMessages.push(message);
    };

    for (const change of changes) {
      const testName =
        change && typeof change.test_name === 'string'
          ? change.test_name
          : null;
      if (!testName) {
        failChange('Invalid change: missing `test_name`.');
        continue;
      }
      if (!testsContainer.hasTestNamed(testName)) {
        failChange(
          `Unknown test "${testName}" in ${getGameplayTestScopeDescription(
            scope
          )}. Existing tests: ${listExistingTestNames()}.`
        );
        continue;
      }

      if (change.delete_this_test === true) {
        // Close any open tab bound to the test BEFORE deleting it, so no
        // editor is left rendering a dangling test.
        await onWillDeleteGameplayTest({
          gameplayTestProjectItemName: getGameplayTestProjectItemName(
            scope,
            testName
          ),
        });
        testsContainer.removeTest(testName);
        didModifyProject = true;
        changeMessages.push(`Deleted the test "${testName}".`);
        continue;
      }

      const changedProperties = Array.isArray(change.changed_properties)
        ? change.changed_properties
        : null;
      if (!changedProperties || changedProperties.length === 0) {
        failChange(
          `No-op change for "${testName}": provide \`changed_properties\` or \`delete_this_test: true\`.`
        );
        continue;
      }

      const test = testsContainer.getTest(testName);
      let currentName = testName;
      for (const changedProperty of changedProperties) {
        const propertyName =
          changedProperty && typeof changedProperty.property_name === 'string'
            ? changedProperty.property_name
            : null;
        const newValue =
          changedProperty && typeof changedProperty.new_value === 'string'
            ? changedProperty.new_value
            : null;
        if (!propertyName || newValue === null) {
          failChange(
            `Invalid property change for "${currentName}": provide \`property_name\` and \`new_value\` (as a string).`
          );
          continue;
        }
        if (propertyName === 'name') {
          const newName = newValue.trim();
          if (!newName) {
            failChange(`Cannot rename "${currentName}" to an empty name.`);
            continue;
          }
          if (newName === currentName) continue;
          if (testsContainer.hasTestNamed(newName)) {
            failChange(
              `Cannot rename "${currentName}" to "${newName}": a test with this name already exists in ${getGameplayTestScopeDescription(
                scope
              )}.`
            );
            continue;
          }
          const oldName = currentName;
          test.setName(newName);
          currentName = newName;
          didModifyProject = true;
          onProjectItemRenamedOutsideEditor({
            kind: 'gameplay-test',
            oldName: getGameplayTestProjectItemName(scope, oldName),
            newName: getGameplayTestProjectItemName(scope, newName),
          });
          changeMessages.push(`Renamed "${oldName}" to "${newName}".`);
        } else if (propertyName === 'description') {
          test.setDescription(newValue);
          didModifyProject = true;
          changeMessages.push(`Updated the description of "${currentName}".`);
        } else if (propertyName === 'index') {
          const requestedIndex = parseInt(newValue, 10);
          if (Number.isNaN(requestedIndex)) {
            failChange(
              `Invalid index "${newValue}" for "${currentName}": provide a number (as a string).`
            );
            continue;
          }
          const newIndex = Math.max(
            0,
            Math.min(testsContainer.getTestsCount() - 1, requestedIndex)
          );
          const oldIndex = testsContainer.getTestPosition(test);
          if (newIndex !== oldIndex) {
            testsContainer.moveTest(oldIndex, newIndex);
            didModifyProject = true;
          }
          changeMessages.push(`Moved "${currentName}" to index ${newIndex}.`);
        } else {
          failChange(
            `Unknown property "${propertyName}" for "${currentName}": only 'name', 'description' and 'index' can be changed. In particular the source can NOT be changed here: test code must go through \`run_gameplay_test\` so it is executed and verified.`
          );
        }
      }
    }

    const testsCount = testsContainer.getTestsCount();
    const tests = mapFor(0, Math.min(testsCount, MAX_LISTED_TESTS), i => {
      const test = testsContainer.getTestAt(i);
      return { test_name: test.getName(), description: test.getDescription() };
    });
    if (testsCount > MAX_LISTED_TESTS) {
      changeMessages.push(
        `(Only the first ${MAX_LISTED_TESTS} of the ${testsCount} tests of the scope are listed.)`
      );
    }

    return {
      success: allChangesApplied,
      message: changeMessages.join('\n'),
      tests,
      // A partially-failed batch may still have applied some changes.
      meta: { didModifyProject },
    };
  },
  modifiesProject: true,
};
