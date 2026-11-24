// @flow
import * as React from 'react';
import PlaceholderLoader from './PlaceholderLoader';

const styles = {
  containerStyle: {
    display: 'flex',
    flex: 1,
  },
};

type Props = {|
  /**
   * How long the space stays blank before the loader appears. A short wait
   * feels instantaneous without a spinner, a longer one needs the feedback.
   */
  delayMs?: number,
  size?: number,
  style?: any,
|};

/**
 * A centered loader that only appears after a delay: the space is left blank
 * until then, so that short loadings are not flashing a spinner.
 */
const DelayedPlaceholderLoader = ({
  delayMs = 1500,
  size,
  style,
}: Props): React.Node => {
  const [isVisible, setIsVisible] = React.useState<boolean>(false);
  React.useEffect(
    () => {
      const timeoutId = setTimeout(() => setIsVisible(true), delayMs);
      return () => clearTimeout(timeoutId);
    },
    [delayMs]
  );

  return isVisible ? (
    <PlaceholderLoader size={size} style={style} />
  ) : (
    <div style={{ ...styles.containerStyle, ...style }} />
  );
};

export default DelayedPlaceholderLoader;
