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
                ] = [];
                allSyncData.layoutNetworkSyncDatas[index].objectDatas[
                  object.name
                ].push(syncData);
              }
            }
          }
        });
      }
      const syncDataJson = JSON.stringify(allSyncData);
      fs.writeFile('UsersData.json', syncDataJson, (error) => {
        if (error) {
          console.log(error);
        }
      });
      console.log(syncDataJson);
      // this.LoadWholeGame(syncDataJson);
    };

    export const loadWholeGame = function () {
      this._runtimeScene._destroy();
      const allSyncData = JSON.parse(this._allSyncData);
      const sceneStack = allSyncData[0].ss;
      console.log(sceneStack);
      let sceneIndex = 1;
      sceneStack.forEach((sceneData: any) => {
        let scene = sceneStack[sceneIndex];

        if (!scene) {
          const sceneAndExtensionData = allSyncData[sceneIndex];
          scene = new gdjs.RuntimeScene(this._runtimeScene.getGame());
          scene.loadFromScene(sceneAndExtensionData, {
            skipCreatingInstances: true,
          });
          console.log(scene);
        }
        scene.updateFromNetworkSyncData();
        const sceneObjects = scene.getAdhocListOfAllInstances();
        for (const key in sceneObjects) {
          if (sceneObjects.hasOwnProperty(key)) {
            const object = sceneObjects[key];
            const objectSyncData = sceneData.objects[key];
            if (objectSyncData) {
              object.onCreated();
              object.updateFromNetworkSyncData(objectSyncData);
            }
          }
        }

        sceneIndex++;
      });
    };
  }
}
