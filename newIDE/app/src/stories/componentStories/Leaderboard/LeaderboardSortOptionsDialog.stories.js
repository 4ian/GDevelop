// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../PaperDecorator';
import LeaderboardOptionsDialog from '../../../GameDashboard/LeaderboardAdmin/LeaderboardOptionsDialog';

export default {
  title: 'Leaderboard/LeaderboardOptionsDialog',
  component: LeaderboardOptionsDialog,
  decorators: [paperDecorator],
};

export const Default = () => (
  <LeaderboardOptionsDialog
    open
    onClose={() => action('onClose')()}
    onSave={() => action('onSave')()}
    sort={'ASC'}
    extremeAllowedScore={undefined}
  />
);
