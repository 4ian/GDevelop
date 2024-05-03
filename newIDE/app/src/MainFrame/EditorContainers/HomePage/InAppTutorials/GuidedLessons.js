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

const getColumnsFromWindowSize = (
  windowSize: WindowSizeType,
  isLandscape: boolean
) => {
  switch (windowSize) {
    case 'small':
      return isLandscape ? 4 : 1;
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
      id: JOYSTICK_IN_APP_TUTORIAL_ID,
      title: t`Joystick controls`,
      description: t`Learn how to add a joystick to control the player.`,
      durationInMinutes: 1,
      renderImage: props => <Joystick {...props} />,
    },
    {
      id: HEALTH_BAR_IN_APP_TUTORIAL_ID,
      title: t`Health bar`,
      description: t`Learn how to display the health of a player on the foreground.`,
      durationInMinutes: 2,
      renderImage: props => <HealthBar {...props} />,
    },
    {
      id: OBJECT_3D_IN_APP_TUTORIAL_ID,
      title: t`3D box`,
      description: t`Learn how to add a 3D box to your game.`,
      durationInMinutes: 2,
      renderImage: props => <Object3D {...props} />,
    },
    {
      id: CAMERA_PARALLAX_IN_APP_TUTORIAL_ID,
      title: t`Background`,
      description: t`Learn how to create a parallax background as well as a camera that follows the player.`,
      durationInMinutes: 2,
      renderImage: props => <Parallax {...props} />,
    },
    {
      id: TIMER_IN_APP_TUTORIAL_ID,
      title: t`Timer`,
      description: t`Learn how to use a timer to count a score.`,
      durationInMinutes: 2,
      renderImage: props => <Timer {...props} />,
    },
    {
      id: PLINKO_MULTIPLIER_IN_APP_TUTORIAL_ID,
      title: t`Score multiplier`,
      description: t`Learn how to manipulate a score by adding collectibles.`,
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
