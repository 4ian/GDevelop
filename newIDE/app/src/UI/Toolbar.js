// @flow
import * as React from 'react';
import ThemeConsumer from './Theme/ThemeConsumer';

type ToolbarProps = {|
  children: React.Node,
|};

type ToolbarGroupProps = {|
  children?: React.Node,
  firstChild?: boolean,
  lastChild?: boolean,
|};

export const Toolbar = React.memo<ToolbarProps>(
  ({ children }: ToolbarProps) => (
    <ThemeConsumer>
      {muiTheme => (
        <div
          className="almost-invisible-scrollbar"
          style={{
            backgroundColor: muiTheme.toolbar.backgroundColor,
            padding: 3,
            flexShrink: 0,
            display: 'flex',
            overflowX: 'auto',
            overflowY: 'hidden',
          }}
        >
          {children}
        </div>
      )}
    </ThemeConsumer>
  )
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
