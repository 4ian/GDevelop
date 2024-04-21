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
  const addCube = (runtimeScene) => {
    const object = new gdjs.Cube3DRuntimeObject(runtimeScene, {
      name: 'Cube',
      type: 'Scene3D::Cube3DObject',
      effects: [],
      variables: [],
      behaviors: [
        {
          type: 'Tween::TweenBehavior',
          name: behaviorName,
        },
      ],
      // @ts-ignore
      content: {
        width: 64,
        height: 64,
        depth: 64,
      },
    });
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
      content: {
        characterSize: 20,
        font: '',
        bold: false,
        italic: false,
        underlined: false,
        color: '0;0;0',
        text: '',
        textAlignment: 'left',
        isOutlineEnabled: false,
        outlineThickness: 2,
        outlineColor: '255;255;255',
        isShadowEnabled: false,
        shadowColor: '0;0;0',
        shadowOpacity: 128,
        shadowDistance: 4,
        shadowAngle: 90,
        shadowBlurRadius: 2,
      },
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
  /** @type {gdjs.Cube3DRuntimeObject} */
  let cube;
  /** @type {gdjs.TextRuntimeObject} */
  let textObject;
  /** @type {gdjs.TweenRuntimeBehavior} */
  let behavior;
  /** @type {gdjs.TweenRuntimeBehavior} */
  let spriteBehavior;
  /** @type {gdjs.TweenRuntimeBehavior} */
  let cubeBehavior;
  /** @type {gdjs.TweenRuntimeBehavior} */
  let textObjectBehavior;
  beforeEach(() => {
    runtimeScene = createScene();
    runtimeScene.getLayer('').setTimeScale(1.5);
    object = addObject(runtimeScene);
    sprite = addSprite(runtimeScene);
    cube = addCube(runtimeScene);
    textObject = addTextObject(runtimeScene);
    //@ts-ignore
    behavior = object.getBehavior(behaviorName);
    //@ts-ignore
    spriteBehavior = sprite.getBehavior(behaviorName);
    //@ts-ignore
    cubeBehavior = cube.getBehavior(behaviorName);
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

  it('can tween an object variable', () => {
    const variable = object.getVariables().get('MyVariable');
    variable.setNumber(200);
    behavior.addVariableTween3('MyTween', variable, 600, 'linear', 0.25, false);
    checkProgress(6, () => variable.getAsNumber());
    expect(variable.getAsNumber()).to.be(440);
  });

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

  it('can tween the position on Z axis', () => {
    cube.setZ(200);
    cubeBehavior.addObjectPositionZTween2(
      null,
      'MyTween',
      600,
      'linear',
      0.25,
      false
    );
    checkProgress(6, () => cube.getZ());
    expect(cube.getZ()).to.be(440);
  });

  it('can tween the angle', () => {
    object.setAngle(200);
    behavior.addObjectAngleTween2('MyTween', 600, 'linear', 0.25, false);
    checkProgress(6, () => object.getAngle());
    expect(object.getAngle()).to.be(440);
  });

  it('can tween the rotation X', () => {
    cube.setRotationX(200);
    cubeBehavior.addObjectRotationXTween(
      null,
      'MyTween',
      600,
      'linear',
      0.25,
      false
    );
    checkProgress(6, () => cube.getRotationX());
    expect(cube.getRotationX()).to.be(440);
  });

  it('can tween the rotation Y', () => {
    cube.setRotationY(200);
    cubeBehavior.addObjectRotationYTween(
      null,
      'MyTween',
      600,
      'linear',
      0.25,
      false
    );
    checkProgress(6, () => cube.getRotationY());
    expect(cube.getRotationY()).to.be(440);
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

  it('can tween the depth', () => {
    cube.setDepth(200);
    cubeBehavior.addObjectDepthTween2(
      null,
      'MyTween',
      600,
      'linear',
      0.25,
      false
    );
    checkProgress(6, () => cube.getDepth());
    expect(cube.getDepth()).to.be(440);
  });

  it('can tween a number effect property', () => {
    sprite.addEffect({
      effectType: 'Outline',
      name: 'MyEffect',
      doubleParameters: { padding: 0, thickness: 200 },
      stringParameters: { color: '16;32;64' },
      booleanParameters: {},
    });
    spriteBehavior.addNumberEffectPropertyTween(
      null,
      'MyTween',
      600,
      'MyEffect',
      'thickness',
      'linear',
      0.25,
      false
    );
    checkProgress(6, () =>
      sprite.getRendererEffects()['MyEffect'].getDoubleParameter('thickness')
    );
    expect(
      sprite.getRendererEffects()['MyEffect'].getDoubleParameter('thickness')
    ).to.be(440);
  });

  it('can tween a color effect property', () => {
    sprite.addEffect({
      effectType: 'Outline',
      name: 'MyEffect',
      doubleParameters: { padding: 0, thickness: 200 },
      stringParameters: { color: '16;32;64' },
      booleanParameters: {},
    });
    spriteBehavior.addColorEffectPropertyTween(
      null,
      'MyTween',
      '255;192;128',
      'MyEffect',
      'color',
      'linear',
      0.25,
      false
    );
    checkProgress(6, () =>
      sprite.getRendererEffects()['MyEffect'].getColorParameter('color')
    );
    expect(
      sprite.getRendererEffects()['MyEffect'].getColorParameter('color')
    ).to.be(gdjs.rgbOrHexStringToNumber('76;235;27'));
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

  it('can tween the scale on X axis to 0', () => {
    sprite.setPosition(100, 400);
    sprite.setScaleX(1);
    spriteBehavior.addObjectScaleTween3(
      'MyTween',
      0,
      'linear',
      0.25,
      false,
      false
    );
    // The interpolation is exponential.
    // It would need an infinite speed to go away from 0.
    // This is why the scale is set to 0 directly.
    for (let i = 0; i < 11; i++) {
      runtimeScene.renderAndStep(1000 / 60);
      expect(sprite.getScaleX()).to.be(0);
    }
    expect(spriteBehavior.hasFinished('MyTween')).to.be(true);
    expect(sprite.getX()).to.be(100);
    expect(sprite.getY()).to.be(400);
  });

  it('can tween the scale on X axis from 0', () => {
    sprite.setPosition(100, 400);
    sprite.setScaleX(0);
    spriteBehavior.addObjectScaleTween3(
      'MyTween',
      1,
      'linear',
      0.25,
      false,
      false
    );
    // The interpolation is exponential.
    // It would need an infinite speed to go away from 0.
    // This is why the scale is set to 1 directly at the end.
    for (let i = 0; i < 11; i++) {
      expect(sprite.getScale()).to.be(0);
      runtimeScene.renderAndStep(1000 / 60);
    }
    expect(spriteBehavior.hasFinished('MyTween')).to.be(true);
    expect(sprite.getScaleX()).to.be(1);
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

  it('can tween the scale on Y axis to 0', () => {
    sprite.setPosition(100, 400);
    sprite.setScaleY(1);
    spriteBehavior.addObjectScaleTween3(
      'MyTween',
      0,
      'linear',
      0.25,
      false,
      false
    );
    // The interpolation is exponential.
    // It would need an infinite speed to go away from 0.
    // This is why the scale is set to 0 directly.
    for (let i = 0; i < 11; i++) {
      runtimeScene.renderAndStep(1000 / 60);
      expect(sprite.getScaleY()).to.be(0);
    }
    expect(spriteBehavior.hasFinished('MyTween')).to.be(true);
    expect(sprite.getX()).to.be(100);
    expect(sprite.getY()).to.be(400);
  });

  it('can tween the scale on Y axis from 0', () => {
    sprite.setPosition(100, 400);
    sprite.setScaleY(0);
    spriteBehavior.addObjectScaleTween3(
      'MyTween',
      1,
      'linear',
      0.25,
      false,
      false
    );
    // The interpolation is exponential.
    // It would need an infinite speed to go away from 0.
    // This is why the scale is set to 1 directly at the end.
    for (let i = 0; i < 11; i++) {
      expect(sprite.getScale()).to.be(0);
      runtimeScene.renderAndStep(1000 / 60);
    }
    expect(spriteBehavior.hasFinished('MyTween')).to.be(true);
    expect(sprite.getScaleY()).to.be(1);
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

  it('can tween the scale', () => {
    sprite.setPosition(100, 400);
    sprite.setScale(200);
    spriteBehavior.addObjectScaleTween3(
      'MyTween',
      600,
      'linear',
      0.25,
      false,
      false
    );
    checkProgress(6, () => sprite.getScale());
    // The interpolation is exponential.
    expect(sprite.getScale()).to.be(386.6364089863524);
    expect(sprite.getX()).to.be(100);
    expect(sprite.getY()).to.be(400);
  });

  it('can tween the scale to 0', () => {
    sprite.setPosition(100, 400);
    sprite.setScale(1);
    spriteBehavior.addObjectScaleTween3(
      'MyTween',
      0,
      'linear',
      0.25,
      false,
      false
    );
    // The interpolation is exponential.
    // It would need an infinite speed to go away from 0.
    // This is why the scale is set to 0 directly.
    for (let i = 0; i < 11; i++) {
      runtimeScene.renderAndStep(1000 / 60);
      expect(sprite.getScale()).to.be(0);
    }
    expect(spriteBehavior.hasFinished('MyTween')).to.be(true);
    expect(sprite.getX()).to.be(100);
    expect(sprite.getY()).to.be(400);
  });

  it('can tween the scale from 0', () => {
    sprite.setPosition(100, 400);
    sprite.setScale(0);
    spriteBehavior.addObjectScaleTween3(
      'MyTween',
      1,
      'linear',
      0.25,
      false,
      false
    );
    // The interpolation is exponential.
    // It would need an infinite speed to go away from 0.
    // This is why the scale is set to 1 directly at the end.
    for (let i = 0; i < 11; i++) {
      expect(sprite.getScale()).to.be(0);
      runtimeScene.renderAndStep(1000 / 60);
    }
    expect(spriteBehavior.hasFinished('MyTween')).to.be(true);
    expect(sprite.getScale()).to.be(1);
    expect(sprite.getX()).to.be(100);
    expect(sprite.getY()).to.be(400);
  });

  it('can tween the scales from center', () => {
    sprite.setPosition(100, 400);
    sprite.setScale(200);
    spriteBehavior.addObjectScaleTween3(
      'MyTween',
      600,
      'linear',
      0.25,
      false,
      true
    );
    checkProgress(6, () => sprite.getScale());
    // The interpolation is exponential.
    expect(sprite.getScale()).to.be(386.6364089863524);
    expect(sprite.getX()).to.be(-5872.3650875632775);
    expect(sprite.getY()).to.be(-5572.3650875632775);
  });

  it('can tween the scale of a cube', () => {
    cube.setPosition(100, 400);
    cube.setZ(800);
    cube.setScale(200);
    cubeBehavior.addObjectScaleTween3(
      'MyTween',
      600,
      'linear',
      0.25,
      false,
      false
    );
    checkProgress(6, () => cube.getScale());
    // The interpolation is exponential.
    expect(cube.getScale()).to.be(386.6364089863524);
    expect(cube.getX()).to.be(100);
    expect(cube.getY()).to.be(400);
    expect(cube.getZ()).to.be(800);
  });

  it('can tween the scales of a cube from center', () => {
    cube.setPosition(100, 400);
    cube.setZ(800);
    cube.setScale(200);
    cubeBehavior.addObjectScaleTween3(
      'MyTween',
      600,
      'linear',
      0.25,
      false,
      true
    );
    checkProgress(6, () => cube.getScale());
    // The interpolation is exponential.
    expect(cube.getScale()).to.be(386.6364089863524);
    expect(cube.getX()).to.be(-5872.3650875632775);
    expect(cube.getY()).to.be(-5572.3650875632775);
    expect(cube.getZ()).to.be(-5172.3650875632775);
  });
});
