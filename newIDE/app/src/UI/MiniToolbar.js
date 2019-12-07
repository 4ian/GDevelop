import React, { Component } from 'react';
import ThemeConsumer from './Theme/ThemeConsumer';
import Text from './Text';

const style = {
  display: 'flex',
  alignItems: 'center',
  paddingLeft: 8,
  paddingRight: 8,
};

class MiniToolbar extends Component {
  render() {
    const { justifyContent, smallest } = this.props;

    return (
      <ThemeConsumer>
        {muiTheme => (
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
        )}
      </ThemeConsumer>
    );
  }
}

const toolbarTextStyle = {
  marginRight: 5,
};

export const MiniToolbarText = ({ children }) => (
  <Text noShrink style={toolbarTextStyle}>
    {children}
  </Text>
);

export default MiniToolbar;
