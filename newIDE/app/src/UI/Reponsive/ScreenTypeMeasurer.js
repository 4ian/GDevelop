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
 * Wraps useScreenType in a component.
 */
export const ScreenTypeMeasurer = ({ children }: Props) =>
  children(useScreenType());

/**
 * Return if the screen is a touchscreen or not.
 */
export const useScreenType = (): ScreenType => {
  // Note: this is not a React hook but is named as one to encourage
  // components to use it as such, so that it could be reworked
  // at some point to use a context (verify in this case all usages).
  if (typeof window === 'undefined') return 'normal';

  return userHasTouchedScreen ? 'touch' : 'normal';
};
