/**
 * The PIXI.js renderer for the Bitmap Text runtime object.
 *
 * @class BitmapTextRuntimeObjectPixiRenderer
 * @constructor
 * @param {gdjs.BitmapTextRuntimeObject} runtimeObject The object to render
 * @param {gdjs.RuntimeScene} runtimeScene The gdjs.RuntimeScene in which the object is
 */
gdjs.BitmapTextRuntimeObjectPixiRenderer = function(
  runtimeObject,
  runtimeScene
) {
  this._object = runtimeObject;

  const style = new PIXI.TextStyle();
  style.fontFamily = runtimeScene
    .getGame()
    .getFontManager()
    .getFontFamily(runtimeObject._fontFamily);
  style.fontSize = runtimeObject._fontSize;
  style.wordWrap = runtimeObject._wordWrap;
  style.fill = runtimeObject._color;

  const slugFontName =
    style.fontFamily + '-' + style.fontSize + '-' + style.fill + '-bitmapFont';

  if (!PIXI.BitmapFont.available[slugFontName]) {
    PIXI.BitmapFont.from(slugFontName, style, {
      chars: PIXI.BitmapFont.ASCII,
      textureWidth: 1024,
    });
  }

  // Load (or reset) the text
  if (this._pixiObject === undefined) {
    this._pixiObject = new PIXI.BitmapText('BitmapText object', {
      fontName: slugFontName,
    });

    this._pixiObject.align = runtimeObject._align;

    this.style = style;
    this.constructorSlugFontName = slugFontName;
  } else {
    this.updateColor();
    this.updateAlignment();
    this.updateFontFamily();
    this.updateFontSize();
    this.updateWordWrap();
    this.updateWrappingWidth();
  }

  // update BitmapText with new styles
  this._pixiObject.updateText();

  runtimeScene
    .getLayer('')
    .getRenderer()
    .addRendererObject(this._pixiObject, runtimeObject.getZOrder());

  // Set the anchor in the center, so that the object rotates around
  // its center
  this._pixiObject.anchor.x = 0.5;
  this._pixiObject.anchor.y = 0.5;

  this.updateTextContent();
  this.updatePosition();
  this.updateAngle();
  this.updateOpacity();
};

gdjs.BitmapTextRuntimeObjectRenderer = gdjs.BitmapTextRuntimeObjectPixiRenderer;

gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.getRendererObject = function() {
  return this._pixiObject;
};

// REVIEW comparé le wrap avec celui de l'IDE
gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.updateWordWrap = function() {
  this._pixiObject.style.wordWrap = this._object._wordWrap;
  this._pixiObject.dirty = true;
};

// REVIEW comparé le wrap avec celui de l'IDE
gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.updateWrappingWidth = function() {
  if (this._object._wordWrap) {
    this._pixiObject.maxWidth = this._object._wrappingWidth;
  } else {
    this._pixiObject.maxWidth = 0;
  }
  this._pixiObject.dirty = true;
};

// REVIEW  text - seem OK
gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.updateTextContent = function() {
  this._pixiObject.text = this._object._text;
  this.updatePosition();
};

// REVIEW fill - seem OK
gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.updateColor = function() {
  this.style.fill = this._object._color;
  this._pixiObject.dirty = true;
};

// REVIEW align - seem OK
gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.updateAlignment = function() {
  this._pixiObject.align = this._object._align;
};

// REVIEW fontFamily - seem OK
gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.updateFontFamily = function() {
  this.style.fontFamily = this._object._runtimeScene
    .getGame()
    .getFontManager()
    .getFontFamily(this._object._fontFamily);
  //update bitmapFont
  this._pixiObject.dirty = true;
};
gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.updateFontSize = function() {
  this.style.fontSize = this._object._fontSize;
  this._pixiObject.fontSize = this._object._fontSize;
  this._pixiObject.dirty = true;
};

// FIXME position et placement correspondent pas à l'IDE
gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.updatePosition = function() {
  //debugger;
  this._pixiObject.position.x = this._object.x + this._pixiObject.width / 2;
  this._pixiObject.position.y = this._object.y + this._pixiObject.height / 2;
};

// REVIEW angle
gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.updateAngle = function() {
  this._pixiObject.rotation = gdjs.toRad(this._object.angle);
};

gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.updateOpacity = function() {
  this._pixiObject.alpha = this._object._opacity / 255;
};

gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.getWidth = function() {
  return this._pixiObject.width;
};

gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.getHeight = function() {
  return this._pixiObject.height;
};
