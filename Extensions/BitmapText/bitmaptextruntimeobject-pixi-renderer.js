/**
 * The PIXI.js renderer for the Bitmap Text runtime object.
 *
 * @class BitmapTextRuntimeObjectPixiRenderer
 * @constructor
 * @param {gdjs.BitmapTextRuntimeObject} runtimeObject The object to render
 * @param {gdjs.RuntimeScene} runtimeScene The gdjs.RuntimeScene in which the object is
 */
gdjs.BitmapTextRuntimeObjectPixiRenderer = function (
  runtimeObject,
  runtimeScene
) {
  this._object = runtimeObject;

  // Set up the object to track the font we're using.
  this._bitmapFontStyle = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 20,
    align: runtimeObject._align,
    fill: '#000000',
    wordWrap: runtimeObject._wordWrap,
  });

  const defaultSlugFontName =
    this._bitmapFontStyle.fontFamily +
    '-' +
    this._bitmapFontStyle.fontSize +
    '-' +
    this._bitmapFontStyle.fill +
    '-bitmapFont';
  this._bitmapFontStyle.fontName = defaultSlugFontName;

  //Generate default bitmap font
  PIXI.BitmapFont.from(defaultSlugFontName, this._bitmapFontStyle, {
    chars: [
      [' ', '~'], // All the printable ASCII characters
    ],
  });

  this._pixiObject = new PIXI.BitmapText(runtimeObject._text, {
    fontName: defaultSlugFontName,
  });

  let bitmapFontResourceName = runtimeObject._bitmapFontFile;
  let bitmapAtlasResourceName = runtimeObject._bitmapAtlasFile;

  let texture = runtimeScene
    .getGame()
    .getImageManager()
    .getPIXITexture(bitmapAtlasResourceName);

  // Get the bitmap font file and use the texture for generate the bitmapFont (PIXI.BitmapFont) and return the fontName ready to use.
  const bitmapFont = runtimeScene
    .getGame()
    .getBitmapFontManager()
    .getBitmapFontFromData(bitmapFontResourceName, texture);
  this._pixiObject.fontName = bitmapFont.font;
  this._pixiObject.fontSize = bitmapFont.size;

  runtimeScene
    .getLayer('')
    .getRenderer()
    .addRendererObject(this._pixiObject, runtimeObject.getZOrder());

  // Set the anchor in the center, so that the object rotates around
  // its center.
  this._pixiObject.anchor.x = 0.5;
  this._pixiObject.anchor.y = 0.5;

  this.updatePosition();
  this.updateAlignment();
  this.updateTextContent();
  this.updatePosition();
  this.updateAngle();
  this.updateOpacity();
  this.updateScale();
  this.updateWrappingWidth();
  this.updateTint();
};

gdjs.BitmapTextRuntimeObjectRenderer = gdjs.BitmapTextRuntimeObjectPixiRenderer;

gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.getRendererObject = function () {
  return this._pixiObject;
};

gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.onDestroy = function () {
  // Mark the font from the object not used anymore.
  gdjs.BitmapFontManager.removeFontUsed(this._pixiObject._fontName);
};

gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.getFontSize = function () {
  return this._pixiObject.fontSize;
};

gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.updateFont = function () {
  const bitmapFontResourceName = this._object._bitmapFontFile;
  const bitmapAtlasResourceName = this._object._bitmapAtlasFile;

  // Get the texture used in the bitmap font
  const texture = this._object._runtimeScene
    .getGame()
    .getImageManager()
    .getPIXITexture(bitmapAtlasResourceName);

  // Get the bitmap font file and use the texture for generate the bitmapFont (PIXI.BitmapFont) and return the fontName ready to use.
  const bitmapFont = this._object._runtimeScene
    .getGame()
    .getBitmapFontManager()
    .getBitmapFontFromData(bitmapFontResourceName, texture);

  this._pixiObject.fontName = bitmapFont.font;
  this._pixiObject.fontSize = bitmapFont.size;
  this.updatePosition();
};

gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.updateTint = function () {
  this._pixiObject.tint = gdjs.rgbToHexNumber(
    this._object._tint[0],
    this._object._tint[1],
    this._object._tint[2]
  );
  this._pixiObject.dirty = true;
};

/**
 * Get the tint of the bitmap object as a "R;G;B" string.
 * @returns {string} the tint of bitmap object in "R;G;B" format.
 */
gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.getTint = function () {
  return (
    this._object._tint[0] +
    ';' +
    this._object._tint[1] +
    ';' +
    this._object._tint[2]
  );
};

gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.updateScale = function () {
  this._pixiObject.scale.set(this._object._scale);
  this.updatePosition();
};

gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.getScale = function () {
  return Math.max(this._pixiObject.scale.x, this._pixiObject.scale.y);
};

gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.updateWrappingWidth = function () {
  if (this._object._wordWrap) {
    this._pixiObject.maxWidth =
      this._object._wrappingWidth / this._object._scale;
    this._pixiObject.dirty = true;
  } else {
    this._pixiObject.maxWidth = 0;
    this._pixiObject.dirty = true;
  }
  this.updatePosition();
};

gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.updateTextContent = function () {
  this._pixiObject.text = this._object._text;
  this.updatePosition();
};

gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.updateAlignment = function () {
  this._pixiObject.align = this._object._align;
  this.updatePosition();
};

gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.updatePosition = function () {
  this._pixiObject.position.x = this._object.x + this._pixiObject.width / 2;
  this._pixiObject.position.y = this._object.y + this._pixiObject.height / 2;
};

gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.updateAngle = function () {
  this._pixiObject.rotation = gdjs.toRad(this._object.angle);
};

gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.updateOpacity = function () {
  this._pixiObject.alpha = this._object._opacity / 255;
};

gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.getWidth = function () {
  return this._pixiObject.textWidth;
};

gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.getHeight = function () {
  return this._pixiObject.height;
};
