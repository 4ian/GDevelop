/**
Game Develop - Pathfinding Automatism Extension
Copyright (c) 2013-2014 Florian Rival (Florian.Rival@gmail.com)
 */

/**
 * PathfindingObstaclesManager manages the common objects shared by objects having a
 * pathfinding automatism: In particular, the obstacles automatisms are required to declare
 * themselves ( see gdjs.PathfindingObstaclesManager.addObstacle ) to the manager of their associated scene
 * ( see gdjs.PathfindingRuntimeAutomatism.obstaclesManagers ).
 *
 * @class PathfindingObstaclesManager
 * @namespace gdjs
 * @constructor
 */
gdjs.PathfindingObstaclesManager = function(runtimeScene)
{
    this._obstaclesHSHG = new gdjs.HSHG.HSHG();
    //this._hshgNeedUpdate = true; Useless: The automatisms track by themselves changes in objects size or position.
};

/**
 * Add a obstacle to the list of existing obstacles.
 *
 * @method addObstacle
 */
gdjs.PathfindingObstaclesManager.prototype.addObstacle = function(pathfindingObstacleAutomatism) {
    this._obstaclesHSHG.addObject(pathfindingObstacleAutomatism);
};

/**
 * Remove a obstacle from the list of existing obstacles. Be sure that the obstacle was
 * added before.
 *
 * @method removeObstacle
 */
gdjs.PathfindingObstaclesManager.prototype.removeObstacle = function(pathfindingObstacleAutomatism) {
    this._obstaclesHSHG.removeObject(pathfindingObstacleAutomatism);
};

/**
 * Tool class which represents a simple point with a radius and a getAABB method.
 * @class Vertex
 * @namespace gdjs.PathfindingObstaclesManager
 * @private
 * @constructor
 */
gdjs.PathfindingObstaclesManager.Vertex = function(x,y,radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
};

/**
 * Return an axis aligned bouding box for the vertex.
 * @method getAABB
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
 * @method getAllObstaclesAround
 */
gdjs.PathfindingObstaclesManager.prototype.getAllObstaclesAround = function(x, y, radius, result) {
    var vertex = new gdjs.PathfindingObstaclesManager.Vertex(x,y, radius);
    this._obstaclesHSHG.addObject(vertex);
    var obstaclesCollidingWithVertex = this._obstaclesHSHG.queryForCollisionWith(vertex);
    this._obstaclesHSHG.removeObject(vertex);

    if ( result === undefined )
        return obstaclesCollidingWithVertex;
    else {
        //Clean the result object
        for(var k in result) {
            if ( result.hasOwnProperty(k) )
                delete result[k];
        }

        //Insert obstacles
        for(var i = 0; i < obstaclesCollidingWithVertex.length; ++i) {
            result[obstaclesCollidingWithVertex[i].owner.id] = obstaclesCollidingWithVertex[i];
        }

        return;
    }
};

/**
 * PathfindingObstacleRuntimeAutomatism represents an automatism allowing objects to be
 * considered as a obstacle by objects having Pathfinding Automatism.
 *
 * @class PathfindingObstacleRuntimeAutomatism
 * @namespace gdjs
 * @constructor
 */
gdjs.PathfindingObstacleRuntimeAutomatism = function(runtimeScene, automatismData, owner)
{
    gdjs.RuntimeAutomatism.call(this, runtimeScene, automatismData, owner);

    //Load the automatism
    this._impassable = automatismData.impassable;
    this._cost = automatismData.cost;
    this._oldX = 0; //Note that we can't use getX(), getWidth()... of owner here:
    this._oldY = 0; //The owner is not yet fully constructed.
    this._oldWidth = 0;
    this._oldHeight = 0;

	//Create the shared manager if necessary.
	if ( !gdjs.PathfindingObstacleRuntimeAutomatism.obstaclesManagers.containsKey(runtimeScene.getName()) ) {
		var manager = new gdjs.PathfindingObstaclesManager(runtimeScene);
		gdjs.PathfindingObstacleRuntimeAutomatism.obstaclesManagers.put(runtimeScene.getName(), manager);
	}
	this._manager = gdjs.PathfindingObstacleRuntimeAutomatism.obstaclesManagers.get(runtimeScene.getName());

	this._registeredInManager = false;
};

gdjs.PathfindingObstacleRuntimeAutomatism.prototype = Object.create( gdjs.RuntimeAutomatism.prototype );
gdjs.PathfindingObstacleRuntimeAutomatism.thisIsARuntimeAutomatismConstructor = "PathfindingAutomatism::PathfindingObstacleAutomatism";
gdjs.PathfindingObstacleRuntimeAutomatism.obstaclesManagers = new Hashtable();

gdjs.PathfindingObstacleRuntimeAutomatism.prototype.ownerRemovedFromScene = function() {
	if ( this._manager && this._registeredInManager ) this._manager.removeObstacle(this);
};

gdjs.PathfindingObstacleRuntimeAutomatism.prototype.doStepPreEvents = function(runtimeScene) {

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

gdjs.PathfindingObstacleRuntimeAutomatism.prototype.doStepPostEvents = function(runtimeScene) {
    //this._manager._hshgNeedUpdate = true; //Useless, see above.
};

gdjs.PathfindingObstacleRuntimeAutomatism.prototype.getAABB = function(){
    return this.owner.getAABB();
};

gdjs.PathfindingObstacleRuntimeAutomatism.prototype.onActivate = function() {
    this._manager.addObstacle(this);
    this._registeredInManager = true;
};

gdjs.PathfindingObstacleRuntimeAutomatism.prototype.onDeActivate = function() {
    this._manager.removeObstacle(this);
    this._registeredInManager = false;
};

gdjs.PathfindingObstacleRuntimeAutomatism.prototype.getCost = function() {
    return this._cost;
};

gdjs.PathfindingObstacleRuntimeAutomatism.prototype.setCost = function(cost) {
    this._cost = cost;
};

gdjs.PathfindingObstacleRuntimeAutomatism.prototype.isImpassable = function() {
    return this._impassable;
};

gdjs.PathfindingObstacleRuntimeAutomatism.prototype.setImpassable = function(impassable) {
    this._impassable = impassable;
};