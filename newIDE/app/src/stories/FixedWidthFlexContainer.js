// @flow
import * as React from 'react';

const style = {
  display: 'flex',
};

type Props = {
  children: React.Node,
  width: number | string,
  alignItems?: 'center',
  justifyContent?: 'center',
};

const FixedWidthFlexContainer = ({
  children,
  width,
  alignItems,
  justifyContent,
}: Props) => (
  <div style={{ ...style, width, alignItems, justifyContent }}>{children}</div>
);

export default FixedWidthFlexContainer;
