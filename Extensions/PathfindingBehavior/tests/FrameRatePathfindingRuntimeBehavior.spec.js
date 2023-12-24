// @ts-check
describe('gdjs.PathfindingRuntimeBehavior', function () {
  const epsilon = 1 / (2 << 16);
  // tests cases where every collisionMethod has the same behavior.
  let doCommonPathFindingTests = (collisionMethod) => {
    const pathFindingName = 'auto1';

    const createScene = (framePerSecond = 60) => {
      const runtimeGame = gdjs.getPixiRuntimeGame();
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
        usedResources: [],
      });
      setFramePerSecond(runtimeScene, framePerSecond);
      return runtimeScene;
    };
    const setFramePerSecond = (runtimeScene, framePerSecond) => {
      runtimeScene._timeManager.getElapsedTime = function () {
        return 1000 / framePerSecond;
      };
    };

    const addPlayer = (runtimeScene, allowDiagonals) => {
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
            collisionMethod: true,
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

    const getPathLength = (player) => {
      /** @type gdjs.PathfindingRuntimeBehavior */
      const behavior = player.getBehavior(pathFindingName);
      if (behavior.getNodeCount() < 2) {
        return 0;
      }
      let pathLength = 0;
      let previousNodeX = behavior.getNodeX(0);
      let previousNodeY = behavior.getNodeY(0);
      for (let index = 1; index < behavior.getNodeCount(); index++) {
        const nodeX = behavior.getNodeX(index);
        const nodeY = behavior.getNodeY(index);
        pathLength += Math.hypot(nodeX - previousNodeX, nodeY - previousNodeY);
        previousNodeX = nodeX;
        previousNodeY = nodeY;
      }
      return pathLength;
    };

    describe(`(allowDiagonals: true)`, function () {
      let runtimeScene;
      let player;

      beforeEach(function () {
        runtimeScene = createScene();
        const allowDiagonals = true;
        player = addPlayer(runtimeScene, allowDiagonals);
      });

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
            expect(getPathLength(player)).to.be.above(720 - 480 + 50);

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
    });
    describe(`(allowDiagonals: false)`, function () {
      let runtimeScene;
      let player;

      beforeEach(function () {
        runtimeScene = createScene();
        const allowDiagonals = false;
        player = addPlayer(runtimeScene, allowDiagonals);
      });

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
            expect(getPathLength(player)).to.be.above(720 - 480 + 100);

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
    });
  };

  ['Legacy'].forEach((collisionMethod) => {
    describe(`(collisionMethod: ${collisionMethod}, `, function () {
      doCommonPathFindingTests(collisionMethod);
    });
  });
});
