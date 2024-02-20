namespace gdjs {
  export interface Object3DDataContent {
    width: float;
    height: float;
    depth: float;
  }
  /** Base parameters for {@link gdjs.RuntimeObject3D} */
  export interface Object3DData extends ObjectData {
    /** The base parameters of the RuntimeObject3D */
    content: Object3DDataContent;
  }

  /**
   * Base class for 3D custom objects.
   */
  export class CustomRuntimeObject3D
    extends gdjs.CustomRuntimeObject
    implements
      gdjs.Resizable,
      gdjs.Scalable,
      gdjs.Flippable,
      gdjs.Base3DHandler {
    /**
     * Position on the Z axis.
     */
    private _z: float = 0;
    private _minZ: float = 0;
    private _maxZ: float = 0;
    private _scaleZ: float = 1;
    private _flippedZ: boolean = false;
    /**
     * Euler angle with the `ZYX` order.
     *
     * Note that `_rotationZ` is `angle` from `gdjs.RuntimeObject`.
     */
    private _rotationX: float = 0;
    /**
     * Euler angle with the `ZYX` order.
     *
     * Note that `_rotationZ` is `angle` from `gdjs.RuntimeObject`.
     */
    private _rotationY: float = 0;
    private static _temporaryVector = new THREE.Vector3();

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      objectData: Object3DData & CustomObjectConfiguration
    ) {
      super(instanceContainer, objectData);
      this.setRotationCenter(0, 0);
    }

    protected _createRender() {
      const parent = this._runtimeScene;
      return new gdjs.CustomRuntimeObject3DRenderer(
        this,
        this._instanceContainer,
        parent
      );
    }

    getRenderer(): gdjs.CustomRuntimeObject3DRenderer {
      return super.getRenderer() as gdjs.CustomRuntimeObject3DRenderer;
    }

    get3DRendererObject() {
      // It can't be null because Three.js is always loaded
      // when a custom 3D object is used.
      return this.getRenderer().get3DRendererObject()!;
    }

    updateFromObjectData(
      oldObjectData: Object3DData,
      newObjectData: Object3DData
    ): boolean {
      return true;
    }

    extraInitializationFromInitialInstance(initialInstanceData: InstanceData) {
      if (initialInstanceData.customSize) {
        this.setWidth(initialInstanceData.width);
        this.setHeight(initialInstanceData.height);
      }
      if (initialInstanceData.depth !== undefined)
        this.setDepth(initialInstanceData.depth);
    }

    /**
     * Set the object position on the Z axis.
     */
    setZ(z: float): void {
      if (z === this._z) return;
      this._z = z;
      this.getRenderer().updatePosition();
    }

    /**
     * Get the object position on the Z axis.
     */
    getZ(): float {
      return this._z;
    }

    /**
     * Get the Z position of the rendered object.
     *
     * For most objects, this will returns the same value as getZ(). But if the
     * object has an origin that is not the same as the point (0,0,0) of the
     * object displayed, getDrawableZ will differ.
     *
     * @return The Z position of the rendered object.
     */
    getDrawableZ(): float {
      return this.getZ();
    }

    /**
     * Return the Z position of the object center, **relative to the object Z
     * position** (`getDrawableX`).
     *
     * Use `getCenterZInScene` to get the position of the center in the scene.
     *
     * @return the Z position of the object center, relative to
     * `getDrawableZ()`.
     */
    getCenterZ(): float {
      return this.getDepth() / 2;
    }

    getCenterZInScene(): float {
      return this.getDrawableZ() + this.getCenterZ();
    }

    setCenterZInScene(z: float): void {
      this.setZ(z + this._z - (this.getDrawableZ() + this.getCenterZ()));
    }

    /**
     * Set the object rotation on the X axis.
     *
     * This is an Euler angle. Objects use the `ZYX` order.
     */
    setRotationX(angle: float): void {
      this._rotationX = angle;
      this.getRenderer().updateRotation();
    }

    /**
     * Set the object rotation on the Y axis.
     *
     * This is an Euler angle. Objects use the `ZYX` order.
     */
    setRotationY(angle: float): void {
      this._rotationY = angle;
      this.getRenderer().updateRotation();
    }

    /**
     * Get the object rotation on the X axis.
     *
     * This is an Euler angle. Objects use the `ZYX` order.
     */
    getRotationX(): float {
      return this._rotationX;
    }

    /**
     * Get the object rotation on the Y axis.
     *
     * This is an Euler angle. Objects use the `ZYX` order.
     */
    getRotationY(): float {
      return this._rotationY;
    }

    /**
     * Turn the object around the scene x axis at its center.
     * @param deltaAngle the rotation angle
     */
    turnAroundX(deltaAngle: float): void {
      const axisX = gdjs.CustomRuntimeObject3D._temporaryVector;
      axisX.set(1, 0, 0);

      const mesh = this.get3DRendererObject();
      mesh.rotateOnWorldAxis(axisX, gdjs.toRad(deltaAngle));
      this._rotationX = gdjs.toDegrees(mesh.rotation.x);
      this._rotationY = gdjs.toDegrees(mesh.rotation.y);
      this.setAngle(gdjs.toDegrees(mesh.rotation.z));
    }

    /**
     * Turn the object around the scene y axis at its center.
     * @param deltaAngle the rotation angle
     */
    turnAroundY(deltaAngle: float): void {
      const axisY = gdjs.CustomRuntimeObject3D._temporaryVector;
      axisY.set(0, 1, 0);

      const mesh = this.get3DRendererObject();
      mesh.rotateOnWorldAxis(axisY, gdjs.toRad(deltaAngle));
      this._rotationX = gdjs.toDegrees(mesh.rotation.x);
      this._rotationY = gdjs.toDegrees(mesh.rotation.y);
      this.setAngle(gdjs.toDegrees(mesh.rotation.z));
    }

    /**
     * Turn the object around the scene z axis at its center.
     * @param deltaAngle the rotation angle
     */
    turnAroundZ(deltaAngle: float): void {
      const axisZ = gdjs.CustomRuntimeObject3D._temporaryVector;
      axisZ.set(0, 0, 1);

      const mesh = this.get3DRendererObject();
      mesh.rotateOnWorldAxis(axisZ, gdjs.toRad(deltaAngle));
      this._rotationX = gdjs.toDegrees(mesh.rotation.x);
      this._rotationY = gdjs.toDegrees(mesh.rotation.y);
      this.setAngle(gdjs.toDegrees(mesh.rotation.z));
    }

    /**
     * @return the internal width of the object according to its children.
     */
    getUnscaledDepth(): float {
      if (this._isUntransformedHitBoxesDirty) {
        this._updateUntransformedHitBoxes();
      }
      return this._maxZ - this._minZ;
    }

    _updateUntransformedHitBoxes(): void {
      super._updateUntransformedHitBoxes();

      if (this._instanceContainer.getAdhocListOfAllInstances().length === 0) {
        this._minZ = 0;
        this._maxZ = 0;
      } else {
        let minZ = Number.MAX_VALUE;
        let maxZ = -Number.MAX_VALUE;
        for (const childInstance of this._instanceContainer.getAdhocListOfAllInstances()) {
          if (!childInstance.isIncludedInParentCollisionMask()) {
            continue;
          }
          if (!(childInstance instanceof gdjs.RuntimeObject3D)) {
            continue;
          }
          minZ = Math.min(minZ, childInstance.getAABBMinZ());
          maxZ = Math.max(maxZ, childInstance.getAABBMaxZ());
        }
        this._minZ = minZ;
        this._maxZ = maxZ;
      }
    }

    /**
     * @returns the center X from the local origin (0;0).
     */
    getUnscaledCenterZ(): float {
      return 0;
    }

    /**
     * Get the object size on the Z axis (called "depth").
     */
    getDepth(): float {
      return this.getUnscaledDepth() * this.getScaleZ();
    }

    /**
     * Set the object size on the Z axis (called "depth").
     */
    setDepth(depth: float): void {
      const unscaledDepth = this.getUnscaledDepth();
      if (unscaledDepth !== 0) {
        this.setScaleX(depth / unscaledDepth);
      }
    }

    /**
     * Change the scale on X, Y and Z axis of the object.
     *
     * @param newScale The new scale (must be greater than 0).
     */
    setScale(newScale: number): void {
      super.setScale(newScale);
      this.setScaleZ(newScale);
    }

    /**
     * Change the scale on Z axis of the object (changing its height).
     *
     * @param newScale The new scale (must be greater than 0).
     */
    setScaleZ(newScale: number): void {
      if (newScale < 0) {
        newScale = 0;
      }
      if (newScale === Math.abs(this._scaleZ)) {
        return;
      }
      this._scaleZ = newScale * (this._flippedZ ? -1 : 1);
      this.getRenderer().updateSize();
    }

    /**
     * Get the scale of the object (or the geometric average of X, Y and Z scale in case they are different).
     *
     * @return the scale of the object (or the geometric average of X, Y and Z scale in case they are different).
     */
    getScale(): number {
      const scaleX = this.getScaleX();
      const scaleY = this.getScaleY();
      const scaleZ = this.getScaleZ();
      return scaleX === scaleY && scaleX === scaleZ
        ? scaleX
        : Math.pow(scaleX * scaleY * scaleZ, 1 / 3);
    }

    /**
     * Get the scale of the object on Z axis.
     *
     * @return the scale of the object on Z axis
     */
    getScaleZ(): float {
      return Math.abs(this._scaleZ);
    }

    flipZ(enable: boolean) {
      if (enable === this._flippedZ) {
        return;
      }
      this._flippedZ = enable;
      this.getRenderer().updateSize();
    }

    isFlippedZ(): boolean {
      return this._flippedZ;
    }
  }
}
