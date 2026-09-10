// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import {
  GameplayTestFrameLayout,
  type GameplayTestFrameRunStatus,
  type GameplayTestFrameHiddenPause,
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
    width: '100%',
    height: '100%',
    alignItems: 'flex-end',
    background: 'linear-gradient(to bottom, #4f28cd, #95c6ff)',
  },
  // Sized for the fake game resolution below (displayed zoomed out by 4
  // when the frame is at its default size).
  fakeGameGround: {
    width: '100%',
    height: 128,
    backgroundColor: '#16cf89',
    position: 'relative',
  },
  fakeGamePlayer: {
    position: 'absolute',
    bottom: 128,
    left: 240,
    width: 80,
    height: 112,
    borderRadius: 12,
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
  initialHiddenPause,
}: {|
  runStatus: GameplayTestFrameRunStatus | null,
  initiallyMinimized?: boolean,
  initialHiddenPause?: GameplayTestFrameHiddenPause,
|}) => {
  const [isMinimized, setIsMinimized] = React.useState<boolean>(
    !!initiallyMinimized
  );
  const [
    hiddenPause,
    setHiddenPause,
  ] = React.useState<GameplayTestFrameHiddenPause | null>(
    initialHiddenPause || null
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
        hiddenPause={hiddenPause}
        onDismissHiddenPause={() => {
          action('hidden pause dismissed')();
          setHiddenPause(null);
        }}
        isMinimized={isMinimized}
        onToggleMinimized={() => setIsMinimized(!isMinimized)}
        onStopRequested={action('stop requested')}
        gameResolution={{ width: 1280, height: 720 }}
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

export const PausedWhileInTheBackgroundThenResumed = (): React.Node => (
  <FrameStory
    runStatus={makeRunStatus({ frame: 512 })}
    initialHiddenPause={{ pausedMs: 47000, isRunInterrupted: false }}
  />
);

export const InterruptedAfterTooLongInTheBackground = (): React.Node => (
  <FrameStory
    runStatus={makeRunStatus({
      status: 'paused',
      frame: 512,
      durationMs: 312000,
    })}
    initialHiddenPause={{ pausedMs: 300000, isRunInterrupted: true }}
  />
);

export const PausedWhileMinimized = (): React.Node => (
  <FrameStory
    runStatus={makeRunStatus({ frame: 512 })}
    initialHiddenPause={{ pausedMs: 8000, isRunInterrupted: false }}
    initiallyMinimized
  />
);
