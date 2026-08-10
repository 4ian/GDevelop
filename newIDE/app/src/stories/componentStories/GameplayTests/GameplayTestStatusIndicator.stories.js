// @flow
import * as React from 'react';

import paperDecorator from '../../PaperDecorator';
import {
  GameplayTestStatusChip,
  GameplayTestStatusIcon,
  type GameplayTestDisplayStatus,
} from '../../../GameplayTests/GameplayTestStatusIndicator';
import { ColumnStackLayout, LineStackLayout } from '../../../UI/Layout';
import Text from '../../../UI/Text';

export default {
  title: 'GameplayTests/GameplayTestStatusIndicator',
  component: GameplayTestStatusChip,
  decorators: [paperDecorator],
};

const allStatuses: Array<GameplayTestDisplayStatus> = [
  'never-run',
  'launching',
  'running',
  'passed',
  'failed',
  'error',
  'timeout',
  'stopped',
];

export const AllStatuses = (): React.Node => (
  <ColumnStackLayout>
    {allStatuses.map(status => (
      <LineStackLayout key={status} noMargin alignItems="center">
        <GameplayTestStatusIcon status={status} />
        <GameplayTestStatusChip status={status} />
        <GameplayTestStatusChip status={status} size="small" />
        <Text noMargin color="secondary" size="body-small">
          {status}
        </Text>
      </LineStackLayout>
    ))}
  </ColumnStackLayout>
);

export const WithDetails = (): React.Node => (
  <ColumnStackLayout>
    <LineStackLayout noMargin alignItems="center">
      <GameplayTestStatusChip status="running" details="frame 247" />
    </LineStackLayout>
    <LineStackLayout noMargin alignItems="center">
      <GameplayTestStatusChip
        status="passed"
        size="small"
        details="320 frames in 5.42s"
      />
    </LineStackLayout>
  </ColumnStackLayout>
);
