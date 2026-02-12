// @flow
import * as React from 'react';
import Text from './Text';

const style = {
  display: 'flex',
  alignItems: 'center',
  paddingLeft: 8,
  paddingRight: 8,
};

type MiniToolbarProps = {|
  justifyContent?: 'flex-start' | 'flex-end' | 'center',
  noPadding?: boolean,
  children: React.Node,
|};

const MiniToolbar = ({
  justifyContent,
  children,
  noPadding,
}: MiniToolbarProps) => (
  <div
    style={{
      ...style,
      ...(noPadding ? { padding: 0 } : {}),
      height: 32,
      justifyContent,
    }}
  >
    {children}
  </div>
);

const firstChildToolbarTextStyle = {
  marginRight: 4,
};
const toolbarTextStyle = {
  marginLeft: 4,
  marginRight: 4,
};

type MiniToolbarTextProps = {|
  firstChild?: boolean,
  children: React.Node,
|};

export const MiniToolbarText = ({
  children,
  firstChild,
}: MiniToolbarTextProps) => (
  <Text
    noShrink
    style={firstChild ? firstChildToolbarTextStyle : toolbarTextStyle}
  >
    {children}
  </Text>
);

export default MiniToolbar;
