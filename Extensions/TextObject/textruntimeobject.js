/*
 *  GDevelop JS Platform
 *  2013-2016 Florian Rival (Florian.Rival@gmail.com)
 */

/**
 * Displays a text on the screen.
 *
 * @memberof gdjs
 * @class TextRuntimeObject
 * @extends RuntimeObject
 */
gdjs.TextRuntimeObject = function(runtimeScene, objectData)
{
    gdjs.RuntimeObject.call(this, runtimeScene, objectData);

    this._characterSize = objectData.characterSize;
    this._fontName = objectData.font;
    this._bold = objectData.bold;
    this._italic = objectData.italic;
    this._underlined = objectData.underlined;
    this._color = [objectData.color.r, objectData.color.g, objectData.color.b];
    this.opacity = 255;
    this._wrapping = false;
    this._wrappingWidth = 1;
    this._outlineThickness = 0;
    this._outlineColor = [255,255,255];
    this._shadow = false;
    this._shadowColor = [0,0,0];
    this._shadowDistance = 1;
    this._shadowBlur = 1;
    this._shadowAngle = 0;
    this._padding = 5;

    this._str = objectData.string;

    if (this._renderer)
        gdjs.TextRuntimeObjectRenderer.call(this._renderer, this, runtimeScene);
    else
        this._renderer = new gdjs.TextRuntimeObjectRenderer(this, runtimeScene);
};

gdjs.TextRuntimeObject.prototype = Object.create( gdjs.RuntimeObject.prototype );
gdjs.TextRuntimeObject.thisIsARuntimeObjectConstructor = "TextObject::Text";

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
 * @param {String} str The new text
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
 * @param enable {Boolean} true to have a bold text, false otherwise.
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
 * @param enable {Boolean} true to have an italic text, false otherwise.
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
 * Change the text color.
 * @param {String} color color as a "R;G;B" string, for example: "255;0;0"
 */
gdjs.TextRuntimeObject.prototype.setColor = function(str) {
    var color = str.split(";");
    if ( color.length < 3 ) return;

    this._color[0] = parseInt(color[0], 10);
    this._color[1] = parseInt(color[1], 10);
    this._color[2] = parseInt(color[2], 10);
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
 * Return true if word wrapping is enabled for the text.
 */
gdjs.TextRuntimeObject.prototype.isWrapping = function() {
    return this._wrapping;
};

/**
 * Set word wrapping for the object text.
 * @param {Boolean} enable true to enable word wrapping, false to disable it.
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
 * @param {String} str color as a "R;G;B" string, for example: "255;0;0"
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
 * @param {String} str color as a "R;G;B" string, for example: "255;0;0"
 * @param {number} distance distance between the shadow and the text
 * @param {number} blur amout of shadow blur
 * @param {number} angle shadow offset direction
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
 * Show the shadow of the text object.
 * @param {number} value boolean show the shadow (1 = enabled / 0 = disabled)
 */
gdjs.TextRuntimeObject.prototype.showShadow = function(value) {
    this._shadow = (value == 1) ? true : false;
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