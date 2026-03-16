namespace gdjs {
  /**
   * The renderer for a gdjs.RuntimeScene using Pixi.js.
   * @category Renderers > Scene
   */
  export class RuntimeScenePixiRenderer
    implements gdjs.RuntimeInstanceContainerPixiRenderer
  {
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
    private _backgroundColor: THREE.Color | null = null;
    private _fsrPass: gdjs.Fsr1Pass | null = null;
    private _fsrLowResTarget: THREE.WebGLRenderTarget | null = null;
    private _fsrCopyScene: THREE.Scene | null = null;
    private _fsrCopyCamera: THREE.OrthographicCamera | null = null;
    private _fsrCopyMesh: THREE.Mesh | null = null;
    private _fsrCopyMaterial: THREE.MeshBasicMaterial | null = null;
    private _fsrLowResWidth: integer = 0;
    private _fsrLowResHeight: integer = 0;
    private _fsrOutputWidth: integer = 0;
    private _fsrOutputHeight: integer = 0;

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

      this._updateFsrResources();
    }

    onSceneUnloaded() {
      // TODO (3D): call the method with the same name on RuntimeLayers so they can dispose?
      this._disposeFsrResources();
    }

    private _isFsrSupported(): boolean {
      return !!this._threeRenderer && this._threeRenderer.capabilities.isWebGL2;
    }

    private _ensureFsrResources(): boolean {
      if (!this._isFsrSupported() || typeof THREE === 'undefined') {
        return false;
      }
      if (!this._fsrPass) {
        this._fsrPass = new gdjs.Fsr1Pass();
      }
      if (!this._fsrLowResTarget) {
        this._fsrLowResTarget = new THREE.WebGLRenderTarget(1, 1, {
          depthBuffer: true,
          stencilBuffer: false,
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
        });
        this._fsrLowResTarget.texture.generateMipmaps = false;
        this._fsrLowResTarget.texture.wrapS = THREE.ClampToEdgeWrapping;
        this._fsrLowResTarget.texture.wrapT = THREE.ClampToEdgeWrapping;
      }
      if (!this._fsrCopyScene || !this._fsrCopyCamera || !this._fsrCopyMesh) {
        this._fsrCopyScene = new THREE.Scene();
        this._fsrCopyCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this._fsrCopyMaterial = new THREE.MeshBasicMaterial({
          transparent: true,
          depthTest: false,
          depthWrite: false,
        });
        const geometry = new THREE.PlaneGeometry(2, 2);
        this._fsrCopyMesh = new THREE.Mesh(geometry, this._fsrCopyMaterial);
        this._fsrCopyScene.add(this._fsrCopyMesh);
      }
      return true;
    }

    private _updateFsrResources(): void {
      if (!this._runtimeGameRenderer) return;
      const runtimeGame = this._runtimeScene.getGame();
      if (!runtimeGame.isFsrEnabled()) return;
      if (!this._ensureFsrResources()) return;

      const pixelRatio = this._runtimeGameRenderer.getPixelRatio();
      const lowResWidth = Math.max(
        1,
        Math.round(runtimeGame.getRenderingWidth() * pixelRatio)
      );
      const lowResHeight = Math.max(
        1,
        Math.round(runtimeGame.getRenderingHeight() * pixelRatio)
      );
      const outputWidth = Math.max(
        1,
        Math.round(runtimeGame.getGameResolutionWidth() * pixelRatio)
      );
      const outputHeight = Math.max(
        1,
        Math.round(runtimeGame.getGameResolutionHeight() * pixelRatio)
      );

      if (
        this._fsrLowResTarget &&
        (this._fsrLowResWidth !== lowResWidth ||
          this._fsrLowResHeight !== lowResHeight)
      ) {
        this._fsrLowResTarget.setSize(lowResWidth, lowResHeight);
        this._fsrLowResWidth = lowResWidth;
        this._fsrLowResHeight = lowResHeight;
      }

      if (
        this._fsrOutputWidth !== outputWidth ||
        this._fsrOutputHeight !== outputHeight
      ) {
        this._fsrOutputWidth = outputWidth;
        this._fsrOutputHeight = outputHeight;
      }

      if (this._fsrPass) {
        this._fsrPass.setSize(
          new THREE.Vector2(lowResWidth, lowResHeight),
          new THREE.Vector2(outputWidth, outputHeight)
        );
        this._fsrPass.setSharpness(runtimeGame.getFsrSharpness());
      }
    }

    private _renderTextureToLowResTarget(
      threeRenderer: THREE.WebGLRenderer,
      texture: THREE.Texture
    ) {
      if (
        !this._fsrLowResTarget ||
        !this._fsrCopyScene ||
        !this._fsrCopyCamera ||
        !this._fsrCopyMesh ||
        !this._fsrCopyMaterial
      ) {
        return;
      }
      if (this._fsrCopyMaterial.map !== texture) {
        this._fsrCopyMaterial.map = texture;
        this._fsrCopyMaterial.needsUpdate = true;
      }
      threeRenderer.setRenderTarget(this._fsrLowResTarget);
      threeRenderer.render(this._fsrCopyScene, this._fsrCopyCamera);
    }

    private _disposeFsrResources(): void {
      if (this._fsrPass) {
        this._fsrPass.dispose();
        this._fsrPass = null;
      }
      if (this._fsrLowResTarget) {
        this._fsrLowResTarget.dispose();
        this._fsrLowResTarget = null;
      }
      if (this._fsrCopyMesh) {
        this._fsrCopyMesh.geometry.dispose();
        this._fsrCopyMesh = null;
      }
      if (this._fsrCopyMaterial) {
        this._fsrCopyMaterial.dispose();
        this._fsrCopyMaterial = null;
      }
      this._fsrCopyScene = null;
      this._fsrCopyCamera = null;
      this._fsrLowResWidth = 0;
      this._fsrLowResHeight = 0;
      this._fsrOutputWidth = 0;
      this._fsrOutputHeight = 0;
    }

    render() {
      const runtimeGameRenderer = this._runtimeGameRenderer;
      if (!runtimeGameRenderer) return;

      const pixiRenderer = runtimeGameRenderer.getPIXIRenderer();
      if (!pixiRenderer) return;

      const runtimeGame = this._runtimeScene.getGame();
      const threeRenderer = this._threeRenderer;
      const fsrEnabled =
        runtimeGame.isFsrEnabled() && this._ensureFsrResources();

      // If we are in VR, we cannot render like this: we must use the special VR
      // rendering method to not display a black screen.
      //
      // We cannot call it here either - the headset will request a frame to be rendered
      // whenever it wants and we must oblige, however this will  be called whenever
      // we do a step - and we may step multiple times or none at all depending on the
      // min/max FPS and possibly other factors, and the headset will not allow that.
      //
      // It is therefore left to the VR extension to call the VR rendering method whenever
      // the headset require a new image, we'll just disable rendering when stepping to
      // not interfere with the headset's rendering.
      if (threeRenderer && threeRenderer.xr.isPresenting) return;

      this._layerRenderingMetrics.rendered2DLayersCount = 0;
      this._layerRenderingMetrics.rendered3DLayersCount = 0;

      if (threeRenderer) {
        if (fsrEnabled && this._fsrPass && this._fsrLowResTarget) {
          // FSR 1.0 layered rendering into a shared low-res target.
          this._updateFsrResources();

          threeRenderer.info.autoReset = false;
          threeRenderer.info.reset();

          /** Useful to render the background color. */
          let isFirstRender = true;

          /**
           * true if the last layer rendered 3D objects using Three.js, false otherwise.
           * Useful to avoid needlessly resetting the WebGL states between layers (which can be expensive).
           */
          let lastRenderWas3D = true;

          // Ensure a clean state for the first frame.
          threeRenderer.resetState();

          // Render each layer one by one into the shared low-res target.
          for (let i = 0; i < this._runtimeScene._orderedLayers.length; ++i) {
            const runtimeLayer = this._runtimeScene._orderedLayers[i];
            if (!runtimeLayer.isVisible()) continue;

            const runtimeLayerRenderer = runtimeLayer.getRenderer();
            const threeScene = runtimeLayerRenderer.getThreeScene();
            const threeCamera = runtimeLayerRenderer.getThreeCamera();
            const threeEffectComposer =
              runtimeLayerRenderer.getThreeEffectComposer();

            const layerHas2DObjectsToRender =
              runtimeLayerRenderer.has2DObjects();

            if (layerHas2DObjectsToRender) {
              if (lastRenderWas3D) {
                threeRenderer.resetState();
                pixiRenderer.reset();
              }

              runtimeLayerRenderer.renderOnPixiRenderTexture(pixiRenderer);
              runtimeLayerRenderer.updateThreePlaneTextureFromPixiRenderTexture(
                threeRenderer,
                pixiRenderer
              );
              runtimeLayerRenderer.show2DRenderingPlane(true);
              this._layerRenderingMetrics.rendered2DLayersCount++;
              lastRenderWas3D = false;
            } else {
              runtimeLayerRenderer.show2DRenderingPlane(false);
            }

            if (!threeScene || !threeCamera) {
              continue;
            }

            if (!lastRenderWas3D) {
              pixiRenderer.reset();
              threeRenderer.resetState();
            }

            if (isFirstRender) {
              threeRenderer.setClearColor(
                this._runtimeScene.getBackgroundColor()
              );
              threeRenderer.setRenderTarget(this._fsrLowResTarget);
              if (this._runtimeScene.getClearCanvas()) {
                threeRenderer.clear();
              }
              isFirstRender = false;
            }

            // Avoid clearing background inside the layer scene.
            if (threeScene.background) {
              threeScene.background = null;
            }

            threeRenderer.setRenderTarget(this._fsrLowResTarget);
            threeRenderer.clearDepth();

            if (threeEffectComposer && runtimeLayerRenderer.hasPostProcessingPass()) {
              for (const pass of threeEffectComposer.passes) {
                pass.renderToScreen = false;
              }
              threeEffectComposer.render();
              const anyComposer = threeEffectComposer as any;
              const composerTexture =
                (anyComposer.readBuffer && anyComposer.readBuffer.texture) ||
                (anyComposer.writeBuffer && anyComposer.writeBuffer.texture) ||
                null;
              if (composerTexture) {
                this._renderTextureToLowResTarget(
                  threeRenderer,
                  composerTexture
                );
              }
            } else {
              threeRenderer.render(threeScene, threeCamera);
            }

            this._layerRenderingMetrics.rendered3DLayersCount++;
            lastRenderWas3D = true;
          }

          // Upscale the composed low-res target to the screen.
          this._fsrPass.render(
            threeRenderer,
            this._fsrLowResTarget.texture
          );

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
            pixiRenderer.reset();
          }
        } else {
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

            // Determine if this layer will actually render in 3D mode.
            // Keep in sync with: `shouldRenderLayerIn3D` in `layer-pixi-renderer.ts`.
            const shouldRenderLayerIn3D =
              runtimeGame.isInGameEdition() ||
              (runtimeLayerRenderingType !==
                gdjs.RuntimeLayerRenderingType.TWO_D &&
                runtimeLayerRenderer.has3DObjects());

            if (!shouldRenderLayerIn3D) {
              // Render a layer with 2D rendering (PixiJS).

              if (lastRenderWas3D) {
                // Ensure the state is clean for PixiJS to render.
                threeRenderer.resetState();
                pixiRenderer.reset();
              }

              if (isFirstRender) {
                // Render the background color.
                pixiRenderer.background.color =
                  this._runtimeScene.getBackgroundColor();
                pixiRenderer.background.alpha = 1;
                if (this._runtimeScene.getClearCanvas()) pixiRenderer.clear();

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
              const threeEffectComposer =
                runtimeLayerRenderer.getThreeEffectComposer();

              // Render the 3D objects of this layer.
              if (threeScene && threeCamera && threeEffectComposer) {
                // TODO (3D) - optimization: do this at the beginning for all layers that are 2d+3d?
                // So the second pass is clearer (just rendering 2d or 3d layers without doing PixiJS renders in between).
                if (
                  runtimeLayerRenderingType ===
                  gdjs.RuntimeLayerRenderingType.TWO_D_PLUS_THREE_D
                ) {
                  const layerHas2DObjectsToRender =
                    runtimeLayerRenderer.has2DObjects();

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
                  if (this._runtimeScene.getClearCanvas())
                    threeRenderer.clear();
                  if (!this._backgroundColor) {
                    this._backgroundColor = new THREE.Color();
                  }
                  this._backgroundColor.set(
                    this._runtimeScene.getBackgroundColor()
                  );
                  if (!threeScene.background) {
                    threeScene.background = this._backgroundColor;
                  }

                  isFirstRender = false;
                } else {
                  // It's important to set the background to null, as maybe the first rendered
                  // layer has changed and so the Three.js scene background must be reset.
                  if (threeScene.background === this._backgroundColor) {
                    threeScene.background = null;
                  }
                }

                // Clear the depth as each layer is independent and display on top of the previous one,
                // even 3D objects.
                threeRenderer.clearDepth();
                if (runtimeLayerRenderer.hasPostProcessingPass()) {
                  threeEffectComposer.render();
                } else {
                  threeRenderer.render(threeScene, threeCamera);
                }

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
        }
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
        pixiRenderer.background.color = this._runtimeScene.getBackgroundColor();
        pixiRenderer.render(this._pixiContainer, {
          clear: this._runtimeScene.getClearCanvas(),
        });
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

    /**
     * Unless you know what you are doing, use the VR extension instead of this function directly.
     *
     * In VR, only 3D elements can be rendered, 2D cannot.
     * This rendering method skips over all 2D layers and elements, and simply renders the 3D content.
     * This method is to be called by the XRSession's `requestAnimationFrame` for rendering to
     * the headset whenever the headset requests the screen to be drawn. Note that while an XRSession
     * is in progress, the regular `requestAnimationFrame` will be disabled. Make sure that whenever you
     * enter an XRSession, you:
     * - Call this function first and foremost when the XRSession's requestAnimationFrame fires,
     *   as it is necessary to draw asap as the headset will eventually stop waiting and just draw the
     *   framebuffer as it is to maintain a constant screen refresh rate, which can be in the middle of
     *   or even before rendering if we aren't fast enough, leading to screen flashes and bugs.
     * - Call GDevelop's step function to give the scene a chance to step after having drawn to the screen
     *   to allow the game to actually progress, since GDevelop will no longer step by itself with
     *   `requestAnimationFrame` disabled.
     *
     * Note to engine developers: `threeRenderer.resetState()` may NOT be called in this function,
     * as WebXR modifies the WebGL state in a way that resetting it will cause an improper render
     * that will lead to a black screen being displayed in VR mode.
     */
    renderForVR() {
      const runtimeGameRenderer = this._runtimeGameRenderer;
      if (!runtimeGameRenderer) return;

      const threeRenderer = this._threeRenderer;
      // VR rendering relies on ThreeJS
      if (!threeRenderer)
        throw new Error('Cannot render a scene with no 3D elements in VR!');

      // Render each layer one by one.
      let isFirstRender = true;
      for (let i = 0; i < this._runtimeScene._orderedLayers.length; ++i) {
        const runtimeLayer = this._runtimeScene._orderedLayers[i];
        if (!runtimeLayer.isVisible()) continue;

        const runtimeLayerRenderer = runtimeLayer.getRenderer();
        const runtimeLayerRenderingType = runtimeLayer.getRenderingType();
        if (
          runtimeLayerRenderingType === gdjs.RuntimeLayerRenderingType.TWO_D ||
          !runtimeLayerRenderer.has3DObjects()
        )
          continue;

        // Render a layer with 3D rendering, and no 2D rendering at all for VR.
        const threeScene = runtimeLayerRenderer.getThreeScene();
        const threeCamera = runtimeLayerRenderer.getThreeCamera();
        if (!threeScene || !threeCamera) continue;

        if (isFirstRender) {
          // Render the background color.
          threeRenderer.setClearColor(this._runtimeScene.getBackgroundColor());
          if (this._runtimeScene.getClearCanvas()) threeRenderer.clear();
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
      let layerPixiObject: PIXI.Container | PIXI.Sprite | null =
        layerPixiRenderer.getRendererObject();
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
  /** @category Renderers > Scene */
  export type RuntimeSceneRenderer = gdjs.RuntimeScenePixiRenderer;
  /** @category Renderers > Scene */
  export const RuntimeSceneRenderer = gdjs.RuntimeScenePixiRenderer;
}
