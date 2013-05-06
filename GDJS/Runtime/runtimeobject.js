
/**
 * The runtimeObject represents an object being used on a RuntimeScene.
 *
 * TODO : Forces, automatisms, variables, visiblity
 *
 * @class runtimeObject
 * @constructor 
 */
gdjs.runtimeObject = function(runtimeScene, objectXml)
{
    var that;
    
    that = {};
    that.name = $(objectXml).attr("nom") || "";
    that.type = $(objectXml).attr("type") || "";
    that.x = 0;
    that.y = 0;
    that.angle = 0;
    that.zOrder = 0;
    that.hidden = false;
    that.layer = "";
    
    //Common members functions related to the object and its runtimeScene :
    
    /**
     * Called each time the scene is rendered.
     *
     * @method updateTime
     * @param elapsedTime The time elapsedTime since the last frame, in milliseconds.
     */
    that.updateTime = function(elapsedTime) {
        //Nothing to do.
    }
    
    /**
     * Called when the object is removed from a scene.
     *
     * @method removeFromScene
     * @param runtimeScene The scene that used to own the object.
     */
    that.removeFromScene = function(runtimeScene) {
        //Nothing to do.
    }
    
    //Common properties:
    
    that.setPosition = function(x,y) {
        that.setX(x);
        that.setY(y);
    }
    
    that.setX = function(x) {
        that.x = x;
    }
    
    that.getX = function() {
        return that.x;
    }
    
    that.setY = function(y) {
        that.y = y;
    }
    
    that.getY = function() {
        return that.y;
    }
    
    that.setZOrder = function(z) {
        that.zOrder = z;
    }
    
    that.getZOrder = function() {
        return that.zOrder;
    }
    
    that.setAngle = function(angle) {
        that.angle = angle;
    }
    
    that.getAngle = function() {
        return that.angle;
    }
    
    that.setLayer = function(layer) {
        that.layer = layer;
    }
    
    that.getLayer = function() {
        return that.layer;
    }
    
    that.isOnLayer = function(layer) {
        return that.layer === layer;
    }
    
    return that;
}
