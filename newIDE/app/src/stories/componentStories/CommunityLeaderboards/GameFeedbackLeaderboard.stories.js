// @flow
import * as React from 'react';
import paperDecorator from '../../PaperDecorator';
import { GameFeedbackLeaderboard } from '../../../CommunityLeaderboards/GameFeedbackLeaderboard';
import { fakeGameLeaderboards } from '../../../fixtures/GDevelopServicesTestData/FakeGameLeaderboards';

export default {
  title: 'CommunityLeaderboards/GameFeedbackLeaderboard',
  component: GameFeedbackLeaderboard,
  decorators: [paperDecorator],
};

export const Default = () => {
  return (
    <GameFeedbackLeaderboard
      gameLeaderboard={fakeGameLeaderboards[0]}
      displayEntriesCount={5}
    />
  );
};

export const Loading = () => {
  return (
    <GameFeedbackLeaderboard gameLeaderboard={null} displayEntriesCount={5} />
  );
};
