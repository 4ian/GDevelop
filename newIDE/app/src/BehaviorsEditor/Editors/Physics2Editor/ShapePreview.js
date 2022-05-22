// @flow
import * as React from 'react';
import useForceUpdate from '../../../Utils/UseForceUpdate';
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
  frameOffsetTop: number,
  frameOffsetLeft: number,
  zoomFactor: number,
  onMoveVertex: (index: number, newX: number, newY: number) => void,
|};

type State = {|
  draggedVertex: ?Vertex,
  draggedIndex: number,
|};

const ShapePreview = (props: Props) => {
  const svgRef = React.useRef<React.ElementRef<'svg'> | null>(null);
  const [state, setState] = React.useState<State>({
    draggedVertex: null,
    draggedIndex: -1,
  });

  const forceUpdate = useForceUpdate();

  const onVertexDown = (vertex: Vertex, index: number) => {
    if (state.draggedVertex) return;
    setState({ draggedVertex: vertex, draggedIndex: index });
  };

  const onMouseUp = () => {
    const { draggedVertex, draggedIndex } = state;
    const draggingWasDone = !!draggedVertex;
    if (draggingWasDone)
      props.onMoveVertex(
        draggedIndex,
        Math.round(draggedVertex ? draggedVertex.x : 0),
        Math.round(draggedVertex ? draggedVertex.y : 0)
      );
    setState({ draggedVertex: null, draggedIndex: -1 });
  };

  const onMouseMove = (event: any) => {
    const { polygonOrigin, width, height, zoomFactor } = props;
    const { draggedVertex } = state;
    if (!draggedVertex) return;

    // $FlowExpectedError Flow doesn't have SVG typings yet (@facebook/flow#4551)
    const pointOnScreen = svgRef.current.createSVGPoint();
    pointOnScreen.x = event.clientX;
    pointOnScreen.y = event.clientY;
    // $FlowExpectedError Flow doesn't have SVG typings yet (@facebook/flow#4551)
    const screenToSvgMatrix = svgRef.current.getScreenCTM().inverse();
    const pointOnSvg = pointOnScreen.matrixTransform(screenToSvgMatrix);

    const { frameX, frameY } = confinePointToFrame(pointOnSvg.x, pointOnSvg.y);

    draggedVertex.x =
      frameX / zoomFactor -
      props.offsetX -
      (polygonOrigin === 'Center' ? width / 2 : 0);
    draggedVertex.y =
      frameY / zoomFactor -
      props.offsetY -
      (polygonOrigin === 'Center' ? height / 2 : 0);

    forceUpdate();
  };

  /**
   * Given a point's coordinates, returns new coordinates that
   * are confined inside the sprite frame.
   */
  const confinePointToFrame = (freeX: number, freeY: number) => {
    const maxX = props.width * props.zoomFactor;
    const maxY = props.height * props.zoomFactor;

    const frameX = Math.min(maxX, Math.max(freeX, 0));
    const frameY = Math.min(maxY, Math.max(freeY, 0));
    return { frameX, frameY };
  };

  const renderBox = () => {
    const {
      dimensionA,
      dimensionB,
      width,
      height,
      offsetX,
      offsetY,
      zoomFactor,
    } = props;
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
  };

  const renderCircle = () => {
    const { dimensionA, width, height, offsetX, offsetY, zoomFactor } = props;

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
  };

  const renderEdge = () => {
    const {
      dimensionA,
      dimensionB,
      width,
      height,
      offsetX,
      offsetY,
      zoomFactor,
    } = props;

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
  };

  const renderPolygon = () => {
    const {
      vertices,
      polygonOrigin,
      width,
      height,
      offsetX,
      offsetY,
      zoomFactor,
    } = props;

    return (
      <React.Fragment>
        <polygon
          key={'polygonShape'}
          fill="rgba(255,0,0,0.75)"
          strokeWidth={1}
          fillRule="evenodd"
          points={vertices
            .map(
              (vertex) =>
                `${
                  (vertex.x +
                    offsetX +
                    (polygonOrigin === 'Center' ? width / 2 : 0)) *
                  zoomFactor
                },${
                  (vertex.y +
                    offsetY +
                    (polygonOrigin === 'Center' ? height / 2 : 0)) *
                  zoomFactor
                }`
            )
            .join(' ')}
        />
        {vertices.map((vertex, index) => (
          <circle
            onPointerDown={() => onVertexDown(vertex, index)}
            key={`vertex-${index}`}
            fill="rgba(150,0,0,0.75)"
            strokeWidth={1}
            style={{ cursor: 'move' }}
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
  };

  const containerStyle = {
    position: 'relative',
    width: '100%',
    height: '100%',
  };

  const frameStyle = {
    position: 'absolute',
    top: props.frameOffsetTop || 0,
    left: props.frameOffsetLeft || 0,
    width: props.width * props.zoomFactor,
    height: props.height * props.zoomFactor,
    overflow: 'visible',
  };

  return (
    <div
      style={containerStyle}
      onPointerMove={onMouseMove}
      onPointerUp={onMouseUp}
    >
      <svg style={frameStyle} ref={svgRef}>
        {props.shape === 'Box' && renderBox()}
        {props.shape === 'Circle' && renderCircle()}
        {props.shape === 'Edge' && renderEdge()}
        {props.shape === 'Polygon' && renderPolygon()}
      </svg>
    </div>
  );
};

export default ShapePreview;
