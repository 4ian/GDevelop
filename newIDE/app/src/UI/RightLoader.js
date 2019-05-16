// @flow
import * as React from 'react';
import CircularProgress from 'material-ui/CircularProgress';

const styles = {
  progress: { marginLeft: 8, verticalAlign: 'middle' },
};

export default ({
  children,
  isLoading,
}: {
  children: React.Node,
  isLoading: ?boolean,
}) => (
  <span>
    {children}
    {isLoading && <CircularProgress size={20} style={styles.progress} />}
  </span>
);
