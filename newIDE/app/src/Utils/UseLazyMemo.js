// @flow
import * as React from 'react';
import { useStableUpToDateRef } from './UseStableUpToDateCallback';

/**
 * Expose a getter that returns the value computed by the function, which
 * is then memoized as long as the function dependencies are stable.
 *
 * The function should be a React.useCallback - so that it is stable
 * and only recomputed when the dependencies change.
 *
 * During the computation, the previous value or null is returned.
 */
export const useAsyncLazyMemo = <T>(fn: () => Promise<T>): (() => T | null) => {
  const [value, setValue] = React.useState(null);
  const [requestedVersion, setRequestedVersion] = React.useState(0);
  const valueVersion = React.useRef(0);
  const isComputingForVersion = React.useRef<{ [version: number]: boolean }>(
    {}
  );
  const requestedVersionRef = useStableUpToDateRef(requestedVersion);

  // If the function changes, it means that the value is no longer valid.
  // We increment the requested version.
  React.useEffect(
    () => {
      setRequestedVersion(requestedVersion => {
        return requestedVersion + 1;
      });
    },
    [fn]
  );

  // If the function changes, we need to recompute the value.
  // If the value changed, the getter is also invalidated so it can be called again by components
  // depending on it.
  const getter = React.useCallback(
    () => {
      // Recompute the value if its version is older than the requested version
      // or if it's not even set.
      const shouldCompute =
        valueVersion.current < requestedVersion || value === null;

      if (shouldCompute && !isComputingForVersion.current[requestedVersion]) {
        isComputingForVersion.current[requestedVersion] = true;
        fn()
          .then(result => {
            // Update the version of the value only if the computation is still
            // for the same version that is requested.
            if (requestedVersion === requestedVersionRef.current) {
              setValue(result);
              valueVersion.current = requestedVersion;
            }
          })
          .finally(() => {
            // We're done computing the value for this version.
            delete isComputingForVersion.current[requestedVersion];
          });
      }

      return value;
    },
    [value, fn, requestedVersion, requestedVersionRef]
  );

  return getter;
};

/**
 * Expose a getter that returns the value computed by the function, which
 * is then memoized as long as the function dependencies are stable.
 *
 * The function should be a React.useCallback - so that it is stable
 * and only recomputed when the dependencies change.
 */
export const useLazyMemo = <T>(fn: () => T): (() => T | null) => {
  return useAsyncLazyMemo(React.useCallback(() => Promise.resolve(fn()), [fn]));
};
