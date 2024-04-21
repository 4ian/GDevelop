// @flow

import * as React from 'react';

import { action } from '@storybook/addon-actions';

import paperDecorator from '../../../PaperDecorator';
import GameMonetization from '../../../../GameDashboard/Monetization/GameMonetization';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';

import {
  fakeSilverAuthenticatedUser,
  gameWithDisplayAdsOnGamePageEnabled,
  gameWithDisplayAdsOnGamePageDisabled,
} from '../../../../fixtures/GDevelopServicesTestData';
import { GDevelopGameApi } from '../../../../Utils/GDevelopServices/ApiConfigs';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

export default {
  title: 'GameDashboard/Monetization/GameMonetization',
  component: GameMonetization,
  decorators: [paperDecorator],
};

export const AdsEnabled = () => {
  const game = gameWithDisplayAdsOnGamePageEnabled;
  const mock = new MockAdapter(axios, { delayResponse: 1000 });
  mock
    .onPatch(`${GDevelopGameApi.baseUrl}/game/${game.id}`)
    .reply(200)
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });

  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <GameMonetization game={game} onGameUpdated={action('onGameUpdated')} />
    </AuthenticatedUserContext.Provider>
  );
};

export const AdsDisabled = () => {
  const game = gameWithDisplayAdsOnGamePageDisabled;
  const mock = new MockAdapter(axios, { delayResponse: 1000 });
  mock
    .onPatch(`${GDevelopGameApi.baseUrl}/game/${game.id}`)
    .reply(200)
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });

  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <GameMonetization game={game} onGameUpdated={action('onGameUpdated')} />
    </AuthenticatedUserContext.Provider>
  );
};

export const ErrorWhenUpdatingGame = () => {
  const game = gameWithDisplayAdsOnGamePageEnabled;
  const mock = new MockAdapter(axios, { delayResponse: 1000 });
  mock
    .onPatch(`${GDevelopGameApi.baseUrl}/game/${game.id}`)
    .reply(500)
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });

  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <GameMonetization game={game} onGameUpdated={action('onGameUpdated')} />
    </AuthenticatedUserContext.Provider>
  );
};
