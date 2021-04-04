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

const MARGIN = 50;
const MAX_ZOOM_FACTOR = 10;
const MIN_ZOOM_FACTOR = 0.1;

const styles = {
  imagePreviewContainer: {
    position: 'relative',
    display: 'inline-block',
    width: '100%',
    border: '#AAAAAA 1px solid',
    boxSizing: 'border-box',
    overflow: 'auto',
    background: 'url("res/transparentback.png") repeat',

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
  box: {
    border: '1px solid black',
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

/**
 * Display the preview for a resource of a project with kind "image".
 */
export default class ImagePreview extends React.Component<Props, State> {
  state = {
    errored: false,
    imageWidth: null,
    imageHeight: null,
    imageZoomFactor: 1,
    ...this._loadFrom(this.props),
  };

  componentWillReceiveProps(newProps: Props) {
    if (
      newProps.resourceName !== this.props.resourceName ||
      newProps.project !== this.props.project ||
      newProps.resourcesLoader !== this.props.resourcesLoader ||
      newProps.resourcePath !== this.props.resourcePath
    ) {
      this.setState(this._loadFrom(newProps));
    }
  }

  _loadFrom(props: Props): {| errored: boolean, imageSource: ?string |} {
    const { project, resourceName, resourcesLoader } = props;
    return {
      errored: false,
      imageSource: resourcesLoader.getResourceFullUrl(
        project,
        resourceName,
        {}
      ),
    };
  }

  _handleImageError = () => {
    this.setState({
      errored: true,
    });
  };

  _handleImageLoaded = (e: any) => {
    const imgElement = e.target;

    const imageWidth = imgElement
      ? imgElement.naturalWidth || imgElement.clientWidth
      : 0;
    const imageHeight = imgElement
      ? imgElement.naturalHeight || imgElement.clientHeight
      : 0;
    this.setState({
      imageWidth,
      imageHeight,
    });
    if (this.props.onSize) this.props.onSize(imageWidth, imageHeight);
  };

  _zoomBy = (imageZoomFactorDelta: number) => {
    this._zoomTo(this.state.imageZoomFactor + imageZoomFactorDelta);
  };

  _zoomTo = (imageZoomFactor: number) => {
    this.setState(state => ({
      imageZoomFactor: Math.min(
        MAX_ZOOM_FACTOR,
        Math.max(MIN_ZOOM_FACTOR, imageZoomFactor)
      ),
    }));
  };

  render() {
    return (
      <Measure bounds>
        {({ contentRect, measureRef }) => {
          const containerWidth = contentRect.bounds.width;
          const containerHeight = contentRect.bounds.height;
          const { resourceName, renderOverlay, fixedHeight } = this.props;
          const {
            imageHeight,
            imageWidth,
            imageSource,
            imageZoomFactor,
          } = this.state;

          const imageLoaded =
            !!imageWidth && !!imageHeight && !this.state.errored;

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
            top: imagePositionTop,
            left: imagePositionLeft,
            width: imageWidth ? imageWidth * imageZoomFactor : undefined,
            height: imageHeight ? imageHeight * imageZoomFactor : undefined,
            visibility: imageLoaded ? undefined : 'hidden', // TODO: Loader
          };

          const frameStyle = {
            position: 'absolute',
            top: imagePositionTop + MARGIN,
            left: imagePositionLeft + MARGIN,
            width: imageWidth ? imageWidth * imageZoomFactor : undefined,
            height: imageHeight ? imageHeight * imageZoomFactor : undefined,
            visibility: imageLoaded ? undefined : 'hidden', // TODO: Loader
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
                  onClick={() => this._zoomBy(+0.2)}
                  tooltip={t`Zoom in (you can also use Ctrl + Mouse wheel)`}
                >
                  <ZoomIn />
                </IconButton>
                <IconButton
                  onClick={() => this._zoomBy(-0.2)}
                  tooltip={t`Zoom out (you can also use Ctrl + Mouse wheel)`}
                >
                  <ZoomOut />
                </IconButton>
                <IconButton
                  onClick={() => this._zoomTo(1)}
                  tooltip={t`Restore original size`}
                >
                  <ZoomOutMap />
                </IconButton>
              </MiniToolbar>
              <div
                dir={
                  'ltr' /* Force LTR layout to avoid issues with image positioning */
                }
                style={{
                  ...styles.imagePreviewContainer,
                  height: fixedHeight || '100%',
                }}
                ref={measureRef}
                onWheel={event => {
                  const { deltaY } = event;
                  //TODO: Use KeyboardShortcuts
                  if (event.metaKey || event.ctrlKey) {
                    this._zoomBy(-deltaY / 500);
                    event.preventDefault();
                    event.stopPropagation();
                  } else {
                    // Let the usual, native vertical or horizontal scrolling happen.
                  }
                }}
              >
                {!!this.state.errored && (
                  <PlaceholderMessage>
                    <Text>
                      <Trans>Unable to load the image</Trans>
                    </Text>
                  </PlaceholderMessage>
                )}
                {!this.state.errored && (
                  <CorsAwareImage
                    style={imageStyle}
                    alt={resourceName}
                    src={imageSource}
                    onError={this._handleImageError}
                    onLoad={this._handleImageLoaded}
                  />
                )}
                {imageLoaded && renderOverlay && (
                  <div style={{ ...frameStyle, ...styles.box }} />
                )}
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
            </Column>
          );
        }}
      </Measure>
    );
  }
}
