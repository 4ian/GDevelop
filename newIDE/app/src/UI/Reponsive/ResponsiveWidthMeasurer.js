// @flow
import * as React from 'react';

export type WidthType = 'small' | 'medium' | 'large';

type Props = {|
  children: (width: WidthType) => React.Node,
|};

/**
 * Pass the proper size to the children according to the window size.
 * This is only considering the window width.
 */
export const ResponsiveWidthMeasurer = ({ children }: Props) => {
  if (typeof window === 'undefined') {
    return children('medium');
  }

  return children(
    window.innerWidth < 750
      ? 'small'
      : window.innerWidth < 1150
      ? 'medium'
      : 'large'
  );
};
