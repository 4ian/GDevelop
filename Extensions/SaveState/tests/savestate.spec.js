// @ts-check

describe('SaveState', () => {
  /**
   * @param {{name: string, x: number, y: number}} content
   * @returns {InstanceData}
   */
  const getFakeInstanceData = ({ name, x, y }) => ({
    persistentUuid: '',

    layer: '',
    locked: false,
    name,

    x,
    y,

    angle: 0,

    zOrder: 0,

    customSize: false,
    width: 0,
    height: 0,
    depth: 0,

    numberProperties: [],
    stringProperties: [],
    initialVariables: [],
  });

  /**
   * @param {{name: string, objects?: gdjs.SpriteObjectData[], instances?: InstanceData[]}} settings
   * @returns {LayoutData}
   */
  const getFakeSceneData = ({ name, objects, instances }) => ({
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
    mangledName: name,
    name: name,
    stopSoundsOnStartup: false,
    title: '',
    behaviorsSharedData: [],
    objects: objects || [
      // @ts-ignore - This is a gdjs.SpriteObjectData.
      {
        type: 'Sprite',
        name: 'MySpriteObject',
        behaviors: [],
        effects: [],
        variables: [],

        animations: [],
        updateIfNotVisible: false,
      },
    ],
    instances: instances || [],
    variables: [],
    usedResources: [],
  });

  describe('Save State Basics', () => {
    it('saves and restores a game with objects at specific positions (without SaveConfiguration behavior)', async () => {
      // Start a game.
      const runtimeGame1 = gdjs.getPixiRuntimeGame({
        layouts: [getFakeSceneData({ name: 'Scene1' })],
      });
      await runtimeGame1._resourcesLoader.loadAllResources(() => {});

      const runtimeScene1 = runtimeGame1.getSceneStack().push({
        sceneName: 'Scene1',
      });
      if (!runtimeScene1) throw new Error('No current scene was created.');

      // Create some objects at specific positions.
      const object1 = runtimeScene1.createObject('MySpriteObject');
      const object2 = runtimeScene1.createObject('MySpriteObject');

      if (!object1 || !object2) {
        throw new Error('Objects were not created');
      }

      object1.setX(100);
      object1.setY(200);
      object2.setX(300);
      object2.setY(400);

      const object1Id = object1.id;
      const object2Id = object2.id;

      // Save the game state.
      const saveState = gdjs.saveState.getGameSaveState(runtimeGame1, {
        profileNames: ['default'],
      });

      expect(saveState).not.to.be(null);
      expect(saveState.layoutNetworkSyncDatas).to.have.length(1);
      expect(
        saveState.layoutNetworkSyncDatas[0].objectDatas[object1Id]
      ).not.to.be(undefined);
      expect(
        saveState.layoutNetworkSyncDatas[0].objectDatas[object2Id]
      ).not.to.be(undefined);

      // Start a new game.
      const runtimeGame2 = gdjs.getPixiRuntimeGame({
        layouts: [getFakeSceneData({ name: 'Scene1' })],
      });
      await runtimeGame2._resourcesLoader.loadAllResources(() => {});

      // Load the saved state.
      gdjs.saveState.loadGameFromSave(runtimeGame2, saveState, {
        loadProfileNames: ['default'],
      });

      const runtimeScene2 = runtimeGame2.getSceneStack().getCurrentScene();
      if (!runtimeScene2) throw new Error('No current scene was restored.');

      // Verify objects are restored.
      const restoredObjects = runtimeScene2.getObjects('MySpriteObject');
      expect(restoredObjects.length).to.be(2);

      // Find objects by their positions (since IDs might be different).
      const restoredObject1 = restoredObjects.find(
        (obj) => obj.getX() === 100 && obj.getY() === 200
      );
      const restoredObject2 = restoredObjects.find(
        (obj) => obj.getX() === 300 && obj.getY() === 400
      );
      if (!restoredObject1 || !restoredObject2) {
        throw new Error(
          'Objects not found at the proper positions after restore.'
        );
      }

      expect(restoredObject1.getName()).to.be('MySpriteObject');
      expect(restoredObject2.getName()).to.be('MySpriteObject');
    });

    it('saves and restores scene variables', async () => {
      // Start a game.
      const runtimeGame1 = gdjs.getPixiRuntimeGame({
        layouts: [getFakeSceneData({ name: 'Scene1' })],
      });
      await runtimeGame1._resourcesLoader.loadAllResources(() => {});

      const runtimeScene1 = runtimeGame1.getSceneStack().push({
        sceneName: 'Scene1',
      });
      if (!runtimeScene1) throw new Error('No current scene was created.');

      // Create scene variables.
      const sceneVariable = new gdjs.Variable();
      sceneVariable.setString('TestValue');
      runtimeScene1.getVariables().add('MyVariable', sceneVariable);

      // Save the game state.
      const saveState = gdjs.saveState.getGameSaveState(runtimeGame1, {
        profileNames: ['default'],
      });

      // Start a new game.
      const runtimeGame2 = gdjs.getPixiRuntimeGame({
        layouts: [getFakeSceneData({ name: 'Scene1' })],
      });
      await runtimeGame2._resourcesLoader.loadAllResources(() => {});

      // Load the saved state.
      gdjs.saveState.loadGameFromSave(runtimeGame2, saveState, {
        loadProfileNames: ['default'],
      });

      const runtimeScene2 = runtimeGame2.getSceneStack().getCurrentScene();
      if (!runtimeScene2) throw new Error('No current scene was restored.');

      // Verify variable is restored.
      expect(runtimeScene2.getVariables().has('MyVariable')).to.be(true);
      expect(
        runtimeScene2.getVariables().get('MyVariable').getAsString()
      ).to.be('TestValue');
    });

    it('saves and restores global variables', async () => {
      // Start a game.
      const runtimeGame1 = gdjs.getPixiRuntimeGame({
        layouts: [getFakeSceneData({ name: 'Scene1' })],
      });
      await runtimeGame1._resourcesLoader.loadAllResources(() => {});

      const runtimeScene1 = runtimeGame1.getSceneStack().push({
        sceneName: 'Scene1',
      });
      if (!runtimeScene1) throw new Error('No current scene was created.');

      // Create global variables
      const globalVariable = new gdjs.Variable();
      globalVariable.setNumber(42);
      runtimeGame1.getVariables().add('MyGlobalVariable', globalVariable);

      // Save the game state
      const saveState = gdjs.saveState.getGameSaveState(runtimeGame1, {
        profileNames: ['default'],
      });

      // Start a new game.
      const runtimeGame2 = gdjs.getPixiRuntimeGame({
        layouts: [getFakeSceneData({ name: 'Scene1' })],
      });
      await runtimeGame2._resourcesLoader.loadAllResources(() => {});

      // Load the saved state.
      gdjs.saveState.loadGameFromSave(runtimeGame2, saveState, {
        loadProfileNames: ['default'],
      });

      const runtimeScene2 = runtimeGame2.getSceneStack().getCurrentScene();
      if (!runtimeScene2) throw new Error('No current scene was restored.');

      // Verify global variable is restored.
      expect(runtimeGame2.getVariables().has('MyGlobalVariable')).to.be(true);
      expect(
        runtimeGame2.getVariables().get('MyGlobalVariable').getAsNumber()
      ).to.be(42);
    });
  });

  describe('Save State with initial instances and SaveConfiguration behavior', () => {
    it('saves and restores with initial instances and objects having the SaveConfiguration behavior', async () => {
      // Start a game.
      const sceneData = getFakeSceneData({
        name: 'Scene1',
        objects: [
          {
            type: 'Sprite',
            name: 'NotSavedSpriteObject',
            behaviors: [
              {
                name: 'SaveConfiguration',
                type: 'SaveState::SaveConfiguration',
                defaultProfilePersistence: 'DoNotSave',
              },
            ],
            effects: [],
            variables: [],

            updateIfNotVisible: false,
            animations: [],
          },
          {
            type: 'Sprite',
            name: 'SavedSpriteObject',
            behaviors: [
              {
                name: 'SaveConfiguration',
                type: 'SaveState::SaveConfiguration',
                defaultProfilePersistence: 'Persisted',
              },
            ],
            effects: [],
            variables: [],

            updateIfNotVisible: false,
            animations: [],
          },
        ],
        instances: [
          // A default instance which will be not removed, because the associated object is marked as not persisted.
          getFakeInstanceData({
            name: 'NotSavedSpriteObject',
            x: 100,
            y: 200,
          }),
          // A default instance which will be removed, because the associated object is marked as persisted.
          getFakeInstanceData({
            name: 'SavedSpriteObject',
            x: 300,
            y: 400,
          }),
        ],
      });
      const runtimeGame1 = gdjs.getPixiRuntimeGame({
        layouts: [sceneData],
      });
      await runtimeGame1._resourcesLoader.loadAllResources(() => {});

      const runtimeScene1 = runtimeGame1.getSceneStack().push({
        sceneName: 'Scene1',
      });
      if (!runtimeScene1) throw new Error('No current scene was created.');

      // Create some objects in addition to initial objects at specific positions.
      const object3 = runtimeScene1.createObject('SavedSpriteObject');
      const object4 = runtimeScene1.createObject('NotSavedSpriteObject');

      if (!object3 || !object4) {
        throw new Error('Objects were not created');
      }

      object3.setX(500);
      object3.setY(600);
      object4.setX(700);
      object4.setY(800);

      // Save the game state.
      const saveState = gdjs.saveState.getGameSaveState(runtimeGame1, {
        profileNames: ['default'],
      });

      // Start a new game.
      const runtimeGame2 = gdjs.getPixiRuntimeGame({
        layouts: [sceneData],
      });
      await runtimeGame2._resourcesLoader.loadAllResources(() => {});

      // Load the saved state.
      gdjs.saveState.loadGameFromSave(runtimeGame2, saveState, {
        loadProfileNames: ['default'],
      });

      const runtimeScene2 = runtimeGame2.getSceneStack().getCurrentScene();
      if (!runtimeScene2) throw new Error('No current scene was restored.');

      // Verify objects are restored: only 2 "SavedSpriteObject" objects should exist
      // after being restored (because the initial instance should be never created,
      // and the 2 from the saved state should be created).
      const restoredSavedObjects =
        runtimeScene2.getObjects('SavedSpriteObject');
      expect(restoredSavedObjects.length).to.be(2);

      // Verify that the initial instance of "NotSavedSpriteObject" is properly created.
      const notSavedObjects = runtimeScene2.getObjects('NotSavedSpriteObject');
      expect(notSavedObjects.length).to.be(1);

      // Find objects by their positions (since IDs might be different).
      const restoredObject1 = restoredSavedObjects.find(
        (obj) => obj.getX() === 300 && obj.getY() === 400
      );
      const restoredObject2 = restoredSavedObjects.find(
        (obj) => obj.getX() === 500 && obj.getY() === 600
      );
      const notSavedObject1 = notSavedObjects.find(
        (obj) => obj.getX() === 100 && obj.getY() === 200
      );

      if (!restoredObject1 || !restoredObject2 || !notSavedObject1) {
        throw new Error(
          'Objects not found at the proper positions after restore.'
        );
      }

      expect(restoredObject1.getName()).to.be('SavedSpriteObject');
      expect(restoredObject2.getName()).to.be('SavedSpriteObject');
      expect(notSavedObject1.getName()).to.be('NotSavedSpriteObject');
    });
  });

  describe('Save State restored without clearing the running scenes', () => {
    it('saves and restores the same running game (keep instances, keep variables)', async () => {
      // Start a game.
      const sceneData = getFakeSceneData({
        name: 'Scene1',
        objects: [
          {
            type: 'Sprite',
            name: 'NotSavedSpriteObject',
            behaviors: [
              {
                name: 'SaveConfiguration',
                type: 'SaveState::SaveConfiguration',
                defaultProfilePersistence: 'DoNotSave',
              },
            ],
            effects: [],
            variables: [],

            updateIfNotVisible: false,
            animations: [],
          },
          {
            type: 'Sprite',
            name: 'SavedSpriteObject',
            behaviors: [
              {
                name: 'SaveConfiguration',
                type: 'SaveState::SaveConfiguration',
                defaultProfilePersistence: 'Persisted',
              },
            ],
            effects: [],
            variables: [],

            updateIfNotVisible: false,
            animations: [],
          },
        ],
        instances: [
          // A default instance which will be not removed, because the associated object is marked as not persisted.
          getFakeInstanceData({
            name: 'NotSavedSpriteObject',
            x: 100,
            y: 200,
          }),
          // A default instance which will be removed, because the associated object is marked as persisted.
          getFakeInstanceData({
            name: 'SavedSpriteObject',
            x: 300,
            y: 400,
          }),
        ],
      });
      const runtimeGame1 = gdjs.getPixiRuntimeGame({
        layouts: [sceneData],
      });
      await runtimeGame1._resourcesLoader.loadAllResources(() => {});

      const runtimeScene1 = runtimeGame1.getSceneStack().push({
        sceneName: 'Scene1',
      });
      if (!runtimeScene1) throw new Error('No current scene was created.');

      // Set some variables.
      const variable1 = new gdjs.Variable();
      variable1.setString('TestValue');
      runtimeScene1.getVariables().add('Variable1', variable1);
      const variable2 = new gdjs.Variable();
      variable2.setBoolean(true);
      runtimeScene1.getVariables().add('Variable2', variable2);
      const variable3 = new gdjs.Variable();
      variable3.setNumber(42);
      runtimeScene1.getVariables().add('Variable3', variable3);

      gdjs.saveState.excludeVariableFromSaveState(
        runtimeScene1,
        variable3,
        true
      );

      // Create some objects in addition to initial objects at specific positions.
      const object3 = runtimeScene1.createObject('SavedSpriteObject');
      const object4 = runtimeScene1.createObject('NotSavedSpriteObject');
      const object5 = runtimeScene1.createObject('SavedSpriteObject');

      if (!object3 || !object4 || !object5) {
        throw new Error('Objects were not created');
      }

      object3.setX(500);
      object3.setY(600);
      object4.setX(700);
      object4.setY(800);
      object5.setX(900);
      object5.setY(1000);

      // Save the game state.
      const saveState = gdjs.saveState.getGameSaveState(runtimeGame1, {
        profileNames: ['default'],
      });

      // Now, modify the game.

      // Modify the variables.
      variable1.setString('TestValue2');
      variable2.setBoolean(false);
      variable3.setNumber(43);

      // Move instances (both saved/unsaved, and created dynamically or from initial instances),
      // to then verify that they are restored at the proper positions (only for the saved ones).
      const object1 = runtimeScene1.getObjects('NotSavedSpriteObject')[0];
      const object2 = runtimeScene1.getObjects('SavedSpriteObject')[0];
      if (!object1 || !object2) {
        throw new Error('Objects created from initial instances not found.');
      }
      object1.setX(101);
      object1.setY(201);
      object2.setX(301);
      object2.setY(401);
      object3.setX(502);
      object3.setY(602);
      object4.setX(701);
      object4.setY(801);

      // Delete an instance (that was saved and should be restored).
      object5.deleteFromScene();

      // Create new instances (the saved ones should be removed after restoring the save state).
      const object6 = runtimeScene1.createObject('SavedSpriteObject');
      if (!object6) throw new Error('Object not created.');
      object6.setX(1100);
      object6.setY(1200);
      const object7 = runtimeScene1.createObject('NotSavedSpriteObject');
      if (!object7) throw new Error('Object not created.');
      object7.setX(1300);
      object7.setY(1400);
      const object8 = runtimeScene1.createObject('SavedSpriteObject');
      if (!object8) throw new Error('Object not created.');
      object8.setX(1500);
      object8.setY(1600);

      // Render a frame to be sure the deleted object is removed.
      runtimeScene1.renderAndStep(1000 / 60);

      // Load the saved state on the same game.
      gdjs.saveState.loadGameFromSave(runtimeGame1, saveState, {
        loadProfileNames: ['default'],
        clearSceneStack: false,
      });

      const restoredSavedObjects =
        runtimeScene1.getObjects('SavedSpriteObject');

      expect(
        restoredSavedObjects.map((obj) => ({
          x: obj.getX(),
          y: obj.getY(),
          name: obj.getName(),
        }))
      ).to.eql([
        // The initial instance should be restored ("object2").
        { x: 300, y: 400, name: 'SavedSpriteObject' },
        // The instance created dynamically before the save should be restored ("object3").
        { x: 500, y: 600, name: 'SavedSpriteObject' },
        // "object5", which was deleted after the save, should be restored.
        { x: 900, y: 1000, name: 'SavedSpriteObject' },
        // "object6", which was created dynamically after the save, must have been removed.
      ]);

      const restoredNotSavedObjects = runtimeScene1.getObjects(
        'NotSavedSpriteObject'
      );

      expect(
        restoredNotSavedObjects.map((obj) => ({
          x: obj.getX(),
          y: obj.getY(),
          name: obj.getName(),
        }))
      ).to.eql([
        // The initial instance should be unchanged ("object1").
        { x: 101, y: 201, name: 'NotSavedSpriteObject' },
        // "object4", which was created dynamically before the save, should be unchanged.
        { x: 701, y: 801, name: 'NotSavedSpriteObject' },
        // "object7", which was created dynamically after the save, should be unchanged.
        { x: 1300, y: 1400, name: 'NotSavedSpriteObject' },
      ]);

      // Check variables were restored, and the excluded one was not.
      expect(runtimeScene1.getVariables().get('Variable1').getAsString()).to.be(
        'TestValue'
      ); // Restored
      expect(
        runtimeScene1.getVariables().get('Variable2').getAsBoolean()
      ).to.be(true); // Restored
      expect(runtimeScene1.getVariables().get('Variable3').getAsNumber()).to.be(
        43
      ); // Unchanged
    });

    it('saves and restores the same running game (keep the scene stack)', async () => {
      // TODO
    });
  });

  describe('Save State restored with specified profile(s)', () => {
    it('saves and restores the same running game (only objects in the specified profiles)', async () => {
      // TODO
    });
  });
});
