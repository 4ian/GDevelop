namespace gdjs {
  import PIXI = GlobalPIXIModule.PIXI;

  /**
   * The renderer for a gdjs.RuntimeScene using Pixi.js.
   */
  export class CustomObjectPixiRenderer {
    _object: gdjs.CustomRuntimeObject;
    _instancesContainer: gdjs.CustomRuntimeObjectInstancesContainer;
    _pixiContainer: PIXI.Container;
    _isContainerDirty: boolean = true;
    _debugDraw: PIXI.Graphics | null = null;
    _debugDrawContainer: PIXI.Container | null = null;
    _debugDrawRenderedObjectsPoints: Record<
      number,
      {
        wasRendered: boolean;
        points: Record<string, PIXI.Text>;
      }
    >;

    constructor(
      object: gdjs.CustomRuntimeObject,
      instancesContainer: gdjs.CustomRuntimeObjectInstancesContainer,
      parent: gdjs.RuntimeInstancesContainer
    ) {
      this._object = object;
      this._instancesContainer = instancesContainer;
      this._pixiContainer = new PIXI.Container();
      // TODO Remove all these name
      this._pixiContainer.name = "Custom " + object.getName();
      this._debugDrawRenderedObjectsPoints = {};

      // Contains the layers of the scene (and, optionally, debug PIXI objects).
      this._pixiContainer.sortableChildren = true;
      this._debugDraw = null;

      const layer = parent.getLayer('');
      if (layer) {
        layer
          .getRenderer()
          .addRendererObject(this._pixiContainer, object.getZOrder());
      }
    }

    reinitialize(
      object: gdjs.CustomRuntimeObject,
      parent: gdjs.RuntimeInstancesContainer
    ) {
      this._object = object;
      this._isContainerDirty = true;
      const layer = parent.getLayer('');
      if (layer) {
        layer.getRenderer().addRendererObject(this._pixiContainer, object.getZOrder());
      }
    }

    getRendererObject() {
      return this._pixiContainer;
    }

    /**
     * Update the internal PIXI.Sprite position, angle...
     */
    _updatePIXIContainer() {
      this._pixiContainer.pivot.x = this._object.getCenterX();
      this._pixiContainer.pivot.y = this._object.getCenterY();
      this._pixiContainer.position.x = this._object.x + this._pixiContainer.pivot.x * Math.abs(this._object._scaleX);
      this._pixiContainer.position.y = this._object.y + this._pixiContainer.pivot.y * Math.abs(this._object._scaleY);
      this._pixiContainer.rotation = gdjs.toRad(this._object.angle);
      this._pixiContainer.scale.x = this._object._scaleX;
      this._pixiContainer.scale.y = this._object._scaleY;
      this._pixiContainer.visible = !this._object.hidden;
      this._pixiContainer.alpha = this._object.opacity / 255;

      this._isContainerDirty = false;
    }

    /**
     * Call this to make sure the sprite is ready to be rendered.
     */
    ensureUpToDate() {
      if (this._isContainerDirty) {
        this._updatePIXIContainer();
      }
    }

    update(): void {
      this._isContainerDirty = true;
    }

    updateX(): void {
      this._pixiContainer.position.x = this._object.x;
    }

    updateY(): void {
      this._pixiContainer.position.y = this._object.y;
    }

    updateAngle(): void {
      this._pixiContainer.rotation = gdjs.toRad(this._object.angle);
    }

    updateOpacity(): void {
      this._pixiContainer.alpha = this._object.opacity / 255;
    }

    updateVisibility(): void {
      this._pixiContainer.visible = !this._object.hidden;
    }

    /**
     * Render graphics for debugging purpose. Activate this in `gdjs.RuntimeScene`,
     * in the `renderAndStep` method.
     */
    renderDebugDraw(
      instances: gdjs.RuntimeObject[],
      showHiddenInstances: boolean,
      showPointsNames: boolean,
      showCustomPoints: boolean
    ) {
      if (!this._debugDraw || !this._debugDrawContainer) {
        this._debugDrawContainer = new PIXI.Container();
        this._debugDraw = new PIXI.Graphics();

        // Add on top of all layers:
        this._debugDrawContainer.addChild(this._debugDraw);
        this._pixiContainer.addChild(this._debugDrawContainer);
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
      for (let i = 0; i < instances.length; i++) {
        const object = instances[i];
        const layer = this._instancesContainer.getLayer(object.getLayer());

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
          layer.convertInverseCoords(aabb.min[0], aabb.min[1])
        );
        polygon.push.apply(
          polygon,
          layer.convertInverseCoords(aabb.max[0], aabb.min[1])
        );
        polygon.push.apply(
          polygon,
          layer.convertInverseCoords(aabb.max[0], aabb.max[1])
        );
        polygon.push.apply(
          polygon,
          layer.convertInverseCoords(aabb.min[0], aabb.max[1])
        );

        debugDraw.drawPolygon(polygon);
      }

      // Draw hitboxes and points
      for (let i = 0; i < instances.length; i++) {
        const object = instances[i];
        const layer = this._instancesContainer.getLayer(object.getLayer());

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
            point = layer.convertInverseCoords(point[0], point[1]);

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
        const centerPoint = layer.convertInverseCoords(
          object.getCenterXInScene(),
          object.getCenterYInScene()
        );

        renderObjectPoint(
          renderedObjectPoints.points,
          'Center',
          0xffff00,
          centerPoint[0],
          centerPoint[1]
        );

        // Draw position point
        const positionPoint = layer.convertInverseCoords(
          object.getX(),
          object.getY()
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
            originPoint = layer.convertInverseCoords(
              originPoint[0],
              originPoint[1]
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
          if (!object._animationFrame) continue;

          for (const customPointName in object._animationFrame.points.items) {
            let customPoint = object.getPointPosition(customPointName);

            customPoint = layer.convertInverseCoords(
              customPoint[0],
              customPoint[1]
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
        this._pixiContainer.removeChild(this._debugDrawContainer);
      }
      this._debugDraw = null;
      this._debugDrawContainer = null;
      this._debugDrawRenderedObjectsPoints = {};
    }

    getPIXIContainer() {
      return this._pixiContainer;
    }

    getPIXIRenderer() {
      return null;
    }

    setLayerIndex(layer: gdjs.Layer, index: float): void {
      const layerPixiRenderer: gdjs.LayerPixiRenderer = layer.getRenderer();
      let layerPixiObject:
        | PIXI.Container
        | PIXI.Sprite
        | null = layerPixiRenderer.getRendererObject();
      if (layer.isLightingLayer()) {
        layerPixiObject = layerPixiRenderer.getLightingSprite();
      }
      if (!layerPixiObject) {
        return;
      }
      if (this._pixiContainer.children.indexOf(layerPixiObject) === index) {
        return;
      }
      this._pixiContainer.removeChild(layerPixiObject);
      this._pixiContainer.addChildAt(layerPixiObject, index);
    }
  }

  //Register the class to let the engine use it.
  export type CustomObjectRenderer = gdjs.CustomObjectPixiRenderer;
  export const CustomObjectRenderer = gdjs.CustomObjectPixiRenderer;
}
