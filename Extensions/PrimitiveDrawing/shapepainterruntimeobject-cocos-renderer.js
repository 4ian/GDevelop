gdjs.ShapePainterRuntimeObjectCocosRenderer = function(runtimeObject, runtimeScene)
{
    this._object = runtimeObject;

    this._drawNode = new cc.DrawNode();

    var renderer = runtimeScene.getLayer("").getRenderer();
    renderer.addRendererObject(this._drawNode, runtimeObject.getZOrder());
    this._convertYPosition = renderer.convertYPosition;
};

gdjs.ShapePainterRuntimeObjectRenderer = gdjs.ShapePainterRuntimeObjectCocosRenderer; //Register the class to let the engine use it.

gdjs.ShapePainterRuntimeObjectCocosRenderer.prototype.getRendererObject = function() {
    return this._drawNode;
};

gdjs.ShapePainterRuntimeObjectCocosRenderer.prototype.clear = function() {
    this._drawNode.clear();
    this.updateOutline();
};

gdjs.ShapePainterRuntimeObjectCocosRenderer.prototype.drawRectangle = function(x1, y1, x2, y2) {
    this._drawNode.drawRect(cc.p(x1, -(y1)), cc.p(x2, -(y2)),
        gdjs.CocosTools.hexToCCColor(this._object._fillColor, this._object._fillOpacity),
        this._object._outlineSize,
        gdjs.CocosTools.hexToCCColor(this._object._outlineColor, this._object._outlineOpacity));
};

gdjs.ShapePainterRuntimeObjectCocosRenderer.prototype.drawCircle = function(x, y, radius) {
    if (this._object._outlineSize > 0) {
        this._drawNode.drawDot(cc.p(x, -(y)), radius,
            gdjs.CocosTools.hexToCCColor(this._object._outlineColor, this._object._outlineOpacity));
    }
    this._drawNode.drawDot(cc.p(x, -(y)), radius - this._object._outlineSize,
        gdjs.CocosTools.hexToCCColor(this._object._fillColor, this._object._fillOpacity));
};

gdjs.ShapePainterRuntimeObjectCocosRenderer.prototype.drawLine = function(x1, y1, x2, y2, thickness) {
    if (y2 === y1) {
        this._drawNode.drawRect(
            cc.p(x1, -(y1 - thickness / 2)), cc.p(x2, -(y2 + thickness / 2)),
            gdjs.CocosTools.hexToCCColor(this._object._fillColor, this._object._fillOpacity),
            this._object._outlineSize,
            gdjs.CocosTools.hexToCCColor(this._object._outlineColor, this._object._outlineOpacity));
    } else {
        var angle = Math.atan2(y2 - y1, x2 - x1);
        var xIncrement = Math.sin(angle) * thickness;
        var yIncrement = Math.cos(angle) * thickness;

        this._drawNode.drawPoly([
            cc.p(x1 + xIncrement, -(y1 - yIncrement)),
            cc.p(x1 - xIncrement, -(y1 + yIncrement)),
            cc.p(x2 - xIncrement, -(y2 + yIncrement)),
            cc.p(x2 + xIncrement, -(y2 - yIncrement)),
        ],
        gdjs.CocosTools.hexToCCColor(this._object._fillColor, this._object._fillOpacity),
        this._object._outlineSize,
        gdjs.CocosTools.hexToCCColor(this._object._outlineColor, this._object._outlineOpacity));
    }

};

gdjs.ShapePainterRuntimeObjectCocosRenderer.prototype.updateOutline = function() {
    this._drawNode.setLineWidth(this._object._outlineSize);
}

gdjs.ShapePainterRuntimeObjectCocosRenderer.prototype.updateXPosition = function() {
    this._drawNode.setPositionX(this._object._absoluteCoordinates ?
        0 : this._object.x);
}

gdjs.ShapePainterRuntimeObjectCocosRenderer.prototype.updateYPosition = function() {
    this._drawNode.setPositionY(this._convertYPosition(this._object._absoluteCoordinates ?
        0 : this._object.y));
}
