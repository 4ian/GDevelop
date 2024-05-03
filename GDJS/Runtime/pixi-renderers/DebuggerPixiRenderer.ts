namespace gdjs {
  /**
   * A renderer for debug instances location of a container using Pixi.js.
   *
   * @see gdjs.CustomRuntimeObject2DPixiRenderer
   */
  export class DebuggerPixiRenderer {
    _instanceContainer: gdjs.RuntimeInstanceContainer;
    _debugDraw: PIXI.Graphics | null = null;
    _debugDrawContainer: PIXI.Container | null = null;
    _debugDrawRenderedObjectsPoints: Record<
      number,
      {
        wasRendered: boolean;
        points: Record<string, PIXI.Text>;
      }
    >;

    constructor(instanceContainer: gdjs.RuntimeInstanceContainer) {
      this._instanceContainer = instanceContainer;
      this._debugDrawRenderedObjectsPoints = {};
      this._debugDraw = null;
    }

    getRendererObject() {
      return this._debugDrawContainer;
    }

    /**
     * Render graphics for debugging purpose. Activate this in `gdjs.RuntimeScene`,
     * in the `renderAndStep` method.
     * @see gdjs.RuntimeInstanceContainer#enableDebugDraw
     */
    renderDebugDraw(
      instances: gdjs.RuntimeObject[],
      showHiddenInstances: boolean,
      showPointsNames: boolean,
      showCustomPoints: boolean
    ) {
      const pixiContainer = this._instanceContainer
        .getRenderer()
        .getRendererObject();
      if (!this._debugDraw || !this._debugDrawContainer) {
        this._debugDrawContainer = new PIXI.Container();
        this._debugDraw = new PIXI.Graphics();

        // Add on top of all layers:
        this._debugDrawContainer.addChild(this._debugDraw);
        if (pixiContainer) {
          pixiContainer.addChild(this._debugDrawContainer);
        }
      }
      const debugDraw = this._debugDraw;

      // Reset the boolean "wasRendered" of all points of objects to false:
      for (let id in this._debugDrawRenderedObjectsPoints) {
        this._debugDrawRenderedObjectsPoints[id].wasRendered = false;
      }

      const renderObjectPoint = (
        points: Record<string, PIXI.Text>,
        name: string,
        fillColor: integer,
        x: float,
        y: float
      ) => {
        debugDraw.line.color = fillColor;
        debugDraw.fill.color = fillColor;
        debugDraw.drawCircle(x, y, 3);

        if (showPointsNames) {
          if (!points[name]) {
            points[name] = new PIXI.Text(name, {
              fill: fillColor,
              fontSize: 12,
            });

            this._debugDrawContainer!.addChild(points[name]);
          }

          points[name].position.set(x, y);
        }
      };

      debugDraw.clear();
      debugDraw.beginFill();
      debugDraw.alpha = 0.8;
      debugDraw.lineStyle(2, 0x0000ff, 1);

      // Draw AABB
      const workingPoint: FloatPoint = [0, 0];
      for (let i = 0; i < instances.length; i++) {
        const object = instances[i];
        const layer = this._instanceContainer.getLayer(object.getLayer());

        if (
          (!object.isVisible() || !layer.isVisible()) &&
          !showHiddenInstances
        ) {
          continue;
        }

        const rendererObject = object.getRendererObject();
        if (!rendererObject) {
          continue;
        }
        const aabb = object.getAABB();
        debugDraw.fill.alpha = 0.2;
        debugDraw.line.color = 0x778ee8;
        debugDraw.fill.color = 0x778ee8;

        const polygon: float[] = [];
        polygon.push.apply(
          polygon,
          layer.applyLayerTransformation(
            aabb.min[0],
            aabb.min[1],
            0,
            workingPoint
          )
        );
        polygon.push.apply(
          polygon,
          layer.applyLayerTransformation(
            aabb.max[0],
            aabb.min[1],
            0,
            workingPoint
          )
        );
        polygon.push.apply(
          polygon,
          layer.applyLayerTransformation(
            aabb.max[0],
            aabb.max[1],
            0,
            workingPoint
          )
        );
        polygon.push.apply(
          polygon,
          layer.applyLayerTransformation(
            aabb.min[0],
            aabb.max[1],
            0,
            workingPoint
          )
        );

        debugDraw.drawPolygon(polygon);
      }

      // Draw hitboxes and points
      for (let i = 0; i < instances.length; i++) {
        const object = instances[i];
        const layer = this._instanceContainer.getLayer(object.getLayer());

        if (
          (!object.isVisible() || !layer.isVisible()) &&
          !showHiddenInstances
        ) {
          continue;
        }

        const rendererObject = object.getRendererObject();
        if (!rendererObject) {
          continue;
        }

        // Create the structure to store the points in memory
        const id = object.id;
        if (!this._debugDrawRenderedObjectsPoints[id]) {
          this._debugDrawRenderedObjectsPoints[id] = {
            wasRendered: true,
            points: {},
          };
        }
        const renderedObjectPoints = this._debugDrawRenderedObjectsPoints[id];
        renderedObjectPoints.wasRendered = true;

        // Draw hitboxes (sub-optimal performance)
        const hitboxes = object.getHitBoxes();
        for (let j = 0; j < hitboxes.length; j++) {
          // Note that this conversion is sub-optimal, but we don't care
          // as this is for debug draw.
          const polygon: float[] = [];
          hitboxes[j].vertices.forEach((point) => {
            point = layer.applyLayerTransformation(
              point[0],
              point[1],
              0,
              workingPoint
            );

            polygon.push(point[0]);
            polygon.push(point[1]);
          });
          debugDraw.fill.alpha = 0;
          debugDraw.line.alpha = 0.5;
          debugDraw.line.color = 0xff0000;
          debugDraw.drawPolygon(polygon);
        }

        // Draw points
        debugDraw.fill.alpha = 0.3;

        // Draw Center point
        const centerPoint = layer.applyLayerTransformation(
          object.getCenterXInScene(),
          object.getCenterYInScene(),
          0,
          workingPoint
        );

        renderObjectPoint(
          renderedObjectPoints.points,
          'Center',
          0xffff00,
          centerPoint[0],
          centerPoint[1]
        );

        // Draw position point
        const positionPoint = layer.applyLayerTransformation(
          object.getX(),
          object.getY(),
          0,
          workingPoint
        );

        renderObjectPoint(
          renderedObjectPoints.points,
          'Position',
          0xff0000,
          positionPoint[0],
          positionPoint[1]
        );

        // Draw Origin point
        if (object instanceof gdjs.SpriteRuntimeObject) {
          let originPoint = object.getPointPosition('origin');
          // When there is neither rotation nor flipping,
          // the origin point is over the position point.
          if (
            Math.abs(originPoint[0] - positionPoint[0]) >= 1 ||
            Math.abs(originPoint[1] - positionPoint[1]) >= 1
          ) {
            originPoint = layer.applyLayerTransformation(
              originPoint[0],
              originPoint[1],
              0,
              workingPoint
            );

            renderObjectPoint(
              renderedObjectPoints.points,
              'Origin',
              0xff0000,
              originPoint[0],
              originPoint[1]
            );
          }
        }

        // Draw custom point
        if (showCustomPoints && object instanceof gdjs.SpriteRuntimeObject) {
          const animationFrame = object._animator.getCurrentFrame();
          if (!animationFrame) continue;

          for (const customPointName in animationFrame.points.items) {
            let customPoint = object.getPointPosition(customPointName);

            customPoint = layer.applyLayerTransformation(
              customPoint[0],
              customPoint[1],
              0,
              workingPoint
            );

            renderObjectPoint(
              renderedObjectPoints.points,
              customPointName,
              0x0000ff,
              customPoint[0],
              customPoint[1]
            );
          }
        }
      }

      // Clean any point text from an object that is not rendered.
      for (const objectID in this._debugDrawRenderedObjectsPoints) {
        const renderedObjectPoints = this._debugDrawRenderedObjectsPoints[
          objectID
        ];
        if (renderedObjectPoints.wasRendered) continue;

        const points = renderedObjectPoints.points;
        for (const name in points) {
          this._debugDrawContainer.removeChild(points[name]);
        }
      }

      debugDraw.endFill();
    }

    clearDebugDraw(): void {
      if (this._debugDraw) {
        this._debugDraw.clear();
      }

      if (this._debugDrawContainer) {
        this._debugDrawContainer.destroy({
          children: true,
        });
        const pixiContainer: PIXI.Container | null = this._instanceContainer
          .getRenderer()
          .getRendererObject();
        if (pixiContainer) {
          pixiContainer.removeChild(this._debugDrawContainer);
        }
      }
      this._debugDraw = null;
      this._debugDrawContainer = null;
      this._debugDrawRenderedObjectsPoints = {};
    }
  }

  // Register the class to let the engine use it.
  export type DebuggerRenderer = gdjs.DebuggerPixiRenderer;
  export const DebuggerRenderer = gdjs.DebuggerPixiRenderer;
}
