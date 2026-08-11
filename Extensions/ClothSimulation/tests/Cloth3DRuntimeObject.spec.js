// @ts-check

describe('3D cloth runtime object', function () {
  const makeData = (overrides = {}) => ({
    name: 'Cloth',
    type: 'ClothSimulation::Cloth3DObject',
    variables: [],
    behaviors: [],
    effects: [],
    content: {
      width: 20,
      height: 30,
      depth: 10,
      segmentsX: 2,
      segmentsY: 2,
      backendPreference: 'CPU',
      simulationFrequency: 60,
      maxSubsteps: 4,
      stiffness: 0.2,
      damping: 0.99,
      gravityX: 0,
      gravityY: 0,
      gravityZ: -600,
      windX: 0,
      windY: 0,
      windZ: 0,
      pinMode: 'TopCorners',
      pinInterval: 1,
      sphereColliderEnabled: false,
      sphereCenterX: 0,
      sphereCenterY: 0,
      sphereCenterZ: 0,
      sphereRadius: 5,
      color: '32;64;128',
      opacity: 0.85,
      roughness: 0.8,
      metalness: 0,
      doubleSided: true,
      isCastingShadow: false,
      isReceivingShadow: true,
      ...overrides,
    },
  });

  const makeScene = () => {
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
    return runtimeScene;
  };

  it('creates a finite dynamic Three.js mesh and exposes event APIs', function () {
    const scene = makeScene();
    const object = new gdjs.Cloth3DRuntimeObject(scene, makeData());
    scene.addObject(object);
    const mesh = /** @type {THREE.Mesh} */ (object.get3DRendererObject());
    expect(mesh).to.be.a(THREE.Mesh);
    expect(mesh.geometry.getAttribute('position').count).to.be(9);
    expect(mesh.geometry.index && mesh.geometry.index.count).to.be(24);
    expect(mesh.frustumCulled).to.be(false);
    expect(object.isVertexPinned(0, 0)).to.be(true);
    expect(object.isVertexPinned(1, 0)).to.be(false);
    object.pinVertex(1, 0);
    expect(object.isVertexPinned(1, 0)).to.be(true);
    object.unpinVertex(1, 0);
    expect(object.isVertexPinned(1, 0)).to.be(false);
    object.setStiffness(9);
    object.setDamping(-9);
    expect(object.getNormalizedContent().stiffness).to.be(1);
    expect(object.getNormalizedContent().damping).to.be(0);
    object.onDeletedFromScene();
    object.onDestroyed();
  });

  it('rebuilds non-square topology transactionally on hot reload', function () {
    const scene = makeScene();
    const oldData = makeData();
    const object = new gdjs.Cloth3DRuntimeObject(scene, oldData);
    scene.addObject(object);
    const oldGeneration = object.getSimulationGeneration();
    const newData = makeData({ width: 40, segmentsX: 3, segmentsY: 5 });
    expect(object.updateFromObjectData(oldData, newData)).to.be(true);
    expect(object.getActualSegmentsX()).to.be(3);
    expect(object.getActualSegmentsY()).to.be(5);
    expect(object.getSimulationGeneration()).to.be(oldGeneration + 1);
    const mesh = /** @type {THREE.Mesh} */ (object.get3DRendererObject());
    expect(mesh.geometry.getAttribute('position').count).to.be(24);
    object.onDeletedFromScene();
    object.onDestroyed();
  });

  it('clears catch-up state when simulation is disabled', function () {
    const scene = makeScene();
    const object = new gdjs.Cloth3DRuntimeObject(scene, makeData());
    scene.addObject(object);
    object.setSimulationEnabled(false);
    expect(object.isSimulationEnabled()).to.be(false);
    expect(object.isSimulationRunning()).to.be(false);
    object.setSimulationEnabled(true);
    expect(object.isSimulationRunning()).to.be(true);
    object.onDeletedFromScene();
    object.onDestroyed();
  });
});
