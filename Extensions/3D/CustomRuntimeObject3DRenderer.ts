namespace gdjs {
  export interface PixiImageManager {
    _threeAnimationFrameTextureManager: ThreeAnimationFrameTextureManager;
  }
  /**
   * The renderer for a {@link gdjs.CustomRuntimeObject3D} using Three.js.
   * @category Renderers > Custom Object 3D
   */
  export class CustomRuntimeObject3DRenderer
    implements gdjs.RuntimeInstanceContainerRenderer
  {
    _object: gdjs.CustomRuntimeObject3D;
    _instanceContainer: gdjs.CustomRuntimeObjectInstanceContainer;
    _isContainerDirty: boolean = true;
    _threeGroup: THREE.Group;
    private _basis: Basis | null = null;
    private static matrix4: THREE.Matrix4 | null = null;

    constructor(
      object: gdjs.CustomRuntimeObject3D,
      instanceContainer: gdjs.CustomRuntimeObjectInstanceContainer,
      parent: gdjs.RuntimeInstanceContainer
    ) {
      this._object = object;
      this._instanceContainer = instanceContainer;

      this._threeGroup = new THREE.Group();
      this._threeGroup.rotation.order = 'ZYX';
      //@ts-ignore
      this._threeGroup.gdjsRuntimeObject = object;

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
      this._threeGroup.clear();
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
      if (this._basis) {
        this._basis.isDirty = true;
      }
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

    getForwardX(): float {
      return this.getBasis().forwardX;
    }

    getForwardY(): float {
      return this.getBasis().forwardY;
    }

    getForwardZ(): float {
      return this.getBasis().forwardZ;
    }

    getUpX(): float {
      return this.getBasis().upX;
    }

    getUpY(): float {
      return this.getBasis().upY;
    }

    getUpZ(): float {
      return this.getBasis().upZ;
    }

    getRightX(): float {
      return this.getBasis().rightX;
    }

    getRightY(): float {
      return this.getBasis().rightY;
    }

    getRightZ(): float {
      return this.getBasis().rightZ;
    }

    private getBasis(): Basis {
      if (!this._basis) {
        this._basis = new Basis();
      }
      if (!this._basis.isDirty) {
        return this._basis;
      }

      const threeObject3D = this.get3DRendererObject();
      // Make sure the rotation is up to date.
      threeObject3D.rotation.set(
        gdjs.toRad(this._object.getRotationX()),
        gdjs.toRad(this._object.getRotationY()),
        gdjs.toRad(this._object.angle)
      );

      let rotationMatrix = gdjs.CustomRuntimeObject3DRenderer.matrix4;
      if (!rotationMatrix) {
        rotationMatrix = new THREE.Matrix4();
        gdjs.CustomRuntimeObject3DRenderer.matrix4 = rotationMatrix;
      }
      rotationMatrix.makeRotationFromEuler(threeObject3D.rotation);
      const elements = rotationMatrix.elements;

      this._basis.forwardX = elements[0];
      this._basis.forwardY = elements[1];
      this._basis.forwardZ = elements[2];

      this._basis.rightX = -elements[4];
      this._basis.rightY = -elements[5];
      this._basis.rightZ = -elements[6];

      this._basis.upX = elements[8];
      this._basis.upY = elements[9];
      this._basis.upZ = elements[10];

      return this._basis;
    }

    static getAnimationFrameTextureManager(
      imageManager: gdjs.PixiImageManager
    ): ThreeAnimationFrameTextureManager {
      if (!imageManager._threeAnimationFrameTextureManager) {
        imageManager._threeAnimationFrameTextureManager =
          new ThreeAnimationFrameTextureManager(imageManager);
      }
      return imageManager._threeAnimationFrameTextureManager;
    }
  }

  class ThreeAnimationFrameTextureManager
    implements gdjs.AnimationFrameTextureManager<THREE.Material>
  {
    private _imageManager: gdjs.PixiImageManager;

    constructor(imageManager: gdjs.PixiImageManager) {
      this._imageManager = imageManager;
    }

    getAnimationFrameTexture(imageName: string) {
      return this._imageManager.getThreeMaterial(imageName, {
        useTransparentTexture: true,
        forceBasicMaterial: true,
        vertexColors: false,
      });
    }

    getAnimationFrameWidth(material: THREE.Material) {
      const map = (
        material as THREE.MeshBasicMaterial | THREE.MeshStandardMaterial
      ).map as THREE.Texture<HTMLImageElement>;
      return map ? map.image.width : 0;
    }

    getAnimationFrameHeight(material: THREE.Material) {
      const map = (
        material as THREE.MeshBasicMaterial | THREE.MeshStandardMaterial
      ).map as THREE.Texture<HTMLImageElement>;
      return map ? map.image.height : 0;
    }
  }

  class Basis {
    isDirty = true;
    forwardX: float = 0;
    forwardY: float = 0;
    forwardZ: float = 0;
    upX: float = 0;
    upY: float = 0;
    upZ: float = 0;
    rightX: float = 0;
    rightY: float = 0;
    rightZ: float = 0;
  }
}
