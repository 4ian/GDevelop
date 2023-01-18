// @flow
import * as React from 'react';
import Measure from 'react-measure';
import { makeStyles } from '@material-ui/core/styles';
import CardMedia from '@material-ui/core/CardMedia';
import Grid from '@material-ui/core/Grid';
import { CorsAwareImage } from './CorsAwareImage';
import { Line } from './Grid';
import { shouldValidate } from './KeyboardShortcuts/InteractionKeys';
import { useResponsiveWindowWidth } from './Reponsive/ResponsiveWindowMeasurer';
import Text from './Text';
import { ColumnStackLayout } from './Layout';

const styles = {
  mainImage: {
    width: '100%',
    // Prevent cumulative layout shift by enforcing
    // the 16:9 ratio.
    aspectRatio: '16 / 9',
    objectFit: 'cover',
    borderRadius: 8,
  },
  carouselItem: {
    display: 'inline-block',
    outlineOffset: -1,
    borderRadius: 4,
  },
  imageCarouselItem: {
    height: 80,
    aspectRatio: '16 / 9',
    display: 'block',
    borderRadius: 4,
  },
  mobileImageCarouselItem: {
    aspectRatio: '16 / 9',
    display: 'block',
    borderRadius: 8,
  },
  desktopGallery: {
    flex: 1,
    display: 'grid',
    grid: 'auto / auto-flow max-content',
    overflowX: 'scroll',
    gap: '8px',
  },
  mobileGrid: {
    overflowX: 'scroll',
    overflowY: 'hidden',
    scrollSnapType: 'x mandatory',
  },
  flex: {
    display: 'flex',
  },
  flexColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  disabledText: { opacity: 0.6 },
};

const GRID_SPACING = 1;

type Props = {|
  imagesUrls: Array<string>,
  /**
   * Alt text inserted for each image tag.
   * The string `{imageIndex}` will be replaced with image actual index.
   * For instance: "Asset pack preview image {imageIndex}"
   */
  altTextTemplate: string,
  horizontalOuterMarginToEatOnMobile?: number,
|};

const ResponsiveImagesGallery = ({
  imagesUrls,
  altTextTemplate,
  horizontalOuterMarginToEatOnMobile,
}: Props) => {
  const [selectedImageIndex, setSelectedImageIndex] = React.useState<number>(0);
  const windowWidth = useResponsiveWindowWidth();
  const isMobile = windowWidth === 'small';

  const mobileExtremeItemsPadding =
    isMobile && horizontalOuterMarginToEatOnMobile
      ? 2 * horizontalOuterMarginToEatOnMobile
      : 0;

  const classesForGridContainer = React.useMemo(
    () =>
      makeStyles({
        'spacing-xs-1': {
          margin: 0, // Prevent grid to apply negative margin, creating unwanted scroll bars.
          // Remove padding for first and last element to keep images aligned on component max width
          '& > .MuiGrid-item:first-child': {
            paddingLeft: mobileExtremeItemsPadding,
          },
          '& > .MuiGrid-item:last-child': {
            paddingRight: mobileExtremeItemsPadding,
          },
        },
        root: isMobile
          ? {
              scrollbarHeight: 'none' /* For Firefox */,
              '-ms-overflow-style': 'none' /* For Internet Explorer and Edge */,
              '&::-webkit-scrollbar': {
                height: 0 /* For Chrome, Safari, and Opera */,
              },
            }
          : undefined,
      }),
    [mobileExtremeItemsPadding, isMobile]
  )();

  const [
    mobileGridClientWidth,
    setMobileGridClientWidth,
  ] = React.useState<number>(0);
  const [mobileGridScrollX, setMobileGridScrollX] = React.useState(0);
  const [
    currentlyViewedImageIndex,
    setCurrentlyViewedImageIndex,
  ] = React.useState<number>(0);

  const mobileImageWidth =
    mobileGridClientWidth -
    30 - // Width kept for user to see that there's an image after or before
    (horizontalOuterMarginToEatOnMobile || 0);

  React.useEffect(
    () => {
      setCurrentlyViewedImageIndex(
        Math.round(mobileGridScrollX / (mobileImageWidth + GRID_SPACING))
      );
    },
    [mobileImageWidth, mobileGridScrollX]
  );

  if (isMobile) {
    return (
      <div
        style={{
          ...styles.flexColumn,
          marginLeft: horizontalOuterMarginToEatOnMobile
            ? -horizontalOuterMarginToEatOnMobile
            : 0,
          marginRight: horizontalOuterMarginToEatOnMobile
            ? -horizontalOuterMarginToEatOnMobile
            : 0,
        }}
      >
        <Measure
          bounds
          onResize={contentRect => {
            setMobileGridClientWidth(contentRect.bounds.width);
          }}
        >
          {({ contentRect, measureRef }) => (
            <div style={styles.flex} ref={measureRef}>
              <Grid
                classes={classesForGridContainer}
                container
                spacing={GRID_SPACING}
                wrap="nowrap"
                style={styles.mobileGrid}
                onScroll={(event: SyntheticEvent<HTMLDivElement>) =>
                  setMobileGridScrollX(event.currentTarget.scrollLeft)
                }
              >
                {imagesUrls.map((url, index) => (
                  <Grid
                    item
                    key={url}
                    style={{
                      scrollSnapAlign: horizontalOuterMarginToEatOnMobile
                        ? 'center'
                        : 'start',
                    }}
                  >
                    <CardMedia>
                      <CorsAwareImage
                        src={url}
                        style={{
                          ...styles.mobileImageCarouselItem,
                          height: mobileImageWidth / (16 / 9),
                        }}
                        alt={altTextTemplate.replace(
                          /{imageIndex}/g,
                          String(selectedImageIndex + 1)
                        )}
                      />
                    </CardMedia>
                  </Grid>
                ))}
              </Grid>
            </div>
          )}
        </Measure>
        <Line justifyContent="center">
          <Text noMargin size="body2" style={styles.disabledText}>
            {currentlyViewedImageIndex + 1}/{imagesUrls.length}
          </Text>
        </Line>
      </div>
    );
  }
  return (
    <ColumnStackLayout noMargin>
      <CorsAwareImage
        style={styles.mainImage}
        src={imagesUrls[selectedImageIndex]}
        alt={altTextTemplate.replace(
          /{imageIndex}/g,
          String(selectedImageIndex + 1)
        )}
      />
      <div style={styles.desktopGallery}>
        {imagesUrls.map((url, index) => (
          <div
            key={url}
            onClick={() => setSelectedImageIndex(index)}
            tabIndex={0}
            style={{
              ...styles.carouselItem,
              outline:
                index === selectedImageIndex ? 'solid 1px white' : undefined,
            }}
            onKeyPress={(
              event: SyntheticKeyboardEvent<HTMLLIElement>
            ): void => {
              if (shouldValidate(event)) {
                setSelectedImageIndex(index);
              }
            }}
          >
            <CorsAwareImage
              src={url}
              style={styles.imageCarouselItem}
              alt={altTextTemplate.replace(
                /{imageIndex}/g,
                (index + 1).toString()
              )}
            />
          </div>
        ))}
      </div>
    </ColumnStackLayout>
  );
};

export default ResponsiveImagesGallery;
