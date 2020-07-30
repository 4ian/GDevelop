/**
 * A viewport for cameras
 *
 * @memberof gdjs
 * @class CameraViewportObject
 * @extends gdjs.RuntimeObject
 */
gdjs.CameraViewportObject = function(runtimeScene, objectData) {
  // *ALWAYS* call the base gdjs.RuntimeObject constructor.
  gdjs.RuntimeObject.call(this, runtimeScene, objectData);
  console.log(objectData)

  this.width  = 250;
  this.height = 150;
  this.camera = objectData.content.cameraId;
  this.showOtherCameras = objectData.content.showOtherCameras;
  this._scene = runtimeScene;

  if (this._renderer)
    gdjs.CameraViewportObjectRenderer.call(this._renderer, this, runtimeScene);
  else this._renderer = new gdjs.CameraViewportObjectRenderer(this, runtimeScene);

  // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
  this.onCreated();
};

gdjs.CameraViewportObject.prototype = Object.create(gdjs.RuntimeObject.prototype);
gdjs.registerObject("CameraViewport::CameraViewport", gdjs.CameraViewportObject); //Replace by your extension + object name.

gdjs.CameraViewportObject.prototype.getRendererObject = function() {
  return this._renderer.getRendererObject();
};

gdjs.CameraViewportObject.prototype.update = function() {
  return this._renderer.update();
};

gdjs.CameraViewportObject.prototype.updateFromObjectData = function(oldObjectData, newObjectData) {
  // Compare previous and new data for the object and update it accordingly.
  // This is useful for "hot-reloading".
  if (oldObjectData.content.cameraId !== newObjectData.content.cameraId) {
    this.camera = newObjectData.content.cameraId;
  }

  if (oldObjectData.content.showOtherCameras !== newObjectData.content.showOtherCameras) {
    this.showOtherCameras = newObjectData.content.showOtherCameras;
  }

  return true;
};

/**
 * Initialize the extra parameters that could be set for an instance.
 * @private
 * @param {{customSize: {width: number, height: number}}} initialInstanceData The initial instance data
 */
gdjs.CameraViewportObject.prototype.extraInitializationFromInitialInstance = function(
  initialInstanceData
) {
  if (initialInstanceData.customSize) {
    this.setWidth(initialInstanceData.width);
    this.setHeight(initialInstanceData.height);
  }
};

gdjs.CameraViewportObject.prototype.setHeight = function(height) {
  this.height = height;
  this._renderer.changeSize();
}

gdjs.CameraViewportObject.prototype.setWidth = function(width) {
  this.width = width;
  this._renderer.changeSize();
}

gdjs.CameraViewportObject.prototype.getHeight = function() {
  return this.height;
}

gdjs.CameraViewportObject.prototype.getWidth = function() {
  return this.width;
}

/**
 * Hide (or show) the object
 * @param {boolean} hidden true to hide the object, false to show it again.
 */
gdjs.CameraViewportObject.prototype.hide = function(hidden) {
  this._renderer.changeVisible(hidden);
};

/**
 * Get the camera being rendered.
 */
gdjs.CameraViewportObject.prototype.getCameraID = function() {
  return this.camera;
};

/**
 * Set the camera being rendered.
 */
gdjs.CameraViewportObject.prototype.setCameraID = function(newCameraID) {
  this.camera = newCameraID;
};
