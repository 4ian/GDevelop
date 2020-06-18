gdjs.LightObstaclesManager = function (runtimeScene, sharedData) {
  this._obstacleRBush = new rbush(9, [
    '.owner.getAABB().min[0]',
    '.owner.getAABB().min[1]',
    '.owner.getAABB().max[0]',
    '.owner.getAABB().max[1]',
  ]);
};

gdjs.LightObstaclesManager.getManager = function (runtimeScene) {
  if (!runtimeScene.lightObstaclesManager) {
    //Create the shared manager if necessary.
    runtimeScene.lightObstaclesManager = new gdjs.LightObstaclesManager(
      runtimeScene
    );
  }

  return runtimeScene.lightObstaclesManager;
};

gdjs.LightObstaclesManager.prototype.addObstacle = function(obstacle) {
  this._obstacleRBush.insert(obstacle);
};

gdjs.LightObstaclesManager.prototype.removeObstacle = function(obstacle) {
  this._obstacleRBush.remove(obstacle);
};

gdjs.LightObstaclesManager.prototype.getAllObstaclesAround = function(
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
  var nearbyPlatforms = this._obstacleRBush.search(searchArea);
  result.length = 0;
  result.push.apply(result, nearbyPlatforms);
};

gdjs.LightObstacleRuntimeBehavior = function (
  runtimeScene,
  behaviorData,
  owner
) {
  gdjs.RuntimeBehavior.call(this, runtimeScene, behaviorData, owner);

  this._oldX = 0;
  this._oldY = 0;

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

gdjs.LightObstacleRuntimeBehavior.prototype.onDeActivate = function() {};

gdjs.LightObstacleRuntimeBehavior.prototype.doStepPreEvents = function(
  runtimeScene
) {
  // This is run at every frame, before events are launched.
  // Make sure the platform is or is not in the platforms manager.
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
    this._oldY !== this.owner.getY()
  ) {
    if (this._registeredInManager) {
      this._manager.removeObstacle(this);
      this._manager.addObstacle(this);
    }
    this._oldX = this.owner.getX();
    this._oldY = this.owner.getY();
  }
};

gdjs.LightObstacleRuntimeBehavior.prototype.doStepPostEvents = function(
  runtimeScene
) {
  // This is run at every frame, after events are launched.
};
