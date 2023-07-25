/*
 * GDevelop JS Platform
 * Copyright 2013-2023 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  export interface OpacityHandler {
    /**
     * Change the transparency of the object.
     * @param opacity The new opacity, between 0 (transparent) and 255 (opaque).
     */
    setOpacity(opacity: float): void;

    /**
     * Get the transparency of the object.
     * @return The opacity, between 0 (transparent) and 255 (opaque).
     */
    getOpacity(): number;
  }

  /**
   * A behavior that forward the Opacity interface to its object.
   */
  export class OpacityBehavior
    extends gdjs.RuntimeBehavior
    implements OpacityHandler {
    private object: gdjs.RuntimeObject & OpacityHandler;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      behaviorData,
      owner: gdjs.RuntimeObject & OpacityHandler
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

    setOpacity(opacity: number): void {
      this.object.setOpacity(opacity);
    }

    getOpacity(): number {
      return this.object.getOpacity();
    }
  }

  gdjs.registerBehavior(
    'OpacityCapability::OpacityBehavior',
    gdjs.OpacityBehavior
  );
}
