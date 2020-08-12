/**
 * @memberof gdjs
 * @class LightObstaclesManager
 * @param {gdjs.RuntimeScene} runtimeScene
 */
gdjs.LightObstaclesManager = function (runtimeScene) {
  this._obstacleRBush = new rbush(9, [
    '.owner.getAABB().min[0]',
    '.owner.getAABB().min[1]',
    '.owner.getAABB().max[0]',
    '.owner.getAABB().max[1]',
  ]);
};

/**
 * Get the light obstacles manager of a scene.
 * @param {gdjs.RuntimeScene} runtimeScene
 * @returns {gdjs.LightObstaclesManager}
 */
gdjs.LightObstaclesManager.getManager = function (runtimeScene) {
  if (!runtimeScene._lightObstaclesManager) {
    // Create the shared manager if necessary.
    runtimeScene._lightObstaclesManager = new gdjs.LightObstaclesManager(
      runtimeScene
    );
  }

  return runtimeScene._lightObstaclesManager;
};

/**
 * Add a light obstacle to the list of existing obstacles.
 * @param {gdjs.LightObstacleRuntimeBehavior} obstacle
 */
gdjs.LightObstaclesManager.prototype.addObstacle = function (obstacle) {
  this._obstacleRBush.insert(obstacle);
};

/**
 * Remove a light obstacle from the list of existing obstacles. Be sure that the obstacle was
 * added before.
 * @param {gdjs.LightObstacleRuntimeBehavior} obstacle
 */
gdjs.LightObstaclesManager.prototype.removeObstacle = function (obstacle) {
  this._obstacleRBush.remove(obstacle);
};

/**
 * Returns all the light obstacles around the specified object.
 * @param {gdjs.RuntimeObject} object The object
 * @param {number} radius Radius of the area to be searched.
 * @param {gdjs.RuntimeObject[]} result An array with all obstacles near the object.
 */
gdjs.LightObstaclesManager.prototype.getAllObstaclesAround = function (
  object,
  radius,
  result
) {
  // TODO: This would better be done using the object AABB (getAABB), as (`getCenterX`;`getCenterY`) point
  // is not necessarily in the middle of the object (for sprites for example).
  var x = object.getX();
  var y = object.getY();

  var searchArea = gdjs.staticObject(
    gdjs.LightObstaclesManager.prototype.getAllObstaclesAround
  );
  searchArea.minX = x - radius;
  searchArea.minY = y - radius;
  searchArea.maxX = x + radius;
  searchArea.maxY = y + radius;
  var nearbyObstacles = this._obstacleRBush.search(searchArea);
  result.length = 0;
  result.push.apply(result, nearbyObstacles);
};

/**
 * @memberof gdjs
 * @class LightObstacleRuntimeBehavior
 * @param {gdjs.RuntimeScene} runtimeScene
 * @param {BehaviorData} behaviorData
 * @param {gdjs.RuntimeObject} owner
 */
gdjs.LightObstacleRuntimeBehavior = function (
  runtimeScene,
  behaviorData,
  owner
) {
  gdjs.RuntimeBehavior.call(this, runtimeScene, behaviorData, owner);

  this._oldX = 0;
  this._oldY = 0;
  this._oldWidth = 0;
  this._oldHeight = 0;
  this._manager = gdjs.LightObstaclesManager.getManager(runtimeScene);
  this._registeredInManager = false;
};

gdjs.LightObstacleRuntimeBehavior.prototype = Object.create(
  gdjs.RuntimeBehavior.prototype
);
gdjs.registerBehavior(
  'Lighting::LightObstacleBehavior',
  gdjs.LightObstacleRuntimeBehavior
);

gdjs.LightObstacleRuntimeBehavior.prototype.doStepPreEvents = function (
  runtimeScene
) {
  // Make sure the obstacle is or is not in the obstacles manager.
  if (!this.activated() && this._registeredInManager) {
    this._manager.removeObstacle(this);
    this._registeredInManager = false;
  } else if (this.activated() && !this._registeredInManager) {
    this._manager.addObstacle(this);
    this._registeredInManager = true;
  }

  //Track changes in size or position
  if (
    this._oldX !== this.owner.getX() ||
    this._oldY !== this.owner.getY() ||
    this._oldWidth !== this.owner.getWidth() ||
    this._oldHeight !== this.owner.getHeight()
  ) {
    if (this._registeredInManager) {
      this._manager.removeObstacle(this);
      this._manager.addObstacle(this);
    }
    this._oldX = this.owner.getX();
    this._oldY = this.owner.getY();
    this._oldWidth = this.owner.getWidth();
    this._oldHeight = this.owner.getHeight();
  }
};

gdjs.LightObstacleRuntimeBehavior.prototype.onDestroy = function () {
  if (this._manager && this._registeredInManager)
    this._manager.removeObstacle(this);
};

gdjs.LightObstacleRuntimeBehavior.prototype.onActivate = function () {
  if (this._registeredInManager) return;

  this._manager.addObstacle(this);
  this._registeredInManager = true;
};

gdjs.LightObstacleRuntimeBehavior.prototype.onDeActivate = function () {
  if (!this._registeredInManager) return;

  this._manager.removeObstacle(this);
  this._registeredInManager = false;
};
