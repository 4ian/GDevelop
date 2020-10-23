/**
 * Displays a tiled file tilemap.
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
  this._animationSpeed = objectData.content.animationSpeed;

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
  var elapsedTime = this.getElapsedTime(runtimeScene) / 1000; 
  
  this._frameElapsedTime += elapsedTime * this._animationSpeed; 
  // 0.25 = 4 fps - todo expose fps - calculate fps like in IDE?
  if ( this._frameElapsedTime > 0.25 ) {
    this._renderer.incrementAnimationFrameX();
    this._frameElapsedTime -= 0.25;
    if ( this._frameElapsedTime < 0 ) this._frameElapsedTime = 0; 
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
    oldObjectData.content.animationSpeed !==
    newObjectData.content.animationSpeed
  ) {
    this.setAnimationSpeed(newObjectData.content.animationSpeed);
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

gdjs.TileMapRuntimeObject.prototype.onDestroyFromScene = function(
  runtimeScene
) {
  gdjs.RuntimeObject.prototype.onDestroyFromScene.call(this, runtimeScene);
};

/**
 * Set/Get TileMap base properties
 */

gdjs.RuntimeObject.prototype.setTilemapJsonFile = function(tilemapJsonFile) {
  this._tilemapJsonFile = tilemapJsonFile;
  this._renderer.updateTilemapJsonFile();
};

gdjs.RuntimeObject.prototype.getTilemapJsonFile = function() {
  return this._tilemapJsonFile;
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
gdjs.RuntimeObject.prototype.setDisplayMode = function(displayMode) {
  this._displayMode = displayMode;
  this._renderer.updateDisplayMode();
};

gdjs.RuntimeObject.prototype.getDisplayMode = function() {
  return this._displayMode;
};
gdjs.RuntimeObject.prototype.setLayerIndex = function(layerIndex) {
  this._layerIndex = layerIndex;
  this._renderer.updateLayerIndex();
};

gdjs.RuntimeObject.prototype.getLayerIndex = function() {
  return this._layerIndex;
};
gdjs.RuntimeObject.prototype.setAnimationSpeed = function(animationSpeed) {
  this._animationSpeed = animationSpeed;
  this._renderer.updateAnimationSpeed();
};

gdjs.RuntimeObject.prototype.getAnimationSpeed = function() {
  return this._animationSpeed;
};

/**
 * Set the width of the Tiled Sprite object.
 * @param {number} width The new width.
 */
gdjs.TileMapRuntimeObject.prototype.setWidth = function(width) {
  this._renderer.setWidth(width);
};

/**
 * Set the height of the Tiled Sprite object.
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
