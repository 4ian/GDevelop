// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import Paper from '@material-ui/core/Paper';
import { isMobile } from '../../../../Utils/Platform';
import { sendOnboardingManuallyOpened } from '../../../../Utils/Analytics/EventSender';
import { type ExampleShortHeader } from '../../../../Utils/GDevelopServices/Example';
import {
  useResponsiveWindowWidth,
  type WidthType,
} from '../../../../UI/Reponsive/ResponsiveWindowMeasurer';
import Checkbox from '../../../../UI/Checkbox';
import { Line, LargeSpacer } from '../../../../UI/Grid';
import Text from '../../../../UI/Text';
import { ColumnStackLayout } from '../../../../UI/Layout';
import InAppTutorialContext from '../../../../InAppTutorial/InAppTutorialContext';
import PlaceholderLoader from '../../../../UI/PlaceholderLoader';
import Window from '../../../../Utils/Window';

import { type HomeTab } from '../HomePageMenu';
import SectionContainer, { SectionRow } from '../SectionContainer';
import { CardWidget, LARGE_WIDGET_SIZE } from '../CardWidget';
import InAppTutorialPhaseCard from './InAppTutorialPhaseCard';
import Unboxing from './Unboxing';
import Building from './Building';
import Podium from './Podium';

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

  const inAppTutorialCards = [
    {
      title: t`Start your game`,
      description: t`Add your first characters to the scene and throw your first objects`,
      keyPoints: [
        t`Game scene size`,
        t`Objects and characters`,
        t`Game Scenes`,
        t`Throwing physics`,
      ],
      durationInMinutes: 5,
      locked: false,
      disabled: true,
      progress: 100,
      renderImage: (props) =>  <Unboxing {...props} />,
    },
    {
      title: t`Improve and publish your Game`,
      description: t`Add personality to your game, and polish online`,
      keyPoints: [
        t`Game background`,
        t`In game obstacles`,
        t`“You win” message`,
        t`Sharing online`,
      ],
      durationInMinutes: 10,
      locked: false,
      disabled: true,
      progress: 20,
      renderImage: (props) =>  <Building {...props} />,
    },
    {
      title: t`Add leaderboards to your online Game`,
      description: t`Polish your game, and add leaderboards.`,
      keyPoints: [
        t`Game personalisation`,
        t`“Start” screen`,
        t`Timers`,
        t`Leaderboards`,
      ],
      durationInMinutes: 15,
      locked: true,
      disabled: true,
      progress: 0,
      renderImage: (props) =>  <Podium {...props} />,
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
              {inAppTutorialShortHeaders === null ? (
                <PlaceholderLoader />
              ) : (
                <GridList
                  cols={getColumnsFromWidth(windowWidth)}
                  style={styles.grid}
                  cellHeight="auto"
                  spacing={ITEMS_SPACING * 2}
                >
                  {inAppTutorialCards.map(item => (
                    <GridListTile>
                      <InAppTutorialPhaseCard
                        {...item}
                        onClick={() => console.log('click')}
                      />
                    </GridListTile>
                  ))}
                </GridList>
              )}
            </div>
          </Line>
        )}
      </SectionRow>
      <SectionRow>
        <Text size="title" noMargin>
          <Trans>Want to explore further?</Trans>
        </Text>
        <Text size="body" color="secondary" noMargin>
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
                  <Paper
                    style={{
                      ...styles.cardTextContainer,
                      padding: windowWidth === 'small' ? 10 : 20,
                    }}
                  >
                    <ColumnStackLayout
                      expand
                      justifyContent="center"
                      useFullHeight
                    >
                      <Text size="sub-title" noMargin>
                        {item.title}
                      </Text>
                      <Text size="body" color="secondary" noMargin>
                        {item.description}
                      </Text>
                    </ColumnStackLayout>
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
