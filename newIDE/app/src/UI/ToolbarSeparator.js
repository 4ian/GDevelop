import React from 'react';
import ThemeConsumer from './Theme/ThemeConsumer';

export default props => {
  return (
    <ThemeConsumer>
      {muiTheme => (
        <span
          style={{
            height: 32,
            marginLeft: 3,
            marginRight: 3,
            borderLeftStyle: 'solid',
            borderLeftWidth: 1,
            borderColor: muiTheme.toolbar.separatorColor,
          }}
        />
      )}
    </ThemeConsumer>
  );
};
