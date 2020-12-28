/*
 *  GDevelop JS Platform
 *  2013 Florian Rival (Florian.Rival@gmail.com)
 */
namespace gdjs {
  /** Represents a color in RGB Format */
  export type RGBColor = {
    /** The Red component of the color, from 0 to 255. */
    r: number;
    /** The Green component of the color, from 0 to 255. */
    g: number;
    /** The Blue component of the color, from 0 to 255. */
    b: number;
  };

  /** Initial properties for a for {@link gdjs.ShapePainterRuntimeObject}. */
  export type ShapePainterObjectDataType = {
    /** The color (in RGB format) of the inner part of the painted shape */
    fillColor: RGBColor;
    /** The color (in RGB format) of the outline of the painted shape */
    outlineColor: RGBColor;
    /** The opacity of the inner part of the painted shape */
    fillOpacity: number;
    /** The opacity of the outline of the painted shape */
    outlineOpacity: number;
    /** The size of the outline of the painted shape, in pixels. */
    outlineSize: number;
    /** Use absolute coordinates? */
    absoluteCoordinates: boolean;
    /** Clear the previous render before the next draw? */
    clearBetweenFrames: boolean;
  };

  export type ShapePainterObjectData = ObjectData & ShapePainterObjectDataType;

  /**
   * The ShapePainterRuntimeObject allows to draw graphics shapes on screen.
   *
   * @class ShapePainterRuntimeObject
   * @extends RuntimeObject
   * @memberof gdjs
   */
  export class ShapePainterRuntimeObject extends gdjs.RuntimeObject {
    _fillColor: integer;
    _outlineColor: integer;
    _fillOpacity: float;
    _outlineOpacity: float;
    _outlineSize: number;
    _absoluteCoordinates: boolean;
    _clearBetweenFrames: boolean;
    _renderer: gdjs.ShapePainterRuntimeObjectRenderer;

    /**
     * @param runtimeScene The scene the object belongs to.
     * @param shapePainterObjectData The initial properties of the object
     */
    constructor(
      runtimeScene: gdjs.RuntimeScene,
      shapePainterObjectData: ShapePainterObjectData
    ) {
      super(runtimeScene, shapePainterObjectData);
      this._fillColor = parseInt(
        gdjs.rgbToHex(
          shapePainterObjectData.fillColor.r,
          shapePainterObjectData.fillColor.g,
          shapePainterObjectData.fillColor.b
        ),
        16
      );
      this._outlineColor = parseInt(
        gdjs.rgbToHex(
          shapePainterObjectData.outlineColor.r,
          shapePainterObjectData.outlineColor.g,
          shapePainterObjectData.outlineColor.b
        ),
        16
      );
      this._fillOpacity = shapePainterObjectData.fillOpacity;
      this._outlineOpacity = shapePainterObjectData.outlineOpacity;
      this._outlineSize = shapePainterObjectData.outlineSize;
      this._absoluteCoordinates = shapePainterObjectData.absoluteCoordinates;
      this._clearBetweenFrames = shapePainterObjectData.clearBetweenFrames;
      this._renderer = new gdjs.ShapePainterRuntimeObjectRenderer(
        this,
        runtimeScene
      );

      // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
      this.onCreated();
    }

    getRendererObject() {
      return this._renderer.getRendererObject();
    }

    updateFromObjectData(
      oldObjectData: ShapePainterObjectData,
      newObjectData: ShapePainterObjectData
    ): boolean {
      if (
        oldObjectData.fillColor.r !== newObjectData.fillColor.r ||
        oldObjectData.fillColor.g !== newObjectData.fillColor.g ||
        oldObjectData.fillColor.b !== newObjectData.fillColor.b
      ) {
        this.setFillColor(
          '' +
            newObjectData.fillColor.r +
            ';' +
            newObjectData.fillColor.g +
            ';' +
            newObjectData.fillColor.b
        );
      }
      if (
        oldObjectData.outlineColor.r !== newObjectData.outlineColor.r ||
        oldObjectData.outlineColor.g !== newObjectData.outlineColor.g ||
        oldObjectData.outlineColor.b !== newObjectData.outlineColor.b
      ) {
        this.setOutlineColor(
          '' +
            newObjectData.outlineColor.r +
            ';' +
            newObjectData.outlineColor.g +
            ';' +
            newObjectData.outlineColor.b
        );
      }
      if (oldObjectData.fillOpacity !== newObjectData.fillOpacity) {
        this.setFillOpacity(newObjectData.fillOpacity);
      }
      if (oldObjectData.outlineOpacity !== newObjectData.outlineOpacity) {
        this.setOutlineOpacity(newObjectData.outlineOpacity);
      }
      if (oldObjectData.outlineSize !== newObjectData.outlineSize) {
        this.setOutlineSize(newObjectData.outlineSize);
      }
      if (
        oldObjectData.absoluteCoordinates !== newObjectData.absoluteCoordinates
      ) {
        this._absoluteCoordinates = newObjectData.absoluteCoordinates;
        this._renderer.updateXPosition();
        this._renderer.updateYPosition();
      }
      if (
        oldObjectData.clearBetweenFrames !== newObjectData.clearBetweenFrames
      ) {
        this._clearBetweenFrames = newObjectData.clearBetweenFrames;
      }
      return true;
    }

    stepBehaviorsPreEvents(runtimeScene) {
      //We redefine stepBehaviorsPreEvents just to clear the graphics before running events.
      if (this._clearBetweenFrames) {
        this._renderer.clear();
      }
      super.stepBehaviorsPreEvents(runtimeScene);
    }

    getVisibilityAABB() {
      return this._absoluteCoordinates ? null : this.getAABB();
    }

    drawRectangle(x1, y1, x2, y2) {
      this._renderer.drawRectangle(x1, y1, x2, y2);
    }

    drawCircle(x, y, radius) {
      this._renderer.drawCircle(x, y, radius);
    }

    drawLine(x1, y1, x2, y2, thickness) {
      this._renderer.drawLine(x1, y1, x2, y2, thickness);
    }

    drawLineV2(x1, y1, x2, y2, thickness) {
      this._renderer.drawLineV2(x1, y1, x2, y2, thickness);
    }

    drawEllipse(centerX, centerY, width, height) {
      this._renderer.drawEllipse(centerX, centerY, width, height);
    }

    drawRoundedRectangle(startX1, startY1, endX2, endY2, radius) {
      this._renderer.drawRoundedRectangle(
        startX1,
        startY1,
        endX2,
        endY2,
        radius
      );
    }

    drawStar(centerX, centerY, points, radius, innerRadius, rotation) {
      this._renderer.drawStar(
        centerX,
        centerY,
        points,
        radius,
        innerRadius,
        rotation
      );
    }

    drawArc(
      centerX,
      centerY,
      radius,
      startAngle,
      endAngle,
      anticlockwise,
      closePath
    ) {
      this._renderer.drawArc(
        centerX,
        centerY,
        radius,
        startAngle,
        endAngle,
        anticlockwise,
        closePath
      );
    }

    drawBezierCurve(x1, y1, cpX, cpY, cpX2, cpY2, x2, y2) {
      this._renderer.drawBezierCurve(x1, y1, cpX, cpY, cpX2, cpY2, x2, y2);
    }

    drawQuadraticCurve(x1, y1, cpX, cpY, x2, y2) {
      this._renderer.drawQuadraticCurve(x1, y1, cpX, cpY, x2, y2);
    }

    beginFillPath(x1, y1) {
      this._renderer.beginFillPath();
      this._renderer.drawPathMoveTo(x1, y1);
    }

    endFillPath() {
      this._renderer.endFillPath();
    }

    drawPathMoveTo(x1, y1) {
      this._renderer.drawPathMoveTo(x1, y1);
    }

    drawPathLineTo(x1, y1) {
      this._renderer.drawPathLineTo(x1, y1);
    }

    drawPathBezierCurveTo(cpX, cpY, cpX2, cpY2, toX, toY) {
      this._renderer.drawPathBezierCurveTo(cpX, cpY, cpX2, cpY2, toX, toY);
    }

    drawPathArc(cx, cy, radius, startAngle, endAngle, anticlockwise) {
      this._renderer.drawPathArc(
        cx,
        cy,
        radius,
        startAngle,
        endAngle,
        anticlockwise
      );
    }

    drawPathQuadraticCurveTo(cpX, cpY, toX, toY) {
      this._renderer.drawPathQuadraticCurveTo(cpX, cpY, toX, toY);
    }

    closePath() {
      this._renderer.closePath();
    }

    setClearBetweenFrames(value): void {
      this._clearBetweenFrames = value;
    }

    isClearedBetweenFrames(): boolean {
      return this._clearBetweenFrames;
    }

    setFillColor(rgbColor): void {
      const colors = rgbColor.split(';');
      if (colors.length < 3) {
        return;
      }
      this._fillColor = parseInt(
        gdjs.rgbToHex(
          parseInt(colors[0], 10),
          parseInt(colors[1], 10),
          parseInt(colors[2], 10)
        ),
        16
      );
    }

    setOutlineColor(rgbColor): void {
      const colors = rgbColor.split(';');
      if (colors.length < 3) {
        return;
      }
      this._outlineColor = parseInt(
        gdjs.rgbToHex(
          parseInt(colors[0], 10),
          parseInt(colors[1], 10),
          parseInt(colors[2], 10)
        ),
        16
      );
      this._renderer.updateOutline();
    }

    setOutlineSize(size): void {
      this._outlineSize = size;
      this._renderer.updateOutline();
    }

    getOutlineSize() {
      return this._outlineSize;
    }

    setFillOpacity(opacity): void {
      this._fillOpacity = opacity;
    }

    getFillOpacity() {
      return this._fillOpacity;
    }

    setOutlineOpacity(opacity): void {
      this._outlineOpacity = opacity;
      this._renderer.updateOutline();
    }

    getOutlineOpacity() {
      return this._outlineOpacity;
    }

    setX(x): void {
      if (x === this.x) {
        return;
      }
      super.setX(x);
      this._renderer.updateXPosition();
    }

    setY(y): void {
      if (y === this.y) {
        return;
      }
      super.setY(y);
      this._renderer.updateYPosition();
    }

    getWidth(): float {
      return 32;
    }

    getHeight(): float {
      return 32;
    }
  }
  gdjs.registerObject(
    'PrimitiveDrawing::Drawer',
    gdjs.ShapePainterRuntimeObject
  );
  ShapePainterRuntimeObject.supportsReinitialization = false;
}
