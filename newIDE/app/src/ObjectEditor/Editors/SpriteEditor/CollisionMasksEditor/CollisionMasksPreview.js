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
  imageZoomFactor: number,
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

    draggedVertex.set_x(pointOnSvg.x / this.props.imageZoomFactor);
    draggedVertex.set_y(pointOnSvg.y / this.props.imageZoomFactor);
    this.forceUpdate();
  };

  _renderBoundingBox() {
    const { imageWidth, imageHeight, imageZoomFactor } = this.props;

    return (
      <polygon
        fill="rgba(255,0,0,0.2)"
        stroke="rgba(255,0,0,0.5)"
        strokeWidth={1}
        fillRule="evenodd"
        points={`0,0 ${imageWidth * imageZoomFactor},0 ${imageWidth *
          imageZoomFactor},${imageHeight * imageZoomFactor} 0,${imageHeight *
          imageZoomFactor}`}
      />
    );
  }

  _renderPolygons() {
    const { polygons, imageZoomFactor } = this.props;

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
              fillRule="evenodd"
              points={mapVector(
                vertices,
                (vertex, j) =>
                  `${vertex.get_x() * imageZoomFactor},${vertex.get_y() *
                    imageZoomFactor}`
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
              cx={vertex.get_x() * imageZoomFactor}
              cy={vertex.get_y() * imageZoomFactor}
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
        width={this.props.imageWidth * this.props.imageZoomFactor}
        height={this.props.imageHeight * this.props.imageZoomFactor}
        style={styles.svg}
        ref={svg => (this._svg = svg)}
      >
        {isDefaultBoundingBox && this._renderBoundingBox()}
        {!isDefaultBoundingBox && this._renderPolygons()}
      </svg>
    );
  }
}
