// @flow
import * as React from 'react';
import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';
import ChangeEmailDialog from '../../../Profile/ChangeEmailDialog';

export default {
  title: 'Profile/ChangeEmailDialog',
  component: ChangeEmailDialog,
  decorators: [paperDecorator, muiDecorator],
};

const defaultProps = {
  firebaseUser: {
    uid: 'id',
    email: 'email',
  },
  onClose: () => {},
  changeEmailInProgress: false,
  onChangeEmail: async () => {},
  error: null,
};
export const Default = () => <ChangeEmailDialog {...defaultProps} />;

export const ErrorFromBackend = () => (
  <ChangeEmailDialog
    {...defaultProps}
    error={{ code: 'auth/requires-recent-login' }}
  />
);

export const Submitting = () => (
  <ChangeEmailDialog {...defaultProps} changeEmailInProgress />
);
