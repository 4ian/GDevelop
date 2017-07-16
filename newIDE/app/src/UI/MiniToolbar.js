import React, { Component } from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';

const style = {
  display: 'flex',
  alignItems: 'center',
  height: 34,
  paddingLeft: 5,
  paddingRight: 5,
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

export default muiThemeable()(ThemableMiniToolbar);
