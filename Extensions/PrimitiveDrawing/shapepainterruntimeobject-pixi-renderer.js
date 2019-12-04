gdjs.ShapePainterRuntimeObjectPixiRenderer = function(runtimeObject, runtimeScene)
{
    this._object = runtimeObject;

    if ( this._graphics === undefined ) {
        this._graphics = new PIXI.Graphics();
    }

    runtimeScene.getLayer("").getRenderer().addRendererObject(this._graphics, runtimeObject.getZOrder());
};

gdjs.ShapePainterRuntimeObjectRenderer = gdjs.ShapePainterRuntimeObjectPixiRenderer; //Register the class to let the engine use it.

gdjs.ShapePainterRuntimeObjectPixiRenderer.prototype.getRendererObject = function() {
    return this._graphics;
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

gdjs.ShapePainterRuntimeObjectPixiRenderer.prototype.drawLineV2 = function(x1, y1, x2, y2, thickness) {
    this._graphics.lineStyle(thickness, this._object._outlineColor, this._object._outlineOpacity / 255);
    this._graphics.moveTo(x1, y1);
    this._graphics.lineTo(x2,y2);
    this._graphics.endFill();  
};

gdjs.ShapePainterRuntimeObjectPixiRenderer.prototype.drawEllipse = function(x1, y1, width, height) {
    this._graphics.beginFill(this._object._fillColor, this._object._fillOpacity / 255);
    this._graphics.drawEllipse(x1, y1, width/2, height/2);
    this._graphics.endFill();
};

gdjs.ShapePainterRuntimeObjectPixiRenderer.prototype.drawRoundedRectangle = function(x1, y1, x2, y2, radius) {
    this._graphics.beginFill(this._object._fillColor, this._object._fillOpacity / 255);
    this._graphics.drawRoundedRect(x1, y1, x2 - x1, y2 - y1, radius);
    this._graphics.closePath();
    this._graphics.endFill();
};

gdjs.ShapePainterRuntimeObjectPixiRenderer.prototype.drawStar = function(x1, y1, points, radius, innerRadius, rotation) {
    this._graphics.beginFill(this._object._fillColor, this._object._fillOpacity / 255);
    this._graphics.drawStar(x1, y1, points, radius, innerRadius ? innerRadius : radius/2, rotation ? gdjs.toRad(rotation) : 0);
    this._graphics.closePath();
    this._graphics.endFill();
};

gdjs.ShapePainterRuntimeObjectPixiRenderer.prototype.drawArc = function(x1, y1, radius, startAngle, endAngle, anticlockwise, closePath) {
    this._graphics.beginFill(this._object._fillColor, this._object._fillOpacity / 255);
    this._graphics.moveTo(  x1 + radius * Math.cos(gdjs.toRad(startAngle)), y1 + radius * Math.sin(gdjs.toRad(startAngle)));
    this._graphics.arc(x1, y1, radius, gdjs.toRad(startAngle), gdjs.toRad(endAngle), anticlockwise ? true : false);
    if(closePath){
        this._graphics.closePath();
    }
    this._graphics.endFill();
};

gdjs.ShapePainterRuntimeObjectPixiRenderer.prototype.drawBezierCurve = function(x1, y1, cpX, cpY, cpX2, cpY2, x2, y2) {
    this._graphics.beginFill(this._object._fillColor, this._object._fillOpacity / 255);
    this._graphics.moveTo(x1, y1);
    this._graphics.bezierCurveTo(cpX, cpY, cpX2, cpY2, x2, y2);  
    this._graphics.endFill();
};

gdjs.ShapePainterRuntimeObjectPixiRenderer.prototype.drawQuadraticCurve = function(x1, y1, cpX, cpY, x2, y2) {
    this._graphics.beginFill(this._object._fillColor, this._object._fillOpacity / 255);
    this._graphics.moveTo(x1, y1);
    this._graphics.quadraticCurveTo(cpX, cpY, x2, y2);
    this._graphics.endFill();
};

gdjs.ShapePainterRuntimeObjectPixiRenderer.prototype.beginFillPath = function() {
    this._graphics.beginFill(this._object._fillColor, this._object._fillOpacity / 255);
};

gdjs.ShapePainterRuntimeObjectPixiRenderer.prototype.endFillPath = function() {
    this._graphics.endFill();
};

gdjs.ShapePainterRuntimeObjectPixiRenderer.prototype.drawPathMoveTo = function(x1, y1) {
    this._graphics.moveTo(x1, y1);
};

gdjs.ShapePainterRuntimeObjectPixiRenderer.prototype.drawPathLineTo = function(x1, y1) {
    if(this._graphics.graphicsData.length === 0){
        this._graphics.moveTo(0, 0);
    }
    this._graphics.lineTo(x1, y1);
};

gdjs.ShapePainterRuntimeObjectPixiRenderer.prototype.drawPathBezierCurveTo = function(cpX, cpY, cpX2, cpY2, toX, toY) {
    if(this._graphics.graphicsData.length === 0){
        this._graphics.moveTo(0, 0);
    }
    this._graphics.bezierCurveTo(cpX, cpY, cpX2, cpY2, toX, toY);  
};

gdjs.ShapePainterRuntimeObjectPixiRenderer.prototype.drawPathArc = function(x1, y1, radius, startAngle, endAngle, anticlockwise) {
    if(this._graphics.graphicsData.length === 0){
        this._graphics.moveTo(0, 0);
    }
    this._graphics.arc(x1, y1, radius, gdjs.toRad(startAngle), gdjs.toRad(endAngle), anticlockwise ? true : false);
};

gdjs.ShapePainterRuntimeObjectPixiRenderer.prototype.drawPathQuadraticCurveTo = function(cpX, cpY, toX, toY) {
    if(this._graphics.graphicsData.length === 0){
        this._graphics.moveTo(0, 0);
    }
    this._graphics.quadraticCurveTo(cpX, cpY, toX, toY);  
};

gdjs.ShapePainterRuntimeObjectPixiRenderer.prototype.closePath = function() {
    this._graphics.closePath();  
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
