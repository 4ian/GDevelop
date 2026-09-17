namespace gdjs {
  type CustomObject3DNetworkSyncDataType = {
    z: float;
    d: float;
    rx: float;
    ry: float;
    ifz: boolean;
    ccz: float;
  };

  type CustomObject3DNetworkSyncData = CustomObjectNetworkSyncData &
    CustomObject3DNetworkSyncDataType;

  /**
   * Base class for 3D custom objects.
   * @category Objects > Custom Object 3D
   */
  export class CustomRuntimeObject3D
    extends gdjs.CustomRuntimeObject
    implements gdjs.AbstractRuntimeObject3D
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
    /**
     * Where this object puts a point of its inside (the space its children
     * live in) in the space containing it: scales and flips, the Euler
     * rotation in the `ZYX` order around the center of rotation, and the
     * position of the object.
     *
     * The renderer composes the same transformation for its THREE group
     * (`gdjs.CustomRuntimeObject3DRenderer._updateThreeGroup`), which is what
     * the game shows: a test compares the two on every kind of object.
     */
    private _localTransformation3D = new THREE.Matrix4();
    private _computedTransformation3DRevision: integer = 0;
    private static _temporaryVector = new THREE.Vector3();
    private static _temporaryScale = new THREE.Vector3();
    private static _temporaryEuler = new THREE.Euler(0, 0, 0, 'ZYX');
    private static _temporaryQuaternion = new THREE.Quaternion();
    private static _temporaryConversionVector = new THREE.Vector3();
    private static _temporaryTurnQuaternion = new THREE.Quaternion();

    private _hasEstimatedVelocity = false;
    private _estimatedVelocityX: float = 0;
    private _estimatedVelocityY: float = 0;
    private _estimatedVelocityZ: float = 0;

    constructor(
      parent: gdjs.RuntimeInstanceContainer,
      objectData: gdjs.Object3DData & gdjs.CustomObjectConfiguration,
      instanceData?: InstanceData
    ) {
      super(parent, objectData, instanceData);
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
      this.flipX(!!initialInstanceData.flippedX);
      this.flipY(!!initialInstanceData.flippedY);
      this.flipZ(!!initialInstanceData.flippedZ);
    }

    getNetworkSyncData(
      syncOptions: GetNetworkSyncDataOptions
    ): CustomObject3DNetworkSyncData {
      return {
        ...super.getNetworkSyncData(syncOptions),
        z: this.getZ(),
        d: this.getDepth(),
        rx: this.getRotationX(),
        ry: this.getRotationY(),
        ifz: this.isFlippedZ(),
        ccz: this._customCenterZ,
      };
    }

    updateFromNetworkSyncData(
      networkSyncData: CustomObject3DNetworkSyncData,
      options: UpdateFromNetworkSyncDataOptions
    ): void {
      super.updateFromNetworkSyncData(networkSyncData, options);
      if (networkSyncData.z !== undefined) this.setZ(networkSyncData.z);
      if (networkSyncData.d !== undefined) this.setDepth(networkSyncData.d);
      if (networkSyncData.rx !== undefined)
        this.setRotationX(networkSyncData.rx);
      if (networkSyncData.ry !== undefined)
        this.setRotationY(networkSyncData.ry);
      if (networkSyncData.ifz !== undefined) this.flipZ(networkSyncData.ifz);
      if (networkSyncData.ccz !== undefined) {
        this._customCenterZ = networkSyncData.ccz;
        this.invalidateTransformation();
      }
    }

    /**
     * Set the object position on the Z axis.
     */
    setZ(z: float): void {
      if (z === this._z) return;
      this._z = z;
      this.invalidateTransformation();
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
      const minZ = this.getUnscaledMinZ();
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

    private getUnscaledMinZ(): float {
      if (this._innerArea) {
        return this._innerArea.min[2];
      } else {
        if (this._isUntransformedHitBoxesDirty) {
          this._updateUntransformedHitBoxes();
        }
        return this._minZ;
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
      return (
        (this.getUnscaledCenterZ() - this.getUnscaledMinZ()) * this.getScaleZ()
      );
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
      this.invalidateTransformation();
      this.getRenderer().updateRotation();
    }

    /**
     * Set the object rotation on the Y axis.
     *
     * This is an Euler angle. Objects use the `ZYX` order.
     */
    setRotationY(angle: float): void {
      this._rotationY = angle;
      this.invalidateTransformation();
      this.getRenderer().updateRotation();
    }

    /** The orientation of the object, as the `ZYX` Euler angles it is made of. */
    private _getRotation(): THREE.Euler {
      return gdjs.CustomRuntimeObject3D._temporaryEuler.set(
        gdjs.toRad(this._rotationX),
        gdjs.toRad(this._rotationY),
        gdjs.toRad(this.angle)
      );
    }

    /**
     * The transformation of the object, recomputed from what it is made of
     * when any of them changed (see
     * {@link gdjs.CustomRuntimeObject.invalidateTransformation}).
     */
    getLocalTransformation3D(): THREE.Matrix4 {
      if (
        this._computedTransformation3DRevision !== this._transformationRevision
      ) {
        this._updateLocalTransformation3D();
      }
      return this._localTransformation3D;
    }

    private _updateLocalTransformation3D(): void {
      const scaleX = this.getScaleX();
      const scaleY = this.getScaleY();
      const scaleZ = this.getScaleZ();
      const pivotX = this.getUnscaledCenterX() * scaleX;
      const pivotY = this.getUnscaledCenterY() * scaleY;
      const pivotZ = this.getUnscaledCenterZ() * scaleZ;

      const rotation = this._getRotation();
      // The object turns around its center of rotation, which the position
      // of the transformation puts back where it was.
      const position = gdjs.CustomRuntimeObject3D._temporaryVector
        .set(
          this.isFlippedX() ? pivotX : -pivotX,
          this.isFlippedY() ? pivotY : -pivotY,
          this.isFlippedZ() ? pivotZ : -pivotZ
        )
        .applyEuler(rotation);
      position.x += this.getX() + pivotX;
      position.y += this.getY() + pivotY;
      position.z += this.getZ() + pivotZ;

      this._localTransformation3D.compose(
        position,
        gdjs.CustomRuntimeObject3D._temporaryQuaternion.setFromEuler(rotation),
        gdjs.CustomRuntimeObject3D._temporaryScale.set(
          this.isFlippedX() ? -scaleX : scaleX,
          this.isFlippedY() ? -scaleY : scaleY,
          this.isFlippedZ() ? -scaleZ : scaleZ
        )
      );
      this._computedTransformation3DRevision = this._transformationRevision;
    }

    /**
     * A point of the inside of this object (the space its children live in),
     * in the space containing this object - the scene when this object is in
     * one, the custom object holding it otherwise. The boundary of one object
     * is crossed.
     */
    private _applyTransformation3D(
      x: float,
      y: float,
      z: float,
      destination: THREE.Vector3
    ): THREE.Vector3 {
      return destination
        .set(x, y, z)
        .applyMatrix4(this.getLocalTransformation3D());
    }

    /**
     * The other way round of {@link _applyTransformation3D}.
     *
     * A scale of 0 collapses the object on an axis: every point of the space
     * containing it has the same place inside it on that axis, so 0 answers
     * for all of them - the closest point the object can reach. Nothing is
     * ever divided by zero.
     */
    private _applyInverseTransformation3D(
      x: float,
      y: float,
      z: float,
      destination: THREE.Vector3
    ): THREE.Vector3 {
      const transformation = this.getLocalTransformation3D();
      const position =
        gdjs.CustomRuntimeObject3D._temporaryVector.setFromMatrixPosition(
          transformation
        );
      const rotation = gdjs.CustomRuntimeObject3D._temporaryQuaternion
        .setFromEuler(this._getRotation())
        .conjugate();
      destination
        .set(x - position.x, y - position.y, z - position.z)
        .applyQuaternion(rotation);

      const scales = [this.getScaleX(), this.getScaleY(), this.getScaleZ()];
      const flips = [this.isFlippedX(), this.isFlippedY(), this.isFlippedZ()];
      for (let axis = 0; axis < 3; axis++) {
        const scale = scales[axis];
        destination.setComponent(
          axis,
          scale === 0
            ? 0
            : destination.getComponent(axis) / (flips[axis] ? -scale : scale)
        );
      }
      return destination;
    }

    override toParentX(x: float, y: float, z: float = 0): float {
      return this._applyTransformation3D(
        x,
        y,
        z,
        gdjs.CustomRuntimeObject3D._temporaryConversionVector
      ).x;
    }

    override toParentY(x: float, y: float, z: float = 0): float {
      return this._applyTransformation3D(
        x,
        y,
        z,
        gdjs.CustomRuntimeObject3D._temporaryConversionVector
      ).y;
    }

    /** The Z of {@link gdjs.CustomRuntimeObject3D.toParentX}. */
    toParentZ(x: float, y: float, z: float = 0): float {
      return this._applyTransformation3D(
        x,
        y,
        z,
        gdjs.CustomRuntimeObject3D._temporaryConversionVector
      ).z;
    }

    override fromParentX(x: float, y: float, z: float = 0): float {
      return this._applyInverseTransformation3D(
        x,
        y,
        z,
        gdjs.CustomRuntimeObject3D._temporaryConversionVector
      ).x;
    }

    override fromParentY(x: float, y: float, z: float = 0): float {
      return this._applyInverseTransformation3D(
        x,
        y,
        z,
        gdjs.CustomRuntimeObject3D._temporaryConversionVector
      ).y;
    }

    /** The Z of {@link gdjs.CustomRuntimeObject3D.fromParentX}. */
    fromParentZ(x: float, y: float, z: float = 0): float {
      return this._applyInverseTransformation3D(
        x,
        y,
        z,
        gdjs.CustomRuntimeObject3D._temporaryConversionVector
      ).z;
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
      this._turnAroundAxis(1, 0, 0, deltaAngle);
    }

    /**
     * Turn the object around the scene y axis at its center.
     * @param deltaAngle the rotation angle
     */
    turnAroundY(deltaAngle: float): void {
      this._turnAroundAxis(0, 1, 0, deltaAngle);
    }

    /**
     * Turn the object around the scene z axis at its center.
     * @param deltaAngle the rotation angle
     */
    turnAroundZ(deltaAngle: float): void {
      this._turnAroundAxis(0, 0, 1, deltaAngle);
    }

    /**
     * Turn the object around an axis of the scene, from the orientation it
     * holds - not from the one the renderer last drew, which is behind by
     * every rotation made since (a `setRotationX` followed by a `turnAroundY`
     * in the same frame used to lose the first one).
     */
    private _turnAroundAxis(
      axisX: float,
      axisY: float,
      axisZ: float,
      deltaAngle: float
    ): void {
      const rotation =
        gdjs.CustomRuntimeObject3D._temporaryQuaternion.setFromEuler(
          this._getRotation()
        );
      // The axis is one of the scene: the turn is applied to the orientation
      // of the object, not composed with it in its own space.
      rotation.premultiply(
        gdjs.CustomRuntimeObject3D._temporaryTurnQuaternion.setFromAxisAngle(
          gdjs.CustomRuntimeObject3D._temporaryVector.set(axisX, axisY, axisZ),
          gdjs.toRad(deltaAngle)
        )
      );
      const turnedRotation =
        gdjs.CustomRuntimeObject3D._temporaryEuler.setFromQuaternion(
          rotation,
          'ZYX'
        );
      this._rotationX = gdjs.toDegrees(turnedRotation.x);
      this._rotationY = gdjs.toDegrees(turnedRotation.y);
      this.setAngle(gdjs.toDegrees(turnedRotation.z));
      this.invalidateTransformation();
      this.getRenderer().updateRotation();
    }

    getForwardX(): float {
      return this.getRenderer().getForwardX();
    }

    getForwardY(): float {
      return this.getRenderer().getForwardY();
    }

    getForwardZ(): float {
      return this.getRenderer().getForwardZ();
    }

    getUpX(): float {
      return this.getRenderer().getUpX();
    }

    getUpY(): float {
      return this.getRenderer().getUpY();
    }

    getUpZ(): float {
      return this.getRenderer().getUpZ();
    }

    getRightX(): float {
      return this.getRenderer().getRightX();
    }

    getRightY(): float {
      return this.getRenderer().getRightY();
    }

    getRightZ(): float {
      return this.getRenderer().getRightZ();
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

    getOriginalDepth(): float {
      return this._instanceContainer._getInitialInnerAreaDepth();
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
      return this.getUnscaledDepth() / 2 + this.getUnscaledMinZ();
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
      // Invalidates the transformation for the three axes at once.
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
        this.invalidateTransformation();
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
      this.invalidateTransformation();
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
      this.invalidateTransformation();
    }

    isFlippedZ(): boolean {
      return this._flippedZ;
    }

    hasEstimatedVelocity(): boolean {
      return this._hasEstimatedVelocity;
    }

    resetEstimatedVelocity(): void {
      this._hasEstimatedVelocity = false;
      this._estimatedVelocityX = 0;
      this._estimatedVelocityY = 0;
      this._estimatedVelocityZ = 0;
    }

    getEstimatedVelocityX(): float {
      return this._estimatedVelocityX;
    }

    getEstimatedVelocityY(): float {
      return this._estimatedVelocityY;
    }

    getEstimatedVelocityZ(): float {
      return this._estimatedVelocityZ;
    }

    setEstimatedVelocityX(velocityX: float): void {
      this._estimatedVelocityX = velocityX;
      this._hasEstimatedVelocity = true;
    }

    setEstimatedVelocityY(velocityY: float): void {
      this._estimatedVelocityY = velocityY;
      this._hasEstimatedVelocity = true;
    }

    setEstimatedVelocityZ(velocityZ: float): void {
      this._estimatedVelocityZ = velocityZ;
      this._hasEstimatedVelocity = true;
    }
  }
}
