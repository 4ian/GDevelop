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

type MediaItem = {| kind: 'audio' | 'image', url: string |};

const styles = {
  selectedMedia: {
    width: '100%',
    // Prevent cumulative layout shift by enforcing
    // the 16:9 ratio.
    aspectRatio: '16 / 9',
    objectFit: 'cover',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  desktopGallery: {
    flex: 1,
    display: 'grid',
    grid: 'auto / auto-flow max-content',
    overflowX: 'scroll',
    scrollbarWidth: 'thin', // For Firefox, to avoid having a very large scrollbar.
    gap: '8px',
  },
  mobileGrid: {
    overflowX: 'scroll',
    scrollbarWidth: 'thin', // For Firefox, to avoid having a very large scrollbar.
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
  mediaItems: Array<MediaItem>,
  /**
   * Alt text inserted for each image tag.
   * The string `{mediaIndex}` will be replaced with media actual index.
   * For instance: "Asset pack preview image {mediaIndex}"
   */
  altTextTemplate: string,
  horizontalOuterMarginToEatOnMobile?: number,
|};

const ResponseMediaGallery = ({
  mediaItems,
  altTextTemplate,
  horizontalOuterMarginToEatOnMobile,
}: Props) => {
  const [selectedMediaIndex, setSelectedMediaIndex] = React.useState<number>(0);
  const windowWidth = useResponsiveWindowWidth();
  const isMobileScreen = windowWidth === 'small';

  const mobileExtremeItemsPadding =
    isMobileScreen && horizontalOuterMarginToEatOnMobile
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
        root: isMobileScreen
          ? {
              scrollbarHeight: 'none' /* For Firefox */,
              '-ms-overflow-style': 'none' /* For Internet Explorer and Edge */,
              '&::-webkit-scrollbar': {
                height: 0 /* For Chrome, Safari, and Opera */,
              },
            }
          : undefined,
      }),
    [mobileExtremeItemsPadding, isMobileScreen]
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

  const selectedMedia = mediaItems[selectedMediaIndex];

  if (isMobileScreen) {
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
                {mediaItems.map(({ kind, url }, index) => (
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
                      {kind === 'image' ? (
                        <CorsAwareImage
                          src={url}
                          style={{
                            ...styles.mobileImageCarouselItem,
                            height: mobileImageWidth / (16 / 9),
                          }}
                          alt={altTextTemplate.replace(
                            /{mediaIndex}/g,
                            String(selectedMediaIndex + 1)
                          )}
                        />
                      ) : (
                        <div style={styles.mobileImageCarouselItem}>
                          <audio controls src={url}>
                            Audio preview is unsupported.
                          </audio>
                        </div>
                      )}
                    </CardMedia>
                  </Grid>
                ))}
              </Grid>
            </div>
          )}
        </Measure>
        <Line justifyContent="center">
          <Text noMargin size="body2" style={styles.disabledText}>
            {currentlyViewedImageIndex + 1}/{mediaItems.length}
          </Text>
        </Line>
      </div>
    );
  }
  return (
    <ColumnStackLayout noMargin>
      {selectedMedia.kind === 'image' ? (
        <CorsAwareImage
          style={styles.selectedMedia}
          src={selectedMedia.url}
          alt={altTextTemplate.replace(
            /{mediaIndex}/g,
            String(selectedMediaIndex + 1)
          )}
        />
      ) : (
        <div style={styles.selectedMedia}>
          <audio controls src={selectedMedia.url}>
            Audio preview is unsupported.
          </audio>
        </div>
      )}
      <div style={styles.desktopGallery}>
        {mediaItems.map(({ kind, url }, index) => (
          <div
            key={url}
            onClick={() => setSelectedMediaIndex(index)}
            tabIndex={0}
            style={{
              ...styles.carouselItem,
              outline:
                index === selectedMediaIndex ? 'solid 1px white' : undefined,
            }}
            onKeyPress={(
              event: SyntheticKeyboardEvent<HTMLLIElement>
            ): void => {
              if (shouldValidate(event)) {
                setSelectedMediaIndex(index);
              }
            }}
          >
            {kind === 'image' ? (
              <CorsAwareImage
                src={url}
                style={styles.imageCarouselItem}
                alt={altTextTemplate.replace(
                  /{mediaIndex}/g,
                  (index + 1).toString()
                )}
              />
            ) : (
              <img
                src="res/audio-placeholder.jpg"
                style={styles.imageCarouselItem}
                alt="sound"
              />
            )}
          </div>
        ))}
      </div>
    </ColumnStackLayout>
  );
};

export default ResponseMediaGallery;
