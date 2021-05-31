// @flow
import * as React from 'react';
import ThemeConsumer from '../../../UI/Theme/ThemeConsumer';

const styles = {
  logo: {
    width: '100%',
  },
};

const GDevelopLogo = (): React.Node => (
  <ThemeConsumer>
    {muiTheme => <img src={muiTheme.logo.src} alt="" style={styles.logo} />}
  </ThemeConsumer>
);

export default GDevelopLogo;
