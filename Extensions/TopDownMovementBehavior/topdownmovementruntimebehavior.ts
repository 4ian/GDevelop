/*
GDevelop - Top-down movement Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
 */

namespace gdjs {
  interface TopDownMovementNetworkSyncDataType {
    a: float;
    xv: float;
    yv: float;
    as: float;
    lk: boolean;
    rk: boolean;
    uk: boolean;
    dk: boolean;
    wsu: boolean;
    sa: float;
    sf: float;
  }

  enum MovementMode {
    SharpTurnWithSmoothTurnBack = 0,
    SharpTurn,
    SmoothTurn,
  }

  const getMovementMode = (movementModeString: string) => {
    return movementModeString === 'Sharp turn'
      ? MovementMode.SharpTurn
      : movementModeString === 'Smooth turn'
        ? MovementMode.SmoothTurn
        : MovementMode.SharpTurnWithSmoothTurnBack;
  };

  export interface TopDownMovementNetworkSyncData
    extends BehaviorNetworkSyncData {
    props: TopDownMovementNetworkSyncDataType;
  }
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
    private _useLegacyTurnBack: boolean;
    private _movementMode: MovementMode;

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

    // This is useful when the object is synchronized by an external source
    // like in a multiplayer game, and we want to be able to predict the
    // movement of the object, even if the inputs are not updated every frame.
    _dontClearInputsBetweenFrames: boolean = false;
    // This is useful when the object is synchronized over the network,
    // object is controlled by the network and we want to ensure the current player
    // cannot control it.
    _ignoreDefaultControlsAsSyncedByNetwork: boolean = false;

    // This is useful for extensions that need to know
    // which keys were pressed and doesn't know the mapping
    // done by the scene events.
    private _wasLeftKeyPressed: boolean = false;
    private _wasRightKeyPressed: boolean = false;
    private _wasUpKeyPressed: boolean = false;
    private _wasDownKeyPressed: boolean = false;

    // @ts-ignore The setter "setViewpoint" is not detected as an affectation.
    private _basisTransformation: gdjs.TopDownMovementRuntimeBehavior.BasisTransformation | null;
    private _temporaryPointForTransformations: FloatPoint = [0, 0];

    private _topDownMovementHooks: Array<gdjs.TopDownMovementRuntimeBehavior.TopDownMovementHook> =
      [];

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
      this._useLegacyTurnBack =
        behaviorData.useLegacyTurnBack === undefined
          ? true
          : behaviorData.useLegacyTurnBack;
      this._movementMode = getMovementMode(behaviorData.movementMode);
    }

    getNetworkSyncData(): TopDownMovementNetworkSyncData {
      // This method is called, so we are synchronizing this object.
      // Let's clear the inputs between frames as we control it.
      this._dontClearInputsBetweenFrames = false;
      this._ignoreDefaultControlsAsSyncedByNetwork = false;

      return {
        ...super.getNetworkSyncData(),
        props: {
          a: this._angle,
          xv: this._xVelocity,
          yv: this._yVelocity,
          as: this._angularSpeed,
          lk: this._wasLeftKeyPressed,
          rk: this._wasRightKeyPressed,
          uk: this._wasUpKeyPressed,
          dk: this._wasDownKeyPressed,
          wsu: this._wasStickUsed,
          sa: this._stickAngle,
          sf: this._stickForce,
        },
      };
    }

    updateFromNetworkSyncData(
      networkSyncData: TopDownMovementNetworkSyncData
    ): void {
      super.updateFromNetworkSyncData(networkSyncData);

      const behaviorSpecificProps = networkSyncData.props;
      if (behaviorSpecificProps.a !== undefined) {
        this._angle = behaviorSpecificProps.a;
      }
      if (behaviorSpecificProps.xv !== undefined) {
        this._xVelocity = behaviorSpecificProps.xv;
      }
      if (behaviorSpecificProps.yv !== undefined) {
        this._yVelocity = behaviorSpecificProps.yv;
      }
      if (behaviorSpecificProps.as !== undefined) {
        this._angularSpeed = behaviorSpecificProps.as;
      }
      if (behaviorSpecificProps.lk !== undefined) {
        this._leftKey = behaviorSpecificProps.lk;
      }
      if (behaviorSpecificProps.rk !== undefined) {
        this._rightKey = behaviorSpecificProps.rk;
      }
      if (behaviorSpecificProps.uk !== undefined) {
        this._upKey = behaviorSpecificProps.uk;
      }
      if (behaviorSpecificProps.dk !== undefined) {
        this._downKey = behaviorSpecificProps.dk;
      }
      if (behaviorSpecificProps.wsu !== undefined) {
        this._wasStickUsed = behaviorSpecificProps.wsu;
      }
      if (behaviorSpecificProps.sa !== undefined) {
        this._stickAngle = behaviorSpecificProps.sa;
      }
      if (behaviorSpecificProps.sf !== undefined) {
        this._stickForce = behaviorSpecificProps.sf;
      }

      // When the object is synchronized from the network, the inputs must not be cleared.
      this._dontClearInputsBetweenFrames = true;
      // And we are not using the default controls.
      this._ignoreDefaultControlsAsSyncedByNetwork = true;
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
        this._basisTransformation =
          new gdjs.TopDownMovementRuntimeBehavior.IsometryTransformation(
            Math.atan(0.5)
          );
      } else if (viewpoint === 'TrueIsometry') {
        this._basisTransformation =
          new gdjs.TopDownMovementRuntimeBehavior.IsometryTransformation(
            Math.PI / 6
          );
      } else if (viewpoint === 'CustomIsometry') {
        this._basisTransformation =
          new gdjs.TopDownMovementRuntimeBehavior.IsometryTransformation(
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
      return Math.hypot(this._xVelocity, this._yVelocity);
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
      const LEFTKEY = 37;
      const UPKEY = 38;
      const RIGHTKEY = 39;
      const DOWNKEY = 40;

      //Get the player input:
      this._leftKey ||
        (this._leftKey =
          !this.shouldIgnoreDefaultControls() &&
          instanceContainer.getGame().getInputManager().isKeyPressed(LEFTKEY));
      this._rightKey ||
        (this._rightKey =
          !this.shouldIgnoreDefaultControls() &&
          instanceContainer.getGame().getInputManager().isKeyPressed(RIGHTKEY));
      this._downKey ||
        (this._downKey =
          !this.shouldIgnoreDefaultControls() &&
          instanceContainer.getGame().getInputManager().isKeyPressed(DOWNKEY));
      this._upKey ||
        (this._upKey =
          !this.shouldIgnoreDefaultControls() &&
          instanceContainer.getGame().getInputManager().isKeyPressed(UPKEY));

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

      const hookContext =
        gdjs.TopDownMovementRuntimeBehavior._topDownMovementHookContext;
      for (const topDownMovementHook of this._topDownMovementHooks) {
        hookContext._setDirection(direction);
        direction = topDownMovementHook.overrideDirection(hookContext);
      }
      hookContext._setDirection(direction);
      for (const topDownMovementHook of this._topDownMovementHooks) {
        topDownMovementHook.beforeSpeedUpdate(hookContext);
      }

      const object = this.owner;
      const timeDelta = this.owner.getElapsedTime() / 1000;
      const previousVelocityX = this._xVelocity;
      const previousVelocityY = this._yVelocity;
      this._wasStickUsed = false;

      // These 4 values are not actually used.
      // JavaScript doesn't allow to declare
      // variables without assigning them a value.
      let directionInRad = 0;
      let directionInDeg = 0;
      let cos = 1;
      let sin = 0;

      let isMoving = false;
      let targetedSpeed = 0;
      // Update the speed of the object:
      if (direction !== -1) {
        isMoving = true;
        directionInRad =
          ((direction + this._movementAngleOffset / 45) * Math.PI) / 4.0;
        directionInDeg = direction * 45 + this._movementAngleOffset;
        targetedSpeed = this._maxSpeed;
      } else if (this._stickForce !== 0) {
        isMoving = true;
        if (!this._allowDiagonals) {
          this._stickAngle = 90 * Math.floor((this._stickAngle + 45) / 90);
        }
        directionInDeg = this._stickAngle + this._movementAngleOffset;
        directionInRad = (directionInDeg * Math.PI) / 180;
        targetedSpeed = this._maxSpeed * this._stickForce;

        this._wasStickUsed = true;
      } else if (this._yVelocity !== 0 || this._xVelocity !== 0) {
        isMoving = true;
        directionInRad = Math.atan2(this._yVelocity, this._xVelocity);
        directionInDeg = (directionInRad * 180.0) / Math.PI;
      }
      if (isMoving) {
        // This makes the trigo resilient to rounding errors on directionInRad.
        cos = Math.cos(directionInRad);
        sin = Math.sin(directionInRad);
        if (cos === -1 || cos === 1) {
          sin = 0;
        }
        if (sin === -1 || sin === 1) {
          cos = 0;
        }
        const targetedSpeedX = targetedSpeed * cos;
        const targetedSpeedY = targetedSpeed * sin;

        const getAcceleratedSpeed = this._useLegacyTurnBack
          ? TopDownMovementRuntimeBehavior.getLegacyAcceleratedSpeed
          : TopDownMovementRuntimeBehavior.getAcceleratedSpeed;

        if (this._movementMode === MovementMode.SmoothTurn) {
          this._xVelocity = getAcceleratedSpeed(
            this._xVelocity,
            targetedSpeedX,
            this._maxSpeed,
            this._acceleration,
            this._deceleration,
            timeDelta
          );
          this._yVelocity = getAcceleratedSpeed(
            this._yVelocity,
            targetedSpeedY,
            this._maxSpeed,
            this._acceleration,
            this._deceleration,
            timeDelta
          );
        } else {
          let currentSpeed = Math.hypot(this._xVelocity, this._yVelocity);
          if (this._movementMode === MovementMode.SharpTurnWithSmoothTurnBack) {
            const dotProduct = this._xVelocity * cos + this._yVelocity * sin;
            if (dotProduct < 0) {
              // The object is turning back.
              // Keep the negative velocity projected on the new direction.
              currentSpeed = dotProduct;
            }
          }
          const speed = getAcceleratedSpeed(
            currentSpeed,
            targetedSpeed,
            this._maxSpeed,
            this._acceleration,
            this._deceleration,
            timeDelta
          );
          this._xVelocity = speed * cos;
          this._yVelocity = speed * sin;
        }
      }

      const squaredSpeed =
        this._xVelocity * this._xVelocity + this._yVelocity * this._yVelocity;
      if (squaredSpeed > this._maxSpeed * this._maxSpeed) {
        const ratio = this._maxSpeed / Math.sqrt(squaredSpeed);
        this._xVelocity *= ratio;
        this._yVelocity *= ratio;
      }

      // No acceleration for angular speed for now.
      this._angularSpeed = this._angularMaxSpeed;

      for (const topDownMovementHook of this._topDownMovementHooks) {
        topDownMovementHook.beforePositionUpdate(hookContext);
      }

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

      this._wasLeftKeyPressed = this._leftKey;
      this._wasRightKeyPressed = this._rightKey;
      this._wasUpKeyPressed = this._upKey;
      this._wasDownKeyPressed = this._downKey;
      if (!this._dontClearInputsBetweenFrames) {
        this._leftKey = false;
        this._rightKey = false;
        this._upKey = false;
        this._downKey = false;
        this._stickForce = 0;
      }
    }

    private static getAcceleratedSpeed(
      currentSpeed: float,
      targetedSpeed: float,
      speedMax: float,
      acceleration: float,
      deceleration: float,
      timeDelta: float
    ): float {
      let newSpeed = currentSpeed;
      const turningBackAcceleration = Math.max(acceleration, deceleration);
      if (targetedSpeed < 0) {
        if (currentSpeed <= targetedSpeed) {
          // Reduce the speed to match the stick force.
          newSpeed = Math.min(
            targetedSpeed,
            currentSpeed + turningBackAcceleration * timeDelta
          );
        } else if (currentSpeed <= 0) {
          // Accelerate
          newSpeed -= Math.max(-speedMax, acceleration * timeDelta);
        } else {
          // Turn back at least as fast as it would stop.
          newSpeed = Math.max(
            targetedSpeed,
            currentSpeed - turningBackAcceleration * timeDelta
          );
        }
      } else if (targetedSpeed > 0) {
        if (currentSpeed >= targetedSpeed) {
          // Reduce the speed to match the stick force.
          newSpeed = Math.max(
            targetedSpeed,
            currentSpeed - turningBackAcceleration * timeDelta
          );
        } else if (currentSpeed >= 0) {
          // Accelerate
          newSpeed = Math.min(
            speedMax,
            currentSpeed + acceleration * timeDelta
          );
        } else {
          // Turn back at least as fast as it would stop.
          newSpeed = Math.min(
            targetedSpeed,
            currentSpeed + turningBackAcceleration * timeDelta
          );
        }
      } else {
        // Decelerate and stop.
        if (currentSpeed < 0) {
          newSpeed = Math.min(currentSpeed + deceleration * timeDelta, 0);
        }
        if (currentSpeed > 0) {
          newSpeed = Math.max(currentSpeed - deceleration * timeDelta, 0);
        }
      }
      return newSpeed;
    }

    private static getLegacyAcceleratedSpeed(
      currentSpeed: float,
      targetedSpeed: float,
      speedMax: float,
      acceleration: float,
      deceleration: float,
      timeDelta: float
    ): float {
      let newSpeed = currentSpeed;
      if (targetedSpeed < 0) {
        if (currentSpeed <= targetedSpeed) {
          // Reduce the speed to match the stick force.
          newSpeed = Math.min(
            targetedSpeed,
            currentSpeed + deceleration * timeDelta
          );
        } else if (currentSpeed <= 0) {
          // Accelerate
          newSpeed -= Math.max(-speedMax, acceleration * timeDelta);
        } else {
          newSpeed = Math.max(
            targetedSpeed,
            currentSpeed - deceleration * timeDelta
          );
        }
      } else if (targetedSpeed > 0) {
        if (currentSpeed >= targetedSpeed) {
          // Reduce the speed to match the stick force.
          newSpeed = Math.max(
            targetedSpeed,
            currentSpeed - deceleration * timeDelta
          );
        } else if (currentSpeed >= 0) {
          // Accelerate
          newSpeed = Math.min(
            speedMax,
            currentSpeed + acceleration * timeDelta
          );
        } else {
          newSpeed = Math.min(
            targetedSpeed,
            currentSpeed + deceleration * timeDelta
          );
        }
      } else {
        // Decelerate and stop.
        if (currentSpeed < 0) {
          newSpeed = Math.min(currentSpeed + deceleration * timeDelta, 0);
        }
        if (currentSpeed > 0) {
          newSpeed = Math.max(currentSpeed - deceleration * timeDelta, 0);
        }
      }
      return newSpeed;
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

    shouldIgnoreDefaultControls() {
      return (
        this._ignoreDefaultControls ||
        this._ignoreDefaultControlsAsSyncedByNetwork
      );
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

    /**
     * A hook must typically be registered by a behavior that requires this one
     * in its onCreate function.
     * The hook must stay forever to avoid side effects like a hooks order
     * change. To handle deactivated behavior, the hook can check that its
     * behavior is activated before doing anything.
     */
    registerHook(
      hook: gdjs.TopDownMovementRuntimeBehavior.TopDownMovementHook
    ) {
      this._topDownMovementHooks.push(hook);
    }
  }

  export namespace TopDownMovementRuntimeBehavior {
    export class TopDownMovementHookContext {
      private direction: integer = -1;

      /**
       * @returns The movement direction from 0 for left to 7 for up-left and
       * -1 for no direction.
       */
      getDirection(): integer {
        return this.direction;
      }

      /**
       * This method won't change the direction used by the top-down movement
       * behavior.
       */
      _setDirection(direction: integer): void {
        this.direction = direction;
      }
    }

    // This should be a static attribute but it's not possible because of
    // declaration order.
    export const _topDownMovementHookContext =
      new gdjs.TopDownMovementRuntimeBehavior.TopDownMovementHookContext();

    /**
     * Allow extensions relying on the top-down movement to customize its
     * behavior a bit.
     */
    export interface TopDownMovementHook {
      /**
       * Return the direction to use instead of the direction given in
       * parameter.
       */
      overrideDirection(hookContext: TopDownMovementHookContext): integer;
      /**
       * Called before the acceleration and new direction is applied to the
       * velocity.
       */
      beforeSpeedUpdate(hookContext: TopDownMovementHookContext): void;
      /**
       * Called before the velocity is applied to the object position and
       * angle.
       */
      beforePositionUpdate(hookContext: TopDownMovementHookContext): void;
    }

    export interface BasisTransformation {
      toScreen(worldPoint: FloatPoint, screenPoint: FloatPoint): void;
    }

    export class IsometryTransformation
      implements gdjs.TopDownMovementRuntimeBehavior.BasisTransformation
    {
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
