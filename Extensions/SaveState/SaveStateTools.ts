namespace gdjs {
  const logger = new gdjs.Logger('Save State');
  const debugLogger = new gdjs.Logger('Save State - Debug');
  // Comment this to see message logs and ease debugging:
  gdjs.Logger.getDefaultConsoleLoggerOutput().discardGroup(
    'Save State - Debug'
  );

  type ArbitrarySaveConfiguration = {
    defaultProfilePersistence: 'Persisted' | 'DoNotSave';
    persistedInProfiles: Set<string>;
  };

  /** @category Behaviors > Save State */
  export type RestoreRequestOptions = {
    profileNames: string[];
    clearSceneStack: boolean;

    fromStorageName?: string;
    fromVariable?: gdjs.Variable;
  };

  /** @category Behaviors > Save State */
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

    const variablesSaveConfiguration: WeakMap<
      Variable,
      ArbitrarySaveConfiguration
    > = new WeakMap();
    const runtimeSceneDataSaveConfiguration: WeakMap<
      RuntimeGame,
      Record<string, ArbitrarySaveConfiguration>
    > = new WeakMap();
    const runtimeGameDataSaveConfiguration: WeakMap<
      RuntimeGame,
      ArbitrarySaveConfiguration
    > = new WeakMap();

    export const setVariableSaveConfiguration = (
      _: gdjs.RuntimeScene,
      variable: gdjs.Variable,
      persistInDefaultProfile: boolean,
      persistedInProfilesAsString: string
    ) => {
      variablesSaveConfiguration.set(variable, {
        defaultProfilePersistence: persistInDefaultProfile
          ? 'Persisted'
          : 'DoNotSave',
        persistedInProfiles: new Set(
          parseCommaSeparatedProfileNames(persistedInProfilesAsString)
        ),
      });
    };

    export const setSceneDataSaveConfiguration = (
      runtimeScene: gdjs.RuntimeScene,
      sceneName: string,
      persistInDefaultProfile: boolean,
      persistedInProfilesAsString: string
    ) => {
      const runtimeSceneDataSaveConfigurations =
        runtimeSceneDataSaveConfiguration.get(runtimeScene.getGame()) || {};

      runtimeSceneDataSaveConfiguration.set(runtimeScene.getGame(), {
        ...runtimeSceneDataSaveConfigurations,
        [sceneName]: {
          defaultProfilePersistence: persistInDefaultProfile
            ? 'Persisted'
            : 'DoNotSave',
          persistedInProfiles: new Set(
            parseCommaSeparatedProfileNames(persistedInProfilesAsString)
          ),
        },
      });
    };

    export const setGameDataSaveConfiguration = (
      runtimeScene: gdjs.RuntimeScene,
      persistInDefaultProfile: boolean,
      persistedInProfilesAsString: string
    ) => {
      runtimeGameDataSaveConfiguration.set(runtimeScene.getGame(), {
        defaultProfilePersistence: persistInDefaultProfile
          ? 'Persisted'
          : 'DoNotSave',
        persistedInProfiles: new Set(
          parseCommaSeparatedProfileNames(persistedInProfilesAsString)
        ),
      });
    };

    const checkIfIsPersistedInProfiles = (
      profileNames: string[],
      configuration: ArbitrarySaveConfiguration | null | undefined
    ) => {
      if (profileNames.includes('default')) {
        if (
          !configuration ||
          configuration.defaultProfilePersistence === 'Persisted'
        ) {
          return true;
        }
      }

      if (configuration) {
        for (const profileName of profileNames) {
          if (configuration.persistedInProfiles.has(profileName)) {
            return true;
          }
        }
      }

      return false;
    };

    const makeIsVariableExcludedFromSaveState =
      (profileNames: string[]) => (variable: gdjs.Variable) => {
        const saveConfiguration = variablesSaveConfiguration.get(variable);
        return !checkIfIsPersistedInProfiles(
          profileNames,
          saveConfiguration || null
        );
      };

    let lastSaveTime: number | null = null;
    let lastLoadTime: number | null = null;
    let saveJustSucceeded: boolean = false;
    let saveJustFailed: boolean = false;
    let loadJustSucceeded: boolean = false;
    let loadJustFailed: boolean = false;

    let restoreRequestOptions: RestoreRequestOptions | null = null;

    export const getSecondsSinceLastSave = (_: RuntimeScene): number => {
      if (!lastSaveTime) return -1;
      return Math.floor((Date.now() - lastSaveTime) / 1000);
    };
    export const getSecondsSinceLastLoad = (_: RuntimeScene): number => {
      if (!lastLoadTime) return -1;
      return Math.floor((Date.now() - lastLoadTime) / 1000);
    };
    export const hasSaveJustSucceeded = (_: RuntimeScene) => {
      return saveJustSucceeded;
    };
    export const hasLoadJustSucceeded = (_: RuntimeScene) => {
      return loadJustSucceeded;
    };
    export const hasSaveJustFailed = (_: RuntimeScene) => {
      return saveJustFailed;
    };
    export const hasLoadJustFailed = (_: RuntimeScene) => {
      return loadJustFailed;
    };
    export const markSaveJustSucceeded = (_: RuntimeScene) => {
      saveJustSucceeded = true;
      lastSaveTime = Date.now();
    };
    export const markLoadJustSucceeded = (_: RuntimeScene) => {
      loadJustSucceeded = true;
      lastLoadTime = Date.now();
    };
    export const markSaveJustFailed = (_: RuntimeScene) => {
      saveJustFailed = true;
    };
    export const markLoadJustFailed = (_: RuntimeScene) => {
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
        checkAndRestoreGameSaveStateAtEndOfFrame(runtimeScene);
      }
    );

    /**
     * Create a Save State from the given game.
     *
     * Only objects, variables etc... tagged with at least one of the profiles
     * given in `options.profileNames` will be saved.
     */
    export const createGameSaveState = (
      runtimeGame: RuntimeGame,
      options: {
        profileNames: string[];
      }
    ) => {
      const { profileNames } = options;

      const getNetworkSyncOptions: GetNetworkSyncDataOptions = {
        syncObjectIdentifiers: true,
        shouldExcludeVariableFromData:
          makeIsVariableExcludedFromSaveState(profileNames),
        syncAllBehaviors: true,
        syncGameVariables: true,
        syncSceneTimers: true,
        syncOnceTriggers: true,
        syncSounds: true,
        syncTweens: true,
        syncLayers: true,
        syncAsyncTasks: true,
        syncSceneVisualProps: true,
        syncFullTileMaps: true,
      };

      const shouldPersistGameData = checkIfIsPersistedInProfiles(
        options.profileNames,
        runtimeGameDataSaveConfiguration.get(runtimeGame)
      );

      const gameSaveState: GameSaveState = {
        // Always persist some game data, but limit it to just the scene stack
        // if asked to not persist the game data.
        gameNetworkSyncData: runtimeGame.getNetworkSyncData({
          ...getNetworkSyncOptions,
          syncGameVariables: shouldPersistGameData,
          syncSounds: shouldPersistGameData,
        }),
        layoutNetworkSyncDatas: [],
      };

      const scenes = runtimeGame.getSceneStack().getAllScenes();
      scenes.forEach((runtimeScene, index) => {
        gameSaveState.layoutNetworkSyncDatas[index] = {
          sceneData: {} as LayoutNetworkSyncData,
          objectDatas: {},
        };

        // First collect all object sync data, as they may generate unique
        // identifiers like their networkId.
        for (const object of runtimeScene.getAdhocListOfAllInstances()) {
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

        // Collect scene data after the objects:
        const shouldPersistSceneData = checkIfIsPersistedInProfiles(
          options.profileNames,
          (runtimeSceneDataSaveConfiguration.get(runtimeGame) || {})[
            runtimeScene.getName()
          ]
        );
        if (shouldPersistSceneData) {
          const sceneData = runtimeScene.getNetworkSyncData(
            getNetworkSyncOptions
          );
          if (sceneData) {
            gameSaveState.layoutNetworkSyncDatas[index].sceneData = sceneData;
          }
        }
      });

      return gameSaveState;
    };

    export const createGameSaveStateInVariable = async function (
      runtimeScene: RuntimeScene,
      variable: gdjs.Variable,
      commaSeparatedProfileNames: string
    ) {
      try {
        const gameSaveState = createGameSaveState(runtimeScene.getGame(), {
          profileNames: parseCommaSeparatedProfileNamesOrDefault(
            commaSeparatedProfileNames
          ),
        });
        variable.fromJSObject(gameSaveState);
        markSaveJustSucceeded(runtimeScene);
      } catch (error) {
        logger.error('Error saving to variable:', error);
        markSaveJustFailed(runtimeScene);
      }
    };

    export const createGameSaveStateInStorage = async function (
      runtimeScene: RuntimeScene,
      storageKey: string,
      commaSeparatedProfileNames: string
    ) {
      try {
        const gameSaveState = createGameSaveState(runtimeScene.getGame(), {
          profileNames: parseCommaSeparatedProfileNamesOrDefault(
            commaSeparatedProfileNames
          ),
        });
        await gdjs.indexedDb.saveToIndexedDB(
          getIndexedDbDatabaseName(),
          getIndexedDbObjectStore(),
          getIndexedDbStorageKey(storageKey),
          gameSaveState
        );
        markSaveJustSucceeded(runtimeScene);
      } catch (error) {
        logger.error('Error saving to IndexedDB:', error);
        markSaveJustFailed(runtimeScene);
      }
    };

    const checkAndRestoreGameSaveStateAtEndOfFrame = function (
      runtimeScene: RuntimeScene
    ) {
      const runtimeGame = runtimeScene.getGame();

      if (!restoreRequestOptions) return;
      const { fromVariable, fromStorageName, profileNames, clearSceneStack } =
        restoreRequestOptions;

      // Reset it so we don't load it twice.
      restoreRequestOptions = null;

      if (fromVariable) {
        const saveState = fromVariable.toJSObject();

        try {
          restoreGameSaveState(runtimeGame, saveState, {
            profileNames,
            clearSceneStack,
          });
          markLoadJustSucceeded(runtimeScene);
        } catch (error) {
          logger.error('Error loading from variable:', error);
          markLoadJustFailed(runtimeScene);
        }
      } else if (fromStorageName) {
        gdjs.indexedDb
          .loadFromIndexedDB(
            getIndexedDbDatabaseName(),
            getIndexedDbObjectStore(),
            getIndexedDbStorageKey(fromStorageName)
          )
          .then((jsonData) => {
            const saveState = jsonData as GameSaveState;
            restoreGameSaveState(runtimeGame, saveState, {
              profileNames,
              clearSceneStack,
            });
            markLoadJustSucceeded(runtimeScene);
          })
          .catch((error) => {
            logger.error('Error loading from IndexedDB:', error);
            markLoadJustFailed(runtimeScene);
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

    /**
     * Restore the game using the given Save State.
     *
     * `options.profileNames` is the list of profiles to restore: only objects, variables etc... tagged with at least
     * one of these profiles will be restored (or recreated if they don't exist, or deleted if not in the save state).
     * Others will be left untouched.
     *
     * If `options.clearSceneStack` is true, all the scenes will be unloaded and re-created
     * (meaning all instances will be re-created, variables will go back to their initial values, etc...).
     * Otherwise, the existing scenes will be updated (or unloaded or created if the save state has different scenes).
     */
    export const restoreGameSaveState = (
      runtimeGame: RuntimeGame,
      saveState: GameSaveState,
      options: {
        profileNames: string[];
        clearSceneStack: boolean;
      }
    ): void => {
      const getObjectNamesToRestoreForRuntimeScene = (
        runtimeScene: RuntimeScene
      ): Set<string> => {
        const allObjectData = [];
        runtimeScene._objects.values(allObjectData);
        return getObjectNamesIncludedInProfiles(
          allObjectData,
          options.profileNames
        );
      };

      const updateFromNetworkSyncDataOptions: UpdateFromNetworkSyncDataOptions =
        {
          clearSceneStack:
            options.clearSceneStack === undefined
              ? true
              : options.clearSceneStack,
          getExcludedObjectNames: getObjectNamesToRestoreForRuntimeScene,
          preventSoundsStoppingOnStartup: true,
          clearInputs: true,
          keepControl: true,
          ignoreVariableOwnership: true,
          shouldExcludeVariableFromUpdate: makeIsVariableExcludedFromSaveState(
            options.profileNames
          ),
        };

      // First update the game, which will update the variables,
      // and set the scene stack to update when ready.
      if (saveState.gameNetworkSyncData) {
        const shouldRestoreGameData = checkIfIsPersistedInProfiles(
          options.profileNames,
          runtimeGameDataSaveConfiguration.get(runtimeGame)
        );

        runtimeGame.updateFromNetworkSyncData(
          shouldRestoreGameData
            ? saveState.gameNetworkSyncData
            : {
                // Disable game data restoration if asked to, but
                // still always keep `ss` (scene stack) restoration as it's always needed.
                ss: saveState.gameNetworkSyncData.ss,
              },
          updateFromNetworkSyncDataOptions
        );
      }

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

        // List names of objects that must be restored
        // (and only them - instances of others will be left alone).
        const objectNamesToRestore =
          getObjectNamesToRestoreForRuntimeScene(runtimeScene);

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
          if (!objectNamesToRestore.has(objectName)) {
            // Object is in the save state, but not in the profiles to restore, don't restore it.
            continue;
          }

          // Object is both in the save state and in the profiles to restore, restore it.
          // Either find the existing instance with the same networkId, or create a new one.
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

        // Clean instances of objects that are not in the profiles to restore but not in the save state
        // (i.e: those who don't have a networkId, or it's not in the save state: they must not exist).
        for (const objectName of objectNamesToRestore) {
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
        if (
          checkIfIsPersistedInProfiles(
            options.profileNames,
            (runtimeSceneDataSaveConfiguration.get(runtimeGame) || {})[
              runtimeScene.getName()
            ]
          )
        ) {
          runtimeScene.updateFromNetworkSyncData(
            layoutSyncData.sceneData,
            updateFromNetworkSyncDataOptions
          );
        }
      });
    };

    const parseCommaSeparatedProfileNames = (
      commaSeparatedProfileNames: string
    ): string[] | null => {
      if (!commaSeparatedProfileNames) return null;

      return commaSeparatedProfileNames
        .split(',')
        .map((profileName) => profileName.trim());
    };

    const parseCommaSeparatedProfileNamesOrDefault = (
      commaSeparatedProfileNames: string
    ): string[] => {
      return (
        parseCommaSeparatedProfileNames(commaSeparatedProfileNames) || [
          'default',
        ]
      );
    };

    export const restoreGameSaveStateFromVariable = async function (
      _: gdjs.RuntimeScene,
      variable: gdjs.Variable,
      commaSeparatedProfileNames: string,
      clearSceneStack: boolean
    ) {
      // The information is saved, so that the restore can be done
      // at the end of the frame,
      // and avoid possible conflicts with running events.
      restoreRequestOptions = {
        fromVariable: variable,
        profileNames: parseCommaSeparatedProfileNamesOrDefault(
          commaSeparatedProfileNames
        ),
        clearSceneStack,
      };
    };

    export const restoreGameSaveStateFromStorage = async function (
      _: gdjs.RuntimeScene,
      storageName: string,
      commaSeparatedProfileNames: string,
      clearSceneStack: boolean
    ) {
      // The information is saved, so that the restore can be done
      // at the end of the frame,
      // and avoid possible conflicts with running events.
      restoreRequestOptions = {
        fromStorageName: storageName,
        profileNames: parseCommaSeparatedProfileNamesOrDefault(
          commaSeparatedProfileNames
        ),
        clearSceneStack,
      };
    };

    /**
     * Compute, by looking at the "static" object data (i.e: in the Project Data),
     * the name of objects which must be restored, based on the given profiles.
     */
    const getObjectNamesIncludedInProfiles = (
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
