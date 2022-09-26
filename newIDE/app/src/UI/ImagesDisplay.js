// @flow
import { CardMedia, Grid, makeStyles } from '@material-ui/core';
import * as React from 'react';
import { CorsAwareImage } from './CorsAwareImage';
import { Line, Column } from './Grid';

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

const useStyles = makeStyles({
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

  const classes = useStyles();

  return (
    <Column noMargin>
      <CorsAwareImage
        style={styles.mainImage}
        src={imagesUrls[selectedImageIndex]}
        alt={``}
      />
      <Line>
        <Grid
          classes={classes}
          container
          spacing={1}
          wrap="nowrap"
          style={styles.grid}
        >
          {imagesUrls.map((url, index) => (
            <Grid item key={url}>
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
      </Line>
    </Column>
  );
};

export default ImagesDisplay;
