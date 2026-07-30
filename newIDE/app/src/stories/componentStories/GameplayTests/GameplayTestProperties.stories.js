// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import { GameplayTestProperties } from '../../../GameplayTests/GameplayTestProperties';
import { type GameplayTestResult } from '../../../GameplayTests/GameplayTestRunner';
import Background from '../../../UI/Background';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';
import FixedWidthFlexContainer from '../../FixedWidthFlexContainer';
import newNameGenerator from '../../../Utils/NewNameGenerator';

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
 * Create a gameplay test in the test project (removed when the story is
 * unmounted), so that the panel can be shown like in the editor.
 */
const useStoryGameplayTest = ({
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
|}): gdTest | null => {
  const test = React.useMemo(
    () => {
      const testsContainer = testProject.project.getTests();
      const uniqueName = newNameGenerator(name, name =>
        testsContainer.hasTestNamed(name)
      );
      const test = testsContainer.insertNewTest(
        uniqueName,
        testsContainer.getTestsCount()
      );
      test.setDescription(description);
      test.setSource(testSource);
      if (lastRunStatus) {
        test.setLastRunStatus(lastRunStatus);
        test.setLastRunAt(lastRunAt || Date.now() - 5 * 60 * 1000);
        test.setLastRunDurationMs(lastRunDurationMs || 0);
        test.setLastRunFramesExecuted(lastRunFramesExecuted || 0);
      }
      return test;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  React.useEffect(
    () => () => {
      testProject.project.getTests().removeTest(test.getName());
    },
    [test]
  );

  return test;
};

const makeResult = (
  partialResult: Partial<GameplayTestResult>
): GameplayTestResult => ({
  testName: 'PlayerCanCollectCoin',
  status: 'passed',
  framesExecuted: 0,
  durationMs: 0,
  gameTimeMs: 0,
  assertions: [],
  errors: [],
  consoleLogs: [],
  eventLog: [],
  finalState: null,
  screenshots: [],
  performance: null,
  ...partialResult,
});

/** Draw a fake game screenshot, to show the screenshots section. */
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
  isRunning,
  runningFrame,
  lastResult,
}: {|
  test: gdTest | null,
  isRunning?: boolean,
  runningFrame?: number | null,
  lastResult?: GameplayTestResult | null,
|}) => {
  if (!test) return null;
  return (
    <FixedHeightFlexContainer height={750}>
      <FixedWidthFlexContainer width={310}>
        <Background>
          <GameplayTestProperties
            test={test}
            scope="project"
            isRunning={!!isRunning}
            runningFrame={runningFrame || null}
            lastResult={lastResult || null}
            onRunTest={action('run test')}
            onStopTest={action('stop test')}
            onEditWithAi={action('edit with AI')}
            onTestModified={action('test modified')}
          />
        </Background>
      </FixedWidthFlexContainer>
    </FixedHeightFlexContainer>
  );
};

export const NeverRun = (): React.Node => {
  const test = useStoryGameplayTest({
    name: 'PlayerCanCollectCoin',
    description: '',
  });
  return <PropertiesPanelStory test={test} />;
};

export const Running = (): React.Node => {
  const test = useStoryGameplayTest({
    name: 'PlayerCanCollectCoin',
    description:
      'The player walks right and collects the first coin: the score is incremented.',
  });
  return <PropertiesPanelStory test={test} isRunning runningFrame={247} />;
};

export const Launching = (): React.Node => {
  const test = useStoryGameplayTest({
    name: 'PlayerCanCollectCoin',
    description:
      'The player walks right and collects the first coin: the score is incremented.',
  });
  return <PropertiesPanelStory test={test} isRunning />;
};

export const Passed = (): React.Node => {
  const test = useStoryGameplayTest({
    name: 'PlayerCanCollectCoin',
    description:
      'The player walks right and collects the first coin: the score is incremented.',
    lastRunStatus: 'passed',
    lastRunDurationMs: 5423,
    lastRunFramesExecuted: 320,
  });
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
  const test = useStoryGameplayTest({
    name: 'PlayerCanCollectCoin',
    description:
      'The player walks right and collects the first coin: the score is incremented.',
    lastRunStatus: 'failed',
    lastRunDurationMs: 8102,
    lastRunFramesExecuted: 481,
  });
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
  const test = useStoryGameplayTest({
    name: 'PlayerCanCollectCoin',
    description:
      'The player walks right and collects the first coin: the score is incremented.',
    lastRunStatus: 'failed',
    lastRunDurationMs: 8102,
    lastRunFramesExecuted: 481,
  });
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
  const test = useStoryGameplayTest({
    name: 'PlayerCanCollectCoin',
    description: 'This test has a broken script.',
    lastRunStatus: 'error',
    lastRunDurationMs: 312,
    lastRunFramesExecuted: 0,
  });
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
  const test = useStoryGameplayTest({
    name: 'PlayerReachesTheExit',
    description: 'The player walks right until the exit of the level.',
    lastRunStatus: 'timeout',
    lastRunDurationMs: 30000,
    lastRunFramesExecuted: 1800,
  });
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

export const InExtension = (): React.Node => {
  const test = useStoryGameplayTest({
    name: 'HealthBarIsUpdated',
    description: 'The health bar of the extension is updated when hit.',
    lastRunStatus: 'passed',
    lastRunDurationMs: 1240,
    lastRunFramesExecuted: 74,
  });
  if (!test) return null;
  return (
    <FixedHeightFlexContainer height={750}>
      <FixedWidthFlexContainer width={310}>
        <Background>
          <GameplayTestProperties
            test={test}
            scope="Health"
            isRunning={false}
            runningFrame={null}
            lastResult={null}
            onRunTest={action('run test')}
            onStopTest={action('stop test')}
            onEditWithAi={action('edit with AI')}
            onTestModified={action('test modified')}
          />
        </Background>
      </FixedWidthFlexContainer>
    </FixedHeightFlexContainer>
  );
};
