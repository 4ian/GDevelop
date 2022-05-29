// @flow
import * as React from 'react';
import { mapVector } from '../../../../Utils/MapFor';
import useForceUpdate from '../../../../Utils/UseForceUpdate';

const styles = {
  vertexCircle: {
    cursor: 'move',
  },
};

type Props = {|
  polygons: gdVectorPolygon2d,
  isDefaultBoundingBox: boolean,
  imageWidth: number,
  imageHeight: number,
  offsetTop: number,
  offsetLeft: number,
  highlightedVerticePtr: ?number,
  selectedVerticePtr: ?number,
  onClickVertice: (ptr: ?number) => void,
  imageZoomFactor: number,
  onPolygonsUpdated: () => void,
|};

const CollisionMasksPreview = (props: Props) => {
  const svgRef = React.useRef<React.ElementRef<'svg'> | null>(null);
  const [draggedVertex, setDraggedVertex] = React.useState<gdVector2f | null>(
    null
  );

  const {
    polygons,
    imageZoomFactor,
    imageHeight,
    imageWidth,
    offsetTop,
    offsetLeft,
    isDefaultBoundingBox,
  } = props;

  const forceUpdate = useForceUpdate();

  const onStartDragVertex = (vertex: gdVector2f) => {
    if (draggedVertex) return;
    setDraggedVertex(vertex);
  };

  const onEndDragVertex = () => {
    if (!!draggedVertex) {
      props.onPolygonsUpdated();
      props.onClickVertice(draggedVertex.ptr);
    }
    setDraggedVertex(null);
  };

  /**
   * Move a vertex with the mouse. A similar dragging implementation is done in
   * PointsPreview (but with div and img elements).
   *
   * TODO: This could be optimized by avoiding the forceUpdate (not sure if worth it though).
   */
  const onPointerMove = (event: any) => {
    if (!draggedVertex || !svgRef.current) return;

    // $FlowExpectedError Flow doesn't have SVG typings yet (@facebook/flow#4551)
    const pointOnScreen = svgRef.current.createSVGPoint();
    pointOnScreen.x = event.clientX;
    pointOnScreen.y = event.clientY;
    // $FlowExpectedError Flow doesn't have SVG typings yet (@facebook/flow#4551)
    const screenToSvgMatrix = svgRef.current.getScreenCTM().inverse();
    const pointOnSvg = pointOnScreen.matrixTransform(screenToSvgMatrix);

    // Confine vertices to inside the sprite frame
    const { frameX, frameY } = confinePointToFrame(pointOnSvg.x, pointOnSvg.y);

    draggedVertex.set_x(frameX / imageZoomFactor);
    draggedVertex.set_y(frameY / imageZoomFactor);
    forceUpdate();
  };

  /**
   * Given a point's coordinates, returns new coordinates that
   * are confined inside the sprite frame.
   */
  const confinePointToFrame = (freeX: number, freeY: number) => {
    const maxX = imageWidth * imageZoomFactor;
    const maxY = imageHeight * imageZoomFactor;

    const frameX = Math.min(maxX, Math.max(freeX, 0));
    const frameY = Math.min(maxY, Math.max(freeY, 0));
    return { frameX, frameY };
  };

  const renderBoundingBox = () => {
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
  };

  const renderPolygons = () => {
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
              onPointerDown={() => onStartDragVertex(vertex)}
              key={`polygon-${i}-vertex-${j}`}
              fill={
                vertex.ptr === props.selectedVerticePtr
                  ? 'rgba(0,0,255,0.75)'
                  : 'rgba(255,0,0,0.75)'
              }
              stroke={
                vertex.ptr === props.highlightedVerticePtr
                  ? vertex.ptr === props.selectedVerticePtr
                    ? 'white'
                    : 'black'
                  : undefined
              }
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
  };

  const containerStyle = {
    position: 'relative',
    width: '100%',
    height: '100%',
  };

  const svgStyle = {
    position: 'absolute',
    top: offsetTop || 0,
    left: offsetLeft || 0,
    width: imageWidth * imageZoomFactor,
    height: imageHeight * imageZoomFactor,
    overflow: 'visible',
  };

  return (
    <div
      style={containerStyle}
      onPointerMove={onPointerMove}
      onPointerUp={onEndDragVertex}
    >
      <svg style={svgStyle} ref={svgRef}>
        {isDefaultBoundingBox && renderBoundingBox()}
        {!isDefaultBoundingBox && renderPolygons()}
      </svg>
    </div>
  );
};

export default CollisionMasksPreview;
