/*
 * GDevelop JS Platform
 * Copyright 2013-2023 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  export interface Base3DHandler {
    /**
     * Set the object position on the Z axis.
     */
    setZ(z: float): void;

    /**
     * Get the object position on the Z axis.
     */
    getZ(): float;

    /**
     * Set the object rotation on the X axis.
     *
     * This is an Euler angle. Objects use the `ZYX` order.
     */
    setRotationX(angle: float): void;

    /**
     * Set the object rotation on the Y axis.
     *
     * This is an Euler angle. Objects use the `ZYX` order.
     */
    setRotationY(angle: float): void;

    /**
     * Get the object rotation on the X axis.
     *
     * This is an Euler angle. Objects use the `ZYX` order.
     */
    getRotationX(): float;

    /**
     * Get the object rotation on the Y axis.
     *
     * This is an Euler angle. Objects use the `ZYX` order.
     */
    getRotationY(): float;

    /**
     * Turn the object around the scene x axis at its center.
     * @param deltaAngle the rotation angle
     */
    turnAroundX(deltaAngle: float): void;

    /**
     * Turn the object around the scene y axis at its center.
     * @param deltaAngle the rotation angle
     */
    turnAroundY(deltaAngle: float): void;

    /**
     * Turn the object around the scene z axis at its center.
     * @param deltaAngle the rotation angle
     */
    turnAroundZ(deltaAngle: float): void;

    /**
     * Get the object size on the Z axis (called "depth").
     */
    getDepth(): float;

    /**
     * Set the object size on the Z axis (called "depth").
     */
    setDepth(depth: float): void;

    /**
     * Change the scale on Z axis of the object (changing its height).
     *
     * @param newScale The new scale (must be greater than 0).
     */
    setScaleZ(newScale: number): void;

    /**
     * Get the scale of the object on Z axis.
     *
     * @return the scale of the object on Z axis
     */
    getScaleZ(): float;

    flipZ(enable: boolean): void;

    isFlippedZ(): boolean;
  }

  /**
   * A behavior that forward the Base3D interface to its object.
   */
  export class Base3DBehavior
    extends gdjs.RuntimeBehavior
    implements Base3DHandler {
    private object: gdjs.RuntimeObject & Base3DHandler;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      behaviorData,
      owner: gdjs.RuntimeObject & Base3DHandler
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

    /**
     * Set the object position on the Z axis.
     */
    setZ(z: float): void {
      this.object.setZ(z);
    }

    /**
     * Get the object position on the Z axis.
     */
    getZ(): float {
      return this.object.getZ();
    }

    /**
     * Set the object rotation on the X axis.
     *
     * This is an Euler angle. Objects use the `ZYX` order.
     */
    setRotationX(angle: float): void {
      this.object.setRotationX(angle);
    }

    /**
     * Set the object rotation on the Y axis.
     *
     * This is an Euler angle. Objects use the `ZYX` order.
     */
    setRotationY(angle: float): void {
      this.object.setRotationY(angle);
    }

    /**
     * Get the object rotation on the X axis.
     *
     * This is an Euler angle. Objects use the `ZYX` order.
     */
    getRotationX(): float {
      return this.object.getRotationX();
    }

    /**
     * Get the object rotation on the Y axis.
     *
     * This is an Euler angle. Objects use the `ZYX` order.
     */
    getRotationY(): float {
      return this.object.getRotationY();
    }

    /**
     * Turn the object around the scene x axis at its center.
     * @param deltaAngle the rotation angle
     */
    turnAroundX(deltaAngle: float): void {
      this.object.turnAroundX(deltaAngle);
    }

    /**
     * Turn the object around the scene y axis at its center.
     * @param deltaAngle the rotation angle
     */
    turnAroundY(deltaAngle: float): void {
      this.object.turnAroundY(deltaAngle);
    }

    /**
     * Turn the object around the scene z axis at its center.
     * @param deltaAngle the rotation angle
     */
    turnAroundZ(deltaAngle: float): void {
      this.object.turnAroundZ(deltaAngle);
    }

    /**
     * Get the object size on the Z axis (called "depth").
     */
    getDepth(): float {
      return this.object.getDepth();
    }

    /**
     * Set the object size on the Z axis (called "depth").
     */
    setDepth(depth: float): void {
      this.object.setDepth(depth);
    }

    /**
     * Change the scale on Z axis of the object (changing its height).
     *
     * @param newScale The new scale (must be greater than 0).
     */
    setScaleZ(newScale: number): void {
      this.object.setScaleZ(newScale);
    }

    /**
     * Get the scale of the object on Z axis.
     *
     * @return the scale of the object on Z axis
     */
    getScaleZ(): float {
      return this.object.getScaleZ();
    }

    flipZ(enable: boolean): void {
      this.object.flipZ(enable);
    }

    isFlippedZ(): boolean {
      return this.object.isFlippedZ();
    }
  }

  gdjs.registerBehavior('Scene3D::Base3DBehavior', gdjs.Base3DBehavior);
}
