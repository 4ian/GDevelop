// @flow
import {
  formatBytes,
  formatMilliseconds,
  formatShortDuration,
  formatClockDuration,
  formatSignedDelta,
  formatSignedPercent,
} from './FormatMeasures';

describe('FormatMeasures', () => {
  it('formats bytes', () => {
    expect(formatBytes(null)).toBe('-');
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1500)).toBe('1.50 kB');
    expect(formatBytes(25 * 1000 * 1000)).toBe('25.0 MB');
  });

  it('formats milliseconds', () => {
    expect(formatMilliseconds(null)).toBe('-');
    expect(formatMilliseconds(NaN)).toBe('-');
    expect(formatMilliseconds(1.234)).toBe('1.23 ms');
    expect(formatMilliseconds(1.25, 1)).toBe('1.3 ms');
    expect(formatShortDuration(128.4)).toBe('128 ms');
    expect(formatShortDuration(2300)).toBe('2.30 s');
  });

  it('formats a duration like a clock', () => {
    expect(formatClockDuration(42800)).toBe('0:42');
    expect(formatClockDuration(125000)).toBe('2:05');
    expect(formatClockDuration(-10)).toBe('0:00');
  });

  it('keeps the sign of a difference', () => {
    expect(formatSignedDelta(null, formatMilliseconds)).toBe('-');
    expect(formatSignedDelta(0, formatMilliseconds)).toBe('=');
    expect(formatSignedDelta(1.2, formatMilliseconds)).toBe('+1.20 ms');
    expect(formatSignedDelta(-0.5, formatMilliseconds)).toBe('-0.50 ms');
    expect(formatSignedPercent(12.4)).toBe('+12%');
    expect(formatSignedPercent(-3.2)).toBe('-3%');
    expect(formatSignedPercent(0)).toBe('0%');
  });
});
