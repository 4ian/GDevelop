/*
 * GDevelop JS Platform
 * Copyright 2013-2023 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  /**
   * @category Objects > 3D Objects
   */
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
     * Get the X component of the forward vector of the object.
     */
    getForwardX(): float;

    /**
     * Get the Y component of the forward vector of the object.
     */
    getForwardY(): float;

    /**
     * Get the Z component of the forward vector of the object.
     */
    getForwardZ(): float;

    /**
     * Get the X component of the up vector of the object.
     */
    getUpX(): float;

    /**
     * Get the Y component of the up vector of the object.
     */
    getUpY(): float;

    /**
     * Get the Z component of the up vector of the object.
     */
    getUpZ(): float;

    /**
     * Get the X component of the right vector of the object.
     */
    getRightX(): float;

    /**
     * Get the Y component of the right vector of the object.
     */
    getRightY(): float;

    /**
     * Get the Z component of the right vector of the object.
     */
    getRightZ(): float;

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
    setScaleZ(newScale: float): void;

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
    getUnrotatedAABBMinZ(): float;

    /**
     * Return the top Z of the object.
     * Rotations around X and Y are not taken into account.
     */
    getUnrotatedAABBMaxZ(): float;

    /**
     * Return the depth of the object before any custom size is applied.
     * @return The depth of the object
     */
    getOriginalDepth(): float;
  }

  /** @category Objects > 3D Objects */
  export interface Object3DDataContent {
    width: float;
    height: float;
    depth: float;
  }

  /** @internal */
  export type BoneAttachmentFailure =
    | 'deleted-object'
    | 'container-mismatch'
    | 'layer-mismatch'
    | 'layer-group-mismatch'
    | 'renderer-parent-mismatch'
    | 'missing-bone'
    | 'ambiguous-bone'
    | 'invalid-bone-transform';

  /** @internal */
  export type Model3DBoneAttachment = {
    target: gdjs.Model3DRuntimeObject;
    boneName: string;
    positionOffset: [number, number, number];
    rotationOffset: [number, number, number];
    isResolved: boolean;
    lastFailure: gdjs.BoneAttachmentFailure | null;
  };
  /**
   * Base parameters for {@link gdjs.RuntimeObject3D}
   * @category Objects > 3D Objects
   */
  export interface Object3DData extends ObjectData {
    /** The base parameters of the RuntimeObject3D */
    content: Object3DDataContent;
  }

  /** @category Objects > 3D Objects */
  export namespace Base3DHandler {
    export const is3D = (
      object: gdjs.RuntimeObject
    ): object is gdjs.RuntimeObject &
      gdjs.Base3DHandler &
      gdjs.Resizable &
      gdjs.Scalable &
      gdjs.Flippable => {
      //@ts-ignore We are checking if the methods are present.
      return object.getZ && object.setZ;
    };
  }

  /**
   * A behavior that forwards the Base3D interface to its object.
   * @category Core Engine > Behavior
   */
  export class Base3DBehavior
    extends gdjs.RuntimeBehavior
    implements Base3DHandler
  {
    private object: gdjs.RuntimeObject & Base3DHandler;
    private _model3DBoneAttachment: gdjs.Model3DBoneAttachment | null = null;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      behaviorData,
      owner: gdjs.RuntimeObject & Base3DHandler
    ) {
      super(instanceContainer, behaviorData, owner);
      this.object = owner;
    }

    override applyBehaviorOverriding(behaviorData): boolean {
      // Nothing to update.
      return true;
    }

    onDeActivate() {}

    onDestroy() {
      const manager = gdjs.Model3DBoneAttachmentManager.getForScene(
        this.owner.getRuntimeScene()
      );
      if (manager) manager.detach(this);
      this._model3DBoneAttachment = null;
    }

    doStepPreEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {}

    doStepPostEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {}

    /** @internal */
    _getModel3DBoneAttachment(): gdjs.Model3DBoneAttachment | null {
      return this._model3DBoneAttachment;
    }

    /** @internal */
    _setModel3DBoneAttachment(
      attachment: gdjs.Model3DBoneAttachment | null
    ): void {
      this._model3DBoneAttachment = attachment;
    }

    attachToModelBone(
      target: gdjs.Model3DRuntimeObject,
      boneName: string
    ): void {
      gdjs.Model3DBoneAttachmentManager.getOrCreateForScene(
        this.owner.getRuntimeScene()
      ).attach(this, target, boneName);
    }

    detachFromModelBone(): void {
      const manager = gdjs.Model3DBoneAttachmentManager.getForScene(
        this.owner.getRuntimeScene()
      );
      if (manager) manager.detach(this);
      else this._model3DBoneAttachment = null;
    }

    setBoneAttachmentPositionOffset(x: float, y: float, z: float): void {
      const attachment = this._model3DBoneAttachment;
      if (!attachment) return;
      attachment.positionOffset[0] = x;
      attachment.positionOffset[1] = y;
      attachment.positionOffset[2] = z;
      const manager = gdjs.Model3DBoneAttachmentManager.getForScene(
        this.owner.getRuntimeScene()
      );
      if (manager) manager.synchronizeBehavior(this);
    }

    setBoneAttachmentRotationOffset(x: float, y: float, z: float): void {
      const attachment = this._model3DBoneAttachment;
      if (!attachment) return;
      attachment.rotationOffset[0] = x;
      attachment.rotationOffset[1] = y;
      attachment.rotationOffset[2] = z;
      const manager = gdjs.Model3DBoneAttachmentManager.getForScene(
        this.owner.getRuntimeScene()
      );
      if (manager) manager.synchronizeBehavior(this);
    }

    isAttachedToModelBone(): boolean {
      return !!this._model3DBoneAttachment;
    }

    isBoneAttachmentResolved(): boolean {
      return !!this._model3DBoneAttachment?.isResolved;
    }

    getAttachedBoneName(): string {
      return this._model3DBoneAttachment?.boneName || '';
    }

    getBoneAttachmentOffsetX(): float {
      return this._model3DBoneAttachment?.positionOffset[0] || 0;
    }

    getBoneAttachmentOffsetY(): float {
      return this._model3DBoneAttachment?.positionOffset[1] || 0;
    }

    getBoneAttachmentOffsetZ(): float {
      return this._model3DBoneAttachment?.positionOffset[2] || 0;
    }

    getBoneAttachmentRotationOffsetX(): float {
      return this._model3DBoneAttachment?.rotationOffset[0] || 0;
    }

    getBoneAttachmentRotationOffsetY(): float {
      return this._model3DBoneAttachment?.rotationOffset[1] || 0;
    }

    getBoneAttachmentRotationOffsetZ(): float {
      return this._model3DBoneAttachment?.rotationOffset[2] || 0;
    }

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

    getForwardX(): float {
      return this.object.getForwardX();
    }

    getForwardY(): float {
      return this.object.getForwardY();
    }

    getForwardZ(): float {
      return this.object.getForwardZ();
    }

    getUpX(): float {
      return this.object.getUpX();
    }

    getUpY(): float {
      return this.object.getUpY();
    }

    getUpZ(): float {
      return this.object.getUpZ();
    }

    getRightX(): float {
      return this.object.getRightX();
    }

    getRightY(): float {
      return this.object.getRightY();
    }

    getRightZ(): float {
      return this.object.getRightZ();
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

    getOriginalDepth(): float {
      return this.object.getOriginalDepth();
    }
  }

  gdjs.registerBehavior('Scene3D::Base3DBehavior', gdjs.Base3DBehavior);
}
