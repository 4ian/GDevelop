// @flow
import * as React from 'react';
import GDevelopThemeContext from './Theme/GDevelopThemeContext';

type ToolbarProps = {|
  children: React.Node,
  height?: number,
|};

export const Toolbar = React.memo<ToolbarProps>(
  ({ children, height }: ToolbarProps) => {
    const gdevelopTheme = React.useContext(GDevelopThemeContext);
    return (
      <div
        className="almost-invisible-scrollbar"
        style={{
          backgroundColor: gdevelopTheme.toolbar.backgroundColor,
          flexShrink: 0,
          display: 'flex',
          overflowX: 'overlay',
          overflowY: 'hidden',
          height: height || 40,
          paddingLeft: 8,
          paddingRight: 8,
        }}
      >
        {children}
      </div>
    );
  }
);

const toolbarGroupStyle = props => ({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: props.firstChild
    ? 'flex-start'
    : props.lastChild
    ? 'flex-end'
    : 'center',
});

type ToolbarGroupProps = {|
  children?: React.Node,
  firstChild?: boolean,
  lastChild?: boolean,
|};

export const ToolbarGroup = React.memo<ToolbarGroupProps>(
  (props: ToolbarGroupProps) => (
    <span style={toolbarGroupStyle(props)}>{props.children}</span>
  )
);
