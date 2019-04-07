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

gdjs.VideoRuntimeObject.prototype.update = function(runtimeScene) {
  this._renderer.ensureUpToDate();
};

/**
 * Set object position on X axis.
 * @param {number} x The new position X of the object.
 */
gdjs.VideoRuntimeObject.prototype.setX = function(x) {
  gdjs.RuntimeObject.prototype.setX.call(this, x);
  this._renderer.updatePosition();
};

/**
 * Set object position on Y axis.
 * @param {number} y The new position Y of the object.
 */
gdjs.VideoRuntimeObject.prototype.setY = function(y) {
  gdjs.RuntimeObject.prototype.setY.call(this, y);
  this._renderer.updatePosition();
};

/**
 * Set the angle of the object.
 * @param {number} angle The new angle of the object.
 */
gdjs.VideoRuntimeObject.prototype.setAngle = function(angle) {
  gdjs.RuntimeObject.prototype.setAngle.call(this, angle);
  this._renderer.updateAngle();
};

/**
 * Set object opacity.
 * @param {number} opacity The new opacity of the object (0-255).
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
 * Set the width of the video.
 * @param {number} width The new width in pixels.
 */
gdjs.VideoRuntimeObject.prototype.setWidth = function(width) {
  this._renderer.setWidth(width);
};

/**
 * Set the height of the video.
 * @param {number} height The new height in pixels.
 */
gdjs.VideoRuntimeObject.prototype.setHeight = function(height) {
  this._renderer.setHeight(height);
};

/**
 * Get the width of the video object.
 */
gdjs.VideoRuntimeObject.prototype.getWidth = function() {
  return this._renderer.getWidth();
};

/**
 * Get the height of the video object.
 */
gdjs.VideoRuntimeObject.prototype.getHeight = function() {
  return this._renderer.getHeight();
};

/**
 * Get if the video object is playing
 */
gdjs.VideoRuntimeObject.prototype.play = function() {
  this._renderer.play();
};

/**
 * Get if the video object is paused.
 */
gdjs.VideoRuntimeObject.prototype.pause = function() {
  this._renderer.pause();
};

/**
 * Set the state looped of the video.
 * @param {boolean} enable true to loop the video
 */
gdjs.VideoRuntimeObject.prototype.setLoop = function(enable) {
  this._renderer.setLoop(enable);
};

/**
 * Set the state muted of the video.
 * @param {boolean} enable The new state.
 */
gdjs.VideoRuntimeObject.prototype.mute = function(enable) {
  this._renderer.setMute(enable);
};

/**
 * Return the state muted of video object.
 */
gdjs.VideoRuntimeObject.prototype.isMuted = function() {
  return this._renderer.isMuted();
};

/**
 * Normalize a value between 0 and 100 to a value between 0 and 1.
 */
gdjs.VideoRuntimeObject.prototype._normalize = function(val, min, max) {
  return (val - min) / (max - min);
};

/**
 * Restrict the value in the given interval
 */
gdjs.VideoRuntimeObject.prototype._clamp = function(val, min, max) {
  return val <= min ? min : val >= max ? max : val;
};

/**
 * Set the volume of the video object.
 * @param {number} volume The new volume.
 */
gdjs.VideoRuntimeObject.prototype.setVolume = function(volume) {
  this._volume = this._clamp(this._normalize(volume, 0, 100), 0, 1) * 100;
  this._renderer.updateVolume();
};

/**
 * Get the volume of the video object.
 */
gdjs.VideoRuntimeObject.prototype.getVolume = function() {
  return this._normalize(this._renderer.getVolume(), 0, 1) * 100;
};

/**
 * Check if the video is being played.
 */
gdjs.VideoRuntimeObject.prototype.isPlayed = function() {
  return this._renderer.isPlayed();
};

/**
 * Check if the video is paused.
 */
gdjs.VideoRuntimeObject.prototype.isPaused = function() {
  return !this._renderer.isPlayed();
};

/**
 * Check if the video is looping.
 */
gdjs.VideoRuntimeObject.prototype.isLooped = function() {
  return this._renderer.isLooped();
};

/**
 * Return the total time of the video.
 */
gdjs.VideoRuntimeObject.prototype.getDuration = function() {
  return this._renderer.getDuration();
};

/**
 * Check if the video has ended.
 */
gdjs.VideoRuntimeObject.prototype.isEnded = function() {
  return !this._renderer.isEnded();
};

/**
 * Set the new time of the video object.
 * @param {number} time The new time.
 */
gdjs.VideoRuntimeObject.prototype.setCurrentTime = function(time) {
  this._renderer.setCurrentTime(time);
};

/**
 * Get the current time of the video object.
 */
gdjs.VideoRuntimeObject.prototype.getCurrentTime = function() {
  return this._renderer.getCurrentTime();
};

/**
 * Set the new playback speed of the video object.
 * @param {number} playbackSpeed The new playback speed.
 */
gdjs.VideoRuntimeObject.prototype.setPlaybackSpeed = function(playbackSpeed) {
  this._playbackSpeed = this._clamp(playbackSpeed, 0.5, 2);
  this._renderer.setPlaybackSpeed(this._playbackSpeed);
};

/**
 * Get the playback speed of the video object.
 */
gdjs.VideoRuntimeObject.prototype.getPlaybackSpeed = function() {
  return this._renderer.getPlaybackSpeed();
};

gdjs.RuntimeScene.gdjsCallbackRuntimeScenePaused = function(runtimeScene) {
  // TODO: Add method to get list of all instances
  for (var instances in runtimeScene._instances.items) {
    for (var object in runtimeScene._instances.items[instances]) {
      var obj = runtimeScene._instances.items[instances][object];
      // TODO: Move this to renderer
      // TODO: Use instanceof instead of type
      if (
        obj.type == "Video::VideoObject" &&
        !obj._renderer._pixiObject._texture.baseTexture.source.paused &&
        !obj._renderer._pixiObject._texture.baseTexture.source.ended
      ) {
        obj._renderer._pixiObject._texture.baseTexture.source.pause();
        obj._pausedAsScenePaused = true;
      }
    }
  }
};

gdjs.RuntimeScene.gdjsCallbackRuntimeSceneResumed = function(runtimeScene) {
  // TODO: Add method to get list of all instances
  for (var instances in runtimeScene._instances.items) {
    for (var object in runtimeScene._instances.items[instances]) {
      var obj = runtimeScene._instances.items[instances][object];
      // TODO: move this to renderer
      // TODO: Use instanceof instead of type
      if (obj.type == "Video::VideoObject" && obj._pausedAsScenePaused) {
        obj._renderer._pixiObject._texture.baseTexture.source.play();
      }
    }
  }
};

gdjs.RuntimeScene.gdjsCallbackObjectDeletedFromScene = function(
  runtimeScene,
  runtimeObject
) {
  // TODO: Move this to renderer
  runtimeObject._renderer._pixiObject._texture.baseTexture.source.pause();
};
