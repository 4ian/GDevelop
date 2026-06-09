// @ts-check
/// <reference path="../jolt-physics.d.ts" />

describe('Physics3DRuntimeBehavior', () => {
  const physicsBehaviorName = 'Physics3D';
  const worldScale = 100;
  const epsilon = 1 / 100000;

  const expectCloseTo = (actual, expected) => {
    expect(Math.abs(actual - expected) < epsilon).to.be(true);
  };

  const makePhysicsBehaviorData = (overrides = {}) => ({
    name: physicsBehaviorName,
    type: 'Physics3D::Physics3DBehavior',
    bodyType: 'Dynamic',
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
    gravityScale: 0,
    layers: (1 << 4) | (1 << 0),
    masks: (1 << 4) | (1 << 0),
    ...overrides,
  });

  const makeCharacterBehaviorData = () => ({
    name: 'Character3D',
    type: 'Physics3D::PhysicsCharacter3D',
    physics3D: physicsBehaviorName,
    jumpHeight: 80,
    jumpSustainTime: 0,
    gravity: 1000,
    fallingSpeedMax: 1000,
    forwardAcceleration: 1500,
    forwardDeceleration: 1500,
    forwardSpeedMax: 250,
    sidewaysAcceleration: 1500,
    sidewaysDeceleration: 1500,
    sidewaysSpeedMax: 250,
    slopeMaxAngle: 50,
    stairHeightMax: 20,
    shouldBindObjectAndForwardAngle: true,
    canBePushed: true,
  });

  const createSceneWithPhysics = async () => {
    await gdjs.getAllAsynchronouslyLoadingLibraryPromise();
    const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
    const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
    runtimeScene.addLayer({
      name: '',
      visibility: true,
      cameras: [],
      effects: [],
      ambientLightColorR: 0,
      ambientLightColorG: 0,
      ambientLightColorB: 0,
      isLightingLayer: false,
      followBaseLayerCamera: false,
    });
    /** @type {BehaviorSharedData & {gravityX: number, gravityY: number, gravityZ: number, worldScale: number}} */
    const sharedData = {
      name: physicsBehaviorName,
      type: 'Physics3D::Physics3DBehavior',
      gravityX: 0,
      gravityY: 0,
      gravityZ: 0,
      worldScale,
    };
    runtimeScene.setInitialSharedDataForBehavior(
      physicsBehaviorName,
      sharedData
    );
    return runtimeScene;
  };

  const disposePhysics = (runtimeScene) => {
    const physics3DSharedData = runtimeScene.physics3DSharedData;
    if (!physics3DSharedData) return;

    Jolt.destroy(physics3DSharedData.contactListener);
    Jolt.destroy(physics3DSharedData._tempVec3);
    Jolt.destroy(physics3DSharedData._tempRVec3);
    Jolt.destroy(physics3DSharedData._tempQuat);
    Jolt.destroy(physics3DSharedData.jolt);
    runtimeScene.physics3DSharedData = null;
  };

  const makeCubeObjectData = (content) => ({
    name: 'Cube',
    type: 'Scene3D::Cube3DObject',
    effects: [],
    variables: [],
    behaviors: [makePhysicsBehaviorData()],
    // @ts-ignore - The test only sets the Cube properties it needs.
    content: {
      width: 100,
      height: 200,
      depth: 300,
      enableTextureTransparency: false,
      originLocation: 'TopLeft',
      centerLocation: 'ObjectCenter',
      ...content,
    },
  });

  const makeCharacterCubeObjectData = (content) => ({
    name: 'CharacterCube',
    type: 'Scene3D::Cube3DObject',
    effects: [],
    variables: [],
    behaviors: [makePhysicsBehaviorData(), makeCharacterBehaviorData()],
    // @ts-ignore - The test only sets the Cube properties it needs.
    content: {
      width: 50,
      height: 50,
      depth: 100,
      enableTextureTransparency: false,
      originLocation: 'TopLeft',
      centerLocation: 'BottomCenterZ',
      ...content,
    },
  });

  const makeModelObjectData = (content) => ({
    name: 'Model',
    type: 'Scene3D::Model3DObject',
    effects: [],
    variables: [],
    behaviors: [makePhysicsBehaviorData()],
    content: {
      width: 100,
      height: 200,
      depth: 300,
      modelResourceName: '',
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      keepAspectRatio: false,
      materialType: 'Basic',
      originLocation: 'TopLeft',
      centerLocation: 'ObjectCenter',
      animations: [],
      crossfadeDuration: 0,
      isCastingShadow: false,
      isReceivingShadow: false,
      ...content,
    },
  });

  const addPhysicsObject = async (objectData) => {
    const runtimeScene = await createSceneWithPhysics();
    const object =
      objectData.type === 'Scene3D::Cube3DObject'
        ? new gdjs.Cube3DRuntimeObject(runtimeScene, objectData)
        : new gdjs.Model3DRuntimeObject(runtimeScene, objectData);
    runtimeScene.addObject(object);
    object.setPosition(10, 20);
    object.setZ(30);
    const behavior = /** @type {gdjs.Physics3DRuntimeBehavior} */ (
      object.getBehavior(physicsBehaviorName)
    );
    behavior.updateBodyFromObject();
    return { runtimeScene, object, behavior };
  };

  const addCube = (runtimeScene, objectData, x, y, z) => {
    const object = new gdjs.Cube3DRuntimeObject(runtimeScene, objectData);
    runtimeScene.addObject(object);
    object.setPosition(x, y);
    object.setZ(z);
    return object;
  };

  const addStaticFloor = (runtimeScene) => {
    const floor = addCube(
      runtimeScene,
      makeCubeObjectData({
        width: 1000,
        height: 1000,
        depth: 20,
        originLocation: 'TopLeft',
        centerLocation: 'ObjectCenter',
      }),
      -500,
      -500,
      0
    );
    const behavior = /** @type {gdjs.Physics3DRuntimeBehavior} */ (
      floor.getBehavior(physicsBehaviorName)
    );
    behavior.bodyType = 'Static';
    behavior.updateBodyFromObject();
    return floor;
  };

  const stepPhysics = (runtimeScene, seconds) => {
    if (!runtimeScene.physics3DSharedData) {
      throw new Error('Physics3D shared data should have been created.');
    }
    runtimeScene.physics3DSharedData.step(seconds);
  };

  const stepUntilOnFloor = (runtimeScene, characterBehavior, stepCountMax) => {
    for (let index = 0; index < stepCountMax; index++) {
      stepPhysics(runtimeScene, 1 / 60);
      if (characterBehavior.isOnFloor()) {
        return true;
      }
    }
    return false;
  };

  const stepUntilNotOnFloor = (
    runtimeScene,
    characterBehavior,
    stepCountMax
  ) => {
    for (let index = 0; index < stepCountMax; index++) {
      stepPhysics(runtimeScene, 1 / 60);
      if (!characterBehavior.isOnFloor()) {
        return true;
      }
    }
    return false;
  };

  const assertBodyMatchesObject = (object, behavior) => {
    const body = behavior.getBody();
    const bodyPosition = body.GetPosition();
    expectCloseTo(bodyPosition.GetX() * worldScale, object.getCenterXInScene());
    expectCloseTo(bodyPosition.GetY() * worldScale, object.getCenterYInScene());
    expectCloseTo(bodyPosition.GetZ() * worldScale, object.getCenterZInScene());

    const bounds = body.GetWorldSpaceBounds();
    expectCloseTo(bounds.get_mMin().GetX() * worldScale, object.getDrawableX());
    expectCloseTo(bounds.get_mMin().GetY() * worldScale, object.getDrawableY());
    expectCloseTo(bounds.get_mMin().GetZ() * worldScale, object.getDrawableZ());
    expectCloseTo(
      bounds.get_mMax().GetX() * worldScale,
      object.getDrawableX() + object.getWidth()
    );
    expectCloseTo(
      bounds.get_mMax().GetY() * worldScale,
      object.getDrawableY() + object.getHeight()
    );
    expectCloseTo(
      bounds.get_mMax().GetZ() * worldScale,
      object.getDrawableZ() + object.getDepth()
    );
  };

  const cubeObjectCases = [
    {
      label: 'legacy origin with object center',
      content: { originLocation: 'TopLeft', centerLocation: 'ObjectCenter' },
    },
    {
      label: 'object center origin',
      content: {
        originLocation: 'ObjectCenter',
        centerLocation: 'ObjectCenter',
      },
    },
    {
      label: 'top-left center',
      content: { originLocation: 'TopLeft', centerLocation: 'TopLeft' },
    },
    {
      label: 'bottom-center-on-Z center',
      content: { originLocation: 'TopLeft', centerLocation: 'BottomCenterZ' },
    },
    {
      label: 'bottom-center-on-Y origin and center',
      content: {
        originLocation: 'BottomCenterY',
        centerLocation: 'BottomCenterY',
      },
    },
  ];

  const modelObjectCases = [
    {
      label: 'top-left origin with object center',
      content: { originLocation: 'TopLeft', centerLocation: 'ObjectCenter' },
    },
    {
      label: 'object center origin',
      content: {
        originLocation: 'ObjectCenter',
        centerLocation: 'ObjectCenter',
      },
    },
    {
      label: 'bottom-center-on-Z center',
      content: { originLocation: 'TopLeft', centerLocation: 'BottomCenterZ' },
    },
    {
      label: 'bottom-center-on-Y origin and center',
      content: {
        originLocation: 'BottomCenterY',
        centerLocation: 'BottomCenterY',
      },
    },
  ];

  for (const { label, content } of cubeObjectCases) {
    it(`keeps a Cube3D ${label} physics body aligned with its object bounds`, async () => {
      const { runtimeScene, object, behavior } = await addPhysicsObject(
        makeCubeObjectData(content)
      );

      try {
        assertBodyMatchesObject(object, behavior);
      } finally {
        disposePhysics(runtimeScene);
      }
    });
  }

  for (const { label, content } of modelObjectCases) {
    it(`keeps a Model3D ${label} physics body aligned with its object bounds`, async () => {
      const { runtimeScene, object, behavior } = await addPhysicsObject(
        makeModelObjectData(content)
      );

      try {
        assertBodyMatchesObject(object, behavior);
      } finally {
        disposePhysics(runtimeScene);
      }
    });
  }

  it('updates the Cube3D physics body when the center point changes', async () => {
    const oldObjectData = makeCubeObjectData({
      originLocation: 'TopLeft',
      centerLocation: 'ObjectCenter',
    });
    const { runtimeScene, object, behavior } =
      await addPhysicsObject(oldObjectData);
    const newObjectData = makeCubeObjectData({
      originLocation: 'TopLeft',
      centerLocation: 'TopLeft',
    });

    try {
      object.updateFromObjectData(oldObjectData, newObjectData);
      behavior.updateBodyFromObject();

      assertBodyMatchesObject(object, behavior);
    } finally {
      disposePhysics(runtimeScene);
    }
  });

  it('keeps a bottom-centered Cube3D character on the floor after landing', async () => {
    const runtimeScene = await createSceneWithPhysics();
    addStaticFloor(runtimeScene);
    const characterObject = addCube(
      runtimeScene,
      makeCharacterCubeObjectData({}),
      -25,
      -25,
      20
    );
    const characterBehavior =
      /** @type {gdjs.PhysicsCharacter3DRuntimeBehavior} */ (
        characterObject.getBehavior('Character3D')
      );
    const physicsBehavior = /** @type {gdjs.Physics3DRuntimeBehavior} */ (
      characterObject.getBehavior(physicsBehaviorName)
    );

    try {
      characterBehavior.getPhysics3D();
      physicsBehavior.updateBodyFromObject();
      expect(stepUntilOnFloor(runtimeScene, characterBehavior, 120)).to.be(
        true
      );

      characterBehavior.simulateJumpKey();
      expect(stepUntilNotOnFloor(runtimeScene, characterBehavior, 10)).to.be(
        true
      );

      expect(stepUntilOnFloor(runtimeScene, characterBehavior, 240)).to.be(
        true
      );
    } finally {
      disposePhysics(runtimeScene);
    }
  });
});
