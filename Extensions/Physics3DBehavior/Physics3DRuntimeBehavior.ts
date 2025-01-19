/// <reference path="./jolt-physics.d.ts" />

namespace Jolt {
  export interface Body {
    gdjsAssociatedBehavior: gdjs.Physics3DRuntimeBehavior | null;
  }
}

namespace gdjs {
  const loadJolt = async () => {
    try {
      const module = await import('./jolt-physics.wasm.js');
      const initializeJoltPhysics = module.default;
      if (!initializeJoltPhysics) {
        throw new Error('No default export found in Jolt.');
      }

      const Jolt = await initializeJoltPhysics();
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

  export interface Physics3DNetworkSyncData extends BehaviorNetworkSyncData {
    props: Physics3DNetworkSyncDataType;
  }

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

    private _physics3DHooks: Array<
      gdjs.Physics3DRuntimeBehavior.Physics3DHook
    > = [];

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
        const initialData = runtimeScene.getInitialSharedDataForBehavior(
          behaviorName
        );
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
      const broadPhaseLayerInterfaceMask = new Jolt.BroadPhaseLayerInterfaceMask(
        2
      );
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
      settings.mObjectVsBroadPhaseLayerFilter = new Jolt.ObjectVsBroadPhaseLayerFilterMask(
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
      Jolt.destroy(physics3DSharedData.jolt);
      Jolt.destroy(physics3DSharedData.contactListener);
      Jolt.destroy(physics3DSharedData._tempVec3);
      Jolt.destroy(physics3DSharedData._tempRVec3);
      Jolt.destroy(physics3DSharedData._tempQuat);
      runtimeScene.physics3DSharedData = null;
    }
  });

  export class Physics3DRuntimeBehavior extends gdjs.RuntimeBehavior {
    bodyUpdater: gdjs.Physics3DRuntimeBehavior.BodyUpdater;
    collisionChecker: gdjs.Physics3DRuntimeBehavior.CollisionChecker;
    owner3D: gdjs.RuntimeObject3D;

    bodyType: string;
    bullet: boolean;
    fixedRotation: boolean;
    private shape: string;
    private shapeOrientation: string;
    private shapeDimensionA: any;
    private shapeDimensionB: any;
    private shapeDimensionC: any;
    private density: float;
    friction: float;
    restitution: float;
    linearDamping: float;
    angularDamping: float;
    gravityScale: float;
    private layers: integer;
    private masks: integer;
    private shapeScale: number = 1;

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

    private _destroyedDuringFrameLogic: boolean;
    _body: Jolt.Body | null = null;
    /**
     * When set to `true` the body will be recreated before the next physics step.
     */
    private _needToRecreateBody: boolean = false;
    /**
     * When set to `true` the shape will be recreated before the next physics step.
     */
    private _needToRecreateShape: boolean = false;
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

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      behaviorData,
      owner: gdjs.RuntimeObject3D
    ) {
      super(instanceContainer, behaviorData, owner);
      this.bodyUpdater = new gdjs.Physics3DRuntimeBehavior.DefaultBodyUpdater(
        this
      );
      this.collisionChecker = new gdjs.Physics3DRuntimeBehavior.DefaultCollisionChecker(
        this
      );
      this.owner3D = owner;
      this.bodyType = behaviorData.bodyType;
      this.bullet = behaviorData.bullet;
      this.fixedRotation = behaviorData.fixedRotation;
      this.shape = behaviorData.shape;
      this.shapeOrientation = behaviorData.shapeOrientation;
      this.shapeDimensionA = behaviorData.shapeDimensionA;
      this.shapeDimensionB = behaviorData.shapeDimensionB;
      this.shapeDimensionC = behaviorData.shapeDimensionC;
      this.density = behaviorData.density;
      this.friction = behaviorData.friction;
      this.restitution = behaviorData.restitution;
      this.linearDamping = Math.max(0, behaviorData.linearDamping);
      this.angularDamping = Math.max(0, behaviorData.angularDamping);
      this.gravityScale = behaviorData.gravityScale;
      this.layers = behaviorData.layers;
      this.masks = behaviorData.masks;
      this._destroyedDuringFrameLogic = false;
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
      if (oldBehaviorData.bullet !== newBehaviorData.bullet) {
        this.setBullet(newBehaviorData.bullet);
      }
      if (oldBehaviorData.fixedRotation !== newBehaviorData.fixedRotation) {
        this.setFixedRotation(newBehaviorData.fixedRotation);
      }
      if (oldBehaviorData.shapeDimensionA !== newBehaviorData.shapeDimensionA) {
        this.shapeDimensionA = newBehaviorData.shapeDimensionA;
        this._needToRecreateShape = true;
      }
      if (oldBehaviorData.shapeDimensionB !== newBehaviorData.shapeDimensionB) {
        this.shapeDimensionB = newBehaviorData.shapeDimensionB;
        this._needToRecreateShape = true;
      }
      if (oldBehaviorData.density !== newBehaviorData.density) {
        this.setDensity(newBehaviorData.density);
      }
      if (oldBehaviorData.friction !== newBehaviorData.friction) {
        this.setFriction(newBehaviorData.friction);
      }
      if (oldBehaviorData.restitution !== newBehaviorData.restitution) {
        this.setRestitution(newBehaviorData.restitution);
      }
      if (oldBehaviorData.linearDamping !== newBehaviorData.linearDamping) {
        this.setLinearDamping(newBehaviorData.linearDamping);
      }
      if (oldBehaviorData.angularDamping !== newBehaviorData.angularDamping) {
        this.setAngularDamping(newBehaviorData.angularDamping);
      }
      if (oldBehaviorData.gravityScale !== newBehaviorData.gravityScale) {
        this.setGravityScale(newBehaviorData.gravityScale);
      }

      // TODO: make these properties updatable.
      if (oldBehaviorData.layers !== newBehaviorData.layers) {
        return false;
      }
      if (oldBehaviorData.masks !== newBehaviorData.masks) {
        return false;
      }
      if (oldBehaviorData.vertices !== newBehaviorData.vertices) {
        return false;
      }
      if (oldBehaviorData.bodyType !== newBehaviorData.bodyType) {
        return false;
      }
      if (oldBehaviorData.shape !== newBehaviorData.shape) {
        return false;
      }
      return true;
    }

    getNetworkSyncData(): Physics3DNetworkSyncData {
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
        ...super.getNetworkSyncData(),
        props: {
          ...bodyProps,
          layers: this.layers,
          masks: this.masks,
        },
      };
    }

    updateFromNetworkSyncData(networkSyncData: Physics3DNetworkSyncData) {
      super.updateFromNetworkSyncData(networkSyncData);

      const behaviorSpecificProps = networkSyncData.props;
      if (
        behaviorSpecificProps.px !== undefined &&
        behaviorSpecificProps.py !== undefined &&
        behaviorSpecificProps.pz !== undefined
      ) {
        if (this._body) {
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
      }
      if (
        behaviorSpecificProps.rx !== undefined &&
        behaviorSpecificProps.ry !== undefined &&
        behaviorSpecificProps.rz !== undefined &&
        behaviorSpecificProps.rw !== undefined
      ) {
        if (this._body) {
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
      }
      if (
        behaviorSpecificProps.lvx !== undefined &&
        behaviorSpecificProps.lvy !== undefined &&
        behaviorSpecificProps.lvz !== undefined
      ) {
        if (this._body) {
          this._sharedData.bodyInterface.SetLinearVelocity(
            this._body.GetID(),
            this.getVec3(
              behaviorSpecificProps.lvx,
              behaviorSpecificProps.lvy,
              behaviorSpecificProps.lvz
            )
          );
        }
      }
      if (
        behaviorSpecificProps.avx !== undefined &&
        behaviorSpecificProps.avy !== undefined &&
        behaviorSpecificProps.avz !== undefined
      ) {
        if (this._body) {
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
      if (behaviorSpecificProps.layers !== undefined) {
        this.layers = behaviorSpecificProps.layers;
      }
      if (behaviorSpecificProps.masks !== undefined) {
        this.masks = behaviorSpecificProps.masks;
      }
    }

    onDeActivate() {
      this._sharedData.removeFromBehaviorsList(this);
      if (this._body !== null) {
        this._sharedData.bodyInterface.RemoveBody(this._body.GetID());
        this._sharedData.bodyInterface.DestroyBody(this._body.GetID());
        this._body = null;
      }
      this._contactsEndedThisFrame.length = 0;
      this._contactsStartedThisFrame.length = 0;
      this._currentContacts.length = 0;
    }

    onActivate() {
      this._sharedData.addToBehaviorsList(this);

      this._contactsEndedThisFrame.length = 0;
      this._contactsStartedThisFrame.length = 0;
      this._currentContacts.length = 0;
      this.updateBodyFromObject();
    }

    onDestroy() {
      this._destroyedDuringFrameLogic = true;
      this.onDeActivate();
    }

    createShape(): Jolt.Shape {
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
        // The convex radius should not eat up the whole volume.
        const convexRadius = Math.min(
          onePixel,
          Math.min(boxWidth, boxHeight, boxDepth) / 4
        );
        shapeSettings = new Jolt.BoxShapeSettings(
          this.getVec3(boxWidth / 2, boxHeight / 2, boxDepth / 2),
          convexRadius
        );
        quat = this.getQuat(0, 0, 0, 1);
        this._shapeHalfDepth = boxDepth / 2;
      } else if (this.shape === 'Capsule') {
        const radius =
          shapeDimensionA > 0
            ? shapeDimensionA
            : width > 0
            ? Math.sqrt(width * height) / 2
            : onePixel;
        const capsuleDepth =
          shapeDimensionB > 0 ? shapeDimensionB : depth > 0 ? depth : onePixel;
        shapeSettings = new Jolt.CapsuleShapeSettings(
          Math.max(0, capsuleDepth / 2 - radius),
          radius
        );
        quat = this._getShapeOrientationQuat();
        this._shapeHalfDepth =
          this.shapeOrientation !== 'Z' ? radius : capsuleDepth / 2;
      } else if (this.shape === 'Cylinder') {
        const radius =
          shapeDimensionA > 0
            ? shapeDimensionA
            : width > 0
            ? Math.sqrt(width * height) / 2
            : onePixel;
        const cylinderDepth =
          shapeDimensionB > 0 ? shapeDimensionB : depth > 0 ? depth : onePixel;
        // The convex radius should not eat up the whole volume.
        const convexRadius = Math.min(
          onePixel,
          Math.min(cylinderDepth, radius) / 4
        );
        shapeSettings = new Jolt.CylinderShapeSettings(
          cylinderDepth / 2,
          radius,
          convexRadius
        );
        quat = this._getShapeOrientationQuat();
        this._shapeHalfDepth =
          this.shapeOrientation !== 'Z' ? radius : cylinderDepth / 2;
      } else {
        // Create a 'Sphere' by default.
        const radius =
          shapeDimensionA > 0
            ? shapeDimensionA
            : width > 0
            ? Math.pow(width * height * depth, 1 / 3) / 2
            : onePixel;
        shapeSettings = new Jolt.SphereShapeSettings(radius);
        quat = this.getQuat(0, 0, 0, 1);
        this._shapeHalfDepth = radius;
      }
      shapeSettings.mDensity = this.density;
      const rotatedShape = new Jolt.RotatedTranslatedShapeSettings(
        this.getVec3(0, 0, 0),
        quat,
        shapeSettings
      )
        .Create()
        .Get();

      Jolt.destroy(shapeSettings);
      return rotatedShape;
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

    doStepPreEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {
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

    doStepPostEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {
      // Reset world step to update next frame
      this._sharedData.stepped = false;
    }

    onObjectHotReloaded() {
      this.updateBodyFromObject();
    }

    recreateBody() {
      if (!this._body) {
        this._createBody();
        return;
      }

      const bodyInterface = this._sharedData.bodyInterface;
      const linearVelocity = this._body.GetLinearVelocity();
      const linearVelocityX = linearVelocity.GetX();
      const linearVelocityY = linearVelocity.GetY();
      const linearVelocityZ = linearVelocity.GetZ();
      const angularVelocity = this._body.GetAngularVelocity();
      const angularVelocityX = angularVelocity.GetX();
      const angularVelocityY = angularVelocity.GetY();
      const angularVelocityZ = angularVelocity.GetZ();

      let bodyID = this._body.GetID();
      bodyInterface.RemoveBody(bodyID);
      bodyInterface.DestroyBody(bodyID);
      this._contactsEndedThisFrame.length = 0;
      this._contactsStartedThisFrame.length = 0;
      this._currentContacts.length = 0;

      this._createBody();
      if (!this._body) {
        return;
      }
      bodyID = this._body.GetID();
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

    getPhysicsPosition(result: Jolt.RVec3): Jolt.RVec3 {
      result.Set(
        this.owner3D.getCenterXInScene() * this._sharedData.worldInvScale,
        this.owner3D.getCenterYInScene() * this._sharedData.worldInvScale,
        this.owner3D.getCenterZInScene() * this._sharedData.worldInvScale
      );
      return result;
    }

    getPhysicsRotation(result: Jolt.Quat): Jolt.Quat {
      const threeObject = this.owner3D.get3DRendererObject();
      result.Set(
        threeObject.quaternion.x,
        threeObject.quaternion.y,
        threeObject.quaternion.z,
        threeObject.quaternion.w
      );
      return result;
    }

    moveObjectToPhysicsPosition(physicsPosition: Jolt.RVec3): void {
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

    moveObjectToPhysicsRotation(physicsRotation: Jolt.Quat): void {
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
      if (this._sharedData.gravityX === gravityY) {
        return;
      }

      this._sharedData.gravityX = gravityY;
      this._sharedData.physicsSystem.SetGravity(
        this.getVec3(
          this._sharedData.gravityX,
          this._sharedData.gravityY,
          this._sharedData.gravityZ
        )
      );
    }

    setGravityZ(gravityZ: float): void {
      if (this._sharedData.gravityX === gravityZ) {
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
      // Non-negative values only
      if (density < 0) {
        density = 0;
      }
      if (this.density === density) {
        return;
      }
      this.density = density;
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

      const deltaX = towardX - body.GetPosition().GetX();
      const deltaY = towardY - body.GetPosition().GetY();
      const deltaZ = towardZ - body.GetPosition().GetZ();
      const distance = deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ;
      if (distance === 0) {
        return;
      }
      const ratio = length / distance;

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
      towardZ: float,
      originX: float,
      originY: float,
      originZ: float
    ): void {
      if (this._body === null) {
        if (!this._createBody()) return;
      }
      const body = this._body!;

      const deltaX = towardX - originX;
      const deltaY = towardY - originY;
      const deltaZ = towardZ - originZ;
      const distance = deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ;
      if (distance === 0) {
        return;
      }
      const ratio = length / distance;

      this._sharedData.bodyInterface.AddImpulse(
        body.GetID(),
        this.getVec3(deltaX * ratio, deltaY * ratio, deltaZ * ratio),
        this.getRVec3(
          originX * this._sharedData.worldInvScale,
          originY * this._sharedData.worldInvScale,
          originZ * this._sharedData.worldInvScale
        )
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
  }

  gdjs.registerBehavior(
    'Physics3D::Physics3DBehavior',
    gdjs.Physics3DRuntimeBehavior
  );

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
      createAndAddBody(): Jolt.Body;
      updateObjectFromBody(): void;
      updateBodyFromObject(): void;
      recreateShape(): void;
    }

    export class DefaultBodyUpdater {
      behavior: gdjs.Physics3DRuntimeBehavior;

      constructor(behavior: gdjs.Physics3DRuntimeBehavior) {
        this.behavior = behavior;
      }

      createAndAddBody(): Jolt.Body {
        const { behavior } = this;
        const { _sharedData } = behavior;

        const shape = behavior.createShape();
        const bodyCreationSettings = new Jolt.BodyCreationSettings(
          shape,
          behavior.getPhysicsPosition(_sharedData.getRVec3(0, 0, 0)),
          behavior.getPhysicsRotation(_sharedData.getQuat(0, 0, 0, 1)),
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
          behavior.moveObjectToPhysicsPosition(_body.GetPosition());
          behavior.moveObjectToPhysicsRotation(_body.GetRotation());
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
            this.behavior.getPhysicsPosition(_sharedData.getRVec3(0, 0, 0)),
            this.behavior.getPhysicsRotation(_sharedData.getQuat(0, 0, 0, 1)),
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
