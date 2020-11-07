// @ts-check
/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * The runtimeScene object represents a scene being played and rendered in the browser in a canvas.
 *
 * @class RuntimeScene
 * @memberof gdjs
 * @param {gdjs.RuntimeGame} runtimeGame The game associated to this scene.
 */
gdjs.RuntimeScene = function(runtimeGame)
{
    this._eventsFunction = null;
    this._instances = new Hashtable(); //Contains the instances living on the scene
    this._instancesCache = new Hashtable(); //Used to recycle destroyed instance instead of creating new ones.
    this._objects = new Hashtable(); //Contains the objects data stored in the project
    this._objectsCtor = new Hashtable();
    this._layers = new Hashtable();
    this._initialBehaviorSharedData = new Hashtable();
    this._renderer = new gdjs.RuntimeSceneRenderer(this,
        // @ts-ignore - allow no renderer for tests
        runtimeGame ? runtimeGame.getRenderer() : null);
    this._variables = new gdjs.VariablesContainer();
    this._runtimeGame = runtimeGame;
    this._lastId = 0;
    this._name = "";
    this._timeManager = new gdjs.TimeManager();
    this._gameStopRequested = false;
    this._requestedScene = "";
    this._isLoaded = false; // True if loadFromScene was called and the scene is being played.
    this._isJustResumed = false; // True in the first frame after resuming the paused scene
    this._requestedChange = gdjs.RuntimeScene.CONTINUE; // What to do after the frame is rendered.

    this._backgroundColor = 0; // Black background by default.

    /** @type {gdjs.RuntimeObject[]} */
    this._allInstancesList = []; //An array used to create a list of all instance when necessary ( see _constructListOfAllInstances )

    this._onceTriggers = new gdjs.OnceTriggers();

    /** @type {Object.<string, number[]>} */
    this._layersCameraCoordinates = {};

    /** @type {gdjs.RuntimeObject[]} */
    this._instancesRemoved = []; //The instances removed from the scene and waiting to be sent to the cache.

    /** @type {?gdjs.Profiler} */
    this._profiler = null; // Set to `new gdjs.Profiler()` to have profiling done on the scene.
    this._onProfilerStopped = null; // The callback function to call when the profiler is stopped.

    this.onGameResolutionResized();
};

/**
 * Should be called when the canvas where the scene is rendered has been resized.
 * See gdjs.RuntimeGame.startGameLoop in particular.
 * @memberof gdjs.RuntimeScene
 */
gdjs.RuntimeScene.prototype.onGameResolutionResized = function() {
    for(var name in this._layers.items) {
        if (this._layers.items.hasOwnProperty(name)) {
            /** @type gdjs.Layer */
            var theLayer = this._layers.items[name];

            theLayer.onGameResolutionResized();
        }
    }

    this._renderer.onGameResolutionResized();
};

/**
 * Load the runtime scene from the given scene.
 * @param {?LayoutData} sceneData An object containing the scene data.
 * @see gdjs.RuntimeGame#getSceneData
 */
gdjs.RuntimeScene.prototype.loadFromScene = function(sceneData) {
    if (!sceneData) {
        console.error("loadFromScene was called without a scene");
        return;
    }

    if ( this._isLoaded ) this.unloadScene();

    //Setup main properties
    if (this._runtimeGame) this._runtimeGame.getRenderer().setWindowTitle(sceneData.title);
    this._name = sceneData.name;
    this.setBackgroundColor(sceneData.r, sceneData.v, sceneData.b);

    //Load layers
    for(var i = 0, len = sceneData.layers.length;i<len;++i) {
        this.addLayer(sceneData.layers[i]);
    }

    //Load variables
    this._variables = new gdjs.VariablesContainer(sceneData.variables);

    //Cache the initial shared data of the behaviors
    for(var i = 0, len = sceneData.behaviorsSharedData.length;i<len;++i) {
        var behaviorSharedData = sceneData.behaviorsSharedData[i];

        this.setInitialSharedDataForBehavior(behaviorSharedData.name, behaviorSharedData);
    }

    //Registering objects: Global objects first...
    var initialGlobalObjectsData = this.getGame().getInitialObjectsData();
    for(var i = 0, len = initialGlobalObjectsData.length;i<len;++i) {
        this.registerObject(initialGlobalObjectsData[i]);
    }
    //...then the scene objects
    for(var i = 0, len = sceneData.objects.length;i<len;++i) {
        this.registerObject(sceneData.objects[i]);
    }

    //Create initial instances of objects
    this.createObjectsFrom(sceneData.instances, 0, 0, /*trackByPersistentUuid=*/ true);

    // Set up the default z order (for objects created from events)
    this._setLayerDefaultZOrders();

    //Set up the function to be executed at each tick
    this.setEventsGeneratedCodeFunction(sceneData);

    this._onceTriggers = new gdjs.OnceTriggers();

    // Notify the global callbacks
    if (this._runtimeGame && !this._runtimeGame.wasFirstSceneLoaded()) {
        for(var i = 0;i<gdjs.callbacksFirstRuntimeSceneLoaded.length;++i) {
            gdjs.callbacksFirstRuntimeSceneLoaded[i](this);
        }
    }
    for(var i = 0;i<gdjs.callbacksRuntimeSceneLoaded.length;++i) {
        gdjs.callbacksRuntimeSceneLoaded[i](this);
    }

    if (sceneData.stopSoundsOnStartup && this._runtimeGame)
        this._runtimeGame.getSoundManager().clearAll();

    this._isLoaded = true;
    this._timeManager.reset();
};

/**
 * Check if an object is registered, meaning that instances of it can be created and lives in the scene.
 * @see gdjs.RuntimeScene#registerObject
 */
gdjs.RuntimeScene.prototype.isObjectRegistered = function(objectName) {
    return (
        this._objects.containsKey(objectName) &&
        this._instances.containsKey(objectName) &&
        this._instancesCache.containsKey(objectName) &&
        this._objectsCtor.containsKey(objectName)
    );
}

/**
 * Register a {@link gdjs.RuntimeObject} so that instances of it can be used in the scene.
 * @param {ObjectData} objectData The data for the object to register.
 */
gdjs.RuntimeScene.prototype.registerObject = function(objectData) {
    this._objects.put(objectData.name, objectData);
    this._instances.put(objectData.name, []); //Also reserve an array for the instances
    this._instancesCache.put(objectData.name, []); //and for cached instances
    this._objectsCtor.put(objectData.name, gdjs.getObjectConstructor(objectData.type)); //And cache the constructor for the performance sake
}

/**
 * Update the data of a {@link gdjs.RuntimeObject} so that instances use this when constructed.
 * @param {ObjectData} objectData The data for the object to register.
 */
gdjs.RuntimeScene.prototype.updateObject = function(objectData) {
    if (!this.isObjectRegistered(objectData.name)) {
        console.warn(
            "Tried to call updateObject for an object that was not registered (" +
            objectData.name +
            "). Call registerObject first."
        );
    }

    this._objects.put(objectData.name, objectData);
    // Don't erase instances, nor instances cache, or objectsCtor cache.
}

/**
 * Unregister a {@link gdjs.RuntimeObject}. Instances will be destroyed.
 * @param {string} objectName The name of the object to unregister.
 */
gdjs.RuntimeScene.prototype.unregisterObject = function(objectName) {
    var instances = this._instances.get(objectName);
    if (instances) {
        // This is sub-optimal: markObjectForDeletion will search the instance to
        // remove in instances, so cost is O(n^2), n being the number of instances.
        // As we're unregistering an object which only happen during a hot-reloading,
        // this is fine.
        var instancesToRemove = instances.slice();
        for(var i = 0;i<instancesToRemove.length;i++) {
            this.markObjectForDeletion(instancesToRemove[i]);
        }
        this._cacheOrClearRemovedInstances();
    }
    this._objects.remove(objectName);
    this._instances.remove(objectName);
    this._instancesCache.remove(objectName);
    this._objectsCtor.remove(objectName);
}

/**
 * Called when a scene is "paused", i.e it will be not be rendered again
 * for some time, until it's resumed or unloaded.
 */
gdjs.RuntimeScene.prototype.onPause = function() {
    for(var i = 0;i < gdjs.callbacksRuntimeScenePaused.length;++i) {
        gdjs.callbacksRuntimeScenePaused[i](this);
    }
}

/**
 * Called when a scene is "resumed", i.e it will be rendered again
 * on screen after having being paused.
 */
gdjs.RuntimeScene.prototype.onResume = function() {
    this._isJustResumed = true;

    for(var i = 0;i < gdjs.callbacksRuntimeSceneResumed.length;++i) {
        gdjs.callbacksRuntimeSceneResumed[i](this);
    }
}

/**
 * Called before a scene is removed from the stack of scenes
 * rendered on the screen.
 */
gdjs.RuntimeScene.prototype.unloadScene = function() {
    if ( !this._isLoaded ) return;

    if (this._profiler) this.stopProfiler();

    // Notify the global callbacks (which should not release resources yet,
    // as other callbacks might still refer to the objects/scene).
    for(var i = 0;i < gdjs.callbacksRuntimeSceneUnloading.length;++i) {
        gdjs.callbacksRuntimeSceneUnloading[i](this);
    }

    // Notify the objects they are being destroyed
    this._constructListOfAllInstances();
    for(var i = 0, len = this._allInstancesList.length;i<len;++i) {
        var object = this._allInstancesList[i];
        object.onDestroyFromScene(this);
    }

    // Notify the renderer
    if (this._renderer) this._renderer.onSceneUnloaded();

    // Notify the global callbacks (after notifying objects and renderer, because
    // callbacks from extensions might want to free resources - which can't be done
    // safely before destroying objects and the renderer).
    for(var i = 0;i < gdjs.callbacksRuntimeSceneUnloaded.length;++i) {
        gdjs.callbacksRuntimeSceneUnloaded[i](this);
    }

    // It should not be necessary to reset these variables, but this help
    // ensuring that all memory related to the RuntimeScene is released immediately.
    this._layers = new Hashtable();
    this._variables = new gdjs.VariablesContainer();
    this._initialBehaviorSharedData = new Hashtable();
    this._objects = new Hashtable();
    this._instances = new Hashtable();
    this._instancesCache = new Hashtable();
    this._eventsFunction = null;
    this._objectsCtor = new Hashtable();
    this._allInstancesList = [];
    this._instancesRemoved = [];

    this._lastId = 0;

    // @ts-ignore - set to null to force garbage collection.
    this._onceTriggers = null;

    this._isLoaded = false;

    this.onGameResolutionResized();
};

/**
 * Create objects from initial instances data ( for example, the initial instances
 * of the scene or from an external layout ).
 *
 * @param {InstanceData[]} data The instances data
 * @param {number} xPos The offset on X axis
 * @param {number} yPos The offset on Y axis
 * @param {boolean} trackByPersistentUuid If true, objects are tracked by setting their persistentUuid
 * to the same as the associated instance. Useful for hot-reloading when instances are changed.
 */
gdjs.RuntimeScene.prototype.createObjectsFrom = function(data, xPos, yPos, trackByPersistentUuid) {
    for(var i = 0, len = data.length;i<len;++i) {
        var instanceData = data[i];
        var objectName = instanceData.name;
        var newObject = this.createObject(objectName);

        if ( newObject !== null ) {
            if (trackByPersistentUuid) {
                // Give the object the same persistentUuid as the instance, so that
                // it can be hot-reloaded.
                newObject.persistentUuid = instanceData.persistentUuid || null;
            }

            newObject.setPosition(instanceData.x + xPos, instanceData.y + yPos);
            newObject.setZOrder(instanceData.zOrder);
            newObject.setAngle(instanceData.angle);
            newObject.setLayer(instanceData.layer);
            newObject.getVariables().initFrom(instanceData.initialVariables, true);
            newObject.extraInitializationFromInitialInstance(instanceData);
        }
    }
};

/**
 * Set the default Z order for each layer, which is the highest Z order found on each layer.
 * Useful as it ensures that instances created from events are, by default, shown in front
 * of other instances.
 * @private
 */
gdjs.RuntimeScene.prototype._setLayerDefaultZOrders = function() {
    if (this._runtimeGame.getGameData().properties.useDeprecatedZeroAsDefaultZOrder) {
        // Deprecated option to still support games that were made considered 0 as the
        // default Z order for all layers.
        return;
    }

    /** @type {Object.<string, number>} */
    var layerHighestZOrders = {};

    var allInstances = this.getAdhocListOfAllInstances();
    for(var i = 0, len = allInstances.length;i<len;++i) {
        var object = allInstances[i];
        var layerName = object.getLayer();
        var zOrder = object.getZOrder();

        if (layerHighestZOrders[layerName] === undefined || layerHighestZOrders[layerName] < zOrder)
            layerHighestZOrders[layerName] = zOrder;
    }

    for(var layerName in layerHighestZOrders) {
        this.getLayer(layerName).setDefaultZOrder(layerHighestZOrders[layerName] + 1);
    }
}

/**
 * Set the function called each time the scene is stepped to be the events generated code,
 * which is by convention assumed to be a function in `gdjs` with a name based on the scene
 * mangled name.
 *
 * @param {LayoutData} sceneData The scene data, used to find where the code was generated.
 */
gdjs.RuntimeScene.prototype.setEventsGeneratedCodeFunction = function(sceneData) {
    var module = gdjs[sceneData.mangledName+"Code"];
    if (module && module.func)
        this._eventsFunction = module.func;
    else {
        console.log("Warning: no function found for running logic of scene " + this._name);
        this._eventsFunction = (function() {});
    }
}

/**
 * Set the function called each time the scene is stepped.
 * The function will be passed the `runtimeScene` as argument.
 *
 * Note that this is already set up by the gdjs.RuntimeScene constructor and that you should
 * not need to use this method.
 *
 * @param {Function} func The function to be called.
 */
gdjs.RuntimeScene.prototype.setEventsFunction = function(func) {
    this._eventsFunction = func;
};

/**
 * Step and render the scene.
 * @return {boolean} true if the game loop should continue, false if a scene change/push/pop
 * or a game stop was requested.
 */
gdjs.RuntimeScene.prototype.renderAndStep = function(elapsedTime) {
    if (this._profiler) this._profiler.beginFrame();

    this._requestedChange = gdjs.RuntimeScene.CONTINUE;
    this._timeManager.update(elapsedTime, this._runtimeGame.getMinimalFramerate());

    if (this._profiler) this._profiler.begin("objects (pre-events)");
    this._updateObjectsPreEvents();
    if (this._profiler) this._profiler.end("objects (pre-events)");

    if (this._profiler) this._profiler.begin("callbacks and extensions (pre-events)");
    for(var i = 0;i < gdjs.callbacksRuntimeScenePreEvents.length;++i) {
        gdjs.callbacksRuntimeScenePreEvents[i](this);
    }
    if (this._profiler) this._profiler.end("callbacks and extensions (pre-events)");

    if (this._profiler) this._profiler.begin("events");
    this._eventsFunction(this);
    if (this._profiler) this._profiler.end("events");

    if (this._profiler) this._profiler.begin("objects (post-events)");
    this._updateObjectsPostEvents();
    if (this._profiler) this._profiler.end("objects (post-events)");

    if (this._profiler) this._profiler.begin("callbacks and extensions (post-events)");
    for(var i = 0;i < gdjs.callbacksRuntimeScenePostEvents.length;++i) {
        gdjs.callbacksRuntimeScenePostEvents[i](this);
    }
    if (this._profiler) this._profiler.end("callbacks and extensions (post-events)");

    if (this._profiler) this._profiler.begin("objects (visibility)");
    this._updateObjectsVisibility();
    if (this._profiler) this._profiler.end("objects (visibility)");

    if (this._profiler) this._profiler.begin("layers (effects update)");
    this._updateLayers();
    if (this._profiler) this._profiler.end("layers (effects update)");

    if (this._profiler) this._profiler.begin("render");

    // Uncomment to enable debug rendering (look for the implementation in the renderer
    // to see what is rendered)
    // if (this._layersCameraCoordinates) {
    //  this.getRenderer().renderDebugDraw(this._allInstancesList, this._layersCameraCoordinates); //TODO
    // }

    this._isJustResumed = false;

    this.render();
    if (this._profiler) this._profiler.end("render");

    if (this._profiler) this._profiler.endFrame();

    return !!this.getRequestedChange();
};

/**
 * Render the PIXI container associated to the runtimeScene.
 */
gdjs.RuntimeScene.prototype.render = function() {
    this._renderer.render();
};

gdjs.RuntimeScene.prototype._updateLayersCameraCoordinates = function() {
    this._layersCameraCoordinates = this._layersCameraCoordinates || {};

    for(var name in this._layers.items) {
        if (this._layers.items.hasOwnProperty(name)) {
            var theLayer = this._layers.items[name];

            this._layersCameraCoordinates[name] = this._layersCameraCoordinates[name] ||
                [0,0,0,0];
            this._layersCameraCoordinates[name][0] = theLayer.getCameraX() - theLayer.getCameraWidth();
            this._layersCameraCoordinates[name][1] = theLayer.getCameraY() - theLayer.getCameraHeight();
            this._layersCameraCoordinates[name][2] = theLayer.getCameraX() + theLayer.getCameraWidth();
            this._layersCameraCoordinates[name][3] = theLayer.getCameraY() + theLayer.getCameraHeight();
        }
    }
}

gdjs.RuntimeScene.prototype._updateLayers = function() {
    for(var name in this._layers.items) {
        if (this._layers.items.hasOwnProperty(name)) {
            /** @type gdjs.Layer */
            var theLayer = this._layers.items[name];

            theLayer.update(this);
        }
    }
}

/**
 * Called to update visibility of PIXI.DisplayObject of objects
 * rendered on the scene.
 *
 * Visibility is set to false if object is hidden, or if
 * object is too far from the camera of its layer ("culling").
 */
gdjs.RuntimeScene.prototype._updateObjectsVisibility = function() {
    if (this._timeManager.isFirstFrame()) {
        this._constructListOfAllInstances();
        for( var i = 0, len = this._allInstancesList.length;i<len;++i) {
            var object = this._allInstancesList[i];
            var rendererObject = object.getRendererObject();

            if (rendererObject)
                object.getRendererObject().visible = !object.isHidden();
        }

        return;
    } else {
        //After first frame, optimise rendering by setting only objects
        //near camera as visible.
        this._updateLayersCameraCoordinates();
        this._constructListOfAllInstances();
        for( var i = 0, len = this._allInstancesList.length;i<len;++i) {
            var object = this._allInstancesList[i];
            var cameraCoords = this._layersCameraCoordinates[object.getLayer()];
            var rendererObject = object.getRendererObject();

            if (!cameraCoords || !rendererObject) continue;

            if (object.isHidden()) {
                rendererObject.visible = false;
            } else {
                var aabb = object.getVisibilityAABB();
                if (aabb && // If no AABB is returned, the object should always be visible
                    (aabb.min[0] > cameraCoords[2] || aabb.min[1] > cameraCoords[3] ||
                    aabb.max[0] < cameraCoords[0] || aabb.max[1] < cameraCoords[1])) {
                    rendererObject.visible = false;
                } else {
                    rendererObject.visible = true;
                }
            }
        }
    }
};

/**
 * Empty the list of the removed objects:<br>
 * When an object is removed from the scene, it is still kept in the _instancesRemoved member
 * of the RuntimeScene.<br>
 * This method should be called regularly (after events or behaviors steps) so as to clear this list
 * and allows the removed objects to be cached (or destroyed if the cache is full).<br>
 * The removed objects could not be sent directly to the cache, as events may still be using them after
 * removing them from the scene for example.
 */
gdjs.RuntimeScene.prototype._cacheOrClearRemovedInstances = function() {
    for(var k =0, lenk=this._instancesRemoved.length;k<lenk;++k) {
        //Cache the instance to recycle it into a new instance later.
        var cache = this._instancesCache.get(this._instancesRemoved[k].getName());
        if ( cache.length < 128 ) cache.push(this._instancesRemoved[k]);
    }

    this._instancesRemoved.length = 0;
};

/**
 * Tool function filling _allInstancesList member with all the living object instances.
 */
gdjs.RuntimeScene.prototype._constructListOfAllInstances = function() {
    var currentListSize = 0;
    for (var name in this._instances.items) {
        if (this._instances.items.hasOwnProperty(name)) {
            var list = this._instances.items[name];

            var oldSize = currentListSize;
            currentListSize += list.length;

            for(var j = 0, lenj = list.length;j<lenj;++j) {
                if (oldSize+j < this._allInstancesList.length)
                    this._allInstancesList[oldSize+j] = list[j];
                else
                    this._allInstancesList.push(list[j]);
            }
        }
    }

    this._allInstancesList.length = currentListSize;
};

/**
 * Update the objects before launching the events.
 */
gdjs.RuntimeScene.prototype._updateObjectsPreEvents = function() {

    //It is *mandatory* to create and iterate on a external list of all objects, as the behaviors
    //may delete the objects.
    this._constructListOfAllInstances();
    for( var i = 0, len = this._allInstancesList.length;i<len;++i) {
        var obj = this._allInstancesList[i];
        var elapsedTime = obj.getElapsedTime(this);
        if (!obj.hasNoForces()) {
            var averageForce = obj.getAverageForce();
            var elapsedTimeInSeconds = elapsedTime / 1000;

            obj.setX(obj.getX() + averageForce.getX() * elapsedTimeInSeconds);
            obj.setY(obj.getY() + averageForce.getY() * elapsedTimeInSeconds);
            obj.update(this);
            obj.updateForces(elapsedTimeInSeconds);
        } else {
            obj.update(this);
        }
        obj.updateTimers(elapsedTime);
        this._allInstancesList[i].stepBehaviorsPreEvents(this);
    }

    this._cacheOrClearRemovedInstances(); //Some behaviors may have request objects to be deleted.
};

/**
 * Update the objects (update positions, time management...)
 */
gdjs.RuntimeScene.prototype._updateObjectsPostEvents = function() {
    this._cacheOrClearRemovedInstances();

    //It is *mandatory* to create and iterate on a external list of all objects, as the behaviors
    //may delete the objects.
    this._constructListOfAllInstances();
    for( var i = 0, len = this._allInstancesList.length;i<len;++i) {
        this._allInstancesList[i].stepBehaviorsPostEvents(this);
    }

    this._cacheOrClearRemovedInstances(); //Some behaviors may have request objects to be deleted.
};

/**
 * Change the background color, by setting the RGB components.
 * Internally, the color is stored as an hexadecimal number.
 *
 * @param {number} r The color red component (0-255).
 * @param {number} g The color green component (0-255).
 * @param {number} b The color blue component (0-255).
 */
gdjs.RuntimeScene.prototype.setBackgroundColor = function(r,g,b) {
    this._backgroundColor = parseInt(gdjs.rgbToHex(r,g,b),16);
};


/**
 * Get the background color, as an hexadecimal number.
 * @returns {number} The current background color.
 */
gdjs.RuntimeScene.prototype.getBackgroundColor = function() {
    return this._backgroundColor;
}

/**
 * Get the name of the scene.
 */
gdjs.RuntimeScene.prototype.getName = function() {
    return this._name;
};

/**
 * Update the objects positions according to their forces
 */
gdjs.RuntimeScene.prototype.updateObjectsForces = function() {
    for (var name in this._instances.items) {
        if (this._instances.items.hasOwnProperty(name)) {
            var list = this._instances.items[name];

            for(var j = 0, listLen = list.length;j<listLen;++j) {
                var obj = list[j];
                if (!obj.hasNoForces()) {
                    var averageForce = obj.getAverageForce();
                    var elapsedTimeInSeconds = obj.getElapsedTime(this) / 1000;

                    obj.setX(obj.getX() + averageForce.getX() * elapsedTimeInSeconds);
                    obj.setY(obj.getY() + averageForce.getY() * elapsedTimeInSeconds);
                    obj.updateForces(elapsedTimeInSeconds);
                }
            }
        }
    }
};

/**
 * Add an object to the instances living on the scene.
 * @param obj The object to be added.
 */
gdjs.RuntimeScene.prototype.addObject = function(obj) {
    if ( !this._instances.containsKey(obj.name) ) {
        console.log("RuntimeScene.addObject: No objects called \""+obj.name+"\"! Adding it.");
        this._instances.put(obj.name, []);
    }

    this._instances.get(obj.name).push(obj);
};

/**
 * Get all the instances of the object called name.
 * @param {string} name Name of the object for which the instances must be returned.
 * @return {gdjs.RuntimeObject[]} The list of objects with the given name
 */
gdjs.RuntimeScene.prototype.getObjects = function(name){
    if ( !this._instances.containsKey(name) ) {
        console.log("RuntimeScene.getObjects: No instances called \""+name+"\"! Adding it.");
        this._instances.put(name, []);
    }

    return this._instances.get(name);
};

/**
 * Create a new object from its name. The object is also added to the instances
 * living on the scene ( No need to call RuntimeScene.addObject )
 * @param {string} objectName The name of the object to be created
 * @return {?gdjs.RuntimeObject} The created object
 */
gdjs.RuntimeScene.prototype.createObject = function(objectName){

    if ( !this._objectsCtor.containsKey(objectName) ||
        !this._objects.containsKey(objectName) )
        return null; //There is no such object in this scene.

    //Create a new object using the object constructor ( cached during loading )
    //and the stored object's data:
    var cache = this._instancesCache.get(objectName);
    var ctor = this._objectsCtor.get(objectName);
    var obj = null;
    if ( cache.length === 0 ) {
        obj = new ctor(this, this._objects.get(objectName));
    }
    else {
        //Reuse an objet destroyed before:
        obj = cache.pop();
        ctor.call(obj, this, this._objects.get(objectName));
    }

    this.addObject(obj);
    return obj;
};

/**
 * Must be called whenever an object must be removed from the scene.
 * @param {gdjs.RuntimeObject} obj The object to be removed.
 */
gdjs.RuntimeScene.prototype.markObjectForDeletion = function(obj) {
    //Add to the objects removed list.
    //The objects will be sent to the instances cache or really deleted from memory later.
    if ( this._instancesRemoved.indexOf(obj) === -1 ) this._instancesRemoved.push(obj);

    //Delete from the living instances.
    if ( this._instances.containsKey(obj.getName()) ) {
        var objId = obj.id;
        var allInstances = this._instances.get(obj.getName());
        for(var i = 0, len = allInstances.length;i<len;++i) {
            if (allInstances[i].id == objId) {
                allInstances.splice(i, 1);
                break;
            }
        }
    }

    //Notify the object it was removed from the scene
    obj.onDestroyFromScene(this);

    // Notify the global callbacks
    for(var j = 0;j<gdjs.callbacksObjectDeletedFromScene.length;++j) {
        gdjs.callbacksObjectDeletedFromScene[j](this, obj);
    }

    return;
};

/**
 * Create an identifier for a new object of the scene.
 */
gdjs.RuntimeScene.prototype.createNewUniqueId = function() {
    this._lastId++;
    return this._lastId;
};

/**
 * Get the renderer associated to the RuntimeScene.
 */
gdjs.RuntimeScene.prototype.getRenderer = function() {
    return this._renderer;
};

/**
 * Get the runtimeGame associated to the RuntimeScene.
 */
gdjs.RuntimeScene.prototype.getGame = function() {
    return this._runtimeGame;
};

/**
 * Get the variables of the runtimeScene.
 * @return The container holding the variables of the scene.
 */
gdjs.RuntimeScene.prototype.getVariables = function() {
    return this._variables;
};

/**
 * Get the data representing the initial shared data of the scene for the specified behavior.
 * @param {string} name The name of the behavior
 * @returns {?BehaviorSharedData} The shared data for the behavior, if any.
 */
gdjs.RuntimeScene.prototype.getInitialSharedDataForBehavior = function(name) {
    const behaviorSharedData = this._initialBehaviorSharedData.get(name);
    if (behaviorSharedData) {
        return behaviorSharedData;
    }

    console.error("Can't find shared data for behavior with name:", name);
    return null;
};

/**
 * Set the data representing the initial shared data of the scene for the specified behavior.
 * @param {string} name The name of the behavior
 * @param {?BehaviorSharedData} sharedData The shared data for the behavior, or null to remove it.
 */
gdjs.RuntimeScene.prototype.setInitialSharedDataForBehavior = function(name, sharedData) {
    this._initialBehaviorSharedData.put(name, sharedData);
};

/**
 * Get the layer with the given name
 * @param {string} name The name of the layer
 * @returns {gdjs.Layer} The layer, or the base layer if not found
 */
gdjs.RuntimeScene.prototype.getLayer = function(name) {
    if ( this._layers.containsKey(name) )
        return this._layers.get(name);

    return this._layers.get("");
};

/**
 * Check if a layer exists
 * @param {string} name The name of the layer
 */
gdjs.RuntimeScene.prototype.hasLayer = function(name) {
    return this._layers.containsKey(name);
};

/**
 * Add a layer.
 * @param {LayerData} layerData The data to construct the layer
 */
gdjs.RuntimeScene.prototype.addLayer = function(layerData) {
    this._layers.put(layerData.name, new gdjs.Layer(layerData, this));
};

/**
 * Remove a layer. All {@link gdjs.RuntimeObject} on this layer will
 * be moved back to the base layer.
 * @param {string} layerName The name of the layer to remove
 */
gdjs.RuntimeScene.prototype.removeLayer = function(layerName) {
    var allInstances = this.getAdhocListOfAllInstances();
    for(var i = 0;i < allInstances.length;++i) {
        var runtimeObject = allInstances[i];
        if (runtimeObject.getLayer() === layerName) {
            runtimeObject.setLayer("");
        }
    }

    this._layers.remove(layerName);
}

/**
 * Change the position of a layer.
 *
 * @param {string} layerName The name of the layer to reorder
 * @param {number} index The new position in the list of layers
 */
gdjs.RuntimeScene.prototype.setLayerIndex = function(layerName, index) {
    /** @type {gdjs.Layer} */
    var layer = this._layers.get(layerName);
    if (!layer) return;

    this._renderer.setLayerIndex(layer, index);
};

/**
 * Fill the array passed as argument with the names of all layers
 * @param {string[]} result The array where to put the layer names
 */
gdjs.RuntimeScene.prototype.getAllLayerNames = function(result) {
    this._layers.keys(result);
};

/**
 * Get the TimeManager of the scene.
 * @return {gdjs.TimeManager} The gdjs.TimeManager of the scene.
 */
gdjs.RuntimeScene.prototype.getTimeManager = function() {
    return this._timeManager;
};

/**
 * Shortcut to get the SoundManager of the game.
 * @return {gdjs.SoundManager} The gdjs.SoundManager of the game.
 */
gdjs.RuntimeScene.prototype.getSoundManager = function() {
    return this._runtimeGame.getSoundManager();
};

//The flags to describe the change request by a scene:
gdjs.RuntimeScene.CONTINUE = 0;
gdjs.RuntimeScene.PUSH_SCENE = 1;
gdjs.RuntimeScene.POP_SCENE = 2;
gdjs.RuntimeScene.REPLACE_SCENE = 3;
gdjs.RuntimeScene.CLEAR_SCENES = 4;
gdjs.RuntimeScene.STOP_GAME = 5;

/**
 * Return the value of the scene change that is requested.
 */
gdjs.RuntimeScene.prototype.getRequestedChange = function() {
    return this._requestedChange;
};

/**
 * Return the name of the new scene to be launched.
 *
 * See requestChange.
 */
gdjs.RuntimeScene.prototype.getRequestedScene = function() {
    return this._requestedScene;
};

/**
 * Request a scene change to be made. The change is handled externally (see gdjs.SceneStack)
 * thanks to getRequestedChange and getRequestedScene methods.
 * @param {number} change One of gdjs.RuntimeScene.CONTINUE|PUSH_SCENE|POP_SCENE|REPLACE_SCENE|CLEAR_SCENES|STOP_GAME.
 * @param {string} sceneName The name of the new scene to launch, if applicable.
 */
gdjs.RuntimeScene.prototype.requestChange = function(change, sceneName) {
    this._requestedChange = change;
    this._requestedScene = sceneName;
};

/**
 * Get the profiler associated with the scene, or null if none.
 */
gdjs.RuntimeScene.prototype.getProfiler = function() {
    return this._profiler;
}

/**
 * Start a new profiler to measures the time passed in sections of the engine
 * in the scene.
 * @param {Function} onProfilerStopped Function to be called when the profiler is stopped. Will be passed the profiler as argument.
 */
gdjs.RuntimeScene.prototype.startProfiler = function(onProfilerStopped) {
    if (this._profiler) return;

    this._profiler = new gdjs.Profiler();
    this._onProfilerStopped = onProfilerStopped;
}

/**
 * Stop the profiler being run on the scene.
 */
gdjs.RuntimeScene.prototype.stopProfiler = function() {
    if (!this._profiler) return;

    var oldProfiler = this._profiler;
    var onProfilerStopped = this._onProfilerStopped;
    this._profiler = null;
    this._onProfilerStopped = null;

    if (onProfilerStopped) {
        onProfilerStopped(oldProfiler);
    }
}

/**
 * Get the structure containing the triggers for "Trigger once" conditions.
 */
gdjs.RuntimeScene.prototype.getOnceTriggers = function() {
    return this._onceTriggers;
}

/**
 * Get a list of all gdjs.RuntimeObject living on the scene.
 * You should not, normally, need this method at all. It's only to be used
 * in exceptional use cases where you need to loop through all objects,
 * and it won't be performant.
 *
 * @returns {gdjs.RuntimeObject[]} The list of all runtime objects on the scnee
 */
gdjs.RuntimeScene.prototype.getAdhocListOfAllInstances = function() {
    this._constructListOfAllInstances();
    return this._allInstancesList;
}

/**
 * Check if the scene was just resumed.
 * This is true during the first frame after the scene has been unpaused.
 *
 * @returns {boolean} true if the scene was just resumed
 */
gdjs.RuntimeScene.prototype.sceneJustResumed = function() {
    return this._isJustResumed;
}
