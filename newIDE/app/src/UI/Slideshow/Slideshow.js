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
import { createStyles, makeStyles } from '@material-ui/core';
import SlideshowArrow from './SlideshowArrow';

const styles = {
  itemSkeleton: { borderRadius: 6 },
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
  const [containerWidth, setContainerWidth] = React.useState<?number>(null);
  const itemLineHeight = getItemLineHeight({
    width: windowWidth,
    containerWidth,
    itemDesktopRatio,
    itemMobileRatio,
  });
  const classesForImage = useStylesForImage();

  const [currentSlide, setCurrentSlide] = React.useState(0);

  const handleLeftArrowClick = React.useCallback(
    () => {
      if (!items || items.length === 1) return;

      setCurrentSlide(currentSlide === 0 ? items.length - 1 : currentSlide - 1);
    },
    [currentSlide, items]
  );

  const handleRightArrowClick = React.useCallback(
    () => {
      if (!items || items.length === 1) return;

      setCurrentSlide(currentSlide === items.length - 1 ? 0 : currentSlide + 1);
    },
    [currentSlide, items]
  );

  React.useEffect(
    () => {
      const interval = setInterval(() => {
        handleRightArrowClick();
      }, 5000);
      return () => clearInterval(interval);
    },
    [handleRightArrowClick]
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
            <div
              ref={measureRef}
              style={{
                display: 'flex',
                flex: 1,
              }}
            >
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
            ref={measureRef}
            style={{
              display: 'flex',
              flex: 1,
              position: 'relative',
              overflow: 'hidden',
              width: `calc(100% - 2*${marginsSize}px)`,
              height: itemLineHeight,
              margin: marginsSize,
              borderRadius: 6,
            }}
          >
            {items.length > 1 && (
              <SlideshowArrow onClick={handleLeftArrowClick} position="left" />
            )}
            {items.map((item, index) => {
              return (
                <img
                  src={
                    windowWidth === 'small'
                      ? item.mobileImageUrl
                      : item.imageUrl
                  }
                  alt={`Slideshow item for ${item.id}`}
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    aspectRatio:
                      windowWidth === 'small'
                        ? itemMobileRatio
                        : itemDesktopRatio,
                    objectFit: 'contain',
                    borderRadius: 6,
                    transition:
                      'opacity 0.5s ease-in-out, transform 0.3s ease-in-out',
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
            {items.length > 1 && (
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
