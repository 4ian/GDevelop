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

    constructor(
      imageManager: gdjs.PixiImageManager,
      directionData: SpriteDirectionData
    ) {
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

    constructor(
      imageManager: gdjs.PixiImageManager,
      animData: SpriteAnimationData
    ) {
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
      // Make sure to delete already existing directions which are not used anymore.
      this.directions.length = i;
    }
  }

  /**
   *
   */
  export class SpriteAnimator implements gdjs.Animatable {
    _imageManager: PixiImageManager;
    _animations: gdjs.SpriteAnimation[] = [];
    /**
     * Reference to the current SpriteAnimationFrame that is displayed.
     * Verify is `this._animationFrameDirty === true` before using it, and if so
     * call `this._updateAnimationFrame()`.
     * Can be null, so ensure that this case is handled properly.
     */
    _animationFrame: gdjs.SpriteAnimationFrame | null = null;
    _animationFrameDirty: boolean = true;

    _currentAnimation: integer = 0;
    _currentDirection: integer = 0;
    _currentFrame: integer = 0;
    /** In seconds */
    _animationElapsedTime: float = 0;
    _animationSpeedScale: float = 1;
    _animationPaused: boolean = false;
    _onFrameChange: (() => void) | null = null;

    constructor(
      animations: Array<SpriteAnimationData>,
      imageManager: PixiImageManager
    ) {
      this._imageManager = imageManager;
      for (let i = 0, len = animations.length; i < len; ++i) {
        this._animations.push(
          new gdjs.SpriteAnimation(imageManager, animations[i])
        );
      }
    }

    reinitialize(animations: Array<SpriteAnimationData>) {
      this._currentAnimation = 0;
      this._currentDirection = 0;
      this._currentFrame = 0;
      this._animationElapsedTime = 0;
      this._animationSpeedScale = 1;
      this._animationPaused = false;

      let i = 0;
      for (const len = animations.length; i < len; ++i) {
        const animData = animations[i];
        if (i < this._animations.length) {
          this._animations[i].reinitialize(this._imageManager, animData);
        } else {
          this._animations.push(
            new gdjs.SpriteAnimation(this._imageManager, animData)
          );
        }
      }
      this._animations.length = i;

      // Make sure to delete already existing animations which are not used anymore.
      this._animationFrame = null;
    }

    updateFromObjectData(
      oldObjectData: SpriteObjectData,
      newObjectData: SpriteObjectData
    ): boolean {
      let i = 0;
      for (const len = newObjectData.animations.length; i < len; ++i) {
        const animData = newObjectData.animations[i];
        if (i < this._animations.length) {
          this._animations[i].reinitialize(this._imageManager, animData);
        } else {
          this._animations.push(
            new gdjs.SpriteAnimation(this._imageManager, animData)
          );
        }
      }
      this._animations.length = i;

      // Make sure to delete already existing animations which are not used anymore.
      this._animationFrameDirty = true;
      const animationFrame = this.getCurrentFrame();
      if (!animationFrame) {
        this.setAnimationIndex(0);
      }
      return true;
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
    getCurrentFrame(): gdjs.SpriteAnimationFrame | null {
      if (!this._animationFrameDirty) {
        return this._animationFrame;
      }
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
          return this._animationFrame;
        }
      }

      //Invalid animation/direction/frame:
      this._animationFrame = null;
      return this._animationFrame;
    }

    /**
     * Update the current frame of the object according to the elapsed time on the scene.
     * @param timeDelta in seconds
     */
    update(timeDelta: float): boolean {
      if (
        this._currentAnimation >= this._animations.length ||
        this._currentDirection >=
          this._animations[this._currentAnimation].directions.length
      ) {
        return false;
      }
      const direction = this._animations[this._currentAnimation].directions[
        this._currentDirection
      ];
      const animationDuration = this.getAnimationDuration();
      if (
        !this._animationPaused &&
        (direction.loop || this._animationElapsedTime !== animationDuration) &&
        direction.timeBetweenFrames
      ) {
        const animationElapsedTime =
          this._animationElapsedTime + timeDelta * this._animationSpeedScale;
        return this.setAnimationElapsedTime(
          direction.loop
            ? gdjs.evtTools.common.mod(animationElapsedTime, animationDuration)
            : gdjs.evtTools.common.clamp(
                animationElapsedTime,
                0,
                animationDuration
              )
        );
      }
      return false;
    }

    setOnFrameChangeCallback(callback: () => void): void {
      this._onFrameChange = callback;
    }

    getAnimationIndex(): number {
      return this._currentAnimation;
    }

    setAnimationIndex(newAnimation: number): boolean {
      newAnimation = newAnimation || 0;
      if (
        newAnimation < this._animations.length &&
        this._currentAnimation !== newAnimation &&
        newAnimation >= 0
      ) {
        this._currentAnimation = newAnimation;
        this._currentFrame = 0;
        this._animationElapsedTime = 0;
        this._animationFrameDirty = true;
        if (this._onFrameChange) {
          this._onFrameChange();
        }
        return true;
      }
      return false;
    }

    getAnimationName(): string {
      if (this._currentAnimation >= this._animations.length) {
        return '';
      }
      return this._animations[this._currentAnimation].name;
    }

    setAnimationName(newAnimationName: string): void {
      if (!newAnimationName) {
        return;
      }
      for (let i = 0; i < this._animations.length; ++i) {
        if (this._animations[i].name === newAnimationName) {
          this.setAnimationIndex(i);
          return;
        }
      }
    }

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
      return (
        this._currentFrame === direction.frames.length - 1 &&
        this._animationElapsedTime ===
          direction.frames.length * direction.timeBetweenFrames
      );
    }

    isAnimationPaused() {
      return this._animationPaused;
    }

    pauseAnimation() {
      this._animationPaused = true;
    }

    resumeAnimation() {
      this._animationPaused = false;
    }

    getAnimationSpeedScale() {
      return this._animationSpeedScale;
    }

    setAnimationSpeedScale(ratio: float): void {
      this._animationSpeedScale = ratio;
    }

    /**
     * Change the current frame displayed by the animation
     * @param newFrame The index of the frame to be displayed
     */
    setAnimationFrame(newFrame: number): boolean {
      if (
        this._currentAnimation >= this._animations.length ||
        this._currentDirection >=
          this._animations[this._currentAnimation].directions.length
      ) {
        return false;
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
        this._animationElapsedTime = newFrame * direction.timeBetweenFrames;
        this._animationFrameDirty = true;
        return true;
      }
      return false;
    }

    /**
     * Get the index of the current frame displayed by the animation
     * @return newFrame The index of the frame being displayed
     */
    getAnimationFrame(): number {
      return this._currentFrame;
    }

    getAnimationElapsedTime(): float {
      return this._animationElapsedTime;
    }

    setAnimationElapsedTime(time: float): boolean {
      const direction = this._animations[this._currentAnimation].directions[
        this._currentDirection
      ];
      this._animationElapsedTime = gdjs.evtTools.common.clamp(
        time,
        0,
        this.getAnimationDuration()
      );

      const oldFrame = this._currentFrame;
      this._currentFrame = Math.min(
        Math.floor(this._animationElapsedTime / direction.timeBetweenFrames),
        direction.frames.length - 1
      );
      if (oldFrame !== this._currentFrame) {
        this._animationFrameDirty = true;
        return true;
      }
      return false;
    }

    getAnimationDuration(): float {
      const direction = this._animations[this._currentAnimation].directions[
        this._currentDirection
      ];
      return direction.frames.length * direction.timeBetweenFrames;
    }

    getAnimationFrameCount(): number {
      if (this._currentAnimation >= this._animations.length) {
        return 0;
      }
      const currentAnimation = this._animations[this._currentAnimation];
      if (this._currentDirection >= currentAnimation.directions.length) {
        return 0;
      }
      return currentAnimation.directions[this._currentDirection].frames.length;
    }

    /**
     * Change the angle (or direction index) of the object
     * @param The new angle (or direction index) to be applied
     * @deprecated
     */
    setDirectionOrAngle(oldValue: float, newValue: float): number | null {
      if (this._currentAnimation >= this._animations.length) {
        return null;
      }
      const anim = this._animations[this._currentAnimation];
      if (!anim.hasMultipleDirections) {
        return oldValue === newValue ? null : newValue;
      } else {
        newValue = newValue | 0;
        if (
          newValue === this._currentDirection ||
          newValue >= anim.directions.length ||
          anim.directions[newValue].frames.length === 0
        ) {
          return null;
        }
        this._currentDirection = newValue;
        this._currentFrame = 0;
        this._animationElapsedTime = 0;
        this._animationFrameDirty = true;
        return 0;
      }
    }

    /**
     * @deprecated
     */
    getDirectionOrAngle(angle: float): float {
      if (this._currentAnimation >= this._animations.length) {
        return 0;
      }
      if (!this._animations[this._currentAnimation].hasMultipleDirections) {
        return angle;
      } else {
        return this._currentDirection;
      }
    }

    /**
     * @deprecated
     */
    getAngle(angle: float): float {
      if (this._currentAnimation >= this._animations.length) {
        return 0;
      }
      if (!this._animations[this._currentAnimation].hasMultipleDirections) {
        return angle;
      } else {
        return this._currentDirection * 45;
      }
    }

    /**
     * @deprecated
     */
    setAngle(oldAngle: float, angle: float): float | null {
      if (this._currentAnimation >= this._animations.length) {
        return null;
      }
      if (!this._animations[this._currentAnimation].hasMultipleDirections) {
        if (oldAngle === angle) {
          return null;
        }
        return angle;
      } else {
        angle = angle % 360;
        if (angle < 0) {
          angle += 360;
        }
        return this.setDirectionOrAngle(oldAngle, Math.round(angle / 45) % 8);
      }
    }

    /**
     * @deprecated
     * Return true if animation has ended.
     * Prefer using `hasAnimationEnded2`. This method returns true as soon as
     * the animation enters the last frame, not at the end of the last frame.
     */
    hasAnimationEndedLegacy(): boolean {
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
  }
}
