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

  it('can tween a scene variable', () => {
    const variable = layout.getVariables().get('MyVariable');
    variable.setNumber(200);
    tween.tweenVariableNumber2(
      layout,
      'MyTween',
      variable,
      600,
      250 / 1.5,
      'linear'
    );
    checkProgress(6, () => variable.getAsNumber());
    expect(variable.getAsNumber()).to.be(440);
  });

  it('can tween a scene variable (older action)', () => {
    const variable = layout.getVariables().get('MyVariable');
    variable.setNumber(200);
    tween.tweenVariableNumber(
      layout,
      'MyTween',
      variable,
      200,
      600,
      250 / 1.5,
      'linear'
    );
    checkProgress(6, () => variable.getAsNumber());
    expect(variable.getAsNumber()).to.be(440);
  });

  it('can tween a layer camera position', () => {
    camera.setCameraX(layout, 200, '', 0);
    camera.setCameraY(layout, 300, '', 0);
    tween.tweenCamera(layout, 'MyTween', 600, 900, '', 250 / 1.5, 'linear');
    checkProgress(6, [
      () => camera.getCameraX(layout, '', 0),
      () => camera.getCameraY(layout, '', 0),
    ]);
    expect(camera.getCameraX(layout, '', 0)).to.be(440);
    expect(camera.getCameraY(layout, '', 0)).to.be(660);
  });

  it('can tween a layer camera zoom', () => {
    camera.setCameraZoom(layout, 200, '', 0);
    tween.tweenCameraZoom(layout, 'MyTween', 600, '', 250 / 1.5, 'linear');
    checkProgress(6, () => camera.getCameraZoom(layout, '', 0));
    // The interpolation was not exponential.
    expect(camera.getCameraZoom(layout, '', 0)).to.be(440);
  });

  it('can tween a layer camera rotation', () => {
    camera.setCameraRotation(layout, 200, '', 0);
    tween.tweenCameraRotation(layout, 'MyTween', 600, '', 250 / 1.5, 'linear');
    checkProgress(6, () => camera.getCameraRotation(layout, '', 0));
    expect(camera.getCameraRotation(layout, '', 0)).to.be(440);
  });
});
