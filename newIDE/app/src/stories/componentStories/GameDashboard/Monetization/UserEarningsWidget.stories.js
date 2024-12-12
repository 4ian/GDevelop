// @flow

import * as React from 'react';

import paperDecorator from '../../../PaperDecorator';
import UserEarningsWidget from '../../../../GameDashboard/Monetization/UserEarningsWidget';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';

import { fakeSilverAuthenticatedUser } from '../../../../fixtures/GDevelopServicesTestData';
import { GDevelopUsageApi } from '../../../../Utils/GDevelopServices/ApiConfigs';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

export default {
  title: 'GameDashboard/Monetization/UserEarningsWidget',
  component: UserEarningsWidget,
  decorators: [paperDecorator],
};

export const Errored = () => {
  const mock = new MockAdapter(axios, { delayResponse: 500 });
  mock
    .onGet(`${GDevelopUsageApi.baseUrl}/user-earnings-balance`)
    .reply(500)
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });

  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <UserEarningsWidget size="full" />
    </AuthenticatedUserContext.Provider>
  );
};

export const NoEarnings = () => {
  const mock = new MockAdapter(axios, { delayResponse: 500 });
  mock
    .onGet(`${GDevelopUsageApi.baseUrl}/user-earnings-balance`)
    .reply(200, [
      {
        userId: 'indie-user',
        amountInMilliUSDs: 0,
        amountInCredits: 0,
        minAmountToCashoutInMilliUSDs: 60000,
        updatedAt: 123456,
      },
    ])
    .onPost(`${GDevelopUsageApi.baseUrl}/user-earnings-balance/action/cash-out`)
    .reply(200)
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });

  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <UserEarningsWidget size="full" />
    </AuthenticatedUserContext.Provider>
  );
};

export const LittleEarnings = () => {
  const mock = new MockAdapter(axios, { delayResponse: 500 });
  mock
    .onGet(`${GDevelopUsageApi.baseUrl}/user-earnings-balance`)
    .reply(200, [
      {
        userId: 'indie-user',
        amountInMilliUSDs: 4,
        amountInCredits: 0,
        minAmountToCashoutInMilliUSDs: 60000,
        updatedAt: 123456,
      },
    ])
    .onPost(`${GDevelopUsageApi.baseUrl}/user-earnings-balance/action/cash-out`)
    .reply(200)
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });

  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <UserEarningsWidget size="full" />
    </AuthenticatedUserContext.Provider>
  );
};

export const SomeEarnings = () => {
  const mock = new MockAdapter(axios, { delayResponse: 500 });
  mock
    .onGet(`${GDevelopUsageApi.baseUrl}/user-earnings-balance`)
    .reply(200, [
      {
        userId: 'indie-user',
        amountInMilliUSDs: 4000,
        amountInCredits: 800,
        minAmountToCashoutInMilliUSDs: 60000,
        updatedAt: 123456,
      },
    ])
    .onPost(`${GDevelopUsageApi.baseUrl}/user-earnings-balance/action/cash-out`)
    .reply(200)
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });

  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <UserEarningsWidget size="full" />
    </AuthenticatedUserContext.Provider>
  );
};

export const ALotOfEarnings = () => {
  const mock = new MockAdapter(axios, { delayResponse: 500 });
  mock
    .onGet(`${GDevelopUsageApi.baseUrl}/user-earnings-balance`)
    .reply(200, [
      {
        userId: 'indie-user',
        amountInMilliUSDs: 400000,
        amountInCredits: 80000,
        minAmountToCashoutInMilliUSDs: 60000,
        updatedAt: 123456,
      },
    ])
    .onPost(`${GDevelopUsageApi.baseUrl}/user-earnings-balance/action/cash-out`)
    .reply(200)
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });

  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <UserEarningsWidget size="full" />
    </AuthenticatedUserContext.Provider>
  );
};
