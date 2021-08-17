namespace gdjs {
  import PIXI = GlobalPIXIModule.PIXI;

  class ShapePainterRuntimeObjectPixiRenderer {
    _object: gdjs.ShapePainterRuntimeObject;
    _graphics: PIXI.Graphics;

    constructor(
      runtimeObject: gdjs.ShapePainterRuntimeObject,
      runtimeScene: gdjs.RuntimeScene
    ) {
      this._object = runtimeObject;
      this._graphics = new PIXI.Graphics();
      runtimeScene
        .getLayer('')
        .getRenderer()
        .addRendererObject(this._graphics, runtimeObject.getZOrder());
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
    }

    drawCircle(x: float, y: float, radius: float) {
      this.updateOutline();
      this._graphics.beginFill(
        this._object._fillColor,
        this._object._fillOpacity / 255
      );
      this._graphics.drawCircle(x, y, radius);
      this._graphics.endFill();
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
    }

    drawEllipse(x1: float, y1: float, width: float, height: float) {
      this.updateOutline();
      this._graphics.beginFill(
        this._object._fillColor,
        this._object._fillOpacity / 255
      );
      this._graphics.drawEllipse(x1, y1, width / 2, height / 2);
      this._graphics.endFill();
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
    }

    beginFillPath() {
      this._graphics.beginFill(
        this._object._fillColor,
        this._object._fillOpacity / 255
      );
    }

    endFillPath() {
      this._graphics.endFill();
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
    }

    drawPathQuadraticCurveTo(cpX: float, cpY: float, toX: float, toY: float) {
      this._graphics.quadraticCurveTo(cpX, cpY, toX, toY);
    }

    closePath() {
      this._graphics.closePath();
    }

    updateOutline(): void {
      this._graphics.lineStyle(
        this._object._outlineSize,
        this._object._outlineColor,
        this._object._outlineOpacity / 255
      );
    }

    updateXPosition(): void {
      if (!this._object._absoluteCoordinates) {
        this._graphics.position.x = this._object.x;
      } else {
        this._graphics.position.x = 0;
      }
    }

    updateYPosition(): void {
      if (!this._object._absoluteCoordinates) {
        this._graphics.position.y = this._object.y;
      } else {
        this._graphics.position.y = 0;
      }
    }
  }

  export const ShapePainterRuntimeObjectRenderer = ShapePainterRuntimeObjectPixiRenderer;
  export type ShapePainterRuntimeObjectRenderer = ShapePainterRuntimeObjectPixiRenderer;
}
