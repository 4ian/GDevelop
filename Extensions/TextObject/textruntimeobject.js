/*
 *  GDevelop JS Platform
 *  2013-2016 Florian Rival (Florian.Rival@gmail.com)
 */

/**
 * @typedef {Object} TextObjectDataType Base parameters for gdjs.TextRuntimeObject
 * @property {number} characterSize The size of the characters
 * @property {string} font The font name
 * @property {boolean} bold Is Bold?
 * @property {boolean} italic Is Italic?
 * @property {boolean} underlined Is Underlined?
 * @property {Object} color The text color in an RGB representation
 * @property {number} color.r The Red level from 0 to 255
 * @property {number} color.g The Green level from 0 to 255
 * @property {number} color.b The Blue level from 0 to 255
 * @property {string} string The text of the object
 *
 * @typedef {ObjectData & TextObjectDataType} TextObjectData
 */

/**
 * Displays a text.
 *
 * @memberof gdjs
 * @class TextRuntimeObject
 * @extends RuntimeObject
 * @param {gdjs.RuntimeScene} runtimeScene The {@link gdjs.RuntimeScene} the object belongs to
 * @param {TextObjectData} textObjectData The initial properties of the object
 */
gdjs.TextRuntimeObject = function(runtimeScene, textObjectData)
{
    gdjs.RuntimeObject.call(this, runtimeScene, textObjectData);

    /** @type {number} */
    this._characterSize = Math.max(1, textObjectData.characterSize);

    /** @type {string} */
    this._fontName = textObjectData.font;

    /** @type {boolean} */
    this._bold = textObjectData.bold;

    /** @type {boolean} */
    this._italic = textObjectData.italic;

    /** @type {boolean} */
    this._underlined = textObjectData.underlined;

    /** @type {Array<number>} */
    this._color = [textObjectData.color.r, textObjectData.color.g, textObjectData.color.b];

    /** @type {boolean} */
    this._useGradient = false;

    /** @type {Array} */
    this._gradient = [];

    /** @type {string} */
    this._gradientType = '';

    /** @type {number} */
    this.opacity = 255;

    /** @type {string} */
    this._textAlign = 'left';

    /** @type {boolean} */
    this._wrapping = false;

    /** @type {number} */
    this._wrappingWidth = 1;

    /** @type {number} */
    this._outlineThickness = 0;

    /** @type {Array<number>} */
    this._outlineColor = [255,255,255];

    /** @type {boolean} */
    this._shadow = false;

    /** @type {Array<number>} */
    this._shadowColor = [0,0,0];

    /** @type {number} */
    this._shadowDistance = 1;

    /** @type {number} */
    this._shadowBlur = 1;

    /** @type {number} */
    this._shadowAngle = 0;

    /** @type {number} */
    this._padding = 5;

    /** @type {number} */
    this._scaleX = 1;

    /** @type {number} */
    this._scaleY = 1;

    /** @type {string} */
    this._str = textObjectData.string;

    if (this._renderer)
        gdjs.TextRuntimeObjectRenderer.call(this._renderer, this, runtimeScene);
    else
        /** @type {gdjs.TextRuntimeObjectRenderer} */
        this._renderer = new gdjs.TextRuntimeObjectRenderer(this, runtimeScene);

    // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
    this.onCreated();
};

gdjs.TextRuntimeObject.prototype = Object.create( gdjs.RuntimeObject.prototype );
gdjs.registerObject("TextObject::Text", gdjs.TextRuntimeObject);

gdjs.TextRuntimeObject.prototype.getRendererObject = function() {
    return this._renderer.getRendererObject();
};

gdjs.TextRuntimeObject.prototype.update = function() {
    this._renderer.ensureUpToDate();
};

/**
 * Initialize the extra parameters that could be set for an instance.
 * @private
 */
gdjs.TextRuntimeObject.prototype.extraInitializationFromInitialInstance = function(initialInstanceData) {
    if ( initialInstanceData.customSize ) {
        this.setWrapping(true);
        this.setWrappingWidth(initialInstanceData.width);
    }
};

/**
 * Update the rendered object position.
 * @private
 */
gdjs.TextRuntimeObject.prototype._updateTextPosition = function() {
    this.hitBoxesDirty = true;
    this._renderer.updatePosition();
};

/**
 * Set object position on X axis.
 */
gdjs.TextRuntimeObject.prototype.setX = function(x) {
    gdjs.RuntimeObject.prototype.setX.call(this, x);
    this._updateTextPosition();
};

/**
 * Set object position on Y axis.
 */
gdjs.TextRuntimeObject.prototype.setY = function(y) {
    gdjs.RuntimeObject.prototype.setY.call(this, y);
    this._updateTextPosition();
};

 /**
 * Set the angle of the object.
 * @param {number} angle The new angle of the object
 */
gdjs.TextRuntimeObject.prototype.setAngle = function(angle) {
    gdjs.RuntimeObject.prototype.setAngle.call(this, angle);
    this._renderer.updateAngle();
};

/**
 * Set object opacity.
 */
gdjs.TextRuntimeObject.prototype.setOpacity = function(opacity) {
    if ( opacity < 0 ) opacity = 0;
    if ( opacity > 255 ) opacity = 255;

    this.opacity = opacity;
    this._renderer.updateOpacity();
};

/**
 * Get object opacity.
 */
gdjs.TextRuntimeObject.prototype.getOpacity = function() {
    return this.opacity;
};

/**
 * Get the string displayed by the object.
 */
gdjs.TextRuntimeObject.prototype.getString = function() {
    return this._str;
};

/**
 * Set the string displayed by the object.
 * @param {string} str The new text
 */
gdjs.TextRuntimeObject.prototype.setString = function(str) {
    if ( str === this._str ) return;

    this._str = str;
    this._renderer.updateString();
    this._updateTextPosition();
};

/**
 * Get the font size of the characters of the object.
 */
gdjs.TextRuntimeObject.prototype.getCharacterSize = function() {
    return this._characterSize;
};

/**
 * Set the font size for characters of the object.
 * @param {number} newSize The new font size for the text.
 */
gdjs.TextRuntimeObject.prototype.setCharacterSize = function(newSize) {
    if (newSize <= 1) newSize = 1;
    this._characterSize = newSize;
    this._renderer.updateStyle();
};

/**
 * Return true if the text is bold.
 */
gdjs.TextRuntimeObject.prototype.isBold = function() {
    return this._bold;
};

/**
 * Set bold for the object text.
 * @param enable {boolean} true to have a bold text, false otherwise.
 */
gdjs.TextRuntimeObject.prototype.setBold = function(enable) {
    this._bold = enable;
    this._renderer.updateStyle();
};

/**
 * Return true if the text is italic.
 */
gdjs.TextRuntimeObject.prototype.isItalic = function() {
    return this._italic;
};

/**
 * Set italic for the object text.
 * @param enable {boolean} true to have an italic text, false otherwise.
 */
gdjs.TextRuntimeObject.prototype.setItalic = function(enable) {
    this._italic = enable;
    this._renderer.updateStyle();
};

/**
 * Get width of the text.
 */
gdjs.TextRuntimeObject.prototype.getWidth = function() {
    return this._renderer.getWidth();
};

/**
 * Get height of the text.
 */
gdjs.TextRuntimeObject.prototype.getHeight = function() {
    return this._renderer.getHeight();
};

/**
 * Get scale of the text.
 */
gdjs.TextRuntimeObject.prototype.getScale = function() {
    return (Math.abs(this._scaleX)+Math.abs(this._scaleY))/2.0;
};

/**
 * Get y-scale of the text.
 */
gdjs.TextRuntimeObject.prototype.getScaleX = function() {
    return this._renderer.getScaleX();
};

/**
 * Get x-scale of the text.
 */
gdjs.TextRuntimeObject.prototype.getScaleY = function() {
    return this._renderer.getScaleY();
};

/**
 * Set the text object scale.
 * @param {number} newScale The new scale for the text object.
 */
gdjs.TextRuntimeObject.prototype.setScale = function(newScale) {
    this._scaleX = newScale;
    this._scaleY = newScale;
    this._renderer.setScale(newScale);
};

/**
 * Set the text object x-scale.
 * @param {number} newScale The new x-scale for the text object.
 */
gdjs.TextRuntimeObject.prototype.setScaleX = function(newScale) {
    this._scaleX = newScale;
    this._renderer.setScaleX(newScale);
};

/**
 * Set the text object y-scale.
 * @param {number} newScale The new y-scale for the text object.
 */
gdjs.TextRuntimeObject.prototype.setScaleY = function(newScale) {
    this._scaleY = newScale;
    this._renderer.setScaleY(newScale);
};

/**
 * Change the text color.
 * @param {String} color color as a "R;G;B" string, for example: "255;0;0"
 */
gdjs.TextRuntimeObject.prototype.setColor = function(str) {
    var color = str.split(";");
    if ( color.length < 3 ) return;

    this._color[0] = parseInt(color[0], 10);
    this._color[1] = parseInt(color[1], 10);
    this._color[2] = parseInt(color[2], 10);

    this._useGradient = false;

    this._renderer.updateStyle();
};

/**
 * Get the text color.
 * @return {String} The color as a "R;G;B" string, for example: "255;0;0"
 */
gdjs.TextRuntimeObject.prototype.getColor = function(str) {
    return this._color[0] + ";" + this._color[1] + ";" + this._color[2];
};

/**
 * Set the text alignment for multiline text objects.
 * @param {string} alignment The text alignment.
 */
gdjs.TextRuntimeObject.prototype.setTextAlignment = function(alignment) {
    this._textAlign = alignment;
    this._renderer.updateStyle();
};

/**
 * Get the text alignment of text object.
 * @return {string} The text alignment.
 */
gdjs.TextRuntimeObject.prototype.getTextAlignment = function() {
    return this._textAlign;
};

/**
 * Return true if word wrapping is enabled for the text.
 */
gdjs.TextRuntimeObject.prototype.isWrapping = function() {
    return this._wrapping;
};

/**
 * Set word wrapping for the object text.
 * @param {boolean} enable true to enable word wrapping, false to disable it.
 */
gdjs.TextRuntimeObject.prototype.setWrapping = function(enable) {
    this._wrapping = enable;
    this._renderer.updateStyle();
};

/**
 * Get the word wrapping width for the text object.
 */
gdjs.TextRuntimeObject.prototype.getWrappingWidth = function() {
    return this._wrappingWidth;
};

/**
 * Set the word wrapping width for the text object.
 * @param {number} width The new width to set.
 */
gdjs.TextRuntimeObject.prototype.setWrappingWidth = function(width) {
    if (width <= 1) width = 1;
    this._wrappingWidth = width;
    this._renderer.updateStyle();
};

/**
 * Set the outline for the text object.
 * @param {string} str color as a "R;G;B" string, for example: "255;0;0"
 * @param {number} thickness thickness of the outline (0 = disabled)
 */
gdjs.TextRuntimeObject.prototype.setOutline = function(str, thickness) {
    var color = str.split(";");
    if ( color.length < 3 ) return;

    this._outlineColor[0] = parseInt(color[0], 10);
    this._outlineColor[1] = parseInt(color[1], 10);
    this._outlineColor[2] = parseInt(color[2], 10);
    this._outlineThickness = thickness;
    this._renderer.updateStyle();
};

/**
 * Set the shadow for the text object.
 * @param {string} str color as a "R;G;B" string, for example: "255;0;0"
 * @param {number} distance distance between the shadow and the text, in pixels.
 * @param {number} blur amout of shadow blur, in pixels.
 * @param {number} angle shadow offset direction, in degrees.
 */
gdjs.TextRuntimeObject.prototype.setShadow = function(str, distance, blur, angle) {
    var color = str.split(";");
    if ( color.length < 3 ) return;

    this._shadowColor[0] = parseInt(color[0], 10);
    this._shadowColor[1] = parseInt(color[1], 10);
    this._shadowColor[2] = parseInt(color[2], 10);
    this._shadowDistance = distance;
    this._shadowBlur = blur;
    this._shadowAngle = angle;
    this._shadow = true;
    this._renderer.updateStyle();
};

/**
 * Set the gradient for the text object.
 * @param {string} strFirstColor color as a "R;G;B" string, for example: "255;0;0"
 * @param {string} strSecondColor color as a "R;G;B" string, for example: "255;0;0"
 * @param {string} strThirdColor color as a "R;G;B" string, for example: "255;0;0"
 * @param {string} strFourthColor color as a "R;G;B" string, for example: "255;0;0"
 * @param {string} strGradientType gradient type
 */
gdjs.TextRuntimeObject.prototype.setGradient = function(strGradientType, strFirstColor, strSecondColor, strThirdColor, strFourthColor) {
    var colorFirst = strFirstColor.split(";");
    var colorSecond = strSecondColor.split(";");
    var colorThird = strThirdColor.split(";");
    var colorFourth = strFourthColor.split(";");

    this._gradient = [];

    if (colorFirst.length == 3){
        this._gradient.push([
            parseInt(colorFirst[0], 10),
            parseInt(colorFirst[1], 10),
            parseInt(colorFirst[2], 10)
        ]);
    }

    if (colorSecond.length == 3){
        this._gradient.push([
            parseInt(colorSecond[0], 10),
            parseInt(colorSecond[1], 10),
            parseInt(colorSecond[2], 10)
        ]);
    }

    if (colorThird.length == 3){
        this._gradient.push([
            parseInt(colorThird[0], 10),
            parseInt(colorThird[1], 10),
            parseInt(colorThird[2], 10)
        ]);
    }

    if (colorFourth.length == 3){
        this._gradient.push([
            parseInt(colorFourth[0], 10),
            parseInt(colorFourth[1], 10),
            parseInt(colorFourth[2], 10)
        ]);
    }

    this._gradientType = strGradientType;

    this._useGradient = (this._gradient.length > 1) ? true : false;

    this._renderer.updateStyle();
};

/**
 * Show the shadow of the text object.
 * @param {boolean} enable true to show the shadow, false to hide it
 */
gdjs.TextRuntimeObject.prototype.showShadow = function(enable) {
    this._shadow = enable;
    this._renderer.updateStyle();
};

/**
 * Get padding of the text object.
 * @return {number} number of pixels around the text before it gets cropped
 */
gdjs.TextRuntimeObject.prototype.getPadding = function() {
    return this._padding;
};

/**
 * Set padding of the text object.
 * @param {number} value number of pixels around the text before it gets cropped
 */
gdjs.TextRuntimeObject.prototype.setPadding = function(value) {
    this._padding = value;
    this._renderer.updateStyle();
};
