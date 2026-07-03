// @flow
import * as React from 'react';

const BACKOFF_FACTOR = 1.5;

/** Back off an interval by a fixed factor, capped at `maxIntervalInMs`. */
export const getBackedOffIntervalInMs = (
  currentIntervalInMs: number,
  maxIntervalInMs: number
): number =>
  Math.min(Math.round(currentIntervalInMs * BACKOFF_FACTOR), maxIntervalInMs);

/**
 * Adaptive polling interval: stays at `baseIntervalInMs` while active and backs
 * off up to `maxIntervalInMs` when idle. Call `reportTick(sawActivity)` once per
 * poll (true resets to fast, false backs off) and `resetToBase()` to reset.
 */
export const useAdaptivePollingInterval = ({
  baseIntervalInMs,
  maxIntervalInMs,
}: {|
  baseIntervalInMs: number,
  maxIntervalInMs: number,
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
        sawActivity
          ? baseIntervalInMs
          : getBackedOffIntervalInMs(currentIntervalInMs, maxIntervalInMs)
      );
    },
    [baseIntervalInMs, maxIntervalInMs]
  );

  return { intervalInMs, reportTick, resetToBase };
};
