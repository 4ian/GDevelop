// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import Grid from '@material-ui/core/Grid';
import { formatISO, subDays } from 'date-fns';
import { Column, Line } from '../UI/Grid';
import {
  type Game,
  type GameFeaturing,
  type MarketingPlan,
} from '../Utils/GDevelopServices/Game';
import { ColumnStackLayout } from '../UI/Layout';
import Text from '../UI/Text';
import {
  type GameMetrics,
  getGameMetricsFrom,
} from '../Utils/GDevelopServices/Analytics';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import PlaceholderError from '../UI/PlaceholderError';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import { buildChartData, daysShownForYear } from './GameAnalyticsEvaluator';
import {
  BounceRateChart,
  MeanPlayTimeChart,
  PlayersRepartitionPerDurationChart,
  PlayersDurationPerDayChart,
  SessionsChart,
  GameAdEarningsChart,
} from './GameAnalyticsCharts';
import MarketingPlanSingleDisplay from '../MarketingPlans/MarketingPlanSingleDisplay';
import {
  getGameAdEarnings,
  type GameAdEarning,
} from '../Utils/GDevelopServices/Usage';

const chartHeight = 300;

type Props = {|
  game: Game,
  recommendedMarketingPlan?: ?MarketingPlan,
  gameFeaturings?: ?(GameFeaturing[]),
  fetchGameFeaturings?: () => Promise<void>,
|};

export const GameAnalyticsPanel = ({
  game,
  recommendedMarketingPlan,
  gameFeaturings,
  fetchGameFeaturings,
}: Props) => {
  const { getAuthorizationHeader, profile, usages } = React.useContext(
    AuthenticatedUserContext
  );

  const [gameMetrics, setGameMetrics] = React.useState<?(GameMetrics[])>(null);
  const [
    gameAdEarnings,
    setGameAdEarnings,
  ] = React.useState<?(GameAdEarning[])>(null);
  const { yearChartData, monthChartData } = React.useMemo(
    () =>
      buildChartData({ gameMetrics, gameAdEarnings, usages, gameId: game.id }),
    [gameMetrics, gameAdEarnings, usages, game.id]
  );
  const [dataPeriod, setDataPeriod] = React.useState('month');
  const chartData = dataPeriod === 'year' ? yearChartData : monthChartData;

  const [error, setError] = React.useState<?Error>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  // TODO In some timezones, it might ask one less or extra day.
  const loadGameAnalytics = React.useCallback(
    async () => {
      if (!profile) return;

      const { id } = profile;

      setIsLoading(true);
      setError(null);

      const lastYearIsoDate = formatISO(subDays(new Date(), daysShownForYear), {
        representation: 'date',
      });
      const gameCreatioDateIsoDate = formatISO(new Date(game.createdAt), {
        representation: 'date',
      });
      const todayIsoDate = formatISO(new Date(), {
        representation: 'date',
      });

      try {
        const [gameRollingMetrics, gameAdEarnings] = await Promise.all([
          getGameMetricsFrom(
            getAuthorizationHeader,
            id,
            game.id,
            lastYearIsoDate
          ),
          getGameAdEarnings(getAuthorizationHeader, id, {
            gameId: game.id,
            startIsoDate: gameCreatioDateIsoDate,
            endIsoDate: todayIsoDate,
          }),
        ]);
        setGameMetrics(gameRollingMetrics);
        setGameAdEarnings(gameAdEarnings);
      } catch (err) {
        console.error(`Unable to load game rolling metrics:`, err);
        setError(err);
      }
      setIsLoading(false);
    },
    [getAuthorizationHeader, profile, game]
  );

  React.useEffect(
    () => {
      loadGameAnalytics();
    },
    [loadGameAnalytics]
  );

  if (isLoading) return <PlaceholderLoader />;

  const displaySuggestedMarketingPlan =
    recommendedMarketingPlan && gameFeaturings && fetchGameFeaturings;

  return (
    <I18n>
      {({ i18n }) =>
        error ? (
          <PlaceholderError
            onRetry={() => {
              loadGameAnalytics();
            }}
          >
            <Trans>There was an issue getting the game analytics.</Trans>{' '}
            <Trans>Verify your internet connection or try again later.</Trans>
          </PlaceholderError>
        ) : (
          <ColumnStackLayout expand>
            <Line noMargin justifyContent="flex-end">
              <SelectField
                value={dataPeriod}
                onChange={(e, i, period: string) => {
                  setDataPeriod(period);
                }}
                disableUnderline
              >
                <SelectOption key="month" value="month" label={t`Month`} />
                <SelectOption key="year" value="year" label={t`Year`} />
              </SelectField>
            </Line>
            <Grid container spacing={2}>
              <Grid
                item
                xs={12}
                sm={displaySuggestedMarketingPlan ? 4 : 12}
                md={displaySuggestedMarketingPlan ? 4 : 12}
              >
                <Column noMargin alignItems="center" expand>
                  <Text size="block-title" align="center">
                    <Trans>
                      USD {chartData.overview.totalEarningsInUSDs} in Ads
                      earnings
                    </Trans>
                  </Text>
                  <GameAdEarningsChart
                    chartData={chartData}
                    height={chartHeight}
                    i18n={i18n}
                  />
                </Column>
              </Grid>
              <Grid
                item
                xs={12}
                sm={displaySuggestedMarketingPlan ? 4 : 12}
                md={displaySuggestedMarketingPlan ? 4 : 12}
              >
                <Column noMargin alignItems="center" expand>
                  <Text size="block-title" align="center">
                    <Trans>{chartData.overview.playersCount} sessions</Trans>
                  </Text>
                  <SessionsChart
                    chartData={chartData}
                    height={chartHeight}
                    i18n={i18n}
                  />
                </Column>
              </Grid>

              {recommendedMarketingPlan &&
                gameFeaturings &&
                fetchGameFeaturings && (
                  <Grid item xs={12} sm={4} md={4}>
                    <MarketingPlanSingleDisplay
                      fetchGameFeaturings={fetchGameFeaturings}
                      gameFeaturings={gameFeaturings}
                      marketingPlan={recommendedMarketingPlan}
                      game={game}
                    />
                  </Grid>
                )}
              <Grid item xs={12} sm={6}>
                <Column noMargin alignItems="center" expand>
                  <Text size="block-title" align="center">
                    <Trans>
                      {Math.round(chartData.overview.bounceRatePercent)}% bounce
                      rate
                    </Trans>
                  </Text>
                  <BounceRateChart
                    chartData={chartData}
                    height={chartHeight}
                    i18n={i18n}
                  />
                </Column>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Column expand noMargin alignItems="center">
                  <Text size="block-title" align="center">
                    <Trans>
                      {Math.round(
                        chartData.overview.meanPlayedDurationInMinutes
                      )}{' '}
                      minutes per player
                    </Trans>
                  </Text>
                  <MeanPlayTimeChart
                    chartData={chartData}
                    height={chartHeight}
                    i18n={i18n}
                  />
                </Column>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Column expand noMargin alignItems="center">
                  <Text size="block-title" align="center">
                    <Trans>
                      {
                        chartData.overview.greaterDurationPlayerSurface
                          .playersCount
                      }{' '}
                      players with more than{' '}
                      {
                        chartData.overview.greaterDurationPlayerSurface
                          .durationInMinutes
                      }{' '}
                      minutes
                    </Trans>
                  </Text>
                  <PlayersRepartitionPerDurationChart
                    chartData={chartData}
                    height={chartHeight}
                    i18n={i18n}
                  />
                </Column>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Column expand noMargin alignItems="center">
                  <Text size="block-title" align="center">
                    <Trans>
                      {Math.round(
                        chartData.overview.nearestToMedianDuration
                          .playersPercent
                      )}
                      % of players with more than{' '}
                      {
                        chartData.overview.nearestToMedianDuration
                          .durationInMinutes
                      }{' '}
                      minutes
                    </Trans>
                  </Text>
                  <PlayersDurationPerDayChart
                    chartData={chartData}
                    height={chartHeight}
                    i18n={i18n}
                  />
                </Column>
              </Grid>
            </Grid>
          </ColumnStackLayout>
        )
      }
    </I18n>
  );
};
