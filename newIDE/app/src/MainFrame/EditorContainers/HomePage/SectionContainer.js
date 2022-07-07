// @flow
import * as React from 'react';
import { Column, Line } from '../../../UI/Grid';
import Paper from '@material-ui/core/Paper';
import { useResponsiveWindowWidth } from '../../../UI/Reponsive/ResponsiveWindowMeasurer';
import Text from '../../../UI/Text';
import GDevelopThemeContext from '../../../UI/Theme/ThemeContext';
import ArrowLeft from '../../../UI/CustomSvgIcons/ArrowLeft';
import IconButton from '../../../UI/IconButton';

export const SECTION_PADDING = 30;

const styles = {
  mobileScrollContainer: {
    padding: 5,
  },
  desktopScrollContainer: {
    paddingTop: SECTION_PADDING,
    paddingLeft: SECTION_PADDING,
    paddingRight: SECTION_PADDING,
  },
  rowContainer: {
    paddingBottom: SECTION_PADDING,
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
  backAction?: () => void,
|};

const SectionContainer = ({ children, title, subtitle, backAction }: Props) => {
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
          <SectionRow>
            {backAction && (
              <Line>
                <IconButton onClick={backAction} size="small">
                  <ArrowLeft fontSize="small" />
                </IconButton>
              </Line>
            )}
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
          </SectionRow>
          {children}
        </Column>
      </Paper>
    </Column>
  );
};

export const SectionRow = ({ children }: { children: React.Node }) => (
  <div style={styles.rowContainer}>{children}</div>
);

export default SectionContainer;
