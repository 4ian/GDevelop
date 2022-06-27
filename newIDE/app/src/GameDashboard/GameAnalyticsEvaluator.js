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
  startDate: string,
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
          a.sessions.d0SessionsDurationTotal &&
          b.sessions.d0SessionsDurationTotal &&
          a.sessions.d0SessionsDurationTotal +
            b.sessions.d0SessionsDurationTotal,
      },

    players: a.players &&
      b.players && {
        d0Players: a.players.d0Players + b.players.d0Players,
        d0NewPlayers: a.players.d0NewPlayers + b.players.d0NewPlayers,
        d0PlayersBelow60s:
          a.players.d0PlayersBelow60s &&
          b.players.d0PlayersBelow60s &&
          a.players.d0PlayersBelow60s + b.players.d0PlayersBelow60s,
        d0PlayersBelow180s:
          a.players.d0PlayersBelow180s &&
          b.players.d0PlayersBelow180s &&
          a.players.d0PlayersBelow180s + b.players.d0PlayersBelow180s,
        d0PlayersBelow300s:
          a.players.d0PlayersBelow300s &&
          b.players.d0PlayersBelow300s &&
          a.players.d0PlayersBelow300s + b.players.d0PlayersBelow300s,
        d0PlayersBelow600s:
          a.players.d0PlayersBelow600s &&
          b.players.d0PlayersBelow600s &&
          a.players.d0PlayersBelow600s + b.players.d0PlayersBelow600s,
        d0PlayersBelow900s:
          a.players.d0PlayersBelow900s &&
          b.players.d0PlayersBelow900s &&
          a.players.d0PlayersBelow900s + b.players.d0PlayersBelow900s,
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

const evaluateChartData = (
  metrics: GameMetrics[] | MergedGameMetrics[]
): ChartData => {
  let playersBelowSums = [0, 0, 0, 0, 0];
  let playersSum = 0;
  let onlyFullyDefinedPlayersSum = 0;
  let playedDurationSumInMinutes = 0;

  metrics.forEach(metric => {
    playersBelowSums[durationIndexes.for1Minute] +=
      metric.players && metric.players.d0PlayersBelow60s
        ? metric.players.d0PlayersBelow60s
        : 0;
    playersBelowSums[durationIndexes.for3Minutes] +=
      metric.players && metric.players.d0PlayersBelow180s
        ? metric.players.d0PlayersBelow180s
        : 0;
    playersBelowSums[durationIndexes.for5Minutes] +=
      metric.players && metric.players.d0PlayersBelow300s
        ? metric.players.d0PlayersBelow300s
        : 0;
    playersBelowSums[durationIndexes.for10Minutes] +=
      metric.players && metric.players.d0PlayersBelow600s
        ? metric.players.d0PlayersBelow600s
        : 0;
    playersBelowSums[durationIndexes.for15Minutes] +=
      metric.players && metric.players.d0PlayersBelow900s
        ? metric.players.d0PlayersBelow900s
        : 0;
    playersSum += metric.players ? metric.players.d0Players : 0;
    onlyFullyDefinedPlayersSum +=
      metric.players && metric.players.d0PlayersBelow60s
        ? metric.players.d0Players
        : 0;
    playedDurationSumInMinutes +=
      metric.sessions && metric.sessions.d0SessionsDurationTotal
        ? metric.sessions.d0SessionsDurationTotal / 60
        : 0;
  });

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

  return {
    overview: {
      // Players from before the migration are shown as viewers
      // because it's not possible to make them apart from real players.
      viewersCount: playersSum,
      playersCount: playersCount,
      bounceRatePercent:
        onlyFullyDefinedPlayersSum > 0
          ? (100 * playersBelowSums[durationIndexes.for1Minute]) /
            onlyFullyDefinedPlayersSum
          : 0,
      meanPlayedDurationInMinutes:
        onlyFullyDefinedPlayersSum > 0
          ? playedDurationSumInMinutes / onlyFullyDefinedPlayersSum
          : 0,
      nearestToMedianDuration: {
        playersCount:
          onlyFullyDefinedPlayersSum -
          playersBelowSums[nearestToMedianDurationIndex],
        playersPercent:
          onlyFullyDefinedPlayersSum > 0
            ? (100 *
                (onlyFullyDefinedPlayersSum -
                  playersBelowSums[nearestToMedianDurationIndex])) /
              onlyFullyDefinedPlayersSum
            : 0,
        durationInMinutes: durationValues[nearestToMedianDurationIndex],
      },
      greaterDurationPlayerSurface: {
        playersCount:
          onlyFullyDefinedPlayersSum -
          playersBelowSums[greaterDurationPlayerIndex],
        playersPercent:
          onlyFullyDefinedPlayersSum > 0
            ? (100 *
                (onlyFullyDefinedPlayersSum -
                  playersBelowSums[greaterDurationPlayerIndex])) /
              onlyFullyDefinedPlayersSum
            : 0,
        durationInMinutes: durationValues[greaterDurationPlayerIndex],
      },
    },
    byDay: metrics
      .map(metric => ({
        timestamp: parseISO(metric.date).getTime(),
        date:
          (metric.startDate
            ? parseISO(metric.startDate).toLocaleDateString(
                undefined,
                parseISO(metric.date).getMonth() ===
                  parseISO(metric.startDate).getMonth()
                  ? noMonthDateFormatOptions
                  : dateFormatOptions
              ) + ' - '
            : '') +
          parseISO(metric.date).toLocaleDateString(
            undefined,
            dateFormatOptions
          ),
        meanPlayedDurationInMinutes:
          metric.sessions &&
          metric.players &&
          metric.sessions.d0SessionsDurationTotal
            ? metric.sessions.d0SessionsDurationTotal /
              60 /
              metric.players.d0Players
            : 0,
        bounceRatePercent:
          metric.players && metric.players.d0PlayersBelow60s
            ? (100 * metric.players.d0PlayersBelow60s) /
              metric.players.d0Players
            : 0,
        viewersCount: metric.players ? metric.players.d0Players : 0,
        playersCount:
          metric.players && metric.players.d0PlayersBelow60s
            ? metric.players.d0Players - metric.players.d0PlayersBelow60s
            : 0,
        over60sPlayersCount:
          metric.players && metric.players.d0PlayersBelow60s
            ? metric.players.d0Players - metric.players.d0PlayersBelow60s
            : 0,
        over180sPlayersCount:
          metric.players && metric.players.d0PlayersBelow180s
            ? metric.players.d0Players - metric.players.d0PlayersBelow180s
            : 0,
        over300sPlayersCount:
          metric.players && metric.players.d0PlayersBelow300s
            ? metric.players.d0Players - metric.players.d0PlayersBelow300s
            : 0,
        over600sPlayersCount:
          metric.players && metric.players.d0PlayersBelow600s
            ? metric.players.d0Players - metric.players.d0PlayersBelow600s
            : 0,
        over900sPlayersCount:
          metric.players && metric.players.d0PlayersBelow900s
            ? metric.players.d0Players - metric.players.d0PlayersBelow900s
            : 0,

        below60sPlayersCount:
          metric.players && metric.players.d0PlayersBelow60s
            ? metric.players.d0PlayersBelow60s
            : 0,
        from60sTo180sPlayersCount:
          metric.players &&
          metric.players.d0PlayersBelow180s &&
          metric.players.d0PlayersBelow60s
            ? metric.players.d0PlayersBelow180s -
              metric.players.d0PlayersBelow60s
            : 0,
        from180sTo300sPlayersCount:
          metric.players &&
          metric.players.d0PlayersBelow300s &&
          metric.players.d0PlayersBelow180s
            ? metric.players.d0PlayersBelow300s -
              metric.players.d0PlayersBelow180s
            : 0,
        from300sTo600sPlayersCount:
          metric.players &&
          metric.players.d0PlayersBelow600s &&
          metric.players.d0PlayersBelow300s
            ? metric.players.d0PlayersBelow600s -
              metric.players.d0PlayersBelow300s
            : 0,
        from600sTo900sPlayersCount:
          metric.players &&
          metric.players.d0PlayersBelow900s &&
          metric.players.d0PlayersBelow600s
            ? metric.players.d0PlayersBelow900s -
              metric.players.d0PlayersBelow600s
            : 0,
        from900sToInfinityPlayersCount:
          metric.players && metric.players.d0PlayersBelow900s
            ? metric.players.d0Players - metric.players.d0PlayersBelow900s
            : 0,

        over0sPlayersPercent: metric.players ? 100 : 0,
        over60sPlayersPercent:
          metric.players &&
          metric.players.d0PlayersBelow60s &&
          metric.players.d0Players > 0
            ? (100 *
                (metric.players.d0Players - metric.players.d0PlayersBelow60s)) /
              metric.players.d0Players
            : 0,
        over180sPlayersPercent:
          metric.players &&
          metric.players.d0PlayersBelow180s &&
          metric.players.d0Players > 0
            ? (100 *
                (metric.players.d0Players -
                  metric.players.d0PlayersBelow180s)) /
              metric.players.d0Players
            : 0,
        over300sPlayersPercent:
          metric.players &&
          metric.players.d0PlayersBelow300s &&
          metric.players.d0Players > 0
            ? (100 *
                (metric.players.d0Players -
                  metric.players.d0PlayersBelow300s)) /
              metric.players.d0Players
            : 0,
        over600sPlayersPercent:
          metric.players &&
          metric.players.d0PlayersBelow600s &&
          metric.players.d0Players > 0
            ? (100 *
                (metric.players.d0Players -
                  metric.players.d0PlayersBelow600s)) /
              metric.players.d0Players
            : 0,
        over900sPlayersPercent:
          metric.players &&
          metric.players.d0PlayersBelow900s &&
          metric.players.d0Players > 0
            ? (100 *
                (metric.players.d0Players -
                  metric.players.d0PlayersBelow900s)) /
              metric.players.d0Players
            : 0,

        below60sPlayersPercent:
          metric.players &&
          metric.players.d0PlayersBelow60s &&
          metric.players.d0Players > 0
            ? (100 * metric.players.d0PlayersBelow60s) /
              metric.players.d0Players
            : 0,
        from60sTo180sPlayersPercent:
          metric.players &&
          metric.players.d0PlayersBelow180s &&
          metric.players.d0PlayersBelow60s &&
          metric.players.d0Players > 0
            ? (100 *
                (metric.players.d0PlayersBelow180s -
                  metric.players.d0PlayersBelow60s)) /
              metric.players.d0Players
            : 0,
        from180sTo300sPlayersPercent:
          metric.players &&
          metric.players.d0PlayersBelow300s &&
          metric.players.d0PlayersBelow180s &&
          metric.players.d0Players > 0
            ? (100 *
                (metric.players.d0PlayersBelow300s -
                  metric.players.d0PlayersBelow180s)) /
              metric.players.d0Players
            : 0,
        from300sTo600sPlayersPercent:
          metric.players &&
          metric.players.d0PlayersBelow600s &&
          metric.players.d0PlayersBelow300s &&
          metric.players.d0Players > 0
            ? (100 *
                (metric.players.d0PlayersBelow600s -
                  metric.players.d0PlayersBelow300s)) /
              metric.players.d0Players
            : 0,
        from600sTo900sPlayersPercent:
          metric.players &&
          metric.players.d0PlayersBelow900s &&
          metric.players.d0PlayersBelow600s &&
          metric.players.d0Players > 0
            ? (100 *
                (metric.players.d0PlayersBelow900s -
                  metric.players.d0PlayersBelow600s)) /
              metric.players.d0Players
            : 0,
        from900sToInfinityPlayersPercent:
          metric.players &&
          metric.players.d0PlayersBelow900s &&
          metric.players.d0Players > 0
            ? (100 *
                (metric.players.d0Players -
                  metric.players.d0PlayersBelow900s)) /
              metric.players.d0Players
            : 0,
      }))
      .sort((a, b) => a.timestamp - b.timestamp),
    byPlayedTime: [
      { duration: 0, playersCount: onlyFullyDefinedPlayersSum },
    ].concat(
      Object.values(durationIndexes).map((durationIndex: number) => ({
        duration: durationValues[durationIndex],
        playersCount:
          onlyFullyDefinedPlayersSum - playersBelowSums[durationIndex],
      }))
    ),
  };
};

export const evaluateGameMetrics = (
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
    monthChartData: evaluateChartData(filledGameRollingMetrics.slice(0, 30)),
  };
};
