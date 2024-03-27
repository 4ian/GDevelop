// @flow
import * as React from 'react';
import { UserFeedbackLeaderboard } from '../../../../CommunityLeaderboards/UserFeedbackLeaderboard';
import { GameFeedbackLeaderboard } from '../../../../CommunityLeaderboards/GameFeedbackLeaderboard';
import { ResponsiveLineStackLayout } from '../../../../UI/Layout';
import { useResponsiveWindowSize } from '../../../../UI/Responsive/ResponsiveWindowMeasurer';
import Paper from '../../../../UI/Paper';
import Text from '../../../../UI/Text';
import { Line, Spacer } from '../../../../UI/Grid';
import { CommunityLeaderboardsContext } from '../../../../CommunityLeaderboards/CommunityLeaderboardsContext';

const styles = {
  leaderboardContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
};

export const UserAndGameLeaderboards = () => {
  const {
    fetchCommunityLeaderboards,
    gameLeaderboards,
    userLeaderboards,
  } = React.useContext(CommunityLeaderboardsContext);

  React.useEffect(
    () => {
      fetchCommunityLeaderboards();
    },
    [fetchCommunityLeaderboards]
  );

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
              (gameLeaderboards &&
                gameLeaderboards.find(leaderboard =>
                  leaderboard.name.startsWith('daily')
                )) ||
              null
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
              (userLeaderboards &&
                userLeaderboards.find(leaderboard =>
                  leaderboard.name.startsWith('weekly')
                )) ||
              null
            }
            displayEntriesCount={5}
          />
          <GameFeedbackLeaderboard
            gameLeaderboard={
              (gameLeaderboards &&
                gameLeaderboards.find(leaderboard =>
                  leaderboard.name.startsWith('weekly')
                )) ||
              null
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
              (userLeaderboards &&
                userLeaderboards.find(leaderboard =>
                  leaderboard.name.startsWith('monthly')
                )) ||
              null
            }
            displayEntriesCount={5}
          />
        </ResponsiveLineStackLayout>
      </div>
    </ResponsiveLineStackLayout>
  );
};
