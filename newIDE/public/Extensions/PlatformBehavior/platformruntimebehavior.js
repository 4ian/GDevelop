/**
GDevelop - Platform Behavior Extension
Copyright (c) 2013-2016 Florian Rival (Florian.Rival@gmail.com)
 */

/**
 * Manages the common objects shared by objects having a
 * platform behavior: in particular, the platforms behaviors are required to declare
 * themselves (see gdjs.PlatformObjectsManager.addPlatform) to the manager of their associated scene
 * (see gdjs.PlatformRuntimeBehavior.getManager).
 *
 * @class PlatformObjectsManager
 * @namespace gdjs
 * @constructor
 */
gdjs.PlatformObjectsManager = function(runtimeScene, sharedData)
{
    this._platformsHSHG = new gdjs.HSHG.HSHG();
    //this._hshgNeedUpdate = true; Useless: The behaviors track by themselves changes in objects size or position.
};

/**
 * Get the platforms manager of a scene.
 *
 * @method getManager
 * @static
 */
gdjs.PlatformObjectsManager.getManager = function(runtimeScene) {
    if (!runtimeScene.platformsObjectsManager) { //Create the shared manager if necessary.
        runtimeScene.platformsObjectsManager = new gdjs.PlatformObjectsManager(runtimeScene);
    }

    return runtimeScene.platformsObjectsManager;
};

/**
 * Add a platform to the list of existing platforms.
 *
 * @method addPlatform
 */
gdjs.PlatformObjectsManager.prototype.addPlatform = function(platformBehavior) {
    this._platformsHSHG.addObject(platformBehavior);
};

/**
 * Remove a platform from the list of existing platforms. Be sure that the platform was
 * added before.
 *
 * @method removePlatform
 */
gdjs.PlatformObjectsManager.prototype.removePlatform = function(platformBehavior) {
    this._platformsHSHG.removeObject(platformBehavior);
};

/**
 * Tool class which represents a simple point with a radius and a getAABB method.
 * @class Vertex
 * @namespace gdjs.PlatformObjectsManager
 * @private
 * @constructor
 */
gdjs.PlatformObjectsManager.Vertex = function(x,y,radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this._aabbComputed = false;

    if (!this._aabb) {
        this._aabb = {min: [0, 0], max: [0, 0]};
    }
};

/**
 * Return an axis aligned bouding box for the vertex.
 * @method getAABB
 */
gdjs.PlatformObjectsManager.Vertex.prototype.getAABB = function(){
    if (!this._aabbComputed) {
        this._aabb.min[0] = this.x - this.radius;
        this._aabb.min[1] = this.y - this.radius;
        this._aabb.max[0] = this.x + this.radius;
        this._aabb.max[1] = this.y + this.radius;
        this._aabbComputed = true;
    }

    return this._aabb;
};

/**
 * Returns all the platforms around the specified object.
 * @param object {gdjs.RuntimeObject} The object
 * @param maxMovementLength The maximum distance, in pixels, the object is going to do.
 * @return An array with all platforms near the object.
 * @method getAllPlatformsAround
 */
gdjs.PlatformObjectsManager.prototype.getAllPlatformsAround = function(object, maxMovementLength, result) {
    var ow = object.getWidth();
    var oh = object.getHeight();
    var x = object.getDrawableX()+object.getCenterX();
    var y = object.getDrawableY()+object.getCenterY();
    var objBoundingRadius = Math.sqrt(ow*ow+oh*oh)/2.0 + maxMovementLength;

    if (!this._aroundVertex)
        this._aroundVertex = new gdjs.PlatformObjectsManager.Vertex(x, y, objBoundingRadius);
    else
        gdjs.PlatformObjectsManager.Vertex.call(this._aroundVertex, x, y, objBoundingRadius);

    this._platformsHSHG.addObject(this._aroundVertex);
    this._platformsHSHG.queryForCollisionWith(this._aroundVertex, result);
    this._platformsHSHG.removeObject(this._aroundVertex);
};

/**
 * PlatformRuntimeBehavior represents a behavior allowing objects to be
 * considered as a platform by objects having PlatformerObject Behavior.
 *
 * @class PlatformRuntimeBehavior
 * @namespace gdjs
 * @constructor
 */
gdjs.PlatformRuntimeBehavior = function(runtimeScene, behaviorData, owner)
{
    gdjs.RuntimeBehavior.call(this, runtimeScene, behaviorData, owner);

    //Load the platform type
    this._platformType = behaviorData.platformType;
    if ( this._platformType == "Ladder" )
        this._platformType = gdjs.PlatformRuntimeBehavior.LADDER;
    else if ( this._platformType == "Jumpthru" )
        this._platformType = gdjs.PlatformRuntimeBehavior.JUMPTHRU;
    else
        this._platformType = gdjs.PlatformRuntimeBehavior.NORMALPLAFTORM;
    this._canBeGrabbed = behaviorData.canBeGrabbed || false;
    this._yGrabOffset = behaviorData.yGrabOffset || 0;

    //Note that we can't use getX(), getWidth()... of owner here: The owner is not fully constructed.
    this._oldX = 0;
    this._oldY = 0;
    this._oldWidth = 0;
    this._oldHeight = 0;

	this._manager = gdjs.PlatformObjectsManager.getManager(runtimeScene);
	this._registeredInManager = false;
};

gdjs.PlatformRuntimeBehavior.prototype = Object.create( gdjs.RuntimeBehavior.prototype );
gdjs.PlatformRuntimeBehavior.thisIsARuntimeBehaviorConstructor = "PlatformBehavior::PlatformBehavior";

gdjs.PlatformRuntimeBehavior.LADDER = 2;
gdjs.PlatformRuntimeBehavior.JUMPTHRU = 1;
gdjs.PlatformRuntimeBehavior.NORMALPLAFTORM = 0;

gdjs.PlatformRuntimeBehavior.prototype.ownerRemovedFromScene = function() {
	if ( this._manager && this._registeredInManager ) this._manager.removePlatform(this);
};

gdjs.PlatformRuntimeBehavior.prototype.doStepPreEvents = function(runtimeScene) {

    //Scene change is not supported
    /*if ( parentScene != &scene ) //Parent scene has changed
    {
        if ( sceneManager ) //Remove the object from any old scene manager.
            sceneManager->RemovePlatform(this);

        parentScene = &scene;
        sceneManager = parentScene ? &ScenePlatformObjectsManager::managers[&scene] : NULL;
        registeredInManager = false;
    }*/

    //No need for update as we take care of this below.
    /*if ( this._hshgNeedUpdate ) {
        this._manager._platformsHSHG.update();
        this._manager._hshgNeedUpdate = false;
    }*/

    //Make sure the platform is or is not in the platforms manager.
    if (!this.activated() && this._registeredInManager)
    {
        this._manager.removePlatform(this);
        this._registeredInManager = false;
    }
    else if (this.activated() && !this._registeredInManager)
    {
        this._manager.addPlatform(this);
        this._registeredInManager = true;
    }

    //Track changes in size or position
    if (this._oldX !== this.owner.getX() || this._oldY !== this.owner.getY() ||
        this._oldWidth !== this.owner.getWidth() || this._oldHeight !== this.owner.getHeight())
    {
        if ( this._registeredInManager ) {
            this._manager.removePlatform(this);
            this._manager.addPlatform(this);
        }

        this._oldX = this.owner.getX();
        this._oldY = this.owner.getY();
        this._oldWidth = this.owner.getWidth();
        this._oldHeight = this.owner.getHeight();
    }
};

gdjs.PlatformRuntimeBehavior.prototype.doStepPostEvents = function(runtimeScene) {
    //this._manager._hshgNeedUpdate = true; //Useless, see above.
};

gdjs.PlatformRuntimeBehavior.prototype.getAABB = function(){
    return this.owner.getAABB();
};

gdjs.PlatformRuntimeBehavior.prototype.onActivate = function() {
    if (this._registeredInManager) return;

    this._manager.addPlatform(this);
    this._registeredInManager = true;
};

gdjs.PlatformRuntimeBehavior.prototype.onDeActivate = function() {
    if (!this._registeredInManager) return;

    this._manager.removePlatform(this);
    this._registeredInManager = false;
};

gdjs.PlatformRuntimeBehavior.prototype.changePlatformType = function(platformType)
{
    if ( platformType === "Ladder" ) this._platformType = gdjs.PlatformRuntimeBehavior.LADDER;
    else if ( platformType === "Jumpthru" ) this._platformType = gdjs.PlatformRuntimeBehavior.JUMPTHRU;
    else this._platformType = gdjs.PlatformRuntimeBehavior.NORMALPLAFTORM;
};

gdjs.PlatformRuntimeBehavior.prototype.getPlatformType = function()
{
    return this._platformType;
};

gdjs.PlatformRuntimeBehavior.prototype.canBeGrabbed = function()
{
    return this._canBeGrabbed;
};

gdjs.PlatformRuntimeBehavior.prototype.getYGrabOffset = function()
{
    return this._yGrabOffset;
};
