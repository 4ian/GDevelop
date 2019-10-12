/**
 * An object displaying a BBCode formated text on the screen.
 * @memberof gdjs
 * @class BBTextRuntimeObject
 * @extends RuntimeObject
 */
gdjs.BBTextRuntimeObject = function(runtimeScene, objectData) {
  gdjs.RuntimeObject.call(this, runtimeScene, objectData);

  console.log('OBJ:', this, objectData);
  /** @type number */
  this._opacity = objectData.content.opacity;
  /** @type boolean */
  this._visible = objectData.content.visible;
  /** @type string */
  this._text = objectData.content.text;
  /** @type string */
  this._color = objectData.content.color;
  /** @type string */
  this._family = objectData.content.family;
  /** @type number */
  this._size = objectData.content.size;
  /** @type number */
  this._wrappingWidth = objectData.content.width;
  /** @type string */
  this._align = objectData.content.align;

  if (this._renderer)
    gdjs.BBTextRuntimeObjectRenderer.call(this._renderer, this, runtimeScene);
  else
    this._renderer = new gdjs.BBTextRuntimeObjectRenderer(this, runtimeScene);

  // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
  this.onCreated();
};

gdjs.BBTextRuntimeObject.prototype = Object.create(
  gdjs.RuntimeObject.prototype
);
gdjs.BBTextRuntimeObject.thisIsARuntimeObjectConstructor = 'BBText::BBText';

gdjs.BBTextRuntimeObject.prototype.getRendererObject = function() {
  return this._renderer.getRendererObject();
};

/**
 * Initialize the extra parameters that could be set for an instance.
 * @private
 */
gdjs.BBTextRuntimeObject.prototype.extraInitializationFromInitialInstance = function(
  initialInstanceData
) {
  if (initialInstanceData.customSize) {
    this.setWrappingWidth(initialInstanceData.width);
  }
};

gdjs.BBTextRuntimeObject.prototype.onDestroyFromScene = function(runtimeScene) {
  gdjs.RuntimeObject.prototype.onDestroyFromScene.call(this, runtimeScene);

  this._renderer.onDestroy();
};

gdjs.BBTextRuntimeObject.prototype.update = function(runtimeScene) {
  this._renderer.ensureUpToDate();
};

/**
 * Set BBText base style properties
 */
gdjs.BBTextRuntimeObject.prototype.setBBText = function(text) {
  this._renderer.setBBText(text);
};

gdjs.BBTextRuntimeObject.prototype.setColor = function(value) {
  this._renderer.setBaseProperty('color', value);
};

gdjs.BBTextRuntimeObject.prototype.setOpacity = function(value) {
  this._renderer.setBaseProperty('opacity', value);
};

gdjs.BBTextRuntimeObject.prototype.setFontSize = function(value) {
  this._renderer.setBaseProperty('font size', value);
};

gdjs.BBTextRuntimeObject.prototype.setFontFamily = function(value) {
  this._renderer.setBaseProperty('font family', value);
};

gdjs.BBTextRuntimeObject.prototype.setAlignment = function(value) {
  this._renderer.setBaseProperty('alignment', value);
};
/**
 * Set object position on X axis.
 * @param {number} x The new position X of the object.
 */
gdjs.BBTextRuntimeObject.prototype.setX = function(x) {
  gdjs.RuntimeObject.prototype.setX.call(this, x);
  this._renderer.updatePosition();
};

/**
 * Set object position on Y axis.
 * @param {number} y The new position Y of the object.
 */
gdjs.BBTextRuntimeObject.prototype.setY = function(y) {
  gdjs.RuntimeObject.prototype.setY.call(this, y);
  this._renderer.updatePosition();
};

/**
 * Set the angle of the object.
 * @param {number} angle The new angle of the object.
 */
gdjs.BBTextRuntimeObject.prototype.setAngle = function(angle) {
  gdjs.RuntimeObject.prototype.setAngle.call(this, angle);
  this._renderer.updateAngle();
};

/**
 * Set object opacity.
 * @param {number} opacity The new opacity of the object (0-255).
 */
gdjs.BBTextRuntimeObject.prototype.setOpacity = function(opacity) {
  this._opacity = opacity;
  this._renderer.updateOpacity();
};

/**
 * Get object opacity.
 */
gdjs.BBTextRuntimeObject.prototype.getOpacity = function() {
  return this._opacity;
};

/**
 * Set the word wrapping width for the text object.
 * @param {number} width The new width to set.
 */
gdjs.BBTextRuntimeObject.prototype.setWrappingWidth = function(width) {
  if (width <= 1) width = 1;
  this._wrappingWidth = width;
};

/**
 * Set the width.
 * @param {number} width The new width in pixels.
 */
gdjs.BBTextRuntimeObject.prototype.setWidth = function(width) {
  this._renderer.setWidth(width);
};

/**
 * Get the width of the object.
 */
gdjs.BBTextRuntimeObject.prototype.getWidth = function() {
  return this._renderer.getWidth();
};
