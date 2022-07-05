// @flow
import * as React from 'react';
import { Column, Line } from '../../../UI/Grid';
import Paper from '@material-ui/core/Paper';
import { useResponsiveWindowWidth } from '../../../UI/Reponsive/ResponsiveWindowMeasurer';
import Text from '../../../UI/Text';
import GDevelopThemeContext from '../../../UI/Theme/ThemeContext';

const styles = {
  mobileScrollContainer: {
    padding: 5,
  },
  desktopScrollContainer: {
    paddingTop: 30,
    paddingLeft: 30,
    paddingRight: 30,
    paddingBottom: 10,
  },
  titleContainer: {
    paddingBottom: 20,
  },
  scrollContainer: {
    flex: 1,
    display: 'flex',
    overflowY: 'auto',
  },
};

type Props = {|
  children: React.Node,
  title: React.Node,
  subtitle?: React.Node,
|};

const SectionContainer = ({ children, title, subtitle }: Props) => {
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
          <div style={styles.titleContainer}>
            <Line noMargin>
              <Text size="bold-title" noMargin>
                {title}
              </Text>
            </Line>
            {subtitle && (
              <Line noMargin>
                <Text noMargin>{subtitle}</Text>
              </Line>
            )}
          </div>
          {children}
        </Column>
      </Paper>
    </Column>
  );
};

export default SectionContainer;
