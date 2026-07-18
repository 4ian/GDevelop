// @ts-check

describe('gdjs.DebuggerPixiRenderer', function () {
  /**
   * @returns {{runtimeScene: gdjs.RuntimeScene, object: gdjs.TestRuntimeObject, layer: gdjs.RuntimeLayer}}
   */
  const make3DSceneAndObject = () => {
    const runtimeGame = gdjs.getPixiRuntimeGame();
    const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
    runtimeScene.addLayer({
      name: '',
      renderingType: '3d',
      cameraType: 'perspective',
      visibility: true,
      cameras: [],
      effects: [],
      ambientLightColorR: 0,
      ambientLightColorG: 0,
      ambientLightColorB: 0,
      isLightingLayer: false,
      followBaseLayerCamera: false,
    });
    const object = new gdjs.TestRuntimeObject(runtimeScene, {
      name: 'Object',
      type: '',
      variables: [],
      behaviors: [],
      effects: [],
    });
    return { runtimeScene, object, layer: runtimeScene.getLayer('') };
  };

  it('refreshes collision masks at 30 frames per second', function () {
    const { runtimeScene } = make3DSceneAndObject();
    const debuggerRenderer = runtimeScene.getDebuggerRenderer();
    const now = sinon.stub(Date, 'now');
    now.returns(1000);
    debuggerRenderer._debugDrawLastRenderSignature = '0:0:0';
    debuggerRenderer._debugDrawLastRenderTime = 1000;

    try {
      expect(
        debuggerRenderer.isDebugDrawRefreshNeeded(false, false, false)
      ).to.be(false);
      now.returns(1033);
      expect(
        debuggerRenderer.isDebugDrawRefreshNeeded(false, false, false)
      ).to.be(false);
      now.returns(1034);
      expect(
        debuggerRenderer.isDebugDrawRefreshNeeded(false, false, false)
      ).to.be(true);
    } finally {
      now.restore();
      runtimeScene._destroy();
    }
  });

  it('renders and updates a 3D collision mask in its layer', function () {
    const { runtimeScene, object, layer } = make3DSceneAndObject();
    let collisionMask = {
      vertices: new Float32Array([0, 0, 0, 10, 0, 0, 0, 10, 0]),
      positionX: 100,
      positionY: 200,
      positionZ: 300,
      rotationX: 0,
      rotationY: 0,
      rotationZ: Math.sqrt(0.5),
      rotationW: Math.sqrt(0.5),
    };
    object.get3DDebugCollisionMasks = () => [collisionMask];
    expect(object.getRendererObject()).to.be(null);

    const debuggerRenderer = runtimeScene.getDebuggerRenderer();
    const clearMaskCache = sinon.spy(object, 'clear3DDebugCollisionMaskCache');
    debuggerRenderer.renderDebugDraw([object], false, false, false);

    const threeGroup = layer.getRenderer().getThreeGroup();
    if (!threeGroup) {
      throw new Error('The 3D layer should have a Three.js group.');
    }
    expect(threeGroup.children.length).to.be(1);
    const lineSegments = /** @type {THREE.LineSegments} */ (
      threeGroup.children[0]
    );
    expect(lineSegments instanceof THREE.LineSegments).to.be(true);
    expect(lineSegments.geometry.getAttribute('position').count).to.be(6);
    expect(lineSegments.position.toArray()).to.eql([100, 200, 300]);
    expect(lineSegments.quaternion.toArray()).to.eql([
      0,
      0,
      Math.sqrt(0.5),
      Math.sqrt(0.5),
    ]);
    const material = /** @type {THREE.LineBasicMaterial} */ (
      lineSegments.material
    );
    expect(material.color.getHex()).to.be(0xff0000);
    expect(material.opacity).to.be(0.5);
    expect(material.depthTest).to.be(false);

    const previousGeometry = lineSegments.geometry;
    const disposePreviousGeometry = sinon.spy(previousGeometry, 'dispose');
    collisionMask = {
      ...collisionMask,
      vertices: new Float32Array([0, 0, 0, 20, 0, 0, 0, 20, 0]),
      positionX: 400,
    };
    debuggerRenderer._debugDrawLastRenderTime = 0;
    debuggerRenderer.renderDebugDraw([object], false, false, false);

    expect(threeGroup.children[0]).to.be(lineSegments);
    expect(disposePreviousGeometry.calledOnce).to.be(true);
    expect(lineSegments.geometry).not.to.be(previousGeometry);
    expect(lineSegments.position.x).to.be(400);
    expect(lineSegments.renderOrder).to.be.greaterThan(Number.MAX_SAFE_INTEGER);

    const raycastIntersections = [];
    lineSegments.raycast(new THREE.Raycaster(), raycastIntersections);
    expect(raycastIntersections).to.eql([]);

    debuggerRenderer.clearDebugDraw();
    expect(clearMaskCache.calledOnce).to.be(true);
  });

  it('removes and disposes 3D collision masks when its container is destroyed', function () {
    const { runtimeScene, object, layer } = make3DSceneAndObject();
    object.get3DDebugCollisionMasks = () => [
      {
        vertices: new Float32Array([0, 0, 0, 10, 0, 0, 0, 10, 0]),
        positionX: 0,
        positionY: 0,
        positionZ: 0,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        rotationW: 1,
      },
    ];

    const debuggerRenderer = runtimeScene.getDebuggerRenderer();
    const clearMaskCache = sinon.spy(object, 'clear3DDebugCollisionMaskCache');
    debuggerRenderer.renderDebugDraw([object], false, false, false);
    const threeGroup = layer.getRenderer().getThreeGroup();
    if (!threeGroup) {
      throw new Error('The 3D layer should have a Three.js group.');
    }
    const lineSegments = /** @type {THREE.LineSegments} */ (
      threeGroup.children[0]
    );
    const material = /** @type {THREE.LineBasicMaterial} */ (
      lineSegments.material
    );
    const disposeGeometry = sinon.spy(lineSegments.geometry, 'dispose');
    const disposeMaterial = sinon.spy(material, 'dispose');

    runtimeScene._destroy();

    expect(threeGroup.children.length).to.be(0);
    expect(disposeGeometry.calledOnce).to.be(true);
    expect(disposeMaterial.calledOnce).to.be(true);
    expect(clearMaskCache.calledOnce).to.be(true);
    expect(Object.keys(debuggerRenderer._debugDraw3DCollisionMasks)).to.eql([]);
  });

  it('removes a cached mask when its hidden object stops providing it', function () {
    const { runtimeScene, object, layer } = make3DSceneAndObject();
    let collisionMasks = [
      {
        vertices: new Float32Array([0, 0, 0, 10, 0, 0, 0, 10, 0]),
        positionX: 0,
        positionY: 0,
        positionZ: 0,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        rotationW: 1,
      },
    ];
    object.get3DDebugCollisionMasks = () => collisionMasks;

    const debuggerRenderer = runtimeScene.getDebuggerRenderer();
    debuggerRenderer.renderDebugDraw([object], false, false, false);
    const threeGroup = layer.getRenderer().getThreeGroup();
    if (!threeGroup) {
      throw new Error('The 3D layer should have a Three.js group.');
    }
    const lineSegments = /** @type {THREE.LineSegments} */ (
      threeGroup.children[0]
    );
    const disposeGeometry = sinon.spy(lineSegments.geometry, 'dispose');

    object.hide(true);
    collisionMasks = [];
    debuggerRenderer._debugDrawLastRenderTime = 0;
    debuggerRenderer.renderDebugDraw([object], false, false, false);

    expect(threeGroup.children.length).to.be(0);
    expect(disposeGeometry.calledOnce).to.be(true);

    debuggerRenderer.clearDebugDraw();
  });
});
