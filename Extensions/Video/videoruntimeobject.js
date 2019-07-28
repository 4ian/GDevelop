/**
 * An object displaying a video on screen.
 *
 * For the same video resource, only one video is being created in memory (
 * as a HTMLVideoElement). This means that two objects displaying the same
 * video will have the same state for this video (paused/playing, current time,
 * volume, etc...).
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

  // Use a boolean to track if the video was paused because we
  // navigated to another scene, and so should resume if we're back.
  /** @type boolean */
  this._pausedAsScenePaused = false;

  if (this._renderer)
    gdjs.VideoRuntimeObjectRenderer.call(this._renderer, this, runtimeScene);
  else this._renderer = new gdjs.VideoRuntimeObjectRenderer(this, runtimeScene);

  // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
  this.onCreated();
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

gdjs.VideoRuntimeObject.prototype.onDestroyFromScene = function(runtimeScene) {
  gdjs.RuntimeObject.prototype.onDestroyFromScene.call(this, runtimeScene);

  this._renderer.onDestroy();
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

/**
 * When a scene is unloaded, pause any video being run.
 * TODO: Investigate how to dispose the video source?
 *
 * @private
 */
gdjs.VideoRuntimeObject.gdjsCallbackRuntimeSceneUnloaded = function(
  runtimeScene
) {
  // Manually find all the gdjs.VideoRuntimeObject living on the scene,
  // and pause them.
  var instances = runtimeScene.getAdhocListOfAllInstances();
  for (var i = 0; i < instances.length; ++i) {
    var obj = instances[i];
    if (obj instanceof gdjs.VideoRuntimeObject) {
      if (obj.isPlayed()) {
        obj.pause();
      }
    }
  }
};

/**
 * When a scene is paused, pause any video being run.
 * @private
 */
gdjs.VideoRuntimeObject.gdjsCallbackRuntimeScenePaused = function(
  runtimeScene
) {
  // Manually find all the gdjs.VideoRuntimeObject living on the scene,
  // and pause them.
  var instances = runtimeScene.getAdhocListOfAllInstances();
  for (var i = 0; i < instances.length; ++i) {
    var obj = instances[i];
    if (obj instanceof gdjs.VideoRuntimeObject) {
      if (obj.isPlayed()) {
        obj.pause();
        obj._pausedAsScenePaused = true; // Flag it to be started again when scene is resumed.
      }
    }
  }
};

/**
 * When a scene is resumed, resume any video previously paused.
 * @private
 */
gdjs.VideoRuntimeObject.gdjsCallbackRuntimeSceneResumed = function(
  runtimeScene
) {
  // Manually find all the gdjs.VideoRuntimeObject living on the scene,
  // and play them if they have been previously paused.
  var instances = runtimeScene.getAdhocListOfAllInstances();
  for (var i = 0; i < instances.length; ++i) {
    var obj = instances[i];
    if (obj instanceof gdjs.VideoRuntimeObject) {
      if (obj._pausedAsScenePaused) {
        obj.play();
      }
    }
  }
};
