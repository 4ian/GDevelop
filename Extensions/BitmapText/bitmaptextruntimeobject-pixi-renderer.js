/**
 * @constructor
 * @memberof gdjs
 * @class BitmapFontManager
 */
gdjs.BitmapFontManager = {
  _fontUsed: [],
  _fontTobeUnloaded: [],
};

/**
 * When an object use an bitmapFont register the slug of the font,
 * and how many objects use it.
 * @param {string} name Slug of the bitmapFont
 */
gdjs.BitmapFontManager.setFontUsed = function (name) {
  if (gdjs.BitmapFontManager._fontUsed[name]) {
    gdjs.BitmapFontManager._fontUsed[name].objectsUsingTheFont =
      gdjs.BitmapFontManager._fontUsed[name].objectsUsingTheFont + 1 || 1;
  } else {
    gdjs.BitmapFontManager._fontUsed[name] = {
      objectsUsingTheFont: 1,
    };
  }
};

/**
 * When an bitmapText object is removed, decrease the count of objects related to the font in the manager.
 * When an font is unused the font goes in a temporary cache where if there is more than 10 fonts, the lastest is deleted.
 * @param {string} name Slug of the bitmapFont
 */
gdjs.BitmapFontManager.removeFontUsed = function (name) {
  if (gdjs.BitmapFontManager._fontUsed[name]) {
    gdjs.BitmapFontManager._fontUsed[name].objectsUsingTheFont =
      gdjs.BitmapFontManager._fontUsed[name].objectsUsingTheFont - 1 || 0;
  }

  if (gdjs.BitmapFontManager._fontUsed[name].objectsUsingTheFont <= 0) {
    gdjs.BitmapFontManager._fontTobeUnloaded[name] =
      gdjs.BitmapFontManager._fontUsed[name];
    delete gdjs.BitmapFontManager._fontUsed[name];

    const countFontToBeUnloaded = Object.keys(
      gdjs.BitmapFontManager._fontTobeUnloaded
    ).length;
    const lastFontStored = Object.keys(gdjs.BitmapFontManager._fontTobeUnloaded)[Object.keys(gdjs.BitmapFontManager._fontTobeUnloaded).length - 1];

    //Cache for minimum 10 bitmap fonts
    if (countFontToBeUnloaded > 10) {
      PIXI.BitmapFont.uninstall(lastFontStored);
      delete gdjs.BitmapFontManager._fontTobeUnloaded[lastFontStored];
      console.log('Delete the bitmapFont: ' + lastFontStored);
    }
  }
};

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
  this._bitmapFontStyle = new PIXI.TextStyle();
  this._bitmapFontStyle.fontFamily = runtimeScene
    .getGame()
    .getFontManager()
    .getFontFamily(runtimeObject._fontResourceName);
  this._bitmapFontStyle.fontSize = runtimeObject._fontSize;
  this._bitmapFontStyle.fill = gdjs.rgbToHexNumber(
    runtimeObject._fontColor[0],
    runtimeObject._fontColor[1],
    runtimeObject._fontColor[2]
  );

  // Load (or reset) the text
  if (this._pixiObject === undefined) {
    this._pixiObject = new PIXI.BitmapText('BitmapText object', {
      fontName: this._ensureFontAvailableAndGetFontName(),
    });
  } else {
    this.updateFont();
    this.updateFontSize();
  }

  runtimeScene
    .getLayer('')
    .getRenderer()
    .addRendererObject(this._pixiObject, runtimeObject.getZOrder());

  // Set the anchor in the center, so that the object rotates around
  // its center.
  this._pixiObject.anchor.x = 0.5;
  this._pixiObject.anchor.y = 0.5;

  this.updateAlignment();
  this.updateTextContent();
  this.updatePosition();
  this.updateAngle();
  this.updateOpacity();
  this.updateWrappingWidth();
};

gdjs.BitmapTextRuntimeObjectRenderer = gdjs.BitmapTextRuntimeObjectPixiRenderer;

gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.getRendererObject = function () {
  return this._pixiObject;
};

gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.onDestroy = function () {
  //TODO: Mark the font from the object not used anymore

  console.log('onDestroyFromScene');
  console.log('Uninstall bitmapFont: ' + this._pixiObject._fontName);
  gdjs.BitmapFontManager.removeFontUsed(this._pixiObject._fontName);
};

gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype._ensureFontAvailableAndGetFontName = function (
  oldFont
) {
  const slugFontName =
    this._bitmapFontStyle.fontFamily +
    '-' +
    this._bitmapFontStyle.fontSize +
    '-' +
    this._bitmapFontStyle.fill +
    '-bitmapFont';

  // Load the font if it's not available yet.
  if (!PIXI.BitmapFont.available[slugFontName]) {
    console.info('Generating font "' + slugFontName + '" for BitmapText.');
    PIXI.BitmapFont.from(slugFontName, this._bitmapFontStyle, {
      chars: PIXI.BitmapFont.ASCII,
      textureWidth: 1024,
    });
  }

  gdjs.BitmapFontManager.setFontUsed(slugFontName);

  if (oldFont) {
    gdjs.BitmapFontManager.removeFontUsed(oldFont);
  }

  // TODO: find a way to unload the BitmapFont that are not used anymore, otherwise
  // we risk filling up the memory with useless BitmapFont - especially when the user
  // plays with the color/size.

  return slugFontName;
};

gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.updateColor = function () {
  this._bitmapFontStyle.fill = gdjs.rgbToHexNumber(
    this._object._fontColor[0],
    this._object._fontColor[1],
    this._object._fontColor[2]
  );
  this._pixiObject.fontName = this._ensureFontAvailableAndGetFontName(
    this._pixiObject.fontName
  );
};

gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.updateFont = function () {
  this._bitmapFontStyle.fontFamily = this._object._runtimeScene
    .getGame()
    .getFontManager()
    .getFontFamily(this._object._fontResourceName);
  this._pixiObject.fontName = this._ensureFontAvailableAndGetFontName(
    this._pixiObject.fontName
  );
};

gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.updateFontSize = function () {
  this._bitmapFontStyle.fontSize = this._object._fontSize;
  this._pixiObject.fontSize = this._object._fontSize;
  this._pixiObject.fontName = this._ensureFontAvailableAndGetFontName(
    this._pixiObject.fontName
  );
};

gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.updateWrappingWidth = function () {
  if (this._object._wordWrap) {
    this._pixiObject.maxWidth = this._object._wrappingWidth;
  } else {
    this._pixiObject.maxWidth = 0;
  }
  this.updatePosition();
};

gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.updateTextContent = function () {
  this._pixiObject.text = this._object._text;
  this.updatePosition();
};

gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.updateAlignment = function () {
  this._pixiObject.align = this._object._align;
};

gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.updatePosition = function () {
  // Note: use `textWidth` as `width` seems unreliable.
  this._pixiObject.position.x = this._object.x + this._pixiObject.textWidth / 2;
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
