// @flow
import * as React from 'react';

/**
 * Back off an interval by `backoffFactor`, capped at `maxIntervalInMs`.
 */
export const getBackedOffIntervalInMs = (
  currentIntervalInMs: number,
  maxIntervalInMs: number,
  backoffFactor?: number = 1.5
): number =>
  Math.min(Math.round(currentIntervalInMs * backoffFactor), maxIntervalInMs);

/**
 * Compute the next polling interval: snap back to `baseIntervalInMs` when there
 * was activity this tick, otherwise back off (up to `maxIntervalInMs`).
 */
export const getNextPollingIntervalInMs = ({
  currentIntervalInMs,
  baseIntervalInMs,
  maxIntervalInMs,
  sawActivity,
  backoffFactor,
}: {|
  currentIntervalInMs: number,
  baseIntervalInMs: number,
  maxIntervalInMs: number,
  sawActivity: boolean,
  backoffFactor?: number,
|}): number =>
  sawActivity
    ? baseIntervalInMs
    : getBackedOffIntervalInMs(
        currentIntervalInMs,
        maxIntervalInMs,
        backoffFactor
      );

/**
 * Manage an adaptive polling interval as React state. The interval stays at the
 * fast `baseIntervalInMs` while activity is observed and backs off up to
 * `maxIntervalInMs` during idle periods — so a frequent poller costs fewer
 * requests when nothing is happening, without adding latency when something is.
 *
 * Usage: call `reportTick(sawActivity)` once per poll (`true` resets to the base
 * interval, `false` backs off), and `resetToBase()` to force the fast interval
 * (e.g. when a new entity starts being polled). Returning the same value is a
 * no-op for React, so a stable interval does not trigger re-renders.
 */
export const useAdaptivePollingInterval = ({
  baseIntervalInMs,
  maxIntervalInMs,
  backoffFactor,
}: {|
  baseIntervalInMs: number,
  maxIntervalInMs: number,
  backoffFactor?: number,
|}): {|
  intervalInMs: number,
  reportTick: (sawActivity: boolean) => void,
  resetToBase: () => void,
|} => {
  const [intervalInMs, setIntervalInMs] = React.useState<number>(
    baseIntervalInMs
  );

  const resetToBase = React.useCallback(
    () => {
      setIntervalInMs(baseIntervalInMs);
    },
    [baseIntervalInMs]
  );

  const reportTick = React.useCallback(
    (sawActivity: boolean) => {
      setIntervalInMs(currentIntervalInMs =>
        getNextPollingIntervalInMs({
          currentIntervalInMs,
          baseIntervalInMs,
          maxIntervalInMs,
          sawActivity,
          backoffFactor,
        })
      );
    },
    [baseIntervalInMs, maxIntervalInMs, backoffFactor]
  );

  return { intervalInMs, reportTick, resetToBase };
};
