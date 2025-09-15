namespace gdjs {
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

    let lastSaveTime: number | null = null;
    let lastLoadTime: number | null = null;
    let saveJustSucceeded: boolean = false;
    let saveJustFailed: boolean = false;
    let loadJustSucceeded: boolean = false;
    let loadJustFailed: boolean = false;

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
    };
    export const markLoadJustSucceeded = () => {
      loadJustSucceeded = true;
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
      const syncOptions: GetNetworkSyncDataOptions = {
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
      const gameData = runtimeScene.getGame().getNetworkSyncData(syncOptions);
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
            const objectSyncData = object.getNetworkSyncData(syncOptions);
            gameSaveState.layoutNetworkSyncDatas[index].objectDatas[object.id] =
              objectSyncData;
          }
        }

        // Collect all scene data in the end.
        const sceneDatas = (scene.getNetworkSyncData(syncOptions) ||
          []) as LayoutNetworkSyncData;

        gameSaveState.layoutNetworkSyncDatas[index].sceneData = sceneDatas;
      });

      return gameSaveState;
    };

    export const saveVariableGameSnapshot = async function (
      currentScene: RuntimeScene,
      sceneVar: gdjs.Variable
    ) {
      const gameSaveState = getGameSaveState(currentScene);
      sceneVar.fromJSObject(gameSaveState);
      lastSaveTime = Date.now();
    };

    export const saveStorageGameSnapshot = async function (
      currentScene: RuntimeScene,
      storageKey: string
    ) {
      const gameSaveState = getGameSaveState(currentScene);
      await gdjs.saveToIndexedDB(
        getIndexedDbDatabaseName(),
        getIndexedDbObjectStore(),
        getIndexedDbStorageKey(storageKey),
        gameSaveState
      );
      lastSaveTime = Date.now();
    };

    export const loadGameFromVariableSnapshot = async function (
      currentScene: RuntimeScene,
      variable: gdjs.Variable
    ) {
      currentScene.requestLoadSnapshot({
        loadVariable: variable,
      });
      lastLoadTime = Date.now();
    };

    export const loadGameFromStorageSnapshot = async function (
      currentScene: RuntimeScene,
      storageName: string
    ) {
      currentScene.requestLoadSnapshot({
        loadStorageName: storageName,
      });
      lastLoadTime = Date.now();
    };
  }
}
