gdjs.LightRuntimeObject = function (runtimeScene, lightObjectData) {
  gdjs.RuntimeObject.call(this, runtimeScene, lightObjectData);

  this._radius = lightObjectData.content.radius;
  this._color = lightObjectData.content.color.split(',').map(function (item) {
    return parseFloat(item);
  });
  this._debugMode = lightObjectData.content.debugMode;

  this._obstacleManager = gdjs.LightObstaclesManager.getManager(runtimeScene);

  if (this._renderer)
    gdjs.LightRuntimeObjectRenderer.call(this._renderer, this, runtimeScene);
  /** @type {gdjs.TextRuntimeObjectRenderer} */ else
    this._renderer = new gdjs.LightRuntimeObjectRenderer(this, runtimeScene);

  // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
  this.onCreated();
};

gdjs.LightRuntimeObject.prototype = Object.create(gdjs.RuntimeObject.prototype);
gdjs.registerObject('Lighting::LightObject', gdjs.LightRuntimeObject);

gdjs.LightRuntimeObject.prototype.getRendererObject = function () {
  return this._renderer.getRendererObject();
};

gdjs.LightRuntimeObject.prototype.update = function () {
  this._renderer.ensureUpToDate();
};

gdjs.LightRuntimeObject.prototype.getRadius = function () {
  return this._radius;
};

gdjs.LightRuntimeObject.prototype.getHeight = function () {
  return 2 * this._radius;
};

gdjs.LightRuntimeObject.prototype.getWidth = function () {
  return 2 * this._radius;
};

gdjs.LightRuntimeObject.prototype.getDrawableX = function () {
  return this.x - this._radius;
};

gdjs.LightRuntimeObject.prototype.getDrawableY = function () {
  return this.y - this._radius;
};

gdjs.LightRuntimeObject.prototype.getColor = function () {
  return this._color;
};

gdjs.LightRuntimeObject.prototype.setX = function (x) {
  gdjs.RuntimeObject.prototype.setX.call(this, x);
};

gdjs.LightRuntimeObject.prototype.setY = function (y) {
  gdjs.RuntimeObject.prototype.setY.call(this, y);
};

gdjs.LightRuntimeObject.prototype.getObstaclesManager = function () {
  return this._obstacleManager;
};

gdjs.LightRuntimeObject.prototype.getDebugMode = function () {
  return this._debugMode;
};
