// @flow
import React from 'react';
import { mapVector } from '../../../../Utils/MapFor';

const styles = {
  container: {
    position: 'relative',
  },
};

type Props = {|
  polygons: gdVectorPolygon2d,
|};

export default class CollisionMasksPreview extends React.Component<
  Props,
  void
> {
  render() {
    const { polygons } = this.props;

    return (
      <div style={styles.container}>
        <svg>
          {mapVector(polygons, polygon => {
            const vertices = polygon.getVertices();
            return mapVector(vertices, vertex => (
              <circle
                cx={vertex.get_x()}
                cy={vertex.get_y()}
                r="3"
                fill="blue"
              />
            ));
          })}
        </svg>
      </div>
    );
  }
}
