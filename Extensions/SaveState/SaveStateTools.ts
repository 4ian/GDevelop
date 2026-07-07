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

    // Called once the (deferred) restore has finished, so an awaitable load
    // action can resolve its task. No-op for the fire-and-forget usage.
    resolveTask?: () => void;
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

    /**
     * The format version a save is written with. Bump this (and add a migration
     * step below) whenever the stored format changes in a non-backward-compatible
     * way - this includes the shape of the inner `gameSaveState` (the network sync
     * data), not just the envelope, as that's what most often evolves over time.
     */
    export const CURRENT_SAVE_FORMAT_VERSION = 1;

    /**
     * Migration steps from one format version to the next. `migrations[v]` migrates
     * a save from version `v` to version `v + 1`. Saves written before the
     * `StoredSave` envelope existed (raw `GameSaveState`, no `formatVersion`) are
     * treated as version 0.
     */
    const migrations: Array<(save: any, name: string) => any> = [
      // 0 -> 1: wrap a legacy raw GameSaveState in the metadata envelope.
      // Timestamps are unknown for these old saves, so they default to 0.
      (raw, name) => ({
        formatVersion: 1,
        metadata: { name, savedAt: 0, updatedAt: 0 },
        gameSaveState: raw,
      }),
    ];

    /**
     * Normalize a record read from storage into an up-to-date `GameSaveState` and
     * its metadata, applying any needed format migrations. Handles both the current
     * `StoredSave` envelope and legacy raw `GameSaveState` records.
     */
    const migrateStoredSave = (
      raw: any,
      name: string
    ): {
      gameSaveState: GameSaveState;
      metadata: SaveStateMetadata;
    } | null => {
      if (!raw) return null;

      // No `formatVersion` means a legacy raw GameSaveState, i.e. version 0.
      let version =
        typeof raw.formatVersion === 'number' ? raw.formatVersion : 0;

      if (version > CURRENT_SAVE_FORMAT_VERSION) {
        // The save was written by a newer version of the game than this one.
        // We can't know how to read it for sure, but the inner data is often
        // forward-compatible, so we still try as a best effort.
        logger.warn(
          `Save "${name}" has format version ${version}, but this game supports up to ${CURRENT_SAVE_FORMAT_VERSION}. It may not load correctly.`
        );
      }

      let migrated = raw;
      while (version < CURRENT_SAVE_FORMAT_VERSION) {
        migrated = migrations[version](migrated, name);
        version++;
      }

      return {
        gameSaveState: migrated.gameSaveState,
        metadata: migrated.metadata || { name, savedAt: 0, updatedAt: 0 },
      };
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
    let deleteJustSucceeded: boolean = false;
    let deleteJustFailed: boolean = false;
    let duplicateJustSucceeded: boolean = false;
    let duplicateJustFailed: boolean = false;
    let checkJustCompleted: boolean = false;
    let listJustCompleted: boolean = false;
    let lastCheckedSaveExists: boolean = false;
    let lastCheckedSaveName: string = '';

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
    export const hasDeleteJustSucceeded = (_: RuntimeScene) => {
      return deleteJustSucceeded;
    };
    export const hasDeleteJustFailed = (_: RuntimeScene) => {
      return deleteJustFailed;
    };
    export const hasDuplicateJustSucceeded = (_: RuntimeScene) => {
      return duplicateJustSucceeded;
    };
    export const hasDuplicateJustFailed = (_: RuntimeScene) => {
      return duplicateJustFailed;
    };
    export const hasCheckJustCompleted = (_: RuntimeScene) => {
      return checkJustCompleted;
    };
    export const doesCheckedSaveExist = (_: RuntimeScene) => {
      return lastCheckedSaveExists;
    };
    export const getLastCheckedSaveName = (_: RuntimeScene) => {
      return lastCheckedSaveName;
    };
    export const hasListJustCompleted = (_: RuntimeScene) => {
      return listJustCompleted;
    };

    // Ensure that the condition "save/load just succeeded/failed" are valid only for one frame.
    gdjs.registerRuntimeScenePostEventsCallback(() => {
      saveJustSucceeded = false;
      saveJustFailed = false;
      loadJustSucceeded = false;
      loadJustFailed = false;
      deleteJustSucceeded = false;
      deleteJustFailed = false;
      duplicateJustSucceeded = false;
      duplicateJustFailed = false;
      checkJustCompleted = false;
      listJustCompleted = false;
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
        syncLinkedObjects: true,
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

    // Returns a gdjs.AsyncTask so the action can be awaited in the events sheet.
    // When not awaited, the returned task is simply ignored (fire-and-forget).
    export const createGameSaveStateInVariable = function (
      runtimeScene: RuntimeScene,
      variable: gdjs.Variable,
      commaSeparatedProfileNames: string
    ): gdjs.AsyncTask {
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
      // The work is synchronous, so the task is already resolved.
      return new gdjs.ResolveTask();
    };

    export const createGameSaveStateInStorage = function (
      runtimeScene: RuntimeScene,
      storageKey: string,
      commaSeparatedProfileNames: string
    ): gdjs.PromiseTask {
      const promise = (async () => {
        try {
          const gameSaveState = createGameSaveState(runtimeScene.getGame(), {
            profileNames: parseCommaSeparatedProfileNamesOrDefault(
              commaSeparatedProfileNames
            ),
          });
          const now = Date.now();
          const storedSave: StoredSave = {
            formatVersion: CURRENT_SAVE_FORMAT_VERSION,
            metadata: { name: storageKey, savedAt: now, updatedAt: now },
            gameSaveState,
          };
          await gdjs.indexedDb.saveToIndexedDB(
            getIndexedDbDatabaseName(),
            getIndexedDbObjectStore(),
            getIndexedDbStorageKey(storageKey),
            storedSave
          );
          markSaveJustSucceeded(runtimeScene);
        } catch (error) {
          logger.error('Error saving to IndexedDB:', error);
          markSaveJustFailed(runtimeScene);
        }
      })();
      return new gdjs.PromiseTask(promise);
    };

    const checkAndRestoreGameSaveStateAtEndOfFrame = function (
      runtimeScene: RuntimeScene
    ) {
      const runtimeGame = runtimeScene.getGame();

      if (!restoreRequestOptions) return;
      const {
        fromVariable,
        fromStorageName,
        profileNames,
        clearSceneStack,
        resolveTask,
      } = restoreRequestOptions;

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
        // Resolve the awaitable task (no-op if the action was not awaited).
        if (resolveTask) resolveTask();
      } else if (fromStorageName) {
        gdjs.indexedDb
          .loadFromIndexedDB(
            getIndexedDbDatabaseName(),
            getIndexedDbObjectStore(),
            getIndexedDbStorageKey(fromStorageName)
          )
          .then((jsonData) => {
            const migrated = migrateStoredSave(jsonData, fromStorageName);
            if (!migrated) {
              throw new Error(
                `No save state found in storage named "${fromStorageName}".`
              );
            }
            restoreGameSaveState(runtimeGame, migrated.gameSaveState, {
              profileNames,
              clearSceneStack,
            });
            markLoadJustSucceeded(runtimeScene);
          })
          .catch((error) => {
            logger.error('Error loading from IndexedDB:', error);
            markLoadJustFailed(runtimeScene);
          })
          .then(() => {
            // Resolve the awaitable task once the restore finished, whether it
            // succeeded or failed (no-op if the action was not awaited).
            if (resolveTask) resolveTask();
          });
      } else if (resolveTask) {
        // Nothing to restore, but still resolve the task if any.
        resolveTask();
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

    export const restoreGameSaveStateFromVariable = function (
      _: gdjs.RuntimeScene,
      variable: gdjs.Variable,
      commaSeparatedProfileNames: string,
      clearSceneStack: boolean
    ): gdjs.AsyncTask {
      // The information is saved, so that the restore can be done
      // at the end of the frame, and avoid possible conflicts with running
      // events. The task is resolved once that deferred restore has run.
      const task = new gdjs.ManuallyResolvableTask();
      restoreRequestOptions = {
        fromVariable: variable,
        profileNames: parseCommaSeparatedProfileNamesOrDefault(
          commaSeparatedProfileNames
        ),
        clearSceneStack,
        resolveTask: () => task.resolve(),
      };
      return task;
    };

    export const restoreGameSaveStateFromStorage = function (
      _: gdjs.RuntimeScene,
      storageName: string,
      commaSeparatedProfileNames: string,
      clearSceneStack: boolean
    ): gdjs.AsyncTask {
      // The information is saved, so that the restore can be done
      // at the end of the frame, and avoid possible conflicts with running
      // events. The task is resolved once that deferred restore has run.
      const task = new gdjs.ManuallyResolvableTask();
      restoreRequestOptions = {
        fromStorageName: storageName,
        profileNames: parseCommaSeparatedProfileNamesOrDefault(
          commaSeparatedProfileNames
        ),
        clearSceneStack,
        resolveTask: () => task.resolve(),
      };
      return task;
    };

    export const deleteSaveFromStorage = function (
      runtimeScene: RuntimeScene,
      storageKey: string
    ): gdjs.PromiseTask {
      const promise = (async () => {
        try {
          await gdjs.indexedDb.deleteFromIndexedDB(
            getIndexedDbDatabaseName(),
            getIndexedDbObjectStore(),
            getIndexedDbStorageKey(storageKey)
          );
          deleteJustSucceeded = true;
        } catch (error) {
          logger.error('Error deleting save from IndexedDB:', error);
          deleteJustFailed = true;
        }
      })();
      return new gdjs.PromiseTask(promise);
    };

    export const duplicateSaveInStorage = function (
      runtimeScene: RuntimeScene,
      sourceStorageKey: string,
      destinationStorageKey: string
    ): gdjs.PromiseTask {
      const promise = (async () => {
        try {
          const raw = await gdjs.indexedDb.loadFromIndexedDB(
            getIndexedDbDatabaseName(),
            getIndexedDbObjectStore(),
            getIndexedDbStorageKey(sourceStorageKey)
          );
          const migrated = migrateStoredSave(raw, sourceStorageKey);
          if (!migrated) {
            logger.error(
              `Cannot duplicate save: no save found named "${sourceStorageKey}".`
            );
            duplicateJustFailed = true;
            return;
          }
          const now = Date.now();
          const storedSave: StoredSave = {
            formatVersion: CURRENT_SAVE_FORMAT_VERSION,
            metadata: {
              name: destinationStorageKey,
              savedAt: migrated.metadata.savedAt || now,
              updatedAt: now,
            },
            gameSaveState: migrated.gameSaveState,
          };
          await gdjs.indexedDb.saveToIndexedDB(
            getIndexedDbDatabaseName(),
            getIndexedDbObjectStore(),
            getIndexedDbStorageKey(destinationStorageKey),
            storedSave
          );
          duplicateJustSucceeded = true;
        } catch (error) {
          logger.error('Error duplicating save in IndexedDB:', error);
          duplicateJustFailed = true;
        }
      })();
      return new gdjs.PromiseTask(promise);
    };

    export const checkSaveExistsInStorage = function (
      _: RuntimeScene,
      storageKey: string,
      resultVariable: gdjs.Variable
    ): gdjs.PromiseTask {
      const promise = (async () => {
        try {
          const exists = await gdjs.indexedDb.keyExistsInIndexedDB(
            getIndexedDbDatabaseName(),
            getIndexedDbObjectStore(),
            getIndexedDbStorageKey(storageKey)
          );
          lastCheckedSaveExists = exists;
          lastCheckedSaveName = storageKey;
          checkJustCompleted = true;
          if (resultVariable) resultVariable.setBoolean(exists);
        } catch (error) {
          logger.error('Error checking save existence in IndexedDB:', error);
          lastCheckedSaveExists = false;
          lastCheckedSaveName = storageKey;
          checkJustCompleted = true;
          if (resultVariable) resultVariable.setBoolean(false);
        }
      })();
      return new gdjs.PromiseTask(promise);
    };

    export const listSavesInVariable = function (
      _: RuntimeScene,
      resultVariable: gdjs.Variable
    ): gdjs.PromiseTask {
      const promise = (async () => {
        try {
          const all = await gdjs.indexedDb.getAllFromIndexedDB(
            getIndexedDbDatabaseName(),
            getIndexedDbObjectStore()
          );
          const prefix = getIndexedDbStorageKey('');
          const list = all
            .filter(
              ({ key }) =>
                typeof key === 'string' && (key as string).indexOf(prefix) === 0
            )
            .map(({ key, value }) => {
              const name = (key as string).substring(prefix.length);
              // Skip corrupt/unreadable records so one bad save doesn't hide all
              // the others.
              const migrated = migrateStoredSave(value, name);
              if (!migrated) return null;
              return {
                name,
                savedAt: migrated.metadata.savedAt || 0,
                updatedAt: migrated.metadata.updatedAt || 0,
              };
            })
            .filter(Boolean)
            .sort((a, b) => b!.updatedAt - a!.updatedAt);
          resultVariable.fromJSObject(list);
          listJustCompleted = true;
        } catch (error) {
          logger.error('Error listing saves from IndexedDB:', error);
          listJustCompleted = true;
        }
      })();
      return new gdjs.PromiseTask(promise);
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
