namespace gdjs {
  export class Physics2SharedData {
    gravityX: any;
    gravityY: any;
    scaleX: any;
    scaleY: any;
    invScaleX: any;
    invScaleY: any;
    timeStep: any;
    frameTime: float = 0;
    stepped: boolean = false;
    timeScale: float = 1;
    world: any;
    staticBody: any;

    // Contact listener to keep track of current collisions
    contactListener: any;
    _nextJointId: number = 1;

    // Start with 1 so the user is safe from default variables value (0)
    joints: any = {};

    constructor(runtimeScene, sharedData) {
      this.gravityX = sharedData.gravityX;
      this.gravityY = sharedData.gravityY;
      this.scaleX = sharedData.scaleX === 0 ? 100 : sharedData.scaleX;
      this.scaleY = sharedData.scaleY === 0 ? 100 : sharedData.scaleY;
      this.invScaleX = 1 / this.scaleX;
      this.invScaleY = 1 / this.scaleY;
      this.timeStep = 1 / 60;
      this.world = new Box2D.b2World(
        new Box2D.b2Vec2(this.gravityX, this.gravityY),
        true
      );
      this.staticBody = this.world.CreateBody(new Box2D.b2BodyDef());
      this.contactListener = new Box2D.JSContactListener();
      this.contactListener.BeginContact = function (contactPtr) {
        // Get the contact
        const contact = Box2D.wrapPointer(contactPtr, Box2D.b2Contact);

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

        // Let each behavior know about the contact against the other
        behaviorA.currentContacts.push(behaviorB);
        behaviorB.currentContacts.push(behaviorA);
      };
      this.contactListener.EndContact = function (contactPtr) {
        // Get the contact
        const contact = Box2D.wrapPointer(contactPtr, Box2D.b2Contact);

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

        // Remove each other contact
        let i = behaviorA.currentContacts.indexOf(behaviorB);
        if (i !== -1) {
          behaviorA.currentContacts.splice(i, 1);
        }
        i = behaviorB.currentContacts.indexOf(behaviorA);
        if (i !== -1) {
          behaviorB.currentContacts.splice(i, 1);
        }
      };
      this.contactListener.PreSolve = function () {};
      this.contactListener.PostSolve = function () {};
      this.world.SetContactListener(this.contactListener);
    }

    // (string)jointId -> (b2Joint)b2Joint
    static getSharedData(runtimeScene, behaviorName) {
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

    step(deltaTime) {
      this.frameTime += deltaTime;
      if (this.frameTime >= this.timeStep) {
        let numberOfSteps = Math.floor(this.frameTime / this.timeStep);
        this.frameTime -= numberOfSteps * this.timeStep;
        if (numberOfSteps > 5) {
          numberOfSteps = 5;
        }
        for (let i = 0; i < numberOfSteps; i++) {
          this.world.Step(this.timeStep * this.timeScale, 8, 10);
        }
        this.world.ClearForces();
      }
      this.stepped = true;
    }

    clearBodyJoints(body) {
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

    addJoint(joint) {
      // Add the joint to the list
      this.joints[this._nextJointId.toString(10)] = joint;

      // Return the current joint id and then increase it
      return this._nextJointId++;
    }

    getJoint(jointId) {
      // Cast to string
      jointId = jointId.toString(10);

      // Get the joint
      if (this.joints.hasOwnProperty(jointId)) {
        return this.joints[jointId];
      }

      // Joint not found, return null
      return null;
    }

    getJointId(joint): integer {
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

    removeJoint(jointId) {
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
              // Must check pointers becuase gears store non-casted joints (b2Joint)
              if (
                this.joints[jId].GetType() === Box2D.e_gearJoint &&
                (Box2D.getPointer(this.joints[jId].GetJoint1()) ===
                  Box2D.getPointer(joint) ||
                  Box2D.getPointer(this.joints[jId].GetJoint2()) ===
                    Box2D.getPointer(joint))
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
    bodyType: any;
    bullet: any;
    fixedRotation: boolean;
    canSleep: any;
    shape: any;
    shapeDimensionA: any;
    shapeDimensionB: any;
    shapeOffsetX: any;
    shapeOffsetY: any;
    polygonOrigin: any;
    polygon: any;
    density: any;
    friction: any;
    restitution: any;
    linearDamping: any;
    angularDamping: any;
    gravityScale: any;
    layers: any;
    masks: any;
    shapeScale: number = 1;
    currentContacts: any;
    _body: any = null;
    _sharedData: any;
    _tempb2Vec2: any;

    // Avoid creating new vectors all the time
    _tempb2Vec2Sec: any;

    // Sometimes two vectors are needed on the same function call
    _objectOldX: number = 0;
    _objectOldY: number = 0;
    _objectOldAngle: float = 0;
    _objectOldWidth: float = 0;
    _objectOldHeight: float = 0;
    _verticesBuffer: integer = 0;

    constructor(runtimeScene, behaviorData, owner) {
      super(runtimeScene, behaviorData, owner);
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
      this.currentContacts = this.currentContacts || [];
      this.currentContacts.length = 0;
      this._sharedData = Physics2SharedData.getSharedData(
        runtimeScene,
        behaviorData.name
      );
      this._tempb2Vec2 = new Box2D.b2Vec2();
      this._tempb2Vec2Sec = new Box2D.b2Vec2();
    }

    // Stores a Box2D pointer of created vertices
    b2Vec2(x, y) {
      this._tempb2Vec2.set_x(x);
      this._tempb2Vec2.set_y(y);
      return this._tempb2Vec2;
    }

    b2Vec2Sec(x, y) {
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
    }

    onDestroy() {
      this.onDeActivate();
    }

    static getPolygon(verticesData) {
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

    static isPolygonConvex(polygon) {
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

    createShape() {
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

    recreateShape() {
      // If there is no body, set a new one
      if (this._body === null) {
        this.createBody();
        return;
      }

      // Destroy the old shape
      this._body.DestroyFixture(this._body.GetFixtureList());
      this._body.CreateFixture(this.createShape());

      // Update cached size
      this._objectOldWidth = this.owner.getWidth();
      this._objectOldHeight = this.owner.getHeight();
    }

    getShapeScale() {
      return this.shapeScale;
    }

    setShapeScale(shapeScale): void {
      if (shapeScale !== this.shapeScale && shapeScale > 0) {
        this.shapeScale = shapeScale;
        this.recreateShape();
      }
    }

    getBody() {
      // If there is no body, set a new one
      if (this._body === null) {
        this.createBody();
      }
      return this._body;
    }

    createBody() {
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
    }

    doStepPreEvents(runtimeScene) {
      // Create a body if there is not one
      if (this._body === null) {
        this.createBody();
      }

      // Step the world if not done this frame yet
      if (!this._sharedData.stepped) {
        this._sharedData.step(
          runtimeScene.getTimeManager().getElapsedTime() / 1000.0
        );
      }

      // Copy transform from body to the GD object
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

      // Update cached transform
      this._objectOldX = this.owner.getX();
      this._objectOldY = this.owner.getY();
      this._objectOldAngle = this.owner.getAngle();
    }

    doStepPostEvents(runtimeScene) {
      this._updateBodyFromObject();

      // Reset world step to update next frame
      this._sharedData.stepped = false;
    }

    onObjectHotReloaded() {
      this._updateBodyFromObject();
    }

    _updateBodyFromObject() {
      // If there is no body, set a new one
      if (this._body === null) {
        this.createBody();
      }

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
        this._body.SetTransform(pos, gdjs.toRad(this.owner.getAngle()));
        this._body.SetAwake(true);
      }
    }

    getGravityX(): float {
      return this._sharedData.gravityX;
    }

    getGravityY(): float {
      return this._sharedData.gravityY;
    }

    setGravity(x, y): void {
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

    setTimeScale(timeScale): void {
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
        this.createBody();
        return;
      }

      // Update body type
      this._body.SetType(Box2D.b2_dynamicBody);
      this._body.SetAwake(true);
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
        this.createBody();
        return;
      }

      // Update body type
      this._body.SetType(Box2D.b2_staticBody);
      this._body.SetAwake(true);
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
        this.createBody();
        return;
      }

      // Update body type
      this._body.SetType(Box2D.b2_kinematicBody);
      this._body.SetAwake(true);
    }

    isBullet(): boolean {
      return this.bullet;
    }

    setBullet(enable): void {
      // Check if there is no modification
      if (this.bullet === enable) {
        return;
      }

      // Change bullet flag
      this.bullet = enable;

      // If there is no body, set a new one
      if (this._body === null) {
        this.createBody();
        return;
      }

      // Update body bullet flag
      this._body.SetBullet(this.bullet);
    }

    hasFixedRotation(): boolean {
      return this.fixedRotation;
    }

    setFixedRotation(enable): void {
      this.fixedRotation = enable;
      if (this._body === null) {
        this.createBody();
        return;
      }
      this._body.SetFixedRotation(this.fixedRotation);
    }

    isSleepingAllowed(): boolean {
      return this.canSleep;
    }

    setSleepingAllowed(enable): void {
      this.canSleep = enable;
      if (this._body === null) {
        this.createBody();
        return;
      }
      this._body.SetSleepingAllowed(this.canSleep);
    }

    isSleeping(): boolean {
      // If there is no body, set a new one
      if (this._body === null) {
        this.createBody();
      }

      // Get the body sleeping state
      return !this._body.IsAwake();
    }

    getDensity() {
      return this.density;
    }

    setDensity(density): void {
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
        this.createBody();
        return;
      }

      // Update the body density
      this._body.GetFixtureList().SetDensity(this.density);
      this._body.ResetMassData();
    }

    getFriction() {
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
        this.createBody();
        return;
      }

      // Update the body friction
      this._body.GetFixtureList().SetFriction(this.friction);

      // Update contacts
      let contact = this._body.GetContactList();
      while (Box2D.getPointer(contact)) {
        contact.get_contact().ResetFriction();
        contact = contact.get_next();
      }
    }

    getRestitution() {
      return this.restitution;
    }

    setRestitution(restitution): void {
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
        this.createBody();
        return;
      }

      // Update the body restitution
      this._body.GetFixtureList().SetRestitution(this.restitution);

      // Update contacts
      let contact = this._body.GetContactList();
      while (Box2D.getPointer(contact)) {
        contact.get_contact().ResetRestitution();
        contact = contact.get_next();
      }
    }

    getLinearDamping() {
      return this.linearDamping;
    }

    setLinearDamping(linearDamping): void {
      // Check if there is no modification
      if (this.linearDamping === linearDamping) {
        return;
      }

      // Change linearDamping
      this.linearDamping = linearDamping;

      // If there is no body, set a new one
      if (this._body === null) {
        this.createBody();
        return;
      }

      // Update the body linear damping
      this._body.SetLinearDamping(this.linearDamping);
    }

    getAngularDamping() {
      return this.angularDamping;
    }

    setAngularDamping(angularDamping): void {
      // Check if there is no modification
      if (this.angularDamping === angularDamping) {
        return;
      }

      // Change angularDamping
      this.angularDamping = angularDamping;

      // If there is no body, set a new one
      if (this._body === null) {
        this.createBody();
        return;
      }

      // Update the body angular damping
      this._body.SetAngularDamping(this.angularDamping);
    }

    getGravityScale() {
      return this.gravityScale;
    }

    setGravityScale(gravityScale): void {
      // Check if there is no modification
      if (this.gravityScale === gravityScale) {
        return;
      }

      // Change the gravity scale
      this.gravityScale = gravityScale;

      // If there is no body, set a new one
      if (this._body === null) {
        this.createBody();
        return;
      }

      // Update the body gravity scale
      this._body.SetGravityScale(this.gravityScale);
    }

    layerEnabled(layer) {
      // Layer must be an integer
      layer = Math.floor(layer);

      // Layer must be in range [1, 16]
      if (layer < 1 || layer > 16) {
        return false;
      }
      return !!(this.layers & (1 << (layer - 1)));
    }

    enableLayer(layer, enable): void {
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
        this.createBody();
        return;
      }

      // Update the body layers
      const filter = this._body.GetFixtureList().GetFilterData();
      filter.set_categoryBits(this.layers);
      this._body.GetFixtureList().SetFilterData(filter);
    }

    maskEnabled(mask) {
      // Mask must be an integer
      mask = Math.floor(mask);

      // Mask must be in range [1, 16]
      if (mask < 1 || mask > 16) {
        return false;
      }
      return !!(this.masks & (1 << (mask - 1)));
    }

    enableMask(mask, enable): void {
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
        this.createBody();
        return;
      }

      // Update the body masks
      const filter = this._body.GetFixtureList().GetFilterData();
      filter.set_maskBits(this.masks);
      this._body.GetFixtureList().SetFilterData(filter);
    }

    getLinearVelocityX(): float {
      // If there is no body, set a new one
      if (this._body === null) {
        this.createBody();
        return 0;
      }

      // Get the linear velocity on X
      return this._body.GetLinearVelocity().get_x() * this._sharedData.scaleX;
    }

    setLinearVelocityX(linearVelocityX): void {
      // If there is no body, set a new one
      if (this._body === null) {
        this.createBody();
      }

      // Set the linear velocity on X
      this._body.SetLinearVelocity(
        this.b2Vec2(
          linearVelocityX * this._sharedData.invScaleX,
          this._body.GetLinearVelocity().get_y()
        )
      );
    }

    getLinearVelocityY(): float {
      // If there is no body, set a new one
      if (this._body === null) {
        this.createBody();
        return 0;
      }

      // Get the linear velocity on Y
      return this._body.GetLinearVelocity().get_y() * this._sharedData.scaleY;
    }

    setLinearVelocityY(linearVelocityY): void {
      // If there is no body, set a new one
      if (this._body === null) {
        this.createBody();
      }

      // Set the linear velocity on Y
      this._body.SetLinearVelocity(
        this.b2Vec2(
          this._body.GetLinearVelocity().get_x(),
          linearVelocityY * this._sharedData.invScaleY
        )
      );
    }

    getLinearVelocityLength() {
      // If there is no body, set a new one
      if (this._body === null) {
        this.createBody();
        return 0;
      }

      // Get the linear velocity length
      return this.b2Vec2(
        this._body.GetLinearVelocity().get_x() * this._sharedData.scaleX,
        this._body.GetLinearVelocity().get_y() * this._sharedData.scaleY
      ).Length();
    }

    getAngularVelocity() {
      // If there is no body, set a new one
      if (this._body === null) {
        this.createBody();
      }

      // Get the angular velocity
      return gdjs.toDegrees(this._body.GetAngularVelocity());
    }

    setAngularVelocity(angularVelocity): void {
      // If there is no body, set a new one
      if (this._body === null) {
        this.createBody();
      }

      // Set the angular velocity
      this._body.SetAngularVelocity(gdjs.toRad(angularVelocity));
    }

    applyForce(forceX, forceY, positionX, positionY) {
      // If there is no body, set a new one
      if (this._body === null) {
        this.createBody();
      }

      // Wake up the object
      this._body.SetAwake(true);

      // Apply the force
      this._body.ApplyForce(
        this.b2Vec2(forceX, forceY),
        this.b2Vec2Sec(
          positionX * this._sharedData.invScaleX,
          positionY * this._sharedData.invScaleY
        )
      );
    }

    applyPolarForce(angle, length, positionX, positionY) {
      // If there is no body, set a new one
      if (this._body === null) {
        this.createBody();
      }

      // Wake up the object
      this._body.SetAwake(true);

      // Apply the force
      angle = gdjs.toRad(angle);
      this._body.ApplyForce(
        this.b2Vec2(length * Math.cos(angle), length * Math.sin(angle)),
        this.b2Vec2Sec(
          positionX * this._sharedData.invScaleX,
          positionY * this._sharedData.invScaleY
        )
      );
    }

    applyForceTowardPosition(length, towardX, towardY, positionX, positionY) {
      // If there is no body, set a new one
      if (this._body === null) {
        this.createBody();
      }

      // Wake up the object
      this._body.SetAwake(true);

      // Apply the force
      const angle = Math.atan2(
        towardY * this._sharedData.invScaleY - this._body.GetPosition().get_y(),
        towardX * this._sharedData.invScaleX - this._body.GetPosition().get_x()
      );
      this._body.ApplyForce(
        this.b2Vec2(length * Math.cos(angle), length * Math.sin(angle)),
        this.b2Vec2Sec(
          positionX * this._sharedData.invScaleX,
          positionY * this._sharedData.invScaleY
        )
      );
    }

    applyImpulse(impulseX, impulseY, positionX, positionY) {
      // If there is no body, set a new one
      if (this._body === null) {
        this.createBody();
      }

      // Wake up the object
      this._body.SetAwake(true);

      // Apply the impulse
      this._body.ApplyLinearImpulse(
        this.b2Vec2(impulseX, impulseY),
        this.b2Vec2Sec(
          positionX * this._sharedData.invScaleX,
          positionY * this._sharedData.invScaleY
        )
      );
    }

    applyPolarImpulse(angle, length, positionX, positionY) {
      // If there is no body, set a new one
      if (this._body === null) {
        this.createBody();
      }

      // Wake up the object
      this._body.SetAwake(true);

      // Apply the impulse
      angle = gdjs.toRad(angle);
      this._body.ApplyLinearImpulse(
        this.b2Vec2(length * Math.cos(angle), length * Math.sin(angle)),
        this.b2Vec2Sec(
          positionX * this._sharedData.invScaleX,
          positionY * this._sharedData.invScaleY
        )
      );
    }

    applyImpulseTowardPosition(length, towardX, towardY, positionX, positionY) {
      // If there is no body, set a new one
      if (this._body === null) {
        this.createBody();
      }

      // Wake up the object
      this._body.SetAwake(true);

      // Apply the impulse
      const angle = Math.atan2(
        towardY * this._sharedData.invScaleY - this._body.GetPosition().get_y(),
        towardX * this._sharedData.invScaleX - this._body.GetPosition().get_x()
      );
      this._body.ApplyLinearImpulse(
        this.b2Vec2(length * Math.cos(angle), length * Math.sin(angle)),
        this.b2Vec2Sec(
          positionX * this._sharedData.invScaleX,
          positionY * this._sharedData.invScaleY
        )
      );
    }

    applyTorque(torque) {
      // If there is no body, set a new one
      if (this._body === null) {
        this.createBody();
      }

      // Wake up the object
      this._body.SetAwake(true);

      // Apply the torque
      this._body.ApplyTorque(torque);
    }

    applyAngularImpulse(angularImpulse) {
      // If there is no body, set a new one
      if (this._body === null) {
        this.createBody();
      }

      // Wake up the object
      this._body.SetAwake(true);

      // Apply the angular impulse
      this._body.ApplyAngularImpulse(angularImpulse);
    }

    getMassCenterX(): float {
      // If there is no body, set a new one
      if (this._body === null) {
        this.createBody();
      }

      // Get the mass center on X
      return this._body.GetWorldCenter().get_x() * this._sharedData.scaleX;
    }

    getMassCenterY(): float {
      // If there is no body, set a new one
      if (this._body === null) {
        this.createBody();
      }

      // Get the mass center on Y
      return this._body.GetWorldCenter().get_y() * this._sharedData.scaleY;
    }

    // Joints
    isJointFirstObject(jointId): boolean {
      // If there is no body, set a new one
      if (this._body === null) {
        this.createBody();
        return false;
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

    isJointSecondObject(jointId): boolean {
      // If there is no body, set a new one
      if (this._body === null) {
        this.createBody();
        return false;
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

    getJointFirstAnchorX(jointId): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found
      if (joint === null) {
        return 0;
      }

      // Get the joint anchor
      return joint.GetBodyA().GetWorldPoint(joint.GetLocalAnchorA()).get_x();
    }

    getJointFirstAnchorY(jointId): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found
      if (joint === null) {
        return 0;
      }

      // Get the joint anchor
      return joint.GetBodyA().GetWorldPoint(joint.GetLocalAnchorA()).get_y();
    }

    getJointSecondAnchorX(jointId): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found
      if (joint === null) {
        return 0;
      }

      // Get the joint anchor
      return joint.GetBodyB().GetWorldPoint(joint.GetLocalAnchorB()).get_x();
    }

    getJointSecondAnchorY(jointId): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found
      if (joint === null) {
        return 0;
      }

      // Get the joint anchor
      return joint.GetBodyB().GetWorldPoint(joint.GetLocalAnchorB()).get_y();
    }

    getJointReactionForce(jointId) {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found
      if (joint === null) {
        return 0;
      }

      // Get the reaction force
      return joint.GetReactionForce(1 / this._sharedData.timeStep).Length();
    }

    getJointReactionTorque(jointId) {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found
      if (joint === null) {
        return 0;
      }

      // Get the reaction torque
      return joint.GetReactionTorque(1 / this._sharedData.timeStep);
    }

    removeJoint(jointId) {
      // Just let the sharedData to manage and delete the joint
      this._sharedData.removeJoint(jointId);
    }

    // Distance joint
    addDistanceJoint(
      x1,
      y1,
      other,
      x2,
      y2,
      length,
      frequency,
      dampingRatio,
      collideConnected,
      variable
    ) {
      // If there is no body, set a new one
      if (this._body === null) {
        this.createBody();
      }

      // If there is no second object or it doesn't share the behavior, return
      if (other == null || !other.hasBehavior(this.name)) {
        return;
      }

      // Get the second body
      const otherBody = other.getBehavior(this.name).getBody();

      // If the first and second objects/bodies are the same, return
      if (this._body === otherBody) {
        return;
      }

      // Set joint settings
      const jointDef = new Box2D.b2DistanceJointDef();
      jointDef.set_bodyA(this._body);
      jointDef.set_localAnchorA(
        this._body.GetLocalPoint(
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

    getDistanceJointLength(jointId) {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_distanceJoint) {
        return 0;
      }

      // Get the joint length
      return joint.GetLength() * this._sharedData.scaleX;
    }

    setDistanceJointLength(jointId, length): void {
      // Invalid value
      if (length <= 0) {
        return;
      }

      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

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

    getDistanceJointFrequency(jointId) {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_distanceJoint) {
        return 0;
      }

      // Get the joint frequency
      return joint.GetFrequency();
    }

    setDistanceJointFrequency(jointId, frequency): void {
      // Invalid value
      if (frequency < 0) {
        return;
      }

      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_distanceJoint) {
        return;
      }

      // Set the joint frequency
      joint.SetFrequency(frequency);
    }

    getDistanceJointDampingRatio(jointId) {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_distanceJoint) {
        return 0;
      }

      // Get the joint damping ratio
      return joint.GetDampingRatio();
    }

    setDistanceJointDampingRatio(jointId, dampingRatio): void {
      // Invalid value
      if (dampingRatio < 0) {
        return;
      }

      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_distanceJoint) {
      }

      // Set the joint damping ratio
      joint.SetDampingRatio(dampingRatio);
    }

    // Revolute joint
    addRevoluteJoint(
      x,
      y,
      enableLimit,
      referenceAngle,
      lowerAngle,
      upperAngle,
      enableMotor,
      motorSpeed,
      maxMotorTorque,
      variable
    ) {
      // If there is no body, set a new one
      if (this._body === null) {
        this.createBody();
      }

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
      jointDef.set_bodyB(this._body);
      jointDef.set_localAnchorB(
        this._body.GetLocalPoint(
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
      x1,
      y1,
      other,
      x2,
      y2,
      enableLimit,
      referenceAngle,
      lowerAngle,
      upperAngle,
      enableMotor,
      motorSpeed,
      maxMotorTorque,
      collideConnected,
      variable
    ) {
      // If there is no body, set a new one
      if (this._body === null) {
        this.createBody();
      }

      // If there is no second object or it doesn't share the behavior, return
      if (other == null || !other.hasBehavior(this.name)) {
        return;
      }

      // Get the second body
      const otherBody = other.getBehavior(this.name).getBody();

      // If the first and second objects/bodies are the same, return
      if (this._body === otherBody) {
        return;
      }

      // Set joint settings
      const jointDef = new Box2D.b2RevoluteJointDef();
      jointDef.set_bodyA(this._body);
      jointDef.set_localAnchorA(
        this._body.GetLocalPoint(
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

    getRevoluteJointReferenceAngle(jointId): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_revoluteJoint) {
        return 0;
      }

      // Get the joint reference angle
      return gdjs.toDegrees(joint.GetReferenceAngle());
    }

    getRevoluteJointAngle(jointId): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_revoluteJoint) {
        return 0;
      }

      // Get the joint current angle
      return gdjs.toDegrees(joint.GetJointAngle());
    }

    getRevoluteJointSpeed(jointId) {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_revoluteJoint) {
        return 0;
      }

      // Get the joint angular speed
      return gdjs.toDegrees(joint.GetJointSpeed());
    }

    isRevoluteJointLimitsEnabled(jointId): boolean {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_revoluteJoint) {
        return false;
      }

      // Get the joint limits state
      return joint.IsLimitEnabled();
    }

    enableRevoluteJointLimits(jointId, enable): void {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_revoluteJoint) {
        return;
      }

      // Set the joint limits state
      joint.EnableLimit(enable);
    }

    getRevoluteJointMinAngle(jointId): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_revoluteJoint) {
        return 0;
      }

      // Get the joint lower angle
      return gdjs.toDegrees(joint.GetLowerLimit());
    }

    getRevoluteJointMaxAngle(jointId): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_revoluteJoint) {
        return 0;
      }

      // Get the joint upper angle
      return gdjs.toDegrees(joint.GetUpperLimit());
    }

    setRevoluteJointLimits(jointId, lowerAngle, upperAngle): void {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

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

    isRevoluteJointMotorEnabled(jointId): boolean {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_revoluteJoint) {
        return false;
      }

      // Get the joint motor state
      return joint.IsMotorEnabled();
    }

    enableRevoluteJointMotor(jointId, enable): void {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_revoluteJoint) {
        return;
      }

      // Set the joint motor state
      joint.EnableMotor(enable);
    }

    getRevoluteJointMotorSpeed(jointId) {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_revoluteJoint) {
        return 0;
      }

      // Get the joint motor speed
      return gdjs.toDegrees(joint.GetMotorSpeed());
    }

    setRevoluteJointMotorSpeed(jointId, speed): void {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_revoluteJoint) {
        return;
      }

      // Set the joint motor speed
      joint.SetMotorSpeed(gdjs.toRad(speed));
    }

    getRevoluteJointMaxMotorTorque(jointId) {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_revoluteJoint) {
        return 0;
      }

      // Get the joint max motor
      return joint.GetMaxMotorTorque();
    }

    setRevoluteJointMaxMotorTorque(jointId, maxTorque): void {
      // Invalid value
      if (maxTorque < 0) {
        return;
      }

      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_revoluteJoint) {
        return;
      }

      // Set the joint max motor
      joint.SetMaxMotorTorque(maxTorque);
    }

    getRevoluteJointMotorTorque(jointId) {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_revoluteJoint) {
        return 0;
      }

      // Get the joint motor torque
      return joint.GetMotorTorque(1 / this._sharedData.timeStep);
    }

    // Prismatic joint
    addPrismaticJoint(
      x1,
      y1,
      other,
      x2,
      y2,
      axisAngle,
      referenceAngle,
      enableLimit,
      lowerTranslation,
      upperTranslation,
      enableMotor,
      motorSpeed,
      maxMotorForce,
      collideConnected,
      variable
    ) {
      // If there is no body, set a new one
      if (this._body === null) {
        this.createBody();
      }

      // If there is no second object or it doesn't share the behavior, return
      if (other == null || !other.hasBehavior(this.name)) {
        return;
      }

      // Get the second body
      const otherBody = other.getBehavior(this.name).getBody();

      // If the first and second objects/bodies are the same, return
      if (this._body === otherBody) {
        return;
      }

      // Set joint settings
      const jointDef = new Box2D.b2PrismaticJointDef();
      jointDef.set_bodyA(this._body);
      jointDef.set_localAnchorA(
        this._body.GetLocalPoint(
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
      axisAngle = gdjs.toRad(axisAngle) - this._body.GetAngle();
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

    getPrismaticJointAxisAngle(jointId): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

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

    getPrismaticJointReferenceAngle(jointId): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_prismaticJoint) {
        return 0;
      }

      // Get the joint reference angle
      return gdjs.toDegrees(joint.GetReferenceAngle());
    }

    getPrismaticJointTranslation(jointId) {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_prismaticJoint) {
        return 0;
      }

      // Get the joint current translation
      return joint.GetJointTranslation() * this._sharedData.scaleX;
    }

    getPrismaticJointSpeed(jointId) {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_prismaticJoint) {
        return 0;
      }

      // Get the joint speed
      return joint.GetJointSpeed() * this._sharedData.scaleX;
    }

    isPrismaticJointLimitsEnabled(jointId): boolean {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_prismaticJoint) {
        return false;
      }

      // Get the joint limits state
      return joint.IsLimitEnabled();
    }

    enablePrismaticJointLimits(jointId, enable): void {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_prismaticJoint) {
        return;
      }

      // Set the joint limits state
      joint.EnableLimit(enable);
    }

    getPrismaticJointMinTranslation(jointId) {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_prismaticJoint) {
        return 0;
      }

      // Get the joint lower limit
      return joint.GetLowerLimit() * this._sharedData.scaleX;
    }

    getPrismaticJointMaxTranslation(jointId) {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_prismaticJoint) {
        return 0;
      }

      // Get the joint upper angle
      return joint.GetUpperLimit() * this._sharedData.scaleX;
    }

    setPrismaticJointLimits(jointId, lowerTranslation, upperTranslation): void {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

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

    isPrismaticJointMotorEnabled(jointId): boolean {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_prismaticJoint) {
        return false;
      }

      // Get the joint motor state
      return joint.IsMotorEnabled();
    }

    enablePrismaticJointMotor(jointId, enable): void {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_prismaticJoint) {
        return;
      }

      // Set the joint motor state
      joint.EnableMotor(enable);
    }

    getPrismaticJointMotorSpeed(jointId) {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_prismaticJoint) {
        return 0;
      }

      // Get the joint motor speed
      return joint.GetMotorSpeed() * this._sharedData.scaleX;
    }

    setPrismaticJointMotorSpeed(jointId, speed): void {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_prismaticJoint) {
        return;
      }

      // Set the joint motor speed
      joint.SetMotorSpeed(speed * this._sharedData.invScaleX);
    }

    getPrismaticJointMaxMotorForce(jointId) {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_prismaticJoint) {
        return 0;
      }

      // Get the joint max motor force
      return joint.GetMaxMotorForce();
    }

    setPrismaticJointMaxMotorForce(jointId, maxForce): void {
      // Invalid value
      if (maxForce < 0) {
        return;
      }

      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_prismaticJoint) {
        return;
      }

      // Set the joint max motor force
      joint.SetMaxMotorForce(maxForce);
    }

    getPrismaticJointMotorForce(jointId) {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_prismaticJoint) {
        return 0;
      }

      // Get the joint motor torque
      return joint.GetMotorForce(1 / this._sharedData.timeStep);
    }

    // Pulley joint
    addPulleyJoint(
      x1,
      y1,
      other,
      x2,
      y2,
      groundX1,
      groundY1,
      groundX2,
      groundY2,
      lengthA,
      lengthB,
      ratio,
      collideConnected,
      variable
    ) {
      // If there is no body, set a new one
      if (this._body === null) {
        this.createBody();
      }

      // If there is no second object or it doesn't share the behavior, return
      if (other == null || !other.hasBehavior(this.name)) {
        return;
      }

      // Get the second body
      const otherBody = other.getBehavior(this.name).getBody();

      // If the first and second objects/bodies are the same, return
      if (this._body === otherBody) {
        return;
      }

      // Set joint settings
      const jointDef = new Box2D.b2PulleyJointDef();
      jointDef.set_bodyA(this._body);
      jointDef.set_localAnchorA(
        this._body.GetLocalPoint(
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

    getPulleyJointFirstGroundAnchorX(jointId): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_pulleyJoint) {
        return 0;
      }

      // Get the joint ground anchor
      return joint.GetGroundAnchorA().get_x() * this._sharedData.scaleX;
    }

    getPulleyJointFirstGroundAnchorY(jointId): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_pulleyJoint) {
        return 0;
      }

      // Get the joint ground anchor
      return joint.GetGroundAnchorA().get_y() * this._sharedData.scaleY;
    }

    getPulleyJointSecondGroundAnchorX(jointId): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_pulleyJoint) {
        return 0;
      }

      // Get the joint ground anchor
      return joint.GetGroundAnchorB().get_x() * this._sharedData.scaleX;
    }

    getPulleyJointSecondGroundAnchorY(jointId): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_pulleyJoint) {
        return 0;
      }

      // Get the joint ground anchor
      return joint.GetGroundAnchorB().get_y() * this._sharedData.scaleY;
    }

    getPulleyJointFirstLength(jointId) {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_pulleyJoint) {
        return 0;
      }

      // Get the joint length
      return joint.GetCurrentLengthA() * this._sharedData.scaleX;
    }

    getPulleyJointSecondLength(jointId) {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_pulleyJoint) {
        return 0;
      }

      // Get the joint length
      return joint.GetCurrentLengthB() * this._sharedData.scaleX;
    }

    getPulleyJointRatio(jointId) {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

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
        this.createBody();
      }

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
      jointDef.set_bodyB(this._body);
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

    getGearJointFirstJoint(jointId) {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_gearJoint) {
        return 0;
      }

      // Get the joint first joint
      return this._sharedData.getJointId(joint.GetJoint1());
    }

    getGearJointSecondJoint(jointId) {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_gearJoint) {
        return 0;
      }

      // Get the joint second joint
      return this._sharedData.getJointId(joint.GetJoint2());
    }

    getGearJointRatio(jointId) {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_gearJoint) {
        return 0;
      }

      // Get the joint ratio
      return joint.GetRatio();
    }

    setGearJointRatio(jointId, ratio): void {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

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
      targetX,
      targetY,
      maxForce,
      frequency,
      dampingRatio,
      variable
    ) {
      // If there is no body, set a new one
      if (this._body === null) {
        this.createBody();
      }

      // Set joint settings
      const jointDef = new Box2D.b2MouseJointDef();
      jointDef.set_bodyA(this._sharedData.staticBody);
      jointDef.set_bodyB(this._body);
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

    getMouseJointTargetX(jointId): float {
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_mouseJoint) {
        return 0;
      }

      // Get the joint target X
      return joint.GetTarget().get_x() * this._sharedData.scaleX;
    }

    getMouseJointTargetY(jointId): float {
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_mouseJoint) {
        return 0;
      }

      // Get the joint target Y
      return joint.GetTarget().get_y() * this._sharedData.scaleY;
    }

    setMouseJointTarget(jointId, targetX, targetY): void {
      const joint = this._sharedData.getJoint(jointId);

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

    getMouseJointMaxForce(jointId) {
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_mouseJoint) {
        return 0;
      }

      // Get the joint max force
      return joint.GetMaxForce();
    }

    setMouseJointMaxForce(jointId, maxForce): void {
      // Invalid value
      if (maxForce < 0) {
        return;
      }
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_mouseJoint) {
        return;
      }

      // Set the joint max force
      joint.SetMaxForce(maxForce);
    }

    getMouseJointFrequency(jointId) {
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_mouseJoint) {
        return 0;
      }

      // Get the joint frequency
      return joint.GetFrequency();
    }

    setMouseJointFrequency(jointId, frequency): void {
      // Invalid value
      if (frequency <= 0) {
        return;
      }
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_mouseJoint) {
        return;
      }

      // Set the joint frequency
      joint.SetFrequency(frequency);
    }

    getMouseJointDampingRatio(jointId) {
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_mouseJoint) {
        return 0;
      }

      // Get the joint damping ratio
      return joint.GetDampingRatio();
    }

    setMouseJointDampingRatio(jointId, dampingRatio): void {
      // Invalid value
      if (dampingRatio < 0) {
        return;
      }
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_mouseJoint) {
        return;
      }

      // Set the joint damping ratio
      joint.SetDampingRatio(dampingRatio);
    }

    // Wheel joint
    addWheelJoint(
      x1,
      y1,
      other,
      x2,
      y2,
      axisAngle,
      frequency,
      dampingRatio,
      enableMotor,
      motorSpeed,
      maxMotorTorque,
      collideConnected,
      variable
    ) {
      // If there is no body, set a new one
      if (this._body === null) {
        this.createBody();
      }

      // If there is no second object or it doesn't share the behavior, return
      if (other == null || !other.hasBehavior(this.name)) {
        return;
      }

      // Get the second body
      const otherBody = other.getBehavior(this.name).getBody();

      // If the first and second objects/bodies are the same, return
      if (this._body === otherBody) {
        return;
      }

      // Set joint settings
      const jointDef = new Box2D.b2WheelJointDef();
      jointDef.set_bodyA(this._body);
      jointDef.set_localAnchorA(
        this._body.GetLocalPoint(
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
      axisAngle = gdjs.toRad(axisAngle) - this._body.GetAngle();
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

    getWheelJointAxisAngle(jointId): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

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

    getWheelJointTranslation(jointId) {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_wheelJoint) {
        return 0;
      }

      // Get the joint current translation
      return joint.GetJointTranslation() * this._sharedData.scaleX;
    }

    getWheelJointSpeed(jointId) {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_wheelJoint) {
        return 0;
      }

      // Get the joint speed
      return gdjs.toDegrees(joint.GetJointSpeed());
    }

    isWheelJointMotorEnabled(jointId): boolean {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_wheelJoint) {
        return false;
      }

      // Get the joint motor state
      return joint.IsMotorEnabled();
    }

    enableWheelJointMotor(jointId, enable): void {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_wheelJoint) {
        return;
      }

      // Set the joint motor state
      joint.EnableMotor(enable);
    }

    getWheelJointMotorSpeed(jointId) {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_wheelJoint) {
        return 0;
      }

      // Get the joint motor speed
      return gdjs.toDegrees(joint.GetMotorSpeed());
    }

    setWheelJointMotorSpeed(jointId, speed): void {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_wheelJoint) {
        return;
      }

      // Set the joint motor speed
      joint.SetMotorSpeed(gdjs.toRad(speed));
    }

    getWheelJointMaxMotorTorque(jointId) {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_wheelJoint) {
        return 0;
      }

      // Get the joint max motor torque
      return joint.GetMaxMotorTorque();
    }

    setWheelJointMaxMotorTorque(jointId, maxTorque): void {
      // Invalid value
      if (maxTorque < 0) {
        return;
      }

      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_wheelJoint) {
        return;
      }

      // Set the joint max motor torque
      joint.SetMaxMotorTorque(maxTorque);
    }

    getWheelJointMotorTorque(jointId) {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_wheelJoint) {
        return 0;
      }

      // Get the joint motor torque
      return joint.GetMotorTorque(1 / this._sharedData.timeStep);
    }

    getWheelJointFrequency(jointId) {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_wheelJoint) {
        return 0;
      }

      // Get the joint frequency
      return joint.GetSpringFrequencyHz();
    }

    setWheelJointFrequency(jointId, frequency): void {
      // Invalid value
      if (frequency < 0) {
        return;
      }

      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_wheelJoint) {
        return;
      }

      // Set the joint frequency
      joint.SetSpringFrequencyHz(frequency);
    }

    getWheelJointDampingRatio(jointId) {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_wheelJoint) {
        return 0;
      }

      // Get the joint damping ratio
      return joint.GetSpringDampingRatio();
    }

    setWheelJointDampingRatio(jointId, dampingRatio): void {
      // Invalid value
      if (dampingRatio < 0) {
        return;
      }

      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_wheelJoint) {
        return;
      }

      // Set the joint damping ratio
      joint.SetSpringDampingRatio(dampingRatio);
    }

    // Weld joint
    addWeldJoint(
      x1,
      y1,
      other,
      x2,
      y2,
      referenceAngle,
      frequency,
      dampingRatio,
      collideConnected,
      variable
    ) {
      // If there is no body, set a new one
      if (this._body === null) {
        this.createBody();
      }

      // If there is no second object or it doesn't share the behavior, return
      if (other == null || !other.hasBehavior(this.name)) {
        return;
      }

      // Get the second body
      const otherBody = other.getBehavior(this.name).getBody();

      // If the first and second objects/bodies are the same, return
      if (this._body === otherBody) {
        return;
      }

      // Set joint settings
      const jointDef = new Box2D.b2WeldJointDef();
      jointDef.set_bodyA(this._body);
      jointDef.set_localAnchorA(
        this._body.GetLocalPoint(
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

      // b2WeldJoint.GetReferenceAngle() is not binded, store it manually
      joint.referenceAngle = jointDef.get_referenceAngle();

      // Store the id in the variable
      variable.setNumber(this._sharedData.addJoint(joint));
    }

    getWeldJointReferenceAngle(jointId): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_weldJoint) {
        return 0;
      }

      // b2WeldJoint.GetReferenceAngle() is not binded
      // return gdjs.toDegrees(joint.GetReferenceAngle());
      return gdjs.toDegrees(joint.referenceAngle);
    }

    getWeldJointFrequency(jointId) {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_weldJoint) {
        return 0;
      }

      // Get the joint frequency
      return joint.GetFrequency();
    }

    setWeldJointFrequency(jointId, frequency): void {
      // Invalid value
      if (frequency < 0) {
        return;
      }

      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_weldJoint) {
        return;
      }

      // Set the joint frequency
      joint.SetFrequency(frequency);
    }

    getWeldJointDampingRatio(jointId) {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_weldJoint) {
        return 0;
      }

      // Get the joint damping ratio
      return joint.GetDampingRatio();
    }

    setWeldJointDampingRatio(jointId, dampingRatio): void {
      // Invalid value
      if (dampingRatio < 0) {
        return;
      }

      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_weldJoint) {
        return;
      }

      // Set the joint damping ratio
      joint.SetDampingRatio(dampingRatio);
    }

    // Rope joint
    addRopeJoint(x1, y1, other, x2, y2, maxLength, collideConnected, variable) {
      // If there is no body, set a new one
      if (this._body === null) {
        this.createBody();
      }

      // If there is no second object or it doesn't share the behavior, return
      if (other == null || !other.hasBehavior(this.name)) {
        return;
      }

      // Get the second body
      const otherBody = other.getBehavior(this.name).getBody();

      // If the first and second objects/bodies are the same, return
      if (this._body === otherBody) {
        return;
      }

      // Set joint settings
      const jointDef = new Box2D.b2RopeJointDef();
      jointDef.set_bodyA(this._body);
      jointDef.set_localAnchorA(
        this._body.GetLocalPoint(
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

    getRopeJointMaxLength(jointId) {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_ropeJoint) {
        return 0;
      }

      // Get the joint maximum length
      return joint.GetMaxLength() * this._sharedData.scaleX;
    }

    setRopeJointMaxLength(jointId, maxLength): void {
      // Invalid value
      if (maxLength < 0) {
        return;
      }

      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

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
      x1,
      y1,
      other,
      x2,
      y2,
      maxForce,
      maxTorque,
      collideConnected,
      variable
    ) {
      // If there is no body, set a new one
      if (this._body === null) {
        this.createBody();
      }

      // If there is no second object or it doesn't share the behavior, return
      if (other == null || !other.hasBehavior(this.name)) {
        return;
      }

      // Get the second body
      const otherBody = other.getBehavior(this.name).getBody();

      // If the first and second objects/bodies are the same, return
      if (this._body === otherBody) {
        return;
      }

      // Set joint settings
      const jointDef = new Box2D.b2FrictionJointDef();
      jointDef.set_bodyA(this._body);
      jointDef.set_localAnchorA(
        this._body.GetLocalPoint(
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

    getFrictionJointMaxForce(jointId) {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_frictionJoint) {
        return 0;
      }

      // Get the joint maximum force
      return joint.GetMaxForce();
    }

    setFrictionJointMaxForce(jointId, maxForce): void {
      // Invalid value
      if (maxForce < 0) {
        return;
      }

      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_frictionJoint) {
        return;
      }

      // Set the joint maximum force
      joint.SetMaxForce(maxForce);
    }

    getFrictionJointMaxTorque(jointId) {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_frictionJoint) {
        return 0;
      }

      // Get the joint maximum torque
      return joint.GetMaxTorque();
    }

    setFrictionJointMaxTorque(jointId, maxTorque): void {
      // Invalid value
      if (maxTorque < 0) {
        return;
      }

      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_frictionJoint) {
        return;
      }

      // Set the joint maximum torque
      joint.SetMaxTorque(maxTorque);
    }

    // Motor joint
    addMotorJoint(
      other,
      offsetX,
      offsetY,
      offsetAngle,
      maxForce,
      maxTorque,
      correctionFactor,
      collideConnected,
      variable
    ) {
      // If there is no body, set a new one
      if (this._body === null) {
        this.createBody();
      }

      // If there is no second object or it doesn't share the behavior, return
      if (other == null || !other.hasBehavior(this.name)) {
        return;
      }

      // Get the second body
      const otherBody = other.getBehavior(this.name).getBody();

      // If the first and second objects/bodies are the same, return
      if (this._body === otherBody) {
        return;
      }

      // Set joint settings
      const jointDef = new Box2D.b2MotorJointDef();
      jointDef.set_bodyA(this._body);
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

    getMotorJointOffsetX(jointId): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_motorJoint) {
        return 0;
      }

      // Get the joint offset
      return joint.GetLinearOffset().get_x() * this._sharedData.scaleX;
    }

    getMotorJointOffsetY(jointId): float {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_motorJoint) {
        return 0;
      }

      // Get the joint offset
      return joint.GetLinearOffset().get_y() * this._sharedData.scaleY;
    }

    setMotorJointOffset(jointId, offsetX, offsetY): void {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

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

    getMotorJointAngularOffset(jointId) {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_motorJoint) {
        return 0;
      }

      // Get the joint angular offset
      return gdjs.toDegrees(joint.GetAngularOffset());
    }

    setMotorJointAngularOffset(jointId, offsetAngle): void {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_motorJoint) {
        return;
      }

      // Set the joint angular offset
      joint.SetAngularOffset(gdjs.toRad(offsetAngle));
    }

    getMotorJointMaxForce(jointId) {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_motorJoint) {
        return 0;
      }

      // Get the joint maximum force
      return joint.GetMaxForce();
    }

    setMotorJointMaxForce(jointId, maxForce): void {
      // Invalid value
      if (maxForce < 0) {
        return;
      }

      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_motorJoint) {
        return;
      }

      // Set the joint maximum force
      joint.SetMaxForce(maxForce);
    }

    getMotorJointMaxTorque(jointId) {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_motorJoint) {
        return 0;
      }

      // Get the joint maximum torque
      return joint.GetMaxTorque();
    }

    setMotorJointMaxTorque(jointId, maxTorque): void {
      // Invalid value
      if (maxTorque < 0) {
        return;
      }

      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

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

    getMotorJointCorrectionFactor(jointId) {
      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

      // Joint not found or has wrong type
      if (joint === null || joint.GetType() !== Box2D.e_motorJoint) {
        return 0;
      }

      // Get the joint correction factor
      return joint.GetCorrectionFactor();
    }

    setMotorJointCorrectionFactor(jointId, correctionFactor): void {
      // Invalid value
      if (correctionFactor < 0 || correctionFactor > 1) {
        return;
      }

      // Get the joint
      const joint = this._sharedData.getJoint(jointId);

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

    // Collision
    static collisionTest(object1, object2, behaviorName) {
      // Check if the objects exist and share the behavior
      if (object1 === null || !object1.hasBehavior(behaviorName)) {
        return false;
      }
      if (object2 === null || !object2.hasBehavior(behaviorName)) {
        return false;
      }

      // Test if the second object is in the list of contacts of the first one
      const behavior1 = object1.getBehavior(behaviorName);
      for (let i = 0, len = behavior1.currentContacts.length; i < len; ++i) {
        if (behavior1.currentContacts[i].owner === object2) {
          return true;
        }
      }

      // No contact found
      return false;
    }
  }
  gdjs.registerBehavior(
    'Physics2::Physics2Behavior',
    gdjs.Physics2RuntimeBehavior
  );
}
