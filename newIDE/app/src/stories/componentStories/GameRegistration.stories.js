// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../ThemeDecorator';
import paperDecorator from '../PaperDecorator';

import {
  GameRegistrationWidget,
  type GameRegistrationWidgetProps,
} from '../../GameDashboard/GameRegistration';
import GDevelopJsInitializerDecorator, {
  testProject,
} from '../GDevelopJsInitializerDecorator';
import {
  indieUserProfile,
  game1,
} from '../../fixtures/GDevelopServicesTestData';
import { type Profile } from '../../Utils/GDevelopServices/Authentication';

const indieUserProfileWithGameStatsEmail: Profile = {
  ...indieUserProfile,
  getGameStatsEmail: true,
  getNewsletterEmail: true,
};

export default {
  title: 'GameDashboard/GameRegistrationWidget',
  component: GameRegistrationWidget,
  decorators: [paperDecorator, muiDecorator, GDevelopJsInitializerDecorator],
};

const defaultProps: GameRegistrationWidgetProps = {
  authenticated: true,
  profile: indieUserProfile,
  onLogin: action('onLogin'),
  onCreateAccount: action('onCreateAccount'),
  project: testProject.project,
  game: game1,
  setGame: action('setGame'),
  loadGame: action('loadGame'),
  onRegisterGame: action('onRegisterGame'),
  registrationInProgress: false,
  hideIfRegistered: false,
  unavailableReason: null,
  acceptGameStatsEmailInProgress: false,
  onAcceptGameStatsEmail: action('onAcceptGameStatsEmail'),
  detailsInitialTab: 'details',
  setDetailsInitialTab: action('setDetailsInitialTab'),
  detailsOpened: false,
  setDetailsOpened: action('setDetailsOpened'),
  error: null,
  hideLoader: false,
};

export const NoProjectLoaded = () => (
  <GameRegistrationWidget {...defaultProps} project={null} />
);
export const Loading = () => (
  <GameRegistrationWidget {...defaultProps} game={null} />
);
export const LoadingButHidingLoader = () => (
  <GameRegistrationWidget {...defaultProps} game={null} hideLoader />
);
export const NotLoggedIn = () => (
  <GameRegistrationWidget
    {...defaultProps}
    authenticated={false}
    profile={null}
  />
);
export const GameNotRegistered = () => (
  <GameRegistrationWidget {...defaultProps} unavailableReason="not-existing" />
);
export const NotAuthorized = () => (
  <GameRegistrationWidget {...defaultProps} unavailableReason="unauthorized" />
);
export const Errored = () => (
  <GameRegistrationWidget
    {...defaultProps}
    error={new Error('there was an error')}
  />
);
export const LoadedButHidingIfRegistered = () => (
  <GameRegistrationWidget {...defaultProps} hideIfRegistered />
);
export const EmailNotAccepted = () => (
  <GameRegistrationWidget {...defaultProps} profile={indieUserProfile} />
);
export const EmailAccepted = () => (
  <GameRegistrationWidget
    {...defaultProps}
    profile={indieUserProfileWithGameStatsEmail}
  />
);
export const EmailAcceptedButHidingIfSubscribed = () => (
  <GameRegistrationWidget
    {...defaultProps}
    profile={indieUserProfileWithGameStatsEmail}
    hideIfSubscribed
  />
);
export const DetailsOpened = () => (
  <GameRegistrationWidget
    {...defaultProps}
    profile={indieUserProfileWithGameStatsEmail}
    detailsOpened
  />
);
