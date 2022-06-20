// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../../ThemeDecorator';

import paperDecorator from '../../PaperDecorator';
import { GameCard } from '../../../GameDashboard/GameCard';
import {
  fakeIndieAuthenticatedUser,
  game1,
} from '../../../fixtures/GDevelopServicesTestData';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';

export default {
  title: 'GameDashboard/GameCard',
  component: GameCard,
  decorators: [muiDecorator, paperDecorator],
};

export const DefaultGameCard = () => (
  <AuthenticatedUserContext.Provider value={fakeIndieAuthenticatedUser}>
    <GameCard
      game={game1}
      isCurrentGame={false}
      onOpenGameManager={action('onOpenGameManager')}
      onUpdateGame={action('onUpdateGame')}
    />
  </AuthenticatedUserContext.Provider>
);

export const DefaultCurrentlyEditedCard = () => (
  <AuthenticatedUserContext.Provider value={fakeIndieAuthenticatedUser}>
    <GameCard
      game={game1}
      isCurrentGame={true}
      onOpenGameManager={action('onOpenGameManager')}
      onUpdateGame={action('onUpdateGame')}
    />
  </AuthenticatedUserContext.Provider>
);
