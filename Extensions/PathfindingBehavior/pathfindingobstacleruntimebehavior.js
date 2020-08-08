/**
GDevelop - Pathfinding Behavior Extension
Copyright (c) 2013-2016 Florian Rival (Florian.Rival@gmail.com)
 */

/**
 * PathfindingObstaclesManager manages the common objects shared by objects having a
 * pathfinding behavior: In particular, the obstacles behaviors are required to declare
 * themselves ( see gdjs.PathfindingObstaclesManager.addObstacle ) to the manager of their associated scene
 * ( see gdjs.PathfindingRuntimeBehavior.obstaclesManagers ).
 *
 * @class PathfindingObstaclesManager
 * @memberof gdjs
 */
gdjs.PathfindingObstaclesManager = function(runtimeScene)
{
    this._obstaclesHSHG = new gdjs.HSHG.HSHG();
    //this._hshgNeedUpdate = true; Useless: The behaviors track by themselves changes in objects size or position.
};

/**
 * Get the obstacles manager of a scene.
 */
gdjs.PathfindingObstaclesManager.getManager = function(runtimeScene) {
    if (!runtimeScene.pathfindingObstaclesManager) { //Create the shared manager if necessary.
        runtimeScene.pathfindingObstaclesManager = new gdjs.PathfindingObstaclesManager(runtimeScene);
    }

    return runtimeScene.pathfindingObstaclesManager;
};

/**
 * Add a obstacle to the list of existing obstacles.
 */
gdjs.PathfindingObstaclesManager.prototype.addObstacle = function(pathfindingObstacleBehavior) {
    this._obstaclesHSHG.addObject(pathfindingObstacleBehavior);
};

/**
 * Remove a obstacle from the list of existing obstacles. Be sure that the obstacle was
 * added before.
 */
gdjs.PathfindingObstaclesManager.prototype.removeObstacle = function(pathfindingObstacleBehavior) {
    this._obstaclesHSHG.removeObject(pathfindingObstacleBehavior);
};

/**
 * Tool class which represents a simple point with a radius and a getAABB method.
 * @class Vertex
 * @memberof gdjs.PathfindingObstaclesManager
 * @private
 */
gdjs.PathfindingObstaclesManager.Vertex = function(x,y,radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
};

/**
 * Return an axis aligned bouding box for the vertex.
 */
gdjs.PathfindingObstaclesManager.Vertex.prototype.getAABB = function(){
    var rad = this.radius, x = this.x, y = this.y;
    return this.aabb = { min: [ x - rad, y - rad ], max: [ x + rad, y + rad ] };
};

/**
 * Returns all the obstacles around the specified position.
 * @param x X position
 * @param y Y position
 * @param radius The radius of the search
 * @param result If defined, the obstacles near the object will be inserted into result (Using the identifier of their owner object as key).
 * @return If result is not defined, an array with all obstacles near the position. Otherwise, nothing is returned.
 */
gdjs.PathfindingObstaclesManager.prototype.getAllObstaclesAround = function(x, y, radius, result) {
    var vertex = new gdjs.PathfindingObstaclesManager.Vertex(x,y, radius);
    this._obstaclesHSHG.addObject(vertex);
    this._obstaclesHSHG.queryForCollisionWith(vertex, result);
    this._obstaclesHSHG.removeObject(vertex);
};

/**
 * PathfindingObstacleRuntimeBehavior represents a behavior allowing objects to be
 * considered as a obstacle by objects having Pathfinding Behavior.
 *
 * @class PathfindingObstacleRuntimeBehavior
 * @memberof gdjs
 */
gdjs.PathfindingObstacleRuntimeBehavior = function(runtimeScene, behaviorData, owner)
{
    gdjs.RuntimeBehavior.call(this, runtimeScene, behaviorData, owner);

    //Load the behavior
    this._impassable = behaviorData.impassable;
    this._cost = behaviorData.cost;
    this._oldX = 0; //Note that we can't use getX(), getWidth()... of owner here:
    this._oldY = 0; //The owner is not yet fully constructed.
    this._oldWidth = 0;
    this._oldHeight = 0;
    this._manager = gdjs.PathfindingObstaclesManager.getManager(runtimeScene);
	this._registeredInManager = false;
};

gdjs.PathfindingObstacleRuntimeBehavior.prototype = Object.create( gdjs.RuntimeBehavior.prototype );
gdjs.registerBehavior("PathfindingBehavior::PathfindingObstacleBehavior", gdjs.PathfindingObstacleRuntimeBehavior);

gdjs.PathfindingObstacleRuntimeBehavior.prototype.updateFromBehaviorData = function(oldBehaviorData, newBehaviorData) {
    if (oldBehaviorData.impassable !== newBehaviorData.impassable) {
        this.setImpassable(newBehaviorData.impassable);
    }
    if (oldBehaviorData.cost !== newBehaviorData.cost) {
        this.setCost(newBehaviorData.cost);
    }

    return true;
};

gdjs.PathfindingObstacleRuntimeBehavior.prototype.onDestroy = function() {
	if ( this._manager && this._registeredInManager ) this._manager.removeObstacle(this);
};

gdjs.PathfindingObstacleRuntimeBehavior.prototype.doStepPreEvents = function(runtimeScene) {

    //Scene change is not supported
    /*if ( parentScene != &scene ) //Parent scene has changed
    {
        if ( sceneManager ) //Remove the object from any old scene manager.
            sceneManager->RemoveObstacle(this);

        parentScene = &scene;
        sceneManager = parentScene ? &ScenePathfindingObstaclesManager::managers[&scene] : NULL;
        registeredInManager = false;
    }*/

    //No need for update as we take care of this below.
    /*if ( this._hshgNeedUpdate ) {
        this._manager._obstaclesHSHG.update();
        this._manager._hshgNeedUpdate = false;
    }*/

    //Make sure the obstacle is or is not in the obstacles manager.
    if (!this.activated() && this._registeredInManager)
    {
        this._manager.removeObstacle(this);
        this._registeredInManager = false;
    }
    else if (this.activated() && !this._registeredInManager)
    {
        this._manager.addObstacle(this);
        this._registeredInManager = true;
    }

    //Track changes in size or position
    if (this._oldX !== this.owner.getX() || this._oldY !== this.owner.getY() ||
        this._oldWidth !== this.owner.getWidth() || this._oldHeight !== this.owner.getHeight())
    {
        if ( this._registeredInManager ) {
            this._manager.removeObstacle(this);
            this._manager.addObstacle(this);
        }

        this._oldX = this.owner.getX();
        this._oldY = this.owner.getY();
        this._oldWidth = this.owner.getWidth();
        this._oldHeight = this.owner.getHeight();
    }
};

gdjs.PathfindingObstacleRuntimeBehavior.prototype.doStepPostEvents = function(runtimeScene) {
    //this._manager._hshgNeedUpdate = true; //Useless, see above.
};

gdjs.PathfindingObstacleRuntimeBehavior.prototype.getAABB = function(){
    return this.owner.getAABB();
};

gdjs.PathfindingObstacleRuntimeBehavior.prototype.onActivate = function() {
    if (this._registeredInManager) return;

    this._manager.addObstacle(this);
    this._registeredInManager = true;
};

gdjs.PathfindingObstacleRuntimeBehavior.prototype.onDeActivate = function() {
    if (!this._registeredInManager) return;

    this._manager.removeObstacle(this);
    this._registeredInManager = false;
};

gdjs.PathfindingObstacleRuntimeBehavior.prototype.getCost = function() {
    return this._cost;
};

gdjs.PathfindingObstacleRuntimeBehavior.prototype.setCost = function(cost) {
    this._cost = cost;
};

gdjs.PathfindingObstacleRuntimeBehavior.prototype.isImpassable = function() {
    return this._impassable;
};

gdjs.PathfindingObstacleRuntimeBehavior.prototype.setImpassable = function(impassable) {
    this._impassable = impassable;
};
