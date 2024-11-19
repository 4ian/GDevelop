/// <reference path="./jolt-physics.d.ts" />

namespace Jolt {
  export interface Body {
    gdjsAssociatedCharacterBehavior: gdjs.PhysicsCharacter3DRuntimeBehavior | null;
  }
}

namespace gdjs {
  interface PhysicsCharacter3DNetworkSyncDataType {}

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
    forwardAcceleration: float = 1200;
    forwardDeceleration: float = 1200;
    forwardSpeedMax: float = 600;
    _gravity: float = 1000;
    _maxFallingSpeed: float = 700;
    _jumpSpeed: float = 900;
    _jumpSustainTime: float = 0.2;

    hasPressedForwardKey: boolean = false;
    hasPressedBackwardKey: boolean = false;
    hasPressedJumpKey: boolean = false;
    _currentForwardSpeed: float = 0;
    _currentFallSpeed: float = 0;
    _canJump: boolean = false;
    _currentJumpSpeed: float = 0;
    _timeSinceCurrentJumpStart: float = 0;
    _jumpKeyHeldSinceJumpStart: boolean = false;

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
      const objectVsBroadPhaseLayerFilter =
        jolt.GetObjectVsBroadPhaseLayerFilter();
      const objectLayerPairFilter = jolt.GetObjectLayerPairFilter();
      const broadPhaseLayerFilter = new Jolt.DefaultBroadPhaseLayerFilter(
        objectVsBroadPhaseLayerFilter,
        1
      );
      const objectLayerFilter = new Jolt.DefaultObjectLayerFilter(
        objectLayerPairFilter,
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
      return true;
    }

    getNetworkSyncData(): PhysicsCharacter3DNetworkSyncData {
      return super.getNetworkSyncData();
    }

    updateFromNetworkSyncData(
      networkSyncData: PhysicsCharacter3DNetworkSyncData
    ) {
      super.updateFromNetworkSyncData(networkSyncData);
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
        (capsuleHalfLength - capsuleRadius * (1 - Math.cos(gdjs.toRad(this._slopeMaxAngle))))
      );
      console.log((1 - Math.cos(gdjs.toRad(this._slopeMaxAngle))));
      const sharedData = behavior._sharedData;
      this.character = new Jolt.CharacterVirtual(
        settings,
        behavior.getPhysicsPosition(this.getRVec3(0, 0, 0)),
        behavior.getPhysicsRotation(this.getQuat(0, 0, 0, 1)),
        sharedData.physicsSystem
      );
      //TODO this.character.SetListener(characterContactListener);

      const body = sharedData.physicsSystem
        .GetBodyLockInterface()
        .TryGetBody(this.character.GetInnerBodyID());
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

    beforePhysicsStep(timeDelta: float): void {
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
      // console.log('Step character');

      // console.log(
      //   'Character: ' +
      //     this.character.GetPosition().GetX() *
      //       behavior._sharedData.worldScale +
      //     ' ' +
      //     this.character.GetPosition().GetY() *
      //       behavior._sharedData.worldScale +
      //     ' ' +
      //     this.character.GetPosition().GetZ() * behavior._sharedData.worldScale
      // );

      // Change the speed according to the player's input.
      // TODO Give priority to the last key for faster reaction time.
      if (this.hasPressedBackwardKey !== this.hasPressedForwardKey) {
        if (this.hasPressedBackwardKey) {
          if (this._currentForwardSpeed <= 0) {
            this._currentForwardSpeed -= this.forwardAcceleration * timeDelta;
          } else {
            // Turn back at least as fast as it would stop.
            this._currentForwardSpeed -=
              Math.max(this.forwardAcceleration, this.forwardDeceleration) *
              timeDelta;
          }
        } else if (this.hasPressedForwardKey) {
          if (this._currentForwardSpeed >= 0) {
            this._currentForwardSpeed += this.forwardAcceleration * timeDelta;
          } else {
            this._currentForwardSpeed +=
              Math.max(this.forwardAcceleration, this.forwardDeceleration) *
              timeDelta;
          }
        }
      }
      // Take deceleration into account only if no key is pressed.
      if (this.hasPressedBackwardKey === this.hasPressedForwardKey) {
        // Set the speed to 0 if the speed was too low.
        if (this._currentForwardSpeed < 0) {
          this._currentForwardSpeed = Math.max(
            this._currentForwardSpeed + this.forwardDeceleration * timeDelta,
            0
          );
        }
        if (this._currentForwardSpeed > 0) {
          this._currentForwardSpeed = Math.min(
            this._currentForwardSpeed - this.forwardDeceleration * timeDelta,
            0
          );
        }
      }
      this._currentForwardSpeed = Math.max(
        -this.forwardSpeedMax,
        Math.min(this.forwardSpeedMax, this._currentForwardSpeed)
      );

      if (this.isOnFloor()) {
        this._currentFallSpeed = 0;
        this._currentJumpSpeed = 0;

        if (this.hasPressedJumpKey) {
          this._currentJumpSpeed = this._jumpSpeed;
        }
      } else {
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

      const forwardSpeed =
        this._currentForwardSpeed * behavior._sharedData.worldInvScale;
      const angle = gdjs.toRad(this.owner.getAngle());
      this.character.SetLinearVelocity(
        this.getVec3(
          forwardSpeed * Math.cos(angle),
          forwardSpeed * Math.sin(angle),
          (this._currentJumpSpeed - this._currentFallSpeed) *
            behavior._sharedData.worldInvScale
        )
      );
      const sharedData = behavior._sharedData;
      const jolt = sharedData.jolt;

      extendedUpdateSettings.mStickToFloorStepDown.Set(
        0,
        0,
        forwardSpeed * timeDelta * this._slopeClimbingFactor
      );

      this.character.SetRotation(behavior._body!.GetRotation());
      this.character.ExtendedUpdate(
        timeDelta,
        this.character.GetUp(),
        extendedUpdateSettings,
        broadPhaseLayerFilter,
        objectLayerFilter,
        bodyFilter,
        shapeFilter,
        jolt.GetTempAllocator()
      );

      if (this.isOnFloor()) {
        this._canJump = true;
      }

      console.log(
        'Is on floor: ' +
          this.isOnFloor() +
          ' Jump: ' +
          this._currentJumpSpeed +
          ' Fall: ' +
          this._currentFallSpeed
      );

      // console.log(
      //   'Speed: ' +
      //     this.character.GetLinearVelocity().GetX() +
      //     ' ' +
      //     this.character.GetLinearVelocity().GetY()
      // );
      // console.log(
      //   'Body: ' +
      //     behavior._body!.GetPosition().GetX() *
      //       behavior._sharedData.worldScale +
      //     ' ' +
      //     behavior._body!.GetPosition().GetY() *
      //       behavior._sharedData.worldScale +
      //     ' ' +
      //     behavior._body!.GetPosition().GetZ() * behavior._sharedData.worldScale
      // );
      // console.log(
      //   'Object: ' +
      //     this.owner.getX() +
      //     ' ' +
      //     this.owner.getY() +
      //     ' ' +
      //     behavior.owner3D.getZ()
      // );

      console.log(
        'Ground: ' +
        this.character.GetGroundPosition().GetX() *
            behavior._sharedData.worldScale +
          ' ' +
          this.character.GetGroundPosition().GetY() *
            behavior._sharedData.worldScale +
          ' ' +
          this.character.GetGroundPosition().GetZ() * behavior._sharedData.worldScale
      );

      // console.log(
      //   'Ground: ' +
      //   this.character.GetGroundNormal().GetX() +
      //     ' ' +
      //     this.character.GetGroundNormal().GetY() +
      //     ' ' +
      //     this.character.GetGroundNormal().GetZ()
      // );

      this.hasPressedForwardKey = false;
      this.hasPressedJumpKey = false;
    }

    doStepPostEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {}

    onObjectHotReloaded() {}

    simulateForwardKey(): void {
      this.hasPressedForwardKey = true;
    }

    simulateJumpKey(): void {
      this.hasPressedJumpKey = true;
    }

    /**
     * Check if the Platformer Object is on a floor.
     * @returns Returns true if on a floor and false if not.
     */
    isOnFloor(): boolean {
      return this.character
        ? this.character.IsSupported()
        : false;
    }

    /**
     * Check if the Platformer Object is jumping.
     * @returns Returns true if jumping and false if not.
     */
    isJumping(): boolean {
      return this._currentJumpSpeed > 0;
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
        !this.isOnFloor() && this._currentJumpSpeed < this._currentFallSpeed
      );
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

    getCurrentForwardSpeed(): float {
      return this._currentForwardSpeed;
    }

    getForwardSpeedMax(): float {
      return this.forwardSpeedMax;
    }

    setForwardSpeedMax(forwardSpeedMax: float): void {
      this.forwardSpeedMax = forwardSpeedMax;
    }
  }

  gdjs.registerBehavior(
    'Physics3D::PhysicsCharacter3DBehavior',
    gdjs.PhysicsCharacter3DRuntimeBehavior
  );
}
