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
  }

  /**
   * A behavior that forward the Resizable interface to its object.
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

    updateFromBehaviorData(oldBehaviorData, newBehaviorData): boolean {
      // Nothing to update.
      return true;
    }

    onDeActivate() {}

    onDestroy() {}

    doStepPreEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {}

    doStepPostEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {}

    setWidth(newWidth: number): void {
      this.object.setWidth(newWidth);
    }

    setHeight(newHeight: number): void {
      this.object.setHeight(newHeight);
    }

    setSize(newWidth: number, newHeight: number): void {
      this.object.setSize(newWidth, newHeight);
    }
  }

  gdjs.registerBehavior(
    'ResizableCapability::ResizableBehavior',
    gdjs.ResizableBehavior
  );
}
