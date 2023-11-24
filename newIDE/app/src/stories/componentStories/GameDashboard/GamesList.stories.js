// @flow

import * as React from 'react';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';

import { action } from '@storybook/addon-actions';
import {
  fakeSilverAuthenticatedUser,
  game1,
  game2,
} from '../../../fixtures/GDevelopServicesTestData';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import GamesList from '../../../GameDashboard/GamesList';

export default {
  title: 'GameDashboard/GamesList',
  component: GamesList,
  decorators: [paperDecorator, muiDecorator],
};

export const WithoutAProjectOpened = () => {
  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <GamesList
        project={null}
        games={[game1, game2]}
        onGameUpdated={action('onGameUpdated')}
        onRefreshGames={action('onRefreshGames')}
      />
    </AuthenticatedUserContext.Provider>
  );
};
