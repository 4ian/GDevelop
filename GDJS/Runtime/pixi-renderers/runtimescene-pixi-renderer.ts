namespace gdjs {
  import PIXI = GlobalPIXIModule.PIXI;

  /**
   * The renderer for a gdjs.RuntimeScene using Pixi.js.
   */
  export class RuntimeScenePixiRenderer {
    _pixiRenderer: PIXI.Renderer | null;
    _runtimeScene: gdjs.RuntimeScene;
    _pixiContainer: PIXI.Container;
    _debugDraw: PIXI.Graphics | null = null;
    _debugDrawContainer: PIXI.Container | null = null;
    _profilerText: PIXI.Text | null = null;
    _showCursorAtNextRender: boolean = false;
    _debugDrawRenderedObjectsPoints: Record<
      number,
      {
        wasRendered: boolean;
        points: Record<string, PIXI.Text>;
      }
    >;

    constructor(
      runtimeScene: gdjs.RuntimeScene,
      runtimeGameRenderer: gdjs.RuntimeGamePixiRenderer | null
    ) {
      this._pixiRenderer = runtimeGameRenderer
        ? runtimeGameRenderer.getPIXIRenderer()
        : null;
      this._runtimeScene = runtimeScene;
      this._pixiContainer = new PIXI.Container();
      this._debugDrawRenderedObjectsPoints = {};

      // Contains the layers of the scene (and, optionally, debug PIXI objects).
      this._pixiContainer.sortableChildren = true;
      this._debugDraw = null;
    }

    onGameResolutionResized() {
      if (!this._pixiRenderer) {
        return;
      }
      const runtimeGame = this._runtimeScene.getGame();
      this._pixiContainer.scale.x =
        this._pixiRenderer.width / runtimeGame.getGameResolutionWidth();
      this._pixiContainer.scale.y =
        this._pixiRenderer.height / runtimeGame.getGameResolutionHeight();
    }

    // Nothing to do.
    onSceneUnloaded() {}

    render() {
      if (!this._pixiRenderer) {
        return;
      }

      // this._renderProfileText(); //Uncomment to display profiling times

      // render the PIXI container of the scene
      this._pixiRenderer.backgroundColor = this._runtimeScene.getBackgroundColor();
      this._pixiRenderer.render(this._pixiContainer);

      // synchronize showing the cursor with rendering (useful to reduce
      // blinking while switching from in-game cursor)
      if (this._showCursorAtNextRender) {
        this._pixiRenderer.view.style.cursor = '';
        this._showCursorAtNextRender = false;
      }
    }

    _renderProfileText() {
      const profiler = this._runtimeScene.getProfiler();
      if (!profiler) {
        return;
      }
      if (!this._profilerText) {
        this._profilerText = new PIXI.Text(' ', {
          align: 'left',
          stroke: '#FFF',
          strokeThickness: 1,
        });

        // Add on top of all layers:
        this._pixiContainer.addChild(this._profilerText);
      }
      const average = profiler.getFramesAverageMeasures();
      const outputs = [];
      gdjs.Profiler.getProfilerSectionTexts('All', average, outputs);
      this._profilerText.text = outputs.join('\n');
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
        const layer = this._runtimeScene.getLayer(object.getLayer());

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
        const layer = this._runtimeScene.getLayer(object.getLayer());

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

    hideCursor(): void {
      this._showCursorAtNextRender = false;
      if (!this._pixiRenderer) {
        return;
      }
      this._pixiRenderer.view.style.cursor = 'none';
    }

    showCursor(): void {
      this._showCursorAtNextRender = true;
    }

    getPIXIContainer() {
      return this._pixiContainer;
    }

    getPIXIRenderer() {
      return this._pixiRenderer;
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
  export type RuntimeSceneRenderer = gdjs.RuntimeScenePixiRenderer;
  export const RuntimeSceneRenderer = gdjs.RuntimeScenePixiRenderer;
}
