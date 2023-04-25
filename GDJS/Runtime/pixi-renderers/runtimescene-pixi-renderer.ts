namespace gdjs {
  import PIXI = GlobalPIXIModule.PIXI;

  /**
   * The renderer for a gdjs.RuntimeScene using Pixi.js.
   */
  export class RuntimeScenePixiRenderer
    implements gdjs.RuntimeInstanceContainerPixiRenderer {
    private _runtimeGameRenderer: gdjs.RuntimeGamePixiRenderer | null;
    _runtimeScene: gdjs.RuntimeScene;
    _pixiContainer: PIXI.Container;
    _profilerText: PIXI.Text | null = null;
    _showCursorAtNextRender: boolean = false;

    _threeRenderer: THREE.WebGLRenderer | null = null;
    _threeScene: THREE.Scene | null = null;
    _threeDummyCamera: THREE.Camera | null = null;

    constructor(
      runtimeScene: gdjs.RuntimeScene,
      runtimeGameRenderer: gdjs.RuntimeGamePixiRenderer | null
    ) {
      this._runtimeGameRenderer = runtimeGameRenderer;
      this._runtimeScene = runtimeScene;
      this._pixiContainer = new PIXI.Container();

      // Contains the layers of the scene (and, optionally, debug PIXI objects).
      this._pixiContainer.sortableChildren = true;

      this._setupThreeScene();
    }

    _setupThreeScene() {
      this._threeRenderer = this._runtimeScene
        .getGame()
        .getRenderer()
        .getThreeRenderer();
      if (this._threeRenderer) {
        this._threeRenderer.autoClear = false;
        if (!this._threeScene) this._threeScene = new THREE.Scene();

        // Use a mirroring on the Y axis to follow the same axis as in the 2D, PixiJS, rendering.
        // We use a mirroring rather than a camera rotation so that the Z order is not changed.
        this._threeScene.scale.y = -1;

        if (!this._threeDummyCamera)
          this._threeDummyCamera = new THREE.PerspectiveCamera(
            45,
            1,
            0.1,
            5000
          );
      }
    }

    onGameResolutionResized() {
      const pixiRenderer = this._runtimeGameRenderer
        ? this._runtimeGameRenderer.getPIXIRenderer()
        : null;
      if (!pixiRenderer) {
        return;
      }
      const runtimeGame = this._runtimeScene.getGame();

      // TODO (3D): should this be done for each individual layer?
      // Especially if we remove _pixiContainer entirely.
      this._pixiContainer.scale.x =
        pixiRenderer.width / runtimeGame.getGameResolutionWidth();
      this._pixiContainer.scale.y =
        pixiRenderer.height / runtimeGame.getGameResolutionHeight();

      for (const runtimeLayer of this._runtimeScene._orderedLayers) {
        runtimeLayer.getRenderer().onGameResolutionResized();
      }
    }

    onSceneUnloaded() {
      // TODO (3D): call the method with the same name on RuntimeLayers so they can dispose?
    }

    render() {
      const runtimeGameRenderer = this._runtimeGameRenderer;
      if (!runtimeGameRenderer) return;

      const pixiRenderer = runtimeGameRenderer.getPIXIRenderer();
      if (!pixiRenderer) return;

      const threeRenderer = this._threeRenderer;
      const threeScene = this._threeScene;
      const threeDummyCamera = this._threeDummyCamera;

      if (threeRenderer && threeScene && threeDummyCamera) {
        // Layered 2D+3D rendering.
        // TODO (3D) - optimization: avoid separate rendering for each layer.
        // Each layer needs a separate PixiJS render. If no 3D objects are present,
        // this could probably be simplified: "collapse" the renders without `clear`-ing in between.
        // So that if no 3D objects at all, this would be as efficient as the 2D only rendering.
        // If done, visibility of layers and lighting layers must be properly handled.

        threeRenderer.info.autoReset = false;
        threeRenderer.info.reset();

        // Render the background color.
        threeScene.background = new THREE.Color(
          this._runtimeScene.getBackgroundColor()
        );
        threeRenderer.clear();
        threeRenderer.render(threeScene, threeDummyCamera);
        pixiRenderer.clearBeforeRender = false;

        // Render each layer
        for (let i = 0; i < this._runtimeScene._orderedLayers.length; ++i) {
          const runtimeLayer = this._runtimeScene._orderedLayers[i];
          if (runtimeLayer.isLightingLayer()) continue;

          const runtimeLayerRenderer = runtimeLayer.getRenderer();
          const pixiContainer = runtimeLayerRenderer.getRendererObject();
          const threeGroup = runtimeLayerRenderer.getThreeGroup();
          const threeCamera = runtimeLayerRenderer.getThreeCamera();

          // Render the 2D objects of this layer, which will be displayed on a plane
          // (see `threePixiCanvasTexture`).
          pixiRenderer.clear();
          pixiRenderer.render(pixiContainer);

          // Also render the next layer if it's the lighting layer.
          const nextRuntimeLayer: gdjs.RuntimeLayer | undefined = this
            ._runtimeScene._orderedLayers[i + 1];
          if (nextRuntimeLayer && nextRuntimeLayer.isLightingLayer()) {
            const pixiSprite = nextRuntimeLayer
              .getRenderer()
              .getLightingSprite();
            if (pixiSprite) {
              pixiRenderer.render(pixiSprite);
            }
          }

          // Render the 3D objects of this layer.
          if (threeGroup && threeCamera) {
            // The plane showing the PixiJS rendering must be updated, so that the 2D rendering
            // made by PixiJS can be shown in the 3D world.
            const threePixiCanvasTexture = runtimeLayerRenderer.getThreePixiCanvasTexture();
            if (threePixiCanvasTexture)
              threePixiCanvasTexture.needsUpdate = true;

            // Clear the depth as each layer is independent and display on top of the previous one,
            // even 3D objects.
            threeRenderer.clearDepth();
            threeRenderer.render(threeGroup, threeCamera);
          }
        }

        // Uncomment to display some debug metrics from Three.js.
        // console.log(threeRenderer.info);
      } else {
        // 2D only rendering.
        // render the PIXI container of the scene
        // TODO: replace by a loop like in 3D.

        // this._renderProfileText(); //Uncomment to display profiling times

        pixiRenderer.backgroundColor = this._runtimeScene.getBackgroundColor();
        pixiRenderer.render(this._pixiContainer);
      }

      // synchronize showing the cursor with rendering (useful to reduce
      // blinking while switching from in-game cursor)
      if (this._showCursorAtNextRender) {
        const canvas = runtimeGameRenderer.getCanvas();
        if (canvas) canvas.style.cursor = '';
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

    hideCursor(): void {
      this._showCursorAtNextRender = false;

      const canvas = this._runtimeGameRenderer
        ? this._runtimeGameRenderer.getCanvas()
        : null;
      if (canvas) canvas.style.cursor = 'none';
    }

    showCursor(): void {
      this._showCursorAtNextRender = true;
    }

    getPIXIContainer() {
      return this._pixiContainer;
    }

    getRendererObject() {
      return this._pixiContainer;
    }

    get3dRendererObject() {
      return this._threeScene!;
    }

    /** @deprecated use `runtimeGame.getRenderer().getPIXIRenderer()` instead */
    getPIXIRenderer() {
      return this._runtimeGameRenderer
        ? this._runtimeGameRenderer.getPIXIRenderer()
        : null;
    }

    setLayerIndex(layer: gdjs.RuntimeLayer, index: float): void {
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

  // Register the class to let the engine use it.
  export type RuntimeSceneRenderer = gdjs.RuntimeScenePixiRenderer;
  export const RuntimeSceneRenderer = gdjs.RuntimeScenePixiRenderer;
}
