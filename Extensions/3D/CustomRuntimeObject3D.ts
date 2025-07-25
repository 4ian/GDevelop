namespace gdjs {
  type CustomObject3DNetworkSyncDataType = CustomObjectNetworkSyncDataType & {
    z: float;
    d: float;
    rx: float;
    ry: float;
    ifz: boolean;
  };

  /**
   * Base class for 3D custom objects.
   */
  export class CustomRuntimeObject3D
    extends gdjs.CustomRuntimeObject
    implements gdjs.Base3DHandler
  {
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
    private _customCenterZ: float = 0;
    private static _temporaryVector = new THREE.Vector3();

    constructor(
      parent: gdjs.RuntimeInstanceContainer,
      objectData: gdjs.Object3DData & gdjs.CustomObjectConfiguration
    ) {
      super(parent, objectData);
    }

    protected override _createRender() {
      const parent = this._runtimeScene;
      return new gdjs.CustomRuntimeObject3DRenderer(
        this,
        this._instanceContainer,
        parent
      );
    }

    protected override _reinitializeRenderer(): void {
      this.getRenderer().reinitialize(this, this.getParent());
    }

    override getRenderer(): gdjs.CustomRuntimeObject3DRenderer {
      return super.getRenderer() as gdjs.CustomRuntimeObject3DRenderer;
    }

    override get3DRendererObject() {
      // It can't be null because Three.js is always loaded
      // when a custom 3D object is used.
      return this.getRenderer().get3DRendererObject()!;
    }

    override extraInitializationFromInitialInstance(
      initialInstanceData: InstanceData
    ) {
      super.extraInitializationFromInitialInstance(initialInstanceData);
      if (initialInstanceData.depth !== undefined) {
        this.setDepth(initialInstanceData.depth);
      }
      if (initialInstanceData.flippedX) {
        this.flipX(initialInstanceData.flippedX);
      }
      if (initialInstanceData.flippedY) {
        this.flipY(initialInstanceData.flippedY);
      }
      if (initialInstanceData.flippedZ) {
        this.flipZ(initialInstanceData.flippedZ);
      }
    }

    getNetworkSyncData(): CustomObject3DNetworkSyncDataType {
      return {
        ...super.getNetworkSyncData(),
        z: this.getZ(),
        d: this.getDepth(),
        rx: this.getRotationX(),
        ry: this.getRotationY(),
        ifz: this.isFlippedZ(),
      };
    }

    updateFromNetworkSyncData(
      networkSyncData: CustomObject3DNetworkSyncDataType
    ): void {
      super.updateFromNetworkSyncData(networkSyncData);
      if (networkSyncData.z !== undefined) this.setZ(networkSyncData.z);
      if (networkSyncData.d !== undefined) this.setDepth(networkSyncData.d);
      if (networkSyncData.rx !== undefined)
        this.setRotationX(networkSyncData.rx);
      if (networkSyncData.ry !== undefined)
        this.setRotationY(networkSyncData.ry);
      if (networkSyncData.ifz !== undefined) this.flipZ(networkSyncData.ifz);
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
      let minZ = 0;
      if (this._innerArea) {
        minZ = this._innerArea.min[2];
      } else {
        if (this._isUntransformedHitBoxesDirty) {
          this._updateUntransformedHitBoxes();
        }
        minZ = this._minZ;
      }
      const absScaleZ = this.getScaleZ();
      if (!this._flippedZ) {
        return this._z + minZ * absScaleZ;
      } else {
        return (
          this._z +
          (-minZ - this.getUnscaledDepth() + 2 * this.getUnscaledCenterZ()) *
            absScaleZ
        );
      }
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
     * Return the bottom Z of the object.
     * Rotations around X and Y are not taken into account.
     */
    getUnrotatedAABBMinZ(): number {
      return this.getDrawableZ();
    }

    /**
     * Return the top Z of the object.
     * Rotations around X and Y are not taken into account.
     */
    getUnrotatedAABBMaxZ(): number {
      return this.getDrawableZ() + this.getDepth();
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
     * @return the internal top bound of the object according to its children.
     */
    getInnerAreaMinZ(): number {
      if (this._innerArea) {
        return this._innerArea.min[2];
      }
      if (this._isUntransformedHitBoxesDirty) {
        this._updateUntransformedHitBoxes();
      }
      return this._minZ;
    }

    /**
     * @return the internal bottom bound of the object according to its children.
     */
    getInnerAreaMaxZ(): number {
      if (this._innerArea) {
        return this._innerArea.max[2];
      }
      if (this._isUntransformedHitBoxesDirty) {
        this._updateUntransformedHitBoxes();
      }
      return this._maxZ;
    }

    /**
     * @return the internal width of the object according to its children.
     */
    getUnscaledDepth(): float {
      if (this._innerArea) {
        return this._innerArea.max[2] - this._innerArea.min[2];
      }
      if (this._isUntransformedHitBoxesDirty) {
        this._updateUntransformedHitBoxes();
      }
      return this._maxZ - this._minZ;
    }

    override _updateUntransformedHitBoxes(): void {
      super._updateUntransformedHitBoxes();

      let minZ = Number.MAX_VALUE;
      let maxZ = -Number.MAX_VALUE;
      for (const childInstance of this._instanceContainer.getAdhocListOfAllInstances()) {
        if (!childInstance.isIncludedInParentCollisionMask()) {
          continue;
        }
        if (!gdjs.Base3DHandler.is3D(childInstance)) {
          continue;
        }
        minZ = Math.min(minZ, childInstance.getUnrotatedAABBMinZ());
        maxZ = Math.max(maxZ, childInstance.getUnrotatedAABBMaxZ());
      }
      if (minZ === Number.MAX_VALUE) {
        // The unscaled size can't be 0 because setWidth and setHeight wouldn't
        // have any effect.
        minZ = 0;
        maxZ = 1;
      }
      this._minZ = minZ;
      this._maxZ = maxZ;
    }

    /**
     * @returns the center Z from the local origin (0;0).
     */
    getUnscaledCenterZ(): float {
      if (this.hasCustomRotationCenter()) {
        return this._customCenterZ;
      }
      if (this._innerArea) {
        return (this._innerArea.min[2] + this._innerArea.max[2]) / 2;
      }
      if (this._isUntransformedHitBoxesDirty) {
        this._updateUntransformedHitBoxes();
      }
      return (this._minZ + this._maxZ) / 2;
    }

    /**
     * The center of rotation is defined relatively to the origin (the object
     * position).
     * This avoids the center to move when children push the bounds.
     *
     * When no custom center is defined, it will move
     * to stay at the center of the children bounds.
     *
     * @param x coordinate of the custom center
     * @param y coordinate of the custom center
     */
    setRotationCenter3D(x: float, y: float, z: float) {
      this._customCenterZ = z;
      this.setRotationCenter(x, y);
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
      if (unscaledDepth === 0) {
        return;
      }
      const scaleZ = depth / unscaledDepth;
      if (this._innerArea && this._isInnerAreaFollowingParentSize) {
        this._innerArea.min[2] *= scaleZ;
        this._innerArea.max[2] *= scaleZ;
      } else {
        this.setScaleZ(scaleZ);
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
      if (this._innerArea && this._isInnerAreaFollowingParentSize) {
        // The scale is always 1;
        return;
      }
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
