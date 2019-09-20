// @flow
import * as React from 'react';

export type WidthType = 'small' | 'medium' | 'large';

type Props = {|
  children: (width: WidthType) => React.Node,
|};

/**
 * Pass the proper width to the children according to the window width.
 * Could be improved with react-measure to only compute the available width
 * for the component, but at least this implementation is very simple and not
 * involving obscure and fragile DOM measurements.
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
