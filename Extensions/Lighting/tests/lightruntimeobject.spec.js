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

describe('gdjs.LightRuntimeObject', function () {
  PIXI.settings.FAIL_IF_MAJOR_PERFORMANCE_CAVEAT = false;
  const runtimeGame = gdjs.getPixiRuntimeGame();
  const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
  runtimeScene.loadFromScene({
    layers: [{ name: '', visibility: true, effects: [] }],
    variables: [],
    behaviorsSharedData: [],
    objects: [],
    instances: [],
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
    expect(lightObj._renderer._defaultVertexBuffer).to.eql(
      new Float32Array([100, 300, 300, 300, 300, 100, 100, 100])
    );
    expect(gdjs.LightRuntimeObjectPixiRenderer._defaultIndexBuffer).to.eql(
      new Float32Array([0, 1, 2, 0, 2, 3])
    );
  });
});

describe('Light with obstacles around it', function () {
  PIXI.settings.FAIL_IF_MAJOR_PERFORMANCE_CAVEAT = false;
  const runtimeGame = gdjs.getPixiRuntimeGame();
  const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
  runtimeScene.loadFromScene({
    layers: [{ name: '', visibility: true, effects: [] }],
    variables: [],
    behaviorsSharedData: [],
    objects: [],
    instances: [],
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

    const vertexBuffer = light._renderer._vertexBuffer;
    const indexBuffer = light._renderer._indexBuffer;
    // prettier-ignore
    const expectedVertexBuffer = [
      200, 200, 100, 100.0199966430664, 100, 100, 100.0199966430664, 100, 299.9800109863281,
      100, 300, 100, 300, 100.0199966430664, 300, 249.9875030517578, 300, 250, 299.9750061035156,
      250, 250.00999450683594, 250, 250, 250, 250,250.00999450683594, 250, 299.9750061035156, 250,
      300, 249.9875030517578, 300, 100.0199966430664, 300, 100, 300, 100, 299.9800109863281,
    ];
    // prettier-ignore
    const expectedIndexBuffer = [
      0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 5, 0, 5, 6,
      0, 6, 7, 0, 7, 8, 0, 8, 9, 0, 9, 10, 0, 10, 11,
      0, 11, 12, 0, 12, 13, 0, 13, 14, 0, 14, 15, 0,
      15, 16, 0, 16, 17, 0, 17, 18, 0, 18, 1,
    ];

    expectedVertexBuffer.forEach((val, index) => {
      expect(vertexBuffer[index]).to.be(val);
    });
    expectedIndexBuffer.forEach((val, index) => {
      expect(indexBuffer[index]).to.be(val);
    });
  });

  it('Vertex and index buffers after obstacle is moved.', function () {
    obstacle.setPosition(150, 250);
    runtimeScene.renderAndStep(1000 / 60);
    light.update();

    const vertexBuffer = light._renderer._vertexBuffer;
    const indexBuffer = light._renderer._indexBuffer;
    // prettier-ignore
    const expectedVertexBuffer = [
      200, 200, 100, 100.0199966430664, 100, 100, 100.0199966430664, 100, 299.9800109863281,
      100, 300, 100, 300, 100.0199966430664, 300, 299.9800109863281, 300, 300, 299.9800109863281,
      300, 200.00999450683594, 300, 200, 250, 199.9949951171875, 250, 175.00625610351562, 250,
      175, 250, 174.99374389648438, 250, 150.00999450683594, 250, 150, 250, 100, 299.9800109863281,
    ];
    // prettier-ignore
    const expectedIndexBuffer = [
      0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 5, 0, 5, 6, 0,
      6, 7, 0, 7, 8, 0, 8, 9, 0, 9, 10, 0, 10, 11, 0,
      11, 12, 0, 12, 13, 0, 13, 14, 0, 14, 15, 0, 15,
      16, 0, 16, 17, 0, 17, 18, 0, 18, 1,
    ];

    expectedVertexBuffer.forEach((val, index) => {
      expect(vertexBuffer[index]).to.be(val);
    });
    expectedIndexBuffer.forEach((val, index) => {
      expect(indexBuffer[index]).to.be(val);
    });
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
    const vertexData = [100, 300, 300, 300, 300, 100, 100, 100];
    const indexData = [0, 1, 2, 0, 2, 3];

    vertexData.forEach((val, index) => {
      expect(vertexBuffer[index]).to.be(val);
    });
    indexData.forEach((val, index) => {
      expect(indexBuffer[index]).to.be(val);
    });
  });
});
