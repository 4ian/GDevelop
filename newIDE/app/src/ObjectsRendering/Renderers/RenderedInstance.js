/**
 * RenderedInstance is the base class used for creating renderers of instances,
 * which display on the scene editor, using Pixi.js, the instance of an object (see InstancesEditor).
 *
 * @class RenderedInstance
 * @constructor
 */
function RenderedInstance(
  project,
  layout,
  instance,
  associatedObject,
  pixiContainer,
  pixiResourcesLoader
) {
  this._pixiObject = null;
  this._instance = instance;
  this._associatedObject = associatedObject;
  this._pixiContainer = pixiContainer;
  this._project = project;
  this._layout = layout;
  this._pixiResourcesLoader = pixiResourcesLoader;
  this.wasUsed = true; //Used by InstancesRenderer to track rendered instance that are not used anymore.
}

/**
 * Convert an angle from degrees to radians.
 */
RenderedInstance.toRad = function(angleInDegrees) {
  return (angleInDegrees / 180) * 3.14159;
};

/**
 * Called when the scene editor is rendered.
 */
RenderedInstance.prototype.update = function() {
  //Nothing to do.
};

RenderedInstance.prototype.getPixiObject = function() {
  return this._pixiObject;
};

RenderedInstance.prototype.getInstance = function() {
  return this._instance;
};

/**
 * Called to notify the instance renderer that its associated instance was removed from
 * the scene. The PIXI object should probably be removed from the container: This is what
 * the default implementation of the method does.
 */
RenderedInstance.prototype.onRemovedFromScene = function() {
  if (this._pixiObject !== null)
    this._pixiContainer.removeChild(this._pixiObject);
};

RenderedInstance.prototype.getOriginX = function() {
  return 0;
};

RenderedInstance.prototype.getOriginY = function() {
  return 0;
};

/**
 * Return the width of the instance when the instance doesn't have a custom size.
 */
RenderedInstance.prototype.getDefaultWidth = function() {
  return 32;
};

/**
 * Return the height of the instance when the instance doesn't have a custom size.
 */
RenderedInstance.prototype.getDefaultHeight = function() {
  return 32;
};

export default RenderedInstance;
