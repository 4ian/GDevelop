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
  showUrgentAnnouncements?: boolean,
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
  showUrgentAnnouncements,
}: Props) => {
  const { isMobile } = useResponsiveWindowSize();
  const { announcements } = React.useContext(AnnouncementsFeedContext);
  const containerStyle: {|
    paddingTop: number,
    paddingLeft: number,
    paddingRight: number,
  |} = isMobile ? styles.mobileContainer : styles.desktopContainer;
  const scrollStyle: {| overflowY: string |} = noScroll
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
          style={isMobile ? styles.mobileFooter : styles.desktopFooter}
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
