import React from 'react';
import { mapVector } from '../../../../Utils/MapFor';

const styles = {
  container: {
    position: 'relative',
  },
};

export default class PointsPreview extends React.Component {
  _renderPoint = (point, src) => {
    return (
      <img
        src={src || 'res/point.png'}
        style={{
          position: 'absolute',
          left: point.getX(),
          top: point.getY(),
          transform: 'translate(-6px, -5px)',
        }}
        alt=""
        key={point.getName()}
      />
    );
  };

  render() {
    const { pointsContainer } = this.props;

    const nonDefaultPoints = pointsContainer.getAllNonDefaultPoints();
    const points = mapVector(nonDefaultPoints, (point, i) =>
      this._renderPoint(point)
    );

    return (
      <div style={styles.container}>
        {points}
        {this._renderPoint(pointsContainer.getOrigin(), 'res/originPoint.png')}
        {this._renderPoint(pointsContainer.getCenter(), 'res/centerPoint.png')}
      </div>
    );
  }
}
