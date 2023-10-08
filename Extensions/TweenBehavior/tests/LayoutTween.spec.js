// @ts-check
describe('gdjs.TweenRuntimeBehavior', () => {
  const createScene = (timeDelta = 1000 / 60) => {
    const runtimeGame = gdjs.getPixiRuntimeGame();
    const runtimeScene = new gdjs.TestRuntimeScene(runtimeGame);
    runtimeScene._timeManager.getElapsedTime = () => {
      return timeDelta;
    };
    return runtimeScene;
  };

  /** @type {gdjs.RuntimeScene} */
  let layout;
  /** @type {gdjs.TweenRuntimeBehavior} */
  beforeEach(() => {
    layout = createScene();
    layout.getLayer('').setTimeScale(1.5);
  });

  const tween = gdjs.evtTools.tween;
  const camera = gdjs.evtTools.camera;

  it('can play a tween till the end', () => {
    camera.setCameraRotation(layout, 200, '', 0);
    tween.tweenCameraRotation2(layout, 'MyTween', 600, '', 0.25, 'linear');

    // Tween actions don't change the value directly.
    expect(camera.getCameraRotation(layout, '', 0)).to.be(200);
    expect(tween.getValue(layout, 'MyTween')).to.be(200);
    expect(tween.getProgress(layout, 'MyTween')).to.be(0);

    let oldAngle;
    let oldValue;
    let oldProgress;
    for (let i = 0; i < 10; i++) {
      oldAngle = camera.getCameraRotation(layout, '', 0);
      oldValue = tween.getValue(layout, 'MyTween');
      oldProgress = tween.getProgress(layout, 'MyTween');

      layout.renderAndStep(1000 / 60);
      expect(tween.sceneTweenIsPlaying(layout, 'MyTween')).to.be(true);
      expect(tween.sceneTweenHasFinished(layout, 'MyTween')).to.be(false);
      expect(camera.getCameraRotation(layout, '', 0)).to.be.above(oldAngle);
      expect(tween.getValue(layout, 'MyTween')).to.be.above(oldValue);
      expect(tween.getProgress(layout, 'MyTween')).to.be.above(oldProgress);
    }
    // The tween reaches the end
    layout.renderAndStep(1000 / 60);
    expect(tween.sceneTweenIsPlaying(layout, 'MyTween')).to.be(false);
    expect(tween.sceneTweenHasFinished(layout, 'MyTween')).to.be(true);
    expect(camera.getCameraRotation(layout, '', 0)).to.be(600);
    expect(tween.getValue(layout, 'MyTween')).to.be(600);
    expect(tween.getProgress(layout, 'MyTween')).to.be(1);

    // The value is not changed after the tween is finished
    layout.renderAndStep(1000 / 60);
    expect(tween.sceneTweenIsPlaying(layout, 'MyTween')).to.be(false);
    expect(tween.sceneTweenHasFinished(layout, 'MyTween')).to.be(true);
    expect(camera.getCameraRotation(layout, '', 0)).to.be(600);
    expect(tween.getValue(layout, 'MyTween')).to.be(600);
    expect(tween.getProgress(layout, 'MyTween')).to.be(1);

    // The value is not set to the targeted value over and over
    // after the tween is finished.
    camera.setCameraRotation(layout, 123, '', 0);
    layout.renderAndStep(1000 / 60);
    expect(camera.getCameraRotation(layout, '', 0)).to.be(123);
  });

  it('can pause and resume a tween', () => {
    camera.setCameraRotation(layout, 200, '', 0);
    tween.tweenCameraRotation2(layout, 'MyTween', 600, '', 0.25, 'linear');

    // The tween starts
    for (let i = 0; i < 5; i++) {
      layout.renderAndStep(1000 / 60);
      expect(tween.sceneTweenIsPlaying(layout, 'MyTween')).to.be(true);
      expect(tween.sceneTweenHasFinished(layout, 'MyTween')).to.be(false);
    }
    expect(camera.getCameraRotation(layout, '', 0)).to.be(400);

    // Pause the tween
    tween.pauseSceneTween(layout, 'MyTween');
    expect(camera.getCameraRotation(layout, '', 0)).to.be(400);
    for (let i = 0; i < 5; i++) {
      layout.renderAndStep(1000 / 60);
      expect(tween.sceneTweenIsPlaying(layout, 'MyTween')).to.be(false);
      expect(tween.sceneTweenHasFinished(layout, 'MyTween')).to.be(false);
      expect(camera.getCameraRotation(layout, '', 0)).to.be(400);
    }

    // The value is not overridden during the pause.
    camera.setCameraRotation(layout, 123, '', 0);
    layout.renderAndStep(1000 / 60);
    expect(camera.getCameraRotation(layout, '', 0)).to.be(123);

    // Resume the tween
    tween.resumeSceneTween(layout, 'MyTween');

    // Tween actions don't change the value directly.
    expect(camera.getCameraRotation(layout, '', 0)).to.be(123);
    expect(tween.sceneTweenIsPlaying(layout, 'MyTween')).to.be(true);
    expect(tween.sceneTweenHasFinished(layout, 'MyTween')).to.be(false);
    layout.renderAndStep(1000 / 60);
    expect(camera.getCameraRotation(layout, '', 0)).to.be(440);
  });

  it('can stop and restart a tween', () => {
    camera.setCameraRotation(layout, 200, '', 0);

    // Start the tween
    tween.tweenCameraRotation2(layout, 'MyTween', 600, '', 0.25, 'linear');
    for (let i = 0; i < 5; i++) {
      layout.renderAndStep(1000 / 60);
      expect(tween.sceneTweenIsPlaying(layout, 'MyTween')).to.be(true);
      expect(tween.sceneTweenHasFinished(layout, 'MyTween')).to.be(false);
    }
    expect(camera.getCameraRotation(layout, '', 0)).to.be(400);

    // Stop the tween
    tween.stopSceneTween(layout, 'MyTween', false);
    expect(camera.getCameraRotation(layout, '', 0)).to.be(400);
    for (let i = 0; i < 5; i++) {
      layout.renderAndStep(1000 / 60);
      expect(tween.sceneTweenIsPlaying(layout, 'MyTween')).to.be(false);
      expect(tween.sceneTweenHasFinished(layout, 'MyTween')).to.be(true);
      expect(camera.getCameraRotation(layout, '', 0)).to.be(400);
    }

    // The value is not overridden by a stopped tween.
    camera.setCameraRotation(layout, 123, '', 0);
    layout.renderAndStep(1000 / 60);
    expect(camera.getCameraRotation(layout, '', 0)).to.be(123);

    // A stopped tween can't be resumed.
    tween.resumeSceneTween(layout, 'MyTween');
    expect(tween.sceneTweenIsPlaying(layout, 'MyTween')).to.be(false);
    expect(tween.sceneTweenHasFinished(layout, 'MyTween')).to.be(true);
    expect(camera.getCameraRotation(layout, '', 0)).to.be(123);

    layout.renderAndStep(1000 / 60);
    expect(camera.getCameraRotation(layout, '', 0)).to.be(123);
    expect(tween.sceneTweenIsPlaying(layout, 'MyTween')).to.be(false);
    expect(tween.sceneTweenHasFinished(layout, 'MyTween')).to.be(true);

    // Restart the tween
    tween.tweenCameraRotation2(layout, 'MyTween', 623, '', 0.25, 'linear');
    for (let i = 0; i < 5; i++) {
      layout.renderAndStep(1000 / 60);
      expect(tween.sceneTweenIsPlaying(layout, 'MyTween')).to.be(true);
      expect(tween.sceneTweenHasFinished(layout, 'MyTween')).to.be(false);
    }
    expect(camera.getCameraRotation(layout, '', 0)).to.be(373);
  });

  it('can remove and recreate a tween', () => {
    camera.setCameraRotation(layout, 200, '', 0);

    // Start the tween
    expect(tween.sceneTweenExists(layout, 'MyTween')).to.be(false);
    tween.tweenCameraRotation2(layout, 'MyTween', 600, '', 0.25, 'linear');
    expect(tween.sceneTweenExists(layout, 'MyTween')).to.be(true);
    for (let i = 0; i < 5; i++) {
      layout.renderAndStep(1000 / 60);
      expect(tween.sceneTweenIsPlaying(layout, 'MyTween')).to.be(true);
      expect(tween.sceneTweenHasFinished(layout, 'MyTween')).to.be(false);
    }
    expect(camera.getCameraRotation(layout, '', 0)).to.be(400);

    // Remove the tween
    expect(tween.sceneTweenExists(layout, 'MyTween')).to.be(true);
    tween.removeSceneTween(layout, 'MyTween');
    expect(tween.sceneTweenExists(layout, 'MyTween')).to.be(false);
    expect(camera.getCameraRotation(layout, '', 0)).to.be(400);
    for (let i = 0; i < 5; i++) {
      layout.renderAndStep(1000 / 60);
      expect(tween.sceneTweenIsPlaying(layout, 'MyTween')).to.be(false);
      expect(tween.sceneTweenHasFinished(layout, 'MyTween')).to.be(false);
      expect(camera.getCameraRotation(layout, '', 0)).to.be(400);
    }

    // The value is not overridden after the tween has been removed.
    camera.setCameraRotation(layout, 123, '', 0);
    layout.renderAndStep(1000 / 60);
    expect(camera.getCameraRotation(layout, '', 0)).to.be(123);

    // A removed tween can't be resumed.
    tween.resumeSceneTween(layout, 'MyTween');
    expect(tween.sceneTweenIsPlaying(layout, 'MyTween')).to.be(false);
    expect(tween.sceneTweenHasFinished(layout, 'MyTween')).to.be(false);
    expect(camera.getCameraRotation(layout, '', 0)).to.be(123);

    layout.renderAndStep(1000 / 60);
    expect(camera.getCameraRotation(layout, '', 0)).to.be(123);
    expect(tween.sceneTweenIsPlaying(layout, 'MyTween')).to.be(false);
    expect(tween.sceneTweenHasFinished(layout, 'MyTween')).to.be(false);

    // Recreate the tween
    expect(tween.sceneTweenExists(layout, 'MyTween')).to.be(false);
    tween.tweenCameraRotation2(layout, 'MyTween', 623, '', 0.25, 'linear');
    expect(tween.sceneTweenExists(layout, 'MyTween')).to.be(true);
    for (let i = 0; i < 5; i++) {
      layout.renderAndStep(1000 / 60);
      expect(tween.sceneTweenIsPlaying(layout, 'MyTween')).to.be(true);
      expect(tween.sceneTweenHasFinished(layout, 'MyTween')).to.be(false);
    }
    expect(camera.getCameraRotation(layout, '', 0)).to.be(373);
    expect(tween.sceneTweenExists(layout, 'MyTween')).to.be(true);
  });

  const checkProgress = (steps, getValueFunctions) => {
    if (!Array.isArray(getValueFunctions)) {
      getValueFunctions = [getValueFunctions];
    }
    for (let i = 0; i < steps; i++) {
      const oldValues = getValueFunctions.map((getValue) => getValue());
      layout.renderAndStep(1000 / 60);

      for (let index = 0; index < oldValues.length; index++) {
        expect(getValueFunctions[index]()).not.to.be(oldValues[index]);
      }
    }
  };

  it('can tween a layer value', () => {
    tween.addLayerValueTween(
      layout,
      'MyTween',
      200,
      600,
      'linear',
      0.25,
      false,
      ''
    );
    checkProgress(6, () => tween.getValue(layout, 'MyTween'));
    expect(tween.getValue(layout, 'MyTween')).to.be(440);
  });

  it('can tween a layout value', () => {
    tween.addLayoutValueTween(
      layout,
      'MyTween',
      200,
      600,
      'linear',
      0.25 / 1.5,
      false,
      ''
    );
    checkProgress(6, () => tween.getValue(layout, 'MyTween'));
    expect(tween.getValue(layout, 'MyTween')).to.be(440);
  });

  it('can tween a layer camera position', () => {
    camera.setCameraX(layout, 200, '', 0);
    camera.setCameraY(layout, 300, '', 0);
    tween.tweenCamera2(layout, 'MyTween', 600, 900, '', 0.25, 'linear');
    checkProgress(6, [
      () => camera.getCameraX(layout, '', 0),
      () => camera.getCameraY(layout, '', 0),
    ]);
    expect(camera.getCameraX(layout, '', 0)).to.be(440);
    expect(camera.getCameraY(layout, '', 0)).to.be(660);
  });

  it('can tween a layer camera zoom', () => {
    camera.setCameraZoom(layout, 200, '', 0);
    tween.tweenCameraZoom2(layout, 'MyTween', 600, '', 0.25, 'linear');
    checkProgress(6, () => camera.getCameraZoom(layout, '', 0));
    // The interpolation is exponential.
    expect(camera.getCameraZoom(layout, '', 0)).to.be(386.6364089863524);
  });

  it('can tween a layer camera rotation', () => {
    camera.setCameraRotation(layout, 200, '', 0);
    tween.tweenCameraRotation2(layout, 'MyTween', 600, '', 0.25, 'linear');
    checkProgress(6, () => camera.getCameraRotation(layout, '', 0));
    expect(camera.getCameraRotation(layout, '', 0)).to.be(440);
  });
});
