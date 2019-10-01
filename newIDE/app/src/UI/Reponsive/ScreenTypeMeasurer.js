// @flow
import * as React from 'react';

export type ScreenType = 'normal' | 'touch';

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

  return children(
    // TODO: do a real check to see if touchscreen or not
    window.innerWidth < 750 || window.innerHeight < 750 ? 'touch' : 'normal'
  );
};
