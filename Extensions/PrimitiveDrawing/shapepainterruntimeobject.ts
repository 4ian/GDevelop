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

  export type Antialiasing = 'none' | 'low' | 'medium' | 'high';

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
    /** The type of anti-aliasing to apply at rendering. */
    antialiasing: Antialiasing;
  };

  export type ShapePainterObjectData = ObjectData & ShapePainterObjectDataType;

  /**
   * The ShapePainterRuntimeObject allows to draw graphics shapes on screen.
   */
  export class ShapePainterRuntimeObject
    extends gdjs.RuntimeObject
    implements gdjs.Resizable, gdjs.Scalable, gdjs.Flippable {
    _scaleX: number = 1;
    _scaleY: number = 1;
    _blendMode: number = 0;
    _flippedX: boolean = false;
    _flippedY: boolean = false;
    _customCenter: FloatPoint | null = null;
    _customCollisionMask: Polygon[] | null = null;

    _fillColor: integer;
    _outlineColor: integer;
    _fillOpacity: float;
    _outlineOpacity: float;
    _outlineSize: float;
    _useAbsoluteCoordinates: boolean;
    _clearBetweenFrames: boolean;
    _antialiasing: Antialiasing;
    _renderer: gdjs.ShapePainterRuntimeObjectRenderer;

    private static readonly _pointForTransformation: FloatPoint = [0, 0];

    /**
     * @param instanceContainer The container the object belongs to.
     * @param shapePainterObjectData The initial properties of the object
     */
    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      shapePainterObjectData: ShapePainterObjectData
    ) {
      super(instanceContainer, shapePainterObjectData);
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
      this._useAbsoluteCoordinates = shapePainterObjectData.absoluteCoordinates;
      this._clearBetweenFrames = shapePainterObjectData.clearBetweenFrames;
      this._antialiasing = shapePainterObjectData.antialiasing;
      this._renderer = new gdjs.ShapePainterRuntimeObjectRenderer(
        this,
        instanceContainer
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
        this._useAbsoluteCoordinates = newObjectData.absoluteCoordinates;
        this._renderer.updatePositionX();
        this._renderer.updatePositionY();
        this._renderer.updateAngle();
        this._renderer.updateScaleX();
        this._renderer.updateScaleY();
      }
      if (
        oldObjectData.clearBetweenFrames !== newObjectData.clearBetweenFrames
      ) {
        this._clearBetweenFrames = newObjectData.clearBetweenFrames;
      }
      return true;
    }

    stepBehaviorsPreEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {
      //We redefine stepBehaviorsPreEvents just to clear the graphics before running events.
      if (this._clearBetweenFrames) {
        this.clear();
      }
      super.stepBehaviorsPreEvents(instanceContainer);
    }

    onDestroyed(): void {
      super.onDestroyed();
      this._renderer.destroy();
    }

    /**
     * Clear the graphics.
     */
    clear() {
      this._renderer.clear();
    }

    getVisibilityAABB() {
      return this._useAbsoluteCoordinates ? null : this.getAABB();
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

    drawFilletRectangle(
      startX1: float,
      startY1: float,
      endX2: float,
      endY2: float,
      fillet: float
    ) {
      this._renderer.drawFilletRectangle(
        startX1,
        startY1,
        endX2,
        endY2,
        fillet
      );
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

    drawChamferRectangle(
      startX1: float,
      startY1: float,
      endX2: float,
      endY2: float,
      chamfer: float
    ) {
      this._renderer.drawChamferRectangle(
        startX1,
        startY1,
        endX2,
        endY2,
        chamfer
      );
    }

    drawTorus(
      centerX: float,
      centerY: float,
      innerRadius: float,
      outerRadius: float,
      startArc: float,
      endArc: float
    ) {
      this._renderer.drawTorus(
        centerX,
        centerY,
        innerRadius,
        outerRadius,
        startArc,
        endArc
      );
    }

    drawRegularPolygon(
      centerX: float,
      centerY: float,
      sides: float,
      radius: float,
      rotation: float
    ) {
      this._renderer.drawRegularPolygon(
        centerX,
        centerY,
        sides,
        radius,
        rotation
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

    setAntialiasing(value: Antialiasing): void {
      this._antialiasing = value;
      this._renderer.updateAntialiasing();
    }

    getAntialiasing(): Antialiasing {
      return this._antialiasing;
    }

    checkAntialiasing(valueToCompare: Antialiasing): boolean {
      return this._antialiasing === valueToCompare;
    }

    setCoordinatesRelative(value: boolean): void {
      this._useAbsoluteCoordinates = !value;
    }

    areCoordinatesRelative(): boolean {
      return !this._useAbsoluteCoordinates;
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
      this._renderer.updatePositionX();
    }

    setY(y: float): void {
      if (y === this.y) {
        return;
      }
      super.setY(y);
      this._renderer.updatePositionY();
    }

    setAngle(angle: float): void {
      if (angle === this.angle) {
        return;
      }
      super.setAngle(angle);
      this._renderer.updateAngle();
      this.invalidateHitboxes();
    }

    /**
     * The center of rotation is defined relatively
     * to the drawing origin (the object position).
     * This avoids the center to move on the drawing
     * when new shapes push the bounds.
     *
     * When no custom center is defined, it will move
     * to stay at the center of the drawable bounds.
     *
     * @param x coordinate of the custom center
     * @param y coordinate of the custom center
     */
    setRotationCenter(x: float, y: float): void {
      if (!this._customCenter) {
        this._customCenter = [0, 0];
      }
      this._customCenter[0] = x;
      this._customCenter[1] = y;
      this._renderer.updateRotationCenter();
    }

    /**
     * @returns The center X relatively to the drawing origin
     * (whereas `getCenterX()` is relative to the top left drawable bound and scaled).
     */
    getRotationCenterX(): float {
      return this._customCenter
        ? this._customCenter[0]
        : this._renderer.getUnscaledWidth() / 2 -
            this._renderer.getFrameRelativeOriginX();
    }

    /**
     * @returns The center Y relatively to the drawing origin
     * (whereas `getCenterY()` is relative to the top left drawable bound and scaled).
     */
    getRotationCenterY(): float {
      return this._customCenter
        ? this._customCenter[1]
        : this._renderer.getUnscaledHeight() / 2 -
            this._renderer.getFrameRelativeOriginY();
    }

    getCenterX(): float {
      if (!this._customCenter) {
        return super.getCenterX();
      }
      return (
        this._customCenter[0] * Math.abs(this._scaleX) +
        this.getX() -
        this.getDrawableX()
      );
    }

    getCenterY(): float {
      if (!this._customCenter) {
        return super.getCenterY();
      }
      return (
        this._customCenter[1] * Math.abs(this._scaleY) +
        this.getY() -
        this.getDrawableY()
      );
    }

    setWidth(newWidth: float): void {
      const unscaledWidth = this._renderer.getUnscaledWidth();
      if (unscaledWidth !== 0) {
        this.setScaleX(newWidth / unscaledWidth);
      }
    }

    setHeight(newHeight: float): void {
      const unscaledHeight = this._renderer.getUnscaledHeight();
      if (unscaledHeight !== 0) {
        this.setScaleY(newHeight / unscaledHeight);
      }
    }

    setSize(newWidth: float, newHeight: float): void {
      this.setWidth(newWidth);
      this.setHeight(newHeight);
    }

    /**
     * Change the scale on X and Y axis of the object.
     *
     * @param newScale The new scale (must be greater than 0).
     */
    setScale(newScale: float): void {
      this.setScaleX(newScale);
      this.setScaleY(newScale);
    }

    /**
     * Change the scale on X axis of the object (changing its width).
     *
     * @param newScale The new scale (must be greater than 0).
     */
    setScaleX(newScale: float): void {
      if (newScale < 0) {
        newScale = 0;
      }
      if (newScale === Math.abs(this._scaleX)) {
        return;
      }
      this._scaleX = newScale * (this._flippedX ? -1 : 1);
      this._renderer.updateScaleX();
      this.invalidateHitboxes();
    }

    /**
     * Change the scale on Y axis of the object (changing its width).
     *
     * @param newScale The new scale (must be greater than 0).
     */
    setScaleY(newScale: float): void {
      if (newScale < 0) {
        newScale = 0;
      }
      if (newScale === Math.abs(this._scaleY)) {
        return;
      }
      this._scaleY = newScale * (this._flippedY ? -1 : 1);
      this._renderer.updateScaleY();
      this.invalidateHitboxes();
    }

    flipX(enable: boolean): void {
      if (enable !== this._flippedX) {
        this._scaleX *= -1;
        this._flippedX = enable;
        this._renderer.updateScaleX();
        this.invalidateHitboxes();
      }
    }

    flipY(enable: boolean): void {
      if (enable !== this._flippedY) {
        this._scaleY *= -1;
        this._flippedY = enable;
        this._renderer.updateScaleY();
        this.invalidateHitboxes();
      }
    }

    isFlippedX(): boolean {
      return this._flippedX;
    }

    isFlippedY(): boolean {
      return this._flippedY;
    }

    /**
     * Get the scale of the object (or the geometric mean of the X and Y scale in case they are different).
     *
     * @return the scale of the object (or the geometric mean of the X and Y scale in case they are different).
     */
    getScale(): number {
      const scaleX = Math.abs(this._scaleX);
      const scaleY = Math.abs(this._scaleY);
      return scaleX === scaleY ? scaleX : Math.sqrt(scaleX * scaleY);
    }

    /**
     * Get the scale of the object on Y axis.
     *
     * @return the scale of the object on Y axis
     */
    getScaleY(): float {
      return Math.abs(this._scaleY);
    }

    /**
     * Get the scale of the object on X axis.
     *
     * @return the scale of the object on X axis
     */
    getScaleX(): float {
      return Math.abs(this._scaleX);
    }

    invalidateBounds() {
      this.invalidateHitboxes();
    }

    getDrawableX(): float {
      return this._renderer.getDrawableX();
    }

    getDrawableY(): float {
      return this._renderer.getDrawableY();
    }

    getWidth(): float {
      return this._renderer.getWidth();
    }

    getHeight(): float {
      return this._renderer.getHeight();
    }

    updatePreRender(instanceContainer: gdjs.RuntimeInstanceContainer): void {
      this._renderer.updatePreRender();
    }

    transformToDrawing(x: float, y: float) {
      const point = ShapePainterRuntimeObject._pointForTransformation;
      point[0] = x;
      point[1] = y;
      return this._renderer.transformToDrawing(point);
    }

    transformToScene(x: float, y: float) {
      const point = ShapePainterRuntimeObject._pointForTransformation;
      point[0] = x;
      point[1] = y;
      return this._renderer.transformToScene(point);
    }

    transformToDrawingX(x: float, y: float) {
      return this.transformToDrawing(x, y)[0];
    }

    transformToDrawingY(x: float, y: float) {
      return this.transformToDrawing(x, y)[1];
    }

    transformToSceneX(x: float, y: float) {
      return this.transformToScene(x, y)[0];
    }

    transformToSceneY(x: float, y: float) {
      return this.transformToScene(x, y)[1];
    }

    setRectangularCollisionMask(
      left: float,
      top: float,
      right: float,
      bottom: float
    ) {
      if (!this._customCollisionMask) {
        const rectangle = new gdjs.Polygon();
        rectangle.vertices.push([0, 0]);
        rectangle.vertices.push([0, 0]);
        rectangle.vertices.push([0, 0]);
        rectangle.vertices.push([0, 0]);
        this._customCollisionMask = [rectangle];
      }
      const rectangle = this._customCollisionMask[0].vertices;

      rectangle[0][0] = left;
      rectangle[0][1] = top;

      rectangle[1][0] = right;
      rectangle[1][1] = top;

      rectangle[2][0] = right;
      rectangle[2][1] = bottom;

      rectangle[3][0] = left;
      rectangle[3][1] = bottom;

      this.invalidateHitboxes();
    }

    updateHitBoxes(): void {
      this.hitBoxes = this._defaultHitBoxes;
      const width = this.getWidth();
      const height = this.getHeight();
      const centerX = this.getCenterX();
      const centerY = this.getCenterY();
      const vertices = this.hitBoxes[0].vertices;
      if (this._customCollisionMask) {
        const customCollisionMaskVertices = this._customCollisionMask[0]
          .vertices;
        for (let i = 0; i < 4; i++) {
          const point = this.transformToScene(
            customCollisionMaskVertices[i][0],
            customCollisionMaskVertices[i][1]
          );
          vertices[i][0] = point[0];
          vertices[i][1] = point[1];
        }
      } else {
        if (centerX === width / 2 && centerY === height / 2) {
          vertices[0][0] = -centerX;
          vertices[0][1] = -centerY;
          vertices[1][0] = +centerX;
          vertices[1][1] = -centerY;
          vertices[2][0] = +centerX;
          vertices[2][1] = +centerY;
          vertices[3][0] = -centerX;
          vertices[3][1] = +centerY;
        } else {
          vertices[0][0] = 0 - centerX;
          vertices[0][1] = 0 - centerY;
          vertices[1][0] = width - centerX;
          vertices[1][1] = 0 - centerY;
          vertices[2][0] = width - centerX;
          vertices[2][1] = height - centerY;
          vertices[3][0] = 0 - centerX;
          vertices[3][1] = height - centerY;
        }
        if (!this._useAbsoluteCoordinates) {
          this.hitBoxes[0].rotate(gdjs.toRad(this.getAngle()));
        }
        this.hitBoxes[0].move(
          this.getDrawableX() + centerX,
          this.getDrawableY() + centerY
        );
      }
    }
  }
  gdjs.registerObject(
    'PrimitiveDrawing::Drawer',
    gdjs.ShapePainterRuntimeObject
  );
  ShapePainterRuntimeObject.supportsReinitialization = false;
}
