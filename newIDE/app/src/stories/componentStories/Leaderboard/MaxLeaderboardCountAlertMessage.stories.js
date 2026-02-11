// @flow
import * as React from 'react';
import paperDecorator from '../../PaperDecorator';
import { defaultAuthenticatedUserWithNoSubscription } from '../../../fixtures/GDevelopServicesTestData';
import MaxLeaderboardCountAlertMessage from '../../../GameDashboard/LeaderboardAdmin/MaxLeaderboardCountAlertMessage';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';

export default {
  title: 'Leaderboard/MaxLeaderboardCountAlertMessage',
  component: MaxLeaderboardCountAlertMessage,
  decorators: [paperDecorator],
};

export const Default = () => (
  <AuthenticatedUserContext.Provider
    value={defaultAuthenticatedUserWithNoSubscription}
  >
    <MaxLeaderboardCountAlertMessage />
  </AuthenticatedUserContext.Provider>
);
