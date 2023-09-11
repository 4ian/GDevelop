// @flow

import { isNativeMobileApp } from './Platform';

export const hapticFeedback: ?({
  durationInMs: number,
}) => void = !isNativeMobileApp()
  ? ({ durationInMs }) => {
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(durationInMs);
      }
    }
  : null;
