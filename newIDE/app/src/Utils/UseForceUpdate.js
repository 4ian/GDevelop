// @flow
import * as React from 'react';

export default function useForceUpdate() {
  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);

  return forceUpdate;
}
