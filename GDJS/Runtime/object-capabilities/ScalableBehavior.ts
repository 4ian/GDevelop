/*
 * GDevelop JS Platform
 * Copyright 2013-2023 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  export interface Scalable {
    /**
     * Change the scale on X and Y axis of the object.
     *
     * @param newScale The new scale (must be greater than 0).
     */
    setScale(newScale: float): void;

    /**
     * Change the scale on X axis of the object (changing its width).
     *
     * @param newScale The new scale (must be greater than 0).
     */
    setScaleX(newScale: float): void;

    /**
     * Change the scale on Y axis of the object (changing its height).
     *
     * @param newScale The new scale (must be greater than 0).
     */
    setScaleY(newScale: float): void;

    /**
     * Get the scale of the object (or the geometric mean of the X and Y scale
     * in case they are different).
     *
     * @return the scale of the object (or the geometric mean of the X and
     * Y scale in case they are different).
     */
    getScale(): float;

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

  /**
   * A behavior that forwards the Scalable interface to its object.
   */
  export class ScalableBehavior
    extends gdjs.RuntimeBehavior
    implements Scalable {
    private object: gdjs.RuntimeObject & Scalable;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      behaviorData,
      owner: gdjs.RuntimeObject & Scalable
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

    setScale(newScale: float): void {
      this.object.setScale(newScale);
    }

    setScaleX(newScale: float): void {
      this.object.setScaleX(newScale);
    }

    setScaleY(newScale: float): void {
      this.object.setScaleY(newScale);
    }

    getScale(): float {
      return this.object.getScale();
    }

    getScaleY(): float {
      return this.object.getScaleY();
    }

    getScaleX(): float {
      return this.object.getScaleX();
    }
  }

  gdjs.registerBehavior(
    'ScalableCapability::ScalableBehavior',
    gdjs.ScalableBehavior
  );
}
