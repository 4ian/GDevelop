/*
GDevelop - DestroyOutside Behavior Extension
Copyright (c) 2013-2016 Florian Rival (Florian.Rival@gmail.com)
 */

namespace gdjs {
  /**
   * The DestroyOutsideRuntimeBehavior represents a behavior allowing objects to be
   * moved using the mouse.
   */
  export class DestroyOutsideRuntimeBehavior extends gdjs.RuntimeBehavior {
    _extraBorder: any;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      behaviorData,
      owner
    ) {
      super(instanceContainer, behaviorData, owner);
      this._extraBorder = behaviorData.extraBorder || 0;
    }

    updateFromBehaviorData(oldBehaviorData, newBehaviorData): boolean {
      if (oldBehaviorData.extraBorder !== newBehaviorData.extraBorder) {
        this._extraBorder = newBehaviorData.extraBorder;
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
      if (
        ocx + boundingCircleRadius + this._extraBorder <
          layer.getCameraX() - layer.getCameraWidth() / 2 ||
        ocx - boundingCircleRadius - this._extraBorder >
          layer.getCameraX() + layer.getCameraWidth() / 2 ||
        ocy + boundingCircleRadius + this._extraBorder <
          layer.getCameraY() - layer.getCameraHeight() / 2 ||
        ocy - boundingCircleRadius - this._extraBorder >
          layer.getCameraY() + layer.getCameraHeight() / 2
      ) {
        //We are outside the camera area.
        this.owner.deleteFromScene(instanceContainer);
      }
    }

    /**
     * Set an additional border to the camera viewport as a buffer before the object gets destroyed.
     * @param val Border in pixels.
     */
    setExtraBorder(val: number): void {
      this._extraBorder = val;
    }

    /**
     * Get the additional border of the camera viewport buffer which triggers the destruction of an object.
     * @return The additional border around the camera viewport in pixels
     */
    getExtraBorder(): number {
      return this._extraBorder;
    }
  }
  gdjs.registerBehavior(
    'DestroyOutsideBehavior::DestroyOutside',
    gdjs.DestroyOutsideRuntimeBehavior
  );
}
