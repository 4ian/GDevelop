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
  onMoveVertex: (index: number, newX: number, newY: number) => void,
|};

type State = {|
  draggedVertex: ?Vertex,
  draggedIndex: number,
|};

export default class ShapePreview extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { draggedVertex: null, draggedIndex: -1 };
  }

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
    const { offsetX, offsetY, polygonOrigin, width, height } = this.props;
    const { draggedVertex } = this.state;
    if (!draggedVertex) return;

    const pointOnScreen = this._svg.createSVGPoint();
    pointOnScreen.x = event.clientX;
    pointOnScreen.y = event.clientY;
    const screenToSvgMatrix = this._svg.getScreenCTM().inverse();
    const pointOnSvg = pointOnScreen.matrixTransform(screenToSvgMatrix);

    draggedVertex.x =
      pointOnSvg.x - offsetX - (polygonOrigin === 'Center' ? width / 2 : 0);
    draggedVertex.y =
      pointOnSvg.y - offsetY - (polygonOrigin === 'Center' ? height / 2 : 0);

    this.forceUpdate();
  };

  renderBox() {
    const {
      dimensionA,
      dimensionB,
      width,
      height,
      offsetX,
      offsetY,
    } = this.props;
    const fixedWidth = dimensionA > 0 ? dimensionA : width > 0 ? width : 1;
    const fixedHeight = dimensionB > 0 ? dimensionB : height > 0 ? height : 1;

    return (
      <rect
        key={'boxShape'}
        fill="rgba(255,0,0,0.75)"
        strokeWidth={1}
        x={offsetX + width / 2 - fixedWidth / 2}
        y={offsetY + height / 2 - fixedHeight / 2}
        width={fixedWidth}
        height={fixedHeight}
      />
    );
  }

  renderCircle() {
    const { dimensionA, width, height, offsetX, offsetY } = this.props;

    return (
      <circle
        key={'circleShape'}
        fill="rgba(255,0,0,0.75)"
        strokeWidth={1}
        cx={offsetX + width / 2}
        cy={offsetY + height / 2}
        r={
          dimensionA > 0
            ? dimensionA
            : width + height > 0
            ? (width + height) / 4
            : 1
        }
      />
    );
  }

  renderEdge() {
    const {
      dimensionA,
      dimensionB,
      width,
      height,
      offsetX,
      offsetY,
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
        x1={offsetX + width / 2 - halfLength * cos}
        y1={offsetY + height / 2 - halfLength * sin}
        x2={offsetX + width / 2 + halfLength * cos}
        y2={offsetY + height / 2 + halfLength * sin}
      />
    );
  }

  renderPolygon() {
    const {
      vertices,
      polygonOrigin,
      width,
      height,
      offsetX,
      offsetY,
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
                `${vertex.x +
                  offsetX +
                  (polygonOrigin === 'Center' ? width / 2 : 0)},${vertex.y +
                  offsetY +
                  (polygonOrigin === 'Center' ? height / 2 : 0)}`
            )
            .join(' ')}
        />
        {vertices.map((vertex, index) => (
          <circle
            onPointerDown={event => this._onVertexDown(vertex, index)}
            key={`vertex-${index}`}
            fill="rgba(150,0,0,0.75)"
            strokeWidth={1}
            cx={
              vertex.x + offsetX + (polygonOrigin === 'Center' ? width / 2 : 0)
            }
            cy={
              vertex.y + offsetY + (polygonOrigin === 'Center' ? height / 2 : 0)
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
      >
        {shape === 'Box' && this.renderBox()}
        {shape === 'Circle' && this.renderCircle()}
        {shape === 'Edge' && this.renderEdge()}
        {shape === 'Polygon' && this.renderPolygon()}
      </svg>
    );
  }
}
