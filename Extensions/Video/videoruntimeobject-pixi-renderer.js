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
 * Start the video
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.play = function() {
  var promise = this._pixiObject._texture.baseTexture.source.play();

  if (promise !== undefined) {
    promise
      .then(() => {
        // Autoplay started
      })
      .catch(() => {
        // Autoplay was prevented.
        console.log("The video don't start because any interaction with the game has been captured before. This is blocked by the navigator. https://goo.gl/xX8pDD");
      });
  }
};

/**
 * Pause the video
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.pause = function() {
  var promise = this._pixiObject._texture.baseTexture.source.pause();

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
 * @param {boolean} bool The new state of looped.
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.setLoop = function(bool) {
  this._pixiObject._texture.baseTexture.source.loop = bool;
};

/**
 * Set or unset mute on the video.
 * @param {boolean} bool The new state of muted.
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.setMute = function(bool) {
  this._pixiObject._texture.baseTexture.source.muted = bool;
};

/**
 * Return true if the video is muted.
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.isMuted = function() {
  return this._pixiObject._texture.baseTexture.source.muted;
};

/**
 * Set the current time of the video.
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.setCurrentTime = function(
  number
) {
  this._pixiObject._texture.baseTexture.source.currentTime = number;
};

/**
 * Set the volume of the video, between 0 and 1.
 * @param {number} volume The new volume.
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.setVolume = function(volume) {
  this._pixiObject._texture.baseTexture.source.volume = volume;
};

/**
 * Get the volume on video, between 0 and 1.
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.getVolume = function() {
  return this._pixiObject._texture.baseTexture.source.volume;
};

/**
 * Return true if the video is playing
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.isPlayed = function() {
  return (
    !this._pixiObject._texture.baseTexture.source.paused &&
    !this._pixiObject._texture.baseTexture.source.ended
  );
};

/**
 * Return true if the video is looping
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.isLooped = function() {
  return this._pixiObject._texture.baseTexture.source.loop;
};

/**
 * Get the current time of the playback.
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.getCurrentTime = function() {
  return this._pixiObject._texture.baseTexture.source.currentTime;
};

/**
 * Get the duration of the video.
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.getDuration = function() {
  return this._pixiObject._texture.baseTexture.source.duration;
};

/**
 * Return true if the video is ended.
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.isEnded = function() {
  return this._pixiObject._texture.baseTexture.source.ended;
};

/**
 * Set the playback speed (1 = 100%)
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.setPlaybackSpeed = function(
  number
) {
  this._pixiObject._texture.baseTexture.source.playbackRate = number;
};

/**
 * Return the playback speed (1 = 100%)
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.getPlaybackSpeed = function() {
  return this._pixiObject._texture.baseTexture.source.playbackRate;
};
