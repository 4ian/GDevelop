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
        if (globalThis.initializeJoltPhysics) {
          resolve(
            // @ts-ignore
            globalThis.initializeJoltPhysics().then((Jolt: any) => {
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

  // There are 4 bits for static layers and 4 bits for dynamic layers.
  const staticLayersMask = 0x0f;
  const dynamicLayersMask = 0xf0;
  const allLayersMask = 0xff;

  const setupCollisionFiltering = (settings: Jolt.JoltSettings) => {
    const objectFilter = new Jolt.ObjectLayerPairFilterMask();
    const staticBroadPhaseLayer = new Jolt.BroadPhaseLayer(0);
    const dynamicBroadPhaseLayer = new Jolt.BroadPhaseLayer(1);
    const broadPhaseLayerInterfaceMask = new Jolt.BroadPhaseLayerInterfaceMask(
      2
    );
    broadPhaseLayerInterfaceMask.ConfigureLayer(
      staticBroadPhaseLayer,
      staticLayersMask,
      0
    );
    broadPhaseLayerInterfaceMask.ConfigureLayer(
      dynamicBroadPhaseLayer,
      dynamicLayersMask,
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
        bodyPtrA: number,
        bodyPtrB: number,
        manifoldPtr: number,
        settingsPtr: number
      ): void => {};
      this.contactListener.OnContactValidate = (
        bodyPtrA: number,
        bodyPtrB: number,
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
    shapeOrientation: string;
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
    layers: integer;
    masks: integer;
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
    needToRecreateBody: boolean = false;
    needToRecreateShape: boolean = false;

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
      this.shapeOrientation = behaviorData.shapeOrientation;
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
      this.layers = behaviorData.layers;
      this.masks = behaviorData.masks;
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
      if (oldBehaviorData.bullet !== newBehaviorData.bullet) {
        this.setBullet(newBehaviorData.bullet);
      }
      if (oldBehaviorData.fixedRotation !== newBehaviorData.fixedRotation) {
        this.setFixedRotation(newBehaviorData.fixedRotation);
      }
      if (oldBehaviorData.shapeDimensionA !== newBehaviorData.shapeDimensionA) {
        this.shapeDimensionA = newBehaviorData.shapeDimensionA;
        this.recreateShape();
      }
      if (oldBehaviorData.shapeDimensionB !== newBehaviorData.shapeDimensionB) {
        this.shapeDimensionB = newBehaviorData.shapeDimensionB;
        this.recreateShape();
      }
      if (oldBehaviorData.shapeOffsetX !== newBehaviorData.shapeOffsetX) {
        this.shapeOffsetX = newBehaviorData.shapeOffsetX;
        this.recreateShape();
      }
      if (oldBehaviorData.shapeOffsetY !== newBehaviorData.shapeOffsetY) {
        this.shapeOffsetY = newBehaviorData.shapeOffsetY;
        this.recreateShape();
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
      const bodyProps = this._body
        ? {
            px: this._body.GetPosition().GetX(),
            py: this._body.GetPosition().GetY(),
            pz: this._body.GetPosition().GetZ(),
            rx: this._body.GetRotation().GetX(),
            ry: this._body.GetRotation().GetY(),
            rz: this._body.GetRotation().GetZ(),
            rw: this._body.GetRotation().GetW(),
            lvx: this._body.GetLinearVelocity().GetX(),
            lvy: this._body.GetLinearVelocity().GetY(),
            lvz: this._body.GetLinearVelocity().GetZ(),
            avx: this._body.GetAngularVelocity().GetX(),
            avy: this._body.GetAngularVelocity().GetY(),
            avz: this._body.GetAngularVelocity().GetZ(),
            aw: this._body.IsActive(),
          }
        : {
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
            this.getVec3(
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
      this.needToRecreateShape = false;

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
        quat = this.getShapeOrientationQuat();
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
        quat = this.getShapeOrientationQuat();
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

    private getShapeOrientationQuat(): Jolt.Quat {
      let quat: Jolt.Quat;
      if (this.shapeOrientation === 'X') {
        // Top on X axis.
        quat = this.getQuat(0, 0, Math.sqrt(2) / 2, -Math.sqrt(2) / 2);
      } else if (this.shapeOrientation === 'Y') {
        // Top on Y axis.
        quat = this.getQuat(0, 0, 0, 1);
      } else {
        // Top on Z axis.
        quat = this.getQuat(Math.sqrt(2) / 2, 0, 0, Math.sqrt(2) / 2);
      }
      return quat;
    }

    recreateShape(): void {
      if (this._body === null) {
        if (!this.createBody()) return;
      }
      const body = this._body!;

      const bodyInterface = this._sharedData.bodyInterface;
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

    getShapeScale(): float {
      return this.shapeScale;
    }

    setShapeScale(shapeScale: float): void {
      if (shapeScale !== this.shapeScale && shapeScale > 0) {
        this.shapeScale = shapeScale;
        this.recreateShape();
      }
    }

    getBody(): Jolt.Body {
      if (this._body === null) {
        this.createBody();
      }
      return this._body!;
    }

    createBody(): boolean {
      this.needToRecreateBody = false;

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
        Jolt.ObjectLayerPairFilterMask.prototype.sGetObjectLayer(
          // Make sure objects don't register in the wrong layer group.
          this.bodyType === 'Static'
            ? this.layers & staticLayersMask
            : this.layers & dynamicLayersMask,
          // Static objects accept all collisions as it's the mask of dynamic objects that matters.
          this.bodyType === 'Static' ? allLayersMask : this.masks
        )
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

    recreateBody() {
      if (!this._body) {
        this.createBody();
        return;
      }
      const LinearVelocityX = this._body.GetLinearVelocity().GetX();
      const LinearVelocityY = this._body.GetLinearVelocity().GetY();
      const LinearVelocityZ = this._body.GetLinearVelocity().GetZ();
      const AngularVelocityX = this._body.GetAngularVelocity().GetX();
      const AngularVelocityY = this._body.GetAngularVelocity().GetY();
      const AngularVelocityZ = this._body.GetAngularVelocity().GetZ();

      this._sharedData.bodyInterface.RemoveBody(this._body.GetID());
      this._sharedData.bodyInterface.DestroyBody(this._body.GetID());
      this.contactsEndedThisFrame.length = 0;
      this.contactsStartedThisFrame.length = 0;
      this.currentContacts.length = 0;

      this.createBody();
      if (!this._body) {
        return;
      }
      this._body.SetLinearVelocity(
        this.getVec3(LinearVelocityX, LinearVelocityY, LinearVelocityZ)
      );
      this._body.SetAngularVelocity(
        this.getVec3(AngularVelocityX, AngularVelocityY, AngularVelocityZ)
      );
    }

    updateBodyFromObject() {
      if (this._body === null) {
        if (!this.createBody()) return;
      }
      const body = this._body!;

      if (this.needToRecreateBody) {
        this.recreateBody();
      }

      // The object size has changed, recreate the shape.
      // The width has changed and there is no custom dimension A (box: width, circle: radius, edge: length) or
      // The height has changed, the shape is not an edge (edges doesn't have height),
      // it isn't a box with custom height or a circle with custom radius
      if (
        this.needToRecreateShape ||
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

    // TODO
    // getTimeScale(): float {
    //   // Get the time scale
    //   return this._sharedData.timeScale;
    // }

    // setTimeScale(timeScale: float): void {
    //   // Invalid value
    //   if (timeScale < 0) {
    //     return;
    //   }

    //   // Set the time scale
    //   this._sharedData.timeScale = timeScale;
    // }

    // static setTimeScaleFromObject(object, behaviorName, timeScale) {
    //   // Check if the object exist and has the behavior
    //   if (object === null || !object.hasBehavior(behaviorName)) {
    //     return;
    //   }

    //   // Set the time scale
    //   object.getBehavior(behaviorName).setTimeScale(timeScale);
    // }

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
        if (!this.createBody()) return;
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
      this.needToRecreateBody = true;
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
      this.needToRecreateShape = true;
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
        if (!this.createBody()) return;
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
        if (!this.createBody()) return;
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
        if (!this.createBody()) return;
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
        if (!this.createBody()) return;
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
        if (!this.createBody()) return;
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

      this.needToRecreateBody = true;
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

      this.needToRecreateBody = true;
    }

    getLinearVelocityX(): float {
      if (this._body === null) {
        if (!this.createBody()) return 0;
      }
      const body = this._body!;

      return body.GetLinearVelocity().GetX() * this._sharedData.worldScale;
    }

    setLinearVelocityX(linearVelocityX: float): void {
      if (this._body === null) {
        if (!this.createBody()) return;
      }
      const body = this._body!;

      this._sharedData.bodyInterface.SetLinearVelocity(
        body.GetID(),
        this.getVec3(
          linearVelocityX * this._sharedData.worldScale,
          body.GetLinearVelocity().GetY(),
          body.GetLinearVelocity().GetZ()
        )
      );
    }

    getLinearVelocityY(): float {
      if (this._body === null) {
        if (!this.createBody()) return 0;
      }
      const body = this._body!;

      return body.GetLinearVelocity().GetY() * this._sharedData.worldScale;
    }

    setLinearVelocityY(linearVelocityY: float): void {
      if (this._body === null) {
        if (!this.createBody()) return;
      }
      const body = this._body!;

      this._sharedData.bodyInterface.SetLinearVelocity(
        body.GetID(),
        this.getVec3(
          body.GetLinearVelocity().GetX(),
          linearVelocityY * this._sharedData.worldScale,
          body.GetLinearVelocity().GetZ()
        )
      );
    }

    getLinearVelocityZ(): float {
      if (this._body === null) {
        if (!this.createBody()) return 0;
      }
      const body = this._body!;

      return body.GetLinearVelocity().GetZ() * this._sharedData.worldScale;
    }

    setLinearVelocityZ(linearVelocityZ: float): void {
      if (this._body === null) {
        if (!this.createBody()) return;
      }
      const body = this._body!;

      this._sharedData.bodyInterface.SetLinearVelocity(
        body.GetID(),
        this.getVec3(
          body.GetLinearVelocity().GetX(),
          body.GetLinearVelocity().GetY(),
          linearVelocityZ * this._sharedData.worldScale
        )
      );
    }

    getLinearVelocityLength(): float {
      if (this._body === null) {
        if (!this.createBody()) return 0;
      }
      const body = this._body!;

      return body.GetLinearVelocity().Length();
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

    applyForceTowardPosition(
      length: float,
      towardX: float,
      towardY: float,
      towardZ: float
    ): void {
      if (this._body === null) {
        if (!this.createBody()) return;
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
      if (this._body === null) {
        if (!this.createBody()) return;
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
        if (!this.createBody()) return;
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
        if (!this.createBody()) return;
      }
      const body = this._body!;

      this._sharedData.bodyInterface.AddTorque(
        body.GetID(),
        this.getVec3(torqueX, torqueY, torqueZ),
        Jolt.EActivation_Activate
      );
    }

    applyAngularImpulse(
      angularImpulseX: float,
      angularImpulseY: float,
      angularImpulseZ: float
    ): void {
      if (this._body === null) {
        if (!this.createBody()) return;
      }
      const body = this._body!;

      this._sharedData.bodyInterface.AddAngularImpulse(
        body.GetID(),
        this.getVec3(angularImpulseX, angularImpulseY, angularImpulseZ)
      );
    }

    getMass(): float {
      if (this._body === null) {
        if (!this.createBody()) return 0;
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
        if (!this.createBody()) return 0;
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
        if (!this.createBody()) return 0;
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
        if (!this.createBody()) return 0;
      }
      const body = this._body!;

      return 1 / body.GetMotionProperties().GetInverseInertiaDiagonal().GetZ();
    }

    getMassCenterX(): float {
      if (this._body === null) {
        if (!this.createBody()) return 0;
      }
      const body = this._body!;

      return (
        body.GetCenterOfMassPosition().GetX() * this._sharedData.worldScale
      );
    }

    getMassCenterY(): float {
      if (this._body === null) {
        if (!this.createBody()) return 0;
      }
      const body = this._body!;

      return (
        body.GetCenterOfMassPosition().GetY() * this._sharedData.worldScale
      );
    }

    getMassCenterZ(): float {
      if (this._body === null) {
        if (!this.createBody()) return 0;
      }
      const body = this._body!;

      return (
        body.GetCenterOfMassPosition().GetZ() * this._sharedData.worldScale
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
