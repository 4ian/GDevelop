// @flow
import * as React from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';

const styles = {
  scrollContainer: {
    flex: 1,
    display: 'flex',
    overflowY: 'scroll',
  },
};

const ThemableScrollBackground = ({ muiTheme, children }) => (
  <div
    style={{
      ...styles.scrollContainer,
      backgroundColor: muiTheme.palette.canvasColor,
    }}
  >
    {children}
  </div>
);

const ScrollBackground = muiThemeable()(ThemableScrollBackground);
export default ScrollBackground;
