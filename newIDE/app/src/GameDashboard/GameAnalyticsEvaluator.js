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
  startDate: string | null,
};

export const daysShownForYear = 364;

type ChartData = {|
  overview: {|
    viewersCount: number,
    playersCount: number,
    bounceRatePercent: number,
    meanPlayedDurationInMinutes: number,
    nearestToMedianDuration: {|
      playersCount: number,
      playersPercent: number,
      durationInMinutes: number,
    |},
    greaterDurationPlayerSurface: {|
      playersCount: number,
      playersPercent: number,
      durationInMinutes: number,
    |},
  |},
  byDay: {|
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
  byPlayedTime: {| duration: number, playersCount: number |}[],
|};

const emptyChartData = {
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
  byDay: [],
  byPlayedTime: [],
};

const durationIndexes: { [string]: number } = {
  for1Minute: 0,
  for3Minutes: 1,
  for5Minutes: 2,
  for10Minutes: 3,
  for15Minutes: 4,
};
export const durationValues = [1, 3, 5, 10, 15];

const fillMissingDays = (
  gameMetrics: Array<GameMetrics>
): Array<GameMetrics> => {
  const filledGameMetrics = [];
  // TODO In some timezones, it might start the wrong day.
  let previousMetricDate = addDays(new Date(), 1);
  for (const metric of gameMetrics) {
    const metricDate = parseISO(metric.date);
    while (
      differenceInCalendarDays(parseISO(metric.date), previousMetricDate) < -1
    ) {
      const addedMetricDate = subDays(previousMetricDate, 1);
      const zeroMetric: GameMetrics = {
        date: formatISO(addedMetricDate),

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
      filledGameMetrics.push(zeroMetric);
      previousMetricDate = addedMetricDate;
    }
    filledGameMetrics.push(metric);
    previousMetricDate = metricDate;
  }
  while (filledGameMetrics.length < daysShownForYear) {
    const addedMetricDate = subDays(previousMetricDate, 1);
    const zeroMetric: GameMetrics = {
      date: formatISO(addedMetricDate),

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
    filledGameMetrics.push(zeroMetric);
    previousMetricDate = addedMetricDate;
  }
  return filledGameMetrics;
};

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

    playersBelowSums[durationIndexes.for1Minute] +=
      d0PlayersBelow60s !== undefined ? d0PlayersBelow60s : 0;
    playersBelowSums[durationIndexes.for3Minutes] +=
      d0PlayersBelow180s !== undefined ? d0PlayersBelow180s : 0;
    playersBelowSums[durationIndexes.for5Minutes] +=
      d0PlayersBelow300s !== undefined ? d0PlayersBelow300s : 0;
    playersBelowSums[durationIndexes.for10Minutes] +=
      d0PlayersBelow600s !== undefined ? d0PlayersBelow600s : 0;
    playersBelowSums[durationIndexes.for15Minutes] +=
      d0PlayersBelow900s !== undefined ? d0PlayersBelow900s : 0;
    playersSum += metric.players ? d0Players : 0;
    onlyFullyDefinedPlayersSum +=
      d0PlayersBelow60s !== undefined ? d0Players : 0;
    playedDurationSumInMinutes +=
      d0SessionsDurationTotal !== undefined ? d0SessionsDurationTotal : 0;
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
      ' - ' +
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
    byDay: metrics
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
          bounceRatePercent:
            d0PlayersBelow60s !== undefined
              ? (100 * d0PlayersBelow60s) / d0Players
              : 0,
          viewersCount: d0Players,
          playersCount:
            d0PlayersBelow60s !== undefined ? d0Players - d0PlayersBelow60s : 0,
          over60sPlayersCount:
            d0PlayersBelow60s !== undefined ? d0Players - d0PlayersBelow60s : 0,
          over180sPlayersCount:
            d0PlayersBelow180s !== undefined
              ? d0Players - d0PlayersBelow180s
              : 0,
          over300sPlayersCount:
            d0PlayersBelow300s !== undefined
              ? d0Players - d0PlayersBelow300s
              : 0,
          over600sPlayersCount:
            d0PlayersBelow600s !== undefined
              ? d0Players - d0PlayersBelow600s
              : 0,
          over900sPlayersCount:
            d0PlayersBelow900s !== undefined
              ? d0Players - d0PlayersBelow900s
              : 0,

          below60sPlayersCount:
            d0PlayersBelow60s !== undefined ? d0PlayersBelow60s : 0,
          from60sTo180sPlayersCount:
            d0PlayersBelow180s !== undefined && d0PlayersBelow60s !== undefined
              ? d0PlayersBelow180s - d0PlayersBelow60s
              : 0,
          from180sTo300sPlayersCount:
            d0PlayersBelow300s !== undefined && d0PlayersBelow180s !== undefined
              ? d0PlayersBelow300s - d0PlayersBelow180s
              : 0,
          from300sTo600sPlayersCount:
            d0PlayersBelow600s !== undefined && d0PlayersBelow300s !== undefined
              ? d0PlayersBelow600s - d0PlayersBelow300s
              : 0,
          from600sTo900sPlayersCount:
            d0PlayersBelow900s !== undefined && d0PlayersBelow600s !== undefined
              ? d0PlayersBelow900s - d0PlayersBelow600s
              : 0,
          from900sToInfinityPlayersCount:
            d0PlayersBelow900s !== undefined
              ? d0Players - d0PlayersBelow900s
              : 0,

          over0sPlayersPercent: 100,
          over60sPlayersPercent:
            d0PlayersBelow60s !== undefined && d0Players > 0
              ? (100 * (d0Players - d0PlayersBelow60s)) / d0Players
              : 0,
          over180sPlayersPercent:
            d0PlayersBelow180s !== undefined && d0Players > 0
              ? (100 * (d0Players - d0PlayersBelow180s)) / d0Players
              : 0,
          over300sPlayersPercent:
            d0PlayersBelow300s !== undefined && d0Players > 0
              ? (100 * (d0Players - d0PlayersBelow300s)) / d0Players
              : 0,
          over600sPlayersPercent:
            d0PlayersBelow600s !== undefined && d0Players > 0
              ? (100 * (d0Players - d0PlayersBelow600s)) / d0Players
              : 0,
          over900sPlayersPercent:
            d0PlayersBelow900s !== undefined && d0Players > 0
              ? (100 * (d0Players - d0PlayersBelow900s)) / d0Players
              : 0,
          below60sPlayersPercent:
            d0PlayersBelow60s !== undefined && d0Players > 0
              ? (100 * d0PlayersBelow60s) / d0Players
              : 0,
          from60sTo180sPlayersPercent:
            d0PlayersBelow180s !== undefined &&
            d0PlayersBelow60s !== undefined &&
            d0Players > 0
              ? (100 * (d0PlayersBelow180s - d0PlayersBelow60s)) / d0Players
              : 0,
          from180sTo300sPlayersPercent:
            d0PlayersBelow300s !== undefined &&
            d0PlayersBelow180s !== undefined &&
            d0Players > 0
              ? (100 * (d0PlayersBelow300s - d0PlayersBelow180s)) / d0Players
              : 0,
          from300sTo600sPlayersPercent:
            d0PlayersBelow600s !== undefined &&
            d0PlayersBelow300s !== undefined &&
            d0Players > 0
              ? (100 * (d0PlayersBelow600s - d0PlayersBelow300s)) / d0Players
              : 0,
          from600sTo900sPlayersPercent:
            d0PlayersBelow900s !== undefined &&
            d0PlayersBelow600s !== undefined &&
            d0Players > 0
              ? (100 * (d0PlayersBelow900s - d0PlayersBelow600s)) / d0Players
              : 0,
          from900sToInfinityPlayersPercent:
            d0PlayersBelow900s !== undefined && d0Players > 0
              ? (100 * (d0Players - d0PlayersBelow900s)) / d0Players
              : 0,
        };
      })
      .sort((a, b) => a.timestamp - b.timestamp),
    byPlayedTime: [
      { duration: 0, playersCount: onlyFullyDefinedPlayersSum },
    ].concat(
      // $FlowFixMe durationIndex can only be a number.
      Object.values(durationIndexes).map((durationIndex: number) => ({
        duration: durationValues[durationIndex],
        playersCount:
          onlyFullyDefinedPlayersSum - playersBelowSums[durationIndex],
      }))
    ),
  };
};

export const buildChartData = (
  gameMetrics: ?Array<GameMetrics>
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
    )
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
