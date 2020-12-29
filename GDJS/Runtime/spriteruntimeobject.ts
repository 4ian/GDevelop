/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  /** Represents a point in a coordinate system. */
  export type SpritePoint = {
    /** X position of the point. */
    x: number;
    /** Y position of the point. */
    y: number;
  };

  /** Represents a custom point in a frame. */
  export type SpriteCustomPointData = {
    /** Name of the point. */
    name: string;
    /** X position of the point. */
    x: number;
    /** Y position of the point. */
    y: number;
  };

  /** Represents the center point in a frame. */
  export type SpriteCenterPointData = {
    /** Name of the point. */
    name: string;
    /** Is the center automatically computed? */
    automatic: boolean;
    /** X position of the point. */
    x: number;
    /** Y position of the point. */
    y: number;
  };

  /** Represents a {@link gdjs.SpriteAnimationFrame}. */
  export type SpriteFrameData = {
    /** The resource name of the image used in this frame. */
    image: string;
    /** The points of the frame. */
    points: Array<SpriteCustomPointData>;
    /** The origin point. */
    originPoint: SpriteCustomPointData;
    /** The center of the frame. */
    centerPoint: SpriteCenterPointData;
    /** Is The collision mask custom? */
    hasCustomCollisionMask: boolean;
    /** The collision mask if it is custom. */
    customCollisionMask: Array<Array<SpritePoint>>;
  };

  /** Represents the data of a {@link gdjs.SpriteAnimationDirection}. */
  export type SpriteDirectionData = {
    /** Time between each frame, in seconds. */
    timeBetweenFrames: number;
    /** Is the animation looping? */
    looping: boolean;
    /** The list of frames. */
    sprites: Array<SpriteFrameData>;
  };

  /** Represents the data of a {@link gdjs.SpriteAnimation}. */
  export type SpriteAnimationData = {
    /** The name of the animation. */
    name: string;
    /** Does the animation use multiple {@link gdjs.SpriteAnimationDirection}? */
    useMultipleDirections: boolean;
    /** The list of {@link SpriteDirectionData} representing {@link gdjs.SpriteAnimationDirection} instances. */
    directions: Array<SpriteDirectionData>;
  };

  /** Represents the data of a {@link gdjs.SpriteRuntimeObject}. */
  export type SpriteObjectDataType = {
    /** Update the object even if he is not visible?. */
    updateIfNotVisible: boolean;
    /** The list of {@link SpriteAnimationData} representing {@link gdjs.SpriteAnimation} instances. */
    animations: Array<SpriteAnimationData>;
  };

  export type SpriteObjectData = ObjectData & SpriteObjectDataType;

  /**
   * A frame used by a SpriteAnimation in a {@link gdjs.SpriteRuntimeObject}.
   *
   * It contains the texture displayed as well as information like the points position
   * or the collision mask.
   */
  export class SpriteAnimationFrame {
    image: string;

    //TODO: Rename in imageName, and do not store it in the object?
    texture: any;
    center: SpritePoint = { x: 0, y: 0 };
    origin: SpritePoint = { x: 0, y: 0 };
    hasCustomHitBoxes: boolean = false;
    customHitBoxes: gdjs.Polygon[] = [];
    points: Hashtable<SpritePoint>;

    /**
     * @param imageManager The game image manager
     * @param frameData The frame data used to initialize the frame
     */
    constructor(imageManager: gdjs.ImageManager, frameData: SpriteFrameData) {
      this.image = frameData ? frameData.image : '';
      this.texture = gdjs.SpriteRuntimeObjectRenderer.getAnimationFrame(
        imageManager,
        this.image
      );
      this.points = new Hashtable();
      this.reinitialize(imageManager, frameData);
    }

    /**
     * @param imageManager The game image manager
     * @param frameData The frame data used to initialize the frame
     */
    reinitialize(imageManager: gdjs.ImageManager, frameData: SpriteFrameData) {
      this.points.clear();
      for (let i = 0, len = frameData.points.length; i < len; ++i) {
        const ptData = frameData.points[i];
        const point = { x: ptData.x, y: ptData.y };
        this.points.put(ptData.name, point);
      }
      const origin = frameData.originPoint;
      this.origin.x = origin.x;
      this.origin.y = origin.y;
      const center = frameData.centerPoint;
      if (center.automatic !== true) {
        this.center.x = center.x;
        this.center.y = center.y;
      } else {
        this.center.x =
          gdjs.SpriteRuntimeObjectRenderer.getAnimationFrameWidth(
            this.texture
          ) / 2;
        this.center.y =
          gdjs.SpriteRuntimeObjectRenderer.getAnimationFrameHeight(
            this.texture
          ) / 2;
      }

      //Load the custom collision mask, if any:
      if (frameData.hasCustomCollisionMask) {
        this.hasCustomHitBoxes = true;
        let i = 0;
        for (let len = frameData.customCollisionMask.length; i < len; ++i) {
          const polygonData: SpritePoint[] = frameData.customCollisionMask[i];

          //Add a polygon, if necessary (Avoid recreating a polygon if it already exists).
          if (i >= this.customHitBoxes.length) {
            this.customHitBoxes.push(new gdjs.Polygon());
          }
          let j = 0;
          for (const len2 = polygonData.length; j < len2; ++j) {
            const pointData: SpritePoint = polygonData[j];

            //Add a point, if necessary (Avoid recreating a point if it already exists).
            if (j >= this.customHitBoxes[i].vertices.length) {
              this.customHitBoxes[i].vertices.push([0, 0]);
            }
            this.customHitBoxes[i].vertices[j][0] = pointData.x;
            this.customHitBoxes[i].vertices[j][1] = pointData.y;
          }
          this.customHitBoxes[i].vertices.length = j;
        }
        this.customHitBoxes.length = i;
      } else {
        this.customHitBoxes.length = 0;
      }
    }

    /**
     * Get a point of the frame.<br>
     * If the point does not exist, the origin is returned.
     * @param name The point's name
     * @return The requested point. If it doesn't exists returns the origin point.
     */
    getPoint(name: string): SpritePoint {
      if (name === 'Centre' || name === 'Center') {
        return this.center;
      } else {
        if (name === 'Origin') {
          return this.origin;
        }
      }
      return this.points.containsKey(name)
        ? this.points.get(name)
        : this.origin;
    }
  }

  /**
   * Represents a direction of an animation of a {@link gdjs.SpriteRuntimeObject}.
   *
   * @param imageManager The game image manager
   * @param directionData The direction data used to initialize the direction
   */
  export class SpriteAnimationDirection {
    timeBetweenFrames: number;
    loop: boolean;
    frames: SpriteAnimationFrame[] = [];

    constructor(imageManager, directionData) {
      this.timeBetweenFrames = directionData
        ? directionData.timeBetweenFrames
        : 1.0;
      this.loop = !!directionData.looping;
      this.reinitialize(imageManager, directionData);
    }

    /**
     * @param imageManager The game image manager
     * @param directionData The direction data used to initialize the direction
     */
    reinitialize(
      imageManager: gdjs.ImageManager,
      directionData: SpriteDirectionData
    ) {
      this.timeBetweenFrames = directionData
        ? directionData.timeBetweenFrames
        : 1.0;
      this.loop = !!directionData.looping;
      let i = 0;
      for (const len = directionData.sprites.length; i < len; ++i) {
        const frameData = directionData.sprites[i];
        if (i < this.frames.length) {
          this.frames[i].reinitialize(imageManager, frameData);
        } else {
          this.frames.push(
            new gdjs.SpriteAnimationFrame(imageManager, frameData)
          );
        }
      }
      this.frames.length = i;
    }
  }

  /**
   * Represents an animation of a {@link SpriteRuntimeObject}.
   *
   * @param imageManager The game image manager
   * @param animData The animation data used to initialize the animation
   */
  export class SpriteAnimation {
    hasMultipleDirections: boolean;
    name: string;
    directions: gdjs.SpriteAnimationDirection[] = [];

    constructor(imageManager, animData) {
      this.hasMultipleDirections = !!animData.useMultipleDirections;
      this.name = animData.name || '';
      this.reinitialize(imageManager, animData);
    }

    /**
     * @param imageManager The game image manager
     * @param animData The animation data used to initialize the animation
     */
    reinitialize(
      imageManager: gdjs.ImageManager,
      animData: SpriteAnimationData
    ) {
      this.hasMultipleDirections = !!animData.useMultipleDirections;
      this.name = animData.name || '';
      let i = 0;
      for (const len = animData.directions.length; i < len; ++i) {
        const directionData = animData.directions[i];
        if (i < this.directions.length) {
          this.directions[i].reinitialize(imageManager, directionData);
        } else {
          this.directions.push(
            new gdjs.SpriteAnimationDirection(imageManager, directionData)
          );
        }
      }
      this.directions.length = i;
    }
  }

  //Make sure to delete already existing directions which are not used anymore.

  /**
   * The SpriteRuntimeObject represents an object that can display images.
   *
   * @param runtimeScene The scene the object belongs to
   * @param spriteObjectData The object data used to initialize the object
   */
  export class SpriteRuntimeObject extends gdjs.RuntimeObject {
    _currentAnimation: number = 0;
    _currentDirection: number = 0;
    _currentFrame: number = 0;
    _frameElapsedTime: float = 0;
    _animationSpeedScale: number = 1;
    _animationPaused: boolean = false;
    _scaleX: number = 1;
    _scaleY: number = 1;
    _blendMode: number = 0;
    _flippedX: boolean = false;
    _flippedY: boolean = false;
    opacity: float = 255;
    _updateIfNotVisible: boolean;

    //Animations:
    _animations: gdjs.SpriteAnimation[] = [];

    /**
     * Reference to the current SpriteAnimationFrame that is displayd.
     * Verify is `this._animationFrameDirty === true` before using it, and if so
     * call `this._updateAnimationFrame()`.
     * Can be null, so ensure that this case is handled properly.
     *
     */
    _animationFrame: gdjs.SpriteAnimationFrame | null = null;
    _renderer: gdjs.SpriteRuntimeObjectRenderer;
    hitBoxesDirty: any;
    _animationFrameDirty: any;

    constructor(runtimeScene, spriteObjectData) {
      super(runtimeScene, spriteObjectData);
      this._updateIfNotVisible = !!spriteObjectData.updateIfNotVisible;
      for (let i = 0, len = spriteObjectData.animations.length; i < len; ++i) {
        this._animations.push(
          new gdjs.SpriteAnimation(
            runtimeScene.getGame().getImageManager(),
            spriteObjectData.animations[i]
          )
        );
      }
      this._renderer = new gdjs.SpriteRuntimeObjectRenderer(this, runtimeScene);
      this._updateAnimationFrame();

      // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
      this.onCreated();
    }

    reinitialize(spriteObjectData: SpriteObjectData) {
      super.reinitialize(spriteObjectData);
      const runtimeScene = this._runtimeScene;
      this._currentAnimation = 0;
      this._currentDirection = 0;
      this._currentFrame = 0;
      this._frameElapsedTime = 0;
      this._animationSpeedScale = 1;
      this._animationPaused = false;
      this._scaleX = 1;
      this._scaleY = 1;
      this._blendMode = 0;
      this._flippedX = false;
      this._flippedY = false;
      this.opacity = 255;
      this._updateIfNotVisible = !!spriteObjectData.updateIfNotVisible;
      let i = 0;
      for (const len = spriteObjectData.animations.length; i < len; ++i) {
        const animData = spriteObjectData.animations[i];
        if (i < this._animations.length) {
          this._animations[i].reinitialize(
            runtimeScene.getGame().getImageManager(),
            animData
          );
        } else {
          this._animations.push(
            new gdjs.SpriteAnimation(
              runtimeScene.getGame().getImageManager(),
              animData
            )
          );
        }
      }
      this._animations.length = i;

      //Make sure to delete already existing animations which are not used anymore.
      this._animationFrame = null;
      this._renderer.reinitialize(this, runtimeScene);
      this._updateAnimationFrame();

      // *ALWAYS* call `this.onCreated()` at the very end of your object reinitialize method.
      this.onCreated();
    }

    updateFromObjectData(
      oldObjectData: SpriteObjectData,
      newObjectData: SpriteObjectData
    ): boolean {
      const runtimeScene = this._runtimeScene;
      let i = 0;
      for (const len = newObjectData.animations.length; i < len; ++i) {
        const animData = newObjectData.animations[i];
        if (i < this._animations.length) {
          this._animations[i].reinitialize(
            runtimeScene.getGame().getImageManager(),
            animData
          );
        } else {
          this._animations.push(
            new gdjs.SpriteAnimation(
              runtimeScene.getGame().getImageManager(),
              animData
            )
          );
        }
      }
      this._animations.length = i;

      //Make sure to delete already existing animations which are not used anymore.
      this._updateAnimationFrame();
      if (!this._animationFrame) {
        this.setAnimation(0);
      }
      this.hitBoxesDirty = true;
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
            this.setAnimation(extraData.value);
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
    update(runtimeScene): void {
      //Playing the animation of all objects including the ones outside the screen can be
      //costly when the scene is big with a lot of animated objects. By default, we skip
      //updating the object if it is not visible.
      if (
        !this._updateIfNotVisible &&
        !this._renderer.getRendererObject().visible
      ) {
        return;
      }
      if (
        this._currentAnimation >= this._animations.length ||
        this._currentDirection >=
          this._animations[this._currentAnimation].directions.length
      ) {
        return;
      }
      const direction = this._animations[this._currentAnimation].directions[
        this._currentDirection
      ];
      const oldFrame = this._currentFrame;

      //*Optimization*: Animation is finished, don't change the current frame
      //and compute nothing more.
      if (!direction.loop && this._currentFrame >= direction.frames.length) {
      } else {
        const elapsedTime = this.getElapsedTime(runtimeScene) / 1000;
        this._frameElapsedTime += this._animationPaused
          ? 0
          : elapsedTime * this._animationSpeedScale;
        if (this._frameElapsedTime > direction.timeBetweenFrames) {
          const count = Math.floor(
            this._frameElapsedTime / direction.timeBetweenFrames
          );
          this._currentFrame += count;
          this._frameElapsedTime =
            this._frameElapsedTime - count * direction.timeBetweenFrames;
          if (this._frameElapsedTime < 0) {
            this._frameElapsedTime = 0;
          }
        }
        if (this._currentFrame >= direction.frames.length) {
          this._currentFrame = direction.loop
            ? this._currentFrame % direction.frames.length
            : direction.frames.length - 1;
        }
        if (this._currentFrame < 0) {
          this._currentFrame = 0;
        }
      }

      //May happen if there is no frame.
      if (oldFrame !== this._currentFrame || this._animationFrameDirty) {
        this._updateAnimationFrame();
      }
      if (oldFrame !== this._currentFrame) {
        this.hitBoxesDirty = true;
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
      if (
        this._currentAnimation < this._animations.length &&
        this._currentDirection <
          this._animations[this._currentAnimation].directions.length
      ) {
        const direction = this._animations[this._currentAnimation].directions[
          this._currentDirection
        ];
        if (this._currentFrame < direction.frames.length) {
          this._animationFrame = direction.frames[this._currentFrame];
          if (this._animationFrame !== null) {
            this._renderer.updateFrame(this._animationFrame);
          }
          return;
        }
      }

      //Invalid animation/direction/frame:
      this._animationFrame = null;
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
      if (this._animationFrameDirty) {
        this._updateAnimationFrame();
      }
      if (this._animationFrame === null) {
        return;
      }

      //Beware, `this._animationFrame` can still be null.
      if (!this._animationFrame.hasCustomHitBoxes) {
        return super.updateHitBoxes();
      }

      //console.log("Update for "+this.name); //Uncomment to track updates
      //(and in particular be sure that unnecessary update are avoided).

      //Update the current hitboxes with the frame custom hit boxes
      //and apply transformations.
      for (let i = 0; i < this._animationFrame.customHitBoxes.length; ++i) {
        if (i >= this.hitBoxes.length) {
          this.hitBoxes.push(new gdjs.Polygon());
        }
        for (
          let j = 0;
          j < this._animationFrame.customHitBoxes[i].vertices.length;
          ++j
        ) {
          if (j >= this.hitBoxes[i].vertices.length) {
            this.hitBoxes[i].vertices.push([0, 0]);
          }
          this._transformToGlobal(
            this._animationFrame.customHitBoxes[i].vertices[j][0],
            this._animationFrame.customHitBoxes[i].vertices[j][1],
            this.hitBoxes[i].vertices[j]
          );
        }
        this.hitBoxes[i].vertices.length = this._animationFrame.customHitBoxes[
          i
        ].vertices.length;
      }
      this.hitBoxes.length = this._animationFrame.customHitBoxes.length;
    }

    //Rotate and scale and flipping have already been applied to the point by _transformToGlobal.
    //Animations :
    /**
     * Change the animation being played.
     * @param newAnimation The index of the new animation to be played
     */
    setAnimation(newAnimation: number): void {
      newAnimation = newAnimation | 0;
      if (
        newAnimation < this._animations.length &&
        this._currentAnimation !== newAnimation &&
        newAnimation >= 0
      ) {
        this._currentAnimation = newAnimation;
        this._currentFrame = 0;
        this._frameElapsedTime = 0;

        //TODO: This may be unnecessary.
        this._renderer.update();
        this._animationFrameDirty = true;
        this.hitBoxesDirty = true;
      }
    }

    /**
     * Change the animation being played.
     * @param newAnimationName The name of the new animation to be played
     */
    setAnimationName(newAnimationName: string): void {
      if (!newAnimationName) {
        return;
      }
      for (let i = 0; i < this._animations.length; ++i) {
        if (this._animations[i].name === newAnimationName) {
          return this.setAnimation(i);
        }
      }
    }

    /**
     * Get the index of the animation being played.
     * @return The index of the new animation being played
     */
    getAnimation(): number {
      return this._currentAnimation;
    }

    /**
     * Get the name of the animation being played.
     * @return The name of the new animation being played
     */
    getAnimationName(): string {
      if (this._currentAnimation >= this._animations.length) {
        return '';
      }
      return this._animations[this._currentAnimation].name;
    }

    isCurrentAnimationName(name): boolean {
      return this.getAnimationName() === name;
    }

    /**
     * Change the angle (or direction index) of the object
     * @param The new angle (or direction index) to be applied
     */
    setDirectionOrAngle(newValue): void {
      if (this._currentAnimation >= this._animations.length) {
        return;
      }
      const anim = this._animations[this._currentAnimation];
      if (!anim.hasMultipleDirections) {
        if (this.angle === newValue) {
          return;
        }
        this.angle = newValue;
        this.hitBoxesDirty = true;
        this._renderer.updateAngle();
      } else {
        newValue = newValue | 0;
        if (
          newValue === this._currentDirection ||
          newValue >= anim.directions.length ||
          anim.directions[newValue].frames.length === 0
        ) {
          return;
        }
        this._currentDirection = newValue;
        this._currentFrame = 0;
        this._frameElapsedTime = 0;
        this.angle = 0;

        //TODO: This may be unnecessary.
        this._renderer.update();
        this._animationFrameDirty = true;
        this.hitBoxesDirty = true;
      }
    }

    getDirectionOrAngle(): float {
      if (this._currentAnimation >= this._animations.length) {
        return 0;
      }
      if (!this._animations[this._currentAnimation].hasMultipleDirections) {
        return this.angle;
      } else {
        return this._currentDirection;
      }
    }

    /**
     * Change the current frame displayed by the animation
     * @param newFrame The index of the frame to be displayed
     */
    setAnimationFrame(newFrame: number): void {
      if (
        this._currentAnimation >= this._animations.length ||
        this._currentDirection >=
          this._animations[this._currentAnimation].directions.length
      ) {
        return;
      }
      const direction = this._animations[this._currentAnimation].directions[
        this._currentDirection
      ];
      if (
        newFrame >= 0 &&
        newFrame < direction.frames.length &&
        newFrame !== this._currentFrame
      ) {
        this._currentFrame = newFrame;
        this._animationFrameDirty = true;
        this.hitBoxesDirty = true;
      }
    }

    /**
     * Get the index of the current frame displayed by the animation
     * @return newFrame The index of the frame being displayed
     */
    getAnimationFrame(): number {
      return this._currentFrame;
    }

    /**
     * Return true if animation has ended.
     */
    hasAnimationEnded(): boolean {
      if (
        this._currentAnimation >= this._animations.length ||
        this._currentDirection >=
          this._animations[this._currentAnimation].directions.length
      ) {
        return true;
      }
      const direction = this._animations[this._currentAnimation].directions[
        this._currentDirection
      ];
      if (direction.loop) {
        return false;
      }
      return this._currentFrame === direction.frames.length - 1;
    }

    animationPaused() {
      return this._animationPaused;
    }

    pauseAnimation() {
      this._animationPaused = true;
    }

    playAnimation() {
      this._animationPaused = false;
    }

    getAnimationSpeedScale() {
      return this._animationSpeedScale;
    }

    setAnimationSpeedScale(ratio): void {
      this._animationSpeedScale = ratio;
    }

    //Position :
    /**
     * Get the position on X axis on the scene of the given point.
     * @param name The point name
     * @return the position on X axis on the scene of the given point.
     */
    getPointX(name: string): float {
      if (this._animationFrameDirty) {
        this._updateAnimationFrame();
      }
      if (name.length === 0 || this._animationFrame === null) {
        return this.getX();
      }
      const pt = this._animationFrame.getPoint(name);
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
      if (this._animationFrameDirty) {
        this._updateAnimationFrame();
      }
      if (name.length === 0 || this._animationFrame === null) {
        return this.getY();
      }
      const pt = this._animationFrame.getPoint(name);
      const pos = gdjs.staticArray(SpriteRuntimeObject.prototype.getPointY);
      this._transformToGlobal(pt.x, pt.y, pos);
      return pos[1];
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
    private _transformToGlobal(x: float, y: float, result: number[]) {
      const animationFrame = this._animationFrame as SpriteAnimationFrame;
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
      const oldX = x;
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
      if (this._animationFrame === null) {
        return this.x;
      }
      const absScaleX = Math.abs(this._scaleX);
      if (!this._flippedX) {
        return this.x - this._animationFrame.origin.x * absScaleX;
      } else {
        return (
          this.x +
          (-this._animationFrame.origin.x -
            this._renderer.getUnscaledWidth() +
            2 * this._animationFrame.center.x) *
            absScaleX
        );
      }
    }

    /**
     * Get the Y position, on the scene, of the origin of the texture of the object.
     * @return the Y position, on the scene, of the origin of the texture of the object.
     */
    getDrawableY(): float {
      if (this._animationFrame === null) {
        return this.y;
      }
      const absScaleY = Math.abs(this._scaleY);
      if (!this._flippedY) {
        return this.y - this._animationFrame.origin.y * absScaleY;
      } else {
        return (
          this.y +
          (-this._animationFrame.origin.y -
            this._renderer.getUnscaledHeight() +
            2 * this._animationFrame.center.y) *
            absScaleY
        );
      }
    }

    /**
     * Get the X position of the center of the object, relative to top-left of the texture of the object (`getDrawableX`).
     * @return X position of the center of the object, relative to `getDrawableX()`.
     */
    getCenterX(): float {
      if (this._animationFrameDirty) {
        this._updateAnimationFrame();
      }
      if (this._animationFrame === null) {
        return 0;
      }
      if (!this._flippedX) {
        //Just need to multiply by the scale as it is the center.
        return this._animationFrame.center.x * Math.abs(this._scaleX);
      } else {
        return (
          (this._renderer.getUnscaledWidth() - this._animationFrame.center.x) *
          Math.abs(this._scaleX)
        );
      }
    }

    /**
     * Get the Y position of the center of the object, relative to top-left of the texture of the object (`getDrawableY`).
     * @return Y position of the center of the object, relative to `getDrawableY()`.
     */
    getCenterY(): float {
      if (this._animationFrameDirty) {
        this._updateAnimationFrame();
      }
      if (this._animationFrame === null) {
        return 0;
      }
      if (!this._flippedY) {
        //Just need to multiply by the scale as it is the center.
        return this._animationFrame.center.y * Math.abs(this._scaleY);
      } else {
        return (
          (this._renderer.getUnscaledHeight() - this._animationFrame.center.y) *
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
      if (this._animationFrame !== null) {
        this.hitBoxesDirty = true;
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
      if (this._animationFrame !== null) {
        this.hitBoxesDirty = true;
        this._renderer.updateY();
      }
    }

    /**
     * Set the angle of the object.
     * @param angle The new angle, in degrees.
     */
    setAngle(angle: float): void {
      if (this._currentAnimation >= this._animations.length) {
        return;
      }
      if (!this._animations[this._currentAnimation].hasMultipleDirections) {
        if (this.angle === angle) {
          return;
        }
        this.angle = angle;
        this._renderer.updateAngle();
        this.hitBoxesDirty = true;
      } else {
        angle = angle % 360;
        if (angle < 0) {
          angle += 360;
        }
        this.setDirectionOrAngle(Math.round(angle / 45) % 8);
      }
    }

    /**
     * Get the angle of the object.
     * @return The angle, in degrees.
     */
    getAngle(): float {
      if (this._currentAnimation >= this._animations.length) {
        return 0;
      }
      if (!this._animations[this._currentAnimation].hasMultipleDirections) {
        return this.angle;
      } else {
        return this._currentDirection * 45;
      }
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
      this._renderer.updateOpacity();
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

    flipX(enable) {
      if (enable !== this._flippedX) {
        this._scaleX *= -1;
        this._flippedX = enable;
        this.hitBoxesDirty = true;
        this._renderer.update();
      }
    }

    flipY(enable) {
      if (enable !== this._flippedY) {
        this._scaleY *= -1;
        this._flippedY = enable;
        this.hitBoxesDirty = true;
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

    /**
     * Change the width of the object. This changes the scale on X axis of the object.
     *
     * @param width The new width of the object, in pixels.
     */
    setWidth(newWidth): void {
      if (this._animationFrameDirty) {
        this._updateAnimationFrame();
      }
      const unscaledWidth = this._renderer.getUnscaledWidth();
      if (unscaledWidth !== 0) {
        this.setScaleX(newWidth / unscaledWidth);
      }
    }

    /**
     * Change the height of the object. This changes the scale on Y axis of the object.
     *
     * @param height The new height of the object, in pixels.
     */
    setHeight(newHeight): void {
      if (this._animationFrameDirty) {
        this._updateAnimationFrame();
      }
      const unscaledHeight = this._renderer.getUnscaledHeight();
      if (unscaledHeight !== 0) {
        this.setScaleY(newHeight / unscaledHeight);
      }
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
      this._renderer.update();
      this.hitBoxesDirty = true;
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
      this._renderer.update();
      this.hitBoxesDirty = true;
    }

    /**
     * Change the scale on Y axis of the object (changing its width).
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
      this._renderer.update();
      this.hitBoxesDirty = true;
    }

    /**
     * Get the scale of the object (or the average of the X and Y scale in case they are different).
     *
     * @return the scale of the object (or the average of the X and Y scale in case they are different).
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

    //Other :
    /**
     * @param obj The target object
     * @param scene The scene containing the object
     * @deprecated
     */
    turnTowardObject(obj, scene) {
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
