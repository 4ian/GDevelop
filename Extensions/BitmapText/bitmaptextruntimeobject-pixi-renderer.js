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

  // Load (or reset) the text
  if (this._pixiObject === undefined) {
    this.style = new PIXI.TextStyle();

    this.style.fontFamily = runtimeScene
      .getGame()
      .getFontManager()
      .getFontFamily(runtimeObject._fontFamily);
    this.style.fill = runtimeObject._color;
    this.style.fontSize = runtimeObject._fontSize;
    this._pixiObject.fontSize = runtimeObject._fontSize;
//  this.style.size = runtimeObject._fontSize + 'px';
    this.style.align = runtimeObject._align;

    PIXI.BitmapFont.from('basicBitmap', this.style);

    this._pixiObject = new PIXI.BitmapText('BitmapText pixi renderer', {
      fontName: 'basicBitmap'
    });
  } else {
    this.updateColor();
    this.updateAlignment();
    this.updateFontFamily();
    this.updateFontSize();
  }

  runtimeScene
    .getLayer('')
    .getRenderer()
    .addRendererObject(this._pixiObject, runtimeObject.getZOrder());

  // Set the anchor in the center, so that the object rotates around
  // its center
  this._pixiObject.anchor.x = 0.5;
  this._pixiObject.anchor.y = 0.5;

  this.updateText();
  this.updatePosition();
  this.updateAngle();
  this.updateOpacity();
};

gdjs.BitmapTextRuntimeObjectRenderer = gdjs.BitmapTextRuntimeObjectPixiRenderer;

gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.getRendererObject = function() {
  return this._pixiObject;
};

gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.updateWordWrap = function() {
  this._pixiObject._style.wordWrap = this._object._wordWrap;
  this._pixiObject.dirty = true;
  this.updatePosition();
};

gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.updateWrappingWidth = function() {
  this._pixiObject._style.wordWrapWidth = this._object._wrappingWidth;
  this._pixiObject.dirty = true;
  this.updatePosition();
};

gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.updateText = function() {
  this._pixiObject.text = this._object._text;
  this.updatePosition();
};

gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.updateColor = function() {
  this.style.fill = this._object._color;
  this._pixiObject.dirty = true;
};

gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.updateAlignment = function() {
  this.style.align = this._object._align;
  this._pixiObject.dirty = true;
};
gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.updateFontFamily = function() {
  this.style.fontFamily = this._object._runtimeScene
    .getGame()
    .getFontManager()
    .getFontFamily(this._object._fontFamily);
  this._pixiObject.dirty = true;
};
gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.updateFontSize = function() {
  this.style.fontSize = this._object._fontSize;
  debugger;
  this._pixiObject.fontSize = this._object._fontSize;
  this._pixiObject.dirty = true;
};

gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.updatePosition = function() {
  this._pixiObject.position.x = this._object.x + this._pixiObject.width / 2;
  this._pixiObject.position.y = this._object.y + this._pixiObject.height / 2;
};

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
