/**
 * An object displaying a video on screen.
 *
 * For the same video resource, only one video is being created in memory (
 * as a HTMLVideoElement). This means that two objects displaying the same
 * video will have the same state for this video (paused/playing, current time,
 * volume, etc...).
 *
 * @memberof gdjs
 * @class BBTextRuntimeObject
 * @extends RuntimeObject
 */
gdjs.BBTextRuntimeObject = function(runtimeScene, objectData) {
  gdjs.RuntimeObject.call(this, runtimeScene, objectData);

  console.log('OBJ:', this, objectData);
  /** @type number */
  this._opacity = objectData.content.opacity;
  /** @type boolean */
  this._visible = objectData.content.visible;
  /** @type string */
  this._text = objectData.content.text;
  /** @type string */
  this._color = objectData.content.color;
  /** @type string */
  this._family = objectData.content.family;
  /** @type number */
  this._size = objectData.content.size;
  /** @type number */
  this._wrappingWidth = objectData.content.width;
  /** @type string */
  this._align = objectData.content.align;

  // Use a boolean to track if the video was paused because we
  // navigated to another scene, and so should resume if we're back.
  /** @type boolean */
  // this._pausedAsScenePaused = false;

  if (this._renderer)
    gdjs.BBTextRuntimeObjectRenderer.call(this._renderer, this, runtimeScene);
  else
    this._renderer = new gdjs.BBTextRuntimeObjectRenderer(this, runtimeScene);

  // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
  this.onCreated();
};

gdjs.BBTextRuntimeObject.prototype = Object.create(
  gdjs.RuntimeObject.prototype
);
gdjs.BBTextRuntimeObject.thisIsARuntimeObjectConstructor = 'BBText::BBText';

gdjs.BBTextRuntimeObject.prototype.getRendererObject = function() {
  return this._renderer.getRendererObject();
};

/**
 * Initialize the extra parameters that could be set for an instance.
 * @private
 */
gdjs.BBTextRuntimeObject.prototype.extraInitializationFromInitialInstance = function(
  initialInstanceData
) {
  if (initialInstanceData.customSize) {
    this.setWrappingWidth(initialInstanceData.width);
  }
};

gdjs.BBTextRuntimeObject.prototype.onDestroyFromScene = function(runtimeScene) {
  gdjs.RuntimeObject.prototype.onDestroyFromScene.call(this, runtimeScene);

  this._renderer.onDestroy();
};

gdjs.BBTextRuntimeObject.prototype.update = function(runtimeScene) {
  this._renderer.ensureUpToDate();
};

/**
 * Set object position on X axis.
 * @param {number} x The new position X of the object.
 */
gdjs.BBTextRuntimeObject.prototype.setX = function(x) {
  gdjs.RuntimeObject.prototype.setX.call(this, x);
  this._renderer.updatePosition();
};

/**
 * Set object position on Y axis.
 * @param {number} y The new position Y of the object.
 */
gdjs.BBTextRuntimeObject.prototype.setY = function(y) {
  gdjs.RuntimeObject.prototype.setY.call(this, y);
  this._renderer.updatePosition();
};

/**
 * Set the angle of the object.
 * @param {number} angle The new angle of the object.
 */
gdjs.BBTextRuntimeObject.prototype.setAngle = function(angle) {
  gdjs.RuntimeObject.prototype.setAngle.call(this, angle);
  this._renderer.updateAngle();
};

/**
 * Set object opacity.
 * @param {number} opacity The new opacity of the object (0-255).
 */
gdjs.BBTextRuntimeObject.prototype.setOpacity = function(opacity) {
  this._opacity = opacity;
  this._renderer.updateOpacity();
};

/**
 * Get object opacity.
 */
gdjs.BBTextRuntimeObject.prototype.getOpacity = function() {
  return this._opacity;
};

/**
 * Set the word wrapping width for the text object.
 * @param {number} width The new width to set.
 */
gdjs.BBTextRuntimeObject.prototype.setWrappingWidth = function(width) {
  if (width <= 1) width = 1;
  this._wrappingWidth = width;
};

/**
 * Set the width of the video.
 * @param {number} width The new width in pixels.
 */
gdjs.BBTextRuntimeObject.prototype.setWidth = function(width) {
  this._renderer.setWidth(width);
};

/**
 * Set the height of the video.
 * @param {number} height The new height in pixels.
 */
gdjs.BBTextRuntimeObject.prototype.setHeight = function(height) {
  this._renderer.setHeight(height);
};

/**
 * Get the width of the video object.
 */
gdjs.BBTextRuntimeObject.prototype.getWidth = function() {
  return this._renderer.getWidth();
};

/**
 * Get the height of the video object.
 */
gdjs.BBTextRuntimeObject.prototype.getHeight = function() {
  return this._renderer.getHeight();
};

/**
 * Get if the video object is playing
 */
gdjs.BBTextRuntimeObject.prototype.play = function() {
  this._renderer.play();
};

/**
 * Get if the video object is paused.
 */
gdjs.BBTextRuntimeObject.prototype.pause = function() {
  this._renderer.pause();
};

/**
 * Set the state looped of the video.
 * @param {boolean} enable true to loop the video
 */
gdjs.BBTextRuntimeObject.prototype.setLoop = function(enable) {
  this._renderer.setLoop(enable);
};

/**
 * Set the state muted of the video.
 * @param {boolean} enable The new state.
 */
gdjs.BBTextRuntimeObject.prototype.mute = function(enable) {
  this._renderer.setMute(enable);
};

/**
 * Return the state muted of video object.
 */
gdjs.BBTextRuntimeObject.prototype.isMuted = function() {
  return this._renderer.isMuted();
};

/**
 * Normalize a value between 0 and 100 to a value between 0 and 1.
 */
gdjs.BBTextRuntimeObject.prototype._normalize = function(val, min, max) {
  return (val - min) / (max - min);
};

/**
 * Restrict the value in the given interval
 */
gdjs.BBTextRuntimeObject.prototype._clamp = function(val, min, max) {
  return val <= min ? min : val >= max ? max : val;
};

/**
 * Set the volume of the video object.
 * @param {number} volume The new volume.
 */
gdjs.BBTextRuntimeObject.prototype.setVolume = function(volume) {
  // this._volume = this._clamp(this._normalize(volume, 0, 100), 0, 1) * 100;
  // this._renderer.updateVolume();
};

/**
 * Get the volume of the video object.
 */
gdjs.BBTextRuntimeObject.prototype.getVolume = function() {
  // return this._normalize(this._renderer.getVolume(), 0, 1) * 100;
};

/**
 * Check if the video is being played.
 */
gdjs.BBTextRuntimeObject.prototype.isPlayed = function() {
  // return this._renderer.isPlayed();
};

/**
 * Check if the video is paused.
 */
gdjs.BBTextRuntimeObject.prototype.isPaused = function() {
  // return !this._renderer.isPlayed();
};

/**
 * Check if the video is looping.
 */
gdjs.BBTextRuntimeObject.prototype.isLooped = function() {
  // return this._renderer.isLooped();
};

/**
 * Return the total time of the video.
 */
gdjs.BBTextRuntimeObject.prototype.getDuration = function() {
  // return this._renderer.getDuration();
};

/**
 * Check if the video has ended.
 */
gdjs.BBTextRuntimeObject.prototype.isEnded = function() {
  // return this._renderer.isEnded();
};

/**
 * Set the new time of the video object.
 * @param {number} time The new time.
 */
gdjs.BBTextRuntimeObject.prototype.setCurrentTime = function(time) {
  // this._renderer.setCurrentTime(time);
};

/**
 * Get the current time of the video object.
 */
gdjs.BBTextRuntimeObject.prototype.getCurrentTime = function() {
  // return this._renderer.getCurrentTime();
};

/**
 * Set the new playback speed of the video object.
 * @param {number} playbackSpeed The new playback speed.
 */
gdjs.BBTextRuntimeObject.prototype.setPlaybackSpeed = function(playbackSpeed) {
  // this._playbackSpeed = this._clamp(playbackSpeed, 0.5, 2);
  // this._renderer.setPlaybackSpeed(this._playbackSpeed);
};

/**
 * Get the playback speed of the video object.
 */
gdjs.BBTextRuntimeObject.prototype.getPlaybackSpeed = function() {
  // return this._renderer.getPlaybackSpeed();
};

/**
 * When a scene is unloaded, pause any video being run.
 * TODO: Investigate how to dispose the video source?
 *
 * @private
 */
gdjs.BBTextRuntimeObject.gdjsCallbackRuntimeSceneUnloaded = function(
  runtimeScene
) {
  // Manually find all the gdjs.BBTextRuntimeObject living on the scene,
  // and pause them.
  var instances = runtimeScene.getAdhocListOfAllInstances();
  for (var i = 0; i < instances.length; ++i) {
    var obj = instances[i];
    if (obj instanceof gdjs.BBTextRuntimeObject) {
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
gdjs.BBTextRuntimeObject.gdjsCallbackRuntimeScenePaused = function(
  runtimeScene
) {
  // Manually find all the gdjs.BBTextRuntimeObject living on the scene,
  // and pause them.
  var instances = runtimeScene.getAdhocListOfAllInstances();
  for (var i = 0; i < instances.length; ++i) {
    var obj = instances[i];
    if (obj instanceof gdjs.BBTextRuntimeObject) {
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
gdjs.BBTextRuntimeObject.gdjsCallbackRuntimeSceneResumed = function(
  runtimeScene
) {
  // Manually find all the gdjs.BBTextRuntimeObject living on the scene,
  // and play them if they have been previously paused.
  var instances = runtimeScene.getAdhocListOfAllInstances();
  for (var i = 0; i < instances.length; ++i) {
    var obj = instances[i];
    if (obj instanceof gdjs.BBTextRuntimeObject) {
      if (obj._pausedAsScenePaused) {
        obj.play();
      }
    }
  }
};
