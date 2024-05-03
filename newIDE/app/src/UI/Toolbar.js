// @flow
import * as React from 'react';
import GDevelopThemeContext from './Theme/GDevelopThemeContext';

type ToolbarProps = {|
  children: React.Node,
  height?: number,
  borderBottomColor?: ?string,
|};

const styles = {
  toolbar: {
    flexShrink: 0,
    display: 'flex',
    overflowX: 'overlay',
    overflowY: 'hidden',
    paddingLeft: 8,
    paddingRight: 8,
  },
};

export const Toolbar = React.memo<ToolbarProps>(
  ({ children, borderBottomColor, height = 40 }: ToolbarProps) => {
    const gdevelopTheme = React.useContext(GDevelopThemeContext);
    return (
      <div
        className="almost-invisible-scrollbar"
        style={{
          ...styles.toolbar,
          backgroundColor: gdevelopTheme.toolbar.backgroundColor,
          height,
          borderBottom: borderBottomColor
            ? `2px solid ${borderBottomColor}`
            : undefined,
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
