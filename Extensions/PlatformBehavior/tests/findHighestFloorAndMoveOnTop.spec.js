describe(`gdjs.PlatformerObjectRuntimeBehavior.findHighestFloorAndMoveOnTop`, function () {
  const makeTestRuntimeScene = () => {
    const runtimeGame = gdjs.getPixiRuntimeGame();
    const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
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
    return runtimeScene;
  };

  const addCharacter = (runtimeScene) => {
    const character = new gdjs.TestRuntimeObject(runtimeScene, {
      name: 'obj1',
      type: '',
      behaviors: [
        {
          type: 'PlatformBehavior::PlatformerObjectBehavior',
          name: 'auto1',
          gravity: 900,
          maxFallingSpeed: 1500,
          acceleration: 500,
          deceleration: 1500,
          maxSpeed: 500,
          jumpSpeed: 1500,
          canGrabPlatforms: true,
          ignoreDefaultControls: true,
          slopeMaxAngle: 60,
          useLegacyTrajectory: false,
        },
      ],
      effects: [],
    });
    character.setCustomWidthAndHeight(100, 100);
    runtimeScene.addObject(character);
    return character;
  };

  const addPlatform = (runtimeScene, collisionMask) => {
    const platform = new gdjs.TestSpriteRuntimeObject(runtimeScene, {
      name: 'platform',
      type: '',
      behaviors: [
        {
          type: 'PlatformBehavior::PlatformBehavior',
          name: 'Platform',
          canBeGrabbed: true,
        },
      ],
      effects: [],
      animations: [
        {
          name: 'animation',
          directions: [
            {
              sprites: [
                {
                  originPoint: { x: 0, y: 0 },
                  centerPoint: { x: 50, y: 50 },
                  points: [
                    { name: 'Center', x: 0, y: 0 },
                    { name: 'Origin', x: 50, y: 50 },
                  ],
                  hasCustomCollisionMask: true,
                  customCollisionMask: collisionMask,
                },
              ],
            },
          ],
        },
      ],
    });
    runtimeScene.addObject(platform);
    platform.setUnscaledWidthAndHeight(100, 100);
    platform.setCustomWidthAndHeight(100, 100);

    return platform;
  };

  const checkMoveOn = (
    characterBehavior,
    platformBehavior,
    upwardDeltaY,
    downwardDeltaY
  ) => {
    const result = characterBehavior._findHighestFloorAndMoveOnTop(
      [platformBehavior],
      upwardDeltaY,
      downwardDeltaY
    );
    expect(result.highestGround).to.be(platformBehavior);
  };

  const checkNoFloor = (
    characterBehavior,
    platformBehavior,
    upwardDeltaY,
    downwardDeltaY
  ) => {
    const oldY = characterBehavior.owner.getY();
    const result = characterBehavior._findHighestFloorAndMoveOnTop(
      [platformBehavior],
      upwardDeltaY,
      downwardDeltaY
    );
    expect(result.highestGround).to.be(null);
    expect(result.isCollidingAnyPlatform).to.be(false);
    expect(characterBehavior.owner.getY()).to.be(oldY);
  };

  const checkObstacle = (
    characterBehavior,
    platformBehavior,
    upwardDeltaY,
    downwardDeltaY
  ) => {
    const oldY = characterBehavior.owner.getY();
    const result = characterBehavior._findHighestFloorAndMoveOnTop(
      [platformBehavior],
      upwardDeltaY,
      downwardDeltaY
    );
    expect(result.highestGround).to.be(null);
    expect(result.isCollidingAnyPlatform).to.be(true);
    expect(characterBehavior.owner.getY()).to.be(oldY);
  };

  [false, true].forEach((swapVerticesOrder) => {
    describe(`(swapVertexOrder: ${swapVerticesOrder})`, function () {
      const collisionMasks = {
        square: [
          [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            { x: 100, y: 100 },
            { x: 0, y: 100 },
          ],
        ],
        bottomLeftTriangle: [
          [
            { x: 0, y: 0 },
            { x: 0, y: 100 },
            { x: 100, y: 100 },
          ],
        ],
        bottomRightTriangle: [
          [
            { x: 100, y: 0 },
            { x: 0, y: 100 },
            { x: 100, y: 100 },
          ],
        ],
        topRightTriangle: [
          [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            { x: 100, y: 100 },
          ],
        ],
        topLeftTriangle: [
          [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            { x: 0, y: 100 },
          ],
        ],
        topLeftTriangleWithLowEdge: [
          [
            { x: -1, y: 100 },
            { x: -1, y: 0 },
            { x: 100, y: 0 },
            { x: 0, y: 100 },
          ],
        ],
        bottomTriangle: [
          [
            { x: 50, y: 0 },
            { x: 0, y: 100 },
            { x: 100, y: 100 },
          ],
        ],
        topTriangle: [
          [
            { x: 50, y: 100 },
            { x: 0, y: 0 },
            { x: 100, y: 0 },
          ],
        ],
        leftTriangle: [
          [
            { x: 100, y: 50 },
            { x: 0, y: 0 },
            { x: 0, y: 100 },
          ],
        ],
        rightTriangle: [
          [
            { x: 0, y: 50 },
            { x: 100, y: 0 },
            { x: 100, y: 100 },
          ],
        ],
        horizontalTunnel: [
          [
            { x: 0, y: 0 },
            { x: 0, y: 25 },
            { x: 100, y: 25 },
            { x: 100, y: 0 },
          ],
          [
            { x: 0, y: 75 },
            { x: 0, y: 100 },
            { x: 100, y: 100 },
            { x: 100, y: 75 },
          ],
        ],
        verticalTunnel: [
          [
            { x: 25, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 100 },
            { x: 25, y: 100 },
          ],
          [
            { x: 75, y: 0 },
            { x: 100, y: 0 },
            { x: 100, y: 100 },
            { x: 75, y: 100 },
          ],
        ],
      };
      if (swapVerticesOrder) {
        for (const key in collisionMasks) {
          if (Object.hasOwnProperty.call(collisionMasks, key)) {
            collisionMasks[key] = collisionMasks[key].reverse();
          }
        }
      }

      [
        {
          description: '(An edge crossing from the left to the right)',
          mask: collisionMasks.square,
          position: [200, -100],
        },
        {
          description: '(A vertex inside and edges crossing at the bottom)',
          mask: collisionMasks.bottomTriangle,
          position: [200, -100],
        },
        {
          description: '(An edge crossing from the left to the bottom)',
          mask: collisionMasks.bottomLeftTriangle,
          position: [200, -200],
        },
        {
          description:
            '(An edge crossing from the left to the bottom with the vertex right on the left border)',
          mask: collisionMasks.bottomLeftTriangle,
          position: [300, -100],
        },
        {
          description: '(An edge crossing from the right to the bottom)',
          mask: collisionMasks.bottomRightTriangle,
          position: [200, -200],
        },
        {
          description:
            '(An edge crossing from the right to the bottom with the vertex right on the right border)',
          mask: collisionMasks.bottomRightTriangle,
          position: [100, -100],
        },
        {
          description: '(A vertex inside and edges crossing at the left)',
          mask: collisionMasks.leftTriangle,
          position: [1, -249.5],
        },
        {
          description: '(A vertex inside and edges crossing at the right)',
          mask: collisionMasks.rightTriangle,
          position: [399, -249.5],
        },
      ].forEach(({ description, mask, position }) => {
        describe(description, function () {
          const runtimeScene = makeTestRuntimeScene();
          const character = addCharacter(runtimeScene);
          const behavior = character.getBehavior('auto1');

          const platform = addPlatform(runtimeScene, mask);
          platform.setCustomWidthAndHeight(300, 300);
          platform.setPosition(position[0], position[1]);
          const platformBehavior = platform.getBehavior('Platform');
          const platformObstaclesManager = gdjs.PlatformObjectsManager.getManager(
            runtimeScene
          );
          platformObstaclesManager.addPlatform(platformBehavior);

          it('can detect a platform away downward', function () {
            character.setPosition(300, -210.1);
            checkNoFloor(behavior, platformBehavior, -10, 10);
          });

          it('can detect a floor to follow down', function () {
            character.setPosition(300, -210);
            checkMoveOn(behavior, platformBehavior, -10, 10);
            expect(character.getY()).to.be(-200);
          });

          it('can detect a floor when right on it', function () {
            character.setPosition(300, -200);
            checkMoveOn(behavior, platformBehavior, -10, 10);
            expect(character.getY()).to.be(-200);
          });

          it('can detect a floor to follow up', function () {
            character.setPosition(300, -190);
            checkMoveOn(behavior, platformBehavior, -10, 10);
            expect(character.getY()).to.be(-200);
          });

          it('can detect an obstacle a bit too high to follow', function () {
            character.setPosition(300, -189.9);
            checkObstacle(behavior, platformBehavior, -10, 10);
          });
        });
      });

      [
        {
          description: '(An edge crossing from the left to the right)',
          mask: collisionMasks.square,
          position: [200, -100],
        },
        {
          description: '(A vertex inside and edges crossing at the top)',
          mask: collisionMasks.topTriangle,
          position: [200, -100],
        },
        {
          description: '(An edge crossing from the left to the top)',
          mask: collisionMasks.topRightTriangle,
          position: [200, 0],
        },
        {
          description: '(An edge crossing from the right to the top)',
          mask: collisionMasks.topLeftTriangle,
          position: [200, 0],
        },
        {
          description: '(An edge crossing from the right to the top)',
          // An edge will be lower than the character (but not under).
          mask: collisionMasks.topLeftTriangleWithLowEdge,
          position: [180, 20],
        },
      ].forEach(({ description, mask, position }) => {
        describe(description, function () {
          const runtimeScene = makeTestRuntimeScene();
          const character = addCharacter(runtimeScene);
          const behavior = character.getBehavior('auto1');

          const platform = addPlatform(runtimeScene, mask);
          platform.setCustomWidthAndHeight(300, 300);
          platform.setPosition(position[0], position[1]);
          const platformBehavior = platform.getBehavior('Platform');
          const platformObstaclesManager = gdjs.PlatformObjectsManager.getManager(
            runtimeScene
          );
          platformObstaclesManager.addPlatform(platformBehavior);

          it('can detect an obstacle overlapping the top', function () {
            // -10 because the character can follow a platform downward.
            character.setPosition(300, 199.9 - 10);
            checkObstacle(behavior, platformBehavior, -10, 10);
          });

          it('can detect a platform away downward', function () {
            character.setPosition(300, 200 - 10);
            checkNoFloor(behavior, platformBehavior, -10, 10);
          });
        });
      });

      describe('(A platform with an hitbox under and another one above)', function () {
        const runtimeScene = makeTestRuntimeScene();
        const character = addCharacter(runtimeScene);
        const behavior = character.getBehavior('auto1');

        const platform = addPlatform(
          runtimeScene,
          collisionMasks.horizontalTunnel
        );
        platform.setCustomWidthAndHeight(200, 200);
        platform.setPosition(250, -250);
        const platformBehavior = platform.getBehavior('Platform');
        const platformObstaclesManager = gdjs.PlatformObjectsManager.getManager(
          runtimeScene
        );
        platformObstaclesManager.addPlatform(platformBehavior);

        it('can detect a tunnel ceiling', function () {
          character.setPosition(300, -210.1);
          checkObstacle(behavior, platformBehavior, -10, 10);
        });

        // The character won't collide the ceiling anymore when he follows the floor.
        // So, the ceiling should not be seen as an obstacle.
        // This can happen if a tunnel is going down
        it('can detect a floor to follow down', function () {
          character.setPosition(300, -210);
          checkMoveOn(behavior, platformBehavior, -10, 10);
          expect(character.getY()).to.be(-200);
        });

        it('can detect a floor when right on it', function () {
          character.setPosition(300, -200);
          checkMoveOn(behavior, platformBehavior, -10, 10);
          expect(character.getY()).to.be(-200);
        });

        it('can detect a floor to follow up', function () {
          character.setPosition(300, -190);
          checkMoveOn(behavior, platformBehavior, -10, 10);
          expect(character.getY()).to.be(-200);
        });

        it('can detect an obstacle a bit too high to follow', function () {
          character.setPosition(300, -189.9);
          checkObstacle(behavior, platformBehavior, -10, 10);
        });

        it('can detect a too thin horizontal tunnel', function () {
          platform.setCustomWidthAndHeight(200, 199.8);
          platform.setPosition(250, -250.1);

          character.setPosition(300, -200);
          checkObstacle(behavior, platformBehavior, -10, 10);
        });
      });

      describe('(A platform with an hitbox on the left and another one on the right)', function () {
        const runtimeScene = makeTestRuntimeScene();
        const character = addCharacter(runtimeScene);
        const behavior = character.getBehavior('auto1');
        const platform = addPlatform(
          runtimeScene,
          collisionMasks.verticalTunnel
        );
        const platformBehavior = platform.getBehavior('Platform');
        const platformObstaclesManager = gdjs.PlatformObjectsManager.getManager(
          runtimeScene
        );
        platformObstaclesManager.addPlatform(platformBehavior);

        it('can fell inside a vertical tunnel that fit the character', function () {
          platform.setCustomWidthAndHeight(200, 200);
          platform.setPosition(250, -250);

          character.setPosition(300, -200);
          checkNoFloor(behavior, platformBehavior, -10, 10);
        });

        it('can fell inside a vertical tunnel', function () {
          platform.setCustomWidthAndHeight(200.2, 200);
          platform.setPosition(249.9, -250);

          character.setPosition(300, -200);
          checkNoFloor(behavior, platformBehavior, -10, 10);
        });

        it('can detect a too thin vertical tunnel', function () {
          platform.setCustomWidthAndHeight(199.8, 200);
          platform.setPosition(250.1, -250);

          character.setPosition(300, -200);
          checkObstacle(behavior, platformBehavior, -10, 10);
        });
      });

      describe('(A platform sharing a vertex with the character})', function () {
        const runtimeScene = makeTestRuntimeScene();
        const character = addCharacter(runtimeScene);
        const behavior = character.getBehavior('auto1');

        const platform = addPlatform(runtimeScene, collisionMasks.square);
        const platformBehavior = platform.getBehavior('Platform');
        const platformObstaclesManager = gdjs.PlatformObjectsManager.getManager(
          runtimeScene
        );
        platformObstaclesManager.addPlatform(platformBehavior);

        it('can detect a platform at its exact position', function () {
          platform.setCustomWidthAndHeight(100, 100);
          platform.setPosition(300, -200);

          character.setPosition(300, -200);
          checkObstacle(behavior, platformBehavior, -10, 10);
        });

        it('can detect an encompassing platform sharing the top left corner', function () {
          // Shared vertex at (300, -200)
          platform.setCustomWidthAndHeight(200, 200);
          platform.setPosition(300, -200);

          character.setPosition(300, -200);
          checkObstacle(behavior, platformBehavior, -10, 10);
        });

        it('can detect an encompassed platform sharing the top left corner', function () {
          // Shared vertex at (300, -200)
          platform.setCustomWidthAndHeight(50, 50);
          platform.setPosition(300, -200);

          character.setPosition(300, -200);
          checkObstacle(behavior, platformBehavior, -10, 10);
        });

        it('can detect an encompassing platform sharing the top right corner', function () {
          // Shared vertex at (400, -200)
          platform.setCustomWidthAndHeight(200, 200);
          platform.setPosition(200, -200);

          character.setPosition(300, -200);
          checkObstacle(behavior, platformBehavior, -10, 10);
        });

        it('can detect an encompassed platform sharing the top right corner', function () {
          // Shared vertex at (400, -200)
          platform.setCustomWidthAndHeight(50, 50);
          platform.setPosition(350, -200);

          character.setPosition(300, -200);
          checkObstacle(behavior, platformBehavior, -10, 10);
        });

        it('can detect an encompassing platform sharing the bottom left corner', function () {
          // Shared vertex at (300, -100)
          platform.setCustomWidthAndHeight(200, 200);
          platform.setPosition(300, -300);

          character.setPosition(300, -200);
          checkObstacle(behavior, platformBehavior, -10, 10);
        });

        it('can detect an encompassed platform sharing the bottom left corner', function () {
          // Shared vertex at (300, -100)
          platform.setCustomWidthAndHeight(50, 50);
          platform.setPosition(300, -150);

          character.setPosition(300, -200);
          checkObstacle(behavior, platformBehavior, -10, 10);
        });

        it('can detect an encompassing platform sharing the bottom right corner', function () {
          // Shared vertex at (400, -100)
          platform.setCustomWidthAndHeight(200, 200);
          platform.setPosition(200, -300);

          character.setPosition(300, -200);
          checkObstacle(behavior, platformBehavior, -10, 10);
        });

        it('can detect an encompassed platform sharing the bottom right corner', function () {
          // Shared vertex at (400, -100)
          platform.setCustomWidthAndHeight(50, 50);
          platform.setPosition(350, -150);

          character.setPosition(300, -200);
          checkObstacle(behavior, platformBehavior, -10, 10);
        });

        it('can be next to a platform sharing the top left corner', function () {
          // Shared vertex at (300, -200)
          platform.setCustomWidthAndHeight(200, 200);
          platform.setPosition(100, -200);

          character.setPosition(300, -200);
          checkNoFloor(behavior, platformBehavior, -10, 10);
        });

        it('can be next to a platform sharing the top right corner', function () {
          // Shared vertex at (400, -200)
          platform.setCustomWidthAndHeight(200, 200);
          platform.setPosition(400, -200);

          character.setPosition(300, -200);
          checkNoFloor(behavior, platformBehavior, -10, 10);
        });

        it('can be next to a platform sharing the bottom left corner', function () {
          // Shared vertex at (300, -100)
          platform.setCustomWidthAndHeight(200, 200);
          platform.setPosition(100, -300);

          character.setPosition(300, -200);
          checkNoFloor(behavior, platformBehavior, -10, 10);
        });

        it('can be next to a platform sharing the bottom right corner', function () {
          // Shared vertex at (400, -100)
          platform.setCustomWidthAndHeight(200, 200);
          platform.setPosition(400, -300);

          character.setPosition(300, -200);
          checkNoFloor(behavior, platformBehavior, -10, 10);
        });
      });
    });
  });
});
