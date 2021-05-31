// @flow
import * as React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';

const styles = {
  progress: { marginRight: 8, verticalAlign: 'middle' },
};

export default ({
  children,
  isLoading,
}: {
  children: React.Node,
  isLoading: ?boolean,
}): React.Element<'span'> => (
  <span>
    {isLoading && <CircularProgress size={20} style={styles.progress} />}
    {children}
  </span>
);
