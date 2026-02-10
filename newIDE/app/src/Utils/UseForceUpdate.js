// @flow
import * as React from 'react';

// https://reactjs.org/docs/hooks-faq.html#is-there-something-like-forceupdate
// $FlowFixMe[signature-verification-failure]
export default function useForceUpdate() {
  const [, updateState] = React.useState();
  // $FlowFixMe[incompatible-type]
  const forceUpdate = React.useCallback(() => updateState({}), []);

  return forceUpdate;
}

// $FlowFixMe[signature-verification-failure]
export function useForceRecompute() {
  const [recomputeTrigger, updateState] = React.useState({});
  const forceRecompute = React.useCallback(() => updateState({}), []);

  return [recomputeTrigger, forceRecompute];
}
