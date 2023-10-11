/*
 * GDevelop JS Platform
 * Copyright 2013-2023 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
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

    /**
     * Return the width of the object.
     * @return The width of the object
     */
    getWidth(): float;

    /**
     * Return the width of the object.
     * @return The height of the object
     */
    getHeight(): float;
  }

  /**
   * A behavior that forwards the Resizable interface to its object.
   */
  export class ResizableBehavior
    extends gdjs.RuntimeBehavior
    implements Resizable {
    private object: gdjs.RuntimeObject & Resizable;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      behaviorData,
      owner: gdjs.RuntimeObject & Resizable
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

    setWidth(newWidth: float): void {
      this.object.setWidth(newWidth);
    }

    setHeight(newHeight: float): void {
      this.object.setHeight(newHeight);
    }

    setSize(newWidth: float, newHeight: float): void {
      this.object.setSize(newWidth, newHeight);
    }

    getWidth(): float {
      return this.object.getWidth();
    }

    getHeight(): float {
      return this.object.getHeight();
    }
  }

  gdjs.registerBehavior(
    'ResizableCapability::ResizableBehavior',
    gdjs.ResizableBehavior
  );
}
