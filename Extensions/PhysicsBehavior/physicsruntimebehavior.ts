// @ts-nocheck
// This is deprecated and not worth typing.
/*
GDevelop - Physics Behavior Extension
Copyright (c) 2013-2016 Florian Rival (Florian.Rival@gmail.com)
 */
namespace gdjs {
  /**
   * Manage the common objects shared by objects having a
   * physics behavior.
   */
  export class PhysicsSharedData {
    stepped: boolean = false;
    totalTime: float = 0;
    fixedTimeStep: any;
    scaleX: any;
    scaleY: any;
    invScaleX: any;
    invScaleY: any;
    world: any;
    staticBody: any;

    //...and prepare contact listeners
    contactListener: any;

    constructor(runtimeScene, sharedData) {
      this.fixedTimeStep = 1 / 60;
      this.scaleX = sharedData.scaleX;
      this.scaleY = sharedData.scaleY;
      this.invScaleX = 1 / this.scaleX;
      this.invScaleY = 1 / this.scaleY;

      //Setup world...
      const b2World = Box2D.b2World;
      const b2Vec2 = Box2D.b2Vec2;
      this.world = new b2World(
        new b2Vec2(sharedData.gravityX, -sharedData.gravityY),
        true
      );
      this.world.SetAutoClearForces(false);
      this.staticBody = this.world.CreateBody(new Box2D.b2BodyDef());
      this.contactListener = new Box2D.JSContactListener();
      this.contactListener.BeginContact = function (contactPtr) {
        const contact = Box2D.wrapPointer(contactPtr, Box2D.b2Contact);
        if (
          contact.GetFixtureA().GetBody() == null ||
          contact.GetFixtureB().GetBody() == null
        ) {
          return;
        }
        const behaviorA = contact.GetFixtureA().GetBody()
            .gdjsAssociatedBehavior,
          behaviorB = contact.GetFixtureB().GetBody().gdjsAssociatedBehavior;
        behaviorA.currentContacts.push(behaviorB);
        behaviorB.currentContacts.push(behaviorA);
      };
      this.contactListener.EndContact = function (contactPtr) {
        const contact = Box2D.wrapPointer(contactPtr, Box2D.b2Contact);
        if (
          contact.GetFixtureA().GetBody() == null ||
          contact.GetFixtureB().GetBody() == null
        ) {
          return;
        }
        if (
          contact.GetFixtureA().GetBody() === null ||
          contact.GetFixtureB().GetBody() === null
        ) {
          return;
        }
        const behaviorA = contact.GetFixtureA().GetBody()
            .gdjsAssociatedBehavior,
          behaviorB = contact.GetFixtureB().GetBody().gdjsAssociatedBehavior;
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

    /**
     * Get the shared data for a scene.
     */
    static getSharedData(runtimeScene, name) {
      if (!runtimeScene.physicsSharedData) {
        //Create the shared data if necessary.
        const initialData = runtimeScene.getInitialSharedDataForBehavior(name);
        runtimeScene.physicsSharedData = new gdjs.PhysicsSharedData(
          runtimeScene,
          initialData
        );
      }
      return runtimeScene.physicsSharedData;
    }

    step(dt) {
      this.totalTime += dt;
      if (this.totalTime > this.fixedTimeStep) {
        let numberOfSteps = Math.floor(this.totalTime / this.fixedTimeStep);
        this.totalTime -= numberOfSteps * this.fixedTimeStep;
        if (numberOfSteps > 5) {
          numberOfSteps = 5;
        }

        //Process 5 steps at max.
        for (let a = 0; a < numberOfSteps; a++) {
          this.world.Step(this.fixedTimeStep, 6, 10);
        }
        this.world.ClearForces();
      }
      this.stepped = true;
    }
  }
  gdjs.registerRuntimeSceneUnloadedCallback(function (runtimeScene) {
    //Callback that destroys the box2d.js world of PhysicsSharedData shared data of the scene
    if (runtimeScene.physicsSharedData) {
      Box2D.destroy(runtimeScene.physicsSharedData.world);
    }
  });

  /**
   * Allows objects to be moved in a realistic way thanks to a physics engine (Box2D).
   */
  export class PhysicsRuntimeBehavior extends gdjs.RuntimeBehavior {
    _box2DBody: any = null;
    _dynamic: any;
    _objectOldWidth: float = 0;
    _objectOldHeight: float = 0;
    _objectOldX: number = 0;
    _objectOldY: number = 0;
    _objectOldAngle: float = 0;
    _angularDamping: any;
    _linearDamping: any;
    _isBullet: boolean;
    _fixedRotation: float;
    _massDensity: any;
    _averageFriction: any;
    _averageRestitution: any;
    _shapeType: any;
    currentContacts: any = [];
    _sharedData: any;

    //Temporary objects used to avoid creating garbage:
    _tempb2Vec2: any;

    constructor(runtimeScene, behaviorData, owner) {
      super(runtimeScene, behaviorData, owner);
      this._dynamic = behaviorData.dynamic;
      this._angularDamping = behaviorData.angularDamping;
      this._linearDamping = behaviorData.linearDamping;
      this._isBullet = behaviorData.isBullet;
      this._fixedRotation = behaviorData.fixedRotation;
      this._massDensity = behaviorData.massDensity;
      this._averageFriction = behaviorData.averageFriction;
      this._averageRestitution = behaviorData.averageRestitution;
      this._shapeType = behaviorData.shapeType;
      if (this.currentContacts !== undefined) {
        this.currentContacts.length = 0;
      } else {
      }
      this._sharedData = PhysicsSharedData.getSharedData(
        runtimeScene,
        behaviorData.name
      );

      //Do not create body now: the object is not fully created.
      this._tempb2Vec2 = new Box2D.b2Vec2();
    }

    //See b2Vec2 method
    updateFromBehaviorData(oldBehaviorData, newBehaviorData): boolean {
      if (oldBehaviorData.dynamic !== newBehaviorData.dynamic) {
        if (newBehaviorData.dynamic) {
          this.setDynamic();
        } else {
          this.setStatic();
        }
      }
      if (oldBehaviorData.angularDamping !== newBehaviorData.angularDamping) {
        this.setAngularDamping(newBehaviorData.angularDamping);
      }
      if (oldBehaviorData.linearDamping !== newBehaviorData.linearDamping) {
        this.setLinearDamping(newBehaviorData.linearDamping);
      }
      if (oldBehaviorData.isBullet !== newBehaviorData.isBullet) {
        if (newBehaviorData.isBullet) {
          this.setAsBullet();
        } else {
          this.dontSetAsBullet();
        }
      }
      if (oldBehaviorData.fixedRotation !== newBehaviorData.fixedRotation) {
        if (newBehaviorData.fixedRotation) {
          this.setFixedRotation();
        } else {
          this.setFreeRotation();
        }
      }

      // TODO: make these properties updatable.
      if (oldBehaviorData.massDensity !== newBehaviorData.massDensity) {
        return false;
      }
      if (oldBehaviorData.averageFriction !== newBehaviorData.averageFriction) {
        return false;
      }
      if (
        oldBehaviorData.averageRestitution !==
        newBehaviorData.averageRestitution
      ) {
        return false;
      }
      if (oldBehaviorData.shapeType !== newBehaviorData.shapeType) {
        return false;
      }
      return true;
    }

    onDeActivate() {
      if (this._box2DBody !== null) {
        this._sharedData.world.DestroyBody(this._box2DBody);
        this._box2DBody = null;
      }
    }

    onDestroy() {
      this.onDeActivate();
    }

    /**
     * Return a Box2D.b2Vec2 with the specified coordinates.
     * Should be used instead of doing 'new Box2D.b2Vec2(x, y)'.
     */
    b2Vec2(x, y) {
      this._tempb2Vec2.set_x(x);
      this._tempb2Vec2.set_y(y);
      return this._tempb2Vec2;
    }

    createBody() {
      //Create body from object
      const bodyDef = new Box2D.b2BodyDef();
      bodyDef.set_type(
        this._dynamic ? Box2D.b2_dynamicBody : Box2D.b2_staticBody
      );
      bodyDef.set_position(
        this.b2Vec2(
          (this.owner.getDrawableX() + this.owner.getWidth() / 2) *
            this._sharedData.invScaleX,
          -(this.owner.getDrawableY() + this.owner.getHeight() / 2) *
            this._sharedData.invScaleY
        )
      );
      bodyDef.set_angle(-gdjs.toRad(this.owner.getAngle()));
      bodyDef.set_angularDamping(
        this._angularDamping > 0 ? this._angularDamping : 0
      );
      bodyDef.set_linearDamping(
        this._linearDamping > 0 ? this._linearDamping : 0
      );
      bodyDef.set_bullet(this._isBullet);
      bodyDef.set_fixedRotation(this._fixedRotation);
      this._box2DBody = this._sharedData.world.CreateBody(bodyDef);
      this._box2DBody.gdjsAssociatedBehavior = this;

      //We do not use SetUserData which only accept integers.

      //Setup the fixture
      let fixDef = null;

      /*else if ( this._shapeType === "CustomPolygon" ) {
                //TODO
            }*/
      if (this._shapeType === 'Circle') {
        const circle = new Box2D.b2CircleShape();
        circle.set_m_radius(
          (this.owner.getWidth() * this._sharedData.invScaleX +
            this.owner.getHeight() * this._sharedData.invScaleY) /
            4
        );
        if (circle.get_m_radius() <= 0) {
          circle.set_m_radius(1);
        }
        fixDef = new Box2D.b2FixtureDef();
        fixDef.set_shape(circle);
      } else {
        //Box
        const box = new Box2D.b2PolygonShape();
        box.SetAsBox(
          ((this.owner.getWidth() > 0 ? this.owner.getWidth() : 1) *
            this._sharedData.invScaleX) /
            2,
          ((this.owner.getHeight() > 0 ? this.owner.getHeight() : 1) *
            this._sharedData.invScaleY) /
            2
        );
        fixDef = new Box2D.b2FixtureDef();
        fixDef.set_shape(box);
      }
      fixDef.set_density(this._massDensity);
      fixDef.set_friction(this._averageFriction);
      fixDef.set_restitution(this._averageRestitution);
      this._box2DBody.CreateFixture(fixDef);
      this._objectOldWidth = this.owner.getWidth();
      this._objectOldHeight = this.owner.getHeight();
    }

    doStepPreEvents(runtimeScene) {
      if (this._box2DBody === null) {
        this.createBody();
      }

      //Simulate the world
      if (!this._sharedData.stepped) {
        this._sharedData.step(
          runtimeScene.getTimeManager().getElapsedTime() / 1000
        );
      }

      //Update object position according to Box2D body
      this.owner.setX(
        this._box2DBody.GetPosition().get_x() * this._sharedData.scaleX -
          this.owner.getWidth() / 2 +
          this.owner.getX() -
          this.owner.getDrawableX()
      );
      this.owner.setY(
        -this._box2DBody.GetPosition().get_y() * this._sharedData.scaleY -
          this.owner.getHeight() / 2 +
          this.owner.getY() -
          this.owner.getDrawableY()
      );
      this.owner.setAngle(-gdjs.toDegrees(this._box2DBody.GetAngle()));
      this._objectOldX = this.owner.getX();
      this._objectOldY = this.owner.getY();
      this._objectOldAngle = this.owner.getAngle();
    }

    getBox2DBody() {
      if (this._box2DBody === null) {
        this.createBody();
      }
      return this._box2DBody;
    }

    doStepPostEvents(runtimeScene) {
      if (this._box2DBody === null) {
        this.createBody();
      }

      //Ensure the Box2D body width and height are correct.
      if (
        this._objectOldWidth !== this.owner.getWidth() ||
        this._objectOldHeight !== this.owner.getHeight()
      ) {
        //Recreate the body, but remember its movement.
        const oldAngularVelocity = this._box2DBody.GetAngularVelocity();
        const oldXVelocity = this._box2DBody.GetLinearVelocity().get_x();
        const oldYVelocity = this._box2DBody.GetLinearVelocity().get_y();
        this._sharedData.world.DestroyBody(this._box2DBody);
        this.createBody();
        this._box2DBody.SetAngularVelocity(oldAngularVelocity);
        this._box2DBody.SetLinearVelocity(
          this.b2Vec2(oldXVelocity, oldYVelocity)
        );
      }
      this._sharedData.stepped = false;

      //Ensure that the Box2D body position is correct
      if (
        this._objectOldX == this.owner.getX() &&
        this._objectOldY == this.owner.getY() &&
        this._objectOldAngle == this.owner.getAngle()
      ) {
        return;
      }
      const pos = this.b2Vec2(
        (this.owner.getDrawableX() + this.owner.getWidth() / 2) *
          this._sharedData.invScaleX,
        -(this.owner.getDrawableY() + this.owner.getHeight() / 2) *
          this._sharedData.invScaleY
      );
      this._box2DBody.SetTransform(pos, -gdjs.toRad(this.owner.getAngle()));
      this._box2DBody.SetAwake(true);
    }

    setStatic(): void {
      this._dynamic = false;
      if (this._box2DBody === null) {
        this.createBody();
      }
      this._box2DBody.SetType(Box2D.b2_staticBody);
    }

    setDynamic(): void {
      this._dynamic = true;
      if (this._box2DBody === null) {
        this.createBody();
      }
      this._box2DBody.SetType(Box2D.b2_dynamicBody);
      this._box2DBody.SetAwake(true);
    }

    setFixedRotation(): void {
      this._fixedRotation = true;
      if (this._box2DBody === null) {
        this.createBody();
      }
      this._box2DBody.SetFixedRotation(true);
    }

    setFreeRotation(): void {
      this._fixedRotation = false;
      if (this._box2DBody === null) {
        this.createBody();
      }
      this._box2DBody.SetFixedRotation(false);
    }

    setAsBullet(): void {
      this._isBullet = true;
      if (this._box2DBody === null) {
        this.createBody();
      }
      this._box2DBody.SetBullet(true);
    }

    dontSetAsBullet() {
      this._isBullet = false;
      if (this._box2DBody === null) {
        this.createBody();
      }
      this._box2DBody.SetBullet(false);
    }

    applyImpulse(xCoordinate, yCoordinate) {
      if (this._box2DBody === null) {
        this.createBody();
      }
      this._box2DBody.ApplyLinearImpulse(
        this.b2Vec2(xCoordinate, -yCoordinate),
        this._box2DBody.GetPosition()
      );
    }

    applyImpulseUsingPolarCoordinates(angle, length) {
      angle = gdjs.toRad(angle);
      if (this._box2DBody === null) {
        this.createBody();
      }
      this._box2DBody.ApplyLinearImpulse(
        this.b2Vec2(Math.cos(angle) * length, -Math.sin(angle) * length),
        this._box2DBody.GetPosition()
      );
    }

    applyImpulseTowardPosition(xPosition, yPosition, length) {
      if (this._box2DBody === null) {
        this.createBody();
      }
      const angle = Math.atan2(
        yPosition * this._sharedData.invScaleY +
          this._box2DBody.GetPosition().get_y(),
        xPosition * this._sharedData.invScaleX -
          this._box2DBody.GetPosition().get_x()
      );
      this._box2DBody.ApplyLinearImpulse(
        this.b2Vec2(Math.cos(angle) * length, -Math.sin(angle) * length),
        this._box2DBody.GetPosition()
      );
    }

    applyForce(xCoordinate, yCoordinate) {
      if (this._box2DBody === null) {
        this.createBody();
      }
      this._box2DBody.ApplyForce(
        this.b2Vec2(xCoordinate, -yCoordinate),
        this._box2DBody.GetPosition()
      );
    }

    applyForceUsingPolarCoordinates(angle, length) {
      angle = gdjs.toRad(angle);
      if (this._box2DBody === null) {
        this.createBody();
      }
      this._box2DBody.ApplyForce(
        this.b2Vec2(Math.cos(angle) * length, -Math.sin(angle) * length),
        this._box2DBody.GetPosition()
      );
    }

    applyForceTowardPosition(xPosition, yPosition, length) {
      if (this._box2DBody === null) {
        this.createBody();
      }
      const angle = Math.atan2(
        yPosition * this._sharedData.invScaleY +
          this._box2DBody.GetPosition().get_y(),
        xPosition * this._sharedData.invScaleX -
          this._box2DBody.GetPosition().get_x()
      );
      this._box2DBody.ApplyForce(
        this.b2Vec2(Math.cos(angle) * length, -Math.sin(angle) * length),
        this._box2DBody.GetPosition()
      );
    }

    applyTorque(torque) {
      if (this._box2DBody === null) {
        this.createBody();
      }
      this._box2DBody.ApplyTorque(torque);
    }

    setLinearVelocity(xVelocity, yVelocity): void {
      if (this._box2DBody === null) {
        this.createBody();
      }
      this._box2DBody.SetLinearVelocity(this.b2Vec2(xVelocity, -yVelocity));
    }

    setAngularVelocity(angularVelocity): void {
      if (this._box2DBody === null) {
        this.createBody();
      }
      this._box2DBody.SetAngularVelocity(angularVelocity);
    }

    setLinearDamping(linearDamping): void {
      if (this._box2DBody === null) {
        this.createBody();
      }
      this._box2DBody.SetLinearDamping(linearDamping);
    }

    setAngularDamping(angularDamping): void {
      if (this._box2DBody === null) {
        this.createBody();
      }
      this._box2DBody.SetAngularDamping(angularDamping);
    }

    addRevoluteJointBetweenObjects(
      object,
      scene,
      xPosRelativeToMassCenter,
      yPosRelativeToMassCenter
    ) {
      if (this._box2DBody === null) {
        this.createBody();
      }
      if (object == null || !object.hasBehavior(this.name)) {
        return;
      }
      const otherBody = object.getBehavior(this.name).getBox2DBody();
      if (this._box2DBody == otherBody) {
        return;
      }
      const jointDef = new Box2D.b2RevoluteJointDef();
      jointDef.Initialize(
        this._box2DBody,
        otherBody,
        this.b2Vec2(
          xPosRelativeToMassCenter * this._sharedData.invScaleX +
            this._box2DBody.GetWorldCenter().get_x(),
          yPosRelativeToMassCenter * this._sharedData.invScaleY +
            this._box2DBody.GetWorldCenter().get_y()
        )
      );
      this._sharedData.world.CreateJoint(jointDef);
    }

    addRevoluteJoint(xPosition, yPosition) {
      if (this._box2DBody === null) {
        this.createBody();
      }
      const jointDef = new Box2D.b2RevoluteJointDef();
      jointDef.Initialize(
        this._box2DBody,
        this._sharedData.staticBody,
        this.b2Vec2(
          xPosition * this._sharedData.invScaleX,
          -yPosition * this._sharedData.invScaleY
        )
      );
      this._sharedData.world.CreateJoint(jointDef);
    }

    setGravity(xGravity, yGravity): void {
      if (this._box2DBody === null) {
        this.createBody();
      }
      this._sharedData.world.SetGravity(this.b2Vec2(xGravity, -yGravity));
    }

    addGearJointBetweenObjects(object, ratio) {
      if (this._box2DBody === null) {
        this.createBody();
      }
      if (object == null || !object.hasBehavior(this.name)) {
        return;
      }
      const otherBody = object.getBehavior(this.name).getBox2DBody();
      if (this._box2DBody == otherBody) {
        return;
      }

      //Gear joint need a revolute joint to the ground for the two objects
      const jointDef1 = new Box2D.b2RevoluteJointDef();
      jointDef1.Initialize(
        this._sharedData.world.GetGroundBody(),
        this._box2DBody,
        this._box2DBody.GetWorldCenter()
      );
      const jointDef2 = new Box2D.b2RevoluteJointDef();
      jointDef2.Initialize(
        this._sharedData.world.GetGroundBody(),
        otherBody,
        otherBody.GetWorldCenter()
      );
      const jointDef = new Box2D.b2GearJointDef();
      jointDef.set_bodyA(this._box2DBody);
      jointDef.set_bodyB(otherBody);
      jointDef.set_joint1(this._sharedData.world.CreateJoint(jointDef1));
      jointDef.set_joint2(this._sharedData.world.CreateJoint(jointDef2));
      jointDef.set_ratio(ratio * 3.14159);
      this._sharedData.world.CreateJoint(jointDef);
    }

    setLinearVelocityX(xVelocity): void {
      if (this._box2DBody === null) {
        this.createBody();
      }
      this._box2DBody.SetLinearVelocity(
        this.b2Vec2(xVelocity, this._box2DBody.GetLinearVelocity().get_y())
      );
    }

    setLinearVelocityY(yVelocity): void {
      if (this._box2DBody === null) {
        this.createBody();
      }
      this._box2DBody.SetLinearVelocity(
        this.b2Vec2(this._box2DBody.GetLinearVelocity().get_x(), -yVelocity)
      );
    }

    getLinearVelocityX(): float {
      if (this._box2DBody === null) {
        this.createBody();
      }
      return this._box2DBody.GetLinearVelocity().get_x();
    }

    getLinearVelocityY(): float {
      if (this._box2DBody === null) {
        this.createBody();
      }
      return -this._box2DBody.GetLinearVelocity().get_y();
    }

    getLinearVelocity() {
      if (this._box2DBody === null) {
        this.createBody();
      }
      return Math.sqrt(
        this._box2DBody.GetLinearVelocity().get_x() *
          this._box2DBody.GetLinearVelocity().get_x() +
          this._box2DBody.GetLinearVelocity().get_y() *
            this._box2DBody.GetLinearVelocity().get_y()
      );
    }

    getAngularVelocity() {
      if (this._box2DBody === null) {
        this.createBody();
      }
      return this._box2DBody.GetAngularVelocity();
    }

    getLinearDamping() {
      if (this._box2DBody === null) {
        this.createBody();
      }
      return this._box2DBody.GetLinearDamping();
    }

    getAngularDamping() {
      if (this._box2DBody === null) {
        this.createBody();
      }
      return this._box2DBody.GetAngularDamping();
    }

    collisionWith(otherObjectsTable) {
      if (this._box2DBody === null) {
        this.createBody();
      }

      //Getting a list of all objects which are tested
      const objects = gdjs.staticArray(
        PhysicsRuntimeBehavior.prototype.collisionWith
      );
      objects.length = 0;
      const objectsLists = gdjs.staticArray2(
        PhysicsRuntimeBehavior.prototype.collisionWith
      );
      otherObjectsTable.values(objectsLists);
      for (let i = 0, len = objectsLists.length; i < len; ++i) {
        objects.push.apply(objects, objectsLists[i]);
      }

      //Test if an object of the list is in collision with our object.
      for (let i = 0, len = objects.length; i < len; ++i) {
        for (let j = 0, lenj = this.currentContacts.length; j < lenj; ++j) {
          if (this.currentContacts[j].owner.id === objects[i].id) {
            return true;
          }
        }
      }
      return false;
    }

    isStatic(): boolean {
      return !this._dynamic;
    }

    isDynamic(): boolean {
      return this._dynamic;
    }
  }

  gdjs.registerBehavior(
    'PhysicsBehavior::PhysicsBehavior',
    gdjs.PhysicsRuntimeBehavior
  );
}
