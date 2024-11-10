// @flow
import * as React from 'react';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { action } from '@storybook/addon-actions';
import paperDecorator from '../../PaperDecorator';
import alertDecorator from '../../AlertDecorator';
import AnyQuestionDialog from '../../../MainFrame/EditorContainers/HomePage/AnyQuestionDialog';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import {
  fakeAuthenticatedUserWithEducationPlan,
  fakeAuthenticatedUserWithNoSubscription,
  fakeAuthenticatedUserWithQuestionsQuotaReached,
  fakeNotAuthenticatedUser,
} from '../../../fixtures/GDevelopServicesTestData';
import i18nProviderDecorator from '../../I18nProviderDecorator';

export default {
  title: 'HomePage/AnyQuestionDialog',
  component: AnyQuestionDialog,
  decorators: [paperDecorator, alertDecorator, i18nProviderDecorator],
};

export const Default = () => {
  const axiosMock = new MockAdapter(axios, { delayResponse: 500 });
  axiosMock.onAny().reply(200);

  return (
    <AuthenticatedUserContext.Provider
      value={fakeAuthenticatedUserWithNoSubscription}
    >
      <AnyQuestionDialog onClose={action('onClose')} />
    </AuthenticatedUserContext.Provider>
  );
};

export const LimitReached = () => {
  const axiosMock = new MockAdapter(axios, { delayResponse: 500 });
  axiosMock.onAny().reply(500);

  return (
    <AuthenticatedUserContext.Provider
      value={fakeAuthenticatedUserWithQuestionsQuotaReached}
    >
      <AnyQuestionDialog onClose={action('onClose')} />
    </AuthenticatedUserContext.Provider>
  );
};

export const NotAuthenticated = () => (
  <AuthenticatedUserContext.Provider value={fakeNotAuthenticatedUser}>
    <AnyQuestionDialog onClose={action('onClose')} />
  </AuthenticatedUserContext.Provider>
);

export const Erroring = () => {
  const axiosMock = new MockAdapter(axios, { delayResponse: 500 });
  axiosMock.onAny().reply(500);

  return (
    <AuthenticatedUserContext.Provider
      value={fakeAuthenticatedUserWithEducationPlan}
    >
      <AnyQuestionDialog onClose={action('onClose')} />
    </AuthenticatedUserContext.Provider>
  );
};
