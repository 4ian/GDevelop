// @ts-check
describe('gdjs.NavMeshObstacleRuntimeBehavior (3D)', function () {
  const characterBehaviorName = 'NavMeshCharacter';

  before(async function () {
    // Give some time for the Recast navigation library (WASM) to be loaded.
    this.timeout(30000);
    await gdjs.getAllAsynchronouslyLoadingLibraryPromise();
  });

  const createScene = (runtimeGame = gdjs.getPixiRuntimeGame()) => {
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
          windowMask: false,
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

  const addCharacter = (runtimeScene, { radius = 0 } = {}) =>
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
        radius,
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
      getChangedArea: (sinceVersion) =>
        /** @type {gdjs.SurfaceArea | null} */ (null),
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

  describe('with obstacles moving', function () {
    /** @type {sinon.SinonSpy} */
    let buildTileSpy;
    beforeEach(function () {
      buildTileSpy = sinon.spy(gdjs.NavMeshTileBuilder.prototype, 'buildTile');
    });
    afterEach(function () {
      buildTileSpy.restore();
    });

    /** A ground of 1000 x 1000 pixels whose top is at Z = 0. */
    const addGround = (runtimeScene) => {
      const ground = addObstacle(runtimeScene);
      ground.setWidth(1000);
      ground.setHeight(1000);
      ground.setDepth(100);
      ground.setZ(-100);
      return ground;
    };

    /** A wall across the ground, with a passage at the bottom. */
    const addWall = (runtimeScene) => {
      const wall = addObstacle(runtimeScene, { obstacleOnly: true });
      wall.setPosition(480, 0);
      wall.setWidth(40);
      wall.setHeight(700);
      wall.setZ(0);
      wall.setDepth(100);
      return wall;
    };

    /**
     * @param {gdjs.RuntimeScene} runtimeScene
     * @param {gdjs.RuntimeObject} character
     */
    const walkAcross = (runtimeScene, character) => {
      character.setPosition(100, 300);
      getCharacterBehavior(character).moveTo(900, 300, 0);
      expect(getCharacterBehavior(character).pathFound()).to.be(true);
      let maxY = 0;
      stepUntilDestinationIsReached(runtimeScene, character, () => {
        maxY = Math.max(maxY, character.getY());
      });
      expect(getCharacterBehavior(character).destinationReached()).to.be(true);
      return maxY;
    };

    it('finds paths around obstacles where they moved', function () {
      const runtimeScene = createScene();
      addGround(runtimeScene);
      const wall = addWall(runtimeScene);
      const character = addCharacter(runtimeScene);
      character.setPosition(100, 300);
      stepOneSecond(runtimeScene);
      // Around the bottom of the wall.
      expect(walkAcross(runtimeScene, character)).to.be.above(700);

      // The passage is now at the top.
      wall.setY(300);
      for (let stepIndex = 0; stepIndex < 10; stepIndex++) {
        runtimeScene.renderAndStep(1000 / 60);
      }
      expect(walkAcross(runtimeScene, character)).to.be.below(320);
    });

    it('updates the path of moving characters when an obstacle moves away', function () {
      const runtimeScene = createScene();
      addGround(runtimeScene);
      const wall = addWall(runtimeScene);
      const character = addCharacter(runtimeScene);
      character.setPosition(100, 300);
      stepOneSecond(runtimeScene);

      getCharacterBehavior(character).moveTo(900, 300, 0);
      runtimeScene.renderAndStep(1000 / 60);
      wall.setX(2000);
      let maxY = 0;
      let maxStepDistance = 0;
      let previousX = character.getX();
      let previousY = character.getY();
      stepUntilDestinationIsReached(runtimeScene, character, () => {
        maxY = Math.max(maxY, character.getY());
        maxStepDistance = Math.max(
          maxStepDistance,
          Math.hypot(character.getX() - previousX, character.getY() - previousY)
        );
        previousX = character.getX();
        previousY = character.getY();
      });
      expect(getCharacterBehavior(character).destinationReached()).to.be(true);
      // The character turned back toward the destination without going
      // around where the wall was, and without being teleported.
      expect(maxY).to.be.below(600);
      // At most 200 pixels per second.
      expect(maxStepDistance).to.be.below(4);
    });

    it('gives the same paths when the same scene is played again', function () {
      const playScene = () => {
        const runtimeScene = createScene();
        addGround(runtimeScene);
        const wall = addWall(runtimeScene);
        const character = addCharacter(runtimeScene);
        character.setPosition(100, 300);
        runtimeScene.renderAndStep(1000 / 60);
        getCharacterBehavior(character).moveTo(900, 300, 0);
        const positions = [];
        for (let stepIndex = 0; stepIndex < 300; stepIndex++) {
          wall.setY(stepIndex * 2);
          runtimeScene.renderAndStep(1000 / 60);
          positions.push(character.getX(), character.getY());
        }
        return positions;
      };
      expect(playScene()).to.eql(playScene());
    });

    it('builds the navigation mesh when obstacles are created after the first frames', function () {
      const runtimeScene = createScene();
      const character = addCharacter(runtimeScene);
      character.setPosition(100, 300);
      stepOneSecond(runtimeScene);

      addGround(runtimeScene);
      addWall(runtimeScene);
      stepOneSecond(runtimeScene);
      expect(walkAcross(runtimeScene, character)).to.be.above(700);
    });

    it("doesn't rebuild the navigation mesh for tiny movements", function () {
      const runtimeScene = createScene();
      addGround(runtimeScene);
      const wall = addWall(runtimeScene);
      const character = addCharacter(runtimeScene);
      character.setPosition(100, 300);
      stepOneSecond(runtimeScene);
      buildTileSpy.resetHistory();

      // Like a physics body settling, less than half a cell (5 pixels).
      for (let stepIndex = 0; stepIndex < 60; stepIndex++) {
        wall.setX(480 + Math.sin(stepIndex) * 2);
        wall.setZ(Math.cos(stepIndex) * 2);
        wall.setAngle(Math.sin(stepIndex) * 0.2);
        runtimeScene.renderAndStep(1000 / 60);
      }
      expect(buildTileSpy.callCount).to.be(0);

      wall.setX(500);
      for (let stepIndex = 0; stepIndex < 10; stepIndex++) {
        runtimeScene.renderAndStep(1000 / 60);
      }
      // Only the tiles around the wall are built again.
      const tilesCount = buildTileSpy.callCount;
      expect(tilesCount).to.be.above(0);
      expect(tilesCount).to.be.below(9);
    });

    it("doesn't convert surfaces again when other obstacles move", function () {
      const runtimeScene = createScene();
      const ground = addObstacle(runtimeScene);
      ground.setDepth(200);
      const surface = setGroundSurface(ground, getHillZ, 'heightField');
      const getHeightFieldSpy = sinon.spy(surface, 'getHeightField');
      const box = addObstacle(runtimeScene, { obstacleOnly: true });
      box.setPosition(100, 100);
      const character = addCharacter(runtimeScene);
      character.setPosition(100, 500);
      stepOneSecond(runtimeScene);
      expect(getHeightFieldSpy.callCount).to.be(1);

      for (let stepIndex = 0; stepIndex < 60; stepIndex++) {
        box.setX(100 + stepIndex * 10);
        runtimeScene.renderAndStep(1000 / 60);
      }
      expect(buildTileSpy.callCount).to.be.above(0);
      expect(getHeightFieldSpy.callCount).to.be(1);

      // Only the part of the surface that changed is built again.
      buildTileSpy.resetHistory();
      surface.getChangedArea = () => ({
        minX: 0.1,
        minY: 0.1,
        maxX: 0.2,
        maxY: 0.2,
      });
      surface.version++;
      stepOneSecond(runtimeScene);
      expect(getHeightFieldSpy.callCount).to.be(2);
      expect(buildTileSpy.callCount).to.be.within(1, 4);
    });

    it('converts surfaces edited at every frame at most 10 times per second', function () {
      const runtimeScene = createScene();
      const ground = addObstacle(runtimeScene);
      ground.setDepth(200);
      const surface = setGroundSurface(ground, getHillZ, 'heightField');
      const getHeightFieldSpy = sinon.spy(surface, 'getHeightField');
      const character = addCharacter(runtimeScene);
      character.setPosition(100, 500);
      stepOneSecond(runtimeScene);
      getHeightFieldSpy.resetHistory();

      // Like a terrain dug at every frame.
      for (let stepIndex = 0; stepIndex < 60; stepIndex++) {
        surface.getGroundZ = (x, y) => getHillZ(x, y) - stepIndex;
        surface.version++;
        runtimeScene.renderAndStep(1000 / 60);
      }
      expect(getHeightFieldSpy.callCount).to.be.within(9, 11);

      // The last edit is taken into account.
      stepOneSecond(runtimeScene);
      getCharacterBehavior(character).moveTo(900, 500, 0);
      let maxZ = Number.NEGATIVE_INFINITY;
      stepUntilDestinationIsReached(runtimeScene, character, () => {
        maxZ = Math.max(maxZ, character.getZ());
      });
      expect(getCharacterBehavior(character).destinationReached()).to.be(true);
      expect(maxZ).to.be.within(200 - 59 - 35, 200 - 59 + 35);
    });

    it('builds large navigation meshes over several frames, and can be used right away', function () {
      const runtimeScene = createScene();
      const ground = addObstacle(runtimeScene);
      ground.setWidth(10000);
      ground.setHeight(10000);
      ground.setDepth(100);
      ground.setZ(-100);
      const wall = addObstacle(runtimeScene, { obstacleOnly: true });
      wall.setPosition(5000, 0);
      wall.setWidth(40);
      wall.setHeight(9000);
      wall.setDepth(100);
      const character = addCharacter(runtimeScene);
      character.setPosition(4000, 5000);
      runtimeScene.renderAndStep(1000 / 60);

      getCharacterBehavior(character).moveTo(6000, 5000, 0);
      expect(getCharacterBehavior(character).pathFound()).to.be(true);
      runtimeScene.renderAndStep(1000 / 60);
      const tilesCount = Math.ceil(10000 / (32 * 10)) ** 2;
      expect(buildTileSpy.callCount).to.be.below(tilesCount / 4);

      let maxY = 0;
      for (
        let stepIndex = 0;
        stepIndex < 6000 &&
        !getCharacterBehavior(character).destinationReached();
        stepIndex++
      ) {
        runtimeScene.renderAndStep(1000 / 60);
        maxY = Math.max(maxY, character.getY());
      }
      expect(getCharacterBehavior(character).destinationReached()).to.be(true);
      // The character went around the wall.
      expect(maxY).to.be.above(9000);
      // Each tile was built once.
      const builtTiles = new Set(
        buildTileSpy.args.map(([, tileX, tileY]) => tileX + ';' + tileY)
      );
      expect(builtTiles.size).to.be(buildTileSpy.callCount);
      expect(builtTiles.size).to.be.above(tilesCount - 1);
    });

    it('finds paths around an obstacle that rotated', function () {
      const runtimeScene = createScene();
      addGround(runtimeScene);
      const wall = addWall(runtimeScene);
      const character = addCharacter(runtimeScene);
      character.setPosition(100, 300);
      stepOneSecond(runtimeScene);
      // Around the bottom of the wall.
      expect(walkAcross(runtimeScene, character)).to.be.above(700);

      // The wall now lies along the way, below it.
      wall.setAngle(90);
      for (let stepIndex = 0; stepIndex < 10; stepIndex++) {
        runtimeScene.renderAndStep(1000 / 60);
      }
      expect(walkAcross(runtimeScene, character)).to.be.below(320);
    });

    it('finds paths around an obstacle that moved slowly', function () {
      const runtimeScene = createScene();
      addGround(runtimeScene);
      const wall = addWall(runtimeScene);
      const character = addCharacter(runtimeScene);
      character.setPosition(100, 300);
      stepOneSecond(runtimeScene);
      // Around the bottom of the wall.
      expect(walkAcross(runtimeScene, character)).to.be.above(700);

      // One pixel per frame is much less than half a cell (5 pixels), but
      // these small moves add up: the passage is now at the top.
      for (let stepIndex = 0; stepIndex < 300; stepIndex++) {
        wall.setY(wall.getY() + 1);
        runtimeScene.renderAndStep(1000 / 60);
      }
      expect(walkAcross(runtimeScene, character)).to.be.below(320);
    });

    it('keeps characters moving when more than 100 others are created', function () {
      const runtimeScene = createScene();
      addGround(runtimeScene);
      const character = addCharacter(runtimeScene);
      character.setPosition(100, 300);
      stepOneSecond(runtimeScene);
      getCharacterBehavior(character).moveTo(900, 300, 0);
      runtimeScene.renderAndStep(1000 / 60);

      const otherCharacters = [];
      for (let index = 0; index < 150; index++) {
        const otherCharacter = addCharacter(runtimeScene);
        otherCharacter.setPosition(100 + (index % 15) * 50, 500 + index * 2);
        otherCharacters.push(otherCharacter);
      }
      stepUntilDestinationIsReached(runtimeScene, character);
      expect(getCharacterBehavior(character).destinationReached()).to.be(true);

      // The last character created can move too.
      const lastCharacter = otherCharacters[otherCharacters.length - 1];
      getCharacterBehavior(lastCharacter).moveTo(900, 900, 0);
      expect(getCharacterBehavior(lastCharacter).pathFound()).to.be(true);
      stepUntilDestinationIsReached(runtimeScene, lastCharacter);
      expect(getCharacterBehavior(lastCharacter).destinationReached()).to.be(
        true
      );
    });

    it('builds at most one tile per frame, and 40 per second, when many obstacles move', function () {
      const runtimeScene = createScene();
      addGround(runtimeScene);
      const walls = [];
      for (let index = 0; index < 8; index++) {
        const wall = addWall(runtimeScene);
        wall.setHeight(40);
        wall.setPosition(100 + index * 100, 100 + index * 100);
        walls.push(wall);
      }
      const character = addCharacter(runtimeScene);
      character.setPosition(100, 900);
      stepOneSecond(runtimeScene);
      buildTileSpy.resetHistory();

      for (let stepIndex = 0; stepIndex < 60; stepIndex++) {
        for (const wall of walls) {
          wall.setX(wall.getX() + (stepIndex % 2 ? 20 : -20));
        }
        const tilesCount = buildTileSpy.callCount;
        runtimeScene.renderAndStep(1000 / 60);
        expect(buildTileSpy.callCount - tilesCount).to.be.below(2);
      }
      expect(buildTileSpy.callCount).to.be.within(20, 40);
    });

    /**
     * The vertices and polygons of each tile of a navigation mesh.
     * @param {gdjs.RuntimeScene} runtimeScene
     * @returns {Record<string, string>}
     */
    const getTilesDescription = (runtimeScene) => {
      const navMesh = runtimeScene.navMeshObstaclesManager.navMesh;
      if (!navMesh) throw new Error('The navigation mesh is not built.');
      /** @type {Record<string, string>} */
      const tilesDescription = {};
      for (let tileIndex = 0; tileIndex < navMesh.getMaxTiles(); tileIndex++) {
        const tile = navMesh.getTile(tileIndex);
        const header = tile.header();
        if (!header) continue;
        const values = [];
        for (let index = 0; index < header.vertCount() * 3; index++) {
          values.push(tile.verts(index).toFixed(2));
        }
        for (let index = 0; index < header.polyCount(); index++) {
          const polygon = tile.polys(index);
          values.push('polygon');
          for (let vertex = 0; vertex < polygon.vertCount(); vertex++) {
            values.push(polygon.verts(vertex));
          }
        }
        tilesDescription[header.x() + ';' + header.y()] = values.join(' ');
      }
      return tilesDescription;
    };

    it('gives the same tiles after many changes of obstacles as when built from their final state', function () {
      // Changes are picked at random, but the same ones at every run.
      let seed = 1;
      const random = () => {
        seed = (seed * 16807) % 2147483647;
        return seed / 2147483647;
      };
      /** A whole number of cells: every change is big enough to count. */
      const pickBetween = (min, max) =>
        min + 10 * Math.floor((random() * (max - min)) / 10);

      const addBox = (runtimeScene, state) => {
        const box = addObstacle(runtimeScene, { obstacleOnly: true });
        box.setZ(0);
        box.setDepth(100);
        applyState(box, state);
        return box;
      };
      const applyState = (box, state) => {
        box.setWidth(state.width);
        box.setHeight(state.height);
        box.setPosition(state.x, state.y);
        box.setAngle(state.angle);
      };
      // The ground is about 100 tiles: most tiles are changed once or
      // twice, so a tile wrongly left as it was stays wrong until the end.
      const addLargeGround = (runtimeScene) => {
        const ground = addGround(runtimeScene);
        ground.setWidth(3000);
        ground.setHeight(3000);
      };
      const pickState = () => ({
        x: pickBetween(100, 2800),
        y: pickBetween(100, 2800),
        width: pickBetween(20, 120),
        height: pickBetween(20, 120),
        angle: 15 * Math.floor(random() * 12),
      });

      const runtimeScene = createScene();
      addLargeGround(runtimeScene);
      const character = addCharacter(runtimeScene);
      character.setPosition(50, 50);
      let boxes = [];
      for (let index = 0; index < 30; index++) {
        const state = pickState();
        boxes.push({ state, box: addBox(runtimeScene, state) });
      }
      stepOneSecond(runtimeScene);

      for (let changeIndex = 0; changeIndex < 100; changeIndex++) {
        const boxIndex = Math.floor(random() * boxes.length);
        const { box } = boxes[boxIndex];
        const change = Math.floor(random() * 3);
        if (change === 0) {
          // Moved, resized and rotated.
          boxes[boxIndex].state = pickState();
          applyState(box, boxes[boxIndex].state);
        } else if (change === 1) {
          box.deleteFromScene();
          boxes.splice(boxIndex, 1);
        } else {
          const state = pickState();
          boxes.push({ state, box: addBox(runtimeScene, state) });
        }
        // Changes happen while tiles of the previous ones are still built.
        runtimeScene.renderAndStep(1000 / 60);
        runtimeScene.renderAndStep(1000 / 60);
      }
      for (let second = 0; second < 5; second++) stepOneSecond(runtimeScene);

      const expectedRuntimeScene = createScene();
      addLargeGround(expectedRuntimeScene);
      addCharacter(expectedRuntimeScene).setPosition(50, 50);
      for (const { state } of boxes) addBox(expectedRuntimeScene, state);
      for (let second = 0; second < 5; second++) {
        stepOneSecond(expectedRuntimeScene);
      }

      const tilesDescription = getTilesDescription(runtimeScene);
      const expectedTilesDescription =
        getTilesDescription(expectedRuntimeScene);
      expect(Object.keys(tilesDescription).length).to.be.above(80);
      expect(Object.keys(tilesDescription).sort()).to.eql(
        Object.keys(expectedTilesDescription).sort()
      );
      for (const tileKey in expectedTilesDescription) {
        expect(tilesDescription[tileKey]).to.be(
          expectedTilesDescription[tileKey]
        );
      }
    });

    it('finds shorter paths when an obstacle is deleted', function () {
      const runtimeScene = createScene();
      addGround(runtimeScene);
      const wall = addWall(runtimeScene);
      const character = addCharacter(runtimeScene);
      character.setPosition(100, 300);
      stepOneSecond(runtimeScene);
      expect(walkAcross(runtimeScene, character)).to.be.above(700);

      wall.deleteFromScene();
      for (let stepIndex = 0; stepIndex < 10; stepIndex++) {
        runtimeScene.renderAndStep(1000 / 60);
      }
      expect(walkAcross(runtimeScene, character)).to.be.below(320);
    });

    it('lets a character move again after an obstacle that covered it moved away', function () {
      const runtimeScene = createScene();
      addGround(runtimeScene);
      const character = addCharacter(runtimeScene, { radius: 20 });
      character.setPosition(500, 500);
      stepOneSecond(runtimeScene);
      getCharacterBehavior(character).moveTo(520, 500, 0);
      stepUntilDestinationIsReached(runtimeScene, character);
      expect(getCharacterBehavior(character).destinationReached()).to.be(true);

      // No floor is left near the character.
      const building = addObstacle(runtimeScene, { obstacleOnly: true });
      building.setPosition(250, 250);
      building.setWidth(500);
      building.setHeight(500);
      building.setZ(0);
      building.setDepth(100);
      stepOneSecond(runtimeScene);
      getCharacterBehavior(character).moveTo(900, 500, 0);
      expect(getCharacterBehavior(character).pathFound()).to.be(false);

      building.setPosition(5000, 5000);
      stepOneSecond(runtimeScene);
      stepOneSecond(runtimeScene);
      getCharacterBehavior(character).moveTo(900, 500, 0);
      expect(getCharacterBehavior(character).pathFound()).to.be(true);
      stepUntilDestinationIsReached(runtimeScene, character);
      expect(getCharacterBehavior(character).destinationReached()).to.be(true);
    });

    it('keeps bigger characters created later away from obstacles, building the navigation mesh again once', function () {
      const createNavMeshSpy = sinon.spy(
        gdjs.NavMeshTileBuilder.prototype,
        'createNavMesh'
      );
      try {
        const runtimeScene = createScene();
        addGround(runtimeScene);
        // The passage at the bottom is 60 pixels wide.
        const wall = addWall(runtimeScene);
        wall.setHeight(940);
        const character = addCharacter(runtimeScene);
        character.setPosition(100, 300);
        stepOneSecond(runtimeScene);
        expect(walkAcross(runtimeScene, character)).to.be.above(940);
        expect(createNavMeshSpy.callCount).to.be(1);

        const bigCharacter = addCharacter(runtimeScene, { radius: 40 });
        bigCharacter.setPosition(100, 300);
        // The navigation mesh is built again when an obstacle changes.
        wall.setX(500);
        stepOneSecond(runtimeScene);
        stepOneSecond(runtimeScene);
        stepOneSecond(runtimeScene);
        expect(createNavMeshSpy.callCount).to.be(2);

        // The passage is too narrow for the big character: no one crosses.
        character.setPosition(100, 300);
        getCharacterBehavior(character).moveTo(900, 300, 0);
        stepUntilDestinationIsReached(runtimeScene, character);
        expect(character.getX()).to.be.below(500);
      } finally {
        createNavMeshSpy.restore();
      }
    });

    it('builds the navigation mesh again when obstacles are created far beyond where it was built', function () {
      const createNavMeshSpy = sinon.spy(
        gdjs.NavMeshTileBuilder.prototype,
        'createNavMesh'
      );
      try {
        const runtimeScene = createScene();
        const smallGround = addObstacle(runtimeScene);
        smallGround.setWidth(300);
        smallGround.setHeight(300);
        smallGround.setDepth(100);
        smallGround.setZ(-100);
        const character = addCharacter(runtimeScene);
        character.setPosition(100, 100);
        stepOneSecond(runtimeScene);
        expect(createNavMeshSpy.callCount).to.be(1);

        // Many more tiles than the navigation mesh was created for.
        const largeGround = addObstacle(runtimeScene);
        largeGround.setWidth(3000);
        largeGround.setHeight(3000);
        largeGround.setDepth(100);
        largeGround.setZ(-100);
        stepOneSecond(runtimeScene);
        stepOneSecond(runtimeScene);
        expect(createNavMeshSpy.callCount).to.be(2);

        getCharacterBehavior(character).moveTo(300, 2800, 0);
        expect(getCharacterBehavior(character).pathFound()).to.be(true);
        for (
          let stepIndex = 0;
          stepIndex < 1200 &&
          !getCharacterBehavior(character).destinationReached();
          stepIndex++
        ) {
          runtimeScene.renderAndStep(1000 / 60);
        }
        expect(getCharacterBehavior(character).destinationReached()).to.be(
          true
        );
      } finally {
        createNavMeshSpy.restore();
      }
    });

    describe('(WebAssembly memory)', function () {
      /**
       * Where the WebAssembly module of Recast allocates a big block:
       * it moves when memory allocated before was not freed.
       */
      const getFreeMemoryStart = () => {
        const array = new RecastNav.UnsignedCharArray();
        array.resize(4 * 1024 * 1024);
        const freeMemoryStart = array.raw.getDataPointer();
        array.destroy();
        return freeMemoryStart;
      };

      /**
       * @param {(index: number) => void} action
       * @param {number} count
       * @returns the bytes left allocated by each call of the action.
       */
      const getLeakedBytes = (action, count) => {
        // Let the allocator reuse the blocks freed before.
        for (let index = 0; index < 100; index++) {
          action(index);
        }
        const freeMemoryStart = getFreeMemoryStart();
        for (let index = 0; index < count; index++) {
          action(index);
        }
        return (getFreeMemoryStart() - freeMemoryStart) / count;
      };

      const createSceneWithWall = () => {
        const runtimeScene = createScene();
        addGround(runtimeScene);
        const wall = addWall(runtimeScene);
        const character = addCharacter(runtimeScene);
        character.setPosition(100, 300);
        stepOneSecond(runtimeScene);
        return { runtimeScene, wall, character };
      };

      it('frees the memory used to search paths', function () {
        const { runtimeScene, character } = createSceneWithWall();
        const leakedBytes = getLeakedBytes((index) => {
          getCharacterBehavior(character).moveTo(index % 2 ? 900 : 100, 300, 0);
          expect(getCharacterBehavior(character).pathFound()).to.be(true);
        }, 2000);
        expect(leakedBytes).to.be(0);
        runtimeScene.unloadScene();
      });

      it('frees the memory of the tiles built again when obstacles move', function () {
        this.timeout(20000);
        // The character stays away from the wall: its agent is kept.
        const { runtimeScene, wall } = createSceneWithWall();
        buildTileSpy.resetHistory();
        const leakedBytes = getLeakedBytes((index) => {
          wall.setX(index % 20 < 10 ? 480 : 520);
          runtimeScene.renderAndStep(1000 / 60);
        }, 3000);
        expect(buildTileSpy.callCount).to.be.above(500);
        expect(leakedBytes).to.be(0);
        runtimeScene.unloadScene();
      });

      it('frees the memory of navigation meshes built again and of unloaded scenes', function () {
        this.timeout(20000);
        const leakedBytes = getLeakedBytes(() => {
          const { runtimeScene, character } = createSceneWithWall();
          getCharacterBehavior(character).moveTo(900, 300, 0);
          runtimeScene.navMeshObstaclesManager.invalidateNavMesh();
          stepOneSecond(runtimeScene);
          runtimeScene.unloadScene();
        }, 50);
        // A navigation mesh or a crowd not freed would be thousands of bytes.
        // The classes of `RecastNav` leave 16 bytes for each build context
        // and each crowd, and 40 bytes for each agent.
        expect(leakedBytes).to.be.below(1024);
      });
    });
  });

  describe('with a 3D model as obstacle', function () {
    // A ramp of 316 triangles, from the "platformer-3d-wipeout" example.
    const rampResourceName = 'ramp.glb';
    const createSceneWithRamp = async (shape) => {
      const runtimeGame = gdjs.getPixiRuntimeGame({
        resources: {
          resources: [
            {
              kind: 'model3D',
              name: rampResourceName,
              file: 'base/GDJS/tests/tests-utils/assets/' + rampResourceName,
              metadata: '',
              userAdded: false,
            },
          ],
        },
      });
      const model3DManager = runtimeGame.getModel3DManager();
      await model3DManager.loadResource(rampResourceName);
      await model3DManager.processResource(rampResourceName);
      const runtimeScene = createScene(runtimeGame);
      const ramp = new gdjs.Model3DRuntimeObject(runtimeScene, {
        name: 'Ramp',
        type: 'Scene3D::Model3DObject',
        effects: [],
        variables: [],
        behaviors: [
          {
            type: 'NavMeshPathfinding::NavMeshObstacleBehavior',
            name: 'NavMeshObstacle',
            // @ts-ignore - properties are not typed
            shape,
            meshShapeResourceName: '',
            obstacleOnly: false,
          },
        ],
        content: {
          modelResourceName: rampResourceName,
          width: 800,
          height: 800,
          depth: 500,
          rotationX: 90,
          rotationY: 0,
          rotationZ: 0,
          keepAspectRatio: false,
          materialType: 'Basic',
          originLocation: 'ModelOrigin',
          centerLocation: 'ModelOrigin',
          animations: [],
          crossfadeDuration: 0,
          isCastingShadow: false,
          isReceivingShadow: false,
        },
      });
      runtimeScene.addObject(ramp);
      return { runtimeScene, ramp, model3DManager };
    };

    /**
     * Walk between the two ends of the ramp, 300 pixels from its center.
     * @param {gdjs.RuntimeScene} runtimeScene
     * @param {gdjs.RuntimeObject} ramp
     * @param {{x: number, y: number}} lowEnd Where the low end is, from the
     * center of the ramp.
     * @param {number} [destinationZ]
     * @returns the Z of the character at each frame.
     */
    const walkUpRamp = (runtimeScene, ramp, lowEnd, destinationZ = 470) => {
      const centerX = ramp.getCenterXInScene();
      const centerY = ramp.getCenterYInScene();
      const character = addCharacter(runtimeScene);
      character.setPosition(centerX + lowEnd.x, centerY + lowEnd.y);
      character.setZ(240);
      stepOneSecond(runtimeScene);
      getCharacterBehavior(character).moveTo(
        centerX - lowEnd.x,
        centerY - lowEnd.y,
        destinationZ
      );
      expect(getCharacterBehavior(character).pathFound()).to.be(true);
      const zs = [character.getZ()];
      stepUntilDestinationIsReached(runtimeScene, character, () => {
        zs.push(character.getZ());
      });
      expect(getCharacterBehavior(character).destinationReached()).to.be(true);
      return zs;
    };

    /**
     * The top of the ramp goes from Z = 195 to Z = 498 along its 800 pixels:
     * it's at about 233 and 461 at 300 pixels from its center.
     * @param {Array<number>} zs
     */
    const expectToFollowRampSlope = (zs) => {
      expect(zs[0]).to.be.within(213, 263);
      expect(zs[zs.length - 1]).to.be.within(441, 491);
      for (let index = 1; index < zs.length; index++) {
        // The character never goes down, nor jumps up.
        expect(zs[index] - zs[index - 1]).to.be.within(-2, 10);
      }
    };

    it('walks on the triangles of the model with the "Mesh" shape', async function () {
      const { runtimeScene, ramp, model3DManager } =
        await createSceneWithRamp('Mesh');
      ramp.setPosition(1000, 1000);
      expectToFollowRampSlope(walkUpRamp(runtimeScene, ramp, { x: 300, y: 0 }));
      runtimeScene.unloadScene();
      model3DManager.dispose();
    });

    it('rotates the triangles of the model with the object', async function () {
      const { runtimeScene, ramp, model3DManager } =
        await createSceneWithRamp('Mesh');
      ramp.setPosition(1000, 1000);
      ramp.setAngle(90);
      expectToFollowRampSlope(walkUpRamp(runtimeScene, ramp, { x: 0, y: 300 }));
      runtimeScene.unloadScene();
      model3DManager.dispose();
    });

    it('keeps the triangles of a flipped model walkable', async function () {
      const { runtimeScene, ramp, model3DManager } =
        await createSceneWithRamp('Mesh');
      ramp.setPosition(1000, 1000);
      ramp.flipX(true);
      expectToFollowRampSlope(
        walkUpRamp(runtimeScene, ramp, { x: -300, y: 0 })
      );
      runtimeScene.unloadScene();
      model3DManager.dispose();
    });

    it('converts the model again when it is flipped', async function () {
      const { runtimeScene, ramp, model3DManager } =
        await createSceneWithRamp('Mesh');
      ramp.setPosition(1000, 1000);
      expectToFollowRampSlope(walkUpRamp(runtimeScene, ramp, { x: 300, y: 0 }));

      ramp.flipX(true);
      expectToFollowRampSlope(
        walkUpRamp(runtimeScene, ramp, { x: -300, y: 0 })
      );
      runtimeScene.unloadScene();
      model3DManager.dispose();
    });

    it('walks on the box of the model with the "Box" shape', async function () {
      const { runtimeScene, ramp, model3DManager } =
        await createSceneWithRamp('Box');
      ramp.setPosition(1000, 1000);
      const zs = walkUpRamp(runtimeScene, ramp, { x: 300, y: 0 }, 240);
      // The top of the box is flat.
      expect(Math.max(...zs) - Math.min(...zs)).to.be.below(1);
      runtimeScene.unloadScene();
      model3DManager.dispose();
    });
  });

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
