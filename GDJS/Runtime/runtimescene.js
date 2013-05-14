
/**
 * The runtimeScene object represents a scene being played and rendered in the browser in a canvas.
 * 
 * TODO : Variables loading
 *
 * @class runtimeScene 
 * @param PixiRenderer The PIXI.Renderer to be used
 */
gdjs.runtimeScene = function(runtimeGame, pixiRenderer)
{
    var that = {};
    var my = {};
    
    my.eventsFunction = null;
    my.pixiRenderer = pixiRenderer;
    my.instances = new Hashtable();
    my.objects = new Hashtable();
    my.layers = new Hashtable();
    my.pixiStage = new PIXI.Stage();
    my.latestFrameDate = new Date;
    my.variables = gdjs.variablesContainer();
    my.runtimeGame = runtimeGame;
    my.lastId = 0;
    my.initialObjectsXml; 
    my.elapsedTime = 0;
    
    /**
     * Load the runtime scene from the given scene.
     * \param sceneXml A jquery object containing the scene in XML format.
     */
    that.loadFromScene = function(sceneXml) {
        document.title = $(sceneXml).attr("titre");
        
        var bgColor = gdjs.rgbToHex(parseInt($(sceneXml).attr("r")), 
                                    parseInt($(sceneXml).attr("v")),
                                    parseInt($(sceneXml).attr("b")));
        my.pixiStage.setBackgroundColor("0x"+bgColor);
        my.pixiStage.position = new PIXI.Point(150,300);
        
        //Load layers
        $(sceneXml).find("Layers").find("Layer").each( function() { 
            var name = $(this).attr("Name");
            
            my.layers.put(name, gdjs.layer(name, my.pixiStage));
            console.log("Created layer : \""+name+"\".");
        });
        
        
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
        var now = new Date;
        my.elapsedTime = now - my.latestFrameDate;
        my.latestFrameDate = now;
    }
    
    /**
     * Update the objects (update positions, time management...)
     */
    my.updateObjects = function() {
        that.updateObjectsForces();
    }
    
    /**
     * Update the objects positions according to their forces
     */
    that.updateObjectsForces = function() {
        var allObjectsLists = my.instances.entries();
        
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
    
    return that;
}

/**
 * Allows events to create a new object on a scene.
 */
gdjs.createObjectOnScene = function(runtimeScene, objectsLists, x, y, layer) {
    
    //The objectsLists
    var objectName = objectsLists.keys()[0];
    
    var obj = null;
    $(runtimeScene.getGame().getInitialObjectsXml()).find("Objet").each( function() { 
        if ( $(this).attr("nom") === objectName ) {
            obj = gdjs.spriteRuntimeObject(runtimeScene, $(this));
            return false;
        }
    });
    $(runtimeScene.getInitialObjectsXml()).find("Objet").each( function() { 
        if ( $(this).attr("nom") === objectName ) {
            obj = gdjs.spriteRuntimeObject(runtimeScene, $(this));
            return false;
        }
    });
    
    if ( obj != null ) {
        obj.setPosition(x,y);
        obj.setLayer(layer);
        runtimeScene.addObject(obj);
        
        //Let the new object be picked by next actions/conditions.
        if ( objectsLists.containsKey(objectName) ) {
            objectsLists.get(objectName).push(obj);
        }
    }   
}

gdjs.pickedObjectsCount = function(objectName, objectsLists) {
    if ( objectsLists.containsKey(objectName) ) {
        return objectsLists.get(objectName).length;
    }
}