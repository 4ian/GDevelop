// @flow
import * as React from 'react';

const styles = {
  container: {
    overflowY: 'scroll',
    flex: 1,
  },
};

type Props = {| children: React.Node |};

export default ({ children }: Props) => (
  <div style={{ ...styles.container }}>{children}</div>
);
