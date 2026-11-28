// @ts-check

describe('gdjs.InputFocusManager', () => {
  /**
   * @param {gdjs.RuntimeGame} runtimeGame
   */
  const createSceneWithLayers = (runtimeGame) => {
    const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
    runtimeScene.loadFromScene({
      sceneData: {
        // @ts-ignore The other layer properties are not needed.
        layers: [
          { name: '', visibility: true, effects: [] },
          { name: 'UI', visibility: true, effects: [] },
        ],
        variables: [],
        behaviorsSharedData: [],
        objects: [],
        instances: [],
      },
      usedExtensionsWithVariablesData: [],
    });
    return runtimeScene;
  };

  /**
   * A 100x100 object.
   * @param {gdjs.RuntimeInstanceContainer} instanceContainer
   * @param {{x: number, y: number, layer?: string, zOrder?: number}} options
   */
  const createObject = (instanceContainer, { x, y, layer, zOrder }) => {
    const object = new gdjs.TestRuntimeObject(instanceContainer, {
      name: 'Object',
      type: '',
      behaviors: [],
      effects: [],
      variables: [],
    });
    object.setCustomWidthAndHeight(100, 100);
    object.setPosition(x, y);
    object.setLayer(layer || '');
    object.setZOrder(zOrder || 0);
    instanceContainer.addObject(object);
    return object;
  };

  describe('pointer', () => {
    const runtimeGame = gdjs.getPixiRuntimeGame();
    const inputManager = runtimeGame.getInputManager();

    afterEach(() => {
      inputManager.onMouseMove(0, 0);
    });

    it('covers the objects drawn under an object blocking the pointer', () => {
      const runtimeScene = createSceneWithLayers(runtimeGame);
      const button = createObject(runtimeScene, { x: 0, y: 0, zOrder: 1 });
      const dialog = createObject(runtimeScene, { x: 50, y: 0, zOrder: 2 });
      dialog.setBlockingPointer(true);
      expect(dialog.isBlockingPointer()).to.be(true);

      // Where the dialog is over the button.
      inputManager.onMouseMove(75, 50);
      expect(button.cursorOnObject()).to.be(true);
      expect(button.cursorOnObject(true)).to.be(false);
      expect(dialog.cursorOnObject(true)).to.be(true);
      // Where the button is not covered.
      inputManager.onMouseMove(25, 50);
      expect(button.cursorOnObject(true)).to.be(true);

      // Not drawn above anymore.
      inputManager.onMouseMove(75, 50);
      dialog.setZOrder(0);
      expect(button.cursorOnObject(true)).to.be(true);
      // The same Z order: not covered.
      dialog.setZOrder(1);
      expect(button.cursorOnObject(true)).to.be(true);
      dialog.setZOrder(2);
      expect(button.cursorOnObject(true)).to.be(false);

      // A hidden object doesn't block the pointer.
      dialog.hide(true);
      expect(button.cursorOnObject(true)).to.be(true);
      dialog.hide(false);
      expect(button.cursorOnObject(true)).to.be(false);

      dialog.setBlockingPointer(false);
      expect(dialog.isBlockingPointer()).to.be(false);
      expect(button.cursorOnObject(true)).to.be(true);
    });

    it('compares the layers before the Z orders', () => {
      const runtimeScene = createSceneWithLayers(runtimeGame);
      const button = createObject(runtimeScene, { x: 0, y: 0, zOrder: 10 });
      const dialog = createObject(runtimeScene, {
        x: 0,
        y: 0,
        layer: 'UI',
        zOrder: 0,
      });
      dialog.setBlockingPointer(true);
      inputManager.onMouseMove(50, 50);
      expect(button.cursorOnObject(true)).to.be(false);

      runtimeScene.setLayerIndex('UI', 0);
      expect(button.cursorOnObject(true)).to.be(true);
      button.setBlockingPointer(true);
      expect(dialog.cursorOnObject(true)).to.be(false);
    });

    it('handles the touches', () => {
      const runtimeScene = createSceneWithLayers(runtimeGame);
      const button = createObject(runtimeScene, { x: 0, y: 0 });
      const dialog = createObject(runtimeScene, { x: 0, y: 0, zOrder: 1 });
      dialog.setBlockingPointer(true);
      inputManager.touchSimulateMouse(false);
      inputManager.onTouchStart(1, 50, 50);
      expect(button.cursorOnObject()).to.be(true);
      expect(button.cursorOnObject(true)).to.be(false);
      inputManager.onTouchEnd(1);
      inputManager.onFrameEnded();
      inputManager.onFrameEnded();
      inputManager.touchSimulateMouse(true);
    });

    it('tells if the cursor is on an object blocking the pointer', () => {
      const runtimeScene = createSceneWithLayers(runtimeGame);
      const dialog = createObject(runtimeScene, { x: 0, y: 0 });
      inputManager.onMouseMove(50, 50);
      expect(
        gdjs.evtTools.input.isCursorOnPointerBlockingObject(runtimeScene)
      ).to.be(false);
      dialog.setBlockingPointer(true);
      expect(
        gdjs.evtTools.input.isCursorOnPointerBlockingObject(runtimeScene)
      ).to.be(true);
      inputManager.onMouseMove(150, 50);
      expect(
        gdjs.evtTools.input.isCursorOnPointerBlockingObject(runtimeScene)
      ).to.be(false);

      // A deleted object doesn't block the pointer anymore.
      inputManager.onMouseMove(50, 50);
      dialog.deleteFromScene();
      expect(
        gdjs.evtTools.input.isCursorOnPointerBlockingObject(runtimeScene)
      ).to.be(false);
    });

    it('filters the objects of the condition', () => {
      const runtimeScene = createSceneWithLayers(runtimeGame);
      const button = createObject(runtimeScene, { x: 0, y: 0 });
      const otherButton = createObject(runtimeScene, { x: 0, y: 0 });
      const dialog = createObject(runtimeScene, { x: 0, y: 50, zOrder: 1 });
      dialog.setBlockingPointer(true);
      otherButton.setZOrder(2);
      inputManager.onMouseMove(50, 75);

      const objectsLists = Hashtable.newFrom({
        Object: [button, otherButton],
      });
      expect(
        gdjs.evtTools.input.cursorOnObject(
          objectsLists,
          runtimeScene,
          true,
          false,
          true
        )
      ).to.be(true);
      expect(objectsLists.get('Object')).to.eql([otherButton]);
    });
  });

  describe('pointer with custom objects', () => {
    const instancesSideBySide = [0, 64].map((x) => ({
      angle: 0,
      customSize: true,
      height: 64,
      layer: '',
      name: 'MySprite',
      persistentUuid: '668db48d-4e12-4b6f-aa6b-f73b74bf608e',
      width: 64,
      x,
      y: 0,
      zOrder: 1,
      numberProperties: [],
      stringProperties: [],
      initialVariables: [],
      behaviorOverridings: [],
    }));

    const makeCustomObjectWith2Children = async () => {
      const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets({
        customObjectInstances: instancesSideBySide,
      });
      const runtimeScene = createSceneWithLayers(runtimeGame);
      const customObject = new gdjs.CustomRuntimeObject2D(runtimeScene, {
        name: 'MyCustomObject',
        type: 'MyExtension::MyEventsBasedObject',
        variant: '',
        isInnerAreaFollowingParentSize: false,
        variables: [],
        behaviors: [],
        effects: [],
        content: {},
      });
      runtimeScene.addObject(customObject);
      const children = customObject
        .getChildrenContainer()
        .getInstancesOf('MySprite');
      return {
        runtimeGame,
        runtimeScene,
        customObject,
        leftChild: children[0],
        rightChild: children[1],
      };
    };

    it("doesn't cover the objects inside an object blocking the pointer", async () => {
      const { runtimeGame, runtimeScene, customObject, leftChild } =
        await makeCustomObjectWith2Children();
      const inputManager = runtimeGame.getInputManager();
      customObject.setZOrder(5);
      customObject.setBlockingPointer(true);
      const objectUnder = createObject(runtimeScene, { x: 0, y: 0 });

      inputManager.onMouseMove(32, 32);
      expect(leftChild.cursorOnObject(true)).to.be(true);
      expect(customObject.cursorOnObject(true)).to.be(true);
      expect(objectUnder.cursorOnObject(true)).to.be(false);
    });

    it('compares the children of different custom objects with their parents', async () => {
      const { runtimeGame, runtimeScene, customObject, leftChild } =
        await makeCustomObjectWith2Children();
      const inputManager = runtimeGame.getInputManager();
      customObject.setZOrder(1);
      // A child blocking the pointer, in a custom object drawn under another
      // object: it doesn't cover it, even if its Z order is greater.
      leftChild.setZOrder(100);
      leftChild.setBlockingPointer(true);
      const objectAbove = createObject(runtimeScene, {
        x: 0,
        y: 0,
        zOrder: 2,
      });
      inputManager.onMouseMove(32, 32);
      expect(objectAbove.cursorOnObject(true)).to.be(true);

      objectAbove.setZOrder(0);
      expect(objectAbove.cursorOnObject(true)).to.be(false);
    });

    it('compares the children of a custom object with their Z orders', async () => {
      const { runtimeGame, customObject, leftChild, rightChild } =
        await makeCustomObjectWith2Children();
      const inputManager = runtimeGame.getInputManager();
      // The right child is moved over the right half of the left one.
      rightChild.setX(32);
      rightChild.setBlockingPointer(true);
      inputManager.onMouseMove(48, 32);

      rightChild.setZOrder(2);
      expect(leftChild.cursorOnObject(true)).to.be(false);
      rightChild.setZOrder(0);
      expect(leftChild.cursorOnObject(true)).to.be(true);

      // A hidden custom object doesn't block the pointer with its children.
      rightChild.setZOrder(2);
      customObject.hide(true);
      expect(leftChild.cursorOnObject(true)).to.be(true);
    });
  });

  describe('keyboard and gamepad focus', () => {
    const runtimeGame = gdjs.getPixiRuntimeGame();

    it('gives the focus to the last object that took it', () => {
      const runtimeScene = createSceneWithLayers(runtimeGame);
      const menu = createObject(runtimeScene, { x: 0, y: 0 });
      const dialog = createObject(runtimeScene, { x: 0, y: 0 });
      const otherDialog = createObject(runtimeScene, { x: 0, y: 0 });

      // No object took the focus: every object has it.
      expect(menu.hasInputFocus()).to.be(true);
      expect(dialog.hasInputFocus()).to.be(true);

      dialog.takeInputFocus();
      expect(menu.hasInputFocus()).to.be(false);
      expect(dialog.hasInputFocus()).to.be(true);

      otherDialog.takeInputFocus();
      expect(dialog.hasInputFocus()).to.be(false);
      expect(otherDialog.hasInputFocus()).to.be(true);

      // Taking it again puts it on top.
      dialog.takeInputFocus();
      expect(dialog.hasInputFocus()).to.be(true);
      expect(otherDialog.hasInputFocus()).to.be(false);

      dialog.releaseInputFocus();
      expect(otherDialog.hasInputFocus()).to.be(true);

      // A deleted object releases it.
      otherDialog.deleteFromScene();
      expect(menu.hasInputFocus()).to.be(true);
    });

    it('gives the focus to the children of a custom object', async () => {
      const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
      const runtimeScene = createSceneWithLayers(runtimeGame);
      const customObject = new gdjs.CustomRuntimeObject2D(runtimeScene, {
        name: 'MyCustomObject',
        type: 'MyExtension::MyEventsBasedObject',
        variant: '',
        isInnerAreaFollowingParentSize: false,
        variables: [],
        behaviors: [],
        effects: [],
        content: {},
      });
      runtimeScene.addObject(customObject);
      const child = customObject
        .getChildrenContainer()
        .getInstancesOf('MySprite')[0];
      const otherObject = createObject(runtimeScene, { x: 0, y: 0 });

      customObject.takeInputFocus();
      expect(child.hasInputFocus()).to.be(true);
      expect(otherObject.hasInputFocus()).to.be(false);

      // A child taking the focus doesn't give it to its parent.
      child.takeInputFocus();
      expect(customObject.hasInputFocus()).to.be(false);
      expect(child.hasInputFocus()).to.be(true);
    });
  });
});
