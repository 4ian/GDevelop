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
import { CardWidget } from './CardWidget';
import Checkbox from '../../../UI/Checkbox';
import { GridList, GridListTile } from '@material-ui/core';
const electron = optionalRequire('electron');

const styles = {
  grid: {
    marginTop: 30,
    textAlign: 'center',
    maxWidth: 850, // Avoid tiles taking too much space on large screens.
  },
  tutorialsContainer: {
    marginTop: 30,
  },
  gridListTile: { display: 'flex', justifyContent: 'center' },
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
          title: <Trans>Take the tour</Trans>,
          timeText: <Trans>5 minutes</Trans>,
          description: <Trans>Learn the fundamentals of the editor</Trans>,
          action: () => {
            sendOnboardingManuallyOpened();
            onOpenOnboardingDialog();
          },
        }
      : undefined,
    {
      title: <Trans>Follow a tutorial</Trans>,
      timeText: <Trans>30 min to 1h</Trans>,
      description: <Trans>Find the complete documentation on everything</Trans>,
      action: () => onTabChange('learn'),
    },
    {
      title: <Trans>Start building directly</Trans>,
      description: <Trans>For people who like to try on their own</Trans>,
      action: onOpenExamples,
    },
    {
      title: <Trans>Explore games made by others</Trans>,
      description: <Trans>Get inspired and have fun</Trans>,
      action: () => onTabChange('play'),
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
      <GridList
        cols={getColumnsFromWidth(windowWidth)}
        style={styles.grid}
        cellHeight="auto"
        spacing={10}
      >
        {items.map((Item, index) => (
          <GridListTile key={index} style={styles.gridListTile}>
            <CardWidget onClick={Item.action} key={index} size="large">
              <Column alignItems="center">
                <Text size="block-title">{Item.title}</Text>
                <Text size="body" color="secondary">
                  {Item.description}
                </Text>
              </Column>
            </CardWidget>
          </GridListTile>
        ))}
      </GridList>
    </SectionContainer>
  );
};
