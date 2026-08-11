// @ts-check
describe('gdjs.NavMeshCharacterRuntimeBehavior', function () {
  const characterBehaviorName = 'NavMeshCharacter';

  before(async function () {
    // Give some time for the Recast navigation library (WASM) to be loaded.
    this.timeout(30000);
    await gdjs.getAllAsynchronouslyLoadingLibraryPromise();
  });

  const createScene = (framePerSecond = 60) => {
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
    setFramePerSecond(runtimeScene, framePerSecond);
    return runtimeScene;
  };
  const setFramePerSecond = (runtimeScene, framePerSecond) => {
    runtimeScene._timeManager.getElapsedTime = function () {
      return 1000 / framePerSecond;
    };
  };

  const addCharacter = (runtimeScene) => {
    const character = new gdjs.RuntimeObject(
      runtimeScene,
      {
        name: 'character',
        type: '',
        behaviors: [
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
        ],
        effects: [],
        variables: [],
      },
      undefined
    );
    character.getWidth = function () {
      return 20;
    };
    character.getHeight = function () {
      return 20;
    };
    runtimeScene.addObject(character);
    return character;
  };

  const addObstacle = (runtimeScene, width = 100, height = 100) => {
    const obstacle = new gdjs.RuntimeObject(
      runtimeScene,
      {
        name: 'obstacle',
        type: '',
        behaviors: [
          {
            type: 'NavMeshPathfinding::NavMeshObstacleBehavior',
            name: 'NavMeshObstacle',
            // @ts-ignore - properties are not typed
            shape: 'Box',
            meshShapeResourceName: '',
          },
        ],
        effects: [],
        variables: [],
      },
      undefined
    );
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
   * Add obstacles far in 2 corners to define the walkable area:
   * the ground used by the nav mesh covers the bounding box of all
   * the obstacles.
   */
  const addGroundDelimiters = (runtimeScene) => {
    const topLeftObstacle = addObstacle(runtimeScene);
    topLeftObstacle.setPosition(-300, -300);
    const bottomRightObstacle = addObstacle(runtimeScene);
    bottomRightObstacle.setPosition(1000, 700);
  };

  /** @returns {gdjs.NavMeshCharacterRuntimeBehavior} */
  const getCharacterBehavior = (character) =>
    // @ts-ignore - the behavior is from this extension.
    character.getBehavior(characterBehaviorName);

  /**
   * The path nodes are the remaining corners of the path (not including
   * the current character position), so the path length is measured
   * from the character position.
   */
  const getPathLength = (character) => {
    const behavior = getCharacterBehavior(character);
    if (behavior.getNodeCount() < 1) {
      return 0;
    }
    let pathLength = 0;
    let previousNodeX = character.getX();
    let previousNodeY = character.getY();
    for (let index = 0; index < behavior.getNodeCount(); index++) {
      const nodeX = behavior.getNodeX(index);
      const nodeY = behavior.getNodeY(index);
      pathLength += Math.hypot(nodeX - previousNodeX, nodeY - previousNodeY);
      previousNodeX = nodeX;
      previousNodeY = nodeY;
    }
    return pathLength;
  };

  const stepUntilDestinationIsReached = (runtimeScene, character) => {
    const behavior = getCharacterBehavior(character);
    for (
      let stepIndex = 0;
      stepIndex < 600 && !behavior.destinationReached();
      stepIndex++
    ) {
      runtimeScene.renderAndStep(1000 / 60);
    }
  };

  let runtimeScene;
  let character;
  beforeEach(function () {
    runtimeScene = createScene();
    character = addCharacter(runtimeScene);
    addGroundDelimiters(runtimeScene);
  });

  it('can find a path without any obstacle in the way and reach the destination', function () {
    character.setPosition(400, 300);
    // To ensure obstacles are registered.
    runtimeScene.renderAndStep(1000 / 60);

    getCharacterBehavior(character).moveTo(600, 300, 0);
    expect(getCharacterBehavior(character).pathFound()).to.be(true);
    // The path is extracted from the agent at the 1st step following moveTo.
    runtimeScene.renderAndStep(1000 / 60);
    // The origin and destination are snapped on the nav mesh grid,
    // so allow a margin on the path length.
    expect(getPathLength(character)).to.be.within(180, 220);

    stepUntilDestinationIsReached(runtimeScene, character);
    expect(getCharacterBehavior(character).destinationReached()).to.be(true);
    expect(character.getX()).to.be.within(580, 620);
    expect(character.getY()).to.be.within(280, 320);
  });

  it('can find a path around an obstacle in the way and reach the destination', function () {
    const blockingObstacle = addObstacle(runtimeScene, 50, 300);
    blockingObstacle.setPosition(475, 150);
    character.setPosition(400, 300);
    // To ensure obstacles are registered.
    runtimeScene.renderAndStep(1000 / 60);

    getCharacterBehavior(character).moveTo(600, 300, 0);
    expect(getCharacterBehavior(character).pathFound()).to.be(true);
    // The path is extracted from the agent at the 1st step following moveTo.
    runtimeScene.renderAndStep(1000 / 60);
    // The path can't be a straight line, it has to go around the obstacle.
    expect(getPathLength(character)).to.be.above(240);

    stepUntilDestinationIsReached(runtimeScene, character);
    expect(getCharacterBehavior(character).destinationReached()).to.be(true);
    expect(character.getX()).to.be.within(580, 620);
    expect(character.getY()).to.be.within(280, 320);
  });

  it('must not find a path to a destination outside of the walkable area', function () {
    character.setPosition(400, 300);
    // To ensure obstacles are registered.
    runtimeScene.renderAndStep(1000 / 60);

    // The destination is way outside of the walkable area
    // (which is the bounding box of all the obstacles).
    getCharacterBehavior(character).moveTo(600, 5000, 0);
    expect(getCharacterBehavior(character).pathFound()).to.be(false);

    // The character must not move.
    for (let stepIndex = 0; stepIndex < 10; stepIndex++) {
      runtimeScene.renderAndStep(1000 / 60);
    }
    expect(character.getX()).to.be.within(399, 401);
    expect(character.getY()).to.be.within(299, 301);
  });

  it("keeps moving to its destination when a new destination can't be found", function () {
    character.setPosition(400, 300);
    // To ensure obstacles are registered.
    runtimeScene.renderAndStep(1000 / 60);

    getCharacterBehavior(character).moveTo(600, 300, 0);
    expect(getCharacterBehavior(character).pathFound()).to.be(true);

    // Let the character travel a bit.
    for (let stepIndex = 0; stepIndex < 30; stepIndex++) {
      runtimeScene.renderAndStep(1000 / 60);
    }
    expect(character.getX()).to.be.above(420);

    // Ask for a destination that can't be reached.
    getCharacterBehavior(character).moveTo(600, 5000, 0);
    expect(getCharacterBehavior(character).pathFound()).to.be(false);

    // The character keeps moving to its previous destination.
    stepUntilDestinationIsReached(runtimeScene, character);
    expect(getCharacterBehavior(character).destinationReached()).to.be(true);
    expect(character.getX()).to.be.within(580, 620);
    expect(character.getY()).to.be.within(280, 320);
  });

  it('can find a shorter path when an obstacle is deactivated', function () {
    const blockingObstacle = addObstacle(runtimeScene, 50, 300);
    blockingObstacle.setPosition(475, 150);
    character.setPosition(400, 300);
    // To ensure obstacles are registered.
    runtimeScene.renderAndStep(1000 / 60);
    // To build the nav mesh a 1st time with the blocking obstacle.
    runtimeScene.renderAndStep(1000 / 60);

    const obstacleBehavior =
      /** @type {gdjs.NavMeshObstacleRuntimeBehavior} */ (
        blockingObstacle.getBehavior('NavMeshObstacle')
      );
    obstacleBehavior.activate(false);
    // The nav mesh is rebuilt at most once per second.
    for (let stepIndex = 0; stepIndex < 61; stepIndex++) {
      runtimeScene.renderAndStep(1000 / 60);
    }

    getCharacterBehavior(character).moveTo(600, 300, 0);
    expect(getCharacterBehavior(character).pathFound()).to.be(true);
    // The path is extracted from the agent at the 1st step following moveTo.
    runtimeScene.renderAndStep(1000 / 60);
    // The path is a straight line as the obstacle is gone.
    expect(getPathLength(character)).to.be.within(180, 220);
  });

  describe('(network synchronization)', function () {
    it('can sync an idle character over an idle character without error', function () {
      const otherCharacter = addCharacter(runtimeScene);
      otherCharacter.setPosition(200, 300);
      character.setPosition(400, 300);
      // To ensure obstacles are registered.
      runtimeScene.renderAndStep(1000 / 60);

      // Neither characters moved: their path is empty.
      const syncData = getCharacterBehavior(character).getNetworkSyncData({});
      expect(syncData.props.d).to.be(null);

      // This must not crash nor start any movement.
      getCharacterBehavior(otherCharacter).updateFromNetworkSyncData(
        syncData,
        {}
      );
      expect(getCharacterBehavior(otherCharacter).pathFound()).to.be(false);
      expect(getCharacterBehavior(otherCharacter).getNodeCount()).to.be(0);
    });

    it('can sync a moving character over an idle character', function () {
      const otherCharacter = addCharacter(runtimeScene);
      otherCharacter.setPosition(300, 200);
      character.setPosition(400, 300);
      // To ensure obstacles are registered.
      runtimeScene.renderAndStep(1000 / 60);

      getCharacterBehavior(character).moveTo(600, 300, 0);
      // Let the path be extracted from the agent.
      runtimeScene.renderAndStep(1000 / 60);
      expect(getCharacterBehavior(character).getNodeCount()).to.be.above(1);

      const syncData = getCharacterBehavior(character).getNetworkSyncData({});
      getCharacterBehavior(otherCharacter).updateFromNetworkSyncData(
        syncData,
        {}
      );
      expect(getCharacterBehavior(otherCharacter).pathFound()).to.be(true);

      stepUntilDestinationIsReached(runtimeScene, otherCharacter);
      expect(getCharacterBehavior(otherCharacter).destinationReached()).to.be(
        true
      );
      expect(otherCharacter.getX()).to.be.within(580, 620);
      expect(otherCharacter.getY()).to.be.within(280, 320);
    });

    it('can sync an idle character over a moving character to stop it', function () {
      const otherCharacter = addCharacter(runtimeScene);
      otherCharacter.setPosition(400, 300);
      character.setPosition(400, 300);
      // To ensure obstacles are registered.
      runtimeScene.renderAndStep(1000 / 60);

      getCharacterBehavior(otherCharacter).moveTo(600, 300, 0);
      // Let the path be extracted from the agent.
      runtimeScene.renderAndStep(1000 / 60);
      expect(getCharacterBehavior(otherCharacter).getNodeCount()).to.be.above(
        1
      );

      // The (idle) character path is empty.
      const syncData = getCharacterBehavior(character).getNetworkSyncData({});
      expect(syncData.props.d).to.be(null);

      getCharacterBehavior(otherCharacter).updateFromNetworkSyncData(
        syncData,
        {}
      );
      expect(getCharacterBehavior(otherCharacter).pathFound()).to.be(false);
      expect(getCharacterBehavior(otherCharacter).getNodeCount()).to.be(0);

      // The character must not move anymore.
      const oldX = otherCharacter.getX();
      const oldY = otherCharacter.getY();
      for (let stepIndex = 0; stepIndex < 10; stepIndex++) {
        runtimeScene.renderAndStep(1000 / 60);
      }
      expect(otherCharacter.getX()).to.be.within(oldX - 1, oldX + 1);
      expect(otherCharacter.getY()).to.be.within(oldY - 1, oldY + 1);
    });
  });
});
