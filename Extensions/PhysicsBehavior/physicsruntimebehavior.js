/**
GDevelop - Physics Behavior Extension
Copyright (c) 2013-2016 Florian Rival (Florian.Rival@gmail.com)
 */

/**
 * Manage the common objects shared by objects having a
 * physics behavior.
 * @memberof gdjs
 * @class PhysicsSharedData
 */
gdjs.PhysicsSharedData = function(runtimeScene, sharedData)
{
	this.stepped = false;

	this.totalTime = 0;
	this.fixedTimeStep = 1/60;
	this.scaleX = sharedData.scaleX;
	this.scaleY = sharedData.scaleY;
	this.invScaleX = 1/this.scaleX;
	this.invScaleY = 1/this.scaleY;

	//Setup world...
	var b2World = Box2D.b2World;
	var b2Vec2 = Box2D.b2Vec2;
	this.world = new b2World(new b2Vec2(sharedData.gravityX, -sharedData.gravityY), true);
	this.world.SetAutoClearForces(false);
    this.staticBody = this.world.CreateBody(new Box2D.b2BodyDef());

    //...and prepare contact listeners
	this.contactListener = new Box2D.JSContactListener();
    this.contactListener.BeginContact = function (contactPtr) {
        var contact = Box2D.wrapPointer( contactPtr, Box2D.b2Contact );

        if ( contact.GetFixtureA().GetBody() == null ||
             contact.GetFixtureB().GetBody() == null )
            return;

        var behaviorA = contact.GetFixtureA().GetBody().gdjsAssociatedBehavior,
        behaviorB = contact.GetFixtureB().GetBody().gdjsAssociatedBehavior;

        behaviorA.currentContacts.push(behaviorB);
        behaviorB.currentContacts.push(behaviorA);
    };

    this.contactListener.EndContact = function (contactPtr) {
        var contact = Box2D.wrapPointer( contactPtr, Box2D.b2Contact );

        if ( contact.GetFixtureA().GetBody() == null ||
             contact.GetFixtureB().GetBody() == null )
            return;

        if ( contact.GetFixtureA().GetBody() === null ||
            contact.GetFixtureB().GetBody() === null )
        return;

        var behaviorA = contact.GetFixtureA().GetBody().gdjsAssociatedBehavior,
        behaviorB = contact.GetFixtureB().GetBody().gdjsAssociatedBehavior;

        var i = behaviorA.currentContacts.indexOf(behaviorB);
        if ( i !== -1 ) behaviorA.currentContacts.remove(i);

        i = behaviorB.currentContacts.indexOf(behaviorA);
        if ( i !== -1 ) behaviorB.currentContacts.remove(i);
    };

	this.contactListener.PreSolve = function() {};
	this.contactListener.PostSolve = function() {};

	this.world.SetContactListener(this.contactListener);
};

/**
 * Get the shared data for a scene.
 */
gdjs.PhysicsSharedData.getSharedData = function(runtimeScene, name) {
    if (!runtimeScene.physicsSharedData) { //Create the shared data if necessary.
        var initialData = runtimeScene.getInitialSharedDataForBehavior(name);
        runtimeScene.physicsSharedData = new gdjs.PhysicsSharedData(runtimeScene, initialData);
    }

    return runtimeScene.physicsSharedData;
};

gdjs.PhysicsSharedData.prototype.step = function(dt) {
	this.totalTime += dt;

	if(this.totalTime > this.fixedTimeStep) {
        var numberOfSteps = Math.floor(this.totalTime / this.fixedTimeStep);
        this.totalTime -= numberOfSteps * this.fixedTimeStep;

        if ( numberOfSteps > 5 ) numberOfSteps = 5; //Process 5 steps at max.

        for(var a = 0; a < numberOfSteps; a++) {
            this.world.Step(this.fixedTimeStep, 6, 10);
        }
        this.world.ClearForces();
	}

    this.stepped = true;
};

gdjs.registerRuntimeSceneUnloadedCallback(function (runtimeScene) {
	//Callback that destroys the box2d.js world of PhysicsSharedData shared data of the scene
	if(runtimeScene.physicsSharedData)
		Box2D.destroy(runtimeScene.physicsSharedData.world)
});

/**
 * Allows objects to be moved in a realistic way thanks to a physics engine (Box2D).
 *
 * @class PhysicsRuntimeBehavior
 * @constructor
 */
gdjs.PhysicsRuntimeBehavior = function(runtimeScene, behaviorData, owner)
{
    gdjs.RuntimeBehavior.call(this, runtimeScene, behaviorData, owner);

    this._box2DBody = null;
    this._dynamic = behaviorData.dynamic;
    this._objectOldWidth = 0;
    this._objectOldHeight = 0;
    this._objectOldX = 0;
    this._objectOldY = 0;
    this._objectOldAngle = 0;
    this._angularDamping = behaviorData.angularDamping;
    this._linearDamping = behaviorData.linearDamping;
    this._isBullet = behaviorData.isBullet;
    this._fixedRotation = behaviorData.fixedRotation;
	this._massDensity = behaviorData.massDensity;
	this._averageFriction = behaviorData.averageFriction;
	this._averageRestitution = behaviorData.averageRestitution;
    this._shapeType = behaviorData.shapeType;
	if ( this.currentContacts !== undefined )
		this.currentContacts.length = 0;
	else
		this.currentContacts = [];

	this._sharedData = gdjs.PhysicsSharedData.getSharedData(runtimeScene, behaviorData.name);

	//Do not create body now: the object is not fully created.

    //Temporary objects used to avoid creating garbage:
    this._tempb2Vec2 = new Box2D.b2Vec2(); //See b2Vec2 method
};

gdjs.PhysicsRuntimeBehavior.prototype = Object.create( gdjs.RuntimeBehavior.prototype );
gdjs.registerBehavior("PhysicsBehavior::PhysicsBehavior", gdjs.PhysicsRuntimeBehavior);

gdjs.PhysicsRuntimeBehavior.prototype.onDeActivate = function() {
	if ( this._box2DBody !== null ) {
		this._sharedData.world.DestroyBody(this._box2DBody);
		this._box2DBody = null;
	}
};

gdjs.PhysicsRuntimeBehavior.prototype.onDestroy = function() {
	this.onDeActivate();
};

/**
 * Return a Box2D.b2Vec2 with the specified coordinates.
 * Should be used instead of doing 'new Box2D.b2Vec2(x, y)'.
 */
gdjs.PhysicsRuntimeBehavior.prototype.b2Vec2 = function(x, y) {
    this._tempb2Vec2.set_x(x);
    this._tempb2Vec2.set_y(y);
    return this._tempb2Vec2;
};

gdjs.PhysicsRuntimeBehavior.prototype.createBody = function() {

    //Create body from object
    var bodyDef = new Box2D.b2BodyDef();
	bodyDef.set_type(this._dynamic ? Box2D.b2_dynamicBody : Box2D.b2_staticBody);
	bodyDef.set_position(this.b2Vec2(
		(this.owner.getDrawableX()+this.owner.getWidth()/2)*this._sharedData.invScaleX,
		-(this.owner.getDrawableY()+this.owner.getHeight()/2)*this._sharedData.invScaleY));
    bodyDef.set_angle(-gdjs.toRad(this.owner.getAngle()));
    bodyDef.set_angularDamping(this._angularDamping > 0 ? this._angularDamping : 0);
    bodyDef.set_linearDamping(this._linearDamping > 0 ? this._linearDamping : 0);
    bodyDef.set_bullet(this._isBullet);
    bodyDef.set_fixedRotation(this._fixedRotation);

	this._box2DBody = this._sharedData.world.CreateBody(bodyDef);
	this._box2DBody.gdjsAssociatedBehavior = this; //We do not use SetUserData which only accept integers.

	//Setup the fixture
    var fixDef = null;
	if ( this._shapeType === "Circle" ) {
		var circle = new Box2D.b2CircleShape();

        circle.set_m_radius(((this.owner.getWidth()*this._sharedData.invScaleX)+
            (this.owner.getHeight()*this._sharedData.invScaleY))/4);
		if ( circle.get_m_radius() <= 0 ) circle.set_m_radius(1);

		fixDef = new Box2D.b2FixtureDef();
		fixDef.set_shape(circle);
	}
	/*else if ( this._shapeType === "CustomPolygon" ) {
		//TODO
	}*/
	else { //Box
		var box = new Box2D.b2PolygonShape();
		box.SetAsBox(
			((this.owner.getWidth() > 0 ? this.owner.getWidth() : 1)*
				this._sharedData.invScaleX)/2,
			((this.owner.getHeight() > 0 ? this.owner.getHeight() : 1)*
				this._sharedData.invScaleY)/2);

		fixDef = new Box2D.b2FixtureDef();
		fixDef.set_shape(box);
	}

	fixDef.set_density(this._massDensity);
	fixDef.set_friction(this._averageFriction);
	fixDef.set_restitution(this._averageRestitution);
	this._box2DBody.CreateFixture(fixDef);

    this._objectOldWidth = this.owner.getWidth();
    this._objectOldHeight = this.owner.getHeight();
};

gdjs.PhysicsRuntimeBehavior.prototype.doStepPreEvents = function(runtimeScene) {
	if ( this._box2DBody === null ) this.createBody();

	//Simulate the world
	if ( !this._sharedData.stepped )
		this._sharedData.step(runtimeScene.getTimeManager().getElapsedTime()/1000);

    //Update object position according to Box2D body
	this.owner.setX(this._box2DBody.GetPosition().get_x()*this._sharedData.scaleX-
		this.owner.getWidth()/2+this.owner.getX()-this.owner.getDrawableX());
	this.owner.setY(-this._box2DBody.GetPosition().get_y()*this._sharedData.scaleY-
		this.owner.getHeight()/2+this.owner.getY()-this.owner.getDrawableY());
	this.owner.setAngle(-gdjs.toDegrees(this._box2DBody.GetAngle()));

    this._objectOldX = this.owner.getX();
    this._objectOldY = this.owner.getY();
    this._objectOldAngle = this.owner.getAngle();
};

gdjs.PhysicsRuntimeBehavior.prototype.getBox2DBody = function() {
	if ( this._box2DBody === null ) this.createBody();
	return this._box2DBody;
};

gdjs.PhysicsRuntimeBehavior.prototype.doStepPostEvents = function(runtimeScene) {
	if ( this._box2DBody === null ) this.createBody();

	//Ensure the Box2D body width and height are correct.
	if ( this._objectOldWidth !== this.owner.getWidth() ||
		this._objectOldHeight !== this.owner.getHeight() ) {

        //Recreate the body, but remember its movement.
        var oldAngularVelocity = this._box2DBody.GetAngularVelocity();
        var oldXVelocity = this._box2DBody.GetLinearVelocity().get_x();
        var oldYVelocity = this._box2DBody.GetLinearVelocity().get_y();

		this._sharedData.world.DestroyBody(this._box2DBody);
		this.createBody();

        this._box2DBody.SetAngularVelocity(oldAngularVelocity);
        this._box2DBody.SetLinearVelocity(this.b2Vec2(oldXVelocity, oldYVelocity));
	}

	this._sharedData.stepped = false;

	//Ensure that the Box2D body position is correct
    if ( this._objectOldX == this.owner.getX() &&
        this._objectOldY == this.owner.getY() &&
        this._objectOldAngle == this.owner.getAngle())
        return;

    var pos = this.b2Vec2(
        (this.owner.getDrawableX()+this.owner.getWidth()/2)*this._sharedData.invScaleX, -
        (this.owner.getDrawableY()+this.owner.getHeight()/2)*this._sharedData.invScaleY);
    this._box2DBody.SetTransform(pos, -gdjs.toRad(this.owner.getAngle()));
    this._box2DBody.SetAwake(true);
};

gdjs.PhysicsRuntimeBehavior.prototype.setStatic = function() {
    this._dynamic = false;

    if ( this._box2DBody === null ) this.createBody();
    this._box2DBody.SetType(Box2D.b2_staticBody);
};

gdjs.PhysicsRuntimeBehavior.prototype.setDynamic = function()
{
    this._dynamic = true;

    if ( this._box2DBody === null ) this.createBody();
    this._box2DBody.SetType(Box2D.b2_dynamicBody);
    this._box2DBody.SetAwake(true);
};

gdjs.PhysicsRuntimeBehavior.prototype.setFixedRotation = function()
{
    this._fixedRotation = true;

    if ( this._box2DBody === null ) this.createBody();
    this._box2DBody.SetFixedRotation(true);
};

gdjs.PhysicsRuntimeBehavior.prototype.setFreeRotation = function()
{
    this._fixedRotation = false;

    if ( this._box2DBody === null ) this.createBody();
    this._box2DBody.SetFixedRotation(false);
};

gdjs.PhysicsRuntimeBehavior.prototype.setAsBullet = function()
{
    this._isBullet = true;

    if ( this._box2DBody === null ) this.createBody();
    this._box2DBody.SetBullet(true);
};

gdjs.PhysicsRuntimeBehavior.prototype.dontSetAsBullet = function()
{
    this._isBullet = false;

    if ( this._box2DBody === null ) this.createBody();
    this._box2DBody.SetBullet(false);
};

gdjs.PhysicsRuntimeBehavior.prototype.applyImpulse = function(xCoordinate, yCoordinate)
{
    if ( this._box2DBody === null ) this.createBody();
    this._box2DBody.ApplyLinearImpulse(this.b2Vec2(xCoordinate, -yCoordinate),
        this._box2DBody.GetPosition());
};

gdjs.PhysicsRuntimeBehavior.prototype.applyImpulseUsingPolarCoordinates = function( angle, length )
{
	angle = gdjs.toRad(angle);

    if ( this._box2DBody === null ) this.createBody();
    this._box2DBody.ApplyLinearImpulse(this.b2Vec2(Math.cos(angle)*length,
        -Math.sin(angle)*length), this._box2DBody.GetPosition());
};

gdjs.PhysicsRuntimeBehavior.prototype.applyImpulseTowardPosition = function(xPosition, yPosition, length )
{
    if ( this._box2DBody === null ) this.createBody();

    var angle = Math.atan2(yPosition*this._sharedData.invScaleY+this._box2DBody.GetPosition().get_y(),
                        xPosition*this._sharedData.invScaleX-this._box2DBody.GetPosition().get_x());

    this._box2DBody.ApplyLinearImpulse(this.b2Vec2(Math.cos(angle)*length,
        -Math.sin(angle)*length), this._box2DBody.GetPosition());
};

gdjs.PhysicsRuntimeBehavior.prototype.applyForce = function( xCoordinate, yCoordinate )
{
    if ( this._box2DBody === null ) this.createBody();
    this._box2DBody.ApplyForce(this.b2Vec2(xCoordinate, -yCoordinate),
        this._box2DBody.GetPosition());
};

gdjs.PhysicsRuntimeBehavior.prototype.applyForceUsingPolarCoordinates = function( angle, length )
{
	angle = gdjs.toRad(angle);

    if ( this._box2DBody === null ) this.createBody();
    this._box2DBody.ApplyForce(this.b2Vec2(Math.cos(angle)*length,
        -Math.sin(angle)*length), this._box2DBody.GetPosition());
};

gdjs.PhysicsRuntimeBehavior.prototype.applyForceTowardPosition = function(xPosition, yPosition, length )
{
    if ( this._box2DBody === null ) this.createBody();

    var angle = Math.atan2(yPosition*this._sharedData.invScaleY+this._box2DBody.GetPosition().get_y(),
                        xPosition*this._sharedData.invScaleX-this._box2DBody.GetPosition().get_x());

    this._box2DBody.ApplyForce(this.b2Vec2(Math.cos(angle)*length,
        -Math.sin(angle)*length), this._box2DBody.GetPosition());
};

gdjs.PhysicsRuntimeBehavior.prototype.applyTorque = function( torque )
{
    if ( this._box2DBody === null ) this.createBody();

    this._box2DBody.ApplyTorque(torque);
};

gdjs.PhysicsRuntimeBehavior.prototype.setLinearVelocity = function( xVelocity, yVelocity )
{
    if ( this._box2DBody === null ) this.createBody();
    this._box2DBody.SetLinearVelocity(this.b2Vec2(xVelocity,-yVelocity));
};

gdjs.PhysicsRuntimeBehavior.prototype.setAngularVelocity = function( angularVelocity )
{
    if ( this._box2DBody === null ) this.createBody();
    this._box2DBody.SetAngularVelocity(angularVelocity);
};

gdjs.PhysicsRuntimeBehavior.prototype.setLinearDamping = function( linearDamping )
{
    if ( this._box2DBody === null ) this.createBody();
    this._box2DBody.SetLinearDamping(linearDamping);
};

gdjs.PhysicsRuntimeBehavior.prototype.setAngularDamping = function( angularDamping )
{
    if ( this._box2DBody === null ) this.createBody();
    this._box2DBody.SetAngularDamping(angularDamping);
};

gdjs.PhysicsRuntimeBehavior.prototype.addRevoluteJointBetweenObjects = function( object, scene, xPosRelativeToMassCenter, yPosRelativeToMassCenter )
{
    if ( this._box2DBody === null ) this.createBody();

    if ( object == null || !object.hasBehavior(this.name) ) return;
    var otherBody = object.getBehavior(this.name).getBox2DBody();

    if ( this._box2DBody == otherBody ) return;

    var jointDef = new Box2D.b2RevoluteJointDef();
    jointDef.Initialize(this._box2DBody,
                        otherBody,
                        this.b2Vec2(xPosRelativeToMassCenter*this._sharedData.invScaleX+this._box2DBody.GetWorldCenter().get_x(),
                                                     yPosRelativeToMassCenter*this._sharedData.invScaleY+this._box2DBody.GetWorldCenter().get_y()));
    this._sharedData.world.CreateJoint(jointDef);
};

gdjs.PhysicsRuntimeBehavior.prototype.addRevoluteJoint = function( xPosition, yPosition )
{
    if ( this._box2DBody === null ) this.createBody();

    var jointDef = new Box2D.b2RevoluteJointDef();
    jointDef.Initialize(this._box2DBody, this._sharedData.staticBody,
        this.b2Vec2( xPosition*this._sharedData.invScaleX, -yPosition*this._sharedData.invScaleY));

    this._sharedData.world.CreateJoint(jointDef);
};

gdjs.PhysicsRuntimeBehavior.prototype.setGravity = function( xGravity, yGravity )
{
    if ( this._box2DBody === null ) this.createBody();

    this._sharedData.world.SetGravity(this.b2Vec2(xGravity, -yGravity));
};

gdjs.PhysicsRuntimeBehavior.prototype.addGearJointBetweenObjects = function( object, ratio )
{
    if ( this._box2DBody === null ) this.createBody();

    if ( object == null || !object.hasBehavior(this.name) ) return;
    var otherBody = object.getBehavior(this.name).getBox2DBody();

    if ( this._box2DBody == otherBody ) return;

    //Gear joint need a revolute joint to the ground for the two objects
    var jointDef1 = new Box2D.b2RevoluteJointDef();
    jointDef1.Initialize(this._sharedData.world.GetGroundBody(), this._box2DBody,
        this._box2DBody.GetWorldCenter());

    var jointDef2 = new Box2D.b2RevoluteJointDef();
    jointDef2.Initialize(this._sharedData.world.GetGroundBody(), otherBody,
        otherBody.GetWorldCenter());

    var jointDef = new Box2D.b2GearJointDef();
    jointDef.set_bodyA(this._box2DBody);
    jointDef.set_bodyB(otherBody);
    jointDef.set_joint1(this._sharedData.world.CreateJoint(jointDef1));
    jointDef.set_joint2(this._sharedData.world.CreateJoint(jointDef2));
    jointDef.set_ratio(ratio * 3.14159);

    this._sharedData.world.CreateJoint(jointDef);
};

gdjs.PhysicsRuntimeBehavior.prototype.setLinearVelocityX = function( xVelocity )
{
    if ( this._box2DBody === null ) this.createBody();

    this._box2DBody.SetLinearVelocity(this.b2Vec2(xVelocity,
        this._box2DBody.GetLinearVelocity().get_y()));

};
gdjs.PhysicsRuntimeBehavior.prototype.setLinearVelocityY = function( yVelocity )
{
    if ( this._box2DBody === null ) this.createBody();

    this._box2DBody.SetLinearVelocity(this.b2Vec2(
        this._box2DBody.GetLinearVelocity().get_x(), -yVelocity));
};
gdjs.PhysicsRuntimeBehavior.prototype.getLinearVelocityX = function()
{
    if ( this._box2DBody === null ) this.createBody();

    return this._box2DBody.GetLinearVelocity().get_x();
};
gdjs.PhysicsRuntimeBehavior.prototype.getLinearVelocityY = function()
{
    if ( this._box2DBody === null ) this.createBody();

    return -this._box2DBody.GetLinearVelocity().get_y();
};

gdjs.PhysicsRuntimeBehavior.prototype.getLinearVelocity = function()
{
    if ( this._box2DBody === null ) this.createBody();

    return Math.sqrt(this._box2DBody.GetLinearVelocity().get_x()*this._box2DBody.GetLinearVelocity().get_x()
    	+this._box2DBody.GetLinearVelocity().get_y()*this._box2DBody.GetLinearVelocity().get_y());
};
gdjs.PhysicsRuntimeBehavior.prototype.getAngularVelocity = function()
{
    if ( this._box2DBody === null ) this.createBody();

    return this._box2DBody.GetAngularVelocity();
};
gdjs.PhysicsRuntimeBehavior.prototype.getLinearDamping = function()
{
    if ( this._box2DBody === null ) this.createBody();

    return this._box2DBody.GetLinearDamping();
};
gdjs.PhysicsRuntimeBehavior.prototype.getAngularDamping = function()
{
    if ( this._box2DBody === null ) this.createBody();

    return this._box2DBody.GetAngularDamping();
};

gdjs.PhysicsRuntimeBehavior.prototype.collisionWith = function( otherObjectsTable )
{
    if ( this._box2DBody === null ) this.createBody();

    //Getting a list of all objects which are tested
    var objects = gdjs.staticArray(gdjs.PhysicsRuntimeBehavior.prototype.collisionWith);
    objects.length = 0;

    var objectsLists = gdjs.staticArray2(gdjs.PhysicsRuntimeBehavior.prototype.collisionWith);
    otherObjectsTable.values(objectsLists);

    for(var i = 0, len = objectsLists.length;i<len;++i) {
        objects.push.apply(objects, objectsLists[i]);
    }

    //Test if an object of the list is in collision with our object.
    for(var i = 0, len = objects.length;i<len;++i) {
        for (var j = 0, lenj = this.currentContacts.length;j<lenj;++j) {
            if ( this.currentContacts[j].owner.id === objects[i].id )
                return true;
        }
    }

    return false;
};

gdjs.PhysicsRuntimeBehavior.prototype.isStatic = function() {
    return !this._dynamic;
};

gdjs.PhysicsRuntimeBehavior.prototype.isDynamic = function() {
    return this._dynamic;
};

/*
gdjs.PhysicsRuntimeBehavior.prototype.setPolygonCoords(const std::vector<sf::Vector2f> &vec)
{
    polygonCoords = vec;
}

const std::vector<sf::Vector2f>& PhysicsBehavior::GetPolygonCoords() const
{
    return polygonCoords;
}

bool PhysicsBehavior::HasAutomaticResizing() const
{
    return automaticResizing;
}

gdjs.PhysicsRuntimeBehavior.prototype.setAutomaticResizing(bool b)
{
    automaticResizing = b;
}

gdjs.PhysicsRuntimeBehavior.prototype.getPolygonScaleX() const
{
    if(automaticResizing)
        return object->GetWidth() / polygonWidth;
    else
        return polygonScaleX;
}

gdjs.PhysicsRuntimeBehavior.prototype.setPolygonScaleX(float scX, RuntimeScene &scene)
{
    polygonScaleX = scX;

    runtimeScenesPhysicsDatas->world->DestroyBody(body);
    CreateBody(scene);
}

gdjs.PhysicsRuntimeBehavior.prototype.getPolygonScaleY() const
{
    if(automaticResizing)
        return object->GetHeight() / polygonHeight;
    else
        return polygonScaleY;
}

gdjs.PhysicsRuntimeBehavior.prototype.setPolygonScaleY(float scY, RuntimeScene &scene)
{
    polygonScaleY = scY;

    runtimeScenesPhysicsDatas->world->DestroyBody(body);
    CreateBody(scene);
}*/
