import React from 'react';

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

export default class ImagePreview extends React.Component {
  state = {
    errored: false,
    imageWidth: null,
    imageHeight: null,
  };

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

  _handleImageLoaded = (e, t) => {
    const imgElement = e.target;

    this.setState({
      imageWidth: imgElement ? imgElement.clientWidth : 0,
      imageHeight: imgElement ? imgElement.clientHeight : 0,
    });
  };

  render() {
    const {
      project,
      resourceName,
      resourcesLoader,
      style,
      children,
    } = this.props;

    const { imageHeight, imageWidth } = this.state;

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
        {!!this.state.errored && <p>Unable to load the image</p>}
        {!this.state.errored && (
          <img
            style={styles.spriteThumbnailImage}
            alt={resourceName}
            src={resourcesLoader.getResourceFullFilename(project, resourceName)}
            onError={this._handleError}
            onLoad={this._handleImageLoaded}
          />
        )}
        {canDisplayOverlays &&
          children && <div style={{ ...overlayStyle, ...styles.box }} />}
        {canDisplayOverlays &&
          children && (
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
