// @ts-check

describe('gdjs.TextInputRuntimeObject (using a PixiJS RuntimeGame with DOM elements)', function () {
  /**
   * @param {gdjs.RuntimeScene} runtimeScene
   */
  const makeTextInputRuntimeObject = (runtimeScene) =>
    new gdjs.TextInputRuntimeObject(runtimeScene, {
      name: 'obj1',
      type: 'TextInput::TextInputObject',
      variables: [],
      behaviors: [],
      effects: [],
      content: {
        initialValue: 'My value',
        placeholder: 'The Placeholder',
        fontResourceName: '',
        fontSize: 30,
        inputType: 'text',
        textColor: '100,100,000',
        fillColor: '255,255,255',
        fillOpacity: 255,
        borderColor: '100,100,000',
        borderOpacity: 255,
        borderWidth: 2,
        disabled: false,
        readOnly: false,
      },
    });

  /** @param {gdjs.RuntimeScene} runtimeScene */
  const loadScene = (runtimeScene) => {
    runtimeScene.loadFromScene({
      layers: [
        {
          name: '',
          visibility: true,
          effects: [],
          cameras: [],
          ambientLightColorR: 0,
          ambientLightColorG: 0,
          ambientLightColorB: 0,
          isLightingLayer: false,
          followBaseLayerCamera: true,
        },
      ],
      r: 0,
      v: 0,
      b: 0,
      mangledName: 'Scene1',
      name: 'Scene1',
      stopSoundsOnStartup: false,
      title: '',
      behaviorsSharedData: [],
      objects: [],
      instances: [],
      variables: [],
    });
  };

  it('creates the DOM element', async () => {
    const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
    const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
    loadScene(runtimeScene);

    // Make sure the renderer is created (to test the real DOM element creation/update)
    const gameContainer = document.createElement('div');
    runtimeGame.getRenderer().createStandardCanvas(gameContainer);

    const object = makeTextInputRuntimeObject(runtimeScene);
    runtimeScene.addObject(object);

    // Check the default size.
    expect(object.getWidth()).to.be(300);
    expect(object.getHeight()).to.be(30);

    // Check that the DOM element was created
    const gameDomElementContainer = runtimeGame
      .getRenderer()
      .getDomElementContainer();
    if (!gameDomElementContainer)
      throw new Error(
        'Expected getDomElementContainer to return a valid container.'
      );

    expect(gameDomElementContainer.hasChildNodes()).to.be(true);

    const inputElement = gameDomElementContainer.querySelector('input');
    if (!inputElement)
      throw new Error(
        'Expected an input element to have been created by the object.'
      );

    expect(inputElement.value).to.be('My value');

    // Clean up - not mandatory but to avoid overloading the testing browser.
    runtimeScene.unloadScene();
  });

  it('destroys the DOM element when the scene is paused/resumed/stopped', async () => {
    const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
    const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
    loadScene(runtimeScene);

    // Make sure the renderer is created (to test the real DOM element creation/update)
    const gameContainer = document.createElement('div');
    runtimeGame.getRenderer().createStandardCanvas(gameContainer);

    const object = makeTextInputRuntimeObject(runtimeScene);
    runtimeScene.addObject(object);

    // Check that the DOM element was created
    const gameDomElementContainer = runtimeGame
      .getRenderer()
      .getDomElementContainer();
    if (!gameDomElementContainer)
      throw new Error(
        'Expected getDomElementContainer to return a valid container.'
      );

    expect(gameDomElementContainer.querySelector('input')).not.to.be(null);

    // Check that it is updated according to the lifecycle of the scene
    runtimeScene.onPause();
    expect(gameDomElementContainer.querySelector('input')).to.be(null);

    runtimeScene.onResume();
    expect(gameDomElementContainer.querySelector('input')).not.to.be(null);

    runtimeScene.unloadScene();
    expect(gameDomElementContainer.querySelector('input')).to.be(null);
  });

  it('changes the DOM element when the object type is updated', async () => {
    const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
    const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
    loadScene(runtimeScene);

    // Make sure the renderer is created (to test the real DOM element creation/update)
    const gameContainer = document.createElement('div');
    runtimeGame.getRenderer().createStandardCanvas(gameContainer);

    const object = makeTextInputRuntimeObject(runtimeScene);
    runtimeScene.addObject(object);

    // Check that the DOM element was created
    const gameDomElementContainer = runtimeGame
      .getRenderer()
      .getDomElementContainer();
    if (!gameDomElementContainer)
      throw new Error(
        'Expected getDomElementContainer to return a valid container.'
      );

    expect(gameDomElementContainer.querySelector('input')).not.to.be(null);

    object.setInputType('text area');
    expect(gameDomElementContainer.querySelector('input')).to.be(null);
    expect(gameDomElementContainer.querySelector('textarea')).not.to.be(null);

    object.setInputType('password');
    expect(gameDomElementContainer.querySelector('input')).not.to.be(null);
    expect(gameDomElementContainer.querySelector('textarea')).to.be(null);

    object.deleteFromScene(runtimeScene);
    expect(gameDomElementContainer.querySelector('input')).to.be(null);
    expect(gameDomElementContainer.querySelector('textarea')).to.be(null);

    // Clean up - not mandatory but to avoid overloading the testing browser.
    runtimeScene.unloadScene();
  });
});
