// @flow

import * as React from 'react';

import paperDecorator from '../../PaperDecorator';

import { action } from '@storybook/addon-actions';
import GameDashboardV2 from '../../../GameDashboardV2';

import { game1 } from '../../../fixtures/GDevelopServicesTestData';

export default {
  title: 'GameDashboard/GameDashboardV2',
  component: GameDashboardV2,
  decorators: [paperDecorator],
};

export const Default = () => {
  return <GameDashboardV2 game={game1} analyticsSource="homepage" />;
};
