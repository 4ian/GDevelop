// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../PaperDecorator';
import { GameCard } from '../../../GameDashboard/GameCard';
import {
  fakeSilverAuthenticatedUser,
  game1,
} from '../../../fixtures/GDevelopServicesTestData';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import CloudStorageProvider from '../../../ProjectsStorage/CloudStorageProvider';

export default {
  title: 'GameDashboard/GameCard',
  component: GameCard,
  decorators: [paperDecorator],
};

export const DefaultGameCard = () => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <GameCard
      storageProviders={[CloudStorageProvider]}
      game={game1}
      isCurrentGame={false}
      onOpenGameManager={action('onOpenGameManager')}
      onOpenProject={action('onOpenProject')}
    />
  </AuthenticatedUserContext.Provider>
);

export const DefaultCurrentlyEditedCard = () => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <GameCard
      storageProviders={[CloudStorageProvider]}
      game={game1}
      isCurrentGame={true}
      onOpenGameManager={action('onOpenGameManager')}
      onOpenProject={action('onOpenProject')}
    />
  </AuthenticatedUserContext.Provider>
);
