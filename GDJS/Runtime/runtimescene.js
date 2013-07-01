/*
 * Game Develop JS Platform
 * Copyright 2013 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */

/**
 * The runtimeScene object represents a scene being played and rendered in the browser in a canvas.
 *
 * TODO : position souris calques
 *
 * @class runtimeScene 
 * @param PixiRenderer The PIXI.Renderer to be used
 */
gdjs.runtimeScene = function(runtimeGame, pixiRenderer)
{
    var that = {};
    var my = {};
    
    my.eventsFunction = null;
    my.instances = new Hashtable();
    my.objects = new Hashtable();
    my.layers = new Hashtable();
    my.timers = new Hashtable();
    my.pixiRenderer = pixiRenderer;
    my.pixiStage = new PIXI.Stage();
    my.latestFrameDate = new Date;
    my.variables = gdjs.variablesContainer();
    my.runtimeGame = runtimeGame;
    my.lastId = 0;
    my.initialObjectsXml; 
    my.elapsedTime = 0;
    my.timeScale = 1;
    my.timeFromStart = 0;
    my.firstFrame = true;
    my.soundManager = gdjs.soundManager();
    my.gameStopRequested = false;
    my.requestedScene = "";
    my.collisionGrid = new HSHG();
    my.isLoaded = false; // True if loadFromScene was called and the scene is being played.
    that.layers = my.layers;
    my.postPoneObjectsDeletion = false; //If set to true, objects will only be removed when doObjectsDeletion will be called ( And not at markObjectForDeletion call ).
    my.objectsToDestroy = []; //The objects to be destroyed when doObjectsDeletion is called.
    
    /**
     * Load the runtime scene from the given scene.
     * @method loadFromScene
     * @param sceneXml A jquery object containing the scene in XML format.
     */
    that.loadFromScene = function(sceneXml) {
        if ( sceneXml == undefined ) {
            console.error("loadFromScene was called without a scene");
            return;
        }
        
        if ( my.isLoaded ) that.unloadScene();
    
        //Setup main properties
        document.title = $(sceneXml).attr("titre");
        my.firstFrame = true;
        that.setBackgroundColor(parseInt($(sceneXml).attr("r")), 
                                parseInt($(sceneXml).attr("v")),
                                parseInt($(sceneXml).attr("b")));
        
        //Load layers
        $(sceneXml).find("Layers").find("Layer").each( function() { 
            var name = $(this).attr("Name");
            
            my.layers.put(name, gdjs.layer(name, that));
            console.log("Created layer : \""+name+"\".");
        });
        
        //Load variables
        my.variables = gdjs.variablesContainer($(sceneXml).find("Variables"));
        
        //Load objects
        my.initialObjectsXml = $(sceneXml).find("Objets");
        $(sceneXml).find("Objets").find("Objet").each( function() { 
            var objectName = $(this).attr("nom");
            
            my.objects.put(objectName, $(this));
            my.instances.put(objectName, []); //Also reserve an array for the instances
            console.log("Loaded "+objectName+" in memory");
        });
        
        //Create initial instances of objects
        $(sceneXml).find("Positions").find("Objet").each( function() { 
            
            var objectName = $(this).attr("nom");
            
            if ( my.objects.get(objectName) === null ) {
                console.log("Unable to create an instance for object"+objectName+"!");
            }
            else {
            
                var associatedObject = my.objects.get(objectName);
                var objectType = $(associatedObject).attr("type");
                
                newObject = gdjs.getObjectConstructor(objectType)(that, associatedObject);
                newObject.setPosition(parseFloat($(this).attr("x")), parseFloat($(this).attr("y")));
                newObject.setZOrder(parseFloat($(this).attr("plan")));
                newObject.setAngle(parseFloat($(this).attr("angle")));
                newObject.setLayer($(this).attr("layer"));
                newObject.getVariables().initFrom($(this).find("InitialVariables"));
                newObject.extraInitializationFromInitialInstance($(this));
                
                that.addObject(newObject);
            }
        });
        
        //Set up the function to be executed at each tick
        var module = gdjs[$(sceneXml).attr("mangledName")+"Code"];
        if ( module && module.func ) my.eventsFunction = module.func;
        
        isLoaded = true;
    }
    
    that.unloadScene = function() {
        if ( !my.isLoaded ) return;
        
    }
    
    /**
     * Update the list of the potentially colliding objects.
     * @method updatePotentialCollidingObjects
     */
    that.updatePotentialCollidingObjects = function () {
        my.collisionGrid.update();
    }
    
    /**
     * Get an array of potentially colliding objects having the specified name identifiers.<br>
     * You need to call updatePotentialCollidingObjects method before calling this.
     *
     * @method getPotentialCollidingObjects
     * @param obj1NameId {Number} The number representing the first objects.
     * @param obj2NameId {Number} The number representing the second objects.
     */
    that.getPotentialCollidingObjects = function(obj1NameId, obj2NameId) {
        
        var pairs = my.collisionGrid.queryForCollisionPairs(obj1NameId, obj2NameId,
                                                            gdjs.runtimeObject.collisionTest);
        return pairs;
    }
    
    
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
    that.setEventsFunction = function(func) {
        my.eventsFunction = func;
    }
    
    /**
     * Step and render the scene.<br>
     * Should be called in a game loop.
     *
     * @method renderAndStep
     * @return true if the game loop should continue, false if a scene change or a game stop was
     * requested.
     */
    that.renderAndStep = function() {
        my.updateTime();
        my.updateObjectsPreEvents();
        my.eventsFunction(that);
        my.updateObjects();
        that.render();
        
        my.firstFrame = false;
        
        return my.requestedScene == "" && !my.gameStopRequested;
    }
    
    /** 
     * Render the PIXI stage associated to the runtimeScene.
     * @method render
     */
    that.render = function(){    
        // render the PIXI stage   
        my.pixiRenderer.render(my.pixiStage);
    }
    
    /**
     * Called when rendering to do all times related tasks.
     * @method updateTime
     * @private
     */
    my.updateTime = function() {
        //Compute the elapsed time since last frame
        var now = new Date;
        my.elapsedTime = now - my.latestFrameDate;
        my.latestFrameDate = now;
        my.elapsedTime = Math.min(my.elapsedTime, 1000/my.runtimeGame.getMinimalFramerate());
        my.elapsedTime *= my.timeScale;
        
        //Update timers and others members
        var timers = my.timers.values();
        for ( var i = 0, len = timers.length;i<len;++i) {
            timers[i].updateTime(my.elapsedTime);
        }
        my.timeFromStart += my.elapsedTime;
    }
    
    my.doObjectsDeletion = function() {
        for(var k =0, lenk=my.objectsToDestroy.length;k<lenk;++k)
            my.removeObject(my.objectsToDestroy[k]);
            
        my.objectsToDestroy.length = 0;
    }
    
    /**
     * Update the objects before launching the events.
     * @method updateObjectsPreEvents
     * @private
     */
    my.updateObjectsPreEvents = function() {
        var allObjectsLists = my.instances.entries();
        
        my.postPoneObjectsDeletion = true;
        for( var i = 0, len = allObjectsLists.length;i<len;++i) {
            for( var j = 0, listLen = allObjectsLists[i][1].length;j<listLen;++j) {
                allObjectsLists[i][1][j].stepAutomatismsPreEvents(that);
            }
        }
        my.postPoneObjectsDeletion = false;
        my.doObjectsDeletion();
    }
    
    /**
     * Update the objects (update positions, time management...)
     * @method updateObjects
     * @private
     */
    my.updateObjects = function() {
        var allObjectsLists = my.instances.entries();
        
        that.updateObjectsForces(allObjectsLists);
        
        my.postPoneObjectsDeletion = true;
        for( var i = 0, len = allObjectsLists.length;i<len;++i) {
            for( var j = 0, listLen = allObjectsLists[i][1].length;j<listLen;++j) {
                var obj = allObjectsLists[i][1][j];
                obj.updateTime(my.elapsedTime/1000);
                obj.stepAutomatismsPostEvents(that);
            }
        }
        my.postPoneObjectsDeletion = false;
        my.doObjectsDeletion();
    }
    
    /**
     * Change the background color
     * @method setBackgroundColor
     */
    that.setBackgroundColor = function(r,g,b) {
        my.pixiStage.setBackgroundColor(parseInt(gdjs.rgbToHex(r,g,b),16));
    }
    
    /**
     * Update the objects positions according to their forces
     * @method updateObjectsForces
     */
    that.updateObjectsForces = function(objects) {
        var allObjectsLists = objects ? objects : my.instances.entries();
        
        for( var i = 0, len = allObjectsLists.length;i<len;++i) {
            for( var j = 0, listLen = allObjectsLists[i][1].length;j<listLen;++j) {
                var obj = allObjectsLists[i][1][j];
                if ( !obj.hasNoForces() ) {
                    var averageForce = obj.getAverageForce();
                
                    obj.setX(obj.getX() + averageForce.getX()*my.elapsedTime/1000);
                    obj.setY(obj.getY() + averageForce.getY()*my.elapsedTime/1000);
                    obj.updateForces();
                }
            }
        }
    }
    
    /**
     * Add an object to the instances living on the scene.
     * @method addObject
     * @param obj The object to be added.
     */
    that.addObject = function(obj) {
        if ( !my.instances.containsKey(obj.name) ) {
            console.log("RuntimeScene.addObject: No objects called \""+obj.name+"\"! Adding it.");
            my.instances.put(obj.name, []);
        }
    
        my.instances.get(obj.name).push(obj);
        my.collisionGrid.addObject(obj);
    }
    
    /**
     * Get all the instances of the object called name.
     * @method getObjects
     * @param name Name of the object the instances must be returned.
     */
    that.getObjects = function(name){
        if ( !my.instances.containsKey(name) ) {
            console.log("RuntimeScene.getObjects: No instances called \""+name+"\"! Adding it.");
            my.instances.put(name, []);
        }
    
        return my.instances.get(name);
    }
    
    /**
     * Remove an object from the scene, deleting it from the list of instances.<br>
     * Most of the time, do not call this method directly: Use markObjectForDeletion method
     * which will remove the objects either directly or when it can be done safely.
     *
     * @method getObjects
     * @param obj The object to be removed from the scene.
     * @private
     */
    my.removeObject = function(obj) {
        my.collisionGrid.removeObject(obj);
        
        if ( !my.instances.containsKey(obj.getName()) ) return;
        
        var objId = obj.id;
        var allInstances = my.instances.get(obj.getName());
        for(var i = 0, len = allInstances.length;i<len;++i) {
            if (allInstances[i].id == objId) {
                allInstances.remove(i);
                return;
            }
        }
    }
    
    /**
     * Must be called whenever an object must be removed from the scene.
     * @method markObjectForDeletion
     * @param object The object to be removed.
     */
    that.markObjectForDeletion = function(obj) {
        if ( my.postPoneObjectsDeletion ) {
            if ( my.objectsToDestroy.indexOf(obj) === -1 ) my.objectsToDestroy.push(obj);
            return;
        }
    
        my.removeObject(obj);
    }
    
    /**
     * Return the time elapsed since the last frame, in milliseconds.
     * @method getElapsedTime
     */
    that.getElapsedTime = function() {
        return my.elapsedTime;
    }
    
    /**
     * Create an identifier for a new object.
     * @method createNewUniqueId
     */
    that.createNewUniqueId = function() {
        my.lastId++;
        return my.lastId;
    }
    
    /**
     * Get the PIXI.Stage associated to the RuntimeScene.
     * @method getPIXIStage
     */
    that.getPIXIStage = function() {
        return my.pixiStage;
    }
    
    /**
     * Get the PIXI renderer associated to the RuntimeScene.
     * @method getPIXIRenderer
     */
    that.getPIXIRenderer = function() {
        return my.pixiRenderer;
    }
    
    /**
     * Get the runtimeGame associated to the RuntimeScene.
     * @method getGame
     */
    that.getGame = function() {
        return my.runtimeGame;
    }
    
    /**
     * Get the variables of the runtimeScene.
     * @method getVariables
     * @return The container holding the variables of the scene.
     */
    that.getVariables = function() {
        return my.variables;
    }
    
    /**
     * Get the XML structure representing all the initial objects of the scene.
     * @method getInitialObjectsXml
     */
    that.getInitialObjectsXml = function() {
        return my.initialObjectsXml;
    }
    
    that.getLayer = function(name) {
        if ( my.layers.containsKey(name) )
            return my.layers.get(name);
        
        return my.layers.get("");
    }
    
    that.hasLayer = function(name) {
        return my.layers.containsKey(name);
    }
    
    that.addTimer = function(name) {
        my.timers.put(name, gdjs.timer(name));
    }
    
    that.hasTimer = function(name) {
        return my.timers.containsKey(name);
    }
    
    that.getTimer = function(name) {
        return my.timers.get(name);
    }
    
    that.removeTimer = function(name) {
        if ( my.timers.containsKey(name) ) my.timers.remove(name);
    }
    
    that.getTimeFromStart = function() {
        return my.timeFromStart;
    }
    
    /**
     * Get the soundManager of the scene.
     * @return The soundManager of the scene.
     */
    that.getSoundManager = function() {
        return my.soundManager;
    }
    
    /**
     * Return true if the scene is rendering its first frame.
     * @method isFirstFrame
     */
    that.isFirstFrame = function() {
        return my.firstFrame;
    }
    
    /**
     * Set the time scale of the scene
     * @method setTimeScale
     * @param timeScale {Number} The new time scale ( Must be positive ).
     */
    that.setTimeScale = function(timeScale) {
        if ( timeScale >= 0 ) my.timeScale = timeScale;
    }
    
    /**
     * Get the time scale of the scene
     * @method getTimeScale
     */
    that.getTimeScale = function() {
        return my.timeScale;
    }
    
    /**
     * Return true if the scene requested the game to be stopped.
     * @method gameStopRequested
     */
    that.gameStopRequested = function() { 
        return my.gameStopRequested;
    }
    
    /**
     * When called, the scene will be flagged as requesting the game to be stopped.<br>
     * ( i.e: gameStopRequested will return true ).
     *
     * @method requestGameStop
     */
    that.requestGameStop = function() {
        my.gameStopRequested = true;
    }
    
    /**
     * Return the name of the new scene to be launched instead of this one.
     * @method getRequestedScene
     */
    that.getRequestedScene = function() { 
        return my.requestedScene;
    }
    
    /**
     * When called, the scene will be flagged as requesting a new scene to be launched.
     *
     * @method requestSceneChange
     */
    that.requestSceneChange = function(sceneName) {
        my.requestedScene = sceneName;
    }
    
    return that;
}