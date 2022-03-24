// @ts-check

describe('gdjs.Physics2RuntimeBehavior', function () {
  const setupSceneAndObject = () => {
    const runtimeGame = new gdjs.RuntimeGame({
      variables: [],
      resources: { resources: [] },
      // @ts-ignore
      properties: { windowWidth: 800, windowHeight: 600 },
    });
    const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
    runtimeScene.loadFromScene({
      layers: [
        {
          name: '',
          visibility: true,
          cameras: [],
          effects: [],
          ambientLightColorR: 127,
          ambientLightColorB: 127,
          ambientLightColorG: 127,
          isLightingLayer: false,
          followBaseLayerCamera: false,
        },
      ],
      variables: [],
      r: 0,
      v: 0,
      b: 0,
      mangledName: 'Scene1',
      name: 'Scene1',
      stopSoundsOnStartup: false,
      title: '',
      behaviorsSharedData: [
        {
          name: 'Physics2',
          type: 'Physics2::Physics2Behavior',
          gravityX: 0,
          gravityY: 9.8,
          scaleX: 100,
          scaleY: 100,
        },
      ],
      objects: [],
      instances: [],
    });
    runtimeScene._timeManager.getElapsedTime = function () {
      return (1 / 60) * 1000;
    };

    const object = new gdjs.TestRuntimeObject(runtimeScene, {
      name: 'obj1',
      type: '',
      behaviors: [
        {
          name: 'Physics2',
          type: 'Physics2::Physics2Behavior',
          bodyType: 'Dynamic',
          bullet: false,
          fixedRotation: false,
          canSleep: true,
          shape: 'Box',
          shapeDimensionA: 0,
          shapeDimensionB: 0,
          shapeOffsetX: 0,
          shapeOffsetY: 0,
          polygonOrigin: 'Center',
          vertices: [],
          density: 1,
          friction: 0.3,
          restitution: 0.1,
          linearDamping: 0.1,
          angularDamping: 0.1,
          gravityScale: 1,
          layers: 1,
          masks: 1,
        },
      ],
      variables: [],
      effects: [],
    });
    runtimeScene.addObject(object);

    const behavior = object.getBehavior('Physics2');
    if (!behavior || !(behavior instanceof gdjs.Physics2RuntimeBehavior)) {
      throw new Error(
        'The Physics2 behavior could not be created/found on the object.'
      );
    }

    return { runtimeScene, object, behavior };
  };

  it('creates the body when needed', function () {
    const { runtimeScene, object, behavior } = setupSceneAndObject();

    runtimeScene.renderAndStep(1000 / 60);
    expect(behavior.getBody()).not.to.be(null);
    expect(object.getX()).to.be(0);
    expect(object.getY()).to.be(0.2717692870646715);

    runtimeScene.renderAndStep(1000 / 60);
    runtimeScene.renderAndStep(1000 / 60);
    runtimeScene.renderAndStep(1000 / 60);
    expect(behavior.getBody()).not.to.be(null);
    expect(object.getX()).to.be(0);
    expect(object.getY()).to.be(2.713174745440483);

    runtimeScene.unloadScene();
  });

  it('allows some properties to be changed', function () {
    const { runtimeScene, object, behavior } = setupSceneAndObject();

    runtimeScene.renderAndStep(1000 / 60);
    expect(behavior.getBody()).not.to.be(null);

    // Check default values
    expect(behavior.isStatic()).to.be(false);
    expect(behavior.isDynamic()).to.be(true);
    expect(behavior.getFriction()).to.be(0.3);
    expect(behavior.isSleepingAllowed()).to.be(true);

    // Check a few values can be changed
    behavior.setStatic();
    expect(behavior.isStatic()).to.be(true);

    behavior.setFriction(2);
    expect(behavior.getFriction()).to.be(2);

    behavior.setSleepingAllowed(false);
    expect(behavior.isSleepingAllowed()).to.be(false);

    runtimeScene.unloadScene();
  });

  it('destroy the body when needed', function () {
    const { runtimeScene, object, behavior } = setupSceneAndObject();

    runtimeScene.renderAndStep(1000 / 60);
    expect(behavior.getBody()).not.to.be(null);
    expect(object.getX()).to.be(0);
    expect(object.getY()).to.be(0.2717692870646715);
    object.deleteFromScene(runtimeScene);

    behavior.setStatic();
    behavior.setDynamic();
    behavior.setFixedRotation(true);
    behavior.setFixedRotation(false);
    behavior.setBullet(true);
    behavior.setBullet(false);
    behavior.setAngularDamping(1);
    behavior.setAngularVelocity(1);
    behavior.setFriction(1);
    behavior.setSleepingAllowed(false);
    behavior.setSleepingAllowed(true);

    expect(behavior._body).to.be(null);

    runtimeScene.unloadScene();
  });
});
