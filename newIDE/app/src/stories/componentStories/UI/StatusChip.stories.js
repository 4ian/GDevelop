// @flow
import * as React from 'react';

import paperDecorator from '../../PaperDecorator';

import StatusChip, {
  StatusIcon,
  type StatusChipTone,
} from '../../../UI/StatusChip';
import { ColumnStackLayout, LineStackLayout } from '../../../UI/Layout';
import Text from '../../../UI/Text';
import CheckCircleFilled from '../../../UI/CustomSvgIcons/CheckCircleFilled';
import ErrorFilled from '../../../UI/CustomSvgIcons/ErrorFilled';
import WarningRound from '../../../UI/CustomSvgIcons/WarningRound';
import History from '../../../UI/CustomSvgIcons/History';

export default {
  title: 'UI Building Blocks/StatusChip',
  component: StatusChip,
  decorators: [paperDecorator],
};

const tones: Array<{|
  tone: StatusChipTone,
  label: string,
  icon: React.Node,
|}> = [
  { tone: 'neutral', label: 'Never run', icon: null },
  { tone: 'success', label: 'Passed', icon: <CheckCircleFilled /> },
  { tone: 'error', label: 'Failed', icon: <ErrorFilled /> },
  { tone: 'warning', label: 'Timed out', icon: <WarningRound /> },
  { tone: 'info', label: 'Last run', icon: <History /> },
  { tone: 'progress', label: 'Running...', icon: null },
];

export const AllTones = (): React.Node => (
  <ColumnStackLayout>
    {tones.map(({ tone, label, icon }) => (
      <LineStackLayout key={tone} noMargin alignItems="center">
        <StatusIcon tone={tone} icon={icon || <CheckCircleFilled />} />
        <StatusChip
          tone={tone}
          icon={icon}
          loading={tone === 'progress'}
          label={label}
        />
        <StatusChip
          size="small"
          tone={tone}
          icon={icon}
          loading={tone === 'progress'}
          label={label}
        />
        <Text noMargin color="secondary" size="body-small">
          {tone}
        </Text>
      </LineStackLayout>
    ))}
  </ColumnStackLayout>
);

export const WithDetails = (): React.Node => (
  <ColumnStackLayout>
    <LineStackLayout noMargin alignItems="center">
      <StatusChip
        tone="progress"
        loading
        label="Running..."
        details="frame 247"
      />
    </LineStackLayout>
    <LineStackLayout noMargin alignItems="center">
      <StatusChip
        size="small"
        tone="success"
        icon={<CheckCircleFilled />}
        label="Passed"
        details="320 frames in 5.42s"
      />
    </LineStackLayout>
  </ColumnStackLayout>
);

/**
 * Whatever a chip shows - an icon, a spinner, nothing - it keeps the same
 * height, so that a status changing never moves the layout around it.
 */
export const SameHeightWhateverTheStatus = (): React.Node => (
  <ColumnStackLayout>
    <Text noMargin color="secondary" size="body-small">
      Default size
    </Text>
    <LineStackLayout noMargin alignItems="center">
      {tones.map(({ tone, label, icon }) => (
        <StatusChip
          key={tone}
          tone={tone}
          icon={icon}
          loading={tone === 'progress'}
          label={label}
        />
      ))}
    </LineStackLayout>
    <Text noMargin color="secondary" size="body-small">
      Small size
    </Text>
    <LineStackLayout noMargin alignItems="center">
      {tones.map(({ tone, label, icon }) => (
        <StatusChip
          key={tone}
          size="small"
          tone={tone}
          icon={icon}
          loading={tone === 'progress'}
          label={label}
        />
      ))}
    </LineStackLayout>
  </ColumnStackLayout>
);
