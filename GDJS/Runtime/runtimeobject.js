
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
    that.hitBoxes = [];
    that.hitBoxes.push(gdjs.polygon.createRectangle(0,0));
    that.hitBoxesDirty = true;
    my.id = runtimeScene.createNewUniqueId();
    my.variables = gdjs.variablesContainer(objectXml ? $(objectXml).find("Variables") : undefined);
    my.forces = [];
    my.averageForce = gdjs.force(0,0,false); //A force returned by getAverageForce method.
    my.forcesGarbage = [];
    
    //Common members functions related to the object and its runtimeScene :
    
    /**
     * Called each time the scene is rendered.
     *
     * @method updateTime
     * @param elapsedTime {Number} The time elapsedTime since the last frame, in <b>seconds</b>.
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
        hitBoxesDirty = true;
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
        hitBoxesDirty = true;
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
     * Get the X position of the rendered object.<br>
     * For most objects, this will returns the same value as getX(). But if the object
     * has an origin that is not the same as the point (0,0) of the object displayed,
     * getDrawableX will differs.
     *
     * @method getDrawableX
     * @return {Number} The X position of the rendered object.
     */
    that.getDrawableX = function() {
        return that.getX();
    }
    
    /**
     * Get the Y position of the rendered object.<br>
     * For most objects, this will returns the same value as getY(). But if the object
     * has an origin that is not the same as the point (0,0) of the object displayed,
     * getDrawableY will differs.
     *
     * @method getDrawableY
     * @return {Number} The Y position of the rendered object.
     */
    that.getDrawableY = function() {
        return that.getY();
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
        hitBoxesDirty = true;
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
     * Get a force from the garbage, or create a new force is garbage is empty.<br>
     * To be used each time a force is created so as to avoid temporaries objects.
     *
     * @method getRecycledForce
     * @private
     * @param x {Number} The x coordinates of the force
     * @param y {Number} The y coordinates of the force
     * @param isTemporary {Boolean} Set if the force is temporary or not.
     */
    my.getRecycledForce = function(x, y, isTemporary) {
        if ( my.forcesGarbage.length === 0 )
            return gdjs.force(x, y, isTemporary);
        else {
            var recycledForce = my.forcesGarbage.pop();
            recycledForce.setX(x);
            recycledForce.setY(y);
            recycledForce.setTemporary(isTemporary);
            return recycledForce;
        }
    }
    
    /** 
     * Add a force to the object to make it moving.
     * @method addForce
     * @param x {Number} The x coordinates of the force
     * @param y {Number} The y coordinates of the force
     * @param isPermanent {Boolean} Set if the force is permanent or not.
     */
    that.addForce = function(x,y, isPermanent) {
        my.forces.push(my.getRecycledForce(x, y, !isPermanent));
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
    
        my.forces.push(my.getRecycledForce(forceX, forceY, !isPermanent));
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
    
        var angle = Math.atan2(y - (that.getDrawableY()+that.getCenterY()), 
                               x - (that.getDrawableX()+that.getCenterX()));
        
        var forceX = Math.cos(angle)*len;
        var forceY = Math.sin(angle)*len;
        my.forces.push(my.getRecycledForce(forceX, forceY, !isPermanent));
    }
    
    /** 
     * Add a force oriented toward another object.<br>
     * ( Shortcut to addForceTowardPosition )
     * @method addForceTowardObject
     * @param obj The target object
     * @param len {Number} The force length, in pixels.
     * @param isPermanent {Boolean} Set if the force is permanent or not.
     */
    that.addForceTowardObject = function(obj, len, isPermanent) {
        if ( obj == null ) return;
    
        that.addForceTowardPosition(obj.getDrawableX()+obj.getCenterX(), 
                                    obj.getDrawableY()+obj.getCenterY(),
                                    len, isPermanent);
    }
    
    /** 
     * Deletes all forces applied on the object
     * @method clearForces
     */
    that.clearForces = function() {
        my.forcesGarbage.push.apply(my.forcesGarbage, my.forces);
        my.forces.length = 0;
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
                my.forcesGarbage.push(my.forces[i]);
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
        
        my.averageForce.setX(averageX);
        my.averageForce.setY(averageY);
        return my.averageForce;
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
     * Put the object around another object, with a specific distance and angle.<br>
     * The distance is computed between the centers of the objects.
     *
     * @method putAround
     * @param obj The target object
     * @param distance {Number} The distance between the object and the target
     * @param angleInDegrees {Number} The angle between the object and the target, in degrees.
     */
    that.putAroundObject = function(obj,distance,angleInDegrees) {
        that.putAround(obj.getY()+obj.getCenterY(), obj.getX()+obj.getCenterX(),
                       distance, angleInDegrees);
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
        if ( that.hitBoxesDirty ) {
        
            //Avoid a naive implementation requiring to recreate temporaries each time
            //the function is called:
            //(var rectangle = gdjs.polygon.createRectangle(that.getWidth(), that.getHeight());
            //...)
            var width = that.getWidth();
            var height = that.getHeight();
            that.hitBoxes[0].vertices[0][0] =-width/2.0;
            that.hitBoxes[0].vertices[0][1] =-height/2.0;
            that.hitBoxes[0].vertices[1][0] =+width/2.0;
            that.hitBoxes[0].vertices[1][1] =-height/2.0;
            that.hitBoxes[0].vertices[2][0] =+width/2.0;
            that.hitBoxes[0].vertices[2][1] =+height/2.0;
            that.hitBoxes[0].vertices[3][0] =-width/2.0;
            that.hitBoxes[0].vertices[3][1] =+height/2.0;
            
            that.hitBoxes[0].rotate(that.getAngle()/180*3.14159);
            that.hitBoxes[0].move(that.getX()+that.getCenterX(), that.getY()+that.getCenterY());
        }
        return that.hitBoxes;
    }
    
    /**
     * Separate the object from others objects, using their hitboxes.
     *
     * @param objectsLists Tables of objects
     */
    that.separateFromObjects = function(objectsLists) {
            
        //Prepare the list of objects to iterate over.
        var objects = [];
        var lists = objectsLists.values();
        for(var i = 0, len = lists.length;i<len;++i) {
            objects.push.apply(objects, lists[i]);
        }
        
        var xMove = 0; var yMove = 0;
        var hitBoxes = that.getHitBoxes();
        
        //Check if their is a collision with each object
        for(var i = 0, len = objects.length;i<len;++i) {
            if ( objects[i].getUniqueId() != that.getUniqueId() ) {
                var otherHitBoxes = objects[i].getHitBoxes();
                
                for(var k = 0, lenk = hitBoxes.length;k<lenk;++k) {
                    for(var l = 0, lenl = otherHitBoxes.length;l<lenl;++l) {
                        var result = gdjs.polygon.collisionTest(hitBoxes[k], otherHitBoxes[l]);
                        if ( result.collision ) {
                            xMove += result.move_axis[0];
                            yMove += result.move_axis[1];
                        }
                    }
                }
            }
        }
        
        //Move according to the results returned by the collision algorithm.
        that.setPosition(that.getX()+xMove, that.getY()+yMove);
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

/**
 * Return true if the hitboxes of two objects are overlapping
 * @method collisionTest
 * @static
 * @param obj1 The first runtimeObject
 * @param obj2 The second runtimeObject
 */
gdjs.runtimeObject.collisionTest = function(obj1, obj2) {

    //Temporary test :
    if ( obj1.getX() + obj1.getWidth() < obj2.getX()
         || obj1.getX() > obj2.getX() + obj2.getWidth()
         || obj1.getY() + obj1.getHeight() < obj2.getY()
         || obj1.getY() > obj2.getY() + obj2.getHeight() )
         return false;
         
    return true;

    var hitBoxes1 = obj1.getHitBoxes();
    var hitBoxes2 = obj2.getHitBoxes();
    for(var k = 0, lenBoxes1 = hitBoxes1.length;k<lenBoxes1;++k) {
        for(var l = 0, lenBoxes2 = hitBoxes2.length;l<lenBoxes2;++l) {
            if ( gdjs.polygon.collisionTest(hitBoxes1[k], hitBoxes2[l]).collision ) {
                return true;
            }
        }
    }

    return false;
}