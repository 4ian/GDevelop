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

    export const getSecondsSinceLastSave = (): number => {
      if (!lastSaveTime) return -1;
      return Math.floor((Date.now() - lastSaveTime) / 1000);
    };

    const getGameSaveState = (runtimeScene: RuntimeScene) => {
      const gameSaveState: GameSaveState = {
        gameNetworkSyncData: {},
        layoutNetworkSyncDatas: [],
      };
      const syncOptions: GetNetworkSyncDataOptions = {
        syncObjectName: true,
        syncAllBehaviors: true,
        syncAllVariables: true,
        syncSounds: true,
        syncSceneTimers: true,
        syncTweens: true,
        syncLayers: true,
      };
      const gameData = runtimeScene.getGame().getNetworkSyncData(syncOptions);
      const sceneStack = runtimeScene.getGame()._sceneStack._stack;
      gameSaveState.gameNetworkSyncData = gameData || {};
      sceneStack.forEach((scene, index) => {
        const sceneDatas = (scene.getNetworkSyncData(syncOptions) ||
          []) as LayoutNetworkSyncData;

        gameSaveState.layoutNetworkSyncDatas[index] = {
          sceneData: {} as LayoutNetworkSyncData,
          objectDatas: {},
        };
        gameSaveState.layoutNetworkSyncDatas[index].sceneData = sceneDatas;
        const sceneRuntimeObjects = scene.getAdhocListOfAllInstances();
        for (const key in sceneRuntimeObjects) {
          if (sceneRuntimeObjects.hasOwnProperty(key)) {
            const object = sceneRuntimeObjects[key];
            const objectSyncData = object.getNetworkSyncData(syncOptions);
            gameSaveState.layoutNetworkSyncDatas[index].objectDatas[object.id] =
              objectSyncData;
          }
        }
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
    };

    export const loadGameFromStorageSnapshot = async function (
      currentScene: RuntimeScene,
      storageName: string
    ) {
      currentScene.requestLoadSnapshot({
        loadStorageName: storageName,
      });
    };
  }
}
