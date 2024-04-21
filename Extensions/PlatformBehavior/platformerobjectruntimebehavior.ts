/*
GDevelop - Platform Behavior Extension
Copyright (c) 2013-2016 Florian Rival (Florian.Rival@gmail.com)
 */
namespace gdjs {
  /**
   * Returned by _findHighestFloorAndMoveOnTop
   */
  type PlatformSearchResult = {
    highestGround: gdjs.PlatformRuntimeBehavior | null;
    isCollidingAnyPlatform: boolean;
  };

  /**
   * PlatformerObjectRuntimeBehavior represents a behavior allowing objects to be
   * considered as a platform by objects having PlatformerObject Behavior.
   */
  export class PlatformerObjectRuntimeBehavior extends gdjs.RuntimeBehavior {
    /**
     * Returned by _findHighestFloorAndMoveOnTop
     */
    private static readonly _platformSearchResult: PlatformSearchResult = {
      highestGround: null,
      isCollidingAnyPlatform: false,
    };

    /**
     * A very small value compare to 1 pixel, yet very huge compare to rounding errors.
     */
    private static readonly epsilon = 2 ** -20;

    // Behavior configuration

    /** To achieve pixel-perfect precision when positioning object on platform or
     * handling collision with "walls", edges of the hitboxes must be ignored during
     * collision checks, so that two overlapping edges are not considered as colliding.
     *
     * For example, if a character is 10px width and is at position (0, 0), it must not be
     * considered as colliding with a platform which is at position (10, 0). Edges will
     * still be overlapping (because character hitbox right edge is at X position 10 and
     * platform hitbox left edge is also at X position 10).
     *
     * This parameter "_ignoreTouchingEdges" will be passed to all collision handling functions.
     */
    _ignoreTouchingEdges: boolean = true;

    private _acceleration: float;
    private _deceleration: float;
    private _maxSpeed: float;
    private _slopeMaxAngle: float;
    _slopeClimbingFactor: float = 1;

    _gravity: float;
    _maxFallingSpeed: float;
    _jumpSpeed: float;
    _jumpSustainTime: float;

    _ladderClimbingSpeed: float;

    _canGrabPlatforms: boolean;
    _canGrabWithoutMoving: boolean;
    private _yGrabOffset: any;
    private _xGrabTolerance: any;

    _useLegacyTrajectory: boolean;

    _canGoDownFromJumpthru: boolean = false;

    // Behavior state

    _currentSpeed: float = 0;
    _requestedDeltaX: float = 0;
    _requestedDeltaY: float = 0;
    _lastDeltaY: float = 0;
    _currentFallSpeed: float = 0;
    _canJump: boolean = false;
    _lastDirectionIsLeft: boolean = false;

    private _ignoreDefaultControls: boolean;
    private _leftKey: boolean = false;
    private _rightKey: boolean = false;
    private _ladderKey: boolean = false;
    _upKey: boolean = false;
    _downKey: boolean = false;
    _jumpKey: boolean = false;
    _releasePlatformKey: boolean = false;
    _releaseLadderKey: boolean = false;

    // This is useful for extensions that need to know
    // which keys were pressed and doesn't know the mapping
    // done by the scene events.
    private _wasLeftKeyPressed: boolean = false;
    private _wasRightKeyPressed: boolean = false;
    private _wasLadderKeyPressed: boolean = false;
    private _wasUpKeyPressed: boolean = false;
    private _wasDownKeyPressed: boolean = false;
    private _wasJumpKeyPressed: boolean = false;
    private _wasReleasePlatformKeyPressed: boolean = false;
    private _wasReleaseLadderKeyPressed: boolean = false;

    private _state: State;
    _falling: Falling;
    _onFloor: OnFloor;
    _jumping: Jumping;
    _grabbingPlatform: GrabbingPlatform;
    _onLadder: OnLadder;

    /** Platforms near the object, updated with `_updatePotentialCollidingObjects`. */
    _potentialCollidingObjects: Array<gdjs.PlatformRuntimeBehavior>;

    /** Overlapped jump-thru platforms, updated with `_updateOverlappedJumpThru`. */
    _overlappedJumpThru: Array<gdjs.PlatformRuntimeBehavior>;

    private _hasReallyMoved: boolean = false;
    /** @deprecated use _hasReallyMoved instead */
    private _hasMovedAtLeastOnePixel: boolean = false;
    private _manager: gdjs.PlatformObjectsManager;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      behaviorData,
      owner: gdjs.RuntimeObject
    ) {
      super(instanceContainer, behaviorData, owner);
      this._gravity = behaviorData.gravity;
      this._maxFallingSpeed = behaviorData.maxFallingSpeed;
      this._ladderClimbingSpeed = behaviorData.ladderClimbingSpeed || 150;
      this._acceleration = behaviorData.acceleration;
      this._deceleration = behaviorData.deceleration;
      this._maxSpeed = behaviorData.maxSpeed;
      this._jumpSpeed = behaviorData.jumpSpeed;
      this._canGrabPlatforms = behaviorData.canGrabPlatforms || false;
      this._canGrabWithoutMoving = behaviorData.canGrabWithoutMoving;
      this._yGrabOffset = behaviorData.yGrabOffset || 0;
      this._xGrabTolerance = behaviorData.xGrabTolerance || 10;
      this._jumpSustainTime = behaviorData.jumpSustainTime || 0;
      this._ignoreDefaultControls = behaviorData.ignoreDefaultControls;
      this._useLegacyTrajectory =
        behaviorData.useLegacyTrajectory === undefined
          ? true
          : behaviorData.useLegacyTrajectory;
      this._canGoDownFromJumpthru = behaviorData.canGoDownFromJumpthru;
      this._slopeMaxAngle = 0;
      this.setSlopeMaxAngle(behaviorData.slopeMaxAngle);

      this._potentialCollidingObjects = [];
      this._overlappedJumpThru = [];

      this._manager = gdjs.PlatformObjectsManager.getManager(instanceContainer);

      this._falling = new Falling(this);
      this._onFloor = new OnFloor(this);
      this._jumping = new Jumping(this);
      this._grabbingPlatform = new GrabbingPlatform(this);
      this._onLadder = new OnLadder(this);
      this._state = this._falling;
    }

    updateFromBehaviorData(oldBehaviorData, newBehaviorData): boolean {
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
      if (
        oldBehaviorData.canGrabWithoutMoving !==
        newBehaviorData.canGrabWithoutMoving
      ) {
        this._canGrabWithoutMoving = newBehaviorData.canGrabWithoutMoving;
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
      if (
        oldBehaviorData.useLegacyTrajectory !==
        newBehaviorData.useLegacyTrajectory
      ) {
        this._useLegacyTrajectory = newBehaviorData.useLegacyTrajectory;
      }
      if (
        oldBehaviorData.canGoDownFromJumpthru !==
        newBehaviorData.canGoDownFromJumpthru
      ) {
        this._canGoDownFromJumpthru = newBehaviorData.canGoDownFromJumpthru;
      }
      return true;
    }

    doStepPreEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {
      const LEFTKEY = 37;
      const UPKEY = 38;
      const RIGHTKEY = 39;
      const DOWNKEY = 40;
      const LSHIFTKEY = 1016;
      const RSHIFTKEY = 2016;
      const SPACEKEY = 32;
      const object = this.owner;
      const timeDelta = this.owner.getElapsedTime() / 1000;

      //0.1) Get the player input:
      this._requestedDeltaX = 0;
      this._requestedDeltaY = 0;

      const inputManager = instanceContainer.getGame().getInputManager();
      this._leftKey ||
        (this._leftKey =
          !this._ignoreDefaultControls && inputManager.isKeyPressed(LEFTKEY));
      this._rightKey ||
        (this._rightKey =
          !this._ignoreDefaultControls && inputManager.isKeyPressed(RIGHTKEY));

      this._jumpKey ||
        (this._jumpKey =
          !this._ignoreDefaultControls &&
          (inputManager.isKeyPressed(LSHIFTKEY) ||
            inputManager.isKeyPressed(RSHIFTKEY) ||
            inputManager.isKeyPressed(SPACEKEY)));

      this._ladderKey ||
        (this._ladderKey =
          !this._ignoreDefaultControls && inputManager.isKeyPressed(UPKEY));

      this._upKey ||
        (this._upKey =
          !this._ignoreDefaultControls && inputManager.isKeyPressed(UPKEY));
      this._downKey ||
        (this._downKey =
          !this._ignoreDefaultControls && inputManager.isKeyPressed(DOWNKEY));

      this._releasePlatformKey ||
        (this._releasePlatformKey =
          !this._ignoreDefaultControls && inputManager.isKeyPressed(DOWNKEY));

      this._requestedDeltaX += this._updateSpeed(timeDelta);

      if (this._leftKey !== this._rightKey) {
        this._lastDirectionIsLeft = this._leftKey;
      }

      //0.2) Track changes in object size
      this._state.beforeUpdatingObstacles(timeDelta);
      this._onFloor._oldHeight = object.getHeight();

      //0.3) Update list of platforms around/related to the object

      //Compute the list of the objects that will be used
      this._updatePotentialCollidingObjects(
        Math.max(this._requestedDeltaX, this._maxFallingSpeed * timeDelta)
      );
      this._updateOverlappedJumpThru();

      //1) X axis:
      const beforeMovingXState = this._state;
      this._state.checkTransitionBeforeX();
      this._state.beforeMovingX();

      //Ensure the object is not stuck
      if (this._separateFromPlatforms(this._potentialCollidingObjects, true)) {
        //After being unstuck, the object must be able to jump again.
        this._canJump = true;
      }

      const oldX = object.getX();
      this._moveX();
      const mayCollideWall = object.getX() !== oldX + this._requestedDeltaX;

      //2) Y axis:
      const beforeMovingYState = this._state;
      this._state.checkTransitionBeforeY(timeDelta);
      this._state.beforeMovingY(timeDelta, oldX);

      const oldY = object.getY();
      this._moveY();

      //3) Update the current floor data for the next tick:
      const beforeLastTransitionYState = this._state;
      //TODO what about a moving platforms, remove this condition to do the same as for grabbing?
      if (this._state !== this._onLadder) {
        this._checkTransitionOnFloorOrFalling();
      }

      if (
        // When the character is against a wall and the player hold left or
        // right, the speed shouldn't stack because starting at full speed when
        // jumping over the wall would look strange.
        mayCollideWall &&
        // Whereas, when the state has change, the collision is probably a
        // landing or a collision from the floor when stating to jump. The
        // speed must not be lost in these cases.
        this._state === beforeMovingXState &&
        this._state === beforeMovingYState &&
        this._state === beforeLastTransitionYState &&
        // When the character is on the floor, it will try to walk on the
        // obstacles and already stop if necessary.
        this._state !== this._onFloor
      ) {
        this._currentSpeed = 0;
      }

      this._wasLeftKeyPressed = this._leftKey;
      this._wasRightKeyPressed = this._rightKey;
      this._wasLadderKeyPressed = this._ladderKey;
      this._wasUpKeyPressed = this._upKey;
      this._wasDownKeyPressed = this._downKey;
      this._wasJumpKeyPressed = this._jumpKey;
      this._wasReleasePlatformKeyPressed = this._releasePlatformKey;
      this._wasReleaseLadderKeyPressed = this._releaseLadderKey;
      //4) Do not forget to reset pressed keys
      this._leftKey = false;
      this._rightKey = false;
      this._ladderKey = false;
      this._upKey = false;
      this._downKey = false;
      this._jumpKey = false;
      this._releasePlatformKey = false;
      this._releaseLadderKey = false;

      //5) Track the movement
      this._hasReallyMoved =
        Math.abs(object.getX() - oldX) >
          PlatformerObjectRuntimeBehavior.epsilon ||
        Math.abs(object.getY() - oldY) >
          PlatformerObjectRuntimeBehavior.epsilon;
      this._hasMovedAtLeastOnePixel =
        Math.abs(object.getX() - oldX) >= 1 ||
        Math.abs(object.getY() - oldY) >= 1;
      this._lastDeltaY = object.getY() - oldY;
    }

    doStepPostEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {}

    private _updateSpeed(timeDelta: float): float {
      const previousSpeed = this._currentSpeed;
      // Change the speed according to the player's input.
      // TODO Give priority to the last key for faster reaction time.
      if (this._leftKey !== this._rightKey) {
        if (this._leftKey) {
          if (this._currentSpeed <= 0) {
            this._currentSpeed -= this._acceleration * timeDelta;
          } else {
            // Turn back at least as fast as it would stop.
            this._currentSpeed -=
              Math.max(this._acceleration, this._deceleration) * timeDelta;
          }
        } else if (this._rightKey) {
          if (this._currentSpeed >= 0) {
            this._currentSpeed += this._acceleration * timeDelta;
          } else {
            this._currentSpeed +=
              Math.max(this._acceleration, this._deceleration) * timeDelta;
          }
        }
      }

      //Take deceleration into account only if no key is pressed.
      if (this._leftKey === this._rightKey) {
        const wasPositive = this._currentSpeed > 0;
        this._currentSpeed -=
          this._deceleration * timeDelta * (wasPositive ? 1.0 : -1.0);

        //Set the speed to 0 if the speed was too low.
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
      // Use Verlet integration.
      return ((this._currentSpeed + previousSpeed) * timeDelta) / 2;
    }

    /**
     * Also see {@link ./README.md}
     */
    private _moveX() {
      const object = this.owner;
      //Move the object on x axis.
      const oldX = object.getX();
      if (this._requestedDeltaX !== 0) {
        let floorPlatformId =
          this._onFloor.getFloorPlatform() !== null
            ? this._onFloor.getFloorPlatform()!.owner.id
            : null;
        object.setX(object.getX() + this._requestedDeltaX);
        let tryRounding = true;

        //Colliding: Try to push out from the solid.
        //Note that jump thru are never obstacle on X axis.
        while (
          this._isCollidingWithOneOf(
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
        }
      }
    }

    private _moveY() {
      const object = this.owner;
      //Move the object on Y axis
      if (this._requestedDeltaY !== 0) {
        if (this._requestedDeltaY > 0) {
          // Use the same method as for following the floor.
          // This is to be consistent on all floor collision.
          // The object will land right on floor.

          const { highestGround } = this._findHighestFloorAndMoveOnTop(
            this._potentialCollidingObjects,
            0,
            this._requestedDeltaY
          );
          if (!highestGround) {
            object.setY(object.getY() + this._requestedDeltaY);
          }
        } else {
          // The same logic could be applied going up one day.
          let oldY = object.getY();
          object.setY(object.getY() + this._requestedDeltaY);

          // Stop when colliding with an obstacle.
          while (
            // Jumpthru == obstacle <=> Never when going up.
            (this._requestedDeltaY < 0 &&
              this._isCollidingWithOneOf(
                this._potentialCollidingObjects,
                null,
                /*excludeJumpThrus=*/
                true
              )) ||
            // Jumpthru == obstacle <=> Only if not already overlapped when going down.
            (this._requestedDeltaY > 0 &&
              this._isCollidingWithOneOfExcluding(
                this._potentialCollidingObjects,
                this._overlappedJumpThru
              ))
          ) {
            if (this._state === this._jumping) {
              this._setFalling();
            }
            if (
              (this._requestedDeltaY > 0 && object.getY() <= oldY) ||
              (this._requestedDeltaY < 0 && object.getY() >= oldY)
            ) {
              object.setY(
                // Unable to move the object without being stuck in an obstacle.
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
    }

    _setFalling() {
      this._state.leave();
      const from = this._state;
      this._state = this._falling;
      this._falling.enter(from);
    }

    _setOnFloor(collidingPlatform: gdjs.PlatformRuntimeBehavior) {
      this._state.leave();
      this._state = this._onFloor;
      this._onFloor.enter(collidingPlatform);
    }

    private _setJumping() {
      this._state.leave();
      const from = this._state;
      this._state = this._jumping;
      this._jumping.enter(from);
    }

    private _setGrabbingPlatform(
      grabbedPlatform: gdjs.PlatformRuntimeBehavior
    ) {
      this._state.leave();
      this._state = this._grabbingPlatform;
      this._grabbingPlatform.enter(grabbedPlatform);
    }

    private _setOnLadder() {
      this._state.leave();
      this._state = this._onLadder;
      this._onLadder.enter();
    }

    _checkTransitionOnLadder() {
      if (this._ladderKey && this._isOverlappingLadder()) {
        this._setOnLadder();
      }
    }

    _checkTransitionJumping() {
      if (this._canJump && this._jumpKey) {
        this._setJumping();
      }
    }

    _checkGrabPlatform() {
      const object = this.owner;

      let oldX = object.getX();
      object.setX(
        object.getX() +
          (this._requestedDeltaX < 0 ||
          (this._requestedDeltaX === 0 && this._lastDirectionIsLeft)
            ? -this._xGrabTolerance
            : this._xGrabTolerance)
      );
      const collidingPlatforms: gdjs.PlatformRuntimeBehavior[] = gdjs.staticArray(
        PlatformerObjectRuntimeBehavior.prototype._checkGrabPlatform
      );
      collidingPlatforms.length = 0;
      for (const platform of this._potentialCollidingObjects) {
        if (this._isCollidingWith(platform) && this._canGrab(platform)) {
          collidingPlatforms.push(platform);
        }
      }
      object.setX(oldX);

      //Check if we can grab the collided platform
      let oldY = object.getY();
      for (const collidingPlatform of collidingPlatforms) {
        object.setY(
          collidingPlatform.owner.getY() +
            collidingPlatform.getYGrabOffset() -
            this._yGrabOffset
        );
        if (
          !this._isCollidingWithOneOf(
            this._potentialCollidingObjects,
            null,
            /*excludeJumpthrus=*/
            true
          )
        ) {
          this._setGrabbingPlatform(collidingPlatform);
          this._requestedDeltaY = 0;
          collidingPlatforms.length = 0;
          return;
        }
        object.setY(oldY);
      }
      collidingPlatforms.length = 0;
    }

    private _checkTransitionOnFloorOrFalling() {
      const object = this.owner;
      const oldY = object.getY();
      // Avoid landing on a platform if the object is not going down.
      // (which could happen for Jumpthru, when the object jump and pass just at the top
      // of a jumpthru, it could be considered as landing if not for this extra check).
      const canLand = this._requestedDeltaY >= 0;

      // The interval could be smaller.
      // It's just for rounding errors.
      const { highestGround } = this._findHighestFloorAndMoveOnTop(
        this._potentialCollidingObjects,
        -1,
        1
      );
      // don't fall if GrabbingPlatform or OnLadder
      if (this._state === this._onFloor) {
        if (!highestGround) {
          this._setFalling();
        } else if (highestGround === this._onFloor.getFloorPlatform()) {
          this._onFloor.updateFloorPosition();
        } else {
          this._setOnFloor(highestGround);
        }
      } else if (highestGround && canLand) {
        this._setOnFloor(highestGround);
      } else {
        // The object can't land.
        object.setY(oldY);
      }
    }

    _fall(timeDelta: float) {
      const previousFallSpeed = this._currentFallSpeed;
      this._currentFallSpeed += this._gravity * timeDelta;
      if (this._currentFallSpeed > this._maxFallingSpeed) {
        this._currentFallSpeed = this._maxFallingSpeed;
      }
      if (this._useLegacyTrajectory) {
        this._requestedDeltaY += this._currentFallSpeed * timeDelta;
      } else {
        // Use Verlet integration.
        this._requestedDeltaY +=
          ((this._currentFallSpeed + previousFallSpeed) / 2) * timeDelta;
      }
    }

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
    private _canGrab(platform: gdjs.PlatformRuntimeBehavior) {
      const y1 = this.owner.getY() + this._yGrabOffset - this._lastDeltaY;
      const y2 = this.owner.getY() + this._yGrabOffset;
      const platformY = platform.owner.getY() + platform.getYGrabOffset();
      // This must be inclusive for at least one position.
      // Otherwise, if the character is at the exact position,
      // it could not be able to grab the platform at any frame.
      return (
        platform.canBeGrabbed() &&
        ((y1 < platformY && platformY <= y2) ||
          (y2 <= platformY && platformY < y1))
      );
    }

    /**
     * Mark the platformer object as not grabbing any platform.
     */
    _releaseGrabbedPlatform() {
      if (this._state === this._grabbingPlatform) {
        this._setFalling();
      }
    }

    /**
     * Mark the platformer object as falling if on a ladder.
     */
    _releaseLadder() {
      if (this._state === this._onLadder) {
        this._setFalling();
      }
    }

    /**
     * Separate the object from all platforms passed in parameter.
     * @param candidates The platform to be tested for collision
     * @param excludeJumpThrus If set to true, jumpthru platforms are excluded. false if not defined.
     * @returns true if the object was moved
     */
    private _separateFromPlatforms(
      candidates: gdjs.PlatformRuntimeBehavior[],
      excludeJumpThrus: boolean
    ) {
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
     * @param exceptThisOne The object identifier of a platform to be excluded from the check. Can be null.
     * @param excludeJumpThrus If set to true, jumpthru platforms are excluded. false if not defined.
     * @returns true if the object collides any platform
     */
    _isCollidingWithOneOf(
      candidates: gdjs.PlatformRuntimeBehavior[],
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
     * Find the highest floor reachable and move the owner on top of it.
     *
     * Also see {@link ./README.md}
     *
     * @param candidates The platform to be tested for collision
     * @param upwardDeltaY The owner won't move upward more than this value.
     * @param downwardDeltaY The owner won't move downward more than this value.
     * @returns the platform where to walk or if an obstacle was found
     */
    _findHighestFloorAndMoveOnTop(
      candidates: gdjs.PlatformRuntimeBehavior[],
      upwardDeltaY: float,
      downwardDeltaY: float
    ): PlatformSearchResult {
      const context = FollowConstraintContext.instance;
      context.initializeBeforeSearch(this, upwardDeltaY, downwardDeltaY);

      let totalHighestY = Number.MAX_VALUE;
      let highestGround: gdjs.PlatformRuntimeBehavior | null = null;
      let isCollidingAnyPlatform = false;
      for (const platform of candidates) {
        if (
          platform.getPlatformType() === gdjs.PlatformRuntimeBehavior.LADDER ||
          // Jump through platforms are obstacles only when the character comes from the top.
          (platform.getPlatformType() ===
            gdjs.PlatformRuntimeBehavior.JUMPTHRU &&
            // When following the floor, jumpthrus that are higher than the character are ignored.
            // If we only look above the character bottom, every jumpthrus can be discarded
            // without doing any collision check.
            ((this._state === this._onFloor &&
              platform !== this._onFloor.getFloorPlatform() &&
              downwardDeltaY < 0) ||
              // When trying to land on a platform, exclude jumpthrus that were already overlapped.
              (this._state !== this._onFloor &&
                this._isIn(this._overlappedJumpThru, platform.owner.id))))
        ) {
          continue;
        }

        const previousAllowedMinDeltaY = context.allowedMinDeltaY;
        const previousAllowedMaxDeltaY = context.allowedMaxDeltaY;
        this._findPlatformHighestRelativeYUnderObject(platform, context);
        let highestRelativeY = context.getFloorDeltaY();
        if (
          platform.getPlatformType() ===
            gdjs.PlatformRuntimeBehavior.JUMPTHRU &&
          // When following the floor, ignore jumpthrus that are higher than the character bottom.
          ((this._state === this._onFloor &&
            platform !== this._onFloor.getFloorPlatform() &&
            highestRelativeY < 0) ||
            // A jumpthrus should never constrain a character to go below.
            // Jumpthrus are considered as obstacles at the 1st frame they are overlapping the character
            // because it allows it to land on them, but they shouldn't push on its head.
            context.allowedMinDeltaY !== previousAllowedMinDeltaY)
        ) {
          // Don't follow jumpthrus that are higher than the character bottom.
          // Revert side effect on the search context.
          context.revertTo(previousAllowedMinDeltaY, previousAllowedMaxDeltaY);
          continue;
        }
        if (context.isCollidingAnyPlatform()) {
          isCollidingAnyPlatform = true;
        }
        if (context.floorIsTooHigh()) {
          // One platform is colliding the character
          // and is too high for the character to walk on.
          // This will still be an obstacle even if there
          // are other platforms that fit the requirements.
          highestGround = null;
          break;
        }

        if (
          context.isCollidingAnyPlatform() &&
          highestRelativeY < totalHighestY
        ) {
          totalHighestY = highestRelativeY;
          highestGround = platform;
        }
      }
      if (highestGround) {
        const object = this.owner;
        object.setY(object.getY() + totalHighestY);
      }
      const returnValue =
        gdjs.PlatformerObjectRuntimeBehavior._platformSearchResult;
      returnValue.highestGround = highestGround;
      returnValue.isCollidingAnyPlatform = isCollidingAnyPlatform;
      return returnValue;
    }

    /**
     * Find the highest Y relative to the owner bottom of the floor reachable by the owner.
     * @param platform The platform to be tested for collision.
     * @param upwardDeltaY The owner won't move upward more than this value.
     * @param downwardDeltaY The owner won't move downward more than this value.
     * @return the search context
     */
    private _findPlatformHighestRelativeYUnderObject(
      platform: gdjs.PlatformRuntimeBehavior,
      context: FollowConstraintContext
    ): FollowConstraintContext {
      const platformObject = platform.owner;
      const platformAABB = platformObject.getAABB();
      if (
        platformAABB.max[0] <= context.ownerMinX ||
        platformAABB.min[0] >= context.ownerMaxX ||
        platformAABB.max[1] <= context.headMinY ||
        platformAABB.min[1] > context.floorMaxY
      ) {
        // No collision
        return context;
      }

      for (const hitbox of platformObject.getHitBoxesAround(
        context.ownerMinX,
        context.headMinY,
        context.ownerMaxX,
        context.floorMaxY
      )) {
        if (hitbox.vertices.length < 3) {
          continue;
        }

        // Edges over the character head might not result to a collision,
        // but if there is also an edge under its head then there is a collision.
        // The platform hitbox could be in several parts.
        // So, the object could walk on one part
        // and have another part over its head.
        // This is why flags are reset between each hitbox.
        context.initializeBeforeHitboxCheck();

        let previousVertex = hitbox.vertices[hitbox.vertices.length - 2];
        let vertex = hitbox.vertices[hitbox.vertices.length - 1];
        for (const nextVertex of hitbox.vertices) {
          // When the character is side by side to a wall,
          // no collision should be detected.
          // Indeed, it only shares an edge so the intersection has no area.
          // But, the character can share a vertex X with a platform
          // when one of them is encompassing the other.
          // This is why the edge direction is checked in this case.
          if (
            // The vertex is strictly into the interval...
            (context.ownerMinX < vertex[0] && vertex[0] < context.ownerMaxX) ||
            // ...or is on a bound but at least one of its edges is from the inside.
            // Note: this needs strict convex hitbox to work.
            (vertex[0] === context.ownerMinX &&
              (previousVertex[0] > vertex[0] || nextVertex[0] > vertex[0])) ||
            (vertex[0] === context.ownerMaxX &&
              (previousVertex[0] < vertex[0] || nextVertex[0] < vertex[0]))
          ) {
            context.addPointConstraint(vertex[1]);
          }

          const deltaX = vertex[0] - previousVertex[0];
          // Vertical edges doesn't matter
          if (deltaX !== 0) {
            // Check intersection on the left side of owner
            if (
              (vertex[0] < context.ownerMinX &&
                context.ownerMinX < previousVertex[0]) ||
              (previousVertex[0] < context.ownerMinX &&
                context.ownerMinX < vertex[0])
            ) {
              const deltaY = vertex[1] - previousVertex[1];
              const intersectionY =
                previousVertex[1] +
                ((context.ownerMinX - previousVertex[0]) * deltaY) / deltaX;

              context.addPointConstraint(intersectionY);
            }
            // Check intersection on the right side of owner
            if (
              (vertex[0] < context.ownerMaxX &&
                context.ownerMaxX < previousVertex[0]) ||
              (previousVertex[0] < context.ownerMaxX &&
                context.ownerMaxX < vertex[0])
            ) {
              const deltaY = vertex[1] - previousVertex[1];
              const intersectionY =
                previousVertex[1] +
                ((context.ownerMaxX - previousVertex[0]) * deltaY) / deltaX;

              context.addPointConstraint(intersectionY);
            }
          }
          if (context.floorIsTooHigh()) {
            // The character can't follow the platforms.
            // No need to continue the search.
            return context;
          }
          previousVertex = vertex;
          vertex = nextVertex;
        }
      }
      return context;
    }

    /**
     * Among the platforms passed in parameter, return true if there is a platform colliding with the object.
     * Ladders are *always* excluded from the test.
     * @param candidates The platform to be tested for collision
     * @param exceptTheseOnes The platforms to be excluded from the test
     */
    private _isCollidingWithOneOfExcluding(
      candidates: gdjs.PlatformRuntimeBehavior[],
      exceptTheseOnes: gdjs.PlatformRuntimeBehavior[]
    ) {
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
     * Return true if the platform is colliding with the behavior owner object.
     * Overlapped jump thru and ladders are excluded.
     * @param platform The platform to be tested for collision
     */
    private _isCollidingWith(platform: gdjs.PlatformRuntimeBehavior): boolean {
      return (
        platform.getPlatformType() !== gdjs.PlatformRuntimeBehavior.LADDER &&
        !this._isIn(this._overlappedJumpThru, platform.owner.id) &&
        gdjs.RuntimeObject.collisionTest(
          this.owner,
          platform.owner,
          this._ignoreTouchingEdges
        )
      );
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
    _isOverlappingLadder() {
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

    _isIn(platformArray: gdjs.PlatformRuntimeBehavior[], id: integer) {
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
    private _updatePotentialCollidingObjects(maxMovementLength: float) {
      const object = this.owner;

      this._manager.getAllPlatformsAround(
        object,
        maxMovementLength,
        this._potentialCollidingObjects
      );

      // Filter the potential colliding platforms to ensure that the object owning the behavior
      // is not considered as colliding with itself, in the case that it also has the
      // platform behavior.
      for (let i = 0; i < this._potentialCollidingObjects.length; ) {
        if (this._potentialCollidingObjects[i].owner === object) {
          this._potentialCollidingObjects.splice(i, 1);
        } else {
          i++;
        }
      }
    }

    /**
     * Simulate a control action in the Platformer Object by specifying an input.
     * @param input The string expression of the control action [Left,Right,Up,Down,Ladder,Jump,Release,Release Ladder].
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
        this._releasePlatformKey = true;
      } else if (input === 'Release Ladder') {
        this._releaseLadderKey = true;
      }
    }

    /**.
     * @param input The control to be tested [Left,Right,Up,Down,Ladder,Jump,Release,Release Ladder].
     * @returns true if the key was used since the last `doStepPreEvents` call.
     */
    isUsingControl(input: string): boolean {
      if (input === 'Left') {
        return this._wasLeftKeyPressed;
      }
      if (input === 'Right') {
        return this._wasRightKeyPressed;
      }
      if (input === 'Up') {
        return this._wasUpKeyPressed;
      }
      if (input === 'Down') {
        return this._wasDownKeyPressed;
      }
      if (input === 'Ladder') {
        return this._wasLadderKeyPressed;
      }
      if (input === 'Jump') {
        return this._wasJumpKeyPressed;
      }
      if (input === 'Release') {
        return this._wasReleasePlatformKeyPressed;
      }
      if (input === 'Release Ladder') {
        return this._wasReleaseLadderKeyPressed;
      }
      return false;
    }

    /**
     * Get the gravity of the Platformer Object.
     * @returns The current gravity.
     */
    getGravity(): float {
      return this._gravity;
    }

    /**
     * Get maximum angle of a slope for the Platformer Object to run on it as a floor.
     * @returns the slope maximum angle, in degrees.
     */
    getSlopeMaxAngle(): float {
      return this._slopeMaxAngle;
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
     * Set the current speed of the Platformer Object.
     * @param currentSpeed The current speed.
     */
    setCurrentSpeed(currentSpeed: float): void {
      this._currentSpeed = gdjs.evtTools.common.clamp(
        currentSpeed,
        -this._maxSpeed,
        this._maxSpeed
      );
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
     * @param tryToPreserveAirSpeed If true and if jumping, tune the current jump speed to preserve the overall speed in the air.
     */
    setMaxFallingSpeed(
      maxFallingSpeed: float,
      tryToPreserveAirSpeed: boolean = false
    ): void {
      if (tryToPreserveAirSpeed && this._state === this._jumping) {
        // If the falling speed is too high compared to the new max falling speed,
        // reduce it and adapt the jump speed to preserve the overall vertical speed.
        const fallingSpeedOverflow = this._currentFallSpeed - maxFallingSpeed;
        if (fallingSpeedOverflow > 0) {
          this._currentFallSpeed -= fallingSpeedOverflow;
          this._jumping.setCurrentJumpSpeed(
            Math.max(
              0,
              this._jumping.getCurrentJumpSpeed() - fallingSpeedOverflow
            )
          );
        }
      }
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
      if (slopeMaxAngle === 45) {
        this._slopeClimbingFactor = 1;
      } else {
        this._slopeClimbingFactor = Math.tan(
          (slopeMaxAngle * 3.1415926) / 180.0
        );
      }

      // Avoid a `_slopeClimbingFactor` set to exactly 0.
      // Otherwise, this can lead the floor finding functions to consider
      // a floor to be "too high" to reach, even if the object is very slightly
      // inside it, which can happen because of rounding errors.
      // See "Floating-point error mitigations" tests.
      if (this._slopeClimbingFactor < 1 / 1024) {
        this._slopeClimbingFactor = 1 / 1024;
      }
    }

    /**
     * Allow the Platformer Object to jump again.
     */
    setCanJump(): void {
      this._canJump = true;
    }

    /**
     * Forbid the Platformer Object to air jump.
     */
    setCanNotAirJump(): void {
      if (this._state === this._jumping || this._state === this._falling) {
        this._canJump = false;
      }
    }

    /**
     * Abort the current jump.
     *
     * When the character is not in the jumping state this method has no effect.
     */
    abortJump(): void {
      if (this._state === this._jumping) {
        this._currentFallSpeed = 0;
        this._setFalling();
      }
    }

    /**
     * Set the current fall speed.
     *
     * When the character is not in the falling state this method has no effect.
     */
    setCurrentFallSpeed(currentFallSpeed: float) {
      if (this._state === this._falling) {
        this._currentFallSpeed = gdjs.evtTools.common.clamp(
          currentFallSpeed,
          0,
          this._maxFallingSpeed
        );
      }
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
     * Simulate the "Release Ladder" control of the Platformer Object.
     */
    simulateReleaseLadderKey() {
      this._releaseLadderKey = true;
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
    simulateReleasePlatformKey() {
      this._releasePlatformKey = true;
    }

    /**
     * Check if the Platformer Object is on a floor.
     * @returns Returns true if on a floor and false if not.
     */
    isOnFloor(): boolean {
      return this._state === this._onFloor;
    }

    /**
     * Check if the Platformer Object is on the given object.
     * @returns Returns true if on the object and false if not.
     */
    isOnFloorObject(object: gdjs.RuntimeObject): boolean {
      if (this.isOnFloor()) {
        const floorPlatform = this._onFloor.getFloorPlatform();
        return !!floorPlatform && floorPlatform.owner.id === object.id;
      }
      return false;
    }

    /**
     * Check if the Platformer Object is on a ladder.
     * @returns Returns true if on a ladder and false if not.
     */
    isOnLadder(): boolean {
      return this._state === this._onLadder;
    }

    /**
     * Check if the Platformer Object is jumping.
     * @returns Returns true if jumping and false if not.
     */
    isJumping(): boolean {
      return this._state === this._jumping;
    }

    /**
     * Check if the Platformer Object is grabbing a platform.
     * @returns Returns true if a platform is grabbed and false if not.
     */
    isGrabbingPlatform(): boolean {
      return this._state === this._grabbingPlatform;
    }

    /**
     * Check if the Platformer Object is in the falling state. This is false
     * if the object is jumping, even if the object is going down after reaching
     * the jump peak.
     * @returns Returns true if it is falling and false if not.
     */
    isFallingWithoutJumping(): boolean {
      return this._state === this._falling;
    }

    /**
     * Check if the Platformer Object is "going down", either because it's in the
     * falling state *or* because it's jumping but reached the jump peak and
     * is now going down (because the jump speed can't compensate anymore the
     * falling speed).
     *
     * If you want to check if the object is falling outside of a jump (or because
     * the jump is entirely finished and there is no jump speed applied to the object
     * anymore), consider using `isFallingWithoutJumping`.
     *
     * @returns Returns true if it is "going down" and false if not.
     */
    isFalling(): boolean {
      return (
        this._state === this._falling ||
        (this._state === this._jumping &&
          this._currentFallSpeed > this._jumping.getCurrentJumpSpeed())
      );
    }

    /**
     * Check if the Platformer Object is moving.
     *
     * When walking or climbing on a ladder,
     * a speed of less than one pixel per frame won't be detected.
     *
     * @returns Returns true if it is moving and false if not.
     * @deprecated use isMovingEvenALittle instead
     */
    isMoving(): boolean {
      return (
        (this._hasMovedAtLeastOnePixel &&
          (this._currentSpeed !== 0 || this._state === this._onLadder)) ||
        this._jumping.getCurrentJumpSpeed() !== 0 ||
        this._currentFallSpeed !== 0
      );
    }

    /**
     * Check if the Platformer Object is moving.
     * @returns Returns true if it is moving and false if not.
     */
    isMovingEvenALittle(): boolean {
      return (
        (this._hasReallyMoved &&
          (this._currentSpeed !== 0 || this._state === this._onLadder)) ||
        this._jumping.getCurrentJumpSpeed() !== 0 ||
        this._currentFallSpeed !== 0
      );
    }
  }

  /**
   * The object can take 5 states: OnFloor, Falling, Jumping, GrabbingPlatform and OnLadder.
   * The implementations of this interface hold the specific behaviors and internal state of theses 5 states.
   * @see PlatformerObjectRuntimeBehavior.doStepPreEvents to understand how the functions are called.
   */
  interface State {
    /**
     * Called when the object leaves this state.
     * It's a good place to reset the internal state.
     * @see OnFloor.enter that is not part of the interface because it takes specific parameters.
     */
    leave(): void;
    /**
     * Called before the obstacle search.
     * The object position may need adjustments to handle external changes.
     */
    beforeUpdatingObstacles(timeDelta: float): void;
    /**
     * Check if transitions to other states are needed and apply them before moving horizontally.
     */
    checkTransitionBeforeX(): void;
    /**
     * Use _requestedDeltaX and _requestedDeltaY to choose the movement that suits the state before moving horizontally.
     */
    beforeMovingX(): void;
    /**
     * Check if transitions to other states are needed and apply them before moving vertically.
     */
    checkTransitionBeforeY(timeDelta: float): void;
    /**
     * Use _requestedDeltaY to choose the movement that suits the state before moving vertically.
     */
    beforeMovingY(timeDelta: float, oldX: float): void;
  }

  /**
   * The object is on the floor standing or walking.
   *
   * Also see {@link ./README.md}
   */
  class OnFloor implements State {
    private _behavior: PlatformerObjectRuntimeBehavior;
    private _floorPlatform: gdjs.PlatformRuntimeBehavior | null = null;
    private _floorLastX: float = 0;
    private _floorLastY: float = 0;
    _oldHeight: float = 0;

    constructor(behavior: PlatformerObjectRuntimeBehavior) {
      this._behavior = behavior;
    }

    getFloorPlatform() {
      return this._floorPlatform;
    }

    enter(floorPlatform: gdjs.PlatformRuntimeBehavior) {
      this._floorPlatform = floorPlatform;
      this.updateFloorPosition();
      this._behavior._canJump = true;
      this._behavior._currentFallSpeed = 0;
    }

    leave() {
      this._floorPlatform = null;
    }

    updateFloorPosition() {
      this._floorLastX = this._floorPlatform!.owner.getX();
      this._floorLastY = this._floorPlatform!.owner.getY();
    }

    beforeUpdatingObstacles(timeDelta: float) {
      const object = this._behavior.owner;
      // Stick the object to the floor if its height has changed.
      if (this._oldHeight !== object.getHeight()) {
        // TODO This should probably be done after the events because
        // the character stays at the wrong place during 1 frame.
        const deltaY =
          ((this._oldHeight - object.getHeight()) *
            (object.getHeight() + object.getDrawableY() - object.getY())) /
          object.getHeight();
        object.setY(object.getY() + deltaY);
      }
      // Directly follow the floor movement on the Y axis by moving the character.
      // For the X axis, we follow the floor movement using `_requestedDeltaX`
      // (see `beforeMovingX`).
      // We don't use `_requestedDeltaY` to follow the floor on the Y axis
      // to avoid a transition loop with the Falling state.
      // Indeed, if we used it, then:
      // - going down, the character could no longer be on a platform and start falling.
      // - going up, the character will already be pushed on top on the platform
      //   by `beforeMovingY` that handle slopes or by `_separateFromPlatforms` that
      //   avoid characters being stuck. So using `_requestedDeltaY`, the character
      //   would be going too much higher and fall at the next frame.
      //
      // We could make the character follow a platform moving up
      // at a greater speed as it's coherent from a physics point of view.
      // But, when the character is put on top of the platform to follow it up,
      // the platform AABB may not be updated in RBush yet
      // and the platform can go out of the spatial search rectangle
      // even though they are next to each other, which means
      // that the character will fall.
      const deltaY = this._floorPlatform!.owner.getY() - this._floorLastY;
      if (
        deltaY !== 0 &&
        Math.abs(deltaY) <=
          Math.abs(this._behavior._maxFallingSpeed * timeDelta)
      ) {
        object.setY(object.getY() + deltaY);
      }
    }

    checkTransitionBeforeX() {
      const behavior = this._behavior;
      // Check that the floor object still exists and is near the object.
      if (
        !behavior._isIn(
          behavior._potentialCollidingObjects,
          this._floorPlatform!.owner.id
        )
      ) {
        behavior._setFalling();
      } else if (
        this._behavior._downKey &&
        this._floorPlatform!._platformType ===
          gdjs.PlatformRuntimeBehavior.JUMPTHRU &&
        behavior._canGoDownFromJumpthru
      ) {
        behavior._overlappedJumpThru.push(this._floorPlatform!);
        behavior._setFalling();
      }

      // It was originally in checkTransitionBeforeY.
      // The character is ignoring the floor when moving on X to be able to
      // follow up a slope when moving Y (it enter inside it).
      // When the current floor and the wall the character is facing is part of
      // the same instance, the wall is also ignored when moving on X, but the
      // wall is too high to follow and it is seen as colliding an obstacle
      // from behind.
      // Moving against a wall before jumping in this configuration was making
      // jumps being aborted.
      behavior._checkTransitionJumping();
    }

    beforeMovingX() {
      const behavior = this._behavior;
      // Shift the object according to the floor movement.
      behavior._requestedDeltaX +=
        this._floorPlatform!.owner.getX() - this._floorLastX;
      // See `beforeUpdatingObstacles` for the logic for the Y axis.
    }

    checkTransitionBeforeY(timeDelta: float) {
      const behavior = this._behavior;
      // Go on a ladder
      behavior._checkTransitionOnLadder();
    }

    beforeMovingY(timeDelta: float, oldX: float) {
      const behavior = this._behavior;
      const object = behavior.owner;

      if (object.getX() === oldX + behavior._requestedDeltaX) {
        // The character didn't encounter any obstacles on the X axis.
        // It follows the floor.

        // In theory, this max delta on the Y axis could be 0. In practice,
        // `behavior._slopeClimbingFactor` has a lower bound of 1 / 1024.
        // This avoids this max delta Y to be strictly 0, which would then risk
        // considering a floor "too high", even if the object is inside it because
        // of a very small rounding error.
        // See "Floating-point error mitigations" tests.
        const deltaMaxY = Math.abs(
          behavior._requestedDeltaX * behavior._slopeClimbingFactor
        );
        const {
          highestGround,
          isCollidingAnyPlatform,
        } = behavior._findHighestFloorAndMoveOnTop(
          behavior._potentialCollidingObjects,
          -deltaMaxY,
          deltaMaxY
        );
        if (highestGround && highestGround !== this._floorPlatform) {
          behavior._setOnFloor(highestGround);
        }
        if (highestGround === null && isCollidingAnyPlatform) {
          // Unable to follow the floor (too steep): go back to the original position.
          behavior.owner.setX(oldX);
        }
      } else {
        // The character encountered an obstacle on the X axis.
        // Try to walk on it or stop before it.

        // Try to follow the platform until the obstacle.
        const {
          highestGround: highestGroundOnPlatform,
          isCollidingAnyPlatform,
        } = behavior._findHighestFloorAndMoveOnTop(
          behavior._potentialCollidingObjects,
          Math.min(
            0,
            -Math.abs(object.getX() - oldX) * behavior._slopeClimbingFactor
          ),
          0
        );
        if (highestGroundOnPlatform === null && isCollidingAnyPlatform) {
          // Unable to follow the floor (too steep): go back to the original position.
          behavior.owner.setX(oldX);
        } else {
          const requestedDeltaX = behavior._requestedDeltaX;
          // The current platform is climbed.
          // Can the obstacle be climbed too from here?
          // We do a look-up in 2 steps:
          // 1. Try to move 1 pixel on X to climb the junction
          //    (because the obstacle detection is done 1 pixel by 1 pixel).
          // 2. Try to follow the obstacle slope by at least 1 pixel on X axis
          //    (it can only be done after the junction because otherwise
          //    the slope angle would be a mean between the current platform and
          //    the obstacles).
          //
          // The 2nd step is done using a 1 pixel width at least, when remainingDeltaX
          // is less than 2 pixels: this will be a "lookahead". This is to ensure
          // the character doesn't start to climb a slope it actually can't.
          const remainingDeltaX = requestedDeltaX - (object.getX() - oldX);
          const beforeObstacleY = object.getY();
          const beforeObstacleX = object.getX();

          // 1. Try to move 1 pixel on the X axis to climb the junction.
          object.setX(object.getX() + Math.sign(requestedDeltaX));
          const {
            highestGround: highestGroundAtJunction,
          } = behavior._findHighestFloorAndMoveOnTop(
            behavior._potentialCollidingObjects,
            // Look up from at least 1 pixel to bypass not perfectly aligned floors.
            Math.min(-1, -1 * behavior._slopeClimbingFactor),
            0
          );
          if (highestGroundAtJunction) {
            // The obstacle 1st pixel can be climbed.
            // Now that the character is on the obstacle,
            // try to follow the slope for at least 1 pixel.
            const deltaX =
              Math.sign(requestedDeltaX) *
              Math.max(
                1,
                // - 1, because the owner moved from 1 pixel at the junction.
                Math.abs(remainingDeltaX) - 1
              );
            object.setX(object.getX() + deltaX);
            const {
              highestGround: highestGroundOnObstacle,
            } = behavior._findHighestFloorAndMoveOnTop(
              behavior._potentialCollidingObjects,
              // Do an exact slope angle check.
              -Math.abs(deltaX) * behavior._slopeClimbingFactor,
              0
            );
            if (highestGroundOnObstacle) {
              // The obstacle slope can be climbed.
              if (Math.abs(remainingDeltaX) >= 2) {
                behavior._setOnFloor(highestGroundOnObstacle);
              } else {
                // We went too far in order to check that.
                // Now, find the right position on the obstacles.
                object.setPosition(oldX + requestedDeltaX, beforeObstacleY);
                const {
                  highestGround: highestGroundOnObstacle,
                } = behavior._findHighestFloorAndMoveOnTop(
                  behavior._potentialCollidingObjects,
                  // requestedDeltaX can be small when the object start moving.
                  // So, look up from at least 1 pixel to bypass not perfectly aligned floors.
                  Math.min(
                    -1,
                    -Math.abs(remainingDeltaX) * behavior._slopeClimbingFactor
                  ),
                  0
                );
                // Should always be true
                if (highestGroundOnObstacle) {
                  behavior._setOnFloor(highestGroundOnObstacle);
                }
              }
            } else {
              // Don't climb on the obstacle
              // because the obstacle slope is too steep.
              if (
                Math.sign(beforeObstacleX - oldX) === Math.sign(requestedDeltaX)
              ) {
                object.setPosition(beforeObstacleX, beforeObstacleY);
              } else {
                // Avoid to go backward
                object.setPosition(oldX, beforeObstacleY);
              }
              behavior._currentSpeed = 0;
            }
          } else {
            // Don't climb on the obstacle
            // because the obstacle 1st pixel is more than 1 pixel high (or too steep).
            if (
              Math.sign(beforeObstacleX - oldX) === Math.sign(requestedDeltaX)
            ) {
              object.setPosition(beforeObstacleX, beforeObstacleY);
            } else {
              // Avoid to go backward
              object.setPosition(oldX, beforeObstacleY);
            }
            behavior._currentSpeed = 0;
          }
        }
      }
    }

    toString(): String {
      return 'OnFloor';
    }
  }

  /**
   * The object is falling.
   */
  class Falling implements State {
    private _behavior: PlatformerObjectRuntimeBehavior;

    constructor(behavior: PlatformerObjectRuntimeBehavior) {
      this._behavior = behavior;
    }

    enter(from: State) {
      // Only forbid jumping when starting to fall from a platform,
      // not when falling during a jump. This is because the Jumping
      // state has already set `_canJump` to false and we don't want to reset
      // it again because it could have been set back to `true` to allow
      // for an "air jump".
      // Transition from Falling to Falling state should not happen,
      // but don't change anything if this ever happen.
      if (from !== this._behavior._jumping && from !== this) {
        this._behavior._canJump = false;
      }
    }

    leave() {}

    beforeUpdatingObstacles(timeDelta: float) {}

    checkTransitionBeforeX() {}

    beforeMovingX() {}

    checkTransitionBeforeY(timeDelta: float) {
      const behavior = this._behavior;
      // Go on a ladder
      behavior._checkTransitionOnLadder();
      // Jumping
      behavior._checkTransitionJumping();

      // Grabbing a platform
      if (
        behavior._canGrabPlatforms &&
        (behavior._requestedDeltaX !== 0 || behavior._canGrabWithoutMoving)
      ) {
        behavior._checkGrabPlatform();
      }
    }

    beforeMovingY(timeDelta: float, oldX: float) {
      //Fall
      this._behavior._fall(timeDelta);
    }

    toString(): String {
      return 'Falling';
    }
  }

  /**
   * The object is on the ascending and descending part of the jump.
   * The object is considered falling when the jump continue to a lower position than the initial one.
   */
  class Jumping implements State {
    private _behavior: PlatformerObjectRuntimeBehavior;
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

    setCurrentJumpSpeed(currentJumpSpeed: number) {
      this._currentJumpSpeed = currentJumpSpeed;
    }

    enter(from: State) {
      const behavior = this._behavior;
      this._timeSinceCurrentJumpStart = 0;
      this._jumpKeyHeldSinceJumpStart = true;

      if (from !== behavior._jumping && from !== behavior._falling) {
        this._jumpingFirstDelta = true;
      }

      behavior._canJump = false;
      this._currentJumpSpeed = behavior._jumpSpeed;
      behavior._currentFallSpeed = 0;
    }

    leave() {
      this._currentJumpSpeed = 0;
    }

    beforeUpdatingObstacles(timeDelta: float) {}

    checkTransitionBeforeX() {}

    beforeMovingX() {}

    checkTransitionBeforeY(timeDelta: float) {
      const behavior = this._behavior;
      // Go on a ladder
      behavior._checkTransitionOnLadder();
      // Jumping
      behavior._checkTransitionJumping();

      // Grabbing a platform
      if (
        behavior._canGrabPlatforms &&
        (behavior._requestedDeltaX !== 0 || behavior._canGrabWithoutMoving) &&
        behavior._lastDeltaY >= 0
      ) {
        behavior._checkGrabPlatform();
      }
    }

    beforeMovingY(timeDelta: float, oldX: float) {
      const behavior = this._behavior;

      // Check if the jump key is continuously held since
      // the beginning of the jump.
      if (!behavior._jumpKey) {
        this._jumpKeyHeldSinceJumpStart = false;
      }
      this._timeSinceCurrentJumpStart += timeDelta;

      const previousJumpSpeed = this._currentJumpSpeed;
      // Decrease jump speed after the (optional) jump sustain time is over.
      const sustainJumpSpeed =
        this._jumpKeyHeldSinceJumpStart &&
        this._timeSinceCurrentJumpStart < behavior._jumpSustainTime;
      if (!sustainJumpSpeed) {
        this._currentJumpSpeed -= behavior._gravity * timeDelta;
      }

      if (this._behavior._useLegacyTrajectory) {
        behavior._requestedDeltaY -= previousJumpSpeed * timeDelta;

        // Fall
        // The condition is a legacy thing.
        // There is no actual reason not to fall at 1st frame.
        // Before a refactoring, it used to not be this obvious.
        if (!this._jumpingFirstDelta) {
          behavior._fall(timeDelta);
        }
      } else {
        // Use Verlet integration.
        behavior._requestedDeltaY +=
          ((-previousJumpSpeed - this._currentJumpSpeed) / 2) * timeDelta;

        // Fall
        behavior._fall(timeDelta);
      }
      this._jumpingFirstDelta = false;

      if (this._currentJumpSpeed < 0) {
        behavior._setFalling();
      }
    }

    toString(): String {
      return 'Jumping';
    }
  }

  /**
   * The object grabbed the edge of a platform and is standing there.
   */
  class GrabbingPlatform implements State {
    private _behavior: PlatformerObjectRuntimeBehavior;
    private _grabbedPlatform: any = null;
    private _grabbedPlatformLastX: any;
    private _grabbedPlatformLastY: any;

    constructor(behavior: PlatformerObjectRuntimeBehavior) {
      this._behavior = behavior;
    }

    enter(grabbedPlatform: gdjs.PlatformRuntimeBehavior) {
      this._grabbedPlatform = grabbedPlatform;
      this._behavior._canJump = true;
      this._behavior._currentFallSpeed = 0;
    }

    leave() {
      this._grabbedPlatform = null;
    }

    beforeUpdatingObstacles(timeDelta: float) {}

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
      // this erases any other movement
      behavior._requestedDeltaX =
        this._grabbedPlatform.owner.getX() - this._grabbedPlatformLastX;
      behavior._requestedDeltaY =
        this._grabbedPlatform.owner.getY() - this._grabbedPlatformLastY;
    }

    checkTransitionBeforeY(timeDelta: float) {
      const behavior = this._behavior;
      //Go on a ladder
      behavior._checkTransitionOnLadder();

      //Release the platform
      if (behavior._releasePlatformKey) {
        behavior._releaseGrabbedPlatform();
      }

      //Jumping
      behavior._checkTransitionJumping();
    }

    beforeMovingY(timeDelta: float, oldX: float) {
      this._grabbedPlatformLastX = this._grabbedPlatform.owner.getX();
      this._grabbedPlatformLastY = this._grabbedPlatform.owner.getY();
    }

    toString(): String {
      return 'GrabbingPlatform';
    }
  }

  /**
   * The object grabbed a ladder. It can stand or move in 8 directions.
   */
  class OnLadder implements State {
    private _behavior: PlatformerObjectRuntimeBehavior;

    constructor(behavior: PlatformerObjectRuntimeBehavior) {
      this._behavior = behavior;
    }

    enter() {
      this._behavior._canJump = true;
      this._behavior._currentFallSpeed = 0;
    }

    leave() {}

    beforeUpdatingObstacles(timeDelta: float) {}

    checkTransitionBeforeX() {}

    beforeMovingX() {}

    checkTransitionBeforeY(timeDelta: float) {
      const behavior = this._behavior;
      //Coming to an extremity of a ladder
      if (!behavior._isOverlappingLadder()) {
        behavior._setFalling();
      }

      //Jumping
      behavior._checkTransitionJumping();

      //Release the ladder
      if (behavior._releaseLadderKey) {
        behavior._releaseLadder();
      }
    }

    beforeMovingY(timeDelta: float, oldX: float) {
      const behavior = this._behavior;

      // TODO: we could consider supporting acceleration for ladder climbing in the future.
      if (behavior._upKey) {
        behavior._requestedDeltaY -= behavior._ladderClimbingSpeed * timeDelta;
      }
      if (behavior._downKey) {
        behavior._requestedDeltaY += behavior._ladderClimbingSpeed * timeDelta;
      }
    }

    toString(): String {
      return 'OnLadder';
    }
  }

  /**
   * A context used to search for a floor.
   */
  class FollowConstraintContext {
    static readonly instance: FollowConstraintContext = new FollowConstraintContext();
    /**
     * Character right side
     *
     * (constant to a search)
     */
    ownerMinX: float = 0;
    /**
     * Character left side
     *
     * (constant to a search)
     */
    ownerMaxX: float = 0;
    /**
     * The maximum top position the character top can go.
     *
     * (constant to a search)
     */
    headMinY: float = 0;
    /**
     * Character top
     *
     * (constant to a search)
     */
    ownerMinY: float = 0;
    /**
     * The maximum bottom position the character top can go.
     *
     * (constant to a search)
     */
    headMaxY: float = 0;
    /**
     * The maximum top position the character bottom can go.
     *
     * (constant to a search)
     */
    floorMinY: float = 0;
    /**
     * Character bottom
     *
     * (constant to a search)
     */
    ownerMaxY: float = 0;
    /**
     * The maximum bottom position the character bottom can go.
     *
     * (constant to a search)
     */
    floorMaxY: float = 0;

    /**
     * The minimum upward delta according to already checked platforms.
     *
     * (a result of the search)
     */
    allowedMinDeltaY: float = 0;
    /**
     * The maximum downward delta according to already checked platforms.
     *
     * (a result of the search)
     */
    allowedMaxDeltaY: float = 0;

    /**
     * True if any edge has been found over where the character top can go (downward).
     *
     * It allows to check for encompassing platforms.
     *
     * (local to one hitbox check)
     */
    foundOverHead: boolean = false;
    /**
     * True if any edge has been found under where the character bottom can go (upward).
     *
     * It allows to check for encompassing platforms.
     *
     * (local to one hitbox check)
     */
    foundUnderBottom: boolean = false;

    initializeBeforeSearch(
      behavior: PlatformerObjectRuntimeBehavior,
      upwardDeltaY: float,
      downwardDeltaY: float
    ) {
      let ownerMinX = Number.MAX_VALUE;
      let ownerMaxX = -Number.MAX_VALUE;
      let ownerMinY = Number.MAX_VALUE;
      let ownerMaxY = -Number.MAX_VALUE;
      for (const hitBox of behavior.owner.getHitBoxes()) {
        for (const vertex of hitBox.vertices) {
          ownerMinX = Math.min(ownerMinX, vertex[0]);
          ownerMaxX = Math.max(ownerMaxX, vertex[0]);
          ownerMinY = Math.min(ownerMinY, vertex[1]);
          ownerMaxY = Math.max(ownerMaxY, vertex[1]);
        }
      }

      this.ownerMinX = ownerMinX;
      this.ownerMaxX = ownerMaxX;
      this.headMinY = ownerMinY + upwardDeltaY;
      this.ownerMinY = ownerMinY;
      this.headMaxY = ownerMinY + downwardDeltaY;
      this.floorMinY = ownerMaxY + upwardDeltaY;
      this.ownerMaxY = ownerMaxY;
      this.floorMaxY = ownerMaxY + downwardDeltaY;

      this.allowedMinDeltaY = upwardDeltaY;
      // Number.MAX_VALUE and not downwardDeltaY
      // because it would means that a platform was found.
      // see isCollidingAnyPlatform()
      this.allowedMaxDeltaY = Number.MAX_VALUE;
    }

    initializeBeforeHitboxCheck() {
      this.foundOverHead = false;
      this.foundUnderBottom = false;
    }

    /**
     * Revert the search variables to a given state.
     *
     * This is used to revert side effect of jumpthru check.
     * @param previousAllowedMinDeltaY
     * @param previousAllowedMaxDeltaY
     */
    revertTo(previousAllowedMinDeltaY: float, previousAllowedMaxDeltaY: float) {
      // Other members are either constants or local to an hitbox search.
      this.allowedMinDeltaY = previousAllowedMinDeltaY;
      this.allowedMaxDeltaY = previousAllowedMaxDeltaY;
    }

    setFloorIsTooHigh() {
      this.allowedMinDeltaY = Number.MAX_VALUE;
      this.allowedMaxDeltaY = -Number.MAX_VALUE;
    }

    floorIsTooHigh(): boolean {
      // Return true when the 2 constraints are incompatible.
      return this.allowedMinDeltaY > this.allowedMaxDeltaY;
    }

    isCollidingAnyPlatform(): boolean {
      return this.ownerMaxY + this.allowedMaxDeltaY <= this.floorMaxY;
    }

    getFloorDeltaY(): float {
      return this.allowedMaxDeltaY;
    }

    /**
     * Check if the character can follow a given Y or move not to touch it
     * and update the context with this new constraint.
     * @param y
     */
    addPointConstraint(y: float): void {
      if (y < this.floorMinY) {
        // The platform is too high to walk on...
        if (y > this.headMaxY) {
          // ...but not over the object.
          this.setFloorIsTooHigh();
          return;
        }
        // ...but over the object.
        this.foundOverHead = true;
        if (this.foundUnderBottom) {
          // The current hitbox is below and above at the same time.
          // As hitboxes are convex, the platform overlaps the character.
          this.setFloorIsTooHigh();
          return;
        }
        // When there is a platform on the top,
        // the character is constraint on how high
        // he can follow a floor.
        this.allowedMinDeltaY = Math.max(
          this.allowedMinDeltaY,
          y - this.ownerMinY
        );
      } else {
        // The platform can be walked on.
        this.foundUnderBottom = true;
        if (this.foundOverHead) {
          // The current hitbox is below and above at the same time.
          // As hitboxes are convex, the platform overlaps the character.
          this.setFloorIsTooHigh();
          return;
        }
        // Add the vertex to the constraints.
        // When there is a platform on the bottom,
        // the character is constraint on how low
        // he can follow a floor.
        this.allowedMaxDeltaY = Math.min(
          this.allowedMaxDeltaY,
          y - this.ownerMaxY
        );
      }
    }
  }

  gdjs.registerBehavior(
    'PlatformBehavior::PlatformerObjectBehavior',
    gdjs.PlatformerObjectRuntimeBehavior
  );
}
