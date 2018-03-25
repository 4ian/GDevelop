// @flow
import * as React from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';

const styles = {
  logo: {
    width: '100%',
  },
};

const ThemableGDevelopLogo = ({ muiTheme }) => (
  <img src={muiTheme.logo.src} alt="" style={styles.logo} />
);

const GDevelopLogo = muiThemeable()(ThemableGDevelopLogo);
export default GDevelopLogo;
