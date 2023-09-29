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
  imageWidth: number,
  imageHeight: number,
  imageOffsetTop: number,
  imageOffsetLeft: number,
  imageZoomFactor: number,
  onMoveVertex: (index: number, newX: number, newY: number) => void,
  forcedCursor: string | null,
  deactivateControls?: boolean,
|};

type State = {|
  draggedVertex: ?Vertex,
  draggedIndex: number,
|};

const ShapePreview = (props: Props) => {
  const { forcedCursor, deactivateControls } = props;

  const svgRef = React.useRef<React.ElementRef<'svg'> | null>(null);
  const [state, setState] = React.useState<State>({
    draggedVertex: null,
    draggedIndex: -1,
  });

  if (deactivateControls) {
    if (state.draggedVertex) {
      setState({
        draggedVertex: null,
        draggedIndex: -1,
      });
    }
  }

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
    const { polygonOrigin, imageWidth, imageHeight, imageZoomFactor } = props;
    const { draggedVertex, draggedIndex } = state;
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
      frameX / imageZoomFactor -
      props.offsetX -
      (polygonOrigin === 'Center' ? imageWidth / 2 : 0);
    draggedVertex.y =
      frameY / imageZoomFactor -
      props.offsetY -
      (polygonOrigin === 'Center' ? imageHeight / 2 : 0);

    props.onMoveVertex(
      draggedIndex,
      Math.round(draggedVertex ? draggedVertex.x : 0),
      Math.round(draggedVertex ? draggedVertex.y : 0)
    );
    setState({ draggedVertex, draggedIndex });
  };

  /**
   * Given a point's coordinates, returns new coordinates that
   * are confined inside the sprite frame.
   */
  const confinePointToFrame = (freeX: number, freeY: number) => {
    const maxX = props.imageWidth * props.imageZoomFactor;
    const maxY = props.imageHeight * props.imageZoomFactor;

    const frameX = Math.min(maxX, Math.max(freeX, 0));
    const frameY = Math.min(maxY, Math.max(freeY, 0));
    return { frameX, frameY };
  };

  const forcedCursorStyle = forcedCursor
    ? {
        cursor: forcedCursor,
      }
    : {};

  const boxStyle = {
    ...forcedCursorStyle,
  };

  const renderBox = () => {
    const {
      dimensionA,
      dimensionB,
      imageWidth,
      imageHeight,
      offsetX,
      offsetY,
      imageZoomFactor,
    } = props;
    const fixedWidth =
      dimensionA > 0 ? dimensionA : imageWidth > 0 ? imageWidth : 1;
    const fixedHeight =
      dimensionB > 0 ? dimensionB : imageHeight > 0 ? imageHeight : 1;

    return (
      <rect
        key={'boxShape'}
        style={boxStyle}
        fill="rgba(255,0,0,0.75)"
        strokeWidth={1}
        x={(offsetX + imageWidth / 2 - fixedWidth / 2) * imageZoomFactor}
        y={(offsetY + imageHeight / 2 - fixedHeight / 2) * imageZoomFactor}
        width={fixedWidth * imageZoomFactor}
        height={fixedHeight * imageZoomFactor}
      />
    );
  };

  const circleStyle = {
    ...forcedCursorStyle,
  };

  const renderCircle = () => {
    const {
      dimensionA,
      imageWidth,
      imageHeight,
      offsetX,
      offsetY,
      imageZoomFactor,
    } = props;

    return (
      <circle
        key={'circleShape'}
        style={circleStyle}
        fill="rgba(255,0,0,0.75)"
        strokeWidth={1}
        cx={(offsetX + imageWidth / 2) * imageZoomFactor}
        cy={(offsetY + imageHeight / 2) * imageZoomFactor}
        r={
          (dimensionA > 0
            ? dimensionA
            : imageWidth + imageHeight > 0
            ? (imageWidth + imageHeight) / 4
            : 1) * imageZoomFactor
        }
      />
    );
  };

  const edgeStyle = {
    ...forcedCursorStyle,
  };

  const renderEdge = () => {
    const {
      dimensionA,
      dimensionB,
      imageWidth,
      imageHeight,
      offsetX,
      offsetY,
      imageZoomFactor,
    } = props;

    const halfLength =
      (dimensionA > 0 ? dimensionA : imageWidth > 0 ? imageWidth : 1) / 2;
    const cos = Math.cos((dimensionB * Math.PI) / 180);
    const sin = Math.sin((dimensionB * Math.PI) / 180);

    return (
      <line
        key={'edgeShape'}
        style={edgeStyle}
        stroke="rgba(255,0,0,0.75)"
        strokeWidth={2}
        x1={(offsetX + imageWidth / 2 - halfLength * cos) * imageZoomFactor}
        y1={(offsetY + imageHeight / 2 - halfLength * sin) * imageZoomFactor}
        x2={(offsetX + imageWidth / 2 + halfLength * cos) * imageZoomFactor}
        y2={(offsetY + imageHeight / 2 + halfLength * sin) * imageZoomFactor}
      />
    );
  };

  const renderPolygon = () => {
    const {
      vertices,
      polygonOrigin,
      imageWidth,
      imageHeight,
      offsetX,
      offsetY,
      imageZoomFactor,
    } = props;

    const pointStyle = {
      cursor: 'move',
      ...forcedCursorStyle,
    };
    const polygonStyle = {
      ...forcedCursorStyle,
    };

    return (
      <React.Fragment>
        <polygon
          key={'polygonShape'}
          style={polygonStyle}
          fill="rgba(255,0,0,0.75)"
          strokeWidth={1}
          fillRule="evenodd"
          points={vertices
            .map(
              vertex =>
                `${(vertex.x +
                  offsetX +
                  (polygonOrigin === 'Center' ? imageWidth / 2 : 0)) *
                  imageZoomFactor},${(vertex.y +
                  offsetY +
                  (polygonOrigin === 'Center' ? imageHeight / 2 : 0)) *
                  imageZoomFactor}`
            )
            .join(' ')}
        />
        {vertices.map((vertex, index) => (
          <circle
            onPointerDown={() => onVertexDown(vertex, index)}
            key={`vertex-${index}`}
            fill="rgba(150,0,0,0.75)"
            strokeWidth={1}
            style={pointStyle}
            cx={
              (vertex.x +
                offsetX +
                (polygonOrigin === 'Center' ? imageWidth / 2 : 0)) *
              imageZoomFactor
            }
            cy={
              (vertex.y +
                offsetY +
                (polygonOrigin === 'Center' ? imageHeight / 2 : 0)) *
              imageZoomFactor
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
    ...forcedCursorStyle,
  };

  const frameStyle = {
    position: 'absolute',
    top: props.imageOffsetTop || 0,
    left: props.imageOffsetLeft || 0,
    width: props.imageWidth * props.imageZoomFactor,
    height: props.imageHeight * props.imageZoomFactor,
    overflow: 'visible',
    ...forcedCursorStyle,
  };

  return (
    <div
      style={containerStyle}
      onPointerMove={deactivateControls ? null : onMouseMove}
      onPointerUp={deactivateControls ? null : onMouseUp}
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
