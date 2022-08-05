import { buildChartData } from './GameAnalyticsEvaluator';
import {
  gameRollingMetricsWithHoles,
  gameRollingMetricsWithOnly19Days,
} from '../fixtures/GDevelopServicesTestData';
import { formatISO, subDays } from 'date-fns';

describe('GameAnalyticsEvaluator', () => {
  const generateGameRollingMetrics1 = (count, todayDate) => {
    const metrics = [];
    for (let index = 0; index < count; index++) {
      metrics.push({
        date: formatISO(subDays(todayDate, index)),

        sessions: {
          d0Sessions: 1,
          d0SessionsDurationTotal: 60,
        },
        players: {
          d0Players: 1,
          d0NewPlayers: 1,
          d0PlayersBelow60s: 0,
          d0PlayersBelow180s: 1,
          d0PlayersBelow300s: 1,
          d0PlayersBelow600s: 1,
          d0PlayersBelow900s: 1,
        },
        retention: null,
      });
    }
    return metrics;
  };

  it('fill empty metrics', () => {
    const { yearChartData, monthChartData } = buildChartData([]);

    expect(yearChartData.overTime.length).toBe(52);
    expect(monthChartData.overTime.length).toBe(30);
  });

  it('fill metrics missing days', () => {
    const { yearChartData, monthChartData } = buildChartData(
      gameRollingMetricsWithHoles
    );

    expect(yearChartData.overTime.length).toBe(52);
    expect(monthChartData.overTime.length).toBe(30);
  });

  it('give the same overview statistics on year and month', () => {
    // Easy to understand data for debugging
    {
      const todayDate = new Date(2022, 6, 24, 1, 0);
      const { yearChartData, monthChartData } = buildChartData(
        generateGameRollingMetrics1(19, todayDate),
        todayDate
      );
      expect(yearChartData.overview).toStrictEqual(monthChartData.overview);
    }
    // Randomized data to be sure to spot everything
    {
      const { yearChartData, monthChartData } = buildChartData(
        gameRollingMetricsWithOnly19Days
      );
      expect(yearChartData.overview).toStrictEqual(monthChartData.overview);
    }
  });
});
