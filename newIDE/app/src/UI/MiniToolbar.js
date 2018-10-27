import React, { Component } from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';

const style = {
  display: 'flex',
  alignItems: 'center',
  paddingLeft: 16,
  paddingRight: 16,
};

class ThemableMiniToolbar extends Component {
  render() {
    const { muiTheme, justifyContent, smallest } = this.props;

    return (
      <div
        style={{
          ...style,
          height: smallest ? 34 : 48,
          backgroundColor: muiTheme.toolbar.backgroundColor,
          justifyContent,
        }}
      >
        {this.props.children}
      </div>
    );
  }
}

const toolbarTextStyle = {
  marginRight: 5,
};

export const MiniToolbarText = ({ children }) => (
  <p style={toolbarTextStyle}>{children}</p>
);

export default muiThemeable()(ThemableMiniToolbar);
