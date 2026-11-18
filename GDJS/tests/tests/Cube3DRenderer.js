// @ts-check

/**
 * The cube renderer merges the geometry groups of the faces that use the same
 * material, so that a cube with the same texture on all its faces costs one
 * draw call instead of one per face.
 */
describe('gdjs.Cube3DRuntimeObjectRenderer material groups', function () {
  const sameTexture = 'base/tests-utils/assets/64x64.jpg';
  const otherTexture = 'base/tests-utils/assets/32x128.jpg';

  /** @type {gdjs.RuntimeGame | null} */
  let runtimeGame = null;
  /** @type {HTMLElement | null} */
  let gameContainer = null;

  before(async () => {
    runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
    gameContainer = document.createElement('div');
    document.body.appendChild(gameContainer);
    runtimeGame.getRenderer().createStandardCanvas(gameContainer);
  });

  after(() => {
    if (gameContainer) gameContainer.remove();
    gameContainer = null;
  });

  const createSceneWithLayer = (runtimeGame) => {
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
      renderingType: '2d+3d',
    });
    return runtimeScene;
  };

  /**
   * @param {gdjs.RuntimeInstanceContainer} instanceContainer
   * @param {{
   *   front?: string,
   *   back?: string,
   *   left?: string,
   *   right?: string,
   *   top?: string,
   *   bottom?: string,
   * }} faceResourceNames
   */
  const createCube = (instanceContainer, faceResourceNames = {}) => {
    const {
      front = sameTexture,
      back = sameTexture,
      left = sameTexture,
      right = sameTexture,
      top = sameTexture,
      bottom = sameTexture,
    } = faceResourceNames;
    const cube = new gdjs.Cube3DRuntimeObject(instanceContainer, {
      name: 'Cube',
      type: 'Scene3D::Cube3DObject',
      variables: [],
      behaviors: [],
      effects: [],
      content: {
        width: 16,
        height: 16,
        depth: 16,
        enableTextureTransparency: false,
        facesOrientation: 'Y',
        frontFaceResourceName: front,
        backFaceResourceName: back,
        backFaceUpThroughWhichAxisRotation: 'X',
        leftFaceResourceName: left,
        rightFaceResourceName: right,
        topFaceResourceName: top,
        bottomFaceResourceName: bottom,
        frontFaceResourceRepeat: false,
        backFaceResourceRepeat: false,
        leftFaceResourceRepeat: false,
        rightFaceResourceRepeat: false,
        topFaceResourceRepeat: false,
        bottomFaceResourceRepeat: false,
        tileScale: 1,
        frontFaceVisible: true,
        backFaceVisible: true,
        leftFaceVisible: true,
        rightFaceVisible: true,
        topFaceVisible: true,
        bottomFaceVisible: true,
        tint: '255;255;255',
        isCastingShadow: false,
        isReceivingShadow: false,
        materialType: 'Basic',
      },
    });
    instanceContainer.addObject(cube);
    return cube;
  };

  /**
   * @param {gdjs.Cube3DRuntimeObject} cube
   * @returns {THREE.Mesh}
   */
  const getCubeMesh = (cube) => {
    const threeObject = cube.getRenderer().get3DRendererObject();
    // @ts-ignore - the cube is a mesh.
    return threeObject;
  };

  it('uses a single group when all the faces share the same texture', async () => {
    const runtimeScene = createSceneWithLayer(
      /** @type {gdjs.RuntimeGame} */ (runtimeGame)
    );
    const mesh = getCubeMesh(createCube(runtimeScene));

    expect(mesh.geometry.groups.length).to.be(1);
    expect(mesh.geometry.groups[0].start).to.be(0);
    // 6 faces of 2 triangles (3 indices each).
    expect(mesh.geometry.groups[0].count).to.be(36);
  });

  it('keeps the faces with different textures in separate groups', async () => {
    const runtimeScene = createSceneWithLayer(
      /** @type {gdjs.RuntimeGame} */ (runtimeGame)
    );
    const mesh = getCubeMesh(createCube(runtimeScene, { front: otherTexture }));
    const materials = /** @type {THREE.Material[]} */ (mesh.material);

    // right/left/bottom/top share a texture, then the front face has its own,
    // then the back face has the shared texture again.
    const groups = mesh.geometry.groups;
    /**
     * @param {number} index
     * @returns {THREE.Material}
     */
    const getGroupMaterial = (index) => {
      const materialIndex = groups[index].materialIndex;
      return materials[materialIndex === undefined ? 0 : materialIndex];
    };
    expect(groups.length).to.be(3);
    expect(groups[0].start).to.be(0);
    expect(groups[0].count).to.be(24);
    expect(groups[1].start).to.be(24);
    expect(groups[1].count).to.be(6);
    expect(groups[2].start).to.be(30);
    expect(groups[2].count).to.be(6);

    expect(getGroupMaterial(0)).to.be(getGroupMaterial(2));
    expect(getGroupMaterial(1)).not.to.be(getGroupMaterial(0));
  });

  it('updates the groups when a face is hidden', async () => {
    const runtimeScene = createSceneWithLayer(
      /** @type {gdjs.RuntimeGame} */ (runtimeGame)
    );
    const cube = createCube(runtimeScene);
    const mesh = getCubeMesh(cube);

    expect(mesh.geometry.groups.length).to.be(1);

    cube.setFaceVisibility('front', false);

    // right/left/bottom/top share a material, then the hidden front face has
    // its own (transparent) material, then the back face has its own again.
    expect(mesh.geometry.groups.length).to.be(3);
    expect(mesh.geometry.groups[0].count).to.be(24);
    expect(mesh.geometry.groups[1].start).to.be(24);
    expect(mesh.geometry.groups[1].count).to.be(6);
    expect(mesh.geometry.groups[2].start).to.be(30);
    expect(mesh.geometry.groups[2].count).to.be(6);

    // Restoring the face merges everything back.
    cube.setFaceVisibility('front', true);
    expect(mesh.geometry.groups.length).to.be(1);
    expect(mesh.geometry.groups[0].count).to.be(36);
  });
});
