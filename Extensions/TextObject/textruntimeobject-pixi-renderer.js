gdjs.TextRuntimeObjectPixiRenderer = function(runtimeObject, runtimeScene)
{
    this._object = runtimeObject;

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

gdjs.TextRuntimeObjectPixiRenderer.prototype.exposeRendererObject = function(cb) {
    cb(this._text);
};

gdjs.TextRuntimeObjectPixiRenderer.prototype.ensureUpToDate = function() {
    if (this._justCreated) { //Work around a PIXI.js bug:
        this._text.updateText();
        this.updatePosition(); //Width seems not to be correct when text is not rendered yet.
        this._justCreated = false;
    }
};

gdjs.TextRuntimeObjectPixiRenderer.prototype.updateStyle = function() {
    var fontName = "\"gdjs_font_" + this._object._fontName + "\"";
    var style = { align:"left" };
	style.font = "";
    if ( this._object._italic ) style.font += "italic ";
    if ( this._object._bold ) style.font += "bold ";
    style.font += this._object._characterSize + "px " + fontName;
    style.fill = "rgb("+this._object._color[0]+","+this._object._color[1]+","+this._object._color[2]+")";
    this._text.style = style;
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
