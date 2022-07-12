// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';
import {
  LeaderboardReplacerProgressDialog,
  ReplacePromptDialog,
} from '../../../Leaderboard/useLeaderboardReplacer';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import { fakeIndieAuthenticatedUser } from '../../../fixtures/GDevelopServicesTestData';

export default {
  title: 'Leaderboard/LeaderboardReplacerDialog',
  component: LeaderboardReplacerProgressDialog,
  decorators: [paperDecorator, muiDecorator],
};

export const IsReplacingLeaderboards = () => (
  <LeaderboardReplacerProgressDialog
    progress={30}
    onAbandon={null}
    onRetry={null}
    erroredLeaderboards={[
      { leaderboardId: 'errored-leaderboard-id', error: new Error() },
    ]}
  />
);

export const WithErrors = () => (
  <LeaderboardReplacerProgressDialog
    progress={100}
    onAbandon={action('onAbandon')}
    onRetry={action('onRetry')}
    erroredLeaderboards={[
      { leaderboardId: 'errored-leaderboard-id', error: new Error() },
    ]}
  />
);

export const ReplacerPromptAuthenticatedUser = () => (
  <AuthenticatedUserContext.Provider value={fakeIndieAuthenticatedUser}>
    <ReplacePromptDialog
      leaderboardsToReplace={['leadeboard-to-replace']}
      onClose={action('onClose')}
      onTriggerReplace={action('onTriggerReplace')}
    />
  </AuthenticatedUserContext.Provider>
);

export const ReplacerPromptNotAuthenticatedUser = () => (
  <AuthenticatedUserContext.Provider
    value={{ ...fakeIndieAuthenticatedUser, authenticated: false }}
  >
    <ReplacePromptDialog
      leaderboardsToReplace={['leadeboard-to-replace']}
      onClose={action('onClose')}
      onTriggerReplace={action('onTriggerReplace')}
    />
  </AuthenticatedUserContext.Provider>
);
