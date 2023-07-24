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
    getAnimationIndex(): number;

    /**
     * Change the animation being played.
     * @param animationIndex The index of the new animation to be played
     */
    setAnimationIndex(animationIndex: number): void;

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

    isCurrentAnimationName(name: string): boolean;

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
  }

  /**
   * A behavior that forward the Animatable interface to its object.
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

    updateFromBehaviorData(oldBehaviorData, newBehaviorData): boolean {
      // Nothing to update.
      return true;
    }

    onDeActivate() {}

    onDestroy() {}

    doStepPreEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {}

    doStepPostEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {}

    getAnimationIndex(): number {
      return this.object.getAnimationIndex();
    }

    setAnimationIndex(animationIndex: number): void {
      this.object.setAnimationIndex(animationIndex);
    }

    getAnimationName(): string {
      return this.object.getAnimationName();
    }

    setAnimationName(newAnimationName: string): void {
      this.object.setAnimationName(newAnimationName);
    }

    isCurrentAnimationName(name: string): boolean {
      return this.object.isCurrentAnimationName(name);
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

    getAnimationSpeedScale(): number {
      return this.object.getAnimationSpeedScale();
    }

    setAnimationSpeedScale(ratio: number): void {
      this.object.setAnimationSpeedScale(ratio);
    }
  }

  gdjs.registerBehavior(
    'AnimatableCapability::AnimatableBehavior',
    gdjs.AnimatableBehavior
  );
}
