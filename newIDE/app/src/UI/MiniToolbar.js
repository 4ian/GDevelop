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
    const { justifyContent } = this.props;

    return (
      <ThemeConsumer>
        {(muiTheme) => (
          <div
            style={{
              ...style,
              height: 32,
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

const firstChildToolbarTextStyle = {
  marginRight: 4,
};
const toolbarTextStyle = {
  marginLeft: 4,
  marginRight: 4,
};

export const MiniToolbarText = ({ children, firstChild }) => (
  <Text
    noShrink
    style={firstChild ? firstChildToolbarTextStyle : toolbarTextStyle}
  >
    {children}
  </Text>
);

export default MiniToolbar;
