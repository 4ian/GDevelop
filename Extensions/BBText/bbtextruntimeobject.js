/**
 * @typedef {Object} BBTextObjectDataType Base parameters for {@link gdjs.BBTextRuntimeObject}
 * @property {Object} content The base parameters of the BBText
 * @property {number} content.opacity The opacity of the BBText
 * @property {boolean} content.visible Is the text visible?
 * @property {string} content.text Content of the text
 * @property {string} content.color The color of the text
 * @property {string} content.fontFamily The font of the text
 * @property {number} content.fontSize The size of the text
 * @property {boolean} content.wordWrap Activate word wrap if set to true
 * @property {('left'|'center'|'right')} content.align Alignment of the text: "left", "center" or "right"
 *
 * @typedef {ObjectData & BBTextObjectDataType} BBTextObjectData
 */

/**
 * Displays a rich text using BBCode markup (allowing to set parts of the text as bold, italic, use different colors and shadows).
 * @memberof gdjs
 * @class BBTextRuntimeObject
 * @extends RuntimeObject
 * @param {gdjs.RuntimeScene} runtimeScene The {@link gdjs.RuntimeScene} the object belongs to
 * @param {BBTextObjectData} objectData The object data used to initialize the object
 */
gdjs.BBTextRuntimeObject = function(runtimeScene, objectData) {
  gdjs.RuntimeObject.call(this, runtimeScene, objectData);

  /** @type {number} */
  this._opacity = parseFloat(objectData.content.opacity);
  // parseFloat should not be required, but GDevelop 5.0 beta 92 and below were storing it as a string.
  /** @type {boolean} */
  this._visible = objectData.content.visible;
  /** @type {string} */
  this._text = objectData.content.text;
  /** @type {string} */
  this._color = objectData.content.color;
  /** @type {string} */
  this._fontFamily = objectData.content.fontFamily;
  /** @type {number} */
  this._fontSize = parseFloat(objectData.content.fontSize);
  // parseFloat should not be required, but GDevelop 5.0 beta 92 and below were storing it as a string.
  /** @type {boolean} */
  this._wordWrap = objectData.content.wordWrap;
  /** @type {number} */
  this._wrappingWidth = 250; // This value is the default wrapping width of the runtime object.
  /** @type {string} */
  this._align = objectData.content.align;

  if (this._renderer)
    gdjs.BBTextRuntimeObjectRenderer.call(this._renderer, this, runtimeScene);
  else
    /** @type {gdjs.BBTextRuntimeObjectRenderer} */
    this._renderer = new gdjs.BBTextRuntimeObjectRenderer(this, runtimeScene);

  // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
  this.onCreated();
};

gdjs.BBTextRuntimeObject.prototype = Object.create(
  gdjs.RuntimeObject.prototype
);
gdjs.registerObject('BBText::BBText', gdjs.BBTextRuntimeObject);

gdjs.BBTextRuntimeObject.prototype.getRendererObject = function() {
  return this._renderer.getRendererObject();
};

/**
 * Initialize the extra parameters that could be set for an instance.
 * @private
 */
gdjs.BBTextRuntimeObject.prototype.extraInitializationFromInitialInstance = function(initialInstanceData) {
  // The wrapping width value (this._wrappingWidth) is using the object's width as an innitial value
  if (initialInstanceData.customSize)
    this.setWrappingWidth(initialInstanceData.width);
};

gdjs.BBTextRuntimeObject.prototype.onDestroyFromScene = function(runtimeScene) {
  gdjs.RuntimeObject.prototype.onDestroyFromScene.call(this, runtimeScene);
};

/**
 * Set/Get BBText base style properties
 */
gdjs.BBTextRuntimeObject.prototype.setBBText = function(text) {
  this._text = text;
  this._renderer.updateText();
};

gdjs.BBTextRuntimeObject.prototype.getBBText = function() {
  return this._text;
};

gdjs.BBTextRuntimeObject.prototype.setColor = function(rgbColorString) {
  const splitValue = rgbColorString.split(';');
  if (splitValue.length !== 3) return;
  const hexColor =
    '#' +
    gdjs.rgbToHex(
      parseInt(splitValue[0], 0),
      parseInt(splitValue[1], 0),
      parseInt(splitValue[2], 0)
    );
  this._color = hexColor;
  this._renderer.updateColor();
};

gdjs.BBTextRuntimeObject.prototype.getColor = function() {
  return this._color;
};

gdjs.BBTextRuntimeObject.prototype.setFontSize = function(fontSize) {
  this._fontSize = fontSize;
  this._renderer.updateFontSize();
};

gdjs.BBTextRuntimeObject.prototype.getFontSize = function() {
  return this._fontSize;
};

gdjs.BBTextRuntimeObject.prototype.setFontFamily = function(fontFamily) {
  this._fontFamily = fontFamily;
  this._renderer.updateFontFamily();
};

gdjs.BBTextRuntimeObject.prototype.getFontFamily = function() {
  return this._fontFamily;
};

gdjs.BBTextRuntimeObject.prototype.setAlignment = function(align) {
  this._align = align;
  this._renderer.updateAlignment();
};

gdjs.BBTextRuntimeObject.prototype.getAlignment = function() {
  return this._align;
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
  this._renderer.updateWrappingWidth();
};

/**
 * Get the wrapping width of the object.
 */
gdjs.BBTextRuntimeObject.prototype.getWrappingWidth = function() {
  return this._wrappingWidth;
};

gdjs.BBTextRuntimeObject.prototype.setWordWrap = function(wordWrap) {
  this._wordWrap = wordWrap;
  this._renderer.updateWordWrap();
};

gdjs.BBTextRuntimeObject.prototype.getWordWrap = function(wordWrap) {
  return this._wordWrap;
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
