// @flow
import * as React from 'react';
import { Column, Line, marginsSize } from '../../UI/Grid';
import Paper from '../../UI/Paper';
import Skeleton from '@material-ui/lab/Skeleton';
import {
  useResponsiveWindowWidth,
  type WidthType,
} from '../../UI/Reponsive/ResponsiveWindowMeasurer';
import Measure from 'react-measure';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import SlideshowArrow from './SlideshowArrow';

const styles = {
  skeletonContainer: {
    display: 'flex',
    flex: 1,
  },
  itemSkeleton: { borderRadius: 6 },
  slidesContainer: {
    display: 'flex',
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    width: `calc(100% - 2*${marginsSize}px)`,
    margin: marginsSize,
    borderRadius: 6,
  },
  slideImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    borderRadius: 6,
    transition: 'opacity 0.5s ease-in-out, transform 0.3s ease-in-out',
  },
};

const getItemLineHeight = ({
  width,
  containerWidth,
  itemDesktopRatio,
  itemMobileRatio,
}: {
  width: WidthType,
  containerWidth: ?number,
  itemDesktopRatio: number,
  itemMobileRatio: number,
}) => {
  const defaultContainerWidth = width === 'small' ? 320 : 1024;
  const containerWidthValue = containerWidth || defaultContainerWidth;
  const lineHeight =
    width === 'small'
      ? containerWidthValue / itemMobileRatio
      : containerWidthValue / itemDesktopRatio;

  return lineHeight;
};

const useStylesForImage = () =>
  makeStyles(theme =>
    createStyles({
      root: {
        '&:hover': {
          transform: 'scale(1.02)',
        },
        '&:focus': {
          transform: 'scale(1.02)',
          outline: 'none',
        },
      },
    })
  )();

type SlideshowProps = {|
  items: ?Array<{|
    id: string,
    imageUrl: string,
    mobileImageUrl: string,
    onClick: ?() => void,
  |}>,
  itemDesktopRatio: number,
  itemMobileRatio: number,
|};

const Slideshow = ({
  items,
  itemDesktopRatio,
  itemMobileRatio,
}: SlideshowProps) => {
  const windowWidth = useResponsiveWindowWidth();
  const isMobile = windowWidth === 'small';
  const [containerWidth, setContainerWidth] = React.useState<?number>(null);
  const itemLineHeight = getItemLineHeight({
    width: windowWidth,
    containerWidth,
    itemDesktopRatio,
    itemMobileRatio,
  });
  const classesForImage = useStylesForImage();
  const containerRef = React.useRef(null);
  const [isOverImage, setIsOverImage] = React.useState(false);
  const outImageTimeoutId = React.useRef(null);
  const nextSlideTimeoutId = React.useRef(null);

  const [currentSlide, setCurrentSlide] = React.useState(0);

  const handleLeftArrowClick = React.useCallback(
    () => {
      if (!items || items.length === 1) return;

      // Clear the timeout to avoid changing the slide while the user
      // is interacting with the slideshow.
      if (nextSlideTimeoutId.current) {
        clearTimeout(nextSlideTimeoutId.current);
        nextSlideTimeoutId.current = null;
      }

      setCurrentSlide(currentSlide === 0 ? items.length - 1 : currentSlide - 1);
    },
    [items, currentSlide]
  );

  const handleRightArrowClick = React.useCallback(
    () => {
      if (!items || items.length === 1) return;

      // Clear the timeout to avoid changing the slide while the user
      // is interacting with the slideshow.
      if (nextSlideTimeoutId.current) {
        clearTimeout(nextSlideTimeoutId.current);
        nextSlideTimeoutId.current = null;
      }

      setCurrentSlide(currentSlide === items.length - 1 ? 0 : currentSlide + 1);
    },
    [items, currentSlide]
  );

  React.useEffect(
    () => {
      nextSlideTimeoutId.current = setTimeout(() => {
        handleRightArrowClick();
      }, 5000);
      return () => {
        clearTimeout(nextSlideTimeoutId.current);
        nextSlideTimeoutId.current = null;
      };
    },
    // The function depends on the currentSlide,
    // which allows to restart the timeout when the slide changes.
    [handleRightArrowClick]
  );

  const handleOverImage = React.useCallback(
    () => {
      // If the user was going out just before, cancel the timeout.
      if (outImageTimeoutId.current) {
        clearTimeout(outImageTimeoutId.current);
        outImageTimeoutId.current = null;
      }
      if (isOverImage) return;
      setIsOverImage(true);
    },
    [isOverImage]
  );

  const handleOutImage = React.useCallback(
    () => {
      // If this event is triggered multiple times, there already is a timeout
      // so just return.
      if (!isOverImage || outImageTimeoutId.current) return;
      outImageTimeoutId.current = setTimeout(() => {
        setIsOverImage(false);
      }, 1000);
      return () => {
        clearTimeout(outImageTimeoutId.current);
        outImageTimeoutId.current = null;
      };
    },
    [isOverImage]
  );

  React.useEffect(
    () => {
      const containerElement = containerRef.current;
      // It's important to wait for the items, so that the listeners are
      // created when the carousel is actually ready.
      if (!containerElement || !items) return;

      // Add event listeners on component mount. There is no need to
      // remove them with a cleanup function because this element
      // does not change and they will be destroyed when the element is
      // removed from the DOM.
      containerElement.addEventListener('mouseover', handleOverImage);
      containerElement.addEventListener('mouseleave', handleOutImage);
    },
    [handleOverImage, handleOutImage, items]
  );

  if (!items) {
    // If they're loading, display a skeleton so that it doesn't jump when loaded.
    return (
      <Measure
        bounds
        onResize={contentRect => {
          setContainerWidth(contentRect.bounds.width);
        }}
      >
        {({ contentRect, measureRef }) => (
          <Paper square background="dark">
            <div ref={measureRef} style={styles.skeletonContainer}>
              <Line expand>
                <Column expand>
                  <Skeleton
                    variant="rect"
                    height={itemLineHeight}
                    style={styles.itemSkeleton}
                  />
                </Column>
              </Line>
            </div>
          </Paper>
        )}
      </Measure>
    );
  }

  if (!items.length) return null;

  return (
    <Measure
      bounds
      onResize={contentRect => {
        setContainerWidth(contentRect.bounds.width + 2 * marginsSize);
      }}
    >
      {({ contentRect, measureRef }) => (
        <Paper square background="dark">
          <div
            ref={ref => {
              measureRef(ref);
              containerRef.current = ref;
            }}
            style={{
              ...styles.slidesContainer,
              height: itemLineHeight,
            }}
          >
            {items.length > 1 && (isOverImage || isMobile) && (
              <SlideshowArrow onClick={handleLeftArrowClick} position="left" />
            )}
            {items.map((item, index) => {
              return (
                <img
                  src={isMobile ? item.mobileImageUrl : item.imageUrl}
                  alt={`Slideshow item for ${item.id}`}
                  style={{
                    ...styles.slideImage,
                    aspectRatio: isMobile ? itemMobileRatio : itemDesktopRatio,
                    ...(index === currentSlide
                      ? { opacity: 1, zIndex: 2 } // Update the opacity for the transition effect.
                      : { opacity: 0, zIndex: 1 }), // Update the z-index so it's on top of the other images, useful for keyboard navigation and hover.
                  }}
                  key={item.id}
                  onClick={item.onClick}
                  className={classesForImage.root}
                />
              );
            })}
            {items.length > 1 && (isOverImage || isMobile) && (
              <SlideshowArrow
                onClick={handleRightArrowClick}
                position="right"
              />
            )}
          </div>
        </Paper>
      )}
    </Measure>
  );
};

export default Slideshow;
