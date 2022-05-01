/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  export namespace evtTools {
    /**
     * Tools related to window, for events generated code.
     */
    export namespace window {
      export const setMargins = function (
        runtimeScene: gdjs.RuntimeScene,
        top: number,
        right: number,
        bottom: number,
        left: number
      ) {
        runtimeScene
          .getGame()
          .getRenderer()
          .setMargins(top, right, bottom, left);
      };

      export const setFullScreen = function (
        runtimeScene: gdjs.RuntimeScene,
        enable: boolean,
        keepAspectRatio: boolean
      ) {
        runtimeScene.getGame().getRenderer().keepAspectRatio(keepAspectRatio);
        runtimeScene.getGame().getRenderer().setFullScreen(enable);
      };

      export const isFullScreen = function (
        runtimeScene: gdjs.RuntimeScene
      ): boolean {
        return runtimeScene.getGame().getRenderer().isFullScreen();
      };

      export const setWindowSize = function (
        runtimeScene: gdjs.RuntimeScene,
        width: float,
        height: float,
        updateGameResolution: boolean
      ) {
        runtimeScene.getGame().getRenderer().setWindowSize(width, height);
        if (updateGameResolution) {
          runtimeScene.getGame().setGameResolutionSize(width, height);
        }
      };

      export const centerWindow = function (runtimeScene: gdjs.RuntimeScene) {
        runtimeScene.getGame().getRenderer().centerWindow();
      };

      export const setGameResolutionSize = function (
        runtimeScene: gdjs.RuntimeScene,
        width: float,
        height: float
      ) {
        runtimeScene.getGame().setGameResolutionSize(width, height);
      };

      export const setGameResolutionResizeMode = function (
        runtimeScene: gdjs.RuntimeScene,
        resizeMode: string
      ) {
        runtimeScene.getGame().setGameResolutionResizeMode(resizeMode);
      };

      export const setAdaptGameResolutionAtRuntime = function (
        runtimeScene: gdjs.RuntimeScene,
        enable: boolean
      ) {
        runtimeScene.getGame().setAdaptGameResolutionAtRuntime(enable);
      };

      export const setWindowTitle = function (
        runtimeScene: gdjs.RuntimeScene,
        title: string
      ) {
        runtimeScene.getGame().getRenderer().setWindowTitle(title);
      };

      export const getWindowTitle = function (
        runtimeScene: gdjs.RuntimeScene
      ): string {
        return runtimeScene.getGame().getRenderer().getWindowTitle();
      };

      export const getWindowInnerWidth = function (): number {
        if (
          gdjs.RuntimeGameRenderer &&
          gdjs.RuntimeGameRenderer.getWindowInnerWidth
        ) {
          return gdjs.RuntimeGameRenderer.getWindowInnerWidth();
        }
        // @ts-ignore
        return typeof window !== 'undefined' ? window.innerWidth : 800;
      };

      export const getWindowInnerHeight = function (): number {
        if (
          gdjs.RuntimeGameRenderer &&
          gdjs.RuntimeGameRenderer.getWindowInnerHeight
        ) {
          return gdjs.RuntimeGameRenderer.getWindowInnerHeight();
        }
        // @ts-ignore
        return typeof window !== 'undefined' ? window.innerHeight : 800;
      };

      export const getGameResolutionWidth = function (
        runtimeScene: gdjs.RuntimeScene
      ): number {
        return runtimeScene.getGame().getGameResolutionWidth();
      };

      export const getGameResolutionHeight = function (
        runtimeScene: gdjs.RuntimeScene
      ): number {
        return runtimeScene.getGame().getGameResolutionHeight();
      };

      export const openURL = function (
        url: string,
        runtimeScene: gdjs.RuntimeScene
      ) {
        return runtimeScene.getGame().getRenderer().openURL(url);
      };
    }
  }
}
