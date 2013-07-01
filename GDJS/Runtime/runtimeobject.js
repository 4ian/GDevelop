/*
 * Game Develop JS Platform
 * Copyright 2013 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */

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
    
    that.name = $(objectXml).attr("nom") || "";
    my.nameId = gdjs.runtimeObject.getNameIdentifier(that.name);
    that.type = $(objectXml).attr("type") || "";
    that.x = 0;
    that.y = 0;
    that.angle = 0;
    that.zOrder = 0;
    that.hidden = false;
    that.layer = "";
    that.hitBoxes = [];
    that.hitBoxes.push(gdjs.polygon.createRectangle(0,0));
    that.hitBoxesDirty = true;
    that.id = runtimeScene.createNewUniqueId();
    my.variables = gdjs.variablesContainer(objectXml ? $(objectXml).find("Variables") : undefined);
    my.forces = [];
    my.averageForce = gdjs.force(0,0,false); //A force returned by getAverageForce method.
    my.forcesGarbage = []; //Container for unused garbage, avoiding recreating forces each tick.
    my.automatisms = []; //Contains the automatisms of the object
    my.automatismsTable = new Hashtable(); //Also contains the automatisms: Used when an automatism is accessed by its name ( see getAutomatism ).
    
    my.initAutomatisms = function() {
        $(objectXml).find("Automatism").each(function() {
            var aut = gdjs.getAutomatismConstructor($(this).attr("Type"))(runtimeScene, $(this));
            aut.setOwner(that);
            my.automatisms.push(aut);
            my.automatismsTable.put($(this).attr("Name"), aut);
        });
    }
    my.initAutomatisms();
    
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
    
    /**
     * Called when the object is created from an initial instance at the startup of the scene.<br>
     * Note that common properties ( position, angle, z order... ) have already been setup.
     *
     * @method extraInitializationFromInitialInstance
     * @param initialInstanceXml The xml structure of the initial instance.
     */
    that.extraInitializationFromInitialInstance = function(initialInstanceXml) {
        //Nothing to do.
    }
    
    /**
     * Remove an object from a scene:
     * Just clear the object name and let the scene destroy it after.
     * @method deleteFromScene
     */
    that.deleteFromScene = function(runtimeScene) {
        runtimeScene.markObjectForDeletion(that);
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
     * Get the name identifier of the object.
     * @method getNameId
     * @return {Number} The object's name identifier.
     */
    that.getNameId = function() {
        return my.nameId;
    }
    
    /**
     * Get the unique identifier of the object.<br>
     * The identifier is set by the runtimeScene owning the object.<br>
     * You can also use the id property ( myObject.id ) for increased efficiency instead of
     * calling this method.
     *
     * @method getUniqueId
     * @return {Number} The object identifier
     */
    that.getUniqueId = function() {
        return that.id;
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
     * Shortcut to get the value of a variable considered as a number
     * @method getVariableAsNumber
     * @return The value of the specified variable
     */
    that.getVariableAsNumber = function(name) {
        return my.variables.get(name).getAsNumber();
    }
    
    /**
     * Shortcut to get the value of a variable considered as a string
     * @method getVariableAsString
     * @return The value of the specified variable
     */
    that.getVariableAsString = function(name) {
        return my.variables.get(name).getAsString();
    }
    
    /**
     * Shortcut to set the value of a variable considered as a number
     * @method setVariableNumber
     * @param name {String} The variable to be changed
     * @param newValue {Any} The value to be set
     */
    that.setVariableNumber = function(name, newValue) {
        return my.variables.get(name).setNumber(newValue);
    }
    
    /**
     * Shortcut to set the value of a variable considered as a string
     * @method setVariableNumber
     * @param name {String} The variable to be changed
     * @param newValue {Any} The value to be set
     */
    that.setVariableString = function(name, newValue) {
        return my.variables.get(name).setString(newValue);
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
        that.hidden = enable;
    }
    
    /**
     * Return true if the object is not hidden.
     * @method isVisible
     * @return {Boolean} true if the object is not hidden.
     */
    that.isVisible = function(enable) {
        return !that.hidden;
    }
    
    /**
     * Return true if the object is hidden.
     * @method isHidden
     * @return {Boolean} true if the object is hidden.
     */
    that.isHidden = function(enable) {
        return that.hidden;
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
    
    //Forces : 
    
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
     * Return a force which is the sum of all forces applied on the object.
     *
     * @method getAverageForce
     * @return {force} A force object.
     */
    that.getAverageForce = function() {
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
    
    //Hit boxes and collision :
    
    /**
     * Get the hit boxes for the object.<br>
     * The default implementation returns a basic bouding box based on the result of getWidth and
     * getHeight. You should probably redefine updateHitBoxes instead of this function.
     *
     * @method getHitBoxes
     * @return {Array} An array composed of polygon.
     */
    that.getHitBoxes = function() {
        //Avoid a naive implementation requiring to recreate temporaries each time
        //the function is called:
        //(var rectangle = gdjs.polygon.createRectangle(that.getWidth(), that.getHeight());
        //...)
        if ( that.hitBoxesDirty ) {
            that.updateHitBoxes();
            that.updateAABB();
            that.hitBoxesDirty = false;
        }
        return that.hitBoxes;
    }
    /**
     * Update the hit boxes for the object.<br>
     * The default implementation set a basic bouding box based on the result of getWidth and
     * getHeight. 
     */
    that.updateHitBoxes = function() {
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
    
    //Experimental
    that.getAABB = function() {
        if ( that.hitBoxesDirty ) {
            that.updateHitBoxes();
            that.updateAABB();
            that.hitBoxesDirty = false;
        }
        
        return that.aabb;
    }
    
    that.updateAABB = function() {
        that.aabb.min[0] = that.getDrawableX();
        that.aabb.min[1] = that.getDrawableY();
        that.aabb.max[0] = that.getDrawableX()+that.getWidth();
        that.aabb.max[1] = that.getDrawableY()+that.getHeight();
    }
    that.aabb = { min:[0,0], max:[0,0] };
    
    //Automatisms:
    
    /**
     * Call each automatism stepPreEvents method.
     * @method stepAutomatismsPreEvents
     */
    that.stepAutomatismsPreEvents = function(runtimeScene) {
        for(var i = 0, len = my.automatisms.length;i<len;++i) {
            my.automatisms[i].stepPreEvents(runtimeScene);
        }
    }

    /**
     * Call each automatism stepPostEvents method.
     * @method stepAutomatismsPostEvents
     */
    that.stepAutomatismsPostEvents = function(runtimeScene) {
        for(var i = 0, len = my.automatisms.length;i<len;++i) {
            my.automatisms[i].stepPostEvents(runtimeScene);
        }
    }
    
    /** 
     * Get an automatism from its name.<br>
     * Be careful, the automatism must exists, no check is made on the name.
     * @method getAutomatism
     * @param name {String} The automatism name.
     */
    that.getAutomatism = function(name) {
        return my.automatismsTable.get(name);
    }
    
    //Other :
    
    /**
     * Separate the object from others objects, using their hitboxes.
     * @method separateFromObjects
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
            if ( objects[i].id != that.id ) {
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
     * @method separateObjectsWithoutForces
     * @deprecated
     * @param objectsLists Tables of objects
     */
    that.separateObjectsWithoutForces = function(objectsLists) {
            
        //Prepare the list of objects to iterate over.
        var objects = [];
        var lists = objectsLists.values();
        for(var i = 0, len = lists.length;i<len;++i) {
            objects.push.apply(objects, lists[i]);
        }
        
        for(var i = 0, len = objects.length;i<len;++i) {
            if ( objects[i].id != that.id ) {
                if ( that.getDrawableX() < objects[i].getDrawableX() ){
                    that.setX( objects[i].getDrawableX() - that.getWidth() );
                }
                else if ( that.getDrawableX()+that.getWidth() > objects[i].getDrawableX()+objects[i].getWidth() ){
                    that.setX( objects[i].getDrawableX()+objects[i].getWidth() );
                }

                if ( that.getDrawableY() < objects[i].getDrawableY() ){
                    that.setY( objects[i].getDrawableY() - that.getHeight() );
                }
                else if ( that.getDrawableY()+that.getHeight() > objects[i].getDrawableY()+objects[i].getHeight() ){
                    that.setY( objects[i].getDrawableY()+objects[i].getHeight() );
                }
            }
        }
    }
    
    /**
     * @method SeparateObjectsWithForces
     * @deprecated
     * @param objectsLists Tables of objects
     */
    that.separateObjectsWithForces = function(objectsLists, len) {
            
        if ( len == undefined ) len = 10;
            
        //Prepare the list of objects to iterate over.
        var objects = [];
        var lists = objectsLists.values();
        for(var i = 0, len = lists.length;i<len;++i) {
            objects.push.apply(objects, lists[i]);
        }
        
        for(var i = 0, len = objects.length;i<len;++i) {
            if ( objects[i].id != that.id ) {
                if ( that.getDrawableX()+that.getCenterX() < objects[i].getDrawableX()+objects[i].getCenterX() )
                {
                    var av = that.hasNoForces() ? 0 : that.getAverageForce().getX(); 
                    that.addForce( -av - 10, 0, false );
                }
                else
                {
                    var av = that.hasNoForces() ? 0 : that.getAverageForce().getX(); 
                    that.addForce( -av + 10, 0, false );
                }

                if ( that.getDrawableY()+that.getCenterY() < objects[i].getDrawableY()+objects[i].getCenterY() )
                {
                    var av = that.hasNoForces() ? 0 : that.getAverageForce().getY(); 
                    that.addForce( 0, -av - 10, false );
                }
                else
                {
                    var av = that.hasNoForces() ? 0 : that.getAverageForce().getY(); 
                    that.addForce( 0, -av + 10, false );
                }
            }
        }
        
        /*
        for(var i = 0, len = objects.length;i<len;++i) {
            if ( objects[i].id != that.id ) {
                that.addForceTowardObject(objects[i], -len, false);
            }
        }*/
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

    //First check if bounding circle are too far.
    var o1w = obj1.getWidth();
    var o1h = obj1.getHeight();
    var o2w = obj2.getWidth();
    var o2h = obj2.getHeight();

    var x = obj1.getDrawableX()+obj1.getCenterX()-(obj2.getDrawableX()+obj2.getCenterX());
    var y = obj1.getDrawableY()+obj1.getCenterY()-(obj2.getDrawableY()+obj2.getCenterY());
    var obj1BoundingRadius = Math.sqrt(o1w*o1w+o1h*o1h)/2.0;
    var obj2BoundingRadius = Math.sqrt(o2w*o2w+o2h*o2h)/2.0;
    
    if ( Math.sqrt(x*x+y*y) > obj1BoundingRadius + obj2BoundingRadius )
        return false;
        
    //Or if in circle are colliding
    var obj1MinEdge = Math.min(o1w, o1h)/2.0;
    var obj2MinEdge = Math.min(o2w, o2h)/2.0;
        
    if ( x*x+y*y < obj1MinEdge*obj1MinEdge+2*obj1MinEdge*obj2MinEdge+obj2MinEdge*obj2MinEdge )
        return true;

    //Do a real check if necessary.
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

/**
 * Check the distance between two objects.
 * @method distanceTest
 * @static 
 */
gdjs.runtimeObject.distanceTest = function(obj1, obj2, distance) {
    var x = obj1.getDrawableX()+obj1.getCenterX()-(obj2.getDrawableX()+obj2.getCenterX());
    var y = obj1.getDrawableY()+obj1.getCenterY()-(obj2.getDrawableY()+obj2.getCenterY());
    
    return x*x+y*y <= distance;
}

/**
 * Get the identifier associated to an object name :<br>
 * Some features may want to compare objects name a large number of time. In this case,
 * it may be more efficient to compare objects name identifier ( see gdjs.runtimeObject.getNameId ).
 * @method getNameIdentifier
 * @static
 */
gdjs.runtimeObject.getNameIdentifier = function(name) {
    gdjs.runtimeObject.getNameIdentifier.identifiers = 
        gdjs.runtimeObject.getNameIdentifier.identifiers 
        || new Hashtable();
        
    if ( gdjs.runtimeObject.getNameIdentifier.identifiers.containsKey(name) )
        return gdjs.runtimeObject.getNameIdentifier.identifiers.get(name);
    
    var newKey = gdjs.runtimeObject.getNameIdentifier.identifiers.keys().length;
    
    gdjs.runtimeObject.getNameIdentifier.identifiers.put(name, newKey);
    return newKey;
}

//Notify gdjs that the runtimeObject exists.
gdjs.runtimeObject.thisIsARuntimeObjectConstructor = "";