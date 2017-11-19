import React from 'react';
import { mapVector } from '../../../../Utils/MapFor';

const styles = {
  container: {
    position: 'relative',
  },
};

export default class PointsPreview extends React.Component {
  _renderPoint = (name, x, y, imageSrc = undefined) => {
    return (
      <img
        src={imageSrc || 'res/point.png'}
        style={{
          position: 'absolute',
          left: x,
          top: y,
          transform: 'translate(-6px, -5px)',
        }}
        alt=""
        key={name}
      />
    );
  };

  render() {
    const { pointsContainer, imageWidth, imageHeight } = this.props;

    const nonDefaultPoints = pointsContainer.getAllNonDefaultPoints();
    const points = mapVector(nonDefaultPoints, (point, i) =>
      this._renderPoint(point.getName(), point.getX(), point.getY())
    );

    const originPoint = pointsContainer.getOrigin();
    const centerPoint = pointsContainer.getCenter();
    const automaticCenterPosition = pointsContainer.isDefaultCenterPoint();

    return (
      <div style={styles.container}>
        {points}
        {this._renderPoint(
          'Origin',
          originPoint.getX(),
          originPoint.getY(),
          'res/originPoint.png'
        )}
        {this._renderPoint(
          'Center',
          !automaticCenterPosition ? centerPoint.getX() : imageWidth / 2,
          !automaticCenterPosition ? centerPoint.getY() : imageHeight / 2,
          'res/centerPoint.png'
        )}
      </div>
    );
  }
}
