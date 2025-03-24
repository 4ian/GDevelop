namespace gdjs {
  export namespace saveState {
    const fs = require('fs');
    export const saveWholeGame = function (currentScene: RuntimeScene) {
      let allSyncData: GameSaveState = {
        gameNetworkSyncData: {},
        layoutNetworkSyncDatas: [],
      };
      const gameData = currentScene
        .getGame()
        .getNetworkSyncData({ syncEverythingForWholeGameSaveState: true });
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
            const sceneObjects = scene.getAdhocListOfAllInstances();
            for (const key in sceneObjects) {
              if (sceneObjects.hasOwnProperty(key)) {
                const object = sceneObjects[key];
                const syncData = object.getNetworkSyncData(true);
                allSyncData.layoutNetworkSyncDatas[index].objectDatas[
                  object.name
                ] = syncData;
              }
            }
          }
        });
      }
      const syncDataJson = JSON.stringify(allSyncData);
      localStorage.setItem('save', syncDataJson);
      fs.writeFile('UsersData.json', syncDataJson, (error) => {
        if (error) {
          console.error(error);
        }
      });
    };

    export const loadWholeGame = function (currentScene: RuntimeScene) {
      currentScene.requestLoad();
    };
  }
}
