namespace gdjs {
  /**
   * The renderer for a gdjs.RuntimeScene using Pixi.js.
   */
  export class RuntimeScenePixiRenderer {
    _pixiRenderer: PIXI.Renderer | null;
    _runtimeScene: gdjs.RuntimeScene;
    _pixiContainer: PIXI.Container;
    _debugDraw: PIXI.Graphics | null = null;
    _profilerText: PIXI.Text | null = null;

    constructor(
      runtimeScene: gdjs.RuntimeScene,
      runtimeGameRenderer: gdjs.RuntimeGamePixiRenderer | null
    ) {
      this._pixiRenderer = runtimeGameRenderer
        ? runtimeGameRenderer.getPIXIRenderer()
        : null;
      this._runtimeScene = runtimeScene;
      this._pixiContainer = new PIXI.Container();

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
      layersCameraCoordinates: Record<string, [float, float, float, float]>
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
      debugDraw.clear();
      debugDraw.beginFill();
      debugDraw.alpha = 0.8;
      debugDraw.lineStyle(2, 0x0000ff, 1);

      if (displayAABB) {
        for (let i = 0; i < instances.length; i++) {
          const object = instances[i];
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
            aabb.min[0],
            aabb.min[1],
            aabb.max[0] - aabb.min[0],
            aabb.max[1] - aabb.min[1]
          );
        }
      }

      if (displayHitboxesAndSomePoints) {
        for (let i = 0; i < instances.length; i++) {
          const object = instances[i];
          const cameraCoords = layersCameraCoordinates[object.getLayer()];
          const rendererObject = object.getRendererObject();
          if (!cameraCoords || !rendererObject) {
            continue;
          }

          // Draw hitboxes (sub-optimal performance)
          const hitboxes = object.getHitBoxes();
          for (let j = 0; j < hitboxes.length; j++) {
            // Note that this conversion is sub-optimal, but we don't care
            // as this is for debug draw.
            const polygon: float[] = [];
            hitboxes[j].vertices.forEach((point) => {
              polygon.push(point[0]);
              polygon.push(point[1]);
            });
            debugDraw.fill.alpha = 0;
            debugDraw.line.color = 0xe86868;
            debugDraw.drawPolygon(polygon);
          }

          // Draw circle point
          debugDraw.fill.alpha = 0.8;
          debugDraw.line.color = 0x68e868;
          debugDraw.fill.color = 0x68e868;
          debugDraw.drawCircle(object.getDrawableX(), object.getDrawableY(), 3);

          // Draw center point
          debugDraw.fill.alpha = 0.8;
          debugDraw.line.color = 0xe8e868;
          debugDraw.fill.color = 0xe8e868;
          debugDraw.drawCircle(
            object.getDrawableX() + object.getCenterX(),
            object.getDrawableY() + object.getCenterY(),
            3
          );
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
