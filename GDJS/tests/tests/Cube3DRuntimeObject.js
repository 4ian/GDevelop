// @ts-check

describe('gdjs.Cube3DRuntimeObject', function () {
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
    });
    return runtimeScene;
  };

  /**
   * @param {gdjs.RuntimeInstanceContainer} instanceContainer
   * @param {Object} contentOverrides
   * @returns {gdjs.Cube3DRuntimeObject}
   */
  const createCube = (instanceContainer, contentOverrides) => {
    const content = Object.assign(
      {
        width: 100,
        height: 100,
        depth: 100,
        enableTextureTransparency: false,
        facesOrientation: 'Y',
        frontFaceResourceName: '',
        backFaceResourceName: '',
        backFaceUpThroughWhichAxisRotation: 'X',
        leftFaceResourceName: '',
        rightFaceResourceName: '',
        topFaceResourceName: '',
        bottomFaceResourceName: '',
        // Keep all faces invisible so no texture/resource is required.
        frontFaceVisible: false,
        backFaceVisible: false,
        leftFaceVisible: false,
        rightFaceVisible: false,
        topFaceVisible: false,
        bottomFaceVisible: false,
        frontFaceResourceRepeat: false,
        backFaceResourceRepeat: false,
        leftFaceResourceRepeat: false,
        rightFaceResourceRepeat: false,
        topFaceResourceRepeat: false,
        bottomFaceResourceRepeat: false,
        tileScale: 1,
        originLocation: 'TopLeft',
        centerLocation: 'ObjectCenter',
        materialType: 'StandardWithoutMetalness',
        tint: '255;255;255',
        isCastingShadow: false,
        isReceivingShadow: false,
      },
      contentOverrides
    );
    const cube = new gdjs.Cube3DRuntimeObject(instanceContainer, {
      name: 'MyCube',
      type: 'Scene3D::Cube3DObject',
      variables: [],
      behaviors: [],
      effects: [],
      content,
    });
    instanceContainer.addObject(cube);
    return cube;
  };

  const makeCube = async (contentOverrides) => {
    const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
    const runtimeScene = createSceneWithLayer(runtimeGame);
    const cube = createCube(runtimeScene, contentOverrides);
    return { runtimeScene, cube };
  };

  it('keeps the historical top-left origin and centered rotation by default', async () => {
    const { cube } = await makeCube({});
    cube.setPosition(8, 16);
    cube.setZ(32);
    cube.setWidth(100);
    cube.setHeight(200);
    cube.setDepth(300);

    // Origin is the top-left of the bottom face (backward compatible).
    expect(cube.getDrawableX()).to.be(8);
    expect(cube.getDrawableY()).to.be(16);
    expect(cube.getDrawableZ()).to.be(32);

    // Center (rotation/center point) is the geometric center.
    expect(cube.getCenterX()).to.be(50);
    expect(cube.getCenterY()).to.be(100);
    expect(cube.getCenterZ()).to.be(150);

    // The Three.js group (rotation center) is at the geometric center in the
    // scene and the box mesh is not offset inside the group.
    const group = cube.get3DRendererObject();
    expect(group.position.x).to.be(8 + 50);
    expect(group.position.y).to.be(16 + 100);
    expect(group.position.z).to.be(32 + 150);
    const boxMesh = cube.getRenderer()._boxMesh;
    expect(boxMesh.position.x).to.be(0);
    expect(boxMesh.position.y).to.be(0);
    expect(boxMesh.position.z).to.be(0);
  });

  it('places the object position at the object center when origin is "ObjectCenter"', async () => {
    const { cube } = await makeCube({ originLocation: 'ObjectCenter' });
    cube.setPosition(8, 16);
    cube.setZ(32);
    cube.setWidth(100);
    cube.setHeight(200);
    cube.setDepth(300);

    // The object (x, y, z) is now the center of the box.
    expect(cube.getDrawableX()).to.be(8 - 50);
    expect(cube.getDrawableY()).to.be(16 - 100);
    expect(cube.getDrawableZ()).to.be(32 - 150);
    expect(cube.getCenterX()).to.be(50);
    expect(cube.getCenterY()).to.be(100);
    expect(cube.getCenterZ()).to.be(150);

    // The center is still the geometric center, so the group sits at (x, y, z).
    const group = cube.get3DRendererObject();
    expect(group.position.x).to.be(8);
    expect(group.position.y).to.be(16);
    expect(group.position.z).to.be(32);
  });

  it('places the origin at the bottom center (Z) when configured', async () => {
    const { cube } = await makeCube({ originLocation: 'BottomCenterZ' });
    cube.setPosition(8, 16);
    cube.setZ(32);
    cube.setWidth(100);
    cube.setHeight(200);
    cube.setDepth(300);

    // BottomCenterZ origin is [0.5, 0.5, 0].
    expect(cube.getDrawableX()).to.be(8 - 50);
    expect(cube.getDrawableY()).to.be(16 - 100);
    expect(cube.getDrawableZ()).to.be(32 - 0);
  });

  it('uses a custom rotation center when center is "TopLeft"', async () => {
    const { cube } = await makeCube({ centerLocation: 'TopLeft' });
    cube.setPosition(8, 16);
    cube.setZ(32);
    cube.setWidth(100);
    cube.setHeight(200);
    cube.setDepth(300);

    // Center point [0, 0, 0]: the rotation center is the origin (top-left).
    expect(cube.getCenterX()).to.be(0);
    expect(cube.getCenterY()).to.be(0);
    expect(cube.getCenterZ()).to.be(0);

    // The group (rotation center) is at the object position, and the box mesh
    // is offset so that its top-left corner is at the group origin.
    const group = cube.get3DRendererObject();
    expect(group.position.x).to.be(8);
    expect(group.position.y).to.be(16);
    expect(group.position.z).to.be(32);
    const boxMesh = cube.getRenderer()._boxMesh;
    expect(boxMesh.position.x).to.be(50);
    expect(boxMesh.position.y).to.be(100);
    expect(boxMesh.position.z).to.be(150);
  });

  it('updates points through updateFromObjectData (hot reload)', async () => {
    const { cube } = await makeCube({});
    cube.setPosition(8, 16);
    cube.setZ(32);
    cube.setWidth(100);
    cube.setHeight(200);
    cube.setDepth(300);

    // Mimic an object data change of the origin point.
    cube.updateFromObjectData(
      { content: { originLocation: 'TopLeft', centerLocation: 'ObjectCenter' } },
      { content: { originLocation: 'ObjectCenter', centerLocation: 'ObjectCenter' } }
    );

    expect(cube.getDrawableX()).to.be(8 - 50);
    expect(cube.getDrawableY()).to.be(16 - 100);
    expect(cube.getDrawableZ()).to.be(32 - 150);
  });
});
