// @flow
import { t } from '@lingui/macro';
import { Trans } from '@lingui/macro';
import IconButton from '../../UI/IconButton';
import Measure from 'react-measure';
import * as React from 'react';
import MiniToolbar from '../../UI/MiniToolbar';
import ZoomIn from '@material-ui/icons/ZoomIn';
import ZoomOut from '@material-ui/icons/ZoomOut';
import ZoomOutMap from '@material-ui/icons/ZoomOutMap';
import PlaceholderMessage from '../../UI/PlaceholderMessage';
import Text from '../../UI/Text';
import { CorsAwareImage } from '../../UI/CorsAwareImage';
import GDevelopThemeContext from '../../UI/Theme/ThemeContext';
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
  initialZoom?: number,
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
  hideControls?: boolean,
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
  hideControls,
  initialZoom,
  isImagePrivate,
  onImageLoaded,
  hideLoader,
}: Props) => {
  const [errored, setErrored] = React.useState<boolean>(false);
  const [imageWidth, setImageWidth] = React.useState<?number>(null);
  const [imageHeight, setImageHeight] = React.useState<?number>(null);
  const [containerWidth, setContainerWidth] = React.useState<?number>(null);
  const [containerHeight, setContainerHeight] = React.useState<?number>(null);
  const [imageZoomFactor, setImageZoomFactor] = React.useState<number>(
    initialZoom || 1
  );
  const touchStartClientCoordinates = React.useRef<[number, number]>([0, 0]);
  const [xOffset, setXOffset] = React.useState<number>(0);
  const [yOffset, setYOffset] = React.useState<number>(0);
  const hasZoomBeenAdaptedToImageRef = React.useRef<boolean>(false);
  const containerRef = React.useRef<?HTMLDivElement>(null);
  const handleImageError = () => {
    setErrored(true);
  };

  const adaptZoomFactorToImage = React.useCallback(
    () => {
      if (!imageWidth || !imageHeight || !containerHeight || !containerWidth) {
        return false;
      }
      const zoomFactor = clampImagePreviewZoom(
        Math.min(containerWidth / imageWidth, containerHeight / imageHeight)
      );
      const zoomFactorWithMargins = zoomFactor * 0.95;
      setImageZoomFactor(zoomFactorWithMargins);
      setXOffset((containerWidth - imageWidth * zoomFactorWithMargins) / 2);
      setYOffset((containerHeight - imageHeight * zoomFactorWithMargins) / 2);
      return true;
    },
    [imageHeight, imageWidth, containerHeight, containerWidth]
  );

  const zoomTo = React.useCallback(async (factor: number) => {
    await setImageZoomFactor(clampImagePreviewZoom(factor));
  }, []);

  const zoomAroundPointBy = React.useCallback(
    async (imageZoomFactorMultiplier: number, point: [number, number]) => {
      if (!willZoomChange(imageZoomFactor, imageZoomFactorMultiplier)) {
        return;
      }
      await setXOffset(xOffset => {
        return xOffset + (point[0] - xOffset) * (1 - imageZoomFactorMultiplier);
      });
      await setYOffset(yOffset => {
        return yOffset + (point[1] - yOffset) * (1 - imageZoomFactorMultiplier);
      });
      await zoomTo(imageZoomFactor * imageZoomFactorMultiplier);
    },
    [zoomTo, imageZoomFactor]
  );

  const zoomAroundPointTo = React.useCallback(
    async (factor: number, point: [number, number]) => {
      await setXOffset(xOffset => {
        return xOffset + (point[0] - xOffset) * (1 - factor / imageZoomFactor);
      });
      await setYOffset(yOffset => {
        return yOffset + (point[1] - yOffset) * (1 - factor / imageZoomFactor);
      });
      await zoomTo(factor);
    },
    [zoomTo, imageZoomFactor]
  );

  const handleWheel = React.useCallback(
    (event: WheelEvent) => {
      const { deltaY, deltaX, clientX, clientY } = event;
      event.preventDefault();
      event.stopPropagation();
      if (!hideControls && shouldZoom(event) && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        zoomAroundPointBy(getWheelStepZoomFactor(-deltaY), [
          clientX - containerRect.left,
          clientY - containerRect.top,
        ]);
      } else {
        setXOffset(xOffset => xOffset - deltaX / 10);
        setYOffset(yOffset => yOffset - deltaY / 10);
      }
    },
    [hideControls, zoomAroundPointBy]
  );

  const handleTouchMove = React.useCallback(async (event: TouchEvent) => {
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

    await setXOffset(
      xOffset => xOffset + (clientX - touchStartClientCoordinates.current[0])
    );
    await setYOffset(
      yOffset => yOffset + (clientY - touchStartClientCoordinates.current[1])
    );
    touchStartClientCoordinates.current = [clientX, clientY];
  }, []);

  React.useEffect(
    () => {
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
    [handleWheel]
  );

  // Reset ref to adapt zoom when image changes
  React.useEffect(
    () => {
      hasZoomBeenAdaptedToImageRef.current = false;
    },
    [imageResourceSource]
  );

  // A change of adaptZoomFactorToImage means a change in one of its dependencies,
  // so it means the container or image size has changed and we should try to adapt
  // the zoom factor to the image.
  React.useEffect(
    () => {
      if (hasZoomBeenAdaptedToImageRef.current || initialZoom) {
        // Do not adapt zoom to image if a zoom as been provided in the props
        // or if the zoom has already been adapted.
        return;
      }
      hasZoomBeenAdaptedToImageRef.current = adaptZoomFactorToImage();
    },
    [adaptZoomFactorToImage, initialZoom]
  );

  const handleImageLoaded = (e: any) => {
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
  };

  const theme = React.useContext(GDevelopThemeContext);
  const frameBorderColor = theme.imagePreview.frameBorderColor || '#aaa';

  const containerLoaded = !!containerWidth && !!containerHeight;
  const imageLoaded = !!imageWidth && !!imageHeight && !errored;

  // // Centre-align the image and overlays
  // const imagePositionTop = Math.max(
  //   0,
  //   (containerHeight || 0) / 2 -
  //     ((imageHeight || 0) * imageZoomFactor) / 2 -
  //     MARGIN
  // );
  // const imagePositionLeft = Math.max(
  //   0,
  //   (containerWidth || 0) / 2 -
  //     ((imageWidth || 0) * imageZoomFactor) / 2 -
  //     MARGIN
  // );

  // We display the elements only when the image is loaded and
  // the zoom is applied to avoid a shift in the image.
  // We use "visibility": "hidden" instead of "display": "none"
  // so that the image takes the space of the container whilst being hidden.
  // TODO: handle a proper loader.
  const visibility = containerLoaded ? undefined : 'hidden';

  const imageContainerStyle = {
    transform: `translate(${xOffset}px, ${yOffset}px) scale(${imageZoomFactor})`,
    boxSizing: 'content-box',
    width: imageWidth,
    height: imageHeight,
    transformOrigin: '0 0',
  };

  const imageStyle = {
    ...styles.spriteThumbnailImage,
    // Apply margin only once the container is loaded, to avoid a shift in the image
    outline: `${0.5 / imageZoomFactor}px solid ${frameBorderColor}`,
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
            {!hideControls && (
              <MiniToolbar noPadding>
                <IconButton
                  onClick={() =>
                    zoomAroundPointBy(zoomOutFactor, [
                      (containerWidth || 0) / 2,
                      (containerHeight || 0) / 2,
                    ])
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
                      zoomAroundPointTo(Math.pow(2, value), [
                        (containerWidth || 0) / 2,
                        (containerHeight || 0) / 2,
                      ]);
                    }}
                  />
                </div>
                <IconButton
                  onClick={() =>
                    zoomAroundPointBy(zoomInFactor, [
                      (containerWidth || 0) / 2,
                      (containerHeight || 0) / 2,
                    ])
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
                  <ZoomOutMap />
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
                onTouchStart={event => {
                  touchStartClientCoordinates.current = [
                    event.touches[0].clientX,
                    event.touches[0].clientY,
                  ];
                }}
                onTouchMove={handleTouchMove}
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
