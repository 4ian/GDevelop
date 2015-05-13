/*
 *  GDevelop JS Platform
 *  2013 Florian Rival (Florian.Rival@gmail.com)
 */

/**
 * The textRuntimeObject displays a text on the screen.
 *
 * @namespace gdjs
 * @class TextRuntimeObject
 * @extends RuntimeObject
 * @namespace gdjs
 */
gdjs.TextRuntimeObject = function(runtimeScene, objectData)
{
    gdjs.RuntimeObject.call(this, runtimeScene, objectData);

    this._runtimeScene = runtimeScene;
    this._characterSize = objectData.characterSize;
    this._fontName = "Arial";
    this._bold = objectData.bold;
    this._italic = objectData.italic;
    this._underlined = objectData.underlined;
    this._color = [objectData.color.r, objectData.color.g, objectData.color.b];
    if ( objectData.font !== "" ) {
        this._fontName = "\"gdjs_font_"+objectData.font+"\"";
    }

    this._str = objectData.string;

    if ( this._text === undefined ) this._text = new PIXI.Text(" ", {align:"left"});
    this._text.anchor.x = 0.5;
    this._text.anchor.y = 0.5;
    runtimeScene.getLayer("").addChildToPIXIContainer(this._text, this.zOrder);

    this._text.text = this._str.length === 0 ? " " : this._str;
    this._justCreated = true; //Work around a PIXI.js bug. See updateTime method.
    this._updateTextStyle();
    this._updateTextPosition();
};

gdjs.TextRuntimeObject.prototype = Object.create( gdjs.RuntimeObject.prototype );
gdjs.TextRuntimeObject.thisIsARuntimeObjectConstructor = "TextObject::Text";

gdjs.TextRuntimeObject.prototype.onDeletedFromScene = function(runtimeScene) {
    runtimeScene.getLayer(this.layer).removePIXIContainerChild(this._text);
};

/**
 * Update the style object's.
 * @method _updateTextStyle
 * @private
 */
gdjs.TextRuntimeObject.prototype._updateTextStyle = function() {
    style = {align:"left"};
	style.font = "";
    if ( this._italic ) style.font += "italic ";
    if ( this._bold ) style.font += "bold ";
    //if ( this._underlined ) style.font += "underlined "; Not supported :/
    style.font += this._characterSize+"px"+" "+this._fontName;
    style.fill = "rgb("+this._color[0]+","+this._color[1]+","+this._color[2]+")";
    this._text.style = style;
};

gdjs.TextRuntimeObject.prototype.updateTime = function() {
    if (this._justCreated) { //Work around a PIXI.js bug:
        this._text.updateText();
        this._updateTextPosition(); //Width seems not to be correct when text is not rendered yet.
        this._justCreated = false;
    }
};

/**
 * Update the position object's.
 * @method _updateTextPosition
 * @private
 */
gdjs.TextRuntimeObject.prototype._updateTextPosition = function() {
    this._text.position.x = this.x+this._text.width/2;
    this._text.position.y = this.y+this._text.height/2;
    this.hitBoxesDirty = true;
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
    this._text.rotation = gdjs.toRad(angle);
};

/**
 * Set object's opacity.
 * @method setOpacity
 */
gdjs.TextRuntimeObject.prototype.setOpacity = function(opacity) {
    if ( opacity < 0 ) opacity = 0;
    if ( opacity > 255 ) opacity = 255;

    this.opacity = opacity;
    this._text.alpha = opacity / 255;
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
    this._text.text = str.length === 0 ? " " : str;
    this._text.updateText(); //Work around a PIXI.js bug.
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
    this._characterSize = newSize;
    this._updateTextStyle();
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
    this._updateTextStyle();
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
    this._updateTextStyle();
};

/**
 * Hide or show the object
 * @method hide
 * @param enable {Boolean} Set it to true to hide the object, false to show it.
 */
gdjs.TextRuntimeObject.prototype.hide = function(enable) {
    if ( enable === undefined ) enable = true;
    this._hidden = enable;
    this._text.visible = !enable;
};

/**
 * Set the layer of the object.
 * @method setLayer
 * @param {String} The new layer of the object
 */
gdjs.TextRuntimeObject.prototype.setLayer = function(name) {
    //We need to move the object from the pixi container of the layer
    this._runtimeScene.getLayer(this.layer).removePIXIContainerChild(this._text);
    this.layer = name;
    this._runtimeScene.getLayer(this.layer).addChildToPIXIContainer(this._text, this.zOrder);
};

/**
 * Get width for your object text.
 * @method getWidth
 */
gdjs.TextRuntimeObject.prototype.getWidth = function() {
    return this._text.width;
};

/**
 * Get height for your object text.
 * @method getHeight
 */
gdjs.TextRuntimeObject.prototype.getHeight = function() {
    return this._text.height;
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
    this._updateTextStyle();
};

/**
 * Set the Z order of the object.
 * @method setZOrder
 * @param z {Number} The new Z order position of the object
 */
gdjs.TextRuntimeObject.prototype.setZOrder = function(z) {
    if ( z !== this.zOrder ) {
        this._runtimeScene.getLayer(this.layer).changePIXIContainerChildZOrder(this._text, z);
        this.zOrder = z;
    }
};
