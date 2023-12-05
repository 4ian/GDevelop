// @flow
import * as React from 'react';
import { Column, Line } from '../../../UI/Grid';
import { useResponsiveWindowWidth } from '../../../UI/Reponsive/ResponsiveWindowMeasurer';
import Text from '../../../UI/Text';
import ArrowLeft from '../../../UI/CustomSvgIcons/ArrowLeft';
import TextButton from '../../../UI/TextButton';
import { Trans } from '@lingui/macro';
import Paper from '../../../UI/Paper';
import { LineStackLayout } from '../../../UI/Layout';

export const SECTION_PADDING = 30;

const styles = {
  title: { overflowWrap: 'anywhere', textWrap: 'wrap' },
  mobileContainer: {
    paddingTop: 10,
    paddingLeft: 5,
    paddingRight: 5,
  },
  desktopContainer: {
    paddingTop: SECTION_PADDING,
    paddingLeft: SECTION_PADDING,
    paddingRight: SECTION_PADDING,
  },
  mobileFooter: {
    padding: 5,
  },
  desktopFooter: {
    paddingLeft: SECTION_PADDING,
  },
  rowContainer: {
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: SECTION_PADDING,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    overflowY: 'scroll', // Force a scrollbar to prevent layout shifts.
    scrollbarWidth: 'thin', // For Firefox, to avoid having a very large scrollbar.
  },
  noScrollContainer: {
    overflowY: 'hidden',
  },
};

type Props = {|
  children: React.Node,
  title: React.Node,
  titleAdornment?: React.Node,
  subtitleText?: React.Node,
  renderSubtitle?: () => React.Node,
  backAction?: () => void,
  flexBody?: boolean,
  renderFooter?: () => React.Node,
  noScroll?: boolean,
|};

const SectionContainer = ({
  children,
  title,
  titleAdornment,
  subtitleText,
  renderSubtitle,
  backAction,
  flexBody,
  renderFooter,
  noScroll,
}: Props) => {
  const windowWidth = useResponsiveWindowWidth();
  const isMobileScreen = windowWidth === 'small';
  const containerStyle: {|
    paddingTop: number,
    paddingLeft: number,
    paddingRight: number,
  |} = isMobileScreen ? styles.mobileContainer : styles.desktopContainer;
  const scrollStyle: {| overflowY: string, scrollbarWidth?: string |} = noScroll
    ? styles.noScrollContainer
    : styles.scrollContainer;
  const paperStyle = {
    ...styles.container,
    display: flexBody ? 'flex' : 'block',
    ...containerStyle,
    ...scrollStyle,
  };

  return (
    <Column useFullHeight noMargin expand>
      <Paper style={paperStyle} square background="dark">
        <Column noOverflowParent expand>
          {backAction && (
            <Line>
              <TextButton
                onClick={backAction}
                icon={<ArrowLeft fontSize="small" />}
                label={<Trans>Back</Trans>}
              />
            </Line>
          )}
          {title && (
            <SectionRow>
              <LineStackLayout
                noMargin
                alignItems="center"
                justifyContent="space-between"
              >
                <Text size="bold-title" noMargin style={styles.title}>
                  {title}
                </Text>
                {titleAdornment && <Column noMargin>{titleAdornment}</Column>}
              </LineStackLayout>
              {subtitleText && (
                <Line noMargin>
                  <Text noMargin>{subtitleText}</Text>
                </Line>
              )}
              {renderSubtitle && renderSubtitle()}
            </SectionRow>
          )}
          {children}
        </Column>
      </Paper>
      {renderFooter && (
        <Paper
          style={isMobileScreen ? styles.mobileFooter : styles.desktopFooter}
          square
          background="dark"
        >
          {renderFooter()}
        </Paper>
      )}
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
