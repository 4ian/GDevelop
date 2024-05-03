/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  /** Represents the data of a {@link gdjs.SpriteRuntimeObject}. */
  export type SpriteObjectDataType = {
    /** Update the object even if he is not visible?. */
    updateIfNotVisible: boolean;
    /** The list of {@link SpriteAnimationData} representing {@link gdjs.SpriteAnimation} instances. */
    animations: Array<SpriteAnimationData>;
  };

  export type SpriteObjectData = ObjectData & SpriteObjectDataType;

  /**
   * The SpriteRuntimeObject represents an object that can display images.
   */
  export class SpriteRuntimeObject
    extends gdjs.RuntimeObject
    implements
      gdjs.Resizable,
      gdjs.Scalable,
      gdjs.Flippable,
      gdjs.Animatable,
      gdjs.OpacityHandler {
    _animator: gdjs.SpriteAnimator<any>;
    _scaleX: float = 1;
    _scaleY: float = 1;
    _blendMode: integer = 0;
    _flippedX: boolean = false;
    _flippedY: boolean = false;
    opacity: float = 255;
    _updateIfNotVisible: boolean;

    _renderer: gdjs.SpriteRuntimeObjectRenderer;
    _animationFrameDirty = true;

    /**
     * @param instanceContainer The container the object belongs to
     * @param spriteObjectData The object data used to initialize the object
     */
    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      spriteObjectData: ObjectData & SpriteObjectDataType
    ) {
      super(instanceContainer, spriteObjectData);
      this._updateIfNotVisible = !!spriteObjectData.updateIfNotVisible;
      this._renderer = new gdjs.SpriteRuntimeObjectRenderer(
        this,
        instanceContainer
      );
      this._animator = new gdjs.SpriteAnimator(
        spriteObjectData.animations,
        gdjs.SpriteRuntimeObjectRenderer.getAnimationFrameTextureManager(
          instanceContainer.getGame().getImageManager()
        )
      );
      this._updateAnimationFrame();

      // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
      this.onCreated();
    }

    reinitialize(spriteObjectData: SpriteObjectData) {
      super.reinitialize(spriteObjectData);
      const instanceContainer = this.getInstanceContainer();
      this._animator.reinitialize(spriteObjectData.animations);
      this._scaleX = 1;
      this._scaleY = 1;
      this._blendMode = 0;
      this._flippedX = false;
      this._flippedY = false;
      this.opacity = 255;
      this._updateIfNotVisible = !!spriteObjectData.updateIfNotVisible;
      this._renderer.reinitialize(this, instanceContainer);
      this._updateAnimationFrame();

      // *ALWAYS* call `this.onCreated()` at the very end of your object reinitialize method.
      this.onCreated();
    }

    updateFromObjectData(
      oldObjectData: SpriteObjectData,
      newObjectData: SpriteObjectData
    ): boolean {
      this._animator.updateFromObjectData(
        oldObjectData.animations,
        newObjectData.animations
      );
      this._updateIfNotVisible = !!newObjectData.updateIfNotVisible;
      this.invalidateHitboxes();
      return true;
    }

    /**
     * Initialize the extra parameters that could be set for an instance.
     * @param initialInstanceData The extra parameters
     */
    extraInitializationFromInitialInstance(initialInstanceData: InstanceData) {
      if (initialInstanceData.numberProperties) {
        for (
          let i = 0, len = initialInstanceData.numberProperties.length;
          i < len;
          ++i
        ) {
          const extraData = initialInstanceData.numberProperties[i];
          if (extraData.name === 'animation') {
            this.setAnimationIndex(extraData.value);
          }
        }
      }
      if (initialInstanceData.customSize) {
        this.setWidth(initialInstanceData.width);
        this.setHeight(initialInstanceData.height);
      }
    }

    /**
     * Update the current frame of the object according to the elapsed time on the scene.
     */
    update(instanceContainer: gdjs.RuntimeInstanceContainer): void {
      //Playing the animation of all objects including the ones outside the screen can be
      //costly when the scene is big with a lot of animated objects. By default, we skip
      //updating the object if it is not visible.
      if (
        !this._updateIfNotVisible &&
        !this._renderer.getRendererObject().visible
      ) {
        return;
      }
      const hasFrameChanged = this._animator.step(this.getElapsedTime() / 1000);
      if (hasFrameChanged) {
        this._updateAnimationFrame();
        // TODO: Hitboxes may not need an update if every frames has the same ones.
        this.invalidateHitboxes();
      }
      this._renderer.ensureUpToDate();
    }

    /**
     * Ensure the sprite is ready to be displayed: the proper animation frame
     * is set and the renderer is up to date (position, angle, alpha, flip, blend mode...).
     */
    updatePreRender(instanceContainer: gdjs.RuntimeInstanceContainer): void {
      if (this._animationFrameDirty) {
        this._updateAnimationFrame();
      }
      this._renderer.ensureUpToDate();
    }

    /**
     * Update `this._animationFrame` according to the current animation/direction/frame values
     * (`this._currentAnimation`, `this._currentDirection`, `this._currentFrame`) and set
     * `this._animationFrameDirty` back to false.
     *
     * Trigger a call to the renderer to change the texture being shown (if the animation/direction/frame
     * is valid).
     * If invalid, `this._animationFrame` will be `null` after calling this function.
     */
    _updateAnimationFrame() {
      this._animationFrameDirty = false;
      const animationFrame = this._animator.getCurrentFrame();
      if (animationFrame) {
        this._renderer.updateFrame(animationFrame);
      }
    }

    getRendererObject() {
      return this._renderer.getRendererObject();
    }

    /**
     * Update the hit boxes for the object.
     * Fallback to the default implementation (rotated bounding box) if there is no custom
     * hitboxes defined for the current animation frame.
     */
    updateHitBoxes(): void {
      const animationFrame = this._animator.getCurrentFrame();
      if (!animationFrame) {
        return;
      }

      if (!animationFrame.hasCustomHitBoxes) {
        return super.updateHitBoxes();
      }

      //logger.log("Update for "+this.name); //Uncomment to track updates
      //(and in particular be sure that unnecessary update are avoided).

      //Update the current hitboxes with the frame custom hit boxes
      //and apply transformations.
      for (let i = 0; i < animationFrame.customHitBoxes.length; ++i) {
        if (i >= this.hitBoxes.length) {
          this.hitBoxes.push(new gdjs.Polygon());
        }
        for (
          let j = 0;
          j < animationFrame.customHitBoxes[i].vertices.length;
          ++j
        ) {
          if (j >= this.hitBoxes[i].vertices.length) {
            this.hitBoxes[i].vertices.push([0, 0]);
          }
          this._transformToGlobal(
            animationFrame.customHitBoxes[i].vertices[j][0],
            animationFrame.customHitBoxes[i].vertices[j][1],
            this.hitBoxes[i].vertices[j]
          );
        }
        this.hitBoxes[i].vertices.length =
          animationFrame.customHitBoxes[i].vertices.length;
      }
      this.hitBoxes.length = animationFrame.customHitBoxes.length;
    }

    //Rotate and scale and flipping have already been applied to the point by _transformToGlobal.
    //Animations :
    /**
     * Change the animation being played.
     * @param newAnimation The index of the new animation to be played
     * @deprecated Use `setAnimationIndex` instead
     */
    setAnimation(newAnimation: integer): void {
      this.setAnimationIndex(newAnimation);
    }

    setAnimationIndex(newAnimation: integer): void {
      const hasAnimationChanged = this._animator.setAnimationIndex(
        newAnimation
      );
      if (hasAnimationChanged) {
        //TODO: This may be unnecessary.
        this._renderer.update();
        this._animationFrameDirty = true;
        this.invalidateHitboxes();
      }
    }

    setAnimationName(newAnimationName: string): void {
      const hasAnimationChanged = this._animator.setAnimationName(
        newAnimationName
      );
      if (hasAnimationChanged) {
        //TODO: This may be unnecessary.
        this._renderer.update();
        this._animationFrameDirty = true;
        this.invalidateHitboxes();
      }
    }

    /**
     * Get the index of the animation being played.
     * @return The index of the new animation being played
     * @deprecated Use `getAnimationIndex` instead
     */
    getAnimation(): integer {
      return this.getAnimationIndex();
    }

    getAnimationIndex(): integer {
      return this._animator.getAnimationIndex();
    }

    getAnimationName(): string {
      return this._animator.getAnimationName();
    }

    isCurrentAnimationName(name: string): boolean {
      return this.getAnimationName() === name;
    }

    /**
     * Change the angle (or direction index) of the object
     * @param The new angle (or direction index) to be applied
     */
    setDirectionOrAngle(newValue: float): void {
      const actualValue = this._animator.setDirectionOrAngle(
        this.angle,
        newValue
      );
      if (actualValue !== null) {
        this.angle = actualValue;
        //TODO: This may be unnecessary.
        this._renderer.update();
        this._animationFrameDirty = true;
        this.invalidateHitboxes();
        this._renderer.updateAngle();
      }
    }

    getDirectionOrAngle(): float {
      return this._animator.getDirectionOrAngle(this.angle);
    }

    /**
     * Change the current frame displayed by the animation
     * @param newFrame The index of the frame to be displayed
     */
    setAnimationFrame(newFrame: integer): void {
      const hasFrameChanged = this._animator.setAnimationFrameIndex(newFrame);
      if (hasFrameChanged) {
        this._animationFrameDirty = true;
        this.invalidateHitboxes();
      }
    }

    /**
     * Get the index of the current frame displayed by the animation
     * @return newFrame The index of the frame being displayed
     */
    getAnimationFrame(): integer {
      return this._animator.getAnimationFrameIndex();
    }

    getAnimationElapsedTime(): float {
      return this._animator.getAnimationElapsedTime();
    }

    setAnimationElapsedTime(time: float): void {
      const hasFrameChanged = this._animator.getAnimationElapsedTime();
      if (hasFrameChanged) {
        this._animationFrameDirty = true;
        this.invalidateHitboxes();
      }
    }

    getAnimationDuration(): float {
      return this._animator.getAnimationDuration();
    }

    getAnimationFrameCount(): integer {
      return this._animator.getAnimationFrameCount();
    }

    /**
     * @deprecated
     * Return true if animation has ended.
     * Prefer using `hasAnimationEnded2`. This method returns true as soon as
     * the animation enters the last frame, not at the end of the last frame.
     */
    hasAnimationEndedLegacy(): boolean {
      return this._animator.hasAnimationEndedLegacy();
    }

    /**
     * Return true if animation has ended.
     * The animation had ended if:
     * - it's not configured as a loop;
     * - the current frame is the last frame;
     * - the last frame has been displayed long enough.
     *
     * @deprecated Use `hasAnimationEnded` instead.
     */
    hasAnimationEnded2(): boolean {
      return this._animator.hasAnimationEnded();
    }

    hasAnimationEnded(): boolean {
      return this._animator.hasAnimationEnded();
    }

    /**
     * @deprecated Use `isAnimationPaused` instead.
     */
    animationPaused(): boolean {
      return this._animator.isAnimationPaused();
    }

    isAnimationPaused(): boolean {
      return this._animator.isAnimationPaused();
    }

    pauseAnimation(): void {
      this._animator.pauseAnimation();
    }

    /**
     * @deprecated Use `resumeAnimation` instead.
     */
    playAnimation(): void {
      this._animator.resumeAnimation();
    }

    resumeAnimation(): void {
      this._animator.resumeAnimation();
    }

    getAnimationSpeedScale(): float {
      return this._animator.getAnimationSpeedScale();
    }

    setAnimationSpeedScale(ratio: float): void {
      this._animator.setAnimationSpeedScale(ratio);
    }

    //Position :
    /**
     * Get the position on X axis on the scene of the given point.
     * @param name The point name
     * @return the position on X axis on the scene of the given point.
     */
    getPointX(name: string): float {
      const animationFrame = this._animator.getCurrentFrame();
      if (name.length === 0 || animationFrame === null) {
        return this.getX();
      }
      const pt = animationFrame.getPoint(name);
      const pos = gdjs.staticArray(SpriteRuntimeObject.prototype.getPointX);
      this._transformToGlobal(pt.x, pt.y, pos);
      return pos[0];
    }

    /**
     * Get the position on Y axis on the scene of the given point.
     * @param name The point name
     * @return the position on Y axis on the scene of the given point.
     */
    getPointY(name: string): float {
      const animationFrame = this._animator.getCurrentFrame();
      if (name.length === 0 || animationFrame === null) {
        return this.getY();
      }
      const pt = animationFrame.getPoint(name);
      const pos = gdjs.staticArray(SpriteRuntimeObject.prototype.getPointY);
      this._transformToGlobal(pt.x, pt.y, pos);
      return pos[1];
    }
    /**
     * Get the positions on X and Y axis on the scene of the given point.
     * @param name The point name
     * @return An array of the position on X and Y axis on the scene of the given point.
     */
    getPointPosition(name: string): [x: float, y: float] {
      const animationFrame = this._animator.getCurrentFrame();
      if (name.length === 0 || animationFrame === null) {
        return [this.getX(), this.getY()];
      }
      const pt = animationFrame.getPoint(name);
      const pos = gdjs.staticArray(SpriteRuntimeObject.prototype.getPointX);
      this._transformToGlobal(pt.x, pt.y, pos);
      return [pos[0], pos[1]];
    }

    /**
     * Return an array containing the coordinates of the point passed as parameter
     * in world coordinates (as opposed to the object local coordinates).
     *
     * Beware: this._animationFrame and this._sprite must *not* be null!
     *
     * All transformations (flipping, scale, rotation) are supported.
     *
     * @param x The X position of the point, in object coordinates.
     * @param y The Y position of the point, in object coordinates.
     * @param result Array that will be updated with the result
     * (x and y position of the point in global coordinates).
     */
    private _transformToGlobal(x: float, y: float, result: float[]) {
      const animationFrame = this._animator.getCurrentFrame() as SpriteAnimationFrame<
        any
      >;
      let cx = animationFrame.center.x;
      let cy = animationFrame.center.y;

      //Flipping
      if (this._flippedX) {
        x = x + (cx - x) * 2;
      }
      if (this._flippedY) {
        y = y + (cy - y) * 2;
      }

      //Scale
      const absScaleX = Math.abs(this._scaleX);
      const absScaleY = Math.abs(this._scaleY);
      x *= absScaleX;
      y *= absScaleY;
      cx *= absScaleX;
      cy *= absScaleY;

      //Rotation
      const angleInRadians = (this.angle / 180) * Math.PI;
      const cosValue = Math.cos(
        // Only compute cos and sin once (10% faster than doing it twice)
        angleInRadians
      );
      const sinValue = Math.sin(angleInRadians);
      const xToCenterXDelta = x - cx;
      const yToCenterYDelta = y - cy;
      x = cx + cosValue * xToCenterXDelta - sinValue * yToCenterYDelta;
      y = cy + sinValue * xToCenterXDelta + cosValue * yToCenterYDelta;
      result.length = 2;
      result[0] = x + (this.x - animationFrame.origin.x * absScaleX);
      result[1] = y + (this.y - animationFrame.origin.y * absScaleY);
    }

    /**
     * Get the X position, on the scene, of the origin of the texture of the object.
     * @return the X position, on the scene, of the origin of the texture of the object.
     */
    getDrawableX(): float {
      const animationFrame = this._animator.getCurrentFrame();
      if (animationFrame === null) {
        return this.x;
      }
      const absScaleX = Math.abs(this._scaleX);
      if (!this._flippedX) {
        return this.x - animationFrame.origin.x * absScaleX;
      } else {
        return (
          this.x +
          (-animationFrame.origin.x -
            this._renderer.getUnscaledWidth() +
            2 * animationFrame.center.x) *
            absScaleX
        );
      }
    }

    /**
     * Get the Y position, on the scene, of the origin of the texture of the object.
     * @return the Y position, on the scene, of the origin of the texture of the object.
     */
    getDrawableY(): float {
      const animationFrame = this._animator.getCurrentFrame();
      if (animationFrame === null) {
        return this.y;
      }
      const absScaleY = Math.abs(this._scaleY);
      if (!this._flippedY) {
        return this.y - animationFrame.origin.y * absScaleY;
      } else {
        return (
          this.y +
          (-animationFrame.origin.y -
            this._renderer.getUnscaledHeight() +
            2 * animationFrame.center.y) *
            absScaleY
        );
      }
    }

    /**
     * Get the X position of the center of the object, relative to top-left of the texture of the object (`getDrawableX`).
     * @return X position of the center of the object, relative to `getDrawableX()`.
     */
    getCenterX(): float {
      const animationFrame = this._animator.getCurrentFrame();
      if (animationFrame === null) {
        return 0;
      }
      if (!this._flippedX) {
        //Just need to multiply by the scale as it is the center.
        return animationFrame.center.x * Math.abs(this._scaleX);
      } else {
        return (
          (this._renderer.getUnscaledWidth() - animationFrame.center.x) *
          Math.abs(this._scaleX)
        );
      }
    }

    /**
     * Get the Y position of the center of the object, relative to top-left of the texture of the object (`getDrawableY`).
     * @return Y position of the center of the object, relative to `getDrawableY()`.
     */
    getCenterY(): float {
      const animationFrame = this._animator.getCurrentFrame();
      if (animationFrame === null) {
        return 0;
      }
      if (!this._flippedY) {
        //Just need to multiply by the scale as it is the center.
        return animationFrame.center.y * Math.abs(this._scaleY);
      } else {
        return (
          (this._renderer.getUnscaledHeight() - animationFrame.center.y) *
          Math.abs(this._scaleY)
        );
      }
    }

    /**
     * Set the X position of the (origin of the) object.
     * @param x The new X position.
     */
    setX(x: float): void {
      if (x === this.x) {
        return;
      }
      this.x = x;
      const animationFrame = this._animator.getCurrentFrame();
      if (animationFrame !== null) {
        this.invalidateHitboxes();
        this._renderer.updateX();
      }
    }

    /**
     * Set the Y position of the (origin of the) object.
     * @param y The new Y position.
     */
    setY(y: float): void {
      if (y === this.y) {
        return;
      }
      this.y = y;
      const animationFrame = this._animator.getCurrentFrame();
      if (animationFrame !== null) {
        this.invalidateHitboxes();
        this._renderer.updateY();
      }
    }

    /**
     * Set the angle of the object.
     * @param angle The new angle, in degrees.
     */
    setAngle(angle: float): void {
      const actualValue = this._animator.setAngle(this.angle, angle);
      if (actualValue !== null) {
        this.angle = actualValue;
        this.invalidateHitboxes();
        this._renderer.updateAngle();
      }
    }

    /**
     * Get the angle of the object.
     * @return The angle, in degrees.
     */
    getAngle(): float {
      return this._animator.getAngle(this.angle);
    }

    //Visibility and display :
    setBlendMode(newMode): void {
      if (this._blendMode === newMode) {
        return;
      }
      this._blendMode = newMode;
      this._renderer.update();
    }

    getBlendMode() {
      return this._blendMode;
    }

    setOpacity(opacity: float): void {
      if (opacity < 0) {
        opacity = 0;
      }
      if (opacity > 255) {
        opacity = 255;
      }
      this.opacity = opacity;
      this._renderer.updateOpacity();
    }

    getOpacity(): float {
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
      this._renderer.updateVisibility();
    }

    /**
     * Change the tint of the sprite object.
     *
     * @param rgbColor The color, in RGB format ("128;200;255").
     */
    setColor(rgbColor: string): void {
      this._renderer.setColor(rgbColor);
    }

    /**
     * Get the tint of the sprite object.
     *
     * @returns The color, in RGB format ("128;200;255").
     */
    getColor(): string {
      return this._renderer.getColor();
    }

    flipX(enable: boolean) {
      if (enable !== this._flippedX) {
        this._scaleX *= -1;
        this._flippedX = enable;
        this.invalidateHitboxes();
        this._renderer.update();
      }
    }

    flipY(enable: boolean) {
      if (enable !== this._flippedY) {
        this._scaleY *= -1;
        this._flippedY = enable;
        this.invalidateHitboxes();
        this._renderer.update();
      }
    }

    isFlippedX(): boolean {
      return this._flippedX;
    }

    isFlippedY(): boolean {
      return this._flippedY;
    }

    //Scale and size :
    /**
     * Get the width of the object.
     *
     * @return The width of the object, in pixels.
     */
    getWidth(): float {
      if (this._animationFrameDirty) {
        this._updateAnimationFrame();
      }
      return this._renderer.getWidth();
    }

    /**
     * Get the height of the object.
     *
     * @return The height of the object, in pixels.
     */
    getHeight(): float {
      if (this._animationFrameDirty) {
        this._updateAnimationFrame();
      }
      return this._renderer.getHeight();
    }

    setWidth(newWidth: float): void {
      if (this._animationFrameDirty) {
        this._updateAnimationFrame();
      }
      const unscaledWidth = this._renderer.getUnscaledWidth();
      if (unscaledWidth !== 0) {
        this.setScaleX(newWidth / unscaledWidth);
      }
    }

    setHeight(newHeight: float): void {
      if (this._animationFrameDirty) {
        this._updateAnimationFrame();
      }
      const unscaledHeight = this._renderer.getUnscaledHeight();
      if (unscaledHeight !== 0) {
        this.setScaleY(newHeight / unscaledHeight);
      }
    }

    setSize(newWidth: float, newHeight: float): void {
      this.setWidth(newWidth);
      this.setHeight(newHeight);
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
      this._renderer.update();
      this.invalidateHitboxes();
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
      this._renderer.update();
      this.invalidateHitboxes();
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
      this._renderer.update();
      this.invalidateHitboxes();
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

    //Other :
    /**
     * @param obj The target object
     * @param scene The scene containing the object
     * @deprecated
     */
    turnTowardObject(obj: gdjs.RuntimeObject | null, scene: gdjs.RuntimeScene) {
      if (obj === null) {
        return;
      }
      this.rotateTowardPosition(
        obj.getDrawableX() + obj.getCenterX(),
        obj.getDrawableY() + obj.getCenterY(),
        0,
        scene
      );
    }
  }
  gdjs.registerObject(
    'Sprite',
    //Notify gdjs of the object existence.
    gdjs.SpriteRuntimeObject
  );

  //Others initialization and internal state management :
  SpriteRuntimeObject.supportsReinitialization = true;
}
