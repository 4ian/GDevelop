/**
 * The PIXI.js renderer for the VideoRuntimeObject.
 *
 * @class VideoRuntimeObjectPixiRenderer
 * @constructor
 * @param {gdjs.VideoRuntimeObject} runtimeObject The object to render
 * @param {gdjs.RuntimeScene} runtimeScene The gdjs.RuntimeScene in which the object is
 */
gdjs.VideoRuntimeObjectPixiRenderer = function(runtimeObject, runtimeScene) {
  this._object = runtimeObject; // Keep a reference to the object to read from it later.

  // Here we're going to create a video text as an example.
  if (this._pixiObject === undefined) {
    this._textureVideo = new PIXI.Texture.fromVideo(
      "C:/Users/RTX-Bouh/Desktop/test_video_GD.mp4"
    );

    //Setup the PIXI object:
    this._pixiObject = new PIXI.Sprite(this._textureVideo);

    this._pixiObject._texture.baseTexture.source.pause();
  }

  //this._pixiObject.anchor.x = 0.5;
  //this._pixiObject.anchor.y = 0.5;
  runtimeScene
    .getLayer("")
    .getRenderer()
    .addRendererObject(this._pixiObject, runtimeObject.getZOrder());

  //this.updatePosition();
};

gdjs.VideoRuntimeObjectRenderer = gdjs.VideoRuntimeObjectPixiRenderer; //Register the class to let the engine use it.

gdjs.VideoRuntimeObjectPixiRenderer.prototype.getRendererObject = function() {
  // Mandatory, return the internal PIXI object used for your object:
  return this._pixiObject;
};

gdjs.VideoRuntimeObjectPixiRenderer.prototype.ensureUpToDate = function() {
  this.updatePosition();
};

gdjs.VideoRuntimeObjectPixiRenderer.prototype.updatePosition = function() {
  this._pixiObject.position.x = this._object.x;
  this._pixiObject.position.y = this._object.y;
};

gdjs.VideoRuntimeObjectPixiRenderer.prototype.updateAngle = function() {
  this._pixiObject.rotation = gdjs.toRad(this._object.angle);
};

gdjs.VideoRuntimeObjectPixiRenderer.prototype.updateOpacity = function(number) {
  //this._object.opacity = this.getOpacity()*255
  //console.log("opacity avant : " + this._pixiObject.alpha + ", "+ this._object.opacity+"/255");
  
  //need 0-1
  //console.log("opacity apres : " + this._pixiObject.alpha + ", "+ this._object.opacity+"/255");
  this._pixiObject.alpha = number;
};

/**
 * Return alpha 0-1
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.getOpacity = function() {
  return this._pixiObject.alpha;
};

gdjs.VideoRuntimeObjectPixiRenderer.prototype.getWidth = function() {
  return this._pixiObject.width;
};

gdjs.VideoRuntimeObjectPixiRenderer.prototype.getHeight = function() {
  return this._pixiObject.height;
};

gdjs.VideoRuntimeObjectPixiRenderer.prototype.updateWidth = function() {
  this._pixiObject.width = this._object.width;
};

gdjs.VideoRuntimeObjectPixiRenderer.prototype.updateWidth = function() {
  this._pixiObject.width = this._object._width;
  this.updatePosition();
};

gdjs.VideoRuntimeObjectPixiRenderer.prototype.updateHeight = function() {
  this._pixiObject.height = this._object._height;
  this.updatePosition();
};

/**
 * Start the object video in renderer
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.play = function() {
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
gdjs.VideoRuntimeObjectPixiRenderer.prototype.pause = function() {
  var promise = this._pixiObject._texture.baseTexture.source.pause();
  
  if (promise !== undefined) {
    promise
    .then(_ => {
      // Autoplay started!
      //console.log("action pause > play !");
      //this._pixiObject._texture.baseTexture.source.pause();
    })
    .catch(error => {
      // Autoplay was prevented.
      //console.log("action pause > pause !");
      //this._pixiObject._texture.baseTexture.source.play();
      // Show a "Play" button so that user can start playback.
    });
  }
};

/**
 * set the loop on video in renderer
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.setLoop = function(bool) {
  this._pixiObject._texture.baseTexture.source.loop = bool;
};

/**
 * set the mute on video in renderer
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.setMute = function(bool) {
  this._pixiObject._texture.baseTexture.source.muted = bool;
};

/**
 * return state of mute on video in renderer
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.isMuted = function() {
  //console.log("#get muted : runtime-renderer ");
  return this._pixiObject._texture.baseTexture.source.muted;
};

/**
 * set the time on video in renderer
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.setCurrentTime = function(number) {
  this._pixiObject._texture.baseTexture.source.currentTime = number;
};

/**
 * set the volume on video in renderer
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.setVolume = function(volume) {
  this._pixiObject._texture.baseTexture.source.volume = volume;
};

/**
 * get the volume on video
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.getVolume = function() {
  //var volume = this._pixiObject._texture.baseTexture.source.volume;
  //return this._normalize(volume, 1, 0)*100;
  return this._pixiObject._texture.baseTexture.source.volume;
};

/**
 * return state of play on video in renderer
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.isPlayed = function() {
  return !this._pixiObject._texture.baseTexture.source.paused;
}; 

/**
 * return state of loop on video in renderer
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.isLooped = function() {
  return this._pixiObject._texture.baseTexture.source.loop;
};

/*
gdjs.VideoRuntimeObjectPixiRenderer.prototype.setControls = function(bool) {
  this._pixiObject._texture.baseTexture.source.controls = bool;
};

gdjs.VideoRuntimeObjectPixiRenderer.prototype.controlsAreShowing = function() {
  //console.log("#get muted : runtime-renderer ");
  return this._pixiObject._texture.baseTexture.source.controls;
};
*/

/**
 * get current time on video in renderer
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.getCurrentTime = function() {
  return this._pixiObject._texture.baseTexture.source.currentTime;
};

/**
 * get duration of the video in renderer
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.getDuration = function() {
  return this._pixiObject._texture.baseTexture.source.duration;
};

/**
 * return state of ended on video in renderer
 */
gdjs.VideoRuntimeObjectPixiRenderer.prototype.isEnded = function() {
  return this._pixiObject._texture.baseTexture.source.ended;
};