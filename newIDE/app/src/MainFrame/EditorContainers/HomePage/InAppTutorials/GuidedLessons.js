// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import {
  useResponsiveWindowWidth,
  type WidthType,
} from '../../../../UI/Reponsive/ResponsiveWindowMeasurer';
import { Line } from '../../../../UI/Grid';
import InAppTutorialContext from '../../../../InAppTutorial/InAppTutorialContext';
import PlaceholderLoader from '../../../../UI/PlaceholderLoader';
import { LARGE_WIDGET_SIZE } from '../CardWidget';
import InAppTutorialPhaseCard from './InAppTutorialPhaseCard';
import PlaceholderError from '../../../../UI/PlaceholderError';
import {
  PLINKO_MULTIPLIER_IN_APP_TUTORIAL_ID,
  CAMERA_PARALLAX_IN_APP_TUTORIAL_ID,
  HEALTH_BAR_IN_APP_TUTORIAL_ID,
  JOYSTICK_IN_APP_TUTORIAL_ID,
} from '../../../../Utils/GDevelopServices/InAppTutorial';
import MultiplierScore from './Icons/MultiplierScore';
import Parallax from './Icons/Parallax';
import HealthBar from './Icons/HealthBar';
import Joystick from './Icons/Joystick';
import { useOnlineStatus } from '../../../../Utils/OnlineStatus';

const getColumnsFromWidth = (width: WidthType) => {
  switch (width) {
    case 'small':
      return 1;
    case 'medium':
      return 3;
    case 'large':
      return 4;
    default:
      return 1;
  }
};

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
  bannerContainer: {
    width: '100%',
    maxWidth: MAX_SECTION_WIDTH - 2 * ITEMS_SPACING,
  },
};

type Props = {|
  selectInAppTutorial: (tutorialId: string) => void,
|};

const MiniInAppTutorials = ({ selectInAppTutorial }: Props) => {
  const isOnline = useOnlineStatus();
  const {
    inAppTutorialShortHeaders,
    inAppTutorialsFetchingError,
    fetchInAppTutorials,
  } = React.useContext(InAppTutorialContext);
  const windowWidth = useResponsiveWindowWidth();
  const { currentlyRunningInAppTutorial } = React.useContext(
    InAppTutorialContext
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
  ];

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
            cols={getColumnsFromWidth(windowWidth)}
            style={styles.grid}
            cellHeight="auto"
            spacing={ITEMS_SPACING * 2}
          >
            {guidedLessonCards.map(item => (
              <GridListTile key={item.id}>
                <InAppTutorialPhaseCard
                  title={item.title}
                  description={item.description}
                  durationInMinutes={item.durationInMinutes}
                  keyPoints={item.keyPoints}
                  renderImage={item.renderImage}
                  progress={0} // Alway start a mini tutorial from the beginning.
                  onClick={() => selectInAppTutorial(item.id)}
                  // Phase is disabled if there's a running tutorial or if offline,
                  // because we cannot fetch the tutorial.
                  disabled={!!currentlyRunningInAppTutorial || !isOnline}
                />
              </GridListTile>
            ))}
          </GridList>
        )}
      </div>
    </Line>
  );
};

export default MiniInAppTutorials;
