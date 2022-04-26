// @flow

const {
  formatDuration,
  formatCustomScore,
} = require('./LeaderboardScoreFormatter');

describe('LeaderboardScoreFormatter', () => {
  describe('formatDuration', () => {
    test('it correctly formats whole seconds', () => {
      expect(formatDuration(81, ['second'])).toEqual('81');
      expect(formatDuration(15, ['second'])).toEqual('15');
      expect(formatDuration(8, ['second'])).toEqual('08');
    });
    test('it correctly formats seconds without milliseconds', () => {
      expect(formatDuration(81.29, ['second'])).toEqual('81');
      expect(formatDuration(15.677, ['second'])).toEqual('15');
      expect(formatDuration(8.045, ['second'])).toEqual('08');
    });
    test('it correctly formats seconds with milliseconds', () => {
      expect(formatDuration(81.29, ['second', 'millisecond'])).toEqual(
        '81.290'
      );
      expect(formatDuration(15.677, ['second', 'millisecond'])).toEqual(
        '15.677'
      );
      expect(formatDuration(8.045, ['second', 'millisecond'])).toEqual(
        '08.045'
      );
    });

    test('it correctly formats whole hours', () => {
      expect(formatDuration(39 * 3600, ['hour'])).toEqual('39');
      expect(formatDuration(15 * 3600, ['hour'])).toEqual('15');
      expect(formatDuration(8 * 3600, ['hour'])).toEqual('08');
    });
    test('it correctly formats hours without lower units', () => {
      expect(
        formatDuration(39 * 3600 + Math.random() * 15 * 60, ['hour'])
      ).toEqual('39');
      expect(
        formatDuration(15 * 3600 + Math.random() * 15 * 60, ['hour'])
      ).toEqual('15');
      expect(
        formatDuration(8 * 3600 + Math.random() * 15 * 60, ['hour'])
      ).toEqual('08');
    });
    test('it correctly formats hours with minutes', () => {
      expect(
        formatDuration(39 * 3600 + 13 * 60 + 6 + 0.134, ['hour', 'minute'])
      ).toEqual('39:13');
      expect(
        formatDuration(15 * 3600 + 45 * 60 + 56 + 0.98332, ['hour', 'minute'])
      ).toEqual('15:45');
      expect(
        formatDuration(8 * 3600 + 9 * 60 + 0.05, ['hour', 'minute'])
      ).toEqual('08:09');
    });
    test('it correctly formats hours with minutes and seconds', () => {
      expect(
        formatDuration(39 * 3600 + 13 * 60 + 6 + 0.134, [
          'hour',
          'minute',
          'second',
        ])
      ).toEqual('39:13:06');
      expect(
        formatDuration(15 * 3600 + 45 * 60 + 56 + 0.98332, [
          'hour',
          'minute',
          'second',
        ])
      ).toEqual('15:45:56');
      expect(
        formatDuration(8 * 3600 + 9 * 60 + 0.05, ['hour', 'minute', 'second'])
      ).toEqual('08:09:00');
    });
    test('it correctly formats hours with minutes, seconds and milliseconds', () => {
      expect(
        formatDuration(39 * 3600 + 13 * 60 + 6 + 0.134, [
          'hour',
          'minute',
          'second',
          'millisecond',
        ])
      ).toEqual('39:13:06.134');
      expect(
        formatDuration(15 * 3600 + 45 * 60 + 56 + 0.98352, [
          'hour',
          'minute',
          'second',
          'millisecond',
        ])
      ).toEqual('15:45:56.984');
      expect(
        formatDuration(8 * 3600 + 9 * 60 + 0.05, [
          'hour',
          'minute',
          'second',
          'millisecond',
        ])
      ).toEqual('08:09:00.050');
    });
  });

  describe('formatCustomScore', () => {
    test('it correctly formats score without prefix nor suffix, with 0 decimal places', () => {
      expect(
        formatCustomScore(39, {
          type: 'custom',
          scorePrefix: '',
          scoreSuffix: '',
          decimalPlacesNumber: 0
        })
      ).toEqual('39');
      expect(
        formatCustomScore(0.1, {
          type: 'custom',
          scorePrefix: '',
          scoreSuffix: '',
          decimalPlacesNumber: 0
        })
      ).toEqual('0');
    });
    test('it correctly formats score with prefix or suffix, with 0 decimal places', () => {
      expect(
        formatCustomScore(39, {
          type: 'custom',
          scorePrefix: '$ ',
          scoreSuffix: '',
          decimalPlacesNumber: 0
        })
      ).toEqual('$ 39');
      expect(
        formatCustomScore(0.1, {
          type: 'custom',
          scorePrefix: '',
          scoreSuffix: 'coins',
          decimalPlacesNumber: 0
        })
      ).toEqual('0coins');
    });
    test('it correctly formats score with prefix or suffix, with decimal places', () => {
      expect(
        formatCustomScore(39, {
          type: 'custom',
          scorePrefix: '$ ',
          scoreSuffix: '',
          decimalPlacesNumber: 2
        })
      ).toEqual('$ 39.00');
      expect(
        formatCustomScore(0.1, {
          type: 'custom',
          scorePrefix: '',
          scoreSuffix: 'coins',
          decimalPlacesNumber: 2
        })
      ).toEqual('0.10coins');
      expect(
        formatCustomScore(0.185462, {
          type: 'custom',
          scorePrefix: '',
          scoreSuffix: 'coins',
          decimalPlacesNumber: 2
        })
      ).toEqual('0.19coins');
    });
  });
});
