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
    _relativeToOriginalWindowSize: any;
    _leftEdgeAnchor: HorizontalAnchor;
    _rightEdgeAnchor: HorizontalAnchor;
    _topEdgeAnchor: any;
    _bottomEdgeAnchor: any;
    _invalidDistances: boolean = true;
    _leftEdgeDistance: number = 0;
    _rightEdgeDistance: number = 0;
    _topEdgeDistance: number = 0;
    _bottomEdgeDistance: number = 0;
    _useLegacyBottomAndRightAnchors: boolean = false;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      behaviorData,
      owner: gdjs.RuntimeObject
    ) {
      super(instanceContainer, behaviorData, owner);
      this._relativeToOriginalWindowSize = !!behaviorData.relativeToOriginalWindowSize;
      this._leftEdgeAnchor = behaviorData.leftEdgeAnchor;
      this._rightEdgeAnchor = behaviorData.rightEdgeAnchor;
      this._topEdgeAnchor = behaviorData.topEdgeAnchor;
      this._bottomEdgeAnchor = behaviorData.bottomEdgeAnchor;
      this._useLegacyBottomAndRightAnchors =
        behaviorData.useLegacyBottomAndRightAnchors === undefined
          ? true
          : behaviorData.useLegacyBottomAndRightAnchors;
    }

    updateFromBehaviorData(oldBehaviorData, newBehaviorData): boolean {
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

    onActivate() {
      this._invalidDistances = true;
    }

    doStepPreEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {
      const workingPoint: FloatPoint = gdjs.staticArray(
        gdjs.AnchorRuntimeBehavior.prototype.doStepPreEvents
      ) as FloatPoint;
      let parentMinX = instanceContainer.getUnrotatedViewportMinX();
      let parentMinY = instanceContainer.getUnrotatedViewportMinY();
      let parentMaxX = instanceContainer.getUnrotatedViewportMaxX();
      let parentMaxY = instanceContainer.getUnrotatedViewportMaxY();
      let parentCenterX = (parentMaxX + parentMinX) / 2;
      let parentCenterY = (parentMaxY + parentMinY) / 2;
      let parentWidth = parentMaxX - parentMinX;
      let parentHeight = parentMaxY - parentMinY;
      const layer = instanceContainer.getLayer(this.owner.getLayer());
      if (this._invalidDistances) {
        if (this._relativeToOriginalWindowSize) {
          parentMinX = instanceContainer.getInitialUnrotatedViewportMinX();
          parentMinY = instanceContainer.getInitialUnrotatedViewportMinY();
          parentMaxX = instanceContainer.getInitialUnrotatedViewportMaxX();
          parentMaxY = instanceContainer.getInitialUnrotatedViewportMaxY();
          parentCenterX = (parentMaxX + parentMinX) / 2;
          parentCenterY = (parentMaxY + parentMinY) / 2;
          parentWidth = parentMaxX - parentMinX;
          parentHeight = parentMaxY - parentMinY;
        }

        //Calculate the distances from the window's bounds.
        const topLeftPixel = this._relativeToOriginalWindowSize
          ? [this.owner.getDrawableX(), this.owner.getDrawableY()]
          : this._convertInverseCoords(
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
        const bottomRightPixel = this._relativeToOriginalWindowSize
          ? [
              this.owner.getDrawableX() + this.owner.getWidth(),
              this.owner.getDrawableY() + this.owner.getHeight(),
            ]
          : this._convertInverseCoords(
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

        this._invalidDistances = false;
      } else {
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
            this.owner.setX(
              left + this.owner.getX() - this.owner.getDrawableX()
            );
          }
          if (this._topEdgeAnchor !== VerticalAnchor.None) {
            this.owner.setY(
              top + this.owner.getY() - this.owner.getDrawableY()
            );
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
      }
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
