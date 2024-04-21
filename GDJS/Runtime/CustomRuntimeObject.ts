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
    animatable?: SpriteAnimationData[];
    childrenContent: { [objectName: string]: ObjectConfiguration & any };
  };

  /**
   * An object that contains other object.
   *
   * This is the base class for objects generated from EventsBasedObject.
   *
   * @see gdjs.CustomRuntimeObjectInstanceContainer
   */
  export abstract class CustomRuntimeObject
    extends gdjs.RuntimeObject
    implements
      gdjs.Resizable,
      gdjs.Scalable,
      gdjs.Flippable,
      gdjs.OpacityHandler {
    _renderer:
      | gdjs.CustomRuntimeObject2DRenderer
      | gdjs.CustomRuntimeObject3DRenderer;
    /** It contains the children of this object. */
    _instanceContainer: gdjs.CustomRuntimeObjectInstanceContainer;
    _isUntransformedHitBoxesDirty: boolean = true;
    /** It contains shallow copies of the children hitboxes */
    private _untransformedHitBoxes: gdjs.Polygon[] = [];
    /** The dimension of this object is calculated from its children AABBs. */
    private _unrotatedAABB: AABB = { min: [0, 0], max: [0, 0] };
    private _scaleX: float = 1;
    private _scaleY: float = 1;
    private _flippedX: boolean = false;
    private _flippedY: boolean = false;
    private opacity: float = 255;
    private _customCenter: FloatPoint | null = null;
    private _localTransformation: gdjs.AffineTransformation = new gdjs.AffineTransformation();
    private _localInverseTransformation: gdjs.AffineTransformation = new gdjs.AffineTransformation();
    private _isLocalTransformationDirty: boolean = true;

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
      this._renderer = this._createRender();

      this._instanceContainer.loadFrom(objectData);

      // The generated code calls onCreated at the constructor end
      // and onCreated calls its super implementation at its end.
    }

    protected abstract _createRender():
      | gdjs.CustomRuntimeObject2DRenderer
      | gdjs.CustomRuntimeObject3DRenderer;
    protected abstract _reinitializeRenderer(): void;

    reinitialize(objectData: ObjectData & CustomObjectConfiguration) {
      super.reinitialize(objectData);

      this._instanceContainer.loadFrom(objectData);
      this._reinitializeRenderer();

      // The generated code calls the onCreated super implementation at the end.
      this.onCreated();
    }

    updateFromObjectData(
      oldObjectData: ObjectData & CustomObjectConfiguration,
      newObjectData: ObjectData & CustomObjectConfiguration
    ): boolean {
      const animator = this.getAnimator();
      if (animator) {
        animator.updateFromObjectData(
          oldObjectData.animatable || [],
          newObjectData.animatable || []
        );
      }
      return this._instanceContainer.updateFrom(oldObjectData, newObjectData);
    }

    extraInitializationFromInitialInstance(initialInstanceData: InstanceData) {
      const animator = this.getAnimator();
      if (initialInstanceData.numberProperties) {
        for (
          let i = 0, len = initialInstanceData.numberProperties.length;
          i < len;
          ++i
        ) {
          const extraData = initialInstanceData.numberProperties[i];
          if (animator && extraData.name === 'animation') {
            animator.setAnimationIndex(extraData.value);
          }
        }
      }
      if (initialInstanceData.customSize) {
        this.setWidth(initialInstanceData.width);
        this.setHeight(initialInstanceData.height);
      }
    }

    onDeletedFromScene(parent: gdjs.RuntimeInstanceContainer): void {
      // Let subclasses do something before the object is destroyed.
      this.onDestroy(parent);
      // Let behaviors do something before the object is destroyed.
      super.onDeletedFromScene(parent);
      // Destroy the children.
      this._instanceContainer.onDestroyFromScene(parent);
    }

    update(parent: gdjs.RuntimeInstanceContainer): void {
      this._instanceContainer._updateObjectsPreEvents();

      this.doStepPreEvents(this._instanceContainer);

      const profiler = this.getRuntimeScene().getProfiler();
      if (profiler) {
        profiler.begin(this.type);
      }
      // This is a bit like the "scene" events for custom objects.
      this.doStepPostEvents(this._instanceContainer);
      if (profiler) {
        profiler.end(this.type);
      }

      this._instanceContainer._updateObjectsPostEvents();
    }

    /**
     * This method is called when the preview is being hot-reloaded.
     */
    onHotReloading(parent: gdjs.RuntimeInstanceContainer) {}

    // This is only to handle trigger once.
    doStepPreEvents(parent: gdjs.RuntimeInstanceContainer) {}

    /**
     * This method is called each tick after events are done.
     * @param parent The instanceContainer owning the object
     */
    doStepPostEvents(parent: gdjs.RuntimeInstanceContainer) {}

    /**
     * This method is called when the object is being removed from its parent
     * container and is about to be destroyed/reused later.
     */
    onDestroy(parent: gdjs.RuntimeInstanceContainer) {}

    updatePreRender(parent: gdjs.RuntimeInstanceContainer): void {
      this._instanceContainer._updateObjectsPreRender();
      this.getRenderer().ensureUpToDate();
    }

    getRenderer():
      | gdjs.CustomRuntimeObject2DRenderer
      | gdjs.CustomRuntimeObject3DRenderer {
      return this._renderer;
    }

    onChildrenLocationChanged() {
      this._isUntransformedHitBoxesDirty = true;
      this.invalidateHitboxes();
      this.getRenderer().update();
    }

    updateHitBoxes(): void {
      if (this._isUntransformedHitBoxesDirty) {
        this._updateUntransformedHitBoxes();
      }

      // Update the current hitboxes with the frame custom hit boxes
      // and apply transformations.
      const localTransformation = this.getLocalTransformation();
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
          localTransformation.transform(
            this._untransformedHitBoxes[i].vertices[j],
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
      this._isUntransformedHitBoxesDirty = false;

      this._untransformedHitBoxes.length = 0;
      let minX = Number.MAX_VALUE;
      let minY = Number.MAX_VALUE;
      let maxX = -Number.MAX_VALUE;
      let maxY = -Number.MAX_VALUE;
      for (const childInstance of this._instanceContainer.getAdhocListOfAllInstances()) {
        if (!childInstance.isIncludedInParentCollisionMask()) {
          continue;
        }
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
      if (minX === Number.MAX_VALUE) {
        // The unscaled size can't be 0 because setWidth and setHeight wouldn't
        // have any effect.
        minX = 0;
        minY = 0;
        maxX = 1;
        maxY = 1;
      }
      this._unrotatedAABB.min[0] = minX;
      this._unrotatedAABB.min[1] = minY;
      this._unrotatedAABB.max[0] = maxX;
      this._unrotatedAABB.max[1] = maxY;

      while (this.hitBoxes.length < this._untransformedHitBoxes.length) {
        this.hitBoxes.push(new gdjs.Polygon());
      }
      this.hitBoxes.length = this._untransformedHitBoxes.length;
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
    applyObjectTransformation(x: float, y: float, destination: FloatPoint) {
      const source = destination;
      source[0] = x;
      source[1] = y;
      this.getLocalTransformation().transform(source, destination);
    }

    /**
     * Return the affine transformation that represents
     * flipping, scale, rotation and translation of the object.
     * @returns the affine transformation.
     */
    getLocalTransformation(): gdjs.AffineTransformation {
      if (this._isLocalTransformationDirty) {
        this._updateLocalTransformation();
      }
      return this._localTransformation;
    }

    getLocalInverseTransformation(): gdjs.AffineTransformation {
      if (this._isLocalTransformationDirty) {
        this._updateLocalTransformation();
      }
      return this._localInverseTransformation;
    }

    _updateLocalTransformation() {
      const absScaleX = Math.abs(this._scaleX);
      const absScaleY = Math.abs(this._scaleY);
      const centerX = this.getUnscaledCenterX() * absScaleX;
      const centerY = this.getUnscaledCenterY() * absScaleY;
      const angleInRadians = (this.angle * Math.PI) / 180;

      this._localTransformation.setToTranslation(this.x, this.y);
      this._localTransformation.rotateAround(angleInRadians, centerX, centerY);
      if (this._flippedX) {
        this._localTransformation.flipX(centerX);
      }
      if (this._flippedY) {
        this._localTransformation.flipY(centerY);
      }
      this._localTransformation.scale(absScaleX, absScaleY);

      this._localInverseTransformation.copyFrom(this._localTransformation);
      this._localInverseTransformation.invert();
      this._isLocalTransformationDirty = false;
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
    applyObjectInverseTransformation(
      x: float,
      y: float,
      destination: FloatPoint
    ) {
      const source = destination;
      source[0] = x;
      source[1] = y;
      this.getLocalInverseTransformation().transform(source, destination);
    }

    getDrawableX(): float {
      if (this._isUntransformedHitBoxesDirty) {
        this._updateUntransformedHitBoxes();
      }
      const absScaleX = this.getScaleX();
      if (!this._flippedX) {
        return this.x + this._unrotatedAABB.min[0] * absScaleX;
      } else {
        return (
          this.x +
          (-this._unrotatedAABB.min[0] -
            this.getUnscaledWidth() +
            2 * this.getUnscaledCenterX()) *
            absScaleX
        );
      }
    }

    getDrawableY(): float {
      if (this._isUntransformedHitBoxesDirty) {
        this._updateUntransformedHitBoxes();
      }
      const absScaleY = this.getScaleY();
      if (!this._flippedY) {
        return this.y + this._unrotatedAABB.min[1] * absScaleY;
      } else {
        return (
          this.y +
          (-this._unrotatedAABB.min[1] -
            this.getUnscaledHeight() +
            2 * this.getUnscaledCenterY()) *
            absScaleY
        );
      }
    }

    /**
     * @return the internal width of the object according to its children.
     */
    getUnscaledWidth(): float {
      if (this._isUntransformedHitBoxesDirty) {
        this._updateUntransformedHitBoxes();
      }
      return this._unrotatedAABB.max[0] - this._unrotatedAABB.min[0];
    }

    /**
     * @return the internal height of the object according to its children.
     */
    getUnscaledHeight(): float {
      if (this._isUntransformedHitBoxesDirty) {
        this._updateUntransformedHitBoxes();
      }
      return this._unrotatedAABB.max[1] - this._unrotatedAABB.min[1];
    }

    /**
     * @returns the center X from the local origin (0;0).
     */
    getUnscaledCenterX(): float {
      if (this._customCenter) {
        return this._customCenter[0];
      }
      if (this._isUntransformedHitBoxesDirty) {
        this._updateUntransformedHitBoxes();
      }
      return (this._unrotatedAABB.min[0] + this._unrotatedAABB.max[0]) / 2;
    }

    /**
     * @returns the center Y from the local origin (0;0).
     */
    getUnscaledCenterY(): float {
      if (this._customCenter) {
        return this._customCenter[1];
      }
      if (this._isUntransformedHitBoxesDirty) {
        this._updateUntransformedHitBoxes();
      }
      return (this._unrotatedAABB.min[1] + this._unrotatedAABB.max[1]) / 2;
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
    setRotationCenter(x: float, y: float) {
      if (!this._customCenter) {
        this._customCenter = [0, 0];
      }
      this._customCenter[0] = x;
      this._customCenter[1] = y;

      this._isLocalTransformationDirty = true;
      this.invalidateHitboxes();
    }

    hasCustomRotationCenter(): boolean {
      return !!this._customCenter;
    }

    getCenterX(): float {
      if (this._isUntransformedHitBoxesDirty) {
        this._updateUntransformedHitBoxes();
      }
      return (
        (this.getUnscaledCenterX() - this._unrotatedAABB.min[0]) *
        this.getScaleX()
      );
    }

    getCenterY(): float {
      if (this._isUntransformedHitBoxesDirty) {
        this._updateUntransformedHitBoxes();
      }
      return (
        (this.getUnscaledCenterY() - this._unrotatedAABB.min[1]) *
        this.getScaleY()
      );
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
      this._isLocalTransformationDirty = true;
      this.invalidateHitboxes();
      this.getRenderer().updateX();
    }

    setY(y: float): void {
      if (y === this.y) {
        return;
      }
      this.y = y;
      this._isLocalTransformationDirty = true;
      this.invalidateHitboxes();
      this.getRenderer().updateY();
    }

    setAngle(angle: float): void {
      if (this.angle === angle) {
        return;
      }
      this.angle = angle;
      this._isLocalTransformationDirty = true;
      this.invalidateHitboxes();
      this.getRenderer().updateAngle();
    }

    /**
     * Change the scale on X and Y axis of the object.
     *
     * @param newScale The new scale (must be greater than 0).
     */
    setScale(newScale: float): void {
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
      this._isLocalTransformationDirty = true;
      this.invalidateHitboxes();
      this.getRenderer().update();
    }

    /**
     * Change the scale on X axis of the object (changing its width).
     *
     * @param newScale The new scale (must be greater than 0).
     */
    setScaleX(newScale: float): void {
      if (newScale < 0) {
        newScale = 0;
      }
      if (newScale === Math.abs(this._scaleX)) {
        return;
      }
      this._scaleX = newScale * (this._flippedX ? -1 : 1);
      this._isLocalTransformationDirty = true;
      this.invalidateHitboxes();
      this.getRenderer().update();
    }

    /**
     * Change the scale on Y axis of the object (changing its height).
     *
     * @param newScale The new scale (must be greater than 0).
     */
    setScaleY(newScale: float): void {
      if (newScale < 0) {
        newScale = 0;
      }
      if (newScale === Math.abs(this._scaleY)) {
        return;
      }
      this._scaleY = newScale * (this._flippedY ? -1 : 1);
      this.invalidateHitboxes();
      this.getRenderer().update();
    }

    /**
     * Get the scale of the object (or the arithmetic mean of the X and Y scale in case they are different).
     *
     * @return the scale of the object (or the arithmetic mean of the X and Y scale in case they are different).
     * @deprecated Use `getScale` instead.
     */
    getScaleMean(): float {
      return (Math.abs(this._scaleX) + Math.abs(this._scaleY)) / 2.0;
    }

    /**
     * Get the scale of the object (or the geometric mean of the X and Y scale in case they are different).
     *
     * @return the scale of the object (or the geometric mean of the X and Y scale in case they are different).
     */
    getScale(): float {
      const scaleX = Math.abs(this._scaleX);
      const scaleY = Math.abs(this._scaleY);
      return scaleX === scaleY ? scaleX : Math.sqrt(scaleX * scaleY);
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
        this.invalidateHitboxes();
        this.getRenderer().update();
      }
    }

    flipY(enable: boolean) {
      if (enable !== this._flippedY) {
        this._scaleY *= -1;
        this._flippedY = enable;
        this.invalidateHitboxes();
        this.getRenderer().update();
      }
    }

    isFlippedX(): boolean {
      return this._flippedX;
    }

    isFlippedY(): boolean {
      return this._flippedY;
    }

    /**
     * Return the sprite animator.
     *
     * It returns `null` when custom objects don't have the Animatable capability.
     */
    getAnimator(): gdjs.SpriteAnimator<any> | null {
      return null;
    }
  }

  // Others initialization and internal state management :
  // TODO EBO Activate and test instance recycling.
  CustomRuntimeObject.supportsReinitialization = false;
}
