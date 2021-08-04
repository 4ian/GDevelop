import type { RuntimeScene } from '..';
import { RuntimeGameRenderer } from '..';

export const setMargins = function (
  runtimeScene: RuntimeScene,
  top: number,
  right: number,
  bottom: number,
  left: number
) {
  runtimeScene.getGame().getRenderer().setMargins(top, right, bottom, left);
};

export const setFullScreen = function (
  runtimeScene: RuntimeScene,
  enable: boolean,
  keepAspectRatio: boolean
) {
  runtimeScene.getGame().getRenderer().keepAspectRatio(keepAspectRatio);
  runtimeScene.getGame().getRenderer().setFullScreen(enable);
};

export const isFullScreen = function (runtimeScene: RuntimeScene): boolean {
  return runtimeScene.getGame().getRenderer().isFullScreen();
};

export const setWindowSize = function (
  runtimeScene: RuntimeScene,
  width: float,
  height: float,
  updateGameResolution: boolean
) {
  runtimeScene.getGame().getRenderer().setWindowSize(width, height);
  if (updateGameResolution) {
    runtimeScene.getGame().setGameResolutionSize(width, height);
  }
};

export const centerWindow = function (runtimeScene: RuntimeScene) {
  runtimeScene.getGame().getRenderer().centerWindow();
};

export const setGameResolutionSize = function (
  runtimeScene: RuntimeScene,
  width: float,
  height: float
) {
  runtimeScene.getGame().setGameResolutionSize(width, height);
};

export const setGameResolutionResizeMode = function (
  runtimeScene: RuntimeScene,
  resizeMode: string
) {
  runtimeScene.getGame().setGameResolutionResizeMode(resizeMode);
};

export const setAdaptGameResolutionAtRuntime = function (
  runtimeScene: RuntimeScene,
  enable: boolean
) {
  runtimeScene.getGame().setAdaptGameResolutionAtRuntime(enable);
};

export const setWindowTitle = function (
  runtimeScene: RuntimeScene,
  title: string
) {
  runtimeScene.getGame().getRenderer().setWindowTitle(title);
};

export const getWindowTitle = function (runtimeScene: RuntimeScene): string {
  return runtimeScene.getGame().getRenderer().getWindowTitle();
};

export const getWindowInnerWidth = function (): number {
  if (RuntimeGameRenderer && RuntimeGameRenderer.getWindowInnerWidth) {
    return RuntimeGameRenderer.getWindowInnerWidth();
  }
  // @ts-ignore
  return typeof window !== 'undefined' ? window.innerWidth : 800;
};

export const getWindowInnerHeight = function (): number {
  if (RuntimeGameRenderer && RuntimeGameRenderer.getWindowInnerHeight) {
    return RuntimeGameRenderer.getWindowInnerHeight();
  }
  // @ts-ignore
  return typeof window !== 'undefined' ? window.innerHeight : 800;
};

export const getGameResolutionWidth = function (
  runtimeScene: RuntimeScene
): number {
  return runtimeScene.getGame().getGameResolutionWidth();
};

export const getGameResolutionHeight = function (
  runtimeScene: RuntimeScene
): number {
  return runtimeScene.getGame().getGameResolutionHeight();
};

export const openURL = function (url: string, runtimeScene: RuntimeScene) {
  return runtimeScene.getGame().getRenderer().openURL(url);
};
