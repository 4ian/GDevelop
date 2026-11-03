// @ts-check
describe('gdjs.NavMeshObstaclesManager Benchmark', function () {
  const characterBehaviorName = 'NavMeshCharacter';
  // Like the expanded 3D starters: a large terrain with small cells.
  const levelSize = 4096;
  const heightFieldSize = 257;
  const movingBoxesCount = 10;

  before(async function () {
    this.timeout(30000);
    await gdjs.getAllAsynchronouslyLoadingLibraryPromise();
  });

  const createScene = () => {
    const runtimeScene = new gdjs.RuntimeScene(gdjs.getPixiRuntimeGame());
    runtimeScene.loadFromScene({
      sceneData: {
        layers: [
          {
            name: '',
            visibility: true,
            effects: [],
            cameras: [],
            ambientLightColorR: 0,
            ambientLightColorG: 0,
            ambientLightColorB: 0,
            isLightingLayer: false,
            followBaseLayerCamera: true,
          },
        ],
        variables: [],
        r: 0,
        v: 0,
        b: 0,
        renderer3DWorldScale: 100,
        mangledName: 'Scene1',
        name: 'Scene1',
        stopSoundsOnStartup: false,
        title: '',
        behaviorsSharedData: [],
        objects: [],
        objectsGroups: [],
        instances: [],
        usedResources: [],
        uiSettings: {
          grid: false,
          gridType: 'rectangular',
          gridWidth: 10,
          gridHeight: 10,
          gridDepth: 10,
          gridOffsetX: 0,
          gridOffsetY: 0,
          gridOffsetZ: 0,
          gridColor: 0,
          gridAlpha: 1,
          snap: false,
        },
      },
      usedExtensionsWithVariablesData: [],
    });
    const characterSharedData = {
      name: characterBehaviorName,
      type: 'NavMeshPathfinding::NavMeshCharacterBehavior',
      cellSize: 5,
      cellDepth: 2,
      slopeMaxAngle: 40,
      stairHeightMax: 20,
      walkableRadius: -1,
      walkableDepth: 150,
      speedScaleY: 1,
    };
    runtimeScene.setInitialSharedDataForBehavior(
      characterBehaviorName,
      characterSharedData
    );
    return runtimeScene;
  };

  /**
   * @param {gdjs.RuntimeScene} runtimeScene
   * @param {string} name
   * @param {Array<any>} behaviors
   */
  const addCube = (runtimeScene, name, behaviors) => {
    const object = new gdjs.Cube3DRuntimeObject(runtimeScene, {
      name,
      type: 'Scene3D::Cube3DObject',
      effects: [],
      variables: [],
      behaviors,
      // @ts-ignore - the content is not fully typed.
      content: { width: 100, height: 100, depth: 100 },
    });
    runtimeScene.addObject(object);
    return object;
  };

  /**
   * @param {gdjs.RuntimeScene} runtimeScene
   * @param {boolean} obstacleOnly
   */
  const addObstacle = (runtimeScene, obstacleOnly) =>
    addCube(runtimeScene, 'Obstacle', [
      {
        type: 'NavMeshPathfinding::NavMeshObstacleBehavior',
        name: 'NavMeshObstacle',
        shape: 'Box',
        meshShapeResourceName: '',
        obstacleOnly,
      },
    ]);

  /** @param {gdjs.RuntimeScene} runtimeScene */
  const addCharacter = (runtimeScene) =>
    addCube(runtimeScene, 'Character', [
      {
        type: 'NavMeshPathfinding::NavMeshCharacterBehavior',
        name: characterBehaviorName,
        acceleration: 400,
        maxSpeed: 200,
        angularMaxSpeed: 180,
        rotateObject: false,
        angleOffset: 0,
        radius: 20,
        avoidanceSightRange: 120,
      },
    ]);

  /** @param {gdjs.RuntimeScene} runtimeScene */
  const addTerrain = (runtimeScene) => {
    const terrain = addObstacle(runtimeScene, false);
    terrain.setPosition(0, 0);
    terrain.setWidth(levelSize);
    terrain.setHeight(levelSize);
    terrain.setZ(-100);
    terrain.setDepth(200);
    const heights = new Float32Array(heightFieldSize * heightFieldSize);
    for (let row = 0; row < heightFieldSize; row++) {
      for (let column = 0; column < heightFieldSize; column++) {
        const x = column / (heightFieldSize - 1);
        const y = row / (heightFieldSize - 1);
        heights[row * heightFieldSize + column] =
          0.5 + 0.2 * Math.sin(x * 9) * Math.cos(y * 7);
      }
    }
    terrain.setSurface({
      getVersion: () => 1,
      getChangedArea: () => null,
      getTriangles: () => null,
      getHeightField: () => ({
        columns: heightFieldSize,
        rows: heightFieldSize,
        heights,
      }),
    });
  };

  /**
   * @param {gdjs.RuntimeScene} runtimeScene
   * @param {gdjs.RuntimeObject} character
   * @param {number} index
   */
  const moveCharacterAcrossLevel = (runtimeScene, character, index) => {
    const behavior = /** @type {gdjs.NavMeshCharacterRuntimeBehavior} */ (
      character.getBehavior(characterBehaviorName)
    );
    behavior.moveTo(
      index % 2 ? 300 : levelSize - 300,
      levelSize / 2 + (index - 2) * 200,
      0
    );
  };

  it('benchmark the first build of a large navigation mesh', function () {
    this.timeout(120000);
    const samplesMs = [];
    for (let round = 0; round < 3; round++) {
      const runtimeScene = createScene();
      addTerrain(runtimeScene);
      const character = addCharacter(runtimeScene);
      character.setPosition(300, levelSize / 2);
      // The navigation mesh is not built at the first frame.
      runtimeScene.renderAndStep(1000 / 60);
      const start = performance.now();
      moveCharacterAcrossLevel(runtimeScene, character, 0);
      runtimeScene.renderAndStep(1000 / 60);
      samplesMs.push(performance.now() - start);
      runtimeScene.unloadScene();
    }
    reportBenchmarkResult({
      name: `NavMesh: first build of a ${levelSize}x${levelSize} terrain`,
      samplesMs,
    });
    console.log(
      'NavMesh first build (ms): ' +
        samplesMs.map((sample) => sample.toFixed(1)).join(', ')
    );
  });

  it('benchmark boxes moving on a large terrain', function () {
    this.timeout(120000);
    const runtimeScene = createScene();
    addTerrain(runtimeScene);
    const random = makeSeededRandom(1);
    const boxes = [];
    for (let index = 0; index < movingBoxesCount; index++) {
      const box = addObstacle(runtimeScene, true);
      box.setPosition(
        500 + random() * (levelSize - 1000),
        500 + random() * (levelSize - 1000)
      );
      box.setZ(100);
      boxes.push({ box, x: box.getX(), y: box.getY() });
    }
    const characters = [];
    for (let index = 0; index < 4; index++) {
      const character = addCharacter(runtimeScene);
      character.setPosition(
        index % 2 ? levelSize - 300 : 300,
        levelSize / 2 + (index - 2) * 200
      );
      characters.push(character);
    }
    // Let the navigation mesh be built.
    for (let frame = 0; frame < 300; frame++) {
      runtimeScene.renderAndStep(1000 / 60);
    }
    characters.forEach((character, index) =>
      moveCharacterAcrossLevel(runtimeScene, character, index)
    );

    const samplesMs = [];
    for (let frame = 0; frame < 600; frame++) {
      // The boxes move on circles, at 100 pixels per second.
      for (const { box, x, y } of boxes) {
        const angle = (frame / 60) * (100 / 150);
        box.setPosition(
          x + 150 * Math.cos(angle) - 150,
          y + 150 * Math.sin(angle)
        );
        box.setAngle(gdjs.toDegrees(angle));
      }
      const start = performance.now();
      runtimeScene.renderAndStep(1000 / 60);
      samplesMs.push(performance.now() - start);
    }
    runtimeScene.unloadScene();
    reportBenchmarkResult({
      name: `NavMesh: ${movingBoxesCount} boxes moving on a ${levelSize}x${levelSize} terrain (frame)`,
      samplesMs,
    });
    const sortedSamplesMs = samplesMs.slice().sort((a, b) => a - b);
    console.log(
      `NavMesh with ${movingBoxesCount} moving boxes, frame time (ms): ` +
        `median ${sortedSamplesMs[300].toFixed(2)}, ` +
        `99th percentile ${sortedSamplesMs[594].toFixed(2)}, ` +
        `max ${sortedSamplesMs[599].toFixed(2)}, ` +
        `total ${samplesMs.reduce((sum, sample) => sum + sample, 0).toFixed(0)}`
    );
  });
});
