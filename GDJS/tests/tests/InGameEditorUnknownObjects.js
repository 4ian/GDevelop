// @ts-check

describe('Objects of unknown types in the in-game editor', function () {
  /** @type {gdjs.RuntimeGame | null} */
  let runtimeGame = null;
  /** @type {HTMLDivElement | null} */
  let gameContainer = null;

  afterEach(() => {
    if (runtimeGame) runtimeGame.dispose(true);
    if (gameContainer) gameContainer.remove();
    runtimeGame = null;
    gameContainer = null;
  });

  /** @type {ObjectData} */
  const unknownTypeObjectData = {
    name: 'MyUnknownTypeObject',
    type: 'MissingExtension::MissingObject',
    variables: [],
    behaviors: [],
    effects: [],
    // @ts-ignore - the content is not fully typed.
    content: { width: 32, height: 32, depth: 32 },
  };

  /**
   * @param {{isInGameEdition: boolean}} options
   * @returns {gdjs.RuntimeScene}
   */
  const createScene = ({ isInGameEdition }) => {
    runtimeGame = gdjs.getPixiRuntimeGame();
    runtimeGame.isInGameEdition = () => isInGameEdition;
    gameContainer = document.createElement('div');
    document.body.appendChild(gameContainer);
    runtimeGame.getRenderer().createStandardCanvas(gameContainer);
    const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
    runtimeScene.addLayer({
      name: '',
      visibility: true,
      cameras: [],
      effects: [],
      ambientLightColorR: 0,
      ambientLightColorG: 0,
      ambientLightColorB: 0,
      isLightingLayer: false,
      followBaseLayerCamera: false,
    });
    runtimeScene.registerObject(unknownTypeObjectData);
    return runtimeScene;
  };

  it('shows a placeholder for missing objects and object types', () => {
    const runtimeScene = createScene({ isInGameEdition: true });

    expect(runtimeScene.createObject('MyUnknownTypeObject')).to.be.a(
      gdjs.RuntimeObject3D
    );
    expect(runtimeScene.createObject('MyMissingObject')).to.be.a(
      gdjs.RuntimeObject3D
    );
  });

  it("doesn't show a placeholder in a game", () => {
    const runtimeScene = createScene({ isInGameEdition: false });

    const instance = runtimeScene.createObject('MyUnknownTypeObject');
    if (!instance) throw new Error("Couldn't create an instance for testing.");
    expect(instance.constructor).to.be(gdjs.RuntimeObject);
    expect(runtimeScene.createObject('MyMissingObject')).to.be(null);
  });
});
