/// <reference path="./jolt-physics.d.ts" />

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

  const setupCollisionFiltering = (settings) => {
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
    worldScale: float;
    worldInvScale: float;

    jolt: Jolt.JoltInterface;
    physicsSystem: Jolt.PhysicsSystem;
    bodyInterface: Jolt.BodyInterface;

    stepped: boolean = false;
    /**
     * List of physics behavior in the runtimeScene. It should be updated
     * when a new physics object is created (constructor), on destruction (onDestroy),
     * on behavior activation (onActivate) and on behavior deactivation (onDeActivate).
     */
    _registeredBehaviors: Set<Physics3DRuntimeBehavior>;

    constructor(instanceContainer: gdjs.RuntimeInstanceContainer, sharedData) {
      this._registeredBehaviors = new Set<Physics3DRuntimeBehavior>();
      this.worldScale = sharedData.worldScale;
      this.worldInvScale = 1 / this.worldScale;

      // Initialize Jolt
      const settings = new Jolt.JoltSettings();
      setupCollisionFiltering(settings);
      this.jolt = new Jolt.JoltInterface(settings);
      Jolt.destroy(settings);
      this.physicsSystem = this.jolt.GetPhysicsSystem();
      this.bodyInterface = this.physicsSystem.GetBodyInterface();
    }

    // (string)jointId -> (b2Joint)b2Joint
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
        // TODO
        // physicsBehavior.contactsStartedThisFrame.length = 0;
        // physicsBehavior.contactsEndedThisFrame.length = 0;
      }
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
    if (
      // @ts-ignore
      runtimeScene.physics3DSharedData &&
      // @ts-ignore
      runtimeScene.physics3DSharedData.world
    ) {
      // @ts-ignore
      Box2D.destroy(runtimeScene.physics3DSharedData.world);
    }
  });

  export class Physics3DRuntimeBehavior extends gdjs.RuntimeBehavior {
    owner3D: gdjs.RuntimeObject3D;
    destroyedDuringFrameLogic: boolean;
    _body: Jolt.Body | null = null;

    _objectOldX: number = 0;
    _objectOldY: number = 0;
    _objectOldZ: number = 0;
    _objectOldRotationX: float = 0;
    _objectOldRotationY: float = 0;
    _objectOldRotationZ: float = 0;
    _objectOldWidth: float = 0;
    _objectOldHeight: float = 0;
    _objectOldDepth: float = 0;

    /**
     * sharedData is a reference to the shared data of the scene, that registers
     * every physics behavior that is created so that collisions can be cleared
     * before stepping the world.
     */
    _sharedData: Physics3DSharedData;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      behaviorData,
      owner: gdjs.RuntimeObject3D
    ) {
      super(instanceContainer, behaviorData, owner);
      this.owner3D = owner;
      this.destroyedDuringFrameLogic = false;
      this._sharedData = Physics3DSharedData.getSharedData(
        instanceContainer.getScene(),
        behaviorData.name
      );
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

    onDeActivate() {}

    onActivate() {}

    onDestroy() {}

    getBody(): Jolt.Body {
      // If there is no body, set a new one
      if (this._body === null) {
        this.createBody();
      }
      return this._body!;
    }

    createBody(): boolean {
      if (!this.activated() || this.destroyedDuringFrameLogic) return false;

      const x =
        (this.owner3D.getDrawableX() + this.owner3D.getWidth() / 2) *
        this._sharedData.worldInvScale;
      const y =
        (this.owner3D.getDrawableY() + this.owner3D.getHeight() / 2) *
        this._sharedData.worldInvScale;
      const z =
        (this.owner3D.getDrawableZ() + this.owner3D.getDepth() / 2) *
        this._sharedData.worldInvScale;

      // TODO
      const shape = new Jolt.BoxShape(
        new Jolt.Vec3(32, 32, 32),
        0.5,
        undefined
      );
      const threeObject = this.owner3D.get3DRendererObject();
      const bodyCreationSettings = new Jolt.BodyCreationSettings(
        shape,
        new Jolt.RVec3(x, y, z),
        new Jolt.Quat(
          threeObject.quaternion.x,
          threeObject.quaternion.y,
          threeObject.quaternion.z,
          threeObject.quaternion.w
        ),
        Jolt.EMotionType_Dynamic,
        LAYER_MOVING
      );

      this._body =
        this._sharedData.bodyInterface.CreateBody(bodyCreationSettings);

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

    doStepPostEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {}

    onObjectHotReloaded() {
      this.updateBodyFromObject();
    }

    updateBodyFromObject() {
      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return;
      }
      const body = this._body!;

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
          new Jolt.RVec3(x, y, z),
          new Jolt.Quat(
            threeObject.quaternion.x,
            threeObject.quaternion.y,
            threeObject.quaternion.z,
            threeObject.quaternion.w
          ),
          Jolt.EActivation_Activate
        );
      }
    }
  }

  gdjs.registerBehavior(
    'Physics3D::Physics3DBehavior',
    gdjs.Physics3DRuntimeBehavior
  );
}
