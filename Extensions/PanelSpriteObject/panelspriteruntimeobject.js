/*
 *  GDevelop JS Platform
 *  2013 Florian Rival (Florian.Rival@gmail.com)
 */

/**
 * @typedef {Object} PanelSpriteObjectDataType
 * @property {number} rightMargin The right margin
 * @property {number} leftMargin The left margin
 * @property {number} topMargin The top margin
 * @property {number} bottomMargin The bottom margin
 * @property {boolean} [tiled] Are the central part and borders tiled?
 * @property {number} width The object width
 * @property {number} height The object height
 * @property {string} texture The name of the resource containing the texture to use
 * 
 * @typedef {ObjectData & PanelSpriteObjectDataType} PanelSpriteObjectData
 */

/**
 * The PanelSpriteRuntimeObject displays a tiled texture.
 *
 * @class PanelSpriteRuntimeObject
 * @extends RuntimeObject
 * @memberof gdjs
 * @param {gdjs.RuntimeScene} runtimeScene  The {@link gdjs.RuntimeScene} the object belongs to
 * @param {PanelSpriteObjectData} panelSpriteObjectData The initial properties of the object
 */
gdjs.PanelSpriteRuntimeObject = function(runtimeScene, panelSpriteObjectData) {
  gdjs.RuntimeObject.call(this, runtimeScene, panelSpriteObjectData);

  /** @type {number} */
  this._rBorder = panelSpriteObjectData.rightMargin;

  /** @type {number} */
  this._lBorder = panelSpriteObjectData.leftMargin;

  /** @type {number} */
  this._tBorder = panelSpriteObjectData.topMargin;

  /** @type {number} */
  this._bBorder = panelSpriteObjectData.bottomMargin;

  /** @type {boolean} */
  this._tiled = panelSpriteObjectData.tiled;

  /** @type {number} */
  this._width = panelSpriteObjectData.width;

  /** @type {number} */
  this._height = panelSpriteObjectData.height;

  /** @type {number} */
  this.opacity = 255;

  if (this._renderer) {
    gdjs.PanelSpriteRuntimeObjectRenderer.call(
      this._renderer,
      this,
      runtimeScene,
      panelSpriteObjectData.texture,
      panelSpriteObjectData.tiled
    );
  } else {
    /** @type {gdjs.PanelSpriteRuntimeObjectRenderer} */
    this._renderer = new gdjs.PanelSpriteRuntimeObjectRenderer(
      this,
      runtimeScene,
      panelSpriteObjectData.texture,
      panelSpriteObjectData.tiled
    );
  }

  // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
  this.onCreated();
};

gdjs.PanelSpriteRuntimeObject.prototype = Object.create(
  gdjs.RuntimeObject.prototype
);
gdjs.registerObject("PanelSpriteObject::PanelSprite", gdjs.PanelSpriteRuntimeObject);

gdjs.PanelSpriteRuntimeObject.prototype.getRendererObject = function() {
  return this._renderer.getRendererObject();
};

gdjs.PanelSpriteRuntimeObject.prototype.onDestroyFromScene = function(
  runtimeScene
) {
  gdjs.RuntimeObject.prototype.onDestroyFromScene.call(this, runtimeScene);

  if (this._renderer.onDestroy) {
    this._renderer.onDestroy();
  }
};

gdjs.PanelSpriteRuntimeObject.prototype.update = function() {
  this._renderer.ensureUpToDate();
};

/**
 * Initialize the extra parameters that could be set for an instance.
 */
gdjs.PanelSpriteRuntimeObject.prototype.extraInitializationFromInitialInstance = function(
  initialInstanceData
) {
  if (initialInstanceData.customSize) {
    this.setWidth(initialInstanceData.width);
    this.setHeight(initialInstanceData.height);
  }
};

/**
 * Set the x position of the panel sprite.
 * @param {number} x The new x position in pixels.
 */
gdjs.PanelSpriteRuntimeObject.prototype.setX = function(x) {
  gdjs.RuntimeObject.prototype.setX.call(this, x);
  this._renderer.updatePosition();
};

/**
 * Set the y position of the panel sprite.
 * @param {number} y The new y position in pixels.
 */
gdjs.PanelSpriteRuntimeObject.prototype.setY = function(y) {
  gdjs.RuntimeObject.prototype.setY.call(this, y);
  this._renderer.updatePosition();
};

/**
 * Set the texture of the panel sprite.
 * @param {string} textureName The name of the texture.
 * @param {gdjs.RuntimeScene} runtimeScene The scene the object lives in.
 */
gdjs.PanelSpriteRuntimeObject.prototype.setTexture = function(
  textureName,
  runtimeScene
) {
  this._renderer.setTexture(textureName, runtimeScene);
};

/**
 * Set the angle of the panel sprite.
 * @param {number} angle The new angle in degrees.
 */
gdjs.PanelSpriteRuntimeObject.prototype.setAngle = function(angle) {
  gdjs.RuntimeObject.prototype.setAngle.call(this, angle);
  this._renderer.updateAngle();
};

/**
 * Get the width of the panel sprite in pixels
 * @return {number} The width in pixels
 */
gdjs.PanelSpriteRuntimeObject.prototype.getWidth = function() {
  return this._width;
};

/**
 * Get the height of the panel sprite in pixels
 * @return {number} The height in pixels
 */
gdjs.PanelSpriteRuntimeObject.prototype.getHeight = function() {
  return this._height;
};

/**
 * Set the width of the panel sprite.
 * @param {number} width The new width in pixels.
 */
gdjs.PanelSpriteRuntimeObject.prototype.setWidth = function(width) {
  this._width = width;
  this._renderer.updateWidth();
};

/**
 * Set the height of the panel sprite.
 * @param {number} height The new height in pixels.
 */
gdjs.PanelSpriteRuntimeObject.prototype.setHeight = function(height) {
  this._height = height;
  this._renderer.updateHeight();
};

/**
 * Change the transparency of the object.
 * @param {number} opacity The new opacity, between 0 (transparent) and 255 (opaque).
 */
gdjs.PanelSpriteRuntimeObject.prototype.setOpacity = function(opacity) {
  if (opacity < 0) opacity = 0;
  if (opacity > 255) opacity = 255;

  this.opacity = opacity;
  this._renderer.updateOpacity();
};

/**
 * Get the transparency of the object.
 * @return {number} The opacity, between 0 (transparent) and 255 (opaque).
 */
gdjs.PanelSpriteRuntimeObject.prototype.getOpacity = function() {
  return this.opacity;
};

/**
 * Change the tint of the panel sprite object.
 *
 * @param {string} rgbColor The color, in RGB format ("128;200;255").
 */
gdjs.PanelSpriteRuntimeObject.prototype.setColor = function(rgbColor) {
  this._renderer.setColor(rgbColor);
};

/**
 * Get the tint of the panel sprite object.
 *
 * @returns {string} rgbColor The color, in RGB format ("128;200;255").
 */
gdjs.PanelSpriteRuntimeObject.prototype.getColor = function() {
  return this._renderer.getColor();
};
