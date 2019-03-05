/**
 * A video object doing showing a video on screen
 *
 * @memberof gdjs
 * @class VideoRuntimeObject
 * @extends RuntimeObject
 */
gdjs.VideoRuntimeObject = function(runtimeScene, objectData) {
  gdjs.RuntimeObject.call(this, runtimeScene, objectData);

  /** @type number */
  this._opacity = objectData.content.opacity;
  /** @type boolean */
  this._loop = objectData.content.loop;
  /** @type number */
  this._volume = objectData.content.volume;
  /** @type string */
  this._videoResource = objectData.content.videoResource;

  if (this._renderer)
    gdjs.VideoRuntimeObjectRenderer.call(this._renderer, this, runtimeScene);
  else this._renderer = new gdjs.VideoRuntimeObjectRenderer(this, runtimeScene);
};

gdjs.VideoRuntimeObject.prototype = Object.create(gdjs.RuntimeObject.prototype);
gdjs.VideoRuntimeObject.thisIsARuntimeObjectConstructor = "Video::VideoObject";

gdjs.VideoRuntimeObject.prototype.getRendererObject = function() {
  return this._renderer.getRendererObject();
};

/**
 * Initialize the extra parameters that could be set for an instance.
 * @private
 */
gdjs.VideoRuntimeObject.prototype.extraInitializationFromInitialInstance = function(
  initialInstanceData
) {
  if (initialInstanceData.customSize) {
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
  gdjs.RuntimeObject.prototype.setX.call(this, x);
  this._updatePosition();
};

/**
 * Set object position on Y axis.
 */
gdjs.VideoRuntimeObject.prototype.setY = function(y) {
  gdjs.RuntimeObject.prototype.setY.call(this, y);
  this._updatePosition();
};

/**
 * Set the angle of the object.
 * @param {number} angle The new angle of the object
 */
gdjs.VideoRuntimeObject.prototype.setAngle = function(angle) {
  gdjs.RuntimeObject.prototype.setAngle.call(this, angle);
  this._renderer.updateAngle();
};

/**
 * Set object opacity.
 * @param {number} opacity The new opacity of the object
 */
gdjs.VideoRuntimeObject.prototype.setOpacity = function(opacity) {
  this._opacity = opacity;
  this._renderer.updateOpacity();
};

/**
 * Get object opacity.
 */
gdjs.VideoRuntimeObject.prototype.getOpacity = function() {
  return this._opacity;
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

gdjs.VideoRuntimeObject.prototype.getWidth = function() {
  return this._width;
};

gdjs.VideoRuntimeObject.prototype.getHeight = function() {
  return this._height;
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

/* Input 0-1, return a number 0-100
   Tool normalize for value  */

gdjs.VideoRuntimeObject.prototype._normalize = function(val, min, max) {
  return (val - min) / (max - min);
};

/**
 * Limit value in an interval
 */
gdjs.VideoRuntimeObject.prototype._clamp = function(val, min, max) {
  return val <= min ? min : val >= max ? max : val;
};

gdjs.VideoRuntimeObject.prototype.setVolume = function(volume) {
  //newVolume = 0-100 , newVolume = normalize(newVolume) = 0-1, clamp = clamp(newVolume) = 0-1
  this._volume = this._clamp(this._normalize(volume, 0, 100), 0, 1);
  this._renderer.updateVolume();
};

gdjs.VideoRuntimeObject.prototype.getVolume = function() {
  return this._normalize(this._renderer.getVolume(), 0, 1) * 100;
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

gdjs.VideoRuntimeObject.prototype.setPlaybackSpeed = function(playbackSpeed) {
  this._playbackSpeed = playbackSpeed;
  this._renderer.setPlaybackSpeed(this._playbackSpeed);
};

gdjs.VideoRuntimeObject.prototype.getPlaybackSpeed = function() {
  return this._renderer.getPlaybackSpeed();
};
