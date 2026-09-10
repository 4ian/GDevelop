// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import { GameplayTestProperties } from '../../../GameplayTests/GameplayTestProperties';
import {
  type GameplayTestResult,
  type GameplayTestScope,
} from '../../../GameplayTests/GameplayTestRunner';
import Background from '../../../UI/Background';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';
import FixedWidthFlexContainer from '../../FixedWidthFlexContainer';

export default {
  title: 'GameplayTests/GameplayTestProperties',
  component: GameplayTestProperties,
};

const screenshotLabels = ['Before the jump', 'After the jump'];

const testSource = `await harness.goToScene('Level1');
harness.setKeyPressed('Right', true);
await harness.stepFrames(60);
harness.assert(harness.getSceneVariable('Score') === 1, 'Score is 1');`;

/**
 * A stand-in for a `gd.Test`: the tests of a project are only available in
 * libGD.js, which is not what these stories are about (and the panel only
 * reads/writes these fields).
 */
const makeFakeGameplayTest = ({
  name,
  description,
  lastRunStatus,
  lastRunAt,
  lastRunDurationMs,
  lastRunFramesExecuted,
}: {|
  name: string,
  description: string,
  lastRunStatus?: string,
  lastRunAt?: number,
  lastRunDurationMs?: number,
  lastRunFramesExecuted?: number,
|}): gdTest => {
  let currentDescription = description;
  let currentSource = testSource;

  // $FlowFixMe[incompatible-cast] - only the methods used by the panel are faked.
  return ({
    getName: () => name,
    getType: () => 'gameplay',
    getDescription: () => currentDescription,
    setDescription: (newDescription: string) => {
      currentDescription = newDescription;
    },
    getSource: () => currentSource,
    setSource: (newSource: string) => {
      currentSource = newSource;
    },
    getLastRunStatus: () => lastRunStatus || '',
    getLastRunAt: () =>
      lastRunStatus ? lastRunAt || Date.now() - 5 * 60 * 1000 : 0,
    getLastRunDurationMs: () => lastRunDurationMs || 0,
    getLastRunFramesExecuted: () => lastRunFramesExecuted || 0,
  }: any);
};

const makeResult = (
  partialResult: Partial<GameplayTestResult>
): GameplayTestResult => ({
  testName: 'PlayerCanCollectCoin',
  status: 'passed',
  framesExecuted: 0,
  durationMs: 0,
  loadingMs: 0,
  timeoutMs: 0,
  hiddenStallMs: 0,
  gameTimeMs: 0,
  assertions: [],
  errors: [],
  consoleLogs: [],
  eventLog: [],
  finalState: null,
  screenshots: [],
  profiles: [],
  performance: null,
  ...partialResult,
});

/** Draw fake game screenshots, to show the screenshots section. */
const useFakeScreenshots = (labels: Array<string>) =>
  React.useMemo(
    () =>
      labels.map((label, index) => {
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 180;
        const context = canvas.getContext('2d');
        const sky = context.createLinearGradient(0, 0, 0, 180);
        sky.addColorStop(0, '#4f28cd');
        sky.addColorStop(1, '#95c6ff');
        context.fillStyle = sky;
        context.fillRect(0, 0, 320, 180);
        context.fillStyle = '#16cf89';
        context.fillRect(0, 140, 320, 40);
        context.fillStyle = '#ffbc57';
        context.fillRect(40 + index * 90, 110, 24, 30);
        return {
          label,
          frame: 120 * (index + 1),
          jpegBase64: canvas.toDataURL('image/jpeg', 0.7).split(',')[1],
        };
      }),
    [labels]
  );

const PropertiesPanelStory = ({
  test,
  scope,
  isRunning,
  runningFrame,
  lastResult,
}: {|
  test: gdTest,
  scope?: GameplayTestScope,
  isRunning?: boolean,
  runningFrame?: number | null,
  lastResult?: GameplayTestResult | null,
|}) => (
  <FixedHeightFlexContainer height={560}>
    <FixedWidthFlexContainer width={310}>
      <Background>
        <GameplayTestProperties
          test={test}
          scope={scope || { type: 'project' }}
          isRunning={!!isRunning}
          runningFrame={runningFrame || null}
          lastResult={lastResult || null}
          onEditWithAi={action('edit with AI')}
          onTestModified={action('test modified')}
        />
      </Background>
    </FixedWidthFlexContainer>
  </FixedHeightFlexContainer>
);

const description =
  'The player walks right and collects the first coin: the score is incremented.';

export const NeverRun = (): React.Node => {
  const test = React.useMemo(
    () =>
      makeFakeGameplayTest({ name: 'PlayerCanCollectCoin', description: '' }),
    []
  );
  return <PropertiesPanelStory test={test} />;
};

export const Launching = (): React.Node => {
  const test = React.useMemo(
    () => makeFakeGameplayTest({ name: 'PlayerCanCollectCoin', description }),
    []
  );
  return <PropertiesPanelStory test={test} isRunning />;
};

export const Running = (): React.Node => {
  const test = React.useMemo(
    () => makeFakeGameplayTest({ name: 'PlayerCanCollectCoin', description }),
    []
  );
  return <PropertiesPanelStory test={test} isRunning runningFrame={247} />;
};

export const Passed = (): React.Node => {
  const test = React.useMemo(
    () =>
      makeFakeGameplayTest({
        name: 'PlayerCanCollectCoin',
        description,
        lastRunStatus: 'passed',
        lastRunDurationMs: 5423,
        lastRunFramesExecuted: 320,
      }),
    []
  );
  return (
    <PropertiesPanelStory
      test={test}
      lastResult={makeResult({
        status: 'passed',
        durationMs: 5423,
        framesExecuted: 320,
        gameTimeMs: 5333,
        assertions: [
          { message: 'Level1 is the current scene', passed: true },
          { message: 'The player is on a platform', passed: true },
          { message: 'Score is 1', passed: true },
        ],
        consoleLogs: [
          { level: 'log', message: 'Coin collected!' },
          { level: 'log', message: 'Score is now 1' },
        ],
      })}
    />
  );
};

export const Failed = (): React.Node => {
  const test = React.useMemo(
    () =>
      makeFakeGameplayTest({
        name: 'PlayerCanCollectCoin',
        description,
        lastRunStatus: 'failed',
        lastRunDurationMs: 8102,
        lastRunFramesExecuted: 481,
      }),
    []
  );
  return (
    <PropertiesPanelStory
      test={test}
      lastResult={makeResult({
        status: 'failed',
        durationMs: 8102,
        framesExecuted: 481,
        assertions: [
          { message: 'Level1 is the current scene', passed: true },
          { message: 'The player is on a platform', passed: true },
          { message: 'Score is 1', passed: false },
        ],
        errors: [
          'Assertion failed: Score is 1',
          '    at gameplay test source (line 12)',
        ],
        consoleLogs: [
          { level: 'log', message: 'Player spawned at 32;480' },
          { level: 'warn', message: 'Coin has no "Collectible" behavior' },
          { level: 'error', message: 'Cannot read property "value" of null' },
        ],
      })}
    />
  );
};

export const FailedWithScreenshots = (): React.Node => {
  const test = React.useMemo(
    () =>
      makeFakeGameplayTest({
        name: 'PlayerCanCollectCoin',
        description,
        lastRunStatus: 'failed',
        lastRunDurationMs: 8102,
        lastRunFramesExecuted: 481,
      }),
    []
  );
  const screenshots = useFakeScreenshots(screenshotLabels);
  return (
    <PropertiesPanelStory
      test={test}
      lastResult={makeResult({
        status: 'failed',
        durationMs: 8102,
        framesExecuted: 481,
        assertions: [
          { message: 'Level1 is the current scene', passed: true },
          { message: 'Score is 1', passed: false },
        ],
        errors: ['Assertion failed: Score is 1'],
        screenshots,
      })}
    />
  );
};

export const ScriptError = (): React.Node => {
  const test = React.useMemo(
    () =>
      makeFakeGameplayTest({
        name: 'PlayerCanCollectCoin',
        description: 'This test has a broken script.',
        lastRunStatus: 'error',
        lastRunDurationMs: 312,
      }),
    []
  );
  return (
    <PropertiesPanelStory
      test={test}
      lastResult={makeResult({
        status: 'error',
        durationMs: 312,
        framesExecuted: 0,
        errors: [
          'TypeError: harness.stepFrame is not a function',
          '    at gameplay test source (line 3)',
        ],
      })}
    />
  );
};

export const TimedOut = (): React.Node => {
  const test = React.useMemo(
    () =>
      makeFakeGameplayTest({
        name: 'PlayerReachesTheExit',
        description: 'The player walks right until the exit of the level.',
        lastRunStatus: 'timeout',
        lastRunDurationMs: 30000,
        lastRunFramesExecuted: 1800,
      }),
    []
  );
  return (
    <PropertiesPanelStory
      test={test}
      lastResult={makeResult({
        status: 'timeout',
        durationMs: 30000,
        framesExecuted: 1800,
        assertions: [{ message: 'Level1 is the current scene', passed: true }],
        errors: [
          'The test did not finish within 30000ms: the game may be stuck.',
        ],
      })}
    />
  );
};

export const InExtensionAndRunInAPreviousSession = (): React.Node => {
  const test = React.useMemo(
    () =>
      makeFakeGameplayTest({
        name: 'HealthBarIsUpdated',
        description: 'The health bar of the extension is updated when hit.',
        lastRunStatus: 'passed',
        lastRunAt: Date.now() - 3 * 24 * 3600 * 1000,
        lastRunDurationMs: 1240,
        lastRunFramesExecuted: 74,
      }),
    []
  );
  return (
    <PropertiesPanelStory
      test={test}
      scope={{ type: 'extension', extensionName: 'Health' }}
    />
  );
};
