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

  export class PhysicsCharacter3DRuntimeBehavior extends gdjs.RuntimeBehavior implements gdjs.Physics3DRuntimeBehavior.Physics3DHook {
    owner3D: gdjs.RuntimeObject3D;
    physics3DBehaviorName: string;
    physics3D: Physics3D | null = null;

    _slopeMaxAngle: float;

    character: Jolt.CharacterVirtual | null = null;

    forwardSpeed: float = 100;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      behaviorData,
      owner: gdjs.RuntimeObject3D
    ) {
      super(instanceContainer, behaviorData, owner);
      this.owner3D = owner;
      this.physics3DBehaviorName = behaviorData.Physics3D;
      this._slopeMaxAngle = behaviorData.slopeMaxAngle;
    }

    private getVec3(x: float, y: float, z: float): Jolt.Vec3 {
      const tempVec3 = this.getPhysics3D().behavior._sharedData._tempVec3;
      tempVec3.Set(x, y, z);
      return tempVec3;
    }

    private getRVec3(x: float, y: float, z: float): Jolt.RVec3 {
      const tempRVec3 = this.getPhysics3D().behavior._sharedData._tempRVec3;
      tempRVec3.Set(x, y, z);
      return tempRVec3;
    }

    private getQuat(x: float, y: float, z: float, w: float): Jolt.Quat {
      const tempQuat = this.getPhysics3D().behavior._sharedData._tempQuat;
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
        Jolt.RVec3.prototype.sZero(),
        Jolt.Quat.prototype.sIdentity(),
        sharedData.physicsSystem
      );
      //TODO this.character.SetListener(characterContactListener);

      return sharedData.physicsSystem
        .GetBodyLockInterface()
        .TryGetBody(this.character.GetInnerBodyID());
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
      const angle = gdjs.toRad(this.owner.getAngle());
      const forwardSpeed =
        this.forwardSpeed * behavior._sharedData.worldInvScale;
      this.character.SetLinearVelocity(
        this.getVec3(
          forwardSpeed * Math.cos(angle),
          forwardSpeed * Math.sin(angle),
          0
        )
      );
      const sharedData = behavior._sharedData;
      const jolt = sharedData.jolt;

      extendedUpdateSettings.mStickToFloorStepDown.Set(
        0,
        0,
        forwardSpeed * timeDelta * Math.tan(gdjs.toRad(this._slopeMaxAngle))
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
        'Character: ' +
          (this.character.GetPosition().GetX() * behavior._sharedData.worldScale) +
          ' ' +
          (this.character.GetPosition().GetY() * behavior._sharedData.worldScale) +
          ' ' +
          (this.character.GetPosition().GetZ() * behavior._sharedData.worldScale)
      );
      console.log(
        'Body: ' +
          (behavior._body!.GetPosition().GetX() * behavior._sharedData.worldScale) +
          ' ' +
          (behavior._body!.GetPosition().GetY() * behavior._sharedData.worldScale) +
          ' ' +
          (behavior._body!.GetPosition().GetZ() * behavior._sharedData.worldScale)
      );
      console.log('Object: ' + this.owner.getX() + ' ' + this.owner.getY() + ' ' + behavior.owner3D.getZ());
    }

    doStepPostEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {}

    onObjectHotReloaded() {}

    simulateMoveForwardKey(): void {}
  }

  gdjs.registerBehavior(
    'Physics3D::PhysicsCharacter3DBehavior',
    gdjs.PhysicsCharacter3DRuntimeBehavior
  );
}
