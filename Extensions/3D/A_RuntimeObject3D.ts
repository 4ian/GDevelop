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

  const getValidDimensionValue = (value: float | undefined) =>
    value === undefined ? 100 : value <= 0 ? 1 : value;

  /**
   * Base class for 3D objects.
   */
  export abstract class RuntimeObject3D
    extends gdjs.RuntimeObject
    implements
      gdjs.Resizable,
      gdjs.Scalable,
      gdjs.Flippable,
      gdjs.Base3DHandler {
    /**
     * Position on the Z axis.
     */
    private _z: float = 0;
    /**
     * `_width` takes this value when the scale equals 1.
     *
     * It can't be 0.
     */
    private _originalWidth: float;
    /**
     * `_height` takes this value when the scale equals 1.
     *
     * It can't be 0.
     */
    private _originalHeight: float;
    /**
     * `depth` takes this value when the scale equals 1.
     *
     * It can't be 0.
     */
    private _originalDepth: float;
    private _width: float;
    private _height: float;
    private _depth: float;
    private _flippedX: boolean = false;
    private _flippedY: boolean = false;
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
      objectData: Object3DData
    ) {
      super(instanceContainer, objectData);
      // TODO Should 0 be replaced by 0.01 instead of using the default value?
      this._width = this._originalWidth = getValidDimensionValue(
        objectData.content.width
      );
      this._height = this._originalHeight = getValidDimensionValue(
        objectData.content.height
      );
      this._depth = this._originalDepth = getValidDimensionValue(
        objectData.content.depth
      );
    }

    abstract getRenderer(): gdjs.RuntimeObject3DRenderer;

    getRendererObject() {
      return null;
    }

    get3DRendererObject() {
      return this.getRenderer().get3DRendererObject();
    }

    updateFromObjectData(
      oldObjectData: Object3DData,
      newObjectData: Object3DData
    ): boolean {
      // There is no need to check if they changed because events can't modify them.
      this._setOriginalWidth(
        getValidDimensionValue(newObjectData.content.width)
      );
      this._setOriginalHeight(
        getValidDimensionValue(newObjectData.content.height)
      );
      this._setOriginalDepth(
        getValidDimensionValue(newObjectData.content.depth)
      );
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

    setX(x: float): void {
      super.setX(x);
      this.getRenderer().updatePosition();
    }

    setY(y: float): void {
      super.setY(y);
      this.getRenderer().updatePosition();
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
      return this._z;
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

    setAngle(angle: float): void {
      super.setAngle(angle);
      this.getRenderer().updateRotation();
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
      const axisX = gdjs.RuntimeObject3D._temporaryVector;
      axisX.set(1, 0, 0);

      const mesh = this.getRenderer().get3DRendererObject();
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
      const axisY = gdjs.RuntimeObject3D._temporaryVector;
      axisY.set(0, 1, 0);

      const mesh = this.getRenderer().get3DRendererObject();
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
      const axisZ = gdjs.RuntimeObject3D._temporaryVector;
      axisZ.set(0, 0, 1);

      const mesh = this.getRenderer().get3DRendererObject();
      mesh.rotateOnWorldAxis(axisZ, gdjs.toRad(deltaAngle));
      this._rotationX = gdjs.toDegrees(mesh.rotation.x);
      this._rotationY = gdjs.toDegrees(mesh.rotation.y);
      this.setAngle(gdjs.toDegrees(mesh.rotation.z));
    }

    getWidth(): float {
      return this._width;
    }

    getHeight(): float {
      return this._height;
    }

    /**
     * Get the object size on the Z axis (called "depth").
     */
    getDepth(): float {
      return this._depth;
    }

    setWidth(width: float): void {
      if (this._width === width) return;

      this._width = width;
      this.getRenderer().updateSize();
      this.invalidateHitboxes();
    }

    setHeight(height: float): void {
      if (this._height === height) return;

      this._height = height;
      this.getRenderer().updateSize();
      this.invalidateHitboxes();
    }

    setSize(newWidth: number, newHeight: number): void {
      this.setWidth(newWidth);
      this.setHeight(newHeight);
    }

    /**
     * Set the object size on the Z axis (called "depth").
     */
    setDepth(depth: float): void {
      if (this._depth === depth) return;

      this._depth = depth;
      this.getRenderer().updateSize();
    }

    /**
     * Return the width of the object for a scale of 1.
     *
     * It can't be 0.
     */
    _getOriginalWidth(): float {
      return this._originalWidth;
    }

    /**
     * Return the height of the object for a scale of 1.
     *
     * It can't be 0.
     */
    _getOriginalHeight(): float {
      return this._originalHeight;
    }

    /**
     * Return the object size on the Z axis (called "depth") when the scale equals 1.
     */
    _getOriginalDepth(): float {
      return this._originalDepth;
    }

    /**
     * Set the width of the object for a scale of 1.
     */
    _setOriginalWidth(originalWidth: float): void {
      if (originalWidth <= 0) {
        originalWidth = 1;
      }
      const oldOriginalWidth = this._originalWidth;
      this._originalWidth = originalWidth;
      if (oldOriginalWidth === this._width) {
        this.setWidth(originalWidth);
      }
    }

    /**
     * Set the height of the object for a scale of 1.
     */
    _setOriginalHeight(originalHeight: float): void {
      if (originalHeight <= 0) {
        originalHeight = 1;
      }
      const oldOriginalHeight = this._originalHeight;
      this._originalHeight = originalHeight;
      if (oldOriginalHeight === this._height) {
        this.setHeight(originalHeight);
      }
    }

    /**
     * Set the object size on the Z axis (called "depth") when the scale equals 1.
     */
    _setOriginalDepth(originalDepth: float): void {
      if (originalDepth <= 0) {
        originalDepth = 1;
      }
      const oldOriginalDepth = this._originalDepth;
      this._originalDepth = originalDepth;
      if (oldOriginalDepth === this._depth) {
        this.setDepth(originalDepth);
      }
    }

    /**
     * Change the scale on X, Y and Z axis of the object.
     *
     * @param newScale The new scale (must be greater than 0).
     */
    setScale(newScale: number): void {
      this.setScaleX(newScale);
      this.setScaleY(newScale);
      this.setScaleZ(newScale);
    }

    /**
     * Change the scale on X axis of the object (changing its width).
     *
     * @param newScale The new scale (must be greater than 0).
     */
    setScaleX(newScale: number): void {
      if (newScale < 0) {
        newScale = 0;
      }
      this.setWidth(this._originalWidth * newScale);
    }

    /**
     * Change the scale on Y axis of the object (changing its height).
     *
     * @param newScale The new scale (must be greater than 0).
     */
    setScaleY(newScale: number): void {
      if (newScale < 0) {
        newScale = 0;
      }
      this.setHeight(this._originalHeight * newScale);
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
      this.setDepth(this._originalDepth * newScale);
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
     * Get the scale of the object on X axis.
     *
     * @return the scale of the object on X axis
     */
    getScaleX(): float {
      return Math.abs(this._width / this._originalWidth);
    }

    /**
     * Get the scale of the object on Y axis.
     *
     * @return the scale of the object on Y axis
     */
    getScaleY(): float {
      return Math.abs(this._height / this._originalHeight);
    }

    /**
     * Get the scale of the object on Z axis.
     *
     * @return the scale of the object on Z axis
     */
    getScaleZ(): float {
      return Math.abs(this._depth / this._originalDepth);
    }

    flipX(enable: boolean) {
      if (enable !== this._flippedX) {
        this._flippedX = enable;
        this.getRenderer().updateSize();
      }
    }

    flipY(enable: boolean) {
      if (enable !== this._flippedY) {
        this._flippedY = enable;
        this.getRenderer().updateSize();
      }
    }

    flipZ(enable: boolean) {
      if (enable !== this._flippedZ) {
        this._flippedZ = enable;
        this.getRenderer().updateSize();
      }
    }

    isFlippedX(): boolean {
      return this._flippedX;
    }

    isFlippedY(): boolean {
      return this._flippedY;
    }

    isFlippedZ(): boolean {
      return this._flippedZ;
    }

    hide(enable: boolean): void {
      super.hide(enable);
      this.getRenderer().updateVisibility();
    }
  }
}
