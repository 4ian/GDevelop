import type { RuntimeScene, RuntimeObject } from '..';

export const setCameraX = function (
  runtimeScene: RuntimeScene,
  x: float,
  layer: string,
  cameraId: integer
) {
  if (!runtimeScene.hasLayer(layer)) {
    return;
  }
  runtimeScene.getLayer(layer).setCameraX(x, cameraId);
};

export const setCameraY = function (
  runtimeScene: RuntimeScene,
  y: float,
  layer: string,
  cameraId: integer
) {
  if (!runtimeScene.hasLayer(layer)) {
    return;
  }
  runtimeScene.getLayer(layer).setCameraY(y, cameraId);
};

export const getCameraX = function (
  runtimeScene: RuntimeScene,
  layer: string,
  cameraId: integer
): number {
  if (!runtimeScene.hasLayer(layer)) {
    return 0;
  }
  return runtimeScene.getLayer(layer).getCameraX();
};

export const getCameraY = function (
  runtimeScene: RuntimeScene,
  layer: string,
  cameraId: integer
): number {
  if (!runtimeScene.hasLayer(layer)) {
    return 0;
  }
  return runtimeScene.getLayer(layer).getCameraY();
};

export const getCameraWidth = function (
  runtimeScene: RuntimeScene,
  layer: string,
  cameraId: integer
): number {
  if (!runtimeScene.hasLayer(layer)) {
    return 0;
  }
  return runtimeScene.getLayer(layer).getCameraWidth();
};

export const getCameraHeight = function (
  runtimeScene: RuntimeScene,
  layer: string,
  cameraId: integer
): number {
  if (!runtimeScene.hasLayer(layer)) {
    return 0;
  }
  return runtimeScene.getLayer(layer).getCameraHeight();
};

export const showLayer = function (runtimeScene: RuntimeScene, layer: string) {
  if (!runtimeScene.hasLayer(layer)) {
    return;
  }
  return runtimeScene.getLayer(layer).show(true);
};

export const hideLayer = function (runtimeScene: RuntimeScene, layer: string) {
  if (!runtimeScene.hasLayer(layer)) {
    return;
  }
  return runtimeScene.getLayer(layer).show(false);
};

export const layerIsVisible = function (
  runtimeScene: RuntimeScene,
  layer: string
): boolean {
  return (
    runtimeScene.hasLayer(layer) && runtimeScene.getLayer(layer).isVisible()
  );
};

export const setCameraRotation = function (
  runtimeScene: RuntimeScene,
  rotation: float,
  layer: string,
  cameraId: integer
) {
  if (!runtimeScene.hasLayer(layer)) {
    return;
  }
  return runtimeScene.getLayer(layer).setCameraRotation(rotation, cameraId);
};

export const getCameraRotation = function (
  runtimeScene: RuntimeScene,
  layer: string,
  cameraId: integer
): number {
  if (!runtimeScene.hasLayer(layer)) {
    return 0;
  }
  return runtimeScene.getLayer(layer).getCameraRotation(cameraId);
};

export const getCameraZoom = function (
  runtimeScene: RuntimeScene,
  layer: string,
  cameraId: integer
): number {
  if (!runtimeScene.hasLayer(layer)) {
    return 0;
  }
  return runtimeScene.getLayer(layer).getCameraZoom(cameraId);
};

export const setCameraZoom = function (
  runtimeScene: RuntimeScene,
  newZoom: float,
  layer: string,
  cameraId: integer
) {
  if (!runtimeScene.hasLayer(layer)) {
    return;
  }
  return runtimeScene.getLayer(layer).setCameraZoom(newZoom, cameraId);
};

export const centerCamera = function (
  runtimeScene: RuntimeScene,
  object: RuntimeObject | null,
  anticipateMove: boolean,
  layerName: string,
  cameraId: integer
) {
  if (!runtimeScene.hasLayer(layerName) || object == null) {
    return;
  }
  const layer = runtimeScene.getLayer(layerName);
  let xOffset = 0;
  let yOffset = 0;
  if (anticipateMove && !object.hasNoForces()) {
    const objectAverageForce = object.getAverageForce();
    const elapsedTimeInSeconds = object.getElapsedTime(runtimeScene) / 1000;
    xOffset = objectAverageForce.getX() * elapsedTimeInSeconds;
    yOffset = objectAverageForce.getY() * elapsedTimeInSeconds;
  }
  layer.setCameraX(object.getDrawableX() + object.getCenterX(), cameraId);
  layer.setCameraY(object.getDrawableY() + object.getCenterY(), cameraId);
};

export const centerCameraWithinLimits = function (
  runtimeScene: RuntimeScene,
  object: RuntimeObject | null,
  left: number,
  top: number,
  right: number,
  bottom: number,
  anticipateMove: boolean,
  layerName: string,
  cameraId: integer
) {
  if (!runtimeScene.hasLayer(layerName) || object == null) {
    return;
  }
  const layer = runtimeScene.getLayer(layerName);
  let xOffset = 0;
  let yOffset = 0;
  if (anticipateMove && !object.hasNoForces()) {
    const objectAverageForce = object.getAverageForce();
    const elapsedTimeInSeconds = object.getElapsedTime(runtimeScene) / 1000;
    xOffset = objectAverageForce.getX() * elapsedTimeInSeconds;
    yOffset = objectAverageForce.getY() * elapsedTimeInSeconds;
  }
  let newX = object.getDrawableX() + object.getCenterX() + xOffset;
  if (newX < left + layer.getCameraWidth(cameraId) / 2) {
    newX = left + layer.getCameraWidth(cameraId) / 2;
  }
  if (newX > right - layer.getCameraWidth(cameraId) / 2) {
    newX = right - layer.getCameraWidth(cameraId) / 2;
  }
  let newY = object.getDrawableY() + object.getCenterY() + yOffset;
  if (newY < top + layer.getCameraHeight(cameraId) / 2) {
    newY = top + layer.getCameraHeight(cameraId) / 2;
  }
  if (newY > bottom - layer.getCameraHeight(cameraId) / 2) {
    newY = bottom - layer.getCameraHeight(cameraId) / 2;
  }
  layer.setCameraX(newX, cameraId);
  layer.setCameraY(newY, cameraId);
};

/**
 * Update a layer effect parameter (with a number).
 * @param runtimeScene The scene
 * @param layer The name of the layer
 * @param effect The name of the effect
 * @param parameter The parameter to update
 * @param value The new value
 */
export const setLayerEffectDoubleParameter = function (
  runtimeScene: RuntimeScene,
  layer: string,
  effect: string,
  parameter: string,
  value: float
) {
  if (!runtimeScene.hasLayer(layer)) {
    return;
  }
  return runtimeScene
    .getLayer(layer)
    .setEffectDoubleParameter(effect, parameter, value);
};

/**
 * Update a layer effect parameter (with a string).
 * @param runtimeScene The scene
 * @param layer The name of the layer
 * @param effect The name of the effect
 * @param parameter The parameter to update
 * @param value The new value
 */
export const setLayerEffectStringParameter = function (
  runtimeScene: RuntimeScene,
  layer: string,
  effect: string,
  parameter: string,
  value: string
) {
  if (!runtimeScene.hasLayer(layer)) {
    return;
  }
  return runtimeScene
    .getLayer(layer)
    .setEffectStringParameter(effect, parameter, value);
};

/**
 * Enable or disable a layer effect parameter (boolean).
 * @param runtimeScene The scene
 * @param layer The name of the layer
 * @param effect The name of the effect
 * @param parameter The parameter to update
 * @param value The new value
 */
export const setLayerEffectBooleanParameter = function (
  runtimeScene: RuntimeScene,
  layer: string,
  effect: string,
  parameter: string,
  value: boolean
) {
  if (!runtimeScene.hasLayer(layer)) {
    return;
  }
  return runtimeScene
    .getLayer(layer)
    .setEffectBooleanParameter(effect, parameter, value);
};

/**
 * Enable, or disable, an effect of a layer.
 * @param runtimeScene The scene
 * @param layer The name of the layer
 * @param effect The name of the effect
 * @param enabled true to enable, false to disable.
 */
export const enableLayerEffect = function (
  runtimeScene: RuntimeScene,
  layer: string,
  effect: string,
  enabled: boolean
) {
  if (!runtimeScene.hasLayer(layer)) {
    return;
  }
  runtimeScene.getLayer(layer).enableEffect(effect, enabled);
};

/**
 * Check if an effect is enabled.
 * @param runtimeScene The scene
 * @param layer The name of the layer
 * @param effect The name of the effect
 * @return true if the effect is enabled, false otherwise.
 */
export const layerEffectEnabled = function (
  runtimeScene: RuntimeScene,
  layer: string,
  effect: string
): boolean {
  if (!runtimeScene.hasLayer(layer)) {
    return true;
  }
  return runtimeScene.getLayer(layer).isEffectEnabled(effect);
};

export const setLayerTimeScale = function (
  runtimeScene: RuntimeScene,
  layer: string,
  timeScale: float
) {
  if (!runtimeScene.hasLayer(layer)) {
    return;
  }
  return runtimeScene.getLayer(layer).setTimeScale(timeScale);
};

export const getLayerTimeScale = function (
  runtimeScene: RuntimeScene,
  layer: string
): number {
  if (!runtimeScene.hasLayer(layer)) {
    return 1;
  }
  return runtimeScene.getLayer(layer).getTimeScale();
};

export const setLayerDefaultZOrder = function (
  runtimeScene: RuntimeScene,
  layer: string,
  defaultZOrder: integer
) {
  if (!runtimeScene.hasLayer(layer)) {
    return;
  }
  return runtimeScene.getLayer(layer).setDefaultZOrder(defaultZOrder);
};

export const getLayerDefaultZOrder = function (
  runtimeScene: RuntimeScene,
  layer: string
): number {
  if (!runtimeScene.hasLayer(layer)) {
    return 0;
  }
  return runtimeScene.getLayer(layer).getDefaultZOrder();
};

/**
 * @param layerName The lighting layer with the ambient color.
 * @param rgbColor The color, in RGB format ("128;200;255").
 */
export const setLayerAmbientLightColor = function (
  runtimeScene: RuntimeScene,
  layerName: string,
  rgbColor: string
) {
  if (
    !runtimeScene.hasLayer(layerName) ||
    !runtimeScene.getLayer(layerName).isLightingLayer()
  ) {
    return;
  }
  const colors = rgbColor.split(';');
  if (colors.length < 3) {
    return;
  }
  return runtimeScene
    .getLayer(layerName)
    .setClearColor(
      parseInt(colors[0], 10),
      parseInt(colors[1], 10),
      parseInt(colors[2], 10)
    );
};
