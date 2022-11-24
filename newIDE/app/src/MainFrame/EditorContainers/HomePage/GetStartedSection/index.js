// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import { isMobile } from '../../../../Utils/Platform';
import { type ExampleShortHeader } from '../../../../Utils/GDevelopServices/Example';
import {
  useResponsiveWindowWidth,
  type WidthType,
} from '../../../../UI/Reponsive/ResponsiveWindowMeasurer';
import Checkbox from '../../../../UI/Checkbox';
import { Line, LargeSpacer } from '../../../../UI/Grid';
import Text from '../../../../UI/Text';
import {
  ColumnStackLayout,
  ResponsiveLineStackLayout,
} from '../../../../UI/Layout';
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
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import PreferencesContext from '../../../Preferences/PreferencesContext';
import { FLING_GAME_IN_APP_TUTORIAL_ID } from '../../../../InAppTutorial/InAppTutorialProvider';

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
  selectInAppTutorial: (tutorialId: string) => void,
  showGetStartedSection: boolean,
  setShowGetStartedSection: (enabled: boolean) => void,
|};

const GetStartedSection = ({
  onCreateProject,
  onTabChange,
  selectInAppTutorial,
  showGetStartedSection,
  setShowGetStartedSection,
}: Props) => {
  const { inAppTutorialShortHeaders } = React.useContext(InAppTutorialContext);
  const { getTutorialProgress } = React.useContext(PreferencesContext);
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const windowWidth = useResponsiveWindowWidth();
  const { currentlyRunningInAppTutorial } = React.useContext(
    InAppTutorialContext
  );
  const shouldShowInAppTutorialButtons = !isMobile() && windowWidth !== 'small';
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
      description: <Trans>Get inspired and have fun.</Trans>,
      action: () =>
        Window.openExternalURL('https://wiki.gdevelop.io/gdevelop5'),
    },
  ];

  const userProgress = getTutorialProgress({
    tutorialId: FLING_GAME_IN_APP_TUTORIAL_ID,
    userId: authenticatedUser.profile
      ? authenticatedUser.profile.id
      : undefined,
  });

  const inAppTutorialCards = [
    {
      key: 'create',
      title: t`Start your game`,
      description: t`Add your first characters to the scene and throw your first objects.`,
      keyPoints: [
        t`Game scene size`,
        t`Objects and characters`,
        t`Game Scenes`,
        t`Throwing physics`,
      ],
      durationInMinutes: 5,
      locked: false, // First phase is never locked
      // Phase is disabled if complete or if there's a running tutorial
      disabled:
        !!currentlyRunningInAppTutorial ||
        (!!userProgress &&
          !!userProgress.progress &&
          userProgress.progress[0] === 100),
      progress:
        userProgress && userProgress.progress ? userProgress.progress[0] : 0,
      renderImage: props => <Unboxing {...props} />,
    },
    {
      key: 'publish',
      title: t`Improve and publish your Game`,
      description: t`Add personality to your game and publish it online.`,
      keyPoints: [
        t`Game background`,
        t`In-game obstacles`,
        t`“You win” message`,
        t`Sharing online`,
      ],
      durationInMinutes: 10,
      // Second phase is locked if first phase is not complete
      locked:
        userProgress && userProgress.progress
          ? userProgress.progress[0] !== 100
          : true,
      // Phase is disabled if complete or if there's a running tutorial
      disabled:
        !!currentlyRunningInAppTutorial ||
        (!!userProgress &&
          !!userProgress.progress &&
          userProgress.progress[1] === 100),
      progress:
        userProgress && userProgress.progress ? userProgress.progress[1] : 0,
      renderImage: props => <Building {...props} />,
    },
    {
      key: 'leaderboards',
      title: t`Add leaderboards to your online Game`,
      description: t`Add player logins to your game and add a leaderboard.`,
      keyPoints: [
        t`Game personalisation`,
        t`“Start” screen`,
        t`Timers`,
        t`Leaderboards`,
      ],
      durationInMinutes: 15,
      // Second phase is locked if first phase is not complete
      locked:
        userProgress && userProgress.progress
          ? userProgress.progress[1] !== 100
          : true,
      // Phase is disabled if complete or if there's a running tutorial
      disabled:
        !!currentlyRunningInAppTutorial ||
        (!!userProgress &&
          !!userProgress.progress &&
          userProgress.progress[2] === 100),
      progress:
        userProgress && userProgress.progress ? userProgress.progress[2] : 0,
      renderImage: props => <Podium {...props} />,
    },
  ];

  const Subtitle = () => (
    <ResponsiveLineStackLayout
      justifyContent="space-between"
      alignItems="center"
      noColumnMargin
      noMargin
    >
      <Text noMargin>
        <Trans>Learn the basics of GDevelop and publish a first game.</Trans>
      </Text>
      <Checkbox
        label={<Trans>Don't show this screen on next startup</Trans>}
        checked={!showGetStartedSection}
        onCheck={(e, checked) => setShowGetStartedSection(!checked)}
      />
    </ResponsiveLineStackLayout>
  );

  const isTutorialComplete =
    userProgress &&
    typeof userProgress.progress === 'object' &&
    userProgress.progress.every &&
    userProgress.progress.every(item => item === 100);

  return (
    <SectionContainer
      title={
        shouldShowInAppTutorialButtons ? (
          <Trans>Create and Publish a Fling Game</Trans>
        ) : (
          <Trans>Get Started!</Trans>
        )
      }
      renderSubtitle={() => <Subtitle />}
    >
      {shouldShowInAppTutorialButtons && (
        <SectionRow>
          <Line>
            <div style={styles.bannerContainer}>
              {inAppTutorialShortHeaders === null ? (
                <PlaceholderLoader />
              ) : (
                <GridList
                  cols={
                    isTutorialComplete ? 1 : getColumnsFromWidth(windowWidth)
                  }
                  style={styles.grid}
                  cellHeight="auto"
                  spacing={ITEMS_SPACING * 2}
                >
                  {isTutorialComplete ? (
                    <GridListTile>
                      <InAppTutorialPhaseCard
                        title={t`Congratulations! You've finished this tutorial!`}
                        description={t`Find your finished game on the “Build” section. Or restart the tutorial by clicking on the card.`}
                        size="banner"
                        locked={false}
                        disabled={false}
                        renderImage={props => (
                          <Line justifyContent="space-around" expand>
                            <Unboxing {...props} />
                            <Building {...props} />
                            <Podium {...props} />
                          </Line>
                        )}
                        onClick={() =>
                          selectInAppTutorial(FLING_GAME_IN_APP_TUTORIAL_ID)
                        }
                      />
                    </GridListTile>
                  ) : (
                    inAppTutorialCards.map(item => (
                      <GridListTile key={item.key}>
                        <InAppTutorialPhaseCard
                          {...item}
                          onClick={() =>
                            selectInAppTutorial(FLING_GAME_IN_APP_TUTORIAL_ID)
                          }
                        />
                      </GridListTile>
                    ))
                  )}
                </GridList>
              )}
            </div>
          </Line>
        </SectionRow>
      )}
      <SectionRow>
        <Text size="title" noMargin>
          {shouldShowInAppTutorialButtons ? (
            <Trans>Want to explore further?</Trans>
          ) : (
            <Trans>Explore GDevelop Content</Trans>
          )}
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
                  <div
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
                  </div>
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
