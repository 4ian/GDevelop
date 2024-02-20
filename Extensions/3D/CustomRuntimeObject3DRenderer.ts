namespace gdjs {
  export class CustomRuntimeObject3DRenderer extends gdjs.CustomObjectRenderer {
    _object: gdjs.CustomRuntimeObject3D;

    constructor(
      object: gdjs.CustomRuntimeObject3D,
      instanceContainer: gdjs.CustomRuntimeObjectInstanceContainer,
      parent: gdjs.RuntimeInstanceContainer
    ) {
      super(object, instanceContainer, parent);
      this._object = object;
    }

    updatePosition() {
      const threeObject3D = this.get3DRendererObject();
      if (!threeObject3D) {
        return;
      }
      threeObject3D.position.set(
        this._object.x + this._object.getWidth() / 2,
        this._object.y + this._object.getHeight() / 2,
        this._object.getZ() + this._object.getDepth() / 2
      );
    }

    updateRotation() {
      const threeObject3D = this.get3DRendererObject();
      if (!threeObject3D) {
        return;
      }
      threeObject3D.rotation.set(
        gdjs.toRad(this._object.getRotationX()),
        gdjs.toRad(this._object.getRotationY()),
        gdjs.toRad(this._object.angle)
      );
    }

    updateSize() {
      const threeObject3D = this.get3DRendererObject();
      if (!threeObject3D) {
        return;
      }
      const object = this._object;
      threeObject3D.scale.set(
        object.isFlippedX() ? -object.getWidth() : object.getWidth(),
        object.isFlippedY() ? -object.getHeight() : object.getHeight(),
        object.isFlippedZ() ? -object.getDepth() : object.getDepth()
      );
      this.updatePosition();
    }

    updateVisibility() {
      const threeObject3D = this.get3DRendererObject();
      if (!threeObject3D) {
        return;
      }
      threeObject3D.visible = !this._object.isHidden();
    }
  }
}
