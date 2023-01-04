// @flow
import { addVertexOnLongestEdge } from './PolygonHelper';

const gd: libGDevelop = global.gd;

describe('addVertexOnLongestEdge', () => {
  const addVertex = (vertices: gdVectorVector2f, x: number, y: number) => {
    const newVertex = new gd.Vector2f();
    newVertex.x = x;
    newVertex.y = y;
    vertices.push_back(newVertex);
    newVertex.delete();
  };

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
