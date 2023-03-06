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
  isMiniTutorial,
  PLINKO_MULTIPLIER_IN_APP_TUTORIAL_ID,
} from '../../../../Utils/GDevelopServices/InAppTutorial';
import MultiplierScore from './MultiplierScore';
import { useOnlineStatus } from '../../../../Utils/OnlineStatus';

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
  const isFullTutorialRunning =
    !!currentlyRunningInAppTutorial &&
    !isMiniTutorial(currentlyRunningInAppTutorial.id);

  const miniInAppTutorialCards = [
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
            {miniInAppTutorialCards.map(item => (
              <GridListTile key={item.id}>
                <InAppTutorialPhaseCard
                  title={item.title}
                  description={item.description}
                  durationInMinutes={item.durationInMinutes}
                  keyPoints={item.keyPoints}
                  renderImage={item.renderImage}
                  progress={0} // Alway start a mini tutorial from the beginning.
                  onClick={() => selectInAppTutorial(item.id)}
                  // Phase is disabled if there's a running full tutorial or if offline,
                  // because we cannot fetch the tutorial.
                  disabled={isFullTutorialRunning || !isOnline}
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
