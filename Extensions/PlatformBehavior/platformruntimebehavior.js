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
 * @memberof gdjs
 */
gdjs.PlatformObjectsManager = function(runtimeScene, sharedData)
{
    this._platformRBush = new rbush(9, ['.owner.getAABB().min[0]', '.owner.getAABB().min[1]', '.owner.getAABB().max[0]', '.owner.getAABB().max[1]']);
};

/**
 * Get the platforms manager of a scene.
 */
gdjs.PlatformObjectsManager.getManager = function(runtimeScene) {
    if (!runtimeScene.platformsObjectsManager) { //Create the shared manager if necessary.
        runtimeScene.platformsObjectsManager = new gdjs.PlatformObjectsManager(runtimeScene);
    }

    return runtimeScene.platformsObjectsManager;
};

/**
 * Add a platform to the list of existing platforms.
 */
gdjs.PlatformObjectsManager.prototype.addPlatform = function(platformBehavior) {
    this._platformRBush.insert(platformBehavior);
};

/**
 * Remove a platform from the list of existing platforms. Be sure that the platform was
 * added before.
 */
gdjs.PlatformObjectsManager.prototype.removePlatform = function(platformBehavior) {
    this._platformRBush.remove(platformBehavior);
};

/**
 * Returns all the platforms around the specified object.
 * @param {gdjs.RuntimeObject} object The object
 * @param {number} maxMovementLength The maximum distance, in pixels, the object is going to do.
 * @return An array with all platforms near the object.
 */
gdjs.PlatformObjectsManager.prototype.getAllPlatformsAround = function(object, maxMovementLength, result) {
    // TODO: This would better be done using the object AABB (getAABB), as (`getCenterX`;`getCenterY`) point
    // is not necessarily in the middle of the object (for sprites for example).
    var ow = object.getWidth();
    var oh = object.getHeight();
    var x = object.getDrawableX()+object.getCenterX();
    var y = object.getDrawableY()+object.getCenterY();

    var searchArea = gdjs.staticObject(gdjs.PlatformObjectsManager.prototype.getAllPlatformsAround);
    searchArea.minX = x - ow / 2 - maxMovementLength;
    searchArea.minY = y - oh / 2 - maxMovementLength;
    searchArea.maxX = x + ow / 2 + maxMovementLength;
    searchArea.maxY = y + oh / 2 + maxMovementLength;
    var nearbyPlatforms = this._platformRBush.search(searchArea);
    result.length = 0;
    result.push.apply(result, nearbyPlatforms);
};

/**
 * PlatformRuntimeBehavior represents a behavior allowing objects to be
 * considered as a platform by objects having PlatformerObject Behavior.
 *
 * @class PlatformRuntimeBehavior
 * @memberof gdjs
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
gdjs.registerBehavior("PlatformBehavior::PlatformBehavior", gdjs.PlatformRuntimeBehavior);

gdjs.PlatformRuntimeBehavior.LADDER = 2;
gdjs.PlatformRuntimeBehavior.JUMPTHRU = 1;
gdjs.PlatformRuntimeBehavior.NORMALPLAFTORM = 0;

gdjs.PlatformRuntimeBehavior.prototype.onDestroy = function() {
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
