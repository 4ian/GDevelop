// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../PaperDecorator';
import LeaderboardOptionsDialog from '../../../GameDashboard/LeaderboardAdmin/LeaderboardOptionsDialog';
import { type Leaderboard } from '../../../Utils/GDevelopServices/Play';
import { fakeStartupAuthenticatedUser } from '../../../fixtures/GDevelopServicesTestData';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';

export default {
  title: 'Leaderboard/LeaderboardOptionsDialog',
  component: LeaderboardOptionsDialog,
  decorators: [paperDecorator],
};

const fakeLeaderboard: Leaderboard = {
  id: 'fake-leaderboard-id',
  gameId: 'fake-game-id',
  name: 'My leaderboard',
  sort: 'ASC',
  startDatetime: '123',
  playerUnicityDisplayChoice: 'FREE',
  visibility: 'PUBLIC',
};

// $FlowFixMe[signature-verification-failure]
export const Default = () => (
  // $FlowFixMe[incompatible-type]
  <LeaderboardOptionsDialog
    open
    onClose={() => action('onClose')()}
    onSave={action('onSave')}
    sort={'ASC'}
    extremeAllowedScore={undefined}
    leaderboard={fakeLeaderboard}
  />
);

// $FlowFixMe[signature-verification-failure]
export const WithProSubscription = () => (
  <AuthenticatedUserContext.Provider value={fakeStartupAuthenticatedUser}>
    {/* $FlowFixMe[incompatible-type] */}
    <LeaderboardOptionsDialog
      open
      onClose={() => action('onClose')()}
      onSave={action('onSave')}
      sort={'ASC'}
      extremeAllowedScore={undefined}
      leaderboard={fakeLeaderboard}
    />
  </AuthenticatedUserContext.Provider>
);
