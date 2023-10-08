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
      variables: [],
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
   */
  const addSprite = (runtimeScene) => {
    const object = new gdjs.SpriteRuntimeObject(runtimeScene, {
      name: 'Sprite',
      type: 'Sprite',
      effects: [],
      variables: [],
      behaviors: [
        {
          type: 'Tween::TweenBehavior',
          name: behaviorName,
        },
      ],
      animations: [
        {
          name: 'animation',
          directions: [
            {
              sprites: [
                {
                  originPoint: { name: 'Center', x: 0, y: 0 },
                  centerPoint: {
                    name: 'Origin',
                    automatic: false,
                    x: 32,
                    y: 32,
                  },
                  points: [
                    { name: 'Center', x: 0, y: 0 },
                    { name: 'Origin', x: 32, y: 32 },
                  ],
                  hasCustomCollisionMask: false,
                  customCollisionMask: [],
                  image: '',
                },
              ],
              timeBetweenFrames: 0,
              looping: false,
            },
          ],
          useMultipleDirections: false,
        },
      ],
      updateIfNotVisible: true,
    });
    object.getWidth = () => 64;
    object.getHeight = () => 64;
    runtimeScene.addObject(object);
    return object;
  };

  /**
   * @param {gdjs.RuntimeScene} runtimeScene
   */
  const addTextObject = (runtimeScene) => {
    const object = new gdjs.TextRuntimeObject(runtimeScene, {
      name: 'Text',
      type: 'TextObject::Text',
      effects: [],
      variables: [],
      behaviors: [
        {
          type: 'Tween::TweenBehavior',
          name: behaviorName,
        },
      ],
      characterSize: 20,
      font: '',
      bold: false,
      italic: false,
      underlined: false,
      color: {
        r: 0,
        g: 0,
        b: 0,
      },
      string: '',
      textAlignment: 'left',
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
  /** @type {gdjs.TextRuntimeObject} */
  let textObject;
  /** @type {gdjs.TweenRuntimeBehavior} */
  let behavior;
  /** @type {gdjs.TweenRuntimeBehavior} */
  let spriteBehavior;
  /** @type {gdjs.TweenRuntimeBehavior} */
  let textObjectBehavior;
  beforeEach(() => {
    runtimeScene = createScene();
    runtimeScene.getLayer('').setTimeScale(1.5);
    object = addObject(runtimeScene);
    sprite = addSprite(runtimeScene);
    textObject = addTextObject(runtimeScene);
    //@ts-ignore
    behavior = object.getBehavior(behaviorName);
    //@ts-ignore
    spriteBehavior = sprite.getBehavior(behaviorName);
    //@ts-ignore
    textObjectBehavior = textObject.getBehavior(behaviorName);
  });

  it("can get default values for tweens that don't exist", () => {
    expect(behavior.exists('MyTween')).to.be(false);
    expect(behavior.getValue('MyTween')).to.be(0);
    expect(behavior.getProgress('MyTween')).to.be(0);
    expect(behavior.isPlaying('MyTween')).to.be(false);
    expect(behavior.hasFinished('MyTween')).to.be(false);
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
    expect(runtimeScene.getInstancesCountOnScene('Object')).to.be(1);

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

  it('can remove the object at the end', () => {
    object.setPosition(200, 300);

    behavior.addObjectPositionXTween2('MyTween', 600, 'linear', 0.25, true);

    for (let i = 0; i < 9; i++) {
      runtimeScene.renderAndStep(1000 / 60);
    }
    // The tween is near the end.
    runtimeScene.renderAndStep(1000 / 60);
    expect(behavior.isPlaying('MyTween')).to.be(true);
    expect(behavior.hasFinished('MyTween')).to.be(false);
    expect(object.getX()).to.be(600);

    expect(runtimeScene.getInstancesCountOnScene('Object')).to.be(1);
    runtimeScene.renderAndStep(1000 / 60);
    expect(runtimeScene.getInstancesCountOnScene('Object')).to.be(0);
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

  it('can tween an object value', () => {
    behavior.addValueTween('MyTween', 200, 600, 'linear', 0.25, false, false);
    checkProgress(6, () => behavior.getValue('MyTween'));
    expect(behavior.getValue('MyTween')).to.be(440);
  });

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

  it('can tween the color', () => {
    sprite.setColor('16;32;64');
    spriteBehavior.addObjectColorTween2(
      'MyTween',
      '255;192;128',
      'linear',
      0.25,
      false,
      true
    );
    checkProgress(6, () => sprite.getColor());
    // Colors are rounded by the tween.
    expect(sprite.getColor()).to.be('76;235;27');
  });

  it('can tween the color to HSL', () => {
    sprite.setColor('16;32;64');
    spriteBehavior.addObjectColorHSLTween2(
      'MyTween',
      180,
      true,
      25,
      50,
      'linear',
      0.25,
      false
    );
    checkProgress(6, () => sprite.getColor());
    // Colors are rounded by the tween.
    expect(sprite.getColor()).to.be('57;110;129');
  });

  it('can tween the scale on X axis', () => {
    sprite.setPosition(100, 400);
    sprite.setScaleX(200);
    spriteBehavior.addObjectScaleXTween2(
      'MyTween',
      600,
      'linear',
      0.25,
      false,
      false
    );
    checkProgress(6, () => sprite.getScaleX());
    // The interpolation is exponential.
    expect(sprite.getScaleX()).to.be(386.6364089863524);
    expect(sprite.getX()).to.be(100);
    expect(sprite.getY()).to.be(400);
  });

  it('can tween the scale on X axis from center', () => {
    sprite.setPosition(100, 400);
    sprite.setScaleX(200);
    spriteBehavior.addObjectScaleXTween2(
      'MyTween',
      600,
      'linear',
      0.25,
      false,
      true
    );
    checkProgress(6, () => sprite.getScaleX());
    // The interpolation is exponential.
    expect(sprite.getScaleX()).to.be(386.6364089863524);
    expect(sprite.getX()).to.be(-5872.3650875632775);
    expect(sprite.getY()).to.be(400);
  });

  it('can tween the scale on Y axis', () => {
    sprite.setPosition(100, 400);
    sprite.setScaleY(200);
    spriteBehavior.addObjectScaleYTween2(
      'MyTween',
      600,
      'linear',
      0.25,
      false,
      false
    );
    checkProgress(6, () => sprite.getScaleY());
    // The interpolation is exponential.
    expect(sprite.getScaleY()).to.be(386.6364089863524);
    expect(sprite.getX()).to.be(100);
    expect(sprite.getY()).to.be(400);
  });

  it('can tween the scale on Y axis from center', () => {
    sprite.setPosition(100, 400);
    sprite.setScaleY(200);
    spriteBehavior.addObjectScaleYTween2(
      'MyTween',
      600,
      'linear',
      0.25,
      false,
      true
    );
    checkProgress(6, () => sprite.getScaleY());
    // The interpolation is exponential.
    expect(sprite.getScaleY()).to.be(386.6364089863524);
    expect(sprite.getX()).to.be(100);
    expect(sprite.getY()).to.be(-5572.3650875632775);
  });

  it('can tween the font size', () => {
    textObject.setCharacterSize(200);
    textObjectBehavior.addTextObjectCharacterSizeTween2(
      'MyTween',
      600,
      'linear',
      0.25,
      false
    );
    checkProgress(6, () => textObject.getCharacterSize());
    // The interpolation is exponential.
    expect(textObject.getCharacterSize()).to.be(386.6364089863524);
  });

  it('can tween the position', () => {
    object.setPosition(200, 300);
    behavior.addObjectPositionTween2(
      'MyTween',
      600,
      900,
      'linear',
      0.25,
      false
    );
    checkProgress(6, [() => object.getX(), () => object.getY()]);
    expect(object.getX()).to.be(440);
    expect(object.getY()).to.be(660);
  });

  it('can tween the scales', () => {
    sprite.setPosition(100, 400);
    sprite.setScaleX(200);
    sprite.setScaleY(300);
    spriteBehavior.addObjectScaleTween2(
      'MyTween',
      600,
      900,
      'linear',
      0.25,
      false,
      false
    );
    checkProgress(6, [() => sprite.getScaleX(), () => sprite.getScaleY()]);
    // The interpolation is exponential.
    expect(sprite.getScaleX()).to.be(386.6364089863524);
    expect(sprite.getScaleY()).to.be(579.9546134795287);
    expect(sprite.getX()).to.be(100);
    expect(sprite.getY()).to.be(400);
  });

  it('can tween the scales from center', () => {
    sprite.setPosition(100, 400);
    sprite.setScaleX(200);
    sprite.setScaleY(300);
    spriteBehavior.addObjectScaleTween2(
      'MyTween',
      600,
      900,
      'linear',
      0.25,
      false,
      true
    );
    checkProgress(6, [() => sprite.getScaleX(), () => sprite.getScaleY()]);
    // The interpolation is exponential.
    expect(sprite.getScaleX()).to.be(386.6364089863524);
    expect(sprite.getScaleY()).to.be(579.9546134795287);
    expect(sprite.getX()).to.be(-5872.3650875632775);
    expect(sprite.getY()).to.be(-8558.547631344918);
  });
});
