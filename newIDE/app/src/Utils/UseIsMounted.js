// @flow
import * as React from 'react';

/**
 * Returns a React "ref" telling if the component is "mounted" or not. While this is
 * usually an anti pattern to rely on this, it can be useful when having to "cancel"
 * promises/network dependent effects.
 */
export const useIsMounted = (): {| current: boolean |} => {
  const isMounted = React.useRef<boolean>(false);
  React.useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  return isMounted;
};
