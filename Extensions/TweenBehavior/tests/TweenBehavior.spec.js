// @ts-check
describe('gdjs.TweenRuntimeBehavior', function () {
  const behaviorName = 'Tween';

  const createScene = (timeDelta = 1000 / 60) => {
    const runtimeGame = gdjs.getPixiRuntimeGame();
    const runtimeScene = new gdjs.TestRuntimeScene(runtimeGame);
    runtimeScene._timeManager.getElapsedTime = function () {
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

  let runtimeScene;
  let object;
  /** @type {gdjs.TweenRuntimeBehavior} */
  let behavior;
  beforeEach(function () {
    runtimeScene = createScene();
    runtimeScene.getLayer('').setTimeScale(1.5);
    object = addObject(runtimeScene);
    //@ts-ignore
    behavior = object.getBehavior(behaviorName);
  });

  it('can play a tween till the end', function () {
    object.setPosition(200, 300);
    behavior.addObjectPositionXTween2('MyTween', 600, 'linear', 0.25, false);

    // Tween actions don't change the value directly.
    expect(object.getX()).to.be(200);
    expect(behavior.getValue('MyTween')).to.be(200);
    expect(behavior.getProgress('MyTween')).to.be(0);

    for (let i = 0; i < 10; i++) {
      runtimeScene.renderAndStep(1000 / 60);
      expect(behavior.isPlaying('MyTween')).to.be(true);
      expect(behavior.hasFinished('MyTween')).to.be(false);
    }
    // The tween reaches the end
    runtimeScene.renderAndStep(1000 / 60);
    expect(behavior.isPlaying('MyTween')).to.be(false);
    expect(behavior.hasFinished('MyTween')).to.be(true);
    expect(object.getX()).to.be(600);
    expect(behavior.getValue('MyTween')).to.be(600);
    expect(behavior.getProgress('MyTween')).to.be(1);

    // The value is not changed after the tween is finished
    runtimeScene.renderAndStep(1000 / 60);
    expect(behavior.isPlaying('MyTween')).to.be(false);
    expect(behavior.hasFinished('MyTween')).to.be(true);
    expect(object.getX()).to.be(600);
    expect(behavior.getValue('MyTween')).to.be(600);
    expect(behavior.getProgress('MyTween')).to.be(1);

    // The value is not set to the targeted value over and over
    // after the tween is finished.
    object.setX(123);
    runtimeScene.renderAndStep(1000 / 60);
    expect(object.getX()).to.be(123);
  });

  it('can pause and resume a tween', function () {
    object.setPosition(200, 300);
    behavior.addObjectPositionXTween2('MyTween', 600, 'linear', 0.25, false);

    // The tween starts
    for (let i = 0; i < 5; i++) {
      runtimeScene.renderAndStep(1000 / 60);
      expect(behavior.isPlaying('MyTween')).to.be(true);
      expect(behavior.hasFinished('MyTween')).to.be(false);
    }
    expect(object.getX()).to.be(400);

    // Pause the tween
    behavior.pauseTween('MyTween');
    expect(object.getX()).to.be(400);
    for (let i = 0; i < 5; i++) {
      runtimeScene.renderAndStep(1000 / 60);
      expect(behavior.isPlaying('MyTween')).to.be(false);
      expect(behavior.hasFinished('MyTween')).to.be(false);
    }
    expect(object.getX()).to.be(400);

    // The value is not overridden during the pause.
    object.setX(123);
    runtimeScene.renderAndStep(1000 / 60);
    expect(object.getX()).to.be(123);

    // Resume the tween
    behavior.resumeTween('MyTween');

    // Tween actions don't change the value directly.
    expect(object.getX()).to.be(123);
    expect(behavior.isPlaying('MyTween')).to.be(true);
    expect(behavior.hasFinished('MyTween')).to.be(false);
    runtimeScene.renderAndStep(1000 / 60);
    expect(object.getX()).to.be(440);
  });

  it('can stop and restart a tween', function () {
    object.setPosition(200, 300);

    // Start the tween
    behavior.addObjectPositionXTween2('MyTween', 600, 'linear', 0.25, false);
    for (let i = 0; i < 5; i++) {
      runtimeScene.renderAndStep(1000 / 60);
      expect(behavior.isPlaying('MyTween')).to.be(true);
      expect(behavior.hasFinished('MyTween')).to.be(false);
    }
    expect(object.getX()).to.be(400);

    // Stop the tween
    behavior.stopTween('MyTween', false);
    expect(object.getX()).to.be(400);
    for (let i = 0; i < 5; i++) {
      runtimeScene.renderAndStep(1000 / 60);
      expect(behavior.isPlaying('MyTween')).to.be(false);
      expect(behavior.hasFinished('MyTween')).to.be(true);
    }
    expect(object.getX()).to.be(400);

    // The value is not overridden during the pause.
    object.setX(123);
    runtimeScene.renderAndStep(1000 / 60);
    expect(object.getX()).to.be(123);

    // A stopped tween can't be resumed.
    behavior.resumeTween('MyTween');
    expect(behavior.isPlaying('MyTween')).to.be(false);
    expect(behavior.hasFinished('MyTween')).to.be(true);
    expect(object.getX()).to.be(123);

    runtimeScene.renderAndStep(1000 / 60);
    expect(object.getX()).to.be(123);
    expect(behavior.isPlaying('MyTween')).to.be(false);
    expect(behavior.hasFinished('MyTween')).to.be(true);

    // Restart the tween
    behavior.addObjectPositionXTween2('MyTween', 623, 'linear', 0.25, false);
    for (let i = 0; i < 5; i++) {
      runtimeScene.renderAndStep(1000 / 60);
      expect(behavior.isPlaying('MyTween')).to.be(true);
      expect(behavior.hasFinished('MyTween')).to.be(false);
    }
    expect(object.getX()).to.be(373);
  });

  it('can tween the position on X axis', function () {
    object.setPosition(200, 300);
    behavior.addObjectPositionXTween2('MyTween', 600, 'linear', 0.25, false);

    let oldX;
    for (let i = 0; i < 6; i++) {
      oldX = object.getX();
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getX()).to.be.above(oldX);
    }
    expect(object.getX()).to.be(440);
  });
});
