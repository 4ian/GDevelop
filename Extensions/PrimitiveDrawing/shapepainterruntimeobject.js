/*
 *  GDevelop JS Platform
 *  2013 Florian Rival (Florian.Rival@gmail.com)
 */

/**
 * The ShapePainterRuntimeObject allows to draw graphics shapes on screen.
 *
 * @class ShapePainterRuntimeObject
 * @extends RuntimeObject
 * @namespace gdjs
 */
gdjs.ShapePainterRuntimeObject = function(runtimeScene, objectData)
{
    gdjs.RuntimeObject.call(this, runtimeScene, objectData);

    if ( this._graphics === undefined ) {
        this._graphics = new PIXI.Graphics();
    }

    this._fillColor = parseInt(gdjs.rgbToHex(objectData.fillColor.r, objectData.fillColor.g, objectData.fillColor.b), 16);
    this._outlineColor = parseInt(gdjs.rgbToHex(objectData.outlineColor.r, objectData.outlineColor.g, objectData.outlineColor.b), 16);
    this._fillOpacity = objectData.fillOpacity;
    this._outlineOpacity = objectData.outlineOpacity;
    this._outlineSize = objectData.outlineSize;
    this._absoluteCoordinates = objectData.absoluteCoordinates;

    runtimeScene.getLayer("").addChildToPIXIContainer(this._graphics, this.zOrder);
};

gdjs.ShapePainterRuntimeObject.prototype = Object.create( gdjs.RuntimeObject.prototype );
gdjs.ShapePainterRuntimeObject.thisIsARuntimeObjectConstructor = "PrimitiveDrawing::Drawer";

gdjs.ShapePainterRuntimeObject.prototype.exposePIXIDisplayObject = function(cb) {
    cb(this._graphics);
};

gdjs.ShapePainterRuntimeObject.prototype.stepBehaviorsPreEvents = function(runtimeScene) {
    //We redefine stepBehaviorsPreEvents just to clear the graphics before running events.
    this._graphics.clear();
    this._graphics.lineStyle(this._outlineSize, this._outlineColor, this._outlineOpacity/255);

    gdjs.RuntimeObject.prototype.stepBehaviorsPreEvents.call(this, runtimeScene);
};

gdjs.ShapePainterRuntimeObject.prototype.drawRectangle = function(x1, y1, x2, y2) {
    this._graphics.beginFill(this._fillColor, this._fillOpacity / 255);
    this._graphics.drawRect(x1, y1, x2 - x1,y2 - y1);
    this._graphics.endFill();
};

gdjs.ShapePainterRuntimeObject.prototype.drawCircle = function(x, y, radius) {
    this._graphics.beginFill(this._fillColor, this._fillOpacity / 255);
    this._graphics.drawCircle(x, y, radius);
    this._graphics.endFill();
};

gdjs.ShapePainterRuntimeObject.prototype.drawLine = function(x1, y1, x2, y2, thickness) {
    this._graphics.beginFill(this._fillColor, this._fillOpacity / 255);
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

gdjs.ShapePainterRuntimeObject.prototype.setFillColor = function(rgbColor) {
    var colors = rgbColor.split(";");
    if ( colors.length < 3 ) return;

    this._fillColor = parseInt(gdjs.rgbToHex(parseInt(colors[0], 10), parseInt(colors[1], 10), parseInt(colors[2], 10)), 16);
};

gdjs.ShapePainterRuntimeObject.prototype.setOutlineColor = function(rgbColor) {
    var colors = rgbColor.split(";");
    if ( colors.length < 3 ) return;

    this._outlineColor = parseInt(gdjs.rgbToHex(parseInt(colors[0], 10), parseInt(colors[1], 10), parseInt(colors[2], 10)), 16);
    this._graphics.lineStyle(this._outlineSize, this._outlineColor, this._outlineOpacity / 255);
};

gdjs.ShapePainterRuntimeObject.prototype.setOutlineSize = function(size) {
    this._outlineSize = size;
    this._graphics.lineStyle(this._outlineSize, this._outlineColor, this._outlineOpacity / 255);
};

gdjs.ShapePainterRuntimeObject.prototype.getOutlineSize = function() {
    return this._outlineSize;
};

gdjs.ShapePainterRuntimeObject.prototype.setFillOpacity = function(opacity) {
    this._fillOpacity = opacity;
};

gdjs.ShapePainterRuntimeObject.prototype.getFillOpacity = function() {
    return this._fillOpacity;
};

gdjs.ShapePainterRuntimeObject.prototype.setOutlineOpacity = function(opacity) {
    this._outlineOpacity = opacity;
    this._graphics.lineStyle(this._outlineSize, this._outlineColor, this._outlineOpacity / 255);
};

gdjs.ShapePainterRuntimeObject.prototype.getOutlineOpacity = function() {
    return this._outlineOpacity;
};

gdjs.ShapePainterRuntimeObject.prototype.setX = function(x) {
    this.x = x;
    if (!this._absoluteCoordinates) {
        this._graphics.position.x = x;
    }
};

gdjs.ShapePainterRuntimeObject.prototype.setY = function(y) {
    this.y = y;
    if (!this._absoluteCoordinates) {
        this._graphics.position.y = y;
    }
};

gdjs.ShapePainterRuntimeObject.prototype.getWidth = function() {
    return 32;
};

gdjs.ShapePainterRuntimeObject.prototype.getHeight = function() {
    return 32;
};
