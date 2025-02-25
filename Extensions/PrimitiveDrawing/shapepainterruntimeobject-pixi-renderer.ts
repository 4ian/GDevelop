namespace gdjs {
  class ShapePainterRuntimeObjectPixiRenderer {
    _object: gdjs.ShapePainterRuntimeObject;
    _graphics: PIXI.Graphics;
    /**
     * Graphics positions can need updates when shapes are added,
     * this avoids to do it each time.
     */
    _positionXIsUpToDate = false;
    /**
     * Graphics positions can need updates when shapes are added,
     * this avoids to do it each time.
     */
    _positionYIsUpToDate = false;
    /**
     * This allows to use the transformation of the renderer
     * and compute it only when necessary.
     */
    _transformationIsUpToDate = false;

    _antialiasingFilter: null | PIXI.Filter = null;

    _fillStyle: PIXI.FillStyle = {};
    _strokeStyle: PIXI.StrokeStyle = {};

    private static readonly _positionForTransformation: PIXI.PointData = {
      x: 0,
      y: 0,
    };

    constructor(
      runtimeObject: gdjs.ShapePainterRuntimeObject,
      instanceContainer: gdjs.RuntimeInstanceContainer
    ) {
      this._object = runtimeObject;
      this._graphics = new PIXI.Graphics();
      instanceContainer
        .getLayer('')
        .getRenderer()
        .addRendererObject(this._graphics, runtimeObject.getZOrder());
      this.updateAntialiasing();
    }

    getRendererObject() {
      return this._graphics;
    }

    clear() {
      this._graphics.clear();
      this.invalidateBounds();
    }

    private _applyStyle() {
      this._fillStyle.color = this._object._fillColor;
      this._fillStyle.alpha = this._object._fillOpacity / 255;

      this._strokeStyle.width = this._object._outlineSize;
      this._strokeStyle.color = this._object._outlineColor;
      this._strokeStyle.alpha = this._object._outlineOpacity / 255;

      this._graphics.fill(this._fillStyle);
      this._graphics.stroke(this._strokeStyle);
    }

    drawRectangle(x1: float, y1: float, x2: float, y2: float) {
      this._graphics.rect(x1, y1, x2 - x1, y2 - y1);
      this._applyStyle();
      this.invalidateBounds();
    }

    drawCircle(x: float, y: float, radius: float) {
      this._fillStyle.color = this._object._fillColor;
      this._fillStyle.alpha = this._object._fillOpacity / 255;
      this._graphics.circle(x, y, radius);
      this._graphics.fill(this._fillStyle);
      this.invalidateBounds();
    }

    drawLine(x1: float, y1: float, x2: float, y2: float, thickness: float) {
      if (y2 === y1) {
        this._graphics.rect(x1, y1 - thickness / 2, x2 - x1, thickness);
      } else {
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const xIncrement = Math.sin(angle) * thickness;
        const yIncrement = Math.cos(angle) * thickness;

        const workingPoints: Array<number> = gdjs.staticArray(
          gdjs.AnchorRuntimeBehavior.prototype.doStepPreEvents
        ) as Array<number>;
        workingPoints.length = 8;
        workingPoints[0] = x1 + xIncrement;
        workingPoints[1] = y1 - yIncrement;
        workingPoints[2] = x1 - xIncrement;
        workingPoints[3] = y1 + yIncrement;
        workingPoints[4] = x2 - xIncrement;
        workingPoints[5] = y2 + yIncrement;
        workingPoints[6] = x2 + xIncrement;
        workingPoints[7] = y2 - yIncrement;
        this._graphics.poly(workingPoints);
      }
      this._applyStyle();
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
      this._graphics.ellipse(x1, y1, width / 2, height / 2);
      this._applyStyle();
      this.invalidateBounds();
    }

    drawRoundedRectangle(
      x1: float,
      y1: float,
      x2: float,
      y2: float,
      radius: float
    ) {
      this._graphics.roundRect(x1, y1, x2 - x1, y2 - y1, radius);
      this._applyStyle();
      this.invalidateBounds();
    }

    drawFilletRectangle(
      x1: float,
      y1: float,
      x2: float,
      y2: float,
      fillet: float
    ) {
      this._graphics.filletRect(x1, y1, x2 - x1, y2 - y1, fillet);
      this._applyStyle();
      this.invalidateBounds();
    }

    drawChamferRectangle(
      x1: float,
      y1: float,
      x2: float,
      y2: float,
      chamfer: float
    ) {
      this._graphics.chamferRect(x1, y1, x2 - x1, y2 - y1, chamfer);
      this._applyStyle();
      this.invalidateBounds();
    }

    drawTorus(
      x1: float,
      y1: float,
      innerRadius: float,
      outerRadius: float,
      startArc: float,
      endArc: float
    ) {
      this._graphics.beginPath();
      this._graphics.arc(
        x1,
        y1,
        outerRadius,
        startArc ? gdjs.toRad(startArc) : 0,
        endArc ? gdjs.toRad(endArc) : 0
      );
      // TODO PIXI8 Add a lineTo?
      this._graphics.arc(
        x1,
        y1,
        innerRadius,
        startArc ? gdjs.toRad(startArc) : 0,
        endArc ? gdjs.toRad(endArc) : 0,
        true
      );
      this._graphics.closePath();
      this._applyStyle();
      this.invalidateBounds();
    }

    drawRegularPolygon(
      x1: float,
      y1: float,
      sides: float,
      radius: float,
      rotation: float
    ) {
      this._graphics.regularPoly(
        x1,
        y1,
        radius,
        sides,
        rotation ? gdjs.toRad(rotation) : 0
      );
      this._applyStyle();
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
      this._graphics.star(
        x1,
        y1,
        points,
        radius,
        innerRadius ? innerRadius : radius / 2,
        rotation ? gdjs.toRad(rotation) : 0
      );
      this._applyStyle();
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
      this._graphics.beginPath();
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
      this._applyStyle();
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
      this._graphics.beginPath();
      this._graphics.moveTo(x1, y1);
      this._graphics.bezierCurveTo(cpX, cpY, cpX2, cpY2, x2, y2);
      this._applyStyle();
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
      this._graphics.beginPath();
      this._graphics.moveTo(x1, y1);
      this._graphics.quadraticCurveTo(cpX, cpY, x2, y2);
      this._applyStyle();
      this.invalidateBounds();
    }

    beginFillPath() {
      this._graphics.beginPath();
    }

    endFillPath() {
      this._applyStyle();
      this.invalidateBounds();
    }

    drawPathMoveTo(x1: float, y1: float) {
      this._graphics.moveTo(x1, y1);
    }

    drawPathLineTo(x1: float, y1: float) {
      this._graphics.lineTo(x1, y1);
      this.invalidateBounds();
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
      this.invalidateBounds();
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
      this.invalidateBounds();
    }

    closePath() {
      this._graphics.closePath();
      this.invalidateBounds();
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
      if (this._object._useAbsoluteCoordinates) {
        this._graphics.pivot.x = 0;
        this._graphics.position.x = 0;
      } else {
        // Make the drawing rotate around the rotation center.
        this._graphics.pivot.x = this._object.getRotationCenterX();
        // Multiply by the scale to have the scale anchor
        // at the object position instead of the center.
        this._graphics.position.x =
          this._object.x +
          this._graphics.pivot.x * Math.abs(this._graphics.scale.x);
      }
      this._transformationIsUpToDate = false;
    }

    updatePositionY(): void {
      if (this._object._useAbsoluteCoordinates) {
        this._graphics.pivot.y = 0;
        this._graphics.position.y = 0;
      } else {
        this._graphics.pivot.y = this._object.getRotationCenterY();
        this._graphics.position.y =
          this._object.y +
          this._graphics.pivot.y * Math.abs(this._graphics.scale.y);
      }
      this._transformationIsUpToDate = false;
    }

    updatePositionIfNeeded() {
      if (!this._positionXIsUpToDate) {
        this.updatePositionX();
        this._positionXIsUpToDate = true;
      }
      if (!this._positionYIsUpToDate) {
        this.updatePositionY();
        this._positionYIsUpToDate = true;
      }
    }

    updateTransformationIfNeeded() {
      if (!this._transformationIsUpToDate) {
        this.updatePositionIfNeeded();
        // TODO PIXI8 Is it still necessary?
        // this._graphics.updateTransform();
      }
      this._transformationIsUpToDate = true;
    }

    updateRotationCenter(): void {
      // The pivot and position depends on the rotation center point.
      this._positionXIsUpToDate = false;
      this._positionYIsUpToDate = false;
      // The whole transformation changes based on the rotation center point.
      this._transformationIsUpToDate = false;
    }

    updateAngle(): void {
      if (this._object._useAbsoluteCoordinates) {
        this._graphics.angle = 0;
      } else {
        this._graphics.angle = this._object.angle;
      }
      this._transformationIsUpToDate = false;
    }

    updateScaleX(): void {
      if (this._object._useAbsoluteCoordinates) {
        this._graphics.scale.x = 1;
      } else {
        this._graphics.scale.x = this._object._scaleX;
      }
      // updatePositionX() uses scale.x
      this._positionXIsUpToDate = false;
      this._transformationIsUpToDate = false;
    }

    updateScaleY(): void {
      if (this._object._useAbsoluteCoordinates) {
        this._graphics.scale.y = 1;
      } else {
        this._graphics.scale.y = this._object._scaleY;
      }
      // updatePositionY() uses scale.y
      this._positionYIsUpToDate = false;
      this._transformationIsUpToDate = false;
    }

    getDrawableX(): float {
      if (this._object._useAbsoluteCoordinates) {
        return this._graphics.getLocalBounds().left;
      }
      let localBound = this._graphics.getLocalBounds().left;
      if (this._object._flippedX) {
        const rotationCenterX = this._object.getRotationCenterX();
        localBound = 2 * rotationCenterX - localBound;
      }
      // When new shape are drawn, the bounds of the object can extend.
      // The object position stays the same but (drawableX; drawableY) can change.
      return (
        this._object.getX() + localBound * Math.abs(this._graphics.scale.x)
      );
    }

    getDrawableY(): float {
      if (this._object._useAbsoluteCoordinates) {
        return this._graphics.getLocalBounds().top;
      }
      let localBound = this._graphics.getLocalBounds().top;
      if (this._object._flippedY) {
        const rotationCenterY = this._object.getRotationCenterY();
        localBound = 2 * rotationCenterY - localBound;
      }
      return (
        this._object.getY() + localBound * Math.abs(this._graphics.scale.y)
      );
    }

    getWidth(): float {
      return this._graphics.width;
    }

    getHeight(): float {
      return this._graphics.height;
    }

    getUnscaledWidth(): float {
      return this._graphics.getLocalBounds().width;
    }

    getUnscaledHeight(): float {
      return this._graphics.getLocalBounds().height;
    }

    /**
     * @returns The drawing origin relatively to the drawable top left corner.
     */
    getFrameRelativeOriginX() {
      return -this._graphics.getLocalBounds().left;
    }

    /**
     * @returns The drawing origin relatively to the drawable top left corner.
     */
    getFrameRelativeOriginY() {
      return -this._graphics.getLocalBounds().top;
    }

    transformToDrawing(point: FloatPoint): FloatPoint {
      this.updateTransformationIfNeeded();
      const position =
        ShapePainterRuntimeObjectPixiRenderer._positionForTransformation;
      position.x = point[0];
      position.y = point[1];
      this._graphics.localTransform.applyInverse(position, position);
      point[0] = position.x;
      point[1] = position.y;
      return point;
    }

    transformToScene(point: FloatPoint): FloatPoint {
      this.updateTransformationIfNeeded();
      const position =
        ShapePainterRuntimeObjectPixiRenderer._positionForTransformation;
      position.x = point[0];
      position.y = point[1];
      this._graphics.localTransform.apply(position, position);
      point[0] = position.x;
      point[1] = position.y;
      return point;
    }

    updateAntialiasing(): void {
      // TODO PIXI8 Find how to do antialiasing with Pixi 8.
      // if (this._object.getAntialiasing() !== 'none') {
      //   if (!this._antialiasingFilter) {
      //     this._antialiasingFilter = new PIXI.FXAAFilter();
      //   }
      //   const antialiasingFilter = this._antialiasingFilter;
      //   antialiasingFilter.enabled = true;
      //   antialiasingFilter.multisample =
      //     PIXI.MSAA_QUALITY[this._object.getAntialiasing().toUpperCase()] ||
      //     PIXI.MSAA_QUALITY.LOW;
      //   if (!this._graphics.filters) {
      //     this._graphics.filters = [];
      //   }
      //   // Do not apply the filter if it is already present on the object.
      //   if (this._graphics.filters.indexOf(antialiasingFilter) === -1) {
      //     this._graphics.filters.push(antialiasingFilter);
      //   }
      // } else if (this._antialiasingFilter !== null) {
      //   if (!this._graphics.filters) {
      //     return;
      //   }
      //   const antialiasingFilterIndex = this._graphics.filters.indexOf(
      //     this._antialiasingFilter
      //   );
      //   if (antialiasingFilterIndex !== -1) {
      //     this._graphics.filters.splice(antialiasingFilterIndex, 1);
      //   }
      // }
    }

    destroy(): void {
      this._graphics.destroy();
    }
  }

  export const ShapePainterRuntimeObjectRenderer =
    ShapePainterRuntimeObjectPixiRenderer;
  export type ShapePainterRuntimeObjectRenderer =
    ShapePainterRuntimeObjectPixiRenderer;
}
