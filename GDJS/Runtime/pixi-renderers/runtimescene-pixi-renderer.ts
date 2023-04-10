namespace gdjs {
  import PIXI = GlobalPIXIModule.PIXI;

  /**
   * The renderer for a gdjs.RuntimeScene using Pixi.js.
   */
  export class RuntimeScenePixiRenderer
    implements gdjs.RuntimeInstanceContainerPixiRenderer {
    _pixiRenderer: PIXI.Renderer | null;
    _runtimeScene: gdjs.RuntimeScene;
    _pixiContainer: PIXI.Container;
    _profilerText: PIXI.Text | null = null;
    _showCursorAtNextRender: boolean = false;

    _threeRenderer: THREE.WebGLRenderer | null = null;
    _threeScene: THREE.Scene | null = null;
    _threeCamera: THREE.Camera | null = null;

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

      this._setupThreeScene();
    }

    _setupThreeScene() {
      this._threeRenderer = this._runtimeScene.getGame().getRenderer()._threeRenderer;
      if (this._threeRenderer) this._threeRenderer.autoClear = false;
      if (!this._threeScene) this._threeScene = new THREE.Scene();

      // Use a mirroring on the Y axis to follow the same axis as in the 2D, PixiJS, rendering.
      // We use a mirroring rather than a camera rotation so that the Z order is not changed.
      this._threeScene.scale.y = -1; // TODO: move this to layers

      if (!this._threeCamera) this._threeCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 5000);
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

      for(const runtimeLayer of this._runtimeScene._orderedLayers) {
        runtimeLayer.getRenderer().onGameResolutionResized();
      }
    }

    onSceneUnloaded() {
      // TODO: call the method with the same name on RuntimeLayers so they can dispose?
    }

    render() {
      if (!this._pixiRenderer) {
        return;
      }

      // this._renderProfileText(); //Uncomment to display profiling times

      // render the PIXI container of the scene
      // TODO: disable background color if rendering made by three.js
      this._pixiRenderer.backgroundColor = this._runtimeScene.getBackgroundColor();
      this._pixiRenderer.render(this._pixiContainer);

      // TODO: to support multiple layers, start from the first layer and iterate on them.
      // Start from a PIXI render texture.
      // if it's a classic 2d pixi layer, render it (this._pixiRednerer.render(layerContainer)) to a render texture
      // if it's a 3d layer:, render the scene with: 
      // - The existing rendertexture as a plane, behind everything. (do a this._pixiRenderer.render())
      // - The layer pixi objects as a plane (do a clear then this._pixiRenderer.render())
      // - render 3D (do a this._threeRenderer.render())


      const threeRenderer = this._threeRenderer;
      const threeScene = this._threeScene;
      const threeDummyCamera = this._threeCamera;

      if (threeRenderer && threeScene && threeDummyCamera) {
        threeScene.background = new THREE.Color(
          this._runtimeScene.getBackgroundColor()
        );
        threeRenderer.clear();
        threeRenderer.render(threeScene, threeDummyCamera)
        
        for(const runtimeLayer of this._runtimeScene._orderedLayers) {
          const runtimeLayerRenderer = runtimeLayer.getRenderer();
          const threeGroup = runtimeLayerRenderer.get3dRendererObject();
          const threeCamera = runtimeLayerRenderer.get3dRendererCamera();
          if (threeGroup && threeCamera) {
            // TODO: move in a render method?
            if (runtimeLayerRenderer._threePixiCanvasTexture)
              runtimeLayerRenderer._threePixiCanvasTexture.needsUpdate = true;
            threeRenderer.render(threeGroup, threeCamera);
          }
        }
      }

      // synchronize showing the cursor with rendering (useful to reduce
      // blinking while switching from in-game cursor)
      if (this._showCursorAtNextRender) {
        // TODO: replace by getCanvas()
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

    hideCursor(): void {
      this._showCursorAtNextRender = false;
      if (!this._pixiRenderer) {
        return;
      }
      // TODO: replace by getCanvas()
      this._pixiRenderer.view.style.cursor = 'none';
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

    getPIXIRenderer() {
      return this._pixiRenderer;
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
