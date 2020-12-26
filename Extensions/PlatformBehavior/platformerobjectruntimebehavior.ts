namespace gdjs {
  /**
GDevelop - Platform Behavior Extension
Copyright (c) 2013-2016 Florian Rival (Florian.Rival@gmail.com)
 */

  /**
   * PlatformerObjectRuntimeBehavior represents a behavior allowing objects to be
   * considered as a platform by objects having PlatformerObject Behavior.
   *
   * @class PlatformerObjectRuntimeBehavior
   * @augments {gdjs.RuntimeBehavior}
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
    _roundCoordinates: any;
    _gravity: any;
    _maxFallingSpeed: any;
    _ladderClimbingSpeed: any;
    _acceleration: any;
    _deceleration: any;
    _maxSpeed: any;
    _jumpSpeed: any;
    _canGrabPlatforms: any;
    _yGrabOffset: any;
    _xGrabTolerance: any;
    _jumpSustainTime: float;
    _isOnFloor: boolean = false;
    _isOnLadder: boolean = false;
    _floorPlatform: any = null;
    _currentFallSpeed: number = 0;
    _currentSpeed: number = 0;
    _jumping: boolean = false;
    _currentJumpSpeed: number = 0;
    _timeSinceCurrentJumpStart: number = 0;
    _jumpKeyHeldSinceJumpStart: boolean = false;
    _canJump: boolean = false;
    _isGrabbingPlatform: boolean = false;
    _grabbedPlatform: any = null;
    _ignoreDefaultControls: any;
    _leftKey: boolean = false;
    _rightKey: boolean = false;
    _ladderKey: boolean = false;
    _upKey: boolean = false;
    _downKey: boolean = false;
    _jumpKey: boolean = false;
    _potentialCollidingObjects: any;
    _overlappedJumpThru: any;
    _oldHeight: float = 0;

    //owner.getHeight(); //Be careful, object might not be initialized.
    _hasReallyMoved: boolean = false;
    _manager: any;
    _grabbedPlatformLastX: any;
    _grabbedPlatformLastY: any;

    //Still on the same floor
    _floorLastX: any;
    _floorLastY: any;
    _releaseKey: any;
    _slopeMaxAngle: float;
    _slopeClimbingFactor: any;

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
      this._potentialCollidingObjects = this._potentialCollidingObjects || [];

      //Platforms near the object, updated with _updatePotentialCollidingObjects.
      this._potentialCollidingObjects.length = 0;
      this._overlappedJumpThru = this._overlappedJumpThru || [];
      this._overlappedJumpThru.length = 0;
      this.setSlopeMaxAngle(behaviorData.slopeMaxAngle);
      this._manager = gdjs.PlatformObjectsManager.getManager(runtimeScene);
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
      let requestedDeltaX = 0;
      let requestedDeltaY = 0;

      //Change the speed according to the player's input.
      this._leftKey |=
        !this._ignoreDefaultControls &&
        runtimeScene.getGame().getInputManager().isKeyPressed(LEFTKEY);
      this._rightKey |=
        !this._ignoreDefaultControls &&
        runtimeScene.getGame().getInputManager().isKeyPressed(RIGHTKEY);
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
      requestedDeltaX += this._currentSpeed * timeDelta;

      //0.2) Track changes in object size

      //Stick the object to the floor if its height has changed.
      if (this._isOnFloor && this._oldHeight !== object.getHeight()) {
        object.setY(
          this._floorLastY -
            object.getHeight() +
            (object.getY() - object.getDrawableY()) -
            1
        );
      }
      this._oldHeight = object.getHeight();

      //0.3) Update list of platforms around/related to the object

      //Compute the list of the objects that will be used
      this._updatePotentialCollidingObjects(
        Math.max(requestedDeltaX, this._maxFallingSpeed * timeDelta)
      );
      this._updateOverlappedJumpThru();

      //Check that the floor object still exists and is near the object.
      if (
        this._isOnFloor &&
        !this._isIn(
          this._potentialCollidingObjects,
          this._floorPlatform.owner.id
        )
      ) {
        this._isOnFloor = false;
        this._floorPlatform = null;
      }

      //Check that the grabbed platform object still exists and is near the object.
      if (
        this._isGrabbingPlatform &&
        !this._isIn(
          this._potentialCollidingObjects,
          this._grabbedPlatform.owner.id
        )
      ) {
        this._releaseGrabbedPlatform();
      }

      //1) X axis:

      //Shift the object according to the floor movement.
      if (this._isOnFloor) {
        requestedDeltaX += this._floorPlatform.owner.getX() - this._floorLastX;
        requestedDeltaY += this._floorPlatform.owner.getY() - this._floorLastY;
      }

      //Shift the object according to the grabbed platform movement.
      if (this._isGrabbingPlatform) {
        // This erases any other movement
        requestedDeltaX =
          this._grabbedPlatform.owner.getX() - this._grabbedPlatformLastX;
        requestedDeltaY =
          this._grabbedPlatform.owner.getY() - this._grabbedPlatformLastY;
      }

      //Ensure the object is not stuck
      if (this._separateFromPlatforms(this._potentialCollidingObjects, true)) {
        this._canJump = true;
      }

      //After being unstuck, the object must be able to jump again.

      //Move the object on x axis.
      const oldX = object.getX();
      if (requestedDeltaX !== 0) {
        const floorPlatformId =
          this._floorPlatform !== null ? this._floorPlatform.owner.id : null;
        object.setX(object.getX() + requestedDeltaX);
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
            (requestedDeltaX > 0 && object.getX() <= oldX) ||
            (requestedDeltaX < 0 && object.getX() >= oldX)
          ) {
            object.setX(
              //Unable to move the object without being stuck in an obstacle.
              oldX
            );
            break;
          }

          //If on floor: try get up a bit to bypass not perfectly aligned floors.
          if (this._isOnFloor) {
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
              Math.round(object.getX()) + (requestedDeltaX > 0 ? -1 : 1)
            );
          }
          this._currentSpeed = 0;
        }
      }

      //Collided with a wall

      //2) Y axis:

      //Go on a ladder
      this._ladderKey |=
        !this._ignoreDefaultControls &&
        runtimeScene.getGame().getInputManager().isKeyPressed(UPKEY);
      if (this._ladderKey && this._isOverlappingLadder()) {
        this._canJump = true;
        this._isOnFloor = false;
        this._floorPlatform = null;
        this._currentJumpSpeed = 0;
        this._currentFallSpeed = 0;
        this._isOnLadder = true;
      }
      if (this._isOnLadder) {
        this._upKey |=
          !this._ignoreDefaultControls &&
          runtimeScene.getGame().getInputManager().isKeyPressed(UPKEY);
        this._downKey |=
          !this._ignoreDefaultControls &&
          runtimeScene.getGame().getInputManager().isKeyPressed(DOWNKEY);
        if (this._upKey) {
          requestedDeltaY -= this._ladderClimbingSpeed * timeDelta;
        }
        if (this._downKey) {
          requestedDeltaY += this._ladderClimbingSpeed * timeDelta;
        }

        //Coming to an extremity of a ladder
        if (!this._isOverlappingLadder()) {
          this._isOnLadder = false;
        }
      }

      //Fall
      if (!this._isOnFloor && !this._isOnLadder && !this._isGrabbingPlatform) {
        this._currentFallSpeed += this._gravity * timeDelta;
        if (this._currentFallSpeed > this._maxFallingSpeed) {
          this._currentFallSpeed = this._maxFallingSpeed;
        }
        requestedDeltaY += this._currentFallSpeed * timeDelta;
        requestedDeltaY = Math.min(
          requestedDeltaY,
          this._maxFallingSpeed * timeDelta
        );
      }

      //Grabbing a platform
      if (
        this._canGrabPlatforms &&
        requestedDeltaX !== 0 &&
        !this._isOnLadder &&
        !this._isOnFloor
      ) {
        let tryGrabbingPlatform = false;
        object.setX(
          object.getX() +
            (requestedDeltaX > 0 ? this._xGrabTolerance : -this._xGrabTolerance)
        );
        let collidingPlatform = this._getCollidingPlatform();
        if (
          collidingPlatform !== null &&
          this._canGrab(collidingPlatform, requestedDeltaY)
        ) {
          tryGrabbingPlatform = true;
        }
        object.setX(
          object.getX() +
            (requestedDeltaX > 0 ? -this._xGrabTolerance : this._xGrabTolerance)
        );

        //Check if we can grab the collided platform
        if (tryGrabbingPlatform) {
          let oldY = object.getY();
          object.setY(
            collidingPlatform.owner.getY() +
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
            this._isGrabbingPlatform = true;
            this._grabbedPlatform = collidingPlatform;
            requestedDeltaY = 0;
          } else {
            object.setY(oldY);
          }
        }
      }
      this._releaseKey |=
        !this._ignoreDefaultControls &&
        runtimeScene.getGame().getInputManager().isKeyPressed(DOWNKEY);
      if (this._isGrabbingPlatform && !this._releaseKey) {
        this._canJump = true;
        this._currentJumpSpeed = 0;
        this._currentFallSpeed = 0;
        this._grabbedPlatformLastX = this._grabbedPlatform.owner.getX();
        this._grabbedPlatformLastY = this._grabbedPlatform.owner.getY();
      }
      if (this._releaseKey) {
        this._releaseGrabbedPlatform();
      }

      //Jumping
      this._jumpKey |=
        !this._ignoreDefaultControls &&
        (runtimeScene.getGame().getInputManager().isKeyPressed(LSHIFTKEY) ||
          runtimeScene.getGame().getInputManager().isKeyPressed(RSHIFTKEY) ||
          runtimeScene.getGame().getInputManager().isKeyPressed(SPACEKEY));
      if (this._canJump && this._jumpKey) {
        this._jumping = true;
        this._canJump = false;
        this._timeSinceCurrentJumpStart = 0;
        this._jumpKeyHeldSinceJumpStart = true;

        //this._isOnFloor = false; If floor is a very steep slope, the object could go into it.
        this._isOnLadder = false;
        this._currentJumpSpeed = this._jumpSpeed;
        this._currentFallSpeed = 0;
        this._isGrabbingPlatform = false;
      }

      //object.setY(object.getY()-1); //Useless and dangerous

      // Check if the jump key is continuously held since
      // the beginning of the jump.
      if (!this._jumpKey) {
        this._jumpKeyHeldSinceJumpStart = false;
      }
      if (this._jumping) {
        this._timeSinceCurrentJumpStart += timeDelta;
        requestedDeltaY -= this._currentJumpSpeed * timeDelta;

        // Decrease jump speed after the (optional) jump sustain time is over.
        const sustainJumpSpeed =
          this._jumpKeyHeldSinceJumpStart &&
          this._timeSinceCurrentJumpStart < this._jumpSustainTime;
        if (!sustainJumpSpeed) {
          this._currentJumpSpeed -= this._gravity * timeDelta;
        }
        if (this._currentJumpSpeed < 0) {
          this._currentJumpSpeed = 0;
          this._jumping = false;
        }
      }

      //Follow the floor
      if (this._isOnFloor) {
        if (
          gdjs.RuntimeObject.collisionTest(
            object,
            this._floorPlatform.owner,
            this._ignoreTouchingEdges
          )
        ) {
          //Floor is getting up, as the object is colliding with it.
          let oldY = object.getY();
          let step = 0;
          let stillInFloor = false;
          do {
            if (
              step >=
              Math.floor(Math.abs(requestedDeltaX * this._slopeClimbingFactor))
            ) {
              //Slope is too step ( > 50% )
              object.setY(
                object.getY() -
                  (Math.abs(requestedDeltaX * this._slopeClimbingFactor) - step)
              );

              //Try to add the decimal part.
              if (
                gdjs.RuntimeObject.collisionTest(
                  object,
                  this._floorPlatform.owner,
                  this._ignoreTouchingEdges
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
              this._floorPlatform.owner,
              this._ignoreTouchingEdges
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
            this._roundCoordinates
              ? Math.round(tentativeStartY)
              : tentativeStartY
          );
          let step = 0;
          let noMoreOnFloor = false;
          while (!this._isCollidingWith(this._potentialCollidingObjects)) {
            if (step > Math.abs(requestedDeltaX * this._slopeClimbingFactor)) {
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

      //Move the object on Y axis
      if (requestedDeltaY !== 0) {
        let oldY = object.getY();
        object.setY(object.getY() + requestedDeltaY);

        //Stop when colliding with an obstacle.
        while (
          (requestedDeltaY < 0 &&
            this._isCollidingWith(
              this._potentialCollidingObjects,
              null,
              /*excludeJumpThrus=*/
              true
            )) ||
          //Jumpthru = obstacle <=> Never when going up
          (requestedDeltaY > 0 &&
            this._isCollidingWithExcluding(
              this._potentialCollidingObjects,
              this._overlappedJumpThru
            ))
        ) {
          //Jumpthru = obstacle <=> Only if not already overlapped when goign down
          this._jumping = false;
          this._currentJumpSpeed = 0;
          if (
            (requestedDeltaY > 0 && object.getY() <= oldY) ||
            (requestedDeltaY < 0 && object.getY() >= oldY)
          ) {
            object.setY(
              //Unable to move the object without being stuck in an obstacle.
              oldY
            );
            break;
          }
          object.setY(
            Math.floor(object.getY()) + (requestedDeltaY > 0 ? -1 : 1)
          );
        }
      }

      //3) Update the current floor data for the next tick:
      this._updateOverlappedJumpThru();
      if (!this._isOnLadder) {
        //Check if the object is on a floor:
        //In priority, check if the last floor platform is still the floor.
        let oldY = object.getY();
        object.setY(object.getY() + 1);
        if (
          this._isOnFloor &&
          gdjs.RuntimeObject.collisionTest(
            object,
            this._floorPlatform.owner,
            this._ignoreTouchingEdges
          )
        ) {
          this._floorLastX = this._floorPlatform.owner.getX();
          this._floorLastY = this._floorPlatform.owner.getY();

          //Ensure nothing is grabbed.
          this._releaseGrabbedPlatform();
        } else {
          // Avoid landing on a platform if the object is not going down.
          // (which could happen for Jumpthru, when the object jump and pass just at the top
          // of a jumpthru, it could be considered as landing if not this this extra check).
          const canLand = requestedDeltaY >= 0;

          //Check if landing on a new floor: (Exclude already overlapped jump truh)
          let collidingPlatform = this._getCollidingPlatform();
          if (canLand && collidingPlatform !== null) {
            this._isOnFloor = true;
            this._canJump = true;
            this._jumping = false;
            this._currentJumpSpeed = 0;
            this._currentFallSpeed = 0;

            //Register the colliding platform as the floor.
            this._floorPlatform = collidingPlatform;
            this._floorLastX = this._floorPlatform.owner.getX();
            this._floorLastY = this._floorPlatform.owner.getY();

            //Ensure nothing is grabbed.
            this._releaseGrabbedPlatform();
          } else {
            //In the air
            this._canJump = false;
            this._isOnFloor = false;
            this._floorPlatform = null;
          }
        }
        object.setY(oldY);
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
    _canGrab(platform, requestedDeltaY) {
      const y1 = this.owner.getY() + this._yGrabOffset;
      const y2 = this.owner.getY() + this._yGrabOffset + requestedDeltaY;
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
      this._isGrabbingPlatform = false;

      //Ensure nothing is grabbed.
      this._grabbedPlatform = null;
    }

    /**
     * Among the platforms passed in parameter, return true if there is a platform colliding with the object.
     * Ladders are *always* excluded from the test.
     * @param candidates The platform to be tested for collision
     * @param exceptThisOne The object identifier of a platform to be excluded from the check. Can be null.
     * @param excludeJumpThrus If set to true, jumpthru platforms are excluded. false if not defined.
     */
    _isCollidingWith(candidates, exceptThisOne, excludeJumpThrus) {
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
      return null;
    }

    //Nothing is being colliding with the behavior object.
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
    private _isOverlappingLadder() {
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
    }

    //This is the naive implementation when the platforms manager is simply containing a list
    //of all existing platforms:
    /*var o1w = this.owner.getWidth();
        var o1h = this.owner.getHeight();
        var obj1BoundingRadius = Math.sqrt(o1w*o1w+o1h*o1h)/2.0 + maxMovementLength;
        //Get all platforms and keep only
        var allPlatforms = this._manager.getAllPlatforms();
        for (var k in allPlatforms.items) {
            if (allPlatforms.items.hasOwnProperty(k)) {
                var obj2 = allPlatforms.items[k].owner;
                var o2w = obj2.getWidth();
                var o2h = obj2.getHeight();
                // This would better be done using the object AABB (getAABB), as (`getCenterX`;`getCenterY`) point
                // is not necessarily in the middle of the object (for sprites for example).
                var x = this.owner.getDrawableX()+this.owner.getCenterX()-(obj2.getDrawableX()+obj2.getCenterX());
                var y = this.owner.getDrawableY()+this.owner.getCenterY()-(obj2.getDrawableY()+obj2.getCenterY());
                var obj2BoundingRadius = Math.sqrt(o2w*o2w+o2h*o2h)/2.0;
                if ( Math.sqrt(x*x+y*y) <= obj1BoundingRadius + obj2BoundingRadius ) {
                    if ( !this._potentialCollidingObjects.hasOwnProperty(k) )
                        this._potentialCollidingObjects[k] = allPlatforms.items[k];
                }
                else {
                    if ( this._potentialCollidingObjects.hasOwnProperty(k) )
                        delete this._potentialCollidingObjects[k];
                }
            }
        }*/
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
    getGravity(): number {
      return this._gravity;
    }

    /**
     * Get the maximum falling speed of the Platformer Object.
     * @returns The maximum falling speed.
     */
    getMaxFallingSpeed(): number {
      return this._maxFallingSpeed;
    }

    /**
     * Get the speed used to move on Y axis when climbing a ladder.
     * @returns The speed of ladder climbing.
     */
    getLadderClimbingSpeed(): number {
      return this._ladderClimbingSpeed;
    }

    /**
     * Get the acceleration value of the Platformer Object.
     * @returns The current acceleration.
     */
    getAcceleration(): number {
      return this._acceleration;
    }

    /**
     * Get the deceleration of the Platformer Object.
     * @returns The current deceleration.
     */
    getDeceleration(): number {
      return this._deceleration;
    }

    /**
     * Get the maximum speed of the Platformer Object.
     * @returns The maximum speed.
     */
    getMaxSpeed(): number {
      return this._maxSpeed;
    }

    /**
     * Get the jump speed of the Platformer Object.
     * @returns The jump speed.
     */
    getJumpSpeed(): number {
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
    getCurrentFallSpeed(): number {
      return this._currentFallSpeed;
    }

    /**
     * Get the current speed of the Platformer Object.
     * @returns The current speed.
     */
    getCurrentSpeed(): number {
      return this._currentSpeed;
    }

    /**
     * Get the current jump speed of the Platformer Object.
     * @returns The current jump speed.
     */
    getCurrentJumpSpeed(): number {
      return this._currentJumpSpeed;
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
    setMaxFallingSpeed(maxFallingSpeed: number): void {
      this._maxFallingSpeed = maxFallingSpeed;
    }

    /**
     * Set the speed used to move on Y axis when climbing a ladder.
     * @param ladderClimbingSpeed The speed of ladder climbing.
     */
    setLadderClimbingSpeed(ladderClimbingSpeed: number): void {
      this._ladderClimbingSpeed = ladderClimbingSpeed;
    }

    /**
     * Set the acceleration of the Platformer Object.
     * @param acceleration The new acceleration.
     */
    setAcceleration(acceleration: number): void {
      this._acceleration = acceleration;
    }

    /**
     * Set the deceleration of the Platformer Object.
     * @param deceleration The new deceleration.
     */
    setDeceleration(deceleration: number): void {
      this._deceleration = deceleration;
    }

    /**
     * Set the maximum speed of the Platformer Object.
     * @param maxSpeed The new maximum speed.
     */
    setMaxSpeed(maxSpeed: number): void {
      this._maxSpeed = maxSpeed;
    }

    /**
     * Set the jump speed of the Platformer Object.
     * @param jumpSpeed The new jump speed.
     */
    setJumpSpeed(jumpSpeed: number): void {
      this._jumpSpeed = jumpSpeed;
    }

    /**
     * Set the jump sustain time of the Platformer Object.
     * @param jumpSpeed The new jump sustain time.
     */
    setJumpSustainTime(jumpSustainTime): void {
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
      return this._isOnFloor;
    }

    /**
     * Check if the Platformer Object is on a ladder.
     * @returns Returns true if on a ladder and false if not.
     */
    isOnLadder(): boolean {
      return this._isOnLadder;
    }

    /**
     * Check if the Platformer Object is jumping.
     * @returns Returns true if jumping and false if not.
     */
    isJumping(): boolean {
      return this._jumping;
    }

    /**
     * Check if the Platformer Object is grabbing a platform.
     * @returns Returns true if a platform is grabbed and false if not.
     */
    isGrabbingPlatform(): boolean {
      return this._isGrabbingPlatform;
    }

    /**
     * Check if the Platformer Object is falling.
     * @returns Returns true if it is falling and false if not.
     */
    isFalling(): boolean {
      return (
        !this._isOnFloor &&
        !this._isGrabbingPlatform &&
        !this._isOnLadder &&
        (!this._jumping || this._currentJumpSpeed < this._currentFallSpeed)
      );
    }

    /**
     * Check if the Platformer Object is moving.
     * @returns Returns true if it is moving and false if not.
     */
    isMoving(): boolean {
      return (
        (this._hasReallyMoved && this._currentSpeed !== 0) ||
        this._currentJumpSpeed !== 0 ||
        this._currentFallSpeed !== 0
      );
    }
  }
  gdjs.registerBehavior(
    'PlatformBehavior::PlatformerObjectBehavior',
    gdjs.PlatformerObjectRuntimeBehavior
  );
}
