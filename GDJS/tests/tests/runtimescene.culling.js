// @ts-check
describe('gdjs.RuntimeScene culling tests', () => {

  it('should hide objects moving outside of the screen', () => {
    const game = gdjs.getPixiRuntimeGame();
    const scene = new gdjs.TestRuntimeScene(game, ['', 'MyLayer']);

    scene.getLayer('MyLayer').setCameraX(8000);

    const object = new gdjs.TestSpriteRuntimeObject(scene);
    object.setUnscaledWidthAndHeight(100, 100);
    object.setCustomWidthAndHeight(100, 100);
    scene.addObject(object);

    scene.renderAndStep(1000 / 60);
    expect(object.getRendererObject().visible).to.be(true);

    object.setY(8000);

    scene.renderAndStep(1000 / 60);
    expect(object.getRendererObject().visible).to.be(false);
  });

  it('should show objects moving back in the screen', () => {
    const game = gdjs.getPixiRuntimeGame();
    const scene = new gdjs.TestRuntimeScene(game, ['']);

    const object = new gdjs.TestSpriteRuntimeObject(scene);
    object.setUnscaledWidthAndHeight(100, 100);
    object.setCustomWidthAndHeight(100, 100);
    scene.addObject(object);
    object.setY(8000);

    scene.renderAndStep(1000 / 60);
    expect(object.getRendererObject().visible).to.be(false);

    object.setY(200);

    scene.renderAndStep(1000 / 60);
    expect(object.getRendererObject().visible).to.be(true);
  });

  it('should handle objects changing of layer', () => {
    const game = gdjs.getPixiRuntimeGame();
    const scene = new gdjs.TestRuntimeScene(game, ['']);

    const object = new gdjs.TestSpriteRuntimeObject(scene);
    object.setUnscaledWidthAndHeight(100, 100);
    object.setCustomWidthAndHeight(100, 100);
    scene.addObject(object);

    scene.renderAndStep(1000 / 60);
    expect(object.getRendererObject().visible).to.be(true);

    object.setLayer('MyLayer');

    scene.renderAndStep(1000 / 60);
    expect(object.getRendererObject().visible).to.be(false);
  });

  it('should allow objects to sleep at the end of the 1st frame', () => {
    const game = gdjs.getPixiRuntimeGame();
    const scene = new gdjs.TestRuntimeScene(game, ['']);

    const object = new gdjs.TestSpriteRuntimeObject(scene);
    object.setUnscaledWidthAndHeight(100, 100);
    object.setCustomWidthAndHeight(100, 100);
    scene.addObject(object);

    scene.renderAndStep(1000 / 60);
    expect(object.getRendererObject().visible).to.be(true);
    expect(object.getSpatialSearchSleepState().isAwake()).to.be(false);
    
    object.setY(200);
    expect(object.getSpatialSearchSleepState().isAwake()).to.be(true);
  });

  it('should put objects to sleep when they don\'t move for 2 seconds', () => {
    const game = gdjs.getPixiRuntimeGame();
    const scene = new gdjs.TestRuntimeScene(game, ['']);

    const object = new gdjs.TestSpriteRuntimeObject(scene);
    object.setUnscaledWidthAndHeight(100, 100);
    object.setCustomWidthAndHeight(100, 100);
    scene.addObject(object);

    scene.renderAndStep(1000 / 60);
    object.setY(200);
    expect(object.getSpatialSearchSleepState().isAwake()).to.be(true);

    for (let index = 0; index < 60 + 64; index++) {
      scene.renderAndStep(1000 / 60);
    }
    expect(object.getSpatialSearchSleepState().isAwake()).to.be(false);
    expect(object.getRendererObject().visible).to.be(true);
  });
});
