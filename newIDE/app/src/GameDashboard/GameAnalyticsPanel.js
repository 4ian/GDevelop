// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import Grid from '@material-ui/core/Grid';
import { formatISO, subDays } from 'date-fns';
import { Line } from '../UI/Grid';
import type { I18n as I18nType } from '@lingui/core';
import {
  type Game,
  type GameFeaturing,
  type MarketingPlan,
} from '../Utils/GDevelopServices/Game';
import { ColumnStackLayout } from '../UI/Layout';
import Text from '../UI/Text';
import Paper from '../UI/Paper';
import {
  type GameMetrics,
  getGameMetricsFrom,
} from '../Utils/GDevelopServices/Analytics';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import PlaceholderError from '../UI/PlaceholderError';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import EmptyMessage from '../UI/EmptyMessage';
import {
  getGameAnalytics,
  daysShownForYear,
  minPlayersCountForRates,
  type GameAnalyticsPeriod,
} from './GameAnalyticsEvaluator';
import {
  BounceRateChart,
  formatPercent,
  PlayedDurationChart,
  PlayedDurationStepsChart,
  PlayerDevicesChart,
  PlayersChart,
  PlayersChartLegend,
  RetentionChart,
} from './GameAnalyticsCharts';
import GameAnalyticsAdvice from './GameAnalyticsAdvice';
import { type Build } from '../Utils/GDevelopServices/Build';
import MarketingPlanSingleDisplay from '../MarketingPlans/MarketingPlanSingleDisplay';

const chartHeight = 260;

const styles = {
  tile: { padding: 16, height: '100%', boxSizing: 'border-box' },
  chartPaper: { padding: 16, height: '100%', boxSizing: 'border-box' },
};

const formatDuration = (i18n: I18nType, durationInSeconds: number): string => {
  const roundedDuration = Math.round(durationInSeconds);
  const minutes = Math.floor(roundedDuration / 60);
  const seconds = roundedDuration % 60;
  return minutes > 0
    ? i18n._(t`${minutes}m ${seconds}s`)
    : i18n._(t`${seconds}s`);
};

const formatCount = (count: number): string =>
  Math.round(count).toLocaleString();

type SummaryChange = {|
  text: string,
  /** Null when nothing changed. */
  isGood: boolean | null,
|};

const getChangeArrow = (change: number): string =>
  change > 0 ? '↑' : change < 0 ? '↓' : '=';

const getCountChange = (
  count: number,
  previousCount: ?number
): SummaryChange | null => {
  if (!previousCount) return null;
  const changePercent = Math.round(
    (100 * (count - previousCount)) / previousCount
  );
  return {
    text: `${getChangeArrow(changePercent)} ${Math.abs(changePercent)}%`,
    isGood: changePercent === 0 ? null : changePercent > 0,
  };
};

const numberAnimationDurationInMs = 600;

/**
 * @returns the value, going progressively from the previous one each time it changes.
 */
const useAnimatedNumber = (value: number | null): number | null => {
  const [displayedValue, setDisplayedValue] = React.useState<number | null>(
    value !== null ? 0 : null
  );
  const displayedValueRef = React.useRef<number | null>(displayedValue);

  React.useEffect(
    () => {
      const startValue = displayedValueRef.current;
      if (value === null || startValue === null) {
        displayedValueRef.current = value;
        setDisplayedValue(value);
        return;
      }

      const startTime = performance.now();
      let animationFrameId: AnimationFrameID;
      const step = (time: number) => {
        const progress = Math.min(
          1,
          (time - startTime) / numberAnimationDurationInMs
        );
        // Slows down when getting close to the value.
        const newDisplayedValue =
          startValue + (value - startValue) * (1 - Math.pow(1 - progress, 3));
        displayedValueRef.current = newDisplayedValue;
        setDisplayedValue(newDisplayedValue);
        if (progress < 1) animationFrameId = requestAnimationFrame(step);
      };
      animationFrameId = requestAnimationFrame(step);
      return () => cancelAnimationFrame(animationFrameId);
    },
    [value]
  );

  return displayedValue;
};

const SummaryTile = ({
  title,
  value,
  formatValue,
  change,
  caption,
}: {|
  title: React.Node,
  /** Null when there are too few players to show it. */
  value: number | null,
  formatValue: (value: number) => string,
  change: SummaryChange | null,
  caption?: React.Node,
|}) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const animatedValue = useAnimatedNumber(value);
  return (
    <Paper background="medium" style={styles.tile}>
      <ColumnStackLayout noMargin>
        <Text noMargin size="body-small" color="secondary">
          {title}
        </Text>
        <Text noMargin size="title">
          {animatedValue !== null ? formatValue(animatedValue) : '–'}
        </Text>
        {change ? (
          <Text noMargin size="body-small" color="secondary">
            <span
              style={{
                color:
                  change.isGood === null
                    ? undefined
                    : change.isGood
                    ? gdevelopTheme.statusIndicator.success
                    : gdevelopTheme.statusIndicator.error,
                fontWeight: 'bold',
              }}
            >
              {change.text}
            </span>{' '}
            <Trans>vs previous period</Trans>
          </Text>
        ) : (
          <Text noMargin size="body-small" color="secondary">
            {caption || '\u00a0'}
          </Text>
        )}
      </ColumnStackLayout>
    </Paper>
  );
};

const ChartBlock = ({
  title,
  description,
  children,
}: {|
  title: React.Node,
  description: React.Node,
  children: React.Node,
|}) => (
  <Paper background="medium" style={styles.chartPaper}>
    <ColumnStackLayout noMargin>
      <Text noMargin size="block-title">
        {title}
      </Text>
      <Text noMargin size="body-small" color="secondary">
        {description}
      </Text>
      {children}
    </ColumnStackLayout>
  </Paper>
);

type Props = {|
  game: Game,
  recommendedMarketingPlan?: ?MarketingPlan,
  gameFeaturings?: ?(GameFeaturing[]),
  fetchGameFeaturings?: () => Promise<void>,
  builds?: ?Array<Build>,
|};

export const GameAnalyticsPanel = ({
  game,
  recommendedMarketingPlan,
  gameFeaturings,
  fetchGameFeaturings,
  builds,
}: Props): React.Node => {
  const { getAuthorizationHeader, profile } = React.useContext(
    AuthenticatedUserContext
  );

  const [gameRollingMetrics, setGameMetrics] = React.useState<?(GameMetrics[])>(
    null
  );
  const [period, setPeriod] = React.useState<GameAnalyticsPeriod>('month');
  const gameAnalytics = React.useMemo(
    () =>
      getGameAnalytics(gameRollingMetrics, period, { gameFeaturings, builds }),
    [gameRollingMetrics, period, gameFeaturings, builds]
  );

  const [gameRollingMetricsError, setGameMetricsError] = React.useState<?Error>(
    null
  );
  const [isGameMetricsLoading, setIsGameMetricsLoading] = React.useState(false);

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
      loadGameMetrics();
    },
    [loadGameMetrics]
  );

  if (isGameMetricsLoading) return <PlaceholderLoader />;

  if (gameRollingMetricsError)
    return (
      <PlaceholderError
        onRetry={() => {
          loadGameMetrics();
        }}
      >
        <Trans>There was an issue getting the game analytics.</Trans>{' '}
        <Trans>Verify your internet connection or try again later.</Trans>
      </PlaceholderError>
    );

  const {
    summary,
    previousSummary,
    overTime,
    playedDurationSteps,
    retentionDays,
    playerPlatforms,
  } = gameAnalytics;
  const {
    playersCount,
    newPlayersCount,
    sessionsCount,
    bounceRatePercent,
    playedDurationPerPlayerInSeconds,
  } = summary;
  const previousBounceRatePercent = previousSummary
    ? previousSummary.bounceRatePercent
    : null;
  const previousPlayedDurationPerPlayerInSeconds = previousSummary
    ? previousSummary.playedDurationPerPlayerInSeconds
    : null;
  const bounceRateChangeInPoints =
    bounceRatePercent !== null && previousBounceRatePercent !== null
      ? Math.round(bounceRatePercent) - Math.round(previousBounceRatePercent)
      : null;
  const playedDurationChangeInSeconds =
    playedDurationPerPlayerInSeconds !== null &&
    previousPlayedDurationPerPlayerInSeconds !== null
      ? Math.round(playedDurationPerPlayerInSeconds) -
        Math.round(previousPlayedDurationPerPlayerInSeconds)
      : null;
  const canShowRatesOverTime = !!playedDurationSteps;
  const d1RetentionDay = retentionDays ? retentionDays[0] : null;

  const displaySuggestedMarketingPlan =
    recommendedMarketingPlan && gameFeaturings && fetchGameFeaturings;
  const notEnoughPlayersCaption = (
    <Trans>Shown from {minPlayersCountForRates} players</Trans>
  );

  return (
    <I18n>
      {({ i18n }) => (
        <ColumnStackLayout expand noMargin>
          <Line noMargin justifyContent="flex-end">
            <SelectField
              value={period}
              onChange={(e, i, newPeriod: string) => {
                // $FlowFixMe[incompatible-type] - the values are the ones of the options.
                setPeriod(newPeriod);
              }}
              disableUnderline
            >
              <SelectOption value="week" label={t`Last 7 days`} />
              <SelectOption value="month" label={t`Last 30 days`} />
              <SelectOption value="quarter" label={t`Last 12 weeks`} />
              <SelectOption value="year" label={t`Last 12 months`} />
            </SelectField>
          </Line>
          <GameAnalyticsAdvice
            i18n={i18n}
            game={game}
            gameAnalytics={gameAnalytics}
          />
          {playersCount === 0 ? (
            <EmptyMessage>
              <Trans>
                No players during this period. Share your game to get players
                and see how they play it.
              </Trans>
            </EmptyMessage>
          ) : (
            <Grid container spacing={2}>
              <Grid
                item
                xs={12}
                sm={displaySuggestedMarketingPlan ? 7 : 12}
                md={displaySuggestedMarketingPlan ? 8 : 12}
              >
                <ChartBlock
                  title={<Trans>Players</Trans>}
                  description={
                    <PlayersChartLegend i18n={i18n} overTime={overTime} />
                  }
                >
                  <PlayersChart
                    i18n={i18n}
                    overTime={overTime}
                    height={chartHeight}
                  />
                </ChartBlock>
              </Grid>
              {recommendedMarketingPlan &&
                gameFeaturings &&
                fetchGameFeaturings && (
                  <Grid item xs={12} sm={5} md={4}>
                    <MarketingPlanSingleDisplay
                      fetchGameFeaturings={fetchGameFeaturings}
                      gameFeaturings={gameFeaturings}
                      marketingPlan={recommendedMarketingPlan}
                      game={game}
                    />
                  </Grid>
                )}
              <Grid item xs={12}>
                <Grid container spacing={1}>
                  <Grid item xs={6} md={3}>
                    <SummaryTile
                      title={<Trans>Players</Trans>}
                      value={playersCount}
                      formatValue={formatCount}
                      change={getCountChange(
                        playersCount,
                        previousSummary ? previousSummary.playersCount : null
                      )}
                      caption={<Trans>{sessionsCount} sessions</Trans>}
                    />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <SummaryTile
                      title={<Trans>New players</Trans>}
                      value={newPlayersCount}
                      formatValue={formatCount}
                      change={getCountChange(
                        newPlayersCount,
                        previousSummary ? previousSummary.newPlayersCount : null
                      )}
                    />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <SummaryTile
                      title={<Trans>Left in the first minute</Trans>}
                      value={bounceRatePercent}
                      formatValue={value => `${Math.round(value)}%`}
                      change={
                        bounceRateChangeInPoints !== null
                          ? {
                              text: `${getChangeArrow(
                                bounceRateChangeInPoints
                              )} ${Math.abs(bounceRateChangeInPoints)} pts`,
                              isGood:
                                bounceRateChangeInPoints === 0
                                  ? null
                                  : bounceRateChangeInPoints < 0,
                            }
                          : null
                      }
                      caption={
                        bounceRatePercent === null
                          ? notEnoughPlayersCaption
                          : null
                      }
                    />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <SummaryTile
                      title={<Trans>Average play time</Trans>}
                      value={playedDurationPerPlayerInSeconds}
                      formatValue={value => formatDuration(i18n, value)}
                      change={
                        playedDurationChangeInSeconds !== null
                          ? {
                              text: `${getChangeArrow(
                                playedDurationChangeInSeconds
                              )} ${formatDuration(
                                i18n,
                                Math.abs(playedDurationChangeInSeconds)
                              )}`,
                              isGood:
                                playedDurationChangeInSeconds === 0
                                  ? null
                                  : playedDurationChangeInSeconds > 0,
                            }
                          : null
                      }
                      caption={
                        playedDurationPerPlayerInSeconds === null
                          ? notEnoughPlayersCaption
                          : null
                      }
                    />
                  </Grid>
                </Grid>
              </Grid>
              {retentionDays && d1RetentionDay && (
                <Grid item xs={12} sm={6}>
                  <ChartBlock
                    title={
                      <Trans>
                        {formatPercent(d1RetentionDay.retentionPercent)} of new
                        players came back the next day
                      </Trans>
                    }
                    description={
                      <Trans>
                        Share of new players who played again 1 to 7 days after
                        their first day.
                      </Trans>
                    }
                  >
                    <RetentionChart
                      i18n={i18n}
                      retentionDays={retentionDays}
                      height={chartHeight}
                    />
                  </ChartBlock>
                </Grid>
              )}
              {playedDurationSteps && (
                <Grid item xs={12} sm={6}>
                  <ChartBlock
                    title={<Trans>How long players stay</Trans>}
                    description={
                      <Trans>
                        Share of players still playing after each duration,
                        loading screens included.
                      </Trans>
                    }
                  >
                    <PlayedDurationStepsChart
                      i18n={i18n}
                      playedDurationSteps={playedDurationSteps}
                      height={chartHeight}
                    />
                  </ChartBlock>
                </Grid>
              )}
              {canShowRatesOverTime && (
                <Grid item xs={12} sm={6}>
                  <ChartBlock
                    title={<Trans>Left in the first minute</Trans>}
                    description={
                      <Trans>
                        Share of players who left before 60 seconds. Lower is
                        better.
                      </Trans>
                    }
                  >
                    <BounceRateChart
                      i18n={i18n}
                      overTime={overTime}
                      height={chartHeight}
                    />
                  </ChartBlock>
                </Grid>
              )}
              {canShowRatesOverTime && (
                <Grid item xs={12} sm={6}>
                  <ChartBlock
                    title={<Trans>Average play time</Trans>}
                    description={
                      <Trans>Time a player spends in the game in a day.</Trans>
                    }
                  >
                    <PlayedDurationChart
                      i18n={i18n}
                      overTime={overTime}
                      height={chartHeight}
                    />
                  </ChartBlock>
                </Grid>
              )}
              {playerPlatforms && (
                <Grid item xs={12} sm={6}>
                  <ChartBlock
                    title={<Trans>Devices</Trans>}
                    description={
                      <Trans>
                        Share of players on a device with a touch screen: mostly
                        phones and tablets.
                      </Trans>
                    }
                  >
                    <PlayerDevicesChart
                      i18n={i18n}
                      playerPlatforms={playerPlatforms}
                      height={chartHeight}
                    />
                  </ChartBlock>
                </Grid>
              )}
              {!playedDurationSteps && (
                <Grid item xs={12}>
                  <EmptyMessage>
                    <Trans>
                      Play time and retention are shown once the game has{' '}
                      {minPlayersCountForRates} players in the period.
                    </Trans>
                  </EmptyMessage>
                </Grid>
              )}
            </Grid>
          )}
        </ColumnStackLayout>
      )}
    </I18n>
  );
};
