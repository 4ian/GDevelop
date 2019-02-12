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
  var new_opacity = opacity/255;
  //this.opacity = opacity || this.getOpacity() ;
  this._renderer.updateOpacity(new_opacity); // Tell the renderer to update the rendered object
};

/**
 * Get object opacity.
 * return 0-1
 */
gdjs.VideoRuntimeObject.prototype.getOpacity = function() {
  return this._renderer.getOpacity()*255;
};

/**
 * A supprimer
 */
gdjs.VideoRuntimeObject.prototype.getText = function() {
  return this._property1;
};

/**
 * Set the width of video instance and renderer
 * @param {number} width The new width in pixels.
 */
gdjs.VideoRuntimeObject.prototype.setWidth = function(width) {
  this._width = width;
  this._renderer.updateWidth();
};

/**
* Set the height of video instance and renderer
* @param {number} height The new height in pixels.
*/
gdjs.VideoRuntimeObject.prototype.setHeight = function(height) {
  this._height = height;
  this._renderer.updateHeight();
};

//TODO getWidth
gdjs.VideoRuntimeObject.prototype.getWidth = function() {
  return this._width;
  /* this._width = width;
  this._renderer.updateWidth(); */
};

//TODO getHeight
gdjs.VideoRuntimeObject.prototype.getHeight = function() {
  return this._height;
  /* this._height = height;
  this._renderer.updateHeight(); */
};

gdjs.VideoRuntimeObject.prototype.play = function() {
  this._renderer.play();
}; 

gdjs.VideoRuntimeObject.prototype.pause = function() {
  this._renderer.pause();
}; 

gdjs.VideoRuntimeObject.prototype.setLoop = function(bool) {
  this._renderer.setLoop(bool);
};

gdjs.VideoRuntimeObject.prototype.mute = function(bool) {
  this._renderer.setMute(bool);
};

gdjs.VideoRuntimeObject.prototype.isMuted = function() {
  return this._renderer.isMuted();
};

/* Tool normalize for value 

input 0-1, return a number 0-100
this._normalize(volume, 1, 0)*100;

input 0-100, return output 0-1
this._normalize(parseFloat(number), 100, 0)
*/
 
gdjs.VideoRuntimeObject.prototype._normalize = function(val, min, max) {
  return (val - min) / (max - min); 
};

gdjs.VideoRuntimeObject.prototype._clamp = function(val, min, max) {
  return val <= min ? min : val >= max ? max : val;
}

gdjs.VideoRuntimeObject.prototype.setVolume = function( newVolume ) {

  var _newVolume = this._clamp( this._normalize( newVolume, 0, 100 ) , 0, 1 );
  this._renderer.setVolume( _newVolume );
};

gdjs.VideoRuntimeObject.prototype.getVolume = function() {
  return this._normalize(this._renderer.getVolume(), 0, 1)*100;
};

gdjs.VideoRuntimeObject.prototype.isPlayed = function() {
  return this._renderer.isPlayed();
}; 

gdjs.VideoRuntimeObject.prototype.isPaused = function() {
  return !this._renderer.isPlayed();
}; 

gdjs.VideoRuntimeObject.prototype.isLooped = function() {
  return this._renderer.isLooped();
}; 

gdjs.VideoRuntimeObject.prototype.controlsAreShowing = function() {
  return this._renderer.controlsAreShowing();
};

gdjs.VideoRuntimeObject.prototype.getDuration = function() {
  return this._renderer.getDuration();
};

gdjs.VideoRuntimeObject.prototype.isEnded = function() {
  return !this._renderer.isEnded();
}; 

gdjs.VideoRuntimeObject.prototype.setCurrentTime = function(number) {
  this._renderer.setCurrentTime(number);
};

gdjs.VideoRuntimeObject.prototype.getCurrentTime = function() {
  return this._renderer.getCurrentTime();
};

/* gdjs.VideoRuntimeObject.prototype.controls = function(bool) {
  this._renderer.setControls(bool);
}; */