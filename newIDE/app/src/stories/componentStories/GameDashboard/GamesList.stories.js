// @flow

import * as React from 'react';

import paperDecorator from '../../PaperDecorator';

import { action } from '@storybook/addon-actions';
import {
  fakeSilverAuthenticatedUser,
  game1,
  game2,
} from '../../../fixtures/GDevelopServicesTestData';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import GamesList from '../../../GameDashboard/GamesList';
import CloudStorageProvider from '../../../ProjectsStorage/CloudStorageProvider';

export default {
  title: 'GameDashboard/GamesList',
  component: GamesList,
  decorators: [paperDecorator],
};

export const WithoutAProjectOpened = () => {
  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <GamesList
        storageProviders={[CloudStorageProvider]}
        project={null}
        games={[game1, game2]}
        onRefreshGames={action('onRefreshGames')}
        onOpenGameId={action('onOpenGameId')}
        onOpenProject={action('onOpenProject')}
      />
    </AuthenticatedUserContext.Provider>
  );
};
