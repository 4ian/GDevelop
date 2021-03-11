// @flow
import * as React from 'react';
import useForceUpdate from '../../Utils/UseForceUpdate';
import { useOnResize } from '../../Utils/UseOnResize';

export type WidthType = 'small' | 'medium' | 'large';

type Props = {|
  children: (width: WidthType) => React.Node,
|};

/**
 * Pass the proper size to the children according to the window size.
 * This considers a window to be "small" if *both* the width and height
 * are small.
 */
export const ResponsiveWindowMeasurer = ({ children }: Props) => {
  useOnResize(useForceUpdate());
  const width = useResponsiveWindowWidth();

  return children(width);
};

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

  return window.innerWidth < 750 || window.innerHeight < 350
    ? 'small'
    : window.innerWidth < 1150
    ? 'medium'
    : 'large';
};
