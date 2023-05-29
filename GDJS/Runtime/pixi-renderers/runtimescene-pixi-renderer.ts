namespace gdjs {
  import PIXI = GlobalPIXIModule.PIXI;

  /**
   * The renderer for a gdjs.RuntimeScene using Pixi.js.
   */
  export class RuntimeScenePixiRenderer
    implements gdjs.RuntimeInstanceContainerPixiRenderer {
    private _runtimeGameRenderer: gdjs.RuntimeGamePixiRenderer | null;
    private _runtimeScene: gdjs.RuntimeScene;
    private _pixiContainer: PIXI.Container;
    private _profilerText: PIXI.Text | null = null;
    private _showCursorAtNextRender: boolean = false;
    private _threeRenderer: THREE.WebGLRenderer | null = null;
    private _layerRenderingMetrics: {
      rendered2DLayersCount: number;
      rendered3DLayersCount: number;
    } = {
      rendered2DLayersCount: 0,
      rendered3DLayersCount: 0,
    };

    constructor(
      runtimeScene: gdjs.RuntimeScene,
      runtimeGameRenderer: gdjs.RuntimeGamePixiRenderer | null
    ) {
      this._runtimeGameRenderer = runtimeGameRenderer;
      this._runtimeScene = runtimeScene;
      this._pixiContainer = new PIXI.Container();

      // Contains the layers of the scene (and, optionally, debug PIXI objects).
      this._pixiContainer.sortableChildren = true;

      this._threeRenderer = this._runtimeGameRenderer
        ? this._runtimeGameRenderer.getThreeRenderer()
        : null;
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

      this._layerRenderingMetrics.rendered2DLayersCount = 0;
      this._layerRenderingMetrics.rendered3DLayersCount = 0;

      if (threeRenderer) {
        // Layered 2D, 3D or 2D+3D rendering.
        threeRenderer.info.autoReset = false;
        threeRenderer.info.reset();

        /** Useful to render the background color. */
        let isFirstRender = true;

        /**
         * true if the last layer rendered 3D objects using Three.js, false otherwise.
         * Useful to avoid needlessly resetting the WebGL states between layers (which can be expensive).
         */
        let lastRenderWas3D = true;

        // Even if no rendering at all has been made already, setting up the Three.js/PixiJS renderers
        // might have changed some WebGL states already. Reset the state for the very first frame.
        // And, out of caution, keep doing it for every frame.
        // TODO (3D): optimization - check if this can be done only on the very first frame.
        threeRenderer.resetState();

        // Render each layer one by one.
        for (let i = 0; i < this._runtimeScene._orderedLayers.length; ++i) {
          const runtimeLayer = this._runtimeScene._orderedLayers[i];
          if (!runtimeLayer.isVisible()) continue;

          const runtimeLayerRenderer = runtimeLayer.getRenderer();
          const runtimeLayerRenderingType = runtimeLayer.getRenderingType();
          const layerHas3DObjectsToRender = runtimeLayerRenderer.has3DObjects();
          if (
            runtimeLayerRenderingType ===
              gdjs.RuntimeLayerRenderingType.TWO_D ||
            !layerHas3DObjectsToRender
          ) {
            // Render a layer with 2D rendering (PixiJS) only if layer is configured as is
            // or if there is no 3D object to render.

            if (lastRenderWas3D) {
              // Ensure the state is clean for PixiJS to render.
              threeRenderer.resetState();
              pixiRenderer.reset();
            }

            if (isFirstRender) {
              // Render the background color.
              pixiRenderer.backgroundColor = this._runtimeScene.getBackgroundColor();
              pixiRenderer.backgroundAlpha = 1;
              pixiRenderer.clear();

              isFirstRender = false;
            }

            if (runtimeLayer.isLightingLayer()) {
              // Render the lights on the render texture used then by the lighting Sprite.
              runtimeLayerRenderer.renderOnPixiRenderTexture(pixiRenderer);
            }

            // TODO (2d lights): refactor to remove the need for `getLightingSprite`.
            const pixiContainer =
              (runtimeLayer.isLightingLayer() &&
                runtimeLayerRenderer.getLightingSprite()) ||
              runtimeLayerRenderer.getRendererObject();

            pixiRenderer.render(pixiContainer, { clear: false });
            this._layerRenderingMetrics.rendered2DLayersCount++;

            lastRenderWas3D = false;
          } else {
            // Render a layer with 3D rendering, and possibly some 2D rendering too.
            const threeScene = runtimeLayerRenderer.getThreeScene();
            const threeCamera = runtimeLayerRenderer.getThreeCamera();

            // Render the 3D objects of this layer.
            if (threeScene && threeCamera) {
              // TODO (3D) - optimization: do this at the beginning for all layers that are 2d+3d?
              // So the second pass is clearer (just rendering 2d or 3d layers without doing PixiJS renders in between).
              if (
                runtimeLayerRenderingType ===
                gdjs.RuntimeLayerRenderingType.TWO_D_PLUS_THREE_D
              ) {
                const layerHas2DObjectsToRender = runtimeLayerRenderer.has2DObjects();

                if (layerHas2DObjectsToRender) {
                  if (lastRenderWas3D) {
                    // Ensure the state is clean for PixiJS to render.
                    threeRenderer.resetState();
                    pixiRenderer.reset();
                  }

                  // Do the rendering of the PixiJS objects of the layer on the render texture.
                  // Then, update the texture of the plane showing the PixiJS rendering,
                  // so that the 2D rendering made by PixiJS can be shown in the 3D world.
                  runtimeLayerRenderer.renderOnPixiRenderTexture(pixiRenderer);
                  runtimeLayerRenderer.updateThreePlaneTextureFromPixiRenderTexture(
                    // The renderers are needed to find the internal WebGL texture.
                    threeRenderer,
                    pixiRenderer
                  );
                  this._layerRenderingMetrics.rendered2DLayersCount++;

                  lastRenderWas3D = false;
                }
                runtimeLayerRenderer.show2DRenderingPlane(
                  layerHas2DObjectsToRender
                );
              }

              if (!lastRenderWas3D) {
                // It's important to reset the internal WebGL state of PixiJS, then Three.js
                // to ensure the 3D rendering is made properly by Three.js
                pixiRenderer.reset();
                threeRenderer.resetState();
              }

              if (isFirstRender) {
                // Render the background color.
                threeRenderer.setClearColor(
                  this._runtimeScene.getBackgroundColor()
                );
                threeRenderer.resetState();
                threeRenderer.clear();
                threeScene.background = new THREE.Color(
                  this._runtimeScene.getBackgroundColor()
                );

                isFirstRender = false;
              } else {
                // It's important to set the background to null, as maybe the first rendered
                // layer has changed and so the Three.js scene background must be reset.
                threeScene.background = null;
              }

              // Clear the depth as each layer is independent and display on top of the previous one,
              // even 3D objects.
              threeRenderer.clearDepth();
              threeRenderer.render(threeScene, threeCamera);
              this._layerRenderingMetrics.rendered3DLayersCount++;

              lastRenderWas3D = true;
            }
          }
        }

        const debugContainer = this._runtimeScene
          .getDebuggerRenderer()
          .getRendererObject();

        if (debugContainer) {
          threeRenderer.resetState();
          pixiRenderer.reset();
          pixiRenderer.render(debugContainer);
          lastRenderWas3D = false;
        }

        if (!lastRenderWas3D) {
          // Out of caution, reset the WebGL states from PixiJS to start again
          // with a 3D rendering on the next frame.
          pixiRenderer.reset();
        }

        // Uncomment to display some debug metrics from Three.js.
        // console.log(threeRenderer.info);
      } else {
        // 2D only rendering.

        // Render lights in render textures first.
        for (const runtimeLayer of this._runtimeScene._orderedLayers) {
          if (runtimeLayer.isLightingLayer()) {
            // Render the lights on the render texture used then by the lighting Sprite.
            const runtimeLayerRenderer = runtimeLayer.getRenderer();
            runtimeLayerRenderer.renderOnPixiRenderTexture(pixiRenderer);
          }
        }

        // this._renderProfileText(); //Uncomment to display profiling times

        // Render all the layers then.
        // TODO: replace by a loop like in 3D?
        pixiRenderer.backgroundColor = this._runtimeScene.getBackgroundColor();
        pixiRenderer.render(this._pixiContainer);
        this._layerRenderingMetrics.rendered2DLayersCount++;
      }

      // synchronize showing the cursor with rendering (useful to reduce
      // blinking while switching from in-game cursor)
      if (this._showCursorAtNextRender) {
        const canvas = runtimeGameRenderer.getCanvas();
        if (canvas) canvas.style.cursor = '';
        this._showCursorAtNextRender = false;
      }

      // Uncomment to check the number of 2D&3D rendering done
      // console.log(this._layerRenderingMetrics);
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

    get3DRendererObject() {
      // There is no notion of a container for all 3D objects. Each 3D object is
      // added to their layer container.
      return null;
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
        // TODO (2d lights): refactor to remove the need for `getLightingSprite`.
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
