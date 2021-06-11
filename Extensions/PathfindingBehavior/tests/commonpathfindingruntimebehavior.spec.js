// @ts-check
describe('gdjs.PathfindingRuntimeBehavior', function () {
  // tests cases where every collisionMethod has the same behavior.
  let doCommonPathFindingTests = (collisionMethod, allowDiagonals) => {
    const pathFindingName = 'auto1';

    const createScene = () => {
      const runtimeGame = new gdjs.RuntimeGame({
        variables: [],
        // @ts-ignore - missing properties.
        properties: { windowWidth: 800, windowHeight: 600 },
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
        behaviorsSharedData: [],
        objects: [],
        instances: [],
      });
      runtimeScene._timeManager.getElapsedTime = function () {
        return (1 / 60) * 1000;
      };
      return runtimeScene;
    };

    const addPlayer = (runtimeScene) => {
      const player = new gdjs.RuntimeObject(runtimeScene, {
        name: 'player',
        type: '',
        behaviors: [
          {
            type: 'PathfindingBehavior::PathfindingBehavior',
            name: 'auto1',
            // @ts-ignore - properties are not typed
            allowDiagonals: allowDiagonals,
            acceleration: 400,
            maxSpeed: 200,
            angularMaxSpeed: 180,
            rotateObject: false,
            angleOffset: 0,
            cellWidth: 20,
            cellHeight: 20,
            extraBorder: 0,
            collisionMethod: collisionMethod,
          },
        ],
      });
      player.getWidth = function () {
        return 90;
      };
      player.getHeight = function () {
        return 90;
      };
      runtimeScene.addObject(player);
      return player;
    };

    const addObstacle = (runtimeScene) => {
      const obstacle = new gdjs.RuntimeObject(runtimeScene, {
        name: 'obstacle',
        type: '',
        behaviors: [
          {
            type: 'PathfindingBehavior::PathfindingObstacleBehavior',
            // @ts-ignore - properties are not typed
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

    let runtimeScene;
    let player;
    beforeEach(function () {
      runtimeScene = createScene();
      player = addPlayer(runtimeScene);
    });

    it('can find a path without any obstacle at all', function () {
      player.setPosition(480, 300);
      player.getBehavior(pathFindingName).moveTo(runtimeScene, 720, 300);
      expect(player.getBehavior(pathFindingName).pathFound()).to.be(true);
      expect(player.getBehavior(pathFindingName).getNodeCount()).to.be(13);
    });

    it('can find a path without any obstacle in the way', function () {
      const obstacle = addObstacle(runtimeScene);

      obstacle.setPosition(100, 100);
      // To ensure obstacles are registered.
      runtimeScene.renderAndStep(1000 / 60);

      player.setPosition(480, 300);
      player.getBehavior(pathFindingName).moveTo(runtimeScene, 720, 300);
      expect(player.getBehavior(pathFindingName).pathFound()).to.be(true);
      expect(player.getBehavior(pathFindingName).getNodeCount()).to.be(13);
    });

    it("mustn't find a path to the obstacle inside", function () {
      const obstacle = addObstacle(runtimeScene);

      obstacle.setPosition(600, 300);
      // To ensure obstacles are registered.
      runtimeScene.renderAndStep(1000 / 60);

      player.setPosition(480, 300);
      player.getBehavior(pathFindingName).moveTo(runtimeScene, 650, 350);
      expect(player.getBehavior(pathFindingName).pathFound()).to.be(false);
    });

    it('can find a path with an obstacle in the way', function () {
      const obstacle = addObstacle(runtimeScene);

      obstacle.setPosition(600, 300);
      // To ensure obstacles are registered.
      runtimeScene.renderAndStep(1000 / 60);

      player.setPosition(480, 300);
      player.getBehavior(pathFindingName).moveTo(runtimeScene, 720, 300);
      expect(player.getBehavior(pathFindingName).pathFound()).to.be(true);
      expect(player.getBehavior(pathFindingName).getNodeCount()).to.be.above(
        13
      );
    });

    it('can find a path between 2 obstacles', function () {
      const obstacleTop = addObstacle(runtimeScene);
      const obstacleBottom = addObstacle(runtimeScene);

      obstacleTop.setPosition(600, 180);
      obstacleBottom.setPosition(600, 420);
      // To ensure obstacles are registered.
      runtimeScene.renderAndStep(1000 / 60);

      player.setPosition(480, 300);
      player.getBehavior(pathFindingName).moveTo(runtimeScene, 720, 300);
      expect(player.getBehavior(pathFindingName).pathFound()).to.be(true);
      expect(player.getBehavior(pathFindingName).getNodeCount()).to.be(13);
    });

    it("mustn't find a path to a closed room", function () {
      const obstacleTop = addObstacle(runtimeScene);
      const obstacleBottom = addObstacle(runtimeScene);
      const obstacleLeft = addObstacle(runtimeScene);
      const obstacleRight = addObstacle(runtimeScene);

      obstacleTop.setPosition(600, 180);
      obstacleBottom.setPosition(600, 420);
      obstacleLeft.setPosition(480, 300);
      obstacleRight.setPosition(720, 300);
      // To ensure obstacles are registered.
      runtimeScene.renderAndStep(1000 / 60);

      player.setPosition(360, 300);
      player.getBehavior(pathFindingName).moveTo(runtimeScene, 600, 300);
      expect(player.getBehavior(pathFindingName).pathFound()).to.be(false);
    });
  };

  ['Legacy', 'AABB', 'HitBoxes'].forEach((collisionMethod) => {
    describe(`(collisionMethod: ${collisionMethod}, `, function () {
      [false, true].forEach((allowDiagonals) => {
        describe(`(allowDiagonals: ${allowDiagonals})`, function () {
          doCommonPathFindingTests(collisionMethod, allowDiagonals);
        });
      });
    });
  });
});
