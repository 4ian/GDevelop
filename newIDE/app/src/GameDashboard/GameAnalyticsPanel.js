// @flow
import { Trans, t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import { formatISO, subDays } from 'date-fns';
import { Column, Line } from '../UI/Grid';
import { type Game } from '../Utils/GDevelopServices/Game';
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
import AlertMessage from '../UI/AlertMessage';
import { ResponsiveLineStackLayout } from '../UI/Layout';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import { buildChartData, daysShownForYear } from './GameAnalyticsEvaluator';
import {
  BounceRateChart,
  MeanPlayTimeChart,
  PlayersCountPerDurationChart,
  PlayersRepartitionPerDurationChart,
  SessionsChart,
} from './GameAnalyticsCharts';

const chartHeight = 300;

type Props = {|
  game: Game,
  gameMetrics?: ?(GameMetrics[]),
|};

export const GameAnalyticsPanel = ({ game, gameMetrics }: Props) => {
  const { getAuthorizationHeader, profile } = React.useContext(
    AuthenticatedUserContext
  );

  const [gameRollingMetrics, setGameMetrics] = React.useState<?(GameMetrics[])>(
    gameMetrics
  );
  const { yearChartData, monthChartData } = React.useMemo(
    () => buildChartData(gameRollingMetrics),
    [gameRollingMetrics]
  );
  const [dataPeriod, setDataPeriod] = React.useState('month');
  const chartData = dataPeriod === 'year' ? yearChartData : monthChartData;

  const [gameRollingMetricsError, setGameMetricsError] = React.useState<?Error>(
    null
  );
  const [isGameMetricsLoading, setIsGameMetricsLoading] = React.useState(false);

  // TODO In some timezones, it might ask one less or extra day.
  const lastYearIsoDate = formatISO(subDays(new Date(), daysShownForYear), {
    representation: 'date',
  });
  const loadGameMetrics = React.useCallback(
    async () => {
      if (!profile) return;

      const { id } = profile;

      setIsGameMetricsLoading(true);
      setGameMetricsError(null);
      try {
        const gameRollingMetrics = await getGameMetricsFrom(
          getAuthorizationHeader,
          id,
          game.id,
          lastYearIsoDate
        );
        setGameMetrics(gameRollingMetrics);
      } catch (err) {
        console.error(`Unable to load game rolling metrics:`, err);
        setGameMetricsError(err);
      }
      setIsGameMetricsLoading(false);
    },
    [getAuthorizationHeader, profile, game, lastYearIsoDate]
  );

  React.useEffect(
    () => {
      if (!!gameMetrics) {
        // Do not load metrics if provided by parent.
        return;
      }
      loadGameMetrics();
    },
    [loadGameMetrics, gameMetrics]
  );

  if (isGameMetricsLoading) return <PlaceholderLoader />;

  return (
    <I18n>
      {({ i18n }) =>
        gameRollingMetricsError ? (
          <PlaceholderError
            onRetry={() => {
              loadGameMetrics();
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
            {!gameRollingMetrics || gameRollingMetrics.length === 0 ? (
              <Line noMargin>
                <AlertMessage kind="warning">
                  <Trans>
                    There were no players or stored metrics for this period. Be
                    sure to publish your game and get players to try it to see
                    the collected anonymous analytics.
                  </Trans>
                </AlertMessage>
              </Line>
            ) : null}
            <ResponsiveLineStackLayout expand noMargin justifyContent="center">
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
            </ResponsiveLineStackLayout>
            <ResponsiveLineStackLayout expand noMargin justifyContent="center">
              <Column expand noMargin alignItems="center">
                <Text size="block-title" align="center">
                  <Trans>
                    {Math.round(chartData.overview.meanPlayedDurationInMinutes)}{' '}
                    minutes per player
                  </Trans>
                </Text>
                <MeanPlayTimeChart
                  chartData={chartData}
                  height={chartHeight}
                  i18n={i18n}
                />
              </Column>
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
                <PlayersCountPerDurationChart
                  chartData={chartData}
                  height={chartHeight}
                  i18n={i18n}
                />
              </Column>
            </ResponsiveLineStackLayout>
            <ResponsiveLineStackLayout expand noMargin justifyContent="center">
              <Column expand noMargin alignItems="center">
                <Text size="block-title" align="center">
                  <Trans>
                    {Math.round(
                      chartData.overview.nearestToMedianDuration.playersPercent
                    )}
                    % of players with more than{' '}
                    {
                      chartData.overview.nearestToMedianDuration
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
            </ResponsiveLineStackLayout>
          </ColumnStackLayout>
        )
      }
    </I18n>
  );
};
