// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';
import CreateProfile from '../../../Profile/CreateProfile';

export default {
  title: 'Profile/CreateProfile',
  component: CreateProfile,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => (
  <CreateProfile
    onOpenLoginDialog={action('onOpenLoginDialog')}
    onOpenCreateAccountDialog={action('onOpenCreateAccountDialog')}
  />
);
