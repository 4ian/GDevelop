// @flow
import * as React from 'react';

export default function useForceUpdate(): () => void {
  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);

  return forceUpdate;
}
