namespace gdjs {
  export interface PixiImageManager {
    _threeAnimationFrameTextureManager: ThreeAnimationFrameTextureManager;
  }
  /**
   * The renderer for a {@link gdjs.CustomRuntimeObject3D} using Three.js.
   */
  export class CustomRuntimeObject3DRenderer
    implements gdjs.RuntimeInstanceContainerRenderer {
    _object: gdjs.CustomRuntimeObject3D;
    _instanceContainer: gdjs.CustomRuntimeObjectInstanceContainer;
    _isContainerDirty: boolean = true;
    _threeGroup: THREE.Group;

    constructor(
      object: gdjs.CustomRuntimeObject3D,
      instanceContainer: gdjs.CustomRuntimeObjectInstanceContainer,
      parent: gdjs.RuntimeInstanceContainer
    ) {
      this._object = object;
      this._instanceContainer = instanceContainer;

      this._threeGroup = new THREE.Group();
      this._threeGroup.rotation.order = 'ZYX';

      const layer = parent.getLayer('');
      if (layer) {
        layer.getRenderer().add3DRendererObject(this._threeGroup);
      }
    }

    get3DRendererObject(): THREE.Object3D {
      return this._threeGroup;
    }

    getRendererObject() {
      return null;
    }

    reinitialize(
      object: gdjs.CustomRuntimeObject3D,
      parent: gdjs.RuntimeInstanceContainer
    ) {
      this._object = object;
      this._isContainerDirty = true;
      const layer = parent.getLayer('');
      if (layer) {
        layer.getRenderer().add3DRendererObject(this._threeGroup);
      }
    }

    _updateThreeGroup() {
      const threeObject3D = this.get3DRendererObject();

      const scaleX = this._object.getScaleX();
      const scaleY = this._object.getScaleY();
      const scaleZ = this._object.getScaleZ();
      const pivotX = this._object.getUnscaledCenterX() * scaleX;
      const pivotY = this._object.getUnscaledCenterY() * scaleY;
      const pivotZ = this._object.getUnscaledCenterZ() * scaleZ;

      threeObject3D.rotation.set(
        gdjs.toRad(this._object.getRotationX()),
        gdjs.toRad(this._object.getRotationY()),
        gdjs.toRad(this._object.angle)
      );

      threeObject3D.position.set(
        this._object.isFlippedX() ? pivotX : -pivotX,
        this._object.isFlippedY() ? pivotY : -pivotY,
        this._object.isFlippedZ() ? pivotZ : -pivotZ
      );
      threeObject3D.position.applyEuler(threeObject3D.rotation);
      threeObject3D.position.x += this._object.getX() + pivotX;
      threeObject3D.position.y += this._object.getY() + pivotY;
      threeObject3D.position.z += this._object.getZ() + pivotZ;

      threeObject3D.scale.set(
        this._object.isFlippedX() ? -scaleX : scaleX,
        this._object.isFlippedY() ? -scaleY : scaleY,
        this._object.isFlippedZ() ? -scaleZ : scaleZ
      );

      threeObject3D.visible = !this._object.hidden;

      this._isContainerDirty = false;
    }

    /**
     * Call this to make sure the object is ready to be rendered.
     */
    ensureUpToDate() {
      if (this._isContainerDirty) {
        this._updateThreeGroup();
      }
    }

    update(): void {
      this._isContainerDirty = true;
    }

    updateX(): void {
      this._isContainerDirty = true;
    }

    updateY(): void {
      this._isContainerDirty = true;
    }

    updateAngle(): void {
      this._isContainerDirty = true;
    }

    updatePosition() {
      this._isContainerDirty = true;
    }

    updateRotation() {
      this._isContainerDirty = true;
    }

    updateSize() {
      this._isContainerDirty = true;
    }

    updateVisibility(): void {
      this._threeGroup.visible = !this._object.hidden;
    }

    updateOpacity(): void {
      // Opacity is not handled by 3D custom objects.
    }

    setLayerIndex(layer: gdjs.RuntimeLayer, index: float): void {
      // Layers are not handled for 3D custom objects.
    }

    static getAnimationFrameTextureManager(
      imageManager: gdjs.PixiImageManager
    ): ThreeAnimationFrameTextureManager {
      if (!imageManager._threeAnimationFrameTextureManager) {
        imageManager._threeAnimationFrameTextureManager = new ThreeAnimationFrameTextureManager(
          imageManager
        );
      }
      return imageManager._threeAnimationFrameTextureManager;
    }
  }

  class ThreeAnimationFrameTextureManager
    implements gdjs.AnimationFrameTextureManager<THREE.Material> {
    private _imageManager: gdjs.PixiImageManager;

    constructor(imageManager: gdjs.PixiImageManager) {
      this._imageManager = imageManager;
    }

    getAnimationFrameTexture(imageName: string) {
      return this._imageManager.getThreeMaterial(imageName, {
        useTransparentTexture: true,
        forceBasicMaterial: true,
      });
    }

    getAnimationFrameWidth(material: THREE.Material) {
      const map = (material as
        | THREE.MeshBasicMaterial
        | THREE.MeshStandardMaterial).map;
      return map ? map.image.width : 0;
    }

    getAnimationFrameHeight(material: THREE.Material) {
      const map = (material as
        | THREE.MeshBasicMaterial
        | THREE.MeshStandardMaterial).map;
      return map ? map.image.height : 0;
    }
  }
}
