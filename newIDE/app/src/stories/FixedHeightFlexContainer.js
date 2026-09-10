// @flow
import * as React from 'react';

const style = {
  display: 'flex',
};

type Props = {
  children: React.Node,
  height: number | string,
  width?: number | string,
  alignItems?: 'center',
  justifyContent?: 'center',
};

const FixedHeightFlexContainer = ({
  children,
  height,
  width,
  alignItems,
  justifyContent,
}: Props): React.MixedElement => (
  <div style={{ ...style, height, width, alignItems, justifyContent }}>
    {children}
  </div>
);

export default FixedHeightFlexContainer;
