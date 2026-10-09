// @ts-check

describe('gdjs.Polygon.collisionTest', function () {
  /**
   * The previous implementation of `gdjs.Polygon.collisionTest`, computing
   * all the edges of both polygons before testing them.
   * @param {gdjs.Polygon} p1
   * @param {gdjs.Polygon} p2
   * @param {boolean} ignoreTouchingEdges
   */
  const collisionTestComputingAllEdges = (p1, p2, ignoreTouchingEdges) => {
    p1.computeEdges();
    p2.computeEdges();
    /** @type {FloatPoint} */
    const moveAxis = [0, 0];
    let minDist = Number.MAX_VALUE;
    for (let i = 0; i < p1.vertices.length + p2.vertices.length; i++) {
      const edge =
        i < p1.vertices.length ? p1.edges[i] : p2.edges[i - p1.vertices.length];
      /** @type {FloatPoint} */
      const axis = [-edge[1], edge[0]];
      gdjs.Polygon.normalise(axis);
      /** @type {FloatPoint} */
      const minMaxA = [0, 0];
      /** @type {FloatPoint} */
      const minMaxB = [0, 0];
      gdjs.Polygon.project(axis, p1, minMaxA);
      gdjs.Polygon.project(axis, p2, minMaxB);
      const dist = gdjs.Polygon.distance(
        minMaxA[0],
        minMaxA[1],
        minMaxB[0],
        minMaxB[1]
      );
      if (dist > 0 || (dist === 0 && ignoreTouchingEdges)) {
        return { collision: false, move_axis: [0, 0] };
      }
      if (Math.abs(dist) < minDist) {
        minDist = Math.abs(dist);
        moveAxis[0] = axis[0];
        moveAxis[1] = axis[1];
      }
    }
    const p1Center = p1.computeCenter();
    const p2Center = p2.computeCenter();
    if (
      gdjs.Polygon.dotProduct(
        [p1Center[0] - p2Center[0], p1Center[1] - p2Center[1]],
        moveAxis
      ) < 0
    ) {
      moveAxis[0] = -moveAxis[0];
      moveAxis[1] = -moveAxis[1];
    }
    return {
      collision: true,
      move_axis: [moveAxis[0] * minDist, moveAxis[1] * minDist],
    };
  };

  /** @param {number} seed */
  const makeSeededRandom = (seed) => {
    let state = seed >>> 0;
    return () => {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  /**
   * A rectangle, triangle or hexagon, sometimes rotated, positioned on a
   * grid (so that some polygons exactly touch) or anywhere.
   * @param {() => number} random
   */
  const createPolygon = (random) => {
    const polygon = new gdjs.Polygon();
    const verticesCount = [3, 4, 4, 6][Math.floor(random() * 4)];
    const size = random() < 0.5 ? 16 : 1 + random() * 50;
    for (let i = 0; i < verticesCount; i++) {
      const angle = (2 * Math.PI * i) / verticesCount + Math.PI / 4;
      polygon.vertices.push([size * Math.cos(angle), size * Math.sin(angle)]);
    }
    if (random() < 0.5) polygon.rotate(random() * 2 * Math.PI);
    if (random() < 0.5) {
      polygon.move(
        16 * Math.floor(random() * 6),
        16 * Math.floor(random() * 6)
      );
    } else {
      polygon.move(random() * 100, random() * 100);
    }
    return polygon;
  };

  it('gives exactly the same results as computing all the edges first', function () {
    const random = makeSeededRandom(1);
    let collisionsCount = 0;
    for (let i = 0; i < 5000; i++) {
      const polygon1 = createPolygon(random);
      const polygon2 = createPolygon(random);
      for (const ignoreTouchingEdges of [false, true]) {
        const result = gdjs.Polygon.collisionTest(
          polygon1,
          polygon2,
          ignoreTouchingEdges
        );
        const expectedResult = collisionTestComputingAllEdges(
          polygon1,
          polygon2,
          ignoreTouchingEdges
        );
        expect(result.collision).to.be(expectedResult.collision);
        // Exactly the same numbers (`to.be` uses ===).
        expect(result.move_axis[0]).to.be(expectedResult.move_axis[0]);
        expect(result.move_axis[1]).to.be(expectedResult.move_axis[1]);
        if (result.collision) collisionsCount++;
      }
    }
    // Ensure many polygons collide.
    expect(collisionsCount).to.be.greaterThan(1000);
  });
});
