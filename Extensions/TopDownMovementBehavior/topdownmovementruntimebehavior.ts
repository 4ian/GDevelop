/*
GDevelop - Top-down movement Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
 */

namespace gdjs {
  type FloatPoint = [float, float];
  /**
   * Allows an object to move in 4 or 8 directions, with customizable speed, accelerations
   * and rotation.
   */
  export class TopDownMovementRuntimeBehavior extends gdjs.RuntimeBehavior {
    static TOP_DOWN = 0;
    static PIXEL_ISOMETRY = 1;
    static TRUE_ISOMETRY = 2;
    static CUSTOM_ISOMETRY = 2;

    //Behavior configuration:
    _allowDiagonals: any;
    _acceleration: any;
    _deceleration: any;
    _maxSpeed: any;
    _angularMaxSpeed: any;
    _rotateObject: any;
    _angleOffset: any;
    _ignoreDefaultControls: any;

    /** The latest angle of movement, in degrees. */
    _angle: float = 0;

    //Attributes used when moving
    _x: float = 0;
    _y: float = 0;
    _xVelocity: float = 0;
    _yVelocity: float = 0;
    _angularSpeed: float = 0;
    _leftKey: boolean = false;
    _rightKey: boolean = false;
    _upKey: boolean = false;
    _downKey: boolean = false;

    // @ts-ignore The setter "setViewpoint" is not detected as an affectation.
    _basisTransformation: BasisTransformation | null;
    _temporaryPointForTransformations: FloatPoint = [0, 0];

    constructor(runtimeScene, behaviorData, owner) {
      super(runtimeScene, behaviorData, owner);
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
      return true;
    }

    setViewpoint(viewpoint: string, customIsometryAngle: float): void {
      if (viewpoint == 'PixelIsometry') {
        this._basisTransformation = new IsometryTransformation(Math.atan(0.5));
      } else if (viewpoint == 'TrueIsometry') {
        this._basisTransformation = new IsometryTransformation(Math.PI / 6);
      } else if (viewpoint == 'CustomIsometry') {
        this._basisTransformation = new IsometryTransformation(
          (customIsometryAngle * Math.PI) / 180
        );
      } else {
        this._basisTransformation = null;
      }
    }

    setAcceleration(acceleration): void {
      this._acceleration = acceleration;
    }

    getAcceleration() {
      return this._acceleration;
    }

    setDeceleration(deceleration): void {
      this._deceleration = deceleration;
    }

    getDeceleration() {
      return this._deceleration;
    }

    setMaxSpeed(maxSpeed): void {
      this._maxSpeed = maxSpeed;
    }

    getMaxSpeed() {
      return this._maxSpeed;
    }

    setAngularMaxSpeed(angularMaxSpeed): void {
      this._angularMaxSpeed = angularMaxSpeed;
    }

    getAngularMaxSpeed() {
      return this._angularMaxSpeed;
    }

    setAngleOffset(angleOffset): void {
      this._angleOffset = angleOffset;
    }

    getAngleOffset() {
      return this._angleOffset;
    }

    allowDiagonals(allow) {
      this._allowDiagonals = allow;
    }

    diagonalsAllowed() {
      return this._allowDiagonals;
    }

    setRotateObject(allow): void {
      this._rotateObject = allow;
    }

    isObjectRotated(): boolean {
      return this._rotateObject;
    }

    isMoving(): boolean {
      return this._xVelocity !== 0 || this._yVelocity !== 0;
    }

    getSpeed() {
      return Math.sqrt(
        this._xVelocity * this._xVelocity + this._yVelocity * this._yVelocity
      );
    }

    getXVelocity() {
      return this._xVelocity;
    }

    getYVelocity() {
      return this._yVelocity;
    }

    getAngle(): float {
      return this._angle;
    }

    doStepPreEvents(runtimeScene) {
      const LEFTKEY = 37;
      const UPKEY = 38;
      const RIGHTKEY = 39;
      const DOWNKEY = 40;
      const object = this.owner;
      const timeDelta = this.owner.getElapsedTime(runtimeScene) / 1000;

      //Get the player input:
      // @ts-ignore
      this._leftKey |=
        !this._ignoreDefaultControls &&
        runtimeScene.getGame().getInputManager().isKeyPressed(LEFTKEY);
      // @ts-ignore
      this._rightKey |=
        !this._ignoreDefaultControls &&
        runtimeScene.getGame().getInputManager().isKeyPressed(RIGHTKEY);
      // @ts-ignore
      this._downKey |=
        !this._ignoreDefaultControls &&
        runtimeScene.getGame().getInputManager().isKeyPressed(DOWNKEY);
      // @ts-ignore
      this._upKey |=
        !this._ignoreDefaultControls &&
        runtimeScene.getGame().getInputManager().isKeyPressed(UPKEY);
      let direction = -1;
      let directionInRad = 0;
      let directionInDeg = 0;
      if (!this._allowDiagonals) {
        if (this._upKey && !this._downKey) {
          direction = 6;
        } else {
          if (!this._upKey && this._downKey) {
            direction = 2;
          }
        }
        if (!this._upKey && !this._downKey) {
          if (this._leftKey && !this._rightKey) {
            direction = 4;
          } else {
            if (!this._leftKey && this._rightKey) {
              direction = 0;
            }
          }
        }
      } else {
        if (this._upKey && !this._downKey) {
          if (this._leftKey && !this._rightKey) {
            direction = 5;
          } else {
            if (!this._leftKey && this._rightKey) {
              direction = 7;
            } else {
              direction = 6;
            }
          }
        } else {
          if (!this._upKey && this._downKey) {
            if (this._leftKey && !this._rightKey) {
              direction = 3;
            } else {
              if (!this._leftKey && this._rightKey) {
                direction = 1;
              } else {
                direction = 2;
              }
            }
          } else {
            if (this._leftKey && !this._rightKey) {
              direction = 4;
            } else {
              if (!this._leftKey && this._rightKey) {
                direction = 0;
              }
            }
          }
        }
      }

      //Update the speed of the object
      if (direction != -1) {
        directionInRad = (direction * Math.PI) / 4.0;
        directionInDeg = direction * 45;
        this._xVelocity +=
          this._acceleration * timeDelta * Math.cos(directionInRad);
        this._yVelocity +=
          this._acceleration * timeDelta * Math.sin(directionInRad);
      } else {
        directionInRad = Math.atan2(this._yVelocity, this._xVelocity);
        directionInDeg =
          (Math.atan2(this._yVelocity, this._xVelocity) * 180.0) / Math.PI;
        const xVelocityWasPositive = this._xVelocity >= 0;
        const yVelocityWasPositive = this._yVelocity >= 0;
        this._xVelocity -=
          this._deceleration * timeDelta * Math.cos(directionInRad);
        this._yVelocity -=
          this._deceleration * timeDelta * Math.sin(directionInRad);
        // @ts-ignore
        if ((this._xVelocity > 0) ^ xVelocityWasPositive) {
          this._xVelocity = 0;
        }
        // @ts-ignore
        if ((this._yVelocity > 0) ^ yVelocityWasPositive) {
          this._yVelocity = 0;
        }
      }
      const speed = Math.sqrt(
        this._xVelocity * this._xVelocity + this._yVelocity * this._yVelocity
      );
      if (speed > this._maxSpeed) {
        this._xVelocity = this._maxSpeed * Math.cos(directionInRad);
        this._yVelocity = this._maxSpeed * Math.sin(directionInRad);
      }
      this._angularSpeed = this._angularMaxSpeed;

      //No acceleration for angular speed for now

      //Position object
      if (this._basisTransformation == null) {
        // Top-down pointview
        object.setX(object.getX() + this._xVelocity * timeDelta);
        object.setY(object.getY() + this._yVelocity * timeDelta);
      }
      else {
        // Isometry pointview
        const point = this._temporaryPointForTransformations;
        point[0] = this._xVelocity * timeDelta;
        point[1] = this._yVelocity * timeDelta;
        this._basisTransformation.toScreen(point, point);
        object.setX(object.getX() + point[0]);
        object.setY(object.getY() + point[1]);
      }

      //Also update angle if needed
      if (this._xVelocity !== 0 || this._yVelocity !== 0) {
        this._angle = directionInDeg;
        if (this._rotateObject) {
          object.rotateTowardAngle(
            directionInDeg + this._angleOffset,
            this._angularSpeed,
            runtimeScene
          );
        }
      }

      this._leftKey = false;
      this._rightKey = false;
      this._upKey = false;
      this._downKey = false;
    }

    simulateControl(input) {
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

    ignoreDefaultControls(ignore) {
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
  }

  export interface BasisTransformation {
    toScreen(worldPoint: FloatPoint, screenPoint: FloatPoint): void;
  }

  export class IsometryTransformation implements BasisTransformation {
    _screen: float[][];

    /**
     * @param angle between the x axis and the projected isometric x axis.
     * @throws if the angle is not in ]0; pi/4[. Note that 0 is a front viewpoint and pi/4 a top-down viewpoint.
     */
    constructor(angle: float) {
      if (angle <= 0 || angle >= Math.PI / 4)
        throw new RangeError("An isometry angle must be in ]0; pi/4] but was: " + angle);
      
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
        this._screen[0][0] * worldPoint[0] + this._screen[0][1] * worldPoint[1];
      const y =
        this._screen[1][0] * worldPoint[0] + this._screen[1][1] * worldPoint[1];
      screenPoint[0] = x;
      screenPoint[1] = y;
    }
  }

  gdjs.registerBehavior(
    'TopDownMovementBehavior::TopDownMovementBehavior',
    gdjs.TopDownMovementRuntimeBehavior
  );
}
