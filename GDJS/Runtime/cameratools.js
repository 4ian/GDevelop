/**
 * @module gdjs.cameraTools
 */
gdjs.cameraTools = gdjs.cameraTools || {};

gdjs.cameraTools.setCameraX = function(runtimeScene, x, layer, cameraId) {

    if ( !runtimeScene.hasLayer(layer) ) {
        return;
    }

    runtimeScene.getLayer(layer).setCameraX(x, cameraId);
}

gdjs.cameraTools.setCameraY = function(runtimeScene, y, layer, cameraId) {

    if ( !runtimeScene.hasLayer(layer) ) {
        return;
    }

    runtimeScene.getLayer(layer).setCameraY(y, cameraId);
}

gdjs.cameraTools.getCameraX = function(runtimeScene, layer, cameraId) {

    if ( !runtimeScene.hasLayer(layer) ) {
        return 0;
    }

    return runtimeScene.getLayer(layer).getCameraX();
}

gdjs.cameraTools.getCameraY = function(runtimeScene, layer, cameraId) {

    if ( !runtimeScene.hasLayer(layer) ) {
        return 0;
    }

    return runtimeScene.getLayer(layer).getCameraY();
}