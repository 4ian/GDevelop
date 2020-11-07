// @ts-check
/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * @memberof gdjs.evtTools
 * @class camera
 * @private
 */
gdjs.evtTools.camera = gdjs.evtTools.camera || {};

/**
 * @param {gdjs.RuntimeScene} runtimeScene
 * @param {number} x
 * @param {string} layer
 * @param {number} cameraId
 */
gdjs.evtTools.camera.setCameraX = function (runtimeScene, x, layer, cameraId) {
  if (!runtimeScene.hasLayer(layer)) {
    return;
  }

  runtimeScene.getLayer(layer).setCameraX(x, cameraId);
};

/**
 * @param {gdjs.RuntimeScene} runtimeScene
 * @param {number} y
 * @param {string} layer
 * @param {number} cameraId
 */
gdjs.evtTools.camera.setCameraY = function (runtimeScene, y, layer, cameraId) {
  if (!runtimeScene.hasLayer(layer)) {
    return;
  }

  runtimeScene.getLayer(layer).setCameraY(y, cameraId);
};

/**
 * @param {gdjs.RuntimeScene} runtimeScene
 * @param {string} layer
 * @param {number} cameraId
 * @returns {number}
 */
gdjs.evtTools.camera.getCameraX = function (runtimeScene, layer, cameraId) {
  if (!runtimeScene.hasLayer(layer)) {
    return 0;
  }

  return runtimeScene.getLayer(layer).getCameraX();
};

/**
 * @param {gdjs.RuntimeScene} runtimeScene
 * @param {string} layer
 * @param {number} cameraId
 * @returns {number}
 */
gdjs.evtTools.camera.getCameraY = function (runtimeScene, layer, cameraId) {
  if (!runtimeScene.hasLayer(layer)) {
    return 0;
  }

  return runtimeScene.getLayer(layer).getCameraY();
};

/**
 * @param {gdjs.RuntimeScene} runtimeScene
 * @param {string} layer
 * @param {number} cameraId
 * @returns {number}
 */
gdjs.evtTools.camera.getCameraWidth = function (runtimeScene, layer, cameraId) {
  if (!runtimeScene.hasLayer(layer)) {
    return 0;
  }

  return runtimeScene.getLayer(layer).getCameraWidth();
};

/**
 * @param {gdjs.RuntimeScene} runtimeScene
 * @param {string} layer
 * @param {number} cameraId
 * @returns {number}
 */
gdjs.evtTools.camera.getCameraHeight = function (
  runtimeScene,
  layer,
  cameraId
) {
  if (!runtimeScene.hasLayer(layer)) {
    return 0;
  }

  return runtimeScene.getLayer(layer).getCameraHeight();
};

/**
 * @param {gdjs.RuntimeScene} runtimeScene
 * @param {string} layer
 */
gdjs.evtTools.camera.showLayer = function (runtimeScene, layer) {
  if (!runtimeScene.hasLayer(layer)) {
    return;
  }

  return runtimeScene.getLayer(layer).show(true);
};

/**
 * @param {gdjs.RuntimeScene} runtimeScene
 * @param {string} layer
 */
gdjs.evtTools.camera.hideLayer = function (runtimeScene, layer) {
  if (!runtimeScene.hasLayer(layer)) {
    return;
  }

  return runtimeScene.getLayer(layer).show(false);
};

/**
 * @param {gdjs.RuntimeScene} runtimeScene
 * @param {string} layer
 * @returns {boolean}
 */
gdjs.evtTools.camera.layerIsVisible = function (runtimeScene, layer) {
  return (
    runtimeScene.hasLayer(layer) && runtimeScene.getLayer(layer).isVisible()
  );
};

/**
 * @param {gdjs.RuntimeScene} runtimeScene
 * @param {number} rotation
 * @param {string} layer
 * @param {number} cameraId
 */
gdjs.evtTools.camera.setCameraRotation = function (
  runtimeScene,
  rotation,
  layer,
  cameraId
) {
  if (!runtimeScene.hasLayer(layer)) {
    return;
  }

  return runtimeScene.getLayer(layer).setCameraRotation(rotation, cameraId);
};

/**
 * @param {gdjs.RuntimeScene} runtimeScene
 * @param {string} layer
 * @param {number} cameraId
 * @returns {number}
 */
gdjs.evtTools.camera.getCameraRotation = function (
  runtimeScene,
  layer,
  cameraId
) {
  if (!runtimeScene.hasLayer(layer)) {
    return 0;
  }

  return runtimeScene.getLayer(layer).getCameraRotation(cameraId);
};

/**
 * @param {gdjs.RuntimeScene} runtimeScene
 * @param {number} newZoom
 * @param {string} layer
 * @param {number} cameraId
 */
gdjs.evtTools.camera.setCameraZoom = function (
  runtimeScene,
  newZoom,
  layer,
  cameraId
) {
  if (!runtimeScene.hasLayer(layer)) {
    return;
  }

  return runtimeScene.getLayer(layer).setCameraZoom(newZoom, cameraId);
};

/**
 * @param {gdjs.RuntimeScene} runtimeScene
 * @param {?gdjs.RuntimeObject} object
 * @param {boolean} anticipateMove
 * @param {string} layerName
 * @param {number} cameraId
 */
gdjs.evtTools.camera.centerCamera = function (
  runtimeScene,
  object,
  anticipateMove,
  layerName,
  cameraId
) {
  if (!runtimeScene.hasLayer(layerName) || object == null) {
    return;
  }

  var layer = runtimeScene.getLayer(layerName);
  var xOffset = 0;
  var yOffset = 0;
  if (anticipateMove && !object.hasNoForces()) {
    var objectAverageForce = object.getAverageForce();
    var elapsedTimeInSeconds = object.getElapsedTime(runtimeScene) / 1000;

    xOffset = objectAverageForce.getX() * elapsedTimeInSeconds;
    yOffset = objectAverageForce.getY() * elapsedTimeInSeconds;
  }

  layer.setCameraX(object.getDrawableX() + object.getCenterX(), cameraId);
  layer.setCameraY(object.getDrawableY() + object.getCenterY(), cameraId);
};

/**
 * @param {gdjs.RuntimeScene} runtimeScene
 * @param {?gdjs.RuntimeObject} object
 * @param {number} left
 * @param {number} top
 * @param {number} right
 * @param {number} bottom
 * @param {boolean} anticipateMove
 * @param {string} layerName
 * @param {number} cameraId
 */
gdjs.evtTools.camera.centerCameraWithinLimits = function (
  runtimeScene,
  object,
  left,
  top,
  right,
  bottom,
  anticipateMove,
  layerName,
  cameraId
) {
  if (!runtimeScene.hasLayer(layerName) || object == null) {
    return;
  }

  var layer = runtimeScene.getLayer(layerName);
  var xOffset = 0;
  var yOffset = 0;
  if (anticipateMove && !object.hasNoForces()) {
    var objectAverageForce = object.getAverageForce();
    var elapsedTimeInSeconds = object.getElapsedTime(runtimeScene) / 1000;

    xOffset = objectAverageForce.getX() * elapsedTimeInSeconds;
    yOffset = objectAverageForce.getY() * elapsedTimeInSeconds;
  }

  var newX = object.getDrawableX() + object.getCenterX() + xOffset;
  if (newX < left + layer.getCameraWidth(cameraId) / 2)
    newX = left + layer.getCameraWidth(cameraId) / 2;
  if (newX > right - layer.getCameraWidth(cameraId) / 2)
    newX = right - layer.getCameraWidth(cameraId) / 2;

  var newY = object.getDrawableY() + object.getCenterY() + yOffset;
  if (newY < top + layer.getCameraHeight(cameraId) / 2)
    newY = top + layer.getCameraHeight(cameraId) / 2;
  if (newY > bottom - layer.getCameraHeight(cameraId) / 2)
    newY = bottom - layer.getCameraHeight(cameraId) / 2;

  layer.setCameraX(newX, cameraId);
  layer.setCameraY(newY, cameraId);
};

/**
 * Update a layer effect parameter (with a number).
 * @param {gdjs.RuntimeScene} runtimeScene The scene
 * @param {string} layer The name of the layer
 * @param {string} effect The name of the effect
 * @param {string} parameter The parameter to update
 * @param {number} value The new value
 */
gdjs.evtTools.camera.setLayerEffectDoubleParameter = function (
  runtimeScene,
  layer,
  effect,
  parameter,
  value
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
 * @param {gdjs.RuntimeScene} runtimeScene The scene
 * @param {string} layer The name of the layer
 * @param {string} effect The name of the effect
 * @param {string} parameter The parameter to update
 * @param {string} value The new value
 */
gdjs.evtTools.camera.setLayerEffectStringParameter = function (
  runtimeScene,
  layer,
  effect,
  parameter,
  value
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
 * @param {gdjs.RuntimeScene} runtimeScene The scene
 * @param {string} layer The name of the layer
 * @param {string} effect The name of the effect
 * @param {string} parameter The parameter to update
 * @param {boolean} value The new value
 */
gdjs.evtTools.camera.setLayerEffectBooleanParameter = function (
  runtimeScene,
  layer,
  effect,
  parameter,
  value
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
 * @param {gdjs.RuntimeScene} runtimeScene The scene
 * @param {string} layer The name of the layer
 * @param {string} effect The name of the effect
 * @param {boolean} enabled true to enable, false to disable.
 */
gdjs.evtTools.camera.enableLayerEffect = function (
  runtimeScene,
  layer,
  effect,
  enabled
) {
  if (!runtimeScene.hasLayer(layer)) {
    return;
  }

  runtimeScene.getLayer(layer).enableEffect(effect, enabled);
};

/**
 * Check if an effect is enabled.
 * @param {gdjs.RuntimeScene} runtimeScene The scene
 * @param {string} layer The name of the layer
 * @param {string} effect The name of the effect
 * @return {boolean} true if the effect is enabled, false otherwise.
 */
gdjs.evtTools.camera.layerEffectEnabled = function (
  runtimeScene,
  layer,
  effect
) {
  if (!runtimeScene.hasLayer(layer)) {
    return true;
  }

  return runtimeScene.getLayer(layer).isEffectEnabled(effect);
};

/**
 * @param {gdjs.RuntimeScene} runtimeScene
 * @param {string} layer
 * @param {number} timeScale
 */
gdjs.evtTools.camera.setLayerTimeScale = function (
  runtimeScene,
  layer,
  timeScale
) {
  if (!runtimeScene.hasLayer(layer)) {
    return;
  }
  return runtimeScene.getLayer(layer).setTimeScale(timeScale);
};

/**
 * @param {gdjs.RuntimeScene} runtimeScene
 * @param {string} layer
 * @returns {number}
 */
gdjs.evtTools.camera.getLayerTimeScale = function (runtimeScene, layer) {
  if (!runtimeScene.hasLayer(layer)) {
    return 1;
  }
  return runtimeScene.getLayer(layer).getTimeScale();
};

/**
 * @param {gdjs.RuntimeScene} runtimeScene
 * @param {string} layer
 * @param {number} defaultZOrder
 */
gdjs.evtTools.camera.setLayerDefaultZOrder = function (
  runtimeScene,
  layer,
  defaultZOrder
) {
  if (!runtimeScene.hasLayer(layer)) {
    return;
  }
  return runtimeScene.getLayer(layer).setDefaultZOrder(defaultZOrder);
};

/**
 * @param {gdjs.RuntimeScene} runtimeScene
 * @param {string} layer
 * @returns {number}
 */
gdjs.evtTools.camera.getLayerDefaultZOrder = function (runtimeScene, layer) {
  if (!runtimeScene.hasLayer(layer)) {
    return 0;
  }
  return runtimeScene.getLayer(layer).getDefaultZOrder();
};
