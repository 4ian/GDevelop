// @flow
import { getGameAnalytics } from './GameAnalyticsEvaluator';
import { type GameMetrics } from '../Utils/GDevelopServices/Analytics';

const todayDate = new Date('2026-11-20T10:00:00Z');

const createFakeGameMetrics = (
  date: string,
  {
    playersCount,
    newPlayersCount,
    bouncedPlayersCount,
    d1RetainedPlayersCount,
  }: {|
    playersCount: number,
    newPlayersCount: number,
    bouncedPlayersCount: number,
    d1RetainedPlayersCount: number,
  |}
): GameMetrics => ({
  date,
  sessions: {
    d0Sessions: playersCount * 2,
    d0SessionsDurationTotal: playersCount * 120,
  },
  players: {
    d0Players: playersCount,
    d0NewPlayers: newPlayersCount,
    d0PlayersBelow60s: bouncedPlayersCount,
    d0PlayersBelow180s: bouncedPlayersCount,
    d0PlayersBelow300s: bouncedPlayersCount,
    d0PlayersBelow600s: playersCount,
    d0PlayersBelow900s: playersCount,
  },
  retention: {
    d1RetainedPlayers: d1RetainedPlayersCount,
    d2RetainedPlayers: 0,
    d3RetainedPlayers: 0,
    d4RetainedPlayers: 0,
    d5RetainedPlayers: 0,
    d6RetainedPlayers: 0,
    d7RetainedPlayers: 0,
  },
});

describe('GameAnalyticsEvaluator', () => {
  it('summarizes the period, today included, and compares it to the previous period', () => {
    const gameAnalytics = getGameAnalytics(
      [
        createFakeGameMetrics('2026-11-20', {
          playersCount: 5,
          newPlayersCount: 5,
          bouncedPlayersCount: 1,
          d1RetainedPlayersCount: 2,
        }),
        createFakeGameMetrics('2026-11-19', {
          playersCount: 30,
          newPlayersCount: 20,
          bouncedPlayersCount: 6,
          d1RetainedPlayersCount: 4,
        }),
        createFakeGameMetrics('2026-11-18', {
          playersCount: 50,
          newPlayersCount: 40,
          bouncedPlayersCount: 10,
          d1RetainedPlayersCount: 0,
        }),
        // The previous week.
        createFakeGameMetrics('2026-11-10', {
          playersCount: 40,
          newPlayersCount: 40,
          bouncedPlayersCount: 20,
          d1RetainedPlayersCount: 0,
        }),
      ],
      'week',
      { todayDate }
    );

    expect(gameAnalytics.summary).toEqual({
      playersCount: 85,
      newPlayersCount: 65,
      returningPlayersCount: 20,
      sessionsCount: 170,
      bounceRatePercent: 20,
      playedDurationPerPlayerInSeconds: 120,
    });
    expect(gameAnalytics.previousSummary).toEqual({
      playersCount: 40,
      newPlayersCount: 40,
      returningPlayersCount: 0,
      sessionsCount: 80,
      bounceRatePercent: 50,
      playedDurationPerPlayerInSeconds: 120,
    });

    expect(gameAnalytics.overTime.map(point => point.playersCount)).toEqual([
      0,
      0,
      0,
      0,
      50,
      30,
      5,
    ]);
    // Days without players have a rate of 0.
    expect(gameAnalytics.overTime[0].bounceRatePercent).toBe(0);
    expect(gameAnalytics.overTime[0].playedDurationPerPlayerInMinutes).toBe(0);
    expect(gameAnalytics.overTime[5].bounceRatePercent).toBe(20);
    // A day with a few players shows its real rate.
    expect(gameAnalytics.overTime[6].bounceRatePercent).toBe(20);

    expect(gameAnalytics.playedDurationSteps).toEqual([
      { durationInMinutes: 0, playersPercent: 100 },
      { durationInMinutes: 1, playersPercent: 80 },
      { durationInMinutes: 3, playersPercent: 80 },
      { durationInMinutes: 5, playersPercent: 80 },
      { durationInMinutes: 10, playersPercent: 0 },
      { durationInMinutes: 15, playersPercent: 0 },
    ]);

    // 4 players of the 19th were among the 40 new players of the 18th,
    // and 2 players of the 20th among the 20 new players of the 19th.
    expect(gameAnalytics.retentionDays).toEqual([
      { dayNumber: 1, retentionPercent: 10 },
      { dayNumber: 2, retentionPercent: 0 },
    ]);
  });

  it('gives the same advice as the weekly email', () => {
    const getInsight = (
      bouncedPlayersCount: number,
      d1RetainedPlayersCount: number
    ) =>
      getGameAnalytics(
        [
          createFakeGameMetrics('2026-11-20', {
            playersCount: 100,
            newPlayersCount: 50,
            bouncedPlayersCount,
            d1RetainedPlayersCount,
          }),
          createFakeGameMetrics('2026-11-19', {
            playersCount: 100,
            newPlayersCount: 100,
            bouncedPlayersCount,
            d1RetainedPlayersCount: 0,
          }),
        ],
        'week',
        { todayDate }
      ).insight;

    expect(getInsight(35, 50)).toBe('highBounce');
    expect(getInsight(34, 3)).toBe('lowRetention');
    expect(getInsight(34, 4)).toBe('readyToGrow');
  });

  it('marks the days with a Marketing Boost or a new build, and counts the players on a touch device', () => {
    const gameAnalytics = getGameAnalytics(
      [
        {
          ...createFakeGameMetrics('2026-11-19', {
            playersCount: 40,
            newPlayersCount: 20,
            bouncedPlayersCount: 4,
            d1RetainedPlayersCount: 0,
          }),
          platforms: {
            d0TouchPlayers: 30,
          },
        },
        // A day before the players were counted per platform.
        createFakeGameMetrics('2026-11-18', {
          playersCount: 60,
          newPlayersCount: 20,
          bouncedPlayersCount: 4,
          d1RetainedPlayersCount: 0,
        }),
      ],
      'week',
      {
        todayDate,
        gameFeaturings: [
          {
            gameId: 'game-id',
            featuring: 'games-platform-home',
            createdAt: Date.parse('2026-11-16T15:00:00Z') / 1000,
            updatedAt: Date.parse('2026-11-16T15:00:00Z') / 1000,
            expiresAt: Date.parse('2026-11-18T15:00:00Z') / 1000,
          },
        ],
        builds: [
          {
            id: 'build-id',
            userId: 'user-id',
            type: 'web-build',
            status: 'complete',
            updatedAt: Date.parse('2026-11-19T08:00:00Z'),
          },
        ],
      }
    );

    expect(
      gameAnalytics.overTime.map(point => point.hasMarketingBoost)
    ).toEqual([false, false, true, true, true, false, false]);
    expect(gameAnalytics.overTime.map(point => point.buildsCount)).toEqual([
      0,
      0,
      0,
      0,
      0,
      1,
      0,
    ]);
    expect(gameAnalytics.playerPlatforms).toEqual({
      touchPlayersPercent: 75,
    });
  });

  it('hides the rates of a game with too few players', () => {
    const gameAnalytics = getGameAnalytics(
      [
        createFakeGameMetrics('2026-11-19', {
          playersCount: 3,
          newPlayersCount: 2,
          bouncedPlayersCount: 3,
          d1RetainedPlayersCount: 1,
        }),
      ],
      'month',
      { todayDate }
    );

    expect(gameAnalytics.summary.playersCount).toBe(3);
    expect(gameAnalytics.summary.bounceRatePercent).toBe(null);
    expect(gameAnalytics.summary.playedDurationPerPlayerInSeconds).toBe(null);
    expect(gameAnalytics.previousSummary).toBe(null);
    expect(gameAnalytics.playedDurationSteps).toBe(null);
    expect(gameAnalytics.retentionDays).toBe(null);
    expect(gameAnalytics.playerPlatforms).toBe(null);
    expect(gameAnalytics.insight).toBe('fewPlayers');
    expect(gameAnalytics.overTime.length).toBe(30);
  });

  it('groups the days by week on long periods', () => {
    const gameAnalytics = getGameAnalytics(
      [
        createFakeGameMetrics('2026-11-19', {
          playersCount: 30,
          newPlayersCount: 20,
          bouncedPlayersCount: 6,
          d1RetainedPlayersCount: 0,
        }),
        createFakeGameMetrics('2026-11-13', {
          playersCount: 10,
          newPlayersCount: 10,
          bouncedPlayersCount: 2,
          d1RetainedPlayersCount: 0,
        }),
        createFakeGameMetrics('2026-11-12', {
          playersCount: 7,
          newPlayersCount: 7,
          bouncedPlayersCount: 7,
          d1RetainedPlayersCount: 0,
        }),
      ],
      'quarter',
      { todayDate }
    );

    expect(gameAnalytics.overTime.length).toBe(12);
    expect(gameAnalytics.overTime[11].playersCount).toBe(30);
    expect(gameAnalytics.overTime[10].playersCount).toBe(17);
  });
});
