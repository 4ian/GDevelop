// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';
import LeaderboardAppearanceDialog from '../../../GameDashboard/LeaderboardAdmin/LeaderboardAppearanceDialog';

export default {
  title: 'Leaderboard/LeaderboardAppearanceDialog',
  component: LeaderboardAppearanceDialog,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => (
  <LeaderboardAppearanceDialog
    open
    onClose={() => action('onClose')()}
    onSave={() => action('onSave')()}
    leaderboardCustomizationSettings={{
      scoreTitle: 'Coins collected',
      scoreFormatting: {
        type: 'custom',
        prefix: '',
        suffix: ' coins',
        precision: 0,
      },
    }}
  />
);
