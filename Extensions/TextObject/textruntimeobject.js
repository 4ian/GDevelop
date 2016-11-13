/*
 *  GDevelop JS Platform
 *  2013-2016 Florian Rival (Florian.Rival@gmail.com)
 */

/**
 * Displays a text on the screen.
 *
 * @namespace gdjs
 * @class TextRuntimeObject
 * @extends RuntimeObject
 * @namespace gdjs
 */
gdjs.TextRuntimeObject = function(runtimeScene, objectData)
{
    gdjs.RuntimeObject.call(this, runtimeScene, objectData);

    this._characterSize = objectData.characterSize;
    this._fontName = objectData.font || 'Arial';
    this._bold = objectData.bold;
    this._italic = objectData.italic;
    this._underlined = objectData.underlined;
    this._color = [objectData.color.r, objectData.color.g, objectData.color.b];

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
 * Update the position object's.
 * @method _updateTextPosition
 * @private
 */
gdjs.TextRuntimeObject.prototype._updateTextPosition = function() {
    this.hitBoxesDirty = true;
    this._renderer.updatePosition();
};

/**
 * Set object's position in X.
 * @method setX
 */
gdjs.TextRuntimeObject.prototype.setX = function(x) {
    gdjs.RuntimeObject.prototype.setX.call(this, x);
    this._updateTextPosition();
};

/**
 * Set object's position in Y.
 * @method setY
 */
gdjs.TextRuntimeObject.prototype.setY = function(y) {
    gdjs.RuntimeObject.prototype.setY.call(this, y);
    this._updateTextPosition();
};

 /**
 * Set the angle of the object.
 * @method setAngle
 * @param angle {Number} The new angle of the object
 */
gdjs.TextRuntimeObject.prototype.setAngle = function(angle) {
    gdjs.RuntimeObject.prototype.setAngle.call(this, angle);
    this._renderer.updateAngle();
};

/**
 * Set object's opacity.
 * @method setOpacity
 */
gdjs.TextRuntimeObject.prototype.setOpacity = function(opacity) {
    if ( opacity < 0 ) opacity = 0;
    if ( opacity > 255 ) opacity = 255;

    this.opacity = opacity;
    this._renderer.updateOpacity();
};

/**
 * Get object's opacity.
 * @method getOpacity
 */
gdjs.TextRuntimeObject.prototype.getOpacity = function() {
    return this.opacity;
};

/**
 * Get object's string.
 * @method getString
 */
gdjs.TextRuntimeObject.prototype.getString = function() {
    return this._str;
};

/**
 * Set object's string.
 * @method setString
 * @param {String} Change string of text for your object.
 */
gdjs.TextRuntimeObject.prototype.setString = function(str) {
    if ( str === this._str ) return;

    this._str = str;
    this._renderer.updateString();
    this._updateTextPosition();
};

/**
 * Get size of characters of the object.
 * @method getCharacterSize
 */
gdjs.TextRuntimeObject.prototype.getCharacterSize = function() {
    return this._characterSize;
};

/**
 * Set size of characters of the object.
 * @method setCharacterSize
 * @param newSize {Number} The new size for text.
 */
gdjs.TextRuntimeObject.prototype.setCharacterSize = function(newSize) {
    if (newSize <= 1) newSize = 1;
    this._characterSize = newSize;
    this._renderer.updateStyle();
};

/**
 * Return true if your text is bold.
 * @method isBold
 */
gdjs.TextRuntimeObject.prototype.isBold = function() {
    return this._bold;
};

/**
 * Set bold for your object text.
 * @method setBold
 * @param enable {Boolean} Set it to true to have a bold text, false to not bold.
 */
gdjs.TextRuntimeObject.prototype.setBold = function(enable) {
    this._bold = enable;
    this._renderer.updateStyle();
};

/**
 * Return true if your text is italic.
 * @method isItalic
 */
gdjs.TextRuntimeObject.prototype.isItalic = function() {
    return this._italic;
};

/**
 * Set italic for your object text.
 * @method setItalic
 * @param enable {Boolean} Set it to true to have a italic text, false to not italic.
 */
gdjs.TextRuntimeObject.prototype.setItalic = function(enable) {
    this._italic = enable;
    this._renderer.updateStyle();
};

/**
 * Get width for your object text.
 * @method getWidth
 */
gdjs.TextRuntimeObject.prototype.getWidth = function() {
    return this._renderer.getWidth();
};

/**
 * Get height for your object text.
 * @method getHeight
 */
gdjs.TextRuntimeObject.prototype.getHeight = function() {
    return this._renderer.getHeight();
};

/**
 * Change the text color.
 * @method setColor
 * @param {String} example for red : "255;0;0"
 */
gdjs.TextRuntimeObject.prototype.setColor = function(str) {
    var color = str.split(";");
    if ( color.length < 3 ) return;

    this._color[0] = parseInt(color[0], 10);
    this._color[1] = parseInt(color[1], 10);
    this._color[2] = parseInt(color[2], 10);
    this._renderer.updateStyle();
};
