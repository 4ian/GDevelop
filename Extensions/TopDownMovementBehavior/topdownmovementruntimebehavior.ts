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
    // Behavior configuration:
    private _allowDiagonals: boolean;
    private _acceleration: float;
    private _deceleration: float;
    private _maxSpeed: float;
    private _angularMaxSpeed: float;
    private _rotateObject: boolean;
    private _angleOffset: float;
    private _ignoreDefaultControls: boolean;
    private _movementAngleOffset: float;
    private _isAssistanceEnable: boolean;

    /** The latest angle of movement, in degrees. */
    private _angle: float = 0;

    // Attributes used when moving
    _transformedPosition: FloatPoint = [0, 0];
    _xVelocity: float = 0;
    _yVelocity: float = 0;
    private _angularSpeed: float = 0;

    // Inputs
    private _leftKey: boolean = false;
    private _rightKey: boolean = false;
    private _upKey: boolean = false;
    private _downKey: boolean = false;
    private _leftKeyPressedDuration: integer = -1;
    private _rightKeyPressedDuration: integer = -1;
    private _upKeyPressedDuration: integer = -1;
    private _downKeyPressedDuration: integer = -1;
    private _stickAngle: float = 0;
    private _stickForce: float = 0;

    // @ts-ignore The setter "setViewpoint" is not detected as an affectation.
    _basisTransformation: BasisTransformation;
    _temporaryPointForTransformations: FloatPoint = [0, 0];
    private _assistance: Assistance;

    constructor(
      runtimeScene: gdjs.RuntimeScene,
      behaviorData,
      owner: gdjs.RuntimeObject
    ) {
      super(runtimeScene, behaviorData, owner);
      this._allowDiagonals = behaviorData.allowDiagonals;
      this._acceleration = behaviorData.acceleration;
      this._deceleration = behaviorData.deceleration;
      this._maxSpeed = behaviorData.maxSpeed;
      this._angularMaxSpeed = behaviorData.angularMaxSpeed;
      this._rotateObject = behaviorData.rotateObject;
      this._angleOffset = behaviorData.angleOffset;
      this._ignoreDefaultControls = behaviorData.ignoreDefaultControls;
      this._isAssistanceEnable = behaviorData.enableAssistance || false;
      this._assistance = new Assistance(this, runtimeScene);
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
      if (
        oldBehaviorData.enableAssistance !== newBehaviorData.enableAssistance
      ) {
        this._isAssistanceEnable = newBehaviorData.enableAssistance;
      }
      return true;
    }

    setViewpoint(viewpoint: string, customIsometryAngle: float): void {
      if (viewpoint === 'PixelIsometry') {
        this._basisTransformation = new IsometryTransformation(Math.atan(0.5));
      } else if (viewpoint === 'TrueIsometry') {
        this._basisTransformation = new IsometryTransformation(Math.PI / 6);
      } else if (viewpoint === 'CustomIsometry') {
        this._basisTransformation = new IsometryTransformation(
          (customIsometryAngle * Math.PI) / 180
        );
      } else {
        this._basisTransformation = new IdentityTransformation();
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

    setMovementAngleOffset(movementAngleOffset: float): void {
      this._movementAngleOffset = movementAngleOffset;
    }

    getMovementAngleOffset() {
      return this._movementAngleOffset;
    }

    enableAssistance(enableAssistance: boolean) {
      this._isAssistanceEnable = enableAssistance;
    }

    isAssistanceEnable() {
      return this._isAssistanceEnable;
    }

    doStepPreEvents(runtimeScene: gdjs.RuntimeScene) {
      const object = this.owner;

      const LEFTKEY = 37;
      const UPKEY = 38;
      const RIGHTKEY = 39;
      const DOWNKEY = 40;

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
      if (!this._allowDiagonals) {
        const elapsedTime = this.owner.getElapsedTime(runtimeScene);

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

      if (this._isAssistanceEnable) {
        // Check if the object has moved
        // To avoid to loop on the transform and its inverse
        // because of float approximation.
        const position = this._temporaryPointForTransformations;
        this._basisTransformation.toScreen(this._transformedPosition, position);
        if (object.getX() !== position[0] || object.getY() !== position[1]) {
          position[0] = object.getX();
          position[1] = object.getY();
          this._basisTransformation.toWorld(
            position,
            this._transformedPosition
          );
        }

        const stickIsUsed = this._stickForce !== 0 && direction === -1;
        let inputDirection: float;
        if (stickIsUsed) {
          inputDirection = this._getStickDirection();
        } else {
          inputDirection = direction;
        }
        const assistanceDirection: integer = this._assistance.suggestDirection(
          runtimeScene,
          inputDirection
        );
        if (assistanceDirection !== -1) {
          if (stickIsUsed) {
            this._stickAngle = assistanceDirection * 45;
          } else {
            direction = assistanceDirection;
          }
        }
      }

      const timeDelta = this.owner.getElapsedTime(runtimeScene) / 1000;
      let directionInRad = 0;
      let directionInDeg = 0;
      //Update the speed of the object
      if (direction !== -1) {
        directionInRad =
          ((direction + this._movementAngleOffset / 45) * Math.PI) / 4.0;
        directionInDeg = direction * 45 + this._movementAngleOffset;
        this._xVelocity +=
          this._acceleration * timeDelta * Math.cos(directionInRad);
        this._yVelocity +=
          this._acceleration * timeDelta * Math.sin(directionInRad);
      } else if (this._stickForce !== 0) {
        if (!this._allowDiagonals) {
          this._stickAngle = 90 * Math.floor((this._stickAngle + 45) / 90);
        }
        directionInDeg = this._stickAngle + this._movementAngleOffset;
        directionInRad = (directionInDeg * Math.PI) / 180;
        const norm = this._acceleration * timeDelta * this._stickForce;
        this._xVelocity += norm * Math.cos(directionInRad);
        this._yVelocity += norm * Math.sin(directionInRad);

        this._stickForce = 0;
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
      if (this._isAssistanceEnable) {
        this._assistance.shift(
          this._xVelocity * timeDelta,
          this._yVelocity * timeDelta
        );
      } else {
        if (this._basisTransformation === null) {
          // Top-down viewpoint
          object.setX(object.getX() + this._xVelocity * timeDelta);
          object.setY(object.getY() + this._yVelocity * timeDelta);
        } else {
          // Isometry viewpoint
          const point = this._temporaryPointForTransformations;
          point[0] = this._xVelocity * timeDelta;
          point[1] = this._yVelocity * timeDelta;
          this._basisTransformation.toScreen(point, point);
          object.setX(object.getX() + point[0]);
          object.setY(object.getY() + point[1]);
        }
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

      if (this._isAssistanceEnable) {
        this._assistance.applyCollision(runtimeScene);

        const position = this._temporaryPointForTransformations;
        this._basisTransformation.toScreen(this._transformedPosition, position);
        object.setX(position[0]);
        object.setY(position[1]);
      }

      this._leftKey = false;
      this._rightKey = false;
      this._upKey = false;
      this._downKey = false;
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

    _getStickDirection() {
      let direction = (this._stickAngle + this._movementAngleOffset) / 45;
      direction = direction - Math.floor(direction / 8) * 8;
      for (let strait = 0; strait < 8; strait += 2) {
        if (strait - 0.125 < direction && direction < strait + 0.125) {
          direction = strait;
        }
        if (strait + 0.125 <= direction && direction <= strait + 2 - 0.125) {
          direction = strait + 1;
        }
      }
      if (8 - 0.125 < direction) {
        direction = 0;
      }
      return direction;
    }
  }

  interface BasisTransformation {
    toScreen(worldPoint: FloatPoint, screenPoint: FloatPoint): void;

    toWorld(screenPoint: FloatPoint, worldPoint: FloatPoint): void;

    toScreen(worldPoint: FloatPoint): void;

    toWorld(screenPoint: FloatPoint): void;
  }

  class IdentityTransformation implements BasisTransformation {
    toScreen(worldPoint: FloatPoint, screenPoint?: FloatPoint): void {
      if (screenPoint) {
        screenPoint[0] = worldPoint[0];
        screenPoint[1] = worldPoint[1];
      }
    }

    toWorld(screenPoint: FloatPoint, worldPoint?: FloatPoint): void {
      if (worldPoint) {
        worldPoint[0] = screenPoint[0];
        worldPoint[1] = screenPoint[1];
      }
    }
  }

  class IsometryTransformation implements BasisTransformation {
    _screen: float[][];
    _world: float[][];

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
      // invert
      this._world = [
        [cosB, sinB / sinA],
        [-sinB, cosB / sinA],
      ];
    }

    toScreen(worldPoint: FloatPoint, screenPoint?: FloatPoint): void {
      if (!screenPoint) {
        screenPoint = worldPoint;
      }
      const x =
        this._screen[0][0] * worldPoint[0] + this._screen[0][1] * worldPoint[1];
      const y =
        this._screen[1][0] * worldPoint[0] + this._screen[1][1] * worldPoint[1];
      screenPoint[0] = x;
      screenPoint[1] = y;
    }

    toWorld(screenPoint: FloatPoint, worldPoint?: FloatPoint): void {
      if (!worldPoint) {
        worldPoint = screenPoint;
      }
      const x =
        this._world[0][0] * screenPoint[0] + this._world[0][1] * screenPoint[1];
      const y =
        this._world[1][0] * screenPoint[0] + this._world[1][1] * screenPoint[1];
      worldPoint[0] = x;
      worldPoint[1] = y;
    }
  }

  /** Corner sliding on TopDownObstacleRuntimeBehavior instances.
   *
   * To change of direction the player must be perfectly aligned.
   * It's a very frustrating thing to do so he must be helped.
   * The pressed key gives the player intent. If he presses left,
   * he want to go that way, but he needs to be aligned to do so,
   * so the assistance makes him move up or down in the 1st place.
   */
  class Assistance {
    static epsilon: float = 0.015625;
    private _behavior: gdjs.TopDownMovementRuntimeBehavior;

    // Obstacles near the object, updated with _updatePotentialCollidingObjects.
    private _potentialCollidingObjects: gdjs.TopDownObstacleRuntimeBehavior[];
    private _manager: gdjs.TopDownObstaclesManager;

    // Remember the decision to bypass an obstacle...
    private _lastAnyObstacle: boolean = false;
    private _needToCheckBypassWay: boolean = true;

    // ...and the context of that decision
    private _lastAssistanceDirection: integer = -1;
    private _lastDirection: integer = -1;
    private _deltasX: integer[];
    private _deltasY: integer[];

    private _relativeHitBoxesAABB: gdjs.AABB = { min: [0, 0], max: [0, 0] };
    private _absoluteHitBoxesAABB: gdjs.AABB = { min: [0, 0], max: [0, 0] };
    private _hitBoxesAABBUpToDate: boolean = false;
    private _oldWidth: float = 0;
    private _oldHeight: float = 0;

    private _collidingObjects: gdjs.RuntimeObject[];

    private _result: AssistanceResult = new AssistanceResult();

    constructor(
      behavior: gdjs.TopDownMovementRuntimeBehavior,
      runtimeScene: gdjs.RuntimeScene
    ) {
      this._behavior = behavior;
      this._potentialCollidingObjects = [];
      this._potentialCollidingObjects.length = 0;
      this._collidingObjects = [];
      this._collidingObjects.length = 0;
      this._manager = gdjs.TopDownObstaclesManager.getManager(runtimeScene);
      this._deltasX = [1, 1, 0, -1, -1, -1, 0, 1];
      this._deltasY = [0, 1, 1, 1, 0, -1, -1, -1];
    }

    almostEquals(a: float, b: float) {
      return b - Assistance.epsilon < a && a < b + Assistance.epsilon;
    }

    /** Analyse the real intent of the player instead of applying the input blindly.
     * @returns a direction that matches the player intents.
     */
    suggestDirection(
      runtimeScene: gdjs.RuntimeScene,
      direction: integer
    ): integer {
      this._needToCheckBypassWay =
        this._needToCheckBypassWay || direction !== this._lastDirection;

      if (direction === -1) {
        return this.noAssistance();
      }

      const object = this._behavior.owner;
      if (
        object.getWidth() !== this._oldWidth ||
        object.getHeight() !== this._oldHeight
      ) {
        this._hitBoxesAABBUpToDate = false;
        this._oldWidth = object.getWidth();
        this._oldHeight = object.getHeight();
      }

      // Compute the list of the objects that will be used
      const timeDelta = object.getElapsedTime(runtimeScene) / 1000;
      this._updatePotentialCollidingObjects(
        1 + this._behavior.getMaxSpeed() * timeDelta
      );

      const downKey: boolean = 1 <= direction && direction <= 3;
      const leftKey: boolean = 3 <= direction && direction <= 5;
      const upKey: boolean = 5 <= direction && direction <= 7;
      const rightKey: boolean = direction <= 1 || 7 <= direction;

      // Used to align the player when the assistance make him bypass an obstacle
      let stopMinX: float = Number.MAX_VALUE;
      let stopMinY: float = Number.MAX_VALUE;
      let stopMaxX: float = -Number.MAX_VALUE;
      let stopMaxY: float = -Number.MAX_VALUE;
      let isBypassX: boolean = false;
      let isBypassY: boolean = false;

      // Incites of how the player should be assisted
      let assistanceLeft: integer = 0;
      let assistanceRight: integer = 0;
      let assistanceUp: integer = 0;
      let assistanceDown: integer = 0;

      // the actual decision
      let assistanceDirection: integer = -1;

      const objectAABB: AABB = this.getHitBoxesAABB();
      const minX: float = objectAABB.min[0];
      const minY: float = objectAABB.min[1];
      const maxX: float = objectAABB.max[0];
      const maxY: float = objectAABB.max[1];
      const width: float = maxX - minX;
      const height: float = maxY - minY;

      // This affectation has no meaning, it will be override.
      let bypassedObstacleAABB: AABB | null = null;

      this._collidingObjects.length = 0;
      this._collidingObjects.push(object);

      for (var i = 0; i < this._potentialCollidingObjects.length; ++i) {
        const obstacleBehavior = this._potentialCollidingObjects[i];
        const corner: float = obstacleBehavior.getSlidingCornerSize();
        const obstacle = obstacleBehavior.owner;
        if (obstacle === object) {
          continue;
        }

        const obstacleAABB: AABB = obstacleBehavior.getHitBoxesAABB();
        const obstacleMinX: float = obstacleAABB.min[0];
        const obstacleMinY: float = obstacleAABB.min[1];
        const obstacleMaxX: float = obstacleAABB.max[0];
        const obstacleMaxY: float = obstacleAABB.max[1];

        const deltaX: float = this._deltasX[direction];
        const deltaY: float = this._deltasY[direction];
        // Extends the box in the player direction
        if (
          Math.max(maxX, Math.floor(maxX + deltaX)) > obstacleMinX &&
          Math.min(minX, Math.ceil(minX + deltaX)) < obstacleMaxX &&
          Math.max(maxY, Math.floor(maxY + deltaY)) > obstacleMinY &&
          Math.min(minY, Math.ceil(minY + deltaY)) < obstacleMaxY
        ) {
          this._collidingObjects.push(obstacle);

          // The player is corner to corner to the obstacle.
          // The assistance will depend on other obstacles.
          // Both direction are set and the actual to take
          // is decided at the end.
          if (
            this.almostEquals(maxX, obstacleMinX) &&
            this.almostEquals(maxY, obstacleMinY)
          ) {
            assistanceRight++;
            assistanceDown++;
          } else if (
            this.almostEquals(maxX, obstacleMinX) &&
            this.almostEquals(minY, obstacleMaxY)
          ) {
            assistanceRight++;
            assistanceUp++;
          } else if (
            this.almostEquals(minX, obstacleMaxX) &&
            this.almostEquals(minY, obstacleMaxY)
          ) {
            assistanceLeft++;
            assistanceUp++;
          } else if (
            this.almostEquals(minX, obstacleMaxX) &&
            this.almostEquals(maxY, obstacleMinY)
          ) {
            assistanceLeft++;
            assistanceDown++;
          } else if (
            (upKey && this.almostEquals(minY, obstacleMaxY)) ||
            (downKey && this.almostEquals(maxY, obstacleMinY))
          ) {
            // The player is not on the corner of the obstacle.
            // Set the assistance both ways to fall back in
            // the same case as 2 obstacles side by side
            // being collide with the player.
            if (
              (rightKey || maxX > obstacleMinX + corner) &&
              minX < obstacleMaxX &&
              (leftKey || minX < obstacleMaxX - corner) &&
              maxX > obstacleMinX
            ) {
              assistanceLeft++;
              assistanceRight++;
            }
            // The player is on the corner of the obstacle.
            // (not the exact corner, see corner affectation)
            else if (
              !rightKey &&
              obstacleMinX < maxX &&
              maxX <= obstacleMinX + corner &&
              // In case the cornerSize is bigger than the obstacle size,
              // go the on the shortest side.
              (leftKey || minX + maxX <= obstacleMinX + obstacleMaxX)
            ) {
              assistanceLeft++;
              isBypassX = true;
              if (obstacleMinX - width < stopMinX) {
                stopMinX = obstacleMinX - width;
                bypassedObstacleAABB = obstacleAABB;
              }
            } else if (
              !leftKey &&
              obstacleMaxX - corner <= minX &&
              minX < obstacleMaxX &&
              (rightKey || minX + maxX > obstacleMinX + obstacleMaxX)
            ) {
              assistanceRight++;
              isBypassX = true;
              if (obstacleMaxX > stopMaxX) {
                stopMaxX = obstacleMaxX;
                bypassedObstacleAABB = obstacleAABB;
              }
            }
          } else if (
            (leftKey && this.almostEquals(minX, obstacleMaxX)) ||
            (rightKey && this.almostEquals(maxX, obstacleMinX))
          ) {
            // The player is not on the corner of the obstacle.
            // Set the assistance both ways to fall back in
            // the same case as 2 obstacles side by side
            // being collide with the player.
            if (
              (downKey || maxY > obstacleMinY + corner) &&
              minY < obstacleMaxY &&
              (upKey || minY < obstacleMaxY - corner) &&
              maxY > obstacleMinY
            ) {
              assistanceUp++;
              assistanceDown++;
            }
            // The player is on the corner of the obstacle.
            // (not the exact corner, see corner affectation)
            else if (
              !downKey &&
              obstacleMinY < maxY &&
              maxY <= obstacleMinY + corner &&
              (upKey || minY + maxY <= obstacleMinY + obstacleMaxY)
            ) {
              assistanceUp++;
              isBypassY = true;
              if (obstacleMinY - height < stopMinY) {
                stopMinY = obstacleMinY - height;
                bypassedObstacleAABB = obstacleAABB;
              }
            } else if (
              !upKey &&
              obstacleMaxY - corner <= minY &&
              minY < obstacleMaxY &&
              (downKey || minY + maxY > obstacleMinY + obstacleMaxY)
            ) {
              assistanceDown++;
              isBypassY = true;
              if (obstacleMaxY > stopMaxY) {
                stopMaxY = obstacleMaxY;
                bypassedObstacleAABB = obstacleAABB;
              }
            }
          }
        }
      }

      // This may happen when the player is in the corner of 2 perpendicular walls.
      // No assistance is needed.
      if (assistanceLeft && assistanceRight && assistanceUp && assistanceDown) {
        return this.noAssistance();
      }
      // This may happen when the player goes in diagonal against a wall.
      // Make him follow the wall. This allows player to keep full speed.
      //
      // When he collided a square from the wall corner to corner,
      // a 3rd assistance may be true but it fall back in the same case.
      else if (assistanceLeft && assistanceRight) {
        isBypassX = false;
        if (leftKey && !rightKey) {
          assistanceDirection = 4;
        } else if (rightKey && !leftKey) {
          assistanceDirection = 0;
        } else {
          // Contradictory decisions are dismissed.
          //
          // This can happen, for instance, with a wall composed of squares.
          // Taken separately from one to another, a square could be bypass one the right
          // and the next one on the left even though they are side by side
          // and the player can't actually go between them.
          return this.noAssistance();
        }
      } else if (assistanceUp && assistanceDown) {
        isBypassY = false;
        if (upKey && !downKey) {
          assistanceDirection = 6;
        } else if (downKey && !upKey) {
          assistanceDirection = 2;
        } else {
          // see previous comment
          return this.noAssistance();
        }
      }
      // The player goes in diagonal and is corner to corner with the obstacle.
      // (but not against a wall, this time)
      // The velocity is used to decide.
      // This may only happen after an alignment.
      // (see "Alignment:" comment)
      else if (assistanceRight && assistanceDown) {
        if (
          (downKey && !rightKey) ||
          (downKey === rightKey && assistanceDown > assistanceRight) ||
          (assistanceDown === assistanceRight &&
            this._behavior._yVelocity > 0 &&
            Math.abs(this._behavior._xVelocity) <
              Math.abs(this._behavior._yVelocity))
        ) {
          assistanceDirection = 2;
        } else {
          assistanceDirection = 0;
        }
      } else if (assistanceLeft && assistanceDown) {
        if (
          (downKey && !leftKey) ||
          (downKey === leftKey && assistanceDown > assistanceLeft) ||
          (assistanceDown === assistanceLeft &&
            this._behavior._yVelocity > 0 &&
            Math.abs(this._behavior._xVelocity) <
              Math.abs(this._behavior._yVelocity))
        ) {
          assistanceDirection = 2;
        } else {
          assistanceDirection = 4;
        }
      } else if (assistanceLeft && assistanceUp) {
        if (
          (upKey && !leftKey) ||
          (upKey === leftKey && assistanceUp > assistanceLeft) ||
          (assistanceUp === assistanceLeft &&
            this._behavior._yVelocity < 0 &&
            Math.abs(this._behavior._xVelocity) <
              Math.abs(this._behavior._yVelocity))
        ) {
          assistanceDirection = 6;
        } else {
          assistanceDirection = 4;
        }
      } else if (assistanceRight && assistanceUp) {
        if (
          (upKey && !rightKey) ||
          (upKey === rightKey && assistanceUp > assistanceRight) ||
          (assistanceUp === assistanceRight &&
            this._behavior._yVelocity < 0 &&
            Math.abs(this._behavior._xVelocity) <
              Math.abs(this._behavior._yVelocity))
        ) {
          assistanceDirection = 6;
        } else {
          assistanceDirection = 0;
        }
      } else {
        // Slide on the corner of an obstacle to bypass it.
        // Every tricky cases are already handled .
        if (assistanceLeft) {
          assistanceDirection = 4;
        } else if (assistanceRight) {
          assistanceDirection = 0;
        } else if (assistanceUp) {
          assistanceDirection = 6;
        } else if (assistanceDown) {
          assistanceDirection = 2;
        } else {
          return this.noAssistance();
        }
      }

      // Check if there is any obstacle in the way.
      //
      // There must be no obstacle to go at least
      // as far in the direction the player chose
      // as the assistance must take to align the player.
      //
      // Because, if the assistance moves the player by 32 pixels
      // before been able to go in the right direction
      // and can only move by 4 pixels afterward
      // that it'll sound silly.
      this._needToCheckBypassWay =
        this._needToCheckBypassWay ||
        assistanceDirection !== this._lastAssistanceDirection;
      if ((isBypassX || isBypassY) && !this._needToCheckBypassWay) {
        // Don't check again if the player intent stays the same.
        //
        // Do it, for instance, if an obstacle has moved out of the way
        // and the player releases and presses agin the key.
        // Because, doing it automatically would seems weird.
        if (this._lastAnyObstacle) {
          return this.noAssistance();
        }
      } else if (isBypassX || isBypassY) {
        this._lastAssistanceDirection = assistanceDirection;
        this._lastDirection = direction;

        let anyObstacle: boolean = false;
        // reflection symmetry: y = x
        // 0 to 6, 2 to 4, 4 to 2, 6 to 0
        if (direction + assistanceDirection === 6) {
          // Because the obstacle may not be a square.
          let cornerX: float;
          let cornerY: float;
          if (assistanceDirection === 4 || assistanceDirection === 6) {
            cornerX = bypassedObstacleAABB!.min[0];
            cornerY = bypassedObstacleAABB!.min[1];
          } else {
            cornerX = bypassedObstacleAABB!.max[0];
            cornerY = bypassedObstacleAABB!.max[1];
          }
          // / cornerX \   / 0  1 \   / x - cornerX \
          // \ cornerY / + \ 1  0 / * \ y - cornerY /
          //
          // min and max are preserved by the symmetry.
          // The symmetry image is extended to check there is no obstacle before going into the passage.
          const epsilon: float = Assistance.epsilon;
          const searchMinX: float =
            cornerX +
            minY -
            cornerY +
            epsilon +
            (assistanceDirection === 6 ? cornerY - maxY : 0);
          const searchMaxX: float =
            cornerX +
            maxY -
            cornerY -
            epsilon +
            (assistanceDirection === 2 ? cornerY - minY : 0);
          const searchMinY: float =
            cornerY +
            minX -
            cornerX +
            epsilon +
            (assistanceDirection === 4 ? cornerX - maxX : 0);
          const searchMaxY: float =
            cornerY +
            maxX -
            cornerX -
            epsilon +
            (assistanceDirection === 0 ? cornerX - minX : 0);

          anyObstacle = this._manager.anyObstacle(
            searchMinX,
            searchMaxX,
            searchMinY,
            searchMaxY,
            this._collidingObjects
          );
        }
        // reflection symmetry: y = -x
        // 0 to 2, 2 to 0, 4 to 6, 6 to 4
        else if ((direction + assistanceDirection) % 8 === 2) {
          // Because the obstacle may not be a square.
          let cornerX: float;
          let cornerY: float;
          if (assistanceDirection === 2 || assistanceDirection === 4) {
            cornerX = bypassedObstacleAABB!.min[0];
            cornerY = bypassedObstacleAABB!.max[1];
          } else {
            cornerX = bypassedObstacleAABB!.max[0];
            cornerY = bypassedObstacleAABB!.min[1];
          }
          // / cornerX \   /  0  -1 \   / x - cornerX \
          // \ cornerY / + \ -1   0 / * \ y - cornerY /
          //
          // min and max are switched by the symmetry.
          // The symmetry image is extended to check there is no obstacle before going into the passage.
          const epsilon: float = Assistance.epsilon;
          const searchMinX: float =
            cornerX -
            (maxY - cornerY) +
            epsilon +
            (assistanceDirection === 2 ? minY - cornerY : 0);
          const searchMaxX: float =
            cornerX -
            (minY - cornerY) -
            epsilon +
            (assistanceDirection === 6 ? maxY - cornerY : 0);
          const searchMinY: float =
            cornerY -
            (maxX - cornerX) +
            epsilon +
            (assistanceDirection === 0 ? minX - cornerX : 0);
          const searchMaxY: float =
            cornerY -
            (minX - cornerX) -
            epsilon +
            (assistanceDirection === 4 ? maxX - cornerX : 0);

          anyObstacle = this._manager.anyObstacle(
            searchMinX,
            searchMaxX,
            searchMinY,
            searchMaxY,
            this._collidingObjects
          );
        }
        this._lastAnyObstacle = anyObstacle;
        this._needToCheckBypassWay = false;

        if (anyObstacle) {
          return this.noAssistance();
        }
      }

      this._result._inputDirection = direction;
      this._result._assistanceLeft = assistanceLeft > 0;
      this._result._assistanceRight = assistanceRight > 0;
      this._result._assistanceUp = assistanceUp > 0;
      this._result._assistanceDown = assistanceDown > 0;
      this._result._isBypassX = isBypassX;
      this._result._isBypassY = isBypassY;
      this._result._stopMinX = stopMinX;
      this._result._stopMinY = stopMinY;
      this._result._stopMaxX = stopMaxX;
      this._result._stopMaxY = stopMaxY;

      return assistanceDirection;
    }

    noAssistance(): integer {
      this._result._isBypassX = false;
      this._result._isBypassY = false;

      return -1;
    }

    applyCollision(runtimeScene: gdjs.RuntimeScene) {
      this._checkCornerStop();
      this._separateFromObstacles();
      // check again because the object can be pushed on the stop limit,
      // it won't be detected on the next frame and the alignment won't be applied.
      this._checkCornerStop();
    }

    /**
     * Check if the object must take a corner.
     *
     * When the object reach the limit of an obstacle
     * and it should take the corner according to the player intent,
     * it is aligned right on this limit and the velocity is set in the right direction.
     *
     * This avoid issues with the inertia. For instance,
     * when the object could go between 2 obstacles,
     * with it will just fly over the hole because of its inertia.
     */
    _checkCornerStop() {
      const objectAABB: gdjs.AABB = this.getHitBoxesAABB();
      const minX: float = objectAABB.min[0];
      const minY: float = objectAABB.min[1];
      const object = this._behavior.owner;

      const direction = this._result._inputDirection;
      const leftKey: boolean = 3 <= direction && direction <= 5;
      const upKey: boolean = 5 <= direction && direction <= 7;

      // Alignment: avoid to go too far and kind of drift or oscillate in front of a hole.
      if (
        this._result._isBypassX &&
        ((this._result._assistanceLeft && minX <= this._result._stopMinX) ||
          (this._result._assistanceRight && minX >= this._result._stopMaxX))
      ) {
        this.shift(
          -minX +
            (this._result._assistanceLeft
              ? this._result._stopMinX
              : this._result._stopMaxX),
          0
        );
        this._behavior._yVelocity =
          (upKey ? -1 : 1) *
          Math.sqrt(
            this._behavior._xVelocity * this._behavior._xVelocity +
              this._behavior._yVelocity * this._behavior._yVelocity
          );
        this._behavior._xVelocity = 0;
      }
      if (
        this._result._isBypassY &&
        ((this._result._assistanceUp && minY <= this._result._stopMinY) ||
          (this._result._assistanceDown && minY >= this._result._stopMaxY))
      ) {
        this.shift(
          0,
          -minY +
            (this._result._assistanceUp
              ? this._result._stopMinY
              : this._result._stopMaxY)
        );
        this._behavior._xVelocity =
          (leftKey ? -1 : 1) *
          Math.sqrt(
            this._behavior._xVelocity * this._behavior._xVelocity +
              this._behavior._yVelocity * this._behavior._yVelocity
          );
        this._behavior._yVelocity = 0;
      }
    }

    /**
     * Separate from TopDownObstacleRuntimeBehavior instances.
     */
    _separateFromObstacles() {
      const object = this._behavior.owner;
      const objectAABB: gdjs.AABB = this.getHitBoxesAABB();
      const minX: float = objectAABB.min[0];
      const minY: float = objectAABB.min[1];
      const maxX: float = objectAABB.max[0];
      const maxY: float = objectAABB.max[1];

      // Search the obstacle with the biggest intersection
      // to separate from this one first.
      // Because smaller collisions may shift the player
      // in the wrong direction.
      let maxSurface: float = 0;
      let bestObstacleBehavior: TopDownObstacleRuntimeBehavior | null = null;
      for (var i = 0; i < this._potentialCollidingObjects.length; ++i) {
        const obstacleBehavior = this._potentialCollidingObjects[i];
        if (obstacleBehavior.owner === object) {
          continue;
        }

        const obstacleAABB: gdjs.AABB = obstacleBehavior.getHitBoxesAABB();
        const obstacleMinX: float = obstacleAABB.min[0];
        const obstacleMinY: float = obstacleAABB.min[1];
        const obstacleMaxX: float = obstacleAABB.max[0];
        const obstacleMaxY: float = obstacleAABB.max[1];

        const interMinX: float = Math.max(minX, obstacleMinX);
        const interMinY: float = Math.max(minY, obstacleMinY);
        const interMaxX: float = Math.min(maxX, obstacleMaxX);
        const interMaxY: float = Math.min(maxY, obstacleMaxY);

        if (interMinX < interMaxX && interMinY < interMaxY) {
          const surface = (interMaxX - interMinX) * (interMaxY - interMinY);
          if (surface > maxSurface) {
            maxSurface = surface;
            bestObstacleBehavior = obstacleBehavior;
          }
        }
      }
      if (bestObstacleBehavior !== null) {
        this.separateFrom(bestObstacleBehavior);
      }
      for (var i = 0; i < this._potentialCollidingObjects.length; ++i) {
        const obstacleBehavior = this._potentialCollidingObjects[i];
        const obstacle = obstacleBehavior.owner;
        if (obstacle === object) {
          continue;
        }
        this.separateFrom(obstacleBehavior);
      }
    }

    /**
     * Separate object and obstacle, only object move.
     * @param obstacle
     */
    separateFrom(obstacleBehavior: gdjs.TopDownObstacleRuntimeBehavior) {
      const objectAABB: gdjs.AABB = this.getHitBoxesAABB();
      const minX: float = objectAABB.min[0];
      const minY: float = objectAABB.min[1];
      const maxX: float = objectAABB.max[0];
      const maxY: float = objectAABB.max[1];

      const obstacleAABB: AABB = obstacleBehavior.getHitBoxesAABB();
      const obstacleMinX: float = obstacleAABB.min[0];
      const obstacleMinY: float = obstacleAABB.min[1];
      const obstacleMaxX: float = obstacleAABB.max[0];
      const obstacleMaxY: float = obstacleAABB.max[1];

      const leftDistance: float = maxX - obstacleMinX;
      const upDistance: float = maxY - obstacleMinY;
      const rightDistance: float = obstacleMaxX - minX;
      const downDistance: float = obstacleMaxY - minY;
      const minDistance: float = Math.min(
        leftDistance,
        upDistance,
        rightDistance,
        downDistance
      );

      if (minDistance > 0) {
        if (leftDistance === minDistance) {
          this.shift(-maxX + obstacleMinX, 0);
        } else if (rightDistance === minDistance) {
          this.shift(-minX + obstacleMaxX, 0);
        } else if (upDistance === minDistance) {
          this.shift(0, -maxY + obstacleMinY);
        } else if (downDistance === minDistance) {
          this.shift(0, -minY + obstacleMaxY);
        }
      }
    }

    shift(deltaX: float, deltaY: float) {
      this._behavior._transformedPosition[0] += deltaX;
      this._behavior._transformedPosition[1] += deltaY;
    }

    getHitBoxesAABB(): gdjs.AABB {
      if (!this._hitBoxesAABBUpToDate) {
        const hitBoxes: Polygon[] = this._behavior.owner.getHitBoxes();

        let minX: float = Number.MAX_VALUE;
        let minY: float = Number.MAX_VALUE;
        let maxX: float = -Number.MAX_VALUE;
        let maxY: float = -Number.MAX_VALUE;
        for (let h = 0, lenh = hitBoxes.length; h < lenh; ++h) {
          let hitBox: Polygon = hitBoxes[h];
          for (let p = 0, lenp = hitBox.vertices.length; p < lenp; ++p) {
            const point = this._behavior._temporaryPointForTransformations;
            if (this._behavior._basisTransformation === null) {
              point[0] = hitBox.vertices[p][0];
              point[1] = hitBox.vertices[p][1];
            } else {
              this._behavior._basisTransformation.toWorld(
                hitBox.vertices[p],
                point
              );
            }
            minX = Math.min(minX, point[0]);
            maxX = Math.max(maxX, point[0]);
            minY = Math.min(minY, point[1]);
            maxY = Math.max(maxY, point[1]);
          }
        }
        this._relativeHitBoxesAABB.min[0] =
          minX - this._behavior._transformedPosition[0];
        this._relativeHitBoxesAABB.min[1] =
          minY - this._behavior._transformedPosition[1];
        this._relativeHitBoxesAABB.max[0] =
          maxX - this._behavior._transformedPosition[0];
        this._relativeHitBoxesAABB.max[1] =
          maxY - this._behavior._transformedPosition[1];

        this._hitBoxesAABBUpToDate = true;
      }
      this._absoluteHitBoxesAABB.min[0] =
        this._relativeHitBoxesAABB.min[0] +
        this._behavior._transformedPosition[0];
      this._absoluteHitBoxesAABB.min[1] =
        this._relativeHitBoxesAABB.min[1] +
        this._behavior._transformedPosition[1];
      this._absoluteHitBoxesAABB.max[0] =
        this._relativeHitBoxesAABB.max[0] +
        this._behavior._transformedPosition[0];
      this._absoluteHitBoxesAABB.max[1] =
        this._relativeHitBoxesAABB.max[1] +
        this._behavior._transformedPosition[1];
      return this._absoluteHitBoxesAABB;
    }

    /**
     * Update _potentialCollidingObjects member with platforms near the object.
     */
    private _updatePotentialCollidingObjects(maxMovementLength: float) {
      this._manager.getAllObstaclesAround(
        this.getHitBoxesAABB(),
        maxMovementLength,
        this._potentialCollidingObjects
      );
    }
  }

  /**
   * TopDownMovementRuntimeBehavior represents a behavior allowing objects to
   * follow a path computed to avoid obstacles.
   */
  class AssistanceResult {
    _inputDirection: integer = -1;
    _assistanceLeft: boolean = false;
    _assistanceRight: boolean = false;
    _assistanceUp: boolean = false;
    _assistanceDown: boolean = false;
    _isBypassX: boolean = false;
    _isBypassY: boolean = false;
    _stopMinX: float = 0;
    _stopMinY: float = 0;
    _stopMaxX: float = 0;
    _stopMaxY: float = 0;
  }
  gdjs.registerBehavior(
    'TopDownMovementBehavior::TopDownMovementBehavior',
    gdjs.TopDownMovementRuntimeBehavior
  );
}
