// @flow
import * as React from 'react';
import { Line, Column } from '../../../UI/Grid';
import Text from '../../../UI/Text';
import { Trans } from '@lingui/macro';
import { type HomeTab } from './HomePageMenu';
import { isUserflowRunning } from '../../Onboarding/OnboardingDialog';
import { isMobile } from '../../../Utils/Platform';
import optionalRequire from '../../../Utils/OptionalRequire';
import { sendOnboardingManuallyOpened } from '../../../Utils/Analytics/EventSender';
import { type ExampleShortHeader } from '../../../Utils/GDevelopServices/Example';
import SectionContainer, { SectionRow } from './SectionContainer';
import {
  useResponsiveWindowWidth,
  type WidthType,
} from '../../../UI/Reponsive/ResponsiveWindowMeasurer';
import { CardWidget, LARGE_WIDGET_SIZE } from './CardWidget';
import Checkbox from '../../../UI/Checkbox';
import { GridList, GridListTile } from '@material-ui/core';
import { ResponsiveLineStackLayout } from '../../../UI/Layout';
const electron = optionalRequire('electron');

const getColumnsFromWidth = (width: WidthType) => {
  switch (width) {
    case 'small':
      return 1;
    case 'medium':
      return 2;
    case 'large':
    default:
      return 3;
  }
};
const MAX_COLUMNS = getColumnsFromWidth('large');
const MAX_SECTION_WIDTH = (LARGE_WIDGET_SIZE + 2 * 5) * MAX_COLUMNS; // widget size + 5 padding per side
const ITEMS_SPACING = 5;
const styles = {
  grid: {
    textAlign: 'center',
    // Avoid tiles taking too much space on large screens.
    maxWidth: MAX_SECTION_WIDTH,
    overflow: 'hidden',
  },
  gridListTile: { display: 'flex', justifyContent: 'flex-start' },
  cardTextContainer: {
    textAlign: 'left',
    padding: 10,
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
  const windowWidth = useResponsiveWindowWidth();
  const shouldShowOnboardingButton =
    !electron && !isMobile() && windowWidth !== 'small';
  const items: {
    key: string,
    title: React.Node,
    subText?: React.Node,
    description: React.Node,
    action: () => void,
    imagePath: string,
    disabled?: boolean,
  }[] = [
    {
      key: 'tutorial',
      title: <Trans>GDevelop tutorials</Trans>,
      subText: (
        <>
          <span style={styles.icon}>🕐</span>
          <Trans>30 min to 1h</Trans>
        </>
      ),
      description: <Trans>A complete game step by step</Trans>,
      action: () => onTabChange('learn'),
      imagePath: 'res/homepage/get-started.png',
    },
    {
      key: 'build',
      title: <Trans>Start building directly</Trans>,
      subText: '🌶🌶🌶',
      description: <Trans>For people who like to try on their own</Trans>,
      action: onCreateProject,
      imagePath: 'res/homepage/start-building.png',
    },
    {
      key: 'games',
      title: <Trans>Explore games made by others</Trans>,
      subText: '🎮',
      description: <Trans>Get inspired and have fun</Trans>,
      action: () => onTabChange('play'),
      imagePath: 'res/homepage/explore-games.png',
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
                disabled={isUserflowRunning}
              >
                <ResponsiveLineStackLayout noMargin expand>
                  <img
                    alt="tour"
                    src="res/homepage/step-by-step.gif"
                    style={styles.bannerImage}
                  />
                  <div style={styles.cardTextContainer}>
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
                  </div>
                </ResponsiveLineStackLayout>
              </CardWidget>
            </div>
          </Line>
        )}
      </SectionRow>
      <SectionRow>
        <Text size="title">
          <Trans>New to GDevelop?</Trans>
        </Text>
        <Line noMargin>
          <GridList
            cols={getColumnsFromWidth(windowWidth)}
            style={styles.grid}
            cellHeight="auto"
            spacing={ITEMS_SPACING * 2}
          >
            {items.map((item, index) => (
              <GridListTile key={index} style={styles.gridListTile}>
                <CardWidget
                  onClick={item.action}
                  key={index}
                  size="large"
                  disabled={item.disabled}
                >
                  <Column noMargin expand>
                    <img
                      alt={item.key}
                      src={item.imagePath}
                      style={styles.cardImage}
                    />
                    <div style={styles.cardTextContainer}>
                      <Text size="block-title">{item.title}</Text>
                      {item.subText && (
                        <Text size="body" color="secondary">
                          {item.subText}
                        </Text>
                      )}
                      <Text size="body">{item.description}</Text>
                    </div>
                  </Column>
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
