// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';
import { limitsReached } from '../../../fixtures/GDevelopServicesTestData';
import MaxLeaderboardCountAlertMessage from '../../../GameDashboard/LeaderboardAdmin/MaxLeaderboardCountAlertMessage';

export default {
  title: 'Leaderboard/MaxLeaderboardCountAlertMessage',
  component: MaxLeaderboardCountAlertMessage,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => (
  <MaxLeaderboardCountAlertMessage
    limits={limitsReached}
    onUpgrade={() => action('onUpgrade')()}
    onClose={() => action('onClose')()}
  />
);
