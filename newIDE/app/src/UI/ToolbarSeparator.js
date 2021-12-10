// @flow
import React from 'react';
import GDevelopThemeContext from '../UI/Theme/ThemeContext';

export default () => {
  const theme = React.useContext(GDevelopThemeContext);
  return (
    <span
      style={{
        height: 32,
        marginLeft: 3,
        marginRight: 3,
        borderLeftStyle: 'solid',
        borderLeftWidth: 1,
        borderColor: theme.toolbar.separatorColor,
      }}
    />
  );
};
