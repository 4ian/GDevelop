namespace gdjs {
  /** @category Renderers */
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
      //@ts-ignore
      this._threeObject3D.gdjsRuntimeObject = runtimeObject;

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
      this.invalidateRotation();
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

    invalidateRotation(): void {
      if (this._localBasis) {
        this._localBasis.isDirty = true;
      }
    }

    getForwardX(): float {
      return this.getLocalBasis().forwardX;
    }

    getForwardY(): float {
      return this.getLocalBasis().forwardY;
    }

    getForwardZ(): float {
      return this.getLocalBasis().forwardZ;
    }

    getUpX(): float {
      return this.getLocalBasis().upX;
    }

    getUpY(): float {
      return this.getLocalBasis().upY;
    }

    getUpZ(): float {
      return this.getLocalBasis().upZ;
    }

    getRightX(): float {
      return this.getLocalBasis().rightX;
    }

    getRightY(): float {
      return this.getLocalBasis().rightY;
    }

    getRightZ(): float {
      return this.getLocalBasis().rightZ;
    }

    private getLocalBasis(): LocalBasis {
      if (!this._localBasis) {
        this._localBasis = new LocalBasis();
      }
      if (!this._localBasis.isDirty) {
        return this._localBasis;
      }

      const rotationMatrix: THREE.Matrix4 = gdjs.staticObject(
        RuntimeObject3DRenderer.prototype.getLocalBasis
      ) as THREE.Matrix4;
      rotationMatrix.makeRotationFromEuler(this._threeObject3D.rotation);
      const elements = rotationMatrix.elements;

      this._localBasis.forwardX = elements[0];
      this._localBasis.forwardY = elements[1];
      this._localBasis.forwardZ = elements[2];

      this._localBasis.upX = elements[8];
      this._localBasis.upY = elements[9];
      this._localBasis.upZ = elements[10];

      this._localBasis.rightX = elements[-4];
      this._localBasis.rightY = elements[-5];
      this._localBasis.rightZ = elements[-6];

      return this._localBasis;
    }
  }

  class LocalBasis {
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
