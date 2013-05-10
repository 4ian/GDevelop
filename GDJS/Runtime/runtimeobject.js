
/**
 * The runtimeObject represents an object being used on a RuntimeScene.
 *
 * TODO : automatisms
 *
 * @class runtimeObject
 * @constructor 
 */
gdjs.runtimeObject = function(runtimeScene, objectXml)
{
    var that = {};
    var my = {};
    
    that = {};
    that.name = $(objectXml).attr("nom") || "";
    that.type = $(objectXml).attr("type") || "";
    that.x = 0;
    that.y = 0;
    that.angle = 0;
    that.zOrder = 0;
    my.hidden = false;
    that.layer = "";
    my.id = runtimeScene.createNewUniqueId();
    my.variables = gdjs.variablesContainer();
    my.forces = [];
    
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
    
    //Common properties:
    that.getName = function() {
        return that.name;
    }
    
    that.getUniqueId = function() {
        return my.id;
    }
    
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
    
    /**
     * Get the container of the object variables
     */
    that.getVariables = function() {
        return my.variables;
    }
    
    /**
     * Shortcut to get the value of a variable
     */
    that.getVariableValue = function(name) {
        return my.variables.get(name).getValue();
    }
    
    /**
     * Shortcut to set the value of a variable
     */
    that.setVariableValue = function(name, newValue) {
        return my.variables.get(name).setValue(newValue);
    }
    
    /**
     * Shortcut to test if a variable exists for the object.
     */
    that.hasVariable = function(name) {
        return my.variables.has(name);
    }
    
    that.hide = function(enable) {
        my.hidden = enable;
    }
    
    that.isVisible = function(enable) {
        return !my.hidden;
    }
    
    that.isHidden = function(enable) {
        return my.hidden;
    }
    
    that.getWidth = function() {
        return 0;
    }
    
    that.getHeight = function() {
        return 0;
    }
    
    /**
     * Return the X position of the object center, relative to the object position.
     */
    that.getCenterX = function() {
        return getWidth()/2;
    }
    
    /**
     * Return the Y position of the object center, relative to the object position.
     */
    that.getCenterY = function() {
        return getHeight()/2;
    }
    
    that.addForce = function(x,y, isPermanent) {
        my.forces.push(gdjs.force(x, y, !isPermanent));
    }
    
    that.addPolarForce = function(angle, len, isPermanent) {
        var forceX = Math.cos(angle/180*3.14159)*len;
        var forceY = Math.sin(angle/180*3.14159)*len;
    
        my.forces.push(gdjs.force(forceX, forceY, !isPermanent));
    }
    
    that.addForceTowardPosition = function(x,y, len, isPermanent) {
    
        var angle = Math.atan2(y - (that.getY()+that.getCenterY()), 
                               x - (that.getX()+that.getCenterX()));
        
        var forceX = Math.cos(angle)*len;
        var forceY = Math.sin(angle)*len;
        my.forces.push(gdjs.force(forceX, forceY, !isPermanent));
    }
    
    that.clearForces = function() {
        my.forces = [];
    }
    
    that.hasNoForces = function() {
        return my.forces.length == 0;
    }
    
    that.updateForces = function() {
        for(var i = 0;i<my.forces.length;) {
        
            if ( my.forces[i].isTemporary() ) {
                my.forces.remove(i);
            }
            else {
                ++i;
            }
        }
    }
    
    that.getAverageForce = function() {
        if ( my.forces.length == 0 ) {
            return null;
        }
    
        var averageX = 0;
        var averageY = 0;
        for(var i = 0, len = my.forces.length;i<len;++i) {
            averageX += my.forces[i].getX();
            averageY += my.forces[i].getY();
        }
        averageX /= my.forces.length;
        averageY /= my.forces.length;
        
        var averageForce = gdjs.force(averageX, averageY);
        return averageForce;
    }
    
    that.averageForceAngleIs = function(angle, toleranceInDegrees) {
        
        var averageAngle = that.getAverageForce().getAngle();
        if ( averageAngle < 0 ) averageAngle += 360;
        
        return Math.abs(angle-averageAngle) < toleranceInDegrees/2;
    }
    
    /**
     * Put the object around a position, with a specific distance and angle.
     */
    that.putAround = function(x,y,distance,angleInDegrees) {
        var angle = angleInDegrees/180*3.14159;

        that.setX( x + Math.cos(angle)*distance - that.getCenterX() );
        that.setY( y + Math.sin(angle)*distance - that.getCenterY() );
    }
    
    /**
     * Remove an object from a scene:
     * Just clear the object name and let the scene destroy it after.
     */
    that.deleteFromScene = function(runtimeScene) {
        runtimeScene.markObjectForDeletion(that);
    }
    
    return that;
}
