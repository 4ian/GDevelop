// @ts-check
describe('gdjs.Model3DManager', () => {
  /** @returns {ResourceData} */
  const makeResource = (name) => ({
    kind: 'model3D',
    name,
    file: 'base/GDJS/tests/tests-utils/assets/' + name,
    metadata: '',
    userAdded: false,
  });

  /** Three triangles: two embed the same red 2x2 PNG, the third a blue one. */
  const resourceNames = [
    'textured-triangle-red-1.glb',
    'textured-triangle-red-2.glb',
    'textured-triangle-blue.glb',
  ];

  /** @returns {THREE.Texture} */
  const getBaseColorTexture = (model) => {
    /** @type {any} */
    let texture = null;
    model.scene.traverse((object) => {
      if (object.material && object.material.map) texture = object.material.map;
    });
    return texture;
  };

  const loadModels = async () => {
    const runtimeGame = new gdjs.RuntimeGame(
      gdjs.createProjectData({
        resources: { resources: resourceNames.map(makeResource) },
      })
    );
    const model3DManager = runtimeGame.getResourceLoader().getModel3DManager();
    for (const name of resourceNames) {
      await model3DManager.loadResource(name);
      await model3DManager.processResource(name);
    }
    return { runtimeGame, model3DManager };
  };

  it('shares the texture between models embedding the same image', async () => {
    const { model3DManager } = await loadModels();
    const red1 = getBaseColorTexture(model3DManager.getModel(resourceNames[0]));
    const red2 = getBaseColorTexture(model3DManager.getModel(resourceNames[1]));
    const blue = getBaseColorTexture(model3DManager.getModel(resourceNames[2]));

    expect(red1).to.be.ok();
    expect(red2).to.be(red1);
    expect(blue).to.be.ok();
    expect(blue).not.to.be(red1);
  });

  it('disposes a shared texture when the last model using it is unloaded', async () => {
    const { runtimeGame, model3DManager } = await loadModels();
    const resourceLoader = runtimeGame.getResourceLoader();
    const unload = (name) =>
      model3DManager.unloadResource(
        /** @type {ResourceData} */ (resourceLoader.getResource(name))
      );
    const red = getBaseColorTexture(model3DManager.getModel(resourceNames[0]));
    const blue = getBaseColorTexture(model3DManager.getModel(resourceNames[2]));
    const disposeRed = sinon.spy(red, 'dispose');
    const disposeBlue = sinon.spy(blue, 'dispose');

    unload(resourceNames[0]);
    expect(disposeRed.called).to.be(false);
    // The texture is still shared with a model loaded afterwards.
    await model3DManager.loadResource(resourceNames[0]);
    await model3DManager.processResource(resourceNames[0]);
    expect(
      getBaseColorTexture(model3DManager.getModel(resourceNames[0]))
    ).to.be(red);

    unload(resourceNames[0]);
    unload(resourceNames[1]);
    expect(disposeRed.calledOnce).to.be(true);
    expect(disposeBlue.called).to.be(false);
    // A model loaded now gets a new texture.
    await model3DManager.loadResource(resourceNames[0]);
    await model3DManager.processResource(resourceNames[0]);
    expect(
      getBaseColorTexture(model3DManager.getModel(resourceNames[0]))
    ).not.to.be(red);

    unload(resourceNames[2]);
    expect(disposeBlue.calledOnce).to.be(true);
  });
});
