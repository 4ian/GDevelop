// @flow
import * as React from 'react';

export type WidthType = 'small' | 'medium' | 'large';

type Props = {|
  children: (width: WidthType) => React.Node,
|};

/**
 * Pass the proper size to the children according to the window size.
 * This consider a window to be "small" if *both* the width and height
 * are small.
 */
export const ResponsiveWindowMeasurer = ({ children }: Props) => {
  if (typeof window === 'undefined') {
    return children('medium');
  }

  return children(
    window.innerWidth < 750 || window.innerHeight < 750
      ? 'small'
      : window.innerWidth < 1150
      ? 'medium'
      : 'large'
  );
};
