// @flow
import * as React from 'react';
import { useStableUpToDateCallback } from './UseStableUpToDateCallback';

export const useTriggerAtNextRender = (callback: () => Promise<void>) => {
  const stableUpToDateCallback = useStableUpToDateCallback(callback);
  const [trigger, updateTrigger] = React.useState(0);
  const triggerAtNextRender = React.useCallback(() => {
    updateTrigger(trigger => trigger + 1);
  }, []);

  React.useEffect(
    () => {
      stableUpToDateCallback();
    },
    [trigger, stableUpToDateCallback]
  );
  return triggerAtNextRender;
};
