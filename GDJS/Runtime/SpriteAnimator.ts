namespace gdjs {
  /** Represents a point in a coordinate system. */
  export type SpritePoint = {
    /** X position of the point. */
    x: float;
    /** Y position of the point. */
    y: float;
  };

  /** Represents a custom point in a frame. */
  export type SpriteCustomPointData = {
    /** Name of the point. */
    name: string;
    /** X position of the point. */
    x: float;
    /** Y position of the point. */
    y: float;
  };

  /** Represents the center point in a frame. */
  export type SpriteCenterPointData = {
    /** Name of the point. */
    name: string;
    /** Is the center automatically computed? */
    automatic: boolean;
    /** X position of the point. */
    x: float;
    /** Y position of the point. */
    y: float;
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
    timeBetweenFrames: float;
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

  /**
   * Abstraction from graphic libraries texture classes.
   */
  export interface AnimationFrameTextureManager<T> {
    getAnimationFrameTexture(imageName: string): T;
    getAnimationFrameWidth(pixiTexture: T);
    getAnimationFrameHeight(pixiTexture: T);
  }

  /**
   * A frame used by a SpriteAnimation in a {@link gdjs.SpriteRuntimeObject}.
   *
   * It contains the texture displayed as well as information like the points position
   * or the collision mask.
   */
  export class SpriteAnimationFrame<T> {
    image: string;

    //TODO: Rename in imageName, and do not store it in the object?
    texture: T;
    center: SpritePoint = { x: 0, y: 0 };
    origin: SpritePoint = { x: 0, y: 0 };
    hasCustomHitBoxes: boolean = false;
    customHitBoxes: gdjs.Polygon[] = [];
    points: Hashtable<SpritePoint>;

    /**
     * @param imageManager The game image manager
     * @param frameData The frame data used to initialize the frame
     */
    constructor(
      frameData: SpriteFrameData,
      textureManager: gdjs.AnimationFrameTextureManager<T>
    ) {
      this.image = frameData ? frameData.image : '';
      this.texture = textureManager.getAnimationFrameTexture(this.image);
      this.points = new Hashtable();
      this.reinitialize(frameData, textureManager);
    }

    /**
     * @param frameData The frame data used to initialize the frame
     * @param textureManager The game image manager
     */
    reinitialize(
      frameData: SpriteFrameData,
      textureManager: gdjs.AnimationFrameTextureManager<T>
    ) {
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
        this.center.x = textureManager.getAnimationFrameWidth(this.texture) / 2;
        this.center.y =
          textureManager.getAnimationFrameHeight(this.texture) / 2;
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
   */
  export class SpriteAnimationDirection<T> {
    timeBetweenFrames: float;
    loop: boolean;
    frames: SpriteAnimationFrame<T>[] = [];

    /**
     * @param imageManager The game image manager
     * @param directionData The direction data used to initialize the direction
     */
    constructor(
      directionData: SpriteDirectionData,
      textureManager: gdjs.AnimationFrameTextureManager<T>
    ) {
      this.timeBetweenFrames = directionData
        ? directionData.timeBetweenFrames
        : 1.0;
      this.loop = !!directionData.looping;
      this.reinitialize(directionData, textureManager);
    }

    /**
     * @param directionData The direction data used to initialize the direction
     * @param textureManager The game image manager
     */
    reinitialize(
      directionData: SpriteDirectionData,
      textureManager: gdjs.AnimationFrameTextureManager<T>
    ) {
      this.timeBetweenFrames = directionData
        ? directionData.timeBetweenFrames
        : 1.0;
      this.loop = !!directionData.looping;
      let i = 0;
      for (const len = directionData.sprites.length; i < len; ++i) {
        const frameData = directionData.sprites[i];
        if (i < this.frames.length) {
          this.frames[i].reinitialize(frameData, textureManager);
        } else {
          this.frames.push(
            new gdjs.SpriteAnimationFrame<T>(frameData, textureManager)
          );
        }
      }
      this.frames.length = i;
    }
  }

  /**
   * Represents an animation of a {@link SpriteRuntimeObject}.
   */
  export class SpriteAnimation<T> {
    hasMultipleDirections: boolean;
    name: string;
    directions: gdjs.SpriteAnimationDirection<T>[] = [];

    /**
     * @param animData The animation data used to initialize the animation
     * @param textureManager The game image manager
     */
    constructor(
      animData: SpriteAnimationData,
      textureManager: gdjs.AnimationFrameTextureManager<T>
    ) {
      this.hasMultipleDirections = !!animData.useMultipleDirections;
      this.name = animData.name || '';
      this.reinitialize(animData, textureManager);
    }

    /**
     * @param animData The animation data used to initialize the animation
     * @param textureManager The game image manager
     */
    reinitialize(
      animData: SpriteAnimationData,
      textureManager: gdjs.AnimationFrameTextureManager<T>
    ) {
      this.hasMultipleDirections = !!animData.useMultipleDirections;
      this.name = animData.name || '';
      let i = 0;
      for (const len = animData.directions.length; i < len; ++i) {
        const directionData = animData.directions[i];
        if (i < this.directions.length) {
          this.directions[i].reinitialize(directionData, textureManager);
        } else {
          this.directions.push(
            new gdjs.SpriteAnimationDirection(directionData, textureManager)
          );
        }
      }
      // Make sure to delete already existing directions which are not used anymore.
      this.directions.length = i;
    }
  }

  /**
   * Image-base animation model.
   */
  export class SpriteAnimator<T> implements gdjs.Animatable {
    _animations: gdjs.SpriteAnimation<T>[] = [];
    _textureManager: gdjs.AnimationFrameTextureManager<T>;
    /**
     * Reference to the current SpriteAnimationFrame that is displayed.
     * Can be null, so ensure that this case is handled properly.
     */
    private _animationFrame: gdjs.SpriteAnimationFrame<T> | null = null;
    private _animationFrameDirty: boolean = true;

    private _currentAnimation: integer = 0;
    private _currentDirection: integer = 0;
    private _currentFrameIndex: integer = 0;
    /** In seconds */
    private _animationElapsedTime: float = 0;
    private _animationSpeedScale: float = 1;
    private _animationPaused: boolean = false;
    private _onFrameChange: (() => void) | null = null;

    /**
     * @param frameData The frame data used to initialize the frame
     * @param textureManager The game image manager
     */
    constructor(
      animations: Array<SpriteAnimationData>,
      textureManager: gdjs.AnimationFrameTextureManager<T>
    ) {
      this._textureManager = textureManager;
      for (let i = 0, len = animations.length; i < len; ++i) {
        this._animations.push(
          new gdjs.SpriteAnimation(animations[i], textureManager)
        );
      }
    }

    invalidateFrame() {
      this._animationFrameDirty = true;
      if (this._onFrameChange) {
        this._onFrameChange();
      }
    }

    reinitialize(animations: Array<SpriteAnimationData>) {
      this._currentAnimation = 0;
      this._currentDirection = 0;
      this._currentFrameIndex = 0;
      this._animationElapsedTime = 0;
      this._animationSpeedScale = 1;
      this._animationPaused = false;

      let i = 0;
      for (const len = animations.length; i < len; ++i) {
        const animData = animations[i];
        if (i < this._animations.length) {
          this._animations[i].reinitialize(animData, this._textureManager);
        } else {
          this._animations.push(
            new gdjs.SpriteAnimation(animData, this._textureManager)
          );
        }
      }
      this._animations.length = i;

      // Make sure to delete already existing animations which are not used anymore.
      this._animationFrame = null;
      this.invalidateFrame();
    }

    updateFromObjectData(
      oldAnimations: Array<SpriteAnimationData>,
      newAnimations: Array<SpriteAnimationData>
    ): boolean {
      let i = 0;
      for (const len = newAnimations.length; i < len; ++i) {
        const animData = newAnimations[i];
        if (i < this._animations.length) {
          this._animations[i].reinitialize(animData, this._textureManager);
        } else {
          this._animations.push(
            new gdjs.SpriteAnimation(animData, this._textureManager)
          );
        }
      }
      this._animations.length = i;

      // Make sure to delete already existing animations which are not used anymore.
      this.invalidateFrame();
      const animationFrame = this.getCurrentFrame();
      if (!animationFrame) {
        this.setAnimationIndex(0);
      }
      return true;
    }

    /**
     * @returns Returns the current frame or null if the current animation doesn't have any frame.
     */
    getCurrentFrame(): gdjs.SpriteAnimationFrame<T> | null {
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
        if (this._currentFrameIndex < direction.frames.length) {
          this._animationFrame = direction.frames[this._currentFrameIndex];
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
    step(timeDelta: float): boolean {
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

    /**
     * Register a listener to frame changes.
     *
     * It's useful for custom objects as they don't drive this class themselves.
     *
     * @param callback Called each time {@link getCurrentFrame} changes.
     */
    setOnFrameChangeCallback(callback: () => void): void {
      this._onFrameChange = callback;
    }

    getAnimationIndex(): integer {
      return this._currentAnimation;
    }

    setAnimationIndex(newAnimation: integer): boolean {
      // Truncate the index.
      newAnimation = newAnimation | 0;
      if (
        newAnimation < this._animations.length &&
        this._currentAnimation !== newAnimation &&
        newAnimation >= 0
      ) {
        this._currentAnimation = newAnimation;
        this._currentFrameIndex = 0;
        this._animationElapsedTime = 0;
        this.invalidateFrame();
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

    setAnimationName(newAnimationName: string): boolean {
      if (!newAnimationName) {
        return false;
      }
      for (let i = 0; i < this._animations.length; ++i) {
        if (this._animations[i].name === newAnimationName) {
          this.setAnimationIndex(i);
          return true;
        }
      }
      return false;
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
        this._currentFrameIndex === direction.frames.length - 1 &&
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
     * @param newFrameIndex The index of the frame to be displayed
     */
    setAnimationFrameIndex(newFrameIndex: integer): boolean {
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
        newFrameIndex >= 0 &&
        newFrameIndex < direction.frames.length &&
        newFrameIndex !== this._currentFrameIndex
      ) {
        this._currentFrameIndex = newFrameIndex;
        this._animationElapsedTime =
          newFrameIndex * direction.timeBetweenFrames;
        this.invalidateFrame();
        return true;
      }
      return false;
    }

    /**
     * Get the index of the current frame displayed by the animation
     * @return newFrame The index of the frame being displayed
     */
    getAnimationFrameIndex(): integer {
      return this._currentFrameIndex;
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

      const oldFrame = this._currentFrameIndex;
      this._currentFrameIndex = Math.min(
        Math.floor(this._animationElapsedTime / direction.timeBetweenFrames),
        direction.frames.length - 1
      );
      if (oldFrame !== this._currentFrameIndex) {
        this.invalidateFrame();
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

    getAnimationFrameCount(): integer {
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
    setDirectionOrAngle(oldValue: float, newValue: float): float | null {
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
        this._currentFrameIndex = 0;
        this._animationElapsedTime = 0;
        this.invalidateFrame();
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
     * Prefer using {@link hasAnimationEnded}. This method returns true as soon as
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
      return this._currentFrameIndex === direction.frames.length - 1;
    }
  }
}
