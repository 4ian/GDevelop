namespace gdjs {
  export namespace saveState {
    export const INDEXED_DB_NAME: string = 'gd-game-snapshot-saves';
    export const INDEXED_DB_KEY: string = 'game_save'; // TODO: use game id to change the key.
    export const INDEXED_DB_OBJECT_STORE: string = 'saves'; // TODO: should a store be used per game on the user device?

    export const saveGameSnapshot = async function (
      currentScene: RuntimeScene,
      sceneVar?: gdjs.Variable,
      storageName?: string
    ) {
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
      // TODO: Store the save creation datetime.
      if (sceneVar && sceneVar !== gdjs.VariablesContainer.badVariable) {
        sceneVar.fromJSObject(allSyncData);
      } else {
        await gdjs.saveToIndexedDB(
          INDEXED_DB_NAME,
          INDEXED_DB_OBJECT_STORE,
          storageName || INDEXED_DB_KEY,
          allSyncData
        );
      }
    };

    export const loadGameFromSnapshot = async function (
      currentScene: RuntimeScene,
      sceneVar?: gdjs.Variable,
      storageName?: string
    ) {
      currentScene.requestLoadSnapshot({
        loadVariable:
          sceneVar && sceneVar !== gdjs.VariablesContainer.badVariable
            ? sceneVar
            : null,
        loadStorageName: storageName || INDEXED_DB_KEY,
      });
    };
  }
}
