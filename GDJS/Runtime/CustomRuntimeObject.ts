/*
 * GDevelop JS Platform
 * Copyright 2013-2022 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  export type ObjectConfiguration = {
    content: any;
  };

  export type CustomObjectConfiguration = ObjectConfiguration & {
    childrenContent: { [objectName: string]: ObjectConfiguration & any };
  };

  /**
   * An object that contains other object.
   *
   * This is the base class for objects generated from EventsBasedObject.
   *
   * @see gdjs.CustomRuntimeObjectInstanceContainer
   */
  export class CustomRuntimeObject extends gdjs.RuntimeObject {
    /** It contains the children of this object. */
    _instanceContainer: gdjs.CustomRuntimeObjectInstanceContainer;
    _isUntransformedHitBoxesDirty: boolean = true;
    /** It contains shallow copies of the children hitboxes */
    _untransformedHitBoxes: gdjs.Polygon[] = [];
    /** The dimension of this object is calculated from it's children AABB. */
    _unrotatedAABB: AABB = { min: [0, 0], max: [0, 0] };
    _scaleX: number = 1;
    _scaleY: number = 1;
    _flippedX: boolean = false;
    _flippedY: boolean = false;
    opacity: float = 255;
    _objectData: ObjectData & CustomObjectConfiguration;

    /**
     * @param parent The container the object belongs to
     * @param objectData The object data used to initialize the object
     */
    constructor(
      parent: gdjs.RuntimeInstanceContainer,
      objectData: ObjectData & CustomObjectConfiguration
    ) {
      super(parent, objectData);
      this._instanceContainer = new gdjs.CustomRuntimeObjectInstanceContainer(
        parent,
        this
      );
      this._objectData = objectData;

      this._instanceContainer.loadFrom(objectData);
      this.getRenderer().reinitialize(this, parent);

      this.onCreated();
      // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
      // TODO EBO Make generated code call super implementation for life-cycle methods.
      super.onCreated();
    }

    reinitialize(objectData: ObjectData & CustomObjectConfiguration) {
      super.reinitialize(objectData);

      this._instanceContainer.loadFrom(objectData);
      this.getRenderer().reinitialize(this, this.getParent());

      // *ALWAYS* call `this.onCreated()` at the very end of your object reinitialize method.
      // TODO EBO Make generated code call super implementation for life-cycle methods.
      super.onCreated();
      this.onCreated();
    }

    updateFromObjectData(
      oldObjectData: ObjectData & CustomObjectConfiguration,
      newObjectData: ObjectData & CustomObjectConfiguration
    ): boolean {
      return this._instanceContainer.updateFrom(oldObjectData, newObjectData);
    }

    extraInitializationFromInitialInstance(initialInstanceData: InstanceData) {
      if (initialInstanceData.customSize) {
        this.setWidth(initialInstanceData.width);
        this.setHeight(initialInstanceData.height);
      }
    }

    onDestroyFromScene(instanceContainer: gdjs.RuntimeInstanceContainer): void {
      this.onDestroy(instanceContainer);
      super.onDestroyFromScene(instanceContainer);
      this._instanceContainer.onDestroyFromScene(instanceContainer);
    }

    update(instanceContainer: gdjs.RuntimeInstanceContainer): void {
      this._instanceContainer._updateObjectsPreEvents();

      this.doStepPreEvents(instanceContainer);

      const profiler = this.getRuntimeScene().getProfiler();
      if (profiler) {
        profiler.begin(this._objectData.type);
      }
      // This is a bit like the "scene" events for custom objects.
      this.doStepPostEvents(instanceContainer);
      if (profiler) {
        profiler.end(this._objectData.type);
      }

      this._instanceContainer._updateObjectsPostEvents();
    }

    /**
     * This method is called when the preview is being hot-reloaded.
     */
    onHotReloading(instanceContainer: gdjs.RuntimeInstanceContainer) {}

    // TODO EBO This is only to handle trigger once.
    doStepPreEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {}

    /**
     * This method is called each tick after events are done.
     * @param instanceContainer The instanceContainer owning the object
     */
    doStepPostEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {}

    /**
     * This method is called when the object is being removed from its parent
     * container and is about to be destroyed/reused later.
     */
    onDestroy(instanceContainer: gdjs.RuntimeInstanceContainer) {}

    updatePreRender(instanceContainer: gdjs.RuntimeInstanceContainer): void {
      this._instanceContainer._updateObjectsPreRender();
      this.getRenderer().ensureUpToDate();
    }

    getRendererObject() {
      return this.getRenderer().getRendererObject();
    }

    getRenderer() {
      return this._instanceContainer.getRenderer();
    }

    onChildrenLocationChanged() {
      this._isUntransformedHitBoxesDirty = true;
      this.invalidateHitboxes();
    }

    updateHitBoxes(): void {
      if (this._isUntransformedHitBoxesDirty) {
        this._updateUntransformedHitBoxes();
      }

      //Update the current hitboxes with the frame custom hit boxes
      //and apply transformations.
      for (let i = 0; i < this._untransformedHitBoxes.length; ++i) {
        if (i >= this.hitBoxes.length) {
          this.hitBoxes.push(new gdjs.Polygon());
        }
        for (
          let j = 0;
          j < this._untransformedHitBoxes[i].vertices.length;
          ++j
        ) {
          if (j >= this.hitBoxes[i].vertices.length) {
            this.hitBoxes[i].vertices.push([0, 0]);
          }
          this.applyObjectTransformation(
            this._untransformedHitBoxes[i].vertices[j][0],
            this._untransformedHitBoxes[i].vertices[j][1],
            this.hitBoxes[i].vertices[j]
          );
        }
        this.hitBoxes[i].vertices.length = this._untransformedHitBoxes[
          i
        ].vertices.length;
      }
    }

    /**
     * Merge the hitboxes of the children.
     */
    _updateUntransformedHitBoxes() {
      const oldUnscaledWidth = Math.max(
        0,
        this._unrotatedAABB.max[0] - this._unrotatedAABB.min[0]
      );
      const oldUnscaledHeight = Math.max(
        0,
        this._unrotatedAABB.max[1] - this._unrotatedAABB.min[1]
      );

      this._isUntransformedHitBoxesDirty = false;
      let minX = Number.MAX_VALUE;
      let minY = Number.MAX_VALUE;
      let maxX = -Number.MAX_VALUE;
      let maxY = -Number.MAX_VALUE;
      this._untransformedHitBoxes.length = 0;
      for (const childInstance of this._instanceContainer.getAdhocListOfAllInstances()) {
        Array.prototype.push.apply(
          this._untransformedHitBoxes,
          childInstance.getHitBoxes()
        );
        const childAABB = childInstance.getAABB();
        minX = Math.min(minX, childAABB.min[0]);
        minY = Math.min(minY, childAABB.min[1]);
        maxX = Math.max(maxX, childAABB.max[0]);
        maxY = Math.max(maxY, childAABB.max[1]);
      }
      this._unrotatedAABB.min[0] = minX;
      this._unrotatedAABB.min[1] = minY;
      this._unrotatedAABB.max[0] = maxX;
      this._unrotatedAABB.max[1] = maxY;

      while (this.hitBoxes.length < this._untransformedHitBoxes.length) {
        this.hitBoxes.push(new gdjs.Polygon());
      }
      this.hitBoxes.length = this._untransformedHitBoxes.length;

      if (
        this.getUnscaledWidth() !== oldUnscaledWidth ||
        this.getUnscaledHeight() !== oldUnscaledHeight
      ) {
        // TODO EBO Should this be called for any change of the AABB?
        this._instanceContainer.onObjectUnscaledDimensionChange(
          oldUnscaledWidth,
          oldUnscaledHeight
        );
      }
    }

    // Position:
    /**
     * Return an array containing the coordinates of the point passed as parameter
     * in parent coordinate coordinates (as opposed to the object local coordinates).
     *
     * All transformations (flipping, scale, rotation) are supported.
     *
     * @param x The X position of the point, in object coordinates.
     * @param y The Y position of the point, in object coordinates.
     * @param result Array that will be updated with the result
     * (x and y position of the point in parent coordinates).
     */
    applyObjectTransformation(x: float, y: float, result: number[]) {
      let cx = this.getCenterX();
      let cy = this.getCenterY();

      // Flipping
      if (this._flippedX) {
        x = x + (cx - x) * 2;
      }
      if (this._flippedY) {
        y = y + (cy - y) * 2;
      }

      // Scale
      const absScaleX = Math.abs(this._scaleX);
      const absScaleY = Math.abs(this._scaleY);
      x *= absScaleX;
      y *= absScaleY;
      cx *= absScaleX;
      cy *= absScaleY;

      // Rotation
      const oldX = x;
      const angleInRadians = (this.angle / 180) * Math.PI;
      const cosValue = Math.cos(angleInRadians);
      const sinValue = Math.sin(angleInRadians);
      const xToCenterXDelta = x - cx;
      const yToCenterYDelta = y - cy;
      x = cx + cosValue * xToCenterXDelta - sinValue * yToCenterYDelta;
      y = cy + sinValue * xToCenterXDelta + cosValue * yToCenterYDelta;
      result.length = 2;
      result[0] = x + this.x;
      result[1] = y + this.y;
    }

    /**
     * Return an array containing the coordinates of the point passed as parameter
     * in object local coordinates (as opposed to the parent coordinate coordinates).
     *
     * All transformations (flipping, scale, rotation) are supported.
     *
     * @param x The X position of the point, in parent coordinates.
     * @param y The Y position of the point, in parent coordinates.
     * @param result Array that will be updated with the result
     * (x and y position of the point in object coordinates).
     */
    applyObjectInverseTransformation(x: float, y: float, result: number[]) {
      x -= this.getCenterXInScene();
      y -= this.getCenterYInScene();

      const absScaleX = Math.abs(this._scaleX);
      const absScaleY = Math.abs(this._scaleY);

      // Rotation
      const angleInRadians = (this.angle / 180) * Math.PI;
      const cosValue = Math.cos(-angleInRadians);
      const sinValue = Math.sin(-angleInRadians);
      const oldX = x;
      x = cosValue * x - sinValue * y;
      y = sinValue * oldX + cosValue * y;

      // Scale
      x /= absScaleX;
      y /= absScaleY;

      // Flipping
      if (this._flippedX) {
        x = -x;
      }
      if (this._flippedY) {
        y = -y;
      }

      const positionToCenterX =
        this.getUnscaledWidth() / 2 + this._unrotatedAABB.min[0];
      const positionToCenterY =
        this.getUnscaledHeight() / 2 + this._unrotatedAABB.min[1];
      result[0] = x + positionToCenterX;
      result[1] = y + positionToCenterY;
    }

    getDrawableX(): float {
      if (this._isUntransformedHitBoxesDirty) {
        this._updateUntransformedHitBoxes();
      }
      return this.x + this._unrotatedAABB.min[0] * this._scaleX;
    }

    getDrawableY(): float {
      if (this._isUntransformedHitBoxesDirty) {
        this._updateUntransformedHitBoxes();
      }
      return this.y + this._unrotatedAABB.min[1] * this._scaleY;
    }

    /**
     * @return the internal width of the object according to its children.
     */
    getUnscaledWidth(): float {
      if (this._isUntransformedHitBoxesDirty) {
        this._updateUntransformedHitBoxes();
      }
      return Math.max(
        0,
        this._unrotatedAABB.max[0] - this._unrotatedAABB.min[0]
      );
    }

    /**
     * @return the internal height of the object according to its children.
     */
    getUnscaledHeight(): float {
      if (this._isUntransformedHitBoxesDirty) {
        this._updateUntransformedHitBoxes();
      }
      return Math.max(
        0,
        this._unrotatedAABB.max[1] - this._unrotatedAABB.min[1]
      );
    }

    /**
     * @returns the center X from the local origin (0;0).
     */
    getUnscaledCenterX(): float {
      if (this._isUntransformedHitBoxesDirty) {
        this._updateUntransformedHitBoxes();
      }
      return this.getUnscaledWidth() / 2 - this._unrotatedAABB.min[0];
    }

    /**
     * @returns the center Y from the local origin (0;0).
     */
    getUnscaledCenterY(): float {
      if (this._isUntransformedHitBoxesDirty) {
        this._updateUntransformedHitBoxes();
      }
      return this.getUnscaledHeight() / 2 - this._unrotatedAABB.min[1];
    }

    getWidth(): float {
      return this.getUnscaledWidth() * this.getScaleX();
    }

    getHeight(): float {
      return this.getUnscaledHeight() * this.getScaleY();
    }

    setWidth(newWidth: float): void {
      const unscaledWidth = this.getUnscaledWidth();
      if (unscaledWidth !== 0) {
        this.setScaleX(newWidth / unscaledWidth);
      }
    }

    setHeight(newHeight: float): void {
      const unscaledHeight = this.getUnscaledHeight();
      if (unscaledHeight !== 0) {
        this.setScaleY(newHeight / unscaledHeight);
      }
    }

    /**
     * Change the size of the object.
     *
     * @param newWidth The new width of the object, in pixels.
     * @param newHeight The new height of the object, in pixels.
     */
    setSize(newWidth: float, newHeight: float): void {
      this.setWidth(newWidth);
      this.setHeight(newHeight);
    }

    setX(x: float): void {
      if (x === this.x) {
        return;
      }
      this.x = x;
      this.invalidateHitboxes();
      this.getRenderer().updateX();
    }

    setY(y: float): void {
      if (y === this.y) {
        return;
      }
      this.y = y;
      this.invalidateHitboxes();
      this.getRenderer().updateY();
    }

    setAngle(angle: float): void {
      if (this.angle === angle) {
        return;
      }
      this.angle = angle;
      this.invalidateHitboxes();
      this.getRenderer().updateAngle();
    }

    /**
     * Change the scale on X and Y axis of the object.
     *
     * @param newScale The new scale (must be greater than 0).
     */
    setScale(newScale: number): void {
      if (newScale < 0) {
        newScale = 0;
      }
      if (
        newScale === Math.abs(this._scaleX) &&
        newScale === Math.abs(this._scaleY)
      ) {
        return;
      }
      this._scaleX = newScale * (this._flippedX ? -1 : 1);
      this._scaleY = newScale * (this._flippedY ? -1 : 1);
      this.getRenderer().update();
      this.invalidateHitboxes();
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
      if (newScale === Math.abs(this._scaleX)) {
        return;
      }
      this._scaleX = newScale * (this._flippedX ? -1 : 1);
      this.getRenderer().update();
      this.invalidateHitboxes();
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
      if (newScale === Math.abs(this._scaleY)) {
        return;
      }
      this._scaleY = newScale * (this._flippedY ? -1 : 1);
      this.getRenderer().update();
      this.invalidateHitboxes();
    }

    /**
     * Get the scale of the object (or the average of the X and Y scale in case
     * they are different).
     *
     * @return the scale of the object (or the average of the X and Y scale in
     * case they are different).
     */
    getScale(): number {
      return (Math.abs(this._scaleX) + Math.abs(this._scaleY)) / 2.0;
    }

    /**
     * Get the scale of the object on Y axis.
     *
     * @return the scale of the object on Y axis
     */
    getScaleY(): float {
      return Math.abs(this._scaleY);
    }

    /**
     * Get the scale of the object on X axis.
     *
     * @return the scale of the object on X axis
     */
    getScaleX(): float {
      return Math.abs(this._scaleX);
    }

    // Visibility and display :
    /**
     * Change the transparency of the object.
     * @param opacity The new opacity, between 0 (transparent) and 255 (opaque).
     */
    setOpacity(opacity: float): void {
      if (opacity < 0) {
        opacity = 0;
      }
      if (opacity > 255) {
        opacity = 255;
      }
      this.opacity = opacity;
      this.getRenderer().updateOpacity();
    }

    /**
     * Get the transparency of the object.
     * @return The opacity, between 0 (transparent) and 255 (opaque).
     */
    getOpacity(): number {
      return this.opacity;
    }

    /**
     * Hide (or show) the object
     * @param enable true to hide the object, false to show it again.
     */
    hide(enable: boolean): void {
      if (enable === undefined) {
        enable = true;
      }
      this.hidden = enable;
      this.getRenderer().updateVisibility();
    }

    flipX(enable: boolean) {
      if (enable !== this._flippedX) {
        this._scaleX *= -1;
        this._flippedX = enable;
        this.getRenderer().update();
        this.invalidateHitboxes();
      }
    }

    flipY(enable: boolean) {
      if (enable !== this._flippedY) {
        this._scaleY *= -1;
        this._flippedY = enable;
        this.getRenderer().update();
        this.invalidateHitboxes();
      }
    }

    isFlippedX(): boolean {
      return this._flippedX;
    }

    isFlippedY(): boolean {
      return this._flippedY;
    }
  }

  // Others initialization and internal state management :
  CustomRuntimeObject.supportsReinitialization = true;
}
