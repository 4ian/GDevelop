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
  runtimeScene._timeManager.getElapsedTime = function() {
    return (1 / 60) * 1000;
  };
  return runtimeScene;
};

const addPlatformObject = runtimeScene => {
  var platform = new gdjs.RuntimeObject(runtimeScene, {
    name: 'obj2',
    type: '',
    behaviors: [
      {
        type: 'PlatformBehavior::PlatformBehavior',
        canBeGrabbed: true,
      },
    ],
  });
  platform.getWidth = function() {
    return 60;
  };
  platform.getHeight = function() {
    return 32;
  };
  runtimeScene.addObject(platform);

  return platform;
};

describe('gdjs.PlatformerObjectRuntimeBehavior', function() {
  const runtimeScene = makeTestRuntimeScene();

  // Put a platformer object in the air.
  var object = new gdjs.RuntimeObject(runtimeScene, {
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
  object.getWidth = function() {
    return 10;
  };
  object.getHeight = function() {
    return 20;
  };
  runtimeScene.addObject(object);
  object.setPosition(0, -100);

  // Put a platform.
  const platform = addPlatformObject(runtimeScene);
  platform.setPosition(0, -10);

  it('can fall when in the air', function() {
    for (var i = 0; i < 30; ++i) {
      runtimeScene.renderAndStep(1000 / 60);
      if (i < 10) expect(object.getBehavior('auto1').isFalling()).to.be(true);
    }

    //Check the platform stopped the platformer object.
    expect(object.getY()).to.be(-30); // -30 = -10 (platform y) + -20 (object height)
    expect(object.getBehavior('auto1').isFalling()).to.be(false);
    expect(object.getBehavior('auto1').isMoving()).to.be(false);

    for (var i = 0; i < 35; ++i) {
      //Check that the platformer object can fall.
      object.getBehavior('auto1').simulateRightKey();
      runtimeScene.renderAndStep(1000 / 60);
    }
    expect(object.getX()).to.be.within(87.5, 87.51);
    expect(object.getY()).to.be(-24.75);
    expect(object.getBehavior('auto1').isFalling()).to.be(true);

    for (var i = 0; i < 100; ++i) {
      //Let the speed on X axis go back to 0.
      runtimeScene.renderAndStep(1000 / 60);
    }
  });

  it('can grab, and release, a platform', function() {
    //Put the object near the right ledge of the platform.
    object.setPosition(
      platform.getX() + platform.getWidth() + 2,
      platform.getY() - 10
    );

    for (var i = 0; i < 35; ++i) {
      object.getBehavior('auto1').simulateLeftKey();
      runtimeScene.renderAndStep(1000 / 60);
    }

    //Check that the object grabbed the platform
    expect(object.getX()).to.be.within(
      platform.getX() + platform.getWidth() + 1,
      platform.getX() + platform.getWidth() + 2
    );
    expect(object.getY()).to.be(platform.getY());

    object.getBehavior('auto1').simulateReleaseKey();
    for (var i = 0; i < 10; ++i) {
      runtimeScene.renderAndStep(1000 / 60);
    }

    //Check that the object is falling
    expect(object.getY()).to.be(1.25);
  });

  it('can track object height changes', function() {
    //Put the object near the right ledge of the platform.
    object.setPosition(
      platform.getX() + 10,
      platform.getY() - object.getHeight() - 1
    );

    for (var i = 0; i < 15; ++i) {
      runtimeScene.renderAndStep(1000 / 60);
    }

    expect(object.getBehavior('auto1').isFalling()).to.be(false);
    expect(object.getX()).to.be(10);
    expect(object.getY()).to.be(-30); // -30 = -10 (platform y) + -20 (object height)

    object.getHeight = function() {
      return 9;
    };
    runtimeScene.renderAndStep(1000 / 60);
    expect(object.getBehavior('auto1').isFalling()).to.be(false);
    expect(object.getY()).to.be(-19); // -19 = -10 (platform y) + -9 (object height)

    for (var i = 0; i < 10; ++i) {
      object.getBehavior('auto1').simulateRightKey();
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getBehavior('auto1').isFalling()).to.be(false);
    }
    expect(object.getY()).to.be(-19);
    expect(object.getX()).to.be.within(17.638, 17.639);

    object.getHeight = function() {
      return 20;
    };
    runtimeScene.renderAndStep(1000 / 60);
    expect(object.getY()).to.be(-30); // -30 = -10 (platform y) + -20 (object height)
  });
});

describe('gdjs.PlatformerObjectRuntimeBehavior, jump and jump sustain (round coordinates on)', function() {
  const runtimeScene = makeTestRuntimeScene();

  // Put a platformer object on a platform
  var object = new gdjs.RuntimeObject(runtimeScene, {
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
  object.getWidth = function() {
    return 10;
  };
  object.getHeight = function() {
    return 20;
  };
  runtimeScene.addObject(object);
  object.setPosition(0, -32);

  // Put a platform.
  const platform = addPlatformObject(runtimeScene);
  platform.setPosition(0, -10);

  it('can jump', function() {
    // Ensure the object falls on the platform
    for (var i = 0; i < 10; ++i) {
      runtimeScene.renderAndStep(1000 / 60);
    }

    //Check the object is on the platform
    expect(object.getY()).to.be(-30); // -30 = -10 (platform y) + -20 (object height)
    expect(object.getBehavior('auto1').isFalling()).to.be(false);
    expect(object.getBehavior('auto1').isMoving()).to.be(false);

    // Jump without sustaining
    object.getBehavior('auto1').simulateJumpKey();
    for (var i = 0; i < 18; ++i) {
      runtimeScene.renderAndStep(1000 / 60);
	}

    // Check that we reached the maximum height
    expect(object.getY()).to.be.within(-180, -179);
    runtimeScene.renderAndStep(1000 / 60);
    expect(object.getY()).to.be(-180);
    runtimeScene.renderAndStep(1000 / 60);
    expect(object.getY()).to.be.within(-180, -179);

    // Then let the object fall
    for (var i = 0; i < 60; ++i) {
      runtimeScene.renderAndStep(1000 / 60);
    }
    expect(object.getY()).to.be(-30);
  });

  it('can jump, sustaining the jump', function() {
    //Check the object is on the platform
    expect(object.getY()).to.be(-30); // -30 = -10 (platform y) + -20 (object height)
    expect(object.getBehavior('auto1').isFalling()).to.be(false);
    expect(object.getBehavior('auto1').isMoving()).to.be(false);

	// Jump with sustaining as much as possible, and
	// even more (18 frames at 60fps is greater than 0.2s)
    for (var i = 0; i < 18; ++i) {
      object.getBehavior('auto1').simulateJumpKey();
      runtimeScene.renderAndStep(1000 / 60);
    }

    // Check the height reached
    expect(object.getY()).to.be(-230);
    runtimeScene.renderAndStep(1000 / 60);
    expect(object.getY()).to.be(-235);
    for (var i = 0; i < 5; ++i) {
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
    for (var i = 0; i < 60; ++i) {
      runtimeScene.renderAndStep(1000 / 60);
    }
    expect(object.getY()).to.be(-30);
  });

  it('can jump, and only sustain the jump while key held', function() {
    //Check the object is on the platform
    expect(object.getY()).to.be(-30); // -30 = -10 (platform y) + -20 (object height)
    expect(object.getBehavior('auto1').isFalling()).to.be(false);
    expect(object.getBehavior('auto1').isMoving()).to.be(false);

	// Jump with sustaining a bit (5 frames at 60fps = 0.08s), then stop
    for (var i = 0; i < 5; ++i) {
      object.getBehavior('auto1').simulateJumpKey();
      runtimeScene.renderAndStep(1000 / 60);
    }
	expect(object.getY()).to.be.within(-101, -100);

	// Stop holding the jump key
	runtimeScene.renderAndStep(1000 / 60);

    for (var i = 0; i < 13; ++i) {
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
    for (var i = 0; i < 60; ++i) {
      runtimeScene.renderAndStep(1000 / 60);
    }
    expect(object.getY()).to.be(-30);
  });
});

describe('gdjs.PlatformerObjectRuntimeBehavior, jumpthru', function() {
  const runtimeScene = makeTestRuntimeScene();

  // Put a platformer object on a platform.
  var object = new gdjs.RuntimeObject(runtimeScene, {
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
  object.getWidth = function() {
    return 10;
  };
  object.getHeight = function() {
    return 20;
  };
  runtimeScene.addObject(object);
  object.setPosition(0, -30);

  // Put a platform.
  const platform = addPlatformObject(runtimeScene);
  platform.setPosition(0, -10);

  // Put a jump thru, higher than the platform so that the object jump from under it
  // and will land on it at the end of the jump.
  var jumpthru = new gdjs.RuntimeObject(runtimeScene, {
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
  jumpthru.getWidth = function() {
    return 60;
  };
  jumpthru.getHeight = function() {
    return 5;
  };
  runtimeScene.addObject(jumpthru);
  jumpthru.setPosition(0, -33);

  it('can jump through the jumpthru', function() {
    //Check the platform stopped the platformer object.
    for (var i = 0; i < 5; ++i) {
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
    for (var i = 0; i < 20; ++i) {
      runtimeScene.renderAndStep(1000 / 60);
    }
    expect(object.getY()).to.be.within(-89, -88);

    // Continue simulation and check that we arrive on the jumpthru
    for (var i = 0; i < 10; ++i) {
      runtimeScene.renderAndStep(1000 / 60);
    }
    expect(object.getY()).to.be.within(
      jumpthru.getY() - object.getHeight(),
      jumpthru.getY() - object.getHeight() + 1
    );
    expect(object.getBehavior('auto1').isFalling()).to.be(false);
  });
});

describe('gdjs.PlatformerObjectRuntimeBehavior, rounded coordinates (moving platforms)', function() {
  const runtimeScene = makeTestRuntimeScene();

  // Put a platformer object on a platform.
  var object = new gdjs.RuntimeObject(runtimeScene, {
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
  object.getWidth = function() {
    return 10;
  };
  object.getHeight = function() {
    return 20;
  };
  runtimeScene.addObject(object);
  object.setPosition(0, -30);

  // Put a platform.
  const platform = addPlatformObject(runtimeScene);
  platform.setPosition(0, -10);

  it('follows the platform', function() {
    for (var i = 0; i < 30; ++i) {
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
});


describe('gdjs.PlatformerObjectRuntimeBehavior and gdjs.PlatformRuntimeBehavior at same time', function() {
  const runtimeScene = makeTestRuntimeScene();

  // Put a platformer object on a platform.
  var object = new gdjs.RuntimeObject(runtimeScene, {
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
  object.getWidth = function() {
    return 10;
  };
  object.getHeight = function() {
    return 20;
  };
  runtimeScene.addObject(object);
  object.setPosition(0, -30);

  // Put a platform.
  const platform = addPlatformObject(runtimeScene);
  platform.setPosition(0, -10);

  // Put a platformer object that is also a platform itself.
  var object2 = new gdjs.RuntimeObject(runtimeScene, {
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
  object2.getWidth = function() {
    return 10;
  };
  object2.getHeight = function() {
    return 20;
  };
  runtimeScene.addObject(object2);

  // Position it above the other platformer object and just on its right,
  // but one pixel too much so that the first platformer object will be moved
  // left by 1px when the second platformer object+platform falls.
  object2.setPosition(9, -60);

  it('can jump through the jumpthru', function() {
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
    for (var i = 0; i < 5; ++i) {
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
    for (var i = 0; i < 20; ++i) {
      runtimeScene.renderAndStep(1000 / 60);
    }
    expect(object2.getX()).to.be(9);
    expect(object2.getY()).to.be(-30);
    expect(object.getX()).to.be(-1);
    expect(object.getY()).to.be(-30);

    // Start a jump for both objects
    object.getBehavior('PlatformerObject').simulateJumpKey();
    object2.getBehavior('PlatformerObject').simulateJumpKey();
    for (var i = 0; i < 6; ++i) {
      runtimeScene.renderAndStep(1000 / 60);
    }
    expect(object2.getX()).to.be(9);
    expect(object2.getY()).to.be(-72.5);
    expect(object.getX()).to.be(-1);
    expect(object.getY()).to.be(-72.5);

    // Try to go right for the first object: won't work because the other
    // object is a platform.
    for (var i = 0; i < 5; ++i) {
      object.getBehavior('PlatformerObject').simulateRightKey();
      runtimeScene.renderAndStep(1000 / 60);
    }
    expect(object2.getX()).to.be(9);
    expect(object2.getY()).to.be.within(-94.2, -94.1);
    expect(object.getX()).to.be(-1);
    expect(object.getY()).to.be.within(-94.2, -94.1);

    // Try to go right for the first and second object: can do.
    for (var i = 0; i < 3; ++i) {
      object.getBehavior('PlatformerObject').simulateRightKey();
      object2.getBehavior('PlatformerObject').simulateRightKey();
      runtimeScene.renderAndStep(1000 / 60);
    }
    expect(object2.getX()).to.be.within(9.83, 9.84);
    expect(object2.getY()).to.be.within(-101.2, -101.1);
    expect(object.getX()).to.be.within(-0.59, -0.58);
    expect(object.getY()).to.be.within(-101.2, -101.1);

    // Let the object fall back on the floor.
    for (var i = 0; i < 30; ++i) {
      runtimeScene.renderAndStep(1000 / 60);
    }
    expect(object2.getX()).to.be.within(9.83, 9.84);
    expect(object2.getY()).to.be(-30);
    expect(object.getX()).to.be.within(-0.59, -0.58);
    expect(object.getY()).to.be(-30);
  });
});
