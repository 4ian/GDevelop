/**
 * An object displaying a BBCode formated text on the screen.
 * @memberof gdjs
 * @class BBTextRuntimeObject
 * @extends RuntimeObject
 */
gdjs.BBTextRuntimeObject = function(runtimeScene, objectData) {
  gdjs.RuntimeObject.call(this, runtimeScene, objectData);

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
    this.setWidth(initialInstanceData.width);
    this.setWrappingWidth(initialInstanceData.width);
  }
};

gdjs.BBTextRuntimeObject.prototype.onDestroyFromScene = function(runtimeScene) {
  gdjs.RuntimeObject.prototype.onDestroyFromScene.call(this, runtimeScene);

  this._renderer.onDestroy();
};

gdjs.BBTextRuntimeObject.prototype.update = function(runtimeScene) {
  if (this._renderer) this._renderer.ensureUpToDate();
};

/**
 * Set/Get BBText base style properties
 */
gdjs.BBTextRuntimeObject.prototype.setBBText = function(text) {
  this._text = text;
  this._renderer.updateText();
};

gdjs.BBTextRuntimeObject.prototype.getBBText = function(text) {
  return this._text;
};

gdjs.BBTextRuntimeObject.prototype.setColor = function(value) {
  const splitValue = value.split(';');
  const hexColor = `#${gdjs.rgbToHex(
    parseInt(splitValue[0]),
    parseInt(splitValue[1]),
    parseInt(splitValue[2])
  )}`;
  this._color = hexColor;
  this._renderer.updateColor();
  this.update();
};

gdjs.BBTextRuntimeObject.prototype.getColor = function() {
  return this._color;
};

gdjs.BBTextRuntimeObject.prototype.setFontSize = function(value) {
  this._size = `${value}px`;
  this._renderer.updateFontSize();
  this.update();
};

gdjs.BBTextRuntimeObject.prototype.getFontSize = function() {
  return this._size;
};

gdjs.BBTextRuntimeObject.prototype.setFontFamily = function(value) {
  this._family = value;
  this._renderer.updateFontFamily();
  this.update();
};

gdjs.BBTextRuntimeObject.prototype.getFontFamily = function() {
  return this._family;
};

gdjs.BBTextRuntimeObject.prototype.setAlignment = function(value) {
  this._align = value;
  this._renderer.updateAlignment();
  this.update();
};

gdjs.BBTextRuntimeObject.prototype.getAlignment = function() {
  return (this._align = value);
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
 * Set the width.
 * @param {number} width The new width in pixels.
 */
gdjs.BBTextRuntimeObject.prototype.setWrappingWidth = function(width) {
  this._wrappingWidth = width;
  this.update();
};

/**
 * Get the wrapping width of the object.
 */
gdjs.BBTextRuntimeObject.prototype.getWrappingWidth = function() {
  return this._wrappingWidth;
};

/**
 * Set the width of the video.
 * @param {number} width The new width in pixels.
 */
gdjs.BBTextRuntimeObject.prototype.setWidth = function(width) {
  this._wrappingWidth = width;
  this.update();
};

/**
 * Get the width of the object.
 */
gdjs.BBTextRuntimeObject.prototype.getWidth = function() {
  return this._renderer.getWidth();
};

/**
 * Get the height of the object.
 */
gdjs.BBTextRuntimeObject.prototype.getHeight = function() {
  return this._renderer.getHeight();
};
