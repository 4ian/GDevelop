// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../PaperDecorator';
import EmailVerificationDialog from '../../../Profile/EmailVerificationDialog';
import {
  fakeSilverAuthenticatedUser,
  fakeAuthenticatedUserWithEmailVerified,
} from '../../../fixtures/GDevelopServicesTestData';

export default {
  title: 'Profile/EmailVerificationDialog',
  component: EmailVerificationDialog,
  decorators: [paperDecorator],
};

// $FlowFixMe[signature-verification-failure]
export const EmailAlreadySentNoButton = () => (
  <EmailVerificationDialog
    onClose={action('onClose')}
    authenticatedUser={fakeSilverAuthenticatedUser}
    onSendEmail={action('onSendEmail')}
    sendEmailAutomatically={false}
    showSendEmailButton={false}
  />
);

// $FlowFixMe[signature-verification-failure]
export const EmailAlreadySentWithButton = () => (
  <EmailVerificationDialog
    onClose={action('onClose')}
    authenticatedUser={fakeSilverAuthenticatedUser}
    onSendEmail={action('onSendEmail')}
    sendEmailAutomatically={false}
    showSendEmailButton
  />
);

// $FlowFixMe[signature-verification-failure]
export const SendEmailOnOpeningNoButton = () => (
  <EmailVerificationDialog
    onClose={action('onClose')}
    authenticatedUser={fakeSilverAuthenticatedUser}
    onSendEmail={action('onSendEmail')}
    sendEmailAutomatically
    showSendEmailButton={false}
  />
);

// $FlowFixMe[signature-verification-failure]
export const VerifiedUser = () => (
  <EmailVerificationDialog
    onClose={action('onClose')}
    authenticatedUser={fakeAuthenticatedUserWithEmailVerified}
    onSendEmail={action('onSendEmail')}
    sendEmailAutomatically
    showSendEmailButton
  />
);
