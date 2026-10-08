// @flow
import { formatDuration } from './Duration';

/**
 * How the measures of the debugger (profiler, performance, resources, events
 * sheets) are written. A measure that could not be taken is a dash, never a
 * zero: a zero would claim something was measured.
 */

const BYTES_UNITS = ['B', 'kB', 'MB', 'GB', 'TB'];

/** Format bytes as "1.5 MB" (decimal units, one decimal above kB). */
export const formatBytes = (bytes: ?number): string => {
  if (bytes == null || !Number.isFinite(bytes)) return '-';
  if (bytes < 1000) return `${Math.round(bytes)} B`;
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1000 && unitIndex < BYTES_UNITS.length - 1) {
    value /= 1000;
    unitIndex++;
  }
  return `${value < 10 ? value.toFixed(2) : value.toFixed(1)} ${
    BYTES_UNITS[unitIndex]
  }`;
};

/** Format a duration as "1.25 ms" (two decimals by default). */
export const formatMilliseconds = (
  durationMs: ?number,
  decimalsCount: number = 2
): string =>
  durationMs == null || !Number.isFinite(durationMs)
    ? '-'
    : `${durationMs.toFixed(decimalsCount)} ms`;

/** Format a duration as "128 ms", or "2.30 s" past a second. */
export const formatShortDuration = (durationMs: ?number): string => {
  if (durationMs == null || !Number.isFinite(durationMs)) return '-';
  if (durationMs < 1000) return `${Math.round(durationMs)} ms`;
  return `${(durationMs / 1000).toFixed(2)} s`;
};

/** Format a duration as "0:42" (minutes and seconds), like a clock. */
export const formatClockDuration = (durationMs: number): string =>
  formatDuration(Math.max(0, Math.floor(durationMs / 1000)), {
    noNullDuration: false,
  });

/**
 * A difference with its sign ("+1.20 ms", "-0.50 ms"), "=" when there is
 * none, or a dash when it could not be measured.
 */
export const formatSignedDelta = (
  delta: ?number,
  format: (value: number) => string
): string => {
  if (delta == null || !Number.isFinite(delta)) return '-';
  if (delta === 0) return '=';
  return `${delta > 0 ? '+' : '-'}${format(Math.abs(delta))}`;
};

/** A difference in percent with its sign ("+12%", "-3%"). */
export const formatSignedPercent = (percent: number): string =>
  `${percent > 0 ? '+' : percent < 0 ? '-' : ''}${Math.abs(percent).toFixed(
    0
  )}%`;
