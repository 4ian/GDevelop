// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';
import ForgotPasswordDialog from '../../../Profile/ForgotPasswordDialog';

export default {
  title: 'Profile/ForgotPasswordDialog',
  component: ForgotPasswordDialog,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => (
  <ForgotPasswordDialog
    onClose={() => action('onClose')()}
    onForgotPassword={() => action('onForgotPassword')()}
  />
);
