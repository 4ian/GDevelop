// @flow
import React from 'react';
import { Column } from '../../UI/Grid';
import { useResponsiveWindowWidth } from '../../UI/Reponsive/ResponsiveWindowMeasurer';
import ThemeConsumer from '../../UI/Theme/ThemeConsumer';

export default () => {
  const windowWidth = useResponsiveWindowWidth();
  return (
    <ThemeConsumer>
      {muiTheme =>
        windowWidth !== 'small' && (
          <Column justifyContent="center">
            <span
              style={{
                height: 'calc(100% - 30px)',
                borderLeftStyle: 'solid',
                borderLeftWidth: 1,
                borderColor: muiTheme.toolbar.separatorColor,
              }}
            />
          </Column>
        )
      }
    </ThemeConsumer>
  );
};
