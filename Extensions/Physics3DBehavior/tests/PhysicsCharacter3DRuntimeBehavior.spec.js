// @ts-check
describe('gdjs.PhysicsCharacter3DRuntimeBehavior', () => {
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));
  const frameDuration = 1000 / 60;

  beforeEach(async function () {
    // Wait for the Jolt library to be loaded.
    for (let index = 0; index < 400 && !window.Jolt; index++) {
      await delay(5);
    }
    if (!window.Jolt) {
      throw new Error('Timeout loading Jolt.');
    }
  });

  const createScene = () => {
    const runtimeGame = gdjs.getPixiRuntimeGame();
    const runtimeScene = new gdjs.TestRuntimeScene(runtimeGame);
    runtimeScene.loadFromScene({
      sceneData: {
        layers: [
          {
            name: '',
            visibility: true,
            cameras: [],
            effects: [],
            ambientLightColorR: 127,
            ambientLightColorB: 127,
            ambientLightColorG: 127,
            isLightingLayer: false,
            followBaseLayerCamera: false,
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
        objectsGroups: [],
        instances: [],
        usedResources: [],
        uiSettings: {
          grid: false,
          gridType: 'rectangular',
          gridWidth: 10,
          gridHeight: 10,
          gridDepth: 10,
          gridOffsetX: 0,
          gridOffsetY: 0,
          gridOffsetZ: 0,
          gridColor: 0,
          gridAlpha: 1,
          snap: false,
        },
      },
      usedExtensionsWithVariablesData: [],
    });
    const physics3DSharedData = {
      name: 'Physics3D',
      type: 'Physics3D::Physics3DBehavior',
      gravityX: 0,
      gravityY: 0,
      gravityZ: -9.8,
      worldScale: 100,
    };
    runtimeScene.setInitialSharedDataForBehavior(
      'Physics3D',
      physics3DSharedData
    );
    return runtimeScene;
  };

  const physics3DBehaviorData = (overrides) => ({
    name: 'Physics3D',
    type: 'Physics3D::Physics3DBehavior',
    bodyType: 'Static',
    bullet: false,
    fixedRotation: false,
    shape: 'Box',
    meshShapeResourceName: '',
    shapeOrientation: 'Z',
    shapeDimensionA: 0,
    shapeDimensionB: 0,
    shapeDimensionC: 0,
    shapeOffsetX: 0,
    shapeOffsetY: 0,
    shapeOffsetZ: 0,
    massCenterOffsetX: 0,
    massCenterOffsetY: 0,
    massCenterOffsetZ: 0,
    massOverride: 0,
    density: 1,
    friction: 0.3,
    restitution: 0.1,
    linearDamping: 0.1,
    angularDamping: 0.1,
    gravityScale: 1,
    layers: (1 << 4) | (1 << 0),
    masks: (1 << 4) | (1 << 0),
    ...overrides,
  });

  const addCube = (runtimeScene, name, behaviors, size) => {
    const object = new gdjs.Cube3DRuntimeObject(runtimeScene, {
      name,
      type: 'Scene3D::Cube3DObject',
      effects: [],
      variables: [],
      behaviors,
      // @ts-ignore
      content: {
        width: size.width,
        height: size.height,
        depth: size.depth,
      },
    });
    runtimeScene.addObject(object);
    return object;
  };

  const addPlatform = (runtimeScene, { x, y, z, width, height, depth }) => {
    const platform = addCube(
      runtimeScene,
      'Platform',
      [physics3DBehaviorData({ bodyType: 'Static' })],
      { width, height, depth }
    );
    platform.setPosition(x, y);
    platform.setZ(z);
    return platform;
  };

  const addCharacter = (runtimeScene, { x, y, z }) => {
    const character = addCube(
      runtimeScene,
      'Character',
      [
        physics3DBehaviorData({ bodyType: 'Dynamic', shape: 'Capsule' }),
        {
          name: 'PhysicsCharacter3D',
          type: 'Physics3D::PhysicsCharacter3D',
          physics3D: 'Physics3D',
          jumpHeight: 200,
          jumpSustainTime: 0.2,
          gravity: 1000,
          fallingSpeedMax: 700,
          forwardAcceleration: 1200,
          forwardDeceleration: 1200,
          forwardSpeedMax: 600,
          sidewaysAcceleration: 800,
          sidewaysDeceleration: 800,
          sidewaysSpeedMax: 400,
          slopeMaxAngle: 50,
          stairHeightMax: 20,
          shouldBindObjectAndForwardAngle: true,
          canBePushed: true,
        },
      ],
      { width: 50, height: 50, depth: 100 }
    );
    character.setPosition(x, y);
    character.setZ(z);
    /** @type {gdjs.PhysicsCharacter3DRuntimeBehavior} */
    // @ts-ignore
    const behavior = character.getBehavior('PhysicsCharacter3D');
    return { character, behavior };
  };

  /**
   * A 500x500 platform, with its top at Z=100, and a character standing
   * on it, near its edge on the X axis.
   */
  const createSceneWithCharacterOnPlatform = () => {
    const runtimeScene = createScene();
    addPlatform(runtimeScene, {
      x: 0,
      y: 0,
      z: 0,
      width: 500,
      height: 500,
      depth: 100,
    });
    const { character, behavior } = addCharacter(runtimeScene, {
      x: 400,
      y: 225,
      z: 100,
    });
    // Let the character land on the platform.
    for (let i = 0; i < 10; i++) {
      runtimeScene.renderAndStep(frameDuration);
    }
    expect(behavior.isOnFloor()).to.be(true);
    expect(behavior.canJump()).to.be(true);
    return { runtimeScene, character, behavior };
  };

  const walkOffThePlatform = (runtimeScene, character, behavior) => {
    for (let i = 0; i < 120 && behavior.isOnFloor(); i++) {
      behavior.simulateForwardKey();
      runtimeScene.renderAndStep(frameDuration);
    }
    expect(character.getX()).to.be.greaterThan(500 - 25);
    expect(behavior.isOnFloor()).to.be(false);
    expect(behavior.isFallingWithoutJumping()).to.be(true);
    // Fall a bit more to be sure to be in the air.
    for (let i = 0; i < 5; i++) {
      runtimeScene.renderAndStep(frameDuration);
    }
    expect(behavior.isFallingWithoutJumping()).to.be(true);
  };

  it('can jump from the floor, but not a second time while in the air', () => {
    const { runtimeScene, character, behavior } =
      createSceneWithCharacterOnPlatform();
    const zBeforeJump = character.getZ();

    behavior.simulateJumpKey();
    runtimeScene.renderAndStep(frameDuration);
    expect(behavior.isJumping()).to.be(true);
    for (let i = 0; i < 5; i++) {
      runtimeScene.renderAndStep(frameDuration);
    }
    expect(behavior.isJumping()).to.be(true);
    expect(character.getZ()).to.be.greaterThan(zBeforeJump);
    expect(behavior.canJump()).to.be(false);

    const jumpSpeedBeforeSecondJumpAttempt = behavior.getCurrentJumpSpeed();
    behavior.simulateJumpKey();
    runtimeScene.renderAndStep(frameDuration);
    expect(behavior.getCurrentJumpSpeed()).to.be.lessThan(
      jumpSpeedBeforeSecondJumpAttempt
    );
  });

  it('can not jump in the air after falling from a platform', () => {
    const { runtimeScene, character, behavior } =
      createSceneWithCharacterOnPlatform();
    walkOffThePlatform(runtimeScene, character, behavior);
    expect(behavior.canJump()).to.be(false);

    const fallSpeedBeforeJumpAttempt = behavior.getCurrentFallSpeed();
    behavior.simulateJumpKey();
    runtimeScene.renderAndStep(frameDuration);
    expect(behavior.isJumping()).to.be(false);
    expect(behavior.getCurrentJumpSpeed()).to.be(0);
    expect(behavior.getCurrentFallSpeed()).to.be.greaterThan(
      fallSpeedBeforeJumpAttempt
    );
    expect(behavior.isFallingWithoutJumping()).to.be(true);
  });

  it('can jump in the air after falling from a platform when allowed by an action', () => {
    const { runtimeScene, character, behavior } =
      createSceneWithCharacterOnPlatform();
    walkOffThePlatform(runtimeScene, character, behavior);
    expect(behavior.canJump()).to.be(false);

    // "Allow jumping again" action.
    behavior.setCanJump();
    expect(behavior.canJump()).to.be(true);
    behavior.simulateJumpKey();
    runtimeScene.renderAndStep(frameDuration);
    expect(behavior.isJumping()).to.be(true);
    expect(behavior.canJump()).to.be(false);
  });
});
