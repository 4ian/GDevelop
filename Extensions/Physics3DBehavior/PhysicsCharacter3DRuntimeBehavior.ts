/// <reference path="./jolt-physics.d.ts" />

namespace Jolt {
  export interface Body {
    gdjsAssociatedCharacterBehavior: gdjs.PhysicsCharacter3DRuntimeBehavior | null;
  }
}

namespace gdjs {
  interface PhysicsCharacter3DNetworkSyncDataType {
    fwa: float;
    fws: float;
    sws: float;
    fs: float;
    js: float;
    cj: boolean;
    lek: boolean;
    rik: boolean;
    upk: boolean;
    dok: boolean;
    juk: boolean;
    us: boolean;
    sa: float;
    sf: float;
    tscjs: float;
    jkhsjs: boolean;
  }

  export interface PhysicsCharacter3DNetworkSyncData
    extends BehaviorNetworkSyncData {
    props: PhysicsCharacter3DNetworkSyncDataType;
  }

  type Physics3D = {
    behavior: gdjs.Physics3DRuntimeBehavior;
    extendedUpdateSettings: Jolt.ExtendedUpdateSettings;
    broadPhaseLayerFilter: Jolt.BroadPhaseLayerFilter;
    objectLayerFilter: Jolt.ObjectLayerFilter;
    bodyFilter: Jolt.BodyFilter;
    shapeFilter: Jolt.ShapeFilter;
  };

  export class PhysicsCharacter3DRuntimeBehavior
    extends gdjs.RuntimeBehavior
    implements gdjs.Physics3DRuntimeBehavior.Physics3DHook
  {
    owner3D: gdjs.RuntimeObject3D;
    physics3DBehaviorName: string;
    physics3D: Physics3D | null = null;
    character: Jolt.CharacterVirtual | null = null;
    /**
     * sharedData is a reference to the shared data of the scene, that registers
     * every physics behavior that is created so that collisions can be cleared
     * before stepping the world.
     */
    _sharedData: gdjs.Physics3DSharedData;

    // TODO Should there be angle were the character can climb but will slip?
    _slopeMaxAngle: float;
    _slopeClimbingFactor: float = 1;
    _slopeClimbingMinNormalZ: float = Math.cos(Math.PI / 4);
    private _forwardAngle: float = 0;
    _forwardAcceleration: float;
    _forwardDeceleration: float;
    _forwardSpeedMax: float;
    _sidewaysAcceleration: float;
    _sidewaysDeceleration: float;
    _sidewaysSpeedMax: float;
    _gravity: float;
    _maxFallingSpeed: float;
    _jumpSpeed: float;
    _jumpSustainTime: float;

    hasPressedForwardKey: boolean = false;
    hasPressedBackwardKey: boolean = false;
    hasPressedRightKey: boolean = false;
    hasPressedLeftKey: boolean = false;
    hasPressedJumpKey: boolean = false;
    hasUsedStick: boolean = false;
    private _stickAngle: float = 0;
    private _stickForce: float = 0;
    _currentForwardSpeed: float = 0;
    _currentSidewaysSpeed: float = 0;
    _currentFallSpeed: float = 0;
    _canJump: boolean = false;
    _currentJumpSpeed: float = 0;
    _timeSinceCurrentJumpStart: float = 0;
    _jumpKeyHeldSinceJumpStart: boolean = false;
    private _hasReallyMoved: boolean = false;
    oldPhysicsPosition: FloatPoint = [0, 0];

    // This is useful for extensions that need to know
    // which keys were pressed and doesn't know the mapping
    // done by the scene events.
    private _wasLeftKeyPressed: boolean = false;
    private _wasRightKeyPressed: boolean = false;
    private _wasForwardKeyPressed: boolean = false;
    private _wasBackwardKeyPressed: boolean = false;
    private _wasJumpKeyPressed: boolean = false;
    private _wasStickUsed: boolean = false;

    // This is useful when the object is synchronized by an external source
    // like in a multiplayer game, and we want to be able to predict the
    // movement of the object, even if the inputs are not updated every frame.
    _dontClearInputsBetweenFrames: boolean = false;

    /**
     * A very small value compare to 1 pixel, yet very huge compare to rounding errors.
     */
    private static readonly epsilon = 2 ** -20;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      behaviorData,
      owner: gdjs.RuntimeObject3D
    ) {
      super(instanceContainer, behaviorData, owner);
      this.owner3D = owner;
      this.physics3DBehaviorName = behaviorData.Physics3D;
      this._sharedData = gdjs.Physics3DSharedData.getSharedData(
        instanceContainer.getScene(),
        behaviorData.Physics3D
      );

      this._slopeMaxAngle = 0;
      this.setSlopeMaxAngle(behaviorData.slopeMaxAngle);
      this._forwardAcceleration = behaviorData.forwardAcceleration;
      this._forwardDeceleration = behaviorData.forwardDeceleration;
      this._forwardSpeedMax = behaviorData.forwardSpeedMax;
      this._sidewaysAcceleration = behaviorData.sidewaysAcceleration;
      this._sidewaysDeceleration = behaviorData.sidewaysDeceleration;
      this._sidewaysSpeedMax = behaviorData.sidewaysSpeedMax;
      this._gravity = behaviorData.gravity;
      this._maxFallingSpeed = behaviorData.fallingSpeedMax;
      this._jumpSustainTime = behaviorData.jumpSustainTime;
      this._jumpSpeed = this.getJumpSpeedToReach(behaviorData.jumpHeight);
    }

    private getVec3(x: float, y: float, z: float): Jolt.Vec3 {
      const tempVec3 = this._sharedData._tempVec3;
      tempVec3.Set(x, y, z);
      return tempVec3;
    }

    private getRVec3(x: float, y: float, z: float): Jolt.RVec3 {
      const tempRVec3 = this._sharedData._tempRVec3;
      tempRVec3.Set(x, y, z);
      return tempRVec3;
    }

    getPhysics3D(): Physics3D {
      if (this.physics3D) {
        return this.physics3D;
      }
      const behavior = this.owner.getBehavior(
        this.physics3DBehaviorName
      ) as gdjs.Physics3DRuntimeBehavior;

      const sharedData = behavior._sharedData;
      const jolt = sharedData.jolt;
      const extendedUpdateSettings = new Jolt.ExtendedUpdateSettings();
      extendedUpdateSettings.mWalkStairsStepUp = this.getVec3(0, 0, 0.4);
      const broadPhaseLayerFilter = new Jolt.DefaultBroadPhaseLayerFilter(
        jolt.GetObjectVsBroadPhaseLayerFilter(),
        gdjs.Physics3DSharedData.dynamicBroadPhaseLayerIndex
      );
      const objectLayerFilter = new Jolt.DefaultObjectLayerFilter(
        jolt.GetObjectLayerPairFilter(),
        behavior.getBodyLayer()
      );
      const bodyFilter = new Jolt.BodyFilter();
      const shapeFilter = new Jolt.ShapeFilter();

      this.physics3D = {
        behavior,
        extendedUpdateSettings,
        broadPhaseLayerFilter,
        objectLayerFilter,
        bodyFilter,
        shapeFilter,
      };
      sharedData.registerHook(this);

      behavior.bodyUpdater =
        new gdjs.PhysicsCharacter3DRuntimeBehavior.CharacterBodyUpdater(this);
      behavior.recreateBody();

      // Begin in the direction of the object.
      this._forwardAngle = this.owner.getAngle();

      return this.physics3D;
    }

    updateFromBehaviorData(oldBehaviorData, newBehaviorData): boolean {
      if (oldBehaviorData.gravity !== newBehaviorData.gravity) {
        this.setGravity(newBehaviorData.gravity);
      }
      if (oldBehaviorData.maxFallingSpeed !== newBehaviorData.maxFallingSpeed) {
        this.setMaxFallingSpeed(newBehaviorData.maxFallingSpeed);
      }
      if (
        oldBehaviorData.forwardAcceleration !==
        newBehaviorData.forwardAcceleration
      ) {
        this.setForwardAcceleration(newBehaviorData.forwardAcceleration);
      }
      if (
        oldBehaviorData.forwardDeceleration !==
        newBehaviorData.forwardDeceleration
      ) {
        this.setForwardDeceleration(newBehaviorData.forwardDeceleration);
      }
      if (oldBehaviorData.forwardSpeedMax !== newBehaviorData.forwardSpeedMax) {
        this.setForwardSpeedMax(newBehaviorData.forwardSpeedMax);
      }
      if (
        oldBehaviorData.sidewaysAcceleration !==
        newBehaviorData.sidewaysAcceleration
      ) {
        this.setSidewaysAcceleration(newBehaviorData.sidewaysAcceleration);
      }
      if (
        oldBehaviorData.sidewaysDeceleration !==
        newBehaviorData.sidewaysDeceleration
      ) {
        this.setSidewaysDeceleration(newBehaviorData.sidewaysDeceleration);
      }
      if (
        oldBehaviorData.sidewaysSpeedMax !== newBehaviorData.sidewaysSpeedMax
      ) {
        this.setSidewaysSpeedMax(newBehaviorData.sidewaysSpeedMax);
      }
      if (oldBehaviorData.jumpSustainTime !== newBehaviorData.jumpSustainTime) {
        this.setJumpSustainTime(newBehaviorData.jumpSustainTime);
      }
      if (oldBehaviorData.jumpHeight !== newBehaviorData.jumpHeight) {
        this.setJumpSpeed(this.getJumpSpeedToReach(newBehaviorData.jumpHeight));
      }
      return true;
    }

    getNetworkSyncData(): PhysicsCharacter3DNetworkSyncData {
      // This method is called, so we are synchronizing this object.
      // Let's clear the inputs between frames as we control it.
      this._dontClearInputsBetweenFrames = false;

      return {
        ...super.getNetworkSyncData(),
        props: {
          fwa: this._forwardAngle,
          fws: this._currentForwardSpeed,
          sws: this._currentSidewaysSpeed,
          fs: this._currentFallSpeed,
          js: this._currentJumpSpeed,
          cj: this._canJump,
          lek: this._wasLeftKeyPressed,
          rik: this._wasRightKeyPressed,
          upk: this._wasForwardKeyPressed,
          dok: this._wasBackwardKeyPressed,
          juk: this._wasJumpKeyPressed,
          us: this._wasStickUsed,
          sa: this._stickAngle,
          sf: this._stickForce,
          tscjs: this._timeSinceCurrentJumpStart,
          jkhsjs: this._jumpKeyHeldSinceJumpStart,
        },
      };
    }

    updateFromNetworkSyncData(
      networkSyncData: PhysicsCharacter3DNetworkSyncData
    ) {
      super.updateFromNetworkSyncData(networkSyncData);

      const behaviorSpecificProps = networkSyncData.props;
      this._forwardAngle = behaviorSpecificProps.fwa;
      this._currentForwardSpeed = behaviorSpecificProps.fws;
      this._currentSidewaysSpeed = behaviorSpecificProps.sws;
      this._currentFallSpeed = behaviorSpecificProps.fs;
      this._currentJumpSpeed = behaviorSpecificProps.js;
      this._canJump = behaviorSpecificProps.cj;
      this.hasPressedForwardKey = behaviorSpecificProps.upk;
      this.hasPressedBackwardKey = behaviorSpecificProps.dok;
      this.hasPressedLeftKey = behaviorSpecificProps.lek;
      this.hasPressedRightKey = behaviorSpecificProps.rik;
      this.hasPressedJumpKey = behaviorSpecificProps.juk;
      this.hasUsedStick = behaviorSpecificProps.us;
      this._stickAngle = behaviorSpecificProps.sa;
      this._stickForce = behaviorSpecificProps.sf;
      this._timeSinceCurrentJumpStart = behaviorSpecificProps.tscjs;
      this._jumpKeyHeldSinceJumpStart = behaviorSpecificProps.jkhsjs;

      // When the object is synchronized from the network, the inputs must not be cleared.
      this._dontClearInputsBetweenFrames = true;
    }

    getPhysicsPosition(result: Jolt.RVec3): Jolt.RVec3 {
      const { behavior } = this.getPhysics3D();
      result.Set(
        this.owner3D.getX() * this._sharedData.worldInvScale,
        this.owner3D.getY() * this._sharedData.worldInvScale,
        this.owner3D.getZ() * this._sharedData.worldInvScale +
          behavior.shapeHalfDepth
      );
      return result;
    }

    moveObjectToPhysicsPosition(physicsPosition: Jolt.RVec3): void {
      const { behavior } = this.getPhysics3D();
      this.owner3D.setX(physicsPosition.GetX() * this._sharedData.worldScale);
      this.owner3D.setY(physicsPosition.GetY() * this._sharedData.worldScale);
      this.owner3D.setZ(
        (physicsPosition.GetZ() - behavior.shapeHalfDepth) *
          this._sharedData.worldScale
      );
    }

    onDeActivate() {}

    onActivate() {}

    onDestroy() {
      this.onDeActivate();
    }

    doStepPreEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {
      // Trigger createAndAddBody()
      this.getPhysics3D();
    }

    doBeforePhysicsStep(timeDelta: float): void {
      const {
        behavior,
        extendedUpdateSettings,
        broadPhaseLayerFilter,
        objectLayerFilter,
        bodyFilter,
        shapeFilter,
      } = this.getPhysics3D();
      if (!this.character) {
        return;
      }
      const characterBody = behavior._body;
      if (!characterBody) {
        return;
      }
      const worldInvScale = this._sharedData.worldInvScale;

      const oldX = this.character.GetPosition().GetX();
      const oldY = this.character.GetPosition().GetY();
      const oldZ = this.character.GetPosition().GetZ();

      this.updateCharacterSpeedFromInputs(timeDelta);

      if (this._currentJumpSpeed > 0) {
        this._timeSinceCurrentJumpStart += timeDelta;
      }
      // Check if the jump key is continuously held since
      // the beginning of the jump.
      if (!this.hasPressedJumpKey) {
        this._jumpKeyHeldSinceJumpStart = false;
      }
      if (
        this._canJump &&
        this.hasPressedJumpKey &&
        // Avoid the character to jump in loop when the jump key is held.
        !this._jumpKeyHeldSinceJumpStart
      ) {
        this._currentJumpSpeed = this._jumpSpeed;
        this._currentFallSpeed = 0;
        this._canJump = false;
        this._jumpKeyHeldSinceJumpStart = true;
        this._timeSinceCurrentJumpStart = 0;
      }
      if (!this.isOnFloor()) {
        // Decrease jump speed after the (optional) jump sustain time is over.
        const sustainJumpSpeed =
          this._jumpKeyHeldSinceJumpStart &&
          this._timeSinceCurrentJumpStart < this._jumpSustainTime;
        if (!sustainJumpSpeed) {
          this._currentJumpSpeed = Math.max(
            0,
            this._currentJumpSpeed - this._gravity * timeDelta
          );
        }
        this._currentFallSpeed = Math.min(
          this._maxFallingSpeed,
          this._currentFallSpeed + this._gravity * timeDelta
        );
      }

      let groundVelocityX = 0;
      let groundVelocityY = 0;
      let groundVelocityZ = 0;
      if (this.character.IsSupported()) {
        this.updateGroundVelocity(behavior, timeDelta);
        const groundVelocity = this.character.GetGroundVelocity();
        groundVelocityX = groundVelocity.GetX();
        groundVelocityY = groundVelocity.GetY();
        groundVelocityZ = groundVelocity.GetZ();
      }

      let forwardSpeed = this._currentForwardSpeed;
      let sidewaysSpeed = this._currentSidewaysSpeed;
      if (sidewaysSpeed !== 0 && forwardSpeed !== 0) {
        // It avoids the speed vector to go outside of an ellipse.
        const speedNormalizationInverseRatio = Math.hypot(
          forwardSpeed / this._forwardSpeedMax,
          sidewaysSpeed / this._sidewaysSpeedMax
        );
        if (speedNormalizationInverseRatio > 1) {
          forwardSpeed /= speedNormalizationInverseRatio;
          sidewaysSpeed /= speedNormalizationInverseRatio;
        }
      }
      forwardSpeed *= worldInvScale;
      sidewaysSpeed *= worldInvScale;
      const angle = gdjs.toRad(this._forwardAngle);
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const speedX = forwardSpeed * cosA - sidewaysSpeed * sinA;
      const speedY = forwardSpeed * sinA + sidewaysSpeed * cosA;
      this.character.SetLinearVelocity(
        this.getVec3(
          groundVelocityX + speedX,
          groundVelocityY + speedY,
          // The ground velocity is not added on Z as it's handled by mStickToFloorStepDown.
          (this._currentJumpSpeed - this._currentFallSpeed) * worldInvScale
        )
      );

      if (this.isOnFloor()) {
        // Keep the character on the floor when walking down-hill.
        const walkingDistance = Math.max(
          Math.hypot(
            this.character.GetPosition().GetX() - this.oldPhysicsPosition[0],
            this.character.GetPosition().GetY() - this.oldPhysicsPosition[1]
          ),
          Math.hypot(
            this.character.GetLinearVelocity().GetX(),
            this.character.GetLinearVelocity().GetY()
          ) * timeDelta
        );
        this.oldPhysicsPosition[0] = this.character.GetPosition().GetX();
        this.oldPhysicsPosition[1] = this.character.GetPosition().GetY();

        // A safety margin is taken as if the ground normal is too steep, the
        // character will fall next step anyway.
        const stickToFloorStepDownZ = Math.max(
          -0.01 +
            1.01 *
              Math.min(
                // Follow the platform slope...
                -walkingDistance * this._slopeClimbingFactor,
                // ...and follow a platform falling...
                groundVelocityZ * timeDelta
              ),
          // ...but never fall faster than the max fall speed.
          -this._maxFallingSpeed * worldInvScale * timeDelta
        );
        extendedUpdateSettings.mStickToFloorStepDown.Set(
          0,
          0,
          stickToFloorStepDownZ
        );
      } else {
        extendedUpdateSettings.mStickToFloorStepDown.Set(0, 0, 0);
      }

      this.character.ExtendedUpdate(
        timeDelta,
        this.character.GetUp(),
        extendedUpdateSettings,
        broadPhaseLayerFilter,
        objectLayerFilter,
        bodyFilter,
        shapeFilter,
        this._sharedData.jolt.GetTempAllocator()
      );

      if (this.isOnFloor()) {
        this._canJump = true;
        this._currentFallSpeed = 0;
        this._currentJumpSpeed = 0;
      }

      this._wasForwardKeyPressed = this.hasPressedForwardKey;
      this._wasBackwardKeyPressed = this.hasPressedBackwardKey;
      this._wasRightKeyPressed = this.hasPressedRightKey;
      this._wasLeftKeyPressed = this.hasPressedLeftKey;
      this._wasJumpKeyPressed = this.hasPressedJumpKey;
      this._wasStickUsed = this.hasPressedJumpKey;

      if (!this._dontClearInputsBetweenFrames) {
        this.hasPressedForwardKey = false;
        this.hasPressedBackwardKey = false;
        this.hasPressedRightKey = false;
        this.hasPressedLeftKey = false;
        this.hasPressedJumpKey = false;
        this.hasUsedStick = false;
      }

      this._hasReallyMoved =
        Math.abs(this.character.GetPosition().GetX() - oldX) >
          PhysicsCharacter3DRuntimeBehavior.epsilon ||
        Math.abs(this.character.GetPosition().GetY() - oldY) >
          PhysicsCharacter3DRuntimeBehavior.epsilon ||
        Math.abs(this.character.GetPosition().GetZ() - oldZ) >
          PhysicsCharacter3DRuntimeBehavior.epsilon;
    }

    private updateCharacterSpeedFromInputs(timeDelta: float) {
      /** A stick with a half way force targets a lower speed than the maximum speed. */
      let targetedForwardSpeed = 0;
      // Change the speed according to the player's input.
      // TODO Give priority to the last key for faster reaction time.
      if (this.hasPressedBackwardKey !== this.hasPressedForwardKey) {
        if (this.hasPressedBackwardKey) {
          targetedForwardSpeed = -this._forwardSpeedMax;
        } else if (this.hasPressedForwardKey) {
          targetedForwardSpeed = this._forwardSpeedMax;
        }
      } else if (this.hasUsedStick) {
        targetedForwardSpeed =
          -this._forwardSpeedMax *
          this._stickForce *
          Math.sin(gdjs.toRad(this._stickAngle));
      }
      this._currentForwardSpeed =
        PhysicsCharacter3DRuntimeBehavior.getAcceleratedSpeed(
          this._currentForwardSpeed,
          targetedForwardSpeed,
          this._forwardSpeedMax,
          this._forwardAcceleration,
          this._forwardDeceleration,
          timeDelta
        );
      /** A stick with a half way force targets a lower speed than the maximum speed. */
      let targetedSidewaysSpeed = 0;
      if (this.hasPressedLeftKey !== this.hasPressedRightKey) {
        if (this.hasPressedLeftKey) {
          targetedSidewaysSpeed = -this._sidewaysSpeedMax;
        } else if (this.hasPressedRightKey) {
          targetedSidewaysSpeed = this._sidewaysSpeedMax;
        }
      } else if (this.hasUsedStick) {
        targetedSidewaysSpeed =
          this._sidewaysSpeedMax *
          this._stickForce *
          Math.cos(gdjs.toRad(this._stickAngle));
      }
      this._currentSidewaysSpeed =
        PhysicsCharacter3DRuntimeBehavior.getAcceleratedSpeed(
          this._currentSidewaysSpeed,
          targetedSidewaysSpeed,
          this._sidewaysSpeedMax,
          this._sidewaysAcceleration,
          this._sidewaysDeceleration,
          timeDelta
        );
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
      if (targetedSpeed < 0) {
        if (currentSpeed <= targetedSpeed) {
          // Reduce the speed to match the stick force.
          newSpeed = Math.min(
            targetedSpeed,
            currentSpeed + deceleration * timeDelta
          );
        } else if (currentSpeed <= 0) {
          newSpeed -= acceleration * timeDelta;
        } else {
          // Turn back at least as fast as it would stop.
          newSpeed = Math.max(
            targetedSpeed,
            currentSpeed - Math.max(acceleration, deceleration) * timeDelta
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
          newSpeed += acceleration * timeDelta;
        } else {
          // Turn back at least as fast as it would stop.
          newSpeed = Math.min(
            targetedSpeed,
            currentSpeed + Math.max(acceleration, deceleration) * timeDelta
          );
        }
      } else {
        if (currentSpeed < 0) {
          newSpeed = Math.min(currentSpeed + deceleration * timeDelta, 0);
        }
        if (currentSpeed > 0) {
          newSpeed = Math.max(currentSpeed - deceleration * timeDelta, 0);
        }
      }
      return gdjs.evtTools.common.clamp(newSpeed, -speedMax, speedMax);
    }

    private updateGroundVelocity(
      behavior: Physics3DRuntimeBehavior,
      timeDelta: float
    ) {
      if (!this.character) {
        return;
      }
      const characterBody = behavior._body;
      if (!characterBody) {
        return;
      }
      const worldInvScale = this._sharedData.worldInvScale;

      if (!this.character.IsSupported()) {
        return;
      }

      const groundBody = this._sharedData.physicsSystem
        .GetBodyLockInterface()
        .TryGetBody(this.character.GetGroundBodyID());

      const stillKinematicPlatform =
        groundBody.IsKinematic() &&
        groundBody.GetLinearVelocity().Equals(Jolt.Vec3.prototype.sZero()) &&
        groundBody.GetAngularVelocity().Equals(Jolt.Vec3.prototype.sZero());
      if (stillKinematicPlatform) {
        const groundBehavior = groundBody.gdjsAssociatedBehavior;
        if (groundBehavior) {
          const inverseTimeDelta = 1 / timeDelta;
          // The platform may be moved by position changes instead of velocity.
          // Emulate a velocity from the position changes.
          groundBody.SetLinearVelocity(
            this.getVec3(
              (groundBehavior.owner3D.getX() - groundBehavior._objectOldX) *
                worldInvScale *
                inverseTimeDelta,
              (groundBehavior.owner3D.getY() - groundBehavior._objectOldY) *
                worldInvScale *
                inverseTimeDelta,
              (groundBehavior.owner3D.getZ() - groundBehavior._objectOldZ) *
                worldInvScale *
                inverseTimeDelta
            )
          );
          groundBody.SetAngularVelocity(
            this.getVec3(
              0,
              0,
              gdjs.toRad(
                gdjs.evtTools.common.angleDifference(
                  groundBehavior.owner3D.getAngle(),
                  groundBehavior._objectOldRotationZ
                )
              ) * inverseTimeDelta
            )
          );
        }
      }
      this.character.UpdateGroundVelocity();

      const groundAngularVelocityZ = groundBody.GetAngularVelocity().GetZ();
      if (groundAngularVelocityZ !== 0) {
        // Make the character rotate with the platform on Z axis.
        const rotation = Jolt.Quat.prototype.sEulerAngles(
          this.getVec3(
            0,
            0,
            characterBody
              .GetRotation()
              .GetRotationAngle(Jolt.Vec3.prototype.sAxisZ()) +
              groundAngularVelocityZ * timeDelta
          )
        );
        // TODO Should the character be used instead of the body directly?
        this._sharedData.bodyInterface.SetPositionAndRotation(
          characterBody.GetID(),
          this.getPhysicsPosition(this.getRVec3(0, 0, 0)),
          rotation,
          Jolt.EActivation_Activate
        );
      }
      if (stillKinematicPlatform) {
        groundBody.SetLinearVelocity(Jolt.Vec3.prototype.sZero());
        groundBody.SetAngularVelocity(Jolt.Vec3.prototype.sZero());
      }
    }

    doStepPostEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {}

    onObjectHotReloaded() {}

    /**
     * Get maximum angle of a slope for the Character to run on it as a floor.
     * @returns the slope maximum angle, in degrees.
     */
    getSlopeMaxAngle(): float {
      return this._slopeMaxAngle;
    }

    /**
     * Set the maximum slope angle of the Character.
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
        // Avoid a `_slopeClimbingFactor` set to exactly 0.
        // Otherwise, this can lead the floor finding functions to consider
        // a floor to be "too high" to reach, even if the object is very slightly
        // inside it, which can happen because of rounding errors.
        // See "Floating-point error mitigations" tests.
        this._slopeClimbingFactor = Math.max(
          1 / 1024,
          Math.tan(gdjs.toRad(slopeMaxAngle))
        );
      }
      // The floor is in 3D but to go back to 2D trigonometry, we can take the
      // 2D space generated by the floor normal and the Z axis, given that:
      // - The normal keeps the same Z coordinate (as the Z axis is included in the 2D space)
      // - The normal keeps the same length (as the normal is included in the 2D space)
      this._slopeClimbingMinNormalZ = Math.min(
        Math.cos(gdjs.toRad(slopeMaxAngle)),
        1 - 1 / 1024
      );
    }

    /**
     * Get the gravity of the Character.
     * @returns The current gravity.
     */
    getGravity(): float {
      return this._gravity;
    }

    /**
     * Set the gravity of the Character.
     * @param gravity The new gravity.
     */
    setGravity(gravity: float): void {
      this._gravity = gravity;
    }

    /**
     * Get the maximum falling speed of the Character.
     * @returns The maximum falling speed.
     */
    getMaxFallingSpeed(): float {
      return this._maxFallingSpeed;
    }

    /**
     * Set the maximum falling speed of the Character.
     * @param maxFallingSpeed The maximum falling speed.
     * @param tryToPreserveAirSpeed If true and if jumping, tune the current
     * jump speed to preserve the overall speed in the air.
     */
    setMaxFallingSpeed(
      maxFallingSpeed: float,
      tryToPreserveAirSpeed: boolean = false
    ): void {
      if (tryToPreserveAirSpeed && !this.isOnFloor()) {
        // If the falling speed is too high compared to the new max falling speed,
        // reduce it and adapt the jump speed to preserve the overall vertical speed.
        const fallingSpeedOverflow = this._currentFallSpeed - maxFallingSpeed;
        if (fallingSpeedOverflow > 0) {
          this._currentFallSpeed -= fallingSpeedOverflow;
          this._currentJumpSpeed = Math.max(
            0,
            this.getCurrentJumpSpeed() - fallingSpeedOverflow
          );
        }
      }
      this._maxFallingSpeed = maxFallingSpeed;
    }

    /**
     * Get the forward acceleration value of the Character.
     * @returns The current acceleration.
     */
    getForwardAcceleration(): float {
      return this._forwardAcceleration;
    }

    /**
     * Set the forward acceleration of the Character.
     * @param forwardAcceleration The new acceleration.
     */
    setForwardAcceleration(forwardAcceleration: float): void {
      this._forwardAcceleration = forwardAcceleration;
    }

    /**
     * Get the forward deceleration of the Character.
     * @returns The current deceleration.
     */
    getForwardDeceleration(): float {
      return this._forwardDeceleration;
    }

    /**
     * Set the forward deceleration of the Character.
     * @param forwardDeceleration The new deceleration.
     */
    setForwardDeceleration(forwardDeceleration: float): void {
      this._forwardDeceleration = forwardDeceleration;
    }

    /**
     * Get the forward maximum speed of the Character.
     * @returns The maximum speed.
     */
    getForwardSpeedMax(): float {
      return this._forwardSpeedMax;
    }

    /**
     * Set the forward maximum speed of the Character.
     * @param forwardSpeedMax The new maximum speed.
     */
    setForwardSpeedMax(forwardSpeedMax: float): void {
      this._forwardSpeedMax = forwardSpeedMax;
    }

    /**
     * Get the sideways acceleration value of the Character.
     * @returns The current acceleration.
     */
    getSidewaysAcceleration(): float {
      return this._sidewaysAcceleration;
    }

    /**
     * Set the sideways acceleration of the Character.
     * @param sidewaysAcceleration The new acceleration.
     */
    setSidewaysAcceleration(sidewaysAcceleration: float): void {
      this._sidewaysAcceleration = sidewaysAcceleration;
    }

    /**
     * Get the sideways deceleration of the Character.
     * @returns The current deceleration.
     */
    getSidewaysDeceleration(): float {
      return this._sidewaysDeceleration;
    }

    /**
     * Set the sideways deceleration of the Character.
     * @param sidewaysDeceleration The new deceleration.
     */
    setSidewaysDeceleration(sidewaysDeceleration: float): void {
      this._sidewaysDeceleration = sidewaysDeceleration;
    }

    /**
     * Get the sideways maximum speed of the Character.
     * @returns The maximum speed.
     */
    getSidewaysSpeedMax(): float {
      return this._sidewaysSpeedMax;
    }

    /**
     * Set the sideways maximum speed of the Character.
     * @param sidewaysSpeedMax The new maximum speed.
     */
    setSidewaysSpeedMax(sidewaysSpeedMax: float): void {
      this._sidewaysSpeedMax = sidewaysSpeedMax;
    }

    /**
     * Get the jump speed of the Character.
     * @returns The jump speed.
     */
    getJumpSpeed(): float {
      return this._jumpSpeed;
    }

    /**
     * Set the jump speed of the Character.
     * @param jumpSpeed The new jump speed.
     */
    setJumpSpeed(jumpSpeed: float): void {
      this._jumpSpeed = jumpSpeed;
    }

    /**
     * Get the jump sustain time of the Character.
     * @returns The jump sustain time.
     */
    getJumpSustainTime(): float {
      return this._jumpSustainTime;
    }

    /**
     * Set the jump sustain time of the Character.
     * @param jumpSpeed The new jump sustain time.
     */
    setJumpSustainTime(jumpSustainTime: float): void {
      this._jumpSustainTime = jumpSustainTime;
    }

    getForwardAngle(): float {
      return this._forwardAngle;
    }

    setForwardAngle(angle: float): void {
      this._forwardAngle = angle;
    }

    isForwardAngleAround(degreeAngle: float, tolerance: float) {
      return (
        Math.abs(
          gdjs.evtTools.common.angleDifference(this._forwardAngle, degreeAngle)
        ) <= tolerance
      );
    }

    /**
     * Get the current speed of the Character.
     * @returns The current speed.
     */
    getCurrentForwardSpeed(): float {
      return this._currentForwardSpeed;
    }

    /**
     * Set the current speed of the Character.
     * @param currentForwardSpeed The current speed.
     */
    setCurrentForwardSpeed(currentForwardSpeed: float): void {
      this._currentForwardSpeed = gdjs.evtTools.common.clamp(
        currentForwardSpeed,
        -this._currentForwardSpeed,
        this._currentForwardSpeed
      );
    }

    /**
     * Get the current speed of the Character.
     * @returns The current speed.
     */
    getCurrentSidewaysSpeed(): float {
      return this._currentSidewaysSpeed;
    }

    /**
     * Set the current speed of the Character.
     * @param currentSidewaysSpeed The current speed.
     */
    setCurrentSidewaysSpeed(currentSidewaysSpeed: float): void {
      this._currentSidewaysSpeed = gdjs.evtTools.common.clamp(
        currentSidewaysSpeed,
        -this._currentSidewaysSpeed,
        this._currentSidewaysSpeed
      );
    }

    /**
     * Get the speed at which the object is falling. It is 0 when the object is
     * on a floor, and non 0 as soon as the object leaves the floor.
     * @returns The current fall speed.
     */
    getCurrentFallSpeed(): float {
      return this._currentFallSpeed;
    }

    /**
     * Set the current fall speed.
     *
     * When the character is not in the falling state this method has no effect.
     */
    setCurrentFallSpeed(currentFallSpeed: float) {
      if (this.isFalling()) {
        this._currentFallSpeed = gdjs.evtTools.common.clamp(
          currentFallSpeed,
          0,
          this._maxFallingSpeed
        );
      }
    }

    /**
     * Get the current jump speed of the Character.
     * @returns The current jump speed.
     */
    getCurrentJumpSpeed(): float {
      return this._currentJumpSpeed;
    }

    /**
     * Check if the Character can jump.
     * @returns Returns true if the object can jump.
     */
    canJump(): boolean {
      return this._canJump;
    }

    /**
     * Allow the Character to jump again.
     */
    setCanJump(): void {
      this._canJump = true;
    }

    /**
     * Forbid the Character to air jump.
     */
    setCanNotAirJump(): void {
      if (this.isJumping() || this.isFalling()) {
        this._canJump = false;
      }
    }

    /**
     * Abort the current jump.
     *
     * When the character is not in the jumping state this method has no effect.
     */
    abortJump(): void {
      if (this.isJumping()) {
        this._currentFallSpeed = 0;
        this._currentJumpSpeed = 0;
      }
    }

    simulateForwardKey(): void {
      this.hasPressedForwardKey = true;
    }

    wasForwardKeyPressed(): boolean {
      return this._wasForwardKeyPressed;
    }

    simulateBackwardKey(): void {
      this.hasPressedBackwardKey = true;
    }

    wasBackwardKeyPressed(): boolean {
      return this._wasBackwardKeyPressed;
    }

    simulateRightKey(): void {
      this.hasPressedRightKey = true;
    }

    wasRightKeyPressed(): boolean {
      return this._wasRightKeyPressed;
    }

    simulateLeftKey(): void {
      this.hasPressedLeftKey = true;
    }

    wasLeftKeyPressed(): boolean {
      return this._wasLeftKeyPressed;
    }

    simulateJumpKey(): void {
      this.hasPressedJumpKey = true;
    }

    wasJumpKeyPressed(): boolean {
      return this._wasJumpKeyPressed;
    }

    simulateStick(stickAngle: float, stickForce: float) {
      this.hasUsedStick = true;
      this._stickAngle = stickAngle;
      this._stickForce = Math.max(0, Math.min(1, stickForce));
    }

    wasStickUsed(): boolean {
      return this._wasStickUsed;
    }

    getStickAngle(): float {
      return this._wasStickUsed ? this._stickAngle : 0;
    }

    getStickForce(): float {
      return this._wasStickUsed ? this._stickForce : 0;
    }

    // TODO Should we add a "is sliding" condition?
    /**
     * Check if the Character is on a floor.
     * @returns Returns true if on a floor and false if not.
     */
    isOnFloor(): boolean {
      return this.character
        ? this.character.IsSupported() &&
            // Ensure characters don't land on too step floor.
            this.character.GetGroundNormal().GetZ() >=
              this._slopeClimbingMinNormalZ &&
            // Ensure characters don't land on a platform corner while jumping.
            this._currentJumpSpeed <= this._currentFallSpeed
        : false;
    }

    /**
     * Check if the Character is on the given object.
     * @returns Returns true if on the object and false if not.
     */
    isOnFloorObject(physics3DBehavior: gdjs.Physics3DRuntimeBehavior): boolean {
      if (!physics3DBehavior._body || !this.character || !this.isOnFloor()) {
        return false;
      }
      return (
        this.character.GetGroundBodyID().GetIndexAndSequenceNumber() ===
        physics3DBehavior._body.GetID().GetIndexAndSequenceNumber()
      );
    }

    /**
     * Check if the Character is jumping.
     * @returns Returns true if jumping and false if not.
     */
    isJumping(): boolean {
      return this._currentJumpSpeed > 0;
    }

    /**
     * Check if the Character is in the falling state. This is false
     * if the object is jumping, even if the object is going down after reaching
     * the jump peak.
     * @returns Returns true if it is falling and false if not.
     */
    isFallingWithoutJumping(): boolean {
      return !this.isOnFloor() && this._currentJumpSpeed === 0;
    }

    /**
     * Check if the Character is "going down", either because it's in the
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
        !this.isOnFloor() && this._currentJumpSpeed < this._currentFallSpeed
      );
    }

    /**
     * Check if the Character is moving.
     * @returns Returns true if it is moving and false if not.
     */
    isMovingEvenALittle(): boolean {
      return (
        (this._hasReallyMoved && this._currentForwardSpeed !== 0) ||
        this._currentJumpSpeed !== 0 ||
        this._currentFallSpeed !== 0
      );
    }

    getJumpSpeedToReach(jumpHeight: float): float {
      // Formulas used in this extension were generated from a math model.
      // They are probably not understandable on their own.
      // If you need to modify them or need to write new feature,
      // please take a look at the platformer extension documentation:
      // https://github.com/4ian/GDevelop/tree/master/Extensions/PlatformBehavior#readme

      jumpHeight = -Math.abs(jumpHeight);

      const gravity = this._gravity;
      const maxFallingSpeed = this._maxFallingSpeed;
      const jumpSustainTime = this._jumpSustainTime;

      const maxFallingSpeedReachedTime = maxFallingSpeed / gravity;

      // The implementation jumps from one quadratic resolution to another
      // to find the right formula to use as the time is unknown.

      const sustainCase = (jumpHeight) => Math.sqrt(-jumpHeight * gravity * 2);
      const maxFallingCase = (jumpHeight) =>
        -gravity * jumpSustainTime +
        maxFallingSpeed +
        Math.sqrt(
          gravity * gravity * jumpSustainTime * jumpSustainTime -
            2 * jumpHeight * gravity -
            maxFallingSpeed * maxFallingSpeed
        );

      let jumpSpeed = 0;
      let peakTime = 0;
      if (maxFallingSpeedReachedTime > jumpSustainTime) {
        // common case
        jumpSpeed =
          -gravity * jumpSustainTime +
          Math.sqrt(
            2 * gravity * gravity * jumpSustainTime * jumpSustainTime -
              4 * jumpHeight * gravity
          );
        peakTime = (gravity * jumpSustainTime + jumpSpeed) / (2 * gravity);
        if (peakTime < jumpSustainTime) {
          jumpSpeed = sustainCase(jumpHeight);
        } else if (peakTime > maxFallingSpeedReachedTime) {
          jumpSpeed = maxFallingCase(jumpHeight);
        }
      } else {
        // affine case can't have a maximum

        // sustain case
        jumpSpeed = sustainCase(jumpHeight);
        peakTime = jumpSpeed / gravity;
        if (peakTime > maxFallingSpeedReachedTime) {
          jumpSpeed = maxFallingCase(jumpHeight);
        }
      }
      return jumpSpeed;
    }
  }

  gdjs.registerBehavior(
    'Physics3D::PhysicsCharacter3D',
    gdjs.PhysicsCharacter3DRuntimeBehavior
  );

  export namespace PhysicsCharacter3DRuntimeBehavior {
    export class CharacterBodyUpdater {
      characterBehavior: gdjs.PhysicsCharacter3DRuntimeBehavior;

      constructor(characterBehavior: gdjs.PhysicsCharacter3DRuntimeBehavior) {
        this.characterBehavior = characterBehavior;
      }

      createAndAddBody(): Jolt.Body {
        const { _slopeMaxAngle, owner3D, _sharedData } = this.characterBehavior;
        const { behavior } = this.characterBehavior.getPhysics3D();

        const shape = behavior.createShape();

        const settings = new Jolt.CharacterVirtualSettings();
        settings.mInnerBodyLayer = behavior.getBodyLayer();
        settings.mInnerBodyShape = shape;
        settings.mMass = shape.GetMassProperties().get_mMass();
        settings.mMaxSlopeAngle = gdjs.toRad(_slopeMaxAngle);
        settings.mShape = shape;
        settings.mUp = Jolt.Vec3.prototype.sAxisZ();
        settings.mBackFaceMode = Jolt.EBackFaceMode_CollideWithBackFaces;
        // TODO Should we make them configurable?
        //settings.mMaxStrength = maxStrength;
        //settings.mCharacterPadding = characterPadding;
        //settings.mPenetrationRecoverySpeed = penetrationRecoverySpeed;
        //settings.mPredictiveContactDistance = predictiveContactDistance;
        const depth = owner3D.getDepth() * _sharedData.worldInvScale;
        const width = owner3D.getWidth() * _sharedData.worldInvScale;
        const height = owner3D.getHeight() * _sharedData.worldInvScale;
        // Only the bottom of the capsule can make a contact with the floor.
        // It avoids characters from sticking to walls.
        const capsuleHalfLength = depth / 2;
        const capsuleRadius = Math.sqrt(width * height) / 2;
        settings.mSupportingVolume = new Jolt.Plane(
          Jolt.Vec3.prototype.sAxisZ(),
          // TODO It's strange that the value is positive.
          // Use a big safety margin as the ground normal will be checked anyway.
          // It only avoids to detect walls as ground.
          capsuleHalfLength -
            capsuleRadius *
              (1 - Math.cos(gdjs.toRad(Math.min(_slopeMaxAngle + 20, 70))))
        );
        const character = new Jolt.CharacterVirtual(
          settings,
          this.characterBehavior.getPhysicsPosition(
            _sharedData.getRVec3(0, 0, 0)
          ),
          behavior.getPhysicsRotation(_sharedData.getQuat(0, 0, 0, 1)),
          _sharedData.physicsSystem
        );
        const body = _sharedData.physicsSystem
          .GetBodyLockInterface()
          .TryGetBody(character.GetInnerBodyID());
        this.characterBehavior.character = character;
        // TODO This is not really reliable. We could choose to disable it and force user to use the "is on platform" condition.
        //body.SetCollideKinematicVsNonDynamic(true);
        return body;
      }

      updateObjectFromBody() {
        const { character } = this.characterBehavior;
        if (!character) {
          return;
        }
        // We can't rely on the body position because of mCharacterPadding.
        this.characterBehavior.moveObjectToPhysicsPosition(
          character.GetPosition()
        );
        // No need to update the rotation as CharacterVirtual doesn't change it.
      }

      updateBodyFromObject() {
        const { behavior } = this.characterBehavior.getPhysics3D();
        const { character, owner3D, _sharedData } = this.characterBehavior;
        if (!character) {
          return;
        }
        if (
          behavior._objectOldX !== owner3D.getX() ||
          behavior._objectOldY !== owner3D.getY() ||
          behavior._objectOldZ !== owner3D.getZ()
        ) {
          this.updateCharacterPosition();
        }
        if (
          behavior._objectOldRotationX !== owner3D.getRotationX() ||
          behavior._objectOldRotationY !== owner3D.getRotationY() ||
          behavior._objectOldRotationZ !== owner3D.getAngle()
        ) {
          behavior.getPhysicsRotation(
            behavior.getPhysicsRotation(_sharedData.getQuat(0, 0, 0, 1))
          );
        }
      }

      updateCharacterPosition() {
        const { character, _sharedData } = this.characterBehavior;
        if (!character) {
          return;
        }
        character.SetPosition(
          this.characterBehavior.getPhysicsPosition(
            _sharedData.getRVec3(0, 0, 0)
          )
        );
      }

      recreateShape() {
        const {
          behavior,
          broadPhaseLayerFilter,
          objectLayerFilter,
          bodyFilter,
          shapeFilter,
        } = this.characterBehavior.getPhysics3D();
        const { character, _sharedData } = this.characterBehavior;
        if (!character) {
          return;
        }
        const shape = behavior.createShape();
        const isShapeValid = character.SetShape(
          shape,
          Number.MAX_VALUE,
          broadPhaseLayerFilter,
          objectLayerFilter,
          bodyFilter,
          shapeFilter,
          _sharedData.jolt.GetTempAllocator()
        );
        if (!isShapeValid) {
          return;
        }
        character.SetInnerBodyShape(shape);
        character.SetMass(shape.GetMassProperties().get_mMass());

        // shapeHalfDepth may have changed, update the character position accordingly.
        this.updateCharacterPosition();
      }
    }
  }
}
