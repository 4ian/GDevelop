namespace gdjs {
  const logger = new gdjs.Logger('Save State');
  const debugLogger = new gdjs.Logger('Save State - Debug');
  // Comment this to see message logs and ease debugging:
  gdjs.Logger.getDefaultConsoleLoggerOutput().discardGroup(
    'Save State - Debug'
  );

  export type LoadRequestOptions = {
    profileNames: string[];
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
      syncObjectIdentifiers: true,
      syncAllVariables: true,
      syncAllBehaviors: true,
      syncSceneTimers: true,
      syncOnceTriggers: true,
      syncSounds: true,
      syncTweens: true,
      syncLayers: true,
      syncAsyncTasks: true,
      syncSceneVisualProps: true,
      syncFullTileMaps: true,
    };

    const excludedVariables: WeakSet<Variable> = new WeakSet();
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

    gdjs.registerRuntimeScenePostEventsCallback(
      (runtimeScene: gdjs.RuntimeScene) => {
        loadGameSnapshotAtTheEndOfFrameIfAny(runtimeScene);
      }
    );

    export const createGameSaveState = (
      runtimeGame: RuntimeGame,
      options: {
        profileNames: string[];
      }
    ) => {
      const { profileNames } = options;

      const gameSaveState: GameSaveState = {
        gameNetworkSyncData: {},
        layoutNetworkSyncDatas: [],
      };

      const gameData = runtimeGame.getNetworkSyncData(getNetworkSyncOptions);
      const scenes = runtimeGame.getSceneStack().getAllScenes();
      gameSaveState.gameNetworkSyncData = gameData || {};

      scenes.forEach((scene, index) => {
        gameSaveState.layoutNetworkSyncDatas[index] = {
          sceneData: {} as LayoutNetworkSyncData,
          objectDatas: {},
        };

        // First collect all object sync data, as they may generate unique
        // identifiers like their networkId.
        for (const object of scene.getAdhocListOfAllInstances()) {
          // By default, an object which has no SaveConfiguration behavior is like
          // it has the default profile persistence set to "Persisted".
          let shouldPersist = profileNames.includes('default');

          // @ts-ignore - access to `_behaviors` is an exceptional case for the SaveConfiguration behavior.
          for (const behavior of object._behaviors) {
            if (behavior instanceof gdjs.SaveConfigurationRuntimeBehavior) {
              // This object has a SaveConfiguration behavior. Check if the configuration is set to
              // persist it in one of the given profiles.
              if (
                (profileNames.includes('default') &&
                  behavior.getDefaultProfilePersistence() === 'Persisted') ||
                profileNames.some((profileName) =>
                  // TODO: avoid do it for every single object instance?
                  behavior
                    .getPersistedInProfiles()
                    .split(',')
                    .map((profileName) => profileName.trim())
                    .includes(profileName)
                )
              ) {
                shouldPersist = true;
              } else {
                shouldPersist = false;
              }
            }
          }

          if (shouldPersist) {
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
        const gameSaveState = createGameSaveState(currentScene.getGame(), {
          profileNames: ['default'],
        });
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
        const gameSaveState = createGameSaveState(currentScene.getGame(), {
          profileNames: ['default'],
        });
        await gdjs.indexedDb.saveToIndexedDB(
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
        profileNames: ['default'],
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
        profileNames: ['default'],
      };
    };

    const loadGameSnapshotAtTheEndOfFrameIfAny = function (
      runtimeScene: RuntimeScene
    ) {
      const runtimeGame = runtimeScene.getGame();

      if (!loadRequestOptions) return;
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
        const variablePathInGame =
          gameVariables.getVariablePathInContainerByLoopingThroughAllVariables(
            optionsToApply.loadVariable
          );
        const saveState =
          optionsToApply.loadVariable.toJSObject() as GameSaveState;

        try {
          restoreGameSaveState(runtimeGame, saveState, {
            loadProfileNames: optionsToApply.profileNames,
            variableToRehydrate: optionsToApply.loadVariable,
            variablePathInScene: variablePathInScene,
            variablePathInGame: variablePathInGame,
          });
          markLoadJustSucceeded();
        } catch (error) {
          logger.error('Error loading from variable:', error);
          markLoadJustFailed();
        }
      } else if (optionsToApply.loadStorageName) {
        gdjs.indexedDb
          .loadFromIndexedDB(
            getIndexedDbDatabaseName(),
            getIndexedDbObjectStore(),
            getIndexedDbStorageKey(optionsToApply.loadStorageName)
          )
          .then((jsonData) => {
            const saveState = jsonData as GameSaveState;
            restoreGameSaveState(runtimeGame, saveState, {
              loadProfileNames: optionsToApply.profileNames,
            });
            markLoadJustSucceeded();
          })
          .catch((error) => {
            logger.error('Error loading from IndexedDB:', error);
            markLoadJustFailed();
          });
      }
    };

    const getInstanceFromNetworkId = ({
      runtimeScene,
      objectName,
      networkId,
    }: {
      runtimeScene: gdjs.RuntimeScene;
      objectName: string;
      networkId: string;
    }): gdjs.RuntimeObject | null => {
      const instances = runtimeScene.getInstancesOf(objectName);
      if (!instances) {
        // object does not exist in the scene, cannot find the instance.
        return null;
      }
      let instance =
        instances.find((instance) => instance.networkId === networkId) || null;

      // Check if there is already an instance with the given network ID.
      if (instance) {
        debugLogger.info(
          `Found instance ${networkId}, will use it for restoring.`
        );
        return instance;
      }

      // Instance not found - it must have been deleted. Create it now.
      debugLogger.info(
        `Instance ${networkId} not found, creating instance ${objectName}.`
      );
      const newInstance = runtimeScene.createObject(objectName);
      if (!newInstance) {
        // Object does not exist in the scene, cannot create the instance.
        return null;
      }

      newInstance.networkId = networkId;
      return newInstance;
    };

    export const restoreGameSaveState = (
      runtimeGame: RuntimeGame,
      saveState: GameSaveState,
      options: {
        loadProfileNames: string[];
        clearSceneStack?: boolean;
        variableToRehydrate?: gdjs.Variable;
        variablePathInScene?: string[] | null;
        variablePathInGame?: string[] | null;
      }
    ): void => {
      // Save the content of the save, as it will be erased after the load.
      const variableToRehydrateNetworkSyncData = options.variableToRehydrate
        ? options.variableToRehydrate.getNetworkSyncData(getNetworkSyncOptions)
        : null;

      const updateFromNetworkSyncDataOptions: UpdateFromNetworkSyncDataOptions =
        {
          clearSceneStack:
            options.clearSceneStack === undefined
              ? true
              : options.clearSceneStack,
          skipInstancesCreationForProfiles: options.loadProfileNames,
          preventSoundsStoppingOnStartup: true,
          clearInputs: true,
          keepControl: true,
          ignoreVariableOwnership: true,
        };

      // First update the game, which will update the variables,
      // and set the scene stack to update when ready.
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
      runtimeScenes.forEach((runtimeScene, index) => {
        const layoutSyncData = saveState.layoutNetworkSyncDatas[index];
        if (!layoutSyncData) return;

        // Create objects first, so they are available for the scene update,
        // especially so that they have a networkId defined.
        const allLoadedNetworkIds = new Set<string>();
        const objectDatas = layoutSyncData.objectDatas;
        for (const id in objectDatas) {
          const objectNetworkSyncData = objectDatas[id];
          const objectName = objectNetworkSyncData.n;
          if (!objectName) {
            logger.warn('Tried to recreate an object without a name.');
            continue;
          }

          const networkId = objectNetworkSyncData.networkId || '';
          allLoadedNetworkIds.add(networkId);

          const object = getInstanceFromNetworkId({
            runtimeScene,
            objectName: objectName,
            networkId,
          });
          if (object) {
            object.updateFromNetworkSyncData(
              objectNetworkSyncData,
              updateFromNetworkSyncDataOptions
            );
          }
        }

        // Clean instances of objects that are persisted but not in the save state
        // (i.e: those who don't have a networkId, so they have not been restored).
        const allObjectData = [];
        runtimeScene._objects.values(allObjectData);
        const allObjectNames = getObjectNamesIncludedInProfiles(
          allObjectData,
          options.loadProfileNames
        );
        for (const objectName of allObjectNames) {
          // /!\ Clone the instances to avoid it being modified while iterating through them.
          const objects = [...runtimeScene.getInstancesOf(objectName)];
          for (const object of objects) {
            // This is an object instance that is part of the object that are being restored,
            // but it has not network id (created after the save state was created) or the network
            // id is not in the save state: it's not part of the save state and must be deleted.
            if (
              !object.networkId ||
              !allLoadedNetworkIds.has(object.networkId)
            ) {
              object.deleteFromScene();
            }
          }
        }

        // Update the rest of the scene last.
        runtimeScene.updateFromNetworkSyncData(
          layoutSyncData.sceneData,
          updateFromNetworkSyncDataOptions
        );
      });

      // Finally, if the save was done in a variable,
      // rehydrate the variable where the save was done,
      // as it has been erased by the load.
      if (options && variableToRehydrateNetworkSyncData) {
        const currentScene = sceneStack.getCurrentScene();
        if (!currentScene) return;
        const sceneVariables = currentScene.getVariables();
        const gameVariables = currentScene.getGame().getVariables();
        const { variablePathInScene, variablePathInGame } = options;

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

    export const excludeVariableFromSaveState = (
      runtimeScene: gdjs.RuntimeScene,
      variable: gdjs.Variable,
      exclude: boolean
    ) => {
      if (exclude) {
        excludedVariables.add(variable);
      } else {
        excludedVariables.delete(variable);
      }
    };

    export const isVariableExcludedFromSaveState = (
      variable: gdjs.Variable
    ) => {
      return excludedVariables.has(variable);
    };

    export const getObjectNamesIncludedInProfiles = (
      allObjectData: ObjectData[],
      profileNames: string[]
    ): Set<string> => {
      const objectNames = new Set<string>();
      for (const objectData of allObjectData) {
        // By default, an object which has no SaveConfiguration behavior is like
        // it has the default profile persistence set to "Persisted".
        let includedInProfiles = profileNames.includes('default');

        for (const behaviorData of objectData.behaviors) {
          if (behaviorData.type !== 'SaveState::SaveConfiguration') continue;

          const defaultProfilePersistence =
            behaviorData.defaultProfilePersistence === 'Persisted'
              ? 'Persisted'
              : 'DoNotSave';
          const persistedInProfiles =
            typeof behaviorData.persistedInProfiles === 'string'
              ? behaviorData.persistedInProfiles
                  .split(',')
                  .map((profileName: string) => profileName.trim())
              : [];

          // This object has a SaveConfiguration behavior. Check if the configuration is set to
          // persist it in one of the given profiles.
          includedInProfiles = false;

          if (
            (profileNames.includes('default') &&
              defaultProfilePersistence === 'Persisted') ||
            profileNames.some((profileName) =>
              persistedInProfiles.includes(profileName)
            )
          ) {
            // This object must be persisted in one of the given profile.
            includedInProfiles = true;
          }
        }

        if (includedInProfiles) {
          objectNames.add(objectData.name);
        }
      }

      return objectNames;
    };
  }
}
