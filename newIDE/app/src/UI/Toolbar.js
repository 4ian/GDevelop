// @flow
import * as React from 'react';
import ThemeConsumer from './Theme/ThemeConsumer';

type ToolbarProps = {|
  children: React.Node,
|};

type ToolbarGroupProps = {|
  children?: React.Node,
  firstChild?: true, // Not used, but could be useful one day for styling
  lastChild?: true, // Not used, but could be useful one day for styling
|};

export const Toolbar: React$AbstractComponent<
  ToolbarProps,
  mixed
> = React.memo<ToolbarProps>(({ children }: ToolbarProps) => (
  <ThemeConsumer>
    {muiTheme => (
      <div
        style={{
          backgroundColor: muiTheme.toolbar.backgroundColor,
          padding: 3,
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          overflowX: 'auto',
          overflowY: 'hidden',
        }}
      >
        {children}
      </div>
    )}
  </ThemeConsumer>
));

const toolbarGroupStyle = {
  display: 'flex',
  alignItems: 'center',
};

export const ToolbarGroup: React$AbstractComponent<
  ToolbarGroupProps,
  mixed
> = React.memo<ToolbarGroupProps>(({ children }: ToolbarGroupProps) => (
  <span style={toolbarGroupStyle}>{children}</span>
));
