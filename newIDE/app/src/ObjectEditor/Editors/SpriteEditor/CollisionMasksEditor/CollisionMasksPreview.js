// @flow
import * as React from 'react';
import { mapVector } from '../../../../Utils/MapFor';

const styles = {
  container: {
    position: 'relative',
  },
  svg: {
    width: '100%',
    height: '100%',
  },
  vertexCircle: {
    cursor: 'move',
  },
};

type Props = {|
  polygons: gdVectorPolygon2d,
  isDefaultBoundingBox: boolean,
  imageWidth: number,
  imageHeight: number,
  onPolygonsUpdated: () => void,
|};

type State = {|
  draggedVertex: ?gdVector2f,
|};

export default class CollisionMasksPreview extends React.Component<
  Props,
  State
> {
  _svg: any;
  state = {
    draggedVertex: null,
  };

  _onStartDragVertex = (draggedVertex: gdVector2f) => {
    if (this.state.draggedVertex) return;

    this.setState({
      draggedVertex,
    });
  };

  _onEndDragVertex = () => {
    const draggingWasDone = !!this.state.draggedVertex;
    this.setState(
      {
        draggedVertex: null,
      },
      () => {
        if (draggingWasDone) this.props.onPolygonsUpdated();
      }
    );
  };

  /**
   * Move a vertex with the mouse. A similar dragging implementation is done in
   * PointsPreview (but with div and img elements).
   *
   * If custom zoom is added, this should be adapted to properly set vertex coordinates.
   * TODO: This could be optimized by avoiding the forceUpdate (not sure if worth it though).
   */
  _onPointerMove = (event: any) => {
    const { draggedVertex } = this.state;
    if (!draggedVertex) return;

    const pointOnScreen = this._svg.createSVGPoint();
    pointOnScreen.x = event.clientX;
    pointOnScreen.y = event.clientY;
    const screenToSvgMatrix = this._svg.getScreenCTM().inverse();
    const pointOnSvg = pointOnScreen.matrixTransform(screenToSvgMatrix);

    draggedVertex.set_x(pointOnSvg.x);
    draggedVertex.set_y(pointOnSvg.y);
    this.forceUpdate();
  };

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

    return (
      <React.Fragment>
        {mapVector(polygons, (polygon, i) => {
          const vertices = polygon.getVertices();
          return (
            <polygon
              key={`polygon-${i}`}
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
        {mapVector(polygons, (polygon, i) => {
          const vertices = polygon.getVertices();
          return mapVector(vertices, (vertex, j) => (
            <circle
              onPointerDown={event => this._onStartDragVertex(vertex)}
              key={`polygon-${i}-vertex-${j}`}
              fill="rgba(255,0,0,0.75)"
              strokeWidth={1}
              cx={vertex.get_x()}
              cy={vertex.get_y()}
              r={5}
              style={styles.vertexCircle}
            />
          ));
        })}
      </React.Fragment>
    );
  }

  render() {
    const { isDefaultBoundingBox } = this.props;

    return (
      <svg
        onPointerMove={this._onPointerMove}
        onPointerUp={this._onEndDragVertex}
        width={this.props.imageWidth}
        height={this.props.imageHeight}
        style={styles.svg}
        ref={svg => (this._svg = svg)}
      >
        {isDefaultBoundingBox && this._renderBoundingBox()}
        {!isDefaultBoundingBox && this._renderPolygons()}
      </svg>
    );
  }
}
