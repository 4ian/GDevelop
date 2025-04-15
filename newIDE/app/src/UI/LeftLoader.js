// @flow
import * as React from 'react';
import CircularProgress from './CircularProgress';

const styles = {
  container: { flexShrink: 0 },
  progress: { marginRight: 8, verticalAlign: 'middle' },
};

const LeftLoader = ({
  children,
  isLoading,
  reserveSpace,
}: {
  children: React.Node,
  isLoading: ?boolean,
  reserveSpace?: boolean,
}) => (
  <span style={styles.container}>
    {(isLoading || reserveSpace) && (
      <CircularProgress
        // From size 20, this component applied to a Dialog button triggers glitches
        // when rotating: the scrollbar appears and disappears each time the diagonal
        // of the square box containing the round SVG is vertical.
        size={18}
        style={styles.progress}
        variant={
          // Avoid animating the loader when it's not loading.
          isLoading ? 'indeterminate' : 'determinate'
        }
      />
    )}
    {children}
  </span>
);

export default LeftLoader;
