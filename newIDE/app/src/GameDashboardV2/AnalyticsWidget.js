// @flow

import * as React from 'react';
import DashboardWidget from './DashboardWidget';
import { Trans } from '@lingui/macro';
import FlatButton from '../UI/FlatButton';
import ArrowRight from '../UI/CustomSvgIcons/ArrowRight';
import { ResponsiveLineStackLayout } from '../UI/Layout';
import { Column } from '../UI/Grid';
import Text from '../UI/Text';
import UserEarnings from '../GameDashboard/Monetization/UserEarnings';

type Props = {|
  onSeeAll: () => void,
|};

const AnalyticsWidget = ({ onSeeAll }: Props) => {
  return (
    <DashboardWidget
      gridSize={2}
      withMaxHeight
      title={<Trans>Analytics</Trans>}
      seeMoreButton={
        <FlatButton
          label={<Trans>See all</Trans>}
          rightIcon={<ArrowRight fontSize="small" />}
          onClick={onSeeAll}
          primary
        />
      }
    >
      <ResponsiveLineStackLayout expand noColumnMargin noMargin>
        <Column expand noMargin>
          <Text size="block-title">
            <Trans>Earnings</Trans>
          </Text>
          <UserEarnings hideTitle margin="dense" />
        </Column>
        <Column expand noMargin>
          <Text size="block-title">
            <Trans>Sessions</Trans>
          </Text>
        </Column>
      </ResponsiveLineStackLayout>
    </DashboardWidget>
  );
};

export default AnalyticsWidget;
