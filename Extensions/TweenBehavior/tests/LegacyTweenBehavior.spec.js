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
    behavior.addVariableTween2(
      'MyTween',
      variable,
      600,
      'linear',
      250 / 1.5,
      false
    );
    checkProgress(6, () => variable.getAsNumber());
    expect(variable.getAsNumber()).to.be(440);
  });

  it('can tween an object variable (older action)', () => {
    const variable = object.getVariables().get('MyVariable');
    variable.setNumber(200);
    behavior.addVariableTween(
      'MyTween',
      variable,
      200,
      600,
      'linear',
      250 / 1.5,
      false
    );
    checkProgress(6, () => variable.getAsNumber());
    expect(variable.getAsNumber()).to.be(440);
  });

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

  it('can tween the position on Y axis', () => {
    object.setY(200);
    behavior.addObjectPositionYTween(
      'MyTween',
      600,
      'linear',
      250 / 1.5,
      false
    );
    checkProgress(6, () => object.getY());
    expect(object.getY()).to.be(440);
  });

  it('can tween the position on Z axis', () => {
    cube.setZ(200);
    cubeBehavior.addObjectPositionZTween(
      'MyTween',
      600,
      'linear',
      250 / 1.5,
      false
    );
    checkProgress(6, () => cube.getZ());
    expect(cube.getZ()).to.be(440);
  });

  it('can tween the angle', () => {
    object.setAngle(200);
    behavior.addObjectAngleTween('MyTween', 600, 'linear', 250 / 1.5, false);
    checkProgress(6, () => object.getAngle());
    expect(object.getAngle()).to.be(440);
  });

  it('can tween the width', () => {
    object.setWidth(200);
    behavior.addObjectWidthTween('MyTween', 600, 'linear', 250 / 1.5, false);
    checkProgress(6, () => object.getWidth());
    expect(object.getWidth()).to.be(440);
  });

  it('can tween the height', () => {
    object.setHeight(200);
    behavior.addObjectHeightTween('MyTween', 600, 'linear', 250 / 1.5, false);
    checkProgress(6, () => object.getHeight());
    expect(object.getHeight()).to.be(440);
  });

  it('can tween the depth', () => {
    cube.setDepth(200);
    cubeBehavior.addObjectDepthTween(
      'MyTween',
      600,
      'linear',
      250 / 1.5,
      false
    );
    checkProgress(6, () => cube.getDepth());
    expect(cube.getDepth()).to.be(440);
  });

  it('can tween the opacity', () => {
    sprite.setOpacity(128);
    spriteBehavior.addObjectOpacityTween(
      'MyTween',
      255,
      'linear',
      250 / 1.5,
      false
    );
    checkProgress(6, () => sprite.getOpacity());
    expect(sprite.getOpacity()).to.be(204.2);
  });

  it('can tween the color', () => {
    sprite.setColor('16;32;64');
    spriteBehavior.addObjectColorTween(
      'MyTween',
      '255;192;128',
      'linear',
      250 / 1.5,
      false,
      true
    );
    checkProgress(6, () => sprite.getColor());
    // Colors are rounded by the tween.
    expect(sprite.getColor()).to.be('76;235;27');
  });

  it('can tween the color to HSL', () => {
    sprite.setColor('16;32;64');
    spriteBehavior.addObjectColorHSLTween(
      'MyTween',
      180,
      true,
      25,
      50,
      'linear',
      250 / 1.5,
      false
    );
    checkProgress(6, () => sprite.getColor());
    // Colors are rounded by the tween.
    expect(sprite.getColor()).to.be('57;110;129');
  });

  it('can tween the scale on X axis', () => {
    sprite.setPosition(100, 400);
    sprite.setScaleX(200);
    spriteBehavior.addObjectScaleXTween(
      'MyTween',
      600,
      'linear',
      250 / 1.5,
      false,
      false
    );
    checkProgress(6, () => sprite.getScaleX());
    // The interpolation was not exponential.
    expect(sprite.getScaleX()).to.be(440);
    expect(sprite.getX()).to.be(100);
    expect(sprite.getY()).to.be(400);
  });

  it('can tween the scale on X axis from center', () => {
    sprite.setPosition(100, 400);
    sprite.setScaleX(200);
    spriteBehavior.addObjectScaleXTween(
      'MyTween',
      600,
      'linear',
      250 / 1.5,
      false,
      true
    );
    checkProgress(6, () => sprite.getScaleX());
    // The interpolation was not exponential.
    expect(sprite.getScaleX()).to.be(440);
    expect(sprite.getX()).to.be(-7580);
    expect(sprite.getY()).to.be(400);
  });

  it('can tween the scale on Y axis', () => {
    sprite.setPosition(100, 400);
    sprite.setScaleY(200);
    spriteBehavior.addObjectScaleYTween(
      'MyTween',
      600,
      'linear',
      250 / 1.5,
      false,
      false
    );
    checkProgress(6, () => sprite.getScaleY());
    // The interpolation was not exponential.
    expect(sprite.getScaleY()).to.be(440);
    expect(sprite.getX()).to.be(100);
    expect(sprite.getY()).to.be(400);
  });

  it('can tween the scale on Y axis from center', () => {
    sprite.setPosition(100, 400);
    sprite.setScaleY(200);
    spriteBehavior.addObjectScaleYTween(
      'MyTween',
      600,
      'linear',
      250 / 1.5,
      false,
      true
    );
    checkProgress(6, () => sprite.getScaleY());
    // The interpolation was not exponential.
    expect(sprite.getScaleY()).to.be(440);
    expect(sprite.getX()).to.be(100);
    expect(sprite.getY()).to.be(-7280);
  });

  it('can tween the font size', () => {
    textObject.setCharacterSize(200);
    textObjectBehavior.addTextObjectCharacterSizeTween(
      'MyTween',
      600,
      'linear',
      250 / 1.5,
      false
    );
    checkProgress(6, () => textObject.getCharacterSize());
    // The interpolation was not exponential.
    expect(textObject.getCharacterSize()).to.be(440);
  });

  it('can tween the position', () => {
    object.setPosition(200, 300);
    behavior.addObjectPositionTween(
      'MyTween',
      600,
      900,
      'linear',
      250 / 1.5,
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
    spriteBehavior.addObjectScaleTween(
      'MyTween',
      600,
      900,
      'linear',
      250 / 1.5,
      false,
      false
    );
    checkProgress(6, [() => sprite.getScaleX(), () => sprite.getScaleY()]);
    // The interpolation was not exponential.
    expect(sprite.getScaleX()).to.be(440);
    expect(sprite.getScaleY()).to.be(660);
    expect(sprite.getX()).to.be(100);
    expect(sprite.getY()).to.be(400);
  });

  it('can tween the scales from center', () => {
    sprite.setPosition(100, 400);
    sprite.setScaleX(200);
    sprite.setScaleY(300);
    spriteBehavior.addObjectScaleTween(
      'MyTween',
      600,
      900,
      'linear',
      250 / 1.5,
      false,
      true
    );
    checkProgress(6, [() => sprite.getScaleX(), () => sprite.getScaleY()]);
    // The interpolation was not exponential.
    expect(sprite.getScaleX()).to.be(440);
    expect(sprite.getScaleY()).to.be(660);
    expect(sprite.getX()).to.be(-7580);
    expect(sprite.getY()).to.be(-11120);
  });

  it('can tween the scales in seconds', () => {
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

  it('can tween the scales from center in seconds', () => {
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
