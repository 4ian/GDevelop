
/**
 * The runtimeScene object represents a scene being played and rendered in the browser in a canvas.
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
    
    /**
     * Load the runtime scene from the given scene.
     * \param sceneXml A jquery object containing the scene in XML format.
     */
    that.loadFromScene = function(sceneXml) {
    
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
                
                newObject = gdjs.spriteRuntimeObject(that, associatedObject);
                newObject.setPosition(parseFloat($(this).attr("x")), parseFloat($(this).attr("y")));
                newObject.setZOrder(parseFloat($(this).attr("plan")));
                newObject.setAngle(parseFloat($(this).attr("angle")));
                newObject.setLayer($(this).attr("layer"));
                
                that.addObject(newObject);
            }
        });
        
    }
    
    /**
     * Set the function called each time the runtimeScene is stepped.
     * The function will be passed the runtimeScene as argument.
     */
    that.setEventsFunction = function(func) {
        my.eventsFunction = func;
    }
    
    /**
     * Step and render the scene.
     * Should be called in a game loop.
     */
    that.renderAndStep = function() {
        my.updateTime();
        that.render();
        my.eventsFunction(that);
        my.updateObjects();
        
        my.firstFrame = false;
    }
    
    /** 
     * Render the PIXI stage associated to the runtimeScene.
     */
    that.render = function(){
        //TODO: Sort objects by Z order.
    
        // render the PIXI stage   
        my.pixiStage.position = PIXI.Point(150,300);
        my.pixiRenderer.render(my.pixiStage);
    }
    
    /**
     * Called when rendering to do all times related management.
     * @todo
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
    
    /**
     * Update the objects (update positions, time management...)
     */
    my.updateObjects = function() {
        var allObjectsLists = my.instances.entries();
        
        that.updateObjectsForces(allObjectsLists);
        
        for( var i = 0, len = allObjectsLists.length;i<len;++i) {
            for( var j = 0, listLen = allObjectsLists[i][1].length;j<listLen;++j) {
                var obj = allObjectsLists[i][1][j];
                obj.updateTime(my.elapsedTime/1000);
            }
        }
    }
    
    /**
     * Change the background color
     * @method setBackgroundColor
     */
    that.setBackgroundColor = function(r,g,b) {
        my.pixiStage.setBackgroundColor("0x"+gdjs.rgbToHex(r,g,b));
    }
    
    /**
     * Update the objects positions according to their forces
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
     * \param obj The object to be added.
     */
    that.addObject = function(obj) {
        if ( !my.instances.containsKey(obj.name) ) {
            console.log("RuntimeScene.addObject: No objects called \""+obj.name+"\"! Adding it.");
            my.instances.put(obj.name, []);
        }
    
        my.instances.get(obj.name).push(obj);
    }
    
    /**
     * Get all the instances of the object called name.
     * \param name Name of the object the instances must be returned.
     */
    that.getObjects = function(name){
        if ( !my.instances.containsKey(name) ) {
            console.log("RuntimeScene.getObjects: No instances called \""+name+"\"! Adding it.");
            my.instances.put(name, []);
        }
    
        return my.instances.get(name);
    }
    
    that.markObjectForDeletion = function(obj) {
        if ( my.instances.containsKey(obj.getName()) ) {
            
            var objId = obj.getUniqueId();
            var allInstances = my.instances.get(obj.getName());
            for(var i = 0, len = allInstances.length;i<len;++i) {
                if (allInstances[i].getUniqueId() == objId) {
                    allInstances.remove(i);
                    return;
                }
            }
        }
    }
    
    /**
     * Return the time elapsed since the last frame, in milliseconds.
     * @method getElapsedTime
     */
    that.getElapsedTime = function() {
        return my.elapsedTime;
    }
    
    /**
     * Create an identifier for a new object
     */
    that.createNewUniqueId = function() {
        my.lastId++;
        return my.lastId;
    }
    
    /**
     * Get the PIXI.Stage associated to the RuntimeScene.
     */
    that.getPIXIStage = function() {
        return my.pixiStage;
    }
    
    /**
     * Get the PIXI renderer associated to the RuntimeScene.
     */
    that.getPIXIRenderer = function() {
        return my.pixiRenderer;
    }
    
    /**
     * Get the runtimeGame associated to the RuntimeScene.
     */
    that.getGame = function() {
        return my.runtimeGame;
    }
    
    /**
     * Get the variables of the runtimeScene.
     */
    that.getVariables = function() {
        return my.variables;
    }
    
    /**
     * Get the XML structure representing all the initial objects of the scene.
     */
    that.getInitialObjectsXml = function() {
        return my.initialObjectsXml;
    }
    
    that.getLayer = function(name) {
        return my.layers.get(name);
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
     - @return The soundManager of the scene.
     */
    that.getSoundManager = function() {
        return my.soundManager;
    }
    
    /**
     * Return true if the scene is rendering its first frame.
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
     */
    that.getTimeScale = function() {
        return my.timeScale;
    }
    
    return that;
}