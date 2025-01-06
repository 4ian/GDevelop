// @flow
import * as React from 'react';
import { MaxProjectCountAlertMessage } from '../../../../MainFrame/EditorContainers/HomePage/CreateSection/MaxProjectCountAlertMessage';
import paperDecorator from '../../../PaperDecorator';
import {
  defaultAuthenticatedUserWithNoSubscription,
  fakeGoldAuthenticatedUser,
  fakeSilverAuthenticatedUser,
  fakeStartupAuthenticatedUser,
} from '../../../../fixtures/GDevelopServicesTestData';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';

export default {
  title: 'HomePage/CreateSection/MaxProjectCountAlertMessage',
  component: MaxProjectCountAlertMessage,
  decorators: [paperDecorator],
};

export const ForFreeUser = () => (
  <AuthenticatedUserContext.Provider
    value={defaultAuthenticatedUserWithNoSubscription}
  >
    <MaxProjectCountAlertMessage />
  </AuthenticatedUserContext.Provider>
);

export const ForIndieUser = () => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <MaxProjectCountAlertMessage />
  </AuthenticatedUserContext.Provider>
);

export const ForGoldUser = () => (
  <AuthenticatedUserContext.Provider value={fakeGoldAuthenticatedUser}>
    <MaxProjectCountAlertMessage />
  </AuthenticatedUserContext.Provider>
);

export const ForProUser = () => (
  <AuthenticatedUserContext.Provider value={fakeStartupAuthenticatedUser}>
    <MaxProjectCountAlertMessage />
  </AuthenticatedUserContext.Provider>
);

export const DenseMargins = () => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <MaxProjectCountAlertMessage margin="dense" />
  </AuthenticatedUserContext.Provider>
);
