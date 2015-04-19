/**
GDevelop - Platform Automatism Extension
Copyright (c) 2013-2015 Florian Rival (Florian.Rival@gmail.com)
 */

/**
 * PlatformObjectsManager manages the common objects shared by objects having a
 * platform automatism: In particular, the platforms automatisms are required to declare
 * themselves ( see gdjs.PlatformObjectsManager.addPlatform ) to the manager of their associated scene
 * ( see gdjs.PlatformRuntimeAutomatism.platformsObjectsManagers ).
 *
 * @class PlatformObjectsManager
 * @namespace gdjs
 * @constructor
 */
gdjs.PlatformObjectsManager = function(runtimeScene, sharedData)
{
    this._platformsHSHG = new gdjs.HSHG.HSHG();
    //this._hshgNeedUpdate = true; Useless: The automatisms track by themselves changes in objects size or position.
};

/**
 * Add a platform to the list of existing platforms.
 *
 * @method addPlatform
 */
gdjs.PlatformObjectsManager.prototype.addPlatform = function(platformAutomatism) {
    this._platformsHSHG.addObject(platformAutomatism);
};

/**
 * Remove a platform from the list of existing platforms. Be sure that the platform was
 * added before.
 *
 * @method removePlatform
 */
gdjs.PlatformObjectsManager.prototype.removePlatform = function(platformAutomatism) {
    this._platformsHSHG.removeObject(platformAutomatism);
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
};

/**
 * Return an axis aligned bouding box for the vertex.
 * @method getAABB
 */
gdjs.PlatformObjectsManager.Vertex.prototype.getAABB = function(){
    var rad = this.radius, x = this.x, y = this.y;
    return this.aabb = { min: [ x - rad, y - rad ], max: [ x + rad, y + rad ] };
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

    var vertex = new gdjs.PlatformObjectsManager.Vertex(x,y, objBoundingRadius);
    this._platformsHSHG.addObject(vertex);
    var platformsCollidingWithVertex = this._platformsHSHG.queryForCollisionWith(vertex);
    this._platformsHSHG.removeObject(vertex);

    return platformsCollidingWithVertex;
};

/**
 * PlatformRuntimeAutomatism represents an automatism allowing objects to be
 * considered as a platform by objects having PlatformerObject Automatism.
 *
 * @class PlatformRuntimeAutomatism
 * @namespace gdjs
 * @constructor
 */
gdjs.PlatformRuntimeAutomatism = function(runtimeScene, automatismData, owner)
{
    gdjs.RuntimeAutomatism.call(this, runtimeScene, automatismData, owner);

    //Load the platform type
    this._platformType = automatismData.platformType;
    if ( this._platformType == "Ladder" )
        this._platformType = gdjs.PlatformRuntimeAutomatism.LADDER;
    else if ( this._platformType == "Jumpthru" )
        this._platformType = gdjs.PlatformRuntimeAutomatism.JUMPTHRU;
    else
        this._platformType = gdjs.PlatformRuntimeAutomatism.NORMALPLAFTORM;

    //Note that we can't use getX(), getWidth()... of owner here: The owner is not fully constructed.
    this._oldX = 0;
    this._oldY = 0;
    this._oldWidth = 0;
    this._oldHeight = 0;

	//Create the shared manager if necessary.
	if ( !gdjs.PlatformRuntimeAutomatism.platformsObjectsManagers.containsKey(runtimeScene.getName()) ) {
		var manager = new gdjs.PlatformObjectsManager(runtimeScene);
		gdjs.PlatformRuntimeAutomatism.platformsObjectsManagers.put(runtimeScene.getName(), manager);
	}
	this._manager = gdjs.PlatformRuntimeAutomatism.platformsObjectsManagers.get(runtimeScene.getName());

	this._registeredInManager = false;

};

gdjs.PlatformRuntimeAutomatism.prototype = Object.create( gdjs.RuntimeAutomatism.prototype );
gdjs.PlatformRuntimeAutomatism.thisIsARuntimeAutomatismConstructor = "PlatformAutomatism::PlatformAutomatism";
gdjs.PlatformRuntimeAutomatism.platformsObjectsManagers = new Hashtable();

gdjs.PlatformRuntimeAutomatism.LADDER = 2;
gdjs.PlatformRuntimeAutomatism.JUMPTHRU = 1;
gdjs.PlatformRuntimeAutomatism.NORMALPLAFTORM = 0;

gdjs.PlatformRuntimeAutomatism.prototype.ownerRemovedFromScene = function() {
	if ( this._manager && this._registeredInManager ) this._manager.removePlatform(this);
};

gdjs.PlatformRuntimeAutomatism.prototype.doStepPreEvents = function(runtimeScene) {

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

gdjs.PlatformRuntimeAutomatism.prototype.doStepPostEvents = function(runtimeScene) {
    //this._manager._hshgNeedUpdate = true; //Useless, see above.
};

gdjs.PlatformRuntimeAutomatism.prototype.getAABB = function(){
    return this.owner.getAABB();
};

gdjs.PlatformRuntimeAutomatism.prototype.onActivate = function() {
    this._manager.addPlatform(this);
    this._registeredInManager = true;
};

gdjs.PlatformRuntimeAutomatism.prototype.onDeActivate = function() {
    this._manager.removePlatform(this);
    this._registeredInManager = false;
};

gdjs.PlatformRuntimeAutomatism.prototype.changePlatformType = function(platformType)
{
    if ( platformType === "Ladder" ) this._platformType = gdjs.PlatformRuntimeAutomatism.LADDER;
    else if ( platformType === "Jumpthru" ) this._platformType = gdjs.PlatformRuntimeAutomatism.JUMPTHRU;
    else this._platformType = gdjs.PlatformRuntimeAutomatism.NORMALPLAFTORM;
};

gdjs.PlatformRuntimeAutomatism.prototype.getPlatformType = function()
{
    return this._platformType;
};
