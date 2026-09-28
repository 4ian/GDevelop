// @flow
import * as React from 'react';

/**
 * Ask something again and again, at a pace, to something that answers later
 * (the running game, a server...): `request` is called at once, then every
 * `delayMs`, as long as `delayMs` is not null.
 *
 * A request is never sent while the previous one is still waiting for its
 * answer: a slow answer does not pile up requests. `request` can be a new
 * function at each render: the last one given is called, without restarting
 * the pace. Changing `resetKey` starts again at once (what is asked changed).
 *
 * Returns a function asking for a request right now: sent at once, or right
 * after the answer being waited for (never lost, never doubled).
 */
export const usePollingRequest = (
  request: () => Promise<mixed>,
  delayMs: number | null,
  resetKey?: string | number
): (() => void) => {
  const requestRef = React.useRef(request);
  requestRef.current = request;
  const requestNowRef = React.useRef<() => void>(() => {});

  React.useEffect(
    () => {
      if (delayMs === null) return;

      let isCancelled = false;
      let isInFlight = false;
      let isAskedAgain = false;
      const sendRequest = async () => {
        if (isInFlight) {
          isAskedAgain = true;
          return;
        }
        isInFlight = true;
        try {
          await requestRef.current();
        } catch (error) {
          console.error('A polled request failed:', error);
        } finally {
          isInFlight = false;
        }
        if (isAskedAgain && !isCancelled) {
          isAskedAgain = false;
          sendRequest();
        }
      };
      // A tick while waiting for an answer is only skipped: the next tick
      // will ask again.
      const onTick = () => {
        if (!isInFlight) sendRequest();
      };

      requestNowRef.current = sendRequest;
      sendRequest();
      const intervalId = setInterval(onTick, delayMs);
      return () => {
        isCancelled = true;
        clearInterval(intervalId);
        requestNowRef.current = () => {};
      };
    },
    [delayMs, resetKey]
  );

  return React.useCallback(() => requestNowRef.current(), []);
};
