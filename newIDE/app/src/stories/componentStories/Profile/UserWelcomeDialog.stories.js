// @flow
import * as React from 'react';
import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';
import UserWelcomeDialog from '../../../Profile/UserWelcomeDialog';

export default {
  title: 'Profile/UserWelcomeDialog',
  component: UserWelcomeDialog,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => (
  <UserWelcomeDialog onClose={() => {}} message={'👋 Good to see you'} />
);
