// @flow
import * as React from 'react';
import { Column, Line, Spacer } from '../../../UI/Grid';
import { useResponsiveWindowSize } from '../../../UI/Responsive/ResponsiveWindowMeasurer';
import Text from '../../../UI/Text';
import ArrowLeft from '../../../UI/CustomSvgIcons/ArrowLeft';
import TextButton from '../../../UI/TextButton';
import { Trans } from '@lingui/macro';
import Paper from '../../../UI/Paper';
import { LineStackLayout } from '../../../UI/Layout';
import { AnnouncementsFeed } from '../../../AnnouncementsFeed';
import { AnnouncementsFeedContext } from '../../../AnnouncementsFeed/AnnouncementsFeedContext';

export const SECTION_DESKTOP_SPACING = 20;
const SECTION_MOBILE_SPACING_TOP = 10;

const styles = {
  title: { overflowWrap: 'anywhere', textWrap: 'wrap' },
  mobileContainer: {
    paddingLeft: 5,
    paddingRight: 5,
  },
  desktopContainer: {
    paddingLeft: SECTION_DESKTOP_SPACING,
    paddingRight: SECTION_DESKTOP_SPACING,
  },
  mobileFooter: {
    padding: 5,
  },
  desktopFooter: {
    paddingLeft: SECTION_DESKTOP_SPACING,
  },
  rowContainer: {
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: SECTION_DESKTOP_SPACING,
  },
  container: {
    flex: 1,
    overflowX: 'hidden',
  },
  scrollContainer: {
    overflowY: 'scroll', // Force a scrollbar to prevent layout shifts.
  },
  noScrollContainer: {
    overflowY: 'hidden',
  },
  childrenContainer: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    minWidth: 0,
    flex: 1,
  },
};

type Props = {|
  children: React.Node,
  title?: React.Node,
  titleAdornment?: React.Node,
  titleAction?: React.Node,
  subtitleText?: React.Node,
  renderSubtitle?: () => React.Node,
  backAction?: () => void,
  flexBody?: boolean,
  renderFooter?: () => React.Node,
  noScroll?: boolean,
  applyTopSpacingAsMarginOnChildrenContainer?: boolean,
  showUrgentAnnouncements?: boolean,
|};

const SectionContainer = React.forwardRef<Props, HTMLDivElement>(
  (
    {
      children,
      title,
      titleAdornment,
      titleAction,
      subtitleText,
      renderSubtitle,
      backAction,
      flexBody,
      renderFooter,
      noScroll,
      applyTopSpacingAsMarginOnChildrenContainer,
      showUrgentAnnouncements,
    },
    ref
  ) => {
    const { isMobile } = useResponsiveWindowSize();
    const { announcements } = React.useContext(AnnouncementsFeedContext);
    const containerStyle: {|
      paddingTop: number,
      paddingLeft: number,
      paddingRight: number,
    |} = {
      ...(isMobile ? styles.mobileContainer : styles.desktopContainer),
      paddingTop: applyTopSpacingAsMarginOnChildrenContainer
        ? 0
        : isMobile
        ? SECTION_MOBILE_SPACING_TOP
        : SECTION_DESKTOP_SPACING,
    };
    const scrollStyle: {| overflowY: string |} = noScroll
      ? styles.noScrollContainer
      : styles.scrollContainer;
    const paperStyle = {
      ...styles.container,
      display: flexBody ? 'flex' : 'block',
      ...containerStyle,
      ...scrollStyle,
    };
    const childrenContainerStyle = {
      ...styles.childrenContainer,
      marginTop: applyTopSpacingAsMarginOnChildrenContainer
        ? isMobile
          ? SECTION_MOBILE_SPACING_TOP
          : SECTION_DESKTOP_SPACING
        : 0,
    };

    return (
      <Column expand useFullHeight noMargin>
        <Paper style={paperStyle} square background="dark" ref={ref}>
          <div style={childrenContainerStyle}>
            {showUrgentAnnouncements && (
              <>
                <AnnouncementsFeed canClose level="urgent" hideLoader />
                {announcements && announcements.length > 0 && <Spacer />}
              </>
            )}
            {backAction && (
              <Line>
                <TextButton
                  onClick={backAction}
                  icon={<ArrowLeft fontSize="small" />}
                  label={<Trans>Back</Trans>}
                />
              </Line>
            )}
            {(title || subtitleText || renderSubtitle) && (
              <SectionRow>
                {title && (
                  <LineStackLayout
                    noMargin
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <LineStackLayout noMargin alignItems="center">
                      <Text size="bold-title" noMargin style={styles.title}>
                        {title}
                      </Text>
                      {titleAction}
                    </LineStackLayout>
                    {titleAdornment && (
                      <Column noMargin>{titleAdornment}</Column>
                    )}
                  </LineStackLayout>
                )}
                {subtitleText && (
                  <Line noMargin>
                    <Text noMargin>{subtitleText}</Text>
                  </Line>
                )}
                {renderSubtitle && renderSubtitle()}
              </SectionRow>
            )}
            {children}
          </div>
        </Paper>
        {renderFooter && (
          <Paper
            style={isMobile ? styles.mobileFooter : styles.desktopFooter}
            square
            background="dark"
          >
            {renderFooter()}
          </Paper>
        )}
      </Column>
    );
  }
);

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
