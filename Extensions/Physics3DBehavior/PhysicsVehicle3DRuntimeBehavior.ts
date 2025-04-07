/// <reference path="./jolt-physics.d.ts" />

// TODO Remove
const vec3ToString = (vec3: Jolt.RVec3) =>
  vec3.GetX().toFixed(3) +
  ' ' +
  vec3.GetY().toFixed(3) +
  ' ' +
  vec3.GetZ().toFixed(3);

namespace gdjs {
  interface PhysicsVehicle3DNetworkSyncDataType {
    lek: boolean;
    rik: boolean;
    upk: boolean;
    dok: boolean;
    hbk: boolean;
    asf: float;
    ssf: float;
  }

  export interface PhysicsVehicle3DNetworkSyncData
    extends BehaviorNetworkSyncData {
    props: PhysicsVehicle3DNetworkSyncDataType;
  }

  type Physics3D = {
    behavior: gdjs.Physics3DRuntimeBehavior;
  };

  export class PhysicsVehicle3DRuntimeBehavior
    extends gdjs.RuntimeBehavior
    implements gdjs.Physics3DRuntimeBehavior.Physics3DHook
  {
    owner3D: gdjs.RuntimeObject3D;
    private _physics3DBehaviorName: string;
    private _physics3D: Physics3D | null = null;
    _vehicleController: Jolt.WheeledVehicleController | null = null;
    _stepListener: Jolt.VehicleConstraintStepListener | null = null;
    /**
     * sharedData is a reference to the shared data of the scene, that registers
     * every physics behavior that is created so that collisions can be cleared
     * before stepping the world.
     */
    _sharedData: gdjs.Physics3DSharedData;
    private _destroyedDuringFrameLogic: boolean = false;

    _steerAngleMax;
    private _beginningSteerSpeed: float;
    private _endSteerSpeed: float;
    _mass: float;
    _engineTorqueMax: float;
    /** in RPM (rotation per minute) */
    _engineSpeedMax: float;
    _gearRatios: Array<float>;
    _reverseGearRatios: Array<float>;
    _backWheelOffsetX: float;
    _frontWheelOffsetX: float;
    _wheelOffsetY: float;
    _wheelOffsetZ: float;
    _wheelRadius: float;
    _wheelWidth: float;

    private _currentSteerRatio: float = 0;

    private _hasPressedForwardKey: boolean = false;
    private _hasPressedBackwardKey: boolean = false;
    private _hasPressedRightKey: boolean = false;
    private _hasPressedLeftKey: boolean = false;
    private _hasPressedHandBreakKey: boolean = false;
    private _acceleratorStickForce: float = 0;
    private _steeringStickForce: float = 0;

    // This is useful for extensions that need to know
    // which keys were pressed and doesn't know the mapping
    // done by the scene events.
    private _wasLeftKeyPressed: boolean = false;
    private _wasRightKeyPressed: boolean = false;
    private _wasForwardKeyPressed: boolean = false;
    private _wasBackwardKeyPressed: boolean = false;
    private _wasHandBreakKeyPressed: boolean = false;
    private _previousAcceleratorStickForce: float = 0;
    private _previousSteeringStickForce: float = 0;

    // This is useful when the object is synchronized by an external source
    // like in a multiplayer game, and we want to be able to predict the
    // movement of the object, even if the inputs are not updated every frame.
    private _dontClearInputsBetweenFrames: boolean = false;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      behaviorData,
      owner: gdjs.RuntimeObject3D
    ) {
      super(instanceContainer, behaviorData, owner);
      this.owner3D = owner;
      this._physics3DBehaviorName = behaviorData.physics3D;
      this._sharedData = gdjs.Physics3DSharedData.getSharedData(
        instanceContainer.getScene(),
        behaviorData.Physics3D
      );
      this._steerAngleMax = behaviorData.steerAngleMax;
      this._beginningSteerSpeed = behaviorData.beginningSteerSpeed;
      this._endSteerSpeed = behaviorData.endSteerSpeed;
      this._mass = behaviorData.mass;
      this._engineTorqueMax = behaviorData.engineTorqueMax;
      this._engineSpeedMax = behaviorData.engineSpeedMax;
      this._reverseGearRatios = [behaviorData.reverseGearRatio1];
      this._gearRatios = [
        behaviorData.gearRatio1,
        behaviorData.gearRatio2,
        behaviorData.gearRatio3,
        behaviorData.gearRatio4,
        behaviorData.gearRatio5,
        behaviorData.gearRatio6,
      ];
      for (let index = 0; index < this._gearRatios.length; index++) {
        const gearRatio = this._gearRatios[index];
        if (gearRatio <= 0 || gearRatio >= this._gearRatios[index - 1]) {
          this._gearRatios.splice(index);
          index--;
        }
      }
      this._backWheelOffsetX = behaviorData.backWheelOffsetX;
      this._frontWheelOffsetX = behaviorData.frontWheelOffsetX;
      this._wheelOffsetY = behaviorData.wheelOffsetY;
      this._wheelOffsetZ = behaviorData.wheelOffsetZ;
      this._wheelRadius = behaviorData.wheelRadius;
      this._wheelWidth = behaviorData.wheelWidth;
    }

    private getVec3(x: float, y: float, z: float): Jolt.Vec3 {
      const tempVec3 = this._sharedData._tempVec3;
      tempVec3.Set(x, y, z);
      return tempVec3;
    }

    getPhysics3D(): Physics3D | null {
      if (this._destroyedDuringFrameLogic) {
        return null;
      }
      if (this._physics3D) {
        return this._physics3D;
      }
      const behavior = this.owner.getBehavior(
        this._physics3DBehaviorName
      ) as gdjs.Physics3DRuntimeBehavior;

      const sharedData = behavior._sharedData;

      this._physics3D = {
        behavior,
      };
      sharedData.registerHook(this);

      behavior.bodyUpdater =
        new gdjs.PhysicsVehicle3DRuntimeBehavior.VehicleBodyUpdater(
          this,
          behavior.bodyUpdater
        );
      behavior.recreateBody();

      return this._physics3D;
    }

    override updateFromBehaviorData(oldBehaviorData, newBehaviorData): boolean {
      if (oldBehaviorData.steerAngleMax !== newBehaviorData.steerAngleMax) {
        this.setSteerAngleMax(newBehaviorData.steerAngleMax);
      }
      if (
        oldBehaviorData.beginningSteerSpeed !==
        newBehaviorData.beginningSteerSpeed
      ) {
        this.setBeginningSteerSpeed(newBehaviorData.beginningSteerSpeed);
      }
      if (oldBehaviorData.endSteerSpeed !== newBehaviorData.endSteerSpeed) {
        this.setEndSteerSpeed(newBehaviorData.endSteerSpeed);
      }
      if (oldBehaviorData.mass !== newBehaviorData.mass) {
        this.setMass(newBehaviorData.mass);
      }
      if (oldBehaviorData.engineTorqueMax !== newBehaviorData.engineTorqueMax) {
        this.setEngineTorqueMax(newBehaviorData.engineTorqueMax);
      }
      return true;
    }

    override getNetworkSyncData(): PhysicsVehicle3DNetworkSyncData {
      // This method is called, so we are synchronizing this object.
      // Let's clear the inputs between frames as we control it.
      this._dontClearInputsBetweenFrames = false;

      return {
        ...super.getNetworkSyncData(),
        props: {
          lek: this._wasLeftKeyPressed,
          rik: this._wasRightKeyPressed,
          upk: this._wasForwardKeyPressed,
          dok: this._wasBackwardKeyPressed,
          hbk: this._wasHandBreakKeyPressed,
          asf: this._previousAcceleratorStickForce,
          ssf: this._previousSteeringStickForce,
        },
      };
    }

    override updateFromNetworkSyncData(
      networkSyncData: PhysicsVehicle3DNetworkSyncData
    ) {
      super.updateFromNetworkSyncData(networkSyncData);

      const behaviorSpecificProps = networkSyncData.props;
      this._hasPressedForwardKey = behaviorSpecificProps.upk;
      this._hasPressedBackwardKey = behaviorSpecificProps.dok;
      this._hasPressedLeftKey = behaviorSpecificProps.lek;
      this._hasPressedRightKey = behaviorSpecificProps.rik;
      this._hasPressedHandBreakKey = behaviorSpecificProps.hbk;
      this._acceleratorStickForce = behaviorSpecificProps.asf;
      this._steeringStickForce = behaviorSpecificProps.ssf;

      // When the object is synchronized from the network, the inputs must not be cleared.
      this._dontClearInputsBetweenFrames = true;
    }

    getPhysicsPosition(result: Jolt.RVec3): Jolt.RVec3 {
      const physics3D = this.getPhysics3D();
      if (!physics3D) {
        result.Set(0, 0, 0);
        return result;
      }
      const { behavior } = physics3D;
      // The character origin is at its feet:
      // - the center is used for X and Y because Box3D origin is at the top-left corner
      // - the origin is used for Z because, when the character is made smaller,
      //   it must stay on the ground and not fell from its old size.
      result.Set(
        this.owner3D.getCenterXInScene() * this._sharedData.worldInvScale,
        this.owner3D.getCenterYInScene() * this._sharedData.worldInvScale,
        this.owner3D.getZ() * this._sharedData.worldInvScale +
          behavior._shapeHalfDepth
      );
      return result;
    }

    override onDeActivate() {
      if (this._stepListener) {
        this._sharedData.physicsSystem.RemoveStepListener(this._stepListener);
      }
    }

    override onActivate() {
      if (this._stepListener) {
        this._sharedData.physicsSystem.AddStepListener(this._stepListener);
      }
    }

    override onDestroy() {
      if (!this._vehicleController) {
        return;
      }
      this._destroyedDuringFrameLogic = true;
      this.onDeActivate();
      const constraint = this._vehicleController.GetConstraint();
      this._sharedData.physicsSystem.RemoveConstraint(constraint);
      // The controller is destroyed with the constraint.
      this._vehicleController = null;
      if (this._physics3D) {
        this._physics3D = null;
      }
    }

    override doStepPreEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {
      // Trigger createAndAddBody()
      this.getPhysics3D();
    }

    override doStepPostEvents(
      instanceContainer: gdjs.RuntimeInstanceContainer
    ) {
      // Trigger createAndAddBody()
      this.getPhysics3D();
    }

    // TODO
    previousForward = 1;

    doBeforePhysicsStep(timeDelta: float): void {
      if (!this.activated()) {
        return;
      }
      const physics3D = this.getPhysics3D();
      if (!physics3D) {
        return;
      }
      const { behavior } = physics3D;
      if (!this._vehicleController) {
        return;
      }
      const carBody = behavior._body;
      if (!carBody) {
        return;
      }

      const steeringControl =
        this._steeringStickForce ||
        (this._hasPressedLeftKey ? -1 : 0) + (this._hasPressedRightKey ? 1 : 0);
      if (steeringControl === 0) {
        this._currentSteerRatio = 0;
      } else {
        const steerSpeed = gdjs.evtTools.common.lerp(
          this._beginningSteerSpeed,
          this._endSteerSpeed,
          Math.abs(this._currentSteerRatio)
        );
        if (steeringControl < 0) {
          // Avoid to much latency when changing of direction
          this._currentSteerRatio = Math.min(0, this._currentSteerRatio);
          this._currentSteerRatio +=
            (steeringControl * steerSpeed * timeDelta) / this._steerAngleMax;
          this._currentSteerRatio = Math.max(-1, this._currentSteerRatio);
        }
        if (steeringControl > 0) {
          // Avoid to much latency when changing of direction
          this._currentSteerRatio = Math.max(0, this._currentSteerRatio);
          this._currentSteerRatio +=
            (steeringControl * steerSpeed * timeDelta) / this._steerAngleMax;
          this._currentSteerRatio = Math.min(1, this._currentSteerRatio);
        }
      }

      let brake = 0;
      const acceleratorControl =
        this._acceleratorStickForce ||
        (this._hasPressedBackwardKey ? -1 : 0) +
          (this._hasPressedForwardKey ? 1 : 0);
      let forward = acceleratorControl;
      if (this.previousForward < 0 !== forward < 0) {
        const velocity = carBody
          .GetRotation()
          .InverseRotate(carBody.GetLinearVelocity())
          .GetX();
        if (
          (forward > 0.0 && velocity < -0.1) ||
          (forward < 0.0 && velocity > 0.1)
        ) {
          // Brake while we've not stopped yet
          forward = 0.0;
          brake = 1.0;
        } else {
          // When we've come to a stop, accept the new direction
          this.previousForward = forward;
        }
      }

      let handBrake = 0;
      if (this._hasPressedHandBreakKey) {
        forward = 0.0;
        handBrake = 1.0;
      }

      // console.log(
      //   this._vehicleController
      //     .GetConstraint()
      //     .GetWheel(0)
      //     .GetAngularVelocity(),
      //   this._vehicleController
      //     .GetConstraint()
      //     .GetWheel(1)
      //     .GetAngularVelocity(),
      //   this._vehicleController
      //     .GetConstraint()
      //     .GetWheel(2)
      //     .GetAngularVelocity(),
      //   this._vehicleController.GetConstraint().GetWheel(3).GetAngularVelocity()
      // );

      const wheels: Array<Jolt.WheelWV> = [];
      for (let index = 0; index < 4; index++) {
        wheels.push(
          Jolt.castObject(
            this._vehicleController.GetConstraint().GetWheel(index),
            Jolt.WheelWV
          )
        );
      }
      console.log(
        [
          'Car center',
          vec3ToString(carBody.GetPosition()),
          'Mass center',
          vec3ToString(carBody.GetCenterOfMassPosition()),
          'Mass',
          1 / carBody.GetMotionProperties().GetInverseMass(),
          'Speed',
          (carBody
            .GetRotation()
            .InverseRotate(carBody.GetLinearVelocity())
            .GetX() *
            60 *
            60) /
            1000,
          'Wheels',
          vec3ToString(wheels[0].GetContactPosition()),
          vec3ToString(wheels[1].GetContactPosition()),
          vec3ToString(wheels[2].GetContactPosition()),
          vec3ToString(wheels[3].GetContactPosition()),

          'Speed',
          wheels[0].GetAngularVelocity().toFixed(1),
          wheels[1].GetAngularVelocity().toFixed(1),
          wheels[2].GetAngularVelocity().toFixed(1),
          wheels[3].GetAngularVelocity().toFixed(1),

          'Slip',
          wheels[0].mLongitudinalSlip.toFixed(3),
          wheels[1].mLongitudinalSlip.toFixed(3),
          wheels[2].mLongitudinalSlip.toFixed(3),
          wheels[3].mLongitudinalSlip.toFixed(3),

          'Steer angle',
          gdjs.toDegrees(wheels[0].GetSteerAngle()).toFixed(1),
          gdjs.toDegrees(wheels[1].GetSteerAngle()).toFixed(1),
          gdjs.toDegrees(wheels[2].GetSteerAngle()).toFixed(1),
          gdjs.toDegrees(wheels[3].GetSteerAngle()).toFixed(1),
          ,
        ].join('\n')
      );

      // console.log(forward, right, brake, handBrake);

      this._vehicleController.SetDriverInput(
        forward,
        -this._currentSteerRatio,
        brake,
        handBrake
      );
      if (
        forward !== 0.0 ||
        this._currentSteerRatio !== 0.0 ||
        brake !== 0.0 ||
        handBrake !== 0.0
      ) {
        this._sharedData.bodyInterface.ActivateBody(carBody.GetID());
      }
      //this._vehicleController.GetEngine().SetCurrentRPM(100000);

      this._wasForwardKeyPressed = this._hasPressedForwardKey;
      this._wasBackwardKeyPressed = this._hasPressedBackwardKey;
      this._wasRightKeyPressed = this._hasPressedRightKey;
      this._wasLeftKeyPressed = this._hasPressedLeftKey;
      this._wasHandBreakKeyPressed = this._hasPressedHandBreakKey;
      this._previousAcceleratorStickForce = this._acceleratorStickForce;
      this._previousSteeringStickForce = this._steeringStickForce;

      if (!this._dontClearInputsBetweenFrames) {
        this._hasPressedForwardKey = false;
        this._hasPressedBackwardKey = false;
        this._hasPressedRightKey = false;
        this._hasPressedLeftKey = false;
        this._hasPressedHandBreakKey = false;
        this._acceleratorStickForce = 0;
        this._steeringStickForce = 0;
      }
    }

    override onObjectHotReloaded() {}

    simulateForwardKey(): void {
      this._hasPressedForwardKey = true;
    }

    wasForwardKeyPressed(): boolean {
      return this._wasForwardKeyPressed;
    }

    simulateBackwardKey(): void {
      this._hasPressedBackwardKey = true;
    }

    wasBackwardKeyPressed(): boolean {
      return this._wasBackwardKeyPressed;
    }

    simulateRightKey(): void {
      this._hasPressedRightKey = true;
    }

    wasRightKeyPressed(): boolean {
      return this._wasRightKeyPressed;
    }

    simulateLeftKey(): void {
      this._hasPressedLeftKey = true;
    }

    wasLeftKeyPressed(): boolean {
      return this._wasLeftKeyPressed;
    }

    simulateHandBreakKey(): void {
      this._hasPressedHandBreakKey = true;
    }

    wasHandBreakKeyPressed(): boolean {
      return this._wasHandBreakKeyPressed;
    }

    simulateAcceleratorStick(stickForce: float): void {
      this._acceleratorStickForce = gdjs.evtTools.common.clamp(
        -1,
        1,
        stickForce
      );
    }

    simulateSteeringStick(stickForce: float): void {
      this._steeringStickForce = gdjs.evtTools.common.clamp(-1, 1, stickForce);
    }

    getAcceleratorStickForce(): float {
      return this._acceleratorStickForce;
    }

    getSteeringStickForce(): float {
      return this._steeringStickForce;
    }

    getPreviousAcceleratorStickForce(): float {
      return this._previousAcceleratorStickForce;
    }

    getPreviousSteeringStickForce(): float {
      return this._previousSteeringStickForce;
    }

    getSteerAngleMax(): float {
      return this._steerAngleMax;
    }

    setSteerAngleMax(steerAngleMax: float) {
      this._steerAngleMax = steerAngleMax;
    }

    getBeginningSteerSpeed(): float {
      return this._beginningSteerSpeed;
    }

    setBeginningSteerSpeed(beginningSteerSpeed: float): void {
      this._beginningSteerSpeed = beginningSteerSpeed;
    }

    getEndSteerSpeed(): float {
      return this._endSteerSpeed;
    }

    setEndSteerSpeed(endSteerSpeed: float): void {
      this._endSteerSpeed = endSteerSpeed;
    }

    getMass(): float {
      return this._mass;
    }

    setMass(mass: float): void {
      this._mass = mass;
      const physics3D = this.getPhysics3D();
      if (!physics3D) {
        return;
      }
      const { behavior } = physics3D;
      behavior._needToRecreateShape = true;
    }

    getEngineTorqueMax(): float {
      return this._engineTorqueMax;
    }

    setEngineTorqueMax(engineTorqueMax: float): void {
      this._engineTorqueMax = engineTorqueMax;
      if (!this._vehicleController) {
        return;
      }
      this._vehicleController.GetEngine().mMaxTorque = engineTorqueMax;
    }
  }

  gdjs.registerBehavior(
    'Physics3D::PhysicsVehicle3D',
    gdjs.PhysicsVehicle3DRuntimeBehavior
  );

  export namespace PhysicsVehicle3DRuntimeBehavior {
    export class VehicleBodyUpdater {
      vehicleBehavior: gdjs.PhysicsVehicle3DRuntimeBehavior;
      physicsBodyUpdater: gdjs.Physics3DRuntimeBehavior.BodyUpdater;

      constructor(
        vehicleBehavior: gdjs.PhysicsVehicle3DRuntimeBehavior,
        physicsBodyUpdater: gdjs.Physics3DRuntimeBehavior.BodyUpdater
      ) {
        this.vehicleBehavior = vehicleBehavior;
        this.physicsBodyUpdater = physicsBodyUpdater;
      }

      private getVec3(x: float, y: float, z: float): Jolt.Vec3 {
        const tempVec3 = this.vehicleBehavior._sharedData._tempVec3;
        tempVec3.Set(x, y, z);
        return tempVec3;
      }

      createAndAddBody(): Jolt.Body | null {
        const physics3D = this.vehicleBehavior.getPhysics3D();
        if (!physics3D) {
          return null;
        }
        const { behavior } = physics3D;
        const { _sharedData } = this.vehicleBehavior;

        const carShape = behavior.createShape();

        const fourWheelDrive = false;
        const frontBackLimitedSlipRatio = 1.4;
        const leftRightLimitedSlipRatio = 1.4;
        const antiRollbar = true;

        const clutchStrength = 10;

        // Create car body
        const carBodySettings = new Jolt.BodyCreationSettings(
          carShape,
          this.vehicleBehavior.getPhysicsPosition(
            _sharedData.getRVec3(0, 0, 0)
          ),
          behavior.getPhysicsRotation(_sharedData.getQuat(0, 0, 0, 1)),
          Jolt.EMotionType_Dynamic,
          behavior.getBodyLayer()
        );
        carBodySettings.mOverrideMassProperties =
          Jolt.EOverrideMassProperties_CalculateInertia;
        carBodySettings.mMassPropertiesOverride.mMass =
          this.vehicleBehavior._mass;
        carBodySettings.mFriction = behavior.friction;
        carBodySettings.mRestitution = behavior.restitution;
        carBodySettings.mLinearDamping = behavior.linearDamping;
        carBodySettings.mAngularDamping = behavior.angularDamping;
        carBodySettings.mGravityFactor = behavior.gravityScale;
        const carBody = _sharedData.bodyInterface.CreateBody(carBodySettings);
        Jolt.destroy(carBodySettings);
        _sharedData.bodyInterface.AddBody(
          carBody.GetID(),
          Jolt.EActivation_Activate
        );

        // Create vehicle constraint
        const vehicle = new Jolt.VehicleConstraintSettings();
        vehicle.mUp = this.getVec3(0, 0, 1);
        vehicle.mForward = this.getVec3(1, 0, 0);
        vehicle.mMaxPitchRollAngle = gdjs.toRad(60.0);

        const FL_WHEEL = 0;
        const FR_WHEEL = 1;
        const BL_WHEEL = 2;
        const BR_WHEEL = 3;
        {
          const setupWheel = (wheelS: Jolt.WheelSettingsWV) => {
            wheelS.mWheelUp = this.getVec3(0, 0, 1);
            wheelS.mWheelForward = this.getVec3(1, 0, 0);
            wheelS.mSuspensionDirection = this.getVec3(0, 0, -1);
            wheelS.mSteeringAxis = this.getVec3(0, 0, 1);
          };

          vehicle.mWheels.clear();

          const fl = new Jolt.WheelSettingsWV();
          fl.mMaxSteerAngle = gdjs.toRad(this.vehicleBehavior._steerAngleMax);
          // Front wheel doesn't have hand brake
          fl.mMaxHandBrakeTorque = 0.0;
          setupWheel(fl);
          vehicle.mWheels.push_back(fl);

          const fr = new Jolt.WheelSettingsWV();
          fr.mMaxSteerAngle = gdjs.toRad(this.vehicleBehavior._steerAngleMax);
          fr.mMaxHandBrakeTorque = 0.0;
          setupWheel(fr);
          vehicle.mWheels.push_back(fr);

          const bl = new Jolt.WheelSettingsWV();
          bl.mMaxSteerAngle = 0.0;
          setupWheel(bl);
          vehicle.mWheels.push_back(bl);

          const br = new Jolt.WheelSettingsWV();
          br.mMaxSteerAngle = 0.0;
          setupWheel(br);
          vehicle.mWheels.push_back(br);
        }

        const controllerSettings = new Jolt.WheeledVehicleControllerSettings();
        controllerSettings.mEngine.mMaxTorque =
          this.vehicleBehavior._engineTorqueMax;
        controllerSettings.mEngine.mMaxRPM =
          this.vehicleBehavior._engineSpeedMax;
        controllerSettings.mEngine.mInertia = 0.01;
        // controllerSettings.mEngine.mNormalizedTorque.Clear();
        // controllerSettings.mEngine.mNormalizedTorque.AddPoint(0, 1);
        // controllerSettings.mEngine.mNormalizedTorque.AddPoint(1, 1);
        controllerSettings.mTransmission.mClutchStrength = clutchStrength;
        controllerSettings.mTransmission.mGearRatios.clear();
        for (const gearRatio of this.vehicleBehavior._gearRatios) {
          controllerSettings.mTransmission.mGearRatios.push_back(gearRatio);
        }
        controllerSettings.mTransmission.mReverseGearRatios.clear();
        for (const gearRatio of this.vehicleBehavior._reverseGearRatios) {
          controllerSettings.mTransmission.mReverseGearRatios.push_back(
            gearRatio
          );
        }

        vehicle.mController = controllerSettings;

        // Front differential
        controllerSettings.mDifferentials.clear();
        const frontWheelDrive = new Jolt.VehicleDifferentialSettings();
        frontWheelDrive.mLeftWheel = FL_WHEEL;
        frontWheelDrive.mRightWheel = FR_WHEEL;
        frontWheelDrive.mLimitedSlipRatio = leftRightLimitedSlipRatio;
        if (fourWheelDrive) {
          frontWheelDrive.mEngineTorqueRatio = 0.5; // Split engine torque when 4WD
        }
        controllerSettings.mDifferentials.push_back(frontWheelDrive);
        controllerSettings.mDifferentialLimitedSlipRatio =
          frontBackLimitedSlipRatio;

        // Rear differential
        if (fourWheelDrive) {
          const rearWheelDrive = new Jolt.VehicleDifferentialSettings();
          rearWheelDrive.mLeftWheel = BL_WHEEL;
          rearWheelDrive.mRightWheel = BR_WHEEL;
          rearWheelDrive.mLimitedSlipRatio = leftRightLimitedSlipRatio;
          rearWheelDrive.mEngineTorqueRatio = 0.5;
          controllerSettings.mDifferentials.push_back(rearWheelDrive);
        }

        // Anti-roll bars
        if (antiRollbar) {
          vehicle.mAntiRollBars.clear();
          const frontRollBar = new Jolt.VehicleAntiRollBar();
          frontRollBar.mLeftWheel = FL_WHEEL;
          frontRollBar.mRightWheel = FR_WHEEL;
          const rearRollBar = new Jolt.VehicleAntiRollBar();
          rearRollBar.mLeftWheel = BL_WHEEL;
          rearRollBar.mRightWheel = BR_WHEEL;
          vehicle.mAntiRollBars.push_back(frontRollBar);
          vehicle.mAntiRollBars.push_back(rearRollBar);
        }

        const constraint = new Jolt.VehicleConstraint(carBody, vehicle);
        Jolt.destroy(vehicle);
        constraint.SetVehicleCollisionTester(
          new Jolt.VehicleCollisionTesterRay(
            behavior.getBodyLayer(),
            this.getVec3(0, 0, 1)
          )
        );
        // constraint.SetVehicleCollisionTester(
        //   new Jolt.VehicleCollisionTesterCastSphere(
        //     behavior.getBodyLayer(),
        //     wheelWidth / 2,
        //     new Jolt.Vec3(0, 0, 1),
        //   )
        // );
        // constraint.SetVehicleCollisionTester(
        //   new Jolt.VehicleCollisionTesterCastCylinder(
        //     behavior.getBodyLayer(),
        //     0.05,
        //   )
        // );

        //constraint.ResetGravityOverride();
        //constraint.OverrideGravity(new Jolt.Vec3(0, 0, -9.8 * 4));
        // TODO Ask why the gravity override have a different result that relying on the body properties.
        constraint.OverrideGravity(
          new Jolt.Vec3(
            behavior.gravityScale * behavior._sharedData.gravityX,
            behavior.gravityScale * behavior._sharedData.gravityY,
            behavior.gravityScale * behavior._sharedData.gravityZ
          )
        );
        _sharedData.physicsSystem.AddConstraint(constraint);
        this.vehicleBehavior._vehicleController = Jolt.castObject(
          constraint.GetController(),
          Jolt.WheeledVehicleController
        );
        this.vehicleBehavior._stepListener =
          new Jolt.VehicleConstraintStepListener(constraint);
        _sharedData.physicsSystem.AddStepListener(
          this.vehicleBehavior._stepListener
        );
        this.updateWheels();
        return carBody;
      }

      updateObjectFromBody() {
        this.physicsBodyUpdater.updateObjectFromBody();
      }

      updateBodyFromObject() {
        this.physicsBodyUpdater.updateBodyFromObject();
      }

      recreateShape() {
        this.physicsBodyUpdater.recreateShape();
        this.updateWheels();
      }

      private updateWheels() {
        const { _vehicleController } = this.vehicleBehavior;
        if (!_vehicleController) {
          return;
        }

        const physics3D = this.vehicleBehavior.getPhysics3D();
        if (!physics3D) {
          return;
        }
        const { behavior } = physics3D;

        // Retrieved the dimensions set by `createShape`.
        const halfVehicleWidth = behavior._shapeHalfWidth;
        const halfVehicleHeight = behavior._shapeHalfHeight;
        const halfVehicleDepth = behavior._shapeHalfDepth;

        const shapeScale =
          behavior.shapeScale * behavior._sharedData.worldInvScale;

        const wheelRadius = this.vehicleBehavior._wheelRadius * shapeScale;
        const wheelWidth = this.vehicleBehavior._wheelWidth * shapeScale;
        const backWheelOffsetX =
          halfVehicleWidth -
          wheelRadius +
          this.vehicleBehavior._backWheelOffsetX * shapeScale;
        const frontWheelOffsetX =
          halfVehicleWidth -
          wheelRadius +
          this.vehicleBehavior._frontWheelOffsetX * shapeScale;
        const wheelOffsetY =
          halfVehicleHeight -
          wheelWidth / 2 +
          this.vehicleBehavior._wheelOffsetY * shapeScale;
        // Put the wheels center at the bottom of the car physics shape.
        const wheelOffsetZ =
          -halfVehicleDepth +
          (behavior.shapeOffsetZ + this.vehicleBehavior._wheelOffsetZ) *
            shapeScale;
        const suspensionMinLength = wheelRadius;
        const suspensionMaxLength = 1.5 * suspensionMinLength;

        const constraint = _vehicleController.GetConstraint();
        const fl = constraint.GetWheel(0).GetSettings();
        fl.mPosition = this.getVec3(
          frontWheelOffsetX,
          -wheelOffsetY,
          wheelOffsetZ
        );
        const fr = constraint.GetWheel(1).GetSettings();
        fr.mPosition = this.getVec3(
          frontWheelOffsetX,
          wheelOffsetY,
          wheelOffsetZ
        );
        const bl = constraint.GetWheel(2).GetSettings();
        bl.mPosition = this.getVec3(
          -backWheelOffsetX,
          -wheelOffsetY,
          wheelOffsetZ
        );
        const br = constraint.GetWheel(3).GetSettings();
        br.mPosition = this.getVec3(
          -backWheelOffsetX,
          wheelOffsetY,
          wheelOffsetZ
        );
        for (let index = 0; index < 4; index++) {
          const wheel = constraint.GetWheel(index).GetSettings();
          wheel.mRadius = wheelRadius;
          wheel.mWidth = wheelWidth;
          wheel.mSuspensionMinLength = suspensionMinLength;
          wheel.mSuspensionMaxLength = suspensionMaxLength;
        }
      }

      destroyBody() {
        this.vehicleBehavior.onDestroy();
        this.physicsBodyUpdater.destroyBody();
      }
    }
  }
}
