namespace gdjs {
  type Animation = {
    /** The name of the animation. */
    name: string;
    /** Time between each frame, in seconds. */
    timeBetweenFrames: float;
    duration: float;
    /** Is the animation looping? */
    looping: boolean;
    /** The list of frames. */
    frames: Array<SpriteFrameData>;
  };

  /**
   *
   */
  export class SpriteAnimator implements gdjs.Animatable {
    _animations: Animation[];
    _currentAnimationIndex: integer = 0;
    _animationElapsedTime: float = 0;
    _currentFrameIndex: integer = 0;
    _animationSpeedScale: float = 1;
    _animationPaused: boolean = false;
    _onFrameChange: (() => void) | null = null;

    constructor(animations: Array<SpriteAnimationData>) {
      this._animations = animations.map((animation) => {
        const direction = animation.directions[0];
        return {
          name: animation.name,
          timeBetweenFrames: direction.timeBetweenFrames,
          duration: direction.timeBetweenFrames * direction.sprites.length,
          looping: direction.looping,
          frames: direction.sprites,
        };
      });
    }

    /**
     *
     * @param timeDelta in seconds
     */
    step(timeDelta: float): void {
      const currentAnimation = this._animations[this._currentAnimationIndex];
      if (!currentAnimation) {
        return;
      }
      const animationDuration = currentAnimation.duration;
      if (
        !this._animationPaused &&
        (currentAnimation.looping ||
          this._animationElapsedTime !== animationDuration)
      ) {
        const animationElapsedTime =
          this._animationElapsedTime + timeDelta * this._animationSpeedScale;
        this.setAnimationElapsedTime(
          currentAnimation.looping
            ? gdjs.evtTools.common.mod(animationElapsedTime, animationDuration)
            : gdjs.evtTools.common.clamp(
                animationElapsedTime,
                0,
                animationDuration
              )
        );
      }
    }

    setOnFrameChangeCallback(callback: () => void): void {
      this._onFrameChange = callback;
    }

    getCurrentFrameResourceName(): string | null {
      const currentAnimation = this._animations[this._currentAnimationIndex];
      if (!currentAnimation) {
        return null;
      }
      const currentFrame = currentAnimation.frames[this._currentFrameIndex];
      if (!currentFrame) {
        return null;
      }
      return currentFrame.image;
    }

    getAnimationIndex(): number {
      return this._currentAnimationIndex;
    }

    setAnimationIndex(animationIndex: number): void {
      animationIndex = animationIndex || 0;
      if (
        animationIndex < this._animations.length &&
        this._currentAnimationIndex !== animationIndex &&
        animationIndex >= 0
      ) {
        this._currentAnimationIndex = animationIndex;
        this._animationElapsedTime = 0;
        this._currentFrameIndex = 0;
        if (this._onFrameChange) {
          this._onFrameChange();
        }
      }
    }

    getAnimationName(): string {
      if (this._currentAnimationIndex >= this._animations.length) {
        return '';
      }
      return this._animations[this._currentAnimationIndex].name;
    }

    setAnimationName(newAnimationName: string): void {
      if (!newAnimationName) {
        return;
      }
      const animationIndex = this._animations.findIndex(
        (animation) => animation.name === newAnimationName
      );
      if (animationIndex >= 0) {
        this.setAnimationIndex(animationIndex);
      }
    }

    hasAnimationEnded(): boolean {
      const currentAnimation = this._animations[this._currentAnimationIndex];
      if (!currentAnimation) {
        return true;
      }
      if (currentAnimation.looping) {
        return false;
      }
      return (
        this._currentFrameIndex === currentAnimation.frames.length - 1 &&
        this._animationElapsedTime === currentAnimation.duration
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

    getAnimationElapsedTime(): float {
      return this._animationElapsedTime;
    }

    setAnimationElapsedTime(time: float): void {
      const currentAnimation = this._animations[this._currentAnimationIndex];
      if (!currentAnimation) {
        return;
      }
      this._animationElapsedTime = gdjs.evtTools.common.clamp(
        time,
        0,
        currentAnimation.duration
      );
      const oldFrame = this._currentFrameIndex;
      this._currentFrameIndex = Math.min(
        Math.floor(
          this._animationElapsedTime / currentAnimation.timeBetweenFrames
        ),
        currentAnimation.frames.length - 1
      );
      if (oldFrame !== this._currentFrameIndex) {
        if (this._onFrameChange) {
          this._onFrameChange();
        }
      }
    }

    getAnimationDuration(): float {
      const currentAnimation = this._animations[this._currentAnimationIndex];
      return currentAnimation ? currentAnimation.duration : 0;
    }
  }
}
