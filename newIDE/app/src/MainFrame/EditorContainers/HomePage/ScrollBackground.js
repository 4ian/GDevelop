// @flow
import * as React from 'react';
import { Paper } from '@material-ui/core';

const styles = {
  scrollContainer: {
    flex: 1,
    display: 'flex',
    overflowY: 'scroll',
  },
};

type Props = {|
  children: React.Node,
|};

const ScrollBackground = ({ children }: Props) => (
  <Paper
    style={{
      ...styles.scrollContainer,
    }}
    square
  >
    {children}
  </Paper>
);

export default ScrollBackground;
