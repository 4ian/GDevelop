/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  export namespace evtTools {
    export namespace runtimeScene {
      export const sceneJustBegins = function (
        runtimeScene: gdjs.RuntimeScene
      ) {
        return runtimeScene.getScene().getTimeManager().isFirstFrame();
      };

      export const sceneJustResumed = function (
        runtimeScene: gdjs.RuntimeScene
      ) {
        return runtimeScene.getScene().sceneJustResumed();
      };

      export const getSceneName = function (runtimeScene: gdjs.RuntimeScene) {
        return runtimeScene.getScene().getName();
      };

      export const setBackgroundColor = function (
        runtimeScene: gdjs.RuntimeScene,
        rgbColor: string
      ) {
        const colors = rgbColor.split(';');
        if (colors.length < 3) {
          return;
        }
        runtimeScene
          .getScene()
          .setBackgroundColor(
            parseInt(colors[0]),
            parseInt(colors[1]),
            parseInt(colors[2])
          );
      };

      export const getElapsedTimeInSeconds = function (
        runtimeScene: gdjs.RuntimeScene
      ) {
        return runtimeScene.getScene().getTimeManager().getElapsedTime() / 1000;
      };

      export const setTimeScale = function (
        runtimeScene: gdjs.RuntimeScene,
        timeScale: float
      ) {
        return runtimeScene.getScene().getTimeManager().setTimeScale(timeScale);
      };

      export const getTimeScale = function (runtimeScene: gdjs.RuntimeScene) {
        return runtimeScene.getScene().getTimeManager().getTimeScale();
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
        const timeManager = runtimeScene.getScene().getTimeManager();
        if (!timeManager.hasTimer(timerName)) {
          timeManager.addTimer(timerName);
          return false;
        }
        return (
          timeManager.getTimer(timerName).getTime() / 1000 >= timeInSeconds
        );
      };

      export const timerPaused = function (
        runtimeScene: gdjs.RuntimeScene,
        timerName: string
      ) {
        const timeManager = runtimeScene.getScene().getTimeManager();
        if (!timeManager.hasTimer(timerName)) {
          return false;
        }
        return timeManager.getTimer(timerName).isPaused();
      };

      export const resetTimer = function (
        runtimeScene: gdjs.RuntimeScene,
        timerName: string
      ) {
        const timeManager = runtimeScene.getScene().getTimeManager();
        if (!timeManager.hasTimer(timerName)) {
          timeManager.addTimer(timerName);
        } else {
          timeManager.getTimer(timerName).reset();
        }
      };

      export const pauseTimer = function (
        runtimeScene: gdjs.RuntimeScene,
        timerName: string
      ) {
        const timeManager = runtimeScene.getScene().getTimeManager();
        if (!timeManager.hasTimer(timerName)) {
          timeManager.addTimer(timerName);
        }
        timeManager.getTimer(timerName).setPaused(true);
      };

      export const unpauseTimer = function (
        runtimeScene: gdjs.RuntimeScene,
        timerName: string
      ) {
        const timeManager = runtimeScene.getScene().getTimeManager();
        if (!timeManager.hasTimer(timerName)) {
          timeManager.addTimer(timerName);
        }
        return timeManager.getTimer(timerName).setPaused(false);
      };

      export const removeTimer = function (
        runtimeScene: gdjs.RuntimeScene,
        timerName: string
      ) {
        const timeManager = runtimeScene.getScene().getTimeManager();
        timeManager.removeTimer(timerName);
      };

      export class WaitTask extends gdjs.AsyncTask {
        private duration: float;
        private timeElapsedOnScene = 0;

        constructor(durationInMilliseconds: float) {
          super();
          this.duration = durationInMilliseconds;
        }

        update(runtimeScene: RuntimeScene): boolean {
          this.timeElapsedOnScene += runtimeScene
            .getScene()
            .getTimeManager()
            .getElapsedTime();
          return this.timeElapsedOnScene >= this.duration;
        }
      }

      export const wait = (durationInSeconds: float): AsyncTask =>
        new WaitTask(
          durationInSeconds * 1000 /* Convert from seconds to milliseconds */
        );

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
        const timeManager = runtimeScene.getScene().getTimeManager();
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
        const timeManager = runtimeScene.getScene().getTimeManager();
        if (!timeManager.hasTimer(timerName)) {
          return Number.NaN;
        }
        return timeManager.getTimer(timerName).getTime() / 1000;
      };

      export const getTimeFromStartInSeconds = function (
        runtimeScene: gdjs.RuntimeScene
      ) {
        return (
          runtimeScene.getScene().getTimeManager().getTimeFromStart() / 1000
        );
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
        runtimeScene
          .getScene()
          .requestChange(
            clearOthers
              ? gdjs.SceneChangeRequest.CLEAR_SCENES
              : gdjs.SceneChangeRequest.REPLACE_SCENE,
            newSceneName
          );
      };

      export const pushScene = function (
        runtimeScene: gdjs.RuntimeScene,
        newSceneName: string
      ) {
        if (!runtimeScene.getGame().getSceneData(newSceneName)) {
          return;
        }
        runtimeScene
          .getScene()
          .requestChange(gdjs.SceneChangeRequest.PUSH_SCENE, newSceneName);
      };

      export const popScene = function (runtimeScene: gdjs.RuntimeScene) {
        runtimeScene
          .getScene()
          .requestChange(gdjs.SceneChangeRequest.POP_SCENE);
      };

      export const stopGame = function (runtimeScene: gdjs.RuntimeScene) {
        runtimeScene
          .getScene()
          .requestChange(gdjs.SceneChangeRequest.STOP_GAME);
      };

      export const createObjectsFromExternalLayout = function (
        scene: gdjs.RuntimeInstanceContainer,
        externalLayout: string,
        xPos: float,
        yPos: float,
        zPos: float
      ) {
        const externalLayoutData = scene
          .getGame()
          .getExternalLayoutData(externalLayout);
        if (externalLayoutData === null) {
          return;
        }

        // trackByPersistentUuid is set to false as we don't want external layouts
        // instantiated at runtime to be hot-reloaded.
        scene.getScene().createObjectsFrom(
          externalLayoutData.instances,
          xPos,
          yPos,
          /**
           * When 3D was introduced, zPos argument was added to the signature.
           * Existing calls (in JS events) to createObjectsFromExternalLayout will
           * have zPos undefined. So it is set to 0 in that case.
           */
          zPos || 0,
          /*trackByPersistentUuid=*/
          false
        );
      };

      /**
       * Check if the game has just resumed from being hidden
       */
      export const hasGameJustResumed = (
        instanceContainer: gdjs.RuntimeInstanceContainer
      ): boolean => {
        return instanceContainer.getGame().hasJustResumed();
      };

      /**
       * Check if a scene exists.
       */
      export const doesSceneExist = (
        runtimeScene: gdjs.RuntimeScene,
        sceneName: string
      ): boolean => {
        return runtimeScene.getGame().hasScene(sceneName);
      };

      /**
       * Preload a scene assets as soon as possible in background.
       */
      export const prioritizeLoadingOfScene = (
        runtimeScene: gdjs.RuntimeScene,
        sceneName: string
      ): void => {
        runtimeScene.getGame().prioritizeLoadingOfScene(sceneName);
      };

      /**
       * @return The progress of assets loading in background for a scene (between 0 and 1).
       */
      export const getSceneLoadingProgress = (
        runtimeScene: gdjs.RuntimeScene,
        sceneName: string
      ): float => {
        return runtimeScene.getGame().getSceneLoadingProgress(sceneName);
      };

      /**
       * Check if scene assets have finished to load in background.
       */
      export const areSceneAssetsLoaded = (
        runtimeScene: gdjs.RuntimeScene,
        sceneName: string
      ): boolean => {
        return runtimeScene.getGame().areSceneAssetsLoaded(sceneName);
      };
    }
  }
}
