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
    _renderedObjectsPoints: Array<{
      wasRendered: boolean;
      points: { x: float; y: float };
    }>;

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
      this._renderedObjectsPoints = [];

      // Contains the layers of the scene (and, optionally, debug PIXI objects).
      this._pixiContainer.sortableChildren = true;
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
      viewInsivibleInstance: boolean,
      viewCustomPoints: boolean,
      viewPointsNames: boolean
    ) {
      if (!this._debugDraw) {
        this._debugDraw = new PIXI.Graphics();

        // Add on top of all layers:
        this._pixiContainer.addChild(this._debugDraw);
      }

      // Activate here what you want to be displayed:
      const displayAABB = true;
      const displayHitboxesAndSomePoints = true;
      const debugDraw: PIXI.Graphics = this._debugDraw;

      // Reset the boolean "wasRendered" of all points of objects to false:
      for (var id in this._renderedObjectsPoints) {
        this._renderedObjectsPoints[id].wasRendered = false;
      }

      debugDraw.clear();
      debugDraw.beginFill();
      debugDraw.alpha = 0.8;
      debugDraw.lineStyle(2, 0x0000ff, 1);

      if (displayAABB) {
        for (let i = 0; i < instances.length; i++) {
          const object = instances[i];
          const layer = this._runtimeScene.getLayer(object.getLayer());
          const compensationCameraMovementX =
            layer.getCameraX() - layer.getCameraWidth() / 2;
          const compensationCameraMovementY =
            layer.getCameraY() - layer.getCameraHeight() / 2;

          if (
            (!object.isVisible() || !layer.isVisible()) &&
            !viewInsivibleInstance
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
            aabb.min[0] - compensationCameraMovementX,
            aabb.min[1] - compensationCameraMovementY,
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
          const compensationCameraMovementX =
            layer.getCameraX() - layer.getCameraWidth() / 2;
          const compensationCameraMovementY =
            layer.getCameraY() - layer.getCameraHeight() / 2;

          if (
            (!object.isVisible() || !layer.isVisible()) &&
            !viewInsivibleInstance
          ) {
            continue;
          }
          const cameraCoords = layersCameraCoordinates[object.getLayer()];
          const rendererObject = object.getRendererObject();
          if (!cameraCoords || !rendererObject) {
            continue;
          }

          // Create the structure to store the points in memory
          if (!this._renderedObjectsPoints[id]) {
            this._renderedObjectsPoints[id] = {
              wasRendered: true,
              points: { x: 0, y: 0 },
            };
          }

          const renderedObjectTextPoints = this._renderedObjectsPoints[id];

          // Draw hitboxes (sub-optimal performance)
          const hitboxes = object.getHitBoxes();
          for (let j = 0; j < hitboxes.length; j++) {
            // Note that this conversion is sub-optimal, but we don't care
            // as this is for debug draw.
            const polygon: float[] = [];
            let polyPointX: float = 0;
            let polyPointY: float = 0;
            hitboxes[j].vertices.forEach((point) => {
              if (layer) {
                polyPointX = point[0] - compensationCameraMovementX;
                polyPointY = point[1] - compensationCameraMovementY;
                polygon.push(polyPointX);
                polygon.push(polyPointY);
              }
            });
            debugDraw.fill.alpha = 0;
            debugDraw.line.alpha = 0.5;
            debugDraw.line.color = 0xff0000;
            debugDraw.drawPolygon(polygon);
          }

          // Draw points
          // Center point of the object, with camera movement
          const centerPoint = {
            x:
              object.getDrawableX() +
              object.getCenterX() -
              compensationCameraMovementX,
            y:
              object.getDrawableY() +
              object.getCenterY() -
              compensationCameraMovementY,
          };

          // Draw Center point
          debugDraw.fill.alpha = 0.3;
          debugDraw.line.color = 0xffff00;
          debugDraw.fill.color = 0xffff00;
          debugDraw.drawCircle(centerPoint.x, centerPoint.y, 3);

          if (viewPointsNames) {
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
              centerPoint.x,
              centerPoint.y
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
            object.getDrawableX() - compensationCameraMovementX,
            object.getDrawableY() - compensationCameraMovementY,
          ];
          if (object instanceof gdjs.SpriteRuntimeObject) {
            originPoint = object.getPointPosition('origin');
            originPoint[0] = originPoint[0] - compensationCameraMovementX;
            originPoint[1] = originPoint[1] - compensationCameraMovementY;
          }

          debugDraw.line.color = 0xff0000;
          debugDraw.fill.color = 0xff0000;
          debugDraw.drawCircle(originPoint[0], originPoint[1], 3);

          if (viewPointsNames) {
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
          if (viewCustomPoints) {
            // @ts-ignore '_animationFrame' does not exist on type 'RuntimeObject | SpriteRuntimeObject'.
            if (!object?._animationFrame?.points) continue;
            // @ts-ignore '_animationFrame' does not exist on type 'RuntimeObject | SpriteRuntimeObject'.
            for (const customPointName in object._animationFrame.points[
              'items'
            ]) {
              let customPoint: [float, float];

              if (object instanceof gdjs.SpriteRuntimeObject) {
                customPoint = object.getPointPosition(customPointName);
              } else {
                // There is not custom point for other object than SpriteRuntimeObject
                continue;
              }

              if (viewPointsNames) {
                if (!renderedObjectTextPoints.points[customPointName]) {
                  renderedObjectTextPoints.points[
                    customPointName
                  ] = new PIXI.Text(customPointName, {
                    fill: '#0000ff',
                    fontSize: 12,
                  });
                }

                renderedObjectTextPoints.points[customPointName].position.set(
                  customPoint[0] - compensationCameraMovementX,
                  customPoint[1] - compensationCameraMovementY
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
                customPoint[0] - compensationCameraMovementX,
                customPoint[1] - compensationCameraMovementY,
                3
              );
            }
          }

          // After we've iterated on all objects, maybe some were destroyed. So clean their text points:
          for (var objectID in this._renderedObjectsPoints) {
            const renderedObjectTextPoints = this._renderedObjectsPoints[
              objectID
            ];
            if (!renderedObjectTextPoints.wasRendered) {
              // Clean our point objects
              for (var name in renderedObjectTextPoints.points) {
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
