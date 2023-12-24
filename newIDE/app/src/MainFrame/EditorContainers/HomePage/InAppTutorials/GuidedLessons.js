// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import {
  useResponsiveWindowWidth,
  type WidthType,
} from '../../../../UI/Reponsive/ResponsiveWindowMeasurer';
import { Column, Line } from '../../../../UI/Grid';
import InAppTutorialContext from '../../../../InAppTutorial/InAppTutorialContext';
import PlaceholderLoader from '../../../../UI/PlaceholderLoader';
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

const getColumnsFromWidth = (width: WidthType) => {
  switch (width) {
    case 'small':
      return 1;
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

const MAX_COLUMNS = getColumnsFromWidth('xlarge');
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
  const windowWidth = useResponsiveWindowWidth();

  const getTutorialPartProgress = ({ tutorialId }: { tutorialId: string }) => {
    const tutorialProgress = getTutorialProgress({
      tutorialId,
      userId: authenticatedUser.profile
        ? authenticatedUser.profile.id
        : undefined,
    });
    if (!tutorialProgress || !tutorialProgress.progress) return 0;
    return tutorialProgress.progress[0]; // guided lessons only have one part.
  };

  const lessonsCompleted = guidedLessonsIds.reduce((acc, tutorialId) => {
    const tutorialProgress = getTutorialPartProgress({ tutorialId }) || 0;
    return tutorialProgress === 100 ? acc + 1 : acc;
  }, 0);
  const lessonsProgress = Math.round(
    (lessonsCompleted / guidedLessonsIds.length) * 100
  );

  const guidedLessonCards = [
    {
      id: JOYSTICK_IN_APP_TUTORIAL_ID,
      title: t`Add Joystick controls`,
      description: t`Learn how to add a joystick to control the player.`,
      keyPoints: [
        t`Add a layer`,
        t`Download and use a prefab`,
        t`Use a behavior`,
      ],
      durationInMinutes: 1,
      renderImage: props => <Joystick {...props} />,
    },
    {
      id: HEALTH_BAR_IN_APP_TUTORIAL_ID,
      title: t`Display a Health bar for the player`,
      description: t`Learn how to display the health of a player on the foreground.`,
      keyPoints: [t`Add a layer`, t`Download and use a prefab`],
      durationInMinutes: 2,
      renderImage: props => <HealthBar {...props} />,
    },
    {
      id: OBJECT_3D_IN_APP_TUTORIAL_ID,
      title: t`Add a 3D object`,
      description: t`Learn how to add a 3D object to your game.`,
      keyPoints: [
        t`Add a 3D box`,
        t`Add a behavior`,
        t`Update the elevation of a 3D box`,
      ],
      durationInMinutes: 2,
      renderImage: props => <Object3D {...props} />,
    },
    {
      id: CAMERA_PARALLAX_IN_APP_TUTORIAL_ID,
      title: t`Improve background and camera`,
      description: t`Learn how to create a parallax background as well as a camera that follows the player.`,
      keyPoints: [
        t`Add an extension`,
        t`Add a layer`,
        t`Use a tiled sprite`,
        t`Control the camera`,
      ],
      durationInMinutes: 2,
      renderImage: props => <Parallax {...props} />,
    },
    {
      id: TIMER_IN_APP_TUTORIAL_ID,
      title: t`Use a timer`,
      description: t`Learn how to use a timer to count a score.`,
      keyPoints: [
        t`Create and use a timer`,
        t`Create and modify a text`,
        t`Build an expression`,
      ],
      durationInMinutes: 2,
      renderImage: props => <Timer {...props} />,
    },
    {
      id: PLINKO_MULTIPLIER_IN_APP_TUTORIAL_ID,
      title: t`Add score multiplier`,
      description: t`Learn how to manipulate a score by adding collectibles.`,
      keyPoints: [
        t`Create a variable`,
        t`Use & manipulate a variable`,
        t`Build an expression`,
      ],
      durationInMinutes: 3,
      renderImage: props => <MultiplierScore {...props} />,
    },
  ].filter(item => (lessonsIds ? lessonsIds.includes(item.id) : true));

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
          <ColumnStackLayout noMargin>
            {!lessonsIds && (
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
            )}
            <GridList
              cols={getColumnsFromWidth(windowWidth)}
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
                    keyPoints={item.keyPoints}
                    renderImage={item.renderImage}
                    progress={getTutorialPartProgress({ tutorialId: item.id })}
                    onClick={() => selectInAppTutorial(item.id)}
                    // Phase is disabled if there's a running tutorial or if offline,
                    // because we cannot fetch the tutorial.
                    disabled={!!currentlyRunningInAppTutorial || !isOnline}
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
