// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../../ThemeDecorator';

import paperDecorator from '../../PaperDecorator';
import ShareDialog from '../../../GameDashboard/ShareDialog';
import {
  fakeIndieAuthenticatedUser,
  game1,
} from '../../../fixtures/GDevelopServicesTestData';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';

export default {
  title: 'GameDashboard/ShareDialog',
  component: ShareDialog,
  decorators: [muiDecorator, paperDecorator],
};

export const DefaultShareDialog = () => (
  <AuthenticatedUserContext.Provider value={fakeIndieAuthenticatedUser}>
    <ShareDialog game={game1} onClose={action('onClose')} />
  </AuthenticatedUserContext.Provider>
);
