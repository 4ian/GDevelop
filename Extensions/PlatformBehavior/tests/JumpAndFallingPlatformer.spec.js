describe('gdjs.PlatformerObjectRuntimeBehavior', function () {
  const epsilon = 1 / (2 << 16);
  describe('(falling)', function () {
    let runtimeScene;
    let object;
    let platform;

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
            useLegacyTrajectory: false,
          },
        ],
        effects: [],
      });
      object.setCustomWidthAndHeight(10, 20);
      runtimeScene.addObject(object);
      object.setPosition(0, -100);

      // Put a platform.
      platform = addPlatformObject(runtimeScene);
      platform.setPosition(0, -10);
      runtimeScene.renderAndStep(1000 / 60);
    });

    it('can fall when in the air', function () {
      // The character falls.
      for (let i = 0; i < 10; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
        expect(object.getBehavior('auto1').isFalling()).to.be(true);
        expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
          true
        );
      }
      for (let i = 0; i < 20; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }

      // The platform stopped the character.
      expect(object.getY()).to.be(-30); // -30 = -10 (platform y) + -20 (object height)
      expect(object.getBehavior('auto1').isFalling()).to.be(false);
      expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
        false
      );
      expect(object.getBehavior('auto1').isMoving()).to.be(false);

      // The character walk out of the platform.
      for (let i = 0; i < 35; ++i) {
        object.getBehavior('auto1').simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
      }
      expect(object.getX()).to.be.above(84);
      expect(object.getY()).to.be(-26.875);
      expect(object.getBehavior('auto1').isFalling()).to.be(true);
      expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(true);

      // Let the speed on X axis go back to 0.
      for (let i = 0; i < 50; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }
      expect(object.getBehavior('auto1').getCurrentSpeed()).to.be(0);
    });

    it('falls when a platform is moved away', function () {
      object.setPosition(0, -32);
      // Ensure the object falls on the platform
      for (let i = 0; i < 10; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }
      //Check the object is on the platform
      expect(object.getY()).to.be.within(-31, -30); // -30 = -10 (platform y) + -20 (object height)
      expect(object.getBehavior('auto1').isFalling()).to.be(false);
      expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
        false
      );
      expect(object.getBehavior('auto1').isMoving()).to.be(false);

      // move the platform away
      platform.setPosition(-100, -100);
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getBehavior('auto1').isFalling()).to.be(true);
      expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(true);
    });

    it('falls when a platform is removed', function () {
      object.setPosition(0, -32);
      // Ensure the object falls on the platform
      for (let i = 0; i < 10; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }
      // Check the object is on the platform
      expect(object.getY()).to.be.within(-31, -30); // -30 = -10 (platform y) + -20 (object height)
      expect(object.getBehavior('auto1').isFalling()).to.be(false);
      expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
        false
      );
      expect(object.getBehavior('auto1').isMoving()).to.be(false);

      // Remove the platform
      runtimeScene.markObjectForDeletion(platform);
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getBehavior('auto1').isFalling()).to.be(true);
      expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(true);
    });

    [
      'Jump',
      'Right',
      'Left',
      'Up',
      'Down',
      'Ladder',
      'Release',
      'Release Ladder',
    ].forEach((key) => {
      it(`can tell that ${key} key is used`, function () {
        object.getBehavior('auto1').simulateControl(key);
        // The condition applies only after the key is actually used by the platformer character.
        expect(object.getBehavior('auto1').isUsingControl(key)).to.be(false);
        runtimeScene.renderAndStep(1000 / 60);
        expect(object.getBehavior('auto1').isUsingControl(key)).to.be(true);

        runtimeScene.renderAndStep(1000 / 60);
        // The key wasn't hold. It's forgotten.
        expect(object.getBehavior('auto1').isUsingControl(key)).to.be(false);
      });
    });
  });

  [20, 30, 60, 120].forEach((framesPerSecond) => {
    describe(`(FPS independent trajectory: ${framesPerSecond} fps)`, function () {
      let runtimeScene;
      let object;
      let platform;

      beforeEach(function () {
        runtimeScene = makePlatformerTestRuntimeScene(1000 / framesPerSecond);

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
        object.setPosition(0, -32);

        // Put a platform.
        platform = addPlatformObject(runtimeScene);
        platform.setPosition(0, -10);
      });

      it('can jump', function () {
        // Ensure the object falls on the platform
        for (let i = 0; i < framesPerSecond / 6; ++i) {
          runtimeScene.renderAndStep(1000 / framesPerSecond);
        }

        //Check the object is on the platform
        expect(object.getY()).to.be(-30); // -30 = -10 (platform y) + -20 (object height)
        expect(object.getBehavior('auto1').isFalling()).to.be(false);
        expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
          false
        );
        expect(object.getBehavior('auto1').isMoving()).to.be(false);

        // Jump with sustaining 1/10 of second
        // A jump will at least sustain one frame,
        // because the jump key is pressed.
        // To have the same sustain time for each fps,
        // we use their greatest common divisor: 10.
        for (let i = 0; i < framesPerSecond / 10; ++i) {
          object.getBehavior('auto1').simulateJumpKey();
          runtimeScene.renderAndStep(1000 / framesPerSecond);
        }
        expect(object.getY()).to.be.within(-112.5 - epsilon, -112.5 + epsilon);

        // Jump without sustaining
        for (let i = 0; i < framesPerSecond / 4 - 1; ++i) {
          runtimeScene.renderAndStep(1000 / framesPerSecond);
          expect(object.getBehavior('auto1').isJumping()).to.be(true);
          expect(object.getBehavior('auto1').isFalling()).to.be(false);
          expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
            false
          );
        }

        // Check that we reached the maximum height
        expect(object.getY()).to.be.above(-206.25);
        // At 30 fps, the maximum value is between 2 frames.
        if (framesPerSecond !== 30) {
          runtimeScene.renderAndStep(1000 / framesPerSecond);
          expect(object.getY()).to.be.within(
            -206.25 - epsilon,
            -206.25 + epsilon
          );
        }
        runtimeScene.renderAndStep(1000 / framesPerSecond);
        expect(object.getY()).to.be.above(-206.25);

        // Then let the object fall
        for (let i = 0; i < framesPerSecond / 3 - 2; ++i) {
          runtimeScene.renderAndStep(1000 / framesPerSecond);
          expect(object.getBehavior('auto1').isJumping()).to.be(true);
          expect(object.getBehavior('auto1').isFalling()).to.be(true);
          expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
            false
          );
        }
        // The landing happens 1 or 2 frames sooner for some fps.
        // This is expected as a collision is involved.
        runtimeScene.renderAndStep(1000 / framesPerSecond);
        runtimeScene.renderAndStep(1000 / framesPerSecond);

        runtimeScene.renderAndStep(1000 / framesPerSecond);
        expect(object.getBehavior('auto1').isFalling()).to.be(false);
        expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
          false
        );
        expect(object.getBehavior('auto1').isOnFloor()).to.be(true);
        expect(object.getY()).to.be(-30);
      });
    });
  });

  // The legacy trajectory calculus uses Euler method instead of Verlet integration.
  // In this mode, the character is jumping higher at lower frame rates.
  describe('(FPS dependent trajectory: 120 fps)', function () {
    let runtimeScene;
    let object;
    let platform;

    beforeEach(function () {
      runtimeScene = makePlatformerTestRuntimeScene(1000 / 120);

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
            useLegacyTrajectory: true,
          },
        ],
        effects: [],
      });
      object.setCustomWidthAndHeight(10, 20);
      runtimeScene.addObject(object);
      object.setPosition(0, -32);

      // Put a platform.
      platform = addPlatformObject(runtimeScene);
      platform.setPosition(0, -10);
    });

    it('can jump', function () {
      // Ensure the object falls on the platform
      for (let i = 0; i < 120 / 6; ++i) {
        runtimeScene.renderAndStep(1000 / 120);
      }

      // Check the object is on the platform
      expect(object.getY()).to.be(-30); // -30 = -10 (platform y) + -20 (object height)
      expect(object.getBehavior('auto1').isFalling()).to.be(false);
      expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
        false
      );
      expect(object.getBehavior('auto1').isMoving()).to.be(false);

      // Jump with sustaining 1/10 of second
      for (let i = 0; i < 120 / 10; ++i) {
        object.getBehavior('auto1').simulateJumpKey();
        runtimeScene.renderAndStep(1000 / 120);
      }
      expect(object.getY()).to.be(-113.125);

      // Jump without sustaining
      for (let i = 0; i < 120 / 4; ++i) {
        runtimeScene.renderAndStep(1000 / 120);
        expect(object.getBehavior('auto1').isJumping()).to.be(true);
        expect(object.getBehavior('auto1').isFalling()).to.be(false);
        expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
          false
        );
      }

      // Check that we reached the maximum height
      expect(object.getY()).to.be(-210);
      // The maximum is between these 2 frames
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getY()).to.be(-210);

      // Then, let the object fall.
      for (let i = 0; i < 120 / 3; ++i) {
        runtimeScene.renderAndStep(1000 / 120);
        expect(object.getBehavior('auto1').isJumping()).to.be(true);
        expect(object.getBehavior('auto1').isFalling()).to.be(true);
        expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
          false
        );
      }
      runtimeScene.renderAndStep(1000 / 120);
      expect(object.getBehavior('auto1').isFalling()).to.be(false);
      expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
        false
      );
      expect(object.getBehavior('auto1').isOnFloor()).to.be(true);
      expect(object.getY()).to.be(-30);
    });
  });

  describe('(FPS dependent trajectory: 60 fps)', function () {
    let runtimeScene;
    let object;
    let platform;

    beforeEach(function () {
      runtimeScene = makePlatformerTestRuntimeScene(1000 / 60);

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
            useLegacyTrajectory: true,
          },
        ],
        effects: [],
      });
      object.setCustomWidthAndHeight(10, 20);
      runtimeScene.addObject(object);
      object.setPosition(0, -32);

      // Put a platform.
      platform = addPlatformObject(runtimeScene);
      platform.setPosition(0, -10);
    });

    it('can jump', function () {
      // Ensure the object falls on the platform
      for (let i = 0; i < 10; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }

      //Check the object is on the platform
      expect(object.getY()).to.be(-30); // -30 = -10 (platform y) + -20 (object height)
      expect(object.getBehavior('auto1').isFalling()).to.be(false);
      expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
        false
      );
      expect(object.getBehavior('auto1').isMoving()).to.be(false);

      // Jump with sustaining 1/10 of second
      for (let i = 0; i < 60 / 10; ++i) {
        object.getBehavior('auto1').simulateJumpKey();
        runtimeScene.renderAndStep(1000 / 120);
      }
      expect(object.getY()).to.be(-113.75);

      // Jump without sustaining
      object.getBehavior('auto1').simulateJumpKey();
      for (let i = 0; i < 60 / 4; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
        expect(object.getBehavior('auto1').isJumping()).to.be(true);
        expect(object.getBehavior('auto1').isFalling()).to.be(false);
        expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
          false
        );
      }

      // Check that we reached the maximum height
      expect(object.getY()).to.be.above(-220);
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getY()).to.be(-220);
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getY()).to.be.above(-220);

      // Then let the object fall
      for (let i = 0; i < 60 / 3; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
        expect(object.getBehavior('auto1').isJumping()).to.be(true);
        expect(object.getBehavior('auto1').isFalling()).to.be(true);
        expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
          false
        );
      }
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getBehavior('auto1').isFalling()).to.be(false);
      expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
        false
      );
      expect(object.getBehavior('auto1').isOnFloor()).to.be(true);
      expect(object.getY()).to.be(-30);
    });
  });

  describe('(FPS dependent trajectory: 30 fps)', function () {
    let runtimeScene;
    let object;
    let platform;

    beforeEach(function () {
      runtimeScene = makePlatformerTestRuntimeScene(1000 / 30);

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
            useLegacyTrajectory: true,
          },
        ],
        effects: [],
      });
      object.setCustomWidthAndHeight(10, 20);
      runtimeScene.addObject(object);
      object.setPosition(0, -32);

      // Put a platform.
      platform = addPlatformObject(runtimeScene);
      platform.setPosition(0, -10);
    });

    it('can jump', function () {
      // Ensure the object falls on the platform
      for (let i = 0; i < 5; ++i) {
        runtimeScene.renderAndStep(1000 / 30);
      }

      //Check the object is on the platform
      expect(object.getY()).to.be(-30); // -30 = -10 (platform y) + -20 (object height)
      expect(object.getBehavior('auto1').isFalling()).to.be(false);
      expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
        false
      );
      expect(object.getBehavior('auto1').isMoving()).to.be(false);

      // Jump with sustaining 1/10 of second
      for (let i = 0; i < 30 / 10; ++i) {
        object.getBehavior('auto1').simulateJumpKey();
        runtimeScene.renderAndStep(1000 / 120);
      }
      expect(object.getY()).to.be(-115);

      // Jump without sustaining
      object.getBehavior('auto1').simulateJumpKey();
      for (let i = 0; i < 30 / 4; ++i) {
        runtimeScene.renderAndStep(1000 / 30);
        expect(object.getBehavior('auto1').isJumping()).to.be(true);
        expect(object.getBehavior('auto1').isFalling()).to.be(false);
        expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
          false
        );
      }

      // Check that we reached the maximum height
      expect(object.getY()).to.be(-233 - 1 / 3);
      // The maximum is between these 2 frames
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getY()).to.be(-233 - 1 / 3);

      // Then let the object fall
      for (let i = 0; i < 30 / 3; ++i) {
        runtimeScene.renderAndStep(1000 / 30);
        expect(object.getBehavior('auto1').isJumping()).to.be(true);
        expect(object.getBehavior('auto1').isFalling()).to.be(true);
        expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
          false
        );
      }
      runtimeScene.renderAndStep(1000 / 30);
      expect(object.getBehavior('auto1').isFalling()).to.be(false);
      expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
        false
      );
      expect(object.getBehavior('auto1').isOnFloor()).to.be(true);
      expect(object.getY()).to.be(-30);
    });
  });

  describe('(jump and jump sustain)', function () {
    let runtimeScene;
    let object;
    let platform;

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
      object.setPosition(0, -32);

      // Put a platform.
      platform = addPlatformObject(runtimeScene);
      platform.setPosition(0, -10);
    });

    it('can jump, sustaining the jump', function () {
      // Ensure the object falls on the platform
      for (let i = 0; i < 10; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }

      //Check the object is on the platform
      expect(object.getY()).to.be(-30); // -30 = -10 (platform y) + -20 (object height)
      expect(object.getBehavior('auto1').isFalling()).to.be(false);
      expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
        false
      );
      expect(object.getBehavior('auto1').isMoving()).to.be(false);

      // Forbid to jump
      object.getBehavior('auto1').setCanNotAirJump();
      // It has no impact as the object is on a platform.
      expect(object.getBehavior('auto1').canJump()).to.be(true);

      // Jump with sustaining as much as possible, and
      // even more (18 frames at 60fps is greater than 0.2s)
      for (let i = 0; i < 18; ++i) {
        object.getBehavior('auto1').simulateJumpKey();
        runtimeScene.renderAndStep(1000 / 60);
      }

      // Check the height reached
      expect(object.getY()).to.be.within(-225 - epsilon, -225 + epsilon);
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getY()).to.be.within(
        -229.5833333333333 - epsilon,
        -229.5833333333333 + epsilon
      );
      for (let i = 0; i < 4; ++i) {
        // Verify that pressing the jump key does not change anything
        object.getBehavior('auto1').simulateJumpKey();
        runtimeScene.renderAndStep(1000 / 60);
      }

      // Check that we reached the maximum height
      expect(object.getY()).to.be.above(-240);
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getY()).to.be.within(-240 - epsilon, -240 + epsilon);
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getY()).to.be.above(-240);

      // Then let the object fall
      for (let i = 0; i < 60; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }
      expect(object.getY()).to.be(-30);
    });

    it('can jump, and only sustain the jump while key held', function () {
      // Ensure the object falls on the platform
      for (let i = 0; i < 10; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }

      //Check the object is on the platform
      expect(object.getY()).to.be(-30); // -30 = -10 (platform y) + -20 (object height)
      expect(object.getBehavior('auto1').isFalling()).to.be(false);
      expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
        false
      );
      expect(object.getBehavior('auto1').isMoving()).to.be(false);

      // Jump with sustaining a bit (5 frames at 60fps = 0.08s), then stop
      for (let i = 0; i < 5; ++i) {
        object.getBehavior('auto1').simulateJumpKey();
        runtimeScene.renderAndStep(1000 / 60);
      }
      expect(object.getY()).to.be.within(-100, -99);

      // Stop holding the jump key
      runtimeScene.renderAndStep(1000 / 60);

      for (let i = 0; i < 13; ++i) {
        // then hold it again (but it's too late, jump sustain is gone for this jump)
        object.getBehavior('auto1').simulateJumpKey();
        runtimeScene.renderAndStep(1000 / 60);
      }

      // Check that we reached the maximum height
      expect(object.getY()).to.be.above(-199.7916666666666 + epsilon);
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getY()).to.be.within(
        -199.7916666666666 - epsilon,
        -199.7916666666666 + epsilon
      );
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getY()).to.be.within(
        -199.7916666666666 - epsilon,
        -199.7916666666666 + epsilon
      );
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getY()).to.be.above(-199.7916666666666 + epsilon);

      // Then let the object fall
      expect(object.getBehavior('auto1').isFalling()).to.be(true);
      expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
        false
      );
      for (let i = 0; i < 20; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }
      expect(object.getY()).to.be(-30);
    });

    it('should not jump after falling from a platform', function () {
      // Ensure the object falls on the platform
      for (let i = 0; i < 10; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }

      // Check the object is on the platform
      // So at this point, the object could jump
      expect(object.getY()).to.be(-30); // -30 = -10 (platform y) + -20 (object height)
      expect(object.getBehavior('auto1').isFalling()).to.be(false);
      expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
        false
      );
      expect(object.getBehavior('auto1').isMoving()).to.be(false);

      // Fall from the platform
      for (let i = 0; i < 35; ++i) {
        object.getBehavior('auto1').simulateLeftKey();
        runtimeScene.renderAndStep(1000 / 60);
      }

      // Try to jump
      object.getBehavior('auto1').simulateJumpKey();
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getBehavior('auto1').isJumping()).to.be(false);
      expect(object.getBehavior('auto1').isFalling()).to.be(true);
      expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(true);
    });

    it('can be allowed to jump in mid air after falling from a platform', function () {
      // Ensure the object falls on the platform
      for (let i = 0; i < 10; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }

      // Check the object is on the platform
      expect(object.getY()).to.be(-30); // -30 = -10 (platform y) + -20 (object height)
      expect(object.getBehavior('auto1').isFalling()).to.be(false);
      expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
        false
      );
      expect(object.getBehavior('auto1').isMoving()).to.be(false);

      // Fall from the platform
      for (let i = 0; i < 20; ++i) {
        object.getBehavior('auto1').simulateLeftKey();
        runtimeScene.renderAndStep(1000 / 60);
      }
      // Allow to jump in mid air
      expect(object.getBehavior('auto1').isFalling()).to.be(true);
      object.getBehavior('auto1').setCanJump();
      expect(object.getBehavior('auto1').canJump()).to.be(true);

      // Can jump in the air
      object.getBehavior('auto1').simulateJumpKey();
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getBehavior('auto1').isJumping()).to.be(true);
      expect(object.getBehavior('auto1').isFalling()).to.be(false);
      expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
        false
      );

      for (let i = 0; i < 40; ++i) {
        object.getBehavior('auto1').simulateLeftKey();
        runtimeScene.renderAndStep(1000 / 60);
      }
      expect(object.getBehavior('auto1').isJumping()).to.be(false);

      // Can no longer to jump
      object.getBehavior('auto1').simulateJumpKey();
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getBehavior('auto1').isJumping()).to.be(false);
      expect(object.getBehavior('auto1').isFalling()).to.be(true);
      expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(true);
    });

    it('can still be allowed to jump in mid air after its jump speed reached 0', function () {
      // Ensure the object falls on the platform
      for (let i = 0; i < 10; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }

      // Check the object is on the platform
      expect(object.getY()).to.be(-30); // -30 = -10 (platform y) + -20 (object height)
      expect(object.getBehavior('auto1').isFalling()).to.be(false);
      expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
        false
      );
      expect(object.getBehavior('auto1').isMoving()).to.be(false);

      // Jump
      object.getBehavior('auto1').simulateJumpKey();
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getBehavior('auto1').isJumping()).to.be(true);
      expect(object.getBehavior('auto1').isFalling()).to.be(false);
      expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
        false
      );
      expect(object.getBehavior('auto1').canJump()).to.be(false);

      // Allow to jump again
      object.getBehavior('auto1').setCanJump();

      // Is jumping
      for (let i = 0; i < 40; ++i) {
        object.getBehavior('auto1').simulateLeftKey();
        runtimeScene.renderAndStep(1000 / 60);
        // Can still jump...
        expect(object.getBehavior('auto1').canJump()).to.be(true);
      }
      // ...even when after the jump ended.
      expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(true);
      expect(object.getBehavior('auto1').isFalling()).to.be(true);
      expect(object.getBehavior('auto1').isJumping()).to.be(false);

      // Jump again
      object.getBehavior('auto1').simulateJumpKey();
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getBehavior('auto1').isJumping()).to.be(true);
      expect(object.getBehavior('auto1').isFalling()).to.be(false);
      expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
        false
      );
      expect(object.getBehavior('auto1').canJump()).to.be(false);
    });

    it('can allow coyote time', function () {
      // Ensure the object falls on the platform
      for (let i = 0; i < 10; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }

      // Check the object is on the platform
      expect(object.getY()).to.be(-30); // -30 = -10 (platform y) + -20 (object height)
      expect(object.getBehavior('auto1').isFalling()).to.be(false);
      expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
        false
      );
      expect(object.getBehavior('auto1').isMoving()).to.be(false);

      // Fall from the platform
      for (let i = 0; i < 20; ++i) {
        object.getBehavior('auto1').simulateLeftKey();
        runtimeScene.renderAndStep(1000 / 60);
      }
      // Allow to jump
      expect(object.getBehavior('auto1').isFalling()).to.be(true);
      object.getBehavior('auto1').setCanJump();
      expect(object.getBehavior('auto1').canJump()).to.be(true);

      // Still falling from the platform
      for (let i = 0; i < 4; ++i) {
        object.getBehavior('auto1').simulateLeftKey();
        runtimeScene.renderAndStep(1000 / 60);
      }

      // Suppose that we miss an eventual time frame or some condition.
      // So we forbid to jump again:
      object.getBehavior('auto1').setCanNotAirJump();
      expect(object.getBehavior('auto1').canJump()).to.be(false);

      // Can no longer to jump in mid air
      object.getBehavior('auto1').simulateJumpKey();
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getBehavior('auto1').isJumping()).to.be(false);
      expect(object.getBehavior('auto1').isFalling()).to.be(true);
      expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(true);
    });

    it('should not grab a platform while in the ascending phase of a jump', function () {
      const topPlatform = addPlatformObject(runtimeScene);
      topPlatform.setPosition(12, -80);
      runtimeScene.renderAndStep(1000 / 60);

      // Ensure the object falls on the platform
      for (let i = 0; i < 10; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }

      // Check the object is on the platform
      expect(object.getY()).to.be(-30); // -30 = -10 (platform y) + -20 (object height)
      expect(object.getBehavior('auto1').isFalling()).to.be(false);
      expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
        false
      );
      expect(object.getBehavior('auto1').isMoving()).to.be(false);

      // Jump without sustaining
      object.getBehavior('auto1').simulateJumpKey();
      for (let i = 0; i < 3; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
        expect(object.getBehavior('auto1').isJumping()).to.be(true);
      }
      // the object is against the platform side
      expect(object.getY()).to.be.within(
        topPlatform.getY(),
        topPlatform.getY() + object.getHeight()
      );

      // try to grab the platform
      for (let i = 0; i < 20; ++i) {
        object.getBehavior('auto1').simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
        expect(object.getBehavior('auto1').isJumping()).to.be(true);
        expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
          false
        );
      }
      // Check that the object didn't grabbed the platform
      expect(object.getX()).to.be.above(
        topPlatform.getX() - object.getWidth() + 20
      );
      expect(object.getBehavior('auto1').isGrabbingPlatform()).to.be(false);
    });

    it('can grab a platform while in the descending phase of a jump', function () {
      const topPlatform = addPlatformObject(runtimeScene);
      topPlatform.setPosition(12, -120);
      runtimeScene.renderAndStep(1000 / 60);

      // Ensure the object falls on the platform
      for (let i = 0; i < 10; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }

      // Check the object is on the platform
      expect(object.getY()).to.be(-30); // -30 = -10 (platform y) + -20 (object height)
      expect(object.getBehavior('auto1').isFalling()).to.be(false);
      expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
        false
      );
      expect(object.getBehavior('auto1').isMoving()).to.be(false);

      // Jump, reach the top and go down
      object.getBehavior('auto1').simulateJumpKey();
      for (let i = 0; i < 29; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
        expect(object.getBehavior('auto1').isJumping()).to.be(true);
      }
      // the object is against the platform side
      expect(object.getY()).to.be.within(
        topPlatform.getY() - object.getHeight(),
        topPlatform.getY()
      );

      // Verify the object is in the falling state of the jump:
      expect(object.getBehavior('auto1').isFalling()).to.be(true);
      expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
        false
      );

      // try to grab the platform
      for (let i = 0; i < 30; ++i) {
        object.getBehavior('auto1').simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
      }
      // Check that the object grabbed the platform
      expect(object.getY()).to.be(topPlatform.getY());
      expect(object.getBehavior('auto1').isGrabbingPlatform()).to.be(true);
    });

    it('should not grab a platform while walking', function () {
      const topPlatform = addPlatformObject(runtimeScene);
      topPlatform.setPosition(20, platform.getY() - object.getHeight());
      runtimeScene.renderAndStep(1000 / 60);

      // Ensure the object falls on the platform
      for (let i = 0; i < 10; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }

      // Check the object is on the platform
      expect(object.getY()).to.be(-30); // -30 = -10 (platform y) + -20 (object height)
      expect(object.getBehavior('auto1').isFalling()).to.be(false);
      expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
        false
      );
      expect(object.getBehavior('auto1').isMoving()).to.be(false);

      // try to grab the platform
      for (let i = 0; i < 30; ++i) {
        object.getBehavior('auto1').simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
        expect(object.getBehavior('auto1').isOnFloor()).to.be(true);
      }

      // The object is where it could grab the top platform if it was falling.
      expect(object.getX()).to.be.within(
        topPlatform.getX() - object.getWidth(),
        topPlatform.getX() - object.getWidth() + 2
      );
      expect(object.getY()).to.be(topPlatform.getY());
      // Check that the object didn't grabbed the platform
      expect(object.getBehavior('auto1').isGrabbingPlatform()).to.be(false);
    });

    const goToJumpPeak = () => {
      // Ensure the object falls on the platform
      for (let i = 0; i < 60 / 6; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }

      //Check the object is on the platform
      expect(object.getY()).to.be(-30); // -30 = -10 (platform y) + -20 (object height)
      expect(object.getBehavior('auto1').isFalling()).to.be(false);
      expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
        false
      );
      expect(object.getBehavior('auto1').isMoving()).to.be(false);

      // Jump with sustaining 1/10 of second
      // A jump will at least sustain one frame,
      // because the jump key is pressed.
      // To have the same sustain time for each fps,
      // we use their greatest common divisor: 10.
      for (let i = 0; i < 60 / 10; ++i) {
        object.getBehavior('auto1').simulateJumpKey();
        runtimeScene.renderAndStep(1000 / 60);
      }
      expect(object.getY()).to.be.within(-112.5 - epsilon, -112.5 + epsilon);

      // Jump without sustaining
      for (let i = 0; i < 60 / 4 - 1; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
        expect(object.getBehavior('auto1').isJumping()).to.be(true);
        expect(object.getBehavior('auto1').isFalling()).to.be(false);
        expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
          false
        );
      }

      // Check that we reached the maximum height
      expect(object.getY()).to.be.above(-206.25);
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getY()).to.be.within(-206.25 - epsilon, -206.25 + epsilon);
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getY()).to.be.above(-206.25);
    };

    it('can change the maximum falling speed without changing the vertical speed', function () {
      goToJumpPeak();

      // Change the maximum falling speed from 550 to 200 (for instance, for a gliding mode)
      const previousFallSpeed = object
        .getBehavior('auto1')
        .getCurrentFallSpeed();
      const previousJumpSpeed = object
        .getBehavior('auto1')
        .getCurrentJumpSpeed();
      object.getBehavior('auto1').setMaxFallingSpeed(200, true);
      runtimeScene.renderAndStep(1000 / 60);
      // The character speed stays the same (25 is the acceleration).
      // The jump speed is reduced as much as the falling speed.
      expect(object.getBehavior('auto1').getCurrentFallSpeed()).to.be(
        previousFallSpeed - 350
      );
      expect(object.getBehavior('auto1').getCurrentJumpSpeed()).to.be(
        previousJumpSpeed - 350 - 25
      );
    });

    it('can change the maximum falling speed and avoid changing the vertical speed too much', function () {
      goToJumpPeak();
      // Then let the object fall a bit
      for (let i = 0; i < 15; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
        expect(object.getBehavior('auto1').isJumping()).to.be(true);
        expect(object.getBehavior('auto1').isFalling()).to.be(true);
        expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
          false
        );
      }

      // Change the maximum falling speed from 550 to 200 (for instance, for a gliding mode)
      expect(object.getBehavior('auto1').getCurrentFallSpeed()).to.be(925);
      expect(object.getBehavior('auto1').getCurrentJumpSpeed()).to.be(125);
      object.getBehavior('auto1').setMaxFallingSpeed(200, true);
      runtimeScene.renderAndStep(1000 / 60);
      // The character jump speed is set to 0 to reduce the speed gap.
      expect(object.getBehavior('auto1').getCurrentFallSpeed()).to.be(200);
      expect(object.getBehavior('auto1').getCurrentJumpSpeed()).to.be(0);
    });

    it('can abort a jump', function () {
      goToJumpPeak();

      // Abort the jump
      object.getBehavior('auto1').abortJump();
      runtimeScene.renderAndStep(1000 / 60);
      // jump and fall speeds are reset (25 is the acceleration).
      expect(object.getBehavior('auto1').getCurrentFallSpeed()).to.be(25);
      expect(object.getBehavior('auto1').getCurrentJumpSpeed()).to.be(0);
      expect(object.getBehavior('auto1').isJumping()).to.be(false);
      expect(object.getBehavior('auto1').isFalling()).to.be(true);
      expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(true);
    });
  });

  describe('(jumpthru)', function () {
    let runtimeScene;
    let object;
    let platform;
    let jumpthru;

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
            maxFallingSpeed: 1500,
            acceleration: 500,
            deceleration: 1500,
            maxSpeed: 500,
            jumpSpeed: 500,
            canGrabPlatforms: true,
            ignoreDefaultControls: true,
            slopeMaxAngle: 60,
            canGoDownFromJumpthru: true,
            useLegacyTrajectory: false,
          },
        ],
        effects: [],
      });
      object.setCustomWidthAndHeight(10, 20);
      runtimeScene.addObject(object);
      object.setPosition(0, -30);

      // Put a platform.
      platform = addPlatformObject(runtimeScene);
      platform.setPosition(0, -10);

      // Put a jump thru, higher than the platform so that the object jump from under it
      // and will land on it at the end of the jump.
      jumpthru = new gdjs.TestRuntimeObject(runtimeScene, {
        name: 'obj2',
        type: '',
        behaviors: [
          {
            type: 'PlatformBehavior::PlatformBehavior',
            name: 'Platform',
            canBeGrabbed: true,
            platformType: 'Jumpthru',
          },
        ],
        effects: [],
      });
      jumpthru.setCustomWidthAndHeight(60, 5);
      runtimeScene.addObject(jumpthru);
    });

    it('can jump through a jumpthru and land', function () {
      jumpthru.setPosition(0, -32);
      //Check the platform stopped the platformer object.
      for (let i = 0; i < 5; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }
      expect(object.getY()).to.be(-30); // -30 = -10 (platform y) + -20 (object height)
      expect(object.getBehavior('auto1').isFalling()).to.be(false);
      expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
        false
      );
      expect(object.getBehavior('auto1').isMoving()).to.be(false);

      // Check that the jump starts properly, and is not stopped on the jumpthru
      object.getBehavior('auto1').simulateJumpKey();
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getY()).to.be.within(-39, -38);
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getY()).to.be.within(-46, -45);
      runtimeScene.renderAndStep(1000 / 60);
      // At this step, the object is almost on the jumpthru (-52 + 20 (object height) = -32 (jump thru Y position)),
      // but the object should not stop.
      expect(object.getY()).to.be.within(-53, -52);
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getY()).to.be.within(-60, -59);
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getY()).to.be.within(-66, -65);

      // Verify the object is still jumping
      expect(object.getBehavior('auto1').isJumping()).to.be(true);
      expect(object.getBehavior('auto1').isFalling()).to.be(false);

      // Continue the simulation and check that position is correct in the middle of the jump
      for (let i = 0; i < 20; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }
      expect(object.getY()).to.be.within(-83, -82);

      // Verify the object is now considered as falling in its jump:
      expect(object.getBehavior('auto1').isFalling()).to.be(true);
      expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
        false
      );

      // Continue simulation and check that we arrive on the jumpthru
      for (let i = 0; i < 10; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }
      expect(object.getY()).to.be.within(
        jumpthru.getY() - object.getHeight(),
        jumpthru.getY() - object.getHeight() + 1
      );
      expect(object.getBehavior('auto1').isFalling()).to.be(false);
    });

    it('can go down from a jump through', function () {
      object.setPosition(0, -55);
      jumpthru.setPosition(0, -32);
      // The character lands on the jumpthru.
      for (let i = 0; i < 5; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }
      expect(object.getY()).to.be(-52); // -52 = -32 (jumpthru y) + -20 (object height)
      expect(object.getBehavior('auto1').isFalling()).to.be(false);
      expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
        false
      );

      // The character goes down from the jumpthru.
      object.getBehavior('auto1').simulateDownKey();
      runtimeScene.renderAndStep(1000 / 60);
      for (let i = 0; i < 10; ++i) {
        const previousY = object.getY();
        runtimeScene.renderAndStep(1000 / 60);
        expect(object.getBehavior('auto1').isFalling()).to.be(true);
        expect(object.getY()).to.be.greaterThan(previousY);
      }
    });

    it('can jump right under a jumpthru without landing', function () {
      // A big one because the object jump to the right.
      jumpthru.setCustomWidthAndHeight(600, 20);
      const highestJumpY = -99.41666666666661;
      // Right above the maximum reach by jumping
      jumpthru.setPosition(0, Math.floor(highestJumpY) + object.getHeight());

      // The object landed on the platform.
      for (let i = 0; i < 5; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }
      expect(object.getY()).to.be(-30); // -30 = -10 (platform y) + -20 (object height)
      expect(object.getBehavior('auto1').isFalling()).to.be(false);
      expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
        false
      );
      expect(object.getBehavior('auto1').isMoving()).to.be(false);

      // The object jumps.
      object.getBehavior('auto1').simulateJumpKey();
      for (let i = 0; i < 16; ++i) {
        object.getBehavior('auto1').simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
        expect(object.getBehavior('auto1').isJumping()).to.be(true);
        expect(object.getBehavior('auto1').isFalling()).to.be(false);
      }
      // The object is at the highest of the jump.
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getY()).to.be.within(
        highestJumpY - epsilon,
        highestJumpY + epsilon
      );

      // The object starts to fall.
      object.getBehavior('auto1').simulateRightKey();
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getBehavior('auto1').isFalling()).to.be(true);
      expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
        false
      );

      // The object still falls.
      for (let i = 0; i < 10; ++i) {
        object.getBehavior('auto1').simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
        expect(object.getBehavior('auto1').isFalling()).to.be(true);
      }
      expect(object.getY()).to.be.above(-85);
    });

    it('can jump right above a jumpthru and landing', function () {
      // A big one because the object jump to the right.
      jumpthru.setCustomWidthAndHeight(600, 20);
      const highestJumpY = -99.41666666666661;
      // Right above the maximum reach by jumping
      jumpthru.setPosition(0, Math.ceil(highestJumpY) + object.getHeight());

      // The object landed on the platform.
      for (let i = 0; i < 5; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }
      expect(object.getY()).to.be(-30); // -30 = -10 (platform y) + -20 (object height)
      expect(object.getBehavior('auto1').isFalling()).to.be(false);
      expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
        false
      );
      expect(object.getBehavior('auto1').isMoving()).to.be(false);

      // The object jumps.
      object.getBehavior('auto1').simulateJumpKey();
      for (let i = 0; i < 16; ++i) {
        object.getBehavior('auto1').simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
        expect(object.getBehavior('auto1').isJumping()).to.be(true);
        expect(object.getBehavior('auto1').isFalling()).to.be(false);
      }
      // The object is at the highest of the jump.
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getY()).to.be.within(
        highestJumpY - epsilon,
        highestJumpY + epsilon
      );

      // The object landed on the jumpthru.
      object.getBehavior('auto1').simulateRightKey();
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getBehavior('auto1').isOnFloor()).to.be(true);
      expect(object.getBehavior('auto1').isFalling()).to.be(false);
      expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
        false
      );
      expect(object.getY()).to.be(jumpthru.getY() - object.getHeight());
    });

    it('can fall through the jumpthru from the left side', function () {
      object.setPosition(0, -100);
      jumpthru.setPosition(12, -90);
      jumpthru.setCustomWidthAndHeight(60, 100);

      // The jumpthru lets the character go through.
      for (let i = 0; i < 10; ++i) {
        object.getBehavior('auto1').simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
        expect(object.getBehavior('auto1').isFalling()).to.be(true);
        expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
          true
        );
        expect(object.getBehavior('auto1').isMoving()).to.be(true);
      }
      // The character is overlapping the jumpthru.
      expect(object.getX()).to.above(jumpthru.getX() - object.getWidth() + 3);
      expect(object.getY()).to.be.within(
        jumpthru.getY() - object.getHeight() + 10,
        jumpthru.getY() + jumpthru.getHeight() - 10
      );
    });

    it('can fall through a jumpthru from the left side and land on another jumpthru', function () {
      object.setPosition(0, -100);
      jumpthru.setPosition(12, -90);
      jumpthru.setCustomWidthAndHeight(60, 20);

      // Add another jumpthru under with a 10 pixels interleave (less than object height).
      bottomJumpthru = addJumpThroughPlatformObject(runtimeScene);
      bottomJumpthru.setPosition(0, -70);
      bottomJumpthru.setCustomWidthAndHeight(60, 20);

      // The jumpthru lets the character go through.
      for (let i = 0; i < 7; ++i) {
        object.getBehavior('auto1').simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
        expect(object.getBehavior('auto1').isFalling()).to.be(true);
        expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
          true
        );
        expect(object.getBehavior('auto1').isMoving()).to.be(true);
      }
      // The character is overlapping the jumpthru.
      expect(object.getX()).to.above(jumpthru.getX() - object.getWidth() + 1);
      expect(object.getY()).to.be.within(
        jumpthru.getY() - object.getHeight() + 1,
        jumpthru.getY() + jumpthru.getHeight() - 1
      );

      // The character lands on the other jumpthru
      // while still overlapping the other one.
      for (let i = 0; i < 5; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }
      expect(object.getBehavior('auto1').isOnFloor()).to.be(true);
      expect(object.getBehavior('auto1').isFalling()).to.be(false);
      expect(object.getBehavior('auto1').isMoving()).to.be(false);
      expect(object.getY()).to.be(bottomJumpthru.getY() - object.getHeight());
    });

    it('can fall through a jumpthru from the left side and land on another jumpthru at the exact same frame', function () {
      object.setPosition(0, -100);
      jumpthru.setPosition(10, -90);
      jumpthru.setCustomWidthAndHeight(60, 20);

      // Add another jumpthru under with a 10 pixels interleave (less than object height).
      bottomJumpthru = addJumpThroughPlatformObject(runtimeScene);
      bottomJumpthru.setPosition(0, -70);
      bottomJumpthru.setCustomWidthAndHeight(60, 20);

      // The character falls next to the jumpthru.
      for (let i = 0; i < 8; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
        expect(object.getBehavior('auto1').isFalling()).to.be(true);
        expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
          true
        );
        expect(object.getBehavior('auto1').isMoving()).to.be(true);
      }
      // The character is right at the left of "jumpthru".
      expect(object.getX()).to.be(0);
      // The character is right above "bottomJumpthru".
      expect(object.getY()).to.be.within(
        bottomJumpthru.getY() - object.getHeight() - 2,
        bottomJumpthru.getY() - object.getHeight() - 1
      );

      object.getBehavior('auto1').simulateRightKey();
      runtimeScene.renderAndStep(1000 / 60);

      // The character is overlapping "jumpthru"...
      expect(object.getX()).to.be.above(0);
      // ...and "bottomJumpthru" at the same frame.
      // The character lands on "bottomJumpthru".
      expect(object.getY()).to.be(bottomJumpthru.getY() - object.getHeight());
      expect(object.getBehavior('auto1').isOnFloor()).to.be(true);
      expect(object.getBehavior('auto1').isFalling()).to.be(false);

      // The character stays on the jumpthru
      for (let i = 0; i < 5; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }
      expect(object.getY()).to.be(bottomJumpthru.getY() - object.getHeight());
      expect(object.getBehavior('auto1').isOnFloor()).to.be(true);
      expect(object.getBehavior('auto1').isFalling()).to.be(false);
      expect(object.getBehavior('auto1').isMoving()).to.be(false);
    });
  });

  describe('and gdjs.PlatformRuntimeBehavior at same time - ', function () {
    let runtimeScene;
    let object;
    let platform;
    var object2;

    beforeEach(function () {
      runtimeScene = makePlatformerTestRuntimeScene();

      // Put a platformer object on a platform.
      object = new gdjs.TestRuntimeObject(runtimeScene, {
        name: 'obj1',
        type: '',
        behaviors: [
          {
            type: 'PlatformBehavior::PlatformerObjectBehavior',
            name: 'PlatformerObject',
            gravity: 900,
            maxFallingSpeed: 1500,
            acceleration: 500,
            deceleration: 1500,
            maxSpeed: 500,
            jumpSpeed: 500,
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
      object.setPosition(0, -30);

      // Put a platform.
      platform = addPlatformObject(runtimeScene);
      platform.setPosition(0, -10);

      // Put a platformer object that is also a platform itself.
      object2 = new gdjs.TestRuntimeObject(runtimeScene, {
        name: 'obj2',
        type: '',
        behaviors: [
          {
            type: 'PlatformBehavior::PlatformerObjectBehavior',
            name: 'PlatformerObject',
            gravity: 900,
            maxFallingSpeed: 1500,
            acceleration: 500,
            deceleration: 1500,
            maxSpeed: 500,
            jumpSpeed: 500,
            canGrabPlatforms: true,
            ignoreDefaultControls: true,
            slopeMaxAngle: 60,
            useLegacyTrajectory: false,
          },
          {
            type: 'PlatformBehavior::PlatformBehavior',
            name: 'Platform',
            canBeGrabbed: true,
            platformType: 'Platform',
          },
        ],
        effects: [],
      });
      object2.setCustomWidthAndHeight(10, 20);
      runtimeScene.addObject(object2);

      // Position it above the other platformer object and just on its right,
      // but one pixel too much so that the first platformer object will be moved
      // left by 1px when the second platformer object+platform falls.
      object2.setPosition(9, -60);
    });

    it('can move', function () {
      // The 2nd object falls (it's not stopped by itself).
      expect(object2.getY()).to.be(-60);
      for (let i = 0; i < 4; i++) {
        const previousY = object2.getY();
        runtimeScene.renderAndStep(1000 / 60);
        expect(object2.getY()).to.be.above(previousY);
        expect(object2.getBehavior('PlatformerObject').isFalling()).to.be(true);
      }
      expect(object2.getY()).to.be(-58);

      // The 1st object stays on the platform.
      expect(object.getY()).to.be(-30);

      // The 2nd object can't jump on itself.
      for (let i = 0; i < 4; ++i) {
        object2.getBehavior('PlatformerObject').simulateJumpKey();
        runtimeScene.renderAndStep(1000 / 60);
      }
      expect(object2.getY()).to.be.below(object.getY() - object2.getHeight());
      expect(object.getX()).to.be(0);
      expect(object.getY()).to.be(-30);
      // At the 1st frame of collision, the result depends on execution order.
      // The effect on the 1st object is not tested.
      runtimeScene.renderAndStep(1000 / 60);
      expect(object2.getY()).to.be.above(object.getY() - object2.getHeight());

      // 1st the object can be pushed down, when the intersection height < 1.
      runtimeScene.renderAndStep(1000 / 60);
      // The falling platformer object+platform collides with the 1st object.
      // The 1st object moves 1px to the left.
      runtimeScene.renderAndStep(1000 / 60);
      expect(object2.getY()).to.be.above(
        object.getY() - object2.getHeight() + 1
      );
      expect(object.getX()).to.be(-1);
      expect(object.getY()).to.be(-30);

      // The 2nd object reaches the floor.
      for (let i = 0; i < 20; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }
      expect(object2.getX()).to.be(9);
      expect(object2.getY()).to.be(-30);
      expect(object.getX()).to.be(-1);
      expect(object.getY()).to.be(-30);

      // Start a jump for both objects
      object.getBehavior('PlatformerObject').simulateJumpKey();
      object2.getBehavior('PlatformerObject').simulateJumpKey();
      for (let i = 0; i < 6; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }
      expect(object2.getX()).to.be(9);
      expect(object2.getY()).to.be.below(-70);
      expect(object.getX()).to.be(-1);
      expect(object.getY()).to.be.below(-70);

      // Try to go right for the first object: won't work because the other
      // object is a platform.
      for (let i = 0; i < 5; ++i) {
        object.getBehavior('PlatformerObject').simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
      }
      expect(object2.getX()).to.be(9);
      expect(object2.getY()).to.be.below(-90);
      expect(object.getX()).to.be(-1);
      expect(object.getY()).to.be.below(-90);

      // Try to go right for the first and second object: can do.
      for (let i = 0; i < 3; ++i) {
        object.getBehavior('PlatformerObject').simulateRightKey();
        object2.getBehavior('PlatformerObject').simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
      }
      expect(object2.getX()).to.be.above(9.5);
      expect(object2.getY()).to.be.below(-95);
      expect(object.getX()).to.be.above(-0.8);
      expect(object.getY()).to.be.below(-95);

      // Let the object fall back on the floor.
      for (let i = 0; i < 20; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }
      expect(object2.getX()).to.be.above(9.5);
      expect(object2.getY()).to.be(-30);
      expect(object.getX()).to.be.above(-0.8);
      expect(object.getY()).to.be(-30);
    });
  });

  describe('(jump against a wall)', function () {
    /** @type {gdjs.RuntimeScene} */
    let runtimeScene;
    /** @type {gdjs.RuntimeObject} */
    let object;
    /** @type {gdjs.PlatformerObjectRuntimeBehavior} */
    let behavior;

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
      behavior = object.getBehavior('auto1');
      object.setCustomWidthAndHeight(10, 20);
      runtimeScene.addObject(object);
      // The object is in the corner of the platform.
      object.setPosition(80 - 10, 80 - 20);
    });

    [
      {
        wallBeing: 'distinct from the floor',
        createPlatforms: (runtimeScene) => {
          const floor = addPlatformObject(runtimeScene);
          floor.setPosition(0, 80);
          floor.setCustomWidthAndHeight(100, 20);

          const wall = addPlatformObject(runtimeScene);
          wall.setPosition(80, 0);
          wall.setCustomWidthAndHeight(20, 100);
        },
      },
      {
        wallBeing: 'merged with the floor',
        createPlatforms: (runtimeScene) => {
          const platform = addFloorAndWallPlatformObject(runtimeScene);
          platform.setPosition(0, 0);
        },
      },
    ].forEach(({ wallBeing, createPlatforms }) => {
      it(`can jump while moving against a wall ${wallBeing}`, function () {
        createPlatforms(runtimeScene);

        // The object stays on the platform.
        for (let i = 0; i < 5; ++i) {
          runtimeScene.renderAndStep(1000 / 60);
        }
        expect(object.getY()).to.within(60 - epsilon, 60 + epsilon);
        expect(behavior.isFalling()).to.be(false);
        expect(behavior.isFallingWithoutJumping()).to.be(false);
        expect(behavior.isMoving()).to.be(false);

        // Jump without sustain.
        behavior.simulateJumpKey();
        behavior.simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
        expect(behavior.isJumping()).to.be(true);
        // The object is jumping and get higher.
        for (let i = 0; i < 5; ++i) {
          const oldY = object.getY();
          behavior.simulateRightKey();
          runtimeScene.renderAndStep(1000 / 60);
          expect(behavior.isJumping()).to.be(true);
          expect(object.getX()).to.be(80 - 10);
          expect(object.getY()).to.be.lessThan(oldY);
        }
      });
    });
  });

  describe('(jump from slopes)', function () {
    /** @type {gdjs.RuntimeScene} */
    let runtimeScene;
    /** @type {gdjs.RuntimeObject} */
    let object;
    /** @type {gdjs.PlatformerObjectRuntimeBehavior} */
    let behavior;

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
            gravity: 150,
            maxFallingSpeed: 1500,
            acceleration: 1000000,
            deceleration: 1500,
            maxSpeed: 2000,
            // This is a very low speed relatively to other properties.
            // This is not a playable configuration.
            jumpSpeed: 100,
            canGrabPlatforms: true,
            ignoreDefaultControls: true,
            slopeMaxAngle: 60,
            jumpSustainTime: 0.2,
            useLegacyTrajectory: false,
          },
        ],
        effects: [],
      });
      behavior = object.getBehavior('auto1');
      object.setCustomWidthAndHeight(10, 20);
      runtimeScene.addObject(object);
      // The object is in the slope.
      object.setPosition(0, 70);

      const platform = addUpSlopePlatformObject(runtimeScene);
      platform.setPosition(0, 0);
    });

    // This is a edge case. The test can be changed if necessary.
    // Usually characters jump speed is higher than the speed on Y following a
    // slope.
    it('can jump while moving up on a slope', function () {
      // The object stays on the platform.
      for (let i = 0; i < 5; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }
      expect(object.getY()).to.within(70, 70 + 1);
      expect(behavior.isFalling()).to.be(false);
      expect(behavior.isFallingWithoutJumping()).to.be(false);
      expect(behavior.isMoving()).to.be(false);

      behavior.simulateRightKey();
      runtimeScene.renderAndStep(1000 / 60);

      // Jump without sustain.
      behavior.simulateJumpKey();
      behavior.simulateRightKey();
      runtimeScene.renderAndStep(1000 / 60);
      expect(behavior.isJumping()).to.be(true);
      // The object is jumping and is kind of sliding on the slope.
      // This behavior is not expected but it avoid the character to be stuck
      // into the floor in more common cases.
      for (let i = 0; i < 19; ++i) {
        const oldY = object.getY();
        behavior.simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
        expect(behavior.isJumping()).to.be(true);
        expect(object.getY()).to.be.lessThan(oldY);
        // As soon as: behavior.getCurrentJumpSpeed() - behavior.getCurrentFallSpeed()
        // The character is in the falling step of the jump and it can land.
        expect(behavior.isFalling()).to.be(false);
      }
      // The character lands.
      behavior.simulateRightKey();
      runtimeScene.renderAndStep(1000 / 60);
      expect(behavior.isOnFloor()).to.be(true);
    });
  });

  describe('(jump from slopes)', function () {
    /** @type {gdjs.RuntimeScene} */
    let runtimeScene;
    /** @type {gdjs.RuntimeObject} */
    let object;
    /** @type {gdjs.PlatformerObjectRuntimeBehavior} */
    let behavior;

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
            gravity: 900,
            maxFallingSpeed: 1500,
            acceleration: 500,
            deceleration: 1500,
            maxSpeed: 500,
            jumpSpeed: 500,
            canGrabPlatforms: true,
            ignoreDefaultControls: true,
            slopeMaxAngle: 60,
            jumpSustainTime: 0.2,
            useLegacyTrajectory: false,
          },
        ],
        effects: [],
      });
      behavior = object.getBehavior('auto1');
      object.setCustomWidthAndHeight(10, 20);
      runtimeScene.addObject(object);
      // The object is in the slope.
      object.setPosition(0, 70);

      const platform = addUpSlopePlatformObject(runtimeScene);
      platform.setPosition(0, 0);
    });

    it('keep its speed on X when jumping while moving up on a slope', function () {
      // The object stays on the platform.
      for (let i = 0; i < 5; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }
      expect(object.getY()).to.within(70, 70 + 1);
      expect(behavior.isFalling()).to.be(false);
      expect(behavior.isFallingWithoutJumping()).to.be(false);
      expect(behavior.isMoving()).to.be(false);

      // Walk and gain speed.
      for (let i = 0; i < 5; ++i) {
        behavior.simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
      }
      const walkingSpeed = behavior.getCurrentSpeed();

      // Jump and keep the speed.
      behavior.simulateJumpKey();
      behavior.simulateRightKey();
      runtimeScene.renderAndStep(1000 / 60);
      expect(behavior.isJumping()).to.be(true);
      expect(behavior.getCurrentSpeed()).to.be.greaterThan(walkingSpeed);
      for (let i = 0; i < 5; ++i) {
        const oldY = object.getY();
        behavior.simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
        expect(behavior.isJumping()).to.be(true);
        expect(behavior.isFalling()).to.be(false);
        expect(behavior.getCurrentSpeed()).to.be.greaterThan(walkingSpeed);
      }
    });
  });

  describe('(jump to slopes)', function () {
    /** @type {gdjs.RuntimeScene} */
    let runtimeScene;
    /** @type {gdjs.RuntimeObject} */
    let object;
    /** @type {gdjs.PlatformerObjectRuntimeBehavior} */
    let behavior;

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
            gravity: 900,
            maxFallingSpeed: 1500,
            acceleration: 500,
            deceleration: 1500,
            maxSpeed: 500,
            jumpSpeed: 200,
            canGrabPlatforms: true,
            ignoreDefaultControls: true,
            slopeMaxAngle: 60,
            jumpSustainTime: 0.2,
            useLegacyTrajectory: false,
          },
        ],
        effects: [],
      });
      behavior = object.getBehavior('auto1');
      object.setCustomWidthAndHeight(10, 20);
      runtimeScene.addObject(object);
      // The object is in the slope.
      object.setPosition(10, -20);

      addPlatformObject(runtimeScene);
      const platform = addUpSlopePlatformObject(runtimeScene);
      platform.setPosition(60, -100);
    });

    it('keep its speed on X when landing on a slope', function () {
      // The object stays on the platform.
      for (let i = 0; i < 5; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }
      expect(object.getY()).to.within(-20, -20 + 1);
      expect(behavior.isFalling()).to.be(false);
      expect(behavior.isFallingWithoutJumping()).to.be(false);
      expect(behavior.isMoving()).to.be(false);

      // Walk and gain speed.
      for (let i = 0; i < 20; ++i) {
        behavior.simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
      }
      const walkingSpeed = behavior.getCurrentSpeed();

      // Jump and keep the speed.
      behavior.simulateJumpKey();
      behavior.simulateRightKey();
      runtimeScene.renderAndStep(1000 / 60);
      expect(behavior.isJumping()).to.be(true);
      expect(behavior.getCurrentSpeed()).to.be.greaterThan(100);
      for (let i = 0; i < 6; ++i) {
        const oldY = object.getY();
        behavior.simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
        expect(behavior.isJumping()).to.be(true);
        expect(behavior.getCurrentSpeed()).to.be.greaterThan(100);
      }

      // Land on the slope and keep the speed.
      behavior.simulateRightKey();
      runtimeScene.renderAndStep(1000 / 60);
      expect(behavior.isOnFloor()).to.be(true);
      expect(behavior.getCurrentSpeed()).to.be.greaterThan(100);
    });
  });
});
