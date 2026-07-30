// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import {
  GameplayTestFrameLayout,
  type GameplayTestFrameRunStatus,
} from '../../../GameplayTests/GameplayTestFrame';
import Text from '../../../UI/Text';
import { Column } from '../../../UI/Grid';
import { getPaperDecorator } from '../../PaperDecorator';
import { type StoryDecorator } from '@storybook/react';

export default {
  title: 'GameplayTests/GameplayTestFrame',
  component: GameplayTestFrameLayout,
  decorators: [(getPaperDecorator('dark'): StoryDecorator)],
};

const styles = {
  storyContainer: { height: 460, position: 'relative' },
  fakeGame: {
    display: 'flex',
    flex: 1,
    alignItems: 'flex-end',
    background: 'linear-gradient(to bottom, #4f28cd, #95c6ff)',
  },
  fakeGameGround: {
    width: '100%',
    height: 32,
    backgroundColor: '#16cf89',
    position: 'relative',
  },
  fakeGamePlayer: {
    position: 'absolute',
    bottom: 32,
    left: 60,
    width: 20,
    height: 28,
    borderRadius: 3,
    backgroundColor: '#ffbc57',
  },
};

/** A stand-in for the game preview iframe, which can't run in Storybook. */
const FakeGameView = () => (
  <div style={styles.fakeGame}>
    <div style={styles.fakeGameGround}>
      <div style={styles.fakeGamePlayer} />
    </div>
  </div>
);

const makeRunStatus = (
  partialRunStatus: Partial<GameplayTestFrameRunStatus>
): GameplayTestFrameRunStatus => ({
  testName: 'PlayerCanCollectCoin',
  status: 'running',
  frame: 247,
  durationMs: null,
  testIndex: 0,
  testsCount: 1,
  ...partialRunStatus,
});

const FrameStory = ({
  runStatus,
  initiallyMinimized,
}: {|
  runStatus: GameplayTestFrameRunStatus | null,
  initiallyMinimized?: boolean,
|}) => {
  const [isMinimized, setIsMinimized] = React.useState<boolean>(
    !!initiallyMinimized
  );
  return (
    <div style={styles.storyContainer}>
      <Column>
        <Text>
          The frame is displayed over the whole editor: drag its title bar to
          move it around, and use the buttons to minimize the game or stop the
          test.
        </Text>
      </Column>
      <GameplayTestFrameLayout
        runStatus={runStatus}
        isMinimized={isMinimized}
        onToggleMinimized={() => setIsMinimized(!isMinimized)}
        onStopRequested={action('stop requested')}
      >
        <FakeGameView />
      </GameplayTestFrameLayout>
    </div>
  );
};

export const Launching = (): React.Node => (
  <FrameStory runStatus={makeRunStatus({ status: 'launching', frame: null })} />
);

export const Running = (): React.Node => (
  <FrameStory runStatus={makeRunStatus({})} />
);

export const RunningABatchOfTests = (): React.Node => (
  <FrameStory
    runStatus={makeRunStatus({
      testName: 'PlayerReachesTheExitOfTheFirstLevel',
      frame: 1024,
      testIndex: 2,
      testsCount: 5,
    })}
  />
);

export const Passed = (): React.Node => (
  <FrameStory
    runStatus={makeRunStatus({
      status: 'passed',
      frame: 320,
      durationMs: 5423,
    })}
  />
);

export const Failed = (): React.Node => (
  <FrameStory
    runStatus={makeRunStatus({
      status: 'failed',
      frame: 481,
      durationMs: 8102,
    })}
  />
);

export const Minimized = (): React.Node => (
  <FrameStory runStatus={makeRunStatus({})} initiallyMinimized />
);
