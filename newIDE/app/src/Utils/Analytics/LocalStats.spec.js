// @flow
import { countDailyAggregatedEventOccurrence } from './LocalStats';

const setSystemTime = (isoDate: string) => {
  // $FlowFixMe[prop-missing] - Missing in the Jest Flow types (v24).
  jest.setSystemTime(new Date(isoDate));
};

describe('LocalStats', () => {
  describe('countDailyAggregatedEventOccurrence', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    afterEach(() => {
      jest.useRealTimers();
    });

    it('reports only the first occurrence of each day, with the occurrences not reported before', () => {
      setSystemTime('2026-10-01T08:00:00Z');
      expect(countDailyAggregatedEventOccurrence('some-event')).toBe(1);
      expect(countDailyAggregatedEventOccurrence('some-event')).toBe(null);
      setSystemTime('2026-10-01T23:59:00Z');
      expect(countDailyAggregatedEventOccurrence('some-event')).toBe(null);

      setSystemTime('2026-10-03T10:00:00Z');
      expect(countDailyAggregatedEventOccurrence('some-event')).toBe(3);
      expect(countDailyAggregatedEventOccurrence('some-event')).toBe(null);

      setSystemTime('2026-10-04T10:00:00Z');
      expect(countDailyAggregatedEventOccurrence('some-event')).toBe(2);
    });

    it('counts each key separately', () => {
      setSystemTime('2026-10-01T08:00:00Z');
      expect(countDailyAggregatedEventOccurrence('event-a')).toBe(1);
      expect(countDailyAggregatedEventOccurrence('event-b')).toBe(1);
      expect(countDailyAggregatedEventOccurrence('event-a')).toBe(null);
      expect(countDailyAggregatedEventOccurrence('event-b')).toBe(null);
    });
  });
});
