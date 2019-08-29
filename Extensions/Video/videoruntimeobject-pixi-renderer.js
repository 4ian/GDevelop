/**
 * The PIXI.js renderer for the VideoRuntimeObject.
 *
 * @class VideoRuntimeObjectPixiRenderer
 * @constructor
 * @param {gdjs.VideoRuntimeObject} runtimeObject The object to render
 * @param {gdjs.RuntimeScene} runtimeScene The gdjs.RuntimeScene in which the object is
 */
gdjs.VideoRuntimeObjectPixiRenderer = function(runtimeObject, runtimeScene) {
  this._object = runtimeObject;

  // Load (or reset) the video
  if (this._pixiObject === undefined) {
    this._pixiObject = new PIXI.Sprite(
      runtimeScene
        .getGame()
        .getImageManager()
        .getPIXIVideoTexture(this._object._videoResource)
    );
    this._pixiObject._texture.baseTexture.autoPlay = false;
  } else {
    this._pixiObject._texture.baseTexture.source.currentTime = 0;
  }
  
  // Needed to avoid video not playing/crashing in Chrome/Chromium browsers.
  // See https://github.com/pixijs/pixi.js/issues/5996
  this._pixiObject._texture.baseTexture.source.preload = "auto";
  this._pixiObject._texture.baseTexture.source.autoload = true;
  
  this._textureWasValid = false; // Will be set to true when video texture is loaded.

  runtimeScene
    .getLayer("")
    .getRenderer()
    .addRendererObject(this._pixiObject, runtimeObject.getZOrder());

  // Set the anchor in the center, so that the object rotates around
  // its center
  this._pixiObject.anchor.x = 0.5;
  this._pixiObject.anchor.y = 0.5;

  this.updatePosition();
  this.updateAngle();
  this.updateOpacity();
  this.updateVolume();
  this.updateLoop();
};

gdjs.VideoRuntimeObjectRenderer = gdjs.VideoRuntimeObjectPixiRenderer;

gdjs.VideoRuntimeObjectPixiRenderer.prototype.getRendererObject = function() {
  return this._pixiObject;
};

/**
 * To be called when the object is removed from the scene: will pause the video.
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.onDestroy = function() {
  this.pause();
};

gdjs.VideoRuntimeObjectPixiRenderer.prototype.ensureUpToDate = function() {
  // Make sure that the video is repositioned after the texture was loaded
  // (as width and height will change).
  if (
    !this._textureWasValid &&
    this._pixiObject.texture &&
    this._pixiObject.texture.valid
  ) {
    this.updatePosition();
    this._textureWasValid = true;
  }
};

gdjs.VideoRuntimeObjectPixiRenderer.prototype.updatePosition = function() {
  this._pixiObject.position.x = this._object.x + this._pixiObject.width / 2;
  this._pixiObject.position.y = this._object.y + this._pixiObject.height / 2;
};

gdjs.VideoRuntimeObjectPixiRenderer.prototype.updateLoop = function() {
  this._pixiObject._texture.baseTexture.source.loop = this._object._loop;
};

gdjs.VideoRuntimeObjectPixiRenderer.prototype.updateVolume = function() {
  this._pixiObject._texture.baseTexture.source.volume =
    this._object._volume / 100;
};

gdjs.VideoRuntimeObjectPixiRenderer.prototype.updateAngle = function() {
  this._pixiObject.rotation = gdjs.toRad(this._object.angle);
};

gdjs.VideoRuntimeObjectPixiRenderer.prototype.updateOpacity = function() {
  this._pixiObject.alpha = this._object._opacity / 255;
};

gdjs.VideoRuntimeObjectPixiRenderer.prototype.getWidth = function() {
  return this._pixiObject.width;
};

gdjs.VideoRuntimeObjectPixiRenderer.prototype.getHeight = function() {
  return this._pixiObject.height;
};

/**
 * Set the rendered video width
 * @param {number} width The new width, in pixels.
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.setWidth = function(width) {
  this._pixiObject.width = width;
  this.updatePosition(); // Position needs to be updated, as position in the center of the PIXI Sprite.
};

/**
 * Set the rendered video height
 * @param {number} height The new height, in pixels.
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.setHeight = function(height) {
  this._pixiObject.height = height;
  this.updatePosition(); // Position needs to be updated, as position in the center of the PIXI Sprite.
};

/**
 * Get the internal HTMLVideoElement used for the video source.
 * @returns {?HTMLVideoElement} The video element, if any.
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype._getHTMLVideoElementSource = function() {
  if (
    !this._pixiObject.texture ||
    !this._pixiObject.texture.baseTexture.source
  ) {
    return null;
  }

  var source = this._pixiObject.texture.baseTexture.source;
  if (!source instanceof HTMLVideoElement) {
    return null;
  }

  return source;
};

/**
 * Start the video
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.play = function() {
  var source = this._getHTMLVideoElementSource();
  if (!source) return;

  var promise = source.play();
  if (promise !== undefined) {
    promise
      .then(() => {
        // Autoplay started
      })
      .catch(() => {
        // Autoplay was prevented.
        console.warn(
          "The video did not start because: video is invalid or no interaction with the game has been captured before (this is blocked by the navigator: https://goo.gl/xX8pDD)"
        );
      });
  }
};

/**
 * Pause the video
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.pause = function() {
  var source = this._getHTMLVideoElementSource();
  if (!source) return;

  var promise = source.pause();
  if (promise !== undefined) {
    promise
      .then(() => {
        // Autoplay started
      })
      .catch(() => {
        // Autoplay was prevented.
      });
  }
};

/**
 * Set the loop on video in renderer
 * @param {boolean} enable true to loop the video
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.setLoop = function(enable) {
  var source = this._getHTMLVideoElementSource();
  if (!source) return;

  source.loop = enable;
};

/**
 * Set or unset mute on the video.
 * @param {boolean} enable true to mute
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.setMute = function(enable) {
  var source = this._getHTMLVideoElementSource();
  if (!source) return;

  this._pixiObject._texture.baseTexture.source.muted = enable;
};

/**
 * Return true if the video is muted.
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.isMuted = function() {
  var source = this._getHTMLVideoElementSource();
  if (!source) return false;

  return source.muted;
};

/**
 * Set the current time of the video.
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.setCurrentTime = function(
  number
) {
  var source = this._getHTMLVideoElementSource();
  if (!source) return;

  source.currentTime = number;
};

/**
 * Set the volume of the video, between 0 and 1.
 * @param {number} volume The new volume.
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.setVolume = function(volume) {
  var source = this._getHTMLVideoElementSource();
  if (!source) return;

  source.volume = volume;
};

/**
 * Get the volume on video, between 0 and 1.
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.getVolume = function() {
  var source = this._getHTMLVideoElementSource();
  if (!source) return 0;

  return source.volume;
};

/**
 * Return true if the video is playing
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.isPlayed = function() {
  var source = this._getHTMLVideoElementSource();
  if (!source) return false;

  return !source.paused && !source.ended;
};

/**
 * Return true if the video is looping
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.isLooped = function() {
  var source = this._getHTMLVideoElementSource();
  if (!source) return false;

  return source.loop;
};

/**
 * Get the current time of the playback.
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.getCurrentTime = function() {
  var source = this._getHTMLVideoElementSource();
  if (!source) return 0;

  return source.currentTime;
};

/**
 * Get the duration of the video.
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.getDuration = function() {
  var source = this._getHTMLVideoElementSource();
  if (!source) return 0;

  return source.duration;
};

/**
 * Return true if the video has ended.
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.isEnded = function() {
  var source = this._getHTMLVideoElementSource();
  if (!source) return false;

  return source.ended;
};

/**
 * Set the playback speed (1 = 100%)
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.setPlaybackSpeed = function(
  playbackRate
) {
  var source = this._getHTMLVideoElementSource();
  if (!source) return false;

  source.playbackRate = playbackRate;
};

/**
 * Return the playback speed (1 = 100%)
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.getPlaybackSpeed = function() {
  var source = this._getHTMLVideoElementSource();
  if (!source) return 0;

  return source.playbackRate;
};
