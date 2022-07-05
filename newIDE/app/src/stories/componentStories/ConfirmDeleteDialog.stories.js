// @flow

import * as React from 'react';

import { action } from '@storybook/addon-actions';

import muiDecorator from '../ThemeDecorator';
import ConfirmDeleteDialog from '../../UI/ConfirmDeleteDialog';

export default {
  title: 'UI Building Blocks/ConfirmDeleteDialog',
  component: ConfirmDeleteDialog,
  decorators: [muiDecorator],
};

export const Default = () => (
  <ConfirmDeleteDialog
    title={'Do you really want to permanently delete your account?'}
    description={
      'You’re about to permanently delete your GDevelop account username@mail.com. You will no longer be able to log into the app with this email address.'
    }
    fieldDescription={'Type your email address to delete your account:'}
    confirmText={'username@mail.com'}
    onCancel={() => action('cancel')()}
    onConfirm={() => action('confirm')()}
  />
);
