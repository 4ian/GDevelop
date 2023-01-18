// @flow
import {
  formatISO,
  parseISO,
  differenceInCalendarDays,
  subDays,
  addDays,
} from 'date-fns';
import { type GameMetrics } from '../Utils/GDevelopServices/Analytics';

export type MergedGameMetrics = GameMetrics & {
  /**
   * The start date is not defined when only one day is merged.
   */
  startDate: string | null,
};

/**
 * It's divisible by 7.
 */
export const daysShownForYear = 364;

/**
 * Enriched game metrics that are ready to be used in a chart.
 */
type ChartData = {|
  overview: {|
    viewersCount: number,
    playersCount: number,
    bounceRatePercent: number,
    meanPlayedDurationInMinutes: number,
    /**
     * @see findNearestToMedianDurationIndex
     */
    nearestToMedianDuration: {|
      playersCount: number,
      playersPercent: number,
      durationInMinutes: number,
    |},

    /**
     * @see findGreaterDurationPlayerIndex
     */
    greaterDurationPlayerSurface: {|
      playersCount: number,
      playersPercent: number,
      durationInMinutes: number,
    |},
  |},
  /**
   * Metrics for each day of a month or each week of a year.
   */
  overTime: {|
    /**
     * It's used to sort the data.
     */
    timestamp: number,
    date: string,
    playersCount: number,
    viewersCount: number,
    meanPlayedDurationInMinutes: number,
    bounceRatePercent: number,

    over60sPlayersCount: number,
    over180sPlayersCount: number,
    over300sPlayersCount: number,
    over600sPlayersCount: number,
    over900sPlayersCount: number,

    below60sPlayersCount: number,
    from60sTo180sPlayersCount: number,
    from180sTo300sPlayersCount: number,
    from300sTo600sPlayersCount: number,
    from600sTo900sPlayersCount: number,
    from900sToInfinityPlayersCount: number,

    over0sPlayersPercent: number,
    over60sPlayersPercent: number,
    over180sPlayersPercent: number,
    over300sPlayersPercent: number,
    over600sPlayersPercent: number,
    over900sPlayersPercent: number,

    below60sPlayersPercent: number,
    from60sTo180sPlayersPercent: number,
    from180sTo300sPlayersPercent: number,
    from300sTo600sPlayersPercent: number,
    from600sTo900sPlayersPercent: number,
    from900sToInfinityPlayersPercent: number,
  |}[],
  /**
   * A funnel of the remaining players after a given played duration.
   */
  overPlayedDuration: {| duration: number, playersCount: number |}[],
|};

const emptyChartData: ChartData = {
  overview: {
    viewersCount: 0,
    playersCount: 0,
    bounceRatePercent: 0,
    meanPlayedDurationInMinutes: 0,
    nearestToMedianDuration: {
      playersCount: 0,
      playersPercent: 0,
      durationInMinutes: 0,
    },
    greaterDurationPlayerSurface: {
      playersCount: 0,
      playersPercent: 0,
      durationInMinutes: 0,
    },
  },
  overTime: [],
  overPlayedDuration: [],
};

const durationIndexes: { [string]: number } = {
  for1Minute: 0,
  for3Minutes: 1,
  for5Minutes: 2,
  for10Minutes: 3,
  for15Minutes: 4,
};
export const durationValues = [1, 3, 5, 10, 15];

const createZeroesMetric = (date: Date): GameMetrics => {
  return {
    date: formatISO(date),

    sessions: {
      d0Sessions: 0,
      d0SessionsDurationTotal: 0,
    },
    players: {
      d0Players: 0,
      d0NewPlayers: 0,
      d0PlayersBelow60s: 0,
      d0PlayersBelow180s: 0,
      d0PlayersBelow300s: 0,
      d0PlayersBelow600s: 0,
      d0PlayersBelow900s: 0,
    },
    retention: null,
  };
};

/**
 * Fill the void left by the backend for days without any players.
 * @param gameMetrics concise game metrics from the backend (today first)
 * @returns game metrics with a metric for each 364 past days (today first).
 */
const fillMissingDays = (
  gameMetrics: Array<GameMetrics>,
  todayDate: Date
): Array<GameMetrics> => {
  const filledGameMetrics = [];
  // TODO In some timezones, it might start the wrong day.
  let previousMetricDate = addDays(todayDate, 1);
  for (const metric of gameMetrics) {
    const metricDate = parseISO(metric.date);
    // Fill holes
    while (
      differenceInCalendarDays(parseISO(metric.date), previousMetricDate) < -1
    ) {
      const addedMetricDate = subDays(previousMetricDate, 1);
      filledGameMetrics.push(createZeroesMetric(addedMetricDate));
      previousMetricDate = addedMetricDate;
    }
    filledGameMetrics.push(metric);
    previousMetricDate = metricDate;
  }
  // Fill to one year
  while (filledGameMetrics.length < daysShownForYear) {
    const addedMetricDate = subDays(previousMetricDate, 1);
    filledGameMetrics.push(createZeroesMetric(addedMetricDate));
    previousMetricDate = addedMetricDate;
  }
  return filledGameMetrics;
};

/**
 * Sum each metric or `undefined` when one side is `undefined`.
 * When one metric is `undefined`, the value of the other is not used because
 * it would act as if the other metric is `0` which is probably far from the
 * truth and would mess the metric overview like means. It's better to ignore
 * the value. It will sightly change the overview sums, but they are less
 * important.
 * This should only happen on the migration week when new metrics were added.
 * @param a
 * @param b
 * @returns the sum for each metric or `undefined` when one side is `undefined`
 */
const mergeGameMetrics = (
  a: GameMetrics,
  b: GameMetrics
): MergedGameMetrics => {
  return {
    date: a.date,
    startDate: b.date,

    sessions: a.sessions &&
      b.sessions && {
        d0Sessions: a.sessions.d0Sessions + b.sessions.d0Sessions,
        d0SessionsDurationTotal:
          a.sessions.d0SessionsDurationTotal != null &&
          b.sessions.d0SessionsDurationTotal != null
            ? a.sessions.d0SessionsDurationTotal +
              b.sessions.d0SessionsDurationTotal
            : undefined,
      },

    players: a.players &&
      b.players && {
        d0Players: a.players.d0Players + b.players.d0Players,
        d0NewPlayers: a.players.d0NewPlayers + b.players.d0NewPlayers,
        d0PlayersBelow60s:
          a.players.d0PlayersBelow60s != null &&
          b.players.d0PlayersBelow60s != null
            ? a.players.d0PlayersBelow60s + b.players.d0PlayersBelow60s
            : undefined,
        d0PlayersBelow180s:
          a.players.d0PlayersBelow180s != null &&
          b.players.d0PlayersBelow180s != null
            ? a.players.d0PlayersBelow180s + b.players.d0PlayersBelow180s
            : undefined,
        d0PlayersBelow300s:
          a.players.d0PlayersBelow300s != null &&
          b.players.d0PlayersBelow300s != null
            ? a.players.d0PlayersBelow300s + b.players.d0PlayersBelow300s
            : undefined,
        d0PlayersBelow600s:
          a.players.d0PlayersBelow600s != null &&
          b.players.d0PlayersBelow600s != null
            ? a.players.d0PlayersBelow600s + b.players.d0PlayersBelow600s
            : undefined,
        d0PlayersBelow900s:
          a.players.d0PlayersBelow900s != null &&
          b.players.d0PlayersBelow900s != null
            ? a.players.d0PlayersBelow900s + b.players.d0PlayersBelow900s
            : undefined,
      },

    retention: null,
  };
};

/**
 * @param gameMetrics concise game metrics from the backend filled with zeroes
 * metrics (today first)
 * @returns metrics summed by weeks
 * @see mergeGameMetrics
 */
const mergeGameMetricsByWeek = (
  gameMetrics: GameMetrics[]
): MergedGameMetrics[] => {
  const mergedGameMetrics: Array<MergedGameMetrics> = [];
  for (let weekIndex = 0; weekIndex < gameMetrics.length; weekIndex += 7) {
    let mergedGameMetric = gameMetrics[weekIndex];
    for (
      let index = weekIndex + 1;
      index < weekIndex + 7 && index < gameMetrics.length;
      index++
    ) {
      mergedGameMetric = mergeGameMetrics(mergedGameMetric, gameMetrics[index]);
    }
    mergedGameMetrics.push(((mergedGameMetric: any): MergedGameMetrics));
  }
  return mergedGameMetrics;
};

/**
 * @param playersBelowSums
 * @param playersCount
 * @returns the duration limit that split the players the most evenly.
 * The real median would be hard to process for the backend,
 * so we rely on this.
 */
const findNearestToMedianDurationIndex = (
  playersBelowSums: Array<number>,
  playersCount: number
): number => {
  const overMedianDurationIndex = playersBelowSums.findIndex(
    (value, index) => index > 0 && value > playersCount / 2
  );
  const overMedianDuration = playersBelowSums[overMedianDurationIndex];
  const underMedianDuration = playersBelowSums[overMedianDurationIndex + 1];
  return underMedianDuration &&
    Math.abs(overMedianDuration - playersCount / 2) <
      Math.abs(underMedianDuration - playersCount / 2)
    ? overMedianDurationIndex
    : overMedianDurationIndex + 1;
};

/**
 * @param playersBelowSums
 * @param viewersCount
 * @returns the duration limit which maximize: duration * players.
 * It allows to know which point of the curve from
 * `ChartData.overPlayedDuration` is the most impressive one.
 */
const findGreaterDurationPlayerIndex = (
  playersBelowSums: Array<number>,
  viewersCount: number
): number => {
  let durationPlayerMax = 0;
  let greaterDurationPlayerIndex = 0;
  for (let index = 0; index < playersBelowSums.length; index++) {
    const playersOverSum = viewersCount - playersBelowSums[index];
    const duration = durationValues[index];

    const durationPlayer = playersOverSum * duration;
    if (durationPlayer >= durationPlayerMax) {
      durationPlayerMax = durationPlayer;
      greaterDurationPlayerIndex = index;
    }
  }
  return greaterDurationPlayerIndex;
};

const evaluatePlayersOverDurationPercent = (
  playersBelowDuration: ?number,
  playersCount: number
): number => {
  return playersBelowDuration != null && playersCount > 0
    ? (100 * (playersCount - playersBelowDuration)) / playersCount
    : 0;
};

const evaluatePlayersBetweenDurationPercent = (
  playersBelowUpperDuration: ?number,
  playersBelowLowerDuration: ?number,
  playersCount: number
): number => {
  return playersBelowUpperDuration != null &&
    playersBelowLowerDuration != null &&
    playersCount > 0
    ? (100 * (playersBelowUpperDuration - playersBelowLowerDuration)) /
        playersCount
    : 0;
};

const subtract = (a: ?number, b: ?number): number => {
  return a != null && b != null ? a - b : 0;
};

/**
 * @param metrics concise game metrics from the backend filled with zeroes
 * metrics (today first)
 * @returns enriched game metrics that are ready to be used in a chart
 * (today first).
 */
const evaluateChartData = (metrics: MergedGameMetrics[]): ChartData => {
  let playersBelowSums = [0, 0, 0, 0, 0];
  let playersSum = 0;
  let onlyFullyDefinedPlayersSum = 0;
  let playedDurationSumInMinutes = 0;

  metrics.forEach(metric => {
    const d0SessionsDurationTotal =
      metric.sessions && metric.sessions.d0SessionsDurationTotal !== null
        ? metric.sessions.d0SessionsDurationTotal
        : undefined;

    const d0Players = metric.players ? metric.players.d0Players : 0;
    const d0PlayersBelow60s =
      metric.players && metric.players.d0PlayersBelow60s !== null
        ? metric.players.d0PlayersBelow60s
        : undefined;
    const d0PlayersBelow180s =
      metric.players && metric.players.d0PlayersBelow180s !== null
        ? metric.players.d0PlayersBelow180s
        : undefined;
    const d0PlayersBelow300s =
      metric.players && metric.players.d0PlayersBelow300s !== null
        ? metric.players.d0PlayersBelow300s
        : undefined;
    const d0PlayersBelow600s =
      metric.players && metric.players.d0PlayersBelow600s !== null
        ? metric.players.d0PlayersBelow600s
        : undefined;
    const d0PlayersBelow900s =
      metric.players && metric.players.d0PlayersBelow900s !== null
        ? metric.players.d0PlayersBelow900s
        : undefined;

    playersBelowSums[durationIndexes.for1Minute] += d0PlayersBelow60s || 0;
    playersBelowSums[durationIndexes.for3Minutes] += d0PlayersBelow180s || 0;
    playersBelowSums[durationIndexes.for5Minutes] += d0PlayersBelow300s || 0;
    playersBelowSums[durationIndexes.for10Minutes] += d0PlayersBelow600s || 0;
    playersBelowSums[durationIndexes.for15Minutes] += d0PlayersBelow900s || 0;
    playedDurationSumInMinutes += d0SessionsDurationTotal || 0;
    playersSum += d0Players;
    onlyFullyDefinedPlayersSum +=
      d0PlayersBelow60s !== undefined ? d0Players : 0;
  });
  playedDurationSumInMinutes /= 60;

  const viewersCount = onlyFullyDefinedPlayersSum;
  const playersCount =
    onlyFullyDefinedPlayersSum - playersBelowSums[durationIndexes.for1Minute];

  const nearestToMedianDurationIndex = findNearestToMedianDurationIndex(
    playersBelowSums,
    playersCount
  );
  const greaterDurationPlayerIndex = findGreaterDurationPlayerIndex(
    playersBelowSums,
    viewersCount
  );

  const dateFormatOptions = { month: 'short', day: 'numeric' };
  const noMonthDateFormatOptions = { day: 'numeric' };

  const formatDate = (metric: MergedGameMetrics) => {
    const startIsoDate = metric.startDate;
    const endDate = parseISO(metric.date);
    const formattedDate = endDate.toLocaleDateString(
      undefined,
      dateFormatOptions
    );
    if (!startIsoDate) {
      return formattedDate;
    }
    const startDate = parseISO(startIsoDate);
    return (
      startDate.toLocaleDateString(
        undefined,
        endDate.getMonth() === startDate.getMonth()
          ? noMonthDateFormatOptions
          : dateFormatOptions
      ) +
      '-' +
      formattedDate
    );
  };

  return {
    overview: {
      // Players from before the migration are shown as viewers
      // because it's not possible to make them apart from real players.
      viewersCount: playersSum,
      playersCount: playersCount,
      bounceRatePercent:
        viewersCount > 0
          ? (100 * playersBelowSums[durationIndexes.for1Minute]) / viewersCount
          : 0,
      meanPlayedDurationInMinutes:
        viewersCount > 0 ? playedDurationSumInMinutes / viewersCount : 0,
      nearestToMedianDuration: {
        playersCount:
          viewersCount - playersBelowSums[nearestToMedianDurationIndex],
        playersPercent:
          viewersCount > 0
            ? (100 *
                (viewersCount -
                  playersBelowSums[nearestToMedianDurationIndex])) /
              viewersCount
            : 0,
        durationInMinutes: durationValues[nearestToMedianDurationIndex],
      },
      greaterDurationPlayerSurface: {
        playersCount:
          viewersCount - playersBelowSums[greaterDurationPlayerIndex],
        playersPercent:
          viewersCount > 0
            ? (100 *
                (viewersCount - playersBelowSums[greaterDurationPlayerIndex])) /
              viewersCount
            : 0,
        durationInMinutes: durationValues[greaterDurationPlayerIndex],
      },
    },
    overTime: metrics
      .map(metric => {
        const d0SessionsDurationTotal =
          metric.sessions && metric.sessions.d0SessionsDurationTotal !== null
            ? metric.sessions.d0SessionsDurationTotal
            : undefined;

        const d0Players = metric.players ? metric.players.d0Players : 0;
        const d0PlayersBelow60s =
          metric.players && metric.players.d0PlayersBelow60s !== null
            ? metric.players.d0PlayersBelow60s
            : undefined;
        const d0PlayersBelow180s =
          metric.players && metric.players.d0PlayersBelow180s !== null
            ? metric.players.d0PlayersBelow180s
            : undefined;
        const d0PlayersBelow300s =
          metric.players && metric.players.d0PlayersBelow300s !== null
            ? metric.players.d0PlayersBelow300s
            : undefined;
        const d0PlayersBelow600s =
          metric.players && metric.players.d0PlayersBelow600s !== null
            ? metric.players.d0PlayersBelow600s
            : undefined;
        const d0PlayersBelow900s =
          metric.players && metric.players.d0PlayersBelow900s !== null
            ? metric.players.d0PlayersBelow900s
            : undefined;

        return {
          timestamp: parseISO(metric.date).getTime(),
          date: formatDate(metric),
          meanPlayedDurationInMinutes: d0SessionsDurationTotal
            ? d0SessionsDurationTotal / 60 / d0Players
            : 0,
          bounceRatePercent: evaluatePlayersBetweenDurationPercent(
            d0PlayersBelow60s,
            0,
            d0Players
          ),
          viewersCount: d0Players,
          playersCount: subtract(d0Players, d0PlayersBelow60s),

          over60sPlayersCount: subtract(d0Players, d0PlayersBelow60s),
          over180sPlayersCount: subtract(d0Players, d0PlayersBelow180s),
          over300sPlayersCount: subtract(d0Players, d0PlayersBelow300s),
          over600sPlayersCount: subtract(d0Players, d0PlayersBelow600s),
          over900sPlayersCount: subtract(d0Players, d0PlayersBelow900s),

          below60sPlayersCount: subtract(d0PlayersBelow60s, 0),
          from60sTo180sPlayersCount: subtract(
            d0PlayersBelow180s,
            d0PlayersBelow60s
          ),
          from180sTo300sPlayersCount: subtract(
            d0PlayersBelow300s,
            d0PlayersBelow180s
          ),
          from300sTo600sPlayersCount: subtract(
            d0PlayersBelow600s,
            d0PlayersBelow300s
          ),
          from600sTo900sPlayersCount: subtract(
            d0PlayersBelow900s,
            d0PlayersBelow600s
          ),
          from900sToInfinityPlayersCount: subtract(
            d0Players,
            d0PlayersBelow900s
          ),

          over0sPlayersPercent: 100,
          over60sPlayersPercent: evaluatePlayersOverDurationPercent(
            d0PlayersBelow60s,
            d0Players
          ),
          over180sPlayersPercent: evaluatePlayersOverDurationPercent(
            d0PlayersBelow180s,
            d0Players
          ),
          over300sPlayersPercent: evaluatePlayersOverDurationPercent(
            d0PlayersBelow300s,
            d0Players
          ),
          over600sPlayersPercent: evaluatePlayersOverDurationPercent(
            d0PlayersBelow600s,
            d0Players
          ),
          over900sPlayersPercent: evaluatePlayersOverDurationPercent(
            d0PlayersBelow900s,
            d0Players
          ),

          below60sPlayersPercent: evaluatePlayersBetweenDurationPercent(
            d0PlayersBelow60s,
            0,
            d0Players
          ),
          from60sTo180sPlayersPercent: evaluatePlayersBetweenDurationPercent(
            d0PlayersBelow180s,
            d0PlayersBelow60s,
            d0Players
          ),
          from180sTo300sPlayersPercent: evaluatePlayersBetweenDurationPercent(
            d0PlayersBelow300s,
            d0PlayersBelow180s,
            d0Players
          ),
          from300sTo600sPlayersPercent: evaluatePlayersBetweenDurationPercent(
            d0PlayersBelow600s,
            d0PlayersBelow300s,
            d0Players
          ),
          from600sTo900sPlayersPercent: evaluatePlayersBetweenDurationPercent(
            d0PlayersBelow900s,
            d0PlayersBelow600s,
            d0Players
          ),
          from900sToInfinityPlayersPercent: evaluatePlayersBetweenDurationPercent(
            d0Players,
            d0PlayersBelow900s,
            d0Players
          ),
        };
      })
      .sort((a, b) => a.timestamp - b.timestamp),
    overPlayedDuration: [
      { duration: 0, playersCount: onlyFullyDefinedPlayersSum },
    ].concat(
      Object.keys(durationIndexes).map(name => {
        const durationIndex = durationIndexes[name];
        return {
          duration: durationValues[durationIndex],
          playersCount:
            onlyFullyDefinedPlayersSum - playersBelowSums[durationIndex],
        };
      })
    ),
  };
};

/**
 * @param gameMetrics concise game metrics from the backend (today first)
 * @returns enriched game metrics that are ready to be used in a chart
 * (today at last).
 */
export const buildChartData = (
  gameMetrics: ?Array<GameMetrics>,
  todayDate: Date = new Date()
): { yearChartData: ChartData, monthChartData: ChartData } => {
  if (!gameMetrics) {
    return {
      yearChartData: emptyChartData,
      monthChartData: emptyChartData,
    };
  }
  const filledGameRollingMetrics = fillMissingDays(
    gameMetrics.sort(
      (a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()
    ),
    todayDate
  );
  return {
    yearChartData: evaluateChartData(
      mergeGameMetricsByWeek(filledGameRollingMetrics)
    ),
    monthChartData: evaluateChartData(
      filledGameRollingMetrics
        .slice(0, 30)
        .map(metric => ({ ...metric, startDate: null }: MergedGameMetrics))
    ),
  };
};
