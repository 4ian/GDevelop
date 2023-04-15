/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

namespace gdjs {
  import PIXI = GlobalPIXIModule.PIXI;

  /**
   * The renderer for a gdjs.Layer using Pixi.js.
   */
  export class LayerPixiRenderer {
    _pixiContainer: PIXI.Container;

    _layer: gdjs.RuntimeLayer;
    _renderTexture: PIXI.RenderTexture | null = null;
    _lightingSprite: PIXI.Sprite | null = null;
    _runtimeSceneRenderer: gdjs.RuntimeInstanceContainerRenderer;
    _pixiRenderer: PIXI.Renderer | null;

    // Width and height are tracked when a render texture is used.
    _oldWidth: float | null = null;
    _oldHeight: float | null = null;
    _isLightingLayer: boolean;
    _clearColor: Array<integer>;

    _threeGroup: THREE.Group | null = null;

    _threeCamera: THREE.PerspectiveCamera | null = null;
    _threePixiCanvasTexture: THREE.CanvasTexture | null = null;
    _threePlaneGeometry: THREE.PlaneGeometry | null = null;
    _threePlaneMaterial: THREE.MeshBasicMaterial | null = null;
    _threePlaneMesh: THREE.Mesh | null = null;

    /**
     * Pixi doesn't sort children with zIndex == 0.
     */
    private static readonly zeroZOrderForPixi = Math.pow(2, -24);

    /**
     * @param layer The layer
     * @param runtimeInstanceContainerRenderer The scene renderer
     */
    constructor(
      layer: gdjs.RuntimeLayer,
      runtimeInstanceContainerRenderer: gdjs.RuntimeInstanceContainerRenderer,
      pixiRenderer: PIXI.Renderer | null // TODO: check if this can even be null?
    ) {
      this._pixiContainer = new PIXI.Container();
      this._pixiContainer.sortableChildren = true;
      this._layer = layer;
      this._runtimeSceneRenderer = runtimeInstanceContainerRenderer;
      this._pixiRenderer = pixiRenderer;
      this._isLightingLayer = layer.isLightingLayer();
      this._clearColor = layer.getClearColor();
      runtimeInstanceContainerRenderer
        .getRendererObject()
        .addChild(this._pixiContainer);
      this._pixiContainer.filters = [];
      if (this._isLightingLayer) {
        this._replaceContainerWithSprite();
      }

      this._setupThreeCameraAndContainer();
    }

    getRendererObject(): PIXI.Container {
      return this._pixiContainer;
    }

    getThreeGroup(): THREE.Group | null {
      return this._threeGroup;
    }

    getThreeCamera(): THREE.Camera | null {
      return this._threeCamera;
    }

    getLightingSprite(): PIXI.Sprite | null {
      return this._lightingSprite;
    }

    _setupThreeCameraAndContainer(): void {
      const parentThreeContainer = this._runtimeSceneRenderer.get3dRendererObject();
      if (!parentThreeContainer) {
        // No parent 3D renderer object, 3D is disabled.
        return;
      }

      if (!this._threeGroup) {
        // TODO (3D) - optimization: do not create a THREE.Group if no 3D object are contained inside.
        this._threeGroup = new THREE.Group();
        parentThreeContainer.add(this._threeGroup);
      }

      if (!this._pixiRenderer) {
        // No PixiJS renderer, which is unexpected.
        return;
      }

      // TODO (3D): ideally we would avoid the need for this flag at all,
      // maybe by having separate rendering classes for custom object layers and scene layers.
      if (this._layer instanceof gdjs.Layer) {
        if (!this._threeCamera)
          this._threeCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000);

        // TODO: Could be optimized by using a render texture instead of a canvas.
        // (Implies to share the same WebGL context between PixiJS and three.js).
        const pixiCanvas = this._pixiRenderer.view;
        this._threePixiCanvasTexture = new THREE.CanvasTexture(pixiCanvas);

        this._threePlaneGeometry = new THREE.PlaneGeometry(1, 1);
        this._threePlaneMaterial = new THREE.MeshBasicMaterial({
          // Texture will be set in onGameResolutionResized().
          side: THREE.DoubleSide,
          transparent: true,
        });

        this._threePlaneMesh = new THREE.Mesh(
          this._threePlaneGeometry,
          this._threePlaneMaterial
        );
        this._threeGroup.add(this._threePlaneMesh);

        this.onGameResolutionResized();
      }
    }

    onGameResolutionResized() {
      if (
        this._threeCamera &&
        this._threePlaneMesh &&
        this._threePlaneMaterial
      ) {
        if (this._threePixiCanvasTexture) {
          // Game size was changed, dispose of the old texture used to read the PixiJS Canvas.
          this._threePixiCanvasTexture.dispose();
        }
        if (this._pixiRenderer) {
          // And recreate a new texture to project on the plane.
          const pixiCanvas = this._pixiRenderer.view;
          this._threePixiCanvasTexture = new THREE.CanvasTexture(pixiCanvas);
          this._threePlaneMaterial.map = this._threePixiCanvasTexture;
        }

        this._threeCamera.aspect =
          this._layer.getWidth() / this._layer.getHeight();
        this._threeCamera.updateProjectionMatrix();

        this.updatePosition();
      }
    }

    /**
     * Update the position of the PIXI container. To be called after each change
     * made to position, zoom or rotation of the camera.
     */
    updatePosition(): void {
      const angle = -gdjs.toRad(this._layer.getCameraRotation());
      const zoomFactor = this._layer.getCameraZoom();
      this._pixiContainer.rotation = angle;
      this._pixiContainer.scale.x = zoomFactor;
      this._pixiContainer.scale.y = zoomFactor;
      const cosValue = Math.cos(angle);
      const sinValue = Math.sin(angle);
      const centerX =
        this._layer.getCameraX() * zoomFactor * cosValue -
        this._layer.getCameraY() * zoomFactor * sinValue;
      const centerY =
        this._layer.getCameraX() * zoomFactor * sinValue +
        this._layer.getCameraY() * zoomFactor * cosValue;
      this._pixiContainer.position.x = this._layer.getWidth() / 2 - centerX;
      this._pixiContainer.position.y = this._layer.getHeight() / 2 - centerY;

      if (
        this._layer.getRuntimeScene().getGame().getPixelsRounding() &&
        (cosValue === 0 || sinValue === 0) &&
        Number.isInteger(zoomFactor)
      ) {
        // Camera rounding is important for pixel perfect games.
        // Otherwise, the camera position fractional part is added to
        // the sprite one and it changes in which direction sprites are rounded.
        // It makes sprites rounding inconsistent with each other
        // and they seem to move on pixel left and right.
        //
        // PIXI uses a floor function on sprites position on the screen,
        // so a floor must be applied on the camera position too.
        // According to the above calculus,
        // _pixiContainer.position is the opposite of the camera,
        // this is why the ceil function is used floor(x) = -ceil(-x).
        //
        // When the camera directly follows an object,
        // given this object dimension is even,
        // the decimal part of onScenePosition and cameraPosition are the same.
        //
        // Doing the calculus without rounding:
        // onScreenPosition = onScenePosition - cameraPosition
        // onScreenPosition = 980.75 - 200.75
        // onScreenPosition = 780
        //
        // Doing the calculus with rounding:
        // onScreenPosition = floor(onScenePosition + ceil(-cameraPosition))
        // onScreenPosition = floor(980.75 + ceil(-200.75))
        // onScreenPosition = floor(980.75 - 200)
        // onScreenPosition = floor(780.75)
        // onScreenPosition = 780
        this._pixiContainer.position.x = Math.ceil(
          this._pixiContainer.position.x
        );
        this._pixiContainer.position.y = Math.ceil(
          this._pixiContainer.position.y
        );
      }

      if (this._threeCamera) {
        // TODO: Handle camera rounding like down for PixiJS?
        this._threeCamera.position.x = this._layer.getCameraX();
        this._threeCamera.position.y = -this._layer.getCameraY(); // Inverted because the scene is mirrored on Y axis.
        this._threeCamera.rotation.z = angle;

        // Set the camera so that it displays the whole PixiJS plane, as if it was a 2D rendering.
        // The Z position is computed by taking the half height of the displayed rendering,
        // and using the angle of the triangle defined by the field of view to compute the length
        // of the triangle defining the distance between the camera and the rendering plane.
        const cameraFovInRadians = gdjs.toRad(this._threeCamera.fov);
        const cameraZPosition =
          (0.5 * this._layer.getHeight()) /
          zoomFactor /
          Math.tan(0.5 * cameraFovInRadians);
        this._threeCamera.position.z = cameraZPosition;

        if (this._threePlaneMesh) {
          // Adapt the plane size so that it covers the whole screen.
          this._threePlaneMesh.scale.x = this._layer.getWidth() / zoomFactor;
          this._threePlaneMesh.scale.y =
            (this._layer.getHeight() * -1) / // Mirrored because the scene is mirrored on Y axis, see below.
            zoomFactor;

          // Adapt the plane position so that it's always displayed on the whole screen.
          this._threePlaneMesh.position.x = this._threeCamera.position.x;
          this._threePlaneMesh.position.y = -this._threeCamera.position.y; // Inverted because the scene is mirrored on Y axis.
          this._threePlaneMesh.rotation.z = -angle;
        }
      }
    }

    updateVisibility(visible: boolean): void {
      this._pixiContainer.visible = !!visible;
    }

    updatePreRender(): void {
      if (this._renderTexture) {
        this._updateRenderTexture();
      }
    }

    // onSceneUnloaded(): void {
    // if (this._threePixiCanvasTexture) this._threePixiCanvasTexture.dispose();
    // if (this._threePlaneGeometry) this._threePlaneGeometry.dispose();
    // if (this._threePlaneMaterial) this._threePlaneMaterial.dispose();
    // }

    /**
     * Add a child to the pixi container associated to the layer.
     * All objects which are on this layer must be children of this container.
     *
     * @param pixiChild The child (PIXI object) to be added.
     * @param zOrder The z order of the associated object.
     */
    addRendererObject(pixiChild, zOrder: float): void {
      const child = pixiChild as PIXI.DisplayObject;
      child.zIndex = zOrder || LayerPixiRenderer.zeroZOrderForPixi;
      this._pixiContainer.addChild(child);
    }

    /**
     * Change the z order of a child associated to an object.
     *
     * @param pixiChild The child (PIXI object) to be modified.
     * @param newZOrder The z order of the associated object.
     */
    changeRendererObjectZOrder(pixiChild, newZOrder: float): void {
      const child = pixiChild as PIXI.DisplayObject;
      child.zIndex = newZOrder;
    }

    /**
     * Remove a child from the internal pixi container.
     * Should be called when an object is deleted or removed from the layer.
     *
     * @param child The child (PIXI object) to be removed.
     */
    removeRendererObject(child): void {
      this._pixiContainer.removeChild(child);
    }

    add3dRendererObject(object: THREE.Object3D) {
      if (!this._threeGroup) return;

      this._threeGroup.add(object);
    }

    remove3dRendererObject(object: THREE.Object3D): void {
      if (!this._threeGroup) return;

      this._threeGroup.remove(object);
    }

    updateClearColor(): void {
      this._clearColor = this._layer.getClearColor();
      this._updateRenderTexture();
    }

    /**
     * Updates the render texture, if it exists.
     * Also, render texture is cleared with a specified clear color.
     */
    _updateRenderTexture(): void {
      if (
        !this._pixiRenderer ||
        this._pixiRenderer.type !== PIXI.RENDERER_TYPE.WEBGL
      ) {
        return;
      }
      if (!this._renderTexture) {
        this._oldWidth = this._pixiRenderer.screen.width;
        this._oldHeight = this._pixiRenderer.screen.height;
        const width = this._oldWidth;
        const height = this._oldHeight;
        const resolution = this._pixiRenderer.resolution;
        this._renderTexture = PIXI.RenderTexture.create({
          width,
          height,
          resolution,
        });
        this._renderTexture.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
      }
      if (
        this._oldWidth !== this._pixiRenderer.screen.width ||
        this._oldHeight !== this._pixiRenderer.screen.height
      ) {
        this._renderTexture.resize(
          this._pixiRenderer.screen.width,
          this._pixiRenderer.screen.height
        );
        this._oldWidth = this._pixiRenderer.screen.width;
        this._oldHeight = this._pixiRenderer.screen.height;
      }
      const oldRenderTexture = this._pixiRenderer.renderTexture.current;
      const oldSourceFrame = this._pixiRenderer.renderTexture.sourceFrame;
      this._pixiRenderer.renderTexture.bind(this._renderTexture);
      this._pixiRenderer.renderTexture.clear(this._clearColor);
      this._pixiRenderer.render(
        this._pixiContainer,
        this._renderTexture,
        false
      );
      this._pixiRenderer.renderTexture.bind(
        oldRenderTexture,
        oldSourceFrame,
        undefined
      );
    }

    /**
     * Enable the use of a PIXI.RenderTexture to render the PIXI.Container
     * of the layer and, in the scene PIXI container, replace the container
     * of the layer by a sprite showing this texture.
     * used only in lighting for now as the sprite could have MULTIPLY blend mode.
     */
    private _replaceContainerWithSprite(): void {
      if (
        !this._pixiRenderer ||
        this._pixiRenderer.type !== PIXI.RENDERER_TYPE.WEBGL
      ) {
        return;
      }
      this._updateRenderTexture();
      if (!this._renderTexture) {
        return;
      }
      this._lightingSprite = new PIXI.Sprite(this._renderTexture);
      this._lightingSprite.blendMode = PIXI.BLEND_MODES.MULTIPLY;
      const sceneContainer = this._runtimeSceneRenderer.getRendererObject();
      const index = sceneContainer.getChildIndex(this._pixiContainer);
      sceneContainer.addChildAt(this._lightingSprite, index);
      sceneContainer.removeChild(this._pixiContainer);
    }
  }

  //Register the class to let the engine use it.
  export type LayerRenderer = gdjs.LayerPixiRenderer;
  export const LayerRenderer = gdjs.LayerPixiRenderer;
}
