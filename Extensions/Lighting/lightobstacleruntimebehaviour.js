gdjs.LightObstaclesManager = function (runtimeScene, sharedData) {
    this._obstacleRBush = new rbush(9, ['.owner.getAABB().min[0]', '.owner.getAABB().min[1]', '.owner.getAABB().max[0]', '.owner.getAABB().max[1]']);
}

gdjs.LightObstaclesManager.getManager = function(runtimeScene) {
    if (!runtimeScene.lightObstaclesManager) { //Create the shared manager if necessary.
        runtimeScene.lightObstaclesManager = new gdjs.LightObstaclesManager(runtimeScene);
    }

    return runtimeScene.lightObstaclesManager;
};