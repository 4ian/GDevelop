// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import { Trans } from '@lingui/macro';
import DashboardWidget from './DashboardWidget';
import FlatButton from '../UI/FlatButton';
import ArrowRight from '../UI/CustomSvgIcons/ArrowRight';
import { ResponsiveLineStackLayout } from '../UI/Layout';
import { Column, Line } from '../UI/Grid';
import Text from '../UI/Text';
import { type Game } from '../Utils/GDevelopServices/Game';
import UserEarnings from '../GameDashboard/Monetization/UserEarnings';
import { SessionsChart } from '../GameDashboard/GameAnalyticsCharts';
import { type GameMetrics } from '../Utils/GDevelopServices/Analytics';
import { buildLastWeekChartData } from '../GameDashboard/GameAnalyticsEvaluator';
import RaisedButton from '../UI/RaisedButton';
import Coin from '../Credits/Icons/Coin';
import MarketingPlansDialog from '../MarketingPlans/MarketingPlansDialog';

type Props = {|
  game: Game,
  onSeeAll: () => void,
  gameMetrics: ?Array<GameMetrics>,
|};

const AnalyticsWidget = ({ game, onSeeAll, gameMetrics }: Props) => {
  const chartData = React.useMemo(() => buildLastWeekChartData(gameMetrics), [
    gameMetrics,
  ]);
  const [
    marketingPlansDialogOpen,
    setMarketingPlansDialogOpen,
  ] = React.useState<boolean>(false);

  return (
    <>
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
                <Line alignItems="center" justifyContent="space-between">
                  <Text size="block-title" noMargin>
                    <Trans>Sessions</Trans>
                  </Text>
                  <RaisedButton
                    primary
                    icon={<Coin fontSize="small" />}
                    label={<Trans>Get more sessions</Trans>}
                    onClick={() => setMarketingPlansDialogOpen(true)}
                  />
                </Line>
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
      {marketingPlansDialogOpen && game && (
        <MarketingPlansDialog
          game={game}
          onClose={() => setMarketingPlansDialogOpen(false)}
        />
      )}
    </>
  );
};

export default AnalyticsWidget;
