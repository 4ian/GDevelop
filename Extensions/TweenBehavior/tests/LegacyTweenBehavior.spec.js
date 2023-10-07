// @ts-check
describe('gdjs.TweenRuntimeBehavior', () => {
  const behaviorName = 'Tween';

  const createScene = (timeDelta = 1000 / 60) => {
    const runtimeGame = gdjs.getPixiRuntimeGame();
    const runtimeScene = new gdjs.TestRuntimeScene(runtimeGame);
    runtimeScene._timeManager.getElapsedTime = () => {
      return timeDelta;
    };
    return runtimeScene;
  };

  /**
   * @param {gdjs.RuntimeScene} runtimeScene
   * @returns {gdjs.TestRuntimeObject}
   */
  const addObject = (runtimeScene) => {
    const object = new gdjs.TestRuntimeObject(runtimeScene, {
      name: 'Object',
      type: '',
      effects: [],
      behaviors: [
        {
          type: 'Tween::TweenBehavior',
          name: behaviorName,
        },
      ],
    });
    object.setCustomWidthAndHeight(100, 100);
    runtimeScene.addObject(object);
    return object;
  };

  /** @type {gdjs.RuntimeScene} */
  let runtimeScene;
  /** @type {gdjs.RuntimeObject} */
  let object;
  /** @type {gdjs.TweenRuntimeBehavior} */
  let behavior;
  beforeEach(() => {
    runtimeScene = createScene();
    // Layers time scale is not taken into account by legacy actions.
    // The duration is divided to get the same result as new actions
    // for convenience.
    runtimeScene.getLayer('').setTimeScale(1.5);
    object = addObject(runtimeScene);
    //@ts-ignore
    behavior = object.getBehavior(behaviorName);
  });

  const checkProgress = (steps, getValue) => {
    let oldValue;
    for (let i = 0; i < steps; i++) {
      oldValue = getValue();
      runtimeScene.renderAndStep(1000 / 60);
      expect(getValue()).to.be.above(oldValue);
    }
  };

  it('can tween the position on X axis', () => {
    object.setX(200);
    behavior.addObjectPositionXTween(
      'MyTween',
      600,
      'linear',
      250 / 1.5,
      false
    );
    checkProgress(6, () => object.getX());
    expect(object.getX()).to.be(440);
  });
});
