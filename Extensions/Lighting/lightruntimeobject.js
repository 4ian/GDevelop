/**
 * @typedef {Object} LightObjectDataType
 * @property {Object} content The base parameters of light object.
 * @property {number} content.radius The radius of light object.
 * @property {string} content.color A string representing color in hexadecimal format.
 * @property {string} content.texture A string representing the name of texture used for light object.
 * @property {boolean} content.debugMode true if the light objects shows debug graphics, false otherwise.
 *
 * @typedef {ObjectData & LightObjectDataType} LightObjectData
 */

/**
 * Displays a Light object.
 * @memberof gdjs
 * @class LightRuntimeObject
 * @extends RuntimeObject
 * @param {gdjs.RuntimeScene} runtimeScene
 * @param {LightObjectData} lightObjectData
 */
gdjs.LightRuntimeObject = function (runtimeScene, lightObjectData) {
  gdjs.RuntimeObject.call(this, runtimeScene, lightObjectData);

  /** @type {number} */
  this._radius =
    lightObjectData.content.radius > 0 ? lightObjectData.content.radius : 1;

  /** @type {number[]} color in format [r, g, b], where each component is in the range [0, 255] */
  this._color = gdjs.LightRuntimeObject.hexToRGBColor(
    lightObjectData.content.color
  );

  /** @type {boolean} */
  this._debugMode = lightObjectData.content.debugMode;

  /** @type {string} */
  this._texture = lightObjectData.content.texture;

  /** @type {gdjs.LightObstaclesManager} */
  this._obstaclesManager = gdjs.LightObstaclesManager.getManager(runtimeScene);

  if (this._renderer)
    gdjs.LightRuntimeObjectRenderer.call(this._renderer, this, runtimeScene);
  else this._renderer = new gdjs.LightRuntimeObjectRenderer(this, runtimeScene);

  /** @type {gdjs.RuntimeScene} */
  this._runtimeScene = runtimeScene;

  // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
  this.onCreated();
};

gdjs.LightRuntimeObject.prototype = Object.create(gdjs.RuntimeObject.prototype);
gdjs.registerObject('Lighting::LightObject', gdjs.LightRuntimeObject);

gdjs.LightRuntimeObject.hexToRGBColor = function (hex) {
  var hexNumber = parseInt(hex.replace('#', ''), 16);
  return [(hexNumber >> 16) & 0xff, (hexNumber >> 8) & 0xff, hexNumber & 0xff];
};

gdjs.LightRuntimeObject.prototype.getRendererObject = function () {
  return this._renderer.getRendererObject();
};

/**
 *
 * @param {LightObjectData} oldObjectData
 * @param {LightObjectData} newObjectData
 */
gdjs.LightRuntimeObject.prototype.updateFromObjectData = function (
  oldObjectData,
  newObjectData
) {
  if (oldObjectData.content.radius !== newObjectData.content.radius)
    this.setRadius(newObjectData.content.radius);

  if (oldObjectData.content.color !== newObjectData.content.radius) {
    this._color = gdjs.LightRuntimeObject.hexToRGBColor(
      newObjectData.content.color
    );
    this._renderer.updateColor();
  }

  if (oldObjectData.content.texture !== newObjectData.content.texture) {
    this._texture = newObjectData.content.texture;
    this._renderer.updateMesh();
  }

  if (oldObjectData.content.debugMode !== newObjectData.content.debugMode) {
    this._debugMode = newObjectData.content.debugMode;
    this._renderer.updateDebugMode();
  }

  return true;
};

gdjs.LightRuntimeObject.prototype.update = function () {
  this._renderer.ensureUpToDate();
};

/**
 * Get the radius of the light object.
 * @returns {number} radius of the light object.
 */
gdjs.LightRuntimeObject.prototype.getRadius = function () {
  return this._radius;
};

/**
 * Set the radius of the light object.
 * @param {number} radius
 */
gdjs.LightRuntimeObject.prototype.setRadius = function (radius) {
  this._radius = radius > 0 ? radius : 1;
  this._renderer.updateRadius();
};

/**
 * Get the height of the light object.
 * @returns {number} height of light object.
 */
gdjs.LightRuntimeObject.prototype.getHeight = function () {
  return 2 * this._radius;
};

/**
 * Get the width of the light object.
 * @returns {number} width of light object.
 */
gdjs.LightRuntimeObject.prototype.getWidth = function () {
  return 2 * this._radius;
};

/**
 * Get the x co-ordinate of the top-left vertex/point of light object.
 * @returns {number} x co-ordinate of the top-left vertex/point.
 */
gdjs.LightRuntimeObject.prototype.getDrawableX = function () {
  return this.x - this._radius;
};

/**
 * Get the y co-ordinate of the top-left vertex/point of light object.
 * @returns {number} y co-ordinate of the top-left vertex/point.
 */
gdjs.LightRuntimeObject.prototype.getDrawableY = function () {
  return this.y - this._radius;
};

/**
 * Get the color of the light object as a "R;G;B" string.
 * @returns {string} the color of light object in "R;G;B" format.
 */
gdjs.LightRuntimeObject.prototype.getColor = function () {
  return this._color[0] + ';' + this._color[1] + ';' + this._color[2];
};

/**
 * Set the color of the light object in format "R;G;B" string, with components in the range of [0-255].
 * @param {string} color
 */
gdjs.LightRuntimeObject.prototype.setColor = function (color) {
  var rgbColor = color.split(';');
  this._color = [
    parseInt(rgbColor[0], 10),
    parseInt(rgbColor[1], 10),
    parseInt(rgbColor[2], 10),
  ];
  this._renderer.updateColor();
};

/**
 * Get the light obstacles manager if objects with the behavior exist, null otherwise.
 * @returns {?gdjs.LightObstaclesManager} gdjs.LightObstaclesManager if it exists, otherwise null.
 */
gdjs.LightRuntimeObject.prototype.getObstaclesManager = function () {
  return this._obstaclesManager;
};

/**
 * Returns true if the light shows debug graphics, false otherwise.
 * @returns {boolean} true if debug mode is activated.
 */
gdjs.LightRuntimeObject.prototype.getDebugMode = function () {
  return this._debugMode;
};

/**
 * Returns the path of texture resource.
 * @returns {string} the path of texture.
 */
gdjs.LightRuntimeObject.prototype.getTexture = function () {
  return this._texture;
};
