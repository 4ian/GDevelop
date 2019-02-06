/**
 * A video object doing showing a text on screen
 *
 * @memberof gdjs
 * @class VideoRuntimeObject
 * @extends RuntimeObject
 */
gdjs.VideoRuntimeObject = function(runtimeScene, objectData) {
  // Always call the base gdjs.RuntimeObject constructor.
  gdjs.RuntimeObject.call(this, runtimeScene, objectData);

  // Load any required data from the object properties.
  this._property1 = objectData.content.property1;

  // Create the renderer (see videoruntimeobject-pixi-renderer.js)
  if (this._renderer)
    gdjs.VideoRuntimeObjectRenderer.call(this._renderer, this, runtimeScene);
  else this._renderer = new gdjs.VideoRuntimeObjectRenderer(this, runtimeScene);
};

gdjs.VideoRuntimeObject.prototype = Object.create(gdjs.RuntimeObject.prototype);
gdjs.VideoRuntimeObject.thisIsARuntimeObjectConstructor =
  "Video::VideoObject"; //Replace by your extension + object name.

gdjs.VideoRuntimeObject.prototype.getRendererObject = function() {
  return this._renderer.getRendererObject();
};

/**
 * Called once during the game loop, before events and rendering.
 * @param {gdjs.RuntimeScene} runtimeScene The gdjs.RuntimeScene the object belongs to.
 */
gdjs.VideoRuntimeObject.prototype.update = function(runtimeScene) {
  // This is an example: typically you want to make sure the renderer
  // is up to date with the object.
  this._renderer.ensureUpToDate();
};

/**
 * Initialize the extra parameters that could be set for an instance.
 * @private
 */
gdjs.VideoRuntimeObject.prototype.extraInitializationFromInitialInstance = function(
  initialInstanceData
) {

  if ( initialInstanceData.customSize ) {
    this.setWidth(initialInstanceData.width);
    this.setHeight(initialInstanceData.height);
  }

};

/**
 * Update the object position.
 * @private
 */
gdjs.VideoRuntimeObject.prototype._updatePosition = function() {
  // This is an example: typically you want to tell the renderer to update
  // the position of the object.
  this._renderer.updatePosition();
};

/**
 * Set object position on X axis.
 */
gdjs.VideoRuntimeObject.prototype.setX = function(x) {
  gdjs.RuntimeObject.prototype.setX.call(this, x); // Always call the parent method first.
  this._updatePosition();
};

/**
 * Set object position on Y axis.
 */
gdjs.VideoRuntimeObject.prototype.setY = function(y) {
  gdjs.RuntimeObject.prototype.setY.call(this, y); // Always call the parent method first.
  this._updatePosition();
};

/**
 * Set the angle of the object.
 * @param {number} angle The new angle of the object
 */
gdjs.VideoRuntimeObject.prototype.setAngle = function(angle) {
  gdjs.RuntimeObject.prototype.setAngle.call(this, angle); // Always call the parent method first.
  this._renderer.updateAngle(); // Tell the renderer to update the rendered object
};

/**
 * Set object opacity.
 */
gdjs.VideoRuntimeObject.prototype.setOpacity = function(opacity) {
  if (opacity < 0) opacity = 0;
  if (opacity > 255) opacity = 255;

  this.opacity = opacity;
  this._renderer.updateOpacity(); // Tell the renderer to update the rendered object
};

/**
 * Get object opacity.
 */
gdjs.VideoRuntimeObject.prototype.getOpacity = function() {
  return this.opacity;
};

/**
 * Get the text that must be displayed by the video object.
 */
gdjs.VideoRuntimeObject.prototype.getText = function() {
  return this._property1;
};


/**
 * Set the width of the panel sprite.
 * @param {number} width The new width in pixels.
 */
gdjs.VideoRuntimeObject.prototype.setWidth = function(width) {
  this._width = width;
  this._renderer.updateWidth();
};

/**
* Set the height of the panel sprite.
* @param {number} height The new height in pixels.
*/
gdjs.VideoRuntimeObject.prototype.setHeight = function(height) {
  this._height = height;
  this._renderer.updateHeight();
};

/*
TODO
play, voir JsExtention.js dans l'action (mais l'action marche pas)
*/
gdjs.VideoRuntimeObject.prototype.play = function(object) {
  gdjs.VideoRuntimeObject.prototype.play.call(this, object);
  console.log("#2bouh-object");
  this._renderer.play(object);
}