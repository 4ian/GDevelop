/*
 * GDevelop JS Platform
 * Copyright 2013-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * The runtimeScene object represents a scene being played and rendered in the browser in a canvas.
 *
 * @class RuntimeScene
 * @param PixiRenderer The PIXI.Renderer to be used
 */
gdjs.RuntimeScene = function(runtimeGame, pixiRenderer)
{
    this._eventsFunction = null;
    this._instances = new Hashtable(); //Contains the instances living on the scene
	this._instancesCache = new Hashtable(); //Used to recycle destroyed instance instead of creating new ones.
    this._objects = new Hashtable(); //Contains the objects data stored in the project
    this._objectsCtor = new Hashtable();
    this._layers = new Hashtable();
    this._timers = new Hashtable();
	this._initialAutomatismSharedData = new Hashtable();
    this._pixiRenderer = pixiRenderer;
    this._pixiContainer = new PIXI.Container(); //The Container meant to contains all pixi objects of the scene.
    this._latestFrameDate = new Date();
    this._variables = new gdjs.VariablesContainer();
    this._runtimeGame = runtimeGame;
    this._lastId = 0;
    this._elapsedTime = 0;
    this._timeScale = 1;
    this._timeFromStart = 0;
    this._firstFrame = true;
	this._name = "";
    this._soundManager = new gdjs.SoundManager();
    this._gameStopRequested = false;
    this._requestedScene = "";
    this._isLoaded = false; // True if loadFromScene was called and the scene is being played.
    this.layers = this._layers;
    this._allInstancesList = []; //An array used to create a list of all instance when necessary ( see _constructListOfAllInstances )
    this._instancesRemoved = []; //The instances removed from the scene and waiting to be sent to the cache.

    if (this._pixiRenderer) {
    	this.onCanvasResized();
    }
};

/**
 * Should be called when the canvas where the scene is rendered has been resized.
 * See gdjs.RuntimeGame.startStandardGameLoop in particular.
 *
 * @method onCanvasResized
 */
gdjs.RuntimeScene.prototype.onCanvasResized = function() {
    this._pixiContainer.scale.x = this._pixiRenderer.width / this._runtimeGame.getDefaultWidth();
    this._pixiContainer.scale.y = this._pixiRenderer.height / this._runtimeGame.getDefaultHeight();
};

/**
 * Load the runtime scene from the given scene.
 * @method loadFromScene
 * @param sceneData An object containing the scene data.
 */
gdjs.RuntimeScene.prototype.loadFromScene = function(sceneData) {
	if ( sceneData === undefined ) {
		console.error("loadFromScene was called without a scene");
		return;
	}

	if ( this._isLoaded ) this.unloadScene();

	//Setup main properties
	document.title = sceneData.title;
	this._name = sceneData.name;
	this._firstFrame = true;
	this.setBackgroundColor(parseInt(sceneData.r, 10),
			parseInt(sceneData.v, 10),
			parseInt(sceneData.b, 10));

	//Load layers
    var that = this;
	gdjs.iterateOverArray(sceneData.layers, function(layerData) {
		that._layers.put(layerData.name, new gdjs.Layer(layerData, that));
		//console.log("Created layer : \""+name+"\".");
	});

    //Load variables
    this._variables = new gdjs.VariablesContainer(sceneData.variables);

	//Cache the initial shared data of the automatisms
    gdjs.iterateOverArray(sceneData.automatismsSharedData, function(data) {
		//console.log("Initializing shared data for "+data.name);
		that._initialAutomatismSharedData.put(data.name, data);
	});

    //Load objects: Global objects first...
	gdjs.iterateOverArray(this.getGame().getInitialObjectsData(), function(objData){
        var objectName = objData.name;
        var objectType = objData.type;

        that._objects.put(objectName, objData);
        that._instances.put(objectName, []); //Also reserve an array for the instances
        that._instancesCache.put(objectName, []); //and for cached instances
		//And cache the constructor for the performance sake:
		that._objectsCtor.put(objectName, gdjs.getObjectConstructor(objectType));

        //console.log("Loaded "+objectName+" in memory (Global object)");
	});
	//...then the scene objects
    this._initialObjectsData = sceneData.objects;
    gdjs.iterateOverArray(this._initialObjectsData, function(objData) {
        var objectName = objData.name;
        var objectType = objData.type;

        that._objects.put(objectName, objData);
        that._instances.put(objectName, []); //Also reserve an array for the instances
        that._instancesCache.put(objectName, []); //and for cached instances
		//And cache the constructor for the performance sake:
		that._objectsCtor.put(objectName, gdjs.getObjectConstructor(objectType));

        //console.log("Loaded "+objectName+" in memory");
    });

    //Create initial instances of objects
    this.createObjectsFrom(sceneData.instances, 0, 0);

    //Set up the function to be executed at each tick
    var module = gdjs[sceneData.mangledName+"Code"];
    if ( module && module.func )
    	this._eventsFunction = module.func;
    else
    	this._eventsFunction = (function() {});

    this._eventsContext = new gdjs.EventsContext();

    //Call global callback
	for(var i = 0;i<gdjs.callbacksRuntimeSceneLoaded.length;++i) {
		gdjs.callbacksRuntimeSceneLoaded[i](this);
	}

    this._isLoaded = true;
};

gdjs.RuntimeScene.prototype.unloadScene = function() {
	if ( !this._isLoaded ) return;

    this._eventsContext = new gdjs.EventsContext();
	for(var i = 0;i < gdjs.callbacksRuntimeSceneUnloaded.length;++i) {
		gdjs.callbacksRuntimeSceneUnloaded[i](this);
	}
};

/**
 * Create objects from initial instances data ( for example, the initial instances
 * of the scene or from an external layout ).
 *
 * @method createObjectsFrom
 * @param data The instances data
 * @param xPos The offset on X axis
 * @param yPos The offset on Y axis
 */
gdjs.RuntimeScene.prototype.createObjectsFrom = function(data, xPos, yPos) {
	var that = this;
    gdjs.iterateOverArray(data, function(instanceData) {
        var objectName = instanceData.name;
		var newObject = that.createObject(objectName);

		if ( newObject !== null ) {
            newObject.setPosition(parseFloat(instanceData.x) + xPos, parseFloat(instanceData.y) + yPos);
            newObject.setZOrder(parseFloat(instanceData.zOrder));
            newObject.setAngle(parseFloat(instanceData.angle));
            newObject.setLayer(instanceData.layer);
            newObject.getVariables().initFrom(instanceData.initialVariables, true);
            newObject.extraInitializationFromInitialInstance(instanceData);
		}
    });
};

/**
 * Set the function called each time the runtimeScene is stepped.<br>
 * The function will be passed the runtimeScene as argument.
 *
 * Note that this is already set up by the runtimeScene constructor and that you should
 * not need to use this method.
 *
 * @method setEventsFunction
 * @param The function to be called.
 */
gdjs.RuntimeScene.prototype.setEventsFunction = function(func) {
	this._eventsFunction = func;
};

/**
 * Step and render the scene.<br>
 * Should be called in a game loop.
 *
 * @method renderAndStep
 * @return true if the game loop should continue, false if a scene change or a game stop was
 * requested.
 */
gdjs.RuntimeScene.prototype.renderAndStep = function() {
	this._updateTime();
	this._updateObjectsPreEvents();
	this._eventsFunction(this, this._eventsContext);
	this._updateObjects();
	this.render();

	this._firstFrame = false;

	return this._requestedScene === "" && !this._gameStopRequested;
};

/**
 * Render the PIXI container associated to the runtimeScene.
 * @method render
 */
gdjs.RuntimeScene.prototype.render = function() {
	if (!this._pixiRenderer) return;

	// render the PIXI container of the scene
	this._pixiRenderer.render(this._pixiContainer);
};

/**
 * Called when rendering to do all times related tasks.
 * @method _updateTime
 * @private
 */
gdjs.RuntimeScene.prototype._updateTime = function() {
	//Compute the elapsed time since last frame
	this._elapsedTime = Date.now() - this._latestFrameDate;
	this._latestFrameDate = Date.now();
	this._elapsedTime = Math.min(this._elapsedTime, 1000/this._runtimeGame.getMinimalFramerate());
	this._elapsedTime *= this._timeScale;

	//Update timers and others members
	var timers = this._timers.values();
	for ( var i = 0, len = timers.length;i<len;++i) {
		timers[i].updateTime(this._elapsedTime);
	}
	this._timeFromStart += this._elapsedTime;
};

/**
 * Empty the list of the removed objects:<br>
 * When an object is removed from the scene, it is still kept in the _instancesRemoved member
 * of the RuntimeScene.<br>
 * This method should be called regularly (after events or automatisms steps) so as to clear this list
 * and allows the removed objects to be cached (or destroyed if the cache is full).<br>
 * The removed objects could not be sent directly to the cache, as events may still be using them after
 * removing them from the scene for example.
 *
 * @method _cacheOrClearRemovedInstances
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
 * @method _constructListOfAllObjects
 * @private
 */
gdjs.RuntimeScene.prototype._constructListOfAllInstances= function() {
	var allObjectsLists = this._instances.values();

	var currentListSize = 0;
	for( var i = 0, len = allObjectsLists.length;i<len;++i) {
		var oldSize = currentListSize;
		currentListSize += allObjectsLists[i].length;

		if ( this._allInstancesList.length < currentListSize )
			this._allInstancesList.length = currentListSize;

		for(var j = 0, lenj = allObjectsLists[i].length;j<lenj;++j) {
			this._allInstancesList[oldSize+j] = allObjectsLists[i][j];
		}
	}

	if ( this._allInstancesList.length !== currentListSize )
		this._allInstancesList.length = currentListSize;
};

/**
 * Update the objects before launching the events.
 * @method _updateObjectsPreEvents
 * @private
 */
gdjs.RuntimeScene.prototype._updateObjectsPreEvents = function() {

	//It is *mandatory* to create and iterate on a external list of all objects, as the automatisms
	//may delete the objects.
	this._constructListOfAllInstances();
	for( var i = 0, len = this._allInstancesList.length;i<len;++i) {
		this._allInstancesList[i].stepAutomatismsPreEvents(this);
	}

	this._cacheOrClearRemovedInstances(); //Some automatisms may have request objects to be deleted.
};

/**
 * Update the objects (update positions, time management...)
 * @method _updateObjects
 * @private
 */
gdjs.RuntimeScene.prototype._updateObjects = function() {
	this._cacheOrClearRemovedInstances();

	this.updateObjectsForces();

	//It is *mandatory* to create and iterate on a external list of all objects, as the automatisms
	//may delete the objects.
	this._constructListOfAllInstances();
	for( var i = 0, len = this._allInstancesList.length;i<len;++i) {
		this._allInstancesList[i].updateTime(this._elapsedTime/1000);
		this._allInstancesList[i].stepAutomatismsPostEvents(this);
	}

	this._cacheOrClearRemovedInstances(); //Some automatisms may have request objects to be deleted.
};

/**
 * Change the background color
 * @method setBackgroundColor
 */
gdjs.RuntimeScene.prototype.setBackgroundColor = function(r,g,b) {
	if (!this._pixiRenderer) return;

	this._pixiRenderer.backgroundColor = parseInt(gdjs.rgbToHex(r,g,b),16);
};

/**
 * Get the name of the scene.
 * @method getName
 */
gdjs.RuntimeScene.prototype.getName = function() {
	return this._name;
};

/**
 * Update the objects positions according to their forces
 * @method updateObjectsForces
 */
gdjs.RuntimeScene.prototype.updateObjectsForces = function() {
	var allObjectsLists = this._instances.entries();

	for( var i = 0, len = allObjectsLists.length;i<len;++i) {
		for( var j = 0, listLen = allObjectsLists[i][1].length;j<listLen;++j) {
			var obj = allObjectsLists[i][1][j];
			if ( !obj.hasNoForces() ) {
				var averageForce = obj.getAverageForce();

				obj.setX(obj.getX() + averageForce.getX()*this._elapsedTime/1000);
				obj.setY(obj.getY() + averageForce.getY()*this._elapsedTime/1000);
				obj.updateForces(this._elapsedTime/1000);
			}
		}
	}
};

/**
 * Add an object to the instances living on the scene.
 * @method addObject
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
 * @method getObjects
 * @param name Name of the object the instances must be returned.
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
 * @param objectName {String} The name of the object to be created
 * @return The created object
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
 * @method markObjectForDeletion
 * @param object The object to be removed.
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
	for(var j = 0, lenj = obj._automatisms.length;j<lenj;++j) {
		obj._automatisms[j].ownerRemovedFromScene();
	}

	//Call global callback
	for(var j = 0;j<gdjs.callbacksObjectDeletedFromScene.length;++j) {
		gdjs.callbacksObjectDeletedFromScene[j](this, obj);
	}

	return;
};

/**
 * Return the time elapsed since the last frame, in milliseconds.
 * @method getElapsedTime
 */
gdjs.RuntimeScene.prototype.getElapsedTime = function() {
	return this._elapsedTime;
};

/**
 * Create an identifier for a new object of the scene.
 * @method createNewUniqueId
 */
gdjs.RuntimeScene.prototype.createNewUniqueId = function() {
	this._lastId++;
	return this._lastId;
};

/**
 * Get the PIXI renderer associated to the RuntimeScene.
 * @method getPIXIRenderer
 */
gdjs.RuntimeScene.prototype.getPIXIRenderer = function() {
	return this._pixiRenderer;
};

/**
 * Get the PIXI Container associated to the RuntimeScene.
 * @method getPIXIContainer
 */
gdjs.RuntimeScene.prototype.getPIXIContainer = function() {
	return this._pixiContainer;
};

/**
 * Get the runtimeGame associated to the RuntimeScene.
 * @method getGame
 */
gdjs.RuntimeScene.prototype.getGame = function() {
	return this._runtimeGame;
};

/**
 * Get the variables of the runtimeScene.
 * @method getVariables
 * @return The container holding the variables of the scene.
 */
gdjs.RuntimeScene.prototype.getVariables = function() {
	return this._variables;
};

/**
 * Get the data representing the initial shared data of the scene for the specified automatism.
 * @method getInitialSharedDataForAutomatism
 * @param name {String} The name of the automatism
 */
gdjs.RuntimeScene.prototype.getInitialSharedDataForAutomatism = function(name) {
	if ( this._initialAutomatismSharedData.containsKey(name) ) {
		return this._initialAutomatismSharedData.get(name);
	}

	return null;
};

gdjs.RuntimeScene.prototype.getLayer = function(name) {
	if ( this._layers.containsKey(name) )
		return this._layers.get(name);

	return this._layers.get("");
};

gdjs.RuntimeScene.prototype.hasLayer = function(name) {
	return this._layers.containsKey(name);
};

gdjs.RuntimeScene.prototype.addTimer = function(name) {
	this._timers.put(name, new gdjs.Timer(name));
};

gdjs.RuntimeScene.prototype.hasTimer = function(name) {
	return this._timers.containsKey(name);
};

gdjs.RuntimeScene.prototype.getTimer = function(name) {
	return this._timers.get(name);
};

gdjs.RuntimeScene.prototype.removeTimer = function(name) {
	if ( this._timers.containsKey(name) ) this._timers.remove(name);
};

gdjs.RuntimeScene.prototype.getTimeFromStart = function() {
	return this._timeFromStart;
};

/**
 * Get the soundManager of the scene.
 * @return The soundManager of the scene.
 */
gdjs.RuntimeScene.prototype.getSoundManager = function() {
	return this._soundManager;
};

/**
 * Return true if the scene is rendering its first frame.
 * @method isFirstFrame
 */
gdjs.RuntimeScene.prototype.isFirstFrame = function() {
	return this._firstFrame;
};

/**
 * Set the time scale of the scene
 * @method setTimeScale
 * @param timeScale {Number} The new time scale (must be positive).
 */
gdjs.RuntimeScene.prototype.setTimeScale = function(timeScale) {
	if ( timeScale >= 0 ) this._timeScale = timeScale;
};

/**
 * Get the time scale of the scene
 * @method getTimeScale
 */
gdjs.RuntimeScene.prototype.getTimeScale = function() {
	return this._timeScale;
};

/**
 * Return true if the scene requested the game to be stopped.
 * @method gameStopRequested
 */
gdjs.RuntimeScene.prototype.gameStopRequested = function() {
	return this._gameStopRequested;
};

/**
 * When called, the scene will be flagged as requesting the game to be stopped.<br>
 * ( i.e: gameStopRequested will return true ).
 *
 * @method requestGameStop
 */
gdjs.RuntimeScene.prototype.requestGameStop = function() {
	this._gameStopRequested = true;
};

/**
 * Return the name of the new scene to be launched instead of this one.
 * @method getRequestedScene
 */
gdjs.RuntimeScene.prototype.getRequestedScene = function() {
	return this._requestedScene;
};

/**
 * When called, the scene will be flagged as requesting a new scene to be launched.
 *
 * @method requestSceneChange
 */
gdjs.RuntimeScene.prototype.requestSceneChange = function(sceneName) {
	this._requestedScene = sceneName;
};
