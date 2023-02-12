/*
GDevelop - Top-down movement Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
 */

namespace gdjs {
  /**
   * Allows an object to move in 4 or 8 directions, with customizable speed, accelerations
   * and rotation.
   */
  export class TopDownMovementRuntimeBehavior extends gdjs.RuntimeBehavior {
    //Behavior configuration:
    private _allowDiagonals: boolean;
    private _acceleration: float;
    private _deceleration: float;
    private _maxSpeed: float;
    private _angularMaxSpeed: float;
    private _rotateObject: boolean;
    private _angleOffset: float;
    private _ignoreDefaultControls: boolean;
    private _movementAngleOffset: float;

    /** The latest angle of movement, in degrees. */
    private _angle: float = 0;

    //Attributes used when moving
    private _xVelocity: float = 0;
    private _yVelocity: float = 0;
    private _angularSpeed: float = 0;

    // Inputs
    private _leftKey: boolean = false;
    private _rightKey: boolean = false;
    private _upKey: boolean = false;
    private _downKey: boolean = false;
    private _leftKeyPressedDuration: float = 0;
    private _rightKeyPressedDuration: float = 0;
    private _upKeyPressedDuration: float = 0;
    private _downKeyPressedDuration: float = 0;
    private _wasStickUsed: boolean = false;
    private _stickAngle: float = 0;
    private _stickForce: float = 0;

    // @ts-ignore The setter "setViewpoint" is not detected as an affectation.
    private _basisTransformation: gdjs.TopDownMovementRuntimeBehavior.BasisTransformation | null;
    private _temporaryPointForTransformations: FloatPoint = [0, 0];

    // Pixel perfect
    private _cellSize: integer = 16;
    private _gridOffsetX: integer = 0;
    private _gridOffsetY: integer = 0;
    private _targetX: integer | null = null;
    private _targetY: integer | null = null;
    private _targetDirectionX: integer = 0;
    private _targetDirectionY: integer = 0;
    private _lastDirection = -1;
    private static epsilon = 1 / (1 << 20);

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      behaviorData,
      owner: gdjs.RuntimeObject
    ) {
      super(instanceContainer, behaviorData, owner);
      this._allowDiagonals = behaviorData.allowDiagonals;
      this._acceleration = behaviorData.acceleration;
      this._deceleration = behaviorData.deceleration;
      this._maxSpeed = behaviorData.maxSpeed;
      this._angularMaxSpeed = behaviorData.angularMaxSpeed;
      this._rotateObject = behaviorData.rotateObject;
      this._angleOffset = behaviorData.angleOffset;
      this._ignoreDefaultControls = behaviorData.ignoreDefaultControls;
      this.setViewpoint(
        behaviorData.viewpoint,
        behaviorData.customIsometryAngle
      );
      this._movementAngleOffset = behaviorData.movementAngleOffset || 0;
    }

    updateFromBehaviorData(oldBehaviorData, newBehaviorData): boolean {
      if (oldBehaviorData.allowDiagonals !== newBehaviorData.allowDiagonals) {
        this._allowDiagonals = newBehaviorData.allowDiagonals;
      }
      if (oldBehaviorData.acceleration !== newBehaviorData.acceleration) {
        this._acceleration = newBehaviorData.acceleration;
      }
      if (oldBehaviorData.deceleration !== newBehaviorData.deceleration) {
        this._deceleration = newBehaviorData.deceleration;
      }
      if (oldBehaviorData.maxSpeed !== newBehaviorData.maxSpeed) {
        this._maxSpeed = newBehaviorData.maxSpeed;
      }
      if (oldBehaviorData.angularMaxSpeed !== newBehaviorData.angularMaxSpeed) {
        this._angularMaxSpeed = newBehaviorData.angularMaxSpeed;
      }
      if (oldBehaviorData.rotateObject !== newBehaviorData.rotateObject) {
        this._rotateObject = newBehaviorData.rotateObject;
      }
      if (oldBehaviorData.angleOffset !== newBehaviorData.angleOffset) {
        this._angleOffset = newBehaviorData.angleOffset;
      }
      if (
        oldBehaviorData.ignoreDefaultControls !==
        newBehaviorData.ignoreDefaultControls
      ) {
        this._ignoreDefaultControls = newBehaviorData.ignoreDefaultControls;
      }
      if (
        oldBehaviorData.platformType !== newBehaviorData.platformType ||
        oldBehaviorData.customIsometryAngle !==
          newBehaviorData.customIsometryAngle
      ) {
        this.setViewpoint(
          newBehaviorData.platformType,
          newBehaviorData.customIsometryAngle
        );
      }
      if (
        oldBehaviorData.movementAngleOffset !==
        newBehaviorData.movementAngleOffset
      ) {
        this._movementAngleOffset = newBehaviorData.movementAngleOffset;
      }
      return true;
    }

    setViewpoint(viewpoint: string, customIsometryAngle: float): void {
      if (viewpoint === 'PixelIsometry') {
        this._basisTransformation = new gdjs.TopDownMovementRuntimeBehavior.IsometryTransformation(
          Math.atan(0.5)
        );
      } else if (viewpoint === 'TrueIsometry') {
        this._basisTransformation = new gdjs.TopDownMovementRuntimeBehavior.IsometryTransformation(
          Math.PI / 6
        );
      } else if (viewpoint === 'CustomIsometry') {
        this._basisTransformation = new gdjs.TopDownMovementRuntimeBehavior.IsometryTransformation(
          (customIsometryAngle * Math.PI) / 180
        );
      } else {
        this._basisTransformation = null;
      }
    }

    setAcceleration(acceleration: float): void {
      this._acceleration = acceleration;
    }

    getAcceleration() {
      return this._acceleration;
    }

    setDeceleration(deceleration: float): void {
      this._deceleration = deceleration;
    }

    getDeceleration() {
      return this._deceleration;
    }

    setMaxSpeed(maxSpeed: float): void {
      this._maxSpeed = maxSpeed;
    }

    getMaxSpeed() {
      return this._maxSpeed;
    }

    setAngularMaxSpeed(angularMaxSpeed: float): void {
      this._angularMaxSpeed = angularMaxSpeed;
    }

    getAngularMaxSpeed() {
      return this._angularMaxSpeed;
    }

    setAngleOffset(angleOffset: float): void {
      this._angleOffset = angleOffset;
    }

    getAngleOffset() {
      return this._angleOffset;
    }

    allowDiagonals(allow: boolean) {
      this._allowDiagonals = allow;
    }

    diagonalsAllowed() {
      return this._allowDiagonals;
    }

    setRotateObject(allow: boolean): void {
      this._rotateObject = allow;
    }

    isObjectRotated(): boolean {
      return this._rotateObject;
    }

    isMoving(): boolean {
      return this._xVelocity !== 0 || this._yVelocity !== 0;
    }

    getSpeed(): float {
      return Math.sqrt(
        this._xVelocity * this._xVelocity + this._yVelocity * this._yVelocity
      );
    }

    getXVelocity(): float {
      return this._xVelocity;
    }

    setXVelocity(velocityX: float): void {
      this._xVelocity = velocityX;
    }

    getYVelocity(): float {
      return this._yVelocity;
    }

    setYVelocity(velocityY: float): void {
      this._yVelocity = velocityY;
    }

    getAngle(): float {
      return this._angle;
    }

    isMovementAngleAround(degreeAngle: float, tolerance: float) {
      return (
        Math.abs(
          gdjs.evtTools.common.angleDifference(this._angle, degreeAngle)
        ) <= tolerance
      );
    }

    setMovementAngleOffset(movementAngleOffset: float): void {
      this._movementAngleOffset = movementAngleOffset;
    }

    getMovementAngleOffset() {
      return this._movementAngleOffset;
    }

    doStepPreEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {
      const object = this.owner;
      const timeDelta = this.owner.getElapsedTime() / 1000;

      const LEFTKEY = 37;
      const UPKEY = 38;
      const RIGHTKEY = 39;
      const DOWNKEY = 40;

      //Get the player input:
      // @ts-ignore
      this._leftKey |=
        !this._ignoreDefaultControls &&
        instanceContainer.getGame().getInputManager().isKeyPressed(LEFTKEY);
      // @ts-ignore
      this._rightKey |=
        !this._ignoreDefaultControls &&
        instanceContainer.getGame().getInputManager().isKeyPressed(RIGHTKEY);
      // @ts-ignore
      this._downKey |=
        !this._ignoreDefaultControls &&
        instanceContainer.getGame().getInputManager().isKeyPressed(DOWNKEY);
      // @ts-ignore
      this._upKey |=
        !this._ignoreDefaultControls &&
        instanceContainer.getGame().getInputManager().isKeyPressed(UPKEY);

      const elapsedTime = this.owner.getElapsedTime();

      if (!this._leftKey) {
        this._leftKeyPressedDuration = 0;
      } else {
        this._leftKeyPressedDuration += elapsedTime;
      }
      if (!this._rightKey) {
        this._rightKeyPressedDuration = 0;
      } else {
        this._rightKeyPressedDuration += elapsedTime;
      }
      if (!this._downKey) {
        this._downKeyPressedDuration = 0;
      } else {
        this._downKeyPressedDuration += elapsedTime;
      }
      if (!this._upKey) {
        this._upKeyPressedDuration = 0;
      } else {
        this._upKeyPressedDuration += elapsedTime;
      }

      let direction = -1;
      if (!this._allowDiagonals) {
        if (this._upKey && !this._downKey) {
          direction = 6;
        } else if (!this._upKey && this._downKey) {
          direction = 2;
        }
        // when 2 keys are pressed for diagonals the most recently pressed win
        if (
          this._leftKey &&
          !this._rightKey &&
          (this._upKey === this._downKey ||
            (this._upKey &&
              this._leftKeyPressedDuration < this._upKeyPressedDuration) ||
            (this._downKey &&
              this._leftKeyPressedDuration < this._downKeyPressedDuration))
        ) {
          direction = 4;
        } else if (
          this._rightKey &&
          !this._leftKey &&
          (this._upKey === this._downKey ||
            (this._upKey &&
              this._rightKeyPressedDuration < this._upKeyPressedDuration) ||
            (this._downKey &&
              this._rightKeyPressedDuration < this._downKeyPressedDuration))
        ) {
          direction = 0;
        }

        if (this._cellSize > 0) {
          // Forbid to turn before being aligned on the grid.

          const deltaX = Math.abs(this._xVelocity * timeDelta);
          const deltaY = Math.abs(this._yVelocity * timeDelta);

          const isTryingToMoveOnX = direction === 4 || direction === 0;
          const isTryingToMoveOnY = direction === 6 || direction === 2;
          if (isTryingToMoveOnX) {
            if (this._yVelocity < 0) {
              if (Math.abs(this.ceilToCellY(object.y) - object.y) > deltaY) {
                direction = 6;
              } else {
                object.y = this.ceilToCellY(object.y);
              }
            }
            if (this._yVelocity > 0) {
              if (Math.abs(this.floorToCellY(object.y) - object.y) > deltaY) {
                direction = 2;
              } else {
                object.y = this.floorToCellY(object.y);
              }
            }
          } else if (isTryingToMoveOnY) {
            if (this._xVelocity < 0) {
              if (Math.abs(this.ceilToCellX(object.x) - object.x) > deltaX) {
                direction = 4;
              } else {
                object.x = this.ceilToCellX(object.x);
              }
            }
            if (this._xVelocity > 0) {
              if (Math.abs(this.floorToCellX(object.x) - object.x) > deltaX) {
                direction = 0;
              } else {
                object.x = this.floorToCellX(object.x);
              }
            }
          }

          // Ensure sharp turn even with Verlet integrations.
          const speed = Math.abs(this._xVelocity + this._yVelocity);
          if (direction === 0) {
            this._xVelocity = speed;
            this._yVelocity = 0;
          } else if (direction === 4) {
            this._xVelocity = -speed;
            this._yVelocity = 0;
          } else if (direction === 2) {
            this._yVelocity = speed;
            this._xVelocity = 0;
          } else if (direction === 6) {
            this._yVelocity = -speed;
            this._xVelocity = 0;
          }
        }
      } else {
        if (this._upKey && !this._downKey) {
          if (this._leftKey && !this._rightKey) {
            direction = 5;
          } else if (!this._leftKey && this._rightKey) {
            direction = 7;
          } else {
            direction = 6;
          }
        } else if (!this._upKey && this._downKey) {
          if (this._leftKey && !this._rightKey) {
            direction = 3;
          } else if (!this._leftKey && this._rightKey) {
            direction = 1;
          } else {
            direction = 2;
          }
        } else {
          if (this._leftKey && !this._rightKey) {
            direction = 4;
          } else if (!this._leftKey && this._rightKey) {
            direction = 0;
          }
        }
      }

      if (this._cellSize > 0) {
        const isMovingOnX =
          direction !== -1 && direction !== 2 && direction !== 6;
        if (isMovingOnX) {
          this._targetX = null;
        } else if (this._targetX === null) {
          // Find where the deceleration should stop the object.
          if (this._xVelocity > 0) {
            this._targetX = this.ceilToCellX(
              object.x + this.getBreakingDistanceX()
            );
            this._targetDirectionX = 1;
          }
          if (this._xVelocity < 0) {
            this._targetX = this.floorToCellX(
              object.x - this.getBreakingDistanceX()
            );
            this._targetDirectionX = -1;
          }
        }

        const isMovingOnY =
          direction !== -1 && direction !== 0 && direction !== 4;
        if (isMovingOnY) {
          this._targetY = null;
        } else if (this._targetY === null) {
          // Find where the deceleration should stop the object.
          if (this._yVelocity > 0) {
            this._targetY = this.ceilToCellY(
              object.y + this.getBreakingDistanceY()
            );
            this._targetDirectionY = 1;
          }
          if (this._yVelocity < 0) {
            this._targetY = this.floorToCellY(
              object.y - this.getBreakingDistanceY()
            );
            this._targetDirectionY = -1;
          }
        }
      }

      let previousVelocityX = this._xVelocity;
      let previousVelocityY = this._yVelocity;
      this._wasStickUsed = false;

      // These 4 values are not actually used.
      // JavaScript doesn't allow to declare
      // variables without assigning them a value.
      let directionInRad = 0;
      let directionInDeg = 0;
      let cos = 1;
      let sin = 0;

      // Update the speed of the object:
      if (direction !== -1) {
        directionInRad =
          ((direction + this._movementAngleOffset / 45) * Math.PI) / 4.0;
        directionInDeg = direction * 45 + this._movementAngleOffset;
        // This makes the trigo resilient to rounding errors on directionInRad.
        cos = Math.cos(directionInRad);
        sin = Math.sin(directionInRad);
        if (cos === -1 || cos === 1) {
          sin = 0;
        }
        if (sin === -1 || sin === 1) {
          cos = 0;
        }
        this._xVelocity += this._acceleration * timeDelta * cos;
        this._yVelocity += this._acceleration * timeDelta * sin;
      } else if (this._stickForce !== 0) {
        if (!this._allowDiagonals) {
          this._stickAngle = 90 * Math.floor((this._stickAngle + 45) / 90);
        }
        directionInDeg = this._stickAngle + this._movementAngleOffset;
        directionInRad = (directionInDeg * Math.PI) / 180;
        const norm = this._acceleration * timeDelta * this._stickForce;
        // This makes the trigo resilient to rounding errors on directionInRad.
        cos = Math.cos(directionInRad);
        sin = Math.sin(directionInRad);
        if (cos === -1 || cos === 1) {
          sin = 0;
        }
        if (sin === -1 || sin === 1) {
          cos = 0;
        }
        this._xVelocity += norm * cos;
        this._yVelocity += norm * sin;

        this._wasStickUsed = true;
        this._stickForce = 0;
      } else if (this._yVelocity !== 0 || this._xVelocity !== 0) {
        directionInRad = Math.atan2(this._yVelocity, this._xVelocity);
        directionInDeg = (directionInRad * 180.0) / Math.PI;
        const xVelocityWasPositive = this._xVelocity >= 0;
        const yVelocityWasPositive = this._yVelocity >= 0;
        // This makes the trigo resilient to rounding errors on directionInRad.
        cos = Math.cos(directionInRad);
        sin = Math.sin(directionInRad);
        if (cos === -1 || cos === 1) {
          sin = 0;
        }
        if (sin === -1 || sin === 1) {
          cos = 0;
        }
        this._xVelocity -= this._deceleration * timeDelta * cos;
        this._yVelocity -= this._deceleration * timeDelta * sin;
        if (this._xVelocity > 0 !== xVelocityWasPositive) {
          this._xVelocity = 0;
        }
        if (this._yVelocity > 0 !== yVelocityWasPositive) {
          this._yVelocity = 0;
        }
      }
      const squaredSpeed =
        this._xVelocity * this._xVelocity + this._yVelocity * this._yVelocity;
      if (squaredSpeed > this._maxSpeed * this._maxSpeed) {
        this._xVelocity = this._maxSpeed * cos;
        this._yVelocity = this._maxSpeed * sin;
      }

      if (this._cellSize > 0) {
        // Make as if the player had press button a bit longer to reach exactly
        // the next cell.

        if (this._targetX !== null) {
          if (this._targetX > object.x) {
            if (this._targetDirectionX > 0) {
              this._xVelocity = Math.min(
                this._xVelocity + this._acceleration,
                this._maxSpeed,
                this.getSpeedToReach(this._targetX - object.x)
              );
            } else {
              this._xVelocity = 0;
              object.x = this.roundToCellX(object.x);
              this._targetX = null;
            }
          } else {
            if (this._targetDirectionX < 0) {
              this._xVelocity = Math.max(
                this._xVelocity - this._acceleration,
                -this._maxSpeed,
                this.getSpeedToReach(this._targetX - object.x)
              );
            } else {
              this._xVelocity = 0;
              object.x = this.roundToCellX(object.x);
              this._targetX = null;
            }
          }
          //console.log("X: " + object.x + "SpeedX: " + this._xVelocity);
          // The velocity is exact. There no need for Verlet integration.
          previousVelocityX = this._xVelocity;
        }

        if (this._targetY !== null) {
          if (this._targetY > object.y) {
            if (this._targetDirectionY > 0) {
              this._yVelocity = Math.min(
                this._yVelocity + this._acceleration,
                this._maxSpeed,
                this.getSpeedToReach(this._targetY - object.y)
              );
            } else {
              this._yVelocity = 0;
              object.y = this.roundToCellY(object.y);
              this._targetY = null;
            }
          } else {
            if (this._targetDirectionY < 0) {
              this._yVelocity = Math.max(
                this._yVelocity - this._acceleration,
                -this._maxSpeed,
                this.getSpeedToReach(this._targetY - object.y)
              );
            } else {
              this._yVelocity = 0;
              object.y = this.roundToCellY(object.y);
              this._targetY = null;
            }
          }
          // The velocity is exact. There no need for Verlet integration.
          previousVelocityY = this._yVelocity;
        }
      }

      // No acceleration for angular speed for now.
      this._angularSpeed = this._angularMaxSpeed;

      // Position object.
      // This is a Verlet integration considering the acceleration as constant.
      // If you expand deltaX or deltaY, it gives, thanks to the usage of both
      // the old and the new velocity:
      // "velocity * timeDelta + acceleration * timeDelta^2 / 2".
      //
      // The acceleration is not actually always constant, particularly with a gamepad,
      // but the error is multiplied by timDelta^3. So, it shouldn't matter much.
      const deltaX = ((previousVelocityX + this._xVelocity) / 2) * timeDelta;
      const deltaY = ((previousVelocityY + this._yVelocity) / 2) * timeDelta;
      if (this._basisTransformation === null) {
        // Top-down viewpoint
        object.setX(object.getX() + deltaX);
        object.setY(object.getY() + deltaY);
      } else {
        // Isometry viewpoint
        const point = this._temporaryPointForTransformations;
        point[0] = deltaX;
        point[1] = deltaY;
        this._basisTransformation.toScreen(point, point);
        object.setX(object.getX() + point[0]);
        object.setY(object.getY() + point[1]);
      }

      // Also update angle if needed.
      if (this._xVelocity !== 0 || this._yVelocity !== 0) {
        this._angle = directionInDeg;
        if (this._rotateObject) {
          object.rotateTowardAngle(
            directionInDeg + this._angleOffset,
            this._angularSpeed
          );
        }
      }

      this._lastDirection = direction;
      this._leftKey = false;
      this._rightKey = false;
      this._upKey = false;
      this._downKey = false;
    }

    doStepPostEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {
      const object = this.owner;

      const isMovingOnX =
        this._lastDirection !== -1 &&
        this._lastDirection !== 2 &&
        this._lastDirection !== 6;
      const isMovingOnY =
        this._lastDirection !== -1 &&
        this._lastDirection !== 0 &&
        this._lastDirection !== 4;

      // Avoid rounding errors after a call to "separate" to make characters
      // move indefinitely in front of a wall because they can't reach the cell.
      if (!isMovingOnX && this._xVelocity !== 0) {
        const x = object.getX();
        const roundedX = this.roundToCellX(x);
        if (Math.abs(roundedX - x) < TopDownMovementRuntimeBehavior.epsilon) {
          object.setX(roundedX);
          this._targetDirectionX = 0;
          this._xVelocity = 0;
        }
      }
      if (!isMovingOnY && this._yVelocity !== 0) {
        const y = object.getY();
        const roundedY = this.roundToCellY(y);
        if (Math.abs(roundedY - y) < TopDownMovementRuntimeBehavior.epsilon) {
          object.setY(roundedY);
          this._targetDirectionY = 0;
          this._yVelocity = 0;
        }
      }
    }

    /**
     * @returns the braking distance according to an initial speed and a deceleration.
     */
    getBreakingDistanceX() {
      return (this._xVelocity * this._xVelocity) / (2 * this._deceleration);
    }

    /**
     * @returns the braking distance according to an initial speed and a deceleration.
     */
    getBreakingDistanceY() {
      return (this._yVelocity * this._yVelocity) / (2 * this._deceleration);
    }

    /**
     * @returns the speed necessary to cover a distance according to the deceleration.
     */
    getSpeedToReach(displacement: number) {
      return (
        Math.sign(displacement) *
        Math.sqrt(2 * Math.abs(displacement) * this._deceleration)
      );
    }

    ceilToCellX(x: float) {
      return (
        this._gridOffsetX +
        this._cellSize * Math.ceil((x - this._gridOffsetX) / this._cellSize)
      );
    }

    roundToCellX(x: float) {
      return (
        this._gridOffsetX +
        this._cellSize * Math.round((x - this._gridOffsetX) / this._cellSize)
      );
    }

    floorToCellX(x: float) {
      return (
        this._gridOffsetX +
        this._cellSize * Math.floor((x - this._gridOffsetX) / this._cellSize)
      );
    }

    ceilToCellY(y: float) {
      return (
        this._gridOffsetY +
        this._cellSize * Math.ceil((y - this._gridOffsetY) / this._cellSize)
      );
    }

    roundToCellY(y: float) {
      return (
        this._gridOffsetY +
        this._cellSize * Math.round((y - this._gridOffsetY) / this._cellSize)
      );
    }

    floorToCellY(y: float) {
      return (
        this._gridOffsetY +
        this._cellSize * Math.floor((y - this._gridOffsetY) / this._cellSize)
      );
    }

    simulateControl(input: string) {
      if (input === 'Left') {
        this._leftKey = true;
      } else if (input === 'Right') {
        this._rightKey = true;
      } else if (input === 'Up') {
        this._upKey = true;
      } else if (input === 'Down') {
        this._downKey = true;
      }
    }

    ignoreDefaultControls(ignore: boolean) {
      this._ignoreDefaultControls = ignore;
    }

    simulateLeftKey() {
      this._leftKey = true;
    }

    simulateRightKey() {
      this._rightKey = true;
    }

    simulateUpKey() {
      this._upKey = true;
    }

    simulateDownKey() {
      this._downKey = true;
    }

    simulateStick(stickAngle: float, stickForce: float) {
      this._stickAngle = stickAngle % 360;
      this._stickForce = Math.max(0, Math.min(1, stickForce));
    }

    /**.
     * @param input The control to be tested [Left,Right,Up,Down,Stick].
     * @returns true if the key was used since the last `doStepPreEvents` call.
     */
    isUsingControl(input: string): boolean {
      if (input === 'Left') {
        return this._leftKeyPressedDuration > 0;
      }
      if (input === 'Right') {
        return this._rightKeyPressedDuration > 0;
      }
      if (input === 'Up') {
        return this._upKeyPressedDuration > 0;
      }
      if (input === 'Down') {
        return this._downKeyPressedDuration > 0;
      }
      if (input === 'Stick') {
        return this._wasStickUsed;
      }
      return false;
    }

    getLastStickInputAngle() {
      return this._stickAngle;
    }
  }
  export namespace TopDownMovementRuntimeBehavior {
    export interface BasisTransformation {
      toScreen(worldPoint: FloatPoint, screenPoint: FloatPoint): void;
    }

    export class IsometryTransformation
      implements gdjs.TopDownMovementRuntimeBehavior.BasisTransformation {
      private _screen: float[][];

      /**
       * @param angle between the x axis and the projected isometric x axis.
       * @throws if the angle is not in ]0; pi/4[. Note that 0 is a front viewpoint and pi/4 a top-down viewpoint.
       */
      constructor(angle: float) {
        if (angle <= 0 || angle >= Math.PI / 4)
          throw new RangeError(
            'An isometry angle must be in ]0; pi/4] but was: ' + angle
          );

        const alpha = Math.asin(Math.tan(angle));
        const sinA = Math.sin(alpha);
        const cosB = Math.cos(Math.PI / 4);
        const sinB = cosB;
        // https://en.wikipedia.org/wiki/Isometric_projection
        //
        //   / 1     0    0 \ / cosB 0 -sinB \ / 1 0  0 \
        //   | 0  cosA sinA | |    0 1     0 | | 0 0 -1 |
        //   \ 0 -sinA cosA / \ sinB 0  cosB / \ 0 1  0 /
        this._screen = [
          [cosB, -sinB],
          [sinA * sinB, sinA * cosB],
        ];
      }

      toScreen(worldPoint: FloatPoint, screenPoint: FloatPoint): void {
        const x =
          this._screen[0][0] * worldPoint[0] +
          this._screen[0][1] * worldPoint[1];
        const y =
          this._screen[1][0] * worldPoint[0] +
          this._screen[1][1] * worldPoint[1];
        screenPoint[0] = x;
        screenPoint[1] = y;
      }
    }
  }

  gdjs.registerBehavior(
    'TopDownMovementBehavior::TopDownMovementBehavior',
    gdjs.TopDownMovementRuntimeBehavior
  );
}
