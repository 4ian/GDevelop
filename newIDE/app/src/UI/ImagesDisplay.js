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
  mobileImageCarouselItem: {
    height: 200,
    aspectRatio: '16 / 9',
  },
  grid: {
    overflowX: 'scroll',
    overflowY: 'hidden',
  },
  mobileGrid: {
    overflowX: 'hidden',
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

  const mobileGrid = React.useRef<?HTMLDivElement>(null);
  const isTouching = React.useRef<boolean>(false);

  const [startDragX, setStartDragX] = React.useState(null);
  const [positionX, setPositionX] = React.useState(0);
  const [
    mobileGridScrollXBeforeTouch,
    setMobileGridScrollXBeforeTouch,
  ] = React.useState<number>(0);

  const handleTouchStart = (event: TouchEvent) => {
    isTouching.current = true;
    setStartDragX(event.changedTouches[0].clientX);
  };

  const handleTouchEnd = (event: TouchEvent) => {
    isTouching.current = false;

    if (!startDragX) return;
    const endDragX = event.changedTouches[0].clientX;
    const newIndex =
      startDragX - endDragX > 50
        ? Math.min(selectedImageIndex + 1, imagesUrls.length - 1)
        : startDragX - endDragX < -50
        ? Math.max(selectedImageIndex - 1, 0)
        : selectedImageIndex;

    setSelectedImageIndex(newIndex);
    const { current } = mobileGrid;
    if (!current) return;
    const step = current.scrollWidth / imagesUrls.length;
    current.scrollTo({
      left: newIndex * step,
      behavior: 'smooth',
    });
    setMobileGridScrollXBeforeTouch(newIndex * step);
  };

  const handleTouchMove = (event: TouchEvent) => {
    if (!startDragX) return;
    const positionX = event.changedTouches[0].clientX;
    setPositionX(positionX - startDragX - mobileGridScrollXBeforeTouch);
  };

  React.useEffect(
    () => {
      if (!mobileGrid.current || !isTouching.current) return;
      mobileGrid.current.scrollTo(-positionX, 0);
    },
    [positionX]
  );

  if (windowWidth === 'small') {
    return (
      <Column noMargin>
        <Grid
          classes={classesForGridContainer}
          container
          spacing={1}
          wrap="nowrap"
          style={styles.mobileGrid}
          onTouchMove={handleTouchMove}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          ref={mobileGrid}
        >
          {imagesUrls.map((url, index) => (
            <Grid item key={url}>
              <CardMedia>
                <CorsAwareImage
                  src={url}
                  style={styles.mobileImageCarouselItem}
                  alt={``}
                />
              </CardMedia>
            </Grid>
          ))}
        </Grid>
        <Line justifyContent="center">
          <Text noMargin size="body2">
            {selectedImageIndex + 1}/{imagesUrls.length}
          </Text>
        </Line>
      </Column>
    );
  }

  return (
    <Column noMargin>
      <CorsAwareImage
        style={styles.mainImage}
        src={imagesUrls[selectedImageIndex]}
        alt={``}
      />
      <Line>
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
      </Line>
    </Column>
  );
};

export default ImagesDisplay;
