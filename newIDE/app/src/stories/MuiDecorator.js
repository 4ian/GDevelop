import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import defaultTheme from '../UI/Theme/DefaultTheme';

export default story => (
  <MuiThemeProvider muiTheme={defaultTheme}>{story()}</MuiThemeProvider>
);
