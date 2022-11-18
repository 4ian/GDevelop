// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import Paper from '@material-ui/core/Paper';
import { isMobile } from '../../../Utils/Platform';
import { sendOnboardingManuallyOpened } from '../../../Utils/Analytics/EventSender';
import { type ExampleShortHeader } from '../../../Utils/GDevelopServices/Example';
import {
  useResponsiveWindowWidth,
  type WidthType,
} from '../../../UI/Reponsive/ResponsiveWindowMeasurer';
import Checkbox from '../../../UI/Checkbox';
import { Line, Column, LargeSpacer } from '../../../UI/Grid';
import Text from '../../../UI/Text';
import { ResponsiveLineStackLayout } from '../../../UI/Layout';
import InAppTutorialContext from '../../../InAppTutorial/InAppTutorialContext';
import PlaceholderLoader from '../../../UI/PlaceholderLoader';
import Window from '../../../Utils/Window';

import { type HomeTab } from './HomePageMenu';
import SectionContainer, { SectionRow } from './SectionContainer';
import { CardWidget, LARGE_WIDGET_SIZE } from './CardWidget';

const getColumnsFromWidth = (width: WidthType) => (width === 'small' ? 1 : 3);

const MAX_COLUMNS = getColumnsFromWidth('large');
const MAX_SECTION_WIDTH = (LARGE_WIDGET_SIZE + 2 * 5) * MAX_COLUMNS; // widget size + 5 padding per side
const ITEMS_SPACING = 5;
const styles = {
  grid: {
    textAlign: 'center',
    // Avoid tiles taking too much space on large screens.
    maxWidth: MAX_SECTION_WIDTH,
    overflow: 'hidden',
    width: '100%',
  },
  cardTextContainer: {
    padding: 20,
    flex: 1,
    display: 'flex',
  },
  cardImage: {
    width: '100%',
    // Prevent cumulative layout shift by enforcing the 2 ratio.
    aspectRatio: '2',
    maxWidth: LARGE_WIDGET_SIZE,
  },
  bannerContainer: {
    width: '100%',
    maxWidth: MAX_SECTION_WIDTH - 2 * ITEMS_SPACING,
    marginLeft: ITEMS_SPACING,
  },
  bannerImage: {
    width: '100%',
    // Prevent cumulative layout shift by enforcing ratio.
    aspectRatio: '16 / 9',
    maxWidth: LARGE_WIDGET_SIZE,
  },
  icon: {
    marginRight: 8, // Without this, the icon is too close to the text and space is not enough.
  },
};

type Props = {|
  onCreateProject: (?ExampleShortHeader) => void,
  onTabChange: (tab: HomeTab) => void,
  onOpenOnboardingDialog: () => void,
  showGetStartedSection: boolean,
  setShowGetStartedSection: (enabled: boolean) => void,
|};

const GetStartedSection = ({
  onCreateProject,
  onTabChange,
  onOpenOnboardingDialog,
  showGetStartedSection,
  setShowGetStartedSection,
}: Props) => {
  const { inAppTutorialShortHeaders } = React.useContext(InAppTutorialContext);
  const windowWidth = useResponsiveWindowWidth();
  const { currentlyRunningInAppTutorial } = React.useContext(
    InAppTutorialContext
  );
  const shouldShowOnboardingButton = !isMobile() && windowWidth !== 'small';
  const items: {
    key: string,
    title: React.Node,
    description: React.Node,
    action: () => void,
    disabled?: boolean,
  }[] = [
    {
      key: 'tutorial',
      title: <Trans>Learn Section</Trans>,
      description: (
        <Trans>Find all the learning content related to GDevelop.</Trans>
      ),
      action: () => onTabChange('learn'),
    },
    {
      key: 'build',
      title: <Trans>“How do I” forum</Trans>,
      description: <Trans>Ask your questions.</Trans>,
      action: () => Window.openExternalURL('https://forum.gdevelop.io/'),
    },
    {
      key: 'games',
      title: <Trans>Wiki documentation</Trans>,
      description: <Trans>Get inspired and have fun</Trans>,
      action: () =>
        Window.openExternalURL('https://wiki.gdevelop.io/gdevelop5'),
    },
  ];

  return (
    <SectionContainer
      title={<Trans>Get started!</Trans>}
      subtitle={<Trans>Our recommended first steps for newcomers</Trans>}
    >
      <SectionRow>
        <Line>
          <Checkbox
            label={<Trans>Don't show this screen on next startup</Trans>}
            checked={!showGetStartedSection}
            onCheck={(e, checked) => setShowGetStartedSection(!checked)}
          />
        </Line>
        {shouldShowOnboardingButton && (
          <Line>
            <div style={styles.bannerContainer}>
              <CardWidget
                onClick={() => {
                  sendOnboardingManuallyOpened();
                  onOpenOnboardingDialog();
                }}
                size="banner"
                disabled={!!currentlyRunningInAppTutorial}
              >
                {inAppTutorialShortHeaders === null ? (
                  <PlaceholderLoader />
                ) : (
                  <ResponsiveLineStackLayout noMargin expand>
                    <img
                      alt="tour"
                      src="res/homepage/step-by-step.gif"
                      style={styles.bannerImage}
                    />
                    <div style={styles.cardTextContainer}>
                      <Column noMargin expand>
                        <Text size="block-title">
                          <Trans>Take the tour</Trans>
                        </Text>
                        <Text size="body" color="secondary">
                          <span style={styles.icon}>🕐</span>
                          <Trans>5 minutes</Trans>
                        </Text>
                        <Text size="body">
                          <Trans>Learn the fundamentals of the editor</Trans>
                        </Text>
                      </Column>
                    </div>
                  </ResponsiveLineStackLayout>
                )}
              </CardWidget>
            </div>
          </Line>
        )}
      </SectionRow>
      <SectionRow>
        <Text size="title" noMargin>
          <Trans>Want to explore further?</Trans>
        </Text>
        <Text size="body" noMargin>
          <Trans>Articles, wiki and much more.</Trans>
        </Text>
        <LargeSpacer />
        <Line noMargin expand>
          <GridList
            cols={getColumnsFromWidth(windowWidth)}
            style={styles.grid}
            cellHeight="auto"
            spacing={ITEMS_SPACING * 2}
          >
            {items.map((item, index) => (
              <GridListTile key={index}>
                <CardWidget
                  onClick={item.action}
                  key={index}
                  size="large"
                  disabled={item.disabled}
                >
                  <Paper style={styles.cardTextContainer}>
                    <Column expand justifyContent="center" useFullHeight>
                      <Text size="block-title" noMargin>
                        {item.title}
                      </Text>
                      <Text size="body" color="secondary" noMargin>
                        {item.description}
                      </Text>
                    </Column>
                  </Paper>
                </CardWidget>
              </GridListTile>
            ))}
          </GridList>
        </Line>
      </SectionRow>
    </SectionContainer>
  );
};

export default GetStartedSection;
