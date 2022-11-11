// @ts-check
describe('gdjs.NavMeshPathfindingBehavior', function () {
  const epsilon = 1 / (2 << 16);
  const pathFindingName = 'auto1';

  const createScene = (framePerSecond = 60) => {
    const runtimeGame = new gdjs.RuntimeGame({
      variables: [],
      // @ts-ignore - missing properties.
      properties: {
        windowWidth: 800,
        windowHeight: 600,
        extensionProperties: [],
      },
      resources: { resources: [] },
    });
    const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
    runtimeScene.loadFromScene({
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
      behaviorsSharedData: [
        {
          name: 'NavMeshPathfindingObstacleBehavior',
          // @ts-ignore - properties are not typed
          areaLeftBound: 0,
          areaTopBound: 0,
          areaRightBound: 1280,
          areaBottomBound: 800,
          cellSize: 20,
        },
      ],
      objects: [],
      instances: [],
    });
    setFramePerSecond(runtimeScene, framePerSecond);
    return runtimeScene;
  };

  const setFramePerSecond = (runtimeScene, framePerSecond) => {
    runtimeScene._timeManager.getElapsedTime = function () {
      return 1000 / framePerSecond;
    };
  };

  const addPlayer = (runtimeScene) => {
    const player = new gdjs.TestRuntimeObject(runtimeScene, {
      name: 'player',
      type: '',
      behaviors: [
        {
          type: 'NavMeshPathfinding::NavMeshPathfindingBehavior',
          name: 'auto1',
          // @ts-ignore - properties are not typed
          acceleration: 400,
          maxSpeed: 200,
          angularMaxSpeed: 180,
          rotateObject: false,
          angleOffset: 0,
          extraBorder: 0,
        },
      ],
      effects: [],
    });
    player.setCustomWidthAndHeight(90, 90);
    player.setCustomCenter(45, 45);
    runtimeScene.addObject(player);
    return player;
  };

  const addObstacle = (runtimeScene) => {
    const obstacle = new gdjs.TestRuntimeObject(runtimeScene, {
      name: 'obstacle',
      type: '',
      behaviors: [
        {
          type: 'NavMeshPathfinding::NavMeshPathfindingObstacleBehavior',
          name: 'NavMeshPathfindingObstacleBehavior',
        },
      ],
      effects: [],
      variables: [],
    });
    obstacle.setCustomWidthAndHeight(100, 100);
    runtimeScene.addObject(obstacle);
    return obstacle;
  };

  let runtimeScene;
  let player;
  beforeEach(function () {
    runtimeScene = createScene();
    player = addPlayer(runtimeScene);
  });

  it('can find a path without any obstacle at all', function () {
    player.setPosition(200, 300);
    player.getBehavior(pathFindingName).moveTo(runtimeScene, 900, 300);
    expect(player.getBehavior(pathFindingName).pathFound()).to.be(true);
    expect(player.getBehavior(pathFindingName).getNodeCount()).to.be(2);
  });

  it('can find a path without any obstacle in the way', function () {
    const obstacle = addObstacle(runtimeScene);

    obstacle.setPosition(600, 600);
    // To ensure obstacles are registered.
    runtimeScene.renderAndStep(1000 / 60);

    player.setPosition(200, 300);
    player.getBehavior(pathFindingName).moveTo(runtimeScene, 900, 300);
    expect(player.getBehavior(pathFindingName).pathFound()).to.be(true);
    expect(player.getBehavior(pathFindingName).getNodeCount()).to.be(2);
  });

  it("mustn't find a path to the obstacle inside", function () {
    const obstacle = addObstacle(runtimeScene);

    obstacle.setPosition(600, 300);
    // To ensure obstacles are registered.
    runtimeScene.renderAndStep(1000 / 60);

    player.setPosition(200, 300);
    player.getBehavior(pathFindingName).moveTo(runtimeScene, 650, 350);
    expect(player.getBehavior(pathFindingName).pathFound()).to.be(false);
  });

  it('can find a path with an obstacle in the way', function () {
    const obstacle = addObstacle(runtimeScene);

    obstacle.setPosition(600, 300);
    // To ensure obstacles are registered.
    runtimeScene.renderAndStep(1000 / 60);

    player.setPosition(200, 300);
    player.getBehavior(pathFindingName).moveTo(runtimeScene, 900, 300);
    expect(player.getBehavior(pathFindingName).pathFound()).to.be(true);
    expect(player.getBehavior(pathFindingName).getNodeCount()).to.be.above(2);
  });

  it('can find a path between 2 obstacles', function () {
    const obstacleTop = addObstacle(runtimeScene);
    const obstacleBottom = addObstacle(runtimeScene);

    obstacleTop.setPosition(600, 150);
    obstacleBottom.setPosition(600, 450);
    // To ensure obstacles are registered.
    runtimeScene.renderAndStep(1000 / 60);

    const pathwayTop = obstacleTop.getY() + obstacleTop.getHeight();
    const pathwayBottom = obstacleBottom.getY();
    player.setPosition(
      200,
      (pathwayTop + pathwayBottom) / 2 + player.getHeight() / 2
    );
    player
      .getBehavior(pathFindingName)
      .moveTo(runtimeScene, 900, player.getY());
    expect(player.getBehavior(pathFindingName).pathFound()).to.be(true);
    expect(player.getBehavior(pathFindingName).getNodeCount()).to.be(2);
  });

  it("mustn't find a path to a closed room", function () {
    const obstacleTop = addObstacle(runtimeScene);
    const obstacleBottom = addObstacle(runtimeScene);
    const obstacleLeft = addObstacle(runtimeScene);
    const obstacleRight = addObstacle(runtimeScene);

    obstacleTop.setPosition(600, 140);
    obstacleBottom.setPosition(600, 460);
    obstacleLeft.setPosition(440, 300);
    obstacleRight.setPosition(760, 300);
    // To ensure obstacles are registered.
    runtimeScene.renderAndStep(1000 / 60);

    player.setPosition(200, 300);
    player
      .getBehavior(pathFindingName)
      .moveTo(runtimeScene, 600, 300 - player.getHeight() / 2);
    expect(player.getBehavior(pathFindingName).pathFound()).to.be(false);
  });

  [20, 30, 60, 120].forEach((framePerSecond) => {
    describe(`(${framePerSecond} fps)`, function () {
      it('can move on the path at the right speed', function () {
        setFramePerSecond(runtimeScene, framePerSecond);
        const obstacle = addObstacle(runtimeScene);

        obstacle.setPosition(600, 300);
        // To ensure obstacles are registered.
        runtimeScene.renderAndStep(1000 / framePerSecond);

        player.setPosition(200, 300);
        player.getBehavior(pathFindingName).moveTo(runtimeScene, 900, 300);
        expect(player.getBehavior(pathFindingName).pathFound()).to.be(true);
        expect(player.getBehavior(pathFindingName).getNodeCount()).to.be.above(
          2
        );

        // Move on the path and stop before the last 1/10 of second.
        for (let i = 0; i < (framePerSecond * 41) / 10; i++) {
          runtimeScene.renderAndStep(1000 / framePerSecond);
          expect(
            player.getBehavior(pathFindingName).destinationReached()
          ).to.be(false);
        }
        // The position is the same no matter the frame rate.
        expect(player.getX()).to.be.within(
          896.606382739383 - epsilon,
          896.606382739383 + epsilon
        );
        expect(player.getY()).to.be.within(
          302.63948009159105 - epsilon,
          302.63948009159105 + epsilon
        );

        // Let 1/10 of second pass,
        // because the calculus interval is not the same for each case.
        for (let i = 0; i < framePerSecond / 10; i++) {
          runtimeScene.renderAndStep(1000 / framePerSecond);
        }
        // The destination is reached for every frame rate within 1/10 of second.
        expect(player.getX()).to.be(900);
        expect(player.getY()).to.be(300);
        expect(player.getBehavior(pathFindingName).destinationReached()).to.be(
          true
        );
      });
    });
  });
});
