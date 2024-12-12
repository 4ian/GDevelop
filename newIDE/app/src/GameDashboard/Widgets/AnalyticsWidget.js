// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import { Trans } from '@lingui/macro';
import DashboardWidget from './DashboardWidget';
import FlatButton from '../../UI/FlatButton';
import ArrowRight from '../../UI/CustomSvgIcons/ArrowRight';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../../UI/Layout';
import { Column, Line, Spacer } from '../../UI/Grid';
import Text from '../../UI/Text';
import { type Game } from '../../Utils/GDevelopServices/Game';
import { SessionsChart } from '../GameAnalyticsCharts';
import { type GameMetrics } from '../../Utils/GDevelopServices/Analytics';
import { buildLastWeekChartData } from '../GameAnalyticsEvaluator';
import RaisedButton from '../../UI/RaisedButton';
import Coin from '../../Credits/Icons/Coin';
import MarketingPlansDialog from '../../MarketingPlans/MarketingPlansDialog';
import GameLinkAndShareIcons from '../GameLinkAndShareIcons';
import { useResponsiveWindowSize } from '../../UI/Responsive/ResponsiveWindowMeasurer';
import { getHelpLink } from '../../Utils/HelpLink';
import Window from '../../Utils/Window';
import Link from '../../UI/Link';

const publishingHelpLink = getHelpLink('/publishing', 'publish-your-game');

const styles = { loadingSpace: { height: 100 } };

type Props = {|
  game: Game,
  onSeeAll: () => void,
  gameMetrics: ?Array<GameMetrics>,
  gameUrl: ?string,
|};

const AnalyticsWidget = ({ game, onSeeAll, gameMetrics, gameUrl }: Props) => {
  const hasNoSession = gameMetrics && gameMetrics.length === 0;
  const { isMobile } = useResponsiveWindowSize();
  const oneWeekAgoIsoDate = new Date(
    new Date().setHours(0, 0, 0, 0) - 7 * 24 * 3600 * 1000
  ).toISOString();
  const [
    marketingPlansDialogOpen,
    setMarketingPlansDialogOpen,
  ] = React.useState<boolean>(false);

  const chartData = React.useMemo(
    () => {
      const lastWeekGameMetrics = gameMetrics
        ? gameMetrics.filter(metrics => metrics.date > oneWeekAgoIsoDate)
        : null;

      return buildLastWeekChartData(lastWeekGameMetrics);
    },
    [gameMetrics, oneWeekAgoIsoDate]
  );

  return (
    <>
      <I18n>
        {({ i18n }) => (
          <DashboardWidget
            widgetSize={'twoThirds'}
            minHeight
            title={<Trans>Analytics</Trans>}
            topRightAction={
              <FlatButton
                label={<Trans>See all</Trans>}
                rightIcon={<ArrowRight fontSize="small" />}
                onClick={onSeeAll}
                primary
              />
            }
            widgetName="analytics"
          >
            <ResponsiveLineStackLayout expand noColumnMargin noMargin>
              {!gameMetrics ? (
                <div style={styles.loadingSpace} />
              ) : hasNoSession ? (
                gameUrl ? (
                  <ColumnStackLayout
                    noMargin
                    alignItems={isMobile ? 'stretch' : 'flex-start'}
                    noOverflowParent
                  >
                    <Spacer />
                    <Text noMargin color="secondary">
                      <Trans>
                        No data to show yet. Share your game creator profile
                        with more people to get more players!
                      </Trans>
                    </Text>
                    <GameLinkAndShareIcons display="column" url={gameUrl} />
                  </ColumnStackLayout>
                ) : (
                  <ColumnStackLayout
                    noMargin
                    expand
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Spacer />
                    <Text color="secondary" noMargin>
                      <Trans>
                        <Link
                          href={publishingHelpLink}
                          onClick={() =>
                            Window.openExternalURL(publishingHelpLink)
                          }
                        >
                          Share your game
                        </Link>{' '}
                        and start collecting data from your players to better
                        understand them.
                      </Trans>
                    </Text>
                  </ColumnStackLayout>
                )
              ) : (
                <Column expand noMargin>
                  <Line alignItems="center" justifyContent="space-between">
                    <Text size="block-title" noMargin>
                      <Trans>Sessions</Trans>
                    </Text>
                    <RaisedButton
                      primary
                      icon={<Coin fontSize="small" />}
                      label={<Trans>Get more players</Trans>}
                      onClick={() => setMarketingPlansDialogOpen(true)}
                    />
                  </Line>
                  <SessionsChart
                    i18n={i18n}
                    height={200}
                    chartData={chartData}
                    fontSize="small"
                  />
                </Column>
              )}
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
