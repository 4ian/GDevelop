namespace gdjs {
  import PIXI = GlobalPIXIModule.PIXI;

  /**
   * The renderer for a {@link gdjs.CustomRuntimeObject} using Pixi.js.
   */
  export class CustomObjectPixiRenderer
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

    /**
     * Update the internal PIXI.Container position, angle...
     */
    _updatePIXIContainer() {
      this._pixiContainer.pivot.x = this._object.getUnscaledCenterX();
      this._pixiContainer.pivot.y = this._object.getUnscaledCenterY();
      this._pixiContainer.position.x =
        this._object.x +
        this._pixiContainer.pivot.x * Math.abs(this._object._scaleX);
      this._pixiContainer.position.y =
        this._object.y +
        this._pixiContainer.pivot.y * Math.abs(this._object._scaleY);
      this._pixiContainer.rotation = gdjs.toRad(this._object.angle);
      this._pixiContainer.scale.x = this._object._scaleX;
      this._pixiContainer.scale.y = this._object._scaleY;
      this._pixiContainer.visible = !this._object.hidden;
      this._pixiContainer.alpha = this._object.opacity / 255;

      this._isContainerDirty = false;
    }

    /**
     * Call this to make sure the sprite is ready to be rendered.
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
      this._pixiContainer.position.x =
        this._object.x +
        this._pixiContainer.pivot.x * Math.abs(this._object._scaleX);
    }

    updateY(): void {
      this._pixiContainer.position.y =
        this._object.y +
        this._pixiContainer.pivot.y * Math.abs(this._object._scaleY);
    }

    updateAngle(): void {
      this._pixiContainer.rotation = gdjs.toRad(this._object.angle);
    }

    updateOpacity(): void {
      this._pixiContainer.alpha = this._object.opacity / 255;
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

  // Register the class to let the engine use it.
  export type CustomObjectRenderer = gdjs.CustomObjectPixiRenderer;
  export const CustomObjectRenderer = gdjs.CustomObjectPixiRenderer;
}
