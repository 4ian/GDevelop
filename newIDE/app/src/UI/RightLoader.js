// @flow
import * as React from 'react';
import CircularProgress from 'material-ui/CircularProgress';

export default ({
  children,
  isLoading,
}: {
  children: React.Node,
  isLoading: ?boolean,
}) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    {children}
    {isLoading && <CircularProgress size={20} style={{ marginLeft: 5 }} />}
  </div>
);
