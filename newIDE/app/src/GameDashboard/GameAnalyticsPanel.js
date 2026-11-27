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
  type GameVersionMetrics,
  type GameSourceMetrics,
  type GameMetricsBenchmarks,
  getGameMetricsFrom,
  getGameMetricsBenchmarks,
  listGameVersionMetricsFrom,
  listGameSourceMetricsFrom,
} from '../Utils/GDevelopServices/Analytics';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from '../UI/Table';
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
  defaultGameMetricsBenchmarks,
  getGameVersionAnalytics,
  getGameSourceAnalytics,
  type GameBreakdownAnalytics,
  type GameAnalyticsPeriod,
} from './GameAnalyticsEvaluator';
import {
  BenchmarkGlyph,
  BenchmarksLegend,
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
  tile: { padding: 16, flex: 1, boxSizing: 'border-box' },
  tilesColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    height: '100%',
  },
  tileBenchmarks: { marginTop: 12 },
  chartPaper: { padding: 16, height: '100%', boxSizing: 'border-box' },
  chartDescription: { marginTop: 2 },
  chartLegend: { marginTop: 16 },
  chartContent: { marginTop: 8 },
};

const getPeriodLabel = (i18n: I18nType, period: GameAnalyticsPeriod): string =>
  period === 'week'
    ? i18n._(t`the last 7 days`)
    : period === 'month'
    ? i18n._(t`the last 30 days`)
    : period === 'quarter'
    ? i18n._(t`the last 12 weeks`)
    : i18n._(t`the last 12 months`);

const formatDuration = (i18n: I18nType, durationInSeconds: number): string => {
  const roundedDuration = Math.round(durationInSeconds);
  const minutes = Math.floor(roundedDuration / 60);
  const seconds = roundedDuration % 60;
  return minutes > 0
    ? i18n._(t`${minutes}m ${seconds}s`)
    : i18n._(t`${seconds}s`);
};

const formatLoadingDuration = (
  i18n: I18nType,
  durationInSeconds: number
): string => {
  if (durationInSeconds >= 10) return formatDuration(i18n, durationInSeconds);
  const seconds = Math.round(durationInSeconds * 10) / 10;
  return i18n._(t`${seconds}s`);
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
  benchmarks,
  note,
}: {|
  title: React.Node,
  /** Null when there are too few players to show it. */
  value: number | null,
  formatValue: (value: number) => string,
  change: SummaryChange | null,
  caption?: React.Node,
  /** How other games do, to compare the value with. */
  benchmarks?: {| typical: React.Node, top: React.Node |},
  note?: React.Node,
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
      {benchmarks && (
        <div style={styles.tileBenchmarks}>
          <div>
            <Text noMargin size="body-small" color="secondary">
              <BenchmarkGlyph kind="typical" />
              <Trans>Average game:</Trans> <b>{benchmarks.typical}</b>
            </Text>
          </div>
          <div>
            <Text noMargin size="body-small" color="secondary">
              <BenchmarkGlyph kind="top" />
              <Trans>Best games:</Trans> <b>{benchmarks.top}</b>
            </Text>
          </div>
        </div>
      )}
      {note && (
        <div style={styles.tileBenchmarks}>
          <Text noMargin size="body-small" color="secondary">
            {note}
          </Text>
        </div>
      )}
    </Paper>
  );
};

const ChartBlock = ({
  title,
  description,
  legend,
  children,
}: {|
  title: React.Node,
  description?: React.Node,
  legend?: React.Node,
  children: React.Node,
|}) => (
  <Paper background="medium" style={styles.chartPaper}>
    <Text noMargin size="block-title">
      {title}
    </Text>
    {description && (
      <div style={styles.chartDescription}>
        <Text noMargin size="body-small" color="secondary">
          {description}
        </Text>
      </div>
    )}
    {legend && <div style={styles.chartLegend}>{legend}</div>}
    <div style={styles.chartContent}>{children}</div>
  </Paper>
);

const appSources = ['android-app', 'ios-app', 'desktop-app'];

const formatSource = (i18n: I18nType, source: string): string =>
  source === 'android-app'
    ? i18n._(t`Android app`)
    : source === 'ios-app'
    ? i18n._(t`iOS app`)
    : source === 'desktop-app'
    ? i18n._(t`Desktop app`)
    : source === 'unknown'
    ? i18n._(t`Unknown`)
    : source;

const BreakdownTable = ({
  i18n,
  nameTitle,
  breakdownAnalytics,
  formatName,
}: {|
  i18n: I18nType,
  nameTitle: React.Node,
  breakdownAnalytics: Array<GameBreakdownAnalytics>,
  formatName: string => string,
|}) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHeaderColumn>{nameTitle}</TableHeaderColumn>
        <TableHeaderColumn>
          <Trans>Players</Trans>
        </TableHeaderColumn>
        <TableHeaderColumn>
          <Trans>Left in the first minute</Trans>
        </TableHeaderColumn>
        <TableHeaderColumn>
          <Trans>Average play time</Trans>
        </TableHeaderColumn>
      </TableRow>
    </TableHeader>
    <TableBody>
      {breakdownAnalytics.map(
        ({
          name,
          playersCount,
          bounceRatePercent,
          playedDurationPerPlayerInSeconds,
        }) => (
          <TableRow key={name}>
            <TableRowColumn>{formatName(name)}</TableRowColumn>
            <TableRowColumn>{formatCount(playersCount)}</TableRowColumn>
            <TableRowColumn>
              {bounceRatePercent !== null
                ? `${Math.round(bounceRatePercent)}%`
                : '–'}
            </TableRowColumn>
            <TableRowColumn>
              {playedDurationPerPlayerInSeconds !== null
                ? formatDuration(i18n, playedDurationPerPlayerInSeconds)
                : '–'}
            </TableRowColumn>
          </TableRow>
        )
      )}
    </TableBody>
  </Table>
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
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  const [gameRollingMetrics, setGameMetrics] = React.useState<?(GameMetrics[])>(
    null
  );
  const [period, setPeriod] = React.useState<GameAnalyticsPeriod>('month');
  const [
    gameMetricsBenchmarks,
    setGameMetricsBenchmarks,
  ] = React.useState<GameMetricsBenchmarks>(defaultGameMetricsBenchmarks);
  React.useEffect(() => {
    getGameMetricsBenchmarks().then(setGameMetricsBenchmarks, error => {
      console.error('Unable to load the game metrics benchmarks:', error);
    });
  }, []);

  const gameAnalytics = React.useMemo(
    () =>
      getGameAnalytics(gameRollingMetrics, period, {
        gameFeaturings,
        builds,
        gameMetricsBenchmarks,
      }),
    [gameRollingMetrics, period, gameFeaturings, builds, gameMetricsBenchmarks]
  );

  const [gameVersionMetrics, setGameVersionMetrics] = React.useState<
    Array<GameVersionMetrics>
  >([]);
  const gameVersionAnalytics = React.useMemo(
    () => getGameVersionAnalytics(gameVersionMetrics, period),
    [gameVersionMetrics, period]
  );
  const [gameSourceMetrics, setGameSourceMetrics] = React.useState<
    Array<GameSourceMetrics>
  >([]);
  const gameSourceAnalytics = React.useMemo(
    () => getGameSourceAnalytics(gameSourceMetrics, period),
    [gameSourceMetrics, period]
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
      // The rest of the analytics is shown even without the versions and the sources.
      try {
        setGameSourceMetrics(
          await listGameSourceMetricsFrom(
            getAuthorizationHeader,
            id,
            game.id,
            lastYearIsoDate
          )
        );
        setGameVersionMetrics(
          await listGameVersionMetricsFrom(
            getAuthorizationHeader,
            id,
            game.id,
            lastYearIsoDate
          )
        );
      } catch (err) {
        console.error(`Unable to load game version or source metrics:`, err);
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
    loadingDurationPerSessionInSeconds,
    loadedSessionsPercent,
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
  const typicalBounceRatePercent =
    gameMetricsBenchmarks.bounceRatePercent.typical;
  const topBounceRatePercent = gameMetricsBenchmarks.bounceRatePercent.top;
  const typicalPlayedDurationInMinutes =
    gameMetricsBenchmarks.playedDurationPerPlayerInMinutes.typical;
  const topPlayedDurationInMinutes =
    gameMetricsBenchmarks.playedDurationPerPlayerInMinutes.top;
  const typicalD1RetentionPercent =
    gameMetricsBenchmarks.retentionPercents.typical[0];
  const topD1RetentionPercent = gameMetricsBenchmarks.retentionPercents.top[0];
  const goodLoadingDurationInSeconds =
    gameMetricsBenchmarks.webLoadingDurationInSeconds.good;
  const tooLongLoadingDurationInSeconds =
    gameMetricsBenchmarks.webLoadingDurationInSeconds.tooLong;

  const displaySuggestedMarketingPlan =
    recommendedMarketingPlan && gameFeaturings && fetchGameFeaturings;
  const isOnlyPlayedInApps =
    gameSourceAnalytics.length > 0 &&
    gameSourceAnalytics.every(({ name }) => appSources.includes(name));
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
            <Grid container spacing={1}>
              <Grid
                item
                xs={12}
                md={displaySuggestedMarketingPlan ? 6 : 9}
                lg={displaySuggestedMarketingPlan ? 6 : 10}
              >
                <ChartBlock
                  title={<Trans>Players</Trans>}
                  legend={
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
              <Grid item xs={12} md={3} lg={2}>
                <div style={styles.tilesColumn}>
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
                  <SummaryTile
                    title={<Trans>New players</Trans>}
                    value={newPlayersCount}
                    formatValue={formatCount}
                    change={getCountChange(
                      newPlayersCount,
                      previousSummary ? previousSummary.newPlayersCount : null
                    )}
                  />
                </div>
              </Grid>
              {recommendedMarketingPlan &&
                gameFeaturings &&
                fetchGameFeaturings && (
                  <Grid item xs={12} md={3} lg={4}>
                    <MarketingPlanSingleDisplay
                      fetchGameFeaturings={fetchGameFeaturings}
                      gameFeaturings={gameFeaturings}
                      marketingPlan={recommendedMarketingPlan}
                      game={game}
                    />
                  </Grid>
                )}
              <Grid item xs={12} md={3} lg={2}>
                <div style={styles.tilesColumn}>
                  <SummaryTile
                    title={<Trans>Came back the next day</Trans>}
                    value={
                      d1RetentionDay ? d1RetentionDay.retentionPercent : null
                    }
                    formatValue={formatPercent}
                    change={null}
                    caption={d1RetentionDay ? null : notEnoughPlayersCaption}
                    benchmarks={{
                      typical: `${typicalD1RetentionPercent}%`,
                      top: <Trans>over {topD1RetentionPercent}%</Trans>,
                    }}
                  />
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
                    benchmarks={{
                      typical: `${typicalBounceRatePercent}%`,
                      top: <Trans>under {topBounceRatePercent}%</Trans>,
                    }}
                  />
                </div>
              </Grid>
              <Grid item xs={12} md={9} lg={10}>
                <Grid container spacing={1} style={{ height: '100%' }}>
                  {retentionDays && (
                    <Grid item xs={12} sm={6}>
                      <ChartBlock
                        title={<Trans>Player retention</Trans>}
                        description={
                          <Trans>
                            Share of new players who played again 1 to 7 days
                            after their first day, over{' '}
                            {getPeriodLabel(i18n, period)}.
                          </Trans>
                        }
                        legend={<BenchmarksLegend />}
                      >
                        <RetentionChart
                          i18n={i18n}
                          benchmarks={gameMetricsBenchmarks}
                          retentionDays={retentionDays}
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
                            Share of players who left before 60 seconds. Lower
                            is better.
                          </Trans>
                        }
                        legend={<BenchmarksLegend />}
                      >
                        <BounceRateChart
                          i18n={i18n}
                          benchmarks={gameMetricsBenchmarks}
                          overTime={overTime}
                          height={chartHeight}
                        />
                      </ChartBlock>
                    </Grid>
                  )}
                </Grid>
              </Grid>
              <Grid item xs={12} md={9} lg={10}>
                <Grid container spacing={1} style={{ height: '100%' }}>
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
                        legend={<BenchmarksLegend />}
                      >
                        <PlayedDurationStepsChart
                          i18n={i18n}
                          benchmarks={gameMetricsBenchmarks}
                          playedDurationSteps={playedDurationSteps}
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
                          <Trans>
                            Time a player spends in the game in a day.
                          </Trans>
                        }
                        legend={<BenchmarksLegend />}
                      >
                        <PlayedDurationChart
                          i18n={i18n}
                          benchmarks={gameMetricsBenchmarks}
                          overTime={overTime}
                          height={chartHeight}
                        />
                      </ChartBlock>
                    </Grid>
                  )}
                </Grid>
              </Grid>
              <Grid item xs={12} md={3} lg={2}>
                <div style={styles.tilesColumn}>
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
                    benchmarks={{
                      typical: (
                        <Trans>{typicalPlayedDurationInMinutes} min</Trans>
                      ),
                      top: <Trans>over {topPlayedDurationInMinutes} min</Trans>,
                    }}
                  />
                  <SummaryTile
                    title={<Trans>Average web loading time</Trans>}
                    value={loadingDurationPerSessionInSeconds}
                    formatValue={value => formatLoadingDuration(i18n, value)}
                    change={null}
                    caption={
                      loadedSessionsPercent === null ? (
                        isOnlyPlayedInApps ? (
                          <Trans>
                            Not measured: the game is only played installed on a
                            device, where its files already are
                          </Trans>
                        ) : (
                          <Trans>Export the game again to measure it</Trans>
                        )
                      ) : (
                        <Trans>
                          {Math.round(100 - loadedSessionsPercent)}% left before
                          the loading finished
                        </Trans>
                      )
                    }
                    note={
                      <Trans>
                        Aim for{' '}
                        <b
                          style={{
                            color: gdevelopTheme.statusIndicator.success,
                          }}
                        >
                          about {goodLoadingDurationInSeconds} seconds
                        </b>{' '}
                        on the web.{' '}
                        <b
                          style={{ color: gdevelopTheme.statusIndicator.error }}
                        >
                          Past {tooLongLoadingDurationInSeconds} seconds
                        </b>
                        , most players leave.
                      </Trans>
                    }
                  />
                </div>
              </Grid>
              {playerPlatforms && (
                <Grid item xs={12}>
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
              {gameSourceAnalytics.length > 0 && (
                <Grid item xs={12} sm={6}>
                  <ChartBlock
                    title={<Trans>Where players play</Trans>}
                    description={
                      <Trans>
                        The apps and websites with the most players. A player is
                        counted where they first played in a day.
                      </Trans>
                    }
                  >
                    <BreakdownTable
                      i18n={i18n}
                      nameTitle={<Trans>Where</Trans>}
                      breakdownAnalytics={gameSourceAnalytics}
                      formatName={source => formatSource(i18n, source)}
                    />
                  </ChartBlock>
                </Grid>
              )}
              {gameVersionAnalytics.length > 1 && (
                <Grid item xs={12} sm={6}>
                  <ChartBlock
                    title={<Trans>Versions</Trans>}
                    description={
                      <Trans>
                        Players of each version of the game, the latest version
                        first. A player is counted with the first version they
                        played in a day.
                      </Trans>
                    }
                  >
                    <BreakdownTable
                      i18n={i18n}
                      nameTitle={<Trans>Version</Trans>}
                      breakdownAnalytics={gameVersionAnalytics}
                      formatName={version => version || i18n._(t`No version`)}
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
