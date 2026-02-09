// @flow
import * as React from 'react';

function getOnlineStatus() {
  return typeof navigator !== 'undefined' &&
    typeof navigator.onLine === 'boolean'
    ? navigator.onLine
    : true;
}

/**
 * React Hook listening to the navigator online status.
 */
export const useOnlineStatus = (): boolean => {
  const [onlineStatus, setOnlineStatus] = React.useState(getOnlineStatus());

  const goOnline = () => setOnlineStatus(true);

  const goOffline = () => setOnlineStatus(false);

  React.useEffect(() => {
    // $FlowFixMe[cannot-resolve-name]
    window.addEventListener('online', goOnline);
    // $FlowFixMe[cannot-resolve-name]
    window.addEventListener('offline', goOffline);

    return () => {
      // $FlowFixMe[cannot-resolve-name]
      window.removeEventListener('online', goOnline);
      // $FlowFixMe[cannot-resolve-name]
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return onlineStatus;
};
