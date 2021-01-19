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
  this._bitmapFontStyle.fontFamily = 'Arial';
  this._bitmapFontStyle.fontSize = runtimeObject._fontSize;
  this._bitmapFontStyle.align = runtimeObject._align;
  this._bitmapFontStyle.wordWrap = runtimeObject._wordWrap;
  this._bitmapFontStyle.fill = gdjs.rgbToHexNumber(
    runtimeObject._fontColor[0],
    runtimeObject._fontColor[1],
    runtimeObject._fontColor[2]
  );

  const defaultSlugFontName =
    this._bitmapFontStyle.fontFamily +
    '-' +
    this._bitmapFontStyle.fontSize +
    '-' +
    this._bitmapFontStyle.fill +
    '-bitmapFont';
  this._bitmapFontStyle.fontName = defaultSlugFontName;

  // Load (or reset) the text
  if (this._pixiObject === undefined) {
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
    let bitmapTextureResourceName = runtimeObject._bitmapTextureFile;

    let texture = runtimeScene
      .getGame()
      .getImageManager()
      .getPIXITexture(bitmapTextureResourceName);

    // Get the bitmap font file and use the texture for generate the bitmapFont (PIXI.BitmapFont) and return the fontName ready to use.
    runtimeScene
      .getGame()
      .getBitmapFontManager()
      .loadBitmapFont(bitmapFontResourceName, texture)
      .then((fontName) => {
        this._pixiObject.fontName = fontName;
        this.updatePosition();
      })
      .catch((error) => {
        console.error('Error while loading a bitmapFont resource:', error);
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
  // Mark the font from the object not used anymore.
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
      chars: [
        [' ', '~'], // All the printable ASCII characters
      ],
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

gdjs.BitmapTextRuntimeObjectPixiRenderer.prototype.updateFont = function () {
  let bitmapFontResourceName = this._object._bitmapFontFile;
  let bitmapTextureResourceName = this._object._bitmapTextureFile;

  // Get the texture used in the bitmap font
  let texture = this._object._runtimeScene
    .getGame()
    .getImageManager()
    .getPIXITexture(bitmapTextureResourceName);

  // Get the bitmap font file and use the texture for generate the bitmapFont (PIXI.BitmapFont) and return the fontName ready to use.
  this._object._runtimeScene
    .getGame()
    .getBitmapFontManager()
    .loadBitmapFont(bitmapFontResourceName, texture)
    .then((fontName) => {
      this._pixiObject.fontName = fontName;
    })
    .catch((error) => {
      console.error('Error while loading a bitmapFont resource:', error);
    });

  this.updatePosition();
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
  this.updatePosition();
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
