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
    _threePixiCanvasTexture: THREE.CanvasTexture | null = null;
    _threePlaneGeometry: THREE.PlaneGeometry | null = null;
    _threePlaneMaterial: THREE.MeshBasicMaterial | null = null;
    _threePlaneMesh: THREE.Mesh | null = null;
    _threeScene: THREE.Scene | null = null;
    _threeCamera: THREE.PerspectiveCamera | null = null;

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
      if (!this._pixiRenderer) return;

      const runtimeGame = this._runtimeScene.getGame();
      this._threeRenderer = runtimeGame.getRenderer()._threeRenderer;

      if (this._threePixiCanvasTexture) this._threePixiCanvasTexture.dispose();
      if (this._threePlaneGeometry) this._threePlaneGeometry.dispose();
      if (this._threePlaneMaterial) this._threePlaneMaterial.dispose();
      if (this._threePlaneMesh && this._threeScene)
        this._threeScene.remove(this._threePlaneMesh);

      // TODO: Could be optimized by using a render texture instead of a canvas.
      // (Implies to share the same WebGL context between PixiJS and three.js).
      const pixiCanvas = this._pixiRenderer.view;
      this._threePixiCanvasTexture = new THREE.CanvasTexture(pixiCanvas);

      this._threePlaneGeometry = new THREE.PlaneGeometry(
        runtimeGame.getGameResolutionWidth(),
        runtimeGame.getGameResolutionHeight()
      );
      this._threePlaneMaterial = new THREE.MeshBasicMaterial({
        map: this._threePixiCanvasTexture,
        side: THREE.DoubleSide,
        transparent: true,
      });

      this._threePlaneMesh = new THREE.Mesh(
        this._threePlaneGeometry,
        this._threePlaneMaterial
      );
      this._threePlaneMesh.position.set(
        runtimeGame.getGameResolutionWidth() / 2,
        runtimeGame.getGameResolutionHeight() / 2,
        0
      );
      this._threePlaneMesh.scale.y = -1; // Mirrored because the scene is mirrored on Y axis, see below.
      this._threePlaneMesh.renderOrder = -9999; // Ensure the plane is rendered last so it blends with 3D objects

      if (!this._threeScene) this._threeScene = new THREE.Scene();
      if (!this._threeCamera)
        this._threeCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000);

      // Set the camera so that it displays the whole PixiJS plane, as if it was a 2D rendering.
      const cameraFovInRadians = gdjs.toRad(this._threeCamera.fov);
      const cameraDistance =
        (0.5 * runtimeGame.getGameResolutionHeight()) /
        Math.tan(0.5 * cameraFovInRadians);
      this._threeCamera.position.set(
        runtimeGame.getGameResolutionWidth() / 2,
        - runtimeGame.getGameResolutionHeight() / 2, // Minus because the scene is mirrored on Y axis, see below.
        cameraDistance
      );
      this._threeCamera.aspect =
        runtimeGame.getGameResolutionWidth() /
        runtimeGame.getGameResolutionHeight();
      this._threeCamera.updateProjectionMatrix();

      // Use a mirroring on the Y axis to follow the same axis as in the 2D, PixiJS, rendering.
      // We use a mirroring rather than a camera rotation so that the Z order is not changed.
      this._threeScene.scale.y = -1;

      this._threeScene.add(this._threePlaneMesh);
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

      this._setupThreeScene();
    }

    onSceneUnloaded() {
      if (this._threePixiCanvasTexture) this._threePixiCanvasTexture.dispose();
      if (this._threePlaneGeometry) this._threePlaneGeometry.dispose();
      if (this._threePlaneMaterial) this._threePlaneMaterial.dispose();
      if (this._threePlaneMesh && this._threeScene)
        this._threeScene.remove(this._threePlaneMesh);
    }

    render() {
      if (!this._pixiRenderer) {
        return;
      }

      // this._renderProfileText(); //Uncomment to display profiling times

      // render the PIXI container of the scene
      this._pixiRenderer.reset(); // TODO: Only if THREE
      this._pixiRenderer.backgroundColor = this._runtimeScene.getBackgroundColor();
      this._pixiRenderer.render(this._pixiContainer);
      this._pixiRenderer.reset(); // TODO: Only if THREE

      // TODO: use a single object
      if (
        this._threePixiCanvasTexture &&
        this._threeRenderer &&
        this._threeScene &&
        this._threeCamera
      ) {
        this._threeScene.background = new THREE.Color(
          this._runtimeScene.getBackgroundColor()
        );
        this._threePixiCanvasTexture.needsUpdate = true;
        this._threeRenderer.resetState();
        this._threeRenderer.render(this._threeScene, this._threeCamera);
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
