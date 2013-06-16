/**
 *  Game Develop JS Platform
 *  2013 Florian Rival (Florian.Rival@gmail.com)
 */

/**
 * @module gdjs.cameraTools
 */
gdjs.cameraTools = gdjs.cameraTools || {};

gdjs.cameraTools.setCameraX = function(runtimeScene, x, layer, cameraId) {
    if ( !runtimeScene.hasLayer(layer) ) { return; }

    runtimeScene.getLayer(layer).setCameraX(x, cameraId);
}

gdjs.cameraTools.setCameraY = function(runtimeScene, y, layer, cameraId) {
    if ( !runtimeScene.hasLayer(layer) ) { return; }

    runtimeScene.getLayer(layer).setCameraY(y, cameraId);
}

gdjs.cameraTools.getCameraX = function(runtimeScene, layer, cameraId) {
    if ( !runtimeScene.hasLayer(layer) ) { return 0; }
    
    return runtimeScene.getLayer(layer).getCameraX();
}

gdjs.cameraTools.getCameraY = function(runtimeScene, layer, cameraId) {
    if ( !runtimeScene.hasLayer(layer) ) { return 0; }

    return runtimeScene.getLayer(layer).getCameraY();
}

gdjs.cameraTools.getCameraWidth = function(runtimeScene, layer, cameraId) {
    if ( !runtimeScene.hasLayer(layer) ) { return 0; }
    
    return runtimeScene.getLayer(layer).getCameraWidth();
}

gdjs.cameraTools.getCameraHeight = function(runtimeScene, layer, cameraId) {
    if ( !runtimeScene.hasLayer(layer) ) { return 0; }

    return runtimeScene.getLayer(layer).getCameraHeight();
}

gdjs.cameraTools.showLayer = function(runtimeScene, layer) {
    if ( !runtimeScene.hasLayer(layer) ) { return; }
    
    return runtimeScene.getLayer(layer).show(true);
}

gdjs.cameraTools.hideLayer = function(runtimeScene, layer) {
    if ( !runtimeScene.hasLayer(layer) ) { return; }

    return runtimeScene.getLayer(layer).show(false);
}

gdjs.cameraTools.layerIsVisible = function(runtimeScene, layer) {
    return runtimeScene.hasLayer(layer) && runtimeScene.getLayer(layer).isVisible();
}

gdjs.cameraTools.setCameraRotation = function(runtimeScene, rotation, layer, cameraId) {
    if ( !runtimeScene.hasLayer(layer) ) { return; }

    return runtimeScene.getLayer(layer).setCameraRotation(rotation, cameraId);
}
gdjs.cameraTools.getCameraRotation = function(runtimeScene, layer, cameraId) {
    if ( !runtimeScene.hasLayer(layer) ) { return 0; }

    return runtimeScene.getLayer(layer).getCameraRotation(cameraId);
}

gdjs.cameraTools.setCameraZoom = function(runtimeScene, newZoom, layer, cameraId) {
    if ( !runtimeScene.hasLayer(layer) ) { return; }

    return runtimeScene.getLayer(layer).setCameraZoom(newZoom, cameraId);
}

gdjs.cameraTools.centerCamera = function(runtimeScene, object, anticipateMove, layer, cameraId) {
    if ( !runtimeScene.hasLayer(layer) || object == null ) { return; }

    var layer = runtimeScene.getLayer(layer);
    var xOffset = 0; var yOffset = 0;
    if ( anticipateMove && !object.hasNoForces() ) {
        var objectAverageForce  = object.getAverageForce();
        xOffset = objectAverageForce.getX()*runtimeScene.getElapsedTime()/1000;
        yOffset = objectAverageForce.getY()*runtimeScene.getElapsedTime()/1000;
    }
    
    layer.setCameraX(object.getX()+object.getCenterX()+xOffset-layer.getCameraWidth(cameraId)/2, cameraId);
    layer.setCameraY(object.getY()+object.getCenterY()+yOffset-layer.getCameraHeight(cameraId)/2, cameraId);
}

gdjs.cameraTools.centerCameraWithinLimits = function(runtimeScene, object, left, top, right, bottom, anticipateMove, layer, cameraId) {
    if ( !runtimeScene.hasLayer(layer) || object == null ) { return; }

    var layer = runtimeScene.getLayer(layer);
    var xOffset = 0; var yOffset = 0;
    if ( anticipateMove && !object.hasNoForces() ) {
        var objectAverageForce  = object.getAverageForce();
        xOffset = objectAverageForce.getX()*runtimeScene.getElapsedTime()/1000;
        yOffset = objectAverageForce.getY()*runtimeScene.getElapsedTime()/1000;
    }
    
    var newX = Math.min(Math.max(object.getX()+object.getCenterX()+xOffset-layer.getCameraWidth(cameraId)/2, left), right-layer.getCameraWidth(cameraId));
    var newY = Math.min(Math.max(object.getY()+object.getCenterY()+yOffset-layer.getCameraHeight(cameraId)/2, top), bottom-layer.getCameraHeight(cameraId));
    
    console.log(newX);
    
    layer.setCameraX(newX, cameraId);
    layer.setCameraY(newY, cameraId);
}