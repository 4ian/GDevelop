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
    static TOP_DOWN = 0;
    static PIXEL_ISOMETRIE = 1;
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
    _viewpoint: any;
    _customIsometryAngle: any;

    /** The latest angle of movement, in degrees. */
    _angle: float = 0;

    //Attributes used when moving
    _x: number = 0;
    _y: number = 0;
    _xVelocity: float = 0;
    _yVelocity: float = 0;
    _angularSpeed: number = 0;
    _leftKey: boolean = false;
    _rightKey: boolean = false;
    _upKey: boolean = false;
    _downKey: boolean = false;
    
    // @ts-ignore
    _basisTransformation: BasisTransformation;
    _point: number[] = [0, 0];

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
      this.setViewpoint(behaviorData.viewpoint, behaviorData.customIsometryAngle);
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
      if (oldBehaviorData.platformType !== newBehaviorData.platformType
       || oldBehaviorData.customIsometryAngle !== newBehaviorData.customIsometryAngle) {
        this.setViewpoint(newBehaviorData.platformType, newBehaviorData.customIsometryAngle);
      }
      return true;
    }

    setViewpoint(viewpoint: string, customIsometryAngle: number): void {
      this._customIsometryAngle = customIsometryAngle;
      if (viewpoint == 'PixelIsometry') {
        this._viewpoint = TopDownMovementRuntimeBehavior.PIXEL_ISOMETRIE;
        this._basisTransformation = new IsometryTransformation(Math.atan(0.5));
      }
      else if (viewpoint == 'TrueIsometry') {
        this._viewpoint = TopDownMovementRuntimeBehavior.TRUE_ISOMETRY;
      this._basisTransformation = new IsometryTransformation(Math.PI / 6);
      }
      else if (viewpoint == 'CustomIsometry') {
        this._viewpoint = TopDownMovementRuntimeBehavior.CUSTOM_ISOMETRY;
        this._basisTransformation = new IsometryTransformation(this._customIsometryAngle * Math.PI / 180);
      }
      else {
        this._viewpoint = TopDownMovementRuntimeBehavior.TOP_DOWN;
        this._basisTransformation = new IdentityTransformation();
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
      
      const object = this.owner;
      
      /* Check if the object has moved
       * To avoid to loop on the transform and its inverse
       * beacause of float approximation.
       */
      this._point[0] = this._x;
      this._point[1] = this._y;
      this._basisTransformation.toScreen(this._point, this._point)
      if (object.getX() != this._point[0]
       || object.getY() != this._point[1])
      {
        this._point[0] = object.getX();
        this._point[1] = object.getY();
        this._basisTransformation.toWorld(this._point, this._point);
        this._x = this._point[0];
        this._y = this._point[1];
      }

      const LEFTKEY = 37;
      const UPKEY = 38;
      const RIGHTKEY = 39;
      const DOWNKEY = 40;
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
      this._x += this._xVelocity * timeDelta;
      this._y += this._yVelocity * timeDelta;

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
      
      this._point[0] = this._x;
      this._point[1] = this._y;
      this._basisTransformation.toScreen(this._point, this._point)
      object.setX(this._point[0]);
      object.setY(this._point[1]);
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
    
    toScreen(worldPoint: number[], screenPoint: number[]): void;
    
    toWorld(screenPoint: number[], worldPoint: number[]): void;
  }
  
  export class IdentityTransformation implements BasisTransformation {
    
    toScreen(wordPoint: number[], screenPoint: number[]): void {
      screenPoint[0] = wordPoint[0];
      screenPoint[1] = wordPoint[1];
    }
    
    toWorld(screenPoint: number[], wordPoint: number[]): void {
      wordPoint[0] = screenPoint[0];
      wordPoint[1] = screenPoint[1];
    }
  }
  
  export class IsometryTransformation implements BasisTransformation {
    
    screen: number[][];
    world: number[][];
    
    constructor(angle: number) {
      const alpha = Math.asin(Math.tan(angle));
      const sinA = Math.sin(alpha);
      const cosB = Math.cos(Math.PI / 4);
      const sinB = Math.sin(Math.PI / 4);
      /* https://en.wikipedia.org/wiki/Isometric_projection
       * 
       *   / 1     0    0 \ / cosB 0 -sinB \ / 1 0  0 \
       *   | 0  cosA sinA | |    0 1     0 | | 0 0 -1 |
       *   \ 0 -sinA cosA / \ sinB 0  cosB / \ 0 1  0 /
       */
      this.screen =
        [[cosB     , -sinB],
         [sinA*sinB, sinA*cosB]];
      // invert
      this.world = 
        [[ cosB, sinB/sinA],
         [-sinB, cosB/sinA]];
    }
    
    toScreen(wordPoint: number[], screenPoint: number[]): void {
      const x = this.screen[0][0] * wordPoint[0] + this.screen[0][1] * wordPoint[1];
      const y = this.screen[1][0] * wordPoint[0] + this.screen[1][1] * wordPoint[1];
      screenPoint[0] = x;
      screenPoint[1] = y;
    }
    
    toWorld(screenPoint: number[], wordPoint: number[]): void {
      const x = this.world[0][0] * screenPoint[0] + this.world[0][1] * screenPoint[1];
      const y = this.world[1][0] * screenPoint[0] + this.world[1][1] * screenPoint[1];
      wordPoint[0] = x;
      wordPoint[1] = y;
    }
  }

  gdjs.registerBehavior(
    'TopDownMovementBehavior::TopDownMovementBehavior',
    gdjs.TopDownMovementRuntimeBehavior
  );
}
