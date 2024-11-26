/// <reference path="./jolt-physics.d.ts" />

namespace Jolt {
  export interface Body {
    gdjsAssociatedCharacterBehavior: gdjs.PhysicsCharacter3DRuntimeBehavior | null;
  }
}

namespace gdjs {
  interface PhysicsCharacter3DNetworkSyncDataType {
    fws: float,
    sws: float,
    fs: float,
    js: float,
    cj: boolean,
    tscjs: float,
    jkhsjs: boolean
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

    _slopeMaxAngle: float;
    _slopeClimbingFactor: float = 1;
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
    hasJumpKeyBeenConsumed: boolean = false;
    private _wasStickUsed: boolean = false;
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

    private getQuat(x: float, y: float, z: float, w: float): Jolt.Quat {
      const tempQuat = this._sharedData._tempQuat;
      tempQuat.Set(x, y, z, w);
      return tempQuat;
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

      behavior.createAndAddBody = () => this.createAndAddBody();
      behavior.recreateBody();

      return this.physics3D;
    }

    updateFromBehaviorData(oldBehaviorData, newBehaviorData): boolean {
      if (oldBehaviorData.gravity !== newBehaviorData.gravity) {
        this.setGravity(newBehaviorData.gravity);
      }
      if (oldBehaviorData.maxFallingSpeed !== newBehaviorData.maxFallingSpeed) {
        this.setMaxFallingSpeed(newBehaviorData.maxFallingSpeed);
      }
      if (oldBehaviorData.forwardAcceleration !== newBehaviorData.forwardAcceleration) {
        this.setForwardAcceleration(newBehaviorData.forwardAcceleration);
      }
      if (oldBehaviorData.forwardDeceleration !== newBehaviorData.forwardDeceleration) {
        this.setForwardDeceleration(newBehaviorData.forwardDeceleration);
      }
      if (oldBehaviorData.forwardSpeedMax !== newBehaviorData.forwardSpeedMax) {
        this.setForwardSpeedMax(newBehaviorData.forwardSpeedMax);
      }
      if (oldBehaviorData.sidewaysAcceleration !== newBehaviorData.sidewaysAcceleration) {
        this.setSidewaysAcceleration(newBehaviorData.sidewaysAcceleration);
      }
      if (oldBehaviorData.sidewaysDeceleration !== newBehaviorData.sidewaysDeceleration) {
        this.setSidewaysDeceleration(newBehaviorData.sidewaysDeceleration);
      }
      if (oldBehaviorData.sidewaysSpeedMax !== newBehaviorData.sidewaysSpeedMax) {
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
          fws: this._currentForwardSpeed,
          sws: this._currentSidewaysSpeed,
          fs: this._currentFallSpeed,
          js: this._currentJumpSpeed,
          cj: this._canJump,
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
      if (behaviorSpecificProps.fws !== this._currentForwardSpeed) {
        this._currentForwardSpeed = behaviorSpecificProps.fws;
      }
      if (behaviorSpecificProps.sws !== this._currentSidewaysSpeed) {
        this._currentSidewaysSpeed = behaviorSpecificProps.sws;
      }
      if (behaviorSpecificProps.fs !== this._currentFallSpeed) {
        this._currentFallSpeed = behaviorSpecificProps.fs;
      }
      if (behaviorSpecificProps.js !== this._currentJumpSpeed) {
        this._currentJumpSpeed = behaviorSpecificProps.js;
      }
      if (behaviorSpecificProps.cj !== this._canJump) {
        this._canJump = behaviorSpecificProps.cj;
      }
      if (behaviorSpecificProps.tscjs !== this._timeSinceCurrentJumpStart) {
        this._timeSinceCurrentJumpStart = behaviorSpecificProps.tscjs;
      }
      if (behaviorSpecificProps.jkhsjs !== this._jumpKeyHeldSinceJumpStart) {
        this._jumpKeyHeldSinceJumpStart = behaviorSpecificProps.jkhsjs;
      }

      // When the object is synchronized from the network, the inputs must not be cleared.
      this._dontClearInputsBetweenFrames = true;
    }

    createAndAddBody(): Jolt.Body {
      console.log('Create character');
      const { behavior } = this.getPhysics3D();
      const settings = new Jolt.CharacterVirtualSettings();
      settings.mInnerBodyLayer = behavior.getBodyLayer();
      settings.mInnerBodyShape = behavior.createShape();
      settings.mMass = 1000;
      settings.mMaxSlopeAngle = gdjs.toRad(this._slopeMaxAngle);
      //settings.mMaxStrength = maxStrength;
      settings.mShape = behavior.createShape();
      settings.mUp = Jolt.Vec3.prototype.sAxisZ();
      settings.mBackFaceMode = Jolt.EBackFaceMode_CollideWithBackFaces;
      //settings.mCharacterPadding = characterPadding;
      //settings.mPenetrationRecoverySpeed = penetrationRecoverySpeed;
      //settings.mPredictiveContactDistance = predictiveContactDistance;
      const depth = this.owner3D.getDepth() * this._sharedData.worldInvScale;
      const width = this.owner3D.getWidth() * this._sharedData.worldInvScale;
      const height = this.owner3D.getHeight() * this._sharedData.worldInvScale;
      // Only the bottom of the capsule can make a contact with the floor.
      // It avoids characters from sticking to walls.
      const capsuleHalfLength = depth / 2;
      const capsuleRadius = Math.sqrt(width * height) / 2;
      settings.mSupportingVolume = new Jolt.Plane(
        Jolt.Vec3.prototype.sAxisZ(),
        // TODO It's strange that the value is positive.
        capsuleHalfLength -
          capsuleRadius * (1 - Math.cos(gdjs.toRad(this._slopeMaxAngle)))
      );
      console.log(1 - Math.cos(gdjs.toRad(this._slopeMaxAngle)));
      this.character = new Jolt.CharacterVirtual(
        settings,
        behavior.getPhysicsPosition(this.getRVec3(0, 0, 0)),
        behavior.getPhysicsRotation(this.getQuat(0, 0, 0, 1)),
        this._sharedData.physicsSystem
      );
      const characterContactListener = new Jolt.CharacterContactListenerJS();
      characterContactListener.OnAdjustBodyVelocity = (
        character,
        body2Ptr,
        linearVelocityPtr,
        angularVelocity
      ) => {
        // const body2 = Jolt.wrapPointer(body2Ptr, Jolt.Body);
        // const linearVelocity = Jolt.wrapPointer(linearVelocityPtr, Jolt.Vec3);
        // console.log(
        //   'Add: ' +
        //     body2.GetLinearVelocity().GetX() +
        //     ' ' +
        //     body2.GetLinearVelocity().GetY()
        // );
        // linearVelocity.Set(
        //   linearVelocity.GetX() + body2.GetLinearVelocity().GetX(),
        //   linearVelocity.GetY() + body2.GetLinearVelocity().GetY(),
        //   linearVelocity.GetZ() + body2.GetLinearVelocity().GetZ()
        // );
      };
      characterContactListener.OnContactValidate = (
        character,
        bodyID2,
        subShapeID2
      ) => {
        return true;
      };
      characterContactListener.OnCharacterContactValidate = (
        character,
        otherCharacter,
        subShapeID2
      ) => {
        return true;
      };
      characterContactListener.OnContactAdded = (
        character,
        bodyID2,
        subShapeID2,
        contactPosition,
        contactNormal,
        settings
      ) => {};
      characterContactListener.OnCharacterContactAdded = (
        character,
        otherCharacter,
        subShapeID2,
        contactPosition,
        contactNormal,
        settings
      ) => {};
      characterContactListener.OnContactSolve = (
        character,
        bodyID2,
        subShapeID2,
        contactPosition,
        contactNormal,
        contactVelocity,
        contactMaterial,
        characterVelocity,
        newCharacterVelocity
      ) => {};
      characterContactListener.OnCharacterContactSolve = (
        character,
        otherCharacter,
        subShapeID2,
        contactPosition,
        contactNormal,
        contactVelocity,
        contactMaterial,
        characterVelocity,
        newCharacterVelocity
      ) => {};
      this.character.SetListener(characterContactListener);

      const body = this._sharedData.physicsSystem
        .GetBodyLockInterface()
        .TryGetBody(this.character.GetInnerBodyID());
      // TODO This is not really reliable. We could choose to disable it and force user to use the "is on platform" condition.
      body.SetCollideKinematicVsNonDynamic(true);
      return body;
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
      // console.log('Step character');

      // console.log(
      //   'Character: ' +
      //     this.character.GetPosition().GetX() *
      //       this._sharedData.worldScale +
      //     ' ' +
      //     this.character.GetPosition().GetY() *
      //       this._sharedData.worldScale +
      //     ' ' +
      //     this.character.GetPosition().GetZ() * this._sharedData.worldScale
      // );

      const oldX = this.character.GetPosition().GetX();
      const oldY = this.character.GetPosition().GetY();
      const oldZ = this.character.GetPosition().GetZ();

      let targetedForwardSpeed = 0;
      // Change the speed according to the player's input.
      // TODO Give priority to the last key for faster reaction time.
      if (this.hasPressedBackwardKey !== this.hasPressedForwardKey) {
        if (this.hasPressedBackwardKey) {
          targetedForwardSpeed = -this._forwardSpeedMax;
        } else if (this.hasPressedForwardKey) {
          targetedForwardSpeed = this._forwardSpeedMax;
        }
      } else if (this._stickForce !== 0) {
        targetedForwardSpeed =
          -this._forwardSpeedMax *
          this._stickForce *
          Math.sin(gdjs.toRad(this._stickAngle));
      }
      if (targetedForwardSpeed < 0) {
        if (this._currentForwardSpeed <= targetedForwardSpeed) {
          // Reduce the speed to match the stick force.
          this._currentForwardSpeed = Math.min(
            targetedForwardSpeed,
            this._currentForwardSpeed + this._forwardDeceleration * timeDelta
          );
        } else if (this._currentForwardSpeed <= 0) {
          this._currentForwardSpeed -= this._forwardAcceleration * timeDelta;
        } else {
          // Turn back at least as fast as it would stop.
          this._currentForwardSpeed -=
            Math.max(this._forwardAcceleration, this._forwardDeceleration) *
            timeDelta;
        }
      } else if (targetedForwardSpeed > 0) {
        if (this._currentForwardSpeed >= targetedForwardSpeed) {
          // Reduce the speed to match the stick force.
          this._currentForwardSpeed = Math.max(
            targetedForwardSpeed,
            this._currentForwardSpeed - this._forwardDeceleration * timeDelta
          );
        } else if (this._currentForwardSpeed >= 0) {
          this._currentForwardSpeed += this._forwardAcceleration * timeDelta;
        } else {
          // Turn back at least as fast as it would stop.
          this._currentForwardSpeed +=
            Math.max(this._forwardAcceleration, this._forwardDeceleration) *
            timeDelta;
        }
      } else {
        if (this._currentForwardSpeed < 0) {
          this._currentForwardSpeed = Math.max(
            this._currentForwardSpeed + this._forwardDeceleration * timeDelta,
            0
          );
        }
        if (this._currentForwardSpeed > 0) {
          this._currentForwardSpeed = Math.min(
            this._currentForwardSpeed - this._forwardDeceleration * timeDelta,
            0
          );
        }
      }
      this._currentForwardSpeed = gdjs.evtTools.common.clamp(
        this._currentForwardSpeed,
        -this._forwardSpeedMax,
        this._forwardSpeedMax
      );

      let targetedSidewaysSpeed = 0;
      if (this.hasPressedLeftKey !== this.hasPressedRightKey) {
        if (this.hasPressedLeftKey) {
          targetedSidewaysSpeed = -this._sidewaysSpeedMax;
        } else if (this.hasPressedRightKey) {
          targetedSidewaysSpeed = this._sidewaysSpeedMax;
        }
      } else if (this._stickForce !== 0) {
        targetedSidewaysSpeed =
          this._sidewaysSpeedMax *
          this._stickForce *
          Math.cos(gdjs.toRad(this._stickAngle));
      }
      if (targetedSidewaysSpeed < 0) {
        if (this._currentSidewaysSpeed <= targetedSidewaysSpeed) {
          // Reduce the speed to match the stick force.
          this._currentSidewaysSpeed = Math.min(
            targetedSidewaysSpeed,
            this._currentSidewaysSpeed + this._sidewaysDeceleration * timeDelta
          );
        } else if (this._currentSidewaysSpeed <= 0) {
          this._currentSidewaysSpeed -= this._sidewaysAcceleration * timeDelta;
        } else {
          // Turn back at least as fast as it would stop.
          this._currentSidewaysSpeed -=
            Math.max(this._sidewaysAcceleration, this._sidewaysDeceleration) *
            timeDelta;
        }
      } else if (targetedSidewaysSpeed > 0) {
        if (this._currentSidewaysSpeed >= targetedSidewaysSpeed) {
          // Reduce the speed to match the stick force.
          this._currentSidewaysSpeed = Math.max(
            targetedSidewaysSpeed,
            this._currentSidewaysSpeed - this._sidewaysDeceleration * timeDelta
          );
        } else if (this._currentSidewaysSpeed >= 0) {
          this._currentSidewaysSpeed += this._sidewaysAcceleration * timeDelta;
        } else {
          this._currentSidewaysSpeed +=
            Math.max(this._sidewaysAcceleration, this._sidewaysDeceleration) *
            timeDelta;
        }
      } else {
        if (this._currentSidewaysSpeed < 0) {
          this._currentSidewaysSpeed = Math.max(
            this._currentSidewaysSpeed + this._sidewaysDeceleration * timeDelta,
            0
          );
        }
        if (this._currentSidewaysSpeed > 0) {
          this._currentSidewaysSpeed = Math.min(
            this._currentSidewaysSpeed - this._sidewaysDeceleration * timeDelta,
            0
          );
        }
      }
      this._currentSidewaysSpeed = gdjs.evtTools.common.clamp(
        this._currentSidewaysSpeed,
        -this._sidewaysSpeedMax,
        this._sidewaysSpeedMax
      );

      let hasJustJumped = false;
      if (!this.hasPressedJumpKey) {
        this.hasJumpKeyBeenConsumed = false;
      }
      if (this.isOnFloor()) {
        this._currentFallSpeed = 0;
        this._currentJumpSpeed = 0;

        if (this.hasPressedJumpKey && !this.hasJumpKeyBeenConsumed) {
          this._currentJumpSpeed = this._jumpSpeed;
          this.hasJumpKeyBeenConsumed = true;
          this._jumpKeyHeldSinceJumpStart = true;
          this._timeSinceCurrentJumpStart = 0;
          hasJustJumped = true;
        }
      } else {
        // Check if the jump key is continuously held since
        // the beginning of the jump.
        if (!this.hasPressedJumpKey) {
          this._jumpKeyHeldSinceJumpStart = false;
        }
        this._timeSinceCurrentJumpStart += timeDelta;
      }
      // When a jump starts isOnFloor will only become false after ExtendedUpdate is called.
      if (!this.isOnFloor() || hasJustJumped) {
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
        this._sharedData.bodyInterface.SetPositionAndRotation(
          characterBody.GetID(),
          behavior.getPhysicsPosition(this.getRVec3(0, 0, 0)),
          rotation,
          Jolt.EActivation_Activate
        );
      }
      if (stillKinematicPlatform) {
        groundBody.SetLinearVelocity(Jolt.Vec3.prototype.sZero());
        groundBody.SetAngularVelocity(Jolt.Vec3.prototype.sZero());
      }
      const groundVelocity = this.character.GetGroundVelocity();

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
      const angle = gdjs.toRad(this.owner.getAngle());
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const speedX = forwardSpeed * cosA - sidewaysSpeed * sinA;
      const speedY = forwardSpeed * sinA + sidewaysSpeed * cosA;
      this.character.SetLinearVelocity(
        this.getVec3(
          groundVelocity.GetX() + speedX,
          groundVelocity.GetY() + speedY,
          // The ground velocity is not added on Z as it's handled by mStickToFloorStepDown.
          (this._currentJumpSpeed - this._currentFallSpeed) * worldInvScale
        )
      );

      const onePixel = worldInvScale;
      const floorStepDownSpeedZ = Math.min(
        -Math.abs(forwardSpeed) * this._slopeClimbingFactor,
        groundVelocity.GetZ()
      );
      let stickToFloorStepDownZ = 0;
      if (
        Math.abs(floorStepDownSpeedZ) <=
        this._maxFallingSpeed * worldInvScale
      ) {
        stickToFloorStepDownZ = -onePixel + floorStepDownSpeedZ * timeDelta;
      }
      extendedUpdateSettings.mStickToFloorStepDown.Set(
        0,
        0,
        stickToFloorStepDownZ
      );

      this.character.SetRotation(characterBody.GetRotation());
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
      }

      // console.log(
      //   'Is on floor: ' +
      //     this.isOnFloor() +
      //     ' Jump: ' +
      //     this._currentJumpSpeed +
      //     ' Fall: ' +
      //     this._currentFallSpeed
      // );

      // console.log(
      //   'Ground: ' +
      //     this.character.GetGroundVelocity().GetX() +
      //     ' ' +
      //     this.character.GetGroundVelocity().GetY() +
      //     ' ' +
      //     this.character.GetGroundVelocity().GetZ()
      // );

      // console.log(
      //   'Speed: ' +
      //     this.character.GetLinearVelocity().GetX() +
      //     ' ' +
      //     this.character.GetLinearVelocity().GetY()
      // );
      // console.log(
      //   'Body: ' +
      //     behavior._body!.GetPosition().GetX() *
      //       this._sharedData.worldScale +
      //     ' ' +
      //     behavior._body!.GetPosition().GetY() *
      //       this._sharedData.worldScale +
      //     ' ' +
      //     behavior._body!.GetPosition().GetZ() * this._sharedData.worldScale
      // );
      // console.log(
      //   'Object: ' +
      //     this.owner.getX() +
      //     ' ' +
      //     this.owner.getY() +
      //     ' ' +
      //     behavior.owner3D.getZ()
      // );

      // console.log(
      //   'Ground: ' +
      //   this.character.GetGroundPosition().GetX() *
      //       this._sharedData.worldScale +
      //     ' ' +
      //     this.character.GetGroundPosition().GetY() *
      //       this._sharedData.worldScale +
      //     ' ' +
      //     this.character.GetGroundPosition().GetZ() * this._sharedData.worldScale
      // );

      // console.log(
      //   'Ground: ' +
      //   this.character.GetGroundNormal().GetX() +
      //     ' ' +
      //     this.character.GetGroundNormal().GetY() +
      //     ' ' +
      //     this.character.GetGroundNormal().GetZ()
      // );

      if (!this._dontClearInputsBetweenFrames) {
        this.hasPressedForwardKey = false;
        this.hasPressedBackwardKey = false;
        this.hasPressedRightKey = false;
        this.hasPressedLeftKey = false;
        this.hasPressedJumpKey = false;
        this._stickForce = 0;
        this._stickAngle = 0;
      }

      this._hasReallyMoved =
        Math.abs(this.character.GetPosition().GetX() - oldX) >
          PhysicsCharacter3DRuntimeBehavior.epsilon ||
        Math.abs(this.character.GetPosition().GetY() - oldY) >
          PhysicsCharacter3DRuntimeBehavior.epsilon ||
        Math.abs(this.character.GetPosition().GetY() - oldZ) >
          PhysicsCharacter3DRuntimeBehavior.epsilon;

      // console.log('END Step character');
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
        this._slopeClimbingFactor = Math.tan(gdjs.toRad(slopeMaxAngle));
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
     * @param tryToPreserveAirSpeed If true and if jumping, tune the current jump speed to preserve the overall speed in the air.
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
    setForwardCurrentSpeed(currentForwardSpeed: float): void {
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
    setForwardSidewaysSpeed(currentSidewaysSpeed: float): void {
      this._currentSidewaysSpeed = gdjs.evtTools.common.clamp(
        currentSidewaysSpeed,
        -this._currentSidewaysSpeed,
        this._currentSidewaysSpeed
      );
    }

    /**
     * Get the speed at which the object is falling. It is 0 when the object is on a floor, and non 0 as soon as the object leaves the floor.
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

    simulateBackwardKey(): void {
      this.hasPressedBackwardKey = true;
    }

    simulateRightKey(): void {
      this.hasPressedRightKey = true;
    }

    simulateLeftKey(): void {
      this.hasPressedLeftKey = true;
    }

    simulateJumpKey(): void {
      this.hasPressedJumpKey = true;
    }

    simulateStick(stickAngle: float, stickForce: float) {
      this._stickAngle = stickAngle;
      this._stickForce = Math.max(0, Math.min(1, stickForce));
    }

    /**
     * Check if the Character is on a floor.
     * @returns Returns true if on a floor and false if not.
     */
    isOnFloor(): boolean {
      return this.character ? this.character.IsSupported() : false;
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
}
