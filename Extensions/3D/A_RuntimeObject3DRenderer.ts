namespace gdjs {
  export abstract class RuntimeObject3DRenderer {
    protected _object: gdjs.RuntimeObject3D;
    private _threeObject3D: THREE.Object3D;

    constructor(
      runtimeObject: gdjs.RuntimeObject3D,
      instanceContainer: gdjs.RuntimeInstanceContainer,
      threeObject3D: THREE.Object3D
    ) {
      this._object = runtimeObject;
      this._threeObject3D = threeObject3D;
      this._threeObject3D.rotation.order = 'ZYX';

      instanceContainer
        .getLayer('')
        .getRenderer()
        .add3DRendererObject(this._threeObject3D);
    }

    get3DRendererObject() {
      return this._threeObject3D;
    }

    updatePosition() {
      this._threeObject3D.position.set(
        this._object.getX() + this._object.getWidth() / 2,
        this._object.getY() + this._object.getHeight() / 2,
        this._object.getZ() + this._object.getDepth() / 2
      );
    }

    updateRotation() {
      this._threeObject3D.rotation.set(
        gdjs.toRad(this._object.getRotationX()),
        gdjs.toRad(this._object.getRotationY()),
        gdjs.toRad(this._object.angle)
      );
    }

    updateSize() {
      const object = this._object;
      this._threeObject3D.scale.set(
        object.isFlippedX() ? -object.getWidth() : object.getWidth(),
        object.isFlippedY() ? -object.getHeight() : object.getHeight(),
        object.isFlippedZ() ? -object.getDepth() : object.getDepth()
      );
      this.updatePosition();
    }

    updateVisibility() {
      this._threeObject3D.visible = !this._object.isHidden();
    }
  }
}
