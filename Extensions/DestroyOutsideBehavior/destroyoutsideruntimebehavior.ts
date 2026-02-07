/*
GDevelop - DestroyOutside Behavior Extension
Copyright (c) 2013-2016 Florian Rival (Florian.Rival@gmail.com)
 */

namespace gdjs {
  /**
   * The DestroyOutsideRuntimeBehavior represents a behavior that destroys the object when it leaves the screen.
   * @category Behaviors > Destroy Outside
   */
  export class DestroyOutsideRuntimeBehavior extends gdjs.RuntimeBehavior {
    _extraBorder: float;
    _unseenGraceDistance: float;
    _hasBeenOnScreen: boolean;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      behaviorData,
      owner
    ) {
      super(instanceContainer, behaviorData, owner);
      this._extraBorder = behaviorData.extraBorder || 0;
      this._unseenGraceDistance = behaviorData.unseenGraceDistance || 0;
      this._hasBeenOnScreen = false;
    }

    override applyBehaviorOverriding(behaviorData): boolean {
      if (behaviorData.extraBorder !== undefined) {
        this._extraBorder = behaviorData.extraBorder;
      }
      if (behaviorData.unseenGraceDistance !== undefined) {
        this._unseenGraceDistance = behaviorData.unseenGraceDistance;
      }
      return true;
    }

    doStepPostEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {
      // TODO: This would better be done using the object AABB (getAABB), as (`getCenterX`;`getCenterY`) point
      // is not necessarily in the middle of the object (for sprites for example).
      const ow = this.owner.getWidth();
      const oh = this.owner.getHeight();
      const ocx = this.owner.getDrawableX() + this.owner.getCenterX();
      const ocy = this.owner.getDrawableY() + this.owner.getCenterY();
      const layer = instanceContainer.getLayer(this.owner.getLayer());
      const boundingCircleRadius = Math.sqrt(ow * ow + oh * oh) / 2.0;

      const cameraLeft = layer.getCameraX() - layer.getCameraWidth() / 2;
      const cameraRight = layer.getCameraX() + layer.getCameraWidth() / 2;
      const cameraTop = layer.getCameraY() - layer.getCameraHeight() / 2;
      const cameraBottom = layer.getCameraY() + layer.getCameraHeight() / 2;

      if (
        ocx + boundingCircleRadius + this._extraBorder < cameraLeft ||
        ocx - boundingCircleRadius - this._extraBorder > cameraRight ||
        ocy + boundingCircleRadius + this._extraBorder < cameraTop ||
        ocy - boundingCircleRadius - this._extraBorder > cameraBottom
      ) {
        if (this._hasBeenOnScreen) {
          // Object is outside the camera area and object was previously seen inside it:
          // delete it now.
          this.owner.deleteFromScene();
        } else if (
          ocx + boundingCircleRadius + this._unseenGraceDistance < cameraLeft ||
          ocx - boundingCircleRadius - this._unseenGraceDistance >
            cameraRight ||
          ocy + boundingCircleRadius + this._unseenGraceDistance < cameraTop ||
          ocy - boundingCircleRadius - this._unseenGraceDistance > cameraBottom
        ) {
          // Object is outside the camera area and also outside the grace distance:
          // force deletion.
          this.owner.deleteFromScene();
        } else {
          // Object is outside the camera area but inside the grace distance
          // and was never seen inside the camera area: don't delete it yet.
        }
      } else {
        this._hasBeenOnScreen = true;
      }
    }

    /**
     * Set the additional border outside the camera area.
     *
     * If the object goes beyond the camera area and this border, it will be deleted (unless it was
     * never seen inside the camera area and this border before, in which case it will be deleted
     * according to the grace distance).
     * @param val Border in pixels.
     */
    setExtraBorder(val: number): void {
      this._extraBorder = val;
    }

    /**
     * Get the additional border outside the camera area.
     * @return The additional border around the camera viewport in pixels
     */
    getExtraBorder(): number {
      return this._extraBorder;
    }

    /**
     * Change the grace distance before an object is deleted if it's outside the camera area
     * and was never seen inside the camera area. Typically useful to avoid objects being deleted
     * before they are visible when they spawn.
     */
    setUnseenGraceDistance(val: number): void {
      this._unseenGraceDistance = val;
    }

    /**
     * Get the grace distance before an object is deleted if it's outside the camera area
     * and was never seen inside the camera area.
     */
    getUnseenGraceDistance(): number {
      return this._unseenGraceDistance;
    }

    /**
     * Check if this object has been visible on screen (precisely: inside the camera area *including* the extra border).
     */
    hasBeenOnScreen(): boolean {
      return this._hasBeenOnScreen;
    }
  }
  gdjs.registerBehavior(
    'DestroyOutsideBehavior::DestroyOutside',
    gdjs.DestroyOutsideRuntimeBehavior
  );
}
