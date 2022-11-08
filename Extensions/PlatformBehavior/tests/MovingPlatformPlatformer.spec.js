describe('gdjs.PlatformerObjectRuntimeBehavior', function () {
  const epsilon = 1 / (2 << 16);

  describe('(moving platforms)', function () {
    let runtimeScene;
    let object;
    let platform;
    const maxSpeed = 500;
    const maxFallingSpeed = 1500;
    const timeDelta = 1 / 60;
    const maxDeltaX = maxSpeed * timeDelta;
    const maxDeltaY = maxFallingSpeed * timeDelta;

    beforeEach(function () {
      runtimeScene = makePlatformerTestRuntimeScene();

      // Put a platformer object on a platform.
      object = new gdjs.TestRuntimeObject(runtimeScene, {
        name: 'obj1',
        type: '',
        behaviors: [
          {
            type: 'PlatformBehavior::PlatformerObjectBehavior',
            name: 'auto1',
            gravity: 900,
            maxFallingSpeed: maxFallingSpeed,
            acceleration: 500,
            deceleration: 1500,
            maxSpeed: maxSpeed,
            jumpSpeed: 1500,
            canGrabPlatforms: true,
            ignoreDefaultControls: true,
            slopeMaxAngle: 60,
            useLegacyTrajectory: false,
          },
        ],
        effects: [],
      });
      object.setCustomWidthAndHeight(10, 20);
      runtimeScene.addObject(object);
      object.setPosition(0, -40);

      // Put a platform.
      platform = addPlatformObject(runtimeScene);
      platform.setPosition(0, -10);
    });

    it('follows a platform moving less than one pixel', function () {
      for (let i = 0; i < 10; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }

      // Check the object has not moved.
      expect(object.getY()).to.be(-30);
      expect(object.getX()).to.be(0);
      expect(object.getBehavior('auto1').isOnFloor()).to.be(true);
      expect(object.getBehavior('auto1').isFalling()).to.be(false);
      expect(object.getBehavior('auto1').isMoving()).to.be(false);

      // Check that the object follow the platform, even if the
      // movement is less than one pixel.
      runtimeScene.renderAndStepWithEventsFunction(1000 / 60, () => {
        platform.setX(platform.getX() + 0.12);
      });
      runtimeScene.renderAndStepWithEventsFunction(1000 / 60, () => {
        platform.setX(platform.getX() + 0.12);
      });
      runtimeScene.renderAndStepWithEventsFunction(1000 / 60, () => {
        platform.setX(platform.getX() + 0.12);
      });
      // TODO Remove the 1-frame delay
      expect(object.getX()).to.be(0.24);
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getX()).to.be(0.36);
    });

    it('falls from a platform moving down faster than the maximum falling speed', function () {
      for (let i = 0; i < 10; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }
      // Check the object has not moved.
      expect(object.getY()).to.be(-30);
      expect(object.getX()).to.be(0);
      expect(object.getBehavior('auto1').isOnFloor()).to.be(true);
      expect(object.getBehavior('auto1').isFalling()).to.be(false);
      expect(object.getBehavior('auto1').isMoving()).to.be(false);

      // Check that the object falls
      // +1 because it's the margin to check the floor
      platform.setY(platform.getY() + maxDeltaY + 1);
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getBehavior('auto1').isOnFloor()).to.be(false);
      expect(object.getBehavior('auto1').isFalling()).to.be(true);
      expect(object.getBehavior('auto1').isMoving()).to.be(true);
      expect(object.getY()).to.be.above(-30);
    });

    // This test doesn't pass because the platform AABB are not always updated
    // before the platformer object moves.
    //
    // When the character is put on top of the platform to follow it up,
    // the platform AABB may not has updated in RBush
    // and the platform became out of the spacial search rectangle.
    it.skip('follows a platform that is slightly overlapping its top', function () {
      for (let i = 0; i < 10; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }
      // Check the object has not moved.
      expect(object.getY()).to.be(-30);
      expect(object.getX()).to.be(0);
      expect(object.getBehavior('auto1').isOnFloor()).to.be(true);
      expect(object.getBehavior('auto1').isFalling()).to.be(false);
      expect(object.getBehavior('auto1').isMoving()).to.be(false);

      // the platform is slightly overlapping the top of the object
      platform.setY(object.getY() - platform.getHeight() + 1);
      runtimeScene.renderAndStep(1000 / 60);
      // Check that the object stays on the floor
      expect(object.getBehavior('auto1').isOnFloor()).to.be(true);
      expect(object.getBehavior('auto1').isFalling()).to.be(false);
      expect(object.getBehavior('auto1').isMoving()).to.be(false);
      expect(object.getY()).to.be(platform.getY() - object.getHeight());
    });

    it('must not follow a platform that is moved over its top', function () {
      for (let i = 0; i < 10; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }

      // Check the object has not moved.
      expect(object.getY()).to.be(-30);
      expect(object.getX()).to.be(0);
      expect(object.getBehavior('auto1').isOnFloor()).to.be(true);
      expect(object.getBehavior('auto1').isFalling()).to.be(false);
      expect(object.getBehavior('auto1').isMoving()).to.be(false);

      // move the platform over the object
      platform.setY(object.getY() - platform.getHeight());
      runtimeScene.renderAndStep(1000 / 60);
      // A second step to make sure that the AABB is updated in RBush.
      // TODO this is a bug
      runtimeScene.renderAndStep(1000 / 60);
      // Check that the object falls
      expect(object.getBehavior('auto1').isOnFloor()).to.be(false);
      expect(object.getBehavior('auto1').isFalling()).to.be(true);
      expect(object.getY()).to.be.above(-30);
    });

    it('follows a moving platform when was grabbed to another', function () {
      const topPlatform = addPlatformObject(runtimeScene);
      topPlatform.setPosition(platform.getX() + 30, -50);

      // Fall and Grab the platform
      object.setPosition(
        topPlatform.getX() - object.getWidth(),
        topPlatform.getY() - 10
      );

      for (let i = 0; i < 9; ++i) {
        object.getBehavior('auto1').simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
        expect(object.getBehavior('auto1').isFalling()).to.be(true);
        expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
          true
        );
      }
      object.getBehavior('auto1').simulateRightKey();
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getBehavior('auto1').isGrabbingPlatform()).to.be(true);

      // move the bottom platform to the object
      for (let i = 0; i < 20; ++i) {
        platform.setY(platform.getY() - 1);
        runtimeScene.renderAndStep(1000 / 60);
      }
      // the platform reach the object
      expect(platform.getY()).to.be(object.getY() + object.getHeight());
      for (let i = 0; i < 5; ++i) {
        platform.setY(platform.getY() - 1);
        runtimeScene.renderAndStep(1000 / 60);
      }
      // the object follows it and no longer grab the other platform
      expect(object.getY()).to.be(platform.getY() - object.getHeight());
      expect(object.getBehavior('auto1').isGrabbingPlatform()).to.be(false);
    });

    // This may be a bug. Please, remove the skip if you fixed it.
    // It fails on the last 2 expect()
    it.skip('follows a moving platform when was grabbed to a ladder', function () {
      // object is 10 pixel higher than the platform and overlap the ladder
      object.setPosition(0, platform.getY() - object.getHeight() - 10);
      const ladder = addLadderObject(runtimeScene);
      ladder.setPosition(object.getX(), platform.getY() - ladder.getHeight());

      // Fall and Grab the platform
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getBehavior('auto1').isFalling()).to.be(true);
      expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(true);
      object.getBehavior('auto1').simulateLadderKey();
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getBehavior('auto1').isOnLadder()).to.be(true);

      // move the bottom platform to the object
      for (let i = 0; i < 20; ++i) {
        platform.setY(platform.getY() - 1);
        runtimeScene.renderAndStep(1000 / 60);
        expect(object.getBehavior('auto1').isOnLadder()).to.be(true);
      }
      // the platform reach the object
      expect(platform.getY()).to.be(object.getY() + object.getHeight());
      for (let i = 0; i < 5; ++i) {
        platform.setY(platform.getY() - 1);
        runtimeScene.renderAndStep(1000 / 60);
      }
      // the object follows it and no longer grab the other platform
      expect(object.getY()).to.be(platform.getY() - object.getHeight());
      expect(object.getBehavior('auto1').isOnLadder()).to.be(false);
      expect(object.getBehavior('auto1').isOnFloor()).to.be(true);
    });

    [-10, -10.1, -9.9].forEach((platformY) => {
      [
        -maxDeltaY + epsilon,
        maxDeltaY - epsilon,
        -10,
        10,
        -10.1,
        10.1,
        0,
      ].forEach((deltaY) => {
        [-maxDeltaX, maxDeltaX, 0].forEach((deltaX) => {
          it(`follows the platform moving (${deltaX}; ${deltaY}) with initial Y = ${platformY}`, function () {
            platform.setPosition(platform.getX(), platformY);
            for (let i = 0; i < 10; ++i) {
              runtimeScene.renderAndStep(1000 / 60);
            }
            // Check the object has not moved.
            expect(object.getX()).to.be(0);
            // The object landed right on the platform
            expect(object.getY()).to.be(platform.getY() - object.getHeight());
            expect(object.getBehavior('auto1').isOnFloor()).to.be(true);
            expect(object.getBehavior('auto1').isFalling()).to.be(false);
            expect(object.getBehavior('auto1').isMoving()).to.be(false);

            // Check that the object follow the platform, even if the
            // movement is less than one pixel.
            for (let i = 0; i < 5; ++i) {
              const previousPlatformY = platform.getY();
              runtimeScene.renderAndStepWithEventsFunction(1000 / 60, () => {
                platform.setPosition(
                  platform.getX() + deltaX,
                  platform.getY() + deltaY
                );
              });
              expect(object.getBehavior('auto1').isOnFloor()).to.be(true);
              expect(object.getBehavior('auto1').isFalling()).to.be(false);
              expect(object.getBehavior('auto1').isMoving()).to.be(false);
              // The object follow the platform
              // The rounding error is probably due to a separate call.
              // TODO Try to make it exact or find why
              // TODO Remove the 1-frame delay
              expect(object.getY()).to.be.within(
                previousPlatformY - object.getHeight() - epsilon,
                previousPlatformY - object.getHeight() + epsilon
              );
            }
            // TODO Remove the 1-frame delay
            expect(object.getX()).to.be(0 + 4 * deltaX);
            runtimeScene.renderAndStep(1000 / 60);
            expect(object.getX()).to.be(0 + 5 * deltaX);
          });
        });
      });
    });
  });

  [false, true].forEach((useJumpthru) => {
    describe(`(${
      useJumpthru ? 'useJumpthru' : 'regular'
    } moving platforms)`, function () {
      let runtimeScene;
      let object;
      let platform;
      const maxSpeed = 500;
      const maxFallingSpeed = 1500;
      const timeDelta = 1 / 60;
      const maxDeltaX = maxSpeed * timeDelta;
      const maxDeltaY = maxFallingSpeed * timeDelta;

      beforeEach(function () {
        runtimeScene = makePlatformerTestRuntimeScene();

        // Put a platformer object on a platform.
        object = new gdjs.TestRuntimeObject(runtimeScene, {
          name: 'obj1',
          type: '',
          behaviors: [
            {
              type: 'PlatformBehavior::PlatformerObjectBehavior',
              name: 'auto1',
              gravity: 900,
              maxFallingSpeed: maxFallingSpeed,
              acceleration: 500,
              deceleration: 1500,
              maxSpeed: maxSpeed,
              jumpSpeed: 1500,
              canGrabPlatforms: true,
              ignoreDefaultControls: true,
              slopeMaxAngle: 60,
              useLegacyTrajectory: false,
            },
          ],
          effects: [],
        });
        object.setCustomWidthAndHeight(10, 20);
        runtimeScene.addObject(object);
        object.setPosition(0, -40);

        // Put a platform.
        if (useJumpthru) {
          platform = addJumpThroughPlatformObject(runtimeScene);
        } else {
          platform = addPlatformObject(runtimeScene);
        }
        platform.setPosition(0, -10);
      });

      // This test doesn't pass with jumpthru
      // because jumpthru that overlap the object are excluded from collision.
      // The probability it happens is: platform speed / falling speed.
      // We could use the Y speed to be more permissive about it:
      // If the previous position according to the speed is above the platform,
      // we could let it land.
      it.skip('can land to a platform that moved up and overlapped the object', function () {
        // Put the platform away so it won't collide with the falling object
        platform.setPosition(platform.getX(), 200);

        for (let i = 0; i < 10; ++i) {
          const oldY = object.getY();
          runtimeScene.renderAndStep(1000 / 60);
        }
        // Put the platform under the falling object and overlap it a little
        // like a platform moving quickly can do
        platform.setPosition(
          platform.getX(),
          object.getY() + object.getHeight() - 2
        );
        runtimeScene.renderAndStep(1000 / 60);

        // Check the object has landed on the platform.
        expect(object.getX()).to.be(0);
        // The object must not be inside the platform or it gets stuck
        expect(object.getY()).to.be.within(
          platform.getY() - object.getHeight() - epsilon,
          platform.getY() - object.getHeight() + epsilon
        );
        expect(object.getBehavior('auto1').isOnFloor()).to.be(true);
        expect(object.getBehavior('auto1').isFalling()).to.be(false);
        expect(object.getBehavior('auto1').isMoving()).to.be(false);
      });

      [-10, -10.1, -9.9].forEach((platformY) => {
        [
          -maxDeltaY + epsilon,
          maxDeltaY - epsilon,
          -10,
          10,
          -10.1,
          10.1,
          0,
        ].forEach((deltaY) => {
          [-maxDeltaX, maxDeltaX, 0].forEach((deltaX) => {
            it(`follows the platform moving (${deltaX}; ${deltaY}) with initial Y = ${platformY}`, function () {
              platform.setPosition(platform.getX(), platformY);
              for (let i = 0; i < 10; ++i) {
                runtimeScene.renderAndStep(1000 / 60);
              }
              // Check the object has not moved.
              expect(object.getX()).to.be(0);
              // The object must not be inside the platform or it gets stuck
              expect(object.getY()).to.be.within(
                platform.getY() - object.getHeight() - epsilon,
                platform.getY() - object.getHeight() + epsilon
              );
              expect(object.getBehavior('auto1').isOnFloor()).to.be(true);
              expect(object.getBehavior('auto1').isFalling()).to.be(false);
              expect(object.getBehavior('auto1').isMoving()).to.be(false);

              // Check that the object follow the platform, even if the
              // movement is less than one pixel.
              for (let i = 0; i < 5; ++i) {
                const previousPlatformY = platform.getY();
                runtimeScene.renderAndStepWithEventsFunction(1000 / 60, () => {
                  platform.setPosition(
                    platform.getX() + deltaX,
                    platform.getY() + deltaY
                  );
                });
                expect(object.getBehavior('auto1').isOnFloor()).to.be(true);
                expect(object.getBehavior('auto1').isFalling()).to.be(false);
                expect(object.getBehavior('auto1').isMoving()).to.be(false);
                // The object must not be inside the platform or it gets stuck
                // TODO Remove the 1-frame delay
                expect(object.getY()).to.be.within(
                  previousPlatformY - object.getHeight() - epsilon,
                  previousPlatformY - object.getHeight() + epsilon
                );
              }
              // TODO Remove the 1-frame delay
              expect(object.getX()).to.be(0 + 4 * deltaX);
              runtimeScene.renderAndStep(1000 / 60);
              expect(object.getX()).to.be(0 + 5 * deltaX);
            });
          });
        });
      });
    });
  });
});
