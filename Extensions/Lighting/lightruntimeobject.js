gdjs.LightRuntimeObject = function (runtimeScene, lightObjectData) {
  gdjs.RuntimeObject.call(this, runtimeScene, lightObjectData);

  this._radius = lightObjectData.content.radius;
  this._color = gdjs.LightRuntimeObject.hexToRGBColor(
    lightObjectData.content.color
  );
  this._debugMode = lightObjectData.content.debugMode;
  this._texture = lightObjectData.content.texture === ''
                    ? null
                    : runtimeScene
                      .getGame()
                      .getImageManager()
                      .getPIXITexture(lightObjectData.content.texture);

  if(gdjs.LightObstaclesManager)
    this._obstacleManager = gdjs.LightObstaclesManager.getManager(runtimeScene);

  if (this._renderer)
    gdjs.LightRuntimeObjectRenderer.call(this._renderer, this, runtimeScene);
  else this._renderer = new gdjs.LightRuntimeObjectRenderer(this, runtimeScene);

  // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
  this.onCreated();
};

gdjs.LightRuntimeObject.hexToRGBColor = function (hex) {
  var hexNumber = parseInt(hex.replace('#', ''), 16);
  return [(hexNumber >> 16) & 0xff, (hexNumber >> 8) & 0xff, hexNumber & 0xff];
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

/**
 * Returns light obstacles manager, or null if there's
 * no object with light obstacle behavior. Always perform a null check
 * before using it.
 */
gdjs.LightRuntimeObject.prototype.getObstaclesManager = function () {
  if(this._obstacleManager)
    return this._obstacleManager;
  
  return null;
};

gdjs.LightRuntimeObject.prototype.getDebugMode = function () {
  return this._debugMode;
};

gdjs.LightRuntimeObject.prototype.getPIXITexture = function () {
  return this._texture;
}
