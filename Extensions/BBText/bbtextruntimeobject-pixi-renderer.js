/**
 * The PIXI.js renderer for the VideoRuntimeObject.
 *
 * @class BBTextRuntimeObjectPixiRenderer
 * @constructor
 * @param {gdjs.BBTextRuntimeObject} runtimeObject The object to render
 * @param {gdjs.RuntimeScene} runtimeScene The gdjs.RuntimeScene in which the object is
 */
gdjs.BBTextRuntimeObjectPixiRenderer = function(runtimeObject, runtimeScene) {
  this._object = runtimeObject;

  // Load (or reset) the text
  if (this._pixiObject === undefined) {
    this._pixiObject = new MultiStyleText(runtimeObject._text, {
      default: {
        fontFamily: runtimeObject._family,
        fontSize: `${runtimeObject._size}px`,
        fill: runtimeObject._color,
        tagStyle: ['[', ']'],
        wordWrap: true,
        wordWrapWidth: runtimeObject._wrappingWidth,
        align: runtimeObject._align,
      },
    });
    // this._pixiObject._style.wordWrapWidth = runtimeObject._wrappingWidth;
    // this._pixiObject.dirty = true;

    console.log('runtime obj', runtimeObject);
    console.log('runtime ee', this._pixiObject);
    console.log('runtime eeeee', this._object);

    this._object.hidden = !runtimeObject._visible;
  } else {
    console.log('runtime obj', runtimeObject._wrappingWidth, this._pixiObject);
    // this._pixiObject._texture.baseTexture.source.currentTime = 0;
  }

  // Needed to avoid video not playing/crashing in Chrome/Chromium browsers.
  // See https://github.com/pixijs/pixi.js/issues/5996

  // this._pixiObject._texture.baseTexture.source.preload = 'auto';
  // this._pixiObject._texture.baseTexture.source.autoload = true;

  // this._textureWasValid = false; // Will be set to true when video texture is loaded.

  runtimeScene
    .getLayer('')
    .getRenderer()
    .addRendererObject(this._pixiObject, runtimeObject.getZOrder());

  // Set the anchor in the center, so that the object rotates around
  // its center
  this._pixiObject.anchor.x = 0.5;
  this._pixiObject.anchor.y = 0.5;

  this.updatePosition();
  this.updateAngle();
  this.updateOpacity();
  this.updateVisible();
};

gdjs.BBTextRuntimeObjectRenderer = gdjs.BBTextRuntimeObjectPixiRenderer;

gdjs.BBTextRuntimeObjectPixiRenderer.prototype.getRendererObject = function() {
  return this._pixiObject;
};

/**
 * To be called when the object is removed from the scene: will pause the video.
 */
gdjs.BBTextRuntimeObjectPixiRenderer.prototype.onDestroy = function() {
  this.pause();
};

gdjs.BBTextRuntimeObjectPixiRenderer.prototype.ensureUpToDate = function() {
  // Make sure that the video is repositioned after the texture was loaded
  // (as width and height will change).
  if (
    !this._textureWasValid &&
    this._pixiObject.texture &&
    this._pixiObject.texture.valid
  ) {
    if (this._pixiObject._style.wordWrapWidth !== this._object._wrappingWidth) {
      this._pixiObject._style.wordWrapWidth = this._object._wrappingWidth;
      this._pixiObject.dirty = true;
    }
    if (this._object._align !== this._pixiObject._style.align) {
      this._pixiObject._style.align = this._object._align;
      this._pixiObject.dirty = true;
    }
    this.updatePosition();
    this._textureWasValid = true;
  }
};

gdjs.BBTextRuntimeObjectPixiRenderer.prototype.updatePosition = function() {
  this._pixiObject.position.x = this._object.x + this._pixiObject.width / 2;
  this._pixiObject.position.y = this._object.y + this._pixiObject.height / 2;
};

gdjs.BBTextRuntimeObjectPixiRenderer.prototype.updateVisible = function() {
  this._pixiObject.hidden = !this._object._visible;
};

gdjs.BBTextRuntimeObjectPixiRenderer.prototype.updateAngle = function() {
  this._pixiObject.rotation = gdjs.toRad(this._object.angle);
};

gdjs.BBTextRuntimeObjectPixiRenderer.prototype.updateOpacity = function() {
  this._pixiObject.alpha = this._object._opacity / 255;
};

gdjs.BBTextRuntimeObjectPixiRenderer.prototype.getWidth = function() {
  return this._pixiObject.width;
};

gdjs.BBTextRuntimeObjectPixiRenderer.prototype.getHeight = function() {
  return this._pixiObject.height;
};

/**
 * Set the rendered video width
 * @param {number} width The new width, in pixels.
 */
gdjs.BBTextRuntimeObjectPixiRenderer.prototype.setWidth = function(width) {
  this._pixiObject.width = width;
  this.updatePosition(); // Position needs to be updated, as position in the center of the PIXI Sprite.
};

/**
 * Set the rendered video height
 * @param {number} height The new height, in pixels.
 */
gdjs.BBTextRuntimeObjectPixiRenderer.prototype.setHeight = function(height) {
  this._pixiObject.height = height;
  this.updatePosition(); // Position needs to be updated, as position in the center of the PIXI Sprite.
};

/**
 * Get the internal HTMLVideoElement used for the video source.
 * @returns {?HTMLVideoElement} The video element, if any.
 */

/**
 * Set the loop on video in renderer
 * @param {boolean} enable true to loop the video
 */
gdjs.BBTextRuntimeObjectPixiRenderer.prototype.setVisible = function(enable) {
  // var source = this._getHTMLVideoElementSource();
  // if (!source) return;
  // source.loop = enable;
};

/**
 * Set or unset mute on the video.
 * @param {boolean} enable true to mute
 */
gdjs.BBTextRuntimeObjectPixiRenderer.prototype.setMute = function(enable) {
  // var source = this._getHTMLVideoElementSource();
  // if (!source) return;
  // this._pixiObject._texture.baseTexture.source.muted = enable;
};

/**
 * Return true if the video is muted.
 */
gdjs.BBTextRuntimeObjectPixiRenderer.prototype.isMuted = function() {
  // var source = this._getHTMLVideoElementSource();
  // if (!source) return false;
  // return source.muted;
};
