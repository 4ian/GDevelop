// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import ResourcesLoader from '../../ResourcesLoader';

const MARGIN = 50;

const styles = {
  imagePreviewContainer: {
    position: 'relative',
    display: 'inline-block',
    width: '100%',
    textAlign: 'center',
    border: '#AAAAAA 1px solid',
    overflow: 'scroll',
    height: 200,
    background: 'url("res/transparentback.png") repeat',
  },
  spriteThumbnailImage: {
    pointerEvents: 'none',
    margin: MARGIN,
  },
  overlayContainer: {
    textAlign: 'initial',
    position: 'absolute',
    top: MARGIN,
    left: '50%',
    transform: 'translate(-50%, 0)',
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
  children?: any,
  style?: Object,
  onSize?: (number, number) => void,
|};

type State = {|
  errored: boolean,
  imageWidth: ?number,
  imageHeight: ?number,
  imageSource: ?string,
|};

/**
 * Display the preview for a resource of a project with kind "image".
 */
export default class ImagePreview extends React.Component<Props, State> {
  _container: ?HTMLDivElement = null;

  constructor(props: Props) {
    super(props);

    this.state = this._loadFrom(props);
  }

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

  _loadFrom(props: Props): State {
    const { project, resourceName, resourcesLoader } = props;
    return {
      errored: false,
      imageWidth: null,
      imageHeight: null,
      imageSource: resourcesLoader.getResourceFullUrl(project, resourceName),
    };
  }

  componentDidMount() {
    if (this._container) {
      this._container.scrollTop = MARGIN;
      this._container.scrollLeft = MARGIN;
    }
  }

  _handleError = () => {
    this.setState({
      errored: true,
    });
  };

  _handleImageLoaded = (e: any) => {
    const imgElement = e.target;

    const imageWidth = imgElement ? imgElement.clientWidth : 0;
    const imageHeight = imgElement ? imgElement.clientHeight : 0;
    this.setState({
      imageWidth,
      imageHeight,
    });
    if (this.props.onSize) this.props.onSize(imageWidth, imageHeight);
  };

  render() {
    const { resourceName, style, children } = this.props;

    const { imageHeight, imageWidth, imageSource } = this.state;

    const overlayStyle = {
      ...styles.overlayContainer,
      width: this.state.imageWidth,
      height: this.state.imageHeight,
    };
    const canDisplayOverlays = !!imageWidth && !!imageHeight;

    return (
      <div
        style={{ ...styles.imagePreviewContainer, ...style }}
        ref={container => (this._container = container)}
      >
        {!!this.state.errored && (
          <p>
            <Trans>Unable to load the image</Trans>
          </p>
        )}
        {!this.state.errored && (
          <img
            style={styles.spriteThumbnailImage}
            alt={resourceName}
            src={imageSource}
            onError={this._handleError}
            onLoad={this._handleImageLoaded}
            crossOrigin="anonymous"
          />
        )}
        {canDisplayOverlays && children && (
          <div style={{ ...overlayStyle, ...styles.box }} />
        )}
        {canDisplayOverlays && children && (
          <div style={overlayStyle}>
            {React.cloneElement(children, {
              imageWidth,
              imageHeight,
            })}
          </div>
        )}
      </div>
    );
  }
}
