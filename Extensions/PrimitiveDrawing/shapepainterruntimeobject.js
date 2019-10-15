/*
 *  GDevelop JS Platform
 *  2013 Florian Rival (Florian.Rival@gmail.com)
 */

/**
 * The ShapePainterRuntimeObject allows to draw graphics shapes on screen.
 *
 * @class ShapePainterRuntimeObject
 * @extends RuntimeObject
 * @memberof gdjs
 */
gdjs.ShapePainterRuntimeObject = function(runtimeScene, objectData)
{
    gdjs.RuntimeObject.call(this, runtimeScene, objectData);

    this._fillColor = parseInt(gdjs.rgbToHex(objectData.fillColor.r, objectData.fillColor.g, objectData.fillColor.b), 16);
    this._outlineColor = parseInt(gdjs.rgbToHex(objectData.outlineColor.r, objectData.outlineColor.g, objectData.outlineColor.b), 16);
    this._fillOpacity = objectData.fillOpacity;
    this._outlineOpacity = objectData.outlineOpacity;
    this._outlineSize = objectData.outlineSize;
    this._absoluteCoordinates = objectData.absoluteCoordinates;

    if (this._renderer)
        gdjs.ShapePainterRuntimeObjectRenderer.call(this._renderer, this, runtimeScene);
    else
        this._renderer = new gdjs.ShapePainterRuntimeObjectRenderer(this, runtimeScene);

    // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
    this.onCreated();
};

gdjs.ShapePainterRuntimeObject.prototype = Object.create( gdjs.RuntimeObject.prototype );
gdjs.ShapePainterRuntimeObject.thisIsARuntimeObjectConstructor = "PrimitiveDrawing::Drawer";

gdjs.ShapePainterRuntimeObject.prototype.getRendererObject = function() {
    return this._renderer.getRendererObject();
};

gdjs.ShapePainterRuntimeObject.prototype.stepBehaviorsPreEvents = function(runtimeScene) {
    //We redefine stepBehaviorsPreEvents just to clear the graphics before running events.
    this._renderer.clear();

    gdjs.RuntimeObject.prototype.stepBehaviorsPreEvents.call(this, runtimeScene);
};

gdjs.ShapePainterRuntimeObject.prototype.getVisibilityAABB = function() {
    return this._absoluteCoordinates ? null : this.getAABB();
};

gdjs.ShapePainterRuntimeObject.prototype.drawRectangle = function(x1, y1, x2, y2) {
    this._renderer.drawRectangle(x1, y1, x2, y2);
};

gdjs.ShapePainterRuntimeObject.prototype.drawCircle = function(x, y, radius) {
    this._renderer.drawCircle(x, y, radius);
};

gdjs.ShapePainterRuntimeObject.prototype.drawLine = function(x1, y1, x2, y2, thickness) {
    this._renderer.drawLine(x1, y1, x2, y2, thickness);
};

gdjs.ShapePainterRuntimeObject.prototype.drawEllipse = function(centerX, centerY, width, height) {
    this._renderer.drawEllipse(centerX, centerY, width, height);
};

gdjs.ShapePainterRuntimeObject.prototype.drawRoundedRectangle = function(startX1, startY1, endX2, endY2, radius) {
    this._renderer.drawRoundedRectangle(startX1, startY1, endX2, endY2, radius);
};

gdjs.ShapePainterRuntimeObject.prototype.drawStar = function(centerX, centerY, points, radius, innerRadius, rotation) {
    this._renderer.drawStar(centerX, centerY, points, radius, innerRadius, rotation);
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
    this._renderer.updateOutline();
};

gdjs.ShapePainterRuntimeObject.prototype.setOutlineSize = function(size) {
    this._outlineSize = size;
    this._renderer.updateOutline();
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
    this._renderer.updateOutline();
};

gdjs.ShapePainterRuntimeObject.prototype.getOutlineOpacity = function() {
    return this._outlineOpacity;
};

gdjs.ShapePainterRuntimeObject.prototype.setX = function(x) {
    if ( x === this.x ) return;

    gdjs.RuntimeObject.prototype.setX.call(this, x);
    this._renderer.updateXPosition();
};

gdjs.ShapePainterRuntimeObject.prototype.setY = function(y) {
    if ( y === this.y ) return;

    gdjs.RuntimeObject.prototype.setY.call(this, y);
    this._renderer.updateYPosition();
};

gdjs.ShapePainterRuntimeObject.prototype.getWidth = function() {
    return 32;
};

gdjs.ShapePainterRuntimeObject.prototype.getHeight = function() {
    return 32;
};
