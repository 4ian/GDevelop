
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

    this._nextJointId = 1; // Start with 1 so the user is safe from default variables value (0)
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
    for(var jointId in this.joints){
        if (this.joints.hasOwnProperty(jointId)){
            // If the joint is attached to the body, delete it
            if(this.joints[jointId].GetBodyA() === body || this.joints[jointId].GetBodyB() === body){
                this.removeJoint(jointId);
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

gdjs.PhysikSharedData.prototype.getJointId = function(joint){
    // Search the joint in the list and return the ID
    for(var jointId in this.joints){
        if (this.joints.hasOwnProperty(jointId)){
            if(this.joints[jointId] === joint){
                return parseInt(jointId, 10);
            }
        }
    }
    // Joint not found, return 0
    return 0;
};

gdjs.PhysikSharedData.prototype.removeJoint = function(jointId){
    // Cast to string
    jointId = jointId.toString(10);
    // Delete the joint
    if(this.joints.hasOwnProperty(jointId)){
        var joint = this.joints[jointId];
        // If we delete a joint attached to a gear joint, the gear will crash, so we must delete the gear joint first
        // Search in our joints list gear joints attached to this one we want to remove
        for(var jId in this.joints){
            if(this.joints.hasOwnProperty(jId)){
                if(this.joints[jId].GetType() === Box2D.e_gearJoint &&
                    (this.joints[jId].GetJoint1() === joint || this.joints[jId].GetJoint2() === joint)){
                        // We could pass it a string, but lets do it right
                        this.removeJoint(parseInt(jId, 10));
                }
            }
        }
        // Remove the joint
        this.world.DestroyJoint(joint);
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
    this.shapeScale = 1;
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

gdjs.PhysikRuntimeBehavior.prototype.createShape = function() {
    // Get the scaled offset
    var offsetX = this.shapeOffsetX ? this.shapeOffsetX * this.shapeScale * this._sharedData.invScaleX : 0;
    var offsetY = this.shapeOffsetY ? this.shapeOffsetY * this.shapeScale * this._sharedData.invScaleY : 0;
    // Generate the base shape
    var shape;
    if(this.shape === "Circle"){
        shape = new Box2D.b2CircleShape();
        // Radius determined by the custom dimension
        if(this.shapeDimensionA > 0){
            shape.set_m_radius(this.shapeDimensionA * this.shapeScale * this._sharedData.invScaleX);
        }
        // Average radius from width and height
        else{
            var radius = (this.owner.getWidth() * this._sharedData.invScaleX +
                          this.owner.getHeight() * this._sharedData.invScaleY) / 4;
            shape.set_m_radius(radius > 0 ? radius : 1);
        }
        // Set the offset
        shape.set_m_p(this.b2Vec2(offsetX, offsetY));
    }
    else if(this.shape === "Polygon"){
        // Needs a vertices editor
    }
    else if(this.shape === "Edge"){
        shape = new Box2D.b2EdgeShape();
        // Length from the custom dimension or from the object width
        var length = (this.shapeDimensionA > 0 ? this.shapeDimensionA * this.shapeScale :
                      this.owner.getWidth() > 0 ? this.owner.getWidth() : 1) * this._sharedData.invScaleX;
        var height = this.owner.getHeight() > 0 ? this.owner.getHeight() * this._sharedData.invScaleY : 0;
        // Angle from custom dimension, otherwise is 0
        var angle = this.shapeDimensionB ? gdjs.toRad(this.shapeDimensionB) : 0;
        // Set the edge vertices from the length, the angle and the offset
        shape.Set(this.b2Vec2(-length/2*Math.cos(angle) + offsetX, height/2 - length/2*Math.sin(angle) + offsetY),
                  this.b2Vec2Sec(length/2*Math.cos(angle) + offsetX, height/2 + length/2*Math.sin(angle) + offsetY));
    }
    else{ // Box
        shape = new Box2D.b2PolygonShape();
        // Width and height from custom dimensions or object size
        var width = (this.shapeDimensionA > 0 ? this.shapeDimensionA * this.shapeScale :
                        this.owner.getWidth() > 0 ? this.owner.getWidth() : 1) * this._sharedData.invScaleX;
        var height = (this.shapeDimensionB > 0 ? this.shapeDimensionB * this.shapeScale :
                        this.owner.getHeight() > 0 ? this.owner.getHeight() : 1) * this._sharedData.invScaleY;
        // Set the shape box, the offset must be added here too
        shape.SetAsBox(width/2, height/2, this.b2Vec2(offsetX, offsetY), 0);
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
    if(this.density < 0) this.density = 0;
    fixDef.set_density(this.density);
    if(this.friction < 0) this.friction = 0;
    fixDef.set_friction(this.friction);
    if(this.restitution < 0) this.restitution = 0;
    fixDef.set_restitution(this.restitution);

    // Return the fixture
    return fixDef;
};

gdjs.PhysikRuntimeBehavior.prototype.recreateShape = function() {
    // If there is no body, set a new one
    if(this._body === null){
        this.createBody();
        return;
    }
    // Destroy the old shape
    this._body.DestroyFixture(this._body.GetFixtureList());
    this._body.CreateFixture(this.createShape());
    // Update cached size
    this._objectOldWidth = this.owner.getWidth();
    this._objectOldHeight = this.owner.getHeight();
};

gdjs.PhysikRuntimeBehavior.prototype.getShapeScale = function() {
    return this.shapeScale;
};

gdjs.PhysikRuntimeBehavior.prototype.setShapeScale = function(shapeScale) {
    if(shapeScale !== this.shapeScale && shapeScale > 0){
        this.shapeScale = shapeScale;
        this.recreateShape();
    }
};

gdjs.PhysikRuntimeBehavior.prototype.getBody = function() {
    // If there is no body, set a new one
    if (this._body === null) this.createBody();

    return this._body;
};

gdjs.PhysikRuntimeBehavior.prototype.createBody = function() {
    // Generate the body definition
    var bodyDef = new Box2D.b2BodyDef();

    // Set the initial body transformation from the GD object
    bodyDef.set_position(this.b2Vec2(
         (this.owner.getDrawableX() + this.owner.getWidth()/2) * this._sharedData.invScaleX,
         (this.owner.getDrawableY() + this.owner.getHeight()/2) * this._sharedData.invScaleY));
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
    this._body.CreateFixture(this.createShape());
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
        this.owner.getWidth()/2 + this.owner.getX() - this.owner.getDrawableX());
    this.owner.setY(this._body.GetPosition().get_y()*this._sharedData.scaleY -
        this.owner.getHeight()/2 + this.owner.getY() - this.owner.getDrawableY());
    this.owner.setAngle(gdjs.toDegrees(this._body.GetAngle()));

    // Update cached transform
    this._objectOldX = this.owner.getX();
    this._objectOldY = this.owner.getY();
    this._objectOldAngle = this.owner.getAngle();
};

gdjs.PhysikRuntimeBehavior.prototype.doStepPostEvents = function(runtimeScene) {
    // If there is no body, set a new one
    if (this._body === null) this.createBody();

    // GD object size has changed, recreate shape
    // The width has changed and there is no custom dimension A (box: width, circle: radius, edge: length) or
    // The height has changed, the shape is not an edge (edges doesn't have height),
    // it isn't a box with custom height or a circle with custom radius
    if ((this._objectOldWidth !== this.owner.getWidth() && this.shapeDimensionA <= 0) ||
        (this._objectOldHeight !== this.owner.getHeight() &&
            this.shape !== "Edge" &&
            !(this.shape === "Box" && this.shapeDimensionB > 0) &&
            !(this.shape === "Ciecle" && this.shapeDimensionA > 0))){
        this.recreateShape();
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

gdjs.PhysikRuntimeBehavior.prototype.setGravityX = function(x){
    // Check if there is no modification
    if(this._sharedData.gravityX === x) return;
    // Change the gravity on X
    this._sharedData.gravityX = x;
    this._sharedData.world.SetGravity(this.b2Vec2(this._sharedData.gravityX, this._sharedData.gravityX));
};

gdjs.PhysikRuntimeBehavior.prototype.getGravityY = function(){
    return this._sharedData.gravityY;
};

gdjs.PhysikRuntimeBehavior.prototype.setGravityY = function(y){
    // Check if there is no modification
    if(this._sharedData.gravityY === y) return;
    // Change the gravity on Y
    this._sharedData.gravityY = y;
    this._sharedData.world.SetGravity(this.b2Vec2(this._sharedData.gravityX, this._sharedData.gravityX));
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

gdjs.PhysikRuntimeBehavior.prototype.getMassCenterX = function(){
    // If there is no body, set a new one
    if(this._body === null){
        this.createBody();
    }
    // Get the mass center on X
    return this._body.GetWorldCenter().get_x();
};

gdjs.PhysikRuntimeBehavior.prototype.getMassCenterY = function(){
    // If there is no body, set a new one
    if(this._body === null){
        this.createBody();
    }
    // Get the mass center on Y
    return this._body.GetWorldCenter().get_y();
};



// Joints
gdjs.PhysikRuntimeBehavior.prototype.isJointFirstObject = function(jointId){
    // If there is no body, set a new one
    if(this._body === null){
        this.createBody();
        return false;
    }
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found
    if(joint === null) return false;
    // Check the joint object
    return joint.GetBodyA() === this._body;
};

gdjs.PhysikRuntimeBehavior.prototype.isJointSecondObject = function(jointId){
    // If there is no body, set a new one
    if(this._body === null){
        this.createBody();
        return false;
    }
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found
    if(joint === null) return false;
    // Check the joint object
    return joint.GetBodyB() === this._body;
};

gdjs.PhysikRuntimeBehavior.prototype.getJointFirstAnchorX = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found
    if(joint === null) return 0;
    // Get the joint anchor
    return joint.GetBodyA().GetWorldPoint(joint.GetLocalAnchorA()).get_x();
};

gdjs.PhysikRuntimeBehavior.prototype.getJointFirstAnchorY = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found
    if(joint === null) return 0;
    // Get the joint anchor
    return joint.GetBodyA().GetWorldPoint(joint.GetLocalAnchorA()).get_y();
};

gdjs.PhysikRuntimeBehavior.prototype.getJointSecondAnchorX = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found
    if(joint === null) return 0;
    // Get the joint anchor
    return joint.GetBodyB().GetWorldPoint(joint.GetLocalAnchorB()).get_x();
};

gdjs.PhysikRuntimeBehavior.prototype.getJointSecondAnchorY = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found
    if(joint === null) return 0;
    // Get the joint anchor
    return joint.GetBodyB().GetWorldPoint(joint.GetLocalAnchorB()).get_y();
};

gdjs.PhysikRuntimeBehavior.prototype.getJointReactionForce = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found
    if(joint === null) return 0;
    // Get the reaction force
    return joint.GetReactionForce(1 / this._sharedData.timeStep).Length();
};

gdjs.PhysikRuntimeBehavior.prototype.getJointReactionTorque = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found
    if(joint === null) return 0;
    // Get the reaction torque
    return joint.GetReactionTorque(1 / this._sharedData.timeStep);
};


gdjs.PhysikRuntimeBehavior.prototype.removeJoint = function(jointId){
    // Just let the sharedData to manage and delete the joint
    this._sharedData.removeJoint(jointId);
};



// Distance joint
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
    jointDef.set_length(length > 0 ? length * this._sharedData.invScaleX :
                        this.b2Vec2((x2 - x1) * this._sharedData.invScaleX, (y2 - y1) * this._sharedData.invScaleY).Length());
    jointDef.set_frequencyHz(frequency >= 0 ? frequency : 0);
    jointDef.set_dampingRatio(dampingRatio >= 0 ? dampingRatio : 1);
    jointDef.set_collideConnected(collideConnected);
    // Create the joint and get the id
    var jointId = this._sharedData.addJoint(Box2D.castObject(this._sharedData.world.CreateJoint(jointDef), Box2D.b2DistanceJoint));
    // Store the id in the variable
    variable.setNumber(jointId);
};

gdjs.PhysikRuntimeBehavior.prototype.getDistanceJointLength = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_distanceJoint) return 0;
    // Get the joint length
    return joint.GetLength() * this._sharedData.scaleX;
};

gdjs.PhysikRuntimeBehavior.prototype.setDistanceJointLength = function(jointId, length){
    // Invalid value
    if(length <= 0) return;
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_distanceJoint) return;
    // Set the joint length
    joint.SetLength(length * this._sharedData.invScaleX);
    // Awake the bodies
    joint.GetBodyA().SetAwake(true);
    joint.GetBodyB().SetAwake(true);
};

gdjs.PhysikRuntimeBehavior.prototype.getDistanceJointFrequency = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_distanceJoint) return 0;
    // Get the joint frequency
    return joint.GetFrequency();
};

gdjs.PhysikRuntimeBehavior.prototype.setDistanceJointFrequency = function(jointId, frequency){
    // Invalid value
    if(frequency < 0) return;
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_distanceJoint) return;
    // Set the joint frequency
    joint.SetFrequency(frequency);
};

gdjs.PhysikRuntimeBehavior.prototype.getDistanceJointDampingRatio = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_distanceJoint) return 0;
    // Get the joint damping ratio
    return joint.GetDampingRatio();
};

gdjs.PhysikRuntimeBehavior.prototype.setDistanceJointDampingRatio = function(jointId, dampingRatio){
    // Invalid value
    if(dampingRatio < 0) return;
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_distanceJoint);
    // Set the joint damping ratio
    joint.SetDampingRatio(dampingRatio);
};



// Revolute joint
gdjs.PhysikRuntimeBehavior.prototype.addRevoluteJoint = function(x, y, enableLimit, referenceAngle, lowerAngle, upperAngle, enableMotor, motorSpeed, maxMotorTorque, variable){
    // If there is no body, set a new one
    if(this._body === null){
        this.createBody();
        return;
    }
    // Set joint settings
    var jointDef = new Box2D.b2RevoluteJointDef();
    jointDef.set_bodyA(this._sharedData.staticBody);
    jointDef.set_localAnchorA(this._sharedData.staticBody.GetLocalPoint(this.b2Vec2(x * this._sharedData.invScaleX, y * this._sharedData.invScaleY)));
    jointDef.set_bodyB(this._body);
    jointDef.set_localAnchorB(this._body.GetLocalPoint(this.b2Vec2(x * this._sharedData.invScaleX, y * this._sharedData.invScaleY)));
    jointDef.set_enableLimit(enableLimit);
    jointDef.set_referenceAngle(gdjs.toRad(referenceAngle));
    // Lower angle must be lower than upper angle
    if(upperAngle < lowerAngle){
        var temp = lowerAngle;
        lowerAngle = upperAngle;
        upperAngle = temp;
    }
    jointDef.set_lowerAngle(gdjs.toRad(lowerAngle));
    jointDef.set_upperAngle(gdjs.toRad(upperAngle));
    jointDef.set_enableMotor(enableMotor);
    jointDef.set_motorSpeed(motorSpeed);
    jointDef.set_maxMotorTorque(maxMotorTorque);
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
    jointDef.set_referenceAngle(gdjs.toRad(referenceAngle));
    // Lower angle must be lower than upper angle
    if(upperAngle < lowerAngle){
        var temp = lowerAngle;
        lowerAngle = upperAngle;
        upperAngle = temp;
    }
    jointDef.set_lowerAngle(gdjs.toRad(lowerAngle));
    jointDef.set_upperAngle(gdjs.toRad(upperAngle));
    jointDef.set_enableMotor(enableMotor);
    jointDef.set_motorSpeed(motorSpeed);
    jointDef.set_maxMotorTorque(maxMotorTorque >= 0 ? maxMotorTorque : 0);
    jointDef.set_collideConnected(collideConnected);
    // Create the joint and get the id
    var jointId = this._sharedData.addJoint(Box2D.castObject(this._sharedData.world.CreateJoint(jointDef), Box2D.b2RevoluteJoint));
    // Store the id in the variable
    variable.setNumber(jointId);
};

gdjs.PhysikRuntimeBehavior.prototype.getRevoluteJointReferenceAngle = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_revoluteJoint) return 0;
    // Get the joint reference angle
    return gdjs.toDegrees(joint.GetReferenceAngle());
};

gdjs.PhysikRuntimeBehavior.prototype.getRevoluteJointAngle = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_revoluteJoint) return 0;
    // Get the joint current angle
    return gdjs.toDegrees(joint.GetJointAngle());
};

gdjs.PhysikRuntimeBehavior.prototype.getRevoluteJointSpeed = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_revoluteJoint) return 0;
    // Get the joint angular speed
    return gdjs.toDegrees(joint.GetJointSpeed());
};

gdjs.PhysikRuntimeBehavior.prototype.isRevoluteJointLimitsEnabled = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_revoluteJoint) return false;
    // Get the joint limits state
    return joint.IsLimitEnabled();
};

gdjs.PhysikRuntimeBehavior.prototype.enableRevoluteJointLimits = function(jointId, enable){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_revoluteJoint) return;
    // Set the joint limits state
    joint.EnableLimit(enable);
};

gdjs.PhysikRuntimeBehavior.prototype.getRevoluteJointMinAngle = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_revoluteJoint) return 0;
    // Get the joint lower angle
    return gdjs.toDegrees(joint.GetLowerLimit());
};

gdjs.PhysikRuntimeBehavior.prototype.getRevoluteJointMaxAngle = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_revoluteJoint) return 0;
    // Get the joint upper angle
    return gdjs.toDegrees(joint.GetUpperLimit());
};

gdjs.PhysikRuntimeBehavior.prototype.setRevoluteJointLimits = function(jointId, lowerAngle, upperAngle){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_revoluteJoint) return;
    // Lower angle must be lower than upper angle
    if(upperAngle < lowerAngle){
        var temp = lowerAngle;
        lowerAngle = upperAngle;
        upperAngle = temp;
    }
    // Set the joint limits
    joint.SetLimits(gdjs.toRad(lowerAngle), gdjs.toRad(upperAngle));
};

gdjs.PhysikRuntimeBehavior.prototype.isRevoluteJointMotorEnabled = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_revoluteJoint) return false;
    // Get the joint motor state
    return joint.IsMotorEnabled();
};

gdjs.PhysikRuntimeBehavior.prototype.enableRevoluteJointMotor = function(jointId, enable){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_revoluteJoint) return;
    // Set the joint motor state
    joint.EnableMotor(enable);
};

gdjs.PhysikRuntimeBehavior.prototype.getRevoluteJointMotorSpeed = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_revoluteJoint) return 0;
    // Get the joint motor speed
    return gdjs.toDegrees(joint.GetMotorSpeed());
};

gdjs.PhysikRuntimeBehavior.prototype.setRevoluteJointMotorSpeed = function(jointId, speed){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_revoluteJoint) return;
    // Set the joint motor speed
    joint.SetMotorSpeed(gdjs.toRad(speed));
};

gdjs.PhysikRuntimeBehavior.prototype.getRevoluteJointMaxMotorTorque = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_revoluteJoint) return 0;
    // Get the joint max motor
    return joint.GetMaxMotorTorque();
};

gdjs.PhysikRuntimeBehavior.prototype.setRevoluteJointMaxMotorTorque = function(jointId, maxTorque){
    // Invalid value
    if(maxTorque < 0) return;
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_revoluteJoint) return;
    // Set the joint max motor
    joint.SetMaxMotorTorque(maxTorque);
};

gdjs.PhysikRuntimeBehavior.prototype.getRevoluteJointMotorTorque = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_revoluteJoint) return 0;
    // Get the joint motor torque
    return joint.GetMotorTorque(1 / this._sharedData.timeStep);
};



// Prismatic joint
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
    // Lower translation must be lower than upper translation
    if(upperTranslation < lowerTranslation){
        var temp = lowerTranslation;
        lowerTranslation = upperTranslation;
        upperTranslation = temp;
    }
    // The translation range must include zero
    jointDef.set_lowerTranslation(lowerTranslation < 0 ? lowerTranslation * this._sharedData.invScaleX : 0);
    jointDef.set_upperTranslation(upperTranslation > 0 ? upperTranslation * this._sharedData.invScaleX : 0);
    jointDef.set_enableMotor(enableMotor);
    jointDef.set_motorSpeed(motorSpeed);
    jointDef.set_maxMotorForce(maxMotorForce);
    jointDef.set_collideConnected(collideConnected);
    // Create the joint and get the id
    var jointId = this._sharedData.addJoint(Box2D.castObject(this._sharedData.world.CreateJoint(jointDef), Box2D.b2PrismaticJoint));
    // Store the id in the variable
    variable.setNumber(jointId);
};

gdjs.PhysikRuntimeBehavior.prototype.getPrismaticJointAxisAngle = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_prismaticJoint) return 0;
    // Get the joint axis angle
    return gdjs.toDegrees(Math.atan2(joint.GetLocalAxisA().get_y(),joint.GetLocalAxisA().get_x()) + joint.GetBodyA().GetAngle());
};

gdjs.PhysikRuntimeBehavior.prototype.getPrismaticJointReferenceAngle = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_prismaticJoint) return 0;
    // Get the joint reference angle
    return gdjs.toDegrees(joint.GetReferenceAngle());
};

gdjs.PhysikRuntimeBehavior.prototype.getPrismaticJointTranslation = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_prismaticJoint) return 0;
    // Get the joint current translation
    return joint.GetJointTranslation() * this._sharedData.scaleX;
};

gdjs.PhysikRuntimeBehavior.prototype.getPrismaticJointSpeed = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_prismaticJoint) return 0;
    // Get the joint speed
    return joint.GetJointSpeed() * this._sharedData.scaleX;
};

gdjs.PhysikRuntimeBehavior.prototype.isPrismaticJointLimitsEnabled = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_prismaticJoint) return false;
    // Get the joint limits state
    return joint.IsLimitEnabled();
};

gdjs.PhysikRuntimeBehavior.prototype.enablePrismaticJointLimits = function(jointId, enable){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_prismaticJoint) return;
    // Set the joint limits state
    joint.EnableLimit(enable);
};

gdjs.PhysikRuntimeBehavior.prototype.getPrismaticJointMinTranslation = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_prismaticJoint) return 0;
    // Get the joint lower limit
    return joint.GetLowerLimit() * this._sharedData.scaleX;
};

gdjs.PhysikRuntimeBehavior.prototype.getPrismaticJointMaxTranslation = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_prismaticJoint) return 0;
    // Get the joint upper angle
    return joint.GetUpperLimit() * this._sharedData.scaleX;
};

gdjs.PhysikRuntimeBehavior.prototype.setPrismaticJointLimits = function(jointId, lowerTranslation, upperTranslation){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_prismaticJoint) return;
    // Lower translation must be lower than upper translation
    if(upperTranslation < lowerTranslation){
        var temp = lowerTranslation;
        lowerTranslation = upperTranslation;
        upperTranslation = temp;
    }
    // The translation range must include zero
    lowerTranslation = lowerTranslation < 0 ? lowerTranslation : 0;
    upperTranslation = upperTranslation > 0 ? upperTranslation : 0;
    // Set the joint limits
    joint.SetLimits(lowerTranslation * this._sharedData.invScaleX, upperTranslation * this._sharedData.invScaleX);
};

gdjs.PhysikRuntimeBehavior.prototype.isPrismaticJointMotorEnabled = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_prismaticJoint) return false;
    // Get the joint motor state
    return joint.IsMotorEnabled();
};

gdjs.PhysikRuntimeBehavior.prototype.enablePrismaticJointMotor = function(jointId, enable){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_prismaticJoint) return;
    // Set the joint motor state
    joint.EnableMotor(enable);
};

gdjs.PhysikRuntimeBehavior.prototype.getPrismaticJointMotorSpeed = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_prismaticJoint) return 0;
    // Get the joint motor speed
    return joint.GetMotorSpeed() * this._sharedData.scaleX;
};

gdjs.PhysikRuntimeBehavior.prototype.setPrismaticJointMotorSpeed = function(jointId, speed){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_prismaticJoint) return;
    // Set the joint motor speed
    joint.SetMotorSpeed(speed * this._sharedData.invScaleX);
};

gdjs.PhysikRuntimeBehavior.prototype.getPrismaticJointMaxMotorForce = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_prismaticJoint) return 0;
    // Get the joint max motor force
    return joint.GetMaxMotorForce();
};

gdjs.PhysikRuntimeBehavior.prototype.setPrismaticJointMaxMotorForce = function(jointId, maxForce){
    // Invalid value
    if(maxForce < 0) return;
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_prismaticJoint) return;
    // Set the joint max motor force
    joint.SetMaxMotorForce(maxForce);
};

gdjs.PhysikRuntimeBehavior.prototype.getPrismaticJointMotorForce = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_prismaticJoint) return 0;
    // Get the joint motor torque
    return joint.GetMotorForce(1 / this._sharedData.timeStep);
};



// Pulley joint
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
    var jointId = this._sharedData.addJoint(Box2D.castObject(this._sharedData.world.CreateJoint(jointDef), Box2D.b2PulleyJoint));
    // Store the id in the variable
    variable.setNumber(jointId);
};

gdjs.PhysikRuntimeBehavior.prototype.getPulleyJointFirstGroundAnchorX = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_pulleyJoint) return 0;
    // Get the joint ground anchor
    return joint.GetGroundAnchorA().get_x() * this._sharedData.scaleX;
};

gdjs.PhysikRuntimeBehavior.prototype.getPulleyJointFirstGroundAnchorY = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_pulleyJoint) return 0;
    // Get the joint ground anchor
    return joint.GetGroundAnchorA().get_y() * this._sharedData.scaleY;
};

gdjs.PhysikRuntimeBehavior.prototype.getPulleyJointSecondGroundAnchorX = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_pulleyJoint) return 0;
    // Get the joint ground anchor
    return joint.GetGroundAnchorB().get_x() * this._sharedData.scaleX;
};

gdjs.PhysikRuntimeBehavior.prototype.getPulleyJointSecondGroundAnchorY = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_pulleyJoint) return 0;
    // Get the joint ground anchor
    return joint.GetGroundAnchorB().get_y() * this._sharedData.scaleY;
};

gdjs.PhysikRuntimeBehavior.prototype.getPulleyJointFirstLength = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_pulleyJoint) return 0;
    // Get the joint length
    return joint.GetCurrentLengthA() * this._sharedData.scaleX;
};

gdjs.PhysikRuntimeBehavior.prototype.getPulleyJointSecondLength = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_pulleyJoint) return 0;
    // Get the joint length
    return joint.GetCurrentLengthB() * this._sharedData.scaleX;
};

gdjs.PhysikRuntimeBehavior.prototype.getPulleyJointRatio = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_pulleyJoint) return 0;
    // Get the joint ratio
    return joint.GetRatio();
};



// Gear joint
gdjs.PhysikRuntimeBehavior.prototype.addGearJoint = function(jointId1, jointId2, ratio, collideConnected, variable){
    // If there is no body, set a new one
    if(this._body === null){
        this.createBody();
        return;
    }
    // Get the first joint
    var joint1 = this._sharedData.getJoint(jointId1);
    // Joint not found or has wrong type
    if(joint1 === null || (joint1.GetType() !== Box2D.e_revoluteJoint && joint1.GetType() !== Box2D.e_prismaticJoint)) return;
    // Get the second joint
    var joint2 = this._sharedData.getJoint(jointId2);
    if(joint2 === null || (joint2.GetType() !== Box2D.e_revoluteJoint && joint2.GetType() !== Box2D.e_prismaticJoint)) return;
    // The joints are the same
    if(joint1 === joint2) return;
    // Set joint settings
    var jointDef = new Box2D.b2GearJointDef();
    // Set gear joint bodies is not necessary at first, as the gear get the bodies from the two child joints
    // But we must pass two different bodies to bypass a test inherited from b2Joint
    jointDef.set_bodyA(this._sharedData.staticBody);
    jointDef.set_bodyB(this._body);
    jointDef.set_joint1(joint1);
    jointDef.set_joint2(joint2);
    jointDef.set_ratio(ratio);
    jointDef.set_collideConnected(collideConnected);
    // Create the joint and get the id
    var jointId = this._sharedData.addJoint(Box2D.castObject(this._sharedData.world.CreateJoint(jointDef), Box2D.b2GearJoint));
    // Store the id in the variable
    variable.setNumber(jointId);
};

gdjs.PhysikRuntimeBehavior.prototype.getGearJointFirstJoint = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_gearJoint) return 0;
    // Get the joint first joint
    return this._sharedData.getJointId(joint.GetJoint1());
};

gdjs.PhysikRuntimeBehavior.prototype.getGearJointSecondJoint = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_gearJoint) return 0;
    // Get the joint second joint
    return this._sharedData.getJointId(joint.GetJoint2());
};

gdjs.PhysikRuntimeBehavior.prototype.getGearJointRatio = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_gearJoint) return 0;
    // Get the joint ratio
    return joint.GetRatio();
};

gdjs.PhysikRuntimeBehavior.prototype.setGearJointRatio = function(jointId, ratio){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_gearJoint) return;
    // Set the joint ratio
    joint.SetRatio(ratio);
    // Awake the bodies, the gear joint picks the dynamic bodies as first and second body (second bodies from the child joints)
    joint.GetBodyA().SetAwake(true);
    joint.GetBodyB().SetAwake(true);
};



// Mouse joint
gdjs.PhysikRuntimeBehavior.prototype.addMouseJoint = function(targetX, targetY, maxForce, frequency, dampingRatio, variable){
    // If there is no body, set a new one
    if(this._body === null){
        this.createBody();
        return;
    }
    // Set joint settings
    var jointDef = new Box2D.b2MouseJointDef();
    jointDef.set_bodyA(this._sharedData.staticBody);
    jointDef.set_bodyB(this._body);
    jointDef.set_target(this.b2Vec2(targetX * this._sharedData.invScaleX, targetY * this._sharedData.invScaleY));
    jointDef.set_maxForce(maxForce >= 0 ? maxForce : 0);
    jointDef.set_frequencyHz(frequency > 0 ? frequency : 1);
    jointDef.set_dampingRatio(dampingRatio >= 0 ? dampingRatio : 0);
    // Create the joint and get the id
    var jointId = this._sharedData.addJoint(Box2D.castObject(this._sharedData.world.CreateJoint(jointDef), Box2D.b2MouseJoint));
    // Store the id in the variable
    variable.setNumber(jointId);
};

gdjs.PhysikRuntimeBehavior.prototype.getMouseJointTargetX = function(jointId){
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_mouseJoint) return 0;
    // Get the joint target X
    return joint.GetTarget().get_x() * this._sharedData.scaleX;
};

gdjs.PhysikRuntimeBehavior.prototype.getMouseJointTargetY = function(jointId){
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_mouseJoint) return 0;
    // Get the joint target Y
    return joint.GetTarget().get_y() * this._sharedData.scaleY;
};

gdjs.PhysikRuntimeBehavior.prototype.setMouseJointTarget = function(jointId, targetX, targetY){
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_mouseJoint) return;
    // Set the joint target
    joint.SetTarget(this.b2Vec2(targetX * this._sharedData.invScaleX, targetY * this._sharedData.invScaleY));
    // Awake the body
    joint.GetBodyB().SetAwake(true);
};

gdjs.PhysikRuntimeBehavior.prototype.getMouseJointMaxForce = function(jointId){
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_mouseJoint) return 0;
    // Get the joint max force
    return joint.GetMaxForce();
};

gdjs.PhysikRuntimeBehavior.prototype.setMouseJointMaxForce = function(jointId, maxForce){
    // Invalid value
    if(maxForce < 0) return;
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_mouseJoint) return;
    // Set the joint max force
    joint.SetMaxForce(maxForce);
};

gdjs.PhysikRuntimeBehavior.prototype.getMouseJointFrequency = function(jointId){
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_mouseJoint) return 0;
    // Get the joint frequency
    return joint.GetFrequency();
};

gdjs.PhysikRuntimeBehavior.prototype.setMouseJointFrequency = function(jointId, frequency){
    // Invalid value
    if(frequency <= 0) return;
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_mouseJoint) return;
    // Set the joint frequency
    joint.SetFrequency(frequency);
};

gdjs.PhysikRuntimeBehavior.prototype.getMouseJointDampingRatio = function(jointId){
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_mouseJoint) return 0;
    // Get the joint damping ratio
    return joint.GetDampingRatio();
};

gdjs.PhysikRuntimeBehavior.prototype.setMouseJointDampingRatio = function(jointId, dampingRatio){
    // Invalid value
    if(dampingRatio < 0) return;
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_mouseJoint) return;
    // Set the joint damping ratio
    joint.SetDampingRatio(dampingRatio);
};



// Wheel joint
gdjs.PhysikRuntimeBehavior.prototype.addWheelJoint = function(x1, y1, other, x2, y2, axisAngle, frequency, dampingRatio, enableMotor, motorSpeed, maxMotorTorque, collideConnected, variable){
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
    var jointDef = new Box2D.b2WheelJointDef();
    jointDef.set_bodyA(this._body);
    jointDef.set_localAnchorA(this._body.GetLocalPoint(this.b2Vec2(x1 * this._sharedData.invScaleX, y1 * this._sharedData.invScaleY)));
    jointDef.set_bodyB(otherBody);
    jointDef.set_localAnchorB(otherBody.GetLocalPoint(this.b2Vec2(x2 * this._sharedData.invScaleX, y2 * this._sharedData.invScaleY)));
    axisAngle = gdjs.toRad(axisAngle) - this._body.GetAngle();
    jointDef.set_localAxisA(this.b2Vec2(Math.cos(axisAngle), Math.sin(axisAngle)));
    jointDef.set_frequencyHz(frequency > 0 ? frequency : 1);
    jointDef.set_dampingRatio(dampingRatio >= 0 ? dampingRatio : 0);
    jointDef.set_enableMotor(enableMotor);
    jointDef.set_motorSpeed(motorSpeed);
    jointDef.set_maxMotorTorque(maxMotorTorque);
    jointDef.set_collideConnected(collideConnected);
    // Create the joint and get the id
    var jointId = this._sharedData.addJoint(Box2D.castObject(this._sharedData.world.CreateJoint(jointDef), Box2D.b2WheelJoint));
    // Store the id in the variable
    variable.setNumber(jointId);
};

gdjs.PhysikRuntimeBehavior.prototype.getWheelJointAxisAngle = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_wheelJoint) return 0;
    // Get the joint axis angle
    return gdjs.toDegrees(Math.atan2(joint.GetLocalAxisA().get_y(),joint.GetLocalAxisA().get_x()) + joint.GetBodyA().GetAngle());
};

gdjs.PhysikRuntimeBehavior.prototype.getWheelJointTranslation = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_wheelJoint) return 0;
    // Get the joint current translation
    return joint.GetJointTranslation() * this._sharedData.scaleX;
};

gdjs.PhysikRuntimeBehavior.prototype.getWheelJointSpeed = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_wheelJoint) return 0;
    // Get the joint speed
    return joint.GetJointSpeed() * this._sharedData.scaleX;
};

gdjs.PhysikRuntimeBehavior.prototype.isWheelJointMotorEnabled = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_wheelJoint) return false;
    // Get the joint motor state
    return joint.IsMotorEnabled();
};

gdjs.PhysikRuntimeBehavior.prototype.enableWheelJointMotor = function(jointId, enable){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_wheelJoint) return;
    // Set the joint motor state
    joint.EnableMotor(enable);
};

gdjs.PhysikRuntimeBehavior.prototype.getWheelJointMotorSpeed = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_wheelJoint) return 0;
    // Get the joint motor speed
    return gdjs.toDegrees(joint.GetMotorSpeed());
};

gdjs.PhysikRuntimeBehavior.prototype.setWheelJointMotorSpeed = function(jointId, speed){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_wheelJoint) return;
    // Set the joint motor speed
    joint.SetMotorSpeed(gdjs.toRad(speed));
};

gdjs.PhysikRuntimeBehavior.prototype.getWheelJointMaxMotorTorque = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_wheelJoint) return 0;
    // Get the joint max motor torque
    return joint.GetMaxMotorTorque();
};

gdjs.PhysikRuntimeBehavior.prototype.setWheelJointMaxMotorTorque = function(jointId, maxTorque){
    // Invalid value
    if(maxTorque < 0) return;
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_wheelJoint) return;
    // Set the joint max motor torque
    joint.SetMaxMotorTorque(maxTorque);
};

gdjs.PhysikRuntimeBehavior.prototype.getWheelJointMotorTorque = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_wheelJoint) return 0;
    // Get the joint motor torque
    return joint.GetMotorTorque(1 / this._sharedData.timeStep);
};

gdjs.PhysikRuntimeBehavior.prototype.getWheelJointFrequency = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_wheelJoint) return 0;
    // Get the joint frequency
    return joint.GetSpringFrequencyHz();
};

gdjs.PhysikRuntimeBehavior.prototype.setWheelJointFrequency = function(jointId, frequency){
    // Invalid value
    if(frequency < 0) return;
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_wheelJoint) return;
    // Set the joint frequency
    joint.SetSpringFrequencyHz(frequency);
};

gdjs.PhysikRuntimeBehavior.prototype.getWheelJointDampingRatio = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_wheelJoint) return 0;
    // Get the joint damping ratio
    return joint.GetSpringDampingRatio();
};

gdjs.PhysikRuntimeBehavior.prototype.setWheelJointDampingRatio = function(jointId, dampingRatio){
    // Invalid value
    if(dampingRatio < 0) return;
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_wheelJoint) return;
    // Set the joint damping ratio
    joint.SetSpringDampingRatio(dampingRatio);
};



// Weld joint
gdjs.PhysikRuntimeBehavior.prototype.addWeldJoint = function(x1, y1, other, x2, y2, referenceAngle, frequency, dampingRatio, collideConnected, variable){
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
    var jointDef = new Box2D.b2WeldJointDef();
    jointDef.set_bodyA(this._body);
    jointDef.set_localAnchorA(this._body.GetLocalPoint(this.b2Vec2(x1 * this._sharedData.invScaleX, y1 * this._sharedData.invScaleY)));
    jointDef.set_bodyB(otherBody);
    jointDef.set_localAnchorB(otherBody.GetLocalPoint(this.b2Vec2(x2 * this._sharedData.invScaleX, y2 * this._sharedData.invScaleY)));
    jointDef.set_referenceAngle(gdjs.toRad(referenceAngle));
    jointDef.set_frequencyHz(frequency > 0 ? frequency : 1);
    jointDef.set_dampingRatio(dampingRatio >= 0 ? dampingRatio : 0);
    jointDef.set_collideConnected(collideConnected);
    // Create the joint
    var joint = Box2D.castObject(this._sharedData.world.CreateJoint(jointDef), Box2D.b2WeldJoint);
    // b2WeldJoint.GetReferenceAngle() is not binded, store it manually
    joint.referenceAngle = jointDef.get_referenceAngle();
    // Store the id in the variable
    variable.setNumber(this._sharedData.addJoint(joint));
};

gdjs.PhysikRuntimeBehavior.prototype.getWeldJointReferenceAngle = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_weldJoint) return 0;
    // b2WeldJoint.GetReferenceAngle() is not binded
    // return gdjs.toDegrees(joint.GetReferenceAngle());
    return gdjs.toDegrees(joint.referenceAngle);
};

gdjs.PhysikRuntimeBehavior.prototype.getWeldJointFrequency = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_weldJoint) return 0;
    // Get the joint frequency
    return joint.GetFrequency();
};

gdjs.PhysikRuntimeBehavior.prototype.setWeldJointFrequency = function(jointId, frequency){
    // Invalid value
    if(frequency < 0) return;
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_weldJoint) return;
    // Set the joint frequency
    joint.SetFrequency(frequency);
};

gdjs.PhysikRuntimeBehavior.prototype.getWeldJointDampingRatio = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_weldJoint) return 0;
    // Get the joint damping ratio
    return joint.GetDampingRatio();
};

gdjs.PhysikRuntimeBehavior.prototype.setWeldJointDampingRatio = function(jointId, dampingRatio){
    // Invalid value
    if(dampingRatio < 0) return;
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_weldJoint) return;
    // Set the joint damping ratio
    joint.SetDampingRatio(dampingRatio);
};



// Rope joint
gdjs.PhysikRuntimeBehavior.prototype.addRopeJoint = function(x1, y1, other, x2, y2, maxLength, collideConnected, variable){
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
    var jointDef = new Box2D.b2RopeJointDef();
    jointDef.set_bodyA(this._body);
    jointDef.set_localAnchorA(this._body.GetLocalPoint(this.b2Vec2(x1 * this._sharedData.invScaleX, y1 * this._sharedData.invScaleY)));
    jointDef.set_bodyB(otherBody);
    jointDef.set_localAnchorB(otherBody.GetLocalPoint(this.b2Vec2(x2 * this._sharedData.invScaleX, y2 * this._sharedData.invScaleY)));
    jointDef.set_maxLength(maxLength > 0 ? maxLength * this._sharedData.invScaleX :
                           this.b2Vec2((x2 - x1) * this._sharedData.invScaleX, (y2 - y1) * this._sharedData.invScaleY).Length());
    jointDef.set_collideConnected(collideConnected);
    // Create the joint and get the id
    var jointId = this._sharedData.addJoint(Box2D.castObject(this._sharedData.world.CreateJoint(jointDef), Box2D.b2RopeJoint));
    // Store the id in the variable
    variable.setNumber(jointId);
};

gdjs.PhysikRuntimeBehavior.prototype.getRopeJointMaxLength = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_ropeJoint) return 0;
    // Get the joint maximum length
    return joint.GetMaxLength() * this._sharedData.scaleX;
};

gdjs.PhysikRuntimeBehavior.prototype.setRopeJointMaxLength = function(jointId, maxLength){
    // Invalid value
    if(maxLength < 0) return;
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_ropeJoint) return;
    // Set the joint maximum length
    joint.SetMaxLength(maxLength * this._sharedData.invScaleX);
    // Awake the bodies
    joint.GetBodyA().SetAwake(true);
    joint.GetBodyB().SetAwake(true);
};



// Friction joint
gdjs.PhysikRuntimeBehavior.prototype.addFrictionJoint = function(x1, y1, other, x2, y2, maxForce, maxTorque, collideConnected, variable){
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
    var jointDef = new Box2D.b2FrictionJointDef();
    jointDef.set_bodyA(this._body);
    jointDef.set_localAnchorA(this._body.GetLocalPoint(this.b2Vec2(x1 * this._sharedData.invScaleX, y1 * this._sharedData.invScaleY)));
    jointDef.set_bodyB(otherBody);
    jointDef.set_localAnchorB(otherBody.GetLocalPoint(this.b2Vec2(x2 * this._sharedData.invScaleX, y2 * this._sharedData.invScaleY)));
    jointDef.set_maxForce(maxForce >= 0 ? maxForce : 0);
    jointDef.set_maxTorque(maxTorque >= 0 ? maxTorque : 0);
    jointDef.set_collideConnected(collideConnected);
    // Create the joint and get the id
    var jointId = this._sharedData.addJoint(Box2D.castObject(this._sharedData.world.CreateJoint(jointDef), Box2D.b2FrictionJoint));
    // Store the id in the variable
    variable.setNumber(jointId);
};

gdjs.PhysikRuntimeBehavior.prototype.getFrictionJointMaxForce = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_frictionJoint) return 0;
    // Get the joint maximum force
    return joint.GetMaxForce();
};

gdjs.PhysikRuntimeBehavior.prototype.setFrictionJointMaxForce = function(jointId, maxForce){
    // Invalid value
    if(maxForce < 0) return;
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_frictionJoint) return;
    // Set the joint maximum force
    joint.SetMaxForce(maxForce);
};

gdjs.PhysikRuntimeBehavior.prototype.getFrictionJointMaxTorque = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_frictionJoint) return 0;
    // Get the joint maximum torque
    return joint.GetMaxTorque();
};

gdjs.PhysikRuntimeBehavior.prototype.setFrictionJointMaxTorque = function(jointId, maxTorque){
    // Invalid value
    if(maxTorque < 0) return;
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_frictionJoint) return;
    // Set the joint maximum torque
    joint.SetMaxTorque(maxTorque);
};



// Motor joint
gdjs.PhysikRuntimeBehavior.prototype.addMotorJoint = function(other, offsetX, offsetY, offsetAngle, maxForce, maxTorque, correctionFactor, collideConnected, variable){
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
    var jointDef = new Box2D.b2MotorJointDef();
    jointDef.set_bodyA(this._body);
    jointDef.set_bodyB(otherBody);
    jointDef.set_linearOffset(this.b2Vec2(offsetX * this._sharedData.invScaleX, offsetY * this._sharedData.invScaleY));
    jointDef.set_angularOffset(gdjs.toRad(offsetAngle));
    jointDef.set_correctionFactor(correctionFactor < 0 ? 0 :
                                  correctionFactor > 1 ? 1 : correctionFactor);
    jointDef.set_maxForce(maxForce >= 0 ? maxForce : 0);
    jointDef.set_maxTorque(maxTorque >= 0 ? maxTorque : 0);
    jointDef.set_collideConnected(collideConnected);
    // Create the joint and get the id
    var jointId = this._sharedData.addJoint(Box2D.castObject(this._sharedData.world.CreateJoint(jointDef), Box2D.b2MotorJoint));
    // Store the id in the variable
    variable.setNumber(jointId);
};

gdjs.PhysikRuntimeBehavior.prototype.getMotorJointOffsetX = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_motorJoint) return 0;
    // Get the joint offset
    return joint.GetLinearOffset().get_x() * this._sharedData.scaleX;
};

gdjs.PhysikRuntimeBehavior.prototype.getMotorJointOffsetY = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_motorJoint) return 0;
    // Get the joint offset
    return joint.GetLinearOffset().get_y() * this._sharedData.scaleY;
};

gdjs.PhysikRuntimeBehavior.prototype.setMotorJointOffset = function(jointId, offsetX, offsetY){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_motorJoint) return;
    // Set the joint offset
    joint.SetLinearOffset(this.b2Vec2(offsetX * this._sharedData.invScaleX, offsetY * this._sharedData.invScaleY));
};

gdjs.PhysikRuntimeBehavior.prototype.getMotorJointAngularOffset = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_motorJoint) return 0;
    // Get the joint angular offset
    return gdjs.toDegrees(joint.GetAngularOffset());
};

gdjs.PhysikRuntimeBehavior.prototype.setMotorJointAngularOffset = function(jointId, offsetAngle){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_motorJoint) return;
    // Set the joint angular offset
    joint.SetAngularOffset(gdjs.toRad(offsetAngle));
};

gdjs.PhysikRuntimeBehavior.prototype.getMotorJointMaxForce = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_motorJoint) return 0;
    // Get the joint maximum force
    return joint.GetMaxForce();
};

gdjs.PhysikRuntimeBehavior.prototype.setMotorJointMaxForce = function(jointId, maxForce){
    // Invalid value
    if(maxForce < 0) return;
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_motorJoint) return;
    // Set the joint maximum force
    joint.SetMaxForce(maxForce);
};

gdjs.PhysikRuntimeBehavior.prototype.getMotorJointMaxTorque = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_motorJoint) return 0;
    // Get the joint maximum torque
    return joint.GetMaxTorque();
};

gdjs.PhysikRuntimeBehavior.prototype.setMotorJointMaxTorque = function(jointId, maxTorque){
    // Invalid value
    if(maxTorque < 0) return;
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_motorJoint) return;
    // Set the joint maximum torque
    joint.SetMaxTorque(maxTorque);
    // Awake the bodies
    joint.GetBodyA().SetAwake(true);
    joint.GetBodyB().SetAwake(true);
};

gdjs.PhysikRuntimeBehavior.prototype.getMotorJointCorrectionFactor = function(jointId){
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_motorJoint) return 0;
    // Get the joint correction factor
    return joint.GetCorrectionFactor();
};

gdjs.PhysikRuntimeBehavior.prototype.setMotorJointCorrectionFactor = function(jointId, correctionFactor){
    // Invalid value
    if(correctionFactor < 0 || correctionFactor > 1) return;
    // Get the joint
    var joint = this._sharedData.getJoint(jointId);
    // Joint not found or has wrong type
    if(joint === null || joint.GetType() !== Box2D.e_motorJoint) return;
    // Set the joint correction factor
    joint.SetCorrectionFactor(correctionFactor);
    // Awake the bodies
    joint.GetBodyA().SetAwake(true);
    joint.GetBodyB().SetAwake(true);
};
