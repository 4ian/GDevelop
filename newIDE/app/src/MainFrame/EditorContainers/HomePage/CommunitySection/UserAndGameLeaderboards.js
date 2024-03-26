// @flow
import * as React from 'react';
import {
  getUserCommentQualityRatingsLeaderboards,
  type UserLeaderboard,
} from '../../../../Utils/GDevelopServices/User';
import { UserFeedbackLeaderboard } from './UserFeedbackLeaderboard';
import { GameFeedbackLeaderboard } from './GameFeedbackLeaderboard';
import { ResponsiveLineStackLayout } from '../../../../UI/Layout';
import { useResponsiveWindowSize } from '../../../../UI/Responsive/ResponsiveWindowMeasurer';
import Paper from '../../../../UI/Paper';
import Text from '../../../../UI/Text';
import { Line, Spacer } from '../../../../UI/Grid';
import {
  getGameCommentQualityRatingsLeaderboards,
  type GameLeaderboard,
} from '../../../../Utils/GDevelopServices/Game';

const styles = {
  leaderboardContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
};

export const UserAndGameLeaderboards = () => {
  const [userLeaderboards, setUserLeaderboards] = React.useState<
    Array<UserLeaderboard>
  >([]);
  const [gameLeaderboards, setGameLeaderboards] = React.useState<
    Array<GameLeaderboard>
  >([]);
  React.useEffect(() => {
    (async () => {
      try {
        const [userLeaderboards, gameLeaderboards] = await Promise.all([
          getUserCommentQualityRatingsLeaderboards(),
          getGameCommentQualityRatingsLeaderboards(),
        ]);
        setUserLeaderboards(userLeaderboards);
        setGameLeaderboards(gameLeaderboards);
      } catch (error) {
        console.error('Unable to fetch user leaderboards', error);
      }
    })();
  }, []);

  const { windowSize } = useResponsiveWindowSize();

  return (
    <ResponsiveLineStackLayout
      noColumnMargin
      forceMobileLayout={windowSize === 'medium'}
    >
      <div style={{ ...styles.leaderboardContainer, flex: 1 }}>
        <Paper background="light">
          <Line expand justifyContent="center" noMargin>
            <Text>Daily</Text>
          </Line>
        </Paper>
        <Spacer />
        <ResponsiveLineStackLayout noColumnMargin noMargin>
          <GameFeedbackLeaderboard
            gameLeaderboard={
              gameLeaderboards.find(leaderboard =>
                leaderboard.name.startsWith('daily')
              ) || null
            }
            displayEntriesCount={5}
          />
        </ResponsiveLineStackLayout>
      </div>
      <div style={{ ...styles.leaderboardContainer, flex: 2 }}>
        <Paper background="light">
          <Line expand justifyContent="center" noMargin>
            <Text>Weekly</Text>
          </Line>
        </Paper>
        <Spacer />
        <ResponsiveLineStackLayout noColumnMargin noMargin>
          <UserFeedbackLeaderboard
            userLeaderboard={
              userLeaderboards.find(leaderboard =>
                leaderboard.name.startsWith('weekly')
              ) || null
            }
            displayEntriesCount={5}
          />
          <GameFeedbackLeaderboard
            gameLeaderboard={
              gameLeaderboards.find(leaderboard =>
                leaderboard.name.startsWith('weekly')
              ) || null
            }
            displayEntriesCount={5}
          />
        </ResponsiveLineStackLayout>
      </div>
      <div style={{ ...styles.leaderboardContainer, flex: 1 }}>
        <Paper background="light">
          <Line expand justifyContent="center" noMargin>
            <Text>Monthly</Text>
          </Line>
        </Paper>
        <Spacer />
        <ResponsiveLineStackLayout noColumnMargin noMargin>
          <UserFeedbackLeaderboard
            userLeaderboard={
              userLeaderboards.find(leaderboard =>
                leaderboard.name.startsWith('monthly')
              ) || null
            }
            displayEntriesCount={5}
          />
        </ResponsiveLineStackLayout>
      </div>
    </ResponsiveLineStackLayout>
  );
};
