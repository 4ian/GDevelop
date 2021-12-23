namespace gdjs {
  import PIXI = GlobalPIXIModule.PIXI;

  class ShapePainterRuntimeObjectPixiRenderer {
    _object: gdjs.ShapePainterRuntimeObject;
    _container: PIXI.Graphics;
    _graphics: PIXI.Graphics;
    _positionXIsUpToDate = false;
    _positionYIsUpToDate = false;

    constructor(
      runtimeObject: gdjs.ShapePainterRuntimeObject,
      runtimeScene: gdjs.RuntimeScene
    ) {
      this._object = runtimeObject;
      this._graphics = new PIXI.Graphics();
      this._container = this._graphics;//new PIXI.Container();
      //this._container.addChild(this._graphics);
      runtimeScene
        .getLayer('')
        .getRenderer()
        .addRendererObject(this._container, runtimeObject.getZOrder());
    }

    getRendererObject() {
      return this._graphics;
    }

    clear() {
      this._graphics.clear();
    }

    drawRectangle(x1: float, y1: float, x2: float, y2: float) {
      this.updateOutline();
      this._graphics.beginFill(
        this._object._fillColor,
        this._object._fillOpacity / 255
      );
      this._graphics.drawRect(x1, y1, x2 - x1, y2 - y1);
      this._graphics.endFill();
      this.invalidateBounds();
    }

    drawCircle(x: float, y: float, radius: float) {
      this.updateOutline();
      this._graphics.beginFill(
        this._object._fillColor,
        this._object._fillOpacity / 255
      );
      this._graphics.drawCircle(x, y, radius);
      this._graphics.endFill();
      this.invalidateBounds();
    }

    drawLine(x1: float, y1: float, x2: float, y2: float, thickness: float) {
      this._graphics.beginFill(
        this._object._fillColor,
        this._object._fillOpacity / 255
      );
      if (y2 === y1) {
        this._graphics.drawRect(x1, y1 - thickness / 2, x2 - x1, thickness);
      } else {
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const xIncrement = Math.sin(angle) * thickness;
        const yIncrement = Math.cos(angle) * thickness;
        this._graphics.drawPolygon(
          x1 + xIncrement,
          y1 - yIncrement,
          x1 - xIncrement,
          y1 + yIncrement,
          x2 - xIncrement,
          y2 + yIncrement,
          x2 + xIncrement,
          y2 - yIncrement
        );
      }
      this._graphics.endFill();
      this.invalidateBounds();
    }

    drawLineV2(x1: float, y1: float, x2: float, y2: float, thickness: float) {
      this._graphics.lineStyle(
        thickness,
        this._object._outlineColor,
        this._object._outlineOpacity / 255
      );
      this._graphics.moveTo(x1, y1);
      this._graphics.lineTo(x2, y2);
      this._graphics.endFill();
      this.invalidateBounds();
    }

    drawEllipse(x1: float, y1: float, width: float, height: float) {
      this.updateOutline();
      this._graphics.beginFill(
        this._object._fillColor,
        this._object._fillOpacity / 255
      );
      this._graphics.drawEllipse(x1, y1, width / 2, height / 2);
      this._graphics.endFill();
      this.invalidateBounds();
    }

    drawRoundedRectangle(
      x1: float,
      y1: float,
      x2: float,
      y2: float,
      radius: float
    ) {
      this.updateOutline();
      this._graphics.beginFill(
        this._object._fillColor,
        this._object._fillOpacity / 255
      );
      this._graphics.drawRoundedRect(x1, y1, x2 - x1, y2 - y1, radius);
      this._graphics.closePath();
      this._graphics.endFill();
      this.invalidateBounds();
    }

    drawStar(
      x1: float,
      y1: float,
      points: float,
      radius: float,
      innerRadius: float,
      rotation: float
    ) {
      this.updateOutline();
      this._graphics.beginFill(
        this._object._fillColor,
        this._object._fillOpacity / 255
      );
      //@ts-ignore from @pixi/graphics-extras
      this._graphics.drawStar(
        x1,
        y1,
        points,
        radius,
        innerRadius ? innerRadius : radius / 2,
        rotation ? gdjs.toRad(rotation) : 0
      );
      this._graphics.closePath();
      this._graphics.endFill();
      this.invalidateBounds();
    }

    drawArc(
      x1: float,
      y1: float,
      radius: float,
      startAngle: float,
      endAngle: float,
      anticlockwise: boolean,
      closePath: boolean
    ) {
      this.updateOutline();
      this._graphics.beginFill(
        this._object._fillColor,
        this._object._fillOpacity / 255
      );
      this._graphics.moveTo(
        x1 + radius * Math.cos(gdjs.toRad(startAngle)),
        y1 + radius * Math.sin(gdjs.toRad(startAngle))
      );
      this._graphics.arc(
        x1,
        y1,
        radius,
        gdjs.toRad(startAngle),
        gdjs.toRad(endAngle),
        anticlockwise ? true : false
      );
      if (closePath) {
        this._graphics.closePath();
      }
      this._graphics.endFill();
      this.invalidateBounds();
    }

    drawBezierCurve(
      x1: float,
      y1: float,
      cpX: float,
      cpY: float,
      cpX2: float,
      cpY2: float,
      x2: float,
      y2: float
    ) {
      this.updateOutline();
      this._graphics.beginFill(
        this._object._fillColor,
        this._object._fillOpacity / 255
      );
      this._graphics.moveTo(x1, y1);
      this._graphics.bezierCurveTo(cpX, cpY, cpX2, cpY2, x2, y2);
      this._graphics.endFill();
      this.invalidateBounds();
    }

    drawQuadraticCurve(
      x1: float,
      y1: float,
      cpX: float,
      cpY: float,
      x2: float,
      y2: float
    ) {
      this.updateOutline();
      this._graphics.beginFill(
        this._object._fillColor,
        this._object._fillOpacity / 255
      );
      this._graphics.moveTo(x1, y1);
      this._graphics.quadraticCurveTo(cpX, cpY, x2, y2);
      this._graphics.endFill();
      this.invalidateBounds();
    }

    beginFillPath() {
      this._graphics.beginFill(
        this._object._fillColor,
        this._object._fillOpacity / 255
      );
    }

    endFillPath() {
      this._graphics.endFill();
      this.invalidateBounds();
    }

    drawPathMoveTo(x1: float, y1: float) {
      this._graphics.moveTo(x1, y1);
    }

    drawPathLineTo(x1: float, y1: float) {
      this._graphics.lineTo(x1, y1);
    }

    drawPathBezierCurveTo(
      cpX: float,
      cpY: float,
      cpX2: float,
      cpY2: float,
      toX: float,
      toY: float
    ) {
      this._graphics.bezierCurveTo(cpX, cpY, cpX2, cpY2, toX, toY);
    }

    drawPathArc(
      x1: float,
      y1: float,
      radius: float,
      startAngle: float,
      endAngle: float,
      anticlockwise: boolean
    ) {
      this._graphics.arc(
        x1,
        y1,
        radius,
        gdjs.toRad(startAngle),
        gdjs.toRad(endAngle),
        anticlockwise ? true : false
      );
      this.invalidateBounds();
    }

    drawPathQuadraticCurveTo(cpX: float, cpY: float, toX: float, toY: float) {
      this._graphics.quadraticCurveTo(cpX, cpY, toX, toY);
    }

    closePath() {
      this._graphics.closePath();
      this.invalidateBounds();
    }

    updateOutline(): void {
      this._graphics.lineStyle(
        this._object._outlineSize,
        this._object._outlineColor,
        this._object._outlineOpacity / 255
      );
    }

    invalidateBounds() {
      this._object.invalidateBounds();
      this._positionXIsUpToDate = false;
      this._positionYIsUpToDate = false;
    }

    updatePreRender(): void {
      this.updatePositionIfNeeded();
    }

    updatePositionX(): void {
      if (this._object._absoluteCoordinates) {
        this._container.position.x = 0;
      } else {
        console.log("setX: " + this._object.x);
        // GDJS objects relative positions are relative in translation and rotation but not in scale.
        // Whereas, PIXI containers relative positions are also relative in scale.
        // This is why the multiplication and division by the scale are needed.
        const localBound = this._object._flippedX ? this._graphics.getLocalBounds().right : this._graphics.getLocalBounds().left;
        this._graphics.pivot.x = localBound + this._object.getCenterX() / Math.abs(this._graphics.scale.x);
        this._container.position.x = this._object.x + this._graphics.pivot.x * Math.abs(this._graphics.scale.x);
      }
    }

    updatePositionY(): void {
      if (this._object._absoluteCoordinates) {
        this._container.position.y = 0;
      } else {
        const localBound = this._object._flippedY ? this._graphics.getLocalBounds().bottom : this._graphics.getLocalBounds().top;
        this._graphics.pivot.y = localBound + this._object.getCenterY() / Math.abs(this._graphics.scale.y);
        this._container.position.y = this._object.y + this._graphics.pivot.y * Math.abs(this._graphics.scale.y);
      }
    }
    
    updatePositionIfNeeded() {
      // Graphics positions can need update when something is drawn.
      if (!this._positionXIsUpToDate) {
        this.updatePositionX();
        this._positionXIsUpToDate = true;
      }
      if (!this._positionYIsUpToDate) {
        this.updatePositionY();
        this._positionYIsUpToDate = true;
      }
    }

    updateAngle(): void {
      console.log(this._graphics.getLocalBounds());
      if (this._object._absoluteCoordinates) {
        this._graphics.angle = 0;
      }
      else {
        this.updatePositionIfNeeded();
        this._graphics.angle = this._object.angle;
      }
    }

    updateScaleX(): void {
      if (this._object._absoluteCoordinates) {
        this._container.scale.x = 1;
      } else {
        console.log("ScaleX: " + this._object._scaleX);
        this._container.scale.x = this._object._scaleX;
      }
      this.updatePositionX();
      this.updatePositionY();
    }

    updateScaleY(): void {
      if (this._object._absoluteCoordinates) {
        this._container.scale.y = 1;
      } else {
        this._container.scale.y = this._object._scaleY;
      }
      this.updatePositionX();
      this.updatePositionY();
    }
    
    getDrawableX(): float {
      if (this._object._absoluteCoordinates) {
        return this._graphics.getLocalBounds().x;
      }
      const localBound = this._object._flippedX ? this._graphics.getLocalBounds().right : this._graphics.getLocalBounds().left;
      // When new shape are drawn, the bounds of the object can extend.
      // The object position stays the same but (drawableX; drawableY) can change.
      return this._object.getX() + localBound * Math.abs(this._graphics.scale.x);
    }

    getDrawableY(): float {
      if (this._object._absoluteCoordinates) {
        return this._graphics.getLocalBounds().y;
      }
      const localBound = this._object._flippedY ? this._graphics.getLocalBounds().bottom : this._graphics.getLocalBounds().top;
      return this._object.getY() + localBound * Math.abs(this._graphics.scale.y);
    }

    getWidth(): float {
      return this._graphics.width;
    }

    getHeight(): float {
      return this._graphics.height;
    }
    
    getUnscaledWidth(): float {
      return this._graphics.width / this._graphics.scale.x;
    }

    getUnscaledHeight(): float {
      return this._graphics.height / this._graphics.scale.y;
    }
  }

  export const ShapePainterRuntimeObjectRenderer = ShapePainterRuntimeObjectPixiRenderer;
  export type ShapePainterRuntimeObjectRenderer = ShapePainterRuntimeObjectPixiRenderer;
}
