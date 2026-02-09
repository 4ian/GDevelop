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
import FixedWidthFlexContainer from '../../../FixedWidthFlexContainer';

export default {
  title: 'HomePage/CreateSection/MaxProjectCountAlertMessage',
  component: MaxProjectCountAlertMessage,
  decorators: [paperDecorator],
};

export const ForFreeUser = (): renders* => (
  <AuthenticatedUserContext.Provider
    value={defaultAuthenticatedUserWithNoSubscription}
  >
    <MaxProjectCountAlertMessage />
  </AuthenticatedUserContext.Provider>
);

export const ForIndieUser = (): renders* => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <MaxProjectCountAlertMessage />
  </AuthenticatedUserContext.Provider>
);

export const ForGoldUser = (): renders* => (
  <AuthenticatedUserContext.Provider value={fakeGoldAuthenticatedUser}>
    <MaxProjectCountAlertMessage />
  </AuthenticatedUserContext.Provider>
);

export const ForProUser = (): renders* => (
  <AuthenticatedUserContext.Provider value={fakeStartupAuthenticatedUser}>
    <MaxProjectCountAlertMessage />
  </AuthenticatedUserContext.Provider>
);

export const DenseMargins = (): renders* => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <MaxProjectCountAlertMessage margin="dense" />
  </AuthenticatedUserContext.Provider>
);

export const DenseMarginsOnSmallDialog = (): renders* => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <FixedWidthFlexContainer width={500}>
      <MaxProjectCountAlertMessage margin="dense" />
    </FixedWidthFlexContainer>
  </AuthenticatedUserContext.Provider>
);
