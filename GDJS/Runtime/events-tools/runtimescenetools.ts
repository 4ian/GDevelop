/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  export namespace evtTools {
    export namespace runtimeScene {
      export const sceneJustBegins = function (runtimeScene) {
        return runtimeScene.getTimeManager().isFirstFrame();
      };

      export const sceneJustResumed = function (runtimeScene) {
        return runtimeScene.sceneJustResumed();
      };

      export const getSceneName = function (runtimeScene) {
        return runtimeScene.getName();
      };

      export const setBackgroundColor = function (runtimeScene, rgbColor) {
        const colors = rgbColor.split(';');
        if (colors.length < 3) {
          return;
        }
        runtimeScene.setBackgroundColor(
          parseInt(colors[0]),
          parseInt(colors[1]),
          parseInt(colors[2])
        );
      };

      export const getElapsedTimeInSeconds = function (runtimeScene) {
        return runtimeScene.getTimeManager().getElapsedTime() / 1000;
      };

      export const setTimeScale = function (runtimeScene, timeScale) {
        return runtimeScene.getTimeManager().setTimeScale(timeScale);
      };

      export const getTimeScale = function (runtimeScene) {
        return runtimeScene.getTimeManager().getTimeScale();
      };

      /**
       * Test a timer elapsed time, if the timer doesn't exist it is created.
       *
       * @deprecated prefer using getTimerElapsedTimeInSecondsOrNaN
       *
       * @param runtimeScene The scene owning the timer
       * @param timeInSeconds The time value to check in seconds
       * @param timerName The timer name
       * @return True if the timer exists and its value is greater than or equal than the given time, false otherwise
       */
      export const timerElapsedTime = function (
        runtimeScene: gdjs.RuntimeScene,
        timeInSeconds: float,
        timerName: string
      ) {
        const timeManager = runtimeScene.getTimeManager();
        if (!timeManager.hasTimer(timerName)) {
          timeManager.addTimer(timerName);
          return false;
        }
        return (
          timeManager.getTimer(timerName).getTime() / 1000 >= timeInSeconds
        );
      };

      export const timerPaused = function (runtimeScene, timerName) {
        const timeManager = runtimeScene.getTimeManager();
        if (!timeManager.hasTimer(timerName)) {
          return false;
        }
        return timeManager.getTimer(timerName).isPaused();
      };

      export const resetTimer = function (runtimeScene, timerName) {
        const timeManager = runtimeScene.getTimeManager();
        if (!timeManager.hasTimer(timerName)) {
          timeManager.addTimer(timerName);
        } else {
          timeManager.getTimer(timerName).reset();
        }
      };

      export const pauseTimer = function (runtimeScene, timerName) {
        const timeManager = runtimeScene.getTimeManager();
        if (!timeManager.hasTimer(timerName)) {
          timeManager.addTimer(timerName);
        }
        timeManager.getTimer(timerName).setPaused(true);
      };

      export const unpauseTimer = function (runtimeScene, timerName) {
        const timeManager = runtimeScene.getTimeManager();
        if (!timeManager.hasTimer(timerName)) {
          timeManager.addTimer(timerName);
        }
        return timeManager.getTimer(timerName).setPaused(false);
      };

      export const removeTimer = function (runtimeScene, timerName) {
        const timeManager = runtimeScene.getTimeManager();
        timeManager.removeTimer(timerName);
      };

      /**
       * This is used by expressions to return 0 when a timer doesn't exist,
       * because numeric expressions must always return a number.
       *
       * @param runtimeScene The scene owning the timer.
       * @param timerName The timer name.
       * @returns The timer elapsed time in seconds or 0 if the timer doesn't exist.
       */
      export const getTimerElapsedTimeInSeconds = function (
        runtimeScene: gdjs.RuntimeScene,
        timerName: string
      ) {
        const timeManager = runtimeScene.getTimeManager();
        if (!timeManager.hasTimer(timerName)) {
          return 0;
        }
        return timeManager.getTimer(timerName).getTime() / 1000;
      };

      /**
       * This is used by conditions to return false when a timer doesn't exist,
       * no matter the relational operator.
       *
       * @param runtimeScene The scene owning the timer.
       * @param timerName The timer name.
       * @returns The timer elapsed time in seconds or NaN if the timer doesn't exist.
       */
      export const getTimerElapsedTimeInSecondsOrNaN = function (
        runtimeScene: gdjs.RuntimeScene,
        timerName: string
      ) {
        const timeManager = runtimeScene.getTimeManager();
        if (!timeManager.hasTimer(timerName)) {
          return Number.NaN;
        }
        return timeManager.getTimer(timerName).getTime() / 1000;
      };

      export const getTimeFromStartInSeconds = function (
        runtimeScene: gdjs.RuntimeScene
      ) {
        return runtimeScene.getTimeManager().getTimeFromStart() / 1000;
      };

      export const getTime = function (
        runtimeScene: gdjs.RuntimeScene,
        what: string
      ) {
        if (what === 'timestamp') {
          return Date.now();
        }
        const now = new Date();
        if (what === 'hour') {
          return now.getHours();
        } else if (what === 'min') {
          return now.getMinutes();
        } else if (what === 'sec') {
          return now.getSeconds();
        } else if (what === 'mday') {
          return now.getDate();
        } else if (what === 'mon') {
          return now.getMonth();
        } else if (what === 'year') {
          //Conform to the C way of returning years.
          return now.getFullYear() - 1900;
        } else if (what === 'wday') {
          return now.getDay();
        } else if (what === 'yday') {
          const start = new Date(now.getFullYear(), 0, 0);
          const diff = now.getTime() - start.getTime();
          const oneDay = 1000 * 60 * 60 * 24;
          return Math.floor(diff / oneDay);
        }
        return 0;
      };

      export const replaceScene = function (
        runtimeScene: gdjs.RuntimeScene,
        newSceneName: string,
        clearOthers: boolean
      ) {
        if (!runtimeScene.getGame().getSceneData(newSceneName)) {
          return;
        }
        runtimeScene.requestChange(
          clearOthers
            ? gdjs.SceneChangeRequest.CLEAR_SCENES
            : gdjs.SceneChangeRequest.REPLACE_SCENE,
          newSceneName
        );
      };

      export const pushScene = function (runtimeScene, newSceneName) {
        if (!runtimeScene.getGame().getSceneData(newSceneName)) {
          return;
        }
        runtimeScene.requestChange(
          gdjs.SceneChangeRequest.PUSH_SCENE,
          newSceneName
        );
      };

      export const popScene = function (runtimeScene) {
        runtimeScene.requestChange(gdjs.SceneChangeRequest.POP_SCENE);
      };

      export const stopGame = function (runtimeScene) {
        runtimeScene.requestChange(gdjs.SceneChangeRequest.STOP_GAME);
      };

      export const createObjectsFromExternalLayout = function (
        scene: gdjs.RuntimeScene,
        externalLayout: string,
        xPos: float,
        yPos: float
      ) {
        const externalLayoutData = scene
          .getGame()
          .getExternalLayoutData(externalLayout);
        if (externalLayoutData === null) {
          return;
        }

        // trackByPersistentUuid is set to false as we don't want external layouts
        // instantiated at runtime to be hot-reloaded.
        scene.createObjectsFrom(
          externalLayoutData.instances,
          xPos,
          yPos,
          /*trackByPersistentUuid=*/
          false
        );
      };
    }
  }
}
