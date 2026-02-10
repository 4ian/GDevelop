// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../PaperDecorator';
import LeaderboardAppearanceDialog from '../../../GameDashboard/LeaderboardAdmin/LeaderboardAppearanceDialog';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import {
  fakeSilverAuthenticatedUser,
  fakeAuthenticatedUserWithNoSubscription,
  fakeStartupAuthenticatedUser,
} from '../../../fixtures/GDevelopServicesTestData';

export default {
  title: 'Leaderboard/LeaderboardAppearanceDialog',
  component: LeaderboardAppearanceDialog,
  decorators: [paperDecorator],
};

// $FlowFixMe[signature-verification-failure]
export const WithoutSubscription = () => (
  <AuthenticatedUserContext.Provider
    value={fakeAuthenticatedUserWithNoSubscription}
  >
    <LeaderboardAppearanceDialog
      open
      onClose={() => action('onClose')()}
      onSave={() => action('onSave')()}
      leaderboardCustomizationSettings={{
        scoreTitle: 'Coins collected',
        scoreFormatting: {
          type: 'custom',
          prefix: '',
          suffix: ' coins',
          precision: 0,
        },
      }}
    />
  </AuthenticatedUserContext.Provider>
);

// $FlowFixMe[signature-verification-failure]
export const WithSilverSubscription = () => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <LeaderboardAppearanceDialog
      open
      onClose={() => action('onClose')()}
      onSave={() => action('onSave')()}
      leaderboardCustomizationSettings={{
        scoreTitle: 'Coins collected',
        scoreFormatting: {
          type: 'custom',
          prefix: '',
          suffix: ' coins',
          precision: 0,
        },
      }}
    />
  </AuthenticatedUserContext.Provider>
);

// $FlowFixMe[signature-verification-failure]
export const WithStartupSubscription = () => (
  <AuthenticatedUserContext.Provider value={fakeStartupAuthenticatedUser}>
    <LeaderboardAppearanceDialog
      open
      onClose={() => action('onClose')()}
      onSave={() => action('onSave')()}
      leaderboardCustomizationSettings={{
        scoreTitle: 'Coins collected',
        scoreFormatting: {
          type: 'custom',
          prefix: '',
          suffix: ' coins',
          precision: 0,
        },
      }}
    />
  </AuthenticatedUserContext.Provider>
);
