/*
GDevelop - Sticker3D Behavior Extension
Copyright (c) 2024 GDevelop Team
This project is released under the MIT License.
*/

namespace gdjs {
  /**
   * Sticks a 3D object to another 3D object, making it follow the stuck-to 3D object's
   * position and optionally rotation.
   * @category Behaviors > 3D Sticker
   */
  export class Sticker3DRuntimeBehavior extends gdjs.RuntimeBehavior {
    // Configuration
    private _offsetX: float = 0;
    private _offsetY: float = 0;
    private _offsetZ: float = 0;
    private _followRotation: boolean = true;
    private _destroyWithStuckToObject: boolean = false;
    private _offsetMode: string = "world"; // "world" or "local"

    // State
    private _stuckToObject: gdjs.RuntimeObject | null = null;
    private _isStuck: boolean = false;

    // Callback for when stuck-to object is deleted
    private _onStuckToObjectDeleted: (() => void) | null = null;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      behaviorData: any,
      owner: gdjs.RuntimeObject
    ) {
      super(instanceContainer, behaviorData, owner);
      
      this._followRotation = behaviorData.followRotation !== undefined 
        ? behaviorData.followRotation 
        : true;
      this._destroyWithStuckToObject = behaviorData.destroyWithStuckToObject !== undefined
        ? behaviorData.destroyWithStuckToObject
        : false;
      this._offsetMode = behaviorData.offsetMode !== undefined
        ? behaviorData.offsetMode
        : "world";
    }

    override applyBehaviorOverriding(behaviorData: any): boolean {
      if (behaviorData.followRotation !== undefined) {
        this._followRotation = behaviorData.followRotation;
      }
      if (behaviorData.destroyWithStuckToObject !== undefined) {
        this._destroyWithStuckToObject = behaviorData.destroyWithStuckToObject;
      }
      if (behaviorData.offsetMode !== undefined) {
        this._offsetMode = behaviorData.offsetMode;
      }
      return true;
    }

    override onActivate(): void {
      // Behavior activated - stick will be set via action
    }

    override onDeActivate(): void {
      // Keep the stick information but stop updating
    }

    override onDestroy(): void {
      // Clean up when behavior is destroyed
      this.unstick();
    }

    override doStepPreEvents(instanceContainer: gdjs.RuntimeInstanceContainer): void {
      // Check if we're stuck and have a valid stuck-to object
      if (!this._isStuck || !this._stuckToObject) {
        return;
      }

      const owner = this.owner;
      const stuckToObject = this._stuckToObject;

      // Get stuck-to 3D object's current position
      const stuckToX = stuckToObject.getX();
      const stuckToY = stuckToObject.getY();
      
      // Check if stuck-to 3D object has 3D capabilities
      let stuckToZ = 0;
      let stuckToRotationX = 0;
      let stuckToRotationY = 0;
      let stuckToRotationZ = stuckToObject.getAngle();

      if (gdjs.Base3DHandler && gdjs.Base3DHandler.is3D(stuckToObject)) {
        stuckToZ = stuckToObject.getZ();
        stuckToRotationX = stuckToObject.getRotationX();
        stuckToRotationY = stuckToObject.getRotationY();
      }

      // Calculate target position based on offset mode
      let targetX: float, targetY: float, targetZ: float;
      
      if (this._offsetMode === "local") {
        // Local space: rotate offset based on stuck-to object's Z rotation (2D)
        // Only Z-axis rotation is applied to keep objects on the same plane (suitable for vehicles, characters)
        const angleRad = (stuckToRotationZ * Math.PI) / 180;
        const cos = Math.cos(angleRad);
        const sin = Math.sin(angleRad);

        // Rotate offset in 2D (X-Y plane)
        const rotatedOffsetX = this._offsetX * cos - this._offsetY * sin;
        const rotatedOffsetY = this._offsetX * sin + this._offsetY * cos;

        targetX = stuckToX + rotatedOffsetX;
        targetY = stuckToY + rotatedOffsetY;
        targetZ = stuckToZ + this._offsetZ; // Z offset stays the same
      } else {
        // World space: offset stays fixed in world coordinates
        targetX = stuckToX + this._offsetX;
        targetY = stuckToY + this._offsetY;
        targetZ = stuckToZ + this._offsetZ;
      }

      // Update this object's position to the target position
      owner.setX(targetX);
      owner.setY(targetY);
      
      if (gdjs.Base3DHandler && gdjs.Base3DHandler.is3D(owner)) {
        owner.setZ(targetZ);
      }

      // Update rotation if following rotation
      if (this._followRotation) {
        // Copy the stuck-to object's rotation directly
        // This ensures the sticker always has the exact same orientation as the stuck-to object
        owner.setAngle(stuckToRotationZ);

        if (gdjs.Base3DHandler && gdjs.Base3DHandler.is3D(stuckToObject) && gdjs.Base3DHandler.is3D(owner)) {
          owner.setRotationX(stuckToRotationX);
          owner.setRotationY(stuckToRotationY);
        }
      }
    }

    /**
     * Stick this 3D object to another 3D object.
     * @param targetObject The 3D object to stick to
     */
    stickTo3DObject(targetObject: gdjs.RuntimeObject): void {
      if (!targetObject) {
        return;
      }

      // Unregister previous callback if exists
      if (this._onStuckToObjectDeleted && this._stuckToObject) {
        this._stuckToObject.unregisterDestroyCallback(this._onStuckToObjectDeleted);
      }

      this._stuckToObject = targetObject;
      this._isStuck = true;

      // Register callback to handle when stuck-to object is deleted
      this._onStuckToObjectDeleted = () => {
        if (this._destroyWithStuckToObject) {
          // Destroy this 3D object when the stuck-to 3D object is destroyed
          this.owner.deleteFromScene();
        } else {
          // Just unstick without destroying
          this.unstick();
        }
      };
      targetObject.registerDestroyCallback(this._onStuckToObjectDeleted);

      // Calculate and store initial offset based on current positions
      const owner = this.owner;
      
      if (this._offsetMode === "local") {
        // Local space: calculate offset in target object's local coordinates
        // This requires inverse rotation transformation (2D only for Z-axis)
        const targetAngle = targetObject.getAngle();
        const angleRad = (targetAngle * Math.PI) / 180;
        const cos = Math.cos(-angleRad); // Negative for inverse rotation
        const sin = Math.sin(-angleRad);

        const worldOffsetX = owner.getX() - targetObject.getX();
        const worldOffsetY = owner.getY() - targetObject.getY();

        // Transform world offset to local space (2D rotation)
        this._offsetX = worldOffsetX * cos - worldOffsetY * sin;
        this._offsetY = worldOffsetX * sin + worldOffsetY * cos;
        
        // Z offset is always calculated in world space (not affected by rotation)
        if (gdjs.Base3DHandler && gdjs.Base3DHandler.is3D(owner) && gdjs.Base3DHandler.is3D(targetObject)) {
          this._offsetZ = owner.getZ() - targetObject.getZ();
        } else {
          this._offsetZ = 0;
        }
      } else {
        // World space: offset in world coordinates
        this._offsetX = owner.getX() - targetObject.getX();
        this._offsetY = owner.getY() - targetObject.getY();
        
        if (gdjs.Base3DHandler && gdjs.Base3DHandler.is3D(owner) && gdjs.Base3DHandler.is3D(targetObject)) {
          this._offsetZ = owner.getZ() - targetObject.getZ();
        } else {
          this._offsetZ = 0;
        }
      }
    }

    /**
     * Unstick from the current stuck-to 3D object.
     */
    unstick(): void {
      // Unregister the destroy callback
      if (this._onStuckToObjectDeleted && this._stuckToObject) {
        this._stuckToObject.unregisterDestroyCallback(this._onStuckToObjectDeleted);
        this._onStuckToObjectDeleted = null;
      }
      
      this._stuckToObject = null;
      this._isStuck = false;
    }

    /**
     * Check if this 3D object is currently stuck to another 3D object.
     * @returns true if stuck, false otherwise
     */
    isStuck(): boolean {
      return this._isStuck && this._stuckToObject !== null;
    }

    /**
     * Set the X offset from the stuck-to 3D object.
     * @param offsetX The X offset
     */
    setOffsetX(offsetX: float): void {
      this._offsetX = offsetX;
    }

    /**
     * Set the Y offset from the stuck-to 3D object.
     * @param offsetY The Y offset
     */
    setOffsetY(offsetY: float): void {
      this._offsetY = offsetY;
    }

    /**
     * Set the Z offset from the stuck-to 3D object.
     * @param offsetZ The Z offset
     */
    setOffsetZ(offsetZ: float): void {
      this._offsetZ = offsetZ;
    }

    /**
     * Get the X offset from the stuck-to 3D object.
     * @returns The X offset
     */
    getOffsetX(): float {
      return this._offsetX;
    }

    /**
     * Get the Y offset from the stuck-to 3D object.
     * @returns The Y offset
     */
    getOffsetY(): float {
      return this._offsetY;
    }

    /**
     * Get the Z offset from the stuck-to 3D object.
     * @returns The Z offset
     */
    getOffsetZ(): float {
      return this._offsetZ;
    }

    /**
     * Set whether to follow the rotation of the stuck-to 3D object.
     * @param follow true to follow rotation, false otherwise
     */
    setFollowRotation(follow: boolean): void {
      this._followRotation = follow;
    }

    /**
     * Check if this 3D object follows the rotation of the stuck-to 3D object.
     * @returns true if following rotation, false otherwise
     */
    followsRotation(): boolean {
      return this._followRotation;
    }
  }

  gdjs.registerBehavior(
    'Sticker3DBehavior::Sticker3DBehavior',
    gdjs.Sticker3DRuntimeBehavior
  );
}

