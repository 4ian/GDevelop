// @flow

import { isNativeMobileApp } from './Platform';

/**
 * The vibrations given as feedback to touch gestures, as durations in
 * milliseconds (a list alternates vibrations and pauses). They are kept
 * short and distinct from each other: one light pulse when an item is
 * ready to be dragged or starts being dragged, two pulses when a long
 * press opens a menu.
 */
export const hapticPatterns = {
  itemReadyToDrag: [30],
  dragStarted: [50],
  longPress: [40, 60, 40],
};

export const hapticFeedback: ?({
  pattern: Array<number>,
}) => void = !isNativeMobileApp()
  ? ({ pattern }) => {
      try {
        if (window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(pattern);
        }
      } catch (error) {
        console.warn('Vibration API not supported:', error);
      }
    }
  : null;
