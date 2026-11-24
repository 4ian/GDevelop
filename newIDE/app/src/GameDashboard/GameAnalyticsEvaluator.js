// @flow
import { type GameMetrics } from '../Utils/GDevelopServices/Analytics';
import { type GameFeaturing } from '../Utils/GDevelopServices/Game';
import { type Build } from '../Utils/GDevelopServices/Build';

export type GameAnalyticsPeriod = 'week' | 'month' | 'quarter' | 'year';

export type GameAnalyticsSummary = {|
  /** Sum of the players of each day: a player coming 2 days is counted twice. */
  playersCount: number,
  newPlayersCount: number,
  returningPlayersCount: number,
  sessionsCount: number,
  /** Null when there are too few players for the rate to mean something. */
  bounceRatePercent: number | null,
  /** Null when there are too few players for the mean to mean something. */
  playedDurationPerPlayerInSeconds: number | null,
|};

export type GameAnalyticsOverTimePoint = {|
  label: string,
  /** The first and last day when the point covers several days. */
  fullLabel: string,
  playersCount: number,
  newPlayersCount: number,
  returningPlayersCount: number,
  bounceRatePercent: number,
  playedDurationPerPlayerInMinutes: number,
  hasMarketingBoost: boolean,
  buildsCount: number,
|};

export type GameAnalyticsPlayedDurationStep = {|
  durationInMinutes: number,
  playersPercent: number,
|};

export type GameAnalyticsRetentionDay = {|
  /** Number of days after the first day a player played. */
  dayNumber: number,
  retentionPercent: number,
|};

export type GameAnalyticsPlayerPlatforms = {|
  /** Mostly phones and tablets. */
  touchPlayersPercent: number,
|};

export type GameAnalyticsInsight =
  | 'fewPlayers'
  | 'highBounce'
  | 'lowRetention'
  | 'readyToGrow';

export type GameAnalytics = {|
  summary: GameAnalyticsSummary,
  /** Null when the previous period is not loaded or had no players. */
  previousSummary: GameAnalyticsSummary | null,
  overTime: Array<GameAnalyticsOverTimePoint>,
  /** Null when there are too few players. */
  playedDurationSteps: Array<GameAnalyticsPlayedDurationStep> | null,
  /** Null when there are too few new players or when retention is not available. */
  retentionDays: Array<GameAnalyticsRetentionDay> | null,
  /** Null when no day of the period has these numbers. */
  playerPlatforms: GameAnalyticsPlayerPlatforms | null,
  insight: GameAnalyticsInsight,
|};

/** The backend refuses to return more than 370 days. */
export const daysShownForYear = 364;

/** Below this number of players, a single player changes the rates too much. */
export const minPlayersCountForRates = 20;

// Same thresholds as the weekly email about the game metrics, so that both give the same advice:
// a quarter of the games with enough players lose more than 35% of players in the first minute,
// and a quarter of them get more than 4% of new players back the next day.
const highBounceRatePercent = 35;
const lowD1RetentionPercent = 4;

const playedDurationsInMinutes = [1, 3, 5, 10, 15];

const periodSettings: {
  [GameAnalyticsPeriod]: {|
    pointsCount: number,
    daysCountPerPoint: number,
    canCompareWithPreviousPeriod: boolean,
  |},
} = {
  week: {
    pointsCount: 7,
    daysCountPerPoint: 1,
    canCompareWithPreviousPeriod: true,
  },
  month: {
    pointsCount: 30,
    daysCountPerPoint: 1,
    canCompareWithPreviousPeriod: true,
  },
  quarter: {
    pointsCount: 12,
    daysCountPerPoint: 7,
    canCompareWithPreviousPeriod: true,
  },
  // The previous year is not loaded.
  year: {
    pointsCount: 52,
    daysCountPerPoint: 7,
    canCompareWithPreviousPeriod: false,
  },
};

const oneDayInMs = 24 * 60 * 60 * 1000;

// The backend counts players per UTC day, so all days are handled as UTC days.
const getIsoDay = (timestamp: number): string =>
  new Date(timestamp).toISOString().substring(0, 10);

const getDayTimestamp = (isoDay: string): number =>
  Date.parse(`${isoDay}T00:00:00Z`);

const formatDay = (isoDay: string): string =>
  new Date(getDayTimestamp(isoDay)).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });

/**
 * @returns the given number of days, oldest first, ending the given number of days before today.
 */
const getIsoDays = (
  todayTimestamp: number,
  daysCount: number,
  daysCountBeforeToday: number
): Array<string> => {
  const isoDays = [];
  for (let index = daysCount - 1; index >= 0; index--) {
    isoDays.push(
      getIsoDay(todayTimestamp - (daysCountBeforeToday + index) * oneDayInMs)
    );
  }
  return isoDays;
};

type DaysMetrics = {|
  playersCount: number,
  newPlayersCount: number,
  sessionsCount: number,
  /** Players of the days having played durations (they are missing before 2022-06-15). */
  playersWithDurationCount: number,
  playedDurationInSeconds: number,
  playersBelowDurationCounts: Array<number>,
  /** Players of the days having the numbers of players per platform. */
  playersWithPlatformsCount: number,
  touchPlayersCount: number,
|};

const sumDaysMetrics = (
  gameMetricsByIsoDay: { [string]: GameMetrics },
  isoDays: Array<string>
): DaysMetrics => {
  const daysMetrics = {
    playersCount: 0,
    newPlayersCount: 0,
    sessionsCount: 0,
    playersWithDurationCount: 0,
    playedDurationInSeconds: 0,
    playersBelowDurationCounts: playedDurationsInMinutes.map(() => 0),
    playersWithPlatformsCount: 0,
    touchPlayersCount: 0,
  };
  isoDays.forEach(isoDay => {
    const gameMetrics = gameMetricsByIsoDay[isoDay];
    if (!gameMetrics) return;
    const { sessions, players } = gameMetrics;
    if (sessions) daysMetrics.sessionsCount += sessions.d0Sessions;
    if (!players) return;

    daysMetrics.playersCount += players.d0Players;
    daysMetrics.newPlayersCount += players.d0NewPlayers;

    const { platforms } = gameMetrics;
    if (platforms && platforms.d0TouchPlayers != null) {
      daysMetrics.playersWithPlatformsCount += players.d0Players;
      daysMetrics.touchPlayersCount += platforms.d0TouchPlayers;
    }

    const playersBelowDurationCounts = [
      players.d0PlayersBelow60s,
      players.d0PlayersBelow180s,
      players.d0PlayersBelow300s,
      players.d0PlayersBelow600s,
      players.d0PlayersBelow900s,
    ];
    const playedDurationInSeconds = sessions
      ? sessions.d0SessionsDurationTotal
      : null;
    if (
      playedDurationInSeconds == null ||
      playersBelowDurationCounts.some(count => count == null)
    )
      return;

    daysMetrics.playersWithDurationCount += players.d0Players;
    daysMetrics.playedDurationInSeconds += playedDurationInSeconds;
    playersBelowDurationCounts.forEach((count, index) => {
      daysMetrics.playersBelowDurationCounts[index] += count || 0;
    });
  });
  return daysMetrics;
};

const getBounceRatePercent = (
  daysMetrics: DaysMetrics,
  minPlayersCount: number
): number | null =>
  daysMetrics.playersWithDurationCount >= minPlayersCount
    ? (100 * daysMetrics.playersBelowDurationCounts[0]) /
      daysMetrics.playersWithDurationCount
    : null;

const getPlayedDurationPerPlayerInSeconds = (
  daysMetrics: DaysMetrics,
  minPlayersCount: number
): number | null =>
  daysMetrics.playersWithDurationCount >= minPlayersCount
    ? daysMetrics.playedDurationInSeconds / daysMetrics.playersWithDurationCount
    : null;

const getSummary = (
  daysMetrics: DaysMetrics,
  minPlayersCountForRates: number
): GameAnalyticsSummary => ({
  playersCount: daysMetrics.playersCount,
  newPlayersCount: daysMetrics.newPlayersCount,
  returningPlayersCount: Math.max(
    0,
    daysMetrics.playersCount - daysMetrics.newPlayersCount
  ),
  sessionsCount: daysMetrics.sessionsCount,
  bounceRatePercent: getBounceRatePercent(daysMetrics, minPlayersCountForRates),
  playedDurationPerPlayerInSeconds: getPlayedDurationPerPlayerInSeconds(
    daysMetrics,
    minPlayersCountForRates
  ),
});

const getPlayedDurationSteps = (
  daysMetrics: DaysMetrics
): Array<GameAnalyticsPlayedDurationStep> | null => {
  const { playersWithDurationCount, playersBelowDurationCounts } = daysMetrics;
  if (playersWithDurationCount < minPlayersCountForRates) return null;

  return [
    { durationInMinutes: 0, playersPercent: 100 },
    ...playedDurationsInMinutes.map((durationInMinutes, index) => ({
      durationInMinutes,
      playersPercent:
        (100 * (playersWithDurationCount - playersBelowDurationCounts[index])) /
        playersWithDurationCount,
    })),
  ];
};

const retentionDaysCount = 7;

/**
 * The players retained on a day were new players some days earlier: the retention
 * of the period compares them to the new players of these earlier days.
 */
const getRetentionDays = (
  gameMetricsByIsoDay: { [string]: GameMetrics },
  isoDays: Array<string>
): Array<GameAnalyticsRetentionDay> | null => {
  const retentionDays = [];
  for (let dayNumber = 1; dayNumber <= retentionDaysCount; dayNumber++) {
    let retainedPlayersCount = 0;
    let cohortPlayersCount = 0;
    let hasRetention = false;
    isoDays.forEach(isoDay => {
      const gameMetrics = gameMetricsByIsoDay[isoDay];
      const cohortGameMetrics =
        gameMetricsByIsoDay[
          getIsoDay(getDayTimestamp(isoDay) - dayNumber * oneDayInMs)
        ];
      if (cohortGameMetrics && cohortGameMetrics.players)
        cohortPlayersCount += cohortGameMetrics.players.d0NewPlayers;
      if (gameMetrics && gameMetrics.retention) {
        const { retention } = gameMetrics;
        hasRetention = true;
        retainedPlayersCount +=
          [
            retention.d1RetainedPlayers,
            retention.d2RetainedPlayers,
            retention.d3RetainedPlayers,
            retention.d4RetainedPlayers,
            retention.d5RetainedPlayers,
            retention.d6RetainedPlayers,
            retention.d7RetainedPlayers,
          ][dayNumber - 1] || 0;
      }
    });
    // Later days are not shown either: they would leave holes in the chart.
    if (!hasRetention || cohortPlayersCount < minPlayersCountForRates) break;

    retentionDays.push({
      dayNumber,
      retentionPercent: Math.min(
        100,
        (100 * retainedPlayersCount) / cohortPlayersCount
      ),
    });
  }
  return retentionDays.length > 0 ? retentionDays : null;
};

const getPlayerPlatforms = (
  daysMetrics: DaysMetrics
): GameAnalyticsPlayerPlatforms | null => {
  const { playersWithPlatformsCount } = daysMetrics;
  if (playersWithPlatformsCount === 0) return null;

  return {
    touchPlayersPercent:
      (100 * daysMetrics.touchPlayersCount) / playersWithPlatformsCount,
  };
};

const getInsight = (
  summary: GameAnalyticsSummary,
  retentionDays: Array<GameAnalyticsRetentionDay> | null
): GameAnalyticsInsight => {
  if (summary.playersCount < minPlayersCountForRates) return 'fewPlayers';
  if (
    summary.bounceRatePercent !== null &&
    summary.bounceRatePercent >= highBounceRatePercent
  )
    return 'highBounce';
  if (
    retentionDays &&
    retentionDays[0].retentionPercent < lowD1RetentionPercent
  )
    return 'lowRetention';
  return 'readyToGrow';
};

const isIsoDayInMarketingBoost = (
  isoDay: string,
  gameFeaturings: Array<GameFeaturing>
): boolean =>
  gameFeaturings.some(
    gameFeaturing =>
      getIsoDay(gameFeaturing.createdAt * 1000) <= isoDay &&
      isoDay <= getIsoDay(gameFeaturing.expiresAt * 1000)
  );

export const getGameAnalytics = (
  gameMetricsArray: ?Array<GameMetrics>,
  period: GameAnalyticsPeriod,
  {
    gameFeaturings,
    builds,
    todayDate,
  }: {|
    gameFeaturings?: ?Array<GameFeaturing>,
    builds?: ?Array<Build>,
    todayDate?: Date,
  |} = {}
): GameAnalytics => {
  const completeBuildIsoDays = (builds || [])
    .filter(build => build.status === 'complete')
    .map(build => getIsoDay(build.updatedAt));

  const gameMetricsByIsoDay: { [string]: GameMetrics } = {};
  (gameMetricsArray || []).forEach(gameMetrics => {
    gameMetricsByIsoDay[gameMetrics.date.substring(0, 10)] = gameMetrics;
  });

  const {
    pointsCount,
    daysCountPerPoint,
    canCompareWithPreviousPeriod,
  } = periodSettings[period];
  const daysCount = pointsCount * daysCountPerPoint;
  const todayTimestamp = (todayDate || new Date()).getTime();
  const isoDays = getIsoDays(todayTimestamp, daysCount, 0);
  const daysMetrics = sumDaysMetrics(gameMetricsByIsoDay, isoDays);
  const previousDaysMetrics = sumDaysMetrics(
    gameMetricsByIsoDay,
    getIsoDays(todayTimestamp, daysCount, daysCount)
  );

  const overTime = [];
  for (let pointIndex = 0; pointIndex < pointsCount; pointIndex++) {
    const pointIsoDays = isoDays.slice(
      pointIndex * daysCountPerPoint,
      (pointIndex + 1) * daysCountPerPoint
    );
    const pointDaysMetrics = sumDaysMetrics(gameMetricsByIsoDay, pointIsoDays);
    // Each point shows its real rate, even with a few players. Without players, it shows 0.
    const pointSummary = getSummary(pointDaysMetrics, 1);
    const label = formatDay(pointIsoDays[0]);
    overTime.push({
      label,
      fullLabel:
        pointIsoDays.length > 1
          ? `${label} – ${formatDay(pointIsoDays[pointIsoDays.length - 1])}`
          : label,
      playersCount: pointSummary.playersCount,
      newPlayersCount: pointSummary.newPlayersCount,
      returningPlayersCount: pointSummary.returningPlayersCount,
      bounceRatePercent: pointSummary.bounceRatePercent || 0,
      playedDurationPerPlayerInMinutes:
        (pointSummary.playedDurationPerPlayerInSeconds || 0) / 60,
      hasMarketingBoost: pointIsoDays.some(isoDay =>
        isIsoDayInMarketingBoost(isoDay, gameFeaturings || [])
      ),
      buildsCount: completeBuildIsoDays.filter(isoDay =>
        pointIsoDays.includes(isoDay)
      ).length,
    });
  }

  const summary = getSummary(daysMetrics, minPlayersCountForRates);
  const retentionDays = getRetentionDays(gameMetricsByIsoDay, isoDays);

  return {
    summary,
    previousSummary:
      canCompareWithPreviousPeriod && previousDaysMetrics.playersCount > 0
        ? getSummary(previousDaysMetrics, minPlayersCountForRates)
        : null,
    overTime,
    playedDurationSteps: getPlayedDurationSteps(daysMetrics),
    retentionDays,
    playerPlatforms: getPlayerPlatforms(daysMetrics),
    insight: getInsight(summary, retentionDays),
  };
};
