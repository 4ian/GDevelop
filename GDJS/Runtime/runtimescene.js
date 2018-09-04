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
        runtimeGame ? runtimeGame.getRenderer() : null);
    this._variables = new gdjs.VariablesContainer();
    this._runtimeGame = runtimeGame;
    this._lastId = 0;
	this._name = "";
    this._timeManager = new gdjs.TimeManager(Date.now());
    this._gameStopRequested = false;
    this._requestedScene = "";
	this._isLoaded = false; // True if loadFromScene was called and the scene is being played.
	
	/** @type gdjs.RuntimeObject[] */
    this._allInstancesList = []; //An array used to create a list of all instance when necessary ( see _constructListOfAllInstances )
	
	/** @type gdjs.RuntimeObject[] */
	this._instancesRemoved = []; //The instances removed from the scene and waiting to be sent to the cache.
	
	/** @type gdjs.Profiler */
	this._profiler = null; // Set to `new gdjs.Profiler()` to have profiling done on the scene.
	this._onProfilerStopped = null; // The callback function to call when the profiler is stopped.

    this.onCanvasResized();
};

/**
 * Should be called when the canvas where the scene is rendered has been resized.
 * See gdjs.RuntimeGame.startGameLoop in particular.
 * @memberof gdjs.RuntimeScene
 */
gdjs.RuntimeScene.prototype.onCanvasResized = function() {
    this._renderer.onCanvasResized();
};

/**
 * Load the runtime scene from the given scene.
 * @param {Object} sceneData An object containing the scene data.
 * @see gdjs.RuntimeGame#getSceneData
 */
gdjs.RuntimeScene.prototype.loadFromScene = function(sceneData) {
	if ( sceneData === undefined ) {
		console.error("loadFromScene was called without a scene");
		return;
	}

	if ( this._isLoaded ) this.unloadScene();

	//Setup main properties
    if (this._runtimeGame) this._runtimeGame.getRenderer().setWindowTitle(sceneData.title);
	this._name = sceneData.name;
	this.setBackgroundColor(parseInt(sceneData.r, 10),
			parseInt(sceneData.v, 10),
			parseInt(sceneData.b, 10));

	//Load layers
	for(var i = 0, len = sceneData.layers.length;i<len;++i) {
		var layerData = sceneData.layers[i];

		this._layers.put(layerData.name, new gdjs.Layer(layerData, this));
		//console.log("Created layer : \""+name+"\".");
	}

    //Load variables
    this._variables = new gdjs.VariablesContainer(sceneData.variables);

	//Cache the initial shared data of the behaviors
	for(var i = 0, len = sceneData.behaviorsSharedData.length;i<len;++i) {
		var data = sceneData.behaviorsSharedData[i];

		//console.log("Initializing shared data for "+data.name);
		this._initialBehaviorSharedData.put(data.name, data);
	}

    var that = this;
    function loadObject(objData) {
        var objectName = objData.name;
        var objectType = objData.type;

        that._objects.put(objectName, objData);
        that._instances.put(objectName, []); //Also reserve an array for the instances
        that._instancesCache.put(objectName, []); //and for cached instances
		//And cache the constructor for the performance sake:
		that._objectsCtor.put(objectName, gdjs.getObjectConstructor(objectType));
    }

    //Load objects: Global objects first...
    var initialGlobalObjectsData = this.getGame().getInitialObjectsData();
	for(var i = 0, len = initialGlobalObjectsData.length;i<len;++i) {
		loadObject(initialGlobalObjectsData[i]);
	}
	//...then the scene objects
    this._initialObjectsData = sceneData.objects;
	for(var i = 0, len = this._initialObjectsData.length;i<len;++i) {
		loadObject(this._initialObjectsData[i]);
    }

    //Create initial instances of objects
    this.createObjectsFrom(sceneData.instances, 0, 0);

    //Set up the function to be executed at each tick
    var module = gdjs[sceneData.mangledName+"Code"];
    if ( module && module.func )
    	this._eventsFunction = module.func;
    else {
        console.log("Warning: no function found for running logic of scene " + this._name);
    	this._eventsFunction = (function() {});
    }

    this._onceTriggers = new gdjs.OnceTriggers();

    //Call global callback
	for(var i = 0;i<gdjs.callbacksRuntimeSceneLoaded.length;++i) {
		gdjs.callbacksRuntimeSceneLoaded[i](this);
	}

	if (sceneData.stopSoundsOnStartup && this._runtimeGame)
		this._runtimeGame.getSoundManager().clearAll();

    this._isLoaded = true;
	this._timeManager.reset();
};

gdjs.RuntimeScene.prototype.unloadScene = function() {
	if ( !this._isLoaded ) return;

	if (this._profiler) this.stopProfiler();

    if (this._renderer && this._renderer.onSceneUnloaded)
        this._renderer.onSceneUnloaded();

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
    this._initialObjectsData = null;
    this._eventsFunction = null;
    this._objectsCtor = new Hashtable();
    this._allInstancesList = [];
    this._instancesRemoved = [];

    this._lastId = 0;
    this._onceTriggers = null;

    this._isLoaded = false;

    this.onCanvasResized();
};

/**
 * Create objects from initial instances data ( for example, the initial instances
 * of the scene or from an external layout ).
 *
 * @param {Object} data The instances data
 * @param {number} xPos The offset on X axis
 * @param {number} yPos The offset on Y axis
 */
gdjs.RuntimeScene.prototype.createObjectsFrom = function(data, xPos, yPos) {
    for(var i = 0, len = data.length;i<len;++i) {
        var instanceData = data[i];
        var objectName = instanceData.name;
		var newObject = this.createObject(objectName);

		if ( newObject !== null ) {
            newObject.setPosition(parseFloat(instanceData.x) + xPos, parseFloat(instanceData.y) + yPos);
            newObject.setZOrder(parseFloat(instanceData.zOrder));
            newObject.setAngle(parseFloat(instanceData.angle));
            newObject.setLayer(instanceData.layer);
            newObject.getVariables().initFrom(instanceData.initialVariables, true);
            newObject.extraInitializationFromInitialInstance(instanceData);
		}
    }
};

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
	
    if (this._profiler) this._profiler.begin("events");
	this._eventsFunction(this);
	if (this._profiler) this._profiler.end("events");
	
    if (this._profiler) this._profiler.begin("objects (post-events)");
	this._updateObjects();
	if (this._profiler) this._profiler.end("objects (post-events)");
	
    if (this._profiler) this._profiler.begin("objects (visibility)");
	this._updateObjectsVisibility();
	if (this._profiler) this._profiler.end("objects (visibility)");
	
    if (this._profiler) this._profiler.begin("render");
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

/**
 * Called to update visibility of PIXI.DisplayObject of objects
 * rendered on the scene.
 *
 * Visibility is set to false if object is hidden, or if
 * object is too far from the camera of its layer ("culling").
 * @private
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
				var aabb = object.getAABB();
				if (aabb.min[0] > cameraCoords[2] || aabb.min[1] > cameraCoords[3] ||
					aabb.max[0] < cameraCoords[0] || aabb.max[1] < cameraCoords[1]) {
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
 *
 * @private
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
 * Tool function filling _allObjectsList member with all the instances.
 * @private
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
 * @private
 */
gdjs.RuntimeScene.prototype._updateObjectsPreEvents = function() {

	//It is *mandatory* to create and iterate on a external list of all objects, as the behaviors
	//may delete the objects.
	this._constructListOfAllInstances();
	for( var i = 0, len = this._allInstancesList.length;i<len;++i) {
		this._allInstancesList[i].stepBehaviorsPreEvents(this);
	}

	this._cacheOrClearRemovedInstances(); //Some behaviors may have request objects to be deleted.
};

/**
 * Update the objects (update positions, time management...)
 * @private
 */
gdjs.RuntimeScene.prototype._updateObjects = function() {
	this._cacheOrClearRemovedInstances();

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
		obj.stepBehaviorsPostEvents(this);
        obj.updateTimers(elapsedTime);
	}

	this._cacheOrClearRemovedInstances(); //Some behaviors may have request objects to be deleted.
};

/**
 * Change the background color
 */
gdjs.RuntimeScene.prototype.setBackgroundColor = function(r,g,b) {
	this._backgroundColor = parseInt(gdjs.rgbToHex(r,g,b),16);
};

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
 * @return {gdjs.RuntimeObject} The created object
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
 * @param {gdjs.RuntimeObject} object The object to be removed.
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
				allInstances.remove(i);
				break;
			}
		}
	}

	//Notify the object it was removed from the scene
	obj.onDeletedFromScene(this);
	for(var j = 0, lenj = obj._behaviors.length;j<lenj;++j) {
		obj._behaviors[j].ownerRemovedFromScene();
	}

	//Call global callback
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
 */
gdjs.RuntimeScene.prototype.getInitialSharedDataForBehavior = function(name) {
	if ( this._initialBehaviorSharedData.containsKey(name) ) {
		return this._initialBehaviorSharedData.get(name);
	}

	return null;
};

/**
 * Get the layer with the given name
 * @param {gdjs.Layer} name The name of the layer
 */
gdjs.RuntimeScene.prototype.getLayer = function(name) {
	if ( this._layers.containsKey(name) )
		return this._layers.get(name);

	return this._layers.get("");
};

gdjs.RuntimeScene.prototype.hasLayer = function(name) {
	return this._layers.containsKey(name);
};

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
	if (!this._profiler) return null;

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