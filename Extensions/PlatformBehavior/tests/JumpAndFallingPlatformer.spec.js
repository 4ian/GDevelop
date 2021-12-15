describe('gdjs.PlatformerObjectRuntimeBehavior', function () {
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
      for (let i = 0; i < 30; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
        if (i < 10) expect(object.getBehavior('auto1').isFalling()).to.be(true);
        if (i < 10)
          expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
            true
          );
      }

      //Check the platform stopped the platformer object.
      expect(object.getY()).to.be(-30); // -30 = -10 (platform y) + -20 (object height)
      expect(object.getBehavior('auto1').isFalling()).to.be(false);
      expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
        false
      );
      expect(object.getBehavior('auto1').isMoving()).to.be(false);

      for (let i = 0; i < 35; ++i) {
        //Check that the platformer object can fall.
        object.getBehavior('auto1').simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
      }
      expect(object.getX()).to.be.within(87.5, 87.51);
      expect(object.getY()).to.be(-24.75);
      expect(object.getBehavior('auto1').isFalling()).to.be(true);
      expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(true);

      for (let i = 0; i < 100; ++i) {
        //Let the speed on X axis go back to 0.
        runtimeScene.renderAndStep(1000 / 60);
      }
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

      // Jump without sustaining
      object.getBehavior('auto1').simulateJumpKey();
      for (let i = 0; i < 18; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
        expect(object.getBehavior('auto1').isJumping()).to.be(true);
        expect(object.getBehavior('auto1').isFalling()).to.be(false);
        expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
          false
        );
      }

      // Check that we reached the maximum height
      expect(object.getY()).to.be.within(-180, -179);
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getY()).to.be(-180);
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getY()).to.be.within(-180, -179);

      // Then let the object fall
      for (let i = 0; i < 17; ++i) {
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
      expect(object.getY()).to.be(-230);
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getY()).to.be(-235);
      for (let i = 0; i < 5; ++i) {
        // Verify that pressing the jump key does not change anything
        object.getBehavior('auto1').simulateJumpKey();
        runtimeScene.renderAndStep(1000 / 60);
      }

      // Check that we reached the maximum height
      expect(object.getY()).to.be(-247.5);
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getY()).to.be(-247.5);
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getY()).to.be.within(-247, -246);

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
      expect(object.getY()).to.be.within(-101, -100);

      // Stop holding the jump key
      runtimeScene.renderAndStep(1000 / 60);

      for (let i = 0; i < 13; ++i) {
        // then hold it again (but it's too late, jump sustain is gone for this jump)
        object.getBehavior('auto1').simulateJumpKey();
        runtimeScene.renderAndStep(1000 / 60);
      }

      // Check that we reached the maximum height
      expect(object.getY()).to.be.within(-206, -205);
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getY()).to.be.within(-208, -207);
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getY()).to.be.within(-208, -207);
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getY()).to.be.within(-208, -207);
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getY()).to.be.within(-206, -205);
      runtimeScene.renderAndStep(1000 / 60);

      // Then let the object fall
      expect(object.getBehavior('auto1').isFalling()).to.be(true);
      expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
        false
      );
      for (let i = 0; i < 60; ++i) {
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

    it('can be allowed to jump in mid air', function () {
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
      for (let i = 0; i < 30; ++i) {
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
      jumpthru.setPosition(0, -33);
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
      expect(object.getY()).to.be.within(-47, -46);
      runtimeScene.renderAndStep(1000 / 60);
      // At this step, the object is almost on the jumpthru (-53 + 20 (object height) = -33 (jump thru Y position)),
      // but the object should not stop.
      expect(object.getY()).to.be.within(-54, -53);
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getY()).to.be.within(-61, -60);
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getY()).to.be.within(-67, -66);

      // Verify the object is still jumping
      expect(object.getBehavior('auto1').isJumping()).to.be(true);
      expect(object.getBehavior('auto1').isFalling()).to.be(false);

      // Continue the simulation and check that position is correct in the middle of the jump
      for (let i = 0; i < 20; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }
      expect(object.getY()).to.be.within(-89, -88);

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

    it('can jump right under a jumpthru without landing', function () {
      // A big one because the object jump to the right.
      jumpthru.setCustomWidthAndHeight(600, 20);
      const highestJumpY = -104; // actually -103.6
      // Right above the maximum reach by jumping
      jumpthru.setPosition(0, highestJumpY + object.getHeight());

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
      for (let i = 0; i < 17; ++i) {
        object.getBehavior('auto1').simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
        expect(object.getBehavior('auto1').isJumping()).to.be(true);
        expect(object.getBehavior('auto1').isFalling()).to.be(false);
      }
      // The object is at the highest of the jump.
      expect(object.getY()).to.be.within(highestJumpY, highestJumpY + 1);

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
      const highestJumpY = -104; // actually -103.6
      // Right above the maximum reach by jumping
      jumpthru.setPosition(0, highestJumpY + 1 + object.getHeight());

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
      for (let i = 0; i < 17; ++i) {
        object.getBehavior('auto1').simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
        expect(object.getBehavior('auto1').isJumping()).to.be(true);
        expect(object.getBehavior('auto1').isFalling()).to.be(false);
      }
      // The object is at the highest of the jump.
      expect(object.getY()).to.be.within(highestJumpY, highestJumpY + 1);

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
      jumpthru.setPosition(0, -33);
      object.setPosition(0, -100);
      jumpthru.setPosition(12, -90);
      jumpthru.setCustomWidthAndHeight(60, 100);

      // Check the jumpthru let the platformer object go through.
      for (let i = 0; i < 10; ++i) {
        object.getBehavior('auto1').simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
        expect(object.getBehavior('auto1').isFalling()).to.be(true);
        expect(object.getBehavior('auto1').isFallingWithoutJumping()).to.be(
          true
        );
        expect(object.getBehavior('auto1').isMoving()).to.be(true);
      }
      // Overlapping the jumpthru
      expect(object.getX()).to.above(5);
      expect(object.getY()).to.be.within(-100, -80);
    });
  });

  describe('and gdjs.PlatformRuntimeBehavior at same time', function () {
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

    it('can jump through the jumpthru', function () {
      // Check that the second object falls (it's not stopped by itself)
      expect(object2.getY()).to.be(-60);
      runtimeScene.renderAndStep(1000 / 60);
      expect(object2.getY()).to.be(-59.75);
      runtimeScene.renderAndStep(1000 / 60);
      expect(object2.getY()).to.be(-59.25);
      runtimeScene.renderAndStep(1000 / 60);
      expect(object2.getY()).to.be(-58.5);
      runtimeScene.renderAndStep(1000 / 60);
      expect(object2.getY()).to.be(-57.5);

      //Check the first object stays on the platform.
      expect(object.getY()).to.be(-30);

      // Simulate more frames. Check that trying to jump won't do anything.
      for (let i = 0; i < 5; ++i) {
        object2.getBehavior('PlatformerObject').simulateJumpKey();
        runtimeScene.renderAndStep(1000 / 60);
      }
      expect(object2.getY()).to.be(-48.75);
      expect(object.getX()).to.be(0);
      expect(object.getY()).to.be(-30);

      // Verify that the first platformer object is moved 1px to the left
      // as the falling platformer object+platform collides with it
      runtimeScene.renderAndStep(1000 / 60);
      expect(object2.getY()).to.be(-46.25);
      expect(object.getX()).to.be(-1);
      expect(object.getY()).to.be(-30);

      // Simulate more frames so that the object reaches the floor
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
      expect(object2.getY()).to.be(-72.5);
      expect(object.getX()).to.be(-1);
      expect(object.getY()).to.be(-72.5);

      // Try to go right for the first object: won't work because the other
      // object is a platform.
      for (let i = 0; i < 5; ++i) {
        object.getBehavior('PlatformerObject').simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
      }
      expect(object2.getX()).to.be(9);
      expect(object2.getY()).to.be.within(-94.2, -94.1);
      expect(object.getX()).to.be(-1);
      expect(object.getY()).to.be.within(-94.2, -94.1);

      // Try to go right for the first and second object: can do.
      for (let i = 0; i < 3; ++i) {
        object.getBehavior('PlatformerObject').simulateRightKey();
        object2.getBehavior('PlatformerObject').simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
      }
      expect(object2.getX()).to.be.within(9.83, 9.84);
      expect(object2.getY()).to.be.within(-101.2, -101.1);
      expect(object.getX()).to.be.within(-0.59, -0.58);
      expect(object.getY()).to.be.within(-101.2, -101.1);

      // Let the object fall back on the floor.
      for (let i = 0; i < 30; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }
      expect(object2.getX()).to.be.within(9.83, 9.84);
      expect(object2.getY()).to.be(-30);
      expect(object.getX()).to.be.within(-0.59, -0.58);
      expect(object.getY()).to.be(-30);
    });
  });
});
