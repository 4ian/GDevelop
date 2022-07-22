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
import SectionContainer, { SectionRow } from './SectionContainer';
import {
  useResponsiveWindowWidth,
  type WidthType,
} from '../../../UI/Reponsive/ResponsiveWindowMeasurer';
import { CardWidget, LARGE_WIDGET_SIZE } from './CardWidget';
import Checkbox from '../../../UI/Checkbox';
import { GridList, GridListTile } from '@material-ui/core';
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
const styles = {
  grid: {
    textAlign: 'center',
    // Avoid tiles taking too much space on large screens.
    maxWidth: (LARGE_WIDGET_SIZE + 2 * 5) * MAX_COLUMNS, // widget size + 5 padding per side
    overflow: 'hidden',
  },
  gridListTile: { display: 'flex', justifyContent: 'flex-start' },
  cardTextContainer: {
    textAlign: 'left',
    padding: 10,
  },
  image: {
    width: '100%',
    // Prevent cumulative layout shift by enforcing
    // the 2 ratio.
    aspectRatio: '2',
  },
};

type Props = {|
  onCreateProject: () => void,
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
  const shouldShowOnboardingButton = !electron && !isMobile();
  const items: {
    key: string,
    title: React.Node,
    subText?: React.Node,
    description: React.Node,
    action: () => void,
    imagePath: string,
    disabled?: boolean,
  }[] = [
    shouldShowOnboardingButton
      ? {
          key: 'tour',
          title: <Trans>Take the tour</Trans>,
          subText: <Trans>🕐 5 minutes</Trans>,
          description: <Trans>Learn the fundamentals of the editor</Trans>,
          action: () => {
            sendOnboardingManuallyOpened();
            onOpenOnboardingDialog();
          },
          imagePath: 'res/homepage/take-the-tour.png',
          disabled: isUserflowRunning,
        }
      : undefined,
    {
      key: 'tutorial',
      title: <Trans>Follow a tutorial</Trans>,
      subText: <Trans>🕐 30 min to 1h</Trans>,
      description: <Trans>A complete game step by step</Trans>,
      action: () => onTabChange('learn'),
      imagePath: 'res/homepage/follow-tutorial.png',
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
  ].filter(Boolean);

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
      </SectionRow>
      <SectionRow>
        <Line noMargin>
          <GridList
            cols={getColumnsFromWidth(windowWidth)}
            style={styles.grid}
            cellHeight="auto"
            spacing={10}
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
                      style={styles.image}
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
