// @flow
import React from 'react';
import { Column, Line } from '../../UI/Grid';
import { useResponsiveWindowWidth } from '../../UI/Reponsive/ResponsiveWindowMeasurer';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';

const ExportHomeSeparator = () => {
  const windowWidth = useResponsiveWindowWidth();
  const isMobileScreen = windowWidth === 'small';
  const theme = React.useContext(GDevelopThemeContext);
  return !isMobileScreen ? (
    <Column justifyContent="center" noMargin>
      <span
        style={{
          height: 'calc(100% - 30px)',
          borderLeftStyle: 'solid',
          borderLeftWidth: 1,
          borderColor: theme.toolbar.separatorColor,
        }}
      />
    </Column>
  ) : (
    <Line justifyContent="center">
      <span
        style={{
          width: '80%',
          borderBottomStyle: 'solid',
          borderBottomWidth: 1,
          borderColor: theme.toolbar.separatorColor,
        }}
      />
    </Line>
  );
};

export default ExportHomeSeparator;
