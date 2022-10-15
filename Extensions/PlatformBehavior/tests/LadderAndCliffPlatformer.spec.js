describe('gdjs.PlatformerObjectRuntimeBehavior', function () {
  [true, false].forEach((canGrabWithoutMoving) => {
    describe(`(grab platforms, canGrabWithoutMoving: ${canGrabWithoutMoving})`, function () {
      let runtimeScene;
      let object;

      beforeEach(function () {
        runtimeScene = makePlatformerTestRuntimeScene();

        // Put a platformer object in the air.
        object = new gdjs.TestRuntimeObject(runtimeScene, {
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
              canGrabWithoutMoving: canGrabWithoutMoving,
              useLegacyTrajectory: false,
            },
          ],
          effects: [],
        });
        object.setCustomWidthAndHeight(10, 20);
        runtimeScene.addObject(object);
        object.setPosition(0, -100);
      });

      it('can grab and release the right ledge of a platform', function () {
        // Put a platform.
        const platform = addPlatformObject(runtimeScene);
        platform.setPosition(0, -10);
        runtimeScene.renderAndStep(1000 / 60);

        // Put the character near the right ledge of the platform.
        object.setPosition(
          platform.getX() + platform.getWidth() + 2,
          platform.getY() - 10
        );

        for (let i = 0; i < 10; ++i) {
          object.getBehavior('auto1').simulateLeftKey();
          runtimeScene.renderAndStep(1000 / 60);
        }

        // The character grabs the platform.
        expect(object.getX()).to.be.within(
          platform.getX() + platform.getWidth() + 0,
          platform.getX() + platform.getWidth() + 1
        );
        expect(object.getY()).to.be(platform.getY());
        expect(object.getBehavior('auto1').isGrabbingPlatform()).to.be(true);

        // The character releases the platform.
        object.getBehavior('auto1').simulateReleasePlatformKey();
        // The character falls.
        for (let i = 0; i < 10; ++i) {
          runtimeScene.renderAndStep(1000 / 60);
          expect(object.getBehavior('auto1').isFalling()).to.be(true);
          expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
            true
          );
        }
        expect(object.getY()).to.be.above(0);
      });

      it('can grab and release the left ledge of a platform', function () {
        // Put a platform.
        const platform = addPlatformObject(runtimeScene);
        platform.setPosition(0, -10);
        runtimeScene.renderAndStep(1000 / 60);

        // Put the character near the right ledge of the platform.
        object.setPosition(
          platform.getX() - object.getWidth() - 2,
          platform.getY() - 10
        );

        for (let i = 0; i < 10; ++i) {
          object.getBehavior('auto1').simulateRightKey();
          runtimeScene.renderAndStep(1000 / 60);
        }

        // The character grabs the platform.
        expect(object.getX()).to.be.within(
          platform.getX() - object.getWidth() - 1,
          platform.getX() - object.getWidth() - 0
        );
        expect(object.getY()).to.be(platform.getY());
        expect(object.getBehavior('auto1').isGrabbingPlatform()).to.be(true);

        // The character releases the platform.
        object.getBehavior('auto1').simulateReleasePlatformKey();
        // The character falls.
        for (let i = 0; i < 10; ++i) {
          runtimeScene.renderAndStep(1000 / 60);
          expect(object.getBehavior('auto1').isFalling()).to.be(true);
          expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
            true
          );
        }
        expect(object.getY()).to.be.above(0);
      });

      [true, false].forEach((addTopPlatformFirst) => {
        it('can grab every platform when colliding 2', function () {
          // The 2 platforms will be simultaneously in collision
          // with the object when it grabs one.
          let upperPlatform, lowerPlatform;
          if (addTopPlatformFirst) {
            upperPlatform = addPlatformObject(runtimeScene);
            upperPlatform.setPosition(0, -10);
            upperPlatform.setCustomWidthAndHeight(60, 10);

            lowerPlatform = addPlatformObject(runtimeScene);
            lowerPlatform.setPosition(0, 0);
            lowerPlatform.setCustomWidthAndHeight(60, 10);
          } else {
            lowerPlatform = addPlatformObject(runtimeScene);
            lowerPlatform.setPosition(0, 0);
            lowerPlatform.setCustomWidthAndHeight(60, 10);

            upperPlatform = addPlatformObject(runtimeScene);
            upperPlatform.setPosition(0, -10);
            upperPlatform.setCustomWidthAndHeight(60, 10);
          }

          // Put the object near the right ledge of the platform.
          object.setPosition(
            upperPlatform.getX() + upperPlatform.getWidth() + 2,
            upperPlatform.getY() - 10
          );
          runtimeScene.renderAndStep(1000 / 60);

          for (let i = 0; i < 10; ++i) {
            object.getBehavior('auto1').simulateLeftKey();
            runtimeScene.renderAndStep(1000 / 60);
          }

          // Check that the object grabbed the upper platform
          expect(object.getX()).to.be.within(
            upperPlatform.getX() + upperPlatform.getWidth() + 0,
            upperPlatform.getX() + upperPlatform.getWidth() + 1
          );
          expect(object.getY()).to.be(upperPlatform.getY());
          expect(object.getBehavior('auto1').isGrabbingPlatform()).to.be(true);

          // Release upper platform
          object.getBehavior('auto1').simulateReleasePlatformKey();
          for (let i = 0; i < 10; ++i) {
            object.getBehavior('auto1').simulateLeftKey();
            runtimeScene.renderAndStep(1000 / 60);
          }

          // Check that the object grabbed the lower platform
          expect(object.getX()).to.be.within(
            lowerPlatform.getX() + lowerPlatform.getWidth() + 0,
            lowerPlatform.getX() + lowerPlatform.getWidth() + 1
          );
          expect(object.getY()).to.be(lowerPlatform.getY());
          expect(object.getBehavior('auto1').isGrabbingPlatform()).to.be(true);
        });
      });

      it('can grab a platform and jump', function () {
        // Put a platform.
        platform = addPlatformObject(runtimeScene);
        platform.setPosition(0, -10);
        runtimeScene.renderAndStep(1000 / 60);

        //Put the object near the right ledge of the platform.
        object.setPosition(
          platform.getX() + platform.getWidth() + 2,
          platform.getY() - 10
        );

        for (let i = 0; i < 10; ++i) {
          object.getBehavior('auto1').simulateLeftKey();
          runtimeScene.renderAndStep(1000 / 60);
        }

        //Check that the object grabbed the platform
        expect(object.getBehavior('auto1').isGrabbingPlatform()).to.be(true);
        expect(object.getX()).to.be.within(
          platform.getX() + platform.getWidth() + 0,
          platform.getX() + platform.getWidth() + 1
        );
        expect(object.getY()).to.be(platform.getY());

        object.getBehavior('auto1').simulateJumpKey();
        //Check that the object is jumping
        for (let i = 0; i < 10; ++i) {
          runtimeScene.renderAndStep(1000 / 60);
          expect(object.getBehavior('auto1').isJumping()).to.be(true);
        }
        expect(object.getY()).to.be.below(platform.getY());
      });
    });
  });

  describe('(grab platforms, canGrabWithoutMoving: true)', function () {
    let runtimeScene;
    let object;

    beforeEach(function () {
      runtimeScene = makePlatformerTestRuntimeScene();

      // Put a platformer object in the air.
      object = new gdjs.TestRuntimeObject(runtimeScene, {
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
            canGrabWithoutMoving: true,
            useLegacyTrajectory: false,
          },
        ],
        effects: [],
      });
      object.setCustomWidthAndHeight(10, 20);
      runtimeScene.addObject(object);
      object.setPosition(0, -100);
    });

    it('can grab without moving and release the right ledge of a platform', function () {
      // Put a platform.
      const platform = addPlatformObject(runtimeScene);
      platform.setPosition(0, -10);
      runtimeScene.renderAndStep(1000 / 60);

      // Put the character near the right ledge of the platform.
      object.setPosition(
        platform.getX() + platform.getWidth() + 2,
        platform.getY() - 10
      );

      // The character faces the platform
      object.getBehavior('auto1').simulateLeftKey();
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getBehavior('auto1').isGrabbingPlatform()).to.be(false);
      for (let i = 0; i < 10; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }
      // The character grabs the platform.
      expect(object.getX()).to.be.within(
        platform.getX() + platform.getWidth() + 0,
        platform.getX() + platform.getWidth() + 2
      );
      expect(object.getY()).to.be(platform.getY());
      expect(object.getBehavior('auto1').isGrabbingPlatform()).to.be(true);

      // The character releases the platform.
      object.getBehavior('auto1').simulateReleasePlatformKey();
      // The character falls.
      for (let i = 0; i < 10; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
        expect(object.getBehavior('auto1').isFalling()).to.be(true);
        expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
          true
        );
      }
      expect(object.getY()).to.be.above(0);
    });

    it('can grab without moving and release the left ledge of a platform', function () {
      // Put a platform.
      const platform = addPlatformObject(runtimeScene);
      platform.setPosition(0, -10);
      runtimeScene.renderAndStep(1000 / 60);

      // Put the character near the left ledge of the platform.
      object.setPosition(
        platform.getX() - object.getWidth() - 2,
        platform.getY() - 10
      );

      // The character faces the platform
      object.getBehavior('auto1').simulateRightKey();
      for (let i = 0; i < 10; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }
      // The character grabs the platform.
      expect(object.getX()).to.be.within(
        platform.getX() - object.getWidth() - 2,
        platform.getX() - object.getWidth() - 0
      );
      expect(object.getY()).to.be(platform.getY());
      expect(object.getBehavior('auto1').isGrabbingPlatform()).to.be(true);

      // The character releases the platform.
      object.getBehavior('auto1').simulateReleasePlatformKey();
      // The character falls.
      for (let i = 0; i < 10; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
        expect(object.getBehavior('auto1').isFalling()).to.be(true);
        expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
          true
        );
      }
      expect(object.getY()).to.be.above(0);
    });

    it('must not grab automatically the right ledge of a platform when facing back', function () {
      // Put a platform.
      const platform = addPlatformObject(runtimeScene);
      platform.setPosition(0, -10);
      runtimeScene.renderAndStep(1000 / 60);

      // Put the character near the right ledge of the platform.
      object.setPosition(
        platform.getX() + platform.getWidth() + 2,
        platform.getY() - 10
      );

      // The character faces the wrong way
      object.getBehavior('auto1').simulateRightKey();
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getBehavior('auto1').isGrabbingPlatform()).to.be(false);
      for (let i = 0; i < 10; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }
      // The character couldn't grab the platform.
      expect(object.getBehavior('auto1').isFalling()).to.be(true);
      expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(true);
      expect(object.getY()).to.be.greaterThan(platform.getY() + 5);
    });

    it('must not grab automatically the left ledge of a platform when facing back', function () {
      // Put a platform.
      const platform = addPlatformObject(runtimeScene);
      platform.setPosition(0, -10);
      runtimeScene.renderAndStep(1000 / 60);

      // Put the character near the left ledge of the platform.
      object.setPosition(
        platform.getX() - object.getWidth() - 2,
        platform.getY() - 10
      );

      // The character faces the wrong way
      object.getBehavior('auto1').simulateLeftKey();
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getBehavior('auto1').isGrabbingPlatform()).to.be(false);
      for (let i = 0; i < 10; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }
      // The character couldn't grab the platform.
      expect(object.getBehavior('auto1').isFalling()).to.be(true);
      expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(true);
      expect(object.getY()).to.be.greaterThan(platform.getY() + 5);
    });
  });

  describe('(ladder)', function () {
    let runtimeScene;
    let object;
    var scale;

    beforeEach(function () {
      runtimeScene = makePlatformerTestRuntimeScene();

      // Put a platformer object on a platform
      object = new gdjs.TestRuntimeObject(runtimeScene, {
        name: 'obj1',
        type: '',
        behaviors: [
          {
            type: 'PlatformBehavior::PlatformerObjectBehavior',
            name: 'auto1',
            gravity: 1500,
            maxFallingSpeed: 1500,
            acceleration: 500,
            deceleration: 1500,
            maxSpeed: 500,
            jumpSpeed: 900,
            canGrabPlatforms: true,
            ignoreDefaultControls: true,
            slopeMaxAngle: 60,
            jumpSustainTime: 0.2,
            useLegacyTrajectory: false,
          },
        ],
        effects: [],
      });
      object.setCustomWidthAndHeight(10, 20);
      runtimeScene.addObject(object);

      // Put a platform.
      const platform = addPlatformObject(runtimeScene);
      platform.setPosition(0, -10);

      ladder = addLadderObject(runtimeScene);
      ladder.setPosition(30, -10 - ladder.getHeight());
    });

    const fall = (frameCount) => {
      for (let i = 0; i < frameCount; ++i) {
        const lastY = object.getY();
        runtimeScene.renderAndStep(1000 / 60);
        expect(object.getBehavior('auto1').isFalling()).to.be(true);
        expect(object.getBehavior('auto1').isMoving()).to.be(true);
        expect(object.getY()).to.be.above(lastY);
      }
    };

    const climbLadder = (frameCount) => {
      for (let i = 0; i < frameCount; ++i) {
        const lastY = object.getY();
        object.getBehavior('auto1').simulateUpKey();
        runtimeScene.renderAndStep(1000 / 60);
        expect(object.getBehavior('auto1').isOnLadder()).to.be(true);
        expect(object.getBehavior('auto1').isMoving()).to.be(true);
        expect(object.getY()).to.be.below(lastY);
      }
    };

    const releaseLadder = (frameCount) => {
      object.getBehavior('auto1').simulateReleaseLadderKey();
      for (let i = 0; i < frameCount; ++i) {
        const lastY = object.getY();
        runtimeScene.renderAndStep(1000 / 60);
        expect(object.getBehavior('auto1').isOnLadder()).to.be(false);
        expect(object.getBehavior('auto1').isMoving()).to.be(true);
        expect(object.getY()).to.be.above(lastY);
      }
    };

    const stayOnLadder = (frameCount) => {
      for (let i = 0; i < frameCount; ++i) {
        const lastY = object.getY();
        runtimeScene.renderAndStep(1000 / 60);
        expect(object.getBehavior('auto1').isOnLadder()).to.be(true);
        expect(object.getBehavior('auto1').isMoving()).to.be(false);
        expect(object.getY()).to.be(lastY);
      }
    };

    const jumpAndAscend = (frameCount) => {
      for (let i = 0; i < frameCount; ++i) {
        const lastY = object.getY();
        runtimeScene.renderAndStep(1000 / 60);
        expect(object.getBehavior('auto1').isJumping()).to.be(true);
        expect(object.getBehavior('auto1').isFalling()).to.be(false);
        expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
          false
        );
        expect(object.getBehavior('auto1').isMoving()).to.be(true);
        expect(object.getY()).to.be.below(lastY);
      }
    };
    const jumpAndDescend = (frameCount) => {
      for (let i = 0; i < frameCount; ++i) {
        const lastY = object.getY();
        runtimeScene.renderAndStep(1000 / 60);
        expect(object.getBehavior('auto1').isJumping()).to.be(true);
        expect(object.getBehavior('auto1').isFalling()).to.be(true);
        expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
          false
        );
        expect(object.getBehavior('auto1').isMoving()).to.be(true);
        expect(object.getY()).to.be.above(lastY);
      }
    };

    const fallOnPlatform = (maxFrameCount) => {
      // Ensure the object falls on the platform
      for (let i = 0; i < maxFrameCount; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }
      //Check the object is on the platform
      expect(object.getY()).to.be(-30); // -30 = -10 (platform y) + -20 (object height)
      expect(object.getBehavior('auto1').isFalling()).to.be(false);
      expect(object.getBehavior('auto1').isMoving()).to.be(false);
    };

    it('can climb and release a ladder', function () {
      object.setPosition(30, -32);
      // Ensure the object falls on the platform
      fallOnPlatform(10);

      // Climb the ladder
      object.getBehavior('auto1').simulateLadderKey();
      climbLadder(10);
      stayOnLadder(10);
      const objectPositionAfterFirstClimb = object.getY();
      releaseLadder(10);
      object.getBehavior('auto1').simulateLadderKey();
      expect(object.getY()).to.be.within(
        // gravity is 1500, 10 frames falling ~ 21px
        objectPositionAfterFirstClimb + 20,
        objectPositionAfterFirstClimb + 21
      );
      climbLadder(23);
      // Check that we reached the maximum height
      const playerAtLadderTop = ladder.getY() - object.getHeight();
      expect(object.getY()).to.be.within(
        playerAtLadderTop - 3,
        playerAtLadderTop
      );

      // The player goes a little over the ladder...
      object.getBehavior('auto1').simulateUpKey();
      // ...and it falls even if up is pressed
      for (let i = 0; i < 13; ++i) {
        object.getBehavior('auto1').simulateUpKey();
        fall(1);
      }
    });

    it('can jump and grab a ladder even on the ascending phase of a jump the 1st time', function () {
      object.setPosition(30, -32);
      // Ensure the object falls on the platform
      fallOnPlatform(10);

      // Jump
      object.getBehavior('auto1').simulateJumpKey();
      runtimeScene.renderAndStep(1000 / 60);
      for (let i = 0; i < 2; ++i) {
        object.getBehavior('auto1').simulateUpKey();
        runtimeScene.renderAndStep(1000 / 60);
      }
      expect(object.getY()).to.be.below(-30);
      expect(object.getBehavior('auto1').isJumping()).to.be(true);

      // Grab the ladder
      object.getBehavior('auto1').simulateLadderKey();
      runtimeScene.renderAndStep(1000 / 60);

      stayOnLadder(10);
      climbLadder(2);
    });

    it('can grab a ladder while on the descending phase of a jump', function () {
      // Need a bigger ladder
      ladder.getHeight = function () {
        return 300;
      };
      ladder.setPosition(30, -10 - ladder.getHeight());

      object.setPosition(30, -32);
      // Ensure the object falls on the platform
      fallOnPlatform(10);

      // Jump
      object.getBehavior('auto1').simulateJumpKey();
      for (let i = 0; i < 18; ++i) {
        jumpAndAscend(1);
      }

      // starting to going down
      object.getBehavior('auto1').simulateLadderKey();
      stayOnLadder(1);
      expect(object.getBehavior('auto1').isJumping()).to.be(false);

      stayOnLadder(10);
      climbLadder(2);
    });

    it('can jump from ladder to ladder', function () {
      // Need a bigger ladder
      ladder.getHeight = function () {
        return 300;
      };
      ladder.setPosition(30, -10 - ladder.getHeight());

      const ladder2 = addLadderObject(runtimeScene);
      ladder2.getHeight = function () {
        return 300;
      };
      ladder2.setPosition(ladder.getX() + ladder.getWidth(), ladder.getY());

      object.setPosition(35, -32);
      // Ensure the object falls on the platform
      fallOnPlatform(10);

      // Jump
      object.getBehavior('auto1').simulateJumpKey();
      for (let i = 0; i < 10; ++i) {
        jumpAndAscend(1);
      }

      // 1st time grabbing this ladder
      object.getBehavior('auto1').simulateLadderKey();
      stayOnLadder(1);
      expect(object.getBehavior('auto1').isJumping()).to.be(false);

      // Jump right
      object.getBehavior('auto1').simulateJumpKey();
      for (let i = 0; i < 15; ++i) {
        object.getBehavior('auto1').simulateRightKey();
        jumpAndAscend(1);
      }
      // leave the 1st ladder
      expect(object.getX()).to.be.above(ladder2.getX());
      // and grab the 2nd one, even if still ascending
      object.getBehavior('auto1').simulateLadderKey();
      // still moves a little because of inertia
      for (let i = 0; i < 3; i++) {
        runtimeScene.renderAndStep(1000 / 60);
        expect(object.getBehavior('auto1').isOnLadder()).to.be(true);
      }
      stayOnLadder(1);
    });

    it('can fall from a ladder right side', function () {
      object.setPosition(30, -32);
      // Ensure the object falls on the platform
      fallOnPlatform(10);

      // Climb the ladder
      object.getBehavior('auto1').simulateLadderKey();
      climbLadder(10);
      stayOnLadder(10);

      // Fall to the ladder right
      runtimeScene.renderAndStep(1000 / 60);
      for (let i = 0; i < 16; ++i) {
        object.getBehavior('auto1').simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
        expect(object.getBehavior('auto1').isOnLadder()).to.be(true);
      }
      // Here, if we had pressed Right the character would have been falling.
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getBehavior('auto1').isOnLadder()).to.be(true);
      // Now, it falls.
      fall(5);
    });

    it('can walk from a ladder', function () {
      object.setPosition(30, -32);
      // Ensure the object falls on the platform
      fallOnPlatform(10);

      // Climb the ladder
      object.getBehavior('auto1').simulateLadderKey();
      stayOnLadder(10);

      // Going from the ladder to the right
      runtimeScene.renderAndStep(1000 / 60);
      for (let i = 0; i < 16; ++i) {
        object.getBehavior('auto1').simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
        expect(object.getBehavior('auto1').isOnLadder()).to.be(true);
      }
      // and directly on the floor
      object.getBehavior('auto1').simulateRightKey();
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getBehavior('auto1').isOnFloor()).to.be(true);
    });

    it('can jump from a ladder', function () {
      object.setPosition(30, -32);
      // Ensure the object falls on the platform
      fallOnPlatform(10);

      // Climb the ladder
      object.getBehavior('auto1').simulateLadderKey();
      climbLadder(10);
      stayOnLadder(10);

      // Jump from the ladder
      const stayY = object.getY();
      object.getBehavior('auto1').simulateJumpKey();
      for (let i = 0; i < 20; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }
      expect(object.getY()).to.be.below(stayY);
      expect(object.getBehavior('auto1').isJumping()).to.be(true);
    });

    it('can grab a ladder when falling', function () {
      object.setPosition(30, -32);
      // Ensure the object falls on the platform
      fallOnPlatform(10);

      // Climb the ladder
      object.getBehavior('auto1').simulateLadderKey();
      climbLadder(24);
      // Check that we reached the maximum height
      // The player goes a little over the ladder...
      object.getBehavior('auto1').simulateUpKey();
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getBehavior('auto1').isFalling()).to.be(true);
      expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(true);
      fall(10);

      object.getBehavior('auto1').simulateLadderKey();
      stayOnLadder(10);
      climbLadder(5);
    });

    it('should not grab a platform when grabbed to a ladder', function () {
      const topPlatform = addPlatformObject(runtimeScene);
      topPlatform.setPosition(ladder.getX() + ladder.getWidth(), -50);
      runtimeScene.renderAndStep(1000 / 60);

      object.setPosition(
        topPlatform.getX() - object.getWidth(),
        topPlatform.getY()
      );
      // Grab the ladder
      object.getBehavior('auto1').simulateLadderKey();
      stayOnLadder(10);

      object.getBehavior('auto1').simulateRightKey();
      runtimeScene.renderAndStep(1000 / 60);
      // The object is where it could grab the top platform if it where falling.
      expect(object.getX()).to.be.within(
        topPlatform.getX() - object.getWidth(),
        topPlatform.getX() - object.getWidth() + 2
      );
      expect(object.getY()).to.be(topPlatform.getY());
      // Check that the object didn't grabbed the platform
      expect(object.getBehavior('auto1').isGrabbingPlatform()).to.be(false);

      stayOnLadder(10);
    });

    it('can grab a ladder when grabbed to a platform', function () {
      const topPlatform = addPlatformObject(runtimeScene);
      topPlatform.setPosition(ladder.getX() + ladder.getWidth(), -50);
      runtimeScene.renderAndStep(1000 / 60);

      // Fall and Grab the platform
      object.setPosition(
        topPlatform.getX() - object.getWidth(),
        topPlatform.getY() - 10
      );
      for (let i = 0; i < 6; ++i) {
        object.getBehavior('auto1').simulateRightKey();
        fall(1);
      }
      object.getBehavior('auto1').simulateRightKey();
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getBehavior('auto1').isGrabbingPlatform()).to.be(true);

      // try to grab the ladder
      object.getBehavior('auto1').simulateLadderKey();
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getBehavior('auto1').isOnLadder()).to.be(true);
      expect(object.getBehavior('auto1').isGrabbingPlatform()).to.be(false);
    });
  });
});
