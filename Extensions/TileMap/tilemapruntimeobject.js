/**
 * Displays a tilemap (mapeditor.org supported).
 * @memberof gdjs
 * @class TileMapRuntimeObject
 * @extends RuntimeObject
 */
gdjs.TileMapRuntimeObject = function(runtimeScene, objectData) {
  gdjs.RuntimeObject.call(this, runtimeScene, objectData);
  this._frameElapsedTime = 0;

  /** @type {number} */
  this._opacity = objectData.content.opacity;
  /** @type {string} */
  this._tilemapJsonFile = objectData.content.tilemapJsonFile;
  /** @type {string} */
  this._tilemapAtlasImage = objectData.content.tilemapAtlasImage;
  /** @type {string} */
  this._displayMode = objectData.content.displayMode;
  /** @type {number} */
  this._layerIndex = objectData.content.layerIndex;
  /** @type {number} */
  this._animationSpeedScale = objectData.content.animationSpeedScale;
  /** @type {number} */
  this._animationFps = objectData.content.animationFps;

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

gdjs.TileMapRuntimeObject.prototype.update = function(runtimeScene) {
  if (this._animationSpeedScale <= 0 || this._animationFps === 0) return;
  var elapsedTime = this.getElapsedTime(runtimeScene) / 1000; 
  
  this._frameElapsedTime += elapsedTime * this._animationSpeedScale; 
  while (this._frameElapsedTime > 1 / this._animationFps) {
    this._renderer.incrementAnimationFrameX();
    this._frameElapsedTime -= 1 / this._animationFps;
  }
  
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
  if (
    oldObjectData.content.tilemapJsonFile !==
    newObjectData.content.tilemapJsonFile
  ) {
    this.setTilemapJsonFile(newObjectData.content.tilemapJsonFile);
  }
  if (
    oldObjectData.content.tilemapAtlasImage !==
    newObjectData.content.tilemapAtlasImage
  ) {
    this.setTilemapAtlasImage(newObjectData.content.tilemapAtlasImage);
  }
  if (oldObjectData.content.displayMode !== newObjectData.content.displayMode) {
    this.setDisplayMode(newObjectData.content.displayMode);
  }
  if (oldObjectData.content.layerIndex !== newObjectData.content.layerIndex) {
    this.setLayerIndex(newObjectData.content.layerIndex);
  }
  if (
    oldObjectData.content.animationSpeedScale !==
    newObjectData.content.animationSpeedScale
  ) {
    this.setAnimationSpeed(newObjectData.content.animationSpeedScale);
  }
  if (
    oldObjectData.content.animationFps !== newObjectData.content.animationFps
  ) {
    this.setAnimationFps(newObjectData.content.animationFps);
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
    this.setWidth(initialInstanceData.width);
    this.setHeight(initialInstanceData.height);
  }
};

/**
 * Set the Tilemap json file to display.
 */
gdjs.TileMapRuntimeObject.prototype.setTilemapJsonFile = function(tilemapJsonFile) {
  this._tilemapJsonFile = tilemapJsonFile;
  this._renderer.updateTileMap();
};

gdjs.TileMapRuntimeObject.prototype.getTilemapJsonFile = function() {
  return this._tilemapJsonFile;
};

gdjs.TileMapRuntimeObject.prototype.isTilemapJsonFileName = function(selectedTilemapJsonFile) {
  return this._tilemapJsonFile === selectedTilemapJsonFile;
};

gdjs.TileMapRuntimeObject.prototype.setDisplayMode = function(displayMode) {
  this._displayMode = displayMode;
  this._renderer.updateTileMap();
};

gdjs.TileMapRuntimeObject.prototype.getDisplayMode = function() {
  return this._displayMode;
};

gdjs.TileMapRuntimeObject.prototype.setLayerIndex = function(layerIndex) {
  this._layerIndex = layerIndex;
  this._renderer.updateTileMap();
};

gdjs.TileMapRuntimeObject.prototype.getLayerIndex = function() {
  return this._layerIndex;
};
gdjs.TileMapRuntimeObject.prototype.setAnimationSpeedScale = function(animationSpeedScale) {
  this._animationSpeedScale = animationSpeedScale;
};

gdjs.TileMapRuntimeObject.prototype.getAnimationSpeedScale = function() {
  return this._animationSpeedScale;
};

gdjs.RuntimeObject.prototype.setAnimationFps = function(animationFps) {
  this._animationFps = animationFps;
};

gdjs.RuntimeObject.prototype.getAnimationFps = function() {
  return this._animationFps;
};

gdjs.RuntimeObject.prototype.isTilemapJsonFile = function(
  selectedTilemapJsonFile
) {
  return this._tilemapJsonFile === selectedTilemapJsonFile;
};

gdjs.RuntimeObject.prototype.isTilemapJsonFile = function(
  selectedTilemapJsonFile
) {
  return this._tilemapJsonFile === selectedTilemapJsonFile;
};
gdjs.RuntimeObject.prototype.isDisplayMode = function(
  selectedDisplayMode
) {
  return this._displayMode === selectedDisplayMode;
};

/**
 * Set the width of the object.
 * @param {number} width The new width.
 */
gdjs.TileMapRuntimeObject.prototype.setWidth = function(width) {
  this._renderer.setWidth(width);
};

/**
 * Set the height of the object.
 * @param {number} height The new height.
 */
gdjs.TileMapRuntimeObject.prototype.setHeight = function(height) {
  this._renderer.setHeight(height);
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
