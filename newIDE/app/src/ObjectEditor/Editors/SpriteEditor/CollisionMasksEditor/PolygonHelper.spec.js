// @flow
import { addVertexOnLongestEdge } from './PolygonHelper';
import {
  findNearestEdgePoint,
  getMagnetizedVertexForDeletion,
} from './PolygonHelper';

const gd: libGDevelop = global.gd;

describe('PolygonHelper', () => {
  const addVertex = (vertices: gdVectorVector2f, x: number, y: number) => {
    const newVertex = new gd.Vector2f();
    newVertex.x = x;
    newVertex.y = y;
    vertices.push_back(newVertex);
    newVertex.delete();
  };

  describe('addVertexOnLongestEdge', () => {
    it('can add a vertex in an empty shape', () => {
      const vertices = new gd.VectorVector2f();
      addVertexOnLongestEdge(vertices);

      expect(vertices.size()).toBe(1);
      vertices.delete();
    });

    it('can add a vertex to each edge of a square', () => {
      const vertices = new gd.VectorVector2f();
      addVertex(vertices, 0, 0);
      addVertex(vertices, 32, 0);
      addVertex(vertices, 32, 32);
      addVertex(vertices, 0, 32);

      addVertexOnLongestEdge(vertices);
      addVertexOnLongestEdge(vertices);
      addVertexOnLongestEdge(vertices);
      addVertexOnLongestEdge(vertices);

      expect(vertices.size()).toBe(8);

      expect(vertices.at(0).x).toBe(0);
      expect(vertices.at(0).y).toBe(16);

      expect(vertices.at(1).x).toBe(0);
      expect(vertices.at(1).y).toBe(0);

      expect(vertices.at(2).x).toBe(16);
      expect(vertices.at(2).y).toBe(0);

      expect(vertices.at(3).x).toBe(32);
      expect(vertices.at(3).y).toBe(0);

      expect(vertices.at(4).x).toBe(32);
      expect(vertices.at(4).y).toBe(16);

      expect(vertices.at(5).x).toBe(32);
      expect(vertices.at(5).y).toBe(32);

      expect(vertices.at(6).x).toBe(16);
      expect(vertices.at(6).y).toBe(32);

      expect(vertices.at(7).x).toBe(0);
      expect(vertices.at(7).y).toBe(32);
      vertices.delete();
    });
  });

  describe('findNearestEdgePoint', () => {
    const addVertex = (vertices: gdVectorVector2f, x: number, y: number) => {
      const newVertex = new gd.Vector2f();
      newVertex.x = x;
      newVertex.y = y;
      vertices.push_back(newVertex);
      newVertex.delete();
    };

    it('can find the nearest edge of a triangle', () => {
      const polygons = new gd.VectorPolygon2d();
      const polygon = new gd.Polygon2d();
      const vertices = polygon.getVertices();
      addVertex(vertices, 0, 50);
      addVertex(vertices, 100, 200);
      addVertex(vertices, 0, 200);
      polygons.push_back(polygon);

      const vertexDistanceMin = 20;
      const edgeDistanceMax = 40;
      expect(
        findNearestEdgePoint(
          polygons,
          40,
          230,
          vertexDistanceMin,
          edgeDistanceMax
        )
      ).toStrictEqual({ x: 40, y: 200, polygonIndex: 0, vertexIndex: 2 });
      // The point is too far from the edge.
      expect(
        findNearestEdgePoint(
          polygons,
          40,
          250,
          vertexDistanceMin,
          edgeDistanceMax
        )
      ).toBe(null);
      // The point is too close to a vertex.
      expect(
        findNearestEdgePoint(
          polygons,
          10,
          230,
          vertexDistanceMin,
          edgeDistanceMax
        )
      ).toBe(null);

      polygon.delete();
      polygons.delete();
    });
  });

  describe('getMagnetVertexForDeletion', () => {
    const addVertex = (vertices: gdVectorVector2f, x: number, y: number) => {
      const newVertex = new gd.Vector2f();
      newVertex.x = x;
      newVertex.y = y;
      vertices.push_back(newVertex);
      newVertex.delete();
    };

    it('can magnet the dragged vertex on a straight line', () => {
      const vertices = new gd.VectorVector2f();
      addVertex(vertices, 0, 0);
      addVertex(vertices, 0, 100);
      addVertex(vertices, 52, 52);
      addVertex(vertices, 100, 0);

      const vertexDistanceMax = 10;
      const edgeDistanceMax = 5;
      expect(
        getMagnetizedVertexForDeletion(
          vertices,
          2,
          vertexDistanceMax,
          edgeDistanceMax
        )
      ).toStrictEqual([50, 50]);

      vertices.delete();
    });

    it('can magnet the dragged vertex on a neighbor vertex', () => {
      const vertices = new gd.VectorVector2f();
      addVertex(vertices, 0, 0);
      addVertex(vertices, 0, 100);
      addVertex(vertices, 98, 3);
      addVertex(vertices, 100, 0);

      const vertexDistanceMax = 10;
      const edgeDistanceMax = 5;
      expect(
        getMagnetizedVertexForDeletion(
          vertices,
          2,
          vertexDistanceMax,
          edgeDistanceMax
        )
      ).toStrictEqual([100, 0]);

      vertices.delete();
    });

    it('can keep the dragged vertex in place', () => {
      const vertices = new gd.VectorVector2f();
      addVertex(vertices, 0, 0);
      addVertex(vertices, 0, 100);
      addVertex(vertices, 60, 60);
      addVertex(vertices, 100, 0);

      const vertexDistanceMax = 10;
      const edgeDistanceMax = 5;
      expect(
        getMagnetizedVertexForDeletion(
          vertices,
          2,
          vertexDistanceMax,
          edgeDistanceMax
        )
      ).toBe(null);

      vertices.delete();
    });
  });
});
