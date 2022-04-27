// @flow

const {
  formatDuration,
  formatCustomScore,
} = require('./LeaderboardScoreFormatter');

describe('LeaderboardScoreFormatter', () => {
  describe('formatDuration', () => {
    test('it correctly formats whole seconds', () => {
      expect(
        formatDuration(81, {
          type: 'time',
          smallestUnit: 'second',
          biggestUnit: 'second',
        })
      ).toEqual('81');
      expect(
        formatDuration(15, {
          type: 'time',
          smallestUnit: 'second',
          biggestUnit: 'second',
        })
      ).toEqual('15');
      expect(
        formatDuration(8, {
          type: 'time',
          smallestUnit: 'second',
          biggestUnit: 'second',
        })
      ).toEqual('08');
    });
    test('it correctly formats seconds without milliseconds', () => {
      expect(
        formatDuration(81.29, {
          type: 'time',
          smallestUnit: 'second',
          biggestUnit: 'second',
        })
      ).toEqual('81');
      expect(
        formatDuration(15.677, {
          type: 'time',
          smallestUnit: 'second',
          biggestUnit: 'second',
        })
      ).toEqual('15');
      expect(
        formatDuration(8.045, {
          type: 'time',
          smallestUnit: 'second',
          biggestUnit: 'second',
        })
      ).toEqual('08');
    });
    test('it correctly formats seconds with milliseconds', () => {
      expect(
        formatDuration(81.29, {
          type: 'time',
          biggestUnit: 'second',
          smallestUnit: 'millisecond',
        })
      ).toEqual('81.290');
      expect(
        formatDuration(15.677, {
          type: 'time',
          biggestUnit: 'second',
          smallestUnit: 'millisecond',
        })
      ).toEqual('15.677');
      expect(
        formatDuration(8.045, {
          type: 'time',
          biggestUnit: 'second',
          smallestUnit: 'millisecond',
        })
      ).toEqual('08.045');
    });

    test('it correctly formats whole hours', () => {
      expect(
        formatDuration(39 * 3600, {
          type: 'time',
          biggestUnit: 'hour',
          smallestUnit: 'hour',
        })
      ).toEqual('39');
      expect(
        formatDuration(15 * 3600, {
          type: 'time',
          biggestUnit: 'hour',
          smallestUnit: 'hour',
        })
      ).toEqual('15');
      expect(
        formatDuration(8 * 3600, {
          type: 'time',
          biggestUnit: 'hour',
          smallestUnit: 'hour',
        })
      ).toEqual('08');
    });
    test('it correctly formats hours without lower units', () => {
      expect(
        formatDuration(39 * 3600 + Math.random() * 15 * 60, {
          type: 'time',
          biggestUnit: 'hour',
          smallestUnit: 'hour',
        })
      ).toEqual('39');
      expect(
        formatDuration(15 * 3600 + Math.random() * 15 * 60, {
          type: 'time',
          biggestUnit: 'hour',
          smallestUnit: 'hour',
        })
      ).toEqual('15');
      expect(
        formatDuration(8 * 3600 + Math.random() * 15 * 60, {
          type: 'time',
          biggestUnit: 'hour',
          smallestUnit: 'hour',
        })
      ).toEqual('08');
    });
    test('it correctly formats hours with minutes', () => {
      expect(
        formatDuration(39 * 3600 + 13 * 60 + 6 + 0.134, {
          type: 'time',
          biggestUnit: 'hour',
          smallestUnit: 'minute',
        })
      ).toEqual('39:13');
      expect(
        formatDuration(15 * 3600 + 45 * 60 + 56 + 0.98332, {
          type: 'time',
          biggestUnit: 'hour',
          smallestUnit: 'minute',
        })
      ).toEqual('15:45');
      expect(
        formatDuration(8 * 3600 + 9 * 60 + 0.05, {
          type: 'time',
          biggestUnit: 'hour',
          smallestUnit: 'minute',
        })
      ).toEqual('08:09');
    });
    test('it correctly formats hours with minutes and seconds', () => {
      expect(
        formatDuration(39 * 3600 + 13 * 60 + 6 + 0.134, {
          type: 'time',
          biggestUnit: 'hour',
          smallestUnit: 'second',
        })
      ).toEqual('39:13:06');
      expect(
        formatDuration(15 * 3600 + 45 * 60 + 56 + 0.98332, {
          type: 'time',
          biggestUnit: 'hour',
          smallestUnit: 'second',
        })
      ).toEqual('15:45:56');
      expect(
        formatDuration(8 * 3600 + 9 * 60 + 0.05, {
          type: 'time',
          biggestUnit: 'hour',
          smallestUnit: 'second',
        })
      ).toEqual('08:09:00');
    });
    test('it correctly formats hours with minutes, seconds and milliseconds', () => {
      expect(
        formatDuration(39 * 3600 + 13 * 60 + 6 + 0.134, {
          type: 'time',
          biggestUnit: 'hour',
          smallestUnit: 'millisecond',
        })
      ).toEqual('39:13:06.134');
      expect(
        formatDuration(15 * 3600 + 45 * 60 + 56 + 0.98352, {
          type: 'time',
          biggestUnit: 'hour',
          smallestUnit: 'millisecond',
        })
      ).toEqual('15:45:56.984');
      expect(
        formatDuration(8 * 3600 + 9 * 60 + 0.05, {
          type: 'time',
          biggestUnit: 'hour',
          smallestUnit: 'millisecond',
        })
      ).toEqual('08:09:00.050');
    });
  });

  describe('formatCustomScore', () => {
    test('it correctly formats score without prefix nor suffix, with 0 decimal places', () => {
      expect(
        formatCustomScore(39, {
          type: 'custom',
          prefix: '',
          suffix: '',
          precision: 0,
        })
      ).toEqual('39');
      expect(
        formatCustomScore(0.1, {
          type: 'custom',
          prefix: '',
          suffix: '',
          precision: 0,
        })
      ).toEqual('0');
    });
    test('it correctly formats score with prefix or suffix, with 0 decimal places', () => {
      expect(
        formatCustomScore(39, {
          type: 'custom',
          prefix: '$ ',
          suffix: '',
          precision: 0,
        })
      ).toEqual('$ 39');
      expect(
        formatCustomScore(0.1, {
          type: 'custom',
          prefix: '',
          suffix: 'coins',
          precision: 0,
        })
      ).toEqual('0coins');
    });
    test('it correctly formats score with prefix or suffix, with decimal places', () => {
      expect(
        formatCustomScore(39, {
          type: 'custom',
          prefix: '$ ',
          suffix: '',
          precision: 2,
        })
      ).toEqual('$ 39.00');
      expect(
        formatCustomScore(0.1, {
          type: 'custom',
          prefix: '',
          suffix: 'coins',
          precision: 2,
        })
      ).toEqual('0.10coins');
      expect(
        formatCustomScore(0.185462, {
          type: 'custom',
          prefix: '',
          suffix: 'coins',
          precision: 2,
        })
      ).toEqual('0.19coins');
    });
    test('it correctly formats score with prefix or suffix, with decimal places', () => {
      expect(
        formatCustomScore(250, {
          type: 'custom',
          prefix: '$ ',
          suffix: '',
          precision: -1,
        })
      ).toEqual('$ 250');
      expect(
        formatCustomScore(6432, {
          type: 'custom',
          prefix: '',
          suffix: 'coins',
          precision: -2,
        })
      ).toEqual('6400coins');
      expect(
        formatCustomScore(315, {
          type: 'custom',
          prefix: '',
          suffix: 'coins',
          precision: -3,
        })
      ).toEqual('0coins');
    });
  });
});
