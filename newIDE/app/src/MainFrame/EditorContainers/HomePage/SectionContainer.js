// @flow
import * as React from 'react';
import { Column, Line } from '../../../UI/Grid';
import { Paper } from '@material-ui/core';
import { useResponsiveWindowWidth } from '../../../UI/Reponsive/ResponsiveWindowMeasurer';
import Text from '../../../UI/Text';
import { Trans } from '@lingui/macro';
import GDevelopThemeContext from '../../../UI/Theme/ThemeContext';

const styles = {
  mobileScrollContainer: {
    padding: 5,
  },
  desktopScrollContainer: {
    paddingTop: 20,
    paddingLeft: 30,
    paddingRight: 30,
    paddingBottom: 10,
  },
  scrollContainer: {
    flex: 1,
    display: 'flex',
    overflowY: 'auto',
  },
};

type Props = {|
  children: React.Node,
  title: string,
|};

export const SectionContainer = ({ children, title }: Props) => {
  const windowWidth = useResponsiveWindowWidth();
  const GDevelopTheme = React.useContext(GDevelopThemeContext);
  return (
    <Column useFullHeight noMargin expand>
      <Paper
        style={{
          ...styles.scrollContainer,
          borderLeft: `1px solid ${GDevelopTheme.home.separator.color}`,
          ...(windowWidth === 'small'
            ? styles.mobileScrollContainer
            : styles.desktopScrollContainer),
        }}
        square
      >
        <Column expand>
          <Line>
            <Text size="bold-title">
              <Trans>{title}</Trans>
            </Text>
          </Line>
          {children}
        </Column>
      </Paper>
    </Column>
  );
};
