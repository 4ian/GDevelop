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
    {isLoading && <CircularProgress size={20} style={{ marginRight: 5 }} />}
    {children}
  </div>
);
