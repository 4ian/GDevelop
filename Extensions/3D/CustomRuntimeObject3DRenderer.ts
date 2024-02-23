namespace gdjs {
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

      const pivotX = this._object.getUnscaledCenterX();
      const pivotY = this._object.getUnscaledCenterY();
      const pivotZ = this._object.getUnscaledCenterZ();
      const scaleX = this._object.getScaleX();
      const scaleY = this._object.getScaleY();
      const scaleZ = this._object.getScaleZ();

      threeObject3D.rotation.set(
        gdjs.toRad(this._object.getRotationX()),
        gdjs.toRad(this._object.getRotationY()),
        gdjs.toRad(this._object.angle)
      );

      // TODO does it work with scaling and flipping?
      threeObject3D.position.set(-pivotX, -pivotY, -pivotZ);
      threeObject3D.position.applyEuler(threeObject3D.rotation);
      threeObject3D.position.x += this._object.getX() + pivotX;
      threeObject3D.position.y += this._object.getY() + pivotY;
      threeObject3D.position.z += this._object.getZ() + pivotZ;

      threeObject3D.scale.set(scaleX, scaleY, scaleZ);

      threeObject3D.visible = !this._object.hidden;

      this._isContainerDirty = true;
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
  }
}
