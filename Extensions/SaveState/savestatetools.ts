namespace gdjs {
  export namespace saveState {
    export const INDEXED_DB_NAME: string = 'gameSaveDB';
    export const INDEXED_DB_KEY: string = 'game_save';
    export const INDEXED_DB_OBJECT_STORE: string = 'saves';
    export const saveWholeGame = async function (currentScene: RuntimeScene) {
      let allSyncData: GameSaveState = {
        gameNetworkSyncData: {},
        layoutNetworkSyncDatas: [],
      };
      const gameData = currentScene
        .getGame()
        .getNetworkSyncData({ forceSyncEverything: true });
      const sceneStack = currentScene.getGame()._sceneStack._stack;
      if (gameData) {
        allSyncData.gameNetworkSyncData = gameData;
      }

      if (sceneStack) {
        sceneStack.forEach((scene, index) => {
          const sceneDatas = scene.getNetworkSyncData({
            forceSyncEverything: true,
          });

          if (sceneDatas) {
            allSyncData.layoutNetworkSyncDatas[index] = {
              sceneData: {} as LayoutNetworkSyncData,
              objectDatas: {},
            };
            allSyncData.layoutNetworkSyncDatas[index].sceneData = sceneDatas;
            const sceneRuntimeObjects = scene.getAdhocListOfAllInstances();
            const syncOptions: GetNetworkSyncDataOptions = {
              forceSyncEverything: true,
            };
            for (const key in sceneRuntimeObjects) {
              if (sceneRuntimeObjects.hasOwnProperty(key)) {
                const object = sceneRuntimeObjects[key];
                const syncData = object.getNetworkSyncData(syncOptions);
                allSyncData.layoutNetworkSyncDatas[index].objectDatas[
                  object.id
                ] = syncData;
              }
            }
          }
        });
      }
      const syncDataJson = JSON.stringify(allSyncData);
      await gdjs.saveToIndexedDB(
        INDEXED_DB_NAME,
        INDEXED_DB_KEY,
        INDEXED_DB_OBJECT_STORE,
        syncDataJson
      );
    };

    export const loadWholeGame = function (currentScene: RuntimeScene) {
      currentScene.requestLoad(true);
    };
  }
}
