// @flow
import * as React from 'react';

/**
 * Returns a stable version of `value` that won't revert to `false` until at
 * least `minimumDuration` ms have passed since it last became `true`.
 * Useful to prevent UI elements from flashing when the underlying state
 * changes very quickly (e.g. a network call that completes in < 100ms).
 */
const useStableValue = ({
  minimumDuration,
  value,
}: {|
  minimumDuration: number,
  value: boolean,
|}): boolean => {
  const [stableValue, setStableValue] = React.useState(value);

  React.useEffect(
    () => {
      if (value) {
        setStableValue(true);
        return;
      }
      const timeout = setTimeout(() => setStableValue(false), minimumDuration);
      return () => clearTimeout(timeout);
    },
    [value, minimumDuration]
  );

  return stableValue;
};

export default useStableValue;
