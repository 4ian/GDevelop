// @flow
import React from 'react';
import { mapVector } from '../../../../Utils/MapFor';
import Measure from 'react-measure';

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
  imageWidth: number,
  imageHeight: number,
|};

export default class CollisionMasksPreview extends React.Component<
  Props,
  void
> {

  render() {
    const { polygons } = this.props;

    return (
      <svg
        width={this.props.imageWidth}
        height={this.props.imageHeight}
        style={styles.svg}
      >
        {mapVector(polygons, (polygon, i) => {
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
        })}
      </svg>
    );
  }
}
