// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import {
  useResponsiveWindowSize,
  type WindowSizeType,
} from '../../../../UI/Responsive/ResponsiveWindowMeasurer';
import { Line } from '../../../../UI/Grid';
import InAppTutorialContext from '../../../../InAppTutorial/InAppTutorialContext';
import PlaceholderLoader from '../../../../UI/PlaceholderLoader';
import { LARGE_WIDGET_SIZE } from '../CardWidget';
import InAppTutorialPhaseCard from './InAppTutorialPhaseCard';
import PlaceholderError from '../../../../UI/PlaceholderError';
import { FLING_GAME_IN_APP_TUTORIAL_ID } from '../../../../Utils/GDevelopServices/InAppTutorial';
import PreferencesContext from '../../../Preferences/PreferencesContext';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import Building from './Icons/Building';
import Unboxing from './Icons/Unboxing';
import Podium from './Icons/Podium';

const getColumnsFromWindowSize = (
  windowSize: WindowSizeType,
  isLandscape: boolean
) => {
  switch (windowSize) {
    case 'small':
      return isLandscape ? 3 : 1;
    case 'medium':
    case 'large':
    case 'xlarge':
    default:
      return 3;
  }
};

const MAX_COLUMNS = getColumnsFromWindowSize('xlarge', true);
const MAX_SECTION_WIDTH = (LARGE_WIDGET_SIZE + 2 * 5) * MAX_COLUMNS; // widget size + 5 padding per side
const ITEMS_SPACING = 5;
const styles = {
  grid: {
    textAlign: 'center',
    // Avoid tiles taking too much space on large screens.
    maxWidth: MAX_SECTION_WIDTH,
    overflow: 'hidden',
    width: `calc(100% + ${2 * ITEMS_SPACING}px)`, // This is needed to compensate for the `margin: -5px` added by MUI related to spacing.
  },
  bannerContainer: {
    width: '100%',
    maxWidth: MAX_SECTION_WIDTH - 2 * ITEMS_SPACING,
  },
};

type Props = {|
  selectInAppTutorial: (tutorialId: string) => void,
|};

const FlingGame = ({ selectInAppTutorial }: Props) => {
  const {
    inAppTutorialShortHeaders,
    inAppTutorialsFetchingError,
    fetchInAppTutorials,
    currentlyRunningInAppTutorial,
  } = React.useContext(InAppTutorialContext);
  const { getTutorialProgress } = React.useContext(PreferencesContext);
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const { windowSize, isLandscape } = useResponsiveWindowSize();

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
              isFlingTutorialComplete
                ? 1
                : getColumnsFromWindowSize(windowSize, isLandscape)
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
  );
};

export default FlingGame;
