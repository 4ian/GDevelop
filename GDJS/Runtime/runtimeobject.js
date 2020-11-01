// @ts-check

/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * @typedef {Object} ObjectData Object containing initial properties for all objects extending {@link gdjs.RuntimeObject}.
 * @property {string} name The name of the object. During the game, objects can be queried by their name (see {@link gdjs.RuntimeScene.prototype.getObjects} for example).
 * @property {string} type The object type.
 * @property {Array<VariableData>} variables The list of default variables.
 * @property {Array<BehaviorData>} behaviors The list of default behaviors.
 */

/**
 * @typedef {Object} AABB An axis-aligned bounding box. Used to represents a box around an object for example.
 * @property {Array<number>} min The [x,y] coordinates of the top left point
 * @property {Array<number>} max The [x,y] coordinates of the bottom right point
 */

/**
 * RuntimeObject represents an object being used on a RuntimeScene.
 *
 * The constructor can be called on an already existing RuntimeObject:
 * In this case, the constructor will try to reuse as much already existing members
 * as possible (recycling).
 *
 * However, you should not be calling the constructor on an already existing object
 * which is not a RuntimeObject.
 *
 * A `gdjs.RuntimeObject` should not be instantiated directly, always a child class
 * (because gdjs.RuntimeObject don't call onCreated at the end of its constructor).
 *
 * @memberOf gdjs
 * @name RuntimeObject
 * @class
 * @param {gdjs.RuntimeScene} runtimeScene The {@link gdjs.RuntimeScene} the object belongs to.
 * @param {ObjectData} objectData The initial properties of the object.
 */
gdjs.RuntimeObject = function(runtimeScene, objectData) {
    /**
     * @protected
     * @type {string}
     */
    this.name = objectData.name || "";
    /**
     * @protected
     * @type {string}
     */
    this.type = objectData.type || "";
    /**
     * @protected
     * @type {number}
     */
    this.x = 0;
    /**
     * @protected
     * @type {number}
     */
    this.y = 0;
    /**
     * @protected
     * @type {number}
     */
    this.angle = 0;
    /**
     * @protected
     * @type {number}
     */
    this.zOrder = 0;
    /**
     * @protected
     * @type {boolean}
     */
    this.hidden = false;
    /**
     * @protected
     * @type {string}
     */
    this.layer = "";
    /**
     * @type {number}
     * @protected
     */
    this._nameId = gdjs.RuntimeObject.getNameIdentifier(this.name);
    /**
     * @type {boolean}
     * @protected
     */
    this._livingOnScene = true;
    /**
     * @type {number}
     * @readonly
     */
    this.id = runtimeScene.createNewUniqueId();
    /**
     * @type {gdjs.RuntimeScene}
     */
    this._runtimeScene = runtimeScene;
    /**
     * An optional UUID associated to the object to be used
     * for hot reload. Don't modify or use otherwise.
     * @type {?string}
     */
    this.persistentUuid = null;

    /**
     * A property to be used by external algorithms to indicate if the
     * object is picked or not in an object selection. By construction, this is
     * not "thread safe" or "re-entrant algorithm" safe.
     */
    this.pick = false;

    //Hit boxes:
    if ( this._defaultHitBoxes === undefined ) {
        /**
         * @type {Array<gdjs.Polygon>}
         * @protected
         */
        this._defaultHitBoxes = [];
        this._defaultHitBoxes.push(gdjs.Polygon.createRectangle(0,0));
    }
    /**
     * @type {Array<gdjs.Polygon>}
     * @protected
     */
    this.hitBoxes = this._defaultHitBoxes;
    /**
     * @type {boolean}
     * @protected
     */
    this.hitBoxesDirty = true;
    if ( this.aabb === undefined )
        /**
         * @type {AABB}
         * @protected
         */
        this.aabb = { min:[0,0], max:[0,0] };
    else {
        this.aabb.min[0] = 0; this.aabb.min[1] = 0;
        this.aabb.max[0] = 0; this.aabb.max[1] = 0;
    }

    //Variables:
    if ( !this._variables )
        /**
         * @type {gdjs.VariablesContainer}
         * @protected
         */
        this._variables = new gdjs.VariablesContainer(objectData ? objectData.variables : undefined);
    else
        gdjs.VariablesContainer.call(this._variables, objectData ? objectData.variables : undefined);

    //Forces:
    if ( this._forces === undefined )
        /**
         * @type {Array<gdjs.Force>}
         * @protected
         */
        this._forces = [];
    else
        this.clearForces();

    if (this._averageForce === undefined) this._averageForce = new gdjs.Force(0,0,0);

    //Behaviors:
    if (this._behaviors === undefined)
        /**
         * Contains the behaviors of the object.
         * @type {Array<gdjs.RuntimeBehavior>}
         * @protected
         */
        this._behaviors = [];

    if (this._behaviorsTable === undefined)
        //TODO: add <string, gdjs.RuntimeBehavior> typing to Hashtable.
        /**
         * @type {Hashtable}
         * @protected
         */
        this._behaviorsTable = new Hashtable(); //Also contains the behaviors: Used when a behavior is accessed by its name ( see getBehavior ).
    else
        this._behaviorsTable.clear();

	for(var i = 0, len = objectData.behaviors.length;i<len;++i) {
		var autoData = objectData.behaviors[i];
        var Ctor = gdjs.getBehaviorConstructor(autoData.type);

        //Try to reuse already existing behaviors.
        if ( i < this._behaviors.length ) {
            if ( this._behaviors[i] instanceof Ctor )
                Ctor.call(this._behaviors[i], runtimeScene, autoData, this);
            else
                this._behaviors[i] = new Ctor(runtimeScene, autoData, this);
        }
        else this._behaviors.push(new Ctor(runtimeScene, autoData, this));

        this._behaviorsTable.put(autoData.name, this._behaviors[i]);
    }
    this._behaviors.length = i;//Make sure to delete already existing behaviors which are not used anymore.

    //Timers:
    if (this._timers === undefined)
        //TODO: add <string, gdjs.Timer> typing to Hashtable.
        /**
         * @type {Hashtable}
         * @protected
         */
        this._timers = new Hashtable();
    else
        this._timers.clear();
};

/**
 * Table containing the id corresponding to an object name. Do not use directly or modify.
 * @static
 * @private
 */
gdjs.RuntimeObject._identifiers = gdjs.RuntimeObject._identifiers || new Hashtable();

/**
 * The next available unique identifier for an object. Do not use directly or modify.
 * @static
 * @private
 */
gdjs.RuntimeObject._newId = (gdjs.RuntimeObject._newId || 0);

/**
 * Global container for unused forces, avoiding recreating forces each tick.
 * @static
 * @private
 */
gdjs.RuntimeObject.forcesGarbage = [];

//Common members functions related to the object and its runtimeScene :

/**
 * To be called by the child classes in their constructor, at the very end.
 * Notify the behaviors that they have been constructed (this must be done when
 * the object is ready, otherwise behaviors can do operations on the object which
 * could be not initialized yet).
 *
 * If you redefine this function, **make sure to call the original method**
 * (`gdjs.RuntimeObject.prototype.onCreated.call(this);`).
 */
gdjs.RuntimeObject.prototype.onCreated = function() {
    for(var i =0;i<this._behaviors.length;++i) {
        this._behaviors[i].onCreated();
    }
}

/**
 * Return the time elapsed since the last frame,
 * in milliseconds, for the object.
 *
 * Objects can have different elapsed time if they are on layers with different time scales.
 *
 * @param {gdjs.RuntimeScene} runtimeScene The RuntimeScene the object belongs to.
 */
gdjs.RuntimeObject.prototype.getElapsedTime = function(runtimeScene) {
    //TODO: Memoize?
    var theLayer = runtimeScene.getLayer(this.layer);
    return theLayer.getElapsedTime();
}

/**
 * Called once during the game loop, before events and rendering.
 * @param {gdjs.RuntimeScene} runtimeScene The gdjs.RuntimeScene the object belongs to.
 */
gdjs.RuntimeObject.prototype.update = function(runtimeScene) {
    //Nothing to do.
};

/**
 * Called when the object is created from an initial instance at the startup of the scene.<br>
 * Note that common properties (position, angle, z order...) have already been setup.
 *
 * @param initialInstanceData The data of the initial instance.
 */
gdjs.RuntimeObject.prototype.extraInitializationFromInitialInstance = function(initialInstanceData) {
    //Nothing to do.
};

/**
 * Called when the object must be updated using the specified objectData. This is the
 * case during hot-reload, and is only called if the object was modified.
 *
 * @param {ObjectData} oldObjectData The previous data for the object.
 * @param {ObjectData} newObjectData The new data for the object.
 * @returns {boolean} true if the object was updated, false if it could not (i.e: hot-reload is not supported).
 */
gdjs.RuntimeObject.prototype.updateFromObjectData = function(oldObjectData, newObjectData) {
    // If not redefined, mark by default the hot-reload as failed.
    return false;
}

/**
 * Remove an object from a scene.
 *
 * Do not change/redefine this method. Instead, redefine the onDestroyFromScene method.
 * @param {gdjs.RuntimeScene} runtimeScene The RuntimeScene owning the object.
 */
gdjs.RuntimeObject.prototype.deleteFromScene = function(runtimeScene) {
    if ( this._livingOnScene ) {
        runtimeScene.markObjectForDeletion(this);
        this._livingOnScene = false;
    }
};

/**
 * Called when the object is destroyed (because it is removed from a scene or the scene
 * is being unloaded). If you redefine this function, **make sure to call the original method**
 * (`gdjs.RuntimeObject.prototype.onDestroyFromScene.call(this, runtimeScene);`).
 *
 * @param {gdjs.RuntimeScene} runtimeScene The scene owning the object.
 */
gdjs.RuntimeObject.prototype.onDestroyFromScene = function(runtimeScene) {
    var theLayer = runtimeScene.getLayer(this.layer);

    var rendererObject = this.getRendererObject();
    if (rendererObject) {
        theLayer.getRenderer().removeRendererObject(rendererObject);
    }

    for(var j = 0, lenj = this._behaviors.length;j<lenj;++j) {
        this._behaviors[j].onDestroy();
    }
};

//Rendering:

/**
 * Called with a callback function that should be called with the internal
 * object used for rendering by the object (PIXI.DisplayObject...)
 *
 * @return {Object} The internal rendered object (PIXI.DisplayObject...)
 */
gdjs.RuntimeObject.prototype.getRendererObject = function() {
    return undefined;
};

//Common properties:

/**
 * Get the name of the object.
 * @return {string} The object's name.
 */
gdjs.RuntimeObject.prototype.getName = function() {
    return this.name;
};

/**
 * Get the name identifier of the object.
 * @return {number} The object's name identifier.
 */
gdjs.RuntimeObject.prototype.getNameId = function() {
    return this._nameId;
};

/**
 * Get the unique identifier of the object.<br>
 * The identifier is set by the runtimeScene owning the object.<br>
 * You can also use the id property (this._object.id) for increased efficiency instead of
 * calling this method.
 *
 * @return {number} The object identifier
 */
gdjs.RuntimeObject.prototype.getUniqueId = function() {
    return this.id;
}
;
/**
 * Set the position of the object.
 *
 * @param {number} x The new X position
 * @param {number} y The new Y position
 */
gdjs.RuntimeObject.prototype.setPosition = function(x,y) {
    this.setX(x);
    this.setY(y);
};

/**
 * Set the X position of the object.
 *
 * @param {number} x The new X position
 */
gdjs.RuntimeObject.prototype.setX = function(x) {
    if ( x === this.x ) return;

    this.x = x;
    this.hitBoxesDirty = true;
};

/**
 * Get the X position of the object.
 *
 * @return {number} The X position of the object
 */
gdjs.RuntimeObject.prototype.getX = function() {
    return this.x;
};

/**
 * Set the Y position of the object.
 *
 * @param {number} y The new Y position
 */
gdjs.RuntimeObject.prototype.setY = function(y) {
    if ( y === this.y ) return;

    this.y = y;
    this.hitBoxesDirty = true;
};

/**
 * Get the Y position of the object.
 *
 * @return {number} The Y position of the object
 */
gdjs.RuntimeObject.prototype.getY = function() {
    return this.y;
};

/**
 * Get the X position of the rendered object.
 *
 * For most objects, this will returns the same value as getX(). But if the object
 * has an origin that is not the same as the point (0,0) of the object displayed,
 * getDrawableX will differ.
 *
 * @return {number} The X position of the rendered object.
 */
gdjs.RuntimeObject.prototype.getDrawableX = function() {
    return this.getX();
};

/**
 * Get the Y position of the rendered object.
 *
 * For most objects, this will returns the same value as getY(). But if the object
 * has an origin that is not the same as the point (0,0) of the object displayed,
 * getDrawableY will differ.
 *
 * @return {number} The Y position of the rendered object.
 */
gdjs.RuntimeObject.prototype.getDrawableY = function() {
    return this.getY();
};


gdjs.RuntimeObject.prototype.rotateTowardPosition = function(x, y, speed, scene) {
    this.rotateTowardAngle(Math.atan2(y - (this.getDrawableY() + this.getCenterY()),
        x - (this.getDrawableX() + this.getCenterX()))*180/Math.PI, speed, scene);
};

gdjs.RuntimeObject.prototype.rotateTowardAngle = function(angle, speed, runtimeScene) {
    if (speed === 0) {
        this.setAngle(angle);
        return;
    }

    var angularDiff = gdjs.evtTools.common.angleDifference(this.getAngle(), angle);
    var diffWasPositive = angularDiff >= 0;

    var newAngle = this.getAngle() + (diffWasPositive ? -1.0 : 1.0)
        * speed * this.getElapsedTime(runtimeScene) / 1000;
    // @ts-ignore
    if (gdjs.evtTools.common.angleDifference(newAngle, angle) > 0 ^ diffWasPositive)
        newAngle = angle;
    this.setAngle(newAngle);

    if (this.getAngle() !== newAngle) //Objects like sprite in 8 directions does not handle small increments...
        this.setAngle(angle); //...so force them to be in the path angle anyway.
};

/**
 * Rotate the object at the given speed
 *
 * @param {number} speed The speed, in degrees per second.
 * @param {gdjs.RuntimeScene} runtimeScene The scene where the object is displayed.
 */
gdjs.RuntimeObject.prototype.rotate = function(speed, runtimeScene) {
    this.setAngle(this.getAngle() + speed * this.getElapsedTime(runtimeScene) / 1000);
};

/**
 * Set the angle of the object.
 *
 * @param {number} angle The new angle of the object
 */
gdjs.RuntimeObject.prototype.setAngle = function(angle) {
    if ( this.angle === angle ) return;

    this.angle = angle;
    this.hitBoxesDirty = true;
};

/**
 * Get the rotation of the object.
 *
 * @return {number} The rotation of the object, in degrees.
 */
gdjs.RuntimeObject.prototype.getAngle = function() {
    return this.angle;
};

/**
 * Set the layer of the object.
 *
 * @param {string} layer The new layer of the object
 */
gdjs.RuntimeObject.prototype.setLayer = function(layer) {
    if (layer === this.layer) return;
    var oldLayer = this._runtimeScene.getLayer(this.layer);

    this.layer = layer;
    var newLayer = this._runtimeScene.getLayer(this.layer);

    var rendererObject = this.getRendererObject();
    if (rendererObject) {
        oldLayer.getRenderer().removeRendererObject(rendererObject);
        newLayer.getRenderer().addRendererObject(rendererObject, this.zOrder);
    }
};

/**
 * Get the layer of the object.
 *
 * @return {string} The layer of the object
 */
gdjs.RuntimeObject.prototype.getLayer = function() {
    return this.layer;
};

/**
 * Return true if the object is on the specified layer
 *
 * @param {string} layer The layer to be tested.
 * @return {boolean} true if the object is on the specified layer
 */
gdjs.RuntimeObject.prototype.isOnLayer = function(layer) {
    return this.layer === layer;
};


/**
 * Set the Z order of the object.
 *
 * @param {number} z The new Z order position of the object
 */
gdjs.RuntimeObject.prototype.setZOrder = function(z) {
    if ( z === this.zOrder ) return;
    this.zOrder = z;

    if ( this.getRendererObject() ) {
        var theLayer = this._runtimeScene.getLayer(this.layer);
        theLayer.getRenderer().changeRendererObjectZOrder(this.getRendererObject(), z);
    }
};

/**
 * Get the Z order of the object.
 *
 * @return {number} The Z order of the object
 */
gdjs.RuntimeObject.prototype.getZOrder = function() {
    return this.zOrder;
};

/**
 * Get the container of the object variables
 * @return {gdjs.VariablesContainer} The variables of the object
 */
gdjs.RuntimeObject.prototype.getVariables = function() {
    return this._variables;
};

/**
 * Get the value of a variable considered as a number. Equivalent of variable.getAsNumber()
 * @param {gdjs.Variable} variable The variable to be accessed
 * @return {number} The value of the specified variable
 * @static
 */
gdjs.RuntimeObject.getVariableNumber = function(variable) {
    return variable.getAsNumber();
};
gdjs.RuntimeObject.prototype.getVariableNumber = gdjs.RuntimeObject.getVariableNumber;

/**
 * Return the variable passed as argument without any change.
 * Only for usage by events.
 *
 * @param {gdjs.Variable} variable The variable to be accessed
 * @return The specified variable
 * @static
 */
gdjs.RuntimeObject.returnVariable = function(variable) {
    return variable;
}
gdjs.RuntimeObject.prototype.returnVariable = gdjs.RuntimeObject.returnVariable;

/**
 * Get the value of a variable considered as a string. Equivalent of variable.getAsString()
 * @param variable The variable to be accessed
 * @return The string of the specified variable
 * @static
 */
gdjs.RuntimeObject.getVariableString = function(variable) {
    return variable.getAsString();
};
gdjs.RuntimeObject.prototype.getVariableString = gdjs.RuntimeObject.getVariableString;

/**
 * Get the number of children from a variable
 * @param variable The variable to be accessed
 * @return The number of children
 * @static
 */
gdjs.RuntimeObject.getVariableChildCount = function(variable) {
    if (variable.isStructure() == false) return 0;
    return Object.keys(variable.getAllChildren()).length;
};

/**
 * Shortcut to set the value of a variable considered as a number
 * @param variable The variable to be changed
 * @param {number} newValue The value to be set
 */
gdjs.RuntimeObject.setVariableNumber = function(variable, newValue) {
    variable.setNumber(newValue);
};
gdjs.RuntimeObject.prototype.setVariableNumber = gdjs.RuntimeObject.setVariableNumber;

/**
 * Shortcut to set the value of a variable considered as a string
 * @param variable The variable to be changed
 * @param newValue {String} The value to be set
 */
gdjs.RuntimeObject.setVariableString = function(variable, newValue) {
    variable.setString(newValue);
};
gdjs.RuntimeObject.prototype.setVariableString = gdjs.RuntimeObject.setVariableString;

/**
 * @static
 * @private
 * @param {gdjs.Variable} variable The variable to be tested
 * @param {string} childName The name of the child
 */
gdjs.RuntimeObject.variableChildExists = function(variable, childName) {
    return variable.hasChild(childName);
};
gdjs.RuntimeObject.prototype.variableChildExists = gdjs.RuntimeObject.variableChildExists;

/**
 * @static
 * @private
 * @param {gdjs.Variable} variable The variable to be changed
 * @param {string} childName The name of the child
 */
gdjs.RuntimeObject.variableRemoveChild = function(variable, childName) {
    return variable.removeChild(childName);
};
gdjs.RuntimeObject.prototype.variableRemoveChild = gdjs.RuntimeObject.variableRemoveChild;

/**
 * @static
 * @private
 * @param {gdjs.Variable} variable The variable to be cleared
 */
gdjs.RuntimeObject.variableClearChildren = function(variable) {
    variable.clearChildren();
};
gdjs.RuntimeObject.prototype.variableClearChildren = gdjs.RuntimeObject.variableClearChildren;

/**
 * Shortcut to test if a variable exists for the object.
 * @param {string} name The variable to be tested
 * @return {boolean} true if the variable exists.
 */
gdjs.RuntimeObject.prototype.hasVariable = function(name) {
    return this._variables.has(name);
};

/**
 * Hide (or show) the object.
 * @param {boolean} enable Set it to true to hide the object, false to show it.
 */
gdjs.RuntimeObject.prototype.hide = function(enable) {
    if (enable === undefined) enable = true;
    this.hidden = enable;
};

/**
 * Return true if the object is not hidden.
 *
 * Note: This is unrelated to the actual visibility of the object on the screen.
 * For this, see `getVisibilityAABB` to get the bounding boxes of the object as displayed
 * on the scene.
 *
 * @return {boolean} true if the object is not hidden.
 */
gdjs.RuntimeObject.prototype.isVisible = function() {
    return !this.hidden;
};

/**
 * Return true if the object is hidden.
 * @return {boolean} true if the object is hidden.
 */
gdjs.RuntimeObject.prototype.isHidden = function() {
    return this.hidden;
};

/**
 * Set the width of the object, if applicable.
 * @param {number} width The new width in pixels.
 */
gdjs.RuntimeObject.prototype.setWidth = function(width) {};

/**
 * Set the height of the object, if applicable.
 * @param {number} height The new height in pixels.
 */
gdjs.RuntimeObject.prototype.setHeight = function(height) {};

/**
 * Return the width of the object.
 * @return {number} The width of the object
 */
gdjs.RuntimeObject.prototype.getWidth = function() {
    return 0;
};

/**
 * Return the width of the object.
 * @return {number} The height of the object
 */
gdjs.RuntimeObject.prototype.getHeight = function() {
    return 0;
};

/**
 * Return the X position of the object center, **relative to the object X position** (`getDrawableX`).
 * @return {number} the X position of the object center, relative to `getDrawableX()`.
 */
gdjs.RuntimeObject.prototype.getCenterX = function() {
    return this.getWidth() / 2;
};

/**
 * Return the Y position of the object center, **relative to the object position** (`getDrawableY`).
 * @return {number} the Y position of the object center, relative to `getDrawableY()`.
 */
gdjs.RuntimeObject.prototype.getCenterY = function() {
    return this.getHeight() / 2;
};

//Forces :

/**
 * Get a force from the garbage, or create a new force is garbage is empty.<br>
 * To be used each time a force is created so as to avoid temporaries objects.
 *
 * @private
 * @param {number} x The x coordinates of the force
 * @param {number} y The y coordinates of the force
 * @param {number} multiplier Set the force multiplier
 */
gdjs.RuntimeObject.prototype._getRecycledForce = function(x, y, multiplier) {
    if ( gdjs.RuntimeObject.forcesGarbage.length === 0 )
        return new gdjs.Force(x, y, multiplier);
    else {
        var recycledForce = gdjs.RuntimeObject.forcesGarbage.pop();
        recycledForce.setX(x);
        recycledForce.setY(y);
        recycledForce.setMultiplier(multiplier);
        return recycledForce;
    }
};

/**
 * Add a force to the object to move it.
 * @param {number} x The x coordinates of the force
 * @param {number} y The y coordinates of the force
 * @param {number} multiplier Set the force multiplier
 */
gdjs.RuntimeObject.prototype.addForce = function(x,y, multiplier) {
    this._forces.push(this._getRecycledForce(x, y, multiplier));
};

/**
 * Add a force using polar coordinates.
 * @param {number} angle The angle of the force, in degrees.
 * @param {number} len The length of the force, in pixels.
 * @param {number} multiplier Set the force multiplier
 */
gdjs.RuntimeObject.prototype.addPolarForce = function(angle, len, multiplier) {
    var angleInRadians = angle/180*3.14159; //TODO: Benchmark with Math.PI
    var forceX = Math.cos(angleInRadians)*len;
    var forceY = Math.sin(angleInRadians)*len;

    this._forces.push(this._getRecycledForce(forceX, forceY, multiplier));
};

/**
 * Add a force oriented toward a position
 * @param {number} x The target x position
 * @param {number} y The target y position
 * @param {number} len The force length, in pixels.
 * @param {number} multiplier Set the force multiplier
 */
gdjs.RuntimeObject.prototype.addForceTowardPosition = function(x,y, len, multiplier) {

    var angle = Math.atan2(y - (this.getDrawableY()+this.getCenterY()),
                           x - (this.getDrawableX()+this.getCenterX()));

    var forceX = Math.cos(angle)*len;
    var forceY = Math.sin(angle)*len;
    this._forces.push(this._getRecycledForce(forceX, forceY, multiplier));
};

/**
 * Add a force oriented toward another object.<br>
 * (Shortcut for addForceTowardPosition)
 * @param {gdjs.RuntimeObject} object The target object
 * @param {number} len The force length, in pixels.
 * @param {number} multiplier Set the force multiplier
 */
gdjs.RuntimeObject.prototype.addForceTowardObject = function(object, len, multiplier) {
    if ( object == null ) return;

    this.addForceTowardPosition(object.getDrawableX() + object.getCenterX(),
                                object.getDrawableY() + object.getCenterY(),
                                len, multiplier);
};

/**
 * Deletes all forces applied on the object
 */
gdjs.RuntimeObject.prototype.clearForces = function() {
    gdjs.RuntimeObject.forcesGarbage.push.apply(gdjs.RuntimeObject.forcesGarbage, this._forces);
    this._forces.length = 0;
};

/**
 * Return true if no forces are applied on the object.
 * @return {boolean} true if no forces are applied on the object.
 */
gdjs.RuntimeObject.prototype.hasNoForces = function() {
    return this._forces.length === 0;
};

/**
 * Called once a step by runtimeScene to update forces magnitudes and
 * remove null ones.
 */
gdjs.RuntimeObject.prototype.updateForces = function(elapsedTime) {
    for(var i = 0;i<this._forces.length;) {
        var force = this._forces[i];
        var multiplier = force.getMultiplier();
        if (multiplier === 1) { // Permanent force
            ++i;
        } else if (multiplier === 0 || force.getLength() <= 0.001) { // Instant or force disappearing
            gdjs.RuntimeObject.forcesGarbage.push(force);
            this._forces.splice(i, 1);
        } else { // Deprecated way of updating forces progressively.
            force.setLength(force.getLength() - force.getLength() * ( 1 - multiplier ) * elapsedTime);
            ++i;
        }
    }
};

/**
 * Return a force which is the sum of all forces applied on the object.
 *
 * @return {gdjs.Force} A force object.
 */
gdjs.RuntimeObject.prototype.getAverageForce = function() {
    var averageX = 0;
    var averageY = 0;
    for(var i = 0, len = this._forces.length;i<len;++i) {
        averageX += this._forces[i].getX();
        averageY += this._forces[i].getY();
    }

    this._averageForce.setX(averageX);
    this._averageForce.setY(averageY);
    return this._averageForce;
};

/**
 * Return true if the average angle of the forces applied on the object
 * is in a given range.
 *
 * @param {number} angle The angle to be tested.
 * @param {number} toleranceInDegrees The length of the range :
 * @return {boolean} true if the difference between the average angle of the forces
 * and the angle parameter is inferior to toleranceInDegrees parameter.
 */
gdjs.RuntimeObject.prototype.averageForceAngleIs = function(angle, toleranceInDegrees) {

    var averageAngle = this.getAverageForce().getAngle();
    if ( averageAngle < 0 ) averageAngle += 360;

    return Math.abs(angle-averageAngle) < toleranceInDegrees/2;
};

//Hit boxes and collision :

/**
 * Get the hit boxes for the object.<br>
 * The default implementation returns a basic bouding box based the size (getWidth and
 * getHeight) and the center point of the object (getCenterX and getCenterY).
 *
 * You should probably redefine updateHitBoxes instead of this function.
 *
 * @return {Array<gdjs.Polygon>} An array composed of polygon.
 */
gdjs.RuntimeObject.prototype.getHitBoxes = function() {
    //Avoid a naive implementation requiring to recreate temporaries each time
    //the function is called:
    //(var rectangle = gdjs.Polygon.createRectangle(this.getWidth(), this.getHeight());
    //...)
    if ( this.hitBoxesDirty ) {
        this.updateHitBoxes();
        this.updateAABB();
        this.hitBoxesDirty = false;
    }
    return this.hitBoxes;
};

/**
 * Update the hit boxes for the object.
 *
 * The default implementation set a basic bounding box based on the size (getWidth and
 * getHeight) and the center point of the object (getCenterX and getCenterY).
 * Result is cached until invalidated (by a position change, angle change...).
 *
 * You should not call this function by yourself, it is called when necessary by getHitBoxes method.
 * However, you can redefine it if your object need custom hit boxes.
 */
gdjs.RuntimeObject.prototype.updateHitBoxes = function() {
    this.hitBoxes = this._defaultHitBoxes;
    var width = this.getWidth();
    var height = this.getHeight();
    var centerX = this.getCenterX();
    var centerY = this.getCenterY();

    if (centerX === width / 2 && centerY === height / 2) {
        this.hitBoxes[0].vertices[0][0] = - centerX;
        this.hitBoxes[0].vertices[0][1] = - centerY;
        this.hitBoxes[0].vertices[1][0] = + centerX;
        this.hitBoxes[0].vertices[1][1] = - centerY;
        this.hitBoxes[0].vertices[2][0] = + centerX;
        this.hitBoxes[0].vertices[2][1] = + centerY;
        this.hitBoxes[0].vertices[3][0] = - centerX;
        this.hitBoxes[0].vertices[3][1] = + centerY;
    } else {
        this.hitBoxes[0].vertices[0][0] = 0 - centerX;
        this.hitBoxes[0].vertices[0][1] = 0 - centerY;
        this.hitBoxes[0].vertices[1][0] = width - centerX;
        this.hitBoxes[0].vertices[1][1] = 0 - centerY;
        this.hitBoxes[0].vertices[2][0] = width - centerX;
        this.hitBoxes[0].vertices[2][1] = height - centerY;
        this.hitBoxes[0].vertices[3][0] = 0 - centerX;
        this.hitBoxes[0].vertices[3][1] = height - centerY;
    }

    this.hitBoxes[0].rotate(this.getAngle()/180*Math.PI);
    this.hitBoxes[0].move(this.getDrawableX()+centerX, this.getDrawableY()+centerY);
};

/**
 * Get the AABB (axis aligned bounding box) for the object.
 *
 * The default implementation uses either the position/size of the object (when angle is 0) or
 * hitboxes (when angle is not 0) to compute the bounding box.
 * Result is cached until invalidated (by a position change, angle change...).
 *
 * You should probably redefine updateAABB instead of this function.
 *
 * @return {AABB} The bounding box (example: `{min: [10,5], max:[20,10]}`)
 */
gdjs.RuntimeObject.prototype.getAABB = function() {
    if ( this.hitBoxesDirty ) {
        this.updateHitBoxes();
        this.updateAABB();
        this.hitBoxesDirty = false;
    }

    return this.aabb;
};

/**
 * Get the AABB (axis aligned bounding box) to be used to determine if the object
 * is visible on screen. The gdjs.RuntimeScene will hide the renderer object if
 * the object is not visible on screen ("culling").
 *
 * The default implementation uses the AABB returned by getAABB.
 *
 * If `null` is returned, the object is assumed to be always visible.
 *
 * @return {?AABB} The bounding box (example: `{min: [10,5], max:[20,10]}`) or `null`.
 */
gdjs.RuntimeObject.prototype.getVisibilityAABB = function() {
    return this.getAABB();
};

/**
 * Update the AABB (axis aligned bounding box) for the object.
 *
 * Default implementation uses either the position/size of the object (when angle is 0) or
 * hitboxes (when angle is not 0) to compute the bounding box.
 *
 * You should not call this function by yourself, it is called when necessary by getAABB method.
 * However, you can redefine it if your object can have a faster implementation.
 */
gdjs.RuntimeObject.prototype.updateAABB = function() {
    if (this.getAngle() === 0) {
        // Fast/simple computation of AABB for non rotated object
        // (works even for object with non default center/origin
        // because we're using getDrawableX/Y)
        this.aabb.min[0] = this.getDrawableX();
        this.aabb.min[1] = this.getDrawableY();
        this.aabb.max[0] = this.aabb.min[0] + this.getWidth();
        this.aabb.max[1] = this.aabb.min[1] + this.getHeight();
    } else {
        // Use hitboxes if object is rotated to ensure that the AABB
        // is properly bounding the whole object.
        // Slower (10-15% slower).
        var first = true;
        for(var i = 0;i<this.hitBoxes.length;i++) {
            for(var j = 0;j<this.hitBoxes[i].vertices.length;j++) {
                var vertex = this.hitBoxes[i].vertices[j];

                if (first) {
                    this.aabb.min[0] = vertex[0];
                    this.aabb.max[0] = vertex[0];
                    this.aabb.min[1] = vertex[1];
                    this.aabb.max[1] = vertex[1];
                    first = false;
                } else {
                    this.aabb.min[0] = Math.min(this.aabb.min[0], vertex[0]);
                    this.aabb.max[0] = Math.max(this.aabb.max[0], vertex[0]);
                    this.aabb.min[1] = Math.min(this.aabb.min[1], vertex[1]);
                    this.aabb.max[1] = Math.max(this.aabb.max[1], vertex[1]);
                }
            }
        }
    }
};

//Behaviors:

/**
 * Call each behavior stepPreEvents method.
 */
gdjs.RuntimeObject.prototype.stepBehaviorsPreEvents = function(runtimeScene) {
    for(var i = 0, len = this._behaviors.length;i<len;++i) {
        this._behaviors[i].stepPreEvents(runtimeScene);
    }
};

/**
 * Call each behavior stepPostEvents method.
 */
gdjs.RuntimeObject.prototype.stepBehaviorsPostEvents = function(runtimeScene) {
    for(var i = 0, len = this._behaviors.length;i<len;++i) {
        this._behaviors[i].stepPostEvents(runtimeScene);
    }
};

/**
 * Called when the object was hot reloaded, to notify behaviors
 * that the object was modified. Useful for behaviors that
 */
gdjs.RuntimeObject.prototype.notifyBehaviorsObjectHotReloaded = function() {
    for(var i = 0, len = this._behaviors.length;i<len;++i) {
        this._behaviors[i].onObjectHotReloaded();
    }
}

/**
 * Get a behavior from its name.
 * If the behavior does not exists, `undefined` is returned.
 *
 * **Never keep a reference** to a behavior, as they can be hot-reloaded. Instead,
 * always call getBehavior on the object.
 *
 * @param name {String} The behavior name.
 * @return {gdjs.RuntimeBehavior?} The behavior with the given name, or undefined.
 */
gdjs.RuntimeObject.prototype.getBehavior = function(name) {
    return this._behaviorsTable.get(name);
};

/**
 * Check if a behavior is used by the object.
 *
 * @param name {String} The behavior name.
 */
gdjs.RuntimeObject.prototype.hasBehavior = function(name) {
    return this._behaviorsTable.containsKey(name);
};

/**
 * De/activate a behavior of the object.
 *
 * @param name {String} The behavior name.
 * @param enable {boolean} true to activate the behavior
 */
gdjs.RuntimeObject.prototype.activateBehavior = function(name, enable) {
    if ( this._behaviorsTable.containsKey(name) ) {
        this._behaviorsTable.get(name).activate(enable);
    }
};

/**
 * Check if a behavior is activated
 *
 * @param {string} name The behavior name.
 * @return true if the behavior is activated.
 */
gdjs.RuntimeObject.prototype.behaviorActivated = function(name) {
    if ( this._behaviorsTable.containsKey(name) ) {
        return this._behaviorsTable.get(name).activated();
    }

    return false;
};

/**
 * Remove the behavior with the given name. Usually only used by
 * hot-reloading, as performance of this operation is not guaranteed
 * (in the future, this could lead to re-organization of arrays
 * holding behaviors).
 *
 * @param {string} name The name of the behavior to remove.
 * @returns {boolean} true if the behavior was properly removed, false otherwise.
 */
gdjs.RuntimeObject.prototype.removeBehavior = function(name) {
    var behavior = this._behaviorsTable.get(name);
    if (!behavior) return false;

    behavior.onDestroy();

    var behaviorIndex = this._behaviors.indexOf(behavior);
    if (behaviorIndex !== -1) this._behaviors.splice(behaviorIndex, 1);
    this._behaviorsTable.remove(name);

    return true;
};

/**
 * Create the behavior decribed by the given BehaviorData
 *
 * @param {BehaviorData} behaviorData The data to be used to construct the behavior.
 * @returns {boolean} true if the behavior was properly created, false otherwise.
 */
gdjs.RuntimeObject.prototype.addNewBehavior = function(behaviorData) {
    var Ctor = gdjs.getBehaviorConstructor(behaviorData.type);
    if (!Ctor) return false;

    var newRuntimeBehavior = new Ctor(this._runtimeScene, behaviorData, this);
    this._behaviors.push(newRuntimeBehavior);
    this._behaviorsTable.put(behaviorData.name, newRuntimeBehavior);
    return true;
};

//Timers:

/**
 * Updates the object timers. Called once during the game loop, before events and rendering.
 * @param {number} elapsedTime The elapsed time since the previous frame in milliseconds.
 */
gdjs.RuntimeObject.prototype.updateTimers = function(elapsedTime) {
    for (var name in this._timers.items) {
        if (this._timers.items.hasOwnProperty(name)) {
            this._timers.items[name].updateTime(elapsedTime);
        }
    }
};

/**
 * Test a timer elapsed time, if the timer doesn't exist it is created
 * @param {String} timerName The timer name
 * @param {number} timeInSeconds The time value to check in seconds
 * @return {boolean} True if the timer exists and its value is greater than or equal than the given time, false otherwise
 */
gdjs.RuntimeObject.prototype.timerElapsedTime = function(timerName, timeInSeconds) {
    if ( !this._timers.containsKey(timerName) ) {
        this._timers.put(timerName, new gdjs.Timer(timerName));
        return false;
    }

    return this.getTimerElapsedTimeInSeconds(timerName) >= timeInSeconds;
};

/**
 * Test a if a timer is paused
 * @param {String} timerName The timer name
 * @return {boolean} True if the timer exists and is paused, false otherwise
 */
gdjs.RuntimeObject.prototype.timerPaused = function(timerName) {
    if ( !this._timers.containsKey(timerName) ) {
        return false;
    }

    return this._timers.get(timerName).isPaused();
};

/**
 * Reset a timer, if the timer doesn't exist it is created
 * @param {String} timerName The timer name
 */
gdjs.RuntimeObject.prototype.resetTimer = function(timerName) {
    if ( !this._timers.containsKey(timerName) ) {
        this._timers.put(timerName, new gdjs.Timer(timerName));
    }

    this._timers.get(timerName).reset();
};

/**
 * Pause a timer, if the timer doesn't exist it is created
 * @param {String} timerName The timer name
 */
gdjs.RuntimeObject.prototype.pauseTimer = function(timerName) {
    if ( !this._timers.containsKey(timerName) ) {
        this._timers.put(timerName, new gdjs.Timer(timerName));
    }

    this._timers.get(timerName).setPaused(true);
};

/**
 * Unpause a timer, if the timer doesn't exist it is created
 * @param {String} timerName The timer name
 */
gdjs.RuntimeObject.prototype.unpauseTimer = function(timerName) {
    if ( !this._timers.containsKey(timerName) ) {
        this._timers.put(timerName, new gdjs.Timer(timerName));
    }

    this._timers.get(timerName).setPaused(false);
};

/**
 * Remove a timer
 * @param {String} timerName The timer name
 */
gdjs.RuntimeObject.prototype.removeTimer = function(timerName) {
    if ( this._timers.containsKey(timerName) ) {
        this._timers.remove(timerName);
    }
};

/**
 * Get a timer elapsed time.
 * @param {String} timerName The timer name
 * @return {number} The timer elapsed time in seconds, 0 if the timer doesn't exist
 */
gdjs.RuntimeObject.prototype.getTimerElapsedTimeInSeconds = function(timerName) {
    if ( !this._timers.containsKey(timerName) ) {
        return 0;
    }

    return this._timers.get(timerName).getTime() / 1000.0;
};

//Other :

/**
 * Separate the object from others objects, using their hitboxes.
 * @param objects Objects
 * @param {boolean | undefined} ignoreTouchingEdges If true, then edges that are touching each other, without the hitbox polygons actually overlapping, won't be considered in collision.
 * @return true if the object was moved
 */
gdjs.RuntimeObject.prototype.separateFromObjects = function(objects, ignoreTouchingEdges) {
   var moved = false;
   var xMove = 0; var yMove = 0;
   var hitBoxes = this.getHitBoxes();

   //Check if their is a collision with each object
   for(var i = 0, len = objects.length;i<len;++i) {
       if ( objects[i].id != this.id ) {
           var otherHitBoxes = objects[i].getHitBoxes();

           for(var k = 0, lenk = hitBoxes.length;k<lenk;++k) {
               for(var l = 0, lenl = otherHitBoxes.length;l<lenl;++l) {
                   var result = gdjs.Polygon.collisionTest(hitBoxes[k], otherHitBoxes[l], ignoreTouchingEdges);
                   if ( result.collision ) {
                       xMove += result.move_axis[0];
                       yMove += result.move_axis[1];
                       moved = true;
                   }
               }
           }
       }
   }

   //Move according to the results returned by the collision algorithm.
   this.setPosition(this.getX()+xMove, this.getY()+yMove);
   return moved;
};

/**
 * Separate the object from others objects, using their hitboxes.
 * @param objectsLists Tables of objects
 * @param {boolean | undefined} ignoreTouchingEdges If true, then edges that are touching each other, without the hitbox polygons actually overlapping, won't be considered in collision.
 * @return true if the object was moved
 */
gdjs.RuntimeObject.prototype.separateFromObjectsList = function(objectsLists, ignoreTouchingEdges) {
    var moved = false;
    var xMove = 0; var yMove = 0;
    var hitBoxes = this.getHitBoxes();

    for(var name in objectsLists.items) {
        if (objectsLists.items.hasOwnProperty(name)) {
            var objects = objectsLists.items[name];

            //Check if their is a collision with each object
            for(var i = 0, len = objects.length;i<len;++i) {
                if ( objects[i].id != this.id ) {
                    var otherHitBoxes = objects[i].getHitBoxes();

                    for(var k = 0, lenk = hitBoxes.length;k<lenk;++k) {
                        for(var l = 0, lenl = otherHitBoxes.length;l<lenl;++l) {
                            var result = gdjs.Polygon.collisionTest(hitBoxes[k], otherHitBoxes[l], ignoreTouchingEdges);
                            if ( result.collision ) {
                                xMove += result.move_axis[0];
                                yMove += result.move_axis[1];
                                moved = true;
                            }
                        }
                    }
                }
            }
        }
    }

    //Move according to the results returned by the collision algorithm.
    this.setPosition(this.getX()+xMove, this.getY()+yMove);
    return moved;
};

/**
 * Get the distance, in pixels, between *the center* of this object and another object.
 * @param {gdjs.RuntimeObject} otherObject The other object
 */
gdjs.RuntimeObject.prototype.getDistanceToObject = function(otherObject) {
    return Math.sqrt(this.getSqDistanceToObject(otherObject));
};

/**
 * Get the squared distance, in pixels, between *the center* of this object and another object.
 * @param {gdjs.RuntimeObject} otherObject The other object
 */
gdjs.RuntimeObject.prototype.getSqDistanceToObject = function(otherObject) {
    if ( otherObject === null ) return 0;

    var x = this.getDrawableX()+this.getCenterX() - (otherObject.getDrawableX()+otherObject.getCenterX());
    var y = this.getDrawableY()+this.getCenterY() - (otherObject.getDrawableY()+otherObject.getCenterY());

    return x*x+y*y;
};

/**
 * Get the distance, in pixels, between *the center* of this object and a position.
 * @param {number} targetX Target X position
 * @param {number} targetY Target Y position
 */
gdjs.RuntimeObject.prototype.getDistanceToPosition = function(targetX, targetY) {
    return Math.sqrt(this.getSqDistanceToPosition(targetX, targetY));
};

/**
 * Get the squared distance, in pixels, between *the center* of this object and a position.
 * @param {number} targetX Target X position
 * @param {number} targetY Target Y position
 */
gdjs.RuntimeObject.prototype.getSqDistanceToPosition = function(targetX, targetY) {
    var x = this.getDrawableX()+this.getCenterX() - targetX;
    var y = this.getDrawableY()+this.getCenterY() - targetY;

    return x*x+y*y;
};

/**
 * Get the squared distance, in pixels, from the *object center* to a position.
 * @param {number} pointX X position
 * @param {number} pointY Y position
 * @deprecated Use `getSqDistanceToPosition` instead.
 */
gdjs.RuntimeObject.prototype.getSqDistanceTo = gdjs.RuntimeObject.prototype.getSqDistanceToPosition;

/**
 * Get the angle, in degrees, from the *object center* to another object.
 * @param {gdjs.RuntimeObject} otherObject The other object
 */
gdjs.RuntimeObject.prototype.getAngleToObject = function(otherObject) {
    if ( otherObject === null ) return 0;

    var x = this.getDrawableX()+this.getCenterX() - (otherObject.getDrawableX()+otherObject.getCenterX());
    var y = this.getDrawableY()+this.getCenterY() - (otherObject.getDrawableY()+otherObject.getCenterY());

    return Math.atan2(-y, -x)*180/Math.PI;
}

/**
 * Get the angle, in degrees, from the *object center* to a position.
 * @param {number} targetX Target X position
 * @param {number} targetY Target Y position
 */
gdjs.RuntimeObject.prototype.getAngleToPosition = function(targetX, targetY) {
    var x = this.getDrawableX()+this.getCenterX() - targetX;
    var y = this.getDrawableY()+this.getCenterY() - targetY;

    return Math.atan2(-y, -x)*180/Math.PI;
}

/**
 * Put the object around a position, with a specific distance and angle.
 * The distance and angle are computed between the position and *the center of the object*.
 *
 * @param {number} x The x position of the target
 * @param {number} y The y position of the target
 * @param {number} distance The distance between the object and the target, in pixels.
 * @param {number} angleInDegrees The angle between the object and the target, in degrees.
 */
gdjs.RuntimeObject.prototype.putAround = function(x,y,distance,angleInDegrees) {
    var angle = angleInDegrees/180*3.14159;

    // Offset the position by the center, as PutAround* methods should position the center
    // of the object (just like GetSqDistanceTo, RaycastTest uses center too).
    this.setX(x + Math.cos(angle)*distance + this.getX() - (this.getDrawableX() + this.getCenterX()));
    this.setY(y + Math.sin(angle)*distance + this.getY() - (this.getDrawableY() + this.getCenterY()));
};

/**
 * Put the object around another object, with a specific distance and angle.
 * The distance and angle are computed between *the centers of the objects*.
 *
 * @param obj The target object
 * @param {number} distance The distance between the object and the target
 * @param {number} angleInDegrees The angle between the object and the target, in degrees.
 */
gdjs.RuntimeObject.prototype.putAroundObject = function(obj,distance,angleInDegrees) {
    this.putAround(obj.getDrawableX()+obj.getCenterX(), obj.getDrawableY()+obj.getCenterY(),
                   distance, angleInDegrees);
};

/**
 * @deprecated
 * @param objectsLists Tables of objects
 */
gdjs.RuntimeObject.prototype.separateObjectsWithoutForces = function(objectsLists) {

    //Prepare the list of objects to iterate over.
    var objects = gdjs.staticArray(gdjs.RuntimeObject.prototype.separateObjectsWithoutForces);
    objects.length = 0;

    var lists = gdjs.staticArray2(gdjs.RuntimeObject.prototype.separateObjectsWithoutForces);
    objectsLists.values(lists);
    for(var i = 0, len = lists.length;i<len;++i) {
        objects.push.apply(objects, lists[i]);
    }

    for(var i = 0, len = objects.length;i<len;++i) {
        if ( objects[i].id != this.id ) {
            if ( this.getDrawableX() < objects[i].getDrawableX() ){
                this.setX( objects[i].getDrawableX() - this.getWidth() );
            }
            else if ( this.getDrawableX()+this.getWidth() > objects[i].getDrawableX()+objects[i].getWidth() ){
                this.setX( objects[i].getDrawableX()+objects[i].getWidth() );
            }

            if ( this.getDrawableY() < objects[i].getDrawableY() ){
                this.setY( objects[i].getDrawableY() - this.getHeight() );
            }
            else if ( this.getDrawableY()+this.getHeight() > objects[i].getDrawableY()+objects[i].getHeight() ){
                this.setY( objects[i].getDrawableY()+objects[i].getHeight() );
            }
        }
    }
};

/**
 * @deprecated
 * @param objectsLists Tables of objects
 */
gdjs.RuntimeObject.prototype.separateObjectsWithForces = function(objectsLists) {
    //Prepare the list of objects to iterate over.
    var objects = gdjs.staticArray(gdjs.RuntimeObject.prototype.separateObjectsWithForces);
    objects.length = 0;

    var lists = gdjs.staticArray2(gdjs.RuntimeObject.prototype.separateObjectsWithForces);
    objectsLists.values(lists);
    for(var i = 0, len = lists.length;i<len;++i) {
        objects.push.apply(objects, lists[i]);
    }

    for(var i = 0, len = objects.length;i<len;++i) {
        if ( objects[i].id != this.id ) {
            if ( this.getDrawableX()+this.getCenterX() < objects[i].getDrawableX()+objects[i].getCenterX() )
            {
                var av = this.hasNoForces() ? 0 : this.getAverageForce().getX();
                this.addForce( -av - 10, 0, 0 );
            }
            else
            {
                var av = this.hasNoForces() ? 0 : this.getAverageForce().getX();
                this.addForce( -av + 10, 0, 0 );
            }

            if ( this.getDrawableY()+this.getCenterY() < objects[i].getDrawableY()+objects[i].getCenterY() )
            {
                var av = this.hasNoForces() ? 0 : this.getAverageForce().getY();
                this.addForce( 0, -av - 10, 0 );
            }
            else
            {
                var av = this.hasNoForces() ? 0 : this.getAverageForce().getY();
                this.addForce( 0, -av + 10, 0 );
            }
        }
    }
};

/**
 * Return true if the hitboxes of two objects are overlapping
 * @static
 * @param {gdjs.RuntimeObject} obj1 The first runtimeObject
 * @param {gdjs.RuntimeObject} obj2 The second runtimeObject
 * @param {boolean | undefined} ignoreTouchingEdges If true, then edges that are touching each other, without the hitbox polygons actually overlapping, won't be considered in collision.
 * @return {boolean} true if obj1 and obj2 are in collision
 */
gdjs.RuntimeObject.collisionTest = function(obj1, obj2, ignoreTouchingEdges) {
    // TODO: This would better be done using the object AABB (getAABB), as (`getCenterX`;`getCenterY`) point
    // is not necessarily in the middle of the object (for sprites for example).
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

    //Do a real check if necessary.
    var hitBoxes1 = obj1.getHitBoxes();
    var hitBoxes2 = obj2.getHitBoxes();
    for(var k = 0, lenBoxes1 = hitBoxes1.length;k<lenBoxes1;++k) {
        for(var l = 0, lenBoxes2 = hitBoxes2.length;l<lenBoxes2;++l) {
            if ( gdjs.Polygon.collisionTest(hitBoxes1[k], hitBoxes2[l], ignoreTouchingEdges).collision) {
                return true;
            }
        }
    }

    return false;
};

/**
 * @param {number} x The raycast source X
 * @param {number} y The raycast source Y
 * @param {number} endX The raycast end position X
 * @param {number} endY The raycast end position Y
 * @param closest {boolean} Get the closest or farthest collision mask result?
 * @return A raycast result with the contact points and distances
 */
gdjs.RuntimeObject.prototype.raycastTest = function(x, y, endX, endY, closest) {
    // TODO: This would better be done using the object AABB (getAABB), as (`getCenterX`;`getCenterY`) point
    // is not necessarily in the middle of the object (for sprites for example).
    var objW = this.getWidth();
    var objH = this.getHeight();
    var diffX = this.getDrawableX()+this.getCenterX() - x;
    var diffY = this.getDrawableY()+this.getCenterY() - y;
    var sqBoundingR = (objW*objW + objH*objH) / 4.0;
    var sqDist = (endX - x)*(endX - x) + (endY - y)*(endY - y);

    var result = gdjs.Polygon.raycastTest._statics.result;
    result.collision = false;

    if ( diffX*diffX + diffY*diffY > sqBoundingR + sqDist + 2*Math.sqrt(sqDist*sqBoundingR) )
        return result;

    var testSqDist = closest ? sqDist : 0;

    var hitBoxes = this.getHitBoxes();
    for (var i=0; i<hitBoxes.length; i++) {
        var res =  gdjs.Polygon.raycastTest(hitBoxes[i], x, y, endX, endY);
        if ( res.collision ) {
            if ( closest && (res.closeSqDist < testSqDist) ) {
                testSqDist = res.closeSqDist;
                result = res;
            }
            else if ( !closest && (res.farSqDist > testSqDist) && (res.farSqDist <= sqDist) ) {
                testSqDist = res.farSqDist;
                result = res;
            }
        }
    }

    return result;
};

/**
 * Return true if the specified position is inside object bounding box.
 *
 * The position should be in "world" coordinates, i.e use gdjs.Layer.convertCoords
 * if you need to pass the mouse or a touch position that you get from gdjs.InputManager.
 *
 */
gdjs.RuntimeObject.prototype.insideObject = function(x, y) {
    if ( this.hitBoxesDirty ) {
        this.updateHitBoxes();
        this.updateAABB();
        this.hitBoxesDirty = false;
    }
    return this.aabb.min[0] <= x && this.aabb.max[0] >= x
        && this.aabb.min[1] <= y && this.aabb.max[1] >= y;
};

/**
 * Check the distance between two objects.
 * @static
 */
gdjs.RuntimeObject.distanceTest = function(obj1, obj2, distance) {
    return obj1.getSqDistanceToObject(obj2) <= distance;
};

/**
 * Return true if the cursor, or any touch, is on the object.
 *
 * @return true if the cursor, or any touch, is on the object.
 */
gdjs.RuntimeObject.prototype.cursorOnObject = function(runtimeScene) {
    var inputManager = runtimeScene.getGame().getInputManager();
    var layer = runtimeScene.getLayer(this.layer);

    var mousePos = layer.convertCoords(inputManager.getMouseX(), inputManager.getMouseY());
    if (this.insideObject(mousePos[0], mousePos[1])) {
        return true;
    }

    var touchIds = inputManager.getAllTouchIdentifiers();
    for(var i = 0;i<touchIds.length;++i) {
        var touchPos = layer.convertCoords(inputManager.getTouchX(touchIds[i]),
            inputManager.getTouchY(touchIds[i]));

        if (this.insideObject(touchPos[0], touchPos[1])) {
            return true;
        }
    }

    return false;
};

/**
 * Check if a point is inside the object collision hitboxes.
 * @param pointX The point x coordinate.
 * @param pointY The point y coordinate.
 * @return true if the point is inside the object collision hitboxes.
 */
gdjs.RuntimeObject.prototype.isCollidingWithPoint = function(pointX, pointY) {
    var hitBoxes = this.getHitBoxes();
    for(var i = 0; i < this.hitBoxes.length; ++i) {
       if ( gdjs.Polygon.isPointInside(hitBoxes[i], pointX, pointY) )
            return true;
    }

    return false;
};

/**
 * Get the identifier associated to an object name.
 * Some features may want to compare objects name a large number of time. In this case,
 * it may be more efficient to compare objects name identifiers.
 *
 * @static
 */
gdjs.RuntimeObject.getNameIdentifier = function(name) {
    gdjs.RuntimeObject._identifiers =
        gdjs.RuntimeObject._identifiers
        || new Hashtable();

    if ( gdjs.RuntimeObject._identifiers.containsKey(name) )
        return gdjs.RuntimeObject._identifiers.get(name);

    gdjs.RuntimeObject._newId =
        (gdjs.RuntimeObject._newId || 0) + 1;
    var newIdentifier = gdjs.RuntimeObject._newId;

    gdjs.RuntimeObject._identifiers.put(name, newIdentifier);
    return newIdentifier;
};

gdjs.registerObject("", gdjs.RuntimeObject);
