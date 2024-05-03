// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import { action } from '@storybook/addon-actions';
import paperDecorator from '../PaperDecorator';
import alertDecorator from '../AlertDecorator';
import RaisedButton from '../../UI/RaisedButton';
import AlertDialog from '../../UI/Alert/AlertDialog';
import useAlertDialog from '../../UI/Alert/useAlertDialog';
import { Column, LargeSpacer } from '../../UI/Grid';

export const Default = () => {
  const {
    showAlert,
    showConfirmation,
    showDeleteConfirmation,
    showYesNoCancel,
  } = useAlertDialog();

  const onOpenAlertDialog = async () => {
    await showAlert({
      title: t`Sorry`,
      message: t`You cannot do this.`,
    });
    action('Dismissed')();
  };

  const onOpenYesNoCancelDialog = async () => {
    const answer = await showYesNoCancel({
      title: t`Warning`,
      message: t`Do you want to refactor your project?`,
    });
    if (answer === 0) {
      action('Yes')();
    } else if (answer === 1) {
      action('No')();
    } else {
      action('Cancel')();
    }
  };

  const onOpenConfirmDialog = async () => {
    const answer = await showConfirmation({
      title: t`You are about to delete an object`,
      message: t`Do you want to continue?`,
      confirmButtonLabel: t`Delete object`,
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
      confirmButtonLabel: t`Delete my account`,
    });
    if (answer) action('Delete Confirmed')();
    else action('Delete Dismissed')();
  };

  const onOpenConfirmDeleteWithoutConfirmTextDialog = async () => {
    const answer = await showDeleteConfirmation({
      title: t`Do you really want to permanently delete your account?`,
      message: t`You’re about to permanently delete your GDevelop account username@mail.com. You will no longer be able to log into the app with this email address.`,
      confirmButtonLabel: t`Delete my account`,
    });
    if (answer) action('Delete Confirmed')();
    else action('Delete Dismissed')();
  };

  return (
    <Column alignItems="flex-start">
      <RaisedButton label="Open alert dialog" onClick={onOpenAlertDialog} />
      <LargeSpacer />
      <RaisedButton label="Open confirm dialog" onClick={onOpenConfirmDialog} />
      <LargeSpacer />
      <RaisedButton
        label="Open confirm delete dialog"
        onClick={onOpenConfirmDeleteDialog}
      />
      <LargeSpacer />
      <RaisedButton
        label="Open confirm delete dialog without confirm text"
        onClick={onOpenConfirmDeleteWithoutConfirmTextDialog}
      />
      <LargeSpacer />
      <RaisedButton
        label="Open yes no cancel dialog"
        onClick={onOpenYesNoCancelDialog}
      />
    </Column>
  );
};

export default {
  title: 'UI Building Blocks/AlertDialog',
  component: AlertDialog,
  decorators: [paperDecorator, alertDecorator],
};
