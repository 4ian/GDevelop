// @flow
import * as React from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import ButtonBase from '@material-ui/core/ButtonBase';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import { Column, Line } from './Grid';
import {
  useResponsiveWindowWidth,
  type WidthType,
} from './Reponsive/ResponsiveWindowMeasurer';
import { CorsAwareImage } from './CorsAwareImage';
import Text from './Text';
import Skeleton from '@material-ui/lab/Skeleton';
import Typography from '@material-ui/core/Typography';
import { shortenString } from '../Utils/StringHelpers';

const MAX_TILE_SIZE = 300;
const SPACING = 8;

const styles = {
  container: {
    marginTop: 25,
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
  skeletonTile: { padding: 8, height: 'auto' },
  skeletonContainer: {
    padding: 4,
    aspectRatio: '16 / 9',
  },
  skeleton: { borderRadius: 8 },
};

// Styles to give the impression of pressing an element.
const useStylesForTile = makeStyles(theme =>
  createStyles({
    tile: {
      borderRadius: 8,
      padding: 4,
      height: 'auto',
      '&:focus': {
        backgroundColor: theme.palette.action.hover,
      },
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
      },
    },
  })
);

const ImageOverlay = ({ content }: {| content: React.Node |}) => (
  <div style={styles.overlay}>
    <Typography variant="body1" style={styles.overlayText}>
      {content}
    </Typography>
  </div>
);

export type ImageTileComponent = {|
  onClick: () => void,
  imageUrl: string,
  title?: string,
  description?: string,
  overlayText?: string | React.Node,
|};

type ImageTileGridProps = {|
  items: Array<ImageTileComponent>,
  isLoading?: boolean,
  getColumnsFromWidth: (width: WidthType) => number,
  getLimitFromWidth?: (width: WidthType) => number,
|};

const ImageTileGrid = ({
  items,
  isLoading,
  getColumnsFromWidth,
  getLimitFromWidth,
}: ImageTileGridProps) => {
  const windowWidth = useResponsiveWindowWidth();
  const tileClasses = useStylesForTile();
  const MAX_COLUMNS = getColumnsFromWidth('large');
  const limit = getLimitFromWidth ? getLimitFromWidth(windowWidth) : undefined;
  const itemsToDisplay = limit ? items.slice(0, limit) : items;

  return (
    <div style={styles.container}>
      <Line noMargin>
        <GridList
          cols={getColumnsFromWidth(windowWidth)}
          style={{
            flex: 1,
            maxWidth: (MAX_TILE_SIZE + 2 * SPACING) * MAX_COLUMNS, // Avoid tiles taking too much space on large screens.
          }}
          cellHeight="auto"
          spacing={SPACING * 2}
        >
          {isLoading
            ? new Array(getColumnsFromWidth(windowWidth))
                .fill(0)
                .map((_, index) => (
                  <GridListTile key={index} style={styles.skeletonTile}>
                    <div style={styles.skeletonContainer}>
                      <Skeleton
                        variant="rect"
                        width="100%"
                        height="100%"
                        style={styles.skeleton}
                      />
                    </div>
                  </GridListTile>
                ))
            : itemsToDisplay.map((item, index) => (
                <GridListTile key={index} classes={tileClasses}>
                  <ButtonBase
                    style={styles.buttonStyle}
                    onClick={item.onClick}
                    tabIndex={0}
                    focusRipple
                  >
                    <Column noMargin>
                      <div style={styles.imageContainer}>
                        <CorsAwareImage
                          style={styles.thumbnailImageWithDescription}
                          src={item.imageUrl}
                          alt={`thumbnail ${index}`}
                        />
                        {item.overlayText && (
                          <ImageOverlay content={item.overlayText} />
                        )}
                      </div>
                      {item.title && (
                        <div style={styles.titleContainer}>
                          <Text size="sub-title">{item.title}</Text>
                        </div>
                      )}
                      {item.description && (
                        <Text size="body" color="secondary">
                          {shortenString(item.description, 120)}
                        </Text>
                      )}
                    </Column>
                  </ButtonBase>
                </GridListTile>
              ))}
        </GridList>
      </Line>
    </div>
  );
};

export default ImageTileGrid;
