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
    style.fill = gdjs.rgbToHexNumber(
        this._object._color[0],
        this._object._color[1],
        this._object._color[2]
    );
    style.wordWrap = this._object._wrapping;
    style.wordWrapWidth = this._object._wrappingWidth;
    style.breakWords = true;
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
