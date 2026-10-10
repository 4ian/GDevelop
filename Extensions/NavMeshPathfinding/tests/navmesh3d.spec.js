// @ts-check
describe('gdjs.NavMeshObstacleRuntimeBehavior (3D)', function () {
  const characterBehaviorName = 'NavMeshCharacter';

  before(async function () {
    // Give some time for the Recast navigation library (WASM) to be loaded.
    this.timeout(30000);
    await gdjs.getAllAsynchronouslyLoadingLibraryPromise();
  });

  const createScene = () => {
    const runtimeGame = gdjs.getPixiRuntimeGame();
    const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
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
      cellSize: 10,
      cellDepth: 10,
      slopeMaxAngle: 50,
      stairHeightMax: 20,
      walkableRadius: -1,
      walkableDepth: 150,
      speedScaleY: 1,
    };
    runtimeScene.setInitialSharedDataForBehavior(
      characterBehaviorName,
      characterSharedData
    );
    runtimeScene._timeManager.getElapsedTime = function () {
      return 1000 / 60;
    };
    return runtimeScene;
  };

  const addCube = (runtimeScene, name, behaviors) => {
    const object = new gdjs.Cube3DRuntimeObject(runtimeScene, {
      name,
      type: 'Scene3D::Cube3DObject',
      effects: [],
      variables: [],
      behaviors,
      // @ts-ignore - the content is not fully typed.
      content: { width: 20, height: 20, depth: 20 },
    });
    runtimeScene.addObject(object);
    return object;
  };

  const addObstacle = (runtimeScene, { obstacleOnly = false } = {}) =>
    addCube(runtimeScene, 'Obstacle', [
      {
        type: 'NavMeshPathfinding::NavMeshObstacleBehavior',
        name: 'NavMeshObstacle',
        // @ts-ignore - properties are not typed
        shape: 'Box',
        meshShapeResourceName: '',
        obstacleOnly,
      },
    ]);

  const addCharacter = (runtimeScene) =>
    addCube(runtimeScene, 'Character', [
      {
        type: 'NavMeshPathfinding::NavMeshCharacterBehavior',
        name: characterBehaviorName,
        // @ts-ignore - properties are not typed
        acceleration: 400,
        maxSpeed: 200,
        angularMaxSpeed: 180,
        rotateObject: false,
        angleOffset: 0,
        radius: 0,
        avoidanceSightRange: 120,
      },
    ]);

  /**
   * Make an obstacle a ground of 1000 x 1000 pixels, giving its surface as
   * triangles or as a height field.
   * @param {gdjs.Cube3DRuntimeObject} ground
   * @param {(x: number, y: number) => number} getGroundZ
   * @param {'triangles' | 'heightField'} representation
   */
  const setGroundSurface = (ground, getGroundZ, representation) => {
    ground.setWidth(1000);
    ground.setHeight(1000);
    // Height fields are finer than the navigation mesh cells.
    const cellCount = representation === 'heightField' ? 400 : 40;
    const rowSize = cellCount + 1;
    const getHeights = () => {
      const heights = new Float32Array(rowSize * rowSize);
      for (let row = 0; row <= cellCount; row++) {
        for (let column = 0; column <= cellCount; column++) {
          const x = (column / cellCount) * ground.getWidth();
          const y = (row / cellCount) * ground.getHeight();
          heights[row * rowSize + column] =
            (surface.getGroundZ(x, y) - ground.getZ()) / ground.getDepth();
        }
      }
      return heights;
    };
    const surface = {
      version: 1,
      getGroundZ,
      getVersion: () => surface.version,
      getChangedArea: () => null,
      getHeightField: () =>
        representation === 'heightField'
          ? { columns: rowSize, rows: rowSize, heights: getHeights() }
          : null,
      getTriangles: () => {
        if (representation !== 'triangles') return null;
        const heights = getHeights();
        const positions = new Float32Array(rowSize * rowSize * 3);
        for (let index = 0; index < heights.length; index++) {
          positions[index * 3] = (index % rowSize) / cellCount;
          positions[index * 3 + 1] = Math.floor(index / rowSize) / cellCount;
          positions[index * 3 + 2] = heights[index];
        }
        const indices = new Uint32Array(cellCount * cellCount * 6);
        let index = 0;
        for (let row = 0; row < cellCount; row++) {
          for (let column = 0; column < cellCount; column++) {
            const a = row * rowSize + column;
            const b = a + 1;
            const c = a + rowSize;
            const d = c + 1;
            indices.set([a, b, c, b, d, c], index);
            index += 6;
          }
        }
        return { positions, indices };
      },
    };
    ground.setSurface(surface);
    return surface;
  };

  const getHillZ = (x, y) =>
    200 * Math.exp(-(Math.pow(x - 500, 2) + Math.pow(y - 500, 2)) / 40000);

  /** @returns {gdjs.NavMeshCharacterRuntimeBehavior} */
  const getCharacterBehavior = (character) =>
    // @ts-ignore - the behavior is from this extension.
    character.getBehavior(characterBehaviorName);

  /**
   * @param {gdjs.RuntimeScene} runtimeScene
   * @param {(stepIndex: number) => void} [onStep]
   */
  const stepUntilDestinationIsReached = (runtimeScene, character, onStep) => {
    const behavior = getCharacterBehavior(character);
    for (
      let stepIndex = 0;
      stepIndex < 600 && !behavior.destinationReached();
      stepIndex++
    ) {
      runtimeScene.renderAndStep(1000 / 60);
      if (onStep) onStep(stepIndex);
    }
  };

  /** Let the nav mesh be built (it's rebuilt at most every second). */
  const stepOneSecond = (runtimeScene) => {
    for (let stepIndex = 0; stepIndex < 62; stepIndex++) {
      runtimeScene.renderAndStep(1000 / 60);
    }
  };

  /** @type {Array<'triangles' | 'heightField'>} */
  const representations = ['triangles', 'heightField'];
  for (const representation of representations) {
    describe(`with surfaces given as ${representation}`, function () {
      it('walks on the surface of an object', function () {
        const runtimeScene = createScene();
        const ground = addObstacle(runtimeScene);
        ground.setDepth(200);
        setGroundSurface(ground, getHillZ, representation);
        const character = addCharacter(runtimeScene);
        character.setPosition(100, 500);
        character.setZ(0);
        stepOneSecond(runtimeScene);

        getCharacterBehavior(character).moveTo(900, 500, 0);
        expect(getCharacterBehavior(character).pathFound()).to.be(true);
        let maxZ = 0;
        let maxDistanceToGround = 0;
        stepUntilDestinationIsReached(runtimeScene, character, () => {
          maxZ = Math.max(maxZ, character.getZ());
          maxDistanceToGround = Math.max(
            maxDistanceToGround,
            Math.abs(
              character.getZ() - getHillZ(character.getX(), character.getY())
            )
          );
        });
        expect(getCharacterBehavior(character).destinationReached()).to.be(
          true
        );
        // The character went over the hill, near the ground.
        expect(maxZ).to.be.above(150);
        expect(maxDistanceToGround).to.be.below(35);
      });

      it('rotates the surface with the object', function () {
        const runtimeScene = createScene();
        const ground = addObstacle(runtimeScene);
        ground.setDepth(200);
        // A slope going up to the right, turned to go up to the left.
        setGroundSurface(ground, (x) => x / 5, representation);
        ground.setAngle(180);
        const character = addCharacter(runtimeScene);
        character.setPosition(500, 500);
        character.setZ(100);
        stepOneSecond(runtimeScene);

        getCharacterBehavior(character).moveTo(900, 500, 0);
        stepUntilDestinationIsReached(runtimeScene, character);
        expect(getCharacterBehavior(character).destinationReached()).to.be(
          true
        );
        expect(character.getZ()).to.be.below(40);
      });

      it('rebuilds the nav mesh when the surface changes', function () {
        const runtimeScene = createScene();
        const ground = addObstacle(runtimeScene);
        ground.setDepth(200);
        const surface = setGroundSurface(ground, getHillZ, representation);
        const character = addCharacter(runtimeScene);
        character.setPosition(100, 500);
        stepOneSecond(runtimeScene);

        surface.getGroundZ = () => 0;
        surface.version++;
        stepOneSecond(runtimeScene);

        getCharacterBehavior(character).moveTo(900, 500, 0);
        let maxZ = 0;
        stepUntilDestinationIsReached(runtimeScene, character, () => {
          maxZ = Math.max(maxZ, character.getZ());
        });
        expect(getCharacterBehavior(character).destinationReached()).to.be(
          true
        );
        expect(maxZ).to.be.below(20);
      });

      it('rebuilds the nav mesh when a surface is set or removed', function () {
        const runtimeScene = createScene();
        // A box whose top is at Z = 0.
        const ground = addObstacle(runtimeScene);
        ground.setWidth(1000);
        ground.setHeight(1000);
        ground.setDepth(200);
        ground.setZ(-200);
        const character = addCharacter(runtimeScene);
        character.setPosition(100, 500);
        stepOneSecond(runtimeScene);

        const walkAcross = (destinationX) => {
          getCharacterBehavior(character).moveTo(destinationX, 500, 0);
          let minZ = Infinity;
          stepUntilDestinationIsReached(runtimeScene, character, () => {
            minZ = Math.min(minZ, character.getZ());
          });
          expect(getCharacterBehavior(character).destinationReached()).to.be(
            true
          );
          return minZ;
        };

        // A valley going down from the top of the box.
        const surface = setGroundSurface(
          ground,
          (x, y) => -getHillZ(x, y),
          representation
        );
        // Even a first version equal to 0 is taken into account.
        surface.version = 0;
        stepOneSecond(runtimeScene);
        expect(walkAcross(900)).to.be.below(-150);

        ground.setSurface(null);
        stepOneSecond(runtimeScene);
        expect(walkAcross(100)).to.be.within(-20, 20);
      });

      it("doesn't walk on obstacles that are only obstacles", function () {
        for (const obstacleOnly of [false, true]) {
          const runtimeScene = createScene();
          const ground = addObstacle(runtimeScene);
          ground.setZ(-100);
          ground.setDepth(100);
          // A trench crossing the path, going around it at the bottom.
          setGroundSurface(
            ground,
            (x, y) => (x >= 400 && x <= 600 && y < 700 ? -100 : 0),
            representation
          );
          const bridge = addObstacle(runtimeScene, { obstacleOnly });
          bridge.setPosition(380, 450);
          bridge.setWidth(240);
          bridge.setHeight(100);
          bridge.setZ(-10);
          bridge.setDepth(10);
          const character = addCharacter(runtimeScene);
          character.setPosition(100, 500);
          stepOneSecond(runtimeScene);

          getCharacterBehavior(character).moveTo(900, 500, 0);
          let maxDistanceToMiddleLine = 0;
          stepUntilDestinationIsReached(runtimeScene, character, () => {
            maxDistanceToMiddleLine = Math.max(
              maxDistanceToMiddleLine,
              Math.abs(character.getY() - 500)
            );
          });
          expect(getCharacterBehavior(character).destinationReached()).to.be(
            true
          );
          if (obstacleOnly) {
            // Around the trench.
            expect(maxDistanceToMiddleLine).to.be.above(200);
          } else {
            // On the bridge.
            expect(maxDistanceToMiddleLine).to.be.below(20);
          }
        }
      });
    });
  }

  it('goes around the holes of height fields', function () {
    const runtimeScene = createScene();
    const ground = addObstacle(runtimeScene);
    ground.setZ(-100);
    ground.setDepth(100);
    // A hole crossing the path, going around it at the bottom.
    setGroundSurface(
      ground,
      (x, y) => (x >= 400 && x <= 600 && y < 700 ? NaN : 0),
      'heightField'
    );
    const character = addCharacter(runtimeScene);
    character.setPosition(100, 500);
    stepOneSecond(runtimeScene);

    getCharacterBehavior(character).moveTo(900, 500, 0);
    let maxY = 0;
    stepUntilDestinationIsReached(runtimeScene, character, () => {
      maxY = Math.max(maxY, character.getY());
    });
    expect(getCharacterBehavior(character).destinationReached()).to.be(true);
    expect(maxY).to.be.above(700);
  });
});
