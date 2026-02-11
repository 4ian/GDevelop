// @flow
import * as React from 'react';

// https://reactjs.org/docs/hooks-faq.html#is-there-something-like-forceupdate
export default function useForceUpdate() {
  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);

  return forceUpdate;
}

export function useForceRecompute() {
  const [recomputeTrigger, updateState] = React.useState({});
  const forceRecompute = React.useCallback(() => updateState({}), []);

  return [recomputeTrigger, forceRecompute];
}
