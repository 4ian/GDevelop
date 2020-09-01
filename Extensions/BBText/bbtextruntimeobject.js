/**
 * @typedef {Object} BBTextObjectDataType Base parameters for {@link gdjs.BBTextRuntimeObject}
 * @property {Object} content The base parameters of the BBText
 * @property {number} content.opacity The opacity of the BBText
 * @property {boolean} content.visible Deprecated - Is the text visible?
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
  /** @type {string} */
  this._text = objectData.content.text;
  /** @type {number[]} color in format [r, g, b], where each component is in the range [0, 255] */
  this._color = gdjs.BBTextRuntimeObject.hexToRGBColor(objectData.content.color);
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
    this._renderer = new gdjs.BBTextRuntimeObjectRenderer(this, runtimeScene);

  // While this should rather be exposed as a property for all objects, honor the "visible"
  // property that is specific to this object.
  this.hidden = !objectData.content.visible;

  // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
  this.onCreated();
};

gdjs.BBTextRuntimeObject.prototype = Object.create(
  gdjs.RuntimeObject.prototype
);
gdjs.registerObject('BBText::BBText', gdjs.BBTextRuntimeObject);

gdjs.BBTextRuntimeObject.hexToRGBColor = function (hex) {
  var hexNumber = parseInt(hex.replace('#', ''), 16);
  return [(hexNumber >> 16) & 0xff, (hexNumber >> 8) & 0xff, hexNumber & 0xff];
};

gdjs.BBTextRuntimeObject.prototype.getRendererObject = function() {
  return this._renderer.getRendererObject();
};

/**
 * @param {BBTextObjectDataType} oldObjectData
 * @param {BBTextObjectDataType} newObjectData
 */
gdjs.BBTextRuntimeObject.prototype.updateFromObjectData = function(oldObjectData, newObjectData) {
  if (oldObjectData.content.opacity !== newObjectData.content.opacity) {
    this.setOpacity(newObjectData.content.opacity);
  }
  if (oldObjectData.content.visible !== newObjectData.content.visible) {
    this.hide(!newObjectData.content.visible);
  }
  if (oldObjectData.content.text !== newObjectData.content.text) {
    this.setBBText(newObjectData.content.text);
  }
  if (oldObjectData.content.color !== newObjectData.content.color) {
    this._color = gdjs.BBTextRuntimeObject.hexToRGBColor(newObjectData.content.color);
    this._renderer.updateColor();
  }
  if (oldObjectData.content.fontFamily !== newObjectData.content.fontFamily) {
    this.setFontFamily(newObjectData.content.fontFamily);
  }
  if (oldObjectData.content.fontSize !== newObjectData.content.fontSize) {
    this.setFontSize(newObjectData.content.fontSize);
  }
  if (oldObjectData.content.wordWrap !== newObjectData.content.wordWrap) {
    this.setWordWrap(newObjectData.content.wordWrap);
  }
  if (oldObjectData.content.align !== newObjectData.content.align) {
    this.setAlignment(newObjectData.content.align);
  }

  return true;
};

/**
 * Initialize the extra parameters that could be set for an instance.
 * @private
 */
gdjs.BBTextRuntimeObject.prototype.extraInitializationFromInitialInstance = function(initialInstanceData) {
  if (initialInstanceData.customSize)
    this.setWrappingWidth(initialInstanceData.width);
  else
    this.setWrappingWidth(250); // This value is the default wrapping width of the runtime object.
};

gdjs.BBTextRuntimeObject.prototype.onDestroyFromScene = function(runtimeScene) {
  gdjs.RuntimeObject.prototype.onDestroyFromScene.call(this, runtimeScene);
};

/**
 * Set the markup text to display.
 */
gdjs.BBTextRuntimeObject.prototype.setBBText = function(text) {
  this._text = text;
  this._renderer.updateText();
};

/**
 * Get the markup text displayed by the object.
 */
gdjs.BBTextRuntimeObject.prototype.getBBText = function() {
  return this._text;
};

gdjs.BBTextRuntimeObject.prototype.setColor = function(rgbColorString) {
  const splitValue = rgbColorString.split(';');
  if (splitValue.length !== 3) return;

  this._color[0] = parseInt(splitValue[0], 10);
  this._color[1] = parseInt(splitValue[1], 10);
  this._color[2] = parseInt(splitValue[2], 10);
  this._renderer.updateColor();
};

/**
 * Get the base color.
 * @return {string} The color as a "R;G;B" string, for example: "255;0;0"
 */
gdjs.BBTextRuntimeObject.prototype.getColor = function() {
  return this._color[0] + ";" + this._color[1] + ";" + this._color[2];
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
