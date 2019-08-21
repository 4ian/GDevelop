// @flow
import { Trans } from '@lingui/macro';
import IconButton from '../../UI/IconButton';
import Measure from 'react-measure';
import * as React from 'react';
import ResourcesLoader from '../../ResourcesLoader';
import { Column } from '../../UI/Grid';
import MiniToolbar from '../../UI/MiniToolbar';
import ZoomIn from 'material-ui/svg-icons/action/zoom-in';
import ZoomOut from 'material-ui/svg-icons/action/zoom-out';
import ZoomOutMap from 'material-ui/svg-icons/maps/zoom-out-map';

const MARGIN = 50;
const MAX_ZOOM_FACTOR = 10;
const MIN_ZOOM_FACTOR = 0.1;

const styles = {
  imagePreviewContainer: {
    position: 'relative',
    display: 'inline-block',
    width: '100%',
    border: '#AAAAAA 1px solid',
    overflow: 'scroll',
    height: 200,
    background: 'url("res/transparentback.png") repeat',
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
  renderOverlay?: ({|
    imageWidth: number,
    imageHeight: number,
    imageZoomFactor: number,
  |}) => React.Node,
  style?: Object,
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
  _container: ?HTMLDivElement = null;

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
      imageSource: resourcesLoader.getResourceFullUrl(project, resourceName),
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
      <Measure>
        {dimensions => {
          const containerWidth = dimensions.width;
          const { resourceName, style, renderOverlay } = this.props;
          const {
            imageHeight,
            imageWidth,
            imageSource,
            imageZoomFactor,
          } = this.state;

          const imageLoaded = !!imageWidth && !!imageHeight;

          const imagePositionTop = 0;
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

          const overlayStyle = {
            position: 'absolute',
            top: imagePositionTop + MARGIN,
            left: imagePositionLeft + MARGIN,
            width: imageWidth ? imageWidth * imageZoomFactor : undefined,
            height: imageHeight ? imageHeight * imageZoomFactor : undefined,
            visibility: imageLoaded ? undefined : 'hidden', // TODO: Loader
          };

          return (
            <Column expand noMargin>
              <MiniToolbar>
                <IconButton
                  onClick={() => this._zoomBy(+0.2)}
                  tooltip={
                    <Trans>Zoom in (you can also use Ctrl + Mouse wheel)</Trans>
                  }
                  tooltipPosition="bottom-right"
                >
                  <ZoomIn />
                </IconButton>
                <IconButton
                  onClick={() => this._zoomBy(-0.2)}
                  tooltip={
                    <Trans>
                      Zoom out (you can also use Ctrl + Mouse wheel)
                    </Trans>
                  }
                  tooltipPosition="bottom-right"
                >
                  <ZoomOut />
                </IconButton>
                <IconButton
                  onClick={() => this._zoomTo(1)}
                  tooltip={<Trans>Restore original size</Trans>}
                  tooltipPosition="bottom-right"
                >
                  <ZoomOutMap />
                </IconButton>
              </MiniToolbar>
              <div
                style={{ ...styles.imagePreviewContainer, ...style }}
                ref={container => (this._container = container)}
                onWheel={event => {
                  const { deltaY } = event;
                  //TODO: Use KeyboardShortcuts
                  if (event.metaKey || event.ctrlKey) {
                    this._zoomBy(deltaY / 500);
                    event.preventDefault();
                    event.stopPropagation();
                  } else {
                    // Let the usual, native vertical or horizontal scrolling happen.
                  }
                }}
              >
                {!!this.state.errored && (
                  <p>
                    <Trans>Unable to load the image</Trans>
                  </p>
                )}
                {!this.state.errored && (
                  <img
                    style={imageStyle}
                    alt={resourceName}
                    src={imageSource}
                    onError={this._handleImageError}
                    onLoad={this._handleImageLoaded}
                    crossOrigin="anonymous"
                  />
                )}
                {imageLoaded && renderOverlay && (
                  <div style={{ ...overlayStyle, ...styles.box }} />
                )}
                {imageLoaded && renderOverlay && (
                  <div style={overlayStyle}>
                    {renderOverlay({
                      imageWidth: imageWidth || 0,
                      imageHeight: imageHeight || 0,
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
