// @ts-check
describe.only('gdjs.TweenRuntimeBehavior', () => {
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
    runtimeScene.addObject(object);
    return object;
  };

  /**
   * @param {gdjs.RuntimeScene} runtimeScene
   * @returns {gdjs.TestRuntimeObject}
   */
  const addSprite = (runtimeScene) => {
    const object = new gdjs.SpriteRuntimeObject(runtimeScene, {
      name: 'Object',
      type: 'Sprite',
      effects: [],
      behaviors: [
        {
          type: 'Tween::TweenBehavior',
          name: behaviorName,
        },
      ],
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ type: string; name: string; behaviors: nev... Remove this comment to see the full error message
      animations: [],
    });
    runtimeScene.addObject(object);
    return object;
  };

  /** @type {gdjs.RuntimeScene} */
  let runtimeScene;
  /** @type {gdjs.RuntimeObject} */
  let object;
  /** @type {gdjs.SpriteRuntimeObject} */
  let sprite;
  /** @type {gdjs.TweenRuntimeBehavior} */
  let behavior;
  /** @type {gdjs.TweenRuntimeBehavior} */
  let spriteBehavior;
  beforeEach(() => {
    runtimeScene = createScene();
    runtimeScene.getLayer('').setTimeScale(1.5);
    object = addObject(runtimeScene);
    sprite = addSprite(runtimeScene);
    //@ts-ignore
    behavior = object.getBehavior(behaviorName);
    //@ts-ignore
    spriteBehavior = sprite.getBehavior(behaviorName);
  });

  it('can play a tween till the end', () => {
    object.setPosition(200, 300);

    behavior.addObjectPositionXTween2('MyTween', 600, 'linear', 0.25, false);

    // Tween actions don't change the value directly.
    expect(object.getX()).to.be(200);
    expect(behavior.getValue('MyTween')).to.be(200);
    expect(behavior.getProgress('MyTween')).to.be(0);

    let oldX;
    let oldValue;
    let oldProgress;
    for (let i = 0; i < 10; i++) {
      oldX = object.getX();
      oldValue = behavior.getValue('MyTween');
      oldProgress = behavior.getProgress('MyTween');

      runtimeScene.renderAndStep(1000 / 60);
      expect(behavior.isPlaying('MyTween')).to.be(true);
      expect(behavior.hasFinished('MyTween')).to.be(false);
      expect(object.getX()).to.be.above(oldX);
      expect(behavior.getValue('MyTween')).to.be.above(oldValue);
      expect(behavior.getProgress('MyTween')).to.be.above(oldProgress);
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

  it('can pause and resume a tween', () => {
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
      expect(object.getX()).to.be(400);
    }

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

  it('can stop and restart a tween', () => {
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
      expect(object.getX()).to.be(400);
    }

    // The value is not overridden by a stopped tween.
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

  it('can remove and recreate a tween', () => {
    object.setPosition(200, 300);

    // Start the tween
    expect(behavior.exists('MyTween')).to.be(false);
    behavior.addObjectPositionXTween2('MyTween', 600, 'linear', 0.25, false);
    expect(behavior.exists('MyTween')).to.be(true);
    for (let i = 0; i < 5; i++) {
      runtimeScene.renderAndStep(1000 / 60);
      expect(behavior.isPlaying('MyTween')).to.be(true);
      expect(behavior.hasFinished('MyTween')).to.be(false);
    }
    expect(object.getX()).to.be(400);

    // Remove the tween
    expect(behavior.exists('MyTween')).to.be(true);
    behavior.removeTween('MyTween');
    expect(behavior.exists('MyTween')).to.be(false);
    expect(object.getX()).to.be(400);
    for (let i = 0; i < 5; i++) {
      runtimeScene.renderAndStep(1000 / 60);
      expect(behavior.isPlaying('MyTween')).to.be(false);
      expect(behavior.hasFinished('MyTween')).to.be(false);
      expect(object.getX()).to.be(400);
    }

    // The value is not overridden after the tween has been removed.
    object.setX(123);
    runtimeScene.renderAndStep(1000 / 60);
    expect(object.getX()).to.be(123);

    // A removed tween can't be resumed.
    behavior.resumeTween('MyTween');
    expect(behavior.isPlaying('MyTween')).to.be(false);
    expect(behavior.hasFinished('MyTween')).to.be(false);
    expect(object.getX()).to.be(123);

    runtimeScene.renderAndStep(1000 / 60);
    expect(object.getX()).to.be(123);
    expect(behavior.isPlaying('MyTween')).to.be(false);
    expect(behavior.hasFinished('MyTween')).to.be(false);

    // Recreate the tween
    expect(behavior.exists('MyTween')).to.be(false);
    behavior.addObjectPositionXTween2('MyTween', 623, 'linear', 0.25, false);
    expect(behavior.exists('MyTween')).to.be(true);
    for (let i = 0; i < 5; i++) {
      runtimeScene.renderAndStep(1000 / 60);
      expect(behavior.isPlaying('MyTween')).to.be(true);
      expect(behavior.hasFinished('MyTween')).to.be(false);
    }
    expect(object.getX()).to.be(373);
    expect(behavior.exists('MyTween')).to.be(true);
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
    behavior.addObjectPositionXTween2('MyTween', 600, 'linear', 0.25, false);
    checkProgress(6, () => object.getX());
    expect(object.getX()).to.be(440);
  });

  it('can tween the position on Y axis', () => {
    object.setY(200);
    behavior.addObjectPositionYTween2('MyTween', 600, 'linear', 0.25, false);
    checkProgress(6, () => object.getY());
    expect(object.getY()).to.be(440);
  });

  it('can tween the angle', () => {
    object.setAngle(200);
    behavior.addObjectAngleTween2('MyTween', 600, 'linear', 0.25, false);
    checkProgress(6, () => object.getAngle());
    expect(object.getAngle()).to.be(440);
  });

  it('can tween the width', () => {
    object.setWidth(200);
    behavior.addObjectWidthTween2('MyTween', 600, 'linear', 0.25, false);
    checkProgress(6, () => object.getWidth());
    expect(object.getWidth()).to.be(440);
  });

  it('can tween the height', () => {
    object.setHeight(200);
    behavior.addObjectHeightTween2('MyTween', 600, 'linear', 0.25, false);
    checkProgress(6, () => object.getHeight());
    expect(object.getHeight()).to.be(440);
  });

  it('can tween the opacity', () => {
    sprite.setOpacity(128);
    spriteBehavior.addObjectOpacityTween2(
      'MyTween',
      255,
      'linear',
      0.25,
      false
    );
    checkProgress(6, () => sprite.getOpacity());
    expect(sprite.getOpacity()).to.be(204.2);
  });

  it('can tween the scale on X axis', () => {
    sprite.setScaleX(200);
    spriteBehavior.addObjectScaleXTween2('MyTween', 600, 'linear', 0.25, false);
    checkProgress(6, () => sprite.getScaleX());
    expect(sprite.getScaleX()).to.be(386.6364089863524);
  });

  it('can tween the scale on Y axis', () => {
    sprite.setScaleY(200);
    spriteBehavior.addObjectScaleYTween2('MyTween', 600, 'linear', 0.25, false);
    checkProgress(6, () => sprite.getScaleY());
    expect(sprite.getScaleY()).to.be(386.6364089863524);
  });
});
