// @flow
import * as React from 'react';
import { type Tutorial } from '../../../../Utils/GDevelopServices/Tutorial';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import ButtonBase from '@material-ui/core/ButtonBase';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import { Column, Line } from '../../../../UI/Grid';
import {
  useResponsiveWindowWidth,
  type WidthType,
} from '../../../../UI/Reponsive/ResponsiveWindowMeasurer';
import { CorsAwareImage } from '../../../../UI/CorsAwareImage';
import Text from '../../../../UI/Text';
import { shortenString } from '../../../../Utils/StringHelpers';
import { sendTutorialOpened } from '../../../../Utils/Analytics/EventSender';
import Window from '../../../../Utils/Window';
import { Trans } from '@lingui/macro';
import { Typography } from '@material-ui/core';

const secondsToMinutesAndSeconds = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const formattedRemainingSeconds =
    remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
  return `${minutes}:${formattedRemainingSeconds}`;
};

const styles = {
  tutorialsContainer: {
    marginTop: 25,
  },
  grid: {
    maxWidth: 1200, // Avoid tiles taking too much space on large screens.
  },
  buttonStyle: {
    textAlign: 'left',
    width: '100%',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
  },
  overlay: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    background: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 4,
    padding: '2px 6px',
  },
  overlayText: {
    color: 'white', // Same color for all themes.
    marginTop: 0,
    marginBottom: 0,
  },
  titleContainer: {
    // Fix min height to ensure the content stays aligned.
    // 2 line heights (20) + 2 text paddings (6)
    minHeight: 2 * 20 + 2 * 6,
  },
  thumbnailImageWithDescription: {
    objectFit: 'contain',
    verticalAlign: 'middle',
    backgroundColor: 'black',
    width: 'calc(100% - 2px)', // Not full because of border.
    borderRadius: 8,
    border: '1px solid lightgrey',
    // Prevent cumulative layout shift by enforcing
    // the 16:9 ratio.
    aspectRatio: '16 / 9',
  },
};

// Styles to give the impression of pressing an element.
const useStylesForTile = makeStyles(theme =>
  createStyles({
    tile: {
      borderRadius: 8,
      padding: 4,
      '&:focus': {
        backgroundColor: theme.palette.action.hover,
      },
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
      },
    },
  })
);

const getColumnsFromWidth = (width: WidthType) => {
  switch (width) {
    case 'small':
      return 1;
    case 'medium':
      return 3;
    case 'large':
    default:
      return 5;
  }
};

const ImageOverlay = ({ text }) => (
  <div style={styles.overlay}>
    <Typography variant="body1" style={styles.overlayText}>
      {text ? secondsToMinutesAndSeconds(text) : <Trans>Text</Trans>}
    </Typography>
  </div>
);

type TutorialsGridProps = {|
  tutorials: Array<Tutorial>,
  limit?: number,
|};

const TutorialsGrid = ({ tutorials, limit }: TutorialsGridProps) => {
  const windowWidth = useResponsiveWindowWidth();
  const tileClasses = useStylesForTile();
  const tutorialsToDisplay = limit ? tutorials.slice(0, limit) : tutorials;

  return (
    <div style={styles.tutorialsContainer}>
      <Line noMargin>
        <GridList
          cols={getColumnsFromWidth(windowWidth)}
          style={styles.grid}
          cellHeight="auto"
          spacing={16}
        >
          {tutorialsToDisplay.map((tutorial, index) => (
            <GridListTile key={index} classes={tileClasses}>
              <ButtonBase
                style={styles.buttonStyle}
                onClick={() => {
                  sendTutorialOpened(tutorial.id);
                  Window.openExternalURL(tutorial.link);
                }}
              >
                <Column noMargin>
                  <div style={styles.imageContainer}>
                    <CorsAwareImage
                      style={styles.thumbnailImageWithDescription}
                      src={tutorial.thumbnailUrl}
                      alt={tutorial.title}
                    />
                    <ImageOverlay text={tutorial.duration} />
                  </div>
                  <div style={styles.titleContainer}>
                    <Text size="sub-title">{tutorial.title}</Text>
                  </div>
                  <Text size="body" color="secondary">
                    {shortenString(tutorial.description, 120)}
                  </Text>
                </Column>
              </ButtonBase>
            </GridListTile>
          ))}
        </GridList>
      </Line>
    </div>
  );
};

export default TutorialsGrid;
