// @flow
import { t } from '@lingui/macro';
import { Trans } from '@lingui/macro';
import IconButton from '../../UI/IconButton';
import Measure from 'react-measure';
import * as React from 'react';
import MiniToolbar from '../../UI/MiniToolbar';
import ZoomIn from '../../UI/CustomSvgIcons/ZoomIn';
import ZoomOut from '../../UI/CustomSvgIcons/ZoomOut';
import Maximize from '../../UI/CustomSvgIcons/Maximize';
import PlaceholderMessage from '../../UI/PlaceholderMessage';
import Text from '../../UI/Text';
import { CorsAwareImage } from '../../UI/CorsAwareImage';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import CheckeredBackground from '../CheckeredBackground';
import { getPixelatedImageRendering } from '../../Utils/CssHelpers';
import { shouldZoom } from '../../UI/KeyboardShortcuts/InteractionKeys';
import Slider from '../../UI/Slider';
import AuthorizedAssetImage from '../../AssetStore/PrivateAssets/AuthorizedAssetImage';
import {
  clampImagePreviewZoom,
  getWheelStepZoomFactor,
  imagePreviewMaxZoom,
  imagePreviewMinZoom,
  willZoomChange,
  zoomInFactor,
  zoomOutFactor,
  zoomStepBasePower,
} from '../../Utils/ZoomUtils';
const gd: libGDevelop = global.gd;

type Point = { x: number, y: number };

const getDistanceBetweenPoints = (point1: Point, point2: Point) => {
  return Math.sqrt((point2.x - point1.x) ** 2 + (point2.y - point1.y) ** 2);
};
const getCenter = (point1: Point, point2: Point) => {
  return [(point1.x + point2.x) / 2, (point1.y + point2.y) / 2];
};

const styles = {
  previewImagePixelated: {
    imageRendering: getPixelatedImageRendering(),
  },
  contentContainer: {
    position: 'relative',
    height: '100%',
    overflow: 'hidden',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    flex: 1,
    minHeight: 0,
    width: '100%', // Needed for the div containing the image to scroll horizontally when image overflowing due to scroll.
  },
  imagePreviewContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',

    // The container contains the image and the "overlay" that can display
    // points or polygons that can be drag'n'dropped. `touch-action` must
    // be set to `none`, otherwise the (mobile) browser will claim the
    // `pointermove` event for "native" behavior like panning the page.
    touchAction: 'none',
  },
  spriteThumbnailImage: {},
  sliderContainer: {
    maxWidth: 150,
    width: '100%',
    display: 'flex',
    padding: '0 10px',
  },
};

type Props = {|
  resourceName: string,
  imageResourceSource: string,
  isImageResourceSmooth: boolean,
  displaySpacedView?: boolean,
  fixedHeight?: number,
  fixedWidth?: number,
  renderOverlay?: ({|
    imageWidth: number,
    imageHeight: number,
    offsetTop: number,
    offsetLeft: number,
    imageZoomFactor: number,
  |}) => React.Node,
  onSize?: (number, number) => void,
  hideCheckeredBackground?: boolean,
  deactivateControls?: boolean,
  isImagePrivate?: boolean,
  onImageLoaded?: () => void,
  hideLoader?: boolean,
|};

export const isProjectImageResourceSmooth = (
  project: gdProject,
  resourceName: string
): boolean => {
  const resource = project.getResourcesManager().getResource(resourceName);
  if (resource.getKind() !== 'image') return false;

  const imageResource = gd.asImageResource(resource);
  return imageResource.isSmooth();
};

type ZoomState = {
  factor: number,
  xOffset: number,
  yOffset: number,
};

/**
 * Display the preview for a resource of a project with kind "image".
 */
const ImagePreview = ({
  resourceName,
  imageResourceSource,
  isImageResourceSmooth,
  fixedHeight,
  fixedWidth,
  renderOverlay,
  onSize,
  hideCheckeredBackground,
  deactivateControls,
  displaySpacedView,
  isImagePrivate,
  onImageLoaded,
  hideLoader,
}: Props) => {
  const [errored, setErrored] = React.useState<boolean>(false);
  const [imageWidth, setImageWidth] = React.useState<?number>(null);
  const [imageHeight, setImageHeight] = React.useState<?number>(null);
  const [containerWidth, setContainerWidth] = React.useState<?number>(null);
  const [containerHeight, setContainerHeight] = React.useState<?number>(null);
  const [zoomState, setZoomState] = React.useState<ZoomState>({
    factor: 1,
    xOffset: 0,
    yOffset: 0,
  });
  const { xOffset, yOffset, factor: imageZoomFactor } = zoomState;
  const previousDoubleTouchInfo = React.useRef<any>(null);
  const previousSingleTouchCoordinates = React.useRef<?[number, number]>(null);
  const hasZoomBeenAdaptedToImageRef = React.useRef<boolean>(false);
  const containerRef = React.useRef<?HTMLDivElement>(null);
  const handleImageError = () => {
    setErrored(true);
  };

  const adaptZoomFactorToImage = React.useCallback(
    (displaySpacedView?: boolean) => {
      if (!imageWidth || !imageHeight || !containerHeight || !containerWidth) {
        return false;
      }
      const zoomFactor = clampImagePreviewZoom(
        Math.min(containerWidth / imageWidth, containerHeight / imageHeight)
      );
      const zoomFactorWithMargins =
        zoomFactor * (displaySpacedView ? 0.7 : 0.95);
      setZoomState({
        factor: zoomFactorWithMargins,
        xOffset: (containerWidth - imageWidth * zoomFactorWithMargins) / 2,
        yOffset: (containerHeight - imageHeight * zoomFactorWithMargins) / 2,
      });
      return true;
    },
    [imageHeight, imageWidth, containerHeight, containerWidth]
  );

  const zoomAroundPointBy = React.useCallback(
    async (imageZoomFactorMultiplier: number, point: [number, number]) => {
      if (!willZoomChange(imageZoomFactor, imageZoomFactorMultiplier)) {
        return;
      }
      const newFactor = clampImagePreviewZoom(
        imageZoomFactor * imageZoomFactorMultiplier
      );
      setZoomState(zoomState => ({
        xOffset:
          zoomState.xOffset +
          (point[0] - zoomState.xOffset) * (1 - newFactor / zoomState.factor),
        yOffset:
          zoomState.yOffset +
          (point[1] - zoomState.yOffset) * (1 - newFactor / zoomState.factor),
        factor: newFactor,
      }));
    },
    [imageZoomFactor]
  );

  const zoomAroundPointTo = React.useCallback(
    async (factor: number, point: [number, number]) => {
      setZoomState(zoomState => ({
        xOffset:
          zoomState.xOffset +
          (point[0] - zoomState.xOffset) * (1 - factor / zoomState.factor),
        yOffset:
          zoomState.yOffset +
          (point[1] - zoomState.yOffset) * (1 - factor / zoomState.factor),
        factor,
      }));
    },
    []
  );

  const handleWheel = React.useCallback(
    (event: WheelEvent) => {
      const { deltaY, deltaX, clientX, clientY } = event;
      event.preventDefault();
      event.stopPropagation();
      if (shouldZoom(event) && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        zoomAroundPointBy(getWheelStepZoomFactor(-deltaY), [
          clientX - containerRect.left,
          clientY - containerRect.top,
        ]);
      } else {
        setZoomState(zoomState => ({
          ...zoomState,
          xOffset: zoomState.xOffset - deltaX / 4,
          yOffset: zoomState.yOffset - deltaY / 4,
        }));
      }
    },
    [zoomAroundPointBy]
  );

  const handleTouchMove = React.useCallback(
    async (event: TouchEvent) => {
      if (event.touches.length === 2 && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();

        event.preventDefault();
        event.stopPropagation();
        const {
          clientX: touch1clientX,
          clientY: touch1clientY,
        } = event.touches[0];
        const {
          clientX: touch2clientX,
          clientY: touch2clientY,
        } = event.touches[1];
        const newDistance = getDistanceBetweenPoints(
          { x: touch1clientX, y: touch1clientY },
          { x: touch2clientX, y: touch2clientY }
        );
        const newCenter = getCenter(
          {
            x: touch1clientX - containerRect.left,
            y: touch1clientY - containerRect.top,
          },
          {
            x: touch2clientX - containerRect.left,
            y: touch2clientY - containerRect.top,
          }
        );
        if (previousDoubleTouchInfo.current) {
          setZoomState(zoomState => ({
            ...zoomState,
            xOffset:
              zoomState.xOffset +
              (newCenter[0] - previousDoubleTouchInfo.current.center[0]),
            yOffset:
              zoomState.yOffset +
              (newCenter[1] - previousDoubleTouchInfo.current.center[1]),
          }));

          zoomAroundPointBy(
            newDistance / previousDoubleTouchInfo.current.distance,
            newCenter
          );
        }
        previousDoubleTouchInfo.current = {
          distance: newDistance,
          center: newCenter,
        };
        return;
      }
      if (
        event.target &&
        (event.target instanceof HTMLElement ||
          // $FlowFixMe - Flow does not know about SVGElement
          event.target instanceof SVGElement) &&
        event.target.dataset &&
        'draggable' in event.target.dataset
      ) {
        return;
      }
      const { clientX, clientY } = event.touches[0];
      event.preventDefault();
      event.stopPropagation();

      if (previousSingleTouchCoordinates.current) {
        const [previousX, previousY] = previousSingleTouchCoordinates.current;
        setZoomState(zoomState => ({
          ...zoomState,
          xOffset: zoomState.xOffset + (clientX - previousX),
          yOffset: zoomState.yOffset + (clientY - previousY),
        }));
      }
      previousSingleTouchCoordinates.current = [clientX, clientY];
    },
    [zoomAroundPointBy]
  );

  // Add event listener with `passive: false` in order to be able to prevent
  // the default behavior when swiping from left to right on a trackpad that
  // triggers a back navigation.
  React.useEffect(
    () => {
      if (deactivateControls) return;
      if (containerRef.current) {
        containerRef.current.addEventListener('wheel', handleWheel, {
          passive: false,
        });
        return () => {
          containerRef.current &&
            containerRef.current.removeEventListener('wheel', handleWheel, {
              passive: false,
            });
        };
      }
    },
    [handleWheel, deactivateControls]
  );

  // Reset ref to adapt zoom when image changes
  React.useEffect(
    () => {
      hasZoomBeenAdaptedToImageRef.current = false;
    },
    [imageResourceSource]
  );

  const containerCenter = React.useMemo(
    () => [(containerWidth || 0) / 2, (containerHeight || 0) / 2],
    [containerWidth, containerHeight]
  );

  // A change of adaptZoomFactorToImage means a change in one of its dependencies,
  // so it means the container or image size has changed and we should try to adapt
  // the zoom factor to the image.
  React.useEffect(
    () => {
      if (hasZoomBeenAdaptedToImageRef.current) {
        // Do not adapt zoom to image if a zoom as been provided in the props
        // or if the zoom has already been adapted.
        return;
      }
      hasZoomBeenAdaptedToImageRef.current = adaptZoomFactorToImage(
        displaySpacedView
      );
    },
    [adaptZoomFactorToImage, displaySpacedView]
  );

  const handleImageLoaded = React.useCallback(
    (e: any) => {
      const imgElement = e.target;

      const newImageWidth = imgElement
        ? imgElement.naturalWidth || imgElement.clientWidth
        : 0;
      const newImageHeight = imgElement
        ? imgElement.naturalHeight || imgElement.clientHeight
        : 0;
      setImageHeight(newImageHeight);
      setImageWidth(newImageWidth);
      if (onSize) onSize(newImageWidth, newImageHeight);
      if (onImageLoaded) onImageLoaded();
    },
    [onImageLoaded, onSize]
  );

  const onTouchEnd = React.useCallback((event: TouchEvent) => {
    if (event.touches.length === 1) {
      previousSingleTouchCoordinates.current = [
        event.touches[0].clientX,
        event.touches[0].clientY,
      ];
    }
    previousDoubleTouchInfo.current = null;
  }, []);

  const onTouchStart = React.useCallback((event: TouchEvent) => {
    if (event.touches.length === 1) {
      previousSingleTouchCoordinates.current = [
        event.touches[0].clientX,
        event.touches[0].clientY,
      ];
    } else if (event.touches.length === 2) {
      previousSingleTouchCoordinates.current = null;
    }
  }, []);

  const theme = React.useContext(GDevelopThemeContext);
  const frameBorderColor = theme.imagePreview.frameBorderColor || '#aaa';

  const containerLoaded = !!containerWidth && !!containerHeight;
  const imageLoaded = !!imageWidth && !!imageHeight && !errored;

  // We display the elements only when the image is loaded and
  // the zoom is applied to avoid a shift in the image.
  // We use "visibility": "hidden" instead of "display": "none"
  // so that the image takes the space of the container whilst being hidden.
  // TODO: handle a proper loader.
  const visibility = containerLoaded ? undefined : 'hidden';

  const imageContainerStyle = {
    transform: `translate(${xOffset}px, ${yOffset}px) scale(${imageZoomFactor})`,
    width: imageWidth,
    height: imageHeight,
    transformOrigin: '0 0',
    display: 'flex',
  };

  const imageStyle = {
    ...styles.spriteThumbnailImage,
    // Apply margin only once the container is loaded, to avoid a shift in the image
    outline: renderOverlay
      ? `${0.5 / imageZoomFactor}px solid ${frameBorderColor}`
      : undefined,
    visibility,
    ...(!isImageResourceSmooth ? styles.previewImagePixelated : undefined),
  };

  const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    visibility,
  };

  return (
    <Measure
      bounds
      onResize={contentRect => {
        setContainerWidth(contentRect.bounds.width);
        setContainerHeight(contentRect.bounds.height);
      }}
    >
      {({ measureRef }) => {
        return (
          <div style={styles.container}>
            {!deactivateControls && (
              <MiniToolbar noPadding>
                <IconButton
                  onClick={() =>
                    zoomAroundPointBy(zoomOutFactor, containerCenter)
                  }
                  tooltip={t`Zoom out (you can also use Ctrl + Mouse wheel)`}
                >
                  <ZoomOut />
                </IconButton>
                <div style={styles.sliderContainer}>
                  <Slider
                    min={Math.log2(imagePreviewMinZoom)}
                    max={Math.log2(imagePreviewMaxZoom)}
                    step={zoomStepBasePower * 4}
                    value={Math.log2(imageZoomFactor)}
                    onChange={value => {
                      zoomAroundPointTo(Math.pow(2, value), containerCenter);
                    }}
                  />
                </div>
                <IconButton
                  onClick={() =>
                    zoomAroundPointBy(zoomInFactor, containerCenter)
                  }
                  tooltip={t`Zoom in (you can also use Ctrl + Mouse wheel)`}
                >
                  <ZoomIn />
                </IconButton>
                <IconButton
                  onClick={() => {
                    adaptZoomFactorToImage();
                  }}
                  tooltip={t`Fit content to window`}
                >
                  <Maximize />
                </IconButton>
              </MiniToolbar>
            )}
            <div
              style={{
                ...styles.contentContainer,
                height: fixedHeight || '100%',
                width: fixedWidth,
              }}
            >
              {!hideCheckeredBackground && <CheckeredBackground />}
              <div
                dir={
                  'ltr' /* Force LTR layout to avoid issues with image positioning */
                }
                style={{
                  ...styles.imagePreviewContainer,
                  overflow: containerLoaded ? 'unset' : 'hidden',
                }}
                ref={ref => {
                  measureRef(ref);
                  containerRef.current = ref;
                }}
                onTouchStart={deactivateControls ? null : onTouchStart}
                onTouchMove={deactivateControls ? null : handleTouchMove}
                onTouchEnd={deactivateControls ? null : onTouchEnd}
              >
                {!!errored && (
                  <PlaceholderMessage>
                    <Text>
                      <Trans>Unable to load the image</Trans>
                    </Text>
                  </PlaceholderMessage>
                )}
                {!errored && (
                  <div style={imageContainerStyle}>
                    {isImagePrivate ? (
                      <AuthorizedAssetImage
                        style={imageStyle}
                        alt={resourceName}
                        url={imageResourceSource}
                        onError={handleImageError}
                        onLoad={handleImageLoaded}
                        hideLoader={hideLoader}
                      />
                    ) : (
                      <CorsAwareImage
                        style={imageStyle}
                        alt={resourceName}
                        src={imageResourceSource}
                        onError={handleImageError}
                        onLoad={handleImageLoaded}
                      />
                    )}
                  </div>
                )}
                {imageLoaded && renderOverlay && (
                  <div style={overlayStyle}>
                    {renderOverlay({
                      imageWidth: imageWidth || 0,
                      imageHeight: imageHeight || 0,
                      offsetTop: yOffset,
                      offsetLeft: xOffset,
                      imageZoomFactor: imageZoomFactor,
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }}
    </Measure>
  );
};

export default ImagePreview;
