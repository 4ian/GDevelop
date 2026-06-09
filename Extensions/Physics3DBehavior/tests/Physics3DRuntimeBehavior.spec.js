// @ts-check

describe('Physics3DRuntimeBehavior', () => {
  const physicsBehaviorName = 'Physics3D';
  const worldScale = 100;
  const epsilon = 1 / 100000;

  const expectCloseTo = (actual, expected) => {
    expect(Math.abs(actual - expected) < epsilon).to.be(true);
  };

  const makePhysicsBehaviorData = () => ({
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
    return { object, behavior };
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
      const { object, behavior } = await addPhysicsObject(
        makeCubeObjectData(content)
      );

      assertBodyMatchesObject(object, behavior);
    });
  }

  for (const { label, content } of modelObjectCases) {
    it(`keeps a Model3D ${label} physics body aligned with its object bounds`, async () => {
      const { object, behavior } = await addPhysicsObject(
        makeModelObjectData(content)
      );

      assertBodyMatchesObject(object, behavior);
    });
  }

  it('updates the Cube3D physics body when the center point changes', async () => {
    const oldObjectData = makeCubeObjectData({
      originLocation: 'TopLeft',
      centerLocation: 'ObjectCenter',
    });
    const { object, behavior } = await addPhysicsObject(oldObjectData);
    const newObjectData = makeCubeObjectData({
      originLocation: 'TopLeft',
      centerLocation: 'TopLeft',
    });

    object.updateFromObjectData(oldObjectData, newObjectData);
    behavior.updateBodyFromObject();

    assertBodyMatchesObject(object, behavior);
  });
});
