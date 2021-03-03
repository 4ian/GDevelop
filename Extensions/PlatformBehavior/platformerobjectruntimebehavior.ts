/*
GDevelop - Platform Behavior Extension
Copyright (c) 2013-2016 Florian Rival (Florian.Rival@gmail.com)
 */
namespace gdjs {
  /**
   * PlatformerObjectRuntimeBehavior represents a behavior allowing objects to be
   * considered as a platform by objects having PlatformerObject Behavior.
   */
  export class PlatformerObjectRuntimeBehavior extends gdjs.RuntimeBehavior {
    // To achieve pixel-perfect precision when positioning object on platform or
    // handling collision with "walls", edges of the hitboxes must be ignored during
    // collision checks, so that two overlapping edges are not considered as colliding.
    // For example, if a character is 10px width and is at position (0, 0), it must not be
    // considered as colliding with a platform which is at position (10, 0). Edges will
    // still be overlapping (because character hitbox right edge is at X position 10 and
    // platform hitbox left edge is also at X position 10).
    // This parameter "_ignoreTouchingEdges" will be passed to all collision handling functions.
    _ignoreTouchingEdges: boolean = true;
    _roundCoordinates: boolean;
    _gravity: float;
    _maxFallingSpeed: float;
    _ladderClimbingSpeed: float;
    _acceleration: float;
    _deceleration: float;
    _maxSpeed: float;
    _jumpSpeed: float;
    _canGrabPlatforms: boolean;
    _yGrabOffset: any;
    _xGrabTolerance: any;
    _jumpSustainTime: float;
    _currentFallSpeed: float = 0;
    _currentSpeed: float = 0;
    _canJump: boolean = false;
    _ignoreDefaultControls: boolean;
    _leftKey: boolean = false;
    _rightKey: boolean = false;
    _ladderKey: boolean = false;
    _upKey: boolean = false;
    _downKey: boolean = false;
    _jumpKey: boolean = false;

    _state: PlatformerObjectRuntimeBehavior.State;
    _falling: PlatformerObjectRuntimeBehavior.Falling;
    _onFloor: PlatformerObjectRuntimeBehavior.OnFloor;
    _jumping: PlatformerObjectRuntimeBehavior.Jumping;
    _grabbingPlatform: PlatformerObjectRuntimeBehavior.GrabbingPlatform;
    _onLadder: PlatformerObjectRuntimeBehavior.OnLadder;

    /** Platforms near the object, updated with `_updatePotentialCollidingObjects`. */
    _potentialCollidingObjects: Array<gdjs.PlatformRuntimeBehavior>;

    /** Overlapped jump-thru platforms, updated with `_updateOverlappedJumpThru`. */
    _overlappedJumpThru: Array<gdjs.PlatformRuntimeBehavior>;

    _hasReallyMoved: boolean = false;
    _manager: gdjs.PlatformObjectsManager;

    _releaseKey: boolean = false;
    _slopeMaxAngle: float;
    _slopeClimbingFactor: float = 1;

    _requestedDeltaX: float = 0;
    _requestedDeltaY: float = 0;
    _lastDeltaY: float = 0;

    constructor(runtimeScene, behaviorData, owner) {
      super(runtimeScene, behaviorData, owner);
      this._roundCoordinates = behaviorData.roundCoordinates;
      this._gravity = behaviorData.gravity;
      this._maxFallingSpeed = behaviorData.maxFallingSpeed;
      this._ladderClimbingSpeed = behaviorData.ladderClimbingSpeed || 150;
      this._acceleration = behaviorData.acceleration;
      this._deceleration = behaviorData.deceleration;
      this._maxSpeed = behaviorData.maxSpeed;
      this._jumpSpeed = behaviorData.jumpSpeed;
      this._canGrabPlatforms = behaviorData.canGrabPlatforms || false;
      this._yGrabOffset = behaviorData.yGrabOffset || 0;
      this._xGrabTolerance = behaviorData.xGrabTolerance || 10;
      this._jumpSustainTime = behaviorData.jumpSustainTime || 0;
      this._ignoreDefaultControls = behaviorData.ignoreDefaultControls;
      this._potentialCollidingObjects = [];

      this._overlappedJumpThru = [];
      this._slopeMaxAngle = 0;
      this.setSlopeMaxAngle(behaviorData.slopeMaxAngle);
      this._manager = gdjs.PlatformObjectsManager.getManager(runtimeScene);

      this._falling = new PlatformerObjectRuntimeBehavior.Falling(this);
      this._onFloor = new PlatformerObjectRuntimeBehavior.OnFloor(this);
      this._jumping = new PlatformerObjectRuntimeBehavior.Jumping(this);
      this._grabbingPlatform = new PlatformerObjectRuntimeBehavior.GrabbingPlatform(this);
      this._onLadder = new PlatformerObjectRuntimeBehavior.OnLadder(this);
      this._state = this._falling;
    }

    updateFromBehaviorData(oldBehaviorData, newBehaviorData): boolean {
      if (
        oldBehaviorData.roundCoordinates !== newBehaviorData.roundCoordinates
      ) {
        this._roundCoordinates = newBehaviorData.roundCoordinates;
      }
      if (oldBehaviorData.gravity !== newBehaviorData.gravity) {
        this.setGravity(newBehaviorData.gravity);
      }
      if (oldBehaviorData.maxFallingSpeed !== newBehaviorData.maxFallingSpeed) {
        this.setMaxFallingSpeed(newBehaviorData.maxFallingSpeed);
      }
      if (oldBehaviorData.acceleration !== newBehaviorData.acceleration) {
        this.setAcceleration(newBehaviorData.acceleration);
      }
      if (oldBehaviorData.deceleration !== newBehaviorData.deceleration) {
        this.setDeceleration(newBehaviorData.deceleration);
      }
      if (oldBehaviorData.maxSpeed !== newBehaviorData.maxSpeed) {
        this.setMaxSpeed(newBehaviorData.maxSpeed);
      }
      if (oldBehaviorData.jumpSpeed !== newBehaviorData.jumpSpeed) {
        this.setJumpSpeed(newBehaviorData.jumpSpeed);
      }
      if (
        oldBehaviorData.canGrabPlatforms !== newBehaviorData.canGrabPlatforms
      ) {
        this.setCanGrabPlatforms(newBehaviorData.canGrabPlatforms);
      }
      if (oldBehaviorData.yGrabOffset !== newBehaviorData.yGrabOffset) {
        this._yGrabOffset = newBehaviorData.yGrabOffset;
      }
      if (oldBehaviorData.xGrabTolerance !== newBehaviorData.xGrabTolerance) {
        this._xGrabTolerance = newBehaviorData.xGrabTolerance;
      }
      if (oldBehaviorData.jumpSustainTime !== newBehaviorData.jumpSustainTime) {
        this.setJumpSustainTime(newBehaviorData.jumpSustainTime);
      }
      return true;
    }

    updateSpeed(timeDelta: float): float {
      //Change the speed according to the player's input.
      // @ts-ignore
      if (this._leftKey) {
        this._currentSpeed -= this._acceleration * timeDelta;
      }
      if (this._rightKey) {
        this._currentSpeed += this._acceleration * timeDelta;
      }

      //Take deceleration into account only if no key is pressed.
      if (this._leftKey == this._rightKey) {
        const wasPositive = this._currentSpeed > 0;
        this._currentSpeed -=
          this._deceleration * timeDelta * (wasPositive ? 1.0 : -1.0);

        //Set the speed to 0 if the speed was top low.
        if (wasPositive && this._currentSpeed < 0) {
          this._currentSpeed = 0;
        }
        if (!wasPositive && this._currentSpeed > 0) {
          this._currentSpeed = 0;
        }
      }
      if (this._currentSpeed > this._maxSpeed) {
        this._currentSpeed = this._maxSpeed;
      }
      if (this._currentSpeed < -this._maxSpeed) {
        this._currentSpeed = -this._maxSpeed;
      }
      return this._currentSpeed * timeDelta;
    }

    moveX() {
      const object = this.owner;
      //Move the object on x axis.
      const oldX = object.getX();
      if (this._requestedDeltaX !== 0) {
        const floorPlatformId =
          this._onFloor.getFloorPlatform() !== null ? this._onFloor.getFloorPlatform()!.owner.id : null;
        object.setX(object.getX() + this._requestedDeltaX);
        let tryRounding = true;

        //Colliding: Try to push out from the solid.
        //Note that jump thru are never obstacle on X axis.
        while (
          this._isCollidingWith(
            this._potentialCollidingObjects,
            floorPlatformId,
            /*excludeJumpthrus=*/
            true
          )
        ) {
          if (
            (this._requestedDeltaX > 0 && object.getX() <= oldX) ||
            (this._requestedDeltaX < 0 && object.getX() >= oldX)
          ) {
            object.setX(
              //Unable to move the object without being stuck in an obstacle.
              oldX
            );
            break;
          }

          //If on floor: try get up a bit to bypass not perfectly aligned floors.
          if (this._state == this._onFloor) {
            object.setY(object.getY() - 1);
            if (
              !this._isCollidingWith(
                this._potentialCollidingObjects,
                floorPlatformId,
                /*excludeJumpthrus=*/
                true
              )
            ) {
              break;
            }
            object.setY(object.getY() + 1);
          }
          if (tryRounding) {
            // First try rounding the position as this might be sufficient to get the object
            // out of the wall.
            object.setX(Math.round(object.getX()));
            tryRounding = false;
          } else {
            object.setX(
              Math.round(object.getX()) + (this._requestedDeltaX > 0 ? -1 : 1)
            );
          }
          this._currentSpeed = 0;
        }
      }
    }
    
    _setFalling() {
      console.debug(`${this._state} --> ${this._falling}`);
      this._state.leave();
      this._state = this._falling;
      this._falling.enter();
    }

    _setOnFloor(collidingPlatform: PlatformRuntimeBehavior) {
      console.debug(`${this._state} --> ${this._onFloor}`);
      this._state.leave();
      this._state = this._onFloor;
      this._onFloor.enter(collidingPlatform);
    }

    _setJumping() {
      console.debug(`${this._state} --> ${this._jumping}`);
      this._state.leave();
      const from = this._state;
      this._state = this._jumping;
      this._jumping.enter(from);
    }

    _setGrabbingPlatform(grabbedPlatform: PlatformRuntimeBehavior) {
      console.debug(`${this._state} --> ${this._grabbingPlatform}`);
      this._state.leave();
      this._state = this._grabbingPlatform;
      this._grabbingPlatform.enter(grabbedPlatform);
    }

    _setOnLadder() {
      console.debug(`${this._state} --> ${this._onLadder}`);
      this._state.leave();
      this._state = this._onLadder;
      this._onLadder.enter();
    }

    moveY() {
      const object = this.owner;
      //Move the object on Y axis
      if (this._requestedDeltaY !== 0) {
        let oldY = object.getY();
        object.setY(object.getY() + this._requestedDeltaY);

        //Stop when colliding with an obstacle.
        while (
          (this._requestedDeltaY < 0 &&
            this._isCollidingWith(
              this._potentialCollidingObjects,
              null,
              /*excludeJumpThrus=*/
              true
            )) ||
          //Jumpthru = obstacle <=> Never when going up
          (this._requestedDeltaY > 0 &&
            this._isCollidingWithExcluding(
              this._potentialCollidingObjects,
              this._overlappedJumpThru
            ))
        ) {
          //Jumpthru = obstacle <=> Only if not already overlapped when going down
          if (this._state == this._jumping) {
            this._setFalling();
          }
          if (
            (this._requestedDeltaY > 0 && object.getY() <= oldY) ||
            (this._requestedDeltaY < 0 && object.getY() >= oldY)
          ) {
            object.setY(
              //Unable to move the object without being stuck in an obstacle.
              oldY
            );
            break;
          }
          object.setY(
            Math.floor(object.getY()) + (this._requestedDeltaY > 0 ? -1 : 1)
          );
        }
      }
    }

    checkTransitionOnLadder() {
      if (this._ladderKey && this._isOverlappingLadder()) {
        this._currentFallSpeed = 0;
        this._setOnLadder();
      }
    }

    checkTransitionJumping() {
      if (this._canJump && this._jumpKey) {
        this._setJumping();
      }
    }

    checkGrabPlatform() {
      const object = this.owner;
      let tryGrabbingPlatform = false;
      object.setX(
        object.getX() +
          (this._requestedDeltaX > 0 ? this._xGrabTolerance : -this._xGrabTolerance)
      );
      let collidingPlatform = this._getCollidingPlatform();
      if (
        collidingPlatform !== null &&
        this._canGrab(collidingPlatform)
      ) {
        tryGrabbingPlatform = true;
      }
      object.setX(
        object.getX() +
          (this._requestedDeltaX > 0 ? -this._xGrabTolerance : this._xGrabTolerance)
      );

      //Check if we can grab the collided platform
      if (tryGrabbingPlatform) {
        let oldY = object.getY();
        object.setY(
          // @ts-ignore - collidingPlatform is guaranteed to be not null.
          collidingPlatform.owner.getY() +
            // @ts-ignore - collidingPlatform is guaranteed to be not null.
            collidingPlatform.getYGrabOffset() -
            this._yGrabOffset
        );
        if (
          !this._isCollidingWith(
            this._potentialCollidingObjects,
            null,
            /*excludeJumpthrus=*/
            true
          )
        ) {
          this._setGrabbingPlatform(collidingPlatform!);
          this._requestedDeltaY = 0;
        } else {
          object.setY(oldY);
        }
      }
    }

    checkTransitionOnFloorOrFalling() {
      const object = this.owner;
      //Check if the object is on a floor:
      //In priority, check if the last floor platform is still the floor.
      let oldY = object.getY();
      object.setY(object.getY() + 1);
      if (
        this._state == this._onFloor &&
        gdjs.RuntimeObject.collisionTest(
          object,
          this._onFloor.getFloorPlatform()!.owner,
          this._ignoreTouchingEdges
        )
      ) {
        //Still on the same floor
        this._onFloor.updateFloorPosition();
      } else {
        // Avoid landing on a platform if the object is not going down.
        // (which could happen for Jumpthru, when the object jump and pass just at the top
        // of a jumpthru, it could be considered as landing if not this this extra check).
        const canLand = this._requestedDeltaY >= 0;

        //Check if landing on a new floor: (Exclude already overlapped jump truh)
        let collidingPlatform = this._getCollidingPlatform();
        if (canLand && collidingPlatform !== null) {
          this._currentFallSpeed = 0;
          
          //Ensure nothing is grabbed.
          this._releaseGrabbedPlatform();
          //Register the colliding platform as the floor.
          this._setOnFloor(collidingPlatform);
        } else if (this._state != this._grabbingPlatform) {
          //In the air
          this._canJump = false;
          if (this._state == this._onFloor) {
            this._setFalling();
          }
        }
      }
      object.setY(oldY);
    }

    fall(timeDelta: float) {
      this._currentFallSpeed += this._gravity * timeDelta;
      if (this._currentFallSpeed > this._maxFallingSpeed) {
        this._currentFallSpeed = this._maxFallingSpeed;
      }
      this._requestedDeltaY += this._currentFallSpeed * timeDelta;
      this._requestedDeltaY = Math.min(
        this._requestedDeltaY,
        this._maxFallingSpeed * timeDelta
      );
    }

    doStepPreEvents(runtimeScene) {
      const LEFTKEY = 37;
      const UPKEY = 38;
      const RIGHTKEY = 39;
      const DOWNKEY = 40;
      const LSHIFTKEY = 1016;
      const RSHIFTKEY = 2016;
      const SPACEKEY = 32;
      const object = this.owner;
      const timeDelta = this.owner.getElapsedTime(runtimeScene) / 1000;

      //0.1) Get the player input:
      this._requestedDeltaX = 0;
      this._requestedDeltaY = 0;

      const inputManager = runtimeScene.getGame().getInputManager();
      this._leftKey || (this._leftKey =
        !this._ignoreDefaultControls &&
        inputManager.isKeyPressed(LEFTKEY));
      // @ts-ignore
      this._rightKey || (this._rightKey =
        !this._ignoreDefaultControls &&
        inputManager.isKeyPressed(RIGHTKEY));
      
      this._jumpKey || (this._jumpKey =
      !this._ignoreDefaultControls &&
      (inputManager.isKeyPressed(LSHIFTKEY) ||
      inputManager.isKeyPressed(RSHIFTKEY) ||
      inputManager.isKeyPressed(SPACEKEY)));
      
      this._ladderKey || (this._ladderKey =
      !this._ignoreDefaultControls &&
      inputManager.isKeyPressed(UPKEY));
      
      this._upKey || (this._upKey =
        !this._ignoreDefaultControls &&
        inputManager.isKeyPressed(UPKEY));
      this._downKey || (this._downKey =
        !this._ignoreDefaultControls &&
        inputManager.isKeyPressed(DOWNKEY));
      
      this._releaseKey || (this._releaseKey =
        !this._ignoreDefaultControls &&
        inputManager.isKeyPressed(DOWNKEY));

      this._requestedDeltaX += this.updateSpeed(timeDelta);

      //0.2) Track changes in object size
      this._state.beforeUpdatingObstacles();
      this._onFloor._oldHeight = object.getHeight();

      //0.3) Update list of platforms around/related to the object

      //Compute the list of the objects that will be used
      this._updatePotentialCollidingObjects(
        Math.max(this._requestedDeltaX, this._maxFallingSpeed * timeDelta)
      );
      this._updateOverlappedJumpThru();

      //1) X axis:
      this._state.checkTransitionBeforeX();
      this._state.beforeMovingX();

      //Ensure the object is not stuck
      if (this._separateFromPlatforms(this._potentialCollidingObjects, true)) {
        this._canJump = true;
      }
      //After being unstuck, the object must be able to jump again.

      const oldX = object.getX();
      this.moveX();

      //2) Y axis:
      this._state.checkTransitionBeforeY(timeDelta);
      this._state.beforeMovingY(timeDelta, oldX);

      const oldY = object.getY();
      this.moveY();

      //3) Update the current floor data for the next tick:
      this._updateOverlappedJumpThru();
      //TODO what about a moving platform, do the same as for grabbing?
      if (this._state != this._onLadder) {
        this.checkTransitionOnFloorOrFalling();
      }

      //4) Do not forget to reset pressed keys
      this._leftKey = false;
      this._rightKey = false;
      this._ladderKey = false;
      this._upKey = false;
      this._downKey = false;
      this._releaseKey = false;
      this._jumpKey = false;

      //5) Track the movement
      this._hasReallyMoved = Math.abs(object.getX() - oldX) >= 1;
      this._lastDeltaY = object.getY() - oldY;
    }

    doStepPostEvents(runtimeScene) {}

    //Scene change is not supported
    /*
        if ( parentScene != &scene ) //Parent scene has changed
        {
            parentScene = &scene;
            sceneManager = parentScene ? &ScenePlatformObjectsManager::managers[&scene] : null;
            floorPlatform = null;
        }
        */
    /**
     * Return true if the object owning the behavior can grab the specified platform. There must be a collision
     * between the object and the platform.
     * @param platform The platform the object is in collision with
     * @param y The value in pixels on Y axis the object wants to move to
     */
    _canGrab(platform) {
      const y1 = this.owner.getY() + this._yGrabOffset - this._lastDeltaY;
      const y2 = this.owner.getY() + this._yGrabOffset;
      const platformY = platform.owner.getY() + platform.getYGrabOffset();
      return (
        platform.canBeGrabbed() &&
        ((y1 < platformY && platformY < y2) ||
          (y2 < platformY && platformY < y1))
      );
    }

    /**
     * Mark the platformer object has not being grabbing any platform.
     */
    _releaseGrabbedPlatform() {
      if (
        this._state == this._grabbingPlatform
      ) {
        this._setFalling();
      }
    }

    /**
     * Among the platforms passed in parameter, return true if there is a platform colliding with the object.
     * Ladders are *always* excluded from the test.
     * @param candidates The platform to be tested for collision
     * @param exceptThisOne The object identifier of a platform to be excluded from the check. Can be null.
     * @param excludeJumpThrus If set to true, jumpthru platforms are excluded. false if not defined.
     */
    _isCollidingWith(
      candidates,
      exceptThisOne?: number | null,
      excludeJumpThrus?: boolean
    ) {
      excludeJumpThrus = !!excludeJumpThrus;
      for (let i = 0; i < candidates.length; ++i) {
        const platform = candidates[i];
        if (platform.owner.id === exceptThisOne) {
          continue;
        }
        if (
          platform.getPlatformType() === gdjs.PlatformRuntimeBehavior.LADDER
        ) {
          continue;
        }
        if (
          excludeJumpThrus &&
          platform.getPlatformType() === gdjs.PlatformRuntimeBehavior.JUMPTHRU
        ) {
          continue;
        }
        if (
          gdjs.RuntimeObject.collisionTest(
            this.owner,
            platform.owner,
            this._ignoreTouchingEdges
          )
        ) {
          return true;
        }
      }
      return false;
    }

    /**
     * Separate the object from all platforms passed in parameter.
     * @param candidates The platform to be tested for collision
     * @param excludeJumpThrus If set to true, jumpthru platforms are excluded. false if not defined.
     */
    _separateFromPlatforms(candidates, excludeJumpThrus) {
      excludeJumpThrus = !!excludeJumpThrus;
      const objects = gdjs.staticArray(
        PlatformerObjectRuntimeBehavior.prototype._separateFromPlatforms
      );
      objects.length = 0;
      for (let i = 0; i < candidates.length; ++i) {
        const platform = candidates[i];
        if (
          platform.getPlatformType() === gdjs.PlatformRuntimeBehavior.LADDER
        ) {
          continue;
        }
        if (
          excludeJumpThrus &&
          platform.getPlatformType() === gdjs.PlatformRuntimeBehavior.JUMPTHRU
        ) {
          continue;
        }
        objects.push(platform.owner);
      }
      return this.owner.separateFromObjects(objects, this._ignoreTouchingEdges);
    }

    /**
     * Among the platforms passed in parameter, return true if there is a platform colliding with the object.
     * Ladders are *always* excluded from the test.
     * @param candidates The platform to be tested for collision
     * @param exceptTheseOnes The platforms to be excluded from the test
     */
    _isCollidingWithExcluding(candidates, exceptTheseOnes) {
      for (let i = 0; i < candidates.length; ++i) {
        const platform = candidates[i];
        if (exceptTheseOnes && this._isIn(exceptTheseOnes, platform.owner.id)) {
          continue;
        }
        if (
          platform.getPlatformType() === gdjs.PlatformRuntimeBehavior.LADDER
        ) {
          continue;
        }
        if (
          gdjs.RuntimeObject.collisionTest(
            this.owner,
            platform.owner,
            this._ignoreTouchingEdges
          )
        ) {
          return true;
        }
      }
      return false;
    }

    /**
     * Return (one of) the platform which is colliding with the behavior owner object.
     * Overlapped jump thru and ladders are excluded.
     * _updatePotentialCollidingObjects and _updateOverlappedJumpThru should have been called before.
     */
    _getCollidingPlatform() {
      for (let i = 0; i < this._potentialCollidingObjects.length; ++i) {
        const platform = this._potentialCollidingObjects[i];
        if (
          platform.getPlatformType() !== gdjs.PlatformRuntimeBehavior.LADDER &&
          !this._isIn(this._overlappedJumpThru, platform.owner.id) &&
          gdjs.RuntimeObject.collisionTest(
            this.owner,
            platform.owner,
            this._ignoreTouchingEdges
          )
        ) {
          return platform;
        }
      }

      //Nothing is being colliding with the behavior object.
      return null;
    }

    /**
     * Update _overlappedJumpThru member, so that it contains all the jumpthru platforms colliding with
     * the behavior owner object.
     * Note: _updatePotentialCollidingObjects must have been called before.
     */
    private _updateOverlappedJumpThru() {
      this._overlappedJumpThru.length = 0;
      for (let i = 0; i < this._potentialCollidingObjects.length; ++i) {
        const platform = this._potentialCollidingObjects[i];
        if (
          platform.getPlatformType() ===
            gdjs.PlatformRuntimeBehavior.JUMPTHRU &&
          gdjs.RuntimeObject.collisionTest(
            this.owner,
            platform.owner,
            this._ignoreTouchingEdges
          )
        ) {
          this._overlappedJumpThru.push(platform);
        }
      }
    }

    /**
     * Return true if the object is overlapping a ladder.
     * Note: _updatePotentialCollidingObjects must have been called before.
     */
    _isOverlappingLadder() { //FIXME put back private
      for (let i = 0; i < this._potentialCollidingObjects.length; ++i) {
        const platform = this._potentialCollidingObjects[i];
        if (
          platform.getPlatformType() !== gdjs.PlatformRuntimeBehavior.LADDER
        ) {
          continue;
        }
        if (
          gdjs.RuntimeObject.collisionTest(
            this.owner,
            platform.owner,
            this._ignoreTouchingEdges
          )
        ) {
          return true;
        }
      }
      return false;
    }

    _isIn(platformArray, id) {
      for (let i = 0; i < platformArray.length; ++i) {
        if (platformArray[i].owner.id === id) {
          return true;
        }
      }
      return false;
    }

    /**
     * Update _potentialCollidingObjects member with platforms near the object.
     */
    private _updatePotentialCollidingObjects(maxMovementLength) {
      this._manager.getAllPlatformsAround(
        this.owner,
        maxMovementLength,
        this._potentialCollidingObjects
      );

      // Filter the potential colliding platforms to ensure that the object owning the behavior
      // is not considered as colliding with itself, in the case that it also has the
      // platform behavior.
      for (let i = 0; i < this._potentialCollidingObjects.length; ) {
        if (this._potentialCollidingObjects[i].owner === this.owner) {
          this._potentialCollidingObjects.splice(i, 1);
        } else {
          i++;
        }
      }
    }

    /**
     * Simulate a control action in the Platformer Object by specifying an input.
     * @param input The string expression of the control action [Left,Right,Up,Down,Ladder,Jump,Release].
     */
    simulateControl(input: string) {
      if (input === 'Left') {
        this._leftKey = true;
      } else if (input === 'Right') {
        this._rightKey = true;
      } else if (input === 'Up') {
        this._upKey = true;
      } else if (input === 'Down') {
        this._downKey = true;
      } else if (input === 'Ladder') {
        this._ladderKey = true;
      } else if (input === 'Jump') {
        this._jumpKey = true;
      } else if (input === 'Release') {
        this._releaseKey = true;
      }
    }

    /**
     * Get the gravity of the Platformer Object.
     * @returns The current gravity.
     */
    getGravity(): float {
      return this._gravity;
    }

    /**
     * Get the maximum falling speed of the Platformer Object.
     * @returns The maximum falling speed.
     */
    getMaxFallingSpeed(): float {
      return this._maxFallingSpeed;
    }

    /**
     * Get the speed used to move on Y axis when climbing a ladder.
     * @returns The speed of ladder climbing.
     */
    getLadderClimbingSpeed(): float {
      return this._ladderClimbingSpeed;
    }

    /**
     * Get the acceleration value of the Platformer Object.
     * @returns The current acceleration.
     */
    getAcceleration(): float {
      return this._acceleration;
    }

    /**
     * Get the deceleration of the Platformer Object.
     * @returns The current deceleration.
     */
    getDeceleration(): float {
      return this._deceleration;
    }

    /**
     * Get the maximum speed of the Platformer Object.
     * @returns The maximum speed.
     */
    getMaxSpeed(): float {
      return this._maxSpeed;
    }

    /**
     * Get the jump speed of the Platformer Object.
     * @returns The jump speed.
     */
    getJumpSpeed(): float {
      return this._jumpSpeed;
    }

    /**
     * Get the jump sustain time of the Platformer Object.
     * @returns The jump sustain time.
     */
    getJumpSustainTime(): float {
      return this._jumpSustainTime;
    }

    /**
     * Get the speed at which the object is falling. It is 0 when the object is on a floor, and non 0 as soon as the object leaves the floor.
     * @returns The current fall speed.
     */
    getCurrentFallSpeed(): float {
      return this._currentFallSpeed;
    }

    /**
     * Get the current speed of the Platformer Object.
     * @returns The current speed.
     */
    getCurrentSpeed(): float {
      return this._currentSpeed;
    }

    /**
     * Get the current jump speed of the Platformer Object.
     * @returns The current jump speed.
     */
    getCurrentJumpSpeed(): float {
      return this._jumping.getCurrentJumpSpeed();
    }

    /**
     * Check if the Platformer Object can grab the platforms.
     * @returns Returns true if the object can grab the platforms.
     */
    canGrabPlatforms(): boolean {
      return this._canGrabPlatforms;
    }

    /**
     * Check if the Platformer Object can jump.
     * @returns Returns true if the object can jump.
     */
    canJump(): boolean {
      return this._canJump;
    }

    /**
     * Set the gravity of the Platformer Object.
     * @param gravity The new gravity.
     */
    setGravity(gravity: float): void {
      this._gravity = gravity;
    }

    /**
     * Set the maximum falling speed of the Platformer Object.
     * @param maxFallingSpeed The maximum falling speed.
     */
    setMaxFallingSpeed(maxFallingSpeed: float): void {
      this._maxFallingSpeed = maxFallingSpeed;
    }

    /**
     * Set the speed used to move on Y axis when climbing a ladder.
     * @param ladderClimbingSpeed The speed of ladder climbing.
     */
    setLadderClimbingSpeed(ladderClimbingSpeed: float): void {
      this._ladderClimbingSpeed = ladderClimbingSpeed;
    }

    /**
     * Set the acceleration of the Platformer Object.
     * @param acceleration The new acceleration.
     */
    setAcceleration(acceleration: float): void {
      this._acceleration = acceleration;
    }

    /**
     * Set the deceleration of the Platformer Object.
     * @param deceleration The new deceleration.
     */
    setDeceleration(deceleration: float): void {
      this._deceleration = deceleration;
    }

    /**
     * Set the maximum speed of the Platformer Object.
     * @param maxSpeed The new maximum speed.
     */
    setMaxSpeed(maxSpeed: float): void {
      this._maxSpeed = maxSpeed;
    }

    /**
     * Set the jump speed of the Platformer Object.
     * @param jumpSpeed The new jump speed.
     */
    setJumpSpeed(jumpSpeed: float): void {
      this._jumpSpeed = jumpSpeed;
    }

    /**
     * Set the jump sustain time of the Platformer Object.
     * @param jumpSpeed The new jump sustain time.
     */
    setJumpSustainTime(jumpSustainTime: float): void {
      this._jumpSustainTime = jumpSustainTime;
    }

    /**
     * Set the maximum slope angle of the Platformer Object.
     * @param slopeMaxAngle The new maximum slope angle.
     */
    setSlopeMaxAngle(slopeMaxAngle: float): void {
      if (slopeMaxAngle < 0 || slopeMaxAngle >= 90) {
        return;
      }
      this._slopeMaxAngle = slopeMaxAngle;

      //Avoid rounding errors
      if (slopeMaxAngle == 45) {
        this._slopeClimbingFactor = 1;
      } else {
        this._slopeClimbingFactor = Math.tan(
          (slopeMaxAngle * 3.1415926) / 180.0
        );
      }
    }

    /**
     * Allow the Platformer Object to jump again.
     */
    setCanJump(): void {
      this._canJump = true;
    }

    /**
     * Set if the Platformer Object can grab platforms.
     * @param enable Enable / Disable grabbing of platforms.
     */
    setCanGrabPlatforms(enable: boolean): void {
      this._canGrabPlatforms = enable;
      if (!this._canGrabPlatforms) {
        this._releaseGrabbedPlatform();
      }
    }

    /**
     * Ignore the default controls of the Platformer Object.
     * @param ignore Enable / Disable default controls.
     */
    ignoreDefaultControls(ignore: boolean) {
      this._ignoreDefaultControls = ignore;
    }

    /**
     * Simulate the "Left" control of the Platformer Object.
     */
    simulateLeftKey() {
      this._leftKey = true;
    }

    /**
     * Simulate the "Right" control of the Platformer Object.
     */
    simulateRightKey() {
      this._rightKey = true;
    }

    /**
     * Simulate the "Ladder" control of the Platformer Object.
     */
    simulateLadderKey() {
      this._ladderKey = true;
    }

    /**
     * Simulate the "Up" control of the Platformer Object.
     */
    simulateUpKey() {
      this._upKey = true;
    }

    /**
     * Simulate the "Down" control of the Platformer Object.
     */
    simulateDownKey() {
      this._downKey = true;
    }

    /**
     * Simulate the "Jump" control of the Platformer Object.
     */
    simulateJumpKey() {
      this._jumpKey = true;
    }

    /**
     * Simulate the "Release" control of the Platformer Object.
     */
    simulateReleaseKey() {
      this._releaseKey = true;
    }

    /**
     * Check if the Platformer Object is on the floor.
     * @returns Returns true if on the floor and false if not.
     */
    isOnFloor(): boolean {
      return this._state == this._onFloor;
    }

    /**
     * Check if the Platformer Object is on a ladder.
     * @returns Returns true if on a ladder and false if not.
     */
    isOnLadder(): boolean {
      return this._state == this._onLadder;
    }

    /**
     * Check if the Platformer Object is jumping.
     * @returns Returns true if jumping and false if not.
     */
    isJumping(): boolean {
      return this._state == this._jumping;
    }

    /**
     * Check if the Platformer Object is grabbing a platform.
     * @returns Returns true if a platform is grabbed and false if not.
     */
    isGrabbingPlatform(): boolean {
      return this._state == this._grabbingPlatform;
    }

    /**
     * Check if the Platformer Object is falling.
     * @returns Returns true if it is falling and false if not.
     */
    isFalling(): boolean {
      return this._state == this._falling;
    }

    /**
     * Check if the Platformer Object is moving.
     * @returns Returns true if it is moving and false if not.
     */
    isMoving(): boolean {
      return (
        (this._hasReallyMoved && this._currentSpeed !== 0) ||
        this._jumping.getCurrentJumpSpeed() !== 0 ||
        this._currentFallSpeed !== 0
      );
    }
  }

  export namespace PlatformerObjectRuntimeBehavior {
    export interface State {
      leave(): void;
      beforeUpdatingObstacles(): void;
      checkTransitionBeforeX(): void;
      beforeMovingX(): void;
      checkTransitionBeforeY(timeDelta: float): void;
      beforeMovingY(timeDelta: float, oldX: float): void;
    }

    export class OnFloor implements State {
      private _behavior : PlatformerObjectRuntimeBehavior;
      private _floorPlatform:PlatformRuntimeBehavior | null = null;
      private _floorLastX: float = 0;
      private _floorLastY: float = 0;
      _oldHeight: float = 0;

      constructor(behavior: PlatformerObjectRuntimeBehavior) {
        this._behavior = behavior;
      }

      getFloorPlatform() {
        return this._floorPlatform;
      }

      enter(floorPlatform: PlatformRuntimeBehavior) {
        this._floorPlatform = floorPlatform;
        this.updateFloorPosition();
        this._behavior._canJump = true;
      }

      leave() {
        this._floorPlatform = null;
      }

      updateFloorPosition() {
        this._floorLastX = this._floorPlatform!.owner.getX();
        this._floorLastY = this._floorPlatform!.owner.getY();
      }

      beforeUpdatingObstacles() {
        const object = this._behavior.owner;
        //Stick the object to the floor if its height has changed.
        if (
          this._oldHeight !== object.getHeight()
        ) {
          object.setY(
            this._floorLastY -
              object.getHeight() +
              (object.getY() - object.getDrawableY()) -
              1
          );
        }
      }
  
      checkTransitionBeforeX() {
        const behavior = this._behavior;
        //Check that the floor object still exists and is near the object.
        if (
          !behavior._isIn(
            behavior._potentialCollidingObjects,
            this._floorPlatform!.owner.id
          )
        ) {
          behavior._setFalling();
        }
      }
  
      beforeMovingX() {
        const behavior = this._behavior;
        //Shift the object according to the floor movement.
        behavior._requestedDeltaX += this._floorPlatform!.owner.getX() - this._floorLastX;
        behavior._requestedDeltaY += this._floorPlatform!.owner.getY() - this._floorLastY;
      }
  
      checkTransitionBeforeY(timeDelta: float) {
        const behavior = this._behavior;
        //Go on a ladder
        behavior.checkTransitionOnLadder();
        //Jumping
        behavior.checkTransitionJumping();
      }
  
      beforeMovingY(timeDelta: float, oldX: float) {
        const behavior = this._behavior;
        const object = behavior.owner;
        
        //Follow the floor
        if (
          gdjs.RuntimeObject.collisionTest(
            object,
            this._floorPlatform!.owner,
            behavior._ignoreTouchingEdges
          )
        ) {
          //Floor is getting up, as the object is colliding with it.
          let oldY = object.getY();
          let step = 0;
          let stillInFloor = false;
          do {
            if (
              step >=
              Math.floor(Math.abs(behavior._requestedDeltaX * behavior._slopeClimbingFactor))
            ) {
              //Slope is too step ( > 50% )
              object.setY(
                object.getY() -
                  (Math.abs(behavior._requestedDeltaX * behavior._slopeClimbingFactor) - step)
              );

              //Try to add the decimal part.
              if (
                gdjs.RuntimeObject.collisionTest(
                  object,
                  this._floorPlatform!.owner,
                  behavior._ignoreTouchingEdges
                )
              ) {
                stillInFloor = true;
              }

              //Too steep.
              break;
            }

            //Try to get out of the floor.
            object.setY(object.getY() - 1);
            step++;
          } while (
            gdjs.RuntimeObject.collisionTest(
              object,
              this._floorPlatform!.owner,
              behavior._ignoreTouchingEdges
            )
          );
          if (stillInFloor) {
            object.setY(
              //Unable to follow the floor ( too steep ): Go back to the original position.
              oldY
            );
            object.setX(
              //And also revert the shift on X axis.
              oldX
            );
          }
        } else {
          //Floor is flat or get down.
          let oldY = object.getY();
          const tentativeStartY = object.getY() + 1;
          object.setY(
            behavior._roundCoordinates
              ? Math.round(tentativeStartY)
              : tentativeStartY
          );
          let step = 0;
          let noMoreOnFloor = false;
          while (!behavior._isCollidingWith(behavior._potentialCollidingObjects)) {
            if (step > Math.abs(behavior._requestedDeltaX * behavior._slopeClimbingFactor)) {
              //Slope is too step ( > 50% )
              noMoreOnFloor = true;
              break;
            }

            //Object was on floor, but no more: Maybe a slope, try to follow it.
            object.setY(object.getY() + 1);
            step++;
          }

          //Unable to follow the floor: Go back to the original position. Fall will be triggered next tick.
          if (noMoreOnFloor) {
            object.setY(oldY);
          } else {
            object.setY(
              //Floor touched: Go back 1 pixel over.
              object.getY() - 1
            );
          }
        }
      }

      toString(): String {
        return "OnFloor";
      }
    }

    export class Falling implements State {
      private _behavior : PlatformerObjectRuntimeBehavior;

      constructor(behavior: PlatformerObjectRuntimeBehavior) {
        this._behavior = behavior;
      }

      enter() {
      }

      leave() {
      }

      beforeUpdatingObstacles() {
      }
  
      checkTransitionBeforeX() {
      }
  
      beforeMovingX() {
      }
  
      checkTransitionBeforeY(timeDelta: float) {
        const behavior = this._behavior;
        //Go on a ladder
        behavior.checkTransitionOnLadder();
        //Jumping
        behavior.checkTransitionJumping();
  
        //Grabbing a platform
        if (
          behavior._canGrabPlatforms &&
          behavior._requestedDeltaX !== 0
        ) {
          behavior.checkGrabPlatform();
        }
      }
  
      beforeMovingY(timeDelta: float, oldX: float) {
        //Fall
        this._behavior.fall(timeDelta);
      }

      toString(): String {
        return "Falling";
      }
    }

    export class Jumping implements State {
      private _behavior : PlatformerObjectRuntimeBehavior;
      private _currentJumpSpeed: number = 0;
      private _timeSinceCurrentJumpStart: number = 0;
      private _jumpKeyHeldSinceJumpStart: boolean = false;
      private _jumpingFirstDelta: boolean = false;

      constructor(behavior: PlatformerObjectRuntimeBehavior) {
        this._behavior = behavior;
      }

      getCurrentJumpSpeed() {
        return this._currentJumpSpeed;
      }

      enter(from: PlatformerObjectRuntimeBehavior.State) {
        const behavior = this._behavior;
        this._timeSinceCurrentJumpStart = 0;
        this._jumpKeyHeldSinceJumpStart = true;
        
        if (from != behavior._jumping &&
            from != behavior._falling) {
          this._jumpingFirstDelta = true;
        }
        
        behavior._canJump = false;

        //FIXME can't be Jumping and OnFloor at the same time, need a fix and a test
        //this._isOnFloor = false; If floor is a very steep slope, the object could go into it.
        this._currentJumpSpeed = behavior._jumpSpeed;
        behavior._currentFallSpeed = 0;
      }

      leave() {
        this._currentJumpSpeed = 0;
      }

      beforeUpdatingObstacles() {
      }
  
      checkTransitionBeforeX() {
      }
  
      beforeMovingX() {
      }
  
      checkTransitionBeforeY(timeDelta: float) {
        const behavior = this._behavior;
        //Go on a ladder
        behavior.checkTransitionOnLadder();
        //Jumping
        behavior.checkTransitionJumping();

        //Grabbing a platform
        if (
          behavior._canGrabPlatforms &&
          behavior._requestedDeltaX !== 0 &&
          behavior._lastDeltaY >= 0
        ) {
          behavior.checkGrabPlatform();
        }
      }
  
      beforeMovingY(timeDelta: float, oldX: float) {
        const behavior = this._behavior;
        
        //Fall
        if (
          !this._jumpingFirstDelta
        ) {
          behavior.fall(timeDelta);
        }
        this._jumpingFirstDelta = false;
        
        // Check if the jump key is continuously held since
        // the beginning of the jump.
        if (!behavior._jumpKey) {
          this._jumpKeyHeldSinceJumpStart = false;
        }
        this._timeSinceCurrentJumpStart += timeDelta;
        behavior._requestedDeltaY -= this._currentJumpSpeed * timeDelta;

        // Decrease jump speed after the (optional) jump sustain time is over.
        const sustainJumpSpeed =
          this._jumpKeyHeldSinceJumpStart &&
          this._timeSinceCurrentJumpStart < behavior._jumpSustainTime;
        if (!sustainJumpSpeed) {
          this._currentJumpSpeed -= behavior._gravity * timeDelta;
        }
        if (this._currentJumpSpeed < 0) {
          behavior._setFalling();
        }
      }

      toString(): String {
        return "Jumping";
      }
    }

    export class GrabbingPlatform implements State {
      private _behavior : PlatformerObjectRuntimeBehavior;
      private _grabbedPlatform: any = null;
      private _grabbedPlatformLastX: any;
      private _grabbedPlatformLastY: any;

      constructor(behavior: PlatformerObjectRuntimeBehavior) {
        this._behavior = behavior;
      }

      enter(grabbedPlatform: PlatformRuntimeBehavior) {
        this._grabbedPlatform = grabbedPlatform;
        this._behavior._canJump = true;
      }

      leave() {
        this._grabbedPlatform = null;
      }

      beforeUpdatingObstacles() {
      }
  
      checkTransitionBeforeX() {
        const behavior = this._behavior;
        //Check that the grabbed platform object still exists and is near the object.
        if (
          !behavior._isIn(
            behavior._potentialCollidingObjects,
            this._grabbedPlatform.owner.id
          )
        ) {
          behavior._releaseGrabbedPlatform();
        }
      }
  
      beforeMovingX() {
        const behavior = this._behavior;
        //Shift the object according to the grabbed platform movement.
          // this._behavior erases any other movement
        behavior._requestedDeltaX =
          this._grabbedPlatform.owner.getX() - this._grabbedPlatformLastX;
        behavior._requestedDeltaY =
          this._grabbedPlatform.owner.getY() - this._grabbedPlatformLastY;
      }
  
      checkTransitionBeforeY(timeDelta: float) {
        const behavior = this._behavior;
        //Go on a ladder
        behavior.checkTransitionOnLadder();

        if (behavior._releaseKey) {
          behavior._releaseGrabbedPlatform();
        }
  
        //Jumping
        behavior.checkTransitionJumping();
      }
  
      beforeMovingY(timeDelta: float, oldX: float) {
        const behavior = this._behavior;
        behavior._currentFallSpeed = 0;
        this._grabbedPlatformLastX = this._grabbedPlatform.owner.getX();
        this._grabbedPlatformLastY = this._grabbedPlatform.owner.getY();
      }

      toString(): String {
        return "GrabbingPlatform";
      }
    }

    export class OnLadder implements State {
      private _behavior : PlatformerObjectRuntimeBehavior;

      constructor(behavior: PlatformerObjectRuntimeBehavior) {
        this._behavior = behavior;
      }

      enter() {
        this._behavior._canJump = true;
      }

      leave() {
      }

      beforeUpdatingObstacles() {
      }
  
      checkTransitionBeforeX() {
      }
  
      beforeMovingX() {
      }
  
      checkTransitionBeforeY(timeDelta: float) {
        const behavior = this._behavior;
        //Coming to an extremity of a ladder
        if (!behavior._isOverlappingLadder()) {
          behavior._setFalling();
        }
  
        //Jumping
        behavior.checkTransitionJumping();
      }
  
      beforeMovingY(timeDelta: float, oldX: float) {
        const behavior = this._behavior;
        
        if (behavior._upKey) {
          behavior._requestedDeltaY -= behavior._ladderClimbingSpeed * timeDelta;
        }
        if (behavior._downKey) {
          behavior._requestedDeltaY += behavior._ladderClimbingSpeed * timeDelta;
        }
      }

      toString(): String {
        return "OnLadder";
      }
    }
  }

  gdjs.registerBehavior(
    'PlatformBehavior::PlatformerObjectBehavior',
    gdjs.PlatformerObjectRuntimeBehavior
  );
}
