gdjs.TextRuntimeObjectCocosRenderer = function(runtimeObject, runtimeScene)
{
    this._object = runtimeObject;

    this._text = new cc.LabelTTF(" ", "Arial", 38);
    this._text.disableStroke();

    var renderer = runtimeScene.getLayer("").getRenderer();
    renderer.addRendererObject(this._text, runtimeObject.getZOrder());
    this._convertYPosition = renderer.convertYPosition;

    this.updateString();
    this.updateStyle();
    this.updatePosition();
};

gdjs.TextRuntimeObjectRenderer = gdjs.TextRuntimeObjectCocosRenderer; //Register the class to let the engine use it.

gdjs.TextRuntimeObjectCocosRenderer.prototype.getRendererObject = function() {
    return this._text;
};

gdjs.TextRuntimeObjectCocosRenderer.prototype.ensureUpToDate = function() {
};

gdjs.TextRuntimeObjectCocosRenderer.prototype.updateStyle = function() {
    this._text.setFontSize(this._object._characterSize);
    this._text.setFontFillColor(cc.color(this._object._color[0],
        this._object._color[1], this._object._color[2]));
    this._text.setFontName(gdjs.CocosTools.isHTML5() ?
        'gdjs_font_' + this._object._fontName :
        'res/' + this._object._fontName
    );
};

gdjs.TextRuntimeObjectCocosRenderer.prototype.updatePosition = function() {
    this._text.setPositionX(this._object.x+this._text.width/2);
    this._text.setPositionY(this._convertYPosition(this._object.y+this._text.height/2));
};

gdjs.TextRuntimeObjectCocosRenderer.prototype.updateAngle = function() {
    this._text.setRotation(this._object.getAngle());
};

gdjs.TextRuntimeObjectCocosRenderer.prototype.updateOpacity = function() {
    this._text.setOpacity(this._object.opacity);
};

gdjs.TextRuntimeObjectCocosRenderer.prototype.updateString = function() {
    this._text.setString(this._object._str);
};

gdjs.TextRuntimeObjectCocosRenderer.prototype.getWidth = function() {
    return this._text.width;
};

gdjs.TextRuntimeObjectCocosRenderer.prototype.getHeight = function() {
    return this._text.height;
};
