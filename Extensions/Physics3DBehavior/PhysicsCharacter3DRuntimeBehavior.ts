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
    forwardAcceleration: float = 1600;
    forwardDeceleration: float = 1600;
    forwardSpeedMax: float = 800;
    _gravity: float = 1000;
    _maxFallingSpeed: float = 700;

    hasPressedForwardKey: boolean = false;
    hasPressedBackwardKey: boolean = false;
    forwardSpeed: float = 0;
    _currentFallSpeed: float = 0;

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
      settings.mBackFaceMode = Jolt.EBackFaceMode_CollideWithBackFaces;
      //settings.mCharacterPadding = characterPadding;
      //settings.mPenetrationRecoverySpeed = penetrationRecoverySpeed;
      //settings.mPredictiveContactDistance = predictiveContactDistance;
      // settings.mSupportingVolume = new Jolt.Plane(
      //   Jolt.Vec3.prototype.sAxisZ(),
      //   -characterRadiusStanding
      // );
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
      console.log('Step character');
      
      console.log(
        'Character: ' +
          this.character.GetPosition().GetX() *
            behavior._sharedData.worldScale +
          ' ' +
          this.character.GetPosition().GetY() *
            behavior._sharedData.worldScale +
          ' ' +
          this.character.GetPosition().GetZ() * behavior._sharedData.worldScale
      );

      // Change the speed according to the player's input.
      // TODO Give priority to the last key for faster reaction time.
      if (this.hasPressedBackwardKey !== this.hasPressedForwardKey) {
        if (this.hasPressedBackwardKey) {
          if (this.forwardSpeed <= 0) {
            this.forwardSpeed -= this.forwardAcceleration * timeDelta;
          } else {
            // Turn back at least as fast as it would stop.
            this.forwardSpeed -=
              Math.max(this.forwardAcceleration, this.forwardDeceleration) *
              timeDelta;
          }
        } else if (this.hasPressedForwardKey) {
          if (this.forwardSpeed >= 0) {
            this.forwardSpeed += this.forwardAcceleration * timeDelta;
          } else {
            this.forwardSpeed +=
              Math.max(this.forwardAcceleration, this.forwardDeceleration) *
              timeDelta;
          }
        }
      }
      // Take deceleration into account only if no key is pressed.
      if (this.hasPressedBackwardKey === this.hasPressedForwardKey) {
        // Set the speed to 0 if the speed was too low.
        if (this.forwardSpeed < 0) {
          this.forwardSpeed = Math.max(
            this.forwardSpeed + this.forwardDeceleration * timeDelta,
            0
          );
        }
        if (this.forwardSpeed > 0) {
          this.forwardSpeed = Math.min(
            this.forwardSpeed - this.forwardDeceleration * timeDelta,
            0
          );
        }
      }
      this.forwardSpeed = Math.max(
        -this.forwardSpeedMax,
        Math.min(this.forwardSpeedMax, this.forwardSpeed)
      );

      this._currentFallSpeed = Math.max(-this._maxFallingSpeed, this._currentFallSpeed - this._gravity * timeDelta);

      const forwardSpeed =
        this.forwardSpeed * behavior._sharedData.worldInvScale;
      const angle = gdjs.toRad(this.owner.getAngle());
      this.character.SetLinearVelocity(
        this.getVec3(
          forwardSpeed * Math.cos(angle),
          forwardSpeed * Math.sin(angle),
          this._currentFallSpeed * behavior._sharedData.worldInvScale
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
      // console.log(
      //   'Speed: ' +
      //     this.character.GetLinearVelocity().GetX() +
      //     ' ' +
      //     this.character.GetLinearVelocity().GetY()
      // );
      console.log(
        'Body: ' +
          behavior._body!.GetPosition().GetX() *
            behavior._sharedData.worldScale +
          ' ' +
          behavior._body!.GetPosition().GetY() *
            behavior._sharedData.worldScale +
          ' ' +
          behavior._body!.GetPosition().GetZ() * behavior._sharedData.worldScale
      );
      // console.log(
      //   'Object: ' +
      //     this.owner.getX() +
      //     ' ' +
      //     this.owner.getY() +
      //     ' ' +
      //     behavior.owner3D.getZ()
      // );
      
      this.hasPressedForwardKey = false;
    }

    doStepPostEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {}

    onObjectHotReloaded() {}

    simulateMoveForwardKey(): void {
      this.hasPressedForwardKey = true;
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
          gdjs.toRad(slopeMaxAngle)
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
  }

  gdjs.registerBehavior(
    'Physics3D::PhysicsCharacter3DBehavior',
    gdjs.PhysicsCharacter3DRuntimeBehavior
  );
}
