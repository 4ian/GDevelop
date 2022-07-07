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

export const Default = () => {
  const { getConfirmation } = useConfirmDialog();

  const onOpenDialog = async () => {
    const answer = await getConfirmation({
      title: t`You are about to delete an object`,
      message: t`Do you want to continue?`,
    });
    if (answer) action('Confirmed')();
    else action('Dismissed')();
  };

  return <RaisedButton label="Open dialog" onClick={onOpenDialog} />;
};

export default {
  title: 'UI Building Blocks/ConfirmDialog',
  component: ConfirmDialog,
  decorators: [paperDecorator, confirmDecorator, muiDecorator, themeDecorator],
};
