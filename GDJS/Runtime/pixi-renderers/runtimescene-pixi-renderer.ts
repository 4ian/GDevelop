namespace gdjs {
  /**
   * The renderer for a gdjs.RuntimeScene using Pixi.js.
   */
  export class RuntimeScenePixiRenderer {
    _pixiRenderer: PIXI.Renderer;
    _runtimeScene: gdjs.RuntimeScene;
    _pixiContainer: any;
    _debugDraw: PIXI.Graphics | null = null;
    _profilerText: PIXI.Text | null = null;
    _debugDrawRenderedObjectsPoints: Record<
      number,
      {
        wasRendered: boolean;
        points: Record<string, PIXI.Text>;
      }
    >;

    constructor(
      runtimeScene: gdjs.RuntimeScene,
      runtimeGameRenderer: gdjs.RuntimeGamePixiRenderer
    ) {
      // @ts-expect-error ts-migrate(2322) FIXME: Type 'Renderer | null' is not assignable to type '... Remove this comment to see the full error message
      this._pixiRenderer = runtimeGameRenderer
        ? runtimeGameRenderer.getPIXIRenderer()
        : null;
      this._runtimeScene = runtimeScene;
      this._pixiContainer = new PIXI.Container();
      this._debugDrawRenderedObjectsPoints = {};

      // Contains the layers of the scene (and, optionally, debug PIXI objects).
      this._pixiContainer.sortableChildren = true;
      this._debugDraw = new PIXI.Graphics();
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

    onSceneUnloaded() {}

    // Nothing to do.
    render() {
      if (!this._pixiRenderer) {
        return;
      }

      // this._renderProfileText(); //Uncomment to display profiling times

      // render the PIXI container of the scene
      this._pixiRenderer.backgroundColor = this._runtimeScene.getBackgroundColor();
      this._pixiRenderer.render(this._pixiContainer);
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
      layersCameraCoordinates: Record<string, [float, float, float, float]>,
      showHiddenInstances: boolean,
      showPointsNames: boolean,
      showCustomPoints: boolean
    ) {
      if (!this._debugDraw) this._debugDraw = new PIXI.Graphics();

      // Add on top of all layers:
      this._pixiContainer.addChild(this._debugDraw);

      // Activate here what you want to be displayed:
      const displayAABB = true;
      const displayHitboxesAndSomePoints = true;
      const debugDraw = this._debugDraw;

      // Reset the boolean "wasRendered" of all points of objects to false:
      for (let id in this._debugDrawRenderedObjectsPoints) {
        this._debugDrawRenderedObjectsPoints[id].wasRendered = false;
      }

      debugDraw.clear();
      debugDraw.beginFill();
      debugDraw.alpha = 0.8;
      debugDraw.lineStyle(2, 0x0000ff, 1);

      if (displayAABB) {
        for (let i = 0; i < instances.length; i++) {
          const object = instances[i];
          const layer = this._runtimeScene.getLayer(object.getLayer());
          const cameraTopLeftX =
            layer.getCameraX() - layer.getCameraWidth() / 2;
          const cameraTopLeftY =
            layer.getCameraY() - layer.getCameraHeight() / 2;

          if (
            (!object.isVisible() || !layer.isVisible()) &&
            !showHiddenInstances
          ) {
            continue;
          }
          const cameraCoords = layersCameraCoordinates[object.getLayer()];
          const rendererObject = object.getRendererObject();
          if (!cameraCoords || !rendererObject) {
            continue;
          }
          const aabb = object.getAABB();
          debugDraw.fill.alpha = 0.2;
          debugDraw.line.color = 0x778ee8;
          debugDraw.fill.color = 0x778ee8;
          debugDraw.drawRect(
            aabb.min[0] - cameraTopLeftX,
            aabb.min[1] - cameraTopLeftY,
            aabb.max[0] - aabb.min[0],
            aabb.max[1] - aabb.min[1]
          );
        }
      }

      if (displayHitboxesAndSomePoints) {
        for (let i = 0; i < instances.length; i++) {
          const object = instances[i];
          const id = object.id;
          const layer = this._runtimeScene.getLayer(object.getLayer());
          const cameraTopLeftX =
            layer.getCameraX() - layer.getCameraWidth() / 2;
          const cameraTopLeftY =
            layer.getCameraY() - layer.getCameraHeight() / 2;

          if (
            (!object.isVisible() || !layer.isVisible()) &&
            !showHiddenInstances
          ) {
            continue;
          }
          const cameraCoords = layersCameraCoordinates[object.getLayer()];
          const rendererObject = object.getRendererObject();
          if (!cameraCoords || !rendererObject) {
            continue;
          }

          // Create the structure to store the points in memory
          if (!this._debugDrawRenderedObjectsPoints[id]) {
            this._debugDrawRenderedObjectsPoints[id] = {
              wasRendered: true,
              points: {},
            };
          }

          const renderedObjectTextPoints = this._debugDrawRenderedObjectsPoints[
            id
          ];

          // Draw hitboxes (sub-optimal performance)
          const hitboxes = object.getHitBoxes();
          for (let j = 0; j < hitboxes.length; j++) {
            // Note that this conversion is sub-optimal, but we don't care
            // as this is for debug draw.
            const polygon: float[] = [];
            hitboxes[j].vertices.forEach((point) => {
              if (layer) {
                polygon.push(point[0] - cameraTopLeftX);
                polygon.push(point[1] - cameraTopLeftY);
              }
            });
            debugDraw.fill.alpha = 0;
            debugDraw.line.alpha = 0.5;
            debugDraw.line.color = 0xff0000;
            debugDraw.drawPolygon(polygon);
          }

          // Draw points
          // Center point of the object, with camera movement
          const centerPointX =
            object.getDrawableX() + object.getCenterX() - cameraTopLeftX;
          const centerPointY =
            object.getDrawableY() + object.getCenterY() - cameraTopLeftY;

          // Draw Center point
          debugDraw.fill.alpha = 0.3;
          debugDraw.line.color = 0xffff00;
          debugDraw.fill.color = 0xffff00;
          debugDraw.drawCircle(centerPointX, centerPointY, 3);

          if (showPointsNames) {
            if (!renderedObjectTextPoints.points['center']) {
              renderedObjectTextPoints.points['center'] = new PIXI.Text(
                'Center',
                {
                  fill: '#ffff00',
                  fontSize: 12,
                }
              );
            }

            renderedObjectTextPoints.points['center'].position.set(
              centerPointX,
              centerPointY
            );

            this._pixiContainer.addChild(
              renderedObjectTextPoints.points['center']
            );
          }

          // Draw Origin point
          // Origin point of the object, with camera movement
          // For Sprite objects get the position of the origin point.
          // For others objects that doesn't have origin point the position of the rendered object is used.
          let originPoint = [
            object.getDrawableX() - cameraTopLeftX,
            object.getDrawableY() - cameraTopLeftY,
          ];
          if (object instanceof gdjs.SpriteRuntimeObject) {
            originPoint = object.getPointPosition('origin');
            originPoint[0] = originPoint[0] - cameraTopLeftX;
            originPoint[1] = originPoint[1] - cameraTopLeftY;
          }

          debugDraw.line.color = 0xff0000;
          debugDraw.fill.color = 0xff0000;
          debugDraw.drawCircle(originPoint[0], originPoint[1], 3);

          if (showPointsNames) {
            if (!renderedObjectTextPoints.points['origin']) {
              renderedObjectTextPoints.points['origin'] = new PIXI.Text(
                'Origin',
                {
                  fill: '#ff0000',
                  fontSize: 12,
                }
              );
            }
            renderedObjectTextPoints.points['origin'].position.set(
              originPoint[0],
              originPoint[1]
            );

            // Mark the text points as rendered
            renderedObjectTextPoints.wasRendered = true;
            this._pixiContainer.addChild(
              renderedObjectTextPoints.points['origin']
            );
          }

          // Draw custom point
          if (showCustomPoints && object instanceof gdjs.SpriteRuntimeObject) {
            if (!object?._animationFrame?.points) continue;
            for (let customPointName in object._animationFrame.points[
              'items'
            ]) {
              let customPoint: [float, float];
              customPoint = object.getPointPosition(customPointName);

              if (showPointsNames) {
                if (!renderedObjectTextPoints.points[customPointName]) {
                  renderedObjectTextPoints.points[
                    customPointName
                  ] = new PIXI.Text(customPointName, {
                    fill: '#0000ff',
                    fontSize: 12,
                  });
                }

                renderedObjectTextPoints.points[customPointName].position.set(
                  customPoint[0] - cameraTopLeftX,
                  customPoint[1] - cameraTopLeftY
                );

                // Mark the text points as rendered
                renderedObjectTextPoints.points[
                  customPointName
                ].wasRendered = true;
                this._pixiContainer.addChild(
                  renderedObjectTextPoints.points[customPointName]
                );
              }

              debugDraw.line.color = 0x0000ff;
              debugDraw.fill.color = 0x0000ff;
              debugDraw.drawCircle(
                customPoint[0] - cameraTopLeftX,
                customPoint[1] - cameraTopLeftY,
                3
              );
            }
          }

          // After we've iterated on all objects, maybe some were destroyed. So clean their text points:
          for (let objectID in this._debugDrawRenderedObjectsPoints) {
            const renderedObjectTextPoints = this
              ._debugDrawRenderedObjectsPoints[objectID];
            if (!renderedObjectTextPoints.wasRendered) {
              // Clean our point objects
              for (let name in renderedObjectTextPoints.points) {
                // Remove from the PIXI container the text point.
                this._pixiContainer.removeChild(
                  renderedObjectTextPoints.points[name]
                );
              }
            }
          }
        }
      }

      debugDraw.endFill();
    }

    clearDebugDraw(): void {
      if (this._debugDraw) {
        this._debugDraw.clear();
      }

      if (this._debugDrawRenderedObjectsPoints) {
        // After we've iterated on all objects, maybe some were destroyed. So clean their text points:
        for (let objectID in this._debugDrawRenderedObjectsPoints) {
          const renderedObjectTextPoints = this._debugDrawRenderedObjectsPoints[
            objectID
          ];
          // Clean our point objects
          for (let name in renderedObjectTextPoints.points) {
            // Remove from the PIXI container the text point.
            this._pixiContainer.removeChild(
              renderedObjectTextPoints.points[name]
            );
          }
        }
      }
    }

    hideCursor(): void {
      if (!this._pixiRenderer) {
        return;
      }
      this._pixiRenderer.view.style.cursor = 'none';
    }

    showCursor(): void {
      if (!this._pixiRenderer) {
        return;
      }
      this._pixiRenderer.view.style.cursor = '';
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
