/**
 * Tests for Light Object
 */

/**
 * Utility function for adding light object for tests.
 * @param {gdjs.RuntimeScene} runtimeScene
 * @param {number} radius
 * @returns {gdjs.LightRuntimeObject}
 */
const addLightObject = (runtimeScene, radius) => {
  const lightObj = new gdjs.LightRuntimeObject(runtimeScene, {
    name: 'lightObject',
    type: 'Lighting::LightObject',
    variables: [],
    behaviors: [],
    effects: [],
    content: {
      radius: radius,
      color: '#b4b4b4',
      texture: '',
      debugMode: false,
    },
  });
  runtimeScene.addObject(lightObj);
  return lightObj;
};

/**
 * Utility function for adding light obstacle for tests.
 * @param {gdjs.RuntimeScene} runtimeScene
 * @param {number} width
 * @param {number} height
 * @returns {gdjs.RuntimeObject}
 */
const addLightObstacle = (runtimeScene, width, height) => {
  const obstacle = new gdjs.RuntimeObject(runtimeScene, {
    name: 'lightObstacle',
    type: '',
    behaviors: [
      {
        type: 'Lighting::LightObstacleBehavior',
      },
    ],
    effects: [],
  });
  obstacle.getWidth = function () {
    return width;
  };
  obstacle.getHeight = function () {
    return height;
  };
  runtimeScene.addObject(obstacle);
  return obstacle;
};

/**
 * Helper to compute the expected vertex and index buffers for a given
 * light and obstacle setup, using the same √2 scaling as the renderer.
 */
function computeExpectedBuffers(lightX, lightY, radius, obstacleX, obstacleY, obstacleWidth, obstacleHeight) {
  const centerX = lightX;
  const centerY = lightY;
  const halfSize = radius * Math.SQRT2; // self‑boundary square half‑size

  // Build the self‑boundary polygon (a square)
  const selfBoundary = gdjs.Polygon.createRectangle(2 * halfSize, 2 * halfSize);
  selfBoundary.setPosition(centerX - halfSize, centerY - halfSize);

  // Build the obstacle polygon (a rectangle)
  const obstaclePoly = gdjs.Polygon.createRectangle(obstacleWidth, obstacleHeight);
  obstaclePoly.setPosition(obstacleX - obstacleWidth / 2, obstacleY - obstacleHeight / 2);

  // List of polygons: self‑boundary first, then the obstacle
  const polygons = [selfBoundary, obstaclePoly];

  // Collect all unique vertices from both polygons
  const allVertices = [];
  const pushUnique = (v) => {
    const eps = 1e-6;
    for (let existing of allVertices) {
      if (Math.abs(existing[0] - v[0]) < eps && Math.abs(existing[1] - v[1]) < eps) {
        return; // already present
      }
    }
    allVertices.push([v[0], v[1]]);
  };

  for (let poly of polygons) {
    for (let v of poly.vertices) {
      pushUnique(v);
    }
  }

  // Compute the farthest distance from center to any vertex (for ray length)
  let maxDist = 0;
  for (let v of allVertices) {
    const dx = v[0] - centerX;
    const dy = v[1] - centerY;
    maxDist = Math.max(maxDist, Math.sqrt(dx * dx + dy * dy));
  }
  const boundingDiag = maxDist * 1.1; // safe margin

  // For each vertex angle, cast a ray and find the closest intersection
  const resultPoints = [];
  const angleEpsilon = 0.0001; // same offset as in renderer

  for (let v of allVertices) {
    const dx = v[0] - centerX;
    const dy = v[1] - centerY;
    const angle = Math.atan2(dy, dx);
    // cast at angle, angle + epsilon, angle - epsilon
    for (let a of [angle, angle + angleEpsilon, angle - angleEpsilon]) {
      const targetX = centerX + boundingDiag * Math.cos(a);
      const targetY = centerY + boundingDiag * Math.sin(a);
      let closestDist = Infinity;
      let hitPoint = null;
      for (let poly of polygons) {
        const result = gdjs.Polygon.raycastTest(poly, centerX, centerY, targetX, targetY);
        if (result.collision && result.closeSqDist < closestDist) {
          closestDist = result.closeSqDist;
          hitPoint = [result.closeX, result.closeY];
        }
      }
      if (hitPoint) {
        // Avoid duplicates by angle (same as renderer's filter)
        let duplicate = false;
        for (let existing of resultPoints) {
          if (Math.abs(existing.angle - a) < 1e-6) {
            duplicate = true;
            break;
          }
        }
        if (!duplicate) {
          resultPoints.push({ vertex: hitPoint, angle: a });
        }
      }
    }
  }

  // Sort by angle (like renderer's comparator)
  resultPoints.sort((a, b) => a.angle - b.angle);

  // Filter out points with same angle (renderer does this)
  const filtered = [];
  if (resultPoints.length > 0) {
    filtered.push(resultPoints[0].vertex);
    for (let i = 1; i < resultPoints.length; i++) {
      if (Math.abs(resultPoints[i].angle - resultPoints[i-1].angle) > 1e-6) {
        filtered.push(resultPoints[i].vertex);
      }
    }
  }

  // Build vertex buffer: center + all filtered vertices
  const vertexList = [];
  vertexList.push(centerX, centerY);
  for (let v of filtered) {
    vertexList.push(v[0], v[1]);
  }
  const vertexBuffer = new Float32Array(vertexList);

  // Build index buffer: triangles (center, i, i+1)
  const n = filtered.length;
  const indexList = [];
  for (let i = 0; i < n; i++) {
    indexList.push(0, i+1, (i+1) % n + 1);
  }
  const indexBuffer = new Uint16Array(indexList);

  return { vertexBuffer, indexBuffer };
}

describe('gdjs.LightRuntimeObject', function () {
  PIXI.settings.FAIL_IF_MAJOR_PERFORMANCE_CAVEAT = false;
  const runtimeGame = gdjs.getPixiRuntimeGame();
  const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
  runtimeScene.loadFromScene({
    sceneData: {
      layers: [{ name: '', visibility: true, effects: [] }],
      variables: [],
      behaviorsSharedData: [],
      objects: [],
      instances: [],
    },
    usedExtensionsWithVariablesData: [],
  });
  const lightObj = addLightObject(runtimeScene, 100);
  lightObj.setPosition(200, 200);

  it('check object properties', function () {
    expect(lightObj.getRadius()).to.be(100);
    expect(lightObj.getColor()).to.eql('180;180;180');
    expect(lightObj.getDebugMode()).to.be(false);
    expect(lightObj.getDrawableX()).to.be(100);
    expect(lightObj.getDrawableY()).to.be(100);
  });

  it('bail out early while raycasting when there is no light obstacle', function () {
    expect(lightObj._renderer._computeLightVertices()).to.eql([]);
    lightObj._renderer._updateBuffers();
    // Now the fallback quad uses radius * √2
    const expected = new Float32Array([
      200 - 100 * Math.SQRT2, 200 + 100 * Math.SQRT2,
      200 + 100 * Math.SQRT2, 200 + 100 * Math.SQRT2,
      200 + 100 * Math.SQRT2, 200 - 100 * Math.SQRT2,
      200 - 100 * Math.SQRT2, 200 - 100 * Math.SQRT2,
    ]);
    const actual = lightObj._renderer._defaultVertexBuffer;
    for (let i = 0; i < expected.length; i++) {
      expect(actual[i]).to.be.closeTo(expected[i], 1e-6);
    }
    expect(gdjs.LightRuntimeObjectPixiRenderer._defaultIndexBuffer).to.eql(
      new Uint16Array([0, 1, 2, 0, 2, 3])
    );
  });
});

describe('Light with obstacles around it', function () {
  PIXI.settings.FAIL_IF_MAJOR_PERFORMANCE_CAVEAT = false;
  const runtimeGame = gdjs.getPixiRuntimeGame();
  const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
  runtimeScene.loadFromScene({
    sceneData: {
      layers: [{ name: '', visibility: true, effects: [] }],
      variables: [],
      behaviorsSharedData: [],
      objects: [],
      instances: [],
    },
    usedExtensionsWithVariablesData: [],
  });
  runtimeScene._timeManager.getElapsedTime = function () {
    return (1 / 60) * 1000;
  };
  const light = addLightObject(runtimeScene, 100);
  const obstacle = addLightObstacle(runtimeScene, 50, 50);

  it('Vertex and index buffers when light obstacle is present.', function () {
    light.setPosition(200, 200);
    obstacle.setPosition(250, 250);

    runtimeScene.renderAndStep(1000 / 60);
    light.update();

    // Compute expected buffers using the same √2 scaling
    const expected = computeExpectedBuffers(200, 200, 100, 250, 250, 50, 50);
    const vertexBuffer = light._renderer._vertexBuffer;
    const indexBuffer = light._renderer._indexBuffer;

    // Check lengths
    expect(vertexBuffer.length).to.eql(expected.vertexBuffer.length);
    expect(indexBuffer.length).to.eql(expected.indexBuffer.length);

    // Check values with tolerance
    for (let i = 0; i < expected.vertexBuffer.length; i++) {
      expect(vertexBuffer[i]).to.be.closeTo(expected.vertexBuffer[i], 1e-4);
    }
    for (let i = 0; i < expected.indexBuffer.length; i++) {
      expect(indexBuffer[i]).to.eql(expected.indexBuffer[i]); // indices are exact integers
    }
  });

  it('Vertex and index buffers after obstacle is moved.', function () {
    obstacle.setPosition(150, 250);
    runtimeScene.renderAndStep(1000 / 60);
    light.update();

    const expected = computeExpectedBuffers(200, 200, 100, 150, 250, 50, 50);
    const vertexBuffer = light._renderer._vertexBuffer;
    const indexBuffer = light._renderer._indexBuffer;

    expect(vertexBuffer.length).to.eql(expected.vertexBuffer.length);
    expect(indexBuffer.length).to.eql(expected.indexBuffer.length);

    for (let i = 0; i < expected.vertexBuffer.length; i++) {
      expect(vertexBuffer[i]).to.be.closeTo(expected.vertexBuffer[i], 1e-4);
    }
    for (let i = 0; i < expected.indexBuffer.length; i++) {
      expect(indexBuffer[i]).to.eql(expected.indexBuffer[i]);
    }
  });

  it("Obstacle moved outside light's radius.", function () {
    obstacle.setPosition(400, 400);
    runtimeScene.renderAndStep(1000 / 60);
    light.update();
    // Ensure the fallback to simple quads. There shouldn't be anymore calculations
    // when the obstacle is not inside light's area.
    expect(light._renderer._computeLightVertices().length).to.eql(0);

    const vertexBuffer = light._renderer._defaultVertexBuffer;
    const indexBuffer = gdjs.LightRuntimeObjectPixiRenderer._defaultIndexBuffer;
    // Fallback quad uses √2 scaling
    const expectedVertex = new Float32Array([
      200 - 100 * Math.SQRT2, 200 + 100 * Math.SQRT2,
      200 + 100 * Math.SQRT2, 200 + 100 * Math.SQRT2,
      200 + 100 * Math.SQRT2, 200 - 100 * Math.SQRT2,
      200 - 100 * Math.SQRT2, 200 - 100 * Math.SQRT2,
    ]);
    const expectedIndex = new Uint16Array([0, 1, 2, 0, 2, 3]);

    for (let i = 0; i < expectedVertex.length; i++) {
      expect(vertexBuffer[i]).to.be.closeTo(expectedVertex[i], 1e-6);
    }
    expect(indexBuffer).to.eql(expectedIndex);
  });
});