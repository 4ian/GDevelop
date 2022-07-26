// @flow
import * as React from 'react';
import { Column, Line } from '../../../UI/Grid';
import Paper from '@material-ui/core/Paper';
import { useResponsiveWindowWidth } from '../../../UI/Reponsive/ResponsiveWindowMeasurer';
import Text from '../../../UI/Text';
import GDevelopThemeContext from '../../../UI/Theme/ThemeContext';
import ArrowLeft from '../../../UI/CustomSvgIcons/ArrowLeft';
import TextButton from '../../../UI/TextButton';
import { Trans } from '@lingui/macro';

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
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: SECTION_PADDING,
  },
  scrollContainer: {
    flex: 1,
    overflowY: 'auto',
  },
};

type Props = {|
  children: React.Node,
  title: React.Node,
  subtitle?: React.Node,
  backAction?: () => void,
  flexBody?: boolean,
|};

const SectionContainer = ({
  children,
  title,
  subtitle,
  backAction,
  flexBody,
}: Props) => {
  const windowWidth = useResponsiveWindowWidth();
  const GDevelopTheme = React.useContext(GDevelopThemeContext);
  return (
    <Column useFullHeight noMargin expand>
      <Paper
        style={{
          ...styles.scrollContainer,
          display: flexBody ? 'flex' : 'block',
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
                <TextButton
                  onClick={backAction}
                  icon={<ArrowLeft fontSize="small" />}
                  label={<Trans>Back</Trans>}
                />
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

export const SectionRow = ({
  children,
  expand,
}: {
  children: React.Node,
  expand?: boolean,
}) => (
  <div
    style={{ ...styles.rowContainer, ...(expand ? { flex: 1 } : undefined) }}
  >
    {children}
  </div>
);

export default SectionContainer;
