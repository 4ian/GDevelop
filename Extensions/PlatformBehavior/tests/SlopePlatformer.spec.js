describe('gdjs.PlatformerObjectRuntimeBehavior', function () {
  const epsilon = 1 / (2 << 16);

  describe('(walk on slopes)', function () {
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

    const walkRightCanStop = (frameCount) => {
      const behavior = object.getBehavior('auto1');
      for (let i = 0; i < frameCount; ++i) {
        const lastX = object.getX();
        const lastSpeed = behavior.getCurrentSpeed();
        behavior.simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
        expect(behavior.isOnFloor()).to.be(true);
        expect(object.getX()).to.not.be.below(lastX);
      }
    };

    const walkLeft = (frameCount) => {
      const behavior = object.getBehavior('auto1');
      for (let i = 0; i < frameCount; ++i) {
        const lastX = object.getX();
        const lastSpeed = behavior.getCurrentSpeed();
        behavior.simulateLeftKey();
        runtimeScene.renderAndStep(1000 / 60);
        expect(behavior.isOnFloor()).to.be(true);
        expect(object.getX()).to.be.below(lastX);
        // Check that the object doesn't stop
        expect(behavior.getCurrentSpeed()).to.be.below(lastSpeed);
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

    it('can walk from a platform to another one that is rotated', function () {
      // Put a platform.
      const platform = addPlatformObject(runtimeScene);
      platform.setPosition(0, -10);

      const platform2 = addPlatformObject(runtimeScene);

      const angle = (-30 * Math.PI) / 180;
      const centerDeltaX = platform2.getWidth() / 2;
      const centerDeltaY = platform2.getHeight() / 2;
      // to make the vertex of the 2 platform touch
      const vertexDeltaX =
        centerDeltaX * Math.cos(angle) +
        centerDeltaY * -Math.sin(angle) -
        centerDeltaX;
      const vertexDeltaY =
        centerDeltaX * Math.sin(angle) +
        centerDeltaY * Math.cos(angle) -
        centerDeltaY;

      platform2.setAngle(-30);
      platform2.setPosition(
        platform.getX() + platform.getWidth() + vertexDeltaX,
        platform.getY() + vertexDeltaY
      );

      object.setPosition(30, -32);
      // Ensure the object falls on the platform
      fallOnPlatform(10);
      expect(object.getY()).to.be(-30); // -30 = -10 (platform y) + -20 (object height)

      // Walk from the 1st platform to the 2nd one.
      walkRight(30);
      expect(object.getX()).to.be.above(platform2.getX());
      // Gone upward following the 2nd platform.
      expect(object.getY()).to.be.below(platform.getY());
    });

    [26, 45].forEach((slopeAngle) => {
      it(`can go uphill from a 0° slope to a ${slopeAngle}° slope going right`, function () {
        // Put a platform.
        const platform = addPlatformObject(runtimeScene);
        platform.setCustomWidthAndHeight(50, 50);
        platform.setPosition(0, 0);

        const slope = addUpSlopePlatformObject(runtimeScene);
        slope.setCustomWidthAndHeight(
          slopesDimensions[slopeAngle].width,
          slopesDimensions[slopeAngle].height
        );
        slope.setPosition(
          platform.getX() + platform.getWidth(),
          platform.getY() - slope.getHeight()
        );

        object.setPosition(0, -32);
        // Ensure the object falls on the platform
        fallOnPlatform(10);

        // Walk from the 1st platform to the 2nd one.
        walkRight(30);
        expect(object.getX()).to.be.above(slope.getX());
        // Gone upward following the 2nd platform.
        expect(object.getY()).to.be.below(platform.getY() - object.getHeight());
      });

      // This is a mirror of the previous test.
      it(`can go uphill from a 0° slope to a ${slopeAngle}° slope going left`, function () {
        // Put a platform.
        const platform = addPlatformObject(runtimeScene);
        platform.setCustomWidthAndHeight(50, 50);
        platform.setPosition(50, 0);

        const slope = addDownSlopePlatformObject(runtimeScene);
        slope.setCustomWidthAndHeight(
          slopesDimensions[slopeAngle].width,
          slopesDimensions[slopeAngle].height
        );
        slope.setPosition(
          platform.getX() - slope.getWidth(),
          platform.getY() - slope.getHeight()
        );

        object.setPosition(90, -32);
        // Ensure the object falls on the platform
        fallOnPlatform(10);

        // Walk from the 1st platform to the 2nd one.
        walkLeft(30);
        expect(object.getX()).to.be.below(platform.getX());
        // Gone upward following the 2nd platform.
        expect(object.getY()).to.be.below(platform.getY() - object.getHeight());
      });

      it(`can go uphill from a ${slopeAngle}° slope to a 0° slope`, function () {
        // Put a platform.
        const slope = addUpSlopePlatformObject(runtimeScene);
        slope.setCustomWidthAndHeight(
          slopesDimensions[slopeAngle].width,
          slopesDimensions[slopeAngle].height
        );
        slope.setPosition(0, 0);

        const platform = addPlatformObject(runtimeScene);
        platform.setCustomWidthAndHeight(50, 50);
        platform.setPosition(slope.getX() + slope.getWidth(), slope.getY());

        object.setPosition(0, -5);
        // Ensure the object falls on the platform
        fallOnPlatform(12);

        // Walk from the 1st platform to the 2nd one.
        walkRight(30);
        expect(object.getX()).to.be.above(platform.getX());
        // Gone upward following the 2nd platform.
        expect(object.getY()).to.be(platform.getY() - object.getHeight());
      });

      it(`can go uphill from a ${slopeAngle}° slope to a 0° jump through platform`, function () {
        // Put a platform.
        const slope = addUpSlopePlatformObject(runtimeScene);
        slope.setCustomWidthAndHeight(
          slopesDimensions[slopeAngle].width,
          slopesDimensions[slopeAngle].height
        );
        slope.setPosition(0, 0);

        const jumpThroughPlatform = addJumpThroughPlatformObject(runtimeScene);
        jumpThroughPlatform.setCustomWidthAndHeight(50, 50);
        jumpThroughPlatform.setPosition(
          slope.getX() + slope.getWidth(),
          slope.getY()
        );

        object.setPosition(0, -5);
        // Ensure the object falls on the platform
        fallOnPlatform(12);

        // Walk from the 1st platform to the 2nd one.
        walkRight(30);
        expect(object.getX()).to.be.above(jumpThroughPlatform.getX());
        // Gone upward following the 2nd platform.
        expect(object.getY()).to.be(
          jumpThroughPlatform.getY() - object.getHeight()
        );
      });

      [
        [26, 45],
        [45, 26],
        [26, 26],
        [45, 45],
      ].forEach((slopeAngles) => {
        it(`can go uphill from a ${slopeAngles[0]}° slope to a ${slopeAngles[1]}° slope`, function () {
          // Put a platform.
          const slope1 = addUpSlopePlatformObject(runtimeScene);
          slope1.setCustomWidthAndHeight(
            slopesDimensions[slopeAngles[0]].width,
            slopesDimensions[slopeAngles[0]].height
          );
          slope1.setPosition(0, 0);

          const slope2 = addUpSlopePlatformObject(runtimeScene);
          slope2.setCustomWidthAndHeight(
            slopesDimensions[slopeAngles[1]].width,
            slopesDimensions[slopeAngles[1]].height
          );
          slope2.setPosition(
            slope1.getX() + slope1.getWidth(),
            slope1.getY() - slope2.getHeight()
          );

          object.setPosition(0, -5);
          // Ensure the object falls on the platform
          fallOnPlatform(12);

          // Walk from the 1st platform to the 2nd one.
          walkRight(30);
          expect(object.getX()).to.be.above(slope2.getX());
          // Gone upward following the 2nd platform.
          expect(object.getY()).to.be.below(slope1.getY() - object.getHeight());
        });
      });

      // TODO
      it.skip(`can go uphill from a 26° slope and be stopped by an obstacle on the head`, function () {
        // Put a platform.
        const slope = addUpSlopePlatformObject(runtimeScene);
        slope.setCustomWidthAndHeight(100, 50);
        slope.setPosition(0, 0);

        const ceiling = addPlatformObject(runtimeScene);
        ceiling.setCustomWidthAndHeight(50, 50);
        ceiling.setPosition(
          50,
          slope.getY() - ceiling.getHeight() - object.getHeight() / 2
        );

        object.setPosition(0, -5);
        // Ensure the object falls on the platform
        fallOnPlatform(12);

        // Walk the slope and reach the ceiling.
        // It checks that the character never go left.
        walkRightCanStop(40);
        expect(object.getY()).to.be(ceiling.getY() + ceiling.getHeight());
      });

      [26, 45].forEach((slopeAngle) => {
        it(`can go downhill from a 0° slope to a ${slopeAngle}° slope`, function () {
          // Put a platform.
          const platform = addPlatformObject(runtimeScene);
          platform.setCustomWidthAndHeight(50, 50);
          platform.setPosition(0, 0);

          const slope = addDownSlopePlatformObject(runtimeScene);
          slope.setCustomWidthAndHeight(
            slopesDimensions[slopeAngle].width,
            slopesDimensions[slopeAngle].height
          );
          slope.setPosition(
            platform.getX() + platform.getWidth(),
            platform.getY()
          );

          object.setPosition(0, -32);
          // Ensure the object falls on the platform
          fallOnPlatform(10);

          // Walk from the 1st platform to the 2nd one.
          walkRight(30);
          expect(object.getX()).to.be.above(slope.getX());
          // Gone downward following the 2nd platform.
          expect(object.getY()).to.be.above(slope.getY() - object.getHeight());
        });

        it(`can go downhill from a ${slopeAngle}° slope to a 0° slope`, function () {
          // Put a platform.
          const slope = addDownSlopePlatformObject(runtimeScene);
          slope.setCustomWidthAndHeight(
            slopesDimensions[slopeAngle].width,
            slopesDimensions[slopeAngle].height
          );
          slope.setPosition(0, 0);

          const platform = addPlatformObject(runtimeScene);
          slope.setCustomWidthAndHeight(50, 50);
          platform.setPosition(
            slope.getX() + slope.getWidth(),
            slope.getY() + slope.getHeight()
          );

          object.setPosition(0, -32);
          // Ensure the object falls on the platform
          fallOnPlatform(10);

          // Walk from the 1st platform to the 2nd one.
          walkRight(30);
          expect(object.getX()).to.be.above(platform.getX());
          // Gone downward following the 2nd platform.
          // The floor detection can't round it to 30
          // because the character bottom is 50 with rounding error
          // 29.999999999999996 + 20 = 50
          expect(object.getY()).to.be.within(
            platform.getY() - object.getHeight() - epsilon,
            platform.getY() - object.getHeight() + epsilon
          );
        });
      });

      [
        [26, 45],
        [45, 26],
        [26, 26],
        [45, 45],
      ].forEach((slopeAngles) => {
        it(`can go downhill from a ${slopeAngles[0]}° slope to a ${slopeAngles[1]}° slope`, function () {
          // Put a platform.
          const slope1 = addDownSlopePlatformObject(runtimeScene);
          slope1.setCustomWidthAndHeight(
            slopesDimensions[slopeAngles[0]].width,
            slopesDimensions[slopeAngles[0]].height
          );
          slope1.setPosition(0, 0);

          const slope2 = addDownSlopePlatformObject(runtimeScene);
          slope2.setCustomWidthAndHeight(
            slopesDimensions[slopeAngles[1]].width,
            slopesDimensions[slopeAngles[1]].height
          );
          slope2.setPosition(
            slope1.getX() + slope1.getWidth(),
            slope1.getY() + slope1.getHeight()
          );

          object.setPosition(0, -32);
          // Ensure the object falls on the platform
          fallOnPlatform(11);

          // Walk from the 1st platform to the 2nd one.
          walkRight(30);
          expect(object.getX()).to.be.above(slope2.getX());
          // Gone downward following the 2nd platform.
          expect(object.getY()).to.be.above(slope2.getY() - object.getHeight());
        });
      });
    });

    describe('(walk on slopes very fast)', function () {
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
              acceleration: 100000,
              deceleration: 1500,
              // It will move more than 1 width every frame
              maxSpeed: 1000, // fps * width = 60 * 10 = 600 plus a big margin
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
          expect(behavior.getCurrentSpeed()).to.not.be.below(lastSpeed);
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

      // TODO When the object is moving fast, sharp platform vertices can be missed.
      // Fixing this is would require to rethink how the floor is followed.
      // But, this might be an extreme enough case to don't care:
      // On a 800 width screen, a 32 width character would go through one screen in 400ms.
      // 800 / 32 / 60 = 0.416
      it.skip(`can go uphill from a 45° slope to a 0° jump through platform`, function () {
        // Put a platform.
        const slope = addUpSlopePlatformObject(runtimeScene);
        slope.setCustomWidthAndHeight(50, 50);
        slope.setPosition(0, 0);

        const jumpThroughPlatform = addJumpThroughPlatformObject(runtimeScene);
        slope.setCustomWidthAndHeight(50, 50);
        jumpThroughPlatform.setPosition(
          slope.getX() + slope.getWidth(),
          slope.getY()
        );

        object.setPosition(0, -5);
        // Ensure the object falls on the platform
        fallOnPlatform(12);

        // Walk from the 1st platform to the 2nd one.
        walkRight(6);
        expect(object.getX()).to.be.above(jumpThroughPlatform.getX());
        // Gone upward following the 2nd platform.
        expect(object.getY()).to.be(
          jumpThroughPlatform.getY() - object.getHeight()
        );
      });
    });

    it('can stay on a rotated platform when its height changes', function () {
      const platform = addPlatformObject(runtimeScene);
      platform.setPosition(0, -10);
      platform.setAngle(-45);

      object.setPosition(30, -32);
      // Ensure the object falls on the platform
      fallOnPlatform(10);
      const oldY = object.getY();
      expect(object.getY()).to.be.within(-40, -39);

      object.setHeight(object.getHeight() - 8);
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getY()).to.be(oldY + 8);
    });
  });

  [0, 25].forEach((slopeMaxAngle) => {
    describe(`(walk on slopes, slopeMaxAngle: ${slopeMaxAngle}°)`, function () {
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

      const fallOnPlatform = (maxFrameCount) => {
        // Ensure the object falls on the platform
        for (let i = 0; i < maxFrameCount; ++i) {
          runtimeScene.renderAndStep(1000 / 60);
        }
        //Check the object is on the platform
        expect(object.getBehavior('auto1').isFalling()).to.be(false);
        expect(object.getBehavior('auto1').isMoving()).to.be(false);
      };

      const walkRightCanStop = (frameCount) => {
        const behavior = object.getBehavior('auto1');
        for (let i = 0; i < frameCount; ++i) {
          const lastX = object.getX();
          const lastSpeed = behavior.getCurrentSpeed();
          behavior.simulateRightKey();
          runtimeScene.renderAndStep(1000 / 60);
          expect(behavior.isOnFloor()).to.be(true);
          expect(object.getX()).to.not.be.below(lastX);
        }
      };

      const walkLeftCanStop = (frameCount) => {
        const behavior = object.getBehavior('auto1');
        for (let i = 0; i < frameCount; ++i) {
          const lastX = object.getX();
          const lastSpeed = behavior.getCurrentSpeed();
          behavior.simulateLeftKey();
          runtimeScene.renderAndStep(1000 / 60);
          expect(behavior.isOnFloor()).to.be(true);
          expect(object.getX()).to.not.be.above(lastX);
        }
      };

      (slopeMaxAngle === 0
        ? [
            { angle: 5.7, height: 5 },
            { angle: 26, height: 25 },
          ]
        : // slopeMaxAngle === 25
          [{ angle: 26, height: 25 }]
      ).forEach((slopesDimension) => {
        it(`can't go uphill on a too steep slope (${slopesDimension.angle}°)`, function () {
          // Put a platform.
          const slope = addUpSlopePlatformObject(runtimeScene);
          slope.setCustomWidthAndHeight(50, slopesDimension.height);
          slope.setPosition(0, 0);

          object.setPosition(0, -10);
          // Ensure the object falls on the platform
          fallOnPlatform(20);
          const fallX = object.getX();
          const fallY = object.getY();

          // Stay still when Right is pressed
          const behavior = object.getBehavior('auto1');
          for (let i = 0; i < 10; ++i) {
            const lastSpeed = behavior.getCurrentSpeed();
            behavior.simulateRightKey();
            runtimeScene.renderAndStep(1000 / 60);
            expect(behavior.isOnFloor()).to.be(true);
            expect(object.getX()).to.be.within(
              fallX - epsilon,
              fallX + epsilon
            );
            expect(object.getY()).to.be.within(
              fallY - epsilon,
              fallY + epsilon
            );
          }
        });

        it(`can go downhill on a too steep slope (${slopesDimension.angle}°)`, function () {
          // Put a platform.
          const slope = addDownSlopePlatformObject(runtimeScene);
          slope.setCustomWidthAndHeight(50, slopesDimension.height);
          slope.setPosition(0, 0);

          object.setPosition(0, -60);
          // Ensure the object falls on the platform
          fallOnPlatform(20);
          const fallX = object.getX();
          const fallY = object.getY();

          // Fall and land on the platform in loop when Right is pressed
          const behavior = object.getBehavior('auto1');
          for (let i = 0; i < 10; ++i) {
            const lastX = object.getX();
            const lastY = object.getY();
            const lastSpeed = behavior.getCurrentSpeed();
            behavior.simulateRightKey();
            runtimeScene.renderAndStep(1000 / 60);
            expect(
              behavior.isOnFloor() || behavior.isFallingWithoutJumping()
            ).to.be(true);
            expect(object.getX()).to.be.above(lastX);
            expect(object.getY()).to.be.above(lastY);
            // Check that the object doesn't stop
            expect(behavior.getCurrentSpeed()).to.be.above(lastSpeed);
          }
        });

        // The log of the character positions moving to the right
        // without any obstacle:
        // LOG: 'OnFloor 35.13888888888889 -20'
        // LOG: 'OnFloor 38.333333333333336 -20'
        // LOG: 'OnFloor 41.66666666666667 -20'
        // The character is 10 width, at 38.33 is left is 48.33
        [
          // remainingDeltaX === 1.333
          47,
          // remainingDeltaX === 0.833
          47.5,
          // remainingDeltaX === 0.333
          48,
          // remainingDeltaX is big
          49,
          // Platform tiles will result to pixel aligned junctions.
          // A rotated platform will probably result to not pixel aligned junctions.
          48.9,
        ].forEach((slopeJunctionX) => {
          it(`(slopeJunctionX: ${slopeJunctionX}) can't go uphill from a 0° slope to a too steep slope (${slopesDimension.angle}°) going right`, function () {
            // Put a platform.
            const platform = addPlatformObject(runtimeScene);
            platform.setCustomWidthAndHeight(slopeJunctionX, 50);
            platform.setPosition(0, 0);

            const slope = addUpSlopePlatformObject(runtimeScene);
            slope.setCustomWidthAndHeight(50, slopesDimension.height);
            slope.setPosition(
              platform.getX() + platform.getWidth(),
              platform.getY() - slope.getHeight()
            );

            object.setPosition(0, -32);
            // Ensure the object falls on the platform
            fallOnPlatform(10);

            // Walk toward the 2nd platform.
            walkRightCanStop(30);
            // Is stopped at the slope junction.
            expect(object.getX()).to.be.within(
              Math.floor(slope.getX()) - object.getWidth(),
              // When the junction is not pixel aligned, the character will be stopped
              // but is able to move forward until it reaches the obstacle.
              slope.getX() - object.getWidth()
            );
            expect(object.getY()).to.be(platform.getY() - object.getHeight());
          });
        });

        // The log of the character positions moving to the left
        // without any obstacle:
        // LOG: 'OnFloor 54.861111111111114 -20'
        // LOG: 'OnFloor 51.66666666666667 -20'
        // LOG: 'OnFloor 48.333333333333336 -20'
        // This is a mirror of the previous case: x -> 100 - x
        [
          // remainingDeltaX === -1.333
          53,
          // remainingDeltaX === -0.833
          52.5,
          // remainingDeltaX === -0.333
          52,
          // remainingDeltaX is big
          51,
          // Platform tiles will result to pixel aligned junctions.
          // A rotated platform will probably result to not pixel aligned junctions.
          51.1,
        ].forEach((slopeJunctionX) => {
          it(`(slopeJunctionX: ${slopeJunctionX}) can't go uphill from a 0° slope to a too steep slope (${slopesDimension.angle}°) going left`, function () {
            // Put a platform.
            const platform = addPlatformObject(runtimeScene);
            platform.setCustomWidthAndHeight(100 - slopeJunctionX, 50);
            platform.setPosition(slopeJunctionX, 0);

            const slope = addDownSlopePlatformObject(runtimeScene);
            slope.setCustomWidthAndHeight(50, slopesDimension.height);
            slope.setPosition(
              slopeJunctionX - slope.getWidth(),
              platform.getY() - slope.getHeight()
            );

            object.setPosition(90, -32);
            // Ensure the object falls on the platform
            fallOnPlatform(10);

            // Walk toward the 2nd platform.
            walkLeftCanStop(30);
            // Is stopped at the slope junction.
            expect(object.getX()).to.be.within(
              // When the junction is not pixel aligned, the character will be stopped
              // but is able to move forward until it reaches the obstacle.
              platform.getX(),
              Math.ceil(platform.getX())
            );
            expect(object.getY()).to.be(platform.getY() - object.getHeight());
          });
        });
      });
    });
  });
});
