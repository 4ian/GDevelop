// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import paperDecorator from '../../PaperDecorator';
import ForgotPasswordDialog from '../../../Profile/ForgotPasswordDialog';

export default {
  title: 'Profile/ForgotPasswordDialog',
  component: ForgotPasswordDialog,
  decorators: [paperDecorator],
};

// $FlowFixMe[signature-verification-failure]
export const Default = () => (
  <ForgotPasswordDialog
    onClose={() => action('onClose')()}
    onForgotPassword={() => action('onForgotPassword')()}
  />
);
