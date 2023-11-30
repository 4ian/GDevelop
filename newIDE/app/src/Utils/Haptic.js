// @flow

import { isNativeMobileApp } from './Platform';

export const hapticFeedback: ?({
  durationInMs: number,
}) => void = !isNativeMobileApp()
  ? ({ durationInMs }) => {
      try {
        if (window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(durationInMs);
        }
      } catch (error) {
        console.warn('Vibration API not supported:', error);
      }
    }
  : null;
