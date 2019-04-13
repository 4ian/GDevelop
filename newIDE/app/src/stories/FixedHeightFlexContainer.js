import * as React from 'react';

const style = {
  display: 'flex',
};

type Props = {
  children: React.Node,
  height: number | string,
};

export default ({ children, height }: Props) => (
  <div style={{ ...style, height }}>{children}</div>
);
