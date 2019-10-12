/**
 * The PIXI.js renderer for the BBCode Text runtime object.
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

    this._object.hidden = !runtimeObject._visible;
  } else {
    console.log('runtime obj', runtimeObject._wrappingWidth, this._pixiObject);
    // this._pixiObject._texture.baseTexture.source.currentTime = 0;
  }

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

gdjs.BBTextRuntimeObjectPixiRenderer.prototype.ensureUpToDate = function() {
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

/**
 * Set the rendered width
 * @param {number} width The new width, in pixels.
 */
gdjs.BBTextRuntimeObjectPixiRenderer.prototype.setWidth = function(width) {
  this._object._wrappingWidth = width;
  this._pixiObject._style.wordWrapWidth = this._object._wrappingWidth;
  this._pixiObject.dirty = true;
  this.updatePosition(); // Position needs to be updated, as position in the center of the PIXI Sprite.
};

gdjs.BBTextRuntimeObjectPixiRenderer.prototype.setBBText = function(text) {
  this._pixiObject.setText(text);
  this._pixiObject.updateText();
  this.updatePosition();
};

gdjs.BBTextRuntimeObjectPixiRenderer.prototype.setBaseProperty = function(
  property,
  value
) {
  switch (property) {
    case 'color':
      const splitValue = value.split(';');
      const hexColor = `#${gdjs.rgbToHex(
        parseInt(splitValue[0]),
        parseInt(splitValue[1]),
        parseInt(splitValue[2])
      )}`;
      this._pixiObject.textStyles.default.fill = hexColor;
      break;
    case 'alignment':
      this._pixiObject._style.align = value;
      this._pixiObject.dirty = true;
      break;
    case 'font family':
      this._pixiObject.textStyles.default.fontFamily = value;
      break;
    case 'font size':
      this._pixiObject.textStyles.default.fontSize = `${value}px`;
      break;
    case 'opacity':
      this._pixiObject.alpha = value / 255;
      break;
  }
  this._pixiObject.dirty = true;
  this.ensureUpToDate();
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
