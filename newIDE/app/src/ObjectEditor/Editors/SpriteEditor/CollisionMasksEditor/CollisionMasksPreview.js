// @flow
import React from 'react';
import { mapVector } from '../../../../Utils/MapFor';

const styles = {
  container: {
    position: 'relative',
  },
  svg: {
    width: '100%',
    height: '100%',
  },
};

type Props = {|
  polygons: gdVectorPolygon2d,
  isDefaultBoundingBox: boolean,
  imageWidth: number,
  imageHeight: number,
|};

export default class CollisionMasksPreview extends React.Component<
  Props,
  void
> {
  _renderBoundingBox() {
    const { imageWidth, imageHeight } = this.props;

    return (
      <polygon
        fill="rgba(255,0,0,0.2)"
        stroke="rgba(255,0,0,0.5)"
        strokeWidth={1}
        fileRule="evenodd"
        points={`0,0 ${imageWidth},0 ${imageWidth},${imageHeight} 0,${imageHeight}`}
      />
    );
  }

  _renderPolygons() {
    const { polygons } = this.props;

    return mapVector(polygons, (polygon, i) => {
      const vertices = polygon.getVertices();
      return (
        <polygon
          fill="rgba(255,0,0,0.2)"
          stroke="rgba(255,0,0,0.5)"
          strokeWidth={1}
          fileRule="evenodd"
          points={mapVector(
            vertices,
            (vertex, j) => `${vertex.get_x()},${vertex.get_y()}`
          ).join(' ')}
        />
      );
    });
  }

  render() {
    const { isDefaultBoundingBox } = this.props;

    return (
      <svg
        width={this.props.imageWidth}
        height={this.props.imageHeight}
        style={styles.svg}
      >
        {isDefaultBoundingBox && this._renderBoundingBox()}
        {!isDefaultBoundingBox && this._renderPolygons()}
      </svg>
    );
  }
}
