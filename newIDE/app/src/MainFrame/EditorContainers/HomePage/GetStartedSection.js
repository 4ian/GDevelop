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
import { SectionContainer } from './SectionContainer';
import {
  useResponsiveWindowWidth,
  type WidthType,
} from '../../../UI/Reponsive/ResponsiveWindowMeasurer';
import { CardWidget, LARGE_WIDGET_SIZE } from './CardWidget';
import Checkbox from '../../../UI/Checkbox';
import { GridList, GridListTile } from '@material-ui/core';
const electron = optionalRequire('electron');

const styles = {
  grid: {
    marginTop: 30,
    textAlign: 'center',
    maxWidth: LARGE_WIDGET_SIZE * 4, // Avoid tiles taking too much space on large screens.
    overflow: 'hidden',
  },
  tutorialsContainer: {
    marginTop: 30,
  },
  gridListTile: { display: 'flex', justifyContent: 'center' },
  cardTextContainer: {
    textAlign: 'left',
    padding: 10,
  },
};

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

type Props = {|
  onOpenExamples: () => void,
  onTabChange: (tab: HomeTab) => void,
  onOpenOnboardingDialog: () => void,
  showGetStartedSection: boolean,
  setShowGetStartedSection: (enabled: boolean) => void,
|};

export const GetStartedSection = ({
  onOpenExamples,
  onTabChange,
  onOpenOnboardingDialog,
  showGetStartedSection,
  setShowGetStartedSection,
}: Props) => {
  const windowWidth = useResponsiveWindowWidth();
  const items = [
    !electron && !isMobile() && !isUserflowRunning
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
      action: onOpenExamples,
      imagePath: 'res/homepage/start-building.png',
    },
    {
      key: 'games',
      title: <Trans>Explore games made by others</Trans>,
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
      <Line>
        <Checkbox
          label={<Trans>Don't show this screen on next startup</Trans>}
          checked={!showGetStartedSection}
          onCheck={(e, checked) => setShowGetStartedSection(!checked)}
        />
      </Line>
      <Line noMargin>
        <GridList
          cols={getColumnsFromWidth(windowWidth)}
          style={styles.grid}
          cellHeight="auto"
          spacing={10}
        >
          {items.map((item, index) => (
            <GridListTile key={index} style={styles.gridListTile}>
              <CardWidget onClick={item.action} key={index} size="large">
                <Column noMargin expand>
                  <img alt={item.key} src={item.imagePath} />
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
    </SectionContainer>
  );
};
