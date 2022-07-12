// @flow
import * as React from 'react';
import CircularProgress from './CircularProgress';

const styles = {
  progress: { marginRight: 8, verticalAlign: 'middle' },
};

const LeftLoader = ({
  children,
  isLoading,
}: {
  children: React.Node,
  isLoading: ?boolean,
}) => (
  <span>
    {isLoading && <CircularProgress size={20} style={styles.progress} />}
    {children}
  </span>
);

export default LeftLoader;
