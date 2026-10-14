// @ts-check

describe('Tools of extensions in the in-game editor', function () {
  /** @type {gdjs.RuntimeGame | null} */
  let runtimeGame = null;
  /** @type {HTMLDivElement | null} */
  let gameContainer = null;
  /** @type {sinon.SinonFakeTimers | null} */
  let clock = null;

  before(async () => {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '/in-game-editor.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  });

  afterEach(() => {
    if (runtimeGame) runtimeGame.dispose(true);
    if (gameContainer) gameContainer.remove();
    if (clock) clock.restore();
    runtimeGame = null;
    gameContainer = null;
    clock = null;
    for (const side of ['left', 'right', 'top']) {
      document.documentElement.style.removeProperty(
        '--in-game-editor-visible-area-' + side
      );
    }
  });

  /** @type {LayoutData} */
  const sceneData = {
    name: 'Scene',
    mangledName: 'Scene',
    title: '',
    r: 0,
    v: 0,
    b: 0,
    stopSoundsOnStartup: false,
    renderer3DWorldScale: 100,
    variables: [],
    behaviorsSharedData: [],
    usedResources: [],
    objectsGroups: [],
    layers: [
      {
        name: '',
        visibility: true,
        cameras: [],
        effects: [],
        ambientLightColorR: 255,
        ambientLightColorG: 255,
        ambientLightColorB: 255,
        isLightingLayer: false,
        followBaseLayerCamera: false,
        renderingType: '2d+3d',
        camera3DNearPlaneDistance: 3,
        camera3DFarPlaneDistance: 10000,
        camera3DFieldOfView: 45,
        cameraType: 'perspective',
      },
    ],
    objects: [],
    instances: [],
    uiSettings: {
      grid: false,
      gridType: 'rectangular',
      gridWidth: 10,
      gridHeight: 10,
      gridDepth: 10,
      gridOffsetX: 0,
      gridOffsetY: 0,
      gridOffsetZ: 0,
      gridColor: 0,
      gridAlpha: 1,
      snap: false,
    },
  };

  /** @returns {Promise<gdjs.InGameEditor>} */
  const createInGameEditor = async () => {
    runtimeGame = new gdjs.RuntimeGame(
      gdjs.createProjectData({ layouts: [sceneData] }),
      {
        initialRuntimeGameStatus: {
          isPaused: true,
          isInGameEdition: true,
          sceneName: 'Scene',
          injectedExternalLayoutName: null,
          skipCreatingInstancesFromScene: false,
          eventsBasedObjectType: null,
          eventsBasedObjectVariantName: null,
          editorId: 'scene-editor',
        },
      }
    );
    // The scene has no resources to load, and the loading screen needs images.
    runtimeGame.loadFirstAssetsAndStartBackgroundLoading = async () => {};
    gameContainer = document.createElement('div');
    document.body.appendChild(gameContainer);
    runtimeGame.getRenderer().createStandardCanvas(gameContainer);
    const inGameEditor = runtimeGame.getInGameEditor();
    if (!inGameEditor) throw new Error('The game has no in-game editor.');
    await inGameEditor.switchToSceneOrVariant(
      'scene-editor',
      'Scene',
      null,
      null,
      null,
      null
    );
    return inGameEditor;
  };

  /**
   * Run a frame of the editor.
   * @param {gdjs.InGameEditor} inGameEditor
   * @returns {boolean} If a tool could use the left mouse button during the frame.
   */
  const isPressedForToolsDuringFrame = (inGameEditor) => {
    inGameEditor.updateAndRender();
    const isPressed = inGameEditor.isCapturedLeftMouseButtonPressed();
    inGameEditor.getRuntimeGame().getInputManager().onFrameEnded();
    return isPressed;
  };

  const spaceKeyCode = 32;

  it('gives the left mouse button to tools, except while the view is moved with Space', async () => {
    const inGameEditor = await createInGameEditor();
    const inputManager = inGameEditor.getRuntimeGame().getInputManager();

    inputManager.onMouseButtonPressed(0);
    expect(isPressedForToolsDuringFrame(inGameEditor)).to.be(true);

    inputManager.onKeyPressed(spaceKeyCode);
    expect(isPressedForToolsDuringFrame(inGameEditor)).to.be(false);
    // The view is moved until the button is released.
    inputManager.onKeyReleased(spaceKeyCode);
    expect(isPressedForToolsDuringFrame(inGameEditor)).to.be(false);

    inputManager.onMouseButtonReleased(0);
    expect(isPressedForToolsDuringFrame(inGameEditor)).to.be(false);
    inputManager.onMouseButtonPressed(0);
    expect(isPressedForToolsDuringFrame(inGameEditor)).to.be(true);
  });

  it('gives a finger to tools after a short delay, and never the fingers of a gesture moving the view', async () => {
    clock = sinon.useFakeTimers({ toFake: ['Date'] });
    const inGameEditor = await createInGameEditor();
    const inputManager = inGameEditor.getRuntimeGame().getInputManager();

    // A finger alone.
    inputManager.onTouchStart(0, 100, 100);
    expect(isPressedForToolsDuringFrame(inGameEditor)).to.be(false);
    clock.tick(200);
    expect(isPressedForToolsDuringFrame(inGameEditor)).to.be(true);
    inputManager.onTouchEnd(0);
    expect(isPressedForToolsDuringFrame(inGameEditor)).to.be(false);
    isPressedForToolsDuringFrame(inGameEditor);

    // Two fingers touching the screen one after the other, then moving the view.
    inputManager.onTouchStart(1, 100, 100);
    expect(isPressedForToolsDuringFrame(inGameEditor)).to.be(false);
    clock.tick(60);
    inputManager.onTouchStart(2, 200, 100);
    expect(isPressedForToolsDuringFrame(inGameEditor)).to.be(false);
    clock.tick(500);
    inputManager.onTouchMove(1, 120, 100);
    inputManager.onTouchMove(2, 220, 100);
    expect(isPressedForToolsDuringFrame(inGameEditor)).to.be(false);
    inputManager.onTouchEnd(2);
    inputManager.onTouchEnd(1);
    isPressedForToolsDuringFrame(inGameEditor);
    // A frame without any finger: the gesture is over.
    isPressedForToolsDuringFrame(inGameEditor);

    // A finger alone again.
    inputManager.onTouchStart(3, 100, 100);
    isPressedForToolsDuringFrame(inGameEditor);
    clock.tick(200);
    expect(isPressedForToolsDuringFrame(inGameEditor)).to.be(true);
  });

  /**
   * @param {integer} count
   * @returns {Array<gdjs.InGameEditorToolbarItem>}
   */
  const createButtons = (count) =>
    new Array(count).fill(0).map((_, index) => ({
      type: 'button',
      id: 'Button' + index,
      tooltip: 'Button ' + index,
      color: '#ff0000',
      onClick: () => {},
    }));

  /**
   * @param {gdjs.InGameEditor} inGameEditor
   * @returns {HTMLElement}
   */
  const getShownExtensionToolbar = (inGameEditor) => {
    inGameEditor.showToolbar('Tool', [
      ...createButtons(10),
      { type: 'divider', id: 'Divider' },
      ...createButtons(10).map((button) => ({
        ...button,
        id: button.id + 'AfterDivider',
      })),
    ]);
    inGameEditor.updateAndRender();
    const toolbar = document.querySelector(
      '.InGameEditor-Extension-Toolbars-Container .InGameEditor-Toolbar-Container'
    );
    if (!(toolbar instanceof HTMLElement)) {
      throw new Error('The toolbar is not shown.');
    }
    return toolbar;
  };

  it('shows the toolbars of extensions in the middle of the part of the game not covered by the editor panels', async () => {
    const inGameEditor = await createInGameEditor();
    // The editor sends the visible area while the scene is loading.
    const sceneSwitch = inGameEditor.switchToSceneOrVariant(
      'scene-editor',
      'Scene',
      null,
      null,
      null,
      null
    );
    inGameEditor.setVisibleScreenArea({
      minX: 0.25,
      minY: 0.1,
      maxX: 1,
      maxY: 1,
    });
    await sceneSwitch;

    const toolbarRect =
      getShownExtensionToolbar(inGameEditor).getBoundingClientRect();

    const visibleAreaMiddleX = (window.innerWidth * (0.25 + 1)) / 2;
    expect(
      Math.abs((toolbarRect.left + toolbarRect.right) / 2 - visibleAreaMiddleX)
    ).to.be.below(1);
    expect(toolbarRect.top).to.be.above(window.innerHeight * 0.1);
  });

  it('shows the toolbars of extensions on several rows when the visible part is too narrow', async () => {
    const inGameEditor = await createInGameEditor();
    const visibleWidth = 200;
    inGameEditor.setVisibleScreenArea({
      minX: 1 - visibleWidth / window.innerWidth,
      minY: 0,
      maxX: 1,
      maxY: 1,
    });

    const toolbar = getShownExtensionToolbar(inGameEditor);
    const toolbarRect = toolbar.getBoundingClientRect();
    const groups = toolbar.querySelectorAll('.InGameEditor-Toolbar-Group');

    expect(toolbarRect.left).to.not.be.below(window.innerWidth - visibleWidth);
    expect(toolbarRect.right).to.not.be.above(window.innerWidth);
    expect(groups.length).to.be(2);
    // The items after the divider are on other rows.
    expect(groups[1].getBoundingClientRect().top).to.be.above(
      groups[0].getBoundingClientRect().top
    );
  });

  it('shows color pickers in the toolbars of extensions', async () => {
    const inGameEditor = await createInGameEditor();
    expect(inGameEditor.isToolbarItemTypeSupported('color')).to.be(true);
    expect(inGameEditor.isToolbarItemTypeSupported('unknown')).to.be(false);

    /** @type {string[]} */
    const chosenColors = [];
    /** @param {string} value */
    const showToolbarWithColor = (value) => {
      inGameEditor.showToolbar('Tool', [
        {
          type: 'color',
          id: 'Color',
          tooltip: 'Color of the brush',
          value,
          onChange: (color) => chosenColors.push(color),
        },
      ]);
      inGameEditor.updateAndRender();
      const colorInput = document.querySelector(
        '.InGameEditor-Extension-Toolbars-Container input[type="color"]'
      );
      if (!(colorInput instanceof HTMLInputElement)) {
        throw new Error('The color picker is not shown.');
      }
      return colorInput;
    };

    const colorInput = showToolbarWithColor('#336699');
    expect(colorInput.value).to.be('#336699');
    expect(colorInput.title).to.be('Color of the brush');

    colorInput.value = '#ff8000';
    colorInput.dispatchEvent(new Event('input'));
    expect(chosenColors).to.eql(['#ff8000']);

    // The tool gives back the chosen color, or another one.
    expect(showToolbarWithColor('#00ff00')).to.be(colorInput);
    expect(colorInput.value).to.be('#00ff00');
  });
});
