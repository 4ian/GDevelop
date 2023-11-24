// @ts-check
describe('gdjs.TopDownMovementRuntimeBehavior', function () {
  const epsilon = 1 / (2 << 8);
  const topDownName = 'auto1';

  const createScene = (timeDelta = 1000 / 60) => {
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
    runtimeScene._timeManager.getElapsedTime = function () {
      return timeDelta;
    };
    return runtimeScene;
  };

  const addPlayer = (runtimeScene, allowDiagonals) => {
    const player = new gdjs.TestRuntimeObject(runtimeScene, {
      name: 'player',
      type: '',
      effects: [],
      behaviors: [
        {
          type: 'TopDownMovementBehavior::TopDownMovementBehavior',
          name: 'auto1',
          // @ts-ignore - properties are not typed
          allowDiagonals: allowDiagonals,
          acceleration: 400,
          deceleration: 800,
          maxSpeed: 200,
          angularMaxSpeed: 180,
          rotateObject: false,
          angleOffset: 0,
          ignoreDefaultControls: true,
          movementAngleOffset: 0,
          viewpoint: 'TopDown',
          customIsometryAngle: 30,
        },
      ],
    });
    player.setCustomWidthAndHeight(100, 100);
    runtimeScene.addObject(player);
    return player;
  };

  [true, false].forEach((allowDiagonals) => {
    describe(`(allowDiagonals: ${allowDiagonals},`, function () {
      let runtimeScene;
      let player;
      beforeEach(function () {
        runtimeScene = createScene();
        player = addPlayer(runtimeScene, allowDiagonals);
      });

      ['1key', '3keys', 'stick'].forEach((inputMethod) => {
        describe(`inputMethod: ${inputMethod})`, function () {
          it('can move right', function () {
            player.setPosition(200, 300);
            runtimeScene.renderAndStep(1000 / 60);

            for (let i = 0; i < 20; i++) {
              if (inputMethod === 'stick') {
                player.getBehavior(topDownName).simulateStick(0, 1);
              } else if (inputMethod === '1key') {
                player.getBehavior(topDownName).simulateRightKey();
              } else if (inputMethod === '3keys') {
                player.getBehavior(topDownName).simulateRightKey();
                player.getBehavior(topDownName).simulateUpKey();
                player.getBehavior(topDownName).simulateDownKey();
              }
              runtimeScene.renderAndStep(1000 / 60);
              expect(
                player.getBehavior(topDownName).getXVelocity()
              ).to.be.above(0);
              expect(player.getBehavior(topDownName).getYVelocity()).to.be(0);
            }

            expect(player.getX()).to.be.above(200 + 20);
            expect(player.getY()).to.be(300);
          });

          it('can move left', function () {
            player.setPosition(200, 300);
            runtimeScene.renderAndStep(1000 / 60);

            for (let i = 0; i < 20; i++) {
              if (inputMethod === 'stick') {
                player.getBehavior(topDownName).simulateStick(180, 1);
              } else if (inputMethod === '1key') {
                player.getBehavior(topDownName).simulateLeftKey();
              } else if (inputMethod === '3keys') {
                player.getBehavior(topDownName).simulateLeftKey();
                player.getBehavior(topDownName).simulateDownKey();
                player.getBehavior(topDownName).simulateUpKey();
              }
              runtimeScene.renderAndStep(1000 / 60);
              expect(
                player.getBehavior(topDownName).getXVelocity()
              ).to.be.below(0);
              expect(player.getBehavior(topDownName).getYVelocity()).to.be(0);
            }

            expect(player.getX()).to.be.below(200 - 20);
            expect(player.getY()).to.be(300);
          });

          it('can move down', function () {
            player.setPosition(200, 300);
            runtimeScene.renderAndStep(1000 / 60);

            for (let i = 0; i < 20; i++) {
              if (inputMethod === 'stick') {
                player.getBehavior(topDownName).simulateStick(90, 1);
              } else if (inputMethod === '1key') {
                player.getBehavior(topDownName).simulateDownKey();
              } else if (inputMethod === '3keys') {
                player.getBehavior(topDownName).simulateDownKey();
                player.getBehavior(topDownName).simulateRightKey();
                player.getBehavior(topDownName).simulateLeftKey();
              }
              runtimeScene.renderAndStep(1000 / 60);
              expect(player.getBehavior(topDownName).getXVelocity()).to.be(0);
              expect(
                player.getBehavior(topDownName).getYVelocity()
              ).to.be.above(0);
            }

            expect(player.getX()).to.be(200);
            expect(player.getY()).to.be.above(300 + 20);
          });

          it('can move up', function () {
            player.setPosition(200, 300);
            runtimeScene.renderAndStep(1000 / 60);

            for (let i = 0; i < 20; i++) {
              if (inputMethod === 'stick') {
                player.getBehavior(topDownName).simulateStick(270, 1);
              } else if (inputMethod === '1key') {
                player.getBehavior(topDownName).simulateUpKey();
              } else if (inputMethod === '3keys') {
                player.getBehavior(topDownName).simulateUpKey();
                player.getBehavior(topDownName).simulateRightKey();
                player.getBehavior(topDownName).simulateLeftKey();
              }
              runtimeScene.renderAndStep(1000 / 60);
              expect(player.getBehavior(topDownName).getXVelocity()).to.be(0);
              expect(
                player.getBehavior(topDownName).getYVelocity()
              ).to.be.below(0);
            }

            expect(player.getX()).to.be(200);
            expect(player.getY()).to.be.below(300 - 20);
          });
        });
      });
    });
  });

  describe('(allowDiagonals: true,', function () {
    let runtimeScene;
    let player;
    beforeEach(function () {
      runtimeScene = createScene();
      player = addPlayer(runtimeScene, true);
    });
    ['2keys', 'stick'].forEach((inputMethod) => {
      describe(`inputMethod: ${inputMethod},`, function () {
        it('can move right and down', function () {
          player.setPosition(200, 300);
          runtimeScene.renderAndStep(1000 / 60);

          for (let i = 0; i < 20; i++) {
            if (inputMethod === 'stick') {
              player.getBehavior(topDownName).simulateStick(45, 1);
            } else if (inputMethod === '2keys') {
              player.getBehavior(topDownName).simulateRightKey();
              player.getBehavior(topDownName).simulateDownKey();
            }
            runtimeScene.renderAndStep(1000 / 60);
          }

          expect(player.getX()).to.be.above(200 + 10);
          expect(player.getY()).to.be.above(300 + 10);
        });

        it('can move right and up', function () {
          player.setPosition(200, 300);
          runtimeScene.renderAndStep(1000 / 60);

          for (let i = 0; i < 20; i++) {
            if (inputMethod === 'stick') {
              player.getBehavior(topDownName).simulateStick(315, 1);
            } else if (inputMethod === '2keys') {
              player.getBehavior(topDownName).simulateRightKey();
              player.getBehavior(topDownName).simulateUpKey();
            }
            runtimeScene.renderAndStep(1000 / 60);
          }

          expect(player.getX()).to.be.above(200 + 10);
          expect(player.getY()).to.be.below(300 - 10);
        });

        it('can move left and down', function () {
          player.setPosition(200, 300);
          runtimeScene.renderAndStep(1000 / 60);

          for (let i = 0; i < 20; i++) {
            if (inputMethod === 'stick') {
              player.getBehavior(topDownName).simulateStick(135, 1);
            } else if (inputMethod === '2keys') {
              player.getBehavior(topDownName).simulateLeftKey();
              player.getBehavior(topDownName).simulateDownKey();
            }
            runtimeScene.renderAndStep(1000 / 60);
          }

          expect(player.getX()).to.be.below(200 - 10);
          expect(player.getY()).to.be.above(300 + 10);
        });

        it('can move left and up', function () {
          player.setPosition(200, 300);
          runtimeScene.renderAndStep(1000 / 60);

          for (let i = 0; i < 20; i++) {
            if (inputMethod === 'stick') {
              player.getBehavior(topDownName).simulateStick(225, 1);
            } else if (inputMethod === '2keys') {
              player.getBehavior(topDownName).simulateLeftKey();
              player.getBehavior(topDownName).simulateUpKey();
            }
            runtimeScene.renderAndStep(1000 / 60);
          }

          expect(player.getX()).to.be.below(200 - 10);
          expect(player.getY()).to.be.below(300 - 10);
        });
      });
    });
  });

  describe('(allowDiagonals: false,', function () {
    let runtimeScene;
    let player;
    beforeEach(function () {
      runtimeScene = createScene();
      player = addPlayer(runtimeScene, false);
    });

    describe('inputMethod: 2keys)', function () {
      ['Up', 'Down'].forEach((firstKey) => {
        it(`move according to the last key pressed (first ${firstKey}, then Right)`, function () {
          player.setPosition(200, 300);
          runtimeScene.renderAndStep(1000 / 60);

          // first only press one key
          player.getBehavior(topDownName).simulateControl(firstKey);
          runtimeScene.renderAndStep(1000 / 60);

          const playerX = player.getX();
          const playerY = player.getY();

          // then also right
          for (let i = 0; i < 20; i++) {
            player.getBehavior(topDownName).simulateRightKey();
            player.getBehavior(topDownName).simulateControl(firstKey);
            runtimeScene.renderAndStep(1000 / 60);
          }

          // last key win, move right
          expect(player.getX()).to.be.above(playerX + 20);
          // inertia
          expect(player.getY()).to.be.within(playerY - 3, playerY + 3);
        });

        it(`move according to the last key pressed (first ${firstKey}, then Left)`, function () {
          player.setPosition(200, 300);
          runtimeScene.renderAndStep(1000 / 60);

          // first only press one key
          player.getBehavior(topDownName).simulateControl(firstKey);
          runtimeScene.renderAndStep(1000 / 60);

          const playerX = player.getX();
          const playerY = player.getY();

          // then also left
          for (let i = 0; i < 20; i++) {
            player.getBehavior(topDownName).simulateLeftKey();
            player.getBehavior(topDownName).simulateControl(firstKey);
            runtimeScene.renderAndStep(1000 / 60);
          }

          // last key win, move left
          expect(player.getX()).to.be.below(playerX - 20);
          // inertia
          expect(player.getY()).to.be.within(playerY - 3, playerY + 3);
        });
      });

      ['Left', 'Right'].forEach((firstKey) => {
        it(`move according to the last key pressed (first ${firstKey}, then Down)`, function () {
          player.setPosition(200, 300);
          runtimeScene.renderAndStep(1000 / 60);

          // first only press one key
          player.getBehavior(topDownName).simulateControl(firstKey);
          runtimeScene.renderAndStep(1000 / 60);

          const playerX = player.getX();
          const playerY = player.getY();

          // then also down
          for (let i = 0; i < 20; i++) {
            player.getBehavior(topDownName).simulateDownKey();
            player.getBehavior(topDownName).simulateControl(firstKey);
            runtimeScene.renderAndStep(1000 / 60);
          }

          // inertia
          expect(player.getX()).to.be.within(playerX - 3, playerX + 3);
          // last key win, move down
          expect(player.getY()).to.be.above(playerY + 20);
        });

        it(`move according to the last key pressed (first ${firstKey}, then Up)`, function () {
          player.setPosition(200, 300);
          runtimeScene.renderAndStep(1000 / 60);

          // first only press one key
          player.getBehavior(topDownName).simulateControl(firstKey);
          runtimeScene.renderAndStep(1000 / 60);

          const playerX = player.getX();
          const playerY = player.getY();

          // then also up
          for (let i = 0; i < 20; i++) {
            player.getBehavior(topDownName).simulateUpKey();
            player.getBehavior(topDownName).simulateControl(firstKey);
            runtimeScene.renderAndStep(1000 / 60);
          }

          // inertia
          expect(player.getX()).to.be.within(playerX - 3, playerX + 3);
          // last key win, move up
          expect(player.getY()).to.be.below(playerY - 20);
        });
      });
    });

    describe('inputMethod: stick)', function () {
      [315, 44, 44 + 360, 44 - 360].forEach((angle) => {
        it(`can move Right with the stick at ${angle}°`, function () {
          player.setPosition(200, 300);
          runtimeScene.renderAndStep(1000 / 60);

          for (let i = 0; i < 20; i++) {
            player.getBehavior(topDownName).simulateStick(angle, 1);
            runtimeScene.renderAndStep(1000 / 60);
          }

          expect(player.getX()).to.be.above(200 + 20);
          expect(player.getY()).to.be(300);
        });
      });

      [45, 134].forEach((angle) => {
        it(`can move Down with the stick at ${angle}°`, function () {
          player.setPosition(200, 300);
          runtimeScene.renderAndStep(1000 / 60);

          for (let i = 0; i < 20; i++) {
            player.getBehavior(topDownName).simulateStick(angle, 1);
            runtimeScene.renderAndStep(1000 / 60);
          }

          expect(player.getX()).to.be(200);
          expect(player.getY()).to.be.above(300 + 20);
        });
      });

      [135, 224].forEach((angle) => {
        it(`can move Left with the stick at ${angle}°`, function () {
          player.setPosition(200, 300);
          runtimeScene.renderAndStep(1000 / 60);

          for (let i = 0; i < 20; i++) {
            player.getBehavior(topDownName).simulateStick(angle, 1);
            runtimeScene.renderAndStep(1000 / 60);
          }

          expect(player.getX()).to.be.below(200 - 20);
          expect(player.getY()).to.be(300);
        });
      });

      [225, 314].forEach((angle) => {
        it(`can move Up with the stick at ${angle}°`, function () {
          player.setPosition(200, 300);
          runtimeScene.renderAndStep(1000 / 60);

          for (let i = 0; i < 20; i++) {
            player.getBehavior(topDownName).simulateStick(angle, 1);
            runtimeScene.renderAndStep(1000 / 60);
          }

          expect(player.getX()).to.be(200);
          expect(player.getY()).to.be.below(300 - 20);
        });
      });
    });
  });

  [20, 30, 60, 120].forEach((framesPerSecond) => {
    describe(`(frames per second: ${framesPerSecond})`, function () {
      let runtimeScene;
      let player;
      beforeEach(function () {
        runtimeScene = createScene(1000 / framesPerSecond);
        player = addPlayer(runtimeScene, true);
      });

      it('moves the same distance', function () {
        player.setPosition(200, 300);
        runtimeScene.renderAndStep(1000 / 60);

        // It takes 0,5 second to reach the maximum speed because
        // the acceleration is 400 and maxSpeed is 200.
        for (let i = 0; i < framesPerSecond / 2; i++) {
          player.getBehavior(topDownName).simulateRightKey();
          runtimeScene.renderAndStep(1000 / framesPerSecond);
        }
        expect(player.getX()).to.be.within(250 - epsilon, 250 + epsilon);
      });
    });
  });
});
