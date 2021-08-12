/*
 *  GDevelop JS Platform
 *  2013 Florian Rival (Florian.Rival@gmail.com)
 */
namespace gdjs {
  /** Represents a color in RGB Format */
  export type RGBColor = {
    /** The Red component of the color, from 0 to 255. */
    r: integer;
    /** The Green component of the color, from 0 to 255. */
    g: integer;
    /** The Blue component of the color, from 0 to 255. */
    b: integer;
  };

  /** Initial properties for a for {@link gdjs.ShapePainterRuntimeObject}. */
  export type ShapePainterObjectDataType = {
    /** The color (in RGB format) of the inner part of the painted shape */
    fillColor: RGBColor;
    /** The color (in RGB format) of the outline of the painted shape */
    outlineColor: RGBColor;
    /** The opacity of the inner part of the painted shape, from 0 to 255 */
    fillOpacity: float;
    /** The opacity of the outline of the painted shape, from 0 to 255 */
    outlineOpacity: float;
    /** The size of the outline of the painted shape, in pixels. */
    outlineSize: float;
    /** Use absolute coordinates? */
    absoluteCoordinates: boolean;
    /** Clear the previous render before the next draw? */
    clearBetweenFrames: boolean;
  };

  export type ShapePainterObjectData = ObjectData & ShapePainterObjectDataType;

  /**
   * The ShapePainterRuntimeObject allows to draw graphics shapes on screen.
   */
  export class ShapePainterRuntimeObject extends gdjs.RuntimeObject {
    _fillColor: integer;
    _outlineColor: integer;
    _fillOpacity: float;
    _outlineOpacity: float;
    _outlineSize: float;
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

    stepBehaviorsPreEvents(runtimeScene: gdjs.RuntimeScene) {
      //We redefine stepBehaviorsPreEvents just to clear the graphics before running events.
      if (this._clearBetweenFrames) {
        this.clear();
      }
      super.stepBehaviorsPreEvents(runtimeScene);
    }

    /**
     * Clear the graphics.
     */
    clear() {
      this._renderer.clear();
    }

    getVisibilityAABB() {
      return this._absoluteCoordinates ? null : this.getAABB();
    }

    drawRectangle(x1: float, y1: float, x2: float, y2: float) {
      this._renderer.drawRectangle(x1, y1, x2, y2);
    }

    drawCircle(x: float, y: float, radius: float) {
      this._renderer.drawCircle(x, y, radius);
    }

    drawLine(x1: float, y1: float, x2: float, y2: float, thickness: float) {
      this._renderer.drawLine(x1, y1, x2, y2, thickness);
    }

    drawLineV2(x1: float, y1: float, x2: float, y2: float, thickness: float) {
      this._renderer.drawLineV2(x1, y1, x2, y2, thickness);
    }

    drawEllipse(centerX: float, centerY: float, width: float, height: float) {
      this._renderer.drawEllipse(centerX, centerY, width, height);
    }

    drawRoundedRectangle(
      startX1: float,
      startY1: float,
      endX2: float,
      endY2: float,
      radius: float
    ) {
      this._renderer.drawRoundedRectangle(
        startX1,
        startY1,
        endX2,
        endY2,
        radius
      );
    }

    drawStar(
      centerX: float,
      centerY: float,
      points: float,
      radius: float,
      innerRadius: float,
      rotation: float
    ) {
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
      centerX: float,
      centerY: float,
      radius: float,
      startAngle: float,
      endAngle: float,
      anticlockwise: boolean,
      closePath: boolean
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
      this._renderer.drawBezierCurve(x1, y1, cpX, cpY, cpX2, cpY2, x2, y2);
    }

    drawQuadraticCurve(
      x1: float,
      y1: float,
      cpX: float,
      cpY: float,
      x2: float,
      y2: float
    ) {
      this._renderer.drawQuadraticCurve(x1, y1, cpX, cpY, x2, y2);
    }

    beginFillPath(x1: float, y1: float) {
      this._renderer.beginFillPath();
      this._renderer.drawPathMoveTo(x1, y1);
    }

    endFillPath() {
      this._renderer.endFillPath();
    }

    drawPathMoveTo(x1: float, y1: float) {
      this._renderer.drawPathMoveTo(x1, y1);
    }

    drawPathLineTo(x1: float, y1: float) {
      this._renderer.drawPathLineTo(x1, y1);
    }

    drawPathBezierCurveTo(
      cpX: float,
      cpY: float,
      cpX2: float,
      cpY2: float,
      toX: float,
      toY: float
    ) {
      this._renderer.drawPathBezierCurveTo(cpX, cpY, cpX2, cpY2, toX, toY);
    }

    drawPathArc(
      cx: float,
      cy: float,
      radius: float,
      startAngle: float,
      endAngle: float,
      anticlockwise: boolean
    ) {
      this._renderer.drawPathArc(
        cx,
        cy,
        radius,
        startAngle,
        endAngle,
        anticlockwise
      );
    }

    drawPathQuadraticCurveTo(cpX: float, cpY: float, toX: float, toY: float) {
      this._renderer.drawPathQuadraticCurveTo(cpX, cpY, toX, toY);
    }

    closePath() {
      this._renderer.closePath();
    }

    setClearBetweenFrames(value: boolean): void {
      this._clearBetweenFrames = value;
    }

    isClearedBetweenFrames(): boolean {
      return this._clearBetweenFrames;
    }

    setCoordinatesRelative(value: boolean): void {
      this._absoluteCoordinates = !value;
    }

    areCoordinatesRelative(): boolean {
      return !this._absoluteCoordinates;
    }

    /**
     *
     * @param rgbColor semicolon separated decimal values
     */
    setFillColor(rgbColor: string): void {
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

    getFillColorR(): integer {
      return gdjs.hexNumberToRGB(this._fillColor).r;
    }
    getFillColorG(): integer {
      return gdjs.hexNumberToRGB(this._fillColor).g;
    }
    getFillColorB(): integer {
      return gdjs.hexNumberToRGB(this._fillColor).b;
    }

    /**
     *
     * @param rgbColor semicolon separated decimal values
     */
    setOutlineColor(rgbColor: string): void {
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

    getOutlineColorR(): integer {
      return gdjs.hexNumberToRGB(this._outlineColor).r;
    }
    getOutlineColorG(): integer {
      return gdjs.hexNumberToRGB(this._outlineColor).g;
    }
    getOutlineColorB(): integer {
      return gdjs.hexNumberToRGB(this._outlineColor).b;
    }

    setOutlineSize(size: float): void {
      this._outlineSize = size;
      this._renderer.updateOutline();
    }

    getOutlineSize() {
      return this._outlineSize;
    }

    /**
     *
     * @param opacity from 0 to 255
     */
    setFillOpacity(opacity: float): void {
      this._fillOpacity = opacity;
    }

    /**
     *
     * @returns an opacity value from 0 to 255.
     */
    getFillOpacity() {
      return this._fillOpacity;
    }

    /**
     *
     * @param opacity from 0 to 255
     */
    setOutlineOpacity(opacity: float): void {
      this._outlineOpacity = opacity;
      this._renderer.updateOutline();
    }

    /**
     *
     * @returns an opacity value from 0 to 255.
     */
    getOutlineOpacity() {
      return this._outlineOpacity;
    }

    setX(x: float): void {
      if (x === this.x) {
        return;
      }
      super.setX(x);
      this._renderer.updateXPosition();
    }

    setY(y: float): void {
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
