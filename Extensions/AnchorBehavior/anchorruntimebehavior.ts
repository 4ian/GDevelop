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
      // TODO EBO Make it work with event based objects or hide this behavior for them.
      const game = instanceContainer.getGame();
      let rendererWidth = game.getGameResolutionWidth();
      let rendererHeight = game.getGameResolutionHeight();
      const layer = instanceContainer.getLayer(this.owner.getLayer());
      if (this._invalidDistances) {
        if (this._relativeToOriginalWindowSize) {
          rendererWidth = game.getOriginalWidth();
          rendererHeight = game.getOriginalHeight();
        }

        //Calculate the distances from the window's bounds.
        const topLeftPixel = layer.convertCoords(
          this.owner.getDrawableX(),
          this.owner.getDrawableY(),
          0,
          workingPoint
        );

        // Left edge
        if (this._leftEdgeAnchor === HorizontalAnchor.WindowLeft) {
          this._leftEdgeDistance = topLeftPixel[0];
        } else if (this._leftEdgeAnchor === HorizontalAnchor.WindowRight) {
          this._leftEdgeDistance = topLeftPixel[0] - rendererWidth;
        } else if (this._leftEdgeAnchor === HorizontalAnchor.Proportional) {
          this._leftEdgeDistance = topLeftPixel[0] / rendererWidth;
        } else if (this._leftEdgeAnchor === HorizontalAnchor.WindowCenter) {
          this._leftEdgeDistance = topLeftPixel[0] - rendererWidth / 2;
        }

        // Top edge
        if (this._topEdgeAnchor === VerticalAnchor.WindowTop) {
          this._topEdgeDistance = topLeftPixel[1];
        } else if (this._topEdgeAnchor === VerticalAnchor.WindowBottom) {
          this._topEdgeDistance = topLeftPixel[1] - rendererHeight;
        } else if (this._topEdgeAnchor === VerticalAnchor.Proportional) {
          this._topEdgeDistance = topLeftPixel[1] / rendererHeight;
        } else if (this._topEdgeAnchor === VerticalAnchor.WindowCenter) {
          this._topEdgeDistance = topLeftPixel[1] - rendererHeight / 2;
        }

        // It's fine to reuse workingPoint as topLeftPixel is no longer used.
        const bottomRightPixel = layer.convertCoords(
          this.owner.getDrawableX() + this.owner.getWidth(),
          this.owner.getDrawableY() + this.owner.getHeight(),
          0,
          workingPoint
        );

        // Right edge
        if (this._rightEdgeAnchor === HorizontalAnchor.WindowLeft) {
          this._rightEdgeDistance = bottomRightPixel[0];
        } else if (this._rightEdgeAnchor === HorizontalAnchor.WindowRight) {
          this._rightEdgeDistance = bottomRightPixel[0] - rendererWidth;
        } else if (this._rightEdgeAnchor === HorizontalAnchor.Proportional) {
          this._rightEdgeDistance = bottomRightPixel[0] / rendererWidth;
        } else if (this._rightEdgeAnchor === HorizontalAnchor.WindowCenter) {
          this._rightEdgeDistance = bottomRightPixel[0] - rendererWidth / 2;
        }

        // Bottom edge
        if (this._bottomEdgeAnchor === VerticalAnchor.WindowTop) {
          this._bottomEdgeDistance = bottomRightPixel[1];
        } else if (this._bottomEdgeAnchor === VerticalAnchor.WindowBottom) {
          this._bottomEdgeDistance = bottomRightPixel[1] - rendererHeight;
        } else if (this._bottomEdgeAnchor === VerticalAnchor.Proportional) {
          this._bottomEdgeDistance = bottomRightPixel[1] / rendererHeight;
        } else if (this._bottomEdgeAnchor === VerticalAnchor.WindowCenter) {
          this._bottomEdgeDistance = bottomRightPixel[1] - rendererHeight / 2;
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
          leftPixel = this._leftEdgeDistance;
        } else if (this._leftEdgeAnchor === HorizontalAnchor.WindowRight) {
          leftPixel = rendererWidth + this._leftEdgeDistance;
        } else if (this._leftEdgeAnchor === HorizontalAnchor.Proportional) {
          leftPixel = this._leftEdgeDistance * rendererWidth;
        } else if (this._leftEdgeAnchor === HorizontalAnchor.WindowCenter) {
          leftPixel = rendererWidth / 2 + this._leftEdgeDistance;
        }

        // Top edge
        if (this._topEdgeAnchor === VerticalAnchor.WindowTop) {
          topPixel = this._topEdgeDistance;
        } else if (this._topEdgeAnchor === VerticalAnchor.WindowBottom) {
          topPixel = rendererHeight + this._topEdgeDistance;
        } else if (this._topEdgeAnchor === VerticalAnchor.Proportional) {
          topPixel = this._topEdgeDistance * rendererHeight;
        } else if (this._topEdgeAnchor === VerticalAnchor.WindowCenter) {
          topPixel = rendererHeight / 2 + this._topEdgeDistance;
        }

        // Right edge
        if (this._rightEdgeAnchor === HorizontalAnchor.WindowLeft) {
          rightPixel = this._rightEdgeDistance;
        } else if (this._rightEdgeAnchor === HorizontalAnchor.WindowRight) {
          rightPixel = rendererWidth + this._rightEdgeDistance;
        } else if (this._rightEdgeAnchor === HorizontalAnchor.Proportional) {
          rightPixel = this._rightEdgeDistance * rendererWidth;
        } else if (this._rightEdgeAnchor === HorizontalAnchor.WindowCenter) {
          rightPixel = rendererWidth / 2 + this._rightEdgeDistance;
        }

        // Bottom edge
        if (this._bottomEdgeAnchor === VerticalAnchor.WindowTop) {
          bottomPixel = this._bottomEdgeDistance;
        } else if (this._bottomEdgeAnchor === VerticalAnchor.WindowBottom) {
          bottomPixel = rendererHeight + this._bottomEdgeDistance;
        } else if (this._bottomEdgeAnchor === VerticalAnchor.Proportional) {
          bottomPixel = this._bottomEdgeDistance * rendererHeight;
        } else if (this._bottomEdgeAnchor === VerticalAnchor.WindowCenter) {
          bottomPixel = rendererHeight / 2 + this._bottomEdgeDistance;
        }

        // It's fine to reuse workingPoint as topLeftPixel is no longer used.
        const topLeftCoord = layer.convertInverseCoords(
          leftPixel,
          topPixel,
          0,
          workingPoint
        );
        const left = topLeftCoord[0];
        const top = topLeftCoord[1];

        const bottomRightCoord = layer.convertInverseCoords(
          rightPixel,
          bottomPixel,
          0,
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
            this.owner.setWidth(right - left);
            this.owner.setX(left);
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
            this.owner.setHeight(bottom - top);
            this.owner.setY(top);
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
  }
  gdjs.registerBehavior(
    'AnchorBehavior::AnchorBehavior',
    gdjs.AnchorRuntimeBehavior
  );
}
