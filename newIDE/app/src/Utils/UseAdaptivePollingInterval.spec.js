// @flow
import { getBackedOffIntervalInMs } from './UseAdaptivePollingInterval';

describe('UseAdaptivePollingInterval', () => {
  describe('getBackedOffIntervalInMs', () => {
    test('grows the interval by the backoff factor', () => {
      expect(getBackedOffIntervalInMs(1000, 5000)).toBe(1500);
      expect(getBackedOffIntervalInMs(1500, 5000)).toBe(2250);
    });
    test('never exceeds the maximum interval', () => {
      expect(getBackedOffIntervalInMs(4000, 5000)).toBe(5000);
      expect(getBackedOffIntervalInMs(5000, 5000)).toBe(5000);
    });
  });
});
