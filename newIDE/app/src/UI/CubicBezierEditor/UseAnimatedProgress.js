// @flow
import * as React from 'react';

/**
 * A progress going from 0 to 1 in `durationMs` each time `play` is called.
 * `play` keeps the same identity when the duration changes.
 */
export const useAnimatedProgress = (
  durationMs: number
): {| progress: number, play: () => void |} => {
  const [progress, setProgress] = React.useState(0);
  const frameRef = React.useRef<AnimationFrameID | null>(null);
  const durationMsRef = React.useRef(durationMs);
  durationMsRef.current = durationMs;

  const stop = React.useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  React.useEffect(() => stop, [stop]);

  const play = React.useCallback(
    () => {
      stop();
      const startedAt = performance.now();
      const playedDurationMs = durationMsRef.current;
      const step = (now: number) => {
        const nextProgress = Math.min(1, (now - startedAt) / playedDurationMs);
        setProgress(nextProgress);
        frameRef.current =
          nextProgress < 1 ? requestAnimationFrame(step) : null;
      };
      setProgress(0);
      frameRef.current = requestAnimationFrame(step);
    },
    [stop]
  );

  return { progress, play };
};
