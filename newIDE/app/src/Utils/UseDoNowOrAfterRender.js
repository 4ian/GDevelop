// @flow
import * as React from 'react';

export const useDoNowOrAfterRender = <T>(ref: {|
  current: T,
|}): (((T) => void) => void) => {
  const [
    shouldTriggerAfterRender,
    setShouldTriggerAfterRender,
  ] = React.useState<null | (T => void)>(null);

  const doNowOrAfterRender = React.useCallback(
    (callback: T => void) => {
      if (ref.current) {
        callback(ref.current);
      } else {
        setShouldTriggerAfterRender((): (T => void) => callback);
      }
    },
    [ref]
  );

  React.useEffect(
    () => {
      if (shouldTriggerAfterRender) {
        if (ref.current) shouldTriggerAfterRender(ref.current);
        setShouldTriggerAfterRender(null);
      }
    },
    [shouldTriggerAfterRender, ref]
  );

  return doNowOrAfterRender;
};
