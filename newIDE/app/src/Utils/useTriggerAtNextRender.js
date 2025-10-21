// @flow
import * as React from 'react';
import { useStableUpToDateCallback } from './UseStableUpToDateCallback';

export const useTriggerAtNextRender = <Args>(
  callback: (args: Args | null) => Promise<void>
): ((args: Args) => void) => {
  const stableUpToDateCallback = useStableUpToDateCallback(callback);
  const [trigger, updateTrigger] = React.useState(0);
  const [args, setArgs] = React.useState<Args | null>(null);
  const triggerAtNextRender = React.useCallback((args: Args) => {
    setArgs(args);
    updateTrigger(trigger => trigger + 1);
  }, []);

  React.useEffect(
    () => {
      stableUpToDateCallback(args);
    },
    [trigger, args, stableUpToDateCallback]
  );
  return triggerAtNextRender;
};
