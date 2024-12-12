// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import {
  useResponsiveWindowSize,
  type WindowSizeType,
} from '../../../../UI/Responsive/ResponsiveWindowMeasurer';
import { Column, Line } from '../../../../UI/Grid';
import InAppTutorialContext from '../../../../InAppTutorial/InAppTutorialContext';
import { LARGE_WIDGET_SIZE } from '../CardWidget';
import InAppTutorialPhaseCard from './InAppTutorialPhaseCard';
import PlaceholderError from '../../../../UI/PlaceholderError';
import {
  PLINKO_MULTIPLIER_IN_APP_TUTORIAL_ID,
  TIMER_IN_APP_TUTORIAL_ID,
  CAMERA_PARALLAX_IN_APP_TUTORIAL_ID,
  HEALTH_BAR_IN_APP_TUTORIAL_ID,
  JOYSTICK_IN_APP_TUTORIAL_ID,
  OBJECT_3D_IN_APP_TUTORIAL_ID,
  KNIGHT_PLATFORMER_IN_APP_TUTORIAL_ID,
  TOP_DOWN_RPG_MOVEMENT_ID,
  FIRE_A_BULLET_ID,
  COOP_PLATFORMER_ID,
  TILEMAP_PLATFORMER_ID,
  guidedLessonsIds,
} from '../../../../Utils/GDevelopServices/InAppTutorial';
import MultiplierScore from './Icons/MultiplierScore';
import Parallax from './Icons/Parallax';
import HealthBar from './Icons/HealthBar';
import Joystick from './Icons/Joystick';
import Timer from './Icons/Timer';
import { useOnlineStatus } from '../../../../Utils/OnlineStatus';
import PreferencesContext from '../../../Preferences/PreferencesContext';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import { ColumnStackLayout, LineStackLayout } from '../../../../UI/Layout';
import Text from '../../../../UI/Text';
import ColoredLinearProgress from '../../../../UI/ColoredLinearProgress';
import Trophy from '../../../../UI/CustomSvgIcons/Trophy';
import Object3D from './Icons/Object3D';
import Platformer from './Icons/Platformer';
import TopDownRPGMovement from './Icons/TopDownRPGMovement';
import FireABullet from './Icons/FireAbullet';
import CoopPlatformer from './Icons/CoopPlatformer';
import TilemapPlatformer from './Icons/TilemapPlatformer';

const getColumnsFromWindowSize = (
  windowSize: WindowSizeType,
  isLandscape: boolean
) => {
  switch (windowSize) {
    case 'small':
      return isLandscape ? 4 : 2;
    case 'medium':
      return 3;
    case 'large':
      return 4;
    case 'xlarge':
      return 6;
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
  /** To use to restrict the lessons that are displayed. */
  lessonsIds?: ?Array<string>,
|};

const GuidedLessons = ({ selectInAppTutorial, lessonsIds }: Props) => {
  const isOnline = useOnlineStatus();
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
  }: {|
    tutorialId: string,
  |}) => {
    const tutorialProgress = getTutorialProgress({
      tutorialId,
      userId: authenticatedUser.profile
        ? authenticatedUser.profile.id
        : undefined,
    });
    if (!tutorialProgress || !tutorialProgress.progress) return 0;
    return tutorialProgress.progress[0]; // guided lessons only have one part.
  };

  const displayedGuidedLessonsIds = lessonsIds || guidedLessonsIds;

  const lessonsCompleted = displayedGuidedLessonsIds.reduce(
    (acc, tutorialId) => {
      const tutorialProgress = getTutorialPartProgress({ tutorialId }) || 0;
      return tutorialProgress === 100 ? acc + 1 : acc;
    },
    0
  );
  const lessonsProgress = Math.round(
    (lessonsCompleted / displayedGuidedLessonsIds.length) * 100
  );

  const guidedLessonCards = [
    {
      id: KNIGHT_PLATFORMER_IN_APP_TUTORIAL_ID,
      title: t`Platformer`,
      description: t`Make a knight jump and run in this platformer game.`,
      durationInMinutes: 1,
      renderImage: props => <Platformer {...props} />,
    },
    {
      id: TOP_DOWN_RPG_MOVEMENT_ID,
      title: t`Top-Down RPG Pixel Perfect`,
      description: t`Make a character move like in a retro Pokemon game.`,
      durationInMinutes: 2,
      renderImage: props => <TopDownRPGMovement {...props} />,
    },
    {
      id: FIRE_A_BULLET_ID,
      title: t`Fire a Bullet`,
      description: t`Fire bullets in this Asteroids game. Get ready for a Star Wars show.`,
      durationInMinutes: 3,
      renderImage: props => <FireABullet {...props} />,
    },
    {
      id: JOYSTICK_IN_APP_TUTORIAL_ID,
      title: t`Joystick controls`,
      description: t`Control your spaceship with a joystick, while avoiding asteroids.`,
      durationInMinutes: 1,
      renderImage: props => <Joystick {...props} />,
    },
    {
      id: OBJECT_3D_IN_APP_TUTORIAL_ID,
      title: t`3D platforms`,
      description: t`Place 3D platforms in this 2D platformer, creating a path to the end.`,
      durationInMinutes: 2,
      renderImage: props => <Object3D {...props} />,
    },
    {
      id: COOP_PLATFORMER_ID,
      title: t`Co-op Multiplayer`,
      description: t`Transform this platformer into a co-op game, where two players can play together.`,
      durationInMinutes: 3,
      renderImage: props => <CoopPlatformer {...props} />,
    },
    {
      id: HEALTH_BAR_IN_APP_TUTORIAL_ID,
      title: t`Health bar`,
      description: t`Add a health bar to this jumping character, losing health when hitting spikes.`,
      durationInMinutes: 2,
      renderImage: props => <HealthBar {...props} />,
    },
    {
      id: CAMERA_PARALLAX_IN_APP_TUTORIAL_ID,
      title: t`Background and cameras`,
      description: t`Follow this Castlevania-type chraracter with the camera, while the background scrolls.`,
      durationInMinutes: 2,
      renderImage: props => <Parallax {...props} />,
    },
    {
      id: TIMER_IN_APP_TUTORIAL_ID,
      title: t`Time score`,
      description: t`Add a time attack mode, where you have to reach the end as fast as possible.`,
      durationInMinutes: 2,
      renderImage: props => <Timer {...props} />,
    },
    {
      id: TILEMAP_PLATFORMER_ID,
      title: t`Paint a Level with Tiles`,
      description: t`Use a Tilemap to build a level and change it dynamically during the game.`,
      durationInMinutes: 1,
      renderImage: props => <TilemapPlatformer {...props} />,
    },
    {
      id: PLINKO_MULTIPLIER_IN_APP_TUTORIAL_ID,
      title: t`Score multiplier`,
      description: t`Transform this Plinko game with collectibles that multiply your score.`,
      durationInMinutes: 3,
      renderImage: props => <MultiplierScore {...props} />,
    },
  ].filter(item => displayedGuidedLessonsIds.includes(item.id));

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
        ) : (
          <ColumnStackLayout noMargin>
            <Column>
              <LineStackLayout alignItems="center">
                {lessonsProgress !== 100 ? (
                  <Text displayInlineAsSpan noMargin size="body2">
                    {lessonsProgress}%
                  </Text>
                ) : (
                  <Trophy />
                )}
                <ColoredLinearProgress value={lessonsProgress} />
              </LineStackLayout>
            </Column>
            <GridList
              cols={getColumnsFromWindowSize(windowSize, isLandscape)}
              style={styles.grid}
              cellHeight="auto"
              spacing={ITEMS_SPACING * 2}
            >
              {guidedLessonCards.map((item, index) => (
                <GridListTile key={item.id}>
                  <InAppTutorialPhaseCard
                    title={item.title}
                    description={item.description}
                    durationInMinutes={item.durationInMinutes}
                    renderImage={item.renderImage}
                    progress={getTutorialPartProgress({ tutorialId: item.id })}
                    onClick={() => selectInAppTutorial(item.id)}
                    // Phase is disabled if there's a running tutorial or if offline,
                    // because we cannot fetch the tutorial.
                    disabled={!!currentlyRunningInAppTutorial || !isOnline}
                    loading={!inAppTutorialShortHeaders}
                  />
                </GridListTile>
              ))}
            </GridList>
          </ColumnStackLayout>
        )}
      </div>
    </Line>
  );
};

export default GuidedLessons;
