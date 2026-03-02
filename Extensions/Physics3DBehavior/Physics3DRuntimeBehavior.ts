/// <reference path="./jolt-physics.d.ts" />

namespace Jolt {
  export interface Body {
    gdjsAssociatedBehavior: gdjs.Physics3DRuntimeBehavior | null;
  }
}

const epsilon = 1 / (1 << 16);

namespace gdjs {
  const loadJolt = async () => {
    try {
      const module = await import('./jolt-physics.wasm.js');
      const initializeJoltPhysics = module.default;
      if (!initializeJoltPhysics) {
        throw new Error('No default export found in Jolt.');
      }

      const Jolt = await initializeJoltPhysics();
      //@ts-ignore
      window.Jolt = Jolt;
    } catch (err) {
      console.error('Unable to load Jolt physics library.', err);
      throw err;
    }
  };
  gdjs.registerAsynchronouslyLoadingLibraryPromise(loadJolt());

  export interface RuntimeScene {
    physics3DSharedData: gdjs.Physics3DSharedData | null;
  }
  interface Physics3DNetworkSyncDataType {
    px: number | undefined;
    py: number | undefined;
    pz: number | undefined;
    rx: number | undefined;
    ry: number | undefined;
    rz: number | undefined;
    rw: number | undefined;
    lvx: number | undefined;
    lvy: number | undefined;
    lvz: number | undefined;
    avx: number | undefined;
    avy: number | undefined;
    avz: number | undefined;
    aw: boolean | undefined;
    layers: number;
    masks: number;
  }

  /** @category Behaviors > Physics 3D */
  export interface Physics3DNetworkSyncData extends BehaviorNetworkSyncData {
    props: Physics3DNetworkSyncDataType;
  }

  /** @category Behaviors > Physics 3D */
  export interface Physics3DRaycastResult {
    hasHit: boolean;
    hitX: float;
    hitY: float;
    hitZ: float;
    normalX: float;
    normalY: float;
    normalZ: float;
    reflectionDirectionX: float;
    reflectionDirectionY: float;
    reflectionDirectionZ: float;
    distance: float;
    fraction: float;
    hitBehavior: gdjs.Physics3DRuntimeBehavior | null;
  }

  const makeNewPhysics3DRaycastResult = (): Physics3DRaycastResult => ({
    hasHit: false,
    hitX: 0,
    hitY: 0,
    hitZ: 0,
    normalX: 0,
    normalY: 0,
    normalZ: 0,
    reflectionDirectionX: 0,
    reflectionDirectionY: 0,
    reflectionDirectionZ: 0,
    distance: 0,
    fraction: 0,
    hitBehavior: null,
  });

  const normalize3 = (
    x: float,
    y: float,
    z: float
  ): [float, float, float, float] => {
    const length = Math.sqrt(x * x + y * y + z * z);
    if (length <= epsilon) {
      return [0, 0, 0, 0];
    }
    return [x / length, y / length, z / length, length];
  };

  const vec3Length = (v: Jolt.Vec3): float => {
    const x = v.GetX();
    const y = v.GetY();
    const z = v.GetZ();
    return Math.sqrt(x * x + y * y + z * z);
  };

  const vector2Length = (v: Jolt.Vector2): float => {
    const x = v.GetComponent(0);
    const y = v.GetComponent(1);
    return Math.sqrt(x * x + y * y);
  };

  const isModel3D = (
    object: gdjs.RuntimeObject
  ): object is gdjs.Model3DRuntimeObject => {
    //@ts-ignore We are checking if the methods are present.
    return object._modelResourceName;
  };

  interface JointRuntimeState {
    breakForce: float;
    breakTorque: float;
    lastReactionForce: float;
    lastReactionTorque: float;
    isBroken: boolean;
  }

  interface RagdollGroupData {
    jointIds: number[];
    bodyBehaviors: Physics3DRuntimeBehavior[];
    bodyRoles: { [bodyUniqueId: string]: string };
    collisionFilter: Jolt.GroupFilterTable | null;
    mode: 'Dynamic' | 'Kinematic';
    state: 'Active' | 'Limp' | 'Stiff' | 'Frozen';
  }

  /** @category Behaviors > Physics 3D */
  export class Physics3DSharedData {
    gravityX: float;
    gravityY: float;
    gravityZ: float;
    worldScale: float;
    worldInvScale: float;

    jolt: Jolt.JoltInterface;
    physicsSystem: Jolt.PhysicsSystem;
    bodyInterface: Jolt.BodyInterface;
    /** Contact listener to keep track of current collisions */
    contactListener: Jolt.ContactListenerJS;
    /** Avoid creating new vectors all the time */
    _tempVec3 = new Jolt.Vec3();
    _tempRVec3 = new Jolt.RVec3();
    _tempQuat = new Jolt.Quat();

    stepped: boolean = false;
    /**
     * List of physics behavior in the runtimeScene. It should be updated
     * when a new physics object is created (constructor), on destruction (onDestroy),
     * on behavior activation (onActivate) and on behavior deactivation (onDeActivate).
     */
    _registeredBehaviors: Set<Physics3DRuntimeBehavior>;

    private _physics3DHooks: Array<gdjs.Physics3DRuntimeBehavior.Physics3DHook> =
      [];

    /** Next joint ID counter */
    _nextJointId: number = 1;
    /** Map of (string)jointId -> (Jolt.Constraint)constraint */
    joints: { [key: string]: Jolt.Constraint } = {};
    /** Extra runtime data for each joint (break thresholds, reaction force/torque, broken state). */
    _jointStates: { [key: string]: JointRuntimeState } = {};

    // ==================== Ragdoll Group System ====================

    /** Next ragdoll group ID counter */
    _nextRagdollId: number = 1;
    /** Map of ragdoll group IDs to group data */
    _ragdollGroups: { [key: string]: RagdollGroupData } = {};

    /**
     * Create a new ragdoll group and return its ID.
     */
    createRagdollGroup(): number {
      const id = this._nextRagdollId++;
      this._ragdollGroups[id.toString(10)] = {
        jointIds: [],
        bodyBehaviors: [],
        bodyRoles: {},
        collisionFilter: null,
        mode: 'Kinematic',
        state: 'Frozen',
      };
      return id;
    }

    /**
     * Get a ragdoll group by ID.
     */
    getRagdollGroup(ragdollId: number | string): RagdollGroupData | null {
      const key = ragdollId.toString(10);
      if (!this._ragdollGroups.hasOwnProperty(key)) {
        return null;
      }

      const group = this._ragdollGroups[key];
      // Keep lists clean from stale entries.
      const uniqueBehaviors = new Set<Physics3DRuntimeBehavior>();
      group.bodyBehaviors = group.bodyBehaviors.filter((behavior) => {
        if (!behavior || uniqueBehaviors.has(behavior)) {
          return false;
        }
        uniqueBehaviors.add(behavior);
        return true;
      });
      group.jointIds = group.jointIds.filter((jointId) =>
        this.joints.hasOwnProperty(jointId.toString(10))
      );
      return group;
    }

    /**
     * Add a body behavior to a ragdoll group.
     */
    addBodyToRagdollGroup(
      ragdollId: number | string,
      behavior: Physics3DRuntimeBehavior
    ): void {
      const group = this.getRagdollGroup(ragdollId);
      if (!group) return;
      if (group.bodyBehaviors.indexOf(behavior) === -1) {
        group.bodyBehaviors.push(behavior);
      }
      const bodyRole = behavior.getRagdollRole();
      if (bodyRole && bodyRole !== 'None') {
        group.bodyRoles[behavior.owner.getUniqueId().toString(10)] = bodyRole;
      }
    }

    /**
     * Remove a body behavior from any ragdoll group that references it.
     */
    removeBodyFromAllRagdollGroups(behavior: Physics3DRuntimeBehavior): void {
      const behaviorId = behavior.owner.getUniqueId().toString(10);
      for (const key in this._ragdollGroups) {
        if (!this._ragdollGroups.hasOwnProperty(key)) {
          continue;
        }
        const group = this._ragdollGroups[key];
        group.bodyBehaviors = group.bodyBehaviors.filter((b) => b !== behavior);
        delete group.bodyRoles[behaviorId];
      }
    }

    /**
     * Set/override the role of a body inside a ragdoll group.
     */
    setRagdollBodyRole(
      ragdollId: number | string,
      behavior: Physics3DRuntimeBehavior,
      role: string
    ): void {
      const group = this.getRagdollGroup(ragdollId);
      if (!group) {
        return;
      }
      this.addBodyToRagdollGroup(ragdollId, behavior);
      group.bodyRoles[behavior.owner.getUniqueId().toString(10)] = role;
    }

    /**
     * Get a body role inside a ragdoll group.
     */
    getRagdollBodyRole(
      ragdollId: number | string,
      behavior: Physics3DRuntimeBehavior
    ): string {
      const group = this.getRagdollGroup(ragdollId);
      if (!group) {
        return '';
      }
      return group.bodyRoles[behavior.owner.getUniqueId().toString(10)] || '';
    }

    /**
     * Add a joint to a ragdoll group.
     */
    addJointToRagdollGroup(ragdollId: number | string, jointId: number): void {
      const group = this.getRagdollGroup(ragdollId);
      if (!group) return;
      if (group.jointIds.indexOf(jointId) === -1) {
        group.jointIds.push(jointId);
      }
    }

    /**
     * Track a collision filter used by a ragdoll group so it can be cleaned up.
     */
    setRagdollCollisionFilter(
      ragdollId: number | string,
      filter: Jolt.GroupFilterTable | null
    ): void {
      const group = this.getRagdollGroup(ragdollId);
      if (!group) {
        if (filter) {
          Jolt.destroy(filter);
        }
        return;
      }
      if (group.collisionFilter && group.collisionFilter !== filter) {
        Jolt.destroy(group.collisionFilter);
      }
      group.collisionFilter = filter;
    }

    /**
     * Remove a ragdoll group and all its joints.
     */
    removeRagdollGroup(ragdollId: number | string): void {
      const key = ragdollId.toString(10);
      const group = this._ragdollGroups[key];
      if (!group) return;

      // Remove all joints in the group
      const jointIds = group.jointIds.slice();
      for (const jointId of jointIds) {
        this.removeJoint(jointId);
      }

      // Restore default collision groups for all tracked bodies.
      for (const behavior of group.bodyBehaviors) {
        const body = behavior._body;
        if (!body) {
          continue;
        }
        const defaultCollisionGroup = new Jolt.CollisionGroup();
        this.bodyInterface.SetCollisionGroup(
          body.GetID(),
          defaultCollisionGroup
        );
        Jolt.destroy(defaultCollisionGroup);
      }

      if (group.collisionFilter) {
        Jolt.destroy(group.collisionFilter);
        group.collisionFilter = null;
      }
      delete this._ragdollGroups[key];
    }

    constructor(instanceContainer: gdjs.RuntimeInstanceContainer, sharedData) {
      this._registeredBehaviors = new Set<Physics3DRuntimeBehavior>();
      this.gravityX = sharedData.gravityX;
      this.gravityY = sharedData.gravityY;
      this.gravityZ = sharedData.gravityZ;
      this.worldScale = sharedData.worldScale;
      this.worldInvScale = 1 / this.worldScale;

      // Initialize Jolt
      const settings = new Jolt.JoltSettings();
      gdjs.Physics3DSharedData.setupCollisionFiltering(settings);
      this.jolt = new Jolt.JoltInterface(settings);
      Jolt.destroy(settings);
      this.physicsSystem = this.jolt.GetPhysicsSystem();
      this.physicsSystem.SetGravity(
        this.getVec3(this.gravityX, this.gravityY, this.gravityZ)
      );
      this.bodyInterface = this.physicsSystem.GetBodyInterface();

      this.contactListener = new Jolt.ContactListenerJS();
      this.physicsSystem.SetContactListener(this.contactListener);
      this.contactListener.OnContactAdded = (
        bodyPtrA: number,
        bodyPtrB: number,
        manifoldPtr: number,
        settingsPtr: number
      ): void => {
        const bodyA = Jolt.wrapPointer(bodyPtrA, Jolt.Body);
        const bodyB = Jolt.wrapPointer(bodyPtrB, Jolt.Body);

        const behaviorA = bodyA.gdjsAssociatedBehavior;
        const behaviorB = bodyB.gdjsAssociatedBehavior;
        if (!behaviorA || !behaviorB) {
          return;
        }

        behaviorA.onContactBegin(behaviorB);
        behaviorB.onContactBegin(behaviorA);
      };
      this.contactListener.OnContactRemoved = (
        subShapePairPtr: number
      ): void => {
        const subShapePair = Jolt.wrapPointer(
          subShapePairPtr,
          Jolt.SubShapeIDPair
        );

        // This is ok because bodies are not deleted during the Physics step.
        const bodyLockInterface = this.physicsSystem.GetBodyLockInterface();
        const bodyA = bodyLockInterface.TryGetBody(subShapePair.GetBody1ID());
        const bodyB = bodyLockInterface.TryGetBody(subShapePair.GetBody2ID());

        const behaviorA = bodyA.gdjsAssociatedBehavior;
        const behaviorB = bodyB.gdjsAssociatedBehavior;
        if (!behaviorA || !behaviorB) {
          return;
        }

        behaviorA.onContactEnd(behaviorB);
        behaviorB.onContactEnd(behaviorA);
      };
      this.contactListener.OnContactPersisted = (
        bodyPtrA: number,
        bodyPtrB: number,
        manifoldPtr: number,
        settingsPtr: number
      ): void => {
        // TODO we could rely on this event.
      };
      this.contactListener.OnContactValidate = (
        bodyPtrA: number,
        bodyPtrB: number,
        inBaseOffset: number,
        inCollisionResult: number
      ): number => {
        return Jolt.ValidateResult_AcceptAllContactsForThisBodyPair;
      };
    }

    getVec3(x: float, y: float, z: float): Jolt.Vec3 {
      const tempVec3 = this._tempVec3;
      tempVec3.Set(x, y, z);
      return tempVec3;
    }

    getRVec3(x: float, y: float, z: float): Jolt.RVec3 {
      const tempRVec3 = this._tempRVec3;
      tempRVec3.Set(x, y, z);
      return tempRVec3;
    }

    getQuat(x: float, y: float, z: float, w: float): Jolt.Quat {
      const tempQuat = this._tempQuat;
      tempQuat.Set(x, y, z, w);
      return tempQuat;
    }

    static getSharedData(
      runtimeScene: gdjs.RuntimeScene,
      behaviorName: string
    ): gdjs.Physics3DSharedData {
      if (!runtimeScene.physics3DSharedData) {
        const initialData =
          runtimeScene.getInitialSharedDataForBehavior(behaviorName);
        runtimeScene.physics3DSharedData = new gdjs.Physics3DSharedData(
          runtimeScene,
          initialData
        );
      }
      return runtimeScene.physics3DSharedData;
    }

    // There are 4 bits for static layers and 4 bits for dynamic layers.
    static readonly staticLayersMask = 0x0f;
    static readonly dynamicLayersMask = 0xf0;
    static readonly allLayersMask = 0xff;
    static readonly staticBroadPhaseLayerIndex = 1;
    static readonly dynamicBroadPhaseLayerIndex = 1;

    private static setupCollisionFiltering(settings: Jolt.JoltSettings): void {
      const objectFilter = new Jolt.ObjectLayerPairFilterMask();
      const staticBroadPhaseLayer = new Jolt.BroadPhaseLayer(
        gdjs.Physics3DSharedData.staticBroadPhaseLayerIndex
      );
      const dynamicBroadPhaseLayer = new Jolt.BroadPhaseLayer(
        gdjs.Physics3DSharedData.dynamicBroadPhaseLayerIndex
      );
      const broadPhaseLayerInterfaceMask =
        new Jolt.BroadPhaseLayerInterfaceMask(2);
      broadPhaseLayerInterfaceMask.ConfigureLayer(
        staticBroadPhaseLayer,
        gdjs.Physics3DSharedData.staticLayersMask,
        0
      );
      broadPhaseLayerInterfaceMask.ConfigureLayer(
        dynamicBroadPhaseLayer,
        gdjs.Physics3DSharedData.dynamicLayersMask,
        0
      );
      // BroadPhaseLayer have been copied into bpInterface
      Jolt.destroy(staticBroadPhaseLayer);
      Jolt.destroy(dynamicBroadPhaseLayer);

      settings.mObjectLayerPairFilter = objectFilter;
      settings.mBroadPhaseLayerInterface = broadPhaseLayerInterfaceMask;
      settings.mObjectVsBroadPhaseLayerFilter =
        new Jolt.ObjectVsBroadPhaseLayerFilterMask(
          broadPhaseLayerInterfaceMask
        );
    }

    /**
     * Add a physics object to the list of existing object.
     */
    addToBehaviorsList(physicsBehavior: gdjs.Physics3DRuntimeBehavior): void {
      this._registeredBehaviors.add(physicsBehavior);
    }

    /**
     * Remove a physics object to the list of existing object.
     */
    removeFromBehaviorsList(
      physicsBehavior: gdjs.Physics3DRuntimeBehavior
    ): void {
      this._registeredBehaviors.delete(physicsBehavior);
    }

    /**
     * Add a constraint to the tracked joints and return its ID.
     */
    addJoint(constraint: Jolt.Constraint): integer {
      // @ts-ignore - AddConstraint exists in the WASM module but not in type defs
      this.physicsSystem.AddConstraint(constraint);
      const jointId = this._nextJointId++;
      const key = jointId.toString(10);
      this.joints[key] = constraint;
      this._jointStates[key] = {
        breakForce: 0,
        breakTorque: 0,
        lastReactionForce: 0,
        lastReactionTorque: 0,
        isBroken: false,
      };
      return jointId;
    }

    /**
     * Get a constraint by joint ID.
     */
    getJoint(jointId: integer | string): Jolt.Constraint | null {
      jointId = jointId.toString(10);
      if (this.joints.hasOwnProperty(jointId)) {
        return this.joints[jointId];
      }
      return null;
    }

    /**
     * Find the joint ID of a given constraint.
     */
    getJointId(constraint: Jolt.Constraint): integer {
      for (const jointId in this.joints) {
        if (this.joints.hasOwnProperty(jointId)) {
          if (this.joints[jointId] === constraint) {
            return parseInt(jointId, 10);
          }
        }
      }
      return 0;
    }

    /**
     * Find an existing joint between 2 bodies.
     * Optionally restrict search to a specific constraint subtype.
     */
    findJointIdBetweenBodies(
      firstBody: Jolt.Body,
      secondBody: Jolt.Body,
      constraintSubType?: number
    ): integer {
      for (const jointId in this.joints) {
        if (!this.joints.hasOwnProperty(jointId)) {
          continue;
        }
        const constraint = this.joints[jointId];
        if (
          constraintSubType !== undefined &&
          constraint.GetSubType() !== constraintSubType
        ) {
          continue;
        }
        try {
          const twoBodyConstraint = Jolt.castObject(
            constraint,
            Jolt.TwoBodyConstraint
          );
          const body1 = twoBodyConstraint.GetBody1();
          const body2 = twoBodyConstraint.GetBody2();
          if (
            (body1 === firstBody && body2 === secondBody) ||
            (body1 === secondBody && body2 === firstBody)
          ) {
            return parseInt(jointId, 10);
          }
        } catch (_e) {
          // Ignore non-two-body constraints.
        }
      }
      return 0;
    }

    /**
     * Remove a constraint by joint ID.
     */
    removeJoint(
      jointId: integer | string,
      markAsBroken: boolean = false
    ): void {
      const key = jointId.toString(10);
      const numericJointId = parseInt(key, 10);
      if (this.joints.hasOwnProperty(key)) {
        const constraint = this.joints[key];
        // @ts-ignore - RemoveConstraint exists in the WASM module but not in type defs
        this.physicsSystem.RemoveConstraint(constraint);
        Jolt.destroy(constraint);
        delete this.joints[key];
      }

      if (this._jointStates.hasOwnProperty(key)) {
        if (markAsBroken) {
          this._jointStates[key].isBroken = true;
          this._jointStates[key].breakForce = 0;
          this._jointStates[key].breakTorque = 0;
        } else {
          delete this._jointStates[key];
        }
      }

      for (const ragdollKey in this._ragdollGroups) {
        if (!this._ragdollGroups.hasOwnProperty(ragdollKey)) {
          continue;
        }
        const ragdollGroup = this._ragdollGroups[ragdollKey];
        const idx = ragdollGroup.jointIds.indexOf(numericJointId);
        if (idx !== -1) {
          ragdollGroup.jointIds.splice(idx, 1);
        }
      }
    }

    /**
     * Configure automatic break thresholds for a joint.
     * A value <= 0 disables the respective threshold.
     */
    setJointBreakThresholds(
      jointId: integer | string,
      maxForce: float,
      maxTorque: float
    ): void {
      const key = jointId.toString(10);
      if (!this.joints.hasOwnProperty(key) || !this._jointStates[key]) {
        return;
      }
      this._jointStates[key].breakForce = Math.max(0, maxForce);
      this._jointStates[key].breakTorque = Math.max(0, maxTorque);
      this._jointStates[key].isBroken = false;
    }

    /**
     * Clear automatic break thresholds for a joint.
     */
    clearJointBreakThresholds(jointId: integer | string): void {
      this.setJointBreakThresholds(jointId, 0, 0);
    }

    /**
     * Check if a joint has been broken by thresholds.
     */
    isJointBroken(jointId: integer | string): boolean {
      const key = jointId.toString(10);
      return this._jointStates.hasOwnProperty(key)
        ? this._jointStates[key].isBroken
        : false;
    }

    /**
     * Last measured reaction force for a joint (N-like unit).
     */
    getJointLastReactionForce(jointId: integer | string): float {
      const key = jointId.toString(10);
      return this._jointStates.hasOwnProperty(key)
        ? this._jointStates[key].lastReactionForce
        : 0;
    }

    /**
     * Last measured reaction torque for a joint.
     */
    getJointLastReactionTorque(jointId: integer | string): float {
      const key = jointId.toString(10);
      return this._jointStates.hasOwnProperty(key)
        ? this._jointStates[key].lastReactionTorque
        : 0;
    }

    private _computeJointFeedback(
      constraint: Jolt.Constraint,
      deltaTime: float
    ): { force: float; torque: float } {
      if (deltaTime <= epsilon) {
        return { force: 0, torque: 0 };
      }
      const invDeltaTime = 1 / deltaTime;
      const subType = constraint.GetSubType();

      try {
        if (subType === Jolt.EConstraintSubType_Distance) {
          const c = Jolt.castObject(constraint, Jolt.DistanceConstraint);
          return {
            force: Math.abs(c.GetTotalLambdaPosition()) * invDeltaTime,
            torque: 0,
          };
        }

        if (subType === Jolt.EConstraintSubType_Point) {
          const c = Jolt.castObject(constraint, Jolt.PointConstraint);
          return {
            force: vec3Length(c.GetTotalLambdaPosition()) * invDeltaTime,
            torque: 0,
          };
        }

        if (subType === Jolt.EConstraintSubType_Hinge) {
          const c = Jolt.castObject(constraint, Jolt.HingeConstraint);
          const forceImpulse = vec3Length(c.GetTotalLambdaPosition());
          const rotationImpulse = vector2Length(c.GetTotalLambdaRotation());
          const limitsImpulse = Math.abs(c.GetTotalLambdaRotationLimits());
          const motorImpulse = Math.abs(c.GetTotalLambdaMotor());
          const torqueImpulse = Math.sqrt(
            rotationImpulse * rotationImpulse +
              limitsImpulse * limitsImpulse +
              motorImpulse * motorImpulse
          );
          return {
            force: forceImpulse * invDeltaTime,
            torque: torqueImpulse * invDeltaTime,
          };
        }

        if (subType === Jolt.EConstraintSubType_Slider) {
          const c = Jolt.castObject(constraint, Jolt.SliderConstraint);
          const forcePositionImpulse = vector2Length(
            c.GetTotalLambdaPosition()
          );
          const forceLimitsImpulse = Math.abs(c.GetTotalLambdaPositionLimits());
          const forceMotorImpulse = Math.abs(c.GetTotalLambdaMotor());
          const forceImpulse = Math.sqrt(
            forcePositionImpulse * forcePositionImpulse +
              forceLimitsImpulse * forceLimitsImpulse +
              forceMotorImpulse * forceMotorImpulse
          );
          const torqueImpulse = vec3Length(c.GetTotalLambdaRotation());
          return {
            force: forceImpulse * invDeltaTime,
            torque: torqueImpulse * invDeltaTime,
          };
        }

        if (subType === Jolt.EConstraintSubType_Cone) {
          const c = Jolt.castObject(constraint, Jolt.ConeConstraint);
          return {
            force: vec3Length(c.GetTotalLambdaPosition()) * invDeltaTime,
            torque: Math.abs(c.GetTotalLambdaRotation()) * invDeltaTime,
          };
        }

        if (subType === Jolt.EConstraintSubType_SwingTwist) {
          const c = Jolt.castObject(constraint, Jolt.SwingTwistConstraint);
          const forceImpulse = vec3Length(c.GetTotalLambdaPosition());
          const twistImpulse = Math.abs(c.GetTotalLambdaTwist());
          const swingYImpulse = Math.abs(c.GetTotalLambdaSwingY());
          const swingZImpulse = Math.abs(c.GetTotalLambdaSwingZ());
          const motorImpulse = vec3Length(c.GetTotalLambdaMotor());
          const torqueImpulse = Math.sqrt(
            twistImpulse * twistImpulse +
              swingYImpulse * swingYImpulse +
              swingZImpulse * swingZImpulse +
              motorImpulse * motorImpulse
          );
          return {
            force: forceImpulse * invDeltaTime,
            torque: torqueImpulse * invDeltaTime,
          };
        }
      } catch (_e) {
        // If querying feedback fails for this joint type, keep defaults.
      }

      return { force: 0, torque: 0 };
    }

    private _updateJointFeedbackAndBreaks(deltaTime: float): void {
      const jointsToBreak: string[] = [];
      for (const jointId in this.joints) {
        if (!this.joints.hasOwnProperty(jointId)) {
          continue;
        }
        const state = this._jointStates[jointId];
        if (!state) {
          continue;
        }

        const constraint = this.joints[jointId];
        const feedback = this._computeJointFeedback(constraint, deltaTime);
        state.lastReactionForce = feedback.force;
        state.lastReactionTorque = feedback.torque;

        const shouldBreakByForce =
          state.breakForce > 0 && feedback.force >= state.breakForce;
        const shouldBreakByTorque =
          state.breakTorque > 0 && feedback.torque >= state.breakTorque;
        if (shouldBreakByForce || shouldBreakByTorque) {
          jointsToBreak.push(jointId);
        }
      }

      for (const jointId of jointsToBreak) {
        this.removeJoint(jointId, true);
      }
    }

    /**
     * Remove all joints associated with a body (called when a body is destroyed).
     */
    removeJointsWithBody(body: Jolt.Body): void {
      const jointIdsToRemove: string[] = [];
      for (const jointId in this.joints) {
        if (this.joints.hasOwnProperty(jointId)) {
          const constraint = this.joints[jointId];
          try {
            const twoBodyConstraint = Jolt.castObject(
              constraint,
              Jolt.TwoBodyConstraint
            );
            if (
              twoBodyConstraint.GetBody1() === body ||
              twoBodyConstraint.GetBody2() === body
            ) {
              jointIdsToRemove.push(jointId);
            }
          } catch (_e) {
            // Ignore non-two-body constraints.
          }
        }
      }
      for (const jointId of jointIdsToRemove) {
        this.removeJoint(jointId);
      }
    }

    step(deltaTime: float): void {
      for (const physicsBehavior of this._registeredBehaviors) {
        physicsBehavior._contactsStartedThisFrame.length = 0;
        physicsBehavior._contactsEndedThisFrame.length = 0;
      }
      for (const physicsBehavior of this._registeredBehaviors) {
        physicsBehavior.updateBodyFromObject();
      }
      for (const physics3DHook of this._physics3DHooks) {
        physics3DHook.doBeforePhysicsStep(deltaTime);
      }

      const numSteps = deltaTime > 1.0 / 55.0 ? 2 : 1;
      this.jolt.Step(deltaTime, numSteps);
      this._updateJointFeedbackAndBreaks(deltaTime);
      this.stepped = true;

      // It's important that updateBodyFromObject and updateObjectFromBody are
      // called at the same time because other behavior may move the object in
      // their doStepPreEvents.
      for (const physicsBehavior of this._registeredBehaviors) {
        physicsBehavior.updateObjectFromBody();
      }
    }

    /**
     * A hook must typically be registered by a behavior that requires this one
     * in its onCreate function.
     * The hook must stay forever to avoid side effects like a hooks order
     * change. To handle deactivated behavior, the hook can check that its
     * behavior is activated before doing anything.
     */
    registerHook(hook: gdjs.Physics3DRuntimeBehavior.Physics3DHook) {
      this._physics3DHooks.push(hook);
    }
  }
  gdjs.registerRuntimeSceneUnloadedCallback(function (runtimeScene) {
    const physics3DSharedData = runtimeScene.physics3DSharedData;
    if (physics3DSharedData) {
      // Destroy ragdoll group filters before tearing down the world.
      for (const ragdollId in physics3DSharedData._ragdollGroups) {
        if (!physics3DSharedData._ragdollGroups.hasOwnProperty(ragdollId)) {
          continue;
        }
        const group = physics3DSharedData._ragdollGroups[ragdollId];
        if (group.collisionFilter) {
          Jolt.destroy(group.collisionFilter);
          group.collisionFilter = null;
        }
      }
      physics3DSharedData._ragdollGroups = {};

      // Destroy all joints before destroying the physics world
      for (const jointId in physics3DSharedData.joints) {
        if (physics3DSharedData.joints.hasOwnProperty(jointId)) {
          Jolt.destroy(physics3DSharedData.joints[jointId]);
        }
      }
      physics3DSharedData.joints = {};
      physics3DSharedData._jointStates = {};
      Jolt.destroy(physics3DSharedData.contactListener);
      Jolt.destroy(physics3DSharedData._tempVec3);
      Jolt.destroy(physics3DSharedData._tempRVec3);
      Jolt.destroy(physics3DSharedData._tempQuat);
      Jolt.destroy(physics3DSharedData.jolt);
      runtimeScene.physics3DSharedData = null;
    }
  });

  /**
   * @category Behaviors > Physics 3D
   */
  export class Physics3DRuntimeBehavior extends gdjs.RuntimeBehavior {
    bodyUpdater: gdjs.Physics3DRuntimeBehavior.BodyUpdater;
    collisionChecker: gdjs.Physics3DRuntimeBehavior.CollisionChecker;
    owner3D: gdjs.RuntimeObject3D;

    bodyType: string;
    bullet: boolean;
    fixedRotation: boolean;
    _shape: string;
    private meshShapeResourceName: string;
    private shapeOrientation: string;
    private shapeDimensionA: float;
    private shapeDimensionB: float;
    private shapeDimensionC: float;
    private shapeOffsetX: float;
    private shapeOffsetY: float;
    shapeOffsetZ: float;
    private massCenterOffsetX: float;
    private massCenterOffsetY: float;
    private massCenterOffsetZ: float;
    private density: float;
    massOverride: float;
    friction: float;
    restitution: float;
    linearDamping: float;
    angularDamping: float;
    gravityScale: float;
    private layers: integer;
    private masks: integer;
    private ragdollRole: string;
    private ragdollGroupTag: string;
    private jointAutoWakeBodies: boolean;
    private jointAutoStabilityPreset: string;
    private jointAutoBreakForce: float;
    private jointAutoBreakTorque: float;
    private jointEditorEnabled: boolean;
    private jointEditorTargetObjectName: string;
    private jointEditorType: string;
    private jointEditorAnchorOffsetX: float;
    private jointEditorAnchorOffsetY: float;
    private jointEditorAnchorOffsetZ: float;
    private jointEditorTargetAnchorOffsetX: float;
    private jointEditorTargetAnchorOffsetY: float;
    private jointEditorTargetAnchorOffsetZ: float;
    private jointEditorUseCustomAxis: boolean;
    private jointEditorAxisX: float;
    private jointEditorAxisY: float;
    private jointEditorAxisZ: float;
    private jointEditorHingeMinAngle: float;
    private jointEditorHingeMaxAngle: float;
    private jointEditorDistanceMin: float;
    private jointEditorDistanceMax: float;
    private jointEditorPreviewEnabled: boolean;
    private jointEditorPreviewSize: float;
    private _jointEditorOwnedJointId: integer;
    private _jointEditorOwnedTargetUniqueId: integer;
    private _jointEditorOwnsJoint: boolean;
    private _jointEditorLoggedUnsupportedType: boolean;
    private _jointEditorPreviewGroup: THREE.Group | null;
    private _jointEditorPreviewLinkLine: THREE.Line | null;
    private _jointEditorPreviewAxisLine: THREE.Line | null;
    private _jointEditorPreviewAnchorMesh: THREE.Mesh | null;
    private _jointEditorPreviewSourceMesh: THREE.Mesh | null;
    private _jointEditorPreviewTargetMesh: THREE.Mesh | null;
    shapeScale: number = 1;

    /**
     * Array containing the beginning of contacts reported by onContactBegin. Each contact
     * should be unique to avoid recording glitches where the object loses and regain
     * contact between two frames. The array is updated each time the method
     * onContactBegin is called by the listener, which is only called when stepping
     * the world i.e. in the first preEvent called by a physics behavior. This array is
     * cleared just before stepping the world.
     */
    _contactsStartedThisFrame: Array<Physics3DRuntimeBehavior> = [];

    /**
     * Array containing the end of contacts reported by onContactEnd. The array is updated
     * each time the method onContactEnd is called by the listener, which can be called at
     * any time. This array is cleared just before stepping the world.
     */
    _contactsEndedThisFrame: Array<Physics3DRuntimeBehavior> = [];

    /**
     * Array containing the exact current contacts with the objects. It is updated
     * each time the methods onContactBegin and onContactEnd are called by the contact
     * listener.
     */
    _currentContacts: Array<Physics3DRuntimeBehavior> = [];

    private _destroyedDuringFrameLogic: boolean = false;
    _body: Jolt.Body | null = null;
    /**
     * When set to `true` the body will be recreated before the next physics step.
     */
    private _needToRecreateBody: boolean = false;
    /**
     * When set to `true` the shape will be recreated before the next physics step.
     */
    _needToRecreateShape: boolean = false;

    _shapeHalfWidth: float = 0;
    _shapeHalfHeight: float = 0;
    /**
     * Used by {@link gdjs.PhysicsCharacter3DRuntimeBehavior} to convert coordinates.
     */
    _shapeHalfDepth: float = 0;

    /**
     * sharedData is a reference to the shared data of the scene, that registers
     * every physics behavior that is created so that collisions can be cleared
     * before stepping the world.
     */
    _sharedData: Physics3DSharedData;

    _objectOldX: float = 0;
    _objectOldY: float = 0;
    _objectOldZ: float = 0;
    _objectOldRotationX: float = 0;
    _objectOldRotationY: float = 0;
    _objectOldRotationZ: float = 0;
    _objectOldWidth: float = 0;
    _objectOldHeight: float = 0;
    _objectOldDepth: float = 0;
    private _lastRaycastResult: Physics3DRaycastResult =
      makeNewPhysics3DRaycastResult();
    /**
     * Keeps stable target selection when a joint action references an object type
     * that has multiple instances in the scene.
     */
    private _preferredJointTargetsByObjectName: {
      [objectName: string]: integer;
    } = {};

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      behaviorData,
      owner: gdjs.RuntimeObject3D
    ) {
      super(instanceContainer, behaviorData, owner);
      this.bodyUpdater = new gdjs.Physics3DRuntimeBehavior.DefaultBodyUpdater(
        this
      );
      this.collisionChecker =
        new gdjs.Physics3DRuntimeBehavior.DefaultCollisionChecker(this);
      this.owner3D = owner;
      this.bodyType = behaviorData.bodyType;
      this.bullet = behaviorData.bullet;
      this.fixedRotation = behaviorData.fixedRotation;
      this._shape = behaviorData.shape;
      this.meshShapeResourceName = behaviorData.meshShapeResourceName || '';
      this.shapeOrientation =
        behaviorData.shape === 'Box' ? 'Z' : behaviorData.shapeOrientation;
      this.shapeDimensionA = behaviorData.shapeDimensionA;
      this.shapeDimensionB = behaviorData.shapeDimensionB;
      this.shapeDimensionC = behaviorData.shapeDimensionC;
      this.shapeOffsetX = behaviorData.shapeOffsetX || 0;
      this.shapeOffsetY = behaviorData.shapeOffsetY || 0;
      this.shapeOffsetZ = behaviorData.shapeOffsetZ || 0;
      this.massCenterOffsetX = behaviorData.massCenterOffsetX || 0;
      this.massCenterOffsetY = behaviorData.massCenterOffsetY || 0;
      this.massCenterOffsetZ = behaviorData.massCenterOffsetZ || 0;
      this.density = Math.max(0.0001, behaviorData.density);
      this.massOverride = behaviorData.massOverride || 0;
      this.friction = behaviorData.friction;
      this.restitution = behaviorData.restitution;
      this.linearDamping = Math.max(0, behaviorData.linearDamping);
      this.angularDamping = Math.max(0, behaviorData.angularDamping);
      this.gravityScale = behaviorData.gravityScale;
      this.layers = behaviorData.layers;
      this.masks = behaviorData.masks;
      this.ragdollRole = behaviorData.ragdollRole || 'None';
      this.ragdollGroupTag = behaviorData.ragdollGroupTag || '';
      this.jointAutoWakeBodies =
        behaviorData.jointAutoWakeBodies === undefined
          ? true
          : !!behaviorData.jointAutoWakeBodies;
      this.jointAutoStabilityPreset =
        behaviorData.jointAutoStabilityPreset || 'Stable';
      this.jointAutoBreakForce = Math.max(
        0,
        behaviorData.jointAutoBreakForce || 0
      );
      this.jointAutoBreakTorque = Math.max(
        0,
        behaviorData.jointAutoBreakTorque || 0
      );
      this.jointEditorEnabled = !!behaviorData.jointEditorEnabled;
      this.jointEditorTargetObjectName =
        behaviorData.jointEditorTargetObjectName || '';
      this.jointEditorType = behaviorData.jointEditorType || 'None';
      this.jointEditorAnchorOffsetX =
        behaviorData.jointEditorAnchorOffsetX || 0;
      this.jointEditorAnchorOffsetY =
        behaviorData.jointEditorAnchorOffsetY || 0;
      this.jointEditorAnchorOffsetZ =
        behaviorData.jointEditorAnchorOffsetZ || 0;
      this.jointEditorTargetAnchorOffsetX =
        behaviorData.jointEditorTargetAnchorOffsetX || 0;
      this.jointEditorTargetAnchorOffsetY =
        behaviorData.jointEditorTargetAnchorOffsetY || 0;
      this.jointEditorTargetAnchorOffsetZ =
        behaviorData.jointEditorTargetAnchorOffsetZ || 0;
      this.jointEditorUseCustomAxis = !!behaviorData.jointEditorUseCustomAxis;
      this.jointEditorAxisX =
        behaviorData.jointEditorAxisX !== undefined
          ? behaviorData.jointEditorAxisX
          : 1;
      this.jointEditorAxisY = behaviorData.jointEditorAxisY || 0;
      this.jointEditorAxisZ = behaviorData.jointEditorAxisZ || 0;
      this.jointEditorHingeMinAngle =
        behaviorData.jointEditorHingeMinAngle !== undefined
          ? behaviorData.jointEditorHingeMinAngle
          : -60;
      this.jointEditorHingeMaxAngle =
        behaviorData.jointEditorHingeMaxAngle !== undefined
          ? behaviorData.jointEditorHingeMaxAngle
          : 60;
      this.jointEditorDistanceMin = Math.max(
        0,
        behaviorData.jointEditorDistanceMin || 0
      );
      this.jointEditorDistanceMax = Math.max(
        0,
        behaviorData.jointEditorDistanceMax || 0
      );
      this.jointEditorPreviewEnabled =
        behaviorData.jointEditorPreviewEnabled === undefined
          ? true
          : !!behaviorData.jointEditorPreviewEnabled;
      this.jointEditorPreviewSize = Math.max(
        1,
        behaviorData.jointEditorPreviewSize || 8
      );
      this._jointEditorOwnedJointId = 0;
      this._jointEditorOwnedTargetUniqueId = 0;
      this._jointEditorOwnsJoint = false;
      this._jointEditorLoggedUnsupportedType = false;
      this._jointEditorPreviewGroup = null;
      this._jointEditorPreviewLinkLine = null;
      this._jointEditorPreviewAxisLine = null;
      this._jointEditorPreviewAnchorMesh = null;
      this._jointEditorPreviewSourceMesh = null;
      this._jointEditorPreviewTargetMesh = null;
      this._sharedData = Physics3DSharedData.getSharedData(
        instanceContainer.getScene(),
        behaviorData.name
      );
      this._sharedData.addToBehaviorsList(this);
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

    override applyBehaviorOverriding(behaviorData): boolean {
      if (behaviorData.bullet !== undefined) {
        this.setBullet(behaviorData.bullet);
      }
      if (behaviorData.fixedRotation !== undefined) {
        this.setFixedRotation(behaviorData.fixedRotation);
      }
      if (behaviorData.shapeDimensionA !== undefined) {
        this.shapeDimensionA = behaviorData.shapeDimensionA;
        this._needToRecreateShape = true;
      }
      if (behaviorData.shapeDimensionB !== undefined) {
        this.shapeDimensionB = behaviorData.shapeDimensionB;
        this._needToRecreateShape = true;
      }
      if (behaviorData.density !== undefined) {
        this.setDensity(behaviorData.density);
      }
      if (behaviorData.friction !== undefined) {
        this.setFriction(behaviorData.friction);
      }
      if (behaviorData.restitution !== undefined) {
        this.setRestitution(behaviorData.restitution);
      }
      if (behaviorData.linearDamping !== undefined) {
        this.setLinearDamping(behaviorData.linearDamping);
      }
      if (behaviorData.angularDamping !== undefined) {
        this.setAngularDamping(behaviorData.angularDamping);
      }
      if (behaviorData.gravityScale !== undefined) {
        this.setGravityScale(behaviorData.gravityScale);
      }
      if (behaviorData.ragdollRole !== undefined) {
        this.setRagdollRole(behaviorData.ragdollRole);
      }
      if (behaviorData.ragdollGroupTag !== undefined) {
        this.setRagdollGroupTag(behaviorData.ragdollGroupTag);
      }
      if (behaviorData.jointAutoWakeBodies !== undefined) {
        this.setJointAutoWakeBodies(behaviorData.jointAutoWakeBodies);
      }
      if (behaviorData.jointAutoStabilityPreset !== undefined) {
        this.setJointAutoStabilityPreset(behaviorData.jointAutoStabilityPreset);
      }
      if (behaviorData.jointAutoBreakForce !== undefined) {
        this.setJointAutoBreakForce(behaviorData.jointAutoBreakForce);
      }
      if (behaviorData.jointAutoBreakTorque !== undefined) {
        this.setJointAutoBreakTorque(behaviorData.jointAutoBreakTorque);
      }
      if (behaviorData.jointEditorEnabled !== undefined) {
        this.setJointEditorEnabled(behaviorData.jointEditorEnabled);
      }
      if (behaviorData.jointEditorTargetObjectName !== undefined) {
        this.setJointEditorTargetObjectName(
          behaviorData.jointEditorTargetObjectName
        );
      }
      if (behaviorData.jointEditorType !== undefined) {
        this.setJointEditorType(behaviorData.jointEditorType);
      }
      if (behaviorData.jointEditorAnchorOffsetX !== undefined) {
        this.jointEditorAnchorOffsetX = behaviorData.jointEditorAnchorOffsetX;
        this._clearJointEditorOwnedJoint();
      }
      if (behaviorData.jointEditorAnchorOffsetY !== undefined) {
        this.jointEditorAnchorOffsetY = behaviorData.jointEditorAnchorOffsetY;
        this._clearJointEditorOwnedJoint();
      }
      if (behaviorData.jointEditorAnchorOffsetZ !== undefined) {
        this.jointEditorAnchorOffsetZ = behaviorData.jointEditorAnchorOffsetZ;
        this._clearJointEditorOwnedJoint();
      }
      if (behaviorData.jointEditorTargetAnchorOffsetX !== undefined) {
        this.jointEditorTargetAnchorOffsetX =
          behaviorData.jointEditorTargetAnchorOffsetX;
        this._clearJointEditorOwnedJoint();
      }
      if (behaviorData.jointEditorTargetAnchorOffsetY !== undefined) {
        this.jointEditorTargetAnchorOffsetY =
          behaviorData.jointEditorTargetAnchorOffsetY;
        this._clearJointEditorOwnedJoint();
      }
      if (behaviorData.jointEditorTargetAnchorOffsetZ !== undefined) {
        this.jointEditorTargetAnchorOffsetZ =
          behaviorData.jointEditorTargetAnchorOffsetZ;
        this._clearJointEditorOwnedJoint();
      }
      if (behaviorData.jointEditorUseCustomAxis !== undefined) {
        this.jointEditorUseCustomAxis = !!behaviorData.jointEditorUseCustomAxis;
        this._clearJointEditorOwnedJoint();
      }
      if (behaviorData.jointEditorAxisX !== undefined) {
        this.jointEditorAxisX = behaviorData.jointEditorAxisX;
        this._clearJointEditorOwnedJoint();
      }
      if (behaviorData.jointEditorAxisY !== undefined) {
        this.jointEditorAxisY = behaviorData.jointEditorAxisY;
        this._clearJointEditorOwnedJoint();
      }
      if (behaviorData.jointEditorAxisZ !== undefined) {
        this.jointEditorAxisZ = behaviorData.jointEditorAxisZ;
        this._clearJointEditorOwnedJoint();
      }
      if (behaviorData.jointEditorHingeMinAngle !== undefined) {
        this.jointEditorHingeMinAngle = behaviorData.jointEditorHingeMinAngle;
        this._clearJointEditorOwnedJoint();
      }
      if (behaviorData.jointEditorHingeMaxAngle !== undefined) {
        this.jointEditorHingeMaxAngle = behaviorData.jointEditorHingeMaxAngle;
        this._clearJointEditorOwnedJoint();
      }
      if (behaviorData.jointEditorDistanceMin !== undefined) {
        this.jointEditorDistanceMin = Math.max(
          0,
          behaviorData.jointEditorDistanceMin
        );
        this._clearJointEditorOwnedJoint();
      }
      if (behaviorData.jointEditorDistanceMax !== undefined) {
        this.jointEditorDistanceMax = Math.max(
          0,
          behaviorData.jointEditorDistanceMax
        );
        this._clearJointEditorOwnedJoint();
      }
      if (behaviorData.jointEditorPreviewEnabled !== undefined) {
        this.jointEditorPreviewEnabled =
          !!behaviorData.jointEditorPreviewEnabled;
      }
      if (behaviorData.jointEditorPreviewSize !== undefined) {
        this.jointEditorPreviewSize = Math.max(
          1,
          behaviorData.jointEditorPreviewSize
        );
      }

      // TODO: make these properties updatable.
      if (behaviorData.layers !== undefined) {
        return false;
      }
      if (behaviorData.masks !== undefined) {
        return false;
      }
      if (behaviorData.vertices !== undefined) {
        return false;
      }
      if (behaviorData.bodyType !== undefined) {
        return false;
      }
      if (behaviorData.shape !== undefined) {
        return false;
      }
      return true;
    }

    override getNetworkSyncData(
      options: GetNetworkSyncDataOptions
    ): Physics3DNetworkSyncData {
      let bodyProps;
      if (this._body) {
        const position = this._body.GetPosition();
        const rotation = this._body.GetRotation();
        const linearVelocity = this._body.GetLinearVelocity();
        const angularVelocity = this._body.GetAngularVelocity();
        bodyProps = {
          px: position.GetX(),
          py: position.GetY(),
          pz: position.GetZ(),
          rx: rotation.GetX(),
          ry: rotation.GetY(),
          rz: rotation.GetZ(),
          rw: rotation.GetW(),
          lvx: linearVelocity.GetX(),
          lvy: linearVelocity.GetY(),
          lvz: linearVelocity.GetZ(),
          avx: angularVelocity.GetX(),
          avy: angularVelocity.GetY(),
          avz: angularVelocity.GetZ(),
          aw: this._body.IsActive(),
        };
      } else {
        bodyProps = {
          px: undefined,
          py: undefined,
          pz: undefined,
          rx: undefined,
          ry: undefined,
          rz: undefined,
          rw: undefined,
          lvx: undefined,
          lvy: undefined,
          lvz: undefined,
          avx: undefined,
          avy: undefined,
          avz: undefined,
          aw: undefined,
        };
      }
      return {
        ...super.getNetworkSyncData(options),
        props: {
          ...bodyProps,
          layers: this.layers,
          masks: this.masks,
        },
      };
    }

    override updateFromNetworkSyncData(
      networkSyncData: Physics3DNetworkSyncData,
      options: UpdateFromNetworkSyncDataOptions
    ) {
      super.updateFromNetworkSyncData(networkSyncData, options);

      const behaviorSpecificProps = networkSyncData.props;

      if (behaviorSpecificProps.layers !== undefined) {
        this.layers = behaviorSpecificProps.layers;
      }
      if (behaviorSpecificProps.masks !== undefined) {
        this.masks = behaviorSpecificProps.masks;
      }

      this._needToRecreateShape = true;
      this._needToRecreateBody = true;
      this.updateBodyFromObject();

      if (!this._body) return;

      if (
        behaviorSpecificProps.px !== undefined &&
        behaviorSpecificProps.py !== undefined &&
        behaviorSpecificProps.pz !== undefined
      ) {
        this._sharedData.bodyInterface.SetPosition(
          this._body.GetID(),
          this.getRVec3(
            behaviorSpecificProps.px,
            behaviorSpecificProps.py,
            behaviorSpecificProps.pz
          ),
          Jolt.EActivation_DontActivate
        );
      }
      if (
        behaviorSpecificProps.rx !== undefined &&
        behaviorSpecificProps.ry !== undefined &&
        behaviorSpecificProps.rz !== undefined &&
        behaviorSpecificProps.rw !== undefined
      ) {
        this._sharedData.bodyInterface.SetRotation(
          this._body.GetID(),
          this.getQuat(
            behaviorSpecificProps.rx,
            behaviorSpecificProps.ry,
            behaviorSpecificProps.rz,
            behaviorSpecificProps.rw
          ),
          Jolt.EActivation_DontActivate
        );
      }
      if (
        behaviorSpecificProps.lvx !== undefined &&
        behaviorSpecificProps.lvy !== undefined &&
        behaviorSpecificProps.lvz !== undefined
      ) {
        this._sharedData.bodyInterface.SetLinearVelocity(
          this._body.GetID(),
          this.getVec3(
            behaviorSpecificProps.lvx,
            behaviorSpecificProps.lvy,
            behaviorSpecificProps.lvz
          )
        );
      }
      if (
        behaviorSpecificProps.avx !== undefined &&
        behaviorSpecificProps.avy !== undefined &&
        behaviorSpecificProps.avz !== undefined
      ) {
        this._sharedData.bodyInterface.SetAngularVelocity(
          this._body.GetID(),
          this.getVec3(
            behaviorSpecificProps.avx,
            behaviorSpecificProps.avy,
            behaviorSpecificProps.avz
          )
        );
      }
    }

    override onDeActivate() {
      this._sharedData.removeFromBehaviorsList(this);
      this._destroyBody();
    }

    override onActivate() {
      this._sharedData.addToBehaviorsList(this);
    }

    override onDestroy() {
      this._destroyedDuringFrameLogic = true;
      this._disposeJointEditorPreview();
      this._clearJointEditorOwnedJoint();
      this._sharedData.removeBodyFromAllRagdollGroups(this);
      this.onDeActivate();
    }

    _destroyBody() {
      this._preferredJointTargetsByObjectName = {};
      this._disposeJointEditorPreview();
      this._clearJointEditorOwnedJoint();
      // Remove all joints associated with this body before destroying it
      if (this._body !== null) {
        this._sharedData.removeJointsWithBody(this._body);
      }
      this.bodyUpdater.destroyBody();
      this._contactsEndedThisFrame.length = 0;
      this._contactsStartedThisFrame.length = 0;
      this._currentContacts.length = 0;
    }

    resetToDefaultBodyUpdater() {
      this.bodyUpdater = new gdjs.Physics3DRuntimeBehavior.DefaultBodyUpdater(
        this
      );
    }

    resetToDefaultCollisionChecker() {
      this.collisionChecker =
        new gdjs.Physics3DRuntimeBehavior.DefaultCollisionChecker(this);
    }

    createShape(): Jolt.Shape {
      if (
        this.massCenterOffsetX === 0 &&
        this.massCenterOffsetY === 0 &&
        this.massCenterOffsetZ === 0
      ) {
        return this.createShapeWithoutMassCenterOffset();
      }
      const rotatedShapeSettings =
        this._createNewShapeSettingsWithoutMassCenterOffset();
      const shapeScale = this.shapeScale * this._sharedData.worldInvScale;
      const offsetCenterShapeSettings =
        new Jolt.OffsetCenterOfMassShapeSettings(
          this.getVec3(
            this.massCenterOffsetX * shapeScale,
            this.massCenterOffsetY * shapeScale,
            this.massCenterOffsetZ * shapeScale
          ),
          rotatedShapeSettings
        );
      const shape = offsetCenterShapeSettings.Create().Get();
      Jolt.destroy(offsetCenterShapeSettings);
      return shape;
    }

    createShapeWithoutMassCenterOffset(): Jolt.Shape {
      const rotatedShapeSettings =
        this._createNewShapeSettingsWithoutMassCenterOffset();
      const shape = rotatedShapeSettings.Create().Get();
      Jolt.destroy(rotatedShapeSettings);
      return shape;
    }

    private _createNewShapeSettingsWithoutMassCenterOffset(): Jolt.RotatedTranslatedShapeSettings {
      let width = this.owner3D.getWidth() * this._sharedData.worldInvScale;
      let height = this.owner3D.getHeight() * this._sharedData.worldInvScale;
      let depth = this.owner3D.getDepth() * this._sharedData.worldInvScale;
      if (this.shapeOrientation === 'X') {
        const swap = depth;
        depth = width;
        width = swap;
      } else if (this.shapeOrientation === 'Y') {
        const swap = depth;
        depth = height;
        height = swap;
      }

      const shapeScale = this.shapeScale * this._sharedData.worldInvScale;

      const shapeDimensionA = this.shapeDimensionA * shapeScale;
      const shapeDimensionB = this.shapeDimensionB * shapeScale;
      const shapeDimensionC = this.shapeDimensionC * shapeScale;

      const onePixel = this._sharedData.worldInvScale;

      let shapeSettings: Jolt.ShapeSettings;
      /** This is fine only because no other Quat is used locally. */
      let quat: Jolt.Quat;
      if (
        this._shape === 'Mesh' &&
        this.bodyType === 'Static' &&
        isModel3D(this.owner)
      ) {
        const meshShapeSettings: Array<Jolt.MeshShapeSettings> =
          gdjs.staticArray(
            Physics3DRuntimeBehavior.prototype
              ._createNewShapeSettingsWithoutMassCenterOffset
          );
        this.getMeshShapeSettings(
          this.owner,
          width,
          height,
          depth,
          meshShapeSettings
        );
        if (meshShapeSettings.length === 1) {
          shapeSettings = meshShapeSettings[0];
        } else {
          const compoundShapeSettings = new Jolt.StaticCompoundShapeSettings();
          for (let index = 0; index < meshShapeSettings.length; index++) {
            compoundShapeSettings.AddShapeShapeSettings(
              this.getVec3(0, 0, 0),
              this.getQuat(0, 0, 0, 1),
              meshShapeSettings[index],
              index
            );
          }
          shapeSettings = compoundShapeSettings;
        }
        meshShapeSettings.length = 0;
        quat = this.getQuat(0, 0, 0, 1);
      } else {
        let convexShapeSettings: Jolt.ConvexShapeSettings;
        if (this._shape === 'Box') {
          const boxWidth =
            shapeDimensionA > 0
              ? shapeDimensionA
              : width > 0
                ? width
                : onePixel;
          const boxHeight =
            shapeDimensionB > 0
              ? shapeDimensionB
              : height > 0
                ? height
                : onePixel;
          const boxDepth =
            shapeDimensionC > 0
              ? shapeDimensionC
              : depth > 0
                ? depth
                : onePixel;
          // The convex radius should not eat up the whole volume.
          const convexRadius = Math.min(
            onePixel,
            Math.min(boxWidth, boxHeight, boxDepth) / 4
          );
          convexShapeSettings = new Jolt.BoxShapeSettings(
            this.getVec3(boxWidth / 2, boxHeight / 2, boxDepth / 2),
            convexRadius
          );
          quat = this.getQuat(0, 0, 0, 1);
          this._shapeHalfWidth = boxWidth / 2;
          this._shapeHalfHeight = boxHeight / 2;
          this._shapeHalfDepth = boxDepth / 2;
        } else if (this._shape === 'Capsule') {
          const radius =
            shapeDimensionA > 0
              ? shapeDimensionA
              : width > 0
                ? Math.sqrt(width * height) / 2
                : onePixel;
          const capsuleDepth =
            shapeDimensionB > 0
              ? shapeDimensionB
              : depth > 0
                ? depth
                : onePixel;
          convexShapeSettings = new Jolt.CapsuleShapeSettings(
            Math.max(0, capsuleDepth / 2 - radius),
            radius
          );
          quat = this._getShapeOrientationQuat();
          this._shapeHalfWidth =
            this.shapeOrientation === 'X' ? capsuleDepth / 2 : radius;
          this._shapeHalfHeight =
            this.shapeOrientation === 'Y' ? capsuleDepth / 2 : radius;
          this._shapeHalfDepth =
            this.shapeOrientation === 'Z' ? capsuleDepth / 2 : radius;
        } else if (this._shape === 'Cylinder') {
          const radius =
            shapeDimensionA > 0
              ? shapeDimensionA
              : width > 0
                ? Math.sqrt(width * height) / 2
                : onePixel;
          const cylinderDepth =
            shapeDimensionB > 0
              ? shapeDimensionB
              : depth > 0
                ? depth
                : onePixel;
          // The convex radius should not eat up the whole volume.
          const convexRadius = Math.min(
            onePixel,
            Math.min(cylinderDepth, radius) / 4
          );
          convexShapeSettings = new Jolt.CylinderShapeSettings(
            cylinderDepth / 2,
            radius,
            convexRadius
          );
          quat = this._getShapeOrientationQuat();
          this._shapeHalfWidth =
            this.shapeOrientation === 'X' ? cylinderDepth / 2 : radius;
          this._shapeHalfHeight =
            this.shapeOrientation === 'Y' ? cylinderDepth / 2 : radius;
          this._shapeHalfDepth =
            this.shapeOrientation === 'Z' ? cylinderDepth / 2 : radius;
        } else {
          // Create a 'Sphere' by default.
          const radius =
            shapeDimensionA > 0
              ? shapeDimensionA
              : width > 0
                ? Math.pow(width * height * depth, 1 / 3) / 2
                : onePixel;
          convexShapeSettings = new Jolt.SphereShapeSettings(radius);
          quat = this.getQuat(0, 0, 0, 1);
          this._shapeHalfWidth = radius;
          this._shapeHalfHeight = radius;
          this._shapeHalfDepth = radius;
        }
        convexShapeSettings.mDensity = this.density;
        shapeSettings = convexShapeSettings;
      }
      return new Jolt.RotatedTranslatedShapeSettings(
        this.getVec3(
          this.shapeOffsetX * shapeScale,
          this.shapeOffsetY * shapeScale,
          this.shapeOffsetZ * shapeScale
        ),
        quat,
        shapeSettings
      );
    }

    private getMeshShapeSettings(
      model3DRuntimeObject: gdjs.Model3DRuntimeObject,
      width: float,
      height: float,
      depth: float,
      meshes: Array<Jolt.MeshShapeSettings>
    ): void {
      const originalModel = this.owner
        .getInstanceContainer()
        .getGame()
        .getModel3DManager()
        .getModel(
          this.meshShapeResourceName ||
            model3DRuntimeObject._modelResourceName ||
            ''
        );

      const modelInCube = new THREE.Group();
      modelInCube.rotation.order = 'ZYX';
      const root = THREE_ADDONS.SkeletonUtils.clone(originalModel.scene);
      modelInCube.add(root);

      const data = model3DRuntimeObject._data.content;
      model3DRuntimeObject._renderer.stretchModelIntoUnitaryCube(
        modelInCube,
        data.rotationX,
        data.rotationY,
        data.rotationZ
      );

      const threeObject = new THREE.Group();
      threeObject.rotation.order = 'ZYX';
      threeObject.add(modelInCube);
      const object = this.owner3D;
      threeObject.scale.set(
        object.isFlippedX() ? -width : width,
        object.isFlippedY() ? -height : height,
        object.isFlippedZ() ? -depth : depth
      );

      threeObject.updateMatrixWorld();

      // For indexed triangles
      const vector3 = new THREE.Vector3();
      const float3 = new Jolt.Float3(0, 0, 0);
      const vertexList = new Jolt.VertexList();
      const indexedTriangle = new Jolt.IndexedTriangle();
      const indexedTriangleList = new Jolt.IndexedTriangleList();
      const physicsMaterialList = new Jolt.PhysicsMaterialList();

      // For non-indexed triangles
      const triangleList = new Jolt.TriangleList();
      const a = new Jolt.Vec3();
      const b = new Jolt.Vec3();
      const c = new Jolt.Vec3();

      threeObject.traverse((object3d) => {
        const mesh = object3d as THREE.Mesh;
        if (!mesh.isMesh) {
          return;
        }
        const positionAttribute = mesh.geometry.getAttribute('position');
        object3d.getWorldScale(vector3);
        const shouldTrianglesBeFlipped = vector3.x * vector3.y * vector3.z < 0;
        const index = mesh.geometry.getIndex();
        if (index) {
          vertexList.clear();
          for (let i = 0; i < positionAttribute.count; i++) {
            vector3.fromBufferAttribute(positionAttribute, i);
            object3d.localToWorld(vector3);
            float3.x = vector3.x;
            float3.y = vector3.y;
            float3.z = vector3.z;
            // The list create a copy of the Float3.
            vertexList.push_back(float3);
          }
          indexedTriangleList.clear();
          for (let i = 0; i < index.count; i += 3) {
            indexedTriangle.set_mIdx(
              0,
              index.getX(shouldTrianglesBeFlipped ? i + 1 : i)
            );
            indexedTriangle.set_mIdx(
              1,
              index.getX(shouldTrianglesBeFlipped ? i : i + 1)
            );
            indexedTriangle.set_mIdx(2, index.getX(i + 2));
            // The list create a copy of the IndexedTriangle.
            indexedTriangleList.push_back(indexedTriangle);
          }
          // Parameters passed to `MeshShapeSettings` are copied,
          // we need to destroy them later when unused.
          meshes.push(
            new Jolt.MeshShapeSettings(
              vertexList,
              indexedTriangleList,
              physicsMaterialList
            )
          );
        } else {
          triangleList.clear();
          for (let i = 0; i < positionAttribute.count; i += 3) {
            vector3.fromBufferAttribute(positionAttribute, i);
            object3d.localToWorld(vector3);
            a.Set(vector3.x, vector3.y, vector3.z);

            vector3.fromBufferAttribute(positionAttribute, i + 1);
            object3d.localToWorld(vector3);
            b.Set(vector3.x, vector3.y, vector3.z);

            vector3.fromBufferAttribute(positionAttribute, i + 2);
            object3d.localToWorld(vector3);
            c.Set(vector3.x, vector3.y, vector3.z);

            // The triangle's setter is not easy to use so we create new instances.
            const triangle = new Jolt.Triangle(
              shouldTrianglesBeFlipped ? b : a,
              shouldTrianglesBeFlipped ? a : b,
              c
            );
            // The list create a copy of the Triangle.
            triangleList.push_back(triangle);
            Jolt.destroy(triangle);
          }
          // `MeshShapeSettings` creates a copy when it indexes the triangle,
          // we need to destroy them.
          meshes.push(new Jolt.MeshShapeSettings(triangleList));
        }
      });
      Jolt.destroy(float3);
      Jolt.destroy(vertexList);
      Jolt.destroy(indexedTriangle);
      Jolt.destroy(indexedTriangleList);
      Jolt.destroy(physicsMaterialList);

      Jolt.destroy(triangleList);
      Jolt.destroy(a);
      Jolt.destroy(b);
      Jolt.destroy(c);
    }

    private _getShapeOrientationQuat(): Jolt.Quat {
      if (this.shapeOrientation === 'X') {
        // Top on X axis.
        return this.getQuat(0, 0, Math.sqrt(2) / 2, -Math.sqrt(2) / 2);
      } else if (this.shapeOrientation === 'Y') {
        // Top on Y axis.
        return this.getQuat(0, 0, 0, 1);
      } else {
        // Top on Z axis.
        return this.getQuat(Math.sqrt(2) / 2, 0, 0, Math.sqrt(2) / 2);
      }
    }

    private _recreateShape(): void {
      this.bodyUpdater.recreateShape();

      this._objectOldWidth = this.owner3D.getWidth();
      this._objectOldHeight = this.owner3D.getHeight();
      this._objectOldDepth = this.owner3D.getDepth();
    }

    getShapeScale(): float {
      return this.shapeScale;
    }

    setShapeScale(shapeScale: float): void {
      if (shapeScale !== this.shapeScale && shapeScale > 0) {
        this.shapeScale = shapeScale;
        this._needToRecreateShape = true;
      }
    }

    getBody(): Jolt.Body {
      if (this._body === null) {
        this._createBody();
      }
      return this._body!;
    }

    _createBody(): boolean {
      this._needToRecreateBody = false;
      this._needToRecreateShape = false;

      if (!this.activated() || this._destroyedDuringFrameLogic) return false;

      this._body = this.bodyUpdater.createAndAddBody();
      if (!this._body) {
        // It can only happen when the character behavior is destroyed.
        return false;
      }
      this._body.gdjsAssociatedBehavior = this;

      this._objectOldWidth = this.owner3D.getWidth();
      this._objectOldHeight = this.owner3D.getHeight();
      this._objectOldDepth = this.owner3D.getDepth();
      return true;
    }

    /**
     * @returns The body layer id according to the behavior configuration.
     */
    getBodyLayer(): number {
      return Jolt.ObjectLayerPairFilterMask.prototype.sGetObjectLayer(
        this.getLayersAccordingToBodyType(),
        this.getMasksAccordingToBodyType()
      );
    }

    private getLayersAccordingToBodyType(): integer {
      // Make sure objects don't register in the wrong layer group.
      return this.isStatic()
        ? this.layers & gdjs.Physics3DSharedData.staticLayersMask
        : this.layers & gdjs.Physics3DSharedData.dynamicLayersMask;
    }

    private getMasksAccordingToBodyType(): integer {
      // Static objects accept all collisions as it's the mask of dynamic objects that matters.
      return this.isStatic()
        ? gdjs.Physics3DSharedData.allLayersMask
        : this.masks;
    }

    override doStepPreEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {
      // Step the world if not done this frame yet.
      // Don't step at the first frame to allow events to handle overlapping objects.
      if (
        !this._sharedData.stepped &&
        !instanceContainer.getScene().getTimeManager().isFirstFrame()
      ) {
        this._sharedData.step(
          instanceContainer.getScene().getTimeManager().getElapsedTime() /
            1000.0
        );
      }
    }

    override doStepPostEvents(
      instanceContainer: gdjs.RuntimeInstanceContainer
    ) {
      // Reset world step to update next frame
      this._sharedData.stepped = false;
      this._syncJointEditorBinding();
    }

    onObjectHotReloaded() {
      this.updateBodyFromObject();
    }

    recreateBody(previousBodyData?: {
      linearVelocityX: float;
      linearVelocityY: float;
      linearVelocityZ: float;
      angularVelocityX: float;
      angularVelocityY: float;
      angularVelocityZ: float;
    }) {
      const bodyInterface = this._sharedData.bodyInterface;
      const linearVelocityX = previousBodyData
        ? previousBodyData.linearVelocityX
        : this._body
          ? this._body.GetLinearVelocity().GetX()
          : 0;
      const linearVelocityY = previousBodyData
        ? previousBodyData.linearVelocityY
        : this._body
          ? this._body.GetLinearVelocity().GetY()
          : 0;
      const linearVelocityZ = previousBodyData
        ? previousBodyData.linearVelocityZ
        : this._body
          ? this._body.GetLinearVelocity().GetZ()
          : 0;
      const angularVelocityX = previousBodyData
        ? previousBodyData.angularVelocityX
        : this._body
          ? this._body.GetAngularVelocity().GetX()
          : 0;
      const angularVelocityY = previousBodyData
        ? previousBodyData.angularVelocityY
        : this._body
          ? this._body.GetAngularVelocity().GetY()
          : 0;
      const angularVelocityZ = previousBodyData
        ? previousBodyData.angularVelocityZ
        : this._body
          ? this._body.GetAngularVelocity().GetZ()
          : 0;

      if (this._body) {
        // Joints cannot survive body recreation because they reference body IDs.
        // Remove them first to avoid dangling constraints affecting other bodies.
        this._sharedData.removeJointsWithBody(this._body);
        this.bodyUpdater.destroyBody();
        this._contactsEndedThisFrame.length = 0;
        this._contactsStartedThisFrame.length = 0;
        this._currentContacts.length = 0;
      }

      this._createBody();
      if (!this._body) {
        return;
      }

      const bodyID = this._body.GetID();
      bodyInterface.SetLinearVelocity(
        bodyID,
        this.getVec3(linearVelocityX, linearVelocityY, linearVelocityZ)
      );
      bodyInterface.SetAngularVelocity(
        bodyID,
        this.getVec3(angularVelocityX, angularVelocityY, angularVelocityZ)
      );
    }

    updateObjectFromBody() {
      this.bodyUpdater.updateObjectFromBody();

      // Update cached transform.
      this._objectOldX = this.owner3D.getX();
      this._objectOldY = this.owner3D.getY();
      this._objectOldZ = this.owner3D.getZ();
      this._objectOldRotationX = this.owner3D.getRotationX();
      this._objectOldRotationY = this.owner3D.getRotationY();
      this._objectOldRotationZ = this.owner3D.getAngle();
    }

    updateBodyFromObject() {
      if (this._body === null) {
        if (!this._createBody()) return;
      }

      if (this._needToRecreateBody) {
        this.recreateBody();
      }

      // The object size has changed, recreate the shape.
      // The width has changed and there is no custom dimension A (box: width, circle: radius, edge: length) or
      // The height has changed, the shape is not an edge (edges doesn't have height),
      // it isn't a box with custom height or a circle with custom radius
      if (
        this._needToRecreateShape ||
        (!this.hasCustomShapeDimension() &&
          (this._objectOldWidth !== this.owner3D.getWidth() ||
            this._objectOldHeight !== this.owner3D.getHeight() ||
            this._objectOldDepth !== this.owner3D.getDepth()))
      ) {
        this._needToRecreateShape = false;
        this._recreateShape();
      }

      this.bodyUpdater.updateBodyFromObject();
    }

    hasCustomShapeDimension() {
      return (
        this.shapeDimensionA > 0 ||
        this.shapeDimensionB > 0 ||
        this.shapeDimensionC > 0
      );
    }

    _getPhysicsPosition(result: Jolt.RVec3): Jolt.RVec3 {
      result.Set(
        this.owner3D.getCenterXInScene() * this._sharedData.worldInvScale,
        this.owner3D.getCenterYInScene() * this._sharedData.worldInvScale,
        this.owner3D.getCenterZInScene() * this._sharedData.worldInvScale
      );
      return result;
    }

    _getPhysicsRotation(result: Jolt.Quat): Jolt.Quat {
      const threeObject = this.owner3D.get3DRendererObject();
      result.Set(
        threeObject.quaternion.x,
        threeObject.quaternion.y,
        threeObject.quaternion.z,
        threeObject.quaternion.w
      );
      return result;
    }

    _moveObjectToPhysicsPosition(physicsPosition: Jolt.RVec3): void {
      this.owner3D.setCenterXInScene(
        physicsPosition.GetX() * this._sharedData.worldScale
      );
      this.owner3D.setCenterYInScene(
        physicsPosition.GetY() * this._sharedData.worldScale
      );
      this.owner3D.setCenterZInScene(
        physicsPosition.GetZ() * this._sharedData.worldScale
      );
    }

    _moveObjectToPhysicsRotation(physicsRotation: Jolt.Quat): void {
      const threeObject = this.owner3D.get3DRendererObject();
      threeObject.quaternion.x = physicsRotation.GetX();
      threeObject.quaternion.y = physicsRotation.GetY();
      threeObject.quaternion.z = physicsRotation.GetZ();
      threeObject.quaternion.w = physicsRotation.GetW();
      // TODO Avoid this instantiation
      const euler = new THREE.Euler(0, 0, 0, 'ZYX');
      euler.setFromQuaternion(threeObject.quaternion);
      this.owner3D.setRotationX(gdjs.toDegrees(euler.x));
      this.owner3D.setRotationY(gdjs.toDegrees(euler.y));
      this.owner3D.setAngle(gdjs.toDegrees(euler.z));
    }

    getWorldScale(): float {
      return this._sharedData.worldScale;
    }

    getGravityX(): float {
      return this._sharedData.gravityX;
    }

    getGravityY(): float {
      return this._sharedData.gravityY;
    }

    getGravityZ(): float {
      return this._sharedData.gravityZ;
    }

    setGravityX(gravityX: float): void {
      if (this._sharedData.gravityX === gravityX) {
        return;
      }

      this._sharedData.gravityX = gravityX;
      this._sharedData.physicsSystem.SetGravity(
        this.getVec3(
          this._sharedData.gravityX,
          this._sharedData.gravityY,
          this._sharedData.gravityZ
        )
      );
    }

    setGravityY(gravityY: float): void {
      if (this._sharedData.gravityY === gravityY) {
        return;
      }

      this._sharedData.gravityY = gravityY;
      this._sharedData.physicsSystem.SetGravity(
        this.getVec3(
          this._sharedData.gravityX,
          this._sharedData.gravityY,
          this._sharedData.gravityZ
        )
      );
    }

    setGravityZ(gravityZ: float): void {
      if (this._sharedData.gravityZ === gravityZ) {
        return;
      }

      this._sharedData.gravityZ = gravityZ;
      this._sharedData.physicsSystem.SetGravity(
        this.getVec3(
          this._sharedData.gravityX,
          this._sharedData.gravityY,
          this._sharedData.gravityZ
        )
      );
    }

    isDynamic(): boolean {
      return this.bodyType === 'Dynamic';
    }

    isStatic(): boolean {
      return this.bodyType === 'Static';
    }

    isKinematic(): boolean {
      return this.bodyType === 'Kinematic';
    }

    isBullet(): boolean {
      return this.bullet;
    }

    setBullet(enable: boolean): void {
      if (this.bullet === enable) {
        return;
      }
      this.bullet = enable;

      if (this._body === null) {
        if (!this._createBody()) return;
      }
      const body = this._body!;

      this._sharedData.bodyInterface.SetMotionQuality(
        body.GetID(),
        this.bullet
          ? Jolt.EMotionQuality_LinearCast
          : Jolt.EMotionQuality_Discrete
      );
    }

    hasFixedRotation(): boolean {
      return this.fixedRotation;
    }

    setFixedRotation(enable: boolean): void {
      if (this.fixedRotation === enable) {
        return;
      }
      this.fixedRotation = enable;
      this._needToRecreateBody = true;
    }

    getDensity() {
      return this.density;
    }

    setDensity(density: float): void {
      // Jolt requires a positive density to compute valid mass properties.
      if (density < 0.0001) {
        density = 0.0001;
      }
      if (this.density === density) {
        return;
      }
      this.density = density;
      this._needToRecreateShape = true;
    }

    getMassOverride(): float {
      return this.massOverride;
    }

    setMassOverride(mass: float): void {
      if (this.massOverride === mass) {
        return;
      }
      this.massOverride = mass;
      this._needToRecreateBody = true;
    }

    getShapeOffsetX(): float {
      return this.shapeOffsetX;
    }

    setShapeOffsetX(shapeOffsetX: float): void {
      this.shapeOffsetX = shapeOffsetX;
      this._needToRecreateShape = true;
    }

    getShapeOffsetY(): float {
      return this.shapeOffsetY;
    }

    setShapeOffsetY(shapeOffsetY: float): void {
      this.shapeOffsetY = shapeOffsetY;
      this._needToRecreateShape = true;
    }

    getShapeOffsetZ(): float {
      return this.shapeOffsetZ;
    }

    setShapeOffsetZ(shapeOffsetZ: float): void {
      this.shapeOffsetZ = shapeOffsetZ;
      this._needToRecreateShape = true;
    }

    getFriction(): float {
      return this.friction;
    }

    setFriction(friction: float): void {
      // Non-negative values only
      if (friction < 0) {
        friction = 0;
      }
      if (this.friction === friction) {
        return;
      }
      this.friction = friction;

      if (this._body === null) {
        if (!this._createBody()) return;
      }
      const body = this._body!;

      this._sharedData.bodyInterface.SetFriction(body.GetID(), friction);
    }

    getRestitution(): float {
      return this.restitution;
    }

    setRestitution(restitution: float): void {
      // Non-negative values only
      if (restitution < 0) {
        restitution = 0;
      }
      if (this.restitution === restitution) {
        return;
      }
      this.restitution = restitution;

      if (this._body === null) {
        if (!this._createBody()) return;
      }
      const body = this._body!;

      this._sharedData.bodyInterface.SetRestitution(body.GetID(), restitution);
    }

    getLinearDamping(): float {
      return this.linearDamping;
    }

    setLinearDamping(linearDamping: float): void {
      // Non-negative values only
      if (linearDamping < 0) {
        linearDamping = 0;
      }
      if (this.linearDamping === linearDamping) {
        return;
      }
      this.linearDamping = linearDamping;

      if (this._body === null) {
        if (!this._createBody()) return;
      }
      const body = this._body!;

      body.GetMotionProperties().SetLinearDamping(linearDamping);
    }

    getAngularDamping(): float {
      return this.angularDamping;
    }

    setAngularDamping(angularDamping: float): void {
      // Non-negative values only
      if (angularDamping < 0) {
        angularDamping = 0;
      }
      if (this.angularDamping === angularDamping) {
        return;
      }
      this.angularDamping = angularDamping;

      if (this._body === null) {
        if (!this._createBody()) return;
      }
      const body = this._body!;

      body.GetMotionProperties().SetAngularDamping(angularDamping);
    }

    getGravityScale(): float {
      return this.gravityScale;
    }

    setGravityScale(gravityScale: float): void {
      if (this.gravityScale === gravityScale) {
        return;
      }
      this.gravityScale = gravityScale;

      if (this._body === null) {
        if (!this._createBody()) return;
      }
      const body = this._body!;

      body.GetMotionProperties().SetGravityFactor(gravityScale);
    }

    layerEnabled(layer: integer): boolean {
      // Layer must be an integer
      layer = Math.floor(layer);
      if (layer < 1 || layer > 8) {
        return false;
      }
      return !!(this.layers & (1 << (layer - 1)));
    }

    enableLayer(layer: integer, enable: boolean): void {
      // Layer must be an integer
      layer = Math.floor(layer);
      if (layer < 1 || layer > 8) {
        return;
      }

      if (enable) {
        this.layers |= 1 << (layer - 1);
      } else {
        this.layers &= ~(1 << (layer - 1));
      }

      this._needToRecreateBody = true;
    }

    maskEnabled(mask: integer): boolean {
      // Mask must be an integer
      mask = Math.floor(mask);
      if (mask < 1 || mask > 16) {
        return false;
      }
      return !!(this.masks & (1 << (mask - 1)));
    }

    enableMask(mask: integer, enable: boolean): void {
      // Mask must be an integer
      mask = Math.floor(mask);
      if (mask < 1 || mask > 16) {
        return;
      }

      if (enable) {
        this.masks |= 1 << (mask - 1);
      } else {
        this.masks &= ~(1 << (mask - 1));
      }

      this._needToRecreateBody = true;
    }

    getLinearVelocityX(): float {
      if (this._body === null) {
        if (!this._createBody()) return 0;
      }
      const body = this._body!;

      return body.GetLinearVelocity().GetX() * this._sharedData.worldScale;
    }

    setLinearVelocityX(linearVelocityX: float): void {
      if (this._body === null) {
        if (!this._createBody()) return;
      }
      const body = this._body!;

      this._sharedData.bodyInterface.SetLinearVelocity(
        body.GetID(),
        this.getVec3(
          linearVelocityX * this._sharedData.worldInvScale,
          body.GetLinearVelocity().GetY(),
          body.GetLinearVelocity().GetZ()
        )
      );
    }

    getLinearVelocityY(): float {
      if (this._body === null) {
        if (!this._createBody()) return 0;
      }
      const body = this._body!;

      return body.GetLinearVelocity().GetY() * this._sharedData.worldScale;
    }

    setLinearVelocityY(linearVelocityY: float): void {
      if (this._body === null) {
        if (!this._createBody()) return;
      }
      const body = this._body!;

      this._sharedData.bodyInterface.SetLinearVelocity(
        body.GetID(),
        this.getVec3(
          body.GetLinearVelocity().GetX(),
          linearVelocityY * this._sharedData.worldInvScale,
          body.GetLinearVelocity().GetZ()
        )
      );
    }

    getLinearVelocityZ(): float {
      if (this._body === null) {
        if (!this._createBody()) return 0;
      }
      const body = this._body!;

      return body.GetLinearVelocity().GetZ() * this._sharedData.worldScale;
    }

    setLinearVelocityZ(linearVelocityZ: float): void {
      if (this._body === null) {
        if (!this._createBody()) return;
      }
      const body = this._body!;

      this._sharedData.bodyInterface.SetLinearVelocity(
        body.GetID(),
        this.getVec3(
          body.GetLinearVelocity().GetX(),
          body.GetLinearVelocity().GetY(),
          linearVelocityZ * this._sharedData.worldInvScale
        )
      );
    }

    getLinearVelocityLength(): float {
      if (this._body === null) {
        if (!this._createBody()) return 0;
      }
      const body = this._body!;

      return body.GetLinearVelocity().Length() * this._sharedData.worldScale;
    }

    getAngularVelocityX(): float {
      if (this._body === null) {
        if (!this._createBody()) return 0;
      }
      const body = this._body!;

      return gdjs.toDegrees(body.GetAngularVelocity().GetX());
    }

    setAngularVelocityX(angularVelocityX: float): void {
      if (this._body === null) {
        if (!this._createBody()) return;
      }
      const body = this._body!;

      this._sharedData.bodyInterface.SetAngularVelocity(
        body.GetID(),
        this.getVec3(
          gdjs.toRad(angularVelocityX),
          body.GetAngularVelocity().GetY(),
          body.GetAngularVelocity().GetZ()
        )
      );
    }

    getAngularVelocityY(): float {
      if (this._body === null) {
        if (!this._createBody()) return 0;
      }
      const body = this._body!;

      return gdjs.toDegrees(body.GetAngularVelocity().GetY());
    }

    setAngularVelocityY(angularVelocityY: float): void {
      if (this._body === null) {
        if (!this._createBody()) return;
      }
      const body = this._body!;

      this._sharedData.bodyInterface.SetAngularVelocity(
        body.GetID(),
        this.getVec3(
          body.GetAngularVelocity().GetX(),
          gdjs.toRad(angularVelocityY),
          body.GetAngularVelocity().GetZ()
        )
      );
    }

    getAngularVelocityZ(): float {
      if (this._body === null) {
        if (!this._createBody()) return 0;
      }
      const body = this._body!;

      return gdjs.toDegrees(body.GetAngularVelocity().GetZ());
    }

    setAngularVelocityZ(angularVelocityZ: float): void {
      if (this._body === null) {
        if (!this._createBody()) return;
      }
      const body = this._body!;

      this._sharedData.bodyInterface.SetAngularVelocity(
        body.GetID(),
        this.getVec3(
          body.GetAngularVelocity().GetX(),
          body.GetAngularVelocity().GetY(),
          gdjs.toRad(angularVelocityZ)
        )
      );
    }

    applyForce(
      forceX: float,
      forceY: float,
      forceZ: float,
      positionX: float,
      positionY: float,
      positionZ: float
    ): void {
      if (this._body === null) {
        if (!this._createBody()) return;
      }
      const body = this._body!;

      this._sharedData.bodyInterface.AddForce(
        body.GetID(),
        this.getVec3(forceX, forceY, forceZ),
        this.getRVec3(
          positionX * this._sharedData.worldInvScale,
          positionY * this._sharedData.worldInvScale,
          positionZ * this._sharedData.worldInvScale
        ),
        Jolt.EActivation_Activate
      );
    }

    applyForceAtCenter(forceX: float, forceY: float, forceZ: float): void {
      if (this._body === null) {
        if (!this._createBody()) return;
      }
      const body = this._body!;

      this._sharedData.bodyInterface.AddForce(
        body.GetID(),
        this.getVec3(forceX, forceY, forceZ),
        Jolt.EActivation_Activate
      );
    }

    applyForceTowardPosition(
      length: float,
      towardX: float,
      towardY: float,
      towardZ: float
    ): void {
      if (this._body === null) {
        if (!this._createBody()) return;
      }
      const body = this._body!;

      const deltaX = towardX - this.owner3D.getX();
      const deltaY = towardY - this.owner3D.getY();
      const deltaZ = towardZ - this.owner3D.getZ();
      const distanceSq = deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ;
      if (distanceSq === 0) {
        return;
      }
      const ratio = length / Math.sqrt(distanceSq);

      this._sharedData.bodyInterface.AddForce(
        body.GetID(),
        this.getVec3(deltaX * ratio, deltaY * ratio, deltaZ * ratio),
        Jolt.EActivation_Activate
      );
    }

    applyImpulse(
      impulseX: float,
      impulseY: float,
      impulseZ: float,
      positionX: float,
      positionY: float,
      positionZ: float
    ): void {
      if (this._body === null) {
        if (!this._createBody()) return;
      }
      const body = this._body!;

      this._sharedData.bodyInterface.AddImpulse(
        body.GetID(),
        this.getVec3(impulseX, impulseY, impulseZ),
        this.getRVec3(
          positionX * this._sharedData.worldInvScale,
          positionY * this._sharedData.worldInvScale,
          positionZ * this._sharedData.worldInvScale
        )
      );
    }

    applyImpulseAtCenter(
      impulseX: float,
      impulseY: float,
      impulseZ: float
    ): void {
      if (this._body === null) {
        if (!this._createBody()) return;
      }
      const body = this._body!;

      this._sharedData.bodyInterface.AddImpulse(
        body.GetID(),
        this.getVec3(impulseX, impulseY, impulseZ)
      );
    }

    applyImpulseTowardPosition(
      length: float,
      towardX: float,
      towardY: float,
      towardZ: float
    ): void {
      if (this._body === null) {
        if (!this._createBody()) return;
      }
      const body = this._body!;

      const deltaX = towardX - this.owner3D.getX();
      const deltaY = towardY - this.owner3D.getY();
      const deltaZ = towardZ - this.owner3D.getZ();
      const distanceSq = deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ;
      if (distanceSq === 0) {
        return;
      }
      const ratio = length / Math.sqrt(distanceSq);

      this._sharedData.bodyInterface.AddImpulse(
        body.GetID(),
        this.getVec3(deltaX * ratio, deltaY * ratio, deltaZ * ratio)
      );
    }

    applyTorque(torqueX: float, torqueY: float, torqueZ: float): void {
      if (this._body === null) {
        if (!this._createBody()) return;
      }
      const body = this._body!;

      this._sharedData.bodyInterface.AddTorque(
        body.GetID(),
        this.getVec3(
          gdjs.toRad(torqueX),
          gdjs.toRad(torqueY),
          gdjs.toRad(torqueZ)
        ),
        Jolt.EActivation_Activate
      );
    }

    applyAngularImpulse(
      angularImpulseX: float,
      angularImpulseY: float,
      angularImpulseZ: float
    ): void {
      if (this._body === null) {
        if (!this._createBody()) return;
      }
      const body = this._body!;

      this._sharedData.bodyInterface.AddAngularImpulse(
        body.GetID(),
        this.getVec3(
          gdjs.toRad(angularImpulseX),
          gdjs.toRad(angularImpulseY),
          gdjs.toRad(angularImpulseZ)
        )
      );
    }

    getMass(): float {
      if (this._body === null) {
        if (!this._createBody()) return 0;
      }
      const body = this._body!;

      return 1 / body.GetMotionProperties().GetInverseMass();
    }

    /**
     * @returns The inertia for a rotation around X axis of the object at its
     * default rotation (0°; 0°; 0°).
     */
    getInertiaAroundX(): float {
      if (this._body === null) {
        if (!this._createBody()) return 0;
      }
      const body = this._body!;

      return 1 / body.GetMotionProperties().GetInverseInertiaDiagonal().GetX();
    }

    /**
     * @returns The inertia for a rotation around Y axis of the object at its
     * default rotation (0°; 0°; 0°).
     */
    getInertiaAroundY(): float {
      if (this._body === null) {
        if (!this._createBody()) return 0;
      }
      const body = this._body!;

      return 1 / body.GetMotionProperties().GetInverseInertiaDiagonal().GetY();
    }

    /**
     * @returns The inertia for a rotation around Z axis of the object at its
     * default rotation (0°; 0°; 0°).
     */
    getInertiaAroundZ(): float {
      if (this._body === null) {
        if (!this._createBody()) return 0;
      }
      const body = this._body!;

      return 1 / body.GetMotionProperties().GetInverseInertiaDiagonal().GetZ();
    }

    getMassCenterX(): float {
      if (this._body === null) {
        if (!this._createBody()) return 0;
      }
      const body = this._body!;

      return (
        body.GetCenterOfMassPosition().GetX() * this._sharedData.worldScale
      );
    }

    getMassCenterY(): float {
      if (this._body === null) {
        if (!this._createBody()) return 0;
      }
      const body = this._body!;

      return (
        body.GetCenterOfMassPosition().GetY() * this._sharedData.worldScale
      );
    }

    getMassCenterZ(): float {
      if (this._body === null) {
        if (!this._createBody()) return 0;
      }
      const body = this._body!;

      return (
        body.GetCenterOfMassPosition().GetZ() * this._sharedData.worldScale
      );
    }

    onContactBegin(otherBehavior: Physics3DRuntimeBehavior): void {
      this._currentContacts.push(otherBehavior);

      // There might be contacts that end during the frame and
      // start again right away. It is considered a glitch
      // and should not be detected.
      let i = this._contactsEndedThisFrame.indexOf(otherBehavior);
      if (i !== -1) {
        this._contactsEndedThisFrame.splice(i, 1);
      } else {
        this._contactsStartedThisFrame.push(otherBehavior);
      }
    }

    onContactEnd(otherBehavior: Physics3DRuntimeBehavior): void {
      this._contactsEndedThisFrame.push(otherBehavior);

      const index = this._currentContacts.indexOf(otherBehavior);
      if (index !== -1) {
        this._currentContacts.splice(index, 1);
      }
    }

    canCollideAgainst(otherBehavior: gdjs.Physics3DRuntimeBehavior): boolean {
      return (
        (this.getMasksAccordingToBodyType() &
          otherBehavior.getLayersAccordingToBodyType()) !==
        0
      );
    }

    static areObjectsColliding(
      object1: gdjs.RuntimeObject,
      object2: gdjs.RuntimeObject,
      behaviorName: string
    ): boolean {
      const behavior1 = object1.getBehavior(
        behaviorName
      ) as Physics3DRuntimeBehavior | null;
      if (!behavior1) return false;
      return behavior1.collisionChecker.isColliding(object2);
    }

    static hasCollisionStartedBetween(
      object1: gdjs.RuntimeObject,
      object2: gdjs.RuntimeObject,
      behaviorName: string
    ): boolean {
      const behavior1 = object1.getBehavior(
        behaviorName
      ) as Physics3DRuntimeBehavior | null;
      if (!behavior1) return false;
      return behavior1.collisionChecker.hasCollisionStartedWith(object2);
    }

    static hasCollisionStoppedBetween(
      object1: gdjs.RuntimeObject,
      object2: gdjs.RuntimeObject,
      behaviorName: string
    ): boolean {
      const behavior1 = object1.getBehavior(
        behaviorName
      ) as Physics3DRuntimeBehavior | null;
      if (!behavior1) return false;
      return behavior1.collisionChecker.hasCollisionStoppedWith(object2);
    }

    static raycastClosestInScene(
      runtimeScene: gdjs.RuntimeScene,
      startX: float,
      startY: float,
      startZ: float,
      endX: float,
      endY: float,
      endZ: float,
      ignoreBehavior: gdjs.Physics3DRuntimeBehavior | null = null,
      outResult: Physics3DRaycastResult = makeNewPhysics3DRaycastResult()
    ): Physics3DRaycastResult {
      outResult.hasHit = false;
      outResult.hitX = 0;
      outResult.hitY = 0;
      outResult.hitZ = 0;
      outResult.normalX = 0;
      outResult.normalY = 0;
      outResult.normalZ = 0;
      outResult.reflectionDirectionX = 0;
      outResult.reflectionDirectionY = 0;
      outResult.reflectionDirectionZ = 0;
      outResult.distance = 0;
      outResult.fraction = 0;
      outResult.hitBehavior = null;

      const physics3DSharedData = runtimeScene.physics3DSharedData;
      if (!physics3DSharedData) {
        return outResult;
      }

      const [
        incomingDirectionX,
        incomingDirectionY,
        incomingDirectionZ,
        rayLength,
      ] = normalize3(endX - startX, endY - startY, endZ - startZ);
      if (rayLength <= epsilon) {
        return outResult;
      }

      const worldInvScale = physics3DSharedData.worldInvScale;
      const worldScale = physics3DSharedData.worldScale;

      let rayCast: Jolt.RRayCast | null = null;
      let rayCastSettings: Jolt.RayCastSettings | null = null;
      let collector: Jolt.CastRayClosestHitCollisionCollector | null = null;
      let broadPhaseLayerFilter: Jolt.DefaultBroadPhaseLayerFilter | null =
        null;
      let objectLayerFilter: Jolt.DefaultObjectLayerFilter | null = null;
      let bodyFilter: Jolt.BodyFilterJS | Jolt.IgnoreSingleBodyFilter | null =
        null;
      let shapeFilter: Jolt.ShapeFilterJS2 | null = null;

      try {
        rayCast = new Jolt.RRayCast(
          physics3DSharedData.getRVec3(
            startX * worldInvScale,
            startY * worldInvScale,
            startZ * worldInvScale
          ),
          physics3DSharedData.getVec3(
            (endX - startX) * worldInvScale,
            (endY - startY) * worldInvScale,
            (endZ - startZ) * worldInvScale
          )
        );

        rayCastSettings = new Jolt.RayCastSettings();
        collector = new Jolt.CastRayClosestHitCollisionCollector();
        broadPhaseLayerFilter = new Jolt.DefaultBroadPhaseLayerFilter(
          physics3DSharedData.jolt.GetObjectVsBroadPhaseLayerFilter(),
          gdjs.Physics3DSharedData.allLayersMask
        );
        objectLayerFilter = new Jolt.DefaultObjectLayerFilter(
          physics3DSharedData.jolt.GetObjectLayerPairFilter(),
          gdjs.Physics3DSharedData.allLayersMask
        );
        if (ignoreBehavior && ignoreBehavior.getBody()) {
          bodyFilter = new Jolt.IgnoreSingleBodyFilter(
            ignoreBehavior.getBody()!.GetID()
          );
        } else {
          const defaultBodyFilter = new Jolt.BodyFilterJS();
          defaultBodyFilter.ShouldCollide = (_inBodyID: number) => true;
          defaultBodyFilter.ShouldCollideLocked = (_inBody: number) => true;
          bodyFilter = defaultBodyFilter;
        }
        shapeFilter = new Jolt.ShapeFilterJS2();
        shapeFilter.ShouldCollide = (
          _inShape1: number,
          _inSubShapeIDOfShape1: number,
          _inShape2: number,
          _inSubShapeIDOfShape2: number
        ) => true;

        const narrowPhaseQuery =
          physics3DSharedData.physicsSystem.GetNarrowPhaseQueryNoLock();
        narrowPhaseQuery.CastRay(
          rayCast,
          rayCastSettings,
          collector,
          broadPhaseLayerFilter,
          objectLayerFilter,
          bodyFilter,
          shapeFilter
        );

        if (!collector.HadHit()) {
          return outResult;
        }

        const hit = collector.mHit;
        const hitPoint = rayCast.GetPointOnRay(hit.mFraction);
        outResult.hasHit = true;
        outResult.fraction = hit.mFraction;
        outResult.distance = rayLength * hit.mFraction;
        outResult.hitX = hitPoint.GetX() * worldScale;
        outResult.hitY = hitPoint.GetY() * worldScale;
        outResult.hitZ = hitPoint.GetZ() * worldScale;

        let normalX = -incomingDirectionX;
        let normalY = -incomingDirectionY;
        let normalZ = -incomingDirectionZ;

        const bodyLockInterface =
          physics3DSharedData.physicsSystem.GetBodyLockInterfaceNoLock();
        const body = bodyLockInterface.TryGetBody(hit.mBodyID);
        if (body) {
          outResult.hitBehavior = body.gdjsAssociatedBehavior || null;
          const normal = body.GetWorldSpaceSurfaceNormal(
            hit.mSubShapeID2,
            hitPoint
          );
          const [normalizedX, normalizedY, normalizedZ, normalLength] =
            normalize3(normal.GetX(), normal.GetY(), normal.GetZ());
          if (normalLength > epsilon) {
            normalX = normalizedX;
            normalY = normalizedY;
            normalZ = normalizedZ;
          }
        }

        outResult.normalX = normalX;
        outResult.normalY = normalY;
        outResult.normalZ = normalZ;

        const dot =
          incomingDirectionX * normalX +
          incomingDirectionY * normalY +
          incomingDirectionZ * normalZ;
        const reflectedDirectionX = incomingDirectionX - 2 * dot * normalX;
        const reflectedDirectionY = incomingDirectionY - 2 * dot * normalY;
        const reflectedDirectionZ = incomingDirectionZ - 2 * dot * normalZ;
        const [
          normalizedReflectionDirectionX,
          normalizedReflectionDirectionY,
          normalizedReflectionDirectionZ,
        ] = normalize3(
          reflectedDirectionX,
          reflectedDirectionY,
          reflectedDirectionZ
        );
        outResult.reflectionDirectionX = normalizedReflectionDirectionX;
        outResult.reflectionDirectionY = normalizedReflectionDirectionY;
        outResult.reflectionDirectionZ = normalizedReflectionDirectionZ;
      } catch {
        // Ignore errors and keep a "no hit" result.
      } finally {
        if (shapeFilter) Jolt.destroy(shapeFilter);
        if (bodyFilter) Jolt.destroy(bodyFilter);
        if (objectLayerFilter) Jolt.destroy(objectLayerFilter);
        if (broadPhaseLayerFilter) Jolt.destroy(broadPhaseLayerFilter);
        if (collector) Jolt.destroy(collector);
        if (rayCastSettings) Jolt.destroy(rayCastSettings);
        if (rayCast) Jolt.destroy(rayCast);
      }

      return outResult;
    }

    raycastClosest(
      startX: float,
      startY: float,
      startZ: float,
      endX: float,
      endY: float,
      endZ: float,
      ignoreSelf: boolean
    ): void {
      gdjs.Physics3DRuntimeBehavior.raycastClosestInScene(
        this.owner.getRuntimeScene(),
        startX,
        startY,
        startZ,
        endX,
        endY,
        endZ,
        ignoreSelf ? this : null,
        this._lastRaycastResult
      );
    }

    didLastRaycastHit(): boolean {
      return this._lastRaycastResult.hasHit;
    }

    didLastRaycastHitObject(object: gdjs.RuntimeObject): boolean {
      if (!this._lastRaycastResult.hasHit) {
        return false;
      }
      return this._lastRaycastResult.hitBehavior?.owner === object;
    }

    getLastRaycastHitX(): float {
      return this._lastRaycastResult.hitX;
    }

    getLastRaycastHitY(): float {
      return this._lastRaycastResult.hitY;
    }

    getLastRaycastHitZ(): float {
      return this._lastRaycastResult.hitZ;
    }

    getLastRaycastNormalX(): float {
      return this._lastRaycastResult.normalX;
    }

    getLastRaycastNormalY(): float {
      return this._lastRaycastResult.normalY;
    }

    getLastRaycastNormalZ(): float {
      return this._lastRaycastResult.normalZ;
    }

    getLastRaycastReflectionDirectionX(): float {
      return this._lastRaycastResult.reflectionDirectionX;
    }

    getLastRaycastReflectionDirectionY(): float {
      return this._lastRaycastResult.reflectionDirectionY;
    }

    getLastRaycastReflectionDirectionZ(): float {
      return this._lastRaycastResult.reflectionDirectionZ;
    }

    getLastRaycastDistance(): float {
      return this._lastRaycastResult.distance;
    }

    getLastRaycastFraction(): float {
      return this._lastRaycastResult.fraction;
    }

    // ==================== Joint Methods ====================

    /**
     * Get the other object's physics body, creating it if needed.
     * @returns The Jolt.Body of the other object, or null if unavailable.
     */
    private _findPhysics3DBehaviorOnObject(
      otherObject: gdjs.RuntimeObject
    ): Physics3DRuntimeBehavior | null {
      const sameNameBehavior = otherObject.getBehavior(
        this.name
      ) as Physics3DRuntimeBehavior | null;
      if (sameNameBehavior) {
        return sameNameBehavior;
      }

      // Fallback: support joints between objects where Physics3D behavior names differ.
      const rawBehaviors = (otherObject as any)._behaviors as
        | gdjs.RuntimeBehavior[]
        | undefined;
      if (rawBehaviors) {
        let firstPhysicsBehavior: Physics3DRuntimeBehavior | null = null;
        for (const behavior of rawBehaviors) {
          if (behavior instanceof Physics3DRuntimeBehavior) {
            if (behavior.activated()) {
              return behavior;
            }
            if (!firstPhysicsBehavior) {
              firstPhysicsBehavior = behavior;
            }
          }
        }
        return firstPhysicsBehavior;
      }
      return null;
    }

    private _resolveMotorState(motorState: string): number {
      const normalized = (motorState || '').toLowerCase();
      if (normalized === 'velocity') {
        return Jolt.EMotorState_Velocity;
      }
      if (normalized === 'position') {
        return Jolt.EMotorState_Position;
      }
      return Jolt.EMotorState_Off;
    }

    private _isJointSupportedRuntimeObject(
      object: gdjs.RuntimeObject | null
    ): boolean {
      if (!object) {
        return false;
      }
      const objectType =
        typeof (object as any).getType === 'function'
          ? (object as any).getType()
          : object.type;
      return (
        objectType === 'Scene3D::Model3DObject' ||
        objectType === 'Scene3D::Cube3DObject'
      );
    }

    private _normalizeJointEditorType(jointType: string): string {
      const normalized = (jointType || '').trim().toLowerCase();
      if (normalized === 'fixed') {
        return 'Fixed';
      }
      if (normalized === 'point') {
        return 'Point';
      }
      if (normalized === 'hinge') {
        return 'Hinge';
      }
      if (normalized === 'slider') {
        return 'Slider';
      }
      if (normalized === 'distance') {
        return 'Distance';
      }
      if (normalized === 'cone') {
        return 'Cone';
      }
      if (
        normalized === 'swingtwist' ||
        normalized === 'swing_twist' ||
        normalized === 'swing twist'
      ) {
        return 'SwingTwist';
      }
      return 'None';
    }

    private _getConstraintSubTypeForJointEditorType(jointType: string): number {
      if (jointType === 'Fixed') {
        return Jolt.EConstraintSubType_Fixed;
      }
      if (jointType === 'Point') {
        return Jolt.EConstraintSubType_Point;
      }
      if (jointType === 'Hinge') {
        return Jolt.EConstraintSubType_Hinge;
      }
      if (jointType === 'Slider') {
        return Jolt.EConstraintSubType_Slider;
      }
      if (jointType === 'Distance') {
        return Jolt.EConstraintSubType_Distance;
      }
      if (jointType === 'Cone') {
        return Jolt.EConstraintSubType_Cone;
      }
      if (jointType === 'SwingTwist') {
        return Jolt.EConstraintSubType_SwingTwist;
      }
      return 0;
    }

    private _activateBody(body: Jolt.Body | null): void {
      if (!body || !this.jointAutoWakeBodies) {
        return;
      }
      this._sharedData.bodyInterface.ActivateBody(body.GetID());
    }

    private _activateBodiesForConstraint(
      constraint: Jolt.Constraint | null
    ): void {
      if (!constraint || !this.jointAutoWakeBodies) {
        return;
      }
      const twoBodyConstraint = Jolt.castObject(
        constraint,
        Jolt.TwoBodyConstraint
      );
      this._activateBody(twoBodyConstraint.GetBody1());
      this._activateBody(twoBodyConstraint.GetBody2());
    }

    private _activateBodiesForJoint(jointId: integer | string): void {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) {
        return;
      }
      this._activateBodiesForConstraint(constraint);
    }

    private _applyAutomaticJointTuning(
      jointId: integer | string,
      fallbackPreset: string = 'Stable'
    ): void {
      const numericJointId =
        typeof jointId === 'string' ? parseInt(jointId, 10) : jointId;
      if (numericJointId <= 0) {
        return;
      }
      const constraint = this._sharedData.getJoint(numericJointId);
      if (!constraint) {
        return;
      }

      const preferredPreset = (
        this.jointAutoStabilityPreset ||
        fallbackPreset ||
        'Balanced'
      ).trim();
      this.setJointStabilityPreset(numericJointId, preferredPreset);

      if (this.jointAutoBreakForce > 0 || this.jointAutoBreakTorque > 0) {
        this._sharedData.setJointBreakThresholds(
          numericJointId,
          this.jointAutoBreakForce,
          this.jointAutoBreakTorque
        );
      } else {
        this._sharedData.clearJointBreakThresholds(numericJointId);
      }

      this._activateBodiesForConstraint(constraint);
    }

    private _getBodyCenterInPixels(body: Jolt.Body): [float, float, float] {
      const center = body.GetCenterOfMassPosition();
      const worldScale = this._sharedData.worldScale;
      return [
        center.GetX() * worldScale,
        center.GetY() * worldScale,
        center.GetZ() * worldScale,
      ];
    }

    private _applyJointEditorLocalOffset(
      behavior: Physics3DRuntimeBehavior,
      centerX: float,
      centerY: float,
      centerZ: float,
      offsetX: float,
      offsetY: float,
      offsetZ: float
    ): [float, float, float] {
      const object3D = behavior.owner3D.get3DRendererObject();
      if (!object3D) {
        return [centerX + offsetX, centerY + offsetY, centerZ + offsetZ];
      }

      const worldQuaternion = new THREE.Quaternion();
      object3D.getWorldQuaternion(worldQuaternion);
      const offset = new THREE.Vector3(
        offsetX,
        offsetY,
        offsetZ
      ).applyQuaternion(worldQuaternion);
      return [centerX + offset.x, centerY + offset.y, centerZ + offset.z];
    }

    private _computeJointEditorAnchorAndAxis(
      targetBehavior: Physics3DRuntimeBehavior
    ): {
      sourceX: float;
      sourceY: float;
      sourceZ: float;
      targetX: float;
      targetY: float;
      targetZ: float;
      anchorX: float;
      anchorY: float;
      anchorZ: float;
      axisX: float;
      axisY: float;
      axisZ: float;
      distancePx: float;
    } {
      const sourceBody = this._body!;
      const targetBody = targetBehavior._body!;

      const [sourceCenterX, sourceCenterY, sourceCenterZ] =
        this._getBodyCenterInPixels(sourceBody);
      const [targetCenterX, targetCenterY, targetCenterZ] =
        this._getBodyCenterInPixels(targetBody);

      const [sourceX, sourceY, sourceZ] = this._applyJointEditorLocalOffset(
        this,
        sourceCenterX,
        sourceCenterY,
        sourceCenterZ,
        this.jointEditorAnchorOffsetX,
        this.jointEditorAnchorOffsetY,
        this.jointEditorAnchorOffsetZ
      );
      const [targetX, targetY, targetZ] = this._applyJointEditorLocalOffset(
        targetBehavior,
        targetCenterX,
        targetCenterY,
        targetCenterZ,
        this.jointEditorTargetAnchorOffsetX,
        this.jointEditorTargetAnchorOffsetY,
        this.jointEditorTargetAnchorOffsetZ
      );

      const anchorX = (sourceX + targetX) * 0.5;
      const anchorY = (sourceY + targetY) * 0.5;
      const anchorZ = (sourceZ + targetZ) * 0.5;

      const [autoAxisX, autoAxisY, autoAxisZ, autoAxisLength] = normalize3(
        targetX - sourceX,
        targetY - sourceY,
        targetZ - sourceZ
      );
      let axisX = autoAxisX;
      let axisY = autoAxisY;
      let axisZ = autoAxisZ;
      if (this.jointEditorUseCustomAxis) {
        const [customAxisX, customAxisY, customAxisZ, customAxisLength] =
          normalize3(
            this.jointEditorAxisX,
            this.jointEditorAxisY,
            this.jointEditorAxisZ
          );
        if (customAxisLength > epsilon) {
          axisX = customAxisX;
          axisY = customAxisY;
          axisZ = customAxisZ;
        }
      } else if (autoAxisLength <= epsilon) {
        [axisX, axisY, axisZ] = this._computeLimbAxis(
          sourceBody,
          targetBody,
          1,
          0,
          0
        );
      }

      const dx = targetX - sourceX;
      const dy = targetY - sourceY;
      const dz = targetZ - sourceZ;
      const distancePx = Math.sqrt(dx * dx + dy * dy + dz * dz);

      return {
        sourceX,
        sourceY,
        sourceZ,
        targetX,
        targetY,
        targetZ,
        anchorX,
        anchorY,
        anchorZ,
        axisX,
        axisY,
        axisZ,
        distancePx,
      };
    }

    private _ensureJointEditorPreview(scene: THREE.Scene): void {
      if (this._jointEditorPreviewGroup) {
        if (this._jointEditorPreviewGroup.parent !== scene) {
          this._jointEditorPreviewGroup.parent?.remove(
            this._jointEditorPreviewGroup
          );
          scene.add(this._jointEditorPreviewGroup);
        }
        return;
      }

      const group = new THREE.Group();
      group.name = 'Physics3DJointEditorPreview';

      const linkGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(),
        new THREE.Vector3(),
      ]);
      const axisGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(),
        new THREE.Vector3(),
      ]);
      const pointGeometry = new THREE.SphereGeometry(1, 12, 12);

      const linkMaterial = new THREE.LineBasicMaterial({
        color: 0x3aa6ff,
        transparent: true,
        opacity: 0.8,
        depthTest: false,
      });
      const axisMaterial = new THREE.LineBasicMaterial({
        color: 0xffa93a,
        transparent: true,
        opacity: 0.9,
        depthTest: false,
      });
      const sourceMaterial = new THREE.MeshBasicMaterial({
        color: 0x2ecc71,
        transparent: true,
        opacity: 0.9,
        depthTest: false,
      });
      const targetMaterial = new THREE.MeshBasicMaterial({
        color: 0xe74c3c,
        transparent: true,
        opacity: 0.9,
        depthTest: false,
      });
      const anchorMaterial = new THREE.MeshBasicMaterial({
        color: 0xf1c40f,
        transparent: true,
        opacity: 0.95,
        depthTest: false,
      });

      const linkLine = new THREE.Line(linkGeometry, linkMaterial);
      const axisLine = new THREE.Line(axisGeometry, axisMaterial);
      const sourceMesh = new THREE.Mesh(pointGeometry, sourceMaterial);
      const targetMesh = new THREE.Mesh(pointGeometry.clone(), targetMaterial);
      const anchorMesh = new THREE.Mesh(pointGeometry.clone(), anchorMaterial);
      linkLine.renderOrder = 10000;
      axisLine.renderOrder = 10001;
      sourceMesh.renderOrder = 10002;
      targetMesh.renderOrder = 10002;
      anchorMesh.renderOrder = 10003;

      group.add(linkLine);
      group.add(axisLine);
      group.add(sourceMesh);
      group.add(targetMesh);
      group.add(anchorMesh);
      scene.add(group);

      this._jointEditorPreviewGroup = group;
      this._jointEditorPreviewLinkLine = linkLine;
      this._jointEditorPreviewAxisLine = axisLine;
      this._jointEditorPreviewSourceMesh = sourceMesh;
      this._jointEditorPreviewTargetMesh = targetMesh;
      this._jointEditorPreviewAnchorMesh = anchorMesh;
    }

    private _disposeJointEditorPreview(): void {
      const group = this._jointEditorPreviewGroup;
      if (!group) {
        return;
      }
      group.parent?.remove(group);
      group.traverse((object3D) => {
        const anyObject = object3D as any;
        if (
          anyObject.geometry &&
          typeof anyObject.geometry.dispose === 'function'
        ) {
          anyObject.geometry.dispose();
        }
        if (anyObject.material) {
          if (Array.isArray(anyObject.material)) {
            for (const material of anyObject.material) {
              if (material && typeof material.dispose === 'function') {
                material.dispose();
              }
            }
          } else if (typeof anyObject.material.dispose === 'function') {
            anyObject.material.dispose();
          }
        }
      });
      this._jointEditorPreviewGroup = null;
      this._jointEditorPreviewLinkLine = null;
      this._jointEditorPreviewAxisLine = null;
      this._jointEditorPreviewAnchorMesh = null;
      this._jointEditorPreviewSourceMesh = null;
      this._jointEditorPreviewTargetMesh = null;
    }

    private _updateJointEditorPreview(
      targetBehavior: Physics3DRuntimeBehavior | null
    ): void {
      if (
        !this.jointEditorEnabled ||
        !this.jointEditorPreviewEnabled ||
        !this._isJointSupportedRuntimeObject(this.owner)
      ) {
        this._disposeJointEditorPreview();
        return;
      }

      const runtimeScene = this.owner.getRuntimeScene();
      const layer = runtimeScene.getLayer(this.owner.getLayer());
      const scene = layer.get3DRendererObject() as THREE.Scene | null;
      if (!scene) {
        this._disposeJointEditorPreview();
        return;
      }

      this._ensureJointEditorPreview(scene);
      const group = this._jointEditorPreviewGroup;
      if (
        !group ||
        !targetBehavior ||
        !this._body ||
        !targetBehavior._body ||
        !this._isJointSupportedRuntimeObject(targetBehavior.owner)
      ) {
        if (group) {
          group.visible = false;
        }
        return;
      }

      const previewData = this._computeJointEditorAnchorAndAxis(targetBehavior);
      const previewSize = Math.max(1, this.jointEditorPreviewSize);
      const axisLength = Math.max(20, previewSize * 3);
      const pointScale = previewSize * 0.6;

      const source = new THREE.Vector3(
        previewData.sourceX,
        previewData.sourceY,
        previewData.sourceZ
      );
      const target = new THREE.Vector3(
        previewData.targetX,
        previewData.targetY,
        previewData.targetZ
      );
      const anchor = new THREE.Vector3(
        previewData.anchorX,
        previewData.anchorY,
        previewData.anchorZ
      );
      const axisEnd = new THREE.Vector3(
        previewData.anchorX + previewData.axisX * axisLength,
        previewData.anchorY + previewData.axisY * axisLength,
        previewData.anchorZ + previewData.axisZ * axisLength
      );

      if (this._jointEditorPreviewLinkLine) {
        const geometry = this._jointEditorPreviewLinkLine
          .geometry as THREE.BufferGeometry;
        geometry.setFromPoints([source, target]);
        geometry.computeBoundingSphere();
      }
      if (this._jointEditorPreviewAxisLine) {
        const geometry = this._jointEditorPreviewAxisLine
          .geometry as THREE.BufferGeometry;
        geometry.setFromPoints([anchor, axisEnd]);
        geometry.computeBoundingSphere();
      }
      if (this._jointEditorPreviewSourceMesh) {
        this._jointEditorPreviewSourceMesh.position.copy(source);
        this._jointEditorPreviewSourceMesh.scale.set(
          pointScale,
          pointScale,
          pointScale
        );
      }
      if (this._jointEditorPreviewTargetMesh) {
        this._jointEditorPreviewTargetMesh.position.copy(target);
        this._jointEditorPreviewTargetMesh.scale.set(
          pointScale,
          pointScale,
          pointScale
        );
      }
      if (this._jointEditorPreviewAnchorMesh) {
        const anchorScale = pointScale * 1.25;
        this._jointEditorPreviewAnchorMesh.position.copy(anchor);
        this._jointEditorPreviewAnchorMesh.scale.set(
          anchorScale,
          anchorScale,
          anchorScale
        );
      }

      group.visible = true;
    }

    private _clearJointEditorOwnedJoint(): void {
      if (this._jointEditorOwnsJoint && this._jointEditorOwnedJointId > 0) {
        this._sharedData.removeJoint(this._jointEditorOwnedJointId);
      }
      this._jointEditorOwnedJointId = 0;
      this._jointEditorOwnedTargetUniqueId = 0;
      this._jointEditorOwnsJoint = false;
    }

    private _createJointFromEditorType(
      targetBehavior: Physics3DRuntimeBehavior
    ): integer {
      const bodyA = this._body;
      const bodyB = targetBehavior._body;
      if (!bodyA || !bodyB) {
        return 0;
      }

      const previewData = this._computeJointEditorAnchorAndAxis(targetBehavior);
      const anchorX = previewData.anchorX;
      const anchorY = previewData.anchorY;
      const anchorZ = previewData.anchorZ;
      const axisX = previewData.axisX;
      const axisY = previewData.axisY;
      const axisZ = previewData.axisZ;
      const distancePx = previewData.distancePx;

      const hingeMinAngle = Math.min(
        this.jointEditorHingeMinAngle,
        this.jointEditorHingeMaxAngle
      );
      const hingeMaxAngle = Math.max(
        this.jointEditorHingeMinAngle,
        this.jointEditorHingeMaxAngle
      );

      const variable = new gdjs.Variable();
      const normalizedType = this._normalizeJointEditorType(
        this.jointEditorType
      );
      if (normalizedType === 'Fixed') {
        this.addFixedJoint(targetBehavior.owner, variable);
      } else if (normalizedType === 'Point') {
        this.addPointJoint(
          targetBehavior.owner,
          anchorX,
          anchorY,
          anchorZ,
          variable
        );
      } else if (normalizedType === 'Hinge') {
        this.addHingeJoint(
          targetBehavior.owner,
          anchorX,
          anchorY,
          anchorZ,
          axisX,
          axisY,
          axisZ,
          variable
        );
      } else if (normalizedType === 'Slider') {
        this.addSliderJoint(
          targetBehavior.owner,
          axisX,
          axisY,
          axisZ,
          variable
        );
      } else if (normalizedType === 'Distance') {
        let minDistance = Math.max(0, this.jointEditorDistanceMin);
        let maxDistance = Math.max(0, this.jointEditorDistanceMax);
        if (minDistance <= epsilon && maxDistance <= epsilon) {
          minDistance = Math.max(0, distancePx * 0.9);
          maxDistance = Math.max(minDistance + 0.01, distancePx * 1.1);
        } else {
          const orderedMin = Math.max(0, Math.min(minDistance, maxDistance));
          const orderedMax = Math.max(
            orderedMin + 0.01,
            Math.max(minDistance, maxDistance)
          );
          minDistance = orderedMin;
          maxDistance = orderedMax;
        }
        this.addDistanceJoint(
          targetBehavior.owner,
          minDistance,
          maxDistance,
          2,
          0.35,
          variable
        );
      } else if (normalizedType === 'Cone') {
        const coneHalfAngle = Math.max(
          5,
          Math.min(
            170,
            Math.max(Math.abs(hingeMinAngle), Math.abs(hingeMaxAngle))
          )
        );
        this.addConeJoint(
          targetBehavior.owner,
          anchorX,
          anchorY,
          anchorZ,
          axisX,
          axisY,
          axisZ,
          coneHalfAngle,
          variable
        );
      } else if (normalizedType === 'SwingTwist') {
        this.addSwingTwistJoint(
          targetBehavior.owner,
          anchorX,
          anchorY,
          anchorZ,
          axisX,
          axisY,
          axisZ,
          50,
          40,
          hingeMinAngle,
          hingeMaxAngle,
          variable
        );
      } else {
        return 0;
      }

      const jointId = Math.round(variable.getAsNumber());
      if (jointId <= 0) {
        return 0;
      }

      if (normalizedType === 'Fixed') {
        this.setJointPriority(jointId, 150);
      } else if (normalizedType === 'Hinge') {
        this.setHingeJointLimits(jointId, hingeMinAngle, hingeMaxAngle);
        this.setHingeJointMaxFriction(jointId, 8);
      } else if (normalizedType === 'Slider') {
        const sliderRange = Math.max(
          10,
          this.jointEditorDistanceMax > epsilon
            ? this.jointEditorDistanceMax
            : distancePx * 0.5
        );
        this.setSliderJointLimits(jointId, -sliderRange, sliderRange);
        this.setSliderJointMaxFriction(jointId, 6);
      } else if (normalizedType === 'Distance') {
        this.setDistanceJointSpring(jointId, 2, 0.35);
      }

      this._applyAutomaticJointTuning(
        jointId,
        normalizedType === 'Fixed' ? 'UltraStable' : 'Stable'
      );
      return jointId;
    }

    private _syncJointEditorBinding(): void {
      if (
        !this.jointEditorEnabled ||
        !this.activated() ||
        this._destroyedDuringFrameLogic
      ) {
        this._updateJointEditorPreview(null);
        this._clearJointEditorOwnedJoint();
        return;
      }

      if (!this._isJointSupportedRuntimeObject(this.owner)) {
        this._updateJointEditorPreview(null);
        this._clearJointEditorOwnedJoint();
        if (!this._jointEditorLoggedUnsupportedType) {
          console.warn(
            `[Physics3D] Joint Editor supports only Scene3D::Model3DObject and Scene3D::Cube3DObject. Object "${this.owner.getName()}" is ignored.`
          );
          this._jointEditorLoggedUnsupportedType = true;
        }
        return;
      }
      this._jointEditorLoggedUnsupportedType = false;

      const targetObjectName = (this.jointEditorTargetObjectName || '').trim();
      const normalizedType = this._normalizeJointEditorType(
        this.jointEditorType
      );
      if (!targetObjectName || normalizedType === 'None') {
        this._updateJointEditorPreview(null);
        this._clearJointEditorOwnedJoint();
        return;
      }

      if (this._body === null && !this._createBody()) {
        this._updateJointEditorPreview(null);
        return;
      }

      const targetBehavior =
        this._findBestAlternativePhysics3DBehavior(targetObjectName);
      if (!this._isValidOtherBehaviorForJoint(targetBehavior)) {
        this._updateJointEditorPreview(null);
        this._clearJointEditorOwnedJoint();
        return;
      }
      if (!this._isJointSupportedRuntimeObject(targetBehavior.owner)) {
        this._updateJointEditorPreview(null);
        this._clearJointEditorOwnedJoint();
        return;
      }
      if (targetBehavior._body === null && !targetBehavior._createBody()) {
        this._updateJointEditorPreview(null);
        return;
      }

      const bodyA = this._body;
      const bodyB = targetBehavior._body;
      if (!bodyA || !bodyB || bodyA === bodyB) {
        this._updateJointEditorPreview(null);
        this._clearJointEditorOwnedJoint();
        return;
      }
      this._updateJointEditorPreview(targetBehavior);

      const desiredSubType =
        this._getConstraintSubTypeForJointEditorType(normalizedType);
      if (desiredSubType === 0) {
        this._updateJointEditorPreview(null);
        this._clearJointEditorOwnedJoint();
        return;
      }

      if (this._jointEditorOwnedJointId > 0) {
        const trackedConstraint = this._sharedData.getJoint(
          this._jointEditorOwnedJointId
        );
        if (!trackedConstraint) {
          this._jointEditorOwnedJointId = 0;
          this._jointEditorOwnedTargetUniqueId = 0;
          this._jointEditorOwnsJoint = false;
        } else {
          const trackedTwoBody = Jolt.castObject(
            trackedConstraint,
            Jolt.TwoBodyConstraint
          );
          const trackedBody1 = trackedTwoBody.GetBody1();
          const trackedBody2 = trackedTwoBody.GetBody2();
          const matchesBodies =
            (trackedBody1 === bodyA && trackedBody2 === bodyB) ||
            (trackedBody1 === bodyB && trackedBody2 === bodyA);
          if (
            !matchesBodies ||
            trackedConstraint.GetSubType() !== desiredSubType ||
            this._jointEditorOwnedTargetUniqueId !==
              targetBehavior.owner.getUniqueId()
          ) {
            if (this._jointEditorOwnsJoint) {
              this._sharedData.removeJoint(this._jointEditorOwnedJointId);
            }
            this._jointEditorOwnedJointId = 0;
            this._jointEditorOwnedTargetUniqueId = 0;
            this._jointEditorOwnsJoint = false;
          }
        }
      }

      if (this._jointEditorOwnedJointId > 0) {
        this._applyAutomaticJointTuning(
          this._jointEditorOwnedJointId,
          normalizedType === 'Fixed' ? 'UltraStable' : 'Stable'
        );
        return;
      }

      const existingJointId = this._sharedData.findJointIdBetweenBodies(
        bodyA,
        bodyB,
        desiredSubType
      );
      if (existingJointId !== 0) {
        this._jointEditorOwnedJointId = existingJointId;
        this._jointEditorOwnedTargetUniqueId =
          targetBehavior.owner.getUniqueId();
        this._jointEditorOwnsJoint = false;
        this._applyAutomaticJointTuning(
          existingJointId,
          normalizedType === 'Fixed' ? 'UltraStable' : 'Stable'
        );
        return;
      }

      const createdJointId = this._createJointFromEditorType(targetBehavior);
      if (createdJointId <= 0) {
        this._clearJointEditorOwnedJoint();
        return;
      }

      this._jointEditorOwnedJointId = createdJointId;
      this._jointEditorOwnedTargetUniqueId = targetBehavior.owner.getUniqueId();
      this._jointEditorOwnsJoint = true;
    }

    private _isValidOtherBehaviorForJoint(
      behavior: Physics3DRuntimeBehavior | null,
      excludedBehavior: Physics3DRuntimeBehavior | null = null
    ): behavior is Physics3DRuntimeBehavior {
      return (
        !!behavior &&
        behavior !== this &&
        behavior !== excludedBehavior &&
        behavior.activated() &&
        behavior._sharedData === this._sharedData
      );
    }

    private _getDistanceSquaredToObject(
      otherObject: gdjs.RuntimeObject
    ): float {
      const thisX = this.owner3D.getX();
      const thisY = this.owner3D.getY();
      const thisZ = this.owner3D.getZ();
      const otherObject3D = otherObject as unknown as gdjs.RuntimeObject3D;
      const otherX = otherObject3D.getX();
      const otherY = otherObject3D.getY();
      const otherZ =
        typeof (otherObject3D as any).getZ === 'function'
          ? otherObject3D.getZ()
          : 0;
      const dx = otherX - thisX;
      const dy = otherY - thisY;
      const dz = otherZ - thisZ;
      return dx * dx + dy * dy + dz * dz;
    }

    private _findBestAlternativePhysics3DBehavior(
      objectName: string,
      excludedBehavior: Physics3DRuntimeBehavior | null = null
    ): Physics3DRuntimeBehavior | null {
      const candidates = this.owner
        .getInstanceContainer()
        .getObjects(objectName);
      if (!candidates || candidates.length === 0) {
        return null;
      }

      // Reuse previous target for stable links across frames if still valid.
      const cachedTargetId =
        this._preferredJointTargetsByObjectName[objectName];
      if (cachedTargetId !== undefined) {
        for (const candidate of candidates) {
          if (candidate.getUniqueId() !== cachedTargetId) {
            continue;
          }
          const candidateBehavior =
            this._findPhysics3DBehaviorOnObject(candidate);
          if (
            this._isValidOtherBehaviorForJoint(
              candidateBehavior,
              excludedBehavior
            )
          ) {
            return candidateBehavior;
          }
          break;
        }
      }

      let bestBehavior: Physics3DRuntimeBehavior | null = null;
      let bestDistanceSquared = Number.POSITIVE_INFINITY;
      for (const candidate of candidates) {
        if (candidate === this.owner) {
          continue;
        }
        const candidateBehavior =
          this._findPhysics3DBehaviorOnObject(candidate);
        if (
          !this._isValidOtherBehaviorForJoint(
            candidateBehavior,
            excludedBehavior
          )
        ) {
          continue;
        }
        const distanceSquared = this._getDistanceSquaredToObject(candidate);
        if (distanceSquared < bestDistanceSquared) {
          bestDistanceSquared = distanceSquared;
          bestBehavior = candidateBehavior;
        }
      }
      return bestBehavior;
    }

    private _getOtherBody(otherObject: gdjs.RuntimeObject): Jolt.Body | null {
      if (!otherObject) {
        console.warn('[Physics3D] Joint creation failed: other object is null');
        return null;
      }
      if (!this._isJointSupportedRuntimeObject(this.owner)) {
        console.warn(
          `[Physics3D] Joint creation failed: source object "${this.owner.getName()}" must be Scene3D::Model3DObject or Scene3D::Cube3DObject.`
        );
        return null;
      }
      if (!this._isJointSupportedRuntimeObject(otherObject)) {
        console.warn(
          `[Physics3D] Joint creation failed: target object "${otherObject.getName()}" must be Scene3D::Model3DObject or Scene3D::Cube3DObject.`
        );
        return null;
      }

      const targetObjectName = otherObject.getName();
      let otherBehavior = this._findPhysics3DBehaviorOnObject(otherObject);
      if (!this._isValidOtherBehaviorForJoint(otherBehavior)) {
        otherBehavior = this._findBestAlternativePhysics3DBehavior(
          targetObjectName,
          otherBehavior
        );
      }
      if (!this._isValidOtherBehaviorForJoint(otherBehavior)) {
        console.warn(
          `[Physics3D] Joint creation failed: no valid Physics3D target found for object "${targetObjectName}" (check if another instance exists and has active Physics3D behavior)`
        );
        return null;
      }

      // Force-create the body if it doesn't exist yet
      // (physics body is lazy-initialized on first physics step)
      if (otherBehavior._body === null) {
        if (!otherBehavior._createBody()) {
          console.warn(
            `[Physics3D] Joint creation failed: unable to create body for object "${otherObject.getName()}"`
          );
          return null;
        }
      }

      if (this._body !== null && otherBehavior._body === this._body) {
        const alternativeBehavior = this._findBestAlternativePhysics3DBehavior(
          targetObjectName,
          otherBehavior
        );
        if (!this._isValidOtherBehaviorForJoint(alternativeBehavior)) {
          console.warn(
            '[Physics3D] Joint creation failed: resolved both ends to the same body and no alternative target is available'
          );
          return null;
        }
        otherBehavior = alternativeBehavior;
        if (otherBehavior._body === null) {
          if (!otherBehavior._createBody()) {
            console.warn(
              `[Physics3D] Joint creation failed: unable to create body for object "${otherBehavior.owner.getName()}"`
            );
            return null;
          }
        }
      }

      this._preferredJointTargetsByObjectName[targetObjectName] =
        otherBehavior.owner.getUniqueId();
      return otherBehavior._body;
    }

    /**
     * Add a Fixed joint between this object and another.
     * Both objects are locked together with no relative movement.
     */
    addFixedJoint(
      otherObject: gdjs.RuntimeObject,
      variable: gdjs.Variable
    ): void {
      variable.setNumber(0);
      if (this._body === null) {
        if (!this._createBody()) return;
      }
      const body = this._body!;
      const otherBody = this._getOtherBody(otherObject);
      if (!otherBody) return;
      const existingJointId = this._sharedData.findJointIdBetweenBodies(
        body,
        otherBody,
        Jolt.EConstraintSubType_Fixed
      );
      if (existingJointId !== 0) {
        variable.setNumber(existingJointId);
        this._applyAutomaticJointTuning(existingJointId, 'UltraStable');
        return;
      }

      const settings = new Jolt.FixedConstraintSettings();
      settings.mAutoDetectPoint = true;
      settings.mSpace = Jolt.EConstraintSpace_WorldSpace;

      // @ts-ignore - Create exists on TwoBodyConstraintSettings WASM
      const constraint = settings.Create(body, otherBody);
      Jolt.destroy(settings);

      const jointId = this._sharedData.addJoint(constraint);
      variable.setNumber(jointId);
      this._applyAutomaticJointTuning(jointId, 'UltraStable');
    }

    /**
     * Add a Point (Ball & Socket) joint between this object and another.
     * Both objects are connected at a point but can rotate freely.
     */
    addPointJoint(
      otherObject: gdjs.RuntimeObject,
      anchorX: float,
      anchorY: float,
      anchorZ: float,
      variable: gdjs.Variable
    ): void {
      variable.setNumber(0);
      if (this._body === null) {
        if (!this._createBody()) return;
      }
      const body = this._body!;
      const otherBody = this._getOtherBody(otherObject);
      if (!otherBody) return;
      const existingJointId = this._sharedData.findJointIdBetweenBodies(
        body,
        otherBody,
        Jolt.EConstraintSubType_Point
      );
      if (existingJointId !== 0) {
        variable.setNumber(existingJointId);
        this._applyAutomaticJointTuning(existingJointId, 'Stable');
        return;
      }

      const worldInvScale = this._sharedData.worldInvScale;
      const settings = new Jolt.PointConstraintSettings();
      settings.mSpace = Jolt.EConstraintSpace_WorldSpace;
      settings.mPoint1 = this._sharedData.getRVec3(
        anchorX * worldInvScale,
        anchorY * worldInvScale,
        anchorZ * worldInvScale
      );
      settings.mPoint2 = this._sharedData.getRVec3(
        anchorX * worldInvScale,
        anchorY * worldInvScale,
        anchorZ * worldInvScale
      );

      // @ts-ignore - Create exists on TwoBodyConstraintSettings WASM
      const constraint = settings.Create(body, otherBody);
      Jolt.destroy(settings);

      const jointId = this._sharedData.addJoint(constraint);
      variable.setNumber(jointId);
      this._applyAutomaticJointTuning(jointId, 'Stable');
    }

    /**
     * Add a Hinge joint between this object and another.
     * Allows rotation around a single axis, with optional limits and motor.
     */
    addHingeJoint(
      otherObject: gdjs.RuntimeObject,
      anchorX: float,
      anchorY: float,
      anchorZ: float,
      axisX: float,
      axisY: float,
      axisZ: float,
      variable: gdjs.Variable
    ): void {
      variable.setNumber(0);
      if (this._body === null) {
        if (!this._createBody()) return;
      }
      const body = this._body!;
      const otherBody = this._getOtherBody(otherObject);
      if (!otherBody) return;
      const existingJointId = this._sharedData.findJointIdBetweenBodies(
        body,
        otherBody,
        Jolt.EConstraintSubType_Hinge
      );
      if (existingJointId !== 0) {
        variable.setNumber(existingJointId);
        this._applyAutomaticJointTuning(existingJointId, 'Stable');
        return;
      }

      const worldInvScale = this._sharedData.worldInvScale;
      const settings = new Jolt.HingeConstraintSettings();
      settings.mSpace = Jolt.EConstraintSpace_WorldSpace;
      settings.mPoint1 = this._sharedData.getRVec3(
        anchorX * worldInvScale,
        anchorY * worldInvScale,
        anchorZ * worldInvScale
      );
      settings.mPoint2 = this._sharedData.getRVec3(
        anchorX * worldInvScale,
        anchorY * worldInvScale,
        anchorZ * worldInvScale
      );
      // Normalize axis
      const axisLen = Math.sqrt(axisX * axisX + axisY * axisY + axisZ * axisZ);
      if (axisLen > 0) {
        axisX /= axisLen;
        axisY /= axisLen;
        axisZ /= axisLen;
      } else {
        axisY = 1; // Default up axis
      }
      settings.mHingeAxis1 = this._sharedData.getVec3(axisX, axisY, axisZ);
      settings.mHingeAxis2 = this._sharedData.getVec3(axisX, axisY, axisZ);
      // Compute a perpendicular normal axis
      let normalX: float, normalY: float, normalZ: float;
      if (Math.abs(axisX) < 0.9) {
        // Cross with X axis
        normalX = 0;
        normalY = -axisZ;
        normalZ = axisY;
      } else {
        // Cross with Y axis
        normalX = axisZ;
        normalY = 0;
        normalZ = -axisX;
      }
      const normalLen = Math.sqrt(
        normalX * normalX + normalY * normalY + normalZ * normalZ
      );
      if (normalLen > 0) {
        normalX /= normalLen;
        normalY /= normalLen;
        normalZ /= normalLen;
      }
      settings.mNormalAxis1 = this._sharedData.getVec3(
        normalX,
        normalY,
        normalZ
      );
      settings.mNormalAxis2 = this._sharedData.getVec3(
        normalX,
        normalY,
        normalZ
      );

      // @ts-ignore - Create exists on TwoBodyConstraintSettings WASM
      const constraint = settings.Create(body, otherBody);
      Jolt.destroy(settings);

      const jointId = this._sharedData.addJoint(constraint);
      variable.setNumber(jointId);
      this._applyAutomaticJointTuning(jointId, 'Stable');
    }

    /**
     * Add a Slider (Prismatic) joint between this object and another.
     * Allows translation along a single axis.
     */
    addSliderJoint(
      otherObject: gdjs.RuntimeObject,
      axisX: float,
      axisY: float,
      axisZ: float,
      variable: gdjs.Variable
    ): void {
      variable.setNumber(0);
      if (this._body === null) {
        if (!this._createBody()) return;
      }
      const body = this._body!;
      const otherBody = this._getOtherBody(otherObject);
      if (!otherBody) return;
      const existingJointId = this._sharedData.findJointIdBetweenBodies(
        body,
        otherBody,
        Jolt.EConstraintSubType_Slider
      );
      if (existingJointId !== 0) {
        variable.setNumber(existingJointId);
        this._applyAutomaticJointTuning(existingJointId, 'Stable');
        return;
      }

      const settings = new Jolt.SliderConstraintSettings();
      settings.mAutoDetectPoint = true;
      settings.mSpace = Jolt.EConstraintSpace_WorldSpace;
      // Normalize axis
      const [normalizedAxisX, normalizedAxisY, normalizedAxisZ, axisLen] =
        normalize3(axisX, axisY, axisZ);
      if (axisLen > epsilon) {
        axisX = normalizedAxisX;
        axisY = normalizedAxisY;
        axisZ = normalizedAxisZ;
      } else {
        axisX = 1;
        axisY = 0;
        axisZ = 0;
      }
      const [normalX, normalY, normalZ] = this._computePerpendicularAxis(
        axisX,
        axisY,
        axisZ
      );
      settings.mSliderAxis1 = this._sharedData.getVec3(axisX, axisY, axisZ);
      settings.mSliderAxis2 = this._sharedData.getVec3(axisX, axisY, axisZ);
      settings.mNormalAxis1 = this._sharedData.getVec3(
        normalX,
        normalY,
        normalZ
      );
      settings.mNormalAxis2 = this._sharedData.getVec3(
        normalX,
        normalY,
        normalZ
      );

      // @ts-ignore - Create exists on TwoBodyConstraintSettings WASM
      const constraint = settings.Create(body, otherBody);
      Jolt.destroy(settings);

      const jointId = this._sharedData.addJoint(constraint);
      variable.setNumber(jointId);
      this._applyAutomaticJointTuning(jointId, 'Stable');
    }

    /**
     * Add a Distance joint between this object and another.
     * Keeps a min/max distance between two objects, optionally with a spring.
     */
    addDistanceJoint(
      otherObject: gdjs.RuntimeObject,
      minDistance: float,
      maxDistance: float,
      springFrequency: float,
      springDamping: float,
      variable: gdjs.Variable
    ): void {
      variable.setNumber(0);
      if (this._body === null) {
        if (!this._createBody()) return;
      }
      const body = this._body!;
      const otherBody = this._getOtherBody(otherObject);
      if (!otherBody) return;
      const existingJointId = this._sharedData.findJointIdBetweenBodies(
        body,
        otherBody,
        Jolt.EConstraintSubType_Distance
      );
      if (existingJointId !== 0) {
        variable.setNumber(existingJointId);
        this._applyAutomaticJointTuning(existingJointId, 'Stable');
        return;
      }

      const worldInvScale = this._sharedData.worldInvScale;
      const settings = new Jolt.DistanceConstraintSettings();
      settings.mSpace = Jolt.EConstraintSpace_WorldSpace;
      // Use centers of mass for points
      const pos1 = body.GetCenterOfMassPosition();
      const pos2 = otherBody.GetCenterOfMassPosition();
      settings.mPoint1 = this._sharedData.getRVec3(
        pos1.GetX(),
        pos1.GetY(),
        pos1.GetZ()
      );
      settings.mPoint2 = this._sharedData.getRVec3(
        pos2.GetX(),
        pos2.GetY(),
        pos2.GetZ()
      );
      const minLimit = Math.max(0, Math.min(minDistance, maxDistance));
      const maxLimit = Math.max(
        minLimit + epsilon,
        Math.max(minDistance, maxDistance)
      );
      settings.mMinDistance = minLimit * worldInvScale;
      settings.mMaxDistance = maxLimit * worldInvScale;
      if (springFrequency > 0) {
        settings.mLimitsSpringSettings.mFrequency = Math.max(
          0,
          springFrequency
        );
        settings.mLimitsSpringSettings.mDamping = Math.max(0, springDamping);
      }

      // @ts-ignore - Create exists on TwoBodyConstraintSettings WASM
      const constraint = settings.Create(body, otherBody);
      Jolt.destroy(settings);

      const jointId = this._sharedData.addJoint(constraint);
      variable.setNumber(jointId);
      this._applyAutomaticJointTuning(jointId, 'Stable');
    }

    /**
     * Add a Pulley joint between this object and another.
     * The rope length is fixed (min = max = totalLength), and ratio controls mechanical advantage.
     */
    addPulleyJoint(
      otherObject: gdjs.RuntimeObject,
      pulleyAnchorAX: float,
      pulleyAnchorAY: float,
      pulleyAnchorAZ: float,
      pulleyAnchorBX: float,
      pulleyAnchorBY: float,
      pulleyAnchorBZ: float,
      localAnchorAX: float,
      localAnchorAY: float,
      localAnchorAZ: float,
      localAnchorBX: float,
      localAnchorBY: float,
      localAnchorBZ: float,
      totalLength: float,
      ratio: float,
      enabled: boolean,
      variable: gdjs.Variable
    ): void {
      variable.setNumber(0);
      if (this._body === null) {
        if (!this._createBody()) return;
      }
      const body = this._body!;
      const otherBody = this._getOtherBody(otherObject);
      if (!otherBody) return;

      const existingJointId = this._sharedData.findJointIdBetweenBodies(
        body,
        otherBody,
        Jolt.EConstraintSubType_Pulley
      );
      if (existingJointId !== 0) {
        variable.setNumber(existingJointId);
        const existingConstraint = this._sharedData.getJoint(existingJointId);
        if (existingConstraint) {
          existingConstraint.SetEnabled(!!enabled);
          this._activateBodiesForConstraint(existingConstraint);
        }
        this._applyAutomaticJointTuning(existingJointId, 'Stable');
        return;
      }

      const worldInvScale = this._sharedData.worldInvScale;
      const clampedTotalLength = Math.max(epsilon, totalLength) * worldInvScale;
      const clampedRatio = Math.max(epsilon, ratio);
      const settings = new Jolt.PulleyConstraintSettings();
      settings.mSpace = Jolt.EConstraintSpace_LocalToBodyCOM;
      settings.mBodyPoint1 = this._sharedData.getRVec3(
        localAnchorAX * worldInvScale,
        localAnchorAY * worldInvScale,
        localAnchorAZ * worldInvScale
      );
      settings.mBodyPoint2 = this._sharedData.getRVec3(
        localAnchorBX * worldInvScale,
        localAnchorBY * worldInvScale,
        localAnchorBZ * worldInvScale
      );
      settings.mFixedPoint1 = this._sharedData.getRVec3(
        pulleyAnchorAX * worldInvScale,
        pulleyAnchorAY * worldInvScale,
        pulleyAnchorAZ * worldInvScale
      );
      settings.mFixedPoint2 = this._sharedData.getRVec3(
        pulleyAnchorBX * worldInvScale,
        pulleyAnchorBY * worldInvScale,
        pulleyAnchorBZ * worldInvScale
      );
      settings.mRatio = clampedRatio;
      settings.mMinLength = clampedTotalLength;
      settings.mMaxLength = clampedTotalLength;
      settings.mEnabled = !!enabled;

      // @ts-ignore - Create exists on TwoBodyConstraintSettings WASM
      const constraint = settings.Create(body, otherBody);
      Jolt.destroy(settings);

      const jointId = this._sharedData.addJoint(constraint);
      variable.setNumber(jointId);
      this._applyAutomaticJointTuning(jointId, 'Stable');

      // Re-apply explicit enabled state because automatic tuning may wake the bodies.
      if (!enabled) {
        const createdConstraint = this._sharedData.getJoint(jointId);
        if (createdConstraint) {
          createdConstraint.SetEnabled(false);
        }
      }
    }

    /**
     * Add a Cone joint between this object and another.
     * Restricts the rotation within a cone shape.
     */
    addConeJoint(
      otherObject: gdjs.RuntimeObject,
      anchorX: float,
      anchorY: float,
      anchorZ: float,
      twistAxisX: float,
      twistAxisY: float,
      twistAxisZ: float,
      halfConeAngle: float,
      variable: gdjs.Variable
    ): void {
      variable.setNumber(0);
      if (this._body === null) {
        if (!this._createBody()) return;
      }
      const body = this._body!;
      const otherBody = this._getOtherBody(otherObject);
      if (!otherBody) return;
      const existingJointId = this._sharedData.findJointIdBetweenBodies(
        body,
        otherBody,
        Jolt.EConstraintSubType_Cone
      );
      if (existingJointId !== 0) {
        variable.setNumber(existingJointId);
        this._applyAutomaticJointTuning(existingJointId, 'Stable');
        return;
      }

      const worldInvScale = this._sharedData.worldInvScale;
      const settings = new Jolt.ConeConstraintSettings();
      settings.mSpace = Jolt.EConstraintSpace_WorldSpace;
      settings.mPoint1 = this._sharedData.getRVec3(
        anchorX * worldInvScale,
        anchorY * worldInvScale,
        anchorZ * worldInvScale
      );
      settings.mPoint2 = this._sharedData.getRVec3(
        anchorX * worldInvScale,
        anchorY * worldInvScale,
        anchorZ * worldInvScale
      );
      // Normalize twist axis
      const axisLen = Math.sqrt(
        twistAxisX * twistAxisX +
          twistAxisY * twistAxisY +
          twistAxisZ * twistAxisZ
      );
      if (axisLen > 0) {
        twistAxisX /= axisLen;
        twistAxisY /= axisLen;
        twistAxisZ /= axisLen;
      } else {
        twistAxisY = 1;
      }
      settings.mTwistAxis1 = this._sharedData.getVec3(
        twistAxisX,
        twistAxisY,
        twistAxisZ
      );
      settings.mTwistAxis2 = this._sharedData.getVec3(
        twistAxisX,
        twistAxisY,
        twistAxisZ
      );
      settings.mHalfConeAngle = gdjs.toRad(
        Math.max(0, Math.min(179.0, halfConeAngle))
      );

      // @ts-ignore - Create exists on TwoBodyConstraintSettings WASM
      const constraint = settings.Create(body, otherBody);
      Jolt.destroy(settings);

      const jointId = this._sharedData.addJoint(constraint);
      variable.setNumber(jointId);
      this._applyAutomaticJointTuning(jointId, 'Stable');
    }

    /**
     * Add a SwingTwist joint between this object and another.
     * Best for shoulders, hips, and ragdoll joints. Allows independent
     * control of swing (cone) and twist ranges.
     */
    addSwingTwistJoint(
      otherObject: gdjs.RuntimeObject,
      anchorX: float,
      anchorY: float,
      anchorZ: float,
      twistAxisX: float,
      twistAxisY: float,
      twistAxisZ: float,
      normalHalfConeAngle: float,
      planeHalfConeAngle: float,
      twistMinAngle: float,
      twistMaxAngle: float,
      variable: gdjs.Variable
    ): void {
      variable.setNumber(0);
      if (this._body === null) {
        if (!this._createBody()) return;
      }
      const body = this._body!;
      const otherBody = this._getOtherBody(otherObject);
      if (!otherBody) return;
      const existingJointId = this._sharedData.findJointIdBetweenBodies(
        body,
        otherBody,
        Jolt.EConstraintSubType_SwingTwist
      );
      if (existingJointId !== 0) {
        variable.setNumber(existingJointId);
        this._applyAutomaticJointTuning(existingJointId, 'Stable');
        return;
      }

      const worldInvScale = this._sharedData.worldInvScale;
      const settings = new Jolt.SwingTwistConstraintSettings();
      settings.mSpace = Jolt.EConstraintSpace_WorldSpace;
      settings.mPosition1 = this._sharedData.getRVec3(
        anchorX * worldInvScale,
        anchorY * worldInvScale,
        anchorZ * worldInvScale
      );
      settings.mPosition2 = this._sharedData.getRVec3(
        anchorX * worldInvScale,
        anchorY * worldInvScale,
        anchorZ * worldInvScale
      );
      // Normalize twist axis
      const axisLen = Math.sqrt(
        twistAxisX * twistAxisX +
          twistAxisY * twistAxisY +
          twistAxisZ * twistAxisZ
      );
      if (axisLen > 0) {
        twistAxisX /= axisLen;
        twistAxisY /= axisLen;
        twistAxisZ /= axisLen;
      } else {
        twistAxisX = 1;
      }
      settings.mTwistAxis1 = this._sharedData.getVec3(
        twistAxisX,
        twistAxisY,
        twistAxisZ
      );
      settings.mTwistAxis2 = this._sharedData.getVec3(
        twistAxisX,
        twistAxisY,
        twistAxisZ
      );
      // Compute plane axis perpendicular to twist axis
      let planeX: float, planeY: float, planeZ: float;
      if (Math.abs(twistAxisX) < 0.9) {
        planeX = 0;
        planeY = -twistAxisZ;
        planeZ = twistAxisY;
      } else {
        planeX = twistAxisZ;
        planeY = 0;
        planeZ = -twistAxisX;
      }
      const planeLen = Math.sqrt(
        planeX * planeX + planeY * planeY + planeZ * planeZ
      );
      if (planeLen > 0) {
        planeX /= planeLen;
        planeY /= planeLen;
        planeZ /= planeLen;
      }
      settings.mPlaneAxis1 = this._sharedData.getVec3(planeX, planeY, planeZ);
      settings.mPlaneAxis2 = this._sharedData.getVec3(planeX, planeY, planeZ);
      const clampedNormalHalfConeAngle = Math.max(
        0,
        Math.min(179, normalHalfConeAngle)
      );
      const clampedPlaneHalfConeAngle = Math.max(
        0,
        Math.min(179, planeHalfConeAngle)
      );
      settings.mNormalHalfConeAngle = gdjs.toRad(clampedNormalHalfConeAngle);
      settings.mPlaneHalfConeAngle = gdjs.toRad(clampedPlaneHalfConeAngle);
      const orderedMinTwistAngle = Math.min(twistMinAngle, twistMaxAngle);
      const orderedMaxTwistAngle = Math.max(twistMinAngle, twistMaxAngle);
      const minTwistAngle = Math.max(
        -179,
        Math.min(179, orderedMinTwistAngle)
      );
      const maxTwistAngle = Math.max(
        minTwistAngle,
        Math.max(-179, Math.min(179, orderedMaxTwistAngle))
      );
      settings.mTwistMinAngle = gdjs.toRad(minTwistAngle);
      settings.mTwistMaxAngle = gdjs.toRad(maxTwistAngle);

      // @ts-ignore - Create exists on TwoBodyConstraintSettings WASM
      const constraint = settings.Create(body, otherBody);
      Jolt.destroy(settings);

      const jointId = this._sharedData.addJoint(constraint);
      variable.setNumber(jointId);
      this._applyAutomaticJointTuning(jointId, 'Stable');
    }

    /**
     * Remove a joint by its ID.
     */
    removeJoint(jointId: integer | string): void {
      const numericJointId =
        typeof jointId === 'string' ? parseInt(jointId, 10) : jointId;
      if (numericJointId === this._jointEditorOwnedJointId) {
        this._jointEditorOwnedJointId = 0;
        this._jointEditorOwnedTargetUniqueId = 0;
        this._jointEditorOwnsJoint = false;
      }
      this._sharedData.removeJoint(jointId);
    }

    /**
     * Check if this object is the first body in a joint.
     */
    isJointFirstObject(jointId: integer | string): boolean {
      if (this._body === null) return false;
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return false;
      const twoBodyConstraint = Jolt.castObject(
        constraint,
        Jolt.TwoBodyConstraint
      );
      return twoBodyConstraint.GetBody1() === this._body;
    }

    /**
     * Check if this object is the second body in a joint.
     */
    isJointSecondObject(jointId: integer | string): boolean {
      if (this._body === null) return false;
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return false;
      const twoBodyConstraint = Jolt.castObject(
        constraint,
        Jolt.TwoBodyConstraint
      );
      return twoBodyConstraint.GetBody2() === this._body;
    }

    /**
     * Override solver iterations for a specific joint.
     * Use 0 to return to engine defaults.
     */
    setJointSolverOverrides(
      jointId: integer | string,
      velocitySteps: float,
      positionSteps: float
    ): void {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return;
      const clampedVelocitySteps = Math.max(
        0,
        Math.min(255, Math.round(velocitySteps))
      );
      const clampedPositionSteps = Math.max(
        0,
        Math.min(255, Math.round(positionSteps))
      );
      constraint.SetNumVelocityStepsOverride(clampedVelocitySteps);
      constraint.SetNumPositionStepsOverride(clampedPositionSteps);
      this._activateBodiesForConstraint(constraint);
    }

    /**
     * Set solver priority for a specific joint.
     */
    setJointPriority(jointId: integer | string, priority: float): void {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return;
      const clampedPriority = Math.max(0, Math.min(255, Math.round(priority)));
      constraint.SetConstraintPriority(clampedPriority);
      this._activateBodiesForConstraint(constraint);
    }

    /**
     * Apply a ready-to-use stability preset on a joint.
     * - "Balanced": engine defaults
     * - "Stable": stronger solver for most gameplay constraints
     * - "UltraStable": highest stability, more CPU cost
     */
    setJointStabilityPreset(jointId: integer | string, preset: string): void {
      const normalizedPreset = (preset || '')
        .toLowerCase()
        .replace(/[\s_-]/g, '');
      if (normalizedPreset === 'stable') {
        this.setJointSolverOverrides(jointId, 8, 4);
        this.setJointPriority(jointId, 100);
      } else if (normalizedPreset === 'ultrastable') {
        this.setJointSolverOverrides(jointId, 12, 6);
        this.setJointPriority(jointId, 150);
      } else {
        this.setJointSolverOverrides(jointId, 0, 0);
        this.setJointPriority(jointId, 0);
      }
    }

    /**
     * Set automatic break thresholds for a joint.
     * Pass <= 0 to disable a threshold.
     */
    setJointBreakThresholds(
      jointId: integer | string,
      maxForce: float,
      maxTorque: float
    ): void {
      this._sharedData.setJointBreakThresholds(jointId, maxForce, maxTorque);
      this._activateBodiesForJoint(jointId);
    }

    /**
     * Disable automatic break thresholds for a joint.
     */
    clearJointBreakThresholds(jointId: integer | string): void {
      this._sharedData.clearJointBreakThresholds(jointId);
      this._activateBodiesForJoint(jointId);
    }

    /**
     * Check if a joint has been broken by thresholds.
     */
    isJointBroken(jointId: integer | string): boolean {
      return this._sharedData.isJointBroken(jointId);
    }

    /**
     * Get last reaction force measured for a joint.
     */
    getJointReactionForce(jointId: integer | string): float {
      return this._sharedData.getJointLastReactionForce(jointId);
    }

    /**
     * Get last reaction torque measured for a joint.
     */
    getJointReactionTorque(jointId: integer | string): float {
      return this._sharedData.getJointLastReactionTorque(jointId);
    }

    /**
     * Set motor torque limits on a hinge joint.
     */
    setHingeJointMotorLimits(
      jointId: integer | string,
      minTorque: float,
      maxTorque: float
    ): void {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return;
      const hingeConstraint = Jolt.castObject(constraint, Jolt.HingeConstraint);
      const motorSettings = hingeConstraint.GetMotorSettings();
      const low = Math.min(minTorque, maxTorque);
      const high = Math.max(minTorque, maxTorque);
      motorSettings.mMinTorqueLimit = low;
      motorSettings.mMaxTorqueLimit = high;
      this._activateBodiesForConstraint(constraint);
    }

    /**
     * Set motor spring settings on a hinge joint.
     */
    setHingeJointMotorSpring(
      jointId: integer | string,
      frequency: float,
      damping: float
    ): void {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return;
      const hingeConstraint = Jolt.castObject(constraint, Jolt.HingeConstraint);
      const springSettings = hingeConstraint.GetMotorSettings().mSpringSettings;
      springSettings.mFrequency = Math.max(0, frequency);
      springSettings.mDamping = Math.max(0, damping);
      this._activateBodiesForConstraint(constraint);
    }

    /**
     * Set motor force limits on a slider joint.
     */
    setSliderJointMotorLimits(
      jointId: integer | string,
      minForce: float,
      maxForce: float
    ): void {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return;
      const sliderConstraint = Jolt.castObject(
        constraint,
        Jolt.SliderConstraint
      );
      const motorSettings = sliderConstraint.GetMotorSettings();
      const low = Math.min(minForce, maxForce);
      const high = Math.max(minForce, maxForce);
      motorSettings.mMinForceLimit = low;
      motorSettings.mMaxForceLimit = high;
      this._activateBodiesForConstraint(constraint);
    }

    /**
     * Set motor spring settings on a slider joint.
     */
    setSliderJointMotorSpring(
      jointId: integer | string,
      frequency: float,
      damping: float
    ): void {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return;
      const sliderConstraint = Jolt.castObject(
        constraint,
        Jolt.SliderConstraint
      );
      const springSettings =
        sliderConstraint.GetMotorSettings().mSpringSettings;
      springSettings.mFrequency = Math.max(0, frequency);
      springSettings.mDamping = Math.max(0, damping);
      this._activateBodiesForConstraint(constraint);
    }

    /**
     * Set the limits on a hinge joint (in degrees).
     */
    setHingeJointLimits(
      jointId: integer | string,
      limitsMin: float,
      limitsMax: float
    ): void {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return;
      const hingeConstraint = Jolt.castObject(constraint, Jolt.HingeConstraint);
      const minLimit = Math.min(limitsMin, limitsMax);
      const maxLimit = Math.max(limitsMin, limitsMax);
      hingeConstraint.SetLimits(gdjs.toRad(minLimit), gdjs.toRad(maxLimit));
      this._activateBodiesForConstraint(constraint);
    }

    /**
     * Set the motor on a hinge joint.
     * @param motorState "Off", "Velocity", or "Position"
     * @param target Target velocity (deg/s) or angle (degrees)
     */
    setHingeJointMotor(
      jointId: integer | string,
      motorState: string,
      target: float
    ): void {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return;
      const hingeConstraint = Jolt.castObject(constraint, Jolt.HingeConstraint);
      const state = this._resolveMotorState(motorState);
      hingeConstraint.SetMotorState(state);
      if (state === Jolt.EMotorState_Velocity) {
        hingeConstraint.SetTargetAngularVelocity(gdjs.toRad(target));
      } else if (state === Jolt.EMotorState_Position) {
        hingeConstraint.SetTargetAngle(gdjs.toRad(target));
      }
      this._activateBodiesForConstraint(constraint);
    }

    /**
     * Get the current angle of a hinge joint (in degrees).
     */
    getHingeJointAngle(jointId: integer | string): float {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return 0;
      const hingeConstraint = Jolt.castObject(constraint, Jolt.HingeConstraint);
      return gdjs.toDegrees(hingeConstraint.GetCurrentAngle());
    }

    /**
     * Set the limits on a slider joint (in pixels).
     */
    setSliderJointLimits(
      jointId: integer | string,
      limitsMin: float,
      limitsMax: float
    ): void {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return;
      const sliderConstraint = Jolt.castObject(
        constraint,
        Jolt.SliderConstraint
      );
      const minLimit = Math.min(limitsMin, limitsMax);
      const maxLimit = Math.max(limitsMin, limitsMax);
      sliderConstraint.SetLimits(
        minLimit * this._sharedData.worldInvScale,
        maxLimit * this._sharedData.worldInvScale
      );
      this._activateBodiesForConstraint(constraint);
    }

    /**
     * Set the motor on a slider joint.
     * @param motorState "Off", "Velocity", or "Position"
     * @param target Target velocity (pixels/s) or position (pixels)
     */
    setSliderJointMotor(
      jointId: integer | string,
      motorState: string,
      target: float
    ): void {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return;
      const sliderConstraint = Jolt.castObject(
        constraint,
        Jolt.SliderConstraint
      );
      const state = this._resolveMotorState(motorState);
      sliderConstraint.SetMotorState(state);
      if (state === Jolt.EMotorState_Velocity) {
        sliderConstraint.SetTargetVelocity(
          target * this._sharedData.worldInvScale
        );
      } else if (state === Jolt.EMotorState_Position) {
        sliderConstraint.SetTargetPosition(
          target * this._sharedData.worldInvScale
        );
      }
      this._activateBodiesForConstraint(constraint);
    }

    getRagdollRole(): string {
      return this.ragdollRole || 'None';
    }

    setRagdollRole(role: string): void {
      this.ragdollRole = role || 'None';
    }

    getRagdollGroupTag(): string {
      return this.ragdollGroupTag || '';
    }

    setRagdollGroupTag(groupTag: string): void {
      this.ragdollGroupTag = groupTag || '';
    }

    setJointAutoWakeBodies(enable: boolean): void {
      this.jointAutoWakeBodies = !!enable;
    }

    setJointAutoStabilityPreset(preset: string): void {
      const normalizedPreset = (preset || '')
        .toLowerCase()
        .replace(/[\s_-]/g, '');
      if (normalizedPreset === 'stable') {
        this.jointAutoStabilityPreset = 'Stable';
      } else if (normalizedPreset === 'ultrastable') {
        this.jointAutoStabilityPreset = 'UltraStable';
      } else {
        this.jointAutoStabilityPreset = 'Balanced';
      }
    }

    setJointAutoBreakForce(force: float): void {
      this.jointAutoBreakForce = Math.max(0, force);
    }

    setJointAutoBreakTorque(torque: float): void {
      this.jointAutoBreakTorque = Math.max(0, torque);
    }

    setJointEditorEnabled(enable: boolean): void {
      this.jointEditorEnabled = !!enable;
      if (!this.jointEditorEnabled) {
        this._updateJointEditorPreview(null);
        this._clearJointEditorOwnedJoint();
      }
    }

    setJointEditorTargetObjectName(objectName: string): void {
      const normalizedName = (objectName || '').trim();
      if (this.jointEditorTargetObjectName === normalizedName) {
        return;
      }
      this.jointEditorTargetObjectName = normalizedName;
      this._clearJointEditorOwnedJoint();
    }

    setJointEditorType(jointType: string): void {
      const normalizedType = this._normalizeJointEditorType(jointType);
      if (this.jointEditorType === normalizedType) {
        return;
      }
      this.jointEditorType = normalizedType;
      this._clearJointEditorOwnedJoint();
    }

    getJointEditorJointId(): integer {
      return this._jointEditorOwnedJointId;
    }

    /**
     * Get the current position of a slider joint (in pixels).
     */
    getSliderJointPosition(jointId: integer | string): float {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return 0;
      const sliderConstraint = Jolt.castObject(
        constraint,
        Jolt.SliderConstraint
      );
      return (
        sliderConstraint.GetCurrentPosition() * this._sharedData.worldScale
      );
    }

    /**
     * Set the distance on a distance joint (in pixels).
     */
    setDistanceJointDistance(
      jointId: integer | string,
      minDistance: float,
      maxDistance: float
    ): void {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return;
      const distanceConstraint = Jolt.castObject(
        constraint,
        Jolt.DistanceConstraint
      );
      const minLimit = Math.max(0, Math.min(minDistance, maxDistance));
      const maxLimit = Math.max(
        minLimit + epsilon,
        Math.max(minDistance, maxDistance)
      );
      distanceConstraint.SetDistance(
        minLimit * this._sharedData.worldInvScale,
        maxLimit * this._sharedData.worldInvScale
      );
      this._activateBodiesForConstraint(constraint);
    }

    /**
     * Set the total rope length on a pulley joint (in pixels).
     * Internally this enforces a fixed length by setting min = max.
     */
    setPulleyJointLength(jointId: integer | string, totalLength: float): void {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return;
      const pulleyConstraint = Jolt.castObject(constraint, Jolt.PulleyConstraint);
      const clampedLength = Math.max(epsilon, totalLength);
      const lengthInMeters = clampedLength * this._sharedData.worldInvScale;
      pulleyConstraint.SetLength(lengthInMeters, lengthInMeters);
      this._activateBodiesForConstraint(constraint);
    }

    /**
     * Get current rope length of a pulley joint (in pixels).
     */
    getPulleyJointCurrentLength(jointId: integer | string): float {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return 0;
      const pulleyConstraint = Jolt.castObject(constraint, Jolt.PulleyConstraint);
      return pulleyConstraint.GetCurrentLength() * this._sharedData.worldScale;
    }

    /**
     * Get configured total rope length of a pulley joint (in pixels).
     * This returns the midpoint between min and max lengths.
     */
    getPulleyJointTotalLength(jointId: integer | string): float {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return 0;
      const pulleyConstraint = Jolt.castObject(constraint, Jolt.PulleyConstraint);
      return (
        ((pulleyConstraint.GetMinLength() + pulleyConstraint.GetMaxLength()) *
          0.5) *
        this._sharedData.worldScale
      );
    }

    // ==================== Advanced Joint Customization ====================

    /**
     * Set spring settings on hinge joint limits.
     */
    setHingeJointSpring(
      jointId: integer | string,
      frequency: float,
      damping: float
    ): void {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return;
      const hingeConstraint = Jolt.castObject(constraint, Jolt.HingeConstraint);
      const springSettings = new Jolt.SpringSettings();
      springSettings.mFrequency = Math.max(0, frequency);
      springSettings.mDamping = Math.max(0, damping);
      hingeConstraint.SetLimitsSpringSettings(springSettings);
      Jolt.destroy(springSettings);
      this._activateBodiesForConstraint(constraint);
    }

    /**
     * Set max friction torque on a hinge joint.
     */
    setHingeJointMaxFriction(
      jointId: integer | string,
      maxFriction: float
    ): void {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return;
      const hingeConstraint = Jolt.castObject(constraint, Jolt.HingeConstraint);
      hingeConstraint.SetMaxFrictionTorque(maxFriction);
      this._activateBodiesForConstraint(constraint);
    }

    /**
     * Check if a hinge joint has limits enabled.
     */
    hasHingeJointLimits(jointId: integer | string): boolean {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return false;
      const hingeConstraint = Jolt.castObject(constraint, Jolt.HingeConstraint);
      return hingeConstraint.HasLimits();
    }

    /**
     * Get the minimum limit angle of a hinge joint (in degrees).
     */
    getHingeJointMinLimit(jointId: integer | string): float {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return 0;
      const hingeConstraint = Jolt.castObject(constraint, Jolt.HingeConstraint);
      return gdjs.toDegrees(hingeConstraint.GetLimitsMin());
    }

    /**
     * Get the maximum limit angle of a hinge joint (in degrees).
     */
    getHingeJointMaxLimit(jointId: integer | string): float {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return 0;
      const hingeConstraint = Jolt.castObject(constraint, Jolt.HingeConstraint);
      return gdjs.toDegrees(hingeConstraint.GetLimitsMax());
    }

    /**
     * Set spring settings on slider joint limits.
     */
    setSliderJointSpring(
      jointId: integer | string,
      frequency: float,
      damping: float
    ): void {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return;
      const sliderConstraint = Jolt.castObject(
        constraint,
        Jolt.SliderConstraint
      );
      const springSettings = new Jolt.SpringSettings();
      springSettings.mFrequency = Math.max(0, frequency);
      springSettings.mDamping = Math.max(0, damping);
      sliderConstraint.SetLimitsSpringSettings(springSettings);
      Jolt.destroy(springSettings);
      this._activateBodiesForConstraint(constraint);
    }

    /**
     * Set max friction force on a slider joint.
     */
    setSliderJointMaxFriction(
      jointId: integer | string,
      maxFriction: float
    ): void {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return;
      const sliderConstraint = Jolt.castObject(
        constraint,
        Jolt.SliderConstraint
      );
      sliderConstraint.SetMaxFrictionForce(maxFriction);
      this._activateBodiesForConstraint(constraint);
    }

    /**
     * Check if a slider joint has limits enabled.
     */
    hasSliderJointLimits(jointId: integer | string): boolean {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return false;
      const sliderConstraint = Jolt.castObject(
        constraint,
        Jolt.SliderConstraint
      );
      return sliderConstraint.HasLimits();
    }

    /**
     * Get the minimum limit of a slider joint (in pixels).
     */
    getSliderJointMinLimit(jointId: integer | string): float {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return 0;
      const sliderConstraint = Jolt.castObject(
        constraint,
        Jolt.SliderConstraint
      );
      return sliderConstraint.GetLimitsMin() * this._sharedData.worldScale;
    }

    /**
     * Get the maximum limit of a slider joint (in pixels).
     */
    getSliderJointMaxLimit(jointId: integer | string): float {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return 0;
      const sliderConstraint = Jolt.castObject(
        constraint,
        Jolt.SliderConstraint
      );
      return sliderConstraint.GetLimitsMax() * this._sharedData.worldScale;
    }

    /**
     * Set spring settings on a distance joint.
     */
    setDistanceJointSpring(
      jointId: integer | string,
      frequency: float,
      damping: float
    ): void {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return;
      const distanceConstraint = Jolt.castObject(
        constraint,
        Jolt.DistanceConstraint
      );
      const springSettings = new Jolt.SpringSettings();
      springSettings.mFrequency = Math.max(0, frequency);
      springSettings.mDamping = Math.max(0, damping);
      distanceConstraint.SetLimitsSpringSettings(springSettings);
      Jolt.destroy(springSettings);
      this._activateBodiesForConstraint(constraint);
    }

    /**
     * Get the current minimum distance of a distance joint (in pixels).
     */
    getDistanceJointMinDistance(jointId: integer | string): float {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return 0;
      const distanceConstraint = Jolt.castObject(
        constraint,
        Jolt.DistanceConstraint
      );
      return distanceConstraint.GetMinDistance() * this._sharedData.worldScale;
    }

    /**
     * Get the current maximum distance of a distance joint (in pixels).
     */
    getDistanceJointMaxDistance(jointId: integer | string): float {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return 0;
      const distanceConstraint = Jolt.castObject(
        constraint,
        Jolt.DistanceConstraint
      );
      return distanceConstraint.GetMaxDistance() * this._sharedData.worldScale;
    }

    /**
     * Update the half cone angle of a cone joint at runtime (in degrees).
     */
    setConeJointHalfAngle(jointId: integer | string, halfAngle: float): void {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return;
      const coneConstraint = Jolt.castObject(constraint, Jolt.ConeConstraint);
      coneConstraint.SetHalfConeAngle(
        gdjs.toRad(Math.max(0, Math.min(179, halfAngle)))
      );
      this._activateBodiesForConstraint(constraint);
    }

    // ==================== Joint Enable/Disable ====================

    /**
     * Enable a joint.
     */
    enableJoint(jointId: integer | string): void {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return;
      constraint.SetEnabled(true);
      this._activateBodiesForConstraint(constraint);
    }

    /**
     * Disable a joint without removing it.
     */
    disableJoint(jointId: integer | string): void {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return;
      constraint.SetEnabled(false);
    }

    /**
     * Check if a joint is enabled.
     */
    isJointEnabled(jointId: integer | string): boolean {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return false;
      return constraint.GetEnabled();
    }

    /**
     * Get the total number of active joints.
     */
    getJointCount(): integer {
      return Object.keys(this._sharedData.joints).length;
    }

    // ==================== Hinge Motor Queries ====================

    /**
     * Get the current target angular velocity of a hinge joint motor (deg/s).
     */
    getHingeJointMotorSpeed(jointId: integer | string): float {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return 0;
      const hingeConstraint = Jolt.castObject(constraint, Jolt.HingeConstraint);
      return gdjs.toDegrees(hingeConstraint.GetTargetAngularVelocity());
    }

    /**
     * Get the current target angle of a hinge joint motor (degrees).
     */
    getHingeJointMotorTarget(jointId: integer | string): float {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return 0;
      const hingeConstraint = Jolt.castObject(constraint, Jolt.HingeConstraint);
      return gdjs.toDegrees(hingeConstraint.GetTargetAngle());
    }

    /**
     * Get the max friction torque of a hinge joint.
     */
    getHingeJointMaxFriction(jointId: integer | string): float {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return 0;
      const hingeConstraint = Jolt.castObject(constraint, Jolt.HingeConstraint);
      return hingeConstraint.GetMaxFrictionTorque();
    }

    /**
     * Get hinge motor minimum torque limit.
     */
    getHingeJointMotorMinTorque(jointId: integer | string): float {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return 0;
      const hingeConstraint = Jolt.castObject(constraint, Jolt.HingeConstraint);
      return hingeConstraint.GetMotorSettings().mMinTorqueLimit;
    }

    /**
     * Get hinge motor maximum torque limit.
     */
    getHingeJointMotorMaxTorque(jointId: integer | string): float {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return 0;
      const hingeConstraint = Jolt.castObject(constraint, Jolt.HingeConstraint);
      return hingeConstraint.GetMotorSettings().mMaxTorqueLimit;
    }

    /**
     * Get hinge motor spring frequency.
     */
    getHingeJointMotorSpringFrequency(jointId: integer | string): float {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return 0;
      const hingeConstraint = Jolt.castObject(constraint, Jolt.HingeConstraint);
      return hingeConstraint.GetMotorSettings().mSpringSettings.mFrequency;
    }

    /**
     * Get hinge motor spring damping.
     */
    getHingeJointMotorSpringDamping(jointId: integer | string): float {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return 0;
      const hingeConstraint = Jolt.castObject(constraint, Jolt.HingeConstraint);
      return hingeConstraint.GetMotorSettings().mSpringSettings.mDamping;
    }

    // ==================== Slider Motor Queries ====================

    /**
     * Get the current target velocity of a slider joint motor (px/s).
     */
    getSliderJointMotorSpeed(jointId: integer | string): float {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return 0;
      const sliderConstraint = Jolt.castObject(
        constraint,
        Jolt.SliderConstraint
      );
      return sliderConstraint.GetTargetVelocity() * this._sharedData.worldScale;
    }

    /**
     * Get the current target position of a slider joint motor (px).
     */
    getSliderJointMotorTarget(jointId: integer | string): float {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return 0;
      const sliderConstraint = Jolt.castObject(
        constraint,
        Jolt.SliderConstraint
      );
      return sliderConstraint.GetTargetPosition() * this._sharedData.worldScale;
    }

    /**
     * Get the max friction force of a slider joint.
     */
    getSliderJointMaxFriction(jointId: integer | string): float {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return 0;
      const sliderConstraint = Jolt.castObject(
        constraint,
        Jolt.SliderConstraint
      );
      return sliderConstraint.GetMaxFrictionForce();
    }

    /**
     * Get slider motor minimum force limit.
     */
    getSliderJointMotorMinForce(jointId: integer | string): float {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return 0;
      const sliderConstraint = Jolt.castObject(
        constraint,
        Jolt.SliderConstraint
      );
      return sliderConstraint.GetMotorSettings().mMinForceLimit;
    }

    /**
     * Get slider motor maximum force limit.
     */
    getSliderJointMotorMaxForce(jointId: integer | string): float {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return 0;
      const sliderConstraint = Jolt.castObject(
        constraint,
        Jolt.SliderConstraint
      );
      return sliderConstraint.GetMotorSettings().mMaxForceLimit;
    }

    /**
     * Get slider motor spring frequency.
     */
    getSliderJointMotorSpringFrequency(jointId: integer | string): float {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return 0;
      const sliderConstraint = Jolt.castObject(
        constraint,
        Jolt.SliderConstraint
      );
      return sliderConstraint.GetMotorSettings().mSpringSettings.mFrequency;
    }

    /**
     * Get slider motor spring damping.
     */
    getSliderJointMotorSpringDamping(jointId: integer | string): float {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return 0;
      const sliderConstraint = Jolt.castObject(
        constraint,
        Jolt.SliderConstraint
      );
      return sliderConstraint.GetMotorSettings().mSpringSettings.mDamping;
    }

    // ================================================================
    // ==================== RAGDOLL AUTOMATION SYSTEM ==================
    // ================================================================

    // ==================== Group Management ====================

    /**
     * Create a new ragdoll group and store the ID in a variable.
     */
    createRagdollGroup(variable: gdjs.Variable): void {
      const id = this._sharedData.createRagdollGroup();
      variable.setNumber(id);
    }

    /**
     * Add this object's body to a ragdoll group.
     */
    addBodyToRagdollGroup(ragdollId: integer | string): void {
      this._sharedData.addBodyToRagdollGroup(ragdollId, this);
    }

    /**
     * Add a joint to a ragdoll group.
     */
    addJointToRagdollGroup(
      ragdollId: integer | string,
      jointId: integer | string
    ): void {
      this._sharedData.addJointToRagdollGroup(
        ragdollId,
        typeof jointId === 'string' ? parseInt(jointId, 10) : jointId
      );
    }

    /**
     * Remove a ragdoll group and all its joints.
     */
    removeRagdollGroup(ragdollId: integer | string): void {
      this._sharedData.removeRagdollGroup(ragdollId);
    }

    // ==================== Ragdoll Mode Switching ====================

    /**
     * Switch all bodies in a ragdoll group between Dynamic and Kinematic.
     * @param mode "Dynamic" or "Kinematic"
     */
    setRagdollMode(ragdollId: integer | string, mode: string): void {
      const group = this._sharedData.getRagdollGroup(ragdollId);
      if (!group) return;
      const normalizedMode = (mode || '').toLowerCase();
      const isKinematic = normalizedMode === 'kinematic';
      const motionType = isKinematic
        ? Jolt.EMotionType_Kinematic
        : Jolt.EMotionType_Dynamic;
      for (const behavior of group.bodyBehaviors) {
        const body = behavior._body;
        if (!body) continue;
        this._sharedData.bodyInterface.SetMotionType(
          body.GetID(),
          motionType,
          Jolt.EActivation_Activate
        );
        if (isKinematic) {
          // Freeze any residual energy when switching to animation-driven mode.
          this._sharedData.bodyInterface.SetLinearVelocity(
            body.GetID(),
            this._sharedData.getVec3(0, 0, 0)
          );
          this._sharedData.bodyInterface.SetAngularVelocity(
            body.GetID(),
            this._sharedData.getVec3(0, 0, 0)
          );
        } else {
          this._sharedData.bodyInterface.ActivateBody(body.GetID());
        }
        behavior.bodyType = isKinematic ? 'Kinematic' : 'Dynamic';
      }
      group.mode = isKinematic ? 'Kinematic' : 'Dynamic';
    }

    /**
     * Set preset ragdoll state for realistic simulation.
     * - "Active": Normal dynamic physics
     * - "Limp": High damping, no friction (unconscious/dead)
     * - "Stiff": High spring stiffness, high friction (muscle tension)
     * - "Frozen": Kinematic mode (animation-driven)
     */
    setRagdollState(ragdollId: integer | string, state: string): void {
      const group = this._sharedData.getRagdollGroup(ragdollId);
      if (!group) return;
      const normalizedState = (state || '').toLowerCase();

      if (normalizedState === 'frozen') {
        this.setRagdollMode(ragdollId, 'Kinematic');
        group.state = 'Frozen';
        return;
      }

      // Ensure dynamic mode for physics states
      this.setRagdollMode(ragdollId, 'Dynamic');

      if (normalizedState === 'limp') {
        // High damping, no friction => floppy ragdoll
        for (const behavior of group.bodyBehaviors) {
          behavior.setLinearDamping(2.0);
          behavior.setAngularDamping(2.0);
        }
        this._setRagdollJointsFriction(group, 0);
        this._setRagdollJointsSpring(group, 0, 0);
        group.state = 'Limp';
      } else if (normalizedState === 'stiff') {
        // Low damping, high spring, high friction => tense muscles
        for (const behavior of group.bodyBehaviors) {
          behavior.setLinearDamping(0.3);
          behavior.setAngularDamping(0.5);
        }
        this._setRagdollJointsFriction(group, 100);
        this._setRagdollJointsSpring(group, 10, 0.5);
        group.state = 'Stiff';
      } else {
        // "Active" - moderate values
        for (const behavior of group.bodyBehaviors) {
          behavior.setLinearDamping(0.5);
          behavior.setAngularDamping(0.5);
        }
        this._setRagdollJointsFriction(group, 5);
        this._setRagdollJointsSpring(group, 2, 0.3);
        group.state = 'Active';
      }
    }

    // ==================== Ragdoll Batch Controls ====================

    /**
     * Set linear and angular damping on ALL bodies in a ragdoll group.
     */
    setRagdollDamping(
      ragdollId: integer | string,
      linearDamping: float,
      angularDamping: float
    ): void {
      const group = this._sharedData.getRagdollGroup(ragdollId);
      if (!group) return;
      for (const behavior of group.bodyBehaviors) {
        behavior.setLinearDamping(Math.max(0, linearDamping));
        behavior.setAngularDamping(Math.max(0, angularDamping));
      }
    }

    /**
     * Set spring stiffness on ALL joints in a ragdoll group.
     */
    setRagdollStiffness(
      ragdollId: integer | string,
      frequency: float,
      damping: float
    ): void {
      const group = this._sharedData.getRagdollGroup(ragdollId);
      if (!group) return;
      this._setRagdollJointsSpring(
        group,
        Math.max(0, frequency),
        Math.max(0, damping)
      );
    }

    /**
     * Set friction on ALL joints in a ragdoll group.
     */
    setRagdollFriction(ragdollId: integer | string, friction: float): void {
      const group = this._sharedData.getRagdollGroup(ragdollId);
      if (!group) return;
      this._setRagdollJointsFriction(group, Math.max(0, friction));
    }

    /** Internal: set spring on all joints in a group */
    private _setRagdollJointsSpring(
      group: RagdollGroupData,
      frequency: float,
      damping: float
    ): void {
      const clampedFrequency = Math.max(0, frequency);
      const clampedDamping = Math.max(0, damping);
      for (const jointId of group.jointIds) {
        const constraint = this._sharedData.getJoint(jointId);
        if (!constraint) continue;
        const subType = constraint.GetSubType();
        try {
          const springSettings = new Jolt.SpringSettings();
          springSettings.mFrequency = clampedFrequency;
          springSettings.mDamping = clampedDamping;
          if (subType === Jolt.EConstraintSubType_Hinge) {
            Jolt.castObject(
              constraint,
              Jolt.HingeConstraint
            ).SetLimitsSpringSettings(springSettings);
          } else if (subType === Jolt.EConstraintSubType_Slider) {
            Jolt.castObject(
              constraint,
              Jolt.SliderConstraint
            ).SetLimitsSpringSettings(springSettings);
          } else if (subType === Jolt.EConstraintSubType_Distance) {
            Jolt.castObject(
              constraint,
              Jolt.DistanceConstraint
            ).SetLimitsSpringSettings(springSettings);
          }
          Jolt.destroy(springSettings);
        } catch (_e) {
          // Constraint type doesn't support springs, skip
        }
      }
    }

    /** Internal: set friction on all joints in a group */
    private _setRagdollJointsFriction(
      group: RagdollGroupData,
      friction: float
    ): void {
      for (const jointId of group.jointIds) {
        const constraint = this._sharedData.getJoint(jointId);
        if (!constraint) continue;
        try {
          const subType = constraint.GetSubType();
          if (subType === Jolt.EConstraintSubType_Hinge) {
            Jolt.castObject(
              constraint,
              Jolt.HingeConstraint
            ).SetMaxFrictionTorque(friction);
          } else if (subType === Jolt.EConstraintSubType_Slider) {
            Jolt.castObject(
              constraint,
              Jolt.SliderConstraint
            ).SetMaxFrictionForce(friction);
          } else if (subType === Jolt.EConstraintSubType_SwingTwist) {
            Jolt.castObject(
              constraint,
              Jolt.SwingTwistConstraint
            ).SetMaxFrictionTorque(friction);
          }
        } catch (_e) {
          // Constraint type doesn't support friction, skip
        }
      }
    }

    /**
     * Apply an impulse to ALL bodies in a ragdoll group (e.g. explosion or hit).
     */
    applyRagdollImpulse(
      ragdollId: integer | string,
      impulseX: float,
      impulseY: float,
      impulseZ: float
    ): void {
      const group = this._sharedData.getRagdollGroup(ragdollId);
      if (!group) return;
      const worldInvScale = this._sharedData.worldInvScale;
      for (const behavior of group.bodyBehaviors) {
        const body = behavior.getBody();
        if (!body) continue;
        this._sharedData.bodyInterface.AddImpulse(
          body.GetID(),
          this._sharedData.getVec3(
            impulseX * worldInvScale,
            impulseY * worldInvScale,
            impulseZ * worldInvScale
          )
        );
      }
    }

    /**
     * Set gravity scale on ALL bodies in a ragdoll group.
     */
    setRagdollGravityScale(
      ragdollId: integer | string,
      gravityScale: float
    ): void {
      const group = this._sharedData.getRagdollGroup(ragdollId);
      if (!group) return;
      for (const behavior of group.bodyBehaviors) {
        const body = behavior.getBody();
        if (!body) continue;
        this._sharedData.bodyInterface.SetGravityFactor(
          body.GetID(),
          gravityScale
        );
      }
    }

    // ==================== Ragdoll Queries ====================

    /**
     * Get the number of bodies in a ragdoll group.
     */
    getRagdollBodyCount(ragdollId: integer | string): integer {
      const group = this._sharedData.getRagdollGroup(ragdollId);
      return group ? group.bodyBehaviors.length : 0;
    }

    /**
     * Get the number of joints in a ragdoll group.
     */
    getRagdollJointCount(ragdollId: integer | string): integer {
      const group = this._sharedData.getRagdollGroup(ragdollId);
      return group ? group.jointIds.length : 0;
    }

    // ==================== Joint World Position Queries ====================

    /**
     * Get the world X position of a joint (midpoint of the two connected bodies).
     */
    getJointWorldX(jointId: integer | string): float {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return 0;
      const twoBody = Jolt.castObject(constraint, Jolt.TwoBodyConstraint);
      const pos1 = twoBody.GetBody1().GetCenterOfMassPosition();
      const pos2 = twoBody.GetBody2().GetCenterOfMassPosition();
      return ((pos1.GetX() + pos2.GetX()) / 2) * this._sharedData.worldScale;
    }

    /**
     * Get the world Y position of a joint (midpoint of the two connected bodies).
     */
    getJointWorldY(jointId: integer | string): float {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return 0;
      const twoBody = Jolt.castObject(constraint, Jolt.TwoBodyConstraint);
      const pos1 = twoBody.GetBody1().GetCenterOfMassPosition();
      const pos2 = twoBody.GetBody2().GetCenterOfMassPosition();
      return ((pos1.GetY() + pos2.GetY()) / 2) * this._sharedData.worldScale;
    }

    /**
     * Get the world Z position of a joint (midpoint of the two connected bodies).
     */
    getJointWorldZ(jointId: integer | string): float {
      const constraint = this._sharedData.getJoint(jointId);
      if (!constraint) return 0;
      const twoBody = Jolt.castObject(constraint, Jolt.TwoBodyConstraint);
      const pos1 = twoBody.GetBody1().GetCenterOfMassPosition();
      const pos2 = twoBody.GetBody2().GetCenterOfMassPosition();
      return ((pos1.GetZ() + pos2.GetZ()) / 2) * this._sharedData.worldScale;
    }

    // ==================== Humanoid Ragdoll Template ====================

    private _resolveRagdollPartBehavior(
      object: gdjs.RuntimeObject | null
    ): Physics3DRuntimeBehavior | null {
      if (!object) {
        return null;
      }
      const behavior = this._findPhysics3DBehaviorOnObject(object);
      if (
        !behavior ||
        !behavior.activated() ||
        behavior._sharedData !== this._sharedData
      ) {
        return null;
      }
      if (behavior._body === null && !behavior._createBody()) {
        return null;
      }
      return behavior;
    }

    private _computeLimbAxis(
      bodyA: Jolt.Body,
      bodyB: Jolt.Body,
      fallbackX: float,
      fallbackY: float,
      fallbackZ: float
    ): [float, float, float] {
      const posA = bodyA.GetCenterOfMassPosition();
      const posB = bodyB.GetCenterOfMassPosition();
      const [axisX, axisY, axisZ, length] = normalize3(
        posB.GetX() - posA.GetX(),
        posB.GetY() - posA.GetY(),
        posB.GetZ() - posA.GetZ()
      );
      if (length <= epsilon) {
        return [fallbackX, fallbackY, fallbackZ];
      }
      return [axisX, axisY, axisZ];
    }

    private _computePerpendicularAxis(
      axisX: float,
      axisY: float,
      axisZ: float
    ): [float, float, float] {
      // First try a cross product with world up.
      let normalX = axisZ;
      let normalY = 0;
      let normalZ = -axisX;
      let [nx, ny, nz, nLen] = normalize3(normalX, normalY, normalZ);
      if (nLen <= epsilon) {
        // Fallback if axis is parallel to world up.
        normalX = 0;
        normalY = -axisZ;
        normalZ = axisY;
        [nx, ny, nz, nLen] = normalize3(normalX, normalY, normalZ);
      }
      if (nLen <= epsilon) {
        return [1, 0, 0];
      }
      return [nx, ny, nz];
    }

    private _applyHumanoidMassDistribution(
      parts: Array<{
        role: string;
        behavior: Physics3DRuntimeBehavior;
        massRatio: float;
      }>
    ): void {
      if (parts.length === 0) {
        return;
      }

      let measuredTotalMass = 0;
      let sumRatios = 0;
      for (const part of parts) {
        sumRatios += part.massRatio;
        const body = part.behavior._body;
        if (!body || !body.IsDynamic()) {
          continue;
        }
        const invMass = body.GetMotionProperties().GetInverseMass();
        if (invMass > epsilon) {
          measuredTotalMass += 1 / invMass;
        }
      }
      if (sumRatios <= epsilon) {
        return;
      }
      const totalMass = measuredTotalMass > epsilon ? measuredTotalMass : 75;

      for (const part of parts) {
        const body = part.behavior._body;
        if (!body || !body.IsDynamic()) {
          continue;
        }
        const targetMass = Math.max(
          0.01,
          (totalMass * part.massRatio) / sumRatios
        );
        body.GetMotionProperties().ScaleToMass(targetMass);
        this._sharedData.bodyInterface.ActivateBody(body.GetID());
      }
    }

    private _configureHumanoidRagdollCollisionFiltering(
      ragdollId: number,
      parts: Array<{
        role: string;
        behavior: Physics3DRuntimeBehavior;
      }>
    ): void {
      if (parts.length === 0) {
        return;
      }

      const groupFilter = new Jolt.GroupFilterTable(parts.length);
      const roleToSubGroupId: { [role: string]: number } = {};
      for (let i = 0; i < parts.length; i++) {
        roleToSubGroupId[parts[i].role] = i;
      }

      const adjacentPairs: Array<[string, string]> = [
        ['Head', 'Chest'],
        ['Chest', 'Hips'],
        ['Chest', 'UpperArmL'],
        ['UpperArmL', 'LowerArmL'],
        ['Chest', 'UpperArmR'],
        ['UpperArmR', 'LowerArmR'],
        ['Hips', 'ThighL'],
        ['ThighL', 'ShinL'],
        ['Hips', 'ThighR'],
        ['ThighR', 'ShinR'],
      ];
      for (const [roleA, roleB] of adjacentPairs) {
        const subA = roleToSubGroupId[roleA];
        const subB = roleToSubGroupId[roleB];
        if (subA === undefined || subB === undefined) {
          continue;
        }
        groupFilter.DisableCollision(subA, subB);
      }

      this._sharedData.setRagdollCollisionFilter(ragdollId, groupFilter);
      for (let i = 0; i < parts.length; i++) {
        const body = parts[i].behavior._body;
        if (!body) {
          continue;
        }
        const collisionGroup = new Jolt.CollisionGroup(
          groupFilter,
          ragdollId,
          i
        );
        this._sharedData.bodyInterface.SetCollisionGroup(
          body.GetID(),
          collisionGroup
        );
        Jolt.destroy(collisionGroup);
      }
    }

    buildHumanoidRagdollFromTag(
      groupTag: string,
      variable: gdjs.Variable
    ): void {
      const normalizedTag = (groupTag || '').trim();
      if (!normalizedTag) {
        variable.setNumber(0);
        return;
      }

      const roleToObject: { [role: string]: gdjs.RuntimeObject | null } = {
        Head: null,
        Chest: null,
        Hips: null,
        UpperArmL: null,
        LowerArmL: null,
        UpperArmR: null,
        LowerArmR: null,
        ThighL: null,
        ShinL: null,
        ThighR: null,
        ShinR: null,
      };
      const allInstances = this.owner
        .getInstanceContainer()
        .getAdhocListOfAllInstances();
      for (const object of allInstances) {
        const behavior = this._findPhysics3DBehaviorOnObject(object);
        if (!behavior || behavior._sharedData !== this._sharedData) {
          continue;
        }
        if ((behavior.getRagdollGroupTag() || '').trim() !== normalizedTag) {
          continue;
        }
        const role = behavior.getRagdollRole();
        if (
          !role ||
          role === 'None' ||
          !roleToObject.hasOwnProperty(role) ||
          roleToObject[role] !== null
        ) {
          continue;
        }
        roleToObject[role] = object;
      }

      if (!roleToObject.Chest || !roleToObject.Hips) {
        // Chest and hips are the minimal core for a usable humanoid ragdoll.
        variable.setNumber(0);
        return;
      }

      this.buildHumanoidRagdoll(
        roleToObject.Head as unknown as gdjs.RuntimeObject,
        roleToObject.Chest as unknown as gdjs.RuntimeObject,
        roleToObject.Hips as unknown as gdjs.RuntimeObject,
        roleToObject.UpperArmL as unknown as gdjs.RuntimeObject,
        roleToObject.LowerArmL as unknown as gdjs.RuntimeObject,
        roleToObject.UpperArmR as unknown as gdjs.RuntimeObject,
        roleToObject.LowerArmR as unknown as gdjs.RuntimeObject,
        roleToObject.ThighL as unknown as gdjs.RuntimeObject,
        roleToObject.ShinL as unknown as gdjs.RuntimeObject,
        roleToObject.ThighR as unknown as gdjs.RuntimeObject,
        roleToObject.ShinR as unknown as gdjs.RuntimeObject,
        variable
      );
    }

    /**
     * Build a complete humanoid ragdoll from 11 body-part objects.
     * Automatically creates joints with appropriate types and weight distribution:
     * - Head -> Chest: Cone joint (neck)
     * - Chest -> Hips: Fixed joint (torso)
     * - Chest -> UpperArmL/R: SwingTwist (shoulders)
     * - UpperArmL/R -> LowerArmL/R: Hinge (elbows)
     * - Hips -> ThighL/R: SwingTwist (hips)
     * - ThighL/R -> ShinL/R: Hinge (knees)
     */
    buildHumanoidRagdoll(
      head: gdjs.RuntimeObject,
      chest: gdjs.RuntimeObject,
      hips: gdjs.RuntimeObject,
      upperArmL: gdjs.RuntimeObject,
      lowerArmL: gdjs.RuntimeObject,
      upperArmR: gdjs.RuntimeObject,
      lowerArmR: gdjs.RuntimeObject,
      thighL: gdjs.RuntimeObject,
      shinL: gdjs.RuntimeObject,
      thighR: gdjs.RuntimeObject,
      shinR: gdjs.RuntimeObject,
      variable: gdjs.Variable
    ): void {
      const partDefinitions: Array<{
        role: string;
        object: gdjs.RuntimeObject | null;
        massRatio: float;
      }> = [
        { role: 'Head', object: head, massRatio: 0.08 },
        { role: 'Chest', object: chest, massRatio: 0.35 },
        { role: 'Hips', object: hips, massRatio: 0.15 },
        { role: 'UpperArmL', object: upperArmL, massRatio: 0.04 },
        { role: 'LowerArmL', object: lowerArmL, massRatio: 0.03 },
        { role: 'UpperArmR', object: upperArmR, massRatio: 0.04 },
        { role: 'LowerArmR', object: lowerArmR, massRatio: 0.03 },
        { role: 'ThighL', object: thighL, massRatio: 0.08 },
        { role: 'ShinL', object: shinL, massRatio: 0.05 },
        { role: 'ThighR', object: thighR, massRatio: 0.08 },
        { role: 'ShinR', object: shinR, massRatio: 0.05 },
      ];

      const uniquePartBehaviors = new Set<integer>();
      const parts: Array<{
        role: string;
        behavior: Physics3DRuntimeBehavior;
        massRatio: float;
      }> = [];
      for (const partDefinition of partDefinitions) {
        const behavior = this._resolveRagdollPartBehavior(
          partDefinition.object
        );
        if (!behavior) {
          continue;
        }
        const uniqueId = behavior.owner.getUniqueId();
        if (uniquePartBehaviors.has(uniqueId)) {
          continue;
        }
        uniquePartBehaviors.add(uniqueId);
        parts.push({
          role: partDefinition.role,
          behavior,
          massRatio: partDefinition.massRatio,
        });
      }
      if (parts.length < 2) {
        variable.setNumber(0);
        return;
      }

      // Create the ragdoll group
      const ragdollId = this._sharedData.createRagdollGroup();
      variable.setNumber(ragdollId);

      const roleToBehavior: { [role: string]: Physics3DRuntimeBehavior } = {};
      for (const part of parts) {
        roleToBehavior[part.role] = part.behavior;
        this._sharedData.addBodyToRagdollGroup(ragdollId, part.behavior);
        this._sharedData.setRagdollBodyRole(
          ragdollId,
          part.behavior,
          part.role
        );
      }

      // Better physical distribution: keep total mass but redistribute per body-part.
      this._applyHumanoidMassDistribution(parts);

      const registerJoint = (
        jointId: number,
        stabilityPreset: 'Balanced' | 'Stable' | 'UltraStable' = 'Stable'
      ): number => {
        if (jointId <= 0) {
          return 0;
        }
        this._sharedData.addJointToRagdollGroup(ragdollId, jointId);
        this.setJointStabilityPreset(jointId, stabilityPreset);
        this.setJointPriority(jointId, 120);
        return jointId;
      };

      // Helper to create a joint between two body parts.
      const createHingeJoint = (
        behaviorA: Physics3DRuntimeBehavior,
        behaviorB: Physics3DRuntimeBehavior,
        minAngle: float,
        maxAngle: float
      ): number => {
        const bodyA = behaviorA.getBody()!;
        const bodyB = behaviorB.getBody()!;
        const existing = this._sharedData.findJointIdBetweenBodies(
          bodyA,
          bodyB,
          Jolt.EConstraintSubType_Hinge
        );
        if (existing !== 0) {
          return existing;
        }

        const settings = new Jolt.HingeConstraintSettings();
        settings.mSpace = Jolt.EConstraintSpace_WorldSpace;

        // Use midpoint between the two bodies
        const posA = bodyA.GetCenterOfMassPosition();
        const posB = bodyB.GetCenterOfMassPosition();
        const midX = (posA.GetX() + posB.GetX()) / 2;
        const midY = (posA.GetY() + posB.GetY()) / 2;
        const midZ = (posA.GetZ() + posB.GetZ()) / 2;
        settings.mPoint1 = this._sharedData.getRVec3(midX, midY, midZ);
        settings.mPoint2 = this._sharedData.getRVec3(midX, midY, midZ);

        const [axisX, axisY, axisZ] = this._computeLimbAxis(
          bodyA,
          bodyB,
          0,
          -1,
          0
        );
        const [normalX, normalY, normalZ] = this._computePerpendicularAxis(
          axisX,
          axisY,
          axisZ
        );
        settings.mHingeAxis1 = this._sharedData.getVec3(axisX, axisY, axisZ);
        settings.mHingeAxis2 = this._sharedData.getVec3(axisX, axisY, axisZ);
        settings.mNormalAxis1 = this._sharedData.getVec3(
          normalX,
          normalY,
          normalZ
        );
        settings.mNormalAxis2 = this._sharedData.getVec3(
          normalX,
          normalY,
          normalZ
        );
        const minLimit = Math.min(minAngle, maxAngle);
        const maxLimit = Math.max(minAngle, maxAngle);
        settings.mLimitsMin = gdjs.toRad(minLimit);
        settings.mLimitsMax = gdjs.toRad(maxLimit);

        // @ts-ignore - Create exists on TwoBodyConstraintSettings WASM
        const constraint = settings.Create(bodyA, bodyB);
        Jolt.destroy(settings);
        return this._sharedData.addJoint(constraint);
      };

      const createSwingTwistJoint = (
        behaviorA: Physics3DRuntimeBehavior,
        behaviorB: Physics3DRuntimeBehavior,
        normalHalfConeAngle: float,
        planeHalfConeAngle: float,
        twistMin: float,
        twistMax: float
      ): number => {
        const bodyA = behaviorA.getBody()!;
        const bodyB = behaviorB.getBody()!;
        const existing = this._sharedData.findJointIdBetweenBodies(
          bodyA,
          bodyB,
          Jolt.EConstraintSubType_SwingTwist
        );
        if (existing !== 0) {
          return existing;
        }

        const settings = new Jolt.SwingTwistConstraintSettings();
        settings.mSpace = Jolt.EConstraintSpace_WorldSpace;

        const posA = bodyA.GetCenterOfMassPosition();
        const posB = bodyB.GetCenterOfMassPosition();
        const midX = (posA.GetX() + posB.GetX()) / 2;
        const midY = (posA.GetY() + posB.GetY()) / 2;
        const midZ = (posA.GetZ() + posB.GetZ()) / 2;
        settings.mPosition1 = this._sharedData.getRVec3(midX, midY, midZ);
        settings.mPosition2 = this._sharedData.getRVec3(midX, midY, midZ);

        const [twistAxisX, twistAxisY, twistAxisZ] = this._computeLimbAxis(
          bodyA,
          bodyB,
          0,
          -1,
          0
        );
        const [planeAxisX, planeAxisY, planeAxisZ] =
          this._computePerpendicularAxis(twistAxisX, twistAxisY, twistAxisZ);
        settings.mTwistAxis1 = this._sharedData.getVec3(
          twistAxisX,
          twistAxisY,
          twistAxisZ
        );
        settings.mTwistAxis2 = this._sharedData.getVec3(
          twistAxisX,
          twistAxisY,
          twistAxisZ
        );
        settings.mPlaneAxis1 = this._sharedData.getVec3(
          planeAxisX,
          planeAxisY,
          planeAxisZ
        );
        settings.mPlaneAxis2 = this._sharedData.getVec3(
          planeAxisX,
          planeAxisY,
          planeAxisZ
        );
        settings.mNormalHalfConeAngle = gdjs.toRad(normalHalfConeAngle);
        settings.mPlaneHalfConeAngle = gdjs.toRad(planeHalfConeAngle);
        const minTwist = Math.min(twistMin, twistMax);
        const maxTwist = Math.max(twistMin, twistMax);
        settings.mTwistMinAngle = gdjs.toRad(minTwist);
        settings.mTwistMaxAngle = gdjs.toRad(maxTwist);

        // @ts-ignore - Create exists on TwoBodyConstraintSettings WASM
        const constraint = settings.Create(bodyA, bodyB);
        Jolt.destroy(settings);
        return this._sharedData.addJoint(constraint);
      };

      const createConeJoint = (
        behaviorA: Physics3DRuntimeBehavior,
        behaviorB: Physics3DRuntimeBehavior,
        halfAngle: float
      ): number => {
        const bodyA = behaviorA.getBody()!;
        const bodyB = behaviorB.getBody()!;
        const existing = this._sharedData.findJointIdBetweenBodies(
          bodyA,
          bodyB,
          Jolt.EConstraintSubType_Cone
        );
        if (existing !== 0) {
          return existing;
        }

        const settings = new Jolt.ConeConstraintSettings();
        settings.mSpace = Jolt.EConstraintSpace_WorldSpace;

        const posA = bodyA.GetCenterOfMassPosition();
        const posB = bodyB.GetCenterOfMassPosition();
        const midX = (posA.GetX() + posB.GetX()) / 2;
        const midY = (posA.GetY() + posB.GetY()) / 2;
        const midZ = (posA.GetZ() + posB.GetZ()) / 2;
        settings.mPoint1 = this._sharedData.getRVec3(midX, midY, midZ);
        settings.mPoint2 = this._sharedData.getRVec3(midX, midY, midZ);

        const [twistAxisX, twistAxisY, twistAxisZ] = this._computeLimbAxis(
          bodyA,
          bodyB,
          0,
          1,
          0
        );
        settings.mTwistAxis1 = this._sharedData.getVec3(
          twistAxisX,
          twistAxisY,
          twistAxisZ
        );
        settings.mTwistAxis2 = this._sharedData.getVec3(
          twistAxisX,
          twistAxisY,
          twistAxisZ
        );
        settings.mHalfConeAngle = gdjs.toRad(
          Math.max(0, Math.min(179.0, halfAngle))
        );

        // @ts-ignore - Create exists on TwoBodyConstraintSettings WASM
        const constraint = settings.Create(bodyA, bodyB);
        Jolt.destroy(settings);
        return this._sharedData.addJoint(constraint);
      };

      const createFixedJoint = (
        behaviorA: Physics3DRuntimeBehavior,
        behaviorB: Physics3DRuntimeBehavior
      ): number => {
        const bodyA = behaviorA.getBody()!;
        const bodyB = behaviorB.getBody()!;
        const existing = this._sharedData.findJointIdBetweenBodies(
          bodyA,
          bodyB,
          Jolt.EConstraintSubType_Fixed
        );
        if (existing !== 0) {
          return existing;
        }

        const settings = new Jolt.FixedConstraintSettings();
        settings.mAutoDetectPoint = true;
        settings.mSpace = Jolt.EConstraintSpace_WorldSpace;
        // @ts-ignore - Create exists on TwoBodyConstraintSettings WASM
        const constraint = settings.Create(bodyA, bodyB);
        Jolt.destroy(settings);
        return this._sharedData.addJoint(constraint);
      };

      const headB = roleToBehavior.Head || null;
      const chestB = roleToBehavior.Chest || null;
      const hipsB = roleToBehavior.Hips || null;
      const upperArmLB = roleToBehavior.UpperArmL || null;
      const lowerArmLB = roleToBehavior.LowerArmL || null;
      const upperArmRB = roleToBehavior.UpperArmR || null;
      const lowerArmRB = roleToBehavior.LowerArmR || null;
      const thighLB = roleToBehavior.ThighL || null;
      const shinLB = roleToBehavior.ShinL || null;
      const thighRB = roleToBehavior.ThighR || null;
      const shinRB = roleToBehavior.ShinR || null;

      // Create all joints and register them to the ragdoll group.
      if (headB && chestB && headB.getBody() && chestB.getBody()) {
        // Neck: Cone joint with controlled movement.
        const jId = registerJoint(createConeJoint(headB, chestB, 35), 'Stable');
        if (jId) {
          this.setJointPriority(jId, 140);
        }
      }
      if (chestB && hipsB && chestB.getBody() && hipsB.getBody()) {
        // Torso: Fixed core, very stable.
        registerJoint(createFixedJoint(chestB, hipsB), 'UltraStable');
      }
      if (chestB && upperArmLB && chestB.getBody() && upperArmLB.getBody()) {
        // Left shoulder: SwingTwist.
        const jId = registerJoint(
          createSwingTwistJoint(chestB, upperArmLB, 65, 50, -70, 70),
          'Stable'
        );
        if (jId) {
          this.setJointSolverOverrides(jId, 10, 5);
        }
      }
      if (
        upperArmLB &&
        lowerArmLB &&
        upperArmLB.getBody() &&
        lowerArmLB.getBody()
      ) {
        // Left elbow: Hinge (one-way bend).
        const jId = registerJoint(
          createHingeJoint(upperArmLB, lowerArmLB, 0, 145),
          'Stable'
        );
        if (jId) {
          this.setHingeJointMaxFriction(jId, 20);
        }
      }
      if (chestB && upperArmRB && chestB.getBody() && upperArmRB.getBody()) {
        // Right shoulder: SwingTwist.
        const jId = registerJoint(
          createSwingTwistJoint(chestB, upperArmRB, 65, 50, -70, 70),
          'Stable'
        );
        if (jId) {
          this.setJointSolverOverrides(jId, 10, 5);
        }
      }
      if (
        upperArmRB &&
        lowerArmRB &&
        upperArmRB.getBody() &&
        lowerArmRB.getBody()
      ) {
        // Right elbow: Hinge (one-way bend).
        const jId = registerJoint(
          createHingeJoint(upperArmRB, lowerArmRB, 0, 145),
          'Stable'
        );
        if (jId) {
          this.setHingeJointMaxFriction(jId, 20);
        }
      }
      if (hipsB && thighLB && hipsB.getBody() && thighLB.getBody()) {
        // Left hip: SwingTwist.
        const jId = registerJoint(
          createSwingTwistJoint(hipsB, thighLB, 55, 40, -35, 35),
          'Stable'
        );
        if (jId) {
          this.setJointSolverOverrides(jId, 10, 5);
        }
      }
      if (thighLB && shinLB && thighLB.getBody() && shinLB.getBody()) {
        // Left knee: Hinge.
        const jId = registerJoint(
          createHingeJoint(thighLB, shinLB, 0, 145),
          'Stable'
        );
        if (jId) {
          this.setHingeJointMaxFriction(jId, 25);
        }
      }
      if (hipsB && thighRB && hipsB.getBody() && thighRB.getBody()) {
        // Right hip: SwingTwist.
        const jId = registerJoint(
          createSwingTwistJoint(hipsB, thighRB, 55, 40, -35, 35),
          'Stable'
        );
        if (jId) {
          this.setJointSolverOverrides(jId, 10, 5);
        }
      }
      if (thighRB && shinRB && thighRB.getBody() && shinRB.getBody()) {
        // Right knee: Hinge.
        const jId = registerJoint(
          createHingeJoint(thighRB, shinRB, 0, 145),
          'Stable'
        );
        if (jId) {
          this.setHingeJointMaxFriction(jId, 25);
        }
      }

      this._configureHumanoidRagdollCollisionFiltering(
        ragdollId,
        parts.map((part) => ({ role: part.role, behavior: part.behavior }))
      );

      // ===== Start in "Frozen" state (kinematic) =====
      this.setRagdollState(ragdollId, 'Frozen');
    }
  }

  gdjs.registerBehavior(
    'Physics3D::Physics3DBehavior',
    gdjs.Physics3DRuntimeBehavior
  );

  /** @category Behaviors > Physics 3D */
  export namespace Physics3DRuntimeBehavior {
    /**
     * Allow extensions relying on the 3D physics to customize its
     * behavior a bit.
     */
    export interface Physics3DHook {
      /**
       * Called before the physics engine step.
       */
      doBeforePhysicsStep(timeDelta: float): void;
    }

    export interface BodyUpdater {
      createAndAddBody(): Jolt.Body | null;
      updateObjectFromBody(): void;
      updateBodyFromObject(): void;
      recreateShape(): void;
      destroyBody(): void;
    }

    export class DefaultBodyUpdater
      implements gdjs.Physics3DRuntimeBehavior.BodyUpdater
    {
      behavior: gdjs.Physics3DRuntimeBehavior;

      constructor(behavior: gdjs.Physics3DRuntimeBehavior) {
        this.behavior = behavior;
      }

      createAndAddBody(): Jolt.Body | null {
        const { behavior } = this;
        const { _sharedData } = behavior;

        const shape = behavior.createShape();
        const bodyCreationSettings = new Jolt.BodyCreationSettings(
          shape,
          behavior._getPhysicsPosition(_sharedData.getRVec3(0, 0, 0)),
          behavior._getPhysicsRotation(_sharedData.getQuat(0, 0, 0, 1)),
          behavior.bodyType === 'Static'
            ? Jolt.EMotionType_Static
            : behavior.bodyType === 'Kinematic'
              ? Jolt.EMotionType_Kinematic
              : Jolt.EMotionType_Dynamic,
          behavior.getBodyLayer()
        );
        bodyCreationSettings.mMotionQuality = behavior.bullet
          ? Jolt.EMotionQuality_LinearCast
          : Jolt.EMotionQuality_Discrete;
        bodyCreationSettings.mAllowedDOFs = behavior.fixedRotation
          ? Jolt.EAllowedDOFs_TranslationX |
            Jolt.EAllowedDOFs_TranslationY |
            Jolt.EAllowedDOFs_TranslationZ
          : Jolt.EAllowedDOFs_All;
        bodyCreationSettings.mFriction = behavior.friction;
        bodyCreationSettings.mRestitution = behavior.restitution;
        bodyCreationSettings.mLinearDamping = behavior.linearDamping;
        bodyCreationSettings.mAngularDamping = behavior.angularDamping;
        bodyCreationSettings.mGravityFactor = behavior.gravityScale;
        if (behavior.massOverride > 0) {
          bodyCreationSettings.mOverrideMassProperties =
            Jolt.EOverrideMassProperties_CalculateInertia;
          bodyCreationSettings.mMassPropertiesOverride.mMass =
            behavior.massOverride;
        }

        const bodyInterface = _sharedData.bodyInterface;
        const body = bodyInterface.CreateBody(bodyCreationSettings);
        Jolt.destroy(bodyCreationSettings);

        bodyInterface.AddBody(body.GetID(), Jolt.EActivation_Activate);
        return body;
      }

      updateObjectFromBody() {
        const { behavior } = this;
        const { _body } = behavior;
        // Copy transform from body to the GD object.
        // The body is null when the behavior was either deactivated or the object deleted.
        // It would be useless to try to recreate it as updateBodyFromObject already does it.
        // If the body is null, we just don't do anything
        // (but still run the physics simulation - this is independent).
        if (_body !== null && _body.IsActive()) {
          behavior._moveObjectToPhysicsPosition(_body.GetPosition());
          behavior._moveObjectToPhysicsRotation(_body.GetRotation());
        }
      }

      updateBodyFromObject() {
        const { behavior } = this;
        const { owner3D, _sharedData } = behavior;
        if (behavior._body === null) {
          if (!behavior._createBody()) return;
        }
        const body = behavior._body!;

        if (
          this.behavior._objectOldX !== owner3D.getX() ||
          this.behavior._objectOldY !== owner3D.getY() ||
          this.behavior._objectOldZ !== owner3D.getZ() ||
          this.behavior._objectOldRotationX !== owner3D.getRotationX() ||
          this.behavior._objectOldRotationY !== owner3D.getRotationY() ||
          this.behavior._objectOldRotationZ !== owner3D.getAngle()
        ) {
          _sharedData.bodyInterface.SetPositionAndRotationWhenChanged(
            body.GetID(),
            this.behavior._getPhysicsPosition(_sharedData.getRVec3(0, 0, 0)),
            this.behavior._getPhysicsRotation(_sharedData.getQuat(0, 0, 0, 1)),
            Jolt.EActivation_Activate
          );
        }
      }

      recreateShape() {
        const { behavior } = this;
        const { _sharedData } = behavior;
        if (behavior._body === null) {
          if (!behavior._createBody()) return;
        }
        const body = behavior._body!;

        const bodyInterface = _sharedData.bodyInterface;
        bodyInterface.SetShape(
          body.GetID(),
          behavior.createShape(),
          true,
          Jolt.EActivation_Activate
        );
      }

      destroyBody() {
        const { behavior } = this;
        const { _sharedData } = behavior;
        if (behavior._body !== null) {
          _sharedData.bodyInterface.RemoveBody(behavior._body.GetID());
          _sharedData.bodyInterface.DestroyBody(behavior._body.GetID());
          behavior._body = null;
        }
      }
    }

    export interface CollisionChecker {
      isColliding(object: gdjs.RuntimeObject): boolean;
      hasCollisionStartedWith(object: gdjs.RuntimeObject): boolean;
      hasCollisionStoppedWith(object: gdjs.RuntimeObject): boolean;
    }

    /**
     * The default collision checker uses the contacts found while
     * stepping the physics simulation. For characters, another one is used
     * as characters are simulated before the rest of the physics simulation.
     */
    export class DefaultCollisionChecker implements CollisionChecker {
      behavior: gdjs.Physics3DRuntimeBehavior;

      constructor(behavior: gdjs.Physics3DRuntimeBehavior) {
        this.behavior = behavior;
      }

      isColliding(object: gdjs.RuntimeObject): boolean {
        if (
          this.behavior._currentContacts.some(
            (behavior) => behavior.owner === object
          )
        ) {
          return true;
        }
        return this.behavior._contactsStartedThisFrame.some(
          (behavior) => behavior.owner === object
        );
      }

      hasCollisionStartedWith(object: gdjs.RuntimeObject): boolean {
        return this.behavior._contactsStartedThisFrame.some(
          (behavior) => behavior.owner === object
        );
      }

      hasCollisionStoppedWith(object: gdjs.RuntimeObject): boolean {
        return this.behavior._contactsEndedThisFrame.some(
          (behavior) => behavior.owner === object
        );
      }
    }
  }
}
