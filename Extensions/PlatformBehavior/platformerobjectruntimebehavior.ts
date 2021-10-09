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
     * The platform is not colliding the character.
     *
     * Number.MAX_VALUE
     */
    private static readonly _noCollision = Number.MAX_VALUE;
    /**
     * The platform is colliding the character
     * and is too high for the character to walk on.
     *
     * -Number.MAX_VALUE
     */
    private static readonly _floorIsTooHigh = -Number.MAX_VALUE;

    // To achieve pixel-perfect precision when positioning object on platform or
    // handling collision with "walls", edges of the hitboxes must be ignored during
    // collision checks, so that two overlapping edges are not considered as colliding.
    // For example, if a character is 10px width and is at position (0, 0), it must not be
    // considered as colliding with a platform which is at position (10, 0). Edges will
    // still be overlapping (because character hitbox right edge is at X position 10 and
    // platform hitbox left edge is also at X position 10).
    // This parameter "_ignoreTouchingEdges" will be passed to all collision handling functions.
    _ignoreTouchingEdges: boolean = true;
    _gravity: float;
    _maxFallingSpeed: float;
    _ladderClimbingSpeed: float;
    private _acceleration: float;
    private _deceleration: float;
    private _maxSpeed: float;
    _jumpSpeed: float;
    _canGrabPlatforms: boolean;
    private _yGrabOffset: any;
    private _xGrabTolerance: any;
    _jumpSustainTime: float;
    _currentFallSpeed: float = 0;
    _currentSpeed: float = 0;
    _canJump: boolean = false;

    private _ignoreDefaultControls: boolean;
    private _leftKey: boolean = false;
    private _rightKey: boolean = false;
    private _ladderKey: boolean = false;
    _upKey: boolean = false;
    _downKey: boolean = false;
    _jumpKey: boolean = false;
    _releasePlatformKey: boolean = false;
    _releaseLadderKey: boolean = false;

    private _state: State;
    _falling: Falling;
    _onFloor: OnFloor;
    _jumping: Jumping;
    _grabbingPlatform: GrabbingPlatform;
    _onLadder: OnLadder;

    /** Platforms near the object, updated with `_updatePotentialCollidingObjects`. */
    _potentialCollidingObjects: Array<gdjs.PlatformRuntimeBehavior>;

    /** Overlapped jump-thru platforms, updated with `_updateOverlappedJumpThru`. */
    private _overlappedJumpThru: Array<gdjs.PlatformRuntimeBehavior>;

    private _hasReallyMoved: boolean = false;
    private _manager: gdjs.PlatformObjectsManager;

    private _slopeMaxAngle: float;
    _slopeClimbingFactor: float = 1;

    _requestedDeltaX: float = 0;
    _requestedDeltaY: float = 0;
    _lastDeltaY: float = 0;

    constructor(
      runtimeScene: gdjs.RuntimeScene,
      behaviorData,
      owner: gdjs.RuntimeObject
    ) {
      super(runtimeScene, behaviorData, owner);
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

    doStepPreEvents(runtimeScene: gdjs.RuntimeScene) {
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
      this._state.checkTransitionBeforeX();
      this._state.beforeMovingX();

      //Ensure the object is not stuck
      if (this._separateFromPlatforms(this._potentialCollidingObjects, true)) {
        //After being unstuck, the object must be able to jump again.
        this._canJump = true;
      }

      const oldX = object.getX();
      this._moveX();

      //2) Y axis:
      this._state.checkTransitionBeforeY(timeDelta);
      this._state.beforeMovingY(timeDelta, oldX);

      const oldY = object.getY();
      this._moveY();

      //3) Update the current floor data for the next tick:
      //TODO what about a moving platforms, remove this condition to do the same as for grabbing?
      if (this._state !== this._onLadder) {
        this._checkTransitionOnFloorOrFalling();
      }

      //4) Do not forget to reset pressed keys
      this._leftKey = false;
      this._rightKey = false;
      this._ladderKey = false;
      this._releaseLadderKey = false;
      this._upKey = false;
      this._downKey = false;
      this._releasePlatformKey = false;
      this._jumpKey = false;

      //5) Track the movement
      this._hasReallyMoved =
        Math.abs(object.getX() - oldX) >= 1 ||
        Math.abs(object.getY() - oldY) >= 1;
      this._lastDeltaY = object.getY() - oldY;
    }

    doStepPostEvents(runtimeScene: gdjs.RuntimeScene) {}

    private _updateSpeed(timeDelta: float): float {
      //Change the speed according to the player's input.
      // @ts-ignore
      if (this._leftKey) {
        this._currentSpeed -= this._acceleration * timeDelta;
      }
      if (this._rightKey) {
        this._currentSpeed += this._acceleration * timeDelta;
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
      return this._currentSpeed * timeDelta;
    }

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

        // When the character is on the floor it will try to walk on the obstacles.
        // So, it should not be stopped.
        if (
          this._state !== this._onFloor &&
          object.getX() !== oldX + this._requestedDeltaX
        ) {
          this._currentSpeed = 0;
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

          //Stop when colliding with an obstacle.
          while (
            (this._requestedDeltaY < 0 &&
              this._isCollidingWithOneOf(
                this._potentialCollidingObjects,
                null,
                /*excludeJumpThrus=*/
                true
              )) ||
            //Jumpthru = obstacle <=> Never when going up
            (this._requestedDeltaY > 0 &&
              this._isCollidingWithOneOfExcluding(
                this._potentialCollidingObjects,
                this._overlappedJumpThru
              ))
          ) {
            //Jumpthru = obstacle <=> Only if not already overlapped when going down
            if (this._state === this._jumping) {
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
    }

    _setFalling() {
      this._state.leave();
      this._state = this._falling;
      this._falling.enter();
    }

    _setOnFloor(collidingPlatform: PlatformRuntimeBehavior) {
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

    private _setGrabbingPlatform(grabbedPlatform: PlatformRuntimeBehavior) {
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
          (this._requestedDeltaX > 0
            ? this._xGrabTolerance
            : -this._xGrabTolerance)
      );
      const collidingPlatforms: PlatformRuntimeBehavior[] = gdjs.staticArray(
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
      // of a jumpthru, it could be considered as landing if not this this extra check).
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
      return (
        platform.canBeGrabbed() &&
        ((y1 < platformY && platformY < y2) ||
          (y2 < platformY && platformY < y1))
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
     * @param candidates The platform to be tested for collision
     * @param upwardDeltaY The owner won't move upward more than this value.
     * @param downwardDeltaY The owner won't move downward more than this value.
     */
    _findHighestFloorAndMoveOnTop(
      candidates: gdjs.PlatformRuntimeBehavior[],
      upwardDeltaY: float,
      downwardDeltaY: float
    ): PlatformSearchResult {
      let totalHighestY = Number.MAX_VALUE;
      let highestGround: gdjs.PlatformRuntimeBehavior | null = null;
      let isCollidingAnyPlatform = false;
      for (const platform of candidates) {
        if (
          platform.getPlatformType() === gdjs.PlatformRuntimeBehavior.LADDER ||
          // Jump through platforms are obstacles only when the character comes from the top.
          (platform.getPlatformType() ===
            gdjs.PlatformRuntimeBehavior.JUMPTHRU &&
            // When following the floor, ignore jumpthrus that are higher than the character.
            ((this._state === this._onFloor &&
              platform !== this._onFloor.getFloorPlatform() &&
              downwardDeltaY < 0) ||
              // When trying to land on a platform, exclude jumpthrus that were already overlapped.
              (this._state !== this._onFloor &&
                this._isIn(this._overlappedJumpThru, platform.owner.id))))
        ) {
          continue;
        }

        let highestRelativeY = this._findPlatformHighestRelativeYUnderObject(
          platform,
          upwardDeltaY,
          downwardDeltaY
        );
        if (
          // When following the floor, ignore jumpthrus that are higher than the character.
          this._state === this._onFloor &&
          platform !== this._onFloor.getFloorPlatform() &&
          platform.getPlatformType() ===
            gdjs.PlatformRuntimeBehavior.JUMPTHRU &&
          highestRelativeY < 0
        ) {
          // Don't follow jump though that are higher than the character bottom.
          continue;
        }
        if (highestRelativeY !== PlatformerObjectRuntimeBehavior._noCollision) {
          isCollidingAnyPlatform = true;
        }
        if (
          highestRelativeY === PlatformerObjectRuntimeBehavior._floorIsTooHigh
        ) {
          // One platform is colliding the character
          // and is too high for the character to walk on.
          // This will still be an obstacle event if there
          // are other platforms that fit the requirement.
          highestGround = null;
          break;
        }

        if (highestRelativeY < totalHighestY) {
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
     * @return
     * * Number.MAX_VALUE if the platform doesn't collide
     * * -Number.MAX_VALUE if the platform is too high
     */
    private _findPlatformHighestRelativeYUnderObject(
      platform: gdjs.PlatformRuntimeBehavior,
      upwardDeltaY: float,
      downwardDeltaY: float
    ) {
      let ownerMinX = Number.MAX_VALUE;
      let ownerMaxX = -Number.MAX_VALUE;
      let ownerMinY = Number.MAX_VALUE;
      let ownerMaxY = -Number.MAX_VALUE;
      for (const hitBox of this.owner.getHitBoxes()) {
        for (const vertex of hitBox.vertices) {
          ownerMinX = Math.min(ownerMinX, vertex[0]);
          ownerMaxX = Math.max(ownerMaxX, vertex[0]);
          ownerMinY = Math.min(ownerMinY, vertex[1]);
          ownerMaxY = Math.max(ownerMaxY, vertex[1]);
        }
      }
      const floorMinY = ownerMaxY + upwardDeltaY;
      const floorMaxY = ownerMaxY + downwardDeltaY;

      const platformObject = platform.owner;
      const platformAABB = platformObject.getAABB();
      if (
        platformAABB.max[0] <= ownerMinX ||
        platformAABB.min[0] >= ownerMaxX ||
        platformAABB.max[1] < ownerMinY ||
        platformAABB.min[1] > floorMaxY
      ) {
        return PlatformerObjectRuntimeBehavior._noCollision;
      }

      let highestY = PlatformerObjectRuntimeBehavior._noCollision;
      for (const hitbox of platformObject.getHitBoxes()) {
        let previousVertex = hitbox.vertices[hitbox.vertices.length - 1];

        // Edges over the character head might not result to a collision,
        // but if there is also an edge under its head then there is a collision.
        let fondOverHead = false;
        let fondUnderHead = false;

        for (const vertex of hitbox.vertices) {
          if (previousVertex[1] > floorMaxY && vertex[1] > floorMaxY) {
            // The edge is too low
            fondUnderHead = true;
            if (fondOverHead) {
              return PlatformerObjectRuntimeBehavior._floorIsTooHigh;
            }
          } else {
            // Check vertex into the interval
            if (ownerMinX <= vertex[0] && vertex[0] <= ownerMaxX) {
              if (vertex[1] < floorMinY) {
                // Platform is too high...
                if (vertex[1] >= ownerMinY) {
                  // ...but not over the object.
                  // Indeed, the platform hitbox could be in several parts.
                  // So, the object could walk on one part
                  // and have another part over its head.
                  return PlatformerObjectRuntimeBehavior._floorIsTooHigh;
                } else {
                  fondOverHead = true;
                  if (fondUnderHead) {
                    return PlatformerObjectRuntimeBehavior._floorIsTooHigh;
                  }
                }
              }
              // Ignore intersections that are too low
              if (floorMinY <= vertex[1] && vertex[1] <= floorMaxY) {
                if (fondOverHead) {
                  return PlatformerObjectRuntimeBehavior._floorIsTooHigh;
                } else {
                  highestY = Math.min(highestY, vertex[1]);
                  fondUnderHead = true;
                }
              }
            }
            const deltaX = vertex[0] - previousVertex[0];
            // Vertical edges doesn't matter
            if (deltaX !== 0) {
              // Check intersection on the left side of owner
              if (
                (vertex[0] < ownerMinX && ownerMinX < previousVertex[0]) ||
                (previousVertex[0] < ownerMinX && ownerMinX < vertex[0])
              ) {
                const deltaY = vertex[1] - previousVertex[1];
                const intersectionY =
                  previousVertex[1] +
                  ((ownerMinX - previousVertex[0]) * deltaY) / deltaX;
                if (intersectionY < floorMinY && intersectionY >= ownerMinY) {
                  // Platform is too high
                  return PlatformerObjectRuntimeBehavior._floorIsTooHigh;
                }
                // Ignore intersections that are too low
                if (floorMinY <= intersectionY && intersectionY <= floorMaxY) {
                  if (fondOverHead) {
                    return PlatformerObjectRuntimeBehavior._floorIsTooHigh;
                  } else {
                    highestY = Math.min(highestY, intersectionY);
                    fondUnderHead = true;
                  }
                }
              }
              // Check intersection on the right side of owner
              if (
                (vertex[0] < ownerMaxX && ownerMaxX < previousVertex[0]) ||
                (previousVertex[0] < ownerMaxX && ownerMaxX < vertex[0])
              ) {
                const deltaY = vertex[1] - previousVertex[1];
                const intersectionY =
                  previousVertex[1] +
                  ((ownerMaxX - previousVertex[0]) * deltaY) / deltaX;
                if (intersectionY < floorMinY && intersectionY >= ownerMinY) {
                  // Platform is too high
                  return PlatformerObjectRuntimeBehavior._floorIsTooHigh;
                }
                // Ignore intersections that are too low
                if (floorMinY <= intersectionY && intersectionY <= floorMaxY) {
                  if (fondOverHead) {
                    return PlatformerObjectRuntimeBehavior._floorIsTooHigh;
                  } else {
                    highestY = Math.min(highestY, intersectionY);
                    fondUnderHead = true;
                  }
                }
              }
            }
          }
          previousVertex = vertex;
        }
      }
      return highestY === PlatformerObjectRuntimeBehavior._noCollision
        ? PlatformerObjectRuntimeBehavior._noCollision
        : highestY - ownerMaxY;
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
      if (slopeMaxAngle === 45) {
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
     * Forbid the Platformer Object to air jump.
     */
    setCanNotAirJump(): void {
      if (this._state === this._jumping || this._state === this._falling) {
        this._canJump = false;
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
     * @returns Returns true if it is moving and false if not.
     */
    isMoving(): boolean {
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
   */
  class OnFloor implements State {
    private _behavior: PlatformerObjectRuntimeBehavior;
    private _floorPlatform: PlatformRuntimeBehavior | null = null;
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
      //Stick the object to the floor if its height has changed.
      if (this._oldHeight !== object.getHeight()) {
        object.setY(
          this._floorLastY -
            object.getHeight() +
            (object.getY() - object.getDrawableY())
        );
      }
      // Directly follow the floor movement on the Y axis by moving the character.
      // For the X axis, we follow the floor movement using `_requestedDeltaX`
      // (see `beforeMovingX`).
      // We don't use `_requestedDeltaY` to follow the floor on the Y axis
      // to avoid a transition loop with the Falling state.
      // Indeed, if we used it, then:
      // - going down, the character could no longer be on a platform and start falling.
      // - going up, the character will already be pushed on top on the platform
      //   by `beforeMovingY` that handle slopes or the separate call that both
      //   avoid characters being stuck. So using `_requestedDeltaY`, the character
      //   would be going too much higher and fall at the next frame.
      //
      // We could make the character follow a platform moving up
      // at a greater speed as it's coherent from a physics point of view.
      // But, when the character is put on top of the platform to follow it up,
      // the platform AABB may not be updated in RBush yet
      // and the platform can become out of the spacial search rectangle
      // even though they are next to each other, which means
      // that the character will fell.
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
      // Shift the object according to the floor movement.
      behavior._requestedDeltaX +=
        this._floorPlatform!.owner.getX() - this._floorLastX;
      // See `beforeUpdatingObstacles` for the logic for the Y axis.
    }

    checkTransitionBeforeY(timeDelta: float) {
      const behavior = this._behavior;
      //Go on a ladder
      behavior._checkTransitionOnLadder();
      //Jumping
      behavior._checkTransitionJumping();
    }

    beforeMovingY(timeDelta: float, oldX: float) {
      const behavior = this._behavior;
      const object = behavior.owner;

      if (object.getX() === oldX + behavior._requestedDeltaX) {
        // The character didn't encounter any obstacle.
        // It follows the floor.
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
        // The character encounter an obstacle.
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
          // The current platform is climbed
          // Can the obstacle be climbed too from here?
          // Do a look up in 2 steps:
          // 1. Try to move 1 pixel on X to climb the junction
          //    (because the obstacle detection is done 1 pixel by 1 pixel).
          // 2. Try to follow the obstacle slope from at least 1 pixel
          //    (it can only be done after the junction because otherwise
          //    the slope angle would be a mean between the current platform and
          //    the obstacles).
          // The 2nd steps is done 1 pixel width at least, when remainingDeltaX
          // is less than 2 pixels, it will be a lookahead. This is to ensure
          // the character doesn't start to climb a slope he actually can't.
          const remainingDeltaX = requestedDeltaX - (object.getX() - oldX);
          const beforeObstacleY = object.getY();
          const beforeObstacleX = object.getX();
          // 1. Try to move 1 pixel on X to climb the junction.
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

    enter() {
      this._behavior._canJump = false;
    }

    leave() {}

    beforeUpdatingObstacles(timeDelta: float) {}

    checkTransitionBeforeX() {}

    beforeMovingX() {}

    checkTransitionBeforeY(timeDelta: float) {
      const behavior = this._behavior;
      //Go on a ladder
      behavior._checkTransitionOnLadder();
      //Jumping
      behavior._checkTransitionJumping();

      //Grabbing a platform
      if (behavior._canGrabPlatforms && behavior._requestedDeltaX !== 0) {
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
      //Go on a ladder
      behavior._checkTransitionOnLadder();
      //Jumping
      behavior._checkTransitionJumping();

      //Grabbing a platform
      if (
        behavior._canGrabPlatforms &&
        behavior._requestedDeltaX !== 0 &&
        behavior._lastDeltaY >= 0
      ) {
        behavior._checkGrabPlatform();
      }
    }

    beforeMovingY(timeDelta: float, oldX: float) {
      const behavior = this._behavior;

      //Fall
      if (!this._jumpingFirstDelta) {
        behavior._fall(timeDelta);
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

    enter(grabbedPlatform: PlatformRuntimeBehavior) {
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

  gdjs.registerBehavior(
    'PlatformBehavior::PlatformerObjectBehavior',
    gdjs.PlatformerObjectRuntimeBehavior
  );
}
