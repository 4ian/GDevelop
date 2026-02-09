// @flow

import { isNativeMobileApp } from './Platform';

export const hapticFeedback: ?({
  durationInMs: number,
}) => void = !isNativeMobileApp()
  ? ({ durationInMs }) => {
      try {
        // $FlowFixMe[cannot-resolve-name]
        if (window.navigator && window.navigator.vibrate) {
          // $FlowFixMe[cannot-resolve-name]
          window.navigator.vibrate(durationInMs);
        }
      } catch (error) {
        console.warn('Vibration API not supported:', error);
      }
    }
  : null;
