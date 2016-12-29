/**
GDevelop - Tracked Behavior Extension
Copyright (c) 2013-2016 Florian Rival (Florian.Rival@gmail.com)
 */

/**
 * Manages the tracked objects in a specialized data structure
 * to ensure a fast retrieval of objects near a position.
 *
 * @class TrackedObjectsManager
 * @namespace gdjs
 * @constructor
 */
gdjs.TrackedObjectsManager = function(runtimeScene, sharedData)
{
    this._trackedObjectsRBush = new rbush(9, ['.owner.getAABB().min[0]', '.owner.getAABB().min[1]', '.owner.getAABB().max[0]', '.owner.getAABB().max[1]']);
};

/**
 * Get the tracked objects manager of a scene.
 *
 * @method getManager
 * @static
 */
gdjs.TrackedObjectsManager.getManager = function(runtimeScene) {
    if (!runtimeScene.trackedObjectsManager) { //Create the shared manager if necessary.
        runtimeScene.trackedObjectsManager = new gdjs.TrackedObjectsManager(runtimeScene);
    }

    return runtimeScene.trackedObjectsManager;
};

/**
 * Add an object to the data structure containing the tracked objects.
 *
 * @method addObject
 */
gdjs.TrackedObjectsManager.prototype.addObject = function(trackedBehavior) {
    this._trackedObjectsRBush.insert(trackedBehavior);
};

/**
 * Remove an object being tracked.
 *
 * @method removeObject
 */
gdjs.TrackedObjectsManager.prototype.removeObject = function(trackedBehavior) {
    this._trackedObjectsRBush.remove(trackedBehavior);
};

/**
 * Returns all the tracked objects around the specified position.
 * @method getAllObjectsAround
 */
gdjs.TrackedObjectsManager.prototype.getAllObjectsAround = function(x, y, radius, result) {
    var searchArea = gdjs.staticObject(gdjs.TrackedObjectsManager.prototype.getAllObjectsAround);
    searchArea.minX = x - radius;
    searchArea.minY = y - radius;
    searchArea.maxX = x + radius;
    searchArea.maxY = y + radius;
    var nearbyBehaviors = this._trackedObjectsRBush.search(searchArea);
    result.length = 0;
    result.push.apply(result, nearbyBehaviors);
};

/**
 * TODO
 *
 * @class TrackedRuntimeBehavior
 * @namespace gdjs
 * @constructor
 */
gdjs.TrackedRuntimeBehavior = function(runtimeScene, behaviorData, owner)
{
    gdjs.RuntimeBehavior.call(this, runtimeScene, behaviorData, owner);

    //Note that we can't use getX(), getWidth()... of owner here: The owner is not fully constructed.
    this._oldX = 0;
    this._oldY = 0;
    this._oldWidth = 0;
    this._oldHeight = 0;

	this._manager = gdjs.TrackedObjectsManager.getManager(runtimeScene);
	this._registeredInManager = false;
};

gdjs.TrackedRuntimeBehavior.prototype = Object.create( gdjs.RuntimeBehavior.prototype );
gdjs.TrackedRuntimeBehavior.thisIsARuntimeBehaviorConstructor = "TrackedBehavior::Tracked";

// Count the number of objects with an updated position/size each frame.
// Any update requires the object to be removed/added again in the data structure used
// for spatial hashing and is costly, so this update count should be kept as low as possible.
gdjs.TrackedRuntimeBehavior.updateCount = 0;

gdjs.TrackedRuntimeBehavior.prototype.ownerRemovedFromScene = function() {
	if ( this._manager && this._registeredInManager ) this._manager.removeObject(this);
};

gdjs.TrackedRuntimeBehavior.prototype.doStepPreEvents = function(runtimeScene) {
    //Make sure the object is or is not in the tracked objects manager.
    if (!this.activated() && this._registeredInManager)
    {
        this._manager.removeObject(this);
        this._registeredInManager = false;
    }
    else if (this.activated() && !this._registeredInManager)
    {
        this._manager.addObject(this);
        this._registeredInManager = true;
    }

    //Track changes in size or position
    if (this._oldX !== this.owner.getX() || this._oldY !== this.owner.getY() ||
        this._oldWidth !== this.owner.getWidth() || this._oldHeight !== this.owner.getHeight())
    {
        gdjs.TrackedRuntimeBehavior.updateCount++;
        if ( this._registeredInManager ) {
            this._manager.removeObject(this);
            this._manager.addObject(this);
        }

        this._oldX = this.owner.getX();
        this._oldY = this.owner.getY();
        this._oldWidth = this.owner.getWidth();
        this._oldHeight = this.owner.getHeight();
    }
};

gdjs.TrackedRuntimeBehavior.prototype.doStepPostEvents = function(runtimeScene) {
    gdjs.TrackedRuntimeBehavior.updateCount = 0;
};

gdjs.TrackedRuntimeBehavior.prototype.getAABB = function(){
    return this.owner.getAABB();
};

gdjs.TrackedRuntimeBehavior.prototype.onActivate = function() {
    if (this._registeredInManager) return;

    this._manager.addObject(this);
    this._registeredInManager = true;
};

gdjs.TrackedRuntimeBehavior.prototype.onDeActivate = function() {
    if (!this._registeredInManager) return;

    this._manager.removeObject(this);
    this._registeredInManager = false;
};

gdjs.TrackedRuntimeBehavior.aroundTest = function(runtimeScene, objectsLists, x, y, radius) {
    var hasOneObject = false;
    var nearbyBehaviors = gdjs.staticArray(gdjs.TrackedRuntimeBehavior.aroundTest);
    gdjs.TrackedObjectsManager.getManager(runtimeScene).getAllObjectsAround(x, y, radius, nearbyBehaviors);

    for(var i = 0;i<nearbyBehaviors.length;i++) {
        var object = nearbyBehaviors[i].owner;
        var objectList = objectsLists.get(object.name);

        if (objectList && objectList.indexOf(object) === -1) {
            hasOneObject = true;
            objectList.push(object);
        }
    }

    return hasOneObject;
};

gdjs.TrackedRuntimeBehavior.getUpdateCount = function(runtimeScene) {
    return gdjs.TrackedRuntimeBehavior.updateCount;
}
