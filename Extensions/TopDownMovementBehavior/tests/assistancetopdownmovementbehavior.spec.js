// @ts-check
describe('gdjs.TopDownMovementRuntimeBehavior', function () {
  describe('Assistance', function () {
    const topDownName = 'auto1';

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
      const player = new gdjs.TestRuntimeObject(runtimeScene, {
        name: 'player',
        type: '',
        behaviors: [
          {
            type: 'TopDownMovementBehavior::TopDownMovementBehavior',
            name: 'auto1',
            // @ts-ignore - properties are not typed
            allowDiagonals: true,
            acceleration: 400,
            deceleration: 800,
            maxSpeed: 200,
            angularMaxSpeed: 180,
            rotateObject: false,
            angleOffset: 0,
            ignoreDefaultControls: true,
            movementAngleOffset: 0,
            enableAssistance: true,
            viewpoint: 'TopDown',
            customIsometryAngle: 30,
          },
        ],
      });
      player.setCustomWidthAndHeight(100, 100);
      runtimeScene.addObject(player);
      return player;
    };

    const addObstacle = (runtimeScene) => {
      const obstacle = new gdjs.TestRuntimeObject(runtimeScene, {
        name: 'obstacle',
        type: '',
        behaviors: [
          {
            type: 'TopDownMovementBehavior::TopDownObstacleBehavior',
            // @ts-ignore - properties are not typed
            slidingCornerSize: 50,
          },
        ],
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

    it('can move without any obstacle at all', function () {
      player.setPosition(200, 300);
      runtimeScene.renderAndStep(1000 / 60);

      for (let i = 0; i < 30; i++) {
        player.getBehavior(topDownName).simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
      }

      expect(player.getX()).to.be.above(200);
      expect(player.getY()).to.be(300);
    });

    it('can bypass an obstacle in the way (go right, left bottom corner)', function () {
      const obstacle = addObstacle(runtimeScene);
      obstacle.setPosition(400, 200);
      player.setPosition(
        obstacle.getX() - player.getWidth() - 100,
        obstacle.getY() + obstacle.getHeight() - 20
      );
      runtimeScene.renderAndStep(1000 / 60);

      for (let i = 0; i < 90; i++) {
        player.getBehavior(topDownName).simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
      }

      // The player bypassed the obstacle from below.
      expect(player.getX()).to.be.above(obstacle.getX());
      expect(player.getY()).to.be(obstacle.getY() + obstacle.getHeight());
    });

    it('can bypass an obstacle in the way with stick controls (go right, left bottom corner)', function () {
      const obstacle = addObstacle(runtimeScene);
      obstacle.setPosition(400, 200);
      player.setPosition(
        obstacle.getX() - player.getWidth() - 100,
        obstacle.getY() + obstacle.getHeight() - 20
      );
      runtimeScene.renderAndStep(1000 / 60);

      for (let i = 0; i < 90; i++) {
        player.getBehavior(topDownName).simulateStick(0, 1);
        runtimeScene.renderAndStep(1000 / 60);
      }

      // The player bypassed the obstacle from below.
      expect(player.getX()).to.be.above(obstacle.getX());
      expect(player.getY()).to.be(obstacle.getY() + obstacle.getHeight());
    });

    it('can bypass an obstacle in the way after a position change (go right, left bottom corner)', function () {
      const obstacle = addObstacle(runtimeScene);
      // Set the object at a random position...
      obstacle.setPosition(1024, 2048);
      player.setPosition(4096, 8192);
      runtimeScene.renderAndStep(1000 / 60);

      // ...to change there position
      obstacle.setPosition(400, 200);
      player.setPosition(
        obstacle.getX() - player.getWidth() - 100,
        obstacle.getY() + obstacle.getHeight() - 20
      );
      runtimeScene.renderAndStep(1000 / 60);

      for (let i = 0; i < 90; i++) {
        player.getBehavior(topDownName).simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
      }

      // The player bypassed the obstacle from below.
      expect(player.getX()).to.be.above(obstacle.getX());
      expect(player.getY()).to.be(obstacle.getY() + obstacle.getHeight());
    });

    it('can bypass an obstacle in the way after an obstacle dimension change (go right, left bottom corner)', function () {
      const obstacle = addObstacle(runtimeScene);
      obstacle.setPosition(400, 200);
      player.setPosition(
        obstacle.getX() - player.getWidth() - 100,
        obstacle.getY() + obstacle.getHeight() - 20
      );

      // set a random dimensions...
      obstacle.setCustomWidthAndHeight(10, 10);
      // this is the 1rst call so object are 10x10 initially
      runtimeScene.renderAndStep(1000 / 60);

      // and set back the right dimensions
      obstacle.setCustomWidthAndHeight(100, 100);
      runtimeScene.renderAndStep(1000 / 60);

      for (let i = 0; i < 90; i++) {
        player.getBehavior(topDownName).simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
      }

      // The player bypassed the obstacle from below.
      expect(player.getX()).to.be.above(obstacle.getX());
      expect(player.getY()).to.be(obstacle.getY() + obstacle.getHeight());
    });

    it('can bypass an obstacle in the way after a player dimension change (go right, left bottom corner)', function () {
      const obstacle = addObstacle(runtimeScene);
      obstacle.setPosition(400, 200);
      player.setPosition(
        obstacle.getX() - player.getWidth() - 100,
        obstacle.getY() + obstacle.getHeight() - 20
      );

      // set a random dimensions...
      player.setCustomWidthAndHeight(10, 10);
      // this is the 1rst call so object are 10x10 initially
      runtimeScene.renderAndStep(1000 / 60);

      // and set back the right dimensions
      player.setCustomWidthAndHeight(100, 100);
      runtimeScene.renderAndStep(1000 / 60);

      for (let i = 0; i < 90; i++) {
        player.getBehavior(topDownName).simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
      }

      // The player bypassed the obstacle from below.
      expect(player.getX()).to.be.above(obstacle.getX());
      expect(player.getY()).to.be(obstacle.getY() + obstacle.getHeight());
    });

    it('can bypass an obstacle in the way (go right, left top corner)', function () {
      const obstacle = addObstacle(runtimeScene);
      obstacle.setPosition(400, 200);
      player.setPosition(
        obstacle.getX() - player.getWidth() - 100,
        obstacle.getY() - player.getHeight() + 20
      );
      runtimeScene.renderAndStep(1000 / 60);

      for (let i = 0; i < 90; i++) {
        player.getBehavior(topDownName).simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
      }

      // The player bypassed the obstacle from above.
      expect(player.getX()).to.be.above(obstacle.getX());
      expect(player.getY()).to.be(obstacle.getY() - player.getHeight());
    });

    it('can bypass an obstacle in the way (go left, right bottom corner)', function () {
      const obstacle = addObstacle(runtimeScene);
      obstacle.setPosition(400, 200);
      player.setPosition(
        obstacle.getX() + obstacle.getWidth() + 100,
        obstacle.getY() + obstacle.getHeight() - 20
      );
      runtimeScene.renderAndStep(1000 / 60);

      for (let i = 0; i < 90; i++) {
        player.getBehavior(topDownName).simulateLeftKey();
        runtimeScene.renderAndStep(1000 / 60);
      }

      expect(player.getX()).to.be.below(obstacle.getX());
      expect(player.getY()).to.be(obstacle.getY() + obstacle.getHeight());
    });

    it('can bypass an obstacle in the way (go left, right top corner)', function () {
      const obstacle = addObstacle(runtimeScene);
      obstacle.setPosition(400, 200);
      player.setPosition(
        obstacle.getX() + obstacle.getWidth() + 100,
        obstacle.getY() - player.getHeight() + 20
      );
      runtimeScene.renderAndStep(1000 / 60);

      for (let i = 0; i < 90; i++) {
        player.getBehavior(topDownName).simulateLeftKey();
        runtimeScene.renderAndStep(1000 / 60);
      }

      expect(player.getX()).to.be.below(obstacle.getX());
      expect(player.getY()).to.be(obstacle.getY() - player.getHeight());
    });

    it('can bypass an obstacle in the way (go down, right top corner)', function () {
      const obstacle = addObstacle(runtimeScene);
      obstacle.setPosition(400, 200);
      player.setPosition(
        obstacle.getX() + obstacle.getWidth() - 20,
        obstacle.getY() - player.getHeight() - 100
      );
      runtimeScene.renderAndStep(1000 / 60);

      for (let i = 0; i < 90; i++) {
        player.getBehavior(topDownName).simulateDownKey();
        runtimeScene.renderAndStep(1000 / 60);
      }

      expect(player.getX()).to.be(obstacle.getX() + obstacle.getWidth());
      expect(player.getY()).to.be.above(obstacle.getY());
    });

    it('can bypass an obstacle in the way (go down, left top corner)', function () {
      const obstacle = addObstacle(runtimeScene);
      obstacle.setPosition(400, 200);
      player.setPosition(
        obstacle.getX() - player.getWidth() + 20,
        obstacle.getY() - player.getHeight() - 100
      );
      runtimeScene.renderAndStep(1000 / 60);

      for (let i = 0; i < 90; i++) {
        player.getBehavior(topDownName).simulateDownKey();
        runtimeScene.renderAndStep(1000 / 60);
      }

      expect(player.getX()).to.be(obstacle.getX() - player.getWidth());
      expect(player.getY()).to.be.above(obstacle.getY());
    });

    it('can bypass an obstacle in the way (go up, right bottom corner)', function () {
      const obstacle = addObstacle(runtimeScene);
      obstacle.setPosition(400, 200);
      player.setPosition(
        obstacle.getX() + obstacle.getWidth() - 20,
        obstacle.getY() + obstacle.getHeight() + 100
      );
      runtimeScene.renderAndStep(1000 / 60);

      for (let i = 0; i < 90; i++) {
        player.getBehavior(topDownName).simulateUpKey();
        runtimeScene.renderAndStep(1000 / 60);
      }

      expect(player.getX()).to.be(obstacle.getX() + obstacle.getWidth());
      expect(player.getY()).to.be.below(obstacle.getY());
    });

    it('can bypass an obstacle in the way (go up, left bottom corner)', function () {
      const obstacle = addObstacle(runtimeScene);
      obstacle.setPosition(400, 200);
      player.setPosition(
        obstacle.getX() - player.getWidth() + 20,
        obstacle.getY() + obstacle.getHeight() + 100
      );
      runtimeScene.renderAndStep(1000 / 60);

      for (let i = 0; i < 90; i++) {
        player.getBehavior(topDownName).simulateUpKey();
        runtimeScene.renderAndStep(1000 / 60);
      }

      expect(player.getX()).to.be(obstacle.getX() - player.getWidth());
      expect(player.getY()).to.be.below(obstacle.getY() + obstacle.getHeight());
    });

    it('can be stopped by an obstacle (go right)', function () {
      const obstacle = addObstacle(runtimeScene);
      obstacle.setPosition(400, 200);
      player.setPosition(
        obstacle.getX() - player.getWidth() - 100,
        obstacle.getY()
      );
      runtimeScene.renderAndStep(1000 / 60);

      for (let i = 0; i < 90; i++) {
        player.getBehavior(topDownName).simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
      }

      expect(player.getX()).to.be(obstacle.getX() - player.getWidth());
      expect(player.getY()).to.be(obstacle.getY());
    });

    it('can be stopped by an obstacle (go left)', function () {
      const obstacle = addObstacle(runtimeScene);
      obstacle.setPosition(400, 200);
      player.setPosition(
        obstacle.getX() + obstacle.getWidth() + 100,
        obstacle.getY()
      );
      runtimeScene.renderAndStep(1000 / 60);

      for (let i = 0; i < 90; i++) {
        player.getBehavior(topDownName).simulateLeftKey();
        runtimeScene.renderAndStep(1000 / 60);
      }

      expect(player.getX()).to.be(obstacle.getX() + obstacle.getWidth());
      expect(player.getY()).to.be(obstacle.getY());
    });

    it('can be stopped by an obstacle (go down)', function () {
      const obstacle = addObstacle(runtimeScene);
      obstacle.setPosition(400, 200);
      player.setPosition(
        obstacle.getX(),
        obstacle.getY() - player.getHeight() - 100
      );
      runtimeScene.renderAndStep(1000 / 60);

      for (let i = 0; i < 90; i++) {
        player.getBehavior(topDownName).simulateDownKey();
        runtimeScene.renderAndStep(1000 / 60);
      }

      expect(player.getX()).to.be(obstacle.getX());
      expect(player.getY()).to.be(obstacle.getY() - player.getHeight());
    });

    it('can be stopped by an obstacle (go up)', function () {
      const obstacle = addObstacle(runtimeScene);
      obstacle.setPosition(400, 200);
      player.setPosition(
        obstacle.getX(),
        obstacle.getY() + obstacle.getHeight() + 100
      );
      runtimeScene.renderAndStep(1000 / 60);

      for (let i = 0; i < 90; i++) {
        player.getBehavior(topDownName).simulateUpKey();
        runtimeScene.renderAndStep(1000 / 60);
      }

      expect(player.getX()).to.be(obstacle.getX());
      expect(player.getY()).to.be(obstacle.getY() + obstacle.getHeight());
    });

    it('must not be moved aside when pushing against 2 obstacles (go right)', function () {
      const obstacle = addObstacle(runtimeScene);
      const obstacle2 = addObstacle(runtimeScene);
      // put the player on the corner of both obstacles
      obstacle.setPosition(400, 140);
      obstacle2.setPosition(400, 260);
      const playerY = (obstacle.getY() + obstacle2.getY()) / 2;
      player.setPosition(obstacle.getX() - player.getWidth() - 100, playerY);
      runtimeScene.renderAndStep(1000 / 60);

      for (let i = 0; i < 90; i++) {
        player.getBehavior(topDownName).simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
      }

      expect(player.getX()).to.be(obstacle.getX() - player.getWidth());
      expect(player.getY()).to.be(playerY);
    });

    it('must not be moved aside when pushing against 2 obstacles (go left)', function () {
      const obstacle = addObstacle(runtimeScene);
      const obstacle2 = addObstacle(runtimeScene);
      // put the player on the corner of both obstacles
      obstacle.setPosition(400, 140);
      obstacle2.setPosition(400, 260);
      const playerY = (obstacle.getY() + obstacle2.getY()) / 2;
      player.setPosition(obstacle.getX() + obstacle.getWidth() + 100, playerY);
      runtimeScene.renderAndStep(1000 / 60);

      for (let i = 0; i < 90; i++) {
        player.getBehavior(topDownName).simulateLeftKey();
        runtimeScene.renderAndStep(1000 / 60);
      }

      expect(player.getX()).to.be(obstacle.getX() + obstacle.getWidth());
      expect(player.getY()).to.be(playerY);
    });

    it('must not be moved aside when pushing against 2 obstacles (go down)', function () {
      const obstacle = addObstacle(runtimeScene);
      const obstacle2 = addObstacle(runtimeScene);
      // put the player on the corner of both obstacles
      obstacle.setPosition(340, 200);
      obstacle2.setPosition(460, 200);
      const playerX = (obstacle.getX() + obstacle2.getX()) / 2;
      player.setPosition(playerX, obstacle.getY() - player.getHeight() - 100);
      runtimeScene.renderAndStep(1000 / 60);

      for (let i = 0; i < 90; i++) {
        player.getBehavior(topDownName).simulateDownKey();
        runtimeScene.renderAndStep(1000 / 60);
      }

      expect(player.getX()).to.be(playerX);
      expect(player.getY()).to.be(obstacle.getY() - player.getHeight());
    });

    it('must not be moved aside when pushing against 2 obstacles (go Up)', function () {
      const obstacle = addObstacle(runtimeScene);
      const obstacle2 = addObstacle(runtimeScene);
      // put the player on the corner of both obstacles
      obstacle.setPosition(340, 200);
      obstacle2.setPosition(460, 200);
      const playerX = (obstacle.getX() + obstacle2.getX()) / 2;
      player.setPosition(playerX, obstacle.getY() + obstacle.getHeight() + 100);
      runtimeScene.renderAndStep(1000 / 60);

      for (let i = 0; i < 90; i++) {
        player.getBehavior(topDownName).simulateUpKey();
        runtimeScene.renderAndStep(1000 / 60);
      }

      expect(player.getX()).to.be(playerX);
      expect(player.getY()).to.be(obstacle.getY() + obstacle.getHeight());
    });

    [false, true].forEach((playerIsGoingInDiagonal) => {
      it(`can go between 2 obstacles${
        playerIsGoingInDiagonal ? ' in diagonal' : ''
      } (go right, left bottom corner)`, function () {
        const obstacle = addObstacle(runtimeScene);
        const obstacle2 = addObstacle(runtimeScene);
        // put the player on the corner of both obstacles
        obstacle.setPosition(400, 100);
        obstacle2.setPosition(400, 300);
        player.setPosition(
          obstacle.getX() - player.getWidth() - 10,
          obstacle.getY() + obstacle.getHeight() - 40
        );
        runtimeScene.renderAndStep(1000 / 60);

        for (let i = 0; i < 80; i++) {
          player.getBehavior(topDownName).simulateRightKey();
          if (playerIsGoingInDiagonal) {
            player.getBehavior(topDownName).simulateDownKey();
          }
          runtimeScene.renderAndStep(1000 / 60);
        }

        expect(player.getX()).to.be.above(obstacle.getX());
        expect(player.getY()).to.be(obstacle.getY() + obstacle.getHeight());
      });

      it(`can go between 2 obstacles${
        playerIsGoingInDiagonal ? ' in diagonal' : ''
      } (go right, left top corner)`, function () {
        const obstacle = addObstacle(runtimeScene);
        const obstacle2 = addObstacle(runtimeScene);
        // put the player on the corner of both obstacles
        obstacle.setPosition(400, 100);
        obstacle2.setPosition(400, 300);
        player.setPosition(
          obstacle2.getX() - player.getWidth() - 10,
          obstacle2.getY() - player.getHeight() + 40
        );
        runtimeScene.renderAndStep(1000 / 60);

        for (let i = 0; i < 80; i++) {
          player.getBehavior(topDownName).simulateRightKey();
          if (playerIsGoingInDiagonal) {
            player.getBehavior(topDownName).simulateUpKey();
          }
          runtimeScene.renderAndStep(1000 / 60);
        }

        expect(player.getX()).to.be.above(obstacle2.getX());
        expect(player.getY()).to.be(obstacle2.getY() - player.getHeight());
      });

      it(`can go between 2 obstacles${
        playerIsGoingInDiagonal ? ' in diagonal' : ''
      } (go left, right bottom corner)`, function () {
        const obstacle = addObstacle(runtimeScene);
        const obstacle2 = addObstacle(runtimeScene);
        // put the player on the corner of both obstacles
        obstacle.setPosition(400, 100);
        obstacle2.setPosition(400, 300);
        player.setPosition(
          obstacle.getX() + obstacle.getWidth() + 10,
          obstacle.getY() + obstacle.getHeight() - 40
        );
        runtimeScene.renderAndStep(1000 / 60);

        for (let i = 0; i < 80; i++) {
          player.getBehavior(topDownName).simulateLeftKey();
          if (playerIsGoingInDiagonal) {
            player.getBehavior(topDownName).simulateDownKey();
          }
          runtimeScene.renderAndStep(1000 / 60);
        }

        expect(player.getX()).to.be.below(obstacle.getX());
        expect(player.getY()).to.be(obstacle.getY() + obstacle.getHeight());
      });

      it(`can go between 2 obstacles${
        playerIsGoingInDiagonal ? ' in diagonal' : ''
      } (go left, right top corner)`, function () {
        const obstacle = addObstacle(runtimeScene);
        const obstacle2 = addObstacle(runtimeScene);
        // put the player on the corner of both obstacles
        obstacle.setPosition(400, 100);
        obstacle2.setPosition(400, 300);
        player.setPosition(
          obstacle2.getX() + player.getWidth() + 10,
          obstacle2.getY() - player.getHeight() + 40
        );
        runtimeScene.renderAndStep(1000 / 60);

        for (let i = 0; i < 80; i++) {
          player.getBehavior(topDownName).simulateLeftKey();
          if (playerIsGoingInDiagonal) {
            player.getBehavior(topDownName).simulateUpKey();
          }
          runtimeScene.renderAndStep(1000 / 60);
        }

        expect(player.getX()).to.be.below(obstacle2.getX());
        expect(player.getY()).to.be(obstacle2.getY() - player.getHeight());
      });

      it(`can go between 2 obstacles${
        playerIsGoingInDiagonal ? ' in diagonal' : ''
      } (go down, right top corner)`, function () {
        const obstacle = addObstacle(runtimeScene);
        const obstacle2 = addObstacle(runtimeScene);
        // put the player on the corner of both obstacles
        obstacle.setPosition(300, 200);
        obstacle2.setPosition(500, 200);
        player.setPosition(
          obstacle.getX() + obstacle.getWidth() - 40,
          obstacle.getY() - player.getHeight() - 10
        );
        runtimeScene.renderAndStep(1000 / 60);

        for (let i = 0; i < 80; i++) {
          player.getBehavior(topDownName).simulateDownKey();
          if (playerIsGoingInDiagonal) {
            player.getBehavior(topDownName).simulateRightKey();
          }
          runtimeScene.renderAndStep(1000 / 60);
        }

        expect(player.getX()).to.be(obstacle.getX() + obstacle.getWidth());
        expect(player.getY()).to.be.above(obstacle.getY());
      });

      it(`can go between 2 obstacles${
        playerIsGoingInDiagonal ? ' in diagonal' : ''
      } (go down, left top corner)`, function () {
        const obstacle = addObstacle(runtimeScene);
        const obstacle2 = addObstacle(runtimeScene);
        // put the player on the corner of both obstacles
        obstacle.setPosition(300, 200);
        obstacle2.setPosition(500, 200);
        player.setPosition(
          obstacle2.getX() - player.getWidth() + 40,
          obstacle2.getY() - player.getHeight() - 10
        );
        runtimeScene.renderAndStep(1000 / 60);

        for (let i = 0; i < 80; i++) {
          player.getBehavior(topDownName).simulateDownKey();
          if (playerIsGoingInDiagonal) {
            player.getBehavior(topDownName).simulateLeftKey();
          }
          runtimeScene.renderAndStep(1000 / 60);
        }

        expect(player.getX()).to.be(obstacle2.getX() - player.getWidth());
        expect(player.getY()).to.be.above(obstacle.getY());
      });
    });

    it('can slide against an obstacles wall', function () {
      const obstacleX = 400;
      for (let y = 0; y < 10; y++) {
        const obstacle = addObstacle(runtimeScene);
        obstacle.setPosition(obstacleX, 200 + obstacle.getHeight() * y);
      }
      const playerX = obstacleX - player.getWidth();
      player.setPosition(playerX, 200);
      runtimeScene.renderAndStep(1000 / 60);

      for (let i = 0; i < 300; i++) {
        const playerLastY = player.getY();
        player.getBehavior(topDownName).simulateRightKey();
        player.getBehavior(topDownName).simulateDownKey();
        runtimeScene.renderAndStep(1000 / 60);

        expect(player.getX()).to.be(playerX);
        expect(player.getY()).to.be.above(playerLastY);
      }
      // reached the last obstacle
      expect(player.getY()).to.be.above(200 + 100 * 9);
    });

    it('must not bypass an obstacle if there is an other obstacle in the way before it can turn', function () {
      const obstacle = addObstacle(runtimeScene);
      const inTheWayObstacle = addObstacle(runtimeScene);
      obstacle.setPosition(400, 200);
      // a diagonal of 99x99 between them
      inTheWayObstacle.setPosition(301, 399);
      const playerY = obstacle.getY() + obstacle.getHeight() - 20;
      player.setPosition(obstacle.getX() - player.getWidth() - 100, playerY);
      runtimeScene.renderAndStep(1000 / 60);

      for (let i = 0; i < 90; i++) {
        player.getBehavior(topDownName).simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
      }

      expect(player.getX()).to.be(obstacle.getX() - obstacle.getWidth());
      expect(player.getY()).to.be(playerY);
    });

    it('can bypass an obstacle if there is an other obstacle near the way before it can turn', function () {
      const bypassDistance = 20;
      const obstacle = addObstacle(runtimeScene);
      const inTheWayObstacle = addObstacle(runtimeScene);
      obstacle.setPosition(400, 200);
      // a diagonal of 100x100 between them
      inTheWayObstacle.setPosition(300, 400);
      player.setPosition(
        obstacle.getX() - player.getWidth() - 100,
        obstacle.getY() + obstacle.getHeight() - bypassDistance
      );
      runtimeScene.renderAndStep(1000 / 60);

      for (let i = 0; i < 90; i++) {
        player.getBehavior(topDownName).simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
      }

      expect(player.getX()).to.be.above(obstacle.getX());
      expect(player.getY()).to.be(obstacle.getY() + obstacle.getHeight());
    });

    it('can bypass an obstacle if the bypass distance is shorter that the one possible in the right direction after the corner', function () {
      const bypassDistance = 20;
      const obstacle = addObstacle(runtimeScene);
      const inTheWayObstacle = addObstacle(runtimeScene);
      obstacle.setPosition(400, 200);
      // a right way the same length as the bypass way
      inTheWayObstacle.setPosition(400 + bypassDistance, 300);
      player.setPosition(
        obstacle.getX() - player.getWidth() - 100,
        obstacle.getY() + obstacle.getHeight() - bypassDistance
      );
      runtimeScene.renderAndStep(1000 / 60);

      for (let i = 0; i < 90; i++) {
        player.getBehavior(topDownName).simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
      }

      expect(player.getX()).to.be(
        inTheWayObstacle.getX() - inTheWayObstacle.getWidth()
      );
      expect(player.getY()).to.be(obstacle.getY() + obstacle.getHeight());
    });

    it('must not bypass an obstacle if the bypass distance is longer that the one possible in the right direction after the corner', function () {
      const bypassDistance = 20;
      const obstacle = addObstacle(runtimeScene);
      const inTheWayObstacle = addObstacle(runtimeScene);
      obstacle.setPosition(400, 200);
      // a right way shorter than the bypass way
      inTheWayObstacle.setPosition(400 + bypassDistance - 1, 300);
      const playerY = obstacle.getY() + obstacle.getHeight() - bypassDistance;
      player.setPosition(obstacle.getX() - player.getWidth() - 100, playerY);
      runtimeScene.renderAndStep(1000 / 60);

      for (let i = 0; i < 90; i++) {
        player.getBehavior(topDownName).simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
      }

      expect(player.getX()).to.be(obstacle.getX() - obstacle.getWidth());
      expect(player.getY()).to.be(playerY);
    });

    it('must only start to bypass an obstacle when the way is cleared if the inputs change', function () {
      const bypassDistance = 49;
      const obstacle = addObstacle(runtimeScene);
      const inTheWayObstacle = addObstacle(runtimeScene);
      obstacle.setPosition(400, 200);
      // a right way shorter than the bypass way
      inTheWayObstacle.setPosition(400 + bypassDistance - 1, 300);
      const playerY = obstacle.getY() + obstacle.getHeight() - bypassDistance;
      player.setPosition(obstacle.getX() - player.getWidth() - 100, playerY);
      runtimeScene.renderAndStep(1000 / 60);

      for (let i = 0; i < 50; i++) {
        player.getBehavior(topDownName).simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
      }

      expect(player.getX()).to.be(obstacle.getX() - obstacle.getWidth());
      expect(player.getY()).to.be(playerY);

      // move the obstacle out of the bypass way
      inTheWayObstacle.setPosition(1024, 2048);

      for (let i = 0; i < 10; i++) {
        player.getBehavior(topDownName).simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
      }
      // still no change
      expect(player.getX()).to.be(obstacle.getX() - obstacle.getWidth());
      expect(player.getY()).to.be(playerY);

      // right key is released
      runtimeScene.renderAndStep(1000 / 60);

      // press it again
      for (let i = 0; i < 60; i++) {
        player.getBehavior(topDownName).simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
      }
      // the object moved
      expect(player.getX()).to.be.above(obstacle.getX());
      expect(player.getY()).to.be(obstacle.getY() + obstacle.getHeight());
    });

    it('must continue to bypass an object when the key is hold even if an obstacle comes in the way', function () {
      const bypassDistance = 49;
      const obstacle = addObstacle(runtimeScene);
      obstacle.setPosition(400, 200);
      player.setPosition(
        obstacle.getX() - player.getWidth() - 100,
        obstacle.getY() + obstacle.getHeight() - bypassDistance
      );
      runtimeScene.renderAndStep(1000 / 60);

      for (let i = 0; i < 47; i++) {
        player.getBehavior(topDownName).simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
      }

      // the player is bypassing the obstacle
      expect(player.getX()).to.be(obstacle.getX() - player.getWidth());
      expect(player.getY()).to.be.within(
        obstacle.getY() + obstacle.getHeight() - (bypassDistance - 1),
        obstacle.getY() + obstacle.getHeight() - (bypassDistance * 1) / 2
      );

      const inTheWayObstacle = addObstacle(runtimeScene);
      // a right way shorter than the bypass way
      inTheWayObstacle.setPosition(
        obstacle.getX() + 1,
        obstacle.getY() + obstacle.getHeight()
      );

      // still holding the key
      for (let i = 0; i < 20; i++) {
        player.getBehavior(topDownName).simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
      }

      // the player continued its path
      // and is against inTheWayObstacle
      expect(player.getX()).to.be(
        inTheWayObstacle.getX() - inTheWayObstacle.getWidth()
      );
      expect(player.getY()).to.be(obstacle.getY() + obstacle.getHeight());
    });

    it('must stop to bypass an object when the key is release and pressed again if an obstacle came in the way', function () {
      const bypassDistance = 49;
      const obstacle = addObstacle(runtimeScene);
      obstacle.setPosition(400, 200);
      player.setPosition(
        obstacle.getX() - player.getWidth() - 100,
        obstacle.getY() + obstacle.getHeight() - bypassDistance
      );
      runtimeScene.renderAndStep(1000 / 60);

      for (let i = 0; i < 47; i++) {
        player.getBehavior(topDownName).simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
      }

      // the player is bypassing the obstacle
      expect(player.getX()).to.be(obstacle.getX() - player.getWidth());
      expect(player.getY()).to.be.within(
        obstacle.getY() + obstacle.getHeight() - (bypassDistance - 1),
        obstacle.getY() + obstacle.getHeight() - (bypassDistance * 1) / 2
      );

      const inTheWayObstacle = addObstacle(runtimeScene);
      // a right way shorter than the bypass way
      inTheWayObstacle.setPosition(
        obstacle.getX() + 1,
        obstacle.getY() + obstacle.getHeight()
      );

      // release the key
      for (let i = 0; i < 20; i++) {
        runtimeScene.renderAndStep(1000 / 60);
      }
      // the player is still in the bypass way
      expect(player.getX()).to.be(obstacle.getX() - player.getWidth());
      expect(player.getY()).to.be.below(
        obstacle.getY() + obstacle.getHeight() - (bypassDistance * 1) / 4
      );

      const playerX = player.getX();
      const playerY = player.getY();

      // press the key again
      for (let i = 0; i < 10; i++) {
        player.getBehavior(topDownName).simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
      }

      // the player didn't moved
      expect(player.getX()).to.be(playerX);
      expect(player.getY()).to.be(playerY);
    });
  });
});
