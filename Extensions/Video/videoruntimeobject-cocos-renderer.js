/**
 * The Cocos2D-JS renderer for the VideoRuntimeObject.
 *
 * The implementation is empty as the object is not supported in Cocos2D-JS for now.
 *
 * @class VideoRuntimeObjectCocosRenderer
 * @constructor
 * @param {gdjs.VideoRuntimeObject} runtimeObject The object to render
 * @param {gdjs.RuntimeScene} runtimeScene The gdjs.RuntimeScene in which the object is
 */
gdjs.VideoRuntimeObjectCocosRenderer = function(runtimeObject, runtimeScene) {};

gdjs.VideoRuntimeObjectRenderer = gdjs.VideoRuntimeObjectCocosRenderer;

gdjs.VideoRuntimeObjectCocosRenderer.prototype.getRendererObject = function() {};

/**
 * To be called when the object is removed from the scene: will pause the video.
 */
gdjs.VideoRuntimeObjectCocosRenderer.prototype.onDestroy = function() {};

gdjs.VideoRuntimeObjectCocosRenderer.prototype.ensureUpToDate = function() {};

gdjs.VideoRuntimeObjectCocosRenderer.prototype.updatePosition = function() {};

gdjs.VideoRuntimeObjectCocosRenderer.prototype.updateLoop = function() {};

gdjs.VideoRuntimeObjectCocosRenderer.prototype.updateVolume = function() {};

gdjs.VideoRuntimeObjectCocosRenderer.prototype.updateAngle = function() {};

gdjs.VideoRuntimeObjectCocosRenderer.prototype.updateOpacity = function() {};

gdjs.VideoRuntimeObjectCocosRenderer.prototype.getWidth = function() {
  return 0;
};

gdjs.VideoRuntimeObjectCocosRenderer.prototype.getHeight = function() {
  return 0;
};

/**
 * Set the rendered video width
 * @param {number} width The new width, in pixels.
 */
gdjs.VideoRuntimeObjectCocosRenderer.prototype.setWidth = function(width) {};

/**
 * Set the rendered video height
 * @param {number} height The new height, in pixels.
 */
gdjs.VideoRuntimeObjectCocosRenderer.prototype.setHeight = function(height) {};

/**
 * Start the video
 */
gdjs.VideoRuntimeObjectCocosRenderer.prototype.play = function() {};

/**
 * Pause the video
 */
gdjs.VideoRuntimeObjectCocosRenderer.prototype.pause = function() {};

/**
 * Set the loop on video in renderer
 * @param {boolean} enable true to loop the video
 */
gdjs.VideoRuntimeObjectCocosRenderer.prototype.setLoop = function(enable) {};

/**
 * Set or unset mute on the video.
 * @param {boolean} enable true to mute
 */
gdjs.VideoRuntimeObjectCocosRenderer.prototype.setMute = function(enable) {};

/**
 * Return true if the video is muted.
 */
gdjs.VideoRuntimeObjectCocosRenderer.prototype.isMuted = function() {
  return true;
};

/**
 * Set the current time of the video.
 */
gdjs.VideoRuntimeObjectCocosRenderer.prototype.setCurrentTime = function(
  number
) {};

/**
 * Set the volume of the video, between 0 and 1.
 * @param {number} volume The new volume.
 */
gdjs.VideoRuntimeObjectCocosRenderer.prototype.setVolume = function(volume) {};

/**
 * Get the volume on video, between 0 and 1.
 */
gdjs.VideoRuntimeObjectCocosRenderer.prototype.getVolume = function() {
  return 1;
};

/**
 * Return true if the video is playing
 */
gdjs.VideoRuntimeObjectCocosRenderer.prototype.isPlayed = function() {
  return false;
};

/**
 * Return true if the video is looping
 */
gdjs.VideoRuntimeObjectCocosRenderer.prototype.isLooped = function() {
  return false;
};

/**
 * Get the current time of the playback.
 */
gdjs.VideoRuntimeObjectCocosRenderer.prototype.getCurrentTime = function() {
  return 0;
};

/**
 * Get the duration of the video.
 */
gdjs.VideoRuntimeObjectCocosRenderer.prototype.getDuration = function() {
  return 0;
};

/**
 * Return true if the video has ended.
 */
gdjs.VideoRuntimeObjectCocosRenderer.prototype.isEnded = function() {
  return false;
};

/**
 * Set the playback speed (1 = 100%)
 */
gdjs.VideoRuntimeObjectCocosRenderer.prototype.setPlaybackSpeed = function(
  playbackRate
) {};

/**
 * Return the playback speed (1 = 100%)
 */
gdjs.VideoRuntimeObjectCocosRenderer.prototype.getPlaybackSpeed = function() {
  return 0;
};
