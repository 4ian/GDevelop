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
     * Return the Z position of the object center, **relative to the scene origin**.
     */
    getCenterZInScene(): float;

    /**
     * Change the object center Z position in the scene.
     * @param z The new Z position of the center in the scene.
     */
    setCenterZInScene(z: float): void;

    /**
     * Set the object rotation on the X axis.
     *
     * This is an Euler angle. Objects use the `ZYX` order.
     *
     * @param angle the rotation angle on the X axis in degree
     */
    setRotationX(angle: float): void;

    /**
     * Set the object rotation on the Y axis.
     *
     * This is an Euler angle. Objects use the `ZYX` order.
     *
     * @param angle the rotation angle on the Y axis in degree
     */
    setRotationY(angle: float): void;

    /**
     * Get the object rotation on the X axis in degree.
     *
     * This is an Euler angle. Objects use the `ZYX` order.
     */
    getRotationX(): float;

    /**
     * Get the object rotation on the Y axis in degree.
     *
     * This is an Euler angle. Objects use the `ZYX` order.
     */
    getRotationY(): float;

    /**
     * Turn the object around the scene X axis at its center.
     * @param deltaAngle the rotation angle in degree
     */
    turnAroundX(deltaAngle: float): void;

    /**
     * Turn the object around the scene Y axis at its center.
     * @param deltaAngle the rotation angle in degree
     */
    turnAroundY(deltaAngle: float): void;

    /**
     * Turn the object around the scene Z axis at its center.
     * @param deltaAngle the rotation angle in degree
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
     * Change the scale on Z axis of the object (changing its depth).
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

    /**
     * Return the bottom Z of the object.
     * Rotations around X and Y are not taken into account.
     */
    getUnrotatedAABBMinZ(): number;

    /**
     * Return the top Z of the object.
     * Rotations around X and Y are not taken into account.
     */
    getUnrotatedAABBMaxZ(): number;
  }

  export namespace Base3DHandler {
    export const is3D = (
      object: gdjs.RuntimeObject
    ): object is gdjs.RuntimeObject & gdjs.Base3DHandler => {
      //@ts-ignore We are checking if the methods are present.
      return object.getZ && object.setZ;
    };
  }

  /**
   * A behavior that forwards the Base3D interface to its object.
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

    setZ(z: float): void {
      this.object.setZ(z);
    }

    getZ(): float {
      return this.object.getZ();
    }

    getCenterZInScene(): number {
      return this.object.getCenterZInScene();
    }

    setCenterZInScene(z: number): void {
      this.object.setCenterZInScene(z);
    }

    setRotationX(angle: float): void {
      this.object.setRotationX(angle);
    }

    setRotationY(angle: float): void {
      this.object.setRotationY(angle);
    }

    getRotationX(): float {
      return this.object.getRotationX();
    }

    getRotationY(): float {
      return this.object.getRotationY();
    }

    turnAroundX(deltaAngle: float): void {
      this.object.turnAroundX(deltaAngle);
    }

    turnAroundY(deltaAngle: float): void {
      this.object.turnAroundY(deltaAngle);
    }

    turnAroundZ(deltaAngle: float): void {
      this.object.turnAroundZ(deltaAngle);
    }

    getDepth(): float {
      return this.object.getDepth();
    }

    setDepth(depth: float): void {
      this.object.setDepth(depth);
    }

    setScaleZ(newScale: number): void {
      this.object.setScaleZ(newScale);
    }

    getScaleZ(): float {
      return this.object.getScaleZ();
    }

    flipZ(enable: boolean): void {
      this.object.flipZ(enable);
    }

    isFlippedZ(): boolean {
      return this.object.isFlippedZ();
    }

    getUnrotatedAABBMinZ(): number {
      return this.object.getUnrotatedAABBMinZ();
    }

    getUnrotatedAABBMaxZ(): number {
      return this.object.getUnrotatedAABBMaxZ();
    }
  }

  gdjs.registerBehavior('Scene3D::Base3DBehavior', gdjs.Base3DBehavior);
}
