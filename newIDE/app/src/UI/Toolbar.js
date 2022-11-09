// @flow
import * as React from 'react';
import GDevelopThemeContext from './Theme/ThemeContext';

type ToolbarProps = {|
  children: React.Node,
|};

type ToolbarGroupProps = {|
  children?: React.Node,
  firstChild?: boolean,
  lastChild?: boolean,
|};

export const Toolbar = React.memo<ToolbarProps>(
  ({ children }: ToolbarProps) => {
    const gdevelopTheme = React.useContext(GDevelopThemeContext);
    return (
      <div
        className="almost-invisible-scrollbar"
        style={{
          backgroundColor: gdevelopTheme.toolbar.backgroundColor,
          padding: 3,
          flexShrink: 0,
          display: 'flex',
          overflowX: 'auto',
          overflowY: 'hidden',
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

export const ToolbarGroup = React.memo<ToolbarGroupProps>(
  (props: ToolbarGroupProps) => (
    <span style={toolbarGroupStyle(props)}>{props.children}</span>
  )
);
