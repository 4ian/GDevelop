/*
 *  GDevelop JS Platform
 *  2013 Florian Rival (Florian.Rival@gmail.com)
 */

/**
 * @typedef {Object} RGBColor Represents a color in RGB Format
 * @property {number} r The Red component of the color, from 0 to 255.
 * @property {number} g The Green component of the color, from 0 to 255.
 * @property {number} b The Blue component of the color, from 0 to 255.
 */

/**
 * @typedef {Object} ShapePainterObjectDataType Initial properties for a for {@link gdjs.ShapePainterRuntimeObject}.
 * @property {RGBColor} fillColor The color (in RGB format) of the inner part of the painted shape
 * @property {RGBColor} outlineColor The color (in RGB format) of the outline of the painted shape
 * @property {number} fillOpacity The opacity of the inner part of the painted shape
 * @property {number} outlineOpacity The opacity of the outline of the painted shape
 * @property {number} outlineSize The size of the outline of the painted shape, in pixels.
 * @property {boolean} absoluteCoordinates Use absolute coordinates?
 * 
 * @typedef {ObjectData & ShapePainterObjectDataType} ShapePainterObjectData
 */

/**
 * The ShapePainterRuntimeObject allows to draw graphics shapes on screen.
 *
 * @class ShapePainterRuntimeObject
 * @extends RuntimeObject
 * @memberof gdjs
 * @param {gdjs.RuntimeScene} runtimeScene The {@link gdjs.RuntimeScene} the object belongs to
 * @param {ShapePainterObjectData} shapePainterObjectData The initial properties of the object
 */
gdjs.ShapePainterRuntimeObject = function(runtimeScene, shapePainterObjectData)
{
    gdjs.RuntimeObject.call(this, runtimeScene, shapePainterObjectData);

    /** @type {number} */
    this._fillColor = parseInt(gdjs.rgbToHex(shapePainterObjectData.fillColor.r, shapePainterObjectData.fillColor.g, shapePainterObjectData.fillColor.b), 16);

    /** @type {number} */
    this._outlineColor = parseInt(gdjs.rgbToHex(shapePainterObjectData.outlineColor.r, shapePainterObjectData.outlineColor.g, shapePainterObjectData.outlineColor.b), 16);

    /** @type {number} */
    this._fillOpacity = shapePainterObjectData.fillOpacity;

    /** @type {number} */
    this._outlineOpacity = shapePainterObjectData.outlineOpacity;

    /** @type {number} */
    this._outlineSize = shapePainterObjectData.outlineSize;

    /** @type {boolean} */
    this._absoluteCoordinates = shapePainterObjectData.absoluteCoordinates;

    if (this._renderer)
        gdjs.ShapePainterRuntimeObjectRenderer.call(this._renderer, this, runtimeScene);
    else
        /** @type {gdjs.ShapePainterRuntimeObjectRenderer} */
        this._renderer = new gdjs.ShapePainterRuntimeObjectRenderer(this, runtimeScene);

    // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
    this.onCreated();
};

gdjs.ShapePainterRuntimeObject.prototype = Object.create( gdjs.RuntimeObject.prototype );
gdjs.registerObject("PrimitiveDrawing::Drawer", gdjs.ShapePainterRuntimeObject);

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

gdjs.ShapePainterRuntimeObject.prototype.drawLineV2 = function(x1, y1, x2, y2, thickness) {
    this._renderer.drawLineV2(x1, y1, x2, y2, thickness);
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

gdjs.ShapePainterRuntimeObject.prototype.drawArc = function(centerX, centerY, radius, startAngle, endAngle, anticlockwise, closePath) {
    this._renderer.drawArc(centerX, centerY, radius, startAngle, endAngle, anticlockwise, closePath);
};

gdjs.ShapePainterRuntimeObject.prototype.drawBezierCurve = function(x1, y1, cpX, cpY, cpX2, cpY2, x2, y2) {
    this._renderer.drawBezierCurve(x1, y1, cpX, cpY, cpX2, cpY2, x2, y2);  
};

gdjs.ShapePainterRuntimeObject.prototype.drawQuadraticCurve = function(x1, y1, cpX, cpY, x2, y2) {
    this._renderer.drawQuadraticCurve(x1, y1, cpX, cpY, x2, y2);  
};

gdjs.ShapePainterRuntimeObject.prototype.beginFillPath = function(x1, y1) {
    this._renderer.beginFillPath();
    this._renderer.drawPathMoveTo(x1, y1);
};

gdjs.ShapePainterRuntimeObject.prototype.endFillPath = function() {
    this._renderer.endFillPath();
};

gdjs.ShapePainterRuntimeObject.prototype.drawPathMoveTo = function(x1, y1) {
    this._renderer.drawPathMoveTo(x1, y1);
};

gdjs.ShapePainterRuntimeObject.prototype.drawPathLineTo = function(x1, y1, thickness) {
    this._renderer.drawPathLineTo(x1, y1, thickness);
};

gdjs.ShapePainterRuntimeObject.prototype.drawPathBezierCurveTo = function(cpX, cpY, cpX2, cpY2, toX, toY) {
    this._renderer.drawPathBezierCurveTo(cpX, cpY, cpX2, cpY2, toX, toY);  
};

gdjs.ShapePainterRuntimeObject.prototype.drawPathArc = function(cx, cy, radius, startAngle, endAngle, anticlockwise) {
    this._renderer.drawPathArc(cx, cy, radius, startAngle, endAngle, anticlockwise);
};

gdjs.ShapePainterRuntimeObject.prototype.drawPathQuadraticCurveTo = function(cpX, cpY, toX, toY) {
    this._renderer.drawPathQuadraticCurveTo(cpX, cpY, toX, toY);  
};

gdjs.ShapePainterRuntimeObject.prototype.closePath = function() {
    this._renderer.closePath();  
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
