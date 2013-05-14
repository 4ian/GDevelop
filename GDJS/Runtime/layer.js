
/**
 * Represents a layer used to display objects.<br>
 * The layer connects its Pixi container to the Pixi stage during its construction,
 * but then its objects responsibility to connect themselves to the layer's container
 * ( See getPIXIContainer method ).
 * 
 * TODO : Viewports and support for multiple cameras
 *
 * @class layer
 */
gdjs.layer = function(name, pixiStage)
{
    var that = {};
    var my = {};
    
    my.name = name;
    my.cameraX = 0;
    my.cameraY = 0;
    my.pixiStage = pixiStage;
    my.pixiContainer = new PIXI.DisplayObjectContainer();
    
    my.pixiStage.addChild(my.pixiContainer);

    that.getName = function() {
        return my.name;
    }
    
    that.getPIXIContainer = function() {
        return my.pixiContainer;
    }
    
    that.getCameraX = function(cameraId) {
        return my.cameraX;
    }
    
    that.getCameraY = function(cameraId) {
        return my.cameraY;
    }
    
    that.setCameraX = function(x, cameraId) {
        my.cameraX = x;
        my.pixiContainer.position.x = -my.cameraX;
    }
    
    that.setCameraY = function(y, cameraId) {
        my.cameraY = y;
        my.pixiContainer.position.y = -my.cameraY;
    }
    
    return that;
}