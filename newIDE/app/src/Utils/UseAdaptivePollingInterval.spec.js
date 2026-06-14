// @flow
import {
  getBackedOffIntervalInMs,
  getNextPollingIntervalInMs,
} from './UseAdaptivePollingInterval';

describe('UseAdaptivePollingInterval', () => {
  describe('getBackedOffIntervalInMs', () => {
    test('grows the interval by the backoff factor', () => {
      expect(getBackedOffIntervalInMs(1000, 5000)).toBe(1500);
      expect(getBackedOffIntervalInMs(1500, 5000)).toBe(2250);
      expect(getBackedOffIntervalInMs(1000, 5000, 2)).toBe(2000);
    });
    test('never exceeds the maximum interval', () => {
      expect(getBackedOffIntervalInMs(4000, 5000)).toBe(5000);
      expect(getBackedOffIntervalInMs(5000, 5000)).toBe(5000);
    });
  });

  describe('getNextPollingIntervalInMs', () => {
    test('snaps back to the base interval when there is activity', () => {
      expect(
        getNextPollingIntervalInMs({
          currentIntervalInMs: 5000,
          baseIntervalInMs: 1400,
          maxIntervalInMs: 5000,
          sawActivity: true,
        })
      ).toBe(1400);
    });
    test('backs off (capped) when there is no activity', () => {
      expect(
        getNextPollingIntervalInMs({
          currentIntervalInMs: 1400,
          baseIntervalInMs: 1400,
          maxIntervalInMs: 5000,
          sawActivity: false,
        })
      ).toBe(2100);
      expect(
        getNextPollingIntervalInMs({
          currentIntervalInMs: 4000,
          baseIntervalInMs: 1400,
          maxIntervalInMs: 5000,
          sawActivity: false,
        })
      ).toBe(5000);
    });
  });
});
