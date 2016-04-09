gdjs.ShapePainterRuntimeObjectPixiRenderer = function(runtimeObject, runtimeScene)
{
    this._object = runtimeObject;

    if ( this._graphics === undefined ) {
        this._graphics = new PIXI.Graphics();
    }

    runtimeScene.getLayer("").getRenderer().addRendererObject(this._graphics, runtimeObject.getZOrder());
};

gdjs.ShapePainterRuntimeObjectRenderer = gdjs.ShapePainterRuntimeObjectPixiRenderer; //Register the class to let the engine use it.

gdjs.ShapePainterRuntimeObjectPixiRenderer.prototype.exposeRendererObject = function(cb) {
    cb(this._graphics);
};

gdjs.ShapePainterRuntimeObjectPixiRenderer.prototype.clear = function() {
    this._graphics.clear();
    this.updateOutline();
};

gdjs.ShapePainterRuntimeObjectPixiRenderer.prototype.drawRectangle = function(x1, y1, x2, y2) {
    this._graphics.beginFill(this._object._fillColor, this._object._fillOpacity / 255);
    this._graphics.drawRect(x1, y1, x2 - x1, y2 - y1);
    this._graphics.endFill();
};

gdjs.ShapePainterRuntimeObjectPixiRenderer.prototype.drawCircle = function(x, y, radius) {
    this._graphics.beginFill(this._object._fillColor, this._object._fillOpacity / 255);
    this._graphics.drawCircle(x, y, radius);
    this._graphics.endFill();
};

gdjs.ShapePainterRuntimeObjectPixiRenderer.prototype.drawLine = function(x1, y1, x2, y2, thickness) {
    this._graphics.beginFill(this._object._fillColor, this._object._fillOpacity / 255);
    if (y2 === y1) {
        this._graphics.drawRect(x1, y1 - thickness / 2, x2 - x1, thickness);
    } else {
        var angle = Math.atan2(y2 - y1, x2 - x1);
        var xIncrement = Math.sin(angle) * thickness;
        var yIncrement = Math.cos(angle) * thickness;

        this._graphics.drawPolygon(x1 + xIncrement, y1 - yIncrement, x1 - xIncrement, y1 + yIncrement,
            x2 - xIncrement, y2 + yIncrement, x2 + xIncrement, y2 - yIncrement);
    }
    this._graphics.endFill();
};

gdjs.ShapePainterRuntimeObjectPixiRenderer.prototype.updateOutline = function() {
    this._graphics.lineStyle(
        this._object._outlineSize,
        this._object._outlineColor,
        this._object._outlineOpacity / 255
    );
}

gdjs.ShapePainterRuntimeObjectPixiRenderer.prototype.updateXPosition = function() {
    if (!this._object._absoluteCoordinates) {
        this._graphics.position.x = this._object.x;
    } else {
        this._graphics.position.x = 0;
    }
}

gdjs.ShapePainterRuntimeObjectPixiRenderer.prototype.updateYPosition = function() {
    if (!this._object._absoluteCoordinates) {
        this._graphics.position.y = this._object.y;
    } else {
        this._graphics.position.y = 0;
    }
}
