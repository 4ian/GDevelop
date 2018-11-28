
gdjs.PhysikSharedData = function(runtimeScene, sharedData)
{
    this.gravityX = sharedData.content.gravityX;
    this.gravityY = sharedData.content.gravityY;
    this.scaleX = sharedData.content.scaleX === 0 ? 100 : sharedData.content.scaleX;
    this.scaleY = sharedData.content.scaleY === 0 ? 100 : sharedData.content.scaleY;

    this.invScaleX = 1 / this.scaleX;
    this.invScaleY = 1 / this.scaleY;
    this.timeStep = 1 / 60;
    this.frameTime = 0;
    this.stepped = false;
    this.world = new Box2D.b2World(new Box2D.b2Vec2(this.gravityX, this.gravityY), true);
    this.staticBody = this.world.CreateBody(new Box2D.b2BodyDef());

    // Contact listener to keep track of current collisions
    this.contactListener = new Box2D.JSContactListener();
    this.contactListener.BeginContact = function(contactPtr) {
        // Get the contact
        var contact = Box2D.wrapPointer(contactPtr, Box2D.b2Contact);
        // There is no body, return
        if (contact.GetFixtureA().GetBody() === null ||
            contact.GetFixtureB().GetBody() === null){
            return;
        }
        // Get associated behaviors
        var behaviorA = contact.GetFixtureA().GetBody().gdjsAssociatedBehavior;
        var behaviorB = contact.GetFixtureB().GetBody().gdjsAssociatedBehavior;
        // Let each behavior know about the contact against the other
        behaviorA.currentContacts.push(behaviorB);
        behaviorB.currentContacts.push(behaviorA);
    };

    this.contactListener.EndContact = function(contactPtr) {
        // Get the contact
        var contact = Box2D.wrapPointer(contactPtr, Box2D.b2Contact);
        // There is no body, return
        if (contact.GetFixtureA().GetBody() === null ||
            contact.GetFixtureB().GetBody() === null){
            return;
        }
        // Get associated behaviors
        var behaviorA = contact.GetFixtureA().GetBody().gdjsAssociatedBehavior;
        var behaviorB = contact.GetFixtureB().GetBody().gdjsAssociatedBehavior;
        // Remove each other contact
        var i = behaviorA.currentContacts.indexOf(behaviorB);
        if(i !== -1) behaviorA.currentContacts.remove(i);
        i = behaviorB.currentContacts.indexOf(behaviorA);
        if(i !== -1) behaviorB.currentContacts.remove(i);
    };

    this.contactListener.PreSolve = function() {};
    this.contactListener.PostSolve = function() {};

    this.world.SetContactListener(this.contactListener);

    this._nextJointId = 0;
    this.joints = {}; // (string)jointId -> (b2Joint)b2Joint
};

gdjs.PhysikSharedData.getSharedData = function(runtimeScene, behaviorName) {
    // Create one if needed
    if (!runtimeScene.physikSharedData) {
        var initialData = runtimeScene.getInitialSharedDataForBehavior(behaviorName);
        runtimeScene.physikSharedData = new gdjs.PhysikSharedData(runtimeScene, initialData);
    }

    return runtimeScene.physikSharedData;
};

gdjs.PhysikSharedData.prototype.step = function(deltaTime)
{
    this.frameTime += deltaTime;
    if(this.frameTime >= this.timeStep){
        var numberOfSteps = Math.floor(this.frameTime / this.timeStep);
        this.frameTime -= numberOfSteps * this.timeStep;

        if(numberOfSteps > 5) numberOfSteps = 5;

        for(var i=0; i<numberOfSteps; i++) {
            this.world.Step(this.timeStep, 8, 10);
        }
        this.world.ClearForces();
    }

    this.stepped = true;
};

gdjs.PhysikSharedData.gdjsCallbackRuntimeSceneUnloaded = function(runtimeScene) {
    if(runtimeScene.physikSharedData && runtimeScene.physikSharedData.world){
        Box2D.destroy(runtimeScene.physikSharedData.world);
    }
}

gdjs.PhysikSharedData.prototype.clearBodyJoints = function(body){
    // Iterate through all the joints
    for (var jointId in this.joints){
        if (this.joints.hasOwnProperty(jointId)){
            // If the joint is attached to the body, delete it
            if(this.joints[jointId].GetBodyA() === body || this.joints[jointId].GetBodyB() === body){
                // Destroy the joint is not absolutely necesary
                this.world.DestroyJoint(this.joints[jointId]);
                // Clear from the list
                delete this.joints[jointId];
            }
        }
    }
};

gdjs.PhysikSharedData.prototype.addJoint = function(joint){
    // Add the joint to the list
    this.joints[this._nextJointId.toString(10)] = joint;
    // Return the current joint id and then increase it
    return this._nextJointId++;
};

gdjs.PhysikSharedData.prototype.getJoint = function(jointId){
    // Cast to string
    jointId = jointId.toString(10);
    // Get the joint
    if(this.joints.hasOwnProperty(jointId)){
        return this.joints[jointId];
    }
    // Joint not found, return null
    return null;
};

gdjs.PhysikSharedData.prototype.removeJoint = function(jointId){
    // Cast to string
    jointId = jointId.toString(10);
    // Delete the joint
    if(this.joints.hasOwnProperty(jointId)){
        this.world.DestroyJoint(this.joints[jointId]);
        delete this.joints[jointId];
    }
};


gdjs.PhysikRuntimeBehavior = function(runtimeScene, behaviorData, owner)
{
    gdjs.RuntimeBehavior.call(this, runtimeScene, behaviorData, owner);

    this.type = behaviorData.content.type;
    this.bullet = behaviorData.content.bullet;
    this.fixedRotation = behaviorData.content.fixedRotation;
    this.shape = behaviorData.content.shape;
    this.shapeDimensionA = behaviorData.content.shapeDimensionA;
    this.shapeDimensionB = behaviorData.content.shapeDimensionB;
    this.shapeOffsetX = behaviorData.content.shapeOffsetX;
    this.shapeOffsetY = behaviorData.content.shapeOffsetY;
    this.density = behaviorData.content.density;
    this.friction = behaviorData.content.friction;
    this.restitution = behaviorData.content.restitution;
    this.linearDamping = behaviorData.content.linearDamping;
    this.angularDamping = behaviorData.content.angularDamping;
    this.gravityScale = behaviorData.content.gravityScale;
    this.layers = behaviorData.content.layers;
    this.masks = behaviorData.content.masks;
    this.currentContacts = this.currentContacts || [];
    this.currentContacts.length = 0;

    this._body = null;
    this._sharedData = gdjs.PhysikSharedData.getSharedData(runtimeScene, behaviorData.name);
    this._tempb2Vec2 = new Box2D.b2Vec2(); // Avoid creating new vectors all the time
    this._tempb2Vec2Sec = new Box2D.b2Vec2(); // Sometimes two vectors are needed on the same function call
    this._objectOldX = 0;
    this._objectOldY = 0;
    this._objectOldAngle = 0;
    this._objectOldWidth = 0;
    this._objectOldHeight = 0;
};

gdjs.PhysikRuntimeBehavior.prototype = Object.create( gdjs.RuntimeBehavior.prototype );
gdjs.PhysikRuntimeBehavior.thisIsARuntimeBehaviorConstructor = "Physik::PhysikBehavior";

gdjs.PhysikRuntimeBehavior.prototype.b2Vec2 = function(x, y) {
    this._tempb2Vec2.set_x(x);
    this._tempb2Vec2.set_y(y);
    return this._tempb2Vec2;
};

gdjs.PhysikRuntimeBehavior.prototype.b2Vec2Sec = function(x, y) {
    this._tempb2Vec2Sec.set_x(x);
    this._tempb2Vec2Sec.set_y(y);
    return this._tempb2Vec2Sec;
};

gdjs.PhysikRuntimeBehavior.prototype.onDeActivate = function() {
    if (this._body !== null){
        // When a body is deleted, Box2D removes automatically its joints, leaving an invalid pointer in our joints list
        this._sharedData.clearBodyJoints(this._body);
        // Delete the body
        this._sharedData.world.DestroyBody(this._body);
        this._body = null;
    }
};

gdjs.PhysikRuntimeBehavior.prototype.ownerRemovedFromScene = function() {
    this.onDeActivate();
};

gdjs.PhysikRuntimeBehavior.prototype.getBody = function() {
    // If there is no body, set a new one
    if (this._body === null) this.createBody();

    return this._body;
};

gdjs.PhysikRuntimeBehavior.prototype.createBody = function() {
    // Generate the shape
    var shape;
    if(this.shape === "Circle"){
        shape = new Box2D.b2CircleShape();
        var radius = this.shapeDimensionA * (this._sharedData.invScaleX + this._sharedData.invScaleY) / 2;
        if(!this.shapeDimensionA){
            radius = (this.owner.getWidth() * this._sharedData.invScaleX +
                      this.owner.getHeight() * this._sharedData.invScaleY) / 4;
        }
        shape.set_m_radius(radius > 0 ? radius : 1);
    }
    else if(this.shape === "Polygon"){
        // Needs a vertices editor
    }
    else if(this.shape === "Edge"){
        shape = new Box2D.b2EdgeShape();
        var length = (this.shapeDimensionA > 0 ? this.shapeDimensionA :
                        this.owner.getWidth() > 0 ? this.owner.getWidth() : 1) * this._sharedData.invScaleX;
        var angle = this.shapeDimensionB ? gdjs.toRad(this.shapeDimensionB) : 0;
        shape.Set(this.b2Vec2(-length/2 * Math.cos(angle), length/2 * Math.sin(angle)),
                  this.b2Vec2Sec(length/2 * Math.cos(angle),-length/2 * Math.sin(angle)));
    }
    else{ // Box
        shape = new Box2D.b2PolygonShape();
        var width = (this.shapeDimensionA > 0 ? this.shapeDimensionA :
                        this.owner.getWidth() > 0 ? this.owner.getWidth() : 1) * this._sharedData.invScaleX;
        var height = (this.shapeDimensionB > 0 ? this.shapeDimensionB :
                        this.owner.getHeight() > 0 ? this.owner.getHeight() : 1) * this._sharedData.invScaleY;
        shape.SetAsBox(width/2, height/2);
    }

    // Generate filter data
    var filter = new Box2D.b2Filter();
    filter.set_categoryBits(this.layers);
    filter.set_maskBits(this.masks);

    // Generate the fixture definition
    var fixDef = new Box2D.b2FixtureDef();

    // Set fixture settings
    fixDef.set_shape(shape);
    fixDef.set_filter(filter);
    fixDef.set_density(this.density >= 0 ? this.density : 0);
    fixDef.set_friction(this.friction >= 0 ? this.friction : 0);
    fixDef.set_restitution(this.restitution >= 0 ? this.restitution : 0);

    // Generate the body definition
    var bodyDef = new Box2D.b2BodyDef();

    // Set the initial body transformation from the GD object
    bodyDef.set_position(this.b2Vec2(
         (this.owner.getDrawableX() + this.owner.getWidth()/2 + this.shapeOffsetX) * this._sharedData.invScaleX,
         (this.owner.getDrawableY() + this.owner.getHeight()/2 + this.shapeOffsetY) * this._sharedData.invScaleY));
    bodyDef.set_angle(gdjs.toRad(this.owner.getAngle()));
    
    // Set body settings
    bodyDef.set_type(this.type === "Static" ? Box2D.b2_staticBody :
                     this.type === "Kinematic" ? Box2D.b2_kinematicBody :
                     Box2D.b2_dynamicBody);
    bodyDef.set_bullet(this.bullet);
    bodyDef.set_fixedRotation(this.fixedRotation);
    bodyDef.set_linearDamping(this.linearDamping);
    bodyDef.set_angularDamping(this.angularDamping);
    bodyDef.set_gravityScale(this.gravityScale);

    // Create the body
    this._body = this._sharedData.world.CreateBody(bodyDef);
    this._body.CreateFixture(fixDef);
    this._body.gdjsAssociatedBehavior = this;

    // Update cached size
    this._objectOldWidth = this.owner.getWidth();
    this._objectOldHeight = this.owner.getHeight();
};

gdjs.PhysikRuntimeBehavior.prototype.doStepPreEvents = function(runtimeScene) {
    // Create a body if there is not one
    if(this._body === null){
        this.createBody();
    }

    // Step the world if not done this frame yet
    if(!this._sharedData.stepped){
        this._sharedData.step(runtimeScene.getTimeManager().getElapsedTime() / 1000.0);
    }

    // Copy transform from body to the GD object
    this.owner.setX(this._body.GetPosition().get_x()*this._sharedData.scaleX -
        this.owner.getWidth()/2 + this.owner.getX() - this.owner.getDrawableX() - this.shapeOffsetX);
    this.owner.setY(this._body.GetPosition().get_y()*this._sharedData.scaleY -
        this.owner.getHeight()/2 + this.owner.getY() - this.owner.getDrawableY() - this.shapeOffsetY);
    this.owner.setAngle(gdjs.toDegrees(this._body.GetAngle()));

    // Update cached transform
    this._objectOldX = this.owner.getX();
    this._objectOldY = this.owner.getY();
    this._objectOldAngle = this.owner.getAngle();
};

gdjs.PhysikRuntimeBehavior.prototype.doStepPostEvents = function(runtimeScene) {
    // If there is no body, set a new one
    if (this._body === null) this.createBody();

    // GD object size has changed, recreate body
    if (this._objectOldWidth !== this.owner.getWidth() ||
        this._objectOldHeight !== this.owner.getHeight()){

        var oldAngularVelocity = this._body.GetAngularVelocity();
        var oldXVelocity = this._body.GetLinearVelocity().get_x();
        var oldYVelocity = this._body.GetLinearVelocity().get_y();

        this._sharedData.world.DestroyBody(this._body);
        this.createBody();

        this._body.SetAngularVelocity(oldAngularVelocity);
        this._body.SetLinearVelocity(this.b2Vec2(oldXVelocity, oldYVelocity));
    }

    // GD object transform has changed, update body transform
    if (this._objectOldX !== this.owner.getX() ||
        this._objectOldY !== this.owner.getY() ||
        this._objectOldAngle !== this.owner.getAngle()){

        var pos = this.b2Vec2(
             (this.owner.getDrawableX() + this.owner.getWidth()/2) * this._sharedData.invScaleX,
             (this.owner.getDrawableY() + this.owner.getHeight()/2) * this._sharedData.invScaleY);
        this._body.SetTransform(pos, gdjs.toRad(this.owner.getAngle()));
        this._body.SetAwake(true);
    }

    // Reset world step to update next frame
    this._sharedData.stepped = false;
};

gdjs.PhysikRuntimeBehavior.prototype.getGravityX = function(){
    return this._sharedData.gravityX;
};

gdjs.PhysikRuntimeBehavior.prototype.getGravityY = function(){
    return this._sharedData.gravityY;
};

gdjs.PhysikRuntimeBehavior.prototype.setGravity = function(x, y){
    // Check if there is no modification
    if(this._sharedData.gravityX === x && this._sharedData.gravityY === y) return;
    // Change the gravity
    this._sharedData.gravityX = x;
    this._sharedData.gravityY = y;
    this._sharedData.world.SetGravity(this.b2Vec2(x, y));
};

gdjs.PhysikRuntimeBehavior.prototype.isDynamic = function(){
    return this.type === "Dynamic";
};

gdjs.PhysikRuntimeBehavior.prototype.setDynamic = function(){
    // Check if there is no modification
    if(this.type === "Dynamic") return;
    // Change body type
    this.type = "Dynamic";
    // If there is no body, set a new one
    if(this._body === null){
        this.createBody();
        return;
    }
    // Update body type
    this._body.SetType(Box2D.b2_dynamicBody);
    this._body.SetAwake(true);
};

gdjs.PhysikRuntimeBehavior.prototype.isStatic = function(){
    return this.type === "Static";
};

gdjs.PhysikRuntimeBehavior.prototype.setStatic = function(){
    // Check if there is no modification
    if(this.type === "Static") return;
    // Change body type
    this.type = "Static";
    // If there is no body, set a new one
    if(this._body === null){
        this.createBody();
        return;
    }
    // Update body type
    this._body.SetType(Box2D.b2_staticBody);
    this._body.SetAwake(true);
};

gdjs.PhysikRuntimeBehavior.prototype.isKinematic = function(){
    return this.type === "Kinematic";
};

gdjs.PhysikRuntimeBehavior.prototype.setKinematic = function(){
    // Check if there is no modification
    if(this.type === "Kinematic") return;
    // Change body type
    this.type = "Kinematic";
    // If there is no body, set a new one
    if(this._body === null){
        this.createBody();
        return;
    }
    // Update body type
    this._body.SetType(Box2D.b2_kinematicBody);
    this._body.SetAwake(true);
};

gdjs.PhysikRuntimeBehavior.prototype.isBullet = function(){
    return this.bullet;
};

gdjs.PhysikRuntimeBehavior.prototype.setBullet = function(enable){
    // Check if there is no modification
    if(this.bullet === enable) return;
    // Change bullet flag
    this.bullet = enable;
    // If there is no body, set a new one
    if(this._body === null){
        this.createBody();
        return;
    }
    // Update body bullet flag
    this._body.SetBullet(this.bullet);
};

gdjs.PhysikRuntimeBehavior.prototype.hasFixedRotation = function(){
    return this.fixedRotation;
};

gdjs.PhysikRuntimeBehavior.prototype.setFixedRotation = function(enable){
    this.fixedRotation = enable;

    if(this._body === null) this.createBody();
    this._body.SetFixedRotation(this.fixedRotation);
};

gdjs.PhysikRuntimeBehavior.prototype.getDensity = function(){
    return this.density;
};

gdjs.PhysikRuntimeBehavior.prototype.setDensity = function(density){
    // Non-negative values only
    if(density < 0) density = 0;
    // Check if there is no modification
    if(this.density === density) return;
    // Change density
    this.density = density;
    // If there is no body, set a new one
    if(this._body === null){
        this.createBody();
        return;
    }
    // Update the body density
    this._body.GetFixtureList().SetDensity(this.density);
    this._body.ResetMassData();
};

gdjs.PhysikRuntimeBehavior.prototype.getFriction = function(){
    return this.friction;
};

gdjs.PhysikRuntimeBehavior.prototype.setFriction = function(friction){
    // Non-negative values only
    if(friction < 0) friction = 0;
    // Check if there is no modification
    if(this.friction === friction) return;
    // Change friction
    this.friction = friction;
    // If there is no body, set a new one
    if(this._body === null){
        this.createBody();
        return;
    }
    // Update the body friction
    this._body.GetFixtureList().SetFriction(this.friction);
    // Update contacts
    var contact = this._body.GetContactList();
    while(Box2D.getPointer(contact)){
        contact.get_contact().ResetFriction();
        contact = contact.get_next();
    }
};

gdjs.PhysikRuntimeBehavior.prototype.getRestitution = function(){
    return this.restitution;
};

gdjs.PhysikRuntimeBehavior.prototype.setRestitution = function(restitution){
    // Non-negative values only
    if(restitution < 0) restitution = 0;
    // Check if there is no modification
    if(this.restitution === restitution) return;
    // Change restitution
    this.restitution = restitution;
    // If there is no body, set a new one
    if(this._body === null){
        this.createBody();
        return;
    }
    // Update the body restitution
    this._body.GetFixtureList().SetRestitution(this.restitution);
    // Update contacts
    var contact = this._body.GetContactList();
    while(Box2D.getPointer(contact)){
        contact.get_contact().ResetRestitution();
        contact = contact.get_next();
    }
};

gdjs.PhysikRuntimeBehavior.prototype.getLinearDamping = function(){
    return this.linearDamping;
};

gdjs.PhysikRuntimeBehavior.prototype.setLinearDamping = function(linearDamping){
    // Check if there is no modification
    if(this.linearDamping === linearDamping) return;
    // Change linearDamping
    this.linearDamping = linearDamping;
    // If there is no body, set a new one
    if(this._body === null){
        this.createBody();
        return;
    }
    // Update the body linear damping
    this._body.SetLinearDamping(this.linearDamping);
};

gdjs.PhysikRuntimeBehavior.prototype.getAngularDamping = function(){
    return this.angularDamping;
};

gdjs.PhysikRuntimeBehavior.prototype.setAngularDamping = function(angularDamping){
    // Check if there is no modification
    if(this.angularDamping === angularDamping) return;
    // Change angularDamping
    this.angularDamping = angularDamping;
    // If there is no body, set a new one
    if(this._body === null){
        this.createBody();
        return;
    }
    // Update the body angular damping
    this._body.SetAngularDamping(this.angularDamping);
};

gdjs.PhysikRuntimeBehavior.prototype.getGravityScale = function(){
    return this.gravityScale;
};

gdjs.PhysikRuntimeBehavior.prototype.setGravityScale = function(gravityScale){
    // Check if there is no modification
    if(this.gravityScale === gravityScale) return;
    // Change the gravity scale
    this.gravityScale = gravityScale;
    // If there is no body, set a new one
    if(this._body === null){
        this.createBody();
        return;
    }
    // Update the body gravity scale
    this._body.SetGravityScale(this.gravityScale);
};

gdjs.PhysikRuntimeBehavior.prototype.layerEnabled = function(layer){
    // Layer must be an integer
    layer = Math.floor(layer);
    // Layer must be in range [1, 16]
    if(layer < 1 || layer > 16 ) return;

    return !!(this.layers & (1 << (layer - 1)));
};

gdjs.PhysikRuntimeBehavior.prototype.enableLayer = function(layer, enable){
    // Layer must be an integer
    layer = Math.floor(layer);
    // Layer must be in range [1, 16]
    if(layer < 1 || layer > 16 ) return;
    // Change the layers
    if(enable){
        this.layers |= (1 << (layer - 1));
    }
    else{
        this.layers &= ~(1 << (layer - 1));
    }
    // If there is no body, set a new one
    if(this._body === null){
        this.createBody();
        return;
    }
    // Update the body layers
    var filter = this._body.GetFixtureList().GetFilterData();
    filter.set_categoryBits(this.layers);
    this._body.GetFixtureList().SetFilterData(filter);
};

gdjs.PhysikRuntimeBehavior.prototype.maskEnabled = function(mask){
    // Mask must be an integer
    mask = Math.floor(mask);
    // Mask must be in range [1, 16]
    if(mask < 1 || mask > 16 ) return;

    return !!(this.masks & (1 << (mask - 1)));
};

gdjs.PhysikRuntimeBehavior.prototype.enableMask = function(mask, enable){
    // Mask must be an integer
    mask = Math.floor(mask);
    // Mask must be in range [1, 16]
    if(mask < 1 || mask > 16 ) return;
    // Change the masks
    if(enable){
        this.masks |= (1 << (mask - 1));
    }
    else{
        this.masks &= ~(1 << (mask - 1));
    }
    // If there is no body, set a new one
    if(this._body === null){
        this.createBody();
        return;
    }
    // Update the body masks
    var filter = this._body.GetFixtureList().GetFilterData();
    filter.set_maskBits(this.masks);
    this._body.GetFixtureList().SetFilterData(filter);
};

gdjs.PhysikRuntimeBehavior.prototype.getLinearVelocityX = function(){
    // If there is no body, set a new one
    if(this._body === null){
        this.createBody();
        return;
    }
    // Get the linear velocity on X
    return this._body.GetLinearVelocity().get_x() * this._sharedData.scaleX;
};

gdjs.PhysikRuntimeBehavior.prototype.setLinearVelocityX = function(linearVelocityX){
    // If there is no body, set a new one
    if(this._body === null){
        this.createBody();
        return;
    }
    // Set the linear velocity on X
    this._body.SetLinearVelocity(this.b2Vec2(linearVelocityX * this._sharedData.invScaleX, this._body.GetLinearVelocity().get_y()));
};

gdjs.PhysikRuntimeBehavior.prototype.getLinearVelocityY = function(){
    // If there is no body, set a new one
    if(this._body === null){
        this.createBody();
        return;
    }
    // Get the linear velocity on Y
    return this._body.GetLinearVelocity().get_y() * this._sharedData.scaleY;
};

gdjs.PhysikRuntimeBehavior.prototype.setLinearVelocityY = function(linearVelocityY){
    // If there is no body, set a new one
    if(this._body === null){
        this.createBody();
        return;
    }
    // Set the linear velocity on Y
    this._body.SetLinearVelocity(this.b2Vec2(this._body.GetLinearVelocity().get_x(), linearVelocityY * this._sharedData.invScaleY));
};

gdjs.PhysikRuntimeBehavior.prototype.getLinearVelocityLength = function(){
    // If there is no body, set a new one
    if(this._body === null){
        this.createBody();
        return;
    }
    // Get the linear velocity length
    return this.b2Vec2(this._body.GetLinearVelocity().get_x() * this._sharedData.scaleX,
                       this._body.GetLinearVelocity().get_y() * this._sharedData.scaleY).Length();
};

gdjs.PhysikRuntimeBehavior.prototype.getAngularVelocity = function(){
    // If there is no body, set a new one
    if(this._body === null){
        this.createBody();
        return;
    }
    // Get the angular velocity
    return gdjs.toDegrees(this._body.GetAngularVelocity());
};

gdjs.PhysikRuntimeBehavior.prototype.setAngularVelocity = function(angularVelocity){
    // If there is no body, set a new one
    if(this._body === null){
        this.createBody();
        return;
    }
    // Set the angular velocity
    this._body.SetAngularVelocity(gdjs.toRad(angularVelocity));
};

gdjs.PhysikRuntimeBehavior.prototype.applyForce = function(forceX, forceY, positionX, positionY){
    // If there is no body, set a new one
    if(this._body === null){
        this.createBody();
        return;
    }
    // Wake up the object
    this._body.SetAwake(true);
    // Apply the force
    this._body.ApplyForce(this.b2Vec2(forceX, forceY),
                          this.b2Vec2Sec(positionX * this._sharedData.invScaleX, positionY * this._sharedData.invScaleY));
};

gdjs.PhysikRuntimeBehavior.prototype.applyPolarForce = function(angle, length, positionX, positionY){
    // If there is no body, set a new one
    if(this._body === null){
        this.createBody();
        return;
    }
    // Wake up the object
    this._body.SetAwake(true);
    // Apply the force
    angle = gdjs.toRad(angle);
    this._body.ApplyForce(this.b2Vec2(length * Math.cos(angle), length * Math.sin(angle)),
                          this.b2Vec2Sec(positionX * this._sharedData.invScaleX, positionY * this._sharedData.invScaleY));
};

gdjs.PhysikRuntimeBehavior.prototype.applyForceTowardPosition = function(length, towardX, towardY, positionX, positionY){
    // If there is no body, set a new one
    if(this._body === null){
        this.createBody();
        return;
    }
    // Wake up the object
    this._body.SetAwake(true);
    // Apply the force
    var angle = Math.atan2(towardY * this._sharedData.invScaleY - this._body.GetPosition().get_y(),
                           towardX * this._sharedData.invScaleX - this._body.GetPosition().get_x());
    this._body.ApplyForce(this.b2Vec2(length * Math.cos(angle), length * Math.sin(angle)),
                          this.b2Vec2Sec(positionX * this._sharedData.invScaleX, positionY * this._sharedData.invScaleY));
};

gdjs.PhysikRuntimeBehavior.prototype.applyImpulse = function(impulseX, impulseY, positionX, positionY){
    // If there is no body, set a new one
    if(this._body === null){
        this.createBody();
        return;
    }
    // Wake up the object
    this._body.SetAwake(true);
    // Apply the impulse
    this._body.ApplyLinearImpulse(this.b2Vec2(forceX, forceY),
                                  this.b2Vec2Sec(positionX * this._sharedData.invScaleX, positionY * this._sharedData.invScaleY));
};

gdjs.PhysikRuntimeBehavior.prototype.applyPolarImpulse = function(angle, length, positionX, positionY){
    // If there is no body, set a new one
    if(this._body === null){
        this.createBody();
        return;
    }
    // Wake up the object
    this._body.SetAwake(true);
    // Apply the impulse
    angle = gdjs.toRad(angle);
    this._body.ApplyLinearImpulse(this.b2Vec2(length * Math.cos(angle), length * Math.sin(angle)),
                                  this.b2Vec2Sec(positionX * this._sharedData.invScaleX, positionY * this._sharedData.invScaleY));
};

gdjs.PhysikRuntimeBehavior.prototype.applyImpulseTowardPosition = function(length, towardX, towardY, positionX, positionY){
    // If there is no body, set a new one
    if(this._body === null){
        this.createBody();
        return;
    }
    // Wake up the object
    this._body.SetAwake(true);
    // Apply the impulse
    var angle = Math.atan2(towardY * this._sharedData.invScaleY - this._body.GetPosition().get_y(),
                           towardX * this._sharedData.invScaleX - this._body.GetPosition().get_x());
    this._body.ApplyLinearImpulse(this.b2Vec2(length * Math.cos(angle), length * Math.sin(angle)),
                                  this.b2Vec2Sec(positionX * this._sharedData.invScaleX, positionY * this._sharedData.invScaleY));
};

gdjs.PhysikRuntimeBehavior.prototype.applyTorque = function(torque){
    // If there is no body, set a new one
    if(this._body === null){
        this.createBody();
        return;
    }
    // Wake up the object
    this._body.SetAwake(true);
    // Apply the torque
    this._body.ApplyTorque(torque);
};

gdjs.PhysikRuntimeBehavior.prototype.applyAngularImpulse = function(angularImpulse){
    // If there is no body, set a new one
    if(this._body === null){
        this.createBody();
        return;
    }
    // Wake up the object
    this._body.SetAwake(true);
    // Apply the angular impulse
    this._body.ApplyAngularImpulse(angularImpulse);
};

gdjs.PhysikRuntimeBehavior.prototype.addDistanceJoint = function(x1, y1, other, x2, y2, length, frequency, dampingRatio, collideConnected, variable){
    // If there is no body, set a new one
    if(this._body === null){
        this.createBody();
        return;
    }
    // If there is no second object or it doesn't share the behavior, return
    if(other == null || !other.hasBehavior(this.name)) return;
    // Get the second body
    var otherBody = other.getBehavior(this.name).getBody();
    // If the first and second objects/bodies are the same, return
    if(this._body == otherBody) return;
    // Set joint settings
    var jointDef = new Box2D.b2DistanceJointDef();
    jointDef.set_bodyA(this._body);
    jointDef.set_localAnchorA(this._body.GetLocalPoint(this.b2Vec2(x1 * this._sharedData.invScaleX, y1 * this._sharedData.invScaleY)));
    jointDef.set_bodyB(otherBody);
    jointDef.set_localAnchorB(otherBody.GetLocalPoint(this.b2Vec2(x2 * this._sharedData.invScaleX, y2 * this._sharedData.invScaleY)));
    if(length > 0){
        length = length * this._sharedData.invScaleX;
    }
    else{
        length = this.b2Vec2((x2 - x1) * this._sharedData.invScaleX, (y2 - y1) * this._sharedData.invScaleY).Length();
    }
    jointDef.set_length(length);
    jointDef.set_frequencyHz(frequency);
    jointDef.set_dampingRatio(dampingRatio);
    jointDef.set_collideConnected(collideConnected);
    // Create the joint and get the id
    var jointId = this._sharedData.addJoint(Box2D.castObject(this._sharedData.world.CreateJoint(jointDef), Box2D.b2DistanceJoint));
    // Store the id in the variable
    variable.setNumber(jointId);
};

gdjs.PhysikRuntimeBehavior.prototype.addRevoluteJoint = function(x, y, enableLimit, referenceAngle, lowerAngle, upperAngle, enableMotor, motorSpeed, maxMotorTorque, variable){
    // If there is no body, set a new one
    if(this._body === null){
        this.createBody();
        return;
    }
    // Set joint settings
    var jointDef = new Box2D.b2RevoluteJointDef();
    jointDef.set_bodyA(this._body);
    jointDef.set_localAnchorA(this._body.GetLocalPoint(this.b2Vec2(x * this._sharedData.invScaleX, y * this._sharedData.invScaleY)));
    jointDef.set_bodyB(this._sharedData.staticBody);
    jointDef.set_localAnchorB(this._sharedData.staticBody.GetLocalPoint(this.b2Vec2(x * this._sharedData.invScaleX, y * this._sharedData.invScaleY)));
    jointDef.set_enableLimit(enableLimit);
    if(enableLimit){
        jointDef.set_referenceAngle(gdjs.toRad(referenceAngle));
        jointDef.set_lowerAngle(gdjs.toRad(lowerAngle));
        jointDef.set_upperAngle(gdjs.toRad(upperAngle));
    }
    jointDef.set_enableMotor(enableMotor);
    if(enableMotor){
        jointDef.set_motorSpeed(motorSpeed);
        jointDef.set_maxMotorTorque(maxMotorTorque);
    }
    jointDef.set_collideConnected(false);
    // Create the joint and get the id
    var jointId = this._sharedData.addJoint(Box2D.castObject(this._sharedData.world.CreateJoint(jointDef), Box2D.b2RevoluteJoint));
    // Store the id in the variable
    variable.setNumber(jointId);
};

gdjs.PhysikRuntimeBehavior.prototype.addRevoluteJointBetweenTwoBodies = function(x1, y1, other, x2, y2, enableLimit, referenceAngle, lowerAngle, upperAngle, enableMotor, motorSpeed, maxMotorTorque, collideConnected, variable){
    // If there is no body, set a new one
    if(this._body === null){
        this.createBody();
        return;
    }
    // If there is no second object or it doesn't share the behavior, return
    if(other == null || !other.hasBehavior(this.name)) return;
    // Get the second body
    var otherBody = other.getBehavior(this.name).getBody();
    // If the first and second objects/bodies are the same, return
    if(this._body == otherBody) return;
    // Set joint settings
    var jointDef = new Box2D.b2RevoluteJointDef();
    jointDef.set_bodyA(this._body);
    jointDef.set_localAnchorA(this._body.GetLocalPoint(this.b2Vec2(x1 * this._sharedData.invScaleX, y1 * this._sharedData.invScaleY)));
    jointDef.set_bodyB(otherBody);
    jointDef.set_localAnchorB(otherBody.GetLocalPoint(this.b2Vec2(x2 * this._sharedData.invScaleX, y2 * this._sharedData.invScaleY)));
    jointDef.set_enableLimit(enableLimit);
    if(enableLimit){
        jointDef.set_referenceAngle(gdjs.toRad(referenceAngle));
        jointDef.set_lowerAngle(gdjs.toRad(lowerAngle));
        jointDef.set_upperAngle(gdjs.toRad(upperAngle));
    }
    jointDef.set_enableMotor(enableMotor);
    if(enableMotor){
        jointDef.set_motorSpeed(motorSpeed);
        jointDef.set_maxMotorTorque(maxMotorTorque);
    }
    jointDef.set_collideConnected(collideConnected);
    // Create the joint and get the id
    var jointId = this._sharedData.addJoint(Box2D.castObject(this._sharedData.world.CreateJoint(jointDef), Box2D.b2RevoluteJoint));
    // Store the id in the variable
    variable.setNumber(jointId);
};

gdjs.PhysikRuntimeBehavior.prototype.addPrismaticJoint = function(x1, y1, other, x2, y2, axisAngle, referenceAngle, enableLimit, lowerTranslation, upperTranslation, enableMotor, motorSpeed, maxMotorForce, collideConnected, variable){
    // If there is no body, set a new one
    if(this._body === null){
        this.createBody();
        return;
    }
    // If there is no second object or it doesn't share the behavior, return
    if(other == null || !other.hasBehavior(this.name)) return;
    // Get the second body
    var otherBody = other.getBehavior(this.name).getBody();
    // If the first and second objects/bodies are the same, return
    if(this._body == otherBody) return;
    // Set joint settings
    var jointDef = new Box2D.b2PrismaticJointDef();
    jointDef.set_bodyA(this._body);
    jointDef.set_localAnchorA(this._body.GetLocalPoint(this.b2Vec2(x1 * this._sharedData.invScaleX, y1 * this._sharedData.invScaleY)));
    jointDef.set_bodyB(otherBody);
    jointDef.set_localAnchorB(otherBody.GetLocalPoint(this.b2Vec2(x2 * this._sharedData.invScaleX, y2 * this._sharedData.invScaleY)));
    axisAngle = gdjs.toRad(axisAngle) - this._body.GetAngle();
    jointDef.set_localAxisA(this.b2Vec2(Math.cos(axisAngle), Math.sin(axisAngle)));
    jointDef.set_referenceAngle(gdjs.toRad(referenceAngle));
    jointDef.set_enableLimit(enableLimit);
    if(enableLimit){
        lowerTranslation *= this._sharedData.invScaleX;
        upperTranslation *= this._sharedData.invScaleX;
        if(upperTranslation < lowerTranslation){
            var temp = lowerTranslation;
            lowerTranslation = upperTranslation;
            upperTranslation = temp;
        }
        // The translation range must include zero
        if(lowerTranslation > 0) lowerTranslation = 0;
        jointDef.set_lowerTranslation(lowerTranslation);
        jointDef.set_upperTranslation(upperTranslation);
    }
    jointDef.set_enableMotor(enableMotor);
    if(enableMotor){
        jointDef.set_motorSpeed(motorSpeed);
        jointDef.set_maxMotorForce(maxMotorForce);
    }
    jointDef.set_collideConnected(collideConnected);
    // Create the joint and get the id
    var jointId = this._sharedData.addJoint(Box2D.castObject(this._sharedData.world.CreateJoint(jointDef), Box2D.b2PrismaticJoint));
    // Store the id in the variable
    variable.setNumber(jointId);
};

gdjs.PhysikRuntimeBehavior.prototype.getPrismaticJointMotorSpeed = function(jointId){
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_prismaticJoint) return 0;
    // Set the motor speed
    return joint.GetMotorSpeed();
};

gdjs.PhysikRuntimeBehavior.prototype.setPrismaticJointMotorSpeed = function(jointId, motorSpeed){
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_prismaticJoint) return;
    // Set the motor speed
    joint.SetMotorSpeed(motorSpeed);
};

gdjs.PhysikRuntimeBehavior.prototype.addPulleyJoint = function(x1, y1, other, x2, y2, groundX1, groundY1, groundX2, groundY2, lengthA, lengthB, ratio, collideConnected, variable){
    // If there is no body, set a new one
    if(this._body === null){
        this.createBody();
        return;
    }
    // If there is no second object or it doesn't share the behavior, return
    if(other == null || !other.hasBehavior(this.name)) return;
    // Get the second body
    var otherBody = other.getBehavior(this.name).getBody();
    // If the first and second objects/bodies are the same, return
    if(this._body == otherBody) return;
    // Set joint settings
    var jointDef = new Box2D.b2PulleyJointDef();
    jointDef.set_bodyA(this._body);
    jointDef.set_localAnchorA(this._body.GetLocalPoint(this.b2Vec2(x1 * this._sharedData.invScaleX, y1 * this._sharedData.invScaleY)));
    jointDef.set_bodyB(otherBody);
    jointDef.set_localAnchorB(otherBody.GetLocalPoint(this.b2Vec2(x2 * this._sharedData.invScaleX, y2 * this._sharedData.invScaleY)));
    jointDef.set_groundAnchorA(this.b2Vec2(groundX1 * this._sharedData.invScaleX, groundY1 * this._sharedData.invScaleX));
    jointDef.set_groundAnchorB(this.b2Vec2(groundX2 * this._sharedData.invScaleX, groundY2 * this._sharedData.invScaleX));
    jointDef.set_lengthA(lengthA > 0 ? lengthA * this._sharedData.invScaleX :
                            this.b2Vec2((groundX1 - x1) * this._sharedData.invScaleX, (groundY1 - y1) * this._sharedData.invScaleX).Length());
    jointDef.set_lengthB(lengthB > 0 ? lengthB * this._sharedData.invScaleX :
                            this.b2Vec2((groundX2 - x2) * this._sharedData.invScaleX, (groundY2 - y2) * this._sharedData.invScaleX).Length());
    jointDef.set_ratio(ratio > 0 ? ratio : 1);
    jointDef.set_collideConnected(collideConnected);
    // Create the joint and get the id
    var jointId = this._sharedData.addJoint(Box2D.castObject(this._sharedData.world.CreateJoint(jointDef), Box2D.b2PrismaticJoint));
    // Store the id in the variable
    variable.setNumber(jointId);
};
