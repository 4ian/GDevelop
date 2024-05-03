// @flow
import * as React from 'react';
import { mapVector } from '../../../../Utils/MapFor';
import useForceUpdate from '../../../../Utils/UseForceUpdate';
import { dataObjectToProps } from '../../../../Utils/HTMLDataset';
import {
  roundVertexToHalfPixel,
  findNearestEdgePoint,
  getMagnetizedVertexForDeletion,
  type NewVertexHintPoint,
} from './PolygonHelper';

const gd = global.gd;

type SelectedVertex = {|
  vertex: gdVector2f,
  polygonIndex: number,
  vertexIndex: number,
|};

type Props = {|
  polygons: gdVectorPolygon2d,
  isDefaultBoundingBox: boolean,
  imageWidth: number,
  imageHeight: number,
  imageOffsetTop: number,
  imageOffsetLeft: number,
  highlightedVerticePtr: ?number,
  selectedVerticePtr: ?number,
  onClickVertice: (ptr: ?number) => void,
  imageZoomFactor: number,
  onPolygonsUpdated: () => void,
  forcedCursor: string | null,
  deactivateControls?: boolean,
  hideControls?: boolean,
|};

const CollisionMasksPreview = (props: Props) => {
  const svgRef = React.useRef<React.ElementRef<'svg'> | null>(null);
  const [
    draggedVertex,
    setDraggedVertex,
  ] = React.useState<SelectedVertex | null>(null);
  const [
    newVertexHintPoint,
    setNewVertexHintPoint,
  ] = React.useState<NewVertexHintPoint | null>(null);

  const {
    polygons,
    imageZoomFactor,
    imageHeight,
    imageWidth,
    imageOffsetTop,
    imageOffsetLeft,
    isDefaultBoundingBox,
    onPolygonsUpdated,
    onClickVertice,
    forcedCursor,
    deactivateControls,
    hideControls,
  } = props;

  if (deactivateControls) {
    if (draggedVertex) {
      setDraggedVertex(null);
    }
    if (newVertexHintPoint) {
      setNewVertexHintPoint(null);
    }
  }

  const forceUpdate = useForceUpdate();

  const onStartDragVertex = React.useCallback(
    (vertex: gdVector2f, polygonIndex: number, vertexIndex: number) => {
      if (draggedVertex) return;
      setDraggedVertex({ vertex, polygonIndex, vertexIndex });
    },
    [draggedVertex]
  );

  /**
   * Move a vertex with the mouse. A similar dragging implementation is done in
   * PointsPreview (but with div and img elements).
   *
   * TODO: This could be optimized by avoiding the forceUpdate (not sure if worth it though).
   */
  const onPointerMove = (event: any) => {
    /** The cursor position in the frame basis. */
    const cursorOnFrame = getCursorOnFrame(event);
    if (!cursorOnFrame) {
      return;
    }

    if (draggedVertex) {
      // Confine vertices to inside the sprite frame
      const cursorIntoFrame = confinePointIntoFrame(
        cursorOnFrame[0],
        cursorOnFrame[1]
      );
      const cursorX = cursorIntoFrame.frameX / imageZoomFactor;
      const cursorY = cursorIntoFrame.frameY / imageZoomFactor;
      draggedVertex.vertex.set_x(cursorX);
      draggedVertex.vertex.set_y(cursorY);

      magnetizeDraggedVertexForDeletion();

      forceUpdate();
    } else {
      const cursorX = cursorOnFrame[0] / imageZoomFactor;
      const cursorY = cursorOnFrame[1] / imageZoomFactor;

      const vertexDistanceMin = 20 / imageZoomFactor;
      const edgeDistanceMax = 40 / imageZoomFactor;

      setNewVertexHintPoint(
        findNearestEdgePoint(
          polygons,
          cursorX,
          cursorY,
          vertexDistanceMin,
          edgeDistanceMax
        )
      );
    }
  };

  /**
   * @returns The cursor position in the frame basis.
   */
  const getCursorOnFrame = React.useCallback((event: any):
    | [number, number]
    | null => {
    if (!svgRef.current) return null;

    // $FlowExpectedError Flow doesn't have SVG typings yet (@facebook/flow#4551)
    const pointOnScreen = svgRef.current.createSVGPoint();
    pointOnScreen.x = event.clientX;
    pointOnScreen.y = event.clientY;
    // $FlowExpectedError Flow doesn't have SVG typings yet (@facebook/flow#4551)
    const screenToSvgMatrix = svgRef.current.getScreenCTM().inverse();
    const pointOnSvg = pointOnScreen.matrixTransform(screenToSvgMatrix);

    return [pointOnSvg.x, pointOnSvg.y];
  }, []);

  /**
   * Given a point's coordinates, returns new coordinates that
   * are confined inside the sprite frame.
   */
  const confinePointIntoFrame = React.useCallback(
    (freeX: number, freeY: number) => {
      const maxX = imageWidth * imageZoomFactor;
      const maxY = imageHeight * imageZoomFactor;

      const frameX = Math.min(maxX, Math.max(freeX, 0));
      const frameY = Math.min(maxY, Math.max(freeY, 0));
      return { frameX, frameY };
    },
    [imageZoomFactor, imageHeight, imageWidth]
  );

  const addVertex = React.useCallback(
    (newVertexHintPoint: NewVertexHintPoint) => {
      const vertices = polygons
        .at(newVertexHintPoint.polygonIndex)
        .getVertices();
      const verticesSize = vertices.size();
      const newVertex = new gd.Vector2f();
      newVertex.x = newVertexHintPoint.x;
      newVertex.y = newVertexHintPoint.y;
      vertices.push_back(newVertex);
      newVertex.delete();
      vertices.moveVector2fInVector(
        verticesSize,
        newVertexHintPoint.vertexIndex
      );
      const vertex = vertices.at(newVertexHintPoint.vertexIndex);
      setDraggedVertex({
        vertex,
        polygonIndex: newVertexHintPoint.polygonIndex,
        vertexIndex: newVertexHintPoint.vertexIndex,
      });
      setNewVertexHintPoint(null);
      onClickVertice(vertex.ptr);
      onPolygonsUpdated();
    },
    [onClickVertice, onPolygonsUpdated, polygons]
  );

  /**
   * @returns true if the vertex should be deleted.
   */
  const magnetizeDraggedVertexForDeletion = React.useCallback(
    (): boolean => {
      if (!draggedVertex) {
        return false;
      }
      const vertices = polygons.at(draggedVertex.polygonIndex).getVertices();
      const vertexDistanceMax = 10 / imageZoomFactor;
      const edgeDistanceMax = 5 / imageZoomFactor;
      const magnetedPoint = getMagnetizedVertexForDeletion(
        vertices,
        draggedVertex.vertexIndex,
        vertexDistanceMax,
        edgeDistanceMax
      );
      if (magnetedPoint) {
        draggedVertex.vertex.set_x(magnetedPoint[0]);
        draggedVertex.vertex.set_y(magnetedPoint[1]);
        return true;
      }
      return false;
    },
    [draggedVertex, imageZoomFactor, polygons]
  );

  const onEndDragVertex = React.useCallback(
    () => {
      if (draggedVertex) {
        if (magnetizeDraggedVertexForDeletion()) {
          const vertices = polygons
            .at(draggedVertex.polygonIndex)
            .getVertices();
          gd.removeFromVectorVector2f(vertices, draggedVertex.vertexIndex);
          onPolygonsUpdated();
          onClickVertice(null);
        } else {
          roundVertexToHalfPixel(draggedVertex.vertex);
          onPolygonsUpdated();
          onClickVertice(draggedVertex.vertex.ptr);
        }
      }
      setDraggedVertex(null);
    },
    [
      polygons,
      draggedVertex,
      onPolygonsUpdated,
      onClickVertice,
      magnetizeDraggedVertexForDeletion,
    ]
  );

  const onPointerDown = React.useCallback(
    (event: any) => {
      const cursorOnFrame = getCursorOnFrame(event);
      if (!cursorOnFrame) {
        return;
      }
      // Confine vertices to inside the sprite frame
      const cursorIntoFrame = confinePointIntoFrame(
        cursorOnFrame[0],
        cursorOnFrame[1]
      );
      const cursorX = cursorIntoFrame.frameX / imageZoomFactor;
      const cursorY = cursorIntoFrame.frameY / imageZoomFactor;

      const vertexDistanceMin = 20 / imageZoomFactor;
      const edgeDistanceMax = 10 / imageZoomFactor;

      const nearestEdgePoint = findNearestEdgePoint(
        polygons,
        cursorX,
        cursorY,
        vertexDistanceMin,
        edgeDistanceMax
      );
      if (nearestEdgePoint) {
        addVertex(nearestEdgePoint);
      }
    },
    [
      polygons,
      addVertex,
      confinePointIntoFrame,
      getCursorOnFrame,
      imageZoomFactor,
    ]
  );

  const forcedCursorStyle = forcedCursor
    ? {
        cursor: forcedCursor,
      }
    : {};

  const vertexCircleStyle = {
    cursor: 'move',
    ...forcedCursorStyle,
  };
  const polygonStyle = {
    ...forcedCursorStyle,
  };

  const renderBoundingBox = () => {
    return (
      <polygon
        style={forcedCursorStyle}
        fill="rgba(255,133,105,0.2)"
        stroke="rgba(255,133,105,0.5)"
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
              fill="rgba(255,133,105,0.2)"
              stroke="rgba(255,133,105,0.5)"
              strokeWidth={2}
              fillRule="evenodd"
              points={mapVector(
                vertices,
                (vertex, j) =>
                  `${vertex.get_x() * imageZoomFactor},${vertex.get_y() *
                    imageZoomFactor}`
              ).join(' ')}
              style={polygonStyle}
            />
          );
        })}
        {!hideControls &&
          mapVector(polygons, (polygon, polygonIndex) => {
            const vertices = polygon.getVertices();
            return mapVector(vertices, (vertex, vertexIndex) => (
              <circle
                onPointerDown={
                  deactivateControls
                    ? null
                    : () => onStartDragVertex(vertex, polygonIndex, vertexIndex)
                }
                {...dataObjectToProps({ draggable: 'true' })}
                key={`polygon-${polygonIndex}-vertex-${vertexIndex}`}
                fill={
                  vertex.ptr === props.highlightedVerticePtr
                    ? 'rgba(0,0,0,0.75)'
                    : vertex.ptr === props.selectedVerticePtr
                    ? 'rgba(107,175,255,0.75)'
                    : 'rgba(255,133,105,0.75)'
                }
                stroke={
                  vertex.ptr === props.highlightedVerticePtr
                    ? 'white'
                    : undefined
                }
                strokeWidth={2}
                cx={vertex.get_x() * imageZoomFactor}
                cy={vertex.get_y() * imageZoomFactor}
                r={7}
                style={vertexCircleStyle}
              />
            ));
          })}
        {!hideControls && newVertexHintPoint && (
          <circle
            onPointerDown={
              deactivateControls ? null : () => addVertex(newVertexHintPoint)
            }
            key={`new-vertex`}
            fill={'rgba(0,0,0,0.75)'}
            stroke={'white'}
            strokeWidth={2}
            cx={newVertexHintPoint.x * imageZoomFactor}
            cy={newVertexHintPoint.y * imageZoomFactor}
            r={5}
            style={vertexCircleStyle}
          />
        )}
      </React.Fragment>
    );
  };

  const containerStyle = {
    position: 'relative',
    width: '100%',
    height: '100%',
    ...forcedCursorStyle,
  };

  const svgStyle = {
    position: 'absolute',
    top: imageOffsetTop || 0,
    left: imageOffsetLeft || 0,
    width: imageWidth * imageZoomFactor,
    height: imageHeight * imageZoomFactor,
    overflow: 'visible',
    ...forcedCursorStyle,
  };

  return (
    <div
      style={containerStyle}
      onPointerMove={deactivateControls ? null : onPointerMove}
      onPointerUp={deactivateControls ? null : onEndDragVertex}
      onPointerDown={deactivateControls ? null : onPointerDown}
    >
      <svg style={svgStyle} ref={svgRef}>
        {isDefaultBoundingBox && renderBoundingBox()}
        {!isDefaultBoundingBox && renderPolygons()}
      </svg>
    </div>
  );
};

export default CollisionMasksPreview;
