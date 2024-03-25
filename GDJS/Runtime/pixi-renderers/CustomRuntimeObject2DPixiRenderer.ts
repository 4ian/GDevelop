namespace gdjs {
  /**
   * The renderer for a {@link gdjs.CustomRuntimeObject2D} using Pixi.js.
   */
  export class CustomRuntimeObject2DPixiRenderer
    implements gdjs.RuntimeInstanceContainerPixiRenderer {
    _object: gdjs.CustomRuntimeObject;
    _instanceContainer: gdjs.CustomRuntimeObjectInstanceContainer;
    _pixiContainer: PIXI.Container;
    _isContainerDirty: boolean = true;
    _debugDraw: PIXI.Graphics | null = null;
    _debugDrawContainer: PIXI.Container | null = null;
    _debugDrawRenderedObjectsPoints: Record<
      number,
      {
        wasRendered: boolean;
        points: Record<string, PIXI.Text>;
      }
    >;

    constructor(
      object: gdjs.CustomRuntimeObject,
      instanceContainer: gdjs.CustomRuntimeObjectInstanceContainer,
      parent: gdjs.RuntimeInstanceContainer
    ) {
      this._object = object;
      this._instanceContainer = instanceContainer;

      // TODO (3D) - optimization: don't create a PixiJS container if only 3D objects.
      // And same, in reverse, for 2D only objects.
      this._pixiContainer = new PIXI.Container();
      this._debugDrawRenderedObjectsPoints = {};

      // Contains the layers of the scene (and, optionally, debug PIXI objects).
      this._pixiContainer.sortableChildren = true;
      this._debugDraw = null;

      const layer = parent.getLayer('');
      if (layer) {
        layer
          .getRenderer()
          .addRendererObject(this._pixiContainer, object.getZOrder());
      }
    }

    reinitialize(
      object: gdjs.CustomRuntimeObject,
      parent: gdjs.RuntimeInstanceContainer
    ) {
      this._object = object;
      this._isContainerDirty = true;
      const layer = parent.getLayer('');
      if (layer) {
        layer
          .getRenderer()
          .addRendererObject(this._pixiContainer, object.getZOrder());
      }
    }

    getRendererObject() {
      return this._pixiContainer;
    }

    get3DRendererObject(): THREE.Object3D | null {
      return null;
    }

    /**
     * Update the internal PIXI.Container position, angle...
     */
    _updatePIXIContainer() {
      const scaleX = this._object.getScaleX();
      const scaleY = this._object.getScaleY();
      const opacity = this._object.getOpacity();
      this._pixiContainer.pivot.x = this._object.getUnscaledCenterX();
      this._pixiContainer.pivot.y = this._object.getUnscaledCenterY();
      this._pixiContainer.position.x =
        this._object.getX() + this._pixiContainer.pivot.x * Math.abs(scaleX);
      this._pixiContainer.position.y =
        this._object.getY() + this._pixiContainer.pivot.y * Math.abs(scaleY);

      this._pixiContainer.rotation = gdjs.toRad(this._object.angle);
      this._pixiContainer.scale.x = scaleX;
      this._pixiContainer.scale.y = scaleY;
      this._pixiContainer.visible = !this._object.hidden;
      this._pixiContainer.alpha = opacity / 255;

      this._isContainerDirty = false;
    }

    /**
     * Call this to make sure the object is ready to be rendered.
     */
    ensureUpToDate() {
      if (this._isContainerDirty) {
        this._updatePIXIContainer();
      }
    }

    update(): void {
      this._isContainerDirty = true;
    }

    updateX(): void {
      const scaleX = this._object.getScaleX();
      this._pixiContainer.position.x =
        this._object.x + this._pixiContainer.pivot.x * Math.abs(scaleX);
    }

    updateY(): void {
      const scaleY = this._object.getScaleY();
      this._pixiContainer.position.y =
        this._object.y + this._pixiContainer.pivot.y * Math.abs(scaleY);
    }

    updateAngle(): void {
      this._pixiContainer.rotation = gdjs.toRad(this._object.angle);
    }

    updateOpacity(): void {
      const opacity = this._object.getOpacity();
      this._pixiContainer.alpha = opacity / 255;
    }

    updateVisibility(): void {
      this._pixiContainer.visible = !this._object.hidden;
    }

    getPIXIContainer() {
      return this._pixiContainer;
    }

    getPIXIRenderer() {
      return null;
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

    static getAnimationFrameTextureManager(
      imageManager: gdjs.PixiImageManager
    ) {
      return gdjs.SpriteRuntimeObjectPixiRenderer.getAnimationFrameTextureManager(
        imageManager
      );
    }
  }

  // Register the class to let the engine use it.
  export type CustomRuntimeObject2DRenderer = gdjs.CustomRuntimeObject2DPixiRenderer;
  export const CustomRuntimeObject2DRenderer =
    gdjs.CustomRuntimeObject2DPixiRenderer;
}
