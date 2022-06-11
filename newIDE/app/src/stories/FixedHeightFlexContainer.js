// @flow
import * as React from 'react';

const style = {
  display: 'flex',
};

type Props = {
  children: React.Node,
  height: number | string,
  alignItems?: 'center',
  justifyContent?: 'center',
};

export default ({ children, height, alignItems, justifyContent }: Props) => (
  <div style={{ ...style, height, alignItems, justifyContent }}>{children}</div>
);
