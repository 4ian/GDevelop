// @flow
import * as React from 'react';

const styles = {
  container: {
    overflowY: 'scroll',
    flex: 1,
  },
};

type Props = {| children: React.Node, style?: ?Object |};

export default ({ children, style }: Props) => (
  <div style={{ ...styles.container, ...style }}>{children}</div>
);
