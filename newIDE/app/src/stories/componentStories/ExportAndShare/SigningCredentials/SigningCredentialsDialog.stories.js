// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../../PaperDecorator';

import {
  fakeSilverAuthenticatedUser,
  mockSigningCredentials,
} from '../../../../fixtures/GDevelopServicesTestData';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import { SigningCredentialsDialog } from '../../../../ExportAndShare/SigningCredentials/SigningCredentialsDialog';
import alertDecorator from '../../../AlertDecorator';

export default {
  title: 'ExportAndShare/SigningCredentials/SigningCredentialsDialog',
  component: SigningCredentialsDialog,
  decorators: [alertDecorator, paperDecorator],
};

export const Loading = (): React.Node => {
  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <SigningCredentialsDialog
        authenticatedUser={fakeSilverAuthenticatedUser}
        signingCredentials={null}
        error={null}
        onRefreshSigningCredentials={action('refresh')}
        onClose={action('onClose')}
      />
    </AuthenticatedUserContext.Provider>
  );
};

export const Errored = (): React.Node => {
  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <SigningCredentialsDialog
        authenticatedUser={fakeSilverAuthenticatedUser}
        signingCredentials={null}
        error={new Error('Fake Error')}
        onRefreshSigningCredentials={action('refresh')}
        onClose={action('onClose')}
      />
    </AuthenticatedUserContext.Provider>
  );
};

export const Empty = (): React.Node => {
  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <SigningCredentialsDialog
        authenticatedUser={fakeSilverAuthenticatedUser}
        signingCredentials={[]}
        error={null}
        onRefreshSigningCredentials={action('refresh')}
        onClose={action('onClose')}
      />
    </AuthenticatedUserContext.Provider>
  );
};

export const WithSigningCredentials = (): React.Node => {
  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <SigningCredentialsDialog
        authenticatedUser={fakeSilverAuthenticatedUser}
        signingCredentials={mockSigningCredentials}
        error={null}
        onRefreshSigningCredentials={action('refresh')}
        onClose={action('onClose')}
      />
    </AuthenticatedUserContext.Provider>
  );
};
