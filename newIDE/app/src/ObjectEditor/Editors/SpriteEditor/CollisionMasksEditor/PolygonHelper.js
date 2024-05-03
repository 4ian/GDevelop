// @flow
import { mapFor, mapVector } from '../../../../Utils/MapFor';

const gd = global.gd;

export const roundVertexToHalfPixel = (vertex: gdVector2f) => {
  vertex.set_x(Math.round(vertex.get_x() * 2) / 2);
  vertex.set_y(Math.round(vertex.get_y() * 2) / 2);
};

export const addVertexOnLongestEdge = (vertices: gdVectorVector2f) => {
  const verticesSize = vertices.size();
  if (verticesSize > 0) {
    let longestEdgeEndVertex = 0;
    {
      const lastVertex = vertices.at(verticesSize - 1);
      let previousX = lastVertex.x;
      let previousY = lastVertex.y;
      let squaredDistanceMax = -1;
      mapFor(0, verticesSize, index => {
        const vertex = vertices.at(index);
        const x = vertex.x;
        const y = vertex.y;
        const deltaX = x - previousX;
        const deltaY = y - previousY;
        const squaredDistance = deltaX * deltaX + deltaY * deltaY;
        if (squaredDistance > squaredDistanceMax) {
          squaredDistanceMax = squaredDistance;
          longestEdgeEndVertex = index;
        }
        previousX = x;
        previousY = y;
      });
    }
    const startVertex = vertices.at(
      mod(longestEdgeEndVertex - 1, verticesSize)
    );
    const endVertex = vertices.at(longestEdgeEndVertex);
    const newVertex = new gd.Vector2f();
    newVertex.x = (startVertex.x + endVertex.x) / 2;
    newVertex.y = (startVertex.y + endVertex.y) / 2;
    vertices.push_back(newVertex);
    vertices.moveVector2fInVector(verticesSize, longestEdgeEndVertex);
    newVertex.delete();
  } else {
    const newVertex = new gd.Vector2f();
    vertices.push_back(newVertex);
    newVertex.delete();
  }
};

/**
 * Data needed to insert a new vertex in a polygon.
 */
export type NewVertexHintPoint = {|
  x: number,
  y: number,
  polygonIndex: number,
  vertexIndex: number,
|};

/**
 * @param polygons The collision mask polygons
 * @param cursorX The cursor position in the collision mask basis on x axis
 * @param cursorY The cursor position in the collision mask basis on y axis
 * @param vertexDistanceMin The distance from vertices under which no point
 * must be found to avoid to add a new point when grabbing an existing one.
 * @param edgeDistanceMax The distance from an edge above which no point must
 * be found.
 * @returns The position of the hint point to show to let users grab it and add
 * a new vertex to the polygon.
 */
export const findNearestEdgePoint = (
  polygons: gdVectorPolygon2d,
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
  mapVector(polygons, (polygon, polygonIndex) => {
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
    const vertices = polygons.at(foundPolygonIndex).getVertices();
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
 * @param vertices The polygon vertices
 * @param vertexIndex The index of the dragged vertex
 * @param vertexDistanceMax The distance under which the dragged vertex is
 * magneted to its neighbors
 * @param edgeDistanceMax The distance under which the dragged vertex is
 * magneted to the segment between its 2 neighbors
 * @returns The magnetized location for the vertex if it should be deleted.
 */
export const getMagnetizedVertexForDeletion = (
  vertices: gdVectorVector2f,
  vertexIndex: number,
  vertexDistanceMax: number,
  edgeDistanceMax: number
): [number, number] | null => {
  const vertexSquaredDistanceMax = vertexDistanceMax * vertexDistanceMax;
  const edgeSquaredDistanceMax = edgeDistanceMax * edgeDistanceMax;
  const draggedVertex = vertices.at(vertexIndex);
  if (vertices.size() <= 3) {
    return null;
  }
  const previousVertex = vertices.at(mod(vertexIndex - 1, vertices.size()));
  const nextVertex = vertices.at(mod(vertexIndex + 1, vertices.size()));
  const x = draggedVertex.x;
  const y = draggedVertex.y;
  const previousX = previousVertex.x;
  const previousY = previousVertex.y;
  const nextX = nextVertex.x;
  const nextY = nextVertex.y;

  if (
    getSquaredDistance(x, y, previousX, previousY) < vertexSquaredDistanceMax
  ) {
    return [previousX, previousY];
  }

  if (getSquaredDistance(x, y, nextX, nextY) < vertexSquaredDistanceMax) {
    return [nextX, nextY];
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
    getSquaredDistance(x, y, projectedPoint[0], projectedPoint[1]) <
    edgeSquaredDistanceMax
  ) {
    return projectedPoint;
  }

  return null;
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
