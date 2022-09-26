// @flow
import CardMedia from '@material-ui/core/CardMedia';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { CorsAwareImage } from './CorsAwareImage';
import { Line, Column } from './Grid';
import { shouldValidate } from './KeyboardShortcuts/InteractionKeys';
import { useResponsiveWindowWidth } from './Reponsive/ResponsiveWindowMeasurer';
import Text from './Text';

const styles = {
  mainImage: {
    width: '100%',
    // Prevent cumulative layout shift by enforcing
    // the 16:9 ratio.
    aspectRatio: '16 / 9',
    objectFit: 'cover',
  },
  carouselItem: {
    outlineOffset: -1,
  },
  imageCarouselItem: {
    height: 80,
    aspectRatio: '16 / 9',
    display: 'block',
  },
  grid: {
    overflowX: 'scroll',
    overflowY: 'hidden',
  },
};

const useStylesForGridContainer = makeStyles({
  'spacing-xs-1': {
    marginLeft: 0,
    marginRight: 0,
    '& > .MuiGrid-item:first-child': {
      paddingLeft: 0,
    },
    '& > .MuiGrid-item:last-child': {
      paddingRight: 0,
    },
  },
});

type Props = {|
  imagesUrls: Array<string>,
|};

const ImagesDisplay = ({ imagesUrls }: Props) => {
  const [selectedImageIndex, setSelectedImageIndex] = React.useState<number>(0);
  const windowWidth = useResponsiveWindowWidth();

  const classesForGridContainer = useStylesForGridContainer();

  return (
    <Column noMargin>
      <CorsAwareImage
        style={styles.mainImage}
        src={imagesUrls[selectedImageIndex]}
        alt={``}
      />
      <Line justifyContent="center">
        {windowWidth === 'small' ? (
          <Text noMargin size="body2">
            {selectedImageIndex + 1}/{imagesUrls.length}
          </Text>
        ) : (
          <Grid
            classes={classesForGridContainer}
            container
            spacing={1}
            wrap="nowrap"
            style={styles.grid}
          >
            {imagesUrls.map((url, index) => (
              <Grid
                item
                key={url}
                tabIndex={0}
                onKeyPress={(
                  event: SyntheticKeyboardEvent<HTMLLIElement>
                ): void => {
                  if (shouldValidate(event)) {
                    setSelectedImageIndex(index);
                  }
                }}
              >
                <CardMedia
                  onClick={() => setSelectedImageIndex(index)}
                  style={{
                    ...styles.carouselItem,
                    outline:
                      index === selectedImageIndex
                        ? 'solid 1px white'
                        : undefined,
                  }}
                >
                  <CorsAwareImage
                    src={url}
                    style={styles.imageCarouselItem}
                    alt={``}
                  />
                </CardMedia>
              </Grid>
            ))}
          </Grid>
        )}
      </Line>
    </Column>
  );
};

export default ImagesDisplay;
