// @flow
import * as React from 'react';
import paperDecorator from '../../PaperDecorator';
import { UserFeedbackLeaderboard } from '../../../CommunityLeaderboards/UserFeedbackLeaderboard';
import { fakeUserLeaderboards } from '../../../fixtures/GDevelopServicesTestData/FakeUserLeaderboards';

export default {
  title: 'CommunityLeaderboards/UserFeedbackLeaderboard',
  component: UserFeedbackLeaderboard,
  decorators: [paperDecorator],
};

export const Default = () => {
  return (
    <UserFeedbackLeaderboard
      userLeaderboard={fakeUserLeaderboards[0]}
      displayEntriesCount={5}
    />
  );
};

export const Loading = () => {
  return (
    <UserFeedbackLeaderboard userLeaderboard={null} displayEntriesCount={5} />
  );
};
