/// <reference path="./jolt-physics.d.ts" />

namespace Jolt {
  export interface Body {
    gdjsAssociatedBehavior: gdjs.Physics3DRuntimeBehavior | null;
  }
}

namespace gdjs {
  gdjs.registerAsynchronouslyLoadingLibraryPromise(
    new Promise((resolve) => {
      const tryInitializeJoltPhysics = () => {
        // @ts-ignore
        if (global.initializeJoltPhysics) {
          resolve(
            // @ts-ignore
            global.initializeJoltPhysics().then((Jolt: any) => {
              window.Jolt = Jolt;
            })
          );
          return;
        }
        // Jolt is not ready yet, wait another 200ms
        setTimeout(tryInitializeJoltPhysics, 200);
      };
      tryInitializeJoltPhysics();
    })
  );

  export interface RuntimeScene {
    physics3DSharedData: gdjs.Physics3DSharedData | null;
  }
  interface Physics3DNetworkSyncDataType {
    tpx: number | undefined;
    tpy: number | undefined;
    tqa: number | undefined;
    lvx: number | undefined;
    lvy: number | undefined;
    av: number | undefined;
    aw: boolean | undefined;
    layers: number;
    masks: number;
  }

  export interface Physics3DNetworkSyncData extends BehaviorNetworkSyncData {
    props: Physics3DNetworkSyncDataType;
  }

  // https://github.com/jrouwe/JoltPhysics.js/blob/main/Examples/js/example.js
  const LAYER_NON_MOVING = 0;
  const LAYER_MOVING = 1;
  const NUM_OBJECT_LAYERS = 2;

  const setupCollisionFiltering = (settings: Jolt.JoltSettings) => {
    // Layer that objects can be in, determines which other objects it can collide with
    // Typically you at least want to have 1 layer for moving bodies and 1 layer for static bodies, but you can have more
    // layers if you want. E.g. you could have a layer for high detail collision (which is not used by the physics simulation
    // but only if you do collision testing).
    let objectFilter = new Jolt.ObjectLayerPairFilterTable(NUM_OBJECT_LAYERS);
    objectFilter.EnableCollision(LAYER_NON_MOVING, LAYER_MOVING);
    objectFilter.EnableCollision(LAYER_MOVING, LAYER_MOVING);

    // Each broadphase layer results in a separate bounding volume tree in the broad phase. You at least want to have
    // a layer for non-moving and moving objects to avoid having to update a tree full of static objects every frame.
    // You can have a 1-on-1 mapping between object layers and broadphase layers (like in this case) but if you have
    // many object layers you'll be creating many broad phase trees, which is not efficient.
    const BP_LAYER_NON_MOVING = new Jolt.BroadPhaseLayer(0);
    const BP_LAYER_MOVING = new Jolt.BroadPhaseLayer(1);
    const NUM_BROAD_PHASE_LAYERS = 2;
    let bpInterface = new Jolt.BroadPhaseLayerInterfaceTable(
      NUM_OBJECT_LAYERS,
      NUM_BROAD_PHASE_LAYERS
    );
    bpInterface.MapObjectToBroadPhaseLayer(
      LAYER_NON_MOVING,
      BP_LAYER_NON_MOVING
    );
    bpInterface.MapObjectToBroadPhaseLayer(LAYER_MOVING, BP_LAYER_MOVING);

    settings.mObjectLayerPairFilter = objectFilter;
    settings.mBroadPhaseLayerInterface = bpInterface;
    settings.mObjectVsBroadPhaseLayerFilter =
      new Jolt.ObjectVsBroadPhaseLayerFilterTable(
        settings.mBroadPhaseLayerInterface,
        NUM_BROAD_PHASE_LAYERS,
        settings.mObjectLayerPairFilter,
        NUM_OBJECT_LAYERS
      );
  };

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
    behaviorsByBodyID = new Map<number, gdjs.Physics3DRuntimeBehavior>();
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

    constructor(instanceContainer: gdjs.RuntimeInstanceContainer, sharedData) {
      this._registeredBehaviors = new Set<Physics3DRuntimeBehavior>();
      this.gravityX = sharedData.gravityX;
      this.gravityY = sharedData.gravityY;
      this.gravityZ = sharedData.gravityZ;
      this.worldScale = sharedData.worldScale;
      this.worldInvScale = 1 / this.worldScale;

      // Initialize Jolt
      const settings = new Jolt.JoltSettings();
      setupCollisionFiltering(settings);
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

        // Get associated behaviors
        const behaviorA = bodyA.gdjsAssociatedBehavior;
        const behaviorB = bodyB.gdjsAssociatedBehavior;

        if (!behaviorA || !behaviorB) {
          return;
        }

        behaviorA.onContactBegin(behaviorB);
        behaviorB.onContactBegin(behaviorA);
        this.behaviorsByBodyID.set(
          bodyA.GetID().GetIndexAndSequenceNumber(),
          behaviorA
        );
        this.behaviorsByBodyID.set(
          bodyB.GetID().GetIndexAndSequenceNumber(),
          behaviorB
        );
      };
      this.contactListener.OnContactRemoved = (
        subShapePairPtr: number
      ): void => {
        const subShapePair = Jolt.wrapPointer(
          subShapePairPtr,
          Jolt.SubShapeIDPair
        );

        const behaviorA = this.behaviorsByBodyID.get(
          subShapePair.GetBody1ID().GetIndexAndSequenceNumber()
        );
        const behaviorB = this.behaviorsByBodyID.get(
          subShapePair.GetBody2ID().GetIndexAndSequenceNumber()
        );
        if (!behaviorA || !behaviorB) {
          return;
        }
        behaviorA.onContactEnd(behaviorB);
        behaviorB.onContactEnd(behaviorA);
      };
      this.contactListener.OnContactPersisted = (
        inBody1: number,
        inBody2: number,
        inManifold: number,
        ioSettings: number
      ): void => {};
      this.contactListener.OnContactValidate = (
        inBody1: number,
        inBody2: number,
        inBaseOffset: number,
        inCollisionResult: number
      ): number => {
        return Jolt.ValidateResult_AcceptAllContactsForThisBodyPair;
      };
    }

    private getVec3(x: float, y: float, z: float): Jolt.Vec3 {
      const tempVec3 = this._tempVec3;
      tempVec3.Set(x, y, z);
      return tempVec3;
    }

    static getSharedData(
      runtimeScene: gdjs.RuntimeScene,
      behaviorName: string
    ): gdjs.Physics3DSharedData {
      // Create one if needed
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
     * Reset all contactsStartedThisFrame and contactsEndedThisFrame of all
     * registered physics behavior.
     */
    resetStartedAndEndedCollisions(): void {
      for (const physicsBehavior of this._registeredBehaviors) {
        physicsBehavior.contactsStartedThisFrame.length = 0;
        physicsBehavior.contactsEndedThisFrame.length = 0;
      }
      this.behaviorsByBodyID.clear();
    }

    /**
     * Update all registered body.
     */
    updateBodiesFromObjects(): void {
      for (const physicsBehavior of this._registeredBehaviors) {
        physicsBehavior.updateBodyFromObject();
      }
    }

    step(deltaTime: float): void {
      // When running below 55 Hz, do 2 steps instead of 1
      const numSteps = deltaTime > 1.0 / 55.0 ? 2 : 1;

      // Step the physics world
      this.jolt.Step(deltaTime, numSteps);
      this.stepped = true;
    }
  }
  gdjs.registerRuntimeSceneUnloadedCallback(function (runtimeScene) {
    const physics3DSharedData = runtimeScene.physics3DSharedData;
    if (physics3DSharedData) {
      Jolt.destroy(physics3DSharedData.jolt);
      Jolt.destroy(physics3DSharedData.contactListener);
      Jolt.destroy(physics3DSharedData._tempVec3);
      Jolt.destroy(physics3DSharedData._tempRVec3);
      Jolt.destroy(physics3DSharedData._tempQuat);
      runtimeScene.physics3DSharedData = null;
    }
  });

  export class Physics3DRuntimeBehavior extends gdjs.RuntimeBehavior {
    owner3D: gdjs.RuntimeObject3D;

    bodyType: string;
    bullet: boolean;
    fixedRotation: boolean;
    shape: string;
    shapeDimensionA: any;
    shapeDimensionB: any;
    shapeDimensionC: any;
    shapeOffsetX: float;
    shapeOffsetY: float;
    shapeOffsetZ: float;
    density: float;
    friction: float;
    restitution: float;
    linearDamping: float;
    angularDamping: float;
    gravityScale: float;
    shapeScale: number = 1;

    /**
     * Array containing the beginning of contacts reported by onContactBegin. Each contact
     * should be unique to avoid recording glitches where the object loses and regain
     * contact between two frames. The array is updated each time the method
     * onContactBegin is called by the listener, which is only called when stepping
     * the world i.e. in the first preEvent called by a physics behavior. This array is
     * cleared just before stepping the world.
     */
    contactsStartedThisFrame: Array<Physics3DRuntimeBehavior> = [];

    /**
     * Array containing the end of contacts reported by onContactEnd. The array is updated
     * each time the method onContactEnd is called by the listener, which can be called at
     * any time. This array is cleared just before stepping the world.
     */
    contactsEndedThisFrame: Array<Physics3DRuntimeBehavior> = [];

    /**
     * Array containing the exact current contacts with the objects. It is updated
     * each time the methods onContactBegin and onContactEnd are called by the contact
     * listener.
     */
    currentContacts: Array<Physics3DRuntimeBehavior> = [];

    destroyedDuringFrameLogic: boolean;
    _body: Jolt.Body | null = null;

    /**
     * sharedData is a reference to the shared data of the scene, that registers
     * every physics behavior that is created so that collisions can be cleared
     * before stepping the world.
     */
    _sharedData: Physics3DSharedData;

    _objectOldX: number = 0;
    _objectOldY: number = 0;
    _objectOldZ: number = 0;
    _objectOldRotationX: float = 0;
    _objectOldRotationY: float = 0;
    _objectOldRotationZ: float = 0;
    _objectOldWidth: float = 0;
    _objectOldHeight: float = 0;
    _objectOldDepth: float = 0;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      behaviorData,
      owner: gdjs.RuntimeObject3D
    ) {
      super(instanceContainer, behaviorData, owner);
      this.owner3D = owner;
      this.bodyType = behaviorData.bodyType;
      this.bullet = behaviorData.bullet;
      this.fixedRotation = behaviorData.fixedRotation;
      this.shape = behaviorData.shape;
      this.shapeDimensionA = behaviorData.shapeDimensionA;
      this.shapeDimensionB = behaviorData.shapeDimensionB;
      this.shapeDimensionC = behaviorData.shapeDimensionC;
      this.shapeOffsetX = behaviorData.shapeOffsetX;
      this.shapeOffsetY = behaviorData.shapeOffsetY;
      this.shapeOffsetZ = behaviorData.shapeOffsetZ;
      this.density = behaviorData.density;
      this.friction = behaviorData.friction;
      this.restitution = behaviorData.restitution;
      this.linearDamping = Math.max(0, behaviorData.linearDamping);
      this.angularDamping = Math.max(0, behaviorData.angularDamping);
      this.gravityScale = behaviorData.gravityScale;
      this.destroyedDuringFrameLogic = false;
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

    updateFromBehaviorData(oldBehaviorData, newBehaviorData): boolean {
      return true;
    }

    getNetworkSyncData(): Physics2NetworkSyncData {
      return super.getNetworkSyncData();
    }

    updateFromNetworkSyncData(networkSyncData: Physics2NetworkSyncData) {
      super.updateFromNetworkSyncData(networkSyncData);
    }

    onDeActivate() {
      this._sharedData.removeFromBehaviorsList(this);
      if (this._body !== null) {
        // TODO
        // // When a body is deleted, Box2D removes automatically its joints, leaving an invalid pointer in our joints list
        // this._sharedData.clearBodyJoints(this._body);

        this._sharedData.bodyInterface.RemoveBody(this._body.GetID());
        this._sharedData.bodyInterface.DestroyBody(this._body.GetID());
        this._body = null;
      }
      this.contactsEndedThisFrame.length = 0;
      this.contactsStartedThisFrame.length = 0;
      this.currentContacts.length = 0;
    }

    onActivate() {
      this._sharedData.addToBehaviorsList(this);

      this.contactsEndedThisFrame.length = 0;
      this.contactsStartedThisFrame.length = 0;
      this.currentContacts.length = 0;
      this.updateBodyFromObject();
    }

    onDestroy() {
      this.destroyedDuringFrameLogic = true;
      this.onDeActivate();
    }

    createShape(): Jolt.Shape {
      const width = this.owner3D.getWidth() * this._sharedData.worldInvScale;
      const height = this.owner3D.getHeight() * this._sharedData.worldInvScale;
      const depth = this.owner3D.getDepth() * this._sharedData.worldInvScale;

      const shapeScale = this.shapeScale * this._sharedData.worldInvScale;

      const shapeOffsetX = this.shapeOffsetX * shapeScale;
      const shapeOffsetY = this.shapeOffsetY * shapeScale;
      const shapeOffsetZ = this.shapeOffsetZ * shapeScale;

      const shapeDimensionA = this.shapeDimensionA * shapeScale;
      const shapeDimensionB = this.shapeDimensionB * shapeScale;
      const shapeDimensionC = this.shapeDimensionC * shapeScale;

      const onePixel = this._sharedData.worldInvScale;

      // TODO Handle other shape types.
      let shapeSettings: Jolt.ConvexShapeSettings;
      /** This is fine only because no other Quat is used locally. */
      let quat: Jolt.Quat;
      if (this.shape === 'Box') {
        const boxWidth =
          shapeDimensionA > 0 ? shapeDimensionA : width > 0 ? width : onePixel;
        const boxHeight =
          shapeDimensionB > 0
            ? shapeDimensionB
            : height > 0
            ? height
            : onePixel;
        const boxDepth =
          shapeDimensionC > 0 ? shapeDimensionC : depth > 0 ? depth : onePixel;

        shapeSettings = new Jolt.BoxShapeSettings(
          this.getVec3(boxWidth / 2, boxHeight / 2, boxDepth / 2),
          onePixel
        );
        quat = this.getQuat(0, 0, 0, 1);
      } else if (this.shape === 'Capsule') {
        const radius =
          shapeDimensionA > 0
            ? shapeDimensionA
            : width > 0
            ? Math.sqrt(((width / 2) * height) / 2)
            : onePixel;
        const capsuleDepth =
          shapeDimensionB > 0 ? shapeDimensionB : depth > 0 ? depth : onePixel;
        shapeSettings = new Jolt.CapsuleShapeSettings(capsuleDepth / 2, radius);
        // Top on Z axis.
        quat = this.getQuat(-Math.sqrt(2) / 2, 0, 0, Math.sqrt(2) / 2);
      } else if (this.shape === 'Cylinder') {
        const radius =
          shapeDimensionA > 0
            ? shapeDimensionA
            : width > 0
            ? Math.sqrt(((width / 2) * height) / 2)
            : onePixel;
        const cylinderDepth =
          shapeDimensionB > 0 ? shapeDimensionB : depth > 0 ? depth : onePixel;
        shapeSettings = new Jolt.CylinderShapeSettings(
          cylinderDepth / 2,
          radius,
          onePixel
        );
        // Top on Z axis.
        quat = this.getQuat(-Math.sqrt(2) / 2, 0, 0, Math.sqrt(2) / 2);
      } else {
        // Create a 'Sphere' by default.
        const radius =
          shapeDimensionA > 0
            ? shapeDimensionA
            : width > 0
            ? Math.pow(((((width / 2) * height) / 2) * depth) / 2, 1 / 3)
            : onePixel;
        shapeSettings = new Jolt.SphereShapeSettings(radius);
        quat = this.getQuat(0, 0, 0, 1);
      }
      shapeSettings.mDensity = this.density;
      const rotatedShape = new Jolt.RotatedTranslatedShapeSettings(
        this.getVec3(shapeOffsetX, shapeOffsetY, shapeOffsetZ),
        // Top on Z axis.
        quat,
        shapeSettings
      )
        .Create()
        .Get();

      Jolt.destroy(shapeSettings);
      return rotatedShape;
    }

    recreateShape(): void {
      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return;
      }
      const body = this._body!;

      const bodyInterface = this._sharedData.bodyInterface;
      bodyInterface.GetShape(body.GetID());
      bodyInterface.SetShape(
        body.GetID(),
        this.createShape(),
        true,
        Jolt.EActivation_Activate
      );

      this._objectOldWidth = this.owner3D.getWidth();
      this._objectOldHeight = this.owner3D.getHeight();
      this._objectOldDepth = this.owner3D.getDepth();
    }

    getBody(): Jolt.Body {
      // If there is no body, set a new one
      if (this._body === null) {
        this.createBody();
      }
      return this._body!;
    }

    createBody(): boolean {
      if (!this.activated() || this.destroyedDuringFrameLogic) return false;

      const width = this.owner3D.getWidth() * this._sharedData.worldInvScale;
      const height = this.owner3D.getHeight() * this._sharedData.worldInvScale;
      const depth = this.owner3D.getDepth() * this._sharedData.worldInvScale;

      const x =
        this.owner3D.getDrawableX() * this._sharedData.worldInvScale +
        width / 2;
      const y =
        this.owner3D.getDrawableY() * this._sharedData.worldInvScale +
        height / 2;
      const z =
        this.owner3D.getDrawableZ() * this._sharedData.worldInvScale +
        depth / 2;

      const shape = this.createShape();
      const threeObject = this.owner3D.get3DRendererObject();
      const bodyCreationSettings = new Jolt.BodyCreationSettings(
        shape,
        this.getRVec3(x, y, z),
        this.getQuat(
          threeObject.quaternion.x,
          threeObject.quaternion.y,
          threeObject.quaternion.z,
          threeObject.quaternion.w
        ),
        this.bodyType === 'Static'
          ? Jolt.EMotionType_Static
          : this.bodyType === 'Kinematic'
          ? Jolt.EMotionType_Kinematic
          : Jolt.EMotionType_Dynamic,
        LAYER_MOVING
      );
      bodyCreationSettings.mMotionQuality = this.bullet
        ? Jolt.EMotionQuality_LinearCast
        : Jolt.EMotionQuality_Discrete;
      bodyCreationSettings.mAllowedDOFs = this.fixedRotation
        ? Jolt.EAllowedDOFs_TranslationX |
          Jolt.EAllowedDOFs_TranslationY |
          Jolt.EAllowedDOFs_TranslationZ
        : Jolt.EAllowedDOFs_All;
      bodyCreationSettings.mFriction = this.friction;
      bodyCreationSettings.mRestitution = this.restitution;
      bodyCreationSettings.mLinearDamping = this.linearDamping;
      bodyCreationSettings.mAngularDamping = this.angularDamping;
      bodyCreationSettings.mGravityFactor = this.gravityScale;
      // TODO Collision between 2 non-dynamic body should be checked during the
      // collision condition to improve efficiency.
      bodyCreationSettings.mCollideKinematicVsNonDynamic = true;

      const bodyInterface = this._sharedData.bodyInterface;
      this._body = bodyInterface.CreateBody(bodyCreationSettings);
      bodyInterface.AddBody(this._body.GetID(), Jolt.EActivation_Activate);
      this._body.gdjsAssociatedBehavior = this;

      this._objectOldWidth = this.owner3D.getWidth();
      this._objectOldHeight = this.owner3D.getHeight();
      this._objectOldDepth = this.owner3D.getDepth();
      Jolt.destroy(bodyCreationSettings);
      return true;
    }

    doStepPreEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {
      // Step the world if not done this frame yet.
      // Don't step at the first frame to allow events to handle overlapping objects.
      if (
        !this._sharedData.stepped &&
        !instanceContainer.getScene().getTimeManager().isFirstFrame()
      ) {
        // Reset started and ended contacts array for all physics instances.
        this._sharedData.resetStartedAndEndedCollisions();
        this._sharedData.updateBodiesFromObjects();
        this._sharedData.step(
          instanceContainer.getScene().getTimeManager().getElapsedTime() /
            1000.0
        );
      }

      // Copy transform from body to the GD object.
      // It's possible the behavior was either deactivated or the object deleted
      // just before this doStepPreEvents (for example, another behavior deleted
      // the object during its own doStepPreEvents). If the body is null, we just
      // don't do anything (but still run the physics simulation - this is independent).
      if (this._body !== null) {
        const position = this._body.GetPosition();
        this.owner3D.setX(
          position.GetX() * this._sharedData.worldScale -
            this.owner3D.getWidth() / 2 +
            this.owner3D.getX() -
            this.owner3D.getDrawableX()
        );
        this.owner3D.setY(
          position.GetY() * this._sharedData.worldScale -
            this.owner3D.getHeight() / 2 +
            this.owner3D.getY() -
            this.owner3D.getDrawableY()
        );
        this.owner3D.setZ(
          position.GetZ() * this._sharedData.worldScale -
            this.owner3D.getDepth() / 2 +
            this.owner3D.getZ() -
            this.owner3D.getDrawableZ()
        );
        const quaternion = this._body.GetRotation();
        const threeObject = this.owner3D.get3DRendererObject();
        threeObject.quaternion.x = quaternion.GetX();
        threeObject.quaternion.y = quaternion.GetY();
        threeObject.quaternion.z = quaternion.GetZ();
        threeObject.quaternion.w = quaternion.GetW();
        const euler = new THREE.Euler(0, 0, 0, 'ZYX');
        euler.setFromQuaternion(threeObject.quaternion);
        this.owner3D.setRotationX(gdjs.toDegrees(euler.x));
        this.owner3D.setRotationY(gdjs.toDegrees(euler.y));
        this.owner3D.setAngle(gdjs.toDegrees(euler.z));
      }

      // Update cached transform.
      this._objectOldX = this.owner3D.getX();
      this._objectOldY = this.owner3D.getY();
      this._objectOldRotationX = this.owner3D.getRotationX();
      this._objectOldRotationY = this.owner3D.getRotationY();
      this._objectOldRotationZ = this.owner3D.getAngle();
    }

    doStepPostEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {
      // Reset world step to update next frame
      this._sharedData.stepped = false;
    }

    onObjectHotReloaded() {
      this.updateBodyFromObject();
    }

    updateBodyFromObject() {
      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return;
      }
      const body = this._body!;

      // The object size has changed, recreate the shape.
      // The width has changed and there is no custom dimension A (box: width, circle: radius, edge: length) or
      // The height has changed, the shape is not an edge (edges doesn't have height),
      // it isn't a box with custom height or a circle with custom radius
      if (
        this._objectOldWidth !== this.owner3D.getWidth() ||
        this._objectOldHeight !== this.owner3D.getHeight() ||
        this._objectOldDepth !== this.owner3D.getDepth()
      ) {
        this.recreateShape();
      }

      // The object object transform has changed, update body transform:
      if (
        this._objectOldX !== this.owner3D.getX() ||
        this._objectOldY !== this.owner3D.getY() ||
        this._objectOldZ !== this.owner3D.getZ() ||
        this._objectOldRotationX !== this.owner3D.getRotationX() ||
        this._objectOldRotationY !== this.owner3D.getRotationY() ||
        this._objectOldRotationZ !== this.owner3D.getAngle()
      ) {
        const x =
          (this.owner3D.getDrawableX() + this.owner3D.getWidth() / 2) *
          this._sharedData.worldInvScale;
        const y =
          (this.owner3D.getDrawableY() + this.owner3D.getHeight() / 2) *
          this._sharedData.worldInvScale;
        const z =
          (this.owner3D.getDrawableZ() + this.owner3D.getDepth() / 2) *
          this._sharedData.worldInvScale;

        const threeObject = this.owner3D.get3DRendererObject();
        this._sharedData.bodyInterface.SetPositionAndRotationWhenChanged(
          body.GetID(),
          this.getRVec3(x, y, z),
          this.getQuat(
            threeObject.quaternion.x,
            threeObject.quaternion.y,
            threeObject.quaternion.z,
            threeObject.quaternion.w
          ),
          Jolt.EActivation_Activate
        );
      }
    }

    applyForce(
      forceX: float,
      forceY: float,
      forceZ: float,
      positionX: float,
      positionY: float,
      positionZ: float
    ): void {
      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return;
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
      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return;
      }
      const body = this._body!;

      this._sharedData.bodyInterface.AddForce(
        body.GetID(),
        this.getVec3(forceX, forceY, forceZ),
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
      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return;
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
      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return;
      }
      const body = this._body!;

      this._sharedData.bodyInterface.AddImpulse(
        body.GetID(),
        this.getVec3(impulseX, impulseY, impulseZ)
      );
    }

    onContactBegin(otherBehavior: Physics3DRuntimeBehavior): void {
      this.currentContacts.push(otherBehavior);

      // There might be contacts that end during the frame and
      // start again right away. It is considered a glitch
      // and should not be detected.
      let i = this.contactsEndedThisFrame.indexOf(otherBehavior);
      if (i !== -1) {
        this.contactsEndedThisFrame.splice(i, 1);
      } else {
        this.contactsStartedThisFrame.push(otherBehavior);
      }
    }

    onContactEnd(otherBehavior: Physics3DRuntimeBehavior): void {
      this.contactsEndedThisFrame.push(otherBehavior);

      const index = this.currentContacts.indexOf(otherBehavior);
      if (index !== -1) {
        this.currentContacts.splice(index, 1);
      }
    }

    static areObjectsColliding(
      object1: gdjs.RuntimeObject,
      object2: gdjs.RuntimeObject,
      behaviorName: string
    ): boolean {
      // Test if the second object is in the list of contacts of the first one
      const behavior1 = object1.getBehavior(
        behaviorName
      ) as Physics3DRuntimeBehavior | null;
      if (!behavior1) return false;

      if (
        behavior1.currentContacts.some((behavior) => behavior.owner === object2)
      ) {
        return true;
      }
      // If a contact has started at this frame and ended right away, it
      // won't appear in current contacts but the condition should return
      // true anyway.
      if (
        behavior1.contactsStartedThisFrame.some(
          (behavior) => behavior.owner === object2
        )
      ) {
        return true;
      }

      // No contact found
      return false;
    }

    static hasCollisionStartedBetween(
      object1: gdjs.RuntimeObject,
      object2: gdjs.RuntimeObject,
      behaviorName: string
    ): boolean {
      // Test if the second object is in the list of contacts of the first one
      const behavior1 = object1.getBehavior(
        behaviorName
      ) as Physics3DRuntimeBehavior | null;
      if (!behavior1) return false;

      return behavior1.contactsStartedThisFrame.some(
        (behavior) => behavior.owner === object2
      );
    }

    static hasCollisionStoppedBetween(
      object1: gdjs.RuntimeObject,
      object2: gdjs.RuntimeObject,
      behaviorName: string
    ): boolean {
      // Test if the second object is in the list of contacts of the first one
      const behavior1 = object1.getBehavior(
        behaviorName
      ) as Physics3DRuntimeBehavior | null;
      if (!behavior1) return false;

      return behavior1.contactsEndedThisFrame.some(
        (behavior) => behavior.owner === object2
      );
    }
  }

  gdjs.registerBehavior(
    'Physics3D::Physics3DBehavior',
    gdjs.Physics3DRuntimeBehavior
  );
}
