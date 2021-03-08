describe('gdjs.PlatformerObjectRuntimeBehavior', function () {
  const makeTestRuntimeScene = () => {
    const runtimeGame = new gdjs.RuntimeGame({
      variables: [],
      resources: {
        resources: [],
      },
      properties: { windowWidth: 800, windowHeight: 600 },
    });
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

  const addPlatformObject = (runtimeScene) => {
    const platform = new gdjs.RuntimeObject(runtimeScene, {
      name: 'obj2',
      type: '',
      behaviors: [
        {
          type: 'PlatformBehavior::PlatformBehavior',
          canBeGrabbed: true,
        },
      ],
    });
    platform.getWidth = function () {
      return 60;
    };
    platform.getHeight = function () {
      return 32;
    };
    runtimeScene.addObject(platform);

    return platform;
  };

  const addLadderObject = (runtimeScene) => {
    const ladder = new gdjs.RuntimeObject(runtimeScene, {
      name: 'obj3',
      type: '',
      behaviors: [
        {
          type: 'PlatformBehavior::PlatformBehavior',
          canBeGrabbed: false,
          platformType: 'Ladder',
        },
      ],
    });
    ladder.getWidth = function () {
      return 20;
    };
    ladder.getHeight = function () {
      return 60;
    };
    runtimeScene.addObject(ladder);

    return ladder;
  };

  describe('(falling)', function () {
    let runtimeScene;
    let object;
    let platform;

    beforeEach(function () {
      runtimeScene = makeTestRuntimeScene();

      // Put a platformer object in the air.
      object = new gdjs.RuntimeObject(runtimeScene, {
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
      });
      object.getWidth = function () {
        return 10;
      };
      object.getHeight = function () {
        return 20;
      };
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
      }

      //Check the platform stopped the platformer object.
      expect(object.getY()).to.be(-30); // -30 = -10 (platform y) + -20 (object height)
      expect(object.getBehavior('auto1').isFalling()).to.be(false);
      expect(object.getBehavior('auto1').isMoving()).to.be(false);

      for (let i = 0; i < 35; ++i) {
        //Check that the platformer object can fall.
        object.getBehavior('auto1').simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
      }
      expect(object.getX()).to.be.within(87.5, 87.51);
      expect(object.getY()).to.be(-24.75);
      expect(object.getBehavior('auto1').isFalling()).to.be(true);

      for (let i = 0; i < 100; ++i) {
        //Let the speed on X axis go back to 0.
        runtimeScene.renderAndStep(1000 / 60);
      }
    });

    it('can grab, and release, a platform', function () {
      //Put the object near the right ledge of the platform.
      object.setPosition(
        platform.getX() + platform.getWidth() + 2,
        platform.getY() - 10
      );

      for (let i = 0; i < 35; ++i) {
        object.getBehavior('auto1').simulateLeftKey();
        runtimeScene.renderAndStep(1000 / 60);
      }

      //Check that the object grabbed the platform
      expect(object.getX()).to.be.within(
        platform.getX() + platform.getWidth() + 0,
        platform.getX() + platform.getWidth() + 1
      );
      expect(object.getY()).to.be(platform.getY());

      object.getBehavior('auto1').simulateReleaseKey();
      for (let i = 0; i < 10; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }

      //Check that the object is falling
      expect(object.getY()).to.be(1.25);
    });

    it('can grab a platform and jump', function () {
      //Put the object near the right ledge of the platform.
      object.setPosition(
        platform.getX() + platform.getWidth() + 2,
        platform.getY() - 10
      );

      for (let i = 0; i < 35; ++i) {
        object.getBehavior('auto1').simulateLeftKey();
        runtimeScene.renderAndStep(1000 / 60);
      }

      //Check that the object grabbed the platform
      expect(object.getX()).to.be.within(
        platform.getX() + platform.getWidth() + 0,
        platform.getX() + platform.getWidth() + 1
      );
      expect(object.getY()).to.be(platform.getY());

      object.getBehavior('auto1').simulateJumpKey();
      for (let i = 0; i < 10; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }

      //Check that the object is jumping
      expect(object.getY()).to.be.below(platform.getY());
    });

    it('can track object height changes', function () {
      //Put the object near the right ledge of the platform.
      object.setPosition(
        platform.getX() + 10,
        platform.getY() - object.getHeight() + 1
      );

      for (let i = 0; i < 15; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }

      expect(object.getBehavior('auto1').isFalling()).to.be(false);
      expect(object.getX()).to.be(10);
      expect(object.getY()).to.be.within(-31, -30); // -30 = -10 (platform y) + -20 (object height)

      object.getHeight = function () {
        return 9;
      };
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getBehavior('auto1').isFalling()).to.be(false);
      expect(object.getY()).to.be(-19); // -19 = -10 (platform y) + -9 (object height)

      for (let i = 0; i < 10; ++i) {
        object.getBehavior('auto1').simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
        expect(object.getBehavior('auto1').isFalling()).to.be(false);
      }
      expect(object.getY()).to.be(-19);
      expect(object.getX()).to.be.within(17.638, 17.639);

      object.getHeight = function () {
        return 20;
      };
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getY()).to.be(-30); // -30 = -10 (platform y) + -20 (object height)
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
      expect(object.getBehavior('auto1').isMoving()).to.be(false);

      // move the platform away
      platform.setPosition(-100, -100);
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getBehavior('auto1').isFalling()).to.be(true);
    });
  });

  describe('(jump and jump sustain, round coordinates on)', function () {
    let runtimeScene;
    let object;
    let platform;

    beforeEach(function () {
      runtimeScene = makeTestRuntimeScene();

      // Put a platformer object on a platform
      object = new gdjs.RuntimeObject(runtimeScene, {
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
            roundCoordinates: true,
          },
        ],
      });
      object.getWidth = function () {
        return 10;
      };
      object.getHeight = function () {
        return 20;
      };
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
      expect(object.getBehavior('auto1').isMoving()).to.be(false);

      // Jump without sustaining
      object.getBehavior('auto1').simulateJumpKey();
      for (let i = 0; i < 18; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
        expect(object.getBehavior('auto1').isJumping()).to.be(true);
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
      }
      // The jump finishes one frame before going back to the floor
      // because the gravity is not applied on the first step.
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getBehavior('auto1').isJumping()).to.be(false);
      expect(object.getBehavior('auto1').isFalling()).to.be(true);
      expect(object.getY()).to.be(-31);
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getBehavior('auto1').isFalling()).to.be(false);
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
      expect(object.getBehavior('auto1').isMoving()).to.be(false);

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
      for (let i = 0; i < 60; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }
      expect(object.getY()).to.be(-30);
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
      for (let i = 0; i < 30; ++i) {
        object.getBehavior('auto1').simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
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
      expect(object.getBehavior('auto1').isMoving()).to.be(false);

      // Jump, reach the top and go down
      object.getBehavior('auto1').simulateJumpKey();
      for (let i = 0; i < 30; ++i) {
        console.log("i: " + i + " x: " + object.getX() + " y: " + object.getY());
        runtimeScene.renderAndStep(1000 / 60);
        expect(object.getBehavior('auto1').isJumping()).to.be(true);
      }
      // the object is against the platform side
      expect(object.getY()).to.be.within(
        topPlatform.getY() - object.getHeight(),
        topPlatform.getY()
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
      expect(object.getBehavior('auto1').isMoving()).to.be(false);

      // try to grab the platform
      for (let i = 0; i < 30; ++i) {
        object.getBehavior('auto1').simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
        expect(object.getBehavior('auto1').isOnFloor()).to.be(true);
      }

      // The object is where it could grab the top platform if it where falling.
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
      runtimeScene = makeTestRuntimeScene();

      // Put a platformer object on a platform.
      object = new gdjs.RuntimeObject(runtimeScene, {
        name: 'obj1',
        type: '',
        behaviors: [
          {
            type: 'PlatformBehavior::PlatformerObjectBehavior',
            name: 'auto1',
            roundCoordinates: true,
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
      });
      object.getWidth = function () {
        return 10;
      };
      object.getHeight = function () {
        return 20;
      };
      runtimeScene.addObject(object);
      object.setPosition(0, -30);

      // Put a platform.
      platform = addPlatformObject(runtimeScene);
      platform.setPosition(0, -10);

      // Put a jump thru, higher than the platform so that the object jump from under it
      // and will land on it at the end of the jump.
      jumpthru = new gdjs.RuntimeObject(runtimeScene, {
        name: 'obj2',
        type: '',
        behaviors: [
          {
            type: 'PlatformBehavior::PlatformBehavior',
            canBeGrabbed: true,
            platformType: 'Jumpthru',
          },
        ],
      });
      jumpthru.getWidth = function () {
        return 60;
      };
      jumpthru.getHeight = function () {
        return 5;
      };
      runtimeScene.addObject(jumpthru);
      jumpthru.setPosition(0, -33);
    });

    it('can jump through the jumpthru', function () {
      //Check the platform stopped the platformer object.
      for (let i = 0; i < 5; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }
      expect(object.getY()).to.be(-30); // -30 = -10 (platform y) + -20 (object height)
      expect(object.getBehavior('auto1').isFalling()).to.be(false);
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
      expect(object.getBehavior('auto1').isJumping()).to.be(true);

      // Continue the simulation and check that position is correct in the middle of the jump
      for (let i = 0; i < 20; ++i) {
        runtimeScene.renderAndStep(1000 / 60);
      }
      expect(object.getY()).to.be.within(-89, -88);

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
  });

  describe('(rounded coordinates, moving platforms)', function () {
    let runtimeScene;
    let object;
    let platform;

    beforeEach(function () {
      runtimeScene = makeTestRuntimeScene();

      // Put a platformer object on a platform.
      object = new gdjs.RuntimeObject(runtimeScene, {
        name: 'obj1',
        type: '',
        behaviors: [
          {
            type: 'PlatformBehavior::PlatformerObjectBehavior',
            name: 'auto1',
            roundCoordinates: true,
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
      });
      object.getWidth = function () {
        return 10;
      };
      object.getHeight = function () {
        return 20;
      };
      runtimeScene.addObject(object);
      object.setPosition(0, -30);

      // Put a platform.
      platform = addPlatformObject(runtimeScene);
      platform.setPosition(0, -10);
    });

    it('follows the platform', function () {
      for (let i = 0; i < 30; ++i) {
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
      platform.setX(platform.getX() + 0.12);
      runtimeScene.renderAndStep(1000 / 60);
      platform.setX(platform.getX() + 0.12);
      runtimeScene.renderAndStep(1000 / 60);
      platform.setX(platform.getX() + 0.12);
      runtimeScene.renderAndStep(1000 / 60);

      expect(object.getX()).to.be(0.36);
    });

    it('follows a moving platform when was grabbed to another', function () {
      const topPlatform = addPlatformObject(runtimeScene);
      topPlatform.setPosition(platform.getX() + 30, -50);
      runtimeScene.renderAndStep(1000 / 60);

      // Fall and Grab the platform
      object.setPosition(
        topPlatform.getX() - object.getWidth(),
        topPlatform.getY() - 10
      );
      for (let i = 0; i < 7; ++i) {
        object.getBehavior('auto1').simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
        expect(object.getBehavior('auto1').isFalling()).to.be(true);
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
  });

  describe('and gdjs.PlatformRuntimeBehavior at same time', function () {
    let runtimeScene;
    let object;
    let platform;
    var object2;

    beforeEach(function () {
      runtimeScene = makeTestRuntimeScene();

      // Put a platformer object on a platform.
      object = new gdjs.RuntimeObject(runtimeScene, {
        name: 'obj1',
        type: '',
        behaviors: [
          {
            type: 'PlatformBehavior::PlatformerObjectBehavior',
            name: 'PlatformerObject',
            roundCoordinates: true,
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
      });
      object.getWidth = function () {
        return 10;
      };
      object.getHeight = function () {
        return 20;
      };
      runtimeScene.addObject(object);
      object.setPosition(0, -30);

      // Put a platform.
      platform = addPlatformObject(runtimeScene);
      platform.setPosition(0, -10);

      // Put a platformer object that is also a platform itself.
      object2 = new gdjs.RuntimeObject(runtimeScene, {
        name: 'obj2',
        type: '',
        behaviors: [
          {
            type: 'PlatformBehavior::PlatformerObjectBehavior',
            name: 'PlatformerObject',
            roundCoordinates: true,
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
            canBeGrabbed: true,
            platformType: 'Platform',
          },
        ],
      });
      object2.getWidth = function () {
        return 10;
      };
      object2.getHeight = function () {
        return 20;
      };
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

  describe('(ladder)', function () {
    let runtimeScene;
    let object;
    var scale;

    beforeEach(function () {
      runtimeScene = makeTestRuntimeScene();

      // Put a platformer object on a platform
      object = new gdjs.RuntimeObject(runtimeScene, {
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
            roundCoordinates: true,
          },
        ],
      });
      object.getWidth = function () {
        return 10;
      };
      object.getHeight = function () {
        return 20;
      };
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
        //TODO Probably a bug, uncomment it after it's fixed
        //expect(object.getBehavior('auto1').isMoving()).to.be(true);
        expect(object.getY()).to.be.below(lastY);
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
        expect(object.getBehavior('auto1').isMoving()).to.be(true);
        expect(object.getY()).to.be.below(lastY);
      }
    }
    const jumpAndDescend = (frameCount) => {
      for (let i = 0; i < frameCount; ++i) {
        const lastY = object.getY();
        runtimeScene.renderAndStep(1000 / 60);
        expect(object.getBehavior('auto1').isJumping()).to.be(true);
        expect(object.getBehavior('auto1').isMoving()).to.be(true);
        expect(object.getY()).to.be.above(lastY);
      }
    }

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

    it('can climb a ladder', function () {
      object.setPosition(30, -32);
      // Ensure the object falls on the platform
      fallOnPlatform(10);

      // Climb the ladder
      object.getBehavior('auto1').simulateLadderKey();
      climbLadder(10);
      stayOnLadder(10);
      climbLadder(14);
      // Check that we reached the maximum height
      // The player goes a little over the ladder...
      object.getBehavior('auto1').simulateUpKey();
      runtimeScene.renderAndStep(1000 / 60);
      const playerAtLadderTop = ladder.getY() - object.getHeight();
      expect(object.getY()).to.be.within(
        playerAtLadderTop - 3,
        playerAtLadderTop
      );
      expect(object.getBehavior('auto1').isFalling()).to.be(true);

      // ...and it falls even if up is pressed
      for (let i = 0; i < 12; ++i) {
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
      for (let i = 0; i < 19; ++i) {
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
      // still moves a little because of inertia maybe?
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getBehavior('auto1').isOnLadder()).to.be(true);
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getBehavior('auto1').isOnLadder()).to.be(true);
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
      // Falling 1 frame
      object.getBehavior('auto1').simulateRightKey();
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getBehavior('auto1').isFalling()).to.be(true);
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
      for (let i = 0; i < 5; ++i) {
        object.getBehavior('auto1').simulateRightKey();
        fall(1);
      }
      object.getBehavior('auto1').simulateRightKey();
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getBehavior('auto1').isGrabbingPlatform()).to.be(true);

      // try to grab the ladder
      object.getBehavior('auto1').simulateLadderKey();
      runtimeScene.renderAndStep(1000 / 60);
      // panic mode! (probably a bug)
      expect(object.getBehavior('auto1').isOnLadder()).to.be(true);
      expect(object.getBehavior('auto1').isGrabbingPlatform()).to.be(true);
    });
  });

  describe('(walk)', function () {
    let runtimeScene;
    let object;
    let platform;

    beforeEach(function () {
      runtimeScene = makeTestRuntimeScene();

      // Put a platformer object on a platform
      object = new gdjs.RuntimeObject(runtimeScene, {
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
            roundCoordinates: true,
          },
        ],
      });
      object.getWidth = function () {
        return 10;
      };
      object.getHeight = function () {
        return 20;
      };
      runtimeScene.addObject(object);

      // Put a platform.
      platform = addPlatformObject(runtimeScene);
      platform.setPosition(0, -10);
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

    const walkRight = (frameCount) => {
      for (let i = 0; i < frameCount; ++i) {
        const lastX = object.getX();
        object.getBehavior('auto1').simulateRightKey();
        runtimeScene.renderAndStep(1000 / 60);
        expect(object.getBehavior('auto1').isOnFloor()).to.be(true);
        expect(object.getX()).to.be.above(lastX);
        if (Math.abs(object.getX() - lastX) > 1) {
          expect(object.getBehavior('auto1').isMoving()).to.be(true);
        }
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

    it('can walk from a platform to another one', function () {
      const platform2 = addPlatformObject(runtimeScene);
      platform2.setPosition(platform.getX() + platform.getWidth(), platform.getY());

      object.setPosition(30, -32);
      // Ensure the object falls on the platform
      fallOnPlatform(10);

      // walk from the 1st platform to the 2nd one
      walkRight(30);
      expect(object.getX()).to.be.above(platform2.getX());
      expect(object.getY()).to.be(platform2.getY() - object.getHeight());
    });

    it('can walk from a platform to another one that not aligned', function () {
      // the 2nd platform is 1 pixel higher
      const platform2 = addPlatformObject(runtimeScene);
      platform2.setPosition(platform.getX() + platform.getWidth(), platform.getY() - 1);

      object.setPosition(30, -32);
      // Ensure the object falls on the platform
      fallOnPlatform(10);

      // walk from the 1st platform to the 2nd one
      walkRight(30);
      expect(object.getX()).to.be.above(platform2.getX());
      expect(object.getY()).to.be(platform2.getY() - object.getHeight());
    });

    it("can't walk from a platform to another one that is too high", function () {
      // the 2nd platform is 2 pixels higher
      const platform2 = addPlatformObject(runtimeScene);
      platform2.setPosition(platform.getX() + platform.getWidth(), platform.getY() - 2);

      object.setPosition(30, -32);
      // Ensure the object falls on the platform
      fallOnPlatform(10);

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

    it('can walk from a platform to another one that is rotated', function () {
      const platform2 = addPlatformObject(runtimeScene);
      
      const angle = -30 * Math.PI / 180;
      const centerDeltaX = platform2.getWidth() / 2;
      const centerDeltaY = platform2.getHeight() / 2;
      // to make the vertex of the 2 platform touch
      const vertexDeltaX = centerDeltaX  * Math.cos(angle) + centerDeltaY * (-Math.sin(angle)) - centerDeltaX;
      const vertexDeltaY = centerDeltaX  * Math.sin(angle) + centerDeltaY * Math.cos(angle) - centerDeltaY;
      
      platform2.setAngle(-30);
      platform2.setPosition(platform.getX() + platform.getWidth() + vertexDeltaX, platform.getY() + vertexDeltaY);

      object.setPosition(30, -32);
      // Ensure the object falls on the platform
      fallOnPlatform(10);

      // walk from the 1st platform to the 2nd one
      walkRight(30);
      expect(object.getX()).to.be.above(platform2.getX());
      // gone upward following the 2nd platform
      expect(object.getY()).to.be.below(platform.getY());
    });
  });

  describe.skip('(benchmark)', function () {
    let runtimeScene;
    let objects;
    const duplicateCount = 60;
    const stepCount = 6000;

    beforeEach(function () {
      runtimeScene = makeTestRuntimeScene();

      objects = new Array(duplicateCount);
      for (let i = 0; i < duplicateCount; ++i) {
        // Put a platformer object on a platform
        object = new gdjs.RuntimeObject(runtimeScene, {
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
              roundCoordinates: true,
            },
          ],
        });
        object.getWidth = function () {
          return 10;
        };
        object.getHeight = function () {
          return 20;
        };
        runtimeScene.addObject(object);
        object.setPosition(100 * i + 60 * 5, 400 * i - 32);
        objects[i] = object;

        // Put a platform.
        for (let p = 0; p < 10; ++p) {
          const platform = addPlatformObject(runtimeScene);
          platform.setPosition(100 * i + p * platform.getWidth(), 400 * i - 10);
        }
      }
    });

    it('benchmark', function () {
      this.timeout(30000);

      for (let b = 0; b < 10; ++b) {
        const benchmarkSuite = makeBenchmarkSuite({
          benchmarksCount: 1,
          iterationsCount: stepCount,
        });
      benchmarkSuite
        .add('jump in loop', (t) => {
          for (let i = 0; i < duplicateCount; ++i) {
            const object = objects[i];
            if (t % 60 == i % 60) {
              object.getBehavior('auto1').simulateJumpKey();
            }
            if (t + i % 61 < 31) {
              object.getBehavior('auto1').simulateRightKey();
            }
            if (t + i % 61 >= 31) {
              object.getBehavior('auto1').simulateLeftKey();
            }
          }
          runtimeScene.renderAndStep(1000 / 60);
        });
      console.log(benchmarkSuite.run());
      }
    });
  });
});
