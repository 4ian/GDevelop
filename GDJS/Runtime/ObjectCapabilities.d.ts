/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
declare namespace gdjs {
  export interface Resizable {
    /**
     * Change the width of the object. This changes the scale on X axis of the object.
     *
     * @param newWidth The new width of the object, in pixels.
     */
    setWidth(newWidth: float): void;

    /**
     * Change the height of the object. This changes the scale on Y axis of the object.
     *
     * @param newHeight The new height of the object, in pixels.
     */
    setHeight(newHeight: float): void;

    /**
     * Change the size of the object.
     *
     * @param newWidth The new width of the object, in pixels.
     * @param newHeight The new height of the object, in pixels.
     */
    setSize(newWidth: float, newHeight: float): void;
  }

  export interface Scalable {
    /**
     * Change the scale on X and Y axis of the object.
     *
     * @param newScale The new scale (must be greater than 0).
     */
    setScale(newScale: number): void;

    /**
     * Change the scale on X axis of the object (changing its width).
     *
     * @param newScale The new scale (must be greater than 0).
     */
    setScaleX(newScale: number): void;

    /**
     * Change the scale on Y axis of the object (changing its height).
     *
     * @param newScale The new scale (must be greater than 0).
     */
    setScaleY(newScale: number): void;

    /**
     * Get the scale of the object (or the average of the X and Y scale in case they are different).
     *
     * @return the scale of the object (or the average of the X and Y scale in case they are different).
     */
    getScale(): number;

    /**
     * Get the scale of the object on Y axis.
     *
     * @return the scale of the object on Y axis
     */
    getScaleY(): float;

    /**
     * Get the scale of the object on X axis.
     *
     * @return the scale of the object on X axis
     */
    getScaleX(): float;
  }

  export interface Flippable {
    flipX(enable: boolean): void;

    flipY(enable: boolean): void;

    isFlippedX(): boolean;

    isFlippedY(): boolean;
  }

  export interface Animable {
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
}
