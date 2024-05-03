namespace Box2D {
  export interface b2Body {
    gdjsAssociatedBehavior: gdjs.Physics2RuntimeBehavior | null;
  }
}
namespace gdjs {
  export interface RuntimeScene {
    physics2SharedData: gdjs.Physics2SharedData | null;
  }
  export class Physics2SharedData {
    gravityX: float;
    gravityY: float;
    scaleX: float;
    scaleY: float;
    invScaleX: float;
    invScaleY: float;
    timeStep: float;
    frameTime: float = 0;
    stepped: boolean = false;
    timeScale: float = 1;
    world: Box2D.b2World;
    staticBody: Box2D.b2Body;

    /** Contact listener to keep track of current collisions */
    contactListener: Box2D.JSContactListener;
    _nextJointId: number = 1;

    /** Start with 1 so the user is safe from default variables value (0) */
    joints: { [key: string]: Box2D.b2Joint } = {};

    /**
     * List of physics behavior in the runtimeScene. It should be updated
     * when a new physics object is created (constructor), on destruction (onDestroy),
     * on behavior activation (onActivate) and on behavior deactivation (onDeActivate).
     */
    _registeredBehaviors: Set<Physics2RuntimeBehavior>;

    constructor(instanceContainer: gdjs.RuntimeInstanceContainer, sharedData) {
      this._registeredBehaviors = new Set();
      this.gravityX = sharedData.gravityX;
      this.gravityY = sharedData.gravityY;
      this.scaleX = sharedData.scaleX === 0 ? 100 : sharedData.scaleX;
      this.scaleY = sharedData.scaleY === 0 ? 100 : sharedData.scaleY;
      this.invScaleX = 1 / this.scaleX;
      this.invScaleY = 1 / this.scaleY;
      this.timeStep = 1 / 60;
      this.world = new Box2D.b2World(
        new Box2D.b2Vec2(this.gravityX, this.gravityY)
      );
      this.world.SetAutoClearForces(false);
      this.staticBody = this.world.CreateBody(new Box2D.b2BodyDef());
      this.contactListener = new Box2D.JSContactListener();
      this.contactListener.BeginContact = function (contactPtr) {
        // Get the contact
        const contact = Box2D.wrapPointer(
          contactPtr as number,
          Box2D.b2Contact
        );

        // There is no body, return
        if (
          contact.GetFixtureA().GetBody() === null ||
          contact.GetFixtureB().GetBody() === null
        ) {
          return;
        }

        // Get associated behaviors
        const behaviorA = contact.GetFixtureA().GetBody()
          .gdjsAssociatedBehavior;
        const behaviorB = contact.GetFixtureB().GetBody()
          .gdjsAssociatedBehavior;

        if (!behaviorA || !behaviorB) {
          return;
        }

        behaviorA.onContactBegin(behaviorB);
        behaviorB.onContactBegin(behaviorA);
      };
      this.contactListener.EndContact = function (contactPtr) {
        // Get the contact
        const contact = Box2D.wrapPointer(
          contactPtr as number,
          Box2D.b2Contact
        );

        // There is no body, return
        if (
          contact.GetFixtureA().GetBody() === null ||
          contact.GetFixtureB().GetBody() === null
        ) {
          return;
        }

        // Get associated behaviors
        const behaviorA = contact.GetFixtureA().GetBody()
          .gdjsAssociatedBehavior as Physics2RuntimeBehavior | null;
        const behaviorB = contact.GetFixtureB().GetBody()
          .gdjsAssociatedBehavior as Physics2RuntimeBehavior | null;

        if (!behaviorA || !behaviorB) {
          return;
        }

        behaviorA.onContactEnd(behaviorB);
        behaviorB.onContactEnd(behaviorA);
      };
      this.contactListener.PreSolve = function () {};
      this.contactListener.PostSolve = function () {};
      this.world.SetContactListener(this.contactListener);
    }

    // (string)jointId -> (b2Joint)b2Joint
    static getSharedData(
      runtimeScene: gdjs.RuntimeScene,
      behaviorName: string
    ): gdjs.Physics2SharedData {
      // Create one if needed
      if (!runtimeScene.physics2SharedData) {
        const initialData = runtimeScene.getInitialSharedDataForBehavior(
          behaviorName
        );
        runtimeScene.physics2SharedData = new gdjs.Physics2SharedData(
          runtimeScene,
          initialData
        );
      }
      return runtimeScene.physics2SharedData;
    }

    /**
     * Add a physics object to the list of existing object.
     */
    addToBehaviorsList(physicsBehavior: gdjs.Physics2RuntimeBehavior): void {
      this._registeredBehaviors.add(physicsBehavior);
    }

    /**
     * Remove a physics object to the list of existing object.
     */
    removeFromBehaviorsList(
      physicsBehavior: gdjs.Physics2RuntimeBehavior
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
      this.frameTime += deltaTime;
      // `frameTime` can take negative values.
      // It's better to be a bit early rather than skipping a frame and being
      // a lot more late.
      let numberOfSteps = Math.max(
        0,
        Math.round(this.frameTime / this.timeStep)
      );
      this.frameTime -= numberOfSteps * this.timeStep;
      if (numberOfSteps > 5) {
        numberOfSteps = 5;
      }
      for (let i = 0; i < numberOfSteps; i++) {
        this.world.Step(this.timeStep * this.timeScale, 8, 10);
      }
      this.world.ClearForces();
      this.stepped = true;
    }

    clearBodyJoints(body: Box2D.b2Body): void {
      // Iterate through all the joints
      for (const jointId in this.joints) {
        if (this.joints.hasOwnProperty(jointId)) {
          // If the joint is attached to the body, delete it
          if (
            this.joints[jointId].GetBodyA() === body ||
            this.joints[jointId].GetBodyB() === body
          ) {
            this.removeJoint(jointId);
          }
        }
      }
    }

    addJoint(joint: Box2D.b2Joint): integer {
      // Add the joint to the list
      this.joints[this._nextJointId.toString(10)] = joint;

      // Return the current joint id and then increase it
      return this._nextJointId++;
    }

    getJoint(jointId: integer | string): Box2D.b2Joint | null {
      // Cast to string
      jointId = jointId.toString(10);

      // Get the joint
      if (this.joints.hasOwnProperty(jointId)) {
        return this.joints[jointId];
      }

      // Joint not found, return null
      return null;
    }

    getJointId(joint: Box2D.b2Joint): integer {
      // Search the joint in the list and return the ID
      for (const jointId in this.joints) {
        if (this.joints.hasOwnProperty(jointId)) {
          if (this.joints[jointId] === joint) {
            return parseInt(jointId, 10);
          }
        }
      }

      // Joint not found, return 0
      return 0;
    }

    removeJoint(jointId: integer | string) {
      // Cast to string
      jointId = jointId.toString(10);

      // Delete the joint
      if (this.joints.hasOwnProperty(jointId)) {
        const joint = this.joints[jointId];

        // If we delete a joint attached to a gear joint, the gear will crash, so we must delete the gear joint first
        // Search in our joints list gear joints attached to this one we want to remove
        // The joint can be attached to a gear joint if it's revolute or prismatic only
        if (
          joint.GetType() === Box2D.e_revoluteJoint ||
          joint.GetType() === Box2D.e_prismaticJoint
        ) {
          for (const jId in this.joints) {
            if (this.joints.hasOwnProperty(jId)) {
              // Must check pointers because gears store non-casted joints (b2Joint)
              if (
                this.joints[jId].GetType() === Box2D.e_gearJoint &&
                (Box2D.getPointer(
                  (this.joints[jId] as Box2D.b2GearJoint).GetJoint1()
                ) === Box2D.getPointer(joint) ||
                  Box2D.getPointer(
                    (this.joints[jId] as Box2D.b2GearJoint).GetJoint2()
                  ) === Box2D.getPointer(joint))
              ) {
                // We could pass it a string, but lets do it right
                this.removeJoint(parseInt(jId, 10));
              }
            }
          }
        }

        // Remove the joint
        this.world.DestroyJoint(joint);
        delete this.joints[jointId];
      }
    }
  }
  gdjs.registerRuntimeSceneUnloadedCallback(function (runtimeScene) {
    if (
      // @ts-ignore
      runtimeScene.physics2SharedData &&
      // @ts-ignore
      runtimeScene.physics2SharedData.world
    ) {
      // @ts-ignore
      Box2D.destroy(runtimeScene.physics2SharedData.world);
    }
  });

  export class Physics2RuntimeBehavior extends gdjs.RuntimeBehavior {
    bodyType: string;
    bullet: boolean;
    fixedRotation: boolean;
    canSleep: boolean;
    shape: string;
    shapeDimensionA: any;
    shapeDimensionB: any;
    shapeOffsetX: float;
    shapeOffsetY: float;
    polygonOrigin: string;
    polygon: gdjs.Polygon | null;
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
    contactsStartedThisFrame: Array<Physics2RuntimeBehavior>;

    /**
     * Array containing the end of contacts reported by onContactEnd. The array is updated
     * each time the method onContactEnd is called by the listener, which can be called at
     * any time. This array is cleared just before stepping the world.
     */
    contactsEndedThisFrame: Array<Physics2RuntimeBehavior>;

    /**
     * Array containing the exact current contacts with the objects. It is updated
     * each time the methods onContactBegin and onContactEnd are called by the contact
     * listener.
     */
    currentContacts: Array<Physics2RuntimeBehavior>;
    destroyedDuringFrameLogic: boolean;
    _body: Box2D.b2Body | null = null;
    /** Avoid creating new vectors all the time */
    _tempb2Vec2: Box2D.b2Vec2;

    /**
     * sharedData is a reference to the shared data of the scene, that registers
     * every physics behavior that is created so that collisions can be cleared
     * before stepping the world.
     */
    _sharedData: Physics2SharedData;
    /** Sometimes two vectors are needed on the same function call */
    _tempb2Vec2Sec: Box2D.b2Vec2;

    _objectOldX: number = 0;
    _objectOldY: number = 0;
    _objectOldAngle: float = 0;
    _objectOldWidth: float = 0;
    _objectOldHeight: float = 0;
    _verticesBuffer: integer = 0;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      behaviorData,
      owner: gdjs.RuntimeObject
    ) {
      super(instanceContainer, behaviorData, owner);
      this.bodyType = behaviorData.bodyType;
      this.bullet = behaviorData.bullet;
      this.fixedRotation = behaviorData.fixedRotation;
      this.canSleep = behaviorData.canSleep;
      this.shape = behaviorData.shape;
      this.shapeDimensionA = behaviorData.shapeDimensionA;
      this.shapeDimensionB = behaviorData.shapeDimensionB;
      this.shapeOffsetX = behaviorData.shapeOffsetX;
      this.shapeOffsetY = behaviorData.shapeOffsetY;
      this.polygonOrigin = behaviorData.polygonOrigin;
      this.polygon =
        this.shape === 'Polygon'
          ? Physics2RuntimeBehavior.getPolygon(behaviorData.vertices)
          : null;
      this.density = behaviorData.density;
      this.friction = behaviorData.friction;
      this.restitution = behaviorData.restitution;
      this.linearDamping = behaviorData.linearDamping;
      this.angularDamping = behaviorData.angularDamping;
      this.gravityScale = behaviorData.gravityScale;
      this.layers = behaviorData.layers;
      this.masks = behaviorData.masks;
      this.contactsStartedThisFrame = [];
      this.contactsEndedThisFrame = [];
      this.currentContacts = [];
      this.currentContacts.length = 0;
      this.destroyedDuringFrameLogic = false;
      this._sharedData = Physics2SharedData.getSharedData(
        instanceContainer.getScene(),
        behaviorData.name
      );
      this._tempb2Vec2 = new Box2D.b2Vec2();
      this._tempb2Vec2Sec = new Box2D.b2Vec2();
      this._sharedData.addToBehaviorsList(this);
    }

    // Stores a Box2D pointer of created vertices
    b2Vec2(x: float, y: float): Box2D.b2Vec2 {
      this._tempb2Vec2.set_x(x);
      this._tempb2Vec2.set_y(y);
      return this._tempb2Vec2;
    }

    b2Vec2Sec(x: float, y: float): Box2D.b2Vec2 {
      this._tempb2Vec2Sec.set_x(x);
      this._tempb2Vec2Sec.set_y(y);
      return this._tempb2Vec2Sec;
    }

    updateFromBehaviorData(oldBehaviorData, newBehaviorData): boolean {
      if (oldBehaviorData.bullet !== newBehaviorData.bullet) {
        this.setBullet(newBehaviorData.bullet);
      }
      if (oldBehaviorData.fixedRotation !== newBehaviorData.fixedRotation) {
        this.setFixedRotation(newBehaviorData.fixedRotation);
      }
      if (oldBehaviorData.canSleep !== newBehaviorData.canSleep) {
        this.setSleepingAllowed(newBehaviorData.canSleep);
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
      if (oldBehaviorData.polygonOrigin !== newBehaviorData.polygonOrigin) {
        this.polygonOrigin = newBehaviorData.polygonOrigin;
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

    onDeActivate() {
      this._sharedData.removeFromBehaviorsList(this);
      if (this._body !== null) {
        // When a body is deleted, Box2D removes automatically its joints, leaving an invalid pointer in our joints list
        this._sharedData.clearBodyJoints(this._body);

        // Delete the vertices
        if (this._verticesBuffer) {
          Box2D._free(this._verticesBuffer);
          this._verticesBuffer = 0;
        }

        // Delete the body
        this._sharedData.world.DestroyBody(this._body);
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

    static getPolygon(verticesData: Box2D.b2Vec2[]): gdjs.Polygon | null {
      if (!verticesData) {
        return null;
      }
      const polygon = new gdjs.Polygon();
      const maxVertices = 8;
      for (
        let i = 0, len = verticesData.length;
        i < Math.min(len, maxVertices);
        i++
      ) {
        polygon.vertices.push([verticesData[i].x, verticesData[i].y]);
      }
      return polygon;
    }

    static isPolygonConvex(polygon: gdjs.Polygon): boolean {
      if (!polygon.isConvex()) {
        return false;
      }

      // Check for repeated vertices or check if all vertices are aligned (would crash Box2D)
      let alignedX = true;
      let alignedY = true;
      for (let i = 0; i < polygon.vertices.length - 1; ++i) {
        for (let j = i + 1; j < polygon.vertices.length; ++j) {
          if (
            polygon.vertices[i][0] === polygon.vertices[j][0] &&
            polygon.vertices[i][1] === polygon.vertices[j][1]
          ) {
            return false;
          }
        }
        if (polygon.vertices[i][0] !== polygon.vertices[i + 1][0]) {
          alignedX = false;
        }
        if (polygon.vertices[i][1] !== polygon.vertices[i + 1][1]) {
          alignedY = false;
        }
      }
      if (alignedX || alignedY) {
        return false;
      }
      return true;
    }

    createShape(): Box2D.b2FixtureDef {
      // Get the scaled offset
      const offsetX = this.shapeOffsetX
        ? this.shapeOffsetX * this.shapeScale * this._sharedData.invScaleX
        : 0;
      const offsetY = this.shapeOffsetY
        ? this.shapeOffsetY * this.shapeScale * this._sharedData.invScaleY
        : 0;

      // Generate the base shape
      let shape;
      if (this.shape === 'Circle') {
        shape = new Box2D.b2CircleShape();

        // Radius determined by the custom dimension
        // Average radius from width and height
        if (this.shapeDimensionA > 0) {
          shape.set_m_radius(
            this.shapeDimensionA * this.shapeScale * this._sharedData.invScaleX
          );
        } else {
          const radius =
            (this.owner.getWidth() * this._sharedData.invScaleX +
              this.owner.getHeight() * this._sharedData.invScaleY) /
            4;
          shape.set_m_radius(radius > 0 ? radius : 1);
        }

        // Set the offset
        shape.set_m_p(this.b2Vec2(offsetX, offsetY));
      } else {
        if (this.shape === 'Polygon') {
          shape = new Box2D.b2PolygonShape();

          // Not convex, fall back to a box
          if (
            !this.polygon ||
            !Physics2RuntimeBehavior.isPolygonConvex(this.polygon)
          ) {
            let width =
              (this.owner.getWidth() > 0 ? this.owner.getWidth() : 1) *
              this._sharedData.invScaleX;
            let height =
              (this.owner.getHeight() > 0 ? this.owner.getHeight() : 1) *
              this._sharedData.invScaleY;

            // Set the shape box
            shape.SetAsBox(
              width / 2,
              height / 2,
              this.b2Vec2(offsetX, offsetY),
              0
            );
          } else {
            let originOffsetX = 0;
            let originOffsetY = 0;
            if (this.polygonOrigin === 'Origin') {
              originOffsetX =
                (this.owner.getWidth() > 0 ? -this.owner.getWidth() / 2 : 0) +
                (this.owner.getX() - this.owner.getDrawableX());
              originOffsetY =
                (this.owner.getHeight() > 0 ? -this.owner.getHeight() / 2 : 0) +
                (this.owner.getY() - this.owner.getDrawableY());
            } else {
              if (this.polygonOrigin === 'TopLeft') {
                originOffsetX =
                  this.owner.getWidth() > 0 ? -this.owner.getWidth() / 2 : 0;
                originOffsetY =
                  this.owner.getHeight() > 0 ? -this.owner.getHeight() / 2 : 0;
              }
            }

            // Generate vertices if not done already
            if (!this._verticesBuffer) {
              // Store the vertices using a memory allocation function
              const buffer = Box2D._malloc(
                this.polygon.vertices.length * 8,
                'float',
                Box2D.ALLOC_STACK
              );
              this._verticesBuffer = buffer;
            }

            // Overwrite the vertices stored in the buffer
            let offset = 0;
            for (let i = 0, len = this.polygon.vertices.length; i < len; i++) {
              Box2D.HEAPF32[(this._verticesBuffer + offset) >> 2] =
                (this.polygon.vertices[i][0] * this.shapeScale +
                  originOffsetX) *
                  this._sharedData.invScaleX +
                offsetX;
              Box2D.HEAPF32[(this._verticesBuffer + (offset + 4)) >> 2] =
                (this.polygon.vertices[i][1] * this.shapeScale +
                  originOffsetY) *
                  this._sharedData.invScaleY +
                offsetY;
              offset += 8;
            }

            // Set the shape vertices
            const b2Vertices = Box2D.wrapPointer(
              this._verticesBuffer,
              Box2D.b2Vec2
            );
            shape.Set(b2Vertices, this.polygon.vertices.length);
          }
        } else {
          if (this.shape === 'Edge') {
            shape = new Box2D.b2EdgeShape();

            // Length from the custom dimension or from the object width
            const length =
              (this.shapeDimensionA > 0
                ? this.shapeDimensionA * this.shapeScale
                : this.owner.getWidth() > 0
                ? this.owner.getWidth()
                : 1) * this._sharedData.invScaleX;
            let height =
              this.owner.getHeight() > 0
                ? this.owner.getHeight() * this._sharedData.invScaleY
                : 0;

            // Angle from custom dimension, otherwise is 0
            const angle = this.shapeDimensionB
              ? gdjs.toRad(this.shapeDimensionB)
              : 0;

            // Set the edge vertices from the length, the angle and the offset
            shape.Set(
              this.b2Vec2(
                (-length / 2) * Math.cos(angle) + offsetX,
                height / 2 - (length / 2) * Math.sin(angle) + offsetY
              ),
              this.b2Vec2Sec(
                (length / 2) * Math.cos(angle) + offsetX,
                height / 2 + (length / 2) * Math.sin(angle) + offsetY
              )
            );
          } else {
            // Box
            shape = new Box2D.b2PolygonShape();

            // Width and height from custom dimensions or object size
            let width =
              (this.shapeDimensionA > 0
                ? this.shapeDimensionA * this.shapeScale
                : this.owner.getWidth() > 0
                ? this.owner.getWidth()
                : 1) * this._sharedData.invScaleX;
            let height =
              (this.shapeDimensionB > 0
                ? this.shapeDimensionB * this.shapeScale
                : this.owner.getHeight() > 0
                ? this.owner.getHeight()
                : 1) * this._sharedData.invScaleY;

            // Set the shape box, the offset must be added here too
            shape.SetAsBox(
              width / 2,
              height / 2,
              this.b2Vec2(offsetX, offsetY),
              0
            );
          }
        }
      }

      // Generate filter data
      const filter = new Box2D.b2Filter();
      filter.set_categoryBits(this.layers);
      filter.set_maskBits(this.masks);

      // Generate the fixture definition
      const fixDef = new Box2D.b2FixtureDef();

      // Set fixture settings
      fixDef.set_shape(shape);
      fixDef.set_filter(filter);
      if (this.density < 0) {
        this.density = 0;
      }
      fixDef.set_density(this.density);
      if (this.friction < 0) {
        this.friction = 0;
      }
      fixDef.set_friction(this.friction);
      if (this.restitution < 0) {
        this.restitution = 0;
      }
      fixDef.set_restitution(this.restitution);

      // Return the fixture
      return fixDef;
    }

    recreateShape(): void {
      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return;
      }
      const body = this._body!;

      // Destroy the old shape
      body.DestroyFixture(body.GetFixtureList());
      body.CreateFixture(this.createShape());

      // Update cached size
      this._objectOldWidth = this.owner.getWidth();
      this._objectOldHeight = this.owner.getHeight();
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

    getBody(): Box2D.b2Body {
      // If there is no body, set a new one
      if (this._body === null) {
        this.createBody();
      }
      return this._body!;
    }

    createBody(): boolean {
      if (!this.activated() || this.destroyedDuringFrameLogic) return false;
      // Generate the body definition
      const bodyDef = new Box2D.b2BodyDef();

      // Set the initial body transformation from the GD object
      bodyDef.set_position(
        this.b2Vec2(
          (this.owner.getDrawableX() + this.owner.getWidth() / 2) *
            this._sharedData.invScaleX,
          (this.owner.getDrawableY() + this.owner.getHeight() / 2) *
            this._sharedData.invScaleY
        )
      );
      bodyDef.set_angle(gdjs.toRad(this.owner.getAngle()));

      // Set body settings
      bodyDef.set_type(
        this.bodyType === 'Static'
          ? Box2D.b2_staticBody
          : this.bodyType === 'Kinematic'
          ? Box2D.b2_kinematicBody
          : Box2D.b2_dynamicBody
      );
      bodyDef.set_bullet(this.bullet);
      bodyDef.set_fixedRotation(this.fixedRotation);
      bodyDef.set_allowSleep(this.canSleep);
      bodyDef.set_linearDamping(this.linearDamping);
      bodyDef.set_angularDamping(this.angularDamping);
      bodyDef.set_gravityScale(this.gravityScale);

      // Create the body
      this._body = this._sharedData.world.CreateBody(bodyDef);
      this._body.CreateFixture(this.createShape());
      this._body.gdjsAssociatedBehavior = this;

      // Update cached size
      this._objectOldWidth = this.owner.getWidth();
      this._objectOldHeight = this.owner.getHeight();
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
        this.owner.setX(
          this._body.GetPosition().get_x() * this._sharedData.scaleX -
            this.owner.getWidth() / 2 +
            this.owner.getX() -
            this.owner.getDrawableX()
        );
        this.owner.setY(
          this._body.GetPosition().get_y() * this._sharedData.scaleY -
            this.owner.getHeight() / 2 +
            this.owner.getY() -
            this.owner.getDrawableY()
        );
        this.owner.setAngle(gdjs.toDegrees(this._body.GetAngle()));
      }

      // Update cached transform.
      this._objectOldX = this.owner.getX();
      this._objectOldY = this.owner.getY();
      this._objectOldAngle = this.owner.getAngle();
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
        (this._objectOldWidth !== this.owner.getWidth() &&
          this.shapeDimensionA <= 0) ||
        (this._objectOldHeight !== this.owner.getHeight() &&
          this.shape !== 'Edge' &&
          !(this.shape === 'Box' && this.shapeDimensionB > 0) &&
          !(this.shape === 'Circle' && this.shapeDimensionA > 0))
      ) {
        this.recreateShape();
      }

      // The object object transform has changed, update body transform:
      if (
        this._objectOldX !== this.owner.getX() ||
        this._objectOldY !== this.owner.getY() ||
        this._objectOldAngle !== this.owner.getAngle()
      ) {
        const pos = this.b2Vec2(
          (this.owner.getDrawableX() + this.owner.getWidth() / 2) *
            this._sharedData.invScaleX,
          (this.owner.getDrawableY() + this.owner.getHeight() / 2) *
            this._sharedData.invScaleY
        );
        body.SetTransform(pos, gdjs.toRad(this.owner.getAngle()));
        body.SetAwake(true);
      }
    }

    getGravityX(): float {
      return this._sharedData.gravityX;
    }

    getGravityY(): float {
      return this._sharedData.gravityY;
    }

    setGravity(x: float, y: float): void {
      // Check if there is no modification
      if (this._sharedData.gravityX === x && this._sharedData.gravityY === y) {
        return;
      }

      // Change the gravity
      this._sharedData.gravityX = x;
      this._sharedData.gravityY = y;
      this._sharedData.world.SetGravity(
        this.b2Vec2(this._sharedData.gravityX, this._sharedData.gravityY)
      );
    }

    getTimeScale(): float {
      // Get the time scale
      return this._sharedData.timeScale;
    }

    setTimeScale(timeScale: float): void {
      // Invalid value
      if (timeScale < 0) {
        return;
      }

      // Set the time scale
      this._sharedData.timeScale = timeScale;
    }

    static setTimeScaleFromObject(object, behaviorName, timeScale) {
      // Check if the object exist and has the behavior
      if (object === null || !object.hasBehavior(behaviorName)) {
        return;
      }

      // Set the time scale
      object.getBehavior(behaviorName).setTimeScale(timeScale);
    }

    isDynamic(): boolean {
      return this.bodyType === 'Dynamic';
    }

    setDynamic(): void {
      // Check if there is no modification
      if (this.bodyType === 'Dynamic') {
        return;
      }

      // Change body type
      this.bodyType = 'Dynamic';

      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return;
      }
      const body = this._body!;

      // Update body type
      body.SetType(Box2D.b2_dynamicBody);
      body.SetAwake(true);
    }

    isStatic(): boolean {
      return this.bodyType === 'Static';
    }

    setStatic(): void {
      // Check if there is no modification
      if (this.bodyType === 'Static') {
        return;
      }

      // Change body type
      this.bodyType = 'Static';

      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return;
      }
      const body = this._body!;

      // Update body type
      body.SetType(Box2D.b2_staticBody);
      body.SetAwake(true);
    }

    isKinematic(): boolean {
      return this.bodyType === 'Kinematic';
    }

    setKinematic(): void {
      // Check if there is no modification
      if (this.bodyType === 'Kinematic') {
        return;
      }

      // Change body type
      this.bodyType = 'Kinematic';

      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return;
      }
      const body = this._body!;

      // Update body type
      body.SetType(Box2D.b2_kinematicBody);
      body.SetAwake(true);
    }

    isBullet(): boolean {
      return this.bullet;
    }

    setBullet(enable: boolean): void {
      // Check if there is no modification
      if (this.bullet === enable) {
        return;
      }

      // Change bullet flag
      this.bullet = enable;

      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return;
      }
      const body = this._body!;

      // Update body bullet flag
      body.SetBullet(this.bullet);
    }

    hasFixedRotation(): boolean {
      return this.fixedRotation;
    }

    setFixedRotation(enable: boolean): void {
      this.fixedRotation = enable;
      if (this._body === null) {
        if (!this.createBody()) return;
      }
      const body = this._body!;
      body.SetFixedRotation(this.fixedRotation);
    }

    isSleepingAllowed(): boolean {
      return this.canSleep;
    }

    setSleepingAllowed(enable: boolean): void {
      this.canSleep = enable;
      if (this._body === null) {
        if (!this.createBody()) return;
      }
      const body = this._body!;
      body.SetSleepingAllowed(this.canSleep);
    }

    isSleeping(): boolean {
      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return true;
      }
      const body = this._body!;

      // Get the body sleeping state
      return !body.IsAwake();
    }

    getDensity() {
      return this.density;
    }

    setDensity(density: float): void {
      // Non-negative values only
      if (density < 0) {
        density = 0;
      }

      // Check if there is no modification
      if (this.density === density) {
        return;
      }

      // Change density
      this.density = density;

      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return;
      }
      const body = this._body!;

      // Update the body density
      body.GetFixtureList().SetDensity(this.density);
      body.ResetMassData();
    }

    getFriction(): float {
      return this.friction;
    }

    setFriction(friction): void {
      // Non-negative values only
      if (friction < 0) {
        friction = 0;
      }

      // Check if there is no modification
      if (this.friction === friction) {
        return;
      }

      // Change friction
      this.friction = friction;

      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return;
      }
      const body = this._body!;

      // Update the body friction
      body.GetFixtureList().SetFriction(this.friction);

      // Update contacts
      let contact = body.GetContactList();
      while (Box2D.getPointer(contact)) {
        contact.get_contact().ResetFriction();
        contact = contact.get_next();
      }
    }

    getRestitution(): float {
      return this.restitution;
    }

    setRestitution(restitution: float): void {
      // Non-negative values only
      if (restitution < 0) {
        restitution = 0;
      }

      // Check if there is no modification
      if (this.restitution === restitution) {
        return;
      }

      // Change restitution
      this.restitution = restitution;

      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return;
      }
      const body = this._body!;

      // Update the body restitution
      body.GetFixtureList().SetRestitution(this.restitution);

      // Update contacts
      let contact = body.GetContactList();
      while (Box2D.getPointer(contact)) {
        contact.get_contact().ResetRestitution();
        contact = contact.get_next();
      }
    }

    getLinearDamping(): float {
      return this.linearDamping;
    }

    setLinearDamping(linearDamping: float): void {
      // Check if there is no modification
      if (this.linearDamping === linearDamping) {
        return;
      }

      // Change linearDamping
      this.linearDamping = linearDamping;

      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return;
      }
      const body = this._body!;

      // Update the body linear damping
      body.SetLinearDamping(this.linearDamping);
    }

    getAngularDamping(): float {
      return this.angularDamping;
    }

    setAngularDamping(angularDamping: float): void {
      // Check if there is no modification
      if (this.angularDamping === angularDamping) {
        return;
      }

      // Change angularDamping
      this.angularDamping = angularDamping;

      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return;
      }
      const body = this._body!;

      // Update the body angular damping
      body.SetAngularDamping(this.angularDamping);
    }

    getGravityScale(): float {
      return this.gravityScale;
    }

    setGravityScale(gravityScale: float): void {
      // Check if there is no modification
      if (this.gravityScale === gravityScale) {
        return;
      }

      // Change the gravity scale
      this.gravityScale = gravityScale;

      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return;
      }
      const body = this._body!;

      // Update the body gravity scale
      body.SetGravityScale(this.gravityScale);
    }

    layerEnabled(layer: integer) {
      // Layer must be an integer
      layer = Math.floor(layer);

      // Layer must be in range [1, 16]
      if (layer < 1 || layer > 16) {
        return false;
      }
      return !!(this.layers & (1 << (layer - 1)));
    }

    enableLayer(layer: integer, enable: boolean): void {
      // Layer must be an integer
      layer = Math.floor(layer);

      // Layer must be in range [1, 16]
      if (layer < 1 || layer > 16) {
        return;
      }

      // Change the layers
      if (enable) {
        this.layers |= 1 << (layer - 1);
      } else {
        this.layers &= ~(1 << (layer - 1));
      }

      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return;
      }
      const body = this._body!;

      // Update the body layers
      const filter = body.GetFixtureList().GetFilterData();
      filter.set_categoryBits(this.layers);
      body.GetFixtureList().SetFilterData(filter);
    }

    maskEnabled(mask: integer): boolean {
      // Mask must be an integer
      mask = Math.floor(mask);

      // Mask must be in range [1, 16]
      if (mask < 1 || mask > 16) {
        return false;
      }
      return !!(this.masks & (1 << (mask - 1)));
    }

    enableMask(mask: integer, enable: boolean): void {
      // Mask must be an integer
      mask = Math.floor(mask);

      // Mask must be in range [1, 16]
      if (mask < 1 || mask > 16) {
        return;
      }

      // Change the masks
      if (enable) {
        this.masks |= 1 << (mask - 1);
      } else {
        this.masks &= ~(1 << (mask - 1));
      }

      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return;
      }
      const body = this._body!;

      // Update the body masks
      const filter = body.GetFixtureList().GetFilterData();
      filter.set_maskBits(this.masks);
      body.GetFixtureList().SetFilterData(filter);
    }

    getLinearVelocityX(): float {
      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return 0;
      }
      const body = this._body!;

      // Get the linear velocity on X
      return body.GetLinearVelocity().get_x() * this._sharedData.scaleX;
    }

    setLinearVelocityX(linearVelocityX: float): void {
      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return;
      }
      const body = this._body!;

      // Set the linear velocity on X
      body.SetLinearVelocity(
        this.b2Vec2(
          linearVelocityX * this._sharedData.invScaleX,
          body.GetLinearVelocity().get_y()
        )
      );
    }

    getLinearVelocityY(): float {
      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return 0;
      }
      const body = this._body!;

      // Get the linear velocity on Y
      return body.GetLinearVelocity().get_y() * this._sharedData.scaleY;
    }

    setLinearVelocityY(linearVelocityY: float): void {
      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return;
      }
      const body = this._body!;

      // Set the linear velocity on Y
      body.SetLinearVelocity(
        this.b2Vec2(
          body.GetLinearVelocity().get_x(),
          linearVelocityY * this._sharedData.invScaleY
        )
      );
    }

    getLinearVelocityLength(): float {
      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return 0;
      }
      const body = this._body!;

      // Get the linear velocity length
      return this.b2Vec2(
        body.GetLinearVelocity().get_x() * this._sharedData.scaleX,
        body.GetLinearVelocity().get_y() * this._sharedData.scaleY
      ).Length();
    }

    getLinearVelocityAngle(): float {
      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return 0;
      }
      const body = this._body!;

      // Get the linear velocity angle
      return gdjs.toDegrees(
        Math.atan2(
          body.GetLinearVelocity().get_y() * this._sharedData.scaleY,
          body.GetLinearVelocity().get_x() * this._sharedData.scaleX
        )
      );
    }

    setLinearVelocityAngle(angle: float, linearVelocity: float): void {
      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return;
      }
      const body = this._body!;

      // Set the linear velocity toward an angle
      angle = gdjs.toRad(angle);
      body.SetLinearVelocity(
        this.b2Vec2(
          linearVelocity * Math.cos(angle) * this._sharedData.invScaleX,
          linearVelocity * Math.sin(angle) * this._sharedData.invScaleY
        )
      );
    }

    getAngularVelocity(): float {
      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return 0;
      }
      const body = this._body!;

      // Get the angular velocity
      return gdjs.toDegrees(body.GetAngularVelocity());
    }

    setAngularVelocity(angularVelocity: float): void {
      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return;
      }
      const body = this._body!;

      // Set the angular velocity
      body.SetAngularVelocity(gdjs.toRad(angularVelocity));
    }

    applyForce(
      forceX: float,
      forceY: float,
      positionX: float,
      positionY: float
    ): void {
      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return;
      }
      const body = this._body!;

      // Wake up the object
      body.SetAwake(true);

      // Apply the force
      body.ApplyForce(
        this.b2Vec2(forceX, forceY),
        this.b2Vec2Sec(
          positionX * this._sharedData.invScaleX,
          positionY * this._sharedData.invScaleY
        ),
        // TODO Should let Box2d awake the object itself.
        false
      );
    }

    applyPolarForce(
      angle: float,
      length: float,
      positionX: float,
      positionY: float
    ): void {
      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return;
      }
      const body = this._body!;

      // Wake up the object
      body.SetAwake(true);

      // Apply the force
      angle = gdjs.toRad(angle);
      body.ApplyForce(
        this.b2Vec2(length * Math.cos(angle), length * Math.sin(angle)),
        this.b2Vec2Sec(
          positionX * this._sharedData.invScaleX,
          positionY * this._sharedData.invScaleY
        ),
        // TODO Should let Box2d awake the object itself.
        false
      );
    }

    applyForceTowardPosition(
      length: float,
      towardX: float,
      towardY: float,
      positionX: float,
      positionY: float
    ): void {
      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return;
      }
      const body = this._body!;

      // Wake up the object
      body.SetAwake(true);

      // Apply the force
      const angle = Math.atan2(
        towardY * this._sharedData.invScaleY - body.GetPosition().get_y(),
        towardX * this._sharedData.invScaleX - body.GetPosition().get_x()
      );
      body.ApplyForce(
        this.b2Vec2(length * Math.cos(angle), length * Math.sin(angle)),
        this.b2Vec2Sec(
          positionX * this._sharedData.invScaleX,
          positionY * this._sharedData.invScaleY
        ),
        // TODO Should let Box2d awake the object itself.
        false
      );
    }

    applyImpulse(
      impulseX: float,
      impulseY: float,
      positionX: float,
      positionY: float
    ): void {
      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return;
      }
      const body = this._body!;

      // Wake up the object
      body.SetAwake(true);

      // Apply the impulse
      body.ApplyLinearImpulse(
        this.b2Vec2(impulseX, impulseY),
        this.b2Vec2Sec(
          positionX * this._sharedData.invScaleX,
          positionY * this._sharedData.invScaleY
        ),
        // TODO Should let Box2d awake the object itself.
        false
      );
    }

    applyPolarImpulse(
      angle: float,
      length: float,
      positionX: float,
      positionY: float
    ): void {
      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return;
      }
      const body = this._body!;

      // Wake up the object
      body.SetAwake(true);

      // Apply the impulse
      angle = gdjs.toRad(angle);
      body.ApplyLinearImpulse(
        this.b2Vec2(length * Math.cos(angle), length * Math.sin(angle)),
        this.b2Vec2Sec(
          positionX * this._sharedData.invScaleX,
          positionY * this._sharedData.invScaleY
        ),
        // TODO Should let Box2d awake the object itself.
        false
      );
    }

    applyImpulseTowardPosition(
      length: float,
      towardX: float,
      towardY: float,
      positionX: float,
      positionY: float
    ): void {
      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return;
      }
      const body = this._body!;

      // Wake up the object
      body.SetAwake(true);

      // Apply the impulse
      const angle = Math.atan2(
        towardY * this._sharedData.invScaleY - body.GetPosition().get_y(),
        towardX * this._sharedData.invScaleX - body.GetPosition().get_x()
      );
      body.ApplyLinearImpulse(
        this.b2Vec2(length * Math.cos(angle), length * Math.sin(angle)),
        this.b2Vec2Sec(
          positionX * this._sharedData.invScaleX,
          positionY * this._sharedData.invScaleY
        ),
        // TODO Should let Box2d awake the object itself.
        false
      );
    }

    applyTorque(torque: float): void {
      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return;
      }
      const body = this._body!;

      // Wake up the object
      body.SetAwake(true);

      // Apply the torque
      body.ApplyTorque(
        torque,
        // TODO Should let Box2d awake the object itself.
        false
      );
    }

    applyAngularImpulse(angularImpulse: float): void {
      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return;
      }
      const body = this._body!;

      // Wake up the object
      body.SetAwake(true);

      // Apply the angular impulse
      body.ApplyAngularImpulse(
        angularImpulse,
        // TODO Should let Box2d awake the object itself.
        false
      );
    }

    getMass(): float {
      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return 0;
      }
      const body = this._body!;

      // Wake up the object
      body.SetAwake(true);

      return body.GetMass();
    }

    getInertia(): float {
      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return 0;
      }
      const body = this._body!;

      // Wake up the object
      body.SetAwake(true);

      return body.GetInertia();
    }

    getMassCenterX(): float {
      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return 0;
      }
      const body = this._body!;

      // Get the mass center on X
      return body.GetWorldCenter().get_x() * this._sharedData.scaleX;
    }

    getMassCenterY(): float {
      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return 0;
      }
      const body = this._body!;

      // Get the mass center on Y
      return body.GetWorldCenter().get_y() * this._sharedData.scaleY;
    }

    // Joints
    isJointFirstObject(jointId: integer | string): boolean {
      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return false;
      }

      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found
      if (joint === null) {
        return false;
      }

      // Check the joint object
      return joint.GetBodyA() === this._body;
    }

    isJointSecondObject(jointId: integer | string): boolean {
      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return false;
      }

      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found
      if (joint === null) {
        return false;
      }

      // Check the joint object
      return joint.GetBodyB() === this._body;
    }

    getJointFirstAnchorX(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found
      if (joint === null) {
        return 0;
      }

      // Get the joint anchor
      // @ts-ignore GetLocalAnchorA is implemented by any joint but is not in the interface.
      return joint.GetBodyA().GetWorldPoint(joint.GetLocalAnchorA()).get_x();
    }

    getJointFirstAnchorY(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found
      if (joint === null) {
        return 0;
      }

      // Get the joint anchor
      // @ts-ignore GetLocalAnchorA is implemented by any joint but is not in the interface.
      return joint.GetBodyA().GetWorldPoint(joint.GetLocalAnchorA()).get_y();
    }

    getJointSecondAnchorX(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found
      if (joint === null) {
        return 0;
      }

      // Get the joint anchor
      // @ts-ignore GetLocalAnchorA is implemented by any joint but is not in the interface.
      return joint.GetBodyB().GetWorldPoint(joint.GetLocalAnchorB()).get_x();
    }

    getJointSecondAnchorY(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found
      if (joint === null) {
        return 0;
      }

      // Get the joint anchor
      // @ts-ignore GetLocalAnchorA is implemented by any joint but is not in the interface.
      return joint.GetBodyB().GetWorldPoint(joint.GetLocalAnchorB()).get_y();
    }

    getJointReactionForce(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found
      if (joint === null) {
        return 0;
      }

      // Get the reaction force
      return joint.GetReactionForce(1 / this._sharedData.timeStep).Length();
    }

    getJointReactionTorque(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found
      if (joint === null) {
        return 0;
      }

      // Get the reaction torque
      return joint.GetReactionTorque(1 / this._sharedData.timeStep);
    }

    removeJoint(jointId: integer | string): void {
      // Just let the sharedData to manage and delete the joint
      this._sharedData.removeJoint(jointId);
    }

    // Distance joint
    addDistanceJoint(
      x1: float,
      y1: float,
      other: gdjs.RuntimeObject | null,
      x2: float,
      y2: float,
      length: float,
      frequency: float,
      dampingRatio: float,
      collideConnected: boolean,
      variable: gdjs.Variable
    ): void {
      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return;
      }
      const body = this._body!;

      // If there is no second object or it doesn't share the behavior, return
      if (other == null || !other.hasBehavior(this.name)) {
        return;
      }

      // Get the second body
      const otherBody = (other.getBehavior(
        this.name
      ) as gdjs.Physics2RuntimeBehavior).getBody();

      // If the first and second objects/bodies are the same, return
      if (this._body === otherBody) {
        return;
      }

      // Set joint settings
      const jointDef = new Box2D.b2DistanceJointDef();
      jointDef.set_bodyA(body);
      jointDef.set_localAnchorA(
        body.GetLocalPoint(
          this.b2Vec2(
            x1 * this._sharedData.invScaleX,
            y1 * this._sharedData.invScaleY
          )
        )
      );
      jointDef.set_bodyB(otherBody);
      jointDef.set_localAnchorB(
        otherBody.GetLocalPoint(
          this.b2Vec2(
            x2 * this._sharedData.invScaleX,
            y2 * this._sharedData.invScaleY
          )
        )
      );
      jointDef.set_length(
        length > 0
          ? length * this._sharedData.invScaleX
          : this.b2Vec2(
              (x2 - x1) * this._sharedData.invScaleX,
              (y2 - y1) * this._sharedData.invScaleY
            ).Length()
      );
      jointDef.set_frequencyHz(frequency >= 0 ? frequency : 0);
      jointDef.set_dampingRatio(dampingRatio >= 0 ? dampingRatio : 1);
      jointDef.set_collideConnected(collideConnected);

      // Create the joint and get the id
      const jointId = this._sharedData.addJoint(
        Box2D.castObject(
          this._sharedData.world.CreateJoint(jointDef),
          Box2D.b2DistanceJoint
        )
      );

      // Store the id in the variable
      variable.setNumber(jointId);
    }

    getDistanceJointLength(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2DistanceJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_distanceJoint) {
        return 0;
      }

      // Get the joint length
      return joint.GetLength() * this._sharedData.scaleX;
    }

    setDistanceJointLength(jointId: integer | string, length: float): void {
      // Invalid value
      if (length <= 0) {
        return;
      }

      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2DistanceJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_distanceJoint) {
        return;
      }

      // Set the joint length
      joint.SetLength(length * this._sharedData.invScaleX);

      // Awake the bodies
      joint.GetBodyA().SetAwake(true);
      joint.GetBodyB().SetAwake(true);
    }

    getDistanceJointFrequency(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2DistanceJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_distanceJoint) {
        return 0;
      }

      // Get the joint frequency
      return joint.GetFrequency();
    }

    setDistanceJointFrequency(
      jointId: integer | string,
      frequency: float
    ): void {
      // Invalid value
      if (frequency < 0) {
        return;
      }

      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2DistanceJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_distanceJoint) {
        return;
      }

      // Set the joint frequency
      joint.SetFrequency(frequency);
    }

    getDistanceJointDampingRatio(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2DistanceJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_distanceJoint) {
        return 0;
      }

      // Get the joint damping ratio
      return joint.GetDampingRatio();
    }

    setDistanceJointDampingRatio(
      jointId: integer | string,
      dampingRatio: float
    ): void {
      // Invalid value
      if (dampingRatio < 0) {
        return;
      }

      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2DistanceJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_distanceJoint) {
      }

      // Set the joint damping ratio
      joint.SetDampingRatio(dampingRatio);
    }

    // Revolute joint
    addRevoluteJoint(
      x: float,
      y: float,
      enableLimit: boolean,
      referenceAngle: float,
      lowerAngle: float,
      upperAngle: float,
      enableMotor: boolean,
      motorSpeed: float,
      maxMotorTorque: float,
      variable: gdjs.Variable
    ): void {
      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return;
      }
      const body = this._body!;

      // Set joint settings
      const jointDef = new Box2D.b2RevoluteJointDef();
      jointDef.set_bodyA(this._sharedData.staticBody);
      jointDef.set_localAnchorA(
        this._sharedData.staticBody.GetLocalPoint(
          this.b2Vec2(
            x * this._sharedData.invScaleX,
            y * this._sharedData.invScaleY
          )
        )
      );
      jointDef.set_bodyB(body);
      jointDef.set_localAnchorB(
        body.GetLocalPoint(
          this.b2Vec2(
            x * this._sharedData.invScaleX,
            y * this._sharedData.invScaleY
          )
        )
      );
      jointDef.set_enableLimit(enableLimit);
      jointDef.set_referenceAngle(gdjs.toRad(referenceAngle));

      // Lower angle must be lower than upper angle
      if (upperAngle < lowerAngle) {
        const temp = lowerAngle;
        lowerAngle = upperAngle;
        upperAngle = temp;
      }
      jointDef.set_lowerAngle(gdjs.toRad(lowerAngle));
      jointDef.set_upperAngle(gdjs.toRad(upperAngle));
      jointDef.set_enableMotor(enableMotor);
      jointDef.set_motorSpeed(gdjs.toRad(motorSpeed));
      jointDef.set_maxMotorTorque(maxMotorTorque >= 0 ? maxMotorTorque : 0);
      jointDef.set_collideConnected(false);

      // Create the joint and get the id
      const jointId = this._sharedData.addJoint(
        Box2D.castObject(
          this._sharedData.world.CreateJoint(jointDef),
          Box2D.b2RevoluteJoint
        )
      );

      // Store the id in the variable
      variable.setNumber(jointId);
    }

    addRevoluteJointBetweenTwoBodies(
      x1: float,
      y1: float,
      other: gdjs.RuntimeObject | null,
      x2: float,
      y2: float,
      enableLimit: boolean,
      referenceAngle: float,
      lowerAngle: float,
      upperAngle: float,
      enableMotor: boolean,
      motorSpeed: float,
      maxMotorTorque: float,
      collideConnected: boolean,
      variable: gdjs.Variable
    ): void {
      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return;
      }

      // If there is no second object or it doesn't share the behavior, return
      if (other == null || !other.hasBehavior(this.name)) {
        return;
      }

      // Get the second body
      const otherBody = (other.getBehavior(
        this.name
      ) as gdjs.Physics2RuntimeBehavior).getBody();

      // If the first and second objects/bodies are the same, return
      if (this._body === otherBody) {
        return;
      }
      const body = this._body!;

      // Set joint settings
      const jointDef = new Box2D.b2RevoluteJointDef();
      jointDef.set_bodyA(body);
      jointDef.set_localAnchorA(
        body.GetLocalPoint(
          this.b2Vec2(
            x1 * this._sharedData.invScaleX,
            y1 * this._sharedData.invScaleY
          )
        )
      );
      jointDef.set_bodyB(otherBody);
      jointDef.set_localAnchorB(
        otherBody.GetLocalPoint(
          this.b2Vec2(
            x2 * this._sharedData.invScaleX,
            y2 * this._sharedData.invScaleY
          )
        )
      );
      jointDef.set_enableLimit(enableLimit);
      jointDef.set_referenceAngle(gdjs.toRad(referenceAngle));

      // Lower angle must be lower than upper angle
      if (upperAngle < lowerAngle) {
        const temp = lowerAngle;
        lowerAngle = upperAngle;
        upperAngle = temp;
      }
      jointDef.set_lowerAngle(gdjs.toRad(lowerAngle));
      jointDef.set_upperAngle(gdjs.toRad(upperAngle));
      jointDef.set_enableMotor(enableMotor);
      jointDef.set_motorSpeed(gdjs.toRad(motorSpeed));
      jointDef.set_maxMotorTorque(maxMotorTorque >= 0 ? maxMotorTorque : 0);
      jointDef.set_collideConnected(collideConnected);

      // Create the joint and get the id
      const jointId = this._sharedData.addJoint(
        Box2D.castObject(
          this._sharedData.world.CreateJoint(jointDef),
          Box2D.b2RevoluteJoint
        )
      );

      // Store the id in the variable
      variable.setNumber(jointId);
    }

    getRevoluteJointReferenceAngle(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2RevoluteJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_revoluteJoint) {
        return 0;
      }

      // Get the joint reference angle
      return gdjs.toDegrees(joint.GetReferenceAngle());
    }

    getRevoluteJointAngle(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2RevoluteJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_revoluteJoint) {
        return 0;
      }

      // Get the joint current angle
      return gdjs.toDegrees(joint.GetJointAngle());
    }

    getRevoluteJointSpeed(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2RevoluteJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_revoluteJoint) {
        return 0;
      }

      // Get the joint angular speed
      return gdjs.toDegrees(joint.GetJointSpeed());
    }

    isRevoluteJointLimitsEnabled(jointId: integer | string): boolean {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2RevoluteJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_revoluteJoint) {
        return false;
      }

      // Get the joint limits state
      return joint.IsLimitEnabled();
    }

    enableRevoluteJointLimits(
      jointId: integer | string,
      enable: boolean
    ): void {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2RevoluteJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_revoluteJoint) {
        return;
      }

      // Set the joint limits state
      joint.EnableLimit(enable);
    }

    getRevoluteJointMinAngle(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2RevoluteJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_revoluteJoint) {
        return 0;
      }

      // Get the joint lower angle
      return gdjs.toDegrees(joint.GetLowerLimit());
    }

    getRevoluteJointMaxAngle(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2RevoluteJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_revoluteJoint) {
        return 0;
      }

      // Get the joint upper angle
      return gdjs.toDegrees(joint.GetUpperLimit());
    }

    setRevoluteJointLimits(
      jointId: integer | string,
      lowerAngle: float,
      upperAngle: float
    ): void {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2RevoluteJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_revoluteJoint) {
        return;
      }

      // Lower angle must be lower than upper angle
      if (upperAngle < lowerAngle) {
        const temp = lowerAngle;
        lowerAngle = upperAngle;
        upperAngle = temp;
      }

      // Set the joint limits
      joint.SetLimits(gdjs.toRad(lowerAngle), gdjs.toRad(upperAngle));
    }

    isRevoluteJointMotorEnabled(jointId: integer | string): boolean {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2RevoluteJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_revoluteJoint) {
        return false;
      }

      // Get the joint motor state
      return joint.IsMotorEnabled();
    }

    enableRevoluteJointMotor(jointId: integer | string, enable): void {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2RevoluteJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_revoluteJoint) {
        return;
      }

      // Set the joint motor state
      joint.EnableMotor(enable);
    }

    getRevoluteJointMotorSpeed(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2RevoluteJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_revoluteJoint) {
        return 0;
      }

      // Get the joint motor speed
      return gdjs.toDegrees(joint.GetMotorSpeed());
    }

    setRevoluteJointMotorSpeed(jointId: integer | string, speed): void {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2RevoluteJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_revoluteJoint) {
        return;
      }

      // Set the joint motor speed
      joint.SetMotorSpeed(gdjs.toRad(speed));
    }

    getRevoluteJointMaxMotorTorque(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2RevoluteJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_revoluteJoint) {
        return 0;
      }

      // Get the joint max motor
      return joint.GetMaxMotorTorque();
    }

    setRevoluteJointMaxMotorTorque(jointId: integer | string, maxTorque): void {
      // Invalid value
      if (maxTorque < 0) {
        return;
      }

      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2RevoluteJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_revoluteJoint) {
        return;
      }

      // Set the joint max motor
      joint.SetMaxMotorTorque(maxTorque);
    }

    getRevoluteJointMotorTorque(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2RevoluteJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_revoluteJoint) {
        return 0;
      }

      // Get the joint motor torque
      return joint.GetMotorTorque(1 / this._sharedData.timeStep);
    }

    // Prismatic joint
    addPrismaticJoint(
      x1: float,
      y1: float,
      other: gdjs.RuntimeObject | null,
      x2: float,
      y2: float,
      axisAngle: float,
      referenceAngle: float,
      enableLimit: boolean,
      lowerTranslation: float,
      upperTranslation: float,
      enableMotor: boolean,
      motorSpeed: float,
      maxMotorForce: float,
      collideConnected: boolean,
      variable: gdjs.Variable
    ): void {
      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return;
      }

      // If there is no second object or it doesn't share the behavior, return
      if (other == null || !other.hasBehavior(this.name)) {
        return;
      }

      // Get the second body
      const otherBody = (other.getBehavior(
        this.name
      ) as gdjs.Physics2RuntimeBehavior).getBody();

      // If the first and second objects/bodies are the same, return
      if (this._body === otherBody) {
        return;
      }
      const body = this._body!;

      // Set joint settings
      const jointDef = new Box2D.b2PrismaticJointDef();
      jointDef.set_bodyA(body);
      jointDef.set_localAnchorA(
        body.GetLocalPoint(
          this.b2Vec2(
            x1 * this._sharedData.invScaleX,
            y1 * this._sharedData.invScaleY
          )
        )
      );
      jointDef.set_bodyB(otherBody);
      jointDef.set_localAnchorB(
        otherBody.GetLocalPoint(
          this.b2Vec2(
            x2 * this._sharedData.invScaleX,
            y2 * this._sharedData.invScaleY
          )
        )
      );
      axisAngle = gdjs.toRad(axisAngle) - body.GetAngle();
      jointDef.set_localAxisA(
        this.b2Vec2(Math.cos(axisAngle), Math.sin(axisAngle))
      );
      jointDef.set_referenceAngle(gdjs.toRad(referenceAngle));
      jointDef.set_enableLimit(enableLimit);

      // Lower translation must be lower than upper translation
      if (upperTranslation < lowerTranslation) {
        const temp = lowerTranslation;
        lowerTranslation = upperTranslation;
        upperTranslation = temp;
      }

      // The translation range must include zero
      jointDef.set_lowerTranslation(
        lowerTranslation < 0 ? lowerTranslation * this._sharedData.invScaleX : 0
      );
      jointDef.set_upperTranslation(
        upperTranslation > 0 ? upperTranslation * this._sharedData.invScaleX : 0
      );
      jointDef.set_enableMotor(enableMotor);
      jointDef.set_motorSpeed(motorSpeed * this._sharedData.invScaleX);
      jointDef.set_maxMotorForce(maxMotorForce);
      jointDef.set_collideConnected(collideConnected);

      // Create the joint and get the id
      const jointId = this._sharedData.addJoint(
        Box2D.castObject(
          this._sharedData.world.CreateJoint(jointDef),
          Box2D.b2PrismaticJoint
        )
      );

      // Store the id in the variable
      variable.setNumber(jointId);
    }

    getPrismaticJointAxisAngle(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(
        jointId
      ) as Box2D.b2PrismaticJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_prismaticJoint) {
        return 0;
      }

      // Get the joint axis angle
      return gdjs.toDegrees(
        Math.atan2(
          joint.GetLocalAxisA().get_y(),
          joint.GetLocalAxisA().get_x()
        ) + joint.GetBodyA().GetAngle()
      );
    }

    getPrismaticJointReferenceAngle(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(
        jointId
      ) as Box2D.b2PrismaticJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_prismaticJoint) {
        return 0;
      }

      // Get the joint reference angle
      return gdjs.toDegrees(joint.GetReferenceAngle());
    }

    getPrismaticJointTranslation(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(
        jointId
      ) as Box2D.b2PrismaticJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_prismaticJoint) {
        return 0;
      }

      // Get the joint current translation
      return joint.GetJointTranslation() * this._sharedData.scaleX;
    }

    getPrismaticJointSpeed(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(
        jointId
      ) as Box2D.b2PrismaticJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_prismaticJoint) {
        return 0;
      }

      // Get the joint speed
      return joint.GetJointSpeed() * this._sharedData.scaleX;
    }

    isPrismaticJointLimitsEnabled(jointId: integer | string): boolean {
      // Get the joint
      const joint = this._sharedData.getJoint(
        jointId
      ) as Box2D.b2PrismaticJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_prismaticJoint) {
        return false;
      }

      // Get the joint limits state
      return joint.IsLimitEnabled();
    }

    enablePrismaticJointLimits(
      jointId: integer | string,
      enable: boolean
    ): void {
      // Get the joint
      const joint = this._sharedData.getJoint(
        jointId
      ) as Box2D.b2PrismaticJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_prismaticJoint) {
        return;
      }

      // Set the joint limits state
      joint.EnableLimit(enable);
    }

    getPrismaticJointMinTranslation(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(
        jointId
      ) as Box2D.b2PrismaticJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_prismaticJoint) {
        return 0;
      }

      // Get the joint lower limit
      return joint.GetLowerLimit() * this._sharedData.scaleX;
    }

    getPrismaticJointMaxTranslation(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(
        jointId
      ) as Box2D.b2PrismaticJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_prismaticJoint) {
        return 0;
      }

      // Get the joint upper angle
      return joint.GetUpperLimit() * this._sharedData.scaleX;
    }

    setPrismaticJointLimits(
      jointId: integer | string,
      lowerTranslation: float,
      upperTranslation: float
    ): void {
      // Get the joint
      const joint = this._sharedData.getJoint(
        jointId
      ) as Box2D.b2PrismaticJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_prismaticJoint) {
        return;
      }

      // Lower translation must be lower than upper translation
      if (upperTranslation < lowerTranslation) {
        const temp = lowerTranslation;
        lowerTranslation = upperTranslation;
        upperTranslation = temp;
      }

      // The translation range must include zero
      lowerTranslation = lowerTranslation < 0 ? lowerTranslation : 0;
      upperTranslation = upperTranslation > 0 ? upperTranslation : 0;

      // Set the joint limits
      joint.SetLimits(
        lowerTranslation * this._sharedData.invScaleX,
        upperTranslation * this._sharedData.invScaleX
      );
    }

    isPrismaticJointMotorEnabled(jointId: integer | string): boolean {
      // Get the joint
      const joint = this._sharedData.getJoint(
        jointId
      ) as Box2D.b2PrismaticJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_prismaticJoint) {
        return false;
      }

      // Get the joint motor state
      return joint.IsMotorEnabled();
    }

    enablePrismaticJointMotor(
      jointId: integer | string,
      enable: boolean
    ): void {
      // Get the joint
      const joint = this._sharedData.getJoint(
        jointId
      ) as Box2D.b2PrismaticJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_prismaticJoint) {
        return;
      }

      // Set the joint motor state
      joint.EnableMotor(enable);
    }

    getPrismaticJointMotorSpeed(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(
        jointId
      ) as Box2D.b2PrismaticJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_prismaticJoint) {
        return 0;
      }

      // Get the joint motor speed
      return joint.GetMotorSpeed() * this._sharedData.scaleX;
    }

    setPrismaticJointMotorSpeed(jointId: integer | string, speed): void {
      // Get the joint
      const joint = this._sharedData.getJoint(
        jointId
      ) as Box2D.b2PrismaticJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_prismaticJoint) {
        return;
      }

      // Set the joint motor speed
      joint.SetMotorSpeed(speed * this._sharedData.invScaleX);
    }

    getPrismaticJointMaxMotorForce(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(
        jointId
      ) as Box2D.b2PrismaticJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_prismaticJoint) {
        return 0;
      }

      // Get the joint max motor force
      return joint.GetMaxMotorForce();
    }

    setPrismaticJointMaxMotorForce(jointId: integer | string, maxForce): void {
      // Invalid value
      if (maxForce < 0) {
        return;
      }

      // Get the joint
      const joint = this._sharedData.getJoint(
        jointId
      ) as Box2D.b2PrismaticJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_prismaticJoint) {
        return;
      }

      // Set the joint max motor force
      joint.SetMaxMotorForce(maxForce);
    }

    getPrismaticJointMotorForce(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(
        jointId
      ) as Box2D.b2PrismaticJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_prismaticJoint) {
        return 0;
      }

      // Get the joint motor torque
      return joint.GetMotorForce(1 / this._sharedData.timeStep);
    }

    // Pulley joint
    addPulleyJoint(
      x1: float,
      y1: float,
      other: gdjs.RuntimeObject | null,
      x2: float,
      y2: float,
      groundX1: float,
      groundY1: float,
      groundX2: float,
      groundY2: float,
      lengthA: float,
      lengthB: float,
      ratio: float,
      collideConnected: boolean,
      variable: gdjs.Variable
    ): void {
      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return;
      }
      const body = this._body!;

      // If there is no second object or it doesn't share the behavior, return
      if (other == null || !other.hasBehavior(this.name)) {
        return;
      }

      // Get the second body
      const otherBody = (other.getBehavior(
        this.name
      ) as gdjs.Physics2RuntimeBehavior).getBody();

      // If the first and second objects/bodies are the same, return
      if (this._body === otherBody) {
        return;
      }

      // Set joint settings
      const jointDef = new Box2D.b2PulleyJointDef();
      jointDef.set_bodyA(body);
      jointDef.set_localAnchorA(
        body.GetLocalPoint(
          this.b2Vec2(
            x1 * this._sharedData.invScaleX,
            y1 * this._sharedData.invScaleY
          )
        )
      );
      jointDef.set_bodyB(otherBody);
      jointDef.set_localAnchorB(
        otherBody.GetLocalPoint(
          this.b2Vec2(
            x2 * this._sharedData.invScaleX,
            y2 * this._sharedData.invScaleY
          )
        )
      );
      jointDef.set_groundAnchorA(
        this.b2Vec2(
          groundX1 * this._sharedData.invScaleX,
          groundY1 * this._sharedData.invScaleY
        )
      );
      jointDef.set_groundAnchorB(
        this.b2Vec2(
          groundX2 * this._sharedData.invScaleX,
          groundY2 * this._sharedData.invScaleY
        )
      );
      jointDef.set_lengthA(
        lengthA > 0
          ? lengthA * this._sharedData.invScaleX
          : this.b2Vec2(
              (groundX1 - x1) * this._sharedData.invScaleX,
              (groundY1 - y1) * this._sharedData.invScaleY
            ).Length()
      );
      jointDef.set_lengthB(
        lengthB > 0
          ? lengthB * this._sharedData.invScaleX
          : this.b2Vec2(
              (groundX2 - x2) * this._sharedData.invScaleX,
              (groundY2 - y2) * this._sharedData.invScaleY
            ).Length()
      );
      jointDef.set_ratio(ratio > 0 ? ratio : 1);
      jointDef.set_collideConnected(collideConnected);

      // Create the joint and get the id
      const jointId = this._sharedData.addJoint(
        Box2D.castObject(
          this._sharedData.world.CreateJoint(jointDef),
          Box2D.b2PulleyJoint
        )
      );

      // Store the id in the variable
      variable.setNumber(jointId);
    }

    getPulleyJointFirstGroundAnchorX(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2PulleyJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_pulleyJoint) {
        return 0;
      }

      // Get the joint ground anchor
      return joint.GetGroundAnchorA().get_x() * this._sharedData.scaleX;
    }

    getPulleyJointFirstGroundAnchorY(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2PulleyJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_pulleyJoint) {
        return 0;
      }

      // Get the joint ground anchor
      return joint.GetGroundAnchorA().get_y() * this._sharedData.scaleY;
    }

    getPulleyJointSecondGroundAnchorX(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2PulleyJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_pulleyJoint) {
        return 0;
      }

      // Get the joint ground anchor
      return joint.GetGroundAnchorB().get_x() * this._sharedData.scaleX;
    }

    getPulleyJointSecondGroundAnchorY(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2PulleyJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_pulleyJoint) {
        return 0;
      }

      // Get the joint ground anchor
      return joint.GetGroundAnchorB().get_y() * this._sharedData.scaleY;
    }

    getPulleyJointFirstLength(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2PulleyJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_pulleyJoint) {
        return 0;
      }

      // Get the joint length
      return joint.GetCurrentLengthA() * this._sharedData.scaleX;
    }

    getPulleyJointSecondLength(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2PulleyJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_pulleyJoint) {
        return 0;
      }

      // Get the joint length
      return joint.GetCurrentLengthB() * this._sharedData.scaleX;
    }

    getPulleyJointRatio(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2PulleyJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_pulleyJoint) {
        return 0;
      }

      // Get the joint ratio
      return joint.GetRatio();
    }

    // Gear joint
    addGearJoint(jointId1, jointId2, ratio, collideConnected, variable) {
      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return;
      }
      const body = this._body!;

      // Get the first joint
      const joint1 = this._sharedData.getJoint(jointId1);

      // Joint not found or has wrong type
      if (
        joint1 === null ||
        (joint1.GetType() !== Box2D.e_revoluteJoint &&
          joint1.GetType() !== Box2D.e_prismaticJoint)
      ) {
        return;
      }

      // Get the second joint
      const joint2 = this._sharedData.getJoint(jointId2);
      if (
        joint2 === null ||
        (joint2.GetType() !== Box2D.e_revoluteJoint &&
          joint2.GetType() !== Box2D.e_prismaticJoint)
      ) {
        return;
      }

      // The joints are the same
      if (joint1 === joint2) {
        return;
      }

      // Set joint settings
      const jointDef = new Box2D.b2GearJointDef();

      // Set gear joint bodies is not necessary at first, as the gear get the bodies from the two child joints
      // But we must pass two different bodies to bypass a test inherited from b2Joint
      jointDef.set_bodyA(this._sharedData.staticBody);
      jointDef.set_bodyB(body);
      jointDef.set_joint1(joint1);
      jointDef.set_joint2(joint2);
      jointDef.set_ratio(ratio);
      jointDef.set_collideConnected(collideConnected);

      // Create the joint and get the id
      const jointId = this._sharedData.addJoint(
        Box2D.castObject(
          this._sharedData.world.CreateJoint(jointDef),
          Box2D.b2GearJoint
        )
      );

      // Store the id in the variable
      variable.setNumber(jointId);
    }

    getGearJointFirstJoint(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2GearJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_gearJoint) {
        return 0;
      }

      // Get the joint first joint
      return this._sharedData.getJointId(joint.GetJoint1());
    }

    getGearJointSecondJoint(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2GearJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_gearJoint) {
        return 0;
      }

      // Get the joint second joint
      return this._sharedData.getJointId(joint.GetJoint2());
    }

    getGearJointRatio(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2GearJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_gearJoint) {
        return 0;
      }

      // Get the joint ratio
      return joint.GetRatio();
    }

    setGearJointRatio(jointId: integer | string, ratio: float): void {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2GearJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_gearJoint) {
        return;
      }

      // Set the joint ratio
      joint.SetRatio(ratio);

      // Awake the bodies, the gear joint picks the dynamic bodies as first and second body (second bodies from the child joints)
      joint.GetBodyA().SetAwake(true);
      joint.GetBodyB().SetAwake(true);
    }

    // Mouse joint
    addMouseJoint(
      targetX: float,
      targetY: float,
      maxForce: float,
      frequency: float,
      dampingRatio: float,
      variable: gdjs.Variable
    ): void {
      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return;
      }
      const body = this._body!;

      // Set joint settings
      const jointDef = new Box2D.b2MouseJointDef();
      jointDef.set_bodyA(this._sharedData.staticBody);
      jointDef.set_bodyB(body);
      jointDef.set_target(
        this.b2Vec2(
          targetX * this._sharedData.invScaleX,
          targetY * this._sharedData.invScaleY
        )
      );
      jointDef.set_maxForce(maxForce >= 0 ? maxForce : 0);
      jointDef.set_frequencyHz(frequency > 0 ? frequency : 1);
      jointDef.set_dampingRatio(dampingRatio >= 0 ? dampingRatio : 0);

      // Create the joint and get the id
      const jointId = this._sharedData.addJoint(
        Box2D.castObject(
          this._sharedData.world.CreateJoint(jointDef),
          Box2D.b2MouseJoint
        )
      );

      // Store the id in the variable
      variable.setNumber(jointId);
    }

    getMouseJointTargetX(jointId: integer | string): float {
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2MouseJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_mouseJoint) {
        return 0;
      }

      // Get the joint target X
      return joint.GetTarget().get_x() * this._sharedData.scaleX;
    }

    getMouseJointTargetY(jointId: integer | string): float {
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2MouseJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_mouseJoint) {
        return 0;
      }

      // Get the joint target Y
      return joint.GetTarget().get_y() * this._sharedData.scaleY;
    }

    setMouseJointTarget(
      jointId: integer | string,
      targetX: float,
      targetY: float
    ): void {
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2MouseJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_mouseJoint) {
        return;
      }

      // Set the joint target
      joint.SetTarget(
        this.b2Vec2(
          targetX * this._sharedData.invScaleX,
          targetY * this._sharedData.invScaleY
        )
      );

      // Awake the body
      joint.GetBodyB().SetAwake(true);
    }

    getMouseJointMaxForce(jointId: integer | string): float {
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2MouseJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_mouseJoint) {
        return 0;
      }

      // Get the joint max force
      return joint.GetMaxForce();
    }

    setMouseJointMaxForce(jointId: integer | string, maxForce: float): void {
      // Invalid value
      if (maxForce < 0) {
        return;
      }
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2MouseJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_mouseJoint) {
        return;
      }

      // Set the joint max force
      joint.SetMaxForce(maxForce);
    }

    getMouseJointFrequency(jointId: integer | string): float {
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2MouseJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_mouseJoint) {
        return 0;
      }

      // Get the joint frequency
      return joint.GetFrequency();
    }

    setMouseJointFrequency(jointId: integer | string, frequency: float): void {
      // Invalid value
      if (frequency <= 0) {
        return;
      }
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2MouseJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_mouseJoint) {
        return;
      }

      // Set the joint frequency
      joint.SetFrequency(frequency);
    }

    getMouseJointDampingRatio(jointId: integer | string): float {
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2MouseJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_mouseJoint) {
        return 0;
      }

      // Get the joint damping ratio
      return joint.GetDampingRatio();
    }

    setMouseJointDampingRatio(
      jointId: integer | string,
      dampingRatio: float
    ): void {
      // Invalid value
      if (dampingRatio < 0) {
        return;
      }
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2MouseJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_mouseJoint) {
        return;
      }

      // Set the joint damping ratio
      joint.SetDampingRatio(dampingRatio);
    }

    // Wheel joint
    addWheelJoint(
      x1: float,
      y1: float,
      other: gdjs.RuntimeObject | null,
      x2: float,
      y2: float,
      axisAngle: float,
      frequency: float,
      dampingRatio: float,
      enableMotor: boolean,
      motorSpeed: float,
      maxMotorTorque: float,
      collideConnected: boolean,
      variable: gdjs.Variable
    ): void {
      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return;
      }
      const body = this._body!;

      // If there is no second object or it doesn't share the behavior, return
      if (other == null || !other.hasBehavior(this.name)) {
        return;
      }

      // Get the second body
      const otherBody = (other.getBehavior(
        this.name
      ) as gdjs.Physics2RuntimeBehavior).getBody();

      // If the first and second objects/bodies are the same, return
      if (this._body === otherBody) {
        return;
      }

      // Set joint settings
      const jointDef = new Box2D.b2WheelJointDef();
      jointDef.set_bodyA(body);
      jointDef.set_localAnchorA(
        body.GetLocalPoint(
          this.b2Vec2(
            x1 * this._sharedData.invScaleX,
            y1 * this._sharedData.invScaleY
          )
        )
      );
      jointDef.set_bodyB(otherBody);
      jointDef.set_localAnchorB(
        otherBody.GetLocalPoint(
          this.b2Vec2(
            x2 * this._sharedData.invScaleX,
            y2 * this._sharedData.invScaleY
          )
        )
      );
      axisAngle = gdjs.toRad(axisAngle) - body.GetAngle();
      jointDef.set_localAxisA(
        this.b2Vec2(Math.cos(axisAngle), Math.sin(axisAngle))
      );
      jointDef.set_frequencyHz(frequency > 0 ? frequency : 1);
      jointDef.set_dampingRatio(dampingRatio >= 0 ? dampingRatio : 0);
      jointDef.set_enableMotor(enableMotor);
      jointDef.set_motorSpeed(gdjs.toRad(motorSpeed));
      jointDef.set_maxMotorTorque(maxMotorTorque);
      jointDef.set_collideConnected(collideConnected);

      // Create the joint and get the id
      const jointId = this._sharedData.addJoint(
        Box2D.castObject(
          this._sharedData.world.CreateJoint(jointDef),
          Box2D.b2WheelJoint
        )
      );

      // Store the id in the variable
      variable.setNumber(jointId);
    }

    getWheelJointAxisAngle(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2WheelJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_wheelJoint) {
        return 0;
      }

      // Get the joint axis angle
      return gdjs.toDegrees(
        Math.atan2(
          joint.GetLocalAxisA().get_y(),
          joint.GetLocalAxisA().get_x()
        ) + joint.GetBodyA().GetAngle()
      );
    }

    getWheelJointTranslation(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2WheelJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_wheelJoint) {
        return 0;
      }

      // Get the joint current translation
      return joint.GetJointTranslation() * this._sharedData.scaleX;
    }

    getWheelJointSpeed(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2WheelJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_wheelJoint) {
        return 0;
      }

      // Get the joint speed
      return gdjs.toDegrees(joint.GetJointSpeed());
    }

    isWheelJointMotorEnabled(jointId: integer | string): boolean {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2WheelJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_wheelJoint) {
        return false;
      }

      // Get the joint motor state
      return joint.IsMotorEnabled();
    }

    enableWheelJointMotor(jointId: integer | string, enable): void {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2WheelJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_wheelJoint) {
        return;
      }

      // Set the joint motor state
      joint.EnableMotor(enable);
    }

    getWheelJointMotorSpeed(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2WheelJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_wheelJoint) {
        return 0;
      }

      // Get the joint motor speed
      return gdjs.toDegrees(joint.GetMotorSpeed());
    }

    setWheelJointMotorSpeed(jointId: integer | string, speed): void {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2WheelJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_wheelJoint) {
        return;
      }

      // Set the joint motor speed
      joint.SetMotorSpeed(gdjs.toRad(speed));
    }

    getWheelJointMaxMotorTorque(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2WheelJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_wheelJoint) {
        return 0;
      }

      // Get the joint max motor torque
      return joint.GetMaxMotorTorque();
    }

    setWheelJointMaxMotorTorque(
      jointId: integer | string,
      maxTorque: float
    ): void {
      // Invalid value
      if (maxTorque < 0) {
        return;
      }

      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2WheelJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_wheelJoint) {
        return;
      }

      // Set the joint max motor torque
      joint.SetMaxMotorTorque(maxTorque);
    }

    getWheelJointMotorTorque(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2WheelJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_wheelJoint) {
        return 0;
      }

      // Get the joint motor torque
      return joint.GetMotorTorque(1 / this._sharedData.timeStep);
    }

    getWheelJointFrequency(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2WheelJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_wheelJoint) {
        return 0;
      }

      // Get the joint frequency
      return joint.GetSpringFrequencyHz();
    }

    setWheelJointFrequency(jointId: integer | string, frequency): void {
      // Invalid value
      if (frequency < 0) {
        return;
      }

      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2WheelJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_wheelJoint) {
        return;
      }

      // Set the joint frequency
      joint.SetSpringFrequencyHz(frequency);
    }

    getWheelJointDampingRatio(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2WheelJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_wheelJoint) {
        return 0;
      }

      // Get the joint damping ratio
      return joint.GetSpringDampingRatio();
    }

    setWheelJointDampingRatio(jointId: integer | string, dampingRatio): void {
      // Invalid value
      if (dampingRatio < 0) {
        return;
      }

      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2WheelJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_wheelJoint) {
        return;
      }

      // Set the joint damping ratio
      joint.SetSpringDampingRatio(dampingRatio);
    }

    // Weld joint
    addWeldJoint(
      x1: float,
      y1: float,
      other: gdjs.RuntimeObject | null,
      x2: float,
      y2: float,
      referenceAngle: float,
      frequency: float,
      dampingRatio: float,
      collideConnected: boolean,
      variable: gdjs.Variable
    ): void {
      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return;
      }

      // If there is no second object or it doesn't share the behavior, return
      if (other == null || !other.hasBehavior(this.name)) {
        return;
      }

      // Get the second body
      const otherBody = (other.getBehavior(
        this.name
      ) as gdjs.Physics2RuntimeBehavior).getBody();

      // If the first and second objects/bodies are the same, return
      if (this._body === otherBody) {
        return;
      }
      const body = this._body!;

      // Set joint settings
      const jointDef = new Box2D.b2WeldJointDef();
      jointDef.set_bodyA(body);
      jointDef.set_localAnchorA(
        body.GetLocalPoint(
          this.b2Vec2(
            x1 * this._sharedData.invScaleX,
            y1 * this._sharedData.invScaleY
          )
        )
      );
      jointDef.set_bodyB(otherBody);
      jointDef.set_localAnchorB(
        otherBody.GetLocalPoint(
          this.b2Vec2(
            x2 * this._sharedData.invScaleX,
            y2 * this._sharedData.invScaleY
          )
        )
      );
      jointDef.set_referenceAngle(gdjs.toRad(referenceAngle));
      jointDef.set_frequencyHz(frequency > 0 ? frequency : 1);
      jointDef.set_dampingRatio(dampingRatio >= 0 ? dampingRatio : 0);
      jointDef.set_collideConnected(collideConnected);

      // Create the joint
      const joint = Box2D.castObject(
        this._sharedData.world.CreateJoint(jointDef),
        Box2D.b2WeldJoint
      );

      // @ts-ignore b2WeldJoint.GetReferenceAngle() is not binded, store it manually
      joint.referenceAngle = jointDef.get_referenceAngle();

      // Store the id in the variable
      variable.setNumber(this._sharedData.addJoint(joint));
    }

    getWeldJointReferenceAngle(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2WeldJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_weldJoint) {
        return 0;
      }

      // @ts-ignore b2WeldJoint.GetReferenceAngle() is not binded
      return gdjs.toDegrees(joint.referenceAngle);
      // return gdjs.toDegrees(joint.GetReferenceAngle());
    }

    getWeldJointFrequency(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2WeldJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_weldJoint) {
        return 0;
      }

      // Get the joint frequency
      return joint.GetFrequency();
    }

    setWeldJointFrequency(jointId: integer | string, frequency: float): void {
      // Invalid value
      if (frequency < 0) {
        return;
      }

      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2WeldJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_weldJoint) {
        return;
      }

      // Set the joint frequency
      joint.SetFrequency(frequency);
    }

    getWeldJointDampingRatio(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2WeldJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_weldJoint) {
        return 0;
      }

      // Get the joint damping ratio
      return joint.GetDampingRatio();
    }

    setWeldJointDampingRatio(
      jointId: integer | string,
      dampingRatio: float
    ): void {
      // Invalid value
      if (dampingRatio < 0) {
        return;
      }

      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2WeldJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_weldJoint) {
        return;
      }

      // Set the joint damping ratio
      joint.SetDampingRatio(dampingRatio);
    }

    // Rope joint
    addRopeJoint(
      x1: float,
      y1: float,
      other: gdjs.RuntimeObject | null,
      x2: float,
      y2: float,
      maxLength: float,
      collideConnected: boolean,
      variable: gdjs.Variable
    ): void {
      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return;
      }
      const body = this._body!;

      // If there is no second object or it doesn't share the behavior, return
      if (other == null || !other.hasBehavior(this.name)) {
        return;
      }

      // Get the second body
      const otherBody = (other.getBehavior(
        this.name
      ) as gdjs.Physics2RuntimeBehavior).getBody();

      // If the first and second objects/bodies are the same, return
      if (this._body === otherBody) {
        return;
      }

      // Set joint settings
      const jointDef = new Box2D.b2RopeJointDef();
      jointDef.set_bodyA(body);
      jointDef.set_localAnchorA(
        body.GetLocalPoint(
          this.b2Vec2(
            x1 * this._sharedData.invScaleX,
            y1 * this._sharedData.invScaleY
          )
        )
      );
      jointDef.set_bodyB(otherBody);
      jointDef.set_localAnchorB(
        otherBody.GetLocalPoint(
          this.b2Vec2(
            x2 * this._sharedData.invScaleX,
            y2 * this._sharedData.invScaleY
          )
        )
      );
      jointDef.set_maxLength(
        maxLength > 0
          ? maxLength * this._sharedData.invScaleX
          : this.b2Vec2(
              (x2 - x1) * this._sharedData.invScaleX,
              (y2 - y1) * this._sharedData.invScaleY
            ).Length()
      );
      jointDef.set_collideConnected(collideConnected);

      // Create the joint and get the id
      const jointId = this._sharedData.addJoint(
        Box2D.castObject(
          this._sharedData.world.CreateJoint(jointDef),
          Box2D.b2RopeJoint
        )
      );

      // Store the id in the variable
      variable.setNumber(jointId);
    }

    getRopeJointMaxLength(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2RopeJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_ropeJoint) {
        return 0;
      }

      // Get the joint maximum length
      return joint.GetMaxLength() * this._sharedData.scaleX;
    }

    setRopeJointMaxLength(jointId: integer | string, maxLength: float): void {
      // Invalid value
      if (maxLength < 0) {
        return;
      }

      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2RopeJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_ropeJoint) {
        return;
      }

      // Set the joint maximum length
      joint.SetMaxLength(maxLength * this._sharedData.invScaleX);

      // Awake the bodies
      joint.GetBodyA().SetAwake(true);
      joint.GetBodyB().SetAwake(true);
    }

    // Friction joint
    addFrictionJoint(
      x1: float,
      y1: float,
      other: gdjs.RuntimeObject | null,
      x2: float,
      y2: float,
      maxForce: float,
      maxTorque: float,
      collideConnected: boolean,
      variable: gdjs.Variable
    ): void {
      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return;
      }

      // If there is no second object or it doesn't share the behavior, return
      if (other == null || !other.hasBehavior(this.name)) {
        return;
      }

      // Get the second body
      const otherBody = (other.getBehavior(
        this.name
      ) as gdjs.Physics2RuntimeBehavior).getBody();

      // If the first and second objects/bodies are the same, return
      if (this._body === otherBody) {
        return;
      }
      const body = this._body!;

      // Set joint settings
      const jointDef = new Box2D.b2FrictionJointDef();
      jointDef.set_bodyA(body);
      jointDef.set_localAnchorA(
        body.GetLocalPoint(
          this.b2Vec2(
            x1 * this._sharedData.invScaleX,
            y1 * this._sharedData.invScaleY
          )
        )
      );
      jointDef.set_bodyB(otherBody);
      jointDef.set_localAnchorB(
        otherBody.GetLocalPoint(
          this.b2Vec2(
            x2 * this._sharedData.invScaleX,
            y2 * this._sharedData.invScaleY
          )
        )
      );
      jointDef.set_maxForce(maxForce >= 0 ? maxForce : 0);
      jointDef.set_maxTorque(maxTorque >= 0 ? maxTorque : 0);
      jointDef.set_collideConnected(collideConnected);

      // Create the joint and get the id
      const jointId = this._sharedData.addJoint(
        Box2D.castObject(
          this._sharedData.world.CreateJoint(jointDef),
          Box2D.b2FrictionJoint
        )
      );

      // Store the id in the variable
      variable.setNumber(jointId);
    }

    getFrictionJointMaxForce(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2FrictionJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_frictionJoint) {
        return 0;
      }

      // Get the joint maximum force
      return joint.GetMaxForce();
    }

    setFrictionJointMaxForce(jointId: integer | string, maxForce: float): void {
      // Invalid value
      if (maxForce < 0) {
        return;
      }

      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2FrictionJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_frictionJoint) {
        return;
      }

      // Set the joint maximum force
      joint.SetMaxForce(maxForce);
    }

    getFrictionJointMaxTorque(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2FrictionJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_frictionJoint) {
        return 0;
      }

      // Get the joint maximum torque
      return joint.GetMaxTorque();
    }

    setFrictionJointMaxTorque(
      jointId: integer | string,
      maxTorque: float
    ): void {
      // Invalid value
      if (maxTorque < 0) {
        return;
      }

      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2FrictionJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_frictionJoint) {
        return;
      }

      // Set the joint maximum torque
      joint.SetMaxTorque(maxTorque);
    }

    // Motor joint
    addMotorJoint(
      other: gdjs.RuntimeObject | null,
      offsetX: float,
      offsetY: float,
      offsetAngle: float,
      maxForce: float,
      maxTorque: float,
      correctionFactor: float,
      collideConnected: boolean,
      variable: gdjs.Variable
    ): void {
      // If there is no body, set a new one
      if (this._body === null) {
        if (!this.createBody()) return;
      }
      const body = this._body!;

      // If there is no second object or it doesn't share the behavior, return
      if (other == null || !other.hasBehavior(this.name)) {
        return;
      }

      // Get the second body
      const otherBody = (other.getBehavior(
        this.name
      ) as gdjs.Physics2RuntimeBehavior).getBody();

      // If the first and second objects/bodies are the same, return
      if (this._body === otherBody) {
        return;
      }

      // Set joint settings
      const jointDef = new Box2D.b2MotorJointDef();
      jointDef.set_bodyA(body);
      jointDef.set_bodyB(otherBody);
      jointDef.set_linearOffset(
        this.b2Vec2(
          offsetX * this._sharedData.invScaleX,
          offsetY * this._sharedData.invScaleY
        )
      );
      jointDef.set_angularOffset(gdjs.toRad(offsetAngle));
      jointDef.set_maxForce(maxForce >= 0 ? maxForce : 0);
      jointDef.set_maxTorque(maxTorque >= 0 ? maxTorque : 0);
      jointDef.set_correctionFactor(
        correctionFactor < 0 ? 0 : correctionFactor > 1 ? 1 : correctionFactor
      );
      jointDef.set_collideConnected(collideConnected);

      // Create the joint and get the id
      const jointId = this._sharedData.addJoint(
        Box2D.castObject(
          this._sharedData.world.CreateJoint(jointDef),
          Box2D.b2MotorJoint
        )
      );

      // Store the id in the variable
      variable.setNumber(jointId);
    }

    getMotorJointOffsetX(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2MotorJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_motorJoint) {
        return 0;
      }

      // Get the joint offset
      return joint.GetLinearOffset().get_x() * this._sharedData.scaleX;
    }

    getMotorJointOffsetY(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2MotorJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_motorJoint) {
        return 0;
      }

      // Get the joint offset
      return joint.GetLinearOffset().get_y() * this._sharedData.scaleY;
    }

    setMotorJointOffset(
      jointId: integer | string,
      offsetX: float,
      offsetY: float
    ): void {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2MotorJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_motorJoint) {
        return;
      }

      // Set the joint offset
      joint.SetLinearOffset(
        this.b2Vec2(
          offsetX * this._sharedData.invScaleX,
          offsetY * this._sharedData.invScaleY
        )
      );
    }

    getMotorJointAngularOffset(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2MotorJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_motorJoint) {
        return 0;
      }

      // Get the joint angular offset
      return gdjs.toDegrees(joint.GetAngularOffset());
    }

    setMotorJointAngularOffset(
      jointId: integer | string,
      offsetAngle: float
    ): void {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2MotorJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_motorJoint) {
        return;
      }

      // Set the joint angular offset
      joint.SetAngularOffset(gdjs.toRad(offsetAngle));
    }

    getMotorJointMaxForce(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2MotorJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_motorJoint) {
        return 0;
      }

      // Get the joint maximum force
      return joint.GetMaxForce();
    }

    setMotorJointMaxForce(jointId: integer | string, maxForce: float): void {
      // Invalid value
      if (maxForce < 0) {
        return;
      }

      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2MotorJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_motorJoint) {
        return;
      }

      // Set the joint maximum force
      joint.SetMaxForce(maxForce);
    }

    getMotorJointMaxTorque(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2MotorJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_motorJoint) {
        return 0;
      }

      // Get the joint maximum torque
      return joint.GetMaxTorque();
    }

    setMotorJointMaxTorque(jointId: integer | string, maxTorque: float): void {
      // Invalid value
      if (maxTorque < 0) {
        return;
      }

      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2MotorJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_motorJoint) {
        return;
      }

      // Set the joint maximum torque
      joint.SetMaxTorque(maxTorque);

      // Awake the bodies
      joint.GetBodyA().SetAwake(true);
      joint.GetBodyB().SetAwake(true);
    }

    getMotorJointCorrectionFactor(jointId: integer | string): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2MotorJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_motorJoint) {
        return 0;
      }

      // Get the joint correction factor
      return joint.GetCorrectionFactor();
    }

    setMotorJointCorrectionFactor(
      jointId: integer | string,
      correctionFactor: float
    ): void {
      // Invalid value
      if (correctionFactor < 0 || correctionFactor > 1) {
        return;
      }

      // Get the joint
      const joint = this._sharedData.getJoint(jointId) as Box2D.b2MotorJoint;

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_motorJoint) {
        return;
      }

      // Set the joint correction factor
      joint.SetCorrectionFactor(correctionFactor);

      // Awake the bodies
      joint.GetBodyA().SetAwake(true);
      joint.GetBodyB().SetAwake(true);
    }

    onContactBegin(otherBehavior: Physics2RuntimeBehavior): void {
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

    onContactEnd(otherBehavior: Physics2RuntimeBehavior): void {
      this.contactsEndedThisFrame.push(otherBehavior);

      const index = this.currentContacts.indexOf(otherBehavior);
      if (index !== -1) {
        this.currentContacts.splice(index, 1);
      }
    }

    /**
     * @deprecated Prefer using `Physics2RuntimeBehavior.areObjectsColliding`.
     */
    static collisionTest = Physics2RuntimeBehavior.areObjectsColliding;

    static areObjectsColliding(
      object1: gdjs.RuntimeObject,
      object2: gdjs.RuntimeObject,
      behaviorName: string
    ): boolean {
      // Test if the second object is in the list of contacts of the first one
      const behavior1 = object1.getBehavior(
        behaviorName
      ) as Physics2RuntimeBehavior | null;
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
      ) as Physics2RuntimeBehavior | null;
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
      ) as Physics2RuntimeBehavior | null;
      if (!behavior1) return false;

      return behavior1.contactsEndedThisFrame.some(
        (behavior) => behavior.owner === object2
      );
    }
  }
  gdjs.registerBehavior(
    'Physics2::Physics2Behavior',
    gdjs.Physics2RuntimeBehavior
  );
}
