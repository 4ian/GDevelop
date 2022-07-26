/* eslint-disable import/no-anonymous-default-export */
// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import { action } from '@storybook/addon-actions';
import muiDecorator from '../ThemeDecorator';
import paperDecorator from '../PaperDecorator';
import themeDecorator from '../ThemeDecorator';
import confirmDecorator from '../ConfirmDecorator';
import RaisedButton from '../../UI/RaisedButton';
import ConfirmDialog from '../../UI/Confirm/ConfirmDialog';
import useConfirmDialog from '../../UI/Confirm/useConfirmDialog';
import { Column, LargeSpacer } from '../../UI/Grid';

export const Default = () => {
  const { showConfirmation, showDeleteConfirmation } = useConfirmDialog();

  const onOpenConfirmDialog = async () => {
    const answer = await showConfirmation({
      title: t`You are about to delete an object`,
      message: t`Do you want to continue?`,
    });
    if (answer) action('Confirmed')();
    else action('Dismissed')();
  };

  const onOpenConfirmDeleteDialog = async () => {
    const answer = await showDeleteConfirmation({
      title: t`Do you really want to permanently delete your account?`,
      message: t`You’re about to permanently delete your GDevelop account username@mail.com. You will no longer be able to log into the app with this email address.`,
      fieldMessage: t`Type your email address to delete your account:`,
      confirmText: 'username@mail.com',
    });
    if (answer) action('Delete Confirmed')();
    else action('Delete Dismissed')();
  };

  return (
    <Column alignItems="flex-start">
      <RaisedButton label="Open confirm dialog" onClick={onOpenConfirmDialog} />
      <LargeSpacer />
      <RaisedButton
        label="Open confirm delete dialog"
        onClick={onOpenConfirmDeleteDialog}
      />
    </Column>
  );
};

export default {
  title: 'UI Building Blocks/ConfirmDialog',
  component: ConfirmDialog,
  decorators: [paperDecorator, confirmDecorator, muiDecorator, themeDecorator],
};
