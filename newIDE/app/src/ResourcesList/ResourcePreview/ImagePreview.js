// @flow
import { t } from '@lingui/macro';
import { Trans } from '@lingui/macro';
import IconButton from '../../UI/IconButton';
import Measure from 'react-measure';
import * as React from 'react';
import ResourcesLoader from '../../ResourcesLoader';
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
const gd: libGDevelop = global.gd;

const MARGIN = 50;
const MAX_ZOOM_FACTOR = 10;
const MIN_ZOOM_FACTOR = 0.1;

const getBoundedZoomFactor = (zoom: number): number =>
  Math.min(MAX_ZOOM_FACTOR, Math.max(MIN_ZOOM_FACTOR, zoom));

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
    position: 'relative',
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    overflow: 'auto',

    // The container contains the image and the "overlay" that can display
    // points or polygons that can be drag'n'dropped. `touch-action` must
    // be set to `none`, otherwise the (mobile) browser will claim the
    // `pointermove` event for "native" behavior like panning the page.
    touchAction: 'none',
  },
  spriteThumbnailImage: {
    position: 'relative',
    pointerEvents: 'none',
    margin: MARGIN,
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
  resourcePath?: string,
  resourcesLoader: typeof ResourcesLoader,
  fixedHeight?: number,
  renderOverlay?: ({|
    imageWidth: number,
    imageHeight: number,
    offsetTop: number,
    offsetLeft: number,
    imageZoomFactor: number,
  |}) => React.Node,
  onSize?: (number, number) => void,
|};

type State = {|
  errored: boolean,
  imageWidth: ?number,
  imageHeight: ?number,
  imageSource: ?string,
  imageZoomFactor: number,
|};

const resourceIsSmooth = (
  project: gdProject,
  resourceName: string
): boolean => {
  const resource = project.getResourcesManager().getResource(resourceName);
  if (resource.getKind() !== 'image') return false;

  const imageResource = gd.asImageResource(resource);
  return imageResource.isSmooth();
};

const loadStateFrom = (newProps: {
  project: gdProject,
  resourceName: string,
  resourcesLoader: typeof ResourcesLoader,
}) => {
  return {
    errored: false,
    imageSource: newProps.resourcesLoader.getResourceFullUrl(
      newProps.project,
      newProps.resourceName,
      {}
    ),
  };
};

/**
 * Display the preview for a resource of a project with kind "image".
 */
const ImagePreview = (props: Props) => {
  const [state, setState] = React.useState<State>({
    errored: false,
    imageWidth: null,
    imageHeight: null,
    imageZoomFactor: 1,
    ...loadStateFrom(props),
  });
  const isResizeObserverReady = React.useRef<boolean>(false);

  React.useEffect(
    () => {
      setState(state => ({
        ...state,
        ...loadStateFrom({
          resourceName: props.resourceName,
          project: props.project,
          resourcesLoader: props.resourcesLoader,
        }),
      }));
    },
    [
      props.resourceName,
      props.project,
      props.resourcesLoader,
      props.resourcePath,
    ]
  );

  const handleImageError = () => {
    setState(state => ({ ...state, errored: true }));
  };

  const adaptZoomToImage = (
    containerHeight: number,
    containerWidth: number
  ) => {
    const { imageHeight, imageWidth } = state;
    let zoomFactor;
    if (!imageHeight || !imageWidth) {
      zoomFactor = 1;
    } else {
      const idealZoomFactors = [
        containerWidth / (imageWidth + 2 * MARGIN),
        containerHeight / (imageHeight + 2 * MARGIN),
      ];
      zoomFactor = getBoundedZoomFactor(Math.min(...idealZoomFactors));
    }
    setState(state => ({
      ...state,
      imageZoomFactor: zoomFactor,
    }));
  };

  const handleImageLoaded = (e: any) => {
    const imgElement = e.target;

    const imageWidth = imgElement
      ? imgElement.naturalWidth || imgElement.clientWidth
      : 0;
    const imageHeight = imgElement
      ? imgElement.naturalHeight || imgElement.clientHeight
      : 0;
    setState(state => ({ ...state, imageWidth, imageHeight }));
    if (props.onSize) props.onSize(imageWidth, imageHeight);
  };

  const zoomBy = (imageZoomFactorDelta: number) => {
    zoomTo(state.imageZoomFactor + imageZoomFactorDelta);
  };

  const zoomTo = (imageZoomFactor: number) => {
    setState(state => ({
      ...state,
      imageZoomFactor: getBoundedZoomFactor(imageZoomFactor),
    }));
  };

  const theme = React.useContext(GDevelopThemeContext);
  const frameBorderColor = theme.imagePreview.frameBorderColor || '#aaa';
  const previewBorderColor = theme.imagePreview.borderColor || '#aaa';

  return (
    <Measure bounds>
      {({ contentRect, measureRef }) => {
        const containerWidth = contentRect.bounds.width;
        const containerHeight = contentRect.bounds.height;
        if (
          !!containerWidth &&
          !!containerHeight &&
          !isResizeObserverReady.current
        ) {
          adaptZoomToImage(containerHeight, containerWidth);
          isResizeObserverReady.current = true;
        }
        const { resourceName, renderOverlay, fixedHeight, project } = props;
        const { imageHeight, imageWidth, imageSource, imageZoomFactor } = state;

        const imageLoaded = !!imageWidth && !!imageHeight && !state.errored;

        // Centre-align the image and overlays
        const imagePositionTop = Math.max(
          0,
          containerHeight / 2 -
            ((imageHeight || 0) * imageZoomFactor) / 2 -
            MARGIN
        );
        const imagePositionLeft = Math.max(
          0,
          containerWidth / 2 -
            ((imageWidth || 0) * imageZoomFactor) / 2 -
            MARGIN
        );

        const imageStyle = {
          ...styles.spriteThumbnailImage,
          top: imagePositionTop || 0,
          left: imagePositionLeft || 0,
          width: imageWidth ? imageWidth * imageZoomFactor : undefined,
          height: imageHeight ? imageHeight * imageZoomFactor : undefined,
          visibility: imageLoaded ? undefined : 'hidden', // TODO: Loader
          ...(!resourceIsSmooth(project, resourceName)
            ? styles.previewImagePixelated
            : undefined),
        };

        const frameStyle = {
          position: 'absolute',
          top: imagePositionTop + MARGIN || 0,
          left: imagePositionLeft + MARGIN || 0,
          width: imageWidth ? imageWidth * imageZoomFactor : undefined,
          height: imageHeight ? imageHeight * imageZoomFactor : undefined,
          visibility: imageLoaded ? undefined : 'hidden', // TODO: Loader
          border: `1px solid ${frameBorderColor}`,
        };

        const overlayStyle = {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          visibility: imageLoaded ? undefined : 'hidden', // TODO: Loader
        };

        return (
          <Column expand noMargin useFullHeight>
            <MiniToolbar>
              <IconButton
                onClick={() => zoomBy(-0.2)}
                tooltip={t`Zoom out (you can also use Ctrl + Mouse wheel)`}
              >
                <ZoomOut />
              </IconButton>
              <div style={styles.sliderContainer}>
                <Slider
                  min={Math.log10(MIN_ZOOM_FACTOR)}
                  max={Math.log10(MAX_ZOOM_FACTOR)}
                  step={0.05}
                  value={Math.log10(state.imageZoomFactor)}
                  onChange={value => {
                    console.log(value);
                    zoomTo(Math.pow(10, value));
                  }}
                />
              </div>
              <IconButton
                onClick={() => zoomBy(+0.2)}
                tooltip={t`Zoom in (you can also use Ctrl + Mouse wheel)`}
              >
                <ZoomIn />
              </IconButton>
              <IconButton
                onClick={() => zoomTo(1)}
                tooltip={t`Restore original size`}
              >
                <ZoomOutMap />
              </IconButton>
            </MiniToolbar>
            <div
              style={{
                ...styles.contentContainer,
                height: fixedHeight || '100%',
              }}
            >
              <CheckeredBackground />
              <div
                dir={
                  'ltr' /* Force LTR layout to avoid issues with image positioning */
                }
                style={{
                  ...styles.imagePreviewContainer,
                  border: `1px solid ${previewBorderColor}`,
                }}
                ref={measureRef}
                onWheel={event => {
                  const { deltaY } = event;
                  if (shouldZoom(event)) {
                    zoomBy(-deltaY / 500);
                    event.preventDefault();
                    event.stopPropagation();
                  } else {
                    // Let the usual, native vertical or horizontal scrolling happen.
                  }
                }}
              >
                {!!state.errored && (
                  <PlaceholderMessage>
                    <Text>
                      <Trans>Unable to load the image</Trans>
                    </Text>
                  </PlaceholderMessage>
                )}
                {!state.errored && (
                  <CorsAwareImage
                    style={imageStyle}
                    alt={resourceName}
                    src={imageSource}
                    onError={handleImageError}
                    onLoad={handleImageLoaded}
                  />
                )}
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
