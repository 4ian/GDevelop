namespace gdjs {
  export namespace saveState {
    export const saveWholeGame = async function (currentScene: RuntimeScene) {
      let allSyncData: GameSaveState = {
        gameNetworkSyncData: {},
        layoutNetworkSyncDatas: [],
      };
      const gameData = currentScene
        .getGame()
        .getNetworkSyncData({ syncEverythingForWholeGameSaveState: true });
      console.log(currentScene.getGame()._captureManager);
      const sceneStack = currentScene.getGame()._sceneStack._stack;
      if (gameData) {
        allSyncData.gameNetworkSyncData = gameData;
      }

      if (sceneStack) {
        sceneStack.forEach((scene, index) => {
          const sceneDatas = scene.getNetworkSyncData({
            syncEverythingForWholeGameSaveState: true,
          });
          scene._variablesByExtensionName;

          if (sceneDatas) {
            allSyncData.layoutNetworkSyncDatas[index] = {
              sceneData: {} as LayoutNetworkSyncData,
              objectDatas: {},
            };
            allSyncData.layoutNetworkSyncDatas[index].sceneData = sceneDatas;
            const sceneRuntimeObjects = scene.getAdhocListOfAllInstances();
            for (const key in sceneRuntimeObjects) {
              if (sceneRuntimeObjects.hasOwnProperty(key)) {
                const object = sceneRuntimeObjects[key];
                const syncData = object.getNetworkSyncData(true);
                allSyncData.layoutNetworkSyncDatas[index].objectDatas[
                  object.id
                ] = syncData;
              }
            }
          }
        });
      }
      const syncDataJson = JSON.stringify(allSyncData);
      await saveToIndexedDB('gameSaveDB', 'game_save', syncDataJson);
    };

    export const loadWholeGame = function (currentScene: RuntimeScene) {
      currentScene.requestLoad();
    };
  }

  async function saveToIndexedDB(
    dbName: string,
    key: string,
    data: any
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, 1);

      request.onupgradeneeded = function (event) {
        const db = request.result;
        if (!db.objectStoreNames.contains('saves')) {
          db.createObjectStore('saves');
        }
      };

      request.onsuccess = function () {
        const db = request.result;
        const tx = db.transaction('saves', 'readwrite');
        const store = tx.objectStore('saves');
        const putRequest = store.put(data, key);

        putRequest.onsuccess = function () {
          console.log('Game saved successfully in IndexedDB.');
          resolve();
        };

        putRequest.onerror = function () {
          console.error('Error saving game in IndexedDB:', putRequest.error);
          reject(putRequest.error);
        };
      };

      request.onerror = function () {
        console.error('Error opening IndexedDB:', request.error);
        reject(request.error);
      };
    });
  }
}
