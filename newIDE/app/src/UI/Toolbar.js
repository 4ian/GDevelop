// @flow
import * as React from 'react';
import GDevelopThemeContext from './Theme/GDevelopThemeContext';

type ToolbarProps = {|
  children: React.Node,
  height?: number,
  borderBottomColor?: ?string,
  paddingBottom?: number,
  hidden?: boolean,
|};

const styles = {
  toolbar: {
    flexShrink: 0,
    display: 'flex',
    overflowX: 'overlay',
    overflowY: 'hidden',
    paddingLeft: 8,
    paddingRight: 8,
    position: 'relative', // to ensure it is displayed above any global iframe.
  },
};

export const Toolbar = React.memo<ToolbarProps>(
  ({
    children,
    borderBottomColor,
    height = 40,
    paddingBottom,
    hidden,
  }: ToolbarProps) => {
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
          ...(paddingBottom ? { paddingBottom } : undefined),

          // Hiding the titlebar should still keep its position in the layout to avoid layout shifts:
          visibility: hidden ? 'hidden' : 'visible',
          // Use content-visibility as we know the exact height of the toolbar, so the
          // content can be entirely skipped when hidden:
          contentVisibility: hidden ? 'hidden' : 'visible',
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
  justifyContent: props.spaceOut
    ? 'space-around'
    : props.firstChild
    ? 'flex-start'
    : props.lastChild
    ? 'flex-end'
    : 'center',
});

type ToolbarGroupProps = {|
  children?: React.Node,
  firstChild?: boolean,
  lastChild?: boolean,
  spaceOut?: boolean,
|};

export const ToolbarGroup = React.memo<ToolbarGroupProps>(
  (props: ToolbarGroupProps) => (
    <span style={toolbarGroupStyle(props)}>{props.children}</span>
  )
);
