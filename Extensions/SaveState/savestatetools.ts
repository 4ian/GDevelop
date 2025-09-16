namespace gdjs {
  const logger = new gdjs.Logger('Save state');
  export type LoadRequestOptions = {
    loadStorageName?: string;
    loadVariable?: gdjs.Variable;
  };

  export namespace saveState {
    export const getIndexedDbDatabaseName = () => {
      const gameId = gdjs.projectData.properties.projectUuid;
      return `gdevelop-game-${gameId}`;
    };
    export const getIndexedDbObjectStore = () => {
      return `game-saves`;
    };
    export const getIndexedDbStorageKey = (key: string) => {
      return `save-${key}`;
    };

    const getNetworkSyncOptions: GetNetworkSyncDataOptions = {
      syncObjectIdentifier: true,
      syncAllVariables: true,
      syncAllBehaviors: true,
      syncSceneTimers: true,
      syncOnceTriggers: true,
      syncSounds: true,
      syncTweens: true,
      syncLayers: true,
      syncAsyncTasks: true,
      syncSceneAdditionalProps: true,
    };
    const updateFromNetworkSyncDataOptions: UpdateFromNetworkSyncDataOptions = {
      clearSceneStack: true,
      clearInputs: true,
      keepControl: true,
      ignoreVariableOwnership: true,
    };

    let lastSaveTime: number | null = null;
    let lastLoadTime: number | null = null;
    let saveJustSucceeded: boolean = false;
    let saveJustFailed: boolean = false;
    let loadJustSucceeded: boolean = false;
    let loadJustFailed: boolean = false;

    let loadRequestOptions: LoadRequestOptions | null = null;

    export const getSecondsSinceLastSave = (): number => {
      if (!lastSaveTime) return -1;
      return Math.floor((Date.now() - lastSaveTime) / 1000);
    };
    export const getSecondsSinceLastLoad = (): number => {
      if (!lastLoadTime) return -1;
      return Math.floor((Date.now() - lastLoadTime) / 1000);
    };
    export const hasSaveJustSucceeded = () => {
      return saveJustSucceeded;
    };
    export const hasLoadJustSucceeded = () => {
      return loadJustSucceeded;
    };
    export const hasSaveJustFailed = () => {
      return saveJustFailed;
    };
    export const hasLoadJustFailed = () => {
      return loadJustFailed;
    };
    export const markSaveJustSucceeded = () => {
      saveJustSucceeded = true;
      lastSaveTime = Date.now();
    };
    export const markLoadJustSucceeded = () => {
      loadJustSucceeded = true;
      lastLoadTime = Date.now();
    };
    export const markSaveJustFailed = () => {
      saveJustFailed = true;
    };
    export const markLoadJustFailed = () => {
      loadJustFailed = true;
    };

    // Ensure that the condition "save/load just succeeded/failed" are valid only for one frame.
    gdjs.registerRuntimeScenePostEventsCallback(() => {
      saveJustSucceeded = false;
      saveJustFailed = false;
      loadJustSucceeded = false;
      loadJustFailed = false;
    });

    const getGameSaveState = (runtimeScene: RuntimeScene) => {
      const gameSaveState: GameSaveState = {
        gameNetworkSyncData: {},
        layoutNetworkSyncDatas: [],
      };

      const gameData = runtimeScene
        .getGame()
        .getNetworkSyncData(getNetworkSyncOptions);
      const scenes = runtimeScene.getGame().getSceneStack().getAllScenes();
      gameSaveState.gameNetworkSyncData = gameData || {};

      scenes.forEach((scene, index) => {
        gameSaveState.layoutNetworkSyncDatas[index] = {
          sceneData: {} as LayoutNetworkSyncData,
          objectDatas: {},
        };

        // First collect all object sync data, as they may generate unique
        // identifiers like their networkId.
        const sceneRuntimeObjects = scene.getAdhocListOfAllInstances();
        for (const key in sceneRuntimeObjects) {
          if (sceneRuntimeObjects.hasOwnProperty(key)) {
            const object = sceneRuntimeObjects[key];
            const objectSyncData = object.getNetworkSyncData(
              getNetworkSyncOptions
            );
            gameSaveState.layoutNetworkSyncDatas[index].objectDatas[object.id] =
              objectSyncData;
          }
        }

        // Collect all scene data in the end.
        const sceneDatas = (scene.getNetworkSyncData(getNetworkSyncOptions) ||
          []) as LayoutNetworkSyncData;

        gameSaveState.layoutNetworkSyncDatas[index].sceneData = sceneDatas;
      });

      return gameSaveState;
    };

    export const saveVariableGameSnapshot = async function (
      currentScene: RuntimeScene,
      variable: gdjs.Variable
    ) {
      try {
        const gameSaveState = getGameSaveState(currentScene);
        variable.fromJSObject(gameSaveState);
        markSaveJustSucceeded();
      } catch (error) {
        logger.error('Error saving to variable:', error);
        markSaveJustFailed();
      }
    };

    export const saveStorageGameSnapshot = async function (
      currentScene: RuntimeScene,
      storageKey: string
    ) {
      try {
        const gameSaveState = getGameSaveState(currentScene);
        await gdjs.saveToIndexedDB(
          getIndexedDbDatabaseName(),
          getIndexedDbObjectStore(),
          getIndexedDbStorageKey(storageKey),
          gameSaveState
        );
        markSaveJustSucceeded();
      } catch (error) {
        logger.error('Error saving to IndexedDB:', error);
        markSaveJustFailed();
      }
    };

    export const loadGameFromVariableSnapshot = async function (
      variable: gdjs.Variable
    ) {
      // The information is saved, so that the load can be done
      // at the end of the frame,
      // and avoid possible conflicts with running events.
      loadRequestOptions = {
        loadVariable: variable,
      };
    };

    export const loadGameFromStorageSnapshot = async function (
      storageName: string
    ) {
      // The information is saved, so that the load can be done
      // at the end of the frame,
      // and avoid possible conflicts with running events.
      loadRequestOptions = {
        loadStorageName: storageName,
      };
    };

    export const loadGameSnapshotAtTheEndOfFrameIfAny = function (
      runtimeScene: RuntimeScene
    ): boolean {
      if (!loadRequestOptions) return false;

      const optionsToApply = loadRequestOptions;
      // Reset it so we don't load it twice.
      loadRequestOptions = null;

      if (optionsToApply.loadVariable) {
        const sceneVariables = runtimeScene.getVariables();
        const variablePathInScene =
          sceneVariables.getVariablePathInContainerByLoopingThroughAllVariables(
            optionsToApply.loadVariable
          );
        const gameVariables = runtimeScene.getGame().getVariables();
        const variablePathIngame =
          gameVariables.getVariablePathInContainerByLoopingThroughAllVariables(
            optionsToApply.loadVariable
          );
        const saveState =
          optionsToApply.loadVariable.toJSObject() as GameSaveState;

        try {
          loadGameFromSave(runtimeScene, saveState, {
            variableToRehydrate: optionsToApply.loadVariable,
            variablePathInScene: variablePathInScene,
            variablePathInGame: variablePathIngame,
          });
          markLoadJustSucceeded();
        } catch (error) {
          logger.error('Error loading from variable:', error);
          markLoadJustFailed();
        }
      } else if (optionsToApply.loadStorageName) {
        gdjs
          .loadFromIndexedDB(
            gdjs.saveState.getIndexedDbDatabaseName(),
            gdjs.saveState.getIndexedDbObjectStore(),
            gdjs.saveState.getIndexedDbStorageKey(
              optionsToApply.loadStorageName
            )
          )
          .then((jsonData) => {
            const saveState = jsonData as GameSaveState;
            loadGameFromSave(runtimeScene, saveState);
            markLoadJustSucceeded();
          })
          .catch((error) => {
            logger.error('Error loading from IndexedDB:', error);
            markLoadJustFailed();
          });
      }

      return true;
    };

    const loadGameFromSave = (
      runtimeScene: RuntimeScene,
      saveState: GameSaveState,
      saveOptions?: {
        variableToRehydrate: gdjs.Variable;
        variablePathInScene: string[] | null;
        variablePathInGame: string[] | null;
      }
    ): void => {
      // Save the content of the save, as it will be erased after the load.
      const variableToRehydrateNetworkSyncData = saveOptions
        ? saveOptions.variableToRehydrate.getNetworkSyncData(
            getNetworkSyncOptions
          )
        : null;

      // First update the game, which will update the variables,
      // and set the scene stack to update when ready.
      const runtimeGame = runtimeScene.getGame();
      runtimeGame.updateFromNetworkSyncData(
        saveState.gameNetworkSyncData,
        updateFromNetworkSyncDataOptions
      );

      // Apply the scene stack updates, as we are at the end of a frame,
      // we can safely do it.
      const sceneStack = runtimeGame.getSceneStack();
      sceneStack.applyUpdateFromNetworkSyncDataIfAny(
        updateFromNetworkSyncDataOptions
      );

      // Then get all scenes, which we assume will be the expected ones
      // after the load has been done, so we can update them,
      // and create their objects.
      const runtimeScenes = sceneStack.getAllScenes();
      runtimeScenes.forEach((scene, index) => {
        const layoutSyncData = saveState.layoutNetworkSyncDatas[index];
        if (!layoutSyncData) return;

        // Create objects first, so they are available for the scene update,
        // especially so that they have a networkId defined.
        const objectDatas = layoutSyncData.objectDatas;
        for (const id in objectDatas) {
          const objectNetworkSyncData = objectDatas[id];
          const objectName = objectNetworkSyncData.n;
          if (!objectName) {
            logger.warn('Tried to recreate an object without a name.');
            continue;
          }
          const object = scene.createObject(objectName);
          if (object) {
            object.updateFromNetworkSyncData(
              objectNetworkSyncData,
              updateFromNetworkSyncDataOptions
            );
          }
        }

        // Update the scene last.
        scene.updateFromNetworkSyncData(
          layoutSyncData.sceneData,
          updateFromNetworkSyncDataOptions
        );
      });

      // Finally, if the save was done in a variable,
      // rehydrate the variable where the save was done,
      // as it has been erased by the load.
      if (saveOptions && variableToRehydrateNetworkSyncData) {
        const currentScene = sceneStack.getCurrentScene();
        if (!currentScene) return;
        const sceneVariables = currentScene.getVariables();
        const gameVariables = currentScene.getGame().getVariables();
        const { variablePathInScene, variablePathInGame } = saveOptions;

        if (variablePathInScene && variablePathInScene.length > 0) {
          const variableName =
            variablePathInScene[variablePathInScene.length - 1];
          const variableInScene =
            sceneVariables.getVariableFromPath(variablePathInScene);
          if (variableInScene) {
            const variableNetworkSyncData: VariableNetworkSyncData = {
              name: variableName,
              ...variableToRehydrateNetworkSyncData,
            };
            variableInScene.updateFromNetworkSyncData(
              variableNetworkSyncData,
              updateFromNetworkSyncDataOptions
            );
          }
        }
        if (variablePathInGame && variablePathInGame.length > 0) {
          const variableName =
            variablePathInGame[variablePathInGame.length - 1];
          const variableInGame =
            gameVariables.getVariableFromPath(variablePathInGame);
          if (variableInGame) {
            const variableNetworkSyncData: VariableNetworkSyncData = {
              name: variableName,
              ...variableToRehydrateNetworkSyncData,
            };
            variableInGame.updateFromNetworkSyncData(
              variableNetworkSyncData,
              updateFromNetworkSyncDataOptions
            );
          }
        }
      }
    };
  }
}
