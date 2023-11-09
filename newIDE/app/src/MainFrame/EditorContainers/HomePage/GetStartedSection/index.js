// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import {
  useResponsiveWindowWidth,
  type WidthType,
} from '../../../../UI/Reponsive/ResponsiveWindowMeasurer';
import Checkbox from '../../../../UI/Checkbox';
import { Line, LargeSpacer, Spacer } from '../../../../UI/Grid';
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
import InAppTutorialPhaseCard from '../InAppTutorials/InAppTutorialPhaseCard';
import GuidedLessons from '../InAppTutorials/GuidedLessons';
import Unboxing from '../InAppTutorials/Icons/Unboxing';
import Building from '../InAppTutorials/Icons/Building';
import Podium from '../InAppTutorials/Icons/Podium';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import PreferencesContext from '../../../Preferences/PreferencesContext';
import PlaceholderError from '../../../../UI/PlaceholderError';
import { FLING_GAME_IN_APP_TUTORIAL_ID } from '../../../../Utils/GDevelopServices/InAppTutorial';
import ErrorBoundary from '../../../../UI/ErrorBoundary';

const getColumnsFromWidth = (width: WidthType) => {
  switch (width) {
    case 'small':
      return 1;
    case 'medium':
      return 2;
    case 'large':
    case 'xlarge':
    default:
      return 3;
  }
};

const MAX_COLUMNS = getColumnsFromWidth('xlarge');
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
  onTabChange: (tab: HomeTab) => void,
  selectInAppTutorial: (tutorialId: string) => void,
  showGetStartedSection: boolean,
  setShowGetStartedSection: (enabled: boolean) => void,
|};

const GetStartedSection = ({
  onTabChange,
  selectInAppTutorial,
  showGetStartedSection,
  setShowGetStartedSection,
}: Props) => {
  const {
    inAppTutorialShortHeaders,
    inAppTutorialsFetchingError,
    fetchInAppTutorials,
    currentlyRunningInAppTutorial,
  } = React.useContext(InAppTutorialContext);
  const { getTutorialProgress } = React.useContext(PreferencesContext);
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const windowWidth = useResponsiveWindowWidth();
  const isMobile = windowWidth === 'small';
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

  const getTutorialPartProgress = ({
    tutorialId,
    part,
  }: {
    tutorialId: string,
    part: number,
  }) => {
    const tutorialProgress = getTutorialProgress({
      tutorialId,
      userId: authenticatedUser.profile
        ? authenticatedUser.profile.id
        : undefined,
    });
    if (!tutorialProgress || !tutorialProgress.progress) return 0;
    return tutorialProgress.progress[part];
  };

  const isTutorialPartComplete = ({
    tutorialId,
    part,
  }: {
    tutorialId: string,
    part: number,
  }) => {
    return (
      getTutorialPartProgress({
        tutorialId,
        part,
      }) === 100
    );
  };

  const flingInAppTutorialCards = [
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
        isTutorialPartComplete({
          tutorialId: FLING_GAME_IN_APP_TUTORIAL_ID,
          part: 0,
        }),
      progress: getTutorialPartProgress({
        tutorialId: FLING_GAME_IN_APP_TUTORIAL_ID,
        part: 0,
      }),
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
      locked: !isTutorialPartComplete({
        tutorialId: FLING_GAME_IN_APP_TUTORIAL_ID,
        part: 0,
      }),
      // Phase is disabled if complete or if there's a running tutorial
      disabled:
        !!currentlyRunningInAppTutorial ||
        isTutorialPartComplete({
          tutorialId: FLING_GAME_IN_APP_TUTORIAL_ID,
          part: 1,
        }),
      progress: getTutorialPartProgress({
        tutorialId: FLING_GAME_IN_APP_TUTORIAL_ID,
        part: 1,
      }),
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
      // Third phase is locked if second phase is not complete
      locked: !isTutorialPartComplete({
        tutorialId: FLING_GAME_IN_APP_TUTORIAL_ID,
        part: 1,
      }),
      // Phase is disabled if complete or if there's a running tutorial
      disabled:
        !!currentlyRunningInAppTutorial ||
        isTutorialPartComplete({
          tutorialId: FLING_GAME_IN_APP_TUTORIAL_ID,
          part: 2,
        }),
      progress: getTutorialPartProgress({
        tutorialId: FLING_GAME_IN_APP_TUTORIAL_ID,
        part: 2,
      }),
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

  const isFlingTutorialComplete =
    isTutorialPartComplete({
      tutorialId: FLING_GAME_IN_APP_TUTORIAL_ID,
      part: 0,
    }) &&
    isTutorialPartComplete({
      tutorialId: FLING_GAME_IN_APP_TUTORIAL_ID,
      part: 1,
    }) &&
    isTutorialPartComplete({
      tutorialId: FLING_GAME_IN_APP_TUTORIAL_ID,
      part: 2,
    });

  return (
    <SectionContainer
      title={<Trans>Guided lessons</Trans>}
      renderSubtitle={() => <Subtitle />}
    >
      <SectionRow>
        <GuidedLessons selectInAppTutorial={selectInAppTutorial} />
      </SectionRow>
      <SectionRow>
        <Text size="title" noMargin>
          <Trans>Create and Publish a Fling game</Trans>
        </Text>
        <Text size="body" color="secondary" noMargin>
          <Trans>
            3-part tutorial to creating and publishing a game from scratch.
          </Trans>
        </Text>
        <Spacer />
        <Line>
          <div style={styles.bannerContainer}>
            {inAppTutorialsFetchingError ? (
              <PlaceholderError onRetry={fetchInAppTutorials}>
                <Trans>An error occurred when downloading the tutorials.</Trans>{' '}
                <Trans>
                  Please check your internet connection or try again later.
                </Trans>
              </PlaceholderError>
            ) : inAppTutorialShortHeaders === null ? (
              <PlaceholderLoader />
            ) : (
              <GridList
                cols={
                  isFlingTutorialComplete ? 1 : getColumnsFromWidth(windowWidth)
                }
                style={styles.grid}
                cellHeight="auto"
                spacing={ITEMS_SPACING * 2}
              >
                {isFlingTutorialComplete ? (
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
                  flingInAppTutorialCards.map(item => (
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
                  useDefaultDisabledStyle
                >
                  <div
                    style={{
                      ...styles.cardTextContainer,
                      padding: isMobile ? 10 : 20,
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

const GetStartedSectionWithErrorBoundary = (props: Props) => (
  <ErrorBoundary
    componentTitle={<Trans>Get started section</Trans>}
    scope="start-page-get-started"
  >
    <GetStartedSection {...props} />
  </ErrorBoundary>
);

export default GetStartedSectionWithErrorBoundary;
