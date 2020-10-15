// @flow
import * as React from 'react';

export type WidthType = 'small' | 'medium' | 'large';

type Props = {|
  children: (width: WidthType) => React.Node,
|};

const useForceUpdate = () => {
  const [value, setValue] = React.useState(true);
  return () => setValue(value => !value);
};

/**
 * Pass the proper size to the children according to the window size.
 * This consider a window to be "small" if *both* the width and height
 * are small.
 */
export const ResponsiveWindowMeasurer = ({ children }: Props) => {
  const forceUpdate = useForceUpdate();

  React.useEffect(() => {
    // Use timeouts to only rerender when the resize is finished.
    let timeout;
    const listener = window.addEventListener('resize', () => {
      clearTimeout(timeout);
      timeout = setTimeout(forceUpdate, 200);
    });

    return () => window.removeEventListener('resize', listener);
  });

  if (typeof window === 'undefined') {
    return children('medium');
  }

  return children(
    window.innerWidth < 750 || window.innerHeight < 350
      ? 'small'
      : window.innerWidth < 1150
      ? 'medium'
      : 'large'
  );
};
