/*
 * GDevelop JS Platform
 * Copyright 2013-2023 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  export interface Animatable {
    /**
     * Get the index of the animation being played.
     * @return The index of the new animation being played
     */
    getAnimationIndex(): integer;

    /**
     * Change the animation being played.
     * @param animationIndex The index of the new animation to be played
     */
    setAnimationIndex(animationIndex: integer): void;

    /**
     * Get the name of the animation being played.
     * @return The name of the new animation being played
     */
    getAnimationName(): string;

    /**
     * Change the animation being played.
     * @param newAnimationName The name of the new animation to be played
     */
    setAnimationName(newAnimationName: string): void;

    /**
     * Return true if animation has ended.
     * The animation had ended if:
     * - it's not configured as a loop;
     * - the current frame is the last frame;
     * - the last frame has been displayed long enough.
     */
    hasAnimationEnded(): boolean;

    isAnimationPaused(): boolean;

    pauseAnimation(): void;

    resumeAnimation(): void;

    getAnimationSpeedScale(): float;

    setAnimationSpeedScale(ratio: float): void;

    /**
     * @return The elapsed time from the start of the animation in seconds.
     */
    getAnimationElapsedTime(): float;

    /**
     * Set the elapsed time from the start of the animation in seconds.
     * @param time The time in seconds
     */
    setAnimationElapsedTime(time: float): void;

    /**
     * @return The duration of the current animation in seconds.
     */
    getAnimationDuration(): float;
  }

  /**
   * A behavior that forwards the Animatable interface to its object.
   */
  export class AnimatableBehavior
    extends gdjs.RuntimeBehavior
    implements Animatable {
    private object: gdjs.RuntimeObject & Animatable;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      behaviorData,
      owner: gdjs.RuntimeObject & Animatable
    ) {
      super(instanceContainer, behaviorData, owner);
      this.object = owner;
    }

    usesLifecycleFunction(): boolean {
      return false;
    }

    updateFromBehaviorData(oldBehaviorData, newBehaviorData): boolean {
      // Nothing to update.
      return true;
    }

    onDeActivate() {}

    onDestroy() {}

    doStepPreEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {}

    doStepPostEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {}

    getAnimationIndex(): integer {
      return this.object.getAnimationIndex();
    }

    setAnimationIndex(animationIndex: integer): void {
      this.object.setAnimationIndex(animationIndex);
    }

    getAnimationName(): string {
      return this.object.getAnimationName();
    }

    setAnimationName(newAnimationName: string): void {
      this.object.setAnimationName(newAnimationName);
    }

    hasAnimationEnded(): boolean {
      return this.object.hasAnimationEnded();
    }

    isAnimationPaused(): boolean {
      return this.object.isAnimationPaused();
    }

    pauseAnimation(): void {
      this.object.pauseAnimation();
    }

    resumeAnimation(): void {
      this.object.resumeAnimation();
    }

    getAnimationSpeedScale(): float {
      return this.object.getAnimationSpeedScale();
    }

    setAnimationSpeedScale(ratio: float): void {
      this.object.setAnimationSpeedScale(ratio);
    }

    getAnimationElapsedTime(): float {
      return this.object.getAnimationElapsedTime();
    }

    setAnimationElapsedTime(time: float): void {
      this.object.setAnimationElapsedTime(time);
    }

    getAnimationDuration(): float {
      return this.object.getAnimationDuration();
    }
  }

  gdjs.registerBehavior(
    'AnimatableCapability::AnimatableBehavior',
    gdjs.AnimatableBehavior
  );
}
