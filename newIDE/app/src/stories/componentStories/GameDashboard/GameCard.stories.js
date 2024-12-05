// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../PaperDecorator';
import GameCard from '../../../GameDashboard/GameCard';
import {
  fakeSilverAuthenticatedUser,
  game1,
  game2,
} from '../../../fixtures/GDevelopServicesTestData';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import CloudStorageProvider from '../../../ProjectsStorage/CloudStorageProvider';

export default {
  title: 'GameDashboard/GameCard',
  component: GameCard,
  decorators: [paperDecorator],
};

export const UnpublishedGame = () => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <GameCard
      storageProviders={[CloudStorageProvider]}
      game={game2}
      isCurrentProjectOpened={false}
      onOpenGameManager={action('onOpenGameManager')}
      onOpenProject={action('onOpenProject')}
      onUnregisterGame={action('onUnregisterGame')}
      askToCloseProject={action('askToCloseProject')}
      canSaveProject
      disabled={false}
      onSaveProject={action('onSaveProject')}
    />
  </AuthenticatedUserContext.Provider>
);

export const PublishedGame = () => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <GameCard
      storageProviders={[CloudStorageProvider]}
      game={game1}
      isCurrentProjectOpened={false}
      onOpenGameManager={action('onOpenGameManager')}
      onOpenProject={action('onOpenProject')}
      onUnregisterGame={action('onUnregisterGame')}
      askToCloseProject={action('askToCloseProject')}
      canSaveProject
      disabled={false}
      onSaveProject={action('onSaveProject')}
    />
  </AuthenticatedUserContext.Provider>
);

export const CurrentlyOpened = () => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <GameCard
      storageProviders={[CloudStorageProvider]}
      game={game1}
      isCurrentProjectOpened
      onOpenGameManager={action('onOpenGameManager')}
      onOpenProject={action('onOpenProject')}
      onUnregisterGame={action('onUnregisterGame')}
      askToCloseProject={action('askToCloseProject')}
      canSaveProject
      disabled={false}
      onSaveProject={action('onSaveProject')}
    />
  </AuthenticatedUserContext.Provider>
);

export const Saving = () => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <GameCard
      storageProviders={[CloudStorageProvider]}
      game={game1}
      isCurrentProjectOpened
      onOpenGameManager={action('onOpenGameManager')}
      onOpenProject={action('onOpenProject')}
      onUnregisterGame={action('onUnregisterGame')}
      askToCloseProject={action('askToCloseProject')}
      canSaveProject={false}
      disabled={false}
      onSaveProject={action('onSaveProject')}
    />
  </AuthenticatedUserContext.Provider>
);

export const Disabled = () => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <GameCard
      storageProviders={[CloudStorageProvider]}
      game={game1}
      isCurrentProjectOpened
      onOpenGameManager={action('onOpenGameManager')}
      onOpenProject={action('onOpenProject')}
      onUnregisterGame={action('onUnregisterGame')}
      askToCloseProject={action('askToCloseProject')}
      canSaveProject
      disabled
      onSaveProject={action('onSaveProject')}
    />
  </AuthenticatedUserContext.Provider>
);
