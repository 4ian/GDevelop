// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import paperDecorator from '../../PaperDecorator';
import ChangeEmailDialog from '../../../Profile/ChangeEmailDialog';

export default {
  title: 'Profile/ChangeEmailDialog',
  component: ChangeEmailDialog,
  decorators: [paperDecorator],
};

const defaultProps = {
  firebaseUser: {
    uid: 'id',
    email: 'email',
  },
  onClose: () => action('onClose')(),
  changeEmailInProgress: false,
  onChangeEmail: action('onChangeEmail'),
  error: null,
};
// $FlowFixMe[signature-verification-failure]
export const Default = () => <ChangeEmailDialog {...defaultProps} />;

// $FlowFixMe[signature-verification-failure]
export const ErrorFromBackend = () => (
  <ChangeEmailDialog
    {...defaultProps}
    error={{ code: 'auth/requires-recent-login' }}
  />
);

// $FlowFixMe[signature-verification-failure]
export const Submitting = () => (
  <ChangeEmailDialog {...defaultProps} changeEmailInProgress />
);
