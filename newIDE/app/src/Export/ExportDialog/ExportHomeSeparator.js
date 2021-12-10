// @flow
import React from 'react';
import { Column } from '../../UI/Grid';
import { useResponsiveWindowWidth } from '../../UI/Reponsive/ResponsiveWindowMeasurer';
import GDevelopThemeContext from '../../UI/Theme/ThemeContext';

export default () => {
  const windowWidth = useResponsiveWindowWidth();
  const theme = React.useContext(GDevelopThemeContext);
  return (
    windowWidth !== 'small' && (
      <Column justifyContent="center">
        <span
          style={{
            height: 'calc(100% - 30px)',
            borderLeftStyle: 'solid',
            borderLeftWidth: 1,
            borderColor: theme.toolbar.separatorColor,
          }}
        />
      </Column>
    )
  );
};
