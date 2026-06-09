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

  const makeObjectData = (content) => ({
    name: 'Cube',
    type: 'Scene3D::Cube3DObject',
    effects: [],
    variables: [],
    behaviors: [],
    // @ts-ignore - The test only sets the Cube properties it needs.
    content: {
      width: 100,
      height: 200,
      depth: 300,
      ...content,
    },
  });

  const makeCube = async (content = {}) => {
    const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
    const runtimeScene = createSceneWithLayer(runtimeGame);
    const objectData = makeObjectData(content);
    const cube = new gdjs.Cube3DRuntimeObject(runtimeScene, objectData);
    runtimeScene.addObject(cube);
    cube.setPosition(10, 20);
    cube.setZ(30);
    return { cube, objectData };
  };

  it('keeps the legacy origin and object-center rotation by default', async () => {
    const { cube } = await makeCube();

    expect(cube.getDrawableX()).to.be(10);
    expect(cube.getDrawableY()).to.be(20);
    expect(cube.getDrawableZ()).to.be(30);
    expect(cube.getCenterX()).to.be(50);
    expect(cube.getCenterY()).to.be(100);
    expect(cube.getCenterZ()).to.be(150);
    expect(cube.getCenterXInScene()).to.be(60);
    expect(cube.getCenterYInScene()).to.be(120);
    expect(cube.getCenterZInScene()).to.be(180);
    expect(cube.get3DRendererObject().position.x).to.be(60);
    expect(cube.get3DRendererObject().position.y).to.be(120);
    expect(cube.get3DRendererObject().position.z).to.be(180);
  });

  it('can use the object center as its origin', async () => {
    const { cube } = await makeCube({
      originLocation: 'ObjectCenter',
      centerLocation: 'ObjectCenter',
    });

    expect(cube.getDrawableX()).to.be(-40);
    expect(cube.getDrawableY()).to.be(-80);
    expect(cube.getDrawableZ()).to.be(-120);
    expect(cube.getCenterXInScene()).to.be(10);
    expect(cube.getCenterYInScene()).to.be(20);
    expect(cube.getCenterZInScene()).to.be(30);
    expect(cube.get3DRendererObject().position.x).to.be(10);
    expect(cube.get3DRendererObject().position.y).to.be(20);
    expect(cube.get3DRendererObject().position.z).to.be(30);
  });

  it('updates origin and center from object data', async () => {
    const { cube, objectData: oldObjectData } = await makeCube();
    const newObjectData = makeObjectData({
      originLocation: 'BottomCenterZ',
      centerLocation: 'BottomCenterZ',
    });

    cube.updateFromObjectData(oldObjectData, newObjectData);

    expect(cube.getDrawableX()).to.be(-40);
    expect(cube.getDrawableY()).to.be(-80);
    expect(cube.getDrawableZ()).to.be(30);
    expect(cube.getCenterX()).to.be(50);
    expect(cube.getCenterY()).to.be(100);
    expect(cube.getCenterZ()).to.be(0);
    expect(cube.getCenterXInScene()).to.be(10);
    expect(cube.getCenterYInScene()).to.be(20);
    expect(cube.getCenterZInScene()).to.be(30);
    expect(cube.get3DRendererObject().position.x).to.be(10);
    expect(cube.get3DRendererObject().position.y).to.be(20);
    expect(cube.get3DRendererObject().position.z).to.be(30);
  });

  it('uses mipmapped linear filtering unless smoothing is explicitly disabled', async () => {
    const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
    const texture = runtimeGame
      .getImageManager()
      .getThreeTexture('base/tests-utils/assets/64x64.jpg');

    expect(texture.magFilter).to.be(THREE.LinearFilter);
    expect(texture.minFilter).to.be(THREE.LinearMipmapLinearFilter);
    expect(texture.generateMipmaps).to.be(true);
  });
});
