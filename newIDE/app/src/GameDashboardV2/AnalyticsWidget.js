// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import { Trans } from '@lingui/macro';
import DashboardWidget from './DashboardWidget';
import FlatButton from '../UI/FlatButton';
import ArrowRight from '../UI/CustomSvgIcons/ArrowRight';
import { ResponsiveLineStackLayout } from '../UI/Layout';
import { Column } from '../UI/Grid';
import Text from '../UI/Text';
import UserEarnings from '../GameDashboard/Monetization/UserEarnings';
import { SessionsChart } from '../GameDashboard/GameAnalyticsPanel';
import { type GameMetrics } from '../Utils/GDevelopServices/Analytics';
import { buildLastWeekChartData } from '../GameDashboard/GameAnalyticsEvaluator';

type Props = {|
  onSeeAll: () => void,
  gameMetrics: ?Array<GameMetrics>,
|};

const AnalyticsWidget = ({ onSeeAll, gameMetrics }: Props) => {
  const chartData = React.useMemo(() => buildLastWeekChartData(gameMetrics), [
    gameMetrics,
  ]);

  return (
    <I18n>
      {({ i18n }) => (
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
            <Column expand noMargin useFullHeight>
              <Text size="block-title">
                <Trans>Earnings</Trans>
              </Text>
              <Column expand noMargin useFullHeight justifyContent="center">
                <UserEarnings hideTitle margin="dense" />
              </Column>
            </Column>
            <Column expand noMargin>
              <Text size="block-title">
                <Trans>Sessions</Trans>
              </Text>
              <SessionsChart
                i18n={i18n}
                height={220}
                chartData={chartData}
                fontSize="small"
              />
            </Column>
          </ResponsiveLineStackLayout>
        </DashboardWidget>
      )}
    </I18n>
  );
};

export default AnalyticsWidget;
