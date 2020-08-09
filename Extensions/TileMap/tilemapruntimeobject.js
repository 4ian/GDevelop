/**
 * Displays a tiled file tilemap.
 * @memberof gdjs
 * @class TileMapRuntimeObject
 * @extends RuntimeObject
 */
gdjs.TileMapRuntimeObject = function(runtimeScene, objectData) {
  gdjs.RuntimeObject.call(this, runtimeScene, objectData);

  /** @type {number} */
  this._opacity = objectData.content.opacity;
  /** @type {boolean} */
  this._visible = objectData.content.visible;
  /** @type {string} */
  this._tiledFile = objectData.content.tiledFile;
  /** @type {string} */
  this._tilemapAtlasImage = objectData.content.tilemapAtlasImage;
  /** @type {string} */
  this._render = objectData.content.render;
  /** @type {number} */
  this._layerIndex = objectData.content.layerIndex;

  if (this._renderer)
    gdjs.TileMapRuntimeObjectRenderer.call(this._renderer, this, runtimeScene);
  else
    this._renderer = new gdjs.TileMapRuntimeObjectRenderer(this, runtimeScene);

  // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
  this.onCreated();
};

gdjs.TileMapRuntimeObject.prototype = Object.create(
  gdjs.RuntimeObject.prototype
);
gdjs.registerObject('TileMap::TileMap', gdjs.TileMapRuntimeObject);

gdjs.TileMapRuntimeObject.prototype.getRendererObject = function() {
  return this._renderer.getRendererObject();
};

/**
 * @param { TileMapObjectDataType} oldObjectData
 * @param { TileMapObjectDataType} newObjectData
 */
gdjs.TileMapRuntimeObject.prototype.updateFromObjectData = function(
  oldObjectData,
  newObjectData
) {
  if (oldObjectData.content.opacity !== newObjectData.content.opacity) {
    this.setOpacity(newObjectData.content.opacity);
  }
  if (oldObjectData.content.visible !== newObjectData.content.visible) {
    this.hide(!newObjectData.content.visible);
  }
  if (oldObjectData.content.tiledFile !== newObjectData.content.tiledFile) {
    this.setTiledFile(newObjectData.content.tiledFile);
  }
  if (
    oldObjectData.content.tilemapAtlasImage !==
    newObjectData.content.tilemapAtlasImage
  ) {
    this.setTilemapAtlasImage(newObjectData.content.tilemapAtlasImage);
  }
  if (oldObjectData.content.render !== newObjectData.content.render) {
    this.setRender(newObjectData.content.render);
  }
  if (oldObjectData.content.layerIndex !== newObjectData.content.layerIndex) {
    this.setLayerIndex(newObjectData.content.layerIndex);
  }

  return true;
};

/**
 * Initialize the extra parameters that could be set for an instance.
 * @private
 */
gdjs.TileMapRuntimeObject.prototype.extraInitializationFromInitialInstance = function(
  initialInstanceData
) {
  if (initialInstanceData.customSize) {
  }
};

gdjs.TileMapRuntimeObject.prototype.onDestroyFromScene = function(
  runtimeScene
) {
  gdjs.RuntimeObject.prototype.onDestroyFromScene.call(this, runtimeScene);
};

/**
 * Set/Get TileMap base properties
 */

gdjs.RuntimeObject.prototype.setTiledFile = function(tiledFile) {
  this._tiledFile = tiledFile;
  this._renderer.updateTiledFile();
};

gdjs.RuntimeObject.prototype.getTiledFile = function() {
  return this._tiledFile;
};
gdjs.RuntimeObject.prototype.setTilemapAtlasImage = function(
  tilemapAtlasImage
) {
  this._tilemapAtlasImage = tilemapAtlasImage;
  this._renderer.updateTilemapAtlasImage();
};

gdjs.RuntimeObject.prototype.getTilemapAtlasImage = function() {
  return this._tilemapAtlasImage;
};
gdjs.RuntimeObject.prototype.setRender = function(render) {
  this._render = render;
  this._renderer.updateRender();
};

gdjs.RuntimeObject.prototype.getRender = function() {
  return this._render;
};
gdjs.RuntimeObject.prototype.setLayerIndex = function(layerIndex) {
  this._layerIndex = layerIndex;
  this._renderer.updateLayerIndex();
};

gdjs.RuntimeObject.prototype.getLayerIndex = function() {
  return this._layerIndex;
};
gdjs.TileMapRuntimeObject.prototype.setVisible = function(visible) {
  this._visible = visible;
  this._renderer.updateVisible();
};

gdjs.TileMapRuntimeObject.prototype.getVisible = function() {
  return this._visible;
};

/**
 * Set object position on X axis.
 * @param {number} x The new position X of the object.
 */
gdjs.TileMapRuntimeObject.prototype.setX = function(x) {
  gdjs.RuntimeObject.prototype.setX.call(this, x);
  this._renderer.updatePosition();
};

/**
 * Set object position on Y axis.
 * @param {number} y The new position Y of the object.
 */
gdjs.TileMapRuntimeObject.prototype.setY = function(y) {
  gdjs.RuntimeObject.prototype.setY.call(this, y);
  this._renderer.updatePosition();
};

/**
 * Set the angle of the object.
 * @param {number} angle The new angle of the object.
 */
gdjs.TileMapRuntimeObject.prototype.setAngle = function(angle) {
  gdjs.RuntimeObject.prototype.setAngle.call(this, angle);
  this._renderer.updateAngle();
};

/**
 * Set object opacity.
 * @param {number} opacity The new opacity of the object (0-255).
 */
gdjs.TileMapRuntimeObject.prototype.setOpacity = function(opacity) {
  this._opacity = opacity;
  this._renderer.updateOpacity();
};

/**
 * Get object opacity.
 */
gdjs.TileMapRuntimeObject.prototype.getOpacity = function() {
  return this._opacity;
};

/**
 * Get the width of the object.
 */
gdjs.TileMapRuntimeObject.prototype.getWidth = function() {
  return this._renderer.getWidth();
};

/**
 * Get the height of the object.
 */
gdjs.TileMapRuntimeObject.prototype.getHeight = function() {
  return this._renderer.getHeight();
};
