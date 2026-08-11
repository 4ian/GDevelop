// @ts-check

describe('Spring bone debug collision shapes', function () {
  const makeBehavior = () => {
    const rendererObject = new THREE.Group();
    const behavior = new gdjs.SpringBone3DRuntimeBehavior(
      /** @type {any} */ ({
        getGame: () => ({ isInGameEdition: () => false }),
        getScene: () => ({}),
      }),
      {
        name: 'SpringBones',
        type: 'SpringBoneDynamics::SpringBone3DBehavior',
        configurationResource: '',
        enabled: true,
        backendPreference: 'CPU',
        simulationFrequency: 120,
        maxSubsteps: 6,
        blendWeight: 1,
        movementInertia: 1,
        rotationInertia: 1,
        gravityScale: 1,
        windX: 0,
        windY: 0,
        windZ: 0,
        teleportDistance: 300,
        teleportAngle: 90,
      },
      /** @type {any} */ ({
        getRenderer: () => ({
          get3DRendererObject: () => rendererObject,
        }),
      })
    );
    const unsafeBehavior = /** @type {any} */ (behavior);
    unsafeBehavior._configurationStatus = 'ready';
    unsafeBehavior._configuration = {
      formatVersion: 1,
      chains: [
        {
          name: 'Hair',
          bones: ['Root', 'End'],
          damping: 0.9,
          stiffness: 0.1,
          gravityX: 0,
          gravityY: 0,
          gravityZ: -600,
          maxAngleRadians: Math.PI,
          collisionMargin: 2,
          collisionStartPoint: 1,
          collisionPointCount: 1,
        },
      ],
      colliders: [
        {
          name: 'Sphere',
          bone: 'Root',
          aX: 0,
          aY: 0,
          aZ: 0,
          bX: 0,
          bY: 0,
          bZ: 0,
          radiusA: 1,
          radiusB: 1,
          chainMask: 1,
        },
        {
          name: 'Capsule',
          bone: 'Root',
          aX: 0,
          aY: 0,
          aZ: 0,
          bX: 0,
          bY: 0,
          bZ: 0,
          radiusA: 1,
          radiusB: 2,
          chainMask: 1,
        },
      ],
      pointCount: 2,
    };
    unsafeBehavior._colliderWorldData = new Float32Array([
      1, 2, 3, 1, 1, 2, 3, 1, 0, 0, 0, 1, 0, 0, 10, 2,
    ]);
    return behavior;
  };

  it('builds every configured sphere and tapered capsule', function () {
    const behavior = makeBehavior();
    const masks = behavior.get3DDebugCollisionMasks();

    expect(masks).to.have.length(2);
    expect(masks[0].vertices.length).to.be.greaterThan(0);
    expect(Array.from(masks[0].vertices).every(Number.isFinite)).to.be(true);
    expect(masks[0].positionX).to.be(1);
    expect(masks[0].positionY).to.be(2);
    expect(masks[0].positionZ).to.be(3);
    expect(masks[1].positionZ).to.be(5);
    expect(masks[1].rotationW).to.be(1);

    const sphereExtent = Math.max(...Array.from(masks[0].vertices));
    expect(sphereExtent).to.be.within(0.999, 1.001);
  });

  it('reuses geometry while animated collider transforms change', function () {
    const behavior = makeBehavior();
    const firstMasks = behavior.get3DDebugCollisionMasks();
    const capsuleVertices = firstMasks[1].vertices;

    /** @type {any} */ (behavior)._colliderWorldData.set(
      [0, 0, 0, 1, 10, 0, 0, 2],
      8
    );
    const movedMasks = behavior.get3DDebugCollisionMasks();
    expect(movedMasks[1].vertices).to.be(capsuleVertices);
    expect(movedMasks[1].positionX).to.be(5);
    expect(movedMasks[1].positionZ).to.be(0);
    expect(movedMasks[1].rotationY).to.be.within(0.706, 0.708);
    expect(movedMasks[1].rotationW).to.be.within(0.706, 0.708);

    behavior.clear3DDebugCollisionMaskCache();
    expect(behavior.get3DDebugCollisionMasks()[1].vertices).not.to.be(
      capsuleVertices
    );
  });

  it('converts Three.js world points back to debug-layer coordinates', function () {
    const behavior = makeBehavior();
    const unsafeBehavior = /** @type {any} */ (behavior);
    const rendererObject = behavior.owner.getRenderer().get3DRendererObject();
    const layerGroup = new THREE.Group();
    layerGroup.scale.y = -1;
    layerGroup.add(rendererObject);

    const masks = behavior.get3DDebugCollisionMasks();
    expect(masks[0].positionX).to.be(1);
    expect(masks[0].positionY).to.be(-2);
    expect(masks[0].positionZ).to.be(3);
    expect(unsafeBehavior._debugColliderPointA.y).to.be(-2);
  });
});
