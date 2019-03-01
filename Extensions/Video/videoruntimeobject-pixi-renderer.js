/**
 * The PIXI.js renderer for the VideoRuntimeObject.
 *
 * @class VideoRuntimeObjectPixiRenderer
 * @constructor
 * @param {gdjs.VideoRuntimeObject} runtimeObject The object to render
 * @param {gdjs.RuntimeScene} runtimeScene The gdjs.RuntimeScene in which the object is
 */
gdjs.VideoRuntimeObjectPixiRenderer = function (runtimeObject, runtimeScene) {
  this._object = runtimeObject;

  if (this._pixiObject === undefined) {
    this._textureVideo = new PIXI.Texture.fromVideo(
      "C:/Users/RTX-Bouh/Desktop/test_video_GD.mp4"
    );

    this._pixiObject = new PIXI.Sprite(this._textureVideo);

    this._pixiObject._texture.baseTexture.source.pause();
  } else {
    this._pixiObject._texture.baseTexture.source.currentTime = 0;
    this._pixiObject._texture.baseTexture.source.pause();
  }

  //this._pixiObject.anchor.x = 0.5;
  //this._pixiObject.anchor.y = 0.5;
  runtimeScene
    .getLayer("")
    .getRenderer()
    .addRendererObject(this._pixiObject, runtimeObject.getZOrder());

  this.updatePosition();
  this.updateAngle();
  this.updateOpacity();
};

gdjs.VideoRuntimeObjectRenderer = gdjs.VideoRuntimeObjectPixiRenderer;

gdjs.VideoRuntimeObjectPixiRenderer.prototype.getRendererObject = function () {
  return this._pixiObject;
};

gdjs.VideoRuntimeObjectPixiRenderer.prototype.updatePosition = function () {
  this._pixiObject.position.x = this._object.x;
  this._pixiObject.position.y = this._object.y;
};

gdjs.VideoRuntimeObjectPixiRenderer.prototype.updateAngle = function () {
  this._pixiObject.rotation = gdjs.toRad(this._object.angle);
};

gdjs.VideoRuntimeObjectPixiRenderer.prototype.updateOpacity = function () {
  this._pixiObject.alpha = this._object._opacity / 255;
};

gdjs.VideoRuntimeObjectPixiRenderer.prototype.getWidth = function () {
  return this._pixiObject.width;
};

gdjs.VideoRuntimeObjectPixiRenderer.prototype.getHeight = function () {
  return this._pixiObject.height;
};

gdjs.VideoRuntimeObjectPixiRenderer.prototype.updateWidth = function () {
  this._pixiObject.width = this._object._width;
  this.updatePosition();
};

gdjs.VideoRuntimeObjectPixiRenderer.prototype.updateHeight = function () {
  this._pixiObject.height = this._object._height;
  this.updatePosition();
};

/**
 * Start the object video in renderer
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.play = function () {
  var promise = this._pixiObject._texture.baseTexture.source.play();

  if (promise !== undefined) {
    promise
      .then(_ => {
        // Autoplay started!
      })
      .catch(error => {
        // Autoplay was prevented.
      });
  }
};

/**
 * Pause the object video in renderer
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.pause = function () {
  var promise = this._pixiObject._texture.baseTexture.source.pause();

  if (promise !== undefined) {
    promise
      .then(_ => {
        // Autoplay started!
      })
      .catch(error => {
        // Autoplay was prevented.
      });
  }
};

/**
 * Set the loop on video in renderer
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.setLoop = function (bool) {
  this._pixiObject._texture.baseTexture.source.loop = bool;
};

/**
 * Set the mute on video in renderer
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.setMute = function (bool) {
  this._pixiObject._texture.baseTexture.source.muted = bool;
};

/**
 * Return state of mute on video in renderer
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.isMuted = function () {
  return this._pixiObject._texture.baseTexture.source.muted;
};

/**
 * Set the time on video in renderer
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.setCurrentTime = function (
  number
) {
  this._pixiObject._texture.baseTexture.source.currentTime = number;
};

/**
 * Set the volume on video in renderer
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.setVolume = function (volume) {
  this._pixiObject._texture.baseTexture.source.volume = volume;
};

/**
 * Get the volume on video
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.getVolume = function () {
  return this._pixiObject._texture.baseTexture.source.volume;
};

/**
 * Return state of play on video in renderer
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.isPlayed = function () {
  return !this._pixiObject._texture.baseTexture.source.paused;
};

/**
 * Return state of loop on video in renderer
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.isLooped = function () {
  return this._pixiObject._texture.baseTexture.source.loop;
};

/**
 * Get current time on video in renderer
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.getCurrentTime = function () {
  return this._pixiObject._texture.baseTexture.source.currentTime;
};

/**
 * Get duration of the video in renderer
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.getDuration = function () {
  return this._pixiObject._texture.baseTexture.source.duration;
};

/**
 * Return state of ended on video in renderer
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.isEnded = function () {
  return this._pixiObject._texture.baseTexture.source.ended;
};

/**
 * Set speed, 1 = 100%
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.setPlaybackSpeed = function (
  number
) {
  this._pixiObject._texture.baseTexture.source.playbackRate = number;
};

/**
 * Return speed 0-1, default 1
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.getPlaybackSpeed = function () {
  return this._pixiObject._texture.baseTexture.source.playbackRate;
};