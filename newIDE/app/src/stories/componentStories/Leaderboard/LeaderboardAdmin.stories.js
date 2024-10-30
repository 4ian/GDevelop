// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../PaperDecorator';
import { LeaderboardAdmin } from '../../../GameDashboard/LeaderboardAdmin';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';
import MockLeaderboardProvider from '../../MockLeaderboardProvider';

export default {
  title: 'Leaderboard/LeaderboardAdmin',
  component: LeaderboardAdmin,
  decorators: [paperDecorator],
};

export const WithErrors = () => (
  <MockLeaderboardProvider>
    <FixedHeightFlexContainer height={600}>
      <LeaderboardAdmin onLoading={() => action('onLoading')} />
    </FixedHeightFlexContainer>
  </MockLeaderboardProvider>
);
