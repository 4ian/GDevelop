// @flow
import * as React from 'react';
import paperDecorator from '../../../PaperDecorator';
import { UserAndGameLeaderboards } from '../../../../MainFrame/EditorContainers/HomePage/CommunitySection/UserAndGameLeaderboards';
import { fakeGameLeaderboards } from '../../../../fixtures/GDevelopServicesTestData/FakeGameLeaderboards';
import { fakeUserLeaderboards } from '../../../../fixtures/GDevelopServicesTestData/FakeUserLeaderboards';
import { CommunityLeaderboardsContext } from '../../../../CommunityLeaderboards/CommunityLeaderboardsContext';

export default {
  title: 'HomePage/CommunitySection/UserAndGameLeaderboards',
  component: UserAndGameLeaderboards,
  decorators: [paperDecorator],
};

export const Default = () => {
  return (
    <CommunityLeaderboardsContext.Provider
      value={{
        fetchCommunityLeaderboards: async () => {},
        gameLeaderboards: fakeGameLeaderboards,
        userLeaderboards: fakeUserLeaderboards,
        error: null,
      }}
    >
      <UserAndGameLeaderboards />
    </CommunityLeaderboardsContext.Provider>
  );
};

export const Loading = () => {
  return (
    <CommunityLeaderboardsContext.Provider
      value={{
        fetchCommunityLeaderboards: async () => {},
        gameLeaderboards: null,
        userLeaderboards: null,
        error: null,
      }}
    >
      <UserAndGameLeaderboards />
    </CommunityLeaderboardsContext.Provider>
  );
};
