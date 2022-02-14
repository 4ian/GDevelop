// @ts-check
describe('gdjs.PathfindingRuntimeBehavior', function () {
  const epsilon = 1 / (2 << 16);
  // tests cases where every collisionMethod has the same behavior.
  let doCommonPathFindingTests = (collisionMethod, allowDiagonals) => {
    const pathFindingName = 'auto1';

    const createScene = (framePerSecond = 60) => {
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
      setFramePerSecond(runtimeScene, framePerSecond);
      return runtimeScene;
    };
    const setFramePerSecond = (runtimeScene, framePerSecond) => {
      runtimeScene._timeManager.getElapsedTime = function () {
        return 1000 / framePerSecond;
      };
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
        effects: [],
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
        effects: [],
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

    if (allowDiagonals) {
      [20, 30, 60, 120].forEach((framePerSecond) => {
        describe(`(${framePerSecond} fps)`, function () {
          it('can move on the path at the right speed', function () {
            setFramePerSecond(runtimeScene, framePerSecond);
            const obstacle = addObstacle(runtimeScene);

            obstacle.setPosition(600, 300);
            // To ensure obstacles are registered.
            runtimeScene.renderAndStep(1000 / framePerSecond);

            player.setPosition(480, 300);
            player.getBehavior(pathFindingName).moveTo(runtimeScene, 720, 300);
            expect(player.getBehavior(pathFindingName).pathFound()).to.be(true);
            expect(
              player.getBehavior(pathFindingName).getNodeCount()
            ).to.be.above(13);

            // Move on the path and stop before the last 1/10 of second.
            for (let i = 0; i < (framePerSecond * 17) / 10; i++) {
              runtimeScene.renderAndStep(1000 / framePerSecond);
              expect(
                player.getBehavior(pathFindingName).destinationReached()
              ).to.be(false);
            }
            // The position is the same no matter the frame rate.
            expect(player.getX()).to.be(720);
            expect(player.getY()).to.be.within(
              288.5786437626905 - epsilon,
              288.5786437626905 + epsilon
            );

            // Let 1/10 of second pass,
            // because the calculus interval is not the same for each case.
            for (let i = 0; i < framePerSecond / 10; i++) {
              runtimeScene.renderAndStep(1000 / framePerSecond);
            }
            // The destination is reached for every frame rate within 1/10 of second.
            expect(player.getX()).to.be(720);
            expect(player.getY()).to.be(300);
            expect(
              player.getBehavior(pathFindingName).destinationReached()
            ).to.be(true);
          });
        });
      });
    } else {
      [20, 30, 60, 120].forEach((framePerSecond) => {
        describe(`(${framePerSecond} fps)`, function () {
          it('can move on the path at the right speed', function () {
            setFramePerSecond(runtimeScene, framePerSecond);
            const obstacle = addObstacle(runtimeScene);

            obstacle.setPosition(600, 300);
            // To ensure obstacles are registered.
            runtimeScene.renderAndStep(1000 / framePerSecond);

            player.setPosition(480, 300);
            player.getBehavior(pathFindingName).moveTo(runtimeScene, 720, 300);
            expect(player.getBehavior(pathFindingName).pathFound()).to.be(true);
            expect(
              player.getBehavior(pathFindingName).getNodeCount()
            ).to.be.above(13);

            // Move on the path and stop before the last 1/10 of second.
            for (let i = 0; i < (framePerSecond * 20) / 10; i++) {
              runtimeScene.renderAndStep(1000 / framePerSecond);
              expect(
                player.getBehavior(pathFindingName).destinationReached()
              ).to.be(false);
            }
            expect(player.getX()).to.be(710);
            expect(player.getY()).to.be.within(300 - epsilon, 300 + epsilon);

            // Let 1/10 of second pass,
            // because the calculus interval is not the same for each case.
            for (let i = 0; i < (framePerSecond * 1) / 10; i++) {
              runtimeScene.renderAndStep(1000 / framePerSecond);
            }
            // The destination is reached for every frame rate within 1/10 of second.
            expect(player.getX()).to.be(720);
            expect(player.getY()).to.be(300);
            expect(
              player.getBehavior(pathFindingName).destinationReached()
            ).to.be(true);
          });
        });
      });
    }

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

  ['Legacy'].forEach((collisionMethod) => {
    describe(`(collisionMethod: ${collisionMethod}, `, function () {
      [false, true].forEach((allowDiagonals) => {
        describe(`(allowDiagonals: ${allowDiagonals})`, function () {
          doCommonPathFindingTests(collisionMethod, allowDiagonals);
        });
      });
    });
  });
});
