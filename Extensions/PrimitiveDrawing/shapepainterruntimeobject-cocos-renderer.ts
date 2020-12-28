namespace gdjs {
  class ShapePainterRuntimeObjectCocosRenderer {
    _object: any;
    _drawNode: any;
    _convertYPosition: any;

    constructor(runtimeObject, runtimeScene) {
      this._object = runtimeObject;
      this._drawNode = new cc.DrawNode();
      const renderer = runtimeScene.getLayer('').getRenderer();
      renderer.addRendererObject(this._drawNode, runtimeObject.getZOrder());
      this._convertYPosition = renderer.convertYPosition;
    }

    getRendererObject() {
      return this._drawNode;
    }

    clear() {
      this._drawNode.clear();
      this.updateOutline();
    }

    drawRectangle(x1, y1, x2, y2) {
      this._drawNode.drawRect(
        cc.p(x1, -y1),
        cc.p(x2, -y2),
        gdjs.CocosTools.hexToCCColor(
          this._object._fillColor,
          this._object._fillOpacity
        ),
        this._object._outlineSize,
        gdjs.CocosTools.hexToCCColor(
          this._object._outlineColor,
          this._object._outlineOpacity
        )
      );
    }

    drawCircle(x, y, radius) {
      if (this._object._outlineSize > 0) {
        this._drawNode.drawDot(
          cc.p(x, -y),
          radius,
          gdjs.CocosTools.hexToCCColor(
            this._object._outlineColor,
            this._object._outlineOpacity
          )
        );
      }
      this._drawNode.drawDot(
        cc.p(x, -y),
        radius - this._object._outlineSize,
        gdjs.CocosTools.hexToCCColor(
          this._object._fillColor,
          this._object._fillOpacity
        )
      );
    }

    drawLine(x1, y1, x2, y2, thickness) {
      if (y2 === y1) {
        this._drawNode.drawRect(
          cc.p(x1, -(y1 - thickness / 2)),
          cc.p(x2, -(y2 + thickness / 2)),
          gdjs.CocosTools.hexToCCColor(
            this._object._fillColor,
            this._object._fillOpacity
          ),
          this._object._outlineSize,
          gdjs.CocosTools.hexToCCColor(
            this._object._outlineColor,
            this._object._outlineOpacity
          )
        );
      } else {
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const xIncrement = Math.sin(angle) * thickness;
        const yIncrement = Math.cos(angle) * thickness;
        this._drawNode.drawPoly(
          [
            cc.p(x1 + xIncrement, -(y1 - yIncrement)),
            cc.p(x1 - xIncrement, -(y1 + yIncrement)),
            cc.p(x2 - xIncrement, -(y2 + yIncrement)),
            cc.p(x2 + xIncrement, -(y2 - yIncrement)),
          ],
          gdjs.CocosTools.hexToCCColor(
            this._object._fillColor,
            this._object._fillOpacity
          ),
          this._object._outlineSize,
          gdjs.CocosTools.hexToCCColor(
            this._object._outlineColor,
            this._object._outlineOpacity
          )
        );
      }
    }

    updateOutline(): void {
      this._drawNode.setLineWidth(this._object._outlineSize);
    }

    updateXPosition(): void {
      this._drawNode.setPositionX(
        this._object._absoluteCoordinates ? 0 : this._object.x
      );
    }

    updateYPosition(): void {
      this._drawNode.setPositionY(
        this._convertYPosition(
          this._object._absoluteCoordinates ? 0 : this._object.y
        )
      );
    }
  }
  // @ts-ignore - Register the class to let the engine use it.
  gdjs.ShapePainterRuntimeObjectRenderer = ShapePainterRuntimeObjectCocosRenderer;
}
