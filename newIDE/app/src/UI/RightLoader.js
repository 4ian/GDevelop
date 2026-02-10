// @flow
import * as React from 'react';
import CircularProgress from './CircularProgress';

const styles = {
  progress: { marginLeft: 8, verticalAlign: 'middle' },
};

const RightLoader = ({
  children,
  isLoading,
}: {
  children: React.Node,
  isLoading: ?boolean,
// $FlowFixMe[signature-verification-failure]
}) => (
  <span>
    {children}
    {/* $FlowFixMe[incompatible-type] */}
    {isLoading && <CircularProgress size={20} style={styles.progress} />}
  </span>
);

export default RightLoader;
