// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../PaperDecorator';
import ShareGameDialog from '../../../GameDashboard/ShareGameDialog';
import {
  fakeSilverAuthenticatedUser,
  game1,
} from '../../../fixtures/GDevelopServicesTestData';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';

export default {
  title: 'GameDashboard/ShareGameDialog',
  component: ShareGameDialog,
  decorators: [paperDecorator],
};

export const DefaultShareGameDialog = () => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <ShareGameDialog game={game1} onClose={action('onClose')} />
  </AuthenticatedUserContext.Provider>
);
