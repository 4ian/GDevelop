const addObstacle = (runtimeScene) => {
  var obstacle = new gdjs.RuntimeObject(runtimeScene, {
    name: 'obstacle',
    type: '',
    behaviors: [
      {
        type: 'PathfindingBehavior::PathfindingObstacleBehavior',
        impassable: true,
        cost: 2,
      },
    ],
  });
  obstacle.getWidth = function () {
    return 100;
  };
  obstacle.getHeight = function () {
    return 100;
  };
  runtimeScene.addObject(obstacle);

  return obstacle;
};

const doTestsCommonpathfindingruntimebehavior = (
  collisionMethod,
  allowDiagonals
) => {
  var runtimeGame = new gdjs.RuntimeGame({
    variables: [],
    properties: { windowWidth: 800, windowHeight: 600 },
    resources: { resources: [] },
  });
  var runtimeScene = new gdjs.RuntimeScene(runtimeGame);
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

  const pathFindingName = 'auto1';
  var object = new gdjs.RuntimeObject(runtimeScene, {
    name: 'player',
    type: '',
    behaviors: [
      {
        type: 'PathfindingBehavior::PathfindingBehavior',
        name: pathFindingName,
        allowDiagonals: allowDiagonals,
        acceleration: 400,
        maxSpeed: 200,
        angularMaxSpeed: 180,
        rotateObject: false,
        angleOffset: 0,
        cellWidth: 20,
        cellHeight: 20,
        extraBorder: 0,
      },
    ],
  });
  object.getWidth = function () {
    return 90;
  };
  object.getHeight = function () {
    return 90;
  };
  runtimeScene.addObject(object);

  it('can find a path without any obstacle at all', function () {
    object.setPosition(480, 300);
    object.getBehavior(pathFindingName).moveTo(runtimeScene, 720, 300);
    expect(object.getBehavior(pathFindingName).pathFound()).to.be(true);
    expect(object.getBehavior(pathFindingName).getNodeCount()).to.be(13);
  });

  it('can find a path without any obstacle in the way', function () {
    const obstacle = addObstacle(runtimeScene);
    obstacle.setPosition(100, 100);
    // To ensure obstacles are registered.
    runtimeScene.renderAndStep(1000 / 60);

    object.setPosition(480, 300);
    object.getBehavior(pathFindingName).moveTo(runtimeScene, 720, 300);
    expect(object.getBehavior(pathFindingName).pathFound()).to.be(true);
    expect(object.getBehavior(pathFindingName).getNodeCount()).to.be(13);
  });

  const obstacle = addObstacle(runtimeScene);

  it("mustn't find a path to the obstacle inside", function () {
    obstacle.setPosition(600, 300);
    // To ensure obstacles are registered.
    runtimeScene.renderAndStep(1000 / 60);

    object.setPosition(480, 300);
    object.getBehavior(pathFindingName).moveTo(runtimeScene, 650, 350);
    expect(object.getBehavior(pathFindingName).pathFound()).to.be(false);
  });

  it('can find a path with an obstacle in the way', function () {
    obstacle.setPosition(600, 300);
    // To ensure obstacles are registered.
    runtimeScene.renderAndStep(1000 / 60);

    object.setPosition(480, 300);
    object.getBehavior(pathFindingName).moveTo(runtimeScene, 720, 300);
    expect(object.getBehavior(pathFindingName).pathFound()).to.be(true);
    expect(object.getBehavior(pathFindingName).getNodeCount()).to.be.above(13);
  });

  const obstacleTop = obstacle;
  const obstacleBottom = addObstacle(runtimeScene);

  it('can find a path between 2 obstacles', function () {
    obstacleTop.setPosition(600, 180);
    obstacleBottom.setPosition(600, 420);
    // To ensure obstacles are registered.
    runtimeScene.renderAndStep(1000 / 60);

    object.setPosition(480, 300);
    object.getBehavior(pathFindingName).moveTo(runtimeScene, 720, 300);
    expect(object.getBehavior(pathFindingName).pathFound()).to.be(true);
    expect(object.getBehavior(pathFindingName).getNodeCount()).to.be(13);
  });

  const obstacleLeft = addObstacle(runtimeScene);
  const obstacleRight = addObstacle(runtimeScene);

  it("mustn't find a path to a closed room", function () {
    obstacleTop.setPosition(600, 180);
    obstacleBottom.setPosition(600, 420);
    obstacleLeft.setPosition(480, 300);
    obstacleRight.setPosition(720, 300);
    // To ensure obstacles are registered.
    runtimeScene.renderAndStep(1000 / 60);

    object.setPosition(360, 300);
    object.getBehavior(pathFindingName).moveTo(runtimeScene, 600, 300);
    expect(object.getBehavior(pathFindingName).pathFound()).to.be(false);
  });
};

// tests cases where every collisionMethod has the same behavior.
describe('gdjs.PathfindingRuntimeBehavior', function () {
  ['Legacy'].forEach((collisionMethod) => {
    describe(`(collisionMethod: ${collisionMethod}, `, function () {
      [false, true].forEach((allowDiagonals) => {
        describe(`(allowDiagonals: ${allowDiagonals})`, function () {
          doTestsCommonpathfindingruntimebehavior(
            collisionMethod,
            allowDiagonals
          );
        });
      });
    });
  });
});
