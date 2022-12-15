// @flow
import { t } from '@lingui/macro';
import { Trans } from '@lingui/macro';
import IconButton from '../../UI/IconButton';
import Measure from 'react-measure';
import * as React from 'react';
import { Column } from '../../UI/Grid';
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
  getContinuousZoomFactor,
  imagePreviewMaxZoom,
  imagePreviewMinZoom,
  zoomInFactor,
  zoomOutFactor,
  zoomStepBasePower,
} from '../../Utils/ZoomUtils';
const gd: libGDevelop = global.gd;

const MARGIN = 50;
const SPRITE_MARGIN_RATIO = 1.3;

const styles = {
  previewImagePixelated: {
    imageRendering: getPixelatedImageRendering(),
  },
  contentContainer: {
    position: 'relative',
    height: '100%',
    overflow: 'hidden',
  },
  imagePreviewContainer: {
    display: 'flex',
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
  spriteThumbnailImage: {
    position: 'absolute',
    pointerEvents: 'none',
  },
  sliderContainer: {
    maxWidth: 150,
    width: '100%',
    display: 'flex',
    padding: '0 10px',
  },
};

type Props = {|
  project: gdProject,
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
  project,
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
  const hasZoomBeenAdaptedToImageRef = React.useRef<boolean>(false);

  const handleImageError = () => {
    setErrored(true);
  };

  const adaptZoomFactorToImage = React.useCallback(
    () => {
      if (!imageWidth || !imageHeight || !containerHeight || !containerWidth) {
        return false;
      }
      const zoomFactor = clampImagePreviewZoom(
        Math.min(
          containerWidth / (imageWidth * SPRITE_MARGIN_RATIO),
          containerHeight / (imageHeight * SPRITE_MARGIN_RATIO)
        )
      );
      setImageZoomFactor(zoomFactor);
      return true;
    },
    [imageHeight, imageWidth, containerHeight, containerWidth]
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
      if (hasZoomBeenAdaptedToImageRef.current) return;
      hasZoomBeenAdaptedToImageRef.current = adaptZoomFactorToImage();
    },
    [adaptZoomFactorToImage]
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

  const zoomBy = (imageZoomFactorMultiplier: number) => {
    zoomTo(imageZoomFactor * imageZoomFactorMultiplier);
  };

  const zoomTo = (imageZoomFactor: number) => {
    setImageZoomFactor(clampImagePreviewZoom(imageZoomFactor));
  };

  const theme = React.useContext(GDevelopThemeContext);
  const frameBorderColor = theme.imagePreview.frameBorderColor || '#aaa';

  const containerLoaded = !!containerWidth && !!containerHeight;
  const imageLoaded = !!imageWidth && !!imageHeight && !errored;

  // Centre-align the image and overlays
  const imagePositionTop = Math.max(
    0,
    (containerHeight || 0) / 2 -
      ((imageHeight || 0) * imageZoomFactor) / 2 -
      MARGIN
  );
  const imagePositionLeft = Math.max(
    0,
    (containerWidth || 0) / 2 -
      ((imageWidth || 0) * imageZoomFactor) / 2 -
      MARGIN
  );

  // We display the elements only when the image is loaded and
  // the zoom is applied to avoid a shift in the image.
  // We use "visibility": "hidden" instead of "display": "none"
  // so that the image takes the space of the container whilst being hidden.
  // TODO: handle a proper loader.
  const visibility = containerLoaded ? undefined : 'hidden';
  const width = imageWidth ? imageWidth * imageZoomFactor : undefined;
  const height = imageHeight ? imageHeight * imageZoomFactor : undefined;

  const imageStyle = {
    ...styles.spriteThumbnailImage,
    // Apply margin only once the container is loaded, to avoid a shift in the image
    margin: containerLoaded ? MARGIN : 0,
    top: imagePositionTop,
    left: imagePositionLeft,
    width,
    height,
    visibility,
    ...(!isImageResourceSmooth ? styles.previewImagePixelated : undefined),
  };

  const frameStyle = {
    position: 'absolute',
    top: imagePositionTop + MARGIN,
    left: imagePositionLeft + MARGIN,
    width,
    height,
    visibility,
    border: `1px solid ${frameBorderColor}`,
    boxSizing: 'border-box',
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
          <Column expand noMargin useFullHeight>
            {!hideControls && (
              <MiniToolbar noPadding>
                <IconButton
                  onClick={() => zoomBy(zoomOutFactor)}
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
                      zoomTo(Math.pow(2, value));
                    }}
                  />
                </div>
                <IconButton
                  onClick={() => zoomBy(zoomInFactor)}
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
                  overflow: containerLoaded ? 'auto' : 'hidden',
                }}
                ref={measureRef}
                onWheel={event => {
                  const { deltaY } = event;
                  if (!hideControls && shouldZoom(event)) {
                    zoomBy(getContinuousZoomFactor(-deltaY));
                    event.stopPropagation();
                  } else {
                    // Let the usual, native vertical or horizontal scrolling happen.
                  }
                }}
              >
                {!!errored && (
                  <PlaceholderMessage>
                    <Text>
                      <Trans>Unable to load the image</Trans>
                    </Text>
                  </PlaceholderMessage>
                )}
                {!errored &&
                  (isImagePrivate ? (
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
                  ))}
                {imageLoaded && renderOverlay && <div style={frameStyle} />}
                {imageLoaded && renderOverlay && (
                  <div style={overlayStyle}>
                    {renderOverlay({
                      imageWidth: imageWidth || 0,
                      imageHeight: imageHeight || 0,
                      offsetTop: imagePositionTop + MARGIN,
                      offsetLeft: imagePositionLeft + MARGIN,
                      imageZoomFactor,
                    })}
                  </div>
                )}
              </div>
            </div>
          </Column>
        );
      }}
    </Measure>
  );
};

export default ImagePreview;
