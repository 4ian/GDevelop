namespace gdjs {
  /**
   * The renderer for a gdjs.RuntimeScene using Pixi.js.
   * @class RuntimeScenePixiRenderer
   * @memberof gdjs
   */
  export class RuntimeScenePixiRenderer {
    _pixiRenderer: PIXI.Renderer;
    _runtimeScene: gdjs.RuntimeScene;
    _pixiContainer: any;
    _debugDraw: PIXI.Graphics | null = null;
    _profilerText: PIXI.Text | null = null;

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

    renderDebugDraw(instances: gdjs.RuntimeObject[], layersCameraCoordinates) {
      if (!this._debugDraw) {
        this._debugDraw = new PIXI.Graphics();

        // Add on top of all layers:
        this._pixiContainer.addChild(this._debugDraw);
      }

      /** @type PIXI.Graphics */
      const debugDraw: PIXI.Graphics = this._debugDraw;
      debugDraw.clear();
      debugDraw.beginFill(6842600);
      debugDraw.lineStyle(1, 6842600, 1);
      debugDraw.fill.alpha = 0.1;
      debugDraw.alpha = 0.8;
      for (let i = 0; i < instances.length; i++) {
        const object = instances[i];
        const cameraCoords = layersCameraCoordinates[object.getLayer()];
        const rendererObject = object.getRendererObject();
        if (!cameraCoords || !rendererObject) {
          continue;
        }
        const aabb = object.getAABB();
        debugDraw.drawRect(
          aabb.min[0],
          aabb.min[1],
          aabb.max[0] - aabb.min[0],
          aabb.max[1] - aabb.min[1]
        );
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
  export const RuntimeSceneRenderer = gdjs.RuntimeScenePixiRenderer;
}
