// @flow
import * as React from 'react';

export type ScreenType = 'normal' | 'touch';

let userHasTouchedScreen = false;
if (typeof window !== 'undefined') {
  window.addEventListener(
    'touchstart',
    function onFirstTouch() {
      console.info('Touch detected, considering the screen as touch enabled.');
      userHasTouchedScreen = true;
      window.removeEventListener('touchstart', onFirstTouch, false);
    },
    false
  );
}

type Props = {|
  children: (screenType: ScreenType) => React.Node,
|};

/**
 * Check if the screen is a touchscreen or not.
 */
export const ScreenTypeMeasurer = ({ children }: Props) => {
  if (typeof window === 'undefined') {
    return children('normal');
  }

  return children(userHasTouchedScreen ? 'touch' : 'normal');
};

export const useScreenType = () => {
  return userHasTouchedScreen ? 'touch' : 'normal';
};
