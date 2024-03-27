// @flow
import * as React from 'react';

import muiDecorator from '../../../ThemeDecorator';
import paperDecorator from '../../../PaperDecorator';

import { UserAndGameLeaderboards } from '../../../../MainFrame/EditorContainers/HomePage/CommunitySection/UserAndGameLeaderboards';
import { fakeGameLeaderboards } from '../../../../fixtures/GDevelopServicesTestData/FakeGameLeaderboards';
import { fakeUserLeaderboards } from '../../../../fixtures/GDevelopServicesTestData/FakeUserLeaderboards';
import { CommunityLeaderboardsContext } from '../../../../CommunityLeaderboards/CommunityLeaderboardsContext';

export default {
  title: 'HomePage/CommunitySection/UserAndGameLeaderboards',
  component: UserAndGameLeaderboards,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => {
  return (
    <CommunityLeaderboardsContext.Provider
      value={{
        fetchCommunityLeaderboards: () => {},
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
        fetchCommunityLeaderboards: () => {},
        gameLeaderboards: null,
        userLeaderboards: null,
        error: null,
      }}
    >
      <UserAndGameLeaderboards />
    </CommunityLeaderboardsContext.Provider>
  );
};
