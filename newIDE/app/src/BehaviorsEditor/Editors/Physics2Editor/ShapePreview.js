// @flow
import * as React from 'react';
import { type Vertex } from './PolygonEditor';

type Props = {|
  shape: string,
  dimensionA: number,
  dimensionB: number,
  offsetX: number,
  offsetY: number,
  polygonOrigin: string,
  vertices: Array<Vertex>,
  width: number,
  height: number,
  zoomFactor: number,
  onMoveVertex: (index: number, newX: number, newY: number) => void,
|};

type State = {|
  draggedVertex: ?Vertex,
  draggedIndex: number,
|};

export default class ShapePreview extends React.Component<Props, State> {
  state = { draggedVertex: null, draggedIndex: -1 };
  _svg: any;

  _onVertexDown = (vertex: Vertex, index: number) => {
    if (this.state.draggedVertex) return;
    this.setState({ draggedVertex: vertex, draggedIndex: index });
  };

  _onMouseUp = () => {
    const draggingWasDone = !!this.state.draggedVertex;
    const { draggedVertex, draggedIndex } = this.state;
    this.setState(
      {
        draggedVertex: null,
      },
      () => {
        if (draggingWasDone)
          this.props.onMoveVertex(
            draggedIndex,
            Math.round(draggedVertex ? draggedVertex.x : 0),
            Math.round(draggedVertex ? draggedVertex.y : 0)
          );
      }
    );
  };

  _onMouseMove = (event: any) => {
    const {
      offsetX,
      offsetY,
      polygonOrigin,
      width,
      height,
      zoomFactor,
    } = this.props;
    const { draggedVertex } = this.state;
    if (!draggedVertex) return;

    const pointOnScreen = this._svg.createSVGPoint();
    pointOnScreen.x = event.clientX;
    pointOnScreen.y = event.clientY;
    const screenToSvgMatrix = this._svg.getScreenCTM().inverse();
    const pointOnSvg = pointOnScreen.matrixTransform(screenToSvgMatrix);

    draggedVertex.x =
      pointOnSvg.x / zoomFactor -
      offsetX -
      (polygonOrigin === 'Center' ? width / 2 : 0);
    draggedVertex.y =
      pointOnSvg.y / zoomFactor -
      offsetY -
      (polygonOrigin === 'Center' ? height / 2 : 0);

    this.forceUpdate();
  };

  _renderBox() {
    const {
      dimensionA,
      dimensionB,
      width,
      height,
      offsetX,
      offsetY,
      zoomFactor,
    } = this.props;
    const fixedWidth = dimensionA > 0 ? dimensionA : width > 0 ? width : 1;
    const fixedHeight = dimensionB > 0 ? dimensionB : height > 0 ? height : 1;

    return (
      <rect
        key={'boxShape'}
        fill="rgba(255,0,0,0.75)"
        strokeWidth={1}
        x={(offsetX + width / 2 - fixedWidth / 2) * zoomFactor}
        y={(offsetY + height / 2 - fixedHeight / 2) * zoomFactor}
        width={fixedWidth * zoomFactor}
        height={fixedHeight * zoomFactor}
      />
    );
  }

  _renderCircle() {
    const {
      dimensionA,
      width,
      height,
      offsetX,
      offsetY,
      zoomFactor,
    } = this.props;

    return (
      <circle
        key={'circleShape'}
        fill="rgba(255,0,0,0.75)"
        strokeWidth={1}
        cx={(offsetX + width / 2) * zoomFactor}
        cy={(offsetY + height / 2) * zoomFactor}
        r={
          (dimensionA > 0
            ? dimensionA
            : width + height > 0
            ? (width + height) / 4
            : 1) * zoomFactor
        }
      />
    );
  }

  _renderEdge() {
    const {
      dimensionA,
      dimensionB,
      width,
      height,
      offsetX,
      offsetY,
      zoomFactor,
    } = this.props;
    const halfLength =
      (dimensionA > 0 ? dimensionA : width > 0 ? width : 1) / 2;
    const cos = Math.cos((dimensionB * Math.PI) / 180);
    const sin = Math.sin((dimensionB * Math.PI) / 180);

    return (
      <line
        key={'edgeShape'}
        stroke="rgba(255,0,0,0.75)"
        strokeWidth={2}
        x1={(offsetX + width / 2 - halfLength * cos) * zoomFactor}
        y1={(offsetY + height / 2 - halfLength * sin) * zoomFactor}
        x2={(offsetX + width / 2 + halfLength * cos) * zoomFactor}
        y2={(offsetY + height / 2 + halfLength * sin) * zoomFactor}
      />
    );
  }

  _renderPolygon() {
    const {
      vertices,
      polygonOrigin,
      width,
      height,
      offsetX,
      offsetY,
      zoomFactor,
    } = this.props;

    return (
      <React.Fragment>
        <polygon
          key={'polygonShape'}
          fill="rgba(255,0,0,0.75)"
          strokeWidth={1}
          filerule="evenodd"
          points={vertices
            .map(
              vertex =>
                `${(vertex.x +
                  offsetX +
                  (polygonOrigin === 'Center' ? width / 2 : 0)) *
                  zoomFactor},${(vertex.y +
                  offsetY +
                  (polygonOrigin === 'Center' ? height / 2 : 0)) *
                  zoomFactor}`
            )
            .join(' ')}
        />
        {vertices.map((vertex, index) => (
          <circle
            onPointerDown={event => this._onVertexDown(vertex, index)}
            key={`vertex-${index}`}
            fill="rgba(150,0,0,0.75)"
            strokeWidth={1}
            style={{
              cursor: 'move',
            }}
            cx={
              (vertex.x +
                offsetX +
                (polygonOrigin === 'Center' ? width / 2 : 0)) *
              zoomFactor
            }
            cy={
              (vertex.y +
                offsetY +
                (polygonOrigin === 'Center' ? height / 2 : 0)) *
              zoomFactor
            }
            r={5}
          />
        ))}
      </React.Fragment>
    );
  }

  render() {
    const { shape } = this.props;

    return (
      <svg
        onPointerMove={this._onMouseMove}
        onPointerUp={this._onMouseUp}
        ref={svg => (this._svg = svg)}
        width="100%"
        height="100%"
      >
        {shape === 'Box' && this._renderBox()}
        {shape === 'Circle' && this._renderCircle()}
        {shape === 'Edge' && this._renderEdge()}
        {shape === 'Polygon' && this._renderPolygon()}
      </svg>
    );
  }
}
