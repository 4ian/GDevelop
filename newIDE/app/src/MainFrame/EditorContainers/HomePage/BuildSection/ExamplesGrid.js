// @flow
import * as React from 'react';
import { type ExampleShortHeader } from '../../../../Utils/GDevelopServices/Example';
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
import { sendExampleDetailsOpened } from '../../../../Utils/Analytics/EventSender';

const getColumnsFromWidth = (width: WidthType) => {
  switch (width) {
    case 'small':
      return 1;
    case 'medium':
      return 4;
    case 'large':
    default:
      return 6;
  }
};
const MAX_COLUMNS = getColumnsFromWidth('large');
const MAX_TILE_SIZE = 300;

const styles = {
  examplesContainer: {
    marginTop: 25,
  },
  grid: {
    maxWidth: (MAX_TILE_SIZE + 2 * 8) * MAX_COLUMNS, // Avoid tiles taking too much space on large screens.
  },
  buttonStyle: {
    textAlign: 'left',
    width: '100%',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
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

type ExamplesGridProps = {|
  exampleShortHeaders: Array<ExampleShortHeader>,
  limit?: number,
  onOpen: (exampleShortHeader: ExampleShortHeader) => void,
|};

const ExamplesGrid = ({
  exampleShortHeaders,
  limit,
  onOpen,
}: ExamplesGridProps) => {
  const windowWidth = useResponsiveWindowWidth();
  const tileClasses = useStylesForTile();
  const exampleShortHeadersToDisplay = limit
    ? exampleShortHeaders.slice(0, limit)
    : exampleShortHeaders;

  return (
    <div style={styles.examplesContainer}>
      <Line noMargin>
        <GridList
          cols={getColumnsFromWidth(windowWidth)}
          style={styles.grid}
          cellHeight="auto"
          spacing={16}
        >
          {exampleShortHeadersToDisplay.map((exampleShortHeader, index) => (
            <GridListTile key={index} classes={tileClasses}>
              <ButtonBase
                style={styles.buttonStyle}
                onClick={() => {
                  sendExampleDetailsOpened(exampleShortHeader.slug);
                  onOpen(exampleShortHeader);
                }}
              >
                <Column noMargin>
                  <div style={styles.imageContainer}>
                    <CorsAwareImage
                      style={styles.thumbnailImageWithDescription}
                      src={exampleShortHeader.previewImageUrls[0]}
                      alt={exampleShortHeader.slug}
                    />
                  </div>
                  <Text size="sub-title">{exampleShortHeader.name}</Text>
                </Column>
              </ButtonBase>
            </GridListTile>
          ))}
        </GridList>
      </Line>
    </div>
  );
};

export default ExamplesGrid;
