// @flow
import * as React from 'react';
import { mapVector } from '../../../../Utils/MapFor';
import useForceUpdate from '../../../../Utils/UseForceUpdate';

const gd = global.gd;

const styles = {
  vertexCircle: {
    cursor: 'move',
  },
};

/**
 * Modulo operation
 * @param x Dividend value.
 * @param y Divisor value.
 * @returns Return the remainder using Euclidean division.
 */
const mod = function(x: number, y: number): number {
  return ((x % y) + y) % y;
};

const getSquaredDistance = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number => {
  const deltaX = x1 - x2;
  const deltaY = y1 - y2;
  return deltaX * deltaX + deltaY * deltaY;
};

/**
 * @param x point x
 * @param y point y
 * @param x1 segment extremity x
 * @param y1 segment extremity y
 * @param x2 segment extremity x
 * @param y2 segment extremity y
 * @return the point projected on the line
 */
const projectToSegment = (
  x: number,
  y: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  result: [number, number] = [0, 0]
): [number, number] => {
  const length2 = getSquaredDistance(x1, y1, x2, y2);
  if (length2 === 0) return [x1, y1];
  const t = Math.max(
    0,
    Math.min(1, ((x - x1) * (x2 - x1) + (y - y1) * (y2 - y1)) / length2)
  );
  result[0] = x1 + t * (x2 - x1);
  result[1] = y1 + t * (y2 - y1);
  return result;
};

type NewVertexHintPoint = {|
  x: number,
  y: number,
  polygonIndex: number,
  vertexIndex: number,
|};

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
    offsetTop,
    offsetLeft,
    isDefaultBoundingBox,
  } = props;

  const forceUpdate = useForceUpdate();

  const onStartDragVertex = (
    vertex: gdVector2f,
    polygonIndex: number,
    vertexIndex: number
  ) => {
    if (draggedVertex) return;
    setDraggedVertex({ vertex, polygonIndex, vertexIndex });
  };

  const onEndDragVertex = () => {
    if (draggedVertex) {
      if (magnetDraggedVertexForDeletion()) {
        const vertices = props.polygons
          .at(draggedVertex.polygonIndex)
          .getVertices();
        gd.removeFromVectorVector2f(vertices, draggedVertex.vertexIndex);
        props.onPolygonsUpdated();
        props.onClickVertice(null);
      } else {
        props.onPolygonsUpdated();
        props.onClickVertice(draggedVertex.vertex.ptr);
      }
    }
    setDraggedVertex(null);
  };

  const getCursorOnFrame = (event: any) => {
    if (!svgRef.current) return;

    // $FlowExpectedError Flow doesn't have SVG typings yet (@facebook/flow#4551)
    const pointOnScreen = svgRef.current.createSVGPoint();
    pointOnScreen.x = event.clientX;
    pointOnScreen.y = event.clientY;
    // $FlowExpectedError Flow doesn't have SVG typings yet (@facebook/flow#4551)
    const screenToSvgMatrix = svgRef.current.getScreenCTM().inverse();
    const pointOnSvg = pointOnScreen.matrixTransform(screenToSvgMatrix);

    // Confine vertices to inside the sprite frame
    return confinePointToFrame(pointOnSvg.x, pointOnSvg.y);
  };

  const onPointerDown = (event: any) => {
    const cursorOnFrame = getCursorOnFrame(event);
    if (!cursorOnFrame) {
      return;
    }
    const cursorX = cursorOnFrame.frameX / imageZoomFactor;
    const cursorY = cursorOnFrame.frameY / imageZoomFactor;

    const vertexDistanceMin = 20 / imageZoomFactor;
    const edgeDistanceMax = 10 / imageZoomFactor;

    const nearestEdgePoint = findNearestEdgePoint(
      cursorX,
      cursorY,
      vertexDistanceMin,
      edgeDistanceMax
    );
    if (nearestEdgePoint) {
      addVertex(nearestEdgePoint);
    }
  };

  /**
   * Move a vertex with the mouse. A similar dragging implementation is done in
   * PointsPreview (but with div and img elements).
   *
   * TODO: This could be optimized by avoiding the forceUpdate (not sure if worth it though).
   */
  const onPointerMove = (event: any) => {
    const cursorOnFrame = getCursorOnFrame(event);
    if (!cursorOnFrame) {
      return;
    }
    const cursorX = cursorOnFrame.frameX / imageZoomFactor;
    const cursorY = cursorOnFrame.frameY / imageZoomFactor;

    if (draggedVertex) {
      draggedVertex.vertex.set_x(cursorX);
      draggedVertex.vertex.set_y(cursorY);

      magnetDraggedVertexForDeletion();

      forceUpdate();
    } else {
      const vertexDistanceMin = 20 / imageZoomFactor;
      const edgeDistanceMax = 40 / imageZoomFactor;

      setNewVertexHintPoint(
        findNearestEdgePoint(
          cursorX,
          cursorY,
          vertexDistanceMin,
          edgeDistanceMax
        )
      );
    }
  };

  const addVertex = (newVertexHintPoint: NewVertexHintPoint) => {
    const vertices = props.polygons
      .at(newVertexHintPoint.polygonIndex)
      .getVertices();
    const verticesSize = vertices.size();
    const newVertex = new gd.Vector2f();
    newVertex.x = newVertexHintPoint.x;
    newVertex.y = newVertexHintPoint.y;
    vertices.push_back(newVertex);
    newVertex.delete();
    vertices.moveVector2fInVector(verticesSize, newVertexHintPoint.vertexIndex);
    const vertex = vertices.at(newVertexHintPoint.vertexIndex);
    setDraggedVertex({
      vertex,
      polygonIndex: newVertexHintPoint.polygonIndex,
      vertexIndex: newVertexHintPoint.vertexIndex,
    });
    setNewVertexHintPoint(null);
    props.onClickVertice(vertex.ptr);
    props.onPolygonsUpdated();
  };

  /**
   * @returns true if the vertex should be deleted.
   */
  const magnetDraggedVertexForDeletion = (): boolean => {
    if (!draggedVertex) {
      return false;
    }
    const vertices = props.polygons
      .at(draggedVertex.polygonIndex)
      .getVertices();
    if (vertices.size() <= 3) {
      return false;
    }
    const previousVertex = vertices.at(
      mod(draggedVertex.vertexIndex - 1, vertices.size())
    );
    const nextVertex = vertices.at(
      mod(draggedVertex.vertexIndex + 1, vertices.size())
    );
    const x = draggedVertex.vertex.x;
    const y = draggedVertex.vertex.y;
    const previousX = previousVertex.x;
    const previousY = previousVertex.y;
    const nextX = nextVertex.x;
    const nextY = nextVertex.y;

    if (
      getSquaredDistance(x, y, previousX, previousY) <
      (10 * 10) / (imageZoomFactor * imageZoomFactor)
    ) {
      draggedVertex.vertex.set_x(previousX);
      draggedVertex.vertex.set_y(previousY);
      return true;
    }

    if (
      getSquaredDistance(x, y, nextX, nextY) <
      (10 * 10) / (imageZoomFactor * imageZoomFactor)
    ) {
      draggedVertex.vertex.set_x(nextX);
      draggedVertex.vertex.set_y(nextY);
      return true;
    }

    const projectedPoint = projectToSegment(
      x,
      y,
      previousVertex.x,
      previousVertex.y,
      nextVertex.x,
      nextVertex.y
    );

    if (
      getSquaredDistance(
        draggedVertex.vertex.x,
        draggedVertex.vertex.y,
        projectedPoint[0],
        projectedPoint[1]
      ) <
      (5 * 5) / (imageZoomFactor * imageZoomFactor)
    ) {
      draggedVertex.vertex.set_x(projectedPoint[0]);
      draggedVertex.vertex.set_y(projectedPoint[1]);
      return true;
    }

    return false;
  };

  const findNearestEdgePoint = (
    cursorX: number,
    cursorY: number,
    vertexDistanceMin: number,
    edgeDistanceMax: number
  ): NewVertexHintPoint | null => {
    const vertexSquaredDistanceMin = vertexDistanceMin * vertexDistanceMin;
    const edgeSquaredDistanceMax = edgeDistanceMax * edgeDistanceMax;

    let squaredDistanceMin = Number.POSITIVE_INFINITY;
    let foundPolygonIndex = 0;
    let foundEndVertexIndex = 0;
    let projectedPoint = [0, 0];
    mapVector(props.polygons, (polygon, polygonIndex) => {
      const vertices = polygon.getVertices();
      const previousVertex = vertices.at(vertices.size() - 1);
      let previousX = previousVertex.x;
      let previousY = previousVertex.y;
      mapVector(vertices, (vertex, vertexIndex) => {
        const vertexX = vertex.x;
        const vertexY = vertex.y;

        projectedPoint = projectToSegment(
          cursorX,
          cursorY,
          previousX,
          previousY,
          vertexX,
          vertexY,
          projectedPoint
        );

        const isFarEnoughFromAnotherVertex =
          getSquaredDistance(
            projectedPoint[0],
            projectedPoint[1],
            previousX,
            previousY
          ) > vertexSquaredDistanceMin &&
          getSquaredDistance(
            projectedPoint[0],
            projectedPoint[1],
            vertexX,
            vertexY
          ) > vertexSquaredDistanceMin;
        const squaredDistance = getSquaredDistance(
          cursorX,
          cursorY,
          projectedPoint[0],
          projectedPoint[1]
        );
        if (
          squaredDistance < squaredDistanceMin &&
          isFarEnoughFromAnotherVertex
        ) {
          squaredDistanceMin = squaredDistance;
          foundPolygonIndex = polygonIndex;
          foundEndVertexIndex = vertexIndex;
        }
        previousX = vertexX;
        previousY = vertexY;
      });
    });
    if (squaredDistanceMin < edgeSquaredDistanceMax) {
      const vertices = props.polygons.at(foundPolygonIndex).getVertices();
      const startVertex = vertices.at(
        mod(foundEndVertexIndex - 1, vertices.size())
      );
      const endVertex = vertices.at(foundEndVertexIndex);
      projectedPoint = projectToSegment(
        cursorX,
        cursorY,
        startVertex.x,
        startVertex.y,
        endVertex.x,
        endVertex.y,
        projectedPoint
      );
      return {
        x: projectedPoint[0],
        y: projectedPoint[1],
        polygonIndex: foundPolygonIndex,
        vertexIndex: foundEndVertexIndex,
      };
    }
    return null;
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
        {mapVector(polygons, (polygon, polygonIndex) => {
          const vertices = polygon.getVertices();
          return mapVector(vertices, (vertex, vertexIndex) => (
            <circle
              onPointerDown={() =>
                onStartDragVertex(vertex, polygonIndex, vertexIndex)
              }
              key={`polygon-${polygonIndex}-vertex-${vertexIndex}`}
              fill={
                vertex.ptr === props.highlightedVerticePtr
                  ? 'rgba(0,0,0,0.75)'
                  : vertex.ptr === props.selectedVerticePtr
                  ? 'rgba(0,255,255,0.75)'
                  : 'rgba(255,0,0,0.75)'
              }
              stroke={
                vertex.ptr === props.highlightedVerticePtr ? 'white' : undefined
              }
              strokeWidth={1}
              cx={vertex.get_x() * imageZoomFactor}
              cy={vertex.get_y() * imageZoomFactor}
              r={5}
              style={styles.vertexCircle}
            />
          ));
        })}
        {newVertexHintPoint && (
          <circle
            onPointerDown={() => addVertex(newVertexHintPoint)}
            key={`new-vertex`}
            fill={'rgba(0,0,0,0.75)'}
            stroke={'white'}
            strokeWidth={1}
            cx={newVertexHintPoint.x * imageZoomFactor}
            cy={newVertexHintPoint.y * imageZoomFactor}
            r={5}
            style={styles.vertexCircle}
          />
        )}
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
      onPointerDown={onPointerDown}
    >
      <svg style={svgStyle} ref={svgRef}>
        {isDefaultBoundingBox && renderBoundingBox()}
        {!isDefaultBoundingBox && renderPolygons()}
      </svg>
    </div>
  );
};

export default CollisionMasksPreview;
