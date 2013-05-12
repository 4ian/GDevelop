
/**
 * The runtimeObject represents an object being used on a RuntimeScene.
 *
 * <b>TODO</b> : automatisms
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
     * @param elapsedTime {Number} The time elapsedTime since the last frame, in milliseconds.
     */
    that.updateTime = function(elapsedTime) {
        //Nothing to do.
    }
    
    //Common properties:
    
    /**
     * Get the name of the object.
     * @method getName
     * @return {String} The object's name.
     */
    that.getName = function() {
        return that.name;
    }
    
    /**
     * Get the unique identifier of the object.<br>
     * The identifier is set by the runtimeScene owning the object. 
     *
     * @method getUniqueId
     * @return {Number} The object identifier
     */
    that.getUniqueId = function() {
        return my.id;
    }
    
    /**
     * Set the position of the object.
     *
     * @method setPosition
     * @param x {Number} The new X position
     * @param y {Number} The new Y position
     */
    that.setPosition = function(x,y) {
        that.setX(x);
        that.setY(y);
    }
    
    /**
     * Set the X position of the object.
     *
     * @method setX
     * @param x {Number} The new X position
     */
    that.setX = function(x) {
        that.x = x;
    }
    
    /**
     * Get the X position of the object.
     *
     * @method getX
     * @return {Number} The X position of the object
     */
    that.getX = function() {
        return that.x;
    }
    
    /**
     * Set the Y position of the object.
     *
     * @method setY
     * @param y {Number} The new Y position
     */
    that.setY = function(y) {
        that.y = y;
    }
    
    /**
     * Get the Y position of the object.
     *
     * @method getY
     * @return {Number} The Y position of the object
     */
    that.getY = function() {
        return that.y;
    }
    
    /**
     * Set the Z order of the object.
     *
     * @method setZOrder
     * @param z {Number} The new Z order position of the object
     */
    that.setZOrder = function(z) {
        that.zOrder = z;
    }
    
    /**
     * Get the Z order of the object.
     *
     * @method getZOrder
     * @return {Number} The Z order of the object
     */
    that.getZOrder = function() {
        return that.zOrder;
    }
    
    /**
     * Set the angle of the object.
     *
     * @method setAngle
     * @param angle {Number} The new angle of the object
     */
    that.setAngle = function(angle) {
        that.angle = angle;
    }
    
    /**
     * Get the rotation of the object.
     *
     * @method getAngle
     * @return {Number} The rotation of the object
     */
    that.getAngle = function() {
        return that.angle;
    }
    
    /**
     * Set the layer of the object.
     *
     * @method setLayer
     * @return {String} The new layer of the object
     */
    that.setLayer = function(layer) {
        that.layer = layer;
    }
    
    /**
     * Get the layer of the object.
     *
     * @method getLayer
     * @return {String} The layer of the object
     */
    that.getLayer = function() {
        return that.layer;
    }
    
    /**
     * Return true if the object is on the specified layer
     *
     * @method isOnLayer
     * @param layer {String} The layer to be tested.
     * @return {Boolean} true if the object is on the specified layer
     */
    that.isOnLayer = function(layer) {
        return that.layer === layer;
    }
    
    /**
     * Get the container of the object variables
     * @method getVariables
     * @return {variablesContainer} The variables of the object
     */
    that.getVariables = function() {
        return my.variables;
    }
    
    /**
     * Shortcut to get the value of a variable
     * @method getVariableValue
     * @return The value of the specified variable
     */
    that.getVariableValue = function(name) {
        return my.variables.get(name).getValue();
    }
    
    /**
     * Shortcut to set the value of a variable
     * @method setVariableValue
     * @param name {String} The variable to be changed
     * @param newValue {Any} The value to be set
     */
    that.setVariableValue = function(name, newValue) {
        return my.variables.get(name).setValue(newValue);
    }
    
    /**
     * Shortcut to test if a variable exists for the object.
     * @method hasVariable
     * @param name {String} The variable to be tested
     */
    that.hasVariable = function(name) {
        return my.variables.has(name);
    }
    
    /**
     * Hide or show the object
     * @method hide
     * @param enable {Boolean} Set it to true to hide the object, false to show it.
     */
    that.hide = function(enable) {
        my.hidden = enable;
    }
    
    /**
     * Return true if the object is not hidden.
     * @method isVisible
     * @return {Boolean} true if the object is not hidden.
     */
    that.isVisible = function(enable) {
        return !my.hidden;
    }
    
    /**
     * Return true if the object is hidden.
     * @method isHidden
     * @return {Boolean} true if the object is hidden.
     */
    that.isHidden = function(enable) {
        return my.hidden;
    }
    
    /**
     * Return the width of the object
     * @method getWidth
     * @return {Number} The width of the object
     */
    that.getWidth = function() {
        return 0;
    }
    
    /**
     * Return the width of the object
     * @method getHeight
     * @return {Number} The height of the object
     */
    that.getHeight = function() {
        return 0;
    }
    
    /**
     * Return the X position of the object center, relative to the object position.
     * @method getCenterX
     */
    that.getCenterX = function() {
        return that.getWidth()/2;
    }
    
    /**
     * Return the Y position of the object center, relative to the object position.
     * @method getCenterY
     */
    that.getCenterY = function() {
        return that.getHeight()/2;
    }
    
    /** 
     * Add a force to the object to make it moving.
     * @method addForce
     * @param x {Number} The x coordinates of the force
     * @param y {Number} The y coordinates of the force
     * @param isPermanent {Boolean} Set if the force is permanent or not.
     */
    that.addForce = function(x,y, isPermanent) {
        my.forces.push(gdjs.force(x, y, !isPermanent));
    }
    
    /** 
     * Add a force using polar coordinates.
     * @method addPolarForce
     * @param angle {Number} The angle of the force
     * @param len {Number} The length of the force
     * @param isPermanent {Boolean} Set if the force is permanent or not.
     */
    that.addPolarForce = function(angle, len, isPermanent) {
        var forceX = Math.cos(angle/180*3.14159)*len;
        var forceY = Math.sin(angle/180*3.14159)*len;
    
        my.forces.push(gdjs.force(forceX, forceY, !isPermanent));
    }
    
    /** 
     * Add a force oriented toward a position
     * @method addForceTowardPosition
     * @param x {Number} The target x position
     * @param y {Number} The target y position
     * @param len {Number} The force length, in pixels.
     * @param isPermanent {Boolean} Set if the force is permanent or not.
     */
    that.addForceTowardPosition = function(x,y, len, isPermanent) {
    
        var angle = Math.atan2(y - (that.getY()+that.getCenterY()), 
                               x - (that.getX()+that.getCenterX()));
        
        var forceX = Math.cos(angle)*len;
        var forceY = Math.sin(angle)*len;
        my.forces.push(gdjs.force(forceX, forceY, !isPermanent));
    }
    
    /** 
     * Deletes all forces applied on the object
     * @method clearForces
     */
    that.clearForces = function() {
        my.forces = [];
    }
    
    /** 
     * Return true if no forces are applied on the object.
     * @method hasNoForces
     * @return {Boolean} true if no forces are applied on the object.
     */
    that.hasNoForces = function() {
        return my.forces.length == 0;
    }
    
    /**
     * Called once a step by runtimeScene to remove temporary forces.
     *
     * @method updateForces
     */
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
    
    /**
     * Return a force which is the average of all forces applied on the object.
     *
     * @method getAverageForce
     * @return {force} A force object.
     */
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
    
    /** 
     * Return true if the average angle of the forces applied on the object
     * is in a given range.
     *
     * @method averageForceAngleIs
     * @param angle {Number} The angle to be tested.
     * @param toleranceInDegrees {Number} The length of the range : 
     * @return {Boolean} true if the difference between the average angle of the forces
     * and the angle parameter is inferior to toleranceInDegrees parameter.
     */
    that.averageForceAngleIs = function(angle, toleranceInDegrees) {
        
        var averageAngle = that.getAverageForce().getAngle();
        if ( averageAngle < 0 ) averageAngle += 360;
        
        return Math.abs(angle-averageAngle) < toleranceInDegrees/2;
    }
    
    /**
     * Put the object around a position, with a specific distance and angle.<br>
     * The distance is computed between the position and the center of the object.
     *
     * @method putAround
     * @param x {Number} The x position of the target
     * @param y {Number} The y position of the target
     * @param distance {Number} The distance between the object and the target
     * @param angleInDegrees {Number} The angle between the object and the target, in degrees.
     */
    that.putAround = function(x,y,distance,angleInDegrees) {
        var angle = angleInDegrees/180*3.14159;

        that.setX( x + Math.cos(angle)*distance - that.getCenterX() );
        that.setY( y + Math.sin(angle)*distance - that.getCenterY() );
    }
    
    /**
     * Get the hit boxes for the object.<br>
     * The default implementation returns a basic bouding box based on the result of getWidth and
     * getHeight.
     *
     * @method getHitBoxes
     * @return {Array} An array composed of polygon.
     */
    that.getHitBoxes = function() {
        var rectangle = gdjs.polygon.createRectangle(that.getWidth(), that.getHeight());
        rectangle.rotate(that.getAngle()/180*3.14159);
        rectangle.move(that.getX()+that.getCenterX(), that.getY()+that.getCenterY());

        var mask = [rectangle];
        return mask;
    }
    
    that.getDistanceFrom = function(otherObject) {
        return Math.sqrt(that.getSqDistanceFrom(useless, otherObject));
    }
    
    that.getSqDistanceFrom = function(otherObject) {
        if ( otherObject == null ) return 0;
        
        var x = that.getX()+that.getCenterX() - (otherObject.getX()+otherObject.getCenterX());
        var y = that.getY()+that.getCenterY() - (otherObject.getY()+otherObject.getCenterY());
        
        return x*x+y*y;
    }
    
    /**
     * Remove an object from a scene:
     * Just clear the object name and let the scene destroy it after.
     * @method deleteFromScene
     */
    that.deleteFromScene = function(runtimeScene) {
        runtimeScene.markObjectForDeletion(that);
    }
    
    return that;
}
