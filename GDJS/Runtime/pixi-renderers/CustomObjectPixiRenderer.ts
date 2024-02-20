namespace gdjs {
  /**
   * The renderer for a {@link gdjs.CustomRuntimeObject} using Pixi.js.
   */
  export class CustomObjectPixiRenderer
    implements gdjs.RuntimeInstanceContainerPixiRenderer {
    _object: gdjs.CustomRuntimeObject;
    _instanceContainer: gdjs.CustomRuntimeObjectInstanceContainer;
    _pixiContainer: PIXI.Container;
    _threeGroup: THREE.Group | null;
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
      if (typeof THREE !== 'undefined') {
        this._threeGroup = new THREE.Group();
        this._threeGroup.rotation.order = 'ZYX';
      } else {
        this._threeGroup = null;
      }
      this._debugDrawRenderedObjectsPoints = {};

      // Contains the layers of the scene (and, optionally, debug PIXI objects).
      this._pixiContainer.sortableChildren = true;
      this._debugDraw = null;

      const layer = parent.getLayer('');
      if (layer) {
        layer
          .getRenderer()
          .addRendererObject(this._pixiContainer, object.getZOrder());
        if (this._threeGroup) {
          layer.getRenderer().add3DRendererObject(this._threeGroup);
        }
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
        if (this._threeGroup) {
          layer.getRenderer().add3DRendererObject(this._threeGroup);
        }
      }
    }

    getRendererObject() {
      return this._pixiContainer;
    }

    get3DRendererObject(): THREE.Object3D | null {
      return this._threeGroup;
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

    _updateThreeGroup() {
      if (!this._threeGroup) return;

      const pivotX = this._object.getUnscaledCenterX();
      const pivotY = this._object.getUnscaledCenterY();
      const scaleX = this._object.getScaleX();
      const scaleY = this._object.getScaleY();

      // TODO (3D): fix the pivot point for custom objects.
      this._threeGroup.position.x =
        this._object.getX() + pivotX * Math.abs(scaleX);
      this._threeGroup.position.y =
        this._object.getY() + pivotY * Math.abs(scaleY);

      this._threeGroup.rotation.z = gdjs.toRad(this._object.angle);
      this._threeGroup.scale.x = scaleX;
      this._threeGroup.scale.y = scaleY;
      this._threeGroup.visible = !this._object.hidden;
    }

    /**
     * Call this to make sure the sprite is ready to be rendered.
     */
    ensureUpToDate() {
      if (this._isContainerDirty) {
        this._updatePIXIContainer();
        this._updateThreeGroup();
      }
    }

    update(): void {
      this._isContainerDirty = true;
    }

    updateX(): void {
      const scaleX = this._object.getScaleX();
      this._pixiContainer.position.x =
        this._object.x + this._pixiContainer.pivot.x * Math.abs(scaleX);

      if (this._threeGroup)
        this._threeGroup.position.x =
          this._object.getX() +
          /*this._threeGroup.pivot.x*/ 0.5 * Math.abs(scaleX);
    }

    updateY(): void {
      const scaleY = this._object.getScaleY();
      this._pixiContainer.position.y =
        this._object.y + this._pixiContainer.pivot.y * Math.abs(scaleY);

      if (this._threeGroup)
        this._threeGroup.position.y =
          this._object.getY() +
          /*this._threeGroup.pivot.y*/ 0.5 * Math.abs(scaleY);
    }

    updateAngle(): void {
      this._pixiContainer.rotation = gdjs.toRad(this._object.angle);
      if (this._threeGroup)
        this._threeGroup.rotation.z = gdjs.toRad(this._object.angle);
    }

    updateOpacity(): void {
      const opacity = this._object.getOpacity();
      this._pixiContainer.alpha = opacity / 255;
    }

    updateVisibility(): void {
      this._pixiContainer.visible = !this._object.hidden;
      if (this._threeGroup) this._threeGroup.visible = !this._object.hidden;
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
  }

  // Register the class to let the engine use it.
  export type CustomObjectRenderer = gdjs.CustomObjectPixiRenderer;
  export const CustomObjectRenderer = gdjs.CustomObjectPixiRenderer;
}
