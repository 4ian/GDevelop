describe('gdjs.PlatformerObjectRuntimeBehavior', function () {
  const epsilon = 1 / (2 << 16);
  [0, 60].forEach((slopeMaxAngle) => {
    describe(`(walk on flat floors, slopeMaxAngle: ${slopeMaxAngle}°)`, function () {
      let runtimeScene;
      let object;

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
              slopeMaxAngle: slopeMaxAngle,
              jumpSustainTime: 0.2,
              useLegacyTrajectory: false,
            },
          ],
          effects: [],
        });
        object.setCustomWidthAndHeight(10, 20);
        runtimeScene.addObject(object);
      });

      const fall = (frameCount) => {
        for (let i = 0; i < frameCount; ++i) {
          const lastY = object.getY();
          runtimeScene.renderAndStep(1000 / 60);
          expect(object.getBehavior('auto1').isFalling()).to.be(true);
          expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
            true
          );
          expect(object.getBehavior('auto1').isMoving()).to.be(true);
          expect(object.getY()).to.be.above(lastY);
        }
      };

      const walkRight = (frameCount) => {
        const behavior = object.getBehavior('auto1');
        for (let i = 0; i < frameCount; ++i) {
          const lastX = object.getX();
          const lastSpeed = behavior.getCurrentSpeed();
          behavior.simulateRightKey();
          runtimeScene.renderAndStep(1000 / 60);
          expect(behavior.isOnFloor()).to.be(true);
          expect(object.getX()).to.be.above(lastX);
          // Check that the object doesn't stop
          expect(behavior.getCurrentSpeed()).to.be.above(lastSpeed);
        }
      };

      const fallOnPlatform = (maxFrameCount) => {
        // Ensure the object falls on the platform
        for (let i = 0; i < maxFrameCount; ++i) {
          runtimeScene.renderAndStep(1000 / 60);
        }
        //Check the object is on the platform
        expect(object.getBehavior('auto1').isFalling()).to.be(false);
        expect(object.getBehavior('auto1').isMoving()).to.be(false);
      };

      const slopesDimensions = {
        26: { width: 50, height: 25 },
        45: { width: 50, height: 50 },
      };

      it('can walk from a platform to another one', function () {
        // Put a platform.
        const platform = addPlatformObject(runtimeScene);
        platform.setPosition(0, -10);
        const platform2 = addPlatformObject(runtimeScene);
        platform2.setPosition(
          platform.getX() + platform.getWidth(),
          platform.getY()
        );

        object.setPosition(30, -32);
        // Ensure the object falls on the platform
        fallOnPlatform(10);
        expect(object.getY()).to.be(-30); // -30 = -10 (platform y) + -20 (object height)

        // Walk from the 1st platform to the 2nd one.
        walkRight(30);
        expect(object.getX()).to.be.above(platform2.getX());
        expect(object.getY()).to.be(platform2.getY() - object.getHeight());
      });

      it('can walk from a platform to a jump through', function () {
        // Put a platform.
        const platform = addPlatformObject(runtimeScene);
        platform.setPosition(0, -10);
        const jumpThroughPlatform = addJumpThroughPlatformObject(runtimeScene);
        jumpThroughPlatform.setPosition(
          platform.getX() + platform.getWidth(),
          platform.getY()
        );

        object.setPosition(30, -32);
        // Ensure the object falls on the platform
        fallOnPlatform(10);
        expect(object.getY()).to.be(-30); // -30 = -10 (platform y) + -20 (object height)

        // Walk from the 1st platform to the 2nd one.
        walkRight(30);
        expect(object.getX()).to.be.above(jumpThroughPlatform.getX());
        expect(object.getY()).to.be(
          jumpThroughPlatform.getY() - object.getHeight()
        );
      });

      it('can walk on a platform and go through a jump through', function () {
        // Jumpthru that are ignored had a side effects on the search context.
        // It made jumpthru appear solid when a platform was tested after them.

        // Add the jumpthru 1st to make RBrush gives it 1st.
        // There is no causality but it does in the current implementation.
        const jumpThroughPlatform = addJumpThroughPlatformObject(runtimeScene);
        jumpThroughPlatform.setPosition(30, -15);
        jumpThroughPlatform.setCustomWidthAndHeight(60, 10);

        // Put a platform.
        const platform = addPlatformObject(runtimeScene);
        platform.setPosition(0, -10);

        object.setPosition(10, -32);
        // Ensure the object falls on the platform
        fallOnPlatform(10);
        expect(object.getY()).to.be(-30); // -30 = -10 (platform y) + -20 (object height)

        // Walk from the 1st platform to the 2nd one.
        walkRight(20);
        expect(object.getX()).to.be.above(jumpThroughPlatform.getX());
        expect(object.getY()).to.be(platform.getY() - object.getHeight());
      });

      it('can walk from a platform to another one that not aligned', function () {
        // Put a platform.
        const platform = addPlatformObject(runtimeScene);
        platform.setPosition(0, -10);
        const platform2 = addPlatformObject(runtimeScene);
        platform2.setPosition(
          platform.getX() + platform.getWidth(),
          // the 2nd platform is 1 pixel higher
          platform.getY() - 1
        );

        object.setPosition(30, -32);
        // Ensure the object falls on the platform
        fallOnPlatform(10);
        expect(object.getY()).to.be(-30); // -30 = -10 (platform y) + -20 (object height)

        // Walk from the 1st platform to the 2nd one.
        walkRight(30);
        expect(object.getX()).to.be.above(platform2.getX());
        expect(object.getY()).to.be(platform2.getY() - object.getHeight());
      });

      it('can walk from a platform to another one with a speed under 1 pixel/second', function () {
        // Put a platform.
        const platform = addPlatformObject(runtimeScene);
        platform.setPosition(0, -10);
        const platform2 = addPlatformObject(runtimeScene);
        platform2.setPosition(
          platform.getX() + platform.getWidth(),
          // The 2nd platform is 1 pixels higher.
          platform.getY() - 1
        );
        // Put the object just to the left of platform2 so that
        // it try climbing on it with a very small speed.
        object.setPosition(platform2.getX() - object.getWidth(), -32);
        // Ensure the object falls on the platform
        fallOnPlatform(10);
        expect(object.getY()).to.be(-30); // -30 = -10 (platform y) + -20 (object height)

        // Walk from the 1st platform to the 2nd one.
        walkRight(30);
        expect(object.getX()).to.be.above(platform2.getX());
        expect(object.getY()).to.be(platform2.getY() - object.getHeight());
      });

      it("can't walk from a platform to another one that is a bit too high", function () {
        // Put a platform.
        const platform = addPlatformObject(runtimeScene);
        platform.setPosition(0, -10);
        const platform2 = addPlatformObject(runtimeScene);
        platform2.setPosition(
          platform.getX() + platform.getWidth(),
          // The 2nd platform is 2 pixels higher.
          platform.getY() - 2
        );

        object.setPosition(30, -32);
        // Ensure the object falls on the platform
        fallOnPlatform(10);
        expect(object.getY()).to.be(-30); // -30 = -10 (platform y) + -20 (object height)

        // walk right
        for (let i = 0; i < 20; ++i) {
          object.getBehavior('auto1').simulateRightKey();
          runtimeScene.renderAndStep(1000 / 60);
          expect(object.getBehavior('auto1').isOnFloor()).to.be(true);
        }
        // is blocked by the 2nd platform
        expect(object.getX()).to.be(platform2.getX() - object.getWidth());
        expect(object.getY()).to.be(platform.getY() - object.getHeight());
      });

      it('can walk on a platform and be blocked by a wall', function () {
        // Put a platform.
        const platform = addPlatformObject(runtimeScene);
        platform.setPosition(0, -10);
        // the 2nd platform is 2 pixels higher
        const platform2 = addPlatformObject(runtimeScene);
        platform2.setPosition(
          platform.getX() + platform.getWidth(),
          // The platform's top is over the object
          // and platform's bottom is under the object.
          platform.getY() - platform2.getHeight() + 5
        );

        object.setPosition(30, -32);
        // Ensure the object falls on the platform
        fallOnPlatform(10);
        expect(object.getY()).to.be(-30); // -30 = -10 (platform y) + -20 (object height)

        // walk right
        for (let i = 0; i < 20; ++i) {
          object.getBehavior('auto1').simulateRightKey();
          runtimeScene.renderAndStep(1000 / 60);
          expect(object.getBehavior('auto1').isOnFloor()).to.be(true);
        }
        // is blocked by the 2nd platform
        expect(object.getX()).to.be(platform2.getX() - object.getWidth());
        expect(object.getY()).to.be(platform.getY() - object.getHeight());
      });

      it('can walk from a platform and fell through a jump through that is at the right but 1 pixel higher', function () {
        // Put a platform.
        const platform = addPlatformObject(runtimeScene);
        platform.setPosition(0, -10);
        const jumpThroughPlatform = addJumpThroughPlatformObject(runtimeScene);
        jumpThroughPlatform.setPosition(
          platform.getX() + platform.getWidth(),
          // Even 1 pixel is too high to follow a jump through
          // because it's like it's gone through its right or left side.
          platform.getY() - 1
        );

        object.setPosition(30, -32);
        // Ensure the object falls on the platform
        fallOnPlatform(10);
        expect(object.getY()).to.be(-30); // -30 = -10 (platform y) + -20 (object height)

        // Walk right
        for (let i = 0; i < 20; ++i) {
          object.getBehavior('auto1').simulateRightKey();
          runtimeScene.renderAndStep(1000 / 60);
          expect(object.getBehavior('auto1').isOnFloor()).to.be(true);
        }
        // Fall under the jump through platform
        for (let i = 0; i < 11; ++i) {
          object.getBehavior('auto1').simulateRightKey();
          runtimeScene.renderAndStep(1000 / 60);
          expect(object.getBehavior('auto1').isFalling()).to.be(true);
        }
        expect(object.getY()).to.be.above(platform.getY());
      });

      it('can walk inside a tunnel platform', function () {
        // Put a platform.
        const platform = addTunnelPlatformObject(runtimeScene);
        platform.setPosition(0, 0);

        object.setPosition(0, 160);
        // The object falls on the bottom part of the platform
        fallOnPlatform(10);
        expect(object.getY()).to.be(200 - object.getHeight());

        // The object walk on the bottom part of the platform.
        walkRight(30);
        expect(object.getX()).to.be.above(60);
        expect(object.getY()).to.be(200 - object.getHeight());
      });
    });
  });

  [
    // less than 1 pixel per frame (50/60)
    50,
    // a commonly used value
    1500,
  ].forEach((maxFallingSpeed) => {
    describe(`(on floor, maxFallingSpeed=${
      maxFallingSpeed / 60
    } pixels per frame)`, function () {
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
              maxFallingSpeed: maxFallingSpeed,
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
      });

      // TODO The character falls one frame then land instead of staying on the platform.
      it.skip('must not move when on the floor at startup', function () {
        object.setPosition(0, platform.getY() - object.getHeight());

        for (let i = 0; i < 10; ++i) {
          runtimeScene.renderAndStep(1000 / 60);
          // Check the platformer object stays still.
          expect(object.getY()).to.be(-30); // -30 = -10 (platform y) + -20 (object height)
          expect(object.getBehavior('auto1').isFalling()).to.be(false);
          expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
            false
          );
          expect(object.getBehavior('auto1').isMoving()).to.be(false);
        }
      });

      it('must not move when put on a platform while falling', function () {
        object.setPosition(0, platform.getY() - object.getHeight() - 300);

        for (let i = 0; i < 10; ++i) {
          runtimeScene.renderAndStep(1000 / 60);
          expect(object.getBehavior('auto1').isFalling()).to.be(true);
          expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
            true
          );
        }

        object.setPosition(0, platform.getY() - object.getHeight());

        for (let i = 0; i < 10; ++i) {
          runtimeScene.renderAndStep(1000 / 60);
          // Check the platformer object stays still.
          expect(object.getY()).to.be(-30); // -30 = -10 (platform y) + -20 (object height)
          expect(object.getBehavior('auto1').isFalling()).to.be(false);
          expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
            false
          );
          expect(object.getBehavior('auto1').isMoving()).to.be(false);
        }
      });

      it('can track object height changes', function () {
        // Put the character near the right ledge of the platform.
        object.setPosition(
          platform.getX() + 10,
          platform.getY() - object.getHeight() + 1
        );

        for (let i = 0; i < 15; ++i) {
          runtimeScene.renderAndStep(1000 / 60);
        }

        expect(object.getBehavior('auto1').isFalling()).to.be(false);
        expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
          false
        );
        expect(object.getX()).to.be(10);
        expect(object.getY()).to.be(-30); // -30 = -10 (platform y) + -20 (object height)

        // Make the platform under the character feet smaller.
        runtimeScene.renderAndStepWithEventsFunction(1000 / 60, () => {
          object.setCustomWidthAndHeight(object.getWidth(), 9);
        });
        runtimeScene.renderAndStep(1000 / 60);
        expect(object.getBehavior('auto1').isFalling()).to.be(false);
        expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
          false
        );
        // The character follows it.
        expect(object.getY()).to.be(-19); // -19 = -10 (platform y) + -9 (object height)

        // The character walks on the platform.
        for (let i = 0; i < 10; ++i) {
          object.getBehavior('auto1').simulateRightKey();
          runtimeScene.renderAndStep(1000 / 60);
          expect(object.getBehavior('auto1').isFalling()).to.be(false);
          expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
            false
          );
        }
        expect(object.getY()).to.be(-19);
        expect(object.getX()).to.be.above(16);

        // Make the platform under the character feet bigger.
        object.setCustomWidthAndHeight(object.getWidth(), 20);
        runtimeScene.renderAndStep(1000 / 60);
        // The character follows it.
        expect(object.getY()).to.be(-30); // -30 = -10 (platform y) + -20 (object height)
      });

      it('can track platform angle changes', function () {
        // The initial platforms AABB are put in RBush.
        runtimeScene.renderAndStep(1000 / 60);

        // Now change the angle to check that the AABB is updated in RBush.
        platform.setAngle(90);

        // Put the character above the rotated platform.
        object.setPosition(
          platform.getX() + platform.getWidth() / 2,
          platform.getY() +
            (platform.getHeight() - platform.getWidth()) / 2 -
            object.getHeight() -
            10
        );

        for (let i = 0; i < 15; ++i) {
          runtimeScene.renderAndStep(1000 / 60);
        }

        // The character should land on it.
        expect(object.getBehavior('auto1').isFalling()).to.be(false);
        expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
          false
        );
        expect(object.getX()).to.be(30);
        expect(object.getY()).to.be(-44);
      });
    });
  });

  describe(`(walk on flat floors with custom hitbox)`, function () {
    let runtimeScene;
    let object;

    beforeEach(function () {
      runtimeScene = makePlatformerTestRuntimeScene();

      // Put a platformer object on a platform
      object = new gdjs.TestSpriteRuntimeObject(runtimeScene, {
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
        animations: [
          {
            name: 'animation',
            directions: [
              {
                sprites: [
                  {
                    originPoint: { x: 25, y: 25 },
                    centerPoint: { x: 50, y: 50 },
                    points: [
                      { name: 'Center', x: 0, y: 0 },
                      { name: 'Origin', x: 50, y: 50 },
                    ],
                    hasCustomCollisionMask: true,
                    customCollisionMask: [
                      [
                        { x: 25, y: 25 },
                        { x: 75, y: 25 },
                        { x: 75, y: 75 },
                        { x: 25, y: 75 },
                      ],
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });
      object.setUnscaledWidthAndHeight(100, 100);
      object.setCustomWidthAndHeight(20, 40);
      runtimeScene.addObject(object);
    });

    // The actual hitbox is 10x20.
    const objectWidth = 10;
    const objectHeight = 20;

    const fall = (frameCount) => {
      for (let i = 0; i < frameCount; ++i) {
        const lastY = object.getY();
        runtimeScene.renderAndStep(1000 / 60);
        expect(object.getBehavior('auto1').isFalling()).to.be(true);
        expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
          true
        );
        expect(object.getBehavior('auto1').isMoving()).to.be(true);
        expect(object.getY()).to.be.above(lastY);
      }
    };

    const walkRight = (frameCount) => {
      const behavior = object.getBehavior('auto1');
      for (let i = 0; i < frameCount; ++i) {
        const lastX = object.getX();
        const lastSpeed = behavior.getCurrentSpeed();
        behavior.simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
        expect(behavior.isOnFloor()).to.be(true);
        expect(object.getX()).to.be.above(lastX);
        // Check that the object doesn't stop
        expect(behavior.getCurrentSpeed()).to.be.above(lastSpeed);
      }
    };

    const fallOnPlatform = (maxFrameCount) => {
      // Ensure the object falls on the platform
      for (let i = 0; i < maxFrameCount; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }
      //Check the object is on the platform
      expect(object.getBehavior('auto1').isFalling()).to.be(false);
      expect(object.getBehavior('auto1').isMoving()).to.be(false);
    };

    it('can walk on a platform and be blocked by a wall', function () {
      // Put a platform.
      const platform = addPlatformObject(runtimeScene);
      platform.setPosition(0, -10);
      // the 2nd platform is 2 pixels higher
      const wall = addPlatformObject(runtimeScene);
      wall.setPosition(
        platform.getX() + platform.getWidth(),
        // The platform is top is over the object
        // and platform is bottom is under the object.
        platform.getY() - wall.getHeight() + 5
      );

      object.setPosition(30, -32);
      // Ensure the object falls on the platform
      fallOnPlatform(10);
      expect(object.getY()).to.be(-30); // -30 = -10 (platform y) + -20 (object height)

      // walk right
      for (let i = 0; i < 25; ++i) {
        object.getBehavior('auto1').simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
        expect(object.getBehavior('auto1').isOnFloor()).to.be(true);
      }
      // is blocked by the wall
      expect(object.getX()).to.be(wall.getX() - objectWidth);
      expect(object.getY()).to.be(platform.getY() - objectHeight);
    });
  });

  describe('Floating-point error mitigations', function () {
    it('Specific coordinates with slopeMaxAngle=0 creating Y oscillations and drift on a moving floor', function () {
      const runtimeScene = makePlatformerTestRuntimeScene();

      // Create a Sprite object that has the origin at a specific position (see below)
      // and that has a slope max angle of 0 (so it can't climb on a floor even if it's a bit higher
      // than the bottom of the object).
      const object = new gdjs.TestSpriteRuntimeObject(runtimeScene, {
        name: 'obj1',
        type: '',
        behaviors: [
          {
            type: 'PlatformBehavior::PlatformerObjectBehavior',
            name: 'auto1',
            gravity: 1300,
            maxFallingSpeed: 1000,
            acceleration: 500,
            deceleration: 1500,
            maxSpeed: 280,
            jumpSpeed: 750,
            canGrabPlatforms: true,
            ignoreDefaultControls: true,
            slopeMaxAngle: 0,
            jumpSustainTime: 0.2,
            useLegacyTrajectory: false,
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
                    originPoint: { x: 5, y: 19 },
                    centerPoint: { x: 5, y: 46 },
                    points: [
                      { name: 'Center', x: 5, y: 46 },
                      { name: 'Origin', x: 5, y: 19 },
                    ],
                    hasCustomCollisionMask: false,
                  },
                ],
              },
            ],
          },
        ],
      });

      // Set the size of the object so that it results in a specific
      // Y position for the bottom of the object AABB:
      object.setUnscaledWidthAndHeight(10, 92);
      object.setCustomWidthAndHeight(10, 66.0008);
      // Origin Y is originally 19.
      // After the scaling, it is now 19*66.0008/92=13.6306.

      // Set the Y position so that the object falls at a Y position on the floor
      // that would generate oscillations.
      object.setPosition(0, 139.3118);
      runtimeScene.addObject(object);

      // Put a platform at a specific Y that can cause oscillations.
      const platform = addJumpThroughPlatformObject(runtimeScene);
      platform.setPosition(0, 193.000000000001);
      // This means that the exact Y position the object should take is:
      // platform Y - height + origin Y = 193.000000000001-66.0008+13.6306 = 140.6298

      // Wait for the object to fall on the floor
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getBehavior('auto1').isFalling()).to.be(true);
      expect(object.getBehavior('auto1').isOnFloor()).to.be(false);

      // Ensure it is on the floor
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getBehavior('auto1').isFalling()).to.be(false);
      expect(object.getBehavior('auto1').isOnFloor()).to.be(true);
      // The Y position won't be exact because of floating point errors.
      // expect(object.getY()).to.be(140.6298)
      expect(object.getY()).to.be.within(140.6297999, 140.6298001);

      // Move the platform by 6 pixels to the right.
      for (let index = 0; index < 6; index++) {
        runtimeScene.renderAndStepWithEventsFunction(1000 / 60, () => {
          platform.setX(platform.getX() + 1);
        });
      }

      // Ensure the object followed the platform on the X axis.
      // If the floating point errors caused oscillations between two Y positions,
      // it won't work because the object will get repositioned back to its old X position
      // whenever the floor is considered "too high" for the object to reach.
      expect(object.getBehavior('auto1').isFalling()).to.be(false);
      expect(object.getBehavior('auto1').isOnFloor()).to.be(true);
      expect(object.getY()).to.be.within(140.6297999, 140.6298001);
      // TODO Remove the 1-frame delay
      expect(object.getX()).to.be(5);
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getX()).to.be(6);
    });
  });

  [20, 30, 60, 120].forEach((framesPerSecond) => {
    describe(`(FPS independent trajectory: ${framesPerSecond} fps)`, function () {
      let runtimeScene;
      let object;

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
      });

      const fallOnPlatform = (maxFrameCount) => {
        // Ensure the object falls on the platform
        for (let i = 0; i < maxFrameCount; ++i) {
          runtimeScene.renderAndStep(1000 / 60);
        }
        //Check the object is on the platform
        expect(object.getBehavior('auto1').isFalling()).to.be(false);
        expect(object.getBehavior('auto1').isMoving()).to.be(false);
      };

      it('can walk', function () {
        const platform = addPlatformObject(runtimeScene);
        platform.setPosition(0, -10);
        platform.setCustomWidthAndHeight(600, 32);

        object.setPosition(0, -32);
        // Ensure the object falls on the platform
        fallOnPlatform(10);
        expect(object.getY()).to.be(-30);

        // Accelerate
        for (let i = 0; i < framesPerSecond; ++i) {
          object.getBehavior('auto1').simulateRightKey();
          runtimeScene.renderAndStep(1000 / 60);
        }

        // Reached the maximum speed
        expect(object.getX()).to.be.within(250 - epsilon, 250 + epsilon);
        expect(object.getY()).to.be(platform.getY() - object.getHeight());
        expect(object.getBehavior('auto1').getCurrentSpeed()).to.be.within(
          500 - epsilon,
          500 + epsilon
        );

        // Decelerate
        for (let i = 0; i < framesPerSecond / 3; ++i) {
          runtimeScene.renderAndStep(1000 / 60);
        }

        // Stopped
        expect(object.getX()).to.be.within(333, 334);
        expect(object.getY()).to.be(platform.getY() - object.getHeight());
        expect(object.getBehavior('auto1').getCurrentSpeed()).to.be(0);
      });
    });
  });
});
