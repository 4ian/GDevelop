/*
 * GDevelop JS Platform
 * Copyright 2013-2023 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  export interface Flippable {
    flipX(enable: boolean): void;

    flipY(enable: boolean): void;

    isFlippedX(): boolean;

    isFlippedY(): boolean;
  }

  /**
   * A behavior that forwards the Flippable interface to its object.
   */
  export class FlippableBehavior
    extends gdjs.RuntimeBehavior
    implements Flippable {
    private object: gdjs.RuntimeObject & Flippable;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      behaviorData,
      owner: gdjs.RuntimeObject & Flippable
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

    flipX(enable: boolean): void {
      this.object.flipX(enable);
    }

    flipY(enable: boolean): void {
      this.object.flipY(enable);
    }

    isFlippedX(): boolean {
      return this.object.isFlippedX();
    }

    isFlippedY(): boolean {
      return this.object.isFlippedY();
    }
  }

  gdjs.registerBehavior(
    'FlippableCapability::FlippableBehavior',
    gdjs.FlippableBehavior
  );
}
