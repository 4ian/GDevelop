/*
GDevelop - Anchor Behavior Extension
Copyright (c) 2013-2016 Florian Rival (Florian.Rival@gmail.com)
 */

namespace gdjs {
  const enum HorizontalAnchor {
    None = 0,
    WindowLeft,
    WindowRight,
    Proportional,
    WindowCenter,
  }
  const enum VerticalAnchor {
    None = 0,
    WindowTop,
    WindowBottom,
    Proportional,
    WindowCenter,
  }

  export class AnchorRuntimeBehavior extends gdjs.RuntimeBehavior {
    // Configuration

    _relativeToOriginalWindowSize: boolean;
    _leftEdgeAnchor: HorizontalAnchor;
    _rightEdgeAnchor: HorizontalAnchor;
    _topEdgeAnchor: VerticalAnchor;
    _bottomEdgeAnchor: VerticalAnchor;
    _useLegacyBottomAndRightAnchors: boolean = false;

    // State

    _hasJustBeenCreated: boolean = true;
    _leftEdgeDistance: float = 0;
    _rightEdgeDistance: float = 0;
    _topEdgeDistance: float = 0;
    _bottomEdgeDistance: float = 0;

    _oldDrawableX: float = 0;
    _oldDrawableY: float = 0;
    _oldWidth: float = 0;
    _oldHeight: float = 0;

    _parentOldMinX: float = 0;
    _parentOldMinY: float = 0;
    _parentOldMaxX: float = 0;
    _parentOldMaxY: float = 0;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      behaviorData,
      owner: gdjs.RuntimeObject
    ) {
      super(instanceContainer, behaviorData, owner);
      this._relativeToOriginalWindowSize =
        !!behaviorData.relativeToOriginalWindowSize;
      this._leftEdgeAnchor = behaviorData.leftEdgeAnchor;
      this._rightEdgeAnchor = behaviorData.rightEdgeAnchor;
      this._topEdgeAnchor = behaviorData.topEdgeAnchor;
      this._bottomEdgeAnchor = behaviorData.bottomEdgeAnchor;
      this._useLegacyBottomAndRightAnchors =
        behaviorData.useLegacyBottomAndRightAnchors === undefined
          ? true
          : behaviorData.useLegacyBottomAndRightAnchors;
    }

    override updateFromBehaviorData(oldBehaviorData, newBehaviorData): boolean {
      if (oldBehaviorData.leftEdgeAnchor !== newBehaviorData.leftEdgeAnchor) {
        this._leftEdgeAnchor = newBehaviorData.leftEdgeAnchor;
      }
      if (oldBehaviorData.rightEdgeAnchor !== newBehaviorData.rightEdgeAnchor) {
        this._rightEdgeAnchor = newBehaviorData.rightEdgeAnchor;
      }
      if (oldBehaviorData.topEdgeAnchor !== newBehaviorData.topEdgeAnchor) {
        this._topEdgeAnchor = newBehaviorData.topEdgeAnchor;
      }
      if (
        oldBehaviorData.bottomEdgeAnchor !== newBehaviorData.bottomEdgeAnchor
      ) {
        this._bottomEdgeAnchor = newBehaviorData.bottomEdgeAnchor;
      }
      if (
        oldBehaviorData.useLegacyTrajectory !==
        newBehaviorData.useLegacyTrajectory
      ) {
        this._useLegacyBottomAndRightAnchors =
          newBehaviorData.useLegacyBottomAndRightAnchors;
      }
      if (
        oldBehaviorData.relativeToOriginalWindowSize !==
        newBehaviorData.relativeToOriginalWindowSize
      ) {
        return false;
      }
      return true;
    }

    override onActivate(): void {
      // This only has a side effect on if the camera moved while the behavior was deactivated.
      // The new position on the viewport is where the object should stay.
      this._hasJustBeenCreated = true;
    }

    override doStepPreEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {
      if (this._hasJustBeenCreated) {
        this._initializeAnchorDistances(instanceContainer);
        this._hasJustBeenCreated = false;
        this._oldDrawableX = this.owner.getDrawableX();
        this._oldDrawableY = this.owner.getDrawableY();
        this._oldWidth = this.owner.getWidth();
        this._oldHeight = this.owner.getHeight();
      }
      const objectHasMoved =
        this._oldDrawableX !== this.owner.getDrawableX() ||
        this._oldDrawableY !== this.owner.getDrawableY() ||
        this._oldWidth !== this.owner.getWidth() ||
        this._oldHeight !== this.owner.getHeight();
      if (objectHasMoved) {
        this._updateAnchorDistances(instanceContainer);
      }
      const parentHasResized =
        this._parentOldMinX !== instanceContainer.getUnrotatedViewportMinX() ||
        this._parentOldMinY !== instanceContainer.getUnrotatedViewportMinY() ||
        this._parentOldMaxX !== instanceContainer.getUnrotatedViewportMaxX() ||
        this._parentOldMaxY !== instanceContainer.getUnrotatedViewportMaxY();
      if (parentHasResized) {
        this._followAnchor(instanceContainer);
      }
      
      this._oldDrawableX = this.owner.getDrawableX();
      this._oldDrawableY = this.owner.getDrawableY();
      this._oldWidth = this.owner.getWidth();
      this._oldHeight = this.owner.getHeight();
    }

    /**
     * Evaluate the anchor distance according to the object position on the
     * screen.
     *
     * The camera is taken into account.
     */
    private _initializeAnchorDistances(
      instanceContainer: gdjs.RuntimeInstanceContainer
    ) {
      const workingPoint: FloatPoint = gdjs.staticArray(
        gdjs.AnchorRuntimeBehavior.prototype.doStepPreEvents
      ) as FloatPoint;
      const layer = instanceContainer.getLayer(this.owner.getLayer());

      if (this._relativeToOriginalWindowSize) {
        this._parentOldMinX =
          instanceContainer.getInitialUnrotatedViewportMinX();
        this._parentOldMinY =
          instanceContainer.getInitialUnrotatedViewportMinY();
        this._parentOldMaxX =
          instanceContainer.getInitialUnrotatedViewportMaxX();
        this._parentOldMaxY =
          instanceContainer.getInitialUnrotatedViewportMaxY();
      } else {
        this._parentOldMinX = instanceContainer.getUnrotatedViewportMinX();
        this._parentOldMinY = instanceContainer.getUnrotatedViewportMinY();
        this._parentOldMaxX = instanceContainer.getUnrotatedViewportMaxX();
        this._parentOldMaxY = instanceContainer.getUnrotatedViewportMaxY();
      }
      const parentMinX = this._parentOldMinX;
      const parentMinY = this._parentOldMinY;
      const parentMaxX = this._parentOldMaxX;
      const parentMaxY = this._parentOldMaxY;

      const parentCenterX = (parentMaxX + parentMinX) / 2;
      const parentCenterY = (parentMaxY + parentMinY) / 2;
      const parentWidth = parentMaxX - parentMinX;
      const parentHeight = parentMaxY - parentMinY;

      // Calculate the distances from the window's bounds.
      const topLeftPixel = this._convertInverseCoords(
        instanceContainer,
        layer,
        this.owner.getDrawableX(),
        this.owner.getDrawableY(),
        workingPoint
      );

      // Left edge
      if (this._leftEdgeAnchor === HorizontalAnchor.WindowLeft) {
        this._leftEdgeDistance = topLeftPixel[0] - parentMinX;
      } else if (this._leftEdgeAnchor === HorizontalAnchor.WindowRight) {
        this._leftEdgeDistance = topLeftPixel[0] - parentMaxX;
      } else if (this._leftEdgeAnchor === HorizontalAnchor.Proportional) {
        this._leftEdgeDistance = (topLeftPixel[0] - parentMinX) / parentWidth;
      } else if (this._leftEdgeAnchor === HorizontalAnchor.WindowCenter) {
        this._leftEdgeDistance = topLeftPixel[0] - parentCenterX;
      }

      // Top edge
      if (this._topEdgeAnchor === VerticalAnchor.WindowTop) {
        this._topEdgeDistance = topLeftPixel[1] - parentMinY;
      } else if (this._topEdgeAnchor === VerticalAnchor.WindowBottom) {
        this._topEdgeDistance = topLeftPixel[1] - parentMaxY;
      } else if (this._topEdgeAnchor === VerticalAnchor.Proportional) {
        this._topEdgeDistance = (topLeftPixel[1] - parentMinY) / parentHeight;
      } else if (this._topEdgeAnchor === VerticalAnchor.WindowCenter) {
        this._topEdgeDistance = topLeftPixel[1] - parentCenterY;
      }

      // It's fine to reuse workingPoint as topLeftPixel is no longer used.
      const bottomRightPixel = this._convertInverseCoords(
        instanceContainer,
        layer,
        this.owner.getDrawableX() + this.owner.getWidth(),
        this.owner.getDrawableY() + this.owner.getHeight(),
        workingPoint
      );

      // Right edge
      if (this._rightEdgeAnchor === HorizontalAnchor.WindowLeft) {
        this._rightEdgeDistance = bottomRightPixel[0] - parentMinX;
      } else if (this._rightEdgeAnchor === HorizontalAnchor.WindowRight) {
        this._rightEdgeDistance = bottomRightPixel[0] - parentMaxX;
      } else if (this._rightEdgeAnchor === HorizontalAnchor.Proportional) {
        this._rightEdgeDistance =
          (bottomRightPixel[0] - parentMinX) / parentWidth;
      } else if (this._rightEdgeAnchor === HorizontalAnchor.WindowCenter) {
        this._rightEdgeDistance = bottomRightPixel[0] - parentCenterX;
      }

      // Bottom edge
      if (this._bottomEdgeAnchor === VerticalAnchor.WindowTop) {
        this._bottomEdgeDistance = bottomRightPixel[1] - parentMinY;
      } else if (this._bottomEdgeAnchor === VerticalAnchor.WindowBottom) {
        this._bottomEdgeDistance = bottomRightPixel[1] - parentMaxY;
      } else if (this._bottomEdgeAnchor === VerticalAnchor.Proportional) {
        this._bottomEdgeDistance =
          (bottomRightPixel[1] - parentMinY) / parentHeight;
      } else if (this._bottomEdgeAnchor === VerticalAnchor.WindowCenter) {
        this._bottomEdgeDistance = bottomRightPixel[1] - parentCenterY;
      }
    }

    /**
     * Update the anchor distance according to the object position change in
     * the scene.
     *
     * The camera is not taken into account. Indeed, a camera scrolling should
     * not shift the anchored object on screen.
     */
    private _updateAnchorDistances(
      instanceContainer: gdjs.RuntimeInstanceContainer
    ) {
      const parentOldWidth = this._parentOldMaxX - this._parentOldMinX;
      const parentOldHeight = this._parentOldMaxY - this._parentOldMinY;

      const deltaMinX = this.owner.getDrawableX() - this._oldDrawableX;
      const deltaMinY = this.owner.getDrawableY() - this._oldDrawableY;
      const deltaMaxX = deltaMinX + this.owner.getWidth() - this._oldWidth;
      const deltaMaxY = deltaMinY + this.owner.getHeight() - this._oldHeight;

      // Left edge
      if (this._leftEdgeAnchor === HorizontalAnchor.Proportional) {
        this._leftEdgeDistance += deltaMinX / parentOldWidth;
      } else {
        this._leftEdgeDistance += deltaMinX;
      }

      // Top edge
      if (this._topEdgeAnchor === VerticalAnchor.Proportional) {
        this._topEdgeDistance += deltaMinY / parentOldHeight;
      } else {
        this._topEdgeDistance += deltaMinY;
      }

      // Right edge
      if (this._rightEdgeAnchor === HorizontalAnchor.Proportional) {
        this._rightEdgeDistance += deltaMaxX / parentOldWidth;
      } else {
        this._rightEdgeDistance += deltaMaxX;
      }

      // Bottom edge
      if (this._bottomEdgeAnchor === VerticalAnchor.Proportional) {
        this._bottomEdgeDistance += deltaMaxY / parentOldHeight;
      } else {
        this._bottomEdgeDistance += deltaMaxY;
      }
    }

    /**
     * Update the object position to keep the object on screen according to the
     * anchor distances.
     *
     * The camera is taken into account.
     */
    private _followAnchor(instanceContainer: gdjs.RuntimeInstanceContainer) {
      const workingPoint: FloatPoint = gdjs.staticArray(
        gdjs.AnchorRuntimeBehavior.prototype.doStepPreEvents
      ) as FloatPoint;
      const layer = instanceContainer.getLayer(this.owner.getLayer());

      let parentMinX = instanceContainer.getUnrotatedViewportMinX();
      let parentMinY = instanceContainer.getUnrotatedViewportMinY();
      let parentMaxX = instanceContainer.getUnrotatedViewportMaxX();
      let parentMaxY = instanceContainer.getUnrotatedViewportMaxY();
      const parentCenterX = (parentMaxX + parentMinX) / 2;
      const parentCenterY = (parentMaxY + parentMinY) / 2;
      const parentWidth = parentMaxX - parentMinX;
      const parentHeight = parentMaxY - parentMinY;

      //Move and resize the object if needed
      let leftPixel = 0;
      let topPixel = 0;
      let rightPixel = 0;
      let bottomPixel = 0;

      // Left edge
      if (this._leftEdgeAnchor === HorizontalAnchor.WindowLeft) {
        leftPixel = parentMinX + this._leftEdgeDistance;
      } else if (this._leftEdgeAnchor === HorizontalAnchor.WindowRight) {
        leftPixel = parentMaxX + this._leftEdgeDistance;
      } else if (this._leftEdgeAnchor === HorizontalAnchor.Proportional) {
        leftPixel = parentMinX + this._leftEdgeDistance * parentWidth;
      } else if (this._leftEdgeAnchor === HorizontalAnchor.WindowCenter) {
        leftPixel = parentCenterX + this._leftEdgeDistance;
      }

      // Top edge
      if (this._topEdgeAnchor === VerticalAnchor.WindowTop) {
        topPixel = parentMinY + this._topEdgeDistance;
      } else if (this._topEdgeAnchor === VerticalAnchor.WindowBottom) {
        topPixel = parentMaxY + this._topEdgeDistance;
      } else if (this._topEdgeAnchor === VerticalAnchor.Proportional) {
        topPixel = parentMinY + this._topEdgeDistance * parentHeight;
      } else if (this._topEdgeAnchor === VerticalAnchor.WindowCenter) {
        topPixel = parentCenterY + this._topEdgeDistance;
      }

      // Right edge
      if (this._rightEdgeAnchor === HorizontalAnchor.WindowLeft) {
        rightPixel = parentMinX + this._rightEdgeDistance;
      } else if (this._rightEdgeAnchor === HorizontalAnchor.WindowRight) {
        rightPixel = parentMaxX + this._rightEdgeDistance;
      } else if (this._rightEdgeAnchor === HorizontalAnchor.Proportional) {
        rightPixel = parentMinX + this._rightEdgeDistance * parentWidth;
      } else if (this._rightEdgeAnchor === HorizontalAnchor.WindowCenter) {
        rightPixel = parentCenterX + this._rightEdgeDistance;
      }

      // Bottom edge
      if (this._bottomEdgeAnchor === VerticalAnchor.WindowTop) {
        bottomPixel = parentMinY + this._bottomEdgeDistance;
      } else if (this._bottomEdgeAnchor === VerticalAnchor.WindowBottom) {
        bottomPixel = parentMaxY + this._bottomEdgeDistance;
      } else if (this._bottomEdgeAnchor === VerticalAnchor.Proportional) {
        bottomPixel = parentMinY + this._bottomEdgeDistance * parentHeight;
      } else if (this._bottomEdgeAnchor === VerticalAnchor.WindowCenter) {
        bottomPixel = parentCenterY + this._bottomEdgeDistance;
      }

      // It's fine to reuse workingPoint as topLeftPixel is no longer used.
      const topLeftCoord = this._convertCoords(
        instanceContainer,
        layer,
        leftPixel,
        topPixel,
        workingPoint
      );
      let left = topLeftCoord[0];
      let top = topLeftCoord[1];

      const bottomRightCoord = this._convertCoords(
        instanceContainer,
        layer,
        rightPixel,
        bottomPixel,
        workingPoint
      );
      const right = bottomRightCoord[0];
      const bottom = bottomRightCoord[1];

      // Compatibility with GD <= 5.0.133
      if (this._useLegacyBottomAndRightAnchors) {
        //Move and resize the object according to the anchors
        if (this._rightEdgeAnchor !== HorizontalAnchor.None) {
          this.owner.setWidth(right - left);
        }
        if (this._bottomEdgeAnchor !== VerticalAnchor.None) {
          this.owner.setHeight(bottom - top);
        }
        if (this._leftEdgeAnchor !== HorizontalAnchor.None) {
          this.owner.setX(left + this.owner.getX() - this.owner.getDrawableX());
        }
        if (this._topEdgeAnchor !== VerticalAnchor.None) {
          this.owner.setY(top + this.owner.getY() - this.owner.getDrawableY());
        }
      }
      // End of compatibility code
      else {
        // Resize if right and left anchors are set
        if (
          this._rightEdgeAnchor !== HorizontalAnchor.None &&
          this._leftEdgeAnchor !== HorizontalAnchor.None
        ) {
          const width = right - left;
          this.owner.setX(
            this.owner.getX() === this.owner.getDrawableX()
              ? left
              : // It uses the position of the origin relatively to the object
                // size to apply it with the new size.
                // This is the same as doing:
                // lerp(left, right, (this.owner.getX() - this.owner.getDrawableX() / this.owner.getWidth())
                // But, the division is done at the end to avoid rounding errors.
                left +
                  ((this.owner.getX() - this.owner.getDrawableX()) * width) /
                    this.owner.getWidth()
          );
          this.owner.setWidth(width);
        } else {
          if (this._leftEdgeAnchor !== HorizontalAnchor.None) {
            this.owner.setX(
              left + this.owner.getX() - this.owner.getDrawableX()
            );
          }
          if (this._rightEdgeAnchor !== HorizontalAnchor.None) {
            this.owner.setX(
              right +
                this.owner.getX() -
                this.owner.getDrawableX() -
                this.owner.getWidth()
            );
          }
        }

        // Resize if top and bottom anchors are set
        if (
          this._bottomEdgeAnchor !== VerticalAnchor.None &&
          this._topEdgeAnchor !== VerticalAnchor.None
        ) {
          const height = bottom - top;
          this.owner.setY(
            this.owner.getY() === this.owner.getDrawableY()
              ? top
              : top +
                  ((this.owner.getY() - this.owner.getDrawableY()) * height) /
                    this.owner.getHeight()
          );
          this.owner.setHeight(height);
        } else {
          if (this._topEdgeAnchor !== VerticalAnchor.None) {
            this.owner.setY(
              top + this.owner.getY() - this.owner.getDrawableY()
            );
          }
          if (this._bottomEdgeAnchor !== VerticalAnchor.None) {
            this.owner.setY(
              bottom +
                this.owner.getY() -
                this.owner.getDrawableY() -
                this.owner.getHeight()
            );
          }
        }
      }
      this._parentOldMinX = instanceContainer.getUnrotatedViewportMinX();
      this._parentOldMinY = instanceContainer.getUnrotatedViewportMinY();
      this._parentOldMaxX = instanceContainer.getUnrotatedViewportMaxX();
      this._parentOldMaxY = instanceContainer.getUnrotatedViewportMaxY();
    }

    doStepPostEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {}

    private _convertCoords(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      layer: gdjs.RuntimeLayer,
      x: float,
      y: float,
      result: FloatPoint
    ) {
      const isParentACustomObject =
        instanceContainer !== instanceContainer.getScene();
      if (isParentACustomObject) {
        result[0] = x;
        result[1] = y;
        return result;
      }
      return layer.convertCoords(x, y, 0, result);
    }

    private _convertInverseCoords(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      layer: gdjs.RuntimeLayer,
      x: float,
      y: float,
      result: FloatPoint
    ) {
      const isParentACustomObject =
        instanceContainer !== instanceContainer.getScene();
      if (isParentACustomObject) {
        result[0] = x;
        result[1] = y;
        return result;
      }
      return layer.convertInverseCoords(x, y, 0, result);
    }
  }
  gdjs.registerBehavior(
    'AnchorBehavior::AnchorBehavior',
    gdjs.AnchorRuntimeBehavior
  );
}
