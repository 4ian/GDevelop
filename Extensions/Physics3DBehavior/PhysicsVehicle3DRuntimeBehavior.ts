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
    fws: float;
    sws: float;
    fs: float;
    js: float;
    cj: boolean;
    lek: boolean;
    rik: boolean;
    upk: boolean;
    dok: boolean;
    hbk: boolean;
    us: boolean;
    sa: float;
    sf: float;
    tscjs: float;
    jkhsjs: boolean;
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
    /**
     * sharedData is a reference to the shared data of the scene, that registers
     * every physics behavior that is created so that collisions can be cleared
     * before stepping the world.
     */
    _sharedData: gdjs.Physics3DSharedData;
    private _destroyedDuringFrameLogic: boolean = false;

    private _forwardAcceleration: float;
    private _forwardDeceleration: float;
    private _forwardSpeedMax: float;
    private _sidewaysAcceleration: float;
    private _sidewaysDeceleration: float;
    private _sidewaysSpeedMax: float;

    private _hasPressedForwardKey: boolean = false;
    private _hasPressedBackwardKey: boolean = false;
    private _hasPressedRightKey: boolean = false;
    private _hasPressedLeftKey: boolean = false;
    private _hasPressedHandBreakKey: boolean = false;
    private _hasUsedStick: boolean = false;
    private _stickAngle: float = 0;
    private _stickForce: float = 0;
    private _currentForwardSpeed: float = 0;
    private _currentSidewaysSpeed: float = 0;
    private _currentFallSpeed: float = 0;
    private _canJump: boolean = false;
    private _currentJumpSpeed: float = 0;
    private _timeSinceCurrentJumpStart: float = 0;
    private _jumpKeyHeldSinceJumpStart: boolean = false;
    private _hasReallyMoved: boolean = false;

    // This is useful for extensions that need to know
    // which keys were pressed and doesn't know the mapping
    // done by the scene events.
    private _wasLeftKeyPressed: boolean = false;
    private _wasRightKeyPressed: boolean = false;
    private _wasForwardKeyPressed: boolean = false;
    private _wasBackwardKeyPressed: boolean = false;
    private _wasHandBreakKeyPressed: boolean = false;
    private _wasStickUsed: boolean = false;

    // This is useful when the object is synchronized by an external source
    // like in a multiplayer game, and we want to be able to predict the
    // movement of the object, even if the inputs are not updated every frame.
    private _dontClearInputsBetweenFrames: boolean = false;

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
      this._physics3DBehaviorName = behaviorData.physics3D;
      this._sharedData = gdjs.Physics3DSharedData.getSharedData(
        instanceContainer.getScene(),
        behaviorData.Physics3D
      );

      this._forwardAcceleration = behaviorData.forwardAcceleration;
      this._forwardDeceleration = behaviorData.forwardDeceleration;
      this._forwardSpeedMax = behaviorData.forwardSpeedMax;
      this._sidewaysAcceleration = behaviorData.sidewaysAcceleration;
      this._sidewaysDeceleration = behaviorData.sidewaysDeceleration;
      this._sidewaysSpeedMax = behaviorData.sidewaysSpeedMax;
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

    updateFromBehaviorData(oldBehaviorData, newBehaviorData): boolean {
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
      return true;
    }

    getNetworkSyncData(): PhysicsVehicle3DNetworkSyncData {
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
          lek: this._wasLeftKeyPressed,
          rik: this._wasRightKeyPressed,
          upk: this._wasForwardKeyPressed,
          dok: this._wasBackwardKeyPressed,
          hbk: this._wasHandBreakKeyPressed,
          us: this._wasStickUsed,
          sa: this._stickAngle,
          sf: this._stickForce,
          tscjs: this._timeSinceCurrentJumpStart,
          jkhsjs: this._jumpKeyHeldSinceJumpStart,
        },
      };
    }

    updateFromNetworkSyncData(
      networkSyncData: PhysicsVehicle3DNetworkSyncData
    ) {
      super.updateFromNetworkSyncData(networkSyncData);

      const behaviorSpecificProps = networkSyncData.props;
      this._currentForwardSpeed = behaviorSpecificProps.fws;
      this._currentSidewaysSpeed = behaviorSpecificProps.sws;
      this._currentFallSpeed = behaviorSpecificProps.fs;
      this._currentJumpSpeed = behaviorSpecificProps.js;
      this._canJump = behaviorSpecificProps.cj;
      this._hasPressedForwardKey = behaviorSpecificProps.upk;
      this._hasPressedBackwardKey = behaviorSpecificProps.dok;
      this._hasPressedLeftKey = behaviorSpecificProps.lek;
      this._hasPressedRightKey = behaviorSpecificProps.rik;
      this._hasPressedHandBreakKey = behaviorSpecificProps.hbk;
      this._hasUsedStick = behaviorSpecificProps.us;
      this._stickAngle = behaviorSpecificProps.sa;
      this._stickForce = behaviorSpecificProps.sf;
      this._timeSinceCurrentJumpStart = behaviorSpecificProps.tscjs;
      this._jumpKeyHeldSinceJumpStart = behaviorSpecificProps.jkhsjs;

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

    onDeActivate() {}

    onActivate() {}

    onDestroy() {
      this._destroyedDuringFrameLogic = true;
      this.onDeActivate();
      this._destroyVehicle();
    }

    /**
     * Remove the character and its body from the physics engine.
     * This method is called when:
     * - The Physics3D behavior is deactivated
     * - The object is destroyed
     *
     * Only deactivating the character behavior won't destroy the character.
     * Indeed, deactivated characters don't move as characters but still have collisions.
     */
    _destroyVehicle() {
      if (this._vehicleController) {
        // TODO The body is destroyed with the character.
        Jolt.destroy(this._vehicleController);
        this._vehicleController = null;
        if (this._physics3D) {
          this._physics3D.behavior._body = null;
          this._physics3D = null;
        }
      }
    }

    doStepPreEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {
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

      const oldX = carBody.GetPosition().GetX();
      const oldY = carBody.GetPosition().GetY();
      const oldZ = carBody.GetPosition().GetZ();
      //console.log(oldX, oldY, oldZ);

      let forward = 0.0,
        right = 0.0,
        brake = 0.0,
        handBrake = 0.0;

      forward = this._hasPressedForwardKey
        ? 1.0
        : this._hasPressedBackwardKey
          ? -1.0
          : 0.0;
      right = this._hasPressedRightKey
        ? 1.0
        : this._hasPressedLeftKey
          ? -1.0
          : 0.0;

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
          vec3ToString(
            this._vehicleController
              .GetConstraint()
              .GetWheel(0)
              .GetContactPosition()
          ),
          vec3ToString(
            this._vehicleController
              .GetConstraint()
              .GetWheel(1)
              .GetContactPosition()
          ),
          vec3ToString(
            this._vehicleController
              .GetConstraint()
              .GetWheel(2)
              .GetContactPosition()
          ),
          vec3ToString(
            this._vehicleController
              .GetConstraint()
              .GetWheel(3)
              .GetContactPosition()
          ),
        ].join('\n')
      );

      // console.log(forward, right, brake, handBrake);

      this._vehicleController.SetDriverInput(forward, -right, brake, handBrake);
      if (
        right !== 0.0 ||
        forward !== 0.0 ||
        brake !== 0.0 ||
        handBrake !== 0.0
      ) {
        this._sharedData.bodyInterface.ActivateBody(carBody.GetID());
      }

      this._wasForwardKeyPressed = this._hasPressedForwardKey;
      this._wasBackwardKeyPressed = this._hasPressedBackwardKey;
      this._wasRightKeyPressed = this._hasPressedRightKey;
      this._wasLeftKeyPressed = this._hasPressedLeftKey;
      this._wasHandBreakKeyPressed = this._hasPressedHandBreakKey;
      this._wasStickUsed = this._hasUsedStick;

      if (!this._dontClearInputsBetweenFrames) {
        this._hasPressedForwardKey = false;
        this._hasPressedBackwardKey = false;
        this._hasPressedRightKey = false;
        this._hasPressedLeftKey = false;
        this._hasPressedHandBreakKey = false;
        this._hasUsedStick = false;
      }

      // TODO
      this._hasReallyMoved =
        Math.abs(carBody.GetPosition().GetX() - oldX) >
          PhysicsVehicle3DRuntimeBehavior.epsilon ||
        Math.abs(carBody.GetPosition().GetY() - oldY) >
          PhysicsVehicle3DRuntimeBehavior.epsilon ||
        Math.abs(carBody.GetPosition().GetZ() - oldZ) >
          PhysicsVehicle3DRuntimeBehavior.epsilon;
    }

    doStepPostEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {}

    onObjectHotReloaded() {}

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
      this._currentForwardSpeed = currentForwardSpeed;
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
      this._currentSidewaysSpeed = currentSidewaysSpeed;
    }

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

    simulateStick(stickAngle: float, stickForce: float) {
      this._hasUsedStick = true;
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

    /**
     * Check if the Character is moving.
     * @returns Returns true if it is moving and false if not.
     */
    isMovingEvenALittle(): boolean {
      return (
        (this._hasReallyMoved &&
          (this._currentForwardSpeed !== 0 ||
            this._currentSidewaysSpeed !== 0)) ||
        this._currentJumpSpeed !== 0 ||
        this._currentFallSpeed !== 0
      );
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

      createAndAddBody(): Jolt.Body | null {
        const physics3D = this.vehicleBehavior.getPhysics3D();
        if (!physics3D) {
          return null;
        }
        const { behavior } = physics3D;
        const { _sharedData } = this.vehicleBehavior;

        const halfVehicleWidth = behavior._shapeHalfWidth;
        const halfVehicleHeight = behavior._shapeHalfHeight;
        const halfVehicleDepth = behavior._shapeHalfDepth;

        console.log(halfVehicleWidth, halfVehicleHeight, halfVehicleDepth);

        const wheelOffsetX = halfVehicleWidth;
        const wheelOffsetY = halfVehicleHeight;
        const wheelOffsetZ = 0;
        const wheelRadius = halfVehicleDepth;
        const wheelWidth = halfVehicleDepth / 3;
        const suspensionMinLength = wheelRadius;
        const suspensionMaxLength = 1.5 * suspensionMinLength;
        const maxSteerAngle = gdjs.toRad(30);
        const fourWheelDrive = false;
        const frontBackLimitedSlipRatio = 1.4;
        const leftRightLimitedSlipRatio = 1.4;
        const antiRollbar = true;

        const FL_WHEEL = 0;
        const FR_WHEEL = 1;
        const BL_WHEEL = 2;
        const BR_WHEEL = 3;

        const vehicleMass = 1500;
        const maxEngineTorque = 500;
        const clutchStrength = 10;

        const carShape = behavior.createShape();

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
        carBodySettings.mMassPropertiesOverride.mMass = vehicleMass;
        const carBody = _sharedData.bodyInterface.CreateBody(carBodySettings);

        _sharedData.bodyInterface.AddBody(
          carBody.GetID(),
          Jolt.EActivation_Activate
        );

        // Create vehicle constraint
        const vehicle = new Jolt.VehicleConstraintSettings();
        vehicle.mUp = new Jolt.Vec3(0, 0, 1);
        vehicle.mForward = new Jolt.Vec3(1, 0, 0);
        vehicle.mMaxPitchRollAngle = gdjs.toRad(60.0);
        vehicle.mWheels.clear();
        const mWheels: Array<Jolt.WheelSettingsWV> = [];
        {
          const fl = new Jolt.WheelSettingsWV();
          fl.mPosition = new Jolt.Vec3(
            wheelOffsetX,
            -wheelOffsetY,
            -wheelOffsetZ
          );
          fl.mMaxSteerAngle = maxSteerAngle;
          fl.mMaxHandBrakeTorque = 0.0;
          vehicle.mWheels.push_back(fl);
          mWheels.push(fl);

          const fr = new Jolt.WheelSettingsWV();
          fr.mPosition = new Jolt.Vec3(
            wheelOffsetX,
            wheelOffsetY,
            -wheelOffsetZ
          );
          fr.mMaxSteerAngle = maxSteerAngle;
          fr.mMaxHandBrakeTorque = 0.0; // Front wheel doesn't have hand brake
          vehicle.mWheels.push_back(fr);
          mWheels.push(fr);

          const bl = new Jolt.WheelSettingsWV();
          bl.mPosition = new Jolt.Vec3(
            -wheelOffsetX,
            -wheelOffsetY,
            -wheelOffsetZ
          );
          bl.mMaxSteerAngle = 0.0;
          vehicle.mWheels.push_back(bl);
          mWheels.push(bl);

          const br = new Jolt.WheelSettingsWV();
          br.mPosition = new Jolt.Vec3(
            -wheelOffsetX,
            wheelOffsetY,
            -wheelOffsetZ
          );
          br.mMaxSteerAngle = 0.0;
          vehicle.mWheels.push_back(br);
          mWheels.push(br);
        }
        mWheels.forEach((wheelS) => {
          wheelS.mWheelUp = new Jolt.Vec3(0, 0, 1);
          wheelS.mWheelForward = new Jolt.Vec3(1, 0, 0);
          wheelS.mSuspensionDirection = new Jolt.Vec3(0, 0, -1);
          wheelS.mSteeringAxis = new Jolt.Vec3(0, 0, 1);
          wheelS.mRadius = wheelRadius;
          wheelS.mWidth = wheelWidth;
          wheelS.mSuspensionMinLength = suspensionMinLength;
          wheelS.mSuspensionMaxLength = suspensionMaxLength;
          // wheelS.mLongitudinalFriction.Clear();
          // wheelS.mLongitudinalFriction.AddPoint(0, 1);
          // wheelS.mLongitudinalFriction.AddPoint(1, 1);
          // wheelS.mLateralFriction.Clear();
          // wheelS.mLateralFriction.AddPoint(0, 1.2);
          // wheelS.mLateralFriction.AddPoint(90, 1.2);
        });

        const controllerSettings = new Jolt.WheeledVehicleControllerSettings();
        controllerSettings.mEngine.mMaxTorque = maxEngineTorque;
        controllerSettings.mTransmission.mClutchStrength = clutchStrength;
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
        constraint.SetVehicleCollisionTester(
          new Jolt.VehicleCollisionTesterRay(
            behavior.getBodyLayer(),
            new Jolt.Vec3(0, 0, 1)
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

        constraint.ResetGravityOverride();
        _sharedData.physicsSystem.AddConstraint(constraint);
        this.vehicleBehavior._vehicleController = Jolt.castObject(
          constraint.GetController(),
          Jolt.WheeledVehicleController
        );
        _sharedData.physicsSystem.AddStepListener(
          new Jolt.VehicleConstraintStepListener(constraint)
        );

        return carBody;
      }

      updateObjectFromBody() {
        this.physicsBodyUpdater.updateObjectFromBody();
      }

      updateBodyFromObject() {
        this.physicsBodyUpdater.updateBodyFromObject();
      }

      recreateShape() {
        // const physics3D = this.vehicleBehavior.getPhysics3D();
        // if (!physics3D) {
        //   return;
        // }
        // const {
        //   behavior,
        //   broadPhaseLayerFilter,
        //   objectLayerFilter,
        //   bodyFilter,
        //   shapeFilter,
        // } = physics3D;
        // const { _vehicleController, _sharedData } = this.vehicleBehavior;
        // if (!_vehicleController) {
        //   return;
        // }
        // const shape = behavior.createShape();
        // const isShapeValid = _vehicleController.SetShape(
        //   shape,
        //   Number.MAX_VALUE,
        //   broadPhaseLayerFilter,
        //   objectLayerFilter,
        //   bodyFilter,
        //   shapeFilter,
        //   _sharedData.jolt.GetTempAllocator()
        // );
        // if (!isShapeValid) {
        //   return;
        // }
        // _vehicleController.SetInnerBodyShape(shape);
        // _vehicleController.SetMass(shape.GetMassProperties().get_mMass());
        // // shapeHalfDepth may have changed, update the character position accordingly.
        // this.updateCharacterPosition();
      }

      destroyBody() {
        this.vehicleBehavior._destroyVehicle();
      }
    }
  }
}
