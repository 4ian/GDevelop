gdjs.TextRuntimeObjectPixiRenderer = function(runtimeObject, runtimeScene)
{
    this._object = runtimeObject;
    this._fontManager = runtimeScene.getGame().getFontManager();

    if ( this._text === undefined ) this._text = new PIXI.Text(" ", {align:"left"});
    this._text.anchor.x = 0.5;
    this._text.anchor.y = 0.5;
    runtimeScene.getLayer("").getRenderer().addRendererObject(this._text, runtimeObject.getZOrder());

    this._text.text = runtimeObject._str.length === 0 ? " " : runtimeObject._str;
    this._justCreated = true; //Work around a PIXI.js bug. See updateTime method.
    this.updateStyle();
    this.updatePosition();
};

gdjs.TextRuntimeObjectRenderer = gdjs.TextRuntimeObjectPixiRenderer; //Register the class to let the engine use it.

gdjs.TextRuntimeObjectPixiRenderer.prototype.getRendererObject = function() {
    return this._text;
};

gdjs.TextRuntimeObjectPixiRenderer.prototype.ensureUpToDate = function() {
    if (this._justCreated) { //Work around a PIXI.js bug:
        this._text.updateText();
        this.updatePosition(); //Width seems not to be correct when text is not rendered yet.
        this._justCreated = false;
    }
};

gdjs.TextRuntimeObjectPixiRenderer.prototype.updateStyle = function() {
    var fontName = "\"" + this._fontManager.getFontFamily(this._object._fontName) + "\"";

    var style = this._text.style;
    style.fontStyle = this._object._italic ? 'italic' : 'normal';
    style.fontWeight = this._object._bold ? 'bold' : 'normal';
    style.fontSize = this._object._characterSize;
    style.fontFamily = fontName;

    if (this._object._useGradient){
        style.fill = this._getGradientHex();
    } else {
        style.fill = this._getColorHex();
    }

    if (this._object._gradientType === 'LINEAR_VERTICAL'){
        style.fillGradientType = PIXI.TEXT_GRADIENT.LINEAR_VERTICAL;
    } else {
        style.fillGradientType = PIXI.TEXT_GRADIENT.LINEAR_HORIZONTAL;
    }

    style.align = this._object._textAlign;
    style.wordWrap = this._object._wrapping;
    style.wordWrapWidth = this._object._wrappingWidth;
    style.breakWords = true;
    style.stroke = gdjs.rgbToHexNumber(
        this._object._outlineColor[0],
        this._object._outlineColor[1],
        this._object._outlineColor[2]
    );
    style.strokeThickness = this._object._outlineThickness;
    style.dropShadow = this._object._shadow;
    style.dropShadowColor = gdjs.rgbToHexNumber(
        this._object._shadowColor[0],
        this._object._shadowColor[1],
        this._object._shadowColor[2]
    );
    style.dropShadowBlur = this._object._shadowBlur;
    style.dropShadowAngle = this._object._shadowAngle;
    style.dropShadowDistance = this._object._shadowDistance;
    style.padding = this._object._padding;
    // Prevent spikey outlines by adding a miter limit 
    style.miterLimit = 3;

    this.updatePosition();

    // Manually ask the PIXI object to re-render as we changed a style property
    // see http://www.html5gamedevs.com/topic/16924-change-text-style-post-render/
    this._text.dirty = true;
};

gdjs.TextRuntimeObjectPixiRenderer.prototype.updatePosition = function() {
    this._text.position.x = this._object.x+this._text.width/2;
    this._text.position.y = this._object.y+this._text.height/2;
};

gdjs.TextRuntimeObjectPixiRenderer.prototype.updateAngle = function() {
    this._text.rotation = gdjs.toRad(this._object.angle);
};

gdjs.TextRuntimeObjectPixiRenderer.prototype.updateOpacity = function() {
    this._text.alpha = this._object.opacity / 255;
};

gdjs.TextRuntimeObjectPixiRenderer.prototype.updateString = function() {
    this._text.text = this._object._str.length === 0 ? " " : this._object._str;
    this._text.updateText(); //Work around a PIXI.js bug.
};

gdjs.TextRuntimeObjectPixiRenderer.prototype.getWidth = function() {
    return this._text.width;
};

gdjs.TextRuntimeObjectPixiRenderer.prototype.getHeight = function() {
    return this._text.height;
};

gdjs.TextRuntimeObjectPixiRenderer.prototype._getColorHex = function() {
    return gdjs.rgbToHexNumber(
        this._object._color[0],
        this._object._color[1],
        this._object._color[2]
    );
}

gdjs.TextRuntimeObjectPixiRenderer.prototype._getGradientHex = function() {
    var gradient = [];
    for (var colorIndex = 0; colorIndex < this._object._gradient.length; colorIndex++){
        gradient.push(
            '#' + gdjs.rgbToHex(
                this._object._gradient[colorIndex][0],
                this._object._gradient[colorIndex][1],
                this._object._gradient[colorIndex][2]
            )
        );
    } 
    return gradient;
}
/**
 * Get y-scale of the text.
 */
gdjs.TextRuntimeObjectPixiRenderer.prototype.getScaleX = function() {
    return this._text.scale.x;
};

/**
 * Get x-scale of the text.
 */
gdjs.TextRuntimeObjectPixiRenderer.prototype.getScaleY = function() {
    return this._text.scale.y;
};

/**
 * Set the text object scale.
 * @param {number} newScale The new scale for the text object.
 */
gdjs.TextRuntimeObjectPixiRenderer.prototype.setScale = function(newScale) {
    this._text.scale.x = newScale;
    this._text.scale.y = newScale;
};

/**
 * Set the text object x-scale.
 * @param {number} newScale The new x-scale for the text object.
 */
gdjs.TextRuntimeObjectPixiRenderer.prototype.setScaleX = function(newScale) {
    this._text.scale.x = newScale;
};

/**
 * Set the text object y-scale.
 * @param {number} newScale The new y-scale for the text object.
 */
gdjs.TextRuntimeObjectPixiRenderer.prototype.setScaleY = function(newScale) {
    this._text.scale.y = newScale;
};
