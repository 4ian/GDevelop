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
  let runtimeScene;
  /** @type {gdjs.TweenRuntimeBehavior} */
  beforeEach(() => {
    runtimeScene = createScene();
    runtimeScene.getLayer('').setTimeScale(1.5);
  });

  const tween = gdjs.evtTools.tween;
  const camera = gdjs.evtTools.camera;

  it("can get default values for tweens that don't exist", () => {
    expect(tween.sceneTweenExists(runtimeScene, 'MyTween')).to.be(false);
    expect(tween.getValue(runtimeScene, 'MyTween')).to.be(0);
    expect(tween.getProgress(runtimeScene, 'MyTween')).to.be(0);
    expect(tween.sceneTweenIsPlaying(runtimeScene, 'MyTween')).to.be(false);
    expect(tween.sceneTweenHasFinished(runtimeScene, 'MyTween')).to.be(false);
  });

  it('can play a tween till the end', () => {
    camera.setCameraRotation(runtimeScene, 200, '', 0);
    tween.tweenCameraRotation2(
      runtimeScene,
      'MyTween',
      600,
      '',
      'linear',
      0.25
    );

    // Tween actions don't change the value directly.
    expect(camera.getCameraRotation(runtimeScene, '', 0)).to.be(200);
    expect(tween.getValue(runtimeScene, 'MyTween')).to.be(200);
    expect(tween.getProgress(runtimeScene, 'MyTween')).to.be(0);

    let oldAngle;
    let oldValue;
    let oldProgress;
    for (let i = 0; i < 10; i++) {
      oldAngle = camera.getCameraRotation(runtimeScene, '', 0);
      oldValue = tween.getValue(runtimeScene, 'MyTween');
      oldProgress = tween.getProgress(runtimeScene, 'MyTween');

      runtimeScene.renderAndStep(1000 / 60);
      expect(tween.sceneTweenIsPlaying(runtimeScene, 'MyTween')).to.be(true);
      expect(tween.sceneTweenHasFinished(runtimeScene, 'MyTween')).to.be(false);
      expect(camera.getCameraRotation(runtimeScene, '', 0)).to.be.above(
        oldAngle
      );
      expect(tween.getValue(runtimeScene, 'MyTween')).to.be.above(oldValue);
      expect(tween.getProgress(runtimeScene, 'MyTween')).to.be.above(
        oldProgress
      );
    }
    // The tween reaches the end
    runtimeScene.renderAndStep(1000 / 60);
    expect(tween.sceneTweenIsPlaying(runtimeScene, 'MyTween')).to.be(false);
    expect(tween.sceneTweenHasFinished(runtimeScene, 'MyTween')).to.be(true);
    expect(camera.getCameraRotation(runtimeScene, '', 0)).to.be(600);
    expect(tween.getValue(runtimeScene, 'MyTween')).to.be(600);
    expect(tween.getProgress(runtimeScene, 'MyTween')).to.be(1);

    // The value is not changed after the tween is finished
    runtimeScene.renderAndStep(1000 / 60);
    expect(tween.sceneTweenIsPlaying(runtimeScene, 'MyTween')).to.be(false);
    expect(tween.sceneTweenHasFinished(runtimeScene, 'MyTween')).to.be(true);
    expect(camera.getCameraRotation(runtimeScene, '', 0)).to.be(600);
    expect(tween.getValue(runtimeScene, 'MyTween')).to.be(600);
    expect(tween.getProgress(runtimeScene, 'MyTween')).to.be(1);

    // The value is not set to the targeted value over and over
    // after the tween is finished.
    camera.setCameraRotation(runtimeScene, 123, '', 0);
    runtimeScene.renderAndStep(1000 / 60);
    expect(camera.getCameraRotation(runtimeScene, '', 0)).to.be(123);
  });

  it('can pause and resume a tween', () => {
    camera.setCameraRotation(runtimeScene, 200, '', 0);
    tween.tweenCameraRotation2(
      runtimeScene,
      'MyTween',
      600,
      '',
      'linear',
      0.25
    );

    // The tween starts
    for (let i = 0; i < 5; i++) {
      runtimeScene.renderAndStep(1000 / 60);
      expect(tween.sceneTweenIsPlaying(runtimeScene, 'MyTween')).to.be(true);
      expect(tween.sceneTweenHasFinished(runtimeScene, 'MyTween')).to.be(false);
    }
    expect(camera.getCameraRotation(runtimeScene, '', 0)).to.be(400);

    // Pause the tween
    tween.pauseSceneTween(runtimeScene, 'MyTween');
    expect(camera.getCameraRotation(runtimeScene, '', 0)).to.be(400);
    for (let i = 0; i < 5; i++) {
      runtimeScene.renderAndStep(1000 / 60);
      expect(tween.sceneTweenIsPlaying(runtimeScene, 'MyTween')).to.be(false);
      expect(tween.sceneTweenHasFinished(runtimeScene, 'MyTween')).to.be(false);
      expect(camera.getCameraRotation(runtimeScene, '', 0)).to.be(400);
    }

    // The value is not overridden during the pause.
    camera.setCameraRotation(runtimeScene, 123, '', 0);
    runtimeScene.renderAndStep(1000 / 60);
    expect(camera.getCameraRotation(runtimeScene, '', 0)).to.be(123);

    // Resume the tween
    tween.resumeSceneTween(runtimeScene, 'MyTween');

    // Tween actions don't change the value directly.
    expect(camera.getCameraRotation(runtimeScene, '', 0)).to.be(123);
    expect(tween.sceneTweenIsPlaying(runtimeScene, 'MyTween')).to.be(true);
    expect(tween.sceneTweenHasFinished(runtimeScene, 'MyTween')).to.be(false);
    runtimeScene.renderAndStep(1000 / 60);
    expect(camera.getCameraRotation(runtimeScene, '', 0)).to.be(440);
  });

  it('can stop and restart a tween', () => {
    camera.setCameraRotation(runtimeScene, 200, '', 0);

    // Start the tween
    tween.tweenCameraRotation2(
      runtimeScene,
      'MyTween',
      600,
      '',
      'linear',
      0.25
    );
    for (let i = 0; i < 5; i++) {
      runtimeScene.renderAndStep(1000 / 60);
      expect(tween.sceneTweenIsPlaying(runtimeScene, 'MyTween')).to.be(true);
      expect(tween.sceneTweenHasFinished(runtimeScene, 'MyTween')).to.be(false);
    }
    expect(camera.getCameraRotation(runtimeScene, '', 0)).to.be(400);

    // Stop the tween
    tween.stopSceneTween(runtimeScene, 'MyTween', false);
    expect(camera.getCameraRotation(runtimeScene, '', 0)).to.be(400);
    for (let i = 0; i < 5; i++) {
      runtimeScene.renderAndStep(1000 / 60);
      expect(tween.sceneTweenIsPlaying(runtimeScene, 'MyTween')).to.be(false);
      expect(tween.sceneTweenHasFinished(runtimeScene, 'MyTween')).to.be(true);
      expect(camera.getCameraRotation(runtimeScene, '', 0)).to.be(400);
    }

    // The value is not overridden by a stopped tween.
    camera.setCameraRotation(runtimeScene, 123, '', 0);
    runtimeScene.renderAndStep(1000 / 60);
    expect(camera.getCameraRotation(runtimeScene, '', 0)).to.be(123);

    // A stopped tween can't be resumed.
    tween.resumeSceneTween(runtimeScene, 'MyTween');
    expect(tween.sceneTweenIsPlaying(runtimeScene, 'MyTween')).to.be(false);
    expect(tween.sceneTweenHasFinished(runtimeScene, 'MyTween')).to.be(true);
    expect(camera.getCameraRotation(runtimeScene, '', 0)).to.be(123);

    runtimeScene.renderAndStep(1000 / 60);
    expect(camera.getCameraRotation(runtimeScene, '', 0)).to.be(123);
    expect(tween.sceneTweenIsPlaying(runtimeScene, 'MyTween')).to.be(false);
    expect(tween.sceneTweenHasFinished(runtimeScene, 'MyTween')).to.be(true);

    // Restart the tween
    tween.tweenCameraRotation2(
      runtimeScene,
      'MyTween',
      623,
      '',
      'linear',
      0.25
    );
    for (let i = 0; i < 5; i++) {
      runtimeScene.renderAndStep(1000 / 60);
      expect(tween.sceneTweenIsPlaying(runtimeScene, 'MyTween')).to.be(true);
      expect(tween.sceneTweenHasFinished(runtimeScene, 'MyTween')).to.be(false);
    }
    expect(camera.getCameraRotation(runtimeScene, '', 0)).to.be(373);
  });

  it('can remove and recreate a tween', () => {
    camera.setCameraRotation(runtimeScene, 200, '', 0);

    // Start the tween
    expect(tween.sceneTweenExists(runtimeScene, 'MyTween')).to.be(false);
    tween.tweenCameraRotation2(
      runtimeScene,
      'MyTween',
      600,
      '',
      'linear',
      0.25
    );
    expect(tween.sceneTweenExists(runtimeScene, 'MyTween')).to.be(true);
    for (let i = 0; i < 5; i++) {
      runtimeScene.renderAndStep(1000 / 60);
      expect(tween.sceneTweenIsPlaying(runtimeScene, 'MyTween')).to.be(true);
      expect(tween.sceneTweenHasFinished(runtimeScene, 'MyTween')).to.be(false);
    }
    expect(camera.getCameraRotation(runtimeScene, '', 0)).to.be(400);

    // Remove the tween
    expect(tween.sceneTweenExists(runtimeScene, 'MyTween')).to.be(true);
    tween.removeSceneTween(runtimeScene, 'MyTween');
    expect(tween.sceneTweenExists(runtimeScene, 'MyTween')).to.be(false);
    expect(camera.getCameraRotation(runtimeScene, '', 0)).to.be(400);
    for (let i = 0; i < 5; i++) {
      runtimeScene.renderAndStep(1000 / 60);
      expect(tween.sceneTweenIsPlaying(runtimeScene, 'MyTween')).to.be(false);
      expect(tween.sceneTweenHasFinished(runtimeScene, 'MyTween')).to.be(false);
      expect(camera.getCameraRotation(runtimeScene, '', 0)).to.be(400);
    }

    // The value is not overridden after the tween has been removed.
    camera.setCameraRotation(runtimeScene, 123, '', 0);
    runtimeScene.renderAndStep(1000 / 60);
    expect(camera.getCameraRotation(runtimeScene, '', 0)).to.be(123);

    // A removed tween can't be resumed.
    tween.resumeSceneTween(runtimeScene, 'MyTween');
    expect(tween.sceneTweenIsPlaying(runtimeScene, 'MyTween')).to.be(false);
    expect(tween.sceneTweenHasFinished(runtimeScene, 'MyTween')).to.be(false);
    expect(camera.getCameraRotation(runtimeScene, '', 0)).to.be(123);

    runtimeScene.renderAndStep(1000 / 60);
    expect(camera.getCameraRotation(runtimeScene, '', 0)).to.be(123);
    expect(tween.sceneTweenIsPlaying(runtimeScene, 'MyTween')).to.be(false);
    expect(tween.sceneTweenHasFinished(runtimeScene, 'MyTween')).to.be(false);

    // Recreate the tween
    expect(tween.sceneTweenExists(runtimeScene, 'MyTween')).to.be(false);
    tween.tweenCameraRotation2(
      runtimeScene,
      'MyTween',
      623,
      '',
      'linear',
      0.25
    );
    expect(tween.sceneTweenExists(runtimeScene, 'MyTween')).to.be(true);
    for (let i = 0; i < 5; i++) {
      runtimeScene.renderAndStep(1000 / 60);
      expect(tween.sceneTweenIsPlaying(runtimeScene, 'MyTween')).to.be(true);
      expect(tween.sceneTweenHasFinished(runtimeScene, 'MyTween')).to.be(false);
    }
    expect(camera.getCameraRotation(runtimeScene, '', 0)).to.be(373);
    expect(tween.sceneTweenExists(runtimeScene, 'MyTween')).to.be(true);
  });

  const checkProgress = (steps, getValueFunctions) => {
    if (!Array.isArray(getValueFunctions)) {
      getValueFunctions = [getValueFunctions];
    }
    for (let i = 0; i < steps; i++) {
      const oldValues = getValueFunctions.map((getValue) => getValue());
      runtimeScene.renderAndStep(1000 / 60);

      for (let index = 0; index < oldValues.length; index++) {
        expect(getValueFunctions[index]()).not.to.be(oldValues[index]);
      }
    }
  };

  it('can tween a scene variable', () => {
    const variable = runtimeScene.getVariables().get('MyVariable');
    variable.setNumber(200);
    tween.tweenVariableNumber3(
      runtimeScene,
      'MyTween',
      variable,
      600,
      'linear',
      0.25 / 1.5
    );
    checkProgress(6, () => variable.getAsNumber());
    expect(variable.getAsNumber()).to.be(440);
  });

  it('can tween a layer value', () => {
    tween.addLayerValueTween(
      runtimeScene,
      'MyTween',
      200,
      600,
      'linear',
      0.25,
      false,
      ''
    );
    checkProgress(6, () => tween.getValue(runtimeScene, 'MyTween'));
    expect(tween.getValue(runtimeScene, 'MyTween')).to.be(440);
  });

  it('can tween a layout value', () => {
    tween.addLayoutValueTween(
      runtimeScene,
      'MyTween',
      200,
      600,
      'linear',
      0.25 / 1.5,
      false
    );
    checkProgress(6, () => tween.getValue(runtimeScene, 'MyTween'));
    expect(tween.getValue(runtimeScene, 'MyTween')).to.be(440);
  });

  it('can tween a layer camera position', () => {
    camera.setCameraX(runtimeScene, 200, '', 0);
    camera.setCameraY(runtimeScene, 300, '', 0);
    tween.tweenCamera2(runtimeScene, 'MyTween', 600, 900, '', 'linear', 0.25);
    checkProgress(6, [
      () => camera.getCameraX(runtimeScene, '', 0),
      () => camera.getCameraY(runtimeScene, '', 0),
    ]);
    expect(camera.getCameraX(runtimeScene, '', 0)).to.be(440);
    expect(camera.getCameraY(runtimeScene, '', 0)).to.be(660);
  });

  it('can tween a layer camera zoom', () => {
    camera.setCameraZoom(runtimeScene, 200, '', 0);
    tween.tweenCameraZoom2(runtimeScene, 'MyTween', 600, '', 'linear', 0.25);
    checkProgress(6, () => camera.getCameraZoom(runtimeScene, '', 0));
    // The interpolation is exponential.
    expect(camera.getCameraZoom(runtimeScene, '', 0)).to.be(386.6364089863524);
  });

  it('can tween a layer camera zoom to 0', () => {
    camera.setCameraZoom(runtimeScene, 1, '', 0);
    tween.tweenCameraZoom2(runtimeScene, 'MyTween', 0, '', 'linear', 0.25);
    // A camera zoom of 0 doesn't make sense.
    // Check that there is no NaN.
    for (let i = 0; i < 11; i++) {
      runtimeScene.renderAndStep(1000 / 60);
      expect(camera.getCameraZoom(runtimeScene, '', 0)).to.be(0);
    }
  });

  it('can tween a layer camera zoom from 0', () => {
    camera.setCameraZoom(runtimeScene, 0, '', 0);
    tween.tweenCameraZoom2(runtimeScene, 'MyTween', 1, '', 'linear', 0.25);
    // A camera zoom of 0 doesn't make sense.
    // Check that there is no NaN.
    for (let i = 0; i < 11; i++) {
      expect(camera.getCameraZoom(runtimeScene, '', 0)).to.be(0);
      runtimeScene.renderAndStep(1000 / 60);
    }
    expect(camera.getCameraZoom(runtimeScene, '', 0)).to.be(1);
  });

  it('can tween a layer camera rotation', () => {
    camera.setCameraRotation(runtimeScene, 200, '', 0);
    tween.tweenCameraRotation2(
      runtimeScene,
      'MyTween',
      600,
      '',
      'linear',
      0.25
    );
    checkProgress(6, () => camera.getCameraRotation(runtimeScene, '', 0));
    expect(camera.getCameraRotation(runtimeScene, '', 0)).to.be(440);
  });

  it('can tween a number effect property', () => {
    const layer = runtimeScene.getLayer('');
    layer.addEffect({
      effectType: 'Outline',
      name: 'MyEffect',
      doubleParameters: { padding: 0, thickness: 200 },
      stringParameters: { color: '16;32;64' },
      booleanParameters: {},
    });
    tween.tweenNumberEffectPropertyTween(
      runtimeScene,
      'MyTween',
      600,
      '',
      'MyEffect',
      'thickness',
      'linear',
      0.25
    );
    checkProgress(6, () =>
      layer.getRendererEffects()['MyEffect'].getDoubleParameter('thickness')
    );
    expect(
      layer.getRendererEffects()['MyEffect'].getDoubleParameter('thickness')
    ).to.be(440);
  });

  it('can tween a color effect property', () => {
    const layer = runtimeScene.getLayer('');
    layer.addEffect({
      effectType: 'Outline',
      name: 'MyEffect',
      doubleParameters: { padding: 0, thickness: 200 },
      stringParameters: { color: '16;32;64' },
      booleanParameters: {},
    });
    tween.tweenColorEffectPropertyTween(
      runtimeScene,
      'MyTween',
      '255;192;128',
      '',
      'MyEffect',
      'color',
      'linear',
      0.25
    );
    checkProgress(6, () =>
      layer.getRendererEffects()['MyEffect'].getColorParameter('color')
    );
    expect(
      layer.getRendererEffects()['MyEffect'].getColorParameter('color')
    ).to.be(gdjs.rgbOrHexStringToNumber('76;235;27'));
  });
});
