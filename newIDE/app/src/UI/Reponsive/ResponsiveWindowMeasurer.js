// @flow
import * as React from 'react';
import useForceUpdate from '../../Utils/UseForceUpdate';
import useOnResize from '../../Utils/UseOnResize';

// Typically, small corresponds to mobile phones.
// Medium corresponds to tablets and small screens.
// Large corresponds to most laptop and desktop screens.
// Xlarge corresponds to large desktop screens.
export type WidthType = 'small' | 'medium' | 'large' | 'xlarge';

type Props = {|
  children: (width: WidthType) => React.Node,
|};

/**
 * Wraps useResponsiveWindowWidth in a component.
 */
export const ResponsiveWindowMeasurer = ({ children }: Props) =>
  children(useResponsiveWindowWidth());

/**
 * Return the size of the window.
 * This considers a window to be "small" if *both* the width and height
 * are small.
 */
export const useResponsiveWindowWidth = (): WidthType => {
  useOnResize(useForceUpdate());

  if (typeof window === 'undefined') {
    return 'medium';
  }

  return window.innerWidth < 500 || window.innerHeight < 500
    ? 'small'
    : window.innerWidth < 1150
    ? 'medium'
    : window.innerWidth < 1500
    ? 'large'
    : 'xlarge';
};
