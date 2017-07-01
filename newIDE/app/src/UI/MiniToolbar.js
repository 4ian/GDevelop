import React, { Component } from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';

const style = {
  display: 'flex',
  alignItems: 'center',
  height: 34,
};

class ThemableMiniToolbar extends Component {
  render() {
    const { muiTheme, justifyContent } = this.props;

    return (
      <div
        style={{
          ...style,
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
