// @flow
import * as React from 'react';

const styles = {
  overflowY: 'scroll',
};

type Props = {| children: React.Node |};

export default ({ children }: Props) => <div style={styles}>{children}</div>;
